"""
GraphRAG API Endpoints
FastAPI routes for GraphRAG queries
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from uuid import UUID
import structlog

from ..models import GraphRAGRequest, GraphRAGResponse
from ..service import get_graphrag_service
from .auth import get_current_active_user, verify_tenant_access
from .rate_limit import rate_limit

logger = structlog.get_logger()

router = APIRouter(
    prefix="/v1/graphrag",
    tags=["GraphRAG"]
)


@router.post(
    "/query",
    response_model=GraphRAGResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute GraphRAG Query",
    description="""
    Execute a hybrid search query combining vector, keyword, and graph search modalities.
    
    **Rate Limits**:
    - 10 requests per minute
    - 100 requests per hour
    - 1000 requests per day
    
    **Features**:
    - Semantic vector search (OpenAI embeddings + Pinecone)
    - Keyword search (Elasticsearch BM25)
    - Knowledge graph traversal (Neo4j)
    - Hybrid fusion with Reciprocal Rank Fusion (RRF)
    - Evidence chains with citations
    - Agent-specific RAG profiles
    
    **Process**:
    1. Resolve agent's RAG profile and KG view
    2. Execute parallel searches (vector, keyword, graph)
    3. Fuse results with weighted RRF
    4. Build evidence chains and citations
    5. Return context with metadata
    
    **Response**:
    - `context_chunks`: Ranked context chunks with citations
    - `evidence_chain`: Graph paths with nodes and edges
    - `citations`: Citation map [1] -> source
    - `metadata`: Execution metrics and fusion weights
    """,
    responses={
        200: {
            "description": "Successful query execution",
            "content": {
                "application/json": {
                    "example": {
                        "query": "What are the treatment guidelines for diabetes?",
                        "context_chunks": [
                            {
                                "chunk_id": "doc_123",
                                "text": "Diabetes treatment guidelines recommend... [1]",
                                "score": 0.89,
                                "source": {
                                    "document_id": "doc_123",
                                    "title": "Diabetes Guidelines 2024"
                                },
                                "search_modality": "vector"
                            }
                        ],
                        "citations": {
                            "[1]": {
                                "document_id": "doc_123",
                                "title": "Diabetes Guidelines 2024",
                                "url": "https://..."
                            }
                        },
                        "metadata": {
                            "profile_used": "hybrid_enhanced",
                            "fusion_weights": {
                                "vector": 0.6,
                                "keyword": 0.4,
                                "graph": 0.0
                            },
                            "vector_results_count": 10,
                            "keyword_results_count": 5,
                            "graph_results_count": 0,
                            "total_results_count": 10,
                            "execution_time_ms": 523.4
                        }
                    }
                }
            }
        },
        400: {"description": "Invalid request"},
        401: {"description": "Authentication required"},
        403: {"description": "Access forbidden"},
        429: {"description": "Rate limit exceeded"},
        500: {"description": "Internal server error"}
    }
)
async def graphrag_query(
    request: GraphRAGRequest,
    current_user: dict = Depends(get_current_active_user)
) -> GraphRAGResponse:
    """
    Execute GraphRAG query
    
    Args:
        request: GraphRAG request with query, agent_id, session_id
        
    Returns:
        GraphRAG response with context and evidence
    """
    try:
        # Verify tenant access if tenant_id provided
        if request.tenant_id:
            await verify_tenant_access(request.tenant_id, current_user)
        
        logger.info(
            "graphrag_api_request",
            agent_id=str(request.agent_id),
            session_id=str(request.session_id),
            user_id=str(current_user["id"]),
            query=request.query[:50]
        )
        
        # Get GraphRAG service
        service = await get_graphrag_service()
        
        # Execute query
        response = await service.query(request)
        
        logger.info(
            "graphrag_api_success",
            agent_id=str(request.agent_id),
            session_id=str(request.session_id),
            chunks_count=len(response.context_chunks),
            execution_time_ms=response.metadata.execution_time_ms
        )
        
        return response
        
    except ValueError as e:
        logger.error(
            "graphrag_api_validation_error",
            agent_id=str(request.agent_id),
            error=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        logger.error(
            "graphrag_api_error",
            agent_id=str(request.agent_id),
            session_id=str(request.session_id),
            error=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during GraphRAG query"
        )


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="GraphRAG Health Check",
    description="Check the health of GraphRAG service and all database connections"
)
async def health_check():
    """
    Health check for GraphRAG service
    
    Returns:
        Health status of all components
    """
    try:
        from ..clients.postgres_client import get_postgres_client
        from ..clients.vector_db_client import get_vector_client
        from ..clients.neo4j_client import get_neo4j_client
        from ..clients.elastic_client import get_elastic_client
        
        # Check all database connections
        pg = await get_postgres_client()
        vector = await get_vector_client()
        neo4j = await get_neo4j_client()
        elastic = await get_elastic_client()
        
        health_status = {
            "status": "healthy",
            "components": {
                "postgres": await pg.health_check(),
                "vector_db": await vector.health_check(),
                "neo4j": await neo4j.health_check(),
                "elasticsearch": await elastic.health_check()
            }
        }
        
        # Overall health
        all_healthy = all(health_status["components"].values())
        health_status["status"] = "healthy" if all_healthy else "degraded"
        
        logger.info(
            "graphrag_health_check",
            status=health_status["status"],
            components=health_status["components"]
        )
        
        return health_status
        
    except Exception as e:
        logger.error("graphrag_health_check_failed", error=str(e))
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.get(
    "/profiles",
    status_code=status.HTTP_200_OK,
    summary="List RAG Profiles",
    description="Get all available RAG profiles"
)
async def list_profiles():
    """
    List all available RAG profiles
    
    Returns:
        List of RAG profiles
    """
    try:
        from ..clients.postgres_client import get_postgres_client
        
        pg = await get_postgres_client()
        
        query = """
        SELECT
            id,
            profile_name,
            strategy_type,
            top_k,
            similarity_threshold,
            enable_graph_search,
            enable_keyword_search,
            is_active
        FROM rag_profiles
        WHERE is_active = true
        ORDER BY profile_name
        """
        
        profiles = await pg.fetch(query)
        
        return {
            "profiles": profiles,
            "count": len(profiles)
        }
        
    except Exception as e:
        logger.error("list_profiles_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch RAG profiles"
        )


@router.get(
    "/agents/{agent_id}/profile",
    status_code=status.HTTP_200_OK,
    summary="Get Agent's RAG Profile",
    description="Get the RAG profile configured for a specific agent"
)
async def get_agent_profile(agent_id: UUID):
    """
    Get agent's RAG profile
    
    Args:
        agent_id: Agent UUID
        
    Returns:
        Agent's RAG profile with overrides
    """
    try:
        from ..profile_resolver import get_profile_resolver
        
        resolver = get_profile_resolver()
        profile = await resolver.resolve_profile(agent_id)
        
        return {
            "agent_id": str(agent_id),
            "profile": profile.model_dump()
        }
        
    except Exception as e:
        logger.error(
            "get_agent_profile_failed",
            agent_id=str(agent_id),
            error=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch agent profile"
        )


@router.get(
    "/agents/{agent_id}/kg-view",
    status_code=status.HTTP_200_OK,
    summary="Get Agent's KG View",
    description="Get the knowledge graph view configured for a specific agent"
)
async def get_agent_kg_view(agent_id: UUID):
    """
    Get agent's KG view
    
    Args:
        agent_id: Agent UUID
        
    Returns:
        Agent's KG view constraints
    """
    try:
        from ..kg_view_resolver import get_kg_view_resolver
        
        resolver = get_kg_view_resolver()
        kg_view = await resolver.resolve_kg_view(agent_id)
        
        if kg_view:
            return {
                "agent_id": str(agent_id),
                "kg_view": kg_view.model_dump()
            }
        else:
            return {
                "agent_id": str(agent_id),
                "kg_view": None,
                "note": "No KG view configured (unrestricted)"
            }
        
    except Exception as e:
        logger.error(
            "get_agent_kg_view_failed",
            agent_id=str(agent_id),
            error=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch agent KG view"
        )

