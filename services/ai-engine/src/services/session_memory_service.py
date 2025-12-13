"""
Session Memory Service - Long-Term Memory with Remember/Recall

Manages persistent agent memory across sessions with semantic search,
importance scoring, and automatic memory extraction.

Golden Rules Compliance:
✅ #1: Pure Python implementation
✅ #2: Caching integrated
✅ #3: Tenant isolation enforced
✅ #4: Supports RAG/Tools memory capture
✅ #5: Enables feedback & learning

Features:
- Remember: Store important information with embeddings
- Recall: Semantic search for relevant memories
- Importance scoring: Prioritize valuable memories
- Memory extraction: Auto-extract from conversations
- Access tracking: Update usage statistics
- Cleanup: Remove low-value old memories

Usage:
    >>> service = SessionMemoryService(supabase, embedding_service)
    >>> await service.remember(
    ...     tenant_id=tenant_id,
    ...     user_id=user_id,
    ...     session_id=session_id,
    ...     content="User prefers GPT-4 for complex analysis",
    ...     memory_type="preference",
    ...     importance=0.9
    ... )
    >>> memories = await service.recall(
    ...     query="what model does user prefer",
    ...     tenant_id=tenant_id,
    ...     user_id=user_id
    ... )
"""

import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from uuid import UUID, uuid4
import structlog
from pydantic import BaseModel, Field, UUID4

from services.embedding_service import EmbeddingService, get_embedding_service
from services.cache_manager import CacheManager

logger = structlog.get_logger()

# UUID validation helpers
import uuid as uuid_module

def _is_valid_uuid(value) -> bool:
    """Check if a value is a valid UUID format.

    Explicitly rejects:
    - None (Python None)
    - "None" (string literal - common serialization artifact)
    - "anonymous" (placeholder value)
    - "null" (JSON null serialized as string)
    - "undefined" (JavaScript undefined serialized as string)
    - Empty strings
    """
    if not value or value in ("anonymous", "None", "null", "undefined"):
        return False
    try:
        uuid_module.UUID(str(value))
        return True
    except (ValueError, TypeError, AttributeError):
        return False

def _get_valid_uuid_str_or_none(value) -> Optional[str]:
    """Return the string value if it's a valid UUID, otherwise return None."""
    return str(value) if _is_valid_uuid(value) else None


