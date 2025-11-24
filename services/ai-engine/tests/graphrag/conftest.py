"""
Test Fixtures for GraphRAG Tests
Shared fixtures and mocks
"""

import pytest
from uuid import UUID, uuid4
from typing import List, Dict, Any

from src.graphrag.models import (
    RAGProfile,
    AgentKGView,
    FusionWeights,
    ContextChunk,
    SearchSource,
    GraphEvidence,
    EvidenceNode
)


@pytest.fixture
def sample_agent_id() -> UUID:
    """Sample agent UUID"""
    return UUID('12345678-1234-1234-1234-123456789012')


@pytest.fixture
def sample_session_id() -> UUID:
    """Sample session UUID"""
    return UUID('87654321-4321-4321-4321-210987654321')


@pytest.fixture
def sample_rag_profile() -> RAGProfile:
    """Sample RAG profile"""
    return RAGProfile(
        id=UUID('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
        profile_name="test_hybrid",
        strategy_type="hybrid_enhanced",
        top_k=10,
        similarity_threshold=0.7,
        rerank_enabled=False,
        rerank_model=None,
        context_window_tokens=4000,
        enable_graph_search=True,
        enable_keyword_search=True,
        metadata={}
    )


@pytest.fixture
def sample_kg_view() -> AgentKGView:
    """Sample KG view"""
    return AgentKGView(
        id=UUID('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
        agent_id=UUID('12345678-1234-1234-1234-123456789012'),
        include_nodes=['Drug', 'Disease', 'Gene'],
        include_edges=['TREATS', 'CAUSES', 'TARGETS'],
        exclude_nodes=[],
        exclude_edges=[],
        max_hops=2,
        graph_limit=50,
        is_active=True,
        metadata={}
    )


@pytest.fixture
def sample_fusion_weights() -> FusionWeights:
    """Sample fusion weights"""
    return FusionWeights(vector=0.6, keyword=0.4, graph=0.0)


@pytest.fixture
def sample_context_chunks() -> List[ContextChunk]:
    """Sample context chunks"""
    return [
        ContextChunk(
            chunk_id="chunk_1",
            text="Diabetes is treated with insulin and metformin.",
            score=0.9,
            source=SearchSource(
                document_id="doc_1",
                title="Diabetes Treatment Guidelines",
                url="https://example.com/diabetes"
            ),
            search_modality="vector",
            metadata={}
        ),
        ContextChunk(
            chunk_id="chunk_2",
            text="Metformin is a first-line treatment for type 2 diabetes.",
            score=0.85,
            source=SearchSource(
                document_id="doc_2",
                title="Metformin Clinical Guidelines"
            ),
            search_modality="keyword",
            metadata={}
        ),
        ContextChunk(
            chunk_id="chunk_3",
            text="Type 2 diabetes affects glucose metabolism.",
            score=0.8,
            source=SearchSource(
                document_id="doc_3",
                title="Diabetes Pathophysiology"
            ),
            search_modality="vector",
            metadata={}
        )
    ]


@pytest.fixture
def sample_graph_evidence() -> List[GraphEvidence]:
    """Sample graph evidence"""
    return [
        GraphEvidence(
            path_id="path_1",
            nodes=[
                EvidenceNode(
                    node_id="node_1",
                    node_type="Drug",
                    node_name="Metformin",
                    properties={"id": "node_1", "name": "Metformin"},
                    relevance_score=0.9
                ),
                EvidenceNode(
                    node_id="node_2",
                    node_type="Disease",
                    node_name="Diabetes",
                    properties={"id": "node_2", "name": "Diabetes"},
                    relevance_score=0.9
                )
            ],
            edges=[
                {"type": "TREATS", "source": "node_1", "target": "node_2"}
            ],
            path_score=0.9
        )
    ]


@pytest.fixture
def mock_embedding() -> List[float]:
    """Mock embedding vector"""
    return [0.1] * 1536  # Standard OpenAI embedding dimension

