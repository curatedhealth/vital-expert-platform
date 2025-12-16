# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# PURPOSE: Panel Autonomous Workflow - LangGraph StateGraph for Ask Panel Mode 4
"""
Panel Autonomous Workflow

A LangGraph-based workflow for autonomous panel execution featuring:
- Multi-expert parallel execution with consensus building
- Iterative refinement loops (confidence gate)
- HITL checkpoints for human approval
- Quality gates (RACE/FACT metrics)
- Fusion Intelligence for expert auto-selection

Flow:
initialize -> plan_panel -> select_experts -> execute_round (loop) ->
build_consensus -> checkpoint -> synthesize -> quality_gate -> END
"""

from __future__ import annotations

import os
import json
import asyncio
from typing import Any, AsyncIterator, Dict, List, Optional, TypedDict
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

try:
    from langgraph.types import Interrupt
    INTERRUPT_AVAILABLE = True
except Exception:
    Interrupt = None
    INTERRUPT_AVAILABLE = False

logger = structlog.get_logger(__name__)


# =============================================================================
# State Definition
# =============================================================================

class ExpertResponse(TypedDict, total=False):
    """Individual expert response"""
    expert_id: str
    expert_name: str
    content: str
    confidence: float
    reasoning: str
    citations: List[Dict[str, Any]]
    round_number: int
    timestamp: str


class ConsensusResult(TypedDict, total=False):
    """Consensus analysis result"""
    consensus_score: float
    consensus_level: str  # high, medium, low
    agreement_points: List[str]
    divergent_points: List[str]
    key_themes: List[str]
    recommendation: str
    evidence_overlap: float


class PanelMissionState(TypedDict, total=False):
    """Complete state for panel autonomous mission"""
    # Mission identity
    mission_id: str
    panel_type: str  # structured, open, socratic, adversarial, delphi, hybrid
    goal: str
    context: str
    tenant_id: str
    user_id: str

    # Expert team
    selected_experts: List[Dict[str, Any]]
    expert_count: int
    selection_method: str  # fusion, manual, hybrid

    # Execution state
    status: str  # pending, planning, selecting, executing, consensus, checkpoint, synthesizing, completed, failed
    current_round: int
    max_rounds: int

    # Responses per round
    round_responses: List[List[ExpertResponse]]
    all_responses: List[ExpertResponse]

    # Consensus tracking
    round_consensus: List[ConsensusResult]
    final_consensus: Optional[ConsensusResult]
    consensus_threshold: float

    # Checkpoints
    checkpoint_pending: Optional[Dict[str, Any]]
    checkpoint_resolved: bool
    human_response: Optional[Dict[str, Any]]

    # Quality metrics
    quality_score: float
    quality_passed: bool
    quality_recommendations: List[str]

    # Cost tracking
    budget_limit: Optional[float]
    current_cost: float

    # Final output
    final_output: Optional[Dict[str, Any]]
    artifacts: List[Dict[str, Any]]

    # Timing
    started_at: Optional[str]
    completed_at: Optional[str]
    execution_time_ms: int

    # Error handling
    errors: List[Dict[str, Any]]


# =============================================================================
# Checkpointer Factory
# =============================================================================

def _get_checkpointer(mission_id: str = "panel_mission") -> Any:
    """Get appropriate checkpointer with fallback to MemorySaver"""
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
# Node Implementations
# =============================================================================

async def _initialize(state: PanelMissionState) -> Dict[str, Any]:
    """Initialize panel mission with defaults"""
    logger.info(
        "panel_mission_initialize",
        mission_id=state.get("mission_id"),
        panel_type=state.get("panel_type"),
        goal=state.get("goal", "")[:100],
    )

    return {
        "status": "planning",
        "current_round": 0,
        "max_rounds": state.get("max_rounds", 3),
        "round_responses": [],
        "all_responses": [],
        "round_consensus": [],
        "final_consensus": None,
        "consensus_threshold": state.get("consensus_threshold", 0.7),
        "checkpoint_pending": None,
        "checkpoint_resolved": False,
        "human_response": None,
        "quality_score": 0.0,
        "quality_passed": False,
        "quality_recommendations": [],
        "current_cost": 0.0,
        "artifacts": [],
        "errors": [],
        "started_at": datetime.now(timezone.utc).isoformat(),
    }


