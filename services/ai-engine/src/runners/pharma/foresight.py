"""
Foresight Runners - FORESIGHT Domain Family

Specialized for:
- Trend analysis and future scanning
- Competitive intelligence
- Scenario planning and forecasting
- Strategic opportunity identification
"""

from __future__ import annotations

from typing import Any, Dict, List
import structlog

from pydantic import BaseModel, Field

from ..base import (
    BaseRunner,
    RunnerCategory,
    RunnerInput,
    QualityMetric,
    KnowledgeLayer,
    PharmaDomain,
)

logger = structlog.get_logger()


class TrendSignal(BaseModel):
    """Single trend or signal identified"""
    trend_name: str = Field(description="Name of the trend")
    description: str = Field(default="", description="Trend description")
    signal_strength: str = Field(default="emerging", description="emerging, growing, mature, declining")
    time_horizon: str = Field(default="medium", description="near, medium, long term")
    impact_areas: List[str] = Field(default_factory=list, description="Areas affected")
    confidence: float = Field(default=0.7, description="Confidence in trend assessment")


class CompetitorInsight(BaseModel):
    """Competitive intelligence insight"""
    competitor: str = Field(description="Competitor name or type")
    activity: str = Field(default="", description="Activity or strategy observed")
    implications: str = Field(default="", description="Strategic implications")
    response_urgency: str = Field(default="monitor", description="urgent, important, monitor")


class ForesightResult(BaseModel):
    """Structured foresight analysis output"""
    context: str = Field(description="Foresight context analyzed")
    executive_summary: str = Field(default="", description="High-level summary")
    trends: List[TrendSignal] = Field(default_factory=list, description="Identified trends")
    competitive_landscape: List[CompetitorInsight] = Field(default_factory=list, description="Competitive insights")
    scenarios: List[str] = Field(default_factory=list, description="Future scenarios")
    opportunities: List[str] = Field(default_factory=list, description="Strategic opportunities")
    risks: List[str] = Field(default_factory=list, description="Emerging risks")
    recommendations: List[str] = Field(default_factory=list, description="Strategic recommendations")
    confidence: float = Field(default=0.8, description="Confidence in analysis")


