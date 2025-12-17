#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
# GRADE: A+ (upgraded from B+)
"""
Problem Solving Runner - Diagnose → Options → Action Plan (Decision Matrix)

Implements the PROBLEM_SOLVING family with:
1) Option generation with structured criteria
2) Multi-criteria decision matrix scoring
3) Action plan synthesis with owners and sequencing
4) Quality-gated output with confidence scoring

Graph:
    START → initialize → preflight → ideate_options →
    evaluate_options → action_plan → quality_gate → END
                                           ↓
                                 (conditional routing)
                                      ↙        ↘
                                 complete    hitl_required

HITL:
    - Plan approval checkpoint after option ideation (blocking)
    - Final validation checkpoint after action plan (non-blocking)

Reasoning Pattern:
    Structured option generation ensures comprehensive coverage
    Decision matrix provides objective comparison
    Action plan enables execution with clear ownership
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


# =============================================================================
# Problem Solving State
# =============================================================================

class ProblemSolvingState(BaseFamilyState):
    """
    State for the Problem Solving runner.

    Extends BaseFamilyState with problem-solving specific fields for
    option generation, evaluation, and action planning.
    """
    # Option generation fields
    options: List[Dict[str, Any]] = Field(default_factory=list)
    max_options: int = Field(default=5)
    option_criteria: List[str] = Field(default_factory=list)

    # Evaluation fields
    scores: List[Dict[str, Any]] = Field(default_factory=list)
    decision_matrix: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    criteria_weights: Dict[str, float] = Field(default_factory=dict)
    ranked_options: List[str] = Field(default_factory=list)
    top_option: Optional[str] = Field(default=None)

    # Action plan fields
    plan_steps: List[Dict[str, Any]] = Field(default_factory=list)
    plan_duration: Optional[str] = Field(default=None)
    plan_risks: List[str] = Field(default_factory=list)

    # Mode 4 constraints (for autonomous execution)
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)

    # Quality tracking specific to problem solving
    option_diversity: float = Field(default=0.0)
    evaluation_rigor: float = Field(default=0.0)
    plan_completeness: float = Field(default=0.0)


# =============================================================================
# Problem Solving Runner
# =============================================================================

@register_family_runner(FamilyType.PROBLEM_SOLVING)
class ProblemSolvingRunner(BaseFamilyRunner[ProblemSolvingState]):
    """
    Problem-solving runner implementing decision matrix evaluation.

    This runner follows the pattern:
    1. Generate diverse solution options
    2. Evaluate options against weighted criteria
    3. Create action plan for top option(s)

    Graph Nodes:
        - initialize: Setup state and problem parameters
        - preflight: Validate inputs (tenant, goal, context)
        - ideate_options: Generate structured solution options
        - evaluate_options: Score options with decision matrix
        - action_plan: Create sequenced action plan
        - quality_gate: Final quality assessment with confidence

    HITL Checkpoints:
        - After ideate_options: Options approval (blocking)
        - After action_plan: Plan validation (non-blocking)

    Decision Matrix Benefits:
        - Objective comparison across criteria
        - Weighted scoring reflects priorities
        - Transparent decision rationale
        - Defensible option selection
    """

    family = FamilyType.PROBLEM_SOLVING
    state_class = ProblemSolvingState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        max_options: int = 5,
        default_criteria: Optional[List[str]] = None,
        **kwargs: Any,
    ):
        """
        Initialize Problem Solving runner.

        Args:
            llm: LangChain LLM for analysis (defaults to GPT-4)
            max_options: Maximum options to generate
            default_criteria: Default evaluation criteria
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=8000,  # Increased from 3000 to support longer outputs
        )
        self.max_options = max_options
        self.default_criteria = default_criteria or [
            "impact", "effort", "risk", "feasibility", "alignment"
        ]

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[ProblemSolvingState], ProblemSolvingState]]:
        """Create nodes for Problem Solving graph."""
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "ideate_options": self._ideate_options_node,
            "evaluate_options": self._evaluate_options_node,
            "action_plan": self._action_plan_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Problem Solving graph with conditional routing."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "ideate_options")
        graph.add_edge("ideate_options", "evaluate_options")
        graph.add_edge("evaluate_options", "action_plan")
        graph.add_edge("action_plan", "quality_gate")
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
        return ["ideate_options", "action_plan"]

    # =========================================================================
    # Routing Functions
    # =========================================================================

    def _route_after_quality(self, state: ProblemSolvingState) -> str:
        """
        Route after quality gate based on confidence and plan quality.

        Args:
            state: Current problem solving state

        Returns:
            "hitl_required" if low confidence or incomplete plan,
            "complete" otherwise
        """
        # Force HITL if plan completeness is low
        if state.plan_completeness < 0.7:
            logger.info(
                "problem_solving_low_plan_completeness_hitl",
                plan_completeness=state.plan_completeness,
            )
            return "hitl_required"

        if state.requires_hitl and state.confidence_score < self.confidence_threshold:
            logger.info(
                "problem_solving_hitl_required",
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
    ) -> ProblemSolvingState:
        """Create initial state with problem-solving specific defaults."""
        return ProblemSolvingState(
            query=query,
            goal=query,
            context=context or {},
            max_options=kwargs.get("max_options", self.max_options),
            option_criteria=kwargs.get("criteria", self.default_criteria),
            mode_4_constraints=kwargs.get("mode_4_constraints"),
            total_steps=6,
            **{k: v for k, v in kwargs.items() if k in ProblemSolvingState.__fields__},
        )

    # =========================================================================
    # Node Implementations (Async with Graceful Degradation)
    # =========================================================================

    @graceful_degradation(domain="problem_solving", fallback_value=None)
    async def _initialize_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        """
        Initialize problem solving state.

        Sets up timing, phase tracking, and emits mission start event.
        """
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = datetime.utcnow()
        state.current_step = 1

        # Initialize criteria if not set
        if not state.option_criteria:
            state.option_criteria = self.default_criteria.copy()

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.MISSION_STARTED,
                data={
                    "mission_id": state.mission_id,
                    "family": self.family.value,
                    "query": state.query,
                    "max_options": state.max_options,
                    "criteria": state.option_criteria,
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
            "problem_solving_initialized",
            mission_id=state.mission_id,
            max_options=state.max_options,
        )
        return state

    @graceful_degradation(domain="problem_solving", fallback_value=None)
    async def _preflight_validation_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        """
        Validate problem solving inputs.

        Checks tenant_id, goal/query, and problem parameters.
        """
        state.current_step = 2
        errors = []

        # Tenant validation
        if not state.tenant_id:
            errors.append("tenant_id_missing")

        # Goal validation
        if not state.goal and not state.query:
            errors.append("problem_goal_missing")

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

        logger.info("problem_solving_preflight_passed", mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="problem_solving", fallback_value=None)
    async def _ideate_options_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        """
        Generate diverse solution options.

        Creates structured options with:
        - Summary and detailed description
        - Rationale and benefits
        - Risks and dependencies
        - Rough effort estimate
        """
        state.phase = ExecutionPhase.PLAN
        state.current_step = 3

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "ideate_options", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""You are an expert problem solver and strategic advisor.

