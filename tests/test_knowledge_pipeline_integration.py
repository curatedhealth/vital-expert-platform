"""
Integration Tests for Knowledge Pipeline
========================================

Tests end-to-end functionality including:
- Complete pipeline execution
- RAG service integration
- File I/O operations
- Real scraping (with mocks)

Run with: pytest tests/test_knowledge_pipeline_integration.py -v
"""

import pytest
import json
import tempfile
from pathlib import Path
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock, MagicMock
import asyncio

# Add parent directory to path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.knowledge_pipeline import (
    PipelineConfig,
    WebScraper,
    ContentCurator,
    RAGServiceUploader,
    ReportGenerator,
    KnowledgePipeline
)


class TestEndToEndPipeline:
    """Test complete end-to-end pipeline execution."""
    
    @pytest.mark.asyncio
    async def test_full_pipeline_dry_run(self, tmp_path, sample_config):
        """Test complete pipeline execution in dry-run mode."""
        # Create config file
        config_file = tmp_path / "config.json"
        config_file.write_text(json.dumps(sample_config))
        
        output_dir = tmp_path / "knowledge"
        
        # Mock environment
        with patch.dict('os.environ', {
            'SUPABASE_URL': 'https://test.supabase.co',
            'SUPABASE_SERVICE_ROLE_KEY': 'test_key'
        }):
            # Mock scraper responses
            mock_results = [
                {
                    'url': 'https://www.fda.gov/test',
                    'title': 'FDA Test Page',
                    'content': 'FDA regulatory content for testing.',
                    'description': 'FDA description',
                    'links': [],
                    'success': True,
                    'word_count': 5,
                    'scraped_at': datetime.utcnow().isoformat(),
                    'content_hash': 'fda123'
                },
                {
                    'url': 'https://clinicaltrials.gov/test',
                    'title': 'Clinical Trial',
                    'content': 'Clinical trial protocol information.',
                    'description': 'Trial description',
                    'links': [],
                    'success': True,
                    'word_count': 4,
                    'scraped_at': datetime.utcnow().isoformat(),
                    'content_hash': 'trial456'
                }
            ]
            
            # Create pipeline
            pipeline = KnowledgePipeline(
                config_path=str(config_file),
                output_dir=str(output_dir),
                dry_run=True
            )
            
            # Mock WebScraper.scrape_url to return our mock results
            with patch.object(WebScraper, 'scrape_url', side_effect=mock_results):
                await pipeline.run()
            
            # Verify output directory structure
            assert output_dir.exists()
            assert (output_dir / 'regulatory_affairs').exists()
            assert (output_dir / 'clinical_development').exists()
            
            # Verify files were created
            fda_files = list((output_dir / 'regulatory_affairs').glob('*.md'))
            trial_files = list((output_dir / 'clinical_development').glob('*.md'))
            
            assert len(fda_files) == 1
            assert len(trial_files) == 1
            
            # Verify file content
            fda_content = fda_files[0].read_text()
            assert 'FDA Test Page' in fda_content
            assert 'regulatory_affairs' in fda_content
            assert 'FDA regulatory content' in fda_content
            
            # Verify report was generated
            reports = list(output_dir.glob('pipeline_report_*.md'))
            assert len(reports) == 1
            
            report_content = reports[0].read_text()
            assert 'Knowledge Pipeline Execution Report' in report_content
            assert '2' in report_content  # 2 documents processed
    
    @pytest.mark.asyncio
    async def test_pipeline_with_failed_scrapes(self, tmp_path):
        """Test pipeline handling of failed scrapes."""
        config_data = {
            "sources": [
                {"url": "https://good.com", "domain": "test", "category": "test", "tags": []},
                {"url": "https://bad.com", "domain": "test", "category": "test", "tags": []}
            ],
            "output_settings": {}
        }
        
        config_file = tmp_path / "config.json"
        config_file.write_text(json.dumps(config_data))
        
        output_dir = tmp_path / "knowledge"
        
        mock_results = [
            {
                'url': 'https://good.com',
                'title': 'Good Page',
                'content': 'Good content',
                'success': True,
                'word_count': 2,
                'scraped_at': datetime.utcnow().isoformat(),
                'content_hash': 'good123'
            },
            {
                'url': 'https://bad.com',
                'success': False,
                'error': 'HTTP 404',
                'content': None
            }
        ]
        
        with patch.dict('os.environ', {
            'SUPABASE_URL': 'https://test.supabase.co',
            'SUPABASE_SERVICE_ROLE_KEY': 'test_key'
        }):
            pipeline = KnowledgePipeline(
                config_path=str(config_file),
                output_dir=str(output_dir),
                dry_run=True
            )
            
            with patch.object(WebScraper, 'scrape_url', side_effect=mock_results):
                await pipeline.run()
            
            # Verify only successful scrape was saved
            files = list((output_dir / 'test').glob('*.md'))
            assert len(files) == 1
            
            # Verify failed URL is in report
            reports = list(output_dir.glob('pipeline_report_*.md'))
            report_content = reports[0].read_text()
            assert 'https://bad.com' in report_content
            assert 'Failed URLs' in report_content


