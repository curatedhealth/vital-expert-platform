#!/usr/bin/env python3
"""
VITAL Path Jobs-to-be-Done Framework
Outcome-driven innovation framework for healthcare AI systems

PROMPT 2.9: Jobs-to-be-Done Framework - Outcome Mapping & Innovation
- Customer job mapping and outcome identification
- Opportunity scoring and prioritization
- Innovation pathway development
- Success metric definition and tracking
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import uuid
import statistics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JobType(Enum):
    """Types of jobs in healthcare context"""
    FUNCTIONAL_JOB = "functional_job"           # What needs to be accomplished
    EMOTIONAL_JOB = "emotional_job"             # How they want to feel
    SOCIAL_JOB = "social_job"                   # How they want to be perceived

class JobExecutor(Enum):
    """Who executes the job"""
    HEALTHCARE_PROVIDER = "healthcare_provider"
    PATIENT = "patient"
    RESEARCHER = "researcher"
    REGULATOR = "regulator"
    PAYER = "payer"
    CAREGIVER = "caregiver"
    PHARMACEUTICAL_COMPANY = "pharmaceutical_company"
    HEALTH_SYSTEM = "health_system"

class OutcomeType(Enum):
    """Types of desired outcomes"""
    SPEED_OUTCOME = "speed_outcome"             # Time-related outcomes
    QUALITY_OUTCOME = "quality_outcome"         # Quality improvements
    COST_OUTCOME = "cost_outcome"               # Cost reductions
    SAFETY_OUTCOME = "safety_outcome"           # Safety improvements
    CONVENIENCE_OUTCOME = "convenience_outcome" # Ease of use
    EFFICACY_OUTCOME = "efficacy_outcome"       # Clinical effectiveness
    ACCESS_OUTCOME = "access_outcome"           # Accessibility improvements

class OpportunityScore(Enum):
    """Opportunity scoring levels"""
    LOW_OPPORTUNITY = "low_opportunity"         # 0-40
    MODERATE_OPPORTUNITY = "moderate_opportunity" # 41-60
    HIGH_OPPORTUNITY = "high_opportunity"       # 61-80
    BREAKTHROUGH_OPPORTUNITY = "breakthrough_opportunity" # 81-100

class SolutionMaturity(Enum):
    """Maturity level of current solutions"""
    NO_SOLUTION = "no_solution"
    EMERGING_SOLUTION = "emerging_solution"
    DEVELOPING_SOLUTION = "developing_solution"
    MATURE_SOLUTION = "mature_solution"
    OPTIMAL_SOLUTION = "optimal_solution"

@dataclass
class DesiredOutcome:
    """A desired outcome for a job"""
    outcome_id: str
    outcome_statement: str
    outcome_type: OutcomeType
    importance_score: float      # 1-10 scale
    satisfaction_score: float    # 1-10 scale
    opportunity_score: float     # Calculated: importance + max(0, importance - satisfaction)
    measurement_criteria: List[str]
    current_solutions: List[str]
    solution_gaps: List[str]
    stakeholder_priority: Dict[str, float]
    evidence_level: str
    regulatory_considerations: List[str]

@dataclass
class CustomerJob:
    """A job that a customer is trying to get done"""
    job_id: str
    job_statement: str
    job_type: JobType
    job_executor: JobExecutor
    context: str
    circumstances: List[str]
    desired_outcomes: List[DesiredOutcome]
    current_solutions: List[str]
    solution_satisfaction: float
    job_frequency: str
    job_importance: float
    market_size: Optional[float]
    growth_rate: Optional[float]
    competitive_landscape: List[str]
    regulatory_environment: str
    therapeutic_area: Optional[str]

@dataclass
class OpportunityAssessment:
    """Assessment of innovation opportunity"""
    assessment_id: str
    job: CustomerJob
    top_opportunities: List[DesiredOutcome]
    opportunity_segments: Dict[str, List[DesiredOutcome]]
    innovation_pathways: List[str]
    competitive_advantages: List[str]
    technical_feasibility: float
    regulatory_feasibility: float
    commercial_viability: float
    overall_attractiveness: float
    recommended_approach: str
    success_metrics: List[str]
    risk_factors: List[str]
    timeline_estimate: str

@dataclass
class InnovationProject:
    """Innovation project based on JTBD insights"""
    project_id: str
    project_name: str
    target_job: CustomerJob
    target_outcomes: List[DesiredOutcome]
    solution_concept: str
    value_proposition: str
    success_metrics: List[str]
    development_phases: List[str]
    resource_requirements: Dict[str, Any]
    timeline: Dict[str, str]
    risk_mitigation: List[str]
    stakeholder_engagement: Dict[str, str]
    regulatory_strategy: str
    commercial_strategy: str
    status: str
    progress_indicators: Dict[str, float]

@dataclass
class JobMapping:
    """Complete job mapping for a domain"""
    mapping_id: str
    domain: str
    therapeutic_area: Optional[str]
    stakeholder_jobs: Dict[JobExecutor, List[CustomerJob]]
    job_relationships: Dict[str, List[str]]
    outcome_hierarchy: Dict[str, List[str]]
    opportunity_matrix: Dict[str, OpportunityAssessment]
    innovation_roadmap: List[InnovationProject]
    market_insights: Dict[str, Any]
    competitive_analysis: Dict[str, Any]
    created_at: datetime
    last_updated: datetime

class JobsToBeDoneFramework:
    """
    Jobs-to-be-Done Framework for VITAL Path

    Capabilities:
    - Customer job identification and mapping
    - Desired outcome discovery and prioritization
    - Opportunity scoring and innovation pathway development
    - Solution concept generation and validation
    - Success metric definition and outcome tracking
    - Market opportunity assessment and competitive analysis
    """

    def __init__(self):
        self.job_mappings: Dict[str, JobMapping] = {}
        self.opportunity_assessments: Dict[str, OpportunityAssessment] = {}
        self.innovation_projects: Dict[str, InnovationProject] = {}
        self.outcome_templates: Dict[OutcomeType, List[str]] = {}
        self.scoring_algorithms: Dict[str, Any] = {}

        # Initialize the JTBD framework
        asyncio.create_task(self._initialize_jtbd_framework())

    async def _initialize_jtbd_framework(self):
        """Initialize the Jobs-to-be-Done framework"""
        logger.info("Initializing VITAL Path Jobs-to-be-Done Framework...")

        # Initialize outcome templates
        await self._setup_outcome_templates()

        # Setup scoring algorithms
        await self._setup_scoring_algorithms()

        # Initialize healthcare job examples
        await self._setup_healthcare_job_examples()

        # Setup innovation methodologies
        await self._setup_innovation_methodologies()

        logger.info("JTBD Framework initialized successfully")

    async def _setup_outcome_templates(self):
        """Setup templates for different outcome types"""

        self.outcome_templates = {
            OutcomeType.SPEED_OUTCOME: [
                "Minimize the time it takes to [accomplish task]",
                "Reduce the time between [start event] and [end event]",
                "Increase the speed of [process]",
                "Minimize delays in [workflow step]",
                "Accelerate [decision-making process]"
            ],
            OutcomeType.QUALITY_OUTCOME: [
                "Increase the accuracy of [measurement/diagnosis]",
                "Improve the precision of [intervention]",
                "Minimize errors in [process]",
                "Enhance the reliability of [system/method]",
                "Increase the consistency of [outcomes]"
            ],
            OutcomeType.COST_OUTCOME: [
                "Minimize the cost of [treatment/intervention]",
                "Reduce operational expenses for [process]",
                "Decrease resource utilization for [activity]",
                "Minimize waste in [workflow]",
                "Optimize budget allocation for [program]"
            ],
            OutcomeType.SAFETY_OUTCOME: [
                "Minimize the risk of [adverse event]",
                "Reduce patient safety incidents",
                "Increase medication safety",
                "Minimize exposure to [hazard]",
                "Improve infection prevention"
            ],
            OutcomeType.CONVENIENCE_OUTCOME: [
                "Minimize effort required to [complete task]",
                "Reduce complexity of [process]",
                "Increase ease of use for [system]",
                "Minimize number of steps in [workflow]",
                "Improve accessibility of [service]"
            ],
            OutcomeType.EFFICACY_OUTCOME: [
                "Maximize therapeutic effectiveness",
                "Increase treatment response rates",
                "Improve clinical outcomes",
                "Enhance patient recovery",
                "Optimize therapeutic benefit"
            ],
            OutcomeType.ACCESS_OUTCOME: [
                "Increase availability of [service/treatment]",
                "Improve geographic access to [care]",
                "Reduce barriers to [healthcare service]",
                "Enhance equity in [treatment access]",
                "Minimize disparities in [care delivery]"
            ]
        }

    async def _setup_scoring_algorithms(self):
        """Setup algorithms for opportunity scoring"""

        def calculate_opportunity_score(importance: float, satisfaction: float) -> float:
            """Calculate opportunity score using JTBD formula"""
            return importance + max(0, importance - satisfaction)

        def assess_market_attractiveness(
            opportunity_score: float,
            market_size: float,
            growth_rate: float,
            competitive_intensity: float
        ) -> float:
            """Assess overall market attractiveness"""

            # Normalize inputs (assuming 0-10 scales for most inputs)
            norm_opportunity = opportunity_score / 20  # Max opportunity score is ~20
            norm_market_size = min(market_size / 1000, 1.0)  # Normalize market size
            norm_growth = min(growth_rate / 0.5, 1.0)  # Cap at 50% growth
            norm_competition = 1.0 - (competitive_intensity / 10)  # Invert competition

            # Weighted calculation
            attractiveness = (
                norm_opportunity * 0.4 +
                norm_market_size * 0.25 +
                norm_growth * 0.2 +
                norm_competition * 0.15
            )

            return min(attractiveness * 100, 100)  # Scale to 0-100

        def categorize_opportunity(opportunity_score: float) -> OpportunityScore:
            """Categorize opportunity level"""
            if opportunity_score < 10:
                return OpportunityScore.LOW_OPPORTUNITY
            elif opportunity_score < 15:
                return OpportunityScore.MODERATE_OPPORTUNITY
            elif opportunity_score < 18:
                return OpportunityScore.HIGH_OPPORTUNITY
            else:
                return OpportunityScore.BREAKTHROUGH_OPPORTUNITY

        self.scoring_algorithms = {
            "opportunity_score": calculate_opportunity_score,
            "market_attractiveness": assess_market_attractiveness,
            "opportunity_category": categorize_opportunity
        }

    async def _setup_healthcare_job_examples(self):
        """Setup example healthcare jobs for different stakeholders"""

        # Clinical Provider Jobs
        provider_outcomes = [
            DesiredOutcome(
                outcome_id="outcome_001",
                outcome_statement="Minimize time to accurate diagnosis",
                outcome_type=OutcomeType.SPEED_OUTCOME,
                importance_score=9.2,
                satisfaction_score=6.1,
                opportunity_score=12.3,
                measurement_criteria=["Time to diagnosis", "Diagnostic accuracy", "Workflow efficiency"],
                current_solutions=["Clinical decision support", "Diagnostic imaging", "Laboratory tests"],
                solution_gaps=["Integration challenges", "Alert fatigue", "Limited AI assistance"],
                stakeholder_priority={"physician": 9.0, "nurse": 7.5, "administrator": 8.0},
                evidence_level="high",
                regulatory_considerations=["FDA guidance on AI/ML devices", "Clinical validation requirements"]
            ),
            DesiredOutcome(
                outcome_id="outcome_002",
                outcome_statement="Increase confidence in treatment decisions",
                outcome_type=OutcomeType.QUALITY_OUTCOME,
                importance_score=9.5,
                satisfaction_score=7.2,
                opportunity_score=11.8,
                measurement_criteria=["Decision confidence scores", "Treatment outcomes", "Second opinion rates"],
                current_solutions=["Clinical guidelines", "Peer consultation", "Literature review"],
                solution_gaps=["Information overload", "Guideline conflicts", "Time constraints"],
                stakeholder_priority={"physician": 9.5, "patient": 8.8, "payer": 7.0},
                evidence_level="high",
                regulatory_considerations=["Standard of care requirements", "Liability considerations"]
            )
        ]

        clinical_job = CustomerJob(
            job_id="job_001",
            job_statement="Diagnose and treat patients effectively and efficiently",
            job_type=JobType.FUNCTIONAL_JOB,
            job_executor=JobExecutor.HEALTHCARE_PROVIDER,
            context="Clinical practice in hospital or clinic setting",
            circumstances=["Time pressure", "Complex cases", "Resource constraints", "Regulatory requirements"],
            desired_outcomes=provider_outcomes,
            current_solutions=["EHR systems", "Clinical decision support", "Diagnostic tools", "Treatment protocols"],
            solution_satisfaction=6.5,
            job_frequency="daily",
            job_importance=9.8,
            market_size=50000,  # Number of physicians
            growth_rate=0.03,   # 3% annual growth
            competitive_landscape=["Epic", "Cerner", "IBM Watson Health", "Google Health"],
            regulatory_environment="FDA, CMS oversight",
            therapeutic_area="general_medicine"
        )

        # Patient Jobs
        patient_outcomes = [
            DesiredOutcome(
                outcome_id="outcome_003",
                outcome_statement="Minimize time to receive appropriate care",
                outcome_type=OutcomeType.SPEED_OUTCOME,
                importance_score=8.9,
                satisfaction_score=5.2,
                opportunity_score=12.6,
                measurement_criteria=["Wait times", "Appointment availability", "Care coordination"],
                current_solutions=["Online scheduling", "Telemedicine", "Urgent care centers"],
                solution_gaps=["Limited availability", "Geographic barriers", "Insurance complexity"],
                stakeholder_priority={"patient": 9.0, "caregiver": 8.5, "provider": 7.0},
                evidence_level="medium",
                regulatory_considerations=["HIPAA compliance", "Telehealth regulations"]
            ),
            DesiredOutcome(
                outcome_id="outcome_004",
                outcome_statement="Increase understanding of health condition and treatment",
                outcome_type=OutcomeType.QUALITY_OUTCOME,
                importance_score=8.7,
                satisfaction_score=6.0,
                opportunity_score=11.4,
                measurement_criteria=["Health literacy scores", "Treatment adherence", "Patient satisfaction"],
                current_solutions=["Patient education materials", "Provider explanations", "Online resources"],
                solution_gaps=["Health literacy barriers", "Information overload", "Personalization"],
                stakeholder_priority={"patient": 8.7, "caregiver": 8.0, "provider": 7.5},
                evidence_level="high",
                regulatory_considerations=["Patient safety requirements", "Informed consent"]
            )
        ]

        patient_job = CustomerJob(
            job_id="job_002",
            job_statement="Manage health condition and receive appropriate care",
            job_type=JobType.FUNCTIONAL_JOB,
            job_executor=JobExecutor.PATIENT,
            context="Managing chronic condition or acute health issue",
            circumstances=["Limited health literacy", "Cost concerns", "Access barriers", "Comorbidities"],
            desired_outcomes=patient_outcomes,
            current_solutions=["Healthcare providers", "Health apps", "Support groups", "Online resources"],
            solution_satisfaction=5.8,
            job_frequency="ongoing",
            job_importance=9.9,
            market_size=300000000,  # US population
            growth_rate=0.01,       # 1% annual growth
            competitive_landscape=["Apple Health", "Google Fit", "MyChart", "Telemedicine platforms"],
            regulatory_environment="HIPAA, FDA oversight",
            therapeutic_area="chronic_disease_management"
        )

        # Store example jobs
        self.example_jobs = {
            JobExecutor.HEALTHCARE_PROVIDER: [clinical_job],
            JobExecutor.PATIENT: [patient_job]
        }

    async def _setup_innovation_methodologies(self):
        """Setup methodologies for innovation development"""

        self.innovation_methodologies = {
            "outcome_driven_innovation": {
                "phases": [
                    "Job definition and scoping",
                    "Outcome discovery and mapping",
                    "Opportunity identification and prioritization",
                    "Solution concept development",
                    "Concept validation and testing",
                    "Development and launch"
                ],
                "tools": [
                    "Customer interviews",
                    "Outcome surveys",
                    "Opportunity landscape mapping",
                    "Concept testing",
                    "Prototype validation"
                ]
            },
            "healthcare_innovation": {
                "considerations": [
                    "Clinical evidence requirements",
                    "Regulatory approval pathways",
                    "Reimbursement and payer acceptance",
                    "Provider workflow integration",
                    "Patient safety and efficacy",
                    "Health economics and outcomes"
                ],
                "validation_stages": [
                    "Clinical validation",
                    "Regulatory validation",
                    "Commercial validation",
                    "Real-world evidence generation"
                ]
            }
        }

    # Core JTBD Methods

    async def create_job_mapping(
        self,
        domain: str,
        therapeutic_area: Optional[str] = None,
        stakeholders: Optional[List[JobExecutor]] = None
    ) -> str:
        """Create a new job mapping for a domain"""

        mapping_id = str(uuid.uuid4())

        # Initialize stakeholder jobs
        stakeholder_jobs = {}
        if stakeholders:
            for stakeholder in stakeholders:
                stakeholder_jobs[stakeholder] = []
        else:
            # Use default stakeholders
            for executor in JobExecutor:
                stakeholder_jobs[executor] = []

        # Create job mapping
        job_mapping = JobMapping(
            mapping_id=mapping_id,
            domain=domain,
            therapeutic_area=therapeutic_area,
            stakeholder_jobs=stakeholder_jobs,
            job_relationships={},
            outcome_hierarchy={},
            opportunity_matrix={},
            innovation_roadmap=[],
            market_insights={},
            competitive_analysis={},
            created_at=datetime.now(),
            last_updated=datetime.now()
        )

        self.job_mappings[mapping_id] = job_mapping

        logger.info(f"Created job mapping {mapping_id} for domain {domain}")
        return mapping_id

    async def add_customer_job(
        self,
        mapping_id: str,
        job: CustomerJob
    ) -> bool:
        """Add a customer job to a mapping"""

        if mapping_id not in self.job_mappings:
            return False

        mapping = self.job_mappings[mapping_id]

        # Add job to appropriate stakeholder category
        if job.job_executor not in mapping.stakeholder_jobs:
            mapping.stakeholder_jobs[job.job_executor] = []

        mapping.stakeholder_jobs[job.job_executor].append(job)
        mapping.last_updated = datetime.now()

        logger.info(f"Added job {job.job_id} to mapping {mapping_id}")
        return True

    async def discover_outcomes(
        self,
        job_statement: str,
        context: str,
        stakeholder_input: Dict[str, Any]
    ) -> List[DesiredOutcome]:
        """Discover desired outcomes for a job using templates and stakeholder input"""

        outcomes = []

        # Generate outcomes from templates
        for outcome_type, templates in self.outcome_templates.items():
            for template in templates[:2]:  # Limit to 2 per type
                outcome_statement = template.replace("[task]", context).replace("[process]", job_statement)

                # Simulate importance and satisfaction scores
                importance = stakeholder_input.get("importance", {}).get(outcome_type.value, 7.0)
                satisfaction = stakeholder_input.get("satisfaction", {}).get(outcome_type.value, 5.0)

                outcome = DesiredOutcome(
                    outcome_id=str(uuid.uuid4()),
                    outcome_statement=outcome_statement,
                    outcome_type=outcome_type,
                    importance_score=importance,
                    satisfaction_score=satisfaction,
                    opportunity_score=self.scoring_algorithms["opportunity_score"](importance, satisfaction),
                    measurement_criteria=[f"Measure {outcome_type.value}"],
                    current_solutions=stakeholder_input.get("current_solutions", []),
                    solution_gaps=stakeholder_input.get("solution_gaps", []),
                    stakeholder_priority={},
                    evidence_level="medium",
                    regulatory_considerations=[]
                )

                outcomes.append(outcome)

        # Sort by opportunity score
        outcomes.sort(key=lambda x: x.opportunity_score, reverse=True)

        return outcomes[:10]  # Return top 10 opportunities

    async def assess_opportunities(
        self,
        mapping_id: str,
        job_id: str
    ) -> str:
        """Assess innovation opportunities for a specific job"""

        if mapping_id not in self.job_mappings:
            raise ValueError(f"Job mapping {mapping_id} not found")

        mapping = self.job_mappings[mapping_id]

        # Find the job
        target_job = None
        for jobs in mapping.stakeholder_jobs.values():
            for job in jobs:
                if job.job_id == job_id:
                    target_job = job
                    break
            if target_job:
                break

        if not target_job:
            raise ValueError(f"Job {job_id} not found in mapping")

        assessment_id = str(uuid.uuid4())

        # Identify top opportunities
        top_opportunities = sorted(
            target_job.desired_outcomes,
            key=lambda x: x.opportunity_score,
            reverse=True
        )[:5]

        # Segment opportunities
        opportunity_segments = {
            "breakthrough": [o for o in target_job.desired_outcomes if o.opportunity_score > 15],
            "high_potential": [o for o in target_job.desired_outcomes if 12 <= o.opportunity_score <= 15],
            "moderate": [o for o in target_job.desired_outcomes if 8 <= o.opportunity_score < 12],
            "low_priority": [o for o in target_job.desired_outcomes if o.opportunity_score < 8]
        }

        # Generate innovation pathways
        innovation_pathways = await self._generate_innovation_pathways(target_job, top_opportunities)

        # Assess feasibility
        technical_feasibility = await self._assess_technical_feasibility(target_job, top_opportunities)
        regulatory_feasibility = await self._assess_regulatory_feasibility(target_job)
        commercial_viability = await self._assess_commercial_viability(target_job)

        # Calculate overall attractiveness
        overall_attractiveness = (
            technical_feasibility * 0.4 +
            regulatory_feasibility * 0.3 +
            commercial_viability * 0.3
        )

        # Create assessment
        assessment = OpportunityAssessment(
            assessment_id=assessment_id,
            job=target_job,
            top_opportunities=top_opportunities,
            opportunity_segments=opportunity_segments,
            innovation_pathways=innovation_pathways,
            competitive_advantages=await self._identify_competitive_advantages(target_job, top_opportunities),
            technical_feasibility=technical_feasibility,
            regulatory_feasibility=regulatory_feasibility,
            commercial_viability=commercial_viability,
            overall_attractiveness=overall_attractiveness,
            recommended_approach=await self._recommend_approach(target_job, top_opportunities),
            success_metrics=await self._define_success_metrics(target_job, top_opportunities),
            risk_factors=await self._identify_risk_factors(target_job),
            timeline_estimate=await self._estimate_timeline(target_job, top_opportunities)
        )

        self.opportunity_assessments[assessment_id] = assessment
        mapping.opportunity_matrix[job_id] = assessment

        logger.info(f"Created opportunity assessment {assessment_id} for job {job_id}")
        return assessment_id

    async def _generate_innovation_pathways(
        self,
        job: CustomerJob,
        opportunities: List[DesiredOutcome]
    ) -> List[str]:
        """Generate potential innovation pathways"""

        pathways = []

        # Technology-driven pathways
        if any("speed" in o.outcome_statement.lower() for o in opportunities):
            pathways.append("AI-powered automation and decision support")

        if any("accuracy" in o.outcome_statement.lower() for o in opportunities):
            pathways.append("Machine learning-enhanced diagnostics and prediction")

        if any("cost" in o.outcome_statement.lower() for o in opportunities):
            pathways.append("Workflow optimization and resource management")

        if any("access" in o.outcome_statement.lower() for o in opportunities):
            pathways.append("Digital health and telemedicine solutions")

        # Domain-specific pathways
        if job.therapeutic_area:
            pathways.append(f"Specialized {job.therapeutic_area} solution development")

        # Default pathway
        if not pathways:
            pathways.append("Integrated healthcare technology platform")

        return pathways

    async def _assess_technical_feasibility(
        self,
        job: CustomerJob,
        opportunities: List[DesiredOutcome]
    ) -> float:
        """Assess technical feasibility of addressing top opportunities"""

        # Simulate feasibility assessment
        base_feasibility = 0.7

        # Adjust based on job complexity
        if job.solution_satisfaction < 5.0:
            base_feasibility += 0.1  # Easier to improve poor solutions

        # Adjust based on opportunity types
        technical_outcomes = [o for o in opportunities if o.outcome_type in [
            OutcomeType.SPEED_OUTCOME,
            OutcomeType.QUALITY_OUTCOME,
            OutcomeType.EFFICACY_OUTCOME
        ]]

        if len(technical_outcomes) > 3:
            base_feasibility -= 0.1  # More complex technical requirements

        return min(max(base_feasibility, 0.0), 1.0)

    async def _assess_regulatory_feasibility(self, job: CustomerJob) -> float:
        """Assess regulatory feasibility"""

        base_feasibility = 0.6

        # Healthcare jobs have more regulatory complexity
        if job.job_executor in [JobExecutor.HEALTHCARE_PROVIDER, JobExecutor.PATIENT]:
            base_feasibility -= 0.1

        # Therapeutic areas may have specific regulations
        if job.therapeutic_area in ["oncology", "cardiology", "neurology"]:
            base_feasibility -= 0.05

        return min(max(base_feasibility, 0.0), 1.0)

    async def _assess_commercial_viability(self, job: CustomerJob) -> float:
        """Assess commercial viability"""

        base_viability = 0.7

        # Market size impact
        if job.market_size and job.market_size > 100000:
            base_viability += 0.1

        # Growth rate impact
        if job.growth_rate and job.growth_rate > 0.05:
            base_viability += 0.1

        # Competition impact
        if len(job.competitive_landscape) > 5:
            base_viability -= 0.1

        return min(max(base_viability, 0.0), 1.0)

    async def _identify_competitive_advantages(
        self,
        job: CustomerJob,
        opportunities: List[DesiredOutcome]
    ) -> List[str]:
        """Identify potential competitive advantages"""

        advantages = []

        # High opportunity scores suggest underserved needs
        high_opportunity_outcomes = [o for o in opportunities if o.opportunity_score > 12]
        if high_opportunity_outcomes:
            advantages.append("Addresses critical unmet needs")

        # Multiple outcome types suggest comprehensive solution
        outcome_types = set(o.outcome_type for o in opportunities)
        if len(outcome_types) > 3:
            advantages.append("Comprehensive multi-outcome solution")

        # Domain expertise
        if job.therapeutic_area:
            advantages.append(f"Specialized {job.therapeutic_area} expertise")

        # AI/ML capabilities
        advantages.append("Advanced AI/ML capabilities and healthcare domain knowledge")

        return advantages

    async def _recommend_approach(
        self,
        job: CustomerJob,
        opportunities: List[DesiredOutcome]
    ) -> str:
        """Recommend development approach"""

        # Analyze opportunity characteristics
        avg_opportunity = sum(o.opportunity_score for o in opportunities) / len(opportunities)

        if avg_opportunity > 15:
            return "Aggressive innovation with breakthrough solution development"
        elif avg_opportunity > 12:
            return "Focused innovation targeting highest-value outcomes"
        elif avg_opportunity > 10:
            return "Incremental innovation with strategic partnerships"
        else:
            return "Market education and ecosystem development"

    async def _define_success_metrics(
        self,
        job: CustomerJob,
        opportunities: List[DesiredOutcome]
    ) -> List[str]:
        """Define success metrics for innovation"""

        metrics = []

        # Outcome-based metrics
        for outcome in opportunities[:3]:  # Top 3 outcomes
            metrics.extend(outcome.measurement_criteria)

        # Business metrics
        metrics.extend([
            "Market adoption rate",
            "Customer satisfaction scores",
            "Revenue growth",
            "Competitive differentiation"
        ])

        # Healthcare-specific metrics
        if job.job_executor in [JobExecutor.HEALTHCARE_PROVIDER, JobExecutor.PATIENT]:
            metrics.extend([
                "Clinical outcomes improvement",
                "Patient safety metrics",
                "Healthcare cost reduction"
            ])

        return list(set(metrics))  # Remove duplicates

    async def _identify_risk_factors(self, job: CustomerJob) -> List[str]:
        """Identify key risk factors"""

        risks = []

        # Regulatory risks
        if "fda" in job.regulatory_environment.lower():
            risks.append("FDA approval and regulatory compliance risk")

        # Market risks
        if len(job.competitive_landscape) > 3:
            risks.append("Competitive market with established players")

        # Technical risks
        if job.solution_satisfaction > 7.0:
            risks.append("High satisfaction with current solutions")

        # Adoption risks
        if job.job_executor == JobExecutor.HEALTHCARE_PROVIDER:
            risks.append("Healthcare provider workflow integration challenges")

        # Default risks
        risks.extend([
            "Technology development risk",
            "Market acceptance risk",
            "Resource and funding risk"
        ])

        return risks

    async def _estimate_timeline(
        self,
        job: CustomerJob,
        opportunities: List[DesiredOutcome]
    ) -> str:
        """Estimate development timeline"""

        # Base timeline
        base_months = 18

        # Adjust for complexity
        high_complexity_outcomes = [o for o in opportunities if o.importance_score > 8.5]
        if len(high_complexity_outcomes) > 3:
            base_months += 6

        # Adjust for regulatory requirements
        if "fda" in job.regulatory_environment.lower():
            base_months += 12

        # Adjust for market maturity
        if job.solution_satisfaction < 5.0:
            base_months -= 3  # Faster adoption for poor current solutions

        return f"{base_months} months estimated development timeline"

    async def create_innovation_project(
        self,
        assessment_id: str,
        project_name: str,
        target_outcomes: List[str],
        solution_concept: str
    ) -> str:
        """Create innovation project from opportunity assessment"""

        if assessment_id not in self.opportunity_assessments:
            raise ValueError(f"Assessment {assessment_id} not found")

        assessment = self.opportunity_assessments[assessment_id]
        project_id = str(uuid.uuid4())

        # Filter target outcomes
        selected_outcomes = [
            o for o in assessment.top_opportunities
            if o.outcome_id in target_outcomes
        ]

        # Generate value proposition
        value_proposition = await self._generate_value_proposition(
            assessment.job, selected_outcomes, solution_concept
        )

        # Create project
        project = InnovationProject(
            project_id=project_id,
            project_name=project_name,
            target_job=assessment.job,
            target_outcomes=selected_outcomes,
            solution_concept=solution_concept,
            value_proposition=value_proposition,
            success_metrics=assessment.success_metrics,
            development_phases=await self._define_development_phases(assessment),
            resource_requirements=await self._estimate_resource_requirements(assessment),
            timeline=await self._create_project_timeline(assessment),
            risk_mitigation=await self._create_risk_mitigation_plan(assessment),
            stakeholder_engagement=await self._plan_stakeholder_engagement(assessment),
            regulatory_strategy=await self._develop_regulatory_strategy(assessment),
            commercial_strategy=await self._develop_commercial_strategy(assessment),
            status="initiated",
            progress_indicators={}
        )

        self.innovation_projects[project_id] = project

        logger.info(f"Created innovation project {project_id}: {project_name}")
        return project_id

    async def _generate_value_proposition(
        self,
        job: CustomerJob,
        outcomes: List[DesiredOutcome],
        solution_concept: str
    ) -> str:
        """Generate value proposition for innovation project"""

        # Extract key value drivers
        value_drivers = []
        for outcome in outcomes:
            if outcome.opportunity_score > 12:
                value_drivers.append(outcome.outcome_statement.lower())

        # Create value proposition
        value_prop = f"For {job.job_executor.value.replace('_', ' ')}s who need to {job.job_statement.lower()}, "
        value_prop += f"our {solution_concept} provides {', '.join(value_drivers[:3])}, "
        value_prop += f"unlike current solutions that have significant gaps in {', '.join([gap for outcome in outcomes for gap in outcome.solution_gaps[:2]])}."

        return value_prop

    async def _define_development_phases(self, assessment: OpportunityAssessment) -> List[str]:
        """Define development phases for project"""

        phases = [
            "Concept validation and requirements definition",
            "Technical feasibility and prototype development",
            "Clinical validation and user testing",
            "Regulatory submission and approval",
            "Pilot implementation and validation",
            "Commercial launch and scaling"
        ]

        # Adjust based on assessment
        if assessment.regulatory_feasibility < 0.7:
            phases.insert(1, "Regulatory strategy refinement")

        if assessment.technical_feasibility < 0.7:
            phases.insert(2, "Technical risk mitigation")

        return phases

    async def _estimate_resource_requirements(self, assessment: OpportunityAssessment) -> Dict[str, Any]:
        """Estimate resource requirements for project"""

        return {
            "team_size": "8-12 people",
            "key_roles": [
                "Product manager",
                "Clinical lead",
                "AI/ML engineers",
                "Regulatory specialist",
                "User experience designer",
                "Quality assurance",
                "Business development"
            ],
            "budget_estimate": "$2-5M total development cost",
            "technology_requirements": [
                "Cloud infrastructure",
                "AI/ML development platform",
                "Healthcare data integration",
                "Security and compliance tools"
            ],
            "external_partnerships": [
                "Healthcare provider partners",
                "Regulatory consultants",
                "Clinical validation sites",
                "Technology vendors"
            ]
        }

    async def _create_project_timeline(self, assessment: OpportunityAssessment) -> Dict[str, str]:
        """Create project timeline"""

        return {
            "Phase 1 - Concept Validation": "Months 1-3",
            "Phase 2 - Technical Development": "Months 4-12",
            "Phase 3 - Clinical Validation": "Months 10-18",
            "Phase 4 - Regulatory Submission": "Months 16-24",
            "Phase 5 - Pilot Implementation": "Months 22-30",
            "Phase 6 - Commercial Launch": "Months 28-36"
        }

    async def _create_risk_mitigation_plan(self, assessment: OpportunityAssessment) -> List[str]:
        """Create risk mitigation plan"""

        mitigation_plan = []

        for risk in assessment.risk_factors:
            if "regulatory" in risk.lower():
                mitigation_plan.append("Early and frequent regulatory consultation and feedback")
            elif "competitive" in risk.lower():
                mitigation_plan.append("Differentiated positioning and intellectual property protection")
            elif "technical" in risk.lower():
                mitigation_plan.append("Proof-of-concept development and technical validation")
            elif "adoption" in risk.lower():
                mitigation_plan.append("User-centered design and stakeholder engagement")

        # Generic mitigation strategies
        mitigation_plan.extend([
            "Agile development methodology with frequent validation",
            "Strong partnership strategy and ecosystem engagement",
            "Continuous market research and competitive intelligence"
        ])

        return mitigation_plan

    async def _plan_stakeholder_engagement(self, assessment: OpportunityAssessment) -> Dict[str, str]:
        """Plan stakeholder engagement strategy"""

        return {
            "Healthcare Providers": "Clinical advisory board and pilot site partnerships",
            "Patients": "User experience research and patient advocate engagement",
            "Regulators": "Pre-submission meetings and guidance consultation",
            "Payers": "Health economics evidence development and value demonstration",
            "Technology Partners": "Integration partnerships and platform collaboration",
            "Investors": "Milestone-based funding and progress reporting"
        }

    async def _develop_regulatory_strategy(self, assessment: OpportunityAssessment) -> str:
        """Develop regulatory strategy"""

        if assessment.job.job_executor in [JobExecutor.HEALTHCARE_PROVIDER, JobExecutor.PATIENT]:
            return "FDA software as medical device pathway with clinical validation and 510(k) submission strategy"
        else:
            return "Standard software development with healthcare compliance (HIPAA, SOC 2) and industry best practices"

    async def _develop_commercial_strategy(self, assessment: OpportunityAssessment) -> str:
        """Develop commercial strategy"""

        return f"B2B SaaS model targeting {assessment.job.job_executor.value.replace('_', ' ')}s with value-based pricing and partnership distribution channels"

    # Analytics and Reporting Methods

    async def get_opportunity_landscape(self, mapping_id: str) -> Dict[str, Any]:
        """Get opportunity landscape for a job mapping"""

        if mapping_id not in self.job_mappings:
            return {"error": "Mapping not found"}

        mapping = self.job_mappings[mapping_id]

        # Collect all opportunities
        all_opportunities = []
        for jobs in mapping.stakeholder_jobs.values():
            for job in jobs:
                all_opportunities.extend(job.desired_outcomes)

        if not all_opportunities:
            return {"message": "No opportunities identified yet"}

        # Categorize opportunities
        categories = {
            "breakthrough": [o for o in all_opportunities if o.opportunity_score > 15],
            "high_potential": [o for o in all_opportunities if 12 <= o.opportunity_score <= 15],
            "moderate": [o for o in all_opportunities if 8 <= o.opportunity_score < 12],
            "low_priority": [o for o in all_opportunities if o.opportunity_score < 8]
        }

        # Top opportunities by outcome type
        outcome_type_leaders = {}
        for outcome_type in OutcomeType:
            type_opportunities = [o for o in all_opportunities if o.outcome_type == outcome_type]
            if type_opportunities:
                outcome_type_leaders[outcome_type.value] = max(type_opportunities, key=lambda x: x.opportunity_score)

        return {
            "total_opportunities": len(all_opportunities),
            "opportunity_categories": {k: len(v) for k, v in categories.items()},
            "top_10_opportunities": sorted(all_opportunities, key=lambda x: x.opportunity_score, reverse=True)[:10],
            "outcome_type_leaders": {k: v.outcome_statement for k, v in outcome_type_leaders.items()},
            "average_opportunity_score": sum(o.opportunity_score for o in all_opportunities) / len(all_opportunities),
            "domain": mapping.domain,
            "therapeutic_area": mapping.therapeutic_area
        }

    async def get_innovation_portfolio(self) -> Dict[str, Any]:
        """Get overview of innovation project portfolio"""

        if not self.innovation_projects:
            return {"message": "No innovation projects created yet"}

        # Status distribution
        status_dist = {}
        for project in self.innovation_projects.values():
            status = project.status
            status_dist[status] = status_dist.get(status, 0) + 1

        # Target stakeholder distribution
        stakeholder_dist = {}
        for project in self.innovation_projects.values():
            stakeholder = project.target_job.job_executor.value
            stakeholder_dist[stakeholder] = stakeholder_dist.get(stakeholder, 0) + 1

        # Therapeutic area distribution
        therapeutic_dist = {}
        for project in self.innovation_projects.values():
            area = project.target_job.therapeutic_area or "general"
            therapeutic_dist[area] = therapeutic_dist.get(area, 0) + 1

        return {
            "total_projects": len(self.innovation_projects),
            "status_distribution": status_dist,
            "stakeholder_distribution": stakeholder_dist,
            "therapeutic_area_distribution": therapeutic_dist,
            "recent_projects": [
                {
                    "project_id": p.project_id,
                    "name": p.project_name,
                    "status": p.status,
                    "target_stakeholder": p.target_job.job_executor.value
                }
                for p in sorted(self.innovation_projects.values(), key=lambda x: x.project_id, reverse=True)[:5]
            ]
        }

# Factory function
def create_jtbd_framework() -> JobsToBeDoneFramework:
    """Create and return a configured JobsToBeDoneFramework instance"""
    return JobsToBeDoneFramework()

# Example usage
if __name__ == "__main__":
    async def test_jtbd_framework():
        """Test the Jobs-to-be-Done framework"""

        jtbd = create_jtbd_framework()

        # Wait for initialization
        await asyncio.sleep(1)

        # Create job mapping
        mapping_id = await jtbd.create_job_mapping(
            domain="digital_therapeutics",
            therapeutic_area="diabetes",
            stakeholders=[JobExecutor.HEALTHCARE_PROVIDER, JobExecutor.PATIENT]
        )

        print(f"Created job mapping: {mapping_id}")

        # Discover outcomes for a sample job
        outcomes = await jtbd.discover_outcomes(
            job_statement="Monitor and manage diabetes effectively",
            context="continuous glucose monitoring and lifestyle management",
            stakeholder_input={
                "importance": {
                    "speed_outcome": 8.5,
                    "quality_outcome": 9.2,
                    "convenience_outcome": 8.8
                },
                "satisfaction": {
                    "speed_outcome": 5.5,
                    "quality_outcome": 6.0,
                    "convenience_outcome": 4.8
                },
                "current_solutions": ["Traditional glucose meters", "Insulin pens", "Paper logs"],
                "solution_gaps": ["Delayed feedback", "Manual tracking", "Limited insights"]
            }
        )

        print(f"Discovered {len(outcomes)} outcomes")

        # Create and add a customer job
        customer_job = CustomerJob(
            job_id="diabetes_management_job",
            job_statement="Monitor and manage diabetes effectively",
            job_type=JobType.FUNCTIONAL_JOB,
            job_executor=JobExecutor.PATIENT,
            context="Type 2 diabetes management with technology support",
            circumstances=["Busy lifestyle", "Technology comfort", "Cost concerns"],
            desired_outcomes=outcomes,
            current_solutions=["Glucose meter", "Insulin", "Doctor visits", "Diabetes app"],
            solution_satisfaction=5.5,
            job_frequency="daily",
            job_importance=9.5,
            market_size=34000000,  # US diabetes population
            growth_rate=0.04,
            competitive_landscape=["Dexcom", "Abbott", "Medtronic", "Livongo"],
            regulatory_environment="FDA Class II medical device",
            therapeutic_area="diabetes"
        )

        await jtbd.add_customer_job(mapping_id, customer_job)

        # Assess opportunities
        assessment_id = await jtbd.assess_opportunities(mapping_id, customer_job.job_id)
        print(f"Created opportunity assessment: {assessment_id}")

        # Get opportunity landscape
        landscape = await jtbd.get_opportunity_landscape(mapping_id)
        print(f"Opportunity landscape: {landscape}")

        # Create innovation project
        project_id = await jtbd.create_innovation_project(
            assessment_id=assessment_id,
            project_name="AI-Powered Diabetes Management Platform",
            target_outcomes=[outcomes[0].outcome_id, outcomes[1].outcome_id],
            solution_concept="Intelligent continuous glucose monitoring with AI-powered insights and personalized recommendations"
        )

        print(f"Created innovation project: {project_id}")

        # Get innovation portfolio
        portfolio = await jtbd.get_innovation_portfolio()
        print(f"Innovation portfolio: {portfolio}")

    # Run test
    asyncio.run(test_jtbd_framework())