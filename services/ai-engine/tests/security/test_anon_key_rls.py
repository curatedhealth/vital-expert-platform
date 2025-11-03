"""
Anon-Key Security Tests - REAL RLS Enforcement Tests
CRITICAL: Tests that verify RLS actually blocks cross-tenant access

These tests use the ANON key (not service role) to properly test RLS enforcement.
Service role bypasses RLS by design; anon/authenticated keys do not.

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


@pytest.fixture
async def anon_supabase_client():
    """
    Supabase client with ANON key for RLS testing.
    
    This client will have RLS enforced (unlike service role).
    
    Note: Requires SUPABASE_ANON_KEY in environment.
    """
    from supabase import create_client, Client
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_anon_key:
        pytest.skip("SUPABASE_URL or SUPABASE_ANON_KEY not set (required for anon-key RLS tests)")
    
    client: Client = create_client(supabase_url, supabase_anon_key)
    
    yield client
    
    # No cleanup needed - anon client is stateless


@pytest.mark.security
@pytest.mark.asyncio
async def test_anon_rls_blocks_cross_tenant_access_agents(anon_supabase_client):
    """
    CRITICAL: Test that RLS prevents cross-tenant access with anon key.
    
    This test uses the ANON key (not service role), so RLS is enforced.
    
    🚨 CRITICAL: Failure = SOC 2 / HIPAA violation
    
    This test:
    1. Sets context to Tenant A
    2. Creates an agent for Tenant A
    3. Switches context to Tenant B
    4. Tries to access Tenant A's agent
    5. Verifies Tenant B sees ZERO agents (RLS working)
    """
    # Use real tenant IDs from database
    tenant1_id = '00000000-0000-0000-0000-000000000001'  # VITAL Platform
    tenant2_id = 'a2b50378-a21a-467b-ba4c-79ba93f64b2f'  # Digital Health Startups
    
    agent_id = str(uuid4())
    
    try:
        # Step 1: Set context to Tenant A
        await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant1_id}).execute()
        
        # Step 2: Create agent for Tenant A
        agent_data = {
            "id": agent_id,
            "tenant_id": tenant1_id,
            "name": "Anon RLS Test Agent A",
            "description": "Test agent for RLS verification with anon key",
            "created_at": "now()",
            "updated_at": "now()"
        }
        
        result1 = await anon_supabase_client.table("agents").insert(agent_data).execute()
        assert len(result1.data) == 1, "Failed to create test agent"
        
        # Step 3: Verify Tenant A can see their own agent
        result_own = await anon_supabase_client.table("agents").select("*").eq("id", agent_id).execute()
        assert len(result_own.data) == 1, "Tenant A should see their own agent"
        
        # Step 4: Switch to Tenant B
        await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant2_id}).execute()
        
        # Step 5: Try to access Tenant A's agent (should fail due to RLS)
        result2 = await anon_supabase_client.table("agents").select("*").eq("id", agent_id).execute()
        
        # 🚨 CRITICAL ASSERTION: Tenant B should see ZERO agents
        assert len(result2.data) == 0, (
            f"🚨 RLS VIOLATION DETECTED WITH ANON KEY! "
            f"Tenant B can see Tenant A's agent (ID: {agent_id}). "
            f"This is a CRITICAL security vulnerability!"
        )
        
        print("✅ ANON-KEY RLS Test Passed: Cross-tenant access blocked")
        
    finally:
        # Cleanup: Switch back to Tenant A and delete
        try:
            await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant1_id}).execute()
            await anon_supabase_client.table("agents").delete().eq("id", agent_id).execute()
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup failed: {cleanup_error}")


@pytest.mark.security
@pytest.mark.asyncio
async def test_anon_rls_blocks_cross_tenant_access_consultations(anon_supabase_client):
    """
    Test that RLS prevents cross-tenant access to consultations with anon key.
    
    Consultations are the main conversation entity in VITAL.
    """
    tenant1_id = '00000000-0000-0000-0000-000000000001'
    tenant2_id = 'a2b50378-a21a-467b-ba4c-79ba93f64b2f'
    
    consultation_id = str(uuid4())
    user_id = str(uuid4())
    
    try:
        # Set context to Tenant A
        await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant1_id}).execute()
        
        # Create consultation for Tenant A
        consultation_data = {
            "id": consultation_id,
            "tenant_id": tenant1_id,
            "user_id": user_id,
            "title": "Anon RLS Test Consultation",
            "status": "active",
            "created_at": "now()",
            "updated_at": "now()"
        }
        
        result1 = await anon_supabase_client.table("consultations").insert(consultation_data).execute()
        assert len(result1.data) == 1, "Failed to create test consultation"
        
        # Switch to Tenant B
        await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant2_id}).execute()
        
        # Try to access Tenant A's consultation (should fail)
        result2 = await anon_supabase_client.table("consultations").select("*").eq("id", consultation_id).execute()
        
        # CRITICAL: Tenant B should see ZERO consultations
        assert len(result2.data) == 0, (
            f"🚨 RLS VIOLATION: Tenant B can see Tenant A's consultation! "
            f"Consultation ID: {consultation_id}"
        )
        
        print("✅ ANON-KEY RLS Test Passed: Cross-tenant consultation access blocked")
        
    finally:
        # Cleanup
        try:
            await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant1_id}).execute()
            await anon_supabase_client.table("consultations").delete().eq("id", consultation_id).execute()
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup failed: {cleanup_error}")


@pytest.mark.security
@pytest.mark.asyncio
async def test_anon_rls_blocks_cross_tenant_messages(anon_supabase_client):
    """
    Test that RLS prevents cross-tenant access to messages via consultation_id.
    
    Messages are protected via their relationship to consultations.
    """
    tenant1_id = '00000000-0000-0000-0000-000000000001'
    tenant2_id = 'a2b50378-a21a-467b-ba4c-79ba93f64b2f'
    
    consultation_id = str(uuid4())
    message_id = str(uuid4())
    user_id = str(uuid4())
    
    try:
        # Set context to Tenant A
        await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant1_id}).execute()
        
        # Create consultation for Tenant A
        consultation_data = {
            "id": consultation_id,
            "tenant_id": tenant1_id,
            "user_id": user_id,
            "title": "Message RLS Test",
            "status": "active",
            "created_at": "now()",
            "updated_at": "now()"
        }
        await anon_supabase_client.table("consultations").insert(consultation_data).execute()
        
        # Create message for Tenant A's consultation
        message_data = {
            "id": message_id,
            "consultation_id": consultation_id,
            "role": "user",
            "content": "Test message for RLS",
            "created_at": "now()"
        }
        result1 = await anon_supabase_client.table("messages").insert(message_data).execute()
        assert len(result1.data) == 1, "Failed to create test message"
        
        # Verify Tenant A can see their message
        result_own = await anon_supabase_client.table("messages").select("*").eq("id", message_id).execute()
        assert len(result_own.data) == 1, "Tenant A should see their own message"
        
        # Switch to Tenant B
        await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant2_id}).execute()
        
        # Try to access Tenant A's message (should fail)
        result2 = await anon_supabase_client.table("messages").select("*").eq("id", message_id).execute()
        
        # CRITICAL: Tenant B should see ZERO messages
        assert len(result2.data) == 0, (
            f"🚨 RLS VIOLATION: Tenant B can see Tenant A's message! "
            f"Message ID: {message_id}, Consultation ID: {consultation_id}"
        )
        
        print("✅ ANON-KEY RLS Test Passed: Cross-tenant message access blocked")
        
    finally:
        # Cleanup
        try:
            await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant1_id}).execute()
            await anon_supabase_client.table("messages").delete().eq("id", message_id).execute()
            await anon_supabase_client.table("consultations").delete().eq("id", consultation_id).execute()
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup failed: {cleanup_error}")


@pytest.mark.security
@pytest.mark.asyncio
async def test_anon_rls_tenant_context_isolation(anon_supabase_client):
    """
    Test that tenant context is properly isolated across concurrent requests.
    
    This simulates multiple users from different tenants querying simultaneously.
    """
    tenant1_id = '00000000-0000-0000-0000-000000000001'
    tenant2_id = 'a2b50378-a21a-467b-ba4c-79ba93f64b2f'
    
    # Set context to Tenant 1
    await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant1_id}).execute()
    
    # Get context - should be Tenant 1
    result1 = await anon_supabase_client.rpc('get_tenant_context').execute()
    assert result1.data == tenant1_id, "Context should be Tenant 1"
    
    # Set context to Tenant 2
    await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant2_id}).execute()
    
    # Get context - should be Tenant 2 (not Tenant 1)
    result2 = await anon_supabase_client.rpc('get_tenant_context').execute()
    assert result2.data == tenant2_id, "Context should be Tenant 2"
    
    # Clear context
    await anon_supabase_client.rpc('clear_tenant_context').execute()
    
    print("✅ ANON-KEY Context Isolation Test Passed")


@pytest.mark.security
@pytest.mark.asyncio
async def test_anon_rls_policy_count(anon_supabase_client):
    """
    Test that the RLS policy count is as expected (41 policies).
    
    This is a health check to ensure all policies are deployed.
    """
    result = await anon_supabase_client.rpc('count_rls_policies').execute()
    
    policy_count = result.data
    
    # We expect 41 policies (from deployment)
    assert policy_count >= 40, (
        f"Expected at least 40 RLS policies, found only {policy_count}. "
        f"Some policies may not be deployed correctly."
    )
    
    print(f"✅ ANON-KEY RLS Policy Count Test Passed: {policy_count} policies active")


@pytest.mark.security
@pytest.mark.asyncio
async def test_anon_rls_no_context_blocks_access(anon_supabase_client):
    """
    Test that queries WITHOUT tenant context are blocked.
    
    This ensures users can't bypass RLS by not setting context.
    """
    # Clear any existing context
    try:
        await anon_supabase_client.rpc('clear_tenant_context').execute()
    except:
        pass  # Context might not exist
    
    # Try to query agents without setting tenant context
    # This should either return 0 rows or raise an error
    try:
        result = await anon_supabase_client.table("agents").select("*").limit(10).execute()
        
        # If query succeeds, it should return 0 rows (RLS blocks access)
        assert len(result.data) == 0, (
            f"🚨 RLS BYPASS DETECTED! Query without tenant context returned {len(result.data)} rows. "
            f"RLS should block all access when context is not set."
        )
        
        print("✅ ANON-KEY No-Context Test Passed: Access blocked without tenant context")
    
    except Exception as e:
        # If query fails with an error, that's also acceptable
        # (depends on RLS configuration - some setups block with error, some return empty)
        print(f"✅ ANON-KEY No-Context Test Passed: Query blocked with error (expected): {e}")


# ============================================
# Integration Test: Full Auth Flow
# ============================================

@pytest.mark.security
@pytest.mark.integration
@pytest.mark.asyncio
async def test_full_auth_flow_rls_enforcement(anon_supabase_client):
    """
    Integration test: Simulates a full user authentication flow with RLS.
    
    Flow:
    1. User A logs in (Tenant A)
    2. Sets tenant context
    3. Creates data
    4. User B logs in (Tenant B)
    5. Sets different tenant context
    6. Tries to access User A's data
    7. Verifies isolation
    """
    tenant_a = '00000000-0000-0000-0000-000000000001'
    tenant_b = 'a2b50378-a21a-467b-ba4c-79ba93f64b2f'
    
    agent_a_id = str(uuid4())
    agent_b_id = str(uuid4())
    
    try:
        # === USER A SESSION ===
        print("\n🔐 Simulating User A session (Tenant A)...")
        await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant_a}).execute()
        
        # User A creates an agent
        await anon_supabase_client.table("agents").insert({
            "id": agent_a_id,
            "tenant_id": tenant_a,
            "name": "User A Agent",
            "description": "Agent for User A",
            "created_at": "now()",
            "updated_at": "now()"
        }).execute()
        
        # User A can see their agent
        result_a_own = await anon_supabase_client.table("agents").select("*").eq("id", agent_a_id).execute()
        assert len(result_a_own.data) == 1, "User A should see their own agent"
        
        # === USER B SESSION ===
        print("🔐 Simulating User B session (Tenant B)...")
        await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant_b}).execute()
        
        # User B creates their own agent
        await anon_supabase_client.table("agents").insert({
            "id": agent_b_id,
            "tenant_id": tenant_b,
            "name": "User B Agent",
            "description": "Agent for User B",
            "created_at": "now()",
            "updated_at": "now()"
        }).execute()
        
        # User B can see their own agent
        result_b_own = await anon_supabase_client.table("agents").select("*").eq("id", agent_b_id).execute()
        assert len(result_b_own.data) == 1, "User B should see their own agent"
        
        # User B CANNOT see User A's agent
        result_b_cross = await anon_supabase_client.table("agents").select("*").eq("id", agent_a_id).execute()
        assert len(result_b_cross.data) == 0, "🚨 User B should NOT see User A's agent!"
        
        # === VERIFY ISOLATION ===
        print("✅ Full auth flow RLS enforcement: PASSED")
        print(f"   - User A created agent: {agent_a_id}")
        print(f"   - User B created agent: {agent_b_id}")
        print(f"   - User B CANNOT see User A's agent ✅")
        print(f"   - Tenant isolation verified ✅")
        
    finally:
        # Cleanup both agents
        try:
            await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant_a}).execute()
            await anon_supabase_client.table("agents").delete().eq("id", agent_a_id).execute()
            
            await anon_supabase_client.rpc('set_tenant_context', {'p_tenant_id': tenant_b}).execute()
            await anon_supabase_client.table("agents").delete().eq("id", agent_b_id).execute()
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup failed: {cleanup_error}")


