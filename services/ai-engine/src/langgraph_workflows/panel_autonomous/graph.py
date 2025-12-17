"""
Panel Autonomous Workflow - Graph Builder

This module builds the LangGraph StateGraph for the panel workflow.
It connects all nodes with conditional edges based on state transitions.
"""

import os
from typing import Any, AsyncIterator, Dict, Optional
from datetime import datetime, timezone
from uuid import uuid4
import structlog

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph

try:
    from langgraph.checkpoint.postgres import PostgresSaver
    POSTGRES_AVAILABLE = True
except Exception:
    PostgresSaver = None
    POSTGRES_AVAILABLE = False

from .state import PanelMissionState
from .nodes import (
    initialize_node,
    plan_panel_node,
    select_experts_node,
    execute_round_node,
    build_consensus_node,
    checkpoint_node,
    synthesize_node,
    quality_gate_node,
)

logger = structlog.get_logger(__name__)


# =============================================================================
# Checkpointer Factory
# =============================================================================

def _get_checkpointer(mission_id: str = "panel_mission") -> Any:
    """Get appropriate checkpointer with fallback to MemorySaver."""
    db_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")

    if not db_url or not POSTGRES_AVAILABLE:
        logger.info(
            "panel_checkpointer_using_memory",
            mission_id=mission_id,
            reason="no_postgres_available" if not POSTGRES_AVAILABLE else "no_db_url",
        )
        return MemorySaver()

    try:
        checkpointer = PostgresSaver.from_conn_string(db_url)
        logger.info("panel_checkpointer_postgres_connected", mission_id=mission_id)
        return checkpointer
    except Exception as exc:
        logger.warning(
            "panel_checkpointer_fallback_to_memory",
            mission_id=mission_id,
            error=str(exc)[:100],
        )
        return MemorySaver()


# =============================================================================
# Routing Functions
# =============================================================================

def _route_after_consensus(state: PanelMissionState) -> str:
    """Route after consensus node based on state."""
    status = state.get("status", "")
    if status == "executing":
        return "execute_round"
    return "checkpoint"


def _route_after_checkpoint(state: PanelMissionState) -> str:
    """Route after checkpoint node based on state."""
    status = state.get("status", "")
    if status == "checkpoint":
        return "checkpoint"  # Still waiting
    if status == "executing":
        return "execute_round"  # User requested another round
    if status == "failed":
        return END
    return "synthesize"


# =============================================================================
# Graph Builder
# =============================================================================

def build_panel_autonomous_graph(
    use_postgres_checkpointer: bool = True,
    enable_interrupts: bool = False,
) -> CompiledStateGraph:
    """
    Build the panel autonomous workflow graph.

    Args:
        use_postgres_checkpointer: Whether to attempt using PostgresSaver
        enable_interrupts: Whether to enable HITL interrupts at checkpoints

    Returns:
        Compiled LangGraph StateGraph
    """
    graph = StateGraph(PanelMissionState)

    # Add nodes
    graph.add_node("initialize", initialize_node)
    graph.add_node("plan_panel", plan_panel_node)
    graph.add_node("select_experts", select_experts_node)
    graph.add_node("execute_round", execute_round_node)
    graph.add_node("build_consensus", build_consensus_node)
    graph.add_node("checkpoint", checkpoint_node)
    graph.add_node("synthesize", synthesize_node)
    graph.add_node("quality_gate", quality_gate_node)

    # Set entry point
    graph.set_entry_point("initialize")

    # Add linear edges
    graph.add_edge("initialize", "plan_panel")
    graph.add_edge("plan_panel", "select_experts")
    graph.add_edge("select_experts", "execute_round")
    graph.add_edge("execute_round", "build_consensus")

    # Conditional edges after consensus
    graph.add_conditional_edges(
        "build_consensus",
        _route_after_consensus,
        {
            "execute_round": "execute_round",
            "checkpoint": "checkpoint",
        }
    )

    # Conditional edges after checkpoint
    graph.add_conditional_edges(
        "checkpoint",
        _route_after_checkpoint,
        {
            "checkpoint": "checkpoint",
            "execute_round": "execute_round",
            "synthesize": "synthesize",
            END: END,
        }
    )

    # Final edges
    graph.add_edge("synthesize", "quality_gate")
    graph.add_edge("quality_gate", END)

    # Get checkpointer
    checkpointer = _get_checkpointer() if use_postgres_checkpointer else MemorySaver()

    # Compile options
    compile_kwargs = {"checkpointer": checkpointer}
    if enable_interrupts:
        compile_kwargs["interrupt_before"] = ["checkpoint"]

    compiled = graph.compile(**compile_kwargs)

    logger.info(
        "panel_autonomous_graph_compiled",
        nodes=list(graph.nodes),
        checkpointer=type(checkpointer).__name__,
        interrupts_enabled=enable_interrupts,
    )

    return compiled


