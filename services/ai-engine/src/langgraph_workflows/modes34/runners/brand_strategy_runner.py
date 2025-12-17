#!/usr/bin/env python
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, langchain_openai, pydantic]
"""
Brand Strategy Runner - Brand Planning, Positioning, and Portfolio Management

Implements the BRAND_STRATEGY family with 22 runners across 3 sub-workflows:

1. Brand Plan Development - The 10 Ps (10 runners):
   - MarketDiagnostician → StrategicObjectiveSetter → ProductPositioner →
     PriceStrategist → PlaceChannelDesigner → PromotionPlanner →
     PeopleCapabilityAssessor → PackagingOptimizer → PartnerEvaluator → PlanValidator

2. Positioning Strategy (6 runners):
   - CompetitivePositionAnalyzer → WhitespaceIdentifier → ConceptGenerator →
     EvidenceMapper → KOLPositionValidator → PositioningFinalizer

3. Portfolio Architecture (6 runners):
   - OverlapAnalyzer → CannibalizationModeler → ArchitectureGenerator →
     ValueOptimizer → MigrationPlanner → SequencingStrategist

Workflow Modes:
    - "brand_plan_10ps": Run Brand Plan Development (10 runners)
    - "positioning_strategy": Run Positioning Strategy (6 runners)
    - "portfolio_architecture": Run Portfolio Architecture (6 runners)
    - "full": Run all 22 runners in sequence

Graph (Full Mode):
    START → initialize → preflight →
    [10 Ps] market_diagnosis → objectives → positioning → pricing →
            channels → promotion → people → packaging → partners → plan_validation →
    [Positioning] competitive_analysis → whitespace → concepts →
                  evidence → kol_validation → finalization →
    [Portfolio] overlap_analysis → cannibalization → architecture →
                value_optimization → migration → sequencing →
    quality_gate → END

HITL:
    - After plan_validation: Brand plan review (blocking)
    - After finalization: Positioning approval (blocking)
    - After sequencing: Portfolio strategy approval (non-blocking)
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
# Brand Strategy State
# =============================================================================

class BrandStrategyState(BaseFamilyState):
    """
    State for the Brand Strategy runner.

    Extends BaseFamilyState with brand strategy-specific fields for
    brand planning, positioning, and portfolio management.
    """
    # Configuration
    brand_name: str = Field(default="", description="Brand being planned")
    product_category: str = Field(default="", description="Product category")
    target_market: str = Field(default="", description="Target market segment")
    therapeutic_area: str = Field(default="", description="Therapeutic area (pharma)")
    planning_horizon: str = Field(default="3 years", description="Planning time horizon")

    # ==========================================================================
    # Brand Plan Development - 10 Ps outputs (Sub-workflow 1)
    # ==========================================================================
    # Market Diagnosis outputs
    market_assessment: Dict[str, Any] = Field(default_factory=dict)
    market_dynamics: List[Dict[str, Any]] = Field(default_factory=list)
    market_size: Dict[str, float] = Field(default_factory=dict)
    competitive_landscape: List[Dict[str, Any]] = Field(default_factory=list)

    # Strategic Objectives outputs
    strategic_objectives: List[Dict[str, Any]] = Field(default_factory=list)
    kpis: List[Dict[str, Any]] = Field(default_factory=list)
    success_metrics: Dict[str, Any] = Field(default_factory=dict)

    # Product Positioning outputs
    positioning_statement: str = Field(default="")
    value_proposition: str = Field(default="")
    differentiators: List[str] = Field(default_factory=list)
    target_audience: Dict[str, Any] = Field(default_factory=dict)

    # Pricing Strategy outputs
    price_strategy: Dict[str, Any] = Field(default_factory=dict)
    pricing_model: str = Field(default="")
    price_points: List[Dict[str, Any]] = Field(default_factory=list)
    margin_analysis: Dict[str, float] = Field(default_factory=dict)

    # Channel Strategy outputs
    channel_strategy: Dict[str, Any] = Field(default_factory=dict)
    distribution_channels: List[Dict[str, Any]] = Field(default_factory=list)
    channel_partners: List[str] = Field(default_factory=list)

    # Promotion Plan outputs
    promotion_plan: Dict[str, Any] = Field(default_factory=dict)
    campaign_strategies: List[Dict[str, Any]] = Field(default_factory=list)
    media_mix: Dict[str, float] = Field(default_factory=dict)
    messaging_framework: Dict[str, Any] = Field(default_factory=dict)

    # People Capability outputs
    capability_plan: Dict[str, Any] = Field(default_factory=dict)
    skill_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    training_needs: List[str] = Field(default_factory=list)
    org_recommendations: List[str] = Field(default_factory=list)

    # Packaging outputs
    packaging_spec: Dict[str, Any] = Field(default_factory=dict)
    packaging_options: List[Dict[str, Any]] = Field(default_factory=list)
    packaging_costs: Dict[str, float] = Field(default_factory=dict)

    # Partner Evaluation outputs
    partner_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    partnership_criteria: List[str] = Field(default_factory=list)
    partner_scores: Dict[str, float] = Field(default_factory=dict)

    # Plan Validation outputs
    validated_plan: Dict[str, Any] = Field(default_factory=dict)
    plan_risks: List[Dict[str, Any]] = Field(default_factory=list)
    plan_score: float = Field(default=0.0)
    validation_issues: List[str] = Field(default_factory=list)

    # ==========================================================================
    # Positioning Strategy outputs (Sub-workflow 2)
    # ==========================================================================
    # Competitive Position outputs
    position_map: Dict[str, Any] = Field(default_factory=dict)
    competitor_positions: List[Dict[str, Any]] = Field(default_factory=list)
    position_gaps: List[Dict[str, Any]] = Field(default_factory=list)

    # Whitespace outputs
    whitespace_opportunities: List[Dict[str, Any]] = Field(default_factory=list)
    opportunity_scores: Dict[str, float] = Field(default_factory=dict)

    # Concept Generation outputs
    concept_options: List[Dict[str, Any]] = Field(default_factory=list)
    concept_evaluation: Dict[str, Any] = Field(default_factory=dict)
    winning_concepts: List[str] = Field(default_factory=list)

    # Evidence Mapping outputs
    evidence_matrix: Dict[str, Any] = Field(default_factory=dict)
    clinical_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    market_evidence: List[Dict[str, Any]] = Field(default_factory=list)

    # KOL Validation outputs
    kol_feedback: List[Dict[str, Any]] = Field(default_factory=list)
    kol_recommendations: List[str] = Field(default_factory=list)
    kol_concerns: List[str] = Field(default_factory=list)

    # Final Positioning outputs
    final_positioning: Dict[str, Any] = Field(default_factory=dict)
    positioning_rationale: str = Field(default="")
    positioning_artifacts: List[str] = Field(default_factory=list)

    # ==========================================================================
    # Portfolio Architecture outputs (Sub-workflow 3)
    # ==========================================================================
    # Overlap Analysis outputs
    overlap_map: Dict[str, Any] = Field(default_factory=dict)
    overlap_areas: List[Dict[str, Any]] = Field(default_factory=list)
    overlap_severity: Dict[str, str] = Field(default_factory=dict)

    # Cannibalization outputs
    cannibalization_risk: Dict[str, Any] = Field(default_factory=dict)
    cannibalization_scenarios: List[Dict[str, Any]] = Field(default_factory=list)
    revenue_impact: Dict[str, float] = Field(default_factory=dict)

    # Architecture outputs
    architecture_options: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_architecture: Dict[str, Any] = Field(default_factory=dict)
    architecture_rationale: str = Field(default="")

    # Value Optimization outputs
    optimized_portfolio: Dict[str, Any] = Field(default_factory=dict)
    value_drivers: List[Dict[str, Any]] = Field(default_factory=list)
    optimization_gains: Dict[str, float] = Field(default_factory=dict)

    # Migration Planning outputs
    migration_plan: Dict[str, Any] = Field(default_factory=dict)
    migration_phases: List[Dict[str, Any]] = Field(default_factory=list)
    migration_risks: List[Dict[str, Any]] = Field(default_factory=list)

    # Sequencing outputs
    launch_sequence: List[Dict[str, Any]] = Field(default_factory=list)
    sequencing_rationale: str = Field(default="")
    timeline: Dict[str, Any] = Field(default_factory=dict)

    # ==========================================================================
    # Quality metrics and configuration
    # ==========================================================================
    brand_plan_quality: float = Field(default=0.0)
    positioning_strength: float = Field(default=0.0)
    portfolio_coherence: float = Field(default=0.0)

    # Workflow mode
    workflow_mode: str = Field(default="full", description="brand_plan_10ps | positioning_strategy | portfolio_architecture | full")

    # Mode 4 constraints
    mode_4_constraints: Optional[Dict[str, Any]] = Field(default=None)


# =============================================================================
# Brand Strategy Runner
# =============================================================================

@register_family_runner(FamilyType.BRAND_STRATEGY)
class BrandStrategyRunner(BaseFamilyRunner[BrandStrategyState]):
    """
    Brand Strategy runner implementing brand planning, positioning, and portfolio management.

    This runner supports 3 sub-workflows with 22 total runners:
    1. Brand Plan Development (10 Ps) - 10 runners
    2. Positioning Strategy - 6 runners
    3. Portfolio Architecture - 6 runners

    Workflow modes allow running individual sub-workflows or all 22 runners.
    """

    family = FamilyType.BRAND_STRATEGY
    state_class = BrandStrategyState

    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        planning_horizon: str = "3 years",
        workflow_mode: str = "full",
        **kwargs: Any,
    ):
        """
        Initialize Brand Strategy runner.

        Args:
            llm: LangChain LLM for reasoning (defaults to GPT-4)
            planning_horizon: Brand planning horizon
            workflow_mode: Which sub-workflow(s) to run
            **kwargs: Passed to BaseFamilyRunner
        """
        super().__init__(**kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=8000,
        )
        self.planning_horizon = planning_horizon
        self.workflow_mode = workflow_mode

    # =========================================================================
    # Abstract Method Implementations
    # =========================================================================

    def _create_nodes(self) -> Dict[str, Callable[[BrandStrategyState], BrandStrategyState]]:
        """Create nodes for Brand Strategy graph (all 22 runners)."""
        nodes = {
            "initialize": self._initialize_node,
            "preflight": self._preflight_validation_node,
            "quality_gate": self._quality_gate_node,
        }

        # Brand Plan Development - 10 Ps (10 runners)
        if self.workflow_mode in ("brand_plan_10ps", "full"):
            nodes.update({
                "market_diagnosis": self._market_diagnostician_node,
                "objectives": self._strategic_objective_setter_node,
                "positioning": self._product_positioner_node,
                "pricing": self._price_strategist_node,
                "channels": self._place_channel_designer_node,
                "promotion": self._promotion_planner_node,
                "people": self._people_capability_assessor_node,
                "packaging": self._packaging_optimizer_node,
                "partners": self._partner_evaluator_node,
                "plan_validation": self._plan_validator_node,
            })

        # Positioning Strategy (6 runners)
        if self.workflow_mode in ("positioning_strategy", "full"):
            nodes.update({
                "competitive_analysis": self._competitive_position_analyzer_node,
                "whitespace": self._whitespace_identifier_node,
                "concepts": self._concept_generator_node,
                "evidence": self._evidence_mapper_node,
                "kol_validation": self._kol_position_validator_node,
                "finalization": self._positioning_finalizer_node,
            })

        # Portfolio Architecture (6 runners)
        if self.workflow_mode in ("portfolio_architecture", "full"):
            nodes.update({
                "overlap_analysis": self._overlap_analyzer_node,
                "cannibalization": self._cannibalization_modeler_node,
                "architecture": self._architecture_generator_node,
                "value_optimization": self._value_optimizer_node,
                "migration": self._migration_planner_node,
                "sequencing": self._sequencing_strategist_node,
            })

        return nodes

    def _define_edges(self, graph: StateGraph) -> StateGraph:
        """Define edges for Brand Strategy graph based on workflow mode."""
        graph.add_edge(START, "initialize")
        graph.add_edge("initialize", "preflight")

        if self.workflow_mode == "brand_plan_10ps":
            # Brand Plan Development only (10 runners)
            graph.add_edge("preflight", "market_diagnosis")
            graph.add_edge("market_diagnosis", "objectives")
            graph.add_edge("objectives", "positioning")
            graph.add_edge("positioning", "pricing")
            graph.add_edge("pricing", "channels")
            graph.add_edge("channels", "promotion")
            graph.add_edge("promotion", "people")
            graph.add_edge("people", "packaging")
            graph.add_edge("packaging", "partners")
            graph.add_edge("partners", "plan_validation")
            graph.add_edge("plan_validation", "quality_gate")

        elif self.workflow_mode == "positioning_strategy":
            # Positioning Strategy only (6 runners)
            graph.add_edge("preflight", "competitive_analysis")
            graph.add_edge("competitive_analysis", "whitespace")
            graph.add_edge("whitespace", "concepts")
            graph.add_edge("concepts", "evidence")
            graph.add_edge("evidence", "kol_validation")
            graph.add_edge("kol_validation", "finalization")
            graph.add_edge("finalization", "quality_gate")

        elif self.workflow_mode == "portfolio_architecture":
            # Portfolio Architecture only (6 runners)
            graph.add_edge("preflight", "overlap_analysis")
            graph.add_edge("overlap_analysis", "cannibalization")
            graph.add_edge("cannibalization", "architecture")
            graph.add_edge("architecture", "value_optimization")
            graph.add_edge("value_optimization", "migration")
            graph.add_edge("migration", "sequencing")
            graph.add_edge("sequencing", "quality_gate")

        else:  # "full" mode - all 22 runners
            # Brand Plan Development (10 runners)
            graph.add_edge("preflight", "market_diagnosis")
            graph.add_edge("market_diagnosis", "objectives")
            graph.add_edge("objectives", "positioning")
            graph.add_edge("positioning", "pricing")
            graph.add_edge("pricing", "channels")
            graph.add_edge("channels", "promotion")
            graph.add_edge("promotion", "people")
            graph.add_edge("people", "packaging")
            graph.add_edge("packaging", "partners")
            graph.add_edge("partners", "plan_validation")
            # Positioning Strategy (6 runners)
            graph.add_edge("plan_validation", "competitive_analysis")
            graph.add_edge("competitive_analysis", "whitespace")
            graph.add_edge("whitespace", "concepts")
            graph.add_edge("concepts", "evidence")
            graph.add_edge("evidence", "kol_validation")
            graph.add_edge("kol_validation", "finalization")
            # Portfolio Architecture (6 runners)
            graph.add_edge("finalization", "overlap_analysis")
            graph.add_edge("overlap_analysis", "cannibalization")
            graph.add_edge("cannibalization", "architecture")
            graph.add_edge("architecture", "value_optimization")
            graph.add_edge("value_optimization", "migration")
            graph.add_edge("migration", "sequencing")
            graph.add_edge("sequencing", "quality_gate")

        graph.add_conditional_edges(
            "quality_gate",
            self._route_after_quality,
            {"complete": END, "hitl_required": END}
        )
        return graph

    def _get_interrupt_nodes(self) -> List[str]:
        """Nodes that can trigger HITL checkpoints."""
        hitl_nodes = []
        if self.workflow_mode in ("brand_plan_10ps", "full"):
            hitl_nodes.append("plan_validation")
        if self.workflow_mode in ("positioning_strategy", "full"):
            hitl_nodes.append("finalization")
        if self.workflow_mode in ("portfolio_architecture", "full"):
            hitl_nodes.append("sequencing")
        return hitl_nodes

    # =========================================================================
    # Common Node Implementations
    # =========================================================================

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _initialize_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Initialize brand strategy state."""
        logger.info(f"Initializing brand strategy: {state.mission_id}")
        state.phase = ExecutionPhase.INITIALIZE
        state.started_at = datetime.utcnow()
        state.planning_horizon = self.planning_horizon
        state.workflow_mode = self.workflow_mode

        # Set total steps based on workflow mode
        if self.workflow_mode == "full":
            state.total_steps = 22
        elif self.workflow_mode == "brand_plan_10ps":
            state.total_steps = 10
        elif self.workflow_mode == "positioning_strategy":
            state.total_steps = 6
        elif self.workflow_mode == "portfolio_architecture":
            state.total_steps = 6

        self._emit_phase_event(SSEEventType.PHASE_START, state, phase="initialize")
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _preflight_validation_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Validate inputs before execution."""
        logger.info(f"Preflight validation: {state.mission_id}")
        errors = []

        if not state.tenant_id:
            errors.append("tenant_id_missing")
        if not state.goal and not state.query and not state.brand_name:
            errors.append("goal_or_brand_name_missing")

        if state.mode_4_constraints:
            wall_time = state.mode_4_constraints.get("max_wall_time_minutes")
            if wall_time and wall_time > 90:
                errors.append("wall_time_exceeds_limit_90min")

        if errors:
            state.error = ";".join(errors)
            self._emit_sse_event(SSEEventType.MISSION_FAILED, {"mission_id": state.mission_id, "errors": errors}, mission_id=state.mission_id)
            raise ValidationError(message=state.error)

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "preflight", "status": "passed"}, mission_id=state.mission_id)
        return state

    # =========================================================================
    # Brand Plan Development - 10 Ps (10 runners)
    # =========================================================================

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _market_diagnostician_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 1: MarketDiagnostician - Diagnose market dynamics."""
        logger.info(f"Market diagnosis: {state.mission_id}")
        state.phase = ExecutionPhase.GATHER
        state.current_step = 1

        prompt = """You are a market analyst diagnosing market dynamics for brand planning.

Analyze the market environment:

1. MARKET ASSESSMENT:
   - market_size: Total addressable market ($)
   - growth_rate: Annual growth rate (%)
   - maturity_stage: emerging | growing | mature | declining
   - key_trends: Major market trends
   - regulatory_environment: Key regulations
   - entry_barriers: Barriers to entry

2. MARKET DYNAMICS:
   - drivers: Forces driving market growth
   - inhibitors: Forces inhibiting growth
   - disruptions: Potential disruptive forces
   - seasonality: Seasonal patterns

3. COMPETITIVE LANDSCAPE:
   - market_leaders: Top competitors with share
   - challenger_brands: Rising competitors
   - competitive_intensity: low | moderate | high | intense
   - competitive_dynamics: How competitors behave

Return JSON with: market_assessment{}, market_dynamics[], market_size{}, competitive_landscape[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Product Category: {state.product_category}
Target Market: {state.target_market}
Therapeutic Area: {state.therapeutic_area}
Planning Horizon: {state.planning_horizon}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.market_assessment = result.get("market_assessment", {})
            state.market_dynamics = result.get("market_dynamics", [])
            state.market_size = result.get("market_size", {})
            state.competitive_landscape = result.get("competitive_landscape", [])
            logger.info("brand_market_diagnosed", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Market diagnosis failed: {e}")
            state.error = f"Market diagnosis failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "market_diagnosis"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _strategic_objective_setter_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 2: StrategicObjectiveSetter - Set strategic objectives."""
        logger.info(f"Setting objectives: {state.mission_id}")
        state.phase = ExecutionPhase.PLAN
        state.current_step = 2

        prompt = """You are a strategy consultant setting brand objectives.

Define strategic objectives:

1. STRATEGIC OBJECTIVES:
   - objective_id: Unique identifier
   - objective: Clear objective statement
   - type: growth | share | awareness | loyalty | profitability
   - target: Quantified target
   - timeline: Achievement timeline
   - rationale: Why this objective

2. KPIS:
   - kpi_name: Name of KPI
   - current_value: Current performance
   - target_value: Target performance
   - measurement_frequency: How often measured

3. SUCCESS METRICS:
   - leading_indicators: Early success signals
   - lagging_indicators: Outcome measures
   - health_metrics: Brand health measures

Return JSON with: strategic_objectives[], kpis[], success_metrics{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Market Assessment: {state.market_assessment}
Market Size: {state.market_size}
Planning Horizon: {state.planning_horizon}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.strategic_objectives = result.get("strategic_objectives", [])
            state.kpis = result.get("kpis", [])
            state.success_metrics = result.get("success_metrics", {})
            logger.info("brand_objectives_set", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Objective setting failed: {e}")
            state.error = f"Objective setting failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "objectives"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _product_positioner_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 3: ProductPositioner - Position product."""
        logger.info(f"Product positioning: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 3

        prompt = """You are a brand strategist developing product positioning.

Create positioning:

1. POSITIONING STATEMENT:
   - Format: "For [target], [brand] is the [category] that [key benefit] because [reason to believe]"
   - Make it memorable, differentiated, and defensible

2. VALUE PROPOSITION:
   - Core value delivered to customers
   - Unique benefits
   - Emotional and functional benefits

3. DIFFERENTIATORS:
   - Key points of differentiation
   - Sustainable advantages
   - Proof points

4. TARGET AUDIENCE:
   - Primary target: Demographics, psychographics
   - Secondary target: Adjacent segments
   - Influencers: Who influences purchase

Return JSON with: positioning_statement, value_proposition, differentiators[], target_audience{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Strategic Objectives: {state.strategic_objectives[:3]}
Competitive Landscape: {state.competitive_landscape[:3]}
Market Dynamics: {state.market_dynamics}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.positioning_statement = result.get("positioning_statement", "")
            state.value_proposition = result.get("value_proposition", "")
            state.differentiators = result.get("differentiators", [])
            state.target_audience = result.get("target_audience", {})
            logger.info("brand_positioned", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Product positioning failed: {e}")
            state.error = f"Product positioning failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "positioning"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _price_strategist_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 4: PriceStrategist - Develop pricing strategy."""
        logger.info(f"Pricing strategy: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 4

        prompt = """You are a pricing strategist developing price strategy.

Develop pricing:

1. PRICE STRATEGY:
   - strategy_type: premium | value | penetration | skimming | competitive
   - rationale: Why this strategy
   - price_positioning: How price supports brand positioning
   - price_elasticity: Estimated elasticity

2. PRICING MODEL:
   - model_type: fixed | tiered | subscription | dynamic | value_based
   - model_rationale: Why this model

3. PRICE POINTS:
   - sku_name: Product/SKU name
   - list_price: Recommended list price
   - expected_street_price: Actual selling price
   - price_vs_competitors: premium | parity | discount
   - margin: Expected margin %

4. MARGIN ANALYSIS:
   - gross_margin: Overall gross margin
   - contribution_margin: Contribution margin
   - break_even_volume: Volume needed to break even

Return JSON with: price_strategy{}, pricing_model, price_points[], margin_analysis{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Positioning: {state.positioning_statement}
Value Proposition: {state.value_proposition}
Target Audience: {state.target_audience}
Competitive Landscape: {state.competitive_landscape[:3]}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.price_strategy = result.get("price_strategy", {})
            state.pricing_model = result.get("pricing_model", "")
            state.price_points = result.get("price_points", [])
            state.margin_analysis = result.get("margin_analysis", {})
            logger.info("brand_pricing_developed", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Pricing strategy failed: {e}")
            state.error = f"Pricing strategy failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "pricing"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _place_channel_designer_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 5: PlaceChannelDesigner - Design channel strategy."""
        logger.info(f"Channel design: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 5

        prompt = """You are a channel strategist designing distribution.

Design channels:

1. CHANNEL STRATEGY:
   - strategy_type: direct | indirect | hybrid | omnichannel
   - coverage_target: intensive | selective | exclusive
   - channel_priority: Primary vs secondary channels
   - digital_vs_physical: Mix of digital and physical

2. DISTRIBUTION CHANNELS:
   - channel_name: Name of channel
   - channel_type: retail | wholesale | direct | e-commerce | specialty
   - role: awareness | conversion | fulfillment | service
   - volume_share: Expected % of volume
   - margin_structure: Typical margins
   - key_accounts: Top accounts in channel

3. CHANNEL PARTNERS:
   - List of key channel partners
   - Partner criteria
   - Partner incentives

Return JSON with: channel_strategy{}, distribution_channels[], channel_partners[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Target Audience: {state.target_audience}
Pricing Strategy: {state.price_strategy}
Market Assessment: {state.market_assessment}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.channel_strategy = result.get("channel_strategy", {})
            state.distribution_channels = result.get("distribution_channels", [])
            state.channel_partners = result.get("channel_partners", [])
            logger.info("brand_channels_designed", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Channel design failed: {e}")
            state.error = f"Channel design failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "channels"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _promotion_planner_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 6: PromotionPlanner - Plan promotion strategy."""
        logger.info(f"Promotion planning: {state.mission_id}")
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 6

        prompt = """You are a marketing strategist planning promotion.

Plan promotion:

1. PROMOTION PLAN:
   - objectives: Communication objectives
   - budget: Total promotion budget
   - budget_allocation: By activity type
   - timeline: Key milestones

2. CAMPAIGN STRATEGIES:
   - campaign_name: Name
   - campaign_type: awareness | consideration | conversion | loyalty
   - target_segment: Who to reach
   - key_message: Core message
   - creative_approach: Creative strategy
   - channels: Media channels to use
   - timing: Campaign timing
   - success_metrics: How to measure

3. MEDIA MIX:
   - Channel allocation percentages
   - tv, digital, print, ooh, social, pr, events

4. MESSAGING FRAMEWORK:
   - key_messages: By audience
   - proof_points: Supporting claims
   - tone_of_voice: Brand voice

Return JSON with: promotion_plan{}, campaign_strategies[], media_mix{}, messaging_framework{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Positioning: {state.positioning_statement}
Target Audience: {state.target_audience}
Objectives: {state.strategic_objectives[:3]}
Channels: {state.distribution_channels[:3]}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.promotion_plan = result.get("promotion_plan", {})
            state.campaign_strategies = result.get("campaign_strategies", [])
            state.media_mix = result.get("media_mix", {})
            state.messaging_framework = result.get("messaging_framework", {})
            logger.info("brand_promotion_planned", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Promotion planning failed: {e}")
            state.error = f"Promotion planning failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "promotion"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _people_capability_assessor_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 7: PeopleCapabilityAssessor - Assess people needs."""
        logger.info(f"People assessment: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 7

        prompt = """You are an organizational strategist assessing capability needs.

Assess people needs:

1. CAPABILITY PLAN:
   - current_capabilities: What exists
   - required_capabilities: What's needed
   - capability_gaps: Gaps to fill
   - build_vs_buy: Develop or acquire

2. SKILL GAPS:
   - skill_name: Skill area
   - current_level: Current proficiency
   - required_level: Needed proficiency
   - gap_severity: critical | significant | moderate | minor
   - close_strategy: How to close gap

3. TRAINING NEEDS:
   - Training programs required
   - Development priorities

4. ORG RECOMMENDATIONS:
   - Structural recommendations
   - Role changes
   - New hires needed

Return JSON with: capability_plan{}, skill_gaps[], training_needs[], org_recommendations[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Strategic Objectives: {state.strategic_objectives[:3]}
Promotion Plan: {state.promotion_plan}
Channel Strategy: {state.channel_strategy}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.capability_plan = result.get("capability_plan", {})
            state.skill_gaps = result.get("skill_gaps", [])
            state.training_needs = result.get("training_needs", [])
            state.org_recommendations = result.get("org_recommendations", [])
            logger.info("brand_people_assessed", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"People assessment failed: {e}")
            state.error = f"People assessment failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "people"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _packaging_optimizer_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 8: PackagingOptimizer - Optimize packaging."""
        logger.info(f"Packaging optimization: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 8

        prompt = """You are a packaging strategist optimizing product packaging.

Optimize packaging:

1. PACKAGING SPEC:
   - packaging_strategy: premium | standard | eco | innovative
   - primary_packaging: Direct product container
   - secondary_packaging: Outer packaging
   - materials: Recommended materials
   - sustainability: Sustainability considerations
   - shelf_impact: Visual differentiation

2. PACKAGING OPTIONS:
   - option_name: Option identifier
   - description: Description
   - pros: Advantages
   - cons: Disadvantages
   - cost_impact: Cost implications
   - recommendation: recommended | alternative | not_recommended

3. PACKAGING COSTS:
   - unit_cost: Cost per unit
   - tooling_cost: Setup costs
   - minimum_order: MOQ requirements

Return JSON with: packaging_spec{}, packaging_options[], packaging_costs{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Positioning: {state.positioning_statement}
Target Audience: {state.target_audience}
Channel Strategy: {state.channel_strategy}
Price Strategy: {state.price_strategy}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.packaging_spec = result.get("packaging_spec", {})
            state.packaging_options = result.get("packaging_options", [])
            state.packaging_costs = result.get("packaging_costs", {})
            logger.info("brand_packaging_optimized", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Packaging optimization failed: {e}")
            state.error = f"Packaging optimization failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "packaging"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _partner_evaluator_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 9: PartnerEvaluator - Evaluate partners."""
        logger.info(f"Partner evaluation: {state.mission_id}")
        state.phase = ExecutionPhase.EVALUATE
        state.current_step = 9

        prompt = """You are a partnership strategist evaluating potential partners.

Evaluate partners:

1. PARTNER RECOMMENDATIONS:
   - partner_name: Partner name
   - partner_type: distributor | agency | supplier | co-marketing | technology
   - strategic_fit: Alignment with brand strategy
   - capabilities: What they bring
   - risks: Partnership risks
   - recommendation: pursue | consider | avoid
   - priority: high | medium | low

2. PARTNERSHIP CRITERIA:
   - Key criteria for partner selection
   - Must-haves vs nice-to-haves

3. PARTNER SCORES:
   - Weighted scores for each partner
   - Overall rankings

Return JSON with: partner_recommendations[], partnership_criteria[], partner_scores{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Channel Strategy: {state.channel_strategy}
Channel Partners: {state.channel_partners}
Promotion Plan: {state.promotion_plan}
Capability Gaps: {state.skill_gaps[:3]}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.partner_recommendations = result.get("partner_recommendations", [])
            state.partnership_criteria = result.get("partnership_criteria", [])
            state.partner_scores = result.get("partner_scores", {})
            logger.info("brand_partners_evaluated", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Partner evaluation failed: {e}")
            state.error = f"Partner evaluation failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "partners"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _plan_validator_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 10: PlanValidator - Validate complete brand plan."""
        logger.info(f"Plan validation: {state.mission_id}")
        state.phase = ExecutionPhase.VERIFY
        state.current_step = 10

        prompt = """You are a brand strategy reviewer validating the complete plan.

Validate the brand plan:

1. VALIDATED PLAN:
   - executive_summary: One-paragraph summary
   - strategic_coherence: How well elements fit together
   - market_fit: Fit with market dynamics
   - competitive_differentiation: Distinctiveness
   - feasibility: Implementation feasibility
   - resource_requirements: Resources needed
   - expected_outcomes: Projected results

2. PLAN RISKS:
   - risk_id: Identifier
   - risk_description: What could go wrong
   - likelihood: low | medium | high
   - impact: low | medium | high
   - mitigation: How to address

3. PLAN SCORE (0-100):
   - Overall plan quality score

4. VALIDATION ISSUES:
   - Critical issues to address
   - Recommendations for improvement

Return JSON with: validated_plan{}, plan_risks[], plan_score, validation_issues[]"""

        # Compile full plan context
        context = f"""BRAND PLAN SUMMARY:
Brand: {state.brand_name or state.goal}
Market Assessment: {state.market_assessment}
Objectives: {state.strategic_objectives[:3]}
Positioning: {state.positioning_statement}
Value Proposition: {state.value_proposition}
Pricing: {state.price_strategy}
Channels: {state.channel_strategy}
Promotion: {state.promotion_plan}
Capabilities: {state.capability_plan}
Packaging: {state.packaging_spec}
Partners: {state.partner_recommendations[:3]}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=60)
            result = self._parse_json_output(response.content)
            state.validated_plan = result.get("validated_plan", {})
            state.plan_risks = result.get("plan_risks", [])
            state.plan_score = result.get("plan_score", 0.0)
            state.validation_issues = result.get("validation_issues", [])
            state.brand_plan_quality = state.plan_score / 100.0
            logger.info("brand_plan_validated", mission_id=state.mission_id, score=state.plan_score)
        except Exception as e:
            logger.error(f"Plan validation failed: {e}")
            state.error = f"Plan validation failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "plan_validation", "score": state.plan_score}, mission_id=state.mission_id)
        return state

    # =========================================================================
    # Positioning Strategy (6 runners)
    # =========================================================================

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _competitive_position_analyzer_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 11: CompetitivePositionAnalyzer - Analyze competitive positions."""
        logger.info(f"Competitive position analysis: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 11 if self.workflow_mode == "full" else 1

        prompt = """You are a competitive analyst mapping brand positions.

Analyze competitive positions:

1. POSITION MAP:
   - x_axis: Dimension 1 (e.g., price)
   - y_axis: Dimension 2 (e.g., quality)
   - brands_mapped: Brands plotted with coordinates
   - clusters: Groups of similar positioning
   - our_position: Where our brand sits

2. COMPETITOR POSITIONS:
   - competitor_name: Name
   - positioning: Their positioning statement
   - strengths: Key strengths
   - weaknesses: Key weaknesses
   - market_share: Estimated share
   - trajectory: Growing | stable | declining

3. POSITION GAPS:
   - gap_description: Unoccupied position
   - attractiveness: high | medium | low
   - sustainability: Can position be defended?

Return JSON with: position_map{}, competitor_positions[], position_gaps[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Current Positioning: {state.positioning_statement}
Competitive Landscape: {state.competitive_landscape}
Market Dynamics: {state.market_dynamics}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.position_map = result.get("position_map", {})
            state.competitor_positions = result.get("competitor_positions", [])
            state.position_gaps = result.get("position_gaps", [])
            logger.info("brand_positions_analyzed", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Position analysis failed: {e}")
            state.error = f"Position analysis failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "competitive_analysis"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _whitespace_identifier_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 12: WhitespaceIdentifier - Identify whitespace opportunities."""
        logger.info(f"Whitespace identification: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 12 if self.workflow_mode == "full" else 2

        prompt = """You are a strategy consultant identifying positioning whitespace.

Identify whitespace:

1. WHITESPACE OPPORTUNITIES:
   - opportunity_id: Identifier
   - opportunity_name: Name
   - description: What the whitespace is
   - customer_need: Unmet customer need
   - competitive_context: Why competitors aren't there
   - size_estimate: Potential size
   - fit_with_brand: How well it fits our brand
   - barriers_to_entry: What it takes to occupy
   - recommendation: pursue | explore | avoid

2. OPPORTUNITY SCORES:
   - Scores for each opportunity
   - Attractiveness
   - Feasibility

Return JSON with: whitespace_opportunities[], opportunity_scores{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Position Map: {state.position_map}
Position Gaps: {state.position_gaps}
Target Audience: {state.target_audience}
Differentiators: {state.differentiators}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.whitespace_opportunities = result.get("whitespace_opportunities", [])
            state.opportunity_scores = result.get("opportunity_scores", {})
            logger.info("brand_whitespace_identified", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Whitespace identification failed: {e}")
            state.error = f"Whitespace identification failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "whitespace"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _concept_generator_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 13: ConceptGenerator - Generate positioning concepts."""
        logger.info(f"Concept generation: {state.mission_id}")
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 13 if self.workflow_mode == "full" else 3

        prompt = """You are a creative strategist generating positioning concepts.

Generate concepts:

1. CONCEPT OPTIONS (3-5 concepts):
   - concept_id: Identifier
   - concept_name: Memorable name
   - positioning_statement: Full positioning statement
   - key_insight: Customer insight it's based on
   - key_benefit: Primary benefit claimed
   - reason_to_believe: Why customers should believe
   - creative_expression: How it comes to life
   - risks: Potential risks
   - differentiation: How it's different

2. CONCEPT EVALUATION:
   - criteria: Evaluation criteria used
   - scores: Concept scores
   - ranking: Ranked order

3. WINNING CONCEPTS:
   - Top concepts recommended

Return JSON with: concept_options[], concept_evaluation{}, winning_concepts[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Whitespace Opportunities: {state.whitespace_opportunities[:3]}
Position Gaps: {state.position_gaps}
Target Audience: {state.target_audience}
Differentiators: {state.differentiators}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=60)
            result = self._parse_json_output(response.content)
            state.concept_options = result.get("concept_options", [])
            state.concept_evaluation = result.get("concept_evaluation", {})
            state.winning_concepts = result.get("winning_concepts", [])
            logger.info("brand_concepts_generated", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Concept generation failed: {e}")
            state.error = f"Concept generation failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "concepts"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _evidence_mapper_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 14: EvidenceMapper - Map supporting evidence."""
        logger.info(f"Evidence mapping: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 14 if self.workflow_mode == "full" else 4

        prompt = """You are a medical affairs strategist mapping evidence for positioning.

Map evidence:

1. EVIDENCE MATRIX:
   - positioning_claim: Each claim from positioning
   - clinical_evidence: Supporting clinical data
   - market_evidence: Supporting market data
   - evidence_strength: strong | moderate | weak | none
   - gaps: Evidence gaps to fill

2. CLINICAL EVIDENCE:
   - study_name: Study identifier
   - study_type: RCT | observational | meta-analysis | real-world
   - key_findings: Main findings
   - relevance_to_positioning: How it supports positioning

3. MARKET EVIDENCE:
   - evidence_type: market_research | customer_insights | competitive_intel
   - source: Data source
   - key_findings: Main findings
   - relevance_to_positioning: How it supports positioning

Return JSON with: evidence_matrix{}, clinical_evidence[], market_evidence[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Winning Concepts: {state.winning_concepts}
Concept Options: {state.concept_options[:2]}
Positioning: {state.positioning_statement}
Therapeutic Area: {state.therapeutic_area}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.evidence_matrix = result.get("evidence_matrix", {})
            state.clinical_evidence = result.get("clinical_evidence", [])
            state.market_evidence = result.get("market_evidence", [])
            logger.info("brand_evidence_mapped", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Evidence mapping failed: {e}")
            state.error = f"Evidence mapping failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "evidence"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _kol_position_validator_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 15: KOLPositionValidator - Validate with KOLs."""
        logger.info(f"KOL validation: {state.mission_id}")
        state.phase = ExecutionPhase.VERIFY
        state.current_step = 15 if self.workflow_mode == "full" else 5

        prompt = """You are a medical affairs lead planning KOL validation.

Plan KOL validation:

1. KOL FEEDBACK (simulated/planned):
   - kol_archetype: Type of KOL (academic | clinical | advocacy)
   - expected_reaction: Likely response to positioning
   - key_questions: Questions they'll ask
   - concerns: Anticipated concerns
   - support_likelihood: likely | possible | unlikely

2. KOL RECOMMENDATIONS:
   - Recommendations based on KOL perspective
   - Positioning adjustments
   - Messaging refinements

3. KOL CONCERNS:
   - Key concerns to address
   - How to mitigate

Return JSON with: kol_feedback[], kol_recommendations[], kol_concerns[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Winning Concepts: {state.winning_concepts}
Evidence Matrix: {state.evidence_matrix}
Clinical Evidence: {state.clinical_evidence[:3]}
Therapeutic Area: {state.therapeutic_area}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.kol_feedback = result.get("kol_feedback", [])
            state.kol_recommendations = result.get("kol_recommendations", [])
            state.kol_concerns = result.get("kol_concerns", [])
            logger.info("brand_kol_validated", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"KOL validation failed: {e}")
            state.error = f"KOL validation failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "kol_validation"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _positioning_finalizer_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 16: PositioningFinalizer - Finalize positioning."""
        logger.info(f"Positioning finalization: {state.mission_id}")
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 16 if self.workflow_mode == "full" else 6

        prompt = """You are a brand strategist finalizing positioning.

Finalize positioning:

1. FINAL POSITIONING:
   - positioning_statement: Final positioning statement
   - tagline: Brand tagline
   - elevator_pitch: 30-second pitch
   - key_messages: Top 3 messages
   - proof_points: Supporting proof
   - brand_personality: Personality traits
   - tone_of_voice: Communication style

2. POSITIONING RATIONALE:
   - Why this positioning wins
   - How it addresses market needs
   - How it defeats competition

3. POSITIONING ARTIFACTS:
   - List of deliverables needed
   - Brand guidelines
   - Messaging guide

Return JSON with: final_positioning{}, positioning_rationale, positioning_artifacts[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Winning Concepts: {state.winning_concepts}
KOL Recommendations: {state.kol_recommendations}
Evidence Matrix: {state.evidence_matrix}
Target Audience: {state.target_audience}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.final_positioning = result.get("final_positioning", {})
            state.positioning_rationale = result.get("positioning_rationale", "")
            state.positioning_artifacts = result.get("positioning_artifacts", [])
            state.positioning_strength = 0.8 if state.final_positioning else 0.4
            logger.info("brand_positioning_finalized", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Positioning finalization failed: {e}")
            state.error = f"Positioning finalization failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "finalization"}, mission_id=state.mission_id)
        return state

    # =========================================================================
    # Portfolio Architecture (6 runners)
    # =========================================================================

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _overlap_analyzer_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 17: OverlapAnalyzer - Analyze portfolio overlap."""
        logger.info(f"Overlap analysis: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 17 if self.workflow_mode == "full" else 1

        prompt = """You are a portfolio strategist analyzing brand overlap.

Analyze overlap:

1. OVERLAP MAP:
   - products_analyzed: Products in portfolio
   - overlap_matrix: Product vs product overlap scores
   - highest_overlaps: Most significant overlaps
   - distinct_products: Products with clear differentiation

2. OVERLAP AREAS:
   - overlap_id: Identifier
   - products_involved: Which products overlap
   - overlap_type: target_audience | indication | positioning | pricing
   - overlap_degree: high | medium | low
   - customer_confusion_risk: Risk of customer confusion
   - recommendations: How to address

3. OVERLAP SEVERITY:
   - By overlap area: severity rating

Return JSON with: overlap_map{}, overlap_areas[], overlap_severity{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Final Positioning: {state.final_positioning}
Product Category: {state.product_category}
Therapeutic Area: {state.therapeutic_area}
Target Audience: {state.target_audience}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.overlap_map = result.get("overlap_map", {})
            state.overlap_areas = result.get("overlap_areas", [])
            state.overlap_severity = result.get("overlap_severity", {})
            logger.info("brand_overlap_analyzed", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Overlap analysis failed: {e}")
            state.error = f"Overlap analysis failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "overlap_analysis"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _cannibalization_modeler_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 18: CannibalizationModeler - Model cannibalization."""
        logger.info(f"Cannibalization modeling: {state.mission_id}")
        state.phase = ExecutionPhase.ANALYZE
        state.current_step = 18 if self.workflow_mode == "full" else 2

        prompt = """You are a portfolio analyst modeling cannibalization risk.

Model cannibalization:

1. CANNIBALIZATION RISK:
   - overall_risk_level: low | medium | high | critical
   - risk_factors: Factors driving cannibalization
   - vulnerable_products: Products at risk
   - protected_products: Products with distinct positioning

2. CANNIBALIZATION SCENARIOS:
   - scenario_name: Name
   - description: What happens
   - likelihood: Probability
   - products_affected: Which products
   - volume_shift: Expected volume shift
   - net_revenue_impact: Impact on revenue
   - mitigation_options: How to prevent

3. REVENUE IMPACT:
   - by_product: Revenue impact per product
   - total_portfolio_impact: Net impact
   - timeline: When impact occurs

Return JSON with: cannibalization_risk{}, cannibalization_scenarios[], revenue_impact{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Overlap Map: {state.overlap_map}
Overlap Areas: {state.overlap_areas[:3]}
Price Points: {state.price_points}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.cannibalization_risk = result.get("cannibalization_risk", {})
            state.cannibalization_scenarios = result.get("cannibalization_scenarios", [])
            state.revenue_impact = result.get("revenue_impact", {})
            logger.info("brand_cannibalization_modeled", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Cannibalization modeling failed: {e}")
            state.error = f"Cannibalization modeling failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "cannibalization"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _architecture_generator_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 19: ArchitectureGenerator - Generate architecture options."""
        logger.info(f"Architecture generation: {state.mission_id}")
        state.phase = ExecutionPhase.SYNTHESIZE
        state.current_step = 19 if self.workflow_mode == "full" else 3

        prompt = """You are a portfolio strategist designing brand architecture.

Generate architecture options:

1. ARCHITECTURE OPTIONS (3 options):
   - option_name: Name
   - architecture_type: branded_house | house_of_brands | endorsed | hybrid
   - structure: How brands relate
   - pros: Advantages
   - cons: Disadvantages
   - resource_requirements: Investment needed
   - implementation_complexity: low | medium | high
   - fit_score: How well it fits strategy (0-100)

2. RECOMMENDED ARCHITECTURE:
   - Selected option
   - Key design principles
   - Brand hierarchy
   - Naming conventions

3. ARCHITECTURE RATIONALE:
   - Why this architecture wins

Return JSON with: architecture_options[], recommended_architecture{}, architecture_rationale"""

        context = f"""Brand: {state.brand_name or state.goal}
Cannibalization Risk: {state.cannibalization_risk}
Overlap Map: {state.overlap_map}
Final Positioning: {state.final_positioning}
Strategic Objectives: {state.strategic_objectives[:3]}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.architecture_options = result.get("architecture_options", [])
            state.recommended_architecture = result.get("recommended_architecture", {})
            state.architecture_rationale = result.get("architecture_rationale", "")
            logger.info("brand_architecture_generated", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Architecture generation failed: {e}")
            state.error = f"Architecture generation failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "architecture"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _value_optimizer_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 20: ValueOptimizer - Optimize portfolio value."""
        logger.info(f"Value optimization: {state.mission_id}")
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 20 if self.workflow_mode == "full" else 4

        prompt = """You are a portfolio optimization expert maximizing value.

Optimize portfolio value:

1. OPTIMIZED PORTFOLIO:
   - portfolio_composition: Final product mix
   - value_maximization_strategy: How value is maximized
   - resource_allocation: How resources are distributed
   - priority_brands: Focus brands
   - maintenance_brands: Support brands
   - sunset_candidates: Brands to phase out

2. VALUE DRIVERS:
   - driver_name: What drives value
   - current_contribution: Current value
   - optimization_potential: Upside potential
   - actions_required: How to capture

3. OPTIMIZATION GAINS:
   - revenue_uplift: Additional revenue
   - margin_improvement: Margin gains
   - efficiency_gains: Cost savings
   - timeline_to_capture: When gains realized

Return JSON with: optimized_portfolio{}, value_drivers[], optimization_gains{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Recommended Architecture: {state.recommended_architecture}
Cannibalization Risk: {state.cannibalization_risk}
Strategic Objectives: {state.strategic_objectives[:3]}
Revenue Impact: {state.revenue_impact}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.optimized_portfolio = result.get("optimized_portfolio", {})
            state.value_drivers = result.get("value_drivers", [])
            state.optimization_gains = result.get("optimization_gains", {})
            logger.info("brand_value_optimized", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Value optimization failed: {e}")
            state.error = f"Value optimization failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "value_optimization"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _migration_planner_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 21: MigrationPlanner - Plan product migration."""
        logger.info(f"Migration planning: {state.mission_id}")
        state.phase = ExecutionPhase.PLAN
        state.current_step = 21 if self.workflow_mode == "full" else 5

        prompt = """You are a portfolio transition planner developing migration strategy.

Plan migration:

1. MIGRATION PLAN:
   - migration_strategy: immediate | phased | parallel
   - transition_timeline: Overall timeline
   - key_milestones: Major milestones
   - communication_plan: How to communicate changes
   - customer_transition: How customers migrate

2. MIGRATION PHASES:
   - phase_name: Phase name
   - phase_duration: Duration
   - activities: Key activities
   - deliverables: What's produced
   - dependencies: Prerequisites
   - risks: Phase-specific risks

3. MIGRATION RISKS:
   - risk_description: What could go wrong
   - likelihood: low | medium | high
   - impact: low | medium | high
   - mitigation: How to address

Return JSON with: migration_plan{}, migration_phases[], migration_risks[]"""

        context = f"""Brand: {state.brand_name or state.goal}
Optimized Portfolio: {state.optimized_portfolio}
Recommended Architecture: {state.recommended_architecture}
Value Drivers: {state.value_drivers[:3]}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.migration_plan = result.get("migration_plan", {})
            state.migration_phases = result.get("migration_phases", [])
            state.migration_risks = result.get("migration_risks", [])
            logger.info("brand_migration_planned", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Migration planning failed: {e}")
            state.error = f"Migration planning failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "migration"}, mission_id=state.mission_id)
        return state

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _sequencing_strategist_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Runner 22: SequencingStrategist - Sequence launches."""
        logger.info(f"Launch sequencing: {state.mission_id}")
        state.phase = ExecutionPhase.EXECUTE
        state.current_step = 22 if self.workflow_mode == "full" else 6

        prompt = """You are a launch strategist sequencing product launches.

Sequence launches:

1. LAUNCH SEQUENCE:
   - launch_order: Order of launches
   - launch_name: Product/initiative name
   - launch_date: Target date
   - launch_type: new_product | line_extension | rebrand | sunset
   - market_priority: primary | secondary | tertiary
   - dependencies: What must happen first
   - resources_required: Resources needed
   - success_criteria: How success is measured

2. SEQUENCING RATIONALE:
   - Why this sequence is optimal
   - Risk considerations
   - Resource optimization

3. TIMELINE:
   - year_1: Year 1 activities
   - year_2: Year 2 activities
   - year_3: Year 3 activities
   - key_gates: Decision points

Return JSON with: launch_sequence[], sequencing_rationale, timeline{}"""

        context = f"""Brand: {state.brand_name or state.goal}
Migration Plan: {state.migration_plan}
Migration Phases: {state.migration_phases[:3]}
Optimized Portfolio: {state.optimized_portfolio}
Planning Horizon: {state.planning_horizon}"""

        try:
            response = await invoke_llm_with_timeout(self.llm, [SystemMessage(content=prompt), HumanMessage(content=context)], timeout=45)
            result = self._parse_json_output(response.content)
            state.launch_sequence = result.get("launch_sequence", [])
            state.sequencing_rationale = result.get("sequencing_rationale", "")
            state.timeline = result.get("timeline", {})
            state.portfolio_coherence = 0.8 if state.launch_sequence else 0.4
            logger.info("brand_launches_sequenced", mission_id=state.mission_id)
        except Exception as e:
            logger.error(f"Launch sequencing failed: {e}")
            state.error = f"Launch sequencing failed: {str(e)}"
            raise

        self._emit_sse_event(SSEEventType.PHASE_COMPLETE, {"phase": "sequencing"}, mission_id=state.mission_id)
        return state

    # =========================================================================
    # Quality Gate
    # =========================================================================

    @graceful_degradation(domain="brand_strategy", fallback_value=None)
    async def _quality_gate_node(self, state: BrandStrategyState) -> BrandStrategyState:
        """Final quality assessment for brand strategy output."""
        logger.info(f"Quality gate: {state.mission_id}")
        state.phase = ExecutionPhase.QUALITY_CHECK
        state.completed_at = datetime.utcnow()

        # Calculate quality based on workflow mode
        quality_components = []
        if self.workflow_mode in ("brand_plan_10ps", "full"):
            quality_components.append(state.brand_plan_quality)
        if self.workflow_mode in ("positioning_strategy", "full"):
            quality_components.append(state.positioning_strength)
        if self.workflow_mode in ("portfolio_architecture", "full"):
            quality_components.append(state.portfolio_coherence)

        state.quality_score = sum(quality_components) / max(len(quality_components), 1)

        # Determine completed steps
        if self.workflow_mode == "full":
            state.completed_steps = 22
        elif self.workflow_mode == "brand_plan_10ps":
            state.completed_steps = 10
        elif self.workflow_mode == "positioning_strategy":
            state.completed_steps = 6
        elif self.workflow_mode == "portfolio_architecture":
            state.completed_steps = 6

        # Determine if HITL review needed
        hitl_required = (
            state.quality_score < 0.6 or
            state.plan_score < 70 or
            len(state.validation_issues) > 3 or
            len(state.kol_concerns) > 3
        )

        if hitl_required and self.hitl_enabled:
            state.hitl_required = True
            reasons = []
            if state.plan_score < 70:
                reasons.append(f"Low plan score ({state.plan_score})")
            if len(state.validation_issues) > 3:
                reasons.append(f"Multiple validation issues ({len(state.validation_issues)})")
            if len(state.kol_concerns) > 3:
                reasons.append(f"KOL concerns ({len(state.kol_concerns)})")
            state.hitl_reason = "; ".join(reasons) if reasons else "Quality threshold not met"

            self._emit_sse_event(
                SSEEventType.HITL_REQUIRED,
                {"mission_id": state.mission_id, "reason": state.hitl_reason, "workflow_mode": self.workflow_mode},
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
                "plan_score": state.plan_score,
            },
            mission_id=state.mission_id,
        )

        return state

    def _route_after_quality(self, state: BrandStrategyState) -> str:
        """Route after quality gate."""
        return "hitl_required" if state.hitl_required else "complete"

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _parse_json_output(self, content: str) -> Dict[str, Any]:
        """Parse JSON from LLM response."""
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON, returning empty dict")
            return {}

    def _emit_phase_event(self, event_type: SSEEventType, state: BrandStrategyState, **kwargs: Any) -> None:
        """Emit phase-related SSE event."""
        self._emit_sse_event(event_type, {"mission_id": state.mission_id, **kwargs}, mission_id=state.mission_id)


# =============================================================================
# Exports
# =============================================================================

__all__ = [
    "BrandStrategyRunner",
    "BrandStrategyState",
]
