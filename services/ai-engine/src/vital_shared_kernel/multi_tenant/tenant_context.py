"""
Tenant context manager duplicated locally to avoid relying on the shared
kernel package during Docker builds. Keep this file in sync with
services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_context.py.
"""

from contextvars import ContextVar
from typing import Optional
import logging

from .tenant_id import TenantId
from .errors import TenantContextNotSetError

logger = logging.getLogger(__name__)

_tenant_context: ContextVar[Optional[TenantId]] = ContextVar(
    "tenant_context",
    default=None,
)


class TenantContext:
    """Thread-safe and async-safe tenant context storage."""

    @staticmethod
    def set(tenant_id: TenantId) -> None:
        _tenant_context.set(tenant_id)
        logger.debug("Tenant context set: %s", tenant_id)

    @staticmethod
    def get() -> TenantId:
        tenant_id = _tenant_context.get()
        if tenant_id is None:
            raise TenantContextNotSetError(
                "Tenant context not set. Ensure TenantMiddleware is installed."
            )
        return tenant_id

    @staticmethod
    def get_optional() -> Optional[TenantId]:
        return _tenant_context.get()

    @staticmethod
    def clear() -> None:
        _tenant_context.set(None)
        logger.debug("Tenant context cleared")

    @staticmethod
    def is_set() -> bool:
        return _tenant_context.get() is not None

    @staticmethod
    def get_value() -> Optional[str]:
        tenant_id = _tenant_context.get()
        return str(tenant_id) if tenant_id else None
