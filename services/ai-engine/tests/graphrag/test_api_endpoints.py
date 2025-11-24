"""
Test GraphRAG API Endpoints
Integration tests for FastAPI endpoints with TestClient
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from uuid import UUID

from src.graphrag.api.graphrag import router
from src.graphrag.models import GraphRAGResponse, GraphRAGMetadata, FusionWeights
from fastapi import FastAPI

# Create test app
app = FastAPI()
app.include_router(router)

client = TestClient(app)


class TestGraphRAGAPI:
    """Test suite for GraphRAG API endpoints"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        with patch('src.graphrag.api.graphrag.get_postgres_client') as mock_pg, \
             patch('src.graphrag.api.graphrag.get_vector_client') as mock_vector, \
             patch('src.graphrag.api.graphrag.get_neo4j_client') as mock_neo4j, \
             patch('src.graphrag.api.graphrag.get_elastic_client') as mock_elastic:
            
            # Mock health checks
            mock_pg_client = AsyncMock()
            mock_pg_client.health_check = AsyncMock(return_value=True)
            mock_pg.return_value = mock_pg_client
            
            mock_vector_client = AsyncMock()
            mock_vector_client.health_check = AsyncMock(return_value=True)
            mock_vector.return_value = mock_vector_client
            
            mock_neo4j_client = AsyncMock()
            mock_neo4j_client.health_check = AsyncMock(return_value=True)
            mock_neo4j.return_value = mock_neo4j_client
            
            mock_elastic_client = AsyncMock()
            mock_elastic_client.health_check = AsyncMock(return_value=True)
            mock_elastic.return_value = mock_elastic_client
            
            response = client.get("/v1/graphrag/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] in ["healthy", "degraded"]
            assert "components" in data
    
    def test_graphrag_query_requires_auth(self):
        """Test that GraphRAG query requires authentication"""
        response = client.post(
            "/v1/graphrag/query",
            json={
                "query": "test query",
                "agent_id": "12345678-1234-1234-1234-123456789012",
                "session_id": "87654321-4321-4321-4321-210987654321"
            }
        )
        
        # Should return 403 (forbidden) without auth token
        assert response.status_code == 403
    
    def test_graphrag_query_with_auth(self, sample_context_chunks):
        """Test GraphRAG query with authentication"""
        with patch('src.graphrag.api.graphrag.get_graphrag_service') as mock_service, \
             patch('src.graphrag.api.auth.get_current_active_user') as mock_auth:
            
            # Mock authentication
            mock_auth.return_value = {
                "id": UUID("12345678-1234-1234-1234-123456789012"),
                "email": "test@example.com",
                "tenant_id": UUID("87654321-4321-4321-4321-210987654321")
            }
            
            # Mock service response
            mock_graphrag_service = AsyncMock()
            mock_response = GraphRAGResponse(
                query="test query",
                context_chunks=sample_context_chunks[:2],
                evidence_chain=[],
                citations={},
                metadata=GraphRAGMetadata(
                    profile_used="hybrid_enhanced",
                    fusion_weights=FusionWeights(vector=0.6, keyword=0.4, graph=0.0),
                    vector_results_count=2,
                    keyword_results_count=0,
                    graph_results_count=0,
                    total_results_count=2,
                    rerank_applied=False,
                    execution_time_ms=100.0,
                    agent_kg_view_applied=False
                ),
                session_id=UUID("87654321-4321-4321-4321-210987654321")
            )
            mock_graphrag_service.query = AsyncMock(return_value=mock_response)
            mock_service.return_value = mock_graphrag_service
            
            response = client.post(
                "/v1/graphrag/query",
                json={
                    "query": "test query",
                    "agent_id": "12345678-1234-1234-1234-123456789012",
                    "session_id": "87654321-4321-4321-4321-210987654321"
                },
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["query"] == "test query"
            assert len(data["context_chunks"]) == 2
            assert data["metadata"]["profile_used"] == "hybrid_enhanced"
    
    def test_graphrag_query_validation(self):
        """Test request validation"""
        with patch('src.graphrag.api.auth.get_current_active_user') as mock_auth:
            mock_auth.return_value = {
                "id": UUID("12345678-1234-1234-1234-123456789012"),
                "email": "test@example.com"
            }
            
            # Missing required field
            response = client.post(
                "/v1/graphrag/query",
                json={
                    "query": "test",
                    # Missing agent_id and session_id
                },
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code == 422  # Validation error
    
    def test_list_profiles(self):
        """Test list RAG profiles endpoint"""
        with patch('src.graphrag.api.graphrag.get_postgres_client') as mock_pg:
            mock_pg_client = AsyncMock()
            mock_pg_client.fetch = AsyncMock(return_value=[
                {
                    "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                    "profile_name": "semantic_standard",
                    "strategy_type": "semantic_standard",
                    "top_k": 10,
                    "similarity_threshold": 0.7,
                    "enable_graph_search": False,
                    "enable_keyword_search": False,
                    "is_active": True
                }
            ])
            mock_pg.return_value = mock_pg_client
            
            response = client.get("/v1/graphrag/profiles")
            
            assert response.status_code == 200
            data = response.json()
            assert "profiles" in data
            assert data["count"] >= 0
    
    def test_get_agent_profile(self):
        """Test get agent profile endpoint"""
        agent_id = "12345678-1234-1234-1234-123456789012"
        
        with patch('src.graphrag.api.graphrag.get_profile_resolver') as mock_resolver:
            mock_profile = MagicMock()
            mock_profile.model_dump.return_value = {
                "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "profile_name": "hybrid_enhanced",
                "strategy_type": "hybrid_enhanced"
            }
            
            resolver = AsyncMock()
            resolver.resolve_profile = AsyncMock(return_value=mock_profile)
            mock_resolver.return_value = resolver
            
            response = client.get(f"/v1/graphrag/agents/{agent_id}/profile")
            
            assert response.status_code == 200
            data = response.json()
            assert "agent_id" in data
            assert "profile" in data
    
    def test_get_agent_kg_view(self):
        """Test get agent KG view endpoint"""
        agent_id = "12345678-1234-1234-1234-123456789012"
        
        with patch('src.graphrag.api.graphrag.get_kg_view_resolver') as mock_resolver:
            mock_kg_view = MagicMock()
            mock_kg_view.model_dump.return_value = {
                "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "agent_id": agent_id,
                "include_nodes": ["Drug", "Disease"],
                "include_edges": ["TREATS"],
                "max_hops": 2
            }
            
            resolver = AsyncMock()
            resolver.resolve_kg_view = AsyncMock(return_value=mock_kg_view)
            mock_resolver.return_value = resolver
            
            response = client.get(f"/v1/graphrag/agents/{agent_id}/kg-view")
            
            assert response.status_code == 200
            data = response.json()
            assert "agent_id" in data
            assert "kg_view" in data
    
    def test_rate_limit_headers(self):
        """Test rate limit headers are present"""
        # Note: This test would need the actual rate limit middleware
        # For now, it's a placeholder
        pytest.skip("Requires rate limit middleware integration")

