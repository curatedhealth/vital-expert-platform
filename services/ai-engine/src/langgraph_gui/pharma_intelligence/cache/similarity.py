"""
Query similarity detection using embeddings.

Uses OpenAI's text-embedding-3-small model for cost-effective similarity detection.
Cost: ~$0.0001/1K tokens (very cheap compared to GPT-4).
"""

from typing import List, Tuple
import numpy as np
from openai import OpenAI
import hashlib


class QuerySimilarity:
    """Detect similar queries using embeddings."""
    
    def __init__(self, openai_api_key: str, similarity_threshold: float = 0.85):
        """
        Initialize similarity detector.
        
        Args:
            openai_api_key: OpenAI API key
            similarity_threshold: Minimum similarity score (0-1) for cache hit
        """
        self.client = OpenAI(api_key=openai_api_key)
        self.similarity_threshold = similarity_threshold
        self.model = "text-embedding-3-small"  # Cheapest embedding model
        
    def get_embedding(self, text: str) -> List[float]:
        """
        Get embedding vector for text.
        
        Args:
            text: Query text to embed
            
        Returns:
            Embedding vector
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text.strip()
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Warning: Embedding generation failed: {e}")
            return None
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            vec1: First embedding vector
            vec2: Second embedding vector
            
        Returns:
            Similarity score (0-1)
        """
        if vec1 is None or vec2 is None:
            return 0.0
            
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        return float(dot_product / (norm1 * norm2))
    
    def is_similar(self, query1: str, query2: str) -> Tuple[bool, float]:
        """
        Check if two queries are similar enough for cache hit.
        
        Args:
            query1: First query
            query2: Second query
            
        Returns:
            Tuple of (is_similar, similarity_score)
        """
        # Quick check: identical queries
        if query1.strip().lower() == query2.strip().lower():
            return True, 1.0
        
        # Get embeddings
        emb1 = self.get_embedding(query1)
        emb2 = self.get_embedding(query2)
        
        if emb1 is None or emb2 is None:
            return False, 0.0
        
        # Calculate similarity
        similarity = self.cosine_similarity(emb1, emb2)
        
        return similarity >= self.similarity_threshold, similarity
    
    def find_most_similar(
        self, 
        query: str, 
        cached_queries: List[Tuple[str, List[float]]]
    ) -> Tuple[str, float]:
        """
        Find most similar query from cached queries.
        
        Args:
            query: New query to match
            cached_queries: List of (query_text, embedding) tuples
            
        Returns:
            Tuple of (most_similar_query, similarity_score)
        """
        query_emb = self.get_embedding(query)
        
        if query_emb is None or not cached_queries:
            return None, 0.0
        
        max_similarity = 0.0
        most_similar = None
        
        for cached_query, cached_emb in cached_queries:
            if cached_emb is None:
                continue
                
            similarity = self.cosine_similarity(query_emb, cached_emb)
            
            if similarity > max_similarity:
                max_similarity = similarity
                most_similar = cached_query
        
        return most_similar, max_similarity
    
    @staticmethod
    def generate_cache_key(query: str) -> str:
        """
        Generate cache key from query.
        
        Args:
            query: Query text
            
        Returns:
            Cache key (hash)
        """
        return hashlib.sha256(query.strip().lower().encode()).hexdigest()[:16]


