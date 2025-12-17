#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Strategy Runner - Scenario Planning → SWOT → Roadmap Pattern

Implements the STRATEGY family with:
1) Scenario planning with decision framing
2) SWOT-style analysis of each scenario
3) Roadmap synthesis with risks, milestones, and owners

Graph:
    START → initialize → preflight → scenario_planning → swot_assessment →
    roadmap_synthesis → quality_gate → END

HITL:
    - Plan approval checkpoint after scenario planning (blocking)
    - Optional final review checkpoint before completion (non-blocking)

Reasoning Pattern:
    Scenario planning frames decision space
    SWOT evaluates each scenario's viability
    Roadmap synthesizes actionable plan with risk mitigations
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
from .output_validation import validate_strategy_outputs

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
# Strategy State
# =============================================================================

class StrategyState(BaseFamilyState):
    """
    State for the Strategy runner.

    Extends BaseFamilyState with strategy-specific fields for
    scenario planning, SWOT analysis, and roadmap synthesis.
    """
    # Scenario planning fields
    scenarios: List[Dict[str, Any]] = Field(default_factory=list)
    selected_scenarios: List[str] = Field(default_factory=list)
    scenario_count: int = Field(default=3)

    # SWOT analysis fields
    swot: List[Dict[str, Any]] = Field(default_factory=list)

    # Roadmap fields
    roadmap: List[Dict[str, Any]] = Field(default_factory=list)
    risks: List[Dict[str, Any]] = Field(default_factory=list)
    mitigations: List[str] = Field(default_factory=list)

    # Decision fields
    decision: Optional[str] = Field(default=None)
    plan_summary: Optional[str] = Field(default=None)

    # Mode 4 constraints (referenced in preflight validation)
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)

    # Quality metrics specific to strategy
    scenario_quality_scores: Dict[str, float] = Field(default_factory=dict)
    roadmap_completeness: float = Field(default=0.0)


# =============================================================================
# Strategy Runner
# =============================================================================

@register_family_runner(FamilyType.STRATEGY)
class StrategyRunner(BaseFamilyRunner[StrategyState]):
    """
    Strategy runner implementing scenario planning, SWOT, and roadmap synthesis.

    This runner follows the pattern:
    1. Generate multiple scenarios (divergent thinking)
    2. Analyze each scenario via SWOT (evaluation)
    3. Synthesize into actionable roadmap (convergent synthesis)

    Graph Nodes:
        - initialize: Setup state and load context
        - preflight: Validate inputs (tenant, goal, constraints)
        - scenario_planning: Generate plausible scenarios
        - swot_assessment: SWOT analysis per scenario
        - roadmap_synthesis: Create 90-day roadmap with milestones
        - quality_gate: Final quality assessment

    HITL Checkpoints:
        - After scenario_planning: Plan approval (blocking)
        - After roadmap_synthesis: Final review (non-blocking)
    """

    family = FamilyType.STRATEGY
    state_class = StrategyState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        scenario_count: int = 3,
        **kwargs: Any,
    ):
        """
        Initialize Strategy runner.

        Args:
            llm: LangChain LLM for reasoning (defaults to GPT-4)
            scenario_count: Number of scenarios to generate (min 2)
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=8000,  # Increased from 3000 to support longer outputs
        )
        self.scenario_count = max(2, scenario_count)

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[StrategyState], StrategyState]]:
        """Create nodes for Strategy graph."""
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "scenario_planning": self._scenario_planning_node,
            "swot_assessment": self._swot_assessment_node,
            "roadmap_synthesis": self._roadmap_synthesis_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Strategy graph."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "scenario_planning")
        graph.add_edge("scenario_planning", "swot_assessment")
        graph.add_edge("swot_assessment", "roadmap_synthesis")
        graph.add_edge("roadmap_synthesis", "quality_gate")
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
        """Nodes that can trigger HITL checkpoints."""
        return ["scenario_planning", "roadmap_synthesis"]

    # =========================================================================
    # Node Implementations
    # =========================================================================

    @graceful_degradation(domain="strategy", fallback_value=None)
    async def _initialize_node(self, state: StrategyState) -> StrategyState:
        """Initialize strategy state."""
        logger.info(f"Initializing strategy: {state.mission_id}")

        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = datetime.utcnow()
        state.scenario_count = self.scenario_count
        state.total_steps = self.scenario_count + 3  # scenarios + SWOT + roadmap + quality
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")

        return state

    @graceful_degradation(domain="strategy", fallback_value=None)
    async def _preflight_validation_node(self, state: StrategyState) -> StrategyState:
        """Validate inputs before execution."""
        logger.info(f"Preflight validation: {state.mission_id}")

        errors = []

        # Required fields
        if not state.tenant_id:
            errors.append("tenant_id_missing")
        if not state.goal and not state.query:
            errors.append("goal_missing")

        # Mode 4 constraints validation
        if state.mode_4_constraints and isinstance(state.mode_4_constraints, dict):
            wall_time = state.mode_4_constraints.get("max_wall_time_minutes")
            if wall_time and wall_time > 60:
                errors.append("wall_time_exceeds_limit_60min")

            max_cost = state.mode_4_constraints.get("max_cost")
            if max_cost and max_cost < 0.10:
                errors.append("budget_too_low_for_strategy")

        if errors:
            state.error = ";".join(errors)
            self._emit_sse_event(
                SSEEventType.MISSION_FAILED,
                {"mission_id": state.mission_id, "errors": errors},
                mission_id=state.mission_id,
            )
            raise ValidationError(message=state.error)

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "preflight", "status": "passed"},
            mission_id=state.mission_id,
        )
        return state

    @graceful_degradation(domain="strategy", fallback_value=None)
    async def _scenario_planning_node(self, state: StrategyState) -> StrategyState:
        """Generate plausible scenarios for decision framing."""
        logger.info(f"Generating {state.scenario_count} scenarios: {state.mission_id}")

        state.phase = ExecutionPhase.PLAN
        state.current_step += 1

        prompt = f"""You are a strategy advisor specializing in scenario planning.

