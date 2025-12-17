#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Foresight Runner - Strategic Foresight, Scenario Planning, and Disruption Monitoring

Implements the FORESIGHT family with 15 runners across 3 sub-workflows:

1. Portfolio Foresight (5 runners):
   - SignalTrendAnalyzer → TechnologyImpactAssessor → PortfolioDisruptionScorer →
     CapabilityGapMapper → InvestmentRecommender

2. Scenario Development (5 runners):
   - DrivingForceIdentifier → ScenarioAxisDefiner → NarrativeStorylineConstructor →
     ImplicationModeler → IndicatorSetter

3. Disruption Early Warning (5 runners):
   - SignalDefiner → MonitoringSetupExecutor → ProbabilityEstimator →
     ThresholdManager → AlertGenerator

Workflow Modes:
    - "portfolio_foresight": Run Portfolio Foresight sub-workflow (5 runners)
    - "scenario_development": Run Scenario Development sub-workflow (5 runners)
    - "disruption_early_warning": Run Disruption Early Warning sub-workflow (5 runners)
    - "full": Run all 15 runners in sequence

Graph (Full Mode):
    START → initialize → preflight →
    [Portfolio Foresight] signal_analysis → tech_impact → disruption_scoring →
                         capability_gap → investment_recommendation →
    [Scenario Development] driving_forces → scenario_axes → narratives →
                          implications → indicators →
    [Disruption Early Warning] signal_definition → monitoring_setup →
                              probability_estimation → threshold_management →
                              alert_generation →
    quality_gate → END

HITL:
    - After disruption_scoring: Risk assessment review (blocking)
    - After implications: Scenario validation (blocking)
    - After alert_generation: Final approval (non-blocking)

Reasoning Pattern:
    Portfolio Foresight: Signals → Impact → Risk → Gaps → Investment
    Scenario Development: Forces → Axes → Narratives → Implications → Indicators
    Disruption Early Warning: Define → Monitor → Estimate → Threshold → Alert
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
# Foresight State
# =============================================================================

class ForesightState(BaseFamilyState):
    """
    State for the Foresight runner.

    Extends BaseFamilyState with foresight-specific fields for
    signal analysis, disruption scoring, and investment planning.
    """
    # Configuration
    portfolio_scope: str = Field(default="", description="Scope of portfolio to analyze")
    time_horizon: str = Field(default="3-5 years", description="Foresight time horizon")
    industry_focus: List[str] = Field(default_factory=list, description="Target industries")

    # Signal Analysis outputs
    signals: List[Dict[str, Any]] = Field(default_factory=list)
    signal_map: Dict[str, Any] = Field(default_factory=dict)
    weak_signals: List[Dict[str, Any]] = Field(default_factory=list)
    strong_signals: List[Dict[str, Any]] = Field(default_factory=list)

    # Technology Impact outputs
    technology_assessments: List[Dict[str, Any]] = Field(default_factory=list)
    impact_assessment: Dict[str, Any] = Field(default_factory=dict)
    disruption_technologies: List[str] = Field(default_factory=list)

    # Disruption Scoring outputs
    disruption_scores: List[Dict[str, Any]] = Field(default_factory=list)
    risk_scores: Dict[str, float] = Field(default_factory=dict)
    overall_disruption_risk: float = Field(default=0.0)
    risk_category: str = Field(default="unknown")

    # Capability Gap outputs
    capability_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    gap_map: Dict[str, Any] = Field(default_factory=dict)
    priority_gaps: List[str] = Field(default_factory=list)

    # Investment Recommendation outputs
    investment_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    investment_plan: Dict[str, Any] = Field(default_factory=dict)
    total_recommended_investment: float = Field(default=0.0)
    roi_projections: Dict[str, float] = Field(default_factory=dict)

    # ==========================================================================
    # Scenario Development outputs (Sub-workflow 2)
    # ==========================================================================
    # Driving Force outputs
    driving_forces: List[Dict[str, Any]] = Field(default_factory=list)
    force_categories: Dict[str, List[str]] = Field(default_factory=dict)
    critical_uncertainties: List[str] = Field(default_factory=list)

    # Scenario Axis outputs
    scenario_axes: List[Dict[str, Any]] = Field(default_factory=list)
    scenario_matrix: Dict[str, Any] = Field(default_factory=dict)
    quadrant_definitions: List[Dict[str, Any]] = Field(default_factory=list)

    # Narrative Storyline outputs
    scenario_narratives: List[Dict[str, Any]] = Field(default_factory=list)
    storyline_elements: Dict[str, Any] = Field(default_factory=dict)

    # Implication outputs
    implications: List[Dict[str, Any]] = Field(default_factory=list)
    implication_map: Dict[str, Any] = Field(default_factory=dict)
    strategic_implications: List[str] = Field(default_factory=list)

    # Indicator outputs
    monitoring_indicators: List[Dict[str, Any]] = Field(default_factory=list)
    indicator_dashboard: Dict[str, Any] = Field(default_factory=dict)
    early_warning_signals: List[str] = Field(default_factory=list)

    # ==========================================================================
    # Disruption Early Warning outputs (Sub-workflow 3)
    # ==========================================================================
    # Signal Definition outputs
    signal_definitions: List[Dict[str, Any]] = Field(default_factory=list)
    signal_taxonomy: Dict[str, Any] = Field(default_factory=dict)

    # Monitoring Setup outputs
    active_monitors: List[Dict[str, Any]] = Field(default_factory=list)
    monitoring_config: Dict[str, Any] = Field(default_factory=dict)
    data_sources: List[str] = Field(default_factory=list)

    # Probability Estimation outputs
    probability_scores: Dict[str, float] = Field(default_factory=dict)
    confidence_intervals: Dict[str, Any] = Field(default_factory=dict)
    bayesian_priors: Dict[str, float] = Field(default_factory=dict)

    # Threshold Management outputs
    threshold_config: Dict[str, Any] = Field(default_factory=dict)
    alert_thresholds: List[Dict[str, Any]] = Field(default_factory=list)
    escalation_levels: List[str] = Field(default_factory=list)

    # Alert Generation outputs
    alerts: List[Dict[str, Any]] = Field(default_factory=list)
    alert_stream: List[Dict[str, Any]] = Field(default_factory=list)
    alert_summary: Dict[str, Any] = Field(default_factory=dict)

    # ==========================================================================
    # Quality metrics and configuration
    # ==========================================================================
    signal_quality_score: float = Field(default=0.0)
    assessment_confidence: float = Field(default=0.0)
    recommendation_strength: float = Field(default=0.0)
    scenario_quality_score: float = Field(default=0.0)
    early_warning_readiness: float = Field(default=0.0)

    # Workflow mode
    workflow_mode: str = Field(default="full", description="portfolio_foresight | scenario_development | disruption_early_warning | full")

    # Mode 4 constraints
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)


