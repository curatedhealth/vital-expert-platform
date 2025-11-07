"""
Web Search Tool - Shared AI Service

TAG: SHARED_AI_SERVICES_LIBRARY

Real web search using Tavily API.

Usage:
    from vital_ai_services.tools import WebSearchTool
    from vital_ai_services.core.models import ToolInput, ToolOutput
    
    tool = WebSearchTool(api_key=os.getenv("TAVILY_API_KEY"))
    
    tool_input = ToolInput(
        tool_name="web_search",
        data="What are FDA IND requirements?",
        context={"max_results": 5}
    )
    
    output = await tool.execute(tool_input)
"""

import aiohttp
from typing import Dict, List, Any, Optional
import structlog

from vital_ai_services.tools.base import BaseTool
from vital_ai_services.core.models import ToolInput, ToolOutput

logger = structlog.get_logger()


class WebSearchTool(BaseTool):
    """
    Real web search using Tavily API.
    
    TAG: WEB_SEARCH_TOOL
    
    Features:
    - Real-time web search
    - Configurable result count
    - Domain filtering
    - AI-generated answers from Tavily
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize web search tool.
        
        Args:
            api_key: Tavily API key (if None, must be in environment)
        """
        super().__init__()
        self.api_key = api_key
        self.base_url = "https://api.tavily.com/search"
        
        if not self.api_key:
            logger.warning("⚠️ WebSearchTool initialized without API key")
    
    @property
    def name(self) -> str:
        return "web_search"
    
    @property
    def description(self) -> str:
        return (
            "Search the web for current information, news, research, and general knowledge. "
            "Use this tool when the answer requires recent information, external sources, "
            "or data not available in internal knowledge bases. Returns web search results "
            "with titles, URLs, and content snippets."
        )
    
    @property
    def category(self) -> str:
        return "retrieval"
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute web search.
        
        Args:
            tool_input: Tool input with query
            
        Returns:
            ToolOutput with search results
        """
        try:
            query = tool_input.data if isinstance(tool_input.data, str) else str(tool_input.data)
            max_results = tool_input.context.get('max_results', 5)
            search_depth = tool_input.context.get('search_depth', 'basic')
            
            result = await self.search(
                query=query,
                max_results=max_results,
                search_depth=search_depth
            )
            
            return ToolOutput(
                success=True,
                tool_name=self.name,
                data=result,
                metadata={
                    "query": query,
                    "results_count": len(result.get('results', [])),
                    "tool": self.name,
                    "has_answer": bool(result.get('answer'))
                }
            )
        
        except Exception as e:
            logger.error(f"Web search execution failed", error=str(e))
            return ToolOutput(
                success=False,
                tool_name=self.name,
                data={},
                error_message=str(e),
                metadata={"tool": self.name}
            )
    
    async def search(
        self,
        query: str,
        max_results: int = 5,
        search_depth: str = "basic",
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Search the web using Tavily API.
        
        Args:
            query: Search query
            max_results: Maximum number of results (1-20)
            search_depth: 'basic' or 'advanced'
            include_domains: List of domains to include
            exclude_domains: List of domains to exclude
            
        Returns:
            Search results with titles, URLs, content, and optional AI answer
        """
        if not self.api_key:
            logger.error("❌ Tavily API key not configured")
            return {
                "results": [],
                "query": query,
                "total_results": 0,
                "error": "TAVILY_API_KEY not configured"
            }
        
        try:
            # Build request payload
            payload = {
                "api_key": self.api_key,
                "query": query,
                "max_results": min(max_results, 20),
                "search_depth": search_depth,
                "include_answer": True,
                "include_raw_content": False,
            }
            
            if include_domains:
                payload["include_domains"] = include_domains
            if exclude_domains:
                payload["exclude_domains"] = exclude_domains
            
            # Make API request
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(
                            "Tavily API error",
                            status=response.status,
                            error=error_text
                        )
                        return {
                            "results": [],
                            "query": query,
                            "total_results": 0,
                            "error": f"API returned {response.status}"
                        }
                    
                    data = await response.json()
            
            # Parse results
            results = []
            for item in data.get("results", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "content": item.get("content", ""),
                    "score": item.get("score", 0.0),
                    "published_date": item.get("published_date")
                })
            
            return {
                "results": results,
                "answer": data.get("answer"),  # AI-generated answer from Tavily
                "query": query,
                "total_results": len(results)
            }
        
        except Exception as e:
            logger.error("Web search failed", error=str(e))
            return {
                "results": [],
                "query": query,
                "total_results": 0,
                "error": str(e)
            }

