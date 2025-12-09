"""
Unit Tests for Pinecone Sync Service

Tests for:
- Full sync operations
- Single agent sync
- Embedding generation
- Vector search
- Index management
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime

import sys
sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src')


class TestPineconeSyncServiceInit:
    """Tests for PineconeSyncService initialization."""
    
    def test_init_basic(self, mock_supabase_client):
        """Test basic initialization."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            
            service = PineconeSyncService(
                supabase_client=mock_supabase_client,
                pinecone_index_name="test-index",
            )
            
            assert service.supabase is not None
            assert service.index_name == "test-index"
    
    def test_init_without_pinecone(self, mock_supabase_client):
        """Test initialization when Pinecone unavailable."""
        # Import with mocked pinecone that raises
        with patch.dict('sys.modules', {'pinecone': None}):
            # Force reimport
            import importlib
            import services.pinecone_sync_service as pss
            importlib.reload(pss)
            
            service = pss.PineconeSyncService(mock_supabase_client)
            
            assert service.pc is None
            assert service.index is None


class TestPineconeBuildEmbeddingText:
    """Tests for embedding text generation."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            return service
    
    def test_build_embedding_text_full(self, service, mock_agent):
        """Test building embedding text with full agent data."""
        text = service._build_embedding_text(mock_agent)
        
        assert "Regulatory Expert" in text
        assert len(text) > 50
    
    def test_build_embedding_text_minimal(self, service):
        """Test building embedding text with minimal data."""
        minimal_agent = {"id": "test", "name": "Test Agent"}
        
        text = service._build_embedding_text(minimal_agent)
        
        assert "Test Agent" in text
    
    def test_build_embedding_text_with_capabilities(self, service, mock_agent):
        """Test embedding text includes capabilities."""
        mock_agent["capabilities"] = ["510k_review", "ema_submissions"]
        
        text = service._build_embedding_text(mock_agent)
        
        assert "Capabilities" in text or "510k_review" in text


class TestPineconeGenerateEmbeddings:
    """Tests for embedding generation."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_openai_client):
        """Create service with mocked OpenAI."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.openai_client = mock_openai_client
            return service
    
    @pytest.mark.asyncio
    async def test_generate_embeddings_single(self, service):
        """Test generating single embedding."""
        embeddings = await service._generate_embeddings(["Test text"])
        
        assert len(embeddings) == 1
        assert len(embeddings[0]) == 3072
    
    @pytest.mark.asyncio
    async def test_generate_embeddings_batch(self, service):
        """Test generating batch embeddings."""
        texts = ["Text 1", "Text 2", "Text 3"]
        
        # Mock multiple embeddings
        service.openai_client.embeddings.create = AsyncMock(return_value=MagicMock(
            data=[MagicMock(embedding=[0.1] * 3072) for _ in texts]
        ))
        
        embeddings = await service._generate_embeddings(texts)
        
        assert len(embeddings) == 3
    
    @pytest.mark.asyncio
    async def test_generate_embeddings_empty(self, service):
        """Test generating embeddings with empty input."""
        embeddings = await service._generate_embeddings([])
        
        assert embeddings == []
    
    @pytest.mark.asyncio
    async def test_generate_embeddings_no_client(self, mock_supabase_client):
        """Test embedding generation without OpenAI client."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.openai_client = None
            
            embeddings = await service._generate_embeddings(["Test"])
            
            assert embeddings == []


class TestPineconeSyncOperations:
    """Tests for sync operations."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_pinecone_index, mock_openai_client):
        """Create service with mocked dependencies."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.index = mock_pinecone_index
            service.openai_client = mock_openai_client
            return service
    
    @pytest.mark.asyncio
    async def test_sync_all(self, service, mock_tenant_id):
        """Test full sync operation."""
        result = await service.sync_all(mock_tenant_id)
        
        assert "agents_synced" in result
        assert "embeddings_generated" in result
        assert "started_at" in result
    
    @pytest.mark.asyncio
    async def test_sync_single_agent(self, service, mock_agent_id):
        """Test single agent sync."""
        result = await service.sync_single_agent(mock_agent_id)
        
        assert "success" in result
    
    @pytest.mark.asyncio
    async def test_sync_single_agent_not_found(self, mock_pinecone_index, mock_openai_client):
        """Test sync for non-existent agent."""
        # Create a fresh mock that returns None
        empty_mock = MagicMock()
        empty_result = MagicMock()
        empty_result.data = None
        empty_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = empty_result
        
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(empty_mock)
            service.index = mock_pinecone_index
            service.openai_client = mock_openai_client
        
        result = await service.sync_single_agent("non-existent")
        
        assert result["success"] is False
        assert "not found" in result["error"].lower()


class TestPineconeSearch:
    """Tests for vector search."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_pinecone_index, mock_openai_client):
        """Create service with mocked dependencies."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.index = mock_pinecone_index
            service.openai_client = mock_openai_client
            return service
    
    @pytest.mark.asyncio
    async def test_search_similar(self, service, mock_tenant_id):
        """Test similarity search."""
        results = await service.search_similar(
            query="regulatory requirements",
            tenant_id=mock_tenant_id,
            top_k=5,
        )
        
        assert isinstance(results, list)
        if results:
            assert "agent_id" in results[0]
            assert "score" in results[0]
    
    @pytest.mark.asyncio
    async def test_search_similar_with_filter(self, service, mock_tenant_id):
        """Test search with metadata filter."""
        results = await service.search_similar(
            query="clinical trials",
            tenant_id=mock_tenant_id,
            top_k=10,
            filter_metadata={"level": 2},
        )
        
        assert isinstance(results, list)
    
    @pytest.mark.asyncio
    async def test_search_similar_no_index(self, mock_supabase_client):
        """Test search without index."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.index = None
            
            results = await service.search_similar("test", "tenant-id")
            
            assert results == []


class TestPineconeSyncStatus:
    """Tests for sync status."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_pinecone_index):
        """Create service with mocked index."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.index = mock_pinecone_index
            return service
    
    @pytest.mark.asyncio
    async def test_get_sync_status(self, service):
        """Test getting sync status."""
        result = await service.get_sync_status()
        
        assert result["connected"] is True
        assert "total_vectors" in result
        assert "dimension" in result
    
    @pytest.mark.asyncio
    async def test_get_sync_status_no_index(self, mock_supabase_client):
        """Test status without index."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.index = None
            
            result = await service.get_sync_status()
            
            assert result["connected"] is False


class TestPineconeDeleteAgent:
    """Tests for agent deletion."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_pinecone_index):
        """Create service with mocked index."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.index = mock_pinecone_index
            return service
    
    @pytest.mark.asyncio
    async def test_delete_agent(self, service, mock_agent_id):
        """Test deleting agent from index."""
        result = await service.delete_agent(mock_agent_id, "global")
        
        assert result["success"] is True
        service.index.delete.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_delete_agent_no_index(self, mock_supabase_client, mock_agent_id):
        """Test deletion without index."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.index = None
            
            result = await service.delete_agent(mock_agent_id)
            
            assert result["success"] is False
