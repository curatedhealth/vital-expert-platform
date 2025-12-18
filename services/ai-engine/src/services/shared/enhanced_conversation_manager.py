"""
Enhanced Conversation Manager with Semantic Memory
Advanced chat history management with AI-powered memory extraction

Golden Rule #3: Tenant-aware
Golden Rule #5: Learn from conversations

Features:
- Conversation history management
- Semantic memory extraction (entities, facts, preferences)
- Context-aware formatting for LLMs
- Conversation summarization
- Entity tracking (drugs, conditions, procedures)
- User preference learning
- Multi-turn conversation support

Usage:
    >>> manager = EnhancedConversationManager(supabase_client)
    >>> await manager.save_turn(
    ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
    ...     session_id="session_123",
    ...     user_message="What are FDA requirements?",
    ...     assistant_message="FDA requires...",
    ...     agent_id="agent_regulatory"
    ... )
    >>> turns, memory = await manager.load_conversation(
    ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
    ...     session_id="session_123",
    ...     include_memory=True
    ... )
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import structlog
from pydantic import BaseModel, Field
from openai import OpenAI

from services.supabase_client import SupabaseClient
from services.cache_manager import CacheManager
from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


# ============================================================================
# MODELS
# ============================================================================

class ConversationTurn(BaseModel):
    """Single conversation turn"""
    role: str  # 'user', 'assistant', 'system'
    content: str
    agent_id: Optional[str] = None
    timestamp: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SemanticMemory(BaseModel):
    """Semantic memory extracted from conversation"""
    summary: str
    key_entities: Dict[str, List[str]]  # {entity_type: [values]}
    extracted_facts: List[Dict[str, Any]]
    user_preferences: Dict[str, Any]
    topics_discussed: List[str]
    sentiment: str = "neutral"
    confidence: float = 0.8


class ConversationMetadata(BaseModel):
    """Conversation metadata and statistics"""
    session_id: str
    total_turns: int
    agents_used: List[str]
    started_at: datetime
    last_updated: datetime
    total_tokens_estimated: int = 0
    models_used: List[str] = Field(default_factory=list)


# ============================================================================
# ENHANCED CONVERSATION MANAGER
# ============================================================================

class EnhancedConversationManager:
    """
    Advanced Conversation Management with Semantic Memory
    
    Golden Rule #3: Tenant-aware
    Golden Rule #5: Learn from conversations
    
    Features:
    - Full conversation history management
    - AI-powered semantic memory extraction
    - Entity tracking (medical terms, drugs, conditions)
    - Fact extraction for knowledge enrichment
    - User preference learning
    - Context-aware LLM formatting
    - Conversation summarization
    
    Responsibilities:
    - Save/load conversations with tenant isolation
    - Extract semantic memory from turns
    - Format conversations for LLM context
    - Track conversation metadata
    - Manage conversation lifecycle
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager: Optional[CacheManager] = None,
        openai_client: Optional[OpenAI] = None
    ):
        """
        Initialize enhanced conversation manager.
        
        Args:
            supabase_client: Supabase client for database access
            cache_manager: Optional cache manager for performance
            openai_client: Optional OpenAI client for memory extraction
        """
        self.supabase = supabase_client
        self.cache = cache_manager
        self.openai = openai_client or OpenAI(api_key=settings.openai_api_key)
        self.max_context_tokens = 8000  # Default context window
        
        logger.info("✅ EnhancedConversationManager initialized")
    
    async def save_turn(
        self,
        tenant_id: str,
        session_id: str,
        user_message: str,
        assistant_message: str,
        agent_id: str,
        rag_context: Optional[Dict[str, Any]] = None,
        tools_used: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Save conversation turn with semantic memory extraction.
        
        Golden Rule #3: Tenant isolation enforced
        Golden Rule #5: Extract learnings from conversation
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            session_id: Session identifier
            user_message: User's message
            assistant_message: Assistant's response
            agent_id: Agent ID that generated response
            rag_context: Optional RAG context used
            tools_used: Optional list of tools used
            metadata: Optional metadata (model, tokens, confidence, etc.)
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            logger.debug(
                "Saving conversation turn",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                agent_id=agent_id
            )
            
            # Ensure tenant context
            await self.supabase.set_tenant_context(tenant_id)
            
            # Extract semantic memory (Golden Rule #5)
            memory = await self._extract_semantic_memory(
                user_message,
                assistant_message
            )
            
            # Prepare conversation turn data
            turn_data = {
                'tenant_id': tenant_id,
                'session_id': session_id,
                'user_message': user_message,
                'assistant_message': assistant_message,
                'agent_id': agent_id,
                'system_prompt': metadata.get('system_prompt') if metadata else None,
                'rag_context': rag_context or {},
                'tools_used': tools_used or [],
                'metadata': metadata or {},
                'model_used': metadata.get('model_used') if metadata else None,
                'tokens_used': metadata.get('tokens_used') if metadata else None,
                'confidence': metadata.get('confidence') if metadata else None,
                'summary': memory.summary,
                'key_entities': memory.key_entities,
                'extracted_facts': memory.extracted_facts,
                'user_preferences': memory.user_preferences,
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Insert conversation turn
            result = await self.supabase.client.table('conversations') \
                .insert(turn_data) \
                .execute()
            
            if not result.data:
                raise Exception("Failed to insert conversation turn")
            
            # Invalidate cache
            if self.cache:
                await self.cache.delete(f"conversation:{tenant_id}:{session_id}")
            
            logger.info(
                "✅ Conversation turn saved",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                agent_id=agent_id,
                entities_extracted=sum(len(v) for v in memory.key_entities.values()),
                facts_extracted=len(memory.extracted_facts)
            )
            
            return True
        
        except Exception as e:
            logger.error(
                "❌ Failed to save conversation turn",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                error=str(e),
                error_type=type(e).__name__
            )
            return False
    
    async def load_conversation(
        self,
        tenant_id: str,
        session_id: str,
        limit: int = 50,
        include_memory: bool = True
    ) -> Tuple[List[ConversationTurn], Optional[SemanticMemory]]:
        """
        Load conversation history with optional semantic memory.
        
        Golden Rule #3: Tenant isolation enforced
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            session_id: Session identifier
            limit: Maximum number of turns to load
            include_memory: Whether to aggregate semantic memory
            
        Returns:
            Tuple of (conversation turns, aggregated memory)
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            # Check cache
            cache_key = f"conversation:{tenant_id}:{session_id}"
            if self.cache:
                cached = await self.cache.get(cache_key)
                if cached:
                    logger.debug(
                        "Conversation loaded from cache",
                        tenant_id=tenant_id[:8],
                        session_id=session_id
                    )
                    return cached
            
            # Ensure tenant context
            await self.supabase.set_tenant_context(tenant_id)
            
            # Query conversations
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
                return [], None
            
            # Build conversation turns
            turns = []
            for turn in result.data:
                # User message
                turns.append(ConversationTurn(
                    role='user',
                    content=turn['user_message'],
                    timestamp=datetime.fromisoformat(turn['created_at']),
                    metadata={}
                ))
                
                # Assistant message
                turns.append(ConversationTurn(
                    role='assistant',
                    content=turn['assistant_message'],
                    agent_id=turn['agent_id'],
                    timestamp=datetime.fromisoformat(turn['created_at']),
                    metadata=turn.get('metadata', {})
                ))
            
            # Aggregate semantic memory if requested
            memory = None
            if include_memory and result.data:
                memory = await self._aggregate_conversation_memory(result.data)
            
            # Cache result
            if self.cache:
                await self.cache.set(
                    cache_key,
                    (turns, memory),
                    ttl=600  # 10 minutes
                )
            
            logger.info(
                "Conversation loaded",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                turns=len(turns),
                has_memory=memory is not None
            )
            
            return turns, memory
        
        except Exception as e:
            logger.error(
                "❌ Failed to load conversation",
                tenant_id=tenant_id[:8],
                session_id=session_id,
                error=str(e),
                error_type=type(e).__name__
            )
            return [], None
    
    async def _extract_semantic_memory(
        self,
        user_message: str,
        assistant_message: str
    ) -> SemanticMemory:
        """
        Extract semantic memory from conversation turn using LLM.
        
        Extracts:
        - Summary of the exchange
        - Key entities (drugs, conditions, procedures, etc.)
        - Factual statements
        - User preferences
        - Topics discussed
        
        Args:
            user_message: User's message
            assistant_message: Assistant's response
            
        Returns:
            SemanticMemory object
        """
        try:
            prompt = f"""Analyze this conversation turn and extract structured information.

User: {user_message}
Assistant: {assistant_message}

Extract and return JSON with:
- summary: Brief summary of the exchange (1-2 sentences)
- key_entities: Dict of entity types and values, e.g., {{"drugs": ["aspirin"], "conditions": ["headache"], "procedures": [], "regulations": []}}
- extracted_facts: List of factual statements from the assistant's response, e.g., [{"fact": "FDA requires IND submission", "confidence": 0.9}]
- user_preferences: Any user preferences mentioned, e.g., {{"preference_type": "detail_level", "value": "comprehensive"}}
- topics_discussed: List of main topics, e.g., ["FDA regulations", "clinical trials"]

Focus on medical/healthcare entities and facts.
Return ONLY valid JSON."""

            response = self.openai.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a semantic memory extraction assistant. Extract structured information from medical/healthcare conversations."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=800,
                timeout=30.0
            )
            
            import json
            memory_data = json.loads(response.choices[0].message.content)
            
            return SemanticMemory(
                summary=memory_data.get('summary', ''),
                key_entities=memory_data.get('key_entities', {}),
                extracted_facts=memory_data.get('extracted_facts', []),
                user_preferences=memory_data.get('user_preferences', {}),
                topics_discussed=memory_data.get('topics_discussed', []),
                sentiment='neutral',  # Could add sentiment analysis
                confidence=0.8
            )
        
        except Exception as e:
            logger.error(
                "Failed to extract semantic memory",
                error=str(e),
                error_type=type(e).__name__
            )
            # Return empty memory on failure
            return SemanticMemory(
                summary="",
                key_entities={},
                extracted_facts=[],
                user_preferences={},
                topics_discussed=[],
                sentiment='neutral',
                confidence=0.0
            )
    
    async def _aggregate_conversation_memory(
        self,
        conversation_data: List[Dict[str, Any]]
    ) -> SemanticMemory:
        """
        Aggregate semantic memory across entire conversation.
        
        Combines all entities, facts, preferences, and topics from all turns.
        
        Args:
            conversation_data: List of conversation turn data
            
        Returns:
            Aggregated SemanticMemory
        """
        try:
            # Aggregate data
            all_entities = {}
            all_facts = []
            all_preferences = {}
            all_topics = []
            
            for turn in conversation_data:
                # Merge entities
                for entity_type, entities in turn.get('key_entities', {}).items():
                    if entity_type not in all_entities:
                        all_entities[entity_type] = []
                    all_entities[entity_type].extend(entities)
                
                # Collect facts
                all_facts.extend(turn.get('extracted_facts', []))
                
                # Merge preferences (later preferences override)
                all_preferences.update(turn.get('user_preferences', {}))
                
                # Collect topics
                if turn.get('summary'):
                    all_topics.extend(turn.get('summary', '').split(', '))
            
            # Deduplicate
            for entity_type in all_entities:
                all_entities[entity_type] = list(set(all_entities[entity_type]))
            
            all_topics = list(set(all_topics))[:10]  # Top 10 topics
            
            # Generate overall summary
            total_facts = len(all_facts)
            total_entities = sum(len(v) for v in all_entities.values())
            summary = f"Conversation with {len(conversation_data)} turns covering {len(all_topics)} topics. {total_entities} entities and {total_facts} facts extracted."
            
            logger.debug(
                "Conversation memory aggregated",
                turns=len(conversation_data),
                entities=total_entities,
                facts=total_facts,
                topics=len(all_topics)
            )
            
            return SemanticMemory(
                summary=summary,
                key_entities=all_entities,
                extracted_facts=all_facts[:50],  # Limit to 50 most recent
                user_preferences=all_preferences,
                topics_discussed=all_topics,
                sentiment='neutral',
                confidence=0.8
            )
        
        except Exception as e:
            logger.error(
                "Failed to aggregate conversation memory",
                error=str(e)
            )
            return SemanticMemory(
                summary="",
                key_entities={},
                extracted_facts=[],
                user_preferences={},
                topics_discussed=[],
                sentiment='neutral',
                confidence=0.0
            )
    
    def format_for_llm(
        self,
        turns: List[ConversationTurn],
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None,
        include_metadata: bool = False
    ) -> List[Dict[str, str]]:
        """
        Format conversation for LLM context with automatic trimming.
        
        Trims from the beginning to fit within token limit,
        keeping the most recent messages.
        
        Args:
            turns: List of conversation turns
            max_tokens: Maximum tokens for entire context
            system_prompt: Optional system prompt to prepend
            include_metadata: Whether to include metadata in messages
            
        Returns:
            List of formatted messages for LLM
        """
        max_tokens = max_tokens or self.max_context_tokens
        
        # Build messages
        messages = []
        
        if system_prompt:
            messages.append({'role': 'system', 'content': system_prompt})
        
        # Estimate tokens and trim if needed
        system_tokens = len(system_prompt) // 4 if system_prompt else 0
        current_tokens = system_tokens
        
        # Add turns from most recent (reverse order)
        for turn in reversed(turns):
            turn_tokens = len(turn.content) // 4 + 10  # Add buffer
            
            if current_tokens + turn_tokens <= max_tokens:
                message = {'role': turn.role, 'content': turn.content}
                
                # Add metadata if requested
                if include_metadata and turn.metadata:
                    message['metadata'] = turn.metadata
                
                # Insert at beginning (after system prompt)
                insert_pos = 1 if system_prompt else 0
                messages.insert(insert_pos, message)
                current_tokens += turn_tokens
            else:
                logger.debug(
                    "Conversation trimmed to fit context",
                    original_turns=len(turns),
                    included_turns=len(messages) - (1 if system_prompt else 0),
                    estimated_tokens=current_tokens
                )
                break
        
        return messages
    
    async def get_conversation_metadata(
        self,
        tenant_id: str,
        session_id: str
    ) -> Optional[ConversationMetadata]:
        """
        Get conversation metadata and statistics.
        
        Args:
            tenant_id: Tenant UUID
            session_id: Session identifier
            
        Returns:
            ConversationMetadata or None if not found
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            result = await self.supabase.client.table('conversations') \
                .select('*') \
                .eq('tenant_id', tenant_id) \
                .eq('session_id', session_id) \
                .execute()
            
            if not result.data:
                return None
            
            # Calculate statistics
            total_turns = len(result.data)
            agents_used = list(set(
                turn['agent_id'] for turn in result.data
                if turn.get('agent_id')
            ))
            
            models_used = list(set(
                turn['model_used'] for turn in result.data
                if turn.get('model_used')
            ))
            
            total_tokens = sum(
                turn.get('tokens_used', 0) for turn in result.data
            )
            
            first_turn = min(result.data, key=lambda t: t['created_at'])
            last_turn = max(result.data, key=lambda t: t['created_at'])
            
            return ConversationMetadata(
                session_id=session_id,
                total_turns=total_turns,
                agents_used=agents_used,
                started_at=datetime.fromisoformat(first_turn['created_at']),
                last_updated=datetime.fromisoformat(last_turn['created_at']),
                total_tokens_estimated=total_tokens,
                models_used=models_used
            )
        
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
        
        Golden Rule #3: Tenant isolation ensures only tenant's data deleted
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            session_id: Session identifier
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            await self.supabase.client.table('conversations') \
                .delete() \
                .eq('tenant_id', tenant_id) \
                .eq('session_id', session_id) \
                .execute()
            
            # Invalidate cache
            if self.cache:
                await self.cache.delete(f"conversation:{tenant_id}:{session_id}")
            
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


# ============================================================================
# SERVICE FACTORY
# ============================================================================

_enhanced_conversation_manager: Optional[EnhancedConversationManager] = None


def get_enhanced_conversation_manager(
    supabase_client: Optional[SupabaseClient] = None,
    cache_manager: Optional[CacheManager] = None
) -> EnhancedConversationManager:
    """
    Get or create enhanced conversation manager instance (singleton pattern)
    
    Args:
        supabase_client: Optional Supabase client
        cache_manager: Optional cache manager
        
    Returns:
        EnhancedConversationManager instance
    """
    global _enhanced_conversation_manager
    
    if _enhanced_conversation_manager is None:
        if not supabase_client:
            raise ValueError("supabase_client required for first initialization")
        _enhanced_conversation_manager = EnhancedConversationManager(
            supabase_client=supabase_client,
            cache_manager=cache_manager
        )
    
    return _enhanced_conversation_manager

