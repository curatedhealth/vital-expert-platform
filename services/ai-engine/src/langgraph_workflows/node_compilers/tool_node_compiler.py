"""
Tool Node Compiler
Compiles tool nodes into executable LangGraph functions
"""

from typing import Dict, Callable, Any
import structlog
from ..state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()

async def compile_tool_node(node_data: Dict[str, Any], postgres_client) -> Callable:
    """Compile tool node into executable function"""
    node_key = node_data['node_key']
    tool_id = node_data.get('tool_id')
    
    if not tool_id:
        raise ValueError(f"Tool node {node_key} missing tool_id")
    
    tool_query = "SELECT id, tool_key, name FROM tools WHERE id = $1 AND is_active = true"
    tool = await postgres_client.fetchrow(tool_query, tool_id)
    
    if not tool:
        raise ValueError(f"Tool {tool_id} not found")
    
    logger.info("tool_node_compiled", node_key=node_key, tool_key=tool['tool_key'])
    
    async def tool_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Execute tool node"""
        try:
            from services.tool_registry_service import get_tool_registry
            tool_registry = get_tool_registry()
            result = await tool_registry.execute_tool(
                tool_key=tool['tool_key'],
                input_data=state.get('tool_input', {}),
                context=state
            )
            state['tool_output'] = result
            state['tools_used'] = state.get('tools_used', []) + [tool['tool_key']]
            return state
        except Exception as e:
            logger.error("tool_node_failed", error=str(e))
            state['error'] = f"Tool failed: {str(e)}"
            return state
    return tool_node
