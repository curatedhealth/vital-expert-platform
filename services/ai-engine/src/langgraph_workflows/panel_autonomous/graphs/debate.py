"""
Panel Autonomous Workflow - Debate Graph

Implements turn-based debate execution where agents directly respond
to each other's arguments. The graph structure is dynamically generated
from the YAML panel definition.

Architecture:
- Each position (PRO, CON, MODERATOR) becomes a node
- Edges define who speaks after whom
- Responses are injected into the next speaker's context
- Rounds are actual back-and-forth exchanges
"""

from typing import Any, Dict, List, Optional, TypedDict, Literal
from datetime import datetime, timezone
from uuid import uuid4
import structlog

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph

from ..definitions import PanelDefinition, get_panel_definition_sync

logger = structlog.get_logger(__name__)


# =============================================================================
# DEBATE STATE
# =============================================================================

class DebateState(TypedDict, total=False):
    """State for turn-based debate execution."""
    # Identity
    mission_id: str
    tenant_id: Optional[str]

    # Configuration from YAML
    panel_type: str
    goal: str
    context: str

    # Experts by position
    pro_experts: List[Dict[str, Any]]
    con_experts: List[Dict[str, Any]]
    moderator_experts: List[Dict[str, Any]]

    # Debate execution
    current_round: int
    max_rounds: int
    current_turn: Literal["pro", "con", "moderator", "done"]

    # Argument history - key for real debate
    pro_arguments: List[Dict[str, Any]]  # All PRO arguments across rounds
    con_arguments: List[Dict[str, Any]]  # All CON arguments across rounds
    moderator_syntheses: List[Dict[str, Any]]  # Moderator summaries

    # Full exchange log for streaming
    debate_log: List[Dict[str, Any]]  # Chronological log of all exchanges

    # Consensus tracking
    consensus_score: float

    # Final
    final_synthesis: Optional[Dict[str, Any]]
    status: str
    current_cost: float


# =============================================================================
# DEBATE NODE FUNCTIONS
# =============================================================================

async def _generate_expert_response(
    expert: Dict[str, Any],
    prompt: str,
    position: str,
    round_num: int,
) -> Dict[str, Any]:
    """Generate a response from an expert using LLM service."""
    from services.llm_service import get_llm_service

    llm_service = get_llm_service()
    if not llm_service:
        raise RuntimeError("LLM service not available")

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
        "position": position,
        "round": round_num,
        "content": content,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _format_arguments_for_context(
    arguments: List[Dict[str, Any]],
    position_label: str,
) -> str:
    """Format arguments for injection into prompts."""
    if not arguments:
        return f"(No {position_label} arguments yet)"

    parts = []
    for arg in arguments:
        parts.append(
            f"[Round {arg.get('round', '?')}] {arg.get('expert_name', 'Expert')}:\n"
            f"{arg.get('content', '')}\n"
        )
    return "\n".join(parts)


async def pro_turn_node(state: DebateState) -> Dict[str, Any]:
    """
    PRO position takes their turn.

    - Round 1: Present initial arguments
    - Round 2+: Respond to CON's latest arguments
    """
    panel_def = get_panel_definition_sync(state["panel_type"])
    current_round = state.get("current_round", 1)
    pro_experts = state.get("pro_experts", [])
    goal = state.get("goal", "")
    context = state.get("context", "")

    if not pro_experts:
        raise ValueError("No PRO experts assigned")

    # Get existing arguments
    con_arguments = state.get("con_arguments", [])
    pro_arguments = state.get("pro_arguments", [])

    # Determine prompt type
    is_rebuttal = current_round > 1 and len(con_arguments) > 0

    # Get prompt template from YAML
    prompt_template = panel_def.get_prompt(
        position="pro",
        round_number=current_round,
        prompt_type="rebuttal" if is_rebuttal else "initial",
    )

    # Build context
    context_section = f"CONTEXT: {context}" if context else ""

    # Format opposing arguments prominently
    con_args_formatted = _format_arguments_for_context(con_arguments, "CON")
    pro_args_formatted = _format_arguments_for_context(pro_arguments, "PRO")

    prompt = prompt_template.replace("{goal}", goal)
    prompt = prompt.replace("{context_section}", context_section)
    prompt = prompt.replace("{round_number}", str(current_round))
    prompt = prompt.replace("{con_arguments}", con_args_formatted)
    prompt = prompt.replace("{pro_arguments}", pro_args_formatted)
    prompt = prompt.replace("{previous_responses_section}", con_args_formatted)

    # Generate responses from all PRO experts
    new_pro_arguments = list(pro_arguments)
    debate_log = list(state.get("debate_log", []))

    for expert in pro_experts:
        response = await _generate_expert_response(
            expert=expert,
            prompt=prompt,
            position="pro",
            round_num=current_round,
        )
        new_pro_arguments.append(response)

        # Log the exchange
        debate_log.append({
            "type": "argument",
            "position": "pro",
            "round": current_round,
            "expert_name": response["expert_name"],
            "content": response["content"],
            "is_rebuttal": is_rebuttal,
            "responding_to": "con" if is_rebuttal else None,
            "timestamp": response["timestamp"],
        })

    logger.info(
        "debate_pro_turn_complete",
        round=current_round,
        expert_count=len(pro_experts),
        is_rebuttal=is_rebuttal,
    )

    return {
        "pro_arguments": new_pro_arguments,
        "debate_log": debate_log,
        "current_turn": "con",
    }


