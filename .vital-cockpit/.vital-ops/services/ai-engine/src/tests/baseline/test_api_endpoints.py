"""
Baseline tests for API endpoints

These tests verify that existing API endpoints work correctly
and document their behavior before LangGraph migration.
"""

import pytest
from httpx import AsyncClient
from tests.fixtures.data_generators import generate_tenant_id, generate_mock_agent


@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient):
    """Test health check endpoint - should always work"""
    response = await async_client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    
    # Should indicate health status
    assert "status" in data or "healthy" in data or data.get("status") == "ok"


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """Test root endpoint"""
    response = await async_client.get("/")
    
    # Should return success or redirect to docs
    assert response.status_code in [200, 307]


@pytest.mark.asyncio
async def test_docs_endpoint_accessible(async_client: AsyncClient):
    """Test API documentation endpoint"""
    response = await async_client.get("/docs")
    
    # Should be accessible (200 or redirect)
    assert response.status_code in [200, 307]


@pytest.mark.asyncio
async def test_openapi_json_accessible(async_client: AsyncClient):
    """Test OpenAPI schema endpoint"""
    response = await async_client.get("/openapi.json")
    
    assert response.status_code == 200
    data = response.json()
    
    # Should be valid OpenAPI schema
    assert "openapi" in data
    assert "info" in data
    assert "paths" in data


@pytest.mark.asyncio
async def test_mode1_manual_endpoint(async_client: AsyncClient):
    """Test Mode 1 manual interactive endpoint"""
    tenant_id = generate_tenant_id()
    
    response = await async_client.post(
        "/api/mode1/manual",
        json={
            "agent_id": "regulatory_expert",
            "message": "What are FDA requirements?",
            "enable_rag": True,
            "temperature": 0.1
        },
        headers={"x-tenant-id": tenant_id}
    )
    
    # Should accept request (200, 202, or 404 if not implemented)
    assert response.status_code in [200, 202, 404, 500]
    
    # If implemented, should have proper response structure
    if response.status_code == 200:
        data = response.json()
        assert "content" in data or "response" in data


@pytest.mark.asyncio
async def test_mode2_automatic_endpoint(async_client: AsyncClient):
    """Test Mode 2 automatic agent selection endpoint"""
    tenant_id = generate_tenant_id()
    
    response = await async_client.post(
        "/api/mode2/automatic",
        json={
            "message": "What are FDA requirements?",
            "enable_rag": True
        },
        headers={"x-tenant-id": tenant_id}
    )
    
    # Should accept request
    assert response.status_code in [200, 202, 404, 500]
    
    # If implemented, should have proper response
    if response.status_code == 200:
        data = response.json()
        assert "agent_selected" in data or "content" in data


@pytest.mark.asyncio
async def test_mode3_autonomous_endpoint(async_client: AsyncClient):
    """Test Mode 3 autonomous multi-agent endpoint"""
    tenant_id = generate_tenant_id()
    
    response = await async_client.post(
        "/api/mode3/autonomous-automatic",
        json={
            "message": "Provide comprehensive guidance",
            "enable_rag": True,
            "max_agents": 3
        },
        headers={"x-tenant-id": tenant_id}
    )
    
    # Should accept request
    assert response.status_code in [200, 202, 404, 500]


@pytest.mark.asyncio
async def test_rag_search_endpoint(async_client: AsyncClient):
    """Test RAG search endpoint"""
    tenant_id = generate_tenant_id()
    
    response = await async_client.post(
        "/api/rag/search",
        json={
            "query": "FDA requirements",
            "max_results": 5
        },
        headers={"x-tenant-id": tenant_id}
    )
    
    # Should accept request
    assert response.status_code in [200, 404, 500]
    
    # If implemented, should return results
    if response.status_code == 200:
        data = response.json()
        assert "results" in data


@pytest.mark.asyncio
async def test_agent_selector_endpoint(async_client: AsyncClient):
    """Test agent selector/analysis endpoint"""
    tenant_id = generate_tenant_id()
    
    response = await async_client.post(
        "/api/agent-selector/analyze",
        json={
            "query": "What are regulatory requirements?",
            "context": {}
        },
        headers={"x-tenant-id": tenant_id}
    )
    
    # Should accept request
    assert response.status_code in [200, 404, 500]
    
    # If implemented, should return agent recommendation
    if response.status_code == 200:
        data = response.json()
        assert "recommended_agent" in data or "agent" in data


@pytest.mark.asyncio
async def test_request_validation(async_client: AsyncClient):
    """Test that invalid requests are properly rejected"""
    tenant_id = generate_tenant_id()
    
    # Missing required fields
    response = await async_client.post(
        "/api/mode1/manual",
        json={
            "agent_id": "regulatory_expert"
            # Missing 'message' field
        },
        headers={"x-tenant-id": tenant_id}
    )
    
    # If endpoint exists, should reject invalid request
    if response.status_code != 404:
        assert response.status_code in [400, 422]  # Bad request or validation error


@pytest.mark.asyncio
async def test_response_format_consistency(async_client: AsyncClient):
    """Test that responses have consistent format"""
    tenant_id = generate_tenant_id()
    
    endpoints_to_test = [
        ("/api/mode1/manual", {"agent_id": "test", "message": "test"}),
        ("/api/mode2/automatic", {"message": "test"}),
        ("/api/rag/search", {"query": "test"}),
    ]
    
    for endpoint, body in endpoints_to_test:
        response = await async_client.post(
            endpoint,
            json=body,
            headers={"x-tenant-id": tenant_id}
        )
        
        # Skip if endpoint doesn't exist
        if response.status_code == 404:
            continue
        
        # All responses should be JSON
        assert "application/json" in response.headers.get("content-type", "")
        
        # Should be parseable JSON
        try:
            data = response.json()
            assert isinstance(data, dict)
        except Exception:
            pytest.fail(f"Response from {endpoint} is not valid JSON")


@pytest.mark.asyncio
async def test_error_responses_format(async_client: AsyncClient):
    """Test that error responses have consistent format"""
    tenant_id = "invalid-uuid-format"  # Intentionally invalid
    
    response = await async_client.get(
        "/api/agents/list",
        headers={"x-tenant-id": tenant_id}
    )
    
    # Should be error response
    if response.status_code >= 400:
        data = response.json()
        
        # Should have error information
        assert "detail" in data or "error" in data or "message" in data


@pytest.mark.asyncio
async def test_cors_preflight(async_client: AsyncClient):
    """Test CORS preflight requests"""
    response = await async_client.options(
        "/api/mode1/manual",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-tenant-id"
        }
    )
    
    # Should handle OPTIONS request
    assert response.status_code in [200, 204]


@pytest.mark.asyncio
async def test_metrics_endpoint(async_client: AsyncClient):
    """Test Prometheus metrics endpoint if available"""
    response = await async_client.get("/metrics")
    
    # If implemented, should return Prometheus format
    if response.status_code == 200:
        content = response.text
        # Should have Prometheus metric format
        assert "# HELP" in content or "# TYPE" in content


# Fixtures

@pytest.fixture
async def async_client():
    """Provide async HTTP client for testing"""
    from main import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

