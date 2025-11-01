"""
Conversation Manager for Interactive Modes (Modes 1 & 2)

Manages conversation history for multi-turn chat workflows.
Handles loading, saving, formatting, and trimming conversations.

Features:
- Load conversation history from Supabase
- Save conversation turns with metadata
- Format conversations for LLM context
- Trim conversations to fit context window
- Track conversation metadata and stats
- Tenant-aware (Golden Rule #3)

Usage:
    >>> manager = ConversationManager(supabase_client)
    >>> conversation = await manager.load_conversation(
    ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
    ...     session_id="session_123"
    ... )
    >>> await manager.save_turn(
    ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
    ...     session_id="session_123",
    ...     user_message="What are FDA requirements?",
    ...     assistant_message="FDA requires...",
    ...     agent_id="regulatory_expert",
    ...     metadata={"model": "gpt-4", "tokens": 1500}
    ... )
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import structlog
from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class ConversationManager:
    """
    Manages conversation history for interactive chat modes.
    
    Golden Rules Compliance:
    - ✅ Tenant-aware (Golden Rule #3)
    - ✅ All database queries include tenant_id
    - ✅ Error handling with graceful degradation
    """
    
    def __init__(self, supabase_client: SupabaseClient):
        """
        Initialize conversation manager.
        
        Args:
            supabase_client: Initialized Supabase client
        """
        self.supabase = supabase_client
        self.max_context_tokens = 8000  # Default context window
    
    async def load_conversation(
        self,
        tenant_id: str,
        session_id: str,
        limit: int = 50
    ) -> List[Dict[str, str]]:
        """
        Load conversation history from database.
        
        Golden Rule #3: tenant_id is REQUIRED
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            session_id: Session identifier
            limit: Maximum number of turns to load
            
        Returns:
            List of conversation turns [{"role": "user", "content": "..."}]
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            # Query conversation history with tenant isolation
            result = await self.supabase.client.table('conversations') \
                .select('*') \
                .eq('tenant_id', tenant_id) \
                .eq('session_id', session_id) \
                .order('created_at', desc=False) \
                .limit(limit) \
                .execute()
            
            if not result.data:
                logger.info(
                    "No conversation history found",
                    tenant_id=tenant_id[:8],
                    session_id=session_id
                )
                return []
            
            # Format as conversation turns
            conversation = []
            for turn in result.data:
                # User message
                if turn.get('user_message'):
                    conversation.append({
                        'role': 'user',
                        'content': turn['user_message']
                    })
                
                # Assistant message
                if turn.get('assistant_message'):
                    conversation.append({
                        'role': 'assistant',
                        'content': turn['assistant_message']
                    })
            
            logger.info(
                "Conversation history loaded",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                turns=len(conversation)
            )
            
            return conversation
            
        except Exception as e:
            logger.error(
                "Failed to load conversation history",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                error=str(e)
            )
            # Graceful degradation - return empty conversation
            return []
    
    async def save_turn(
        self,
        tenant_id: str,
        session_id: str,
        user_message: str,
        assistant_message: str,
        agent_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Save conversation turn to database.
        
        Golden Rule #3: tenant_id is REQUIRED
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            session_id: Session identifier
            user_message: User's message
            assistant_message: Assistant's response
            agent_id: Agent that generated response
            metadata: Optional metadata (model, tokens, confidence, etc.)
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            # Prepare conversation turn data
            turn_data = {
                'tenant_id': tenant_id,
                'session_id': session_id,
                'user_message': user_message,
                'assistant_message': assistant_message,
                'agent_id': agent_id,
                'metadata': metadata or {},
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Insert conversation turn
            result = await self.supabase.client.table('conversations') \
                .insert(turn_data) \
                .execute()
            
            logger.info(
                "Conversation turn saved",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                agent_id=agent_id
            )
            
            return True
            
        except Exception as e:
            logger.error(
                "Failed to save conversation turn",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                error=str(e)
            )
            return False
    
    def format_for_llm(
        self,
        conversation: List[Dict[str, str]],
        max_tokens: Optional[int] = None,
        include_system_prompt: bool = True,
        system_prompt: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        Format conversation history for LLM context.
        
        Trims conversation to fit within context window if needed.
        
        Args:
            conversation: List of conversation turns
            max_tokens: Maximum tokens (default: self.max_context_tokens)
            include_system_prompt: Whether to include system prompt
            system_prompt: Custom system prompt (optional)
            
        Returns:
            Formatted conversation with system prompt (if included)
        """
        max_tokens = max_tokens or self.max_context_tokens
        
        # Estimate tokens (rough: 1 token ≈ 4 characters)
        estimated_tokens = sum(len(turn['content']) // 4 for turn in conversation)
        
        # If within limit, return as-is
        if estimated_tokens <= max_tokens:
            formatted = conversation.copy()
        else:
            # Trim from beginning, keeping most recent messages
            formatted = []
            current_tokens = 0
            
            # Iterate from most recent (reverse)
            for turn in reversed(conversation):
                turn_tokens = len(turn['content']) // 4
                
                if current_tokens + turn_tokens <= max_tokens:
                    formatted.insert(0, turn)
                    current_tokens += turn_tokens
                else:
                    break
            
            logger.info(
                "Conversation trimmed to fit context",
                original_turns=len(conversation),
                trimmed_turns=len(formatted),
                estimated_tokens=current_tokens
            )
        
        # Add system prompt if requested
        if include_system_prompt:
            default_system = "You are a helpful medical and regulatory expert assistant."
            formatted.insert(0, {
                'role': 'system',
                'content': system_prompt or default_system
            })
        
        return formatted
    
    async def get_conversation_metadata(
        self,
        tenant_id: str,
        session_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get conversation metadata and statistics.
        
        Args:
            tenant_id: Tenant UUID
            session_id: Session identifier
            
        Returns:
            Metadata dictionary or None if not found
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            result = await self.supabase.client.table('conversations') \
                .select('*') \
                .eq('tenant_id', tenant_id) \
                .eq('session_id', session_id) \
                .execute()
            
            if not result.data:
                return None
            
            # Calculate statistics
            total_turns = len(result.data)
            agents_used = list(set(turn['agent_id'] for turn in result.data if turn.get('agent_id')))
            
            first_turn = min(result.data, key=lambda t: t['created_at'])
            last_turn = max(result.data, key=lambda t: t['created_at'])
            
            return {
                'session_id': session_id,
                'total_turns': total_turns,
                'agents_used': agents_used,
                'started_at': first_turn['created_at'],
                'last_updated': last_turn['created_at']
            }
            
        except Exception as e:
            logger.error(
                "Failed to get conversation metadata",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                error=str(e)
            )
            return None
    
    async def delete_conversation(
        self,
        tenant_id: str,
        session_id: str
    ) -> bool:
        """
        Delete entire conversation history.
        
        Golden Rule #3: tenant_id ensures isolation
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            session_id: Session identifier
            
        Returns:
            True if successful, False otherwise
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            await self.supabase.client.table('conversations') \
                .delete() \
                .eq('tenant_id', tenant_id) \
                .eq('session_id', session_id) \
                .execute()
            
            logger.info(
                "Conversation deleted",
                tenant_id=tenant_id[:8],
                session_id=session_id
            )
            
            return True
            
        except Exception as e:
            logger.error(
                "Failed to delete conversation",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                error=str(e)
            )
            return False

