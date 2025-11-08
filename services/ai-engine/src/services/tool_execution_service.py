"""
Tool Execution Service

Executes tools in parallel, formats results, handles errors, and tracks statistics.

Features:
- Parallel tool execution (multiple tools at once)
- Tool-specific result formatting
- Graceful error handling
- Execution timing and statistics
- Progress tracking for streaming
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import structlog
from pydantic import BaseModel

from models.tool_metadata import get_tool_metadata, ToolMetadata
from services.tool_suggestion_service import ToolSuggestion

logger = structlog.get_logger(__name__)


class ToolResult(BaseModel):
    """Result from tool execution"""
    tool_name: str
    display_name: str
    status: str  # "success", "error", "timeout"
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    duration_seconds: float
    timestamp: str
    cost: float = 0.0


class ToolExecutionService:
    """
    Executes tools and formats results
    
    Key features:
    - Parallel execution (faster)
    - Tool-specific formatting (user-friendly display)
    - Error isolation (one tool failure doesn't crash others)
    - Statistics tracking (usage, timing, costs)
    """
    
    def __init__(self, max_concurrent: int = 3, timeout_seconds: float = 30.0):
        """
        Initialize tool execution service
        
        Args:
            max_concurrent: Max tools to execute simultaneously
            timeout_seconds: Timeout for individual tool execution
        """
        self.max_concurrent = max_concurrent
        self.timeout_seconds = timeout_seconds
        self._tool_executors = self._register_executors()
    
    def _register_executors(self) -> Dict[str, callable]:
        """
        Register tool executor functions
        
        Each tool has a specific executor function that:
        1. Takes tool parameters
        2. Calls external API or performs computation
        3. Returns raw result
        """
        return {
            "web_search": self._execute_web_search,
            "pubmed_search": self._execute_pubmed_search,
            "fda_database": self._execute_fda_database,
            "calculator": self._execute_calculator,
        }
    
    async def execute_tools(
        self,
        suggestions: List[ToolSuggestion],
        context: Optional[Dict[str, Any]] = None
    ) -> List[ToolResult]:
        """
        Execute multiple tools in parallel
        
        Args:
            suggestions: List of tool suggestions to execute
            context: Optional context (user_id, session_id, etc.)
            
        Returns:
            List of tool results (both successful and failed)
        """
        
        if not suggestions:
            return []
        
        logger.info(
            "Executing tools",
            tool_count=len(suggestions),
            tools=[s.tool_name for s in suggestions]
        )
        
        # Create execution tasks
        tasks = [
            self._execute_single_tool(suggestion, context)
            for suggestion in suggestions
        ]
        
        # Execute in parallel with semaphore to limit concurrency
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def bounded_execution(task):
            async with semaphore:
                return await task
        
        results = await asyncio.gather(
            *[bounded_execution(task) for task in tasks],
            return_exceptions=True
        )
        
        # Process results (handle exceptions)
        tool_results = []
        for suggestion, result in zip(suggestions, results):
            if isinstance(result, Exception):
                # Execution raised exception
                logger.error(
                    "Tool execution failed with exception",
                    tool=suggestion.tool_name,
                    error=str(result)
                )
                
                tool_meta = get_tool_metadata(suggestion.tool_name)
                tool_results.append(ToolResult(
                    tool_name=suggestion.tool_name,
                    display_name=tool_meta.display_name if tool_meta else suggestion.tool_name,
                    status="error",
                    error=f"Execution failed: {str(result)}",
                    duration_seconds=0.0,
                    timestamp=datetime.now().isoformat()
                ))
            else:
                # Successful execution (or controlled error)
                tool_results.append(result)
        
        # Log summary
        successful = sum(1 for r in tool_results if r.status == "success")
        failed = sum(1 for r in tool_results if r.status == "error")
        
        logger.info(
            "Tool execution complete",
            total=len(tool_results),
            successful=successful,
            failed=failed
        )
        
        return tool_results
    
    async def _execute_single_tool(
        self,
        suggestion: ToolSuggestion,
        context: Optional[Dict[str, Any]]
    ) -> ToolResult:
        """
        Execute a single tool with timing and error handling
        """
        
        start_time = datetime.now()
        tool_name = suggestion.tool_name
        
        try:
            # Get tool metadata
            tool_meta = get_tool_metadata(tool_name)
            if not tool_meta:
                raise ValueError(f"Unknown tool: {tool_name}")
            
            logger.info(
                "Executing tool",
                tool=tool_name,
                parameters=suggestion.parameters
            )
            
            # Get executor function
            executor = self._tool_executors.get(tool_name)
            if not executor:
                raise ValueError(f"No executor for tool: {tool_name}")
            
            # Execute with timeout
            raw_result = await asyncio.wait_for(
                executor(suggestion.parameters, context),
                timeout=self.timeout_seconds
            )
            
            # Format result
            formatted_result = await self._format_result(
                tool_name=tool_name,
                raw_result=raw_result,
                tool_meta=tool_meta
            )
            
            # Calculate duration
            duration = (datetime.now() - start_time).total_seconds()
            
            # Update tool statistics
            tool_meta.increment_execution(success=True, duration=duration)
            
            logger.info(
                "Tool execution successful",
                tool=tool_name,
                duration=duration
            )
            
            return ToolResult(
                tool_name=tool_name,
                display_name=tool_meta.display_name,
                status="success",
                result=formatted_result,
                duration_seconds=duration,
                timestamp=start_time.isoformat(),
                cost=tool_meta.estimated_cost_per_call
            )
            
        except asyncio.TimeoutError:
            duration = (datetime.now() - start_time).total_seconds()
            tool_meta = get_tool_metadata(tool_name)
            
            logger.error(
                "Tool execution timed out",
                tool=tool_name,
                timeout=self.timeout_seconds
            )
            
            if tool_meta:
                tool_meta.increment_execution(success=False, duration=duration)
            
            return ToolResult(
                tool_name=tool_name,
                display_name=tool_meta.display_name if tool_meta else tool_name,
                status="timeout",
                error=f"Tool execution timed out after {self.timeout_seconds}s",
                duration_seconds=duration,
                timestamp=start_time.isoformat()
            )
            
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            tool_meta = get_tool_metadata(tool_name)
            
            logger.error(
                "Tool execution failed",
                tool=tool_name,
                error=str(e),
                exc_info=True
            )
            
            if tool_meta:
                tool_meta.increment_execution(success=False, duration=duration)
            
            return ToolResult(
                tool_name=tool_name,
                display_name=tool_meta.display_name if tool_meta else tool_name,
                status="error",
                error=str(e),
                duration_seconds=duration,
                timestamp=start_time.isoformat()
            )
    
    # ========================================================================
    # TOOL EXECUTORS (one per tool)
    # ========================================================================
    
    async def _execute_web_search(
        self,
        parameters: Dict[str, Any],
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Execute web search using Brave Search API"""
        
        # TODO: Implement actual Brave Search API call
        # For now, return mock data
        
        query = parameters.get("query", "")
        max_results = parameters.get("max_results", 5)
        
        logger.info("Web search", query=query, max_results=max_results)
        
        # Mock results
        return {
            "query": query,
            "results": [
                {
                    "title": f"FDA Guidelines Update {i+1}",
                    "url": f"https://fda.gov/guidelines-{i+1}",
                    "snippet": f"Latest FDA guidelines for medical devices... Result {i+1}",
                    "domain": "fda.gov"
                }
                for i in range(min(max_results, 5))
            ],
            "total": max_results
        }
    
    async def _execute_pubmed_search(
        self,
        parameters: Dict[str, Any],
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Execute PubMed search"""
        
        # TODO: Implement actual PubMed API call
        
        query = parameters.get("query", "")
        max_results = parameters.get("max_results", 10)
        
        logger.info("PubMed search", query=query, max_results=max_results)
        
        # Mock results
        return {
            "query": query,
            "articles": [
                {
                    "title": f"Clinical Study on {query} - {i+1}",
                    "authors": ["Smith J", "Jones A"],
                    "journal": "Nature Medicine",
                    "year": "2024",
                    "pmid": f"1234567{i}",
                    "abstract": f"This study investigates {query}... Abstract {i+1}",
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/1234567{i}/"
                }
                for i in range(min(max_results, 10))
            ],
            "total": max_results
        }
    
    async def _execute_fda_database(
        self,
        parameters: Dict[str, Any],
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Execute FDA database query"""
        
        # TODO: Implement actual FDA API call
        
        query_type = parameters.get("query_type", "device_510k")
        search_term = parameters.get("search_term", "")
        limit = parameters.get("limit", 10)
        
        logger.info("FDA database", query_type=query_type, search_term=search_term)
        
        # Mock results
        return {
            "query_type": query_type,
            "search_term": search_term,
            "records": [
                {
                    "device_name": f"{search_term} Device {i+1}",
                    "applicant": f"Medical Corp {i+1}",
                    "decision_date": "2024-01-15",
                    "decision": "Substantially Equivalent",
                    "k_number": f"K24000{i+1}"
                }
                for i in range(min(limit, 10))
            ],
            "total": limit
        }
    
    async def _execute_calculator(
        self,
        parameters: Dict[str, Any],
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Execute calculator"""
        
        expression = parameters.get("expression", "")
        
        logger.info("Calculator", expression=expression)
        
        try:
            # Simple eval (CAUTION: In production, use safer expression parser)
            # For now, just handle basic arithmetic
            result = eval(expression, {"__builtins__": {}}, {})
            
            return {
                "expression": expression,
                "result": result,
                "formatted": f"{expression} = {result}"
            }
        except Exception as e:
            raise ValueError(f"Invalid expression: {str(e)}")
    
    # ========================================================================
    # RESULT FORMATTING (tool-specific)
    # ========================================================================
    
    async def _format_result(
        self,
        tool_name: str,
        raw_result: Dict[str, Any],
        tool_meta: ToolMetadata
    ) -> Dict[str, Any]:
        """
        Format tool result for user-friendly display
        
        Each tool type has specific formatting logic
        """
        
        if tool_name == "web_search":
            return self._format_web_search_result(raw_result)
        
        elif tool_name == "pubmed_search":
            return self._format_pubmed_result(raw_result)
        
        elif tool_name == "fda_database":
            return self._format_fda_result(raw_result)
        
        elif tool_name == "calculator":
            return self._format_calculator_result(raw_result)
        
        # Default: return as-is
        return {"type": "generic", "data": raw_result}
    
    def _format_web_search_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Format web search results for display"""
        
        results = result.get("results", [])
        
        return {
            "type": "web_search",
            "query": result.get("query", ""),
            "total_results": result.get("total", 0),
            "results": [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "snippet": r.get("snippet", ""),
                    "domain": r.get("domain", ""),
                    "icon": "external-link"
                }
                for r in results
            ],
            "summary": f"Found {len(results)} web results",
            "display_mode": "list"  # Frontend rendering hint
        }
    
    def _format_pubmed_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Format PubMed results for display"""
        
        articles = result.get("articles", [])
        
        return {
            "type": "pubmed_search",
            "query": result.get("query", ""),
            "total_results": result.get("total", 0),
            "articles": [
                {
                    "title": a.get("title", ""),
                    "authors": a.get("authors", []),
                    "journal": a.get("journal", ""),
                    "year": a.get("year", ""),
                    "pmid": a.get("pmid", ""),
                    "abstract": a.get("abstract", "")[:300] + "...",
                    "url": a.get("url", ""),
                    "icon": "book-medical"
                }
                for a in articles
            ],
            "summary": f"Found {len(articles)} peer-reviewed articles",
            "display_mode": "cards"  # Frontend rendering hint
        }
    
    def _format_fda_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Format FDA database results for display"""
        
        records = result.get("records", [])
        
        return {
            "type": "fda_database",
            "query_type": result.get("query_type", ""),
            "search_term": result.get("search_term", ""),
            "total_results": result.get("total", 0),
            "records": [
                {
                    "device_name": r.get("device_name", ""),
                    "applicant": r.get("applicant", ""),
                    "decision_date": r.get("decision_date", ""),
                    "decision": r.get("decision", ""),
                    "k_number": r.get("k_number", ""),
                    "icon": "shield-check"
                }
                for r in records
            ],
            "summary": f"Found {len(records)} FDA records",
            "display_mode": "table"  # Frontend rendering hint
        }
    
    def _format_calculator_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Format calculator results for display"""
        
        return {
            "type": "calculation",
            "expression": result.get("expression", ""),
            "result": result.get("result", ""),
            "formatted": result.get("formatted", ""),
            "display_mode": "inline"  # Frontend rendering hint
        }


# Convenience function
async def execute_tools(
    suggestions: List[ToolSuggestion],
    context: Optional[Dict[str, Any]] = None
) -> List[ToolResult]:
    """Convenience function to execute tools"""
    service = ToolExecutionService()
    return await service.execute_tools(suggestions, context)

