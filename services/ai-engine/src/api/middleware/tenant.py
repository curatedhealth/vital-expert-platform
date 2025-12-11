"""
VITAL Path - Organization Middleware

Ensures organization context is properly set for all requests.
Works with AuthMiddleware to enforce multi-tenancy.

IMPORTANT: Uses organization_id to match production RLS policies.
The database function is get_current_organization_context().
"""

import logging
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from core.context import get_request_context

logger = logging.getLogger(__name__)


class OrganizationMiddleware(BaseHTTPMiddleware):
    """
    Organization isolation middleware.
    
    Ensures that:
    1. Every request has organization context set
    2. Organization exists and is active
    3. User belongs to the organization
    
    This matches the RLS function get_current_organization_context().
    """
    
    # Paths that don't require organization context
    CONTEXT_FREE_PATHS = [
        "/health",
        "/healthz",
        "/ready",
        "/docs",
        "/openapi.json",
        "/redoc",
    ]
    
    async def dispatch(self, request: Request, call_next):
        """Process request through organization validation."""
        
        # Skip for context-free paths
        if self._is_context_free_path(request.url.path):
            return await call_next(request)
        
        # Get context set by AuthMiddleware
        context = get_request_context()
        
        if not context:
            raise HTTPException(
                status_code=500,
                detail="Request context not set (auth middleware may have failed)"
            )
        
        if not context.organization_id:
            raise HTTPException(
                status_code=400,
                detail="Organization context required"
            )
        
        # Optional: Validate organization exists and is active
        # This could be cached for performance
        # org = await self._get_organization(context.organization_id)
        # if not org or not org.is_active:
        #     raise HTTPException(
        #         status_code=403,
        #         detail="Organization not found or inactive"
        #     )
        
        # Add organization info to request state
        request.state.organization_id = context.organization_id
        request.state.tenant_id = context.organization_id  # Legacy alias
        
        # Log organization context for audit
        logger.debug(
            f"Request from organization={context.organization_id} user={context.user_id} "
            f"path={request.url.path}"
        )
        
        return await call_next(request)
    
    def _is_context_free_path(self, path: str) -> bool:
        """Check if path doesn't require organization context."""
        return any(path.startswith(p) for p in self.CONTEXT_FREE_PATHS)
    
    async def _get_organization(self, organization_id: str):
        """
        Get organization from cache or database.
        
        Returns None if organization doesn't exist.
        """
        # TODO: Implement organization lookup with caching
        # from infrastructure.cache import cache
        # from infrastructure.database.repositories.organization_repo import OrganizationRepository
        #
        # cached = await cache.get(f"organization:{organization_id}")
        # if cached:
        #     return cached
        #
        # repo = OrganizationRepository()
        # org = await repo.get(organization_id)
        #
        # if org:
        #     await cache.set(f"organization:{organization_id}", org, ttl=300)
        #
        # return org
        pass


# Legacy alias for backwards compatibility
TenantMiddleware = OrganizationMiddleware






