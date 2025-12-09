"""
VITAL Path AI Services - Fusion Intelligence (Shared)

Fusion Intelligence combines three retrieval sources using RRF:
1. Vector: Semantic similarity (pgvector/Pinecone)
2. Graph: Relationship paths (Neo4j)
3. Relational: Historical patterns (PostgreSQL)

Components:
- FusionEngine: Main orchestrator for triple retrieval
- RRF: Reciprocal Rank Fusion algorithm
- Retrievers: Vector, Graph, Relational

Used by all VITAL services for evidence-backed decision making.
"""

from .fusion_engine import (
    FusionEngine,
    FusionResult,
    create_fusion_engine,
)
from .fusion_rrf import (
    RankedItem,
    reciprocal_rank_fusion,
    weighted_rrf,
    normalize_scores,
    normalize_to_percentage,
)
from .retrievers import (
    VectorRetriever,
    GraphRetriever,
    RelationalRetriever,
)

__all__ = [
    # Engine
    "FusionEngine",
    "FusionResult",
    "create_fusion_engine",
    # RRF
    "RankedItem",
    "reciprocal_rank_fusion",
    "weighted_rrf",
    "normalize_scores",
    "normalize_to_percentage",
    # Retrievers
    "VectorRetriever",
    "GraphRetriever",
    "RelationalRetriever",
]
