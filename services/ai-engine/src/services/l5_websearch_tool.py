"""
L5 WebSearch Tool Agent - Level 5 Live Web Search

A specialized L5 (Tool/Intern level) agent that:
- Performs web searches for current information
- Returns top N formatted findings with citations
- Respects configurable timeout
- Can be invoked in parallel with other L5 tools by L4 Context Engineer
- Implements retry logic with tenacity for resilience

Configuration Sources:
- Agent metadata: agents.metadata.l5_config
- User input: ResponsePreferences
- Request: max_findings, timeout_ms overrides

Architecture: See MODE_1_MODE_3_L4_L5_ARCHITECTURE.md

Created: 2025-12-02
Updated: 2025-12-02 - Added tenacity retry logic for API resilience
"""

from typing import List, Dict, Any, Optional
import asyncio
import time
import structlog
import os
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    RetryError
)

from models.l4_l5_config import L5Finding, L5ToolResult, L5ToolConfig

logger = structlog.get_logger()


# Retry configuration for external API calls
RETRY_CONFIG = {
    "stop": stop_after_attempt(3),  # Max 3 attempts
    "wait": wait_exponential(multiplier=0.5, min=0.5, max=2),  # 0.5s, 1s, 2s backoff
    "retry": retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException, httpx.ConnectError)),
    "before_sleep": before_sleep_log(logger, log_level=20)  # INFO level
}


