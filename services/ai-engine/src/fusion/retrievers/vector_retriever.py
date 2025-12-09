"""
VITAL Path AI Services - VITAL Vector Retriever

Vector-based semantic retrieval for agent matching.
Uses pgvector (primary) with Pinecone fallback.

Naming Convention:
- Class: VectorRetriever
- Methods: retrieve, embed_query
- Logs: vital_vector_retriever_{action}
"""

from typing import List, Optional, Dict, Any
import structlog

from ..fusion_rrf import RankedItem

logger = structlog.get_logger()


class VectorRetriever:
    """
    Vector-based semantic retrieval for agent matching.
    
    Searches agents by semantic similarity to the query.
    Primary: pgvector in PostgreSQL
    Fallback: Pinecone for high-scale deployments
    """
    
    def __init__(
        self,
        supabase_client=None,
        embedding_service=None,
        embedding_model: str = "text-embedding-3-large",
        use_pinecone: bool = False,
        pinecone_index: Optional[str] = None,
    ):
        """
        Initialize vector retriever.
        
        Args:
            supabase_client: Supabase client for pgvector
            embedding_service: Service to generate embeddings
            embedding_model: Model for embeddings
            use_pinecone: Whether to use Pinecone
            pinecone_index: Pinecone index name
        """
        self.supabase = supabase_client
        self.embedding_service = embedding_service
        self.embedding_model = embedding_model
        self.use_pinecone = use_pinecone
        self.pinecone_index = pinecone_index
        
        logger.info(
            "vital_vector_retriever_initialized",
            embedding_model=embedding_model,
            use_pinecone=use_pinecone,
        )
    
    async def retrieve(
        self,
        query: str,
        tenant_id: str,
        top_k: int = 20,
        filter_tags: Optional[List[str]] = None,
    ) -> List[RankedItem]:
        """
        Retrieve semantically similar agents.
        
        Args:
            query: User's query
            tenant_id: Tenant UUID for isolation
            top_k: Number of results
            filter_tags: Optional tags to filter by
            
        Returns:
            Ranked list with cosine similarity scores
        """
        logger.info(
            "vital_vector_retriever_retrieve_started",
            tenant_id=tenant_id,
            top_k=top_k,
        )
        
        try:
            # Generate query embedding
            embedding = await self._embed_query(query)
            
            if not embedding:
                logger.warning("vital_vector_retriever_no_embedding")
                return []
            
            # Search using appropriate backend
            if self.use_pinecone:
                results = await self._search_pinecone(
                    embedding, tenant_id, top_k, filter_tags
                )
            else:
                results = await self._search_pgvector(
                    embedding, tenant_id, top_k, filter_tags
                )
            
            logger.info(
                "vital_vector_retriever_retrieve_completed",
                tenant_id=tenant_id,
                result_count=len(results),
            )
            
            return results
            
        except Exception as e:
            logger.error(
                "vital_vector_retriever_retrieve_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            return []
    
    async def _embed_query(self, query: str) -> Optional[List[float]]:
        """Generate embedding for query."""
        if self.embedding_service:
            return await self.embedding_service.embed(query)
        
        # Fallback: Use OpenAI directly
        try:
            from openai import AsyncOpenAI
            
            client = AsyncOpenAI()
            response = await client.embeddings.create(
                model=self.embedding_model,
                input=query,
            )
            return response.data[0].embedding
            
        except Exception as e:
            logger.error(
                "vital_vector_retriever_embed_failed",
                error=str(e),
            )
            return None
    
    async def _search_pgvector(
        self,
        embedding: List[float],
        tenant_id: str,
        top_k: int,
        filter_tags: Optional[List[str]] = None,
    ) -> List[RankedItem]:
        """Search pgvector for similar agents."""
        if not self.supabase:
            return []
        
        try:
            # Use Supabase RPC for vector similarity search
            # This assumes a function 'match_agents_by_embedding' exists
            result = self.supabase.rpc(
                'match_agents_by_embedding',
                {
                    'query_embedding': embedding,
                    'match_count': top_k,
                    'filter_tenant_id': tenant_id,
                }
            ).execute()
            
            if not result.data:
                return []
            
            items = []
            for rank, row in enumerate(result.data, start=1):
                items.append(RankedItem(
                    id=row.get('id', ''),
                    rank=rank,
                    score=float(row.get('similarity', 0)),
                    source='vector',
                    metadata={
                        'name': row.get('name'),
                        'description': row.get('description'),
                        'domains': row.get('domains', []),
                        'capabilities': row.get('capabilities', []),
                    },
                ))
            
            return items
            
        except Exception as e:
            logger.error(
                "vital_vector_retriever_pgvector_failed",
                error=str(e),
            )
            return []
    
    async def _search_pinecone(
        self,
        embedding: List[float],
        tenant_id: str,
        top_k: int,
        filter_tags: Optional[List[str]] = None,
    ) -> List[RankedItem]:
        """Search Pinecone for similar agents."""
        try:
            from pinecone import Pinecone
            
            pc = Pinecone()
            index = pc.Index(self.pinecone_index)
            
            # Build filter
            filter_dict = {'tenant_id': tenant_id}
            if filter_tags:
                filter_dict['tags'] = {'$in': filter_tags}
            
            results = index.query(
                vector=embedding,
                top_k=top_k,
                filter=filter_dict,
                include_metadata=True,
            )
            
            items = []
            for rank, match in enumerate(results.matches, start=1):
                items.append(RankedItem(
                    id=match.id,
                    rank=rank,
                    score=float(match.score),
                    source='vector',
                    metadata=match.metadata or {},
                ))
            
            return items
            
        except Exception as e:
            logger.error(
                "vital_vector_retriever_pinecone_failed",
                error=str(e),
            )
            return []
