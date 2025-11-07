"""
Unit Tests for Knowledge Pipeline
==================================

Tests all core components of the knowledge pipeline:
- Configuration validation
- Web scraping
- Content curation
- Report generation

Run with: pytest tests/test_knowledge_pipeline_unit.py -v
"""

import pytest
import json
import tempfile
from pathlib import Path
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock, MagicMock
import aiohttp

# Add parent directory to path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.knowledge_pipeline import (
    PipelineConfig,
    WebScraper,
    ContentCurator,
    ReportGenerator,
    KnowledgePipeline
)


class TestPipelineConfig:
    """Test configuration loading and validation."""
    
    def test_load_valid_config(self, tmp_path):
        """Test loading a valid configuration file."""
        config_data = {
            "sources": [
                {
                    "url": "https://example.com",
                    "domain": "regulatory_affairs",
                    "category": "test",
                    "tags": ["test"],
                    "priority": "high"
                }
            ],
            "output_settings": {
                "create_subdirectories": True,
                "include_metadata": True
            }
        }
        
        config_file = tmp_path / "test_config.json"
        config_file.write_text(json.dumps(config_data))
        
        with patch.dict('os.environ', {
            'SUPABASE_URL': 'https://test.supabase.co',
            'SUPABASE_SERVICE_ROLE_KEY': 'test_key'
        }):
            config = PipelineConfig(str(config_file))
            assert config.config == config_data
            assert len(config.config['sources']) == 1
    
    def test_missing_config_file(self):
        """Test error handling for missing config file."""
        with pytest.raises(SystemExit):
            PipelineConfig("nonexistent.json")
    
    def test_invalid_json(self, tmp_path):
        """Test error handling for invalid JSON."""
        config_file = tmp_path / "invalid.json"
        config_file.write_text("{ invalid json }")
        
        with pytest.raises(SystemExit):
            PipelineConfig(str(config_file))
    
    def test_missing_required_fields(self, tmp_path):
        """Test validation of required fields."""
        config_data = {"output_settings": {}}  # Missing 'sources'
        
        config_file = tmp_path / "incomplete.json"
        config_file.write_text(json.dumps(config_data))
        
        with pytest.raises(SystemExit):
            PipelineConfig(str(config_file))
    
    def test_empty_sources_list(self, tmp_path):
        """Test validation of empty sources list."""
        config_data = {
            "sources": [],  # Empty list
            "output_settings": {}
        }
        
        config_file = tmp_path / "empty_sources.json"
        config_file.write_text(json.dumps(config_data))
        
        with pytest.raises(SystemExit):
            PipelineConfig(str(config_file))
    
    def test_source_missing_url(self, tmp_path):
        """Test validation of source URL."""
        config_data = {
            "sources": [{"domain": "test"}],  # Missing URL
            "output_settings": {}
        }
        
        config_file = tmp_path / "no_url.json"
        config_file.write_text(json.dumps(config_data))
        
        with pytest.raises(SystemExit):
            PipelineConfig(str(config_file))
    
    def test_missing_environment_variables(self, tmp_path):
        """Test validation of environment variables."""
        config_data = {
            "sources": [{"url": "https://example.com"}],
            "output_settings": {}
        }
        
        config_file = tmp_path / "config.json"
        config_file.write_text(json.dumps(config_data))
        
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(SystemExit):
                PipelineConfig(str(config_file))


