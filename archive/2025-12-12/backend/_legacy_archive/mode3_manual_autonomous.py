"""
Mode 3: Manual-Autonomous Workflow Route
User selects agent, goal-driven autonomous execution with HITL checkpoints

Features:
- User-selected agent (manual selection)
- Autonomous goal-driven execution (AutoGPT-like)
- HITL (Human-in-the-Loop) checkpoints
- ReAct reasoning pattern
- Constitutional AI validation
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import structlog
import asyncio
from datetime import datetime
import uuid

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/mode3", tags=["Mode 3 Autonomous"])

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class Mode3Request(BaseModel):
    """Request for Mode 3 autonomous execution.

    Configuration is fetched from agent table by default.
    Request values override agent config when provided.
    """
    agent_id: str = Field(..., description="Selected expert agent ID")
    message: str = Field(..., min_length=1, description="User message/goal")
    session_id: Optional[str] = Field(None, description="Session ID for conversation")
    user_id: Optional[str] = Field(None, description="User ID")
    # Optional overrides - if not provided, uses agent configuration from database
    enable_rag: Optional[bool] = Field(None, description="Override: Enable RAG retrieval (default: from agent config)")
    enable_tools: Optional[bool] = Field(None, description="Override: Enable tool execution (default: from agent config)")
    websearch_enabled: Optional[bool] = Field(None, description="Override: Enable web search (default: from agent config)")
    model: Optional[str] = Field(None, description="Override: LLM model (default: from agent base_model)")
    max_iterations: Optional[int] = Field(None, ge=1, le=20, description="Override: Max goal iterations (default: from agent config)")
    confidence_threshold: Optional[float] = Field(None, ge=0.5, le=1.0, description="Override: Goal confidence threshold (default: from agent config)")
    hitl_enabled: Optional[bool] = Field(None, description="Override: Enable HITL checkpoints (default: from agent config)")
    hitl_safety_level: Optional[str] = Field(None, description="Override: HITL safety level (default: from agent config)")


class Mode3Response(BaseModel):
    """Response for Mode 3 autonomous execution"""
    agent_id: str
    content: str
    confidence: float
    citations: List[Dict[str, Any]] = []
    reasoning: List[Dict[str, Any]] = []
    autonomous_reasoning: Dict[str, Any] = {}
    hitl_checkpoints: Dict[str, Any] = {}  # HITL checkpoint status (5 checkpoints)
    autonomy_metadata: Dict[str, Any] = {}  # Autonomy level, task tree, etc.
    agent_selection: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}
    processing_time_ms: float = 0
    sources: List[Dict[str, Any]] = []
    session_id: Optional[str] = None
    # HITL control for frontend
    hitl_pending: bool = False
    hitl_checkpoint_type: Optional[str] = None


# ============================================================================
# DEPENDENCIES
# ============================================================================

async def get_tenant_id(x_tenant_id: str = Header(..., alias="x-tenant-id")) -> str:
    """Extract tenant ID from header"""
    return x_tenant_id


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
# ROUTES
# ============================================================================

@router.post("/autonomous-manual", response_model=Mode3Response)
async def execute_mode3_autonomous(
    request: Mode3Request,
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Execute Mode 3: Manual-Autonomous workflow

    User selects agent, system executes autonomously with goal-driven loop.
    Includes HITL checkpoints for approval at key decision points.

    Configuration is fetched from agent table by default.
    Request values override agent config when explicitly provided.
    """
    start_time = asyncio.get_event_loop().time()
    request_id = str(uuid.uuid4())

    try:
        # Import workflow (using refactored version)
        from langgraph_workflows.mode3_refactored import Mode3ManualAutonomousWorkflow
        from langgraph_workflows.state_schemas import create_initial_state, WorkflowMode

        # Initialize Supabase client
        supabase = get_supabase_client()

        # =====================================================================
        # FETCH AGENT CONFIGURATION FROM DATABASE
        # =====================================================================
        agent_config_result = supabase.table('agents').select(
            'id, name, base_model, rag_enabled, websearch_enabled, tools_enabled, '
            'knowledge_namespaces, confidence_threshold, max_goal_iterations, '
            'hitl_enabled, hitl_safety_level, agent_level_id, metadata'
        ).eq('id', request.agent_id).single().execute()

        if not agent_config_result.data:
            raise HTTPException(
                status_code=404,
                detail=f"Agent {request.agent_id} not found"
            )

        agent_config = agent_config_result.data

        # =====================================================================
        # RESOLVE CONFIGURATION: Request overrides > Agent Config > Defaults
        # =====================================================================
        # For normalized columns, use direct values with fallback to JSONB metadata
        metadata = agent_config.get('metadata') or {}

        # RAG/Tools configuration
        enable_rag = request.enable_rag if request.enable_rag is not None else (
            agent_config.get('rag_enabled') if agent_config.get('rag_enabled') is not None
            else metadata.get('rag_enabled', True)
        )

        enable_tools = request.enable_tools if request.enable_tools is not None else (
            bool(agent_config.get('tools_enabled')) if agent_config.get('tools_enabled')
            else bool(metadata.get('tools_enabled', False))
        )

        websearch_enabled = request.websearch_enabled if request.websearch_enabled is not None else (
            agent_config.get('websearch_enabled') if agent_config.get('websearch_enabled') is not None
            else metadata.get('websearch_enabled', True)
        )

        # Model configuration
        model = request.model or agent_config.get('base_model') or 'gpt-4'

        # Mode 3 specific configuration
        confidence_threshold = request.confidence_threshold if request.confidence_threshold is not None else (
            float(agent_config.get('confidence_threshold') or 0.85)
        )

        max_iterations = request.max_iterations if request.max_iterations is not None else (
            agent_config.get('max_goal_iterations') or 5
        )

        hitl_enabled = request.hitl_enabled if request.hitl_enabled is not None else (
            agent_config.get('hitl_enabled') if agent_config.get('hitl_enabled') is not None
            else True
        )

        hitl_safety_level = request.hitl_safety_level or agent_config.get('hitl_safety_level') or 'balanced'

        # Knowledge namespaces
        knowledge_namespaces = (
            agent_config.get('knowledge_namespaces') or
            metadata.get('knowledge_namespaces') or
            ['KD-general']
        )

        logger.info(
            "mode3_request_received",
            agent_id=request.agent_id,
            agent_name=agent_config.get('name'),
            message_length=len(request.message),
            session_id=request.session_id,
            tenant_id=tenant_id,
            # Resolved configuration
            model=model,
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            websearch_enabled=websearch_enabled,
            max_iterations=max_iterations,
            confidence_threshold=confidence_threshold,
            hitl_enabled=hitl_enabled,
            hitl_safety_level=hitl_safety_level,
            knowledge_namespaces=knowledge_namespaces
        )

        # Initialize workflow with proper Supabase client
        workflow = Mode3ManualAutonomousWorkflow(
            supabase_client=supabase,
            rag_pipeline=None,
            agent_orchestrator=None,
            sub_agent_spawner=None,
            rag_service=None,
            tool_registry=None,
            conversation_manager=None,
            session_memory_service=None
        )

        # Build and compile graph
        graph = workflow.build_graph()
        compiled_graph = graph.compile()

        # Create initial state with resolved configuration
        initial_state = create_initial_state(
            tenant_id=tenant_id,
            mode=WorkflowMode.MODE_3_AUTONOMOUS,
            query=request.message,
            request_id=request_id,
            selected_agents=[request.agent_id],
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            model=model,
            user_id=request.user_id,
            session_id=request.session_id
        )

        # Add Mode 3 specific state (from resolved config)
        initial_state['max_goal_iterations'] = max_iterations
        initial_state['confidence_threshold'] = confidence_threshold
        initial_state['hitl_initialized'] = hitl_enabled
        initial_state['hitl_safety_level'] = hitl_safety_level
        initial_state['websearch_enabled'] = websearch_enabled
        initial_state['knowledge_namespaces'] = knowledge_namespaces
        initial_state['agent_config'] = agent_config  # Pass full config for reference

        # Execute workflow with increased recursion limit for goal loop
        # Goal loop: ~6-8 nodes per iteration x max 5 iterations = 30-40 steps
        result = await compiled_graph.ainvoke(
            initial_state,
            config={"recursion_limit": 100}
        )

        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000

        # Extract results
        content = result.get('response', '') or result.get('agent_response', '') or result.get('final_response', '')
        confidence = result.get('confidence', 0.85)
        sources = result.get('sources', [])
        raw_reasoning_steps = result.get('reasoning_steps', [])

        # Normalize reasoning steps to List[Dict] for Pydantic model
        # ReAct workflow may produce strings or dicts
        reasoning_steps = []
        for idx, step in enumerate(raw_reasoning_steps):
            if isinstance(step, str):
                # Convert string to structured dict
                reasoning_steps.append({
                    "step_number": idx + 1,
                    "type": "reasoning",
                    "content": step,
                    "timestamp": datetime.now().isoformat()
                })
            elif isinstance(step, dict):
                reasoning_steps.append(step)
            else:
                reasoning_steps.append({"step_number": idx + 1, "type": "unknown", "content": str(step)})

        # Build citations from sources
        citations = []
        for idx, source in enumerate(sources, 1):
            citations.append({
                "id": f"citation_{idx}",
                "title": source.get('title', f'Source {idx}'),
                "content": source.get('content', source.get('excerpt', '')),
                "url": source.get('url', ''),
                "similarity_score": source.get('similarity_score', 0.0),
                "metadata": source.get('metadata', {})
            })

        # Autonomous reasoning metadata
        # PREFER pre-computed data from format_output_node, fallback to individual fields
        autonomous_reasoning = result.get('autonomous_reasoning') or {
            "iterations": result.get('goal_loop_iteration', 0),
            "goal_achieved": result.get('goal_achieved', True),
            "loop_status": result.get('loop_status', 'complete'),
            "strategy": result.get('pattern_applied', result.get('reasoning_pattern', 'react')),
            "reasoning_steps": reasoning_steps,
            "tools_used": result.get('tools_executed', []),
            # Use resolved config values (from agent table or request override)
            "confidence_threshold": confidence_threshold,
            "max_iterations": max_iterations,
            "termination_reason": result.get('termination_reason', 'Complete'),
            "hitl_required": hitl_enabled,
            "hitl_safety_level": hitl_safety_level,
            "react_iterations": result.get('react_iterations', 0),
            "plan": result.get('plan', result.get('execution_plan', {})),
            "plan_confidence": result.get('plan_confidence', 0),
            "agent_level_id": agent_config.get('agent_level_id'),
            # Configuration source tracking
            "config_source": {
                "rag_enabled": enable_rag,
                "tools_enabled": enable_tools,
                "websearch_enabled": websearch_enabled,
                "knowledge_namespaces": knowledge_namespaces,
                "model": model
            },
            # Additional data from format_output_node
            "observations": result.get('observations', []),
            "thought_tree": result.get('thought_tree', []),
            "self_reflections": result.get('self_reflections', []),
            "corrections_applied": result.get('corrections_applied', []),
        }

        # HITL checkpoints metadata (from format_output_node)
        hitl_checkpoints = result.get('hitl_checkpoints') or {
            "plan_approved": result.get('plan_approved'),
            "tool_approved": result.get('tool_approved'),
            "subagent_approved": result.get('subagent_approved'),
            "decision_approved": result.get('decision_approved'),
            "final_approved": result.get('final_approved'),
            "approval_timeout": result.get('approval_timeout', False),
            "rejection_reason": result.get('rejection_reason'),
        }

        # Autonomy metadata (from format_output_node)
        autonomy_metadata = result.get('autonomy_metadata') or {
            "autonomy_level": result.get('autonomy_level', 'B'),
            "decomposition_type": result.get('decomposition_type', 'fallback'),
            "task_tree": result.get('task_tree', []),
            "completed_tasks": result.get('completed_tasks', []),
            "pending_tasks": result.get('pending_tasks', []),
            "goal_achieved": result.get('goal_achieved', False),
            "active_l3_agents": result.get('active_l3_agents', 0),
            "active_l4_agents": result.get('active_l4_agents', 0),
        }

        # Agent selection metadata
        agent_selection = {
            "selected_agent_id": request.agent_id,
            "selected_agent_name": result.get('agent_name', result.get('selected_agent_name', 'Selected Agent')),
            "selection_method": "manual",
            "selection_confidence": 1.0,  # Manual selection = 100% confidence
        }

        metadata = {
            "langgraph_execution": True,
            "workflow": "Mode3ManualAutonomousWorkflow",
            "nodes_executed": result.get('nodes_executed', []),
            "model": request.model or "gpt-4",
            "tokens_used": result.get('tokens_used', 0),
            "latency_ms": processing_time_ms,
            "thinking_steps": result.get('thinking_steps', []),
        }

        logger.info(
            "mode3_request_completed",
            agent_id=request.agent_id,
            content_length=len(content),
            confidence=confidence,
            iterations=autonomous_reasoning.get('iterations', 0),
            goal_achieved=autonomous_reasoning.get('goal_achieved', True),
            processing_time_ms=processing_time_ms
        )

        return Mode3Response(
            agent_id=request.agent_id,
            content=content,
            confidence=confidence,
            citations=citations,
            reasoning=reasoning_steps,
            autonomous_reasoning=autonomous_reasoning,
            hitl_checkpoints=hitl_checkpoints,
            autonomy_metadata=autonomy_metadata,
            agent_selection=agent_selection,
            metadata=metadata,
            processing_time_ms=processing_time_ms,
            sources=sources,
            session_id=request.session_id,
            hitl_pending=result.get('hitl_pending', False),
            hitl_checkpoint_type=result.get('current_hitl_checkpoint'),
        )

    except ImportError as e:
        logger.error("mode3_import_error", error=str(e))
        raise HTTPException(
            status_code=503,
            detail=f"Mode 3 workflow not available: {str(e)}"
        )
    except Exception as e:
        logger.error("mode3_execution_error", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Mode 3 execution failed: {str(e)}"
        )


@router.post("/hitl/respond")
async def respond_to_hitl_checkpoint(
    checkpoint_id: str,
    session_id: str,
    decision: str,
    rejection_reason: Optional[str] = None,
    user_id: Optional[str] = None,
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Respond to a HITL checkpoint (approve/reject)

    Used for Mode 3 autonomous workflows when human approval is required.
    """
    logger.info(
        "mode3_hitl_response",
        checkpoint_id=checkpoint_id,
        session_id=session_id,
        decision=decision,
        user_id=user_id,
        tenant_id=tenant_id
    )

    if decision not in ["approved", "rejected", "modify"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid decision. Must be 'approved', 'rejected', or 'modify'"
        )

    return {
        "status": "success",
        "checkpoint_id": checkpoint_id,
        "decision": decision,
        "message": f"Checkpoint {decision} successfully",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health")
async def mode3_health():
    """Health check for Mode 3 workflow"""
    try:
        from langgraph_workflows.mode3_refactored import Mode3ManualAutonomousWorkflow
        return {
            "status": "healthy",
            "workflow": "Mode3ManualAutonomousWorkflow",
            "endpoint": "/api/mode3/autonomous-manual",
            "features": [
                "goal_driven_loop",
                "react_reasoning",
                "hitl_checkpoints",
                "constitutional_ai"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
    except ImportError as e:
        return {
            "status": "degraded",
            "workflow": "not_available",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
