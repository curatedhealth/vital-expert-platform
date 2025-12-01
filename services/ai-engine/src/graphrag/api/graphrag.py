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


# =============================================================================
# INTELLIGENCE BROKER ENDPOINTS
# =============================================================================
# The Intelligence Broker provides a unified query interface combining:
# - PostgreSQL (source of truth for structured data)
# - Pinecone (vector similarity search)
# - Neo4j (knowledge graph traversal)
# - Service-mode awareness (Ask Me, Ask Expert, Ask Panel, Workflows)
# =============================================================================

from pydantic import BaseModel, Field
from typing import List, Dict, Any
from enum import Enum


class BrokerServiceMode(str, Enum):
    """Service modes for Intelligence Broker"""
    ASK_ME = "ask_me"
    ASK_EXPERT = "ask_expert"
    ASK_PANEL = "ask_panel"
    WORKFLOWS = "workflows"


class BrokerQueryRequest(BaseModel):
    """Request model for Intelligence Broker query"""
    query: str = Field(..., description="The query to execute")
    service_mode: BrokerServiceMode = Field(
        default=BrokerServiceMode.ASK_EXPERT,
        description="Service mode for query optimization"
    )
    agent_id: Optional[UUID] = Field(None, description="Agent ID for context")
    role_id: Optional[UUID] = Field(None, description="Role ID for filtering")
    persona_id: Optional[UUID] = Field(None, description="Persona ID for personalization")
    tenant_id: Optional[UUID] = Field(None, description="Tenant ID for multi-tenant isolation")
    include_ontology: bool = Field(True, description="Include L0-L7 ontology context")
    include_agents: bool = Field(True, description="Include agent recommendations")
    include_jtbds: bool = Field(False, description="Include relevant JTBDs")
    top_k: int = Field(10, ge=1, le=50, description="Maximum results to return")


class BrokerQueryResponse(BaseModel):
    """Response model for Intelligence Broker query"""
    query: str
    service_mode: str
    results: List[Dict[str, Any]]
    ontology_context: Optional[Dict[str, Any]] = None
    recommended_agents: Optional[List[Dict[str, Any]]] = None
    relevant_jtbds: Optional[List[Dict[str, Any]]] = None
    health: Dict[str, bool]
    metadata: Dict[str, Any]


