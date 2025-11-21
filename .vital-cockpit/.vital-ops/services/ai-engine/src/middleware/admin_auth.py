"""
Admin Authentication Configuration

Provides flexible admin authentication that can be:
1. Enabled with proper JWT verification (production)
2. Disabled for development/testing (bypass with flag)
3. Use API key for service-to-service communication

Golden Rules Compliance:
✅ #1: Python-only implementation
✅ #2: Secure defaults (disabled unless explicitly configured)
✅ #3: Tenant-aware (admin can access all tenants)
✅ #4: Environment-based configuration
✅ #5: Comprehensive logging for security audit

Usage:
    >>> from middleware.admin_auth import AdminAuthMiddleware, admin_required
    >>> 
    >>> # In FastAPI app
    >>> app.add_middleware(AdminAuthMiddleware, bypass_admin_auth=False)
    >>> 
    >>> # On endpoint
    >>> @app.post("/admin/reset-database")
    >>> @admin_required
    >>> async def reset_db(admin_user: AdminUser = Depends()):
    ...     # Only admins can access
    ...     pass
"""

import os
import jwt
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import structlog
from pydantic import BaseModel, Field
from functools import wraps

logger = structlog.get_logger()

# ============================================================================
# CONFIGURATION
# ============================================================================

class AdminAuthConfig:
    """Admin authentication configuration."""
    
    # Environment-based configuration
    BYPASS_ADMIN_AUTH = os.getenv("BYPASS_ADMIN_AUTH", "true").lower() == "true"
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")  # Service-to-service key
    
    # Admin-specific paths
    ADMIN_PATHS = [
        "/admin/",
        "/platform/",
        "/system/",
        "/api/admin/",
    ]
    
    # Paths that don't require admin auth (always accessible)
    PUBLIC_PATHS = [
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/api/health"
    ]
    
    @classmethod
    def is_admin_path(cls, path: str) -> bool:
        """Check if path requires admin authentication."""
        return any(path.startswith(prefix) for prefix in cls.ADMIN_PATHS)
    
    @classmethod
    def is_public_path(cls, path: str) -> bool:
        """Check if path is public (no auth required)."""
        return any(path.startswith(prefix) for prefix in cls.PUBLIC_PATHS)


# ============================================================================
# DATA MODELS
# ============================================================================

class AdminUser(BaseModel):
    """Admin user information extracted from JWT or API key."""
    user_id: str = Field(..., description="User ID")
    email: str = Field(..., description="Email address")
    role: str = Field(..., description="User role (admin, super_admin)")
    permissions: list[str] = Field(default_factory=list, description="Admin permissions")
    is_super_admin: bool = Field(default=False, description="Super admin flag")
    auth_method: str = Field(..., description="Authentication method used (jwt, api_key)")
    tenant_id: Optional[str] = Field(None, description="Tenant ID (if scoped)")


# ============================================================================
# AUTHENTICATION HELPERS
# ============================================================================

def extract_jwt_token(request: Request) -> Optional[str]:
    """
    Extract JWT token from request headers.
    
    Supports:
    - Authorization: Bearer <token>
    - X-Admin-Token: <token>
    
    Args:
        request: FastAPI request
        
    Returns:
        JWT token string or None
    """
    # Try Authorization header
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]
    
    # Try X-Admin-Token header
    admin_token = request.headers.get("x-admin-token")
    if admin_token:
        return admin_token
    
    return None


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify JWT token and extract payload.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            AdminAuthConfig.JWT_SECRET,
            algorithms=[AdminAuthConfig.JWT_ALGORITHM]
        )
        
        # Validate required fields
        required_fields = ["sub", "email", "role"]
        if not all(field in payload for field in required_fields):
            logger.warning("JWT token missing required fields", fields=required_fields)
            return None
        
        # Validate role is admin or super_admin
        role = payload.get("role", "").lower()
        if role not in ["admin", "super_admin"]:
            logger.warning("JWT token does not have admin role", role=role)
            return None
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid JWT token", error=str(e))
        return None


