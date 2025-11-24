"""
GraphRAG API Routes

FastAPI routes for GraphRAG query endpoint
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from uuid import UUID

from ...graphrag.service import get_graphrag_service
from ...graphrag.models import GraphRAGRequest, GraphRAGResponse
from .auth import get_current_user, User

router = APIRouter(prefix="/v1/graphrag", tags=["graphrag"])


@router.post("/query", response_model=GraphRAGResponse)
async def graphrag_query(
    request: GraphRAGRequest,
    user: User = Depends(get_current_user)
) -> GraphRAGResponse:
    """
    Execute GraphRAG query with evidence-based context building
    
    **Architecture**:
    1. Load RAG profile + KG view (agent-specific)
    2. Execute parallel searches (vector, keyword, graph)
    3. Fuse results with RRF
    4. Optional reranking
    5. Build context with evidence chains
    6. Return GraphRAGResponse with citations
    
    **Parameters**:
    - `query`: Natural language query
    - `agent_id`: Agent UUID for RAG profile and KG view
    - `session_id`: Optional session UUID for logging
    - `rag_profile_id`: Optional specific RAG profile
    - `skill_id`: Optional skill for skill-specific overrides
    - `metadata_filters`: Optional metadata filters
    - `max_tokens`: Maximum context tokens (default 4000)
    
    **Returns**:
    - `context`: Built context with citations
    - `evidence_chain`: List of evidence nodes with scores
    - `bibliography`: Formatted citation list
    - `search_stats`: Performance metrics
    
    **Example**:
    ```json
    {
      "query": "What are the latest guidelines for hypertension treatment?",
      "agent_id": "550e8400-e29b-41d4-a716-446655440000",
      "session_id": "650e8400-e29b-41d4-a716-446655440001",
      "max_tokens": 4000
    }
    ```
    """
    try:
        # Get GraphRAG service
        graphrag_service = await get_graphrag_service()
        
        # Execute query
        response = await graphrag_service.query(
            query=request.query,
            agent_id=request.agent_id,
            session_id=request.session_id,
            rag_profile_id=request.rag_profile_id,
            skill_id=request.skill_id,
            metadata_filters=request.metadata_filters,
            max_tokens=request.max_tokens or 4000
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"GraphRAG query failed: {str(e)}"
        )


@router.get("/health")
async def graphrag_health():
    """
    Check health of GraphRAG service and all components
    
    **Returns**:
    - `status`: Overall health status
    - `components`: Health of individual components (Postgres, Neo4j, Vector DB)
    
    **Example Response**:
    ```json
    {
      "service": "graphrag",
      "status": "healthy",
      "components": {
        "postgres": "healthy",
        "vector_db": "healthy",
        "neo4j": "healthy"
      }
    }
    ```
    """
    try:
        graphrag_service = await get_graphrag_service()
        health = await graphrag_service.health_check()
        
        if health['status'] != 'healthy':
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=health
            )
            
        return health
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "unhealthy", "error": str(e)}
        )

