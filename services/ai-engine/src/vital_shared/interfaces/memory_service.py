"""
Memory Service Interface

Defines the contract for conversation memory and context management.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class IMemoryService(ABC):
    """Interface for conversation memory operations."""
    
    @abstractmethod
    async def save_turn(
        self,
        session_id: str,
        user_message: str,
        assistant_message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Save a conversation turn.
        
        Args:
            session_id: Session identifier
            user_message: User's message
            assistant_message: Assistant's response
            metadata: Additional metadata (citations, tools used, cost, etc.)
            
        Returns:
            Turn ID
        """
        pass
    
    @abstractmethod
    async def get_session_history(
        self,
        session_id: str,
        max_turns: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Retrieve conversation history for a session.
        
        Args:
            session_id: Session to retrieve
            max_turns: Maximum number of turns to return
            
        Returns:
            List of conversation turns (most recent first)
        """
        pass
    
    @abstractmethod
    async def get_session_summary(
        self,
        session_id: str
    ) -> Optional[str]:
        """
        Get AI-generated summary of conversation.
        
        Args:
            session_id: Session to summarize
            
        Returns:
            Summary text or None
        """
        pass
    
    @abstractmethod
    async def update_session_summary(
        self,
        session_id: str,
        summary: str
    ) -> None:
        """
        Update session summary.
        
        Args:
            session_id: Session to update
            summary: New summary text
        """
        pass
    
    @abstractmethod
    async def delete_session(
        self,
        session_id: str
    ) -> bool:
        """
        Delete a conversation session.
        
        Args:
            session_id: Session to delete
            
        Returns:
            True if successful
        """
        pass

