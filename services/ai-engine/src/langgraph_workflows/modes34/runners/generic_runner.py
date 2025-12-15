#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Generic Runner - Simple Plan → Execute → Summarize

Fallback runner for missions that do not map to a specialized family.

Graph:
    START → initialize → preflight → draft_plan →
    execute_steps → finalize → quality_gate → END

HITL:
    - Plan approval checkpoint after draft_plan (blocking)
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
from .output_validation import validate_generic_outputs

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


class GenericState(BaseFamilyState):
    """State for the Generic runner."""

    plan: List[Dict[str, Any]] = Field(default_factory=list)
    outputs: List[Dict[str, Any]] = Field(default_factory=list)


@register_family_runner(FamilyType.GENERIC)
class GenericRunner(BaseFamilyRunner[GenericState]):
    """Generic runner for simple structured missions."""

    family = FamilyType.GENERIC
    state_class = GenericState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        **kwargs: Any,
    ):
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.25,
            max_tokens=2000,
        )

    def _create_nodes(self) -> Dict[str, Callable[[GenericState], GenericState]]:
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "draft_plan": self._draft_plan_node,
            "execute_steps": self._execute_steps_node,
            "finalize": self._finalize_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "draft_plan")
        graph.add_edge("draft_plan", "execute_steps")
        graph.add_edge("execute_steps", "finalize")
        graph.add_edge("finalize", "quality_gate")
        graph.add_edge("quality_gate", END)
        return graph

    # Nodes
    def _initialize_node(self, state: GenericState) -> GenericState:
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")
        return state

    def _preflight_validation_node(self, state: GenericState) -> GenericState:
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

    def _draft_plan_node(self, state: GenericState) -> GenericState:
        state.phase = ExecutionPhase.PLAN
        prompt = "Draft a concise 3-5 step plan with owners, expected outcomes, and risks."
        plan = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Goal: {state.goal}\nContext: {state.context}"},
            ],
            max_tokens=500,
            timeout_seconds=15,
        )
        try:
            validated = validate_generic_outputs(plan, [])
            state.plan = validated["plan"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        state.requires_hitl = True
        state.hitl_reason = "Plan approval required for generic mission"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="plan_approval",
            title="Review generic plan",
            is_blocking=True,
        )
        return state

    def _execute_steps_node(self, state: GenericState) -> GenericState:
        state.phase = ExecutionPhase.EXECUTE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="execute_steps")
        prompt = "Execute the plan steps conceptually and produce outputs per step with assumptions and gaps."
        outputs = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(state.plan)},
            ],
            max_tokens=700,
            timeout_seconds=20,
        )
        try:
            validated = validate_generic_outputs(state.plan, outputs)
            state.plan = validated["plan"]
            state.outputs = validated["outputs"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        return state

    def _finalize_node(self, state: GenericState) -> GenericState:
        state.phase = ExecutionPhase.SYNTHESIZE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="finalize")
        prompt = "Summarize outputs, risks, open questions, and recommended next steps. Provide confidence 0-1."
        summary = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(state.outputs)},
            ],
            max_tokens=500,
            timeout_seconds=15,
        )
        state.outputs.append({"summary": summary})
        try:
            validated = validate_generic_outputs(state.plan, state.outputs)
            state.plan = validated["plan"]
            state.outputs = validated["outputs"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        state.requires_hitl = True
        state.hitl_reason = "Final validation of generic outputs"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="final_review",
            title="Validate generic outputs",
            is_blocking=False,
        )
        return state

    def _quality_gate_node(self, state: GenericState) -> GenericState:
        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_COMPLETE, state, phase="quality_gate")
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                payload={
                    "mission_id": state.mission_id,
                    "plan_steps": len(state.plan),
                    "outputs": len(state.outputs),
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
