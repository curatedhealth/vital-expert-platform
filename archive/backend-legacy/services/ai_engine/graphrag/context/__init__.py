"""
GraphRAG Context Package

Builds context with evidence chains and citations from fused search results
"""

from .evidence_builder import EvidenceBuilder, build_context_with_evidence
from .citation_manager import CitationManager

__all__ = [
    'EvidenceBuilder',
    'build_context_with_evidence',
    'CitationManager'
]

