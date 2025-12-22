"""
Panel Autonomous Workflow - Parallel Execution Graph

Implements parallel expert execution for panels where experts
don't need to respond to each other (structured, open, delphi, etc.)

Architecture:
- All experts generate responses concurrently
- Consensus is built after each round
- Multiple rounds refine responses based on collective input
"""

from typing import Any, Dict, List, Optional, TypedDict
from datetime import datetime, timezone
from uuid import uuid4
import asyncio
import structlog

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph

from ..definitions import PanelDefinition, get_panel_definition_sync

logger = structlog.get_logger(__name__)


# =============================================================================
# PARALLEL STATE
# =============================================================================

class ParallelState(TypedDict, total=False):
    """State for parallel panel execution."""
    # Identity
    mission_id: str
    tenant_id: Optional[str]

    # Configuration
    panel_type: str
    goal: str
    context: str

    # Experts (all same pool, no positions)
    experts: List[Dict[str, Any]]

    # Execution
    current_round: int
    max_rounds: int
    consensus_threshold: float

    # Responses
    round_responses: List[List[Dict[str, Any]]]  # Grouped by round
    all_responses: List[Dict[str, Any]]  # Flat list

    # Consensus
    round_consensus: List[Dict[str, Any]]
    current_consensus_score: float

    # Final
    final_synthesis: Optional[Dict[str, Any]]
    status: str
    current_cost: float


# =============================================================================
# PARALLEL NODE FUNCTIONS
# =============================================================================

