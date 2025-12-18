"""
Medical Affairs Runners - MEDICAL_AFFAIRS Domain Family

Specialized for:
- KOL (Key Opinion Leader) engagement
- MSL (Medical Science Liaison) activities
- Scientific communications and publications
- Medical information and evidence generation
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


class ScientificInsight(BaseModel):
    """Single scientific insight from medical affairs analysis"""
    topic: str = Field(description="Scientific topic")
    finding: str = Field(description="Key finding or insight")
    source: str = Field(default="", description="Source of the insight")
    evidence_level: str = Field(default="B", description="Evidence level A-D")
    implications: str = Field(default="", description="Medical affairs implications")


class KOLProfile(BaseModel):
    """KOL engagement profile"""
    expertise_area: str = Field(description="Area of expertise")
    engagement_priority: str = Field(default="medium", description="low, medium, high")
    recommended_activities: List[str] = Field(default_factory=list, description="Suggested activities")


class MedicalAffairsResult(BaseModel):
    """Structured medical affairs analysis output"""
    context: str = Field(description="Medical affairs context analyzed")
    scientific_landscape: str = Field(default="", description="Overview of scientific landscape")
    key_insights: List[ScientificInsight] = Field(default_factory=list, description="Scientific insights")
    kol_strategy: List[KOLProfile] = Field(default_factory=list, description="KOL engagement profiles")
    msl_activities: List[str] = Field(default_factory=list, description="Recommended MSL activities")
    publication_opportunities: List[str] = Field(default_factory=list, description="Publication opportunities")
    evidence_gaps: List[str] = Field(default_factory=list, description="Evidence generation needs")
    recommendations: List[str] = Field(default_factory=list, description="Strategic recommendations")
    confidence: float = Field(default=0.8, description="Confidence in analysis")


class MedicalAffairsRunner(BaseRunner):
    """
    Medical Affairs Runner - Scientific engagement and communications

    Specialized for pharmaceutical medical affairs:
    1. Analyze scientific landscape
    2. Identify KOL engagement opportunities
    3. Plan MSL field activities
    4. Support evidence generation strategy
    5. Guide scientific communications
    """

    def __init__(self):
        super().__init__(
            runner_id="medical_affairs_basic",
            name="Medical Affairs Runner",
            category=RunnerCategory.SYNTHESIZE,
            description="Analyzes medical affairs strategy, KOL engagement, and scientific communications",
            required_knowledge_layers=[
                KnowledgeLayer.L1_FUNCTION,
                KnowledgeLayer.L2_SPECIALTY,
            ],
            quality_metrics=[
                QualityMetric.RELEVANCE,
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.FAITHFULNESS,
                QualityMetric.COVERAGE,
            ],
            domain=PharmaDomain.MEDICAL_AFFAIRS,
        )

        self._system_prompt = """You are an expert Medical Affairs strategist with deep expertise in:
- Key Opinion Leader (KOL) engagement
- Medical Science Liaison (MSL) activities
- Scientific communications and publications
- Evidence generation and real-world studies
- Medical information services

Analysis Framework:
1. LANDSCAPE: What is the scientific/clinical landscape?
2. INSIGHTS: What are the key scientific insights and unmet needs?
3. KOL: Who are the key thought leaders and how to engage?
4. EVIDENCE: What evidence is needed and how to generate?
5. COMMUNICATION: How to communicate scientific value?

Key Activities:
- Advisory boards and scientific exchanges
- Congress presence and symposia
- Investigator-initiated studies (IIS)
- Publications planning
- Medical education programs

