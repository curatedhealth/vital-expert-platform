"""
L5 PubMed Tool Agent - Level 5 Scientific Literature Search

A specialized L5 (Tool/Intern level) agent that:
- Searches PubMed/NCBI for scientific literature
- Uses free NCBI E-utilities API (no API key required for basic use)
- Returns formatted findings with proper academic citations
- Can be invoked as fallback when RAG returns empty results
- Implements retry logic with tenacity for resilience

PubMed is a free resource maintained by the National Center for Biotechnology
Information (NCBI) at the National Library of Medicine (NLM).

API Documentation: https://www.ncbi.nlm.nih.gov/books/NBK25501/

Architecture: See MODE_1_MODE_3_L4_L5_ARCHITECTURE.md

Created: 2025-12-03
"""

from typing import List, Dict, Any, Optional
import asyncio
import time
import structlog
import os
import httpx
import xml.etree.ElementTree as ET
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


# Retry configuration for NCBI API calls
PUBMED_RETRY_CONFIG = {
    "stop": stop_after_attempt(3),  # Max 3 attempts
    "wait": wait_exponential(multiplier=0.5, min=0.5, max=2),  # 0.5s, 1s, 2s backoff
    "retry": retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException, httpx.ConnectError)),
    "before_sleep": before_sleep_log(logger, log_level=20)  # INFO level
}


