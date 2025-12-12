# ===================================================================
# VITAL Path Clinical Agent Registry - Phase 2 Enhanced
# Specialized clinical agent management with medical credentials
# ===================================================================

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Set
from enum import Enum
import uuid
from dataclasses import dataclass, asdict
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update, delete
import opentelemetry.trace as trace
from opentelemetry import metrics
from fhir.resources import Practitioner, PractitionerRole
import asyncpg
from cryptography.fernet import Fernet
import hashlib

# Configure logging and telemetry
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
agent_registrations = meter.create_counter(
    "agent_registrations_total",
    description="Total clinical agent registrations"
)

routing_requests = meter.create_counter(
    "routing_requests_total",
    description="Total agent routing requests"
)

credential_verifications = meter.create_counter(
    "credential_verifications_total",
    description="Total credential verification attempts"
)

class MedicalSpecialty(Enum):
    """Enhanced medical specialties with AAMC categorization"""
    # Primary Care
    FAMILY_MEDICINE = "family_medicine"
    INTERNAL_MEDICINE = "internal_medicine"
    PEDIATRICS = "pediatrics"
    GERIATRICS = "geriatrics"

    # Surgical Specialties
    GENERAL_SURGERY = "general_surgery"
    ORTHOPEDIC_SURGERY = "orthopedic_surgery"
    NEUROSURGERY = "neurosurgery"
    CARDIAC_SURGERY = "cardiac_surgery"
    PLASTIC_SURGERY = "plastic_surgery"
    UROLOGIC_SURGERY = "urologic_surgery"

    # Medical Specialties
    CARDIOLOGY = "cardiology"
    ONCOLOGY = "oncology"
    NEUROLOGY = "neurology"
    PSYCHIATRY = "psychiatry"
    ENDOCRINOLOGY = "endocrinology"
    GASTROENTEROLOGY = "gastroenterology"
    PULMONOLOGY = "pulmonology"
    NEPHROLOGY = "nephrology"
    RHEUMATOLOGY = "rheumatology"
    DERMATOLOGY = "dermatology"
    HEMATOLOGY = "hematology"
    INFECTIOUS_DISEASE = "infectious_disease"
    ALLERGY_IMMUNOLOGY = "allergy_immunology"

    # Hospital-Based Specialties
    EMERGENCY_MEDICINE = "emergency_medicine"
    ANESTHESIOLOGY = "anesthesiology"
    RADIOLOGY = "radiology"
    PATHOLOGY = "pathology"
    CRITICAL_CARE = "critical_care"

    # Other Specialties
    OPHTHALMOLOGY = "ophthalmology"
    OTOLARYNGOLOGY = "otolaryngology"
    PHYSICAL_MEDICINE = "physical_medicine"
    PAIN_MANAGEMENT = "pain_management"
    PALLIATIVE_CARE = "palliative_care"

    # Regulatory & Research
    REGULATORY_AFFAIRS = "regulatory_affairs"
    CLINICAL_RESEARCH = "clinical_research"
    PHARMACOVIGILANCE = "pharmacovigilance"
    BIOETHICS = "bioethics"

class ExpertiseLevel(Enum):
    """Clinical expertise levels based on Dreyfus model"""
    NOVICE = "novice"               # Recent training, rule-based
    COMPETENT = "competent"         # 2-3 years experience
    PROFICIENT = "proficient"       # 5+ years, pattern recognition
    EXPERT = "expert"               # 10+ years, intuitive grasp
    MASTER = "master"               # Recognized authority, > 15 years

class CredentialType(Enum):
    """Medical credential types for verification"""
    MEDICAL_LICENSE = "medical_license"
    BOARD_CERTIFICATION = "board_certification"
    DEA_REGISTRATION = "dea_registration"
    NPI_NUMBER = "npi_number"
    HOSPITAL_PRIVILEGES = "hospital_privileges"
    RESEARCH_CERTIFICATION = "research_certification"
    TEACHING_APPOINTMENT = "teaching_appointment"
    FELLOWSHIP_COMPLETION = "fellowship_completion"

class RoutingStrategy(Enum):
    """Agent routing optimization strategies"""
    AVAILABILITY_BASED = "availability_based"
    EXPERTISE_BASED = "expertise_based"
    PERFORMANCE_BASED = "performance_based"
    COST_OPTIMIZED = "cost_optimized"
    HYBRID_MULTI_FACTOR = "hybrid_multi_factor"
    GEOGRAPHIC_PROXIMITY = "geographic_proximity"
    LANGUAGE_PREFERENCE = "language_preference"
    CASE_COMPLEXITY_MATCH = "case_complexity_match"

