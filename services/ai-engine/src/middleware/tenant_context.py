"""
Tenant Context Middleware for FastAPI

Extracts tenant context from x-tenant-id header and sets it in request state.
Now enhanced with type-safe TenantId and thread-safe TenantContext.
"""

from fastapi import Request, Header, HTTPException
from typing import Optional
import structlog

# Import from shared-kernel
try:
    from vital_shared_kernel.multi_tenant import (
        TenantId,
        TenantContext,
        InvalidTenantIdError
    )
    SHARED_KERNEL_AVAILABLE = True
except ImportError:
    # Fallback if shared-kernel not installed
    SHARED_KERNEL_AVAILABLE = False
    TenantId = None
    TenantContext = None
    InvalidTenantIdError = ValueError

logger = structlog.get_logger()

# Canonical Tenant ID - Single source of truth for single-tenant deployment
# All entities (agents, missions, templates) must use this tenant_id
CANONICAL_TENANT_ID = "00000000-0000-0000-0000-000000000001"

# Alias for backward compatibility
PLATFORM_TENANT_ID = CANONICAL_TENANT_ID


def get_tenant_id(
    request: Request,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id")
) -> str:
    """
    Extract tenant ID from request headers and set in context.
    
    Now enhanced with:
    - Type-safe TenantId validation
    - Thread-safe TenantContext storage
    - Automatic validation
    
    Priority:
    1. x-tenant-id header (explicit override)
    2. Fallback to platform tenant
    
    Args:
        request: FastAPI request object
        x_tenant_id: x-tenant-id header value
        
    Returns:
        Tenant ID string
        
    Raises:
        HTTPException: If tenant ID format is invalid
    """
    tenant_id_str = x_tenant_id or PLATFORM_TENANT_ID
    
    # If shared-kernel is available, use type-safe TenantId
    if SHARED_KERNEL_AVAILABLE and TenantId is not None:
        try:
            # Create type-safe TenantId with validation
            tenant_id_obj = TenantId.from_string(tenant_id_str)
            
            # Set in thread-safe context
            TenantContext.set(tenant_id_obj)
            
            # Store in request state for backward compatibility
            request.state.tenant_id = str(tenant_id_obj)
            
            logger.debug(
                "tenant_detected",
                tenant_id=str(tenant_id_obj),
                detection_method="header" if x_tenant_id else "fallback",
                path=request.url.path,
                type_safe=True
            )
            
            return str(tenant_id_obj)
            
        except (InvalidTenantIdError, ValueError) as e:
            logger.error(
                "invalid_tenant_id",
                tenant_id=tenant_id_str,
                error=str(e)
            )
            raise HTTPException(
                status_code=400,
                detail=f"Invalid tenant ID format: {tenant_id_str}"
            )
    else:
        # Fallback to string-based approach (backward compatibility)
        request.state.tenant_id = tenant_id_str
        
        logger.debug(
            "tenant_detected",
            tenant_id=tenant_id_str,
            detection_method="header" if x_tenant_id else "fallback",
            path=request.url.path,
            type_safe=False
        )
        
        return tenant_id_str


async def set_tenant_context_in_db(
    tenant_id: str,
    supabase_client=None
) -> None:
    """
    Set tenant context in database session for RLS.
    
    This calls the set_tenant_context() function in PostgreSQL
    to set the app.tenant_id session variable for RLS policies.
    
    Args:
        tenant_id: Tenant ID to set
        supabase_client: Optional Supabase client (if None, skips DB call)
    """
    if not supabase_client:
        return
    
    try:
        # Call set_tenant_context PostgreSQL function
        result = supabase_client.client.rpc(
            "set_tenant_context",
            {"p_tenant_id": tenant_id}
        ).execute()
        
        logger.debug(
            "tenant_context_set",
            tenant_id=tenant_id,
            success=True
        )
    except Exception as e:
        logger.warning(
            "tenant_context_set_failed",
            tenant_id=tenant_id,
            error=str(e)
        )
        # Don't raise - continue without tenant context (fallback to RLS)
