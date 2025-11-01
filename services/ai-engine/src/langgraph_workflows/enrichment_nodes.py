"""
LangGraph Agent Enrichment Nodes

These nodes integrate automatic knowledge capture, entity extraction, and knowledge
enrichment into LangGraph workflows following Golden Rule #4 and #5.

Golden Rules Compliance:
- ✅ #1: All nodes designed for LangGraph StateGraph integration
- ✅ #2: Caching integrated where applicable
- ✅ #3: Tenant isolation enforced
- ✅ #4: Captures tool outputs for knowledge base enrichment
- ✅ #5: Learns from user feedback

Usage:
    from langgraph_workflows.enrichment_nodes import EnrichmentNodes
    
    enrichment_nodes = EnrichmentNodes(supabase_client, cache_manager, enrichment_service)
    
    # Add to LangGraph workflow
    graph.add_node("capture_tool_knowledge", enrichment_nodes.capture_tool_knowledge_node)
    graph.add_node("enrich_from_feedback", enrichment_nodes.enrich_from_feedback_node)
    graph.add_node("extract_entities", enrichment_nodes.extract_entities_node)
"""

import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import structlog
from pydantic import UUID4

from langgraph_workflows.state_schemas import UnifiedWorkflowState
from langgraph_workflows.observability import trace_node
from services.agent_enrichment_service import AgentEnrichmentService
from services.cache_manager import CacheManager
from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class EnrichmentNodes:
    """
    LangGraph nodes for agent knowledge enrichment.
    
    Features:
    - Automatic knowledge capture from tool outputs (Golden Rule #4)
    - Learning from user feedback (Golden Rule #5)
    - Entity extraction (drugs, conditions, regulations, etc.)
    - Relevance scoring and verification
    - Knowledge deduplication and indexing
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager: Optional[CacheManager] = None,
        enrichment_service: Optional[AgentEnrichmentService] = None
    ):
        """
        Initialize enrichment nodes.
        
        Args:
            supabase_client: Supabase client for database access
            cache_manager: Cache manager for performance optimization
            enrichment_service: Agent enrichment service
        """
        self.supabase = supabase_client
        self.cache = cache_manager
        self.enrichment_service = enrichment_service or AgentEnrichmentService(
            supabase_client,
            cache_manager
        )
        
        logger.info("✅ EnrichmentNodes initialized")
    
    # =========================================================================
    # CAPTURE TOOL KNOWLEDGE NODE
    # =========================================================================
    
    @trace_node("capture_tool_knowledge")
    async def capture_tool_knowledge_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Capture knowledge from tool outputs.
        
        Golden Rule #4: Automatically saves useful tool outputs to knowledge base.
        
        Captures knowledge from:
        - Web search results
        - Document retrieval
        - Database queries
        - API responses
        - Any tool execution
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with captured_knowledge
        """
        tenant_id = state['tenant_id']
        tools_used = state.get('tools_used', [])
        tool_outputs = state.get('tool_outputs', {})
        query = state['query']
        selected_agent = state['selected_agents'][-1] if state.get('selected_agents') else None
        
        if not tools_used or not tool_outputs:
            logger.debug("No tools used, skipping knowledge capture")
            return {
                **state,
                'current_node': 'capture_tool_knowledge'
            }
        
        try:
            captured_knowledge_items = []
            
            for tool_name in tools_used:
                tool_output = tool_outputs.get(tool_name)
                if not tool_output:
                    continue
                
                # Capture knowledge from tool output
                capture_result = await self.enrichment_service.capture_tool_output(
                    tenant_id=UUID4(tenant_id),
                    agent_id=selected_agent or 'unknown',
                    tool_name=tool_name,
                    tool_output=tool_output,
                    context_query=query
                )
                
                if capture_result.get('captured'):
                    captured_knowledge_items.append({
                        'tool': tool_name,
                        'knowledge_id': capture_result.get('knowledge_id'),
                        'relevance_score': capture_result.get('relevance_score', 0.0),
                        'entities_extracted': capture_result.get('entities', {})
                    })
            
            logger.info(
                "Tool knowledge captured",
                tools_processed=len(tools_used),
                items_captured=len(captured_knowledge_items)
            )
            
            return {
                **state,
                'captured_knowledge': captured_knowledge_items,
                'knowledge_capture_count': len(captured_knowledge_items),
                'current_node': 'capture_tool_knowledge'
            }
            
        except Exception as e:
            logger.error("❌ Tool knowledge capture failed", error=str(e))
            return {
                **state,
                'captured_knowledge': [],
                'errors': state.get('errors', []) + [f"Knowledge capture failed: {str(e)}"],
                'current_node': 'capture_tool_knowledge'
            }
    
    # =========================================================================
    # ENRICH FROM FEEDBACK NODE
    # =========================================================================
    
    @trace_node("enrich_from_feedback")
    async def enrich_from_feedback_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Enrich agent knowledge from user feedback.
        
        Golden Rule #5: Learn from user feedback to improve agent knowledge.
        
        When users provide positive feedback on responses:
        - Extract key facts from the response
        - Save to agent knowledge base
        - Increase relevance of related knowledge
        
        When users provide negative feedback:
        - Mark related knowledge for review
        - Decrease relevance of problematic knowledge
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with enrichment_from_feedback
        """
        tenant_id = state['tenant_id']
        user_feedback = state.get('user_feedback', {})
        feedback_id = state.get('feedback_id')
        selected_agent = state['selected_agents'][-1] if state.get('selected_agents') else None
        agent_response = state.get('agent_response', '')
        query = state['query']
        
        if not user_feedback or not feedback_id:
            logger.debug("No user feedback to enrich from")
            return {
                **state,
                'current_node': 'enrich_from_feedback'
            }
        
        try:
            rating = user_feedback.get('rating', 3)
            feedback_categories = user_feedback.get('feedback_categories', [])
            
            enrichment_result = {}
            
            # Positive feedback (4-5 stars or 'excellent' category)
            if rating >= 4 or 'excellent' in feedback_categories or 'helpful' in feedback_categories:
                enrichment_result = await self.enrichment_service.learn_from_feedback(
                    tenant_id=UUID4(tenant_id),
                    agent_id=selected_agent or 'unknown',
                    feedback_id=UUID4(feedback_id),
                    feedback_type='positive',
                    query=query,
                    response=agent_response,
                    rating=rating
                )
                
                logger.info(
                    "✅ Enriched from positive feedback",
                    knowledge_items=enrichment_result.get('knowledge_items_created', 0),
                    rating=rating
                )
            
            # Negative feedback (1-2 stars or 'incorrect' category)
            elif rating <= 2 or 'incorrect' in feedback_categories:
                enrichment_result = await self.enrichment_service.learn_from_feedback(
                    tenant_id=UUID4(tenant_id),
                    agent_id=selected_agent or 'unknown',
                    feedback_id=UUID4(feedback_id),
                    feedback_type='negative',
                    query=query,
                    response=agent_response,
                    rating=rating
                )
                
                logger.info(
                    "📊 Processed negative feedback",
                    knowledge_items_flagged=enrichment_result.get('knowledge_items_flagged', 0),
                    rating=rating
                )
            
            return {
                **state,
                'enrichment_from_feedback': enrichment_result,
                'current_node': 'enrich_from_feedback'
            }
            
        except Exception as e:
            logger.error("❌ Failed to enrich from feedback", error=str(e))
            return {
                **state,
                'enrichment_from_feedback': {},
                'errors': state.get('errors', []) + [f"Feedback enrichment failed: {str(e)}"],
                'current_node': 'enrich_from_feedback'
            }
    
    # =========================================================================
    # EXTRACT ENTITIES NODE
    # =========================================================================
    
    @trace_node("extract_entities")
    async def extract_entities_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Extract entities from query and response.
        
        Extracts:
        - Medical entities (drugs, conditions, procedures)
        - Regulatory entities (agencies, regulations, compliance terms)
        - Technical entities (protocols, methodologies)
        - General entities (organizations, people, locations)
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with extracted_entities
        """
        query = state['query']
        agent_response = state.get('agent_response', '')
        
        try:
            # Extract entities using enrichment service
            entities_result = await self.enrichment_service.extract_entities(
                text=f"{query}\n\n{agent_response}"
            )
            
            extracted_entities = entities_result.get('entities', {})
            
            logger.info(
                "Entities extracted",
                categories=list(extracted_entities.keys()),
                total_entities=sum(len(v) for v in extracted_entities.values())
            )
            
            return {
                **state,
                'extracted_entities': extracted_entities,
                'entity_count': sum(len(v) for v in extracted_entities.values()),
                'current_node': 'extract_entities'
            }
            
        except Exception as e:
            logger.error("❌ Entity extraction failed", error=str(e))
            return {
                **state,
                'extracted_entities': {},
                'errors': state.get('errors', []) + [f"Entity extraction failed: {str(e)}"],
                'current_node': 'extract_entities'
            }
    
    # =========================================================================
    # ENRICH KNOWLEDGE BASE NODE
    # =========================================================================
    
    @trace_node("enrich_knowledge_base")
    async def enrich_knowledge_base_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Enrich knowledge base with extracted knowledge.
        
        Combines:
        - Captured tool knowledge
        - Extracted entities
        - High-confidence facts from response
        
        Saves to agent_knowledge_enrichment table.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with knowledge_enriched status
        """
        tenant_id = state['tenant_id']
        selected_agent = state['selected_agents'][-1] if state.get('selected_agents') else None
        captured_knowledge = state.get('captured_knowledge', [])
        extracted_entities = state.get('extracted_entities', {})
        agent_response = state.get('agent_response', '')
        response_confidence = state.get('response_confidence', 0.0)
        
        # Only enrich if response confidence is high
        if response_confidence < 0.7:
            logger.debug("Response confidence too low, skipping knowledge enrichment")
            return {
                **state,
                'knowledge_enriched': False,
                'current_node': 'enrich_knowledge_base'
            }
        
        try:
            enrichment_items = []
            
            # Process captured tool knowledge
            for tool_knowledge in captured_knowledge:
                if tool_knowledge.get('relevance_score', 0) >= 0.6:
                    enrichment_items.append({
                        'source': 'tool_output',
                        'tool': tool_knowledge.get('tool'),
                        'knowledge_id': tool_knowledge.get('knowledge_id'),
                        'relevance': tool_knowledge.get('relevance_score')
                    })
            
            # Process extracted entities (if significant)
            if extracted_entities and sum(len(v) for v in extracted_entities.values()) >= 3:
                # Create knowledge entry from entities
                entity_knowledge_id = await self.enrichment_service.save_entity_knowledge(
                    tenant_id=UUID4(tenant_id),
                    agent_id=selected_agent or 'unknown',
                    entities=extracted_entities,
                    context_query=state['query'],
                    confidence=response_confidence
                )
                
                if entity_knowledge_id:
                    enrichment_items.append({
                        'source': 'entity_extraction',
                        'knowledge_id': entity_knowledge_id,
                        'relevance': response_confidence
                    })
            
            logger.info(
                "Knowledge base enriched",
                items_added=len(enrichment_items),
                agent_id=selected_agent
            )
            
            return {
                **state,
                'knowledge_enriched': True,
                'enrichment_items': enrichment_items,
                'enrichment_count': len(enrichment_items),
                'current_node': 'enrich_knowledge_base'
            }
            
        except Exception as e:
            logger.error("❌ Knowledge base enrichment failed", error=str(e))
            return {
                **state,
                'knowledge_enriched': False,
                'errors': state.get('errors', []) + [f"Knowledge enrichment failed: {str(e)}"],
                'current_node': 'enrich_knowledge_base'
            }
    
    # =========================================================================
    # VERIFY KNOWLEDGE NODE
    # =========================================================================
    
    @trace_node("verify_knowledge")
    async def verify_knowledge_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Verify captured knowledge quality.
        
        Performs quality checks on captured knowledge:
        - Relevance scoring
        - Deduplication check
        - Source credibility
        - Factual consistency
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with verified_knowledge
        """
        tenant_id = state['tenant_id']
        enrichment_items = state.get('enrichment_items', [])
        
        if not enrichment_items:
            logger.debug("No enrichment items to verify")
            return {
                **state,
                'current_node': 'verify_knowledge'
            }
        
        try:
            verified_items = []
            
            for item in enrichment_items:
                knowledge_id = item.get('knowledge_id')
                if not knowledge_id:
                    continue
                
                # Verify knowledge item
                verification_result = await self.enrichment_service.verify_knowledge(
                    tenant_id=UUID4(tenant_id),
                    knowledge_id=UUID4(knowledge_id)
                )
                
                if verification_result.get('verified'):
                    verified_items.append({
                        **item,
                        'verified': True,
                        'verification_score': verification_result.get('score', 0.0)
                    })
            
            logger.info(
                "Knowledge verified",
                total_items=len(enrichment_items),
                verified_items=len(verified_items)
            )
            
            return {
                **state,
                'verified_knowledge': verified_items,
                'verification_rate': len(verified_items) / len(enrichment_items) if enrichment_items else 0.0,
                'current_node': 'verify_knowledge'
            }
            
        except Exception as e:
            logger.error("❌ Knowledge verification failed", error=str(e))
            return {
                **state,
                'verified_knowledge': enrichment_items,  # Return unverified
                'errors': state.get('errors', []) + [f"Knowledge verification failed: {str(e)}"],
                'current_node': 'verify_knowledge'
            }

