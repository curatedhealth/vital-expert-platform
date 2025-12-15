#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Evaluation Runner - Benchmark → Score → Recommend

Implements the EVALUATION family with:
1) Pre-flight validation (tenant, goal/query)
2) Criteria/rubric generation
3) Scoring against rubric
4) Synthesis and recommendations

Graph:
    START → initialize → preflight → define_criteria →
    score_items → synthesize_findings → quality_gate → END

HITL:
    - Plan approval checkpoint after criteria (blocking)
    - Optional final validation checkpoint (non-blocking)
"""

from __future__ import annotations

import logging
from typing import Any, Callable, Dict, List, Optional

from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import Field

from langgraph_workflows.modes34.resilience import invoke_llm_with_timeout
from langgraph_workflows.modes34.resilience.exceptions import ValidationError
from .output_validation import validate_evaluation_outputs

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


class EvaluationState(BaseFamilyState):
    """State for the Evaluation runner."""

    criteria: List[Dict[str, Any]] = Field(default_factory=list)
    scored_items: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


@register_family_runner(FamilyType.EVALUATION)
class EvaluationRunner(BaseFamilyRunner[EvaluationState]):
    """Evaluation runner for rubric-based scoring."""

    family = FamilyType.EVALUATION
    state_class = EvaluationState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        **kwargs: Any,
    ):
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=2500,
        )

    def _create_nodes(self) -> Dict[str, Callable[[EvaluationState], EvaluationState]]:
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "define_criteria": self._define_criteria_node,
            "score_items": self._score_items_node,
            "synthesize_findings": self._synthesize_findings_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "define_criteria")
        graph.add_edge("define_criteria", "score_items")
        graph.add_edge("score_items", "synthesize_findings")
        graph.add_edge("synthesize_findings", "quality_gate")
        graph.add_edge("quality_gate", END)
        return graph

    # Nodes
    def _initialize_node(self, state: EvaluationState) -> EvaluationState:
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")
        return state

    def _preflight_validation_node(self, state: EvaluationState) -> EvaluationState:
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

    def _define_criteria_node(self, state: EvaluationState) -> EvaluationState:
        state.phase = ExecutionPhase.PLAN
        prompt = (
            "Define evaluation criteria and rubric for the given goal/context. "
            "Return list with criterion, description, weight (0-1), and scoring guidance."
        )
        content = f"Goal: {state.goal}\nContext: {state.context}"
        criteria = invoke_llm_with_timeout(
            self.llm,
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": content}],
            max_tokens=500,
            timeout_seconds=20,
        )
        try:
            validated = validate_evaluation_outputs(criteria, [], [])
            state.criteria = validated["criteria"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        # HITL plan approval
        state.requires_hitl = True
        state.hitl_reason = "Plan approval required for criteria"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="plan_approval",
            title="Review evaluation criteria",
            is_blocking=True,
        )
        return state

    def _score_items_node(self, state: EvaluationState) -> EvaluationState:
        state.phase = ExecutionPhase.EXECUTE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="score_items")
        prompt = (
            "Score against rubric. Return items with criterion, score (0-1), rationale, and issues found."
        )
        scored = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Criteria: {state.criteria}\nGoal: {state.goal}\nContext: {state.context}"},
            ],
            max_tokens=700,
            timeout_seconds=25,
        )
        try:
            validated = validate_evaluation_outputs(state.criteria, scored, [])
            state.criteria = validated["criteria"]
            state.scored_items = validated["scores"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        return state

    def _synthesize_findings_node(self, state: EvaluationState) -> EvaluationState:
        state.phase = ExecutionPhase.SYNTHESIZE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="synthesize_findings")
        prompt = (
            "Synthesize scores into findings. Provide: strengths, gaps, overall score (0-1), "
            "recommendations, and next steps."
        )
        recs = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Scores: {state.scored_items}"},
            ],
            max_tokens=600,
            timeout_seconds=20,
        )
        try:
            validated = validate_evaluation_outputs(state.criteria, state.scored_items, recs)
            state.recommendations = validated["recommendations"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        # Optional final validation HITL
        state.requires_hitl = True
        state.hitl_reason = "Final validation of findings"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="final_review",
            title="Validate findings and recommendations",
            is_blocking=False,
        )
        return state

    def _quality_gate_node(self, state: EvaluationState) -> EvaluationState:
        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_COMPLETE, state, phase="quality_gate")
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                payload={
                    "mission_id": state.mission_id,
                    "criteria": len(state.criteria),
                    "scored_items": len(state.scored_items),
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

    @staticmethod
    def _normalize_recs(output: Any) -> List[str]:
        if isinstance(output, list):
            return [str(x) for x in output]
        if isinstance(output, dict):
            return [str(output)]
        return [str(output)]
