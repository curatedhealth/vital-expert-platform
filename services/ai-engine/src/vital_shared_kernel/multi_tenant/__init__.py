"""
Multi-tenant shared kernel primitives duplicated locally for Docker builds.
Keep this module in sync with services/shared-kernel/src/vital_shared_kernel/multi_tenant.
"""

from .errors import (  # noqa: F401
    TenantContextNotSetError,
    TenantError,
    TenantMismatchError,
    TenantNotFoundError,
    TenantValidationError,
    UnauthorizedTenantAccessError,
)
from .tenant_context import TenantContext  # noqa: F401
from .tenant_id import InvalidTenantIdError, TenantId  # noqa: F401

__all__ = [
    "TenantId",
    "TenantContext",
    "TenantError",
    "TenantContextNotSetError",
    "InvalidTenantIdError",
    "TenantMismatchError",
    "TenantNotFoundError",
    "UnauthorizedTenantAccessError",
    "TenantValidationError",
]
