"""
Router Node Compiler
Compiles conditional routing nodes for LangGraph
"""

from typing import Dict, Any, Callable
import structlog

from ..state import AgentState

logger = structlog.get_logger()


async def compile_router_node(node_config: Dict[str, Any]) -> Callable:
    """
    Compile router node for conditional logic
    
    Router nodes determine the next node based on:
    - State conditions
    - Confidence thresholds
    - User preferences
    - Error handling
    
    Args:
        node_config: Node configuration from database
        
    Returns:
        Async callable node function
    """
    config = node_config.get('config', {})
    node_name = node_config['node_name']
    routing_logic = config.get('routing_logic', {})
    
    async def router_node(state: AgentState) -> AgentState:
        """Execute router node"""
        try:
            logger.info(
                "router_node_executing",
                node_name=node_name
            )
            
            state['execution_path'].append(node_name)
            state['current_step'] = node_name
            
            # Determine next node based on routing logic
            next_node = _determine_next_node(state, routing_logic)
            
            state['next_node'] = next_node
            
            logger.info(
                "router_node_complete",
                node_name=node_name,
                next_node=next_node
            )
            
            return state
            
        except Exception as e:
            logger.error(
                "router_node_failed",
                node_name=node_name,
                error=str(e)
            )
            state['error'] = str(e)
            state['next_node'] = 'error'
            return state
    
    return router_node


def _determine_next_node(state: AgentState, routing_logic: Dict) -> str:
    """Determine next node based on routing logic"""
    
    # Check for errors first
    if state.get('error'):
        return routing_logic.get('on_error', 'end')
    
    # Check confidence threshold
    confidence_threshold = routing_logic.get('confidence_threshold')
    if confidence_threshold and state.get('confidence'):
        if state['confidence'] < confidence_threshold:
            return routing_logic.get('low_confidence_path', 'human_review')
        else:
            return routing_logic.get('high_confidence_path', 'end')
    
    # Check requires_human_review flag
    if state.get('requires_human_review'):
        return routing_logic.get('human_review_path', 'human')
    
    # Check loop count
    if state.get('loop_count', 0) >= state.get('max_loops', 10):
        logger.warning("max_loops_exceeded", loop_count=state['loop_count'])
        return routing_logic.get('max_loops_path', 'end')
    
    # Default path
    return routing_logic.get('default_path', 'end')

