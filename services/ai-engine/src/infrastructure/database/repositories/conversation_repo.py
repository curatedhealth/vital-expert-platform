"""
VITAL Path - Conversation Repository

Data access for conversation management.
Handles conversation CRUD and message history.

PRODUCTION VERSION: Uses PostgreSQL via Supabase for persistence.
"""

import logging
import json
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass, field, asdict
from uuid import uuid4

from services.tenant_aware_supabase import TenantAwareSupabaseClient

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

    @classmethod
    def from_db_row(cls, row: Dict[str, Any]) -> "Message":
        """Create Message from database row."""
        return cls(
            id=row["id"],
            conversation_id=row["conversation_id"],
            role=row["role"],
            content=row["content"],
            created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")) if isinstance(row["created_at"], str) else row["created_at"],
            metadata=row.get("metadata") or {},
            agent_id=row.get("agent_id"),
            tokens_used=row.get("tokens_used"),
            model=row.get("model"),
            citations=row.get("citations"),
            thinking=row.get("thinking"),
        )


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

    @classmethod
    def from_db_row(cls, row: Dict[str, Any]) -> "Conversation":
        """Create Conversation from database row."""
        return cls(
            id=row["id"],
            tenant_id=row["tenant_id"],
            user_id=row["user_id"],
            title=row.get("title"),
            created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")) if isinstance(row["created_at"], str) else row["created_at"],
            updated_at=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00")) if row.get("updated_at") and isinstance(row["updated_at"], str) else row.get("updated_at"),
            agent_id=row.get("agent_id"),
            mode=row.get("mode", 1),
            status=row.get("status", "active"),
            message_count=row.get("message_count", 0),
            total_tokens=row.get("total_tokens", 0),
            metadata=row.get("metadata") or {},
        )


