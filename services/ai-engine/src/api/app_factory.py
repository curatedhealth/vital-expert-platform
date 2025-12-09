"""
VITAL Path AI Services - Application Factory

Creates and configures the FastAPI application with proper settings,
exception handlers, and OpenAPI configuration.

Phase 1 Refactoring: Extracted from monolithic main.py
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Callable, Any
import structlog

logger = structlog.get_logger()


def create_app(
    lifespan: Callable = None,
    title: str = "VITAL Path AI Services",
    description: str = "Medical AI Agent Orchestration with LangChain and Supabase",
    version: str = "2.0.0",
) -> FastAPI:
    """
    Create and configure a FastAPI application instance.
    
    Args:
        lifespan: Async context manager for startup/shutdown events
        title: API title for OpenAPI docs
        description: API description for OpenAPI docs
        version: API version string
        
    Returns:
        Configured FastAPI application
    """
    app = FastAPI(
        title=title,
        description=description,
        version=version,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    
    # Register exception handlers
    _register_exception_handlers(app)
    
    logger.info("✅ FastAPI application created", title=title, version=version)
    
    return app


def _register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers for the application."""
    
    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle 404 Not Found errors."""
        return JSONResponse(
            status_code=404,
            content={
                "error": "not_found",
                "message": f"The requested endpoint '{request.url.path}' does not exist",
                "path": str(request.url.path),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    
    @app.exception_handler(500)
    async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle 500 Internal Server errors."""
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(
            "internal_server_error",
            error=str(exc),
            request_id=request_id,
            path=str(request.url.path),
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": "internal_server_error",
                "message": "An unexpected error occurred. Please try again later.",
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    
    @app.exception_handler(503)
    async def service_unavailable_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle 503 Service Unavailable errors."""
        return JSONResponse(
            status_code=503,
            content={
                "error": "service_unavailable",
                "message": "Service temporarily unavailable. Please try again later.",
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    
    logger.info("✅ Exception handlers registered")
