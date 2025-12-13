# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [resilience.exceptions]
# PHASE: M9 MEDIUM Priority
"""
M9 MEDIUM Priority: Research Quality Validation

Provides validation wrappers around research_quality.py with explicit
threshold enforcement and structured error reporting.

Key Features:
- Configurable quality thresholds per dimension
- Source credibility validation
- Confidence score validation (0-1 range)
- Quality gate enforcement with structured results

Usage:
    from langgraph_workflows.modes34.validation import (
        validate_research_quality,
        enforce_quality_gate,
        QualityThresholds,
    )

    # Validate confidence scores
    result = validate_confidence_scores(scores)
    if not result.passed:
        print(f"Failed: {result.errors}")

    # Enforce quality gate
    gate_result = enforce_quality_gate(
        response_data,
        thresholds=QualityThresholds(min_confidence=0.7),
    )
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional
import structlog

from ..resilience import ResearchQualityError

logger = structlog.get_logger(__name__)


# =============================================================================
# Quality Threshold Configuration
# =============================================================================


@dataclass
class QualityThresholds:
    """
    Configurable thresholds for research quality validation.

    All thresholds are 0.0-1.0 scales where higher is better.
    """
    # Confidence score thresholds
    min_confidence: float = 0.6
    min_source_credibility: float = 0.7
    min_evidence_coverage: float = 0.5
    min_recency_score: float = 0.4
    min_consistency_score: float = 0.6
    min_specificity_score: float = 0.5

    # Aggregate thresholds
    min_overall_score: float = 0.6
    min_race_score: float = 0.6  # Relevance, Accuracy, Completeness, Engagement
    min_fact_score: float = 0.6  # Factual grounding, Attribution, Coherence, Transparency

    # Source requirements
    min_sources: int = 1
    max_unverified_ratio: float = 0.3  # Max 30% unverified sources

    # Time thresholds (in days)
    max_source_age_days: int = 365 * 5  # 5 years default
    preferred_source_age_days: int = 365 * 2  # 2 years for high recency score

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for logging."""
        return {
            "min_confidence": self.min_confidence,
            "min_source_credibility": self.min_source_credibility,
            "min_evidence_coverage": self.min_evidence_coverage,
            "min_overall_score": self.min_overall_score,
            "min_sources": self.min_sources,
        }


# Default thresholds - balanced for production use
DEFAULT_QUALITY_THRESHOLDS = QualityThresholds()

# Strict thresholds - for high-stakes medical/regulatory content
STRICT_QUALITY_THRESHOLDS = QualityThresholds(
    min_confidence=0.8,
    min_source_credibility=0.85,
    min_evidence_coverage=0.7,
    min_overall_score=0.75,
    min_sources=3,
    max_unverified_ratio=0.1,
)

# Lenient thresholds - for exploratory/draft content
LENIENT_QUALITY_THRESHOLDS = QualityThresholds(
    min_confidence=0.4,
    min_source_credibility=0.5,
    min_evidence_coverage=0.3,
    min_overall_score=0.4,
    min_sources=0,
    max_unverified_ratio=0.5,
)


# =============================================================================
# Validation Results
# =============================================================================


class QualityDimension(str, Enum):
    """Quality dimensions being validated."""
    CONFIDENCE = "confidence"
    SOURCE_CREDIBILITY = "source_credibility"
    EVIDENCE_COVERAGE = "evidence_coverage"
    RECENCY = "recency"
    CONSISTENCY = "consistency"
    SPECIFICITY = "specificity"
    OVERALL = "overall"
    RACE = "race"
    FACT = "fact"
    SOURCE_COUNT = "source_count"
    VERIFICATION_RATIO = "verification_ratio"


@dataclass
class QualityValidationError:
    """Single quality validation error."""
    dimension: QualityDimension
    expected: float
    actual: float
    message: str
    severity: str = "error"  # error, warning


