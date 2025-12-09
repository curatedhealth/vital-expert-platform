"""
LangGraph Memory Management Nodes

These nodes integrate semantic memory extraction, entity tracking, and user preference
learning into LangGraph workflows following Golden Rule #5.

Golden Rules Compliance:
- ✅ #1: All nodes designed for LangGraph StateGraph integration
- ✅ #2: Caching integrated for memory retrieval
- ✅ #3: Tenant isolation enforced
- ✅ #5: Memory-driven context enhancement

Usage:
    from langgraph_workflows.memory_nodes import MemoryNodes
    
    memory_nodes = MemoryNodes(supabase_client, cache_manager, conversation_manager)
    
    # Add to LangGraph workflow
    graph.add_node("extract_memory", memory_nodes.extract_semantic_memory_node)
    graph.add_node("retrieve_memory", memory_nodes.retrieve_relevant_memory_node)
    graph.add_node("update_memory", memory_nodes.update_conversation_memory_node)
"""

import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import structlog
from pydantic import UUID4

from langgraph_workflows.state_schemas import UnifiedWorkflowState
from langgraph_workflows.observability import trace_node
from services.enhanced_conversation_manager import EnhancedConversationManager
from services.cache_manager import CacheManager
from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class MemoryNodes:
    """
    LangGraph nodes for semantic memory management.
    
    Features:
    - Semantic memory extraction from conversations
    - Entity tracking (drugs, conditions, procedures, etc.)
    - User preference learning
    - Fact extraction with confidence scores
    - Topic identification
    - Memory-aware context enhancement
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager: Optional[CacheManager] = None,
        conversation_manager: Optional[EnhancedConversationManager] = None
    ):
        """
        Initialize memory nodes.
        
        Args:
            supabase_client: Supabase client for database access
            cache_manager: Cache manager for performance optimization
            conversation_manager: Enhanced conversation manager with memory capabilities
        """
        self.supabase = supabase_client
        self.cache = cache_manager
        self.conversation_manager = conversation_manager or EnhancedConversationManager(
            supabase_client,
            cache_manager
        )
        
        logger.info("✅ MemoryNodes initialized")
    
    # =========================================================================
    # SEMANTIC MEMORY EXTRACTION NODE
    # =========================================================================
    
    @trace_node("extract_semantic_memory")
    async def extract_semantic_memory_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Extract semantic memory from current conversation turn.
        
        Extracts:
        - Key entities (drugs, conditions, procedures, regulations, etc.)
        - Important facts
        - User preferences (detail level, communication style, etc.)
        - Topics discussed
        
        Golden Rule #2: Cache memory extraction for similar conversations.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with extracted memory
        """
        tenant_id = state['tenant_id']
        query = state['query']
        agent_response = state.get('agent_response', '')
        session_id = state.get('session_id')
        
        if not session_id:
            logger.debug("No session_id, skipping memory extraction")
            return {
                **state,
                'current_node': 'extract_semantic_memory'
            }
        
        try:
            # Check cache first (Golden Rule #2)
            cache_key = f"memory_extraction:{tenant_id}:{session_id}:{hash(query + agent_response[:100])}"
            if self.cache:
                cached_memory = await self.cache.get(cache_key)
                if cached_memory:
                    logger.debug("✅ Memory extraction cache hit")
                    return {
                        **state,
                        'extracted_memory': cached_memory,
                        'cache_hits': state.get('cache_hits', 0) + 1,
                        'current_node': 'extract_semantic_memory'
                    }
            
            # Extract semantic memory using EnhancedConversationManager
            memory_result = await self.conversation_manager.extract_semantic_memory(
                user_message=query,
                assistant_message=agent_response,
                conversation_history=state.get('conversation_history', [])
            )
            
            extracted_memory = {
                'entities': memory_result.get('entities', {}),
                'facts': memory_result.get('facts', []),
                'preferences': memory_result.get('preferences', {}),
                'topics': memory_result.get('topics', []),
                'sentiment': memory_result.get('sentiment', 'neutral'),
                'extracted_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Cache result (Golden Rule #2)
            if self.cache:
                await self.cache.set(cache_key, extracted_memory, ttl=3600)  # 1 hour
            
            logger.info(
                "Semantic memory extracted",
                entities_count=len(extracted_memory.get('entities', {})),
                facts_count=len(extracted_memory.get('facts', [])),
                topics=extracted_memory.get('topics', [])
            )
            
            return {
                **state,
                'extracted_memory': extracted_memory,
                'current_node': 'extract_semantic_memory'
            }
            
        except Exception as e:
            logger.error("❌ Semantic memory extraction failed", error=str(e))
            return {
                **state,
                'extracted_memory': {},
                'errors': state.get('errors', []) + [f"Memory extraction failed: {str(e)}"],
                'current_node': 'extract_semantic_memory'
            }
    
    # =========================================================================
    # RETRIEVE RELEVANT MEMORY NODE
    # =========================================================================
    
    @trace_node("retrieve_relevant_memory")
    async def retrieve_relevant_memory_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Retrieve relevant semantic memory for current query.
        
        Retrieves memory from past conversations that are relevant to the current query:
        - Similar topics discussed before
        - Related entities mentioned
        - User preferences
        
        Golden Rule #2: Cache memory retrieval results.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with relevant_memory
        """
        tenant_id = state['tenant_id']
        query = state['query']
        session_id = state.get('session_id')
        user_id = state.get('user_id')
        
        try:
            # Check cache first (Golden Rule #2)
            cache_key = f"memory_retrieval:{tenant_id}:{user_id or session_id}:{hash(query)}"
            if self.cache:
                cached_memory = await self.cache.get(cache_key)
                if cached_memory:
                    logger.debug("✅ Memory retrieval cache hit")
                    return {
                        **state,
                        'relevant_memory': cached_memory,
                        'cache_hits': state.get('cache_hits', 0) + 1,
                        'current_node': 'retrieve_relevant_memory'
                    }
            
            # Retrieve relevant memory
            # This could use vector similarity search on past conversation memory
            relevant_memory = await self._retrieve_similar_memory(
                tenant_id=tenant_id,
                session_id=session_id,
                user_id=user_id,
                query=query
            )
            
            # Cache result (Golden Rule #2)
            if self.cache:
                await self.cache.set(cache_key, relevant_memory, ttl=1800)  # 30 minutes
            
            logger.info(
                "Relevant memory retrieved",
                entities_count=len(relevant_memory.get('entities', {})),
                preferences_count=len(relevant_memory.get('preferences', {})),
                facts_count=len(relevant_memory.get('facts', []))
            )
            
            return {
                **state,
                'relevant_memory': relevant_memory,
                'current_node': 'retrieve_relevant_memory'
            }
            
        except Exception as e:
            logger.error("❌ Memory retrieval failed", error=str(e))
            return {
                **state,
                'relevant_memory': {},
                'errors': state.get('errors', []) + [f"Memory retrieval failed: {str(e)}"],
                'current_node': 'retrieve_relevant_memory'
            }
    
    # =========================================================================
    # UPDATE CONVERSATION MEMORY NODE
    # =========================================================================
    
    @trace_node("update_conversation_memory")
    async def update_conversation_memory_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Update conversation memory in database.
        
        Persists extracted semantic memory to the conversations table:
        - Updates semantic_memory JSONB field
        - Updates extracted_entities
        - Updates user_preferences
        - Updates conversation_summary
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with memory update status
        """
        tenant_id = state['tenant_id']
        session_id = state.get('session_id')
        extracted_memory = state.get('extracted_memory', {})
        
        if not session_id or not extracted_memory:
            logger.debug("No session or memory to update")
            return {
                **state,
                'current_node': 'update_conversation_memory'
            }
        
        try:
            # Update memory in database
            await self.conversation_manager.update_conversation_memory(
                tenant_id=UUID4(tenant_id),
                session_id=session_id,
                semantic_memory=extracted_memory,
                extracted_entities=extracted_memory.get('entities', {}),
                user_preferences=extracted_memory.get('preferences', {})
            )
            
            logger.info("Conversation memory updated in database", session_id=session_id)
            
            return {
                **state,
                'memory_updated': True,
                'current_node': 'update_conversation_memory'
            }
            
        except Exception as e:
            logger.error("❌ Failed to update conversation memory", error=str(e))
            return {
                **state,
                'memory_updated': False,
                'errors': state.get('errors', []) + [f"Memory update failed: {str(e)}"],
                'current_node': 'update_conversation_memory'
            }
    
    # =========================================================================
    # ENHANCE CONTEXT WITH MEMORY NODE
    # =========================================================================
    
    @trace_node("enhance_context_with_memory")
    async def enhance_context_with_memory_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Enhance agent context with relevant memory.
        
        Combines:
        - Current query
        - Conversation history
        - Relevant semantic memory (entities, facts, preferences)
        
        Creates enriched context for agent execution.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with memory_enhanced_context
        """
        try:
            query = state['query']
            relevant_memory = state.get('relevant_memory', {})
            conversation_history = state.get('conversation_history', [])
            
            # Build memory-enhanced context
            memory_context_parts = []
            
            # Add user preferences if available
            preferences = relevant_memory.get('preferences', {})
            if preferences:
                pref_str = ", ".join([f"{k}: {v}" for k, v in preferences.items()])
                memory_context_parts.append(f"**User Preferences:** {pref_str}")
            
            # Add relevant entities
            entities = relevant_memory.get('entities', {})
            if entities:
                entity_str = ", ".join([
                    f"{category}: {', '.join(items[:3])}"
                    for category, items in entities.items()
                    if items
                ])
                memory_context_parts.append(f"**Previously Discussed:** {entity_str}")
            
            # Add relevant facts
            facts = relevant_memory.get('facts', [])
            if facts:
                facts_str = "\n".join([f"- {fact['content']}" for fact in facts[:5]])
                memory_context_parts.append(f"**Relevant Facts from Past Conversations:**\n{facts_str}")
            
            memory_enhanced_context = "\n\n".join(memory_context_parts) if memory_context_parts else ""
            
            logger.info(
                "Context enhanced with memory",
                preferences_added=len(preferences),
                entities_added=len(entities),
                facts_added=len(facts)
            )
            
            return {
                **state,
                'memory_enhanced_context': memory_enhanced_context,
                'current_node': 'enhance_context_with_memory'
            }
            
        except Exception as e:
            logger.error("❌ Failed to enhance context with memory", error=str(e))
            return {
                **state,
                'memory_enhanced_context': '',
                'errors': state.get('errors', []) + [f"Memory context enhancement failed: {str(e)}"],
                'current_node': 'enhance_context_with_memory'
            }
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    
    async def _retrieve_similar_memory(
        self,
        tenant_id: str,
        session_id: Optional[str],
        user_id: Optional[str],
        query: str
    ) -> Dict[str, Any]:
        """
        Retrieve semantic memory from past conversations.
        
        Args:
            tenant_id: Tenant identifier
            session_id: Current session identifier
            user_id: User identifier (optional)
            query: Current query
            
        Returns:
            Aggregated semantic memory
        """
        try:
            await self.supabase.set_tenant_context(tenant_id)
            
            # Query past conversations for this user/session
            # This is a simplified implementation - could use vector similarity
            query_builder = self.supabase.client.from_('conversations').select(
                'semantic_memory, extracted_entities, user_preferences'
            ).eq('tenant_id', tenant_id)
            
            if user_id:
                query_builder = query_builder.eq('user_id', user_id)
            elif session_id:
                query_builder = query_builder.eq('session_id', session_id)
            
            # Supabase-py client is synchronous - run in thread pool
            def _execute_query():
                return query_builder.order('created_at', desc=True).limit(20).execute()

            response = await asyncio.to_thread(_execute_query)
            
            if not response.data:
                return {'entities': {}, 'preferences': {}, 'facts': []}
            
            # Aggregate memory from past conversations
            aggregated_memory = self._aggregate_memory(response.data)
            
            return aggregated_memory
            
        except Exception as e:
            logger.error("❌ Failed to retrieve similar memory", error=str(e))
            return {'entities': {}, 'preferences': {}, 'facts': []}
    
    def _aggregate_memory(self, conversations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate semantic memory from multiple conversations.
        
        Args:
            conversations: List of conversation records
            
        Returns:
            Aggregated memory
        """
        aggregated = {
            'entities': {},
            'preferences': {},
            'facts': []
        }
        
        for conv in conversations:
            # Merge entities
            entities = conv.get('extracted_entities', {})
            for category, items in entities.items():
                if category not in aggregated['entities']:
                    aggregated['entities'][category] = set()
                aggregated['entities'][category].update(items if isinstance(items, list) else [])
            
            # Merge preferences (latest wins)
            preferences = conv.get('user_preferences', {})
            aggregated['preferences'].update(preferences)
            
            # Add facts
            semantic_memory = conv.get('semantic_memory', {})
            facts = semantic_memory.get('facts', [])
            aggregated['facts'].extend(facts)
        
        # Convert entity sets back to lists
        aggregated['entities'] = {
            k: list(v)[:10]  # Limit to top 10 per category
            for k, v in aggregated['entities'].items()
        }
        
        # Limit facts
        aggregated['facts'] = aggregated['facts'][:20]
        
        return aggregated

