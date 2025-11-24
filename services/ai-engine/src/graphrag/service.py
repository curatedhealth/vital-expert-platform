"""
Main GraphRAG Service
Orchestrates vector, keyword, and graph search with hybrid fusion
"""

import time
from typing import Optional
from uuid import UUID
import structlog

from .models import GraphRAGRequest, GraphRAGResponse, GraphRAGMetadata
from .config import get_graphrag_config
from .profile_resolver import get_profile_resolver
from .kg_view_resolver import get_kg_view_resolver
from .search.vector_search import get_vector_search
from .search.keyword_search import get_keyword_search
from .search.graph_search import get_graph_search
from .search.fusion import get_hybrid_fusion
from .evidence_builder import get_evidence_builder
from .reranker import get_reranker_service

logger = structlog.get_logger()


class GraphRAGService:
    """
    Production-ready GraphRAG service
    
    Features:
    - Multi-modal search (vector + keyword + graph)
    - Agent-specific RAG profiles
    - Knowledge graph view filtering
    - Hybrid fusion with RRF
    - Evidence chain construction
    - Citation management
    - Performance monitoring
    """
    
    def __init__(self):
        self.config = get_graphrag_config()
        self.profile_resolver = get_profile_resolver()
        self.kg_view_resolver = get_kg_view_resolver()
        self.vector_search = get_vector_search()
        self.keyword_search = get_keyword_search()
        self.graph_search = get_graph_search()
        self.hybrid_fusion = get_hybrid_fusion()
    
    async def query(
        self,
        request: GraphRAGRequest
    ) -> GraphRAGResponse:
        """
        Execute GraphRAG query
        
        This is the main entry point that orchestrates:
        1. Profile resolution
        2. Parallel search execution
        3. Hybrid fusion
        4. Evidence chain construction
        5. Response building
        
        Args:
            request: GraphRAG request
            
        Returns:
            GraphRAG response with context and evidence
        """
        start_time = time.time()
        
        try:
            # Step 1: Resolve RAG profile
            profile = await self.profile_resolver.resolve_profile(
                agent_id=request.agent_id,
                profile_id=request.rag_profile_id
            )
            
            logger.info(
                "graphrag_query_started",
                agent_id=str(request.agent_id),
                session_id=str(request.session_id),
                query=request.query[:50],
                profile=profile.profile_name
            )
            
            # Step 2: Resolve KG view (if graph search enabled)
            kg_view = None
            if profile.enable_graph_search:
                kg_view = await self.kg_view_resolver.resolve_kg_view(request.agent_id)
            
            # Step 3: Determine search parameters
            top_k = request.top_k or profile.top_k
            min_score = request.min_score or profile.similarity_threshold
            
            # Step 4: Execute searches in parallel
            vector_results = []
            keyword_results = []
            graph_results = []
            graph_evidence = []
            
            # Vector search (always enabled)
            vector_results = await self.vector_search.search(
                query=request.query,
                top_k=top_k,
                min_score=min_score,
                filter_dict=request.metadata
            )
            
            # Keyword search (if enabled)
            if profile.enable_keyword_search:
                keyword_results = await self.keyword_search.search(
                    query=request.query,
                    top_k=top_k,
                    min_score=min_score,
                    filter_dict=request.metadata
                )
            
            # Graph search (if enabled and KG view exists)
            if profile.enable_graph_search:
                graph_chunks, graph_evidence = await self.graph_search.search(
                    query=request.query,
                    top_k=top_k,
                    allowed_nodes=kg_view.get_allowed_nodes() if kg_view else None,
                    allowed_edges=kg_view.get_allowed_edges() if kg_view else None,
                    max_hops=kg_view.max_hops if kg_view else self.config.default_max_hops,
                    min_score=min_score
                )
                graph_results = graph_chunks
            
            # Step 5: Hybrid fusion
            fusion_weights = profile.get_fusion_weights()
            
            fused_chunks = self.hybrid_fusion.fuse(
                vector_results=vector_results,
                keyword_results=keyword_results,
                graph_results=graph_results,
                weights=fusion_weights,
                top_k=top_k
            )
            
            # Step 6: Optional reranking
            rerank_applied = False
            if profile.rerank_enabled and profile.rerank_model:
                reranker = await get_reranker_service()
                fused_chunks, rerank_applied = await reranker.rerank_with_fallback(
                    query=request.query,
                    chunks=fused_chunks,
                    top_k=top_k
                )
                
                if rerank_applied:
                    logger.info(
                        "reranking_applied",
                        agent_id=str(request.agent_id),
                        model=profile.rerank_model
                    )
            
            # Step 7: Build evidence and citations
            evidence_builder = get_evidence_builder(
                max_tokens=profile.context_window_tokens
            )
            
            annotated_chunks, citation_map, evidence_chain = evidence_builder.build_context_with_evidence(
                chunks=fused_chunks,
                graph_evidence=graph_evidence if request.include_graph_evidence else [],
                include_citations=request.include_citations
            )
            
            # Step 8: Build metadata
            execution_time_ms = (time.time() - start_time) * 1000
            
            metadata = evidence_builder.build_metadata(
                profile_name=profile.profile_name,
                fusion_weights=fusion_weights,
                vector_count=len(vector_results),
                keyword_count=len(keyword_results),
                graph_count=len(graph_results),
                total_count=len(annotated_chunks),
                rerank_applied=rerank_applied,
                execution_time_ms=execution_time_ms,
                kg_view_applied=kg_view is not None
            )
            
            # Step 9: Build response
            response = GraphRAGResponse(
                query=request.query,
                context_chunks=annotated_chunks,
                evidence_chain=evidence_chain if request.include_graph_evidence else None,
                citations=citation_map if request.include_citations else {},
                metadata=metadata,
                session_id=request.session_id
            )
            
            logger.info(
                "graphrag_query_complete",
                agent_id=str(request.agent_id),
                session_id=str(request.session_id),
                chunks_count=len(annotated_chunks),
                citations_count=len(citation_map),
                execution_time_ms=execution_time_ms
            )
            
            return response
            
        except Exception as e:
            execution_time_ms = (time.time() - start_time) * 1000
            
            logger.error(
                "graphrag_query_failed",
                agent_id=str(request.agent_id),
                session_id=str(request.session_id),
                query=request.query[:50],
                error=str(e),
                execution_time_ms=execution_time_ms
            )
            
            # Return empty response
            return GraphRAGResponse(
                query=request.query,
                context_chunks=[],
                evidence_chain=None,
                citations={},
                metadata=GraphRAGMetadata(
                    profile_used="error_fallback",
                    fusion_weights=profile.get_fusion_weights() if 'profile' in locals() else None,
                    vector_results_count=0,
                    keyword_results_count=0,
                    graph_results_count=0,
                    total_results_count=0,
                    rerank_applied=False,
                    execution_time_ms=execution_time_ms,
                    agent_kg_view_applied=False
                ),
                session_id=request.session_id
            )


# Singleton instance
_service: Optional[GraphRAGService] = None


async def get_graphrag_service() -> GraphRAGService:
    """Get or create GraphRAG service singleton"""
    global _service
    
    if _service is None:
        _service = GraphRAGService()
    
    return _service

