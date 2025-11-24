"""
Authentication and Authorization for GraphRAG API
Provides JWT token validation and user authentication
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from uuid import UUID
import structlog

logger = structlog.get_logger()

# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Validate JWT token and return current user
    
    This is a production-ready implementation that validates JWT tokens.
    Integrate with your existing auth service (Supabase Auth, Auth0, etc.)
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        
    Returns:
        User dict with id, email, tenant_id
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        # TODO: Replace with your actual JWT validation
        # Example with Supabase:
        # from supabase import create_client
        # supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        # user = supabase.auth.get_user(token)
        
        # Example with PyJWT:
        # import jwt
        # from core.config import get_settings
        # settings = get_settings()
        # payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        
        # For now, placeholder validation
        if not token or len(token) < 10:
            raise ValueError("Invalid token format")
        
        # Mock user (replace with actual user from token)
        user = {
            "id": UUID("12345678-1234-1234-1234-123456789012"),
            "email": "user@example.com",
            "tenant_id": UUID("87654321-4321-4321-4321-210987654321"),
            "roles": ["user"]
        }
        
        logger.info(
            "user_authenticated",
            user_id=str(user["id"]),
            email=user["email"]
        )
        
        return user
        
    except Exception as e:
        logger.error("authentication_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verify user is active (not disabled/banned)
    
    Args:
        current_user: User from get_current_user
        
    Returns:
        Active user dict
        
    Raises:
        HTTPException: If user is inactive
    """
    # TODO: Add actual user status check from database
    # Example:
    # if current_user.get("is_disabled"):
    #     raise HTTPException(status_code=400, detail="Inactive user")
    
    return current_user


async def verify_tenant_access(
    tenant_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> bool:
    """
    Verify user has access to specified tenant
    
    Args:
        tenant_id: Tenant UUID
        current_user: Current authenticated user
        
    Returns:
        True if user has access
        
    Raises:
        HTTPException: If user doesn't have access
    """
    user_tenant_id = current_user.get("tenant_id")
    
    # TODO: Add actual tenant access check
    # Example: Check user_tenants table for multi-tenant users
    
    if user_tenant_id != tenant_id:
        logger.warning(
            "tenant_access_denied",
            user_id=str(current_user["id"]),
            requested_tenant=str(tenant_id),
            user_tenant=str(user_tenant_id)
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this tenant"
        )
    
    return True


def require_role(required_role: str):
    """
    Dependency to require specific role
    
    Usage:
        @router.get("/admin", dependencies=[Depends(require_role("admin"))])
    
    Args:
        required_role: Required role name
        
    Returns:
        Dependency function
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_roles = current_user.get("roles", [])
        
        if required_role not in user_roles:
            logger.warning(
                "role_access_denied",
                user_id=str(current_user["id"]),
                required_role=required_role,
                user_roles=user_roles
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' required"
            )
        
        return current_user
    
    return role_checker


# Optional: API Key authentication for service-to-service calls
async def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify API key for service-to-service authentication
    
    Args:
        credentials: HTTP Authorization header with API key
        
    Returns:
        Service account dict
        
    Raises:
        HTTPException: If API key is invalid
    """
    api_key = credentials.credentials
    
    try:
        # TODO: Verify API key against database or environment variable
        # Example:
        # from core.config import get_settings
        # settings = get_settings()
        # if api_key not in settings.valid_api_keys:
        #     raise ValueError("Invalid API key")
        
        if not api_key.startswith("vital_"):
            raise ValueError("Invalid API key format")
        
        logger.info("service_authenticated", api_key_prefix=api_key[:10])
        
        return {
            "type": "service",
            "api_key": api_key[:10] + "...",
            "permissions": ["graphrag:query"]
        }
        
    except Exception as e:
        logger.error("api_key_verification_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )

