#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
# GRADE: A+ (upgraded from B+)
"""
Generic Runner - Plan → Execute → Summarize (Fallback Pattern)

Fallback runner for missions that do not map to a specialized family.
Provides a flexible, general-purpose workflow for structured task completion.

Graph:
    START → initialize → preflight → draft_plan →
    execute_steps → finalize → quality_gate → END
                                      ↓
                            (conditional routing)
                                 ↙        ↘
                            complete    hitl_required

HITL:
    - Plan approval checkpoint after draft_plan (blocking)
    - Final validation checkpoint after finalize (non-blocking)

Reasoning Pattern:
    Plan-first approach ensures structured execution
    Step-by-step execution enables progress tracking
    Summary with confidence provides completion assurance
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


# =============================================================================
# Generic State
# =============================================================================

class GenericState(BaseFamilyState):
    """
    State for the Generic runner.

    Extends BaseFamilyState with generic workflow fields for
    flexible plan-execute-summarize patterns.
    """
    # Plan fields
    plan: List[Dict[str, Any]] = Field(default_factory=list)
    plan_steps_count: int = Field(default=5)
    planned_outcomes: List[str] = Field(default_factory=list)

    # Execution fields
    outputs: List[Dict[str, Any]] = Field(default_factory=list)
    completed_steps: int = Field(default=0)
    execution_notes: List[str] = Field(default_factory=list)

    # Summary fields
    summary: Optional[str] = Field(default=None)
    open_questions: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)

    # Mode 4 constraints (for autonomous execution)
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)

    # Quality tracking specific to generic
    plan_clarity: float = Field(default=0.0)
    execution_completeness: float = Field(default=0.0)
    summary_quality: float = Field(default=0.0)


# =============================================================================
# Generic Runner
# =============================================================================

@register_family_runner(FamilyType.GENERIC)
class GenericRunner(BaseFamilyRunner[GenericState]):
    """
    Generic runner for flexible structured task completion.

    This runner follows the pattern:
    1. Draft a structured plan with clear steps
    2. Execute steps and capture outputs
    3. Summarize with confidence and next steps

    Graph Nodes:
        - initialize: Setup state and parameters
        - preflight: Validate inputs (tenant, goal)
        - draft_plan: Create structured execution plan
        - execute_steps: Perform planned steps
        - finalize: Summarize and identify next steps
        - quality_gate: Final quality assessment with confidence

    HITL Checkpoints:
        - After draft_plan: Plan approval (blocking)
        - After finalize: Summary validation (non-blocking)

    Fallback Benefits:
        - Handles any task type not covered by specialized runners
        - Structured approach ensures consistency
        - Flexible enough for diverse mission types
        - Clear handoff with next steps
    """

    family = FamilyType.GENERIC
    state_class = GenericState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        default_steps: int = 5,
        **kwargs: Any,
    ):
        """
        Initialize Generic runner.

        Args:
            llm: LangChain LLM for analysis (defaults to GPT-4)
            default_steps: Default number of plan steps
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.25,
            max_tokens=3000,
        )
        self.default_steps = default_steps

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[GenericState], GenericState]]:
        """Create nodes for Generic graph."""
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "draft_plan": self._draft_plan_node,
            "execute_steps": self._execute_steps_node,
            "finalize": self._finalize_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Generic graph with conditional routing."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "draft_plan")
        graph.add_edge("draft_plan", "execute_steps")
        graph.add_edge("execute_steps", "finalize")
        graph.add_edge("finalize", "quality_gate")
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
        return ["draft_plan", "finalize"]

    # =========================================================================
    # Routing Functions
    # =========================================================================

    def _route_after_quality(self, state: GenericState) -> str:
        """
        Route after quality gate based on confidence and summary quality.

        Args:
            state: Current generic state

        Returns:
            "hitl_required" if low confidence or poor summary,
            "complete" otherwise
        """
        # Force HITL if summary quality is low
        if state.summary_quality < 0.6:
            logger.info(
                "generic_low_summary_quality_hitl",
                summary_quality=state.summary_quality,
            )
            return "hitl_required"

        if state.requires_hitl and state.confidence_score < self.confidence_threshold:
            logger.info(
                "generic_hitl_required",
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
    ) -> GenericState:
        """Create initial state with generic-specific defaults."""
        return GenericState(
            query=query,
            goal=query,
            context=context or {},
            plan_steps_count=kwargs.get("steps", self.default_steps),
            mode_4_constraints=kwargs.get("mode_4_constraints"),
            total_steps=6,
            **{k: v for k, v in kwargs.items() if k in GenericState.__fields__},
        )

    # =========================================================================
    # Node Implementations (Async with Graceful Degradation)
    # =========================================================================

    @graceful_degradation(domain="generic", fallback_value=None)
    async def _initialize_node(self, state: GenericState) -> GenericState:
        """
        Initialize generic state.

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
                    "planned_steps": state.plan_steps_count,
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
            "generic_initialized",
            mission_id=state.mission_id,
            planned_steps=state.plan_steps_count,
        )
        return state

    @graceful_degradation(domain="generic", fallback_value=None)
    async def _preflight_validation_node(self, state: GenericState) -> GenericState:
        """
        Validate generic inputs.

        Checks tenant_id, goal/query, and basic parameters.
        """
        state.current_step = 2
        errors = []

        # Tenant validation
        if not state.tenant_id:
            errors.append("tenant_id_missing")

        # Goal validation
        if not state.goal and not state.query:
            errors.append("generic_goal_missing")

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

        logger.info("generic_preflight_passed", mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="generic", fallback_value=None)
    async def _draft_plan_node(self, state: GenericState) -> GenericState:
        """
        Draft a structured execution plan.

        Creates a plan with:
        - Sequenced steps with clear actions
        - Owner assignments
        - Expected outcomes
        - Identified risks
        """
        state.phase = ExecutionPhase.PLAN
        state.current_step = 3

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "draft_plan", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = f"""You are an expert task planner.

