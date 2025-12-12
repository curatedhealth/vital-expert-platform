"""
Agent Node Compiler
Compiles agent nodes into executable LangGraph functions
"""

from typing import Dict, Callable, Any
import structlog
from openai import AsyncOpenAI

from ..state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()


async def compile_agent_node(node_data: Dict[str, Any], postgres_client) -> Callable:
    """
    Compile agent node into executable function
    
    Args:
        node_data: {
            'node_key': str,
            'agent_id': UUID,
            'config': {
                'system_prompt_override': str (optional),
                'temperature': float (optional),
                'max_tokens': int (optional),
                'model': str (optional)
            }
        }
        postgres_client: PostgreSQL client for loading agent data
    
    Returns:
        Async function that executes agent
    """
    node_key = node_data['node_key']
    agent_id = node_data.get('agent_id')
    config = node_data.get('config', {})
    
    if not agent_id:
        raise ValueError(f"Agent node {node_key} missing agent_id")
    
    # Load agent from database
    agent_query = """
        SELECT id, name, system_prompt, model_provider, model_name,
               temperature, max_tokens, role_name, department_name
        FROM agents
        WHERE id = $1 AND status = 'active'
    """
    agent = await postgres_client.fetchrow(agent_query, agent_id)
    
    if not agent:
        raise ValueError(f"Agent {agent_id} not found or inactive")
    
    # Extract configuration
    system_prompt = config.get('system_prompt_override') or agent['system_prompt']
    temperature = config.get('temperature', agent.get('temperature', 0.7))
    max_tokens = config.get('max_tokens', agent.get('max_tokens', 2000))
    model = config.get('model', agent.get('model_name', 'gpt-4-turbo-preview'))
    
    logger.info(
        "agent_node_compiled",
        node_key=node_key,
        agent_id=str(agent_id),
        agent_name=agent['name']
    )
    
    # Create OpenAI client
    from core.config import get_settings
    settings = get_settings()
    openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def agent_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Execute agent node"""
        try:
            logger.info(
                "agent_node_executing",
                node_key=node_key,
                agent_name=agent['name']
            )
            
            # Build messages
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # Add context if available
            if state.get('context'):
                context_msg = f"Context:\n{state['context']}"
                messages.append({"role": "system", "content": context_msg})
            
            # Add user query
            messages.append({"role": "user", "content": state['query']})
            
            # Call OpenAI
            response = await openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            agent_response = response.choices[0].message.content
            
            # Update state
            state['agent_response'] = agent_response
            state['last_agent_id'] = str(agent_id)
            state['last_agent_name'] = agent['name']
            
            logger.info(
                "agent_node_complete",
                node_key=node_key,
                agent_name=agent['name'],
                response_length=len(agent_response)
            )
            
            return state
            
        except Exception as e:
            logger.error(
                "agent_node_failed",
                node_key=node_key,
                error=str(e)
            )
            state['error'] = f"Agent execution failed: {str(e)}"
            return state
    
    return agent_node
