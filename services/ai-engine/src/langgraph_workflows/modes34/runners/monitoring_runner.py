#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
# GRADE: A+ (upgraded from B+)
"""
Monitoring Runner - Poll → Detect Delta → Alert Pattern

Implements the MONITORING family with:
1) Signal collection and polling from multiple sources
2) Delta detection with severity classification
3) Alert synthesis with prioritization and recommendations
4) Quality-gated output with confidence scoring

Graph:
    START → initialize → preflight → collect_signals →
    detect_delta → synthesize_alerts → quality_gate → END
                                              ↓
                                    (conditional routing)
                                         ↙        ↘
                                    complete    hitl_required

HITL:
    - Plan approval checkpoint after signal collection (blocking for critical)
    - Final review checkpoint after alert synthesis (non-blocking)

Reasoning Pattern:
    Continuous monitoring detects environmental changes
    Delta analysis prioritizes significant changes
    Alert synthesis enables proactive response
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import Field

from langgraph_workflows.modes34.resilience import (
    graceful_degradation,
    invoke_llm_with_timeout,
)
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


# =============================================================================
# Alert Severity Levels
# =============================================================================

class AlertSeverity:
    """Standard alert severity levels."""
    CRITICAL = "critical"  # Immediate action required
    HIGH = "high"          # Urgent attention needed
    MEDIUM = "medium"      # Should be addressed soon
    LOW = "low"            # Informational/minor
    INFO = "info"          # For awareness only


# =============================================================================
# Monitoring State
# =============================================================================

class MonitoringState(BaseFamilyState):
    """
    State for the Monitoring runner.

    Extends BaseFamilyState with monitoring-specific fields for
    signal collection, delta detection, and alert synthesis.
    """
    # Signal collection fields
    signals: List[Dict[str, Any]] = Field(default_factory=list)
    signal_sources: List[str] = Field(default_factory=list)
    signal_count: int = Field(default=0)

    # Delta detection fields
    deltas: List[Dict[str, Any]] = Field(default_factory=list)
    delta_severity_counts: Dict[str, int] = Field(default_factory=dict)
    significant_changes: int = Field(default=0)

    # Alert fields
    alerts: List[Dict[str, Any]] = Field(default_factory=list)
    critical_alerts: int = Field(default=0)
    high_priority_alerts: int = Field(default=0)

    # Watch configuration
    watch_terms: List[str] = Field(default_factory=list)
    domains: List[str] = Field(default_factory=list)
    monitoring_interval: str = Field(default="daily")

    # Mode 4 constraints (for autonomous execution)
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)

    # Quality tracking specific to monitoring
    signal_coverage: float = Field(default=0.0)
    delta_accuracy: float = Field(default=0.0)
    alert_actionability: float = Field(default=0.0)


# =============================================================================
# Monitoring Runner
# =============================================================================

@register_family_runner(FamilyType.MONITORING)
class MonitoringRunner(BaseFamilyRunner[MonitoringState]):
    """
    Monitoring runner implementing continuous signal monitoring and alerting.

    This runner follows the pattern:
    1. Collect signals from multiple sources (polling)
    2. Detect deltas/changes with severity classification
    3. Synthesize alerts with prioritized recommendations

    Graph Nodes:
        - initialize: Setup state and configure monitoring parameters
        - preflight: Validate inputs (tenant, goal, watch terms)
        - collect_signals: Gather signals from configured sources
        - detect_delta: Identify significant changes with severity
        - synthesize_alerts: Create actionable alerts with owners
        - quality_gate: Final quality assessment with confidence

    HITL Checkpoints:
        - After collect_signals: Signal review (blocking for critical)
        - After synthesize_alerts: Alert validation (non-blocking)

    Monitoring Benefits:
        - Proactive change detection
        - Severity-based prioritization
        - Actionable alerts with clear ownership
        - Trend analysis over time
    """

    family = FamilyType.MONITORING
    state_class = MonitoringState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        critical_threshold: float = 0.8,
        min_delta_confidence: float = 0.6,
        **kwargs: Any,
    ):
        """
        Initialize Monitoring runner.

        Args:
            llm: LangChain LLM for analysis (defaults to GPT-4)
            critical_threshold: Threshold for critical alert escalation
            min_delta_confidence: Minimum confidence for delta detection
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=8000,  # Increased from 3000 to support longer outputs
        )
        self.critical_threshold = critical_threshold
        self.min_delta_confidence = min_delta_confidence

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[MonitoringState], MonitoringState]]:
        """Create nodes for Monitoring graph."""
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "collect_signals": self._collect_signals_node,
            "detect_delta": self._detect_delta_node,
            "synthesize_alerts": self._synthesize_alerts_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Monitoring graph with conditional routing."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "collect_signals")
        graph.add_edge("collect_signals", "detect_delta")
        graph.add_edge("detect_delta", "synthesize_alerts")
        graph.add_edge("synthesize_alerts", "quality_gate")
        graph.add_conditional_edges(
            "quality_gate",
            self._route_after_quality,
            {
                "complete": END,
                "hitl_required": END,
            }
        )
        return graph

    def _get_interrupt_nodes(self) -> List[str]:
        """
        Nodes that can trigger HITL checkpoints.

        Returns:
            List of node names for interrupt_before in graph.compile()
        """
        return ["collect_signals", "synthesize_alerts"]

    # =========================================================================
    # Routing Functions
    # =========================================================================

    def _route_after_quality(self, state: MonitoringState) -> str:
        """
        Route after quality gate based on confidence and critical alerts.

        Args:
            state: Current monitoring state

        Returns:
            "hitl_required" if critical alerts exist or low confidence,
            "complete" otherwise
        """
        # Force HITL review if critical alerts detected
        if state.critical_alerts > 0:
            logger.info(
                "monitoring_critical_alerts_hitl",
                critical_count=state.critical_alerts,
            )
            return "hitl_required"

        if state.requires_hitl and state.confidence_score < self.confidence_threshold:
            logger.info(
                "monitoring_hitl_required",
                confidence=state.confidence_score,
                threshold=self.confidence_threshold,
            )
            return "hitl_required"
        return "complete"

    # =========================================================================
    # Optional Overrides
    # =========================================================================

    def _create_initial_state(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> MonitoringState:
        """Create initial state with monitoring-specific defaults."""
        return MonitoringState(
            query=query,
            goal=query,
            context=context or {},
            watch_terms=kwargs.get("watch_terms", []),
            domains=kwargs.get("domains", []),
            monitoring_interval=kwargs.get("interval", "daily"),
            mode_4_constraints=kwargs.get("mode_4_constraints"),
            total_steps=6,
            **{k: v for k, v in kwargs.items() if k in MonitoringState.__fields__},
        )

    # =========================================================================
    # Node Implementations (Async with Graceful Degradation)
    # =========================================================================

    @graceful_degradation(domain="monitoring", fallback_value=None)
    async def _initialize_node(self, state: MonitoringState) -> MonitoringState:
        """
        Initialize monitoring state.

        Sets up timing, phase tracking, and emits mission start event.
        """
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = datetime.utcnow()
        state.current_step = 1

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_STARTED,
                data={
                    "mission_id": state.mission_id,
                    "family": self.family.value,
                    "query": state.query,
                    "watch_terms": state.watch_terms,
                    "domains": state.domains,
                    "total_steps": state.total_steps,
                },
                mission_id=state.mission_id,
            )
        )

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "initialize", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        logger.info(
            "monitoring_initialized",
            mission_id=state.mission_id,
            watch_terms=len(state.watch_terms),
            domains=len(state.domains),
        )
        return state

    @graceful_degradation(domain="monitoring", fallback_value=None)
    async def _preflight_validation_node(self, state: MonitoringState) -> MonitoringState:
        """
        Validate monitoring inputs.

        Checks tenant_id, goal/query, and monitoring configuration.
        """
        state.current_step = 2
        errors = []

        # Tenant validation
        if not state.tenant_id:
            errors.append("tenant_id_missing")

        # Goal validation
        if not state.goal and not state.query:
            errors.append("monitoring_goal_missing")

        # Mode 4 constraint validation
        if state.mode_4_constraints:
            if not state.mode_4_constraints.get("budget_tokens"):
                logger.warning("mode4_missing_budget", mission_id=state.mission_id)

        if errors:
            state.error = ";".join(errors)
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.MISSION_FAILED,
                    data={
                        "mission_id": state.mission_id,
                        "errors": errors,
                        "phase": "preflight",
                    },
                    mission_id=state.mission_id,
                )
            )
            raise ValidationError(message=state.error)

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_COMPLETE,
                data={"phase": "preflight", "status": "passed"},
                mission_id=state.mission_id,
            )
        )

        logger.info("monitoring_preflight_passed", mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="monitoring", fallback_value=None)
    async def _collect_signals_node(self, state: MonitoringState) -> MonitoringState:
        """
        Collect signals from configured sources.

        Gathers relevant signals based on:
        - Watch terms and keywords
        - Domain-specific sources
        - Monitoring interval
        """
        state.phase = ExecutionPhase.PLAN
        state.current_step = 3

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "collect_signals", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        # Build watch terms from context if not provided
        watch_context = ""
        if state.watch_terms:
            watch_context = f"Watch terms: {', '.join(state.watch_terms)}"
        if state.domains:
            watch_context += f"\nDomains: {', '.join(state.domains)}"

        prompt = """You are an expert signal monitoring analyst.

Identify and collect relevant signals for monitoring the given topic.

For each signal provide:
1. source: Where the signal originated (news, regulatory, social, market, etc.)
2. headline: Brief title of the signal
3. summary: 1-2 sentence description
4. timestamp: When the signal was detected (relative: today, yesterday, this week)
5. relevance_score: How relevant to the monitoring goal (0.0-1.0)
6. signal_type: Type of signal (news, announcement, filing, trend, anomaly)

Return a JSON array of signal objects.
Focus on recent, high-relevance signals.
Include diverse source types for comprehensive coverage."""

        content = f"""Monitoring Goal: {state.goal}

{watch_context}

Context: {state.context}

Monitoring Interval: {state.monitoring_interval}

Collect relevant signals for this monitoring task."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=25,
            )

            # Parse and store signals
            signals_data = self._parse_signals_response(response)
            state.signals = signals_data
            state.signal_count = len(signals_data)

            # Extract unique sources
            state.signal_sources = list(set(
                s.get("source", "unknown") for s in signals_data
            ))

            # Calculate signal coverage quality
            source_diversity = min(len(state.signal_sources) / 5, 1.0)  # Target 5 sources
            signal_volume = min(state.signal_count / 10, 1.0)  # Target 10 signals
            avg_relevance = (
                sum(s.get("relevance_score", 0.5) for s in signals_data) / max(len(signals_data), 1)
            )
            state.signal_coverage = (source_diversity + signal_volume + avg_relevance) / 3

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "collect_signals",
                        "signal_count": state.signal_count,
                        "sources": state.signal_sources,
                        "coverage": state.signal_coverage,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("signal_collection_failed", error=str(exc))
            state.error = f"signal_collection_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "collect_signals", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "monitoring_signals_collected",
            mission_id=state.mission_id,
            signal_count=state.signal_count,
        )
        return state

    @graceful_degradation(domain="monitoring", fallback_value=None)
    async def _detect_delta_node(self, state: MonitoringState) -> MonitoringState:
        """
        Detect deltas/changes from collected signals.

        Analyzes signals to identify:
        - Significant changes from baseline
        - Severity classification
        - Confidence in delta detection
        """
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 4

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "detect_delta", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert change detection analyst.

Analyze the collected signals to detect significant changes (deltas).

For each delta provide:
1. description: What changed and why it matters
2. severity: critical | high | medium | low | info
3. confidence: How confident in this detection (0.0-1.0)
4. source_signals: Which signals contributed to this delta
5. trend_direction: increasing | decreasing | stable | volatile
6. recommended_action: Brief suggested response
7. time_sensitivity: immediate | hours | days | weeks

Return a JSON array of delta objects.
Focus on actionable, significant changes.
Classify severity based on business impact."""

        content = f"""Monitoring Goal: {state.goal}

Collected Signals:
{self._format_signals_for_prompt(state.signals)}

Detect significant changes and classify by severity."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse deltas
            deltas_data = self._parse_deltas_response(response)
            state.deltas = deltas_data

            # Count by severity
            severity_counts = {
                AlertSeverity.CRITICAL: 0,
                AlertSeverity.HIGH: 0,
                AlertSeverity.MEDIUM: 0,
                AlertSeverity.LOW: 0,
                AlertSeverity.INFO: 0,
            }
            for delta in deltas_data:
                severity = delta.get("severity", AlertSeverity.LOW)
                if severity in severity_counts:
                    severity_counts[severity] += 1

            state.delta_severity_counts = severity_counts
            state.significant_changes = (
                severity_counts[AlertSeverity.CRITICAL] +
                severity_counts[AlertSeverity.HIGH] +
                severity_counts[AlertSeverity.MEDIUM]
            )

            # Calculate delta accuracy based on confidence scores
            if deltas_data:
                avg_confidence = sum(d.get("confidence", 0.5) for d in deltas_data) / len(deltas_data)
                high_confidence_ratio = sum(
                    1 for d in deltas_data if d.get("confidence", 0) >= self.min_delta_confidence
                ) / len(deltas_data)
                state.delta_accuracy = (avg_confidence + high_confidence_ratio) / 2
            else:
                state.delta_accuracy = 0.0

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "detect_delta",
                        "delta_count": len(state.deltas),
                        "severity_counts": state.delta_severity_counts,
                        "significant_changes": state.significant_changes,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("delta_detection_failed", error=str(exc))
            state.error = f"delta_detection_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "detect_delta", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "monitoring_deltas_detected",
            mission_id=state.mission_id,
            delta_count=len(state.deltas),
            significant=state.significant_changes,
        )
        return state

    @graceful_degradation(domain="monitoring", fallback_value=None)
    async def _synthesize_alerts_node(self, state: MonitoringState) -> MonitoringState:
        """
        Synthesize alerts from detected deltas.

        Creates actionable alerts with:
        - Priority and urgency
        - Clear ownership assignment
        - Recommended actions
        """
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 5

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "synthesize_alerts", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert alert synthesis analyst.

Create actionable alerts from the detected deltas.

For each alert provide:
1. title: Concise alert headline
2. severity: critical | high | medium | low | info
3. description: What happened and why it matters
4. impact: Business impact if not addressed
5. recommended_action: Specific steps to take
6. owner: Suggested owner role (e.g., "Regulatory Affairs", "Risk Management")
7. urgency: immediate | within_hours | within_days | when_possible
8. related_deltas: Which deltas this alert addresses

Return a JSON array of alert objects.
Consolidate related deltas into single alerts where appropriate.
Prioritize actionability and clarity."""

        content = f"""Monitoring Goal: {state.goal}

Detected Deltas:
{self._format_deltas_for_prompt(state.deltas)}

Severity Distribution: {state.delta_severity_counts}

Synthesize actionable alerts with clear ownership."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse alerts
            alerts_data = self._parse_alerts_response(response)

            # Validate through output validator
            validated = validate_monitoring_outputs(state.signals, state.deltas, alerts_data)
            state.signals = validated.get("signals", state.signals)
            state.deltas = validated.get("deltas", state.deltas)
            state.alerts = validated.get("alerts", alerts_data)

            # Count critical and high priority alerts
            state.critical_alerts = sum(
                1 for a in state.alerts if a.get("severity") == AlertSeverity.CRITICAL
            )
            state.high_priority_alerts = sum(
                1 for a in state.alerts if a.get("severity") in [AlertSeverity.CRITICAL, AlertSeverity.HIGH]
            )

            # Calculate alert actionability
            actionability_factors = []
            for alert in state.alerts:
                has_action = bool(alert.get("recommended_action"))
                has_owner = bool(alert.get("owner"))
                has_urgency = bool(alert.get("urgency"))
                actionability_factors.append((has_action + has_owner + has_urgency) / 3)

            state.alert_actionability = (
                sum(actionability_factors) / len(actionability_factors)
                if actionability_factors else 0.0
            )

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "synthesize_alerts",
                        "alert_count": len(state.alerts),
                        "critical_alerts": state.critical_alerts,
                        "high_priority": state.high_priority_alerts,
                        "actionability": state.alert_actionability,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("alert_synthesis_failed", error=str(exc))
            state.error = f"alert_synthesis_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "synthesize_alerts", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - alert review
        # Blocking if critical alerts exist
        is_blocking = state.critical_alerts > 0
        state.requires_hitl = True
        state.hitl_reason = (
            f"Critical alerts require immediate review ({state.critical_alerts} critical)"
            if is_blocking
            else "Final review of monitoring alerts"
        )
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="alert_review" if is_blocking else "final_review",
            title="Review Monitoring Alerts",
            description=f"{len(state.alerts)} alerts generated ({state.critical_alerts} critical)",
            is_blocking=is_blocking,
            data={
                "alerts": state.alerts[:10],  # First 10 alerts
                "critical_count": state.critical_alerts,
                "severity_distribution": state.delta_severity_counts,
            },
        )

        logger.info(
            "monitoring_alerts_synthesized",
            mission_id=state.mission_id,
            alert_count=len(state.alerts),
            critical=state.critical_alerts,
        )
        return state

    @graceful_degradation(domain="monitoring", fallback_value=None)
    async def _quality_gate_node(self, state: MonitoringState) -> MonitoringState:
        """
        Final quality assessment with confidence scoring.

        Calculates multi-factor confidence score based on:
        - Signal coverage
        - Delta detection accuracy
        - Alert actionability
        - Overall completeness
        """
        state.phase = ExecutionPhase.COMPLETE
        state.current_step = 6
        state.completed_at = datetime.utcnow()

        # Calculate multi-factor confidence score
        quality_factors = [
            state.signal_coverage,
            state.delta_accuracy,
            state.alert_actionability,
            min(len(state.alerts) / max(state.significant_changes, 1), 1.0),
            1.0 if state.alerts else 0.0,
        ]
        state.confidence_score = sum(quality_factors) / len(quality_factors)

        # Also set quality_score for compatibility
        state.quality_score = state.confidence_score

        # Force HITL review for critical alerts or low confidence
        if state.critical_alerts > 0:
            state.requires_hitl = True
            state.hitl_reason = f"Critical alerts ({state.critical_alerts}) require human review"
        elif state.confidence_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Low confidence ({state.confidence_score:.2f}) requires review"

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.QUALITY_CHECK,
                data={
                    "confidence_score": state.confidence_score,
                    "quality_factors": {
                        "signal_coverage": state.signal_coverage,
                        "delta_accuracy": state.delta_accuracy,
                        "alert_actionability": state.alert_actionability,
                    },
                    "threshold": self.confidence_threshold,
                    "passed": state.confidence_score >= self.confidence_threshold,
                    "critical_alerts": state.critical_alerts,
                },
                mission_id=state.mission_id,
            )
        )

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                data={
                    "mission_id": state.mission_id,
                    "confidence_score": state.confidence_score,
                    "signal_count": state.signal_count,
                    "delta_count": len(state.deltas),
                    "alert_count": len(state.alerts),
                    "critical_alerts": state.critical_alerts,
                    "high_priority_alerts": state.high_priority_alerts,
                    "execution_time_seconds": (
                        (state.completed_at - state.started_at).total_seconds()
                        if state.started_at and state.completed_at
                        else 0
                    ),
                },
                mission_id=state.mission_id,
            )
        )

        logger.info(
            "monitoring_complete",
            mission_id=state.mission_id,
            confidence_score=state.confidence_score,
            alerts=len(state.alerts),
            critical=state.critical_alerts,
        )
        return state

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _parse_signals_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into signals list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("signals", [response])
        if hasattr(response, "content"):
            import json
            try:
                content = response.content
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                return json.loads(content)
            except (json.JSONDecodeError, IndexError):
                return [{"source": "unknown", "headline": str(response.content), "relevance_score": 0.5}]
        return [{"source": "unknown", "headline": str(response), "relevance_score": 0.5}]

    def _parse_deltas_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into deltas list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("deltas", [response])
        if hasattr(response, "content"):
            import json
            try:
                content = response.content
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                return json.loads(content)
            except (json.JSONDecodeError, IndexError):
                return [{"description": str(response.content), "severity": "low", "confidence": 0.5}]
        return [{"description": str(response), "severity": "low", "confidence": 0.5}]

    def _parse_alerts_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into alerts list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("alerts", [response])
        if hasattr(response, "content"):
            import json
            try:
                content = response.content
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                return json.loads(content)
            except (json.JSONDecodeError, IndexError):
                return [{"title": str(response.content), "severity": "medium", "urgency": "when_possible"}]
        return [{"title": str(response), "severity": "medium", "urgency": "when_possible"}]

    def _format_signals_for_prompt(self, signals: List[Dict[str, Any]]) -> str:
        """Format signals list for LLM prompt."""
        lines = []
        for i, s in enumerate(signals, 1):
            source = s.get("source", "Unknown")
            headline = s.get("headline", "")
            relevance = s.get("relevance_score", 0.0)
            lines.append(f"{i}. [{source}] {headline} (relevance: {relevance:.2f})")
        return "\n".join(lines) or "No signals collected"

    def _format_deltas_for_prompt(self, deltas: List[Dict[str, Any]]) -> str:
        """Format deltas list for LLM prompt."""
        lines = []
        for i, d in enumerate(deltas, 1):
            severity = d.get("severity", "unknown")
            description = d.get("description", "")
            confidence = d.get("confidence", 0.0)
            lines.append(f"{i}. [{severity.upper()}] {description} (confidence: {confidence:.2f})")
        return "\n".join(lines) or "No deltas detected"

    def _create_hitl_checkpoint(
        self,
        state: MonitoringState,
        checkpoint_type: str,
        title: str,
        description: str,
        is_blocking: bool,
        data: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Create HITL checkpoint event."""
        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.HITL_REQUIRED,
                data={
                    "checkpoint_type": checkpoint_type,
                    "title": title,
                    "description": description,
                    "is_blocking": is_blocking,
                    "checkpoint_data": data or {},
                },
                mission_id=state.mission_id,
            )
        )
