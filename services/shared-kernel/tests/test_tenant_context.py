"""
Tests for Tenant Context Management
"""

import pytest
import asyncio
from vital_shared_kernel.multi_tenant import (
    TenantContext,
    TenantId,
    TenantContextNotSetError
)


class TestTenantContextBasic:
    """Test basic tenant context operations"""
    
    def setup_method(self):
        """Clear context before each test"""
        TenantContext.clear()
    
    def teardown_method(self):
        """Clear context after each test"""
        TenantContext.clear()
    
    def test_set_and_get_context(self):
        """Test setting and getting tenant context"""
        tenant_id = TenantId.from_string("11111111-1111-1111-1111-111111111111")
        TenantContext.set(tenant_id)
        
        retrieved = TenantContext.get()
        assert retrieved == tenant_id
    
    def test_get_without_set_raises_error(self):
        """Test that getting context without setting raises error"""
        with pytest.raises(TenantContextNotSetError):
            TenantContext.get()
    
    def test_get_optional_without_set(self):
        """Test get_optional returns None when not set"""
        result = TenantContext.get_optional()
        assert result is None
    
    def test_get_optional_with_set(self):
        """Test get_optional returns value when set"""
        tenant_id = TenantId.from_string("11111111-1111-1111-1111-111111111111")
        TenantContext.set(tenant_id)
        
        result = TenantContext.get_optional()
        assert result == tenant_id
    
    def test_is_set(self):
        """Test is_set method"""
        assert TenantContext.is_set() is False
        
        tenant_id = TenantId.from_string("11111111-1111-1111-1111-111111111111")
        TenantContext.set(tenant_id)
        
        assert TenantContext.is_set() is True
        
        TenantContext.clear()
        assert TenantContext.is_set() is False
    
    def test_get_value_string(self):
        """Test get_value returns string"""
        tenant_id = TenantId.from_string("11111111-1111-1111-1111-111111111111")
        TenantContext.set(tenant_id)
        
        value = TenantContext.get_value()
        assert value == "11111111-1111-1111-1111-111111111111"
        assert isinstance(value, str)
    
    def test_clear(self):
        """Test clearing context"""
        tenant_id = TenantId.from_string("11111111-1111-1111-1111-111111111111")
        TenantContext.set(tenant_id)
        assert TenantContext.is_set() is True
        
        TenantContext.clear()
        assert TenantContext.is_set() is False


class TestTenantContextIsolation:
    """Test that context is isolated between async tasks"""
    
    async def task_with_tenant(self, tenant_id: str, results: list):
        """Async task that sets and verifies its own tenant context"""
        # Set context for this task
        TenantContext.set(TenantId.from_string(tenant_id))
        
        # Simulate some async work
        await asyncio.sleep(0.01)
        
        # Verify context is still correct
        retrieved = TenantContext.get()
        results.append(str(retrieved))
    
    @pytest.mark.asyncio
    async def test_concurrent_contexts_isolated(self):
        """Test that concurrent tasks have isolated contexts"""
        results = []
        
        # Run multiple tasks concurrently with different tenants
        await asyncio.gather(
            self.task_with_tenant("11111111-1111-1111-1111-111111111111", results),
            self.task_with_tenant("22222222-2222-2222-2222-222222222222", results),
            self.task_with_tenant("33333333-3333-3333-3333-333333333333", results),
        )
        
        # Each task should have gotten its own tenant ID
        assert "11111111-1111-1111-1111-111111111111" in results
        assert "22222222-2222-2222-2222-222222222222" in results
        assert "33333333-3333-3333-3333-333333333333" in results
        assert len(results) == 3

