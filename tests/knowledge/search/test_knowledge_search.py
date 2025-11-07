"""
Unit Tests for Knowledge Search Module
=======================================

Tests all search sources:
- PubMed Central
- arXiv
- Semantic Scholar
- DOAJ
- bioRxiv
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import sys
from pathlib import Path

# Add scripts to path
project_root = Path(__file__).parent.parent.parent.parent
scripts_path = project_root / "scripts"
sys.path.insert(0, str(scripts_path))

try:
    from knowledge_search import KnowledgeSearcher, search_knowledge_sources
except ImportError as e:
    # If running from wrong directory, try absolute import
    import sys
    import os
    scripts_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'scripts')
    sys.path.insert(0, os.path.abspath(scripts_dir))
    from knowledge_search import KnowledgeSearcher, search_knowledge_sources


class TestKnowledgeSearcher:
    """Unit tests for KnowledgeSearcher class"""
    
    @pytest.fixture
    async def searcher(self):
        """Create searcher instance"""
        searcher = KnowledgeSearcher()
        await searcher.__aenter__()
        yield searcher
        await searcher.__aexit__(None, None, None)
    
    @pytest.mark.asyncio
    async def test_searcher_initialization(self):
        """Test searcher initialization"""
        async with KnowledgeSearcher() as searcher:
            assert searcher.session is not None
            assert not searcher.session.closed
    
    @pytest.mark.asyncio
    async def test_searcher_cleanup(self):
        """Test searcher cleanup"""
        searcher = KnowledgeSearcher()
        await searcher.__aenter__()
        session = searcher.session
        await searcher.__aexit__(None, None, None)
        assert session.closed
    
    @pytest.mark.asyncio
    async def test_sort_results_by_date(self, searcher):
        """Test sorting results by publication date"""
        results = [
            {'title': 'Old', 'publication_year': 2020},
            {'title': 'New', 'publication_year': 2024},
            {'title': 'Medium', 'publication_year': 2022},
        ]
        
        sorted_results = searcher._sort_results(results, 'date')
        
        assert sorted_results[0]['title'] == 'New'
        assert sorted_results[1]['title'] == 'Medium'
        assert sorted_results[2]['title'] == 'Old'
    
    @pytest.mark.asyncio
    async def test_sort_results_by_citations(self, searcher):
        """Test sorting results by citation count"""
        results = [
            {'title': 'Low', 'citation_count': 10},
            {'title': 'High', 'citation_count': 100},
            {'title': 'Medium', 'citation_count': 50},
        ]
        
        sorted_results = searcher._sort_results(results, 'citations')
        
        assert sorted_results[0]['title'] == 'High'
        assert sorted_results[1]['title'] == 'Medium'
        assert sorted_results[2]['title'] == 'Low'
    
    @pytest.mark.asyncio
    async def test_sort_results_by_relevance(self, searcher):
        """Test sorting by relevance (maintains order)"""
        results = [
            {'title': 'First', 'publication_year': 2020},
            {'title': 'Second', 'publication_year': 2024},
            {'title': 'Third', 'publication_year': 2022},
        ]
        
        sorted_results = searcher._sort_results(results, 'relevance')
        
        # Should maintain original order
        assert sorted_results[0]['title'] == 'First'
        assert sorted_results[1]['title'] == 'Second'
        assert sorted_results[2]['title'] == 'Third'
    
    @pytest.mark.asyncio
    async def test_invalid_source(self, searcher):
        """Test handling of invalid source"""
        results = await searcher.search('test query', 'invalid_source')
        assert results == []


class TestPubMedSearch:
    """Unit tests for PubMed Central search"""
    
    @pytest.mark.asyncio
    async def test_pubmed_search_success(self):
        """Test successful PubMed search"""
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                # Mock search response
                mock_search_response = AsyncMock()
                mock_search_response.status = 200
                mock_search_response.json = AsyncMock(return_value={
                    'esearchresult': {'idlist': ['12345', '67890']}
                })
                
                # Mock fetch response
                mock_fetch_response = AsyncMock()
                mock_fetch_response.status = 200
                mock_fetch_response.json = AsyncMock(return_value={
                    'result': {
                        '12345': {
                            'title': 'Test Article',
                            'pubdate': '2024 Jan',
                            'authors': [{'name': 'John Doe'}],
                            'fulljournalname': 'Test Journal'
                        },
                        '67890': {
                            'title': 'Another Article',
                            'pubdate': '2023 Dec',
                            'authors': [{'name': 'Jane Smith'}],
                            'fulljournalname': 'Science Journal'
                        }
                    }
                })
                
                mock_get.return_value.__aenter__.side_effect = [
                    mock_search_response,
                    mock_fetch_response
                ]
                
                results = await searcher._search_pubmed_central(
                    'artificial intelligence',
                    max_results=10,
                    start_year=None,
                    end_year=None,
                    sort_by='relevance'
                )
                
                assert len(results) == 2
                assert results[0]['title'] == 'Test Article'
                assert results[0]['source'] == 'PubMed Central'
                assert results[1]['title'] == 'Another Article'
    
    @pytest.mark.asyncio
    async def test_pubmed_search_empty_results(self):
        """Test PubMed search with no results"""
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                mock_response = AsyncMock()
                mock_response.status = 200
                mock_response.json = AsyncMock(return_value={
                    'esearchresult': {'idlist': []}
                })
                
                mock_get.return_value.__aenter__.return_value = mock_response
                
                results = await searcher._search_pubmed_central(
                    'nonexistent query xyz123',
                    max_results=10,
                    start_year=None,
                    end_year=None
                )
                
                assert results == []
    
    @pytest.mark.asyncio
    async def test_pubmed_search_api_error(self):
        """Test PubMed search API error handling"""
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                mock_response = AsyncMock()
                mock_response.status = 500
                
                mock_get.return_value.__aenter__.return_value = mock_response
                
                results = await searcher._search_pubmed_central(
                    'test query',
                    max_results=10,
                    start_year=None,
                    end_year=None
                )
                
                assert results == []


class TestArxivSearch:
    """Unit tests for arXiv search"""
    
    @pytest.mark.asyncio
    async def test_arxiv_search_success(self):
        """Test successful arXiv search"""
        mock_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
                <id>http://arxiv.org/abs/2401.12345</id>
                <title>Test Paper Title</title>
                <summary>This is a test abstract</summary>
                <author><name>John Doe</name></author>
                <published>2024-01-15T00:00:00Z</published>
                <category term="cs.AI"/>
            </entry>
        </feed>
        """
        
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                mock_response = AsyncMock()
                mock_response.status = 200
                mock_response.text = AsyncMock(return_value=mock_xml)
                
                mock_get.return_value.__aenter__.return_value = mock_response
                
                results = await searcher._search_arxiv(
                    'machine learning',
                    max_results=10,
                    sort_by='relevance'
                )
                
                assert len(results) == 1
                assert results[0]['title'] == 'Test Paper Title'
                assert results[0]['source'] == 'arXiv'
                assert results[0]['file_type'] == 'pdf'
                assert results[0]['direct_download'] is True
    
    @pytest.mark.asyncio
    async def test_arxiv_search_multiple_authors(self):
        """Test arXiv with multiple authors"""
        mock_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
                <id>http://arxiv.org/abs/2401.12345</id>
                <title>Multi-Author Paper</title>
                <summary>Abstract text</summary>
                <author><name>Alice</name></author>
                <author><name>Bob</name></author>
                <author><name>Charlie</name></author>
                <published>2024-01-15T00:00:00Z</published>
                <category term="cs.AI"/>
            </entry>
        </feed>
        """
        
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                mock_response = AsyncMock()
                mock_response.status = 200
                mock_response.text = AsyncMock(return_value=mock_xml)
                
                mock_get.return_value.__aenter__.return_value = mock_response
                
                results = await searcher._search_arxiv('test', max_results=10)
                
                assert len(results[0]['authors']) == 3
                assert 'Alice' in results[0]['authors']
                assert 'Bob' in results[0]['authors']
                assert 'Charlie' in results[0]['authors']


class TestSemanticScholarSearch:
    """Unit tests for Semantic Scholar search"""
    
    @pytest.mark.asyncio
    async def test_semantic_scholar_success(self):
        """Test successful Semantic Scholar search"""
        mock_response_data = {
            'data': [
                {
                    'paperId': 'abc123',
                    'title': 'AI Research Paper',
                    'abstract': 'This paper discusses AI',
                    'authors': [{'name': 'Dr. Smith'}],
                    'year': 2024,
                    'publicationDate': '2024-01-15',
                    'venue': 'NeurIPS',
                    'url': 'https://example.com/paper',
                    'citationCount': 42,
                    'openAccessPdf': {'url': 'https://example.com/paper.pdf'}
                }
            ]
        }
        
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                mock_response = AsyncMock()
                mock_response.status = 200
                mock_response.json = AsyncMock(return_value=mock_response_data)
                
                mock_get.return_value.__aenter__.return_value = mock_response
                
                # Need to wait for the sleep
                with patch('asyncio.sleep', new_callable=AsyncMock):
                    results = await searcher._search_semantic_scholar(
                        'AI',
                        max_results=10,
                        sort_by='relevance'
                    )
                
                assert len(results) == 1
                assert results[0]['title'] == 'AI Research Paper'
                assert results[0]['citation_count'] == 42
                assert results[0]['source'] == 'Semantic Scholar'
    
    @pytest.mark.asyncio
    async def test_semantic_scholar_no_open_access(self):
        """Test Semantic Scholar filters out non-open-access papers"""
        mock_response_data = {
            'data': [
                {
                    'paperId': 'abc123',
                    'title': 'Paywalled Paper',
                    'abstract': 'Not free',
                    'authors': [{'name': 'Dr. Smith'}],
                    'year': 2024,
                    'openAccessPdf': None  # No open access
                }
            ]
        }
        
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                mock_response = AsyncMock()
                mock_response.status = 200
                mock_response.json = AsyncMock(return_value=mock_response_data)
                
                mock_get.return_value.__aenter__.return_value = mock_response
                
                with patch('asyncio.sleep', new_callable=AsyncMock):
                    results = await searcher._search_semantic_scholar('test', 10)
                
                # Should filter out papers without open access PDFs
                assert len(results) == 0
    
    @pytest.mark.asyncio
    async def test_semantic_scholar_rate_limit_retry(self):
        """Test Semantic Scholar retry on rate limit"""
        async with KnowledgeSearcher() as searcher:
            with patch.object(searcher.session, 'get') as mock_get:
                # First call: rate limited
                mock_rate_limit_response = AsyncMock()
                mock_rate_limit_response.status = 429
                
                # Second call: success
                mock_success_response = AsyncMock()
                mock_success_response.status = 200
                mock_success_response.json = AsyncMock(return_value={'data': []})
                
                mock_get.return_value.__aenter__.side_effect = [
                    mock_rate_limit_response,
                    mock_success_response
                ]
                
                with patch('asyncio.sleep', new_callable=AsyncMock) as mock_sleep:
                    results = await searcher._search_semantic_scholar('test', 10)
                    
                    # Should have retried with backoff
                    assert mock_sleep.call_count >= 2  # Initial delay + retry delay


class TestMultiSourceSearch:
    """Integration tests for multi-source searching"""
    
    @pytest.mark.asyncio
    async def test_search_multiple_sources(self):
        """Test searching multiple sources concurrently"""
        with patch('knowledge_search.KnowledgeSearcher') as MockSearcher:
            mock_searcher = MockSearcher.return_value
            mock_searcher.__aenter__ = AsyncMock(return_value=mock_searcher)
            mock_searcher.__aexit__ = AsyncMock()
            
            # Mock each search method
            mock_searcher.search = AsyncMock(side_effect=[
                [{'title': 'PMC Result', 'source': 'PubMed Central'}],
                [{'title': 'arXiv Result', 'source': 'arXiv'}]
            ])
            
            results = await search_knowledge_sources(
                query='test',
                sources=['pubmed_central', 'arxiv'],
                max_results_per_source=10
            )
            
            assert 'pubmed_central' in results
            assert 'arxiv' in results
    
    @pytest.mark.asyncio
    async def test_search_with_exception_handling(self):
        """Test that exceptions in one source don't affect others"""
        with patch('knowledge_search.KnowledgeSearcher') as MockSearcher:
            mock_searcher = MockSearcher.return_value
            mock_searcher.__aenter__ = AsyncMock(return_value=mock_searcher)
            mock_searcher.__aexit__ = AsyncMock()
            
            # First source fails, second succeeds
            mock_searcher.search = AsyncMock(side_effect=[
                Exception("API Error"),
                [{'title': 'arXiv Result'}]
            ])
            
            results = await search_knowledge_sources(
                query='test',
                sources=['pubmed_central', 'arxiv'],
                max_results_per_source=10
            )
            
            # Failed source should return empty list
            assert results['pubmed_central'] == []
            assert len(results['arxiv']) == 1


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])

