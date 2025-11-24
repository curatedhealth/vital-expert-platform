"""
Integration Test for GraphRAG Service
End-to-end tests for complete GraphRAG flow
"""

import pytest
from uuid import UUID
from unittest.mock import AsyncMock, MagicMock, patch

from src.graphrag.models import GraphRAGRequest
from src.graphrag.service import GraphRAGService


@pytest.mark.asyncio
class TestGraphRAGServiceIntegration:
    """Integration tests for GraphRAG service"""
    
    async def test_graphrag_query_vector_only(self, sample_agent_id, sample_session_id, sample_rag_profile, sample_context_chunks, mock_embedding):
        """Test GraphRAG query with vector search only"""
        
        # Mock dependencies
        with patch('src.graphrag.service.get_profile_resolver') as mock_profile_resolver, \
             patch('src.graphrag.service.get_kg_view_resolver') as mock_kg_resolver, \
             patch('src.graphrag.service.get_vector_search') as mock_vector_search, \
             patch('src.graphrag.service.get_keyword_search') as mock_keyword_search, \
             patch('src.graphrag.service.get_graph_search') as mock_graph_search, \
             patch('src.graphrag.service.get_hybrid_fusion') as mock_fusion:
            
            # Setup mocks
            mock_profile_resolver.return_value.resolve_profile = AsyncMock(return_value=sample_rag_profile)
            mock_kg_resolver.return_value.resolve_kg_view = AsyncMock(return_value=None)
            mock_vector_search.return_value.search = AsyncMock(return_value=sample_context_chunks)
            mock_keyword_search.return_value.search = AsyncMock(return_value=[])
            mock_graph_search.return_value.search = AsyncMock(return_value=([], []))
            mock_fusion.return_value.fuse = MagicMock(return_value=sample_context_chunks[:2])
            
            # Create service
            service = GraphRAGService()
            
            # Create request
            request = GraphRAGRequest(
                query="What are the treatment options for diabetes?",
                agent_id=sample_agent_id,
                session_id=sample_session_id,
                include_graph_evidence=True,
                include_citations=True
            )
            
            # Execute query
            response = await service.query(request)
            
            # Verify response
            assert response.query == request.query
            assert response.session_id == request.session_id
            assert len(response.context_chunks) > 0
            assert response.metadata.profile_used == sample_rag_profile.profile_name
            assert response.metadata.execution_time_ms > 0
    
    async def test_graphrag_query_with_citations(self, sample_agent_id, sample_session_id):
        """Test GraphRAG query includes citations"""
        
        # This test would require actual database connections
        # For now, it's a placeholder for future implementation
        pytest.skip("Requires actual database connections")
    
    async def test_graphrag_query_error_handling(self, sample_agent_id, sample_session_id):
        """Test GraphRAG query error handling"""
        
        with patch('src.graphrag.service.get_profile_resolver') as mock_resolver:
            # Mock profile resolver to raise error
            mock_resolver.return_value.resolve_profile = AsyncMock(side_effect=Exception("Database error"))
            
            service = GraphRAGService()
            
            request = GraphRAGRequest(
                query="Test query",
                agent_id=sample_agent_id,
                session_id=sample_session_id
            )
            
            # Should not raise, but return empty response
            response = await service.query(request)
            
            assert response.query == request.query
            assert len(response.context_chunks) == 0
            assert response.metadata.total_results_count == 0

