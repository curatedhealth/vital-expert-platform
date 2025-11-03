"""
Security Tests - Tenant Isolation (Golden Rule #2)
CRITICAL: Ensure no data leakage between tenants

These tests verify that Row-Level Security (RLS) is properly enforced
and that no tenant can access another tenant's data.

🚨 SECURITY WARNING: Failure of these tests indicates a critical
   security vulnerability that could lead to data breach, SOC 2
   compliance failure, and HIPAA violations.
"""

import pytest
from uuid import uuid4
import os
import sys

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

# Skip tests if not in test environment
pytestmark = pytest.mark.skipif(
    os.getenv("ENV") != "test",
    reason="Security tests should only run in test environment"
)


@pytest.mark.security
@pytest.mark.asyncio
async def test_rls_blocks_cross_tenant_access_agents(supabase_client):
    """
    Test that RLS prevents access to other tenant's agents.
    
    🚨 CRITICAL: Failure = SOC 2 / HIPAA violation
    
    This test:
    1. Creates an agent for Tenant A
    2. Tries to access it from Tenant B
    3. Verifies Tenant B sees ZERO agents (RLS working)
    """
    tenant1_id = uuid4()
    tenant2_id = uuid4()
    
    # Import the middleware function
    try:
        from middleware.tenant_context import set_tenant_context_in_db
    except ImportError:
        # Fallback: create our own context setter
        async def set_tenant_context_in_db(tenant_id, client):
            # Call the database function directly
            await client.client.rpc('set_tenant_context', {'p_tenant_id': str(tenant_id)}).execute()
    
    await set_tenant_context_in_db(str(tenant1_id), supabase_client)
    
    agent_data = {
        "id": str(uuid4()),
        "tenant_id": str(tenant1_id),
        "name": "Security Test Agent A",
        "description": "Test agent for RLS verification",
        "model": "gpt-4",
        "temperature": 0.7
    }
    
    # Insert agent for Tenant A
    result1 = await supabase_client.client.table("agents").insert(agent_data).execute()
    assert len(result1.data) == 1, "Failed to create test agent"
    agent_id = result1.data[0]["id"]
    
    # Switch to Tenant B
    await set_tenant_context_in_db(str(tenant2_id), supabase_client)
    
    # Try to access Tenant A's agent (should fail due to RLS)
    result2 = await supabase_client.client.table("agents").select("*").eq("id", agent_id).execute()
    
    # 🚨 CRITICAL ASSERTION: Tenant B should see ZERO agents
    assert len(result2.data) == 0, (
        f"🚨 RLS VIOLATION DETECTED! "
        f"Tenant B can see Tenant A's agent (ID: {agent_id}). "
        f"This is a CRITICAL security vulnerability!"
    )
    
    # Cleanup
    await set_tenant_context_in_db(str(tenant1_id), supabase_client)
    await supabase_client.client.table("agents").delete().eq("id", agent_id).execute()
    
    print("✅ RLS Test Passed: Cross-tenant access blocked for agents")


@pytest.mark.security
@pytest.mark.asyncio
async def test_rls_blocks_cross_tenant_access_conversations(supabase_client):
    """
    Test that RLS prevents access to other tenant's conversations.
    """
    tenant1_id = uuid4()
    tenant2_id = uuid4()
    user_id = uuid4()
    
    from src.middleware.tenant_context import set_tenant_context_in_db
    
    await set_tenant_context_in_db(str(tenant1_id), supabase_client)
    
    conversation_data = {
        "id": str(uuid4()),
        "tenant_id": str(tenant1_id),
        "user_id": str(user_id),
        "title": "Security Test Conversation"
    }
    
    # Create conversation for Tenant A
    result1 = await supabase_client.client.table("conversations").insert(conversation_data).execute()
    assert len(result1.data) == 1
    conv_id = result1.data[0]["id"]
    
    # Switch to Tenant B
    await set_tenant_context_in_db(str(tenant2_id), supabase_client)
    
    # Try to access Tenant A's conversation
    result2 = await supabase_client.client.table("conversations").select("*").eq("id", conv_id).execute()
    
    # 🚨 CRITICAL: Should see ZERO conversations
    assert len(result2.data) == 0, (
        f"🚨 RLS VIOLATION: Tenant B can see Tenant A's conversation (ID: {conv_id})"
    )
    
    # Cleanup
    await set_tenant_context_in_db(str(tenant1_id), supabase_client)
    await supabase_client.client.table("conversations").delete().eq("id", conv_id).execute()
    
    print("✅ RLS Test Passed: Cross-tenant access blocked for conversations")


@pytest.mark.security
@pytest.mark.asyncio
async def test_rls_allows_same_tenant_access(supabase_client):
    """
    Test that RLS allows access to same tenant's data.
    
    This verifies RLS isn't too restrictive.
    """
    tenant_id = uuid4()
    
    from src.middleware.tenant_context import set_tenant_context_in_db
    
    await set_tenant_context_in_db(str(tenant_id), supabase_client)
    
    agent_data = {
        "id": str(uuid4()),
        "tenant_id": str(tenant_id),
        "name": "Same Tenant Test Agent",
        "description": "Test",
        "model": "gpt-4",
        "temperature": 0.7
    }
    
    # Create agent
    result1 = await supabase_client.client.table("agents").insert(agent_data).execute()
    assert len(result1.data) == 1
    agent_id = result1.data[0]["id"]
    
    # Query same tenant's data (should succeed)
    result2 = await supabase_client.client.table("agents").select("*").eq("id", agent_id).execute()
    
    # Should see 1 agent
    assert len(result2.data) == 1, "RLS is blocking same-tenant access!"
    assert result2.data[0]["id"] == agent_id
    
    # Cleanup
    await supabase_client.client.table("agents").delete().eq("id", agent_id).execute()
    
    print("✅ RLS Test Passed: Same-tenant access allowed")


