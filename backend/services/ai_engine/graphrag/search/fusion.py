"""
Search Result Fusion for GraphRAG

Implements Reciprocal Rank Fusion (RRF) for combining multi-modal search results
"""

from typing import List, Dict, Any
from dataclasses import dataclass

from ..models import VectorResult, KeywordResult, GraphResult, FusionWeights, FusedResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class RRFConfig:
    """Configuration for Reciprocal Rank Fusion"""
    k: int = 60  # RRF constant (default 60 from research)
    vector_weight: float = 0.5
    keyword_weight: float = 0.3
    graph_weight: float = 0.2
    

class SearchFusion:
    """Fuses results from multiple search modalities using RRF"""
    
    def __init__(self, weights: FusionWeights):
        self.weights = weights
        self.rrf_k = 60  # Standard RRF constant
        
    def fuse(
        self,
        vector_results: List[VectorResult],
        keyword_results: List[KeywordResult],
        graph_results: List[GraphResult]
    ) -> List[FusedResult]:
        """
        Fuse results from multiple search modalities
        
        Uses Reciprocal Rank Fusion (RRF) algorithm:
        score(d) = Σ weight_i / (k + rank_i(d))
        
        Args:
            vector_results: Vector search results
            keyword_results: Keyword search results
            graph_results: Graph search results
            
        Returns:
            List of FusedResult objects, sorted by final score
        """
        # Build unified result map
        result_map: Dict[str, FusedResult] = {}
        
        # Process vector results
        if self.weights.vector > 0 and vector_results:
            self._add_vector_scores(result_map, vector_results)
            
        # Process keyword results
        if self.weights.keyword > 0 and keyword_results:
            self._add_keyword_scores(result_map, keyword_results)
            
        # Process graph results
        if self.weights.graph > 0 and graph_results:
            self._add_graph_scores(result_map, graph_results)
            
        # Sort by final score
        sorted_results = sorted(
            result_map.values(),
            key=lambda r: r.final_score,
            reverse=True
        )
        
        logger.info(
            f"Fusion complete: {len(vector_results)} vector + "
            f"{len(keyword_results)} keyword + {len(graph_results)} graph → "
            f"{len(sorted_results)} fused results"
        )
        
        return sorted_results
        
    def _add_vector_scores(
        self,
        result_map: Dict[str, FusedResult],
        vector_results: List[VectorResult]
    ):
        """Add RRF scores from vector results"""
        for rank, result in enumerate(vector_results, start=1):
            rrf_score = self.weights.vector / (self.rrf_k + rank)
            
            if result.id not in result_map:
                result_map[result.id] = FusedResult(
                    id=result.id,
                    text=result.text,
                    vector_score=result.score,
                    keyword_score=0.0,
                    graph_score=0.0,
                    final_score=rrf_score,
                    metadata=result.metadata,
                    sources=['vector']
                )
            else:
                result_map[result.id].vector_score = result.score
                result_map[result.id].final_score += rrf_score
                result_map[result.id].sources.append('vector')
                
    def _add_keyword_scores(
        self,
        result_map: Dict[str, FusedResult],
        keyword_results: List[KeywordResult]
    ):
        """Add RRF scores from keyword results"""
        for rank, result in enumerate(keyword_results, start=1):
            rrf_score = self.weights.keyword / (self.rrf_k + rank)
            
            if result.id not in result_map:
                result_map[result.id] = FusedResult(
                    id=result.id,
                    text=result.text,
                    vector_score=0.0,
                    keyword_score=result.score,
                    graph_score=0.0,
                    final_score=rrf_score,
                    metadata=result.metadata,
                    sources=['keyword']
                )
            else:
                result_map[result.id].keyword_score = result.score
                result_map[result.id].final_score += rrf_score
                result_map[result.id].sources.append('keyword')
                
    def _add_graph_scores(
        self,
        result_map: Dict[str, FusedResult],
        graph_results: List[GraphResult]
    ):
        """
        Add RRF scores from graph results
        
        Graph results are converted to text summaries for fusion
        """
        for rank, result in enumerate(graph_results, start=1):
            rrf_score = self.weights.graph / (self.rrf_k + rank)
            
            # Build unique ID from path
            path_id = self._build_graph_id(result)
            
            # Build text summary from graph path
            text = self._graph_to_text(result)
            
            if path_id not in result_map:
                result_map[path_id] = FusedResult(
                    id=path_id,
                    text=text,
                    vector_score=0.0,
                    keyword_score=0.0,
                    graph_score=result.relevance_score,
                    final_score=rrf_score,
                    metadata={'graph_path': result},
                    sources=['graph']
                )
            else:
                result_map[path_id].graph_score = result.relevance_score
                result_map[path_id].final_score += rrf_score
                result_map[path_id].sources.append('graph')
                
    def _build_graph_id(self, graph_result: GraphResult) -> str:
        """Build unique ID for graph path"""
        node_ids = [node.id for node in graph_result.nodes]
        return f"graph_{hash(tuple(node_ids))}"
        
    def _graph_to_text(self, graph_result: GraphResult) -> str:
        """Convert graph path to text summary"""
        parts = []
        
        for i, node in enumerate(graph_result.nodes):
            # Get node name or title
            name = node.properties.get('name') or node.properties.get('title') or 'Unknown'
            parts.append(name)
            
            # Add relationship if not last node
            if i < len(graph_result.relationships):
                rel = graph_result.relationships[i]
                parts.append(f"-[{rel.type}]->")
                
        return " ".join(parts)


def fuse_results(
    vector_results: List[VectorResult],
    keyword_results: List[KeywordResult],
    graph_results: List[GraphResult],
    weights: FusionWeights
) -> List[FusedResult]:
    """
    Convenience function for result fusion
    
    Args:
        vector_results: Vector search results
        keyword_results: Keyword search results
        graph_results: Graph search results
        weights: Fusion weights
        
    Returns:
        List of FusedResult objects, sorted by final score
    """
    fusion = SearchFusion(weights)
    return fusion.fuse(vector_results, keyword_results, graph_results)

