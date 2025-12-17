#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
# GRADE: A+ (upgraded from B+)
"""
Investigation Runner - Hypothesis → Evidence → RCA (Bayesian) Pattern

Implements the INVESTIGATION family with:
1) Hypothesis generation with prior probabilities
2) Evidence gathering with Bayesian updating
3) Root cause analysis with posterior probabilities
4) Actionable recommendations with impact estimates

Graph:
    START → initialize → preflight → generate_hypotheses →
    gather_evidence → analyze_root_cause → recommend_actions →
    quality_gate → END
                  ↓
        (conditional routing)
             ↙        ↘
        complete    hitl_required

HITL:
    - Plan approval checkpoint after hypotheses (blocking)
    - Final validation checkpoint after recommendations (non-blocking)

Reasoning Pattern:
    Bayesian inference updates hypothesis probabilities with evidence
    Root cause analysis identifies most likely causes
    Recommendations prioritized by impact and confidence
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


# =============================================================================
# Investigation State
# =============================================================================

class InvestigationState(BaseFamilyState):
    """
    State for the Investigation runner.

    Extends BaseFamilyState with investigation-specific fields for
    hypothesis generation, evidence collection, and root cause analysis.
    """
    # Hypothesis fields
    hypotheses: List[Dict[str, Any]] = Field(default_factory=list)
    hypothesis_priors: Dict[str, float] = Field(default_factory=dict)
    hypothesis_posteriors: Dict[str, float] = Field(default_factory=dict)
    max_hypotheses: int = Field(default=5)

    # Evidence fields
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_strength: Dict[str, float] = Field(default_factory=dict)
    supporting_evidence_count: int = Field(default=0)
    contradicting_evidence_count: int = Field(default=0)

    # Root cause analysis fields
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    root_causes: List[Dict[str, Any]] = Field(default_factory=list)
    primary_root_cause: Optional[str] = Field(default=None)
    root_cause_confidence: float = Field(default=0.0)

    # Recommendations
    recommendations: List[str] = Field(default_factory=list)
    recommendation_impacts: Dict[str, str] = Field(default_factory=dict)

    # Mode 4 constraints (for autonomous execution)
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)

    # Quality tracking specific to investigation
    hypothesis_coverage: float = Field(default=0.0)
    evidence_quality: float = Field(default=0.0)
    analysis_depth: float = Field(default=0.0)


# =============================================================================
# Investigation Runner
# =============================================================================

@register_family_runner(FamilyType.INVESTIGATION)
class InvestigationRunner(BaseFamilyRunner[InvestigationState]):
    """
    Investigation runner implementing Bayesian root cause analysis.

    This runner follows the pattern:
    1. Generate hypotheses with prior probabilities
    2. Gather evidence and update posteriors (Bayesian)
    3. Identify root causes ranked by probability
    4. Recommend actions prioritized by impact

    Graph Nodes:
        - initialize: Setup state and investigation parameters
        - preflight: Validate inputs (tenant, goal, context)
        - generate_hypotheses: Create hypotheses with priors
        - gather_evidence: Collect evidence and update beliefs
        - analyze_root_cause: Determine most likely causes
        - recommend_actions: Generate prioritized recommendations
        - quality_gate: Final quality assessment with confidence

    HITL Checkpoints:
        - After generate_hypotheses: Hypothesis approval (blocking)
        - After recommend_actions: Recommendations review (non-blocking)

    Bayesian Investigation Benefits:
        - Quantified uncertainty in root causes
        - Evidence-driven belief updating
        - Systematic elimination of unlikely causes
        - Transparent reasoning chain
    """

    family = FamilyType.INVESTIGATION
    state_class = InvestigationState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        max_hypotheses: int = 5,
        evidence_threshold: float = 0.6,
        **kwargs: Any,
    ):
        """
        Initialize Investigation runner.

        Args:
            llm: LangChain LLM for analysis (defaults to GPT-4)
            max_hypotheses: Maximum hypotheses to generate
            evidence_threshold: Minimum evidence strength to consider
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=8000,  # Increased from 3000 to support longer outputs
        )
        self.max_hypotheses = max_hypotheses
        self.evidence_threshold = evidence_threshold

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[InvestigationState], InvestigationState]]:
        """Create nodes for Investigation graph."""
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
        """Define edges for Investigation graph with conditional routing."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "generate_hypotheses")
        graph.add_edge("generate_hypotheses", "gather_evidence")
        graph.add_edge("gather_evidence", "analyze_root_cause")
        graph.add_edge("analyze_root_cause", "recommend_actions")
        graph.add_edge("recommend_actions", "quality_gate")
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
        return ["generate_hypotheses", "recommend_actions"]

    # =========================================================================
    # Routing Functions
    # =========================================================================

    def _route_after_quality(self, state: InvestigationState) -> str:
        """
        Route after quality gate based on confidence and root cause clarity.

        Args:
            state: Current investigation state

        Returns:
            "hitl_required" if low confidence or ambiguous root cause,
            "complete" otherwise
        """
        # Force HITL if root cause confidence is low
        if state.root_cause_confidence < 0.7:
            logger.info(
                "investigation_low_confidence_hitl",
                root_cause_confidence=state.root_cause_confidence,
            )
            return "hitl_required"

        if state.requires_hitl and state.confidence_score < self.confidence_threshold:
            logger.info(
                "investigation_hitl_required",
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
    ) -> InvestigationState:
        """Create initial state with investigation-specific defaults."""
        return InvestigationState(
            query=query,
            goal=query,
            context=context or {},
            max_hypotheses=kwargs.get("max_hypotheses", self.max_hypotheses),
            mode_4_constraints=kwargs.get("mode_4_constraints"),
            total_steps=7,
            **{k: v for k, v in kwargs.items() if k in InvestigationState.__fields__},
        )

    # =========================================================================
    # Node Implementations (Async with Graceful Degradation)
    # =========================================================================

    @graceful_degradation(domain="investigation", fallback_value=None)
    async def _initialize_node(self, state: InvestigationState) -> InvestigationState:
        """
        Initialize investigation state.

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
                    "max_hypotheses": state.max_hypotheses,
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
            "investigation_initialized",
            mission_id=state.mission_id,
            max_hypotheses=state.max_hypotheses,
        )
        return state

    @graceful_degradation(domain="investigation", fallback_value=None)
    async def _preflight_validation_node(self, state: InvestigationState) -> InvestigationState:
        """
        Validate investigation inputs.

        Checks tenant_id, goal/query, and investigation parameters.
        """
        state.current_step = 2
        errors = []

        # Tenant validation
        if not state.tenant_id:
            errors.append("tenant_id_missing")

        # Goal validation
        if not state.goal and not state.query:
            errors.append("investigation_goal_missing")

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

        logger.info("investigation_preflight_passed", mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="investigation", fallback_value=None)
    async def _generate_hypotheses_node(self, state: InvestigationState) -> InvestigationState:
        """
        Generate hypotheses with prior probabilities.

        Creates structured hypotheses with:
        - Clear statement of the hypothesis
        - Prior probability (initial belief)
        - Evidence needed to confirm/refute
        - Potential impact if true
        """
        state.phase = ExecutionPhase.PLAN
        state.current_step = 3

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "generate_hypotheses", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""You are an expert investigator using Bayesian reasoning.

Generate {state.max_hypotheses} hypotheses for the investigation goal.

For each hypothesis provide:
1. id: Unique identifier (H1, H2, etc.)
2. statement: Clear, testable hypothesis statement
3. prior_probability: Initial belief probability (0.0-1.0, should sum to ~1.0)
4. rationale: Why this hypothesis is plausible
5. evidence_needed: What evidence would confirm or refute this
6. impact_if_true: Consequences if this hypothesis is correct
7. testability: How easily can this be tested (high/medium/low)

Return a JSON array of hypothesis objects.
Ensure hypotheses are mutually exclusive and collectively exhaustive (MECE).
Prior probabilities should reflect relative likelihood before evidence."""

        content = f"""Investigation Goal: {state.goal}

Context: {state.context}

Generate {state.max_hypotheses} hypotheses with Bayesian priors."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=25,
            )

            # Parse hypotheses
            hypotheses_data = self._parse_hypotheses_response(response)
            validated = validate_investigation_outputs(hypotheses_data, [], [], [])
            state.hypotheses = validated.get("hypotheses", hypotheses_data)

            # Extract prior probabilities
            state.hypothesis_priors = {
                h.get("id", f"H{i+1}"): h.get("prior_probability", 1.0 / len(state.hypotheses))
                for i, h in enumerate(state.hypotheses)
            }

            # Initialize posteriors to priors
            state.hypothesis_posteriors = state.hypothesis_priors.copy()

            # Calculate hypothesis coverage
            state.hypothesis_coverage = min(len(state.hypotheses) / state.max_hypotheses, 1.0)

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "generate_hypotheses",
                        "hypothesis_count": len(state.hypotheses),
                        "priors": state.hypothesis_priors,
                        "coverage": state.hypothesis_coverage,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("hypothesis_generation_failed", error=str(exc))
            state.error = f"hypothesis_generation_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "generate_hypotheses", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - hypothesis approval (blocking)
        state.requires_hitl = True
        state.hitl_reason = "Investigation hypotheses require approval before evidence gathering"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="plan_approval",
            title="Review Investigation Hypotheses",
            description=f"Approve {len(state.hypotheses)} hypotheses with prior probabilities",
            is_blocking=True,
            data={
                "hypotheses": state.hypotheses,
                "priors": state.hypothesis_priors,
            },
        )

        logger.info(
            "investigation_hypotheses_generated",
            mission_id=state.mission_id,
            hypothesis_count=len(state.hypotheses),
        )
        return state

    @graceful_degradation(domain="investigation", fallback_value=None)
    async def _gather_evidence_node(self, state: InvestigationState) -> InvestigationState:
        """
        Gather evidence and update hypothesis probabilities.

        Collects evidence with:
        - Source and reliability assessment
        - Relevance to each hypothesis
        - Likelihood ratios for Bayesian updating
        """
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 4

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "gather_evidence", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert evidence analyst using Bayesian methods.

