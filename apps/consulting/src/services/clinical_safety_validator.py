# ===================================================================
# Clinical Safety Validation Service - Phase 2 Enhanced
# FHIR/HL7 integration with comprehensive clinical validation
# ===================================================================

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from enum import Enum
import uuid
from dataclasses import dataclass, asdict
import aiohttp
from fhir.resources import (
    Patient, Observation, Condition, MedicationRequest, AllergyIntolerance,
    DiagnosticReport, Bundle, OperationOutcome
)
import hl7
from hl7.mllp import start_hl7_server
import opentelemetry.trace as trace
from opentelemetry import metrics
import asyncpg
from sqlalchemy import text
import redis.asyncio as redis

# Configure logging and telemetry
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
validation_requests = meter.create_counter(
    "clinical_validation_requests_total",
    description="Total clinical validation requests"
)

validation_duration = meter.create_histogram(
    "clinical_validation_duration_seconds",
    description="Clinical validation processing time"
)

safety_alerts = meter.create_counter(
    "safety_alerts_total",
    description="Total safety alerts generated"
)

class SafetyLevel(Enum):
    """Safety alert levels"""
    CRITICAL = "critical"     # Immediate intervention required
    HIGH = "high"            # High priority, urgent attention
    MODERATE = "moderate"    # Moderate risk, monitor closely
    LOW = "low"             # Low risk, informational
    INFO = "info"           # Informational only

class EvidenceLevel(Enum):
    """Evidence levels for clinical validation"""
    LEVEL_I = "Level I"          # Systematic reviews, meta-analyses
    LEVEL_II = "Level II"        # RCTs, cohort studies
    LEVEL_III = "Level III"      # Case-control studies
    LEVEL_IV = "Level IV"        # Case series, expert opinion
    UNVALIDATED = "Unvalidated"  # No clinical evidence

class GRADERating(Enum):
    """GRADE evidence quality ratings"""
    HIGH = "High"           # High confidence in effect estimate
    MODERATE = "Moderate"   # Moderate confidence in effect estimate
    LOW = "Low"            # Low confidence in effect estimate
    VERY_LOW = "Very Low"  # Very low confidence in effect estimate

@dataclass
class ClinicalContext:
    """Clinical context for validation"""
    patient_id: Optional[str] = None
    age_range: Optional[str] = None
    gender: Optional[str] = None
    conditions: List[str] = None
    medications: List[str] = None
    allergies: List[str] = None
    vital_signs: Dict[str, Any] = None
    lab_results: Dict[str, Any] = None

@dataclass
class SafetyAlert:
    """Clinical safety alert"""
    alert_id: str
    level: SafetyLevel
    category: str
    message: str
    clinical_significance: str
    recommended_action: str
    evidence_level: EvidenceLevel
    grade_rating: GRADERating
    contraindications: List[str]
    drug_interactions: List[str]
    monitoring_requirements: List[str]
    timestamp: datetime = datetime.utcnow()

@dataclass
class ValidationResult:
    """Clinical validation result"""
    validation_id: str
    is_clinically_valid: bool
    confidence_score: float
    evidence_level: EvidenceLevel
    grade_rating: GRADERating
    clinical_concepts: List[Dict[str, Any]]
    safety_alerts: List[SafetyAlert]
    contraindications: List[str]
    drug_interactions: List[Dict[str, Any]]
    monitoring_requirements: List[str]
    clinical_guidelines: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    fhir_resources: List[Dict[str, Any]]
    processing_time: float
    timestamp: datetime = datetime.utcnow()

