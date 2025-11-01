"""
Web Tools - Internet Research Capabilities

Provides web search and scraping tools for the autonomous agent system.

Tools:
- WebSearchTool: Search the internet (Google/Bing/Brave)
- WebScrapeTool: Download and extract content from URLs
- WebResearchTool: Combined search + scrape workflow

Features:
- Multiple search engine support
- Content extraction and cleaning
- Link discovery
- Rate limiting
- Cost tracking

Usage:
    >>> from tools.web_tools import WebSearchTool, WebScrapeTool
    >>> 
    >>> search_tool = WebSearchTool(api_key="...")
    >>> scrape_tool = WebScrapeTool()
    >>> 
    >>> # Search
    >>> results = await search_tool.execute(ToolInput(
    ...     data="FDA IND requirements 2025"
    ... ))
    >>> 
    >>> # Scrape
    >>> content = await scrape_tool.execute(ToolInput(
    ...     data="https://www.fda.gov/drugs/ind-application"
    ... ))
"""

from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
import structlog
import asyncio
from urllib.parse import urlparse, urljoin

from tools.base_tool import BaseTool, ToolInput, ToolOutput
from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


# ============================================================================
# WEB SEARCH TOOL
# ============================================================================

class WebSearchTool(BaseTool):
    """
    Search the internet for current information, news, and public data.
    
    Use this tool for:
    - Recent developments and news
    - Competitor information
    - External validation
    - Research papers and publications
    - Regulatory updates from public sources
    - Industry trends and analysis
    """
    
    def __init__(self, api_key: Optional[str] = None, search_engine: str = "brave"):
        """
        Initialize web search tool.
        
        Args:
            api_key: API key for search service (None = use from settings)
            search_engine: Search engine to use ("brave", "serp", "bing")
        """
        super().__init__()
        self.api_key = api_key or getattr(settings, 'brave_search_api_key', None)
        self.search_engine = search_engine
        self.client = httpx.AsyncClient(timeout=30.0)
        
        logger.info(f"WebSearchTool initialized with {search_engine} engine")
    
    @property
    def name(self) -> str:
        return "web_search"
    
    @property
    def description(self) -> str:
        return (
            "Search the internet for current information, news, research papers, and public data. "
            "Use for recent developments, competitor information, external validation, "
            "regulatory updates from public sources, and industry trends. "
            "Returns top search results with titles, URLs, and snippets."
        )
    
    @property
    def category(self) -> str:
        return "retrieval"
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute web search.
        
        Args:
            tool_input: Tool input containing:
                - data: Search query string or dict with 'query' and 'num_results'
                
        Returns:
            ToolOutput with search results
        """
        try:
            # Extract query
            if isinstance(tool_input.data, dict):
                query = tool_input.data.get('query', str(tool_input.data))
                num_results = tool_input.data.get('num_results', 10)
            else:
                query = str(tool_input.data)
                num_results = 10
            
            logger.info(
                "Executing web search",
                query=query[:100],
                engine=self.search_engine,
                num_results=num_results
            )
            
            # Execute search based on engine
            if self.search_engine == "brave":
                results = await self._search_brave(query, num_results)
            elif self.search_engine == "serp":
                results = await self._search_serp(query, num_results)
            elif self.search_engine == "bing":
                results = await self._search_bing(query, num_results)
            else:
                # Fallback to mock results for development
                results = self._mock_search_results(query, num_results)
            
            summary = self._summarize_web_results(results, query)
            
            logger.info(
                "Web search completed",
                num_results=len(results),
                query=query[:50]
            )
            
            return ToolOutput(
                success=True,
                data={
                    'query': query,
                    'num_results': len(results),
                    'results': results,
                    'summary': summary,
                    'search_engine': self.search_engine
                },
                metadata={
                    'search_engine': self.search_engine,
                    'result_urls': [r.get('url') for r in results]
                },
                cost_usd=0.001 * num_results  # Minimal API cost
            )
            
        except Exception as e:
            logger.error(
                "Web search failed",
                query=query[:100] if 'query' in locals() else None,
                error=str(e),
                error_type=type(e).__name__
            )
            
            return ToolOutput(
                success=False,
                data=None,
                error_message=f"Web search failed: {str(e)}",
                metadata={'error_type': type(e).__name__}
            )
    
    async def _search_brave(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """Search using Brave Search API."""
        if not self.api_key:
            logger.warning("Brave Search API key not configured, using mock results")
            return self._mock_search_results(query, num_results)
        
        try:
            url = "https://api.search.brave.com/res/v1/web/search"
            headers = {
                "Accept": "application/json",
                "Accept-Encoding": "gzip",
                "X-Subscription-Token": self.api_key
            }
            params = {
                "q": query,
                "count": num_results
            }
            
            response = await self.client.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            results = []
            
            for item in data.get('web', {}).get('results', []):
                results.append({
                    'title': item.get('title', ''),
                    'url': item.get('url', ''),
                    'snippet': item.get('description', ''),
                    'source': 'brave'
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Brave search failed: {e}")
            return self._mock_search_results(query, num_results)
    
    async def _search_serp(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """Search using SerpAPI."""
        # Placeholder for SerpAPI integration
        logger.warning("SerpAPI not implemented, using mock results")
        return self._mock_search_results(query, num_results)
    
    async def _search_bing(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """Search using Bing Search API."""
        # Placeholder for Bing API integration
        logger.warning("Bing API not implemented, using mock results")
        return self._mock_search_results(query, num_results)
    
    def _mock_search_results(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """Generate mock search results for development."""
        return [
            {
                'title': f'Result {i+1} for: {query}',
                'url': f'https://example.com/result-{i+1}',
                'snippet': f'Mock search result {i+1} containing information about {query}...',
                'source': 'mock'
            }
            for i in range(min(num_results, 5))
        ]
    
    def _summarize_web_results(self, results: List[Dict], query: str) -> str:
        """Create summary of web search results."""
        if not results:
            return f"No web results found for: {query}"
        
        summary_parts = [f"Found {len(results)} web results:"]
        
        for i, result in enumerate(results[:5], 1):
            title = result.get('title', 'No title')
            url = result.get('url', '')
            snippet = result.get('snippet', '')[:100]
            
            summary_parts.append(
                f"{i}. {title}\n   URL: {url}\n   {snippet}..."
            )
        
        if len(results) > 5:
            summary_parts.append(f"   ...and {len(results) - 5} more results")
        
        return "\n".join(summary_parts)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, *args):
        await self.client.aclose()


# ============================================================================
# WEB SCRAPE TOOL
# ============================================================================

class WebScrapeTool(BaseTool):
    """
    Download and extract content from specific web pages.
    
    Use this tool for:
    - Reading full content of a specific URL
    - Extracting structured data from web pages
    - Following up on search results
    - Downloading documentation
    - Parsing HTML content
    """
    
    def __init__(self):
        """Initialize web scrape tool."""
        super().__init__()
        self.client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={
                'User-Agent': 'Mozilla/5.0 (compatible; VITALBot/1.0)'
            }
        )
        logger.info("WebScrapeTool initialized")
    
    @property
    def name(self) -> str:
        return "web_scrape"
    
    @property
    def description(self) -> str:
        return (
            "Download and extract content from a specific web page. "
            "Use when you have a URL and need to read its full content. "
            "Returns extracted text, title, links, and metadata. "
            "Handles HTML parsing and content cleaning automatically."
        )
    
    @property
    def category(self) -> str:
        return "retrieval"
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute web page scraping.
        
        Args:
            tool_input: Tool input containing:
                - data: URL string or dict with 'url' key
                
        Returns:
            ToolOutput with extracted content
        """
        try:
            # Extract URL
            if isinstance(tool_input.data, dict):
                url = tool_input.data.get('url')
                extract_links = tool_input.data.get('extract_links', True)
                max_text_length = tool_input.data.get('max_text_length', 10000)
            else:
                url = str(tool_input.data)
                extract_links = True
                max_text_length = 10000
            
            if not url:
                return ToolOutput(
                    success=False,
                    data=None,
                    error_message="No URL provided"
                )
            
            # Validate URL
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return ToolOutput(
                    success=False,
                    data=None,
                    error_message=f"Invalid URL: {url}"
                )
            
            logger.info("Scraping web page", url=url)
            
            # Download content
            response = await self.client.get(url)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract title
            title = soup.title.string if soup.title else 'No title'
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Extract text
            text = soup.get_text(separator='\n', strip=True)
            
            # Truncate if too long
            if len(text) > max_text_length:
                text = text[:max_text_length] + f"\n\n[Content truncated at {max_text_length} characters]"
            
            # Extract links
            links = []
            if extract_links:
                for a in soup.find_all('a', href=True)[:50]:  # Limit to 50 links
                    href = a.get('href')
                    link_text = a.get_text(strip=True)
                    
                    # Convert relative URLs to absolute
                    absolute_url = urljoin(url, href)
                    
                    links.append({
                        'text': link_text,
                        'url': absolute_url
                    })
            
            # Extract metadata
            meta_description = soup.find('meta', attrs={'name': 'description'})
            description = meta_description.get('content') if meta_description else None
            
            logger.info(
                "Web scraping completed",
                url=url,
                text_length=len(text),
                num_links=len(links)
            )
            
            return ToolOutput(
                success=True,
                data={
                    'url': url,
                    'title': title,
                    'text': text,
                    'description': description,
                    'links': links,
                    'text_length': len(text),
                    'num_links': len(links)
                },
                metadata={
                    'content_type': response.headers.get('content-type', ''),
                    'status_code': response.status_code,
                    'final_url': str(response.url)  # After redirects
                },
                cost_usd=0.0  # No API cost for scraping
            )
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error scraping {url}: {e.response.status_code}")
            return ToolOutput(
                success=False,
                data=None,
                error_message=f"HTTP error {e.response.status_code}: {url}",
                metadata={'status_code': e.response.status_code}
            )
            
        except Exception as e:
            logger.error(
                "Web scraping failed",
                url=url if 'url' in locals() else None,
                error=str(e),
                error_type=type(e).__name__
            )
            
            return ToolOutput(
                success=False,
                data=None,
                error_message=f"Web scraping failed: {str(e)}",
                metadata={'error_type': type(e).__name__}
            )
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, *args):
        await self.client.aclose()


