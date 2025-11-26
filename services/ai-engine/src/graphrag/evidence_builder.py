"""
Evidence Builder
Constructs context with evidence chains and citations
"""

from typing import List, Dict, Tuple
import structlog

from .models import (
    ContextChunk,
    GraphEvidence,
    SearchSource,
    GraphRAGMetadata,
    FusionWeights
)

logger = structlog.get_logger()


class EvidenceBuilder:
    """
    Builds context with evidence chains and citations
    
    Features:
    - Citation assignment [1], [2], etc.
    - Evidence chain construction
    - Token counting
    - Context truncation
    """
    
    def __init__(self, max_tokens: int = 4000):
        """
        Initialize evidence builder
        
        Args:
            max_tokens: Maximum context window tokens
        """
        self.max_tokens = max_tokens
    
    def build_context_with_evidence(
        self,
        chunks: List[ContextChunk],
        graph_evidence: List[GraphEvidence],
        include_citations: bool = True
    ) -> Tuple[List[ContextChunk], Dict[str, SearchSource], List[GraphEvidence]]:
        """
        Build context with citations and evidence
        
        Args:
            chunks: Ranked context chunks
            graph_evidence: Graph evidence chains
            include_citations: Include citation markers
            
        Returns:
            Tuple of (chunks_with_citations, citation_map, evidence_chain)
        """
        try:
            citation_map: Dict[str, SearchSource] = {}
            citation_counter = 1
            annotated_chunks = []
            total_tokens = 0
            
            for chunk in chunks:
                # Estimate tokens (rough: ~4 chars per token)
                chunk_tokens = len(chunk.text) // 4
                
                if total_tokens + chunk_tokens > self.max_tokens:
                    logger.info(
                        "context_truncated",
                        max_tokens=self.max_tokens,
                        chunks_included=len(annotated_chunks)
                    )
                    break
                
                # Assign citation ID
                if include_citations:
                    citation_id = f"[{citation_counter}]"
                    citation_map[citation_id] = chunk.source
                    
                    # Annotate text with citation
                    annotated_text = f"{chunk.text} {citation_id}"
                    chunk.text = annotated_text
                    chunk.metadata['citation_id'] = citation_id
                    
                    citation_counter += 1
                
                annotated_chunks.append(chunk)
                total_tokens += chunk_tokens
            
            logger.info(
                "evidence_built",
                chunks_count=len(annotated_chunks),
                citations_count=len(citation_map),
                graph_evidence_count=len(graph_evidence),
                total_tokens=total_tokens
            )
            
            return annotated_chunks, citation_map, graph_evidence
            
        except Exception as e:
            logger.error("evidence_building_failed", error=str(e))
            return chunks, {}, graph_evidence
    
    def build_metadata(
        self,
        profile_name: str,
        fusion_weights: FusionWeights,
        vector_count: int,
        keyword_count: int,
        graph_count: int,
        total_count: int,
        rerank_applied: bool,
        execution_time_ms: float,
        kg_view_applied: bool
    ) -> GraphRAGMetadata:
        """
        Build GraphRAG metadata
        
        Args:
            profile_name: RAG profile used
            fusion_weights: Fusion weights applied
            vector_count: Vector search results
            keyword_count: Keyword search results
            graph_count: Graph search results
            total_count: Total fused results
            rerank_applied: Whether reranking was applied
            execution_time_ms: Total execution time
            kg_view_applied: Whether KG view filtering was applied
            
        Returns:
            GraphRAG metadata
        """
        return GraphRAGMetadata(
            profile_used=profile_name,
            fusion_weights=fusion_weights,
            vector_results_count=vector_count,
            keyword_results_count=keyword_count,
            graph_results_count=graph_count,
            total_results_count=total_count,
            rerank_applied=rerank_applied,
            execution_time_ms=execution_time_ms,
            agent_kg_view_applied=kg_view_applied
        )


def get_evidence_builder(max_tokens: int = 4000) -> EvidenceBuilder:
    """Get or create evidence builder"""
    return EvidenceBuilder(max_tokens=max_tokens)

