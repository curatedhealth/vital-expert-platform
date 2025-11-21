"""
LangGraph Feedback Collection Nodes

These nodes integrate user feedback collection, confidence calculation, and rating tracking
into LangGraph workflows following Golden Rule #5 (feedback-driven improvement).

Golden Rules Compliance:
- ✅ #1: All nodes designed for LangGraph StateGraph integration
- ✅ #2: Caching integrated for feedback metrics
- ✅ #3: Tenant isolation enforced
- ✅ #5: Feedback-driven continuous improvement

Usage:
    from langgraph_workflows.feedback_nodes import FeedbackNodes
    
    feedback_nodes = FeedbackNodes(supabase_client, cache_manager, feedback_manager)
    
    # Add to LangGraph workflow
    graph.add_node("collect_implicit_feedback", feedback_nodes.collect_implicit_feedback_node)
    graph.add_node("calculate_confidence", feedback_nodes.calculate_confidence_node)
    graph.add_node("prepare_feedback_collection", feedback_nodes.prepare_feedback_collection_node)
"""

import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import structlog
from pydantic import UUID4

from langgraph_workflows.state_schemas import UnifiedWorkflowState
from langgraph_workflows.observability import trace_node
from services.feedback_manager import FeedbackManager, FeedbackRequest
from services.confidence_calculator import ConfidenceCalculator
from services.cache_manager import CacheManager
from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class FeedbackNodes:
    """
    LangGraph nodes for feedback collection and confidence calculation.
    
    Features:
    - Implicit feedback collection (response time, agent switches, etc.)
    - Multi-factor confidence calculation
    - Feedback preparation for frontend UI
    - Integration with FeedbackManager service
    - Caching for performance metrics
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager: Optional[CacheManager] = None,
        feedback_manager: Optional[FeedbackManager] = None,
        confidence_calculator: Optional[ConfidenceCalculator] = None
    ):
        """
        Initialize feedback nodes.
        
        Args:
            supabase_client: Supabase client for database access
            cache_manager: Cache manager for performance optimization
            feedback_manager: Feedback manager service
            confidence_calculator: Confidence calculation service
        """
        self.supabase = supabase_client
        self.cache = cache_manager
        self.feedback_manager = feedback_manager or FeedbackManager(supabase_client, cache_manager)
        self.confidence_calculator = confidence_calculator or ConfidenceCalculator()
        
        logger.info("✅ FeedbackNodes initialized")
    
    # =========================================================================
    # CONFIDENCE CALCULATION NODE
    # =========================================================================
    
    @trace_node("calculate_confidence")
    async def calculate_confidence_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Calculate multi-factor confidence score.
        
        Confidence Factors:
        1. Agent performance (historical success rate) - 30%
        2. RAG retrieval quality (relevance scores) - 25%
        3. Response grounding (citations/sources used) - 25%
        4. Query-answer alignment (semantic similarity) - 20%
        
        Golden Rule #2: Cache confidence calculations for similar queries.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with confidence score and breakdown
        """
        tenant_id = state['tenant_id']
        query = state['query']
        agent_response = state.get('agent_response', '')
        selected_agent = state['selected_agents'][-1] if state.get('selected_agents') else None
        retrieved_documents = state.get('retrieved_documents', [])
        citations = state.get('citations', [])
        
        try:
            # Check cache first (Golden Rule #2)
            cache_key = f"confidence:{tenant_id}:{hash(query)}:{hash(agent_response[:100])}"
            if self.cache:
                cached_confidence = await self.cache.get(cache_key)
                if cached_confidence:
                    logger.debug("✅ Confidence calculation cache hit")
                    return {
                        **state,
                        'response_confidence': cached_confidence['overall_score'],
                        'confidence_breakdown': cached_confidence['breakdown'],
                        'confidence_factors': cached_confidence['factors'],
                        'cache_hits': state.get('cache_hits', 0) + 1,
                        'current_node': 'calculate_confidence'
                    }
            
            # Get agent performance from feedback manager
            agent_performance_score = 0.5  # Default neutral
            if self.feedback_manager and selected_agent:
                try:
                    performance_data = await self.feedback_manager.get_agent_performance(
                        tenant_id=UUID4(tenant_id),
                        agent_id=selected_agent,
                        limit=1
                    )
                    if performance_data:
                        agent_performance_score = performance_data[0].recommendation_score
                except Exception as e:
                    logger.warning(f"Could not fetch agent performance: {e}")
            
            # Calculate confidence using ConfidenceCalculator
            confidence_result = await self.confidence_calculator.calculate_confidence(
                query=query,
                response=agent_response,
                agent_id=selected_agent or 'unknown',
                agent_performance_score=agent_performance_score,
                rag_documents=retrieved_documents,
                citations=citations,
                tools_used=state.get('tools_used', []),
                conversation_history=state.get('conversation_history', [])
            )
            
            overall_confidence = confidence_result['overall_confidence']
            breakdown = confidence_result['breakdown']
            factors = confidence_result['factors']
            
            # Cache result (Golden Rule #2)
            if self.cache:
                await self.cache.set(
                    cache_key,
                    {
                        'overall_score': overall_confidence,
                        'breakdown': breakdown,
                        'factors': factors
                    },
                    ttl=3600  # 1 hour
                )
            
            logger.info(
                "Confidence calculated",
                overall_score=overall_confidence,
                agent_performance=breakdown.get('agent_performance', 0),
                rag_quality=breakdown.get('rag_quality', 0),
                grounding=breakdown.get('grounding', 0)
            )
            
            return {
                **state,
                'response_confidence': overall_confidence,
                'confidence_breakdown': breakdown,
                'confidence_factors': factors,
                'current_node': 'calculate_confidence'
            }
            
        except Exception as e:
            logger.error("❌ Confidence calculation failed", error=str(e))
            return {
                **state,
                'response_confidence': 0.5,  # Neutral fallback
                'confidence_breakdown': {},
                'errors': state.get('errors', []) + [f"Confidence calculation failed: {str(e)}"],
                'current_node': 'calculate_confidence'
            }
    
    # =========================================================================
    # IMPLICIT FEEDBACK COLLECTION NODE
    # =========================================================================
    
    @trace_node("collect_implicit_feedback")
    async def collect_implicit_feedback_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Collect implicit feedback signals.
        
        Implicit Feedback Signals:
        - Response time (latency)
        - Agent switches (user changed agent)
        - Session abandonment (user left without follow-up)
        - Query refinement (user rephrased query)
        - Tool usage effectiveness
        
        Golden Rule #5: Implicit feedback informs agent improvement.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with implicit feedback data
        """
        start_time = state.get('workflow_start_time', datetime.now(timezone.utc))
        current_time = datetime.now(timezone.utc)
        
        try:
            # Calculate response time
            response_time_ms = (current_time - start_time).total_seconds() * 1000
            
            # Detect agent switch
            selected_agents = state.get('selected_agents', [])
            agent_switched = len(set(selected_agents)) > 1  # Multiple unique agents used
            
            # Detect query refinement (similar queries in conversation history)
            conversation_history = state.get('conversation_history', [])
            query = state['query']
            query_refined = any(
                self._is_similar_query(query, turn.get('user_message', ''))
                for turn in conversation_history[-3:]  # Check last 3 turns
            )
            
            # Tool usage effectiveness (did tools return useful data?)
            tools_used = state.get('tools_used', [])
            tools_effective = len(tools_used) > 0 and state.get('response_confidence', 0) > 0.7
            
            implicit_feedback = {
                'response_time_ms': response_time_ms,
                'agent_switched': agent_switched,
                'query_refined': query_refined,
                'tools_used_count': len(tools_used),
                'tools_effective': tools_effective,
                'rag_documents_retrieved': len(state.get('retrieved_documents', [])),
                'conversation_length': len(conversation_history),
                'timestamp': current_time.isoformat()
            }
            
            logger.info(
                "Implicit feedback collected",
                response_time_ms=response_time_ms,
                agent_switched=agent_switched,
                tools_effective=tools_effective
            )
            
            return {
                **state,
                'implicit_feedback': implicit_feedback,
                'current_node': 'collect_implicit_feedback'
            }
            
        except Exception as e:
            logger.error("❌ Implicit feedback collection failed", error=str(e))
            return {
                **state,
                'implicit_feedback': {},
                'errors': state.get('errors', []) + [f"Implicit feedback collection failed: {str(e)}"],
                'current_node': 'collect_implicit_feedback'
            }
    
    # =========================================================================
    # PREPARE FEEDBACK COLLECTION NODE
    # =========================================================================
    
    @trace_node("prepare_feedback_collection")
    async def prepare_feedback_collection_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Prepare feedback collection data for frontend UI.
        
        Prepares structured data that frontend can use to display:
        - Star rating widget (1-5 stars)
        - Feedback category buttons (helpful, incorrect, incomplete, excellent)
        - Optional text feedback field
        - Confidence indicator
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with feedback_collection_data
        """
        try:
            selected_agent = state['selected_agents'][-1] if state.get('selected_agents') else 'unknown'
            
            feedback_collection_data = {
                'session_id': state.get('session_id', ''),
                'agent_id': selected_agent,
                'agent_type': state.get('agent_type', 'general'),
                'query': state['query'],
                'response': state.get('agent_response', ''),
                'confidence': state.get('response_confidence', 0.0),
                'response_time_ms': state.get('implicit_feedback', {}).get('response_time_ms', 0),
                'rag_enabled': state.get('enable_rag', True),
                'tools_enabled': state.get('enable_tools', False),
                'model_used': state.get('model_used', 'gpt-4'),
                'implicit_feedback': state.get('implicit_feedback', {}),
                'categories': [
                    {'id': 'helpful', 'label': 'Helpful', 'icon': '👍'},
                    {'id': 'excellent', 'label': 'Excellent', 'icon': '⭐'},
                    {'id': 'incorrect', 'label': 'Incorrect', 'icon': '❌'},
                    {'id': 'incomplete', 'label': 'Incomplete', 'icon': '🤔'}
                ],
                'rating_scale': {'min': 1, 'max': 5, 'default': 3}
            }
            
            logger.debug("Feedback collection data prepared for frontend")
            
            return {
                **state,
                'feedback_collection_data': feedback_collection_data,
                'current_node': 'prepare_feedback_collection'
            }
            
        except Exception as e:
            logger.error("❌ Failed to prepare feedback collection", error=str(e))
            return {
                **state,
                'feedback_collection_data': {},
                'errors': state.get('errors', []) + [f"Feedback preparation failed: {str(e)}"],
                'current_node': 'prepare_feedback_collection'
            }
    
    # =========================================================================
    # SUBMIT FEEDBACK NODE (for explicit feedback from frontend)
    # =========================================================================
    
    @trace_node("submit_feedback")
    async def submit_feedback_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Submit explicit user feedback to database.
        
        This node is called when user provides explicit feedback via UI:
        - Star rating (1-5)
        - Feedback categories (helpful, incorrect, etc.)
        - Optional text feedback
        
        Golden Rule #5: Store feedback for agent improvement.
        
        Args:
            state: Current workflow state with 'user_feedback' field
            
        Returns:
            Updated state with feedback submission result
        """
        tenant_id = state['tenant_id']
        user_feedback = state.get('user_feedback', {})
        
        if not user_feedback:
            logger.debug("No user feedback to submit")
            return {
                **state,
                'current_node': 'submit_feedback'
            }
        
        try:
            selected_agent = state['selected_agents'][-1] if state.get('selected_agents') else 'unknown'
            
            # Create FeedbackRequest
            feedback_request = FeedbackRequest(
                tenant_id=UUID4(tenant_id),
                session_id=state.get('session_id', 'unknown'),
                user_id=state.get('user_id'),
                agent_id=selected_agent,
                agent_type=state.get('agent_type', 'general'),
                query=state['query'],
                response=state.get('agent_response', ''),
                rating=user_feedback.get('rating'),
                feedback_text=user_feedback.get('feedback_text'),
                feedback_category=user_feedback.get('feedback_categories', []),
                implicit_feedback=state.get('implicit_feedback', {}),
                metadata={
                    'response_time_ms': state.get('implicit_feedback', {}).get('response_time_ms', 0),
                    'confidence': state.get('response_confidence', 0.0),
                    'rag_enabled': state.get('enable_rag', True),
                    'tools_enabled': state.get('enable_tools', False),
                    'model_used': state.get('model_used', 'gpt-4'),
                    'documents_retrieved': len(state.get('retrieved_documents', []))
                }
            )
            
            # Submit feedback
            feedback_response = await self.feedback_manager.submit_feedback(feedback_request)
            
            if feedback_response.status == "success":
                logger.info(
                    "✅ User feedback submitted",
                    feedback_id=str(feedback_response.feedback_id),
                    rating=user_feedback.get('rating')
                )
                return {
                    **state,
                    'feedback_submitted': True,
                    'feedback_id': str(feedback_response.feedback_id),
                    'current_node': 'submit_feedback'
                }
            else:
                logger.error("❌ Feedback submission failed", message=feedback_response.message)
                return {
                    **state,
                    'feedback_submitted': False,
                    'errors': state.get('errors', []) + [f"Feedback submission failed: {feedback_response.message}"],
                    'current_node': 'submit_feedback'
                }
        
        except Exception as e:
            logger.error("❌ Failed to submit feedback", error=str(e))
            return {
                **state,
                'feedback_submitted': False,
                'errors': state.get('errors', []) + [f"Feedback submission error: {str(e)}"],
                'current_node': 'submit_feedback'
            }
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    
    def _is_similar_query(self, query1: str, query2: str) -> bool:
        """
        Check if two queries are similar (simple implementation).
        
        Args:
            query1: First query
            query2: Second query
            
        Returns:
            True if queries are similar, False otherwise
        """
        if not query1 or not query2:
            return False
        
        # Simple similarity check (can be enhanced with embeddings)
        query1_words = set(query1.lower().split())
        query2_words = set(query2.lower().split())
        
        if not query1_words or not query2_words:
            return False
        
        intersection = query1_words.intersection(query2_words)
        union = query1_words.union(query2_words)
        
        similarity = len(intersection) / len(union)
        return similarity > 0.6  # 60% word overlap threshold

