"""
RAG Tool - Search Internal Knowledge Base

Wraps the UnifiedRAGService as a chainable tool for the autonomous agent system.

Features:
- Search across multiple RAG domains
- Tenant-aware document retrieval
- Relevance scoring
- Result summarization
- Cost tracking (no API cost for internal RAG)

Usage:
    >>> from tools.rag_tool import RAGTool
    >>> from services.unified_rag_service import get_rag_service
    >>> 
    >>> tool = RAGTool(get_rag_service())
    >>> input = ToolInput(
    ...     data="What are FDA IND requirements?",
    ...     context={"tenant_id": "tenant-123", "rag_domains": ["regulatory"]}
    ... )
    >>> output = await tool.execute(input)
"""

from typing import List, Dict, Any, Optional
from pydantic import UUID4
import structlog

from tools.base_tool import BaseTool, ToolInput, ToolOutput
from services.unified_rag_service import UnifiedRAGService

logger = structlog.get_logger()


class RAGTool(BaseTool):
    """
    Search internal knowledge base for relevant documents and information.
    
    Use this tool for:
    - FDA regulations and guidance
    - Clinical guidelines and protocols
    - Internal SOPs and procedures
    - Historical data and case studies
    - Compliance documentation
    - Research papers and publications
    """
    
    def __init__(self, rag_service: UnifiedRAGService):
        """
        Initialize RAG tool.
        
        Args:
            rag_service: UnifiedRAGService instance for document retrieval
        """
        super().__init__()
        self.rag_service = rag_service
        logger.info("RAGTool initialized")
    
    @property
    def name(self) -> str:
        return "rag_search"
    
    @property
    def description(self) -> str:
        return (
            "Search internal knowledge base for relevant documents and information. "
            "Use for FDA regulations, clinical guidelines, internal SOPs, historical data, "
            "compliance documentation, and research papers. Returns top relevant documents "
            "with citations and relevance scores. ALWAYS use this before answering questions "
            "about regulations, procedures, or internal knowledge."
        )
    
    @property
    def category(self) -> str:
        return "retrieval"
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute RAG search.
        
        Args:
            tool_input: Tool input containing:
                - data: Query string or dict with 'query' key
                - context: Must contain 'tenant_id', optionally 'rag_domains'
                
        Returns:
            ToolOutput with search results
        """
        try:
            # Extract query
            if isinstance(tool_input.data, dict):
                query = tool_input.data.get('query', str(tool_input.data))
                max_results = tool_input.data.get('max_results', 5)
            else:
                query = str(tool_input.data)
                max_results = 5
            
            # Extract context
            tenant_id = tool_input.context.get('tenant_id')
            if not tenant_id:
                return ToolOutput(
                    success=False,
                    data=None,
                    error_message="Missing required context: tenant_id"
                )
            
            domains = tool_input.context.get('rag_domains', [])
            
            logger.info(
                "Executing RAG search",
                query=query[:100],
                tenant_id=str(tenant_id)[:8],
                domains=domains,
                max_results=max_results
            )
            
            # Execute search
            results = await self.rag_service.search(
                query=query,
                tenant_id=UUID4(tenant_id) if isinstance(tenant_id, str) else tenant_id,
                domains=domains if domains else None,
                max_results=max_results
            )
            
            documents = results.get('documents', [])
            
            # Generate summary
            summary = self._summarize_results(documents, query)
            
            logger.info(
                "RAG search completed",
                num_results=len(documents),
                avg_relevance=sum(d.get('relevance', 0.0) for d in documents) / len(documents) if documents else 0.0
            )
            
            return ToolOutput(
                success=True,
                data={
                    'query': query,
                    'num_results': len(documents),
                    'documents': documents,
                    'summary': summary,
                    'domains_searched': domains
                },
                metadata={
                    'domains_searched': domains,
                    'relevance_scores': [d.get('relevance', 0.0) for d in documents],
                    'source_types': list(set(d.get('source_type', 'unknown') for d in documents))
                },
                cost_usd=0.0  # Internal RAG has no API cost
            )
            
        except Exception as e:
            logger.error(
                "RAG search failed",
                query=query[:100] if 'query' in locals() else None,
                error=str(e),
                error_type=type(e).__name__
            )
            
            return ToolOutput(
                success=False,
                data=None,
                error_message=f"RAG search failed: {str(e)}",
                metadata={'error_type': type(e).__name__}
            )
    
    def _summarize_results(self, documents: List[Dict[str, Any]], query: str) -> str:
        """
        Create brief summary of search results.
        
        Args:
            documents: List of retrieved documents
            query: Original query
            
        Returns:
            Summary string
        """
        if not documents:
            return f"No relevant documents found for: {query}"
        
        summary_parts = [f"Found {len(documents)} relevant documents:"]
        
        for i, doc in enumerate(documents[:3], 1):
            title = doc.get('title', 'Untitled Document')
            content = doc.get('content', '')
            snippet = content[:150] + "..." if len(content) > 150 else content
            relevance = doc.get('relevance', 0.0)
            
            summary_parts.append(
                f"{i}. {title} (relevance: {relevance:.2f})\n   {snippet}"
            )
        
        if len(documents) > 3:
            summary_parts.append(f"   ...and {len(documents) - 3} more documents")
        
        return "\n".join(summary_parts)


class RAGMultiDomainTool(BaseTool):
    """
    Advanced RAG tool that searches across multiple domains in parallel.
    
    Use when you need comprehensive information from various sources.
    """
    
    def __init__(self, rag_service: UnifiedRAGService):
        super().__init__()
        self.rag_service = rag_service
        logger.info("RAGMultiDomainTool initialized")
    
    @property
    def name(self) -> str:
        return "rag_search_multi_domain"
    
    @property
    def description(self) -> str:
        return (
            "Search across multiple knowledge domains simultaneously. "
            "Use when you need comprehensive information from various sources "
            "(regulatory, clinical, research, compliance). Returns aggregated "
            "results with domain attribution."
        )
    
    @property
    def category(self) -> str:
        return "retrieval"
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """Execute multi-domain RAG search."""
        try:
            # Extract query and domains
            if isinstance(tool_input.data, dict):
                query = tool_input.data.get('query', str(tool_input.data))
                domains = tool_input.data.get('domains', ['regulatory', 'clinical', 'research'])
            else:
                query = str(tool_input.data)
                domains = ['regulatory', 'clinical', 'research']
            
            tenant_id = tool_input.context.get('tenant_id')
            if not tenant_id:
                return ToolOutput(
                    success=False,
                    data=None,
                    error_message="Missing required context: tenant_id"
                )
            
            logger.info(
                "Executing multi-domain RAG search",
                query=query[:100],
                domains=domains
            )
            
            # Search each domain
            all_results = []
            for domain in domains:
                results = await self.rag_service.search(
                    query=query,
                    tenant_id=UUID4(tenant_id) if isinstance(tenant_id, str) else tenant_id,
                    domains=[domain],
                    max_results=3
                )
                
                for doc in results.get('documents', []):
                    doc['source_domain'] = domain
                    all_results.append(doc)
            
            # Sort by relevance
            all_results.sort(key=lambda x: x.get('relevance', 0.0), reverse=True)
            
            # Take top results
            top_results = all_results[:10]
            
            logger.info(
                "Multi-domain search completed",
                total_results=len(all_results),
                top_results=len(top_results),
                domains=domains
            )
            
            return ToolOutput(
                success=True,
                data={
                    'query': query,
                    'num_results': len(top_results),
                    'documents': top_results,
                    'summary': self._summarize_multi_domain(top_results, query),
                    'domains_searched': domains
                },
                metadata={
                    'domains_searched': domains,
                    'results_per_domain': {
                        domain: len([d for d in top_results if d.get('source_domain') == domain])
                        for domain in domains
                    }
                },
                cost_usd=0.0
            )
            
        except Exception as e:
            logger.error("Multi-domain RAG search failed", error=str(e))
            return ToolOutput(
                success=False,
                data=None,
                error_message=f"Multi-domain search failed: {str(e)}"
            )
    
    def _summarize_multi_domain(self, documents: List[Dict], query: str) -> str:
        """Summarize multi-domain results."""
        if not documents:
            return f"No results found across domains for: {query}"
        
        summary = [f"Found {len(documents)} documents across domains:"]
        
        # Group by domain
        by_domain: Dict[str, List[Dict]] = {}
        for doc in documents:
            domain = doc.get('source_domain', 'unknown')
            if domain not in by_domain:
                by_domain[domain] = []
            by_domain[domain].append(doc)
        
        for domain, docs in by_domain.items():
            summary.append(f"\n{domain.upper()} ({len(docs)} docs):")
            for doc in docs[:2]:
                title = doc.get('title', 'Untitled')
                summary.append(f"  - {title}")
        
        return "\n".join(summary)

