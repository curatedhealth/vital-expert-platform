"""
Memory Service Implementation

Implements IMemoryService for conversation storage and context management.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog

from vital_shared.interfaces.memory_service import IMemoryService
from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class MemoryService(IMemoryService):
    """
    Production implementation of IMemoryService.
    
    Manages conversation history in Supabase.
    """
    
    def __init__(self, db_client: SupabaseClient):
        self.db = db_client
        self.logger = logger.bind(service="MemoryService")
    
    async def save_turn(
        self,
        session_id: str,
        user_message: str,
        assistant_message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Save a conversation turn."""
        try:
            turn_id = f"turn_{session_id}_{datetime.now().timestamp()}"
            
            turn_data = {
                "id": turn_id,
                "session_id": session_id,
                "user_message": user_message,
                "assistant_message": assistant_message,
                "metadata": metadata or {},
                "created_at": datetime.now().isoformat()
            }
            
            self.db.client.table("conversation_turns").insert(turn_data).execute()
            
            self.logger.info("turn_saved", turn_id=turn_id, session_id=session_id)
            return turn_id
            
        except Exception as e:
            self.logger.error("save_turn_failed", error=str(e))
            raise
    
    async def get_session_history(
        self,
        session_id: str,
        max_turns: int = 10
    ) -> List[Dict[str, Any]]:
        """Retrieve conversation history."""
        try:
            result = self.db.client.table("conversation_turns")\
                .select("*")\
                .eq("session_id", session_id)\
                .order("created_at", desc=True)\
                .limit(max_turns)\
                .execute()
            
            turns = result.data if result.data else []
            return list(reversed(turns))  # Return chronological order
            
        except Exception as e:
            self.logger.error("get_history_failed", error=str(e))
            return []
    
    async def get_session_summary(
        self,
        session_id: str
    ) -> Optional[str]:
        """Get AI-generated session summary."""
        try:
            result = self.db.client.table("conversation_sessions")\
                .select("summary")\
                .eq("id", session_id)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0].get("summary")
            return None
            
        except Exception as e:
            self.logger.error("get_summary_failed", error=str(e))
            return None
    
    async def update_session_summary(
        self,
        session_id: str,
        summary: str
    ) -> None:
        """Update session summary."""
        try:
            self.db.client.table("conversation_sessions")\
                .update({"summary": summary})\
                .eq("id", session_id)\
                .execute()
            
            self.logger.info("summary_updated", session_id=session_id)
            
        except Exception as e:
            self.logger.error("update_summary_failed", error=str(e))
    
    async def delete_session(
        self,
        session_id: str
    ) -> bool:
        """Delete a conversation session."""
        try:
            # Delete turns first
            self.db.client.table("conversation_turns")\
                .delete()\
                .eq("session_id", session_id)\
                .execute()
            
            # Delete session
            self.db.client.table("conversation_sessions")\
                .delete()\
                .eq("id", session_id)\
                .execute()
            
            self.logger.info("session_deleted", session_id=session_id)
            return True
            
        except Exception as e:
            self.logger.error("delete_session_failed", error=str(e))
            return False

