"""
Tenant Context Management

Provides thread-safe and async-safe storage for current tenant ID.
Uses contextvars for request-scoped isolation.
"""

from contextvars import ContextVar
from typing import Optional
import logging

from .tenant_id import TenantId
from .errors import TenantContextNotSetError

logger = logging.getLogger(__name__)

# Context variable to store current tenant
# Each request/task gets its own isolated value
_tenant_context: ContextVar[Optional[TenantId]] = ContextVar(
    'tenant_context', 
    default=None
)


class TenantContext:
    """
    Manages tenant context using context variables.
    
    Thread-safe and async-safe storage for current tenant ID.
    Automatically isolated per-request in FastAPI.
    
    Usage:
        # In middleware
        TenantContext.set(TenantId.from_string("11111111-1111-1111-1111-111111111111"))
        
        # In service
        tenant_id = TenantContext.get()  # Returns TenantId
        
        # After request
        TenantContext.clear()
    """
    
    @staticmethod
    def set(tenant_id: TenantId) -> None:
        """
        Set the current tenant context.
        
        Args:
            tenant_id: TenantId to set as current
        
        Side Effects:
            Sets context variable for current request/task
        """
        _tenant_context.set(tenant_id)
        logger.debug(f"Tenant context set: {tenant_id}")
    
    @staticmethod
    def get() -> TenantId:
        """
        Get the current tenant context.
        
        Returns:
            Current TenantId
        
        Raises:
            TenantContextNotSetError: If context not set
        """
        tenant_id = _tenant_context.get()
        if tenant_id is None:
            raise TenantContextNotSetError(
                "Tenant context not set. Ensure TenantMiddleware is installed."
            )
        return tenant_id
    
    @staticmethod
    def get_optional() -> Optional[TenantId]:
        """
        Get tenant context without raising error if not set.
        
        Returns:
            TenantId if set, None otherwise
        """
        return _tenant_context.get()
    
    @staticmethod
    def clear() -> None:
        """Clear the tenant context."""
        _tenant_context.set(None)
        logger.debug("Tenant context cleared")
    
    @staticmethod
    def is_set() -> bool:
        """
        Check if tenant context is set.
        
        Returns:
            True if context is set, False otherwise
        """
        return _tenant_context.get() is not None
    
    @staticmethod
    def get_value() -> Optional[str]:
        """
        Get the tenant ID value as string (convenience method).
        
        Returns:
            Tenant ID string if set, None otherwise
        """
        tenant_id = _tenant_context.get()
        return str(tenant_id) if tenant_id else None

