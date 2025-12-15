"""
Local Cross-Encoder Reranker Service
Provides BGE-Reranker fallback when Cohere is unavailable

This is a cost-effective, privacy-preserving alternative to Cohere reranking.
Uses BAAI/bge-reranker-base or ms-marco-MiniLM-L-12-v2 cross-encoder models.
"""

from typing import List, Optional, Tuple, Dict, Any
from dataclasses import dataclass
import asyncio
import structlog

logger = structlog.get_logger()

# Lazy import to avoid startup overhead if not used
_cross_encoder = None
_model_loaded = False
_model_name = None


@dataclass
class RerankResult:
    """Result from local reranking"""
    index: int
    score: float
    text: str


class LocalCrossEncoderReranker:
    """
    Local cross-encoder reranker using sentence-transformers

    Supported models (in order of preference):
    1. BAAI/bge-reranker-base - Best accuracy/speed tradeoff
    2. BAAI/bge-reranker-large - Higher accuracy, slower
    3. cross-encoder/ms-marco-MiniLM-L-12-v2 - Fast, good accuracy

    Performance characteristics:
    - bge-reranker-base: ~50ms for 20 docs on CPU, ~10ms on GPU
    - ms-marco-MiniLM: ~30ms for 20 docs on CPU
    """

    SUPPORTED_MODELS = [
        "BAAI/bge-reranker-base",
        "BAAI/bge-reranker-large",
        "cross-encoder/ms-marco-MiniLM-L-12-v2",
        "cross-encoder/ms-marco-MiniLM-L-6-v2",  # Fastest
    ]

    DEFAULT_MODEL = "BAAI/bge-reranker-base"

    def __init__(self, model_name: Optional[str] = None):
        """
        Initialize local reranker

        Args:
            model_name: Model to use (default: BAAI/bge-reranker-base)
        """
        self.model_name = model_name or self.DEFAULT_MODEL
        self._model = None
        self._initialized = False

    async def initialize(self) -> bool:
        """
        Lazily load the cross-encoder model

        Returns:
            True if model loaded successfully
        """
        if self._initialized:
            return True

        try:
            # Run model loading in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            self._model = await loop.run_in_executor(
                None, self._load_model
            )
            self._initialized = True
            logger.info(
                "local_reranker_initialized",
                model=self.model_name
            )
            return True

        except ImportError as e:
            logger.warning(
                "local_reranker_import_error",
                error=str(e),
                hint="Install: pip install sentence-transformers"
            )
            return False

        except Exception as e:
            logger.error(
                "local_reranker_init_failed",
                model=self.model_name,
                error=str(e)
            )
            return False

    def _load_model(self):
        """Load cross-encoder model (blocking, run in thread pool)"""
        from sentence_transformers import CrossEncoder

        logger.info(
            "loading_cross_encoder_model",
            model=self.model_name
        )

        model = CrossEncoder(
            self.model_name,
            max_length=512,  # Limit context length for speed
            device="cpu"  # Use CPU by default; set to "cuda" if GPU available
        )

        return model

    async def rerank(
        self,
        query: str,
        documents: List[str],
        top_k: Optional[int] = None
    ) -> List[RerankResult]:
        """
        Rerank documents using local cross-encoder

        Args:
            query: Search query
            documents: List of document texts to rerank
            top_k: Number of top results to return (default: all)

        Returns:
            List of RerankResult sorted by relevance score
        """
        if not documents:
            return []

        # Initialize model if not already done
        if not self._initialized:
            success = await self.initialize()
            if not success:
                logger.warning("local_reranker_not_available")
                # Return original order with placeholder scores
                return [
                    RerankResult(index=i, score=1.0 - (i * 0.01), text=doc)
                    for i, doc in enumerate(documents)
                ]

        try:
            # Create (query, document) pairs
            pairs = [(query, doc) for doc in documents]

            # Run prediction in thread pool
            loop = asyncio.get_event_loop()
            scores = await loop.run_in_executor(
                None, lambda: self._model.predict(pairs)
            )

            # Create results with scores
            results = [
                RerankResult(index=i, score=float(score), text=documents[i])
                for i, score in enumerate(scores)
            ]

            # Sort by score descending
            results.sort(key=lambda x: x.score, reverse=True)

            # Limit to top_k if specified
            if top_k:
                results = results[:top_k]

            logger.info(
                "local_rerank_complete",
                query=query[:50],
                documents_count=len(documents),
                top_score=results[0].score if results else 0.0
            )

            return results

        except Exception as e:
            logger.error(
                "local_rerank_failed",
                query=query[:50],
                error=str(e)
            )
            # Return original order on failure
            return [
                RerankResult(index=i, score=1.0 - (i * 0.01), text=doc)
                for i, doc in enumerate(documents)
            ]

    async def rerank_chunks(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        text_key: str = "text",
        top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Rerank chunk dictionaries (convenience method)

        Args:
            query: Search query
            chunks: List of chunk dictionaries
            text_key: Key containing text in each chunk
            top_k: Number of top results

        Returns:
            Reranked chunks with added rerank_score
        """
        if not chunks:
            return []

        # Extract texts
        texts = [chunk.get(text_key, "") for chunk in chunks]

        # Rerank
        results = await self.rerank(query, texts, top_k)

        # Map back to chunks
        reranked_chunks = []
        for result in results:
            chunk = chunks[result.index].copy()
            chunk["rerank_score"] = result.score
            chunk["original_index"] = result.index
            chunk["reranked"] = True
            reranked_chunks.append(chunk)

        return reranked_chunks


# Singleton instance
_local_reranker: Optional[LocalCrossEncoderReranker] = None


async def get_local_reranker(
    model_name: Optional[str] = None
) -> LocalCrossEncoderReranker:
    """
    Get or create local reranker singleton

    Args:
        model_name: Optional model override

    Returns:
        Initialized LocalCrossEncoderReranker
    """
    global _local_reranker

    if _local_reranker is None:
        _local_reranker = LocalCrossEncoderReranker(model_name)
        await _local_reranker.initialize()

    return _local_reranker


# Quick test function
async def test_local_reranker():
    """Test the local reranker"""
    reranker = await get_local_reranker()

    query = "What are the side effects of metformin?"
    documents = [
        "Metformin is a medication used to treat type 2 diabetes.",
        "Common side effects of metformin include nausea, diarrhea, and stomach upset.",
        "The weather today is sunny with a high of 75 degrees.",
        "Metformin may cause lactic acidosis in rare cases, especially in patients with kidney problems.",
    ]

    results = await reranker.rerank(query, documents, top_k=3)

    print("\n=== Local Reranker Test ===")
    print(f"Query: {query}")
    print("\nResults:")
    for i, result in enumerate(results, 1):
        print(f"{i}. Score: {result.score:.4f}")
        print(f"   Text: {result.text[:80]}...")
        print()


if __name__ == "__main__":
    asyncio.run(test_local_reranker())