@dataclass
class ClinicalCredential:
    """Clinical credential with verification status"""
    credential_type: CredentialType
    credential_number: str
    issuing_authority: str
    issue_date: datetime
    expiration_date: Optional[datetime]
    verification_status: str = "pending"  # pending, verified, expired, invalid
    verification_date: Optional[datetime] = None
    verification_source: Optional[str] = None
    restrictions: List[str] = None

    def __post_init__(self):
        if self.restrictions is None:
            self.restrictions = []

@dataclass
class ExpertiseDomain:
    """Specific expertise domain within a specialty"""
    domain_name: str
    specialty: MedicalSpecialty
    expertise_level: ExpertiseLevel
    years_experience: int
    case_volume_annual: Optional[int] = None
    success_rate: Optional[float] = None
    peer_recognition_score: Optional[float] = None
    certification_details: Dict[str, Any] = None
    subspecialty_focus: List[str] = None

    def __post_init__(self):
        if self.certification_details is None:
            self.certification_details = {}
        if self.subspecialty_focus is None:
            self.subspecialty_focus = []

@dataclass
class PerformanceMetrics:
    """Agent performance tracking metrics"""
    response_time_avg_minutes: float
    response_time_percentile_95: float
    case_success_rate: float
    patient_satisfaction_score: float
    peer_rating_average: float
    accuracy_rate: float
    consultation_count_total: int
    consultation_count_30d: int
    cancellation_rate: float
    escalation_rate: float
    complexity_handling_score: float
    last_updated: datetime = datetime.utcnow()

@dataclass
class AvailabilitySchedule:
    """Agent availability schedule management"""
    timezone: str
    weekly_hours_committed: int
    weekly_hours_actual: Optional[int] = None
    preferred_days: List[str] = None
    preferred_hours: List[Dict[str, str]] = None  # [{"start": "09:00", "end": "17:00"}]
    blackout_dates: List[Dict[str, str]] = None  # [{"start": "2024-01-01", "end": "2024-01-07"}]
    emergency_availability: bool = False
    on_call_rotation: Optional[Dict[str, Any]] = None
    max_concurrent_cases: int = 3

    def __post_init__(self):
        if self.preferred_days is None:
            self.preferred_days = []
        if self.preferred_hours is None:
            self.preferred_hours = []
        if self.blackout_dates is None:
            self.blackout_dates = []

@dataclass
class ClinicalAgent:
    """Complete clinical agent profile"""
    agent_id: str
    user_id: str
    organization_id: str
    name: str
    primary_specialty: MedicalSpecialty
    secondary_specialties: List[MedicalSpecialty]
    credentials: List[ClinicalCredential]
    expertise_domains: List[ExpertiseDomain]
    performance_metrics: PerformanceMetrics
    availability_schedule: AvailabilitySchedule
    languages: List[str] = None
    geographic_regions: List[str] = None
    research_interests: List[str] = None
    publications_count: int = 0
    years_total_experience: int = 0
    status: str = "active"  # active, inactive, suspended, under_review
    registration_date: datetime = datetime.utcnow()
    last_activity: Optional[datetime] = None
    compliance_certifications: Dict[str, Any] = None

    def __post_init__(self):
        if self.languages is None:
            self.languages = ["english"]
        if self.geographic_regions is None:
            self.geographic_regions = []
        if self.research_interests is None:
            self.research_interests = []
        if self.compliance_certifications is None:
            self.compliance_certifications = {}

@dataclass
class RoutingRequest:
    """Agent routing request with clinical context"""
    request_id: str
    requester_id: str
    organization_id: str
    case_description: str
    primary_specialty_needed: MedicalSpecialty
    secondary_specialties_needed: List[MedicalSpecialty]
    required_expertise_level: ExpertiseLevel
    case_complexity: str  # low, medium, high, critical
    urgency_level: str    # routine, urgent, emergent, critical
    clinical_context: Optional[Dict[str, Any]] = None
    patient_demographics: Optional[Dict[str, Any]] = None
    routing_strategy: RoutingStrategy = RoutingStrategy.HYBRID_MULTI_FACTOR
    max_agents: int = 3
    exclude_agent_ids: List[str] = None
    require_languages: List[str] = None
    require_geographic_region: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

    def __post_init__(self):
        if self.exclude_agent_ids is None:
            self.exclude_agent_ids = []
        if self.require_languages is None:
            self.require_languages = []

