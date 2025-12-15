"""
Hierarchical Agent Node Compiler

Compiles agent graph nodes that use LangChain Deep Agents for hierarchical execution.

Integrates:
- DelegationEngine: Evaluate when to use deep agents
- DeepAgentFactory: Create deep agents from DB config
- VITALSubAgentMiddleware: Custom subagent middleware
- Memory backends: Ephemeral + persistent storage

Supports all VITAL execution modes:
- Ask Expert (interactive chat)
- Ask Expert (autonomous)
- Ask Panel (panel member with subagents)
- Workflows (task agent with subagents)
"""

from typing import Callable, Dict, Any, Optional
from uuid import UUID

from ...graphrag.clients.postgres_client import PostgresClient
from .delegation_engine import (
    DelegationEngine,
    ExecutionMode,
    should_use_deep_agent
)
from .deep_agent_factory import create_vital_deep_agent
from .memory_backend import create_vital_backend, create_tenant_isolated_store
from ..models import AgentGraphNode


async def compile_hierarchical_agent_node(
    node: AgentGraphNode,
    postgres_client: PostgresClient,
    config=None
) -> Callable:
    """
    Compile agent node with deep agent support
    
    Decision flow:
    1. Load agent config and hierarchy
    2. Evaluate if deep agent needed (DelegationEngine)
    3. If yes → Create deep agent with subagents
    4. If no → Create standard agent
    5. Return compiled node function
    
    Args:
        node: AgentGraphNode from agent_graph_nodes table
        postgres_client: Postgres client for DB access
        config: Optional config overrides
        
    Returns:
        Compiled node function for LangGraph
    """
    
    agent_id = node.agent_id
    
    async def hierarchical_agent_node(state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute agent with optional deep agent features
        
        State keys used:
        - query / question: User input
        - execution_mode: How agent is being invoked
        - tenant_id: Tenant context
        - user_id: User context
        - context: Retrieved knowledge (optional)
        - retrieved_documents: RAG documents (optional)
        
        State keys set:
        - response: Agent's response
        - sub_agent_trace: Subagent execution trace (if applicable)
        - agent_metadata: Execution metadata
        """
        
        # Extract execution context
        execution_mode_str = state.get('execution_mode', 'chat_interactive')
        execution_mode = ExecutionMode(execution_mode_str)
        
        tenant_id = state.get('tenant_id')
        user_id = state.get('user_id')
        
        # Evaluate delegation
        delegation_decision = await should_use_deep_agent(
            agent_id=agent_id,
            execution_mode=execution_mode,
            state=state,
            postgres_client=postgres_client
        )
        
        # Log delegation decision
        state['delegation_decision'] = {
            'use_deep_agent': delegation_decision.use_deep_agent,
            'reasoning': delegation_decision.reasoning,
            'enabled_features': {
                'subagents': delegation_decision.enable_subagents,
                'filesystem': delegation_decision.enable_filesystem,
                'todos': delegation_decision.enable_todos,
                'memory': delegation_decision.enable_memory
            }
        }
        
        if delegation_decision.use_deep_agent:
            # Execute with deep agent
            result = await _execute_deep_agent(
                agent_id=agent_id,
                delegation_decision=delegation_decision,
                state=state,
                postgres_client=postgres_client,
                tenant_id=tenant_id,
                user_id=user_id,
                config=config
            )
        else:
            # Execute with standard agent
            result = await _execute_standard_agent(
                agent_id=agent_id,
                state=state,
                postgres_client=postgres_client
            )
        
        # Update state with result
        state['response'] = result.get('response', '')
        state['agent_metadata'] = result.get('metadata', {})
        
        if 'sub_agent_trace' in result:
            state['sub_agent_trace'] = result['sub_agent_trace']
        
        return state
    
    return hierarchical_agent_node


async def _execute_deep_agent(
    agent_id: UUID,
    delegation_decision,
    state: Dict[str, Any],
    postgres_client: PostgresClient,
    tenant_id: Optional[UUID],
    user_id: Optional[UUID],
    config=None
) -> Dict[str, Any]:
    """
    Execute agent using deep agent capabilities
    
    Returns:
        Dict with response, metadata, and optional sub_agent_trace
    """
    
    # Extract query
    query = state.get('query') or state.get('question', '')
    
    # Get context if available
    context = state.get('context', '')
    retrieved_docs = state.get('retrieved_documents', [])
    
    # Create deep agent
    deep_agent = await create_vital_deep_agent(
        agent_id=agent_id,
        delegation_decision=delegation_decision,
        postgres_client=postgres_client,
        tools=None,  # TODO: Load tools from DB
        config=config
    )
    
    # Build initial messages
    messages = state.get('messages', [])
    
    # Add context to messages if available
    if context and not messages:
        system_context = _build_context_message(context, retrieved_docs)
        messages = [
            {"role": "system", "content": system_context},
            {"role": "user", "content": query}
        ]
    elif not messages:
        messages = [{"role": "user", "content": query}]
    
    # Execute deep agent
    try:
        result = await deep_agent.ainvoke({
            "messages": messages,
            "tenant_id": str(tenant_id) if tenant_id else None,
            "user_id": str(user_id) if user_id else None
        })
        
        # Extract response
        response_content = _extract_response_from_result(result)
        
        # Extract subagent trace if available
        sub_agent_trace = _extract_subagent_trace(result)
        
        # Build metadata
        metadata = {
            'agent_id': str(agent_id),
            'execution_type': 'deep_agent',
            'features_used': {
                'subagents': delegation_decision.enable_subagents,
                'filesystem': delegation_decision.enable_filesystem,
                'todos': delegation_decision.enable_todos,
                'memory': delegation_decision.enable_memory
            },
            'tokens_used': result.get('usage', {}).get('total_tokens', 0)
        }
        
        return {
            'response': response_content,
            'metadata': metadata,
            'sub_agent_trace': sub_agent_trace
        }
        
    except Exception as e:
        # Fallback to standard agent on error
        print(f"Deep agent execution failed: {e}. Falling back to standard agent.")
        return await _execute_standard_agent(
            agent_id=agent_id,
            state=state,
            postgres_client=postgres_client
        )


async def _execute_standard_agent(
    agent_id: UUID,
    state: Dict[str, Any],
    postgres_client: PostgresClient
) -> Dict[str, Any]:
    """
    Execute agent using standard (non-deep) approach
    
    TODO: Implement standard agent execution
    For now, returns placeholder
    """
    
    query = state.get('query') or state.get('question', '')
    
    # Load agent config
    agent = await postgres_client.fetch_one("""
        SELECT id, name, system_prompt, model
        FROM agents
        WHERE id = $1
    """, agent_id)
    
    if not agent:
        return {
            'response': f"Error: Agent {agent_id} not found",
            'metadata': {'error': 'agent_not_found'}
        }
    
    # Placeholder response
    # TODO: Implement actual LLM call with standard agent
    response = f"[Standard Agent {agent['name']}] Processing: {query}"
    
    return {
        'response': response,
        'metadata': {
            'agent_id': str(agent_id),
            'execution_type': 'standard_agent'
        }
    }


def _build_context_message(context: str, retrieved_docs: list) -> str:
    """Build system message with context"""
    message = "You have access to the following relevant information:\n\n"
    message += context
    
    if retrieved_docs:
        message += "\n\nSources:\n"
        for i, doc in enumerate(retrieved_docs[:5], 1):
            title = doc.get('title', doc.get('source', f'Document {i}'))
            message += f"{i}. {title}\n"
    
    return message


def _extract_response_from_result(result: Dict[str, Any]) -> str:
    """Extract response text from deep agent result"""
    
    # Deep agent results come in different formats
    # Try common patterns
    
    if isinstance(result, str):
        return result
    
    # LangGraph state result
    if 'messages' in result:
        messages = result['messages']
        if messages and isinstance(messages, list):
            last_message = messages[-1]
            if isinstance(last_message, dict):
                return last_message.get('content', '')
            return str(last_message)
    
    # Direct response key
    if 'response' in result:
        return result['response']
    
    # Content key
    if 'content' in result:
        return result['content']
    
    # Output key
    if 'output' in result:
        return result['output']
    
    # Fallback
    return str(result)


def _extract_subagent_trace(result: Dict[str, Any]) -> Optional[list]:
    """Extract subagent execution trace if available"""
    
    # Look for subagent trace in result
    if isinstance(result, dict):
        if 'subagent_trace' in result:
            return result['subagent_trace']
        
        if 'intermediate_steps' in result:
            return result['intermediate_steps']
        
        # Check for LangGraph execution trace
        if 'execution_trace' in result:
            return result['execution_trace']
    
    return None


# Export for use in compiler.py
__all__ = [
    'compile_hierarchical_agent_node'
]

