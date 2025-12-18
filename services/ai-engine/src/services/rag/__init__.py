"""
RAG Service - Retrieval-Augmented Generation

Unified search, retrieval, and knowledge graph services.
These are orchestration wrappers with DI, distinct from Runners (pure fusion algorithms).

Components:
- GraphRAG selector (choose between Neo4j graph and Pinecone vector)
- GraphRAG diagnostics (debug RAG pipeline)
- Unified RAG service (single entry point for all RAG operations)
- Medical RAG (domain-specific medical retrieval)
- Local reranker (cross-encoder reranking)
- Search cache (caching for expensive searches)
"""

from .graphrag_selector import GraphRAGSelector
from .graphrag_diagnostics import GraphRAGDiagnostics
from .unified_rag_service import UnifiedRAGService
from .medical_rag import MedicalRAG
from .local_reranker import LocalCrossEncoderReranker
from .search_cache import SearchCache

__all__ = [
    "GraphRAGSelector",
    "GraphRAGDiagnostics",
    "UnifiedRAGService",
    "MedicalRAG",
    "LocalCrossEncoderReranker",
    "SearchCache",
]