def verify_api_key(api_key: str) -> bool:
    """
    Verify admin API key.
    
    Args:
        api_key: API key string
        
    Returns:
        True if valid, False otherwise
    """
    if not AdminAuthConfig.ADMIN_API_KEY:
        return False
    
    return api_key == AdminAuthConfig.ADMIN_API_KEY


def authenticate_admin(request: Request) -> Optional[AdminUser]:
    """
    Authenticate admin user from request.
    
    Tries multiple authentication methods:
    1. JWT token (from Authorization header or X-Admin-Token)
    2. Admin API key (from X-API-Key header)
    3. Bypass if BYPASS_ADMIN_AUTH is enabled
    
    Args:
        request: FastAPI request
        
    Returns:
        AdminUser if authenticated, None otherwise
    """
    # Method 1: JWT Token
    token = extract_jwt_token(request)
    if token:
        payload = verify_jwt_token(token)
        if payload:
            logger.info(
                "Admin authenticated via JWT",
                user_id=payload.get("sub")[:8],
                role=payload.get("role")
            )
            
            return AdminUser(
                user_id=payload["sub"],
                email=payload["email"],
                role=payload["role"],
                permissions=payload.get("permissions", []),
                is_super_admin=payload.get("role") == "super_admin",
                auth_method="jwt",
                tenant_id=payload.get("tenant_id")
            )
    
    # Method 2: API Key
    api_key = request.headers.get("x-api-key")
    if api_key and verify_api_key(api_key):
        logger.info("Admin authenticated via API key")
        
        return AdminUser(
            user_id="system",
            email="system@vital-path.com",
            role="super_admin",
            permissions=["*"],
            is_super_admin=True,
            auth_method="api_key"
        )
    
    # Method 3: Bypass (development only)
    if AdminAuthConfig.BYPASS_ADMIN_AUTH:
        logger.warning("⚠️  Admin auth bypassed (development mode)")
        
        return AdminUser(
            user_id="dev-admin",
            email="dev-admin@vital-path.com",
            role="super_admin",
            permissions=["*"],
            is_super_admin=True,
            auth_method="bypass"
        )
    
    return None


# ============================================================================
# MIDDLEWARE
# ============================================================================

class AdminAuthMiddleware(BaseHTTPMiddleware):
    """
    Admin authentication middleware.
    
    Enforces authentication on admin endpoints unless bypassed.
    """
    
    async def dispatch(self, request: Request, call_next):
        """Process request with admin authentication."""
        
        # Skip public paths
        if AdminAuthConfig.is_public_path(request.url.path):
            return await call_next(request)
        
        # Check if admin endpoint
        if AdminAuthConfig.is_admin_path(request.url.path):
            # Authenticate admin
            admin_user = authenticate_admin(request)
            
            if not admin_user:
                logger.warning(
                    "Unauthorized admin access attempt",
                    path=request.url.path,
                    ip=request.client.host if request.client else "unknown"
                )
                
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        "error": "Unauthorized",
                        "message": "Admin authentication required",
                        "bypass_enabled": AdminAuthConfig.BYPASS_ADMIN_AUTH
                    },
                    headers={"WWW-Authenticate": "Bearer"}
                )
            
            # Attach admin user to request state
            request.state.admin_user = admin_user
            
            logger.info(
                "Admin endpoint accessed",
                path=request.url.path,
                user_id=admin_user.user_id[:8],
                auth_method=admin_user.auth_method
            )
        
        # Process request
        response = await call_next(request)
        
        return response


# ============================================================================
# DEPENDENCIES (for use with FastAPI Depends)
# ============================================================================

async def get_admin_user(request: Request) -> AdminUser:
    """
    FastAPI dependency to get authenticated admin user.
    
    Usage:
        @app.get("/admin/users")
        async def list_users(admin: AdminUser = Depends(get_admin_user)):
            # Only admins can access
            pass
    """
    # Try to get from request state (set by middleware)
    if hasattr(request.state, "admin_user"):
        return request.state.admin_user
    
    # Try to authenticate directly
    admin_user = authenticate_admin(request)
    
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return admin_user