@dataclass
class RoutingResult:
    """Agent routing result with matching details"""
    routing_id: str
    request_id: str
    matched_agents: List[Dict[str, Any]]
    routing_strategy_used: RoutingStrategy
    confidence_score: float
    estimated_response_time: str
    routing_rationale: str
    alternative_agents: List[Dict[str, Any]] = None
    performance_prediction: Optional[Dict[str, float]] = None
    timestamp: datetime = datetime.utcnow()

    def __post_init__(self):
        if self.alternative_agents is None:
            self.alternative_agents = []

class CredentialVerificationService:
    """Medical credential verification service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.verification_apis = {
            CredentialType.MEDICAL_LICENSE: config.get("license_verification_api"),
            CredentialType.BOARD_CERTIFICATION: config.get("board_certification_api"),
            CredentialType.DEA_REGISTRATION: config.get("dea_verification_api"),
            CredentialType.NPI_NUMBER: config.get("npi_verification_api")
        }

    async def verify_credential(self, credential: ClinicalCredential) -> Dict[str, Any]:
        """Verify a clinical credential against authoritative sources"""
        with tracer.start_as_current_span("credential_verification") as span:
            credential_verifications.add(1)

            span.set_attribute("credential_type", credential.credential_type.value)
            span.set_attribute("issuing_authority", credential.issuing_authority)

            try:
                # Simulate credential verification
                verification_result = {
                    "is_valid": True,
                    "verification_status": "verified",
                    "verification_date": datetime.utcnow(),
                    "verification_source": f"{credential.credential_type.value}_verification_service",
                    "expiration_status": "valid",
                    "restrictions": [],
                    "verification_confidence": 0.95,
                    "last_checked": datetime.utcnow().isoformat()
                }

                # Check expiration
                if credential.expiration_date and credential.expiration_date < datetime.utcnow():
                    verification_result["expiration_status"] = "expired"
                    verification_result["is_valid"] = False

                return verification_result

            except Exception as e:
                logger.error(f"Credential verification failed: {e}")
                return {
                    "is_valid": False,
                    "verification_status": "error",
                    "error": str(e),
                    "verification_date": datetime.utcnow(),
                    "verification_confidence": 0.0
                }

    async def batch_verify_credentials(self, credentials: List[ClinicalCredential]) -> List[Dict[str, Any]]:
        """Batch verify multiple credentials"""
        tasks = [self.verify_credential(cred) for cred in credentials]
        return await asyncio.gather(*tasks)

class AgentRoutingEngine:
    """Intelligent agent routing with multi-factor optimization"""

    def __init__(self, registry_instance):
        self.registry = registry_instance

    async def route_request(self, request: RoutingRequest) -> RoutingResult:
        """Route request to optimal clinical agents"""
        with tracer.start_as_current_span("agent_routing") as span:
            routing_requests.add(1)

            span.set_attribute("specialty", request.primary_specialty_needed.value)
            span.set_attribute("complexity", request.case_complexity)
            span.set_attribute("urgency", request.urgency_level)

            # Get candidate agents
            candidates = await self._get_candidate_agents(request)

            # Score and rank candidates
            scored_candidates = await self._score_candidates(candidates, request)

            # Select top matches
            selected_agents = self._select_optimal_agents(scored_candidates, request)

            routing_result = RoutingResult(
                routing_id=f"route_{uuid.uuid4().hex[:12]}",
                request_id=request.request_id,
                matched_agents=selected_agents[:request.max_agents],
                routing_strategy_used=request.routing_strategy,
                confidence_score=self._calculate_confidence_score(selected_agents),
                estimated_response_time=self._estimate_response_time(selected_agents, request),
                routing_rationale=self._generate_routing_rationale(selected_agents, request),
                alternative_agents=selected_agents[request.max_agents:request.max_agents+3]
            )

            return routing_result

    async def _get_candidate_agents(self, request: RoutingRequest) -> List[ClinicalAgent]:
        """Get candidate agents matching basic criteria"""
        candidates = []

        for agent in self.registry.agents.values():
            if agent.status != "active":
                continue

            if agent.agent_id in request.exclude_agent_ids:
                continue

            # Check specialty match
            if (agent.primary_specialty == request.primary_specialty_needed or
                request.primary_specialty_needed in agent.secondary_specialties):
                candidates.append(agent)

        return candidates

    async def _score_candidates(self, candidates: List[ClinicalAgent],
                              request: RoutingRequest) -> List[Dict[str, Any]]:
        """Score candidates using multi-factor analysis"""
        scored_candidates = []

        for agent in candidates:
            score_components = {
                "expertise_match": self._score_expertise_match(agent, request),
                "performance_score": self._score_performance(agent, request),
                "availability_score": await self._score_availability(agent, request),
                "experience_score": self._score_experience(agent, request),
                "case_complexity_match": self._score_complexity_match(agent, request)
            }

            # Calculate weighted total score
            total_score = self._calculate_weighted_score(score_components, request)

            scored_candidates.append({
                "agent": agent,
                "total_score": total_score,
                "score_components": score_components
            })

        return sorted(scored_candidates, key=lambda x: x["total_score"], reverse=True)

    def _score_expertise_match(self, agent: ClinicalAgent, request: RoutingRequest) -> float:
        """Score expertise match for the request"""
        base_score = 0.5

        # Primary specialty exact match
        if agent.primary_specialty == request.primary_specialty_needed:
            base_score += 0.3

        # Secondary specialty match
        if request.primary_specialty_needed in agent.secondary_specialties:
            base_score += 0.2

        # Expertise level match
        for domain in agent.expertise_domains:
            if domain.specialty == request.primary_specialty_needed:
                level_scores = {
                    ExpertiseLevel.NOVICE: 0.1,
                    ExpertiseLevel.COMPETENT: 0.2,
                    ExpertiseLevel.PROFICIENT: 0.3,
                    ExpertiseLevel.EXPERT: 0.4,
                    ExpertiseLevel.MASTER: 0.5
                }
                required_level_value = list(ExpertiseLevel).index(request.required_expertise_level)
                agent_level_value = list(ExpertiseLevel).index(domain.expertise_level)

                if agent_level_value >= required_level_value:
                    base_score += level_scores.get(domain.expertise_level, 0)
                break

        return min(base_score, 1.0)

    def _score_performance(self, agent: ClinicalAgent, request: RoutingRequest) -> float:
        """Score agent performance metrics"""
        metrics = agent.performance_metrics

        # Normalize metrics to 0-1 scale
        success_rate_score = metrics.case_success_rate
        satisfaction_score = metrics.patient_satisfaction_score / 5.0  # Assuming 1-5 scale
        peer_rating_score = metrics.peer_rating_average / 5.0  # Assuming 1-5 scale
        accuracy_score = metrics.accuracy_rate

        # Response time score (lower is better, normalized)
        response_time_score = max(0, 1 - (metrics.response_time_avg_minutes / 60))  # 1 hour baseline

        # Weighted performance score
        performance_score = (
            success_rate_score * 0.25 +
            satisfaction_score * 0.20 +
            peer_rating_score * 0.20 +
            accuracy_score * 0.20 +
            response_time_score * 0.15
        )

        return min(performance_score, 1.0)

    async def _score_availability(self, agent: ClinicalAgent, request: RoutingRequest) -> float:
        """Score agent availability for the request"""
        # Simplified availability scoring
        schedule = agent.availability_schedule

        # Basic availability score
        availability_score = 0.7

        # Emergency availability bonus
        if request.urgency_level in ["emergent", "critical"] and schedule.emergency_availability:
            availability_score += 0.2

        # Weekly hours consideration
        if schedule.weekly_hours_committed >= 40:
            availability_score += 0.1

        return min(availability_score, 1.0)

    def _score_experience(self, agent: ClinicalAgent, request: RoutingRequest) -> float:
        """Score agent experience relevance"""
        years_exp = agent.years_total_experience

        # Experience scoring curve
        if years_exp >= 15:
            return 1.0
        elif years_exp >= 10:
            return 0.8
        elif years_exp >= 5:
            return 0.6
        elif years_exp >= 2:
            return 0.4
        else:
            return 0.2

    def _score_complexity_match(self, agent: ClinicalAgent, request: RoutingRequest) -> float:
        """Score agent's ability to handle case complexity"""
        complexity_scores = {
            "low": 0.9,
            "medium": 0.7,
            "high": 0.5,
            "critical": 0.3
        }

        # Adjust based on agent expertise
        base_score = complexity_scores.get(request.case_complexity, 0.5)

        # Boost for high expertise levels
        for domain in agent.expertise_domains:
            if domain.specialty == request.primary_specialty_needed:
                if domain.expertise_level in [ExpertiseLevel.EXPERT, ExpertiseLevel.MASTER]:
                    base_score += 0.2
                break

        return min(base_score, 1.0)

    def _calculate_weighted_score(self, score_components: Dict[str, float],
                                 request: RoutingRequest) -> float:
        """Calculate weighted total score based on routing strategy"""
        weights = self._get_strategy_weights(request.routing_strategy)

        total_score = sum(
            score_components[component] * weight
            for component, weight in weights.items()
            if component in score_components
        )

        return total_score

    def _get_strategy_weights(self, strategy: RoutingStrategy) -> Dict[str, float]:
        """Get scoring weights for different routing strategies"""
        strategy_weights = {
            RoutingStrategy.EXPERTISE_BASED: {
                "expertise_match": 0.4,
                "experience_score": 0.3,
                "case_complexity_match": 0.2,
                "performance_score": 0.1
            },
            RoutingStrategy.PERFORMANCE_BASED: {
                "performance_score": 0.4,
                "expertise_match": 0.3,
                "experience_score": 0.2,
                "availability_score": 0.1
            },
            RoutingStrategy.AVAILABILITY_BASED: {
                "availability_score": 0.4,
                "performance_score": 0.3,
                "expertise_match": 0.2,
                "experience_score": 0.1
            },
            RoutingStrategy.HYBRID_MULTI_FACTOR: {
                "expertise_match": 0.25,
                "performance_score": 0.25,
                "availability_score": 0.2,
                "experience_score": 0.15,
                "case_complexity_match": 0.15
            }
        }

        return strategy_weights.get(strategy, strategy_weights[RoutingStrategy.HYBRID_MULTI_FACTOR])

    def _select_optimal_agents(self, scored_candidates: List[Dict[str, Any]],
                              request: RoutingRequest) -> List[Dict[str, Any]]:
        """Select optimal agents from scored candidates"""
        selected = []

        for candidate in scored_candidates:
            agent = candidate["agent"]
            selected.append({
                "agent_id": agent.agent_id,
                "name": agent.name,
                "primary_specialty": agent.primary_specialty.value,
                "expertise_level": self._get_agent_expertise_level(agent, request.primary_specialty_needed),
                "performance_score": candidate["score_components"]["performance_score"],
                "total_score": candidate["total_score"],
                "estimated_response_time": "15 minutes",  # Simplified
                "availability_status": "available",
                "confidence_level": candidate["total_score"]
            })

        return selected

    def _get_agent_expertise_level(self, agent: ClinicalAgent, specialty: MedicalSpecialty) -> str:
        """Get agent's expertise level for specific specialty"""
        for domain in agent.expertise_domains:
            if domain.specialty == specialty:
                return domain.expertise_level.value
        return "competent"  # Default

    def _calculate_confidence_score(self, selected_agents: List[Dict[str, Any]]) -> float:
        """Calculate overall confidence score for routing"""
        if not selected_agents:
            return 0.0

        avg_score = sum(agent["total_score"] for agent in selected_agents) / len(selected_agents)
        return min(avg_score, 1.0)

    def _estimate_response_time(self, selected_agents: List[Dict[str, Any]],
                               request: RoutingRequest) -> str:
        """Estimate response time based on urgency and agent availability"""
        urgency_times = {
            "critical": "< 5 minutes",
            "emergent": "< 15 minutes",
            "urgent": "< 30 minutes",
            "routine": "< 2 hours"
        }

        return urgency_times.get(request.urgency_level, "< 1 hour")

    def _generate_routing_rationale(self, selected_agents: List[Dict[str, Any]],
                                   request: RoutingRequest) -> str:
        """Generate human-readable routing rationale"""
        if not selected_agents:
            return "No suitable agents found for the specified criteria"

        top_agent = selected_agents[0]
        rationale = f"Selected {top_agent['name']} as primary match based on {request.routing_strategy.value} strategy. "
        rationale += f"Agent has {top_agent['expertise_level']} level expertise in {request.primary_specialty_needed.value} "
        rationale += f"with performance score of {top_agent['performance_score']:.2f}."

        return rationale

