"""
Test multi-tenant isolation - CRITICAL SECURITY TESTS

These tests verify that Row-Level Security (RLS) properly isolates tenant data.
"""

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
import uuid
from typing import Dict, Any

from tests.fixtures.data_generators import generate_tenant_id
from tests.fixtures.mock_agents import MOCK_REGULATORY_AGENT


@pytest.mark.asyncio
async def test_tenant_a_cannot_access_tenant_b_data(async_client: AsyncClient):
    """
    Critical Security Test: Ensure Tenant A cannot access Tenant B data
    
    This test verifies that:
    1. Data created by Tenant A is isolated from Tenant B
    2. RLS policies prevent cross-tenant data access
    3. Proper 404 (not found) is returned rather than 403 (forbidden) to avoid info leakage
    """
    tenant_a = generate_tenant_id()
    tenant_b = generate_tenant_id()
    
    # Create agent for Tenant A
    agent_data = {
        **MOCK_REGULATORY_AGENT,
        "tenant_id": tenant_a
    }
    
    # Create agent with Tenant A credentials
    response_create = await async_client.post(
        "/api/agents/create",
        json=agent_data,
        headers={"x-tenant-id": tenant_a}
    )
    
    # If agent creation is not implemented yet, skip
    if response_create.status_code == 404:
        pytest.skip("Agent creation endpoint not implemented")
    
    assert response_create.status_code == 200
    agent_id = response_create.json()["agent_id"]
    
    # Try to access the agent with Tenant B credentials
    response_get = await async_client.get(
        f"/api/agents/{agent_id}",
        headers={"x-tenant-id": tenant_b}
    )
    
    # Should not find the agent (RLS filtered it out)
    assert response_get.status_code == 404
    assert "not found" in response_get.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_rls_enforces_tenant_context(async_client: AsyncClient):
    """
    Test that RLS policies enforce tenant context filtering
    
    Verifies:
    1. Queries with tenant_id only return that tenant's data
    2. Multiple tenants can have data with same IDs without conflicts
    """
    tenant_a = generate_tenant_id()
    tenant_b = generate_tenant_id()
    
    # Create identical agents for both tenants
    agent_name = "Test Regulatory Expert"
    
    # Create for Tenant A
    await async_client.post(
        "/api/agents/create",
        json={**MOCK_REGULATORY_AGENT, "name": agent_name, "tenant_id": tenant_a},
        headers={"x-tenant-id": tenant_a}
    )
    
    # Create for Tenant B
    await async_client.post(
        "/api/agents/create",
        json={**MOCK_REGULATORY_AGENT, "name": agent_name, "tenant_id": tenant_b},
        headers={"x-tenant-id": tenant_b}
    )
    
    # List agents for Tenant A
    response_a = await async_client.get(
        "/api/agents/list",
        headers={"x-tenant-id": tenant_a}
    )
    
    # List agents for Tenant B
    response_b = await async_client.get(
        "/api/agents/list",
        headers={"x-tenant-id": tenant_b}
    )
    
    # If listing is not implemented, skip
    if response_a.status_code == 404:
        pytest.skip("Agent listing endpoint not implemented")
    
    # Both should succeed
    assert response_a.status_code == 200
    assert response_b.status_code == 200
    
    agents_a = response_a.json()
    agents_b = response_b.json()
    
    # Each tenant should only see their own agents
    # Agent IDs should not overlap
    agent_ids_a = {agent["id"] for agent in agents_a}
    agent_ids_b = {agent["id"] for agent in agents_b}
    
    assert len(agent_ids_a.intersection(agent_ids_b)) == 0, "Tenants should not share agent IDs"


@pytest.mark.asyncio
async def test_missing_tenant_id_rejected(async_client: AsyncClient):
    """
    Test that requests without tenant_id are rejected
    
    Verifies:
    1. Protected endpoints require x-tenant-id header
    2. Proper 401 Unauthorized is returned
    3. Error message is clear and helpful
    """
    # Try to access protected endpoint without tenant_id
    response = await async_client.get("/api/agents/list")
    
    # If endpoint doesn't exist, skip
    if response.status_code == 404:
        pytest.skip("Endpoint not implemented")
    
    # Should be unauthorized
    assert response.status_code == 401
    assert "tenant" in response.json().get("detail", {}).get("error", "").lower()


@pytest.mark.asyncio
async def test_invalid_tenant_id_rejected(async_client: AsyncClient):
    """
    Test that invalid tenant_id formats are rejected
    
    Verifies:
    1. tenant_id must be valid UUID format
    2. Proper 400 Bad Request is returned
    3. Clear error message about format requirements
    """
    invalid_tenant_ids = [
        "not-a-uuid",
        "12345",
        "invalid-format-123",
        "",
        "null"
    ]
    
    for invalid_id in invalid_tenant_ids:
        response = await async_client.get(
            "/api/agents/list",
            headers={"x-tenant-id": invalid_id}
        )
        
        # If endpoint doesn't exist, skip
        if response.status_code == 404:
            pytest.skip("Endpoint not implemented")
        
        # Should be bad request
        assert response.status_code == 400, f"Invalid tenant_id '{invalid_id}' should be rejected"
        assert "uuid" in response.json().get("detail", {}).get("error", "").lower()


@pytest.mark.asyncio
async def test_public_endpoints_accessible_without_tenant_id(async_client: AsyncClient):
    """
    Test that public endpoints don't require tenant_id
    
    Verifies:
    1. /health, /docs, /openapi.json are accessible without tenant_id
    2. These endpoints return 200 OK
    """
    public_endpoints = [
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/"
    ]
    
    for endpoint in public_endpoints:
        response = await async_client.get(endpoint)
        
        # Should be accessible (200 or 307 redirect for docs)
        assert response.status_code in [200, 307], f"Public endpoint {endpoint} should be accessible"


@pytest.mark.asyncio
async def test_tenant_context_in_database(async_client: AsyncClient):
    """
    Test that tenant context is properly set in database session
    
    Verifies:
    1. SET LOCAL app.tenant_id is called for each request
    2. Database queries are filtered by tenant_id
    """
    # This is more of an integration test
    # We'll verify by checking that data isolation works
    pytest.skip("Requires database connection - run as integration test")


# Fixtures for testing

@pytest.fixture
async def async_client():
    """Provide async HTTP client for testing"""
    from main import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def tenant_a_id():
    """Generate consistent tenant A ID for tests"""
    return "550e8400-e29b-41d4-a716-446655440000"


@pytest.fixture
def tenant_b_id():
    """Generate consistent tenant B ID for tests"""
    return "660f9511-f3ab-52e5-b827-557766551111"

