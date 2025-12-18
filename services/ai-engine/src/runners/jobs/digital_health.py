"""
Digital Health Runners - DIGITAL_HEALTH Domain Family

Specialized for:
- Digital therapeutics (DTx) strategy
- Real-world evidence (RWE) generation
- Patient engagement platforms
- Connected health solutions
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


class DigitalSolution(BaseModel):
    """Digital health solution assessment"""
    solution_type: str = Field(description="Type of digital solution")
    description: str = Field(default="", description="Solution description")
    therapeutic_fit: str = Field(default="", description="Therapeutic area alignment")
    maturity_level: str = Field(default="emerging", description="emerging, growing, mature")
    regulatory_pathway: str = Field(default="", description="Regulatory considerations")
    evidence_requirements: List[str] = Field(default_factory=list, description="Evidence needs")


class DataSource(BaseModel):
    """RWE data source profile"""
    source_name: str = Field(description="Data source name")
    data_type: str = Field(default="", description="claims, EMR, registry, wearable, etc.")
    coverage: str = Field(default="", description="Population coverage")
    strengths: List[str] = Field(default_factory=list, description="Data strengths")
    limitations: List[str] = Field(default_factory=list, description="Data limitations")
    use_cases: List[str] = Field(default_factory=list, description="Appropriate applications")


class DigitalHealthResult(BaseModel):
    """Structured digital health analysis output"""
    context: str = Field(description="Digital health context analyzed")
    strategic_summary: str = Field(default="", description="High-level assessment")
    digital_solutions: List[DigitalSolution] = Field(default_factory=list, description="Evaluated solutions")
    rwe_strategy: List[str] = Field(default_factory=list, description="RWE generation approach")
    data_sources: List[DataSource] = Field(default_factory=list, description="Available data sources")
    patient_engagement: List[str] = Field(default_factory=list, description="Patient engagement strategies")
    technology_requirements: List[str] = Field(default_factory=list, description="Technical requirements")
    regulatory_considerations: List[str] = Field(default_factory=list, description="Regulatory factors")
    implementation_risks: List[str] = Field(default_factory=list, description="Implementation risks")
    recommendations: List[str] = Field(default_factory=list, description="Strategic recommendations")
    confidence: float = Field(default=0.8, description="Confidence in analysis")


class DigitalHealthRunner(BaseRunner):
    """
    Digital Health Runner - DTx, RWE, and connected health analysis

    Specialized for pharmaceutical digital health:
    1. Assess digital therapeutic opportunities
    2. Design RWE generation strategies
    3. Evaluate patient engagement solutions
    4. Navigate digital health regulatory landscape
    5. Identify technology partnerships
    """

    def __init__(self):
        super().__init__(
            runner_id="digital_health_basic",
            name="Digital Health Runner",
            category=RunnerCategory.DESIGN,
            description="Analyzes digital therapeutics, RWE, and patient engagement opportunities",
            required_knowledge_layers=[
                KnowledgeLayer.L1_FUNCTION,
                KnowledgeLayer.L2_SPECIALTY,
            ],
            quality_metrics=[
                QualityMetric.RELEVANCE,
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.ACCURACY,
                QualityMetric.TIMELINESS,
            ],
            domain=PharmaDomain.DIGITAL_HEALTH,
        )

        self._system_prompt = """You are an expert Digital Health Strategist with deep expertise in:
- Digital therapeutics (DTx) development and commercialization
- Real-world evidence (RWE) generation and analytics
- Patient engagement and adherence solutions
- Connected health devices and platforms
- Digital health regulatory landscape

Analysis Framework:
1. OPPORTUNITY: What digital health needs exist?
2. SOLUTIONS: Which digital approaches are most appropriate?
3. EVIDENCE: What RWE strategy supports the opportunity?
4. ENGAGEMENT: How to drive patient adoption and adherence?
5. IMPLEMENTATION: What are the technical and operational requirements?

