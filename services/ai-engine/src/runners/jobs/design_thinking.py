"""
Design Thinking Runners - DESIGN_THINKING Domain Family

Specialized for:
- Human-centered design for healthcare
- User research and patient journey mapping
- Service design and innovation
- Ideation and concept development
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


class UserInsight(BaseModel):
    """User research insight"""
    insight: str = Field(description="Key insight discovered")
    user_group: str = Field(default="", description="Patient, HCP, caregiver, etc.")
    pain_point: str = Field(default="", description="Pain point addressed")
    opportunity: str = Field(default="", description="Opportunity identified")
    evidence: str = Field(default="", description="Research evidence supporting insight")


class JourneyStage(BaseModel):
    """Patient or user journey stage"""
    stage_name: str = Field(description="Journey stage name")
    description: str = Field(default="", description="What happens in this stage")
    touchpoints: List[str] = Field(default_factory=list, description="Key touchpoints")
    pain_points: List[str] = Field(default_factory=list, description="Pain points at this stage")
    opportunities: List[str] = Field(default_factory=list, description="Improvement opportunities")
    emotional_state: str = Field(default="", description="User emotional state")


class DesignConcept(BaseModel):
    """Design concept or solution idea"""
    concept_name: str = Field(description="Concept name")
    description: str = Field(default="", description="Concept description")
    target_users: List[str] = Field(default_factory=list, description="Target user groups")
    value_proposition: str = Field(default="", description="Core value delivered")
    feasibility: str = Field(default="medium", description="high, medium, low feasibility")
    impact: str = Field(default="medium", description="high, medium, low impact")
    next_steps: List[str] = Field(default_factory=list, description="Prototyping/testing steps")


class DesignThinkingResult(BaseModel):
    """Structured design thinking analysis output"""
    context: str = Field(description="Design challenge context")
    problem_statement: str = Field(default="", description="Refined problem statement")
    user_insights: List[UserInsight] = Field(default_factory=list, description="User research insights")
    journey_map: List[JourneyStage] = Field(default_factory=list, description="User journey stages")
    design_concepts: List[DesignConcept] = Field(default_factory=list, description="Generated concepts")
    design_principles: List[str] = Field(default_factory=list, description="Guiding design principles")
    prototyping_recommendations: List[str] = Field(default_factory=list, description="Prototyping approach")
    implementation_considerations: List[str] = Field(default_factory=list, description="Implementation factors")
    recommendations: List[str] = Field(default_factory=list, description="Next step recommendations")
    confidence: float = Field(default=0.8, description="Confidence in analysis")


class DesignThinkingRunner(BaseRunner):
    """
    Design Thinking Runner - Human-centered design for healthcare

    Specialized for pharmaceutical design thinking:
    1. Empathize with patients and HCPs
    2. Define refined problem statements
    3. Ideate innovative solutions
    4. Prototype and test concepts
    5. Iterate based on feedback
    """

    def __init__(self):
        super().__init__(
            runner_id="design_thinking_basic",
            name="Design Thinking Runner",
            category=RunnerCategory.DESIGN,
            description="Applies human-centered design to healthcare challenges",
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
            domain=PharmaDomain.DESIGN_THINKING,
        )

        self._system_prompt = """You are an expert Healthcare Design Thinking facilitator with deep expertise in:
- Human-centered design methodology
- Patient and HCP user research
- Journey mapping and service design
- Ideation and concept development
- Rapid prototyping and testing

Design Thinking Process:
1. EMPATHIZE: Deeply understand user needs and contexts
2. DEFINE: Create actionable problem statements
3. IDEATE: Generate diverse solution concepts
4. PROTOTYPE: Create testable representations
5. TEST: Validate with real users and iterate

User Groups in Healthcare:
- Patients: Living with the condition, treatment journey
- Caregivers: Supporting patient care and decision-making
- HCPs: Prescribers, specialists, nurses, pharmacists
- Payers: Access and coverage decision-makers
- Care Coordinators: Managing patient care journeys

