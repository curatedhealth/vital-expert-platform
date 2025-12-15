#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Investigation Runner - Hypothesis → Evidence → RCA Pattern

Implements the INVESTIGATION family with:
1) Pre-flight validation (tenant, goal/query)
2) Hypothesis generation
3) Evidence gathering/validation
4) Root-cause analysis and recommendations

Graph:
    START → initialize → preflight → generate_hypotheses →
    gather_evidence → analyze_root_cause → recommend_actions → quality_gate → END

HITL:
    - Plan approval checkpoint after hypotheses (blocking)
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
from .output_validation import validate_investigation_outputs

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


class InvestigationState(BaseFamilyState):
    """State for the Investigation runner."""

    hypotheses: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


@register_family_runner(FamilyType.INVESTIGATION)
class InvestigationRunner(BaseFamilyRunner[InvestigationState]):
    """Investigation runner for root-cause analysis."""

    family = FamilyType.INVESTIGATION
    state_class = InvestigationState

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

    def _create_nodes(self) -> Dict[str, Callable[[InvestigationState], InvestigationState]]:
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "generate_hypotheses": self._generate_hypotheses_node,
            "gather_evidence": self._gather_evidence_node,
            "analyze_root_cause": self._analyze_root_cause_node,
            "recommend_actions": self._recommend_actions_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "generate_hypotheses")
        graph.add_edge("generate_hypotheses", "gather_evidence")
        graph.add_edge("gather_evidence", "analyze_root_cause")
        graph.add_edge("analyze_root_cause", "recommend_actions")
        graph.add_edge("recommend_actions", "quality_gate")
        graph.add_edge("quality_gate", END)
        return graph

    # Nodes
    def _initialize_node(self, state: InvestigationState) -> InvestigationState:
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")
        return state

    def _preflight_validation_node(self, state: InvestigationState) -> InvestigationState:
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

    def _generate_hypotheses_node(self, state: InvestigationState) -> InvestigationState:
        state.phase = ExecutionPhase.PLAN
        prompt = (
            "Generate 3-5 hypotheses for the issue. For each, include rationale and evidence needed."
        )
        hypotheses = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Goal: {state.goal}\nContext: {state.context}"},
            ],
            max_tokens=500,
            timeout_seconds=20,
        )
        try:
            validated = validate_investigation_outputs(hypotheses, [], [], [])
            state.hypotheses = validated["hypotheses"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        state.requires_hitl = True
        state.hitl_reason = "Plan approval required for hypotheses"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="plan_approval",
            title="Review hypotheses",
            is_blocking=True,
        )
        return state

    def _gather_evidence_node(self, state: InvestigationState) -> InvestigationState:
        state.phase = ExecutionPhase.EXECUTE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="gather_evidence")
        prompt = "Collect evidence for each hypothesis. Return source, finding, confidence, and conflicts."
        evidence = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(state.hypotheses)},
            ],
            max_tokens=700,
            timeout_seconds=25,
        )
        try:
            validated = validate_investigation_outputs(state.hypotheses, evidence, [], [])
            state.hypotheses = validated["hypotheses"]
            state.evidence = validated["evidence"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        return state

    def _analyze_root_cause_node(self, state: InvestigationState) -> InvestigationState:
        state.phase = ExecutionPhase.SYNTHESIZE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="analyze_root_cause")
        prompt = "Analyze evidence and determine likely root causes with probabilities and gaps."
        findings = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str({"hypotheses": state.hypotheses, "evidence": state.evidence})},
            ],
            max_tokens=600,
            timeout_seconds=20,
        )
        try:
            validated = validate_investigation_outputs(state.hypotheses, state.evidence, findings, [])
            state.findings = validated["findings"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        return state

    def _recommend_actions_node(self, state: InvestigationState) -> InvestigationState:
        state.phase = ExecutionPhase.VERIFY
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="recommend_actions")
        prompt = "Recommend actions for the root causes. Include owners, timing, and expected impact."
        recs = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(state.findings)},
            ],
            max_tokens=500,
            timeout_seconds=20,
        )
        try:
            validated = validate_investigation_outputs(
                state.hypotheses,
                state.evidence,
                state.findings,
                recs,
            )
            state.recommendations = validated["recommendations"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        state.requires_hitl = True
        state.hitl_reason = "Final validation of recommendations"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="final_review",
            title="Validate recommendations",
            is_blocking=False,
        )
        return state

    def _quality_gate_node(self, state: InvestigationState) -> InvestigationState:
        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_COMPLETE, state, phase="quality_gate")
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                payload={
                    "mission_id": state.mission_id,
                    "hypotheses": len(state.hypotheses),
                    "findings": len(state.findings),
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
