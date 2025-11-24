"""
Vector Search Implementation
Semantic similarity search using embeddings
"""

from typing import List, Optional
import structlog
from openai import AsyncOpenAI

from ..models import ContextChunk, SearchSource
from ..clients.vector_db_client import get_vector_client, VectorSearchResult
from ..config import get_graphrag_config

logger = structlog.get_logger()


class VectorSearch:
    """
    Semantic vector search using embeddings
    
    Features:
    - OpenAI embeddings (text-embedding-3-small)
    - Pinecone/pgvector similarity search
    - Metadata filtering
    - Score normalization
    """
    
    def __init__(self):
        self.config = get_graphrag_config()
        self.openai_client = AsyncOpenAI(api_key=self.config.openai_api_key)
        self.embedding_model = self.config.embedding_model
        self.embedding_dimension = self.config.embedding_dimension
    
    async def search(
        self,
        query: str,
        top_k: int = 10,
        min_score: float = 0.7,
        filter_dict: Optional[dict] = None
    ) -> List[ContextChunk]:
        """
        Perform semantic vector search
        
        Args:
            query: Search query
            top_k: Number of results
            min_score: Minimum similarity threshold
            filter_dict: Optional metadata filters
            
        Returns:
            List of context chunks
        """
        try:
            # Step 1: Generate query embedding
            embedding = await self._generate_embedding(query)
            
            # Step 2: Search vector database
            vector_client = await get_vector_client(
                provider=self.config.vector_provider
            )
            
            results = await vector_client.search(
                embedding=embedding,
                top_k=top_k,
                filter_dict=filter_dict,
                min_score=min_score
            )
            
            # Step 3: Convert to ContextChunks
            chunks = self._convert_to_chunks(results)
            
            logger.info(
                "vector_search_complete",
                query=query[:50],
                results_count=len(chunks),
                min_score=min_score
            )
            
            return chunks
            
        except Exception as e:
            logger.error(
                "vector_search_failed",
                query=query[:50],
                error=str(e)
            )
            return []
    
    async def _generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text
        
        Args:
            text: Input text
            
        Returns:
            Embedding vector
        """
        try:
            response = await self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            
            embedding = response.data[0].embedding
            
            logger.debug(
                "embedding_generated",
                text_length=len(text),
                embedding_dim=len(embedding)
            )
            
            return embedding
            
        except Exception as e:
            logger.error(
                "embedding_generation_failed",
                text_length=len(text),
                error=str(e)
            )
            raise
    
    def _convert_to_chunks(
        self,
        results: List[VectorSearchResult]
    ) -> List[ContextChunk]:
        """Convert vector search results to context chunks"""
        chunks = []
        
        for result in results:
            source = SearchSource(
                document_id=result.id,
                title=result.metadata.get('title'),
                url=result.metadata.get('url'),
                citation=result.metadata.get('citation')
            )
            
            chunk = ContextChunk(
                chunk_id=result.id,
                text=result.text or "",
                score=result.score,
                source=source,
                search_modality="vector",
                metadata=result.metadata
            )
            
            chunks.append(chunk)
        
        return chunks


# Singleton instance
_vector_search: Optional[VectorSearch] = None


def get_vector_search() -> VectorSearch:
    """Get or create vector search singleton"""
    global _vector_search
    
    if _vector_search is None:
        _vector_search = VectorSearch()
    
    return _vector_search