class FHIRClient:
    """FHIR client for healthcare interoperability"""

    def __init__(self, base_url: str, auth_config: Dict[str, Any]):
        self.base_url = base_url.rstrip('/')
        self.auth_config = auth_config
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def search_patient(self, patient_id: str) -> Optional[Patient]:
        """Search for patient by ID"""
        try:
            url = f"{self.base_url}/Patient/{patient_id}"
            headers = await self._get_auth_headers()

            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return Patient(**data)
                else:
                    logger.warning(f"Patient not found: {patient_id}")
                    return None

        except Exception as e:
            logger.error(f"Error searching patient: {e}")
            return None

    async def search_conditions(self, patient_id: str) -> List[Condition]:
        """Search for patient conditions"""
        try:
            url = f"{self.base_url}/Condition"
            params = {"patient": patient_id}
            headers = await self._get_auth_headers()

            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    bundle_data = await response.json()
                    bundle = Bundle(**bundle_data)
                    conditions = []

                    for entry in bundle.entry or []:
                        if entry.resource.resource_type == "Condition":
                            conditions.append(Condition(**entry.resource.dict()))

                    return conditions
                else:
                    return []

        except Exception as e:
            logger.error(f"Error searching conditions: {e}")
            return []

    async def search_medications(self, patient_id: str) -> List[MedicationRequest]:
        """Search for patient medications"""
        try:
            url = f"{self.base_url}/MedicationRequest"
            params = {"patient": patient_id}
            headers = await self._get_auth_headers()

            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    bundle_data = await response.json()
                    bundle = Bundle(**bundle_data)
                    medications = []

                    for entry in bundle.entry or []:
                        if entry.resource.resource_type == "MedicationRequest":
                            medications.append(MedicationRequest(**entry.resource.dict()))

                    return medications
                else:
                    return []

        except Exception as e:
            logger.error(f"Error searching medications: {e}")
            return []

    async def search_allergies(self, patient_id: str) -> List[AllergyIntolerance]:
        """Search for patient allergies"""
        try:
            url = f"{self.base_url}/AllergyIntolerance"
            params = {"patient": patient_id}
            headers = await self._get_auth_headers()

            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    bundle_data = await response.json()
                    bundle = Bundle(**bundle_data)
                    allergies = []

                    for entry in bundle.entry or []:
                        if entry.resource.resource_type == "AllergyIntolerance":
                            allergies.append(AllergyIntolerance(**entry.resource.dict()))

                    return allergies
                else:
                    return []

        except Exception as e:
            logger.error(f"Error searching allergies: {e}")
            return []

    async def create_observation(self, observation_data: Dict[str, Any]) -> Optional[str]:
        """Create clinical observation"""
        try:
            url = f"{self.base_url}/Observation"
            headers = await self._get_auth_headers()
            headers['Content-Type'] = 'application/fhir+json'

            async with self.session.post(url, json=observation_data, headers=headers) as response:
                if response.status in [200, 201]:
                    result = await response.json()
                    return result.get('id')
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to create observation: {error_text}")
                    return None

        except Exception as e:
            logger.error(f"Error creating observation: {e}")
            return None

    async def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers for FHIR requests"""
        headers = {
            'Accept': 'application/fhir+json',
            'User-Agent': 'VITAL-Path-Clinical-Validator/1.0'
        }

        if self.auth_config.get('type') == 'bearer':
            headers['Authorization'] = f"Bearer {self.auth_config['token']}"
        elif self.auth_config.get('type') == 'basic':
            # Implement basic auth if needed
            pass

        return headers

class HL7Processor:
    """HL7 message processor for clinical data exchange"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.message_handlers = {
            'ADT': self._handle_adt_message,
            'ORU': self._handle_oru_message,
            'ORM': self._handle_orm_message,
        }

    async def start_hl7_server(self, host: str = '0.0.0.0', port: int = 2575):
        """Start HL7 MLLP server"""
        try:
            await start_hl7_server(self._handle_hl7_message, port=port, host=host)
            logger.info(f"HL7 server started on {host}:{port}")
        except Exception as e:
            logger.error(f"Failed to start HL7 server: {e}")

    async def _handle_hl7_message(self, message: hl7.Message) -> hl7.Message:
        """Handle incoming HL7 message"""
        try:
            message_type = message.msh.msh_9.msh_9_1
            logger.info(f"Received HL7 message type: {message_type}")

            handler = self.message_handlers.get(message_type)
            if handler:
                return await handler(message)
            else:
                logger.warning(f"No handler for message type: {message_type}")
                return self._create_ack_message(message, "AR", "Unknown message type")

        except Exception as e:
            logger.error(f"Error handling HL7 message: {e}")
            return self._create_ack_message(message, "AE", str(e))

    async def _handle_adt_message(self, message: hl7.Message) -> hl7.Message:
        """Handle ADT (Admit/Discharge/Transfer) message"""
        # Extract patient information and process
        patient_id = message.pid.pid_3[0]
        logger.info(f"Processing ADT for patient: {patient_id}")
        return self._create_ack_message(message, "AA", "ADT processed successfully")

    async def _handle_oru_message(self, message: hl7.Message) -> hl7.Message:
        """Handle ORU (Observation Result Unsolicited) message"""
        # Process lab results and observations
        patient_id = message.pid.pid_3[0]
        logger.info(f"Processing ORU for patient: {patient_id}")
        return self._create_ack_message(message, "AA", "ORU processed successfully")

    async def _handle_orm_message(self, message: hl7.Message) -> hl7.Message:
        """Handle ORM (Order Message) message"""
        # Process medication and treatment orders
        patient_id = message.pid.pid_3[0]
        logger.info(f"Processing ORM for patient: {patient_id}")
        return self._create_ack_message(message, "AA", "ORM processed successfully")

    def _create_ack_message(self, original_message: hl7.Message,
                           ack_code: str, message_text: str) -> hl7.Message:
        """Create ACK response message"""
        ack = hl7.Message("MSH", [
            ["MSH", "|", "^~\\&", "VITAL_PATH", "", "SENDER", "",
             datetime.now().strftime("%Y%m%d%H%M%S"), "", "ACK",
             original_message.msh.msh_10, "P", "2.5"],
            ["MSA", ack_code, original_message.msh.msh_10, message_text]
        ])
        return ack