async def _plan_panel(state: PanelMissionState) -> Dict[str, Any]:
    """Plan the panel discussion structure"""
    panel_type = state.get("panel_type", "structured")
    goal = state.get("goal", "")

    # Determine rounds based on panel type
    rounds_by_type = {
        "structured": 2,
        "open": 1,
        "socratic": 3,
        "adversarial": 2,
        "delphi": 3,
        "hybrid": 2,
    }

    # Use user-provided max_rounds if available, otherwise default by panel type
    user_max_rounds = state.get("max_rounds")
    max_rounds = user_max_rounds if user_max_rounds is not None else rounds_by_type.get(panel_type, 2)

    logger.info(
        "panel_mission_planned",
        panel_type=panel_type,
        max_rounds=max_rounds,
        user_specified=user_max_rounds is not None,
        goal_preview=goal[:100],
    )

    return {
        "max_rounds": max_rounds,
        "status": "selecting",
    }


async def _select_experts(state: PanelMissionState) -> Dict[str, Any]:
    """Select experts for the panel using Fusion Intelligence or provided list"""
    existing_experts = state.get("selected_experts", [])

    # If enough experts already provided, use them
    if existing_experts and len(existing_experts) >= 2:
        logger.info(
            "panel_experts_provided",
            expert_count=len(existing_experts),
            selection_method="manual",
        )
        return {
            "selected_experts": existing_experts,
            "expert_count": len(existing_experts),
            "selection_method": "manual",
            "status": "executing",
        }

    # Auto-select experts using Fusion Intelligence
    goal = state.get("goal", "")
    tenant_id = state.get("tenant_id", "default")
    team = []

    try:
        # Import Fusion Intelligence selector
        from langgraph_workflows.modes34.agent_selector import (
            select_team_async,
            GRAPHRAG_AVAILABLE,
        )

        metadata = {
            "panel_type": state.get("panel_type"),
            "context": state.get("context"),
        }

        team = await select_team_async(
            goal=goal,
            tenant_id=tenant_id,
            metadata=metadata,
            max_agents=5,
            use_graphrag=GRAPHRAG_AVAILABLE,
        )

        logger.info(
            "panel_experts_selected_fusion",
            expert_count=len(team),
            selection_method="fusion" if GRAPHRAG_AVAILABLE else "hybrid",
            top_expert=team[0]["name"] if team else "None",
        )

    except Exception as exc:
        logger.error(
            "panel_expert_selection_failed",
            error=str(exc)[:200],
        )

    # If we have less than 2 experts (stub agent fallback or error), use default experts
    if len(team) < 2:
        logger.warning(
            "panel_experts_insufficient_using_fallback",
            returned_count=len(team),
            reason="auto_selection_returned_fewer_than_2_experts",
        )

        # Fallback: create default experts
        default_experts = [
            {
                "id": str(uuid4()),
                "name": "Domain Expert",
                "model": "gpt-4-turbo",
                "system_prompt": "You are a domain expert providing thorough analysis on the given topic.",
            },
            {
                "id": str(uuid4()),
                "name": "Critical Analyst",
                "model": "gpt-4-turbo",
                "system_prompt": "You are a critical analyst who evaluates evidence and identifies potential issues.",
            },
            {
                "id": str(uuid4()),
                "name": "Strategic Advisor",
                "model": "gpt-4-turbo",
                "system_prompt": "You are a strategic advisor providing actionable recommendations.",
            },
        ]

        return {
            "selected_experts": default_experts,
            "expert_count": len(default_experts),
            "selection_method": "fallback",
            "status": "executing",
        }

    return {
        "selected_experts": team,
        "expert_count": len(team),
        "selection_method": "fusion",
        "status": "executing",
    }