# =============================================================================
# Foresight Runner
# =============================================================================

@register_family_runner(FamilyType.FORESIGHT)
class ForesightRunner(BaseFamilyRunner[ForesightState]):
    """
    Foresight runner implementing strategic foresight and disruption monitoring.

    This runner follows the Portfolio Foresight pattern:
    1. Signal/Trend Analysis - Detect weak and strong signals
    2. Technology Impact Assessment - Evaluate disruption potential
    3. Disruption Scoring - Quantify portfolio risk
    4. Capability Gap Mapping - Identify strategic gaps
    5. Investment Recommendation - Synthesize actionable investment plan

    Graph Nodes:
        - initialize: Setup state and load context
        - preflight: Validate inputs (portfolio, industries, horizon)
        - signal_analysis: Analyze weak signals and trends
        - tech_impact: Assess technology disruption potential
        - disruption_scoring: Score portfolio disruption risk
        - capability_gap: Map capability gaps against disruptions
        - investment_recommendation: Generate investment plan
        - quality_gate: Final quality assessment

    HITL Checkpoints:
        - After disruption_scoring: Risk assessment review (blocking)
        - After investment_recommendation: Final approval (non-blocking)
    """

    family = FamilyType.FORESIGHT
    state_class = ForesightState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        time_horizon: str = "3-5 years",
        workflow_mode: str = "full",
        **kwargs: Any,
    ):
        """
        Initialize Foresight runner.

        Args:
            llm: LangChain LLM for reasoning (defaults to GPT-4)
            time_horizon: Foresight planning horizon
            workflow_mode: Which sub-workflow(s) to run:
                - "portfolio_foresight": 5 runners
                - "scenario_development": 5 runners
                - "disruption_early_warning": 5 runners
                - "full": All 15 runners (default)
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=8000,
        )
        self.time_horizon = time_horizon
        self.workflow_mode = workflow_mode

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[ForesightState], ForesightState]]:
        """Create nodes for Foresight graph (all 15 runners across 3 sub-workflows)."""
        nodes = {
            # Common nodes
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "quality_gate": self._quality_gate_node,
        }

        # Portfolio Foresight sub-workflow (5 runners)
        if self.workflow_mode in ("portfolio_foresight", "full"):
            nodes.update({
                "signal_analysis": self._signal_trend_analyzer_node,
                "tech_impact": self._technology_impact_assessor_node,
                "disruption_scoring": self._portfolio_disruption_scorer_node,
                "capability_gap": self._capability_gap_mapper_node,
                "investment_recommendation": self._investment_recommender_node,
            })

        # Scenario Development sub-workflow (5 runners)
        if self.workflow_mode in ("scenario_development", "full"):
            nodes.update({
                "driving_forces": self._driving_force_identifier_node,
                "scenario_axes": self._scenario_axis_definer_node,
                "narratives": self._narrative_storyline_constructor_node,
                "implications": self._implication_modeler_node,
                "indicators": self._indicator_setter_node,
            })

        # Disruption Early Warning sub-workflow (5 runners)
        if self.workflow_mode in ("disruption_early_warning", "full"):
            nodes.update({
                "signal_definition": self._signal_definer_node,
                "monitoring_setup": self._monitoring_setup_executor_node,
                "probability_estimation": self._probability_estimator_node,
                "threshold_management": self._threshold_manager_node,
                "alert_generation": self._alert_generator_node,
            })

        return nodes

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Foresight graph based on workflow mode."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")

        if self.workflow_mode == "portfolio_foresight":
            # Portfolio Foresight only (5 runners)
            graph.add_edge("preflight", "signal_analysis")
            graph.add_edge("signal_analysis", "tech_impact")
            graph.add_edge("tech_impact", "disruption_scoring")
            graph.add_edge("disruption_scoring", "capability_gap")
            graph.add_edge("capability_gap", "investment_recommendation")
            graph.add_edge("investment_recommendation", "quality_gate")

        elif self.workflow_mode == "scenario_development":
            # Scenario Development only (5 runners)
            graph.add_edge("preflight", "driving_forces")
            graph.add_edge("driving_forces", "scenario_axes")
            graph.add_edge("scenario_axes", "narratives")
            graph.add_edge("narratives", "implications")
            graph.add_edge("implications", "indicators")
            graph.add_edge("indicators", "quality_gate")

        elif self.workflow_mode == "disruption_early_warning":
            # Disruption Early Warning only (5 runners)
            graph.add_edge("preflight", "signal_definition")
            graph.add_edge("signal_definition", "monitoring_setup")
            graph.add_edge("monitoring_setup", "probability_estimation")
            graph.add_edge("probability_estimation", "threshold_management")
            graph.add_edge("threshold_management", "alert_generation")
            graph.add_edge("alert_generation", "quality_gate")

        else:  # "full" mode - all 15 runners
            # Portfolio Foresight (5 runners)
            graph.add_edge("preflight", "signal_analysis")
            graph.add_edge("signal_analysis", "tech_impact")
            graph.add_edge("tech_impact", "disruption_scoring")
            graph.add_edge("disruption_scoring", "capability_gap")
            graph.add_edge("capability_gap", "investment_recommendation")
            # Scenario Development (5 runners)
            graph.add_edge("investment_recommendation", "driving_forces")
            graph.add_edge("driving_forces", "scenario_axes")
            graph.add_edge("scenario_axes", "narratives")
            graph.add_edge("narratives", "implications")
            graph.add_edge("implications", "indicators")
            # Disruption Early Warning (5 runners)
            graph.add_edge("indicators", "signal_definition")
            graph.add_edge("signal_definition", "monitoring_setup")
            graph.add_edge("monitoring_setup", "probability_estimation")
            graph.add_edge("probability_estimation", "threshold_management")
            graph.add_edge("threshold_management", "alert_generation")
            graph.add_edge("alert_generation", "quality_gate")

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
        """Nodes that can trigger HITL checkpoints based on workflow mode."""
        hitl_nodes = []

        if self.workflow_mode in ("portfolio_foresight", "full"):
            hitl_nodes.extend(["disruption_scoring", "investment_recommendation"])

        if self.workflow_mode in ("scenario_development", "full"):
            hitl_nodes.append("implications")

        if self.workflow_mode in ("disruption_early_warning", "full"):
            hitl_nodes.append("alert_generation")

        return hitl_nodes

    # =========================================================================
    # Node Implementations - Portfolio Foresight Sub-workflow (5 runners)
    # =========================================================================

    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _initialize_node(self, state: ForesightState) -> ForesightState:
        """Initialize foresight state."""
        logger.info(f"Initializing foresight: {state.mission_id}")

        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = datetime.utcnow()
        state.time_horizon = self.time_horizon
        state.total_steps = 5  # 5 runners in Portfolio Foresight
        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")

        return state

    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _preflight_validation_node(self, state: ForesightState) -> ForesightState:
        """Validate inputs before execution."""
        logger.info(f"Preflight validation: {state.mission_id}")

        errors = []

        # Required fields
        if not state.tenant_id:
            errors.append("tenant_id_missing")
        if not state.goal and not state.query and not state.portfolio_scope:
            errors.append("goal_or_portfolio_scope_missing")

        # Mode 4 constraints validation
        if state.mode_4_constraints and isinstance(state.mode_4_constraints, dict):
            wall_time = state.mode_4_constraints.get("max_wall_time_minutes")
            if wall_time and wall_time > 60:
                errors.append("wall_time_exceeds_limit_60min")

            max_cost = state.mode_4_constraints.get("max_cost")
            if max_cost and max_cost < 0.15:
                errors.append("budget_too_low_for_foresight")

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

    # -------------------------------------------------------------------------
    # Runner 1: SignalTrendAnalyzer
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _signal_trend_analyzer_node(self, state: ForesightState) -> ForesightState:
        """
        SignalTrendAnalyzer: Analyze weak signals and emerging trends.

        Output: Signal map with categorized weak/strong signals
        """
        logger.info(f"Analyzing signals and trends: {state.mission_id}")

        state.phase = ExecutionPhase.GATHER
        state.current_step = 1

        prompt = """You are a strategic foresight analyst specializing in weak signal detection.

