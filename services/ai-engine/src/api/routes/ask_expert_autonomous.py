# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph_workflows.modes34.unified_autonomous_workflow, core.security, core.resilience, api.sse]
"""
Ask Expert Autonomous API Routes - Mode 3 & Mode 4 (Autonomous Missions)

This module provides the autonomous mission endpoints:
- POST /ask-expert/autonomous                     -> Create autonomous mission (primary)
- POST /ask-expert/missions                       -> Create mission (legacy alias)
- GET  /ask-expert/missions/templates             -> List mission templates
- GET  /ask-expert/missions/templates/{id}        -> Get template details
- GET  /ask-expert/missions/{id}/stream           -> Stream mission events
- GET  /ask-expert/missions/{id}                  -> Get mission status
- POST /ask-expert/missions/{id}/checkpoints/{cpId}/resolve -> Resolve HITL
- POST /ask-expert/missions/{id}/pause            -> Pause mission
- POST /ask-expert/missions/{id}/resume           -> Resume mission
- POST /ask-expert/missions/{id}/cancel           -> Cancel mission
- GET  /ask-expert/missions                       -> List user's missions
- GET  /ask-expert/missions/{id}/artifacts        -> Get mission artifacts
- GET  /ask-expert/missions/{id}/artifacts/{aId}/download -> Download artifact

Mode 3 vs Mode 4 difference:
- Mode 3: agent_id provided (manual selection)
- Mode 4: agent_id absent (auto-selection via GraphRAG)

These routes integrate with the mission executor and emit Anthropic-style
SSE events for real-time progress updates.
"""

from typing import Any, Dict, List, Optional
import json
import structlog
import time
import uuid
import asyncio

from fastapi import APIRouter, Depends, Header, Query, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field, ValidationError

# Security imports for production hardening
from core.security import InputSanitizer, ErrorSanitizer, TenantIsolation, check_rate_limit_or_raise
from core.resilience import CircuitBreaker, CircuitBreakerConfig

# H1 CRITICAL: Import validated research schemas
from api.schemas.research import (
    MissionCreateRequest as ValidatedMissionRequest,
    ValidationErrorResponse,
    ValidationErrorDetail,
)

from api.sse import (
    SSEEventTransformer,
    transform_and_format,
    format_sse_event,
    mission_queues,
    emit_mission_event,
    emit_checkpoint_reached,
    emit_mission_completed,
    emit_mission_failed,
    get_or_create_queue,
    cleanup_queue,
    # Stream synchronization (race condition prevention)
    create_stream_ready_event,
    signal_stream_ready,
    cleanup_stream_sync,
    is_stream_ready,
)
from core.resilience import create_safe_task
from core.config import get_settings

logger = structlog.get_logger()

router = APIRouter(prefix="/ask-expert", tags=["ask-expert-autonomous"])


# ============================================================================
# Security Configuration
# ============================================================================

# Circuit breaker for LLM providers (prevents cascading failures)
AUTONOMOUS_CIRCUIT_BREAKER = CircuitBreaker(
    "ask_expert_autonomous_llm",
    CircuitBreakerConfig(
        failure_threshold=5,
        recovery_timeout=30.0,
        half_open_max_calls=3,
        success_threshold=2,
    )
)

# Supabase client singleton for connection pooling
_supabase_client = None


def validate_and_sanitize_tenant(x_tenant_id: Optional[str]) -> str:
    """
    Validate and sanitize tenant ID.

    Raises HTTPException if tenant ID is missing or invalid.
    Returns sanitized tenant ID string.
    """
    if not x_tenant_id:
        raise HTTPException(status_code=403, detail="Tenant ID required for autonomous missions")
    try:
        return TenantIsolation.validate_tenant_id(x_tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


# ============================================================================
# Request/Response Models
# ============================================================================

class MissionTemplateResponse(BaseModel):
    """Mission template details."""
    id: str
    name: str
    slug: Optional[str] = None  # Derived from id if not present
    description: str
    family: Optional[str] = None  # Gold Standard: family instead of category
    category: Optional[str] = None  # For backwards compatibility
    complexity: Optional[str] = None  # Gold Standard: complexity instead of difficulty_level
    estimated_duration_min: Optional[int] = None  # Gold Standard: min duration
    estimated_duration_max: Optional[int] = None  # Gold Standard: max duration
    estimated_duration_hours: Optional[float] = None  # Computed for backwards compat
    difficulty_level: Optional[str] = None  # Alias for complexity
    default_checkpoints: List[Dict[str, Any]] = Field(default_factory=list)
    checkpoints: List[Dict[str, Any]] = Field(default_factory=list)  # Gold Standard name
    required_inputs: List[Dict[str, Any]] = Field(default_factory=list)
    outputs: List[Dict[str, Any]] = Field(default_factory=list)  # Gold Standard: outputs instead of expected_outputs
    expected_outputs: List[str] = Field(default_factory=list)  # Backwards compat
    tasks: Optional[List[Dict[str, Any]]] = None  # Gold Standard: tasks instead of steps
    plan: Optional[Dict[str, Any]] = None
    steps: Optional[List[Dict[str, Any]]] = None  # Alias for tasks


class CreateMissionRequest(BaseModel):
    """Request to create and start a mission (LEGACY - use MissionCreateRequest from schemas.research)."""
    template_id: str = Field(..., description="Mission template ID or slug")
    goal: str = Field(..., min_length=1, max_length=5000, description="User's goal for this mission")
    inputs: Dict[str, Any] = Field(default_factory=dict, description="Input parameters for the mission")
    budget_limit: Optional[float] = Field(None, description="Maximum cost in dollars")
    timeout_minutes: Optional[int] = Field(None, description="Maximum execution time")
    auto_approve_checkpoints: bool = Field(False, description="Auto-approve HITL checkpoints")
    agent_id: Optional[str] = Field(None, description="Specific agent to use (Mode 3)")


class MissionResponse(BaseModel):
    """Mission status response."""
    id: str
    template_id: str
    template_name: Optional[str] = None
    goal: str
    status: str  # pending, running, paused, completed, failed, cancelled
    progress: int = 0  # 0-100
    current_task: Optional[str] = None
    checkpoints_pending: int = 0
    total_cost: float = 0.0
    total_tokens: int = 0
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None
    error: Optional[str] = None


class CheckpointResolveRequest(BaseModel):
    """Request to resolve a HITL checkpoint."""
    action: str = Field(..., description="Action to take: approve, reject, modify, skip")
    feedback: Optional[str] = Field(None, description="User feedback or instructions")
    modifications: Dict[str, Any] = Field(default_factory=dict, description="Modifications for 'modify' action")


class ArtifactResponse(BaseModel):
    """Mission artifact details."""
    id: str
    mission_id: str
    type: str  # document, chart, table, code, image, pdf
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    size_bytes: Optional[int] = None
    created_at: str


# ============================================================================
# Helper Functions
# ============================================================================

def get_supabase_client():
    """
    Get Supabase client with connection pooling (singleton pattern).

    Reuses a single client instance to avoid connection overhead
    and maintain proper connection pooling.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    from supabase import create_client
    import os

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")

    _supabase_client = create_client(supabase_url, supabase_key)
    return _supabase_client


# ============================================================================
# Mission Template Routes
# ============================================================================

@router.get("/missions/templates", response_model=List[MissionTemplateResponse])
async def list_mission_templates(
    category: Optional[str] = Query(None, description="Filter by category/family"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty/complexity"),
    family: Optional[str] = Query(None, description="Filter by family (Gold Standard)"),
    complexity: Optional[str] = Query(None, description="Filter by complexity (Gold Standard)"),
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    List available mission templates.

    Templates define the structure and workflow for autonomous missions.
    Gold Standard schema uses: is_active, family, complexity, tasks, checkpoints
    """
    try:
        supabase = get_supabase_client()

        # Gold Standard: use is_active (boolean) instead of status
        query = supabase.table("mission_templates").select("*").eq("is_active", True)

        # Support both old and new parameter names
        filter_family = family or category
        filter_complexity = complexity or difficulty

        if filter_family:
            query = query.eq("family", filter_family)
        if filter_complexity:
            query = query.eq("complexity", filter_complexity)

        result = query.order("name").execute()

        templates = []
        for row in result.data or []:
            # Compute backwards-compatible duration in hours
            duration_min = row.get("estimated_duration_min") or 0
            duration_max = row.get("estimated_duration_max") or 0
            avg_duration_hours = ((duration_min + duration_max) / 2) / 60 if (duration_min or duration_max) else None

            # Map Gold Standard fields to response with backwards compatibility
            templates.append(MissionTemplateResponse(
                id=row.get("id"),
                name=row.get("name"),
                slug=row.get("id"),  # Use id as slug if no slug field
                description=row.get("description", ""),
                # Gold Standard fields
                family=row.get("family"),
                complexity=row.get("complexity"),
                estimated_duration_min=row.get("estimated_duration_min"),
                estimated_duration_max=row.get("estimated_duration_max"),
                checkpoints=row.get("checkpoints") or [],
                outputs=row.get("outputs") or [],
                tasks=row.get("tasks"),
                # Backwards compatibility aliases
                category=row.get("category") or row.get("family"),  # Fallback to family
                estimated_duration_hours=avg_duration_hours,
                difficulty_level=row.get("difficulty_level") or row.get("complexity"),  # Fallback to complexity
                default_checkpoints=row.get("default_checkpoints") or row.get("checkpoints") or [],
                required_inputs=row.get("required_inputs") or [],
                expected_outputs=row.get("expected_outputs") or [o.get("name", "") for o in (row.get("outputs") or [])],
                plan=row.get("plan") or row.get("workflow_config"),
                steps=row.get("steps") or row.get("tasks"),
            ))

        return templates

    except Exception as e:
        logger.error("list_templates_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/missions/templates/{template_id}", response_model=MissionTemplateResponse)
async def get_mission_template(
    template_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Get details of a specific mission template."""
    try:
        supabase = get_supabase_client()

        # Try by ID first (Gold Standard uses string IDs like 'trigger_monitoring')
        result = supabase.table("mission_templates").select("*").eq("id", template_id).limit(1).execute()

        # Get first result if any
        if result.data:
            result.data = result.data[0]

        if not result.data:
            raise HTTPException(status_code=404, detail="Template not found")

        row = result.data

        # Compute backwards-compatible duration in hours
        duration_min = row.get("estimated_duration_min") or 0
        duration_max = row.get("estimated_duration_max") or 0
        avg_duration_hours = ((duration_min + duration_max) / 2) / 60 if (duration_min or duration_max) else None

        # Map Gold Standard fields to response with backwards compatibility
        return MissionTemplateResponse(
            id=row.get("id"),
            name=row.get("name"),
            slug=row.get("id"),  # Use id as slug
            description=row.get("description", ""),
            # Gold Standard fields
            family=row.get("family"),
            complexity=row.get("complexity"),
            estimated_duration_min=row.get("estimated_duration_min"),
            estimated_duration_max=row.get("estimated_duration_max"),
            checkpoints=row.get("checkpoints") or [],
            outputs=row.get("outputs") or [],
            tasks=row.get("tasks"),
            # Backwards compatibility aliases
            category=row.get("category") or row.get("family"),
            estimated_duration_hours=avg_duration_hours,
            difficulty_level=row.get("difficulty_level") or row.get("complexity"),
            default_checkpoints=row.get("default_checkpoints") or row.get("checkpoints") or [],
            required_inputs=row.get("required_inputs") or [],
            expected_outputs=row.get("expected_outputs") or [o.get("name", "") for o in (row.get("outputs") or [])],
            plan=row.get("plan") or row.get("workflow_config"),
            steps=row.get("steps") or row.get("tasks"),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_template_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Mission CRUD Routes
# ============================================================================

@router.post("/missions", response_model=MissionResponse)
async def create_mission(
    request: CreateMissionRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Create and start a new mission (Mode 3 or Mode 4).

    The mission will begin execution asynchronously. Use the stream endpoint
    to receive real-time updates.

    H1 CRITICAL FIX: Applies input validation via ValidatedMissionRequest
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # H1 CRITICAL: Validate using enhanced schema with injection detection
        # Determine mode: Mode 3 if agent_id is provided (manual selection), Mode 4 if auto-select
        mission_mode = 3 if request.agent_id else 4

        # Resolve tenant_id: use header if provided, otherwise fetch from config default
        # Per platform architecture: all assets map to the current tenant
        effective_tenant_id = x_tenant_id or get_settings().default_tenant_id
        logger.debug("tenant_resolved",
                     header_value=x_tenant_id,
                     effective_tenant_id=effective_tenant_id,
                     source="header" if x_tenant_id else "config_default")

        try:
            validated_request = ValidatedMissionRequest(
                template_id=request.template_id,
                goal=request.goal,
                agent_id=request.agent_id,
                tenant_id=effective_tenant_id,  # Resolved from header or config default
                mode=mission_mode,           # Inferred from agent_id presence
                hitl_enabled=not request.auto_approve_checkpoints,  # Inverted logic
                budget_limit=request.budget_limit,
                deadline_hours=request.timeout_minutes // 60 if request.timeout_minutes else None,
            )
        except ValidationError as ve:
            errors = []
            for error in ve.errors():
                field = ".".join(str(loc) for loc in error["loc"])
                errors.append(ValidationErrorDetail(
                    field=field,
                    message=error["msg"],
                ))
            raise HTTPException(
                status_code=422,
                detail=ValidationErrorResponse(
                    error="Validation failed",
                    details=errors,
                    suggestions=[
                        "Ensure all fields meet validation requirements",
                        "Remove special characters or injection patterns from text fields",
                        "Check numeric ranges (budget 0-1000, timeout 1-480)"
                    ]
                ).model_dump()
            )
        # --- RESILIENCE: Check circuit breaker ---
        if AUTONOMOUS_CIRCUIT_BREAKER.is_open:
            logger.warning("circuit_breaker_open", endpoint="create_mission", correlation_id=correlation_id)
            raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please retry shortly.")

        # --- SECURITY: Validate tenant ---
        sanitized_tenant_id = validate_and_sanitize_tenant(effective_tenant_id)

        # --- SECURITY: Rate limiting ---
        rate_limit_id = sanitized_tenant_id or x_user_id or "anonymous"
        check_rate_limit_or_raise(rate_limit_id, endpoint="create_mission")

        # --- SECURITY: Sanitize inputs (already done by validated_request, but keep for belt-and-suspenders) ---
        # NOTE: validated_request already applied Pydantic validators
        sanitized_template_id = validated_request.template_id
        sanitized_goal = validated_request.goal  # Already sanitized by @field_validator
        sanitized_agent_id = validated_request.agent_id
        sanitized_inputs = InputSanitizer.sanitize_json(request.inputs) if request.inputs else {}  # Use original request.inputs

        supabase = get_supabase_client()

        # Validate template exists
        template_result = supabase.table("mission_templates").select("*").eq("id", sanitized_template_id).single().execute()

        if not template_result.data:
            # Try by slug
            template_result = supabase.table("mission_templates").select("*").eq("slug", sanitized_template_id).single().execute()

        if not template_result.data:
            raise HTTPException(status_code=404, detail="Template not found")

        template = template_result.data
        mission_id = str(uuid.uuid4())
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Create mission record using SANITIZED values
        # Note: Database uses 'expert_id' for the selected agent (Mode 3)
        # Generate title from goal (first 100 chars) or template name
        title = sanitized_goal[:100] if len(sanitized_goal) <= 100 else sanitized_goal[:97] + "..."

        # Generate objective from template description or goal
        objective = template.get("description", "") or sanitized_goal[:200]

        mission_data = {
            "id": mission_id,
            "template_id": template.get("id"),
            "tenant_id": sanitized_tenant_id,
            "user_id": x_user_id,
            "expert_id": sanitized_agent_id,  # DB column is 'expert_id' - SANITIZED
            "title": title,  # Required NOT NULL field - SANITIZED
            "objective": objective,  # Required NOT NULL field - describes mission purpose
            "goal": sanitized_goal,  # SANITIZED
            "status": "pending",
            "mode": 3 if sanitized_agent_id else 4,  # Mode 3 = manual selection, Mode 4 = auto
            "budget_limit": validated_request.budget_limit or 10.0,
            "metadata": {
                "inputs": sanitized_inputs,  # SANITIZED
                "timeout_minutes": request.timeout_minutes,  # Use original request field
                "auto_approve_checkpoints": request.auto_approve_checkpoints,  # Use original request field
                "hitl_enabled": validated_request.hitl_enabled,
            },
        }

        result = supabase.table("missions").insert(mission_data).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create mission")

        # Set up stream synchronization BEFORE starting background task
        # This prevents race condition where events are emitted before client connects
        create_stream_ready_event(mission_id)

        # Define error handler for mission execution failures
        async def on_mission_error(e: Exception) -> None:
            """Handle mission execution errors by emitting failure event."""
            try:
                await emit_mission_failed(
                    mission_id,
                    mission_id,
                    error=str(e),
                    error_code=type(e).__name__,
                    recoverable=False,
                    suggestion="Please try again or contact support",
                )
                # Also update mission status in database
                # Note: 'error' column doesn't exist - store in metadata JSONB
                supabase.table("missions").update({
                    "status": "failed",
                    "metadata": {"error": str(e), "error_code": type(e).__name__},
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }).eq("id", mission_id).execute()
            except Exception as update_error:
                logger.error("failed_to_update_mission_status", error=str(update_error))

        # Start mission execution with safe background task wrapper
        # This ensures errors are logged and failure events are emitted
        # NOTE: Pass validated_request instead of raw request
        create_safe_task(
            _execute_mission_async(mission_id, template, validated_request, x_tenant_id),
            task_name=f"mission_execution_{mission_id[:8]}",
            on_error=on_mission_error,
        )

        return MissionResponse(
            id=mission_id,
            template_id=template.get("id"),
            template_name=template.get("name"),
            goal=sanitized_goal,
            status="pending",
            progress=0,
            created_at=now,
            updated_at=now,
        )

    except HTTPException:
        raise
    except Exception as e:
        # Record circuit breaker failure
        asyncio.create_task(AUTONOMOUS_CIRCUIT_BREAKER._record_failure())

        # Sanitize error for client exposure
        sanitized_error, ref_id = ErrorSanitizer.sanitize_error(e, 'internal')
        logger.error(
            "create_mission_error",
            error=str(e),
            correlation_id=correlation_id,
            reference_id=ref_id,
        )
        raise HTTPException(status_code=500, detail=sanitized_error)


async def _execute_mission_async(
    mission_id: str,
    template: Dict[str, Any],
    request: ValidatedMissionRequest,  # H1 CRITICAL: Use validated request
    tenant_id: Optional[str],
):
    """
    Execute mission in background using LangGraph master_graph.

    This delegates to the real Mode 3/4 LangGraph implementation that includes:
    - Template-driven task planning
    - L2/L3/L4 agent orchestration
    - HITL checkpoint enforcement
    - RAG/websearch integration
    - Quality scoring and output validation
    """
    try:
        supabase = get_supabase_client()

        # Update status to running
        supabase.table("missions").update({
            "status": "running",
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }).eq("id", mission_id).execute()

        # Emit mission started
        await emit_mission_event(mission_id, "mission_started", {
            "mission_id": mission_id,
            "template_id": template.get("id"),
            "template_name": template.get("name"),
            "estimated_duration_minutes": (
                (template.get("estimated_duration_min", 30) + template.get("estimated_duration_max", 60)) / 2
            ),
        })

        # Build initial state for LangGraph unified_autonomous_workflow
        from langgraph_workflows.modes34.unified_autonomous_workflow import build_master_graph
        from langgraph_workflows.modes34.state import MissionState
        from services.mission_repository import mission_repo

        # Get template plan/tasks and checkpoints
        template_plan = template.get("tasks") or template.get("plan") or template.get("steps")
        template_checkpoints = template.get("checkpoints") or template.get("default_checkpoints") or []
        template_outputs = template.get("outputs") or []
        template_family = template.get("family") or template.get("category")
        template_cat = template.get("cat_code") or template.get("category")

        # Create initial state for LangGraph
        initial_state: MissionState = {
            "mission_id": mission_id,
            "mode": 3 if request.agent_id else 4,  # Mode 3 if agent specified, else Mode 4
            "goal": request.goal,
            "template_id": template.get("id"),
            "template_family": template_family,
            "template_cat": template_cat,
            "template_checkpoints": template_checkpoints,
            "template_outputs": template_outputs,
            "tenant_id": tenant_id,
            "selected_agent": request.agent_id,
            "selected_team": [],
            "status": "running",
            "plan": [],  # Will be generated by LangGraph
            "artifacts": [],
            "checkpoints": [],
            "ui_updates": [],
            "checkpoint_pending": None,
            "checkpoint_resolved": True,
            "preflight": {},
            "current_step": 0,
            "total_steps": 0,
            "pending_checkpoint": None,
            "human_response": None,
            "budget_limit": request.budget_limit,
            "current_cost": 0.0,
            "quality_checks": 0,
            "final_output": None,
            "output_validation": None,
        }

        # If template has pre-defined tasks, seed them into plan
        if template_plan:
            initial_state["plan"] = template_plan

        # Build and run the LangGraph master graph
        # Note: build_master_graph() already returns CompiledStateGraph, no need to compile again
        compiled_graph = build_master_graph()

        # Stream execution events from LangGraph
        total_tokens = 0
        total_cost = 0.0
        final_output = None

        # LangGraph requires thread_id for checkpointing - use mission_id as thread identifier
        graph_config = {"configurable": {"thread_id": mission_id}}

        async for chunk in compiled_graph.astream(initial_state, config=graph_config):
            for node_name, node_output in chunk.items():
                if not isinstance(node_output, dict):
                    continue

                # Transform LangGraph events to V2 frontend events
                status = node_output.get("status")
                current_step = node_output.get("current_step", 0)
                total_steps = node_output.get("total_steps", 1)

                # Emit progress updates
                # Note: progress stored in metadata since column doesn't exist
                if total_steps > 0:
                    progress = int((current_step / total_steps) * 100)
                    supabase.table("missions").update({
                        "metadata": {"progress": min(progress, 99)},  # Store in metadata
                        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    }).eq("id", mission_id).execute()

                # Handle different node types
                # NOTE: Node names must match LangGraph graph definition exactly:
                # initialize, decompose_query, plan_mission, select_team, execute_step,
                # confidence_gate, checkpoint, synthesize, verify_citations, quality_gate, reflection_gate
                if node_name == "initialize":
                    # Initialization completed (was "preflight")
                    await emit_mission_event(mission_id, "preflight_completed", {
                        "mission_id": mission_id,
                        "checks": node_output.get("preflight", node_output.get("initialization", {})),
                    })

                elif node_name == "decompose_query":
                    # Query decomposition completed (NEW)
                    await emit_mission_event(mission_id, "query_decomposed", {
                        "mission_id": mission_id,
                        "sub_queries": node_output.get("sub_queries", []),
                        "intent": node_output.get("intent", {}),
                    })

                elif node_name == "plan_mission":
                    # Planning completed (was "planning")
                    plan = node_output.get("plan", [])
                    await emit_mission_event(mission_id, "plan_ready", {
                        "mission_id": mission_id,
                        "plan": plan,
                        "total_steps": len(plan),
                    })

                elif node_name == "select_team":
                    # Team selection completed (NEW)
                    team = node_output.get("team", [])
                    await emit_mission_event(mission_id, "team_selected", {
                        "mission_id": mission_id,
                        "team": team,
                        "team_count": len(team),
                    })

                elif node_name in ["execute_step", "execute"]:
                    # Step execution
                    from api.sse import emit_task_started, emit_task_progress, emit_task_completed

                    step_artifacts = node_output.get("artifacts", [])
                    if step_artifacts:
                        for artifact in step_artifacts:
                            await emit_mission_event(mission_id, "artifact_created", {
                                "artifact_id": artifact.get("id", str(uuid.uuid4())),
                                "name": artifact.get("name", "Output"),
                                "type": artifact.get("type", "document"),
                            })

                elif node_name == "checkpoint":
                    # HITL checkpoint reached
                    checkpoint = node_output.get("checkpoint_pending") or node_output.get("pending_checkpoint")
                    if checkpoint:
                        await emit_checkpoint_reached(
                            mission_id,
                            checkpoint_id=checkpoint.get("id", f"cp_{current_step}"),
                            checkpoint_name=checkpoint.get("title") or checkpoint.get("name", "Checkpoint"),
                            checkpoint_type=checkpoint.get("type", "approval"),
                            requires_approval=checkpoint.get("requires_approval", True),
                            description=checkpoint.get("description"),
                        )

                        # Update mission status to paused
                        supabase.table("missions").update({
                            "status": "paused",
                            "current_checkpoint_id": checkpoint.get("id"),
                            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                        }).eq("id", mission_id).execute()

                elif node_name == "synthesize":
                    # Final synthesis
                    final_output = node_output.get("final_output")
                    output_validation = node_output.get("output_validation", {})
                    await emit_mission_event(mission_id, "synthesis_complete", {
                        "mission_id": mission_id,
                        "has_output": final_output is not None,
                    })

                elif node_name == "confidence_gate":
                    # Confidence gate check (NEW)
                    confidence = node_output.get("confidence", 0.0)
                    await emit_mission_event(mission_id, "confidence_check", {
                        "mission_id": mission_id,
                        "confidence": confidence,
                        "passed": confidence >= node_output.get("threshold", 0.7),
                    })

                elif node_name == "verify_citations":
                    # Citation verification (NEW)
                    citations = node_output.get("verified_citations", [])
                    await emit_mission_event(mission_id, "citations_verified", {
                        "mission_id": mission_id,
                        "citation_count": len(citations),
                        "verified": node_output.get("all_verified", False),
                    })

                elif node_name == "quality_gate":
                    # Quality gate check (NEW)
                    quality_score = node_output.get("quality_score", 0.0)
                    await emit_mission_event(mission_id, "quality_check", {
                        "mission_id": mission_id,
                        "quality_score": quality_score,
                        "passed": quality_score >= node_output.get("threshold", 0.8),
                    })

                elif node_name == "reflection_gate":
                    # Reflection/iteration gate (NEW)
                    iteration = node_output.get("iteration", 0)
                    should_continue = node_output.get("should_continue", False)
                    await emit_mission_event(mission_id, "reflection_complete", {
                        "mission_id": mission_id,
                        "iteration": iteration,
                        "continuing": should_continue,
                    })

                # Track costs
                if "current_cost" in node_output:
                    total_cost = node_output.get("current_cost", 0.0)

                # Check for terminal states
                if status == "completed":
                    break
                elif status == "failed":
                    raise Exception(node_output.get("error", "Mission failed"))

        # Mission completed successfully
        # Note: progress/total_cost/total_tokens don't exist as columns - store in metadata
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        supabase.table("missions").update({
            "status": "completed",
            "metadata": {
                "progress": 100,
                "total_cost": total_cost,
                "total_tokens": total_tokens,
            },
            "completed_at": now,
            "updated_at": now,
        }).eq("id", mission_id).execute()

        await emit_mission_completed(
            mission_id,
            mission_id=mission_id,
            outputs=final_output or {"result": "Mission completed successfully"},
            summary=f"Completed mission using LangGraph master_graph",
        )

    except Exception as e:
        logger.error("mission_execution_error", error=str(e), mission_id=mission_id)

        # Mark as failed
        # Note: 'error' column doesn't exist - store in metadata JSONB
        supabase = get_supabase_client()
        supabase.table("missions").update({
            "status": "failed",
            "metadata": {"error": str(e), "error_code": type(e).__name__},
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }).eq("id", mission_id).execute()

        await emit_mission_failed(
            mission_id,
            mission_id=mission_id,
            error=str(e),
        )


@router.get("/missions/{mission_id}/stream")
async def stream_mission_events(
    mission_id: str,
    req: Request,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Stream real-time mission events via SSE.

    Events emitted:
    - mission_started: Mission begins
    - task_started: A task begins
    - task_progress: Task progress update
    - task_completed: Task finishes
    - reasoning: Agent reasoning/thinking
    - delegation: Agent delegates to another
    - checkpoint_reached: HITL checkpoint requires attention
    - artifact_created: Output artifact created
    - source_found: Source/reference found
    - quality_score: Quality assessment
    - budget_warning: Budget threshold warning
    - mission_completed: Mission successful
    - mission_failed: Mission failed
    - mission_paused: Mission waiting for HITL
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # --- RESILIENCE: Check circuit breaker ---
        if AUTONOMOUS_CIRCUIT_BREAKER.is_open:
            logger.warning("circuit_breaker_open", endpoint="stream_mission", correlation_id=correlation_id)
            raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please retry shortly.")

        # --- SECURITY: Sanitize inputs ---
        sanitized_mission_id = InputSanitizer.sanitize_uuid(mission_id)
        if not sanitized_mission_id:
            raise HTTPException(status_code=400, detail="Invalid mission ID format")

        # --- SECURITY: Rate limiting for streaming ---
        rate_limit_id = x_tenant_id or "anonymous"
        check_rate_limit_or_raise(rate_limit_id, endpoint="stream_mission_events")

        supabase = get_supabase_client()

        # Verify mission exists
        result = supabase.table("missions").select("*").eq("id", sanitized_mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        mission = result.data

        # --- SECURITY: Verify tenant access (tenant isolation) ---
        if x_tenant_id:
            TenantIsolation.validate_tenant_access(
                resource_tenant_id=mission.get("tenant_id"),
                request_tenant_id=x_tenant_id,
                resource_name="mission"
            )

        async def event_generator():
            queue = get_or_create_queue(mission_id)

            try:
                # Send initial status
                yield format_sse_event("mission_status", {
                    "mission_id": mission_id,
                    "status": mission.get("status"),
                    "progress": mission.get("progress", 0),
                })

                # Signal that stream is connected and ready to receive events
                # This flushes any buffered events emitted before we connected
                flushed = signal_stream_ready(mission_id)
                if flushed > 0:
                    logger.info("flushed_buffered_events", mission_id=mission_id, count=flushed)

                # Stream events from queue
                while True:
                    try:
                        # Check for client disconnect
                        if await req.is_disconnected():
                            break

                        # Wait for next event with timeout
                        try:
                            event = await asyncio.wait_for(queue.get(), timeout=30.0)
                            yield format_sse_event(event["event"], event["data"])
                        except asyncio.TimeoutError:
                            # Send heartbeat
                            yield f": heartbeat\n\n"

                        # Check if mission is terminal
                        status_check = supabase.table("missions").select("status").eq("id", mission_id).single().execute()
                        if status_check.data and status_check.data.get("status") in ["completed", "failed", "cancelled"]:
                            break

                    except Exception as e:
                        logger.error("stream_event_error", error=str(e))
                        yield format_sse_event("error", {"error": str(e)})
                        break

            finally:
                # Clean up both queue and stream sync state
                await cleanup_queue(mission_id)
                cleanup_stream_sync(mission_id)

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("stream_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/missions/{mission_id}", response_model=MissionResponse)
async def get_mission(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Get current status of a mission."""
    try:
        supabase = get_supabase_client()

        result = supabase.table("missions").select("*, mission_templates(name)").eq("id", mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        mission = result.data

        if x_tenant_id and mission.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Get error from metadata (not a top-level column)
        metadata = mission.get("metadata") or {}
        error = metadata.get("error") if isinstance(metadata, dict) else None

        return MissionResponse(
            id=mission.get("id"),
            template_id=mission.get("template_id"),
            template_name=mission.get("mission_templates", {}).get("name") if mission.get("mission_templates") else None,
            goal=mission.get("goal"),
            status=mission.get("status"),
            # Read from metadata (these columns don't exist in DB)
            progress=metadata.get("progress", 0) if isinstance(metadata, dict) else 0,
            current_task=metadata.get("current_task") if isinstance(metadata, dict) else None,
            checkpoints_pending=metadata.get("checkpoints_pending", 0) if isinstance(metadata, dict) else 0,
            total_cost=metadata.get("total_cost", 0.0) if isinstance(metadata, dict) else 0.0,
            total_tokens=metadata.get("total_tokens", 0) if isinstance(metadata, dict) else 0,
            created_at=mission.get("created_at"),
            updated_at=mission.get("updated_at"),
            completed_at=mission.get("completed_at"),
            error=error,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/missions")
async def list_missions(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """List user's missions."""
    try:
        supabase = get_supabase_client()

        query = supabase.table("missions").select("*, mission_templates(name)")

        if x_tenant_id:
            query = query.eq("tenant_id", x_tenant_id)
        if x_user_id:
            query = query.eq("user_id", x_user_id)
        if status:
            query = query.eq("status", status)

        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

        result = query.execute()

        missions = []
        for row in result.data or []:
            # Get progress from metadata (column doesn't exist in DB)
            metadata = row.get("metadata") or {}
            progress = metadata.get("progress", 0) if isinstance(metadata, dict) else 0
            missions.append({
                "id": row.get("id"),
                "template_id": row.get("template_id"),
                "template_name": row.get("mission_templates", {}).get("name") if row.get("mission_templates") else None,
                "goal": row.get("goal"),
                "status": row.get("status"),
                "progress": progress,
                "created_at": row.get("created_at"),
            })

        return {
            "missions": missions,
            "total": len(missions),
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        logger.error("list_missions_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HITL Checkpoint Routes
# ============================================================================

@router.post("/missions/{mission_id}/checkpoints/{checkpoint_id}/resolve")
async def resolve_checkpoint(
    mission_id: str,
    checkpoint_id: str,
    request: CheckpointResolveRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Resolve a HITL checkpoint.

    Actions:
    - approve: Continue mission execution
    - reject: Stop mission
    - modify: Continue with modifications
    - skip: Skip this checkpoint
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # --- SECURITY: Validate tenant ---
        sanitized_tenant_id = validate_and_sanitize_tenant(x_tenant_id)

        # --- SECURITY: Rate limiting ---
        check_rate_limit_or_raise(sanitized_tenant_id, endpoint="resolve_checkpoint")

        # --- SECURITY: Sanitize inputs ---
        sanitized_mission_id = InputSanitizer.sanitize_uuid(mission_id)
        sanitized_checkpoint_id = InputSanitizer.sanitize_uuid(checkpoint_id)
        sanitized_action = InputSanitizer.sanitize_text(request.action, max_length=20)
        sanitized_feedback = InputSanitizer.sanitize_text(request.feedback, max_length=5000) if request.feedback else None
        sanitized_modifications = InputSanitizer.sanitize_json(request.modifications) if request.modifications else {}

        if not sanitized_mission_id or not sanitized_checkpoint_id:
            raise HTTPException(status_code=400, detail="Invalid ID format")

        supabase = get_supabase_client()

        # Verify mission exists and is paused
        result = supabase.table("missions").select("*").eq("id", sanitized_mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        mission = result.data

        if mission.get("status") != "paused":
            raise HTTPException(status_code=400, detail="Mission is not paused at a checkpoint")

        if x_tenant_id and mission.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Process action
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        if request.action == "reject":
            # Cancel the mission
            supabase.table("missions").update({
                "status": "cancelled",
                "updated_at": now,
            }).eq("id", mission_id).execute()

            await emit_mission_event(mission_id, "mission_cancelled", {
                "mission_id": mission_id,
                "reason": request.feedback or "User rejected checkpoint",
            })

            return {"status": "cancelled", "message": "Mission cancelled by user"}

        elif request.action in ["approve", "modify", "skip"]:
            # Continue the mission
            supabase.table("missions").update({
                "status": "running",
                "current_checkpoint_id": None,
                "updated_at": now,
            }).eq("id", mission_id).execute()

            await emit_mission_event(mission_id, "checkpoint_resolved", {
                "checkpoint_id": checkpoint_id,
                "action": request.action,
                "feedback": request.feedback,
                "modifications": request.modifications if request.action == "modify" else None,
            })

            return {"status": "resumed", "message": f"Checkpoint {request.action}d, mission continuing"}

        else:
            raise HTTPException(status_code=400, detail=f"Unknown action: {request.action}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("resolve_checkpoint_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Mission Control Routes
# ============================================================================

@router.post("/missions/{mission_id}/pause")
async def pause_mission(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Pause a running mission."""
    try:
        supabase = get_supabase_client()

        result = supabase.table("missions").select("*").eq("id", mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        if result.data.get("status") != "running":
            raise HTTPException(status_code=400, detail="Mission is not running")

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        supabase.table("missions").update({
            "status": "paused",
            "updated_at": now,
        }).eq("id", mission_id).execute()

        from api.sse import emit_mission_paused
        await emit_mission_paused(
            mission_id,
            mission_id=mission_id,
            reason="User requested pause",
        )

        return {"status": "paused", "message": "Mission paused"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("pause_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/missions/{mission_id}/resume")
async def resume_mission(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Resume a paused mission."""
    try:
        supabase = get_supabase_client()

        result = supabase.table("missions").select("*").eq("id", mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        if result.data.get("status") != "paused":
            raise HTTPException(status_code=400, detail="Mission is not paused")

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        supabase.table("missions").update({
            "status": "running",
            "updated_at": now,
        }).eq("id", mission_id).execute()

        await emit_mission_event(mission_id, "mission_resumed", {
            "mission_id": mission_id,
        })

        return {"status": "running", "message": "Mission resumed"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("resume_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/missions/{mission_id}/cancel")
async def cancel_mission(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Cancel a mission."""
    try:
        supabase = get_supabase_client()

        result = supabase.table("missions").select("*").eq("id", mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        if result.data.get("status") in ["completed", "failed", "cancelled"]:
            raise HTTPException(status_code=400, detail="Mission is already terminal")

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        supabase.table("missions").update({
            "status": "cancelled",
            "updated_at": now,
        }).eq("id", mission_id).execute()

        await emit_mission_event(mission_id, "mission_cancelled", {
            "mission_id": mission_id,
            "reason": "User cancelled",
        })

        return {"status": "cancelled", "message": "Mission cancelled"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("cancel_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Artifact Routes
# ============================================================================

@router.get("/missions/{mission_id}/artifacts", response_model=List[ArtifactResponse])
async def list_mission_artifacts(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """List artifacts produced by a mission."""
    try:
        supabase = get_supabase_client()

        # Verify mission access
        mission_result = supabase.table("missions").select("id, tenant_id").eq("id", mission_id).single().execute()

        if not mission_result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        if x_tenant_id and mission_result.data.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        result = supabase.table("mission_artifacts").select("*").eq("mission_id", mission_id).order("created_at").execute()

        artifacts = []
        for row in result.data or []:
            artifacts.append(ArtifactResponse(
                id=row.get("id"),
                mission_id=row.get("mission_id"),
                type=row.get("type"),
                title=row.get("title"),
                description=row.get("description"),
                url=row.get("url"),
                size_bytes=row.get("size_bytes"),
                created_at=row.get("created_at"),
            ))

        return artifacts

    except HTTPException:
        raise
    except Exception as e:
        logger.error("list_artifacts_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/missions/{mission_id}/artifacts/{artifact_id}/download")
async def download_artifact(
    mission_id: str,
    artifact_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Download a mission artifact."""
    try:
        supabase = get_supabase_client()

        result = supabase.table("mission_artifacts").select("*").eq("id", artifact_id).eq("mission_id", mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Artifact not found")

        artifact = result.data

        # Return redirect to storage URL or content
        if artifact.get("url"):
            from fastapi.responses import RedirectResponse
            return RedirectResponse(url=artifact.get("url"))
        elif artifact.get("content"):
            from fastapi.responses import Response
            return Response(
                content=artifact.get("content"),
                media_type=artifact.get("mime_type", "application/octet-stream"),
                headers={
                    "Content-Disposition": f'attachment; filename="{artifact.get("title", "artifact")}"'
                }
            )
        else:
            raise HTTPException(status_code=404, detail="Artifact content not available")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("download_artifact_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Alias Routes for Clarity and Consistency
# ============================================================================

@router.post("/autonomous", response_model=MissionResponse)
async def autonomous_mission(
    request: CreateMissionRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Alias for /missions - Creates autonomous mission (Mode 3/4).

    Named /autonomous for clarity alongside /interactive (Mode 1/2).
    - Mode 3: agent_id provided (manual selection)
    - Mode 4: agent_id omitted (Fusion auto-selection)
    """
    return await create_mission(request, x_tenant_id, x_user_id)
