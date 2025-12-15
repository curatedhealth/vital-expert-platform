"""
PostgreSQL Client for GraphRAG Service

Provides async connection pooling and query methods for:
- RAG profiles and policies
- Agent KG views
- Agent metadata
- Knowledge graph metadata (node types, edge types)
"""

import asyncpg
from typing import List, Dict, Optional, Any
from uuid import UUID
from contextlib import asynccontextmanager

from ..config import get_config
from ..models import RAGProfile, AgentKGView, KGNodeType, KGEdgeType
from ..utils.logger import get_logger

logger = get_logger(__name__)


class PostgresClient:
    """Async PostgreSQL client with connection pooling"""
    
    def __init__(self):
        self.config = get_config()
        self.pool: Optional[asyncpg.Pool] = None
        
    async def connect(self) -> None:
        """Initialize connection pool"""
        if self.pool is not None:
            logger.warning("Connection pool already initialized")
            return
            
        try:
            self.pool = await asyncpg.create_pool(
                host=self.config.database.postgres_host,
                port=self.config.database.postgres_port,
                database=self.config.database.postgres_db,
                user=self.config.database.postgres_user,
                password=self.config.database.postgres_password,
                min_size=5,
                max_size=self.config.database.postgres_pool_size,
                command_timeout=60,
                timeout=30
            )
            logger.info(f"PostgreSQL connection pool initialized (max_size={self.config.database.postgres_pool_size})")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL connection pool: {e}")
            raise
            
    async def disconnect(self) -> None:
        """Close connection pool"""
        if self.pool is not None:
            await self.pool.close()
            self.pool = None
            logger.info("PostgreSQL connection pool closed")
            
    @asynccontextmanager
    async def acquire(self):
        """Acquire a connection from the pool"""
        if self.pool is None:
            raise RuntimeError("Connection pool not initialized. Call connect() first.")
        async with self.pool.acquire() as connection:
            yield connection
            
    async def health_check(self) -> bool:
        """Check database connectivity"""
        try:
            async with self.acquire() as conn:
                result = await conn.fetchval("SELECT 1")
                return result == 1
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
            
    # ========================================================================
    # RAG PROFILE QUERIES
    # ========================================================================
    
    async def get_rag_profile(
        self,
        profile_id: Optional[UUID] = None,
        slug: Optional[str] = None
    ) -> Optional[RAGProfile]:
        """Get RAG profile by ID or slug"""
        if profile_id is None and slug is None:
            raise ValueError("Either profile_id or slug must be provided")
            
        query = """
            SELECT 
                id, name, slug, description,
                retrieval_mode, vector_weight, keyword_weight, graph_weight,
                top_k, similarity_threshold, rerank_enabled, reranker_model,
                context_window_tokens, chunk_overlap_tokens,
                metadata_filters, is_active, created_at, updated_at
            FROM rag_profiles
            WHERE deleted_at IS NULL
        """
        
        params = []
        if profile_id:
            query += " AND id = $1"
            params.append(profile_id)
        else:
            query += " AND slug = $1"
            params.append(slug)
            
        query += " LIMIT 1"
        
        try:
            async with self.acquire() as conn:
                row = await conn.fetchrow(query, *params)
                if row:
                    return RAGProfile(**dict(row))
                return None
        except Exception as e:
            logger.error(f"Error fetching RAG profile: {e}")
            raise
            
    async def get_agent_rag_policy(
        self,
        agent_id: UUID,
        skill_id: Optional[UUID] = None
    ) -> Optional[Dict[str, Any]]:
        """Get agent-specific RAG policy overrides"""
        query = """
            SELECT 
                arp.id, arp.agent_id, arp.skill_id, arp.rag_profile_id,
                arp.agent_specific_top_k, arp.agent_specific_threshold,
                arp.agent_specific_filters, arp.is_default_policy, arp.is_active,
                rp.*
            FROM agent_rag_policies arp
            JOIN rag_profiles rp ON arp.rag_profile_id = rp.id
            WHERE arp.agent_id = $1
                AND arp.is_active = true
                AND rp.deleted_at IS NULL
        """
        
        params = [agent_id]
        
        if skill_id:
            query += " AND arp.skill_id = $2"
            params.append(skill_id)
        else:
            query += " AND arp.skill_id IS NULL AND arp.is_default_policy = true"
            
        query += " ORDER BY arp.created_at DESC LIMIT 1"
        
        try:
            async with self.acquire() as conn:
                row = await conn.fetchrow(query, *params)
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Error fetching agent RAG policy: {e}")
            raise
            
    # ========================================================================
    # AGENT KG VIEW QUERIES
    # ========================================================================
    
    async def get_agent_kg_view(
        self,
        agent_id: UUID,
        view_name: Optional[str] = None
    ) -> Optional[AgentKGView]:
        """Get agent's knowledge graph view configuration"""
        query = """
            SELECT 
                id, agent_id, rag_profile_id, name, description,
                include_nodes, include_edges, max_hops, graph_limit,
                depth_strategy, is_active, created_at, updated_at
            FROM agent_kg_views
            WHERE agent_id = $1
                AND is_active = true
                AND deleted_at IS NULL
        """
        
        params = [agent_id]
        
        if view_name:
            query += " AND name = $2"
            params.append(view_name)
            
        query += " ORDER BY created_at DESC LIMIT 1"
        
        try:
            async with self.acquire() as conn:
                row = await conn.fetchrow(query, *params)
                if row:
                    return AgentKGView(**dict(row))
                return None
        except Exception as e:
            logger.error(f"Error fetching agent KG view: {e}")
            raise
            
    async def get_kg_node_types(
        self,
        node_type_ids: List[UUID]
    ) -> List[KGNodeType]:
        """Get KG node type details by IDs"""
        query = """
            SELECT id, name, description, properties, is_active
            FROM kg_node_types
            WHERE id = ANY($1::uuid[])
                AND is_active = true
                AND deleted_at IS NULL
        """
        
        try:
            async with self.acquire() as conn:
                rows = await conn.fetch(query, node_type_ids)
                return [KGNodeType(**dict(row)) for row in rows]
        except Exception as e:
            logger.error(f"Error fetching KG node types: {e}")
            raise
            
    async def get_kg_edge_types(
        self,
        edge_type_ids: List[UUID]
    ) -> List[KGEdgeType]:
        """Get KG edge type details by IDs"""
        query = """
            SELECT id, name, description, inverse_name, properties, is_active
            FROM kg_edge_types
            WHERE id = ANY($1::uuid[])
                AND is_active = true
                AND deleted_at IS NULL
        """
        
        try:
            async with self.acquire() as conn:
                rows = await conn.fetch(query, edge_type_ids)
                return [KGEdgeType(**dict(row)) for row in rows]
        except Exception as e:
            logger.error(f"Error fetching KG edge types: {e}")
            raise
            
    # ========================================================================
    # AGENT METADATA QUERIES
    # ========================================================================
    
    async def get_agent_metadata(self, agent_id: UUID) -> Optional[Dict[str, Any]]:
        """Get agent metadata including role, function, department"""
        query = """
            SELECT 
                a.id, a.name, a.slug, a.title, a.description,
                a.role_id, a.function_id, a.department_id, a.tenant_id,
                a.status, a.system_prompt,
                r.name as role_name,
                f.name as function_name,
                d.name as department_name
            FROM agents a
            LEFT JOIN roles r ON a.role_id = r.id
            LEFT JOIN functions f ON a.function_id = f.id
            LEFT JOIN departments d ON a.department_id = d.id
            WHERE a.id = $1 AND a.deleted_at IS NULL
        """
        
        try:
            async with self.acquire() as conn:
                row = await conn.fetchrow(query, agent_id)
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Error fetching agent metadata: {e}")
            raise
            
    # ========================================================================
    # SYNC LOG QUERIES
    # ========================================================================
    
    async def log_kg_sync(
        self,
        sync_type: str,
        source_id: Optional[UUID],
        status: str,
        message: Optional[str] = None,
        error_details: Optional[Dict] = None,
        records_processed: int = 0,
        records_failed: int = 0
    ) -> UUID:
        """Log knowledge graph sync operation"""
        query = """
            INSERT INTO kg_sync_log (
                sync_type, source_id, status, message, error_details,
                records_processed, records_failed, started_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING id
        """
        
        try:
            async with self.acquire() as conn:
                sync_id = await conn.fetchval(
                    query,
                    sync_type, source_id, status, message,
                    error_details, records_processed, records_failed
                )
                return sync_id
        except Exception as e:
            logger.error(f"Error logging KG sync: {e}")
            raise
            
    async def update_kg_sync_status(
        self,
        sync_id: UUID,
        status: str,
        message: Optional[str] = None,
        error_details: Optional[Dict] = None,
        records_processed: int = 0,
        records_failed: int = 0
    ) -> None:
        """Update KG sync log status"""
        query = """
            UPDATE kg_sync_log
            SET status = $2,
                message = COALESCE($3, message),
                error_details = COALESCE($4, error_details),
                records_processed = $5,
                records_failed = $6,
                completed_at = NOW()
            WHERE id = $1
        """
        
        try:
            async with self.acquire() as conn:
                await conn.execute(
                    query,
                    sync_id, status, message, error_details,
                    records_processed, records_failed
                )
        except Exception as e:
            logger.error(f"Error updating KG sync status: {e}")
            raise


# Singleton instance
_postgres_client: Optional[PostgresClient] = None


async def get_postgres_client() -> PostgresClient:
    """Get or create PostgreSQL client singleton"""
    global _postgres_client
    if _postgres_client is None:
        _postgres_client = PostgresClient()
        await _postgres_client.connect()
    return _postgres_client


async def close_postgres_client() -> None:
    """Close PostgreSQL client"""
    global _postgres_client
    if _postgres_client is not None:
        await _postgres_client.disconnect()
        _postgres_client = None