@dataclass
class QualityValidationResult:
    """Result of quality validation."""
    passed: bool
    score: float  # Overall quality score 0-1
    errors: List[QualityValidationError] = field(default_factory=list)
    warnings: List[QualityValidationError] = field(default_factory=list)
    dimension_scores: Dict[str, float] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "score": round(self.score, 3),
            "errors": [
                {"dimension": e.dimension.value, "expected": e.expected, "actual": e.actual, "message": e.message}
                for e in self.errors
            ],
            "warnings": [
                {"dimension": w.dimension.value, "expected": w.expected, "actual": w.actual, "message": w.message}
                for w in self.warnings
            ],
            "dimension_scores": {k: round(v, 3) for k, v in self.dimension_scores.items()},
        }


# =============================================================================
# Research Quality Validator
# =============================================================================


class ResearchQualityValidator:
    """
    Validator for research quality with configurable thresholds.

    Usage:
        validator = ResearchQualityValidator(thresholds=QualityThresholds(min_confidence=0.8))
        result = validator.validate(response_data)
    """

    def __init__(self, thresholds: Optional[QualityThresholds] = None):
        self.thresholds = thresholds or DEFAULT_QUALITY_THRESHOLDS

    def validate(self, response_data: Dict[str, Any]) -> QualityValidationResult:
        """
        Validate response data against quality thresholds.

        Args:
            response_data: Response with confidence, sources, metrics

        Returns:
            QualityValidationResult with pass/fail and details
        """
        errors: List[QualityValidationError] = []
        warnings: List[QualityValidationError] = []
        dimension_scores: Dict[str, float] = {}

        # Extract data
        confidence = response_data.get("confidence", 0.0)
        sources = response_data.get("sources", [])
        metrics = response_data.get("metrics", {})
        confidence_scores = response_data.get("confidence_scores", {})

        # Validate confidence
        dimension_scores["confidence"] = confidence
        if confidence < self.thresholds.min_confidence:
            errors.append(QualityValidationError(
                dimension=QualityDimension.CONFIDENCE,
                expected=self.thresholds.min_confidence,
                actual=confidence,
                message=f"Confidence {confidence:.2f} below threshold {self.thresholds.min_confidence:.2f}",
            ))

        # Validate source count
        source_count = len(sources) if isinstance(sources, list) else 0
        dimension_scores["source_count"] = min(source_count / max(self.thresholds.min_sources, 1), 1.0)
        if source_count < self.thresholds.min_sources:
            errors.append(QualityValidationError(
                dimension=QualityDimension.SOURCE_COUNT,
                expected=float(self.thresholds.min_sources),
                actual=float(source_count),
                message=f"Source count {source_count} below minimum {self.thresholds.min_sources}",
            ))

        # Validate confidence score dimensions if present
        if confidence_scores:
            self._validate_confidence_dimensions(
                confidence_scores, errors, warnings, dimension_scores
            )

        # Validate RACE/FACT metrics if present
        if metrics:
            self._validate_metrics(metrics, errors, warnings, dimension_scores)

        # Validate source verification ratio
        if sources:
            self._validate_source_verification(sources, errors, warnings, dimension_scores)

        # Calculate overall score
        overall_score = self._calculate_overall_score(dimension_scores)
        dimension_scores["overall"] = overall_score

        if overall_score < self.thresholds.min_overall_score:
            errors.append(QualityValidationError(
                dimension=QualityDimension.OVERALL,
                expected=self.thresholds.min_overall_score,
                actual=overall_score,
                message=f"Overall score {overall_score:.2f} below threshold {self.thresholds.min_overall_score:.2f}",
            ))

        passed = len(errors) == 0

        logger.info(
            "research_quality_validated",
            passed=passed,
            overall_score=round(overall_score, 3),
            error_count=len(errors),
            warning_count=len(warnings),
            phase="M9_research_quality",
        )

        return QualityValidationResult(
            passed=passed,
            score=overall_score,
            errors=errors,
            warnings=warnings,
            dimension_scores=dimension_scores,
            metadata={"thresholds": self.thresholds.to_dict()},
        )

    def _validate_confidence_dimensions(
        self,
        scores: Dict[str, Any],
        errors: List[QualityValidationError],
        warnings: List[QualityValidationError],
        dimension_scores: Dict[str, float],
    ) -> None:
        """Validate individual confidence score dimensions."""
        dimension_map = {
            "source_credibility": (QualityDimension.SOURCE_CREDIBILITY, self.thresholds.min_source_credibility),
            "evidence_coverage": (QualityDimension.EVIDENCE_COVERAGE, self.thresholds.min_evidence_coverage),
            "recency": (QualityDimension.RECENCY, self.thresholds.min_recency_score),
            "consistency": (QualityDimension.CONSISTENCY, self.thresholds.min_consistency_score),
            "specificity": (QualityDimension.SPECIFICITY, self.thresholds.min_specificity_score),
        }

        for key, (dimension, threshold) in dimension_map.items():
            value = scores.get(key, 0.0)
            if isinstance(value, (int, float)):
                dimension_scores[key] = value
                if value < threshold:
                    warnings.append(QualityValidationError(
                        dimension=dimension,
                        expected=threshold,
                        actual=value,
                        message=f"{key} score {value:.2f} below threshold {threshold:.2f}",
                        severity="warning",
                    ))

    def _validate_metrics(
        self,
        metrics: Dict[str, Any],
        errors: List[QualityValidationError],
        warnings: List[QualityValidationError],
        dimension_scores: Dict[str, float],
    ) -> None:
        """Validate RACE and FACT metrics."""
        race_score = metrics.get("race_score", 0.0)
        fact_score = metrics.get("fact_score", 0.0)

        if race_score:
            dimension_scores["race"] = race_score
            if race_score < self.thresholds.min_race_score:
                warnings.append(QualityValidationError(
                    dimension=QualityDimension.RACE,
                    expected=self.thresholds.min_race_score,
                    actual=race_score,
                    message=f"RACE score {race_score:.2f} below threshold {self.thresholds.min_race_score:.2f}",
                    severity="warning",
                ))

        if fact_score:
            dimension_scores["fact"] = fact_score
            if fact_score < self.thresholds.min_fact_score:
                warnings.append(QualityValidationError(
                    dimension=QualityDimension.FACT,
                    expected=self.thresholds.min_fact_score,
                    actual=fact_score,
                    message=f"FACT score {fact_score:.2f} below threshold {self.thresholds.min_fact_score:.2f}",
                    severity="warning",
                ))

    def _validate_source_verification(
        self,
        sources: List[Any],
        errors: List[QualityValidationError],
        warnings: List[QualityValidationError],
        dimension_scores: Dict[str, float],
    ) -> None:
        """Validate source verification ratio."""
        if not sources:
            return

        verified_count = sum(
            1 for s in sources
            if isinstance(s, dict) and s.get("verified", False)
        )
        total = len(sources)
        verification_ratio = verified_count / total if total > 0 else 0.0
        unverified_ratio = 1.0 - verification_ratio

        dimension_scores["verification_ratio"] = verification_ratio

        if unverified_ratio > self.thresholds.max_unverified_ratio:
            warnings.append(QualityValidationError(
                dimension=QualityDimension.VERIFICATION_RATIO,
                expected=1.0 - self.thresholds.max_unverified_ratio,
                actual=verification_ratio,
                message=f"Unverified source ratio {unverified_ratio:.0%} exceeds threshold {self.thresholds.max_unverified_ratio:.0%}",
                severity="warning",
            ))

    def _calculate_overall_score(self, dimension_scores: Dict[str, float]) -> float:
        """Calculate weighted overall score from dimensions."""
        weights = {
            "confidence": 0.25,
            "source_credibility": 0.20,
            "evidence_coverage": 0.15,
            "verification_ratio": 0.15,
            "recency": 0.10,
            "consistency": 0.10,
            "specificity": 0.05,
        }

        weighted_sum = 0.0
        weight_total = 0.0

        for key, weight in weights.items():
            if key in dimension_scores:
                weighted_sum += dimension_scores[key] * weight
                weight_total += weight

        if weight_total > 0:
            return weighted_sum / weight_total
        return dimension_scores.get("confidence", 0.0)


