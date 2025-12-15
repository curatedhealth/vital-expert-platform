#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Monitoring Runner - Poll → Detect Delta → Alert Pattern

Implements the MONITORING family with:
1) Pre-flight validation (tenant, goal/query)
2) Signal collection/polling
3) Delta detection and prioritization
4) Alert synthesis with recommendations

Graph:
    START → initialize → preflight → collect_signals →
    detect_delta → synthesize_alerts → quality_gate → END

HITL:
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
from .output_validation import validate_monitoring_outputs

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


class MonitoringState(BaseFamilyState):
    """State for the Monitoring runner."""

    signals: List[Dict[str, Any]] = Field(default_factory=list)
    deltas: List[Dict[str, Any]] = Field(default_factory=list)
    alerts: List[Dict[str, Any]] = Field(default_factory=list)
    watch_terms: List[str] = Field(default_factory=list)
    domains: List[str] = Field(default_factory=list)


@register_family_runner(FamilyType.MONITORING)
class MonitoringRunner(BaseFamilyRunner[MonitoringState]):
    """Monitoring runner implementing polling/delta/alert flow."""

    family = FamilyType.MONITORING
    state_class = MonitoringState

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

    def _create_nodes(self) -> Dict[str, Callable[[MonitoringState], MonitoringState]]:
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "collect_signals": self._collect_signals_node,
            "detect_delta": self._detect_delta_node,
            "synthesize_alerts": self._synthesize_alerts_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "collect_signals")
        graph.add_edge("collect_signals", "detect_delta")
        graph.add_edge("detect_delta", "synthesize_alerts")
        graph.add_edge("synthesize_alerts", "quality_gate")
        graph.add_edge("quality_gate", END)
        return graph

    # Nodes
    def _initialize_node(self, state: MonitoringState) -> MonitoringState:
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")
        return state

    def _preflight_validation_node(self, state: MonitoringState) -> MonitoringState:
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

    def _collect_signals_node(self, state: MonitoringState) -> MonitoringState:
        state.phase = ExecutionPhase.PLAN
        prompt = (
            "Given goal/context, list recent signals to monitor. "
            "Return items with source, headline, timestamp, relevance."
        )
        content = f"Goal: {state.goal}\nContext: {state.context}"
        signals = invoke_llm_with_timeout(
            self.llm,
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": content}],
            max_tokens=500,
            timeout_seconds=20,
        )
        state.signals = self._normalize_list(signals)
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_COMPLETE,
                payload={"phase": "collect_signals", "signal_count": len(state.signals)},
            )
        )
        return state

    def _detect_delta_node(self, state: MonitoringState) -> MonitoringState:
        state.phase = ExecutionPhase.EXECUTE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="detect_delta")
        prompt = (
            "Detect deltas/changes from signals. For each, provide: description, severity, "
            "confidence, recommended action."
        )
        deltas = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(state.signals)},
            ],
            max_tokens=500,
            timeout_seconds=20,
        )
        state.deltas = self._normalize_list(deltas)
        return state

    def _synthesize_alerts_node(self, state: MonitoringState) -> MonitoringState:
        state.phase = ExecutionPhase.SYNTHESIZE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="synthesize_alerts")
        prompt = (
            "Create concise alerts from deltas. For each alert, include: title, impact, "
            "recommended action, owner, urgency."
        )
        alerts = invoke_llm_with_timeout(
            self.llm,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(state.deltas)},
            ],
            max_tokens=500,
            timeout_seconds=20,
        )
        try:
            validated = validate_monitoring_outputs(state.signals, state.deltas, alerts)
            state.signals = validated["signals"]
            state.deltas = validated["deltas"]
            state.alerts = validated["alerts"]
        except ValidationError as exc:
            state.error = f"validation_failed: {exc}"
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "error": state.error},
                mission_id=state.mission_id,
            )
            raise
        # Optional final review HITL before completion (non-blocking)
        state.requires_hitl = True
        state.hitl_reason = "Final review of alerts"
        self._create_hitl_checkpoint_node(
            state,
            checkpoint_type="final_review",
            title="Review alerts and actions",
            is_blocking=False,
        )
        return state

    def _quality_gate_node(self, state: MonitoringState) -> MonitoringState:
        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = self._now()
        self._emit_phase_event(SSEEventType.PHASE_COMPLETE, state, phase="quality_gate")
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                payload={
                    "mission_id": state.mission_id,
                    "alerts": len(state.alerts),
                    "deltas": len(state.deltas),
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