# =============================================================================
# Streaming Helper
# =============================================================================

async def stream_panel_mission_events(
    compiled_graph: CompiledStateGraph,
    initial_state: Dict[str, Any],
    config: Optional[Dict[str, Any]] = None,
) -> AsyncIterator[Dict[str, Any]]:
    """
    Stream panel mission execution events.

    Yields events with types:
    - panel_started
    - experts_selected
    - round_started
    - expert_response
    - consensus_update
    - checkpoint_reached
    - synthesis_complete
    - panel_completed
    - error
    """
    config = config or {}

    if "configurable" not in config:
        config["configurable"] = {}
    if "thread_id" not in config["configurable"]:
        config["configurable"]["thread_id"] = str(uuid4())

    mission_id = initial_state.get("mission_id", "unknown")

    try:
        # Yield start event
        yield {
            "type": "panel_started",
            "mission_id": mission_id,
            "panel_type": initial_state.get("panel_type"),
            "goal": initial_state.get("goal", ""),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        async for event in compiled_graph.astream_events(
            initial_state,
            config=config,
            version="v2",
        ):
            event_type = event.get("event", "unknown")
            event_name = event.get("name", "")

            # Transform to standardized panel events
            if event_type == "on_chain_start":
                if event_name == "execute_round":
                    input_data = event.get("data", {}).get("input", {})
                    current_round = input_data.get("current_round", 0) + 1
                    yield {
                        "type": "round_started",
                        "round": current_round,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }

            elif event_type == "on_chain_end":
                output = event.get("data", {}).get("output", {})

                if event_name == "select_experts":
                    yield {
                        "type": "experts_selected",
                        "experts": output.get("selected_experts", []),
                        "expert_count": output.get("expert_count", 0),
                        "selection_method": output.get("selection_method"),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }

                elif event_name == "execute_round":
                    responses = output.get("all_responses", [])
                    current_round = output.get("current_round", 0)

                    yield {
                        "type": "round_complete",
                        "round": current_round,
                        "response_count": len(responses),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }

                    # Yield individual responses
                    round_responses = output.get("round_responses", [])
                    if round_responses:
                        for resp in round_responses[-1]:
                            yield {
                                "type": "expert_response",
                                "expert_id": resp.get("expert_id"),
                                "expert_name": resp.get("expert_name"),
                                "content": resp.get("content", ""),
                                "confidence": resp.get("confidence", 0),
                                "round": current_round,
                                "position": resp.get("position"),
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                            }

                elif event_name == "build_consensus":
                    round_consensus = output.get("round_consensus", [])
                    consensus = round_consensus[-1] if round_consensus else None
                    if consensus:
                        yield {
                            "type": "consensus_update",
                            "consensus_score": consensus.get("consensus_score", 0),
                            "consensus_level": consensus.get("consensus_level"),
                            "agreement_points": consensus.get("agreement_points", []),
                            "divergent_points": consensus.get("divergent_points", []),
                            "key_themes": consensus.get("key_themes", []),
                            "recommendation": consensus.get("recommendation", ""),
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

                elif event_name == "checkpoint":
                    checkpoint = output.get("current_checkpoint")
                    if checkpoint:
                        yield {
                            "type": "checkpoint_reached",
                            "checkpoint": checkpoint,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

                elif event_name == "synthesize":
                    final_output = output.get("final_output", {})
                    yield {
                        "type": "synthesis_complete",
                        "content_length": len(final_output.get("content", "")),
                        "artifact_count": len(output.get("artifacts", [])),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }

                elif event_name == "quality_gate":
                    # Get final output from state
                    yield {
                        "type": "panel_completed",
                        "mission_id": mission_id,
                        "status": output.get("status", "completed"),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }

            elif event_type == "on_chain_error":
                yield {
                    "type": "error",
                    "node": event_name,
                    "error": str(event.get("data", {}).get("error", "Unknown error"))[:200],
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
            "error": str(exc)[:200],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


# =============================================================================
# Convenience Function (matches old API)
# =============================================================================

# Keep backwards compatibility with old workflow.py
def build_panel_autonomous_graph_legacy() -> CompiledStateGraph:
    """Build graph with legacy settings (no interrupts, postgres if available)."""
    return build_panel_autonomous_graph(
        use_postgres_checkpointer=True,
        enable_interrupts=False,
    )