Analyze the portfolio/industry context to identify:

1. WEAK SIGNALS (early indicators of potential change):
   - signal_id: Unique identifier
   - signal_name: Short descriptive name
   - description: What is being observed
   - source_category: Where the signal originates (technology | market | regulatory | social | economic)
   - signal_strength: weak | emerging | strengthening
   - certainty: low | medium | high
   - time_to_impact: near (1-2y) | medium (3-5y) | far (5-10y)
   - potential_impact: Description of what might happen

2. STRONG SIGNALS (established trends):
   - Same structure but signal_strength = strong

3. SIGNAL MAP (synthesis):
   - total_signals: Count
   - by_category: Breakdown by source_category
   - priority_signals: Top 5 signals requiring attention
   - convergence_patterns: Where multiple signals reinforce each other

Return JSON with: signals[], weak_signals[], strong_signals[], signal_map{}"""

        content = f"""Portfolio/Industry Scope: {state.portfolio_scope or state.goal or state.query}
Industries: {state.industry_focus}
Time Horizon: {state.time_horizon}
Context: {state.context}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content=prompt),
                    HumanMessage(content=content),
                ],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.signals = result.get("signals", [])
            state.weak_signals = result.get("weak_signals", [])
            state.strong_signals = result.get("strong_signals", [])
            state.signal_map = result.get("signal_map", {})

            # Calculate signal quality score
            total_signals = len(state.signals) + len(state.weak_signals) + len(state.strong_signals)
            state.signal_quality_score = min(1.0, total_signals / 10.0)  # Expect ~10 signals

            logger.info(
                "foresight_signals_analyzed",
                mission_id=state.mission_id,
                signal_count=total_signals,
            )

        except Exception as e:
            logger.error(f"Signal analysis failed: {e}")
            state.error = f"Signal analysis failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "signal_analysis", "signal_count": len(state.signals)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 2: TechnologyImpactAssessor
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _technology_impact_assessor_node(self, state: ForesightState) -> ForesightState:
        """
        TechnologyImpactAssessor: Assess technology disruption potential.

        Output: Impact assessment with disruption potential scores
        """
        logger.info(f"Assessing technology impact: {state.mission_id}")

        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 2

        prompt = """You are a technology strategist assessing disruption potential.

For each technology signal identified, assess:

1. TECHNOLOGY ASSESSMENTS (per technology):
   - technology_name: Name of the technology
   - maturity_stage: research | emerging | growing | mature | declining
   - disruption_potential: low | medium | high | transformative
   - adoption_timeline: Time to mainstream adoption
   - industry_impact: Which industries affected
   - competitive_advantage: Whether it creates advantage
   - investment_intensity: Capital required (low | medium | high)
   - skill_requirements: Skills needed to leverage
   - risk_factors: Key risks in adoption

2. DISRUPTION TECHNOLOGIES (priority list):
   - Top technologies requiring immediate attention

3. IMPACT ASSESSMENT (overall):
   - total_technologies: Count assessed
   - high_disruption_count: Technologies with high+ disruption potential
   - immediate_threats: Technologies that could disrupt in < 2 years
   - strategic_opportunities: Technologies to invest in
   - recommended_actions: Specific actions per technology

Return JSON with: technology_assessments[], disruption_technologies[], impact_assessment{}"""

        # Use signals from previous step
        signals_context = f"Signals Identified: {state.signals[:5]}"  # Top 5 signals

        content = f"""{signals_context}
Portfolio Scope: {state.portfolio_scope or state.goal}
Time Horizon: {state.time_horizon}
Industries: {state.industry_focus}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content=prompt),
                    HumanMessage(content=content),
                ],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.technology_assessments = result.get("technology_assessments", [])
            state.disruption_technologies = result.get("disruption_technologies", [])
            state.impact_assessment = result.get("impact_assessment", {})

            logger.info(
                "foresight_tech_impact_assessed",
                mission_id=state.mission_id,
                tech_count=len(state.technology_assessments),
            )

        except Exception as e:
            logger.error(f"Technology impact assessment failed: {e}")
            state.error = f"Technology impact assessment failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "tech_impact", "tech_count": len(state.technology_assessments)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 3: PortfolioDisruptionScorer
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _portfolio_disruption_scorer_node(self, state: ForesightState) -> ForesightState:
        """
        PortfolioDisruptionScorer: Score disruption risk for portfolio.

        Output: Risk scores per portfolio element and overall disruption risk
        """
        logger.info(f"Scoring portfolio disruption: {state.mission_id}")

        state.phase = ExecutionPhase.EVALUATE
        state.current_step = 3

        prompt = """You are a risk analyst scoring portfolio disruption risk.

Calculate disruption scores for the portfolio:

1. DISRUPTION SCORES (per portfolio element/business unit):
   - element_name: Business unit or portfolio element
   - exposure_score: 0-100 (exposure to disruption)
   - vulnerability_score: 0-100 (ability to respond)
   - resilience_score: 0-100 (recovery capability)
   - overall_risk_score: 0-100 (weighted combination)
   - risk_drivers: Key factors driving risk
   - mitigation_options: Options to reduce risk