async def parallel_execute_node(state: ParallelState) -> Dict[str, Any]:
    """
    Execute all experts in parallel for the current round.
    """
    from services.llm_service import get_llm_service

    llm_service = get_llm_service()
    if not llm_service:
        raise RuntimeError("LLM service not available")

    panel_def = get_panel_definition_sync(state["panel_type"])
    current_round = state.get("current_round", 1)
    experts = state.get("experts", [])
    goal = state.get("goal", "")
    context = state.get("context", "")

    if not experts:
        raise ValueError("No experts available for panel execution")

    # Get previous round responses for context
    round_responses = state.get("round_responses", [])
    prev_responses = round_responses[-1] if round_responses else []

    # Get appropriate prompt
    prompt_type = "initial" if current_round == 1 else "followup"
    prompt_template = panel_def.get_prompt(
        position=None,
        round_number=current_round,
        prompt_type=prompt_type,
    )

    # Format context
    context_section = f"CONTEXT: {context}" if context else ""

    # Format previous responses
    prev_responses_text = ""
    if prev_responses:
        prev_responses_text = "\n".join([
            f"{r.get('expert_name', 'Expert')}: {r.get('content', '')[:1500]}..."
            if len(r.get('content', '')) > 1500 else
            f"{r.get('expert_name', 'Expert')}: {r.get('content', '')}"
            for r in prev_responses
        ])

    prompt = prompt_template.replace("{goal}", goal)
    prompt = prompt.replace("{context_section}", context_section)
    prompt = prompt.replace("{round_number}", str(current_round))
    prompt = prompt.replace("{previous_responses}", prev_responses_text)
    prompt = prompt.replace("{previous_responses_section}", prev_responses_text)

    async def generate_response(expert: Dict[str, Any]) -> Dict[str, Any]:
        """Generate response from a single expert."""
        system_prompt = expert.get("system_prompt", "You are a helpful expert.")
        model = expert.get("model", "gpt-4-turbo")

        content = await llm_service.generate(
            prompt=f"{system_prompt}\n\n{prompt}",
            model=model,
            temperature=0.7,
            max_tokens=1500,
        )

        return {
            "expert_id": expert.get("id", str(uuid4())),
            "expert_name": expert.get("name", "Expert"),
            "content": content,
            "confidence": 0.8,
            "round": current_round,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Execute all experts concurrently
    responses = await asyncio.gather(*[
        generate_response(expert) for expert in experts
    ])

    # Update state
    new_round_responses = list(round_responses) + [list(responses)]
    new_all_responses = list(state.get("all_responses", [])) + list(responses)

    logger.info(
        "parallel_round_complete",
        round=current_round,
        response_count=len(responses),
    )

    return {
        "round_responses": new_round_responses,
        "all_responses": new_all_responses,
        "current_round": current_round + 1,
    }


async def parallel_consensus_node(state: ParallelState) -> Dict[str, Any]:
    """
    Build consensus from the latest round of responses.
    """
    from services.panel.consensus_analyzer import create_consensus_analyzer
    from services.llm_service import get_llm_service

    round_responses = state.get("round_responses", [])
    if not round_responses:
        raise ValueError("No responses to analyze for consensus")

    latest_responses = round_responses[-1]
    goal = state.get("goal", "")

    llm_service = get_llm_service()
    if not llm_service:
        raise RuntimeError("LLM service not available")

    analyzer = create_consensus_analyzer(llm_service)

    response_dicts = [
        {
            "agent_name": r.get("expert_name"),
            "content": r.get("content"),
            "confidence": r.get("confidence", 0.7),
        }
        for r in latest_responses
    ]

    consensus = await analyzer.analyze_consensus(goal, response_dicts)

    consensus_result = {
        "consensus_score": consensus.consensus_score,
        "consensus_level": consensus.consensus_level,
        "agreement_points": consensus.agreement_points[:5],
        "divergent_points": consensus.divergent_points[:5],
        "key_themes": consensus.key_themes[:5],
        "recommendation": consensus.recommendation,
        "round": state.get("current_round", 1) - 1,
    }

    round_consensus = list(state.get("round_consensus", [])) + [consensus_result]

    logger.info(
        "parallel_consensus_complete",
        consensus_score=consensus_result["consensus_score"],
        consensus_level=consensus_result["consensus_level"],
    )

    return {
        "round_consensus": round_consensus,
        "current_consensus_score": consensus_result["consensus_score"],
    }


def should_continue_parallel(state: ParallelState) -> str:
    """Route decision: continue rounds or finalize."""
    current_round = state.get("current_round", 1)
    max_rounds = state.get("max_rounds", 2)
    consensus_score = state.get("current_consensus_score", 0)
    consensus_threshold = state.get("consensus_threshold", 0.7)

    panel_def = get_panel_definition_sync(state["panel_type"])

    # Check early termination
    if panel_def.config.early_termination_enabled:
        if consensus_score >= consensus_threshold:
            logger.info(
                "parallel_early_termination",
                consensus_score=consensus_score,
                threshold=consensus_threshold,
            )
            return "finalize"

    if current_round > max_rounds:
        return "finalize"

    return "continue"


async def parallel_finalize_node(state: ParallelState) -> Dict[str, Any]:
    """Generate final synthesis from all rounds."""
    from services.llm_service import get_llm_service

    llm_service = get_llm_service()
    if not llm_service:
        raise RuntimeError("LLM service not available")

    all_responses = state.get("all_responses", [])
    round_consensus = state.get("round_consensus", [])
    goal = state.get("goal", "")

    # Build synthesis prompt
    responses_text = "\n\n".join([
        f"[Round {r.get('round', '?')}] {r.get('expert_name', 'Expert')}:\n{r.get('content', '')}"
        for r in all_responses
    ])

    consensus_text = ""
    if round_consensus:
        latest = round_consensus[-1]
        consensus_text = f"""
Consensus Analysis:
- Score: {latest.get('consensus_score', 0):.0%}
- Level: {latest.get('consensus_level', 'unknown')}
- Key Agreements: {', '.join(latest.get('agreement_points', []))}
- Divergent Points: {', '.join(latest.get('divergent_points', []))}
"""

    synthesis_prompt = f"""
You are synthesizing the results of a panel discussion.

GOAL: {goal}

EXPERT RESPONSES:
{responses_text}

{consensus_text}

Provide a comprehensive synthesis that:
1. Summarizes the key findings and recommendations
2. Highlights areas of expert agreement
3. Notes any significant disagreements and their implications
4. Provides actionable next steps

Write in clear paragraphs without markdown formatting.
"""

    synthesis_content = await llm_service.generate(
        prompt=synthesis_prompt,
        model="gpt-4-turbo",
        temperature=0.5,
        max_tokens=2000,
    )

    final_synthesis = {
        "content": synthesis_content,
        "expert_count": len(state.get("experts", [])),
        "round_count": state.get("current_round", 1) - 1,
        "consensus": round_consensus[-1] if round_consensus else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    logger.info(
        "parallel_finalized",
        round_count=final_synthesis["round_count"],
        expert_count=final_synthesis["expert_count"],
    )

    return {
        "final_synthesis": final_synthesis,
        "status": "completed",
    }


# =============================================================================
# GRAPH BUILDER
# =============================================================================

def build_parallel_graph(
    panel_definition: PanelDefinition,
) -> CompiledStateGraph:
    """
    Build a parallel execution graph from panel definition.

    Graph structure:

    EXECUTE → CONSENSUS → [check] → EXECUTE (loop)
                                  → FINALIZE (end)
    """
    graph = StateGraph(ParallelState)

    # Add nodes
    graph.add_node("execute", parallel_execute_node)
    graph.add_node("consensus", parallel_consensus_node)
    graph.add_node("finalize", parallel_finalize_node)

    # Entry point
    graph.set_entry_point("execute")

    # Edges
    graph.add_edge("execute", "consensus")

    graph.add_conditional_edges(
        "consensus",
        should_continue_parallel,
        {
            "continue": "execute",
            "finalize": "finalize",
        }
    )

    graph.add_edge("finalize", END)

    # Compile
    compiled = graph.compile(checkpointer=MemorySaver())

    logger.info(
        "parallel_graph_compiled",
        panel_type=panel_definition.id,
    )

    return compiled


def create_parallel_initial_state(
    mission_id: str,
    goal: str,
    panel_type: str = "structured",
    context: str = "",
    experts: List[Dict[str, Any]] = None,
    max_rounds: int = 2,
    consensus_threshold: float = 0.7,
    tenant_id: Optional[str] = None,
) -> ParallelState:
    """Create initial state for a parallel execution panel."""
    return ParallelState(
        mission_id=mission_id,
        tenant_id=tenant_id,
        panel_type=panel_type,
        goal=goal,
        context=context,
        experts=experts or [],
        current_round=1,
        max_rounds=max_rounds,
        consensus_threshold=consensus_threshold,
        round_responses=[],
        all_responses=[],
        round_consensus=[],
        current_consensus_score=0.0,
        final_synthesis=None,
        status="executing",
        current_cost=0.0,
    )