class L5PubMedToolAgent:
    """
    Level 5 PubMed Tool Agent - Scientific literature search utility.

    YOU ARE: An L5 Tool agent specialized in searching PubMed for
    peer-reviewed scientific and medical literature.

    YOU DO:
    1. Search PubMed via NCBI E-utilities API (ESearch + ESummary)
    2. Return top N findings (configurable, default 5) with proper citations
    3. Format citations in academic style (Authors, Title, Journal, Year)
    4. Score findings by recency and relevance
    5. Respect timeout limits
    6. Format output for parent agent consumption

    YOU NEVER:
    1. Return more findings than max_findings config
    2. Exceed timeout_ms - fail gracefully instead
    3. Return raw API responses - always format with citations
    4. Skip proper academic citation formatting
    """

    TOOL_TYPE = "pubmed"
    LEVEL = 5
    SENIORITY = "intern"

    # NCBI E-utilities base URLs
    ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    ESUMMARY_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"

    def __init__(
        self,
        ncbi_api_key: Optional[str] = None,
        email: Optional[str] = None
    ):
        """
        Initialize L5 PubMed Tool Agent.

        Args:
            ncbi_api_key: Optional NCBI API key for higher rate limits
                         (default 3 requests/sec without, 10/sec with key)
            email: Optional email for NCBI tracking (recommended by NCBI)
        """
        self.ncbi_api_key = ncbi_api_key or os.getenv("NCBI_API_KEY")
        self.email = email or os.getenv("NCBI_EMAIL", "vital@example.com")
        self.execution_count = 0
        self.total_execution_time_ms = 0

        logger.info(
            "l5_pubmed_tool.initialized",
            tool_type=self.TOOL_TYPE,
            level=self.LEVEL,
            has_api_key=bool(self.ncbi_api_key)
        )

    async def execute(
        self,
        query: str,
        config: L5ToolConfig,
        tenant_id: str,
        parent_agent_id: Optional[str] = None
    ) -> L5ToolResult:
        """
        Execute PubMed search and return formatted findings.

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
            "l5_pubmed_tool.execute_start",
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
                "l5_pubmed_tool.execute_success",
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
                "l5_pubmed_tool.timeout",
                timeout_ms=config.timeout_ms,
                actual_time_ms=execution_time_ms,
                parent_agent=parent_agent_id
            )

            return L5ToolResult(
                tool_type=self.TOOL_TYPE,
                success=False,
                findings=[],
                execution_time_ms=execution_time_ms,
                error=f"PubMed search timed out after {config.timeout_ms}ms"
            )

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)

            logger.error(
                "l5_pubmed_tool.execute_error",
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
                error=f"PubMed search failed: {str(e)}"
            )

    async def _search_and_format(
        self,
        query: str,
        config: L5ToolConfig
    ) -> List[L5Finding]:
        """
        Execute PubMed search and format results as L5Finding objects.

        Uses 2-step process:
        1. ESearch: Get PMIDs matching query
        2. ESummary: Get article details for PMIDs

        Args:
            query: Search query
            config: Tool configuration

        Returns:
            List of formatted L5Finding objects
        """
        # Step 1: Search for PMIDs
        pmids = await self._search_pmids(query, config.max_findings)

        if not pmids:
            logger.info("l5_pubmed_tool.no_pmids_found", query=query[:50])
            return []

        # Step 2: Get article summaries
        articles = await self._get_article_summaries(pmids)

        # Format as L5Finding objects
        findings: List[L5Finding] = []
        for article in articles[:config.max_findings]:
            finding = self._format_article_to_finding(article)
            findings.append(finding)

        # Sort by relevance (newer articles ranked higher)
        findings.sort(key=lambda f: f.relevance_score, reverse=True)

        return findings

    @retry(**PUBMED_RETRY_CONFIG)
    async def _search_pmids(
        self,
        query: str,
        max_results: int
    ) -> List[str]:
        """
        Search PubMed and return PMIDs.

        Uses ESearch API to get article IDs matching the query.
        """
        params = {
            "db": "pubmed",
            "term": query,
            "retmax": max_results,
            "retmode": "json",
            "sort": "relevance"
        }

        # Add optional API key and email
        if self.ncbi_api_key:
            params["api_key"] = self.ncbi_api_key
        if self.email:
            params["email"] = self.email

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(self.ESEARCH_URL, params=params)
            response.raise_for_status()
            data = response.json()

            # Extract PMIDs from response
            id_list = data.get("esearchresult", {}).get("idlist", [])

            logger.debug(
                "l5_pubmed_tool.esearch_success",
                pmids_found=len(id_list),
                query=query[:50]
            )

            return id_list

    @retry(**PUBMED_RETRY_CONFIG)
    async def _get_article_summaries(
        self,
        pmids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Get article summaries for given PMIDs.

        Uses ESummary API to get article metadata.
        """
        if not pmids:
            return []

        params = {
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "json"
        }

        # Add optional API key and email
        if self.ncbi_api_key:
            params["api_key"] = self.ncbi_api_key
        if self.email:
            params["email"] = self.email

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(self.ESUMMARY_URL, params=params)
            response.raise_for_status()
            data = response.json()

            # Extract articles from response
            result = data.get("result", {})
            articles = []

            for pmid in pmids:
                if pmid in result and pmid != "uids":
                    articles.append(result[pmid])

            logger.debug(
                "l5_pubmed_tool.esummary_success",
                articles_found=len(articles)
            )

            return articles

    def _format_article_to_finding(self, article: Dict[str, Any]) -> L5Finding:
        """
        Format a PubMed article into a standardized L5Finding.

        Args:
            article: Article data from ESummary

        Returns:
            Formatted L5Finding with academic citation
        """
        # Extract article fields
        pmid = article.get("uid", "")
        title = article.get("title", "Untitled")

        # Get authors (take first 3 + "et al" if more)
        authors_list = article.get("authors", [])
        if len(authors_list) > 3:
            authors = ", ".join([a.get("name", "") for a in authors_list[:3]]) + " et al."
        elif authors_list:
            authors = ", ".join([a.get("name", "") for a in authors_list])
        else:
            authors = "Unknown"

        # Get journal info
        journal = article.get("fulljournalname", article.get("source", "Unknown Journal"))
        pub_date = article.get("pubdate", "")
        year = pub_date.split()[0] if pub_date else "N/D"

        # Get abstract if available (ESummary doesn't include full abstract)
        abstract = article.get("description", "")
        if not abstract:
            # Create a brief content summary
            abstract = f"Published in {journal}. {pub_date}."

        # Build URL
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

        # Format academic citation
        citation = f'{authors}. "{title}" {journal}. {year}. PMID: {pmid}'

        # Calculate relevance score based on recency
        try:
            year_int = int(year)
            current_year = 2025
            recency_score = max(0.5, 1.0 - (current_year - year_int) * 0.05)
        except (ValueError, TypeError):
            recency_score = 0.7

        # Truncate title/content for context efficiency
        max_title_length = 200
        max_content_length = 400

        if len(title) > max_title_length:
            title = title[:max_title_length] + "..."

        content = abstract
        if len(content) > max_content_length:
            content = content[:max_content_length] + "..."

        return L5Finding(
            source_tool=self.TOOL_TYPE,
            title=title,
            content=content,
            relevance_score=float(recency_score),
            citation=citation,
            source_url=url,
            source_type="scientific",
            metadata={
                'pmid': pmid,
                'authors': authors,
                'journal': journal,
                'year': year,
                'pub_date': pub_date,
                'is_peer_reviewed': True
            }
        )

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
            'has_api_key': bool(self.ncbi_api_key)
        }


# =============================================================================
# Factory Function
# =============================================================================

_l5_pubmed_tool: Optional[L5PubMedToolAgent] = None


def get_l5_pubmed_tool() -> L5PubMedToolAgent:
    """Get or create L5 PubMed Tool Agent singleton."""
    global _l5_pubmed_tool
    if _l5_pubmed_tool is None:
        _l5_pubmed_tool = L5PubMedToolAgent()
    return _l5_pubmed_tool


def create_l5_pubmed_config(
    max_findings: int = 5,
    timeout_ms: int = 3000,
    mode1: bool = True
) -> L5ToolConfig:
    """
    Create L5ToolConfig for PubMed search.

    Args:
        max_findings: Maximum number of findings to return
        timeout_ms: Timeout in milliseconds
        mode1: Whether this is Mode 1 (applies speed limits)

    Returns:
        L5ToolConfig with resolved values
    """
    # Mode 1 cap: max 3 findings for speed
    if mode1:
        max_findings = min(max_findings, 3)
        timeout_ms = min(timeout_ms, 2000)  # 2 second limit for Mode 1

    return L5ToolConfig(
        tool_type="pubmed",
        enabled=True,
        max_findings=max_findings,
        timeout_ms=timeout_ms,
        namespaces=None  # PubMed doesn't use namespaces
    )
