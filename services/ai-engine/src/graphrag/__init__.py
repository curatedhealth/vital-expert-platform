"""
GraphRAG package for VITAL Platform
Implements hybrid search combining vector, keyword, and graph modalities

Features:
- Semantic vector search (OpenAI + Pinecone/pgvector)
- Keyword search (Elasticsearch BM25)
- Knowledge graph traversal (Neo4j)
- Hybrid fusion with Reciprocal Rank Fusion (RRF)
- Evidence chains with citations
- Agent-specific RAG profiles and KG views

Usage:
    from graphrag import get_graphrag_service
    
    service = await get_graphrag_service()
    response = await service.query(request)
"""

from .service import GraphRAGService, get_graphrag_service
from .models import (
    GraphRAGRequest,
    GraphRAGResponse,
    GraphRAGMetadata,
    ContextChunk,
    EvidenceNode,
    FusionWeights,
    RAGProfile,
    AgentKGView
)
from .api import router as graphrag_router

__all__ = [
    'GraphRAGService',
    'get_graphrag_service',
    'GraphRAGRequest',
    'GraphRAGResponse',
    'GraphRAGMetadata',
    'ContextChunk',
    'EvidenceNode',
    'FusionWeights',
    'RAGProfile',
    'AgentKGView',
    'graphrag_router'
]

__version__ = '1.0.0'

