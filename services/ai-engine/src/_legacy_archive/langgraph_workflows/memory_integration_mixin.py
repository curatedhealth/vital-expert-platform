"""
Memory Integration Mixin - Long-Term Memory for All Modes

Provides memory integration for workflows via mixin pattern.
Enables remember/recall functionality across sessions.

Golden Rules Compliance:
✅ #1: Pure Python
✅ #2: Caching integrated
✅ #3: Tenant-aware
✅ #4: Supports RAG/memory operations
✅ #5: Enables feedback & learning

Usage:
    >>> class MyWorkflow(BaseWorkflow, MemoryIntegrationMixin):
    ...     def __init__(self, ...):
    ...         super().__init__(...)
    ...         self.init_memory_integration(supabase_client)
    ...
    ...     async def my_node(self, state):
    ...         # Recall relevant memories
    ...         memories = await self.recall_memories(
    ...             query=state['query'],
    ...             tenant_id=state['tenant_id'],
    ...             user_id=state['user_id']
    ...         )
    ...         # Use memories in processing...
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
import structlog

from services.session_memory_service import SessionMemoryService, RecalledMemory, Memory
from services.embedding_service import get_embedding_service
from services.cache_manager import CacheManager

logger = structlog.get_logger()


class MemoryIntegrationMixin:
    """
    Mixin for integrating long-term memory into workflows.
    
    Provides:
    - Memory initialization
    - Recall memories for context
    - Store memories after interactions
    - Extract memories from conversations
    - Cleanup utilities
    """
    
    def init_memory_integration(
        self,
        supabase_client,
        cache_manager: Optional[CacheManager] = None
    ):
        """
        Initialize memory integration.
        
        Args:
            supabase_client: Supabase client for database
            cache_manager: Optional cache manager
        """
        self.memory_service = SessionMemoryService(
            supabase_client=supabase_client,
            embedding_service=get_embedding_service(),
            cache_manager=cache_manager or CacheManager()
        )
        
        logger.info("✅ Memory integration initialized")
    
    async def recall_memories(
        self,
        query: str,
        tenant_id: UUID,
        user_id: UUID,
        memory_types: Optional[List[str]] = None,
        max_results: int = 5,
        min_similarity: float = 0.6
    ) -> List[RecalledMemory]:
        """
        Recall relevant memories for current query.
        
        Args:
            query: Current query/task
            tenant_id: Tenant UUID
            user_id: User UUID
            memory_types: Filter by types (fact, preference, etc.)
            max_results: Maximum memories to return
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of recalled memories with similarity scores
        """
        try:
            memories = await self.memory_service.recall(
                query=query,
                tenant_id=tenant_id,
                user_id=user_id,
                memory_types=memory_types,
                max_results=max_results,
                min_similarity=min_similarity
            )
            
            logger.debug(
                "Memories recalled for workflow",
                count=len(memories),
                query_preview=query[:50]
            )
            
            return memories
            
        except Exception as e:
            logger.error("Failed to recall memories in workflow", error=str(e))
            return []
    
    async def store_memory(
        self,
        tenant_id: UUID,
        user_id: UUID,
        session_id: str,
        content: str,
        memory_type: str,
        importance: float = 0.5,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Memory]:
        """
        Store a new memory.
        
        Args:
            tenant_id: Tenant UUID
            user_id: User UUID
            session_id: Session identifier
            content: Memory content
            memory_type: Type (fact, preference, task, result, tool_success)
            importance: Importance score (0-1)
            metadata: Additional metadata
            
        Returns:
            Stored Memory object or None if failed
        """
        try:
            memory = await self.memory_service.remember(
                tenant_id=tenant_id,
                user_id=user_id,
                session_id=session_id,
                content=content,
                memory_type=memory_type,
                importance=importance,
                metadata=metadata
            )
            
            logger.debug(
                "Memory stored from workflow",
                type=memory_type,
                importance=importance
            )
            
            return memory
            
        except Exception as e:
            logger.error("Failed to store memory in workflow", error=str(e))
            return None
    
    async def extract_and_store_memories(
        self,
        conversation_text: str,
        tenant_id: UUID,
        user_id: UUID,
        session_id: str,
        agent_response: Optional[str] = None
    ) -> List[Memory]:
        """
        Extract and store memories from conversation.
        
        Args:
            conversation_text: User message
            tenant_id: Tenant UUID
            user_id: User UUID
            session_id: Session identifier
            agent_response: Optional agent response
            
        Returns:
            List of extracted and stored memories
        """
        try:
            memories = await self.memory_service.extract_memories_from_conversation(
                conversation_text=conversation_text,
                tenant_id=tenant_id,
                user_id=user_id,
                session_id=session_id,
                agent_response=agent_response
            )
            
            logger.debug(
                "Memories extracted and stored",
                count=len(memories),
                session_id=session_id
            )
            
            return memories
            
        except Exception as e:
            logger.error("Failed to extract memories in workflow", error=str(e))
            return []
    
    def format_memories_for_context(
        self,
        memories: List[RecalledMemory],
        max_context_length: int = 1000
    ) -> str:
        """
        Format recalled memories as context string for LLM.
        
        Args:
            memories: List of recalled memories
            max_context_length: Maximum character length
            
        Returns:
            Formatted context string
        """
        if not memories:
            return ""
        
        context_parts = ["# Relevant Information from Previous Sessions:\n"]
        
        for i, recalled in enumerate(memories, 1):
            mem = recalled.memory
            # Format: [Type] Content (relevance: X%)
            part = f"{i}. [{mem.memory_type.upper()}] {mem.content} (relevance: {recalled.relevance_score:.0%})\n"
            
            if sum(len(p) for p in context_parts) + len(part) > max_context_length:
                break
            
            context_parts.append(part)
        
        return "".join(context_parts)
    
    async def get_user_preferences(
        self,
        tenant_id: UUID,
        user_id: UUID,
        days: int = 90
    ) -> List[Memory]:
        """
        Get user preferences from memory.
        
        Args:
            tenant_id: Tenant UUID
            user_id: User UUID
            days: Days to look back
            
        Returns:
            List of preference memories
        """
        try:
            return await self.memory_service.get_recent_memories(
                tenant_id=tenant_id,
                user_id=user_id,
                memory_types=['preference'],
                days=days,
                max_results=10
            )
        except Exception as e:
            logger.error("Failed to get user preferences", error=str(e))
            return []

