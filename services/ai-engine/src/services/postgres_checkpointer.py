"""
PostgreSQL Checkpointer for LangGraph Workflows

Production-grade state persistence using Supabase PostgreSQL.
Replaces MemorySaver for production deployments.

Features:
- Async PostgreSQL persistence via asyncpg
- Tenant-aware checkpoint isolation
- Automatic checkpoint cleanup
- HITL approval state storage
- Workflow resumption support

Phase 6 Implementation - Production Ready
"""

import os
import json
import asyncio
from typing import Optional, Dict, Any, List, Tuple, AsyncIterator
from datetime import datetime, timedelta
import structlog
from contextlib import asynccontextmanager

# LangGraph imports
try:
    from langgraph.checkpoint.base import (
        BaseCheckpointSaver,
        Checkpoint,
        CheckpointMetadata,
        CheckpointTuple,
        PendingWrite,
    )
    from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
    BaseCheckpointSaver = object

# Database imports
try:
    import asyncpg
    ASYNCPG_AVAILABLE = True
except ImportError:
    ASYNCPG_AVAILABLE = False

from core.config import get_settings

logger = structlog.get_logger()


# ============================================================================
# POSTGRES CHECKPOINTER
# ============================================================================

class AsyncPostgresCheckpointer(BaseCheckpointSaver if LANGGRAPH_AVAILABLE else object):
    """
    Production PostgreSQL checkpointer for LangGraph.

    Stores workflow checkpoints in Supabase PostgreSQL with:
    - Tenant isolation via tenant_id
    - JSON serialization of state
    - Automatic cleanup of old checkpoints
    - HITL approval integration

    Usage:
        >>> checkpointer = AsyncPostgresCheckpointer()
        >>> await checkpointer.setup()
        >>>
        >>> # Use with LangGraph workflow
        >>> app = workflow.compile(checkpointer=checkpointer)
    """

    # SQL for creating checkpoint tables
    SETUP_SQL = """
    -- Checkpoints table
    CREATE TABLE IF NOT EXISTS langgraph_checkpoints (
        id SERIAL PRIMARY KEY,
        thread_id TEXT NOT NULL,
        checkpoint_ns TEXT NOT NULL DEFAULT '',
        checkpoint_id TEXT NOT NULL,
        parent_checkpoint_id TEXT,
        tenant_id UUID,
        checkpoint JSONB NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        UNIQUE(thread_id, checkpoint_ns, checkpoint_id)
    );

    -- Index for efficient lookups
    CREATE INDEX IF NOT EXISTS idx_checkpoints_thread
    ON langgraph_checkpoints(thread_id, checkpoint_ns);

    CREATE INDEX IF NOT EXISTS idx_checkpoints_tenant
    ON langgraph_checkpoints(tenant_id);

    CREATE INDEX IF NOT EXISTS idx_checkpoints_created
    ON langgraph_checkpoints(created_at);

    -- Checkpoint writes table (for pending writes)
    CREATE TABLE IF NOT EXISTS langgraph_checkpoint_writes (
        id SERIAL PRIMARY KEY,
        thread_id TEXT NOT NULL,
        checkpoint_ns TEXT NOT NULL DEFAULT '',
        checkpoint_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        idx INTEGER NOT NULL,
        channel TEXT NOT NULL,
        type TEXT,
        value JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        UNIQUE(thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
    );

    -- HITL approval queue table
    CREATE TABLE IF NOT EXISTS hitl_approvals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        checkpoint_id TEXT NOT NULL,
        thread_id TEXT NOT NULL,
        tenant_id UUID NOT NULL,
        user_id UUID,
        checkpoint_type TEXT NOT NULL,
        request_data JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        response_data JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        responded_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,

        CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'modified', 'expired'))
    );

    CREATE INDEX IF NOT EXISTS idx_hitl_pending
    ON hitl_approvals(tenant_id, status) WHERE status = 'pending';

    CREATE INDEX IF NOT EXISTS idx_hitl_thread
    ON hitl_approvals(thread_id);
    """

    def __init__(
        self,
        connection_string: Optional[str] = None,
        pool_size: int = 10,
        retention_days: int = 30
    ):
        """
        Initialize PostgreSQL checkpointer.

        Args:
            connection_string: PostgreSQL connection string (defaults to env)
            pool_size: Connection pool size
            retention_days: Days to retain checkpoints
        """
        if LANGGRAPH_AVAILABLE:
            super().__init__()
            self.serde = JsonPlusSerializer()

        self.settings = get_settings()
        self.connection_string = connection_string or self._get_connection_string()
        self.pool_size = pool_size
        self.retention_days = retention_days

        self._pool: Optional[asyncpg.Pool] = None
        self._setup_complete = False

    def _get_connection_string(self) -> str:
        """Get connection string from environment"""
        # Try various environment variable names
        conn = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")

        if not conn:
            # Build from Supabase URL
            supabase_url = os.getenv("SUPABASE_URL", "")
            if supabase_url:
                # Extract project ref from URL
                # https://project.supabase.co -> project
                import re
                match = re.search(r"https://([^.]+)", supabase_url)
                if match:
                    project_ref = match.group(1)
                    password = os.getenv("SUPABASE_DB_PASSWORD", "")
                    conn = f"postgresql://postgres.{project_ref}:{password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

        return conn or ""

    @asynccontextmanager
    async def _get_connection(self):
        """Get database connection from pool"""
        if not self._pool:
            raise RuntimeError("Checkpointer not initialized. Call setup() first.")

        async with self._pool.acquire() as conn:
            yield conn

    async def setup(self):
        """
        Initialize database connection and tables.

        Must be called before using the checkpointer.
        """
        if not ASYNCPG_AVAILABLE:
            logger.warning("asyncpg not available - running without PostgreSQL persistence")
            return

        if not self.connection_string:
            logger.warning("No database connection string - running without persistence")
            return

        try:
            # Create connection pool
            self._pool = await asyncpg.create_pool(
                self.connection_string,
                min_size=2,
                max_size=self.pool_size,
                command_timeout=30
            )

            # Create tables
            async with self._get_connection() as conn:
                await conn.execute(self.SETUP_SQL)

            self._setup_complete = True

            logger.info(
                "postgres_checkpointer_initialized",
                pool_size=self.pool_size,
                retention_days=self.retention_days
            )

        except Exception as e:
            logger.error("postgres_checkpointer_setup_failed", error=str(e))
            raise

    async def cleanup(self):
        """Close database connections"""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("postgres_checkpointer_closed")

    # ========================================================================
    # LANGGRAPH CHECKPOINT INTERFACE
    # ========================================================================

    async def aget_tuple(self, config: Dict[str, Any]) -> Optional[CheckpointTuple]:
        """Get checkpoint tuple for given config"""
        if not self._setup_complete:
            return None

        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"].get("checkpoint_id")

        try:
            async with self._get_connection() as conn:
                if checkpoint_id:
                    # Get specific checkpoint
                    row = await conn.fetchrow(
                        """
                        SELECT checkpoint_id, parent_checkpoint_id, checkpoint, metadata
                        FROM langgraph_checkpoints
                        WHERE thread_id = $1 AND checkpoint_ns = $2 AND checkpoint_id = $3
                        """,
                        thread_id, checkpoint_ns, checkpoint_id
                    )
                else:
                    # Get latest checkpoint
                    row = await conn.fetchrow(
                        """
                        SELECT checkpoint_id, parent_checkpoint_id, checkpoint, metadata
                        FROM langgraph_checkpoints
                        WHERE thread_id = $1 AND checkpoint_ns = $2
                        ORDER BY created_at DESC
                        LIMIT 1
                        """,
                        thread_id, checkpoint_ns
                    )

                if not row:
                    return None

                # Get pending writes
                writes_rows = await conn.fetch(
                    """
                    SELECT task_id, channel, type, value
                    FROM langgraph_checkpoint_writes
                    WHERE thread_id = $1 AND checkpoint_ns = $2 AND checkpoint_id = $3
                    ORDER BY task_id, idx
                    """,
                    thread_id, checkpoint_ns, row["checkpoint_id"]
                )

                pending_writes = []
                for wr in writes_rows:
                    pending_writes.append((
                        wr["task_id"],
                        wr["channel"],
                        self.serde.loads_typed((wr["type"], json.dumps(wr["value"]).encode()))
                    ))

                return CheckpointTuple(
                    config={
                        "configurable": {
                            "thread_id": thread_id,
                            "checkpoint_ns": checkpoint_ns,
                            "checkpoint_id": row["checkpoint_id"],
                        }
                    },
                    checkpoint=self.serde.loads_typed(("json", json.dumps(row["checkpoint"]).encode())),
                    metadata=CheckpointMetadata(**row["metadata"]) if row["metadata"] else CheckpointMetadata(),
                    parent_config={
                        "configurable": {
                            "thread_id": thread_id,
                            "checkpoint_ns": checkpoint_ns,
                            "checkpoint_id": row["parent_checkpoint_id"],
                        }
                    } if row["parent_checkpoint_id"] else None,
                    pending_writes=pending_writes
                )

        except Exception as e:
            logger.error("checkpoint_get_failed", error=str(e), thread_id=thread_id)
            return None

    async def alist(
        self,
        config: Optional[Dict[str, Any]] = None,
        *,
        filter: Optional[Dict[str, Any]] = None,
        before: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None
    ) -> AsyncIterator[CheckpointTuple]:
        """List checkpoints matching criteria"""
        if not self._setup_complete:
            return

        query = """
            SELECT thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id,
                   checkpoint, metadata, created_at
            FROM langgraph_checkpoints
            WHERE 1=1
        """
        params = []
        param_idx = 1

        if config:
            thread_id = config["configurable"].get("thread_id")
            if thread_id:
                query += f" AND thread_id = ${param_idx}"
                params.append(thread_id)
                param_idx += 1

            checkpoint_ns = config["configurable"].get("checkpoint_ns")
            if checkpoint_ns is not None:
                query += f" AND checkpoint_ns = ${param_idx}"
                params.append(checkpoint_ns)
                param_idx += 1

        if before:
            before_id = before["configurable"].get("checkpoint_id")
            if before_id:
                query += f" AND checkpoint_id < ${param_idx}"
                params.append(before_id)
                param_idx += 1

        query += " ORDER BY created_at DESC"

        if limit:
            query += f" LIMIT ${param_idx}"
            params.append(limit)

        try:
            async with self._get_connection() as conn:
                rows = await conn.fetch(query, *params)

                for row in rows:
                    yield CheckpointTuple(
                        config={
                            "configurable": {
                                "thread_id": row["thread_id"],
                                "checkpoint_ns": row["checkpoint_ns"],
                                "checkpoint_id": row["checkpoint_id"],
                            }
                        },
                        checkpoint=self.serde.loads_typed(("json", json.dumps(row["checkpoint"]).encode())),
                        metadata=CheckpointMetadata(**row["metadata"]) if row["metadata"] else CheckpointMetadata(),
                        parent_config={
                            "configurable": {
                                "thread_id": row["thread_id"],
                                "checkpoint_ns": row["checkpoint_ns"],
                                "checkpoint_id": row["parent_checkpoint_id"],
                            }
                        } if row["parent_checkpoint_id"] else None,
                    )

        except Exception as e:
            logger.error("checkpoint_list_failed", error=str(e))

    async def aput(
        self,
        config: Dict[str, Any],
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: Optional[Dict[str, int]] = None,
    ) -> Dict[str, Any]:
        """Save checkpoint to database"""
        if not self._setup_complete:
            return config

        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = checkpoint["id"]
        parent_id = config["configurable"].get("checkpoint_id")
        tenant_id = config["configurable"].get("tenant_id")

        try:
            async with self._get_connection() as conn:
                # Serialize checkpoint
                _, checkpoint_bytes = self.serde.dumps_typed(checkpoint)
                checkpoint_json = json.loads(checkpoint_bytes)

                await conn.execute(
                    """
                    INSERT INTO langgraph_checkpoints
                    (thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id,
                     tenant_id, checkpoint, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (thread_id, checkpoint_ns, checkpoint_id)
                    DO UPDATE SET
                        checkpoint = EXCLUDED.checkpoint,
                        metadata = EXCLUDED.metadata
                    """,
                    thread_id,
                    checkpoint_ns,
                    checkpoint_id,
                    parent_id,
                    tenant_id,
                    json.dumps(checkpoint_json),
                    json.dumps(metadata) if metadata else "{}"
                )

                logger.debug(
                    "checkpoint_saved",
                    thread_id=thread_id[:8] if thread_id else None,
                    checkpoint_id=checkpoint_id[:8] if checkpoint_id else None
                )

                return {
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_ns": checkpoint_ns,
                        "checkpoint_id": checkpoint_id,
                    }
                }

        except Exception as e:
            logger.error("checkpoint_save_failed", error=str(e), thread_id=thread_id)
            raise

    async def aput_writes(
        self,
        config: Dict[str, Any],
        writes: List[Tuple[str, Any]],
        task_id: str
    ):
        """Save pending writes to database"""
        if not self._setup_complete:
            return

        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"]["checkpoint_id"]

        try:
            async with self._get_connection() as conn:
                for idx, (channel, value) in enumerate(writes):
                    type_str, value_bytes = self.serde.dumps_typed(value)
                    value_json = json.loads(value_bytes)

                    await conn.execute(
                        """
                        INSERT INTO langgraph_checkpoint_writes
                        (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, type, value)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
                        DO UPDATE SET channel = EXCLUDED.channel, type = EXCLUDED.type, value = EXCLUDED.value
                        """,
                        thread_id, checkpoint_ns, checkpoint_id, task_id, idx,
                        channel, type_str, json.dumps(value_json)
                    )

        except Exception as e:
            logger.error("checkpoint_writes_failed", error=str(e))

    # ========================================================================
    # HITL APPROVAL METHODS
    # ========================================================================

    async def create_hitl_approval(
        self,
        checkpoint_id: str,
        thread_id: str,
        tenant_id: str,
        checkpoint_type: str,
        request_data: Dict[str, Any],
        user_id: Optional[str] = None,
        expires_in_seconds: int = 3600
    ) -> str:
        """
        Create HITL approval request in database.

        Args:
            checkpoint_id: LangGraph checkpoint ID
            thread_id: Workflow thread ID
            tenant_id: Tenant UUID
            checkpoint_type: Type of HITL checkpoint
            request_data: Approval request details
            user_id: Optional user ID
            expires_in_seconds: Expiry time

        Returns:
            Approval ID
        """
        if not self._setup_complete:
            return ""

        expires_at = datetime.utcnow() + timedelta(seconds=expires_in_seconds)

        try:
            async with self._get_connection() as conn:
                row = await conn.fetchrow(
                    """
                    INSERT INTO hitl_approvals
                    (checkpoint_id, thread_id, tenant_id, user_id, checkpoint_type,
                     request_data, expires_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id
                    """,
                    checkpoint_id, thread_id, tenant_id, user_id,
                    checkpoint_type, json.dumps(request_data), expires_at
                )

                approval_id = str(row["id"])

                logger.info(
                    "hitl_approval_created",
                    approval_id=approval_id,
                    checkpoint_type=checkpoint_type,
                    tenant_id=tenant_id[:8] if tenant_id else None
                )

                return approval_id

        except Exception as e:
            logger.error("hitl_approval_create_failed", error=str(e))
            raise

    async def get_pending_approvals(
        self,
        tenant_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get pending HITL approvals for tenant.

        Args:
            tenant_id: Tenant UUID
            limit: Max approvals to return

        Returns:
            List of pending approvals
        """
        if not self._setup_complete:
            return []

        try:
            async with self._get_connection() as conn:
                rows = await conn.fetch(
                    """
                    SELECT id, checkpoint_id, thread_id, checkpoint_type,
                           request_data, created_at, expires_at
                    FROM hitl_approvals
                    WHERE tenant_id = $1 AND status = 'pending'
                          AND (expires_at IS NULL OR expires_at > NOW())
                    ORDER BY created_at ASC
                    LIMIT $2
                    """,
                    tenant_id, limit
                )

                return [
                    {
                        "id": str(row["id"]),
                        "checkpoint_id": row["checkpoint_id"],
                        "thread_id": row["thread_id"],
                        "checkpoint_type": row["checkpoint_type"],
                        "request_data": row["request_data"],
                        "created_at": row["created_at"].isoformat(),
                        "expires_at": row["expires_at"].isoformat() if row["expires_at"] else None
                    }
                    for row in rows
                ]

        except Exception as e:
            logger.error("hitl_get_pending_failed", error=str(e))
            return []

    async def respond_to_approval(
        self,
        approval_id: str,
        status: str,
        response_data: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> bool:
        """
        Respond to HITL approval request.

        Args:
            approval_id: Approval UUID
            status: Response status (approved/rejected/modified)
            response_data: Optional response data
            user_id: User responding

        Returns:
            Success status
        """
        if not self._setup_complete:
            return False

        if status not in ("approved", "rejected", "modified"):
            raise ValueError(f"Invalid status: {status}")

        try:
            async with self._get_connection() as conn:
                result = await conn.execute(
                    """
                    UPDATE hitl_approvals
                    SET status = $2, response_data = $3, responded_at = NOW(), user_id = COALESCE($4, user_id)
                    WHERE id = $1 AND status = 'pending'
                    """,
                    approval_id, status,
                    json.dumps(response_data) if response_data else None,
                    user_id
                )

                success = result.split()[-1] == "1"

                if success:
                    logger.info(
                        "hitl_approval_responded",
                        approval_id=approval_id,
                        status=status
                    )

                return success

        except Exception as e:
            logger.error("hitl_respond_failed", error=str(e))
            return False

    async def get_approval_status(self, approval_id: str) -> Optional[Dict[str, Any]]:
        """Get status of HITL approval"""
        if not self._setup_complete:
            return None

        try:
            async with self._get_connection() as conn:
                row = await conn.fetchrow(
                    """
                    SELECT status, response_data, responded_at
                    FROM hitl_approvals
                    WHERE id = $1
                    """,
                    approval_id
                )

                if row:
                    return {
                        "status": row["status"],
                        "response_data": row["response_data"],
                        "responded_at": row["responded_at"].isoformat() if row["responded_at"] else None
                    }
                return None

        except Exception as e:
            logger.error("hitl_status_check_failed", error=str(e))
            return None

    # ========================================================================
    # CLEANUP
    # ========================================================================

    async def cleanup_old_checkpoints(self, older_than_days: Optional[int] = None):
        """Remove old checkpoints and expired approvals"""
        if not self._setup_complete:
            return

        days = older_than_days or self.retention_days
        cutoff = datetime.utcnow() - timedelta(days=days)

        try:
            async with self._get_connection() as conn:
                # Delete old checkpoints
                result = await conn.execute(
                    "DELETE FROM langgraph_checkpoints WHERE created_at < $1",
                    cutoff
                )
                deleted_checkpoints = int(result.split()[-1])

                # Delete old writes
                await conn.execute(
                    "DELETE FROM langgraph_checkpoint_writes WHERE created_at < $1",
                    cutoff
                )

                # Expire old approvals
                await conn.execute(
                    """
                    UPDATE hitl_approvals
                    SET status = 'expired'
                    WHERE status = 'pending' AND expires_at < NOW()
                    """
                )

                logger.info(
                    "checkpoint_cleanup_completed",
                    deleted_checkpoints=deleted_checkpoints,
                    cutoff_date=cutoff.isoformat()
                )

        except Exception as e:
            logger.error("checkpoint_cleanup_failed", error=str(e))


# ============================================================================
# FACTORY
# ============================================================================

_checkpointer: Optional[AsyncPostgresCheckpointer] = None


async def get_postgres_checkpointer() -> AsyncPostgresCheckpointer:
    """Get or create PostgreSQL checkpointer singleton"""
    global _checkpointer

    if _checkpointer is None:
        _checkpointer = AsyncPostgresCheckpointer()
        await _checkpointer.setup()

    return _checkpointer


async def close_checkpointer():
    """Close checkpointer connections"""
    global _checkpointer

    if _checkpointer:
        await _checkpointer.cleanup()
        _checkpointer = None
