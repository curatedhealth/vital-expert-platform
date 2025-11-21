"""
Multi-tenant error definitions copied locally for isolated deployments.
Keep in sync with services/shared-kernel/src/vital_shared_kernel/multi_tenant/errors.py.
"""


class TenantError(Exception):
    """Base exception for tenant-related errors."""


class TenantContextNotSetError(TenantError):
    """Raised when trying to access tenant context that hasn't been set."""


class InvalidTenantIdError(ValueError, TenantError):
    """Raised when tenant ID format is invalid."""


class TenantMismatchError(TenantError):
    """Raised when operation is attempted on the wrong tenant's data."""


class TenantNotFoundError(TenantError):
    """Raised when a tenant doesn't exist."""


class UnauthorizedTenantAccessError(TenantError):
    """Raised when a user tries to access a tenant they don't belong to."""


class TenantValidationError(TenantError):
    """Raised when tenant validation fails."""
