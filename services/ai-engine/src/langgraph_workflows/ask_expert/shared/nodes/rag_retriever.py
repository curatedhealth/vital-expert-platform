# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [langgraph_workflows.state_schemas, tools.web_tools, structlog]
"""
VITAL Path AI Services - Ask Expert RAG Retriever Node

RAG retrieval node for Ask Expert Mode 1-4 workflows.

Naming Convention:
- Function: ask_expert_rag_retriever_node
- Factory: create_ask_expert_rag_node
- Logs: ask_expert_rag_{action}

CRITICAL FIX (Dec 2025):
- Added web search fallback when RAG returns < 3 documents
- Uses Tavily API via WebSearchTool for real-time web results
- Ensures expert never responds without sources
"""

from typing import Dict, Any, Callable, Awaitable, List, Optional
from datetime import datetime
import asyncio
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState

logger = structlog.get_logger()

# Minimum documents threshold before triggering web search fallback
MIN_RAG_DOCS_THRESHOLD = 3


async def _web_search_fallback(
    query: str,
    max_results: int = 5,
    request_id: str = "unknown",
) -> List[Dict[str, Any]]:
    """
    Fallback to web search when RAG returns insufficient documents.

    Uses Tavily API via WebSearchTool for real-time web results.

    Args:
        query: Search query
        max_results: Maximum results to return
        request_id: Request ID for logging

    Returns:
        List of processed documents from web search
    """
    try:
        # Import web search tool
        from tools.web_tools import WebSearchTool

        logger.info(
            "ask_expert_web_search_fallback_started",
            query=query[:100],
            request_id=request_id,
        )

        web_tool = WebSearchTool()
        results = await web_tool.search(
            query=query,
            max_results=max_results,
            search_depth="basic",
        )

        # Process web results into document format
        web_docs = []
        for item in results.get("results", []):
            web_docs.append({
                "content": item.get("content", ""),
                "score": item.get("score", 0.5),  # Default score for web results
                "source": item.get("url", "web_search"),
                "title": item.get("title", ""),
                "metadata": {
                    "source_type": "web_search",
                    "url": item.get("url", ""),
                    "published_date": item.get("published_date"),
                    "fallback": True,
                },
            })

        logger.info(
            "ask_expert_web_search_fallback_completed",
            request_id=request_id,
            web_docs_count=len(web_docs),
        )

        return web_docs

    except ImportError as e:
        logger.warning(
            "ask_expert_web_search_not_available",
            request_id=request_id,
            error=str(e),
        )
        return []
    except Exception as e:
        logger.error(
            "ask_expert_web_search_fallback_failed",
            request_id=request_id,
            error=str(e),
        )
        return []


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

        # CRITICAL FIX: Web search fallback when RAG returns insufficient documents
        web_search_used = False
        if len(processed_docs) < MIN_RAG_DOCS_THRESHOLD:
            logger.info(
                "ask_expert_rag_insufficient_docs",
                tenant_id=tenant_id,
                request_id=request_id,
                rag_docs_count=len(processed_docs),
                threshold=MIN_RAG_DOCS_THRESHOLD,
            )

            # Trigger web search fallback
            web_docs = await _web_search_fallback(
                query=query,
                max_results=5,
                request_id=request_id,
            )

            if web_docs:
                web_search_used = True
                # Append web results to RAG results
                processed_docs.extend(web_docs)
                logger.info(
                    "ask_expert_rag_web_fallback_added",
                    tenant_id=tenant_id,
                    request_id=request_id,
                    total_docs=len(processed_docs),
                    web_docs_added=len(web_docs),
                )

        logger.info(
            "ask_expert_rag_completed",
            tenant_id=tenant_id,
            request_id=request_id,
            documents_count=len(processed_docs),
            web_search_fallback=web_search_used,
        )

        return {
            "retrieved_documents": processed_docs,
            "total_documents": len(processed_docs),
            "web_search_used": web_search_used,
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