@router.post(
    "/broker/query",
    response_model=BrokerQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Intelligence Broker Query",
    description="""
    Execute a unified query using the Intelligence Broker.

    Combines all data sources:
    - **PostgreSQL**: Structured data (agents, personas, roles, JTBDs)
    - **Pinecone**: Vector similarity search (semantic matching)
    - **Neo4j**: Knowledge graph traversal (L0-L7 ontology)

    **Service Modes**:
    - `ask_me`: Quick answers, single agent
    - `ask_expert`: Deep analysis, specialized agent selection
    - `ask_panel`: Multi-expert consultation
    - `workflows`: Autonomous task execution

    **Features**:
    - Query complexity analysis (SIMPLE → MODERATE → COMPLEX → REGULATORY)
    - Automatic strategy selection (11 pre-configured strategies)
    - Ontology-aware agent recommendations
    - Role and persona context injection
    """,
    responses={
        200: {"description": "Successful query"},
        400: {"description": "Invalid request"},
        500: {"description": "Internal server error"}
    }
)
async def broker_query_endpoint(
    request: BrokerQueryRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Execute Intelligence Broker query
    """
    import time
    start_time = time.time()

    try:
        from ..intelligence_broker import (
            get_intelligence_broker,
            BrokerQuery,
            ServiceMode as BrokerServiceModeEnum
        )

        logger.info(
            "broker_api_request",
            query=request.query[:100],
            service_mode=request.service_mode,
            agent_id=str(request.agent_id) if request.agent_id else None,
            role_id=str(request.role_id) if request.role_id else None
        )

        # Get Intelligence Broker
        broker = await get_intelligence_broker()

        # Map service mode
        mode_map = {
            BrokerServiceMode.ASK_ME: BrokerServiceModeEnum.ASK_ME,
            BrokerServiceMode.ASK_EXPERT: BrokerServiceModeEnum.ASK_EXPERT,
            BrokerServiceMode.ASK_PANEL: BrokerServiceModeEnum.ASK_PANEL,
            BrokerServiceMode.WORKFLOWS: BrokerServiceModeEnum.WORKFLOWS
        }

        # Build broker query
        broker_query = BrokerQuery(
            query=request.query,
            service_mode=mode_map[request.service_mode],
            agent_id=str(request.agent_id) if request.agent_id else None,
            role_id=str(request.role_id) if request.role_id else None,
            persona_id=str(request.persona_id) if request.persona_id else None,
            top_k=request.top_k
        )

        # Execute query
        result = await broker.query(broker_query)

        # Build response
        response_data = {
            "query": request.query,
            "service_mode": request.service_mode.value,
            "results": result.results if hasattr(result, 'results') else [],
            "ontology_context": result.ontology_context.model_dump() if hasattr(result, 'ontology_context') and result.ontology_context else None,
            "recommended_agents": None,
            "relevant_jtbds": None,
            "health": await broker.health_check() if hasattr(broker, 'health_check') else {},
            "metadata": {
                "execution_time_ms": (time.time() - start_time) * 1000,
                "complexity": result.complexity.value if hasattr(result, 'complexity') else "unknown",
                "strategy_used": result.strategy_used if hasattr(result, 'strategy_used') else None,
                "sources_queried": result.sources_queried if hasattr(result, 'sources_queried') else []
            }
        }

        # Add agent recommendations if requested
        if request.include_agents and request.role_id:
            try:
                agents = await broker.get_agents_for_role(str(request.role_id), top_k=5)
                response_data["recommended_agents"] = agents
            except Exception as e:
                logger.warning("broker_agents_fetch_failed", error=str(e))

        # Add JTBDs if requested
        if request.include_jtbds and request.role_id:
            try:
                jtbds = await broker.get_jtbds_for_role(str(request.role_id), top_k=10)
                response_data["relevant_jtbds"] = jtbds
            except Exception as e:
                logger.warning("broker_jtbds_fetch_failed", error=str(e))

        logger.info(
            "broker_api_success",
            query=request.query[:50],
            execution_time_ms=response_data["metadata"]["execution_time_ms"]
        )

        return BrokerQueryResponse(**response_data)

    except Exception as e:
        logger.error(
            "broker_api_error",
            query=request.query[:100],
            error=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intelligence Broker query failed: {str(e)}"
        )


@router.get(
    "/broker/health",
    status_code=status.HTTP_200_OK,
    summary="Intelligence Broker Health Check",
    description="Check health of all Intelligence Broker data sources"
)
async def broker_health_check():
    """
    Health check for Intelligence Broker
    """
    try:
        from ..intelligence_broker import get_intelligence_broker

        broker = await get_intelligence_broker()
        health = await broker.health_check()

        return {
            "status": "healthy" if all(health.values()) else "degraded",
            "components": health,
            "message": "All data sources operational" if all(health.values()) else "Some components degraded"
        }

    except Exception as e:
        logger.error("broker_health_check_failed", error=str(e))
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.get(
    "/broker/agents/{agent_id}",
    status_code=status.HTTP_200_OK,
    summary="Get Agent Details via Broker",
    description="Fetch agent details from PostgreSQL (source of truth)"
)
async def broker_get_agent(agent_id: UUID):
    """
    Get agent details via Intelligence Broker
    """
    try:
        from ..intelligence_broker import get_intelligence_broker

        broker = await get_intelligence_broker()
        agent = await broker.get_agent_by_id(str(agent_id))

        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )

        return {
            "agent": agent,
            "source": "postgresql"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("broker_get_agent_failed", agent_id=str(agent_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch agent: {str(e)}"
        )


@router.get(
    "/broker/roles/{role_id}/agents",
    status_code=status.HTTP_200_OK,
    summary="Get Agents for Role via Broker",
    description="Fetch agents mapped to a role from agent_roles junction table"
)
async def broker_get_agents_for_role(role_id: UUID, top_k: int = 10):
    """
    Get agents for a specific role via Intelligence Broker
    """
    try:
        from ..intelligence_broker import get_intelligence_broker

        broker = await get_intelligence_broker()
        agents = await broker.get_agents_for_role(str(role_id), top_k=top_k)

        return {
            "role_id": str(role_id),
            "agents": agents,
            "count": len(agents),
            "source": "postgresql.agent_roles"
        }

    except Exception as e:
        logger.error("broker_get_agents_for_role_failed", role_id=str(role_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch agents for role: {str(e)}"
        )


@router.get(
    "/broker/roles/{role_id}/jtbds",
    status_code=status.HTTP_200_OK,
    summary="Get JTBDs for Role via Broker",
    description="Fetch JTBDs mapped to a role from jtbd_roles junction table"
)
async def broker_get_jtbds_for_role(role_id: UUID, top_k: int = 20):
    """
    Get JTBDs for a specific role via Intelligence Broker
    """
    try:
        from ..intelligence_broker import get_intelligence_broker

        broker = await get_intelligence_broker()
        jtbds = await broker.get_jtbds_for_role(str(role_id), top_k=top_k)

        return {
            "role_id": str(role_id),
            "jtbds": jtbds,
            "count": len(jtbds),
            "source": "postgresql.jtbd_roles"
        }

    except Exception as e:
        logger.error("broker_get_jtbds_for_role_failed", role_id=str(role_id), error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch JTBDs for role: {str(e)}"
        )


@router.get(
    "/broker/agents/search",
    status_code=status.HTTP_200_OK,
    summary="Full-Text Agent Search via Broker",
    description="Search agents using PostgreSQL full-text search"
)
async def broker_search_agents(q: str, top_k: int = 10):
    """
    Full-text search for agents via Intelligence Broker
    """
    try:
        from ..intelligence_broker import get_intelligence_broker

        broker = await get_intelligence_broker()
        agents = await broker.search_agents_fulltext(q, top_k=top_k)

        return {
            "query": q,
            "agents": agents,
            "count": len(agents),
            "source": "postgresql.fulltext"
        }

    except Exception as e:
        logger.error("broker_search_agents_failed", query=q, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search agents: {str(e)}"
        )

