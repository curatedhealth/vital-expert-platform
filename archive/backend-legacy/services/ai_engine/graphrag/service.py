"""
Main GraphRAG Service

Orchestrates all GraphRAG components: profile resolution, multi-modal search,
fusion, and evidence-based context building.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
import time

from .clients import get_postgres_client, get_vector_db_client, get_neo4j_client
from .profile_resolver import get_profile_resolver
from .kg_view_resolver import get_kg_view_resolver
from .search import vector_search, keyword_search, graph_search, fuse_results
from .context import build_context_with_evidence
from .models import (
    GraphRAGRequest,
    GraphRAGResponse,
    RAGProfile,
    AgentKGView,
    ContextWithEvidence
)
from .utils.logger import get_logger

logger = get_logger(__name__)


class GraphRAGService:
    """
    Main GraphRAG service orchestrating all components
    
    Architecture:
    1. Load RAG profile + KG view (agent-specific)
    2. Execute parallel searches (vector, keyword, graph)
    3. Fuse results with RRF
    4. Optional reranking
    5. Build context with evidence chains
    6. Return GraphRAGResponse with citations
    """
    
    def __init__(self):
        self.pg_client = None
        self.vector_client = None
        self.neo4j_client = None
        self.profile_resolver = None
        self.kg_resolver = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize all clients and resolvers"""
        if self._initialized:
            return
            
        logger.info("Initializing GraphRAG service...")
        
        # Initialize clients
        self.pg_client = await get_postgres_client()
        self.vector_client = await get_vector_db_client()
        self.neo4j_client = await get_neo4j_client()
        
        # Initialize resolvers
        self.profile_resolver = await get_profile_resolver()
        self.kg_resolver = await get_kg_view_resolver()
        
        self._initialized = True
        logger.info("GraphRAG service initialized successfully")
        
    async def query(
        self,
        query: str,
        agent_id: UUID,
        session_id: Optional[UUID] = None,
        rag_profile_id: Optional[UUID] = None,
        skill_id: Optional[UUID] = None,
        metadata_filters: Optional[Dict[str, Any]] = None,
        max_tokens: int = 4000
    ) -> GraphRAGResponse:
        """
        Execute GraphRAG query with evidence chains
        
        Args:
            query: Natural language query
            agent_id: Agent UUID for RAG profile and KG view
            session_id: Optional session UUID for logging
            rag_profile_id: Optional specific RAG profile to use
            skill_id: Optional skill for skill-specific overrides
            metadata_filters: Optional metadata filters
            max_tokens: Maximum context tokens
            
        Returns:
            GraphRAGResponse with context, evidence, and citations
        """
        start_time = time.time()
        
        try:
            # Ensure service is initialized
            if not self._initialized:
                await self.initialize()
                
            logger.info(
                f"GraphRAG query started: agent={agent_id}, session={session_id}, "
                f"query_len={len(query)}"
            )
            
            # 1. Load RAG profile
            profile = await self.profile_resolver.get_profile(
                agent_id=agent_id,
                profile_id=rag_profile_id,
                skill_id=skill_id
            )
            
            logger.info(f"RAG profile loaded: {profile.slug}")
            
            # 2. Load KG view (if agent has one)
            kg_view = await self.kg_resolver.get_kg_view(
                agent_id=agent_id,
                skill_id=skill_id
            )
            
            if kg_view:
                logger.info(
                    f"KG view loaded: {len(kg_view.include_nodes or [])} node types, "
                    f"{len(kg_view.include_edges or [])} edge types"
                )
            
            # 3. Execute parallel searches
            search_start = time.time()
            
            # Vector search (always)
            vector_results = await vector_search(
                query=query,
                profile=profile,
                metadata_filters=metadata_filters
            )
            
            # Keyword search (if enabled and Elasticsearch available)
            keyword_results = await keyword_search(
                query=query,
                profile=profile,
                metadata_filters=metadata_filters
            )
            
            # Graph search (if profile has graph weight > 0)
            graph_results = []
            if profile.fusion_weights.graph > 0 and kg_view:
                # Extract seed entities from query (simple approach for now)
                seed_entities = await self._extract_entities(query)
                
                if seed_entities:
                    graph_results = await graph_search(
                        seed_entities=seed_entities,
                        agent_id=agent_id,
                        kg_view=kg_view,
                        max_results=profile.top_k
                    )
                    
            search_time = time.time() - search_start
            
            logger.info(
                f"Search completed: {len(vector_results)} vector, "
                f"{len(keyword_results)} keyword, {len(graph_results)} graph "
                f"({search_time:.2f}s)"
            )
            
            # 4. Fuse results
            fusion_start = time.time()
            
            fused_results = fuse_results(
                vector_results=vector_results,
                keyword_results=keyword_results,
                graph_results=graph_results,
                weights=profile.fusion_weights
            )
            
            fusion_time = time.time() - fusion_start
            
            logger.info(
                f"Fusion completed: {len(fused_results)} results ({fusion_time:.2f}s)"
            )
            
            # 5. Optional reranking
            if profile.rerank_enabled and profile.reranker_model:
                logger.info(f"Reranking with {profile.reranker_model}...")
                # TODO: Implement Cohere reranking
                # fused_results = await self._rerank(query, fused_results, profile)
                logger.warning("Reranking not implemented yet, skipping")
                
            # 6. Build context with evidence
            context_start = time.time()
            
            context_with_evidence = build_context_with_evidence(
                fused_results=fused_results,
                max_tokens=max_tokens,
                model_name="gpt-4",  # TODO: Get from config
                include_metadata=True,
                include_graph_paths=(profile.fusion_weights.graph > 0)
            )
            
            context_time = time.time() - context_start
            
            total_time = time.time() - start_time
            
            logger.info(
                f"GraphRAG query complete: {context_with_evidence.total_chunks} chunks, "
                f"{context_with_evidence.total_tokens} tokens, "
                f"{len(context_with_evidence.evidence_chain)} evidence nodes "
                f"(total {total_time:.2f}s)"
            )
            
            # 7. Build response
            return GraphRAGResponse(
                query=query,
                agent_id=agent_id,
                session_id=session_id,
                rag_profile=profile,
                kg_view=kg_view,
                context=context_with_evidence.context,
                context_chunks=context_with_evidence.context_chunks,
                evidence_chain=context_with_evidence.evidence_chain,
                bibliography=context_with_evidence.bibliography,
                total_tokens=context_with_evidence.total_tokens,
                total_chunks=context_with_evidence.total_chunks,
                search_stats={
                    'vector_count': len(vector_results),
                    'keyword_count': len(keyword_results),
                    'graph_count': len(graph_results),
                    'fused_count': len(fused_results),
                    'search_time_ms': int(search_time * 1000),
                    'fusion_time_ms': int(fusion_time * 1000),
                    'context_time_ms': int(context_time * 1000),
                    'total_time_ms': int(total_time * 1000)
                }
            )
            
        except Exception as e:
            logger.error(f"GraphRAG query error: {e}", exc_info=True)
            raise
            
    async def _extract_entities(self, query: str) -> List[str]:
        """
        Extract entities from query for graph search
        
        Simple approach for now: extract capitalized phrases
        TODO: Use NER model for better entity extraction
        """
        # Placeholder: split and filter capitalized words
        words = query.split()
        entities = [w for w in words if w[0].isupper() and len(w) > 2]
        
        # Also include quoted phrases
        import re
        quoted = re.findall(r'"([^"]+)"', query)
        entities.extend(quoted)
        
        return list(set(entities))[:10]  # Max 10 seed entities
        
    async def health_check(self) -> Dict[str, Any]:
        """
        Check health of all GraphRAG components
        
        Returns:
            Dict with component health status
        """
        health = {
            'service': 'graphrag',
            'status': 'healthy',
            'components': {}
        }
        
        try:
            # Check Postgres
            if self.pg_client:
                await self.pg_client.fetchval("SELECT 1")
                health['components']['postgres'] = 'healthy'
            else:
                health['components']['postgres'] = 'not_initialized'
                
            # Check Vector DB (Pinecone)
            if self.vector_client:
                # Pinecone doesn't have a simple health check, assume healthy
                health['components']['vector_db'] = 'healthy'
            else:
                health['components']['vector_db'] = 'not_initialized'
                
            # Check Neo4j
            if self.neo4j_client:
                await self.neo4j_client.verify_connectivity()
                health['components']['neo4j'] = 'healthy'
            else:
                health['components']['neo4j'] = 'not_initialized'
                
        except Exception as e:
            logger.error(f"Health check error: {e}")
            health['status'] = 'unhealthy'
            health['error'] = str(e)
            
        return health


# Singleton instance
_graphrag_service: Optional[GraphRAGService] = None


async def get_graphrag_service() -> GraphRAGService:
    """Get or create GraphRAGService singleton"""
    global _graphrag_service
    if _graphrag_service is None:
        _graphrag_service = GraphRAGService()
        await _graphrag_service.initialize()
    return _graphrag_service