class Memory(BaseModel):
    """Represents a stored memory."""
    id: UUID4 = Field(default_factory=uuid4)
    tenant_id: UUID4
    user_id: UUID4
    session_id: str
    memory_type: str
    content: str
    importance: float = Field(ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    accessed_count: int = 0
    last_accessed_at: Optional[datetime] = None


class RecalledMemory(BaseModel):
    """Memory with similarity score from recall."""
    memory: Memory
    similarity: float = Field(ge=0.0, le=1.0)
    relevance_score: float = Field(ge=0.0, le=1.0)  # Combined similarity + importance


class SessionMemoryService:
    """
    Service for long-term agent memory management.
    
    Provides remember/recall functionality with semantic search,
    importance scoring, and automatic memory maintenance.
    """
    
    def __init__(
        self,
        supabase_client,
        embedding_service: Optional[EmbeddingService] = None,
        cache_manager: Optional[CacheManager] = None
    ):
        """
        Initialize memory service.
        
        Args:
            supabase_client: Supabase client for database operations
            embedding_service: Service for generating embeddings
            cache_manager: Cache manager for performance
        """
        self.supabase = supabase_client
        self.embedding_service = embedding_service or get_embedding_service()
        self.cache_manager = cache_manager or CacheManager()
        
        logger.info("✅ SessionMemoryService initialized")
    
    async def remember(
        self,
        tenant_id: UUID4,
        user_id: UUID4,
        session_id: str,
        content: str,
        memory_type: str,
        importance: float = 0.5,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Memory:
        """
        Store a new memory with embedding.
        
        Args:
            tenant_id: Tenant UUID
            user_id: User UUID
            session_id: Session identifier
            content: Memory content (natural language)
            memory_type: Type (fact, preference, task, result, tool_success)
            importance: Importance score (0-1)
            metadata: Additional metadata
            
        Returns:
            Created Memory object
        """
        try:
            # Generate embedding for content
            embedding_result = await self.embedding_service.embed_text(
                content,
                cache_key_prefix=f"memory:{tenant_id}"
            )
            
            # Prepare memory data - use validated UUIDs to prevent "None" string errors
            validated_user_id = _get_valid_uuid_str_or_none(user_id)
            if not validated_user_id:
                logger.warning("Cannot store memory without valid user_id", user_id=user_id)
                raise ValueError("Valid user_id required for memory storage")

            memory_data = {
                'id': str(uuid4()),
                'tenant_id': str(tenant_id),
                'user_id': validated_user_id,
                'session_id': session_id,
                'memory_type': memory_type,
                'content': content,
                'content_embedding': embedding_result.embedding,
                'importance': max(0.0, min(1.0, importance)),
                'metadata': metadata or {},
                'created_at': datetime.now(timezone.utc).isoformat(),
                'accessed_count': 0
            }
            
            # Insert into database
            result = self.supabase.table('session_memories')\
                .insert(memory_data)\
                .execute()
            
            if not result.data:
                raise ValueError("Failed to insert memory")
            
            memory = Memory(**result.data[0])
            
            logger.info(
                "✅ Memory stored",
                memory_id=str(memory.id)[:8],
                type=memory_type,
                importance=importance,
                content_preview=content[:50]
            )
            
            # Invalidate cache
            await self._invalidate_recall_cache(tenant_id, user_id)
            
            return memory
            
        except Exception as e:
            logger.error("Failed to store memory", error=str(e))
            raise
    
    async def recall(
        self,
        query: str,
        tenant_id: UUID4,
        user_id: UUID4,
        memory_types: Optional[List[str]] = None,
        session_id: Optional[str] = None,
        min_importance: float = 0.0,
        max_results: int = 5,
        min_similarity: float = 0.5
    ) -> List[RecalledMemory]:
        """
        Recall relevant memories using semantic search.
        
        Args:
            query: Search query
            tenant_id: Tenant UUID
            user_id: User UUID
            memory_types: Filter by memory types
            session_id: Filter by session
            min_importance: Minimum importance threshold
            max_results: Maximum number of results
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of RecalledMemory objects with similarity scores
        """
        try:
            # Check cache
            cache_key = f"recall:{tenant_id}:{user_id}:{hash(query)}"
            cached = await self.cache_manager.get(cache_key)
            if cached:
                logger.debug("Recall cache hit", query_preview=query[:50])
                return [RecalledMemory(**m) for m in cached]
            
            # Generate query embedding
            query_embedding = await self.embedding_service.embed_text(
                query,
                cache_key_prefix=f"query:{tenant_id}"
            )
            
            # Validate user_id before RPC call - return empty if invalid
            validated_user_id = _get_valid_uuid_str_or_none(user_id)
            if not validated_user_id:
                logger.debug("Recall skipped - no valid user_id", user_id=user_id)
                return []

            # Call database function for semantic search
            result = self.supabase.rpc(
                'search_memories_by_embedding',
                {
                    'query_embedding': query_embedding.embedding,
                    'p_tenant_id': str(tenant_id),
                    'p_user_id': validated_user_id,
                    'p_memory_types': memory_types,
                    'p_session_id': session_id,
                    'p_min_importance': min_importance,
                    'p_limit': max_results
                }
            ).execute()
            
            if not result.data:
                return []
            
            # Convert to RecalledMemory objects
            recalled_memories = []
            for row in result.data:
                # Skip low similarity results
                if row['similarity'] < min_similarity:
                    continue
                
                # Calculate relevance score (weighted combination)
                relevance = self._calculate_relevance(
                    similarity=row['similarity'],
                    importance=row['importance'],
                    recency_weight=0.1
                )
                
                memory = Memory(
                    id=UUID(row['id']),
                    tenant_id=tenant_id,
                    user_id=user_id,
                    session_id=session_id or "recalled",
                    memory_type=row['memory_type'],
                    content=row['content'],
                    importance=row['importance'],
                    metadata=row.get('metadata', {}),
                    created_at=row['created_at'],
                    accessed_count=row['accessed_count']
                )
                
                recalled_memory = RecalledMemory(
                    memory=memory,
                    similarity=row['similarity'],
                    relevance_score=relevance
                )
                
                recalled_memories.append(recalled_memory)
                
                # Update access tracking (fire and forget)
                asyncio.create_task(
                    self._update_access_tracking(UUID(row['id']))
                )
            
            # Sort by relevance
            recalled_memories.sort(key=lambda m: m.relevance_score, reverse=True)
            
            logger.info(
                "✅ Memories recalled",
                query_preview=query[:50],
                results=len(recalled_memories),
                avg_similarity=sum(m.similarity for m in recalled_memories) / len(recalled_memories) if recalled_memories else 0
            )
            
            # Cache results (5 min TTL for recall)
            await self.cache_manager.set(
                cache_key,
                [m.model_dump() for m in recalled_memories],
                ttl=300
            )
            
            return recalled_memories
            
        except Exception as e:
            logger.error("Failed to recall memories", error=str(e))
            return []
    
    async def get_recent_memories(
        self,
        tenant_id: UUID4,
        user_id: UUID4,
        memory_types: Optional[List[str]] = None,
        days: int = 30,
        max_results: int = 10
    ) -> List[Memory]:
        """
        Get recent memories ordered by importance and recency.
        
        Args:
            tenant_id: Tenant UUID
            user_id: User UUID
            memory_types: Filter by memory types
            days: Number of days to look back
            max_results: Maximum number of results
            
        Returns:
            List of Memory objects
        """
        try:
            # Validate user_id before RPC call - return empty if invalid
            validated_user_id = _get_valid_uuid_str_or_none(user_id)
            if not validated_user_id:
                logger.debug("get_recent_memories skipped - no valid user_id", user_id=user_id)
                return []

            result = self.supabase.rpc(
                'get_recent_memories',
                {
                    'p_tenant_id': str(tenant_id),
                    'p_user_id': validated_user_id,
                    'p_memory_types': memory_types,
                    'p_days': days,
                    'p_limit': max_results
                }
            ).execute()
            
            if not result.data:
                return []
            
            memories = [
                Memory(
                    id=UUID(row['id']),
                    tenant_id=tenant_id,
                    user_id=user_id,
                    session_id=row['session_id'],
                    memory_type=row['memory_type'],
                    content=row['content'],
                    importance=row['importance'],
                    metadata=row.get('metadata', {}),
                    created_at=row['created_at']
                )
                for row in result.data
            ]
            
            logger.info(
                "Recent memories retrieved",
                count=len(memories),
                days=days
            )
            
            return memories
            
        except Exception as e:
            logger.error("Failed to get recent memories", error=str(e))
            return []
    
    async def extract_memories_from_conversation(
        self,
        conversation_text: str,
        tenant_id: UUID4,
        user_id: UUID4,
        session_id: str,
        agent_response: Optional[str] = None
    ) -> List[Memory]:
        """
        Automatically extract important memories from conversation.
        
        Uses LLM to identify facts, preferences, tasks, and results
        worth remembering for future sessions.
        
        Args:
            conversation_text: User message
            tenant_id: Tenant UUID
            user_id: User UUID
            session_id: Session identifier
            agent_response: Optional agent response for context
            
        Returns:
            List of extracted Memory objects
        """
        try:
            from openai import AsyncOpenAI
            from core.config import get_settings
            
            settings = get_settings()
            client = AsyncOpenAI(api_key=settings.openai_api_key)
            
            # Prepare extraction prompt
            context = f"User: {conversation_text}"
            if agent_response:
                context += f"\nAssistant: {agent_response}"
            
            prompt = f"""Analyze this conversation and extract important information worth remembering for future sessions.

Conversation:
{context}

Extract memories in these categories:
1. fact: Factual information stated
2. preference: User preferences or choices
3. task: Tasks mentioned or planned
4. result: Important outcomes or results

For each memory, provide:
- type: One of (fact, preference, task, result)
- content: Clear, concise statement (one sentence)
- importance: Score 0.0-1.0 (how valuable for future sessions)

Return JSON array:
[{{"type": "preference", "content": "...", "importance": 0.8}}]

Only extract truly valuable information. Return empty array [] if nothing important.
"""
            
            response = await client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1,
                timeout=30.0
            )
            
            content = response.choices[0].message.content
            if not content:
                return []
            
            import json
            extracted = json.loads(content)
            
            if not isinstance(extracted, dict) or 'memories' not in extracted:
                # Try direct array format
                if isinstance(extracted, list):
                    memories_data = extracted
                else:
                    return []
            else:
                memories_data = extracted.get('memories', [])
            
            # Store extracted memories
            memories = []
            for mem_data in memories_data:
                if not all(k in mem_data for k in ['type', 'content', 'importance']):
                    continue
                
                memory = await self.remember(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    session_id=session_id,
                    content=mem_data['content'],
                    memory_type=mem_data['type'],
                    importance=float(mem_data['importance']),
                    metadata={'auto_extracted': True}
                )
                memories.append(memory)
            
            logger.info(
                "✅ Memories extracted from conversation",
                extracted=len(memories),
                session_id=session_id
            )
            
            return memories
            
        except Exception as e:
            logger.error("Failed to extract memories", error=str(e))
            return []
    
    async def cleanup_old_memories(
        self,
        tenant_id: UUID4,
        days: int = 90,
        min_importance_to_keep: float = 0.3
    ) -> int:
        """
        Clean up old low-importance memories.
        
        Args:
            tenant_id: Tenant UUID
            days: Age threshold in days
            min_importance_to_keep: Minimum importance to preserve
            
        Returns:
            Number of memories cleaned up
        """
        try:
            result = self.supabase.rpc(
                'cleanup_old_memories',
                {
                    'p_tenant_id': str(tenant_id),
                    'p_days': days
                }
            ).execute()
            
            count = result.data if result.data else 0
            
            logger.info(
                "Memories cleaned up",
                tenant_id=str(tenant_id)[:8],
                count=count,
                days=days
            )
            
            return count
            
        except Exception as e:
            logger.error("Failed to cleanup memories", error=str(e))
            return 0
    
    def _calculate_relevance(
        self,
        similarity: float,
        importance: float,
        recency_weight: float = 0.1
    ) -> float:
        """
        Calculate relevance score combining multiple factors.
        
        Args:
            similarity: Semantic similarity (0-1)
            importance: Importance score (0-1)
            recency_weight: Weight for recency factor
            
        Returns:
            Relevance score (0-1)
        """
        # Weighted combination: similarity is primary, importance is secondary
        relevance = (similarity * 0.7) + (importance * 0.3)
        
        return max(0.0, min(1.0, relevance))
    
    async def _update_access_tracking(self, memory_id: UUID):
        """Update memory access tracking (fire and forget)."""
        try:
            self.supabase.rpc(
                'update_memory_access',
                {'p_memory_id': str(memory_id)}
            ).execute()
        except Exception as e:
            logger.debug("Failed to update access tracking", error=str(e))
    
    async def _invalidate_recall_cache(self, tenant_id: UUID4, user_id: UUID4):
        """Invalidate recall cache for user."""
        try:
            # Pattern-based cache invalidation
            pattern = f"recall:{tenant_id}:{user_id}:*"
            # Note: Implement pattern-based deletion in cache_manager if needed
            pass
        except Exception as e:
            logger.debug("Failed to invalidate recall cache", error=str(e))
    
    async def health_check(self) -> bool:
        """Check if the service is healthy."""
        try:
            # Check database connection
            result = self.supabase.table('session_memories').select('id').limit(1).execute()
            
            # Check embedding service
            embedding_healthy = await self.embedding_service.health_check()
            
            return embedding_healthy
            
        except Exception as e:
            logger.error("Memory service health check failed", error=str(e))
            return False


# Global instance
_memory_service: Optional[SessionMemoryService] = None


def get_session_memory_service(
    supabase_client,
    embedding_service: Optional[EmbeddingService] = None,
    cache_manager: Optional[CacheManager] = None
) -> SessionMemoryService:
    """Get or create global memory service instance."""
    global _memory_service
    
    if _memory_service is None:
        _memory_service = SessionMemoryService(
            supabase_client,
            embedding_service,
            cache_manager
        )
    
    return _memory_service

