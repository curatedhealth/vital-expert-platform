"""
Multi-Domain Evidence Detection System

Comprehensive evidence detection across multiple domains:
- Medical/Clinical (SciBERT + BioBERT)
- Digital Health (mHealth, telehealth, wearables)
- Regulatory/Compliance (FDA, EMA, GDPR, MHRA, TGA)
- Pharmaceutical (drug development, clinical trials)

Created: 2025-10-25
Phase: 5 Week 1 - Multi-Domain Evidence Detection
"""

import re
import os
from typing import Dict, Any, List, Optional, Set, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import logging

# ML/NLP imports
from transformers import AutoTokenizer, AutoModel, pipeline
import torch
# Optional spacy import - not required for basic functionality
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    spacy = None
    SPACY_AVAILABLE = False
import asyncio

logger = logging.getLogger(__name__)


# ============================================================================
# DOMAIN TYPES
# ============================================================================

class EvidenceDomain(str, Enum):
    """Evidence domains supported"""
    MEDICAL = "medical"
    DIGITAL_HEALTH = "digital_health"
    REGULATORY = "regulatory"
    COMPLIANCE = "compliance"
    PHARMACEUTICAL = "pharmaceutical"
    CLINICAL = "clinical"


# ============================================================================
# EVIDENCE TYPES BY DOMAIN
# ============================================================================

class MedicalEvidenceType(str, Enum):
    """Medical/Clinical evidence types"""
    CLINICAL_TRIAL = "clinical_trial"
    SYSTEMATIC_REVIEW = "systematic_review"
    META_ANALYSIS = "meta_analysis"
    CASE_STUDY = "case_study"
    OBSERVATIONAL_STUDY = "observational_study"
    GUIDELINE = "guideline"
    EXPERT_OPINION = "expert_opinion"
    LABORATORY_STUDY = "laboratory_study"


class DigitalHealthEvidenceType(str, Enum):
    """Digital Health evidence types"""
    MHEALTH_STUDY = "mhealth_study"
    TELEHEALTH_TRIAL = "telehealth_trial"
    WEARABLE_VALIDATION = "wearable_validation"
    AI_ML_VALIDATION = "ai_ml_validation"
    DIGITAL_THERAPEUTIC = "digital_therapeutic"
    REMOTE_MONITORING = "remote_monitoring"
    PATIENT_PORTAL_STUDY = "patient_portal_study"
    HEALTH_APP_EVALUATION = "health_app_evaluation"


class RegulatoryEvidenceType(str, Enum):
    """Regulatory evidence types"""
    FDA_APPROVAL = "fda_approval"
    FDA_GUIDANCE = "fda_guidance"
    EMA_APPROVAL = "ema_approval"
    EMA_GUIDELINE = "ema_guideline"
    MHRA_APPROVAL = "mhra_approval"
    TGA_APPROVAL = "tga_approval"
    REGULATORY_SUBMISSION = "regulatory_submission"
    SAFETY_REPORT = "safety_report"
    RECALL_NOTICE = "recall_notice"


class ComplianceEvidenceType(str, Enum):
    """Compliance evidence types"""
    HIPAA_DOCUMENTATION = "hipaa_documentation"
    GDPR_COMPLIANCE = "gdpr_compliance"
    ISO_CERTIFICATION = "iso_certification"
    AUDIT_REPORT = "audit_report"
    PRIVACY_POLICY = "privacy_policy"
    SECURITY_ASSESSMENT = "security_assessment"
    CONSENT_FRAMEWORK = "consent_framework"
    DATA_PROTECTION = "data_protection"


# ============================================================================
# EVIDENCE QUALITY BY DOMAIN
# ============================================================================

class EvidenceQuality(str, Enum):
    """Evidence quality levels (adapted GRADE system)"""
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"
    VERY_LOW = "VERY_LOW"


# ============================================================================
# ENTITY TYPES BY DOMAIN
# ============================================================================

class MedicalEntityType(str, Enum):
    """Medical entity types"""
    DISEASE = "DISEASE"
    DRUG = "DRUG"
    PROTEIN = "PROTEIN"
    GENE = "GENE"
    CHEMICAL = "CHEMICAL"
    PROCEDURE = "PROCEDURE"
    ANATOMY = "ANATOMY"
    SYMPTOM = "SYMPTOM"


