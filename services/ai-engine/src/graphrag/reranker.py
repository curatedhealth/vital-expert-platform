"""
Reranking Service
Implements Cohere reranking for improved result relevance
"""

from typing import List, Optional
import structlog

from ..models import ContextChunk
from ..config import get_graphrag_config

logger = structlog.get_logger()


class RerankerService:
    """
    Production-ready reranking service using Cohere
    
    Features:
    - Cohere Rerank API integration
    - Result reordering based on query relevance
    - Configurable rerank model
    - Fallback to original scores
    """
    
    def __init__(self):
        self.config = get_graphrag_config()
        self._client = None
    
    async def initialize(self):
        """Initialize Cohere client"""
        try:
            import cohere  # type: ignore
            
            if self.config.cohere_api_key:
                self._client = cohere.AsyncClient(self.config.cohere_api_key)
                logger.info("cohere_reranker_initialized")
            else:
                logger.warning("cohere_api_key_not_configured")
                
        except ImportError:
            logger.warning("cohere_library_not_installed")
    
    async def rerank(
        self,
        query: str,
        chunks: List[ContextChunk],
        top_k: Optional[int] = None,
        model: Optional[str] = None
    ) -> List[ContextChunk]:
        """
        Rerank context chunks using Cohere Rerank API
        
        Args:
            query: Search query
            chunks: Context chunks to rerank
            top_k: Number of results to return (None = all)
            model: Rerank model to use
            
        Returns:
            Reranked chunks with updated scores
        """
        # Skip if no chunks
        if not chunks:
            return chunks
        
        # Skip if client not initialized
        if not self._client:
            logger.info("reranker_skipped", reason="client_not_initialized")
            return chunks
        
        try:
            # Prepare documents for reranking
            documents = [chunk.text for chunk in chunks]
            
            # Call Cohere Rerank API
            rerank_model = model or self.config.rerank_model
            
            response = await self._client.rerank(
                query=query,
                documents=documents,
                top_n=top_k or len(documents),
                model=rerank_model
            )
            
            # Create reranked chunks
            reranked = []
            for result in response.results:
                original_chunk = chunks[result.index]
                
                # Update score with Cohere relevance score
                original_chunk.score = result.relevance_score
                original_chunk.metadata['original_rank'] = result.index
                original_chunk.metadata['rerank_score'] = result.relevance_score
                original_chunk.metadata['reranked'] = True
                
                reranked.append(original_chunk)
            
            logger.info(
                "reranking_complete",
                query=query[:50],
                original_count=len(chunks),
                reranked_count=len(reranked),
                model=rerank_model
            )
            
            return reranked
            
        except Exception as e:
            logger.error(
                "reranking_failed",
                query=query[:50],
                error=str(e)
            )
            # Fallback to original chunks
            return chunks
    
    async def rerank_with_fallback(
        self,
        query: str,
        chunks: List[ContextChunk],
        top_k: Optional[int] = None
    ) -> tuple[List[ContextChunk], bool]:
        """
        Rerank with fallback to original order
        
        Args:
            query: Search query
            chunks: Context chunks
            top_k: Number of results
            
        Returns:
            Tuple of (chunks, rerank_applied)
        """
        try:
            reranked = await self.rerank(query, chunks, top_k)
            
            # Check if reranking actually happened
            rerank_applied = any(
                chunk.metadata.get('reranked', False)
                for chunk in reranked
            )
            
            return reranked, rerank_applied
            
        except Exception as e:
            logger.error("rerank_with_fallback_failed", error=str(e))
            return chunks, False


# Singleton instance
_reranker: Optional[RerankerService] = None


async def get_reranker_service() -> RerankerService:
    """Get or create reranker service singleton"""
    global _reranker
    
    if _reranker is None:
        _reranker = RerankerService()
        await _reranker.initialize()
    
    return _reranker