async def con_turn_node(state: DebateState) -> Dict[str, Any]:
    """
    CON position takes their turn.

    - Always responds to PRO's latest arguments
    """
    panel_def = get_panel_definition_sync(state["panel_type"])
    current_round = state.get("current_round", 1)
    con_experts = state.get("con_experts", [])
    goal = state.get("goal", "")
    context = state.get("context", "")

    if not con_experts:
        raise ValueError("No CON experts assigned")

    # Get existing arguments
    pro_arguments = state.get("pro_arguments", [])
    con_arguments = state.get("con_arguments", [])

    if not pro_arguments:
        raise ValueError("CON cannot speak before PRO has presented arguments")

    # CON always rebuts PRO
    prompt_template = panel_def.get_prompt(
        position="con",
        round_number=current_round,
        prompt_type="rebuttal" if current_round > 1 else "initial",
    )

    # Build context
    context_section = f"CONTEXT: {context}" if context else ""

    # Format arguments - PRO is the opposition for CON
    pro_args_formatted = _format_arguments_for_context(pro_arguments, "PRO")
    con_args_formatted = _format_arguments_for_context(con_arguments, "CON")

    prompt = prompt_template.replace("{goal}", goal)
    prompt = prompt.replace("{context_section}", context_section)
    prompt = prompt.replace("{round_number}", str(current_round))
    prompt = prompt.replace("{pro_arguments}", pro_args_formatted)
    prompt = prompt.replace("{con_arguments}", con_args_formatted)
    prompt = prompt.replace("{previous_responses_section}", pro_args_formatted)

    # Generate responses from all CON experts
    new_con_arguments = list(con_arguments)
    debate_log = list(state.get("debate_log", []))

    for expert in con_experts:
        response = await _generate_expert_response(
            expert=expert,
            prompt=prompt,
            position="con",
            round_num=current_round,
        )
        new_con_arguments.append(response)

        # Log the exchange
        debate_log.append({
            "type": "argument",
            "position": "con",
            "round": current_round,
            "expert_name": response["expert_name"],
            "content": response["content"],
            "is_rebuttal": True,  # CON always responds to PRO
            "responding_to": "pro",
            "timestamp": response["timestamp"],
        })

    logger.info(
        "debate_con_turn_complete",
        round=current_round,
        expert_count=len(con_experts),
    )

    return {
        "con_arguments": new_con_arguments,
        "debate_log": debate_log,
        "current_turn": "moderator",
    }


async def moderator_turn_node(state: DebateState) -> Dict[str, Any]:
    """
    Moderator synthesizes the debate after each round.
    """
    panel_def = get_panel_definition_sync(state["panel_type"])
    current_round = state.get("current_round", 1)
    moderator_experts = state.get("moderator_experts", [])
    goal = state.get("goal", "")

    if not moderator_experts:
        # No moderator - just proceed to next round
        return {
            "current_turn": "pro",
            "current_round": current_round + 1,
        }

    pro_arguments = state.get("pro_arguments", [])
    con_arguments = state.get("con_arguments", [])

    # Get moderator synthesis prompt
    prompt_template = panel_def.get_prompt(
        position="moderator",
        round_number=current_round,
        prompt_type="synthesis",
    )

    pro_args_formatted = _format_arguments_for_context(pro_arguments, "PRO")
    con_args_formatted = _format_arguments_for_context(con_arguments, "CON")

    prompt = prompt_template.replace("{goal}", goal)
    prompt = prompt.replace("{pro_arguments}", pro_args_formatted)
    prompt = prompt.replace("{con_arguments}", con_args_formatted)

    # Generate moderator synthesis
    moderator_syntheses = list(state.get("moderator_syntheses", []))
    debate_log = list(state.get("debate_log", []))

    for expert in moderator_experts:
        response = await _generate_expert_response(
            expert=expert,
            prompt=prompt,
            position="moderator",
            round_num=current_round,
        )
        moderator_syntheses.append(response)

        debate_log.append({
            "type": "synthesis",
            "position": "moderator",
            "round": current_round,
            "expert_name": response["expert_name"],
            "content": response["content"],
            "timestamp": response["timestamp"],
        })

    logger.info(
        "debate_moderator_turn_complete",
        round=current_round,
    )

    return {
        "moderator_syntheses": moderator_syntheses,
        "debate_log": debate_log,
        "current_turn": "pro",
        "current_round": current_round + 1,
    }


