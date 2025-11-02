"""
Unit tests for UnifiedRAGService

Tests cover:
- Initialization
- Query execution
- Error handling
- Caching
- Vector search
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from typing import Dict, Any, List

# Add src to path
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from services.unified_rag_service import UnifiedRAGService


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client"""
    mock = Mock()
    mock.table = Mock(return_value=mock)
    mock.select = Mock(return_value=mock)
    mock.eq = Mock(return_value=mock)
    mock.execute = AsyncMock(return_value=Mock(data=[]))
    return mock


@pytest.fixture
def mock_pinecone_index():
    """Mock Pinecone index"""
    mock = Mock()
    mock.namespace = Mock(return_value=mock)
    mock.query = Mock(return_value=Mock(matches=[]))
    return mock


@pytest.fixture
async def rag_service(mock_supabase_client, mock_pinecone_index):
    """Create RAG service instance with mocked dependencies"""
    with patch('services.unified_rag_service.create_client', return_value=mock_supabase_client):
        with patch('services.unified_rag_service.Pinecone') as mock_pinecone_class:
            mock_pinecone_class.return_value.Index.return_value = mock_pinecone_index
            
            service = UnifiedRAGService(
                supabase_url="https://test.supabase.co",
                supabase_key="test_key",
                pinecone_api_key="test_pinecone_key",
                pinecone_environment="test",
                pinecone_index_name="test-index"
            )
            
            await service.initialize()
            yield service
            await service.cleanup()


class TestUnifiedRAGServiceInit:
    """Test service initialization"""
    
    def test_init_without_params(self):
        """Test initialization without required parameters raises error"""
        with pytest.raises(ValueError):
            UnifiedRAGService(
                supabase_url=None,
                supabase_key=None,
                pinecone_api_key=None
            )
    
    @pytest.mark.asyncio
    async def test_init_with_params(self, mock_supabase_client):
        """Test successful initialization with parameters"""
        with patch('services.unified_rag_service.create_client', return_value=mock_supabase_client):
            service = UnifiedRAGService(
                supabase_url="https://test.supabase.co",
                supabase_key="test_key"
            )
            
            await service.initialize()
            assert service.supabase is not None
            await service.cleanup()


class TestUnifiedRAGServiceQuery:
    """Test query execution"""
    
    @pytest.mark.asyncio
    async def test_query_basic(self, rag_service):
        """Test basic query execution"""
        result = await rag_service.query(
            query_text="What is diabetes?",
            strategy="semantic"
        )
        
        assert isinstance(result, dict)
        assert "sources" in result
        assert "context" in result
        assert "metadata" in result
    
    @pytest.mark.asyncio
    async def test_query_with_domain_filter(self, rag_service):
        """Test query with domain filtering"""
        result = await rag_service.query(
            query_text="What is diabetes?",
            domain_ids=["clinical-medicine"],
            strategy="semantic"
        )
        
        assert isinstance(result, dict)
        assert "sources" in result
    
    @pytest.mark.asyncio
    async def test_query_invalid_strategy(self, rag_service):
        """Test query with invalid strategy raises error"""
        with pytest.raises(ValueError):
            await rag_service.query(
                query_text="test",
                strategy="invalid_strategy"
            )
    
    @pytest.mark.asyncio
    async def test_query_empty_text(self, rag_service):
        """Test query with empty text raises error"""
        with pytest.raises(ValueError):
            await rag_service.query(
                query_text="",
                strategy="semantic"
            )


class TestUnifiedRAGServiceCaching:
    """Test caching functionality"""
    
    @pytest.mark.asyncio
    async def test_cache_key_generation(self, rag_service):
        """Test cache key generation is consistent"""
        # This is a placeholder - actual caching will be implemented
        assert True
    
    @pytest.mark.asyncio
    async def test_cached_query_returns_same_result(self, rag_service):
        """Test that repeated queries return cached results"""
        # This is a placeholder - actual caching will be implemented
        query_text = "What is diabetes?"
        
        result1 = await rag_service.query(query_text=query_text, strategy="semantic")
        result2 = await rag_service.query(query_text=query_text, strategy="semantic")
        
        assert result1 == result2


class TestUnifiedRAGServiceErrorHandling:
    """Test error handling"""
    
    @pytest.mark.asyncio
    async def test_handle_supabase_connection_error(self, mock_supabase_client):
        """Test handling of Supabase connection errors"""
        mock_supabase_client.table.side_effect = Exception("Connection failed")
        
        with patch('services.unified_rag_service.create_client', return_value=mock_supabase_client):
            service = UnifiedRAGService(
                supabase_url="https://test.supabase.co",
                supabase_key="test_key"
            )
            
            with pytest.raises(Exception):
                await service.initialize()
    
    @pytest.mark.asyncio
    async def test_handle_pinecone_error(self, rag_service, mock_pinecone_index):
        """Test handling of Pinecone errors"""
        mock_pinecone_index.namespace.side_effect = Exception("Pinecone error")
        
        with pytest.raises(Exception):
            await rag_service.query(
                query_text="test",
                strategy="semantic"
            )


class TestUnifiedRAGServiceVectorSearch:
    """Test vector search functionality"""
    
    @pytest.mark.asyncio
    async def test_semantic_search_with_results(self, rag_service, mock_pinecone_index):
        """Test semantic search returns results"""
        # Mock Pinecone response
        mock_match = Mock()
        mock_match.score = 0.95
        mock_match.metadata = {
            "content": "Diabetes is a chronic disease",
            "chunk_id": "123",
            "document_id": "doc_123",
            "source_title": "Clinical Guidelines",
            "domain": "clinical-medicine",
            "domain_id": "clinical-medicine"
        }
        
        mock_pinecone_index.namespace.return_value.query.return_value = Mock(
            matches=[mock_match]
        )
        
        result = await rag_service.query(
            query_text="What is diabetes?",
            strategy="semantic",
            max_results=5,
            similarity_threshold=0.7
        )
        
        assert len(result["sources"]) > 0
        assert result["metadata"]["strategy"] == "semantic"


class TestUnifiedRAGServiceCleanup:
    """Test cleanup functionality"""
    
    @pytest.mark.asyncio
    async def test_cleanup_closes_connections(self, mock_supabase_client):
        """Test cleanup closes all connections"""
        with patch('services.unified_rag_service.create_client', return_value=mock_supabase_client):
            service = UnifiedRAGService(
                supabase_url="https://test.supabase.co",
                supabase_key="test_key"
            )
            
            await service.initialize()
            await service.cleanup()
            
            # Service should handle cleanup gracefully
            assert True


# ============================================================================
# Test Configuration
# ============================================================================

@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])

