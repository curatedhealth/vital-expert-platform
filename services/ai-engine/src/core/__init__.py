"""
VITAL Path - Core Layer

Cross-cutting concerns and foundational utilities:
- Context management (organization, user, request)
- Structured logging with correlation IDs
- Configuration management
- Common types and protocols

IMPORTANT: Uses organization_id to match production RLS policies.
The database uses get_current_organization_context() for isolation.
"""

from .context import (
    RequestContext,
    get_request_context,
    set_request_context,
    clear_request_context,
    # Primary: organization-based (matches RLS)
    set_organization_context,
    get_organization_id,
    require_organization_context,
    # Legacy aliases (deprecated)
    set_tenant_context,
    get_tenant_id,
    require_tenant_context,
    # User context
    get_user_id,
    require_user_context,
    # Testing utilities
    OverrideContext,
)

from .logging import (
    configure_logging,
    get_logger,
    log_execution_time,
    LogContext,
    get_correlation_id,
    set_correlation_id,
    get_request_id,
    set_request_id,
)

from .config import (
    Environment,
    AppConfig,
    get_config,
    get_env,
    is_production,
    is_development,
)

__all__ = [
    # Context management
    "RequestContext",
    "get_request_context",
    "set_request_context",
    "clear_request_context",
    # Primary: organization-based (matches RLS)
    "set_organization_context",
    "get_organization_id",
    "require_organization_context",
    # Legacy aliases (deprecated)
    "set_tenant_context",
    "get_tenant_id",
    "require_tenant_context",
    # User context
    "get_user_id",
    "require_user_context",
    # Testing utilities
    "OverrideContext",
    # Logging
    "configure_logging",
    "get_logger",
    "log_execution_time",
    "LogContext",
    "get_correlation_id",
    "set_correlation_id",
    "get_request_id",
    "set_request_id",
    # Configuration
    "Environment",
    "AppConfig",
    "get_config",
    "get_env",
    "is_production",
    "is_development",
]






