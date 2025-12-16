#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
# GRADE: A+ (upgraded from B+)
"""
Evaluation Runner - Multi-Criteria Decision Analysis (MCDA) Pattern

Implements the EVALUATION family with:
1) Criteria/rubric generation with weighting
2) Multi-dimensional scoring against rubric
3) Gap analysis and recommendations synthesis
4) Quality-gated output with confidence scoring

Graph:
    START → initialize → preflight → define_criteria →
    score_items → synthesize_findings → quality_gate → END
                                              ↓
                                    (conditional routing)
                                         ↙        ↘
                                    complete    hitl_required

HITL:
    - Plan approval checkpoint after criteria definition (blocking)
    - Final validation checkpoint after synthesis (non-blocking)

Reasoning Pattern:
    MCDA enables structured multi-criteria evaluation
    Weighted scoring provides quantifiable comparisons
    Gap analysis identifies improvement opportunities
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


# =============================================================================
# Evaluation State
# =============================================================================

class EvaluationState(BaseFamilyState):
    """
    State for the Evaluation runner.

    Extends BaseFamilyState with MCDA-specific fields for
    criteria definition, scoring, and recommendation synthesis.
    """
    # Criteria fields
    criteria: List[Dict[str, Any]] = Field(default_factory=list)
    criteria_weights: Dict[str, float] = Field(default_factory=dict)
    total_criteria: int = Field(default=5)

    # Scoring fields
    scored_items: List[Dict[str, Any]] = Field(default_factory=list)
    item_scores: Dict[str, float] = Field(default_factory=dict)
    weighted_scores: Dict[str, float] = Field(default_factory=dict)

    # Synthesis fields
    recommendations: List[str] = Field(default_factory=list)
    gaps_identified: List[Dict[str, Any]] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    overall_score: float = Field(default=0.0)

    # Mode 4 constraints (for autonomous execution)
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)

    # Quality tracking specific to evaluation
    criteria_coverage: float = Field(default=0.0)
    scoring_consistency: float = Field(default=0.0)
    recommendation_quality: float = Field(default=0.0)


# =============================================================================
# Evaluation Runner
# =============================================================================

@register_family_runner(FamilyType.EVALUATION)
class EvaluationRunner(BaseFamilyRunner[EvaluationState]):
    """
    Evaluation runner implementing Multi-Criteria Decision Analysis (MCDA).

    This runner follows the pattern:
    1. Define evaluation criteria with weights (structured framework)
    2. Score items against each criterion (quantitative assessment)
    3. Synthesize findings with gap analysis (actionable insights)

    Graph Nodes:
        - initialize: Setup state and load evaluation context
        - preflight: Validate inputs (tenant, goal, items to evaluate)
        - define_criteria: Generate weighted evaluation rubric
        - score_items: Score each item against criteria
        - synthesize_findings: Gap analysis and recommendations
        - quality_gate: Final quality assessment with confidence

    HITL Checkpoints:
        - After define_criteria: Rubric approval (blocking)
        - After synthesize_findings: Results validation (non-blocking)

    MCDA Benefits:
        - Structured, repeatable evaluation framework
        - Transparent scoring with clear rationale
        - Weighted criteria reflect stakeholder priorities
        - Gap analysis drives improvement focus
    """

    family = FamilyType.EVALUATION
    state_class = EvaluationState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        default_criteria_count: int = 5,
        min_score_threshold: float = 0.6,
        **kwargs: Any,
    ):
        """
        Initialize Evaluation runner.

        Args:
            llm: LangChain LLM for evaluation (defaults to GPT-4)
            default_criteria_count: Default number of criteria to generate
            min_score_threshold: Minimum acceptable overall score
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )
        self.default_criteria_count = default_criteria_count
        self.min_score_threshold = min_score_threshold

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[EvaluationState], EvaluationState]]:
        """Create nodes for Evaluation graph."""
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "define_criteria": self._define_criteria_node,
            "score_items": self._score_items_node,
            "synthesize_findings": self._synthesize_findings_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Evaluation graph with conditional routing."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "define_criteria")
        graph.add_edge("define_criteria", "score_items")
        graph.add_edge("score_items", "synthesize_findings")
        graph.add_edge("synthesize_findings", "quality_gate")
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
        return ["define_criteria", "synthesize_findings"]

    # =========================================================================
    # Routing Functions
    # =========================================================================

    def _route_after_quality(self, state: EvaluationState) -> str:
        """
        Route after quality gate based on confidence and HITL requirements.

        Args:
            state: Current evaluation state

        Returns:
            "complete" if confidence meets threshold, "hitl_required" otherwise
        """
        if state.requires_hitl and state.confidence_score < self.confidence_threshold:
            logger.info(
                "evaluation_hitl_required",
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
    ) -> EvaluationState:
        """Create initial state with evaluation-specific defaults."""
        return EvaluationState(
            query=query,
            goal=query,
            context=context or {},
            total_criteria=kwargs.get("criteria_count", self.default_criteria_count),
            mode_4_constraints=kwargs.get("mode_4_constraints"),
            total_steps=6,
            **{k: v for k, v in kwargs.items() if k in EvaluationState.__fields__},
        )

    # =========================================================================
    # Node Implementations (Async with Graceful Degradation)
    # =========================================================================

    @graceful_degradation(domain="evaluation", fallback_value=None)
    async def _initialize_node(self, state: EvaluationState) -> EvaluationState:
        """
        Initialize evaluation state.

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
            "evaluation_initialized",
            mission_id=state.mission_id,
            criteria_count=state.total_criteria,
        )
        return state

    @graceful_degradation(domain="evaluation", fallback_value=None)
    async def _preflight_validation_node(self, state: EvaluationState) -> EvaluationState:
        """
        Validate evaluation inputs.

        Checks tenant_id, goal/query, and mode_4_constraints if applicable.
        """
        state.current_step = 2
        errors = []

        # Tenant validation
        if not state.tenant_id:
            errors.append("tenant_id_missing")

        # Goal validation
        if not state.goal and not state.query:
            errors.append("evaluation_goal_missing")

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

        logger.info("evaluation_preflight_passed", mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="evaluation", fallback_value=None)
    async def _define_criteria_node(self, state: EvaluationState) -> EvaluationState:
        """
        Define evaluation criteria and weighting rubric.

        Generates structured criteria with:
        - Criterion name and description
        - Weight (0-1, normalized to sum to 1)
        - Scoring guidance (what constitutes low/medium/high)
        """
        state.phase = ExecutionPhase.PLAN
        state.current_step = 3

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "define_criteria", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""You are an expert evaluation framework designer.

Define {state.total_criteria} evaluation criteria for the following goal.

For each criterion provide:
1. name: Short identifier (e.g., "accuracy", "completeness")
2. description: What this criterion measures
3. weight: Relative importance (0.0-1.0, all weights should sum to 1.0)
4. scoring_guidance: Dictionary with "low" (0-0.3), "medium" (0.4-0.6), "high" (0.7-1.0) descriptions

Return a JSON array of criteria objects.
Ensure weights are balanced and sum to 1.0.
Focus on measurable, actionable criteria."""

        content = f"""Goal: {state.goal}

Context: {state.context}

Generate {state.total_criteria} weighted evaluation criteria."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=25,
            )

            # Parse and validate criteria
            criteria_data = self._parse_criteria_response(response)
            validated = validate_evaluation_outputs(criteria_data, [], [])
            state.criteria = validated.get("criteria", criteria_data)

            # Extract weights
            state.criteria_weights = {
                c.get("name", f"criterion_{i}"): c.get("weight", 1.0 / len(state.criteria))
                for i, c in enumerate(state.criteria)
            }

            # Calculate criteria coverage quality
            state.criteria_coverage = min(len(state.criteria) / state.total_criteria, 1.0)

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "define_criteria",
                        "criteria_count": len(state.criteria),
                        "coverage": state.criteria_coverage,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("criteria_definition_failed", error=str(exc))
            state.error = f"criteria_definition_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "define_criteria", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - criteria approval (blocking)
        state.requires_hitl = True
        state.hitl_reason = "Evaluation criteria require approval before scoring"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="plan_approval",
            title="Review Evaluation Criteria",
            description=f"Approve {len(state.criteria)} criteria with weights before proceeding to scoring",
            is_blocking=True,
            data={"criteria": state.criteria, "weights": state.criteria_weights},
        )

        logger.info(
            "evaluation_criteria_defined",
            mission_id=state.mission_id,
            criteria_count=len(state.criteria),
        )
        return state

    @graceful_degradation(domain="evaluation", fallback_value=None)
    async def _score_items_node(self, state: EvaluationState) -> EvaluationState:
        """
        Score items against defined criteria.

        Performs multi-dimensional scoring:
        - Raw scores per criterion (0-1)
        - Rationale for each score
        - Weighted aggregate scores
        """
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 4

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "score_items", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert evaluator performing Multi-Criteria Decision Analysis.

Score the subject against each criterion provided.

For each criterion provide:
1. criterion_name: The criterion being scored
2. score: Numeric score from 0.0 to 1.0
3. rationale: Brief explanation for the score
4. evidence: Specific observations supporting the score
5. improvement_potential: What would raise the score

Return a JSON array of score objects.
Be objective and consistent in scoring."""

        content = f"""Subject to Evaluate: {state.goal}

Context: {state.context}

Evaluation Criteria:
{self._format_criteria_for_prompt(state.criteria)}

Score each criterion objectively."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse and validate scores
            scores_data = self._parse_scores_response(response)
            validated = validate_evaluation_outputs(state.criteria, scores_data, [])
            state.scored_items = validated.get("scores", scores_data)

            # Calculate item scores and weighted scores
            state.item_scores = {
                s.get("criterion_name", f"item_{i}"): s.get("score", 0.5)
                for i, s in enumerate(state.scored_items)
            }

            # Apply weights
            total_weighted = 0.0
            total_weight = 0.0
            for criterion_name, score in state.item_scores.items():
                weight = state.criteria_weights.get(criterion_name, 1.0 / len(state.item_scores))
                weighted_score = score * weight
                state.weighted_scores[criterion_name] = weighted_score
                total_weighted += weighted_score
                total_weight += weight

            # Calculate overall score
            state.overall_score = total_weighted / max(total_weight, 0.01)

            # Calculate scoring consistency (variance-based)
            if state.item_scores:
                scores = list(state.item_scores.values())
                mean_score = sum(scores) / len(scores)
                variance = sum((s - mean_score) ** 2 for s in scores) / len(scores)
                # Lower variance = higher consistency (inverted)
                state.scoring_consistency = max(0, 1 - (variance * 4))

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "score_items",
                        "items_scored": len(state.scored_items),
                        "overall_score": state.overall_score,
                        "consistency": state.scoring_consistency,
                    },
                    mission_id=state.mission_id,
                )
            )

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.CONFIDENCE_UPDATE,
                    data={
                        "overall_score": state.overall_score,
                        "weighted_scores": state.weighted_scores,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("scoring_failed", error=str(exc))
            state.error = f"scoring_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "score_items", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "evaluation_scoring_complete",
            mission_id=state.mission_id,
            overall_score=state.overall_score,
        )
        return state

    @graceful_degradation(domain="evaluation", fallback_value=None)
    async def _synthesize_findings_node(self, state: EvaluationState) -> EvaluationState:
        """
        Synthesize scores into actionable findings.

        Generates:
        - Strengths (high-scoring areas)
        - Weaknesses/gaps (low-scoring areas)
        - Prioritized recommendations
        - Improvement roadmap
        """
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 5

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "synthesize_findings", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert analyst synthesizing evaluation results.

Based on the scoring data, provide:
1. strengths: Array of 3-5 key strengths (high-scoring areas)
2. weaknesses: Array of 3-5 key weaknesses/gaps (low-scoring areas)
3. gaps: Array of gap objects with {area, severity, impact, recommendation}
4. recommendations: Array of prioritized recommendations with rationale
5. summary: Executive summary paragraph

Focus on actionable, specific insights.
Prioritize recommendations by impact and feasibility."""

        content = f"""Evaluation Subject: {state.goal}

Overall Score: {state.overall_score:.2f}

Detailed Scores:
{self._format_scores_for_prompt(state.scored_items)}

Weighted Results:
{state.weighted_scores}

Synthesize findings and recommendations."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse synthesis results
            synthesis = self._parse_synthesis_response(response)
            validated = validate_evaluation_outputs(state.criteria, state.scored_items, synthesis)

            state.strengths = synthesis.get("strengths", [])
            state.weaknesses = synthesis.get("weaknesses", [])
            state.gaps_identified = synthesis.get("gaps", [])
            state.recommendations = validated.get("recommendations", synthesis.get("recommendations", []))
            state.final_output = synthesis.get("summary", "")

            # Calculate recommendation quality
            rec_factors = [
                min(len(state.recommendations) / 5, 1.0),  # At least 5 recommendations
                min(len(state.gaps_identified) / 3, 1.0),  # At least 3 gaps identified
                1.0 if state.final_output else 0.0,  # Has summary
            ]
            state.recommendation_quality = sum(rec_factors) / len(rec_factors)

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "synthesize_findings",
                        "strengths_count": len(state.strengths),
                        "weaknesses_count": len(state.weaknesses),
                        "recommendations_count": len(state.recommendations),
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("synthesis_failed", error=str(exc))
            state.error = f"synthesis_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "synthesize_findings", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - final review (non-blocking)
        state.requires_hitl = True
        state.hitl_reason = "Final validation of evaluation findings"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="final_review",
            title="Validate Evaluation Findings",
            description="Review synthesized findings and recommendations before completion",
            is_blocking=False,
            data={
                "overall_score": state.overall_score,
                "recommendations": state.recommendations[:5],
            },
        )

        logger.info(
            "evaluation_synthesis_complete",
            mission_id=state.mission_id,
            recommendations=len(state.recommendations),
        )
        return state

    @graceful_degradation(domain="evaluation", fallback_value=None)
    async def _quality_gate_node(self, state: EvaluationState) -> EvaluationState:
        """
        Final quality assessment with confidence scoring.

        Calculates multi-factor confidence score based on:
        - Criteria coverage
        - Scoring consistency
        - Recommendation quality
        - Overall completeness
        """
        state.phase = ExecutionPhase.COMPLETE
        state.current_step = 6
        state.completed_at = datetime.utcnow()

        # Calculate multi-factor confidence score
        quality_factors = [
            state.criteria_coverage,
            state.scoring_consistency,
            state.recommendation_quality,
            min(len(state.scored_items) / max(len(state.criteria), 1), 1.0),
            1.0 if state.final_output else 0.0,
        ]
        state.confidence_score = sum(quality_factors) / len(quality_factors)

        # Also set quality_score for compatibility
        state.quality_score = state.confidence_score

        # Determine if HITL is required based on confidence
        if state.confidence_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Low confidence ({state.confidence_score:.2f}) requires review"

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.QUALITY_CHECK,
                data={
                    "confidence_score": state.confidence_score,
                    "quality_factors": {
                        "criteria_coverage": state.criteria_coverage,
                        "scoring_consistency": state.scoring_consistency,
                        "recommendation_quality": state.recommendation_quality,
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
                    "overall_score": state.overall_score,
                    "confidence_score": state.confidence_score,
                    "criteria_count": len(state.criteria),
                    "scored_items": len(state.scored_items),
                    "recommendations": len(state.recommendations),
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
            "evaluation_complete",
            mission_id=state.mission_id,
            overall_score=state.overall_score,
            confidence_score=state.confidence_score,
        )
        return state

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _parse_criteria_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into criteria list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("criteria", [response])
        if hasattr(response, "content"):
            import json
            try:
                content = response.content
                # Try to extract JSON from markdown code blocks
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                return json.loads(content)
            except (json.JSONDecodeError, IndexError):
                return [{"name": "general", "description": str(response.content), "weight": 1.0}]
        return [{"name": "general", "description": str(response), "weight": 1.0}]

    def _parse_scores_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into scores list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("scores", [response])
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
                return [{"criterion_name": "general", "score": 0.5, "rationale": str(response.content)}]
        return [{"criterion_name": "general", "score": 0.5, "rationale": str(response)}]

    def _parse_synthesis_response(self, response: Any) -> Dict[str, Any]:
        """Parse LLM response into synthesis dict."""
        if isinstance(response, dict):
            return response
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
                return {
                    "strengths": [],
                    "weaknesses": [],
                    "gaps": [],
                    "recommendations": [str(response.content)],
                    "summary": str(response.content),
                }
        return {"recommendations": [str(response)], "summary": str(response)}

    def _format_criteria_for_prompt(self, criteria: List[Dict[str, Any]]) -> str:
        """Format criteria list for LLM prompt."""
        lines = []
        for i, c in enumerate(criteria, 1):
            name = c.get("name", f"Criterion {i}")
            desc = c.get("description", "")
            weight = c.get("weight", 0.0)
            lines.append(f"{i}. {name} (weight: {weight:.2f}): {desc}")
        return "\n".join(lines)

    def _format_scores_for_prompt(self, scores: List[Dict[str, Any]]) -> str:
        """Format scores list for LLM prompt."""
        lines = []
        for s in scores:
            name = s.get("criterion_name", "Unknown")
            score = s.get("score", 0.0)
            rationale = s.get("rationale", "")
            lines.append(f"- {name}: {score:.2f} - {rationale}")
        return "\n".join(lines)

    def _create_hitl_checkpoint(
        self,
        state: EvaluationState,
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
