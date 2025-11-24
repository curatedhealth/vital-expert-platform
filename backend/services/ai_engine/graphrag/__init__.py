"""
GraphRAG Service
Complete hybrid search service combining vector, keyword, and graph search
with evidence chain building and agent-specific RAG profiles.
"""

from .config import GraphRAGConfig, get_config, set_config
from .models import (
    GraphRAGRequest,
    GraphRAGResponse,
    GraphRAGMetadata,
    RAGProfile,
    FusionWeights,
    AgentKGView,
    EvidenceNode,
    ContextChunk,
    GraphPath,
    GraphNode,
    GraphEdge,
    RAGStrategyType,
)

__version__ = "1.0.0"
__all__ = [
    "GraphRAGConfig",
    "get_config",
    "set_config",
    "GraphRAGRequest",
    "GraphRAGResponse",
    "GraphRAGMetadata",
    "RAGProfile",
    "FusionWeights",
    "AgentKGView",
    "EvidenceNode",
    "ContextChunk",
    "GraphPath",
    "GraphNode",
    "GraphEdge",
    "RAGStrategyType",
]

