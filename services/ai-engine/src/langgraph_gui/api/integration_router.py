"""
Integration Router
Standalone FastAPI router for easy integration into existing FastAPI applications
"""

from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# Import all route modules
from .routes import router as main_router
from .panels import execute_panel, get_panel_types, get_panel_schema
from .export import router as export_router

# Create integration router
integration_router = APIRouter()

# Include main routes
integration_router.include_router(main_router, tags=["workflows"])

# Include export routes
integration_router.include_router(export_router, tags=["export"])

# Add panel endpoints
integration_router.post("/panels/execute")(execute_panel)
integration_router.get("/panels/types")(get_panel_types)
integration_router.get("/panels/schema/{panel_type}")(get_panel_schema)


def create_integration_router(
    storage=None,
    pharma_integration=None,
    cors_origins: Optional[list] = None
) -> APIRouter:
    """
    Create and configure integration router
    
    Args:
        storage: WorkflowStorage instance (optional, will create if not provided)
        pharma_integration: PharmaIntelligenceIntegration instance (optional)
        cors_origins: List of allowed CORS origins (defaults to common dev ports)
    
    Returns:
        Configured APIRouter instance
    """
    # Initialize routes if dependencies provided
    if storage and pharma_integration:
        from .routes import init_routes
        init_routes(storage, pharma_integration)
    
    return integration_router


def setup_cors(app, origins: Optional[list] = None):
    """
    Setup CORS middleware for FastAPI app
    
    Args:
        app: FastAPI application instance
        origins: List of allowed origins (defaults to common dev ports)
    """
    if origins is None:
        origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:3004",
            "http://localhost:5173",
        ]
    
    from fastapi.middleware.cors import CORSMiddleware
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )




