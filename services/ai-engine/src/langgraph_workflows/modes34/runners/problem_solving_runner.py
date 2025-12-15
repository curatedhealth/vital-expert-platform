#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Problem Solving Runner - Diagnose → Options → Action Plan

Implements the PROBLEM_SOLVING family with:
1) Pre-flight validation (tenant, goal/query)
2) Option generation and scoring
3) Action plan synthesis with owners and sequencing

Graph:
    START → initialize → preflight → ideate_options →
    evaluate_options → action_plan → quality_gate → END

HITL:
    - Plan approval checkpoint after options (blocking)
    - Optional final validation (non-blocking)
"""

from __future__ import annotations

import logging
from typing import Any, Callable, Dict, List, Optional

from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import Field

from langgraph_workflows.modes34.resilience import invoke_llm_with_timeout
from langgraph_workflows.modes34.resilience.exceptions import ValidationError
from .output_validation import validate_problem_solving_outputs

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


class ProblemSolvingState(BaseFamilyState):
    """State for the Problem Solving runner."""

    options: List[Dict[str, Any]] = Field(default_factory=list)
    scores: List[Dict[str, Any]] = Field(default_factory=list)
    plan_steps: List[Dict[str, Any]] = Field(default_factory=list)


@register_family_runner(FamilyType.PROBLEM_SOLVING)
class ProblemSolvingRunner(BaseFamilyRunner[ProblemSolvingState]):
    """Problem-solving runner for option evaluation and planning."""

    family = FamilyType.PROBLEM_SOLVING
    state_class = ProblemSolvingState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        **kwargs: Any,
    ):
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=2400,
        )

    def _create_nodes(self) -> Dict[str, Callable[[ProblemSolvingState], ProblemSolvingState]]:
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "ideate_options": self._ideate_options_node,
            "evaluate_options": self._evaluate_options_node,
            "action_plan": self._action_plan_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "ideate_options")
        graph.add_edge("ideate_options", "evaluate_options")
        graph.add_edge("evaluate_options", "action_plan")
        graph.add_edge("action_plan", "quality_gate")
        graph.add_edge("quality_gate", END)
        return graph

    # Nodes
    def _initialize_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")
        return state

    def _preflight_validation_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        state.phase = ExecutionPhase.INITIALIZE
        errors = []
        if not state.tenant_id:
            errors.append("tenant_id_missing")
        if not state.goal and not state.query:
            errors.append("goal_missing")
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

    def _ideate_options_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        state.phase = ExecutionPhase.PLAN
        prompt = (
            "Generate 3-5 solution options. Include summary, rationale, risks, dependencies, and rough effort."
        )
        options = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Goal: {state.goal}\nContext: {state.context}"},
            ],
            max_tokens=600,
            timeout_seconds=20,
        )
        try:
            validated = validate_problem_solving_outputs(options, [], [])
            state.options = validated["options"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        state.requires_hitl = True
        state.hitl_reason = "Plan approval required for solution options"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="plan_approval",
            title="Review solution options",
            is_blocking=True,
        )
        return state

    def _evaluate_options_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        state.phase = ExecutionPhase.EXECUTE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="evaluate_options")
        prompt = "Score options across impact, effort, risk, and confidence. Return normalized scores 0-1."
        scores = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(state.options)},
            ],
            max_tokens=600,
            timeout_seconds=20,
        )
        try:
            validated = validate_problem_solving_outputs(state.options, scores, [])
            state.options = validated["options"]
            state.scores = validated["scores"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        return state

    def _action_plan_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        state.phase = ExecutionPhase.SYNTHESIZE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="action_plan")
        prompt = (
            "Create a sequenced action plan for the top option(s). Include steps, owner, duration, dependencies, and success criteria."
        )
        plan = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str({"options": state.options, "scores": state.scores})},
            ],
            max_tokens=700,
            timeout_seconds=25,
        )
        try:
            validated = validate_problem_solving_outputs(state.options, state.scores, plan)
            state.plan_steps = validated["plan_steps"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        state.requires_hitl = True
        state.hitl_reason = "Final validation of action plan"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="final_review",
            title="Validate action plan",
            is_blocking=False,
        )
        return state

    def _quality_gate_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_COMPLETE, state, phase="quality_gate")
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                payload={
                    "mission_id": state.mission_id,
                    "options": len(state.options),
                    "plan_steps": len(state.plan_steps),
                },
            )
        )
        return state

    @staticmethod
    def _normalize_list(output: Any) -> List[Dict[str, Any]]:
        if isinstance(output, list):
            return output
        if isinstance(output, dict):
            return [output]
        return [{"text": output}]
