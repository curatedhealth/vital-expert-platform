#!/usr/bin/env python3
"""
Enhanced Web Scraper with PDF Support & JavaScript Rendering
==============================================================

Features:
- PDF parsing (PyPDF2, pdfplumber)
- Better User-Agent headers
- Retry logic with exponential backoff
- Optional Playwright for JavaScript rendering
- Content type detection
- File download support

Author: VITAL AI Platform
Date: 2025-11-05
Version: 3.0.0
"""

import asyncio
import hashlib
import io
import logging
import mimetypes
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse, urljoin

import aiohttp
import backoff
from bs4 import BeautifulSoup, NavigableString, Tag

# PDF Processing
try:
    import PyPDF2
    import pdfplumber
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    logging.warning("⚠️  PDF libraries not installed. Install with: pip install PyPDF2 pdfplumber")

# Playwright (optional)
try:
    from playwright.async_api import async_playwright, Browser, Page
    PLAYWRIGHT_SUPPORT = True
except ImportError:
    PLAYWRIGHT_SUPPORT = False

logger = logging.getLogger(__name__)


class EnhancedWebScraper:
    """
    Advanced web scraper with PDF support, JavaScript rendering, and retry logic.
    """
    
    # Realistic User-Agent strings
    USER_AGENTS = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    ]
    
    def __init__(
        self,
        timeout: int = 60,
        max_retries: int = 3,
        use_playwright: bool = False,
        user_agent_rotation: bool = True
    ):
        self.timeout = timeout
        self.max_retries = max_retries
        self.use_playwright = use_playwright and PLAYWRIGHT_SUPPORT
        self.user_agent_rotation = user_agent_rotation
        self.session: Optional[aiohttp.ClientSession] = None
        self.browser: Optional[Browser] = None
        self.ua_index = 0
    
    async def __aenter__(self) -> 'EnhancedWebScraper':
        """Initialize scraper resources."""
        # Create SSL context that doesn't verify certificates
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # Initialize aiohttp session
        headers = {
            'User-Agent': self._get_user_agent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout),
            headers=headers,
            connector=aiohttp.TCPConnector(ssl=ssl_context)
        )
        
        # Initialize Playwright browser if requested
        if self.use_playwright:
            try:
                logger.info("🎭 Initializing Playwright browser...")
                self.playwright = await async_playwright().start()
                self.browser = await self.playwright.chromium.launch(headless=True)
                logger.info("✅ Playwright browser ready")
            except Exception as e:
                logger.warning(f"⚠️  Failed to initialize Playwright: {e}")
                self.use_playwright = False
        
        return self
    
    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Cleanup resources."""
        if self.session:
            await self.session.close()
        
        if self.browser:
            await self.browser.close()
            await self.playwright.stop()
    
    def _get_user_agent(self) -> str:
        """Get User-Agent string (with rotation if enabled)."""
        if self.user_agent_rotation:
            ua = self.USER_AGENTS[self.ua_index % len(self.USER_AGENTS)]
            self.ua_index += 1
            return ua
        return self.USER_AGENTS[0]
    
    @backoff.on_exception(
        backoff.expo,
        (aiohttp.ClientError, asyncio.TimeoutError),
        max_tries=3,
        max_time=180
    )
    async def _fetch_with_retry(self, url: str) -> bytes:
        """Fetch URL content with exponential backoff retry."""
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        # Special headers for PMC PDFs (they block some automated requests)
        headers = {}
        if 'ncbi.nlm.nih.gov/pmc' in url:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://pubmed.ncbi.nlm.nih.gov/',
                'Connection': 'keep-alive',
            }
        
        async with self.session.get(url, headers=headers) as response:
            if response.status == 403:
                # Try alternative PMC format (remove /pdf/ from URL for HTML version)
                if '/pmc/articles/' in url and '/pdf/' in url:
                    alt_url = url.replace('/pdf/', '/')
                    logger.warning(f"⚠️ PDF blocked, trying HTML version: {alt_url}")
                    async with self.session.get(alt_url, headers=headers) as alt_response:
                        if alt_response.status == 200:
                            # Return HTML content instead
                            html = await alt_response.text()
                            return html.encode('utf-8')
                        alt_response.raise_for_status()
            
            response.raise_for_status()
            return await response.read()
    
    async def scrape_url(
        self,
        url: str,
        css_selector: Optional[str] = None,
        wait_for_js: bool = False
    ) -> Dict[str, Any]:
        """
        Scrape content from a URL with automatic type detection.
        
        Args:
            url: URL to scrape (web page, PDF, or local file)
            css_selector: Optional CSS selector for targeted extraction
            wait_for_js: Whether to wait for JavaScript rendering
        
        Returns:
            Dictionary with scraped content and metadata
        """
        try:
            logger.info(f"🔍 Processing: {url}")
            
            # Auto-enable Playwright for known problematic sites
            use_browser = wait_for_js or self._needs_real_browser(url)
            
            # Detect content type
            content_type = await self._detect_content_type(url)
            logger.info(f"📄 Content type: {content_type}")
            
            # Route to appropriate handler
            if content_type == 'pdf':
                return await self._scrape_pdf(url)
            elif content_type == 'local_file':
                return await self._scrape_local_file(url)
            elif use_browser and self.use_playwright:
                logger.info("🎭 Using Playwright (real browser) for reliable extraction")
                return await self._scrape_with_playwright(url, css_selector)
            else:
                return await self._scrape_html(url, css_selector)
        
        except Exception as e:
            logger.error(f"❌ Error scraping {url}: {str(e)}")
            return {
                'url': url,
                'success': False,
                'error': str(e),
                'content': None,
                'word_count': 0
            }
    
    def _needs_real_browser(self, url: str) -> bool:
        """Check if URL needs real browser to bypass anti-bot protection"""
        # Sites that block automated requests
        protected_sites = [
            'ncbi.nlm.nih.gov',
            'pmc.ncbi.nlm.nih.gov',
            'doaj.org',
            'semanticscholar.org'
        ]
        return any(site in url for site in protected_sites)
    
    async def _detect_content_type(self, url: str) -> str:
        """Detect content type from URL or HEAD request."""
        # Check for local file
        if url.startswith('file://'):
            return 'local_file'
        
        # Check extension
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        if path.endswith('.pdf'):
            return 'pdf'
        elif any(path.endswith(ext) for ext in ['.html', '.htm', '.php', '.asp', '.aspx']):
            return 'html'
        
        # Try HEAD request to check Content-Type
        try:
            if self.session:
                async with self.session.head(url, allow_redirects=True) as response:
                    content_type = response.headers.get('Content-Type', '').lower()
                    if 'pdf' in content_type:
                        return 'pdf'
                    elif 'html' in content_type or 'text' in content_type:
                        return 'html'
        except Exception:
            pass
        
        # Default to HTML
        return 'html'
    
    async def _scrape_html(self, url: str, css_selector: Optional[str] = None) -> Dict[str, Any]:
        """Scrape HTML content with BeautifulSoup."""
        try:
            content_bytes = await self._fetch_with_retry(url)
            html = content_bytes.decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract title
            title_tag = soup.find('title')
            title = title_tag.get_text(strip=True) if title_tag else urlparse(url).path
            
            # Extract main content
            if css_selector:
                content_elem = soup.select_one(css_selector)
                content = content_elem.get_text(strip=True, separator='\n') if content_elem else ""
            else:
                # Remove unwanted elements
                for unwanted in soup(["script", "style", "nav", "footer", "header", "aside", "iframe"]):
                    unwanted.decompose()
                
                # Try to find main content area
                main_content = (
                    soup.find('main') or 
                    soup.find('article') or 
                    soup.find('div', class_=['content', 'main-content', 'post-content']) or
                    soup.find('body')
                )
                content = main_content.get_text(strip=True, separator='\n') if main_content else ""
            
            # Extract meta description
            description = ''
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc and isinstance(meta_desc, Tag):
                content_attr = meta_desc.get('content')
                if content_attr:
                    description = str(content_attr)
            
            # Extract links
            links = [str(a.get('href')) for a in soup.find_all('a', href=True) if isinstance(a, Tag)]
            
            result = {
                'url': url,
                'success': True,
                'content_type': 'html',
                'title': title,
                'content': content,
                'description': description,
                'links': links[:100],  # Limit to first 100 links
                'word_count': len(content.split()),
                'scraped_at': datetime.utcnow().isoformat(),
                'content_hash': hashlib.sha256(content.encode()).hexdigest()
            }
            
            logger.info(f"✅ Scraped HTML: {url} - {result['word_count']} words")
            return result
        
        except Exception as e:
            logger.error(f"❌ HTML scraping failed for {url}: {e}")
            return {'url': url, 'success': False, 'error': str(e), 'content': None}
    
    async def _scrape_pdf(self, url: str) -> Dict[str, Any]:
        """Scrape PDF content."""
        if not PDF_SUPPORT:
            return {
                'url': url,
                'success': False,
                'error': 'PDF libraries not installed',
                'content': None
            }
        
        try:
            # Download PDF
            logger.info(f"📥 Downloading PDF: {url}")
            content_bytes = await self._fetch_with_retry(url)
            
            # Check if we actually got HTML (PMC fallback)
            if content_bytes.startswith(b'<!DOCTYPE') or content_bytes.startswith(b'<html'):
                logger.info("📄 Received HTML instead of PDF, parsing as HTML")
                html = content_bytes.decode('utf-8')
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract PMC article content
                content_div = soup.find('div', class_='pmc-article') or soup.find('article') or soup.find('main')
                if content_div:
                    content = content_div.get_text(separator='\n\n', strip=True)
                else:
                    content = soup.get_text(separator='\n\n', strip=True)
                
                title_tag = soup.find('h1') or soup.find('title')
                title = title_tag.get_text(strip=True) if title_tag else urlparse(url).path.split('/')[-1]
                
                return {
                    'url': url,
                    'success': True,
                    'content': content,
                    'title': title,
                    'word_count': len(content.split()),
                    'source_type': 'html_fallback',
                    'metadata': {
                        'original_format': 'pdf_unavailable',
                        'extracted_from': 'html'
                    }
                }
            
            # Extract text with pdfplumber (better quality)
            text_content = []
            metadata = {}
            
            with pdfplumber.open(io.BytesIO(content_bytes)) as pdf:
                metadata = {
                    'page_count': len(pdf.pages),
                    'pdf_metadata': pdf.metadata or {}
                }
                
                for page_num, page in enumerate(pdf.pages[:100], 1):  # Limit to 100 pages
                    page_text = page.extract_text() or ''
                    if page_text.strip():
                        text_content.append(page_text)
                    
                    if page_num % 10 == 0:
                        logger.info(f"  📄 Processed {page_num} pages...")
            
            content = '\n\n'.join(text_content)
            
            # Extract title from metadata or filename
            title = (
                metadata.get('pdf_metadata', {}).get('Title') or
                metadata.get('pdf_metadata', {}).get('/Title') or
                urlparse(url).path.split('/')[-1]
            )
            
            result = {
                'url': url,
                'success': True,
                'content_type': 'pdf',
                'title': title,
                'content': content,
                'description': f"PDF document with {metadata['page_count']} pages",
                'page_count': metadata['page_count'],
                'word_count': len(content.split()),
                'scraped_at': datetime.utcnow().isoformat(),
                'content_hash': hashlib.sha256(content.encode()).hexdigest(),
                'pdf_metadata': metadata.get('pdf_metadata', {})
            }
            
            logger.info(f"✅ Extracted PDF: {url} - {result['word_count']} words from {metadata['page_count']} pages")
            return result
        
        except Exception as e:
            logger.error(f"❌ PDF extraction failed for {url}: {e}")
            return {'url': url, 'success': False, 'error': str(e), 'content': None}
    
    async def _scrape_local_file(self, url: str) -> Dict[str, Any]:
        """Scrape content from local file."""
        try:
            file_path = url.replace('file://', '')
            file_path = Path(file_path).expanduser().resolve()
            
            if not file_path.exists():
                return {
                    'url': url,
                    'success': False,
                    'error': f'File not found: {file_path}',
                    'content': None
                }
            
            # Detect file type
            if file_path.suffix.lower() == '.pdf':
                # Use PDF scraper
                with open(file_path, 'rb') as f:
                    pdf_content = f.read()
                
                # Process with pdfplumber
                text_content = []
                with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
                    for page in pdf.pages[:100]:
                        page_text = page.extract_text() or ''
                        if page_text.strip():
                            text_content.append(page_text)
                
                content = '\n\n'.join(text_content)
                
                return {
                    'url': url,
                    'success': True,
                    'content_type': 'pdf',
                    'title': file_path.stem,
                    'content': content,
                    'word_count': len(content.split()),
                    'scraped_at': datetime.utcnow().isoformat()
                }
            else:
                # Read as text
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                return {
                    'url': url,
                    'success': True,
                    'content_type': 'text',
                    'title': file_path.name,
                    'content': content,
                    'word_count': len(content.split()),
                    'scraped_at': datetime.utcnow().isoformat()
                }
        
        except Exception as e:
            logger.error(f"❌ Local file reading failed for {url}: {e}")
            return {'url': url, 'success': False, 'error': str(e), 'content': None}
    
    async def _scrape_with_playwright(self, url: str, css_selector: Optional[str] = None) -> Dict[str, Any]:
        """Scrape JavaScript-rendered content with Playwright."""
        if not self.browser:
            logger.warning("Playwright not available, falling back to standard scraping")
            return await self._scrape_html(url, css_selector)
        
        try:
            logger.info(f"🎭 Using Playwright for: {url}")
            page = await self.browser.new_page()
            
            try:
                # Navigate and wait for content
                await page.goto(url, wait_until='networkidle', timeout=self.timeout * 1000)
                
                # Wait for specific selector if provided
                if css_selector:
                    await page.wait_for_selector(css_selector, timeout=10000)
                
                # Get page content
                content = await page.content()
                soup = BeautifulSoup(content, 'html.parser')
                
                # Extract title
                title = await page.title()
                
                # Extract text content
                if css_selector:
                    content_elem = soup.select_one(css_selector)
                    text_content = content_elem.get_text(strip=True, separator='\n') if content_elem else ""
                else:
                    # Remove unwanted elements
                    for unwanted in soup(["script", "style", "nav", "footer", "header"]):
                        unwanted.decompose()
                    
                    body = soup.find('body')
                    text_content = body.get_text(strip=True, separator='\n') if body else ""
                
                result = {
                    'url': url,
                    'success': True,
                    'content_type': 'html_js',
                    'title': title,
                    'content': text_content,
                    'word_count': len(text_content.split()),
                    'scraped_at': datetime.utcnow().isoformat(),
                    'rendering_engine': 'playwright'
                }
                
                logger.info(f"✅ Playwright scrape: {url} - {result['word_count']} words")
                return result
            
            finally:
                await page.close()
        
        except Exception as e:
            logger.error(f"❌ Playwright scraping failed for {url}: {e}")
            return {'url': url, 'success': False, 'error': str(e), 'content': None}


# Export for backward compatibility
WebScraper = EnhancedWebScraper

