"""
Hybrid Fusion Implementation
Combines vector, keyword, and graph search using Reciprocal Rank Fusion (RRF)
"""

from typing import List, Dict
from collections import defaultdict
import structlog

from ..models import ContextChunk, FusionWeights

logger = structlog.get_logger()


class HybridFusion:
    """
    Hybrid search fusion using Reciprocal Rank Fusion (RRF)
    
    RRF Formula:
        RRF_score(d) = Σ (weight / (k + rank(d)))
        
    Where:
    - d = document
    - k = constant (typically 60)
    - rank(d) = rank of document in result list
    - weight = modality weight (vector, keyword, graph)
    
    Features:
    - Multi-modal fusion (vector + keyword + graph)
    - Weighted RRF
    - Score normalization
    - Deduplication
    """
    
    def __init__(self, k: int = 60):
        """
        Initialize fusion
        
        Args:
            k: RRF constant (default 60 as per research)
        """
        self.k = k
    
    def fuse(
        self,
        vector_results: List[ContextChunk],
        keyword_results: List[ContextChunk],
        graph_results: List[ContextChunk],
        weights: FusionWeights,
        top_k: int = 10
    ) -> List[ContextChunk]:
        """
        Fuse results from multiple search modalities
        
        Args:
            vector_results: Results from vector search
            keyword_results: Results from keyword search
            graph_results: Results from graph search
            weights: Fusion weights for each modality
            top_k: Number of results to return
            
        Returns:
            Fused and ranked results
        """
        try:
            # Normalize weights
            normalized_weights = weights.normalize()
            
            # Calculate RRF scores for each modality
            rrf_scores: Dict[str, float] = defaultdict(float)
            chunk_map: Dict[str, ContextChunk] = {}
            
            # Vector results
            if normalized_weights.vector > 0:
                self._add_rrf_scores(
                    vector_results,
                    rrf_scores,
                    chunk_map,
                    weight=normalized_weights.vector
                )
            
            # Keyword results
            if normalized_weights.keyword > 0:
                self._add_rrf_scores(
                    keyword_results,
                    rrf_scores,
                    chunk_map,
                    weight=normalized_weights.keyword
                )
            
            # Graph results
            if normalized_weights.graph > 0:
                self._add_rrf_scores(
                    graph_results,
                    rrf_scores,
                    chunk_map,
                    weight=normalized_weights.graph
                )
            
            # Sort by RRF score
            sorted_ids = sorted(
                rrf_scores.keys(),
                key=lambda x: rrf_scores[x],
                reverse=True
            )
            
            # Build final results
            fused_results = []
            for chunk_id in sorted_ids[:top_k]:
                chunk = chunk_map[chunk_id]
                
                # Update score with RRF score
                chunk.score = rrf_scores[chunk_id]
                chunk.metadata['rrf_score'] = rrf_scores[chunk_id]
                chunk.metadata['original_score'] = chunk.metadata.get('original_score', chunk.score)
                
                fused_results.append(chunk)
            
            logger.info(
                "fusion_complete",
                vector_count=len(vector_results),
                keyword_count=len(keyword_results),
                graph_count=len(graph_results),
                fused_count=len(fused_results),
                weights=normalized_weights.model_dump()
            )
            
            return fused_results
            
        except Exception as e:
            logger.error("fusion_failed", error=str(e))
            # Fallback: return vector results
            return vector_results[:top_k]
    
    def _add_rrf_scores(
        self,
        results: List[ContextChunk],
        rrf_scores: Dict[str, float],
        chunk_map: Dict[str, ContextChunk],
        weight: float
    ):
        """
        Add RRF scores from one modality
        
        Args:
            results: Results from one modality
            rrf_scores: Dict to accumulate scores
            chunk_map: Dict to store chunks
            weight: Modality weight
        """
        for rank, chunk in enumerate(results, start=1):
            # RRF formula: weight / (k + rank)
            rrf_contribution = weight / (self.k + rank)
            
            # Accumulate score
            rrf_scores[chunk.chunk_id] += rrf_contribution
            
            # Store chunk (first occurrence wins for deduplication)
            if chunk.chunk_id not in chunk_map:
                # Store original score before RRF
                chunk.metadata['original_score'] = chunk.score
                chunk_map[chunk.chunk_id] = chunk
    
    def fuse_with_original_scores(
        self,
        vector_results: List[ContextChunk],
        keyword_results: List[ContextChunk],
        graph_results: List[ContextChunk],
        weights: FusionWeights,
        top_k: int = 10
    ) -> List[ContextChunk]:
        """
        Alternative fusion: Weighted average of original scores
        
        This method uses the original similarity scores directly
        instead of RRF ranking.
        
        Args:
            vector_results: Results from vector search
            keyword_results: Results from keyword search
            graph_results: Results from graph search
            weights: Fusion weights
            top_k: Number of results to return
            
        Returns:
            Fused and ranked results
        """
        try:
            normalized_weights = weights.normalize()
            
            # Accumulate weighted scores
            weighted_scores: Dict[str, float] = defaultdict(float)
            chunk_map: Dict[str, ContextChunk] = {}
            
            # Add weighted scores from each modality
            for chunk in vector_results:
                weighted_scores[chunk.chunk_id] += chunk.score * normalized_weights.vector
                if chunk.chunk_id not in chunk_map:
                    chunk_map[chunk.chunk_id] = chunk
            
            for chunk in keyword_results:
                weighted_scores[chunk.chunk_id] += chunk.score * normalized_weights.keyword
                if chunk.chunk_id not in chunk_map:
                    chunk_map[chunk.chunk_id] = chunk
            
            for chunk in graph_results:
                weighted_scores[chunk.chunk_id] += chunk.score * normalized_weights.graph
                if chunk.chunk_id not in chunk_map:
                    chunk_map[chunk.chunk_id] = chunk
            
            # Sort by weighted score
            sorted_ids = sorted(
                weighted_scores.keys(),
                key=lambda x: weighted_scores[x],
                reverse=True
            )
            
            # Build final results
            fused_results = []
            for chunk_id in sorted_ids[:top_k]:
                chunk = chunk_map[chunk_id]
                chunk.score = weighted_scores[chunk_id]
                chunk.metadata['weighted_score'] = weighted_scores[chunk_id]
                fused_results.append(chunk)
            
            logger.info(
                "weighted_fusion_complete",
                fused_count=len(fused_results)
            )
            
            return fused_results
            
        except Exception as e:
            logger.error("weighted_fusion_failed", error=str(e))
            return vector_results[:top_k]


# Singleton instance
_hybrid_fusion: HybridFusion = None


def get_hybrid_fusion(k: int = 60) -> HybridFusion:
    """Get or create hybrid fusion singleton"""
    global _hybrid_fusion
    
    if _hybrid_fusion is None:
        _hybrid_fusion = HybridFusion(k=k)
    
    return _hybrid_fusion