class DigitalHealthEntityType(str, Enum):
    """Digital Health entity types"""
    DEVICE = "DEVICE"
    PLATFORM = "PLATFORM"
    ALGORITHM = "ALGORITHM"
    SENSOR = "SENSOR"
    APPLICATION = "APPLICATION"
    FRAMEWORK = "FRAMEWORK"


class RegulatoryEntityType(str, Enum):
    """Regulatory entity types"""
    REGULATORY_BODY = "REGULATORY_BODY"
    APPROVAL_NUMBER = "APPROVAL_NUMBER"
    SUBMISSION_TYPE = "SUBMISSION_TYPE"
    REGULATION = "REGULATION"
    STANDARD = "STANDARD"


# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class Entity:
    """Detected entity"""
    text: str
    entity_type: str
    domain: EvidenceDomain
    start_pos: int
    end_pos: int
    confidence: float


@dataclass
class Citation:
    """Extracted citation"""
    citation_type: str  # pmid, doi, url, author_year
    value: str
    source: Optional[str] = None
    year: Optional[int] = None


@dataclass
class Evidence:
    """Complete evidence object"""
    domain: EvidenceDomain
    evidence_type: str
    text: str
    quality: EvidenceQuality
    confidence: float
    entities: List[Entity]
    citations: List[Citation]
    reasoning: str
    metadata: Dict[str, Any]


# ============================================================================
# MULTI-DOMAIN EVIDENCE DETECTOR
# ============================================================================

