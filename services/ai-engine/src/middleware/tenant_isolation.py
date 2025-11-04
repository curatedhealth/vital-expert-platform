"""
Tenant Isolation Middleware for VITAL Path AI Services
Enforces Row-Level Security (RLS) and tenant context isolation

Enhanced with shared-kernel multi-tenant components for type safety.
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from typing import Callable, Optional
import structlog

# Import from shared-kernel
from vital_shared_kernel.multi_tenant import (
    TenantId,
    TenantContext,
    InvalidTenantIdError
)

logger = structlog.get_logger()


class TenantIsolationMiddleware(BaseHTTPMiddleware):
    """
    Middleware to enforce tenant isolation via RLS.
    
    This middleware:
    1. Extracts tenant_id from request headers (x-tenant-id)
    2. Validates tenant_id format (must be valid UUID)
    3. Sets tenant context in request state
    4. Sets tenant context in database for RLS enforcement
    5. Allows public endpoints (health, docs) without tenant_id
    """
    
    PUBLIC_PATHS = [
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/",
        "/frameworks/info"  # Framework availability info (no tenant needed)
    ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process each request and enforce tenant isolation.
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/route handler
            
        Returns:
            Response from next handler
            
        Raises:
            HTTPException: If tenant_id is missing or invalid for protected endpoints
        """
        # Skip auth for public endpoints
        if request.url.path in self.PUBLIC_PATHS:
            logger.debug("Public endpoint accessed", path=request.url.path)
            return await call_next(request)
        
        # Extract tenant ID from headers
        tenant_id_str = request.headers.get("x-tenant-id")
        
        if not tenant_id_str:
            logger.warning(
                "Missing tenant_id in request",
                path=request.url.path,
                method=request.method
            )
            raise HTTPException(
                status_code=401,
                detail={
                    "error": "Missing tenant ID",
                    "message": "x-tenant-id header is required for this endpoint",
                    "documentation": "Please include a valid tenant UUID in the x-tenant-id header"
                }
            )
        
        # Create type-safe TenantId with validation
        try:
            tenant_id = TenantId.from_string(tenant_id_str)
        except (InvalidTenantIdError, ValueError) as e:
            logger.warning(
                "Invalid tenant_id format",
                tenant_id=tenant_id_str,
                path=request.url.path,
                error=str(e)
            )
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid tenant ID format",
                    "message": "tenant_id must be a valid UUID",
                    "received": tenant_id_str
                }
            )
        
        # Set type-safe tenant context (thread-safe, async-safe)
        TenantContext.set(tenant_id)
        
        # Also set in request state for backward compatibility
        request.state.tenant_id = str(tenant_id)
        
        # Set tenant context in database for RLS
        # This will be used by Supabase client to filter queries
        await self._set_tenant_context_in_db(request, str(tenant_id))
        
        logger.info(
            "Tenant context established",
            tenant_id=str(tenant_id),
            path=request.url.path,
            method=request.method,
            type_safe=True
        )
        
        try:
            # Process request with tenant context
            response = await call_next(request)
            
            # Add tenant ID to response headers for tracing
            response.headers["x-tenant-id"] = str(tenant_id)
            
            return response
        finally:
            # Clear tenant context after request (important for connection pooling)
            TenantContext.clear()
    
    async def _set_tenant_context_in_db(self, request: Request, tenant_id: str) -> None:
        """
        Set tenant context in database for RLS enforcement.
        
        This method retrieves the Supabase client from the request app state
        and sets the tenant context for RLS policies.
        
        Args:
            request: FastAPI request object
            tenant_id: The tenant ID to set
            
        Raises:
            HTTPException: If Supabase client is not available
        """
        try:
            # Get Supabase client from app state (initialized in main.py)
            if not hasattr(request.app.state, "supabase_client"):
                logger.error("Supabase client not found in app state")
                raise HTTPException(
                    status_code=500,
                    detail="Database client not initialized"
                )
            
            supabase_client = request.app.state.supabase_client
            
            # Set tenant context for RLS enforcement
            await supabase_client.set_tenant_context(tenant_id)
            
            logger.debug("Tenant context set in database", tenant_id=tenant_id)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Failed to set tenant context in database",
                tenant_id=tenant_id,
                error=str(e)
            )
            # Don't fail the request if tenant context setting fails
            # This allows graceful degradation
            pass


class PlatformAdminBypass:
    """
    Middleware to allow platform admins to bypass tenant isolation.
    
    This is used for:
    - Platform administration endpoints
    - Cross-tenant analytics
    - System monitoring and diagnostics
    
    Security Note: This should only be used for specific admin endpoints
    and requires proper authentication/authorization checks.
    """
    
    ADMIN_PATHS_PREFIX = [
        "/admin/",
        "/platform/",
        "/system/"
    ]
    
    @staticmethod
    def is_admin_endpoint(path: str) -> bool:
        """Check if path is an admin endpoint"""
        return any(path.startswith(prefix) for prefix in PlatformAdminBypass.ADMIN_PATHS_PREFIX)
    
    @staticmethod
    async def verify_admin_permissions(request: Request) -> bool:
        """
        Verify admin permissions from request.
        
        TODO: Implement proper admin permission check
        - Verify JWT token
        - Check admin role in database
        - Validate permissions
        
        Args:
            request: FastAPI request object
            
        Returns:
            True if user has admin permissions, False otherwise
        """
        # Placeholder - implement proper admin verification
        admin_token = request.headers.get("x-admin-token")
        # TODO: Verify admin token against admin service
        return False  # Disabled by default for security

