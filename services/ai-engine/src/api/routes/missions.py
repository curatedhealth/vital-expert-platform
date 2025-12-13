# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph_workflows.modes34, services.runner_registry, services.checkpoint_store]
"""
Unified Missions API for Ask Expert Modes 3/4 (autonomous).

Endpoints:
- POST /api/missions/stream -> start mission and stream SSE (detailed contract)
- POST /api/missions/checkpoint -> respond to HITL checkpoints (stub for now)
"""

from typing import Any, AsyncGenerator, Dict, Optional
import asyncio
import os
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator

from langgraph_workflows.modes34.state import MissionState
from langgraph_workflows.modes34.wrappers.l2_wrapper import delegate_to_l2, delegate_to_l2_streaming
from langgraph_workflows.modes34.wrappers.l3_wrapper import delegate_to_l3
from langgraph_workflows.modes34.wrappers.l4_wrapper import delegate_to_l4
from langgraph_workflows.shared.events import (
    sse_event,
    plan_event,
    progress_event,
    thinking_event,
    checkpoint_event,
    sources_event,
    done_event,
    tool_event,
    # New SSE events for frontend contract
    reasoning_event,
    token_event,
    agent_selected_event,
    delegation_event,
    thinking_start_event,
    thinking_end_event,
    hitl_checkpoint_event,
)
from langgraph_workflows.modes34.unified_autonomous_workflow import build_master_graph
from langgraph_workflows.modes34.agent_selector import select_team
from services.runner_registry import runner_registry
from services.checkpoint_store import checkpoint_store
from langgraph.graph import END
import logging

USE_MASTER_GRAPH = os.getenv("USE_MASTER_GRAPH", "true").lower() == "true"
from services.publisher import publisher
from services.mission_repository import mission_repo
from agents.l3_specialists.l3_context_specialist import L3ContextSpecialist
from agents.base_agent import AgentConfig


router = APIRouter(prefix="/api/missions", tags=["missions"])
logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- Models


class MissionStreamRequest(BaseModel):
    mission_id: Optional[str] = Field(default=None, description="Client-provided mission identifier")
    mode: int = Field(..., description="3 or 4")
    goal: str = Field(..., min_length=10, max_length=5000, description="Mission goal (10-5000 chars)")
    title: Optional[str] = Field(default=None, max_length=200, description="Mission title (max 200 chars)")
    template_id: Optional[str] = None  # optional to allow default templates
    expert_id: Optional[str] = None  # required for mode 3
    budget_limit: Optional[float] = Field(default=None, ge=0, le=1000, description="Soft budget cap ($0-$1000)")
    user_context: Dict[str, Any] = Field(default_factory=dict)

    @validator("mode")
    def validate_mode(cls, v):
        if v not in (3, 4):
            raise ValueError("mode must be 3 or 4")
        return v

    @validator("goal")
    def validate_goal_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("goal cannot be empty or whitespace only")
        return v.strip()

    @validator("expert_id")
    def validate_expert_for_mode(cls, v, values):
        # Mode 3 should have an expert_id, but allow fallback
        mode = values.get("mode")
        if mode == 3 and not v:
            # Log warning but allow - backend will use fallback agent
            pass
        return v

    @validator("user_context")
    def validate_user_context_size(cls, v):
        # Limit user_context to prevent abuse (100KB serialized)
        import json
        serialized = json.dumps(v) if v else "{}"
        if len(serialized) > 100000:
            raise ValueError("user_context too large (max 100KB)")
        return v


class CheckpointResponseRequest(BaseModel):
    mission_id: str
    checkpoint_id: str
    action: str
    option: Optional[str] = None
    reason: Optional[str] = None
    modifications: Optional[Dict[str, Any]] = None
    resume: bool = True  # whether to continue after checkpoint


# --------------------------------------------------------------------------- Dependencies / helpers


