# ===================================================================
# Clinical Agent Registry - Phase 2 Enhanced
# Medical specializations, credentials verification, and intelligent routing
# ===================================================================

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Set, Tuple
from enum import Enum
import uuid
from dataclasses import dataclass, asdict, field
import hashlib
import asyncpg
import redis.asyncio as redis
from sqlalchemy import text
import opentelemetry.trace as trace
from opentelemetry import metrics
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
agent_registrations = meter.create_counter(
    "agent_registrations_total",
    description="Total agent registrations"
)

credential_verifications = meter.create_counter(
    "credential_verifications_total",
    description="Total credential verifications"
)

agent_routing_requests = meter.create_counter(
    "agent_routing_requests_total",
    description="Total agent routing requests"
)

class MedicalSpecialty(Enum):
    """Medical specialties for clinical agents"""
    # Primary Care
    INTERNAL_MEDICINE = "internal_medicine"
    FAMILY_MEDICINE = "family_medicine"
    GENERAL_PRACTICE = "general_practice"

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
    HEMATOLOGY = "hematology"
    INFECTIOUS_DISEASE = "infectious_disease"
    DERMATOLOGY = "dermatology"
    ALLERGY_IMMUNOLOGY = "allergy_immunology"

    # Surgical Specialties
    GENERAL_SURGERY = "general_surgery"
    CARDIAC_SURGERY = "cardiac_surgery"
    NEUROSURGERY = "neurosurgery"
    ORTHOPEDIC_SURGERY = "orthopedic_surgery"
    PLASTIC_SURGERY = "plastic_surgery"
    UROLOGY = "urology"
    OTOLARYNGOLOGY = "otolaryngology"
    OPHTHALMOLOGY = "ophthalmology"

    # Pediatrics
    PEDIATRICS = "pediatrics"
    PEDIATRIC_CARDIOLOGY = "pediatric_cardiology"
    PEDIATRIC_ONCOLOGY = "pediatric_oncology"
    NEONATOLOGY = "neonatology"

    # Emergency and Critical Care
    EMERGENCY_MEDICINE = "emergency_medicine"
    CRITICAL_CARE = "critical_care"
    ANESTHESIOLOGY = "anesthesiology"

    # Diagnostic Specialties
    RADIOLOGY = "radiology"
    PATHOLOGY = "pathology"
    NUCLEAR_MEDICINE = "nuclear_medicine"

    # Other Specialties
    PHYSICAL_MEDICINE_REHABILITATION = "physical_medicine_rehabilitation"
    OCCUPATIONAL_MEDICINE = "occupational_medicine"
    PREVENTIVE_MEDICINE = "preventive_medicine"
    PALLIATIVE_CARE = "palliative_care"
    GERIATRICS = "geriatrics"

    # Non-Physician Specialties
    NURSING = "nursing"
    PHARMACY = "pharmacy"
    CLINICAL_PSYCHOLOGY = "clinical_psychology"
    SOCIAL_WORK = "social_work"
    NUTRITION = "nutrition"
    PHYSICAL_THERAPY = "physical_therapy"

    # Regulatory and Research
    REGULATORY_AFFAIRS = "regulatory_affairs"
    CLINICAL_RESEARCH = "clinical_research"
    BIOSTATISTICS = "biostatistics"
    EPIDEMIOLOGY = "epidemiology"
    HEALTH_ECONOMICS = "health_economics"

class CredentialType(Enum):
    """Types of medical credentials"""
    MEDICAL_DEGREE = "medical_degree"           # MD, DO, MBBS
    SPECIALTY_CERTIFICATION = "specialty_certification"  # Board certification
    LICENSE = "license"                         # State medical license
    FELLOWSHIP = "fellowship"                   # Fellowship training
    RESIDENCY = "residency"                     # Residency training
    CONTINUING_EDUCATION = "continuing_education"  # CME credits
    RESEARCH_CREDENTIAL = "research_credential"  # Research qualifications
    INSTITUTIONAL_AFFILIATION = "institutional_affiliation"  # Hospital/clinic affiliation
    PUBLICATION_RECORD = "publication_record"   # Research publications
    CLINICAL_TRIAL_EXPERIENCE = "clinical_trial_experience"  # Trial involvement

class AgentStatus(Enum):
    """Agent registration status"""
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    REVOKED = "revoked"