class L5WebSearchToolAgent:
    """
    Level 5 WebSearch Tool Agent - Single-function web search utility.

    YOU ARE: An L5 Tool agent specialized in searching the live web
    for current information relevant to healthcare and pharmaceutical queries.

    YOU DO:
    1. Execute web searches via search API (Tavily, Serper, or similar)
    2. Return top N findings (configurable, default 5) with formatted citations
    3. Filter results by domain relevance (healthcare, regulatory, scientific)
    4. Score findings by relevance
    5. Respect timeout limits
    6. Format output for parent agent consumption

    YOU NEVER:
    1. Return more findings than max_findings config
    2. Exceed timeout_ms - fail gracefully instead
    3. Return raw search results - always format with citations
    4. Include non-authoritative sources in regulatory queries
    """

    TOOL_TYPE = "websearch"
    LEVEL = 5
    SENIORITY = "intern"

    # Authoritative healthcare domains for filtering
    AUTHORITATIVE_DOMAINS = [
        "fda.gov", "ema.europa.eu", "who.int",
        "nih.gov", "cdc.gov", "ncbi.nlm.nih.gov",
        "clinicaltrials.gov", "pubmed.ncbi.nlm.nih.gov",
        "accessdata.fda.gov", "ich.org", "ispe.org"
    ]

    def __init__(
        self,
        search_api_key: Optional[str] = None,
        search_api_type: str = "tavily"
    ):
        """
        Initialize L5 WebSearch Tool Agent.

        Args:
            search_api_key: API key for search service (default from env)
            search_api_type: Search API to use (tavily, serper, google)
        """
        self.search_api_key = search_api_key or os.getenv("TAVILY_API_KEY") or os.getenv("SERPER_API_KEY")
        self.search_api_type = search_api_type
        self.execution_count = 0
        self.total_execution_time_ms = 0

        logger.info(
            "l5_websearch_tool.initialized",
            tool_type=self.TOOL_TYPE,
            level=self.LEVEL,
            api_type=search_api_type,
            has_api_key=bool(self.search_api_key)
        )

    async def execute(
        self,
        query: str,
        config: L5ToolConfig,
        tenant_id: str,
        parent_agent_id: Optional[str] = None
    ) -> L5ToolResult:
        """
        Execute web search and return formatted findings.

        Args:
            query: Search query from parent agent
            config: L5 tool configuration (from agent metadata + user input)
            tenant_id: Tenant ID for logging
            parent_agent_id: Parent agent ID for logging

        Returns:
            L5ToolResult with formatted findings and execution metadata
        """
        start_time = time.time()
        self.execution_count += 1

        logger.info(
            "l5_websearch_tool.execute_start",
            query=query[:100],
            max_findings=config.max_findings,
            timeout_ms=config.timeout_ms,
            parent_agent=parent_agent_id
        )

        try:
            # Execute with timeout
            findings = await asyncio.wait_for(
                self._search_and_format(query, config),
                timeout=config.timeout_ms / 1000.0
            )

            execution_time_ms = int((time.time() - start_time) * 1000)
            self.total_execution_time_ms += execution_time_ms

            logger.info(
                "l5_websearch_tool.execute_success",
                num_findings=len(findings),
                execution_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            return L5ToolResult(
                tool_type=self.TOOL_TYPE,
                success=True,
                findings=findings,
                execution_time_ms=execution_time_ms
            )

        except asyncio.TimeoutError:
            execution_time_ms = int((time.time() - start_time) * 1000)

            logger.warning(
                "l5_websearch_tool.timeout",
                timeout_ms=config.timeout_ms,
                actual_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            return L5ToolResult(
                tool_type=self.TOOL_TYPE,
                success=False,
                findings=[],
                execution_time_ms=execution_time_ms,
                error=f"Web search timed out after {config.timeout_ms}ms"
            )

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)

            logger.error(
                "l5_websearch_tool.execute_error",
                error=str(e),
                error_type=type(e).__name__,
                execution_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            return L5ToolResult(
                tool_type=self.TOOL_TYPE,
                success=False,
                findings=[],
                execution_time_ms=execution_time_ms,
                error=f"Web search failed: {str(e)}"
            )

    async def _search_and_format(
        self,
        query: str,
        config: L5ToolConfig
    ) -> List[L5Finding]:
        """
        Execute web search and format results as L5Finding objects.

        Args:
            query: Search query
            config: Tool configuration

        Returns:
            List of formatted L5Finding objects
        """
        # Check if API key is available
        if not self.search_api_key:
            logger.warning("l5_websearch_tool.no_api_key")
            return self._create_mock_findings(query, config.max_findings)

        # Execute search based on API type
        if self.search_api_type == "tavily":
            raw_results = await self._search_tavily(query, config.max_findings)
        elif self.search_api_type == "serper":
            raw_results = await self._search_serper(query, config.max_findings)
        else:
            raw_results = await self._search_tavily(query, config.max_findings)

        # Format as L5Finding objects
        findings: List[L5Finding] = []
        for result in raw_results[:config.max_findings]:
            finding = self._format_result_to_finding(result)
            findings.append(finding)

        # Sort by relevance score
        findings.sort(key=lambda f: f.relevance_score, reverse=True)

        return findings

    async def _search_tavily(
        self,
        query: str,
        max_results: int
    ) -> List[Dict[str, Any]]:
        """
        Execute search via Tavily API with retry logic.

        Uses tenacity for automatic retries with exponential backoff
        on transient failures (timeouts, connection errors, 5xx responses).

        Args:
            query: Search query
            max_results: Maximum results to return

        Returns:
            List of raw search results
        """
        try:
            return await self._search_tavily_with_retry(query, max_results)
        except RetryError as e:
            logger.error(
                "l5_websearch_tool.tavily_retry_exhausted",
                error=str(e.last_attempt.exception()),
                attempts=e.last_attempt.attempt_number
            )
            return []
        except Exception as e:
            logger.error("l5_websearch_tool.tavily_error", error=str(e))
            return []

    @retry(**RETRY_CONFIG)
    async def _search_tavily_with_retry(
        self,
        query: str,
        max_results: int
    ) -> List[Dict[str, Any]]:
        """
        Internal method with retry decorator for Tavily API calls.

        Retries up to 3 times with exponential backoff (0.5s, 1s, 2s).
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": self.search_api_key,
                    "query": query,
                    "search_depth": "advanced",
                    "include_domains": self.AUTHORITATIVE_DOMAINS,
                    "max_results": max_results,
                    "include_answer": False,
                    "include_raw_content": False
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])

    async def _search_serper(
        self,
        query: str,
        max_results: int
    ) -> List[Dict[str, Any]]:
        """
        Execute search via Serper API with retry logic.

        Uses tenacity for automatic retries with exponential backoff
        on transient failures (timeouts, connection errors, 5xx responses).

        Args:
            query: Search query
            max_results: Maximum results to return

        Returns:
            List of raw search results
        """
        try:
            return await self._search_serper_with_retry(query, max_results)
        except RetryError as e:
            logger.error(
                "l5_websearch_tool.serper_retry_exhausted",
                error=str(e.last_attempt.exception()),
                attempts=e.last_attempt.attempt_number
            )
            return []
        except Exception as e:
            logger.error("l5_websearch_tool.serper_error", error=str(e))
            return []

    @retry(**RETRY_CONFIG)
    async def _search_serper_with_retry(
        self,
        query: str,
        max_results: int
    ) -> List[Dict[str, Any]]:
        """
        Internal method with retry decorator for Serper API calls.

        Retries up to 3 times with exponential backoff (0.5s, 1s, 2s).
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": self.search_api_key},
                json={
                    "q": query,
                    "num": max_results
                }
            )
            response.raise_for_status()
            data = response.json()

            # Transform Serper format to common format
            results = []
            for item in data.get("organic", [])[:max_results]:
                results.append({
                    "title": item.get("title"),
                    "url": item.get("link"),
                    "content": item.get("snippet"),
                    "score": item.get("position", 10) / 10.0  # Convert position to score
                })
            return results

    def _format_result_to_finding(self, result: Dict[str, Any]) -> L5Finding:
        """
        Format a search result into a standardized L5Finding.

        Args:
            result: Raw search result

        Returns:
            Formatted L5Finding with citation
        """
        title = result.get('title', 'Untitled')
        content = result.get('content', result.get('snippet', ''))
        url = result.get('url', result.get('link'))
        score = result.get('score', 0.5)

        # Truncate content for context efficiency
        max_content_length = 500
        if len(content) > max_content_length:
            content = content[:max_content_length] + "..."

        # Determine source type from URL
        source_type = self._determine_source_type(url)

        # Format citation
        citation = self._format_citation(title, url)

        # Boost score for authoritative domains
        if url and any(domain in url for domain in self.AUTHORITATIVE_DOMAINS):
            score = min(score + 0.2, 1.0)

        return L5Finding(
            source_tool=self.TOOL_TYPE,
            title=title,
            content=content,
            relevance_score=float(score),
            citation=citation,
            source_url=url,
            source_type=source_type,
            metadata={
                'domain': self._extract_domain(url) if url else None,
                'is_authoritative': url and any(d in url for d in self.AUTHORITATIVE_DOMAINS)
            }
        )

    def _format_citation(self, title: str, url: Optional[str]) -> str:
        """Format a citation string."""
        domain = self._extract_domain(url) if url else "Web"
        return f'"{title}" [{domain}] <{url}>' if url else f'"{title}" [{domain}]'

    def _extract_domain(self, url: Optional[str]) -> str:
        """Extract domain from URL."""
        if not url:
            return "unknown"
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc
        except Exception:
            return "unknown"

    def _determine_source_type(self, url: Optional[str]) -> str:
        """Determine source type from URL."""
        if not url:
            return "web"
        url_lower = url.lower()
        if "fda.gov" in url_lower or "ema.europa.eu" in url_lower:
            return "regulatory"
        elif "pubmed" in url_lower or "ncbi" in url_lower:
            return "scientific"
        elif "clinicaltrials.gov" in url_lower:
            return "clinical_trial"
        elif "who.int" in url_lower or "cdc.gov" in url_lower:
            return "health_authority"
        return "web"

    def _create_mock_findings(self, query: str, max_findings: int) -> List[L5Finding]:
        """
        Create mock findings when no API key is available.
        For development/testing purposes only.
        """
        logger.warning("l5_websearch_tool.using_mock_data")
        return [
            L5Finding(
                source_tool=self.TOOL_TYPE,
                title=f"Mock result for: {query[:50]}",
                content="This is a mock result. Configure TAVILY_API_KEY or SERPER_API_KEY for live search.",
                relevance_score=0.5,
                citation="[Mock Data - No API Key]",
                source_url=None,
                source_type="mock",
                metadata={"is_mock": True}
            )
        ]

    def get_stats(self) -> Dict[str, Any]:
        """Get tool execution statistics."""
        return {
            'tool_type': self.TOOL_TYPE,
            'level': self.LEVEL,
            'execution_count': self.execution_count,
            'total_execution_time_ms': self.total_execution_time_ms,
            'avg_execution_time_ms': (
                self.total_execution_time_ms / self.execution_count
                if self.execution_count > 0 else 0
            ),
            'api_type': self.search_api_type,
            'has_api_key': bool(self.search_api_key)
        }


# =============================================================================
# Factory Function
# =============================================================================

_l5_websearch_tool: Optional[L5WebSearchToolAgent] = None


def get_l5_websearch_tool() -> L5WebSearchToolAgent:
    """Get or create L5 WebSearch Tool Agent singleton."""
    global _l5_websearch_tool
    if _l5_websearch_tool is None:
        _l5_websearch_tool = L5WebSearchToolAgent()
    return _l5_websearch_tool


def create_l5_websearch_config_from_agent(
    agent_metadata: Dict[str, Any],
    mode1: bool = True
) -> L5ToolConfig:
    """
    Create L5ToolConfig for WebSearch from agent metadata.

    Args:
        agent_metadata: Agent's metadata JSONB field
        mode1: Whether this is Mode 1 (applies speed limits)

    Returns:
        L5ToolConfig with resolved values
    """
    l5_config = agent_metadata.get('l5_config', {})

    # Get max_findings from agent config
    max_findings = l5_config.get('max_findings_per_tool', 5)

    # Mode 1 cap: max 3 findings for speed
    if mode1:
        max_findings = min(max_findings, 3)

    # Get timeout from agent config (Mode 1 override: 500ms)
    timeout_ms = l5_config.get('timeout_ms', 3000)
    if mode1:
        timeout_ms = 500  # Hard limit for chat responsiveness

    return L5ToolConfig(
        tool_type="websearch",
        enabled=l5_config.get('websearch_enabled', True),
        max_findings=max_findings,
        timeout_ms=timeout_ms,
        domains=None  # WebSearch doesn't use namespaces
    )