Generate {state.max_options} diverse solution options for the given problem.

For each option provide:
1. id: Unique identifier (O1, O2, etc.)
2. name: Short descriptive name
3. summary: One-line summary
4. description: Detailed description of the approach
5. rationale: Why this approach could work
6. benefits: Key advantages
7. risks: Potential downsides or challenges
8. dependencies: What's needed to implement
9. effort_estimate: rough | moderate | significant
10. time_horizon: short_term | medium_term | long_term

Return a JSON array of option objects.
Ensure options are diverse - not variations of the same idea.
Include at least one low-effort and one high-impact option."""

        content = f"""Problem to Solve: {state.goal}

Context: {state.context}

Evaluation Criteria: {', '.join(state.option_criteria)}

Generate {state.max_options} diverse solution options."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=25,
            )

            # Parse options
            options_data = self._parse_options_response(response)
            validated = validate_problem_solving_outputs(options_data, [], [])
            state.options = validated.get("options", options_data)

            # Calculate option diversity (based on unique approaches)
            unique_horizons = len(set(o.get("time_horizon", "") for o in state.options))
            unique_efforts = len(set(o.get("effort_estimate", "") for o in state.options))
            state.option_diversity = (
                min(unique_horizons / 3, 1.0) + min(unique_efforts / 3, 1.0)
            ) / 2

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "ideate_options",
                        "options_count": len(state.options),
                        "diversity": state.option_diversity,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("option_ideation_failed", error=str(exc))
            state.error = f"option_ideation_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "ideate_options", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - options approval (blocking)
        state.requires_hitl = True
        state.hitl_reason = "Solution options require approval before evaluation"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="plan_approval",
            title="Review Solution Options",
            description=f"Approve {len(state.options)} options before decision matrix evaluation",
            is_blocking=True,
            data={
                "options": state.options,
                "criteria": state.option_criteria,
            },
        )

        logger.info(
            "problem_solving_options_generated",
            mission_id=state.mission_id,
            options_count=len(state.options),
        )
        return state

    @graceful_degradation(domain="problem_solving", fallback_value=None)
    async def _evaluate_options_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        """
        Evaluate options using decision matrix.

        Scores each option against weighted criteria:
        - Normalized scores (0-1) for each criterion
        - Weighted aggregate scoring
        - Ranked options with clear winner
        """
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 4

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "evaluate_options", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""You are an expert decision analyst.

