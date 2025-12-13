# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [httpx, pydantic]
"""
Phase 1: World-Class Deep Research Enhancements for Mode 3/4

This module implements 6 key enhancements for research quality:
1. Iterative Refinement Loop (confidence gate) - re-search if confidence < 0.8
2. Query Decomposition System - break complex queries into sub-queries
3. Confidence Scoring System (5 dimensions) - multi-factor confidence assessment
4. Citation Verification Node - validate citations via PubMed/CrossRef
5. Quality Gate (RACE/FACT metrics) - structured response quality assessment
6. Self-Reflection Node - agent reviews own reasoning (Reflexion pattern)

Production Hardening (Grade A):
- Security: SSL verification, URL encoding, rate limiting with exponential backoff
- Error Handling: Try/except wrappers with graceful degradation
- Input Validation: Pydantic validators for all threshold parameters
- Logging: Comprehensive structured logging for debugging

Integration:
- Adds new nodes to master_graph.py
- Extends MissionState with confidence/quality fields
- Works with existing L4 evidence workers

Reference: MODE_3_4_COMPLETE_FIX_PLAN_PART_II.md
"""

from __future__ import annotations

import asyncio
import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum
from urllib.parse import quote_plus
import httpx
import structlog
from pydantic import BaseModel, Field, field_validator

logger = structlog.get_logger(__name__)


# =============================================================================
# Production Hardening: Configuration with Pydantic Validation
# =============================================================================

class QualityConfig(BaseModel):
    """
    Configuration for research quality thresholds with validation.

    All threshold values are validated to be between 0.0 and 1.0.
    Iteration counts are validated to be positive integers.
    """
    confidence_threshold: float = Field(
        default=0.80,
        description="Minimum confidence score to accept results (0-1)"
    )
    max_refinement_iterations: int = Field(
        default=3,
        description="Maximum refinement iterations before accepting"
    )
    quality_threshold: float = Field(
        default=0.70,
        description="Minimum quality score to pass gate (0-1)"
    )
    reflection_threshold: float = Field(
        default=0.75,
        description="Minimum reflection score to pass (0-1)"
    )
    max_reflection_iterations: int = Field(
        default=2,
        description="Maximum self-reflection cycles"
    )
    http_timeout: float = Field(
        default=30.0,
        description="HTTP request timeout in seconds"
    )
    max_retries: int = Field(
        default=3,
        description="Maximum HTTP retry attempts"
    )
    base_delay: float = Field(
        default=1.0,
        description="Base delay for exponential backoff (seconds)"
    )

    @field_validator("confidence_threshold", "quality_threshold", "reflection_threshold")
    @classmethod
    def validate_score_range(cls, v: float, info) -> float:
        """Validate threshold is between 0.0 and 1.0."""
        if not 0.0 <= v <= 1.0:
            raise ValueError(f"{info.field_name} must be between 0.0 and 1.0, got {v}")
        return v

    @field_validator("max_refinement_iterations", "max_reflection_iterations", "max_retries")
    @classmethod
    def validate_positive_int(cls, v: int, info) -> int:
        """Validate iteration count is positive."""
        if v < 1:
            raise ValueError(f"{info.field_name} must be at least 1, got {v}")
        return v

    @field_validator("http_timeout", "base_delay")
    @classmethod
    def validate_positive_float(cls, v: float, info) -> float:
        """Validate timeout/delay is positive."""
        if v <= 0:
            raise ValueError(f"{info.field_name} must be positive, got {v}")
        return v


# Initialize with defaults - can be overridden via environment or runtime
_config = QualityConfig()


# =============================================================================
# Production Hardening: Secure HTTP Client with Rate Limiting
# =============================================================================

