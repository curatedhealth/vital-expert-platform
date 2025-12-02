"""
Embedding Service - Semantic Search for Long-Term Memory

Generates vector embeddings for memory content using OpenAI or sentence transformers.
Enables semantic similarity search across stored memories.

Golden Rules Compliance:
✅ #1: Pure Python (OpenAI API / sentence-transformers)
✅ #2: Caching integrated
✅ #3: Tenant-aware
✅ #4: Supports RAG/memory operations

Features:
- OpenAI embeddings (3072-dim for text-embedding-3-large) - DEFAULT
- Sentence transformer embeddings (768-dim) - fallback
- Batch processing for efficiency
- Caching for performance
- Error handling with fallbacks
- Provider selection via EMBEDDING_PROVIDER env var

Usage:
    >>> service = EmbeddingService()
    >>> await service.initialize()
    >>> embedding = await service.embed_text("FDA IND requirements")
    >>> embeddings = await service.embed_texts(["query1", "query2"])
"""

import asyncio
from typing import List, Optional, Union
from datetime import datetime, timezone
import numpy as np
import structlog
from pydantic import BaseModel, Field

# OpenAI for embeddings (primary)
try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    AsyncOpenAI = None

# Sentence transformers for embeddings (fallback)
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None

from services.cache_manager import CacheManager
from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class EmbeddingResult(BaseModel):
    """Result of embedding operation."""
    embedding: List[float] = Field(..., description="Vector embedding (768-dim)")
    model: str = Field(..., description="Model used for embedding")
    dimension: int = Field(..., description="Embedding dimension")
    duration_ms: float = Field(..., description="Time taken to generate embedding")


