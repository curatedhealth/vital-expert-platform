# NOTE: This is a lightweight copy of the shared kernel package so the AI engine
# can run in isolated deployment contexts (e.g. Docker builds limited to the
# services/ai-engine directory). Keep this file in sync with
# services/shared-kernel/src/vital_shared_kernel/__init__.py.

from .multi_tenant import (  # noqa: F401
    InvalidTenantIdError,
    TenantContext,
    TenantContextNotSetError,
    TenantError,
    TenantId,
    TenantMismatchError,
    TenantNotFoundError,
    TenantValidationError,
    UnauthorizedTenantAccessError,
)

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
