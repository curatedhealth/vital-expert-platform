"""
Vector Database Client for GraphRAG Service

Provides unified interface for vector search across:
- Pinecone (primary, cloud-based)
- pgvector (future, self-hosted)

Uses abstract base class for easy swapping between implementations.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import asyncio

import pinecone
from openai import AsyncOpenAI

from ..config import get_config
from ..models import VectorResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class VectorSearchQuery:
    """Vector search query parameters"""
    query_text: str
    top_k: int = 10
    similarity_threshold: float = 0.7
    filters: Optional[Dict[str, Any]] = None
    namespace: Optional[str] = None


class VectorDBClient(ABC):
    """Abstract base class for vector database clients"""
    
    @abstractmethod
    async def connect(self) -> None:
        """Initialize connection"""
        pass
        
    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection"""
        pass
        
    @abstractmethod
    async def health_check(self) -> bool:
        """Check connectivity"""
        pass
        
    @abstractmethod
    async def search(
        self,
        query: VectorSearchQuery,
        embedding: Optional[List[float]] = None
    ) -> List[VectorResult]:
        """Execute vector similarity search"""
        pass
        
    @abstractmethod
    async def upsert(
        self,
        vectors: List[Dict[str, Any]],
        namespace: Optional[str] = None
    ) -> int:
        """Upsert vectors into the database"""
        pass


class PineconeClient(VectorDBClient):
    """Pinecone vector database client"""
    
    def __init__(self):
        self.config = get_config()
        self.index = None
        self.openai_client = None
        
    async def connect(self) -> None:
        """Initialize Pinecone and OpenAI clients"""
        try:
            # Initialize Pinecone
            pinecone.init(
                api_key=self.config.database.pinecone_api_key,
                environment=self.config.database.pinecone_environment
            )
            
            self.index = pinecone.Index(self.config.database.pinecone_index_name)
            
            # Initialize OpenAI for embeddings
            self.openai_client = AsyncOpenAI(
                api_key=self.config.embedding.openai_api_key
            )
            
            logger.info(f"Pinecone client initialized (index={self.config.database.pinecone_index_name})")
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone client: {e}")
            raise
            
    async def disconnect(self) -> None:
        """Close connections"""
        if self.openai_client:
            await self.openai_client.close()
            self.openai_client = None
        self.index = None
        logger.info("Pinecone client closed")
        
    async def health_check(self) -> bool:
        """Check Pinecone connectivity"""
        try:
            if self.index is None:
                return False
            # Simple stats query to verify connectivity
            stats = self.index.describe_index_stats()
            return stats is not None
        except Exception as e:
            logger.error(f"Pinecone health check failed: {e}")
            return False
            
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI"""
        if self.openai_client is None:
            raise RuntimeError("OpenAI client not initialized")
            
        try:
            response = await self.openai_client.embeddings.create(
                model=self.config.embedding.model_name,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
            
    async def search(
        self,
        query: VectorSearchQuery,
        embedding: Optional[List[float]] = None
    ) -> List[VectorResult]:
        """
        Execute vector similarity search in Pinecone
        
        Args:
            query: Search query parameters
            embedding: Pre-computed embedding (if None, will generate from query_text)
            
        Returns:
            List of VectorResult objects sorted by similarity
        """
        if self.index is None:
            raise RuntimeError("Pinecone index not initialized")
            
        try:
            # Generate embedding if not provided
            if embedding is None:
                embedding = await self.generate_embedding(query.query_text)
                
            # Execute query
            response = await asyncio.to_thread(
                self.index.query,
                vector=embedding,
                top_k=query.top_k,
                filter=query.filters,
                namespace=query.namespace,
                include_metadata=True
            )
            
            # Convert to VectorResult objects
            results = []
            for match in response.matches:
                # Filter by similarity threshold
                if match.score >= query.similarity_threshold:
                    results.append(VectorResult(
                        id=match.id,
                        score=match.score,
                        metadata=match.metadata or {},
                        text=match.metadata.get('text', '') if match.metadata else ''
                    ))
                    
            logger.info(f"Pinecone search returned {len(results)}/{len(response.matches)} results above threshold")
            return results
            
        except Exception as e:
            logger.error(f"Pinecone search failed: {e}")
            raise
            
    async def upsert(
        self,
        vectors: List[Dict[str, Any]],
        namespace: Optional[str] = None
    ) -> int:
        """
        Upsert vectors into Pinecone
        
        Args:
            vectors: List of dicts with 'id', 'values', 'metadata'
            namespace: Optional namespace
            
        Returns:
            Number of vectors upserted
        """
        if self.index is None:
            raise RuntimeError("Pinecone index not initialized")
            
        try:
            response = await asyncio.to_thread(
                self.index.upsert,
                vectors=vectors,
                namespace=namespace
            )
            
            upserted_count = response.upserted_count
            logger.info(f"Upserted {upserted_count} vectors to Pinecone")
            return upserted_count
            
        except Exception as e:
            logger.error(f"Pinecone upsert failed: {e}")
            raise


class PgVectorClient(VectorDBClient):
    """
    PostgreSQL pgvector client (future implementation)
    
    This is a placeholder for future self-hosted vector DB support.
    Currently returns mock responses.
    """
    
    async def connect(self) -> None:
        logger.warning("PgVector client is not yet implemented - using mock")
        
    async def disconnect(self) -> None:
        pass
        
    async def health_check(self) -> bool:
        return False
        
    async def search(
        self,
        query: VectorSearchQuery,
        embedding: Optional[List[float]] = None
    ) -> List[VectorResult]:
        logger.warning("PgVector search not implemented - returning empty results")
        return []
        
    async def upsert(
        self,
        vectors: List[Dict[str, Any]],
        namespace: Optional[str] = None
    ) -> int:
        logger.warning("PgVector upsert not implemented")
        return 0


# Factory function to get appropriate client
def create_vector_client() -> VectorDBClient:
    """Create vector DB client based on configuration"""
    config = get_config()
    
    if config.database.vector_db_type == "pinecone":
        return PineconeClient()
    elif config.database.vector_db_type == "pgvector":
        return PgVectorClient()
    else:
        raise ValueError(f"Unsupported vector DB type: {config.database.vector_db_type}")


# Singleton instance
_vector_client: Optional[VectorDBClient] = None


async def get_vector_client() -> VectorDBClient:
    """Get or create vector DB client singleton"""
    global _vector_client
    if _vector_client is None:
        _vector_client = create_vector_client()
        await _vector_client.connect()
    return _vector_client


async def close_vector_client() -> None:
    """Close vector DB client"""
    global _vector_client
    if _vector_client is not None:
        await _vector_client.disconnect()
        _vector_client = None

