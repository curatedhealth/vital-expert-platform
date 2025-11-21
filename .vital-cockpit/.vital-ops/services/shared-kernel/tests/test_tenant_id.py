"""
Tests for TenantId Value Object
"""

import pytest
from vital_shared_kernel.multi_tenant.tenant_id import TenantId, InvalidTenantIdError


class TestTenantIdCreation:
    """Test TenantId creation and validation"""
    
    def test_valid_tenant_id_with_dashes(self):
        """Test creating TenantId with dashed UUID"""
        tenant_id = TenantId(value="11111111-1111-1111-1111-111111111111")
        assert str(tenant_id) == "11111111-1111-1111-1111-111111111111"
    
    def test_valid_tenant_id_without_dashes(self):
        """Test creating TenantId with UUID without dashes"""
        tenant_id = TenantId(value="11111111111111111111111111111111")
        assert str(tenant_id) == "11111111111111111111111111111111"
    
    def test_invalid_tenant_id_format(self):
        """Test that invalid UUID format raises error"""
        with pytest.raises(InvalidTenantIdError):
            TenantId(value="invalid-uuid-format")
    
    def test_empty_tenant_id(self):
        """Test that empty string raises error"""
        with pytest.raises(InvalidTenantIdError):
            TenantId(value="")
    
    def test_from_string_factory(self):
        """Test from_string factory method"""
        tenant_id = TenantId.from_string("11111111-1111-1111-1111-111111111111")
        assert isinstance(tenant_id, TenantId)
        assert str(tenant_id) == "11111111-1111-1111-1111-111111111111"
    
    def test_platform_tenant(self):
        """Test platform_tenant class method"""
        platform = TenantId.platform_tenant()
        assert str(platform) == "00000000-0000-0000-0000-000000000001"


class TestTenantIdEquality:
    """Test TenantId equality and hashing"""
    
    def test_equality_same_value(self):
        """Test that two TenantIds with same value are equal"""
        id1 = TenantId(value="11111111-1111-1111-1111-111111111111")
        id2 = TenantId(value="11111111-1111-1111-1111-111111111111")
        assert id1 == id2
    
    def test_inequality_different_values(self):
        """Test that TenantIds with different values are not equal"""
        id1 = TenantId(value="11111111-1111-1111-1111-111111111111")
        id2 = TenantId(value="22222222-2222-2222-2222-222222222222")
        assert id1 != id2
    
    def test_not_equal_to_string(self):
        """Test that TenantId is not equal to string"""
        tenant_id = TenantId(value="11111111-1111-1111-1111-111111111111")
        assert tenant_id != "11111111-1111-1111-1111-111111111111"
    
    def test_hashable(self):
        """Test that TenantId can be used in sets and dicts"""
        id1 = TenantId(value="11111111-1111-1111-1111-111111111111")
        id2 = TenantId(value="22222222-2222-2222-2222-222222222222")
        
        # Can create set
        tenant_set = {id1, id2}
        assert len(tenant_set) == 2
        
        # Can use as dict key
        tenant_dict = {id1: "Tenant 1", id2: "Tenant 2"}
        assert tenant_dict[id1] == "Tenant 1"


class TestTenantIdImmutability:
    """Test that TenantId is immutable"""
    
    def test_cannot_modify_value(self):
        """Test that value cannot be changed after creation"""
        tenant_id = TenantId(value="11111111-1111-1111-1111-111111111111")
        
        with pytest.raises(AttributeError):
            tenant_id.value = "22222222-2222-2222-2222-222222222222"


class TestTenantIdSerialization:
    """Test TenantId serialization"""
    
    def test_to_dict(self):
        """Test converting to dictionary"""
        tenant_id = TenantId(value="11111111-1111-1111-1111-111111111111")
        data = tenant_id.to_dict()
        assert data == {"value": "11111111-1111-1111-1111-111111111111"}
    
    def test_from_dict(self):
        """Test creating from dictionary"""
        data = {"value": "11111111-1111-1111-1111-111111111111"}
        tenant_id = TenantId.from_dict(data)
        assert isinstance(tenant_id, TenantId)
        assert str(tenant_id) == "11111111-1111-1111-1111-111111111111"

