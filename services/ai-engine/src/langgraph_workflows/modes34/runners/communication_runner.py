#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Communication Runner - Audience → Message → Channels

Implements the COMMUNICATION family with:
1) Pre-flight validation (tenant, goal/query)
2) Audience segmentation and need analysis
3) Message design and adaptation
4) Channel plan with sequencing and KPIs

Graph:
    START → initialize → preflight → audience_analysis →
    message_design → channel_plan → quality_gate → END

HITL:
    - Plan approval checkpoint after audience analysis (blocking)
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
from .output_validation import validate_communication_outputs

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


class CommunicationState(BaseFamilyState):
    """State for the Communication runner."""

    audience_segments: List[Dict[str, Any]] = Field(default_factory=list)
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    channel_plan: List[Dict[str, Any]] = Field(default_factory=list)


@register_family_runner(FamilyType.COMMUNICATION)
class CommunicationRunner(BaseFamilyRunner[CommunicationState]):
    """Communication runner for audience-led messaging and channel planning."""

    family = FamilyType.COMMUNICATION
    state_class = CommunicationState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        **kwargs: Any,
    ):
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.35,
            max_tokens=2400,
        )

    def _create_nodes(self) -> Dict[str, Callable[[CommunicationState], CommunicationState]]:
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "audience_analysis": self._audience_analysis_node,
            "message_design": self._message_design_node,
            "channel_plan": self._channel_plan_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "audience_analysis")
        graph.add_edge("audience_analysis", "message_design")
        graph.add_edge("message_design", "channel_plan")
        graph.add_edge("channel_plan", "quality_gate")
        graph.add_edge("quality_gate", END)
        return graph

    # Nodes
    def _initialize_node(self, state: CommunicationState) -> CommunicationState:
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")
        return state

    def _preflight_validation_node(self, state: CommunicationState) -> CommunicationState:
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

    def _audience_analysis_node(self, state: CommunicationState) -> CommunicationState:
        state.phase = ExecutionPhase.PLAN
        prompt = "Segment the audience. Include needs, barriers, preferred channels, and risk flags."
        segments = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Goal: {state.goal}\nContext: {state.context}"},
            ],
            max_tokens=600,
            timeout_seconds=20,
        )
        try:
            validated = validate_communication_outputs(segments, [], [])
            state.audience_segments = validated["segments"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        state.requires_hitl = True
        state.hitl_reason = "Plan approval required for audience segmentation"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="plan_approval",
            title="Review audience segments",
            is_blocking=True,
        )
        return state

    def _message_design_node(self, state: CommunicationState) -> CommunicationState:
        state.phase = ExecutionPhase.EXECUTE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="message_design")
        prompt = (
            "Design tailored messages per segment. Include key messages, tone, CTA, risks, and compliance notes."
        )
        messages = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(state.audience_segments)},
            ],
            max_tokens=700,
            timeout_seconds=25,
        )
        try:
            validated = validate_communication_outputs(state.audience_segments, messages, [])
            state.messages = validated["messages"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        return state

    def _channel_plan_node(self, state: CommunicationState) -> CommunicationState:
        state.phase = ExecutionPhase.SYNTHESIZE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="channel_plan")
        prompt = (
            "Create a channel plan. Include cadence, sequencing, budget guardrails, KPIs, and fallback paths."
        )
        plan = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str({"segments": state.audience_segments, "messages": state.messages})},
            ],
            max_tokens=700,
            timeout_seconds=25,
        )
        try:
            validated = validate_communication_outputs(state.audience_segments, state.messages, plan)
            state.channel_plan = validated["channel_plan"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        state.requires_hitl = True
        state.hitl_reason = "Final validation of channel plan"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="final_review",
            title="Validate channel plan",
            is_blocking=False,
        )
        return state

    def _quality_gate_node(self, state: CommunicationState) -> CommunicationState:
        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_COMPLETE, state, phase="quality_gate")
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                payload={
                    "mission_id": state.mission_id,
                    "segments": len(state.audience_segments),
                    "plan_items": len(state.channel_plan),
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
