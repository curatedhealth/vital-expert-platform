"""
Real Web Tools Implementation for VITAL AI Platform
Replaces mock implementations with actual web search and scraping
"""

import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse

from core.config import get_settings
from tools.base_tool import BaseTool, ToolInput, ToolOutput

logger = structlog.get_logger()
settings = get_settings()


class WebSearchTool(BaseTool):
    """
    Real web search using Tavily API.
    
    Golden Rule #5: Tools must provide real functionality, not mocks.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__()
        self.api_key = api_key or settings.tavily_api_key
        self.base_url = "https://api.tavily.com/search"
    
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
        """Execute web search via BaseTool interface."""
        try:
            query = tool_input.data if isinstance(tool_input.data, str) else str(tool_input.data)
            max_results = tool_input.context.get('max_results', 5)
            
            result = await self.search(
                query=query,
                max_results=max_results
            )
            
            return ToolOutput(
                success=True,
                data=result,
                metadata={
                    "query": query,
                    "results_count": len(result.get('results', [])),
                    "tool": self.name
                }
            )
        except Exception as e:
            logger.error(f"Web search execution failed", error=str(e))
            return ToolOutput(
                success=False,
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
            Search results with titles, URLs, content, and scores
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
                    "published_date": item.get("published_date"),
                })
            
            logger.info(
                "✅ Web search completed",
                query=query[:50],
                results_count=len(results)
            )
            
            return {
                "results": results,
                "query": query,
                "total_results": len(results),
                "answer": data.get("answer"),  # Tavily's AI-generated answer
            }
            
        except asyncio.TimeoutError:
            logger.error("Web search timeout", query=query)
            return {
                "results": [],
                "query": query,
                "total_results": 0,
                "error": "Request timeout"
            }
        except Exception as e:
            logger.error("Web search failed", query=query, error=str(e))
            return {
                "results": [],
                "query": query,
                "total_results": 0,
                "error": str(e)
            }


class WebScraperTool(BaseTool):
    """
    Web page scraping and content extraction.
    
    Features:
    - Clean text extraction
    - Link extraction
    - Image extraction
    - Metadata parsing
    - CSS selector support
    """
    
    def __init__(self):
        super().__init__()
        self.timeout = 45
        self.max_content_length = 5 * 1024 * 1024  # 5MB
    
    @property
    def name(self) -> str:
        return "web_scraper"
    
    @property
    def description(self) -> str:
        return (
            "Scrape and extract content from web pages. Use this tool to extract "
            "detailed content, links, images, or specific elements from a URL. "
            "Supports CSS selectors for targeted extraction. Returns cleaned text "
            "content, metadata, and optionally links and images."
        )
    
    @property
    def category(self) -> str:
        return "retrieval"
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """Execute web scraping via BaseTool interface."""
        try:
            url = tool_input.data if isinstance(tool_input.data, str) else tool_input.data.get('url')
            extract_links = tool_input.context.get('extract_links', False)
            extract_images = tool_input.context.get('extract_images', False)
            css_selector = tool_input.context.get('css_selector')
            
            result = await self.scrape(
                url=url,
                extract_links=extract_links,
                extract_images=extract_images,
                css_selector=css_selector
            )
            
            return ToolOutput(
                success=result.get('error') is None,
                data=result,
                error_message=result.get('error'),
                metadata={
                    "url": url,
                    "content_length": len(result.get('content', '')),
                    "tool": self.name
                }
            )
        except Exception as e:
            logger.error(f"Web scraping execution failed", error=str(e))
            return ToolOutput(
                success=False,
                data={},
                error_message=str(e),
                metadata={"tool": self.name}
            )
        
    async def scrape(
        self,
        url: str,
        extract_links: bool = False,
        extract_images: bool = False,
        css_selector: Optional[str] = None,
        wait_for_js: bool = False,
    ) -> Dict[str, Any]:
        """
        Scrape and extract content from a web page.
        
        Args:
            url: URL to scrape
            extract_links: Whether to extract all links
            extract_images: Whether to extract image URLs
            css_selector: Optional CSS selector to target specific content
            wait_for_js: Whether to wait for JavaScript execution
            
        Returns:
            Scraped content with metadata
        """
        try:
            # Validate URL
            parsed_url = urlparse(url)
            if not parsed_url.scheme or not parsed_url.netloc:
                return {
                    "url": url,
                    "error": "Invalid URL format"
                }
            
            # Fetch page
            headers = {
                "User-Agent": "Mozilla/5.0 (compatible; VITAL-AI-Bot/1.0)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=self.timeout),
                    allow_redirects=True
                ) as response:
                    if response.status != 200:
                        return {
                            "url": url,
                            "error": f"HTTP {response.status}"
                        }
                    
                    # Check content type
                    content_type = response.headers.get("Content-Type", "")
                    if "text/html" not in content_type.lower():
                        return {
                            "url": url,
                            "error": f"Unsupported content type: {content_type}"
                        }
                    
                    html = await response.text()
            
            # Parse HTML
            soup = BeautifulSoup(html, "html.parser")
            
            # Extract title
            title = soup.title.string.strip() if soup.title else ""
            
            # Extract metadata
            metadata = self._extract_metadata(soup)
            
            # Extract content
            if css_selector:
                # Use CSS selector to target specific content
                selected = soup.select(css_selector)
                if selected:
                    content = "\n\n".join([elem.get_text(separator=" ", strip=True) for elem in selected])
                else:
                    content = ""
            else:
                # Extract main content (remove scripts, styles, nav, footer)
                for element in soup(["script", "style", "nav", "footer", "header"]):
                    element.decompose()
                
                # Get text from body
                body = soup.body if soup.body else soup
                content = body.get_text(separator=" ", strip=True)
            
            # Clean content
            content = self._clean_text(content)
            
            # Extract links if requested
            links = []
            if extract_links:
                for a_tag in soup.find_all("a", href=True):
                    link = urljoin(url, a_tag["href"])
                    if link not in links:
                        links.append(link)
            
            # Extract images if requested
            images = []
            if extract_images:
                for img_tag in soup.find_all("img", src=True):
                    img_url = urljoin(url, img_tag["src"])
                    if img_url not in images:
                        images.append(img_url)
            
            # Word count
            word_count = len(content.split())
            
            logger.info(
                "✅ Web scraping completed",
                url=url[:50],
                word_count=word_count,
                links_count=len(links),
                images_count=len(images)
            )
            
            return {
                "url": url,
                "title": title,
                "content": content,
                "metadata": metadata,
                "links": links if extract_links else None,
                "images": images if extract_images else None,
                "word_count": word_count,
                "scraped_at": datetime.now().isoformat(),
            }
            
        except asyncio.TimeoutError:
            logger.error("Web scraping timeout", url=url)
            return {
                "url": url,
                "error": "Request timeout"
            }
        except Exception as e:
            logger.error("Web scraping failed", url=url, error=str(e))
            return {
                "url": url,
                "error": str(e)
            }
    
    def _extract_metadata(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract metadata from HTML head"""
        metadata = {}
        
        # Meta tags
        for meta in soup.find_all("meta"):
            name = meta.get("name") or meta.get("property")
            content = meta.get("content")
            if name and content:
                metadata[name] = content
        
        # Canonical URL
        canonical = soup.find("link", rel="canonical")
        if canonical and canonical.get("href"):
            metadata["canonical_url"] = canonical["href"]
        
        return metadata
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove multiple newlines
        text = re.sub(r'\n+', '\n', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text


# ============================================================================
# LangChain Tool Wrappers (for LangGraph integration)
# ============================================================================

async def web_search(
    query: str,
    max_results: int = 5,
    search_depth: str = "basic",
) -> Dict[str, Any]:
    """
    LangChain-compatible web search function.
    
    Use this in LangGraph workflows as a tool.
    """
    tool = WebSearchTool()
    return await tool.search(query, max_results, search_depth)


async def web_scraper(
    url: str,
    extract_links: bool = False,
    extract_images: bool = False,
    css_selector: Optional[str] = None,
) -> Dict[str, Any]:
    """
    LangChain-compatible web scraper function.
    
    Use this in LangGraph workflows as a tool.
    """
    tool = WebScraperTool()
    return await tool.scrape(url, extract_links, extract_images, css_selector)


# ============================================================================
# Tool Metadata (for LangChain StructuredTool)
# ============================================================================

WEB_SEARCH_DESCRIPTION = """
Search the web for real-time information using Tavily API.

Use this when you need:
- Recent news or events
- Current information not in the knowledge base
- Real-time data or statistics
- Product reviews or comparisons
- Latest research or developments

Input:
- query: Your search query (required)
- max_results: Number of results (default: 5, max: 20)
- search_depth: 'basic' or 'advanced' (default: 'basic')

Output:
- results: List of search results with title, URL, content, and score
- answer: AI-generated answer from Tavily (if available)
"""

WEB_SCRAPER_DESCRIPTION = """
Extract and parse content from any web page.

Use this when you need to:
- Read full articles or blog posts
- Extract specific information from a page
- Analyze web page content
- Get structured data from HTML

Input:
- url: The URL to scrape (required)
- extract_links: Whether to extract all links (default: False)
- extract_images: Whether to extract image URLs (default: False)
- css_selector: Optional CSS selector to target specific content

Output:
- title: Page title
- content: Cleaned text content
- metadata: Page metadata (description, keywords, etc.)
- links: List of links (if extract_links=True)
- images: List of image URLs (if extract_images=True)
- word_count: Total word count
"""