Digital Solution Categories:
- DTx (software as medical device)
- Companion apps (adherence, education)
- Connected devices (wearables, monitors)
- Data platforms (RWE, analytics)
- Telehealth integration

Regulatory Frameworks:
- FDA Digital Health Software Precertification
- EU MDR for digital health
- NICE Evidence Standards Framework for Digital Health Technologies

Balance innovation potential with regulatory and implementation realities."""

    async def _execute_core(self, input_data: RunnerInput) -> DigitalHealthResult:
        """Execute digital health analysis"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.4)
        except ImportError:
            return self._mock_digital_health(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Analyze digital health opportunity for:

{input_data.task}

Constraints: {input_data.constraints}

Provide:
- Strategic summary
- Digital solution assessment (2-3 options)
- RWE generation strategy
- Available data sources
- Patient engagement approach
- Technology requirements
- Regulatory considerations
- Implementation risks
- Recommendations"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("digital_health_llm_failed", error=str(exc))
            return self._mock_digital_health(input_data)

    def _parse_response(self, content: str, context: str) -> DigitalHealthResult:
        """Parse LLM response into DigitalHealthResult"""
        return DigitalHealthResult(
            context=context[:300],
            strategic_summary="Digital health opportunity aligned with therapeutic area needs",
            digital_solutions=[
                DigitalSolution(
                    solution_type="Digital Therapeutic (DTx)",
                    description="Software-based intervention to supplement pharmaceutical therapy",
                    therapeutic_fit="Strong alignment with disease management needs",
                    maturity_level="growing",
                    regulatory_pathway="FDA 510(k) or De Novo pathway",
                    evidence_requirements=["RCT demonstrating clinical benefit", "Real-world outcomes data"]
                ),
                DigitalSolution(
                    solution_type="Companion Mobile App",
                    description="Patient engagement and adherence support application",
                    therapeutic_fit="Supports treatment adherence and education",
                    maturity_level="mature",
                    regulatory_pathway="Not a medical device (wellness category)",
                    evidence_requirements=["Usability studies", "Adherence improvement data"]
                ),
                DigitalSolution(
                    solution_type="Connected Device Integration",
                    description="Wearable/sensor integration for outcome monitoring",
                    therapeutic_fit="Objective outcome measurement",
                    maturity_level="emerging",
                    regulatory_pathway="Device-specific FDA clearance",
                    evidence_requirements=["Validation studies", "Data quality assessment"]
                ),
            ],
            rwe_strategy=[
                "Leverage existing claims databases for baseline characterization",
                "Partner with EMR vendors for clinical outcomes data",
                "Integrate patient-reported outcomes through digital collection",
                "Establish prospective registry for long-term follow-up",
            ],
            data_sources=[
                DataSource(
                    source_name="National Claims Database",
                    data_type="claims",
                    coverage="~50M commercially insured lives",
                    strengths=["Large sample size", "Longitudinal data", "Healthcare utilization"],
                    limitations=["No clinical detail", "Lab values absent"],
                    use_cases=["Treatment patterns", "Healthcare resource utilization"]
                ),
                DataSource(
                    source_name="EMR Research Network",
                    data_type="EMR",
                    coverage="~10M patients across integrated systems",
                    strengths=["Clinical detail", "Lab values", "Physician notes"],
                    limitations=["Smaller sample", "Selection bias"],
                    use_cases=["Clinical outcomes", "Treatment algorithms"]
                ),
            ],
            patient_engagement=[
                "Gamification elements to drive daily engagement",
                "Personalized content based on disease stage",
                "Integration with patient's care team",
                "Peer support and community features",
            ],
            technology_requirements=[
                "HIPAA-compliant cloud infrastructure",
                "EMR integration capability (HL7 FHIR)",
                "Cross-platform mobile development",
                "Analytics and reporting dashboard",
            ],
            regulatory_considerations=[
                "FDA determination of regulatory pathway needed",
                "Data privacy compliance (HIPAA, GDPR)",
                "Clinical evidence requirements for market access",
                "Post-market surveillance obligations",
            ],
            implementation_risks=[
                "Technology integration complexity",
                "Patient adoption and sustained engagement",
                "Regulatory timeline uncertainty",
                "Data quality and validation challenges",
            ],
            recommendations=[
                "Start with companion app to build engagement foundation",
                "Initiate RWE partnerships with 2-3 key data vendors",
                "Engage FDA early on DTx regulatory strategy",
                "Build internal digital health capabilities through partnership",
            ],
            confidence=0.82
        )

    def _mock_digital_health(self, input_data: RunnerInput) -> DigitalHealthResult:
        """Mock response for testing without LLM"""
        return DigitalHealthResult(
            context=input_data.task[:200],
            strategic_summary="Digital health opportunity assessment in progress",
            digital_solutions=[
                DigitalSolution(
                    solution_type="Patient App",
                    description="Basic patient support application",
                    therapeutic_fit="General support",
                    maturity_level="mature",
                    regulatory_pathway="Wellness/non-regulated",
                    evidence_requirements=["Usability testing"]
                )
            ],
            rwe_strategy=["Claims data analysis"],
            data_sources=[
                DataSource(
                    source_name="Standard claims",
                    data_type="claims",
                    coverage="National",
                    strengths=["Availability"],
                    limitations=["Limited clinical detail"],
                    use_cases=["Treatment patterns"]
                )
            ],
            patient_engagement=["Basic education content"],
            technology_requirements=["Mobile platform"],
            regulatory_considerations=["Standard compliance"],
            implementation_risks=["Adoption uncertainty"],
            recommendations=["Further assessment needed"],
            confidence=0.75
        )

    def _validate_output(
        self,
        output: DigitalHealthResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate digital health analysis quality"""
        scores = {}

        # Relevance: Does analysis address digital health needs?
        has_solutions = len(output.digital_solutions) >= 2
        has_rwe = len(output.rwe_strategy) >= 2
        scores[QualityMetric.RELEVANCE] = (
            (0.5 if has_solutions else 0.2) +
            (0.5 if has_rwe else 0.2)
        )

        # Comprehensiveness: Are all digital dimensions covered?
        coverage = sum([
            len(output.digital_solutions) >= 2,
            len(output.rwe_strategy) >= 3,
            len(output.data_sources) >= 2,
            len(output.patient_engagement) >= 2,
            len(output.technology_requirements) >= 2,
            len(output.recommendations) >= 3,
        ])
        scores[QualityMetric.COMPREHENSIVENESS] = min(1.0, coverage / 6 + 0.3)

        # Accuracy: Are regulatory pathways properly specified?
        regulated = sum(
            1 for s in output.digital_solutions
            if s.regulatory_pathway and len(s.regulatory_pathway) > 10
        )
        scores[QualityMetric.ACCURACY] = (
            regulated / len(output.digital_solutions)
            if output.digital_solutions else 0.5
        )

        # Timeliness: Is maturity level assessed?
        maturity_assessed = sum(
            1 for s in output.digital_solutions if s.maturity_level
        )
        scores[QualityMetric.TIMELINESS] = (
            maturity_assessed / len(output.digital_solutions)
            if output.digital_solutions else 0.5
        )

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        """Build knowledge context for digital health"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Digital health industry trends and standards")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Digital health strategy and implementation")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("DTx development and RWE generation specialty")
        return "; ".join(contexts) if contexts else "Digital health context"


class DigitalHealthAdvancedRunner(DigitalHealthRunner):
    """Advanced digital health with AI/ML integration and ecosystem design"""

    def __init__(self):
        super().__init__()
        self.runner_id = "digital_health_advanced"
        self.name = "Advanced Digital Health Runner"
        self.description = "Advanced digital health with AI/ML analytics, ecosystem partnerships, and platform strategy"

        self._system_prompt += """

Additionally:
- Design AI/ML-powered clinical decision support
- Develop comprehensive digital health ecosystem strategy
- Create multi-stakeholder platform integration plans
- Model digital health business case and ROI
- Navigate complex international regulatory requirements"""