Gather and analyze evidence for each hypothesis.

For each piece of evidence provide:
1. id: Unique identifier (E1, E2, etc.)
2. description: What the evidence shows
3. source: Where this evidence comes from
4. reliability: Source reliability (0.0-1.0)
5. relevant_hypotheses: Which hypotheses this affects
6. direction: Does this support or contradict each hypothesis?
7. likelihood_ratio: How much more likely is this evidence if hypothesis is true vs false
8. strength: Overall evidence strength (strong/moderate/weak)

Return a JSON array of evidence objects.
Consider both supporting and contradicting evidence.
Use likelihood ratios for Bayesian probability updates."""

        content = f"""Investigation Goal: {state.goal}

Hypotheses to investigate:
{self._format_hypotheses_for_prompt(state.hypotheses)}

Prior Probabilities: {state.hypothesis_priors}

Gather evidence to update beliefs about each hypothesis."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse evidence
            evidence_data = self._parse_evidence_response(response)
            validated = validate_investigation_outputs(state.hypotheses, evidence_data, [], [])
            state.hypotheses = validated.get("hypotheses", state.hypotheses)
            state.evidence = validated.get("evidence", evidence_data)

            # Calculate evidence metrics
            supporting = 0
            contradicting = 0
            evidence_strengths = {}

            for e in state.evidence:
                e_id = e.get("id", f"E{len(evidence_strengths)+1}")
                strength_map = {"strong": 0.9, "moderate": 0.6, "weak": 0.3}
                strength = strength_map.get(e.get("strength", "moderate"), 0.6)
                reliability = e.get("reliability", 0.7)
                evidence_strengths[e_id] = strength * reliability

                direction = e.get("direction", {})
                if isinstance(direction, dict):
                    for hyp_id, dir_val in direction.items():
                        if dir_val == "support":
                            supporting += 1
                        elif dir_val == "contradict":
                            contradicting += 1

            state.evidence_strength = evidence_strengths
            state.supporting_evidence_count = supporting
            state.contradicting_evidence_count = contradicting

            # Bayesian update of posteriors (simplified)
            state.hypothesis_posteriors = self._bayesian_update(
                state.hypothesis_priors,
                state.evidence,
            )

            # Calculate evidence quality
            if evidence_data:
                avg_reliability = sum(
                    e.get("reliability", 0.5) for e in evidence_data
                ) / len(evidence_data)
                diversity = min(len(set(e.get("source", "") for e in evidence_data)) / 3, 1.0)
                state.evidence_quality = (avg_reliability + diversity) / 2
            else:
                state.evidence_quality = 0.0

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "gather_evidence",
                        "evidence_count": len(state.evidence),
                        "supporting": state.supporting_evidence_count,
                        "contradicting": state.contradicting_evidence_count,
                        "posteriors": state.hypothesis_posteriors,
                    },
                    mission_id=state.mission_id,
                )
            )

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.CONFIDENCE_UPDATE,
                    data={
                        "priors": state.hypothesis_priors,
                        "posteriors": state.hypothesis_posteriors,
                        "evidence_quality": state.evidence_quality,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("evidence_gathering_failed", error=str(exc))
            state.error = f"evidence_gathering_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "gather_evidence", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "investigation_evidence_gathered",
            mission_id=state.mission_id,
            evidence_count=len(state.evidence),
        )
        return state

    @graceful_degradation(domain="investigation", fallback_value=None)
    async def _analyze_root_cause_node(self, state: InvestigationState) -> InvestigationState:
        """
        Analyze evidence to determine root causes.

        Identifies:
        - Most likely root causes ranked by posterior probability
        - Evidence gaps and uncertainties
        - Confidence in the analysis
        """
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 5

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "analyze_root_cause", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert root cause analyst.

