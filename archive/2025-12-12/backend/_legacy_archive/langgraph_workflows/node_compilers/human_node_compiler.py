"""
Human Node Compiler
Compiles human-in-the-loop nodes into executable LangGraph functions
"""

from typing import Dict, Callable, Any
import structlog
from ..state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()

async def compile_human_node(node_data: Dict[str, Any], postgres_client) -> Callable:
    """Compile human node into executable function"""
    node_key = node_data['node_key']
    config = node_data.get('config', {})
    
    logger.info("human_node_compiled", node_key=node_key)
    
    async def human_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Execute human-in-the-loop node"""
        try:
            # Create HITL checkpoint
            hitl_data = {
                'query': state['query'],
                'agent_response': state.get('agent_response', ''),
                'confidence': state.get('confidence_score', 0.0),
                'requires_approval': True
            }
            
            # Store checkpoint in database
            insert_query = """
                INSERT INTO human_checkpoints (data, status, created_at)
                VALUES ($1, 'pending', NOW())
                RETURNING id
            """
            result = await postgres_client.fetchrow(insert_query, str(hitl_data))
            
            state['hitl_checkpoint_id'] = str(result['id']) if result else None
            state['awaiting_human_approval'] = True
            
            logger.info("human_node_complete", checkpoint_id=state.get('hitl_checkpoint_id'))
            return state
        except Exception as e:
            logger.error("human_node_failed", error=str(e))
            state['error'] = f"HITL failed: {str(e)}"
            return state
    return human_node
