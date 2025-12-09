"""
VITAL Path AI Services - Middleware Setup

Configures all middleware for the FastAPI application including:
- CORS middleware
- GZip compression
- Request logging and timing
- Tenant isolation (production)
- Rate limiting (production)

Phase 1 Refactoring: Extracted from monolithic main.py
"""

import os
import time
import uuid
from typing import List, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import structlog

from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


def setup_middleware(app: FastAPI) -> None:
    """
    Configure all middleware for the FastAPI application.
    
    Middleware is applied in order (last added = first executed):
    1. CORS - Handle cross-origin requests
    2. GZip - Compress responses
    3. Request Logging - Log requests with timing
    4. Tenant Isolation - Multi-tenant security (production only)
    5. Rate Limiting - Request throttling (production only)
    
    Args:
        app: FastAPI application instance
    """
    # Get CORS origins from settings
    cors_origins = _get_cors_origins()
    
    # Store CORS origins in app state for manual CORS handling
    app.state.cors_origins = cors_origins
    
    # 1. Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "x-tenant-id", "x-user-id"],
    )
    logger.info("✅ CORS middleware configured", origins_count=len(cors_origins))
    
    # 2. Add GZip compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    logger.info("✅ GZip compression middleware configured")
    
    # 3. Add request logging middleware
    _add_request_logging_middleware(app)
    
    # 4. Add tenant isolation middleware (production only)
    is_production = _is_production_environment()
    if is_production:
        _add_tenant_isolation_middleware(app)
    else:
        logger.info("ℹ️ Tenant isolation middleware disabled (development mode)")
    
    # 5. Add rate limiting middleware (production only)
    if is_production:
        _add_rate_limiting_middleware(app)
    else:
        logger.info("ℹ️ Rate limiting middleware disabled (development mode)")
    
    logger.info("✅ All middleware configured successfully")


def _get_cors_origins() -> List[str]:
    """Get CORS origins from settings."""
    if isinstance(settings.cors_origins, list):
        origins = settings.cors_origins
    elif isinstance(settings.cors_origins, str):
        origins = settings.cors_origins.split(",")
    else:
        origins = ["http://localhost:3000", "http://localhost:3001"]
    
    return [origin.strip() for origin in origins if origin]


def _is_production_environment() -> bool:
    """Check if running in production environment."""
    return (
        os.getenv("RAILWAY_ENVIRONMENT") == "production" 
        or os.getenv("ENV") == "production"
    )


def _add_request_logging_middleware(app: FastAPI) -> None:
    """Add request logging middleware with timing."""
    
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """Log all requests with timing and generate request IDs."""
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Add request ID to state
        request.state.request_id = request_id
        
        # Log incoming request
        logger.info(
            "request_started",
            method=request.method,
            path=request.url.path,
            request_id=request_id,
            client_ip=request.client.host if request.client else "unknown",
        )
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Add custom headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        
        # Log response
        logger.info(
            "request_completed",
            method=request.method,
            path=request.url.path,
            request_id=request_id,
            status_code=response.status_code,
            duration_ms=round(duration_ms, 2),
        )
        
        return response
    
    logger.info("✅ Request logging middleware configured")


def _add_tenant_isolation_middleware(app: FastAPI) -> None:
    """Add tenant isolation middleware for multi-tenant security."""
    try:
        from middleware.tenant_isolation import TenantIsolationMiddleware
        app.add_middleware(TenantIsolationMiddleware)
        logger.info("✅ Tenant isolation middleware enabled (production mode)")
    except ImportError as e:
        logger.warning(
            "tenant_isolation_middleware_import_failed",
            error=str(e),
            message="Continuing without tenant isolation"
        )


def _add_rate_limiting_middleware(app: FastAPI) -> None:
    """Add rate limiting middleware for request throttling."""
    try:
        from middleware.rate_limiting import EnhancedRateLimitMiddleware
        app.add_middleware(EnhancedRateLimitMiddleware)
        logger.info("✅ Rate limiting middleware enabled (production mode)")
    except ImportError as e:
        logger.warning(
            "rate_limiting_middleware_import_failed", 
            error=str(e),
            message="Continuing without rate limiting"
        )


def resolve_cors_origin(request: Optional[Request] = None, cors_origins: List[str] = None) -> str:
    """
    Determine the appropriate CORS origin for manual endpoints.
    Mirrors the CORSMiddleware configuration and falls back gracefully.
    
    Args:
        request: Optional FastAPI request object
        cors_origins: List of allowed CORS origins
        
    Returns:
        Appropriate CORS origin string
    """
    if cors_origins is None:
        cors_origins = _get_cors_origins()
    
    origin = request.headers.get("origin") if request else None
    if origin and ("*" in cors_origins or origin in cors_origins):
        return origin
    return cors_origins[0] if cors_origins else "*"