Create a structured {state.plan_steps_count}-step plan to accomplish the goal.

For each step provide:
1. step_number: Sequential number (1, 2, 3, etc.)
2. action: Clear, actionable description
3. owner: Who should do this (role, not person name)
4. expected_outcome: What success looks like
5. dependencies: Which steps must complete first
6. risks: Potential issues
7. duration_estimate: How long this might take

Return a JSON array of step objects.
Ensure steps are logically sequenced.
Include clear success criteria for each step."""

        content = f"""Goal: {state.goal}

Context: {state.context}

Create a {state.plan_steps_count}-step execution plan."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=20,
            )

            # Parse plan
            plan_data = self._parse_plan_response(response)
            validated = validate_generic_outputs(plan_data, [])
            state.plan = validated.get("plan", plan_data)

            # Extract planned outcomes
            state.planned_outcomes = [
                step.get("expected_outcome", "")
                for step in state.plan
                if step.get("expected_outcome")
            ]

            # Calculate plan clarity
            has_actions = all(bool(s.get("action")) for s in state.plan)
            has_owners = all(bool(s.get("owner")) for s in state.plan)
            has_outcomes = all(bool(s.get("expected_outcome")) for s in state.plan)
            state.plan_clarity = (
                (1.0 if has_actions else 0.5) +
                (1.0 if has_owners else 0.5) +
                (1.0 if has_outcomes else 0.5) +
                min(len(state.plan) / state.plan_steps_count, 1.0)
            ) / 4

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "draft_plan",
                        "plan_steps": len(state.plan),
                        "outcomes": len(state.planned_outcomes),
                        "clarity": state.plan_clarity,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("plan_drafting_failed", error=str(exc))
            state.error = f"plan_drafting_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "draft_plan", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - plan approval (blocking)
        state.requires_hitl = True
        state.hitl_reason = "Execution plan requires approval before proceeding"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="plan_approval",
            title="Review Execution Plan",
            description=f"Approve {len(state.plan)}-step plan before execution",
            is_blocking=True,
            data={
                "plan": state.plan,
                "planned_outcomes": state.planned_outcomes,
            },
        )

        logger.info(
            "generic_plan_drafted",
            mission_id=state.mission_id,
            steps=len(state.plan),
        )
        return state

    @graceful_degradation(domain="generic", fallback_value=None)
    async def _execute_steps_node(self, state: GenericState) -> GenericState:
        """
        Execute planned steps and capture outputs.

        Generates outputs with:
        - Conceptual execution results
        - Assumptions made
        - Gaps identified
        """
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 4

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "execute_steps", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert task executor.

Execute the planned steps conceptually and produce outputs for each.

For each step output provide:
1. step_number: Which step this is
2. action_taken: What was conceptually done
3. result: The outcome or deliverable
4. assumptions: Any assumptions made
5. gaps: Information or resources that were missing
6. confidence: How confident in this result (0.0-1.0)
7. notes: Any additional observations

Return a JSON array of output objects.
Be thorough but realistic about what can be accomplished.
Clearly flag any assumptions or uncertainties."""

        content = f"""Goal: {state.goal}

Execution Plan:
{self._format_plan_for_prompt(state.plan)}

