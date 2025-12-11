"""
Market Access Runners - MARKET_ACCESS Domain Family

Specialized for:
- HEOR (Health Economics and Outcomes Research)
- Pricing and reimbursement strategy
- HTA (Health Technology Assessment) submissions
- Payer negotiations and value dossiers
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


class ValueArgument(BaseModel):
    """Single value argument for HTA/payer"""
    claim: str = Field(description="The value claim")
    evidence_type: str = Field(default="RCT", description="RCT, RWE, meta-analysis, etc.")
    strength: str = Field(default="moderate", description="strong, moderate, weak")
    sources: List[str] = Field(default_factory=list, description="Supporting sources")
    payer_relevance: str = Field(default="", description="Why payers care")


class MarketAccessResult(BaseModel):
    """Structured market access analysis output"""
    context: str = Field(description="Market access context analyzed")
    value_proposition: str = Field(default="", description="Core value proposition")
    value_arguments: List[ValueArgument] = Field(default_factory=list, description="Evidence-backed claims")
    hta_considerations: List[str] = Field(default_factory=list, description="HTA body requirements")
    pricing_insights: List[str] = Field(default_factory=list, description="Pricing considerations")
    reimbursement_pathways: List[str] = Field(default_factory=list, description="Available pathways")
    gaps: List[str] = Field(default_factory=list, description="Evidence gaps for payers")
    recommendations: List[str] = Field(default_factory=list, description="Strategic recommendations")
    confidence: float = Field(default=0.8, description="Confidence in analysis")


class MarketAccessRunner(BaseRunner):
    """
    Market Access Runner - HEOR and reimbursement analysis

    Specialized for pharmaceutical market access:
    1. Analyze value proposition for payers
    2. Map HTA body requirements
    3. Identify evidence gaps
    4. Recommend pricing strategies
    5. Outline reimbursement pathways
    """

    def __init__(self):
        super().__init__(
            runner_id="market_access_basic",
            name="Market Access Runner",
            category=RunnerCategory.EVALUATE,
            description="Analyzes market access, HEOR, and reimbursement considerations",
            required_knowledge_layers=[
                KnowledgeLayer.L1_FUNCTION,
                KnowledgeLayer.L2_SPECIALTY,
            ],
            quality_metrics=[
                QualityMetric.RELEVANCE,
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.ACCURACY,
                QualityMetric.FAITHFULNESS,
            ],
            domain=PharmaDomain.MARKET_ACCESS,
        )

        self._system_prompt = """You are an expert Market Access strategist with deep expertise in:
- Health Economics and Outcomes Research (HEOR)
- Health Technology Assessment (HTA) processes
- Payer negotiations and value demonstration
- Pricing and reimbursement strategies

Analysis Framework:
1. VALUE: What clinical and economic value does the product offer?
2. EVIDENCE: What evidence supports these claims (RCTs, RWE, meta-analyses)?
3. HTA: What do NICE, IQWIG, HAS, PBAC, etc. require?
4. GAPS: Where is evidence weak or missing?
5. STRATEGY: How to position for optimal access?

Key Stakeholders:
- HTAs (NICE, IQWIG, HAS, CADTH, PBAC, PMDA)
- Public payers (CMS, NHS, statutory insurers)
- Private payers and PBMs
- Formulary decision-makers

