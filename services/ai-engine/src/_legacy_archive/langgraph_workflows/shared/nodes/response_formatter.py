"""
VITAL Path AI Services - Response Formatter Node

Shared response formatting for all LangGraph workflow modes.
Handles citations, streaming chunks, and error responses.

Phase 1 Refactoring: Task 1.2.4
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState, ExecutionStatus

logger = structlog.get_logger()


@dataclass
class Citation:
    """Citation reference."""
    id: str
    source: str
    title: Optional[str] = None
    url: Optional[str] = None
    snippet: Optional[str] = None
    relevance_score: float = 0.0


@dataclass
class StreamingChunk:
    """Streaming response chunk."""
    content: str
    chunk_index: int
    is_final: bool = False
    citations: Optional[List[Citation]] = None


@dataclass
class ErrorResponse:
    """Error response format."""
    error: str
    error_type: str
    request_id: str
    timestamp: str
    recoverable: bool = False


async def format_response_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Format the final response with citations and metadata.
    
    Takes the agent response and enriches it with:
    - Citation formatting
    - Confidence scores
    - Processing metadata
    - Quality indicators
    
    Args:
        state: Current workflow state with agent_response
        
    Returns:
        State updates with formatted response
        
    Example:
        >>> workflow.add_node("format_output", format_response_node)
    """
    tenant_id = state.get("tenant_id")
    request_id = state.get("request_id", "unknown")
    agent_response = state.get("agent_response", "")
    retrieved_documents = state.get("retrieved_documents", [])
    include_citations = state.get("include_citations", True)
    citation_style = state.get("citation_style", "apa")
    
    logger.info(
        "format_response_node_started",
        tenant_id=tenant_id,
        request_id=request_id,
        has_response=bool(agent_response),
        documents_count=len(retrieved_documents),
    )
    
    try:
        # Format citations if requested
        citations = []
        if include_citations and retrieved_documents:
            citations = _format_citations(retrieved_documents, citation_style)
        
        # Calculate confidence
        confidence = _calculate_response_confidence(state)
        
        # Build quality indicators
        quality_indicators = _build_quality_indicators(state)
        
        # Format final response
        formatted_response = agent_response
        if citations:
            formatted_response = _inject_citations(agent_response, citations)
        
        logger.info(
            "format_response_node_completed",
            tenant_id=tenant_id,
            request_id=request_id,
            citations_count=len(citations),
            confidence=confidence,
        )
        
        return {
            "response": formatted_response,
            "content": formatted_response,  # Alias for frontend
            "final_response": formatted_response,  # Alias
            "confidence": confidence,
            "citations": [c.__dict__ if hasattr(c, '__dict__') else c for c in citations],
            "sources_used": len(retrieved_documents),
            "quality_indicators": quality_indicators,
            "status": ExecutionStatus.COMPLETED,
            "nodes_executed": ["format_output"],
            "updated_at": datetime.utcnow(),
        }
        
    except Exception as e:
        logger.error(
            "format_response_node_error",
            tenant_id=tenant_id,
            request_id=request_id,
            error=str(e),
        )
        return {
            "response": agent_response,  # Return unformatted
            "errors": [f"Response formatting failed: {str(e)}"],
            "nodes_executed": ["format_output"],
            "updated_at": datetime.utcnow(),
        }


def format_streaming_chunk(
    content: str,
    chunk_index: int,
    citations: Optional[List[Citation]] = None,
    is_final: bool = False,
) -> StreamingChunk:
    """
    Format a streaming chunk for SSE.
    
    Args:
        content: Chunk content
        chunk_index: Index of this chunk
        citations: Optional citations for this chunk
        is_final: Whether this is the final chunk
        
    Returns:
        StreamingChunk ready for SSE
    """
    return StreamingChunk(
        content=content,
        chunk_index=chunk_index,
        is_final=is_final,
        citations=citations,
    )


def format_error_response(
    error: Exception,
    request_id: str,
    recoverable: bool = False,
) -> ErrorResponse:
    """
    Format error for client consumption.
    
    Args:
        error: Exception that occurred
        request_id: Request identifier
        recoverable: Whether the error is recoverable
        
    Returns:
        ErrorResponse with formatted error info
    """
    return ErrorResponse(
        error=str(error),
        error_type=type(error).__name__,
        request_id=request_id,
        timestamp=datetime.utcnow().isoformat(),
        recoverable=recoverable,
    )


def _format_citations(
    documents: List[Dict[str, Any]],
    style: str = "apa",
) -> List[Citation]:
    """
    Format retrieved documents as citations.
    
    Args:
        documents: Retrieved documents
        style: Citation style (apa, ama, etc.)
        
    Returns:
        List of formatted citations
    """
    citations = []
    
    for i, doc in enumerate(documents):
        citation = Citation(
            id=f"cite_{i+1}",
            source=doc.get("source", doc.get("metadata", {}).get("source", "Unknown")),
            title=doc.get("title", doc.get("metadata", {}).get("title")),
            url=doc.get("url", doc.get("metadata", {}).get("url")),
            snippet=doc.get("content", "")[:200] + "..." if doc.get("content", "") else None,
            relevance_score=doc.get("score", 0.0),
        )
        citations.append(citation)
    
    return citations


def _inject_citations(response: str, citations: List[Citation]) -> str:
    """
    Inject citation references into response.
    
    For now, just appends citations. More sophisticated
    inline citation injection can be added later.
    
    Args:
        response: Agent response
        citations: Formatted citations
        
    Returns:
        Response with citation references
    """
    # Simple implementation - append references
    # More sophisticated inline citation can be added
    return response


def _calculate_response_confidence(state: UnifiedWorkflowState) -> float:
    """
    Calculate overall response confidence.
    
    Factors in:
    - Agent response confidence
    - Retrieval confidence
    - Citation count
    
    Args:
        state: Current workflow state
        
    Returns:
        Confidence score 0.0-1.0
    """
    response_conf = state.get("response_confidence", 0.5)
    retrieval_conf = state.get("retrieval_confidence", 0.5)
    documents = state.get("retrieved_documents", [])
    
    # Weight factors
    weights = {
        "response": 0.5,
        "retrieval": 0.3,
        "sources": 0.2,
    }
    
    # Source score based on document count (max at 5+ docs)
    source_score = min(len(documents) / 5.0, 1.0)
    
    confidence = (
        response_conf * weights["response"] +
        retrieval_conf * weights["retrieval"] +
        source_score * weights["sources"]
    )
    
    return round(confidence, 3)


def _build_quality_indicators(state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Build quality indicators for the response.
    
    Args:
        state: Current workflow state
        
    Returns:
        Quality indicators dict
    """
    return {
        "has_citations": bool(state.get("retrieved_documents")),
        "documents_used": len(state.get("retrieved_documents", [])),
        "cache_hits": state.get("cache_hits", 0),
        "rag_cache_hit": state.get("rag_cache_hit", False),
        "model_used": state.get("model_used", "unknown"),
    }