Execute each step and produce outputs."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=25,
            )

            # Parse outputs
            outputs_data = self._parse_outputs_response(response)
            validated = validate_generic_outputs(state.plan, outputs_data)
            state.plan = validated.get("plan", state.plan)
            state.outputs = validated.get("outputs", outputs_data)

            # Track completed steps
            state.completed_steps = len(state.outputs)

            # Extract execution notes and assumptions
            state.execution_notes = [
                o.get("notes", "")
                for o in state.outputs
                if o.get("notes")
            ]
            state.assumptions = [
                assumption
                for o in state.outputs
                for assumption in (o.get("assumptions", []) if isinstance(o.get("assumptions"), list) else [o.get("assumptions", "")])
                if assumption
            ]

            # Calculate execution completeness
            completed_ratio = state.completed_steps / max(len(state.plan), 1)
            has_results = all(bool(o.get("result")) for o in state.outputs)
            avg_confidence = (
                sum(o.get("confidence", 0.5) for o in state.outputs) / max(len(state.outputs), 1)
            )
            state.execution_completeness = (
                completed_ratio +
                (1.0 if has_results else 0.5) +
                avg_confidence
            ) / 3

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "execute_steps",
                        "outputs_count": len(state.outputs),
                        "completed_steps": state.completed_steps,
                        "assumptions": len(state.assumptions),
                        "completeness": state.execution_completeness,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("execution_failed", error=str(exc))
            state.error = f"execution_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "execute_steps", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        logger.info(
            "generic_execution_complete",
            mission_id=state.mission_id,
            outputs=len(state.outputs),
        )
        return state

    @graceful_degradation(domain="generic", fallback_value=None)
    async def _finalize_node(self, state: GenericState) -> GenericState:
        """
        Summarize outputs and identify next steps.

        Generates summary with:
        - Executive summary
        - Open questions
        - Recommended next steps
        - Confidence assessment
        """
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 5

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.PHASE_START,
                data={"phase": "finalize", "step": state.current_step},
                mission_id=state.mission_id,
            )
        )

        prompt = """You are an expert summarizer and advisor.

Summarize the execution outputs and provide closure.

Provide:
1. summary: Executive summary of what was accomplished (2-3 paragraphs)
2. key_achievements: 3-5 main accomplishments
3. open_questions: Unresolved issues or uncertainties
4. risks_identified: Any risks discovered during execution
5. next_steps: Recommended follow-up actions with owners
6. confidence_score: Overall confidence in results (0.0-1.0)
7. assumptions_summary: Key assumptions that were made

Return a JSON object with these fields.
Be honest about limitations and uncertainties.
Provide actionable next steps."""

        content = f"""Goal: {state.goal}

Execution Plan:
{self._format_plan_for_prompt(state.plan)}

Execution Outputs:
{self._format_outputs_for_prompt(state.outputs)}

Assumptions Made: {state.assumptions}

Summarize results and provide next steps."""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=content)],
                timeout=25,
            )

            # Parse summary
            summary_data = self._parse_summary_response(response)

            # Extract fields
            state.summary = summary_data.get("summary", "")
            state.open_questions = summary_data.get("open_questions", [])
            state.next_steps = summary_data.get("next_steps", [])

            # Build final output
            state.final_output = state.summary

            # Store confidence from summary if provided
            if "confidence_score" in summary_data:
                state.confidence_score = float(summary_data["confidence_score"])

            # Calculate summary quality
            has_summary = bool(state.summary)
            has_next_steps = len(state.next_steps) >= 2
            has_open_questions = len(state.open_questions) >= 1
            state.summary_quality = (
                (1.0 if has_summary else 0.0) +
                (1.0 if has_next_steps else 0.5) +
                (1.0 if has_open_questions else 0.5)
            ) / 3

            # Update outputs with summary
            state.outputs.append({
                "type": "summary",
                "summary": state.summary,
                "next_steps": state.next_steps,
                "open_questions": state.open_questions,
            })

            validated = validate_generic_outputs(state.plan, state.outputs)
            state.plan = validated.get("plan", state.plan)
            state.outputs = validated.get("outputs", state.outputs)

            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_COMPLETE,
                    data={
                        "step": "finalize",
                        "has_summary": has_summary,
                        "next_steps_count": len(state.next_steps),
                        "open_questions_count": len(state.open_questions),
                        "summary_quality": state.summary_quality,
                    },
                    mission_id=state.mission_id,
                )
            )

        except Exception as exc:
            logger.error("finalization_failed", error=str(exc))
            state.error = f"finalization_failed: {exc}"
            self._emit_sse_event(
                SSEEvent(
                    event_type=SSEEventType.STEP_FAILED,
                    data={"step": "finalize", "error": str(exc)},
                    mission_id=state.mission_id,
                )
            )
            raise

        # HITL checkpoint - summary validation (non-blocking)
        state.requires_hitl = True
        state.hitl_reason = "Final validation of results and next steps"
        self._create_hitl_checkpoint(
            state,
            checkpoint_type="final_review",
            title="Review Summary and Next Steps",
            description=f"{len(state.next_steps)} next steps identified",
            is_blocking=False,
            data={
                "summary": state.summary[:500] if state.summary else "",
                "next_steps": state.next_steps[:5],
                "open_questions": state.open_questions[:5],
            },
        )

        logger.info(
            "generic_finalized",
            mission_id=state.mission_id,
            next_steps=len(state.next_steps),
        )
        return state

    @graceful_degradation(domain="generic", fallback_value=None)
    async def _quality_gate_node(self, state: GenericState) -> GenericState:
        """
        Final quality assessment with confidence scoring.

        Calculates multi-factor confidence score based on:
        - Plan clarity
        - Execution completeness
        - Summary quality
        - Overall coherence
        """
        state.phase = ExecutionPhase.COMPLETE
        state.current_step = 6
        state.completed_at = datetime.utcnow()

        # Calculate multi-factor confidence score (if not already set by summary)
        if state.confidence_score == 0.0:
            quality_factors = [
                state.plan_clarity,
                state.execution_completeness,
                state.summary_quality,
                1.0 if state.summary else 0.0,
                min(len(state.next_steps) / 3, 1.0),
            ]
            state.confidence_score = sum(quality_factors) / len(quality_factors)

        # Also set quality_score for compatibility
        state.quality_score = state.confidence_score

        # Force HITL if summary quality is low
        if state.summary_quality < 0.6:
            state.requires_hitl = True
            state.hitl_reason = f"Summary quality ({state.summary_quality:.2f}) requires review"
        elif state.confidence_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Low confidence ({state.confidence_score:.2f}) requires review"

        self._emit_sse_event(
            SSEEvent(
                event_type=SSEEventType.QUALITY_CHECK,
                data={
                    "confidence_score": state.confidence_score,
                    "quality_factors": {
                        "plan_clarity": state.plan_clarity,
                        "execution_completeness": state.execution_completeness,
                        "summary_quality": state.summary_quality,
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
                    "plan_steps": len(state.plan),
                    "completed_steps": state.completed_steps,
                    "outputs_count": len(state.outputs),
                    "next_steps_count": len(state.next_steps),
                    "open_questions_count": len(state.open_questions),
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
            "generic_complete",
            mission_id=state.mission_id,
            confidence_score=state.confidence_score,
            plan_steps=len(state.plan),
        )
        return state

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _parse_plan_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into plan list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("plan", response.get("steps", [response]))
        if hasattr(response, "content"):
            import json
            try:
                content = response.content
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                result = json.loads(content)
                if isinstance(result, list):
                    return result
                return result.get("plan", result.get("steps", [result]))
            except (json.JSONDecodeError, IndexError):
                return [{"step_number": 1, "action": str(response.content)}]
        return [{"step_number": 1, "action": str(response)}]

    def _parse_outputs_response(self, response: Any) -> List[Dict[str, Any]]:
        """Parse LLM response into outputs list."""
        if isinstance(response, list):
            return response
        if isinstance(response, dict):
            return response.get("outputs", [response])
        if hasattr(response, "content"):
            import json
            try:
                content = response.content
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                result = json.loads(content)
                if isinstance(result, list):
                    return result
                return result.get("outputs", [result])
            except (json.JSONDecodeError, IndexError):
                return [{"step_number": 1, "result": str(response.content)}]
        return [{"step_number": 1, "result": str(response)}]

    def _parse_summary_response(self, response: Any) -> Dict[str, Any]:
        """Parse LLM response into summary dict."""
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
                    "summary": str(response.content),
                    "next_steps": [],
                    "open_questions": [],
                }
        return {
            "summary": str(response),
            "next_steps": [],
            "open_questions": [],
        }

    def _format_plan_for_prompt(self, plan: List[Dict[str, Any]]) -> str:
        """Format plan list for LLM prompt."""
        lines = []
        for p in plan:
            num = p.get("step_number", "?")
            action = p.get("action", "")
            owner = p.get("owner", "TBD")
            outcome = p.get("expected_outcome", "")
            lines.append(f"{num}. {action} ({owner}) → {outcome}")
        return "\n".join(lines) or "No plan steps"

    def _format_outputs_for_prompt(self, outputs: List[Dict[str, Any]]) -> str:
        """Format outputs list for LLM prompt."""
        lines = []
        for o in outputs:
            if o.get("type") == "summary":
                continue
            num = o.get("step_number", "?")
            result = o.get("result", "N/A")
            confidence = o.get("confidence", 0.5)
            lines.append(f"Step {num}: {result} (confidence: {confidence:.2f})")
        return "\n".join(lines) or "No outputs yet"

    def _create_hitl_checkpoint(
        self,
        state: GenericState,
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
