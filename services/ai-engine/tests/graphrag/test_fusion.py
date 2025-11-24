"""
Test Hybrid Fusion
Tests for Reciprocal Rank Fusion algorithm
"""

import pytest
from uuid import UUID

from src.graphrag.search.fusion import HybridFusion
from src.graphrag.models import FusionWeights, ContextChunk, SearchSource


class TestHybridFusion:
    """Test suite for HybridFusion"""
    
    def test_fusion_initialization(self):
        """Test fusion initialization"""
        fusion = HybridFusion(k=60)
        assert fusion.k == 60
    
    def test_rrf_fusion_vector_only(self, sample_context_chunks):
        """Test RRF with vector results only"""
        fusion = HybridFusion()
        weights = FusionWeights(vector=1.0, keyword=0.0, graph=0.0)
        
        result = fusion.fuse(
            vector_results=sample_context_chunks,
            keyword_results=[],
            graph_results=[],
            weights=weights,
            top_k=3
        )
        
        assert len(result) == 3
        assert result[0].chunk_id == "chunk_1"  # Highest score
        assert 'rrf_score' in result[0].metadata
    
    def test_rrf_fusion_multi_modal(self):
        """Test RRF with multiple modalities"""
        fusion = HybridFusion()
        weights = FusionWeights(vector=0.5, keyword=0.3, graph=0.2)
        
        vector_chunks = [
            ContextChunk(
                chunk_id="v1",
                text="Vector result 1",
                score=0.9,
                source=SearchSource(document_id="doc1"),
                search_modality="vector",
                metadata={}
            )
        ]
        
        keyword_chunks = [
            ContextChunk(
                chunk_id="k1",
                text="Keyword result 1",
                score=0.85,
                source=SearchSource(document_id="doc2"),
                search_modality="keyword",
                metadata={}
            )
        ]
        
        result = fusion.fuse(
            vector_results=vector_chunks,
            keyword_results=keyword_chunks,
            graph_results=[],
            weights=weights,
            top_k=2
        )
        
        assert len(result) == 2
        assert all('rrf_score' in chunk.metadata for chunk in result)
    
    def test_rrf_deduplication(self):
        """Test RRF deduplication of same chunk from multiple sources"""
        fusion = HybridFusion()
        weights = FusionWeights(vector=0.5, keyword=0.5, graph=0.0)
        
        # Same chunk ID in both vector and keyword
        chunk = ContextChunk(
            chunk_id="duplicate",
            text="Duplicate chunk",
            score=0.9,
            source=SearchSource(document_id="doc1"),
            search_modality="vector",
            metadata={}
        )
        
        result = fusion.fuse(
            vector_results=[chunk],
            keyword_results=[chunk],
            graph_results=[],
            weights=weights,
            top_k=5
        )
        
        # Should only appear once
        assert len(result) == 1
        assert result[0].chunk_id == "duplicate"
    
    def test_weighted_fusion(self):
        """Test weighted average fusion"""
        fusion = HybridFusion()
        weights = FusionWeights(vector=0.6, keyword=0.4, graph=0.0)
        
        vector_chunk = ContextChunk(
            chunk_id="v1",
            text="Vector",
            score=1.0,
            source=SearchSource(document_id="doc1"),
            search_modality="vector",
            metadata={}
        )
        
        keyword_chunk = ContextChunk(
            chunk_id="k1",
            text="Keyword",
            score=0.5,
            source=SearchSource(document_id="doc2"),
            search_modality="keyword",
            metadata={}
        )
        
        result = fusion.fuse_with_original_scores(
            vector_results=[vector_chunk],
            keyword_results=[keyword_chunk],
            graph_results=[],
            weights=weights,
            top_k=2
        )
        
        assert len(result) == 2
        # Vector should rank higher (1.0 * 0.6 = 0.6 vs 0.5 * 0.4 = 0.2)
        assert result[0].chunk_id == "v1"
        assert result[1].chunk_id == "k1"
    
    def test_top_k_limit(self, sample_context_chunks):
        """Test top_k limit"""
        fusion = HybridFusion()
        weights = FusionWeights(vector=1.0, keyword=0.0, graph=0.0)
        
        result = fusion.fuse(
            vector_results=sample_context_chunks,
            keyword_results=[],
            graph_results=[],
            weights=weights,
            top_k=2
        )
        
        assert len(result) == 2
    
    def test_weight_normalization(self):
        """Test fusion weight normalization"""
        weights = FusionWeights(vector=2.0, keyword=1.0, graph=1.0)
        normalized = weights.normalize()
        
        assert normalized.vector == 0.5
        assert normalized.keyword == 0.25
        assert normalized.graph == 0.25
        assert abs((normalized.vector + normalized.keyword + normalized.graph) - 1.0) < 0.001
    
    def test_zero_weights_normalization(self):
        """Test normalization with all zero weights"""
        weights = FusionWeights(vector=0.0, keyword=0.0, graph=0.0)
        normalized = weights.normalize()
        
        # Should default to vector-only
        assert normalized.vector == 1.0
        assert normalized.keyword == 0.0
        assert normalized.graph == 0.0