class ConversationRepository:
    """
    Repository for conversation management.

    Provides CRUD operations for conversations and messages.
    Uses PostgreSQL via Supabase for persistence.
    """

    # Table names
    CONVERSATIONS_TABLE = "conversations"
    MESSAGES_TABLE = "conversation_messages"

    def __init__(self, db_client: TenantAwareSupabaseClient):
        """
        Initialize repository with database client.

        Args:
            db_client: Tenant-aware Supabase client for database operations
        """
        self._db = db_client

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
        now = datetime.now(timezone.utc)

        data = {
            "id": conversation_id,
            "user_id": user_id,
            "title": title,
            "created_at": now.isoformat(),
            "agent_id": agent_id,
            "mode": mode,
            "status": "active",
            "message_count": 0,
            "total_tokens": 0,
            "metadata": metadata or {},
        }

        # Insert via tenant-aware client (adds tenant_id automatically)
        result = await self._db.insert(self.CONVERSATIONS_TABLE, data)

        logger.info(f"Created conversation {conversation_id} for user {user_id}")

        return Conversation.from_db_row(result)

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
        query = self._db.query(self.CONVERSATIONS_TABLE)
        result = query.eq("id", conversation_id).execute()

        if not result.data:
            return None

        conversation = Conversation.from_db_row(result.data[0])

        if include_messages:
            messages = await self.get_messages(conversation_id, limit=message_limit)
            conversation.messages = messages

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
        # Build update data
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}

        if title is not None:
            update_data["title"] = title

        if status is not None:
            update_data["status"] = status

        if metadata is not None:
            # Merge metadata - fetch current first
            current = await self.get(conversation_id)
            if current:
                merged_metadata = {**current.metadata, **metadata}
                update_data["metadata"] = merged_metadata

        try:
            result = await self._db.update(
                self.CONVERSATIONS_TABLE,
                conversation_id,
                update_data
            )
            return Conversation.from_db_row(result)
        except ValueError:
            # Record not found
            return None

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
        now = datetime.now(timezone.utc)

        # Get conversation's tenant_id for the message
        conversation = await self.get(conversation_id)
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")

        message_data = {
            "id": message_id,
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "created_at": now.isoformat(),
            "agent_id": agent_id,
            "tokens_used": tokens_used,
            "model": model,
            "citations": citations,
            "thinking": thinking,
            "metadata": metadata or {},
        }

        # Insert message
        result = await self._db.insert(self.MESSAGES_TABLE, message_data)

        # Update conversation stats
        new_message_count = conversation.message_count + 1
        new_total_tokens = conversation.total_tokens + (tokens_used or 0)

        await self._db.update(
            self.CONVERSATIONS_TABLE,
            conversation_id,
            {
                "message_count": new_message_count,
                "total_tokens": new_total_tokens,
                "updated_at": now.isoformat(),
            }
        )

        logger.debug(f"Added {role} message to conversation {conversation_id}")

        return Message.from_db_row(result)

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
        query = self._db.query(self.MESSAGES_TABLE)
        query = query.eq("conversation_id", conversation_id)

        if role:
            query = query.eq("role", role)

        query = query.order("created_at", desc=False)
        query = query.range(offset, offset + limit - 1)

        result = query.execute()

        return [Message.from_db_row(row) for row in (result.data or [])]

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
        # Get recent messages
        query = self._db.query(self.MESSAGES_TABLE)
        query = query.eq("conversation_id", conversation_id)
        query = query.order("created_at", desc=True)
        query = query.limit(max_messages)

        result = query.execute()

        if not result.data:
            return []

        # Reverse to get chronological order
        messages = [Message.from_db_row(row) for row in reversed(result.data)]

        # Estimate tokens and trim if needed
        # Simple estimation: 4 chars per token
        total_chars = sum(len(m.content) for m in messages)
        estimated_tokens = total_chars // 4

        while estimated_tokens > max_tokens and len(messages) > 1:
            messages = messages[1:]  # Remove oldest message
            total_chars = sum(len(m.content) for m in messages)
            estimated_tokens = total_chars // 4

        return messages

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
        # Build query
        query = self._db.query(self.CONVERSATIONS_TABLE)
        query = query.eq("user_id", user_id)

        if status:
            query = query.eq("status", status)

        if agent_id:
            query = query.eq("agent_id", agent_id)

        # Get total count first
        count_result = query.execute()
        total = len(count_result.data) if count_result.data else 0

        # Apply pagination and ordering
        query = self._db.query(self.CONVERSATIONS_TABLE)
        query = query.eq("user_id", user_id)

        if status:
            query = query.eq("status", status)

        if agent_id:
            query = query.eq("agent_id", agent_id)

        query = query.order("updated_at", desc=True)
        query = query.range(offset, offset + limit - 1)

        result = query.execute()

        conversations = [Conversation.from_db_row(row) for row in (result.data or [])]

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
        if soft:
            result = await self.update(conversation_id, status="deleted")
            if result:
                logger.info(f"Soft deleted conversation {conversation_id}")
                return True
            return False
        else:
            # Hard delete - remove messages first, then conversation
            try:
                # Delete messages
                messages_query = self._db._client.client.table(self.MESSAGES_TABLE)
                messages_query.delete().eq("conversation_id", conversation_id).execute()

                # Delete conversation
                await self._db.delete(self.CONVERSATIONS_TABLE, conversation_id)

                logger.info(f"Hard deleted conversation {conversation_id}")
                return True
            except Exception as e:
                logger.error(f"Failed to hard delete conversation {conversation_id}: {e}")
                return False

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
        # Use PostgreSQL full-text search via Supabase
        search_query = self._db.query(self.MESSAGES_TABLE)
        search_query = search_query.ilike("content", f"%{query}%")
        search_query = search_query.limit(limit)

        result = search_query.execute()

        messages = [Message.from_db_row(row) for row in (result.data or [])]

        # Filter by user if specified (via conversation lookup)
        if user_id and messages:
            # Get conversation IDs for user's conversations
            conv_query = self._db.query(self.CONVERSATIONS_TABLE)
            conv_query = conv_query.eq("user_id", user_id)
            conv_result = conv_query.execute()

            user_conv_ids = {row["id"] for row in (conv_result.data or [])}
            messages = [m for m in messages if m.conversation_id in user_conv_ids]

        return messages[:limit]


# Factory function for dependency injection
def create_conversation_repository(db_client: TenantAwareSupabaseClient) -> ConversationRepository:
    """
    Create a ConversationRepository instance.

    Args:
        db_client: Tenant-aware Supabase client

    Returns:
        ConversationRepository instance
    """
    return ConversationRepository(db_client)