class ClinicalAgentRegistry:
    """Clinical Agent Registry with comprehensive agent management"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.agents: Dict[str, ClinicalAgent] = {}
        self.redis_client = None
        self.postgres_pool = None

        # Initialize services
        self.credential_verification = CredentialVerificationService(config)
        self.routing_engine = AgentRoutingEngine(self)

        # Performance tracking
        self.registration_count = 0
        self.routing_count = 0

    async def initialize(self):
        """Initialize registry components"""
        # Initialize Redis for caching
        self.redis_client = redis.Redis(
            host=self.config.get("redis_host", "localhost"),
            port=self.config.get("redis_port", 6379),
            decode_responses=True
        )

        # Initialize PostgreSQL for persistence
        self.postgres_pool = await asyncpg.create_pool(
            self.config.get("postgres_url", "postgresql://localhost:5432/vital_path")
        )

        logger.info("Clinical Agent Registry initialized successfully")

    async def register_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register new clinical agent with comprehensive validation"""
        with tracer.start_as_current_span("agent_registration") as span:
            agent_registrations.add(1)

            try:
                # Create agent instance
                agent = self._create_agent_from_data(agent_data)

                # Verify credentials
                verification_results = await self.credential_verification.batch_verify_credentials(
                    agent.credentials
                )

                # Update credential verification status
                for i, result in enumerate(verification_results):
                    agent.credentials[i].verification_status = result["verification_status"]
                    agent.credentials[i].verification_date = result.get("verification_date")

                # Store agent
                self.agents[agent.agent_id] = agent

                # Cache agent data
                await self._cache_agent(agent)

                # Persist to database
                await self._persist_agent(agent)

                span.set_attribute("agent_id", agent.agent_id)
                span.set_attribute("specialty", agent.primary_specialty.value)

                self.registration_count += 1

                return {
                    "agent_id": agent.agent_id,
                    "status": "registered",
                    "verification_status": "completed",
                    "credentials_verified": len([r for r in verification_results if r["is_valid"]]),
                    "credentials_total": len(agent.credentials),
                    "next_steps": [
                        "Agent profile activated",
                        "Available for routing requests",
                        "Performance tracking initiated"
                    ]
                }

            except Exception as e:
                logger.error(f"Agent registration failed: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))
                raise

    def _create_agent_from_data(self, agent_data: Dict[str, Any]) -> ClinicalAgent:
        """Create ClinicalAgent instance from registration data"""
        # Parse credentials
        credentials = []
        for cred_data in agent_data.get("credentials", []):
            credential = ClinicalCredential(
                credential_type=CredentialType(cred_data["credential_type"]),
                credential_number=cred_data["credential_number"],
                issuing_authority=cred_data["issuing_authority"],
                issue_date=datetime.fromisoformat(cred_data["issue_date"]),
                expiration_date=datetime.fromisoformat(cred_data["expiration_date"]) if cred_data.get("expiration_date") else None
            )
            credentials.append(credential)

        # Parse expertise domains
        expertise_domains = []
        for domain_data in agent_data.get("expertise_domains", []):
            domain = ExpertiseDomain(
                domain_name=domain_data["domain_name"],
                specialty=MedicalSpecialty(domain_data["specialty"]),
                expertise_level=ExpertiseLevel(domain_data["expertise_level"]),
                years_experience=domain_data["years_experience"],
                case_volume_annual=domain_data.get("case_volume_annual"),
                success_rate=domain_data.get("success_rate"),
                certification_details=domain_data.get("certification_details", {})
            )
            expertise_domains.append(domain)

        # Create performance metrics
        perf_data = agent_data.get("performance_metrics", {})
        performance_metrics = PerformanceMetrics(
            response_time_avg_minutes=perf_data.get("response_time_avg_minutes", 30.0),
            response_time_percentile_95=perf_data.get("response_time_percentile_95", 60.0),
            case_success_rate=perf_data.get("case_success_rate", 0.85),
            patient_satisfaction_score=perf_data.get("patient_satisfaction_score", 4.2),
            peer_rating_average=perf_data.get("peer_rating_average", 4.0),
            accuracy_rate=perf_data.get("accuracy_rate", 0.92),
            consultation_count_total=perf_data.get("consultation_count_total", 100),
            consultation_count_30d=perf_data.get("consultation_count_30d", 25),
            cancellation_rate=perf_data.get("cancellation_rate", 0.05),
            escalation_rate=perf_data.get("escalation_rate", 0.03),
            complexity_handling_score=perf_data.get("complexity_handling_score", 0.78)
        )

        # Create availability schedule
        schedule_data = agent_data.get("availability_schedule", {})
        availability_schedule = AvailabilitySchedule(
            timezone=schedule_data.get("timezone", "UTC"),
            weekly_hours_committed=schedule_data.get("weekly_hours", 40),
            preferred_days=schedule_data.get("preferred_days", []),
            preferred_hours=schedule_data.get("preferred_hours", []),
            emergency_availability=schedule_data.get("emergency_availability", False),
            max_concurrent_cases=schedule_data.get("max_concurrent_cases", 3)
        )

        # Create agent
        agent = ClinicalAgent(
            agent_id=f"agent_{uuid.uuid4().hex[:12]}",
            user_id=agent_data["user_id"],
            organization_id=agent_data["organization_id"],
            name=agent_data["name"],
            primary_specialty=MedicalSpecialty(agent_data["primary_specialty"]),
            secondary_specialties=[MedicalSpecialty(s) for s in agent_data.get("secondary_specialties", [])],
            credentials=credentials,
            expertise_domains=expertise_domains,
            performance_metrics=performance_metrics,
            availability_schedule=availability_schedule,
            languages=agent_data.get("languages", ["english"]),
            years_total_experience=agent_data.get("years_total_experience", 5)
        )

        return agent

    async def route_to_agents(self, routing_request_data: Dict[str, Any]) -> RoutingResult:
        """Route request to optimal clinical agents"""
        with tracer.start_as_current_span("agent_routing"):
            # Create routing request
            routing_request = RoutingRequest(
                request_id=routing_request_data.get("routing_request_id", f"route_{uuid.uuid4().hex[:8]}"),
                requester_id=routing_request_data["requester_id"],
                organization_id=routing_request_data["organization_id"],
                case_description=routing_request_data["case_description"],
                primary_specialty_needed=MedicalSpecialty(routing_request_data["primary_specialty_needed"]),
                secondary_specialties_needed=[MedicalSpecialty(s) for s in routing_request_data.get("secondary_specialties_needed", [])],
                required_expertise_level=ExpertiseLevel(routing_request_data["required_expertise_level"]),
                case_complexity=routing_request_data["case_complexity"],
                urgency_level=routing_request_data["urgency_level"],
                routing_strategy=RoutingStrategy(routing_request_data.get("routing_strategy", "hybrid_multi_factor")),
                max_agents=routing_request_data.get("max_agents", 3),
                exclude_agent_ids=routing_request_data.get("exclude_agent_ids", [])
            )

            # Route using engine
            routing_result = await self.routing_engine.route_request(routing_request)

            self.routing_count += 1

            return routing_result

    async def _cache_agent(self, agent: ClinicalAgent):
        """Cache agent data in Redis"""
        if self.redis_client:
            await self.redis_client.setex(
                f"agent:{agent.agent_id}",
                3600,
                json.dumps(asdict(agent), default=str)
            )

    async def _persist_agent(self, agent: ClinicalAgent):
        """Persist agent to PostgreSQL database"""
        # Simplified persistence logic
        logger.info(f"Persisting agent {agent.agent_id} to database")

    async def get_registry_status(self) -> Dict[str, Any]:
        """Get comprehensive registry status"""
        specialty_counts = {}
        for agent in self.agents.values():
            specialty = agent.primary_specialty.value
            specialty_counts[specialty] = specialty_counts.get(specialty, 0) + 1

        return {
            "total_agents": len(self.agents),
            "active_agents": len([a for a in self.agents.values() if a.status == "active"]),
            "specialties_coverage": specialty_counts,
            "registration_count": self.registration_count,
            "routing_count": self.routing_count,
            "supported_specialties": [s.value for s in MedicalSpecialty],
            "supported_expertise_levels": [e.value for e in ExpertiseLevel],
            "supported_routing_strategies": [r.value for r in RoutingStrategy]
        }

    async def shutdown(self):
        """Graceful shutdown of registry"""
        logger.info("Shutting down Clinical Agent Registry")

        if self.redis_client:
            await self.redis_client.close()

        if self.postgres_pool:
            await self.postgres_pool.close()

        logger.info("Clinical Agent Registry shutdown complete")

# Factory function for easy instantiation
async def create_clinical_agent_registry(config: Dict[str, Any]) -> ClinicalAgentRegistry:
    """Create and initialize Clinical Agent Registry"""
    registry = ClinicalAgentRegistry(config)
    await registry.initialize()
    return registry