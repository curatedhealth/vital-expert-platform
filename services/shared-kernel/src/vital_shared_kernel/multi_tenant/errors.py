"""
Multi-Tenant Error Types

Custom exceptions for multi-tenant operations.
"""


class TenantError(Exception):
    """Base exception for tenant-related errors"""
    pass


class TenantContextNotSetError(TenantError):
    """Raised when trying to access tenant context that hasn't been set"""
    pass


class InvalidTenantIdError(ValueError, TenantError):
    """Raised when tenant ID format is invalid"""
    pass


class TenantMismatchError(TenantError):
    """Raised when operation is attempted on wrong tenant's data"""
    pass


class TenantNotFoundError(TenantError):
    """Raised when tenant doesn't exist"""
    pass


class UnauthorizedTenantAccessError(TenantError):
    """Raised when user tries to access tenant they don't belong to"""
    pass


class TenantValidationError(TenantError):
    """Raised when tenant validation fails"""
    pass

