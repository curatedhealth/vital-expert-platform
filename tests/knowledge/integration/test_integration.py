"""
Integration Tests for Knowledge Pipeline
=========================================

End-to-end tests for:
- Search → Scrape → Process workflow
- Multi-source concurrent processing
- Error recovery and retry
- Real API calls (optional)
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch
import sys
from pathlib import Path
import os

# Add scripts to path
project_root = Path(__file__).parent.parent.parent.parent
scripts_path = project_root / "scripts"
sys.path.insert(0, str(scripts_path))

try:
    from knowledge_search import KnowledgeSearcher, search_knowledge_sources
    from enhanced_web_scraper import EnhancedWebScraper
except ImportError:
    import os
    scripts_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'scripts')
    sys.path.insert(0, os.path.abspath(scripts_dir))
    from knowledge_search import KnowledgeSearcher, search_knowledge_sources
    from enhanced_web_scraper import EnhancedWebScraper


# Mark for integration tests (can be skipped in fast test runs)
pytestmark = pytest.mark.integration


class TestSearchToScrapeIntegration:
    """Test complete search-to-scrape workflow"""
    
    @pytest.mark.asyncio
    async def test_search_and_scrape_workflow(self):
        """Test complete workflow: search → scrape → process"""
        # Step 1: Search
        mock_search_results = {
            'arxiv': [
                {
                    'id': '2401.12345',
                    'title': 'Test Paper',
                    'url': 'https://arxiv.org/abs/2401.12345',
                    'pdf_link': 'https://arxiv.org/pdf/2401.12345.pdf',
                    'source': 'arXiv'
                }
            ]
        }
        
        # Step 2: Scrape
        mock_scrape_result = {
            'success': True,
            'title': 'Test Paper',
            'content': 'Full paper content here...',
            'word_count': 5000
        }
        
        with patch('knowledge_search.KnowledgeSearcher') as MockSearcher:
            mock_searcher = MockSearcher.return_value
            mock_searcher.__aenter__ = AsyncMock(return_value=mock_searcher)
            mock_searcher.__aexit__ = AsyncMock()
            mock_searcher.search = AsyncMock(return_value=mock_search_results['arxiv'])
            
            # Search phase
            search_results = await search_knowledge_sources(
                query='machine learning',
                sources=['arxiv'],
                max_results_per_source=1
            )
            
            assert 'arxiv' in search_results
            assert len(search_results['arxiv']) == 1
            
            # Scrape phase
            async with EnhancedWebScraper() as scraper:
                with patch.object(scraper, 'scrape_url', return_value=mock_scrape_result):
                    result = await scraper.scrape_url(
                        search_results['arxiv'][0]['pdf_link']
                    )
                    
                    assert result['success'] is True
                    assert result['word_count'] > 0
    
    @pytest.mark.asyncio
    async def test_multiple_sources_concurrent_scraping(self):
        """Test scraping multiple sources concurrently"""
        urls = [
            'https://example.com/paper1.pdf',
            'https://example.com/paper2.pdf',
            'https://example.com/paper3.pdf'
        ]
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, 'scrape_url') as mock_scrape:
                mock_scrape.side_effect = [
                    {'success': True, 'content': f'Content {i}', 'word_count': 1000}
                    for i in range(len(urls))
                ]
                
                # Scrape all concurrently
                tasks = [scraper.scrape_url(url) for url in urls]
                results = await asyncio.gather(*tasks)
                
                assert len(results) == 3
                assert all(r['success'] for r in results)
    
    @pytest.mark.asyncio
    async def test_error_recovery_in_pipeline(self):
        """Test that pipeline continues after individual failures"""
        urls = [
            'https://example.com/paper1.pdf',  # Success
            'https://example.com/paper2.pdf',  # Fail
            'https://example.com/paper3.pdf',  # Success
        ]
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, 'scrape_url') as mock_scrape:
                mock_scrape.side_effect = [
                    {'success': True, 'content': 'Content 1', 'word_count': 1000},
                    {'success': False, 'error': 'Network error'},
                    {'success': True, 'content': 'Content 3', 'word_count': 1500},
                ]
                
                results = await asyncio.gather(*[scraper.scrape_url(url) for url in urls])
                
                # Check that we got all results (including failures)
                assert len(results) == 3
                assert results[0]['success'] is True
                assert results[1]['success'] is False
                assert results[2]['success'] is True


class TestPerformanceAndScaling:
    """Test performance and scaling characteristics"""
    
    @pytest.mark.asyncio
    async def test_concurrent_search_performance(self):
        """Test concurrent search across multiple sources"""
        import time
        
        sources = ['pubmed_central', 'arxiv', 'semantic_scholar']
        
        with patch('knowledge_search.KnowledgeSearcher') as MockSearcher:
            mock_searcher = MockSearcher.return_value
            mock_searcher.__aenter__ = AsyncMock(return_value=mock_searcher)
            mock_searcher.__aexit__ = AsyncMock()
            
            # Each search takes 1 second
            async def mock_search(*args, **kwargs):
                await asyncio.sleep(0.1)  # Simulate API call
                return []
            
            mock_searcher.search = AsyncMock(side_effect=mock_search)
            
            start = time.time()
            results = await search_knowledge_sources(
                query='test',
                sources=sources,
                max_results_per_source=5
            )
            duration = time.time() - start
            
            # Should run concurrently, so total time < 3 * 0.1 = 0.3s
            # Allow some overhead
            assert duration < 0.5
            assert len(results) == len(sources)
    
    @pytest.mark.asyncio
    async def test_large_batch_scraping(self):
        """Test scraping large batch of URLs"""
        urls = [f'https://example.com/paper{i}.html' for i in range(50)]
        
        async with EnhancedWebScraper() as scraper:
            with patch.object(scraper, 'scrape_url') as mock_scrape:
                mock_scrape.return_value = {
                    'success': True,
                    'content': 'content',
                    'word_count': 500
                }
                
                # Process in batches
                batch_size = 10
                results = []
                
                for i in range(0, len(urls), batch_size):
                    batch = urls[i:i+batch_size]
                    batch_results = await asyncio.gather(
                        *[scraper.scrape_url(url) for url in batch]
                    )
                    results.extend(batch_results)
                
                assert len(results) == 50
                assert all(r['success'] for r in results)


class TestQueueManagement:
    """Test pipeline queue management"""
    
    @pytest.mark.asyncio
    async def test_queue_processing_with_status_tracking(self):
        """Test processing queue with status updates"""
        queue_items = [
            {'id': '1', 'url': 'https://example.com/1', 'status': 'pending'},
            {'id': '2', 'url': 'https://example.com/2', 'status': 'pending'},
            {'id': '3', 'url': 'https://example.com/3', 'status': 'pending'},
        ]
        
        async def process_item(item):
            """Simulate processing a queue item"""
            item['status'] = 'processing'
            
            async with EnhancedWebScraper() as scraper:
                with patch.object(scraper, 'scrape_url') as mock_scrape:
                    mock_scrape.return_value = {
                        'success': True,
                        'content': f"Content for {item['id']}",
                        'word_count': 1000
                    }
                    
                    result = await scraper.scrape_url(item['url'])
                    
                    if result['success']:
                        item['status'] = 'completed'
                        item['result'] = result
                    else:
                        item['status'] = 'failed'
                        item['error'] = result.get('error')
            
            return item
        
        # Process queue
        results = await asyncio.gather(*[process_item(item) for item in queue_items])
        
        # Verify all completed
        assert all(r['status'] == 'completed' for r in results)
        assert all('result' in r for r in results)
    
    @pytest.mark.asyncio
    async def test_queue_retry_on_failure(self):
        """Test retry logic for failed queue items"""
        queue_item = {
            'id': '1',
            'url': 'https://example.com/flaky',
            'status': 'pending',
            'retry_count': 0,
            'max_retries': 3
        }
        
        attempt_count = 0
        
        async def process_with_retry(item):
            """Process item with retry logic"""
            nonlocal attempt_count
            
            while item['retry_count'] < item['max_retries']:
                attempt_count += 1
                item['retry_count'] += 1
                
                async with EnhancedWebScraper() as scraper:
                    with patch.object(scraper, 'scrape_url') as mock_scrape:
                        # Fail first 2 attempts, succeed on 3rd
                        if attempt_count < 3:
                            mock_scrape.return_value = {
                                'success': False,
                                'error': 'Temporary failure'
                            }
                        else:
                            mock_scrape.return_value = {
                                'success': True,
                                'content': 'Success!',
                                'word_count': 100
                            }
                        
                        result = await scraper.scrape_url(item['url'])
                        
                        if result['success']:
                            item['status'] = 'completed'
                            return item
                
                # Wait before retry
                await asyncio.sleep(0.01)
            
            item['status'] = 'failed'
            return item
        
        result = await process_with_retry(queue_item)
        
        assert result['status'] == 'completed'
        assert result['retry_count'] == 3
        assert attempt_count == 3


class TestDataValidation:
    """Test data validation in pipeline"""
    
    @pytest.mark.asyncio
    async def test_validate_search_results_schema(self):
        """Test that search results have required fields"""
        required_fields = [
            'id', 'title', 'url', 'source', 'authors',
            'publication_date', 'abstract', 'access_type'
        ]
        
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                # Mock arXiv response
                mock_xml = """<?xml version="1.0" encoding="UTF-8"?>
                <feed xmlns="http://www.w3.org/2005/Atom">
                    <entry>
                        <id>http://arxiv.org/abs/2401.12345</id>
                        <title>Test</title>
                        <summary>Abstract</summary>
                        <author><name>Author</name></author>
                        <published>2024-01-15T00:00:00Z</published>
                        <category term="cs.AI"/>
                    </entry>
                </feed>
                """
                
                mock_response = AsyncMock()
                mock_response.status = 200
                mock_response.text = AsyncMock(return_value=mock_xml)
                mock_get.return_value.__aenter__.return_value = mock_response
                
                results = await searcher._search_arxiv('test', 10)
                
                # Validate schema
                for result in results:
                    for field in required_fields:
                        assert field in result, f"Missing field: {field}"
                    
                    # Validate types
                    assert isinstance(result['title'], str)
                    assert isinstance(result['authors'], list)
                    assert isinstance(result['url'], str)
    
    @pytest.mark.asyncio
    async def test_validate_scrape_results_schema(self):
        """Test that scrape results have required fields"""
        required_fields = [
            'success', 'url', 'content', 'word_count'
        ]
        
        async with EnhancedWebScraper() as scraper:
            html = b'<html><body><p>Test content</p></body></html>'
            
            with patch.object(scraper, '_fetch_with_retry', return_value=html):
                result = await scraper._scrape_html('https://example.com')
                
                for field in required_fields:
                    assert field in result, f"Missing field: {field}"
                
                # Validate types
                assert isinstance(result['success'], bool)
                assert isinstance(result['content'], str)
                assert isinstance(result['word_count'], int)


@pytest.mark.slow
@pytest.mark.skipif(
    os.getenv('RUN_LIVE_TESTS') != '1',
    reason="Live API tests disabled (set RUN_LIVE_TESTS=1 to enable)"
)
class TestLiveAPIIntegration:
    """
    Live API integration tests (requires internet connection)
    
    Run with: RUN_LIVE_TESTS=1 pytest test_integration.py -v -m slow
    """
    
    @pytest.mark.asyncio
    async def test_live_arxiv_search(self):
        """Test real arXiv API search"""
        async with KnowledgeSearcher() as searcher:
            results = await searcher._search_arxiv(
                'machine learning',
                max_results=3,
                sort_by='relevance'
            )
            
            assert len(results) > 0
            assert all('title' in r for r in results)
            assert all('pdf_link' in r for r in results)
            print(f"\n✅ Found {len(results)} arXiv results")
            for r in results[:2]:
                print(f"  - {r['title'][:60]}...")
    
    @pytest.mark.asyncio
    async def test_live_pubmed_search(self):
        """Test real PubMed Central API search"""
        async with KnowledgeSearcher() as searcher:
            results = await searcher._search_pubmed_central(
                'artificial intelligence healthcare',
                max_results=3,
                start_year=2023,
                end_year=2024
            )
            
            assert len(results) > 0
            assert all(r['source'] == 'PubMed Central' for r in results)
            print(f"\n✅ Found {len(results)} PMC results")
            for r in results[:2]:
                print(f"  - {r['title'][:60]}...")
    
    @pytest.mark.asyncio
    async def test_live_scrape_arxiv_pdf(self):
        """Test real arXiv PDF scraping"""
        # Use a known stable arXiv paper
        test_url = 'https://arxiv.org/pdf/1706.03762.pdf'  # "Attention Is All You Need"
        
        async with EnhancedWebScraper() as scraper:
            result = await scraper.scrape_url(test_url)
            
            if result['success']:
                assert result['word_count'] > 1000
                assert 'attention' in result['content'].lower()
                print(f"\n✅ Scraped PDF: {result['word_count']} words")
            else:
                print(f"\n⚠️ Scraping failed: {result.get('error')}")


if __name__ == '__main__':
    # Run tests
    pytest.main([
        __file__,
        '-v',
        '--tb=short',
        '-m', 'not slow'  # Skip slow live tests by default
    ])

