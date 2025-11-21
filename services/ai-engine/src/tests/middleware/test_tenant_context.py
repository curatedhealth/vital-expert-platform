"""
Unit tests for Tenant Context Middleware
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi import Request
from middleware.tenant_context import (
    get_tenant_id,
    set_tenant_context_in_db,
    PLATFORM_TENANT_ID
)


class TestGetTenantId:
    """Tests for get_tenant_id dependency"""

    @pytest.fixture
    def mock_request(self):
        """Create a mock FastAPI request"""
        request = Mock(spec=Request)
        request.state = Mock()
        request.url = Mock()
        request.url.path = "/api/test"
        return request

    def test_extracts_tenant_from_header(self, mock_request):
        """Should extract tenant ID from x-tenant-id header"""
        tenant_id = "test-tenant-id"
        
        result = get_tenant_id(
            request=mock_request,
            x_tenant_id=tenant_id
        )
        
        assert result == tenant_id
        assert mock_request.state.tenant_id == tenant_id

    def test_fallback_to_platform_tenant(self, mock_request):
        """Should fallback to platform tenant if header not provided"""
        result = get_tenant_id(
            request=mock_request,
            x_tenant_id=None
        )
        
        assert result == PLATFORM_TENANT_ID
        assert mock_request.state.tenant_id == PLATFORM_TENANT_ID

    def test_stores_tenant_in_request_state(self, mock_request):
        """Should store tenant ID in request.state"""
        tenant_id = "test-tenant-id"
        
        get_tenant_id(request=mock_request, x_tenant_id=tenant_id)
        
        assert hasattr(mock_request.state, 'tenant_id')
        assert mock_request.state.tenant_id == tenant_id


class TestSetTenantContextInDb:
    """Tests for set_tenant_context_in_db function"""

    @pytest.fixture
    def mock_supabase_client(self):
        """Create a mock Supabase client"""
        client = Mock()
        client.client = Mock()
        client.client.rpc = Mock(return_value=Mock(execute=AsyncMock()))
        return client

    @pytest.mark.asyncio
    async def test_sets_tenant_context(self, mock_supabase_client):
        """Should call set_tenant_context RPC function"""
        tenant_id = "test-tenant-id"
        
        await set_tenant_context_in_db(tenant_id, mock_supabase_client)
        
        mock_supabase_client.client.rpc.assert_called_once_with(
            "set_tenant_context",
            {"p_tenant_id": tenant_id}
        )
        mock_supabase_client.client.rpc.return_value.execute.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_handles_missing_client_gracefully(self):
        """Should handle None client gracefully"""
        tenant_id = "test-tenant-id"
        
        # Should not raise error
        await set_tenant_context_in_db(tenant_id, None)

    @pytest.mark.asyncio
    async def test_handles_rpc_errors_gracefully(self, mock_supabase_client):
        """Should handle RPC errors gracefully"""
        tenant_id = "test-tenant-id"
        mock_supabase_client.client.rpc.return_value.execute = AsyncMock(
            side_effect=Exception("RPC error")
        )
        
        # Should not raise error
        await set_tenant_context_in_db(tenant_id, mock_supabase_client)

    @pytest.mark.asyncio
    @patch('middleware.tenant_context.logger')
    async def test_logs_success(self, mock_logger, mock_supabase_client):
        """Should log successful tenant context setting"""
        tenant_id = "test-tenant-id"
        
        await set_tenant_context_in_db(tenant_id, mock_supabase_client)
        
        mock_logger.debug.assert_called()
        call_args = mock_logger.debug.call_args[0][0]
        assert call_args == "tenant_context_set"