2. RISK SCORES (aggregated by category):
   - technology_risk: Overall technology disruption risk
   - market_risk: Market shift risk
   - regulatory_risk: Regulatory change risk
   - competitive_risk: Competitive threat risk

3. OVERALL ASSESSMENT:
   - overall_disruption_risk: 0-100 score
   - risk_category: low (0-25) | medium (26-50) | high (51-75) | critical (76-100)
   - top_risk_factors: Top 3 risk drivers
   - urgent_actions: Actions needed immediately
   - monitoring_priorities: What to track going forward

Return JSON with: disruption_scores[], risk_scores{}, overall_disruption_risk, risk_category"""

        tech_context = f"Technology Assessments: {state.technology_assessments[:3]}"

        content = f"""{tech_context}
Disruption Technologies: {state.disruption_technologies}
Impact Assessment: {state.impact_assessment}
Portfolio Scope: {state.portfolio_scope or state.goal}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content=prompt),
                    HumanMessage(content=content),
                ],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.disruption_scores = result.get("disruption_scores", [])
            state.risk_scores = result.get("risk_scores", {})
            state.overall_disruption_risk = result.get("overall_disruption_risk", 0.0)
            state.risk_category = result.get("risk_category", "unknown")

            # Update confidence based on scoring
            state.assessment_confidence = 0.8 if len(state.disruption_scores) >= 3 else 0.5

            logger.info(
                "foresight_disruption_scored",
                mission_id=state.mission_id,
                overall_risk=state.overall_disruption_risk,
                risk_category=state.risk_category,
            )

        except Exception as e:
            logger.error(f"Disruption scoring failed: {e}")
            state.error = f"Disruption scoring failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "disruption_scoring", "risk": state.overall_disruption_risk},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 4: CapabilityGapMapper
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _capability_gap_mapper_node(self, state: ForesightState) -> ForesightState:
        """
        CapabilityGapMapper: Map capability gaps against disruption threats.

        Output: Gap map with prioritized capability needs
        """
        logger.info(f"Mapping capability gaps: {state.mission_id}")

        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 4

        prompt = """You are a capability strategist mapping organizational gaps.

Identify capability gaps that must be addressed:

1. CAPABILITY GAPS (detailed analysis):
   - gap_id: Unique identifier
   - capability_name: Name of the capability
   - current_state: Current capability level (none | basic | intermediate | advanced)
   - required_state: Required capability level to address disruption
   - gap_severity: critical | significant | moderate | minor
   - related_disruptions: Which disruption threats this gap exposes
   - build_vs_buy: Whether to build, buy, or partner
   - time_to_close: Estimated time to close gap
   - investment_required: Rough investment needed

2. GAP MAP (visual/structured):
   - total_gaps: Count of identified gaps
   - critical_gaps: Gaps requiring immediate attention
   - capability_clusters: Related capabilities grouped
   - dependencies: Which gaps must be closed before others

3. PRIORITY GAPS (ordered list):
   - Top 5 gaps to address first based on risk reduction potential

Return JSON with: capability_gaps[], gap_map{}, priority_gaps[]"""

        context = f"""Disruption Scores: {state.disruption_scores[:3]}
Risk Category: {state.risk_category}
Overall Disruption Risk: {state.overall_disruption_risk}
Technologies: {state.disruption_technologies}
Portfolio Scope: {state.portfolio_scope or state.goal}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content=prompt),
                    HumanMessage(content=context),
                ],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.capability_gaps = result.get("capability_gaps", [])
            state.gap_map = result.get("gap_map", {})
            state.priority_gaps = result.get("priority_gaps", [])

            logger.info(
                "foresight_gaps_mapped",
                mission_id=state.mission_id,
                gap_count=len(state.capability_gaps),
                priority_gaps=len(state.priority_gaps),
            )

        except Exception as e:
            logger.error(f"Capability gap mapping failed: {e}")
            state.error = f"Capability gap mapping failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "capability_gap", "gap_count": len(state.capability_gaps)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 5: InvestmentRecommender
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _investment_recommender_node(self, state: ForesightState) -> ForesightState:
        """
        InvestmentRecommender: Generate strategic investment recommendations.

        Output: Investment plan with ROI projections
        """
        logger.info(f"Generating investment recommendations: {state.mission_id}")

        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 5

        prompt = """You are an investment strategist recommending portfolio investments.

Generate investment recommendations to address disruption risks:

1. INVESTMENT RECOMMENDATIONS (detailed):
   - investment_id: Unique identifier
   - investment_name: Name of the investment
   - investment_type: R&D | acquisition | partnership | talent | infrastructure
   - capability_gap_addressed: Which gap(s) this closes
   - investment_amount: Recommended investment ($)
   - investment_timeline: When to invest
   - expected_roi: Return on investment (%)
   - roi_timeline: When ROI is realized
   - risk_level: low | medium | high
   - success_metrics: How to measure success
   - dependencies: Other investments required first

2. INVESTMENT PLAN (overall):
   - total_investment: Sum of all recommended investments
   - investment_phases: Phased approach (Year 1, Year 2, etc.)
   - portfolio_balance: Mix by investment type
   - quick_wins: Investments with fast payback
   - strategic_bets: Longer-term transformative investments

3. ROI PROJECTIONS:
   - year_1_roi: Expected return in Year 1
   - year_3_roi: Expected return by Year 3
   - year_5_roi: Expected return by Year 5
   - break_even_point: When investments pay back

Return JSON with: investment_recommendations[], investment_plan{}, total_recommended_investment, roi_projections{}"""

        context = f"""Capability Gaps: {state.capability_gaps[:5]}
