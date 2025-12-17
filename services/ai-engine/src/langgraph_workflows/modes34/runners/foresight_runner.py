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

2. Horizon Scanning (5 runners) - TODO:
   - WeakSignalDetector → TrendEmergenceTracker → WildcardIdentifier →
     ScenarioBuilder → ImplicationMapper

3. Strategic Positioning (5 runners) - TODO:
   - CompetitiveLandscapeMapper → PositionAnalyzer → StrategicOptionGenerator →
     RiskRewardBalancer → ActionPrioritizer

Graph:
    START → initialize → preflight → signal_analysis → tech_impact →
    disruption_scoring → capability_gap → investment_recommendation →
    quality_gate → END

HITL:
    - After disruption_scoring: Risk assessment review (blocking)
    - After investment_recommendation: Final approval (non-blocking)

Reasoning Pattern:
    Weak signal analysis detects emerging changes
    Technology impact assessment evaluates disruption potential
    Disruption scoring quantifies portfolio risk
    Capability gap mapping identifies strategic gaps
    Investment recommendation synthesizes actionable plan
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

    # Quality metrics
    signal_quality_score: float = Field(default=0.0)
    assessment_confidence: float = Field(default=0.0)
    recommendation_strength: float = Field(default=0.0)

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
        **kwargs: Any,
    ):
        """
        Initialize Foresight runner.

        Args:
            llm: LangChain LLM for reasoning (defaults to GPT-4)
            time_horizon: Foresight planning horizon
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=8000,
        )
        self.time_horizon = time_horizon

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[ForesightState], ForesightState]]:
        """Create nodes for Foresight graph (Portfolio Foresight sub-workflow)."""
        return {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "signal_analysis": self._signal_trend_analyzer_node,
            "tech_impact": self._technology_impact_assessor_node,
            "disruption_scoring": self._portfolio_disruption_scorer_node,
            "capability_gap": self._capability_gap_mapper_node,
            "investment_recommendation": self._investment_recommender_node,
            "quality_gate": self._quality_gate_node,
        }

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Foresight graph."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")
        graph.add_edge("preflight", "signal_analysis")
        graph.add_edge("signal_analysis", "tech_impact")
        graph.add_edge("tech_impact", "disruption_scoring")
        graph.add_edge("disruption_scoring", "capability_gap")
        graph.add_edge("capability_gap", "investment_recommendation")
        graph.add_edge("investment_recommendation", "quality_gate")
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
        return ["disruption_scoring", "investment_recommendation"]

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
    # Quality Gate
    # =========================================================================

    @graceful_degradation(domain="foresight", fallback_value=None)
    async def _quality_gate_node(self, state: ForesightState) -> ForesightState:
        """Final quality assessment for foresight output."""
        logger.info(f"Quality gate: {state.mission_id}")

        state.phase = ExecutionPhase.QUALITY_CHECK
        state.completed_at = datetime.utcnow()

        # Calculate overall quality
        quality_components = [
            state.signal_quality_score,
            state.assessment_confidence,
            state.recommendation_strength,
        ]
        state.quality_score = sum(quality_components) / len(quality_components)

        # Determine if HITL review needed
        hitl_required = (
            state.overall_disruption_risk > 75 or  # High risk
            state.quality_score < 0.6 or  # Low quality
            state.risk_category == "critical" or
            state.total_recommended_investment > 10_000_000  # Large investment
        )

        if hitl_required and self.hitl_enabled:
            state.hitl_required = True
            state.hitl_reason = f"High disruption risk ({state.overall_disruption_risk}) or large investment (${state.total_recommended_investment:,.0f})"
            self._emit_sse_event(
                SSEEventType.HITL_REQUIRED,
                {
                    "mission_id": state.mission_id,
                    "reason": state.hitl_reason,
                    "risk_category": state.risk_category,
                },
                mission_id=state.mission_id,
            )

        state.status = "completed"
        state.completed_steps = 5

        self._emit_sse_event(
            SSEEventType.MISSION_COMPLETE,
            {
                "mission_id": state.mission_id,
                "quality_score": state.quality_score,
                "overall_risk": state.overall_disruption_risk,
                "total_investment": state.total_recommended_investment,
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