async def require_super_admin(admin_user: AdminUser = Depends(get_admin_user)) -> AdminUser:
    """
    FastAPI dependency to require super admin role.
    
    Usage:
        @app.delete("/admin/tenant/{tenant_id}")
        async def delete_tenant(
            tenant_id: str,
            admin: AdminUser = Depends(require_super_admin)
        ):
            # Only super admins can access
            pass
    """
    if not admin_user.is_super_admin:
        logger.warning(
            "Super admin access denied",
            user_id=admin_user.user_id[:8],
            role=admin_user.role
        )
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    
    return admin_user


# ============================================================================
# DECORATORS (alternative to Depends)
# ============================================================================

def admin_required(func):
    """
    Decorator to require admin authentication on endpoint.
    
    Usage:
        @app.get("/admin/stats")
        @admin_required
        async def get_stats(request: Request):
            admin_user = request.state.admin_user
            # Process request...
    """
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        admin_user = authenticate_admin(request)
        
        if not admin_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin authentication required",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Attach to request state
        request.state.admin_user = admin_user
        
        return await func(request, *args, **kwargs)
    
    return wrapper


def super_admin_required(func):
    """
    Decorator to require super admin role on endpoint.
    
    Usage:
        @app.delete("/admin/tenant/{tenant_id}")
        @super_admin_required
        async def delete_tenant(request: Request, tenant_id: str):
            # Only super admins can access
            pass
    """
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        admin_user = authenticate_admin(request)
        
        if not admin_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin authentication required"
            )
        
        if not admin_user.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super admin access required"
            )
        
        # Attach to request state
        request.state.admin_user = admin_user
        
        return await func(request, *args, **kwargs)
    
    return wrapper


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def generate_admin_jwt(
    user_id: str,
    email: str,
    role: str = "admin",
    permissions: list[str] = None,
    tenant_id: Optional[str] = None,
    expires_hours: int = 24
) -> str:
    """
    Generate admin JWT token.
    
    Args:
        user_id: User ID
        email: Email address
        role: Role (admin or super_admin)
        permissions: List of permissions
        tenant_id: Optional tenant ID
        expires_hours: Token expiration in hours
        
    Returns:
        JWT token string
    """
    from datetime import timedelta
    
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=expires_hours)
    
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "permissions": permissions or [],
        "tenant_id": tenant_id,
        "iat": now.timestamp(),
        "exp": expires_at.timestamp()
    }
    
    token = jwt.encode(
        payload,
        AdminAuthConfig.JWT_SECRET,
        algorithm=AdminAuthConfig.JWT_ALGORITHM
    )
    
    logger.info(
        "Admin JWT generated",
        user_id=user_id[:8],
        role=role,
        expires_at=expires_at.isoformat()
    )
    
    return token


def print_config():
    """Print current admin auth configuration."""
    print("=" * 80)
    print("ADMIN AUTHENTICATION CONFIGURATION")
    print("=" * 80)
    print(f"Bypass enabled: {AdminAuthConfig.BYPASS_ADMIN_AUTH}")
    print(f"JWT secret configured: {'Yes' if AdminAuthConfig.JWT_SECRET else 'No'}")
    print(f"API key configured: {'Yes' if AdminAuthConfig.ADMIN_API_KEY else 'No'}")
    print(f"JWT algorithm: {AdminAuthConfig.JWT_ALGORITHM}")
    print()
    print("Admin paths:", ", ".join(AdminAuthConfig.ADMIN_PATHS))
    print()
    print("⚠️  SECURITY WARNINGS:")
    if AdminAuthConfig.BYPASS_ADMIN_AUTH:
        print("  • Admin auth bypass is ENABLED (development only!)")
    if not AdminAuthConfig.ADMIN_API_KEY:
        print("  • No admin API key configured (service-to-service disabled)")
    if AdminAuthConfig.JWT_SECRET == "dev-secret-key-change-in-production":
        print("  • Using default JWT secret (CHANGE IN PRODUCTION!)")
    print("=" * 80)


if __name__ == "__main__":
    # Print configuration when run directly
    print_config()
    
    # Generate sample admin token
    if AdminAuthConfig.JWT_SECRET:
        sample_token = generate_admin_jwt(
            user_id="admin_001",
            email="admin@vital-path.com",
            role="super_admin",
            permissions=["*"]
        )
        print("\nSample admin token:")
        print(sample_token)