Priority Gaps: {state.priority_gaps}
Disruption Technologies: {state.disruption_technologies}
Risk Category: {state.risk_category}
Overall Disruption Risk: {state.overall_disruption_risk}
Portfolio Scope: {state.portfolio_scope or state.goal}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [
                    SystemMessage(content=prompt),
                    HumanMessage(content=context),
                ],
                timeout=60,  # Longer timeout for investment synthesis
            )

            result = self._parse_json_output(response.content)
            state.investment_recommendations = result.get("investment_recommendations", [])
            state.investment_plan = result.get("investment_plan", {})
            state.total_recommended_investment = result.get("total_recommended_investment", 0.0)
            state.roi_projections = result.get("roi_projections", {})

            # Calculate recommendation strength
            rec_count = len(state.investment_recommendations)
            has_roi = bool(state.roi_projections)
            has_plan = bool(state.investment_plan)
            state.recommendation_strength = (
                0.4 * min(1.0, rec_count / 5.0) +
                0.3 * (1.0 if has_roi else 0.0) +
                0.3 * (1.0 if has_plan else 0.0)
            )

            logger.info(
                "foresight_investments_recommended",
                mission_id=state.mission_id,
                recommendation_count=len(state.investment_recommendations),
                total_investment=state.total_recommended_investment,
            )

        except Exception as e:
            logger.error(f"Investment recommendation failed: {e}")
            state.error = f"Investment recommendation failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {
                "phase": "investment_recommendation",
                "recommendation_count": len(state.investment_recommendations),
            },
            mission_id=state.mission_id,
        )
        return state

    # =========================================================================
    # Node Implementations - Scenario Development Sub-workflow (5 runners)
    # =========================================================================

    # -------------------------------------------------------------------------
    # Runner 6: DrivingForceIdentifier
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _driving_force_identifier_node(self, state: ForesightState) -> ForesightState:
        """
        DrivingForceIdentifier: Identify driving forces that shape the future.

        Output: Force list with categorized driving forces and critical uncertainties
        """
        logger.info(f"Identifying driving forces: {state.mission_id}")

        state.phase = ExecutionPhase.GATHER
        state.current_step = 6 if self.workflow_mode == "full" else 1

        prompt = """You are a strategic foresight expert identifying driving forces.

Identify the key forces that will shape the future:

1. DRIVING FORCES (detailed):
   - force_id: Unique identifier
   - force_name: Short descriptive name
   - description: What this force represents
   - category: STEEP category (Social | Technological | Economic | Environmental | Political)
   - impact_level: low | medium | high | transformative
   - certainty: certain | probable | uncertain | highly_uncertain
   - direction: positive | negative | ambiguous
   - time_horizon: near (1-2y) | medium (3-5y) | far (5-10y)
   - evidence: What data supports this force

2. FORCE CATEGORIES:
   - Group forces by STEEP categories
   - Identify cross-category interactions

3. CRITICAL UNCERTAINTIES:
   - Top 4-6 forces with highest uncertainty AND highest impact
   - These become scenario axis candidates

Return JSON with: driving_forces[], force_categories{}, critical_uncertainties[]"""

        context = f"""Portfolio Scope: {state.portfolio_scope or state.goal}
Time Horizon: {state.time_horizon}
Industries: {state.industry_focus}
Prior Signals: {state.signals[:3] if state.signals else 'None'}
Investment Context: {state.investment_recommendations[:2] if state.investment_recommendations else 'None'}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.driving_forces = result.get("driving_forces", [])
            state.force_categories = result.get("force_categories", {})
            state.critical_uncertainties = result.get("critical_uncertainties", [])

            logger.info(
                "foresight_forces_identified",
                mission_id=state.mission_id,
                force_count=len(state.driving_forces),
            )

        except Exception as e:
            logger.error(f"Driving force identification failed: {e}")
            state.error = f"Driving force identification failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "driving_forces", "force_count": len(state.driving_forces)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 7: ScenarioAxisDefiner
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _scenario_axis_definer_node(self, state: ForesightState) -> ForesightState:
        """
        ScenarioAxisDefiner: Define scenario axes for 2x2 matrix.

        Output: 2x2 matrix with axes and quadrant definitions
        """
        logger.info(f"Defining scenario axes: {state.mission_id}")

        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 7 if self.workflow_mode == "full" else 2

        prompt = """You are a scenario planning expert defining scenario axes.

Create a 2x2 scenario matrix:

1. SCENARIO AXES (2 axes):
   - axis_id: "axis_1" or "axis_2"
   - axis_name: Short descriptive name
   - description: What this axis represents
   - low_end: Description of negative/low pole
   - high_end: Description of positive/high pole
   - uncertainty: Why this is uncertain
   - selected_from: Which critical uncertainty(ies) this derives from

2. SCENARIO MATRIX:
   - axis_1_name: First axis name
   - axis_1_low: Low end label
   - axis_1_high: High end label
   - axis_2_name: Second axis name
   - axis_2_low: Low end label
   - axis_2_high: High end label

3. QUADRANT DEFINITIONS (4 quadrants):
   - quadrant_id: "Q1" | "Q2" | "Q3" | "Q4"
   - name: Memorable scenario name
   - axis_1_position: low | high
   - axis_2_position: low | high
   - summary: Brief description of this future

Return JSON with: scenario_axes[], scenario_matrix{}, quadrant_definitions[]"""

        context = f"""Critical Uncertainties: {state.critical_uncertainties}
Driving Forces: {state.driving_forces[:5]}
Time Horizon: {state.time_horizon}
Portfolio Scope: {state.portfolio_scope or state.goal}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.scenario_axes = result.get("scenario_axes", [])
            state.scenario_matrix = result.get("scenario_matrix", {})
            state.quadrant_definitions = result.get("quadrant_definitions", [])

            logger.info(
                "foresight_axes_defined",
                mission_id=state.mission_id,
                quadrants=len(state.quadrant_definitions),
            )

        except Exception as e:
            logger.error(f"Scenario axis definition failed: {e}")
            state.error = f"Scenario axis definition failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "scenario_axes", "quadrants": len(state.quadrant_definitions)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 8: NarrativeStorylineConstructor
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _narrative_storyline_constructor_node(self, state: ForesightState) -> ForesightState:
        """
        NarrativeStorylineConstructor: Build compelling scenario narratives.

        Output: Scenario stories with detailed narratives
        """
        logger.info(f"Constructing scenario narratives: {state.mission_id}")

        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 8 if self.workflow_mode == "full" else 3

        prompt = """You are a scenario storyteller creating vivid future narratives.

For each scenario quadrant, create a compelling narrative:

1. SCENARIO NARRATIVES (4 scenarios):
   - scenario_id: Maps to quadrant_id
   - scenario_name: Memorable name
   - headline: A newspaper headline from the future
   - year: What year this scenario depicts
   - narrative: 3-5 paragraph story describing this future
   - key_events: Timeline of events leading to this scenario
   - winners: Who thrives in this scenario
   - losers: Who struggles in this scenario
   - wild_cards: Unexpected events that could accelerate this scenario

2. STORYLINE ELEMENTS:
   - common_threads: What's similar across all scenarios
   - divergence_points: Where scenarios diverge
   - earliest_signals: First signs each scenario is emerging

Return JSON with: scenario_narratives[], storyline_elements{}"""

        context = f"""Quadrant Definitions: {state.quadrant_definitions}
Scenario Matrix: {state.scenario_matrix}
Driving Forces: {state.driving_forces[:5]}
Time Horizon: {state.time_horizon}
Portfolio Scope: {state.portfolio_scope or state.goal}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=60,  # Longer for narrative generation
            )

            result = self._parse_json_output(response.content)
            state.scenario_narratives = result.get("scenario_narratives", [])
            state.storyline_elements = result.get("storyline_elements", {})

            # Update scenario quality score
            state.scenario_quality_score = min(1.0, len(state.scenario_narratives) / 4.0)

            logger.info(
                "foresight_narratives_constructed",
                mission_id=state.mission_id,
                narrative_count=len(state.scenario_narratives),
            )

        except Exception as e:
            logger.error(f"Narrative construction failed: {e}")
            state.error = f"Narrative construction failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "narratives", "narrative_count": len(state.scenario_narratives)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 9: ImplicationModeler
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _implication_modeler_node(self, state: ForesightState) -> ForesightState:
        """
        ImplicationModeler: Model implications of each scenario.

        Output: Implication map with strategic implications
        """
        logger.info(f"Modeling implications: {state.mission_id}")

        state.phase = ExecutionPhase.EVALUATE
        state.current_step = 9 if self.workflow_mode == "full" else 4

        prompt = """You are a strategic analyst modeling scenario implications.

For each scenario, identify implications:

1. IMPLICATIONS (per scenario):
   - scenario_id: Which scenario
   - implication_id: Unique identifier
   - implication_type: strategic | operational | financial | organizational | technological
   - description: What this means
   - impact_area: Which business area affected
   - severity: critical | major | moderate | minor
   - timing: immediate | short_term | medium_term | long_term
   - actions_required: What must be done

2. IMPLICATION MAP:
   - cross_scenario_implications: Implications true across all scenarios
   - scenario_specific_implications: Unique to each scenario
   - no_regret_moves: Actions beneficial regardless of scenario
   - options_to_preserve: Flexibility to maintain

3. STRATEGIC IMPLICATIONS:
   - Top 5 strategic decisions that must be made
   - Hedging strategies
   - Trigger points for action

Return JSON with: implications[], implication_map{}, strategic_implications[]"""

        context = f"""Scenario Narratives: {state.scenario_narratives}
Quadrant Definitions: {state.quadrant_definitions}
Capability Gaps: {state.capability_gaps[:3] if state.capability_gaps else 'None'}
Portfolio Scope: {state.portfolio_scope or state.goal}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.implications = result.get("implications", [])
            state.implication_map = result.get("implication_map", {})
            state.strategic_implications = result.get("strategic_implications", [])

            logger.info(
                "foresight_implications_modeled",
                mission_id=state.mission_id,
                implication_count=len(state.implications),
            )

        except Exception as e:
            logger.error(f"Implication modeling failed: {e}")
            state.error = f"Implication modeling failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "implications", "implication_count": len(state.implications)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 10: IndicatorSetter
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _indicator_setter_node(self, state: ForesightState) -> ForesightState:
        """
        IndicatorSetter: Set monitoring indicators for scenario tracking.

        Output: Indicator dashboard for ongoing monitoring
        """
        logger.info(f"Setting indicators: {state.mission_id}")

        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 10 if self.workflow_mode == "full" else 5

        prompt = """You are a strategic monitoring expert setting scenario indicators.

Define indicators to monitor which scenario is emerging:

1. MONITORING INDICATORS (per scenario):
   - indicator_id: Unique identifier
   - indicator_name: Short descriptive name
   - scenario_id: Which scenario this indicates
   - description: What to monitor
   - data_source: Where to get this data
   - measurement: How to measure (metric, survey, observation)
   - baseline: Current value
   - trigger_threshold: Value indicating scenario emergence
   - check_frequency: daily | weekly | monthly | quarterly

2. INDICATOR DASHBOARD:
   - total_indicators: Count
   - by_scenario: Indicators grouped by scenario
   - leading_indicators: Early signals (predictive)
   - lagging_indicators: Confirmation signals (reactive)
   - composite_index: Combined score methodology

3. EARLY WARNING SIGNALS:
   - Top 5 signals to watch immediately
   - Red flags for each scenario
   - Signal combinations that indicate trajectory shifts

Return JSON with: monitoring_indicators[], indicator_dashboard{}, early_warning_signals[]"""

        context = f"""Scenario Narratives: {state.scenario_narratives}
Storyline Elements: {state.storyline_elements}
Strategic Implications: {state.strategic_implications}
Time Horizon: {state.time_horizon}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.monitoring_indicators = result.get("monitoring_indicators", [])
            state.indicator_dashboard = result.get("indicator_dashboard", {})
            state.early_warning_signals = result.get("early_warning_signals", [])

            logger.info(
                "foresight_indicators_set",
                mission_id=state.mission_id,
                indicator_count=len(state.monitoring_indicators),
            )

        except Exception as e:
            logger.error(f"Indicator setting failed: {e}")
            state.error = f"Indicator setting failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "indicators", "indicator_count": len(state.monitoring_indicators)},
            mission_id=state.mission_id,
        )
        return state

    # =========================================================================
    # Node Implementations - Disruption Early Warning Sub-workflow (5 runners)
    # =========================================================================

    # -------------------------------------------------------------------------
    # Runner 11: SignalDefiner
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _signal_definer_node(self, state: ForesightState) -> ForesightState:
        """
        SignalDefiner: Define signals to monitor for disruption.

        Output: Signal definitions with taxonomy
        """
        logger.info(f"Defining signals: {state.mission_id}")

        state.phase = ExecutionPhase.PLAN
        state.current_step = 11 if self.workflow_mode == "full" else 1

        prompt = """You are a disruption intelligence analyst defining monitoring signals.

Define the signals to monitor for early disruption warning:

1. SIGNAL DEFINITIONS (detailed):
   - signal_id: Unique identifier
   - signal_name: Short descriptive name
   - description: What this signal represents
   - signal_type: quantitative | qualitative | composite
   - category: technology | market | regulatory | competitive | social | economic
   - data_type: news | patent | funding | market_data | social_media | regulatory_filing
   - geographic_scope: global | regional | national | local
   - measurement_unit: Count, $, %, index score, etc.
   - interpretation_guide: How to read changes

2. SIGNAL TAXONOMY:
   - categories: Signal categories and hierarchy
   - relationships: How signals relate to each other
   - priority_ranking: Which signals matter most
   - coverage_assessment: Gaps in signal coverage

Return JSON with: signal_definitions[], signal_taxonomy{}"""

        context = f"""Prior Signals: {state.signals[:5] if state.signals else 'None'}