class ExpertiseLevel(Enum):
    """Expertise levels for clinical domains"""
    NOVICE = "novice"
    COMPETENT = "competent"
    PROFICIENT = "proficient"
    EXPERT = "expert"
    MASTER = "master"

class RoutingStrategy(Enum):
    """Agent routing strategies"""
    EXPERTISE_BASED = "expertise_based"
    AVAILABILITY_BASED = "availability_based"
    LOAD_BALANCED = "load_balanced"
    SPECIALTY_MATCH = "specialty_match"
    EXPERIENCE_WEIGHTED = "experience_weighted"
    OUTCOME_OPTIMIZED = "outcome_optimized"

@dataclass
class Credential:
    """Medical credential information"""
    credential_id: str
    credential_type: CredentialType
    issuing_authority: str
    credential_name: str
    credential_number: str
    issue_date: datetime
    expiry_date: Optional[datetime]
    verification_status: str
    verification_date: Optional[datetime]
    verification_source: str
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ExpertiseDomain:
    """Expertise domain with proficiency level"""
    domain_id: str
    domain_name: str
    specialty: MedicalSpecialty
    expertise_level: ExpertiseLevel
    years_experience: int
    case_volume: int
    success_metrics: Dict[str, float]
    certifications: List[str]
    subspecialties: List[str] = field(default_factory=list)
    research_areas: List[str] = field(default_factory=list)

@dataclass
class PerformanceMetrics:
    """Agent performance metrics"""
    total_consultations: int
    success_rate: float
    average_response_time: float
    patient_satisfaction: float
    peer_rating: float
    outcome_quality: float
    compliance_score: float
    continuous_learning_score: float
    collaboration_effectiveness: float
    innovation_index: float
    last_updated: datetime = datetime.utcnow()

@dataclass
class AvailabilitySchedule:
    """Agent availability schedule"""
    schedule_id: str
    agent_id: str
    timezone: str
    weekly_schedule: Dict[str, List[Dict[str, str]]]  # day -> [{"start": "09:00", "end": "17:00"}]
    exceptions: List[Dict[str, Any]]  # Special dates/times
    max_concurrent_sessions: int
    preferred_session_duration: int  # minutes
    break_duration: int  # minutes between sessions
    emergency_availability: bool
    last_updated: datetime = datetime.utcnow()

@dataclass
class ClinicalAgent:
    """Comprehensive clinical agent profile"""
    agent_id: str
    user_id: str
    organization_id: str

    # Basic Information
    name: str
    email: str
    primary_specialty: MedicalSpecialty
    secondary_specialties: List[MedicalSpecialty]

    # Status and Registration
    status: AgentStatus
    registration_date: datetime
    last_verification_date: Optional[datetime]
    verification_expiry: Optional[datetime]

    # Credentials and Qualifications
    credentials: List[Credential]
    expertise_domains: List[ExpertiseDomain]
    institutional_affiliations: List[str]

    # Performance and Metrics
    performance_metrics: PerformanceMetrics
    rating: float
    trust_score: float

    # Availability and Preferences
    availability_schedule: Optional[AvailabilitySchedule]
    preferred_case_types: List[str]
    language_preferences: List[str]
    communication_preferences: Dict[str, Any]

    # Professional Information
    years_in_practice: int
    education_background: List[Dict[str, Any]]
    research_interests: List[str]
    publication_count: int
    clinical_trial_involvement: int

    # System Integration
    ai_model_preferences: Dict[str, Any]
    decision_support_tools: List[str]
    quality_assurance_protocols: List[str]

    # Metadata
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class RoutingRequest:
    """Agent routing request"""
    request_id: str
    requester_id: str
    organization_id: str

    # Case Information
    case_description: str
    primary_specialty_needed: MedicalSpecialty
    secondary_specialties_needed: List[MedicalSpecialty]
    urgency_level: str  # routine, urgent, emergent
    complexity_score: float

    # Requirements
    required_expertise_level: ExpertiseLevel
    preferred_languages: List[str]
    session_type: str  # consultation, second_opinion, collaboration
    estimated_duration: int  # minutes

    # Constraints
    availability_requirements: Dict[str, Any]
    geographic_constraints: Optional[Dict[str, Any]]
    regulatory_requirements: List[str]

    # Routing Preferences
    routing_strategy: RoutingStrategy
    exclude_agents: List[str]
    prefer_agents: List[str]

    timestamp: datetime = datetime.utcnow()

