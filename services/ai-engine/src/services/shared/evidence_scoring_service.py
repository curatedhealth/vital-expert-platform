"""
Evidence Scoring Service for VITAL Ask Expert

Provides multi-dimensional scoring of evidence quality in RAG responses.
Used to validate and rank retrieved knowledge before including in responses.

Scoring Dimensions:
1. Relevance Score - How relevant is the evidence to the query
2. Authority Score - Source credibility (FDA, peer-reviewed, etc.)
3. Recency Score - How recent is the information
4. Specificity Score - How specific vs generic is the evidence
5. Confidence Score - Overall confidence in the evidence

Phase 5 Implementation - ARD v2.0 Compliant
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import re
import structlog

logger = structlog.get_logger()


class SourceAuthority(Enum):
    """Authority levels for evidence sources"""
    REGULATORY = 1.0        # FDA, EMA, ICH guidelines
    PEER_REVIEWED = 0.9     # PubMed, major journals
    PROFESSIONAL = 0.8      # Professional guidelines (AMA, etc.)
    INSTITUTIONAL = 0.7     # Hospital/university documentation
    INDUSTRY = 0.6          # Pharmaceutical company data
    EXPERT_OPINION = 0.5    # Expert blog/opinion
    GENERAL = 0.3           # General web sources
    UNKNOWN = 0.1           # Unknown source


@dataclass
class EvidenceScore:
    """Comprehensive evidence quality score"""
    chunk_id: str
    text_preview: str

    # Individual scores (0.0 - 1.0)
    relevance_score: float
    authority_score: float
    recency_score: float
    specificity_score: float

    # Combined score
    confidence_score: float

    # Metadata
    source_type: str
    source_authority: SourceAuthority
    publication_date: Optional[datetime]
    citations: List[str] = field(default_factory=list)
    matched_terms: List[str] = field(default_factory=list)

    # Flags
    requires_review: bool = False
    is_outdated: bool = False
    has_conflicting_info: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "chunk_id": self.chunk_id,
            "text_preview": self.text_preview[:200],
            "scores": {
                "relevance": round(self.relevance_score, 3),
                "authority": round(self.authority_score, 3),
                "recency": round(self.recency_score, 3),
                "specificity": round(self.specificity_score, 3),
                "confidence": round(self.confidence_score, 3)
            },
            "source_type": self.source_type,
            "source_authority": self.source_authority.name,
            "publication_date": self.publication_date.isoformat() if self.publication_date else None,
            "matched_terms": self.matched_terms[:10],
            "flags": {
                "requires_review": self.requires_review,
                "is_outdated": self.is_outdated,
                "has_conflicting_info": self.has_conflicting_info
            }
        }


class EvidenceScoringService:
    """
    Multi-dimensional evidence scoring for RAG quality assurance.

    Weights (configurable):
    - Relevance: 35%
    - Authority: 25%
    - Recency: 20%
    - Specificity: 20%

    Thresholds:
    - High confidence: >= 0.75
    - Medium confidence: >= 0.50
    - Low confidence: < 0.50 (requires review)
    """

    # Default weights for composite score
    DEFAULT_WEIGHTS = {
        "relevance": 0.35,
        "authority": 0.25,
        "recency": 0.20,
        "specificity": 0.20
    }

    # Regulatory source patterns
    REGULATORY_PATTERNS = [
        r'\bFDA\b', r'\bEMA\b', r'\bICH\b', r'\bUSP\b', r'\bWHO\b',
        r'21 CFR', r'510\(k\)', r'PMA', r'De Novo', r'guidance',
        r'regulation', r'compliance', r'requirement'
    ]

    # Peer-reviewed source patterns
    PEER_REVIEWED_PATTERNS = [
        r'PubMed', r'PMID', r'DOI:', r'et al\.', r'Journal of',
        r'New England Journal', r'JAMA', r'Lancet', r'Nature',
        r'peer-reviewed', r'clinical trial', r'randomized'
    ]

    # Medical terminology for specificity
    MEDICAL_TERM_PATTERNS = [
        r'\b[A-Z]{2,5}\b',  # Acronyms like FDA, EMA, GMP
        r'\d+\s*mg', r'\d+\s*%',  # Dosages and percentages
        r'Class [I|II|III]',  # Device classifications
        r'p\s*[<>=]\s*0\.\d+',  # Statistical significance
        r'\d{4}[-/]\d{2}[-/]\d{2}',  # Dates
    ]

    def __init__(
        self,
        weights: Optional[Dict[str, float]] = None,
        high_confidence_threshold: float = 0.75,
        low_confidence_threshold: float = 0.50,
        recency_decay_days: int = 365 * 3  # 3 years
    ):
        """
        Initialize evidence scoring service.

        Args:
            weights: Custom weights for score dimensions
            high_confidence_threshold: Threshold for high confidence
            low_confidence_threshold: Below this requires review
            recency_decay_days: Days after which recency score decays
        """
        self.weights = weights or self.DEFAULT_WEIGHTS
        self.high_confidence_threshold = high_confidence_threshold
        self.low_confidence_threshold = low_confidence_threshold
        self.recency_decay_days = recency_decay_days

        # Normalize weights
        total = sum(self.weights.values())
        self.weights = {k: v / total for k, v in self.weights.items()}

    def score_evidence(
        self,
        chunk: Dict[str, Any],
        query: str,
        query_terms: Optional[List[str]] = None
    ) -> EvidenceScore:
        """
        Score a single evidence chunk.

        Args:
            chunk: Evidence chunk with text, metadata, source info
            query: Original user query
            query_terms: Optional extracted query terms for matching

        Returns:
            EvidenceScore with all dimension scores
        """
        text = chunk.get("text", chunk.get("content", ""))
        metadata = chunk.get("metadata", {})
        chunk_id = chunk.get("id", chunk.get("chunk_id", "unknown"))

        # Extract query terms if not provided
        if not query_terms:
            query_terms = self._extract_query_terms(query)

        # Calculate individual scores
        relevance = self._calculate_relevance(text, query, query_terms)
        authority, source_authority = self._calculate_authority(text, metadata)
        recency, pub_date, is_outdated = self._calculate_recency(metadata)
        specificity, matched_terms = self._calculate_specificity(text)

        # Calculate composite confidence score
        confidence = (
            self.weights["relevance"] * relevance +
            self.weights["authority"] * authority +
            self.weights["recency"] * recency +
            self.weights["specificity"] * specificity
        )

        # Determine if review is required
        requires_review = confidence < self.low_confidence_threshold

        return EvidenceScore(
            chunk_id=chunk_id,
            text_preview=text[:200] if text else "",
            relevance_score=relevance,
            authority_score=authority,
            recency_score=recency,
            specificity_score=specificity,
            confidence_score=confidence,
            source_type=metadata.get("source_type", "unknown"),
            source_authority=source_authority,
            publication_date=pub_date,
            matched_terms=matched_terms,
            requires_review=requires_review,
            is_outdated=is_outdated,
            has_conflicting_info=False  # Set by conflict detection (future)
        )

    def score_evidence_batch(
        self,
        chunks: List[Dict[str, Any]],
        query: str,
        min_confidence: float = 0.0
    ) -> Tuple[List[EvidenceScore], Dict[str, Any]]:
        """
        Score multiple evidence chunks and return filtered, ranked results.

        Args:
            chunks: List of evidence chunks
            query: Original user query
            min_confidence: Minimum confidence threshold

        Returns:
            Tuple of (scored_chunks, analytics)
        """
        query_terms = self._extract_query_terms(query)
        scores = []

        for chunk in chunks:
            score = self.score_evidence(chunk, query, query_terms)
            if score.confidence_score >= min_confidence:
                scores.append(score)

        # Sort by confidence (descending)
        scores.sort(key=lambda x: x.confidence_score, reverse=True)

        # Calculate analytics
        analytics = self._calculate_analytics(scores)

        logger.info(
            "evidence_scoring_batch_complete",
            total_chunks=len(chunks),
            scored_chunks=len(scores),
            avg_confidence=analytics["avg_confidence"],
            high_confidence_count=analytics["high_confidence_count"]
        )

        return scores, analytics

    def _calculate_relevance(
        self,
        text: str,
        query: str,
        query_terms: List[str]
    ) -> float:
        """Calculate relevance score based on term matching"""
        if not text or not query_terms:
            return 0.3  # Default for empty

        text_lower = text.lower()
        matches = sum(1 for term in query_terms if term.lower() in text_lower)

        # Calculate match ratio
        if query_terms:
            match_ratio = matches / len(query_terms)
        else:
            match_ratio = 0.0

        # Bonus for exact phrase match
        query_lower = query.lower()
        phrase_bonus = 0.2 if query_lower[:30] in text_lower else 0.0

        return min(match_ratio + phrase_bonus, 1.0)

    def _calculate_authority(
        self,
        text: str,
        metadata: Dict[str, Any]
    ) -> Tuple[float, SourceAuthority]:
        """Calculate authority score based on source type"""
        source = metadata.get("source", "").lower()
        source_type = metadata.get("source_type", "").lower()

        # Check for regulatory sources
        for pattern in self.REGULATORY_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return SourceAuthority.REGULATORY.value, SourceAuthority.REGULATORY

        # Check metadata source type
        if "fda" in source or "regulatory" in source_type:
            return SourceAuthority.REGULATORY.value, SourceAuthority.REGULATORY

        # Check for peer-reviewed
        for pattern in self.PEER_REVIEWED_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return SourceAuthority.PEER_REVIEWED.value, SourceAuthority.PEER_REVIEWED

        if "pubmed" in source or "journal" in source_type:
            return SourceAuthority.PEER_REVIEWED.value, SourceAuthority.PEER_REVIEWED

        # Check for professional guidelines
        if "guideline" in source_type or "professional" in source_type:
            return SourceAuthority.PROFESSIONAL.value, SourceAuthority.PROFESSIONAL

        # Check for institutional
        if any(x in source for x in ["hospital", "university", "institute"]):
            return SourceAuthority.INSTITUTIONAL.value, SourceAuthority.INSTITUTIONAL

        # Default to general
        return SourceAuthority.GENERAL.value, SourceAuthority.GENERAL

    def _calculate_recency(
        self,
        metadata: Dict[str, Any]
    ) -> Tuple[float, Optional[datetime], bool]:
        """Calculate recency score based on publication date"""
        pub_date = None
        is_outdated = False

        # Try to extract publication date
        date_str = metadata.get("publication_date") or metadata.get("date")
        if date_str:
            try:
                if isinstance(date_str, datetime):
                    pub_date = date_str
                elif isinstance(date_str, str):
                    # Try common date formats
                    for fmt in ["%Y-%m-%d", "%Y/%m/%d", "%Y", "%B %Y", "%m/%d/%Y"]:
                        try:
                            pub_date = datetime.strptime(date_str, fmt)
                            break
                        except ValueError:
                            continue
            except Exception:
                pass

        if pub_date:
            days_old = (datetime.now() - pub_date).days
            is_outdated = days_old > self.recency_decay_days

            # Exponential decay
            if days_old <= 0:
                recency = 1.0
            elif days_old <= 365:  # Less than 1 year
                recency = 0.9
            elif days_old <= 730:  # 1-2 years
                recency = 0.75
            elif days_old <= self.recency_decay_days:  # 2-3 years
                recency = 0.6
            else:  # Older than decay period
                recency = max(0.3, 1.0 - (days_old / (self.recency_decay_days * 2)))
        else:
            # No date available - assume moderate recency
            recency = 0.5

        return recency, pub_date, is_outdated

    def _calculate_specificity(self, text: str) -> Tuple[float, List[str]]:
        """Calculate specificity score based on technical terms"""
        if not text:
            return 0.3, []

        matched_terms = []

        # Count technical term matches
        for pattern in self.MEDICAL_TERM_PATTERNS:
            matches = re.findall(pattern, text)
            matched_terms.extend(matches[:5])  # Limit per pattern

        # Unique terms
        unique_terms = list(set(matched_terms))[:10]

        # Calculate score based on term density
        term_density = len(unique_terms) / max(len(text.split()), 1)
        specificity = min(term_density * 10 + 0.3, 1.0)

        return specificity, unique_terms

    def _extract_query_terms(self, query: str) -> List[str]:
        """Extract meaningful terms from query"""
        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall',
            'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
            'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about',
            'into', 'through', 'during', 'before', 'after', 'above',
            'below', 'between', 'under', 'again', 'further', 'then',
            'once', 'here', 'there', 'when', 'where', 'why', 'how',
            'all', 'each', 'few', 'more', 'most', 'other', 'some',
            'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
            'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
            'because', 'as', 'until', 'while', 'this', 'that', 'these',
            'those', 'what', 'which', 'who', 'whom', 'whose'
        }

        # Tokenize and filter
        words = re.findall(r'\b\w+\b', query.lower())
        terms = [w for w in words if w not in stop_words and len(w) > 2]

        return terms

    def _calculate_analytics(
        self,
        scores: List[EvidenceScore]
    ) -> Dict[str, Any]:
        """Calculate analytics for batch scoring"""
        if not scores:
            return {
                "total_scored": 0,
                "avg_confidence": 0.0,
                "high_confidence_count": 0,
                "requires_review_count": 0,
                "outdated_count": 0,
                "authority_distribution": {}
            }

        confidences = [s.confidence_score for s in scores]
        authorities = {}
        for s in scores:
            auth = s.source_authority.name
            authorities[auth] = authorities.get(auth, 0) + 1

        return {
            "total_scored": len(scores),
            "avg_confidence": sum(confidences) / len(confidences),
            "min_confidence": min(confidences),
            "max_confidence": max(confidences),
            "high_confidence_count": sum(1 for c in confidences if c >= self.high_confidence_threshold),
            "requires_review_count": sum(1 for s in scores if s.requires_review),
            "outdated_count": sum(1 for s in scores if s.is_outdated),
            "authority_distribution": authorities
        }


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_evidence_scoring_service: Optional[EvidenceScoringService] = None


def get_evidence_scoring_service() -> EvidenceScoringService:
    """Get or create evidence scoring service singleton"""
    global _evidence_scoring_service

    if _evidence_scoring_service is None:
        _evidence_scoring_service = EvidenceScoringService()

    return _evidence_scoring_service


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

async def score_rag_results(
    chunks: List[Dict[str, Any]],
    query: str,
    min_confidence: float = 0.50
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Score RAG results and return filtered, ranked evidence.

    Args:
        chunks: RAG retrieval results
        query: User query
        min_confidence: Minimum confidence threshold

    Returns:
        Tuple of (scored_chunks_as_dicts, analytics)
    """
    service = get_evidence_scoring_service()
    scores, analytics = service.score_evidence_batch(chunks, query, min_confidence)

    # Convert to dicts for serialization
    scored_dicts = [s.to_dict() for s in scores]

    return scored_dicts, analytics
