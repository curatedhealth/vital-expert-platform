"""
PostgreSQL Checkpointer for LangGraph
Provides persistent state storage for workflow resumption
"""

from typing import Dict, Optional, Any, Iterator
import json
import structlog
from datetime import datetime
import asyncpg
from langgraph.checkpoint.base import BaseCheckpointSaver, Checkpoint, CheckpointMetadata
from contextlib import asynccontextmanager

logger = structlog.get_logger()


class AsyncPostgresCheckpointer(BaseCheckpointSaver):
    """
    AsyncPostgreSQL-based checkpointer for LangGraph state persistence.
    
    Stores workflow state in PostgreSQL for resumption and auditing.
    Uses asyncpg for high-performance async database operations.
    """
    
    def __init__(self, connection_string: str, table_name: str = "langgraph_checkpoints"):
        """
        Initialize PostgreSQL checkpointer.
        
        Args:
            connection_string: PostgreSQL connection string
            table_name: Table name for storing checkpoints
        """
        self.connection_string = connection_string
        self.table_name = table_name
        self._pool: Optional[asyncpg.Pool] = None
        
        logger.info(
            "postgres_checkpointer_initialized",
            table_name=table_name
        )
    
    async def _ensure_pool(self) -> asyncpg.Pool:
        """Ensure connection pool exists"""
        if self._pool is None:
            self._pool = await asyncpg.create_pool(
                self.connection_string,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            await self._create_table()
        return self._pool
    
    async def _create_table(self):
        """Create checkpoints table if not exists"""
        async with self._pool.acquire() as conn:
            await conn.execute(f"""
                CREATE TABLE IF NOT EXISTS {self.table_name} (
                    thread_id TEXT NOT NULL,
                    checkpoint_id TEXT NOT NULL,
                    parent_checkpoint_id TEXT,
                    checkpoint_data JSONB NOT NULL,
                    metadata JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    PRIMARY KEY (thread_id, checkpoint_id)
                );
                
                CREATE INDEX IF NOT EXISTS idx_{self.table_name}_thread_id 
                ON {self.table_name}(thread_id);
                
                CREATE INDEX IF NOT EXISTS idx_{self.table_name}_created_at 
                ON {self.table_name}(created_at);
            """)
        
        logger.info("checkpoint_table_created", table_name=self.table_name)
    
    async def aget(
        self,
        config: Dict[str, Any],
        *,
        filter: Optional[Dict[str, Any]] = None,
    ) -> Optional[Checkpoint]:
        """
        Get checkpoint by thread_id and checkpoint_id.
        
        Args:
            config: Configuration dict containing thread_id and checkpoint_id
            filter: Optional filter criteria (not used in basic implementation)
            
        Returns:
            Checkpoint if found, None otherwise
        """
        pool = await self._ensure_pool()
        thread_id = config.get("configurable", {}).get("thread_id")
        checkpoint_id = config.get("configurable", {}).get("checkpoint_id")
        
        if not thread_id:
            logger.warning("checkpoint_get_no_thread_id")
            return None
        
        async with pool.acquire() as conn:
            # If checkpoint_id not specified, get latest
            if checkpoint_id:
                query = f"""
                    SELECT checkpoint_data, metadata, parent_checkpoint_id
                    FROM {self.table_name}
                    WHERE thread_id = $1 AND checkpoint_id = $2
                """
                row = await conn.fetchrow(query, thread_id, checkpoint_id)
            else:
                query = f"""
                    SELECT checkpoint_data, metadata, parent_checkpoint_id
                    FROM {self.table_name}
                    WHERE thread_id = $1
                    ORDER BY created_at DESC
                    LIMIT 1
                """
                row = await conn.fetchrow(query, thread_id)
            
            if not row:
                logger.debug(
                    "checkpoint_not_found",
                    thread_id=thread_id,
                    checkpoint_id=checkpoint_id
                )
                return None
            
            checkpoint = Checkpoint(
                v=1,
                id=checkpoint_id or row["checkpoint_data"].get("id"),
                ts=datetime.now().isoformat(),
                channel_values=row["checkpoint_data"].get("channel_values", {}),
                channel_versions=row["checkpoint_data"].get("channel_versions", {}),
                versions_seen=row["checkpoint_data"].get("versions_seen", {})
            )
            
            logger.debug(
                "checkpoint_retrieved",
                thread_id=thread_id,
                checkpoint_id=checkpoint.id
            )
            
            return checkpoint
    
    async def aput(
        self,
        config: Dict[str, Any],
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
    ) -> Dict[str, Any]:
        """
        Save checkpoint to PostgreSQL.
        
        Args:
            config: Configuration dict containing thread_id
            checkpoint: Checkpoint object to save
            metadata: Checkpoint metadata
            
        Returns:
            Updated config with checkpoint_id
        """
        pool = await self._ensure_pool()
        thread_id = config.get("configurable", {}).get("thread_id")
        
        if not thread_id:
            raise ValueError("thread_id required in config")
        
        checkpoint_id = checkpoint.id
        parent_checkpoint_id = config.get("configurable", {}).get("checkpoint_id")
        
        checkpoint_data = {
            "id": checkpoint_id,
            "v": checkpoint.v,
            "ts": checkpoint.ts,
            "channel_values": checkpoint.channel_values,
            "channel_versions": checkpoint.channel_versions,
            "versions_seen": checkpoint.versions_seen
        }
        
        metadata_json = metadata if isinstance(metadata, dict) else {}
        
        async with pool.acquire() as conn:
            await conn.execute(
                f"""
                INSERT INTO {self.table_name} 
                (thread_id, checkpoint_id, parent_checkpoint_id, checkpoint_data, metadata)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (thread_id, checkpoint_id) 
                DO UPDATE SET
                    checkpoint_data = EXCLUDED.checkpoint_data,
                    metadata = EXCLUDED.metadata,
                    created_at = NOW()
                """,
                thread_id,
                checkpoint_id,
                parent_checkpoint_id,
                json.dumps(checkpoint_data),
                json.dumps(metadata_json)
            )
        
        logger.info(
            "checkpoint_saved",
            thread_id=thread_id,
            checkpoint_id=checkpoint_id
        )
        
        return {
            "configurable": {
                "thread_id": thread_id,
                "checkpoint_id": checkpoint_id
            }
        }
    
    async def alist(
        self,
        config: Dict[str, Any],
        *,
        filter: Optional[Dict[str, Any]] = None,
        before: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> Iterator[Checkpoint]:
        """
        List checkpoints for a thread.
        
        Args:
            config: Configuration dict containing thread_id
            filter: Optional filter criteria
            before: Get checkpoints before this checkpoint_id
            limit: Maximum number of checkpoints to return
            
        Returns:
            Iterator of Checkpoint objects
        """
        pool = await self._ensure_pool()
        thread_id = config.get("configurable", {}).get("thread_id")
        
        if not thread_id:
            return iter([])
        
        query = f"""
            SELECT checkpoint_data, metadata, parent_checkpoint_id
            FROM {self.table_name}
            WHERE thread_id = $1
        """
        params = [thread_id]
        
        if before:
            query += " AND created_at < (SELECT created_at FROM {self.table_name} WHERE checkpoint_id = $2)"
            params.append(before)
        
        query += " ORDER BY created_at DESC"
        
        if limit:
            query += f" LIMIT {limit}"
        
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
        
        checkpoints = []
        for row in rows:
            checkpoint_data = row["checkpoint_data"]
            checkpoint = Checkpoint(
                v=checkpoint_data.get("v", 1),
                id=checkpoint_data.get("id"),
                ts=checkpoint_data.get("ts"),
                channel_values=checkpoint_data.get("channel_values", {}),
                channel_versions=checkpoint_data.get("channel_versions", {}),
                versions_seen=checkpoint_data.get("versions_seen", {})
            )
            checkpoints.append(checkpoint)
        
        return iter(checkpoints)
    
    async def adelete(
        self,
        config: Dict[str, Any],
    ) -> None:
        """
        Delete all checkpoints for a thread.
        
        Args:
            config: Configuration dict containing thread_id
        """
        pool = await self._ensure_pool()
        thread_id = config.get("configurable", {}).get("thread_id")
        
        if not thread_id:
            return
        
        async with pool.acquire() as conn:
            result = await conn.execute(
                f"DELETE FROM {self.table_name} WHERE thread_id = $1",
                thread_id
            )
        
        logger.info(
            "checkpoints_deleted",
            thread_id=thread_id,
            deleted_count=result.split()[-1]  # Extract count from "DELETE N"
        )
    
    async def close(self):
        """Close database connection pool"""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("checkpoint_pool_closed")


class TenantAwarePostgresCheckpointer:
    """
    Tenant-aware wrapper for PostgreSQL checkpointer.
    Creates separate checkpointers per tenant for isolation.
    """
    
    def __init__(self, connection_string: str):
        """
        Initialize tenant-aware checkpointer.
        
        Args:
            connection_string: PostgreSQL connection string
        """
        self.connection_string = connection_string
        self._checkpointers: Dict[str, AsyncPostgresCheckpointer] = {}
        logger.info("tenant_aware_checkpointer_initialized", type="AsyncPostgres")
    
    async def get_checkpointer(self, tenant_id: str) -> AsyncPostgresCheckpointer:
        """
        Get or create checkpointer for tenant.
        
        Args:
            tenant_id: Tenant identifier
            
        Returns:
            AsyncPostgresCheckpointer instance for tenant
        """
        if tenant_id not in self._checkpointers:
            table_name = f"langgraph_checkpoints_{tenant_id.replace('-', '_')}"
            checkpointer = AsyncPostgresCheckpointer(
                self.connection_string,
                table_name=table_name
            )
            self._checkpointers[tenant_id] = checkpointer
            logger.info("checkpointer_created", tenant_id=tenant_id, type="AsyncPostgres")
        
        return self._checkpointers[tenant_id]
    
    async def clear_tenant_checkpoints(self, tenant_id: str):
        """
        Clear all checkpoints for a tenant.
        
        Args:
            tenant_id: Tenant identifier
        """
        if tenant_id in self._checkpointers:
            checkpointer = self._checkpointers[tenant_id]
            await checkpointer.close()
            del self._checkpointers[tenant_id]
            logger.info("checkpoints_cleared", tenant_id=tenant_id, type="AsyncPostgres")
    
    async def close_all(self):
        """Close all checkpointers"""
        for checkpointer in self._checkpointers.values():
            await checkpointer.close()
        self._checkpointers.clear()
        logger.info("all_checkpointers_closed")


# Global instance
_checkpointer: Optional[TenantAwarePostgresCheckpointer] = None


def get_checkpointer(connection_string: Optional[str] = None) -> TenantAwarePostgresCheckpointer:
    """
    Get or create global checkpointer instance.
    
    Args:
        connection_string: PostgreSQL connection string (required for first call)
        
    Returns:
        TenantAwarePostgresCheckpointer instance
    """
    global _checkpointer
    
    if _checkpointer is None:
        if connection_string is None:
            # Fallback: Try to get from environment
            import os
            connection_string = os.getenv("SUPABASE_URL")
            if not connection_string:
                raise ValueError("connection_string required for checkpointer initialization")
        
        _checkpointer = TenantAwarePostgresCheckpointer(connection_string)
    
    return _checkpointer