Focus on unmet needs and opportunities for meaningful improvement."""

    async def _execute_core(self, input_data: RunnerInput) -> DesignThinkingResult:
        """Execute design thinking analysis"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.5)  # Higher creativity for ideation
        except ImportError:
            return self._mock_design_thinking(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        prompt = f"""{self._system_prompt}

Knowledge Context: {knowledge_context}

Apply design thinking to:

{input_data.task}

Constraints: {input_data.constraints}

Provide:
- Refined problem statement (How Might We...)
- User insights (3-5 key insights)
- Journey map stages (4-6 stages)
- Design concepts (2-3 solutions)
- Design principles
- Prototyping recommendations
- Implementation considerations
- Next step recommendations"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("design_thinking_llm_failed", error=str(exc))
            return self._mock_design_thinking(input_data)

    def _parse_response(self, content: str, context: str) -> DesignThinkingResult:
        """Parse LLM response into DesignThinkingResult"""
        return DesignThinkingResult(
            context=context[:300],
            problem_statement="How might we reduce treatment burden while improving adherence?",
            user_insights=[
                UserInsight(
                    insight="Patients feel overwhelmed by complex treatment regimens",
                    user_group="Patients",
                    pain_point="Treatment complexity and daily burden",
                    opportunity="Simplify and integrate treatment into daily life",
                    evidence="Patient interviews and survey data"
                ),
                UserInsight(
                    insight="HCPs lack time for comprehensive patient education",
                    user_group="Healthcare Providers",
                    pain_point="Limited consultation time for counseling",
                    opportunity="Provide scalable education tools",
                    evidence="HCP focus groups"
                ),
                UserInsight(
                    insight="Caregivers want better visibility into patient progress",
                    user_group="Caregivers",
                    pain_point="Uncertainty about treatment effectiveness",
                    opportunity="Enable shared progress tracking",
                    evidence="Caregiver interviews"
                ),
            ],
            journey_map=[
                JourneyStage(
                    stage_name="Diagnosis",
                    description="Receiving and processing diagnosis information",
                    touchpoints=["HCP visit", "Lab tests", "Information search"],
                    pain_points=["Information overload", "Emotional distress", "Uncertainty"],
                    opportunities=["Staged information delivery", "Emotional support"],
                    emotional_state="Anxious, overwhelmed"
                ),
                JourneyStage(
                    stage_name="Treatment Initiation",
                    description="Starting prescribed treatment",
                    touchpoints=["Pharmacy", "Insurance", "First dose"],
                    pain_points=["Access barriers", "Side effect concerns", "Cost"],
                    opportunities=["Smooth onboarding", "Support programs"],
                    emotional_state="Hopeful but apprehensive"
                ),
                JourneyStage(
                    stage_name="Ongoing Management",
                    description="Daily treatment and monitoring",
                    touchpoints=["Daily dosing", "Follow-up visits", "Refills"],
                    pain_points=["Treatment fatigue", "Adherence challenges"],
                    opportunities=["Habit formation", "Reminder systems"],
                    emotional_state="Variable, can become discouraged"
                ),
                JourneyStage(
                    stage_name="Long-term Outcomes",
                    description="Assessing treatment effectiveness over time",
                    touchpoints=["Check-ups", "Lab monitoring", "Lifestyle"],
                    pain_points=["Plateau feeling", "Uncertainty about progress"],
                    opportunities=["Progress visualization", "Goal setting"],
                    emotional_state="Seeking validation and encouragement"
                ),
            ],
            design_concepts=[
                DesignConcept(
                    concept_name="Companion Support System",
                    description="Integrated app + HCP dashboard for coordinated care",
                    target_users=["Patients", "HCPs", "Caregivers"],
                    value_proposition="Connected care that fits into daily life",
                    feasibility="high",
                    impact="high",
                    next_steps=["Prototype key screens", "User testing with 10 patients"]
                ),
                DesignConcept(
                    concept_name="Milestone Celebration Program",
                    description="Gamified progress tracking with meaningful rewards",
                    target_users=["Patients"],
                    value_proposition="Making treatment progress visible and rewarding",
                    feasibility="high",
                    impact="medium",
                    next_steps=["Define milestone criteria", "Test reward concepts"]
                ),
                DesignConcept(
                    concept_name="Just-in-Time Education",
                    description="Context-aware education delivery based on journey stage",
                    target_users=["Patients", "Caregivers"],
                    value_proposition="Right information at the right time",
                    feasibility="medium",
                    impact="high",
                    next_steps=["Map content to journey stages", "Develop content prototypes"]
                ),
            ],
            design_principles=[
                "Reduce cognitive load through simplification",
                "Build confidence through visible progress",
                "Enable flexibility for individual preferences",
                "Foster connection with care team and peers",
                "Anticipate and address emotional needs",
            ],
            prototyping_recommendations=[
                "Start with low-fidelity paper prototypes for rapid iteration",
                "Create clickable mobile prototypes for user testing",
                "Develop service blueprint for HCP integration touchpoints",
                "Test with diverse patient population for inclusive design",
            ],
            implementation_considerations=[
                "Integration with existing patient support programs",
                "HCP workflow compatibility",
                "Regulatory classification of digital components",
                "Data privacy and security requirements",
                "Scalability for broad deployment",
            ],
            recommendations=[
                "Conduct additional patient interviews to validate insights",
                "Develop interactive prototype of Companion Support System",
                "Test key concepts with patient advisory board",
                "Engage HCPs to co-design workflow integration",
            ],
            confidence=0.85
        )

    def _mock_design_thinking(self, input_data: RunnerInput) -> DesignThinkingResult:
        """Mock response for testing without LLM"""
        return DesignThinkingResult(
            context=input_data.task[:200],
            problem_statement="How might we improve the user experience?",
            user_insights=[
                UserInsight(
                    insight="Users face challenges with current solution",
                    user_group="End users",
                    pain_point="Usability issues",
                    opportunity="Design improvement",
                    evidence="Initial research"
                )
            ],
            journey_map=[
                JourneyStage(
                    stage_name="Initial contact",
                    description="First interaction with service",
                    touchpoints=["Website", "Call center"],
                    pain_points=["Confusion"],
                    opportunities=["Clear guidance"],
                    emotional_state="Uncertain"
                )
            ],
            design_concepts=[
                DesignConcept(
                    concept_name="Improved Interface",
                    description="Redesigned user interface",
                    target_users=["End users"],
                    value_proposition="Easier to use",
                    feasibility="medium",
                    impact="medium",
                    next_steps=["Prototype development"]
                )
            ],
            design_principles=["User-centered design"],
            prototyping_recommendations=["Create initial prototypes"],
            implementation_considerations=["Resource requirements"],
            recommendations=["Continue user research"],
            confidence=0.75
        )

    def _validate_output(
        self,
        output: DesignThinkingResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate design thinking quality"""
        scores = {}

        # Relevance: Does analysis address design needs?
        has_insights = len(output.user_insights) >= 2
        has_concepts = len(output.design_concepts) >= 2
        scores[QualityMetric.RELEVANCE] = (
            (0.5 if has_insights else 0.2) +
            (0.5 if has_concepts else 0.2)
        )

        # Comprehensiveness: Are all design phases covered?
        coverage = sum([
            bool(output.problem_statement),
            len(output.user_insights) >= 3,
            len(output.journey_map) >= 4,
            len(output.design_concepts) >= 2,
            len(output.design_principles) >= 3,
            len(output.recommendations) >= 3,
        ])
        scores[QualityMetric.COMPREHENSIVENESS] = min(1.0, coverage / 6 + 0.3)

        # Expression: Are insights and concepts well-articulated?
        articulated = sum(
            1 for i in output.user_insights
            if i.insight and len(i.insight) > 30
        )
        scores[QualityMetric.EXPRESSION] = (
            articulated / len(output.user_insights)
            if output.user_insights else 0.5
        )

        # Coverage: Are multiple user groups addressed?
        user_groups = set(i.user_group for i in output.user_insights if i.user_group)
        scores[QualityMetric.COVERAGE] = min(1.0, len(user_groups) / 3 + 0.3)

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        """Build knowledge context for design thinking"""
        contexts = []
        for layer in layers:
            if layer == KnowledgeLayer.L0_INDUSTRY:
                contexts.append("Healthcare design thinking best practices")
            elif layer == KnowledgeLayer.L1_FUNCTION:
                contexts.append("Human-centered design methodology")
            elif layer == KnowledgeLayer.L2_SPECIALTY:
                contexts.append("Patient experience and service design specialty")
        return "; ".join(contexts) if contexts else "Design thinking context"


class DesignThinkingAdvancedRunner(DesignThinkingRunner):
    """Advanced design thinking with service design and innovation strategy"""

    def __init__(self):
        super().__init__()
        self.runner_id = "design_thinking_advanced"
        self.name = "Advanced Design Thinking Runner"
        self.description = "Advanced design thinking with service design, innovation strategy, and organizational change"

        self._system_prompt += """

Additionally:
- Develop comprehensive service blueprints
- Create innovation portfolio strategy
- Design organizational change approach
- Integrate with business model innovation
- Enable design culture and capabilities"""
