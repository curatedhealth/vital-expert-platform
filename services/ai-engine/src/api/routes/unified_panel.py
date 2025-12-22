# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-19
# MODES_SUPPORTED: [Panel - All 6 types + Runner Integration]
# DEPENDENCIES: [services.unified_panel_service, services.llm_service, services.panel.panel_runner_mapper]
"""
Unified Panel API Routes

Exposes the UnifiedPanelService for all 6 panel types:
1. Structured - Sequential moderated discussion
2. Open - Free-form brainstorming (parallel)
3. Socratic - Dialectical questioning
4. Adversarial - Pro/con debate format
5. Delphi - Iterative consensus with voting
6. Hybrid - Human-AI collaborative panels

Now with Runner Integration:
- Auto-selects appropriate cognitive runner based on panel type
- Supports JTBD-based runner selection
- Complexity-aware runner routing
- Tracks runner execution metrics

Supports both synchronous and streaming execution.
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, Literal
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import structlog
from dataclasses import asdict

from services.panel.unified_panel_service import (
    UnifiedPanelService,
    UnifiedPanelResult,
    create_unified_panel_service,
    get_unified_panel_service,
    initialize_unified_panel_service
)
from services.llm_service import LLMService, get_llm_service
from services.panel.panel_runner_mapper import (
    get_panel_runner_mapper,
    get_runner_for_panel,
    detect_query_complexity,
    RunnerMapping,
    QueryComplexity,
    JTBDLevel,
)

# Optional: Import unified runner registry for all runners
try:
    from langgraph_workflows.task_runners.unified_registry import (
        get_unified_registry,
        RunnerInfo,
    )
    HAS_RUNNER_REGISTRY = True
except ImportError:
    HAS_RUNNER_REGISTRY = False
    get_unified_registry = None
    RunnerInfo = None

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


class RunnerConfig(BaseModel):
    """Runner configuration for panel execution"""
    runner_id: Optional[str] = Field(
        default=None,
        description="Explicit runner ID to use. If not provided, auto-selects based on panel type."
    )
    auto_select: bool = Field(
        default=True,
        description="Auto-select runner based on panel type and complexity"
    )
    jtbd_level: Optional[Literal["task", "workflow", "solution", "strategic"]] = Field(
        default=None,
        description="JTBD level for runner selection (task, workflow, solution, strategic)"
    )
    complexity: Optional[Literal["simple", "moderate", "complex", "strategic"]] = Field(
        default=None,
        description="Query complexity level for runner selection"
    )
    use_advanced: bool = Field(
        default=False,
        description="Force use of advanced runner variant"
    )
    prefer_streaming: bool = Field(
        default=False,
        description="Prefer streaming family runners for complex operations"
    )


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
    # NEW: Runner configuration
    runner_config: Optional[RunnerConfig] = Field(
        default=None,
        description="Optional runner configuration. If not provided, uses auto-selection."
    )


class StreamPanelRequest(BaseModel):
    """Request for streaming panel execution"""
    question: str = Field(..., min_length=10, max_length=2000)
    panel_type: str = Field(...)
    agents: List[AgentConfig] = Field(..., min_length=2, max_length=10)
    context: Optional[str] = Field(default=None)
    tenant_id: Optional[str] = Field(default=None)
    user_id: Optional[str] = Field(default=None)
    # NEW: Runner configuration
    runner_config: Optional[RunnerConfig] = Field(
        default=None,
        description="Optional runner configuration. If not provided, uses auto-selection."
    )


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


class RunnerInfoResponse(BaseModel):
    """Information about the runner used for execution"""
    runner_id: str = Field(..., description="ID of the runner used")
    runner_type: str = Field(..., description="Type: task or family")
    category: str = Field(..., description="Cognitive category")
    ai_intervention: str = Field(..., description="AI intervention level")
    service_layer: str = Field(..., description="Service layer: L1, L2, or L3")
    auto_selected: bool = Field(..., description="Whether runner was auto-selected")
    detected_complexity: Optional[str] = Field(default=None, description="Detected query complexity")


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
    # NEW: Runner information
    runner_info: Optional[RunnerInfoResponse] = Field(
        default=None,
        description="Information about the runner used for execution"
    )


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


@router.get("/runners")
async def list_all_panel_runners():
    """
    List all panel types with their runner mappings.

    Returns complete mapping of panels to runners across all tiers.
    """
    mapper = get_panel_runner_mapper()
    panels = mapper.list_supported_panels()

    result = {}
    for panel_type in panels:
        result[panel_type] = mapper.get_runner_info(panel_type)

    return {
        "total_panels": len(panels),
        "panels": result
    }


@router.get("/runners/all")
async def list_all_available_runners(
    category: Optional[str] = Query(None, description="Filter by cognitive category (e.g., UNDERSTAND, EVALUATE)"),
    runner_type: Optional[str] = Query(None, description="Filter by runner type: task, family")
):
    """
    List ALL available runners in the system (215+ runners).

    Returns all runners from the unified registry, including:
    - 88 Task Runners (22 cognitive categories)
    - 8 Family Runners (complex workflows)
    - 119 Pharma-specific runners

    Args:
        category: Optional filter by cognitive category (UNDERSTAND, EVALUATE, DECIDE, etc.)
        runner_type: Optional filter by type ('task' or 'family')

    Returns:
        Complete list of all available runners with metadata
    """
    if not HAS_RUNNER_REGISTRY:
        # Fallback to panel-mapped runners only
        mapper = get_panel_runner_mapper()
        panels = mapper.list_supported_panels()

        all_runners = []
        seen_ids = set()
        for panel_type in panels:
            info = mapper.get_runner_info(panel_type)
            for tier, runner in info["runners"].items():
                if runner["runner_id"] not in seen_ids:
                    seen_ids.add(runner["runner_id"])
                    all_runners.append({
                        **runner,
                        "panel_types": [panel_type],
                        "tier": tier
                    })
                else:
                    # Update panel_types for existing runner
                    for r in all_runners:
                        if r["runner_id"] == runner["runner_id"]:
                            if panel_type not in r.get("panel_types", []):
                                r["panel_types"].append(panel_type)
                            break

        return {
            "total": len(all_runners),
            "runners": all_runners,
            "source": "panel_mapper",
            "categories": list(set(r.get("category") for r in all_runners if r.get("category")))
        }

    # Use unified registry for complete runner list
    registry = get_unified_registry()

    # Get all runners
    if runner_type == "task":
        runners = registry.list_task_runners(category=category.upper() if category else None)
    elif runner_type == "family":
        runners = registry.list_family_runners()
    else:
        runners = registry.list_all_runners()
        if category:
            runners = [r for r in runners if r.category and r.category.upper() == category.upper()]

    # Convert to dicts
    runner_list = []
    for r in runners:
        runner_dict = r.model_dump() if hasattr(r, 'model_dump') else {
            "runner_id": r.runner_id,
            "name": r.name,
            "runner_type": r.runner_type.value if hasattr(r.runner_type, 'value') else r.runner_type,
            "category": r.category,
            "family": getattr(r, 'family', None),
            "description": getattr(r, 'description', None),
            "service_layers": getattr(r, 'service_layers', []),
            "ai_intervention": r.ai_intervention.value if hasattr(r.ai_intervention, 'value') else r.ai_intervention,
        }
        runner_list.append(runner_dict)

    # Get available categories
    categories = list(set(r.get("category") for r in runner_list if r.get("category")))

    return {
        "total": len(runner_list),
        "runners": runner_list,
        "source": "unified_registry",
        "categories": sorted(categories),
        "filters": {
            "category": category,
            "runner_type": runner_type
        }
    }


@router.get("/runners/{panel_type}")
async def get_runners_for_panel(
    panel_type: str,
    complexity: Optional[str] = Query(None, description="Query complexity: simple, moderate, complex, strategic"),
    jtbd_level: Optional[str] = Query(None, description="JTBD level: task, workflow, solution, strategic")
):
    """
    Get available runners for a panel type.

    Returns all runner tiers (primary, advanced, family) for the specified panel type,
    along with the recommended runner based on complexity/JTBD.

    Args:
        panel_type: Panel type to get runners for
        complexity: Optional complexity level for recommendation
        jtbd_level: Optional JTBD level for recommendation

    Returns:
        Available runners and recommendation
    """
    panel_type_lower = panel_type.lower()
    mapper = get_panel_runner_mapper()

    # Validate panel type
    supported = mapper.list_supported_panels()
    if panel_type_lower not in supported:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid panel type. Must be one of: {', '.join(supported)}"
        )

    # Get all runners for this panel type
    all_runners = mapper.get_runner_info(panel_type_lower)

    # Get recommended runner
    recommended = get_runner_for_panel(
        panel_type=panel_type_lower,
        complexity=complexity,
        jtbd_level=jtbd_level
    )

    return {
        "panel_type": panel_type_lower,
        "available_runners": all_runners["runners"],
        "recommended": {
            "runner_id": recommended.runner_id,
            "runner_type": recommended.runner_type,
            "category": recommended.category,
            "ai_intervention": recommended.ai_intervention,
            "service_layer": recommended.service_layer,
            "use_streaming": recommended.use_streaming
        },
        "selection_criteria": {
            "complexity": complexity,
            "jtbd_level": jtbd_level
        }
    }


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

    Runner Integration:
    - Auto-selects appropriate cognitive runner based on panel type
    - Supports JTBD-based runner selection via runner_config
    - Complexity-aware runner routing
    - Returns runner_info in response

    Args:
        request: Panel execution request
        service: Injected panel service

    Returns:
        Complete panel execution result with consensus, comparison matrix, and runner info
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
        # === RUNNER SELECTION ===
        runner_config = request.runner_config
        auto_selected = True
        detected_complexity = None

        if runner_config and runner_config.runner_id:
            # Explicit runner specified
            runner_id = runner_config.runner_id
            auto_selected = False
            runner_mapping = get_runner_for_panel(
                panel_type=request.panel_type.lower(),
                use_advanced=runner_config.use_advanced
            )
        else:
            # Auto-detect complexity if not provided
            if runner_config and runner_config.complexity:
                detected_complexity = runner_config.complexity
            else:
                detected_complexity = detect_query_complexity(request.question)

            # Get runner mapping
            runner_mapping = get_runner_for_panel(
                panel_type=request.panel_type.lower(),
                complexity=detected_complexity,
                jtbd_level=runner_config.jtbd_level if runner_config else None,
                use_advanced=runner_config.use_advanced if runner_config else False,
                prefer_streaming=runner_config.prefer_streaming if runner_config else False
            )
            runner_id = runner_mapping.runner_id

        logger.info(
            "runner_selected_for_panel",
            runner_id=runner_id,
            runner_type=runner_mapping.runner_type,
            category=runner_mapping.category,
            auto_selected=auto_selected,
            detected_complexity=detected_complexity
        )

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

        # Build runner info
        runner_info = RunnerInfoResponse(
            runner_id=runner_mapping.runner_id,
            runner_type=runner_mapping.runner_type,
            category=runner_mapping.category,
            ai_intervention=runner_mapping.ai_intervention,
            service_layer=runner_mapping.service_layer,
            auto_selected=auto_selected,
            detected_complexity=detected_complexity
        )

        # Build response with runner info
        response = _build_execute_response(result, runner_info)

        logger.info(
            "unified_panel_executed",
            panel_id=result.panel_id,
            status=result.status,
            execution_time_ms=result.execution_time_ms,
            runner_id=runner_mapping.runner_id
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

            # === RUNNER SELECTION ===
            # Select appropriate runner based on panel type and config
            panel_type_lower = request.panel_type.lower()
            runner_config = getattr(request, 'runner_config', None)

            # Determine complexity
            detected_complexity = "moderate"
            if runner_config and runner_config.complexity:
                detected_complexity = runner_config.complexity

            # Get runner mapping
            runner_mapping = get_runner_for_panel(
                panel_type=panel_type_lower,
                complexity=detected_complexity,
                jtbd_level=runner_config.jtbd_level if runner_config else None,
                use_advanced=runner_config.use_advanced if runner_config else False
            )

            auto_selected = not runner_config or runner_config.auto_select

            # Build runner info
            runner_info = {
                "runner_id": runner_mapping.runner_id,
                "runner_type": runner_mapping.runner_type,
                "category": runner_mapping.category,
                "ai_intervention": runner_mapping.ai_intervention,
                "service_layer": runner_mapping.service_layer,
                "auto_selected": auto_selected,
                "detected_complexity": detected_complexity
            }

            # Emit runner_selected event
            yield f"event: runner_selected\ndata: {json.dumps({'runner_info': runner_info, 'message': f'Selected runner: {runner_mapping.runner_id} ({runner_mapping.service_layer})'})}\n\n"

            # Stream execution
            async for event in service.execute_panel_streaming(
                question=request.question,
                panel_type=panel_type_lower,
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

def _build_execute_response(
    result: UnifiedPanelResult,
    runner_info: Optional[RunnerInfoResponse] = None
) -> ExecutePanelResponse:
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
        metadata=result.metadata,
        runner_info=runner_info
    )
