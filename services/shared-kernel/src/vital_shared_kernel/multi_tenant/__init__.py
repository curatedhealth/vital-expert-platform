"""
Multi-Tenant Shared Kernel

Provides core multi-tenant infrastructure for VITAL platform.
"""

from .tenant_id import TenantId, InvalidTenantIdError
from .tenant_context import TenantContext
from .errors import (
    TenantError,
    TenantContextNotSetError,
    TenantMismatchError,
    TenantNotFoundError,
    UnauthorizedTenantAccessError,
    TenantValidationError,
)

__all__ = [
    # Value Objects
    "TenantId",
    
    # Context Management
    "TenantContext",
    
    # Errors
    "TenantError",
    "TenantContextNotSetError",
    "InvalidTenantIdError",
    "TenantMismatchError",
    "TenantNotFoundError",
    "UnauthorizedTenantAccessError",
    "TenantValidationError",
]

