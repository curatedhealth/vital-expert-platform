"""
FastAPI Routes for Ask Panel MVP

REST API endpoints for panel management and execution.
Simplified for MVP - no streaming yet (Week 3).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime
import structlog

from domain.panel_types import PanelType, PanelStatus
from domain.panel_models import Panel, PanelResponse, PanelConsensus
from repositories.panel_repository import PanelRepository
from services.consensus_calculator import SimpleConsensusCalculator
from services.agent_usage_tracker import AgentUsageTracker
from services.tenant_aware_supabase import TenantAwareSupabaseClient
from workflows.simple_panel_workflow import SimplePanelWorkflow
from vital_shared_kernel.multi_tenant import TenantContext

logger = structlog.get_logger()

router = APIRouter(prefix="/api/v1/panels", tags=["panels"])


# Request/Response Models
class CreatePanelRequest(BaseModel):
    """Request to create a new panel"""
    query: str = Field(..., min_length=10, max_length=1000)
    panel_type: PanelType = Field(default=PanelType.STRUCTURED)
    agents: List[str] = Field(..., min_items=3, max_items=5)
    configuration: Optional[Dict[str, Any]] = Field(default_factory=dict)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class PanelResponse(BaseModel):
    """Panel response"""
    id: UUID
    tenant_id: UUID
    user_id: UUID
    query: str
    panel_type: str
    status: str
    configuration: Dict[str, Any]
    agents: List[str]
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    metadata: Dict[str, Any]


class ExecutePanelRequest(BaseModel):
    """Request to execute a panel"""
    panel_id: UUID


class ExecutePanelResponse(BaseModel):
    """Response from panel execution"""
    status: str
    panel_id: str
    consensus_level: float
    response_count: int
    execution_time_ms: int
    recommendation: str


class ListPanelsResponse(BaseModel):
    """List of panels"""
    panels: List[PanelResponse]
    total: int
    page: int
    page_size: int


# Dependency Injection
def get_panel_repo(
    # In production, inject db_client via dependency
    # For now, simplified
) -> PanelRepository:
    """Get panel repository"""
    # TODO: Inject tenant-aware supabase client
    raise NotImplementedError("Dependency injection to be implemented")


def get_workflow(
    panel_repo: PanelRepository = Depends(get_panel_repo)
) -> SimplePanelWorkflow:
    """Get panel workflow"""
    # TODO: Inject all dependencies
    raise NotImplementedError("Dependency injection to be implemented")


def get_user_id() -> UUID:
    """Get current user ID from auth context"""
    # TODO: Extract from JWT or session
    raise NotImplementedError("Auth to be implemented")


# Endpoints
@router.post("/", response_model=PanelResponse, status_code=status.HTTP_201_CREATED)
async def create_panel(
    request: CreatePanelRequest,
    panel_repo: PanelRepository = Depends(get_panel_repo),
    user_id: UUID = Depends(get_user_id)
):
    """
    Create a new panel.
    
    Automatically includes tenant_id from request context.
    """
    try:
        tenant_id = TenantContext.get()
        
        logger.info(
            "creating_panel",
            tenant_id=str(tenant_id),
            user_id=str(user_id),
            panel_type=request.panel_type.value,
            agent_count=len(request.agents)
        )
        
        panel = await panel_repo.create_panel(
            user_id=user_id,
            query=request.query,
            panel_type=request.panel_type.value,
            agents=request.agents,
            configuration=request.configuration,
            metadata=request.metadata
        )
        
        logger.info(
            "panel_created",
            panel_id=str(panel.id),
            tenant_id=str(tenant_id)
        )
        
        return PanelResponse(
            id=panel.id,
            tenant_id=panel.tenant_id,
            user_id=panel.user_id,
            query=panel.query,
            panel_type=panel.panel_type.value,
            status=panel.status.value,
            configuration=panel.configuration,
            agents=panel.agents,
            created_at=panel.created_at,
            updated_at=panel.updated_at,
            started_at=panel.started_at,
            completed_at=panel.completed_at,
            metadata=panel.metadata
        )
        
    except Exception as e:
        logger.error("panel_creation_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create panel: {str(e)}"
        )


@router.post("/execute", response_model=ExecutePanelResponse)
async def execute_panel(
    request: ExecutePanelRequest,
    workflow: SimplePanelWorkflow = Depends(get_workflow)
):
    """
    Execute a panel asynchronously.
    
    For MVP: Synchronous execution (blocking).
    Week 3: Will add background task queue.
    """
    try:
        tenant_id = TenantContext.get()
        
        logger.info(
            "executing_panel",
            panel_id=str(request.panel_id),
            tenant_id=str(tenant_id)
        )
        
        result = await workflow.execute_panel(request.panel_id)
        
        logger.info(
            "panel_executed",
            panel_id=str(request.panel_id),
            consensus_level=result["consensus_level"]
        )
        
        return ExecutePanelResponse(**result)
        
    except ValueError as e:
        logger.error("invalid_panel_execution", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("panel_execution_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute panel: {str(e)}"
        )


@router.get("/{panel_id}", response_model=PanelResponse)
async def get_panel(
    panel_id: UUID,
    panel_repo: PanelRepository = Depends(get_panel_repo)
):
    """
    Get a panel by ID.
    
    Automatically filtered by tenant_id.
    """
    try:
        tenant_id = TenantContext.get()
        
        panel = await panel_repo.get_panel(panel_id)
        
        if not panel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Panel {panel_id} not found"
            )
        
        return PanelResponse(
            id=panel.id,
            tenant_id=panel.tenant_id,
            user_id=panel.user_id,
            query=panel.query,
            panel_type=panel.panel_type.value,
            status=panel.status.value,
            configuration=panel.configuration,
            agents=panel.agents,
            created_at=panel.created_at,
            updated_at=panel.updated_at,
            started_at=panel.started_at,
            completed_at=panel.completed_at,
            metadata=panel.metadata
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_panel_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get panel: {str(e)}"
        )


@router.get("/", response_model=ListPanelsResponse)
async def list_panels(
    page: int = 1,
    page_size: int = 20,
    status: Optional[PanelStatus] = None,
    panel_repo: PanelRepository = Depends(get_panel_repo)
):
    """
    List panels for current tenant.
    
    Supports pagination and filtering.
    """
    try:
        tenant_id = TenantContext.get()
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get panels
        panels = await panel_repo.list_panels(
            limit=page_size,
            offset=offset,
            status=status.value if status else None
        )
        
        # Get total count
        total = await panel_repo.count_panels(
            status=status.value if status else None
        )
        
        logger.info(
            "panels_listed",
            tenant_id=str(tenant_id),
            count=len(panels),
            total=total
        )
        
        panel_responses = [
            PanelResponse(
                id=p.id,
                tenant_id=p.tenant_id,
                user_id=p.user_id,
                query=p.query,
                panel_type=p.panel_type.value,
                status=p.status.value,
                configuration=p.configuration,
                agents=p.agents,
                created_at=p.created_at,
                updated_at=p.updated_at,
                started_at=p.started_at,
                completed_at=p.completed_at,
                metadata=p.metadata
            )
            for p in panels
        ]
        
        return ListPanelsResponse(
            panels=panel_responses,
            total=total,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error("list_panels_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list panels: {str(e)}"
        )


@router.get("/{panel_id}/responses")
async def get_panel_responses(
    panel_id: UUID,
    panel_repo: PanelRepository = Depends(get_panel_repo)
):
    """
    Get all responses for a panel.
    """
    try:
        # First verify panel exists and belongs to tenant
        panel = await panel_repo.get_panel(panel_id)
        if not panel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Panel {panel_id} not found"
            )
        
        # Get responses (would need to add to repository)
        # TODO: Implement get_panel_responses in repository
        
        logger.info(
            "panel_responses_retrieved",
            panel_id=str(panel_id)
        )
        
        return {"panel_id": str(panel_id), "responses": []}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_responses_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get responses: {str(e)}"
        )


@router.get("/{panel_id}/consensus")
async def get_panel_consensus(
    panel_id: UUID,
    panel_repo: PanelRepository = Depends(get_panel_repo)
):
    """
    Get consensus for a panel.
    """
    try:
        # First verify panel exists and belongs to tenant
        panel = await panel_repo.get_panel(panel_id)
        if not panel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Panel {panel_id} not found"
            )
        
        # Get consensus (would need to add to repository)
        # TODO: Implement get_panel_consensus in repository
        
        logger.info(
            "panel_consensus_retrieved",
            panel_id=str(panel_id)
        )
        
        return {"panel_id": str(panel_id), "consensus": None}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_consensus_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get consensus: {str(e)}"
        )

