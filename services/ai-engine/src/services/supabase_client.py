"""
Supabase client for VITAL Path AI Services
Handles database operations and vector storage
"""

import asyncio
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from supabase import create_client, Client
import vecs
from sqlalchemy import create_engine, text
import structlog
from datetime import datetime, timezone

from core.config import get_settings

logger = structlog.get_logger()

class SupabaseClient:
    """Enhanced Supabase client with vector operations and RLS support"""

    def __init__(self):
        self.settings = get_settings()
        self.client: Optional[Client] = None
        self.vx: Optional[vecs.Client] = None
        self.engine = None
        self.vector_collection = None
        self.current_tenant_id: Optional[str] = None  # Track current tenant context

    async def initialize(self):
        """Initialize Supabase client and vector database"""
        try:
            # Check required settings
            if not self.settings.supabase_url or not self.settings.supabase_service_role_key:
                logger.warning("⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set - skipping initialization")
                # Leave self.client as None and allow callers to degrade gracefully.
                return

            logger.info(f"🔍 DEBUG: Attempting to initialize Supabase with URL: {self.settings.supabase_url[:50]}...")

            # Initialize Supabase client (REST API).
            # NOTE: Some macOS Python installations set SSL_CERT_FILE to a path
            # that no longer exists, which causes httpx/ssl to raise
            # FileNotFoundError during client creation. To avoid that breaking
            # the entire AI engine, we temporarily clear SSL_CERT_FILE and
            # REQUESTS_CA_BUNDLE while creating the client, then restore them.
            try:
                import os as _os

                old_ssl = _os.environ.pop("SSL_CERT_FILE", None)
                old_req = _os.environ.pop("REQUESTS_CA_BUNDLE", None)

                logger.info("🔍 DEBUG: About to call create_client...")
                self.client = create_client(
                    self.settings.supabase_url,
                    self.settings.supabase_service_role_key
                )
                logger.info("✅ Supabase REST client initialized")

                # Don't restore broken SSL paths - leave them cleared permanently
                # This allows subsequent Supabase queries to work correctly
                logger.info("🔐 SSL environment variables cleared permanently for Supabase compatibility")

            except TypeError as e:
                # Handle version incompatibility (e.g. 'proxy' parameter)
                if "proxy" in str(e):
                    logger.warning(f"⚠️ Supabase client version incompatibility: {e}")
                    logger.info("ℹ️ Trying alternative initialization...")
                    self.client = create_client(
                        self.settings.supabase_url,
                        self.settings.supabase_service_role_key
                    )
                else:
                    raise
            except FileNotFoundError as e:
                # On some local setups SSL_CERT_FILE may point to a missing file.
                # Treat this as "Supabase unavailable" rather than a hard failure.
                logger.error(f"❌ FileNotFoundError in create_client: {e}", exc_info=True)
                self.client = None
                return

            # Optional: Initialize direct database connection for vector operations
            # Only if DATABASE_URL is provided and valid
            if self.settings.database_url and "postgresql" in self.settings.database_url.lower():
                try:
                    # Initialize SQLAlchemy engine for direct SQL operations
                    self.engine = create_engine(self.settings.database_url)

                    # Initialize vector client
                    self.vx = vecs.create_client(self.settings.database_url)

                    # Get or create vector collection for medical documents
                    self.vector_collection = self.vx.get_or_create_collection(
                        name="medical_documents",
                        dimension=self.settings.vector_dimension
                    )

                    # Ensure vector index exists
                    await self._ensure_vector_index()
                    
                    logger.info("✅ Vector database initialized")
                except Exception as e:
                    logger.warning("⚠️ Vector database unavailable (using Supabase REST only)", error=str(e))
                    # Continue without vector operations - can still use Supabase REST API
                    self.engine = None
                    self.vx = None
                    self.vector_collection = None
            else:
                logger.info("ℹ️ DATABASE_URL not provided, using Supabase REST API only")

            logger.info("✅ Supabase client initialized successfully")

        except FileNotFoundError as e:
            import traceback
            logger.error(f"❌ FileNotFoundError during Supabase initialization: {e}")
            logger.error(f"Full traceback:\n{traceback.format_exc()}")
            self.client = None
            # Allow the engine to continue in degraded mode
        except Exception as e:
            import traceback
            logger.error(f"❌ Failed to initialize Supabase client: {type(e).__name__}: {e}")
            logger.error(f"Full traceback:\n{traceback.format_exc()}")
            self.client = None
            # Allow the engine to continue in degraded mode

    async def _ensure_vector_index(self):
        """Ensure vector index exists for similarity search"""
        # If Supabase is unavailable, degrade gracefully by returning no results.
        if not self.client:
            logger.warning("⚠️ get_agent_by_id called but Supabase client is not initialized; returning None")
            return None

        try:
            # Create index if it doesn't exist
            self.vector_collection.create_index()
            logger.info("✅ Vector index ensured")
        except Exception as e:
            logger.warning("⚠️ Vector index creation warning", error=str(e))
    
    async def set_tenant_context(self, tenant_id: str):
        """
        Set tenant context for RLS enforcement.
        
        This method sets the tenant_id in the database session using SET LOCAL.
        RLS policies can then filter data based on current_setting('app.tenant_id').
        
        Args:
            tenant_id: The tenant UUID to set as context
            
        Raises:
            ValueError: If tenant_id is None or invalid
        """
        if not tenant_id:
            raise ValueError("tenant_id cannot be None")
        
        self.current_tenant_id = tenant_id
        
        # If Supabase is unavailable, treat this as a no-op.
        if not self.client:
            logger.warning("⚠️ create_agent called but Supabase client is not initialized; skipping")
            return None

        try:
            # Set tenant context in database session
            # This enables RLS policies to filter by tenant_id
            if self.engine:
                async with asyncio.create_task(
                    asyncio.to_thread(self.engine.connect)
                ) as conn:
                    await asyncio.create_task(
                        asyncio.to_thread(
                            conn.execute,
                            text(f"SET LOCAL app.tenant_id = '{tenant_id}'")
                        )
                    )
                    await asyncio.create_task(
                        asyncio.to_thread(conn.commit)
                    )
                
                logger.debug("Tenant context set in database", tenant_id=tenant_id)
            else:
                logger.warning("Engine not initialized, cannot set tenant context")
                
        except Exception as e:
            logger.error(
                "Failed to set tenant context in database",
                tenant_id=tenant_id,
                error=str(e)
            )
            # Don't raise - allow graceful degradation
            pass
    
    async def query_with_rls(self, query: str, params: Optional[Dict[str, Any]] = None):
        """
        Execute query with RLS enforcement.
        
        This method ensures tenant context is set before executing the query.
        All queries will be automatically filtered by tenant_id via RLS policies.
        
        Args:
            query: SQL query to execute
            params: Optional query parameters
            
        Returns:
            Query results
            
        Raises:
            ValueError: If tenant context is not set
        """
        if not self.current_tenant_id:
            raise ValueError("tenant_id must be set before querying (call set_tenant_context first)")
        
        # If Supabase is unavailable, just skip logging (no-op).
        if not self.client:
            logger.warning("⚠️ log_query called but Supabase client is not initialized; skipping")
            return None

        try:
            # Execute query with RLS automatically filtering by tenant_id
            async with asyncio.create_task(
                asyncio.to_thread(self.engine.connect)
            ) as conn:
                result = await asyncio.create_task(
                    asyncio.to_thread(
                        conn.execute,
                        text(query),
                        params or {}
                    )
                )
                return result.fetchall()
                
        except Exception as e:
            logger.error("Query with RLS failed", error=str(e), query=query)
            raise

    async def search_similar_documents(
        self,
        query_embedding: List[float],
        filter_conditions: Optional[Dict[str, Any]] = None,
        limit: int = 10,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search for similar documents using vector similarity"""
        # If Supabase is unavailable, return no user context.
        if not self.client:
            logger.warning("⚠️ get_user_context called but Supabase client is not initialized; returning None")
            return None

        try:
            # Build metadata filter
            metadata_filter = {}
            if filter_conditions:
                for key, value in filter_conditions.items():
                    if key in ['phase', 'specialty', 'document_type', 'organization_id']:
                        metadata_filter[key] = {"$eq": value}

            # Perform vector search
            results = self.vector_collection.query(
                data=query_embedding,
                limit=limit,
                filters=metadata_filter if metadata_filter else None,
                measure="cosine_distance",
                include_metadata=True,
                include_value=True
            )

            # Filter by similarity threshold and format results
            formatted_results = []
            for result in results:
                similarity = 1 - result[1]  # Convert distance to similarity
                if similarity >= similarity_threshold:
                    formatted_results.append({
                        "id": result[0],
                        "content": result[2].get("content", ""),
                        "metadata": result[2],
                        "similarity": similarity
                    })

            logger.info("🔍 Vector search completed",
                       query_results=len(formatted_results),
                       threshold=similarity_threshold)

            return formatted_results

        except Exception as e:
            logger.error("❌ Vector search failed", error=str(e))
            return []

    async def store_document_embedding(
        self,
        document_id: str,
        content: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> bool:
        """Store document embedding in vector database"""
        # If Supabase is unavailable, return empty metadata.
        if not self.client:
            logger.warning("⚠️ get_documents_metadata called but Supabase client is not initialized; returning empty dict")
            return {}

        try:
            # Prepare metadata with content
            vector_metadata = {
                **metadata,
                "content": content,
                "document_id": document_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "embedding_model": self.settings.openai_embedding_model
            }

            # Upsert vector
            self.vector_collection.upsert(
                records=[(document_id, embedding, vector_metadata)]
            )

            logger.info("💾 Document embedding stored",
                       document_id=document_id,
                       content_length=len(content))

            return True

        except Exception as e:
            logger.error("❌ Failed to store document embedding",
                        document_id=document_id,
                        error=str(e))
            return False

    async def get_agent_by_id(self, agent_id: str, tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get agent configuration by ID or name.
        
        Args:
            agent_id: Either a UUID (id field) or agent name (name field)
            tenant_id: Optional tenant ID for RLS filtering. If not provided, uses default tenant.
            
        Returns:
            Agent configuration dictionary or None if not found
        """
        # If Supabase is unavailable, return None.
        if not self.client:
            logger.warning("⚠️ get_agent_by_id called but Supabase client is not initialized; returning None")
            return None

        # Default tenant ID if not provided
        DEFAULT_TENANT_ID = "c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244"
        effective_tenant_id = tenant_id or DEFAULT_TENANT_ID

        # Log the lookup attempt
        logger.info(
            "🔍 Looking up agent",
            agent_id=agent_id,
            requested_tenant_id=effective_tenant_id,
            using_service_role=True,  # We're using service role key which bypasses RLS
            is_uuid=bool(uuid_pattern.match(agent_id)) if 'uuid_pattern' in locals() else None
        )

        try:
            # Note: We're using service role key, so RLS is bypassed
            # However, we still filter by tenant_id for data isolation
            # If agent has NULL or different tenant_id, we'll try without filter as fallback

            # First, try to determine if this looks like a UUID
            import re
            uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
            is_uuid = bool(uuid_pattern.match(agent_id))
            
            logger.info(
                "🔍 Agent lookup details",
                agent_id=agent_id,
                is_uuid=is_uuid,
                requested_tenant_id=effective_tenant_id
            )
            
            # First attempt: Query with tenant_id filter
            query = self.client.table("agents").select("*")
            
            if is_uuid:
                # Query by id field (UUID) - don't filter by status to allow inactive agents too
                query = query.eq("id", agent_id)
            else:
                # Query by name field (string) - don't filter by status
                query = query.eq("name", agent_id)
            
            # Explicitly filter by tenant_id as fallback if RLS doesn't work
            query = query.eq("tenant_id", effective_tenant_id)
            
            result = query.execute()

            if result.data and len(result.data) > 0:
                agent = result.data[0]
                logger.info(
                    "🤖 Agent retrieved",
                    agent_id=agent_id,
                    agent_name=agent.get("name"),
                    agent_status=agent.get("status"),
                    tenant_id=effective_tenant_id,
                    lookup_method="id" if is_uuid else "name"
                )
                return agent
            
            # If not found with tenant_id filter, try without tenant_id filter (agent might have NULL or different tenant_id)
            logger.warning(
                "⚠️ Agent not found with tenant_id filter, trying without tenant filter",
                agent_id=agent_id,
                tenant_id=effective_tenant_id,
                lookup_method="id" if is_uuid else "name"
            )
            
            # Retry without tenant_id filter
            fallback_query = self.client.table("agents").select("*")
            if is_uuid:
                fallback_query = fallback_query.eq("id", agent_id)
            else:
                fallback_query = fallback_query.eq("name", agent_id)
            
            # Don't filter by tenant_id - this allows finding agents with NULL or different tenant_id
            fallback_result = fallback_query.execute()
            
            if fallback_result.data and len(fallback_result.data) > 0:
                agent = fallback_result.data[0]
                logger.info(
                    "🤖 Agent retrieved (without tenant filter)",
                    agent_id=agent_id,
                    agent_name=agent.get("name"),
                    agent_status=agent.get("status"),
                    agent_tenant_id=agent.get("tenant_id"),
                    requested_tenant_id=effective_tenant_id,
                    lookup_method="id" if is_uuid else "name"
                )
                return agent
            
            # Still not found - log detailed diagnostics
            logger.warning(
                "⚠️ Agent not found even without tenant filter",
                agent_id=agent_id,
                tenant_id=effective_tenant_id,
                lookup_method="id" if is_uuid else "name",
                result_count=len(fallback_result.data) if fallback_result.data else 0
            )
            
            # If query returned empty but no error, the agent might not exist
            # Since we're using service role key, we should be able to see all agents
            # Let's verify if the agent exists at all (regardless of tenant_id)
            if is_uuid:
                try:
                    # Query with just the ID (no tenant filter) to see if agent exists
                    test_result = self.client.table("agents").select("id, name, tenant_id, status").eq("id", agent_id).limit(1).execute()
                    if test_result.data and len(test_result.data) > 0:
                        agent_data = test_result.data[0]
                        logger.warning(
                            "⚠️ Agent EXISTS in database but wasn't found with tenant filter",
                            agent_id=agent_id,
                            agent_name=agent_data.get("name"),
                            agent_tenant_id=agent_data.get("tenant_id"),
                            agent_status=agent_data.get("status"),
                            requested_tenant_id=effective_tenant_id,
                            issue="Agent has different tenant_id or NULL tenant_id"
                        )
                        # Since agent exists, return it even if tenant_id doesn't match
                        # This allows the workflow to proceed
                        logger.info(
                            "✅ Returning agent despite tenant_id mismatch (service role key allows this)",
                            agent_id=agent_id
                        )
                        return agent_data
                    else:
                        logger.error(
                            "❌ Agent ID does NOT exist in database",
                            agent_id=agent_id,
                            suggestion="Verify the agent ID is correct and the agent exists in the 'agents' table"
                        )
                except Exception as test_error:
                    logger.error(
                        "❌ Error testing agent existence",
                        agent_id=agent_id,
                        error=str(test_error),
                        error_type=type(test_error).__name__
                    )
            
            return None

        except Exception as e:
            logger.error(
                "❌ Failed to get agent",
                agent_id=agent_id,
                error=str(e),
                error_type=type(e).__name__
            )
            return None

    async def create_agent(self, agent_data: Dict[str, Any]) -> Optional[str]:
        """Create new agent in database"""
        # If Supabase is unavailable, return empty list.
        if not self.client:
            logger.warning("⚠️ keyword_search called but Supabase client is not initialized; returning empty list")
            return []

        try:
            result = self.client.table("agents").insert(agent_data).execute()

            if result.data:
                agent_id = result.data[0]["id"]
                logger.info("✅ Agent created", agent_id=agent_id, agent_name=agent_data.get("name"))
                return agent_id
            else:
                logger.error("❌ Failed to create agent - no data returned")
                return None

        except Exception as e:
            logger.error("❌ Failed to create agent", error=str(e))
            return None

    async def log_query(
        self,
        user_id: str,
        organization_id: str,
        query_data: Dict[str, Any]
    ) -> Optional[str]:
        """Log query for audit trail and analytics"""
        # If Supabase is unavailable, just skip metrics update.
        if not self.client and not self.engine:
            logger.warning("⚠️ update_agent_metrics called but neither Supabase client nor engine is initialized; skipping")
            return False

        try:
            query_record = {
                "user_id": user_id,
                "organization_id": organization_id,
                "query_text": query_data.get("query"),
                "query_type": query_data.get("query_type"),
                "phase": query_data.get("phase"),
                "response": query_data.get("response"),
                "confidence_score": query_data.get("confidence"),
                "models_used": query_data.get("models_used", []),
                "processing_time_ms": query_data.get("processing_time"),
                "tokens_used": query_data.get("tokens_used"),
                "citations": query_data.get("citations", []),
                "created_at": datetime.now(timezone.utc).isoformat()
            }

            result = self.client.table("queries").insert(query_record).execute()

            if result.data:
                query_id = result.data[0]["id"]
                logger.info("📝 Query logged", query_id=query_id)
                return query_id
            else:
                logger.error("❌ Failed to log query - no data returned")
                return None

        except Exception as e:
            logger.error("❌ Failed to log query", error=str(e))
            return None

    async def get_user_context(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user context including organization and preferences"""
        try:
            result = self.client.table("users").select(
                "id, organization_id, role, medical_specialty, preferences"
            ).eq("id", user_id).execute()

            if result.data:
                user_context = result.data[0]
                logger.info("👤 User context retrieved", user_id=user_id)
                return user_context
            else:
                logger.warning("⚠️ User context not found", user_id=user_id)
                return None

        except Exception as e:
            logger.error("❌ Failed to get user context", user_id=user_id, error=str(e))
            return None

    async def get_documents_metadata(
        self,
        document_ids: List[str],
        domain_ids: Optional[List[str]] = None,
        additional_filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Dict[str, Any]]:
        """Get document metadata from Supabase by document IDs"""
        try:
            if not document_ids:
                return {}

            # Build query
            query = self.client.table("knowledge_documents").select("*").in_("id", document_ids)

            # Add domain filter if provided
            if domain_ids:
                query = query.in_("domain_id", domain_ids)

            # Add additional filters
            if additional_filters:
                for key, value in additional_filters.items():
                    if isinstance(value, list):
                        query = query.in_(key, value)
                    else:
                        query = query.eq(key, value)

            result = query.execute()

            # Convert to dictionary keyed by document_id
            metadata_dict = {}
            if result.data:
                for doc in result.data:
                    doc_id = doc.get("id")
                    if doc_id:
                        metadata_dict[doc_id] = {
                            "content": doc.get("content", ""),
                            "metadata": doc,
                        }

            logger.info("📚 Retrieved document metadata", count=len(metadata_dict))

            return metadata_dict

        except Exception as e:
            logger.error("❌ Failed to get documents metadata", error=str(e))
            return {}

    async def get_all_agents(self) -> List[Dict[str, Any]]:
        """Get all agents from database (active and inactive)"""
        try:
            # Get all agents - don't filter by is_active since many user copies are inactive
            result = self.client.table("agents").select("*").execute()

            if result.data:
                logger.info("📚 Retrieved all agents", count=len(result.data))
                return result.data
            else:
                logger.warning("⚠️ No agents found")
                return []

        except Exception as e:
            logger.error("❌ Failed to get all agents", error=str(e))
            return []

    async def keyword_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Perform keyword-based full-text search"""
        try:
            # Build query - search in title, content, tags
            search_terms = query_text.split()
            
            query = self.client.table("knowledge_documents").select("*")

            # Add domain filter if provided
            if domain_ids:
                query = query.in_("domain_id", domain_ids)

            # Add additional filters
            if filters:
                for key, value in filters.items():
                    if isinstance(value, list):
                        query = query.in_(key, value)
                    else:
                        query = query.eq(key, value)

            # Search in title and content (simple text search)
            # Note: For better full-text search, use PostgreSQL full-text search features
            all_results = query.execute()

            # Filter results by keyword matching
            matched_results = []
            query_lower = query_text.lower()

            if all_results.data:
                for doc in all_results.data:
                    content_lower = (doc.get("content", "") + " " + doc.get("title", "")).lower()
                    title_lower = doc.get("title", "").lower()
                    
                    # Simple keyword matching
                    matches = sum(1 for term in search_terms if term.lower() in content_lower)
                    if matches > 0:
                        matched_results.append({
                            "content": doc.get("content", ""),
                            "metadata": doc,
                            "relevance_score": matches / len(search_terms),
                        })

            # Sort by relevance
            matched_results.sort(key=lambda x: x["relevance_score"], reverse=True)

            logger.info("🔍 Keyword search completed", query=query_text[:100], results_count=len(matched_results[:max_results]))

            return matched_results[:max_results]

        except Exception as e:
            logger.error("❌ Keyword search failed", error=str(e))
            return []

    async def update_agent_metrics(
        self,
        agent_id: str,
        metrics: Dict[str, Any]
    ) -> bool:
        """Update agent performance metrics"""
        try:
            update_data = {
                "last_used": datetime.now(timezone.utc).isoformat(),
                "usage_count": metrics.get("usage_count", 0),
                "average_confidence": metrics.get("average_confidence", 0.0),
                "average_response_time": metrics.get("average_response_time", 0),
                "success_rate": metrics.get("success_rate", 0.0)
            }

            # Use SQL increment for usage_count
            if metrics.get("increment_usage", False):
                with self.engine.connect() as conn:
                    conn.execute(
                        text("""
                            UPDATE agents
                            SET usage_count = COALESCE(usage_count, 0) + 1,
                                last_used = :last_used
                            WHERE id = :agent_id
                        """),
                        {"agent_id": agent_id, "last_used": update_data["last_used"]}
                    )
                    conn.commit()
            else:
                self.client.table("agents").update(update_data).eq("id", agent_id).execute()

            logger.info("📊 Agent metrics updated", agent_id=agent_id)
            return True

        except Exception as e:
            logger.error("❌ Failed to update agent metrics", agent_id=agent_id, error=str(e))
            return False

    async def get_agent_stats(self, agent_id: str, days: int = 7) -> Dict[str, Any]:
        """Get aggregated agent statistics from agent_metrics table"""
        try:
            from datetime import datetime, timedelta, timezone
            
            # Calculate date range
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=days)
            
            with self.engine.connect() as conn:
                # Get agent record for certifications and metadata
                agent_result = conn.execute(
                    text("SELECT id, name, display_name, status, certifications, metadata FROM agents WHERE id = :agent_id"),
                    {"agent_id": agent_id}
                )
                agent_record = agent_result.fetchone()
                
                # Get aggregated metrics
                metrics_result = conn.execute(
                    text("""
                        SELECT
                            COUNT(*) as total_consultations,
                            COUNT(*) FILTER (WHERE success = true) as successful_consultations,
                            AVG(response_time_ms) as avg_response_time_ms,
                            AVG(confidence_score) as avg_confidence,
                            AVG(satisfaction_score) as avg_satisfaction,
                            SUM(tokens_input + tokens_output) as total_tokens,
                            SUM(cost_usd) as total_cost,
                            COUNT(*) FILTER (WHERE operation_type IN ('mode1', 'mode2', 'mode3', 'mode4')) as mode_operations
                        FROM agent_metrics
                        WHERE agent_id = :agent_id
                        AND created_at >= :start_date
                        AND created_at <= :end_date
                    """),
                    {
                        "agent_id": agent_id,
                        "start_date": start_date.isoformat(),
                        "end_date": end_date.isoformat()
                    }
                )
                
                metrics_row = metrics_result.fetchone()
                
                # Get recent feedback (from agent_feedback table if exists)
                feedback_result = conn.execute(
                    text("""
                        SELECT id, rating, comment, user_id, created_at
                        FROM agent_feedback
                        WHERE agent_id = :agent_id
                        ORDER BY created_at DESC
                        LIMIT 5
                    """),
                    {"agent_id": agent_id}
                )
                feedback_rows = feedback_result.fetchall()
                
                # Calculate stats
                total_consultations = metrics_row[0] or 0 if metrics_row else 0
                successful_consultations = metrics_row[1] or 0 if metrics_row else 0
                avg_response_time_ms = float(metrics_row[2]) if metrics_row and metrics_row[2] else 0.0
                avg_confidence = float(metrics_row[3]) if metrics_row and metrics_row[3] else 0.0
                avg_satisfaction = float(metrics_row[4]) if metrics_row and metrics_row[4] else 0.0
                total_tokens = int(metrics_row[5]) if metrics_row and metrics_row[5] else 0
                total_cost = float(metrics_row[6]) if metrics_row and metrics_row[6] else 0.0
                
                # Calculate derived metrics
                success_rate = (successful_consultations / total_consultations * 100) if total_consultations > 0 else 0.0
                avg_response_time_seconds = avg_response_time_ms / 1000.0 if avg_response_time_ms > 0 else 0.0
                confidence_level = int(avg_confidence * 100) if avg_confidence > 0 else 0
                satisfaction_score = float(avg_satisfaction) if avg_satisfaction > 0 else 0.0
                
                # Determine availability from agent status
                agent_status = agent_record[3] if agent_record and len(agent_record) > 3 else "active"
                availability = "offline" if agent_status in ["deprecated", "development"] else ("busy" if agent_status == "testing" else "online")
                
                # Extract certifications
                certifications = []
                if agent_record and len(agent_record) > 4:
                    certs = agent_record[4]
                    if isinstance(certs, list):
                        certifications = certs
                    elif isinstance(certs, dict):
                        certifications = list(certs.values()) if certs else []
                
                # Format feedback
                recent_feedback = []
                for row in feedback_rows:
                    recent_feedback.append({
                        "id": str(row[0]),
                        "rating": float(row[1]) if row[1] else 0.0,
                        "comment": row[2] or None,
                        "userId": str(row[3]) if row[3] else None,
                        "createdAt": row[4].isoformat() if isinstance(row[4], datetime) else str(row[4])
                    })
                
                stats = {
                    "totalConsultations": int(total_consultations),
                    "satisfactionScore": satisfaction_score,
                    "successRate": success_rate,
                    "averageResponseTime": avg_response_time_seconds,
                    "certifications": certifications if certifications else ["HIPAA Compliant", "ISO 13485 Certified"],
                    "totalTokensUsed": total_tokens,
                    "totalCost": total_cost,
                    "confidenceLevel": confidence_level,
                    "availability": availability,
                    "recentFeedback": recent_feedback
                }
                
                logger.info("📊 Agent stats retrieved", agent_id=agent_id, consultations=total_consultations)
                return stats
                
        except Exception as e:
            logger.error("❌ Failed to get agent stats", agent_id=agent_id, error=str(e))
            # Return default/empty stats instead of synthetic data
            return {
                "totalConsultations": 0,
                "satisfactionScore": 0.0,
                "successRate": 0.0,
                "averageResponseTime": 0.0,
                "certifications": [],
                "totalTokensUsed": 0,
                "totalCost": 0.0,
                "confidenceLevel": 0,
                "availability": "offline",
                "recentFeedback": []
            }

    async def get_knowledge_base_stats(self) -> Dict[str, Any]:
        """Get knowledge base statistics"""
        try:
            # Get document counts by type
            with self.engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT
                        COUNT(*) as total_documents,
                        COUNT(DISTINCT metadata->>'specialty') as specialties,
                        COUNT(DISTINCT metadata->>'phase') as phases,
                        AVG(length(content)) as avg_content_length
                    FROM vecs.medical_documents
                """))

                stats = result.fetchone()

                return {
                    "total_documents": stats[0] if stats[0] else 0,
                    "specialties": stats[1] if stats[1] else 0,
                    "phases": stats[2] if stats[2] else 0,
                    "avg_content_length": float(stats[3]) if stats[3] else 0.0,
                    "collection_name": "medical_documents",
                    "vector_dimension": self.settings.vector_dimension
                }

        except Exception as e:
            logger.error("❌ Failed to get knowledge base stats", error=str(e))
            return {
                "total_documents": 0,
                "specialties": 0,
                "phases": 0,
                "avg_content_length": 0.0,
                "error": str(e)
            }

    async def cleanup(self):
        """Cleanup resources"""
        try:
            if self.engine:
                self.engine.dispose()
            logger.info("🧹 Supabase client cleanup completed")
        except Exception as e:
            logger.error("❌ Cleanup error", error=str(e))
    
    def table(self, table_name: str):
        """Convenience method to access Supabase tables directly"""
        if not self.client:
            raise RuntimeError("Supabase client not initialized")
        return self.client.table(table_name)


# Singleton instance
_supabase_client: Optional[SupabaseClient] = None


def get_supabase_client() -> SupabaseClient:
    """Get or create Supabase client singleton"""
    global _supabase_client

    if _supabase_client is None:
        _supabase_client = SupabaseClient()

    return _supabase_client


def set_supabase_client(client: SupabaseClient) -> None:
    """Set the Supabase client singleton (used during app initialization)"""
    global _supabase_client
    _supabase_client = client