"""
Test Evidence Builder
Tests for evidence chain and citation construction
"""

import pytest

from src.graphrag.evidence_builder import EvidenceBuilder
from src.graphrag.models import ContextChunk, SearchSource, GraphEvidence, EvidenceNode, FusionWeights


class TestEvidenceBuilder:
    """Test suite for EvidenceBuilder"""
    
    def test_evidence_builder_initialization(self):
        """Test evidence builder initialization"""
        builder = EvidenceBuilder(max_tokens=4000)
        assert builder.max_tokens == 4000
    
    def test_build_context_with_citations(self, sample_context_chunks):
        """Test context building with citations"""
        builder = EvidenceBuilder(max_tokens=10000)
        
        chunks, citations, evidence = builder.build_context_with_evidence(
            chunks=sample_context_chunks,
            graph_evidence=[],
            include_citations=True
        )
        
        # Check citations were added
        assert len(citations) == 3
        assert "[1]" in citations
        assert "[2]" in citations
        assert "[3]" in citations
        
        # Check citation markers in text
        assert "[1]" in chunks[0].text
        assert "[2]" in chunks[1].text
        assert "[3]" in chunks[2].text
        
        # Check metadata
        assert 'citation_id' in chunks[0].metadata
    
    def test_build_context_without_citations(self, sample_context_chunks):
        """Test context building without citations"""
        builder = EvidenceBuilder(max_tokens=10000)
        
        chunks, citations, evidence = builder.build_context_with_evidence(
            chunks=sample_context_chunks,
            graph_evidence=[],
            include_citations=False
        )
        
        # No citations should be added
        assert len(citations) == 0
        assert "[1]" not in chunks[0].text
    
    def test_token_truncation(self):
        """Test context truncation at token limit"""
        builder = EvidenceBuilder(max_tokens=100)  # Very small limit
        
        # Create chunks with long text
        long_chunks = [
            ContextChunk(
                chunk_id=f"chunk_{i}",
                text="A" * 200,  # ~50 tokens
                score=0.9,
                source=SearchSource(document_id=f"doc_{i}"),
                search_modality="vector",
                metadata={}
            )
            for i in range(10)
        ]
        
        chunks, citations, evidence = builder.build_context_with_evidence(
            chunks=long_chunks,
            graph_evidence=[],
            include_citations=True
        )
        
        # Should be truncated to fit token limit
        assert len(chunks) < len(long_chunks)
    
    def test_build_metadata(self):
        """Test metadata building"""
        builder = EvidenceBuilder()
        
        weights = FusionWeights(vector=0.6, keyword=0.4, graph=0.0)
        
        metadata = builder.build_metadata(
            profile_name="hybrid_enhanced",
            fusion_weights=weights,
            vector_count=10,
            keyword_count=5,
            graph_count=0,
            total_count=10,
            rerank_applied=False,
            execution_time_ms=523.4,
            kg_view_applied=True
        )
        
        assert metadata.profile_used == "hybrid_enhanced"
        assert metadata.fusion_weights.vector == 0.6
        assert metadata.vector_results_count == 10
        assert metadata.keyword_results_count == 5
        assert metadata.total_results_count == 10
        assert metadata.execution_time_ms == 523.4
        assert metadata.agent_kg_view_applied is True
    
    def test_graph_evidence_inclusion(self, sample_context_chunks, sample_graph_evidence):
        """Test including graph evidence in context"""
        builder = EvidenceBuilder(max_tokens=10000)
        
        chunks, citations, evidence = builder.build_context_with_evidence(
            chunks=sample_context_chunks,
            graph_evidence=sample_graph_evidence,
            include_citations=True
        )
        
        assert len(evidence) == 1
        assert evidence[0].path_id == "path_1"
        assert len(evidence[0].nodes) == 2

