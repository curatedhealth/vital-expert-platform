"""
Unit Tests for Enhanced Web Scraper
====================================

Tests all scraping features:
- HTML scraping
- PDF extraction
- Playwright rendering
- Content type detection
- Retry logic
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch, mock_open
import sys
from pathlib import Path
import io

# Add scripts to path
project_root = Path(__file__).parent.parent.parent.parent
scripts_path = project_root / "scripts"
sys.path.insert(0, str(scripts_path))

try:
    from enhanced_web_scraper import EnhancedWebScraper
except ImportError:
    import os
    scripts_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'scripts')
    sys.path.insert(0, os.path.abspath(scripts_dir))
    from enhanced_web_scraper import EnhancedWebScraper


class TestScraperInitialization:
    """Test scraper initialization and setup"""
    
    @pytest.mark.asyncio
    async def test_scraper_init(self):
        """Test basic scraper initialization"""
        scraper = EnhancedWebScraper(
            timeout=30,
            max_retries=5,
            use_playwright=False
        )
        
        assert scraper.timeout == 30
        assert scraper.max_retries == 5
        assert scraper.use_playwright is False
    
    @pytest.mark.asyncio
    async def test_scraper_context_manager(self):
        """Test scraper as context manager"""
        async with EnhancedWebScraper() as scraper:
            assert scraper.session is not None
            assert not scraper.session.closed
    
    @pytest.mark.asyncio
    async def test_scraper_cleanup(self):
        """Test scraper cleanup"""
        scraper = EnhancedWebScraper()
        await scraper.__aenter__()
        session = scraper.session
        await scraper.__aexit__(None, None, None)
        
        assert session.closed
    
    def test_user_agent_rotation(self):
        """Test user agent rotation"""
        scraper = EnhancedWebScraper(user_agent_rotation=True)
        
        ua1 = scraper._get_user_agent()
        ua2 = scraper._get_user_agent()
        
        # Should rotate through agents
        assert ua1 in scraper.USER_AGENTS
        assert ua2 in scraper.USER_AGENTS


class TestContentTypeDetection:
    """Test content type detection"""
    
    @pytest.mark.asyncio
    async def test_detect_pdf_from_url(self):
        """Test PDF detection from URL extension"""
        async with EnhancedWebScraper() as scraper:
            content_type = await scraper._detect_content_type(
                'https://example.com/paper.pdf'
            )
            assert content_type == 'pdf'
    
    @pytest.mark.asyncio
    async def test_detect_html_from_url(self):
        """Test HTML detection from URL extension"""
        async with EnhancedWebScraper() as scraper:
            content_type = await scraper._detect_content_type(
                'https://example.com/page.html'
            )
            assert content_type == 'html'
    
    @pytest.mark.asyncio
    async def test_detect_local_file(self):
        """Test local file detection"""
        async with EnhancedWebScraper() as scraper:
            content_type = await scraper._detect_content_type(
                'file:///path/to/document.pdf'
            )
            assert content_type == 'local_file'
    
    @pytest.mark.asyncio
    async def test_detect_from_content_type_header(self):
        """Test detection from Content-Type header"""
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper.session, 'head') as mock_head:
                mock_response = AsyncMock()
                mock_response.headers = {'Content-Type': 'application/pdf'}
                mock_head.return_value.__aenter__.return_value = mock_response
                
                content_type = await scraper._detect_content_type(
                    'https://example.com/document'
                )
                
                assert content_type == 'pdf'
    
    def test_needs_real_browser(self):
        """Test detection of sites needing real browser"""
        scraper = EnhancedWebScraper()
        
        # Sites that need browser
        assert scraper._needs_real_browser('https://ncbi.nlm.nih.gov/pmc/articles/123')
        assert scraper._needs_real_browser('https://pmc.ncbi.nlm.nih.gov/articles/123')
        assert scraper._needs_real_browser('https://doaj.org/article/123')
        assert scraper._needs_real_browser('https://semanticscholar.org/paper/123')
        
        # Sites that don't need browser
        assert not scraper._needs_real_browser('https://arxiv.org/abs/123')
        assert not scraper._needs_real_browser('https://example.com/page')


class TestHTMLScraping:
    """Test HTML content scraping"""
    
    @pytest.mark.asyncio
    async def test_scrape_html_basic(self):
        """Test basic HTML scraping"""
        html_content = b"""
        <html>
            <head><title>Test Page</title></head>
            <body>
                <main>
                    <h1>Main Content</h1>
                    <p>This is the main content of the page.</p>
                </main>
            </body>
        </html>
        """
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, '_fetch_with_retry', return_value=html_content):
                result = await scraper._scrape_html('https://example.com')
                
                assert result['success'] is True
                assert result['title'] == 'Test Page'
                assert 'Main Content' in result['content']
                assert result['content_type'] == 'html'
                assert result['word_count'] > 0
    
    @pytest.mark.asyncio
    async def test_scrape_html_with_css_selector(self):
        """Test HTML scraping with CSS selector"""
        html_content = b"""
        <html>
            <body>
                <div class="sidebar">Sidebar content</div>
                <main class="content">
                    <p>Main content only</p>
                </main>
            </body>
        </html>
        """
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, '_fetch_with_retry', return_value=html_content):
                result = await scraper._scrape_html(
                    'https://example.com',
                    css_selector='main.content'
                )
                
                assert result['success'] is True
                assert 'Main content only' in result['content']
                assert 'Sidebar content' not in result['content']
    
    @pytest.mark.asyncio
    async def test_scrape_html_removes_unwanted_elements(self):
        """Test that scripts, styles, etc. are removed"""
        html_content = b"""
        <html>
            <head>
                <style>body { color: red; }</style>
                <script>console.log('test');</script>
            </head>
            <body>
                <main>Clean content</main>
                <nav>Navigation</nav>
                <footer>Footer</footer>
            </body>
        </html>
        """
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, '_fetch_with_retry', return_value=html_content):
                result = await scraper._scrape_html('https://example.com')
                
                assert result['success'] is True
                assert 'Clean content' in result['content']
                assert 'console.log' not in result['content']
                assert 'color: red' not in result['content']
                assert 'Navigation' not in result['content']
                assert 'Footer' not in result['content']
    
    @pytest.mark.asyncio
    async def test_scrape_html_extracts_meta_description(self):
        """Test meta description extraction"""
        html_content = b"""
        <html>
            <head>
                <meta name="description" content="This is a test page description">
            </head>
            <body>Content</body>
        </html>
        """
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, '_fetch_with_retry', return_value=html_content):
                result = await scraper._scrape_html('https://example.com')
                
                assert result['description'] == 'This is a test page description'


class TestPDFScraping:
    """Test PDF extraction"""
    
    @pytest.mark.asyncio
    @patch('enhanced_web_scraper.PDF_SUPPORT', True)
    @patch('enhanced_web_scraper.pdfplumber')
    async def test_scrape_pdf_success(self, mock_pdfplumber):
        """Test successful PDF scraping"""
        # Mock PDF content
        mock_pdf = MagicMock()
        mock_pdf.pages = [
            MagicMock(extract_text=lambda: "Page 1 content"),
            MagicMock(extract_text=lambda: "Page 2 content")
        ]
        mock_pdf.metadata = {'Title': 'Test PDF Document'}
        mock_pdf.__enter__ = MagicMock(return_value=mock_pdf)
        mock_pdf.__exit__ = MagicMock()
        
        mock_pdfplumber.open.return_value = mock_pdf
        
        pdf_bytes = b'%PDF-1.4 fake pdf content'
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, '_fetch_with_retry', return_value=pdf_bytes):
                result = await scraper._scrape_pdf('https://example.com/doc.pdf')
                
                assert result['success'] is True
                assert result['title'] == 'Test PDF Document'
                assert 'Page 1 content' in result['content']
                assert 'Page 2 content' in result['content']
                assert result['content_type'] == 'pdf'
                assert result['page_count'] == 2
    
    @pytest.mark.asyncio
    async def test_scrape_pdf_html_fallback(self):
        """Test PDF scraper falls back to HTML when PDF blocked"""
        html_content = b"""
        <html>
            <div class="pmc-article">
                <h1>Article Title</h1>
                <p>Article content from HTML version</p>
            </div>
        </html>
        """
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, '_fetch_with_retry', return_value=html_content):
                result = await scraper._scrape_pdf('https://pmc.ncbi.nlm.nih.gov/articles/PMC123/pdf/')
                
                assert result['success'] is True
                assert 'Article Title' in result['content']
                assert 'Article content' in result['content']
                assert result['source_type'] == 'html_fallback'
    
    @pytest.mark.asyncio
    @patch('enhanced_web_scraper.PDF_SUPPORT', False)
    async def test_scrape_pdf_no_support(self):
        """Test PDF scraping when libraries not installed"""
        async with EnhancedWebScraper() as scraper:
            result = await scraper._scrape_pdf('https://example.com/doc.pdf')
            
            assert result['success'] is False
            assert 'PDF libraries not installed' in result['error']


class TestRetryLogic:
    """Test retry and error handling"""
    
    @pytest.mark.asyncio
    async def test_fetch_with_retry_success_first_attempt(self):
        """Test successful fetch on first attempt"""
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper.session, 'get') as mock_get:
                mock_response = AsyncMock()
                mock_response.status = 200
                mock_response.read = AsyncMock(return_value=b'content')
                mock_get.return_value.__aenter__.return_value = mock_response
                
                content = await scraper._fetch_with_retry('https://example.com')
                
                assert content == b'content'
                assert mock_get.call_count == 1
    
    @pytest.mark.asyncio
    async def test_fetch_with_retry_403_fallback(self):
        """Test 403 error triggers PMC HTML fallback"""
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper.session, 'get') as mock_get:
                # First call: 403 on PDF
                mock_403_response = AsyncMock()
                mock_403_response.status = 403
                
                # Second call: Success on HTML
                mock_success_response = AsyncMock()
                mock_success_response.status = 200
                mock_success_response.text = AsyncMock(return_value='<html>HTML content</html>')
                
                mock_get.return_value.__aenter__.side_effect = [
                    mock_403_response,
                    mock_success_response
                ]
                
                content = await scraper._fetch_with_retry(
                    'https://ncbi.nlm.nih.gov/pmc/articles/PMC123/pdf/'
                )
                
                assert b'HTML content' in content
                assert mock_get.call_count == 2
    
    @pytest.mark.asyncio
    async def test_scrape_url_error_handling(self):
        """Test error handling in scrape_url"""
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, '_scrape_html', side_effect=Exception('Network error')):
                result = await scraper.scrape_url('https://example.com')
                
                assert result['success'] is False
                assert 'Network error' in result['error']
                assert result['content'] is None


class TestPlaywrightIntegration:
    """Test Playwright browser integration"""
    
    @pytest.mark.asyncio
    @patch('enhanced_web_scraper.PLAYWRIGHT_SUPPORT', True)
    async def test_playwright_initialization(self):
        """Test Playwright browser initialization"""
        with patch('enhanced_web_scraper.async_playwright') as mock_playwright:
            mock_pw = AsyncMock()
            mock_pw.chromium.launch = AsyncMock(return_value=MagicMock())
            mock_playwright.return_value.start = AsyncMock(return_value=mock_pw)
            
            async with EnhancedWebScraper(use_playwright=True) as scraper:
                # Playwright should be initialized
                pass
    
    @pytest.mark.asyncio
    async def test_scrape_with_playwright_success(self):
        """Test successful Playwright scraping"""
        async with EnhancedWebScraper() as scraper:
            # Mock browser
            mock_page = AsyncMock()
            mock_page.goto = AsyncMock()
            mock_page.title = AsyncMock(return_value='Page Title')
            mock_page.content = AsyncMock(return_value='<html><body>Content</body></html>')
            mock_page.close = AsyncMock()
            
            scraper.browser = MagicMock()
            scraper.browser.new_page = AsyncMock(return_value=mock_page)
            
            result = await scraper._scrape_with_playwright('https://example.com')
            
            assert result['success'] is True
            assert result['title'] == 'Page Title'
            assert 'Content' in result['content']
            assert result['rendering_engine'] == 'playwright'
    
    @pytest.mark.asyncio
    async def test_scrape_with_playwright_fallback(self):
        """Test fallback to regular scraping when Playwright unavailable"""
        async with EnhancedWebScraper() as scraper:
            scraper.browser = None  # No browser available
            
            with patch.object(scraper, '_scrape_html') as mock_scrape_html:
                mock_scrape_html.return_value = {'success': True, 'content': 'fallback'}
                
                result = await scraper._scrape_with_playwright('https://example.com')
                
                mock_scrape_html.assert_called_once()


class TestLocalFileHandling:
    """Test local file scraping"""
    
    @pytest.mark.asyncio
    async def test_scrape_local_text_file(self):
        """Test scraping local text file"""
        file_content = "This is test file content\nWith multiple lines"
        
        async with EnhancedWebScraper() as scraper:
            with patch('builtins.open', mock_open(read_data=file_content)):
                with patch('pathlib.Path.exists', return_value=True):
                    result = await scraper._scrape_local_file('file:///path/to/test.txt')
                    
                    assert result['success'] is True
                    assert result['content'] == file_content
                    assert result['content_type'] == 'text'
    
    @pytest.mark.asyncio
    async def test_scrape_local_file_not_found(self):
        """Test scraping non-existent local file"""
        async with EnhancedWebScraper() as scraper:
            with patch('pathlib.Path.exists', return_value=False):
                result = await scraper._scrape_local_file('file:///path/to/missing.txt')
                
                assert result['success'] is False
                assert 'File not found' in result['error']


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])

