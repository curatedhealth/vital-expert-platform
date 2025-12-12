"""
VITAL Path AI Services - RAG Retriever Node

Shared RAG retrieval node for all LangGraph workflow modes.
Wraps the UnifiedRAGService for workflow integration.

Phase 1 Refactoring: Task 1.2.3

Golden Rules Compliance:
- ✅ Caching at RAG level (Golden Rule #2)
- ✅ Tenant isolation (Golden Rule #3)
- ✅ RAG/Tools enforcement (Golden Rule #4)
"""

from typing import Dict, Any, Optional, Callable, Awaitable, List
from datetime import datetime
import asyncio
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState, ExecutionStatus

logger = structlog.get_logger()


def create_rag_retriever_node(
    rag_service,
    top_k: int = 10,
    include_sources: bool = True,
    retry_attempts: int = 3,
    retry_delay: float = 1.0,
) -> Callable[[UnifiedWorkflowState], Awaitable[Dict[str, Any]]]:
    """
    Factory function to create a RAG retriever node.
    
    Creates a configured RAG retrieval node that can be used in any workflow.
    
    Args:
        rag_service: UnifiedRAGService instance
        top_k: Number of documents to retrieve
        include_sources: Include source metadata in results
        retry_attempts: Number of retry attempts on failure
        retry_delay: Delay between retries in seconds
        
    Returns:
        Async node function for LangGraph
        
    Example:
        >>> from services.unified_rag_service import UnifiedRAGService
        >>> rag_service = UnifiedRAGService(supabase_client)
        >>> rag_node = create_rag_retriever_node(rag_service, top_k=5)
        >>> workflow.add_node("retrieve", rag_node)
    """
    
    async def rag_retriever_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Retrieve relevant documents using RAG.
        
        Args:
            state: Current workflow state
            
        Returns:
            State updates with retrieved documents
        """
        tenant_id = state.get("tenant_id")
        query = state.get("query", "")
        request_id = state.get("request_id", "unknown")
        enable_rag = state.get("enable_rag", True)
        selected_domains = state.get("selected_rag_domains", [])
        
        logger.info(
            "rag_retriever_node_started",
            tenant_id=tenant_id,
            request_id=request_id,
            enable_rag=enable_rag,
            domains=selected_domains,
        )
        
        # Skip RAG if disabled
        if not enable_rag:
            logger.info(
                "rag_retriever_node_skipped",
                tenant_id=tenant_id,
                request_id=request_id,
                reason="RAG disabled",
            )
            return {
                "nodes_executed": ["rag_retriever"],
                "rag_cache_hit": False,
                "updated_at": datetime.utcnow(),
            }
        
        # Skip if no RAG service
        if not rag_service:
            logger.warning(
                "rag_retriever_node_no_service",
                tenant_id=tenant_id,
                request_id=request_id,
            )
            return {
                "errors": ["RAG service not available"],
                "nodes_executed": ["rag_retriever"],
                "updated_at": datetime.utcnow(),
            }
        
        # Retry logic with exponential backoff
        last_error = None
        for attempt in range(retry_attempts):
            try:
                # Call RAG service with tenant isolation
                results = await rag_service.retrieve(
                    query=query,
                    tenant_id=tenant_id,
                    top_k=top_k,
                    domains=selected_domains if selected_domains else None,
                )
                
                # Process results
                documents = _process_rag_results(results, include_sources)
                cache_hit = getattr(results, 'cache_hit', False) if hasattr(results, 'cache_hit') else False
                
                logger.info(
                    "rag_retriever_node_completed",
                    tenant_id=tenant_id,
                    request_id=request_id,
                    documents_count=len(documents),
                    cache_hit=cache_hit,
                )
                
                return {
                    "retrieved_documents": documents,
                    "total_documents": len(documents),
                    "retrieval_confidence": _calculate_confidence(documents),
                    "rag_cache_hit": cache_hit,
                    "retrieval_source": "rag",
                    "nodes_executed": ["rag_retriever"],
                    "updated_at": datetime.utcnow(),
                }
                
            except Exception as e:
                last_error = e
                logger.warning(
                    "rag_retriever_node_retry",
                    tenant_id=tenant_id,
                    request_id=request_id,
                    attempt=attempt + 1,
                    error=str(e),
                )
                if attempt < retry_attempts - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
        
        # All retries failed
        logger.error(
            "rag_retriever_node_failed",
            tenant_id=tenant_id,
            request_id=request_id,
            error=str(last_error),
        )
        
        return {
            "errors": [f"RAG retrieval failed: {str(last_error)}"],
            "retrieved_documents": [],
            "total_documents": 0,
            "rag_cache_hit": False,
            "nodes_executed": ["rag_retriever"],
            "updated_at": datetime.utcnow(),
        }
    
    return rag_retriever_node


def _process_rag_results(results: Any, include_sources: bool) -> List[Dict[str, Any]]:
    """
    Process RAG results into standard document format.
    
    Args:
        results: RAG service results
        include_sources: Include source metadata
        
    Returns:
        List of processed documents
    """
    documents = []
    
    # Handle different result formats
    if hasattr(results, 'documents'):
        raw_docs = results.documents
    elif isinstance(results, list):
        raw_docs = results
    elif isinstance(results, dict) and 'documents' in results:
        raw_docs = results['documents']
    else:
        return []
    
    for doc in raw_docs:
        processed = {
            "content": doc.get("content", doc.get("text", "")),
            "score": doc.get("score", doc.get("relevance_score", 0.0)),
        }
        
        if include_sources:
            processed["source"] = doc.get("source", doc.get("metadata", {}).get("source", "unknown"))
            processed["metadata"] = doc.get("metadata", {})
        
        documents.append(processed)
    
    return documents


def _calculate_confidence(documents: List[Dict[str, Any]]) -> float:
    """
    Calculate retrieval confidence based on document scores.
    
    Args:
        documents: Retrieved documents with scores
        
    Returns:
        Confidence score 0.0-1.0
    """
    if not documents:
        return 0.0
    
    scores = [doc.get("score", 0.0) for doc in documents]
    avg_score = sum(scores) / len(scores)
    
    # Normalize to 0-1 range
    return min(max(avg_score, 0.0), 1.0)
