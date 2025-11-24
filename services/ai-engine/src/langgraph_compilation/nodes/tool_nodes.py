"""
Tool Node Compiler
Compiles tool execution nodes for LangGraph

Integrates with the production Tool Registry for real tool execution.
"""

from typing import Dict, Any, Callable
from uuid import UUID
import structlog

from graphrag.clients.postgres_client import get_postgres_client
from services.tool_registry import get_tool_registry
from ..state import AgentState

logger = structlog.get_logger()


async def compile_tool_node(node_config: Dict[str, Any]) -> Callable:
    """
    Compile tool execution node
    
    Tool nodes execute external tools:
    - API calls
    - Database queries
    - File operations
    - External services
    
    Args:
        node_config: Node configuration from database
        
    Returns:
        Async callable node function
    """
    config = node_config.get('config', {})
    node_name = node_config['node_name']
    tool_id = config.get('tool_id')
    
    # Load tool configuration
    pg = await get_postgres_client()
    tool_data = await _load_tool(pg, tool_id) if tool_id else None
    
    async def tool_node(state: AgentState) -> AgentState:
        """Execute tool node"""
        try:
            logger.info(
                "tool_node_executing",
                node_name=node_name,
                tool_id=str(tool_id) if tool_id else "none"
            )
            
            state['execution_path'].append(node_name)
            state['current_step'] = node_name
            
            if not tool_data:
                raise ValueError(f"Tool not found: {tool_id}")
            
            # Execute tool
            tool_result = await _execute_tool(state, tool_data, config)
            
            # Record tool call
            state['tool_calls'].append({
                "tool_id": str(tool_id),
                "tool_name": tool_data['name'],
                "node_name": node_name
            })
            
            # Record result
            state['tool_results'].append(tool_result)
            
            # Store in metadata
            state['metadata'][f'{node_name}_result'] = tool_result
            
            logger.info(
                "tool_node_complete",
                node_name=node_name,
                tool_name=tool_data['name']
            )
            
            return state
            
        except Exception as e:
            logger.error(
                "tool_node_failed",
                node_name=node_name,
                error=str(e)
            )
            state['error'] = str(e)
            return state
    
    return tool_node


async def _load_tool(pg, tool_id: UUID) -> Dict[str, Any]:
    """Load tool configuration from database"""
    query = """
    SELECT
        id,
        name,
        slug,
        description,
        tool_type,
        endpoint_url,
        function_spec,
        metadata
    FROM tools
    WHERE id = $1 AND deleted_at IS NULL
    """
    
    return await pg.fetchrow(query, tool_id)


async def _execute_tool(
    state: AgentState,
    tool_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """
    Execute tool using production Tool Registry
    
    This integrates with the existing tool registry that's used
    across all VITAL services (Ask Expert, Workflows, etc.)
    """
    
    # Get tool registry
    registry = get_tool_registry()
    
    # Get tool by name (try both 'name' and 'slug')
    tool_name = tool_data.get('name') or tool_data.get('slug')
    tool = registry.get_tool(tool_name)
    
    if not tool:
        logger.warning(
            "tool_not_found_in_registry",
            tool_name=tool_name,
            tool_id=tool_data.get('id')
        )
        return {
            "success": False,
            "tool_name": tool_name,
            "error": f"Tool not found in registry: {tool_name}",
            "fallback": "Registry lookup failed, tool may not be registered"
        }
    
    try:
        # Build tool context from state
        tool_context = {
            "tenant_id": str(state.get('tenant_id')) if state.get('tenant_id') else None,
            "user_id": str(state.get('user_id')) if state.get('user_id') else None,
            "session_id": str(state.get('session_id')) if state.get('session_id') else None,
            "query": state.get('query'),
            "agent_id": str(state.get('agent_id')) if state.get('agent_id') else None
        }
        
        # Get input data from config or build from state
        input_data = config.get('input_data', {})
        if not input_data:
            # Default: use query as input
            input_data = {"query": state.get('query', '')}
        
        logger.info(
            "executing_tool_via_registry",
            tool_name=tool_name,
            tool_category=tool.category
        )
        
        # Execute tool via registry
        result = await tool.execute(
            input_data=input_data,
            context=tool_context
        )
        
        # Record usage in registry
        registry.record_usage(tool_name, success=result.get('success', True))
        
        logger.info(
            "tool_execution_complete",
            tool_name=tool_name,
            success=result.get('success', True)
        )
        
        return {
            "success": True,
            "tool_name": tool_name,
            "tool_category": tool.category,
            "result": result,
            "via_registry": True
        }
        
    except Exception as e:
        logger.error(
            "tool_execution_failed",
            tool_name=tool_name,
            error=str(e)
        )
        
        # Record failure in registry
        registry.record_usage(tool_name, success=False)
        
        return {
            "success": False,
            "tool_name": tool_name,
            "error": str(e),
            "via_registry": True
        }