Early Warning Signals: {state.early_warning_signals if state.early_warning_signals else 'None'}
Monitoring Indicators: {state.monitoring_indicators[:3] if state.monitoring_indicators else 'None'}
Portfolio Scope: {state.portfolio_scope or state.goal}
Industries: {state.industry_focus}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.signal_definitions = result.get("signal_definitions", [])
            state.signal_taxonomy = result.get("signal_taxonomy", {})

            logger.info(
                "foresight_signals_defined",
                mission_id=state.mission_id,
                signal_count=len(state.signal_definitions),
            )

        except Exception as e:
            logger.error(f"Signal definition failed: {e}")
            state.error = f"Signal definition failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "signal_definition", "signal_count": len(state.signal_definitions)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 12: MonitoringSetupExecutor
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _monitoring_setup_executor_node(self, state: ForesightState) -> ForesightState:
        """
        MonitoringSetupExecutor: Setup active monitoring systems.

        Output: Active monitors configuration
        """
        logger.info(f"Setting up monitoring: {state.mission_id}")

        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 12 if self.workflow_mode == "full" else 2

        prompt = """You are a monitoring systems architect setting up disruption detection.

Configure active monitoring for defined signals:

1. ACTIVE MONITORS (per signal):
   - monitor_id: Unique identifier
   - signal_id: Which signal this monitors
   - monitor_name: Short name
   - data_source: Specific source (API, database, feed)
   - collection_method: api_pull | webhook | scrape | manual
   - collection_frequency: real_time | hourly | daily | weekly
   - processing_pipeline: How data is processed
   - storage_location: Where data is stored
   - retention_period: How long to keep data
   - status: active | pending | inactive

2. MONITORING CONFIG:
   - total_monitors: Count
   - by_category: Monitors grouped by signal category
   - coverage_score: % of signals covered
   - automation_level: % of monitors automated
   - resource_requirements: Compute, storage, API costs

3. DATA SOURCES:
   - List of all data sources needed
   - Access requirements (API keys, subscriptions)
   - Cost estimates

Return JSON with: active_monitors[], monitoring_config{}, data_sources[]"""

        context = f"""Signal Definitions: {state.signal_definitions[:5]}
Signal Taxonomy: {state.signal_taxonomy}
Industries: {state.industry_focus}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.active_monitors = result.get("active_monitors", [])
            state.monitoring_config = result.get("monitoring_config", {})
            state.data_sources = result.get("data_sources", [])

            logger.info(
                "foresight_monitoring_setup",
                mission_id=state.mission_id,
                monitor_count=len(state.active_monitors),
            )

        except Exception as e:
            logger.error(f"Monitoring setup failed: {e}")
            state.error = f"Monitoring setup failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "monitoring_setup", "monitor_count": len(state.active_monitors)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 13: ProbabilityEstimator
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _probability_estimator_node(self, state: ForesightState) -> ForesightState:
        """
        ProbabilityEstimator: Estimate disruption probabilities.

        Output: Probability scores with confidence intervals
        """
        logger.info(f"Estimating probabilities: {state.mission_id}")

        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 13 if self.workflow_mode == "full" else 3

        prompt = """You are a probability analyst estimating disruption likelihoods.

Estimate probabilities for each disruption scenario:

1. PROBABILITY SCORES (per scenario/disruption):
   - entity_id: Scenario or disruption ID
   - entity_name: Name
   - probability: 0.0 to 1.0
   - confidence: low | medium | high
   - methodology: How estimated (expert | historical | model | delphi)
   - time_horizon: When this probability applies
   - key_assumptions: What must be true

2. CONFIDENCE INTERVALS:
   - entity_id: Maps to above
   - lower_bound: 5th percentile
   - point_estimate: 50th percentile
   - upper_bound: 95th percentile
   - distribution_type: normal | beta | triangular

3. BAYESIAN PRIORS:
   - Base rates for similar disruptions
   - Evidence updates
   - Posterior probabilities

Return JSON with: probability_scores{}, confidence_intervals{}, bayesian_priors{}"""

        context = f"""Scenario Narratives: {state.scenario_narratives[:2] if state.scenario_narratives else 'None'}
Disruption Scores: {state.disruption_scores[:3] if state.disruption_scores else 'None'}
Signal Definitions: {state.signal_definitions[:3]}
Time Horizon: {state.time_horizon}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.probability_scores = result.get("probability_scores", {})
            state.confidence_intervals = result.get("confidence_intervals", {})
            state.bayesian_priors = result.get("bayesian_priors", {})

            logger.info(
                "foresight_probabilities_estimated",
                mission_id=state.mission_id,
                probability_count=len(state.probability_scores),
            )

        except Exception as e:
            logger.error(f"Probability estimation failed: {e}")
            state.error = f"Probability estimation failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "probability_estimation", "count": len(state.probability_scores)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 14: ThresholdManager
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _threshold_manager_node(self, state: ForesightState) -> ForesightState:
        """
        ThresholdManager: Manage alert thresholds.

        Output: Threshold configuration with escalation levels
        """
        logger.info(f"Managing thresholds: {state.mission_id}")

        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 14 if self.workflow_mode == "full" else 4

        prompt = """You are an alert systems engineer configuring thresholds.

Configure alert thresholds for disruption monitoring:

1. THRESHOLD CONFIG:
   - methodology: How thresholds are set (static | dynamic | adaptive)
   - review_frequency: How often thresholds are reviewed
   - auto_adjustment: Whether thresholds self-adjust
   - noise_filtering: How false positives are reduced

2. ALERT THRESHOLDS (per signal/metric):
   - threshold_id: Unique identifier
   - signal_id: Which signal
   - metric_name: What's being measured
   - baseline_value: Normal value
   - warning_threshold: Yellow alert level
   - critical_threshold: Red alert level
   - direction: above | below | deviation
   - cooldown_period: Time before re-alerting
   - suppression_rules: When to suppress alerts

3. ESCALATION LEVELS:
   - Level names and definitions
   - Who gets notified at each level
   - Required response times
   - Escalation criteria

Return JSON with: threshold_config{}, alert_thresholds[], escalation_levels[]"""

        context = f"""Active Monitors: {state.active_monitors[:3]}
Probability Scores: {state.probability_scores}
Signal Definitions: {state.signal_definitions[:3]}
Risk Category: {state.risk_category}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.threshold_config = result.get("threshold_config", {})
            state.alert_thresholds = result.get("alert_thresholds", [])
            state.escalation_levels = result.get("escalation_levels", [])

            logger.info(
                "foresight_thresholds_configured",
                mission_id=state.mission_id,
                threshold_count=len(state.alert_thresholds),
            )

        except Exception as e:
            logger.error(f"Threshold management failed: {e}")
            state.error = f"Threshold management failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "threshold_management", "threshold_count": len(state.alert_thresholds)},
            mission_id=state.mission_id,
        )
        return state

    # -------------------------------------------------------------------------
    # Runner 15: AlertGenerator
    # -------------------------------------------------------------------------
    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _alert_generator_node(self, state: ForesightState) -> ForesightState:
        """
        AlertGenerator: Generate alerts based on current state.

        Output: Alert stream with current warnings
        """
        logger.info(f"Generating alerts: {state.mission_id}")

        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 15 if self.workflow_mode == "full" else 5

        prompt = """You are an alert generation system producing disruption warnings.

