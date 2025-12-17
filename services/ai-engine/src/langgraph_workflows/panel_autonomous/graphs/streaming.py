"""
Panel Autonomous Workflow - Streaming Events

Provides real-time streaming of panel execution events,
including debate exchanges where agents respond to each other.
"""

from typing import Any, AsyncIterator, Dict, Optional, Union
from datetime import datetime, timezone
from uuid import uuid4
import structlog

from langgraph.graph.state import CompiledStateGraph

from .debate import DebateState
from .parallel import ParallelState

logger = structlog.get_logger(__name__)


async def stream_panel_events(
    graph: CompiledStateGraph,
    initial_state: Union[DebateState, ParallelState],
    config: Optional[Dict[str, Any]] = None,
) -> AsyncIterator[Dict[str, Any]]:
    """
    Stream panel execution events with rich debate context.

    Yields events:
    - panel_started: Panel execution begins
    - turn_started: A position is about to speak (debate only)
    - argument: An expert presents an argument
    - rebuttal: An expert rebuts the opposition (debate only)
    - synthesis: Moderator synthesizes the debate (debate only)
    - round_complete: All experts have spoken for this round
    - consensus_update: Consensus analysis complete (parallel only)
    - panel_completed: Final synthesis ready
    - error: An error occurred
    """
    config = config or {}
    if "configurable" not in config:
        config["configurable"] = {}
    if "thread_id" not in config["configurable"]:
        config["configurable"]["thread_id"] = str(uuid4())

    mission_id = initial_state.get("mission_id", "unknown")
    panel_type = initial_state.get("panel_type", "unknown")
    is_debate = "pro_experts" in initial_state

    try:
        # Emit start event
        yield {
            "type": "panel_started",
            "mission_id": mission_id,
            "panel_type": panel_type,
            "topology": "debate" if is_debate else "parallel",
            "goal": initial_state.get("goal", ""),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # Emit experts_selected event with position info
        if is_debate:
            # Debate topology - emit experts with positions
            pro_experts = initial_state.get("pro_experts", [])
            con_experts = initial_state.get("con_experts", [])
            moderator_experts = initial_state.get("moderator_experts", [])

            # Combine all experts with position metadata
            all_experts = []
            for e in pro_experts:
                all_experts.append({
                    "id": e.get("id"),
                    "name": e.get("name"),
                    "model": e.get("model"),
                    "position": "pro",
                })
            for e in con_experts:
                all_experts.append({
                    "id": e.get("id"),
                    "name": e.get("name"),
                    "model": e.get("model"),
                    "position": "con",
                })
            for e in moderator_experts:
                all_experts.append({
                    "id": e.get("id"),
                    "name": e.get("name"),
                    "model": e.get("model"),
                    "position": "moderator",
                })

            yield {
                "type": "experts_selected",
                "experts": all_experts,
                "selection_method": "debate_positions",
                "pro_count": len(pro_experts),
                "con_count": len(con_experts),
                "moderator_count": len(moderator_experts),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        else:
            # Parallel topology - emit experts without positions
            experts = initial_state.get("experts", [])
            yield {
                "type": "experts_selected",
                "experts": [
                    {
                        "id": e.get("id"),
                        "name": e.get("name"),
                        "model": e.get("model"),
                    }
                    for e in experts
                ],
                "selection_method": "parallel",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        # Track state for rich event generation
        last_pro_count = 0
        last_con_count = 0
        last_moderator_count = 0
        last_round = 0

        async for event in graph.astream_events(
            initial_state,
            config=config,
            version="v2",
        ):
            event_type = event.get("event", "")
            event_name = event.get("name", "")

            # === DEBATE EVENTS ===
            if is_debate:
                if event_type == "on_chain_start":
                    if event_name == "pro_turn":
                        input_data = event.get("data", {}).get("input", {})
                        current_round = input_data.get("current_round", 1)
                        is_rebuttal = current_round > 1 and len(input_data.get("con_arguments", [])) > 0

                        yield {
                            "type": "turn_started",
                            "position": "pro",
                            "round": current_round,
                            "is_rebuttal": is_rebuttal,
                            "responding_to": "con" if is_rebuttal else None,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

                    elif event_name == "con_turn":
                        input_data = event.get("data", {}).get("input", {})
                        current_round = input_data.get("current_round", 1)

                        yield {
                            "type": "turn_started",
                            "position": "con",
                            "round": current_round,
                            "is_rebuttal": True,  # CON always rebuts PRO
                            "responding_to": "pro",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

                    elif event_name == "moderator_turn":
                        input_data = event.get("data", {}).get("input", {})
                        current_round = input_data.get("current_round", 1)

                        yield {
                            "type": "turn_started",
                            "position": "moderator",
                            "round": current_round,
                            "is_synthesis": True,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

                elif event_type == "on_chain_end":
                    output = event.get("data", {}).get("output", {})

                    if event_name == "pro_turn":
                        pro_args = output.get("pro_arguments", [])
                        new_args = pro_args[last_pro_count:]
                        last_pro_count = len(pro_args)

                        for arg in new_args:
                            yield {
                                "type": "argument",
                                "position": "pro",
                                "expert_id": arg.get("expert_id"),
                                "expert_name": arg.get("expert_name"),
                                "content": arg.get("content"),
                                "round": arg.get("round"),
                                "is_rebuttal": arg.get("round", 1) > 1,
                                "timestamp": arg.get("timestamp"),
                            }

                    elif event_name == "con_turn":
                        con_args = output.get("con_arguments", [])
                        new_args = con_args[last_con_count:]
                        last_con_count = len(con_args)

                        for arg in new_args:
                            yield {
                                "type": "rebuttal",
                                "position": "con",
                                "expert_id": arg.get("expert_id"),
                                "expert_name": arg.get("expert_name"),
                                "content": arg.get("content"),
                                "round": arg.get("round"),
                                "responding_to": "pro",
                                "timestamp": arg.get("timestamp"),
                            }

                    elif event_name == "moderator_turn":
                        syntheses = output.get("moderator_syntheses", [])
                        new_syntheses = syntheses[last_moderator_count:]
                        last_moderator_count = len(syntheses)
                        current_round = output.get("current_round", 1)

                        for syn in new_syntheses:
                            yield {
                                "type": "synthesis",
                                "position": "moderator",
                                "expert_id": syn.get("expert_id"),
                                "expert_name": syn.get("expert_name"),
                                "content": syn.get("content"),
                                "round": syn.get("round"),
                                "timestamp": syn.get("timestamp"),
                            }

                        # Round complete after moderator
                        if current_round > last_round:
                            yield {
                                "type": "round_complete",
                                "round": current_round - 1,
                                "pro_argument_count": last_pro_count,
                                "con_argument_count": last_con_count,
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                            }
                            last_round = current_round

                    elif event_name == "finalize":
                        final = output.get("final_synthesis", {})
                        yield {
                            "type": "panel_completed",
                            "mission_id": mission_id,
                            "status": output.get("status", "completed"),
                            "total_rounds": final.get("total_rounds", 0),
                            "pro_argument_count": final.get("pro_argument_count", 0),
                            "con_argument_count": final.get("con_argument_count", 0),
                            "final_synthesis": final,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

            # === PARALLEL EVENTS ===
            else:
                if event_type == "on_chain_start":
                    if event_name == "execute":
                        input_data = event.get("data", {}).get("input", {})
                        current_round = input_data.get("current_round", 1)
                        yield {
                            "type": "round_started",
                            "round": current_round,
                            "expert_count": len(input_data.get("experts", [])),
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

                elif event_type == "on_chain_end":
                    output = event.get("data", {}).get("output", {})

                    if event_name == "execute":
                        round_responses = output.get("round_responses", [])
                        if round_responses:
                            latest = round_responses[-1]
                            for resp in latest:
                                yield {
                                    "type": "expert_response",
                                    "expert_id": resp.get("expert_id"),
                                    "expert_name": resp.get("expert_name"),
                                    "content": resp.get("content"),
                                    "confidence": resp.get("confidence"),
                                    "round": resp.get("round"),
                                    "timestamp": resp.get("timestamp"),
                                }

                    elif event_name == "consensus":
                        round_consensus = output.get("round_consensus", [])
                        if round_consensus:
                            latest = round_consensus[-1]
                            yield {
                                "type": "consensus_update",
                                "consensus_score": latest.get("consensus_score"),
                                "consensus_level": latest.get("consensus_level"),
                                "agreement_points": latest.get("agreement_points", []),
                                "divergent_points": latest.get("divergent_points", []),
                                "round": latest.get("round"),
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                            }

                    elif event_name == "finalize":
                        final = output.get("final_synthesis", {})
                        yield {
                            "type": "panel_completed",
                            "mission_id": mission_id,
                            "status": output.get("status", "completed"),
                            "content": final.get("content", ""),
                            "expert_count": final.get("expert_count", 0),
                            "round_count": final.get("round_count", 0),
                            "consensus": final.get("consensus"),
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

            # === ERROR HANDLING ===
            if event_type == "on_chain_error":
                yield {
                    "type": "error",
                    "node": event_name,
                    "error": str(event.get("data", {}).get("error", "Unknown error"))[:500],
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }

    except Exception as exc:
        logger.error(
            "panel_stream_error",
            mission_id=mission_id,
            error=str(exc)[:200],
        )
        yield {
            "type": "error",
            "mission_id": mission_id,
            "error": str(exc)[:500],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
