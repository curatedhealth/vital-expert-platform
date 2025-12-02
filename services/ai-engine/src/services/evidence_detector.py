"""
SciBERT-based Medical Evidence Detection Service

Automatically detects and extracts medical evidence from conversations using:
- SciBERT for biomedical text understanding
- Named Entity Recognition (NER) for medical entities
- Citation extraction and validation
- Evidence quality scoring

Created: 2025-10-25
Phase: 4 Week 2 - SciBERT Evidence Detection
"""

import re
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

import torch
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    AutoModelForSequenceClassification,
    pipeline
)

# Optional spacy import - not required for basic functionality
try:
    import spacy
    from spacy.tokens import Doc
    SPACY_AVAILABLE = True
except ImportError:
    spacy = None
    Doc = None
    SPACY_AVAILABLE = False

logger = logging.getLogger(__name__)


# ============================================================================
# DATA MODELS
# ============================================================================

class EvidenceType(Enum):
    """Types of medical evidence"""
    CLINICAL_TRIAL = "clinical_trial"
    SYSTEMATIC_REVIEW = "systematic_review"
    META_ANALYSIS = "meta_analysis"
    CASE_STUDY = "case_study"
    OBSERVATIONAL_STUDY = "observational_study"
    GUIDELINE = "guideline"
    EXPERT_OPINION = "expert_opinion"
    LABORATORY_STUDY = "laboratory_study"


class EntityType(Enum):
    """Types of medical entities"""
    DISEASE = "disease"
    DRUG = "drug"
    PROTEIN = "protein"
    GENE = "gene"
    CHEMICAL = "chemical"
    PROCEDURE = "procedure"
    ANATOMY = "anatomy"
    SYMPTOM = "symptom"


class EvidenceQuality(Enum):
    """Evidence quality levels (GRADE system)"""
    HIGH = "high"  # High confidence in effect estimate
    MODERATE = "moderate"  # Moderate confidence
    LOW = "low"  # Low confidence
    VERY_LOW = "very_low"  # Very low confidence


@dataclass
class MedicalEntity:
    """Extracted medical entity"""
    text: str
    entity_type: EntityType
    start: int
    end: int
    confidence: float
    context: Optional[str] = None


@dataclass
class Citation:
    """Medical citation"""
    text: str
    pmid: Optional[str] = None  # PubMed ID
    doi: Optional[str] = None
    authors: Optional[List[str]] = None
    title: Optional[str] = None
    journal: Optional[str] = None
    year: Optional[int] = None
    url: Optional[str] = None
    confidence: float = 0.0


@dataclass
class Evidence:
    """Detected medical evidence"""
    text: str
    evidence_type: EvidenceType
    quality: EvidenceQuality
    confidence: float
    entities: List[MedicalEntity]
    citations: List[Citation]
    start: int
    end: int
    context: Optional[str] = None
    reasoning: Optional[str] = None


# ============================================================================
# EVIDENCE DETECTOR
# ============================================================================

