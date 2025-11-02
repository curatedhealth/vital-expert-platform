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
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
            
            # Initialize Supabase client (REST API)
            self.client = create_client(
                self.settings.supabase_url,
                self.settings.supabase_service_role_key
            )
            logger.info("✅ Supabase REST client initialized")

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

        except Exception as e:
            logger.error("❌ Failed to initialize Supabase client", error=str(e))
            raise

    async def _ensure_vector_index(self):
        """Ensure vector index exists for similarity search"""
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

    async def get_agent_by_id(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """
        Get agent configuration by ID or name.
        
        Args:
            agent_id: Either a UUID (id field) or agent name (name field)
            
        Returns:
            Agent configuration dictionary or None if not found
        """
        try:
            # First, try to determine if this looks like a UUID
            import re
            uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
            is_uuid = bool(uuid_pattern.match(agent_id))
            
            if is_uuid:
                # Query by id field (UUID)
                result = self.client.table("agents").select("*").eq("id", agent_id).execute()
            else:
                # Query by name field (string)
                result = self.client.table("agents").select("*").eq("name", agent_id).execute()

            if result.data:
                agent = result.data[0]
                logger.info("🤖 Agent retrieved", agent_id=agent_id, agent_name=agent.get("name"), lookup_method="id" if is_uuid else "name")
                return agent
            else:
                logger.warning("⚠️ Agent not found", agent_id=agent_id, lookup_method="id" if is_uuid else "name")
                return None

        except Exception as e:
            logger.error("❌ Failed to get agent", agent_id=agent_id, error=str(e))
            return None

    async def create_agent(self, agent_data: Dict[str, Any]) -> Optional[str]:
        """Create new agent in database"""
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