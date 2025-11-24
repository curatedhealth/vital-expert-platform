"""
Panel Node Compiler
Compiles multi-agent panel nodes for collaborative decision-making
"""

from typing import Dict, Any, Callable, List
from uuid import UUID
import asyncio
import structlog

from graphrag.clients.postgres_client import get_postgres_client
from ..state import WorkflowState

logger = structlog.get_logger()


async def compile_panel_node(node_config: Dict[str, Any]) -> Callable:
    """
    Compile panel node for multi-agent discussions
    
    Panel nodes orchestrate multiple agents to:
    - Provide diverse perspectives
    - Reach consensus
    - Debate solutions
    - Aggregate expertise
    
    Args:
        node_config: Node configuration from database
        
    Returns:
        Async callable node function
    """
    config = node_config.get('config', {})
    node_name = node_config['node_name']
    panel_type = config.get('panel_type', 'parallel')  # parallel, consensus, debate
    
    async def panel_node(state: WorkflowState) -> WorkflowState:
        """Execute panel node"""
        try:
            logger.info(
                "panel_node_executing",
                node_name=node_name,
                panel_type=panel_type,
                agent_count=len(state.get('panel_agents', []))
            )
            
            state['execution_path'].append(node_name)
            state['current_step'] = node_name
            
            panel_agents = state.get('panel_agents', [])
            
            if not panel_agents:
                raise ValueError("No panel agents configured")
            
            # Execute panel based on type
            if panel_type == 'parallel':
                responses = await _execute_parallel_panel(state, panel_agents)
            elif panel_type == 'consensus':
                responses = await _execute_consensus_panel(state, panel_agents)
            elif panel_type == 'debate':
                responses = await _execute_debate_panel(state, panel_agents)
            else:
                responses = await _execute_parallel_panel(state, panel_agents)
            
            # Store agent responses
            state['agent_responses'] = responses
            
            # Calculate consensus
            state['consensus_reached'] = _calculate_consensus(responses)
            
            # Build final decision
            state['final_decision'] = _build_final_decision(responses, panel_type)
            
            logger.info(
                "panel_node_complete",
                node_name=node_name,
                consensus_reached=state['consensus_reached']
            )
            
            return state
            
        except Exception as e:
            logger.error(
                "panel_node_failed",
                node_name=node_name,
                error=str(e)
            )
            state['error'] = str(e)
            return state
    
    return panel_node


async def _execute_parallel_panel(
    state: WorkflowState,
    agent_ids: List[UUID]
) -> Dict[UUID, str]:
    """Execute parallel panel - all agents respond independently"""
    responses = {}
    
    # Execute all agents in parallel
    tasks = [_get_agent_response(state, agent_id) for agent_id in agent_ids]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for agent_id, result in zip(agent_ids, results):
        if isinstance(result, Exception):
            logger.error("agent_response_failed", agent_id=str(agent_id), error=str(result))
            responses[agent_id] = f"Error: {str(result)}"
        else:
            responses[agent_id] = result
    
    return responses


async def _execute_consensus_panel(
    state: WorkflowState,
    agent_ids: List[UUID]
) -> Dict[UUID, str]:
    """Execute consensus panel - agents discuss until agreement"""
    responses = {}
    max_rounds = 3
    
    for round_num in range(max_rounds):
        # Get responses from all agents
        tasks = [_get_agent_response(state, agent_id, round_num) for agent_id in agent_ids]
        round_responses = await asyncio.gather(*tasks)
        
        # Update responses
        for agent_id, response in zip(agent_ids, round_responses):
            responses[agent_id] = response
        
        # Check for consensus
        if _check_consensus(round_responses):
            logger.info("consensus_reached", round=round_num + 1)
            break
    
    return responses


async def _execute_debate_panel(
    state: WorkflowState,
    agent_ids: List[UUID]
) -> Dict[UUID, str]:
    """Execute debate panel - agents present opposing views"""
    responses = {}
    
    # Sequential responses with awareness of previous responses
    previous_responses = []
    
    for agent_id in agent_ids:
        response = await _get_agent_response(
            state,
            agent_id,
            context={"previous_responses": previous_responses}
        )
        responses[agent_id] = response
        previous_responses.append(response)
    
    return responses


async def _get_agent_response(
    state: WorkflowState,
    agent_id: UUID,
    round_num: int = 0,
    context: Dict = None
) -> str:
    """Get response from single agent"""
    # Placeholder: Execute agent subgraph
    return f"Response from agent {agent_id} (round {round_num})"


def _calculate_consensus(responses: Dict[UUID, str]) -> bool:
    """Calculate if consensus is reached"""
    # Placeholder: Implement actual consensus detection
    return len(responses) > 0


def _check_consensus(responses: List[str]) -> bool:
    """Check if responses agree"""
    # Placeholder: Implement similarity checking
    return False


def _build_final_decision(responses: Dict[UUID, str], panel_type: str) -> str:
    """Build final decision from panel responses"""
    if not responses:
        return "No consensus reached"
    
    # For now, concatenate all responses
    decision_parts = [f"Agent {i+1}: {resp}" for i, resp in enumerate(responses.values())]
    return "\n\n".join(decision_parts)

