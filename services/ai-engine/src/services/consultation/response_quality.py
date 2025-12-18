"""
Response Quality Service

Combines faithfulness scoring with evidence scoring to provide
comprehensive quality metrics for RAG responses.

This service evaluates:
1. Faithfulness: Is the response grounded in the retrieved context?
2. Evidence Quality: Are the sources authoritative and relevant?
3. Overall Quality: Combined quality score

Usage:
    quality_service = await get_response_quality_service()
    result = await quality_service.evaluate(
        response="Metformin is used for type 2 diabetes...",
        context=["Metformin is a first-line medication...", ...],
        query="What is metformin used for?"
    )
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import structlog

logger = structlog.get_logger()

# Conditional imports
try:
    from services.faithfulness_scorer import FaithfulnessScorer, FaithfulnessResult, get_faithfulness_scorer
    FAITHFULNESS_AVAILABLE = True
except ImportError:
    FAITHFULNESS_AVAILABLE = False
    FaithfulnessScorer = None
    FaithfulnessResult = None
    get_faithfulness_scorer = None

try:
    from services.evidence_scoring_service import EvidenceScoringService, get_evidence_scoring_service
    EVIDENCE_SCORING_AVAILABLE = True
except ImportError:
    EVIDENCE_SCORING_AVAILABLE = False
    EvidenceScoringService = None
    get_evidence_scoring_service = None


@dataclass
class ResponseQualityResult:
    """Combined quality assessment result"""
    # Overall
    overall_score: float  # 0.0 to 1.0
    quality_grade: str  # A, B, C, D, F

    # Faithfulness
    faithfulness_score: float
    hallucination_risk: str
    supported_claims: int
    unsupported_claims: int

    # Evidence (optional, if sources provided)
    evidence_score: Optional[float]
    high_confidence_sources: int
    low_confidence_sources: int

    # Flags
    requires_review: bool
    warnings: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "overall_score": round(self.overall_score, 3),
            "quality_grade": self.quality_grade,
            "faithfulness": {
                "score": round(self.faithfulness_score, 3),
                "hallucination_risk": self.hallucination_risk,
                "supported_claims": self.supported_claims,
                "unsupported_claims": self.unsupported_claims,
            },
            "evidence": {
                "score": round(self.evidence_score, 3) if self.evidence_score else None,
                "high_confidence": self.high_confidence_sources,
                "low_confidence": self.low_confidence_sources,
            },
            "requires_review": self.requires_review,
            "warnings": self.warnings,
        }


class ResponseQualityService:
    """
    Service for evaluating RAG response quality

    Combines faithfulness scoring (response grounding) with
    evidence scoring (source quality) for comprehensive assessment.
    """

    # Quality grade thresholds
    GRADE_THRESHOLDS = {
        "A": 0.85,  # Excellent - highly reliable
        "B": 0.70,  # Good - generally reliable
        "C": 0.55,  # Fair - use with caution
        "D": 0.40,  # Poor - significant concerns
        "F": 0.0,   # Failing - do not use
    }

    def __init__(self):
        self.faithfulness_scorer: Optional[FaithfulnessScorer] = None
        self.evidence_scorer: Optional[EvidenceScoringService] = None
        self._initialized = False

    async def initialize(self):
        """Initialize quality service components"""
        if self._initialized:
            return

        if FAITHFULNESS_AVAILABLE:
            try:
                self.faithfulness_scorer = await get_faithfulness_scorer()
                logger.info("faithfulness_scorer_initialized")
            except Exception as e:
                logger.warning("faithfulness_scorer_init_failed", error=str(e))

        if EVIDENCE_SCORING_AVAILABLE:
            try:
                self.evidence_scorer = get_evidence_scoring_service()
                logger.info("evidence_scorer_initialized")
            except Exception as e:
                logger.warning("evidence_scorer_init_failed", error=str(e))

        self._initialized = True

    async def evaluate(
        self,
        response: str,
        context: List[str],
        query: Optional[str] = None,
        sources: Optional[List[Dict[str, Any]]] = None,
    ) -> ResponseQualityResult:
        """
        Evaluate the quality of a RAG response

        Args:
            response: The LLM-generated response text
            context: List of context strings used to generate response
            query: Original user query (optional)
            sources: Source metadata for evidence scoring (optional)

        Returns:
            ResponseQualityResult with combined quality metrics
        """
        if not self._initialized:
            await self.initialize()

        warnings = []

        # Faithfulness scoring
        faithfulness_score = 1.0
        hallucination_risk = "low"
        supported_claims = 0
        unsupported_claims = 0

        if self.faithfulness_scorer and response and context:
            try:
                faithfulness_result = await self.faithfulness_scorer.score(
                    response=response,
                    context=context,
                    query=query
                )
                faithfulness_score = faithfulness_result.score
                hallucination_risk = faithfulness_result.hallucination_risk
                supported_claims = faithfulness_result.supported_claims
                unsupported_claims = faithfulness_result.unsupported_claims

                if hallucination_risk == "high":
                    warnings.append("High hallucination risk detected")
                elif hallucination_risk == "medium":
                    warnings.append("Some claims not grounded in context")

            except Exception as e:
                logger.warning("faithfulness_scoring_failed", error=str(e))
                warnings.append("Faithfulness scoring unavailable")
        else:
            if not context:
                warnings.append("No context provided for faithfulness check")

        # Evidence scoring (if sources provided)
        evidence_score = None
        high_confidence = 0
        low_confidence = 0

        if self.evidence_scorer and sources and query:
            try:
                scored, analytics = self.evidence_scorer.score_evidence_batch(
                    chunks=sources,
                    query=query,
                    min_confidence=0.0
                )
                evidence_score = analytics.get("avg_confidence", 0.0)
                high_confidence = analytics.get("high_confidence_count", 0)
                low_confidence = analytics.get("requires_review_count", 0)

                if evidence_score < 0.5:
                    warnings.append("Low evidence quality")

            except Exception as e:
                logger.warning("evidence_scoring_failed", error=str(e))

        # Calculate overall score
        if evidence_score is not None:
            # Weight: 60% faithfulness, 40% evidence
            overall_score = (faithfulness_score * 0.6) + (evidence_score * 0.4)
        else:
            # Only faithfulness available
            overall_score = faithfulness_score

        # Determine grade
        quality_grade = "F"
        for grade, threshold in self.GRADE_THRESHOLDS.items():
            if overall_score >= threshold:
                quality_grade = grade
                break

        # Determine if review is needed
        requires_review = (
            hallucination_risk == "high"
            or overall_score < 0.5
            or unsupported_claims > supported_claims
        )

        result = ResponseQualityResult(
            overall_score=overall_score,
            quality_grade=quality_grade,
            faithfulness_score=faithfulness_score,
            hallucination_risk=hallucination_risk,
            supported_claims=supported_claims,
            unsupported_claims=unsupported_claims,
            evidence_score=evidence_score,
            high_confidence_sources=high_confidence,
            low_confidence_sources=low_confidence,
            requires_review=requires_review,
            warnings=warnings,
        )

        logger.info(
            "response_quality_evaluated",
            overall_score=overall_score,
            grade=quality_grade,
            faithfulness=faithfulness_score,
            hallucination_risk=hallucination_risk,
            requires_review=requires_review
        )

        return result


# Singleton instance
_response_quality_service: Optional[ResponseQualityService] = None


async def get_response_quality_service() -> ResponseQualityService:
    """Get or create response quality service singleton"""
    global _response_quality_service

    if _response_quality_service is None:
        _response_quality_service = ResponseQualityService()
        await _response_quality_service.initialize()

    return _response_quality_service


# Convenience function for quick evaluation
async def evaluate_response_quality(
    response: str,
    context: List[str],
    query: Optional[str] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Quick evaluation of response quality

    Returns dict with quality metrics suitable for API responses.
    """
    service = await get_response_quality_service()
    result = await service.evaluate(response, context, query, sources)
    return result.to_dict()