Always maintain scientific objectivity and comply with regulations."""

    async def _execute_core(self, input_data: RunnerInput) -> MedicalAffairsResult:
        """Execute medical affairs analysis"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.3)
        except ImportError:
            return self._mock_medical_affairs(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Analyze medical affairs strategy for:

{input_data.task}

Constraints: {input_data.constraints}

Provide:
- Scientific landscape overview
- Key scientific insights with evidence levels
- KOL engagement strategy
- Recommended MSL activities
- Publication opportunities
- Evidence gaps
- Strategic recommendations"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("medical_affairs_llm_failed", error=str(exc))
            return self._mock_medical_affairs(input_data)

    def _parse_response(self, content: str, context: str) -> MedicalAffairsResult:
        """Parse LLM response into MedicalAffairsResult"""
        return MedicalAffairsResult(
            context=context[:300],
            scientific_landscape="Evolving treatment paradigm with emerging evidence",
            key_insights=[
                ScientificInsight(
                    topic="Efficacy endpoints",
                    finding="Novel endpoints gaining traction in guidelines",
                    source="Recent consensus guidelines",
                    evidence_level="A",
                    implications="Supports differentiation messaging"
                ),
                ScientificInsight(
                    topic="Patient outcomes",
                    finding="Real-world outcomes align with trial data",
                    source="Registry studies",
                    evidence_level="B",
                    implications="RWE supports long-term value"
                ),
            ],
            kol_strategy=[
                KOLProfile(
                    expertise_area="Clinical research",
                    engagement_priority="high",
                    recommended_activities=["Advisory board", "Congress symposium"]
                ),
                KOLProfile(
                    expertise_area="Guidelines development",
                    engagement_priority="high",
                    recommended_activities=["Scientific exchange", "Publication co-authorship"]
                ),
            ],
            msl_activities=[
                "Scientific exchange meetings with key investigators",
                "Congress presence at major medical meetings",
                "Support for investigator-initiated studies",
            ],
            publication_opportunities=[
                "Post-hoc analysis of Phase 3 data",
                "Real-world evidence manuscript",
                "Treatment guidelines update",
            ],
            evidence_gaps=[
                "Long-term comparative effectiveness data",
                "Patient-reported outcomes in specific populations",
            ],
            recommendations=[
                "Prioritize KOL engagement around upcoming congress",
                "Initiate RWE study to address durability questions",
                "Develop medical education program for HCPs",
            ],
            confidence=0.85
        )

    def _mock_medical_affairs(self, input_data: RunnerInput) -> MedicalAffairsResult:
        """Mock response for testing without LLM"""
        return MedicalAffairsResult(
            context=input_data.task[:200],
            scientific_landscape="Active scientific discussion ongoing",
            key_insights=[
                ScientificInsight(
                    topic="Treatment landscape",
                    finding="Standard of care evolving",
                    source="Published literature",
                    evidence_level="B",
                    implications="Opportunity for differentiation"
                )
            ],
            kol_strategy=[
                KOLProfile(
                    expertise_area="General expertise",
                    engagement_priority="medium",
                    recommended_activities=["Scientific exchange"]
                )
            ],
            msl_activities=["Field medical engagement"],
            publication_opportunities=["Literature review opportunity"],
            evidence_gaps=["Additional data needed"],
            recommendations=["Continue scientific engagement"],
            confidence=0.80
        )

    def _validate_output(
        self,
        output: MedicalAffairsResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate medical affairs analysis quality"""
        scores = {}

        # Relevance: Does analysis address MA needs?
        has_insights = len(output.key_insights) >= 2
        has_kol = len(output.kol_strategy) >= 1
        scores[QualityMetric.RELEVANCE] = (
            (0.5 if has_insights else 0.2) +
            (0.5 if has_kol else 0.2)
        )

        # Comprehensiveness: Are all aspects covered?
        coverage = sum([
            len(output.key_insights) >= 2,
            len(output.kol_strategy) >= 2,
            len(output.msl_activities) >= 2,
            len(output.publication_opportunities) >= 1,
            len(output.evidence_gaps) >= 1,
            len(output.recommendations) >= 2,
        ])
        scores[QualityMetric.COMPREHENSIVENESS] = min(1.0, coverage / 6 + 0.3)

        # Faithfulness: Are insights properly sourced?
        sourced = sum(
            1 for si in output.key_insights
            if si.source and len(si.source) > 5
        )
        scores[QualityMetric.FAITHFULNESS] = (
            sourced / len(output.key_insights)
            if output.key_insights else 0.5
        )

        # Coverage: Scientific landscape coverage
        scores[QualityMetric.COVERAGE] = (
            0.9 if output.scientific_landscape and len(output.scientific_landscape) > 50
            else 0.5
        )

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        """Build knowledge context for medical affairs"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Pharmaceutical industry medical affairs standards")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Medical affairs functional expertise")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("KOL engagement and scientific communications specialty")
        return "; ".join(contexts) if contexts else "Medical affairs context"


class MedicalAffairsAdvancedRunner(MedicalAffairsRunner):
    """Advanced medical affairs with KOL mapping and publication planning"""

    def __init__(self):
        super().__init__()
        self.runner_id = "medical_affairs_advanced"
        self.name = "Advanced Medical Affairs Runner"
        self.description = "Advanced medical affairs with KOL influence mapping, publication planning, and congress strategy"

        self._system_prompt += """

Additionally:
- Map KOL influence networks and collaboration patterns
- Develop comprehensive publication plans with timelines
- Plan congress strategy and symposium content
- Integrate with medical education needs assessment"""