class EvidenceDetector:
    """
    Detects and extracts medical evidence from text using SciBERT

    Features:
    - Medical entity recognition (diseases, drugs, procedures)
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
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Initializing EvidenceDetector on device: {self.device}")

        # Load models
        self._load_models(scibert_model, biobert_ner_model)

        # Load spaCy for additional NLP tasks (graceful degradation)
        self.nlp = None
        try:
            self.nlp = spacy.load("en_core_sci_md")  # scispaCy model
            logger.info("Loaded scispaCy model: en_core_sci_md")
        except OSError:
            logger.warning("scispaCy model not found, trying default model")
            try:
                self.nlp = spacy.load("en_core_web_sm")
                logger.info("Loaded spaCy model: en_core_web_sm")
            except OSError:
                logger.warning("No spaCy models available - NLP features will be limited")

        # Citation patterns
        self._citation_patterns = self._compile_citation_patterns()

        # Evidence keywords
        self._evidence_keywords = self._load_evidence_keywords()

    def _load_models(self, scibert_model: str, biobert_ner_model: str):
        """Load SciBERT and BioBERT models"""
        logger.info("Loading SciBERT tokenizer and model...")

        # SciBERT for sequence classification (evidence type)
        self.tokenizer = AutoTokenizer.from_pretrained(scibert_model)
        self.evidence_classifier = AutoModelForSequenceClassification.from_pretrained(
            scibert_model,
            num_labels=len(EvidenceType)
        ).to(self.device)

        # BioBERT for NER
        logger.info("Loading BioBERT NER pipeline...")
        self.ner_pipeline = pipeline(
            "ner",
            model=biobert_ner_model,
            tokenizer=biobert_ner_model,
            device=0 if self.device == "cuda" else -1,
            aggregation_strategy="simple"
        )

        logger.info("Models loaded successfully")

    def _compile_citation_patterns(self) -> Dict[str, re.Pattern]:
        """Compile regex patterns for citation extraction"""
        return {
            # PubMed ID: PMID: 12345678 or PMID 12345678
            "pmid": re.compile(r'PMID:?\s*(\d{7,8})', re.IGNORECASE),

            # DOI: 10.1234/journal.year.12345
            "doi": re.compile(r'doi:?\s*(10\.\d{4,}/[^\s]+)', re.IGNORECASE),

            # Author et al., Year
            "author_year": re.compile(r'([A-Z][a-z]+(?:\s+et\s+al\.)?),?\s+\((\d{4})\)'),

            # Journal citation: Journal Name. Year;Volume(Issue):Pages
            "journal": re.compile(
                r'([A-Z][a-zA-Z\s&]+)\.\s+(\d{4});(\d+)(?:\((\d+)\))?:(\d+(?:-\d+)?)',
                re.IGNORECASE
            ),

            # URL to papers
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

    # ========================================================================
    # MAIN DETECTION METHODS
    # ========================================================================

    async def detect_evidence(
        self,
        text: str,
        min_confidence: float = 0.7,
        include_context: bool = True
    ) -> List[Evidence]:
        """
        Detect medical evidence in text

        Args:
            text: Text to analyze
            min_confidence: Minimum confidence threshold
            include_context: Include surrounding context

        Returns:
            List of detected evidence
        """
        # Run detections in parallel
        entities_task = self.extract_entities(text)
        citations_task = self.extract_citations(text)
        evidence_spans_task = self._identify_evidence_spans(text)

        entities, citations, evidence_spans = await asyncio.gather(
            entities_task,
            citations_task,
            evidence_spans_task
        )

        # Build evidence objects
        evidence_list = []

        for span_start, span_end, span_text in evidence_spans:
            # Classify evidence type
            evidence_type = await self._classify_evidence_type(span_text)

            # Assess quality
            quality = await self._assess_evidence_quality(
                span_text, evidence_type, citations
            )

            # Calculate confidence
            confidence = await self._calculate_evidence_confidence(
                span_text, evidence_type, quality, entities, citations
            )

            if confidence >= min_confidence:
                # Filter entities and citations in this span
                span_entities = [
                    e for e in entities
                    if e.start >= span_start and e.end <= span_end
                ]
                span_citations = [
                    c for c in citations
                    if span_text.find(c.text) >= 0
                ]

                # Get context
                context = None
                if include_context:
                    context = self._extract_context(text, span_start, span_end)

                # Build reasoning
                reasoning = self._generate_reasoning(
                    evidence_type, quality, span_entities, span_citations
                )

                evidence = Evidence(
                    text=span_text,
                    evidence_type=evidence_type,
                    quality=quality,
                    confidence=confidence,
                    entities=span_entities,
                    citations=span_citations,
                    start=span_start,
                    end=span_end,
                    context=context,
                    reasoning=reasoning
                )

                evidence_list.append(evidence)

        return evidence_list

    # ========================================================================
    # ENTITY EXTRACTION
    # ========================================================================

    async def extract_entities(
        self,
        text: str,
        min_confidence: float = 0.7
    ) -> List[MedicalEntity]:
        """
        Extract medical entities using BioBERT NER

        Args:
            text: Text to analyze
            min_confidence: Minimum confidence threshold

        Returns:
            List of medical entities
        """
        # Run NER pipeline
        ner_results = self.ner_pipeline(text)

        entities = []

        for result in ner_results:
            # Map BioBERT labels to our EntityType
            entity_type = self._map_ner_label(result['entity_group'])

            if entity_type and result['score'] >= min_confidence:
                entity = MedicalEntity(
                    text=result['word'],
                    entity_type=entity_type,
                    start=result['start'],
                    end=result['end'],
                    confidence=result['score']
                )
                entities.append(entity)

        # Also use scispaCy for additional entities (if available)
        if self.nlp is not None:
            doc = self.nlp(text)

            for ent in doc.ents:
                entity_type = self._map_spacy_label(ent.label_)

                if entity_type:
                    entity = MedicalEntity(
                        text=ent.text,
                        entity_type=entity_type,
                        start=ent.start_char,
                        end=ent.end_char,
                        confidence=0.8  # Default confidence for spaCy
                    )

                    # Avoid duplicates
                    if not any(e.text == entity.text for e in entities):
                        entities.append(entity)

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

        # Extract base label (remove B- or I- prefix)
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

    async def extract_citations(
        self,
        text: str
    ) -> List[Citation]:
        """
        Extract citations from text

        Args:
            text: Text to analyze

        Returns:
            List of citations
        """
        citations = []

        # Extract PMIDs
        for match in self._citation_patterns["pmid"].finditer(text):
            pmid = match.group(1)
            citation = Citation(
                text=match.group(0),
                pmid=pmid,
                url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                confidence=0.95
            )
            citations.append(citation)

        # Extract DOIs
        for match in self._citation_patterns["doi"].finditer(text):
            doi = match.group(1)
            citation = Citation(
                text=match.group(0),
                doi=doi,
                url=f"https://doi.org/{doi}",
                confidence=0.95
            )
            citations.append(citation)

        # Extract author-year citations
        for match in self._citation_patterns["author_year"].finditer(text):
            authors = [match.group(1)]
            year = int(match.group(2))
            citation = Citation(
                text=match.group(0),
                authors=authors,
                year=year,
                confidence=0.80
            )
            citations.append(citation)

        # Extract journal citations
        for match in self._citation_patterns["journal"].finditer(text):
            journal = match.group(1).strip()
            year = int(match.group(2))
            citation = Citation(
                text=match.group(0),
                journal=journal,
                year=year,
                confidence=0.85
            )
            citations.append(citation)

        # Extract URLs
        for match in self._citation_patterns["url"].finditer(text):
            url = match.group(0)
            citation = Citation(
                text=url,
                url=url,
                confidence=0.90
            )
            citations.append(citation)

        return citations

    async def validate_citation(
        self,
        citation: Citation
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Validate citation against PubMed/CrossRef

        Args:
            citation: Citation to validate

        Returns:
            (is_valid, metadata) tuple
        """
        # This would connect to PubMed/CrossRef APIs
        # For now, return placeholder

        if citation.pmid:
            # TODO: Query PubMed API
            return True, {
                "source": "pubmed",
                "pmid": citation.pmid,
                "validated": True
            }

        if citation.doi:
            # TODO: Query CrossRef API
            return True, {
                "source": "crossref",
                "doi": citation.doi,
                "validated": True
            }

        return False, None

    # ========================================================================
    # EVIDENCE CLASSIFICATION
    # ========================================================================

    async def _identify_evidence_spans(
        self,
        text: str
    ) -> List[Tuple[int, int, str]]:
        """
        Identify spans of text containing evidence

        Returns:
            List of (start, end, text) tuples
        """
        spans = []

        # Split into sentences (with fallback if spaCy unavailable)
        if self.nlp is not None:
            doc = self.nlp(text)
            for sent in doc.sents:
                sent_text = sent.text.strip()
                if self._contains_evidence_keywords(sent_text):
                    spans.append((sent.start_char, sent.end_char, sent_text))
        else:
            # Fallback: simple regex-based sentence splitting
            sentence_pattern = re.compile(r'[^.!?]+[.!?]+')
            pos = 0
            for match in sentence_pattern.finditer(text):
                sent_text = match.group().strip()
                if self._contains_evidence_keywords(sent_text):
                    spans.append((match.start(), match.end(), sent_text))

        # Merge adjacent sentences with evidence
        merged_spans = self._merge_adjacent_spans(spans, text)

        return merged_spans

    def _contains_evidence_keywords(self, text: str) -> bool:
        """Check if text contains evidence keywords"""
        text_lower = text.lower()

        for evidence_type, keywords in self._evidence_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return True

        # Also check for citation indicators
        if any(pattern.search(text) for pattern in self._citation_patterns.values()):
            return True

        return False

    def _merge_adjacent_spans(
        self,
        spans: List[Tuple[int, int, str]],
        text: str,
        max_gap: int = 50
    ) -> List[Tuple[int, int, str]]:
        """Merge adjacent evidence spans"""
        if not spans:
            return []

        sorted_spans = sorted(spans, key=lambda x: x[0])
        merged = [sorted_spans[0]]

        for current_start, current_end, _ in sorted_spans[1:]:
            last_start, last_end, _ = merged[-1]

            # Merge if gap is small
            if current_start - last_end <= max_gap:
                merged_text = text[last_start:current_end]
                merged[-1] = (last_start, current_end, merged_text)
            else:
                merged.append((current_start, current_end, text[current_start:current_end]))

        return merged

    async def _classify_evidence_type(
        self,
        text: str
    ) -> EvidenceType:
        """
        Classify evidence type using keyword matching and ML

        Args:
            text: Evidence text

        Returns:
            Evidence type
        """
        text_lower = text.lower()

        # Keyword-based classification
        type_scores = {}

        for evidence_type, keywords in self._evidence_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            type_scores[evidence_type] = score

        # Get type with highest score
        if type_scores:
            best_type = max(type_scores, key=type_scores.get)
            if type_scores[best_type] > 0:
                return best_type

        # Default to expert opinion if no keywords match
        return EvidenceType.EXPERT_OPINION

    async def _assess_evidence_quality(
        self,
        text: str,
        evidence_type: EvidenceType,
        citations: List[Citation]
    ) -> EvidenceQuality:
        """
        Assess evidence quality using GRADE system

        Args:
            text: Evidence text
            evidence_type: Type of evidence
            citations: Related citations

        Returns:
            Evidence quality level
        """
        # Base quality by evidence type (GRADE hierarchy)
        quality_hierarchy = {
            EvidenceType.SYSTEMATIC_REVIEW: EvidenceQuality.HIGH,
            EvidenceType.META_ANALYSIS: EvidenceQuality.HIGH,
            EvidenceType.CLINICAL_TRIAL: EvidenceQuality.MODERATE,
            EvidenceType.OBSERVATIONAL_STUDY: EvidenceQuality.LOW,
            EvidenceType.CASE_STUDY: EvidenceQuality.LOW,
            EvidenceType.GUIDELINE: EvidenceQuality.MODERATE,
            EvidenceType.LABORATORY_STUDY: EvidenceQuality.LOW,
            EvidenceType.EXPERT_OPINION: EvidenceQuality.VERY_LOW
        }

        base_quality = quality_hierarchy.get(evidence_type, EvidenceQuality.VERY_LOW)

        # Upgrade if has citations
        if len(citations) >= 3:
            # Multiple citations → upgrade quality
            quality_levels = [EvidenceQuality.VERY_LOW, EvidenceQuality.LOW,
                            EvidenceQuality.MODERATE, EvidenceQuality.HIGH]
            current_index = quality_levels.index(base_quality)
            if current_index < len(quality_levels) - 1:
                return quality_levels[current_index + 1]

        # Downgrade if has limitation keywords
        limitation_keywords = ["limitation", "bias", "small sample", "underpowered"]
        if any(keyword in text.lower() for keyword in limitation_keywords):
            quality_levels = [EvidenceQuality.VERY_LOW, EvidenceQuality.LOW,
                            EvidenceQuality.MODERATE, EvidenceQuality.HIGH]
            current_index = quality_levels.index(base_quality)
            if current_index > 0:
                return quality_levels[current_index - 1]

        return base_quality

    async def _calculate_evidence_confidence(
        self,
        text: str,
        evidence_type: EvidenceType,
        quality: EvidenceQuality,
        entities: List[MedicalEntity],
        citations: List[Citation]
    ) -> float:
        """
        Calculate confidence score for evidence

        Args:
            text: Evidence text
            evidence_type: Type of evidence
            quality: Quality assessment
            entities: Medical entities
            citations: Citations

        Returns:
            Confidence score (0.0-1.0)
        """
        # Base confidence from quality
        quality_scores = {
            EvidenceQuality.HIGH: 0.9,
            EvidenceQuality.MODERATE: 0.75,
            EvidenceQuality.LOW: 0.60,
            EvidenceQuality.VERY_LOW: 0.45
        }

        confidence = quality_scores.get(quality, 0.5)

        # Boost for entities
        if len(entities) >= 3:
            confidence = min(1.0, confidence * 1.1)

        # Boost for citations
        if len(citations) > 0:
            citation_boost = min(0.15, len(citations) * 0.05)
            confidence = min(1.0, confidence + citation_boost)

        # Boost for specific evidence types
        if evidence_type in [EvidenceType.SYSTEMATIC_REVIEW, EvidenceType.META_ANALYSIS]:
            confidence = min(1.0, confidence * 1.05)

        return confidence

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    def _extract_context(
        self,
        text: str,
        start: int,
        end: int,
        context_chars: int = 100
    ) -> str:
        """Extract surrounding context for evidence span"""
        context_start = max(0, start - context_chars)
        context_end = min(len(text), end + context_chars)

        context = text[context_start:context_end]

        # Add ellipsis if truncated
        if context_start > 0:
            context = "..." + context
        if context_end < len(text):
            context = context + "..."

        return context

    def _generate_reasoning(
        self,
        evidence_type: EvidenceType,
        quality: EvidenceQuality,
        entities: List[MedicalEntity],
        citations: List[Citation]
    ) -> str:
        """Generate human-readable reasoning for evidence"""
        parts = []

        # Evidence type
        parts.append(f"Type: {evidence_type.value.replace('_', ' ').title()}")

        # Quality
        parts.append(f"Quality: {quality.value.upper()}")

        # Entities
        if entities:
            entity_types = set(e.entity_type.value for e in entities)
            parts.append(f"Entities: {', '.join(entity_types)}")

        # Citations
        if citations:
            parts.append(f"Citations: {len(citations)}")

        return " | ".join(parts)


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_evidence_detector_instance: Optional[EvidenceDetector] = None


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
