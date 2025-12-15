"""
Postgres Checkpointer for LangGraph

Implements LangGraph checkpointing interface using PostgreSQL for:
- State persistence between steps
- Time-travel debugging
- Recovery from failures
- Training data collection

Uses the existing `agent_state` table from AgentOS 3.0 Phase 0 schema.
"""

from typing import Optional, Dict, Any, Iterator
from uuid import UUID, uuid4
import json
import asyncpg

from langgraph.checkpoint.base import BaseCheckpointSaver, Checkpoint
from ..graphrag.clients import get_postgres_client
from ..graphrag.utils.logger import get_logger

logger = get_logger(__name__)


class PostgresCheckpointer(BaseCheckpointSaver):
    """
    PostgreSQL-based checkpoint saver for LangGraph.
    
    Stores checkpoints in the `agent_state` table:
    - agent_id: Agent executing the graph
    - graph_id: Graph being executed
    - session_id: Unique session identifier
    - step_index: Step number in execution
    - node_id: Current node being executed
    - state: Serialized LangGraph state (JSONB)
    """
    
    def __init__(self):
        self.pg_client = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize PostgreSQL client"""
        if self._initialized:
            return
            
        logger.info("Initializing Postgres checkpointer...")
        self.pg_client = await get_postgres_client()
        self._initialized = True
        logger.info("Postgres checkpointer initialized")
        
    async def aget(
        self,
        config: Dict[str, Any]
    ) -> Optional[Checkpoint]:
        """
        Get checkpoint for a given configuration.
        
        Config keys:
        - session_id: Session to retrieve
        - step_index: Optional step index (default: latest)
        """
        if not self._initialized:
            await self.initialize()
            
        session_id = config.get('session_id')
        if not session_id:
            return None
            
        step_index = config.get('step_index')
        
        query = """
            SELECT 
                id, agent_id, graph_id, session_id, step_index,
                node_id, state, created_at
            FROM agent_state
            WHERE session_id = $1
        """
        
        params = [session_id]
        
        if step_index is not None:
            query += " AND step_index = $2"
            params.append(step_index)
        else:
            query += " ORDER BY step_index DESC LIMIT 1"
            
        try:
            async with self.pg_client.acquire() as conn:
                row = await conn.fetchrow(query, *params)
                
            if not row:
                return None
                
            # Convert to LangGraph Checkpoint format
            checkpoint = Checkpoint(
                v=1,
                id=str(row['id']),
                ts=str(row['created_at']),
                channel_values=row['state'],  # LangGraph state
                channel_versions={},  # Not tracking versions yet
                versions_seen={},
            )
            
            logger.debug(
                f"Retrieved checkpoint: session={session_id}, "
                f"step={row['step_index']}"
            )
            
            return checkpoint
            
        except Exception as e:
            logger.error(f"Error retrieving checkpoint: {e}")
            return None
            
    async def aput(
        self,
        config: Dict[str, Any],
        checkpoint: Checkpoint,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Save checkpoint to PostgreSQL.
        
        Config keys:
        - session_id: Session identifier
        - agent_id: Agent executing graph
        - graph_id: Graph being executed
        - node_id: Current node (optional)
        """
        if not self._initialized:
            await self.initialize()
            
        session_id = config.get('session_id')
        agent_id = config.get('agent_id')
        graph_id = config.get('graph_id')
        node_id = config.get('node_id')
        
        if not session_id:
            raise ValueError("session_id required in config")
            
        # Determine next step index
        step_index = await self._get_next_step_index(session_id)
        
        query = """
            INSERT INTO agent_state (
                id, agent_id, graph_id, session_id, step_index,
                node_id, state, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING id
        """
        
        checkpoint_id = uuid4()
        
        try:
            async with self.pg_client.acquire() as conn:
                await conn.execute(
                    query,
                    checkpoint_id,
                    agent_id,
                    graph_id,
                    session_id,
                    step_index,
                    node_id,
                    json.dumps(checkpoint.channel_values)
                )
                
            logger.debug(
                f"Saved checkpoint: session={session_id}, "
                f"step={step_index}, node={node_id}"
            )
            
            return {
                "configurable": {
                    "thread_id": session_id,
                    "checkpoint_id": str(checkpoint_id)
                }
            }
            
        except Exception as e:
            logger.error(f"Error saving checkpoint: {e}")
            raise
            
    async def _get_next_step_index(self, session_id: UUID) -> int:
        """Get next step index for a session"""
        query = """
            SELECT COALESCE(MAX(step_index), -1) + 1 as next_step
            FROM agent_state
            WHERE session_id = $1
        """
        
        try:
            async with self.pg_client.acquire() as conn:
                row = await conn.fetchrow(query, session_id)
                return row['next_step'] if row else 0
        except Exception as e:
            logger.error(f"Error getting next step index: {e}")
            return 0
            
    async def alist(
        self,
        config: Dict[str, Any]
    ) -> Iterator[Checkpoint]:
        """
        List all checkpoints for a session.
        
        Useful for time-travel debugging.
        """
        if not self._initialized:
            await self.initialize()
            
        session_id = config.get('session_id')
        if not session_id:
            return
            
        query = """
            SELECT 
                id, agent_id, graph_id, session_id, step_index,
                node_id, state, created_at
            FROM agent_state
            WHERE session_id = $1
            ORDER BY step_index ASC
        """
        
        try:
            async with self.pg_client.acquire() as conn:
                rows = await conn.fetch(query, session_id)
                
            for row in rows:
                checkpoint = Checkpoint(
                    v=1,
                    id=str(row['id']),
                    ts=str(row['created_at']),
                    channel_values=row['state'],
                    channel_versions={},
                    versions_seen={},
                )
                yield checkpoint
                
        except Exception as e:
            logger.error(f"Error listing checkpoints: {e}")
            
    async def get_session_history(
        self,
        session_id: UUID
    ) -> List[Dict[str, Any]]:
        """
        Get full execution history for a session.
        
        Returns list of states with metadata.
        Useful for debugging and analysis.
        """
        if not self._initialized:
            await self.initialize()
            
        query = """
            SELECT 
                id, agent_id, graph_id, session_id, step_index,
                node_id, state, created_at
            FROM agent_state
            WHERE session_id = $1
            ORDER BY step_index ASC
        """
        
        try:
            async with self.pg_client.acquire() as conn:
                rows = await conn.fetch(query, session_id)
                
            return [
                {
                    'id': str(row['id']),
                    'agent_id': str(row['agent_id']) if row['agent_id'] else None,
                    'graph_id': str(row['graph_id']) if row['graph_id'] else None,
                    'session_id': str(row['session_id']),
                    'step_index': row['step_index'],
                    'node_id': str(row['node_id']) if row['node_id'] else None,
                    'state': row['state'],
                    'created_at': str(row['created_at'])
                }
                for row in rows
            ]
            
        except Exception as e:
            logger.error(f"Error getting session history: {e}")
            return []
            
    async def delete_session(self, session_id: UUID) -> bool:
        """
        Delete all checkpoints for a session.
        
        Useful for cleanup and GDPR compliance.
        """
        if not self._initialized:
            await self.initialize()
            
        query = """
            DELETE FROM agent_state
            WHERE session_id = $1
        """
        
        try:
            async with self.pg_client.acquire() as conn:
                result = await conn.execute(query, session_id)
                
            logger.info(f"Deleted session checkpoints: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
            return False
            
    async def get_latest_state(
        self,
        session_id: UUID
    ) -> Optional[Dict[str, Any]]:
        """
        Get the latest state for a session.
        
        Convenience method for resuming interrupted sessions.
        """
        if not self._initialized:
            await self.initialize()
            
        query = """
            SELECT state, step_index, node_id, created_at
            FROM agent_state
            WHERE session_id = $1
            ORDER BY step_index DESC
            LIMIT 1
        """
        
        try:
            async with self.pg_client.acquire() as conn:
                row = await conn.fetchrow(query, session_id)
                
            if not row:
                return None
                
            return {
                'state': row['state'],
                'step_index': row['step_index'],
                'node_id': str(row['node_id']) if row['node_id'] else None,
                'created_at': str(row['created_at'])
            }
            
        except Exception as e:
            logger.error(f"Error getting latest state: {e}")
            return None


# Singleton instance
_postgres_checkpointer: Optional[PostgresCheckpointer] = None


async def get_postgres_checkpointer() -> PostgresCheckpointer:
    """Get or create Postgres checkpointer singleton"""
    global _postgres_checkpointer
    if _postgres_checkpointer is None:
        _postgres_checkpointer = PostgresCheckpointer()
        await _postgres_checkpointer.initialize()
    return _postgres_checkpointer


async def close_postgres_checkpointer() -> None:
    """Close Postgres checkpointer"""
    global _postgres_checkpointer
    if _postgres_checkpointer is not None:
        # Checkpointer shares PG client, don't close it
        _postgres_checkpointer = None