class DrugInteractionChecker:
    """Drug interaction checking service"""

    def __init__(self, interaction_db_url: str):
        self.interaction_db_url = interaction_db_url
        self.known_interactions = {}  # Cache for performance

    async def check_interactions(self, medications: List[str]) -> List[Dict[str, Any]]:
        """Check for drug-drug interactions"""
        interactions = []

        for i, med1 in enumerate(medications):
            for med2 in medications[i+1:]:
                interaction = await self._check_pair_interaction(med1, med2)
                if interaction:
                    interactions.append(interaction)

        return interactions

    async def _check_pair_interaction(self, med1: str, med2: str) -> Optional[Dict[str, Any]]:
        """Check interaction between two medications"""
        # Normalize medication names
        med1_norm = med1.lower().strip()
        med2_norm = med2.lower().strip()

        # Check cache first
        cache_key = f"{min(med1_norm, med2_norm)}_{max(med1_norm, med2_norm)}"
        if cache_key in self.known_interactions:
            return self.known_interactions[cache_key]

        # Simulate drug interaction database lookup
        # In production, this would query a real drug interaction database
        known_interactions = {
            ("warfarin", "aspirin"): {
                "severity": "high",
                "mechanism": "Increased bleeding risk",
                "clinical_effect": "Enhanced anticoagulation",
                "management": "Monitor INR closely, consider dose adjustment"
            },
            ("metformin", "contrast_dye"): {
                "severity": "moderate",
                "mechanism": "Increased risk of lactic acidosis",
                "clinical_effect": "Metabolic acidosis",
                "management": "Hold metformin 48 hours before contrast"
            }
        }

        interaction_key = (min(med1_norm, med2_norm), max(med1_norm, med2_norm))
        if interaction_key in known_interactions:
            interaction_data = known_interactions[interaction_key]
            interaction_data.update({
                "drug1": med1,
                "drug2": med2,
                "interaction_id": str(uuid.uuid4())
            })

            # Cache result
            self.known_interactions[cache_key] = interaction_data
            return interaction_data

        return None