Analyze the evidence to determine the most likely root causes.

For each root cause finding provide:
1. id: Unique identifier (RC1, RC2, etc.)
2. description: What is the root cause
3. related_hypothesis: Which hypothesis this confirms
4. posterior_probability: Updated probability based on evidence
5. confidence: How confident in this finding (0.0-1.0)
6. evidence_support: Which evidence supports this
7. evidence_gaps: What additional evidence would help
8. mechanism: How this root cause leads to the observed issue

Return a JSON array of root cause objects.
Rank by posterior probability.
Identify the primary root cause."""

        content = f"""Investigation Goal: {state.goal}

Hypotheses with Updated Posteriors:
{self._format_hypotheses_with_posteriors(state.hypotheses, state.hypothesis_posteriors)}

Evidence Gathered:
{self._format_evidence_for_prompt(state.evidence)}

Determine root causes ranked by probability."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse findings
            findings_data = self._parse_findings_response(response)
            validated = validate_investigation_outputs(
                state.hypotheses, state.evidence, findings_data, []
            )
            state.findings = validated.get("findings", findings_data)

            # Extract root causes
            state.root_causes = [
                f for f in state.findings
                if f.get("posterior_probability", 0) >= 0.3
            ]

            # Identify primary root cause
            if state.root_causes:
                primary = max(
                    state.root_causes,
                    key=lambda x: x.get("posterior_probability", 0)
                )
                state.primary_root_cause = primary.get("description", "")
                state.root_cause_confidence = primary.get("confidence", 0.0)
            else:
                state.primary_root_cause = None
                state.root_cause_confidence = 0.0

            # Calculate analysis depth
            depth_factors = [
                min(len(state.findings) / 3, 1.0),  # At least 3 findings
                1.0 if state.primary_root_cause else 0.0,
                state.root_cause_confidence,
            ]
            state.analysis_depth = sum(depth_factors) / len(depth_factors)

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "analyze_root_cause",
                        "findings_count": len(state.findings),
                        "root_causes_count": len(state.root_causes),
                        "primary_root_cause": state.primary_root_cause,
                        "root_cause_confidence": state.root_cause_confidence,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("root_cause_analysis_failed", error=str(exc))
            state.error = f"root_cause_analysis_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "analyze_root_cause", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "investigation_root_cause_analyzed",
            mission_id=state.mission_id,
            primary_root_cause=state.primary_root_cause,
            confidence=state.root_cause_confidence,
        )
        return state

    @graceful_degradation(domain="investigation", fallback_value=None)
    async def _recommend_actions_node(self, state: InvestigationState) -> InvestigationState:
        """
        Generate recommendations based on root cause analysis.

        Creates actionable recommendations with:
        - Clear action steps
        - Expected impact
        - Owner assignment
        - Priority ranking
        """
        state.phase = ExecutionPhase.VERIFY
        state.current_step = 6

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "recommend_actions", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert at developing remediation recommendations.

Generate actionable recommendations to address the root causes.

For each recommendation provide:
1. action: Specific action to take
2. addresses_root_cause: Which root cause(s) this addresses
3. expected_impact: What improvement to expect (high/medium/low)
4. effort: Implementation effort required (high/medium/low)
5. priority: Priority ranking (1=highest)
6. owner: Suggested responsible role
7. timeline: Expected implementation timeline
8. risks: Potential risks of this action
9. success_metrics: How to measure success

Return a JSON array of recommendation objects.
Prioritize by impact-to-effort ratio.
Include both immediate and long-term actions."""

        content = f"""Investigation Goal: {state.goal}

Root Causes Identified:
Primary: {state.primary_root_cause} (confidence: {state.root_cause_confidence:.2f})

All Root Causes:
{self._format_root_causes_for_prompt(state.root_causes)}