class TestRAGIntegration:
    """Test RAG service integration."""
    
    @pytest.mark.asyncio
    async def test_rag_uploader_initialization(self):
        """Test RAG uploader initialization."""
        with patch('scripts.knowledge_pipeline.RAGServiceUploader') as mock_uploader_class:
            mock_instance = AsyncMock()
            mock_uploader_class.return_value = mock_instance
            
            uploader = RAGServiceUploader(embedding_model='test-model')
            
            assert uploader.embedding_model == 'test-model'
            assert uploader.uploaded_count == 0
            assert uploader.failed_count == 0
    
    @pytest.mark.asyncio
    async def test_rag_uploader_upload_content(self):
        """Test content upload via RAG service."""
        # Mock RAG integration
        mock_rag_integration = AsyncMock()
        mock_rag_integration.upload_content = AsyncMock(return_value=True)
        mock_rag_integration.get_stats = Mock(return_value={
            'uploaded': 1,
            'failed': 0,
            'chunks_created': 5
        })
        
        uploader = RAGServiceUploader(embedding_model='test-model')
        uploader.rag_integration = mock_rag_integration
        
        content = {
            'url': 'https://example.com',
            'title': 'Test',
            'content': 'Test content',
            'domain': 'test',
            'category': 'test',
            'tags': []
        }
        
        result = await uploader.upload_content(content)
        
        assert result is True
        assert uploader.uploaded_count == 1
        assert uploader.failed_count == 0
        mock_rag_integration.upload_content.assert_called_once()


class TestFileOperations:
    """Test file I/O operations."""
    
    def test_directory_creation(self, tmp_path):
        """Test automatic directory creation."""
        output_dir = tmp_path / "nested" / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        assert output_dir.exists()
    
    def test_markdown_file_format(self, tmp_path):
        """Test markdown file format and structure."""
        output_dir = tmp_path / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        scraped_data = {
            'url': 'https://example.com/article',
            'title': 'Test Article',
            'content': 'This is the article content.\n\nWith multiple paragraphs.',
            'description': 'Article description',
            'success': True,
            'word_count': 6,
            'scraped_at': '2025-11-05T14:30:22Z',
            'content_hash': 'abc123def456'
        }
        
        metadata = {
            'domain': 'medical_devices',
            'category': 'device_regulations',
            'tags': ['medical', 'devices', 'fda']
        }
        
        curator.add_content(scraped_data, metadata)
        
        # Find the created file
        files = list((output_dir / 'medical_devices').glob('*.md'))
        assert len(files) == 1
        
        content = files[0].read_text()
        
        # Verify frontmatter
        assert content.startswith('---\n')
        assert 'title: Test Article' in content
        assert 'url: https://example.com/article' in content
        assert 'domain: medical_devices' in content
        assert 'category: device_regulations' in content
        assert 'tags: medical, devices, fda' in content
        
        # Verify main content
        assert '# Test Article' in content
        assert 'This is the article content' in content
        assert 'With multiple paragraphs' in content
    
    def test_safe_filename_generation(self, tmp_path):
        """Test safe filename generation for special characters."""
        output_dir = tmp_path / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        scraped_data = {
            'url': 'https://example.com',
            'title': 'Test/Title:With*Special?Characters',
            'content': 'Content',
            'success': True,
            'word_count': 1,
            'scraped_at': datetime.utcnow().isoformat(),
            'content_hash': 'abc123'
        }
        
        metadata = {'domain': 'test', 'category': 'test', 'tags': []}
        
        curator.add_content(scraped_data, metadata)
        
        # Verify file was created with safe name
        files = list((output_dir / 'test').glob('*.md'))
        assert len(files) == 1
        
        # Verify no special characters in filename
        filename = files[0].name
        assert '/' not in filename
        assert ':' not in filename
        assert '*' not in filename
        assert '?' not in filename


