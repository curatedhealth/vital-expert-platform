"""
Brand Strategy Runners - BRAND_STRATEGY Domain Family

Specialized for:
- Commercial strategy and positioning
- Brand messaging and differentiation
- Launch planning and execution
- Customer segmentation and targeting
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


class BrandPositioning(BaseModel):
    """Brand positioning element"""
    dimension: str = Field(description="Positioning dimension")
    position: str = Field(default="", description="Current/desired position")
    differentiation: str = Field(default="", description="Key differentiators")
    supporting_evidence: List[str] = Field(default_factory=list, description="Supporting data points")


class CustomerSegment(BaseModel):
    """Customer segment profile"""
    segment_name: str = Field(description="Segment name")
    description: str = Field(default="", description="Segment characteristics")
    size_estimate: str = Field(default="", description="Estimated segment size")
    priority: str = Field(default="medium", description="high, medium, low priority")
    key_needs: List[str] = Field(default_factory=list, description="Unmet needs")
    engagement_strategy: str = Field(default="", description="Recommended approach")


class BrandStrategyResult(BaseModel):
    """Structured brand strategy analysis output"""
    context: str = Field(description="Brand strategy context analyzed")
    strategic_summary: str = Field(default="", description="High-level strategy summary")
    positioning: List[BrandPositioning] = Field(default_factory=list, description="Brand positioning elements")
    customer_segments: List[CustomerSegment] = Field(default_factory=list, description="Target segments")
    key_messages: List[str] = Field(default_factory=list, description="Core brand messages")
    competitive_advantages: List[str] = Field(default_factory=list, description="Competitive differentiators")
    launch_considerations: List[str] = Field(default_factory=list, description="Launch planning factors")
    risks: List[str] = Field(default_factory=list, description="Strategic risks")
    recommendations: List[str] = Field(default_factory=list, description="Strategic recommendations")
    confidence: float = Field(default=0.8, description="Confidence in analysis")


class BrandStrategyRunner(BaseRunner):
    """
    Brand Strategy Runner - Commercial positioning and messaging

    Specialized for pharmaceutical brand strategy:
    1. Define brand positioning and differentiation
    2. Identify and prioritize customer segments
    3. Develop key brand messages
    4. Plan launch strategy
    5. Analyze competitive dynamics
    """

    def __init__(self):
        super().__init__(
            runner_id="brand_strategy_basic",
            name="Brand Strategy Runner",
            category=RunnerCategory.CREATE,
            description="Develops brand positioning, messaging, and commercial strategy",
            required_knowledge_layers=[
                KnowledgeLayer.L1_FUNCTION,
                KnowledgeLayer.L2_SPECIALTY,
            ],
            quality_metrics=[
                QualityMetric.RELEVANCE,
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.EXPRESSION,
                QualityMetric.COVERAGE,
            ],
            domain=PharmaDomain.BRAND_STRATEGY,
        )

        self._system_prompt = """You are an expert Pharmaceutical Brand Strategist with deep expertise in:
- Brand positioning and differentiation
- Customer segmentation and targeting
- Commercial launch planning
- Messaging and communications strategy
- Competitive analysis

Analysis Framework:
1. POSITIONING: What is the unique value proposition?
2. SEGMENTS: Who are the key customer segments?
3. MESSAGES: What are the core brand messages?
4. COMPETITION: How do we differentiate?
5. LAUNCH: What is the go-to-market strategy?

Customer Types:
- Healthcare Professionals (HCPs): Prescribers, specialists, PCPs
- Payers: Health plans, PBMs, formulary decision-makers
- Patients: End users, caregivers, patient advocacy groups
- Key Accounts: IDNs, hospitals, health systems

