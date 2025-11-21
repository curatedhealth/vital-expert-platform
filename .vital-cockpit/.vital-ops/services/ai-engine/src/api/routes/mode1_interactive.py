"""
Mode 1 Interactive Manual - API Routes

FastAPI endpoints for Mode 1: Interactive Manual (Multi-Turn Conversation)

Endpoints:
- POST /api/mode1/interactive - Execute Mode 1 workflow (multi-turn)
- GET /api/mode1/sessions/{session_id} - Get session details
- DELETE /api/mode1/sessions/{session_id} - End session

Author: VITAL AI Platform Team
Created: 2025-11-18
"""

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import structlog
import json
import asyncio

# Internal imports
from langgraph_workflows.mode1_interactive_manual import Mode1InteractiveManualWorkflow
from langgraph_workflows.state_schemas import create_initial_state, WorkflowMode
from services.agent_orchestrator import AgentOrchestrator
from services.unified_rag_service import UnifiedRAGService
from services.tool_registry import ToolRegistry
from services.sub_agent_spawner import SubAgentSpawner
from services.confidence_calculator import ConfidenceCalculator
from services.compliance_service import ComplianceService, HumanInLoopValidator

logger = structlog.get_logger()

# ============================================================================
# ROUTER
# ============================================================================

router = APIRouter(
    prefix="/api/mode1",
    tags=["Mode 1: Interactive Manual"]
)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class Mode1InteractiveRequest(BaseModel):
    """Request model for Mode 1 Interactive Manual"""
    
    # Required fields
    session_id: Optional[str] = Field(None, description="Session ID (None for new session)")
    agent_id: str = Field(..., description="Selected expert agent ID")
    message: str = Field(..., description="User message/query", min_length=1, max_length=10000)
    tenant_id: str = Field(..., description="Tenant ID for multi-tenancy")
    user_id: str = Field(..., description="User ID")
    
    # Optional settings
    enable_rag: bool = Field(True, description="Enable RAG retrieval")
    enable_tools: bool = Field(False, description="Enable tool execution")
    selected_rag_domains: List[str] = Field(default_factory=list, description="RAG domain filters")
    requested_tools: List[str] = Field(default_factory=list, description="Requested tools")
    conversation_history: List[Dict[str, str]] = Field(default_factory=list, description="Conversation history (for context)")
    
    # Model configuration
    model: str = Field("gpt-4", description="LLM model to use")
    temperature: float = Field(0.7, description="Temperature for generation", ge=0.0, le=2.0)
    max_tokens: int = Field(2000, description="Max tokens to generate", ge=1, le=8000)
    max_results: int = Field(10, description="Max RAG results", ge=1, le=50)
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": None,
                "agent_id": "550e8400-e29b-41d4-a716-446655440000",
                "message": "Can you explain the FDA 510(k) submission process?",
                "tenant_id": "tenant-123",
                "user_id": "user-456",
                "enable_rag": True,
                "enable_tools": False,
                "model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 2000
            }
        }


class Mode1InteractiveResponse(BaseModel):
    """Response model for Mode 1 Interactive Manual"""
    
    session_id: str = Field(..., description="Session ID")
    message_id: str = Field(..., description="Message ID")
    response: str = Field(..., description="Assistant response")
    confidence: float = Field(..., description="Response confidence score", ge=0.0, le=1.0)
    
    # Metadata
    agents_used: List[str] = Field(..., description="Agent IDs used")
    citations: List[Dict[str, Any]] = Field(..., description="Citations")
    artifacts: List[Dict[str, Any]] = Field(..., description="Generated artifacts")
    
    # Session info
    session_info: Dict[str, Any] = Field(..., description="Session metadata")
    
    # Processing metadata
    sources_used: int = Field(..., description="Number of RAG sources used")
    tools_used: int = Field(..., description="Number of tools executed")
    requires_human_review: bool = Field(False, description="Human review required")
    
    # Timing
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")


class SessionInfoResponse(BaseModel):
    """Session information response"""
    
    session_id: str
    tenant_id: str
    user_id: str
    agent_id: str
    mode: str
    status: str
    total_messages: int
    total_tokens: int
    total_cost: float
    created_at: str
    updated_at: str
    ended_at: Optional[str] = None


# ============================================================================
# HELPERS
# ============================================================================

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


