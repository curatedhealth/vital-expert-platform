"""
Postgres Checkpointer for LangGraph
Enables state persistence using PostgreSQL via Supabase
"""

from typing import Optional
from langgraph.checkpoint.postgres import PostgresSaver
import structlog

from graphrag.config import get_graphrag_config

logger = structlog.get_logger()


# Global checkpointer instance
_checkpointer: Optional[PostgresSaver] = None


async def get_postgres_checkpointer() -> PostgresSaver:
    """
    Get or create Postgres checkpointer for LangGraph
    
    The checkpointer enables:
    - State persistence across executions
    - Resume from interruptions (e.g., human review)
    - Time-travel debugging
    - Audit trail of execution
    
    Returns:
        PostgresSaver instance
    """
    global _checkpointer
    
    if _checkpointer is None:
        config = get_graphrag_config()
        
        try:
            # Create PostgresSaver with connection string
            _checkpointer = PostgresSaver(
                conn_string=config.database_url
            )
            
            # Initialize checkpointer tables
            await _checkpointer.setup()
            
            logger.info(
                "postgres_checkpointer_initialized",
                database="supabase"
            )
            
        except Exception as e:
            logger.error(
                "postgres_checkpointer_init_failed",
                error=str(e)
            )
            raise
    
    return _checkpointer


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