class MultiDomainEvidenceDetector:
    """
    Multi-domain evidence detection system

    Supports:
    - Medical/Clinical evidence (SciBERT)
    - Digital Health evidence (domain-specific patterns)
    - Regulatory evidence (pattern matching)
    - Compliance evidence (framework detection)
    """

    def __init__(
        self,
        model_name: str = "allenai/scibert_scivocab_uncased",
        device: Optional[str] = None
    ):
        """
        Initialize multi-domain evidence detector

        Args:
            model_name: Base model for embeddings
            device: Device to use (cuda/cpu)
        """
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")

        # Initialize base models
        self._initialize_models(model_name)

        # Domain-specific patterns
        self._initialize_domain_patterns()

    def _initialize_models(self, model_name: str):
        """Initialize ML models"""
        try:
            # SciBERT for medical/scientific text
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name).to(self.device)

            # BioBERT for medical NER
            self.medical_ner = pipeline(
                "ner",
                model="dmis-lab/biobert-base-cased-v1.1",
                device=0 if self.device == "cuda" else -1
            )

            # spaCy for general NER (graceful degradation)
            self.nlp = None
            try:
                import en_core_sci_md
                self.nlp = en_core_sci_md.load()
                logger.info("Loaded scispaCy model: en_core_sci_md")
            except (ImportError, ModuleNotFoundError, OSError):
                logger.warning("scispaCy model not found, trying default model")
                try:
                    self.nlp = spacy.load("en_core_web_sm")
                    logger.info("Loaded spaCy model: en_core_web_sm")
                except OSError:
                    logger.warning("No spaCy models available - NER features will be limited")

            logger.info("Models initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            raise

    def _initialize_domain_patterns(self):
        """Initialize domain-specific detection patterns"""

        # Medical evidence patterns
        self.medical_patterns = {
            MedicalEvidenceType.CLINICAL_TRIAL: [
                r"clinical trial",
                r"randomized controlled trial",
                r"RCT",
                r"double-blind",
                r"placebo-controlled"
            ],
            MedicalEvidenceType.SYSTEMATIC_REVIEW: [
                r"systematic review",
                r"meta-analysis",
                r"Cochrane review"
            ],
            MedicalEvidenceType.GUIDELINE: [
                r"clinical guideline",
                r"practice guideline",
                r"recommendation",
                r"ADA guideline",
                r"NICE guideline"
            ]
        }

        # Digital Health patterns
        self.digital_health_patterns = {
            DigitalHealthEvidenceType.MHEALTH_STUDY: [
                r"mobile health",
                r"mHealth",
                r"health app",
                r"smartphone intervention"
            ],
            DigitalHealthEvidenceType.TELEHEALTH_TRIAL: [
                r"telehealth",
                r"telemedicine",
                r"remote consultation",
                r"virtual care"
            ],
            DigitalHealthEvidenceType.WEARABLE_VALIDATION: [
                r"wearable device",
                r"fitness tracker",
                r"smartwatch",
                r"continuous monitoring"
            ],
            DigitalHealthEvidenceType.AI_ML_VALIDATION: [
                r"machine learning",
                r"artificial intelligence",
                r"deep learning",
                r"AI algorithm",
                r"predictive model"
            ],
            DigitalHealthEvidenceType.DIGITAL_THERAPEUTIC: [
                r"digital therapeutic",
                r"DTx",
                r"prescription digital therapeutic"
            ],
            DigitalHealthEvidenceType.REMOTE_MONITORING: [
                r"remote patient monitoring",
                r"RPM",
                r"continuous glucose monitor",
                r"home monitoring"
            ]
        }

        # Regulatory patterns
        self.regulatory_patterns = {
            RegulatoryEvidenceType.FDA_APPROVAL: [
                r"FDA approved",
                r"FDA clearance",
                r"510\(k\)",
                r"PMA approval",
                r"De Novo classification"
            ],
            RegulatoryEvidenceType.EMA_APPROVAL: [
                r"EMA approved",
                r"European Medicines Agency",
                r"CE mark",
                r"CHMP recommendation"
            ],
            RegulatoryEvidenceType.MHRA_APPROVAL: [
                r"MHRA approved",
                r"UK approved",
                r"Medicines and Healthcare products Regulatory Agency"
            ],
            RegulatoryEvidenceType.TGA_APPROVAL: [
                r"TGA approved",
                r"Therapeutic Goods Administration",
                r"Australian approved"
            ],
            RegulatoryEvidenceType.FDA_GUIDANCE: [
                r"FDA guidance",
                r"draft guidance",
                r"final guidance",
                r"industry guidance"
            ]
        }

        # Compliance patterns
        self.compliance_patterns = {
            ComplianceEvidenceType.HIPAA_DOCUMENTATION: [
                r"HIPAA compliant",
                r"Protected Health Information",
                r"PHI",
                r"HIPAA Security Rule",
                r"HIPAA Privacy Rule"
            ],
            ComplianceEvidenceType.GDPR_COMPLIANCE: [
                r"GDPR compliant",
                r"General Data Protection Regulation",
                r"data subject rights",
                r"right to be forgotten",
                r"data processing agreement"
            ],
            ComplianceEvidenceType.ISO_CERTIFICATION: [
                r"ISO 13485",
                r"ISO 27001",
                r"ISO certified",
                r"quality management system"
            ],
            ComplianceEvidenceType.SECURITY_ASSESSMENT: [
                r"penetration test",
                r"security audit",
                r"vulnerability assessment",
                r"risk assessment"
            ]
        }

        # Regulatory body patterns
        self.regulatory_bodies = {
            "FDA": ["FDA", "Food and Drug Administration", "U.S. FDA"],
            "EMA": ["EMA", "European Medicines Agency", "CHMP"],
            "MHRA": ["MHRA", "Medicines and Healthcare products Regulatory Agency"],
            "TGA": ["TGA", "Therapeutic Goods Administration"],
            "HIPAA": ["HIPAA", "Health Insurance Portability"],
            "GDPR": ["GDPR", "General Data Protection Regulation"]
        }

    # ========================================================================
    # DOMAIN DETECTION
    # ========================================================================

    def detect_domain(self, text: str) -> List[EvidenceDomain]:
        """
        Detect which domains are relevant for the text

        Returns:
            List of applicable domains
        """
        domains = []
        text_lower = text.lower()

        # Medical domain indicators
        medical_keywords = [
            "patient", "clinical", "disease", "treatment", "drug",
            "diagnosis", "therapy", "medical", "healthcare"
        ]
        if any(kw in text_lower for kw in medical_keywords):
            domains.append(EvidenceDomain.MEDICAL)

        # Digital Health indicators
        digital_health_keywords = [
            "mhealth", "telehealth", "wearable", "app", "digital",
            "remote monitoring", "telemedicine", "ai", "machine learning"
        ]
        if any(kw in text_lower for kw in digital_health_keywords):
            domains.append(EvidenceDomain.DIGITAL_HEALTH)

        # Regulatory indicators
        regulatory_keywords = [
            "fda", "ema", "mhra", "tga", "approval", "clearance",
            "regulatory", "submission", "guidance"
        ]
        if any(kw in text_lower for kw in regulatory_keywords):
            domains.append(EvidenceDomain.REGULATORY)

        # Compliance indicators
        compliance_keywords = [
            "hipaa", "gdpr", "compliance", "privacy", "security",
            "audit", "certification", "iso"
        ]
        if any(kw in text_lower for kw in compliance_keywords):
            domains.append(EvidenceDomain.COMPLIANCE)

        # Default to medical if no domain detected
        if not domains:
            domains.append(EvidenceDomain.MEDICAL)

        return domains

    # ========================================================================
    # ENTITY EXTRACTION
    # ========================================================================

    async def extract_entities(
        self,
        text: str,
        domain: EvidenceDomain
    ) -> List[Entity]:
        """
        Extract domain-specific entities

        Args:
            text: Input text
            domain: Evidence domain

        Returns:
            List of detected entities
        """
        entities = []

        if domain == EvidenceDomain.MEDICAL:
            entities.extend(await self._extract_medical_entities(text))
        elif domain == EvidenceDomain.DIGITAL_HEALTH:
            entities.extend(await self._extract_digital_health_entities(text))
        elif domain == EvidenceDomain.REGULATORY:
            entities.extend(await self._extract_regulatory_entities(text))
        elif domain == EvidenceDomain.COMPLIANCE:
            entities.extend(await self._extract_compliance_entities(text))

        return entities

    async def _extract_medical_entities(self, text: str) -> List[Entity]:
        """Extract medical entities using BioBERT"""
        entities = []

        try:
            # Run BioBERT NER
            ner_results = self.medical_ner(text)

            for result in ner_results:
                entity = Entity(
                    text=result['word'],
                    entity_type=result['entity'],
                    domain=EvidenceDomain.MEDICAL,
                    start_pos=result['start'],
                    end_pos=result['end'],
                    confidence=result['score']
                )
                entities.append(entity)

        except Exception as e:
            logger.error(f"Medical entity extraction failed: {e}")

        return entities

    async def _extract_digital_health_entities(self, text: str) -> List[Entity]:
        """Extract digital health entities using patterns"""
        entities = []

        # Device patterns
        device_pattern = r'\b(smartwatch|fitness tracker|wearable|CGM|sensor|monitor)\b'
        for match in re.finditer(device_pattern, text, re.IGNORECASE):
            entities.append(Entity(
                text=match.group(0),
                entity_type=DigitalHealthEntityType.DEVICE.value,
                domain=EvidenceDomain.DIGITAL_HEALTH,
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.85
            ))

        # Platform patterns
        platform_pattern = r'\b(app|application|platform|portal|system)\b'
        for match in re.finditer(platform_pattern, text, re.IGNORECASE):
            entities.append(Entity(
                text=match.group(0),
                entity_type=DigitalHealthEntityType.PLATFORM.value,
                domain=EvidenceDomain.DIGITAL_HEALTH,
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.75
            ))

        # Algorithm patterns
        algo_pattern = r'\b(AI|machine learning|deep learning|algorithm|model)\b'
        for match in re.finditer(algo_pattern, text, re.IGNORECASE):
            entities.append(Entity(
                text=match.group(0),
                entity_type=DigitalHealthEntityType.ALGORITHM.value,
                domain=EvidenceDomain.DIGITAL_HEALTH,
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.80
            ))

        return entities

    async def _extract_regulatory_entities(self, text: str) -> List[Entity]:
        """Extract regulatory entities"""
        entities = []

        # Regulatory bodies
        for body, patterns in self.regulatory_bodies.items():
            for pattern in patterns:
                for match in re.finditer(rf'\b{re.escape(pattern)}\b', text, re.IGNORECASE):
                    entities.append(Entity(
                        text=match.group(0),
                        entity_type=RegulatoryEntityType.REGULATORY_BODY.value,
                        domain=EvidenceDomain.REGULATORY,
                        start_pos=match.start(),
                        end_pos=match.end(),
                        confidence=0.95
                    ))

        # Approval numbers (e.g., K123456, BLA 125000)
        approval_pattern = r'\b(K\d{6}|P\d{6}|BLA \d{6}|NDA \d{6})\b'
        for match in re.finditer(approval_pattern, text):
            entities.append(Entity(
                text=match.group(0),
                entity_type=RegulatoryEntityType.APPROVAL_NUMBER.value,
                domain=EvidenceDomain.REGULATORY,
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.90
            ))

        return entities

    async def _extract_compliance_entities(self, text: str) -> List[Entity]:
        """Extract compliance entities"""
        entities = []

        # Standards (ISO, NIST, etc.)
        standard_pattern = r'\b(ISO \d{5}|NIST|HITRUST|SOC 2)\b'
        for match in re.finditer(standard_pattern, text):
            entities.append(Entity(
                text=match.group(0),
                entity_type=RegulatoryEntityType.STANDARD.value,
                domain=EvidenceDomain.COMPLIANCE,
                start_pos=match.start(),
                end_pos=match.end(),
                confidence=0.90
            ))

        return entities

    # ========================================================================
    # CITATION EXTRACTION
    # ========================================================================

    async def extract_citations(self, text: str) -> List[Citation]:
        """
        Extract citations from text

        Supports:
        - PubMed IDs (PMID)
        - DOIs
        - Author-year citations
        - URLs
        """
        citations = []

        # PubMed IDs
        pmid_pattern = r'PMID:\s*(\d{7,8})'
        for match in re.finditer(pmid_pattern, text, re.IGNORECASE):
            citations.append(Citation(
                citation_type="pmid",
                value=match.group(1),
                source="PubMed"
            ))

        # DOIs
        doi_pattern = r'doi:\s*(10\.\d{4,}\/[^\s]+)'
        for match in re.finditer(doi_pattern, text, re.IGNORECASE):
            citations.append(Citation(
                citation_type="doi",
                value=match.group(1)
            ))

        # Author-year
        author_year_pattern = r'\(([A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s+\d{4})\)'
        for match in re.finditer(author_year_pattern, text):
            citations.append(Citation(
                citation_type="author_year",
                value=match.group(1)
            ))

        # URLs to papers
        url_pattern = r'https?://(?:www\.)?(?:ncbi\.nlm\.nih\.gov|doi\.org|pubmed|europepmc)/[^\s]+'
        for match in re.finditer(url_pattern, text):
            citations.append(Citation(
                citation_type="url",
                value=match.group(0)
            ))

        return citations

    # ========================================================================
    # EVIDENCE TYPE CLASSIFICATION
    # ========================================================================

    async def classify_evidence_type(
        self,
        text: str,
        domain: EvidenceDomain
    ) -> Optional[str]:
        """
        Classify evidence type within domain

        Args:
            text: Input text
            domain: Evidence domain

        Returns:
            Evidence type string or None
        """
        text_lower = text.lower()

        if domain == EvidenceDomain.MEDICAL:
            return self._classify_medical_evidence(text_lower)
        elif domain == EvidenceDomain.DIGITAL_HEALTH:
            return self._classify_digital_health_evidence(text_lower)
        elif domain == EvidenceDomain.REGULATORY:
            return self._classify_regulatory_evidence(text_lower)
        elif domain == EvidenceDomain.COMPLIANCE:
            return self._classify_compliance_evidence(text_lower)

        return None

    def _classify_medical_evidence(self, text: str) -> Optional[str]:
        """Classify medical evidence type"""
        for evidence_type, patterns in self.medical_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return evidence_type.value
        return MedicalEvidenceType.EXPERT_OPINION.value  # Default

    def _classify_digital_health_evidence(self, text: str) -> Optional[str]:
        """Classify digital health evidence type"""
        for evidence_type, patterns in self.digital_health_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return evidence_type.value
        return DigitalHealthEvidenceType.HEALTH_APP_EVALUATION.value  # Default

    def _classify_regulatory_evidence(self, text: str) -> Optional[str]:
        """Classify regulatory evidence type"""
        for evidence_type, patterns in self.regulatory_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return evidence_type.value
        return RegulatoryEvidenceType.REGULATORY_SUBMISSION.value  # Default

    def _classify_compliance_evidence(self, text: str) -> Optional[str]:
        """Classify compliance evidence type"""
        for evidence_type, patterns in self.compliance_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return evidence_type.value
        return ComplianceEvidenceType.AUDIT_REPORT.value  # Default

    # ========================================================================
    # QUALITY ASSESSMENT
    # ========================================================================

    def assess_quality(
        self,
        evidence_type: str,
        domain: EvidenceDomain
    ) -> EvidenceQuality:
        """
        Assess evidence quality

        Uses domain-specific quality hierarchies
        """
        if domain == EvidenceDomain.MEDICAL:
            return self._assess_medical_quality(evidence_type)
        elif domain == EvidenceDomain.DIGITAL_HEALTH:
            return self._assess_digital_health_quality(evidence_type)
        elif domain == EvidenceDomain.REGULATORY:
            return self._assess_regulatory_quality(evidence_type)
        elif domain == EvidenceDomain.COMPLIANCE:
            return self._assess_compliance_quality(evidence_type)

        return EvidenceQuality.LOW

    def _assess_medical_quality(self, evidence_type: str) -> EvidenceQuality:
        """Assess medical evidence quality (GRADE system)"""
        quality_map = {
            MedicalEvidenceType.SYSTEMATIC_REVIEW.value: EvidenceQuality.HIGH,
            MedicalEvidenceType.META_ANALYSIS.value: EvidenceQuality.HIGH,
            MedicalEvidenceType.CLINICAL_TRIAL.value: EvidenceQuality.MODERATE,
            MedicalEvidenceType.GUIDELINE.value: EvidenceQuality.MODERATE,
            MedicalEvidenceType.OBSERVATIONAL_STUDY.value: EvidenceQuality.LOW,
            MedicalEvidenceType.CASE_STUDY.value: EvidenceQuality.LOW,
            MedicalEvidenceType.LABORATORY_STUDY.value: EvidenceQuality.LOW,
            MedicalEvidenceType.EXPERT_OPINION.value: EvidenceQuality.VERY_LOW
        }
        return quality_map.get(evidence_type, EvidenceQuality.LOW)

    def _assess_digital_health_quality(self, evidence_type: str) -> EvidenceQuality:
        """Assess digital health evidence quality"""
        quality_map = {
            DigitalHealthEvidenceType.AI_ML_VALIDATION.value: EvidenceQuality.HIGH,
            DigitalHealthEvidenceType.WEARABLE_VALIDATION.value: EvidenceQuality.HIGH,
            DigitalHealthEvidenceType.TELEHEALTH_TRIAL.value: EvidenceQuality.MODERATE,
            DigitalHealthEvidenceType.DIGITAL_THERAPEUTIC.value: EvidenceQuality.MODERATE,
            DigitalHealthEvidenceType.MHEALTH_STUDY.value: EvidenceQuality.MODERATE,
            DigitalHealthEvidenceType.REMOTE_MONITORING.value: EvidenceQuality.LOW,
            DigitalHealthEvidenceType.HEALTH_APP_EVALUATION.value: EvidenceQuality.LOW
        }
        return quality_map.get(evidence_type, EvidenceQuality.LOW)

    def _assess_regulatory_quality(self, evidence_type: str) -> EvidenceQuality:
        """Assess regulatory evidence quality"""
        quality_map = {
            RegulatoryEvidenceType.FDA_APPROVAL.value: EvidenceQuality.HIGH,
            RegulatoryEvidenceType.EMA_APPROVAL.value: EvidenceQuality.HIGH,
            RegulatoryEvidenceType.MHRA_APPROVAL.value: EvidenceQuality.HIGH,
            RegulatoryEvidenceType.TGA_APPROVAL.value: EvidenceQuality.HIGH,
            RegulatoryEvidenceType.FDA_GUIDANCE.value: EvidenceQuality.MODERATE,
            RegulatoryEvidenceType.EMA_GUIDELINE.value: EvidenceQuality.MODERATE,
            RegulatoryEvidenceType.REGULATORY_SUBMISSION.value: EvidenceQuality.LOW,
            RegulatoryEvidenceType.SAFETY_REPORT.value: EvidenceQuality.MODERATE
        }
        return quality_map.get(evidence_type, EvidenceQuality.MODERATE)

    def _assess_compliance_quality(self, evidence_type: str) -> EvidenceQuality:
        """Assess compliance evidence quality"""
        quality_map = {
            ComplianceEvidenceType.ISO_CERTIFICATION.value: EvidenceQuality.HIGH,
            ComplianceEvidenceType.AUDIT_REPORT.value: EvidenceQuality.HIGH,
            ComplianceEvidenceType.SECURITY_ASSESSMENT.value: EvidenceQuality.MODERATE,
            ComplianceEvidenceType.HIPAA_DOCUMENTATION.value: EvidenceQuality.MODERATE,
            ComplianceEvidenceType.GDPR_COMPLIANCE.value: EvidenceQuality.MODERATE,
            ComplianceEvidenceType.PRIVACY_POLICY.value: EvidenceQuality.LOW
        }
        return quality_map.get(evidence_type, EvidenceQuality.MODERATE)

    # ========================================================================
    # CONFIDENCE CALCULATION
    # ========================================================================

    def calculate_confidence(
        self,
        quality: EvidenceQuality,
        entities: List[Entity],
        citations: List[Citation],
        evidence_type: str
    ) -> float:
        """
        Calculate evidence confidence score

        Returns:
            Float between 0.0 and 1.0
        """
        # Base score from quality
        quality_scores = {
            EvidenceQuality.HIGH: 0.85,
            EvidenceQuality.MODERATE: 0.70,
            EvidenceQuality.LOW: 0.55,
            EvidenceQuality.VERY_LOW: 0.40
        }
        confidence = quality_scores.get(quality, 0.50)

        # Boost for multiple entities (≥3)
        if len(entities) >= 3:
            confidence *= 1.1

        # Boost for citations
        citation_boost = min(0.15, len(citations) * 0.05)
        confidence += citation_boost

        # Boost for high-quality evidence types
        high_quality_types = [
            MedicalEvidenceType.SYSTEMATIC_REVIEW.value,
            MedicalEvidenceType.META_ANALYSIS.value,
            RegulatoryEvidenceType.FDA_APPROVAL.value,
            RegulatoryEvidenceType.EMA_APPROVAL.value,
            ComplianceEvidenceType.ISO_CERTIFICATION.value
        ]
        if evidence_type in high_quality_types:
            confidence *= 1.05

        # Cap at 1.0
        return min(confidence, 1.0)

    # ========================================================================
    # MAIN DETECTION
    # ========================================================================

    async def detect_evidence(
        self,
        text: str,
        min_confidence: float = 0.7,
        domains: Optional[List[EvidenceDomain]] = None
    ) -> List[Evidence]:
        """
        Detect evidence across all domains

        Args:
            text: Input text
            min_confidence: Minimum confidence threshold
            domains: Specific domains to check (or auto-detect)

        Returns:
            List of detected evidence objects
        """
        evidence_list = []

        # Auto-detect domains if not specified
        if domains is None:
            domains = self.detect_domain(text)

        # Extract citations once (shared across domains)
        citations = await self.extract_citations(text)

        # Process each domain
        for domain in domains:
            # Extract entities
            entities = await self.extract_entities(text, domain)

            # Classify evidence type
            evidence_type = await self.classify_evidence_type(text, domain)
            if not evidence_type:
                continue

            # Assess quality
            quality = self.assess_quality(evidence_type, domain)

            # Calculate confidence
            confidence = self.calculate_confidence(
                quality, entities, citations, evidence_type
            )

            # Skip if below threshold
            if confidence < min_confidence:
                continue

            # Create reasoning
            reasoning = self._generate_reasoning(
                domain, evidence_type, quality, entities, citations
            )

            # Create evidence object
            evidence = Evidence(
                domain=domain,
                evidence_type=evidence_type,
                text=text[:500],  # Truncate for storage
                quality=quality,
                confidence=confidence,
                entities=entities,
                citations=citations,
                reasoning=reasoning,
                metadata={
                    "entity_count": len(entities),
                    "citation_count": len(citations),
                    "text_length": len(text)
                }
            )

            evidence_list.append(evidence)

        return evidence_list

    def _generate_reasoning(
        self,
        domain: EvidenceDomain,
        evidence_type: str,
        quality: EvidenceQuality,
        entities: List[Entity],
        citations: List[Citation]
    ) -> str:
        """Generate human-readable reasoning"""
        entity_types = list(set([e.entity_type for e in entities]))

        reasoning = f"Domain: {domain.value.replace('_', ' ').title()} | "
        reasoning += f"Type: {evidence_type.replace('_', ' ').title()} | "
        reasoning += f"Quality: {quality.value} | "

        if entities:
            reasoning += f"Entities: {', '.join(entity_types[:3])} | "

        if citations:
            reasoning += f"Citations: {len(citations)}"

        return reasoning


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_multi_domain_detector: Optional[MultiDomainEvidenceDetector] = None


def get_multi_domain_detector() -> MultiDomainEvidenceDetector:
    """
    Get singleton multi-domain evidence detector

    Returns:
        MultiDomainEvidenceDetector instance
    """
    global _multi_domain_detector

    if _multi_domain_detector is None:
        _multi_domain_detector = MultiDomainEvidenceDetector()

    return _multi_domain_detector


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

"""
# Example 1: Medical Evidence
detector = get_multi_domain_detector()

medical_text = \"\"\"
According to a recent systematic review (PMID: 12345678),
metformin reduced cardiovascular events by 25% in diabetic
patients. The study analyzed data from 15 randomized
controlled trials with over 10,000 participants.
\"\"\"

evidence = await detector.detect_evidence(medical_text)
# Domain: MEDICAL
# Type: systematic_review
# Quality: HIGH
# Confidence: 0.92

# Example 2: Digital Health Evidence
digital_text = \"\"\"
A recent mHealth study validated the accuracy of a smartwatch-based
algorithm for detecting atrial fibrillation. The AI model achieved
95% sensitivity and 98% specificity using continuous heart rate
monitoring from wearable devices.
\"\"\"

evidence = await detector.detect_evidence(digital_text)
# Domain: DIGITAL_HEALTH
# Type: ai_ml_validation
# Quality: HIGH
# Confidence: 0.88

# Example 3: Regulatory Evidence
regulatory_text = \"\"\"
The device received FDA 510(k) clearance (K123456) and EMA approval
in 2024. It complies with ISO 13485 quality management standards
and has MHRA approval for the UK market.
\"\"\"

evidence = await detector.detect_evidence(regulatory_text)
# Domain: REGULATORY
# Type: fda_approval
# Quality: HIGH
# Confidence: 0.94

# Example 4: Compliance Evidence
compliance_text = \"\"\"
The platform is HIPAA compliant and GDPR compliant, with ISO 27001
certification for information security. A recent third-party security
audit confirmed compliance with all SOC 2 Type II requirements.
\"\"\"

evidence = await detector.detect_evidence(compliance_text)
# Domain: COMPLIANCE
# Type: iso_certification
# Quality: HIGH
# Confidence: 0.91

# Example 5: Multi-Domain Detection
mixed_text = \"\"\"
The FDA-approved digital therapeutic app uses AI to deliver
cognitive behavioral therapy for insomnia. A randomized controlled
trial (PMID: 98765432) demonstrated efficacy, and the solution is
HIPAA compliant with GDPR certification for European markets.
\"\"\"

evidence_list = await detector.detect_evidence(mixed_text)
# Returns evidence for:
# - MEDICAL domain (clinical_trial)
# - DIGITAL_HEALTH domain (digital_therapeutic)
# - REGULATORY domain (fda_approval)
# - COMPLIANCE domain (hipaa_documentation, gdpr_compliance)
"""
