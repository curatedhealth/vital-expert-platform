"""
Mode 4: Auto-Autonomous Workflow Route
System automatically selects expert team via Fusion Intelligence,
then executes autonomously in the background.

Features:
- Automatic expert team selection (Fusion Intelligence)
- Fire-and-forget background execution
- Pre-flight validation
- Periodic progress updates
- Artifact generation
- HITL checkpoints for critical decisions

Phase 4: Integration & Streaming
"""

from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import structlog
import asyncio
from datetime import datetime
import uuid
import json

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/v1/expert", tags=["Mode 4 Auto-Autonomous"])

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class PreFlightRequest(BaseModel):
    """Request for pre-flight validation"""
    mission_id: str = Field(..., description="Mission ID")
    goal: str = Field(..., min_length=1, description="Mission goal")
    tenant_id: str = Field(..., description="Tenant ID")
    user_id: Optional[str] = Field(None, description="User ID")
    mode: str = Field(default="mode4_auto_autonomous")
    options: Dict[str, Any] = Field(default_factory=dict)


class PreFlightCheck(BaseModel):
    """Individual pre-flight check result"""
    id: str
    name: str
    category: str  # 'budget' | 'permissions' | 'tools' | 'agents' | 'data'
    status: str  # 'pending' | 'checking' | 'passed' | 'failed' | 'warning'
    message: Optional[str] = None
    required: bool = True


class PreFlightResponse(BaseModel):
    """Pre-flight validation response"""
    passed: bool
    checks: List[PreFlightCheck]
    estimated_cost: Optional[float] = None
    estimated_duration: Optional[int] = None  # seconds
    recommended_team_size: int = 3


class Mode4Request(BaseModel):
    """Request for Mode 4 background execution"""
    mission_id: str = Field(..., description="Mission ID")
    goal: str = Field(..., min_length=1, description="Mission goal")
    mode: str = Field(default="mode4_auto_autonomous")
    tenant_id: str = Field(..., description="Tenant ID")
    user_id: Optional[str] = Field(None, description="User ID")
    options: Dict[str, Any] = Field(default_factory=dict, description="Execution options")


class MissionStatusResponse(BaseModel):
    """Mission status response"""
    mission_id: str
    status: str  # 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
    progress: int  # 0-100
    current_phase: Optional[str] = None
    team: List[Dict[str, Any]] = []
    artifacts: List[Dict[str, Any]] = []
    cost: Optional[float] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_message: Optional[str] = None


# ============================================================================
# DEPENDENCIES
# ============================================================================

async def get_tenant_id(x_tenant_id: str = Header(..., alias="x-tenant-id")) -> str:
    """Extract tenant ID from header"""
    return x_tenant_id


async def get_user_id(x_user_id: str = Header(None, alias="x-user-id")) -> Optional[str]:
    """Extract user ID from header"""
    return x_user_id


def get_supabase_client():
    """Get Supabase client from environment"""
    from supabase import create_client
    import os

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=500,
            detail="Supabase configuration missing"
        )

    return create_client(supabase_url, supabase_key)


# ============================================================================
# IN-MEMORY MISSION STORE (Replace with Redis/DB in production)
# ============================================================================

_mission_store: Dict[str, Dict[str, Any]] = {}


def get_mission(mission_id: str) -> Optional[Dict[str, Any]]:
    """Get mission from store"""
    return _mission_store.get(mission_id)


def update_mission(mission_id: str, updates: Dict[str, Any]):
    """Update mission in store"""
    if mission_id in _mission_store:
        _mission_store[mission_id].update(updates)


def create_mission(mission_id: str, data: Dict[str, Any]):
    """Create new mission in store"""
    _mission_store[mission_id] = {
        **data,
        "created_at": datetime.utcnow().isoformat(),
    }


# ============================================================================
# SSE EVENT GENERATORS
# ============================================================================

async def generate_sse_event(event_type: str, data: Dict[str, Any]) -> str:
    """Generate SSE event string"""
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"