class EmbeddingService:
    """
    Service for generating semantic embeddings.

    Supports two providers:
    1. OpenAI (DEFAULT): text-embedding-3-large (3072-dim) - matches Pinecone index
    2. HuggingFace/sentence-transformers: all-mpnet-base-v2 (768-dim) - fallback

    Provider selection via EMBEDDING_PROVIDER env var ('openai' or 'huggingface').
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        cache_manager: Optional[CacheManager] = None,
        use_cache: bool = True,
        provider: Optional[str] = None
    ):
        """
        Initialize embedding service.

        Args:
            model_name: Model to use (auto-selected based on provider if not specified)
            cache_manager: Cache manager for embedding caching
            use_cache: Whether to cache embeddings
            provider: 'openai' or 'huggingface' (defaults to settings.embedding_provider)
        """
        # Determine provider (default to openai if API key available)
        self.provider = provider or settings.embedding_provider

        # Set model name based on provider
        if model_name:
            self.model_name = model_name
        elif self.provider == "openai":
            self.model_name = settings.openai_embedding_model  # text-embedding-3-large
        else:
            self.model_name = "sentence-transformers/all-mpnet-base-v2"

        self.cache_manager = cache_manager or CacheManager()
        self.use_cache = use_cache

        # Provider-specific attributes
        self.openai_client: Optional[AsyncOpenAI] = None
        self.st_model: Optional[SentenceTransformer] = None

        # Set embedding dimension based on provider/model
        if self.provider == "openai":
            # text-embedding-3-large = 3072, text-embedding-3-small = 1536
            self.embedding_dim = 3072 if "large" in self.model_name else 1536
        else:
            self.embedding_dim = 768  # Default for all-mpnet-base-v2

        self._initialized = False

        # Log provider selection
        logger.info(
            "EmbeddingService configured",
            provider=self.provider,
            model=self.model_name,
            dimension=self.embedding_dim
        )
    
    async def initialize(self):
        """Initialize the embedding model/client (lazy loading)."""
        if self._initialized:
            return

        try:
            if self.provider == "openai":
                # Initialize OpenAI client
                if not OPENAI_AVAILABLE:
                    raise RuntimeError(
                        "openai package not installed. "
                        "Install with: pip install openai"
                    )

                api_key = settings.openai_api_key
                if not api_key:
                    raise RuntimeError(
                        "OPENAI_API_KEY not set. "
                        "Set the environment variable to use OpenAI embeddings."
                    )

                logger.info(
                    "Initializing OpenAI embedding client",
                    model=self.model_name,
                    dimension=self.embedding_dim
                )

                self.openai_client = AsyncOpenAI(api_key=api_key)
                self._initialized = True

                logger.info(
                    "✅ OpenAI embedding client initialized",
                    model=self.model_name,
                    dimension=self.embedding_dim
                )

            else:
                # Initialize sentence-transformers (fallback)
                if not SENTENCE_TRANSFORMERS_AVAILABLE:
                    raise RuntimeError(
                        "sentence-transformers not installed. "
                        "Install with: pip install sentence-transformers"
                    )

                logger.info("Loading sentence-transformers model", model=self.model_name)

                # Load model in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                self.st_model = await loop.run_in_executor(
                    None,
                    lambda: SentenceTransformer(self.model_name)
                )

                # Get actual embedding dimension
                test_embedding = self.st_model.encode(["test"], convert_to_numpy=True)
                self.embedding_dim = test_embedding.shape[1]

                self._initialized = True

                logger.info(
                    "✅ Sentence-transformers model loaded",
                    model=self.model_name,
                    dimension=self.embedding_dim
                )

        except Exception as e:
            logger.error("Failed to initialize embedding service", error=str(e))
            raise
    
    async def embed_text(
        self,
        text: str,
        cache_key_prefix: str = "embedding"
    ) -> EmbeddingResult:
        """
        Generate embedding for a single text.

        Args:
            text: Text to embed
            cache_key_prefix: Prefix for cache key

        Returns:
            EmbeddingResult with vector and metadata
        """
        await self.initialize()

        # Check cache first
        if self.use_cache:
            cache_key = f"{cache_key_prefix}:{self.provider}:{hash(text)}"
            cached = await self.cache_manager.get(cache_key)
            if cached:
                logger.debug("Embedding cache hit", text_preview=text[:50])
                return EmbeddingResult(**cached)

        # Generate embedding
        start_time = datetime.now(timezone.utc)

        try:
            if self.provider == "openai":
                # Use OpenAI API
                response = await self.openai_client.embeddings.create(
                    model=self.model_name,
                    input=text
                )
                embedding_list = response.data[0].embedding
            else:
                # Use sentence-transformers
                loop = asyncio.get_event_loop()
                embedding_array = await loop.run_in_executor(
                    None,
                    lambda: self.st_model.encode([text], convert_to_numpy=True)[0]
                )
                embedding_list = embedding_array.tolist()

            duration_ms = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000

            result = EmbeddingResult(
                embedding=embedding_list,
                model=self.model_name,
                dimension=len(embedding_list),
                duration_ms=duration_ms
            )

            # Cache the result
            if self.use_cache:
                await self.cache_manager.set(
                    cache_key,
                    result.model_dump(),
                    ttl=86400  # 24 hours
                )

            logger.debug(
                "Embedding generated",
                provider=self.provider,
                text_length=len(text),
                dimension=len(embedding_list),
                duration_ms=duration_ms
            )

            return result

        except Exception as e:
            logger.error("Embedding generation failed", provider=self.provider, error=str(e))
            raise
    
    async def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a query (compatibility method).

        This method provides compatibility with code expecting embed_query().
        Returns raw embedding vector as list of floats.

        Args:
            query: Query text to embed

        Returns:
            List of floats representing the embedding vector
        """
        result = await self.embed_text(query, cache_key_prefix="query")
        return result.embedding

    async def embed_texts(
        self,
        texts: List[str],
        batch_size: int = 32,
        cache_key_prefix: str = "embedding"
    ) -> List[EmbeddingResult]:
        """
        Generate embeddings for multiple texts (batched for efficiency).

        Args:
            texts: List of texts to embed
            batch_size: Batch size for processing
            cache_key_prefix: Prefix for cache keys

        Returns:
            List of EmbeddingResult objects
        """
        await self.initialize()

        if not texts:
            return []

        results = []
        start_time = datetime.now(timezone.utc)

        try:
            # Check cache for all texts
            cached_results = []
            uncached_texts = []
            uncached_indices = []

            if self.use_cache:
                for i, text in enumerate(texts):
                    cache_key = f"{cache_key_prefix}:{self.provider}:{hash(text)}"
                    cached = await self.cache_manager.get(cache_key)
                    if cached:
                        cached_results.append((i, EmbeddingResult(**cached)))
                    else:
                        uncached_texts.append(text)
                        uncached_indices.append(i)
            else:
                uncached_texts = texts
                uncached_indices = list(range(len(texts)))

            # Generate embeddings for uncached texts
            if uncached_texts:
                if self.provider == "openai":
                    # Use OpenAI API (supports batch embedding natively)
                    response = await self.openai_client.embeddings.create(
                        model=self.model_name,
                        input=uncached_texts
                    )
                    embeddings_list = [d.embedding for d in response.data]
                else:
                    # Use sentence-transformers
                    loop = asyncio.get_event_loop()
                    embeddings_array = await loop.run_in_executor(
                        None,
                        lambda: self.st_model.encode(
                            uncached_texts,
                            batch_size=batch_size,
                            convert_to_numpy=True
                        )
                    )
                    embeddings_list = [arr.tolist() for arr in embeddings_array]

                # Create results for newly generated embeddings
                for idx, text, embedding_list in zip(
                    uncached_indices,
                    uncached_texts,
                    embeddings_list
                ):
                    result = EmbeddingResult(
                        embedding=embedding_list,
                        model=self.model_name,
                        dimension=len(embedding_list),
                        duration_ms=0  # Batch duration calculated below
                    )

                    # Cache the result
                    if self.use_cache:
                        cache_key = f"{cache_key_prefix}:{self.provider}:{hash(text)}"
                        await self.cache_manager.set(
                            cache_key,
                            result.model_dump(),
                            ttl=86400
                        )

                    cached_results.append((idx, result))

            # Sort by original index and extract results
            cached_results.sort(key=lambda x: x[0])
            results = [result for _, result in cached_results]

            duration_ms = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000

            logger.info(
                "✅ Batch embeddings generated",
                provider=self.provider,
                total_texts=len(texts),
                cached=len(texts) - len(uncached_texts),
                generated=len(uncached_texts),
                duration_ms=duration_ms
            )

            return results

        except Exception as e:
            logger.error("Batch embedding generation failed", provider=self.provider, error=str(e))
            raise
    
    async def compute_similarity(
        self,
        embedding1: List[float],
        embedding2: List[float]
    ) -> float:
        """
        Compute cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Similarity score (0-1, higher is more similar)
        """
        try:
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            # Cosine similarity
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            similarity = dot_product / (norm1 * norm2)
            
            # Normalize to 0-1 range
            similarity = (similarity + 1) / 2
            
            return float(similarity)
            
        except Exception as e:
            logger.error("Similarity computation failed", error=str(e))
            return 0.0
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by this service."""
        return self.embedding_dim
    
    async def health_check(self) -> bool:
        """Check if the service is healthy and ready."""
        try:
            await self.initialize()
            # Generate a test embedding
            test_result = await self.embed_text("test", cache_key_prefix="health_check")
            return len(test_result.embedding) == self.embedding_dim
        except Exception as e:
            logger.error("Embedding service health check failed", error=str(e))
            return False


# Global instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service(
    model_name: Optional[str] = None,
    cache_manager: Optional[CacheManager] = None,
    provider: Optional[str] = None
) -> EmbeddingService:
    """
    Get or create global embedding service instance.

    Default provider is 'openai' using text-embedding-3-large (3072-dim).
    To use sentence-transformers, set EMBEDDING_PROVIDER=huggingface.
    """
    global _embedding_service

    if _embedding_service is None:
        _embedding_service = EmbeddingService(
            model_name=model_name,
            cache_manager=cache_manager,
            provider=provider
        )

    return _embedding_service