@pytest.mark.security
def test_cache_keys_tenant_scoped():
    """
    Test that cache keys include tenant_id to prevent cache collisions.
    
    Without tenant-scoped cache keys, Tenant A could see Tenant B's
    cached data, bypassing RLS.
    """
    from src.services.cache_manager import CacheManager
    
    tenant1 = uuid4()
    tenant2 = uuid4()
    
    cache_manager = CacheManager(redis_url="redis://localhost:6379/1")
    
    # Generate cache keys for same query, different tenants
    key1 = cache_manager.get_cache_key(
        tenant_id=str(tenant1),
        prefix="query",
        query="test query"
    )
    key2 = cache_manager.get_cache_key(
        tenant_id=str(tenant2),
        prefix="query",
        query="test query"
    )
    
    # Keys MUST be different for different tenants
    assert key1 != key2, (
        f"🚨 CACHE KEY COLLISION! "
        f"Same cache key for different tenants: {key1}"
    )
    
    # Keys should contain tenant ID
    assert str(tenant1) in key1, "Cache key doesn't contain tenant_id"
    assert str(tenant2) in key2, "Cache key doesn't contain tenant_id"
    
    print("✅ Cache Test Passed: Tenant-scoped cache keys working")


@pytest.mark.security
@pytest.mark.asyncio
async def test_sql_injection_prevention(async_client):
    """
    Test that SQL injection attempts are blocked.
    
    Tests common SQL injection patterns to ensure input validation.
    """
    tenant_id = uuid4()
    
    # Common SQL injection patterns
    malicious_inputs = [
        "'; DROP TABLE agents; --",
        "1' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM agents--",
        "<script>alert('XSS')</script>",
        "../../../etc/passwd"
    ]
    
    for malicious_input in malicious_inputs:
        response = await async_client.post(
            "/api/mode1/manual",
            headers={"x-tenant-id": str(tenant_id)},
            json={
                "message": malicious_input,
                "agent_id": str(uuid4()),
                "session_id": "test",
                "user_id": str(uuid4())
            }
        )
        
        # Should not crash or expose SQL error
        assert response.status_code in [200, 400, 404, 422], (
            f"Unexpected status for malicious input: {malicious_input}"
        )
        
        # Should not expose database errors in response
        if response.status_code >= 400:
            error_text = response.text.lower()
            assert "sql" not in error_text, "SQL error exposed in response"
            assert "database" not in error_text, "Database error exposed"
            assert "syntax error" not in error_text, "Syntax error exposed"
    
    print("✅ SQL Injection Test Passed: All malicious inputs handled safely")


@pytest.mark.security
@pytest.mark.asyncio
async def test_tenant_context_required_for_queries(supabase_client):
    """
    Test that queries fail without tenant context set.
    
    This ensures middleware is enforcing tenant context.
    """
    from src.middleware.tenant_context import clear_tenant_context
    
    # Clear any existing tenant context
    clear_tenant_context()
    
    # Try to query without tenant context (should fail)
    with pytest.raises(Exception) as exc_info:
        await supabase_client.client.table("agents").select("*").execute()
    
    # Should fail with tenant context error
    error_message = str(exc_info.value).lower()
    assert "tenant" in error_message or "context" in error_message, (
        "Query succeeded without tenant context - RLS not enforced!"
    )
    
    print("✅ Tenant Context Test Passed: Queries require tenant context")


@pytest.mark.security
@pytest.mark.asyncio
async def test_invalid_tenant_id_rejected(async_client):
    """
    Test that invalid tenant IDs are rejected.
    """
    invalid_tenant_ids = [
        "not-a-uuid",
        "12345",
        "",
        "null",
        "../admin",
        "' OR '1'='1"
    ]
    
    for invalid_id in invalid_tenant_ids:
        response = await async_client.post(
            "/api/mode1/manual",
            headers={"x-tenant-id": invalid_id},
            json={
                "message": "test",
                "agent_id": str(uuid4()),
                "session_id": "test",
                "user_id": str(uuid4())
            }
        )
        
        # Should reject invalid tenant ID
        assert response.status_code in [400, 401, 403, 422], (
            f"Invalid tenant ID accepted: {invalid_id}"
        )
    
    print("✅ Validation Test Passed: Invalid tenant IDs rejected")


@pytest.mark.security
def test_password_hashing():
    """
    Test that passwords are properly hashed (if password auth is used).
    
    Note: Currently VITAL uses Supabase Auth, but this test ensures
    any future password storage follows best practices.
    """
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    password = "TestPassword123!"
    hashed = pwd_context.hash(password)
    
    # Verify hash is different from plaintext
    assert hashed != password, "Password not hashed!"
    
    # Verify hash can be verified
    assert pwd_context.verify(password, hashed), "Password verification failed"
    
    # Verify wrong password fails
    assert not pwd_context.verify("WrongPassword", hashed), "Wrong password verified!"
    
    print("✅ Password Test Passed: Passwords properly hashed")


# ==================================================
# Test Fixtures
# ==================================================

@pytest.fixture
async def supabase_client():
    """Supabase client for testing"""
    from src.services.supabase_client import SupabaseClient
    
    client = SupabaseClient()
    await client.initialize()
    
    yield client
    
    # Cleanup is handled per test


@pytest.fixture
async def async_client():
    """Async HTTP client for testing"""
    from httpx import AsyncClient
    from src.main import app
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