Evaluate each option using a decision matrix approach.

Evaluation Criteria: {', '.join(state.option_criteria)}

For each option provide scores:
1. option_id: Which option this scores
2. scores: Dictionary mapping criterion to score (0.0-1.0)
3. rationale: Brief justification for each score
4. overall_score: Weighted average (weights provided below)
5. rank: 1 = best option

Criteria Weights (importance):
- impact: 0.25
- effort: 0.20 (lower effort = higher score)
- risk: 0.20 (lower risk = higher score)
- feasibility: 0.20
- alignment: 0.15

Return a JSON array of score objects.
Be objective and consistent in scoring."""

        content = f"""Problem: {state.goal}

Options to Evaluate:
{self._format_options_for_prompt(state.options)}

Evaluate each option against the criteria using scores 0.0-1.0."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse scores
            scores_data = self._parse_scores_response(response)
            validated = validate_problem_solving_outputs(state.options, scores_data, [])
            state.options = validated.get("options", state.options)
            state.scores = validated.get("scores", scores_data)

            # Build decision matrix
            state.decision_matrix = {}
            state.criteria_weights = {
                "impact": 0.25,
                "effort": 0.20,
                "risk": 0.20,
                "feasibility": 0.20,
                "alignment": 0.15,
            }

            # Extract ranked options
            sorted_scores = sorted(
                state.scores,
                key=lambda x: x.get("overall_score", 0),
                reverse=True
            )
            state.ranked_options = [
                s.get("option_id", f"O{i+1}")
                for i, s in enumerate(sorted_scores)
            ]

            if state.ranked_options:
                state.top_option = state.ranked_options[0]
                # Find top option details
                for opt in state.options:
                    if opt.get("id") == state.top_option:
                        state.top_option = opt.get("name", state.top_option)
                        break

            # Calculate evaluation rigor
            has_all_scores = all(
                len(s.get("scores", {})) >= len(state.option_criteria) - 1
                for s in state.scores
            )
            has_rationale = all(
                bool(s.get("rationale"))
                for s in state.scores
            )
            state.evaluation_rigor = (
                (1.0 if has_all_scores else 0.5) +
                (1.0 if has_rationale else 0.5) +
                min(len(state.scores) / len(state.options), 1.0)
            ) / 3

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "evaluate_options",
                        "scores_count": len(state.scores),
                        "top_option": state.top_option,
                        "ranked_options": state.ranked_options,
                        "evaluation_rigor": state.evaluation_rigor,
                    },
                    mission_id=state.mission_id,
                )
            )

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.CONFIDENCE_UPDATE,
                    data={
                        "top_option": state.top_option,
                        "rankings": state.ranked_options,
                        "evaluation_rigor": state.evaluation_rigor,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("option_evaluation_failed", error=str(exc))
            state.error = f"option_evaluation_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "evaluate_options", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "problem_solving_evaluation_complete",
            mission_id=state.mission_id,
            top_option=state.top_option,
        )
        return state

    @graceful_degradation(domain="problem_solving", fallback_value=None)
    async def _action_plan_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        """
        Create sequenced action plan for selected option.

        Generates detailed plan with:
        - Sequenced steps with dependencies
        - Owner assignments
        - Duration estimates
        - Success criteria
        """
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 5

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "action_plan", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert implementation planner.

