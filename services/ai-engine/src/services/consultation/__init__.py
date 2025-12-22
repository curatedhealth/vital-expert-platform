"""
Consultation Service - Mode 1 & 2 (Interactive Q&A)

Interactive single-turn consultation with manual or automatic expert selection.

Mode 1: Manual expert selection by user
Mode 2: Automatic expert selection based on query classification

Components:
- Query classification (route questions to right expert)
- Response quality assessment (check answer quality)
- Citation enhancement (add references to responses)
- Mode 1 evidence gathering (single-turn evidence collection)

Note: RAG services (GraphRAG, search) are in services.rag/
"""

from .query_classifier import QueryClassifier
from .response_quality import ResponseQualityService, ResponseQualityResult, get_response_quality_service
from .citation_prompt_enhancer import CitationPromptEnhancer
from .mode1_evidence_gatherer import Mode1EvidenceGatherer

# Alias for backwards compatibility
ResponseQualityChecker = ResponseQualityService

__all__ = [
    "QueryClassifier",
    "ResponseQualityService",
    "ResponseQualityResult",
    "ResponseQualityChecker",  # Alias for compatibility
    "get_response_quality_service",
    "CitationPromptEnhancer",
    "Mode1EvidenceGatherer",
]
