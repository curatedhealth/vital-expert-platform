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
import time
import urllib.parse
import uuid

# Internal imports
from langgraph_workflows.mode1_manual_interactive import Mode1ManualInteractiveWorkflow
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


async def stream_sse_events_realtime(compiled_graph, initial_state: Dict[str, Any]):
    """
    Stream SSE events in REAL-TIME during workflow execution.

    Uses LangGraph's astream() with stream_mode=["updates", "messages"] to get:
    - Node updates as they complete (thinking steps)
    - LLM tokens as they're generated (real streaming)

    Event types (matching frontend expectations):
    - thinking: Reasoning/workflow steps
    - token: Response tokens (content streaming)
    - sources: RAG sources retrieved
    - tool: Tool execution events
    - done: Final response with metadata
    - error: Error occurred
    """
    start_time = time.time()
    final_state = {}
    tokens_count = 0
    full_response = ""
    sources_emitted = False
    agent_name = "AI Assistant"

    # Node name to thinking step mapping
    node_descriptions = {
        "load_or_create_session_node": "Loading session context...",
        "load_agent_profile_node": "Loading expert agent profile...",
        "load_conversation_history_node": "Loading conversation history...",
        "intent_classification_node": "Analyzing query intent...",
        "rag_retrieval_node": "Retrieving relevant knowledge...",
        "analysis_node": "Analyzing context and requirements...",
        "check_tool_requirements_node": "Checking tool requirements...",
        "execute_l5_tools_node": "Executing specialized tools...",
        "execute_expert_agent_node": "Generating expert response...",
        "compliance_check_node": "Running compliance verification...",
        "confidence_calculation_node": "Calculating confidence score...",
        "human_review_check_node": "Checking review requirements...",
        "generate_streaming_response_node": "Preparing response...",
        "save_to_database_node": "Saving conversation...",
        "final_response_node": "Finalizing response..."
    }

    try:
        # Use LangGraph's streaming with multiple modes:
        # - "updates": Get state updates after each node (for thinking steps)
        # - "messages": Get LLM tokens in real-time (for response streaming)
        async for mode, chunk in compiled_graph.astream(
            initial_state,
            stream_mode=["updates", "messages"]
        ):
            if mode == "updates":
                # Node completed - emit thinking step
                for node_name, node_output in chunk.items():
                    # Get human-readable description
                    description = node_descriptions.get(node_name, f"Processing {node_name}...")

                    event_data = {
                        "event": "thinking",
                        "step": node_name,
                        "status": "completed",
                        "message": description
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"

                    # Update final state with node output
                    if isinstance(node_output, dict):
                        final_state.update(node_output)

                        # Extract agent name when available
                        if 'agent_profile' in node_output:
                            agent_profile = node_output['agent_profile']
                            agent_name = agent_profile.get('display_name') or agent_profile.get('name') or agent_name

                        # Emit sources when RAG completes
                        if node_name == "rag_retrieval_node" and not sources_emitted:
                            citations = node_output.get('citations', [])
                            retrieved_docs = node_output.get('retrieved_documents', [])
                            if citations or retrieved_docs:
                                # Helper to generate meaningful URL from document
                                def get_source_url(doc, index):
                                    metadata = doc.get('metadata', {})
                                    # Try various URL sources
                                    url = metadata.get('url') or metadata.get('source_url') or metadata.get('link')
                                    if url and url != '#':
                                        return url
                                    # Generate DOI-based URL if available
                                    doi = metadata.get('doi')
                                    if doi:
                                        return f"https://doi.org/{doi}"
                                    # Generate PubMed URL if PMID available
                                    pmid = metadata.get('pmid') or metadata.get('pubmed_id')
                                    if pmid:
                                        return f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                                    # Use title as search query fallback
                                    title = doc.get('title', '')
                                    if title:
                                        return f"https://scholar.google.com/scholar?q={urllib.parse.quote(title[:100])}"
                                    # Last resort: return unique anchor
                                    return f"#source-{index + 1}"

                                sources_data = {
                                    "event": "sources",
                                    "sources": citations if citations else [
                                        {
                                            'title': doc.get('title', f'Source {i+1}'),
                                            'url': get_source_url(doc, i),
                                            'excerpt': doc.get('content', '')[:200] if doc.get('content') else '',
                                            'relevance_score': doc.get('metadata', {}).get('relevance_score', 0.8)
                                        }
                                        for i, doc in enumerate(retrieved_docs[:10])
                                    ],
                                    "total": len(citations) if citations else len(retrieved_docs)
                                }
                                yield f"data: {json.dumps(sources_data)}\n\n"
                                sources_emitted = True

                        # Emit tool events
                        if node_name == "execute_l5_tools_node":
                            tools_executed = node_output.get('tools_executed', [])
                            for tool in tools_executed:
                                tool_data = {
                                    "event": "tool",
                                    "action": "end",
                                    "tool": tool.get('tool_name', 'unknown'),
                                    "output": str(tool.get('result', ''))[:500]
                                }
                                yield f"data: {json.dumps(tool_data)}\n\n"

            elif mode == "messages":
                # LLM token received - stream it immediately!
                message_chunk, metadata = chunk
                if hasattr(message_chunk, 'content') and message_chunk.content:
                    token = message_chunk.content
                    full_response += token
                    tokens_count += 1

                    event_data = {
                        "event": "token",
                        "content": token,
                        "tokens": tokens_count
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"

        # Calculate final metrics
        processing_time_ms = (time.time() - start_time) * 1000
        tokens_per_second = tokens_count / (processing_time_ms / 1000) if processing_time_ms > 0 else 0

        # Get final values from state
        citations = final_state.get('citations', [])

        # Get AI reasoning (actual LLM thinking process)
        ai_reasoning = final_state.get('ai_reasoning', '')
        l5_tools_used = final_state.get('l5_tools_used', [])

        # Build reasoning text: prioritize actual AI reasoning over workflow steps
        reasoning_text = ai_reasoning  # The actual AI's thinking process

        # If no AI reasoning was captured, fall back to workflow steps
        if not reasoning_text:
            reasoning_parts = []
            thinking_steps = final_state.get('thinking_steps', [])
            if thinking_steps:
                for step in thinking_steps:
                    desc = step.get('description', step.get('message', ''))
                    if desc:
                        reasoning_parts.append(desc)
            else:
                # Generate reasoning from workflow execution
                if final_state.get('session_id'):
                    reasoning_parts.append("Session context loaded")
                if final_state.get('agent_profile'):
                    reasoning_parts.append(f"Expert agent '{agent_name}' loaded")
                if final_state.get('conversation_history'):
                    reasoning_parts.append(f"Loaded {len(final_state.get('conversation_history', []))} previous messages")
                if citations or final_state.get('retrieved_documents'):
                    doc_count = len(citations) or len(final_state.get('retrieved_documents', []))
                    reasoning_parts.append(f"Retrieved {doc_count} relevant sources")
                if l5_tools_used:
                    reasoning_parts.append(f"Used tools: {', '.join(l5_tools_used)}")
                reasoning_parts.append("Generated response from AI model")
            reasoning_text = "\n• ".join(reasoning_parts) if reasoning_parts else ""

        # Build legacy reasoning array for backwards compatibility
        reasoning = []
        if reasoning_text:
            reasoning.append({
                "step": "ai_thinking",
                "content": reasoning_text,
                "status": "completed"
            })

        # Emit done event
        done_data = {
            "event": "done",
            "agent_id": final_state.get('current_agent_id', ''),
            "agent_name": agent_name,
            "content": full_response,  # Full response content for frontend display
            "confidence": final_state.get('confidence', 0.85),
            "sources": citations,
            "citations": citations,
            "reasoning": reasoning,  # Reasoning steps for transparency
            "response_source": "llm",
            "metrics": {
                "processing_time_ms": round(processing_time_ms, 2),
                "tokens_generated": tokens_count,
                "tokens_per_second": round(tokens_per_second, 2)
            },
            "metadata": {
                "request_id": final_state.get('session_id', '') + '_' + str(int(time.time())),
                "model": "gpt-4",
                "enable_rag": True,
                "enable_tools": final_state.get('tools_used', 0) > 0,
                "session_id": final_state.get('session_id', ''),
                "message_id": final_state.get('session_id', '') + '_' + str(int(time.time())),
                "agents_used": final_state.get('agents_used', []),
                "tools_used": final_state.get('tools_used', 0),
                "sources_used": final_state.get('sources_used', 0),
                "requires_human_review": final_state.get('requires_human_review', False),
                "l5_tools_used": final_state.get('l5_tools_used', []),
                "sub_agents_spawned": final_state.get('sub_agents_spawned', []),
                "response_source": "llm"
            }
        }
        yield f"data: {json.dumps(done_data)}\n\n"
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error("Real-time SSE streaming error", error=str(e), exc_info=True)
        error_data = {
            "event": "error",
            "message": f"Streaming error: {str(e)}",
            "code": "STREAMING_ERROR"
        }
        yield f"data: {json.dumps(error_data)}\n\n"


async def stream_sse_events(workflow_state: Dict[str, Any]):
    """
    [LEGACY] Stream SSE events from completed workflow state.

    This is the post-hoc streaming function - kept for fallback.
    For real-time streaming, use stream_sse_events_realtime() instead.

    Event types (matching frontend expectations):
    - thinking: Reasoning/workflow steps
    - token: Response tokens (content streaming)
    - sources: RAG sources retrieved
    - tool: Tool execution events
    - done: Final response with metadata
    - error: Error occurred
    """
    try:
        # Get agent info for done event
        agent_profile = workflow_state.get('agent_profile', {})
        agent_name = agent_profile.get('display_name') or agent_profile.get('name') or 'AI Assistant'

        # Emit thinking events (reasoning steps)
        thinking_steps = workflow_state.get('thinking_steps', [])
        for step in thinking_steps:
            event_data = {
                "event": "thinking",
                "step": step.get('step', ''),
                "status": step.get('status', 'completed'),
                "message": step.get('description', '')
            }
            yield f"data: {json.dumps(event_data)}\n\n"
            await asyncio.sleep(0.01)  # Small delay for smoother streaming

        # Emit sources event if RAG retrieved documents
        citations = workflow_state.get('citations', [])
        retrieved_docs = workflow_state.get('retrieved_documents', [])
        if citations or retrieved_docs:
            sources_data = {
                "event": "sources",
                "sources": citations if citations else [
                    {
                        'title': doc.get('title', 'Source'),
                        'url': doc.get('metadata', {}).get('url', '#'),
                        'excerpt': doc.get('content', '')[:200] if doc.get('content') else '',
                        'relevance_score': doc.get('metadata', {}).get('relevance_score', 0.8)
                    }
                    for doc in retrieved_docs[:10]  # Max 10 sources
                ],
                "total": len(citations) if citations else len(retrieved_docs)
            }
            yield f"data: {json.dumps(sources_data)}\n\n"
            await asyncio.sleep(0.01)

        # Emit tool execution events
        tools_executed = workflow_state.get('tools_executed', [])
        for tool in tools_executed:
            tool_data = {
                "event": "tool",
                "action": "end",
                "tool": tool.get('tool_name', 'unknown'),
                "output": str(tool.get('result', ''))[:500]  # Truncate large outputs
            }
            yield f"data: {json.dumps(tool_data)}\n\n"
            await asyncio.sleep(0.01)

        # Emit response tokens (chunked for streaming effect)
        response = workflow_state.get('response', '')
        response_chunks = workflow_state.get('response_chunks', [])

        tokens_count = 0
        if response_chunks:
            for chunk in response_chunks:
                tokens_count += len(chunk.split())
                event_data = {
                    "event": "token",
                    "content": chunk,
                    "tokens": tokens_count
                }
                yield f"data: {json.dumps(event_data)}\n\n"
                await asyncio.sleep(0.02)  # Simulate typing
        else:
            # If no chunks, send full response as single token event
            tokens_count = len(response.split())
            event_data = {
                "event": "token",
                "content": response,
                "tokens": tokens_count
            }
            yield f"data: {json.dumps(event_data)}\n\n"

        # Calculate processing metrics
        processing_time_ms = workflow_state.get('processing_time_ms', 0)
        tokens_per_second = tokens_count / (processing_time_ms / 1000) if processing_time_ms > 0 else 0

        # Emit done event (final metadata - format matches frontend expectations)
        done_data = {
            "event": "done",
            "agent_id": workflow_state.get('current_agent_id', ''),
            "agent_name": agent_name,
            "confidence": workflow_state.get('confidence', 0.85),
            "sources": citations,
            "citations": citations,
            "response_source": "llm",  # Source clarity indicator
            "metrics": {
                "processing_time_ms": processing_time_ms,
                "tokens_generated": tokens_count,
                "tokens_per_second": round(tokens_per_second, 2)
            },
            "metadata": {
                "session_id": workflow_state.get('session_id', ''),
                "message_id": workflow_state.get('message_id', ''),
                "agents_used": workflow_state.get('agents_used', []),
                "tools_used": workflow_state.get('tools_used', 0),
                "sources_used": workflow_state.get('sources_used', 0),
                "requires_human_review": workflow_state.get('requires_human_review', False),
                "l5_tools_used": workflow_state.get('l5_tools_used', []),
                "sub_agents_spawned": workflow_state.get('sub_agents_spawned', [])
            }
        }
        yield f"data: {json.dumps(done_data)}\n\n"

        # Send [DONE] marker for compatibility
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error("SSE streaming error", error=str(e))
        error_data = {
            "event": "error",
            "message": f"Streaming error: {str(e)}",
            "code": "STREAMING_ERROR"
        }
        yield f"data: {json.dumps(error_data)}\n\n"


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post(
    "/interactive-manual",
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
        # Note: AgentOrchestrator takes rag_service, not rag_pipeline
        agent_orchestrator = AgentOrchestrator(supabase, rag_service=None)
        rag_service = UnifiedRAGService(supabase)
        tool_registry = ToolRegistry()
        sub_agent_spawner = SubAgentSpawner()
        confidence_calculator = ConfidenceCalculator()
        compliance_service = ComplianceService(supabase)
        human_validator = HumanInLoopValidator()
        
        # Initialize Mode 1 workflow
        workflow = Mode1ManualInteractiveWorkflow(
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
        # Generate unique request_id for this execution
        request_id = str(uuid.uuid4())

        initial_state = create_initial_state(
            tenant_id=tenant_id,
            mode=WorkflowMode.MODE_1_MANUAL,
            query=request.message,
            request_id=request_id,  # Required by create_initial_state
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

        # Use REAL-TIME streaming instead of batch execution
        # This streams SSE events as the workflow executes:
        # - Node updates → thinking events
        # - LLM tokens → token events (real-time!)
        logger.info("Executing Mode 1 workflow with REAL-TIME streaming", session_id=request.session_id)

        return StreamingResponse(
            stream_sse_events_realtime(compiled_graph, initial_state),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )
    
    except Exception as e:
        logger.error("Mode 1 execution failed", error=str(e), exc_info=True)

        # Capture error message before defining generator (Python scoping fix)
        error_message = str(e)

        # Return error as SSE stream
        async def error_stream():
            error_data = {
                "type": "error",
                "data": {
                    "message": error_message,
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


