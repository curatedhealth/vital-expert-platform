"""
Tests for TenantAwareSupabaseClient
"""

import pytest
from unittest.mock import Mock, AsyncMock, MagicMock
from vital_shared_kernel.multi_tenant import TenantId, TenantContext, TenantContextNotSetError

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from services.tenant_aware_supabase import TenantAwareSupabaseClient, create_tenant_aware_client


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client"""
    client = Mock()
    client.client = Mock()
    client.set_tenant_context = AsyncMock()
    return client


@pytest.fixture
def tenant_id():
    """Test tenant ID"""
    return TenantId.from_string("12345678-1234-1234-1234-123456789012")


@pytest.fixture
def tenant_aware_client(mock_supabase_client):
    """Tenant-aware client instance"""
    return TenantAwareSupabaseClient(mock_supabase_client)


class TestTenantAwareSupabaseClient:
    """Test suite for TenantAwareSupabaseClient"""
    
    def test_initialization(self, mock_supabase_client):
        """Test client initialization"""
        client = TenantAwareSupabaseClient(mock_supabase_client)
        assert client._client == mock_supabase_client
        assert client.raw_client == mock_supabase_client
    
    def test_get_current_tenant_without_context(self, tenant_aware_client):
        """Test getting tenant when context not set raises error"""
        TenantContext.clear()
        
        with pytest.raises(TenantContextNotSetError):
            tenant_aware_client._get_current_tenant()
    
    def test_get_current_tenant_with_context(self, tenant_aware_client, tenant_id):
        """Test getting tenant from context"""
        TenantContext.set(tenant_id)
        
        result = tenant_aware_client._get_current_tenant()
        
        assert result == tenant_id
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_set_tenant_context_in_db(self, tenant_aware_client, tenant_id):
        """Test setting tenant context in database"""
        TenantContext.set(tenant_id)
        
        await tenant_aware_client.set_tenant_context_in_db()
        
        tenant_aware_client._client.set_tenant_context.assert_called_once_with(str(tenant_id))
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_insert_adds_tenant_id(self, tenant_aware_client, tenant_id, mock_supabase_client):
        """Test insert automatically adds tenant_id"""
        TenantContext.set(tenant_id)
        
        # Mock the table().insert() chain
        mock_table = Mock()
        mock_insert = Mock()
        mock_execute = Mock()
        mock_execute.data = [{"id": "record-123", "name": "test"}]
        
        mock_table.return_value = mock_insert
        mock_insert.insert.return_value = mock_execute
        mock_execute.execute.return_value = mock_execute
        
        mock_supabase_client.client.table = mock_table
        
        data = {"name": "test"}
        result = await tenant_aware_client.insert("board_session", data)
        
        # Verify tenant_id was added to data
        mock_insert.insert.assert_called_once()
        call_args = mock_insert.insert.call_args[0][0]
        assert call_args["tenant_id"] == str(tenant_id)
        assert call_args["name"] == "test"
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_query_adds_tenant_filter(self, tenant_aware_client, tenant_id, mock_supabase_client):
        """Test query automatically filters by tenant_id"""
        TenantContext.set(tenant_id)
        
        # Mock the table().select().eq() chain
        mock_table = Mock()
        mock_select = Mock()
        mock_eq = Mock()
        
        mock_table.return_value = mock_select
        mock_select.select.return_value = mock_eq
        mock_eq.eq.return_value = mock_eq
        
        mock_supabase_client.client.table = mock_table
        
        tenant_aware_client.query("board_session")
        
        # Verify tenant filter was applied
        mock_eq.eq.assert_called_with("tenant_id", str(tenant_id))
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_update_validates_tenant(self, tenant_aware_client, tenant_id, mock_supabase_client):
        """Test update validates record belongs to tenant"""
        TenantContext.set(tenant_id)
        
        # Mock record doesn't exist for tenant
        mock_table = Mock()
        mock_select = Mock()
        mock_eq1 = Mock()
        mock_eq2 = Mock()
        mock_execute = Mock()
        mock_execute.data = []  # No records found
        
        mock_table.return_value = mock_select
        mock_select.select.return_value = mock_eq1
        mock_eq1.eq.return_value = mock_eq2
        mock_eq2.eq.return_value = mock_execute
        mock_execute.execute.return_value = mock_execute
        
        mock_supabase_client.client.table = mock_table
        
        with pytest.raises(ValueError, match="not found for tenant"):
            await tenant_aware_client.update("board_session", "record-123", {"name": "updated"})
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_list_all_filters_by_tenant(self, tenant_aware_client, tenant_id, mock_supabase_client):
        """Test list_all filters by tenant_id"""
        TenantContext.set(tenant_id)
        
        # Mock list query
        mock_table = Mock()
        mock_select = Mock()
        mock_eq = Mock()
        mock_execute = Mock()
        mock_execute.data = [{"id": "1"}, {"id": "2"}]
        
        mock_table.return_value = mock_select
        mock_select.select.return_value = mock_eq
        mock_eq.eq.return_value = mock_execute
        mock_execute.execute.return_value = mock_execute
        
        mock_supabase_client.client.table = mock_table
        
        result = await tenant_aware_client.list_all("board_session")
        
        # Verify tenant filter was applied
        mock_eq.eq.assert_called_with("tenant_id", str(tenant_id))
        assert len(result) == 2
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_tenant_context_manager(self, tenant_aware_client, tenant_id):
        """Test tenant context manager"""
        other_tenant = TenantId.from_string("87654321-4321-4321-4321-210987654321")
        
        # Set initial tenant
        TenantContext.set(tenant_id)
        
        # Use context manager to temporarily switch
        async with tenant_aware_client.tenant_context(other_tenant):
            assert TenantContext.get() == other_tenant
        
        # Should restore original tenant
        assert TenantContext.get() == tenant_id
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_count_with_filters(self, tenant_aware_client, tenant_id, mock_supabase_client):
        """Test count with additional filters"""
        TenantContext.set(tenant_id)
        
        # Mock count query
        mock_table = Mock()
        mock_select = Mock()
        mock_eq1 = Mock()
        mock_eq2 = Mock()
        mock_execute = Mock()
        mock_execute.count = 5
        
        mock_table.return_value = mock_select
        mock_select.select.return_value = mock_eq1
        mock_eq1.eq.return_value = mock_eq2
        mock_eq2.eq.return_value = mock_execute
        mock_execute.execute.return_value = mock_execute
        
        mock_supabase_client.client.table = mock_table
        
        count = await tenant_aware_client.count("board_session", filters={"status": "active"})
        
        assert count == 5
        # Verify tenant filter and additional filter were applied
        assert mock_eq1.eq.call_count >= 1
        assert mock_eq2.eq.call_count >= 1
        
        TenantContext.clear()


def test_create_tenant_aware_client():
    """Test factory function"""
    mock_client = Mock()
    result = create_tenant_aware_client(mock_client)
    
    assert isinstance(result, TenantAwareSupabaseClient)
    assert result._client == mock_client

