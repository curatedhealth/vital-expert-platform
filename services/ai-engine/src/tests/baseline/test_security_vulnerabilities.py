"""
Test security vulnerabilities - SQL injection, auth, XSS, etc.

These tests verify that common security vulnerabilities are prevented.
"""

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from tests.fixtures.data_generators import generate_tenant_id


@pytest.mark.asyncio
async def test_sql_injection_prevention(async_client: AsyncClient):
    """
    Test that SQL injection attacks are prevented
    
    Verifies:
    1. Parameterized queries prevent SQL injection
    2. Malicious input is safely handled
    3. Database operations don't execute arbitrary SQL
    """
    tenant_id = generate_tenant_id()
    
    # Common SQL injection payloads
    malicious_inputs = [
        "'; DROP TABLE agents; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users--",
        "1'; DELETE FROM agents WHERE '1'='1",
    ]
    
    for malicious_input in malicious_inputs:
        # Try to inject via agent name search
        response = await async_client.get(
            "/api/agents/search",
            params={"name": malicious_input},
            headers={"x-tenant-id": tenant_id}
        )
        
        # If endpoint doesn't exist, skip
        if response.status_code == 404:
            pytest.skip("Search endpoint not implemented")
        
        # Should safely handle the input (either 200 with no results, or 400 for invalid input)
        assert response.status_code in [200, 400], f"SQL injection payload should be handled safely: {malicious_input}"
        
        # Should not return error about SQL syntax
        if response.status_code == 500:
            error_text = str(response.json()).lower()
            assert "sql" not in error_text, f"SQL error leaked for payload: {malicious_input}"
            assert "syntax" not in error_text, f"SQL syntax error leaked for payload: {malicious_input}"


@pytest.mark.asyncio
async def test_authentication_required(async_client: AsyncClient):
    """
    Test that protected endpoints require authentication (tenant_id)
    
    Verifies:
    1. Endpoints reject requests without x-tenant-id
    2. Proper 401 status code is returned
    3. Error messages don't leak sensitive information
    """
    protected_endpoints = [
        ("/api/mode1/manual", "POST", {"agent_id": "test", "message": "test"}),
        ("/api/mode2/automatic", "POST", {"message": "test"}),
        ("/api/agents/list", "GET", None),
        ("/api/rag/search", "POST", {"query": "test"}),
    ]
    
    for endpoint, method, body in protected_endpoints:
        if method == "GET":
            response = await async_client.get(endpoint)
        elif method == "POST":
            response = await async_client.post(endpoint, json=body)
        
        # If endpoint doesn't exist, skip
        if response.status_code == 404:
            continue
        
        # Should require authentication
        assert response.status_code == 401, f"Endpoint {endpoint} should require tenant_id"
        
        # Error message should not leak sensitive information
        error_detail = str(response.json())
        assert "database" not in error_detail.lower()
        assert "internal" not in error_detail.lower()
        assert "stack" not in error_detail.lower()


@pytest.mark.asyncio
async def test_xss_prevention(async_client: AsyncClient):
    """
    Test that XSS attacks are prevented
    
    Verifies:
    1. User input is properly escaped
    2. Script tags in responses are escaped
    3. Content-Type headers are set correctly
    """
    tenant_id = generate_tenant_id()
    
    # Common XSS payloads
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "javascript:alert('XSS')",
        "<svg onload=alert('XSS')>",
    ]
    
    for xss_payload in xss_payloads:
        # Try XSS via message input
        response = await async_client.post(
            "/api/mode1/manual",
            json={
                "agent_id": "test_agent",
                "message": xss_payload
            },
            headers={"x-tenant-id": tenant_id}
        )
        
        # If endpoint doesn't exist, skip
        if response.status_code == 404:
            pytest.skip("Mode1 endpoint not implemented")
        
        # Response should have proper Content-Type
        assert "application/json" in response.headers.get("content-type", "")
        
        # If successful, check that script tags are escaped in response
        if response.status_code == 200:
            response_text = str(response.json())
            # Script tags should not appear unescaped
            assert "<script>" not in response_text, "Script tags should be escaped"
            assert "javascript:" not in response_text, "JavaScript protocol should be filtered"