class TestWebScraper:
    """Test web scraping functionality."""
    
    @pytest.mark.asyncio
    async def test_scraper_context_manager(self):
        """Test scraper context manager initialization."""
        async with WebScraper() as scraper:
            assert scraper.session is not None
            assert isinstance(scraper.session, aiohttp.ClientSession)
    
    @pytest.mark.asyncio
    async def test_successful_scrape(self):
        """Test successful webpage scraping."""
        html_content = """
        <html>
            <head><title>Test Page</title></head>
            <body>
                <main>
                    <h1>Test Content</h1>
                    <p>This is test content for scraping.</p>
                </main>
            </body>
        </html>
        """
        
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.text = AsyncMock(return_value=html_content)
        
        with patch('aiohttp.ClientSession.get', return_value=mock_response):
            async with WebScraper() as scraper:
                result = await scraper.scrape_url("https://example.com")
                
                assert result['success'] is True
                assert result['title'] == 'Test Page'
                assert 'test content' in result['content'].lower()
                assert result['word_count'] > 0
                assert 'content_hash' in result
    
    @pytest.mark.asyncio
    async def test_http_error_handling(self):
        """Test handling of HTTP errors."""
        mock_response = AsyncMock()
        mock_response.status = 404
        
        with patch('aiohttp.ClientSession.get', return_value=mock_response):
            async with WebScraper() as scraper:
                result = await scraper.scrape_url("https://example.com")
                
                assert result['success'] is False
                assert 'error' in result
                assert 'HTTP 404' in result['error']
    
    @pytest.mark.asyncio
    async def test_css_selector_extraction(self):
        """Test content extraction with CSS selector."""
        html_content = """
        <html>
            <body>
                <div class="content">Target content</div>
                <div>Other content</div>
            </body>
        </html>
        """
        
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.text = AsyncMock(return_value=html_content)
        
        with patch('aiohttp.ClientSession.get', return_value=mock_response):
            async with WebScraper() as scraper:
                result = await scraper.scrape_url(
                    "https://example.com",
                    css_selector=".content"
                )
                
                assert result['success'] is True
                assert 'Target content' in result['content']
                assert 'Other content' not in result['content']
    
    @pytest.mark.asyncio
    async def test_retry_logic(self):
        """Test retry logic on failures."""
        mock_response = AsyncMock()
        mock_response.status = 500
        
        scraper = WebScraper(max_retries=2)
        
        with patch('aiohttp.ClientSession.get', return_value=mock_response):
            with patch('asyncio.sleep', new_callable=AsyncMock):
                async with scraper:
                    result = await scraper.scrape_url("https://example.com")
                    
                    assert result['success'] is False
                    # Should have tried multiple times


class TestContentCurator:
    """Test content curation and organization."""
    
    def test_initialization(self, tmp_path):
        """Test curator initialization."""
        output_dir = tmp_path / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        assert output_dir.exists()
        assert curator.output_dir == output_dir
        assert len(curator.domains) == 0
    
    def test_add_content_creates_domain_folder(self, tmp_path):
        """Test domain folder creation."""
        output_dir = tmp_path / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        scraped_data = {
            'url': 'https://example.com',
            'title': 'Test Document',
            'content': 'Test content',
            'success': True,
            'word_count': 2,
            'scraped_at': datetime.utcnow().isoformat(),
            'content_hash': 'abc123'
        }
        
        metadata = {
            'domain': 'regulatory_affairs',
            'category': 'test',
            'tags': ['test']
        }
        
        curator.add_content(scraped_data, metadata)
        
        domain_dir = output_dir / 'regulatory_affairs'
        assert domain_dir.exists()
        assert 'regulatory_affairs' in curator.domains
        assert len(curator.domains['regulatory_affairs']) == 1
    
    def test_save_content_file(self, tmp_path):
        """Test markdown file creation."""
        output_dir = tmp_path / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        scraped_data = {
            'url': 'https://example.com/doc',
            'title': 'Test Document',
            'content': 'This is test content for the document.',
            'description': 'Test description',
            'success': True,
            'word_count': 7,
            'scraped_at': '2025-11-05T12:00:00',
            'content_hash': 'abc123def'
        }
        
        metadata = {
            'domain': 'clinical_development',
            'category': 'protocols',
            'tags': ['test', 'protocol']
        }
        
        curator.add_content(scraped_data, metadata)
        
        # Check file was created
        domain_dir = output_dir / 'clinical_development'
        files = list(domain_dir.glob('*.md'))
        assert len(files) == 1
        
        # Check file content
        content = files[0].read_text()
        assert 'Test Document' in content
        assert 'https://example.com/doc' in content
        assert 'clinical_development' in content
        assert 'protocols' in content
        assert 'This is test content' in content
    
    def test_get_summary(self, tmp_path):
        """Test summary statistics generation."""
        output_dir = tmp_path / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        # Add multiple documents
        for i in range(3):
            scraped_data = {
                'url': f'https://example.com/doc{i}',
                'title': f'Document {i}',
                'content': f'Content {i}' * 100,
                'success': True,
                'word_count': 200,
                'scraped_at': datetime.utcnow().isoformat(),
                'content_hash': f'hash{i}'
            }
            
            metadata = {
                'domain': 'regulatory_affairs' if i < 2 else 'medical_devices',
                'category': 'test',
                'tags': ['test']
            }
            
            curator.add_content(scraped_data, metadata)
        
        summary = curator.get_summary()
        
        assert summary['total_domains'] == 2
        assert 'regulatory_affairs' in summary['domains']
        assert 'medical_devices' in summary['domains']
        assert summary['domains']['regulatory_affairs']['count'] == 2
        assert summary['domains']['medical_devices']['count'] == 1
        assert summary['domains']['regulatory_affairs']['total_words'] == 400