# =============================================================================
# Convenience Functions
# =============================================================================


def validate_research_quality(
    response_data: Dict[str, Any],
    thresholds: Optional[QualityThresholds] = None,
) -> QualityValidationResult:
    """
    Validate research quality of a response.

    Args:
        response_data: Response with confidence, sources, metrics
        thresholds: Optional custom thresholds

    Returns:
        QualityValidationResult
    """
    validator = ResearchQualityValidator(thresholds)
    return validator.validate(response_data)


def validate_confidence_scores(
    scores: Dict[str, float],
    thresholds: Optional[QualityThresholds] = None,
) -> QualityValidationResult:
    """
    Validate confidence scores dict directly.

    Args:
        scores: Dict with source_credibility, evidence_coverage, etc.
        thresholds: Optional custom thresholds

    Returns:
        QualityValidationResult
    """
    # Wrap scores in response format
    response_data = {
        "confidence": scores.get("overall", 0.0),
        "confidence_scores": scores,
    }
    return validate_research_quality(response_data, thresholds)


def validate_source_credibility(
    sources: List[Dict[str, Any]],
    min_credibility: float = 0.7,
) -> QualityValidationResult:
    """
    Validate source credibility scores.

    Args:
        sources: List of source dicts with credibility scores
        min_credibility: Minimum credibility threshold

    Returns:
        QualityValidationResult
    """
    errors: List[QualityValidationError] = []
    warnings: List[QualityValidationError] = []

    if not sources:
        return QualityValidationResult(
            passed=True,
            score=1.0,
            errors=[],
            warnings=[QualityValidationError(
                dimension=QualityDimension.SOURCE_COUNT,
                expected=1.0,
                actual=0.0,
                message="No sources to validate",
                severity="warning",
            )],
        )

    credibility_scores = []
    for i, source in enumerate(sources):
        credibility = source.get("credibility", source.get("reliability", 0.5))
        credibility_scores.append(credibility)

        if credibility < min_credibility:
            warnings.append(QualityValidationError(
                dimension=QualityDimension.SOURCE_CREDIBILITY,
                expected=min_credibility,
                actual=credibility,
                message=f"Source {i+1} credibility {credibility:.2f} below threshold",
                severity="warning",
            ))

    avg_credibility = sum(credibility_scores) / len(credibility_scores)
    passed = avg_credibility >= min_credibility

    return QualityValidationResult(
        passed=passed,
        score=avg_credibility,
        errors=errors,
        warnings=warnings,
        dimension_scores={"source_credibility": avg_credibility},
    )