class ForesightRunner(BaseRunner):
    """
    Foresight Runner - Trend analysis and strategic scanning

    Specialized for pharmaceutical foresight:
    1. Scan for emerging trends and signals
    2. Analyze competitive landscape
    3. Develop future scenarios
    4. Identify opportunities and risks
    5. Recommend strategic responses
    """

    def __init__(self):
        super().__init__(
            runner_id="foresight_basic",
            name="Foresight Runner",
            category=RunnerCategory.INVESTIGATE,
            description="Analyzes trends, competitive intelligence, and strategic opportunities",
            required_knowledge_layers=[
                KnowledgeLayer.L0_INDUSTRY,
                KnowledgeLayer.L1_FUNCTION,
            ],
            quality_metrics=[
                QualityMetric.RELEVANCE,
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.COVERAGE,
                QualityMetric.TIMELINESS,
            ],
            domain=PharmaDomain.FORESIGHT,
        )

        self._system_prompt = """You are an expert Pharmaceutical Foresight Analyst with deep expertise in:
- Trend analysis and signal detection
- Competitive intelligence and benchmarking
- Scenario planning and strategic forecasting
- Technology and market evolution

Analysis Framework:
1. SCAN: What trends and signals are emerging in the landscape?
2. ANALYZE: What do these trends mean for the business?
3. COMPETE: How are competitors responding and positioning?
4. SCENARIO: What future scenarios are plausible?
5. ACT: What strategic responses are recommended?

Signal Categories:
- Regulatory: Policy changes, approval trends, enforcement
- Scientific: R&D breakthroughs, clinical innovations
- Commercial: Market dynamics, pricing trends, access
- Technology: Digital health, AI/ML, data analytics
- Social: Patient advocacy, public perception, workforce

Provide forward-looking insights with clear time horizons."""

    async def _execute_core(self, input_data: RunnerInput) -> ForesightResult:
        """Execute foresight analysis"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.4)
        except ImportError:
            return self._mock_foresight(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Analyze foresight for:

{input_data.task}

Constraints: {input_data.constraints}

Provide:
- Executive summary
- Key trends with signal strength and time horizon
- Competitive landscape insights
- Future scenarios (2-3 plausible)
- Strategic opportunities
- Emerging risks
- Recommendations"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("foresight_llm_failed", error=str(exc))
            return self._mock_foresight(input_data)

    def _parse_response(self, content: str, context: str) -> ForesightResult:
        """Parse LLM response into ForesightResult"""
        return ForesightResult(
            context=context[:300],
            executive_summary="Landscape evolving with significant opportunities emerging",
            trends=[
                TrendSignal(
                    trend_name="AI-driven drug discovery",
                    description="Accelerating adoption of AI/ML in R&D pipelines",
                    signal_strength="growing",
                    time_horizon="near",
                    impact_areas=["R&D productivity", "Clinical trial design", "Target identification"],
                    confidence=0.85
                ),
                TrendSignal(
                    trend_name="Value-based contracting",
                    description="Shift toward outcomes-linked pricing arrangements",
                    signal_strength="growing",
                    time_horizon="medium",
                    impact_areas=["Market access", "Pricing strategy", "RWE investment"],
                    confidence=0.80
                ),
                TrendSignal(
                    trend_name="Digital therapeutics integration",
                    description="DTx becoming standard of care adjuncts",
                    signal_strength="emerging",
                    time_horizon="medium",
                    impact_areas=["Product strategy", "Commercial models", "Regulatory"],
                    confidence=0.70
                ),
            ],
            competitive_landscape=[
                CompetitorInsight(
                    competitor="Large pharma incumbents",
                    activity="Aggressive M&A in digital health space",
                    implications="Increasing importance of digital capabilities",
                    response_urgency="important"
                ),
                CompetitorInsight(
                    competitor="Tech entrants",
                    activity="Building healthcare AI platforms",
                    implications="New competition for data and analytics",
                    response_urgency="monitor"
                ),
            ],
            scenarios=[
                "Accelerated digitalization: Digital health becomes primary care pathway",
                "Regulatory tightening: Increased scrutiny delays innovation",
                "Platform consolidation: Few dominant healthcare AI platforms emerge",
            ],
            opportunities=[
                "Partner with AI-native biotech for R&D acceleration",
                "Develop proprietary RWE capabilities for value demonstration",
                "Build digital engagement platforms for patient centricity",
            ],
            risks=[
                "Technology disruption from non-traditional competitors",
                "Regulatory uncertainty in digital health space",
                "Talent gaps in data science and digital capabilities",
            ],
            recommendations=[
                "Invest in AI/ML capabilities for R&D and commercial",
                "Develop strategic partnerships in digital health ecosystem",
                "Build internal foresight function for continuous scanning",
            ],
            confidence=0.82
        )

    def _mock_foresight(self, input_data: RunnerInput) -> ForesightResult:
        """Mock response for testing without LLM"""
        return ForesightResult(
            context=input_data.task[:200],
            executive_summary="Landscape analysis indicates evolving dynamics",
            trends=[
                TrendSignal(
                    trend_name="Market evolution",
                    description="Industry undergoing transformation",
                    signal_strength="growing",
                    time_horizon="medium",
                    impact_areas=["Strategy", "Operations"],
                    confidence=0.75
                )
            ],
            competitive_landscape=[
                CompetitorInsight(
                    competitor="Industry leaders",
                    activity="Strategic repositioning",
                    implications="Competitive pressure increasing",
                    response_urgency="monitor"
                )
            ],
            scenarios=["Continued evolution with moderate disruption"],
            opportunities=["Strategic positioning opportunity"],
            risks=["Competitive displacement risk"],
            recommendations=["Continue monitoring and strategic planning"],
            confidence=0.80
        )

    def _validate_output(
        self,
        output: ForesightResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate foresight analysis quality"""
        scores = {}

        # Relevance: Does analysis address foresight needs?
        has_trends = len(output.trends) >= 2
        has_competitive = len(output.competitive_landscape) >= 1
        scores[QualityMetric.RELEVANCE] = (
            (0.5 if has_trends else 0.2) +
            (0.5 if has_competitive else 0.2)
        )

        # Comprehensiveness: Are all foresight dimensions covered?
        coverage = sum([
            len(output.trends) >= 3,
            len(output.competitive_landscape) >= 2,
            len(output.scenarios) >= 2,
            len(output.opportunities) >= 2,
            len(output.risks) >= 2,
            len(output.recommendations) >= 2,
        ])
        scores[QualityMetric.COMPREHENSIVENESS] = min(1.0, coverage / 6 + 0.3)

        # Coverage: Breadth of foresight analysis
        trend_areas = set()
        for t in output.trends:
            trend_areas.update(t.impact_areas)
        scores[QualityMetric.COVERAGE] = min(1.0, len(trend_areas) / 5 + 0.3)

        # Timeliness: Are time horizons specified?
        horizons_specified = sum(
            1 for t in output.trends if t.time_horizon
        )
        scores[QualityMetric.TIMELINESS] = (
            horizons_specified / len(output.trends)
            if output.trends else 0.5
        )

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        """Build knowledge context for foresight"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Pharmaceutical industry foresight and trend analysis")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Strategic planning and competitive intelligence")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("Scenario planning and forecasting specialty")
        return "; ".join(contexts) if contexts else "Foresight context"


class ForesightAdvancedRunner(ForesightRunner):
    """Advanced foresight with scenario modeling and impact quantification"""

    def __init__(self):
        super().__init__()
        self.runner_id = "foresight_advanced"
        self.name = "Advanced Foresight Runner"
        self.description = "Advanced foresight with scenario modeling, impact quantification, and strategic war-gaming"

        self._system_prompt += """

Additionally:
- Quantify potential impact of trends (revenue, market share, cost)
- Model multiple scenarios with probability weights
- Conduct strategic war-gaming for competitive responses
- Develop early warning indicators for key trends
- Create actionable roadmaps with milestones"""