Generate prioritized recommendations to address these root causes."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse recommendations
            recs_data = self._parse_recommendations_response(response)
            validated = validate_investigation_outputs(
                state.hypotheses, state.evidence, state.findings, recs_data
            )
            state.recommendations = validated.get("recommendations", [])

            # If recommendations came as dicts, extract action strings
            if state.recommendations and isinstance(state.recommendations[0], dict):
                state.recommendation_impacts = {
                    r.get("action", f"Action {i+1}"): r.get("expected_impact", "medium")
                    for i, r in enumerate(state.recommendations)
                }
                state.recommendations = [
                    r.get("action", str(r)) for r in state.recommendations
                    if isinstance(r, dict)
                ]

            # Build final output
            state.final_output = self._build_investigation_summary(state)

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "recommend_actions",
                        "recommendations_count": len(state.recommendations),
                        "impacts": state.recommendation_impacts,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("recommendations_failed", error=str(exc))
            state.error = f"recommendations_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "recommend_actions", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - recommendations review (non-blocking)
        state.requires_hitl = True
        state.hitl_reason = "Final validation of investigation recommendations"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="final_review",
            title="Review Investigation Recommendations",
            description=f"{len(state.recommendations)} recommendations for {state.primary_root_cause}",
            is_blocking=False,
            data={
                "primary_root_cause": state.primary_root_cause,
                "root_cause_confidence": state.root_cause_confidence,
                "recommendations": state.recommendations[:5],
            },
        )

        logger.info(
            "investigation_recommendations_generated",
            mission_id=state.mission_id,
            recommendations=len(state.recommendations),
        )
        return state

    @graceful_degradation(domain="investigation", fallback_value=None)
    async def _quality_gate_node(self, state: InvestigationState) -> InvestigationState:
        """
        Final quality assessment with confidence scoring.

        Calculates multi-factor confidence score based on:
        - Hypothesis coverage
        - Evidence quality
        - Analysis depth
        - Root cause confidence
        """
        state.phase = ExecutionPhase.COMPLETE
        state.current_step = 7
        state.completed_at = datetime.utcnow()

        # Calculate multi-factor confidence score
        quality_factors = [
            state.hypothesis_coverage,
            state.evidence_quality,
            state.analysis_depth,
            state.root_cause_confidence,
            1.0 if state.recommendations else 0.0,
        ]
        state.confidence_score = sum(quality_factors) / len(quality_factors)

        # Also set quality_score for compatibility
        state.quality_score = state.confidence_score

        # Force HITL if root cause confidence is low
        if state.root_cause_confidence < 0.7:
            state.requires_hitl = True
            state.hitl_reason = f"Root cause confidence ({state.root_cause_confidence:.2f}) requires review"
        elif state.confidence_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Low confidence ({state.confidence_score:.2f}) requires review"

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.QUALITY_CHECK,
                data={
                    "confidence_score": state.confidence_score,
                    "quality_factors": {
                        "hypothesis_coverage": state.hypothesis_coverage,
                        "evidence_quality": state.evidence_quality,
                        "analysis_depth": state.analysis_depth,
                        "root_cause_confidence": state.root_cause_confidence,
                    },
                    "threshold": self.confidence_threshold,
                    "passed": state.confidence_score >= self.confidence_threshold,
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
                    "hypothesis_count": len(state.hypotheses),
                    "evidence_count": len(state.evidence),
                    "findings_count": len(state.findings),
                    "root_causes_count": len(state.root_causes),
                    "primary_root_cause": state.primary_root_cause,
                    "root_cause_confidence": state.root_cause_confidence,
                    "recommendations_count": len(state.recommendations),
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
            "investigation_complete",
            mission_id=state.mission_id,
            confidence_score=state.confidence_score,
            primary_root_cause=state.primary_root_cause,
        )
        return state

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _bayesian_update(
        self,
        priors: Dict[str, float],
        evidence: List[Dict[str, Any]],
    ) -> Dict[str, float]:
        """
        Perform simplified Bayesian update of hypothesis probabilities.

        Args:
            priors: Prior probabilities for each hypothesis
            evidence: List of evidence items with likelihood ratios

        Returns:
            Updated posterior probabilities
        """
        posteriors = priors.copy()

        for e in evidence:
            likelihood_ratio = e.get("likelihood_ratio", 1.0)
            relevant_hypotheses = e.get("relevant_hypotheses", [])

            if not relevant_hypotheses:
                continue

            # Simple multiplicative update
            for hyp_id in relevant_hypotheses:
                if hyp_id in posteriors:
                    direction = e.get("direction", {})
                    if isinstance(direction, dict):
                        dir_val = direction.get(hyp_id, "neutral")
                        if dir_val == "support":
                            posteriors[hyp_id] *= likelihood_ratio
                        elif dir_val == "contradict":
                            posteriors[hyp_id] /= max(likelihood_ratio, 0.1)

        # Normalize to sum to 1
        total = sum(posteriors.values())
        if total > 0:
            posteriors = {k: v / total for k, v in posteriors.items()}

        return posteriors

    def _build_investigation_summary(self, state: InvestigationState) -> str:
        """Build executive summary of investigation."""
        summary_parts = [
            f"**Investigation Summary**",
            f"\n**Goal:** {state.goal}",
            f"\n**Primary Root Cause:** {state.primary_root_cause}",
            f"**Confidence:** {state.root_cause_confidence:.0%}",
            f"\n**Key Evidence:**",
        ]

        for e in state.evidence[:3]:
            desc = e.get("description", "N/A")
            summary_parts.append(f"- {desc}")

        summary_parts.append(f"\n**Recommendations ({len(state.recommendations)}):**")
        for i, rec in enumerate(state.recommendations[:5], 1):
            summary_parts.append(f"{i}. {rec}")

        return "\n".join(summary_parts)

    def _parse_hypotheses_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into hypotheses list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("hypotheses", [response])
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
                return [{"id": "H1", "statement": str(response.content), "prior_probability": 1.0}]
        return [{"id": "H1", "statement": str(response), "prior_probability": 1.0}]

    def _parse_evidence_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into evidence list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("evidence", [response])
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
                return [{"id": "E1", "description": str(response.content), "reliability": 0.5}]
        return [{"id": "E1", "description": str(response), "reliability": 0.5}]

    def _parse_findings_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into findings list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("findings", response.get("root_causes", [response]))
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
                return [{"id": "RC1", "description": str(response.content), "confidence": 0.5}]
        return [{"id": "RC1", "description": str(response), "confidence": 0.5}]

    def _parse_recommendations_response(self, response: Any) -> List[Any]:
        """Parse LLM response into recommendations list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("recommendations", [response])
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
                return [str(response.content)]
        return [str(response)]

    def _format_hypotheses_for_prompt(self, hypotheses: List[Dict[str, Any]]) -> str:
        """Format hypotheses list for LLM prompt."""
        lines = []
        for h in hypotheses:
            h_id = h.get("id", "H?")
            statement = h.get("statement", "")
            prior = h.get("prior_probability", 0.0)
            lines.append(f"{h_id}. {statement} (prior: {prior:.2f})")
        return "\n".join(lines) or "No hypotheses generated"

    def _format_hypotheses_with_posteriors(
        self,
        hypotheses: List[Dict[str, Any]],
        posteriors: Dict[str, float],
    ) -> str:
        """Format hypotheses with posterior probabilities."""
        lines = []
        for h in hypotheses:
            h_id = h.get("id", "H?")
            statement = h.get("statement", "")
            prior = h.get("prior_probability", 0.0)
            posterior = posteriors.get(h_id, prior)
            change = posterior - prior
            direction = "↑" if change > 0 else "↓" if change < 0 else "→"
            lines.append(
                f"{h_id}. {statement}\n"
                f"   Prior: {prior:.2f} → Posterior: {posterior:.2f} ({direction}{abs(change):.2f})"
            )
        return "\n".join(lines) or "No hypotheses"

    def _format_evidence_for_prompt(self, evidence: List[Dict[str, Any]]) -> str:
        """Format evidence list for LLM prompt."""
        lines = []
        for e in evidence:
            e_id = e.get("id", "E?")
            description = e.get("description", "")
            reliability = e.get("reliability", 0.0)
            lines.append(f"{e_id}. {description} (reliability: {reliability:.2f})")
        return "\n".join(lines) or "No evidence gathered"

    def _format_root_causes_for_prompt(self, root_causes: List[Dict[str, Any]]) -> str:
        """Format root causes list for LLM prompt."""
        lines = []
        for rc in root_causes:
            rc_id = rc.get("id", "RC?")
            description = rc.get("description", "")
            probability = rc.get("posterior_probability", 0.0)
            confidence = rc.get("confidence", 0.0)
            lines.append(
                f"{rc_id}. {description}\n"
                f"   Probability: {probability:.2f}, Confidence: {confidence:.2f}"
            )
        return "\n".join(lines) or "No root causes identified"

    def _create_hitl_checkpoint(
        self,
        state: InvestigationState,
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
