"""
Vector Search Implementation for GraphRAG

Performs semantic similarity search using vector embeddings via Pinecone
"""

from typing import List, Optional, Dict, Any
import openai

from ..clients import get_vector_db_client
from ..models import RAGProfile, VectorResult
from ..utils.logger import get_logger
from ..config import get_config

logger = get_logger(__name__)


class VectorSearch:
    """Semantic similarity search using vector embeddings"""
    
    def __init__(self):
        self.vector_client = None
        self.openai_client = None
        self.config = None
        
    async def initialize(self):
        """Initialize vector database and OpenAI clients"""
        self.config = get_config()
        self.vector_client = await get_vector_db_client()
        self.openai_client = openai.AsyncOpenAI(
            api_key=self.config.embedding.openai_api_key
        )
        logger.info("VectorSearch initialized")
        
    async def search(
        self,
        query: str,
        profile: RAGProfile,
        metadata_filters: Optional[Dict[str, Any]] = None,
        namespace: str = "default"
    ) -> List[VectorResult]:
        """
        Perform vector similarity search
        
        Args:
            query: Natural language query
            profile: RAG profile with search parameters
            metadata_filters: Optional metadata filters for Pinecone
            namespace: Pinecone namespace (default: "default")
            
        Returns:
            List of VectorResult objects
        """
        try:
            # 1. Generate query embedding
            query_embedding = await self._generate_embedding(query)
            
            # 2. Merge metadata filters from profile and params
            filters = self._merge_filters(
                profile.metadata_filters,
                metadata_filters
            )
            
            # 3. Query Pinecone
            results = await self.vector_client.query(
                vector=query_embedding,
                top_k=profile.top_k,
                namespace=namespace,
                filter=filters,
                include_metadata=True
            )
            
            # 4. Filter by similarity threshold
            filtered_results = []
            for match in results.matches:
                if match.score >= profile.similarity_threshold:
                    vector_result = VectorResult(
                        id=match.id,
                        score=match.score,
                        text=match.metadata.get('text', ''),
                        metadata=match.metadata,
                        embedding=None  # Don't return embeddings (large)
                    )
                    filtered_results.append(vector_result)
                    
            logger.info(
                f"Vector search returned {len(filtered_results)} results "
                f"(threshold={profile.similarity_threshold}, top_k={profile.top_k})"
            )
            
            return filtered_results
            
        except Exception as e:
            logger.error(f"Vector search error: {e}")
            return []
            
    async def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI"""
        try:
            response = await self.openai_client.embeddings.create(
                model=self.config.embedding.model,
                input=text
            )
            return response.data[0].embedding
            
        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            raise
            
    def _merge_filters(
        self,
        profile_filters: Optional[Dict[str, Any]],
        request_filters: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Merge filters from profile and request
        
        Request filters take precedence and are combined with AND logic
        """
        if not profile_filters and not request_filters:
            return None
            
        if not profile_filters:
            return request_filters
            
        if not request_filters:
            return profile_filters
            
        # Combine with AND logic
        return {
            "$and": [profile_filters, request_filters]
        }


# Singleton instance
_vector_search: Optional[VectorSearch] = None


async def vector_search(
    query: str,
    profile: RAGProfile,
    metadata_filters: Optional[Dict[str, Any]] = None,
    namespace: str = "default"
) -> List[VectorResult]:
    """
    Convenience function for vector search
    
    Args:
        query: Natural language query
        profile: RAG profile with search parameters
        metadata_filters: Optional metadata filters
        namespace: Pinecone namespace
        
    Returns:
        List of VectorResult objects
    """
    global _vector_search
    if _vector_search is None:
        _vector_search = VectorSearch()
        await _vector_search.initialize()
    return await _vector_search.search(query, profile, metadata_filters, namespace)

