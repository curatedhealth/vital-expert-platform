"""
VITAL Path - Authentication Middleware

Validates JWT tokens and extracts user information.
Sets up the request context with user identity.

IMPORTANT: Uses organization_id to match production RLS policies.
The database function is get_current_organization_context().
"""

import logging
import os
from typing import Optional, List
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt

from core.context import set_request_context, clear_request_context, RequestContext

logger = logging.getLogger(__name__)

# Configuration (from environment)
# SECURITY: Require JWT_SECRET - no insecure defaults
_jwt_secret_env = os.getenv("JWT_SECRET")
if not _jwt_secret_env and os.getenv("ENVIRONMENT", "development") == "production":
    raise RuntimeError("JWT_SECRET environment variable is required in production")
JWT_SECRET = _jwt_secret_env or f"dev-only-{os.urandom(16).hex()}"

JWT_ALGORITHM = "HS256"
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Platform fallback organization ID (VITAL System)
PLATFORM_ORGANIZATION_ID = os.getenv(
    "PLATFORM_ORGANIZATION_ID", 
    "c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244"
)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Authentication middleware for FastAPI.
    
    Extracts JWT from Authorization header, validates it,
    and sets up request context with user information.
    
    Uses organization_id to match RLS get_current_organization_context().
    """
    
    # Paths that don't require authentication
    PUBLIC_PATHS = [
        "/health",
        "/healthz",
        "/ready",
        "/docs",
        "/openapi.json",
        "/redoc",
        # Ask Panel Enhanced - allow for development (can be restricted in production)
        "/api/ask-panel-enhanced/stream",
        "/api/ask-panel-enhanced/agents",
    ]
    
    async def dispatch(self, request: Request, call_next):
        """Process request through authentication."""
        
        # Skip auth for public paths
        if self._is_public_path(request.url.path):
            return await call_next(request)
        
        try:
            # Extract and validate token
            token = self._extract_token(request)
            
            if not token:
                raise HTTPException(
                    status_code=401,
                    detail="Missing authentication token"
                )
            
            # Decode and validate JWT
            payload = self._decode_token(token)
            
            # Extract user info from payload
            user_id = payload.get("sub") or payload.get("user_id")
            
            # Extract organization_id (primary) - matches RLS
            # Check multiple locations in JWT claims
            organization_id = (
                payload.get("organization_id") or
                payload.get("app_metadata", {}).get("organization_id") or
                payload.get("user_metadata", {}).get("organization_id") or
                # Fallback to tenant_id for legacy tokens
                payload.get("tenant_id") or
                payload.get("app_metadata", {}).get("tenant_id") or
                # Header override
                request.headers.get("x-organization-id") or
                request.headers.get("x-tenant-id")
            )
            
            # Extract industry tenant_id (optional - for platform agent filtering)
            tenant_id = (
                payload.get("tenant_id") or
                payload.get("app_metadata", {}).get("tenant_id")
            )
            
            roles = payload.get("roles") or payload.get("app_metadata", {}).get("roles", [])
            
            if not user_id:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid token: missing user_id"
                )
            
            # Use platform organization as fallback (for development/testing)
            if not organization_id:
                logger.warning(
                    f"No organization_id in token for user {user_id}, using platform fallback"
                )
                organization_id = PLATFORM_ORGANIZATION_ID
            
            # Set up request context
            context = RequestContext(
                organization_id=organization_id,
                user_id=user_id,
                roles=roles,
                tenant_id=tenant_id,  # Industry tenant (optional)
                request_id=request.headers.get("X-Request-ID"),
                correlation_id=request.headers.get("X-Correlation-ID"),
            )
            set_request_context(context)
            
            # Store context in request state for easy access
            request.state.context = context
            request.state.user_id = user_id
            request.state.organization_id = organization_id
            request.state.tenant_id = organization_id  # Legacy alias
            
            # Process request
            response = await call_next(request)
            
            return response
            
        except HTTPException:
            raise
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )
        except Exception as e:
            logger.exception(f"Auth middleware error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Authentication error"
            )
        finally:
            # Always clear context after request
            clear_request_context()
    
    def _is_public_path(self, path: str) -> bool:
        """Check if path is public (no auth required)."""
        return any(path.startswith(p) for p in self.PUBLIC_PATHS)
    
    def _extract_token(self, request: Request) -> Optional[str]:
        """Extract JWT from Authorization header."""
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return None
        
        # Expect "Bearer <token>" format
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None
        
        return parts[1]
    
    def _decode_token(self, token: str) -> dict:
        """
        Decode and validate JWT token.
        
        Supports both custom JWT and Supabase JWT.
        """
        # Try Supabase secret first if configured
        if SUPABASE_JWT_SECRET:
            try:
                return jwt.decode(
                    token,
                    SUPABASE_JWT_SECRET,
                    algorithms=["HS256"],
                    options={"verify_aud": False}
                )
            except jwt.InvalidTokenError:
                pass  # Fall through to try regular secret
        
        # Try regular secret
        return jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )






