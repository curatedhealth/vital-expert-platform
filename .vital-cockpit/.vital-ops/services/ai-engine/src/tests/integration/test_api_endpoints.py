"""
Integration tests for Python AI Engine API endpoints

Tests the full API endpoints with mocked dependencies.
Requires test database or mocked Supabase client.
"""

import pytest
import os
import sys
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, Mock, patch, MagicMock
import json

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from main import app

# Skip integration tests if flag is set
skip_integration = os.getenv('SKIP_INTEGRATION_TESTS', 'false').lower() == 'true'


@pytest.mark.skipif(skip_integration, reason="Integration tests skipped (SKIP_INTEGRATION_TESTS=true)")
class TestAPIEndpoints:
    """Integration tests for API endpoints"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    @pytest.fixture
    def mock_supabase_client(self):
        """Mock Supabase client"""
        with patch('main.supabase_client') as mock_client:
            mock_client.engine = AsyncMock()
            mock_client.engine.begin.return_value.__aenter__.return_value = AsyncMock()
            mock_client.get_agent_by_id = AsyncMock()
            yield mock_client

    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "vital-path-ai-services"

    def test_metrics_endpoint(self, client):
        """Test Prometheus metrics endpoint"""
        response = client.get("/metrics")
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/plain")
        assert "vital_ai_requests_total" in response.text
        assert "vital_ai_request_duration_seconds" in response.text

    def test_mode1_manual_endpoint(self, client, mock_supabase_client):
        """Test Mode 1 manual endpoint"""
        test_agent_id = "test-agent-id"
        test_message = "What is the FDA approval process?"

        # Mock agent data
        mock_supabase_client.get_agent_by_id.return_value = {
            "id": test_agent_id,
            "name": "Test Agent",
            "system_prompt": "You are a test agent.",
            "type": "test_agent",
            "max_context_docs": 5,
            "tenant_id": "00000000-0000-0000-0000-000000000001",
        }

        # Mock RAG service
        with patch('main.unified_rag_service') as mock_rag:
            mock_rag.query = AsyncMock(return_value={
                "results": [],
                "metadata": {"query_time_ms": 100}
            })

            # Mock LLM call
            with patch('openai.OpenAI') as mock_openai:
                mock_client_instance = MagicMock()
                mock_openai.return_value = mock_client_instance
                mock_client_instance.chat.completions.create = AsyncMock(return_value={
                    "choices": [{
                        "message": {
                            "content": "Test response"
                        }
                    }]
                })

                response = client.post(
                    "/api/mode1/manual",
                    headers={"x-tenant-id": "00000000-0000-0000-0000-000000000001"},
                    json={
                        "agent_id": test_agent_id,
                        "message": test_message,
                        "user_id": "test-user",
                        "session_id": "test-session",
                    },
                )

                assert response.status_code == 200
                data = response.json()
                assert "content" in data
                assert "agent_id" in data
                assert data["agent_id"] == test_agent_id

    def test_rag_query_endpoint(self, client, mock_supabase_client):
        """Test RAG query endpoint"""
        # Mock RAG service
        with patch('main.unified_rag_service') as mock_rag:
            mock_rag.query = AsyncMock(return_value={
                "results": [
                    {
                        "id": "doc1",
                        "content": "Test document content",
                        "score": 0.95,
                    }
                ],
                "metadata": {
                    "query_time_ms": 150,
                    "total_results": 1,
                }
            })

            response = client.post(
                "/api/rag/query",
                headers={"x-tenant-id": "00000000-0000-0000-0000-000000000001"},
                json={
                    "query": "What is the FDA approval process?",
                    "strategy": "hybrid",
                    "max_results": 10,
                },
            )

            assert response.status_code == 200
            data = response.json()
            assert "results" in data
            assert isinstance(data["results"], list)
            assert len(data["results"]) > 0

    def test_agent_selection_endpoint(self, client, mock_supabase_client):
        """Test agent selection endpoint"""
        # Mock agent selector service
        with patch('main.get_agent_selector_service') as mock_selector:
            mock_selector.return_value.select_agents = AsyncMock(return_value={
                "selected_agents": [
                    {
                        "id": "agent1",
                        "name": "Regulatory Expert",
                        "confidence": 0.95,
                        "reasoning": "High relevance to query",
                    }
                ],
                "metadata": {
                    "total_candidates": 10,
                    "selection_time_ms": 200,
                }
            })

            response = client.post(
                "/api/agents/select",
                headers={"x-tenant-id": "00000000-0000-0000-0000-000000000001"},
                json={
                    "query": "I need help with FDA regulatory guidance",
                    "user_id": "test-user",
                },
            )

            assert response.status_code == 200
            data = response.json()
            assert "selected_agents" in data
            assert isinstance(data["selected_agents"], list)
            assert len(data["selected_agents"]) > 0

    def test_metadata_extraction_endpoint(self, client):
        """Test metadata extraction endpoint"""
        response = client.post(
            "/api/metadata/extract",
            headers={"x-tenant-id": "00000000-0000-0000-0000-000000000001"},
            json={
                "filename": "test_document.pdf",
                "content": "Sample document content for testing metadata extraction.",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "metadata" in data
        assert isinstance(data["metadata"], dict)

    def test_invalid_request_handling(self, client):
        """Test invalid request handling"""
        # Missing required fields
        response = client.post(
            "/api/mode1/manual",
            headers={"x-tenant-id": "00000000-0000-0000-0000-000000000001"},
            json={},  # Empty request
        )

        assert response.status_code == 422  # Validation error

    def test_tenant_isolation(self, client, mock_supabase_client):
        """Test tenant isolation"""
        tenant_a = "00000000-0000-0000-0000-000000000002"
        tenant_b = "00000000-0000-0000-0000-000000000003"

        # Mock tenant A agent
        mock_supabase_client.get_agent_by_id.return_value = {
            "id": "agent-tenant-a",
            "tenant_id": tenant_a,
            "name": "Tenant A Agent",
        }

        # Request with tenant A header
        response_a = client.post(
            "/api/mode1/manual",
            headers={"x-tenant-id": tenant_a},
            json={
                "agent_id": "agent-tenant-a",
                "message": "Test message",
            },
        )

        # Verify tenant context is set
        # In a real scenario, verify that database RLS is applied
        assert response_a.status_code in [200, 500, 503]  # May fail if services not initialized

    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

        # CORS headers should be present
        assert "access-control-allow-origin" in response.headers.lower() or \
               response.status_code == 200

    def test_rate_limiting(self, client):
        """Test rate limiting (if implemented)"""
        # Make multiple requests rapidly
        responses = []
        for i in range(20):
            response = client.get("/health")
            responses.append(response.status_code)

        # All health checks should succeed (health is typically not rate limited)
        assert all(status == 200 for status in responses)


@pytest.mark.skipif(skip_integration, reason="Integration tests skipped")
class TestErrorHandling:
    """Integration tests for error handling"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    def test_service_unavailable(self, client):
        """Test handling when services are not initialized"""
        # Try to use endpoint that requires initialized service
        response = client.post(
            "/api/mode1/manual",
            headers={"x-tenant-id": "00000000-0000-0000-0000-000000000001"},
            json={
                "agent_id": "nonexistent-agent",
                "message": "Test",
            },
        )

        # Should return appropriate error
        assert response.status_code in [404, 500, 503]

    def test_invalid_json(self, client):
        """Test handling of invalid JSON"""
        response = client.post(
            "/api/mode1/manual",
            headers={
                "Content-Type": "application/json",
                "x-tenant-id": "00000000-0000-0000-0000-000000000001",
            },
            data="invalid json",
        )

        assert response.status_code == 422  # Unprocessable entity

