"""
Keyword Search Implementation
Full-text search with BM25 ranking
"""

from typing import List, Optional
import structlog

from ..models import ContextChunk, SearchSource
from ..clients.elastic_client import get_elastic_client, KeywordSearchResult
from ..config import get_graphrag_config

logger = structlog.get_logger()


class KeywordSearch:
    """
    Keyword search using Elasticsearch BM25
    
    Features:
    - BM25 ranking algorithm
    - Multi-field search
    - Highlighting
    - Metadata filtering
    - Mock mode fallback
    """
    
    def __init__(self):
        self.config = get_graphrag_config()
    
    async def search(
        self,
        query: str,
        top_k: int = 10,
        min_score: float = 1.0,
        filter_dict: Optional[dict] = None,
        highlight: bool = True
    ) -> List[ContextChunk]:
        """
        Perform keyword search
        
        Args:
            query: Search query
            top_k: Number of results
            min_score: Minimum BM25 score
            filter_dict: Optional metadata filters
            highlight: Include highlights
            
        Returns:
            List of context chunks
        """
        try:
            # Check if Elasticsearch is enabled
            if not self.config.elasticsearch_enabled:
                logger.info(
                    "keyword_search_disabled",
                    note="Elasticsearch not enabled, returning empty results"
                )
                return []
            
            # Search Elasticsearch
            elastic_client = await get_elastic_client()
            
            results = await elastic_client.search(
                query=query,
                top_k=top_k,
                filter_dict=filter_dict,
                min_score=min_score,
                highlight=highlight
            )
            
            # Convert to ContextChunks
            chunks = self._convert_to_chunks(results)
            
            logger.info(
                "keyword_search_complete",
                query=query[:50],
                results_count=len(chunks),
                min_score=min_score
            )
            
            return chunks
            
        except Exception as e:
            logger.error(
                "keyword_search_failed",
                query=query[:50],
                error=str(e)
            )
            return []
    
    def _convert_to_chunks(
        self,
        results: List[KeywordSearchResult]
    ) -> List[ContextChunk]:
        """Convert keyword search results to context chunks"""
        chunks = []
        
        for result in results:
            source = SearchSource(
                document_id=result.id,
                title=result.metadata.get('title'),
                url=result.metadata.get('url'),
                citation=result.metadata.get('citation')
            )
            
            # Normalize BM25 score to 0-1 range (approximate)
            # BM25 scores are unbounded, so we use sigmoid-like normalization
            normalized_score = min(result.score / 10.0, 1.0)
            
            chunk = ContextChunk(
                chunk_id=result.id,
                text=result.text,
                score=normalized_score,
                source=source,
                search_modality="keyword",
                metadata={
                    **result.metadata,
                    'highlights': result.highlights,
                    'raw_bm25_score': result.score
                }
            )
            
            chunks.append(chunk)
        
        return chunks


# Singleton instance
_keyword_search: Optional[KeywordSearch] = None


def get_keyword_search() -> KeywordSearch:
    """Get or create keyword search singleton"""
    global _keyword_search
    
    if _keyword_search is None:
        _keyword_search = KeywordSearch()
    
    return _keyword_search