async def stream_mode4_execution(
    mission_id: str,
    goal: str,
    tenant_id: str,
    user_id: Optional[str],
    options: Dict[str, Any],
):
    """Generator for streaming Mode 4 execution events"""
    try:
        # Import dependencies
        from fusion.fusion_engine import FusionEngine
        from langgraph_workflows.mode4_refactored import Mode4AutoAutonomousWorkflow
        from langgraph_workflows.state_schemas import create_initial_state, WorkflowMode

        supabase = get_supabase_client()

        # Initialize mission state
        create_mission(mission_id, {
            "status": "running",
            "progress": 0,
            "goal": goal,
            "team": [],
            "artifacts": [],
            "tenant_id": tenant_id,
            "user_id": user_id,
        })

        # =====================================================================
        # PHASE 1: FUSION INTELLIGENCE - AUTOMATIC TEAM SELECTION
        # =====================================================================
        yield await generate_sse_event("progress", {
            "stage": "team_assembly",
            "progress": 5,
            "message": "Analyzing query with Fusion Intelligence..."
        })

        # Initialize Fusion Engine
        fusion_engine = FusionEngine(supabase_client=supabase)

        # Get optimal team via Fusion Intelligence
        fusion_result = await fusion_engine.select_optimal_team(
            query=goal,
            tenant_id=tenant_id,
            min_team_size=options.get('min_team_size', 2),
            max_team_size=options.get('max_team_size', 5),
            require_l2_lead=options.get('require_l2_lead', True),
        )

        # Emit fusion event
        yield await generate_sse_event("fusion", {
            "selectedExperts": [
                {
                    "id": expert['id'],
                    "name": expert['name'],
                    "role": expert.get('role', 'Expert'),
                    "level": expert.get('level', 'L2'),
                    "confidence": expert.get('confidence', 0.8),
                }
                for expert in fusion_result.get('selected_experts', [])
            ],
            "evidence": {
                "vectorScores": fusion_result.get('vector_scores', {}),
                "graphPaths": fusion_result.get('graph_paths', []),
                "relationalPatterns": fusion_result.get('relational_patterns', {}),
            },
            "weights": fusion_result.get('weights', {"vector": 0.4, "graph": 0.35, "relational": 0.25}),
            "reasoning": fusion_result.get('reasoning', ''),
            "retrievalTimeMs": fusion_result.get('retrieval_time_ms', 0),
        })

        # Update mission with team
        team = fusion_result.get('selected_experts', [])
        update_mission(mission_id, {"team": team, "progress": 15})

        yield await generate_sse_event("progress", {
            "stage": "team_assembled",
            "progress": 15,
            "message": f"Team of {len(team)} experts assembled"
        })

        # =====================================================================
        # PHASE 2: WORKFLOW EXECUTION
        # =====================================================================
        yield await generate_sse_event("progress", {
            "stage": "execution_started",
            "progress": 20,
            "message": "Starting autonomous execution..."
        })

        # Initialize workflow
        workflow = Mode4AutoAutonomousWorkflow(
            supabase_client=supabase,
            fusion_engine=fusion_engine,
        )

        # Build and compile graph
        graph = workflow.build_graph()
        compiled_graph = graph.compile()

        # Create initial state
        initial_state = create_initial_state(
            tenant_id=tenant_id,
            mode=WorkflowMode.MODE_4_BACKGROUND,
            query=goal,
            request_id=mission_id,
            selected_agents=[e['id'] for e in team],
            enable_rag=options.get('enable_rag', True),
            enable_tools=options.get('enable_all_tools', True),
            user_id=user_id,
        )

        # Add Mode 4 specific state
        initial_state['fusion_enabled'] = True
        initial_state['background_mode'] = True
        initial_state['max_duration'] = options.get('max_duration', 3600)
        initial_state['budget_limit'] = options.get('budget_limit')
        initial_state['hitl_enabled'] = True
        initial_state['priority'] = options.get('priority', 'normal')

        # Execute with streaming callbacks
        async for event in compiled_graph.astream_events(
            initial_state,
            config={"recursion_limit": 200},
            version="v2"
        ):
            event_kind = event.get('event')
            event_data = event.get('data', {})

            # Progress updates
            if event_kind == 'on_chain_start':
                node_name = event.get('name', 'unknown')
                current_progress = _mission_store.get(mission_id, {}).get('progress', 20)
                new_progress = min(current_progress + 5, 90)
                update_mission(mission_id, {"progress": new_progress, "current_phase": node_name})

                yield await generate_sse_event("progress", {
                    "stage": node_name,
                    "progress": new_progress,
                    "message": f"Executing: {node_name.replace('_', ' ').title()}"
                })

            # Reasoning events
            elif event_kind == 'on_chain_end':
                output = event_data.get('output', {})
                if isinstance(output, dict):
                    # Emit reasoning if present
                    if 'reasoning_step' in output:
                        yield await generate_sse_event("reasoning", {
                            "id": str(uuid.uuid4()),
                            "step": output.get('step_name', 'Analysis'),
                            "stepIndex": output.get('step_index', 0),
                            "agentLevel": output.get('agent_level', 'L2'),
                            "agentId": output.get('agent_id', ''),
                            "agentName": output.get('agent_name', 'Expert'),
                            "content": output.get('reasoning_step', ''),
                            "status": "complete",
                        })

                    # Emit tool calls
                    if 'tool_call' in output:
                        yield await generate_sse_event("tool_call", output['tool_call'])

                    # Emit checkpoints
                    if 'checkpoint' in output:
                        yield await generate_sse_event("checkpoint", output['checkpoint'])
                        update_mission(mission_id, {"status": "paused"})

                    # Emit artifacts
                    if 'artifact' in output:
                        artifact = output['artifact']
                        current_artifacts = _mission_store.get(mission_id, {}).get('artifacts', [])
                        current_artifacts.append(artifact)
                        update_mission(mission_id, {"artifacts": current_artifacts})
                        yield await generate_sse_event("artifact", artifact)

                    # Emit citations
                    if 'citation' in output:
                        yield await generate_sse_event("citation", output['citation'])

                    # Cost updates
                    if 'cost_update' in output:
                        yield await generate_sse_event("cost", output['cost_update'])

            # Token streaming (if enabled)
            elif event_kind == 'on_llm_stream':
                chunk = event_data.get('chunk', {})
                if hasattr(chunk, 'content') and chunk.content:
                    yield await generate_sse_event("token", {
                        "content": chunk.content,
                        "tokenIndex": event_data.get('index', 0),
                    })

        # =====================================================================
        # PHASE 3: COMPLETION
        # =====================================================================
        mission_data = get_mission(mission_id)
        final_cost = mission_data.get('cost', 0.0)
        artifacts = mission_data.get('artifacts', [])

        update_mission(mission_id, {
            "status": "completed",
            "progress": 100,
            "completed_at": datetime.utcnow().isoformat(),
        })

        yield await generate_sse_event("progress", {
            "stage": "completed",
            "progress": 100,
            "message": "Mission completed successfully"
        })

        yield await generate_sse_event("done", {
            "messageId": mission_id,
            "totalTokens": mission_data.get('total_tokens', 0),
            "inputTokens": mission_data.get('input_tokens', 0),
            "outputTokens": mission_data.get('output_tokens', 0),
            "cost": final_cost,
            "durationMs": mission_data.get('duration_ms', 0),
            "citationCount": len(mission_data.get('citations', [])),
            "toolCallCount": mission_data.get('tool_call_count', 0),
        })

    except ImportError as e:
        logger.error("mode4_import_error", error=str(e))
        yield await generate_sse_event("error", {
            "code": "WORKFLOW_UNAVAILABLE",
            "message": f"Mode 4 workflow not available: {str(e)}",
            "recoverable": False,
        })
        update_mission(mission_id, {"status": "failed", "error_message": str(e)})

    except Exception as e:
        logger.error("mode4_execution_error", error=str(e), exc_info=True)
        yield await generate_sse_event("error", {
            "code": "EXECUTION_ERROR",
            "message": str(e),
            "recoverable": True,
        })
        update_mission(mission_id, {"status": "failed", "error_message": str(e)})