def enforce_quality_gate(
    response_data: Dict[str, Any],
    thresholds: Optional[QualityThresholds] = None,
    raise_on_failure: bool = False,
) -> QualityValidationResult:
    """
    Enforce quality gate on response data.

    Args:
        response_data: Response with confidence, sources, metrics
        thresholds: Quality thresholds to enforce
        raise_on_failure: If True, raise ResearchQualityError on failure

    Returns:
        QualityValidationResult

    Raises:
        ResearchQualityError: If raise_on_failure and validation fails
    """
    result = validate_research_quality(response_data, thresholds)

    if not result.passed and raise_on_failure:
        first_error = result.errors[0] if result.errors else None
        raise ResearchQualityError(
            check_name=first_error.dimension.value if first_error else "quality_gate",
            threshold=first_error.expected if first_error else 0.0,
            actual_score=first_error.actual if first_error else result.score,
            details=first_error.message if first_error else "Quality gate failed",
        )

    logger.info(
        "quality_gate_enforced",
        passed=result.passed,
        score=round(result.score, 3),
        raise_on_failure=raise_on_failure,
        phase="M9_quality_gate",
    )

    return result


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    # Classes
    "ResearchQualityValidator",
    "QualityThresholds",
    "QualityValidationResult",
    "QualityValidationError",
    "QualityDimension",
    # Functions
    "validate_research_quality",
    "validate_confidence_scores",
    "validate_source_credibility",
    "enforce_quality_gate",
    # Constants
    "DEFAULT_QUALITY_THRESHOLDS",
    "STRICT_QUALITY_THRESHOLDS",
    "LENIENT_QUALITY_THRESHOLDS",
]
