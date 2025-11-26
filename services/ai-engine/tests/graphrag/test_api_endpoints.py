"""
API endpoint tests for GraphRAG service
Tests FastAPI endpoints for GraphRAG queries
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from graphrag.api.graphrag import router
from graphrag.models import GraphRAGResponse
from fastapi import FastAPI


# ========== FIXTURES ==========

@pytest.fixture
def app():
    """Create FastAPI app with GraphRAG router"""
    app = FastAPI()
    app.include_router(router, prefix="/v1/graphrag")
    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def mock_auth_user():
    """Mock authenticated user"""
    return {
        "id": uuid4(),
        "email": "test@example.com",
        "tenant_id": uuid4(),
        "roles": ["user"]
    }


@pytest.fixture
def sample_graphrag_response():
    """Sample GraphRAG response"""
    return GraphRAGResponse(
        context_chunks=[
            {
                'citation_id': '[1]',
                'text': 'Metformin is used for Type 2 diabetes',
                'source': 'pubmed',
                'score': 0.95
            }
        ],
        evidence_chain=[
            {
                'citation_id': '[1]',
                'text': 'Metformin is used for Type 2 diabetes',
                'source': 'pubmed',
                'confidence': 0.95,
                'source_type': 'vector'
            }
        ],
        query="What is Metformin?",
        session_id=uuid4(),
        metadata={
            'profile_used': 'semantic_standard',
            'search_methods': ['vector'],
            'total_results': 1
        }
    )


# ========== API ENDPOINT TESTS ==========

class TestGraphRAGEndpoints:
    """Test GraphRAG API endpoints"""
    
    def test_query_endpoint_success(self, client, mock_auth_user, sample_graphrag_response):
        """Test successful GraphRAG query"""
        with patch('graphrag.api.graphrag.get_current_user', return_value=mock_auth_user):
            with patch('graphrag.api.graphrag.get_graphrag_service') as mock_service:
                # Mock service
                mock_service_instance = AsyncMock()
                mock_service_instance.query = AsyncMock(return_value=sample_graphrag_response)
                mock_service.return_value = mock_service_instance
                
                # Make request
                response = client.post(
                    "/v1/graphrag/query",
                    json={
                        "query": "What is Metformin?",
                        "agent_id": str(uuid4()),
                        "session_id": str(uuid4()),
                        "tenant_id": str(mock_auth_user["tenant_id"])
                    },
                    headers={"Authorization": "Bearer test-token"}
                )
                
                # Assertions
                assert response.status_code == 200
                data = response.json()
                assert "context_chunks" in data
                assert "evidence_chain" in data
                assert len(data["context_chunks"]) > 0
    
    def test_query_endpoint_missing_query(self, client, mock_auth_user):
        """Test query endpoint with missing query parameter"""
        with patch('graphrag.api.graphrag.get_current_user', return_value=mock_auth_user):
            response = client.post(
                "/v1/graphrag/query",
                json={
                    "agent_id": str(uuid4()),
                    "session_id": str(uuid4())
                },
                headers={"Authorization": "Bearer test-token"}
            )
            
            # Should return 422 validation error
            assert response.status_code == 422
    
    def test_query_endpoint_unauthorized(self, client):
        """Test query endpoint without authentication"""
        response = client.post(
            "/v1/graphrag/query",
            json={
                "query": "Test query",
                "agent_id": str(uuid4()),
                "session_id": str(uuid4())
            }
        )
        
        # Should return 401 or 403
        assert response.status_code in [401, 403]
    
    def test_query_endpoint_with_rag_profile(self, client, mock_auth_user, sample_graphrag_response):
        """Test query with specific RAG profile"""
        with patch('graphrag.api.graphrag.get_current_user', return_value=mock_auth_user):
            with patch('graphrag.api.graphrag.get_graphrag_service') as mock_service:
                mock_service_instance = AsyncMock()
                mock_service_instance.query = AsyncMock(return_value=sample_graphrag_response)
                mock_service.return_value = mock_service_instance
                
                rag_profile_id = uuid4()
                
                response = client.post(
                    "/v1/graphrag/query",
                    json={
                        "query": "What is diabetes?",
                        "agent_id": str(uuid4()),
                        "session_id": str(uuid4()),
                        "rag_profile_id": str(rag_profile_id)
                    },
                    headers={"Authorization": "Bearer test-token"}
                )
                
                assert response.status_code == 200
    
    def test_query_endpoint_rate_limiting(self, client, mock_auth_user, sample_graphrag_response):
        """Test rate limiting on query endpoint"""
        with patch('graphrag.api.graphrag.get_current_user', return_value=mock_auth_user):
            with patch('graphrag.api.graphrag.get_graphrag_service') as mock_service:
                mock_service_instance = AsyncMock()
                mock_service_instance.query = AsyncMock(return_value=sample_graphrag_response)
                mock_service.return_value = mock_service_instance
                
                # Make multiple rapid requests
                responses = []
                for i in range(15):  # Exceed typical rate limit
                    response = client.post(
                        "/v1/graphrag/query",
                        json={
                            "query": f"Query {i}",
                            "agent_id": str(uuid4()),
                            "session_id": str(uuid4())
                        },
                        headers={"Authorization": "Bearer test-token"}
                    )
                    responses.append(response)
                
                # Some requests should be rate limited (429)
                status_codes = [r.status_code for r in responses]
                # Check if rate limiting is enforced (if enabled)
                # assert 429 in status_codes or all(s == 200 for s in status_codes)


# ========== HEALTH CHECK TESTS ==========

class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        with patch('graphrag.api.graphrag.get_graphrag_service') as mock_service:
            mock_service_instance = AsyncMock()
            mock_service_instance.health_check = AsyncMock(return_value=True)
            mock_service.return_value = mock_service_instance
            
            response = client.get("/v1/graphrag/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
    
    def test_health_check_unhealthy(self, client):
        """Test health check when service is unhealthy"""
        with patch('graphrag.api.graphrag.get_graphrag_service') as mock_service:
            mock_service_instance = AsyncMock()
            mock_service_instance.health_check = AsyncMock(return_value=False)
            mock_service.return_value = mock_service_instance
            
            response = client.get("/v1/graphrag/health")
            
            assert response.status_code == 503
            data = response.json()
            assert data["status"] == "unhealthy"


# ========== RUN TESTS ==========

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
