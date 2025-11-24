"""
Evidence Builder for GraphRAG

Builds context with evidence chains and citations from fused search results
"""

from typing import List, Optional, Dict, Any
from dataclasses import dataclass
import tiktoken

from ..models import FusedResult, ContextWithEvidence, EvidenceNode
from .citation_manager import CitationManager
from ..utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ContextBuildConfig:
    """Configuration for context building"""
    max_tokens: int = 4000
    model_name: str = "gpt-4"
    include_metadata: bool = True
    include_graph_paths: bool = True
    

class EvidenceBuilder:
    """Builds context with evidence chains from fused results"""
    
    def __init__(self, config: Optional[ContextBuildConfig] = None):
        self.config = config or ContextBuildConfig()
        self.citation_manager = CitationManager()
        self.tokenizer = tiktoken.encoding_for_model(self.config.model_name)
        
    def build(self, fused_results: List[FusedResult]) -> ContextWithEvidence:
        """
        Build context with evidence chains from fused results
        
        Args:
            fused_results: List of fused results from RRF
            
        Returns:
            ContextWithEvidence object with context chunks and evidence
        """
        # Reset citation manager for new query
        self.citation_manager.reset()
        
        # Build evidence nodes
        evidence_nodes = []
        context_chunks = []
        total_tokens = 0
        
        for rank, result in enumerate(fused_results, start=1):
            # Check token budget
            chunk_tokens = self._count_tokens(result.text)
            if total_tokens + chunk_tokens > self.config.max_tokens:
                logger.info(
                    f"Reached token limit ({self.config.max_tokens}), "
                    f"stopping at {len(context_chunks)} chunks"
                )
                break
                
            # Add citation
            citation_id = self.citation_manager.add_citation(
                source_id=result.id,
                source_type=','.join(result.sources),
                title=result.metadata.get('title') if result.metadata else None,
                url=result.metadata.get('url') if result.metadata else None,
                metadata=result.metadata
            )
            
            # Build evidence node
            evidence_node = EvidenceNode(
                chunk_id=result.id,
                text=result.text,
                citation_id=citation_id,
                rank=rank,
                vector_score=result.vector_score,
                keyword_score=result.keyword_score,
                graph_score=result.graph_score,
                final_score=result.final_score,
                sources=result.sources,
                metadata=result.metadata if self.config.include_metadata else None,
                graph_path=self._extract_graph_path(result) if self.config.include_graph_paths else None
            )
            
            evidence_nodes.append(evidence_node)
            
            # Build context chunk with citation
            context_chunk = f"{result.text} {citation_id}"
            context_chunks.append(context_chunk)
            total_tokens += chunk_tokens
            
        # Build combined context
        context = "\n\n".join(context_chunks)
        
        # Build bibliography
        bibliography = self.citation_manager.format_bibliography()
        
        logger.info(
            f"Built context: {len(evidence_nodes)} chunks, "
            f"{total_tokens} tokens, {len(self.citation_manager.citations)} citations"
        )
        
        return ContextWithEvidence(
            context=context,
            context_chunks=context_chunks,
            evidence_chain=evidence_nodes,
            bibliography=bibliography,
            total_tokens=total_tokens,
            total_chunks=len(evidence_nodes)
        )
        
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        try:
            return len(self.tokenizer.encode(text))
        except Exception as e:
            logger.warning(f"Error counting tokens: {e}, using fallback")
            # Fallback: ~4 chars per token
            return len(text) // 4
            
    def _extract_graph_path(self, result: FusedResult) -> Optional[List[Dict[str, Any]]]:
        """Extract graph path from fused result metadata"""
        if not result.metadata or 'graph_path' not in result.metadata:
            return None
            
        try:
            graph_path = result.metadata['graph_path']
            
            # Convert graph path to serializable format
            path_data = []
            for node in graph_path.nodes:
                path_data.append({
                    'id': node.id,
                    'labels': node.labels,
                    'properties': node.properties
                })
                
            return path_data
            
        except Exception as e:
            logger.warning(f"Error extracting graph path: {e}")
            return None


def build_context_with_evidence(
    fused_results: List[FusedResult],
    max_tokens: int = 4000,
    model_name: str = "gpt-4",
    include_metadata: bool = True,
    include_graph_paths: bool = True
) -> ContextWithEvidence:
    """
    Convenience function for building context with evidence
    
    Args:
        fused_results: List of fused results
        max_tokens: Maximum context tokens
        model_name: Model name for tokenization
        include_metadata: Include metadata in evidence nodes
        include_graph_paths: Include graph paths in evidence nodes
        
    Returns:
        ContextWithEvidence object
    """
    config = ContextBuildConfig(
        max_tokens=max_tokens,
        model_name=model_name,
        include_metadata=include_metadata,
        include_graph_paths=include_graph_paths
    )
    
    builder = EvidenceBuilder(config)
    return builder.build(fused_results)

