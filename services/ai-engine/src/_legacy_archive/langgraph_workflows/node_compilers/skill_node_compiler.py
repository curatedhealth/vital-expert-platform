"""
Skill Node Compiler
Compiles skill nodes into executable LangGraph functions
"""

from typing import Dict, Callable, Any
import structlog
import importlib

from ..state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()


async def compile_skill_node(node_data: Dict[str, Any], postgres_client) -> Callable:
    """
    Compile skill node into executable function
    
    Executes Python-based skill from database
    
    Args:
        node_data: {
            'node_key': str,
            'skill_id': UUID,
            'config': {
                'input_mapping': Dict (optional),
                'output_mapping': Dict (optional)
            }
        }
        postgres_client: PostgreSQL client for loading skill data
    
    Returns:
        Async function that executes skill
    """
    node_key = node_data['node_key']
    skill_id = node_data.get('skill_id')
    config = node_data.get('config', {})
    
    if not skill_id:
        raise ValueError(f"Skill node {node_key} missing skill_id")
    
    # Load skill from database
    skill_query = """
        SELECT id, name, slug, description, python_module, callable_name,
               is_executable, complexity_level
        FROM skills
        WHERE id = $1 AND is_active = true
    """
    skill = await postgres_client.fetchrow(skill_query, skill_id)
    
    if not skill:
        raise ValueError(f"Skill {skill_id} not found or inactive")
    
    if not skill['is_executable']:
        raise ValueError(f"Skill {skill['name']} is not executable")
    
    # Get input/output mappings
    input_mapping = config.get('input_mapping', {})
    output_mapping = config.get('output_mapping', {})
    
    logger.info(
        "skill_node_compiled",
        node_key=node_key,
        skill_id=str(skill_id),
        skill_name=skill['name']
    )
    
    async def skill_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Execute skill node"""
        try:
            logger.info(
                "skill_node_executing",
                node_key=node_key,
                skill_name=skill['name']
            )
            
            # Get skill executor from tool registry
            from services.tool_registry_service import get_tool_registry
            tool_registry = get_tool_registry()
            
            # Prepare input data
            skill_input = {}
            if input_mapping:
                for input_key, state_key in input_mapping.items():
                    skill_input[input_key] = state.get(state_key)
            else:
                # Default: pass query and context
                skill_input = {
                    'query': state['query'],
                    'context': state.get('context', '')
                }
            
            # Execute skill
            result = await tool_registry.execute_tool(
                tool_key=skill['slug'],
                input_data=skill_input,
                context=state
            )
            
            # Apply output mapping
            if output_mapping:
                for output_key, state_key in output_mapping.items():
                    if output_key in result:
                        state[state_key] = result[output_key]
            else:
                # Default: store in skill_output
                state['skill_output'] = result
            
            logger.info(
                "skill_node_complete",
                node_key=node_key,
                skill_name=skill['name']
            )
            
            return state
            
        except Exception as e:
            logger.error(
                "skill_node_failed",
                node_key=node_key,
                error=str(e)
            )
            state['error'] = f"Skill execution failed: {str(e)}"
            return state
    
    return skill_node