# ============================================================================
# WEB RESEARCH TOOL (Combined Search + Scrape)
# ============================================================================

class WebResearchTool(BaseTool):
    """
    Combined search and scrape workflow for comprehensive research.
    
    Searches the web, then scrapes top results automatically.
    """
    
    def __init__(self, search_tool: WebSearchTool, scrape_tool: WebScrapeTool):
        """
        Initialize web research tool.
        
        Args:
            search_tool: WebSearchTool instance
            scrape_tool: WebScrapeTool instance
        """
        super().__init__()
        self.search_tool = search_tool
        self.scrape_tool = scrape_tool
        logger.info("WebResearchTool initialized")
    
    @property
    def name(self) -> str:
        return "web_research"
    
    @property
    def description(self) -> str:
        return (
            "Comprehensive web research combining search and content extraction. "
            "Searches the web for relevant pages, then automatically scrapes and "
            "extracts content from top results. Use for in-depth research on topics."
        )
    
    @property
    def category(self) -> str:
        return "retrieval"
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute web research (search + scrape).
        
        Args:
            tool_input: Tool input containing:
                - data: Research query or dict with 'query' and 'num_pages_to_scrape'
                
        Returns:
            ToolOutput with search results and scraped content
        """
        try:
            # Extract query
            if isinstance(tool_input.data, dict):
                query = tool_input.data.get('query', str(tool_input.data))
                num_pages = tool_input.data.get('num_pages_to_scrape', 3)
            else:
                query = str(tool_input.data)
                num_pages = 3
            
            logger.info(
                "Starting web research",
                query=query[:100],
                num_pages_to_scrape=num_pages
            )
            
            # Step 1: Search
            search_result = await self.search_tool.execute(ToolInput(
                data={'query': query, 'num_results': 10},
                context=tool_input.context
            ))
            
            if not search_result.success:
                return ToolOutput(
                    success=False,
                    data=None,
                    error_message=f"Search failed: {search_result.error_message}"
                )
            
            search_results = search_result.data.get('results', [])
            
            # Step 2: Scrape top results
            scraped_content = []
            for i, result in enumerate(search_results[:num_pages]):
                url = result.get('url')
                if not url:
                    continue
                
                logger.info(f"Scraping page {i+1}/{num_pages}", url=url)
                
                scrape_result = await self.scrape_tool.execute(ToolInput(
                    data={'url': url, 'max_text_length': 5000},
                    context=tool_input.context
                ))
                
                if scrape_result.success:
                    scraped_content.append({
                        'url': url,
                        'title': scrape_result.data.get('title'),
                        'content': scrape_result.data.get('text', '')[:2000],  # Truncate for token limits
                        'source_rank': i + 1
                    })
                
                # Rate limiting
                await asyncio.sleep(0.5)
            
            # Combine results
            summary = self._summarize_research(search_results, scraped_content, query)
            
            logger.info(
                "Web research completed",
                pages_scraped=len(scraped_content),
                total_search_results=len(search_results)
            )
            
            return ToolOutput(
                success=True,
                data={
                    'query': query,
                    'search_results': search_results,
                    'scraped_pages': scraped_content,
                    'summary': summary,
                    'num_search_results': len(search_results),
                    'num_scraped_pages': len(scraped_content)
                },
                metadata={
                    'scraped_urls': [p['url'] for p in scraped_content]
                },
                cost_usd=search_result.cost_usd  # Search cost only
            )
            
        except Exception as e:
            logger.error("Web research failed", error=str(e))
            return ToolOutput(
                success=False,
                data=None,
                error_message=f"Web research failed: {str(e)}"
            )
    
    def _summarize_research(
        self,
        search_results: List[Dict],
        scraped_content: List[Dict],
        query: str
    ) -> str:
        """Summarize research findings."""
        summary = [f"Web research for: {query}\n"]
        summary.append(f"Found {len(search_results)} search results, scraped {len(scraped_content)} pages.\n")
        
        if scraped_content:
            summary.append("Key findings:")
            for i, page in enumerate(scraped_content, 1):
                title = page.get('title', 'Untitled')
                content_preview = page.get('content', '')[:150]
                summary.append(f"{i}. {title}\n   {content_preview}...")
        
        return "\n".join(summary)

