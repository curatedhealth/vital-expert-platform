# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# PURPOSE: Panel Autonomous API Routes - Mode 4 for Ask Panel
"""
Panel Autonomous API Routes - Mode 4 (Autonomous Panel Missions)

This module provides the autonomous panel mission endpoints:
- POST /ask-panel/autonomous                    -> Create autonomous panel mission
- POST /ask-panel/missions                      -> Create mission (alias)
- GET  /ask-panel/missions/{id}/stream          -> Stream mission events
- GET  /ask-panel/missions/{id}                 -> Get mission status
- POST /ask-panel/missions/{id}/checkpoints/{cpId}/resolve -> Resolve HITL
- POST /ask-panel/missions/{id}/pause           -> Pause mission
- POST /ask-panel/missions/{id}/resume          -> Resume mission
- POST /ask-panel/missions/{id}/cancel          -> Cancel mission
- GET  /ask-panel/missions                      -> List user's panel missions

Panel types supported:
- structured: Formal structured analysis
- open: Free-form discussion
- socratic: Question-based exploration
- adversarial: Devil's advocate approach
- delphi: Anonymous expert consensus
- hybrid: Combined approach with HITL

These routes integrate with the Panel Autonomous LangGraph workflow and emit
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
from pydantic import BaseModel, Field, validator

# Security imports for production hardening
from core.security import InputSanitizer, ErrorSanitizer, TenantIsolation, check_rate_limit_or_raise
from core.resilience import CircuitBreaker, CircuitBreakerConfig

from api.sse import (
    format_sse_event,
    mission_queues,
    emit_mission_event,
    emit_checkpoint_reached,
    emit_mission_completed,
    emit_mission_failed,
    get_or_create_queue,
    cleanup_queue,
    create_stream_ready_event,
    signal_stream_ready,
    cleanup_stream_sync,
)
from core.resilience import create_safe_task
from core.config import get_settings

logger = structlog.get_logger()

router = APIRouter(prefix="/ask-panel", tags=["ask-panel-autonomous"])


# ============================================================================
# Security Configuration
# ============================================================================

PANEL_CIRCUIT_BREAKER = CircuitBreaker(
    "ask_panel_autonomous_llm",
    CircuitBreakerConfig(
        failure_threshold=5,
        recovery_timeout=30.0,
        half_open_max_calls=3,
        success_threshold=2,
    )
)

_supabase_client = None


def validate_and_sanitize_tenant(x_tenant_id: Optional[str]) -> str:
    """Validate and sanitize tenant ID."""
    if not x_tenant_id:
        raise HTTPException(status_code=403, detail="Tenant ID required for panel missions")
    try:
        return TenantIsolation.validate_tenant_id(x_tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


# ============================================================================
# Request/Response Models
# ============================================================================

VALID_PANEL_TYPES = ["structured", "open", "socratic", "adversarial", "delphi", "hybrid"]


class ExpertInfo(BaseModel):
    """Expert selection info."""
    id: str
    name: Optional[str] = None
    model: Optional[str] = None
    system_prompt: Optional[str] = None


class PanelMissionOptions(BaseModel):
    """Nested options for panel mission (matches frontend schema)."""
    max_rounds: Optional[int] = Field(None, ge=1, le=5, description="Maximum discussion rounds")
    consensus_threshold: Optional[float] = Field(None, ge=0.0, le=1.0, description="Consensus threshold")
    budget_limit: Optional[float] = Field(None, description="Maximum cost in dollars")
    auto_approve_checkpoints: Optional[bool] = Field(None, description="Auto-approve HITL checkpoints")


class CreatePanelMissionRequest(BaseModel):
    """Request to create and start a panel mission."""
    goal: str = Field(..., min_length=1, max_length=5000, description="Question/goal for the panel")
    panel_type: str = Field("structured", description="Panel type: structured, open, socratic, adversarial, delphi, hybrid")
    context: Optional[str] = Field(None, max_length=10000, description="Additional context")
    experts: Optional[List[ExpertInfo]] = Field(None, description="Pre-selected experts (optional)")
    # Support both flat fields (backward compat) and nested options (frontend sends this)
    max_rounds: Optional[int] = Field(None, ge=1, le=5, description="Maximum discussion rounds")
    consensus_threshold: Optional[float] = Field(None, ge=0.0, le=1.0, description="Consensus threshold")
    budget_limit: Optional[float] = Field(None, description="Maximum cost in dollars")
    auto_approve_checkpoints: Optional[bool] = Field(None, description="Auto-approve HITL checkpoints")
    options: Optional[PanelMissionOptions] = Field(None, description="Nested options (frontend format)")

    @validator("panel_type")
    def validate_panel_type(cls, v):
        if v not in VALID_PANEL_TYPES:
            raise ValueError(f"Invalid panel_type. Must be one of: {VALID_PANEL_TYPES}")
        return v

    def get_max_rounds(self) -> int:
        """Get max_rounds from either flat field or nested options."""
        if self.max_rounds is not None:
            return self.max_rounds
        if self.options and self.options.max_rounds is not None:
            return self.options.max_rounds
        return 3  # default

    def get_consensus_threshold(self) -> float:
        """Get consensus_threshold from either flat field or nested options."""
        if self.consensus_threshold is not None:
            return self.consensus_threshold
        if self.options and self.options.consensus_threshold is not None:
            return self.options.consensus_threshold
        return 0.7  # default

    def get_budget_limit(self) -> Optional[float]:
        """Get budget_limit from either flat field or nested options."""
        if self.budget_limit is not None:
            return self.budget_limit
        if self.options and self.options.budget_limit is not None:
            return self.options.budget_limit
        return None

    def get_auto_approve_checkpoints(self) -> bool:
        """Get auto_approve_checkpoints from either flat field or nested options."""
        if self.auto_approve_checkpoints is not None:
            return self.auto_approve_checkpoints
        if self.options and self.options.auto_approve_checkpoints is not None:
            return self.options.auto_approve_checkpoints
        return False  # default


class PanelMissionResponse(BaseModel):
    """Panel mission status response."""
    id: str
    goal: str
    panel_type: str
    status: str  # pending, planning, selecting, executing, consensus, checkpoint, synthesizing, completed, failed
    progress: int = 0  # 0-100
    current_round: int = 0
    max_rounds: int = 3
    expert_count: int = 0
    consensus_score: Optional[float] = None
    total_cost: float = 0.0
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None
    error: Optional[str] = None


class CheckpointResolveRequest(BaseModel):
    """Request to resolve a HITL checkpoint."""
    action: str = Field(..., description="Action to take: approve, reject, modify")
    feedback: Optional[str] = Field(None, description="User feedback or instructions")
    modifications: Dict[str, Any] = Field(default_factory=dict, description="Modifications for 'modify' action")


# ============================================================================
# Helper Functions
# ============================================================================

def get_supabase_client():
    """Get Supabase client with connection pooling."""
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
# Panel Mission CRUD Routes
# ============================================================================

@router.post("/missions", response_model=PanelMissionResponse)
async def create_panel_mission(
    request: CreatePanelMissionRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Create and start a new panel mission.

    The panel will begin autonomous execution with multi-expert discussion.
    Use the stream endpoint to receive real-time updates.
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # Check circuit breaker
        if PANEL_CIRCUIT_BREAKER.is_open:
            logger.warning("circuit_breaker_open", endpoint="create_panel_mission", correlation_id=correlation_id)
            raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please retry shortly.")

        # Resolve tenant_id
        effective_tenant_id = x_tenant_id or get_settings().default_tenant_id
        sanitized_tenant_id = validate_and_sanitize_tenant(effective_tenant_id)

        # Rate limiting
        rate_limit_id = sanitized_tenant_id or x_user_id or "anonymous"
        check_rate_limit_or_raise(rate_limit_id, endpoint="create_panel_mission")

        # Sanitize inputs
        sanitized_goal = InputSanitizer.sanitize_text(request.goal, max_length=5000)
        sanitized_context = InputSanitizer.sanitize_text(request.context, max_length=10000) if request.context else None

        supabase = get_supabase_client()

        mission_id = str(uuid.uuid4())
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Build experts list if provided
        experts_data = []
        if request.experts:
            for expert in request.experts:
                experts_data.append({
                    "id": expert.id,
                    "name": expert.name,
                    "model": expert.model,
                    "system_prompt": expert.system_prompt,
                })

        # Create mission record
        mission_data = {
            "id": mission_id,
            "tenant_id": sanitized_tenant_id,
            "user_id": x_user_id,
            "title": sanitized_goal[:100] if len(sanitized_goal) <= 100 else sanitized_goal[:97] + "...",
            "objective": f"Panel discussion: {sanitized_goal[:200]}",
            "goal": sanitized_goal,
            "status": "pending",
            "mode": 4,  # Panel autonomous mode
            "budget_limit": request.get_budget_limit() or 10.0,
            "metadata": {
                "type": "panel_autonomous",
                "panel_type": request.panel_type,
                "context": sanitized_context,
                "experts": experts_data,
                "max_rounds": request.get_max_rounds(),
                "consensus_threshold": request.get_consensus_threshold(),
                "auto_approve_checkpoints": request.get_auto_approve_checkpoints(),
                "current_round": 0,
                "expert_count": len(experts_data),
            },
        }

        result = supabase.table("missions").insert(mission_data).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create panel mission")

        # Set up stream synchronization
        create_stream_ready_event(mission_id)

        # Define error handler
        async def on_mission_error(e: Exception) -> None:
            try:
                await emit_mission_failed(
                    mission_id,
                    mission_id,
                    error=str(e),
                    error_code=type(e).__name__,
                    recoverable=False,
                    suggestion="Please try again or contact support",
                )
                supabase.table("missions").update({
                    "status": "failed",
                    "metadata": {"error": str(e), "error_code": type(e).__name__},
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }).eq("id", mission_id).execute()
            except Exception as update_error:
                logger.error("failed_to_update_mission_status", error=str(update_error))

        # Start mission execution
        create_safe_task(
            _execute_panel_mission_async(mission_id, request, sanitized_tenant_id),
            task_name=f"panel_mission_{mission_id[:8]}",
            on_error=on_mission_error,
        )

        return PanelMissionResponse(
            id=mission_id,
            goal=sanitized_goal,
            panel_type=request.panel_type,
            status="pending",
            progress=0,
            current_round=0,
            max_rounds=request.get_max_rounds(),
            expert_count=len(experts_data),
            created_at=now,
            updated_at=now,
        )

    except HTTPException:
        raise
    except Exception as e:
        asyncio.create_task(PANEL_CIRCUIT_BREAKER._record_failure())
        sanitized_error, ref_id = ErrorSanitizer.sanitize_error(e, 'internal')
        logger.error(
            "create_panel_mission_error",
            error=str(e),
            correlation_id=correlation_id,
            reference_id=ref_id,
        )
        raise HTTPException(status_code=500, detail=sanitized_error)


async def _execute_panel_mission_async(
    mission_id: str,
    request: CreatePanelMissionRequest,
    tenant_id: Optional[str],
):
    """Execute panel mission using LangGraph Panel Autonomous workflow."""
    try:
        supabase = get_supabase_client()

        # Update status to running
        supabase.table("missions").update({
            "status": "running",
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }).eq("id", mission_id).execute()

        # Emit mission started
        await emit_mission_event(mission_id, "panel_started", {
            "mission_id": mission_id,
            "panel_type": request.panel_type,
            "goal": request.goal[:200],
            "max_rounds": request.get_max_rounds(),
        })

        # Import LangGraph workflow
        from langgraph_workflows.panel_autonomous import (
            build_panel_autonomous_graph,
            stream_panel_mission_events,
            PanelMissionState,
        )

        # Build experts data
        experts_data = []
        if request.experts:
            for expert in request.experts:
                experts_data.append({
                    "id": expert.id,
                    "name": expert.name,
                    "model": expert.model or "gpt-4-turbo",
                    "system_prompt": expert.system_prompt or "You are a helpful expert.",
                })

        # Build initial state
        initial_state: PanelMissionState = {
            "mission_id": mission_id,
            "panel_type": request.panel_type,
            "goal": request.goal,
            "context": request.context or "",
            "tenant_id": tenant_id,
            "user_id": None,
            "selected_experts": experts_data,
            "expert_count": len(experts_data),
            "selection_method": "manual" if experts_data else "fusion",
            "max_rounds": request.get_max_rounds(),
            "consensus_threshold": request.get_consensus_threshold(),
            "budget_limit": request.get_budget_limit(),
        }

        compiled_graph = build_panel_autonomous_graph()
        config = {"configurable": {"thread_id": mission_id}}

        total_cost = 0.0
        final_output = None

        async for event in stream_panel_mission_events(compiled_graph, initial_state, config):
            event_type = event.get("type")
            await emit_mission_event(mission_id, event_type, event)

            if event_type == "experts_selected":
                supabase.table("missions").update({
                    "metadata": {
                        "expert_count": event.get("expert_count", 0),
                        "experts": event.get("experts", []),
                        "selection_method": event.get("selection_method"),
                    },
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }).eq("id", mission_id).execute()

            elif event_type == "round_complete":
                current_round = event.get("round", 0)
                max_rounds = request.get_max_rounds()
                progress = int((current_round / max_rounds) * 70)
                supabase.table("missions").update({
                    "metadata": {
                        "current_round": current_round,
                        "progress": progress,
                    },
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }).eq("id", mission_id).execute()

            elif event_type == "consensus_update":
                supabase.table("missions").update({
                    "metadata": {
                        "consensus_score": event.get("consensus_score"),
                        "consensus_level": event.get("consensus_level"),
                    },
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }).eq("id", mission_id).execute()

            elif event_type == "checkpoint_reached":
                checkpoint = event.get("checkpoint", {})
                await emit_checkpoint_reached(
                    mission_id,
                    checkpoint_id=checkpoint.get("id", f"cp_{mission_id[:8]}"),
                    checkpoint_name=checkpoint.get("title", "Panel Review"),
                    checkpoint_type=checkpoint.get("type", "approval"),
                    requires_approval=True,
                    description=checkpoint.get("description"),
                )

                supabase.table("missions").update({
                    "status": "paused",
                    "metadata": {"progress": 80, "checkpoint_id": checkpoint.get("id")},
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }).eq("id", mission_id).execute()

            elif event_type == "panel_completed":
                final_output = event.get("final_output")
                total_cost = event.get("total_cost", 0.0)

        # Mission completed successfully
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        supabase.table("missions").update({
            "status": "completed",
            "metadata": {
                "progress": 100,
                "total_cost": total_cost,
                "final_output": final_output,
            },
            "completed_at": now,
            "updated_at": now,
        }).eq("id", mission_id).execute()

        await emit_mission_completed(
            mission_id,
            mission_id=mission_id,
            outputs=final_output or {"result": "Panel discussion completed successfully"},
            summary=f"Panel {request.panel_type} discussion completed",
        )

    except Exception as e:
        logger.error("panel_mission_execution_error", error=str(e), mission_id=mission_id)

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
async def stream_panel_mission_events_endpoint(
    mission_id: str,
    req: Request,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Stream real-time panel mission events via SSE.

    Events emitted:
    - panel_started: Panel discussion begins
    - experts_selected: Expert team selected
    - round_started: New discussion round begins
    - expert_response: Individual expert response
    - round_complete: Discussion round complete
    - consensus_update: Consensus analysis update
    - checkpoint_reached: HITL checkpoint requires attention
    - synthesis_complete: Final synthesis done
    - panel_completed: Panel mission successful
    - panel_failed: Panel mission failed
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # Check circuit breaker
        if PANEL_CIRCUIT_BREAKER.is_open:
            logger.warning("circuit_breaker_open", endpoint="stream_panel_mission", correlation_id=correlation_id)
            raise HTTPException(status_code=503, detail="Service temporarily unavailable.")

        # Sanitize inputs
        sanitized_mission_id = InputSanitizer.sanitize_uuid(mission_id)
        if not sanitized_mission_id:
            raise HTTPException(status_code=400, detail="Invalid mission ID format")

        # Rate limiting
        rate_limit_id = x_tenant_id or "anonymous"
        check_rate_limit_or_raise(rate_limit_id, endpoint="stream_panel_mission")

        supabase = get_supabase_client()

        # Verify mission exists
        result = supabase.table("missions").select("*").eq("id", sanitized_mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        mission = result.data

        # Verify tenant access
        if x_tenant_id:
            TenantIsolation.validate_tenant_access(
                resource_tenant_id=mission.get("tenant_id"),
                request_tenant_id=x_tenant_id,
                resource_name="panel_mission"
            )

        async def event_generator():
            queue = get_or_create_queue(mission_id)

            try:
                # Get metadata from mission
                metadata = mission.get("metadata", {})

                # Send initial status
                yield format_sse_event("panel_status", {
                    "mission_id": mission_id,
                    "status": mission.get("status"),
                    "panel_type": metadata.get("panel_type"),
                    "progress": metadata.get("progress", 0),
                    "current_round": metadata.get("current_round", 0),
                    "expert_count": metadata.get("expert_count", 0),
                })

                # Signal stream ready
                flushed = signal_stream_ready(mission_id)
                if flushed > 0:
                    logger.info("flushed_buffered_events", mission_id=mission_id, count=flushed)

                # Stream events
                while True:
                    try:
                        if await req.is_disconnected():
                            break

                        try:
                            event = await asyncio.wait_for(queue.get(), timeout=30.0)
                            yield format_sse_event(event["event"], event["data"])
                        except asyncio.TimeoutError:
                            yield f": heartbeat\n\n"

                        # Check terminal state
                        status_check = supabase.table("missions").select("status").eq("id", mission_id).single().execute()
                        if status_check.data and status_check.data.get("status") in ["completed", "failed", "cancelled"]:
                            break

                    except Exception as e:
                        logger.error("stream_event_error", error=str(e))
                        yield format_sse_event("error", {"error": str(e)})
                        break

            finally:
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
        logger.error("stream_panel_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/missions/{mission_id}", response_model=PanelMissionResponse)
async def get_panel_mission(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Get current status of a panel mission."""
    try:
        supabase = get_supabase_client()

        result = supabase.table("missions").select("*").eq("id", mission_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Mission not found")

        mission = result.data

        if x_tenant_id and mission.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        metadata = mission.get("metadata") or {}
        error = metadata.get("error") if isinstance(metadata, dict) else None

        return PanelMissionResponse(
            id=mission.get("id"),
            goal=mission.get("goal"),
            panel_type=metadata.get("panel_type", "structured"),
            status=mission.get("status"),
            progress=metadata.get("progress", 0),
            current_round=metadata.get("current_round", 0),
            max_rounds=metadata.get("max_rounds", 3),
            expert_count=metadata.get("expert_count", 0),
            consensus_score=metadata.get("consensus_score"),
            total_cost=metadata.get("total_cost", 0.0),
            created_at=mission.get("created_at"),
            updated_at=mission.get("updated_at"),
            completed_at=mission.get("completed_at"),
            error=error,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_panel_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/missions")
async def list_panel_missions(
    status: Optional[str] = Query(None, description="Filter by status"),
    panel_type: Optional[str] = Query(None, description="Filter by panel type"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """List user's panel missions."""
    try:
        supabase = get_supabase_client()

        query = supabase.table("missions").select("*")

        # Filter for panel missions
        query = query.eq("mode", 4)

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
            metadata = row.get("metadata") or {}

            # Filter by panel_type if specified
            if panel_type and metadata.get("panel_type") != panel_type:
                continue

            # Only include panel_autonomous missions
            if metadata.get("type") != "panel_autonomous":
                continue

            missions.append({
                "id": row.get("id"),
                "goal": row.get("goal"),
                "panel_type": metadata.get("panel_type", "structured"),
                "status": row.get("status"),
                "progress": metadata.get("progress", 0),
                "current_round": metadata.get("current_round", 0),
                "expert_count": metadata.get("expert_count", 0),
                "consensus_score": metadata.get("consensus_score"),
                "created_at": row.get("created_at"),
            })

        return {
            "missions": missions,
            "total": len(missions),
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        logger.error("list_panel_missions_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HITL Checkpoint Routes
# ============================================================================

@router.post("/missions/{mission_id}/checkpoints/{checkpoint_id}/resolve")
async def resolve_panel_checkpoint(
    mission_id: str,
    checkpoint_id: str,
    request: CheckpointResolveRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Resolve a HITL checkpoint.

    Actions:
    - approve: Continue panel execution
    - reject: Stop panel
    - modify: Continue with modifications (add another round)
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # Validate tenant
        sanitized_tenant_id = validate_and_sanitize_tenant(x_tenant_id)

        # Rate limiting
        check_rate_limit_or_raise(sanitized_tenant_id, endpoint="resolve_panel_checkpoint")

        # Sanitize inputs
        sanitized_mission_id = InputSanitizer.sanitize_uuid(mission_id)
        sanitized_checkpoint_id = InputSanitizer.sanitize_uuid(checkpoint_id)
        sanitized_action = InputSanitizer.sanitize_text(request.action, max_length=20)
        sanitized_feedback = InputSanitizer.sanitize_text(request.feedback, max_length=5000) if request.feedback else None

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

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        if request.action == "reject":
            supabase.table("missions").update({
                "status": "cancelled",
                "updated_at": now,
            }).eq("id", mission_id).execute()

            await emit_mission_event(mission_id, "panel_cancelled", {
                "mission_id": mission_id,
                "reason": request.feedback or "User rejected panel results",
            })

            return {"status": "cancelled", "message": "Panel cancelled by user"}

        elif request.action in ["approve", "modify"]:
            # Update metadata with human response
            metadata = mission.get("metadata", {})
            metadata["human_response"] = {
                "action": request.action,
                "feedback": sanitized_feedback,
                "modifications": request.modifications if request.action == "modify" else None,
            }
            metadata["checkpoint_resolved"] = True

            supabase.table("missions").update({
                "status": "running",
                "metadata": metadata,
                "updated_at": now,
            }).eq("id", mission_id).execute()

            await emit_mission_event(mission_id, "checkpoint_resolved", {
                "checkpoint_id": checkpoint_id,
                "action": request.action,
                "feedback": sanitized_feedback,
            })

            return {"status": "resumed", "message": f"Checkpoint {request.action}d, panel continuing"}

        else:
            raise HTTPException(status_code=400, detail=f"Unknown action: {request.action}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("resolve_panel_checkpoint_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Mission Control Routes
# ============================================================================

@router.post("/missions/{mission_id}/pause")
async def pause_panel_mission(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Pause a running panel mission."""
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

        await emit_mission_event(mission_id, "panel_paused", {
            "mission_id": mission_id,
            "reason": "User requested pause",
        })

        return {"status": "paused", "message": "Panel mission paused"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("pause_panel_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/missions/{mission_id}/resume")
async def resume_panel_mission(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Resume a paused panel mission."""
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

        await emit_mission_event(mission_id, "panel_resumed", {
            "mission_id": mission_id,
        })

        return {"status": "running", "message": "Panel mission resumed"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("resume_panel_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/missions/{mission_id}/cancel")
async def cancel_panel_mission(
    mission_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Cancel a panel mission."""
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

        await emit_mission_event(mission_id, "panel_cancelled", {
            "mission_id": mission_id,
            "reason": "User cancelled",
        })

        return {"status": "cancelled", "message": "Panel mission cancelled"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("cancel_panel_mission_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Alias Routes
# ============================================================================

@router.post("/autonomous", response_model=PanelMissionResponse)
async def autonomous_panel_mission(
    request: CreatePanelMissionRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Alias for /missions - Creates autonomous panel mission.

    Named /autonomous for clarity alongside /interactive modes.
    """
    return await create_panel_mission(request, x_tenant_id, x_user_id)