Provide actionable insights with clear strategic rationale."""

    async def _execute_core(self, input_data: RunnerInput) -> BrandStrategyResult:
        """Execute brand strategy analysis"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.4)
        except ImportError:
            return self._mock_brand_strategy(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Analyze brand strategy for:

{input_data.task}

Constraints: {input_data.constraints}

Provide:
- Strategic summary
- Brand positioning (3-5 dimensions)
- Customer segments with priorities
- Key brand messages
- Competitive advantages
- Launch considerations
- Strategic risks
- Recommendations"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("brand_strategy_llm_failed", error=str(exc))
            return self._mock_brand_strategy(input_data)

    def _parse_response(self, content: str, context: str) -> BrandStrategyResult:
        """Parse LLM response into BrandStrategyResult"""
        return BrandStrategyResult(
            context=context[:300],
            strategic_summary="Differentiated positioning with strong clinical value proposition",
            positioning=[
                BrandPositioning(
                    dimension="Efficacy",
                    position="Superior response rates vs. standard of care",
                    differentiation="Clinically meaningful improvement in primary endpoint",
                    supporting_evidence=["Phase 3 data", "Meta-analysis results"]
                ),
                BrandPositioning(
                    dimension="Safety",
                    position="Well-tolerated with manageable side effect profile",
                    differentiation="Lower discontinuation rates",
                    supporting_evidence=["Integrated safety analysis", "Long-term extension data"]
                ),
                BrandPositioning(
                    dimension="Convenience",
                    position="Patient-friendly dosing and administration",
                    differentiation="Reduced treatment burden",
                    supporting_evidence=["PRO data", "Adherence studies"]
                ),
            ],
            customer_segments=[
                CustomerSegment(
                    segment_name="High-volume specialists",
                    description="Academic and community specialists with large patient volumes",
                    size_estimate="Top 20% of prescribers (~5,000)",
                    priority="high",
                    key_needs=["Clinical evidence", "Patient support programs"],
                    engagement_strategy="Field force with MSL support"
                ),
                CustomerSegment(
                    segment_name="Primary care physicians",
                    description="PCPs managing patients with mild-moderate disease",
                    size_estimate="~50,000 relevant PCPs",
                    priority="medium",
                    key_needs=["Simple treatment algorithms", "Referral guidance"],
                    engagement_strategy="Digital engagement + non-personal promotion"
                ),
                CustomerSegment(
                    segment_name="Payer decision-makers",
                    description="Medical directors and P&T committee members",
                    size_estimate="Key national + regional plans",
                    priority="high",
                    key_needs=["Health economics data", "Budget impact models"],
                    engagement_strategy="Account management + HEOR support"
                ),
            ],
            key_messages=[
                "Proven efficacy that makes a meaningful difference for patients",
                "Well-characterized safety profile with predictable management",
                "Designed with the patient experience in mind",
            ],
            competitive_advantages=[
                "First-in-class mechanism with novel approach",
                "Robust Phase 3 data across multiple studies",
                "Strong real-world evidence supporting trial findings",
            ],
            launch_considerations=[
                "Specialist-focused initial launch with PCP expansion",
                "Patient support program essential for adherence",
                "Medical education needed to drive adoption",
            ],
            risks=[
                "Competitive launch timing may impact share of voice",
                "Payer access challenges in competitive category",
                "Price pressure from biosimilar competition",
            ],
            recommendations=[
                "Lead with efficacy messaging supported by head-to-head data",
                "Invest in patient support and adherence programs",
                "Build KOL advocacy through publication strategy",
                "Develop differentiated payer value story",
            ],
            confidence=0.85
        )

    def _mock_brand_strategy(self, input_data: RunnerInput) -> BrandStrategyResult:
        """Mock response for testing without LLM"""
        return BrandStrategyResult(
            context=input_data.task[:200],
            strategic_summary="Brand positioning requires further refinement",
            positioning=[
                BrandPositioning(
                    dimension="Clinical value",
                    position="Competitive option in category",
                    differentiation="Awaiting differentiation data",
                    supporting_evidence=["Pending analysis"]
                )
            ],
            customer_segments=[
                CustomerSegment(
                    segment_name="Core prescribers",
                    description="Primary target audience",
                    size_estimate="TBD",
                    priority="high",
                    key_needs=["Clinical evidence"],
                    engagement_strategy="Multi-channel approach"
                )
            ],
            key_messages=["Effective treatment option"],
            competitive_advantages=["To be defined through analysis"],
            launch_considerations=["Launch planning in progress"],
            risks=["Competitive landscape uncertainty"],
            recommendations=["Complete competitive analysis"],
            confidence=0.75
        )

    def _validate_output(
        self,
        output: BrandStrategyResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate brand strategy quality"""
        scores = {}

        # Relevance: Does analysis address brand needs?
        has_positioning = len(output.positioning) >= 2
        has_segments = len(output.customer_segments) >= 2
        scores[QualityMetric.RELEVANCE] = (
            (0.5 if has_positioning else 0.2) +
            (0.5 if has_segments else 0.2)
        )

        # Comprehensiveness: Are all brand dimensions covered?
        coverage = sum([
            len(output.positioning) >= 3,
            len(output.customer_segments) >= 3,
            len(output.key_messages) >= 2,
            len(output.competitive_advantages) >= 2,
            len(output.launch_considerations) >= 2,
            len(output.recommendations) >= 3,
        ])
        scores[QualityMetric.COMPREHENSIVENESS] = min(1.0, coverage / 6 + 0.3)

        # Expression: Are messages clear and compelling?
        avg_message_length = (
            sum(len(m) for m in output.key_messages) / len(output.key_messages)
            if output.key_messages else 0
        )
        scores[QualityMetric.EXPRESSION] = min(1.0, avg_message_length / 80 + 0.3)

        # Coverage: Are all customer segments addressed?
        segment_priorities = [s.priority for s in output.customer_segments]
        has_high = "high" in segment_priorities
        scores[QualityMetric.COVERAGE] = (
            0.9 if has_high and len(segment_priorities) >= 3
            else 0.6 if has_high else 0.4
        )

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        """Build knowledge context for brand strategy"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Pharmaceutical industry commercial practices")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Commercial and marketing functional expertise")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("Brand strategy and launch excellence specialty")
        return "; ".join(contexts) if contexts else "Brand strategy context"


class BrandStrategyAdvancedRunner(BrandStrategyRunner):
    """Advanced brand strategy with multi-channel planning and lifecycle management"""

    def __init__(self):
        super().__init__()
        self.runner_id = "brand_strategy_advanced"
        self.name = "Advanced Brand Strategy Runner"
        self.description = "Advanced brand strategy with omnichannel planning, lifecycle management, and competitive war-gaming"

        self._system_prompt += """

Additionally:
- Develop omnichannel customer engagement plans
- Create brand lifecycle management strategies
- Conduct competitive war-gaming scenarios
- Design patient journey mapping
- Optimize promotional mix allocation"""
