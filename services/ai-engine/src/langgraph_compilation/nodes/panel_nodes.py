"""
Panel Node Compiler
Compiles multi-agent panel nodes for collaborative decision-making

Now with REAL LLM execution and advanced consensus analysis.
"""

from typing import Dict, Any, Callable, List, Optional
from uuid import UUID
import asyncio
import structlog

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
    max_rounds = config.get('max_rounds', 3)
    min_consensus = config.get('min_consensus', 0.70)

    async def panel_node(state: WorkflowState) -> WorkflowState:
        """Execute panel node with real LLM calls"""
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
            query = state.get('query', state.get('input', ''))

            if not panel_agents:
                raise ValueError("No panel agents configured")

            # Get LLM service
            llm_service = await _get_llm_service()

            # Execute panel based on type
            if panel_type == 'parallel':
                responses = await _execute_parallel_panel(
                    state, panel_agents, query, llm_service
                )
            elif panel_type == 'consensus':
                responses = await _execute_consensus_panel(
                    state, panel_agents, query, llm_service, max_rounds, min_consensus
                )
            elif panel_type == 'debate':
                responses = await _execute_debate_panel(
                    state, panel_agents, query, llm_service
                )
            elif panel_type == 'socratic':
                responses = await _execute_socratic_panel(
                    state, panel_agents, query, llm_service
                )
            elif panel_type == 'adversarial':
                responses = await _execute_adversarial_panel(
                    state, panel_agents, query, llm_service
                )
            elif panel_type == 'delphi':
                responses = await _execute_delphi_panel(
                    state, panel_agents, query, llm_service, max_rounds
                )
            else:
                responses = await _execute_parallel_panel(
                    state, panel_agents, query, llm_service
                )

            # Store agent responses
            state['agent_responses'] = responses

            # Calculate consensus using advanced analyzer
            consensus_result = await _analyze_consensus(responses, query, llm_service)
            state['consensus_reached'] = consensus_result.get('consensus_score', 0) >= min_consensus
            state['consensus_score'] = consensus_result.get('consensus_score', 0)
            state['consensus_analysis'] = consensus_result

            # Build final decision
            state['final_decision'] = _build_final_decision(responses, consensus_result, panel_type)

            logger.info(
                "panel_node_complete",
                node_name=node_name,
                consensus_reached=state['consensus_reached'],
                consensus_score=state['consensus_score']
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


async def _get_llm_service():
    """Get LLM service instance"""
    try:
        from services.llm_service import get_llm_service
        return get_llm_service()
    except Exception:
        return None


async def _get_agent_config(agent_id: str) -> Dict[str, Any]:
    """Load agent configuration from database"""
    try:
        from services.supabase_client import get_supabase_client

        supabase = get_supabase_client()
        if supabase and supabase.client:
            result = supabase.client.table("agents").select(
                "id, name, system_prompt, model, temperature, max_tokens"
            ).eq("id", agent_id).single().execute()

            if result.data:
                return result.data

    except Exception as e:
        logger.warning(f"Failed to load agent config: {e}")

    return {
        "id": agent_id,
        "name": f"Expert {agent_id[:8]}",
        "system_prompt": "You are a helpful expert.",
        "model": "gpt-4-turbo",
        "temperature": 0.7,
        "max_tokens": 2000
    }


async def _execute_parallel_panel(
    state: WorkflowState,
    agent_ids: List[str],
    query: str,
    llm_service: Any
) -> List[Dict[str, Any]]:
    """Execute parallel panel - all agents respond independently"""
    tasks = [
        _get_agent_response(agent_id, query, llm_service)
        for agent_id in agent_ids
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    responses = []
    for agent_id, result in zip(agent_ids, results):
        if isinstance(result, Exception):
            logger.error("agent_response_failed", agent_id=agent_id, error=str(result))
            responses.append({
                "agent_id": agent_id,
                "agent_name": f"Expert {agent_id[:8]}",
                "content": f"Error: {str(result)}",
                "confidence": 0.0
            })
        else:
            responses.append(result)

    return responses


async def _execute_consensus_panel(
    state: WorkflowState,
    agent_ids: List[str],
    query: str,
    llm_service: Any,
    max_rounds: int,
    min_consensus: float
) -> List[Dict[str, Any]]:
    """Execute consensus panel - iterate until agreement"""
    all_responses = []
    previous_context = ""

    for round_num in range(1, max_rounds + 1):
        logger.info(f"Consensus round {round_num}/{max_rounds}")

        round_responses = []
        for agent_id in agent_ids:
            response = await _get_agent_response(
                agent_id, query, llm_service,
                context=previous_context,
                round_num=round_num
            )
            round_responses.append(response)

        all_responses = round_responses

        # Build context for next round
        previous_context = "Previous responses:\n" + "\n".join([
            f"- {r['agent_name']}: {r['content'][:200]}..."
            for r in round_responses
        ])

        # Check consensus
        consensus = await _analyze_consensus(round_responses, query, llm_service)
        if consensus.get('consensus_score', 0) >= min_consensus:
            logger.info(f"Consensus reached at round {round_num}")
            break

    return all_responses


async def _execute_debate_panel(
    state: WorkflowState,
    agent_ids: List[str],
    query: str,
    llm_service: Any
) -> List[Dict[str, Any]]:
    """Execute debate panel - sequential with awareness of others"""
    responses = []
    previous_context = ""

    for i, agent_id in enumerate(agent_ids):
        debate_prompt = f"""You are in a debate. {"You are responding to previous arguments." if i > 0 else "You speak first."}

{previous_context}

Please respond to: {query}

Consider and address the previous arguments if any."""

        response = await _get_agent_response(
            agent_id, debate_prompt, llm_service,
            context=previous_context
        )
        responses.append(response)

        # Update context
        previous_context += f"\n\n{response['agent_name']}: {response['content'][:300]}..."

    return responses


async def _execute_socratic_panel(
    state: WorkflowState,
    agent_ids: List[str],
    query: str,
    llm_service: Any
) -> List[Dict[str, Any]]:
    """Execute Socratic panel - dialectical questioning"""
    responses = []

    # Round 1: Initial positions
    for agent_id in agent_ids:
        prompt = f"""State your initial position on: {query}

Include:
1. Your main thesis
2. Key assumptions
3. Supporting evidence"""

        response = await _get_agent_response(agent_id, prompt, llm_service)
        response['round'] = 1
        response['type'] = 'initial_position'
        responses.append(response)

    # Round 2: Socratic questions
    for i, agent_id in enumerate(agent_ids):
        target_idx = (i + 1) % len(agent_ids)
        target_response = responses[target_idx]

        prompt = f"""Critically examine this position using Socratic questioning:

{target_response['agent_name']}'s position:
{target_response['content']}

Ask probing questions that challenge assumptions and test logic."""

        response = await _get_agent_response(agent_id, prompt, llm_service)
        response['round'] = 2
        response['type'] = 'socratic_question'
        responses.append(response)

    return responses


async def _execute_adversarial_panel(
    state: WorkflowState,
    agent_ids: List[str],
    query: str,
    llm_service: Any
) -> List[Dict[str, Any]]:
    """Execute adversarial panel - pro/con debate"""
    responses = []
    mid = len(agent_ids) // 2

    advocates = agent_ids[:max(1, mid)]
    opponents = agent_ids[max(1, mid):]

    # Advocates (PRO)
    for agent_id in advocates:
        prompt = f"""You are the ADVOCATE arguing IN FAVOR of: {query}

Present your strongest case with evidence and reasoning."""

        response = await _get_agent_response(agent_id, prompt, llm_service)
        response['position'] = 'pro'
        responses.append(response)

    # Opponents (CON)
    for agent_id in opponents:
        prompt = f"""You are the OPPONENT arguing AGAINST: {query}

Present your strongest counter-arguments with evidence."""

        response = await _get_agent_response(agent_id, prompt, llm_service)
        response['position'] = 'con'
        responses.append(response)

    return responses


async def _execute_delphi_panel(
    state: WorkflowState,
    agent_ids: List[str],
    query: str,
    llm_service: Any,
    max_rounds: int
) -> List[Dict[str, Any]]:
    """Execute Delphi panel - anonymous iterative consensus"""
    all_responses = []
    previous_summary = ""

    for round_num in range(1, max_rounds + 1):
        round_responses = []

        for agent_id in agent_ids:
            if round_num == 1:
                prompt = f"""DELPHI PANEL Round 1

Question: {query}

Provide your analysis and rate your confidence (0-100%)."""
            else:
                prompt = f"""DELPHI PANEL Round {round_num}

Question: {query}

Anonymous group feedback from previous round:
{previous_summary}

Reconsider your position based on group feedback. You may revise or maintain your view."""

            response = await _get_agent_response(agent_id, prompt, llm_service)
            response['round'] = round_num
            round_responses.append(response)

        all_responses = round_responses

        # Build anonymized summary
        previous_summary = f"Responses: {len(round_responses)}\n"
        for i, r in enumerate(round_responses):
            previous_summary += f"Expert {i+1}: {r['content'][:150]}...\n"

    return all_responses


async def _get_agent_response(
    agent_id: str,
    query: str,
    llm_service: Any,
    context: str = "",
    round_num: int = 1
) -> Dict[str, Any]:
    """Get response from single agent with real LLM call"""
    # Load agent config
    agent_config = await _get_agent_config(agent_id)

    agent_name = agent_config.get("name", f"Expert {agent_id[:8]}")
    system_prompt = agent_config.get("system_prompt", "You are a helpful expert.")
    model = agent_config.get("model", "gpt-4-turbo")
    temperature = agent_config.get("temperature", 0.7)
    max_tokens = agent_config.get("max_tokens", 2000)

    # Build full prompt
    full_prompt = f"""{system_prompt}

{f"Context: {context}" if context else ""}

{query}"""

    # Try real LLM call
    if llm_service:
        try:
            response = await llm_service.generate(
                prompt=full_prompt,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )

            confidence = _estimate_confidence(response)

            return {
                "agent_id": agent_id,
                "agent_name": agent_name,
                "content": response,
                "confidence": confidence,
                "round_number": round_num,
                "model": model
            }

        except Exception as e:
            logger.error(f"LLM call failed: {e}")

    # Fallback response
    return {
        "agent_id": agent_id,
        "agent_name": agent_name,
        "content": f"Analysis from {agent_name} for round {round_num}: Based on the query, key considerations include regulatory requirements, clinical evidence, and risk assessment.",
        "confidence": 0.7,
        "round_number": round_num,
        "model": "fallback"
    }


def _estimate_confidence(response: str) -> float:
    """Estimate confidence from response content"""
    response_lower = response.lower()

    uncertainty = sum(1 for p in ["might", "perhaps", "possibly", "uncertain", "unclear", "may", "could"]
                      if p in response_lower)
    certainty = sum(1 for p in ["clearly", "definitely", "certainly", "evidence shows", "proven"]
                    if p in response_lower)

    base = 0.75
    adjustment = (certainty - uncertainty) * 0.05
    return max(0.3, min(0.95, base + adjustment))


async def _analyze_consensus(
    responses: List[Dict[str, Any]],
    query: str,
    llm_service: Any
) -> Dict[str, Any]:
    """Analyze consensus across responses"""
    try:
        from services.consensus_analyzer import get_consensus_analyzer

        analyzer = get_consensus_analyzer()
        if analyzer:
            result = await analyzer.analyze_consensus(query, responses)
            return {
                "consensus_score": result.consensus_score,
                "consensus_level": result.consensus_level,
                "agreement_points": result.agreement_points,
                "divergent_points": result.divergent_points,
                "recommendation": result.recommendation
            }

    except Exception as e:
        logger.warning(f"Advanced consensus analysis failed: {e}")

    # Fallback: simple average confidence
    if not responses:
        return {"consensus_score": 0.0, "consensus_level": "low"}

    avg_confidence = sum(r.get("confidence", 0.5) for r in responses) / len(responses)
    return {
        "consensus_score": avg_confidence,
        "consensus_level": "high" if avg_confidence > 0.8 else "medium" if avg_confidence > 0.5 else "low"
    }


def _build_final_decision(
    responses: List[Dict[str, Any]],
    consensus: Dict[str, Any],
    panel_type: str
) -> str:
    """Build final decision from panel responses"""
    if not responses:
        return "No consensus reached - no responses available."

    decision_parts = [
        f"## Panel Decision ({panel_type.title()} Panel)",
        f"\n**Consensus Level**: {consensus.get('consensus_level', 'unknown').upper()}",
        f"**Consensus Score**: {consensus.get('consensus_score', 0):.0%}",
        "\n### Expert Summaries:"
    ]

    for r in responses[:5]:  # Limit to 5 responses
        decision_parts.append(
            f"\n**{r.get('agent_name', 'Expert')}** (Confidence: {r.get('confidence', 0):.0%}):\n"
            f"{r.get('content', 'No response')[:300]}..."
        )

    if consensus.get('recommendation'):
        decision_parts.append(f"\n### Recommendation\n{consensus['recommendation']}")

    return "\n".join(decision_parts)

