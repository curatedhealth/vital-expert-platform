"""
Postgres Checkpointer for LangGraph
Enables state persistence using PostgreSQL via Supabase

NOTE: Currently uses MemorySaver as placeholder.
TODO: Implement AsyncPostgresSaver for production persistence.

Phase 2 H6: Enhanced with fallback logging for observability.
Export WorkflowCheckpointerFactory for centralized checkpointer creation.
"""

from typing import Optional, Any
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.base import BaseCheckpointSaver
import structlog
import os

from graphrag.config import get_graphrag_config

logger = structlog.get_logger()


def _redact_db_url(url: str) -> str:
    """
    Redact password from database URL for safe logging.

    Transforms: postgresql://user:password@host:5432/db
    Into: postgresql://user:***@host:5432...
    """
    if not url:
        return "[no_url]"
    if "@" in url:
        parts = url.split("@")
        if len(parts) >= 2 and ":" in parts[0]:
            # Extract protocol and user, redact password
            proto_user = parts[0].rsplit(":", 1)[0]  # Everything before last colon (password)
            host_part = parts[1][:40] if len(parts[1]) > 40 else parts[1]
            return f"{proto_user}:***@{host_part}..."
    # If no password pattern detected, just truncate
    return url[:40] + "..." if len(url) > 40 else url

# Import PostgresSaver if available
try:
    from langgraph.checkpoint.postgres import PostgresSaver  # type: ignore
    POSTGRES_AVAILABLE = True
except Exception:
    PostgresSaver = None
    POSTGRES_AVAILABLE = False


# Global checkpointer instance and state
_checkpointer: Optional[BaseCheckpointSaver] = None
_checkpointer_mode: str = "unknown"
_postgres_available: bool = False


class CheckpointerInitError(Exception):
    """Raised when checkpointer initialization fails."""
    pass


class WorkflowCheckpointerFactory:
    """
    Centralized factory for creating workflow checkpointers with H6 fallback logging.

    Phase 2 H6 Enhancement:
    - Explicit logging when falling back to MemorySaver
    - Impact assessment for mission state persistence
    - Distinguishes between connection failure vs. no configuration
    - Can be imported and reused across all workflows

    Usage:
        from langgraph_compilation.checkpointer import WorkflowCheckpointerFactory
        checkpointer = WorkflowCheckpointerFactory.create(mission_id="my-mission")
    """

    @staticmethod
    def create(mission_id: str = "default", connection_string: Optional[str] = None) -> BaseCheckpointSaver:
        """
        Create checkpointer with enhanced fallback logging.

        Args:
            mission_id: Mission identifier for logging context
            connection_string: Optional explicit connection string (overrides env vars)

        Returns:
            PostgresSaver if available and configured, otherwise MemorySaver
        """
        # Use explicit connection string or fall back to env vars
        db_url = connection_string or os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
        environment = os.getenv("ENVIRONMENT", "development")

        # Case 1: No database URL configured
        if not db_url:
            logger.info(
                "checkpointer_using_memory",
                mission_id=mission_id,
                reason="no_connection_string",
                environment=environment,
                impact="mission_state_not_persisted",
                recovery="restart_will_lose_progress",
                recommendation="Set DATABASE_URL or SUPABASE_DB_URL for persistence",
            )
            return MemorySaver()

        # Case 2: PostgresSaver not available (dependency not installed)
        if not POSTGRES_AVAILABLE:
            logger.warning(
                "checkpointer_fallback_to_memory",
                mission_id=mission_id,
                reason="postgres_dependency_not_installed",
                environment=environment,
                impact="mission_state_not_persisted",
                recovery="restart_will_lose_progress",
                recommendation="Install langgraph[postgres] for persistence",
            )
            return MemorySaver()

        # Case 3: Attempt PostgresSaver connection
        try:
            logger.info(
                "checkpointer_postgres_connecting",
                mission_id=mission_id,
                db_url_redacted=_redact_db_url(db_url),
                environment=environment,
            )
            checkpointer = PostgresSaver.from_conn_string(db_url)
            logger.info(
                "checkpointer_postgres_connected",
                mission_id=mission_id,
                environment=environment,
                persistence="enabled",
            )
            return checkpointer

        except Exception as exc:
            # Case 4: Connection failure - log with full context
            error_type = type(exc).__name__
            error_msg = str(exc)[:200]

            logger.warning(
                "checkpointer_fallback_to_memory",
                mission_id=mission_id,
                error=error_msg,
                error_type=error_type,
                environment=environment,
                impact="mission_state_not_persisted",
                recovery="restart_will_lose_progress",
                action="Check database connectivity and credentials",
                db_url_redacted=_redact_db_url(db_url),
            )

            # Additional warning for production environments
            if environment == "production":
                logger.error(
                    "checkpointer_postgres_failed_critical",
                    mission_id=mission_id,
                    error=error_msg,
                    error_type=error_type,
                    severity="HIGH",
                    impact="Production missions will lose state on restart",
                    action="URGENT: Fix database connection or disable production mode",
                )

            return MemorySaver()