@dataclass
class RoutingResult:
    """Agent routing result"""
    request_id: str
    matched_agents: List[Dict[str, Any]]  # agent_id, match_score, availability
    routing_strategy_used: RoutingStrategy
    match_criteria: Dict[str, Any]
    confidence_score: float
    processing_time: float
    alternatives: List[Dict[str, Any]]
    routing_explanation: str
    timestamp: datetime = datetime.utcnow()

class CredentialVerificationService:
    """Service for verifying medical credentials"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.verification_sources = config.get('verification_sources', {})

    async def verify_credential(self, credential: Credential) -> Dict[str, Any]:
        """Verify a medical credential"""
        with tracer.start_as_current_span("credential_verification") as span:
            span.set_attribute("credential_type", credential.credential_type.value)
            span.set_attribute("issuing_authority", credential.issuing_authority)

            try:
                verification_result = await self._perform_verification(credential)

                credential_verifications.add(1, {
                    "credential_type": credential.credential_type.value,
                    "status": "verified" if verification_result['is_valid'] else "invalid"
                })

                return verification_result

            except Exception as e:
                logger.error(f"Credential verification failed: {e}")
                return {
                    'is_valid': False,
                    'verification_status': 'error',
                    'error_message': str(e),
                    'confidence_score': 0.0
                }

    async def _perform_verification(self, credential: Credential) -> Dict[str, Any]:
        """Perform actual credential verification"""
        verification_method = self._get_verification_method(credential.credential_type)

        if verification_method == 'api_lookup':
            return await self._verify_via_api(credential)
        elif verification_method == 'database_check':
            return await self._verify_via_database(credential)
        elif verification_method == 'manual_review':
            return await self._verify_manually(credential)
        else:
            return await self._basic_verification(credential)

    def _get_verification_method(self, credential_type: CredentialType) -> str:
        """Determine verification method for credential type"""
        verification_methods = {
            CredentialType.MEDICAL_DEGREE: 'database_check',
            CredentialType.SPECIALTY_CERTIFICATION: 'api_lookup',
            CredentialType.LICENSE: 'api_lookup',
            CredentialType.FELLOWSHIP: 'database_check',
            CredentialType.RESIDENCY: 'database_check',
            CredentialType.CONTINUING_EDUCATION: 'api_lookup',
            CredentialType.RESEARCH_CREDENTIAL: 'manual_review',
            CredentialType.INSTITUTIONAL_AFFILIATION: 'api_lookup',
            CredentialType.PUBLICATION_RECORD: 'database_check',
            CredentialType.CLINICAL_TRIAL_EXPERIENCE: 'database_check'
        }

        return verification_methods.get(credential_type, 'basic_verification')

    async def _verify_via_api(self, credential: Credential) -> Dict[str, Any]:
        """Verify credential via external API"""
        # Simulate API verification
        # In production, this would integrate with medical licensing boards,
        # certification bodies, etc.

        await asyncio.sleep(0.5)  # Simulate API call

        return {
            'is_valid': True,
            'verification_status': 'verified',
            'verification_source': 'external_api',
            'confidence_score': 0.95,
            'details': {
                'verification_date': datetime.utcnow(),
                'verification_id': str(uuid.uuid4()),
                'status': 'active'
            }
        }

    async def _verify_via_database(self, credential: Credential) -> Dict[str, Any]:
        """Verify credential via database lookup"""
        # Simulate database verification
        await asyncio.sleep(0.2)

        return {
            'is_valid': True,
            'verification_status': 'verified',
            'verification_source': 'internal_database',
            'confidence_score': 0.90,
            'details': {
                'verification_date': datetime.utcnow(),
                'status': 'confirmed'
            }
        }

    async def _verify_manually(self, credential: Credential) -> Dict[str, Any]:
        """Mark credential for manual verification"""
        return {
            'is_valid': False,
            'verification_status': 'pending_manual_review',
            'verification_source': 'manual_review_queue',
            'confidence_score': 0.0,
            'details': {
                'review_required': True,
                'estimated_review_time': '2-5 business days'
            }
        }

    async def _basic_verification(self, credential: Credential) -> Dict[str, Any]:
        """Basic credential format verification"""
        is_valid = (
            credential.credential_number and
            credential.issuing_authority and
            credential.issue_date and
            credential.issue_date <= datetime.utcnow()
        )

        return {
            'is_valid': is_valid,
            'verification_status': 'format_verified' if is_valid else 'format_invalid',
            'verification_source': 'basic_validation',
            'confidence_score': 0.7 if is_valid else 0.1,
            'details': {
                'checks_performed': ['format', 'dates', 'required_fields']
            }
        }

class AgentMatchingEngine:
    """Intelligent agent matching and routing engine"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.specialty_weights = self._initialize_specialty_weights()

    def _initialize_specialty_weights(self) -> Dict[MedicalSpecialty, float]:
        """Initialize specialty matching weights"""
        # Higher weights for more critical specialties
        weights = {}
        for specialty in MedicalSpecialty:
            if 'emergency' in specialty.value or 'critical' in specialty.value:
                weights[specialty] = 1.0
            elif 'surgery' in specialty.value or 'cardiology' in specialty.value:
                weights[specialty] = 0.9
            elif 'oncology' in specialty.value or 'neurology' in specialty.value:
                weights[specialty] = 0.85
            else:
                weights[specialty] = 0.8

        return weights

    async def find_matching_agents(self, routing_request: RoutingRequest,
                                 available_agents: List[ClinicalAgent]) -> RoutingResult:
        """Find best matching agents for the routing request"""
        with tracer.start_as_current_span("agent_matching") as span:
            start_time = datetime.utcnow()

            span.set_attribute("request_id", routing_request.request_id)
            span.set_attribute("primary_specialty", routing_request.primary_specialty_needed.value)
            span.set_attribute("agent_count", len(available_agents))

            try:
                # Filter agents by basic criteria
                eligible_agents = self._filter_eligible_agents(routing_request, available_agents)

                # Score agents based on different criteria
                scored_agents = []
                for agent in eligible_agents:
                    score = await self._calculate_agent_score(routing_request, agent)
                    if score > 0:
                        scored_agents.append({
                            'agent': agent,
                            'score': score,
                            'breakdown': score  # In practice, this would be a detailed breakdown
                        })

                # Sort by score
                scored_agents.sort(key=lambda x: x['score'], reverse=True)

                # Apply routing strategy
                final_matches = self._apply_routing_strategy(
                    routing_request.routing_strategy, scored_agents[:10]
                )

                # Prepare result
                matched_agents = []
                for match in final_matches:
                    agent = match['agent']
                    matched_agents.append({
                        'agent_id': agent.agent_id,
                        'name': agent.name,
                        'primary_specialty': agent.primary_specialty.value,
                        'match_score': match['score'],
                        'rating': agent.rating,
                        'availability': 'available',  # Would check actual availability
                        'estimated_response_time': agent.performance_metrics.average_response_time
                    })

                processing_time = (datetime.utcnow() - start_time).total_seconds()

                # Generate routing explanation
                explanation = self._generate_routing_explanation(
                    routing_request, final_matches
                )

                result = RoutingResult(
                    request_id=routing_request.request_id,
                    matched_agents=matched_agents,
                    routing_strategy_used=routing_request.routing_strategy,
                    match_criteria={
                        'primary_specialty': routing_request.primary_specialty_needed.value,
                        'expertise_level': routing_request.required_expertise_level.value,
                        'urgency': routing_request.urgency_level
                    },
                    confidence_score=np.mean([m['score'] for m in final_matches]) if final_matches else 0.0,
                    processing_time=processing_time,
                    alternatives=matched_agents[3:] if len(matched_agents) > 3 else [],
                    routing_explanation=explanation
                )

                agent_routing_requests.add(1, {
                    "routing_strategy": routing_request.routing_strategy.value,
                    "matches_found": str(len(matched_agents))
                })

                return result

            except Exception as e:
                logger.error(f"Agent matching failed: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))

                return RoutingResult(
                    request_id=routing_request.request_id,
                    matched_agents=[],
                    routing_strategy_used=routing_request.routing_strategy,
                    match_criteria={},
                    confidence_score=0.0,
                    processing_time=(datetime.utcnow() - start_time).total_seconds(),
                    alternatives=[],
                    routing_explanation=f"Matching failed: {str(e)}"
                )

    def _filter_eligible_agents(self, request: RoutingRequest,
                              agents: List[ClinicalAgent]) -> List[ClinicalAgent]:
        """Filter agents by basic eligibility criteria"""
        eligible = []

        for agent in agents:
            # Status check
            if agent.status not in [AgentStatus.VERIFIED, AgentStatus.ACTIVE]:
                continue

            # Specialty match
            if (agent.primary_specialty == request.primary_specialty_needed or
                request.primary_specialty_needed in agent.secondary_specialties):
                eligible.append(agent)

        return eligible

    async def _calculate_agent_score(self, request: RoutingRequest,
                                   agent: ClinicalAgent) -> float:
        """Calculate comprehensive agent matching score"""
        score_components = {}

        # Specialty match score (30%)
        specialty_score = self._calculate_specialty_score(request, agent)
        score_components['specialty'] = specialty_score * 0.3

        # Expertise level score (25%)
        expertise_score = self._calculate_expertise_score(request, agent)
        score_components['expertise'] = expertise_score * 0.25

        # Performance score (20%)
        performance_score = self._calculate_performance_score(agent)
        score_components['performance'] = performance_score * 0.2

        # Availability score (15%)
        availability_score = self._calculate_availability_score(request, agent)
        score_components['availability'] = availability_score * 0.15

        # Experience score (10%)
        experience_score = self._calculate_experience_score(request, agent)
        score_components['experience'] = experience_score * 0.1

        total_score = sum(score_components.values())
        return min(1.0, max(0.0, total_score))

    def _calculate_specialty_score(self, request: RoutingRequest,
                                 agent: ClinicalAgent) -> float:
        """Calculate specialty match score"""
        primary_match = 1.0 if agent.primary_specialty == request.primary_specialty_needed else 0.0
        secondary_match = 0.7 if request.primary_specialty_needed in agent.secondary_specialties else 0.0

        base_score = max(primary_match, secondary_match)

        # Apply specialty weight
        specialty_weight = self.specialty_weights.get(request.primary_specialty_needed, 0.8)

        return base_score * specialty_weight

    def _calculate_expertise_score(self, request: RoutingRequest,
                                 agent: ClinicalAgent) -> float:
        """Calculate expertise level score"""
        required_level = request.required_expertise_level

        # Find matching expertise domain
        for domain in agent.expertise_domains:
            if domain.specialty == request.primary_specialty_needed:
                level_mapping = {
                    ExpertiseLevel.NOVICE: 1,
                    ExpertiseLevel.COMPETENT: 2,
                    ExpertiseLevel.PROFICIENT: 3,
                    ExpertiseLevel.EXPERT: 4,
                    ExpertiseLevel.MASTER: 5
                }

                agent_level = level_mapping.get(domain.expertise_level, 1)
                required_level_num = level_mapping.get(required_level, 1)

                if agent_level >= required_level_num:
                    return min(1.0, agent_level / required_level_num)
                else:
                    return agent_level / required_level_num * 0.5

        return 0.3  # Default if no matching domain found

    def _calculate_performance_score(self, agent: ClinicalAgent) -> float:
        """Calculate performance-based score"""
        metrics = agent.performance_metrics

        performance_factors = [
            metrics.success_rate,
            metrics.patient_satisfaction,
            metrics.peer_rating,
            metrics.outcome_quality,
            metrics.compliance_score
        ]

        return np.mean(performance_factors)

    def _calculate_availability_score(self, request: RoutingRequest,
                                    agent: ClinicalAgent) -> float:
        """Calculate availability score"""
        # Simplified availability scoring
        # In practice, would check actual calendar availability

        if not agent.availability_schedule:
            return 0.5  # Default availability

        schedule = agent.availability_schedule
        urgency_multiplier = {
            'routine': 1.0,
            'urgent': 0.8,
            'emergent': 0.6
        }.get(request.urgency_level, 1.0)

        base_availability = 0.8  # Assume generally available

        return base_availability * urgency_multiplier

    def _calculate_experience_score(self, request: RoutingRequest,
                                  agent: ClinicalAgent) -> float:
        """Calculate experience-based score"""
        years_weight = min(1.0, agent.years_in_practice / 10.0)  # Cap at 10 years

        # Find relevant domain experience
        for domain in agent.expertise_domains:
            if domain.specialty == request.primary_specialty_needed:
                case_volume_weight = min(1.0, domain.case_volume / 1000.0)  # Cap at 1000 cases
                return (years_weight + case_volume_weight) / 2

        return years_weight * 0.5

    def _apply_routing_strategy(self, strategy: RoutingStrategy,
                              scored_agents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply specific routing strategy to agent selection"""
        if strategy == RoutingStrategy.EXPERTISE_BASED:
            # Prioritize highest expertise
            return sorted(scored_agents, key=lambda x: x['score'], reverse=True)[:5]

        elif strategy == RoutingStrategy.LOAD_BALANCED:
            # Balance based on current workload (simplified)
            # In practice, would check actual workload
            return scored_agents[:5]

        elif strategy == RoutingStrategy.OUTCOME_OPTIMIZED:
            # Prioritize agents with best outcomes
            return sorted(scored_agents,
                         key=lambda x: x['agent'].performance_metrics.outcome_quality,
                         reverse=True)[:5]

        else:
            # Default: return top scored agents
            return scored_agents[:5]

    def _generate_routing_explanation(self, request: RoutingRequest,
                                    matches: List[Dict[str, Any]]) -> str:
        """Generate human-readable routing explanation"""
        if not matches:
            return "No suitable agents found matching the specified criteria."

        top_match = matches[0]
        agent = top_match['agent']

        explanation = (
            f"Matched {len(matches)} agents based on {request.routing_strategy.value} strategy. "
            f"Top match: Dr. {agent.name} ({agent.primary_specialty.value}) "
            f"with {agent.years_in_practice} years experience and "
            f"{agent.rating:.1f}/5.0 rating."
        )

        return explanation

class ClinicalAgentRegistryService:
    """Main clinical agent registry service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.credential_verifier = CredentialVerificationService(config.get('verification_config', {}))
        self.matching_engine = AgentMatchingEngine(config.get('matching_config', {}))
        self.redis_client = None
        self.postgres_pool = None
        self.agent_cache: Dict[str, ClinicalAgent] = {}

    async def initialize(self):
        """Initialize clinical agent registry service"""
        # Initialize Redis
        redis_config = self.config.get('redis_config', {})
        self.redis_client = redis.Redis(
            host=redis_config.get('host', 'localhost'),
            port=redis_config.get('port', 6379),
            decode_responses=True
        )

        # Initialize PostgreSQL
        postgres_url = self.config.get('postgres_url')
        if postgres_url:
            self.postgres_pool = await asyncpg.create_pool(postgres_url)

        # Load existing agents
        await self._load_agents()

        logger.info("Clinical Agent Registry Service initialized")

    async def register_agent(self, agent_data: Dict[str, Any]) -> ClinicalAgent:
        """Register new clinical agent"""
        with tracer.start_as_current_span("agent_registration") as span:
            agent_id = str(uuid.uuid4())
            span.set_attribute("agent_id", agent_id)

            try:
                # Create agent profile
                agent = self._create_agent_from_data(agent_id, agent_data)

                # Verify credentials
                verified_credentials = []
                for cred_data in agent_data.get('credentials', []):
                    credential = self._create_credential_from_data(cred_data)
                    verification_result = await self.credential_verifier.verify_credential(credential)

                    if verification_result['is_valid']:
                        credential.verification_status = 'verified'
                        credential.verification_date = datetime.utcnow()
                        credential.verification_source = verification_result['verification_source']
                    else:
                        credential.verification_status = 'unverified'

                    verified_credentials.append(credential)

                agent.credentials = verified_credentials

                # Determine initial status
                if all(cred.verification_status == 'verified' for cred in verified_credentials):
                    agent.status = AgentStatus.VERIFIED
                else:
                    agent.status = AgentStatus.PENDING_VERIFICATION

                # Store agent
                await self._store_agent(agent)
                self.agent_cache[agent_id] = agent

                # Record registration
                agent_registrations.add(1, {
                    "specialty": agent.primary_specialty.value,
                    "status": agent.status.value
                })

                logger.info(f"Registered agent {agent_id}: {agent.name}")
                return agent

            except Exception as e:
                logger.error(f"Agent registration failed: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))
                raise

    def _create_agent_from_data(self, agent_id: str, data: Dict[str, Any]) -> ClinicalAgent:
        """Create ClinicalAgent from registration data"""
        # Initialize performance metrics
        performance = PerformanceMetrics(
            total_consultations=0,
            success_rate=0.0,
            average_response_time=0.0,
            patient_satisfaction=0.0,
            peer_rating=0.0,
            outcome_quality=0.0,
            compliance_score=0.0,
            continuous_learning_score=0.0,
            collaboration_effectiveness=0.0,
            innovation_index=0.0
        )

        # Create expertise domains
        expertise_domains = []
        for domain_data in data.get('expertise_domains', []):
            domain = ExpertiseDomain(
                domain_id=str(uuid.uuid4()),
                domain_name=domain_data['domain_name'],
                specialty=MedicalSpecialty(domain_data['specialty']),
                expertise_level=ExpertiseLevel(domain_data['expertise_level']),
                years_experience=domain_data['years_experience'],
                case_volume=domain_data.get('case_volume', 0),
                success_metrics=domain_data.get('success_metrics', {}),
                certifications=domain_data.get('certifications', []),
                subspecialties=domain_data.get('subspecialties', []),
                research_areas=domain_data.get('research_areas', [])
            )
            expertise_domains.append(domain)

        return ClinicalAgent(
            agent_id=agent_id,
            user_id=data['user_id'],
            organization_id=data['organization_id'],
            name=data['name'],
            email=data['email'],
            primary_specialty=MedicalSpecialty(data['primary_specialty']),
            secondary_specialties=[MedicalSpecialty(s) for s in data.get('secondary_specialties', [])],
            status=AgentStatus.PENDING_VERIFICATION,
            registration_date=datetime.utcnow(),
            credentials=[],  # Will be populated during verification
            expertise_domains=expertise_domains,
            institutional_affiliations=data.get('institutional_affiliations', []),
            performance_metrics=performance,
            rating=0.0,
            trust_score=0.5,  # Initial trust score
            availability_schedule=None,  # Can be set later
            preferred_case_types=data.get('preferred_case_types', []),
            language_preferences=data.get('language_preferences', ['en']),
            communication_preferences=data.get('communication_preferences', {}),
            years_in_practice=data.get('years_in_practice', 0),
            education_background=data.get('education_background', []),
            research_interests=data.get('research_interests', []),
            publication_count=data.get('publication_count', 0),
            clinical_trial_involvement=data.get('clinical_trial_involvement', 0),
            ai_model_preferences=data.get('ai_model_preferences', {}),
            decision_support_tools=data.get('decision_support_tools', []),
            quality_assurance_protocols=data.get('quality_assurance_protocols', []),
            metadata=data.get('metadata', {})
        )

    def _create_credential_from_data(self, cred_data: Dict[str, Any]) -> Credential:
        """Create Credential from data"""
        return Credential(
            credential_id=str(uuid.uuid4()),
            credential_type=CredentialType(cred_data['credential_type']),
            issuing_authority=cred_data['issuing_authority'],
            credential_name=cred_data['credential_name'],
            credential_number=cred_data['credential_number'],
            issue_date=datetime.fromisoformat(cred_data['issue_date']),
            expiry_date=datetime.fromisoformat(cred_data['expiry_date']) if cred_data.get('expiry_date') else None,
            verification_status='pending',
            verification_date=None,
            verification_source='',
            metadata=cred_data.get('metadata', {})
        )

    async def route_to_agents(self, routing_request: RoutingRequest) -> RoutingResult:
        """Route request to appropriate clinical agents"""
        # Get available agents
        available_agents = await self._get_available_agents(routing_request)

        # Find matching agents
        result = await self.matching_engine.find_matching_agents(
            routing_request, available_agents
        )

        return result

    async def _get_available_agents(self, request: RoutingRequest) -> List[ClinicalAgent]:
        """Get available agents for routing request"""
        available = []

        for agent in self.agent_cache.values():
            # Status check
            if agent.status not in [AgentStatus.VERIFIED, AgentStatus.ACTIVE]:
                continue

            # Organization check
            if agent.organization_id != request.organization_id:
                continue

            # Exclusion check
            if agent.agent_id in request.exclude_agents:
                continue

            available.append(agent)

        return available

    async def get_agent(self, agent_id: str) -> Optional[ClinicalAgent]:
        """Get agent by ID"""
        # Try cache first
        if agent_id in self.agent_cache:
            return self.agent_cache[agent_id]

        # Load from database
        agent = await self._load_agent(agent_id)
        if agent:
            self.agent_cache[agent_id] = agent

        return agent

    async def update_agent_performance(self, agent_id: str,
                                     performance_update: Dict[str, Any]) -> bool:
        """Update agent performance metrics"""
        agent = await self.get_agent(agent_id)
        if not agent:
            return False

        # Update performance metrics
        for metric, value in performance_update.items():
            if hasattr(agent.performance_metrics, metric):
                setattr(agent.performance_metrics, metric, value)

        agent.performance_metrics.last_updated = datetime.utcnow()
        agent.updated_at = datetime.utcnow()

        # Update rating based on performance
        agent.rating = self._calculate_overall_rating(agent.performance_metrics)

        # Store updated agent
        await self._store_agent(agent)

        return True

    def _calculate_overall_rating(self, performance: PerformanceMetrics) -> float:
        """Calculate overall agent rating from performance metrics"""
        rating_factors = [
            performance.success_rate,
            performance.patient_satisfaction,
            performance.peer_rating,
            performance.outcome_quality,
            performance.compliance_score
        ]

        # Weight factors
        weights = [0.3, 0.25, 0.2, 0.15, 0.1]

        weighted_score = sum(factor * weight for factor, weight in zip(rating_factors, weights))

        # Convert to 5-point scale
        return min(5.0, max(0.0, weighted_score * 5.0))

    async def _load_agents(self):
        """Load agents from database into cache"""
        if not self.postgres_pool:
            return

        try:
            async with self.postgres_pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT agent_id, agent_data
                    FROM clinical_agents
                    WHERE status IN ('verified', 'active')
                """)

                for row in rows:
                    agent_data = json.loads(row['agent_data'])
                    agent = self._deserialize_agent(agent_data)
                    self.agent_cache[agent.agent_id] = agent

                logger.info(f"Loaded {len(self.agent_cache)} agents from database")

        except Exception as e:
            logger.error(f"Failed to load agents: {e}")

    async def _load_agent(self, agent_id: str) -> Optional[ClinicalAgent]:
        """Load specific agent from database"""
        if not self.postgres_pool:
            return None

        try:
            async with self.postgres_pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT agent_data FROM clinical_agents WHERE agent_id = $1
                """, agent_id)

                if row:
                    agent_data = json.loads(row['agent_data'])
                    return self._deserialize_agent(agent_data)

        except Exception as e:
            logger.error(f"Failed to load agent {agent_id}: {e}")

        return None

    async def _store_agent(self, agent: ClinicalAgent):
        """Store agent in database"""
        if not self.postgres_pool:
            return

        try:
            agent_data = json.dumps(asdict(agent), default=str)

            async with self.postgres_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO clinical_agents (agent_id, user_id, organization_id,
                                               name, primary_specialty, status, agent_data, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (agent_id) DO UPDATE SET
                        agent_data = EXCLUDED.agent_data,
                        updated_at = EXCLUDED.updated_at
                """, agent.agent_id, agent.user_id, agent.organization_id,
                agent.name, agent.primary_specialty.value, agent.status.value,
                agent_data, agent.updated_at)

        except Exception as e:
            logger.error(f"Failed to store agent {agent.agent_id}: {e}")

    def _deserialize_agent(self, data: Dict[str, Any]) -> ClinicalAgent:
        """Deserialize agent data from database"""
        # This would be a comprehensive deserialization function
        # For brevity, showing simplified version

        agent = ClinicalAgent(**data)
        # Additional deserialization logic for complex fields

        return agent

    async def get_registry_statistics(self) -> Dict[str, Any]:
        """Get registry statistics"""
        total_agents = len(self.agent_cache)

        # Count by specialty
        specialty_counts = {}
        status_counts = {}

        for agent in self.agent_cache.values():
            specialty = agent.primary_specialty.value
            specialty_counts[specialty] = specialty_counts.get(specialty, 0) + 1

            status = agent.status.value
            status_counts[status] = status_counts.get(status, 0) + 1

        return {
            'total_agents': total_agents,
            'by_specialty': specialty_counts,
            'by_status': status_counts,
            'average_rating': np.mean([agent.rating for agent in self.agent_cache.values()]) if self.agent_cache else 0.0,
            'last_updated': datetime.utcnow().isoformat()
        }

    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down Clinical Agent Registry Service")

        if self.redis_client:
            await self.redis_client.close()

        if self.postgres_pool:
            await self.postgres_pool.close()

        logger.info("Clinical Agent Registry Service shutdown complete")

# Factory function
async def create_agent_registry_service(config: Dict[str, Any]) -> ClinicalAgentRegistryService:
    """Create and initialize Clinical Agent Registry Service"""
    service = ClinicalAgentRegistryService(config)
    await service.initialize()
    return service