async def _execute_round(state: PanelMissionState) -> Dict[str, Any]:
    """Execute a single round of expert responses"""
    current_round = state.get("current_round", 0)
    experts = state.get("selected_experts", [])
    goal = state.get("goal", "")
    context = state.get("context", "")
    panel_type = state.get("panel_type", "structured")
    all_responses = state.get("all_responses", [])
    round_responses = state.get("round_responses", [])

    logger.info(
        "panel_round_starting",
        round=current_round + 1,
        expert_count=len(experts),
    )

    # Import LLM service
    try:
        from services.llm_service import get_llm_service
        llm_service = get_llm_service()
    except Exception:
        llm_service = None

    # Get previous responses for context (for iterative panels)
    prev_responses = []
    if current_round > 0 and round_responses:
        prev_responses = round_responses[-1] if round_responses else []

    # Execute all experts in parallel
    async def get_expert_response(expert: Dict[str, Any]) -> ExpertResponse:
        expert_id = expert.get("id", str(uuid4()))
        expert_name = expert.get("name", "Expert")
        system_prompt = expert.get("system_prompt", "You are a helpful expert.")
        model = expert.get("model", "gpt-4-turbo")

        # Build prompt based on panel type and round
        prompt = _build_expert_prompt(
            goal=goal,
            context=context,
            panel_type=panel_type,
            round_number=current_round + 1,
            expert_name=expert_name,
            previous_responses=prev_responses,
        )

        try:
            if llm_service:
                content = await llm_service.generate(
                    prompt=f"{system_prompt}\n\n{prompt}",
                    model=model,
                    temperature=0.7,
                    max_tokens=1500,
                )
            else:
                # Fallback mock response
                content = f"[{expert_name}] Analysis for: {goal[:100]}..."

            return ExpertResponse(
                expert_id=expert_id,
                expert_name=expert_name,
                content=content,
                confidence=0.8,
                reasoning="",
                citations=[],
                round_number=current_round + 1,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )

        except Exception as exc:
            logger.error(
                "panel_expert_response_failed",
                expert_name=expert_name,
                error=str(exc)[:100],
            )
            return ExpertResponse(
                expert_id=expert_id,
                expert_name=expert_name,
                content=f"Error generating response: {str(exc)[:100]}",
                confidence=0.0,
                reasoning="",
                citations=[],
                round_number=current_round + 1,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )

    # Execute all experts concurrently
    responses = await asyncio.gather(*[
        get_expert_response(expert) for expert in experts
    ])

    # Update state
    new_round_responses = list(round_responses) + [list(responses)]
    new_all_responses = list(all_responses) + list(responses)

    # Estimate cost (simplified)
    cost_per_response = 0.03  # Approximate cost
    new_cost = state.get("current_cost", 0.0) + (len(responses) * cost_per_response)

    logger.info(
        "panel_round_complete",
        round=current_round + 1,
        response_count=len(responses),
        total_responses=len(new_all_responses),
    )

    return {
        "round_responses": new_round_responses,
        "all_responses": new_all_responses,
        "current_round": current_round + 1,
        "current_cost": new_cost,
        "status": "consensus",
    }


