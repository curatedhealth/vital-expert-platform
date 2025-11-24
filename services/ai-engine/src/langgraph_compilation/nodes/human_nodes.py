"""
Human Node Compiler
Compiles human-in-the-loop nodes for LangGraph
"""

from typing import Dict, Any, Callable
import structlog

from ..state import AgentState

logger = structlog.get_logger()


async def compile_human_node(node_config: Dict[str, Any]) -> Callable:
    """
    Compile human-in-the-loop node
    
    Human nodes pause execution for human review/input:
    - Review agent decisions
    - Provide feedback
    - Override AI decisions
    - Approve critical actions
    
    Args:
        node_config: Node configuration from database
        
    Returns:
        Async callable node function
    """
    config = node_config.get('config', {})
    node_name = node_config['node_name']
    review_type = config.get('review_type', 'approval')  # approval, feedback, override
    
    async def human_node(state: AgentState) -> AgentState:
        """Execute human node"""
        try:
            logger.info(
                "human_node_executing",
                node_name=node_name,
                review_type=review_type
            )
            
            state['execution_path'].append(node_name)
            state['current_step'] = node_name
            
            # Mark that human review is required
            state['requires_human_review'] = True
            
            # Store review context
            state['metadata']['human_review'] = {
                "node_name": node_name,
                "review_type": review_type,
                "query": state['query'],
                "agent_response": state.get('response'),
                "confidence": state.get('confidence'),
                "context_for_review": _build_review_context(state)
            }
            
            # In a real implementation, this would:
            # 1. Store state in database
            # 2. Send notification to human reviewer
            # 3. Wait for human input (via callback/webhook)
            # 4. Resume execution with human feedback
            
            logger.info(
                "human_node_awaiting_review",
                node_name=node_name,
                session_id=str(state['session_id'])
            )
            
            # For now, mark for async continuation
            state['metadata']['awaiting_human'] = True
            
            return state
            
        except Exception as e:
            logger.error(
                "human_node_failed",
                node_name=node_name,
                error=str(e)
            )
            state['error'] = str(e)
            return state
    
    return human_node


def _build_review_context(state: AgentState) -> Dict[str, Any]:
    """Build context for human review"""
    return {
        "execution_path": state.get('execution_path', []),
        "reasoning": state.get('reasoning', []),
        "tool_calls": state.get('tool_calls', []),
        "context_chunks_count": len(state.get('context_chunks', [])),
        "citations_count": len(state.get('citations', {})),
        "has_error": state.get('error') is not None
    }