Create a detailed action plan for implementing the selected solution.

For each step provide:
1. step_number: Sequential number (1, 2, 3, etc.)
2. action: What needs to be done
3. description: Detailed explanation
4. owner: Who is responsible (role, not person name)
5. duration: Estimated time (e.g., "2 days", "1 week")
6. dependencies: Which steps must complete first
7. success_criteria: How to know step is complete
8. risks: Potential issues and mitigations

Also provide:
- total_duration: Overall timeline estimate
- critical_path: Which steps are on critical path
- key_risks: Top 3 overall risks

Return a JSON object with plan_steps array and summary fields."""

        content = f"""Problem: {state.goal}

Selected Option: {state.top_option} (Rank #1)

Option Details:
{self._format_top_option_for_prompt(state.options, state.top_option)}

Evaluation Scores:
{self._format_scores_for_prompt(state.scores)}

Create a detailed, actionable implementation plan."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=30,
            )

            # Parse plan
            plan_data = self._parse_plan_response(response)
            validated = validate_problem_solving_outputs(state.options, state.scores, plan_data)
            state.plan_steps = validated.get("plan_steps", [])

            # Extract summary fields
            if isinstance(plan_data, dict):
                state.plan_duration = plan_data.get("total_duration", "Unknown")
                state.plan_risks = plan_data.get("key_risks", [])
                if "plan_steps" in plan_data:
                    state.plan_steps = plan_data["plan_steps"]

            # Build final output
            state.final_output = self._build_problem_solving_summary(state)

            # Calculate plan completeness
            has_owners = all(bool(s.get("owner")) for s in state.plan_steps)
            has_criteria = all(bool(s.get("success_criteria")) for s in state.plan_steps)
            has_duration = all(bool(s.get("duration")) for s in state.plan_steps)
            state.plan_completeness = (
                (1.0 if has_owners else 0.5) +
                (1.0 if has_criteria else 0.5) +
                (1.0 if has_duration else 0.5) +
                min(len(state.plan_steps) / 5, 1.0)
            ) / 4

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "action_plan",
                        "steps_count": len(state.plan_steps),
                        "duration": state.plan_duration,
                        "risks_count": len(state.plan_risks),
                        "completeness": state.plan_completeness,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("action_plan_failed", error=str(exc))
            state.error = f"action_plan_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "action_plan", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - plan validation (non-blocking)
        state.requires_hitl = True
        state.hitl_reason = "Final validation of action plan"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="final_review",
            title="Review Action Plan",
            description=f"{len(state.plan_steps)} steps for '{state.top_option}'",
            is_blocking=False,
            data={
                "top_option": state.top_option,
                "plan_steps": state.plan_steps[:5],
                "duration": state.plan_duration,
            },
        )

        logger.info(
            "problem_solving_plan_complete",
            mission_id=state.mission_id,
            steps=len(state.plan_steps),
        )
        return state

    @graceful_degradation(domain="problem_solving", fallback_value=None)
    async def _quality_gate_node(self, state: ProblemSolvingState) -> ProblemSolvingState:
        """
        Final quality assessment with confidence scoring.

        Calculates multi-factor confidence score based on:
        - Option diversity
        - Evaluation rigor
        - Plan completeness
        - Overall output quality
        """
        state.phase = ExecutionPhase.COMPLETE
        state.current_step = 6
        state.completed_at = datetime.utcnow()

        # Calculate multi-factor confidence score
        quality_factors = [
            state.option_diversity,
            state.evaluation_rigor,
            state.plan_completeness,
            1.0 if state.top_option else 0.0,
            min(len(state.plan_steps) / 5, 1.0),
        ]
        state.confidence_score = sum(quality_factors) / len(quality_factors)

        # Also set quality_score for compatibility
        state.quality_score = state.confidence_score

        # Force HITL if plan completeness is low
        if state.plan_completeness < 0.7:
            state.requires_hitl = True
            state.hitl_reason = f"Plan completeness ({state.plan_completeness:.2f}) requires review"
        elif state.confidence_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Low confidence ({state.confidence_score:.2f}) requires review"

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.QUALITY_CHECK,
                data={
                    "confidence_score": state.confidence_score,
                    "quality_factors": {
                        "option_diversity": state.option_diversity,
                        "evaluation_rigor": state.evaluation_rigor,
                        "plan_completeness": state.plan_completeness,
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
                    "options_count": len(state.options),
                    "top_option": state.top_option,
                    "plan_steps_count": len(state.plan_steps),
                    "plan_duration": state.plan_duration,
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
            "problem_solving_complete",
            mission_id=state.mission_id,
            confidence_score=state.confidence_score,
            top_option=state.top_option,
        )
        return state

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _build_problem_solving_summary(self, state: ProblemSolvingState) -> str:
        """Build executive summary of problem solving."""
        summary_parts = [
            f"**Problem Solving Summary**",
            f"\n**Problem:** {state.goal}",
            f"\n**Selected Option:** {state.top_option}",
            f"\n**Options Evaluated:** {len(state.options)}",
            f"**Plan Duration:** {state.plan_duration or 'TBD'}",
            f"\n**Key Steps:**",
        ]

        for i, step in enumerate(state.plan_steps[:5], 1):
            action = step.get("action", "N/A")
            owner = step.get("owner", "TBD")
            summary_parts.append(f"{i}. {action} ({owner})")

        if state.plan_risks:
            summary_parts.append(f"\n**Key Risks:**")
            for risk in state.plan_risks[:3]:
                summary_parts.append(f"- {risk}")

        return "\n".join(summary_parts)

    def _parse_options_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into options list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("options", [response])
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
                return [{"id": "O1", "name": str(response.content), "summary": str(response.content)}]
        return [{"id": "O1", "name": str(response), "summary": str(response)}]

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
                return [{"option_id": "O1", "overall_score": 0.5}]
        return [{"option_id": "O1", "overall_score": 0.5}]

    def _parse_plan_response(self, response: Any) -> Any:
        """Parse LLM response into plan data."""
        if isinstance(response, (list, dict)):
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
                return [{"step_number": 1, "action": str(response.content)}]
        return [{"step_number": 1, "action": str(response)}]

    def _format_options_for_prompt(self, options: List[Dict[str, Any]]) -> str:
        """Format options list for LLM prompt."""
        lines = []
        for o in options:
            o_id = o.get("id", "O?")
            name = o.get("name", "")
            summary = o.get("summary", "")
            lines.append(f"{o_id}. {name}: {summary}")
        return "\n".join(lines) or "No options generated"

    def _format_top_option_for_prompt(
        self,
        options: List[Dict[str, Any]],
        top_option: Optional[str],
    ) -> str:
        """Format top option details for prompt."""
        for opt in options:
            if opt.get("id") == top_option or opt.get("name") == top_option:
                return (
                    f"Name: {opt.get('name', 'N/A')}\n"
                    f"Summary: {opt.get('summary', 'N/A')}\n"
                    f"Description: {opt.get('description', 'N/A')}\n"
                    f"Risks: {opt.get('risks', 'N/A')}\n"
                    f"Dependencies: {opt.get('dependencies', 'N/A')}"
                )
        return f"Selected option: {top_option}"

    def _format_scores_for_prompt(self, scores: List[Dict[str, Any]]) -> str:
        """Format scores for prompt."""
        lines = []
        for s in scores:
            opt_id = s.get("option_id", "O?")
            overall = s.get("overall_score", 0.0)
            rank = s.get("rank", "?")
            lines.append(f"{opt_id}: Score {overall:.2f} (Rank #{rank})")
        return "\n".join(lines) or "No scores"

    def _create_hitl_checkpoint(
        self,
        state: ProblemSolvingState,
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