class ClinicalConceptExtractor:
    """Extract and normalize clinical concepts"""

    def __init__(self, terminology_config: Dict[str, Any]):
        self.terminology_config = terminology_config
        self.concept_cache = {}

    async def extract_concepts(self, text: str) -> List[Dict[str, Any]]:
        """Extract clinical concepts from text"""
        concepts = []

        # Simulate medical NLP processing
        # In production, this would use medical NLP libraries like spaCy with medical models

        medical_terms = {
            "diabetes": {
                "concept_id": "73211009",
                "system": "SNOMED-CT",
                "category": "condition",
                "severity": "chronic",
                "icd10": "E11"
            },
            "hypertension": {
                "concept_id": "38341003",
                "system": "SNOMED-CT",
                "category": "condition",
                "severity": "chronic",
                "icd10": "I10"
            },
            "aspirin": {
                "concept_id": "387458008",
                "system": "SNOMED-CT",
                "category": "medication",
                "class": "NSAID",
                "rxnorm": "1191"
            }
        }

        text_lower = text.lower()
        for term, concept_data in medical_terms.items():
            if term in text_lower:
                concept = {
                    "term": term,
                    "confidence": 0.95,
                    "start_pos": text_lower.find(term),
                    "end_pos": text_lower.find(term) + len(term),
                    **concept_data
                }
                concepts.append(concept)

        return concepts

    async def normalize_concept(self, concept: str, target_system: str = "SNOMED-CT") -> Optional[Dict[str, Any]]:
        """Normalize concept to target terminology system"""
        # Implementation would use terminology services
        return {
            "original_concept": concept,
            "normalized_concept": concept.upper(),
            "target_system": target_system,
            "confidence": 0.9
        }

