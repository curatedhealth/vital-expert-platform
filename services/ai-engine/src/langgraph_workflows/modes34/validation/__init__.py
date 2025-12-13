# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [research_quality_validator, citation_validator]
# PHASE: M8-M10 MEDIUM Priority
"""
Phase 3 MEDIUM Priority Validation Infrastructure (M9, M10)

M9: Research Quality Validation
- Source verification thresholds
- Confidence score validation
- Quality gate enforcement

M10: Citation Verification
- PubMed validation
- DOI resolution
- CrossRef verification

This module provides validation wrappers around the existing research_quality.py
implementations, adding explicit threshold enforcement and structured error reporting.
"""

from .research_quality_validator import (
    ResearchQualityValidator,
    QualityThresholds,
    QualityValidationResult,
    validate_research_quality,
    validate_confidence_scores,
    validate_source_credibility,
    enforce_quality_gate,
    DEFAULT_QUALITY_THRESHOLDS,
)

from .citation_validator import (
    CitationValidator,
    CitationValidationResult,
    CitationSummary,
    CitationSource,
    validate_citations,
    validate_pubmed_citation,
    validate_doi,
    validate_crossref,
    get_citation_summary,
)

__all__ = [
    # M9: Research Quality Validation
    "ResearchQualityValidator",
    "QualityThresholds",
    "QualityValidationResult",
    "validate_research_quality",
    "validate_confidence_scores",
    "validate_source_credibility",
    "enforce_quality_gate",
    "DEFAULT_QUALITY_THRESHOLDS",
    # M10: Citation Verification
    "CitationValidator",
    "CitationValidationResult",
    "CitationSummary",
    "CitationSource",
    "validate_citations",
    "validate_pubmed_citation",
    "validate_doi",
    "validate_crossref",
    "get_citation_summary",
]
