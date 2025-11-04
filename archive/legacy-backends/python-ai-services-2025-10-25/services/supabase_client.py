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
    """Enhanced Supabase client with vector operations"""

    def __init__(self):
        self.settings = get_settings()
        self.client: Optional[Client] = None
        self.vx: Optional[vecs.Client] = None
        self.engine = None
        self.vector_collection = None

    async def initialize(self):
        """Initialize Supabase client and vector database"""
        try:
            # Initialize Supabase client
            self.client = create_client(
                self.settings.supabase_url,
                self.settings.supabase_service_role_key
            )

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
        """Get agent configuration by ID"""
        try:
            result = self.client.table("agents").select("*").eq("id", agent_id).execute()

            if result.data:
                agent = result.data[0]
                logger.info("🤖 Agent retrieved", agent_id=agent_id, agent_name=agent.get("name"))
                return agent
            else:
                logger.warning("⚠️ Agent not found", agent_id=agent_id)
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