Given the goal and context, generate {state.scenario_count} plausible scenarios.

For each scenario, provide:
1. name: Short descriptive name
2. description: 2-3 sentence summary
3. key_assumptions: List of 3-5 critical assumptions
4. leading_indicators: Signals that would indicate this scenario is unfolding
5. probability: Rough likelihood (low/medium/high)
6. time_horizon: When this scenario might materialize

Make scenarios MECE (mutually exclusive, collectively exhaustive) to cover the decision space."""

        content = f"Goal: {state.goal or state.query}\nContext: {state.context}"

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content=prompt),
                    HumanMessage(content=content),
                ],
                timeout=30,
            )

            state.scenarios = self._parse_list_output(response.content)
            state.total_steps = len(state.scenarios) + 3

            # Calculate initial quality score based on scenario completeness
            for i, scenario in enumerate(state.scenarios):
                completeness = sum([
                    1 if scenario.get("name") else 0,
                    1 if scenario.get("description") else 0,
                    1 if scenario.get("key_assumptions") else 0,
                    1 if scenario.get("leading_indicators") else 0,
                ]) / 4.0
                state.scenario_quality_scores[f"scenario_{i}"] = completeness

            logger.info(
                "strategy_scenarios_generated",
                mission_id=state.mission_id,
                count=len(state.scenarios),
            )

        except Exception as e:
            logger.error(f"Scenario planning failed: {e}")
            state.error = f"Scenario planning failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {
                "phase": "scenario_planning",
                "scenario_count": len(state.scenarios),
            },
            mission_id=state.mission_id,
        )

        # HITL checkpoint: plan approval
        state.requires_hitl = True
        state.hitl_reason = "Plan approval required for scenarios"

        return state

    @graceful_degradation(domain="strategy", fallback_value=None)
    async def _swot_assessment_node(self, state: StrategyState) -> StrategyState:
        """Perform SWOT analysis for each scenario."""
        logger.info(f"SWOT assessment for {len(state.scenarios)} scenarios: {state.mission_id}")

        state.phase = ExecutionPhase.EXECUTE
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="swot_assessment")

        swot_prompt = """Perform a comprehensive SWOT analysis for this scenario.

Return a structured assessment with:
1. strengths: Internal advantages (3-5 items)
2. weaknesses: Internal disadvantages (3-5 items)
3. opportunities: External favorable factors (3-5 items)
4. threats: External risks (3-5 items)
5. risk_rating: Overall risk level (low/medium/high/critical)
6. strategic_fit: How well this aligns with stated goal (0-1 score)"""

        for i, scenario in enumerate(state.scenarios):
            state.current_step += 1

            try:
                swot_response = await invoke_llm_with_timeout(
                    self.llm,
                    [
                        SystemMessage(content=swot_prompt),
                        HumanMessage(content=f"Scenario: {scenario}"),
                    ],
                    timeout=20,
                )

                swot_result = self._normalize_swot(scenario, swot_response.content)
                state.swot.append(swot_result)

                # Emit progress
                self._emit_sse_event(
                    SSEEventType.PROGRESS_UPDATE,
                    {
                        "phase": "swot_assessment",
                        "scenario": i + 1,
                        "total": len(state.scenarios),
                    },
                    mission_id=state.mission_id,
                )

            except Exception as e:
                logger.warning(f"SWOT failed for scenario {i}: {e}")
                state.swot.append({
                    "scenario": scenario.get("name", f"scenario_{i}"),
                    "swot": {"error": str(e)},
                })

        logger.info(
            "strategy_swot_completed",
            mission_id=state.mission_id,
            count=len(state.swot),
        )
        return state

    @graceful_degradation(domain="strategy", fallback_value=None)
    async def _roadmap_synthesis_node(self, state: StrategyState) -> StrategyState:
        """Synthesize scenarios and SWOT into actionable roadmap."""
        logger.info(f"Roadmap synthesis: {state.mission_id}")

        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step += 1
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="roadmap_synthesis")

        roadmap_prompt = """Synthesize the scenarios and SWOT analyses into a 90-day strategic roadmap.

Include:
1. recommended_scenario: Which scenario to plan for (with rationale)
2. decision: Clear recommended decision/direction
3. milestones: Bi-weekly milestones (6 total) with:
   - milestone_name
   - target_date (relative: Week 2, Week 4, etc.)
   - owner_role (not specific person)
   - deliverables
   - success_criteria
4. risks: Top 5 risks with probability and impact
5. mitigations: Specific mitigation action for each risk
6. dependencies: Key dependencies and assumptions
7. plan_summary: Executive summary (3-5 sentences)"""

        try:
            roadmap_response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content=roadmap_prompt),
                    HumanMessage(content=f"Scenarios: {state.scenarios}\nSWOT: {state.swot}"),
                ],
                timeout=30,
            )

            state.roadmap = self._normalize_roadmap(roadmap_response.content)
            state.plan_summary = roadmap_response.content if isinstance(roadmap_response.content, str) else None

            # Validate outputs
            try:
                validated = validate_strategy_outputs(state.scenarios, state.swot, state.roadmap)
                state.scenarios = validated["scenarios"]
                state.swot = validated["swot"]
                state.roadmap = validated["roadmap"]
            except ValidationError as exc:
                state.error = f"validation_failed: {exc}"
                self._emit_sse_event(
                    SSEEventType.MISSION_FAILED,
                    {"mission_id": state.mission_id, "error": state.error},
                    mission_id=state.mission_id,
                )
                raise

            # Calculate roadmap completeness
            if state.roadmap:
                complete_items = sum(
                    1 for item in state.roadmap
                    if item.get("milestone") and item.get("owner")
                )
                state.roadmap_completeness = complete_items / len(state.roadmap)

            logger.info(
                "strategy_roadmap_synthesized",
                mission_id=state.mission_id,
                roadmap_items=len(state.roadmap),
                completeness=state.roadmap_completeness,
            )

        except Exception as e:
            logger.error(f"Roadmap synthesis failed: {e}")
            state.error = f"Roadmap synthesis failed: {str(e)}"
            raise

        # Optional final review HITL (non-blocking)
        state.requires_hitl = True
        state.hitl_reason = "Final review of roadmap"

        return state

    @graceful_degradation(domain="strategy", fallback_value=None)
    async def _quality_gate_node(self, state: StrategyState) -> StrategyState:
        """Final quality assessment."""
        logger.info(f"Quality gate check: {state.mission_id}")

        state.phase = ExecutionPhase.COMPLETE
        state.completed_at = datetime.utcnow()

        # Calculate confidence score based on multiple factors
        scenario_avg = (
            sum(state.scenario_quality_scores.values()) / len(state.scenario_quality_scores)
            if state.scenario_quality_scores else 0.0
        )

        quality_factors = [
            scenario_avg,  # Scenario completeness
            state.roadmap_completeness,  # Roadmap completeness
            min(len(state.scenarios) / state.scenario_count, 1.0),  # Scenario count
            min(len(state.swot) / max(len(state.scenarios), 1), 1.0),  # SWOT coverage
            1.0 if state.plan_summary else 0.0,  # Has summary
        ]

        state.confidence_score = sum(quality_factors) / len(quality_factors)
        state.quality_score = state.confidence_score  # Alias for consistency

        # Determine if HITL is required based on confidence
        if state.confidence_score < self.confidence_threshold:
            state.requires_hitl = True
            state.hitl_reason = f"Quality score {state.confidence_score:.2f} below threshold {self.confidence_threshold}"

        self._emit_phase_event(SSEEventType.PHASE_COMPLETE, state, phase="quality_gate")
        self._emit_sse_event(
            SSEEventType.MISSION_COMPLETED,
            {
                "mission_id": state.mission_id,
                "summary": state.plan_summary[:200] if state.plan_summary else None,
                "roadmap_size": len(state.roadmap),
                "confidence_score": state.confidence_score,
                "quality_score": state.quality_score,
            },
            mission_id=state.mission_id,
        )

        return state

    # =========================================================================
    # Routing Functions
    # =========================================================================

    def _route_after_quality(self, state: StrategyState) -> str:
        """Route after quality gate."""
        if state.requires_hitl and state.confidence_score < self.confidence_threshold:
            return "hitl_required"
        return "complete"

    # =========================================================================
    # Helper Methods
    # =========================================================================

    @staticmethod
    def _parse_list_output(output: Any) -> List[Dict[str, Any]]:
        """
        Best-effort parsing: if the model returns a list-like structure, use it;
        otherwise wrap in a single-item list with text.
        """
        if isinstance(output, list):
            return output
        if isinstance(output, str):
            # Try to extract structured data from string
            return [{"text": output, "name": "Scenario Analysis"}]
        return [{"text": str(output)}]

    @staticmethod
    def _normalize_swot(scenario: Dict[str, Any], swot_raw: Any) -> Dict[str, Any]:
        """Normalize SWOT output into a dict shape."""
        swot_block = swot_raw if isinstance(swot_raw, dict) else {"analysis": swot_raw}
        return {
            "scenario": scenario.get("name") or scenario.get("id") or "scenario",
            "swot": swot_block,
        }

    @staticmethod
    def _normalize_roadmap(roadmap_raw: Any) -> List[Dict[str, Any]]:
        """
        Normalize roadmap output to list of milestones with owner/risk/mitigation if present.
        """
        if isinstance(roadmap_raw, list):
            return roadmap_raw
        if isinstance(roadmap_raw, dict):
            return [roadmap_raw]
        return [{"milestone": "summary", "details": roadmap_raw}]

    # =========================================================================
    # Custom State Creation
    # =========================================================================

    def _create_initial_state(
        self,
        query: str,
        session_id: str = "",
        tenant_id: str = "",
        context: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> StrategyState:
        """Create initial Strategy state."""
        return StrategyState(
            query=query,
            goal=query,
            session_id=session_id,
            tenant_id=tenant_id,
            context=context or {},
            started_at=datetime.utcnow(),
            scenario_count=kwargs.get("scenario_count", self.scenario_count),
            mode_4_constraints=kwargs.get("mode_4_constraints"),
            metadata=kwargs,
        )
