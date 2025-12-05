"""
Unified Multi-Domain Evidence Detection Service

Comprehensive evidence detection across multiple domains:
- Medical/Clinical (SciBERT + BioBERT)
- Digital Health (mHealth, telehealth, wearables)
- Regulatory/Compliance (FDA, EMA, GDPR, MHRA, TGA)
- Pharmaceutical (drug development, clinical trials)

This module consolidates evidence_detector.py and multi_domain_evidence_detector.py
into a single, unified implementation.

Created: 2025-10-25
Updated: 2025-12-02 - Consolidated with multi-domain capabilities
"""

import re
import asyncio
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass
from enum import Enum
import logging

# Use centralized optional imports to prevent recurring issues
from utils.optional_imports import (
    SPACY_AVAILABLE,
    spacy,
    load_spacy_model,
    TORCH_AVAILABLE,
    torch,
    get_device,
    TRANSFORMERS_AVAILABLE,
)

# ML/NLP imports (with graceful degradation)
if TRANSFORMERS_AVAILABLE:
    from transformers import (
        AutoTokenizer,
        AutoModelForTokenClassification,
        AutoModelForSequenceClassification,
        AutoModel,
        pipeline
    )
else:
    AutoTokenizer = None
    AutoModelForTokenClassification = None
    AutoModelForSequenceClassification = None
    AutoModel = None
    pipeline = None

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
# EVIDENCE TYPES
# ============================================================================

class EvidenceType(Enum):
    """Types of medical evidence (legacy compatibility)"""
    CLINICAL_TRIAL = "clinical_trial"
    SYSTEMATIC_REVIEW = "systematic_review"
    META_ANALYSIS = "meta_analysis"
    CASE_STUDY = "case_study"
    OBSERVATIONAL_STUDY = "observational_study"
    GUIDELINE = "guideline"
    EXPERT_OPINION = "expert_opinion"
    LABORATORY_STUDY = "laboratory_study"


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
# EVIDENCE QUALITY
# ============================================================================

class EvidenceQuality(Enum):
    """Evidence quality levels (GRADE system)"""
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"
    VERY_LOW = "VERY_LOW"


# ============================================================================
# ENTITY TYPES
# ============================================================================

class EntityType(Enum):
    """Types of medical entities (legacy compatibility)"""
    DISEASE = "disease"
    DRUG = "drug"
    PROTEIN = "protein"
    GENE = "gene"
    CHEMICAL = "chemical"
    PROCEDURE = "procedure"
    ANATOMY = "anatomy"
    SYMPTOM = "symptom"


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
class MedicalEntity:
    """Extracted medical entity (legacy compatibility)"""
    text: str
    entity_type: EntityType
    start: int
    end: int
    confidence: float
    context: Optional[str] = None


@dataclass
class Entity:
    """Detected entity (multi-domain)"""
    text: str
    entity_type: str
    domain: EvidenceDomain
    start_pos: int
    end_pos: int
    confidence: float


@dataclass
class Citation:
    """Medical citation"""
    text: str
    pmid: Optional[str] = None
    doi: Optional[str] = None
    authors: Optional[List[str]] = None
    title: Optional[str] = None
    journal: Optional[str] = None
    year: Optional[int] = None
    url: Optional[str] = None
    confidence: float = 0.0
    citation_type: Optional[str] = None  # pmid, doi, url, author_year
    source: Optional[str] = None


@dataclass
class Evidence:
    """Detected evidence (unified structure)"""
    text: str
    evidence_type: str
    quality: EvidenceQuality
    confidence: float
    entities: List[Any]  # MedicalEntity or Entity
    citations: List[Citation]
    start: int = 0
    end: int = 0
    context: Optional[str] = None
    reasoning: Optional[str] = None
    domain: Optional[EvidenceDomain] = None
    metadata: Optional[Dict[str, Any]] = None


# ============================================================================
# UNIFIED EVIDENCE DETECTOR
# ============================================================================