async def get_tenant_id(x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id")) -> str:
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="x-tenant-id header is required")
    return x_tenant_id


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
    # Tenant is required (validated in dependency)
    tenant_fallback = tenant_id
    initial_state: MissionState = {
        "mission_id": mission_id,
        "mode": payload.mode,
        "goal": payload.goal,
        "template_id": payload.template_id,
        "user_context": payload.user_context,
        "tenant_id": tenant_fallback,
        "selected_agent": payload.expert_id,
        "budget_limit": payload.budget_limit,
    }
    # If a template is provided and contains tasks/plan, seed it into initial state
    template_plan = None
    template_family = None
    template_cat = None
    template_checkpoints = None
    tpl = None
    if payload.template_id:
        tpl = mission_repo.get_template(payload.template_id)
        if tpl:
            # DB uses 'tasks' column, fallback to 'plan'/'steps' for backwards compatibility
            template_plan = tpl.get("tasks") or tpl.get("plan") or tpl.get("steps")
            template_family = tpl.get("family") or tpl.get("category")
            template_cat = tpl.get("cat_code") or tpl.get("category")
            template_checkpoints = tpl.get("checkpoints") or tpl.get("default_checkpoints") or []
            template_outputs = tpl.get("outputs") or []  # For output validation (Gap 5)
            if template_plan:
                initial_state["plan"] = template_plan
            if template_family:
                initial_state["template_family"] = template_family
            if template_cat:
                initial_state["template_cat"] = template_cat
            if template_checkpoints:
                initial_state["template_checkpoints"] = template_checkpoints
            if template_outputs:
                initial_state["template_outputs"] = template_outputs

            # Validate template required_inputs against user_context
            required_inputs = tpl.get("required_inputs") or []
            missing_inputs = []
            for req_input in required_inputs:
                input_name = req_input.get("name")
                if input_name and input_name not in payload.user_context:
                    missing_inputs.append({
                        "name": input_name,
                        "type": req_input.get("type", "any"),
                        "description": req_input.get("description", ""),
                    })

            if missing_inputs:
                # Return validation error as StreamingResponse with error event
                logger.warning(
                    "mission_missing_required_inputs",
                    template_id=payload.template_id,
                    missing=missing_inputs,
                )
                # For now, log warning but don't block - inputs can be provided via prompts
                # Future: return error response if strict mode enabled

    # Persist initial mission row
    mission_repo.save_state(
        mission_id,
        {
            "status": "pending",
            "mode": payload.mode,
            "goal": payload.goal,
            "title": payload.title or payload.goal,
            "objective": payload.goal,
            "tenant_id": tenant_fallback,
            "template_id": payload.template_id,
            "config": {"budget_limit": payload.budget_limit} if payload.budget_limit else {},
        },
    )

    async def event_generator() -> AsyncGenerator[bytes, None]:
        # If master graph is enabled, stream via LangGraph compiled graph
        if USE_MASTER_GRAPH:
            try:
                graph = build_master_graph()
                master_artifacts = []
                # Emit initial status
                yield sse_event("status", {"status": "planning", "message": "Planning mission"})
                async for update in graph.astream(
                    initial_state,
                    config={"configurable": {"thread_id": mission_id}},
                    stream_mode="updates",
                ):
                    # update is a dict of {node_name: payload}
                    # Handle both dict and tuple formats from LangGraph
                    if isinstance(update, tuple):
                        node_name, node_output = update[0], update[1] if len(update) > 1 else {}
                        if not isinstance(node_output, dict):
                            node_output = {"raw": node_output}
                        items = [(node_name, node_output)]
                    else:
                        items = update.items()
                    for node_name, node_output in items:
                        # Ensure node_output is a dict
                        if not isinstance(node_output, dict):
                            node_output = {"raw": node_output}
                        # Map node outputs to SSE events
                        if node_name in ("plan", "plan_mission"):
                            plan_payload = node_output.get("plan", [])
                            yield plan_event(plan_payload, confidence=node_output.get("confidence"))
                            mission_repo.save_state(
                                mission_id,
                                {
                                    "status": "planning",
                                    "plan": plan_payload,
                                    "tenant_id": tenant_fallback,
                                    "template_id": payload.template_id,
                                    "mode": payload.mode,
                                    "goal": payload.goal,
                                },
                            )
                        elif node_name == "execute_step":
                            current_step = node_output.get("current_step", 0)
                            plan_list = node_output.get("plan") or []
                            step_meta = plan_list[current_step - 1] if current_step and current_step - 1 < len(plan_list) else {}
                            yield progress_event(
                                step_meta.get("id") or "step",
                                current_step,
                                len(plan_list),
                                int((current_step / max(len(plan_list), 1)) * 100),
                                stage=step_meta.get("stage") or "execution",
                                message=step_meta.get("description") or "",
                            )

                            if node_output.get("artifacts"):
                                last_artifact = node_output["artifacts"][-1]
                                master_artifacts = node_output.get("artifacts") or master_artifacts
                                yield sse_event(
                                    "artifact",
                                    {
                                        "id": last_artifact.get("id"),
                                        "summary": last_artifact.get("summary"),
                                        "artifactPath": last_artifact.get("artifact_path"),
                                        "citations": last_artifact.get("citations", []),
                                        "step": last_artifact.get("step"),
                                        "status": last_artifact.get("status", "completed"),
                                    },
                                )
                                if last_artifact.get("sources"):
                                    yield sources_event(last_artifact.get("sources"))
                                if last_artifact.get("tools_used"):
                                    for tool_call in last_artifact.get("tools_used") or []:
                                        yield tool_event(tool_call)
                                step_cost = last_artifact.get("cost")
                                if step_cost is not None:
                                    yield sse_event(
                                        "cost",
                                        {
                                            "currentCost": node_output.get("current_cost"),
                                            "budgetLimit": initial_state.get("budget_limit"),
                                            "stepCost": step_cost,
                                            "stepId": last_artifact.get("id"),
                                            "breakdown": {"llm": node_output.get("current_cost"), "tools": 0, "other": 0},
                                        },
                                    )
                            if node_output.get("checkpoint_pending"):
                                yield checkpoint_event(node_output.get("checkpoint_pending"))
                        elif node_name == "checkpoint":
                            if node_output.get("checkpoint_pending"):
                                yield checkpoint_event(node_output.get("checkpoint_pending"))
                        elif node_name == "synthesize":
                            if node_output.get("final_output"):
                                yield sse_event("artifact", {"artifacts": [node_output.get("final_output")]})
                        # Costs
                        if node_output.get("cost"):
                            cost_val = node_output.get("cost")
                            if isinstance(cost_val, dict):
                                yield sse_event("cost", cost_val)
                            else:
                                yield sse_event(
                                    "cost",
                                    {
                                        "currentCost": node_output.get("current_cost"),
                                        "budgetLimit": initial_state.get("budget_limit"),
                                        "stepCost": cost_val,
                                    },
                                )
                        # Status changes
                        if node_output.get("status"):
                            yield sse_event("status", {"status": node_output.get("status")})

                # Done
                mission_repo.save_state(
                    mission_id,
                    {"status": "completed", "artifacts": master_artifacts, "tenant_id": tenant_fallback},
                )
                yield done_event({"mission_id": mission_id, "status": "completed"}, master_artifacts)
                return
            except Exception as e:
                logger.exception("Master graph streaming failed", exc_info=True)
                mission_repo.save_state(mission_id, {"status": "failed", "tenant_id": tenant_fallback, "reason": str(e)})
                yield sse_event("error", {"message": str(e), "mission_id": mission_id, "status": "failed"})
                return

        # ------------------------------------------------------------------
        # Legacy path (kept for fallback)
        state: MissionState = initial_state

        try:
            # --- Plan generation (heuristic L3 + domain-aware steps)
            strategy = await _generate_strategy(payload.goal)
            plan = template_plan or _generate_plan(payload.goal, strategy)

            mission_repo.save_state(
                mission_id,
                {
                    "status": "planning",
                    "plan": plan,
                    "budget_limit": payload.budget_limit,
                    "tenant_id": tenant_fallback,
                    "mode": payload.mode,
                    "goal": payload.goal,
                    "title": payload.title or payload.goal,
                    "objective": payload.goal,
                    "config": {"budget_limit": payload.budget_limit} if payload.budget_limit else {},
                },
            )
            yield sse_event("status", {"status": "planning", "message": "Plan in progress"})
            yield plan_event(plan, confidence=strategy.get("confidence"))
            yield progress_event(
                "planning",
                0,
                len(plan),
                0,
                stage="planning",
                message="Planning mission",
            )

            # Mode 4: auto-select team
            if payload.mode == 4:
                team = select_team(
                    payload.goal,
                    {
                        "template_id": payload.template_id,
                        "template_family": template_family,
                        "template_cat": template_cat,
                    },
                )
                yield sse_event("fusion", {"selectedExperts": team})
                selected_agent = team[0]["id"] if team else None
                # Emit agent_selected for each team member
                for agent in team:
                    yield agent_selected_event(
                        agent_id=agent.get("id", "unknown"),
                        name=agent.get("name", "Unknown Agent"),
                        reason=agent.get("match_reason", "Auto-selected for mission"),
                        confidence=agent.get("confidence", 0.8),
                        level=agent.get("level", 2),
                        avatar_url=agent.get("avatar_url"),
                    )
            else:
                selected_agent = payload.expert_id or "l2_placeholder"
                # Emit agent_selected for Mode 3 manual selection
                yield agent_selected_event(
                    agent_id=selected_agent,
                    name=selected_agent,  # Will be resolved by frontend
                    reason="User selected expert",
                    confidence=1.0,
                    level=2,
                )

            mission_repo.save_state(
                mission_id,
                {
                    "status": "running",
                    "selected_agent": selected_agent,
                    "budget_limit": payload.budget_limit,
                    "tenant_id": tenant_fallback,
                    "mode": payload.mode,
                    "goal": payload.goal,
                    "title": payload.title or payload.goal,
                    "objective": payload.goal,
                    "config": {"budget_limit": payload.budget_limit} if payload.budget_limit else {},
                },
            )
            yield sse_event("status", {"status": "running", "message": "Executing mission"})

            artifacts = []
            current_cost = 0.0
            budget_limit = payload.budget_limit or 0
            budget_checkpoint_issued = False
            quality_check_counter = 0
            if budget_limit:
                yield sse_event(
                    "cost",
                    {
                        "currentCost": current_cost,
                        "budgetLimit": budget_limit,
                        "estimatedTotal": budget_limit,
                        "breakdown": {"llm": current_cost, "tools": 0, "other": 0},
                    },
                )
            # Subscribe to checkpoint resolution to avoid polling
            checkpoint_event_received = asyncio.Event()

            async def _on_checkpoint(event: Dict[str, Any]) -> None:
                if event.get("type") == "checkpoint_resolved":
                    checkpoint_event_received.set()

            publisher.subscribe(mission_id, _on_checkpoint)

            for idx, step in enumerate(plan):
                yield thinking_event(step.get("id"), step.get("description"))

                delegate_key = str(step.get("delegate") or step.get("worker") or "L2")
                if delegate_key not in {"L2", "L3", "L4"}:
                    delegate_key = "L2"

                runner_code = step.get("runner")
                delegate_context = {
                    "goal": payload.goal,
                    "template_id": payload.template_id,
                    "runner_code": runner_code,
                    "stage": step.get("stage"),
                }
                expert_code = selected_agent or "l2_placeholder"

                # Emit delegation event when handing off to L3/L4
                if delegate_key in {"L3", "L4"}:
                    to_level = 3 if delegate_key == "L3" else 4
                    yield delegation_event(
                        from_agent=expert_code,
                        to_agent=step.get("worker") or delegate_key,
                        task=step.get("description", ""),
                        from_level=2,
                        to_level=to_level,
                        context=delegate_context,
                    )

                delegate_res = None
                token_index = 0

                try:
                    # Use streaming for L2 delegates to emit real-time tokens
                    if delegate_key == "L2":
                        # Emit thinking_start event
                        yield thinking_start_event(expert_code, step.get("id"))

                        # Stream L2 execution with token-by-token events
                        async for chunk in delegate_to_l2_streaming(
                            expert_code=expert_code,
                            task=step.get("description", ""),
                            context=delegate_context,
                        ):
                            event_type = chunk.get("event")

                            if event_type == "tool_start":
                                yield sse_event("tool_start", {
                                    "tool": chunk.get("tool"),
                                    "type": chunk.get("type"),
                                    "step": step.get("id"),
                                })
                            elif event_type == "tool_end":
                                yield sse_event("tool_end", {
                                    "tool": chunk.get("tool"),
                                    "sourcesCount": chunk.get("sources_count", 0),
                                    "cost": chunk.get("cost", 0),
                                })
                            elif event_type == "sources":
                                yield sources_event(chunk.get("sources", []))
                            elif event_type == "thinking_start":
                                # Already emitted above
                                pass
                            elif event_type == "thinking":
                                # Emit token for real-time streaming
                                token_content = chunk.get("token", "")
                                if token_content:
                                    yield token_event(token_content, token_index)
                                    token_index += 1
                                    # Also emit reasoning for Glass Box transparency
                                    yield reasoning_event(
                                        content=token_content,
                                        agent_id=expert_code,
                                        agent_level=2,
                                        step=step.get("id"),
                                    )
                            elif event_type == "thinking_end":
                                yield thinking_end_event(expert_code, step.get("id"))
                            elif event_type == "complete":
                                delegate_res = chunk
                            elif event_type == "error":
                                yield sse_event("error", {"message": chunk.get("error"), "step": step.get("id")})
                                mission_repo.save_state(
                                    mission_id,
                                    {"status": "failed", "tenant_id": tenant_fallback, "reason": chunk.get("error")},
                                )
                                return

                        # Emit thinking_end if not already emitted
                        if delegate_res:
                            yield thinking_end_event(expert_code, step.get("id"))

                    elif delegate_key == "L3":
                        delegate_res = await delegate_to_l3(
                            specialist_code=step.get("worker") or "context_specialist",
                            task=step.get("description", ""),
                            context=delegate_context,
                        )
                    else:  # L4
                        delegate_res = await delegate_to_l4(
                            worker_code=step.get("worker") or "evidence",
                            task=step.get("description", ""),
                            context=delegate_context,
                        )

                except Exception as exc:  # pragma: no cover - defensive
                    logger.error("delegate_execution_failed", step=step, error=str(exc))
                    mission_repo.save_state(
                        mission_id,
                        {"status": "failed", "tenant_id": tenant_fallback, "reason": str(exc)},
                    )
                    yield sse_event("error", {"message": f"Delegate failed: {exc}", "step": step.get("id")})
                    return

                # Ensure we have a result
                if not delegate_res:
                    delegate_res = {"summary": "No output", "citations": []}
                step_runner = delegate_res.get("runner") or {}
                complexity = (step_runner.get("complexity") or "medium").lower()
                base_cost = {"light": 0.5, "medium": 1.0, "heavy": 2.0}.get(complexity, 1.0)
                token_cost = 0.0
                tokens = delegate_res.get("tokens") or (delegate_res.get("token_usage") or {}).get("total_tokens") or None
                if isinstance(tokens, (int, float)) and tokens > 0:
                    token_cost = float(tokens) * 0.000002  # placeholder rate until tool/token costs available
                step_cost = float(delegate_res.get("cost") or base_cost + token_cost)

                artifact = {
                    "id": step.get("id"),
                    "summary": delegate_res.get("summary"),
                    "artifact_path": delegate_res.get("artifact_path"),
                    "citations": delegate_res.get("citations", []),
                    "step": step.get("name"),
                    "status": "complete",
                    "runner": delegate_res.get("runner"),
                    "cost": step_cost,
                }
                artifacts.append(artifact)
                mission_repo.save_state(
                    mission_id,
                    {
                        "status": "running",
                        "artifacts": artifacts,
                        "last_step": step.get("id"),
                        "plan": plan,
                        "current_cost": current_cost,
                        "budget_limit": budget_limit,
                        "template_id": payload.template_id,
                        "selected_agent": selected_agent,
                        "tenant_id": tenant_fallback,
                    },
                )
                mission_repo.log_event(
                    mission_id,
                    event_type="step_completed",
                    event_data={"step": step, "artifact": artifact},
                    agent_name=step.get("delegate"),
                    agent_level=int(step.get("delegate", "2")[1]) if str(step.get("delegate")).startswith("L") else None,
                    agent_task=step.get("description"),
                    runner_code=(delegate_res.get("runner") or {}).get("run_code") if delegate_res.get("runner") else None,
                    duration_ms=delegate_res.get("duration_ms"),
                    tenant_id=tenant_fallback,
                )
                quality_check_counter += 1
                if delegate_res.get("citations"):
                    yield sources_event(delegate_res.get("citations", []))
                yield sse_event(
                    "artifact",
                    {
                        "id": artifact["id"],
                        "summary": artifact["summary"],
                        "artifactPath": artifact["artifact_path"],
                        "citations": artifact["citations"],
                        "step": artifact.get("step"),
                        "status": artifact.get("status", "complete"),
                        "runner": delegate_res.get("runner"),
                        "cost": step_cost,
                    },
                )
                # Emit tool_call semantics for frontends expecting tool/tool_result stream
                if delegate_res.get("tools_used"):
                    for tool_call in delegate_res["tools_used"]:
                        yield tool_event(tool_call)
                        mission_repo.log_event(
                            mission_id,
                            event_type="tool_call",
                            event_data=tool_call,
                            agent_name=step.get("delegate"),
                            agent_level=int(step.get("delegate", "2")[1]) if str(step.get("delegate")).startswith("L") else None,
                            agent_task=step.get("description"),
                            runner_code=(delegate_res.get("runner") or {}).get("run_code") if delegate_res.get("runner") else None,
                            duration_ms=tool_call.get("duration_ms") if isinstance(tool_call, dict) else None,
                        )
                step_progress = int(((idx + 1) / len(plan)) * 100)
                yield progress_event(
                    step.get("id"),
                    idx + 1,
                    len(plan),
                    step_progress,
                    stage=step.get("stage") or "execution",
                    message=step.get("description", ""),
                )
                yield sse_event(
                    "progress",
                    {
                        "stage": step.get("stage") or "execution",
                        "progress": step_progress,
                        "message": f"Completed {step.get('name')}",
                        "status": "running" if step_progress < 100 else "complete",
                    },
                )
                if budget_limit:
                    current_cost += step_cost
                    mission_repo.save_state(
                        mission_id,
                        {
                            "status": "running",
                            "current_cost": current_cost,
                            "budget_limit": budget_limit,
                            "template_id": payload.template_id,
                        },
                    )
                    yield sse_event(
                        "cost",
                        {
                            "currentCost": current_cost,
                            "budgetLimit": budget_limit,
                            "estimatedTotal": budget_limit,
                            "stepCost": step_cost,
                            "stepId": step.get("id"),
                            "runner": (delegate_res.get("runner") or {}).get("run_code"),
                            "breakdown": {"llm": current_cost, "tools": 0, "other": 0},
                        },
                    )
                    if not budget_checkpoint_issued and current_cost >= 0.8 * budget_limit:
                        budget_checkpoint_issued = True
                        budget_cp = {
                            "id": f"cp_budget_{step.get('id')}",
                            "type": "budget",
                            "title": "Budget Checkpoint",
                            "description": "Budget nearing limit. Approve, increase, or abort?",
                            "options": [
                                {"id": "approve", "label": "Continue", "action": "approve"},
                                {"id": "increase", "label": "Increase budget 20%", "action": "increase_budget"},
                                {"id": "abort", "label": "Abort mission", "action": "abort"},
                            ],
                            "timeout": 300,
                            "urgency": "medium",
                            "context": {"current_cost": current_cost, "budget_limit": budget_limit},
                        }
                        checkpoint_store.set(mission_id, budget_cp["id"], "pending")
                        mission_repo.save_state(mission_id, {"status": "awaiting_checkpoint", "checkpoint": budget_cp})
                        yield sse_event("status", {"status": "awaiting_checkpoint", "message": "Budget checkpoint"})
                        yield checkpoint_event(budget_cp)
                        try:
                            await asyncio.wait_for(checkpoint_event_received.wait(), timeout=15)
                        except asyncio.TimeoutError:
                            yield sse_event("error", {"message": "Budget checkpoint timeout"})
                            mission_repo.save_state(mission_id, {"status": "failed", "reason": "budget_checkpoint_timeout"})
                            yield sse_event("status", {"status": "failed"})
                            return
                        checkpoint_event_received.clear()

                if quality_check_counter >= 3:
                    quality_check_counter = 0
                    quality_cp = {
                        "id": f"cp_quality_{step.get('id')}",
                        "type": "quality",
                        "title": "Quality Checkpoint",
                        "description": "Review recent steps for quality/consistency.",
                        "options": [
                            {"id": "continue", "label": "Continue", "action": "approve"},
                            {"id": "revise", "label": "Revise last output", "action": "revise"},
                            {"id": "abort", "label": "Abort mission", "action": "abort"},
                        ],
                        "timeout": 300,
                        "urgency": "medium",
                    }
                    checkpoint_store.set(mission_id, quality_cp["id"], "pending")
                    mission_repo.save_state(mission_id, {"status": "awaiting_checkpoint", "checkpoint": quality_cp})
                    yield sse_event("status", {"status": "awaiting_checkpoint", "message": "Quality checkpoint"})
                    yield checkpoint_event(quality_cp)
                    try:
                        await asyncio.wait_for(checkpoint_event_received.wait(), timeout=15)
                    except asyncio.TimeoutError:
                        yield sse_event("error", {"message": "Quality checkpoint timeout"})
                        mission_repo.save_state(mission_id, {"status": "failed", "reason": "quality_checkpoint_timeout"})
                        yield sse_event("status", {"status": "failed"})
                        return
                    checkpoint_event_received.clear()

            # Simple checkpoint stub (HITL-ready)
            checkpoint = {
                "id": f"cp_{plan[-1].get('id')}",
                "type": "final_review",
                "title": "Review draft",
                "description": "Approve synthesized summary before finalization.",
                "options": ["approve", "revise"],
                "timeout": 300,
                "urgency": "medium",
            }
            checkpoint_store.set(mission_id, checkpoint["id"], "pending")
            mission_repo.update_checkpoint(mission_id, checkpoint["id"], "pending")
            mission_repo.save_state(mission_id, {"status": "awaiting_checkpoint", "checkpoint": checkpoint})
            yield sse_event("status", {"status": "awaiting_checkpoint", "message": "Awaiting approval"})
            yield checkpoint_event(checkpoint)

            # Await checkpoint resolution (event-driven)
            try:
                await asyncio.wait_for(checkpoint_event_received.wait(), timeout=15)
            except asyncio.TimeoutError:
                yield sse_event("error", {"message": "Checkpoint timeout"})
                mission_repo.save_state(mission_id, {"status": "failed", "reason": "checkpoint_timeout"})
                yield sse_event("status", {"status": "failed"})
                return

            # Synthesize
            final_content = "\n\n".join([a.get("summary", "") for a in artifacts]) or "No content produced."
            # Emit token with tokenIndex for frontend expectation
            yield sse_event(
                "token",
                {"content": final_content, "tokenIndex": 0, "status": "streaming", "message": "Finalizing mission"},
            )
            yield done_event({"content": final_content, "status": "completed"}, artifacts)
            mission_repo.save_state(mission_id, {"status": "completed", "artifacts": artifacts})
            if budget_limit:
                yield sse_event(
                    "cost",
                    {
                        "currentCost": current_cost,
                        "budgetLimit": budget_limit,
                        "estimatedTotal": budget_limit,
                        "breakdown": {"llm": current_cost, "tools": 0, "other": 0},
                        "status": "completed",
                    },
                )
            yield sse_event("status", {"status": "completed"})

        except Exception as exc:  # pragma: no cover - defensive
            yield sse_event("error", {"message": str(exc)})

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
    checkpoint_store.set(payload.mission_id, payload.checkpoint_id, payload.action)
    mission_repo.update_checkpoint(payload.mission_id, payload.checkpoint_id, payload.action)
    response = {
        "mission_id": payload.mission_id,
        "checkpoint_id": payload.checkpoint_id,
        "ack": True,
        "action": payload.action,
        "option": payload.option,
        "reason": payload.reason,
        "modifications": payload.modifications,
    }
    if payload.resume:
        response["resume"] = True
        await publisher.publish(payload.mission_id, {"type": "checkpoint_resolved"})
    return response


@router.get("/checkpoints/{checkpoint_id}")
async def get_checkpoint(
    checkpoint_id: str,
    mission_id: Optional[str] = None,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Get checkpoint status and details.

    Returns checkpoint info including type, status, options, and timeout.
    Frontend uses this for HITL checkpoint rendering.
    """
    # Try to find checkpoint in checkpoint_store first
    status = None
    if mission_id:
        status = checkpoint_store.get(mission_id, checkpoint_id)

    # Get mission state to find checkpoint details
    mission_state = None
    if mission_id:
        mission_state = mission_repo.get_state(mission_id)

    checkpoint_data = None
    if mission_state and mission_state.get("checkpoint"):
        cp = mission_state.get("checkpoint")
        if cp.get("id") == checkpoint_id:
            checkpoint_data = cp

    if not checkpoint_data:
        raise HTTPException(status_code=404, detail=f"Checkpoint {checkpoint_id} not found")

    return {
        "id": checkpoint_id,
        "mission_id": mission_id,
        "type": checkpoint_data.get("type", "unknown"),
        "title": checkpoint_data.get("title", ""),
        "description": checkpoint_data.get("description", ""),
        "options": checkpoint_data.get("options", []),
        "timeout": checkpoint_data.get("timeout", 300),
        "urgency": checkpoint_data.get("urgency", "medium"),
        "status": status or "pending",
        "context": checkpoint_data.get("context", {}),
    }


@router.post("/checkpoints/{checkpoint_id}/respond")
async def respond_to_checkpoint(
    checkpoint_id: str,
    payload: CheckpointResponseRequest,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Alternative endpoint matching frontend expectation for /api/missions/checkpoints/:id.

    Handles HITL checkpoint responses with action, option, and optional modifications.
    """
    # Validate checkpoint exists
    if payload.mission_id:
        status = checkpoint_store.get(payload.mission_id, checkpoint_id)
        if status and status not in ("pending", "awaiting"):
            raise HTTPException(status_code=400, detail=f"Checkpoint already resolved with: {status}")

    # Store response
    checkpoint_store.set(payload.mission_id, checkpoint_id, payload.action)
    mission_repo.update_checkpoint(payload.mission_id, checkpoint_id, payload.action)

    # Log the checkpoint response
    mission_repo.log_event(
        payload.mission_id,
        event_type="checkpoint_response",
        event_data={
            "checkpoint_id": checkpoint_id,
            "action": payload.action,
            "option": payload.option,
            "reason": payload.reason,
            "modifications": payload.modifications,
        },
        tenant_id=tenant_id,
    )

    response = {
        "checkpoint_id": checkpoint_id,
        "mission_id": payload.mission_id,
        "status": "resolved",
        "action": payload.action,
        "option": payload.option,
        "ack": True,
    }

    # Resume mission if requested
    if payload.resume:
        response["resume"] = True
        await publisher.publish(payload.mission_id, {"type": "checkpoint_resolved"})

    return response


# --------------------------------------------------------------------------- Internal helpers


async def _generate_strategy(goal: str) -> Dict[str, Any]:
    """Ask L3 planner for strategy; return a normalized payload."""
    try:
        l3 = L3ContextSpecialist(
            AgentConfig(
                id="l3-plan",
                name="L3 Planner",
                base_system_prompt="You plan missions.",
                metadata={},
            )
        )
        strategy_res = await l3.execute(task=goal, params={"query": goal}, context={})
        if isinstance(strategy_res, dict):
            return strategy_res.get("output") or strategy_res
    except Exception:  # pragma: no cover - defensive fallback
        return {
            "intent": "general",
            "recommended_tools": ["L5-PM", "L5-WEB"],
            "expanded_terms": [goal],
        }
    return {
        "intent": "general",
        "recommended_tools": ["L5-PM", "L5-WEB"],
        "expanded_terms": [goal],
    }


def _generate_plan(goal: str, strategy: Dict[str, Any]) -> list:
    """
    Build a richer multi-step plan using intent + recommended tools.
    Ensures at least 4 steps: plan -> evidence -> analysis -> synthesis/QA.
    """
    intent = (strategy or {}).get("intent", "general")
    rec_tools = (strategy or {}).get("recommended_tools") or ["L5-PM", "L5-WEB"]

    def _runner_for(stage: str) -> str | None:
        runner = runner_registry.pick_for_stage(stage)
        return runner.get("run_code") if runner else None

    steps = [
        {
            "id": "step_1",
            "name": "Strategy & Context",
            "description": goal or "Define mission objective",
            "worker": "L3",
            "delegate": "L3",
            "stage": "planning",
            "tools": rec_tools,
            "status": "pending",
            "runner": _runner_for("planning"),
        },
        {
            "id": "step_2",
            "name": "Evidence Retrieval",
            "description": "Retrieve and analyze key evidence",
            "worker": "L4",
            "delegate": "L4",
            "stage": "evidence",
            "tools": rec_tools,
            "status": "pending",
            "runner": _runner_for("evidence"),
        },
        {
            "id": "step_3",
            "name": "Comparative Analysis",
            "description": "Compare alternatives, benchmarks, and risks",
            "worker": "L2",
            "delegate": "L2",
            "stage": "analysis",
            "tools": rec_tools,
            "status": "pending",
            "runner": _runner_for("analysis"),
        },
        {
            "id": "step_4",
            "name": "Synthesis & Narrative",
            "description": "Draft recommendations tailored to stakeholders",
            "worker": "L2",
            "delegate": "L2",
            "stage": "synthesis",
            "tools": [],
            "status": "pending",
            "runner": _runner_for("synthesis"),
        },
    ]

    # Domain-specific enrichment
    if intent in {"regulatory", "hta", "market_access", "commercial"}:
        steps.insert(
            2,
            {
                "id": "step_2b",
                "name": "Access & Pricing",
                "description": "Assess reimbursement pathways, HTA criteria, and pricing levers",
                "worker": "L2",
                "delegate": "L2",
                "stage": "analysis",
                "tools": rec_tools,
                "status": "pending",
                "runner": _runner_for("analysis"),
            },
        )
    elif intent in {"clinical", "safety"}:
        steps.insert(
            2,
            {
                "id": "step_2b",
                "name": "Clinical Evidence Appraisal",
                "description": "Assess trials, endpoints, benefit-risk, and safety signals",
                "worker": "L3",
                "delegate": "L3",
                "stage": "analysis",
                "tools": rec_tools,
                "status": "pending",
                "runner": _runner_for("analysis"),
            },
        )

    # Add a QA/Checkpoint stage at the end
    steps.append(
        {
            "id": "step_5",
            "name": "QA & Final Review",
            "description": "Quality check, citations, and checkpoint review",
            "worker": "L2",
            "delegate": "L2",
            "stage": "qa",
            "tools": [],
            "status": "pending",
            "runner": _runner_for("qa"),
        }
    )

    # Deduplicate ids if insert created conflicts
    for idx, step in enumerate(steps):
        if step.get("id", "").startswith("step_"):
            step["id"] = f"step_{idx + 1}"
    return steps
