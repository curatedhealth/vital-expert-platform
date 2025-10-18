"""
Session Manager with PostgreSQL Checkpointing for VITAL Expert Consultation

Provides persistent session management with LangGraph checkpointing,
session state preservation, and resume capabilities.
"""

from typing import Dict, List, Any, Optional, Union
import asyncio
import json
import uuid
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from langgraph.checkpoint.postgres import PostgresSaver
import asyncpg
from dataclasses import dataclass, asdict

from ..state import AutonomousAgentState, ReasoningStep


@dataclass
class SessionMetadata:
    """Session metadata for tracking and management"""
    session_id: str
    user_id: str
    agent_id: str
    query: str
    mode: str  # 'interactive' or 'autonomous'
    agent_selection_mode: str  # 'automatic' or 'manual'
    status: str  # 'active', 'paused', 'completed', 'failed'
    created_at: datetime
    updated_at: datetime
    total_cost: float = 0.0
    budget: float = 50.0
    max_iterations: int = 10
    current_iteration: int = 0
    reasoning_mode: str = "react"  # 'react' or 'cot'
    context: Dict[str, Any] = None
    error: Optional[str] = None
    
    def __post_init__(self):
        if self.context is None:
            self.context = {}


class SessionManager:
    """Manages consultation sessions with PostgreSQL checkpointing"""
    
    def __init__(
        self, 
        database_url: str,
        redis_client: Optional[Any] = None
    ):
        self.database_url = database_url
        self.redis_client = redis_client
        
        # Initialize PostgreSQL connection
        self.engine = create_async_engine(database_url)
        self.async_session = sessionmaker(
            self.engine, 
            class_=AsyncSession, 
            expire_on_commit=False
        )
        
        # Initialize LangGraph checkpointing
        self.checkpointer = PostgresSaver.from_conn_string(database_url)
        
        # Active sessions cache
        self.active_sessions: Dict[str, SessionMetadata] = {}
    
    async def create_session(
        self,
        user_id: str,
        agent_id: str,
        query: str,
        mode: str = "autonomous",
        agent_selection_mode: str = "automatic",
        budget: float = 50.0,
        max_iterations: int = 10,
        reasoning_mode: str = "react"
    ) -> SessionMetadata:
        """Create a new consultation session"""
        try:
            session_id = str(uuid.uuid4())
            
            # Create session metadata
            session_metadata = SessionMetadata(
                session_id=session_id,
                user_id=user_id,
                agent_id=agent_id,
                query=query,
                mode=mode,
                agent_selection_mode=agent_selection_mode,
                status="active",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                budget=budget,
                max_iterations=max_iterations,
                reasoning_mode=reasoning_mode
            )
            
            # Store in database
            await self._store_session_metadata(session_metadata)
            
            # Cache in memory
            self.active_sessions[session_id] = session_metadata
            
            # Store in Redis for real-time access
            if self.redis_client:
                await self._cache_session_metadata(session_metadata)
            
            return session_metadata
            
        except Exception as e:
            raise Exception(f"Failed to create session: {str(e)}")
    
    async def get_session(self, session_id: str) -> Optional[SessionMetadata]:
        """Get session metadata by ID"""
        try:
            # Check cache first
            if session_id in self.active_sessions:
                return self.active_sessions[session_id]
            
            # Load from database
            session_metadata = await self._load_session_metadata(session_id)
            if session_metadata:
                # Cache for future access
                self.active_sessions[session_id] = session_metadata
                return session_metadata
            
            return None
            
        except Exception as e:
            print(f"Error getting session {session_id}: {e}")
            return None
    
    async def update_session(
        self, 
        session_id: str, 
        updates: Dict[str, Any]
    ) -> bool:
        """Update session metadata"""
        try:
            # Get current session
            session_metadata = await self.get_session(session_id)
            if not session_metadata:
                return False
            
            # Apply updates
            for key, value in updates.items():
                if hasattr(session_metadata, key):
                    setattr(session_metadata, key, value)
            
            session_metadata.updated_at = datetime.utcnow()
            
            # Update database
            await self._update_session_metadata(session_metadata)
            
            # Update cache
            self.active_sessions[session_id] = session_metadata
            
            # Update Redis
            if self.redis_client:
                await self._cache_session_metadata(session_metadata)
            
            return True
            
        except Exception as e:
            print(f"Error updating session {session_id}: {e}")
            return False
    
    async def pause_session(self, session_id: str) -> bool:
        """Pause an active session"""
        return await self.update_session(session_id, {"status": "paused"})
    
    async def resume_session(self, session_id: str) -> bool:
        """Resume a paused session"""
        return await self.update_session(session_id, {"status": "active"})
    
    async def complete_session(
        self, 
        session_id: str, 
        final_cost: float = None,
        error: str = None
    ) -> bool:
        """Mark session as completed"""
        updates = {"status": "completed" if not error else "failed"}
        if final_cost is not None:
            updates["total_cost"] = final_cost
        if error:
            updates["error"] = error
        
        return await self.update_session(session_id, updates)
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session and its data"""
        try:
            # Remove from cache
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
            
            # Remove from Redis
            if self.redis_client:
                await self.redis_client.delete(f"session:{session_id}")
            
            # Remove from database
            await self._delete_session_metadata(session_id)
            
            return True
            
        except Exception as e:
            print(f"Error deleting session {session_id}: {e}")
            return False
    
    async def get_user_sessions(
        self, 
        user_id: str, 
        limit: int = 50,
        status: str = None
    ) -> List[SessionMetadata]:
        """Get all sessions for a user"""
        try:
            async with self.async_session() as session:
                query = text("""
                    SELECT * FROM consultation_sessions 
                    WHERE user_id = :user_id
                """)
                
                params = {"user_id": user_id}
                if status:
                    query = text("""
                        SELECT * FROM consultation_sessions 
                        WHERE user_id = :user_id AND status = :status
                    """)
                    params["status"] = status
                
                query = text(str(query) + " ORDER BY created_at DESC LIMIT :limit")
                params["limit"] = limit
                
                result = await session.execute(query, params)
                rows = result.fetchall()
                
                sessions = []
                for row in rows:
                    session_metadata = SessionMetadata(
                        session_id=row.session_id,
                        user_id=row.user_id,
                        agent_id=row.agent_id,
                        query=row.query,
                        mode=row.mode,
                        agent_selection_mode=row.agent_selection_mode,
                        status=row.status,
                        created_at=row.created_at,
                        updated_at=row.updated_at,
                        total_cost=row.total_cost or 0.0,
                        budget=row.budget or 50.0,
                        max_iterations=row.max_iterations or 10,
                        current_iteration=row.current_iteration or 0,
                        reasoning_mode=row.reasoning_mode or "react",
                        context=json.loads(row.context) if row.context else {},
                        error=row.error
                    )
                    sessions.append(session_metadata)
                
                return sessions
                
        except Exception as e:
            print(f"Error getting user sessions: {e}")
            return []
    
    async def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get reasoning steps history for a session"""
        try:
            async with self.async_session() as session:
                query = text("""
                    SELECT * FROM reasoning_steps 
                    WHERE session_id = :session_id 
                    ORDER BY created_at ASC
                """)
                
                result = await session.execute(query, {"session_id": session_id})
                rows = result.fetchall()
                
                history = []
                for row in rows:
                    step = {
                        "id": row.id,
                        "phase": row.phase,
                        "content": row.content,
                        "timestamp": row.created_at.isoformat(),
                        "metadata": json.loads(row.metadata) if row.metadata else {}
                    }
                    history.append(step)
                
                return history
                
        except Exception as e:
            print(f"Error getting session history: {e}")
            return []
    
    async def save_reasoning_step(
        self, 
        session_id: str, 
        step: ReasoningStep
    ) -> bool:
        """Save a reasoning step to the database"""
        try:
            async with self.async_session() as session:
                query = text("""
                    INSERT INTO reasoning_steps 
                    (session_id, phase, content, metadata, created_at)
                    VALUES (:session_id, :phase, :content, :metadata, :created_at)
                """)
                
                await session.execute(query, {
                    "session_id": session_id,
                    "phase": step["phase"],
                    "content": step["content"],
                    "metadata": json.dumps(step.get("metadata", {})),
                    "created_at": datetime.fromisoformat(step["timestamp"])
                })
                
                await session.commit()
                return True
                
        except Exception as e:
            print(f"Error saving reasoning step: {e}")
            return False
    
    async def get_checkpoint(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get LangGraph checkpoint for session"""
        try:
            # This would integrate with LangGraph's checkpointing system
            # For now, return session state
            session_metadata = await self.get_session(session_id)
            if session_metadata:
                return {
                    "session_id": session_id,
                    "state": asdict(session_metadata),
                    "created_at": session_metadata.created_at.isoformat(),
                    "updated_at": session_metadata.updated_at.isoformat()
                }
            return None
            
        except Exception as e:
            print(f"Error getting checkpoint: {e}")
            return None
    
    async def save_checkpoint(
        self, 
        session_id: str, 
        state: Dict[str, Any]
    ) -> bool:
        """Save LangGraph checkpoint for session"""
        try:
            # Update session with current state
            await self.update_session(session_id, {
                "context": state,
                "current_iteration": state.get("iteration_count", 0),
                "total_cost": state.get("total_cost", 0.0)
            })
            
            return True
            
        except Exception as e:
            print(f"Error saving checkpoint: {e}")
            return False
    
    async def cleanup_old_sessions(self, days_old: int = 30) -> int:
        """Clean up old completed sessions"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            async with self.async_session() as session:
                # Delete old reasoning steps
                query1 = text("""
                    DELETE FROM reasoning_steps 
                    WHERE session_id IN (
                        SELECT session_id FROM consultation_sessions 
                        WHERE status IN ('completed', 'failed') 
                        AND updated_at < :cutoff_date
                    )
                """)
                await session.execute(query1, {"cutoff_date": cutoff_date})
                
                # Delete old sessions
                query2 = text("""
                    DELETE FROM consultation_sessions 
                    WHERE status IN ('completed', 'failed') 
                    AND updated_at < :cutoff_date
                """)
                result = await session.execute(query2, {"cutoff_date": cutoff_date})
                
                await session.commit()
                return result.rowcount
                
        except Exception as e:
            print(f"Error cleaning up old sessions: {e}")
            return 0
    
    async def _store_session_metadata(self, session_metadata: SessionMetadata) -> None:
        """Store session metadata in database"""
        async with self.async_session() as session:
            query = text("""
                INSERT INTO consultation_sessions 
                (session_id, user_id, agent_id, query, mode, agent_selection_mode, 
                 status, created_at, updated_at, total_cost, budget, max_iterations, 
                 current_iteration, reasoning_mode, context, error)
                VALUES (:session_id, :user_id, :agent_id, :query, :mode, :agent_selection_mode,
                        :status, :created_at, :updated_at, :total_cost, :budget, :max_iterations,
                        :current_iteration, :reasoning_mode, :context, :error)
            """)
            
            await session.execute(query, {
                "session_id": session_metadata.session_id,
                "user_id": session_metadata.user_id,
                "agent_id": session_metadata.agent_id,
                "query": session_metadata.query,
                "mode": session_metadata.mode,
                "agent_selection_mode": session_metadata.agent_selection_mode,
                "status": session_metadata.status,
                "created_at": session_metadata.created_at,
                "updated_at": session_metadata.updated_at,
                "total_cost": session_metadata.total_cost,
                "budget": session_metadata.budget,
                "max_iterations": session_metadata.max_iterations,
                "current_iteration": session_metadata.current_iteration,
                "reasoning_mode": session_metadata.reasoning_mode,
                "context": json.dumps(session_metadata.context),
                "error": session_metadata.error
            })
            
            await session.commit()
    
    async def _load_session_metadata(self, session_id: str) -> Optional[SessionMetadata]:
        """Load session metadata from database"""
        async with self.async_session() as session:
            query = text("""
                SELECT * FROM consultation_sessions 
                WHERE session_id = :session_id
            """)
            
            result = await session.execute(query, {"session_id": session_id})
            row = result.fetchone()
            
            if row:
                return SessionMetadata(
                    session_id=row.session_id,
                    user_id=row.user_id,
                    agent_id=row.agent_id,
                    query=row.query,
                    mode=row.mode,
                    agent_selection_mode=row.agent_selection_mode,
                    status=row.status,
                    created_at=row.created_at,
                    updated_at=row.updated_at,
                    total_cost=row.total_cost or 0.0,
                    budget=row.budget or 50.0,
                    max_iterations=row.max_iterations or 10,
                    current_iteration=row.current_iteration or 0,
                    reasoning_mode=row.reasoning_mode or "react",
                    context=json.loads(row.context) if row.context else {},
                    error=row.error
                )
            
            return None
    
    async def _update_session_metadata(self, session_metadata: SessionMetadata) -> None:
        """Update session metadata in database"""
        async with self.async_session() as session:
            query = text("""
                UPDATE consultation_sessions 
                SET status = :status, updated_at = :updated_at, total_cost = :total_cost,
                    current_iteration = :current_iteration, context = :context, error = :error
                WHERE session_id = :session_id
            """)
            
            await session.execute(query, {
                "session_id": session_metadata.session_id,
                "status": session_metadata.status,
                "updated_at": session_metadata.updated_at,
                "total_cost": session_metadata.total_cost,
                "current_iteration": session_metadata.current_iteration,
                "context": json.dumps(session_metadata.context),
                "error": session_metadata.error
            })
            
            await session.commit()
    
    async def _delete_session_metadata(self, session_id: str) -> None:
        """Delete session metadata from database"""
        async with self.async_session() as session:
            # Delete reasoning steps first
            query1 = text("DELETE FROM reasoning_steps WHERE session_id = :session_id")
            await session.execute(query1, {"session_id": session_id})
            
            # Delete session
            query2 = text("DELETE FROM consultation_sessions WHERE session_id = :session_id")
            await session.execute(query2, {"session_id": session_id})
            
            await session.commit()
    
    async def _cache_session_metadata(self, session_metadata: SessionMetadata) -> None:
        """Cache session metadata in Redis"""
        if self.redis_client:
            key = f"session:{session_metadata.session_id}"
            data = json.dumps(asdict(session_metadata), default=str)
            await self.redis_client.setex(key, 3600, data)  # 1 hour TTL
    
    async def close(self):
        """Close database connections"""
        await self.engine.dispose()
