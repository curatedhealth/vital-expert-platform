"""
RAG Tool - Shared AI Service

TAG: SHARED_AI_SERVICES_LIBRARY

Wraps UnifiedRAGService as a tool for agent workflows.

Usage:
    from vital_ai_services.tools import RAGTool
    from vital_ai_services.rag import UnifiedRAGService
    from vital_ai_services.core.models import ToolInput, ToolOutput
    
    rag_service = UnifiedRAGService(...)
    await rag_service.initialize()
    
    tool = RAGTool(rag_service)
    
    tool_input = ToolInput(
        tool_name="rag_search",
        data="What are FDA IND requirements?",
        context={
            "domain_ids": ["regulatory"],
            "max_results": 10
        },
        tenant_id="tenant-123"
    )
    
    output = await tool.execute(tool_input)
"""

import structlog

from vital_ai_services.tools.base import BaseTool
from vital_ai_services.core.models import ToolInput, ToolOutput, RAGQuery

logger = structlog.get_logger()


class RAGTool(BaseTool):
    """
    RAG search tool that wraps UnifiedRAGService.
    
    TAG: RAG_TOOL
    
    Features:
    - Search internal knowledge base
    - Multiple search strategies
    - Domain filtering
    - Tenant-aware access
    """
    
    def __init__(self, rag_service):
        """
        Initialize RAG tool.
        
        Args:
            rag_service: UnifiedRAGService instance
        """
        super().__init__()
        self.rag_service = rag_service
    
    @property
    def name(self) -> str:
        return "rag_search"
    
    @property
    def description(self) -> str:
        return (
            "Search the internal knowledge base for relevant documents and information. "
            "Use this tool when you need to retrieve information from internal sources, "
            "regulatory documents, clinical trial data, or company-specific knowledge. "
            "Returns relevant document excerpts with metadata and similarity scores."
        )
    
    @property
    def category(self) -> str:
        return "retrieval"
    
    @property
    def requires_tenant_access(self) -> bool:
        return True
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute RAG search.
        
        Args:
            tool_input: Tool input with query and context
            
        Returns:
            ToolOutput with search results
        """
        try:
            query_text = tool_input.data if isinstance(tool_input.data, str) else str(tool_input.data)
            
            # Extract parameters from context
            strategy = tool_input.context.get('strategy', 'hybrid')
            domain_ids = tool_input.context.get('domain_ids')
            max_results = tool_input.context.get('max_results', 10)
            similarity_threshold = tool_input.context.get('similarity_threshold', 0.7)
            
            # Build RAG query
            rag_query = RAGQuery(
                query_text=query_text,
                strategy=strategy,
                domain_ids=domain_ids,
                max_results=max_results,
                similarity_threshold=similarity_threshold,
                tenant_id=tool_input.tenant_id or "default",
                user_id=tool_input.user_id,
                session_id=tool_input.session_id
            )
            
            # Execute search
            response = await self.rag_service.query(rag_query)
            
            # Format output
            return ToolOutput(
                success=True,
                tool_name=self.name,
                data={
                    "sources": [s.dict() for s in response.sources],
                    "context_summary": response.context_summary,
                    "total_results": response.total_results
                },
                metadata={
                    "query": query_text,
                    "strategy": response.strategy_used,
                    "domains": response.domains,
                    "cache_hit": response.cache_hit,
                    "search_time_ms": response.search_time_ms,
                    "avg_similarity": response.avg_similarity,
                    "tool": self.name
                },
                cost_usd=0.0  # Internal RAG has no external API cost
            )
        
        except Exception as e:
            logger.error(f"RAG search execution failed", error=str(e))
            return ToolOutput(
                success=False,
                tool_name=self.name,
                data={},
                error_message=str(e),
                metadata={"tool": self.name}
            )

