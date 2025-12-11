"""
VITAL Path - Conversation Repository

Data access for conversation management.
Handles conversation CRUD and message history.
"""

import logging
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass, field
from uuid import uuid4

logger = logging.getLogger(__name__)


@dataclass
class Message:
    """Message entity within a conversation."""
    id: str
    conversation_id: str
    role: str  # user, assistant, system
    content: str
    created_at: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Optional fields for assistant messages
    agent_id: Optional[str] = None
    tokens_used: Optional[int] = None
    model: Optional[str] = None
    citations: Optional[List[Dict[str, Any]]] = None
    thinking: Optional[List[str]] = None


@dataclass
class Conversation:
    """Conversation entity representing a chat session."""
    id: str
    tenant_id: str
    user_id: str
    title: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Conversation configuration
    agent_id: Optional[str] = None  # Primary agent for the conversation
    mode: int = 1  # Expert mode (1-4)
    
    # State
    status: str = "active"  # active, archived, deleted
    message_count: int = 0
    total_tokens: int = 0
    
    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Messages (loaded separately)
    messages: List[Message] = field(default_factory=list)


class ConversationRepository:
    """
    Repository for conversation management.
    
    Provides CRUD operations for conversations and messages.
    """
    
    # In-memory store for development (replace with actual DB)
    _conversations: Dict[str, Conversation] = {}
    _messages: Dict[str, List[Message]] = {}
    
    async def create(
        self,
        tenant_id: str,
        user_id: str,
        agent_id: str = None,
        mode: int = 1,
        title: str = None,
        metadata: Dict[str, Any] = None,
    ) -> Conversation:
        """
        Create a new conversation.
        
        Args:
            tenant_id: Tenant for the conversation
            user_id: User who owns the conversation
            agent_id: Primary agent for the conversation
            mode: Expert mode (1-4)
            title: Optional title
            metadata: Additional metadata
        
        Returns:
            Created conversation
        """
        conversation_id = str(uuid4())
        now = datetime.utcnow()
        
        conversation = Conversation(
            id=conversation_id,
            tenant_id=tenant_id,
            user_id=user_id,
            title=title,
            created_at=now,
            agent_id=agent_id,
            mode=mode,
            metadata=metadata or {},
        )
        
        # TODO: Replace with actual database insert
        self._conversations[conversation_id] = conversation
        self._messages[conversation_id] = []
        
        logger.info(f"Created conversation {conversation_id} for user {user_id}")
        
        return conversation
    
    async def get(
        self,
        conversation_id: str,
        include_messages: bool = False,
        message_limit: int = 50,
    ) -> Optional[Conversation]:
        """
        Get a conversation by ID.
        
        Args:
            conversation_id: The conversation ID
            include_messages: Whether to load messages
            message_limit: Max messages to load
        
        Returns:
            Conversation if found, None otherwise
        """
        # TODO: Replace with actual database query
        conversation = self._conversations.get(conversation_id)
        
        if conversation and include_messages:
            messages = self._messages.get(conversation_id, [])
            conversation.messages = messages[-message_limit:]
        
        return conversation
    
    async def update(
        self,
        conversation_id: str,
        title: str = None,
        status: str = None,
        metadata: Dict[str, Any] = None,
    ) -> Optional[Conversation]:
        """
        Update conversation fields.
        
        Args:
            conversation_id: The conversation ID
            title: New title (optional)
            status: New status (optional)
            metadata: Metadata to merge (optional)
        
        Returns:
            Updated conversation or None if not found
        """
        conversation = self._conversations.get(conversation_id)
        
        if not conversation:
            return None
        
        if title is not None:
            conversation.title = title
        
        if status is not None:
            conversation.status = status
        
        if metadata is not None:
            conversation.metadata.update(metadata)
        
        conversation.updated_at = datetime.utcnow()
        
        # TODO: Replace with actual database update
        
        return conversation
    
    async def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        agent_id: str = None,
        tokens_used: int = None,
        model: str = None,
        citations: List[Dict[str, Any]] = None,
        thinking: List[str] = None,
        metadata: Dict[str, Any] = None,
    ) -> Message:
        """
        Add a message to a conversation.
        
        Args:
            conversation_id: The conversation ID
            role: Message role (user, assistant, system)
            content: Message content
            agent_id: Agent ID (for assistant messages)
            tokens_used: Tokens consumed
            model: Model used
            citations: Source citations
            thinking: Reasoning steps
            metadata: Additional metadata
        
        Returns:
            Created message
        """
        message_id = str(uuid4())
        now = datetime.utcnow()
        
        message = Message(
            id=message_id,
            conversation_id=conversation_id,
            role=role,
            content=content,
            created_at=now,
            agent_id=agent_id,
            tokens_used=tokens_used,
            model=model,
            citations=citations,
            thinking=thinking,
            metadata=metadata or {},
        )
        
        # TODO: Replace with actual database insert
        if conversation_id not in self._messages:
            self._messages[conversation_id] = []
        
        self._messages[conversation_id].append(message)
        
        # Update conversation stats
        conversation = self._conversations.get(conversation_id)
        if conversation:
            conversation.message_count += 1
            if tokens_used:
                conversation.total_tokens += tokens_used
            conversation.updated_at = now
        
        logger.debug(f"Added {role} message to conversation {conversation_id}")
        
        return message
    
    async def get_messages(
        self,
        conversation_id: str,
        limit: int = 50,
        offset: int = 0,
        role: str = None,
    ) -> List[Message]:
        """
        Get messages from a conversation.
        
        Args:
            conversation_id: The conversation ID
            limit: Maximum messages to return
            offset: Number of messages to skip
            role: Filter by role (optional)
        
        Returns:
            List of messages
        """
        # TODO: Replace with actual database query
        messages = self._messages.get(conversation_id, [])
        
        if role:
            messages = [m for m in messages if m.role == role]
        
        # Apply pagination
        messages = messages[offset:offset + limit]
        
        return messages
    
    async def get_context_window(
        self,
        conversation_id: str,
        max_messages: int = 20,
        max_tokens: int = 8000,
    ) -> List[Message]:
        """
        Get messages for LLM context window.
        
        Returns recent messages that fit within token limit.
        
        Args:
            conversation_id: The conversation ID
            max_messages: Maximum messages to include
            max_tokens: Maximum token budget
        
        Returns:
            List of messages for context
        """
        # TODO: Replace with actual database query
        messages = self._messages.get(conversation_id, [])
        
        # Get last N messages
        recent = messages[-max_messages:]
        
        # Estimate tokens and trim if needed
        # Simple estimation: 4 chars per token
        total_chars = sum(len(m.content) for m in recent)
        estimated_tokens = total_chars // 4
        
        while estimated_tokens > max_tokens and len(recent) > 1:
            recent = recent[1:]  # Remove oldest message
            total_chars = sum(len(m.content) for m in recent)
            estimated_tokens = total_chars // 4
        
        return recent
    
    async def list_for_user(
        self,
        user_id: str,
        tenant_id: str,
        status: str = None,
        agent_id: str = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[Conversation], int]:
        """
        List conversations for a user.
        
        Args:
            user_id: User ID
            tenant_id: Tenant ID
            status: Filter by status
            agent_id: Filter by agent
            limit: Number of conversations to return
            offset: Number to skip
        
        Returns:
            Tuple of (conversations list, total count)
        """
        # TODO: Replace with actual database query
        conversations = [
            c for c in self._conversations.values()
            if c.user_id == user_id and c.tenant_id == tenant_id
        ]
        
        if status:
            conversations = [c for c in conversations if c.status == status]
        
        if agent_id:
            conversations = [c for c in conversations if c.agent_id == agent_id]
        
        # Sort by updated_at descending
        conversations.sort(
            key=lambda c: c.updated_at or c.created_at,
            reverse=True,
        )
        
        total = len(conversations)
        conversations = conversations[offset:offset + limit]
        
        return conversations, total
    
    async def delete(self, conversation_id: str, soft: bool = True) -> bool:
        """
        Delete a conversation.
        
        Args:
            conversation_id: The conversation ID
            soft: If True, mark as deleted; if False, remove completely
        
        Returns:
            True if deleted, False if not found
        """
        conversation = self._conversations.get(conversation_id)
        
        if not conversation:
            return False
        
        if soft:
            conversation.status = "deleted"
            conversation.updated_at = datetime.utcnow()
        else:
            del self._conversations[conversation_id]
            if conversation_id in self._messages:
                del self._messages[conversation_id]
        
        logger.info(f"{'Soft' if soft else 'Hard'} deleted conversation {conversation_id}")
        
        return True
    
    async def archive(self, conversation_id: str) -> Optional[Conversation]:
        """
        Archive a conversation.
        
        Args:
            conversation_id: The conversation ID
        
        Returns:
            Updated conversation or None if not found
        """
        return await self.update(conversation_id, status="archived")
    
    async def search_messages(
        self,
        tenant_id: str,
        query: str,
        user_id: str = None,
        limit: int = 20,
    ) -> List[Message]:
        """
        Search messages across conversations.
        
        Args:
            tenant_id: Tenant ID
            query: Search query
            user_id: Optional user filter
            limit: Maximum results
        
        Returns:
            List of matching messages
        """
        # TODO: Replace with actual full-text search
        results = []
        query_lower = query.lower()
        
        for conv_id, messages in self._messages.items():
            conversation = self._conversations.get(conv_id)
            
            if not conversation or conversation.tenant_id != tenant_id:
                continue
            
            if user_id and conversation.user_id != user_id:
                continue
            
            for message in messages:
                if query_lower in message.content.lower():
                    results.append(message)
                    
                    if len(results) >= limit:
                        return results
        
        return results






