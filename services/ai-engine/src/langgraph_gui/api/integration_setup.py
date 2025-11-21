"""
Integration Setup
Helper functions for easy integration into existing FastAPI applications
"""

from fastapi import FastAPI
from typing import Optional, List
from .integration_router import create_integration_router, setup_cors
from ..storage.file_storage import WorkflowStorage
from ..integration.pharma_intelligence import PharmaIntelligenceIntegration


def setup_workflow_builder(
    app: FastAPI,
    storage: Optional[WorkflowStorage] = None,
    pharma_integration: Optional[PharmaIntelligenceIntegration] = None,
    cors_origins: Optional[List[str]] = None,
    router_prefix: str = "/api"
):
    """
    Setup workflow builder routes in an existing FastAPI application
    
    Args:
        app: FastAPI application instance
        storage: WorkflowStorage instance (optional, creates default if not provided)
        pharma_integration: PharmaIntelligenceIntegration instance (optional)
        cors_origins: List of allowed CORS origins
        router_prefix: Prefix for all routes (default: "/api")
    
    Example:
        ```python
        from fastapi import FastAPI
        from langgraph_gui.api.integration_setup import setup_workflow_builder
        
        app = FastAPI()
        setup_workflow_builder(app)
        ```
    """
    # Create default instances if not provided
    if storage is None:
        storage = WorkflowStorage()
    
    if pharma_integration is None:
        pharma_integration = PharmaIntelligenceIntegration()
    
    # Setup CORS
    setup_cors(app, cors_origins)
    
    # Create and include router
    router = create_integration_router(storage, pharma_integration, cors_origins)
    app.include_router(router, prefix=router_prefix)
    
    return router