class EvidenceDetector:
    """
    Unified Multi-Domain Evidence Detector

    Detects and extracts evidence from text across multiple domains:
    - Medical/Clinical (SciBERT + BioBERT)
    - Digital Health (mHealth, telehealth, wearables)
    - Regulatory (FDA, EMA, MHRA, TGA)
    - Compliance (HIPAA, GDPR, ISO)

    Features:
    - Entity recognition (domain-specific)
    - Evidence type classification
    - Citation extraction and validation
    - Quality assessment (GRADE system)
    - Confidence scoring
    """

    def __init__(
        self,
        scibert_model: str = "allenai/scibert_scivocab_uncased",
        biobert_ner_model: str = "dmis-lab/biobert-base-cased-v1.1",
        device: Optional[str] = None
    ):
        """
        Initialize evidence detector

        Args:
            scibert_model: SciBERT model name
            biobert_ner_model: BioBERT NER model name
            device: Device to run models on (cuda/cpu)
        """
        self.device = device or get_device()
        logger.info(f"Initializing EvidenceDetector on device: {self.device}")

        # Initialize ML models (with graceful degradation)
        self._load_models(scibert_model, biobert_ner_model)

        # Load spaCy using centralized utility
        self.nlp = load_spacy_model("en_core_sci_md")

        # Initialize patterns
        self._citation_patterns = self._compile_citation_patterns()
        self._evidence_keywords = self._load_evidence_keywords()
        self._initialize_domain_patterns()

    def _load_models(self, scibert_model: str, biobert_ner_model: str):
        """Load SciBERT and BioBERT models with graceful degradation"""
        self.tokenizer = None
        self.model = None
        self.evidence_classifier = None
        self.ner_pipeline = None
        self.medical_ner = None

        if not TRANSFORMERS_AVAILABLE:
            logger.warning("Transformers not available - ML features disabled")
            return

        if not TORCH_AVAILABLE:
            logger.warning("PyTorch not available - ML features disabled")
            return

        try:
            logger.info("Loading SciBERT tokenizer and model...")

            # SciBERT for embeddings and sequence classification
            self.tokenizer = AutoTokenizer.from_pretrained(scibert_model)
            self.model = AutoModel.from_pretrained(scibert_model)

            if self.device == "cuda":
                self.model = self.model.to(self.device)

            # BioBERT for NER
            logger.info("Loading BioBERT NER pipeline...")
            device_id = 0 if self.device == "cuda" else -1
            self.ner_pipeline = pipeline(
                "ner",
                model=biobert_ner_model,
                tokenizer=biobert_ner_model,
                device=device_id,
                aggregation_strategy="simple"
            )
            self.medical_ner = self.ner_pipeline  # Alias for compatibility

            logger.info("Models loaded successfully")

        except Exception as e:
            logger.error(f"Failed to load ML models: {e}")
            logger.warning("Continuing with pattern-based detection only")

    def _compile_citation_patterns(self) -> Dict[str, re.Pattern]:
        """Compile regex patterns for citation extraction"""
        return {
            "pmid": re.compile(r'PMID:?\s*(\d{7,8})', re.IGNORECASE),
            "doi": re.compile(r'doi:?\s*(10\.\d{4,}/[^\s]+)', re.IGNORECASE),
            "author_year": re.compile(r'([A-Z][a-z]+(?:\s+et\s+al\.)?),?\s+\((\d{4})\)'),
            "journal": re.compile(
                r'([A-Z][a-zA-Z\s&]+)\.\s+(\d{4});(\d+)(?:\((\d+)\))?:(\d+(?:-\d+)?)',
                re.IGNORECASE
            ),
            "url": re.compile(
                r'https?://(?:www\.)?(?:ncbi\.nlm\.nih\.gov/pubmed/|doi\.org/|pubmed\.ncbi\.nlm\.nih\.gov/)([^\s]+)'
            )
        }

    def _load_evidence_keywords(self) -> Dict[EvidenceType, List[str]]:
        """Load keywords for evidence type detection"""
        return {
            EvidenceType.CLINICAL_TRIAL: [
                "randomized controlled trial", "rct", "clinical trial",
                "double-blind", "placebo-controlled", "trial participants"
            ],
            EvidenceType.SYSTEMATIC_REVIEW: [
                "systematic review", "meta-analysis", "cochrane review",
                "literature review", "evidence synthesis"
            ],
            EvidenceType.META_ANALYSIS: [
                "meta-analysis", "pooled analysis", "quantitative synthesis",
                "forest plot", "effect size"
            ],
            EvidenceType.CASE_STUDY: [
                "case study", "case report", "case series",
                "patient case", "clinical case"
            ],
            EvidenceType.OBSERVATIONAL_STUDY: [
                "cohort study", "case-control study", "cross-sectional",
                "observational study", "epidemiological"
            ],
            EvidenceType.GUIDELINE: [
                "clinical practice guideline", "recommendation", "consensus statement",
                "practice parameter", "best practice"
            ],
            EvidenceType.EXPERT_OPINION: [
                "expert opinion", "expert consensus", "clinical experience",
                "professional opinion"
            ],
            EvidenceType.LABORATORY_STUDY: [
                "in vitro", "in vivo", "laboratory study",
                "preclinical", "animal model"
            ]
        }

    def _initialize_domain_patterns(self):
        """Initialize domain-specific detection patterns"""

        # Medical evidence patterns
        self.medical_patterns = {
            MedicalEvidenceType.CLINICAL_TRIAL: [
                r"clinical trial", r"randomized controlled trial", r"RCT",
                r"double-blind", r"placebo-controlled"
            ],
            MedicalEvidenceType.SYSTEMATIC_REVIEW: [
                r"systematic review", r"meta-analysis", r"Cochrane review"
            ],
            MedicalEvidenceType.GUIDELINE: [
                r"clinical guideline", r"practice guideline", r"recommendation",
                r"ADA guideline", r"NICE guideline"
            ]
        }

        # Digital Health patterns
        self.digital_health_patterns = {
            DigitalHealthEvidenceType.MHEALTH_STUDY: [
                r"mobile health", r"mHealth", r"health app", r"smartphone intervention"
            ],
            DigitalHealthEvidenceType.TELEHEALTH_TRIAL: [
                r"telehealth", r"telemedicine", r"remote consultation", r"virtual care"
            ],
            DigitalHealthEvidenceType.WEARABLE_VALIDATION: [
                r"wearable device", r"fitness tracker", r"smartwatch", r"continuous monitoring"
            ],
            DigitalHealthEvidenceType.AI_ML_VALIDATION: [
                r"machine learning", r"artificial intelligence", r"deep learning",
                r"AI algorithm", r"predictive model"
            ],
            DigitalHealthEvidenceType.DIGITAL_THERAPEUTIC: [
                r"digital therapeutic", r"DTx", r"prescription digital therapeutic"
            ],
            DigitalHealthEvidenceType.REMOTE_MONITORING: [
                r"remote patient monitoring", r"RPM", r"continuous glucose monitor",
                r"home monitoring"
            ]
        }

        # Regulatory patterns
        self.regulatory_patterns = {
            RegulatoryEvidenceType.FDA_APPROVAL: [
                r"FDA approved", r"FDA clearance", r"510\(k\)",
                r"PMA approval", r"De Novo classification"
            ],
            RegulatoryEvidenceType.EMA_APPROVAL: [
                r"EMA approved", r"European Medicines Agency", r"CE mark",
                r"CHMP recommendation"
            ],
            RegulatoryEvidenceType.MHRA_APPROVAL: [
                r"MHRA approved", r"UK approved",
                r"Medicines and Healthcare products Regulatory Agency"
            ],
            RegulatoryEvidenceType.TGA_APPROVAL: [
                r"TGA approved", r"Therapeutic Goods Administration", r"Australian approved"
            ],
            RegulatoryEvidenceType.FDA_GUIDANCE: [
                r"FDA guidance", r"draft guidance", r"final guidance", r"industry guidance"
            ]
        }

        # Compliance patterns
        self.compliance_patterns = {
            ComplianceEvidenceType.HIPAA_DOCUMENTATION: [
                r"HIPAA compliant", r"Protected Health Information", r"PHI",
                r"HIPAA Security Rule", r"HIPAA Privacy Rule"
            ],
            ComplianceEvidenceType.GDPR_COMPLIANCE: [
                r"GDPR compliant", r"General Data Protection Regulation",
                r"data subject rights", r"right to be forgotten", r"data processing agreement"
            ],
            ComplianceEvidenceType.ISO_CERTIFICATION: [
                r"ISO 13485", r"ISO 27001", r"ISO certified", r"quality management system"
            ],
            ComplianceEvidenceType.SECURITY_ASSESSMENT: [
                r"penetration test", r"security audit", r"vulnerability assessment",
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
            "regulatory", "submission", "guidance", "510(k)", "510k"
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
        min_confidence: float = 0.7,
        domain: Optional[EvidenceDomain] = None
    ) -> List[Any]:
        """
        Extract entities from text

        Args:
            text: Text to analyze
            min_confidence: Minimum confidence threshold
            domain: Optional domain filter

        Returns:
            List of entities (MedicalEntity or Entity)
        """
        entities = []

        # Use BioBERT NER if available
        if self.ner_pipeline:
            try:
                ner_results = self.ner_pipeline(text)
                for result in ner_results:
                    entity_type = self._map_ner_label(result.get('entity_group', result.get('entity', '')))
                    if entity_type and result['score'] >= min_confidence:
                        entity = MedicalEntity(
                            text=result['word'],
                            entity_type=entity_type,
                            start=result['start'],
                            end=result['end'],
                            confidence=result['score']
                        )
                        entities.append(entity)
            except Exception as e:
                logger.warning(f"NER pipeline failed: {e}")

        # Use spaCy if available
        if self.nlp is not None:
            try:
                doc = self.nlp(text)
                for ent in doc.ents:
                    entity_type = self._map_spacy_label(ent.label_)
                    if entity_type:
                        entity = MedicalEntity(
                            text=ent.text,
                            entity_type=entity_type,
                            start=ent.start_char,
                            end=ent.end_char,
                            confidence=0.8
                        )
                        if not any(e.text == entity.text for e in entities):
                            entities.append(entity)
            except Exception as e:
                logger.warning(f"spaCy NER failed: {e}")

        # Domain-specific extraction
        if domain:
            entities.extend(await self._extract_domain_entities(text, domain))

        return entities

    async def _extract_domain_entities(self, text: str, domain: EvidenceDomain) -> List[Entity]:
        """Extract domain-specific entities using patterns"""
        entities = []

        if domain == EvidenceDomain.DIGITAL_HEALTH:
            # Device patterns
            for match in re.finditer(r'\b(smartwatch|fitness tracker|wearable|CGM|sensor|monitor)\b', text, re.IGNORECASE):
                entities.append(Entity(
                    text=match.group(0),
                    entity_type=DigitalHealthEntityType.DEVICE.value,
                    domain=domain,
                    start_pos=match.start(),
                    end_pos=match.end(),
                    confidence=0.85
                ))

            # Algorithm patterns
            for match in re.finditer(r'\b(AI|machine learning|deep learning|algorithm|model)\b', text, re.IGNORECASE):
                entities.append(Entity(
                    text=match.group(0),
                    entity_type=DigitalHealthEntityType.ALGORITHM.value,
                    domain=domain,
                    start_pos=match.start(),
                    end_pos=match.end(),
                    confidence=0.80
                ))

        elif domain == EvidenceDomain.REGULATORY:
            # Regulatory bodies
            for body, patterns in self.regulatory_bodies.items():
                for pattern in patterns:
                    for match in re.finditer(rf'\b{re.escape(pattern)}\b', text, re.IGNORECASE):
                        entities.append(Entity(
                            text=match.group(0),
                            entity_type=RegulatoryEntityType.REGULATORY_BODY.value,
                            domain=domain,
                            start_pos=match.start(),
                            end_pos=match.end(),
                            confidence=0.95
                        ))

            # Approval numbers
            for match in re.finditer(r'\b(K\d{6}|P\d{6}|BLA \d{6}|NDA \d{6})\b', text):
                entities.append(Entity(
                    text=match.group(0),
                    entity_type=RegulatoryEntityType.APPROVAL_NUMBER.value,
                    domain=domain,
                    start_pos=match.start(),
                    end_pos=match.end(),
                    confidence=0.90
                ))

        elif domain == EvidenceDomain.COMPLIANCE:
            # Standards
            for match in re.finditer(r'\b(ISO \d{5}|NIST|HITRUST|SOC 2)\b', text):
                entities.append(Entity(
                    text=match.group(0),
                    entity_type=RegulatoryEntityType.STANDARD.value,
                    domain=domain,
                    start_pos=match.start(),
                    end_pos=match.end(),
                    confidence=0.90
                ))

        return entities

    def _map_ner_label(self, label: str) -> Optional[EntityType]:
        """Map BioBERT NER label to EntityType"""
        label_mapping = {
            "DISEASE": EntityType.DISEASE,
            "CHEMICAL": EntityType.CHEMICAL,
            "GENE": EntityType.GENE,
            "PROTEIN": EntityType.PROTEIN,
            "DRUG": EntityType.DRUG,
            "ANATOMY": EntityType.ANATOMY
        }
        base_label = label.split('-')[-1] if '-' in label else label
        return label_mapping.get(base_label.upper())

    def _map_spacy_label(self, label: str) -> Optional[EntityType]:
        """Map scispaCy label to EntityType"""
        label_mapping = {
            "DISEASE": EntityType.DISEASE,
            "CHEMICAL": EntityType.CHEMICAL,
            "DRUG": EntityType.DRUG,
            "SYMPTOM": EntityType.SYMPTOM,
            "ANATOMY": EntityType.ANATOMY
        }
        return label_mapping.get(label.upper())

    # ========================================================================
    # CITATION EXTRACTION
    # ========================================================================

    async def extract_citations(self, text: str) -> List[Citation]:
        """
        Extract citations from text

        Returns:
            List of citations
        """
        citations = []

        # Extract PMIDs
        for match in self._citation_patterns["pmid"].finditer(text):
            pmid = match.group(1)
            citations.append(Citation(
                text=match.group(0),
                pmid=pmid,
                url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                confidence=0.95,
                citation_type="pmid",
                source="PubMed"
            ))

        # Extract DOIs
        for match in self._citation_patterns["doi"].finditer(text):
            doi = match.group(1)
            citations.append(Citation(
                text=match.group(0),
                doi=doi,
                url=f"https://doi.org/{doi}",
                confidence=0.95,
                citation_type="doi"
            ))

        # Extract author-year citations
        for match in self._citation_patterns["author_year"].finditer(text):
            authors = [match.group(1)]
            year = int(match.group(2))
            citations.append(Citation(
                text=match.group(0),
                authors=authors,
                year=year,
                confidence=0.80,
                citation_type="author_year"
            ))

        # Extract journal citations
        for match in self._citation_patterns["journal"].finditer(text):
            journal = match.group(1).strip()
            year = int(match.group(2))
            citations.append(Citation(
                text=match.group(0),
                journal=journal,
                year=year,
                confidence=0.85,
                citation_type="journal"
            ))

        # Extract URLs
        for match in self._citation_patterns["url"].finditer(text):
            url = match.group(0)
            citations.append(Citation(
                text=url,
                url=url,
                confidence=0.90,
                citation_type="url"
            ))

        return citations

    # ========================================================================
    # EVIDENCE TYPE CLASSIFICATION
    # ========================================================================

    async def classify_evidence_type(
        self,
        text: str,
        domain: Optional[EvidenceDomain] = None
    ) -> str:
        """
        Classify evidence type

        Args:
            text: Input text
            domain: Evidence domain (auto-detected if not provided)

        Returns:
            Evidence type string
        """
        text_lower = text.lower()

        if domain is None:
            domains = self.detect_domain(text)
            domain = domains[0] if domains else EvidenceDomain.MEDICAL

        if domain == EvidenceDomain.MEDICAL:
            return self._classify_medical_evidence(text_lower)
        elif domain == EvidenceDomain.DIGITAL_HEALTH:
            return self._classify_digital_health_evidence(text_lower)
        elif domain == EvidenceDomain.REGULATORY:
            return self._classify_regulatory_evidence(text_lower)
        elif domain == EvidenceDomain.COMPLIANCE:
            return self._classify_compliance_evidence(text_lower)

        return MedicalEvidenceType.EXPERT_OPINION.value

    def _classify_medical_evidence(self, text: str) -> str:
        """Classify medical evidence type"""
        for evidence_type, patterns in self.medical_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return evidence_type.value
        return MedicalEvidenceType.EXPERT_OPINION.value

    def _classify_digital_health_evidence(self, text: str) -> str:
        """Classify digital health evidence type"""
        for evidence_type, patterns in self.digital_health_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return evidence_type.value
        return DigitalHealthEvidenceType.HEALTH_APP_EVALUATION.value

    def _classify_regulatory_evidence(self, text: str) -> str:
        """Classify regulatory evidence type"""
        for evidence_type, patterns in self.regulatory_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return evidence_type.value
        return RegulatoryEvidenceType.REGULATORY_SUBMISSION.value

    def _classify_compliance_evidence(self, text: str) -> str:
        """Classify compliance evidence type"""
        for evidence_type, patterns in self.compliance_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return evidence_type.value
        return ComplianceEvidenceType.AUDIT_REPORT.value

    # ========================================================================
    # QUALITY ASSESSMENT
    # ========================================================================

    def assess_quality(
        self,
        evidence_type: str,
        domain: Optional[EvidenceDomain] = None
    ) -> EvidenceQuality:
        """
        Assess evidence quality using domain-specific hierarchies

        Args:
            evidence_type: Evidence type string
            domain: Evidence domain

        Returns:
            Quality level
        """
        # Medical quality (GRADE system)
        medical_quality = {
            "systematic_review": EvidenceQuality.HIGH,
            "meta_analysis": EvidenceQuality.HIGH,
            "clinical_trial": EvidenceQuality.MODERATE,
            "guideline": EvidenceQuality.MODERATE,
            "observational_study": EvidenceQuality.LOW,
            "case_study": EvidenceQuality.LOW,
            "laboratory_study": EvidenceQuality.LOW,
            "expert_opinion": EvidenceQuality.VERY_LOW
        }

        # Regulatory quality
        regulatory_quality = {
            "fda_approval": EvidenceQuality.HIGH,
            "ema_approval": EvidenceQuality.HIGH,
            "mhra_approval": EvidenceQuality.HIGH,
            "tga_approval": EvidenceQuality.HIGH,
            "fda_guidance": EvidenceQuality.MODERATE,
            "ema_guideline": EvidenceQuality.MODERATE,
            "regulatory_submission": EvidenceQuality.LOW,
            "safety_report": EvidenceQuality.MODERATE
        }

        # Compliance quality
        compliance_quality = {
            "iso_certification": EvidenceQuality.HIGH,
            "audit_report": EvidenceQuality.HIGH,
            "security_assessment": EvidenceQuality.MODERATE,
            "hipaa_documentation": EvidenceQuality.MODERATE,
            "gdpr_compliance": EvidenceQuality.MODERATE,
            "privacy_policy": EvidenceQuality.LOW
        }

        # Digital health quality
        digital_health_quality = {
            "ai_ml_validation": EvidenceQuality.HIGH,
            "wearable_validation": EvidenceQuality.HIGH,
            "telehealth_trial": EvidenceQuality.MODERATE,
            "digital_therapeutic": EvidenceQuality.MODERATE,
            "mhealth_study": EvidenceQuality.MODERATE,
            "remote_monitoring": EvidenceQuality.LOW,
            "health_app_evaluation": EvidenceQuality.LOW
        }

        # Try all quality maps
        for quality_map in [medical_quality, regulatory_quality, compliance_quality, digital_health_quality]:
            if evidence_type in quality_map:
                return quality_map[evidence_type]

        return EvidenceQuality.LOW

    # ========================================================================
    # CONFIDENCE CALCULATION
    # ========================================================================

    def calculate_confidence(
        self,
        quality: EvidenceQuality,
        entities: List[Any],
        citations: List[Citation],
        evidence_type: str
    ) -> float:
        """
        Calculate confidence score

        Returns:
            Float between 0.0 and 1.0
        """
        quality_scores = {
            EvidenceQuality.HIGH: 0.85,
            EvidenceQuality.MODERATE: 0.70,
            EvidenceQuality.LOW: 0.55,
            EvidenceQuality.VERY_LOW: 0.40
        }
        confidence = quality_scores.get(quality, 0.50)

        # Boost for entities
        if len(entities) >= 3:
            confidence *= 1.1

        # Boost for citations
        citation_boost = min(0.15, len(citations) * 0.05)
        confidence += citation_boost

        # Boost for high-quality evidence types
        high_quality_types = [
            "systematic_review", "meta_analysis",
            "fda_approval", "ema_approval",
            "iso_certification", "ai_ml_validation"
        ]
        if evidence_type in high_quality_types:
            confidence *= 1.05

        return min(confidence, 1.0)

    # ========================================================================
    # MAIN DETECTION
    # ========================================================================

    async def detect_evidence(
        self,
        text: str,
        min_confidence: float = 0.7,
        include_context: bool = True,
        domains: Optional[List[EvidenceDomain]] = None
    ) -> List[Evidence]:
        """
        Detect evidence in text across all domains

        Args:
            text: Text to analyze
            min_confidence: Minimum confidence threshold
            include_context: Include surrounding context
            domains: Specific domains to check (auto-detect if None)

        Returns:
            List of detected evidence
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
            entities = await self.extract_entities(text, domain=domain)

            # Classify evidence type
            evidence_type = await self.classify_evidence_type(text, domain)

            # Assess quality
            quality = self.assess_quality(evidence_type, domain)

            # Calculate confidence
            confidence = self.calculate_confidence(quality, entities, citations, evidence_type)

            # Skip if below threshold
            if confidence < min_confidence:
                continue

            # Generate reasoning
            reasoning = self._generate_reasoning(domain, evidence_type, quality, entities, citations)

            # Create evidence object
            evidence = Evidence(
                text=text[:500],
                evidence_type=evidence_type,
                quality=quality,
                confidence=confidence,
                entities=entities,
                citations=citations,
                domain=domain,
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
        entities: List[Any],
        citations: List[Citation]
    ) -> str:
        """Generate human-readable reasoning"""
        parts = []

        parts.append(f"Domain: {domain.value.replace('_', ' ').title()}")
        parts.append(f"Type: {evidence_type.replace('_', ' ').title()}")
        parts.append(f"Quality: {quality.value}")

        if entities:
            entity_types = list(set(
                getattr(e, 'entity_type', e.entity_type if hasattr(e, 'entity_type') else 'unknown')
                for e in entities[:3]
            ))
            # Convert EntityType enum to string if needed
            entity_strs = [str(et.value) if hasattr(et, 'value') else str(et) for et in entity_types]
            parts.append(f"Entities: {', '.join(entity_strs)}")

        if citations:
            parts.append(f"Citations: {len(citations)}")

        return " | ".join(parts)


# ============================================================================
# BACKWARD COMPATIBILITY: MultiDomainEvidenceDetector Alias
# ============================================================================

class MultiDomainEvidenceDetector(EvidenceDetector):
    """
    Backward compatibility alias for MultiDomainEvidenceDetector.

    This class is now consolidated into EvidenceDetector.
    Import from evidence_detector instead of multi_domain_evidence_detector.
    """
    pass


# ============================================================================
# SINGLETON INSTANCES
# ============================================================================

_evidence_detector_instance: Optional[EvidenceDetector] = None
_multi_domain_detector: Optional[MultiDomainEvidenceDetector] = None


def get_evidence_detector() -> EvidenceDetector:
    """
    Get singleton evidence detector instance

    Returns:
        EvidenceDetector instance
    """
    global _evidence_detector_instance

    if _evidence_detector_instance is None:
        _evidence_detector_instance = EvidenceDetector()

    return _evidence_detector_instance


def get_multi_domain_detector() -> MultiDomainEvidenceDetector:
    """
    Get singleton multi-domain evidence detector (alias for compatibility)

    Returns:
        MultiDomainEvidenceDetector instance (same as EvidenceDetector)
    """
    global _multi_domain_detector

    if _multi_domain_detector is None:
        _multi_domain_detector = MultiDomainEvidenceDetector()

    return _multi_domain_detector


# ============================================================================
# EXPORTS (for backward compatibility)
# ============================================================================

__all__ = [
    # Main classes
    "EvidenceDetector",
    "MultiDomainEvidenceDetector",

    # Singleton getters
    "get_evidence_detector",
    "get_multi_domain_detector",

    # Domain types
    "EvidenceDomain",

    # Evidence types
    "EvidenceType",
    "MedicalEvidenceType",
    "DigitalHealthEvidenceType",
    "RegulatoryEvidenceType",
    "ComplianceEvidenceType",

    # Entity types
    "EntityType",
    "MedicalEntityType",
    "DigitalHealthEntityType",
    "RegulatoryEntityType",

    # Quality
    "EvidenceQuality",

    # Data structures
    "MedicalEntity",
    "Entity",
    "Citation",
    "Evidence",
]
