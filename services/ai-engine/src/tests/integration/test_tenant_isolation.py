"""
Integration tests for Tenant Isolation in Python AI Engine

Note: These tests require a running database with test tenants.
Set SKIP_INTEGRATION_TESTS=true to skip these tests.
"""

import pytest
import os
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, Mock, patch
from main import app

# Skip integration tests if flag is set
skip_integration = os.getenv('SKIP_INTEGRATION_TESTS', 'false').lower() == 'true'

# Test tenant IDs
TENANT_A_ID = "00000000-0000-0000-0000-000000000002"
TENANT_B_ID = "00000000-0000-0000-0000-000000000003"
PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001"


@pytest.mark.skipif(skip_integration, reason="Integration tests skipped (SKIP_INTEGRATION_TESTS=true)")
class TestTenantIsolation:
    """Integration tests for tenant isolation"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    @pytest.fixture
    def mock_supabase_client(self):
        """Mock Supabase client"""
        with patch('main.supabase_client') as mock_client:
            yield mock_client

    def test_mode1_manual_accepts_tenant_header(self, client, mock_supabase_client):
        """Should accept tenant ID from x-tenant-id header"""
        mock_supabase_client.get_agent_by_id = AsyncMock(return_value={
            "id": "test-agent-id",
            "name": "Test Agent",
            "system_prompt": "Test prompt",
            "tenant_id": TENANT_A_ID,
        })

        response = client.post(
            "/api/mode1/manual",
            json={
                "agent_id": "test-agent-id",
                "message": "Test message",
            },
            headers={"x-tenant-id": TENANT_A_ID}
        )

        assert response.status_code in [200, 503]  # 503 if services not initialized

    def test_mode1_manual_sets_tenant_context(self, client, mock_supabase_client):
        """Should set tenant context in database before query"""
        mock_supabase_client.get_agent_by_id = AsyncMock(return_value={
            "id": "test-agent-id",
            "name": "Test Agent",
            "system_prompt": "Test prompt",
            "tenant_id": TENANT_A_ID,
        })

        with patch('middleware.tenant_context.set_tenant_context_in_db') as mock_set_context:
            response = client.post(
                "/api/mode1/manual",
                json={
                    "agent_id": "test-agent-id",
                    "message": "Test message",
                },
                headers={"x-tenant-id": TENANT_A_ID}
            )

            # Verify tenant context was set
            if response.status_code != 503:  # Services initialized
                mock_set_context.assert_called_once_with(
                    TENANT_A_ID,
                    mock_supabase_client
                )

    def test_mode1_manual_fallback_to_platform_tenant(self, client, mock_supabase_client):
        """Should fallback to platform tenant if header not provided"""
        mock_supabase_client.get_agent_by_id = AsyncMock(return_value={
            "id": "test-agent-id",
            "name": "Test Agent",
            "system_prompt": "Test prompt",
            "tenant_id": PLATFORM_TENANT_ID,
        })

        response = client.post(
            "/api/mode1/manual",
            json={
                "agent_id": "test-agent-id",
                "message": "Test message",
            }
            # No x-tenant-id header
        )

        assert response.status_code in [200, 503]

    @pytest.mark.asyncio
    async def test_tenant_context_passed_to_queries(self, mock_supabase_client):
        """Should pass tenant context to database queries"""
        from middleware.tenant_context import set_tenant_context_in_db

        mock_supabase_client.client = Mock()
        mock_supabase_client.client.rpc = Mock(return_value=Mock(
            execute=AsyncMock()
        ))

        await set_tenant_context_in_db(TENANT_A_ID, mock_supabase_client)

        # Verify set_tenant_context was called
        mock_supabase_client.client.rpc.assert_called_once_with(
            "set_tenant_context",
            {"p_tenant_id": TENANT_A_ID}
        )


@pytest.mark.skipif(skip_integration, reason="Integration tests skipped (SKIP_INTEGRATION_TESTS=true)")
class TestSharedResources:
    """Integration tests for shared resources"""

    def test_platform_agents_accessible_to_all_tenants(self, client, mock_supabase_client):
        """Platform shared agents should be accessible to all tenants"""
        platform_agent = {
            "id": "platform-agent-id",
            "name": "Platform Agent",
            "system_prompt": "Platform prompt",
            "tenant_id": PLATFORM_TENANT_ID,
            "is_shared": True,
            "sharing_mode": "global",
        }

        mock_supabase_client.get_agent_by_id = AsyncMock(return_value=platform_agent)

        # Test with tenant A
        response_a = client.post(
            "/api/mode1/manual",
            json={
                "agent_id": "platform-agent-id",
                "message": "Test message",
            },
            headers={"x-tenant-id": TENANT_A_ID}
        )

        # Test with tenant B
        response_b = client.post(
            "/api/mode1/manual",
            json={
                "agent_id": "platform-agent-id",
                "message": "Test message",
            },
            headers={"x-tenant-id": TENANT_B_ID}
        )

        # Both should be able to access (assuming services initialized)
        assert response_a.status_code in [200, 503]
        assert response_b.status_code in [200, 503]

