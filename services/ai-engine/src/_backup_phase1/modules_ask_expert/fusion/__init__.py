"""
VITAL Path AI Services - Ask Expert Fusion Intelligence

Fusion Intelligence combines three retrieval sources:
- Vector: Semantic similarity (pgvector/Pinecone)
- Graph: Relationship paths (Neo4j)
- Relational: Historical patterns (PostgreSQL)

Using Reciprocal Rank Fusion (RRF) for evidence-backed selection.

Naming Convention:
- Classes: AskExpertFusion{Component}
- Functions: ask_expert_fusion_{action}
- Logs: ask_expert_fusion_{action}

Phase 2: Agent Hierarchy & Fusion Intelligence
"""

from .ask_expert_fusion_rrf import (
    AskExpertRankedItem,
    ask_expert_reciprocal_rank_fusion,
    ask_expert_weighted_rrf,
    ask_expert_normalize_scores,
)
from .ask_expert_fusion_engine import (
    AskExpertFusionEngine,
    AskExpertFusionResult,
)
from .retrievers import (
    AskExpertVectorRetriever,
    AskExpertGraphRetriever,
    AskExpertRelationalRetriever,
)

__all__ = [
    # RRF
    "AskExpertRankedItem",
    "ask_expert_reciprocal_rank_fusion",
    "ask_expert_weighted_rrf",
    "ask_expert_normalize_scores",
    # Engine
    "AskExpertFusionEngine",
    "AskExpertFusionResult",
    # Retrievers
    "AskExpertVectorRetriever",
    "AskExpertGraphRetriever",
    "AskExpertRelationalRetriever",
]