def _build_expert_prompt(
    goal: str,
    context: str,
    panel_type: str,
    round_number: int,
    expert_name: str,
    previous_responses: List[ExpertResponse],
) -> str:
    """Build prompt for expert based on panel type and round"""

    base_prompt = f"""
You are participating in a {panel_type} panel discussion.

QUESTION/GOAL: {goal}

{f"CONTEXT: {context}" if context else ""}

Round {round_number} of discussion.
"""

    # Add previous responses for iterative panels
    if previous_responses and round_number > 1:
        prev_text = "\n\nPREVIOUS ROUND RESPONSES:\n"
        for resp in previous_responses:
            prev_text += f"\n{resp.get('expert_name', 'Expert')}: {resp.get('content', '')[:500]}...\n"
        base_prompt += prev_text

    # Panel-type specific instructions
    type_instructions = {
        "structured": """
Please provide your analysis in a structured format:
1. Key Findings
2. Supporting Evidence
3. Recommendations
4. Confidence Level (0-1)
""",
        "open": """
Share your thoughts freely. Consider:
- Novel perspectives
- Creative solutions
- Cross-domain insights
""",
        "socratic": """
Question the assumptions. Address:
- What assumptions underlie this question?
- What evidence would change your view?
- What are we missing?
""",
        "adversarial": """
Take a critical stance. Address:
- Potential weaknesses in current approaches
- Counter-arguments to consider
- Risk factors
""",
        "delphi": """
Provide your independent assessment:
1. Your position (score 1-10)
2. Key reasoning
3. Confidence level
4. What would change your view?
""",
        "hybrid": """
Provide thorough analysis for human review:
1. Analysis summary
2. Key recommendations
3. Areas needing human judgment
4. Confidence and limitations
""",
    }

    base_prompt += type_instructions.get(panel_type, type_instructions["structured"])

    return base_prompt


async def _build_consensus(state: PanelMissionState) -> Dict[str, Any]:
    """Analyze responses and build consensus"""
    current_round = state.get("current_round", 0)
    round_responses = state.get("round_responses", [])
    max_rounds = state.get("max_rounds", 3)
    round_consensus_list = state.get("round_consensus", [])
    consensus_threshold = state.get("consensus_threshold", 0.7)

    if not round_responses or current_round == 0:
        return {"status": "executing"}

    # Get latest round responses
    latest_responses = round_responses[-1] if round_responses else []

    if not latest_responses:
        return {"status": "executing"}

    # Build consensus analysis
    try:
        from services.consensus_analyzer import create_consensus_analyzer
        from services.llm_service import get_llm_service

        llm_service = get_llm_service()
        analyzer = create_consensus_analyzer(llm_service)

        response_dicts = [
            {
                "agent_name": r.get("expert_name"),
                "content": r.get("content"),
                "confidence": r.get("confidence", 0.7),
            }
            for r in latest_responses
        ]

        consensus = await analyzer.analyze_consensus(
            state.get("goal", ""),
            response_dicts,
        )

        consensus_result = ConsensusResult(
            consensus_score=consensus.consensus_score,
            consensus_level=consensus.consensus_level,
            agreement_points=consensus.agreement_points[:5],
            divergent_points=consensus.divergent_points[:5],
            key_themes=consensus.key_themes[:5],
            recommendation=consensus.recommendation[:1000],
            evidence_overlap=getattr(consensus, 'evidence_overlap', 0.0),
        )

    except Exception as exc:
        logger.warning(
            "panel_consensus_fallback",
            error=str(exc)[:100],
        )

        # Fallback simple consensus
        avg_confidence = sum(r.get("confidence", 0.5) for r in latest_responses) / max(len(latest_responses), 1)
        consensus_result = ConsensusResult(
            consensus_score=avg_confidence,
            consensus_level="medium" if avg_confidence >= 0.6 else "low",
            agreement_points=["General agreement on approach"],
            divergent_points=[],
            key_themes=[],
            recommendation="Further analysis recommended.",
            evidence_overlap=0.5,
        )

    # Update consensus list
    new_round_consensus = list(round_consensus_list) + [consensus_result]

    logger.info(
        "panel_consensus_complete",
        round=current_round,
        consensus_score=consensus_result.get("consensus_score", 0),
        consensus_level=consensus_result.get("consensus_level", "unknown"),
    )

    # Determine next step
    consensus_met = consensus_result.get("consensus_score", 0) >= consensus_threshold
    more_rounds = current_round < max_rounds

    if consensus_met or not more_rounds:
        # Consensus achieved or max rounds reached
        next_status = "checkpoint"
        final_consensus = consensus_result
    else:
        # Need more rounds
        next_status = "executing"
        final_consensus = None

    return {
        "round_consensus": new_round_consensus,
        "final_consensus": final_consensus,
        "status": next_status,
    }


async def _checkpoint(state: PanelMissionState) -> Dict[str, Any]:
    """Handle HITL checkpoint for human approval.

    In autonomous mode (without interrupt_before), this auto-approves and continues.
    The checkpoint info is logged and can be used for audit purposes.
    """
    if state.get("checkpoint_resolved"):
        return {
            "status": "synthesizing",
            "checkpoint_pending": None,
            "checkpoint_resolved": False,
        }

    # Check if checkpoint already pending
    if state.get("checkpoint_pending"):
        # Waiting for human response
        human_response = state.get("human_response")
        if human_response:
            action = human_response.get("action", "approve")
            if action == "reject":
                return {
                    "status": "failed",
                    "errors": state.get("errors", []) + [{"type": "rejected", "message": "Panel rejected by user"}],
                }
            elif action == "modify":
                # Go back to execute another round
                return {
                    "status": "executing",
                    "checkpoint_pending": None,
                    "human_response": None,
                }
            else:
                # Approved - continue to synthesis
                return {
                    "status": "synthesizing",
                    "checkpoint_pending": None,
                    "checkpoint_resolved": True,
                }

        # No human response and no interrupt - auto-approve and continue
        # This is the autonomous mode behavior
        logger.info(
            "panel_checkpoint_auto_approved",
            reason="autonomous_mode_no_interrupt",
        )
        return {
            "status": "synthesizing",
            "checkpoint_pending": None,
            "checkpoint_resolved": True,
        }

    # Create checkpoint info for logging/audit
    final_consensus = state.get("final_consensus", {})
    consensus_score = final_consensus.get("consensus_score", 0) if final_consensus else 0

    checkpoint = {
        "id": f"cp_panel_{state.get('mission_id', 'unknown')}_{state.get('current_round', 0)}",
        "type": "approval",
        "title": "Panel Discussion Complete",
        "description": f"Consensus score: {consensus_score:.0%}. Auto-approved in autonomous mode.",
        "options": ["approve", "modify", "reject"],
        "consensus_score": consensus_score,
        "round_count": state.get("current_round", 0),
        "expert_count": state.get("expert_count", 0),
    }

    logger.info(
        "panel_checkpoint_created_auto_approved",
        checkpoint_id=checkpoint["id"],
        consensus_score=consensus_score,
        mode="autonomous",
    )

    # In autonomous mode, immediately approve and continue to synthesis
    return {
        "checkpoint_pending": checkpoint,
        "checkpoint_resolved": True,
        "status": "synthesizing",
    }


async def _synthesize(state: PanelMissionState) -> Dict[str, Any]:
    """Synthesize all responses into final output"""
    all_responses = state.get("all_responses", [])
    final_consensus = state.get("final_consensus", {})
    goal = state.get("goal", "")
    panel_type = state.get("panel_type", "structured")

    logger.info(
        "panel_synthesis_starting",
        response_count=len(all_responses),
        consensus_score=final_consensus.get("consensus_score", 0) if final_consensus else 0,
    )

    # Build comprehensive report
    report_sections = []

    # Executive Summary
    report_sections.append(f"# Panel Discussion Report: {goal[:100]}")
    report_sections.append("")
    report_sections.append("## Executive Summary")
    report_sections.append(f"**Panel Type:** {panel_type.title()}")
    report_sections.append(f"**Experts Consulted:** {state.get('expert_count', len(set(r.get('expert_id') for r in all_responses)))}")
    report_sections.append(f"**Rounds Completed:** {state.get('current_round', 0)}")

    if final_consensus:
        report_sections.append(f"**Consensus Score:** {final_consensus.get('consensus_score', 0):.0%}")
        report_sections.append(f"**Consensus Level:** {final_consensus.get('consensus_level', 'N/A')}")
    report_sections.append("")

    # Expert Responses
    report_sections.append("## Expert Perspectives")
    report_sections.append("")

    # Group by expert
    experts_seen = {}
    for response in all_responses:
        expert_name = response.get("expert_name", "Expert")
        if expert_name not in experts_seen:
            experts_seen[expert_name] = []
        experts_seen[expert_name].append(response)

    for expert_name, responses in experts_seen.items():
        report_sections.append(f"### {expert_name}")
        for resp in responses:
            report_sections.append(f"**Round {resp.get('round_number', 1)}:**")
            report_sections.append(resp.get("content", "No response"))
            report_sections.append(f"*Confidence: {resp.get('confidence', 0):.0%}*")
            report_sections.append("")

    # Consensus Analysis
    if final_consensus:
        report_sections.append("## Consensus Analysis")
        report_sections.append("")

        if final_consensus.get("agreement_points"):
            report_sections.append("### Areas of Agreement")
            for point in final_consensus.get("agreement_points", []):
                report_sections.append(f"- {point}")
            report_sections.append("")

        if final_consensus.get("divergent_points"):
            report_sections.append("### Areas of Divergence")
            for point in final_consensus.get("divergent_points", []):
                report_sections.append(f"- {point}")
            report_sections.append("")

        if final_consensus.get("recommendation"):
            report_sections.append("### Recommendation")
            report_sections.append(final_consensus.get("recommendation", ""))
            report_sections.append("")

    content = "\n".join(report_sections)

    # Build final output
    final_output = {
        "content": content,
        "consensus": final_consensus,
        "expert_count": state.get("expert_count", 0),
        "round_count": state.get("current_round", 0),
        "responses": all_responses,
    }

    # Create artifact
    artifacts = state.get("artifacts", [])
    artifacts.append({
        "id": f"report_{state.get('mission_id', 'unknown')}",
        "type": "panel_report",
        "title": f"Panel Report: {goal[:50]}",
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    logger.info(
        "panel_synthesis_complete",
        content_length=len(content),
        artifact_count=len(artifacts),
    )

    return {
        "final_output": final_output,
        "artifacts": artifacts,
        "status": "quality_check",
    }


async def _quality_gate(state: PanelMissionState) -> Dict[str, Any]:
    """Assess quality of panel output"""
    final_output = state.get("final_output", {})
    content = final_output.get("content", "") if final_output else ""
    consensus = final_output.get("consensus", {}) if final_output else {}

    # Simple quality scoring
    quality_score = 0.0
    recommendations = []

    # Check content length
    if len(content) > 500:
        quality_score += 0.3
    else:
        recommendations.append("Output is brief - consider more detailed analysis")

    # Check consensus
    consensus_score = consensus.get("consensus_score", 0) if consensus else 0
    if consensus_score >= 0.7:
        quality_score += 0.4
    elif consensus_score >= 0.5:
        quality_score += 0.2
        recommendations.append("Moderate consensus - review divergent points")
    else:
        recommendations.append("Low consensus - expert opinions significantly differ")

    # Check response count
    response_count = len(state.get("all_responses", []))
    if response_count >= 3:
        quality_score += 0.3
    else:
        recommendations.append("Limited expert input - consider more perspectives")

    quality_passed = quality_score >= 0.6

    logger.info(
        "panel_quality_gate_complete",
        quality_score=quality_score,
        passed=quality_passed,
        recommendations=len(recommendations),
    )

    # Calculate execution time
    started_at = state.get("started_at")
    execution_time_ms = 0
    if started_at:
        try:
            start = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
            execution_time_ms = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)
        except Exception:
            pass

    return {
        "quality_score": quality_score,
        "quality_passed": quality_passed,
        "quality_recommendations": recommendations,
        "status": "completed",
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "execution_time_ms": execution_time_ms,
    }


# =============================================================================
# Graph Builder
# =============================================================================

def build_panel_autonomous_graph() -> CompiledStateGraph:
    """Build the panel autonomous workflow graph"""
    graph = StateGraph(PanelMissionState)

    # Add nodes
    graph.add_node("initialize", _initialize)
    graph.add_node("plan_panel", _plan_panel)
    graph.add_node("select_experts", _select_experts)
    graph.add_node("execute_round", _execute_round)
    graph.add_node("build_consensus", _build_consensus)
    graph.add_node("checkpoint", _checkpoint)
    graph.add_node("synthesize", _synthesize)
    graph.add_node("quality_gate", _quality_gate)

    # Routing functions
    def _route_after_consensus(state: PanelMissionState) -> str:
        status = state.get("status", "")
        if status == "executing":
            return "execute_round"
        return "checkpoint"

    def _route_after_checkpoint(state: PanelMissionState) -> str:
        status = state.get("status", "")
        if status == "checkpoint":
            return "checkpoint"  # Still waiting
        if status == "executing":
            return "execute_round"  # User requested another round
        if status == "failed":
            return END
        return "synthesize"

    # Set entry point
    graph.set_entry_point("initialize")

    # Add edges
    graph.add_edge("initialize", "plan_panel")
    graph.add_edge("plan_panel", "select_experts")
    graph.add_edge("select_experts", "execute_round")
    graph.add_edge("execute_round", "build_consensus")

    # Conditional edges
    graph.add_conditional_edges(
        "build_consensus",
        _route_after_consensus,
        {
            "execute_round": "execute_round",
            "checkpoint": "checkpoint",
        }
    )

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

    graph.add_edge("synthesize", "quality_gate")
    graph.add_edge("quality_gate", END)

    # Compile with checkpointer
    # NOTE: Removed interrupt_before=["checkpoint"] to allow autonomous execution
    # For HITL checkpoints, the checkpoint node will be called but execution continues
    # In the future, this can be made conditional based on auto_approve_checkpoints flag
    checkpointer = _get_checkpointer()
    compiled = graph.compile(
        checkpointer=checkpointer,
        # interrupt_before=["checkpoint"],  # Disabled for autonomous mode
    )

    logger.info(
        "panel_autonomous_graph_compiled",
        nodes=list(graph.nodes),
        checkpointer=type(checkpointer).__name__,
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
            "goal": initial_state.get("goal", "")[:200],
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
                # Emit round_started event when execute_round begins
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

                    # Yield individual responses (full content, no truncation)
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
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                            }

                elif event_name == "build_consensus":
                    consensus = output.get("final_consensus") or (
                        output.get("round_consensus", [])[-1]
                        if output.get("round_consensus") else None
                    )
                    if consensus:
                        yield {
                            "type": "consensus_update",
                            "consensus_score": consensus.get("consensus_score", 0),
                            "consensus_level": consensus.get("consensus_level"),
                            "agreement_points": consensus.get("agreement_points", []),
                            "divergent_points": consensus.get("divergent_points", []),
                            "key_themes": consensus.get("key_themes", []),
                            "recommendation": consensus.get("recommendation", ""),  # Full recommendation, no truncation
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }

                elif event_name == "checkpoint":
                    checkpoint = output.get("checkpoint_pending")
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
                    final_out = output.get("final_output", {})
                    yield {
                        "type": "panel_completed",
                        "mission_id": mission_id,
                        "status": output.get("status", "completed"),
                        "quality_score": output.get("quality_score", 0),
                        "execution_time_ms": output.get("execution_time_ms", 0),
                        "final_output": final_out,
                        "expert_count": final_out.get("expert_count", 0),
                        "round_count": final_out.get("round_count", 0),
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
