"""
TenantId Value Object

Immutable, type-safe representation of a tenant identifier.
Enforces UUID format and provides utility methods.
"""

from dataclasses import dataclass
from typing import Optional
import uuid


class InvalidTenantIdError(ValueError):
    """Raised when tenant ID format is invalid"""
    pass


@dataclass(frozen=True)
class TenantId:
    """
    Value object representing a tenant identifier.
    
    Properties:
    - Immutable (frozen=True)
    - Type-safe
    - UUID format validated on creation
    - Supports equality comparison
    - Hashable (can be used in sets/dicts)
    
    Examples:
        >>> tenant_id = TenantId(value="11111111-1111-1111-1111-111111111111")
        >>> str(tenant_id)
        '11111111-1111-1111-1111-111111111111'
        
        >>> TenantId(value="invalid")
        InvalidTenantIdError: Invalid tenant ID format: invalid
    """
    
    value: str
    
    def __post_init__(self):
        """Validate tenant ID format on creation"""
        if not self.value:
            raise InvalidTenantIdError("Tenant ID cannot be empty")
        
        # Validate UUID format
        try:
            uuid.UUID(self.value)
        except ValueError:
            raise InvalidTenantIdError(f"Invalid tenant ID format: {self.value}")
    
    def __str__(self) -> str:
        """String representation (returns UUID)"""
        return self.value
    
    def __repr__(self) -> str:
        """Developer representation"""
        return f"TenantId('{self.value}')"
    
    def __eq__(self, other) -> bool:
        """Equality comparison"""
        if isinstance(other, TenantId):
            return self.value == other.value
        return False
    
    def __hash__(self) -> int:
        """Make hashable (for use in sets/dicts)"""
        return hash(self.value)
    
    @classmethod
    def from_string(cls, value: str) -> "TenantId":
        """
        Factory method to create TenantId from string.
        
        Args:
            value: UUID string (with or without dashes)
        
        Returns:
            TenantId instance
        
        Raises:
            InvalidTenantIdError: If format is invalid
        """
        return cls(value=value)
    
    @classmethod
    def platform_tenant(cls) -> "TenantId":
        """
        Return the platform admin tenant ID.
        This is a reserved tenant for system operations.
        """
        return cls(value="00000000-0000-0000-0000-000000000001")
    
    def to_dict(self) -> dict:
        """Convert to dictionary (for JSON serialization)"""
        return {"value": self.value}
    
    @classmethod
    def from_dict(cls, data: dict) -> "TenantId":
        """Create from dictionary"""
        return cls(value=data["value"])