class TestReportGenerator:
    """Test report generation."""
    
    def test_report_generation(self, tmp_path):
        """Test comprehensive report generation."""
        output_dir = tmp_path / "knowledge"
        output_dir.mkdir()
        
        generator = ReportGenerator(str(output_dir))
        
        # Create mock curator
        curator = ContentCurator(str(output_dir))
        scraped_data = {
            'url': 'https://example.com',
            'title': 'Test',
            'content': 'Test content',
            'success': True,
            'word_count': 2,
            'scraped_at': datetime.utcnow().isoformat(),
            'content_hash': 'abc'
        }
        curator.add_content(scraped_data, {'domain': 'test', 'category': 'test', 'tags': []})
        
        # Mock stats
        uploader_stats = {
            'uploaded': 5,
            'failed': 1
        }
        
        failed_urls = ['https://failed.com']
        
        report = generator.generate_report(curator, uploader_stats, failed_urls)
        
        assert 'Knowledge Pipeline Execution Report' in report
        assert 'Execution Summary' in report
        assert 'Content Curation' in report
        assert 'Upload Results' in report
        assert '5' in report  # uploaded count
        assert '1' in report  # failed count
        assert 'https://failed.com' in report
        
        # Check report file was created
        report_files = list(output_dir.glob('pipeline_report_*.md'))
        assert len(report_files) == 1


class TestKnowledgePipeline:
    """Test complete pipeline orchestration."""
    
    @pytest.mark.asyncio
    async def test_pipeline_initialization(self, tmp_path):
        """Test pipeline initialization."""
        config_data = {
            "sources": [{"url": "https://example.com"}],
            "output_settings": {}
        }
        
        config_file = tmp_path / "config.json"
        config_file.write_text(json.dumps(config_data))
        
        output_dir = tmp_path / "knowledge"
        
        with patch.dict('os.environ', {
            'SUPABASE_URL': 'https://test.supabase.co',
            'SUPABASE_SERVICE_ROLE_KEY': 'test_key'
        }):
            pipeline = KnowledgePipeline(
                config_path=str(config_file),
                output_dir=str(output_dir),
                dry_run=True
            )
            
            assert pipeline.dry_run is True
            assert pipeline.curator is not None
            assert pipeline.uploader is not None
    
    @pytest.mark.asyncio
    async def test_dry_run_mode(self, tmp_path):
        """Test pipeline in dry-run mode (no uploads)."""
        config_data = {
            "sources": [
                {
                    "url": "https://example.com",
                    "domain": "test",
                    "category": "test",
                    "tags": []
                }
            ],
            "output_settings": {}
        }
        
        config_file = tmp_path / "config.json"
        config_file.write_text(json.dumps(config_data))
        
        output_dir = tmp_path / "knowledge"
        
        # Mock the scraper
        mock_scrape_result = {
            'url': 'https://example.com',
            'title': 'Test',
            'content': 'Test content',
            'success': True,
            'word_count': 2,
            'scraped_at': datetime.utcnow().isoformat(),
            'content_hash': 'abc123'
        }
        
        with patch.dict('os.environ', {
            'SUPABASE_URL': 'https://test.supabase.co',
            'SUPABASE_SERVICE_ROLE_KEY': 'test_key'
        }):
            pipeline = KnowledgePipeline(
                config_path=str(config_file),
                output_dir=str(output_dir),
                dry_run=True
            )
            
            with patch.object(WebScraper, 'scrape_url', return_value=mock_scrape_result):
                await pipeline.run()
            
            # Check that content was saved locally
            assert output_dir.exists()
            domain_dir = output_dir / 'test'
            assert domain_dir.exists()


# Fixtures
@pytest.fixture
def sample_config():
    """Sample configuration data."""
    return {
        "sources": [
            {
                "url": "https://www.fda.gov/test",
                "domain": "regulatory_affairs",
                "category": "fda_guidelines",
                "tags": ["fda", "test"],
                "priority": "high",
                "description": "Test FDA page"
            },
            {
                "url": "https://clinicaltrials.gov/test",
                "domain": "clinical_development",
                "category": "trials",
                "tags": ["trials"],
                "priority": "medium",
                "description": "Test trials page"
            }
        ],
        "output_settings": {
            "create_subdirectories": True,
            "include_metadata": True,
            "markdown_format": True
        }
    }


@pytest.fixture
def sample_scraped_data():
    """Sample scraped data."""
    return {
        'url': 'https://example.com',
        'title': 'Sample Document',
        'content': 'This is sample content for testing purposes.',
        'description': 'Sample description',
        'links': ['https://link1.com', 'https://link2.com'],
        'success': True,
        'word_count': 8,
        'scraped_at': '2025-11-05T12:00:00Z',
        'content_hash': 'abc123def456'
    }


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])