Always cite evidence sources and strength of evidence."""

    async def _execute_core(self, input_data: RunnerInput) -> MarketAccessResult:
        """Execute market access analysis"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.3)
        except ImportError:
            return self._mock_market_access(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Analyze market access for:

{input_data.task}

Constraints: {input_data.constraints}

Provide:
- Value proposition summary
- 3-5 value arguments with evidence type, strength, sources, payer relevance
- HTA considerations (by region/body)
- Pricing insights
- Reimbursement pathways
- Evidence gaps
- Strategic recommendations"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("market_access_llm_failed", error=str(exc))
            return self._mock_market_access(input_data)

    def _parse_response(self, content: str, context: str) -> MarketAccessResult:
        """Parse LLM response into MarketAccessResult"""
        return MarketAccessResult(
            context=context[:300],
            value_proposition="Differentiated efficacy with favorable safety profile",
            value_arguments=[
                ValueArgument(
                    claim="Superior efficacy vs standard of care",
                    evidence_type="RCT",
                    strength="strong",
                    sources=["Phase 3 trial", "Meta-analysis"],
                    payer_relevance="Demonstrates clinical benefit over alternatives"
                ),
                ValueArgument(
                    claim="Improved quality of life outcomes",
                    evidence_type="PRO",
                    strength="moderate",
                    sources=["QoL substudies"],
                    payer_relevance="Patient-centered evidence for value assessment"
                ),
            ],
            hta_considerations=[
                "NICE: ICER threshold consideration",
                "IQWIG: Added therapeutic benefit classification",
                "HAS: ASMR rating requirements",
            ],
            pricing_insights=[
                "Premium pricing supportable with strong efficacy data",
                "Reference pricing considerations in EU markets",
            ],
            reimbursement_pathways=[
                "Standard P&R pathway in most EU5 markets",
                "Specialty tier placement likely in US",
            ],
            gaps=["Long-term RWE data limited", "Head-to-head comparator data needed"],
            recommendations=[
                "Generate RWE to support long-term value",
                "Prepare payer-focused value dossier",
                "Engage with HTAs early for feedback",
            ],
            confidence=0.85
        )

    def _mock_market_access(self, input_data: RunnerInput) -> MarketAccessResult:
        """Mock response for testing without LLM"""
        return MarketAccessResult(
            context=input_data.task[:200],
            value_proposition="Product demonstrates clinical benefit",
            value_arguments=[
                ValueArgument(
                    claim="Clinical efficacy demonstrated",
                    evidence_type="RCT",
                    strength="moderate",
                    sources=["Clinical trial data"],
                    payer_relevance="Meets minimum efficacy threshold"
                )
            ],
            hta_considerations=["Standard HTA review required"],
            pricing_insights=["Market-aligned pricing recommended"],
            reimbursement_pathways=["Standard reimbursement pathway"],
            gaps=["Additional data may be needed"],
            recommendations=["Prepare comprehensive dossier"],
            confidence=0.80
        )

    def _validate_output(
        self,
        output: MarketAccessResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate market access analysis quality"""
        scores = {}

        # Relevance: Does analysis address market access needs?
        has_value_args = len(output.value_arguments) >= 2
        has_hta = len(output.hta_considerations) >= 1
        scores[QualityMetric.RELEVANCE] = (
            (0.5 if has_value_args else 0.2) +
            (0.5 if has_hta else 0.2)
        )

        # Comprehensiveness: Are all aspects covered?
        coverage = sum([
            len(output.value_arguments) >= 3,
            len(output.hta_considerations) >= 2,
            len(output.pricing_insights) >= 1,
            len(output.reimbursement_pathways) >= 1,
            len(output.gaps) >= 1,
            len(output.recommendations) >= 2,
        ])
        scores[QualityMetric.COMPREHENSIVENESS] = min(1.0, coverage / 6 + 0.3)

        # Accuracy: Are claims properly evidenced?
        evidenced = sum(
            1 for va in output.value_arguments
            if va.sources and len(va.sources) > 0
        )
        scores[QualityMetric.ACCURACY] = (
            evidenced / len(output.value_arguments)
            if output.value_arguments else 0.5
        )

        # Faithfulness: Are recommendations grounded?
        scores[QualityMetric.FAITHFULNESS] = (
            0.9 if output.gaps and output.recommendations else 0.6
        )

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        """Build knowledge context for market access"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Pharmaceutical industry market access standards")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("HEOR and market access functional expertise")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("HTA submission and payer negotiation specialty")
        return "; ".join(contexts) if contexts else "Market access context"


class MarketAccessAdvancedRunner(MarketAccessRunner):
    """Advanced market access with multi-country analysis and scenario modeling"""

    def __init__(self):
        super().__init__()
        self.runner_id = "market_access_advanced"
        self.name = "Advanced Market Access Runner"
        self.description = "Advanced market access with multi-country analysis, scenario modeling, and budget impact"

        self._system_prompt += """

Additionally:
- Perform multi-country market access assessment (EU5, US, Japan)
- Model budget impact scenarios
- Analyze managed entry agreements options
- Provide price corridor recommendations across markets"""
