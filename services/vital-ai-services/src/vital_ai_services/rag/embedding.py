"""
Embedding Services for RAG

TAG: SHARED_AI_SERVICES_LIBRARY

Provides embedding generation for text using OpenAI or HuggingFace.
"""

from typing import List
import asyncio
import structlog
from langchain_openai import OpenAIEmbeddings

logger = structlog.get_logger()


class EmbeddingService:
    """
    Base embedding service interface.
    """
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text."""
        raise NotImplementedError


class OpenAIEmbeddingService(EmbeddingService):
    """
    OpenAI embedding service using text-embedding-3-large.
    """
    
    def __init__(self, api_key: str, model: str = "text-embedding-3-large"):
        """
        Initialize OpenAI embedding service.
        
        Args:
            api_key: OpenAI API key
            model: Embedding model name (default: text-embedding-3-large)
        """
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=api_key,
            model=model,
            chunk_size=1000
        )
        self.model = model
        logger.info(f"✅ OpenAIEmbeddingService initialized (model: {model})")
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for text.
        
        Args:
            text: Input text
            
        Returns:
            Embedding vector (list of floats)
        """
        try:
            # Run sync embedding in thread pool
            embedding = await asyncio.to_thread(self.embeddings.embed_query, text)
            return embedding
        except Exception as e:
            logger.error(f"❌ Failed to generate OpenAI embedding: {e}")
            raise


class HuggingFaceEmbeddingService(EmbeddingService):
    """
    HuggingFace embedding service (placeholder for future implementation).
    """
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize HuggingFace embedding service.
        
        Args:
            model_name: HuggingFace model name
        """
        self.model_name = model_name
        logger.info(f"✅ HuggingFaceEmbeddingService initialized (model: {model_name})")
        logger.warning("⚠️ HuggingFace embedding service not yet implemented")
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using HuggingFace model."""
        raise NotImplementedError("HuggingFace embedding service not yet implemented")

