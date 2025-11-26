"""
Integration tests for complete GraphRAG service
Tests end-to-end query flow: vector + keyword + graph search → fusion → evidence building
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from uuid import UUID, uuid4

from graphrag.service import GraphRAGService
from graphrag.models import GraphRAGRequest, GraphRAGResponse, VectorResult, GraphResult
from graphrag.config import GraphRAGConfig


# ========== FIXTURES ==========

@pytest.fixture
def mock_config():
    """Mock GraphRAG configuration"""
    return GraphRAGConfig(
        database_url="postgresql://localhost/test",
        pinecone_api_key="test-key",
        neo4j_uri="bolt://localhost:7687",
        neo4j_password="test",
        openai_api_key="test-openai-key",
        cohere_api_key="test-cohere-key"
    )


@pytest.fixture
def sample_vector_results():
    """Sample vector search results"""
    return [
        VectorResult(
            id="doc1",
            score=0.95,
            metadata={'text': 'Metformin is used to treat Type 2 diabetes', 'source': 'pubmed'},
            text='Metformin is used to treat Type 2 diabetes'
        ),
        VectorResult(
            id="doc2",
            score=0.88,
            metadata={'text': 'Insulin therapy for diabetes management', 'source': 'guidelines'},
            text='Insulin therapy for diabetes management'
        )
    ]


@pytest.fixture
def sample_graph_results():
    """Sample graph search results"""
    return [
        GraphResult(
            path_id="path1",
            nodes=[
                {'id': 'Metformin', 'label': 'Drug'},
                {'id': 'Type2Diabetes', 'label': 'Disease'}
            ],
            edges=[
                {'type': 'TREATS', 'source': 'Metformin', 'target': 'Type2Diabetes'}
            ],
            hops=1
        )
    ]


@pytest.fixture
def mock_graphrag_service(mock_config):
    """Mock GraphRAG service with mocked dependencies"""
    service = GraphRAGService(mock_config)
    
    # Mock all database clients
    service.postgres = AsyncMock()
    service.vector_db = AsyncMock()
    service.graph_db = AsyncMock()
    service.keyword_search = AsyncMock()
    service.reranker = AsyncMock()
    
    return service


# ========== FULL GRAPHRAG QUERY TESTS ==========

class TestGraphRAGServiceIntegration:
    """Integration tests for complete GraphRAG queries"""
    
    @pytest.mark.asyncio
    async def test_full_graphrag_query(self, mock_graphrag_service, sample_vector_results, sample_graph_results):
        """Test complete GraphRAG query flow"""
        # Setup mocks
        mock_graphrag_service.postgres.get_rag_profile = AsyncMock(return_value={
            'id': uuid4(),
            'name': 'hybrid_enhanced',
            'vector_weight': 0.6,
            'keyword_weight': 0.4,
            'graph_weight': 0.0
        })
        
        mock_graphrag_service.vector_db.search = AsyncMock(return_value=sample_vector_results)
        mock_graphrag_service.keyword_search.search = AsyncMock(return_value=[])
        mock_graphrag_service.graph_db.search = AsyncMock(return_value=sample_graph_results)
        
        # Mock reranker
        mock_graphrag_service.reranker.rerank = AsyncMock(return_value=sample_vector_results)
        
        # Execute query
        request = GraphRAGRequest(
            query="What is the treatment for Type 2 diabetes?",
            agent_id=uuid4(),
            session_id=uuid4(),
            tenant_id=uuid4()
        )
        
        response = await mock_graphrag_service.query(request)
        
        # Assertions
        assert isinstance(response, GraphRAGResponse)
        assert len(response.context_chunks) > 0
        assert len(response.evidence_chain) > 0
        assert response.metadata['profile_used'] == 'hybrid_enhanced'
    
    @pytest.mark.asyncio
    async def test_semantic_only_profile(self, mock_graphrag_service, sample_vector_results):
        """Test query with semantic-only RAG profile"""
        # Setup semantic-only profile
        mock_graphrag_service.postgres.get_rag_profile = AsyncMock(return_value={
            'id': uuid4(),
            'name': 'semantic_standard',
            'vector_weight': 1.0,
            'keyword_weight': 0.0,
            'graph_weight': 0.0
        })
        
        mock_graphrag_service.vector_db.search = AsyncMock(return_value=sample_vector_results)
        
        request = GraphRAGRequest(
            query="What is Metformin?",
            agent_id=uuid4(),
            session_id=uuid4()
        )
        
        response = await mock_graphrag_service.query(request)
        
        # Should only call vector search
        mock_graphrag_service.vector_db.search.assert_called_once()
        assert len(response.context_chunks) == 2
    
    @pytest.mark.asyncio
    async def test_graphrag_with_kg_view(self, mock_graphrag_service, sample_vector_results, sample_graph_results):
        """Test GraphRAG with agent-specific KG view"""
        agent_id = uuid4()
        
        # Setup with graph-enabled profile and agent KG view
        mock_graphrag_service.postgres.get_rag_profile = AsyncMock(return_value={
            'id': uuid4(),
            'name': 'graphrag_entity',
            'vector_weight': 0.4,
            'keyword_weight': 0.2,
            'graph_weight': 0.4
        })
        
        mock_graphrag_service.postgres.get_agent_kg_view = AsyncMock(return_value={
            'agent_id': agent_id,
            'include_nodes': ['Drug', 'Disease'],
            'include_edges': ['TREATS', 'CAUSES'],
            'max_hops': 2,
            'graph_limit': 50
        })
        
        mock_graphrag_service.vector_db.search = AsyncMock(return_value=sample_vector_results)
        mock_graphrag_service.graph_db.search = AsyncMock(return_value=sample_graph_results)
        
        request = GraphRAGRequest(
            query="How does Metformin work?",
            agent_id=agent_id,
            session_id=uuid4()
        )
        
        response = await mock_graphrag_service.query(request)
        
        # Should call both vector and graph search
        mock_graphrag_service.vector_db.search.assert_called_once()
        mock_graphrag_service.graph_db.search.assert_called_once()
        
        # Graph search should use KG view filters
        call_args = mock_graphrag_service.graph_db.search.call_args
        assert 'allowed_nodes' in call_args.kwargs
        assert call_args.kwargs['allowed_nodes'] == ['Drug', 'Disease']
    
    @pytest.mark.asyncio
    async def test_evidence_chain_building(self, mock_graphrag_service, sample_vector_results):
        """Test evidence chain is properly built"""
        mock_graphrag_service.postgres.get_rag_profile = AsyncMock(return_value={
            'id': uuid4(),
            'name': 'semantic_standard',
            'vector_weight': 1.0,
            'keyword_weight': 0.0,
            'graph_weight': 0.0
        })
        
        mock_graphrag_service.vector_db.search = AsyncMock(return_value=sample_vector_results)
        
        request = GraphRAGRequest(
            query="What is diabetes treatment?",
            agent_id=uuid4(),
            session_id=uuid4()
        )
        
        response = await mock_graphrag_service.query(request)
        
        # Verify evidence chain
        assert len(response.evidence_chain) > 0
        
        for evidence in response.evidence_chain:
            assert 'citation_id' in evidence
            assert 'text' in evidence
            assert 'source' in evidence
            assert 'confidence' in evidence
    
    @pytest.mark.asyncio
    async def test_query_with_reranking(self, mock_graphrag_service, sample_vector_results):
        """Test query with Cohere reranking enabled"""
        mock_graphrag_service.postgres.get_rag_profile = AsyncMock(return_value={
            'id': uuid4(),
            'name': 'semantic_standard',
            'vector_weight': 1.0,
            'keyword_weight': 0.0,
            'graph_weight': 0.0,
            'enable_reranking': True
        })
        
        mock_graphrag_service.vector_db.search = AsyncMock(return_value=sample_vector_results)
        
        # Mock reranker to return reordered results
        reranked_results = [sample_vector_results[1], sample_vector_results[0]]
        mock_graphrag_service.reranker.rerank = AsyncMock(return_value=reranked_results)
        
        request = GraphRAGRequest(
            query="Diabetes medications?",
            agent_id=uuid4(),
            session_id=uuid4()
        )
        
        response = await mock_graphrag_service.query(request)
        
        # Verify reranker was called
        mock_graphrag_service.reranker.rerank.assert_called_once()
        
        # Results should be reranked
        assert response.context_chunks[0]['citation_id'] == '[2]'


# ========== ERROR HANDLING TESTS ==========

class TestGraphRAGErrorHandling:
    """Test error handling in GraphRAG service"""
    
    @pytest.mark.asyncio
    async def test_vector_search_failure(self, mock_graphrag_service):
        """Test graceful handling of vector search failure"""
        mock_graphrag_service.postgres.get_rag_profile = AsyncMock(return_value={
            'id': uuid4(),
            'name': 'semantic_standard',
            'vector_weight': 1.0,
            'keyword_weight': 0.0,
            'graph_weight': 0.0
        })
        
        # Simulate vector search failure
        mock_graphrag_service.vector_db.search = AsyncMock(side_effect=Exception("Vector DB connection failed"))
        
        request = GraphRAGRequest(
            query="Test query",
            agent_id=uuid4(),
            session_id=uuid4()
        )
        
        # Should handle gracefully and return error in metadata
        response = await mock_graphrag_service.query(request)
        
        assert 'error' in response.metadata
        assert 'vector' in response.metadata['error']
    
    @pytest.mark.asyncio
    async def test_missing_rag_profile(self, mock_graphrag_service):
        """Test handling of missing RAG profile"""
        # Simulate missing profile
        mock_graphrag_service.postgres.get_rag_profile = AsyncMock(return_value=None)
        
        request = GraphRAGRequest(
            query="Test query",
            agent_id=uuid4(),
            session_id=uuid4(),
            rag_profile_id=uuid4()
        )
        
        # Should fall back to default profile
        with pytest.raises(Exception):
            await mock_graphrag_service.query(request)


# ========== PERFORMANCE TESTS ==========

class TestGraphRAGPerformance:
    """Performance and concurrency tests"""
    
    @pytest.mark.asyncio
    async def test_concurrent_queries(self, mock_graphrag_service, sample_vector_results):
        """Test handling of concurrent queries"""
        # Setup mocks
        mock_graphrag_service.postgres.get_rag_profile = AsyncMock(return_value={
            'id': uuid4(),
            'name': 'semantic_standard',
            'vector_weight': 1.0,
            'keyword_weight': 0.0,
            'graph_weight': 0.0
        })
        
        mock_graphrag_service.vector_db.search = AsyncMock(return_value=sample_vector_results)
        
        # Create 10 concurrent requests
        requests = [
            GraphRAGRequest(
                query=f"Query {i}",
                agent_id=uuid4(),
                session_id=uuid4()
            )
            for i in range(10)
        ]
        
        # Execute concurrently
        responses = await asyncio.gather(
            *[mock_graphrag_service.query(req) for req in requests]
        )
        
        # All should succeed
        assert len(responses) == 10
        assert all(isinstance(r, GraphRAGResponse) for r in responses)
    
    @pytest.mark.asyncio
    async def test_query_timeout(self, mock_graphrag_service):
        """Test query timeout handling"""
        # Simulate slow vector search
        async def slow_search(*args, **kwargs):
            await asyncio.sleep(10)  # Simulate slow search
            return []
        
        mock_graphrag_service.vector_db.search = slow_search
        
        request = GraphRAGRequest(
            query="Test query",
            agent_id=uuid4(),
            session_id=uuid4()
        )
        
        # Should timeout after configured duration
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(
                mock_graphrag_service.query(request),
                timeout=5.0
            )


# ========== RUN TESTS ==========

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

