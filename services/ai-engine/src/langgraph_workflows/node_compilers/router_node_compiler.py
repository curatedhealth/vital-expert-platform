"""
Router Node Compiler
Compiles router nodes (conditional routing logic) into executable LangGraph functions
"""

from typing import Dict, Callable, Any
import structlog
from ..state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()

async def compile_router_node(node_data: Dict[str, Any], postgres_client) -> Callable:
    """Compile router node into executable function"""
    node_key = node_data['node_key']
    config = node_data.get('config', {})
    routing_logic = config.get('routing_logic', {})
    routing_type = routing_logic.get('type', 'tier_based')
    route_key = routing_logic.get('route_key', 'route_decision')
    
    logger.info("router_node_compiled", node_key=node_key, routing_type=routing_type)
    
    async def router_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Execute router node"""
        try:
            route = 'default'
            if routing_type == 'tier_based':
                tier = state.get('tier', 1)
                route = f'tier_{tier}'
            elif routing_type == 'confidence_based':
                confidence = state.get('confidence_score', 0.5)
                route = 'high' if confidence >= 0.8 else 'low'
            state[route_key] = route
            return state
        except Exception as e:
            logger.error("router_node_failed", error=str(e))
            state[route_key] = 'error'
            return state
    return router_node