Based on the analysis, generate current alerts:

1. ALERTS (simulated current alerts):
   - alert_id: Unique identifier
   - alert_type: info | warning | critical | emergency
   - signal_id: Which signal triggered
   - title: Alert headline
   - description: What's happening
   - severity: 1-5 scale
   - timestamp: When detected
   - affected_areas: Business areas impacted
   - recommended_actions: What to do
   - expiry: When alert expires if not addressed

2. ALERT STREAM:
   - Current active alerts
   - Recently resolved alerts
   - Pending alerts (not yet triggered but close)

3. ALERT SUMMARY:
   - total_active: Count of active alerts
   - by_severity: Breakdown by severity
   - top_concerns: Top 3 issues requiring attention
   - trend: increasing | stable | decreasing
   - overall_risk_level: low | moderate | elevated | high | critical

Return JSON with: alerts[], alert_stream[], alert_summary{}"""

        context = f"""Alert Thresholds: {state.alert_thresholds[:3]}
Probability Scores: {state.probability_scores}
Overall Disruption Risk: {state.overall_disruption_risk}
Signal Definitions: {state.signal_definitions[:3]}
Scenario Narratives: {state.scenario_narratives[:1] if state.scenario_narratives else 'None'}"""

        try:
            response = await invoke_llm_with_timeout(
                self.llm,
                [SystemMessage(content=prompt), HumanMessage(content=context)],
                timeout=45,
            )

            result = self._parse_json_output(response.content)
            state.alerts = result.get("alerts", [])
            state.alert_stream = result.get("alert_stream", [])
            state.alert_summary = result.get("alert_summary", {})

            # Update early warning readiness score
            has_alerts = bool(state.alerts)
            has_thresholds = bool(state.alert_thresholds)
            has_monitors = bool(state.active_monitors)
            state.early_warning_readiness = (
                0.4 * (1.0 if has_monitors else 0.0) +
                0.3 * (1.0 if has_thresholds else 0.0) +
                0.3 * (1.0 if has_alerts else 0.0)
            )

            logger.info(
                "foresight_alerts_generated",
                mission_id=state.mission_id,
                alert_count=len(state.alerts),
            )

        except Exception as e:
            logger.error(f"Alert generation failed: {e}")
            state.error = f"Alert generation failed: {str(e)}"
            raise

        self._emit_sse_event(
            SSEEventType.PHASE_COMPLETE,
            {"phase": "alert_generation", "alert_count": len(state.alerts)},
            mission_id=state.mission_id,
        )
        return state

    # =========================================================================
    # Quality Gate
    # =========================================================================

    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _quality_gate_node(self, state: ForesightState) -> ForesightState:
        """Final quality assessment for foresight output."""
        logger.info(f"Quality gate: {state.mission_id}")

        state.phase = ExecutionPhase.QUALITY_CHECK
        state.completed_at = datetime.utcnow()

        # Calculate overall quality based on workflow mode
        quality_components = []

        if self.workflow_mode in ("portfolio_foresight", "full"):
            quality_components.extend([
                state.signal_quality_score,
                state.assessment_confidence,
                state.recommendation_strength,
            ])

        if self.workflow_mode in ("scenario_development", "full"):
            quality_components.append(state.scenario_quality_score)

        if self.workflow_mode in ("disruption_early_warning", "full"):
            quality_components.append(state.early_warning_readiness)

        state.quality_score = sum(quality_components) / max(len(quality_components), 1)

        # Determine completed steps based on workflow mode
        if self.workflow_mode == "full":
            state.completed_steps = 15
        elif self.workflow_mode in ("portfolio_foresight", "scenario_development", "disruption_early_warning"):
            state.completed_steps = 5

        # Determine if HITL review needed
        hitl_required = (
            state.overall_disruption_risk > 75 or  # High risk
            state.quality_score < 0.6 or  # Low quality
            state.risk_category == "critical" or
            state.total_recommended_investment > 10_000_000 or  # Large investment
            len(state.alerts) > 5  # Many alerts
        )

        if hitl_required and self.hitl_enabled:
            state.hitl_required = True
            reasons = []
            if state.overall_disruption_risk > 75:
                reasons.append(f"High disruption risk ({state.overall_disruption_risk})")
            if state.total_recommended_investment > 10_000_000:
                reasons.append(f"Large investment (${state.total_recommended_investment:,.0f})")
            if len(state.alerts) > 5:
                reasons.append(f"Multiple alerts ({len(state.alerts)})")
            state.hitl_reason = "; ".join(reasons) if reasons else "Quality threshold not met"

            self._emit_sse_event(
                SSEEventType.HITL_REQUIRED,
                {
                    "mission_id": state.mission_id,
                    "reason": state.hitl_reason,
                    "risk_category": state.risk_category,
                    "workflow_mode": self.workflow_mode,
                },
                mission_id=state.mission_id,
            )

        state.status = "completed"

        self._emit_sse_event(
            SSEEventType.MISSION_COMPLETE,
            {
                "mission_id": state.mission_id,
                "quality_score": state.quality_score,
                "workflow_mode": self.workflow_mode,
                "completed_steps": state.completed_steps,
                "overall_risk": state.overall_disruption_risk,
                "total_investment": state.total_recommended_investment,
                "alert_count": len(state.alerts),
            },
            mission_id=state.mission_id,
        )

        return state

    def _route_after_quality(self, state: ForesightState) -> str:
        """Route after quality gate."""
        if state.hitl_required:
            return "hitl_required"
        return "complete"

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _parse_json_output(self, content: str) -> Dict[str, Any]:
        """Parse JSON from LLM response."""
        import json
        try:
            # Handle markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON, returning empty dict")
            return {}

    def _emit_phase_event(
        self,
        event_type: SSEEventType,
        state: ForesightState,
        **kwargs: Any,
    ) -> None:
        """Emit phase-related SSE event."""
        self._emit_sse_event(
            event_type,
            {"mission_id": state.mission_id, **kwargs},
            mission_id=state.mission_id,
        )


# =============================================================================
# Exports
# =============================================================================

__all__ = [
    "ForesightRunner",
    "ForesightState",
]