async def stream_sse_events(workflow_state: Dict[str, Any]):
    """
    Stream SSE events from workflow execution.
    
    Event types:
    - thinking: Reasoning steps
    - token: Response tokens
    - complete: Final response
    - error: Error occurred
    """
    try:
        # Emit thinking events
        thinking_steps = workflow_state.get('thinking_steps', [])
        for step in thinking_steps:
            event_data = {
                "type": "thinking",
                "data": {
                    "step": step.get('step', ''),
                    "description": step.get('description', ''),
                    "timestamp": step.get('timestamp', '')
                }
            }
            yield f"data: {json.dumps(event_data)}\n\n"
            await asyncio.sleep(0.01)  # Small delay for smoother streaming
        
        # Emit response tokens (chunked)
        response = workflow_state.get('response', '')
        response_chunks = workflow_state.get('response_chunks', [])
        
        if response_chunks:
            for chunk in response_chunks:
                event_data = {
                    "type": "token",
                    "data": {"token": chunk}
                }
                yield f"data: {json.dumps(event_data)}\n\n"
                await asyncio.sleep(0.02)  # Simulate typing
        else:
            # If no chunks, send full response
            event_data = {
                "type": "token",
                "data": {"token": response}
            }
            yield f"data: {json.dumps(event_data)}\n\n"
        
        # Emit complete event
        complete_data = {
            "type": "complete",
            "data": {
                "message_id": workflow_state.get('message_id', ''),
                "content": response,
                "confidence": workflow_state.get('confidence', 0.0),
                "citations": workflow_state.get('citations', []),
                "artifacts": workflow_state.get('artifacts', []),
                "session_info": workflow_state.get('session_info', {}),
                "agents_used": workflow_state.get('agents_used', []),
                "sources_used": workflow_state.get('sources_used', 0),
                "tools_used": workflow_state.get('tools_used', 0),
                "requires_human_review": workflow_state.get('requires_human_review', False),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        yield f"data: {json.dumps(complete_data)}\n\n"
        
        # Send [DONE] marker
        yield "data: [DONE]\n\n"
    
    except Exception as e:
        logger.error("SSE streaming error", error=str(e))
        error_data = {
            "type": "error",
            "data": {
                "message": f"Streaming error: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        yield f"data: {json.dumps(error_data)}\n\n"


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post(
    "/interactive",
    response_class=StreamingResponse,
    summary="Execute Mode 1 Interactive Manual workflow",
    description="""
    Execute Mode 1: Interactive Manual workflow for multi-turn conversation.
    
    **Features:**
    - Multi-turn conversation with context retention
    - Session management (create/load)
    - Expert agent with persona consistency
    - RAG-enhanced responses
    - Tool execution
    - Sub-agent spawning
    - Streaming SSE responses
    - Cost tracking
    
    **Flow:**
    1. Load/create session
    2. Load agent profile
    3. Load conversation history
    4. Process current message (RAG, tools, agent execution)
    5. Stream response
    6. Save to database
    7. Update session metadata
    
    **SSE Event Types:**
    - `thinking`: Reasoning steps
    - `token`: Response tokens
    - `complete`: Final response with metadata
    - `error`: Error occurred
    """,
    responses={
        200: {"description": "Streaming SSE response"},
        400: {"description": "Bad request (validation error)"},
        404: {"description": "Agent or session not found"},
        500: {"description": "Internal server error"}
    }
)
async def execute_mode1_interactive(
    request: Mode1InteractiveRequest,
    req: Request
):
    """
    Execute Mode 1 Interactive Manual workflow.
    
    Returns streaming SSE response with thinking steps, tokens, and final response.
    """
    start_time = time.time()
    
    # Get tenant_id from header if not in body
    tenant_id = request.tenant_id or req.headers.get('x-tenant-id')
    if not tenant_id:
        raise HTTPException(status_code=400, detail="tenant_id required")
    
    logger.info(
        "Mode 1 Interactive request received",
        session_id=request.session_id,
        agent_id=request.agent_id,
        message_length=len(request.message),
        tenant_id=tenant_id,
        enable_rag=request.enable_rag,
        enable_tools=request.enable_tools
    )
    
    try:
        # Initialize Supabase client
        supabase = get_supabase_client()
        
        # Initialize services
        agent_orchestrator = AgentOrchestrator(supabase, rag_pipeline=None)
        rag_service = UnifiedRAGService(supabase)
        tool_registry = ToolRegistry()
        sub_agent_spawner = SubAgentSpawner()
        confidence_calculator = ConfidenceCalculator()
        compliance_service = ComplianceService(supabase)
        human_validator = HumanInLoopValidator()
        
        # Initialize Mode 1 workflow
        workflow = Mode1InteractiveManualWorkflow(
            supabase_client=supabase,
            rag_pipeline=None,
            agent_orchestrator=agent_orchestrator,
            sub_agent_spawner=sub_agent_spawner,
            rag_service=rag_service,
            tool_registry=tool_registry,
            confidence_calculator=confidence_calculator,
            compliance_service=compliance_service,
            human_validator=human_validator
        )
        
        # Build graph
        graph = workflow.build_graph()
        compiled_graph = graph.compile()
        
        # Create initial state
        initial_state = create_initial_state(
            tenant_id=tenant_id,
            mode=WorkflowMode.MODE_1_MANUAL,
            query=request.message,
            selected_agents=[request.agent_id],
            enable_rag=request.enable_rag,
            enable_tools=request.enable_tools,
            selected_rag_domains=request.selected_rag_domains,
            requested_tools=request.requested_tools,
            model=request.model,
            max_results=request.max_results,
            user_id=request.user_id,
            session_id=request.session_id,
        )
        
        # Execute workflow
        logger.info("Executing Mode 1 workflow", session_id=request.session_id)
        final_state = await compiled_graph.ainvoke(initial_state)
        
        # Calculate processing time
        processing_time_ms = (time.time() - start_time) * 1000
        
        # Add processing time to state
        final_state['processing_time_ms'] = processing_time_ms
        final_state['message_id'] = final_state.get('session_id', '') + '_' + str(int(time.time()))
        
        logger.info(
            "Mode 1 workflow completed",
            session_id=final_state.get('session_id'),
            processing_time_ms=processing_time_ms,
            status=final_state.get('status'),
            errors=final_state.get('errors', [])
        )
        
        # Stream SSE response
        return StreamingResponse(
            stream_sse_events(final_state),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )
    
    except Exception as e:
        logger.error("Mode 1 execution failed", error=str(e), exc_info=True)
        
        # Return error as SSE stream
        async def error_stream():
            error_data = {
                "type": "error",
                "data": {
                    "message": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            yield f"data: {json.dumps(error_data)}\n\n"
        
        return StreamingResponse(
            error_stream(),
            media_type="text/event-stream"
        )


@router.get(
    "/sessions/{session_id}",
    response_model=SessionInfoResponse,
    summary="Get session information",
    description="Retrieve session metadata including message count, tokens, and cost"
)
async def get_session_info(
    session_id: str,
    req: Request
):
    """Get session information"""
    
    tenant_id = req.headers.get('x-tenant-id')
    if not tenant_id:
        raise HTTPException(status_code=400, detail="x-tenant-id header required")
    
    try:
        supabase = get_supabase_client()
        
        # Fetch session
        result = supabase.table('ask_expert_sessions') \
            .select('*') \
            .eq('id', session_id) \
            .eq('tenant_id', tenant_id) \
            .single() \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = result.data
        
        return SessionInfoResponse(
            session_id=session['id'],
            tenant_id=session['tenant_id'],
            user_id=session['user_id'],
            agent_id=session['agent_id'],
            mode=session['mode'],
            status=session['status'],
            total_messages=session['total_messages'],
            total_tokens=session['total_tokens'],
            total_cost=float(session['total_cost']),
            created_at=session['created_at'],
            updated_at=session['updated_at'],
            ended_at=session.get('ended_at')
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Session fetch failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Session fetch failed: {str(e)}")


@router.delete(
    "/sessions/{session_id}",
    summary="End session",
    description="Mark session as ended and prevent further messages"
)
async def end_session(
    session_id: str,
    req: Request
):
    """End a conversation session"""
    
    tenant_id = req.headers.get('x-tenant-id')
    if not tenant_id:
        raise HTTPException(status_code=400, detail="x-tenant-id header required")
    
    try:
        supabase = get_supabase_client()
        
        # Update session status
        result = supabase.table('ask_expert_sessions') \
            .update({
                'status': 'ended',
                'ended_at': datetime.utcnow().isoformat()
            }) \
            .eq('id', session_id) \
            .eq('tenant_id', tenant_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        logger.info("Session ended", session_id=session_id)
        
        return {
            "message": "Session ended successfully",
            "session_id": session_id,
            "ended_at": datetime.utcnow().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Session end failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Session end failed: {str(e)}")


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get(
    "/health",
    summary="Health check",
    description="Check if Mode 1 service is healthy"
)
async def health_check():
    """Health check endpoint"""
    return {
        "service": "mode1_interactive_manual",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


