"""
Agent Node Compiler
Compiles standard agent nodes for LangGraph execution
"""

from typing import Dict, Any, Callable
from uuid import UUID
import structlog
from openai import AsyncOpenAI

from graphrag.clients.postgres_client import get_postgres_client
from graphrag import get_graphrag_service, GraphRAGRequest
from ..state import AgentState

logger = structlog.get_logger()


async def compile_agent_node(node_config: Dict[str, Any]) -> Callable:
    """
    Compile agent node from configuration
    
    Agent nodes execute standard LLM-based reasoning with:
    - RAG context retrieval
    - System prompt
    - Chat completion
    - Response generation
    
    Args:
        node_config: Node configuration from database
        
    Returns:
        Async callable node function
    """
    agent_id = node_config.get('agent_id')
    config = node_config.get('config', {})
    node_name = node_config['node_name']
    
    # Load agent configuration
    pg = await get_postgres_client()
    agent_data = await _load_agent(pg, agent_id)
    
    if not agent_data:
        raise ValueError(f"Agent not found: {agent_id}")
    
    # Create OpenAI client
    from graphrag.config import get_graphrag_config
    graphrag_config = get_graphrag_config()
    openai_client = AsyncOpenAI(api_key=graphrag_config.openai_api_key)
    
    async def agent_node(state: AgentState) -> AgentState:
        """Execute agent node"""
        try:
            logger.info(
                "agent_node_executing",
                node_name=node_name,
                agent_id=str(agent_id),
                query=state['query'][:50]
            )
            
            # Track execution
            state['execution_path'].append(node_name)
            state['current_step'] = node_name
            
            # Step 1: Get RAG context if not already present
            if not state.get('context') and config.get('use_rag', True):
                graphrag_service = await get_graphrag_service()
                
                rag_request = GraphRAGRequest(
                    query=state['query'],
                    agent_id=agent_id,
                    session_id=state['session_id'],
                    user_id=state.get('user_id'),
                    tenant_id=state.get('tenant_id'),
                    include_graph_evidence=True,
                    include_citations=True
                )
                
                rag_response = await graphrag_service.query(rag_request)
                
                # Update state with RAG results
                state['context'] = "\n\n".join([
                    chunk.text for chunk in rag_response.context_chunks
                ])
                state['context_chunks'] = [
                    chunk.model_dump() for chunk in rag_response.context_chunks
                ]
                state['citations'] = {
                    k: v.model_dump() for k, v in rag_response.citations.items()
                }
                
                if rag_response.evidence_chain:
                    state['evidence_chain'] = [
                        e.model_dump() for e in rag_response.evidence_chain
                    ]
            
            # Step 2: Build messages for LLM
            messages = []
            
            # System prompt
            system_prompt = agent_data.get('system_prompt', '')
            if state.get('context'):
                system_prompt += f"\n\nContext:\n{state['context']}"
            
            messages.append({
                "role": "system",
                "content": system_prompt
            })
            
            # Add conversation history
            if state.get('messages'):
                messages.extend(state['messages'])
            
            # Add current query
            messages.append({
                "role": "user",
                "content": state['query']
            })
            
            # Step 3: Call LLM
            model = agent_data.get('model_name', 'gpt-4')
            temperature = config.get('temperature', 0.7)
            max_tokens = config.get('max_tokens', 2000)
            
            response = await openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # Step 4: Extract response
            assistant_message = response.choices[0].message.content
            
            # Update state
            state['response'] = assistant_message
            state['messages'].append({
                "role": "assistant",
                "content": assistant_message
            })
            
            # Add reasoning if present
            if response.choices[0].message.content:
                state['reasoning'].append(f"{node_name}: {assistant_message[:200]}")
            
            # Calculate confidence (simple heuristic)
            finish_reason = response.choices[0].finish_reason
            state['confidence'] = 0.9 if finish_reason == 'stop' else 0.7
            
            logger.info(
                "agent_node_complete",
                node_name=node_name,
                response_length=len(assistant_message),
                confidence=state['confidence']
            )
            
            return state
            
        except Exception as e:
            logger.error(
                "agent_node_failed",
                node_name=node_name,
                error=str(e)
            )
            state['error'] = str(e)
            state['next_node'] = 'error'
            return state
    
    return agent_node


async def _load_agent(pg, agent_id: UUID) -> Dict[str, Any]:
    """Load agent configuration from database"""
    query = """
    SELECT
        id,
        name,
        system_prompt,
        model_name,
        temperature,
        metadata
    FROM agents
    WHERE id = $1 AND deleted_at IS NULL
    """
    
    return await pg.fetchrow(query, agent_id)

