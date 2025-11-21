"""
Authentication API for Supabase Integration
Handles user authentication, JWT validation, and session management
"""

from fastapi import APIRouter, HTTPException, Depends, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from supabase import create_client, Client
import os
from datetime import datetime
import jwt

router = APIRouter()
security = HTTPBearer()

# Initialize Supabase client
def get_supabase() -> Client:
    """Get Supabase client"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=503,
            detail="Supabase configuration not available"
        )
    
    return create_client(supabase_url, supabase_key)


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_id: Optional[str] = None
    metadata: Optional[dict] = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict
    expires_in: int


class UserResponse(BaseModel):
    id: str
    email: str
    tenant_id: Optional[str]
    created_at: str
    metadata: Optional[dict]


# ============================================================================
# AUTHENTICATION MIDDLEWARE
# ============================================================================

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify JWT token from Supabase Auth
    
    Returns user data if token is valid
    """
    try:
        token = credentials.credentials
        
        # Get Supabase client
        supabase = get_supabase()
        
        # Verify token with Supabase
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        return user.user
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_user(
    user: dict = Depends(verify_token)
) -> dict:
    """Get current authenticated user"""
    return user


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@router.post("/auth/signup", response_model=AuthResponse)
async def signup(
    request: SignUpRequest,
    supabase: Client = Depends(get_supabase)
):
    """
    Register a new user with Supabase Auth
    
    Creates user account and optionally links to tenant
    """
    try:
        # Sign up with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "tenant_id": request.tenant_id,
                    **(request.metadata or {})
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=400,
                detail="Failed to create user account"
            )
        
        # Create user record in users table
        user_data = {
            "id": auth_response.user.id,
            "email": request.email,
            "tenant_id": request.tenant_id,
            "metadata": request.metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }
        
        supabase.table('users').insert(user_data).execute()
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            user=auth_response.user.model_dump(),
            expires_in=auth_response.session.expires_in or 3600
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/auth/signin", response_model=AuthResponse)
async def signin(
    request: SignInRequest,
    supabase: Client = Depends(get_supabase)
):
    """
    Sign in with email and password
    
    Returns JWT tokens for API access
    """
    try:
        # Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            user=auth_response.user.model_dump(),
            expires_in=auth_response.session.expires_in or 3600
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sign in failed: {str(e)}"
        )


@router.post("/auth/signout")
async def signout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
):
    """
    Sign out current user
    
    Invalidates the JWT token
    """
    try:
        token = credentials.credentials
        supabase.auth.sign_out()
        
        return {
            "message": "Successfully signed out",
            "status": "success"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sign out failed: {str(e)}"
        )


@router.post("/auth/refresh", response_model=AuthResponse)
async def refresh_token(
    refresh_token: str,
    supabase: Client = Depends(get_supabase)
):
    """
    Refresh access token using refresh token
    
    Returns new JWT tokens
    """
    try:
        auth_response = supabase.auth.refresh_session(refresh_token)
        
        if not auth_response.session:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            user=auth_response.user.model_dump() if auth_response.user else {},
            expires_in=auth_response.session.expires_in or 3600
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get current user information
    
    Requires valid JWT token
    """
    try:
        # Fetch user details from users table
        user_data = supabase.table('users')\
            .select('*')\
            .eq('id', user.id)\
            .execute()
        
        if not user_data.data:
            # Return basic info from auth
            return UserResponse(
                id=user.id,
                email=user.email,
                tenant_id=user.user_metadata.get('tenant_id'),
                created_at=user.created_at,
                metadata=user.user_metadata
            )
        
        user_record = user_data.data[0]
        return UserResponse(
            id=user_record['id'],
            email=user_record['email'],
            tenant_id=user_record.get('tenant_id'),
            created_at=user_record['created_at'],
            metadata=user_record.get('metadata', {})
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch user info: {str(e)}"
        )


@router.post("/auth/reset-password")
async def reset_password(
    email: EmailStr,
    supabase: Client = Depends(get_supabase)
):
    """
    Send password reset email
    """
    try:
        supabase.auth.reset_password_email(email)
        
        return {
            "message": "Password reset email sent",
            "email": email,
            "status": "success"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Password reset failed: {str(e)}"
        )


@router.put("/auth/update-password")
async def update_password(
    new_password: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Update user password
    
    Requires valid JWT token
    """
    try:
        supabase.auth.update_user({
            "password": new_password
        })
        
        return {
            "message": "Password updated successfully",
            "status": "success"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Password update failed: {str(e)}"
        )


# ============================================================================
# TENANT MANAGEMENT
# ============================================================================

@router.get("/auth/tenant")
async def get_user_tenant(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get current user's tenant information
    """
    try:
        tenant_id = user.user_metadata.get('tenant_id')
        
        if not tenant_id:
            return {
                "tenant_id": None,
                "message": "User not associated with a tenant"
            }
        
        # Fetch tenant details
        tenant_data = supabase.table('tenants')\
            .select('*')\
            .eq('id', tenant_id)\
            .execute()
        
        if not tenant_data.data:
            return {
                "tenant_id": tenant_id,
                "message": "Tenant not found"
            }
        
        return {
            "tenant": tenant_data.data[0],
            "user_id": user.id
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch tenant info: {str(e)}"
        )


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/auth/health")
async def auth_health():
    """Check authentication service health"""
    return {
        "status": "healthy",
        "service": "authentication",
        "features": {
            "signup": "enabled",
            "signin": "enabled",
            "password_reset": "enabled",
            "token_refresh": "enabled",
            "multi_tenant": "enabled"
        },
        "timestamp": datetime.utcnow().isoformat()
    }
