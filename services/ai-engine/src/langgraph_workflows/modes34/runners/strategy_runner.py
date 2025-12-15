#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Strategy Runner - Scenario Planning → SWOT → Roadmap Pattern

Implements the STRATEGY family with:
1) Scenario planning with decision framing
2) SWOT-style analysis of each scenario
3) Roadmap synthesis with risks, milestones, and owners

Graph:
    START → initialize → scenario_planning → swot_assessment →
    roadmap_synthesis → quality_gate → END

HITL:
    - Plan approval checkpoint after scenario planning (blocking)
    - Optional final review checkpoint before completion (non-blocking)
"""

from __future__ import annotations

import logging
from typing import Any, Callable, Dict, List, Optional

from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import Field

from langgraph_workflows.modes34.resilience import invoke_llm_with_timeout
from langgraph_workflows.modes34.resilience.exceptions import ValidationError

from .base_family_runner import (
    BaseFamilyRunner,
    BaseFamilyState,
    ExecutionPhase,
    FamilyType,
    SSEEvent,
    SSEEventType,
    register_family_runner,
)

logger = logging.getLogger(__name__)


class StrategyState(BaseFamilyState):
    """State for the Strategy runner."""

    scenarios: List[Dict[str, Any]] = Field(default_factory=list)
    selected_scenarios: List[str] = Field(default_factory=list)
    swot: List[Dict[str, Any]] = Field(default_factory=list)
    roadmap: List[Dict[str, Any]] = Field(default_factory=list)
    risks: List[Dict[str, Any]] = Field(default_factory=list)
    mitigations: List[str] = Field(default_factory=list)
    decision: Optional[str] = Field(default=None)
    plan_summary: Optional[str] = Field(default=None)


@register_family_runner(FamilyType.STRATEGY)
class StrategyRunner(BaseFamilyRunner[StrategyState]):
    """
    Strategy runner implementing scenario planning, SWOT, and roadmap synthesis.
    """

    family = FamilyType.STRATEGY
    state_class = StrategyState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        scenario_count: int = 3,
        **kwargs: Any,
    ):
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=3000,
        )
        self.scenario_count = max(2, scenario_count)

    # -------------------------------------------------------------------------
    # Nodes
    # -------------------------------------------------------------------------
    def _create_nodes(self) -> Dict[str, Callable[[StrategyState], StrategyState]]:
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "scenario_planning": self._scenario_planning_node,
            "swot_assessment": self._swot_assessment_node,
            "roadmap_synthesis": self._roadmap_synthesis_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "scenario_planning")
        graph.add_edge("scenario_planning", "swot_assessment")
        graph.add_edge("swot_assessment", "roadmap_synthesis")
        graph.add_edge("roadmap_synthesis", "quality_gate")
        graph.add_edge("quality_gate", END)
        return graph

    # -------------------------------------------------------------------------
    # Node implementations
    # -------------------------------------------------------------------------
    def _initialize_node(self, state: StrategyState) -> StrategyState:
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")
        return state

    def _preflight_validation_node(self, state: StrategyState) -> StrategyState:
        state.phase = ExecutionPhase.INITIALIZE
        errors = []
        if not state.tenant_id:
            errors.append("tenant_id_missing")
        if not state.goal and not state.query:
            errors.append("goal_missing")
        if state.mode_4_constraints and isinstance(state.mode_4_constraints, dict):
            wall_time = state.mode_4_constraints.get("max_wall_time_minutes")
            if wall_time and wall_time > 60:
                errors.append("wall_time_exceeds_limit")
        if errors:
            state.error = ";".join(errors)
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.MISSION_FAILED,
                    payload={"mission_id": state.mission_id, "errors": errors},
                )
            )
            raise ValidationError(message=state.error)

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_COMPLETE,
                payload={"phase": "preflight", "status": "passed"},
            )
        )
        return state

    def _scenario_planning_node(self, state: StrategyState) -> StrategyState:
        state.phase = ExecutionPhase.PLAN
        prompt = (
            "You are a strategy advisor. Given the goal and context, generate "
            f"{self.scenario_count} plausible scenarios. For each scenario, provide: "
            "name, description, key assumptions, leading indicators."
        )
        content = f"Goal: {state.goal}\nContext: {state.context}"
        scenarios = invoke_llm_with_timeout(
            self.llm,
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": content}],
            max_tokens=600,
            timeout_seconds=20,
        )
        state.scenarios = self._parse_list_output(scenarios)
        state.total_steps = len(state.scenarios) + 3
        logger.info("strategy_scenarios_generated", mission_id=state.mission_id, count=len(state.scenarios))
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_COMPLETE,
                payload={"phase": "scenario_planning", "scenario_count": len(state.scenarios)},
            )
        )
        # HITL checkpoint: plan approval
        state.requires_hitl = True
        state.hitl_reason = "Plan approval required for scenarios"
        return self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="plan_approval",
            title="Review and approve scenarios",
            is_blocking=True,
        )

    def _swot_assessment_node(self, state: StrategyState) -> StrategyState:
        state.phase = ExecutionPhase.EXECUTE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="swot_assessment")

        swot_prompt = (
            "For each scenario, perform a SWOT-style assessment. "
            "Return strengths, weaknesses, opportunities, threats, and a risk rating."
        )
        for scenario in state.scenarios:
            swot_raw = invoke_llm_with_timeout(
                self.llm,
                messages=[
                    {"role": "system", "content": swot_prompt},
                    {"role": "user", "content": str(scenario)},
                ],
                max_tokens=400,
                timeout_seconds=15,
            )
            state.swot.append(self._normalize_swot(scenario, swot_raw))
        logger.info("strategy_swot_completed", mission_id=state.mission_id, count=len(state.swot))
        return state

    def _roadmap_synthesis_node(self, state: StrategyState) -> StrategyState:
        state.phase = ExecutionPhase.SYNTHESIZE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="roadmap_synthesis")

        roadmap_prompt = (
            "Synthesize a 90-day roadmap from the scenarios and SWOTs. "
            "Include milestones (bi-weekly), owners, risks, and mitigations. "
            "Return also a recommended decision and concise plan summary."
        )
        roadmap_raw = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": roadmap_prompt},
                {"role": "user", "content": f"Scenarios: {state.scenarios}\nSWOT: {state.swot}"},
            ],
            max_tokens=700,
            timeout_seconds=25,
        )
        state.roadmap = self._normalize_roadmap(roadmap_raw)
        state.plan_summary = roadmap_raw if isinstance(roadmap_raw, str) else None
        try:
            validated = validate_strategy_outputs(state.scenarios, state.swot, state.roadmap)
            state.scenarios = validated["scenarios"]
            state.swot = validated["swot"]
            state.roadmap = validated["roadmap"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        logger.info(
            "strategy_roadmap_synthesized",
            mission_id=state.mission_id,
            roadmap_items=len(state.roadmap),
        )
        # Optional final review HITL before completion (non-blocking)
        state.requires_hitl = True
        state.hitl_reason = "Final review of roadmap"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="final_review",
            title="Review roadmap and mitigations",
            is_blocking=False,
        )
        return state

    def _quality_gate_node(self, state: StrategyState) -> StrategyState:
        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_COMPLETE, state, phase="quality_gate")
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                payload={
                    "mission_id": state.mission_id,
                    "summary": state.plan_summary,
                    "roadmap_size": len(state.roadmap),
                },
            )
        )
        return state

    # -------------------------------------------------------------------------
    # Helpers
    # -------------------------------------------------------------------------
    @staticmethod
    def _parse_list_output(output: Any) -> List[Dict[str, Any]]:
        """
        Best-effort parsing: if the model returns a list-like structure, use it;
        otherwise wrap in a single-item list with text.
        """
        if isinstance(output, list):
            return output  # assume already structured
        return [{"text": output}]

    @staticmethod
    def _normalize_swot(scenario: Dict[str, Any], swot_raw: Any) -> Dict[str, Any]:
        """Normalize SWOT output into a dict shape."""
        swot_block = swot_raw if isinstance(swot_raw, dict) else {"text": swot_raw}
        return {
            "scenario": scenario.get("name") or scenario.get("id") or "scenario",
            "swot": swot_block,
        }

    @staticmethod
    def _normalize_roadmap(roadmap_raw: Any) -> List[Dict[str, Any]]:
        """
        Normalize roadmap output to list of milestones with owner/risk/mitigation if present.
        """
        if isinstance(roadmap_raw, list):
            return roadmap_raw
        if isinstance(roadmap_raw, dict):
            return [roadmap_raw]
        return [{"milestone": "summary", "details": roadmap_raw}]