def should_continue_debate(state: DebateState) -> str:
    """Route decision: continue debate or end."""
    current_round = state.get("current_round", 1)
    max_rounds = state.get("max_rounds", 2)

    if current_round > max_rounds:
        return "finalize"
    return "continue"


async def finalize_debate_node(state: DebateState) -> Dict[str, Any]:
    """Generate final synthesis of the debate."""
    panel_def = get_panel_definition_sync(state["panel_type"])

    pro_arguments = state.get("pro_arguments", [])
    con_arguments = state.get("con_arguments", [])
    moderator_syntheses = state.get("moderator_syntheses", [])

    # Build final synthesis
    final_synthesis = {
        "pro_summary": _format_arguments_for_context(pro_arguments, "PRO"),
        "con_summary": _format_arguments_for_context(con_arguments, "CON"),
        "moderator_summary": moderator_syntheses[-1]["content"] if moderator_syntheses else "",
        "total_rounds": state.get("current_round", 1) - 1,
        "pro_argument_count": len(pro_arguments),
        "con_argument_count": len(con_arguments),
    }

    logger.info(
        "debate_finalized",
        total_rounds=final_synthesis["total_rounds"],
        pro_count=final_synthesis["pro_argument_count"],
        con_count=final_synthesis["con_argument_count"],
    )

    return {
        "final_synthesis": final_synthesis,
        "status": "completed",
        "current_turn": "done",
    }


# =============================================================================
# GRAPH BUILDER
# =============================================================================

def build_debate_graph(
    panel_definition: PanelDefinition,
) -> CompiledStateGraph:
    """
    Build a turn-based debate graph from panel definition.

    Graph structure:

    PRO → CON → MODERATOR → [check rounds] → PRO (loop)
                                           → FINALIZE (end)
    """
    graph = StateGraph(DebateState)

    # Add nodes
    graph.add_node("pro_turn", pro_turn_node)
    graph.add_node("con_turn", con_turn_node)
    graph.add_node("moderator_turn", moderator_turn_node)
    graph.add_node("finalize", finalize_debate_node)

    # Entry point: PRO speaks first
    graph.set_entry_point("pro_turn")

    # Turn sequence
    graph.add_edge("pro_turn", "con_turn")
    graph.add_edge("con_turn", "moderator_turn")

    # After moderator: decide to continue or end
    graph.add_conditional_edges(
        "moderator_turn",
        should_continue_debate,
        {
            "continue": "pro_turn",
            "finalize": "finalize",
        }
    )

    graph.add_edge("finalize", END)

    # Compile
    compiled = graph.compile(checkpointer=MemorySaver())

    logger.info(
        "debate_graph_compiled",
        panel_type=panel_definition.id,
        positions=list(panel_definition.positions.keys()),
    )

    return compiled


def create_debate_initial_state(
    mission_id: str,
    goal: str,
    panel_type: str = "adversarial",
    context: str = "",
    pro_experts: List[Dict[str, Any]] = None,
    con_experts: List[Dict[str, Any]] = None,
    moderator_experts: List[Dict[str, Any]] = None,
    max_rounds: int = 2,
    tenant_id: Optional[str] = None,
) -> DebateState:
    """Create initial state for a debate panel."""
    return DebateState(
        mission_id=mission_id,
        tenant_id=tenant_id,
        panel_type=panel_type,
        goal=goal,
        context=context,
        pro_experts=pro_experts or [],
        con_experts=con_experts or [],
        moderator_experts=moderator_experts or [],
        current_round=1,
        max_rounds=max_rounds,
        current_turn="pro",
        pro_arguments=[],
        con_arguments=[],
        moderator_syntheses=[],
        debate_log=[],
        consensus_score=0.0,
        final_synthesis=None,
        status="executing",
        current_cost=0.0,
    )
