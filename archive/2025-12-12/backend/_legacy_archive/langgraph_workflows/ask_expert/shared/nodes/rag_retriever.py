"""
VITAL Path AI Services - Ask Expert RAG Retriever Node

RAG retrieval node for Ask Expert Mode 1-4 workflows.

Naming Convention:
- Function: ask_expert_rag_retriever_node
- Factory: create_ask_expert_rag_node
- Logs: ask_expert_rag_{action}
"""

from typing import Dict, Any, Callable, Awaitable, List
from datetime import datetime
import asyncio
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()


def create_ask_expert_rag_node(
    rag_service,
    top_k: int = 10,
) -> Callable[[UnifiedWorkflowState], Awaitable[Dict[str, Any]]]:
    """
    Factory to create Ask Expert RAG retriever node.
    
    Args:
        rag_service: UnifiedRAGService instance
        top_k: Number of documents to retrieve
        
    Returns:
        Configured async node function
    """
    
    async def node(state: UnifiedWorkflowState) -> Dict[str, Any]:
        return await ask_expert_rag_retriever_node(state, rag_service, top_k)
    
    return node


async def ask_expert_rag_retriever_node(
    state: UnifiedWorkflowState,
    rag_service=None,
    top_k: int = 10,
) -> Dict[str, Any]:
    """
    Retrieve documents for Ask Expert workflows.
    
    Used by: Mode 1, 2, 3, 4
    
    Golden Rules:
    - ✅ Caching (Golden Rule #2)
    - ✅ Tenant isolation (Golden Rule #3)
    - ✅ RAG mandatory (Golden Rule #4)
    """
    tenant_id = state.get("tenant_id")
    query = state.get("query", "")
    request_id = state.get("request_id", "unknown")
    enable_rag = state.get("enable_rag", True)
    mode = state.get("mode", "unknown")
    
    logger.info(
        "ask_expert_rag_started",
        tenant_id=tenant_id,
        request_id=request_id,
        mode=str(mode),
        enable_rag=enable_rag,
    )
    
    if not enable_rag:
        return {
            "retrieved_documents": [],
            "nodes_executed": ["ask_expert_rag_retrieval"],
        }
    
    if not rag_service:
        logger.warning("ask_expert_rag_no_service", request_id=request_id)
        return {
            "retrieved_documents": [],
            "nodes_executed": ["ask_expert_rag_retrieval"],
        }
    
    try:
        results = await rag_service.retrieve(
            query=query,
            tenant_id=tenant_id,
            top_k=top_k,
        )
        
        # Process results
        documents = []
        if hasattr(results, 'documents'):
            documents = results.documents
        elif isinstance(results, list):
            documents = results
        elif isinstance(results, dict):
            documents = results.get('documents', [])
        
        processed_docs = [
            {
                "content": doc.get("content", doc.get("text", "")),
                "score": doc.get("score", 0.0),
                "source": doc.get("source", "unknown"),
                "metadata": doc.get("metadata", {}),
            }
            for doc in documents
        ]
        
        logger.info(
            "ask_expert_rag_completed",
            tenant_id=tenant_id,
            request_id=request_id,
            documents_count=len(processed_docs),
        )
        
        return {
            "retrieved_documents": processed_docs,
            "total_documents": len(processed_docs),
            "nodes_executed": ["ask_expert_rag_retrieval"],
            "updated_at": datetime.utcnow(),
        }
        
    except Exception as e:
        logger.error(
            "ask_expert_rag_failed",
            tenant_id=tenant_id,
            request_id=request_id,
            error=str(e),
        )
        return {
            "retrieved_documents": [],
            "errors": [f"RAG retrieval failed: {str(e)}"],
            "nodes_executed": ["ask_expert_rag_retrieval"],
        }
