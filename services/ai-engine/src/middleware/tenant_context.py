"""
Tenant Context Middleware for FastAPI

Extracts tenant context from x-tenant-id header and sets it in request state.
"""

from fastapi import Request, Header, HTTPException
from typing import Optional
import structlog

logger = structlog.get_logger()

# Platform Tenant ID (fallback)
PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001"


def get_tenant_id(
    request: Request,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id")
) -> str:
    """
    Extract tenant ID from request headers.
    
    Priority:
    1. x-tenant-id header (explicit override)
    2. Fallback to platform tenant
    
    Args:
        request: FastAPI request object
        x_tenant_id: x-tenant-id header value
        
    Returns:
        Tenant ID string
    """
    tenant_id = x_tenant_id or PLATFORM_TENANT_ID
    
    # Store in request state for use in other dependencies
    request.state.tenant_id = tenant_id
    
    # Log tenant detection
    logger.debug(
        "tenant_detected",
        tenant_id=tenant_id,
        detection_method="header" if x_tenant_id else "fallback",
        path=request.url.path
    )
    
    return tenant_id


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
