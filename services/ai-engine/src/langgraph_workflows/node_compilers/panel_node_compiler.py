"""
Panel Node Compiler
Compiles panel nodes (multi-agent orchestration) into executable LangGraph functions
"""

from typing import Dict, Callable, Any
import structlog
from ..state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()

async def compile_panel_node(node_data: Dict[str, Any], postgres_client) -> Callable:
    """Compile panel node into executable function"""
    node_key = node_data['node_key']
    config = node_data.get('config', {})
    agent_ids = config.get('agent_ids', [])
    panel_type = config.get('panel_type', 'parallel')
    
    if not agent_ids:
        raise ValueError(f"Panel node {node_key} missing agent_ids")
    
    logger.info("panel_node_compiled", node_key=node_key, agent_count=len(agent_ids))
    
    async def panel_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Execute panel node"""
        try:
            from services.panel_orchestrator import get_panel_orchestrator
            panel_service = get_panel_orchestrator()
            result = await panel_service.execute_panel(
                query=state['query'],
                agent_ids=[str(aid) for aid in agent_ids],
                panel_type=panel_type,
                context=state.get('context', '')
            )
            state['panel_responses'] = result.get('responses', [])
            state['panel_consensus'] = result.get('consensus', '')
            return state
        except Exception as e:
            logger.error("panel_node_failed", error=str(e))
            state['error'] = f"Panel failed: {str(e)}"
            return state
    return panel_node
