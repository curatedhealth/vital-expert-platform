# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-15
# MODES_SUPPORTED: [Panel - All 6 types]
# DEPENDENCIES: [services.unified_panel_service, services.llm_service]
"""
Unified Panel API Routes

Exposes the UnifiedPanelService for all 6 panel types:
1. Structured - Sequential moderated discussion
2. Open - Free-form brainstorming (parallel)
3. Socratic - Dialectical questioning
4. Adversarial - Pro/con debate format
5. Delphi - Iterative consensus with voting
6. Hybrid - Human-AI collaborative panels

Supports both synchronous and streaming execution.
"""

import asyncio
import json
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import structlog
from dataclasses import asdict

from services.unified_panel_service import (
    UnifiedPanelService,
    UnifiedPanelResult,
    create_unified_panel_service,
    get_unified_panel_service,
    initialize_unified_panel_service
)
from services.llm_service import LLMService, get_llm_service

# Optional imports - may not be available in all environments
try:
    from services.supabase_client import get_supabase_client
    from services.tenant_aware_supabase import TenantAwareSupabaseClient
    from repositories.panel_repository import PanelRepository
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    get_supabase_client = None
    TenantAwareSupabaseClient = None
    PanelRepository = None

logger = structlog.get_logger()

router = APIRouter(prefix="/api/v1/unified-panel", tags=["unified-panel"])


# ============================================================================
# Request/Response Models
# ============================================================================

class AgentConfig(BaseModel):
    """Agent configuration for panel execution"""
    id: str = Field(..., description="Agent ID")
    name: str = Field(..., description="Agent display name")
    model: str = Field(default="gpt-4-turbo", description="LLM model to use")
    system_prompt: str = Field(default="You are a helpful expert.", description="System prompt")
    role: str = Field(default="expert", description="Role in panel: expert, moderator, advocate")


class ExecutePanelRequest(BaseModel):
    """Request to execute a unified panel"""
    question: str = Field(..., min_length=10, max_length=2000, description="Question for the panel")
    panel_type: str = Field(
        ...,
        description="Panel type: structured, open, socratic, adversarial, delphi, hybrid"
    )
    agents: List[AgentConfig] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Agent configurations for the panel"
    )
    context: Optional[str] = Field(default=None, description="Additional context for the panel")
    tenant_id: Optional[str] = Field(default=None, description="Tenant ID for multi-tenancy")
    user_id: Optional[str] = Field(default=None, description="User ID for tracking")
    save_to_db: bool = Field(default=True, description="Whether to save results to database")
    generate_matrix: bool = Field(default=True, description="Whether to generate comparison matrix")
    human_feedback: Optional[List[str]] = Field(
        default=None,
        description="Human feedback for hybrid panels"
    )


class StreamPanelRequest(BaseModel):
    """Request for streaming panel execution"""
    question: str = Field(..., min_length=10, max_length=2000)
    panel_type: str = Field(...)
    agents: List[AgentConfig] = Field(..., min_length=2, max_length=10)
    context: Optional[str] = Field(default=None)
    tenant_id: Optional[str] = Field(default=None)
    user_id: Optional[str] = Field(default=None)


class ConsensusResponse(BaseModel):
    """Consensus analysis response"""
    consensus_score: float
    consensus_level: str
    semantic_similarity: float
    claim_overlap: float
    recommendation_alignment: float
    evidence_overlap: float
    agreement_points: List[str]
    divergent_points: List[str]
    key_themes: List[str]
    recommendation: str
    dissenting_opinions: Dict[str, str]
    confidence: float


class ComparisonMatrixResponse(BaseModel):
    """Comparison matrix response"""
    question: str
    overall_consensus: float
    consensus_areas: List[str]
    divergence_areas: List[str]
    synthesis: str


class ExpertResponseItem(BaseModel):
    """Individual expert response"""
    agent_id: str
    agent_name: str
    content: str
    confidence: float
    round_number: int
    response_type: str
    position: Optional[str] = None
    vote: Optional[float] = None


class ExecutePanelResponse(BaseModel):
    """Response from panel execution"""
    panel_id: str
    panel_type: str
    question: str
    status: str
    consensus: Optional[ConsensusResponse] = None
    comparison_matrix: Optional[ComparisonMatrixResponse] = None
    expert_responses: List[ExpertResponseItem]
    execution_time_ms: int
    created_at: str
    metadata: Dict[str, Any]


class PanelTypeInfo(BaseModel):
    """Information about a panel type"""
    type: str
    name: str
    description: str
    best_for: str
    duration_estimate: str


class PanelHealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    panel_types: List[str]
    streaming_enabled: bool


# ============================================================================
# Dependencies
# ============================================================================

async def get_panel_service() -> UnifiedPanelService:
    """Get or create the unified panel service"""
    service = get_unified_panel_service()

    if service is None:
        # Initialize the service
        llm_service = get_llm_service()
        if llm_service is None:
            llm_service = LLMService()

        # Try to get panel repository for database persistence
        panel_repo = None
        if HAS_SUPABASE and get_supabase_client is not None and TenantAwareSupabaseClient is not None:
            try:
                supabase_client = get_supabase_client()
                if supabase_client and hasattr(supabase_client, 'client') and supabase_client.client:
                    # Wrap in TenantAwareSupabaseClient for proper repository usage
                    tenant_aware_client = TenantAwareSupabaseClient(supabase_client)
                    panel_repo = PanelRepository(tenant_aware_client)
                    logger.info("✅ Panel repository initialized with tenant-aware client")
            except Exception as e:
                logger.warning(f"Could not initialize panel repository: {e}")

        service = initialize_unified_panel_service(llm_service, panel_repo)

    return service


# ============================================================================
# Endpoints
# ============================================================================

@router.get("/health", response_model=PanelHealthResponse)
async def health_check():
    """
    Health check for unified panel service.

    Returns:
        Service health status and supported panel types
    """
    return PanelHealthResponse(
        status="healthy",
        service="unified-panel",
        panel_types=["structured", "open", "socratic", "adversarial", "delphi", "hybrid"],
        streaming_enabled=True
    )


@router.get("/types", response_model=List[PanelTypeInfo])
async def get_panel_types(
    service: UnifiedPanelService = Depends(get_panel_service)
):
    """
    Get all supported panel types with descriptions.

    Returns:
        List of panel types with metadata
    """
    types = service.get_supported_panel_types()
    return [PanelTypeInfo(**t) for t in types]


@router.post("/execute", response_model=ExecutePanelResponse)
async def execute_panel(
    request: ExecutePanelRequest,
    service: UnifiedPanelService = Depends(get_panel_service)
):
    """
    Execute a panel discussion synchronously.

    Supports all 6 panel types:
    - structured: Sequential moderated discussion
    - open: Free-form brainstorming (parallel)
    - socratic: Dialectical questioning
    - adversarial: Pro/con debate format
    - delphi: Iterative consensus with voting
    - hybrid: Human-AI collaborative panels

    Args:
        request: Panel execution request
        service: Injected panel service

    Returns:
        Complete panel execution result with consensus and comparison matrix
    """
    logger.info(
        "executing_unified_panel",
        panel_type=request.panel_type,
        agent_count=len(request.agents),
        question=request.question[:100]
    )

    # Validate panel type
    valid_types = ["structured", "open", "socratic", "adversarial", "delphi", "hybrid"]
    if request.panel_type.lower() not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid panel type. Must be one of: {', '.join(valid_types)}"
        )

    try:
        # Convert agent configs to dict format
        agents = [
            {
                "id": agent.id,
                "name": agent.name,
                "model": agent.model,
                "system_prompt": agent.system_prompt,
                "role": agent.role
            }
            for agent in request.agents
        ]

        # Execute panel
        result = await service.execute_panel(
            question=request.question,
            panel_type=request.panel_type.lower(),
            agents=agents,
            context=request.context,
            tenant_id=request.tenant_id,
            user_id=request.user_id,
            save_to_db=request.save_to_db,
            generate_matrix=request.generate_matrix,
            human_feedback=request.human_feedback
        )

        # Build response
        response = _build_execute_response(result)

        logger.info(
            "unified_panel_executed",
            panel_id=result.panel_id,
            status=result.status,
            execution_time_ms=result.execution_time_ms
        )

        return response

    except ValueError as e:
        logger.error("invalid_panel_request", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("panel_execution_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Panel execution failed: {str(e)}"
        )


@router.post("/stream")
async def stream_panel_execution(
    request: StreamPanelRequest,
    service: UnifiedPanelService = Depends(get_panel_service)
):
    """
    Execute panel with streaming responses using Server-Sent Events (SSE).

    The stream emits events in the following format:
    ```
    data: {"type": "panel_started", "data": {...}}
    data: {"type": "expert_response", "data": {...}}
    data: {"type": "consensus_complete", "data": {...}}
    data: {"type": "panel_complete", "data": {...}}
    ```

    Event types:
    - panel_started: Panel execution initiated
    - experts_loaded: Expert list confirmed
    - expert_thinking: Expert is generating response
    - expert_response: Expert response received
    - calculating_consensus: Consensus analysis in progress
    - consensus_complete: Consensus analysis finished
    - building_matrix: Comparison matrix generation in progress
    - matrix_complete: Comparison matrix finished
    - panel_complete: Panel execution finished
    - error: Error occurred

    Args:
        request: Stream panel request
        service: Injected panel service

    Returns:
        StreamingResponse with SSE events
    """
    logger.info(
        "streaming_unified_panel",
        panel_type=request.panel_type,
        agent_count=len(request.agents)
    )

    # Validate panel type
    valid_types = ["structured", "open", "socratic", "adversarial", "delphi", "hybrid"]
    if request.panel_type.lower() not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid panel type. Must be one of: {', '.join(valid_types)}"
        )

    async def event_generator():
        """Generate Server-Sent Events for panel execution"""
        try:
            # Convert agent configs
            agents = [
                {
                    "id": agent.id,
                    "name": agent.name,
                    "model": agent.model,
                    "system_prompt": agent.system_prompt,
                    "role": agent.role
                }
                for agent in request.agents
            ]

            # Stream execution
            async for event in service.execute_panel_streaming(
                question=request.question,
                panel_type=request.panel_type.lower(),
                agents=agents,
                context=request.context,
                tenant_id=request.tenant_id,
                user_id=request.user_id
            ):
                yield event
                await asyncio.sleep(0.01)  # Small delay to prevent overwhelming client

        except Exception as e:
            logger.error("streaming_error", error=str(e))
            error_event = f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
            yield error_event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )


@router.get("/matrix-views/{panel_id}")
async def get_matrix_views(
    panel_id: str,
    view: str = Query("synthesis", description="View type: grid, table, or synthesis"),
    service: UnifiedPanelService = Depends(get_panel_service)
):
    """
    Get comparison matrix in different view formats.

    Args:
        panel_id: Panel ID to get matrix for
        view: View type (grid, table, synthesis)

    Returns:
        Matrix data in requested view format
    """
    # This would need to retrieve from database or cache
    # For now, return informational response
    return {
        "panel_id": panel_id,
        "view_type": view,
        "message": "Matrix views are returned as part of execution response. "
                   "For stored panels, query /api/v1/panels/{panel_id} endpoint."
    }


# ============================================================================
# Helper Functions
# ============================================================================

def _build_execute_response(result: UnifiedPanelResult) -> ExecutePanelResponse:
    """Build ExecutePanelResponse from UnifiedPanelResult"""

    # Build consensus response if available
    consensus = None
    if result.consensus:
        consensus = ConsensusResponse(
            consensus_score=result.consensus.consensus_score,
            consensus_level=result.consensus.consensus_level,
            semantic_similarity=result.consensus.semantic_similarity,
            claim_overlap=result.consensus.claim_overlap,
            recommendation_alignment=result.consensus.recommendation_alignment,
            evidence_overlap=result.consensus.evidence_overlap,
            agreement_points=result.consensus.agreement_points,
            divergent_points=result.consensus.divergent_points,
            key_themes=result.consensus.key_themes,
            recommendation=result.consensus.recommendation,
            dissenting_opinions=result.consensus.dissenting_opinions,
            confidence=result.consensus.confidence
        )

    # Build comparison matrix response if available
    comparison_matrix = None
    if result.comparison_matrix:
        comparison_matrix = ComparisonMatrixResponse(
            question=result.comparison_matrix.question,
            overall_consensus=result.comparison_matrix.overall_consensus,
            consensus_areas=result.comparison_matrix.consensus_areas,
            divergence_areas=result.comparison_matrix.divergence_areas,
            synthesis=result.comparison_matrix.synthesis
        )

    # Build expert responses
    expert_responses = [
        ExpertResponseItem(
            agent_id=r.get("agent_id", "unknown"),
            agent_name=r.get("agent_name", "Expert"),
            content=r.get("content", ""),
            confidence=r.get("confidence", 0.0),
            round_number=r.get("round_number", 1),
            response_type=r.get("response_type", "analysis"),
            position=r.get("position"),
            vote=r.get("vote")
        )
        for r in result.expert_responses
    ]

    return ExecutePanelResponse(
        panel_id=result.panel_id,
        panel_type=result.panel_type,
        question=result.question,
        status=result.status,
        consensus=consensus,
        comparison_matrix=comparison_matrix,
        expert_responses=expert_responses,
        execution_time_ms=result.execution_time_ms,
        created_at=result.created_at,
        metadata=result.metadata
    )
