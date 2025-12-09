"""
Unified Missions API for Ask Expert Modes 3/4 (autonomous).

Endpoints:
- POST /api/missions/stream -> start mission and stream SSE (detailed contract)
- POST /api/missions/checkpoint -> respond to HITL checkpoints (stub for now)
"""

import json
from typing import Any, AsyncGenerator, Dict, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator

from modules.expert.registry.mission_registry import MissionRegistry
from modules.expert.safety.preflight_service import PreFlightService
from modules.expert.safety.circuit_breaker import CircuitBreaker
from modules.expert.workflows.mission_workflow import MissionWorkflowBuilder
from modules.expert.schemas.mission_state import DEFAULT_MISSION_STATE, MissionState


router = APIRouter(prefix="/api/missions", tags=["missions"])


# --------------------------------------------------------------------------- Models


class MissionStreamRequest(BaseModel):
    mission_id: Optional[str] = Field(default=None, description="Client-provided mission identifier")
    mode: int = Field(..., description="3 or 4")
    goal: str
    template_id: Optional[str]
    expert_id: Optional[str] = None  # required for mode 3
    user_context: Dict[str, Any] = Field(default_factory=dict)

    @validator("mode")
    def validate_mode(cls, v):
        if v not in (3, 4):
            raise ValueError("mode must be 3 or 4")
        return v

    @validator("expert_id")
    def validate_expert_for_mode(cls, v, values):
        if values.get("mode") == 3 and not v:
            raise ValueError("expert_id required for mode 3")
        return v


class CheckpointResponseRequest(BaseModel):
    mission_id: str
    checkpoint_id: str
    action: str
    option: Optional[str] = None
    reason: Optional[str] = None
    modifications: Optional[Dict[str, Any]] = None


# --------------------------------------------------------------------------- Dependencies / helpers


async def get_tenant_id(x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id")) -> Optional[str]:
    return x_tenant_id


def _sse_event(event: str, data: Dict[str, Any]) -> bytes:
    """
    Format a single SSE event.

    The previous implementation only emitted a `data:` line containing both the
    event name and payload. The frontend SSE parser expects a standard
    `event:` header followed by the JSON payload, so we emit both to ensure the
    event type is available for routing on the client.
    """
    return f"event: {event}\ndata: {json.dumps(data)}\n\n".encode("utf-8")


# --------------------------------------------------------------------------- Route


@router.post("/stream")
async def mission_stream(
    payload: MissionStreamRequest,
    tenant_id: Optional[str] = Depends(get_tenant_id),
) -> StreamingResponse:
    """
    Unified streaming endpoint for Modes 3/4.
    SSE contract (detailed): thinking | plan | ui_updates | step_progress | tool | sources | token | hitl_request | done | error
    """

    mission_id = payload.mission_id or str(uuid4())
    registry = MissionRegistry()
    preflight = PreFlightService(registry)
    breaker = CircuitBreaker()
    workflow = MissionWorkflowBuilder(registry, safety_service=preflight, circuit_breaker=breaker)

    initial_state: MissionState = {
        **DEFAULT_MISSION_STATE,
        "mission_id": mission_id,
        "mode": payload.mode,
        "goal": payload.goal,
        "template_id": payload.template_id,
        "user_context": payload.user_context,
        "tenant_id": tenant_id,
        "selected_agent": payload.expert_id,
    }

    async def event_generator() -> AsyncGenerator[bytes, None]:
        state: MissionState = initial_state

        try:
            # Router
            yield _sse_event("thinking", {"step": "init", "status": "running", "content": "Initializing mission"})
            state = await workflow._route_entry(state)

            # Mode 4: L1 selection
            if state.get("mode") == 4:
                yield _sse_event("thinking", {"step": "fusion_select", "status": "running", "content": "Selecting team"})
                select_res = await workflow._l1_selection(state)
                state.update(select_res)
                if select_res.get("ui_updates"):
                    yield _sse_event("ui_updates", {"items": select_res["ui_updates"]})

            # Preflight (universal)
            yield _sse_event("thinking", {"step": "preflight", "status": "running", "content": "Running safety checks"})
            pf_res = await workflow._preflight_check(state)
            state.update(pf_res)
            if pf_res.get("ui_updates"):
                yield _sse_event("ui_updates", {"items": pf_res["ui_updates"]})
            pf = pf_res.get("preflight", {})
            if isinstance(pf, dict) and pf.get("passed") is False:
                yield _sse_event("error", {"message": "Preflight failed", "details": pf})
                return

            # Plan
            yield _sse_event("thinking", {"step": "plan", "status": "running", "content": "Creating mission plan"})
            plan_res = await workflow._plan_node(state)
            state.update(plan_res)
            plan = plan_res.get("plan", [])
            if plan:
                yield _sse_event("plan", {"plan": plan, "plan_confidence": None})
                yield _sse_event(
                    "step_progress",
                    {
                        "step": "planning",
                        "step_number": 0,
                        "total_steps": len(plan),
                        "percentage": 0,
                    },
                )

            # Execute steps
            for idx, step in enumerate(state.get("plan", [])):
                yield _sse_event(
                    "thinking",
                    {"step": step.get("id") or f"step_{idx+1}", "status": "running", "content": step.get("description", "")},
                )
                # Tool hint
                tools = step.get("tools") or []
                for tool_id in tools:
                    yield _sse_event("tool", {"tool_id": tool_id, "status": "starting"})

                exec_res = await workflow._execute_node({**state, "current_step": idx})
                state.update(exec_res)

                # Emit artifact/sources
                artifact = (exec_res.get("artifacts") or [])[-1] if exec_res.get("artifacts") else None
                if artifact:
                    citations = artifact.get("citations") or []
                    if citations:
                        yield _sse_event("sources", {"count": len(citations), "items": citations})
                    yield _sse_event("ui_updates", {"items": [{"type": "artifact", "payload": artifact}]})

                yield _sse_event(
                    "step_progress",
                    {
                        "step": step.get("id") or f"step_{idx+1}",
                        "step_number": idx + 1,
                        "total_steps": state.get("total_steps", len(plan)),
                        "percentage": int(((idx + 1) / max(1, len(plan))) * 100),
                    },
                )

            # Synthesize
            yield _sse_event("thinking", {"step": "synthesize", "status": "running", "content": "Synthesizing outputs"})
            synth_res = await workflow._synthesize_node(state)
            state.update(synth_res)
            final = synth_res.get("final_output") or {}
            if final.get("citations"):
                yield _sse_event("sources", {"count": len(final["citations"]), "items": final["citations"]})
            yield _sse_event("token", {"content": final.get("content", "")})
            yield _sse_event("done", {"final": final, "artifacts": state.get("artifacts", [])})

        except Exception as exc:  # pragma: no cover - defensive
            yield _sse_event("error", {"message": str(exc)})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/checkpoint")
async def respond_checkpoint(payload: CheckpointResponseRequest):
    # Stub: integrate with mission store/checkpointer
    return {"mission_id": payload.mission_id, "checkpoint_id": payload.checkpoint_id, "ack": True, "action": payload.action}