class TestErrorHandling:
    """Test error handling and edge cases."""
    
    @pytest.mark.asyncio
    async def test_network_timeout_handling(self):
        """Test handling of network timeouts."""
        async with WebScraper(timeout=1) as scraper:
            with patch('aiohttp.ClientSession.get', side_effect=asyncio.TimeoutError):
                with patch('asyncio.sleep', new_callable=AsyncMock):
                    result = await scraper.scrape_url("https://slow.com")
                    
                    assert result['success'] is False
                    assert 'error' in result
    
    @pytest.mark.asyncio
    async def test_invalid_html_handling(self):
        """Test handling of malformed HTML."""
        malformed_html = "<html><body><p>Unclosed tag"
        
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.text = AsyncMock(return_value=malformed_html)
        
        with patch('aiohttp.ClientSession.get', return_value=mock_response):
            async with WebScraper() as scraper:
                result = await scraper.scrape_url("https://example.com")
                
                # Should still succeed (BeautifulSoup handles malformed HTML)
                assert result['success'] is True
    
    def test_empty_content_handling(self, tmp_path):
        """Test handling of empty content."""
        output_dir = tmp_path / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        scraped_data = {
            'url': 'https://example.com',
            'title': 'Empty Page',
            'content': '',  # Empty content
            'success': True,
            'word_count': 0,
            'scraped_at': datetime.utcnow().isoformat(),
            'content_hash': 'empty'
        }
        
        metadata = {'domain': 'test', 'category': 'test', 'tags': []}
        
        curator.add_content(scraped_data, metadata)
        
        # Should still create file
        files = list((output_dir / 'test').glob('*.md'))
        assert len(files) == 1


class TestDomainMapping:
    """Test domain and namespace mapping."""
    
    def test_domain_slug_normalization(self, tmp_path):
        """Test that domain slugs are properly normalized."""
        output_dir = tmp_path / "knowledge"
        curator = ContentCurator(str(output_dir))
        
        test_cases = [
            ('regulatory_affairs', 'regulatory_affairs'),
            ('medical-devices', 'medical-devices'),
            ('Clinical Development', 'Clinical Development'),  # Keep as-is
        ]
        
        for input_domain, expected_folder in test_cases:
            scraped_data = {
                'url': f'https://example.com/{input_domain}',
                'title': 'Test',
                'content': 'Test',
                'success': True,
                'word_count': 1,
                'scraped_at': datetime.utcnow().isoformat(),
                'content_hash': f'hash{input_domain}'
            }
            
            metadata = {'domain': input_domain, 'category': 'test', 'tags': []}
            
            curator.add_content(scraped_data, metadata)
            
            # Verify folder was created with correct name
            assert (output_dir / expected_folder).exists()


# Fixtures
@pytest.fixture
def sample_config():
    """Sample configuration for integration tests."""
    return {
        "sources": [
            {
                "url": "https://www.fda.gov/test",
                "domain": "regulatory_affairs",
                "category": "fda_guidelines",
                "tags": ["fda", "regulatory"],
                "priority": "high",
                "description": "FDA test page"
            },
            {
                "url": "https://clinicaltrials.gov/test",
                "domain": "clinical_development",
                "category": "trial_protocols",
                "tags": ["trials", "protocols"],
                "priority": "medium",
                "description": "Clinical trial test page"
            }
        ],
        "output_settings": {
            "create_subdirectories": True,
            "include_metadata": True,
            "markdown_format": True
        },
        "scraping_settings": {
            "timeout": 45,
            "max_retries": 3,
            "delay_between_requests": 1
        }
    }


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])