class ClinicalSafetyValidator:
    """Main clinical safety validation service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.fhir_client = None
        self.hl7_processor = HL7Processor(config.get("hl7_config", {}))
        self.drug_checker = DrugInteractionChecker(config.get("drug_interaction_db"))
        self.concept_extractor = ClinicalConceptExtractor(config.get("terminology_config", {}))
        self.redis_client = None
        self.postgres_pool = None

    async def initialize(self):
        """Initialize validation service"""
        # Initialize FHIR client
        fhir_config = self.config.get("fhir_config", {})
        self.fhir_client = FHIRClient(
            fhir_config.get("base_url", "http://localhost:8080/fhir"),
            fhir_config.get("auth_config", {})
        )

        # Initialize Redis for caching
        redis_config = self.config.get("redis_config", {})
        self.redis_client = redis.Redis(
            host=redis_config.get("host", "localhost"),
            port=redis_config.get("port", 6379),
            decode_responses=True
        )

        # Initialize PostgreSQL for persistence
        postgres_url = self.config.get("postgres_url")
        if postgres_url:
            self.postgres_pool = await asyncpg.create_pool(postgres_url)

        # Start HL7 server if configured
        hl7_config = self.config.get("hl7_server", {})
        if hl7_config.get("enabled", False):
            await self.hl7_processor.start_hl7_server(
                hl7_config.get("host", "0.0.0.0"),
                hl7_config.get("port", 2575)
            )

        logger.info("Clinical Safety Validator initialized")

    async def validate_clinical_query(self, query: str,
                                    clinical_context: Optional[ClinicalContext] = None) -> ValidationResult:
        """Main clinical validation method"""
        with tracer.start_as_current_span("clinical_validation") as span:
            start_time = datetime.utcnow()
            validation_requests.add(1)

            validation_id = str(uuid.uuid4())
            span.set_attribute("validation_id", validation_id)

            try:
                # 1. Extract clinical concepts
                clinical_concepts = await self.concept_extractor.extract_concepts(query)

                # 2. Get patient clinical data if context provided
                fhir_resources = []
                if clinical_context and clinical_context.patient_id:
                    fhir_resources = await self._get_patient_fhir_data(clinical_context.patient_id)

                # 3. Check drug interactions
                drug_interactions = []
                medications = []
                if clinical_context and clinical_context.medications:
                    medications = clinical_context.medications
                    drug_interactions = await self.drug_checker.check_interactions(medications)

                # 4. Generate safety alerts
                safety_alerts = await self._generate_safety_alerts(
                    clinical_concepts, drug_interactions, clinical_context
                )

                # 5. Assess evidence level and grade
                evidence_level, grade_rating = await self._assess_evidence_quality(
                    clinical_concepts, query
                )

                # 6. Generate clinical recommendations
                recommendations = await self._generate_recommendations(
                    clinical_concepts, safety_alerts, clinical_context
                )

                # 7. Check contraindications
                contraindications = await self._check_contraindications(
                    clinical_concepts, clinical_context
                )

                # 8. Determine monitoring requirements
                monitoring_requirements = await self._determine_monitoring_requirements(
                    clinical_concepts, medications, clinical_context
                )

                # 9. Find relevant clinical guidelines
                clinical_guidelines = await self._find_clinical_guidelines(clinical_concepts)

                # Calculate confidence score
                confidence_score = self._calculate_confidence_score(
                    evidence_level, grade_rating, len(safety_alerts)
                )

                # Create validation result
                result = ValidationResult(
                    validation_id=validation_id,
                    is_clinically_valid=len([alert for alert in safety_alerts
                                           if alert.level in [SafetyLevel.CRITICAL, SafetyLevel.HIGH]]) == 0,
                    confidence_score=confidence_score,
                    evidence_level=evidence_level,
                    grade_rating=grade_rating,
                    clinical_concepts=clinical_concepts,
                    safety_alerts=safety_alerts,
                    contraindications=contraindications,
                    drug_interactions=drug_interactions,
                    monitoring_requirements=monitoring_requirements,
                    clinical_guidelines=clinical_guidelines,
                    recommendations=recommendations,
                    fhir_resources=fhir_resources,
                    processing_time=(datetime.utcnow() - start_time).total_seconds()
                )

                # Cache result
                await self._cache_validation_result(validation_id, result)

                # Log safety alerts
                for alert in safety_alerts:
                    safety_alerts.add(1, {"level": alert.level.value})

                validation_duration.record(result.processing_time)

                return result

            except Exception as e:
                logger.error(f"Clinical validation failed: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))

                return ValidationResult(
                    validation_id=validation_id,
                    is_clinically_valid=False,
                    confidence_score=0.0,
                    evidence_level=EvidenceLevel.UNVALIDATED,
                    grade_rating=GRADERating.VERY_LOW,
                    clinical_concepts=[],
                    safety_alerts=[],
                    contraindications=[],
                    drug_interactions=[],
                    monitoring_requirements=[],
                    clinical_guidelines=[],
                    recommendations=[],
                    fhir_resources=[],
                    processing_time=(datetime.utcnow() - start_time).total_seconds()
                )

    async def _get_patient_fhir_data(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get patient FHIR resources"""
        fhir_resources = []

        async with self.fhir_client as client:
            # Get patient
            patient = await client.search_patient(patient_id)
            if patient:
                fhir_resources.append(patient.dict())

            # Get conditions
            conditions = await client.search_conditions(patient_id)
            fhir_resources.extend([condition.dict() for condition in conditions])

            # Get medications
            medications = await client.search_medications(patient_id)
            fhir_resources.extend([medication.dict() for medication in medications])

            # Get allergies
            allergies = await client.search_allergies(patient_id)
            fhir_resources.extend([allergy.dict() for allergy in allergies])

        return fhir_resources

    async def _generate_safety_alerts(self, clinical_concepts: List[Dict[str, Any]],
                                    drug_interactions: List[Dict[str, Any]],
                                    clinical_context: Optional[ClinicalContext]) -> List[SafetyAlert]:
        """Generate clinical safety alerts"""
        alerts = []

        # Drug interaction alerts
        for interaction in drug_interactions:
            alert = SafetyAlert(
                alert_id=str(uuid.uuid4()),
                level=SafetyLevel.HIGH if interaction["severity"] == "high" else SafetyLevel.MODERATE,
                category="drug_interaction",
                message=f"Potential interaction between {interaction['drug1']} and {interaction['drug2']}",
                clinical_significance=interaction["clinical_effect"],
                recommended_action=interaction["management"],
                evidence_level=EvidenceLevel.LEVEL_II,
                grade_rating=GRADERating.HIGH,
                contraindications=[],
                drug_interactions=[interaction],
                monitoring_requirements=[interaction["management"]]
            )
            alerts.append(alert)

        # Clinical concept alerts
        for concept in clinical_concepts:
            if concept.get("category") == "condition" and concept.get("severity") == "chronic":
                alert = SafetyAlert(
                    alert_id=str(uuid.uuid4()),
                    level=SafetyLevel.MODERATE,
                    category="chronic_condition",
                    message=f"Patient has chronic condition: {concept['term']}",
                    clinical_significance="Requires ongoing monitoring",
                    recommended_action="Monitor disease progression and treatment response",
                    evidence_level=EvidenceLevel.LEVEL_I,
                    grade_rating=GRADERating.HIGH,
                    contraindications=[],
                    drug_interactions=[],
                    monitoring_requirements=["Regular follow-up", "Laboratory monitoring"]
                )
                alerts.append(alert)

        return alerts

    async def _assess_evidence_quality(self, clinical_concepts: List[Dict[str, Any]],
                                     query: str) -> Tuple[EvidenceLevel, GRADERating]:
        """Assess evidence level and GRADE rating"""
        # Simulate evidence assessment
        # In production, this would query evidence databases

        has_medication = any(concept.get("category") == "medication" for concept in clinical_concepts)
        has_condition = any(concept.get("category") == "condition" for concept in clinical_concepts)

        if has_medication and has_condition:
            return EvidenceLevel.LEVEL_II, GRADERating.HIGH
        elif has_medication or has_condition:
            return EvidenceLevel.LEVEL_III, GRADERating.MODERATE
        else:
            return EvidenceLevel.LEVEL_IV, GRADERating.LOW

    async def _generate_recommendations(self, clinical_concepts: List[Dict[str, Any]],
                                      safety_alerts: List[SafetyAlert],
                                      clinical_context: Optional[ClinicalContext]) -> List[Dict[str, Any]]:
        """Generate clinical recommendations"""
        recommendations = []

        # High-level recommendations
        if any(alert.level == SafetyLevel.CRITICAL for alert in safety_alerts):
            recommendations.append({
                "priority": "critical",
                "category": "safety",
                "recommendation": "Immediate clinical review required",
                "rationale": "Critical safety alerts detected",
                "evidence_level": "expert_consensus"
            })

        # Condition-specific recommendations
        for concept in clinical_concepts:
            if concept.get("category") == "condition":
                recommendations.append({
                    "priority": "moderate",
                    "category": "clinical_management",
                    "recommendation": f"Follow evidence-based guidelines for {concept['term']}",
                    "rationale": "Standard of care adherence",
                    "evidence_level": "clinical_guidelines"
                })

        return recommendations

    async def _check_contraindications(self, clinical_concepts: List[Dict[str, Any]],
                                     clinical_context: Optional[ClinicalContext]) -> List[str]:
        """Check for contraindications"""
        contraindications = []

        # Check medication contraindications
        medications = [c for c in clinical_concepts if c.get("category") == "medication"]
        conditions = [c for c in clinical_concepts if c.get("category") == "condition"]

        for med in medications:
            for condition in conditions:
                # Simulate contraindication checking
                if med.get("term") == "aspirin" and condition.get("term") == "bleeding_disorder":
                    contraindications.append(f"{med['term']} contraindicated with {condition['term']}")

        return contraindications

    async def _determine_monitoring_requirements(self, clinical_concepts: List[Dict[str, Any]],
                                               medications: List[str],
                                               clinical_context: Optional[ClinicalContext]) -> List[str]:
        """Determine clinical monitoring requirements"""
        monitoring = []

        # Medication monitoring
        for concept in clinical_concepts:
            if concept.get("category") == "medication":
                if concept.get("term") == "warfarin":
                    monitoring.append("INR monitoring every 2-4 weeks")
                elif concept.get("term") == "metformin":
                    monitoring.append("Renal function monitoring every 6 months")

        # Condition monitoring
        for concept in clinical_concepts:
            if concept.get("category") == "condition":
                if concept.get("term") == "diabetes":
                    monitoring.append("HbA1c every 3 months")
                elif concept.get("term") == "hypertension":
                    monitoring.append("Blood pressure monitoring")

        return list(set(monitoring))  # Remove duplicates

    async def _find_clinical_guidelines(self, clinical_concepts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find relevant clinical guidelines"""
        guidelines = []

        for concept in clinical_concepts:
            if concept.get("category") == "condition":
                guideline = {
                    "title": f"Clinical Guidelines for {concept['term'].title()}",
                    "organization": "American Medical Association",
                    "url": f"https://guidelines.example.com/{concept['term']}",
                    "evidence_level": "Level I",
                    "last_updated": "2024-01-01"
                }
                guidelines.append(guideline)

        return guidelines

    def _calculate_confidence_score(self, evidence_level: EvidenceLevel,
                                  grade_rating: GRADERating, alert_count: int) -> float:
        """Calculate overall confidence score"""
        base_score = 0.5

        # Evidence level contribution
        evidence_scores = {
            EvidenceLevel.LEVEL_I: 0.4,
            EvidenceLevel.LEVEL_II: 0.3,
            EvidenceLevel.LEVEL_III: 0.2,
            EvidenceLevel.LEVEL_IV: 0.1,
            EvidenceLevel.UNVALIDATED: 0.0
        }

        # GRADE rating contribution
        grade_scores = {
            GRADERating.HIGH: 0.3,
            GRADERating.MODERATE: 0.2,
            GRADERating.LOW: 0.1,
            GRADERating.VERY_LOW: 0.0
        }

        # Safety alert penalty
        alert_penalty = min(alert_count * 0.1, 0.3)

        confidence = base_score + evidence_scores.get(evidence_level, 0) + \
                    grade_scores.get(grade_rating, 0) - alert_penalty

        return max(0.0, min(1.0, confidence))

    async def _cache_validation_result(self, validation_id: str, result: ValidationResult):
        """Cache validation result"""
        if self.redis_client:
            try:
                await self.redis_client.setex(
                    f"validation:{validation_id}",
                    3600,  # 1 hour TTL
                    json.dumps(asdict(result), default=str)
                )
            except Exception as e:
                logger.error(f"Failed to cache validation result: {e}")

    async def get_cached_validation(self, validation_id: str) -> Optional[ValidationResult]:
        """Get cached validation result"""
        if self.redis_client:
            try:
                cached = await self.redis_client.get(f"validation:{validation_id}")
                if cached:
                    data = json.loads(cached)
                    return ValidationResult(**data)
            except Exception as e:
                logger.error(f"Failed to get cached validation: {e}")

        return None

    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down Clinical Safety Validator")

        if self.redis_client:
            await self.redis_client.close()

        if self.postgres_pool:
            await self.postgres_pool.close()

        logger.info("Clinical Safety Validator shutdown complete")

# Factory function
async def create_clinical_safety_validator(config: Dict[str, Any]) -> ClinicalSafetyValidator:
    """Create and initialize Clinical Safety Validator"""
    validator = ClinicalSafetyValidator(config)
    await validator.initialize()
    return validator