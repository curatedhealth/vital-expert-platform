# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [langgraph_workflows.state_schemas, structlog]
"""
VITAL Path AI Services - Ask Expert Response Formatter Node

Response formatting for Ask Expert Mode 1-4 workflows.

Naming Convention:
- Function: ask_expert_format_response_node
- Logs: ask_expert_formatter_{action}
"""

from typing import Dict, Any, List
from datetime import datetime
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState, ExecutionStatus

logger = structlog.get_logger()


async def ask_expert_format_response_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Format final response for Ask Expert workflows.
    
    Adds:
    - Citations
    - Confidence scores
    - Quality indicators
    
    Used by: Mode 1, 2, 3, 4
    """
    tenant_id = state.get("tenant_id")
    request_id = state.get("request_id", "unknown")
    agent_response = state.get("agent_response", "")
    documents = state.get("retrieved_documents", [])
    include_citations = state.get("include_citations", True)
    mode = state.get("mode", "unknown")
    
    logger.info(
        "ask_expert_formatter_started",
        tenant_id=tenant_id,
        request_id=request_id,
        mode=str(mode),
    )
    
    try:
        # Build citations
        citations = []
        if include_citations and documents:
            citations = _build_ask_expert_citations(documents)
        
        # Calculate confidence
        confidence = _calculate_ask_expert_confidence(state)
        
        # Quality indicators
        quality = {
            "has_citations": bool(citations),
            "documents_used": len(documents),
            "model_used": state.get("model_used", "unknown"),
            "cache_hits": state.get("cache_hits", 0),
        }
        
        logger.info(
            "ask_expert_formatter_completed",
            tenant_id=tenant_id,
            request_id=request_id,
            citations_count=len(citations),
            confidence=confidence,
        )

        # Build result dict
        result = {
            "response": agent_response,
            "content": agent_response,  # Frontend alias
            "final_response": agent_response,  # Frontend alias
            "confidence": confidence,
            "citations": citations,
            "sources_used": len(documents),
            "quality_indicators": quality,
            "status": ExecutionStatus.COMPLETED,
            "nodes_executed": ["ask_expert_format_output"],
            "updated_at": datetime.utcnow(),
        }

        # Pass through llm_streaming_config if present (for route layer streaming)
        if state.get("llm_streaming_config"):
            result["llm_streaming_config"] = state["llm_streaming_config"]

        return result
        
    except Exception as e:
        logger.error(
            "ask_expert_formatter_failed",
            tenant_id=tenant_id,
            request_id=request_id,
            error=str(e),
        )
        return {
            "response": agent_response,
            "errors": [f"Formatting failed: {str(e)}"],
            "nodes_executed": ["ask_expert_format_output"],
        }


def _build_ask_expert_citations(documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Build citations from retrieved documents."""
    citations = []
    for i, doc in enumerate(documents[:10]):
        citations.append({
            "id": f"cite_{i+1}",
            "source": doc.get("source", "Unknown"),
            "title": doc.get("metadata", {}).get("title"),
            "snippet": doc.get("content", "")[:200],
            "score": doc.get("score", 0.0),
        })
    return citations


def _calculate_ask_expert_confidence(state: UnifiedWorkflowState) -> float:
    """Calculate response confidence."""
    response_conf = state.get("response_confidence", 0.5)
    retrieval_conf = state.get("retrieval_confidence", 0.5)
    docs = state.get("retrieved_documents", [])
    
    # Weighted calculation
    doc_score = min(len(docs) / 5.0, 1.0)
    confidence = (response_conf * 0.5 + retrieval_conf * 0.3 + doc_score * 0.2)
    
    return round(confidence, 3)
