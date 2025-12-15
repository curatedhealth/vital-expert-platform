"""
Reranking Service
Implements Cohere reranking with BGE-Reranker local fallback

Supports two modes:
1. Cohere API (primary) - Best accuracy, requires API key
2. BGE-Reranker (fallback) - Local model, no API costs, 90%+ Cohere quality
"""

from typing import List, Optional
import structlog

from graphrag.models import ContextChunk
from graphrag.config import get_graphrag_config

logger = structlog.get_logger()

# Lazy import for local reranker
_local_reranker_class = None


def _get_local_reranker_class():
    """Lazy import LocalCrossEncoderReranker to avoid startup overhead"""
    global _local_reranker_class
    if _local_reranker_class is None:
        try:
            from services.local_reranker import LocalCrossEncoderReranker
            _local_reranker_class = LocalCrossEncoderReranker
        except ImportError:
            logger.warning("local_reranker_not_available")
            _local_reranker_class = False  # Mark as attempted but failed
    return _local_reranker_class if _local_reranker_class else None


class RerankerService:
    """
    Production-ready reranking service with tiered fallback

    Features:
    - Cohere Rerank API integration (primary)
    - BGE-Reranker local fallback (secondary)
    - Result reordering based on query relevance
    - Configurable rerank model
    - Graceful degradation when APIs unavailable

    Fallback Order:
    1. Cohere API (best accuracy, ~50ms)
    2. BGE-Reranker local (90%+ accuracy, ~30-50ms CPU)
    3. Original order (no reranking applied)
    """

    def __init__(self):
        self.config = get_graphrag_config()
        self._client = None
        self._local_reranker = None
        self._use_local_fallback = True  # Enable local fallback by default

    async def initialize(self):
        """Initialize Cohere client with local fallback"""
        # Try to initialize Cohere (primary)
        try:
            import cohere  # type: ignore

            if self.config.cohere_api_key:
                self._client = cohere.AsyncClient(self.config.cohere_api_key)
                logger.info("cohere_reranker_initialized")
            else:
                logger.warning("cohere_api_key_not_configured", fallback="local_reranker")

        except ImportError:
            logger.warning("cohere_library_not_installed", fallback="local_reranker")

        # Initialize local fallback if Cohere not available
        if not self._client and self._use_local_fallback:
            await self._initialize_local_fallback()

    async def _initialize_local_fallback(self):
        """Initialize BGE-Reranker as local fallback"""
        LocalRerankerClass = _get_local_reranker_class()
        if LocalRerankerClass:
            try:
                self._local_reranker = LocalRerankerClass()
                success = await self._local_reranker.initialize()
                if success:
                    logger.info("local_reranker_initialized", model=self._local_reranker.model_name)
                else:
                    self._local_reranker = None
                    logger.warning("local_reranker_init_failed")
            except Exception as e:
                logger.error("local_reranker_setup_failed", error=str(e))
                self._local_reranker = None
    
    async def rerank(
        self,
        query: str,
        chunks: List[ContextChunk],
        top_k: Optional[int] = None,
        model: Optional[str] = None
    ) -> List[ContextChunk]:
        """
        Rerank context chunks using Cohere (primary) or local BGE-Reranker (fallback)

        Args:
            query: Search query
            chunks: Context chunks to rerank
            top_k: Number of results to return (None = all)
            model: Rerank model to use (Cohere only)

        Returns:
            Reranked chunks with updated scores
        """
        if not chunks:
            return chunks

        # Try Cohere first (primary)
        if self._client:
            result = await self._rerank_with_cohere(query, chunks, top_k, model)
            if result is not None:
                return result

        # Try local BGE-Reranker (fallback)
        if self._local_reranker:
            result = await self._rerank_with_local(query, chunks, top_k)
            if result is not None:
                return result

        # No reranking available
        logger.info("reranker_skipped", reason="no_reranker_available")
        return chunks

    async def _rerank_with_cohere(
        self,
        query: str,
        chunks: List[ContextChunk],
        top_k: Optional[int],
        model: Optional[str]
    ) -> Optional[List[ContextChunk]]:
        """Rerank using Cohere API"""
        try:
            documents = [chunk.text for chunk in chunks]
            rerank_model = model or self.config.rerank_model

            response = await self._client.rerank(
                query=query,
                documents=documents,
                top_n=top_k or len(documents),
                model=rerank_model
            )

            reranked = []
            for result in response.results:
                original_chunk = chunks[result.index]
                original_chunk.score = result.relevance_score
                original_chunk.metadata['original_rank'] = result.index
                original_chunk.metadata['rerank_score'] = result.relevance_score
                original_chunk.metadata['reranked'] = True
                original_chunk.metadata['rerank_model'] = 'cohere'
                reranked.append(original_chunk)

            logger.info(
                "cohere_reranking_complete",
                query=query[:50],
                original_count=len(chunks),
                reranked_count=len(reranked),
                model=rerank_model
            )
            return reranked

        except Exception as e:
            logger.warning(
                "cohere_reranking_failed",
                query=query[:50],
                error=str(e),
                fallback="local_reranker"
            )
            return None

    async def _rerank_with_local(
        self,
        query: str,
        chunks: List[ContextChunk],
        top_k: Optional[int]
    ) -> Optional[List[ContextChunk]]:
        """Rerank using local BGE-Reranker"""
        try:
            documents = [chunk.text for chunk in chunks]
            results = await self._local_reranker.rerank(query, documents, top_k)

            reranked = []
            for result in results:
                original_chunk = chunks[result.index]
                original_chunk.score = result.score
                original_chunk.metadata['original_rank'] = result.index
                original_chunk.metadata['rerank_score'] = result.score
                original_chunk.metadata['reranked'] = True
                original_chunk.metadata['rerank_model'] = 'bge-reranker-local'
                reranked.append(original_chunk)

            logger.info(
                "local_reranking_complete",
                query=query[:50],
                original_count=len(chunks),
                reranked_count=len(reranked),
                model=self._local_reranker.model_name
            )
            return reranked

        except Exception as e:
            logger.error(
                "local_reranking_failed",
                query=query[:50],
                error=str(e)
            )
            return None
    
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