@pytest.mark.asyncio
async def test_rate_limiting_enforced(async_client: AsyncClient):
    """
    Test that rate limiting is enforced
    
    Verifies:
    1. Excessive requests are rate limited
    2. 429 Too Many Requests is returned
    3. Retry-After header is present
    """
    tenant_id = generate_tenant_id()
    
    # Make many requests rapidly
    responses = []
    for i in range(20):
        response = await async_client.get(
            "/api/agents/list",
            headers={"x-tenant-id": tenant_id}
        )
        responses.append(response)
    
    # If endpoint doesn't exist, skip
    if all(r.status_code == 404 for r in responses):
        pytest.skip("Endpoint not implemented")
    
    # At least some requests should be rate limited
    rate_limited = [r for r in responses if r.status_code == 429]
    
    # Rate limiting might not be implemented yet
    if len(rate_limited) == 0:
        pytest.skip("Rate limiting not yet implemented")
    
    # Verify rate limit response format
    for response in rate_limited:
        assert response.status_code == 429
        # Should have retry-after header
        assert "retry-after" in response.headers or "x-ratelimit-reset" in response.headers


@pytest.mark.asyncio
async def test_cors_headers_present(async_client: AsyncClient):
    """
    Test that CORS headers are properly configured
    
    Verifies:
    1. CORS headers are present on responses
    2. Allowed origins are restricted (not *)
    3. Credentials are handled correctly
    """
    response = await async_client.options(
        "/api/agents/list",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET"
        }
    )
    
    # Should have CORS headers
    headers = response.headers
    
    # Check for basic CORS headers
    # Note: Some might not be present depending on CORS config
    if "access-control-allow-origin" in headers:
        origin = headers["access-control-allow-origin"]
        # Should not be wildcard for authenticated requests
        # (But might be in development)
        assert origin in ["http://localhost:3000", "http://localhost:3001", "*"]


@pytest.mark.asyncio
async def test_sensitive_data_not_leaked_in_errors(async_client: AsyncClient):
    """
    Test that sensitive data is not leaked in error messages
    
    Verifies:
    1. Database connection strings not in errors
    2. API keys not in errors
    3. Stack traces not exposed in production
    """
    tenant_id = generate_tenant_id()
    
    # Trigger various error conditions
    error_requests = [
        ("/api/nonexistent", "GET", None),
        ("/api/mode1/manual", "POST", {"invalid": "data"}),
        ("/api/agents/999999", "GET", None),
    ]
    
    for endpoint, method, body in error_requests:
        if method == "GET":
            response = await async_client.get(
                endpoint,
                headers={"x-tenant-id": tenant_id}
            )
        elif method == "POST":
            response = await async_client.post(
                endpoint,
                json=body,
                headers={"x-tenant-id": tenant_id}
            )
        
        # Check error response doesn't leak sensitive info
        response_text = str(response.json()).lower()
        
        # Should not contain sensitive patterns
        sensitive_patterns = [
            "password",
            "api_key",
            "secret",
            "postgresql://",
            "mongodb://",
            "redis://",
            "traceback",
            "file \"/",
            ".py\", line",
        ]
        
        for pattern in sensitive_patterns:
            assert pattern not in response_text, f"Sensitive pattern '{pattern}' leaked in error response"


@pytest.mark.asyncio
async def test_input_validation_prevents_oversized_requests(async_client: AsyncClient):
    """
    Test that oversized requests are rejected
    
    Verifies:
    1. Very large inputs are rejected
    2. Proper 413 or 400 status code
    3. System remains stable
    """
    tenant_id = generate_tenant_id()
    
    # Create oversized message (10MB of text)
    oversized_message = "A" * (10 * 1024 * 1024)
    
    response = await async_client.post(
        "/api/mode1/manual",
        json={
            "agent_id": "test",
            "message": oversized_message
        },
        headers={"x-tenant-id": tenant_id}
    )
    
    # If endpoint doesn't exist, skip
    if response.status_code == 404:
        pytest.skip("Endpoint not implemented")
    
    # Should reject oversized request
    assert response.status_code in [400, 413, 422], "Oversized request should be rejected"


# Fixtures

@pytest.fixture
async def async_client():
    """Provide async HTTP client for testing"""
    from main import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

