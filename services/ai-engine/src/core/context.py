"""
VITAL Path - Request Context Management

Provides organization and user context across the application.
Uses contextvars for thread-safe request-scoped state.

IMPORTANT: This uses `organization_id` to match production RLS policies.
The database uses `get_current_organization_context()` for isolation.

Usage:
    # In middleware (set context from JWT)
    set_request_context(RequestContext(
        organization_id="...",
        user_id="...",
        roles=["user"],
    ))
    
    # In any service
    organization_id = get_organization_id()  # Returns current organization
    user_id = get_user_id()                  # Returns current user
    
    # In background workers
    set_organization_context(organization_id, user_id)
    
    # Legacy alias (deprecated - use organization_id)
    tenant_id = get_tenant_id()  # Alias for get_organization_id()
"""

from contextvars import ContextVar
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

# Context variable for request-scoped state
_request_context: ContextVar[Optional["RequestContext"]] = ContextVar(
    "request_context", default=None
)


@dataclass
class RequestContext:
    """
    Request context carrying organization, user, and request metadata.
    
    This is set once per request in middleware and accessed
    throughout the request lifecycle by services and repositories.
    
    IMPORTANT: Uses organization_id to match production RLS policies.
    """
    
    # Required: Organization isolation (matches RLS get_current_organization_context())
    organization_id: str
    
    # Required: User identification
    user_id: str
    
    # User roles for authorization
    roles: List[str] = field(default_factory=list)
    
    # Optional: Industry tenant ID (for multi-tenant platform agents)
    tenant_id: Optional[str] = None
    
    # Request metadata
    request_id: Optional[str] = None
    correlation_id: Optional[str] = None
    
    # Session info
    session_id: Optional[str] = None
    
    # Timing
    request_started_at: datetime = field(default_factory=datetime.utcnow)
    
    # Additional context
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Budget tracking
    token_budget_remaining: Optional[int] = None
    token_budget_limit: Optional[int] = None
    
    @property
    def is_admin(self) -> bool:
        """Check if user has admin role."""
        return "admin" in self.roles or "org_admin" in self.roles
    
    @property
    def is_system_admin(self) -> bool:
        """Check if user has system admin role (cross-organization)."""
        return "system_admin" in self.roles or "superadmin" in self.roles
    
    def has_role(self, role: str) -> bool:
        """Check if user has a specific role."""
        return role in self.roles
    
    def with_budget(self, remaining: int, limit: int) -> "RequestContext":
        """Return new context with budget info."""
        return RequestContext(
            organization_id=self.organization_id,
            user_id=self.user_id,
            roles=self.roles,
            tenant_id=self.tenant_id,
            request_id=self.request_id,
            correlation_id=self.correlation_id,
            session_id=self.session_id,
            request_started_at=self.request_started_at,
            metadata=self.metadata,
            token_budget_remaining=remaining,
            token_budget_limit=limit,
        )


def get_request_context() -> Optional[RequestContext]:
    """
    Get the current request context.
    
    Returns None if no context is set (e.g., outside request lifecycle).
    """
    return _request_context.get()


def set_request_context(context: RequestContext) -> None:
    """
    Set the request context for the current request.
    
    Should be called once per request, typically in middleware.
    """
    _request_context.set(context)


def clear_request_context() -> None:
    """
    Clear the request context.
    
    Should be called at the end of request lifecycle.
    """
    _request_context.set(None)


def set_organization_context(organization_id: str, user_id: str = None, roles: List[str] = None) -> None:
    """
    Simplified context setter for background workers.
    
    Workers don't have a full request context, but still need
    organization isolation for database queries.
    
    Args:
        organization_id: The organization ID for RLS (matches get_current_organization_context())
        user_id: Optional user ID
        roles: Optional roles list
    """
    context = RequestContext(
        organization_id=organization_id,
        user_id=user_id or "system",
        roles=roles or ["worker"],
    )
    set_request_context(context)


# Legacy alias for backwards compatibility
def set_tenant_context(tenant_id: str, user_id: str = None, roles: List[str] = None) -> None:
    """DEPRECATED: Use set_organization_context instead."""
    set_organization_context(tenant_id, user_id, roles)


def get_organization_id() -> Optional[str]:
    """
    Get the current organization ID.
    
    Returns None if no context is set.
    This matches the RLS function get_current_organization_context().
    """
    ctx = get_request_context()
    return ctx.organization_id if ctx else None


def get_tenant_id() -> Optional[str]:
    """
    DEPRECATED: Use get_organization_id() instead.
    
    Returns organization_id for backwards compatibility.
    """
    return get_organization_id()


def get_user_id() -> Optional[str]:
    """
    Get the current user ID.
    
    Returns None if no context is set.
    """
    ctx = get_request_context()
    return ctx.user_id if ctx else None


def require_organization_context() -> str:
    """
    Get organization ID, raising error if not set.
    
    Use this in services that absolutely require organization context.
    """
    organization_id = get_organization_id()
    if not organization_id:
        raise RuntimeError("Organization context required but not set")
    return organization_id


# Legacy alias
def require_tenant_context() -> str:
    """DEPRECATED: Use require_organization_context instead."""
    return require_organization_context()


def require_user_context() -> str:
    """
    Get user ID, raising error if not set.
    
    Use this in services that absolutely require user context.
    """
    user_id = get_user_id()
    if not user_id:
        raise RuntimeError("User context required but not set")
    return user_id


# Context manager for temporary context override (useful in tests)
class OverrideContext:
    """
    Context manager to temporarily override request context.
    
    Usage:
        with OverrideContext(organization_id="test-org", user_id="test-user"):
            # Code here runs with overridden context
            pass
        # Original context restored
    """
    
    def __init__(
        self,
        organization_id: str,
        user_id: str = "system",
        roles: List[str] = None,
        tenant_id: str = None,  # Legacy parameter, mapped to organization_id if provided alone
    ):
        # Support legacy tenant_id parameter
        org_id = organization_id or tenant_id
        if not org_id:
            raise ValueError("organization_id is required")
            
        self.new_context = RequestContext(
            organization_id=org_id,
            user_id=user_id,
            roles=roles or [],
        )
        self.original_context = None
    
    def __enter__(self) -> RequestContext:
        self.original_context = get_request_context()
        set_request_context(self.new_context)
        return self.new_context
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if self.original_context:
            set_request_context(self.original_context)
        else:
            clear_request_context()