# ============================================================================
# ROUTES
# ============================================================================

@router.post("/preflight")
async def run_preflight_checks(
    request: PreFlightRequest,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Run pre-flight validation before launching Mode 4 mission.

    Validates:
    - Budget availability
    - Tool access permissions
    - Agent compatibility
    - Data source access
    - Execution permissions
    """
    logger.info(
        "mode4_preflight_started",
        mission_id=request.mission_id,
        tenant_id=tenant_id,
    )

    checks: List[PreFlightCheck] = []

    try:
        supabase = get_supabase_client()

        # 1. Budget Check
        budget_check = PreFlightCheck(
            id="budget",
            name="Budget Availability",
            category="budget",
            status="checking",
            required=True,
        )

        # Check user's budget (mock - replace with actual check)
        budget_limit = request.options.get('budget_limit')
        if budget_limit and budget_limit > 0:
            budget_check.status = "passed"
            budget_check.message = f"Budget limit set: ${budget_limit}"
        else:
            budget_check.status = "warning"
            budget_check.message = "No budget limit set - costs may be unbounded"
        checks.append(budget_check)

        # 2. Tool Access Check
        tools_check = PreFlightCheck(
            id="tools",
            name="Tool Access",
            category="tools",
            status="checking",
            required=True,
        )

        # Check tool availability (mock - replace with actual check)
        if request.options.get('enable_all_tools', True):
            tools_check.status = "passed"
            tools_check.message = "All tools accessible"
        else:
            tools_check.status = "passed"
            tools_check.message = "Limited tools enabled"
        checks.append(tools_check)

        # 3. Agent Compatibility Check
        agents_check = PreFlightCheck(
            id="agents",
            name="Agent Compatibility",
            category="agents",
            status="checking",
            required=True,
        )

        # Check if agents are available for this tenant
        agent_result = supabase.table('agents').select('id').eq(
            'tenant_id', tenant_id
        ).limit(5).execute()

        if agent_result.data and len(agent_result.data) > 0:
            agents_check.status = "passed"
            agents_check.message = f"{len(agent_result.data)} agents available"
        else:
            agents_check.status = "failed"
            agents_check.message = "No agents available for this tenant"
        checks.append(agents_check)

        # 4. Data Source Check
        data_check = PreFlightCheck(
            id="data",
            name="Data Sources",
            category="data",
            status="checking",
            required=False,
        )

        if request.options.get('enable_rag', True):
            data_check.status = "passed"
            data_check.message = "RAG retrieval enabled"
        else:
            data_check.status = "warning"
            data_check.message = "RAG disabled - limited data access"
        checks.append(data_check)

        # 5. Permissions Check
        permissions_check = PreFlightCheck(
            id="permissions",
            name="Execution Permissions",
            category="permissions",
            status="checking",
            required=True,
        )

        # Mock permission check
        permissions_check.status = "passed"
        permissions_check.message = "Execution authorized"
        checks.append(permissions_check)

        # Determine overall pass/fail
        required_checks = [c for c in checks if c.required]
        passed = all(c.status in ['passed', 'warning'] for c in required_checks)

        logger.info(
            "mode4_preflight_completed",
            mission_id=request.mission_id,
            passed=passed,
            checks_count=len(checks),
        )

        return PreFlightResponse(
            passed=passed,
            checks=checks,
            estimated_cost=0.50,  # Mock estimate
            estimated_duration=300,  # 5 minutes estimate
            recommended_team_size=3,
        )

    except Exception as e:
        logger.error("mode4_preflight_error", error=str(e))
        return PreFlightResponse(
            passed=False,
            checks=[
                PreFlightCheck(
                    id="system",
                    name="System Health",
                    category="permissions",
                    status="failed",
                    message=str(e),
                    required=True,
                )
            ],
        )


@router.post("/background")
async def execute_mode4_background(
    request: Mode4Request,
    background_tasks: BackgroundTasks,
    tenant_id: str = Depends(get_tenant_id),
    user_id: Optional[str] = Depends(get_user_id),
):
    """
    Execute Mode 4: Auto-Autonomous workflow with SSE streaming.

    System automatically selects expert team via Fusion Intelligence,
    then executes autonomously with periodic progress updates.
    """
    logger.info(
        "mode4_background_started",
        mission_id=request.mission_id,
        tenant_id=tenant_id,
        user_id=user_id,
    )

    return StreamingResponse(
        stream_mode4_execution(
            mission_id=request.mission_id,
            goal=request.goal,
            tenant_id=tenant_id,
            user_id=user_id,
            options=request.options,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/mission/{mission_id}/status")
async def get_mission_status(
    mission_id: str,
    tenant_id: str = Depends(get_tenant_id),
):
    """Get the current status of a background mission."""
    mission = get_mission(mission_id)

    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    if mission.get('tenant_id') != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return MissionStatusResponse(
        mission_id=mission_id,
        status=mission.get('status', 'unknown'),
        progress=mission.get('progress', 0),
        current_phase=mission.get('current_phase'),
        team=mission.get('team', []),
        artifacts=mission.get('artifacts', []),
        cost=mission.get('cost'),
        started_at=mission.get('created_at'),
        completed_at=mission.get('completed_at'),
        error_message=mission.get('error_message'),
    )


@router.post("/mission/{mission_id}/pause")
async def pause_mission(
    mission_id: str,
    tenant_id: str = Depends(get_tenant_id),
):
    """Pause a running mission."""
    mission = get_mission(mission_id)

    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    if mission.get('tenant_id') != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if mission.get('status') != 'running':
        raise HTTPException(status_code=400, detail="Mission is not running")

    update_mission(mission_id, {"status": "paused"})

    logger.info("mode4_mission_paused", mission_id=mission_id)

    return {"status": "paused", "mission_id": mission_id}


@router.post("/mission/{mission_id}/resume")
async def resume_mission(
    mission_id: str,
    tenant_id: str = Depends(get_tenant_id),
):
    """Resume a paused mission."""
    mission = get_mission(mission_id)

    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    if mission.get('tenant_id') != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if mission.get('status') != 'paused':
        raise HTTPException(status_code=400, detail="Mission is not paused")

    update_mission(mission_id, {"status": "running"})

    logger.info("mode4_mission_resumed", mission_id=mission_id)

    return {"status": "running", "mission_id": mission_id}


@router.post("/mission/{mission_id}/cancel")
async def cancel_mission(
    mission_id: str,
    tenant_id: str = Depends(get_tenant_id),
):
    """Cancel a mission."""
    mission = get_mission(mission_id)

    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    if mission.get('tenant_id') != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if mission.get('status') in ['completed', 'cancelled']:
        raise HTTPException(status_code=400, detail="Mission already completed or cancelled")

    update_mission(mission_id, {
        "status": "cancelled",
        "completed_at": datetime.utcnow().isoformat(),
    })

    logger.info("mode4_mission_cancelled", mission_id=mission_id)

    return {"status": "cancelled", "mission_id": mission_id}


@router.get("/missions")
async def list_missions(
    tenant_id: str = Depends(get_tenant_id),
    user_id: Optional[str] = Depends(get_user_id),
    mode: str = "mode4_auto_autonomous",
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """List missions for the current user/tenant."""
    # Filter missions from store
    user_missions = [
        {"id": mid, **mdata}
        for mid, mdata in _mission_store.items()
        if mdata.get('tenant_id') == tenant_id
        and (not user_id or mdata.get('user_id') == user_id)
        and (not status or mdata.get('status') == status)
    ]

    # Sort by creation time (newest first)
    user_missions.sort(key=lambda m: m.get('created_at', ''), reverse=True)

    # Apply pagination
    return user_missions[offset:offset + limit]


@router.get("/health")
async def mode4_health():
    """Health check for Mode 4 workflow"""
    try:
        # Try importing workflow to check availability
        from langgraph_workflows.mode4_refactored import Mode4AutoAutonomousWorkflow
        workflow_available = True
    except ImportError:
        workflow_available = False

    try:
        from fusion.fusion_engine import FusionEngine
        fusion_available = True
    except ImportError:
        fusion_available = False

    return {
        "status": "healthy" if workflow_available and fusion_available else "degraded",
        "workflow": "Mode4AutoAutonomousWorkflow",
        "workflow_available": workflow_available,
        "fusion_available": fusion_available,
        "endpoint": "/api/v1/expert/background",
        "features": [
            "fusion_team_selection",
            "background_execution",
            "preflight_validation",
            "progress_streaming",
            "artifact_generation",
            "hitl_checkpoints",
        ],
        "timestamp": datetime.utcnow().isoformat(),
    }