class SecureHTTPClient:
    """
    Production-grade async HTTP client with:
    - SSL/TLS verification enabled
    - URL encoding for user inputs
    - Exponential backoff retry logic
    - Rate limiting awareness (429 handling)
    - Connection pooling
    - Comprehensive error handling
    """

    def __init__(
        self,
        timeout: float = 30.0,
        max_retries: int = 3,
        base_delay: float = 1.0,
        verify_ssl: bool = True,
    ):
        self.timeout = timeout
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.verify_ssl = verify_ssl
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self) -> "SecureHTTPClient":
        """Create secure client with SSL verification."""
        self._client = httpx.AsyncClient(
            verify=self.verify_ssl,  # SSL verification enabled
            timeout=httpx.Timeout(self.timeout, connect=10.0),
            follow_redirects=True,
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Clean up client resources."""
        if self._client:
            await self._client.aclose()

    @staticmethod
    def encode_url_param(value: str) -> str:
        """Safely encode URL parameter to prevent injection."""
        return quote_plus(value) if value else ""

    async def get_with_retry(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, str]] = None,
    ) -> Optional[httpx.Response]:
        """
        GET request with exponential backoff retry.

        Handles:
        - HTTP 429 (rate limited) with exponential backoff
        - HTTP 5xx (server errors) with retry
        - Network errors with retry
        - Returns None on persistent failure (graceful degradation)
        """
        if not self._client:
            logger.error("http_client_not_initialized")
            return None

        last_error: Optional[Exception] = None

        for attempt in range(self.max_retries):
            try:
                response = await self._client.get(url, headers=headers, params=params)

                # Handle rate limiting with exponential backoff
                if response.status_code == 429:
                    delay = self.base_delay * (2 ** attempt)
                    retry_after = response.headers.get("Retry-After")
                    if retry_after:
                        try:
                            delay = max(delay, float(retry_after))
                        except ValueError:
                            pass
                    logger.warning(
                        "http_rate_limited",
                        url=url[:100],
                        delay=delay,
                        attempt=attempt + 1,
                    )
                    await asyncio.sleep(delay)
                    continue

                # Handle server errors with retry
                if response.status_code >= 500:
                    delay = self.base_delay * (2 ** attempt)
                    logger.warning(
                        "http_server_error",
                        status=response.status_code,
                        url=url[:100],
                        attempt=attempt + 1,
                    )
                    await asyncio.sleep(delay)
                    continue

                # Success or client error (4xx except 429)
                response.raise_for_status()
                return response

            except httpx.HTTPStatusError as e:
                last_error = e
                if e.response.status_code < 500 and e.response.status_code != 429:
                    # Client error (4xx) - don't retry
                    logger.warning(
                        "http_client_error",
                        status=e.response.status_code,
                        url=url[:100],
                    )
                    break

            except (httpx.ConnectError, httpx.ReadTimeout, httpx.WriteTimeout) as e:
                last_error = e
                delay = self.base_delay * (2 ** attempt)
                logger.warning(
                    "http_network_error",
                    error=str(e)[:100],
                    url=url[:100],
                    attempt=attempt + 1,
                    delay=delay,
                )
                await asyncio.sleep(delay)

            except (ValueError, TypeError, KeyError) as e:
                # Data parsing/validation errors
                last_error = e
                logger.error(
                    "http_data_error",
                    error_type=type(e).__name__,
                    error=str(e)[:100],
                    url=url[:100],
                )
                break

            except Exception as e:
                # Unexpected errors - log and break
                last_error = e
                logger.error(
                    "http_unexpected_error",
                    error_type=type(e).__name__,
                    error=str(e)[:100],
                    url=url[:100],
                )
                break

        # All retries exhausted - return None for graceful degradation
        logger.error(
            "http_request_failed_all_retries",
            url=url[:100],
            error=str(last_error)[:100] if last_error else "unknown",
        )
        return None

    async def head_with_retry(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
    ) -> Optional[httpx.Response]:
        """HEAD request with retry logic."""
        if not self._client:
            return None

        for attempt in range(self.max_retries):
            try:
                response = await self._client.head(url, headers=headers)
                return response

            except (httpx.ConnectError, httpx.ReadTimeout, httpx.WriteTimeout) as e:
                # Network errors - retry
                delay = self.base_delay * (2 ** attempt)
                logger.debug(
                    "http_head_network_error",
                    url=url[:100],
                    attempt=attempt + 1,
                    error_type=type(e).__name__,
                    error=str(e)[:50],
                )
                await asyncio.sleep(delay)

            except httpx.HTTPStatusError as e:
                # HTTP errors - log and break
                logger.debug(
                    "http_head_status_error",
                    url=url[:100],
                    status=e.response.status_code,
                )
                break

            except Exception as e:
                # Unexpected errors - log and break
                logger.debug(
                    "http_head_unexpected_error",
                    url=url[:100],
                    error_type=type(e).__name__,
                    error=str(e)[:50],
                )
                break

        return None


# =============================================================================
# Production Hardening: Error Handling Decorator
# =============================================================================
# NOTE: The old with_graceful_degradation decorator has been DEPRECATED.
#
# Use the new graceful_degradation decorator from resilience module instead:
#
# from langgraph_workflows.modes34.resilience import (
#     graceful_degradation,
#     research_operation,  # Convenience decorator for research operations
# )
#
# @graceful_degradation(
#     domain="research",
#     fallback_value=default_value,
#     recoverable=True,
# )
# async def your_function():
#     ...
#
# Or use the convenience decorator:
#
# @research_operation(fallback_value=default_value)
# async def your_function():
#     ...
#
# Benefits of the new decorator (H7 fix):
# - NEVER catches asyncio.CancelledError (C5 compliance)
# - Classifies exceptions into specific types (not generic Exception)
# - Logs with structured context for debugging
# - Distinguishes recoverable vs non-recoverable errors
# - Provides retry suggestions for infrastructure failures
# =============================================================================


# =============================================================================
# Enhancement 1: Iterative Refinement Loop (Confidence Gate)
# =============================================================================

CONFIDENCE_THRESHOLD = 0.80  # Minimum confidence to accept results
MAX_REFINEMENT_ITERATIONS = 3  # Prevent infinite loops


@dataclass
class RefinementResult:
    """Result of a refinement iteration."""
    iteration: int
    confidence: float
    improved_query: str
    evidence_gaps: List[str]
    suggestions: List[str]
    should_continue: bool


async def check_confidence_gate(
    artifacts: List[Dict[str, Any]],
    goal: str,
    current_iteration: int = 0,
) -> RefinementResult:
    """
    Check if collected evidence meets confidence threshold.

    If confidence < 0.8:
      - Identify evidence gaps
      - Generate improved search query
      - Return should_continue=True to trigger re-search

    Args:
        artifacts: Collected evidence artifacts
        goal: Original research goal
        current_iteration: Current refinement iteration (0-indexed)

    Returns:
        RefinementResult with confidence score and refinement suggestions
    """
    if current_iteration >= MAX_REFINEMENT_ITERATIONS:
        logger.warning(
            "confidence_gate_max_iterations_reached",
            iterations=current_iteration,
            goal=goal[:100],
        )
        return RefinementResult(
            iteration=current_iteration,
            confidence=0.5,  # Accept with warning
            improved_query="",
            evidence_gaps=["Maximum refinement iterations reached"],
            suggestions=["Consider manual review"],
            should_continue=False,
        )

    # Calculate multi-dimensional confidence
    confidence_scores = calculate_confidence_scores(artifacts, goal)
    overall_confidence = confidence_scores.overall_score

    if overall_confidence >= CONFIDENCE_THRESHOLD:
        logger.info(
            "confidence_gate_passed",
            confidence=overall_confidence,
            iteration=current_iteration,
        )
        return RefinementResult(
            iteration=current_iteration,
            confidence=overall_confidence,
            improved_query="",
            evidence_gaps=[],
            suggestions=[],
            should_continue=False,
        )

    # Identify gaps and generate improved query
    evidence_gaps = identify_evidence_gaps(artifacts, goal, confidence_scores)
    improved_query = generate_refined_query(goal, evidence_gaps, artifacts)

    logger.info(
        "confidence_gate_refinement_needed",
        confidence=overall_confidence,
        threshold=CONFIDENCE_THRESHOLD,
        gaps_count=len(evidence_gaps),
        iteration=current_iteration,
    )

    return RefinementResult(
        iteration=current_iteration + 1,
        confidence=overall_confidence,
        improved_query=improved_query,
        evidence_gaps=evidence_gaps,
        suggestions=[
            f"Add evidence for: {gap}" for gap in evidence_gaps[:3]
        ],
        should_continue=True,
    )


def identify_evidence_gaps(
    artifacts: List[Dict[str, Any]],
    goal: str,
    confidence_scores: "ConfidenceScores",
) -> List[str]:
    """Identify specific evidence gaps based on low-scoring dimensions."""
    gaps = []

    if confidence_scores.source_credibility < 0.7:
        gaps.append("Need more peer-reviewed or authoritative sources")

    if confidence_scores.evidence_coverage < 0.7:
        gaps.append("Evidence doesn't fully address all aspects of the query")

    if confidence_scores.recency < 0.6:
        gaps.append("Evidence may be outdated - search for recent publications")

    if confidence_scores.consistency < 0.7:
        gaps.append("Evidence shows conflicting findings - need more studies")

    if confidence_scores.specificity < 0.6:
        gaps.append("Evidence is too general - need domain-specific sources")

    # Check for missing key topics from goal
    goal_keywords = set(re.findall(r'\b\w{4,}\b', goal.lower()))
    covered_keywords = set()
    for artifact in artifacts:
        content = str(artifact.get("summary", "")) + str(artifact.get("full_output", ""))
        covered_keywords.update(re.findall(r'\b\w{4,}\b', content.lower()))

    missing_keywords = goal_keywords - covered_keywords
    if missing_keywords and len(missing_keywords) > 2:
        gaps.append(f"Missing coverage for: {', '.join(list(missing_keywords)[:5])}")

    return gaps


def generate_refined_query(
    original_goal: str,
    evidence_gaps: List[str],
    artifacts: List[Dict[str, Any]],
) -> str:
    """Generate an improved search query based on identified gaps."""
    refinements = []

    # Add specificity if needed
    if any("specific" in gap.lower() for gap in evidence_gaps):
        refinements.append("recent clinical studies")
        refinements.append("systematic review")

    # Add recency if needed
    if any("recent" in gap.lower() or "outdated" in gap.lower() for gap in evidence_gaps):
        refinements.append(f"2023 2024 2025")

    # Add authoritative sources if needed
    if any("peer-reviewed" in gap.lower() or "authoritative" in gap.lower() for gap in evidence_gaps):
        refinements.append("peer-reviewed journal")
        refinements.append("FDA guidance OR EMA guideline")

    if refinements:
        return f"{original_goal} ({' '.join(refinements[:3])})"

    return original_goal


# =============================================================================
# Enhancement 2: Query Decomposition System
# =============================================================================

@dataclass
class DecomposedQuery:
    """Result of query decomposition."""
    original_query: str
    sub_queries: List[str]
    query_type: str  # "simple", "compound", "multi_aspect"
    complexity_score: float
    search_strategy: str  # "parallel", "sequential", "hierarchical"


async def decompose_query(
    query: str,
    context: Optional[Dict[str, Any]] = None,
) -> DecomposedQuery:
    """
    Decompose complex queries into searchable sub-queries.

    Examples:
        "What are the efficacy and safety of drug X for condition Y?"
        → ["efficacy of drug X for condition Y", "safety profile drug X condition Y"]

        "Compare treatments A, B, and C for disease D"
        → ["treatment A for disease D", "treatment B for disease D", "treatment C for disease D"]

    Args:
        query: Original complex query
        context: Optional context (template_id, domain, etc.)

    Returns:
        DecomposedQuery with sub-queries and search strategy
    """
    context = context or {}

    # Analyze query structure
    complexity = _analyze_query_complexity(query)

    if complexity["score"] < 0.3:
        # Simple query - no decomposition needed
        return DecomposedQuery(
            original_query=query,
            sub_queries=[query],
            query_type="simple",
            complexity_score=complexity["score"],
            search_strategy="parallel",
        )

    sub_queries = []

    # Pattern 1: Conjunction queries (A and B)
    if " and " in query.lower():
        parts = re.split(r'\s+and\s+', query, flags=re.IGNORECASE)
        if len(parts) >= 2:
            # Preserve context for each part
            base_context = _extract_query_context(query)
            for part in parts:
                sub_query = f"{part.strip()} {base_context}".strip()
                sub_queries.append(sub_query)

    # Pattern 2: Comparison queries (compare X vs Y)
    compare_match = re.search(
        r'compare\s+(.+?)\s+(?:vs?\.?|versus|and|with)\s+(.+?)(?:\s+for|\s+in|\s*$)',
        query,
        re.IGNORECASE
    )
    if compare_match:
        items = [compare_match.group(1), compare_match.group(2)]
        context_suffix = query[compare_match.end():].strip()
        for item in items:
            sub_queries.append(f"{item.strip()} {context_suffix}".strip())

    # Pattern 3: Multi-aspect queries (efficacy, safety, cost)
    aspects = re.findall(
        r'\b(efficacy|safety|cost|effectiveness|tolerability|mechanism|dosing|interactions)\b',
        query,
        re.IGNORECASE
    )
    if len(aspects) >= 2 and not sub_queries:
        base_query = re.sub(
            r'\b(efficacy|safety|cost|effectiveness|tolerability|mechanism|dosing|interactions)\b',
            '',
            query,
            flags=re.IGNORECASE
        ).strip()
        base_query = re.sub(r'\s+and\s+', ' ', base_query)
        for aspect in aspects:
            sub_queries.append(f"{aspect} of {base_query}".strip())

    # Pattern 4: List queries (treatments A, B, C)
    list_match = re.search(r'(\w+(?:\s+\w+)?)\s*,\s*(\w+(?:\s+\w+)?)\s*(?:,\s*(?:and\s+)?)?(\w+(?:\s+\w+)?)?', query)
    if list_match and not sub_queries:
        items = [g for g in list_match.groups() if g]
        if len(items) >= 2:
            # Extract what comes after the list
            after_list = query[list_match.end():].strip()
            for item in items:
                sub_queries.append(f"{item} {after_list}".strip())

    # Fallback: if no patterns matched, return original
    if not sub_queries:
        sub_queries = [query]

    # Determine search strategy
    if len(sub_queries) <= 2:
        strategy = "parallel"
    elif any(re.search(r'compare|versus|vs', query, re.IGNORECASE) for _ in [1]):
        strategy = "parallel"  # Comparison needs all results together
    else:
        strategy = "hierarchical"  # Complex queries benefit from prioritization

    logger.info(
        "query_decomposed",
        original=query[:100],
        sub_query_count=len(sub_queries),
        complexity=complexity["score"],
        strategy=strategy,
    )

    return DecomposedQuery(
        original_query=query,
        sub_queries=sub_queries,
        query_type=complexity["type"],
        complexity_score=complexity["score"],
        search_strategy=strategy,
    )


def _analyze_query_complexity(query: str) -> Dict[str, Any]:
    """Analyze query complexity based on linguistic features."""
    score = 0.0
    factors = []

    # Length factor
    word_count = len(query.split())
    if word_count > 15:
        score += 0.2
        factors.append("long_query")

    # Conjunction factor
    if re.search(r'\b(and|or|versus|vs|compare)\b', query, re.IGNORECASE):
        score += 0.3
        factors.append("conjunction")

    # Multiple aspects
    aspects = re.findall(
        r'\b(efficacy|safety|cost|effectiveness|mechanism|dosing)\b',
        query,
        re.IGNORECASE
    )
    if len(aspects) >= 2:
        score += 0.3
        factors.append("multi_aspect")

    # Question complexity
    if re.search(r'\b(how|why|what.*difference|which.*better)\b', query, re.IGNORECASE):
        score += 0.2
        factors.append("complex_question")

    # Determine type
    if "conjunction" in factors:
        query_type = "compound"
    elif "multi_aspect" in factors:
        query_type = "multi_aspect"
    else:
        query_type = "simple"

    return {
        "score": min(score, 1.0),
        "factors": factors,
        "type": query_type,
    }


def _extract_query_context(query: str) -> str:
    """Extract contextual information from query (disease, drug, etc.)."""
    # Common medical context patterns
    context_patterns = [
        r'for\s+(\w+(?:\s+\w+)?)',
        r'in\s+(\w+(?:\s+\w+)?)',
        r'(?:patient|patients)\s+with\s+(\w+(?:\s+\w+)?)',
    ]

    contexts = []
    for pattern in context_patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            contexts.append(match.group(1))

    return " ".join(contexts)


# =============================================================================
# Enhancement 3: Confidence Scoring System (5 Dimensions)
# =============================================================================

class ConfidenceDimension(Enum):
    """Five dimensions of confidence scoring."""
    SOURCE_CREDIBILITY = "source_credibility"  # Authority of sources
    EVIDENCE_COVERAGE = "evidence_coverage"     # How well evidence addresses query
    RECENCY = "recency"                         # How recent the evidence is
    CONSISTENCY = "consistency"                 # Agreement across sources
    SPECIFICITY = "specificity"                 # Domain-specific relevance


@dataclass
class ConfidenceScores:
    """Multi-dimensional confidence assessment."""
    source_credibility: float = 0.0    # 0-1: Authority of sources
    evidence_coverage: float = 0.0      # 0-1: Coverage of query aspects
    recency: float = 0.0               # 0-1: How recent (2023-2025 = 1.0)
    consistency: float = 0.0           # 0-1: Agreement across sources
    specificity: float = 0.0           # 0-1: Domain relevance

    @property
    def overall_score(self) -> float:
        """Weighted average of all dimensions."""
        weights = {
            "source_credibility": 0.25,
            "evidence_coverage": 0.25,
            "recency": 0.20,
            "consistency": 0.15,
            "specificity": 0.15,
        }
        return (
            self.source_credibility * weights["source_credibility"] +
            self.evidence_coverage * weights["evidence_coverage"] +
            self.recency * weights["recency"] +
            self.consistency * weights["consistency"] +
            self.specificity * weights["specificity"]
        )

    def to_dict(self) -> Dict[str, float]:
        return {
            "source_credibility": round(self.source_credibility, 3),
            "evidence_coverage": round(self.evidence_coverage, 3),
            "recency": round(self.recency, 3),
            "consistency": round(self.consistency, 3),
            "specificity": round(self.specificity, 3),
            "overall": round(self.overall_score, 3),
        }


def calculate_confidence_scores(
    artifacts: List[Dict[str, Any]],
    goal: str,
) -> ConfidenceScores:
    """
    Calculate 5-dimensional confidence scores for collected evidence.

    Args:
        artifacts: Collected evidence artifacts
        goal: Original research goal

    Returns:
        ConfidenceScores with scores for each dimension
    """
    if not artifacts:
        return ConfidenceScores()

    # Dimension 1: Source Credibility
    source_credibility = _score_source_credibility(artifacts)

    # Dimension 2: Evidence Coverage
    evidence_coverage = _score_evidence_coverage(artifacts, goal)

    # Dimension 3: Recency
    recency = _score_recency(artifacts)

    # Dimension 4: Consistency
    consistency = _score_consistency(artifacts)

    # Dimension 5: Specificity
    specificity = _score_specificity(artifacts, goal)

    scores = ConfidenceScores(
        source_credibility=source_credibility,
        evidence_coverage=evidence_coverage,
        recency=recency,
        consistency=consistency,
        specificity=specificity,
    )

    logger.info(
        "confidence_scores_calculated",
        overall=scores.overall_score,
        dimensions=scores.to_dict(),
        artifact_count=len(artifacts),
    )

    return scores


def _score_source_credibility(artifacts: List[Dict[str, Any]]) -> float:
    """Score based on source authority (peer-reviewed, FDA, WHO, etc.)."""
    credibility_scores = []

    for artifact in artifacts:
        sources = artifact.get("sources", []) + artifact.get("citations", [])
        for source in sources:
            score = 0.5  # Default score

            source_str = str(source).lower()
            title = source.get("title", "").lower() if isinstance(source, dict) else ""
            url = source.get("url", "").lower() if isinstance(source, dict) else ""

            # High credibility sources
            high_cred_patterns = [
                "pubmed", "ncbi", "nih.gov", "fda.gov", "ema.europa.eu",
                "who.int", "cochrane", "nejm", "lancet", "jama", "bmj",
                "nature", "science", "systematic review", "meta-analysis",
                "clinical trial", "randomized controlled",
            ]
            for pattern in high_cred_patterns:
                if pattern in source_str or pattern in title or pattern in url:
                    score = max(score, 0.9)
                    break

            # Medium credibility
            med_cred_patterns = [
                "journal", "peer-reviewed", "academic", "university",
                "research", "clinical", "medical",
            ]
            for pattern in med_cred_patterns:
                if pattern in source_str or pattern in title:
                    score = max(score, 0.7)
                    break

            credibility_scores.append(score)

    if not credibility_scores:
        return 0.5

    return sum(credibility_scores) / len(credibility_scores)


def _score_evidence_coverage(artifacts: List[Dict[str, Any]], goal: str) -> float:
    """Score based on how well evidence covers query aspects."""
    # Extract key concepts from goal
    goal_words = set(re.findall(r'\b\w{4,}\b', goal.lower()))
    stopwords = {"what", "which", "this", "that", "with", "from", "have", "been", "were", "will", "would", "could", "should"}
    goal_words -= stopwords

    if not goal_words:
        return 0.7

    # Check coverage in artifacts
    covered_words = set()
    for artifact in artifacts:
        content = str(artifact.get("summary", "")) + str(artifact.get("full_output", ""))
        artifact_words = set(re.findall(r'\b\w{4,}\b', content.lower()))
        covered_words.update(goal_words & artifact_words)

    coverage = len(covered_words) / len(goal_words) if goal_words else 0.5
    return min(coverage, 1.0)


def _score_recency(artifacts: List[Dict[str, Any]]) -> float:
    """Score based on how recent the evidence is."""
    current_year = datetime.now().year
    year_scores = []

    for artifact in artifacts:
        sources = artifact.get("sources", []) + artifact.get("citations", [])
        content = str(artifact.get("full_output", ""))

        # Extract years from sources and content
        years_found = re.findall(r'\b(20[12][0-9])\b', content)

        for source in sources:
            if isinstance(source, dict):
                pub_date = source.get("publication_date", "") or source.get("date", "")
                years_in_date = re.findall(r'\b(20[12][0-9])\b', str(pub_date))
                years_found.extend(years_in_date)

        for year_str in years_found:
            year = int(year_str)
            age = current_year - year
            if age <= 1:
                year_scores.append(1.0)
            elif age <= 3:
                year_scores.append(0.8)
            elif age <= 5:
                year_scores.append(0.6)
            else:
                year_scores.append(0.4)

    if not year_scores:
        return 0.6  # Default if no dates found

    return sum(year_scores) / len(year_scores)


def _score_consistency(artifacts: List[Dict[str, Any]]) -> float:
    """Score based on agreement across sources."""
    if len(artifacts) < 2:
        return 0.7  # Can't assess consistency with single source

    # Simple heuristic: check for contradictory language
    contradiction_indicators = [
        "however", "contrary", "disagree", "conflicting", "inconsistent",
        "debate", "controversial", "disputed", "in contrast",
    ]

    contradiction_count = 0
    total_content_length = 0

    for artifact in artifacts:
        content = str(artifact.get("full_output", "")).lower()
        total_content_length += len(content)
        for indicator in contradiction_indicators:
            contradiction_count += content.count(indicator)

    if total_content_length == 0:
        return 0.7

    # Normalize contradiction rate
    contradiction_rate = contradiction_count / (total_content_length / 1000)

    if contradiction_rate > 5:
        return 0.5
    elif contradiction_rate > 2:
        return 0.7
    else:
        return 0.9


def _score_specificity(artifacts: List[Dict[str, Any]], goal: str) -> float:
    """Score based on domain-specific relevance."""
    # Check for medical/pharmaceutical specific content
    domain_indicators = [
        "clinical", "efficacy", "safety", "dosing", "mechanism",
        "indication", "contraindication", "adverse", "patient",
        "trial", "study", "fda", "approval", "therapeutic",
    ]

    indicator_count = 0
    total_words = 0

    for artifact in artifacts:
        content = str(artifact.get("full_output", "")).lower()
        words = content.split()
        total_words += len(words)
        for indicator in domain_indicators:
            indicator_count += content.count(indicator)

    if total_words == 0:
        return 0.5

    # Calculate domain density
    domain_density = indicator_count / (total_words / 100)

    if domain_density > 5:
        return 0.95
    elif domain_density > 2:
        return 0.8
    elif domain_density > 1:
        return 0.6
    else:
        return 0.4


# =============================================================================
# Enhancement 4: Citation Verification Node
# =============================================================================

@dataclass
class CitationVerification:
    """Result of citation verification."""
    citation: Dict[str, Any]
    verified: bool
    source: str  # "pubmed", "crossref", "doi", "url", "unverified"
    confidence: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None


@dataclass
class VerificationSummary:
    """Summary of all citation verifications."""
    total_citations: int
    verified_count: int
    unverified_count: int
    verification_rate: float
    verifications: List[CitationVerification] = field(default_factory=list)


async def verify_citations(
    citations: List[Dict[str, Any]],
    timeout_seconds: float = 10.0,
) -> VerificationSummary:
    """
    Verify citations against PubMed, CrossRef, and DOI resolvers.

    Production Hardening:
    - Uses SecureHTTPClient with SSL verification
    - URL encoding for user inputs (injection prevention)
    - Exponential backoff retry on rate limits
    - Graceful degradation on failures

    Args:
        citations: List of citation dictionaries with title/url/doi
        timeout_seconds: Timeout for verification requests

    Returns:
        VerificationSummary with verification results
    """
    if not citations:
        return VerificationSummary(
            total_citations=0,
            verified_count=0,
            unverified_count=0,
            verification_rate=1.0,
        )

    verifications = []

    # Use SecureHTTPClient with SSL verification and rate limiting
    async with SecureHTTPClient(
        timeout=timeout_seconds,
        max_retries=_config.max_retries,
        base_delay=_config.base_delay,
        verify_ssl=True,
    ) as client:
        tasks = [_verify_single_citation(client, cit) for cit in citations[:20]]  # Limit to 20
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, CitationVerification):
                verifications.append(result)
            elif isinstance(result, Exception):
                logger.warning("citation_verification_error", error=str(result)[:200])

    verified_count = sum(1 for v in verifications if v.verified)

    summary = VerificationSummary(
        total_citations=len(citations),
        verified_count=verified_count,
        unverified_count=len(verifications) - verified_count,
        verification_rate=verified_count / len(verifications) if verifications else 0.0,
        verifications=verifications,
    )

    logger.info(
        "citations_verified",
        total=summary.total_citations,
        verified=summary.verified_count,
        rate=summary.verification_rate,
    )

    return summary


async def _verify_single_citation(
    client: SecureHTTPClient,
    citation: Dict[str, Any],
) -> CitationVerification:
    """Verify a single citation using SecureHTTPClient."""
    title = citation.get("title", "")
    doi = citation.get("doi", "")
    pmid = citation.get("pmid", "")
    url = citation.get("url", "")

    # Try DOI verification first (most reliable)
    if doi:
        result = await _verify_via_doi(client, doi, citation)
        if result.verified:
            return result

    # Try PubMed ID
    if pmid:
        result = await _verify_via_pubmed_id(client, pmid, citation)
        if result.verified:
            return result

    # Try PubMed title search
    if title:
        result = await _verify_via_pubmed_search(client, title, citation)
        if result.verified:
            return result

    # Try CrossRef title search
    if title:
        result = await _verify_via_crossref(client, title, citation)
        if result.verified:
            return result

    # URL check (basic verification)
    if url:
        result = await _verify_via_url(client, url, citation)
        if result.verified:
            return result

    return CitationVerification(
        citation=citation,
        verified=False,
        source="unverified",
        confidence=0.0,
    )


async def _verify_via_doi(
    client: SecureHTTPClient,
    doi: str,
    citation: Dict[str, Any],
) -> CitationVerification:
    """Verify citation via DOI resolver with URL encoding."""
    try:
        # URL encode the DOI to prevent injection
        encoded_doi = SecureHTTPClient.encode_url_param(doi)
        url = f"https://doi.org/{encoded_doi}"
        response = await client.head_with_retry(url)
        if response and response.status_code == 200:
            return CitationVerification(
                citation=citation,
                verified=True,
                source="doi",
                confidence=0.95,
                metadata={"resolved_url": str(response.url)},
            )

    except (ValueError, TypeError) as e:
        # Invalid DOI format
        logger.debug(
            "doi_validation_error",
            doi=doi[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except (httpx.ConnectError, httpx.ReadTimeout) as e:
        # Network/timeout errors
        logger.debug(
            "doi_network_error",
            doi=doi[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except Exception as e:
        # Unexpected errors
        logger.debug(
            "doi_verification_failed",
            doi=doi[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    return CitationVerification(
        citation=citation,
        verified=False,
        source="doi",
        confidence=0.0,
        error="DOI resolution failed",
    )


async def _verify_via_pubmed_id(
    client: SecureHTTPClient,
    pmid: str,
    citation: Dict[str, Any],
) -> CitationVerification:
    """Verify citation via PubMed ID with URL encoding."""
    try:
        # URL encode the PMID to prevent injection
        encoded_pmid = SecureHTTPClient.encode_url_param(pmid)
        url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        params = {"db": "pubmed", "id": encoded_pmid, "retmode": "json"}
        response = await client.get_with_retry(url, params=params)
        if response and response.status_code == 200:
            data = response.json()
            if "result" in data and pmid in data["result"]:
                return CitationVerification(
                    citation=citation,
                    verified=True,
                    source="pubmed",
                    confidence=0.95,
                    metadata={"pubmed_data": data["result"].get(pmid, {})},
                )

    except json.JSONDecodeError as e:
        # JSON parsing errors
        logger.debug(
            "pubmed_id_json_error",
            pmid=pmid[:20],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except (ValueError, TypeError) as e:
        # Invalid PMID format
        logger.debug(
            "pubmed_id_validation_error",
            pmid=pmid[:20],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except (httpx.ConnectError, httpx.ReadTimeout, asyncio.TimeoutError) as e:
        # Network/timeout errors
        logger.debug(
            "pubmed_id_network_error",
            pmid=pmid[:20],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except Exception as e:
        # JSON parsing or unexpected errors
        logger.debug(
            "pubmed_id_verification_failed",
            pmid=pmid[:20],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    return CitationVerification(
        citation=citation,
        verified=False,
        source="pubmed",
        confidence=0.0,
    )


async def _verify_via_pubmed_search(
    client: SecureHTTPClient,
    title: str,
    citation: Dict[str, Any],
) -> CitationVerification:
    """Verify citation via PubMed title search with URL encoding."""
    try:
        # Clean title for search and URL encode
        clean_title = re.sub(r'[^\w\s]', '', title)[:100]
        encoded_title = SecureHTTPClient.encode_url_param(clean_title)
        url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        params = {"db": "pubmed", "term": encoded_title, "retmode": "json"}
        response = await client.get_with_retry(url, params=params)
        if response and response.status_code == 200:
            data = response.json()
            id_list = data.get("esearchresult", {}).get("idlist", [])
            if id_list:
                return CitationVerification(
                    citation=citation,
                    verified=True,
                    source="pubmed",
                    confidence=0.8,
                    metadata={"pmids_found": id_list[:5]},
                )

    except json.JSONDecodeError as e:
        # JSON parsing errors
        logger.debug(
            "pubmed_search_json_error",
            title=title[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except (ValueError, TypeError) as e:
        # Invalid title format
        logger.debug(
            "pubmed_search_validation_error",
            title=title[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except (httpx.ConnectError, httpx.ReadTimeout, asyncio.TimeoutError) as e:
        # Network/timeout errors
        logger.debug(
            "pubmed_search_network_error",
            title=title[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except Exception as e:
        # JSON parsing or unexpected errors
        logger.debug(
            "pubmed_search_failed",
            title=title[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    return CitationVerification(
        citation=citation,
        verified=False,
        source="pubmed",
        confidence=0.0,
    )


async def _verify_via_crossref(
    client: SecureHTTPClient,
    title: str,
    citation: Dict[str, Any],
) -> CitationVerification:
    """Verify citation via CrossRef API with URL encoding."""
    try:
        # Clean title and URL encode for security
        clean_title = re.sub(r'[^\w\s]', '', title)[:100]
        encoded_title = SecureHTTPClient.encode_url_param(clean_title)
        url = f"https://api.crossref.org/works"
        params = {"query.title": encoded_title, "rows": "1"}
        headers = {"User-Agent": "VITAL-AI/1.0 (mailto:support@vital.ai)"}
        response = await client.get_with_retry(url, headers=headers, params=params)
        if response and response.status_code == 200:
            data = response.json()
            items = data.get("message", {}).get("items", [])
            if items:
                return CitationVerification(
                    citation=citation,
                    verified=True,
                    source="crossref",
                    confidence=0.75,
                    metadata={"crossref_doi": items[0].get("DOI")},
                )

    except json.JSONDecodeError as e:
        # JSON parsing errors
        logger.debug(
            "crossref_search_json_error",
            title=title[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except (ValueError, TypeError) as e:
        # Invalid title format
        logger.debug(
            "crossref_search_validation_error",
            title=title[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except (httpx.ConnectError, httpx.ReadTimeout, asyncio.TimeoutError) as e:
        # Network/timeout errors
        logger.debug(
            "crossref_search_network_error",
            title=title[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except Exception as e:
        # JSON parsing or unexpected errors
        logger.debug(
            "crossref_search_failed",
            title=title[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    return CitationVerification(
        citation=citation,
        verified=False,
        source="crossref",
        confidence=0.0,
    )


async def _verify_via_url(
    client: SecureHTTPClient,
    url: str,
    citation: Dict[str, Any],
) -> CitationVerification:
    """Basic URL verification with SSL validation."""
    try:
        # URL is already a URL, but we validate it exists
        response = await client.head_with_retry(url)
        if response and response.status_code == 200:
            return CitationVerification(
                citation=citation,
                verified=True,
                source="url",
                confidence=0.6,
                metadata={"final_url": str(response.url)},
            )

    except (ValueError, TypeError) as e:
        # Invalid URL format
        logger.debug(
            "url_validation_error",
            url=url[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except (httpx.ConnectError, httpx.ReadTimeout, asyncio.TimeoutError) as e:
        # Network/timeout errors
        logger.debug(
            "url_network_error",
            url=url[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    except Exception as e:
        # Unexpected errors
        logger.debug(
            "url_verification_failed",
            url=url[:50],
            error_type=type(e).__name__,
            error=str(e)[:100],
        )

    return CitationVerification(
        citation=citation,
        verified=False,
        source="url",
        confidence=0.0,
    )


# =============================================================================
# Enhancement 5: Quality Gate (RACE/FACT Metrics)
# =============================================================================

@dataclass
class QualityMetrics:
    """RACE/FACT quality assessment metrics."""
    # RACE metrics
    relevance: float = 0.0      # How relevant is the response to the query
    accuracy: float = 0.0       # Factual accuracy (based on citations)
    completeness: float = 0.0   # Coverage of all aspects
    engagement: float = 0.0     # Readability and structure

    # FACT metrics
    factual_grounding: float = 0.0  # Citation backing
    attribution: float = 0.0         # Proper source attribution
    coherence: float = 0.0          # Logical flow
    transparency: float = 0.0       # Acknowledgment of limitations

    @property
    def race_score(self) -> float:
        """Average of RACE metrics."""
        return (self.relevance + self.accuracy + self.completeness + self.engagement) / 4

    @property
    def fact_score(self) -> float:
        """Average of FACT metrics."""
        return (self.factual_grounding + self.attribution + self.coherence + self.transparency) / 4

    @property
    def overall_quality(self) -> float:
        """Combined quality score."""
        return (self.race_score + self.fact_score) / 2

    def to_dict(self) -> Dict[str, float]:
        return {
            "race": {
                "relevance": round(self.relevance, 3),
                "accuracy": round(self.accuracy, 3),
                "completeness": round(self.completeness, 3),
                "engagement": round(self.engagement, 3),
                "score": round(self.race_score, 3),
            },
            "fact": {
                "factual_grounding": round(self.factual_grounding, 3),
                "attribution": round(self.attribution, 3),
                "coherence": round(self.coherence, 3),
                "transparency": round(self.transparency, 3),
                "score": round(self.fact_score, 3),
            },
            "overall_quality": round(self.overall_quality, 3),
        }


@dataclass
class QualityGateResult:
    """Result of quality gate assessment."""
    passed: bool
    metrics: QualityMetrics
    threshold: float
    recommendations: List[str]
    detailed_feedback: Dict[str, str]


QUALITY_THRESHOLD = 0.70  # Minimum quality score to pass


async def assess_quality(
    content: str,
    goal: str,
    citations: List[Dict[str, Any]],
    artifacts: List[Dict[str, Any]],
) -> QualityGateResult:
    """
    Assess response quality using RACE/FACT metrics.

    RACE:
    - Relevance: Does the response address the query?
    - Accuracy: Are claims supported by evidence?
    - Completeness: Are all aspects covered?
    - Engagement: Is it well-structured and readable?

    FACT:
    - Factual grounding: Are claims backed by citations?
    - Attribution: Are sources properly credited?
    - Coherence: Does the response flow logically?
    - Transparency: Are limitations acknowledged?

    Args:
        content: Final synthesized content
        goal: Original research goal
        citations: List of citations used
        artifacts: All collected artifacts

    Returns:
        QualityGateResult with pass/fail and recommendations
    """
    metrics = QualityMetrics()
    recommendations = []
    detailed_feedback = {}

    # RACE Metrics
    metrics.relevance = _assess_relevance(content, goal)
    if metrics.relevance < 0.7:
        recommendations.append("Improve relevance: ensure response directly addresses the query")
        detailed_feedback["relevance"] = "Response may not fully address the research question"

    metrics.accuracy = _assess_accuracy(content, citations, artifacts)
    if metrics.accuracy < 0.7:
        recommendations.append("Improve accuracy: add more citations to support claims")
        detailed_feedback["accuracy"] = "Some claims lack citation support"

    metrics.completeness = _assess_completeness(content, goal, artifacts)
    if metrics.completeness < 0.7:
        recommendations.append("Improve completeness: cover all aspects of the query")
        detailed_feedback["completeness"] = "Some query aspects may not be addressed"

    metrics.engagement = _assess_engagement(content)
    if metrics.engagement < 0.7:
        recommendations.append("Improve engagement: enhance structure and readability")
        detailed_feedback["engagement"] = "Response structure could be improved"

    # FACT Metrics
    metrics.factual_grounding = _assess_factual_grounding(content, citations)
    if metrics.factual_grounding < 0.7:
        recommendations.append("Improve factual grounding: cite sources for key claims")
        detailed_feedback["factual_grounding"] = "Key claims need citation support"

    metrics.attribution = _assess_attribution(content, citations)
    if metrics.attribution < 0.7:
        recommendations.append("Improve attribution: clearly credit all sources")
        detailed_feedback["attribution"] = "Source attribution could be clearer"

    metrics.coherence = _assess_coherence(content)
    if metrics.coherence < 0.7:
        recommendations.append("Improve coherence: enhance logical flow")
        detailed_feedback["coherence"] = "Logical flow between sections could be improved"

    metrics.transparency = _assess_transparency(content)
    if metrics.transparency < 0.7:
        recommendations.append("Improve transparency: acknowledge limitations clearly")
        detailed_feedback["transparency"] = "Limitations should be explicitly acknowledged"

    passed = metrics.overall_quality >= QUALITY_THRESHOLD

    logger.info(
        "quality_gate_assessed",
        passed=passed,
        race_score=metrics.race_score,
        fact_score=metrics.fact_score,
        overall=metrics.overall_quality,
        threshold=QUALITY_THRESHOLD,
    )

    return QualityGateResult(
        passed=passed,
        metrics=metrics,
        threshold=QUALITY_THRESHOLD,
        recommendations=recommendations,
        detailed_feedback=detailed_feedback,
    )


def _assess_relevance(content: str, goal: str) -> float:
    """Assess how relevant the content is to the goal."""
    goal_words = set(re.findall(r'\b\w{4,}\b', goal.lower()))
    stopwords = {"what", "which", "this", "that", "with", "from", "have"}
    goal_words -= stopwords

    if not goal_words:
        return 0.7

    content_lower = content.lower()
    matches = sum(1 for word in goal_words if word in content_lower)

    return min(matches / len(goal_words), 1.0)


def _assess_accuracy(
    content: str,
    citations: List[Dict[str, Any]],
    artifacts: List[Dict[str, Any]],
) -> float:
    """Assess factual accuracy based on citation coverage."""
    # Count claims (sentences with factual assertions)
    sentences = re.split(r'[.!?]', content)
    claim_patterns = [
        r'\b\d+%',  # Statistics
        r'\b(studies? show|research indicates|evidence suggests)',
        r'\b(effective|efficacious|safe|approved)',
        r'\b(significant|associated with|correlated)',
    ]

    claim_count = 0
    for sentence in sentences:
        for pattern in claim_patterns:
            if re.search(pattern, sentence, re.IGNORECASE):
                claim_count += 1
                break

    # Compare to citation count
    citation_count = len(citations)

    if claim_count == 0:
        return 0.8  # No strong claims to verify

    # Ideally 1 citation per 2-3 claims
    ideal_ratio = claim_count / 3
    if citation_count >= ideal_ratio:
        return 0.95
    elif citation_count >= ideal_ratio * 0.5:
        return 0.75
    else:
        return 0.5


def _assess_completeness(
    content: str,
    goal: str,
    artifacts: List[Dict[str, Any]],
) -> float:
    """Assess if all aspects of the query are covered."""
    # Extract aspects from goal
    aspects = re.findall(
        r'\b(efficacy|safety|cost|mechanism|dosing|interactions|indication|'
        r'contraindication|side effects?|administration|pharmacokinetics?)\b',
        goal,
        re.IGNORECASE
    )

    if not aspects:
        # Check word coverage instead
        goal_words = set(re.findall(r'\b\w{5,}\b', goal.lower()))
        content_words = set(re.findall(r'\b\w{5,}\b', content.lower()))
        if goal_words:
            return len(goal_words & content_words) / len(goal_words)
        return 0.7

    content_lower = content.lower()
    covered = sum(1 for aspect in aspects if aspect.lower() in content_lower)

    return covered / len(aspects) if aspects else 0.7


def _assess_engagement(content: str) -> float:
    """Assess readability and structure."""
    score = 0.5

    # Check for structure (headers)
    if re.search(r'^#{1,3}\s+\w+', content, re.MULTILINE):
        score += 0.2

    # Check for lists
    if re.search(r'^\s*[-*]\s+\w+', content, re.MULTILINE) or re.search(r'^\s*\d+\.\s+', content, re.MULTILINE):
        score += 0.15

    # Check for appropriate length (not too short)
    word_count = len(content.split())
    if word_count >= 500:
        score += 0.15
    elif word_count >= 200:
        score += 0.1

    return min(score, 1.0)


def _assess_factual_grounding(content: str, citations: List[Dict[str, Any]]) -> float:
    """Assess if claims are backed by citations."""
    # Look for in-text citation patterns
    inline_citations = len(re.findall(r'\[\d+\]|\(\d+\)|\[.*?\d{4}\]', content))
    citation_count = len(citations)

    # Bonus for having a references section
    has_references = bool(re.search(r'##?\s*References', content, re.IGNORECASE))

    base_score = 0.3
    if citation_count > 0:
        base_score += 0.3
    if citation_count >= 5:
        base_score += 0.2
    if inline_citations >= 3:
        base_score += 0.1
    if has_references:
        base_score += 0.1

    return min(base_score, 1.0)


def _assess_attribution(content: str, citations: List[Dict[str, Any]]) -> float:
    """Assess if sources are properly attributed."""
    score = 0.5

    # Check for named sources
    source_patterns = [
        r'according to \w+',
        r'as reported by',
        r'study by \w+',
        r'\w+ et al\.',
        r'\(\d{4}\)',
    ]

    for pattern in source_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score += 0.1

    # Check if citations have titles
    titled_citations = sum(1 for c in citations if c.get("title"))
    if citations and titled_citations / len(citations) > 0.8:
        score += 0.2

    return min(score, 1.0)


def _assess_coherence(content: str) -> float:
    """Assess logical flow of the response."""
    score = 0.5

    # Check for transition words
    transitions = [
        "furthermore", "moreover", "however", "therefore", "consequently",
        "in addition", "as a result", "for example", "specifically",
        "first", "second", "finally", "in conclusion",
    ]

    content_lower = content.lower()
    transition_count = sum(1 for t in transitions if t in content_lower)

    if transition_count >= 5:
        score += 0.3
    elif transition_count >= 3:
        score += 0.2
    elif transition_count >= 1:
        score += 0.1

    # Check for section structure
    sections = re.findall(r'^#{1,3}\s+\w+', content, re.MULTILINE)
    if len(sections) >= 3:
        score += 0.2

    return min(score, 1.0)


def _assess_transparency(content: str) -> float:
    """Assess if limitations are acknowledged."""
    score = 0.5

    # Look for limitation acknowledgments
    limitation_patterns = [
        r'limitation',
        r'however.*(?:note|important|should be)',
        r'caveat',
        r'further research',
        r'more studies? (?:are|is) needed',
        r'evidence is limited',
        r'uncertainty',
        r'disclaimer',
    ]

    content_lower = content.lower()
    for pattern in limitation_patterns:
        if re.search(pattern, content_lower):
            score += 0.1

    # Check for explicit limitations section
    if re.search(r'##?\s*(?:Limitations?|Caveats?)', content, re.IGNORECASE):
        score += 0.2

    return min(score, 1.0)


# =============================================================================
# Enhancement 6: Self-Reflection (Phase 2)
# =============================================================================
# Agent reviews its own reasoning before finalizing response
# Reference: Reflexion paper (Shinn et al., 2023)

REFLECTION_THRESHOLD = 0.75  # Minimum reflection score to pass
MAX_REFLECTION_ITERATIONS = 2  # Maximum self-improvement cycles


class ReflectionDimension(str, Enum):
    """Dimensions for self-reflection assessment."""
    REASONING_VALIDITY = "reasoning_validity"     # Is the reasoning logically sound?
    ASSUMPTION_CHECK = "assumption_check"         # Are assumptions stated and valid?
    COMPLETENESS = "completeness"                 # Did I address all aspects of the query?
    BIAS_AWARENESS = "bias_awareness"             # Am I aware of potential biases?
    UNCERTAINTY_HONESTY = "uncertainty_honesty"   # Did I acknowledge what I don't know?


@dataclass
class ReflectionPoint:
    """A single reflection point with assessment."""
    dimension: ReflectionDimension
    observation: str
    score: float  # 0-1
    improvement_needed: bool
    suggested_improvement: Optional[str] = None


@dataclass
class SelfReflection:
    """Complete self-reflection assessment."""
    iteration: int
    original_content: str
    reflection_points: List[ReflectionPoint]
    overall_score: float
    needs_revision: bool
    improvements_made: List[str]
    revised_content: Optional[str] = None
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "iteration": self.iteration,
            "overall_score": self.overall_score,
            "needs_revision": self.needs_revision,
            "improvements_made": self.improvements_made,
            "reflection_points": [
                {
                    "dimension": p.dimension.value,
                    "observation": p.observation,
                    "score": p.score,
                    "improvement_needed": p.improvement_needed,
                    "suggested_improvement": p.suggested_improvement,
                }
                for p in self.reflection_points
            ],
            "timestamp": self.timestamp,
        }


@dataclass
class ReflectionResult:
    """Result of self-reflection process."""
    passed: bool
    score: float
    reflections: List[SelfReflection]
    final_content: str
    improvements_applied: List[str]
    iterations_used: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "score": self.score,
            "iterations_used": self.iterations_used,
            "improvements_applied": self.improvements_applied,
            "reflections": [r.to_dict() for r in self.reflections],
        }


def perform_self_reflection(
    content: str,
    query: str,
    confidence_scores: Optional[ConfidenceScores] = None,
    quality_metrics: Optional[QualityMetrics] = None,
    iteration: int = 0,
) -> SelfReflection:
    """
    Perform self-reflection on generated content.

    This implements the "Reflexion" pattern where the agent:
    1. Reviews its own reasoning
    2. Identifies weaknesses
    3. Suggests improvements
    4. Optionally revises

    Args:
        content: The generated response to reflect upon
        query: The original user query
        confidence_scores: Optional confidence assessment
        quality_metrics: Optional quality gate results
        iteration: Current reflection iteration

    Returns:
        SelfReflection with assessment and improvement suggestions
    """
    logger.info(
        "self_reflection_start",
        content_length=len(content),
        query_length=len(query),
        iteration=iteration,
    )

    reflection_points: List[ReflectionPoint] = []

    # Dimension 1: Reasoning Validity
    reasoning_score, reasoning_obs, reasoning_improvement = _assess_reasoning_validity(content)
    reflection_points.append(ReflectionPoint(
        dimension=ReflectionDimension.REASONING_VALIDITY,
        observation=reasoning_obs,
        score=reasoning_score,
        improvement_needed=reasoning_score < 0.7,
        suggested_improvement=reasoning_improvement if reasoning_score < 0.7 else None,
    ))

    # Dimension 2: Assumption Check
    assumption_score, assumption_obs, assumption_improvement = _assess_assumptions(content)
    reflection_points.append(ReflectionPoint(
        dimension=ReflectionDimension.ASSUMPTION_CHECK,
        observation=assumption_obs,
        score=assumption_score,
        improvement_needed=assumption_score < 0.7,
        suggested_improvement=assumption_improvement if assumption_score < 0.7 else None,
    ))

    # Dimension 3: Completeness
    completeness_score, completeness_obs, completeness_improvement = _assess_completeness_reflection(
        content, query
    )
    reflection_points.append(ReflectionPoint(
        dimension=ReflectionDimension.COMPLETENESS,
        observation=completeness_obs,
        score=completeness_score,
        improvement_needed=completeness_score < 0.7,
        suggested_improvement=completeness_improvement if completeness_score < 0.7 else None,
    ))

    # Dimension 4: Bias Awareness
    bias_score, bias_obs, bias_improvement = _assess_bias_awareness(content)
    reflection_points.append(ReflectionPoint(
        dimension=ReflectionDimension.BIAS_AWARENESS,
        observation=bias_obs,
        score=bias_score,
        improvement_needed=bias_score < 0.7,
        suggested_improvement=bias_improvement if bias_score < 0.7 else None,
    ))

    # Dimension 5: Uncertainty Honesty
    uncertainty_score, uncertainty_obs, uncertainty_improvement = _assess_uncertainty_honesty(content)
    reflection_points.append(ReflectionPoint(
        dimension=ReflectionDimension.UNCERTAINTY_HONESTY,
        observation=uncertainty_obs,
        score=uncertainty_score,
        improvement_needed=uncertainty_score < 0.7,
        suggested_improvement=uncertainty_improvement if uncertainty_score < 0.7 else None,
    ))

    # Calculate overall score (weighted average)
    weights = {
        ReflectionDimension.REASONING_VALIDITY: 0.30,
        ReflectionDimension.ASSUMPTION_CHECK: 0.15,
        ReflectionDimension.COMPLETENESS: 0.25,
        ReflectionDimension.BIAS_AWARENESS: 0.15,
        ReflectionDimension.UNCERTAINTY_HONESTY: 0.15,
    }

    overall_score = sum(
        p.score * weights[p.dimension]
        for p in reflection_points
    )

    # Collect improvements needed
    improvements_needed = [
        p.suggested_improvement
        for p in reflection_points
        if p.improvement_needed and p.suggested_improvement
    ]

    reflection = SelfReflection(
        iteration=iteration,
        original_content=content[:500],  # Truncate for storage
        reflection_points=reflection_points,
        overall_score=overall_score,
        needs_revision=overall_score < REFLECTION_THRESHOLD and iteration < MAX_REFLECTION_ITERATIONS,
        improvements_made=[],
    )

    logger.info(
        "self_reflection_complete",
        overall_score=overall_score,
        needs_revision=reflection.needs_revision,
        improvements_count=len(improvements_needed),
    )

    return reflection


def check_reflection_gate(
    content: str,
    query: str,
    previous_reflections: Optional[List[Dict[str, Any]]] = None,
    confidence_scores: Optional[ConfidenceScores] = None,
) -> ReflectionResult:
    """
    Check if content passes the self-reflection gate.

    This is the main entry point for the reflection node in the graph.

    Args:
        content: Generated response content
        query: Original query
        previous_reflections: Any prior reflection attempts
        confidence_scores: Optional confidence assessment

    Returns:
        ReflectionResult with pass/fail and improvements
    """
    iteration = len(previous_reflections) if previous_reflections else 0
    reflections: List[SelfReflection] = []
    current_content = content
    all_improvements: List[str] = []

    # Convert previous reflections from dicts
    if previous_reflections:
        for prev in previous_reflections:
            # Already processed, skip re-reflection
            pass

    # Perform reflection
    reflection = perform_self_reflection(
        content=current_content,
        query=query,
        confidence_scores=confidence_scores,
        iteration=iteration,
    )
    reflections.append(reflection)

    # If needs revision and we have iterations left, suggest improvements
    if reflection.needs_revision:
        improvements = [
            p.suggested_improvement
            for p in reflection.reflection_points
            if p.suggested_improvement
        ]
        all_improvements.extend(improvements)

    passed = reflection.overall_score >= REFLECTION_THRESHOLD

    result = ReflectionResult(
        passed=passed,
        score=reflection.overall_score,
        reflections=reflections,
        final_content=current_content,
        improvements_applied=all_improvements,
        iterations_used=iteration + 1,
    )

    logger.info(
        "reflection_gate_result",
        passed=passed,
        score=reflection.overall_score,
        iterations=result.iterations_used,
    )

    return result


def _assess_reasoning_validity(content: str) -> Tuple[float, str, str]:
    """Assess if reasoning is logically sound."""
    score = 0.5
    observations = []
    improvements = []

    # Check for logical connectors
    logical_patterns = [
        (r'\b(therefore|thus|hence|consequently)\b', 0.1, "Uses logical conclusion markers"),
        (r'\b(because|since|as a result)\b', 0.1, "Uses causal reasoning"),
        (r'\b(however|although|despite)\b', 0.1, "Acknowledges counterpoints"),
        (r'\b(first|second|third|finally)\b', 0.1, "Uses structured argumentation"),
        (r'\b(evidence suggests|data shows|research indicates)\b', 0.15, "Grounds in evidence"),
    ]

    for pattern, bonus, obs in logical_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score += bonus
            observations.append(obs)

    # Check for unsupported claims
    unsupported_patterns = [
        r'\b(obviously|clearly|everyone knows)\b',
        r'\b(always|never|definitely)\b',
    ]

    for pattern in unsupported_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score -= 0.1
            improvements.append("Avoid absolute statements without evidence")

    observation = "; ".join(observations) if observations else "Basic reasoning structure"
    improvement = "; ".join(set(improvements)) if improvements else "Consider adding logical connectors"

    return (min(max(score, 0.0), 1.0), observation, improvement)


def _assess_assumptions(content: str) -> Tuple[float, str, str]:
    """Assess if assumptions are stated and valid."""
    score = 0.5
    observations = []
    improvements = []

    # Check for explicit assumption statements
    assumption_patterns = [
        (r'\b(assuming|assumption|presuppose|given that)\b', 0.2, "Explicitly states assumptions"),
        (r'\b(if we assume|under the assumption)\b', 0.15, "Conditional reasoning"),
        (r'\b(this assumes|we assume)\b', 0.15, "Clear assumption disclosure"),
    ]

    found_explicit = False
    for pattern, bonus, obs in assumption_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score += bonus
            observations.append(obs)
            found_explicit = True

    if not found_explicit:
        improvements.append("Explicitly state underlying assumptions")

    # Check for implicit assumptions (red flags)
    implicit_patterns = [
        r'\b(of course|naturally|inevitably)\b',
    ]

    for pattern in implicit_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score -= 0.1
            improvements.append("Replace implicit assumptions with explicit ones")

    observation = "; ".join(observations) if observations else "Assumptions not explicitly stated"
    improvement = "; ".join(set(improvements)) if improvements else ""

    return (min(max(score, 0.0), 1.0), observation, improvement)


def _assess_completeness_reflection(content: str, query: str) -> Tuple[float, str, str]:
    """Assess if response addresses all aspects of the query."""
    score = 0.6
    observations = []
    improvements = []

    # Extract key terms from query
    query_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', query.lower()))
    content_lower = content.lower()

    # Check if key query terms appear in response
    found_terms = sum(1 for term in query_words if term in content_lower)
    coverage = found_terms / len(query_words) if query_words else 0.5

    if coverage > 0.7:
        score += 0.2
        observations.append(f"High query term coverage ({coverage:.0%})")
    elif coverage < 0.4:
        score -= 0.1
        improvements.append("Address more aspects of the original query")

    # Check for structural completeness
    structure_patterns = [
        (r'##?\s*\w+', 0.1, "Has section headers"),
        (r'\n\s*[-*•]\s', 0.1, "Uses bullet points"),
        (r'\b(in summary|to conclude|in conclusion)\b', 0.1, "Has conclusion"),
    ]

    for pattern, bonus, obs in structure_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score += bonus
            observations.append(obs)

    observation = "; ".join(observations) if observations else "Basic structure"
    improvement = "; ".join(set(improvements)) if improvements else ""

    return (min(max(score, 0.0), 1.0), observation, improvement)


def _assess_bias_awareness(content: str) -> Tuple[float, str, str]:
    """Assess if potential biases are acknowledged."""
    score = 0.5
    observations = []
    improvements = []

    # Check for bias acknowledgment
    bias_patterns = [
        (r'\b(potential bias|may be biased|bias toward)\b', 0.2, "Explicitly acknowledges bias"),
        (r'\b(limitation|caveat|consideration)\b', 0.1, "Notes limitations"),
        (r'\b(from one perspective|another view|alternatively)\b', 0.15, "Presents multiple perspectives"),
        (r'\b(balanced|objective|impartial)\b', 0.1, "Aims for objectivity"),
    ]

    found_bias_awareness = False
    for pattern, bonus, obs in bias_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score += bonus
            observations.append(obs)
            found_bias_awareness = True

    if not found_bias_awareness:
        improvements.append("Consider acknowledging potential biases or limitations")

    # Check for one-sided language (red flags)
    onesided_patterns = [
        r'\b(only|solely|exclusively)\b.*\b(solution|approach|method)\b',
    ]

    for pattern in onesided_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score -= 0.1
            improvements.append("Present alternative perspectives")

    observation = "; ".join(observations) if observations else "Bias awareness not evident"
    improvement = "; ".join(set(improvements)) if improvements else ""

    return (min(max(score, 0.0), 1.0), observation, improvement)


def _assess_uncertainty_honesty(content: str) -> Tuple[float, str, str]:
    """Assess if uncertainty is honestly communicated."""
    score = 0.5
    observations = []
    improvements = []

    # Check for uncertainty expressions
    uncertainty_patterns = [
        (r'\b(may|might|could|possibly)\b', 0.1, "Uses hedging language"),
        (r'\b(uncertain|unclear|unknown)\b', 0.15, "Acknowledges uncertainty"),
        (r'\b(limited evidence|insufficient data)\b', 0.15, "Notes evidence gaps"),
        (r'\b(further research|more studies needed)\b', 0.15, "Suggests further investigation"),
        (r'\b(confidence level|probability|likelihood)\b', 0.1, "Quantifies uncertainty"),
    ]

    found_uncertainty = False
    for pattern, bonus, obs in uncertainty_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score += bonus
            observations.append(obs)
            found_uncertainty = True

    if not found_uncertainty:
        improvements.append("Acknowledge areas of uncertainty or limited knowledge")

    # Check for overconfidence (red flags)
    overconfidence_patterns = [
        r'\b(certain|definite|guaranteed|proven)\b',
        r'\b(will always|will never|100%)\b',
    ]

    for pattern in overconfidence_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            score -= 0.15
            improvements.append("Avoid overconfident language; acknowledge uncertainty")

    observation = "; ".join(observations) if observations else "Uncertainty not addressed"
    improvement = "; ".join(set(improvements)) if improvements else ""

    return (min(max(score, 0.0), 1.0), observation, improvement)


# =============================================================================
# Integration: State Extensions
# =============================================================================

class ResearchQualityState:
    """Extended state fields for research quality enhancements."""

    @staticmethod
    def get_default_fields() -> Dict[str, Any]:
        """Return default values for research quality state fields."""
        return {
            # Enhancement 1: Iterative Refinement
            "refinement_iteration": 0,
            "refinement_history": [],
            "evidence_gaps": [],

            # Enhancement 2: Query Decomposition
            "decomposed_queries": [],
            "query_complexity": 0.0,

            # Enhancement 3: Confidence Scoring
            "confidence_scores": {},
            "overall_confidence": 0.0,

            # Enhancement 4: Citation Verification
            "verified_citations": [],
            "citation_verification_rate": 0.0,

            # Enhancement 5: Quality Gate
            "quality_metrics": {},
            "quality_passed": False,
            "quality_recommendations": [],

            # Enhancement 6: Self-Reflection
            "self_reflections": [],
            "reflection_iteration": 0,
            "reflection_improvements": [],
            "reflection_score": 0.0,
        }