async def get_postgres_checkpointer() -> BaseCheckpointSaver:
    """
    Get or create Postgres checkpointer for LangGraph with H6 fallback logging.

    The checkpointer enables:
    - State persistence across executions
    - Resume from interruptions (e.g., human review)
    - Time-travel debugging
    - Audit trail of execution

    Phase 2 H6 Enhancement:
    - Uses WorkflowCheckpointerFactory for consistent logging
    - Explicit logging when falling back to MemorySaver
    - Distinguishes between intentional fallback vs. connection failure
    - Tracks checkpointer mode for observability

    Returns:
        BaseCheckpointSaver instance (PostgresSaver or MemorySaver fallback)
    """
    global _checkpointer, _checkpointer_mode, _postgres_available

    if _checkpointer is not None:
        return _checkpointer

    # Use factory with async-aware context
    postgres_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL")

    # Create checkpointer using centralized factory
    _checkpointer = WorkflowCheckpointerFactory.create(
        mission_id="graphrag_workflow",
        connection_string=postgres_url
    )

    # Update global state tracking
    if isinstance(_checkpointer, MemorySaver):
        _checkpointer_mode = "memory"
        _postgres_available = False
    else:
        _checkpointer_mode = "postgres"
        _postgres_available = True

    return _checkpointer


def get_checkpointer_status() -> dict:
    """
    Get current checkpointer status for health checks and debugging.

    Phase 2 H6: Provides observability into checkpointer state.

    Returns:
        Dict with mode, postgres_available, and initialized status
    """
    return {
        "initialized": _checkpointer is not None,
        "mode": _checkpointer_mode,
        "postgres_available": _postgres_available,
        "type": type(_checkpointer).__name__ if _checkpointer else None
    }


async def check_checkpointer_health() -> dict:
    """
    Check if checkpointer is healthy and return status.

    Phase 2 H6: Health check for observability and diagnostics.

    Returns:
        Dict with type, healthy status, latency, and error (if any)
    """
    import time

    checkpointer_type = "unknown"
    healthy = False
    latency_ms = None
    error = None

    try:
        checkpointer = await get_postgres_checkpointer()
        checkpointer_type = "postgres" if _postgres_available else "memory"

        # Test basic checkpoint operation
        start_time = time.time()

        if checkpointer_type == "postgres":
            # For PostgresSaver, try a simple operation
            try:
                # This is a lightweight check - just verify connection
                await checkpointer.setup()
                healthy = True
            except Exception as check_err:
                error = str(check_err)[:200]
                healthy = False
        else:
            # MemorySaver is always healthy
            healthy = True

        latency_ms = int((time.time() - start_time) * 1000)

    except Exception as e:
        error = str(e)[:200]
        healthy = False

    result = {
        "type": checkpointer_type,
        "healthy": healthy,
        "latency_ms": latency_ms,
        "error": error,
        "mode": _checkpointer_mode,
    }

    logger.info(
        "checkpointer_health_check",
        **result
    )

    return result


async def initialize_checkpointer_tables():
    """
    Initialize checkpointer tables in database

    This creates the required tables:
    - checkpoint_writes
    - checkpoint_blobs
    """
    try:
        checkpointer = await get_postgres_checkpointer()
        await checkpointer.setup()

        logger.info("checkpointer_tables_initialized")

    except Exception as e:
        logger.error("checkpointer_tables_init_failed", error=str(e))
        raise

