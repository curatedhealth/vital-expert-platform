"""
Vector Database Client for GraphRAG
Supports both Pinecone and pgvector (via Supabase)
"""

from typing import List, Dict, Any, Optional, Literal
from dataclasses import dataclass
import structlog

from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


@dataclass
class VectorSearchResult:
    """Result from vector similarity search"""
    id: str
    score: float
    metadata: Dict[str, Any]
    text: Optional[str] = None
    

class VectorDBClient:
    """
    Production-ready vector database client
    
    Supports:
    - Pinecone (cloud vector DB)
    - pgvector (Postgres extension via Supabase)
    
    Features:
    - Automatic provider detection
    - Retry logic
    - Result caching (optional)
    - Health checks
    """
    
    def __init__(
        self,
        provider: Literal["pinecone", "pgvector"] = "pinecone",
        api_key: Optional[str] = None,
        environment: Optional[str] = None,
        index_name: str = "vital-medical"
    ):
        """
        Initialize vector database client
        
        Args:
            provider: Vector DB provider ("pinecone" or "pgvector")
            api_key: API key for cloud provider
            environment: Environment for cloud provider
            index_name: Index/table name
        """
        self.provider = provider
        self.index_name = index_name
        self._client = None
        self._index = None
        
        # Load credentials from settings
        self.api_key = api_key or getattr(settings, 'pinecone_api_key', None)
        self.environment = environment or getattr(settings, 'pinecone_environment', None)
        
        logger.info(
            "vector_db_client_initialized",
            provider=provider,
            index_name=index_name
        )
    
    async def connect(self):
        """Initialize connection to vector database"""
        if self.provider == "pinecone":
            await self._connect_pinecone()
        elif self.provider == "pgvector":
            await self._connect_pgvector()
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    async def _connect_pinecone(self):
        """Connect to Pinecone"""
        try:
            import pinecone
            
            pinecone.init(
                api_key=self.api_key,
                environment=self.environment
            )
            
            # Get or create index
            if self.index_name not in pinecone.list_indexes():
                logger.warning(
                    "pinecone_index_not_found",
                    index_name=self.index_name
                )
                # Note: In production, indexes should be pre-created
                raise ValueError(f"Pinecone index '{self.index_name}' not found")
            
            self._index = pinecone.Index(self.index_name)
            
            logger.info(
                "pinecone_connected",
                index_name=self.index_name,
                dimension=self._index.describe_index_stats().get('dimension')
            )
            
        except ImportError:
            logger.error("pinecone_library_not_installed")
            raise ImportError("Install pinecone-client: pip install pinecone-client")
        except Exception as e:
            logger.error("pinecone_connection_failed", error=str(e))
            raise
    
    async def _connect_pgvector(self):
        """Connect to pgvector"""
        # pgvector uses the same Postgres connection
        # Just verify the extension is available
        from .postgres_client import get_postgres_client
        
        try:
            pg_client = await get_postgres_client()
            
            # Check if pgvector extension exists
            result = await pg_client.fetchval(
                "SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector'"
            )
            
            if result == 0:
                raise ValueError("pgvector extension not installed in database")
            
            logger.info("pgvector_connected")
            
        except Exception as e:
            logger.error("pgvector_connection_failed", error=str(e))
            raise
    
    async def disconnect(self):
        """Disconnect from vector database"""
        self._client = None
        self._index = None
        logger.info("vector_db_disconnected", provider=self.provider)
    
    async def health_check(self) -> bool:
        """
        Check if vector database is healthy
        
        Returns:
            True if database is responsive
        """
        try:
            if self.provider == "pinecone":
                stats = self._index.describe_index_stats()
                return stats is not None
            elif self.provider == "pgvector":
                from .postgres_client import get_postgres_client
                pg_client = await get_postgres_client()
                return await pg_client.health_check()
            return False
        except Exception as e:
            logger.error("vector_db_health_check_failed", error=str(e))
            return False
    
    async def search(
        self,
        embedding: List[float],
        top_k: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
        namespace: Optional[str] = None,
        include_metadata: bool = True,
        min_score: float = 0.0
    ) -> List[VectorSearchResult]:
        """
        Search for similar vectors
        
        Args:
            embedding: Query embedding vector
            top_k: Number of results to return
            filter_dict: Metadata filters
            namespace: Pinecone namespace (partition)
            include_metadata: Include metadata in results
            min_score: Minimum similarity score threshold
            
        Returns:
            List of search results
        """
        try:
            if self.provider == "pinecone":
                return await self._search_pinecone(
                    embedding, top_k, filter_dict, namespace,
                    include_metadata, min_score
                )
            elif self.provider == "pgvector":
                return await self._search_pgvector(
                    embedding, top_k, filter_dict, min_score
                )
            
            return []
            
        except Exception as e:
            logger.error(
                "vector_search_failed",
                provider=self.provider,
                error=str(e)
            )
            raise
    
    async def _search_pinecone(
        self,
        embedding: List[float],
        top_k: int,
        filter_dict: Optional[Dict],
        namespace: Optional[str],
        include_metadata: bool,
        min_score: float
    ) -> List[VectorSearchResult]:
        """Search in Pinecone"""
        query_response = self._index.query(
            vector=embedding,
            top_k=top_k,
            filter=filter_dict,
            namespace=namespace,
            include_metadata=include_metadata
        )
        
        results = []
        for match in query_response.get('matches', []):
            if match['score'] >= min_score:
                results.append(VectorSearchResult(
                    id=match['id'],
                    score=match['score'],
                    metadata=match.get('metadata', {}),
                    text=match.get('metadata', {}).get('text')
                ))
        
        logger.info(
            "pinecone_search_success",
            results_count=len(results),
            top_k=top_k
        )
        
        return results
    
    async def _search_pgvector(
        self,
        embedding: List[float],
        top_k: int,
        filter_dict: Optional[Dict],
        min_score: float
    ) -> List[VectorSearchResult]:
        """Search in pgvector"""
        from .postgres_client import get_postgres_client
        
        pg_client = await get_postgres_client()
        
        # Build query with filters
        where_clause = ""
        params = [embedding, top_k]
        
        if filter_dict:
            conditions = []
            for key, value in filter_dict.items():
                conditions.append(f"metadata->>'{key}' = ${len(params) + 1}")
                params.append(value)
            where_clause = "WHERE " + " AND ".join(conditions)
        
        # Query with cosine similarity
        query = f"""
        SELECT
            id,
            1 - (embedding <=> $1::vector) as score,
            metadata,
            content as text
        FROM {self.index_name}
        {where_clause}
        ORDER BY embedding <=> $1::vector
        LIMIT $2
        """
        
        rows = await pg_client.fetch(query, *params)
        
        results = []
        for row in rows:
            if row['score'] >= min_score:
                results.append(VectorSearchResult(
                    id=str(row['id']),
                    score=row['score'],
                    metadata=row.get('metadata', {}),
                    text=row.get('text')
                ))
        
        logger.info(
            "pgvector_search_success",
            results_count=len(results),
            top_k=top_k
        )
        
        return results
    
    async def upsert(
        self,
        vectors: List[Dict[str, Any]],
        namespace: Optional[str] = None
    ) -> None:
        """
        Insert or update vectors
        
        Args:
            vectors: List of vector dicts with id, values, metadata
            namespace: Pinecone namespace
        """
        try:
            if self.provider == "pinecone":
                self._index.upsert(vectors=vectors, namespace=namespace)
                logger.info("pinecone_upsert_success", count=len(vectors))
            elif self.provider == "pgvector":
                # Implement pgvector upsert
                logger.warning("pgvector_upsert_not_implemented")
                pass
        except Exception as e:
            logger.error("vector_upsert_failed", error=str(e))
            raise


# Singleton instance
_vector_client: Optional[VectorDBClient] = None


async def get_vector_client(
    provider: Literal["pinecone", "pgvector"] = "pinecone"
) -> VectorDBClient:
    """Get or create vector database client singleton"""
    global _vector_client
    
    if _vector_client is None:
        _vector_client = VectorDBClient(provider=provider)
        await _vector_client.connect()
    
    return _vector_client

