# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2]
# DEPENDENCIES: [langgraph_workflows.ask_expert, services.graphrag_selector, core.security, core.resilience, streaming.token_streamer]
"""
Ask Expert Interactive API Routes - Mode 1 & Mode 2 (Consultations)

This module handles multi-turn consultation management:
- POST /ask-expert/consultations                   -> Create consultation
- POST /ask-expert/consultations/{id}/messages/stream -> Stream message
- GET  /ask-expert/consultations/{id}/messages     -> Get messages
- GET  /ask-expert/consultations                   -> List consultations
- POST /ask-expert/agents/select                   -> Auto-select agent (Mode 2)
- POST /ask-expert/query/auto                      -> Auto-query with selection (Mode 2)

Mode 1 vs Mode 2 difference:
- Mode 1: agent_id provided (manual expert selection)
- Mode 2: agent_id absent (auto-selection via GraphRAG)

For single-turn streaming, use /api/expert/interactive endpoint.

Uses Gold Standard schema tables:
- expert_consultations: 1:1 AI consultant conversations
- expert_messages: Conversation messages with full metadata

Security Hardening (December 11, 2025):
- Input sanitization for SQL injection/XSS prevention
- Tenant isolation enforcement
- Error sanitization to prevent internal error exposure
- Rate limiting support
"""

from typing import Any, Dict, List, Optional
import json
import structlog
import time
import uuid
import traceback

from fastapi import APIRouter, Depends, Header, Query, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

from api.sse import SSEEventTransformer, transform_and_format
from core.security import InputSanitizer, ErrorSanitizer, TenantIsolation, check_rate_limit_or_raise
from core.resilience import retry_with_backoff, CircuitOpenError, CircuitBreaker, CircuitBreakerConfig
from streaming.token_streamer import stream_with_context

# Initialize circuit breakers for LLM providers
LLM_CIRCUIT_BREAKER = CircuitBreaker(
    "ask_expert_llm",
    CircuitBreakerConfig(
        failure_threshold=5,  # Open after 5 failures
        recovery_timeout=30.0,  # Try recovery after 30 seconds
        half_open_max_calls=3,  # Allow 3 test calls
        success_threshold=2,  # Need 2 successes to close
    )
)

logger = structlog.get_logger()

router = APIRouter(prefix="/ask-expert", tags=["ask-expert-interactive"])


# ============================================================================
# Request/Response Models
# ============================================================================

class CreateConsultationRequest(BaseModel):
    """Create a new expert consultation session (Gold Standard: expert_consultations)."""
    agent_id: str = Field(..., description="The agent/expert ID to converse with")
    persona_id: Optional[str] = Field(None, description="User acting as this persona")
    jtbd_id: Optional[str] = Field(None, description="Job context")
    title: Optional[str] = Field(None, description="Optional consultation title")
    initial_query: Optional[str] = Field(None, description="Initial query that started the consultation")
    enable_streaming: bool = Field(True, description="Enable streaming responses")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CreateConsultationResponse(BaseModel):
    """Response when creating a consultation."""
    consultation_id: str
    agent_id: str
    user_id: Optional[str] = None
    title: Optional[str] = None
    status: str = "active"
    created_at: str


class StreamMessageRequest(BaseModel):
    """Request to stream a message in a conversation."""
    message: str = Field(..., min_length=1, max_length=10000)
    enable_rag: bool = Field(True, description="Enable RAG retrieval")
    enable_tools: bool = Field(False, description="Enable tool execution")
    selected_rag_domains: List[str] = Field(default_factory=list)
    requested_tools: List[str] = Field(default_factory=list)
    model: Optional[str] = Field(None, description="Override LLM model")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=8000)


class AgentSelectRequest(BaseModel):
    """Request for auto-selecting an agent (Mode 2)."""
    query: str = Field(..., min_length=1, max_length=5000)
    top_k: int = Field(3, ge=1, le=10)
    filters: Dict[str, Any] = Field(default_factory=dict)


class AutoQueryRequest(BaseModel):
    """Request for auto-query with agent selection (Mode 2 combined)."""
    message: str = Field(..., min_length=1, max_length=10000)
    enable_rag: bool = Field(True)
    enable_tools: bool = Field(False)
    selected_rag_domains: List[str] = Field(default_factory=list)
    auto_select_options: Dict[str, Any] = Field(default_factory=dict)


class MessageResponse(BaseModel):
    """A single message in a consultation (Gold Standard: expert_messages)."""
    id: str
    consultation_id: str
    role: str  # 'user' or 'assistant'
    content: str
    message_index: int
    model_used: Optional[str] = None
    total_tokens: Optional[int] = None
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str


# ============================================================================
# Helper Functions
# ============================================================================

# Singleton Supabase client for connection pooling
_supabase_client = None
_supabase_client_lock = None

def get_supabase_client():
    """
    Get Supabase client with connection pooling (singleton pattern).

    This ensures we don't create a new client per request, preventing
    connection exhaustion under load.
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
    logger.info("supabase_client_initialized", url=supabase_url[:30] + "...")

    return _supabase_client


def validate_and_sanitize_tenant(x_tenant_id: Optional[str]) -> str:
    """
    Validate and sanitize tenant ID.

    Raises HTTPException if tenant ID is invalid.
    """
    if not x_tenant_id:
        raise HTTPException(status_code=403, detail="Tenant ID required")

    try:
        return TenantIsolation.validate_tenant_id(x_tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


# ============================================================================
# Consultation Management Routes (Gold Standard: expert_consultations)
# ============================================================================

@router.post("/consultations", response_model=CreateConsultationResponse)
async def create_consultation(
    request: CreateConsultationRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Create a new expert consultation session.

    Uses Gold Standard schema table: expert_consultations
    This initializes a 1:1 AI consultant conversation that can be used for
    subsequent message streaming.

    Security Features:
    - Input sanitization for all user-provided fields
    - Tenant validation
    - Error sanitization
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # --- SECURITY: Validate tenant ---
        validated_tenant = validate_and_sanitize_tenant(x_tenant_id)

        # --- SECURITY: Sanitize inputs ---
        sanitized_agent_id = InputSanitizer.sanitize_uuid(request.agent_id)
        if not sanitized_agent_id:
            raise HTTPException(status_code=400, detail="Invalid agent ID format")

        sanitized_persona_id = InputSanitizer.sanitize_uuid(request.persona_id) if request.persona_id else None
        sanitized_jtbd_id = InputSanitizer.sanitize_uuid(request.jtbd_id) if request.jtbd_id else None
        sanitized_title = InputSanitizer.sanitize_text(request.title, max_length=200) if request.title else None
        sanitized_query = InputSanitizer.sanitize_text(request.initial_query, max_length=10000) if request.initial_query else None
        sanitized_metadata = InputSanitizer.sanitize_json(request.metadata) if request.metadata else {}

        supabase = get_supabase_client()

        consultation_id = str(uuid.uuid4())
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Insert into expert_consultations table (Gold Standard schema)
        consultation_data = {
            "id": consultation_id,
            "tenant_id": validated_tenant,
            "user_id": x_user_id,
            "agent_id": sanitized_agent_id,
            "persona_id": sanitized_persona_id,
            "jtbd_id": sanitized_jtbd_id,
            "title": sanitized_title or f"Consultation {consultation_id[:8]}",
            "initial_query": sanitized_query,
            "status": "active",
            "enable_streaming": request.enable_streaming,
            "message_count": 0,
            "total_tokens_used": 0,
            "total_cost_usd": 0.0,
            "metadata": sanitized_metadata,
            "started_at": now,
            "last_message_at": now,
            "created_at": now,
            "updated_at": now,
        }

        result = supabase.table("expert_consultations").insert(consultation_data).execute()

        if result.data:
            return CreateConsultationResponse(
                consultation_id=consultation_id,
                agent_id=sanitized_agent_id,
                user_id=x_user_id,
                title=sanitized_title,
                status="active",
                created_at=now,
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to create consultation")

    except HTTPException:
        raise
    except Exception as e:
        sanitized_error, ref_id = ErrorSanitizer.sanitize_error(e, 'database')
        logger.error("create_consultation_error", error=str(e), correlation_id=correlation_id, reference_id=ref_id)
        raise HTTPException(status_code=500, detail=sanitized_error)


# Legacy alias for backwards compatibility
@router.post("/conversations", response_model=CreateConsultationResponse, include_in_schema=False)
async def create_conversation_legacy(
    request: CreateConsultationRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """Legacy alias - redirects to create_consultation."""
    return await create_consultation(request, x_tenant_id, x_user_id)


@router.get("/consultations")
async def list_consultations(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None, description="Filter by status: active, ended, archived"),
    agent_id: Optional[str] = Query(None, description="Filter by agent ID"),
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    List expert consultations for the current user.

    Uses Gold Standard schema table: expert_consultations

    Security Features:
    - Tenant isolation enforcement
    - Input sanitization for filter parameters
    - Error sanitization
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # --- SECURITY: Validate tenant (required for listing) ---
        validated_tenant = validate_and_sanitize_tenant(x_tenant_id)

        # --- SECURITY: Sanitize filter parameters ---
        sanitized_status = InputSanitizer.sanitize_identifier(status, max_length=20) if status else None
        sanitized_agent_id = InputSanitizer.sanitize_uuid(agent_id) if agent_id else None

        supabase = get_supabase_client()

        query = supabase.table("expert_consultations").select("*").is_("deleted_at", "null")

        # Filter by tenant (MANDATORY for tenant isolation)
        query = query.eq("tenant_id", validated_tenant)

        # Filter by user
        if x_user_id:
            query = query.eq("user_id", x_user_id)
        # Filter by status
        if sanitized_status:
            query = query.eq("status", sanitized_status)
        # Filter by agent
        if sanitized_agent_id:
            query = query.eq("agent_id", sanitized_agent_id)

        query = query.order("last_message_at", desc=True).range(offset, offset + limit - 1)

        result = query.execute()

        return {
            "consultations": result.data or [],
            "total": len(result.data) if result.data else 0,
            "limit": limit,
            "offset": offset,
        }

    except HTTPException:
        raise
    except Exception as e:
        sanitized_error, ref_id = ErrorSanitizer.sanitize_error(e, 'database')
        logger.error("list_consultations_error", error=str(e), correlation_id=correlation_id, reference_id=ref_id)
        raise HTTPException(status_code=500, detail=sanitized_error)


# Legacy alias for backwards compatibility
@router.get("/conversations", include_in_schema=False)
async def list_conversations_legacy(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    agent_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """Legacy alias - redirects to list_consultations."""
    return await list_consultations(limit, offset, status, agent_id, x_tenant_id, x_user_id)


@router.get("/consultations/{consultation_id}/messages")
async def get_consultation_messages(
    consultation_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Get messages for a specific consultation.

    Uses Gold Standard schema table: expert_messages

    Security Features:
    - Input sanitization for consultation_id
    - Tenant isolation enforcement
    - User access verification
    - Error sanitization
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # --- SECURITY: Validate tenant ---
        validated_tenant = validate_and_sanitize_tenant(x_tenant_id)

        # --- SECURITY: Sanitize consultation_id ---
        sanitized_consultation_id = InputSanitizer.sanitize_uuid(consultation_id)
        if not sanitized_consultation_id:
            raise HTTPException(status_code=400, detail="Invalid consultation ID format")

        supabase = get_supabase_client()

        # First verify consultation exists and user has access
        consultation_result = (
            supabase.table("expert_consultations")
            .select("id, user_id, tenant_id, agent_id, message_count")
            .eq("id", sanitized_consultation_id)
            .is_("deleted_at", "null")
            .single()
            .execute()
        )

        if not consultation_result.data:
            raise HTTPException(status_code=404, detail="Consultation not found")

        # --- SECURITY: Verify tenant isolation ---
        try:
            TenantIsolation.validate_tenant_access(
                resource_tenant_id=consultation_result.data.get("tenant_id"),
                request_tenant_id=validated_tenant,
                resource_name="consultation",
            )
        except PermissionError:
            raise HTTPException(status_code=403, detail="Access denied")

        # Verify access by user_id
        if x_user_id and consultation_result.data.get("user_id") != x_user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Get messages from expert_messages table (Gold Standard)
        messages_result = (
            supabase.table("expert_messages")
            .select("*")
            .eq("consultation_id", sanitized_consultation_id)
            .order("message_index", desc=False)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return {
            "messages": messages_result.data or [],
            "consultation_id": sanitized_consultation_id,
            "agent_id": consultation_result.data.get("agent_id"),
            "message_count": consultation_result.data.get("message_count", 0),
            "limit": limit,
            "offset": offset,
        }

    except HTTPException:
        raise
    except Exception as e:
        sanitized_error, ref_id = ErrorSanitizer.sanitize_error(e, 'database')
        logger.error("get_messages_error", error=str(e), consultation_id=consultation_id, correlation_id=correlation_id, reference_id=ref_id)
        raise HTTPException(status_code=500, detail=sanitized_error)


# Legacy alias for backwards compatibility
@router.get("/conversations/{conversation_id}/messages", include_in_schema=False)
async def get_conversation_messages_legacy(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """Legacy alias - redirects to get_consultation_messages."""
    return await get_consultation_messages(conversation_id, limit, offset, x_tenant_id, x_user_id)


# ============================================================================
# Streaming Message Route (Mode 1) - Gold Standard: expert_messages
# ============================================================================

@router.post("/consultations/{consultation_id}/messages/stream")
async def stream_consultation_message(
    consultation_id: str,
    request: StreamMessageRequest,
    req: Request,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Stream a message response in a consultation (Mode 1).

    Uses Gold Standard schema tables:
    - expert_consultations: Consultation session
    - expert_messages: Message storage with full metadata

    Security Features:
    - Input sanitization (SQL injection/XSS prevention)
    - Tenant isolation verification
    - Error sanitization (no internal error exposure)
    - Correlation IDs for debugging

    This endpoint:
    1. Validates and sanitizes inputs
    2. Validates the consultation exists with tenant isolation
    3. Saves the sanitized user message to expert_messages
    4. Streams the assistant response with Anthropic-style SSE events
    5. Saves the assistant response to expert_messages

    SSE Events emitted:
    - message_start: Beginning of response
    - content_block_start: Start of content block
    - content_block_delta: Token chunks (type: text_delta)
    - content_block_delta: Thinking chunks (type: thinking_delta)
    - source_found: When sources are retrieved
    - tool_use: When tools are invoked
    - tool_result: Tool results
    - content_block_stop: End of content block
    - message_stop: End of response
    - error: On failure (with reference_id for support)
    """
    # Generate correlation ID for error tracking
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # --- RESILIENCE: Check circuit breaker ---
        if LLM_CIRCUIT_BREAKER.is_open:
            logger.warning("circuit_breaker_open", endpoint="stream_consultation_message", correlation_id=correlation_id)
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable. Please try again later.",
                headers={"Retry-After": "30"},
            )

        # --- SECURITY: Rate limiting ---
        # Use tenant_id or user_id as identifier for rate limiting
        rate_limit_id = x_tenant_id or x_user_id or "anonymous"
        check_rate_limit_or_raise(rate_limit_id, endpoint="stream_consultation_message")

        # --- SECURITY: Validate and sanitize inputs ---
        # Sanitize consultation_id (UUID format)
        sanitized_consultation_id = InputSanitizer.sanitize_uuid(consultation_id)
        if not sanitized_consultation_id:
            raise HTTPException(status_code=400, detail="Invalid consultation ID format")

        # Sanitize user message (prevent SQL injection/XSS)
        sanitized_message = InputSanitizer.sanitize_text(
            request.message,
            max_length=10000,
            allow_html=False,
            strip_sql=True,
        )
        if not sanitized_message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty after sanitization")

        supabase = get_supabase_client()

        # Verify consultation exists (Gold Standard: expert_consultations)
        consultation_result = (
            supabase.table("expert_consultations")
            .select("id, agent_id, tenant_id, user_id, message_count, total_tokens_used, total_cost_usd")
            .eq("id", sanitized_consultation_id)
            .is_("deleted_at", "null")
            .single()
            .execute()
        )

        if not consultation_result.data:
            raise HTTPException(status_code=404, detail="Consultation not found")

        consultation = consultation_result.data
        agent_id = consultation.get("agent_id")
        current_message_count = consultation.get("message_count", 0)

        # --- SECURITY: Verify tenant isolation ---
        resource_tenant = consultation.get("tenant_id")
        try:
            TenantIsolation.validate_tenant_access(
                resource_tenant_id=resource_tenant,
                request_tenant_id=x_tenant_id,
                resource_name="consultation",
            )
        except PermissionError:
            raise HTTPException(status_code=403, detail="Access denied")

        async def stream_generator():
            transformer = SSEEventTransformer()

            try:
                # Import unified workflow factory (Mode 1 - MANUAL agent selection)
                # Reference: ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md
                from langgraph_workflows.ask_expert import create_mode1_workflow
                from langgraph_workflows.state_schemas import create_initial_state, WorkflowMode
                from services.agent_orchestrator import AgentOrchestrator
                from services.unified_rag_service import UnifiedRAGService

                # Initialize services
                agent_orchestrator = AgentOrchestrator(supabase, rag_service=None)
                rag_service = UnifiedRAGService(supabase)

                # Create Mode 1 workflow using unified factory
                # Mode 1 = Interactive + MANUAL agent selection
                workflow = create_mode1_workflow(
                    supabase_client=supabase,
                    rag_service=rag_service,
                    agent_orchestrator=agent_orchestrator,
                )

                graph = workflow.build_graph()
                compiled_graph = graph.compile()

                initial_state = create_initial_state(
                    tenant_id=x_tenant_id or consultation.get("tenant_id"),
                    mode=WorkflowMode.MODE_1_MANUAL,
                    query=sanitized_message,  # Use sanitized message
                    request_id=str(uuid.uuid4()),
                    selected_agents=[agent_id],
                    enable_rag=request.enable_rag,
                    enable_tools=request.enable_tools,
                    selected_rag_domains=request.selected_rag_domains,
                    requested_tools=request.requested_tools,
                    user_id=x_user_id or consultation.get("user_id") or "anonymous",
                    session_id=sanitized_consultation_id,  # Use sanitized ID
                    user_override_model=request.model,
                    user_override_temperature=request.temperature,
                    user_override_max_tokens=request.max_tokens,
                )

                full_response = ""
                total_tokens = 0
                cost_usd = 0.0
                collected_citations = []

                # Run workflow and transform events
                async for chunk in compiled_graph.astream(initial_state):
                    for node_name, node_output in chunk.items():
                        # Transform internal events to frontend format
                        if isinstance(node_output, dict):
                            # Handle different node types
                            if node_name in ["thinking", "analyze"]:
                                sse_text = transform_and_format("thinking", {
                                    "content": node_output.get("thinking", node_output.get("analysis", "")),
                                    "node": node_name,
                                }, transformer)
                                yield sse_text

                            elif node_name == "rag_retrieval":
                                docs = node_output.get("retrieved_documents", [])
                                if docs:
                                    sse_text = transform_and_format("sources", {
                                        "sources": [
                                            {
                                                "id": f"src_{i}",
                                                "title": doc.get("title", f"Source {i+1}"),
                                                "url": doc.get("metadata", {}).get("url"),
                                                "relevance_score": doc.get("metadata", {}).get("relevance_score", 0.8),
                                            }
                                            for i, doc in enumerate(docs[:10])
                                        ]
                                    }, transformer)
                                    yield sse_text

                            # NEW: Real token streaming via llm_streaming_config handoff
                            elif "llm_streaming_config" in node_output:
                                llm_config = node_output["llm_streaming_config"]
                                logger.info(
                                    "real_token_streaming_started",
                                    provider=llm_config.get("provider"),
                                    model=llm_config.get("model"),
                                    consultation_id=sanitized_consultation_id,
                                )

                                # Emit thinking_start event for Glass Box UI
                                sse_text = transform_and_format("thinking_start", {
                                    "agent_id": sanitized_agent_id,
                                    "step": "generating_response",
                                }, transformer)
                                yield sse_text

                                # Stream real tokens from LLM using stream_with_context
                                token_count = 0
                                try:
                                    async for token_text, token_idx in stream_with_context(llm_config):
                                        if token_text:
                                            full_response += token_text
                                            token_count += 1
                                            # Emit real token event (match frontend TokenEvent interface)
                                            sse_text = transform_and_format("token", {
                                                "content": token_text,
                                                "tokenIndex": token_idx,
                                            }, transformer)
                                            yield sse_text
                                except Exception as stream_err:
                                    logger.error(
                                        "real_token_streaming_error",
                                        error=str(stream_err),
                                        consultation_id=sanitized_consultation_id,
                                    )
                                    # Fallback: emit partial response as single chunk
                                    if full_response:
                                        sse_text = transform_and_format("token", {
                                            "text": "[Streaming interrupted]",
                                        }, transformer)
                                        yield sse_text

                                # Emit thinking_end event
                                sse_text = transform_and_format("thinking_end", {
                                    "agent_id": sanitized_agent_id,
                                    "step": "generating_response",
                                }, transformer)
                                yield sse_text

                                total_tokens = token_count
                                logger.info(
                                    "real_token_streaming_completed",
                                    tokens_streamed=token_count,
                                    consultation_id=sanitized_consultation_id,
                                )

                                # Handle citations from the config
                                citations = node_output.get("citations", [])
                                if citations:
                                    collected_citations.extend(citations)
                                    sse_text = transform_and_format("citations", {
                                        "citations": citations,
                                    }, transformer)
                                    yield sse_text

                            elif "response" in node_output or "content" in node_output:
                                # Fallback: Token streaming for legacy node outputs (without llm_streaming_config)
                                content = node_output.get("response") or node_output.get("content", "")
                                if content:
                                    full_response += content
                                    sse_text = transform_and_format("token", {
                                        "text": content,
                                    }, transformer)
                                    yield sse_text

                # Emit completion
                sse_text = transform_and_format("done", {
                    "stop_reason": "end_turn",
                }, transformer)
                yield sse_text

                # Save messages to database (Gold Standard: expert_messages)
                now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                user_message_index = current_message_count
                assistant_message_index = current_message_count + 1

                # Save user message to expert_messages (use sanitized content)
                supabase.table("expert_messages").insert({
                    "id": str(uuid.uuid4()),
                    "consultation_id": sanitized_consultation_id,
                    "role": "user",
                    "content": sanitized_message,  # Use sanitized message
                    "message_index": user_message_index,
                    "created_at": now,
                }).execute()

                # Save assistant message to expert_messages with full metadata
                supabase.table("expert_messages").insert({
                    "id": str(uuid.uuid4()),
                    "consultation_id": sanitized_consultation_id,
                    "role": "assistant",
                    "content": full_response,
                    "message_index": assistant_message_index,
                    "model_used": request.model,
                    "total_tokens": total_tokens,
                    "cost_usd": cost_usd,
                    "citations": json.dumps(collected_citations) if collected_citations else "[]",
                    "metadata": json.dumps({"rag_enabled": request.enable_rag, "tools_enabled": request.enable_tools}),
                    "created_at": now,
                }).execute()

                # Update consultation metadata (Gold Standard: expert_consultations)
                supabase.table("expert_consultations").update({
                    "message_count": assistant_message_index + 1,
                    "total_tokens_used": (consultation.get("total_tokens_used", 0) or 0) + total_tokens,
                    "total_cost_usd": (consultation.get("total_cost_usd", 0) or 0) + cost_usd,
                    "last_message_at": now,
                    "updated_at": now,
                }).eq("id", sanitized_consultation_id).execute()

            except Exception as e:
                # --- RESILIENCE: Record failure for circuit breaker ---
                import asyncio
                asyncio.create_task(LLM_CIRCUIT_BREAKER._record_failure())

                # --- SECURITY: Sanitize error for client exposure ---
                sanitized_error, ref_id = ErrorSanitizer.sanitize_error(
                    error=e,
                    error_type='internal',
                    include_reference_id=True,
                )
                logger.error(
                    "stream_error",
                    error=str(e),
                    consultation_id=sanitized_consultation_id,
                    correlation_id=correlation_id,
                    reference_id=ref_id,
                    traceback=traceback.format_exc(),
                )
                yield f"event: error\ndata: {json.dumps({'error': sanitized_error, 'reference_id': ref_id})}\n\n"

        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
                "X-Correlation-ID": correlation_id,  # For debugging
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        # --- RESILIENCE: Record failure for circuit breaker ---
        import asyncio
        asyncio.create_task(LLM_CIRCUIT_BREAKER._record_failure())

        # --- SECURITY: Sanitize error for client exposure ---
        sanitized_error, ref_id = ErrorSanitizer.sanitize_error(
            error=e,
            error_type='internal',
            include_reference_id=True,
        )
        logger.error(
            "stream_message_error",
            error=str(e),
            correlation_id=correlation_id,
            reference_id=ref_id,
        )
        raise HTTPException(status_code=500, detail=sanitized_error)


# Legacy alias for backwards compatibility
@router.post("/conversations/{conversation_id}/messages/stream", include_in_schema=False)
async def stream_conversation_message_legacy(
    conversation_id: str,
    request: StreamMessageRequest,
    req: Request,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """Legacy alias - redirects to stream_consultation_message."""
    return await stream_consultation_message(conversation_id, request, req, x_tenant_id, x_user_id)


# ============================================================================
# Agent Selection Routes (Mode 2)
# ============================================================================

@router.post("/agents/select")
async def select_agent(
    request: AgentSelectRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Auto-select the best agent for a query (Mode 2 - Step 1).

    Uses GraphRAG Fusion Search to find the most suitable agent.

    Security Features:
    - Input sanitization for query
    - Tenant validation
    - Rate limiting
    - Error sanitization
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # --- SECURITY: Rate limiting ---
        rate_limit_id = x_tenant_id or "anonymous"
        check_rate_limit_or_raise(rate_limit_id, endpoint="select_agent")

        # --- SECURITY: Validate tenant ---
        validated_tenant = validate_and_sanitize_tenant(x_tenant_id)

        # --- SECURITY: Sanitize inputs ---
        sanitized_query = InputSanitizer.sanitize_text(request.query, max_length=5000)
        if not sanitized_query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        from services.graphrag_selector import get_graphrag_fusion_adapter

        supabase = get_supabase_client()
        adapter = get_graphrag_fusion_adapter(supabase)

        if not adapter:
            raise HTTPException(status_code=500, detail="GraphRAG adapter not available")

        # Search for best agents
        results = adapter.search_agents(
            query=sanitized_query,
            tenant_id=validated_tenant,
            top_k=request.top_k,
            filters=request.filters,
        )

        return {
            "agents": results.get("agents", []),
            "query": sanitized_query,
            "total_found": len(results.get("agents", [])),
        }

    except HTTPException:
        raise
    except Exception as e:
        sanitized_error, ref_id = ErrorSanitizer.sanitize_error(e, 'internal')
        logger.error("agent_select_error", error=str(e), correlation_id=correlation_id, reference_id=ref_id)
        raise HTTPException(status_code=500, detail=sanitized_error)


@router.post("/query/auto")
async def auto_query_stream(
    request: AutoQueryRequest,
    req: Request,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Auto-select agent and stream response (Mode 2 - Combined).

    This is a convenience endpoint that:
    1. Auto-selects the best agent for the query
    2. Creates a conversation
    3. Streams the response

    Security Features:
    - Rate limiting
    - Input sanitization
    - Tenant validation
    - Error sanitization

    SSE Events emitted:
    - agent_selected: When agent is chosen
    - message_start, content_block_delta, etc. (standard streaming events)
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # --- RESILIENCE: Check circuit breaker ---
        if LLM_CIRCUIT_BREAKER.is_open:
            logger.warning("circuit_breaker_open", endpoint="auto_query_stream", correlation_id=correlation_id)
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable. Please try again later.",
                headers={"Retry-After": "30"},
            )

        # --- SECURITY: Rate limiting ---
        rate_limit_id = x_tenant_id or x_user_id or "anonymous"
        check_rate_limit_or_raise(rate_limit_id, endpoint="auto_query_stream")

        # --- SECURITY: Validate tenant ---
        validated_tenant = validate_and_sanitize_tenant(x_tenant_id)

        # --- SECURITY: Sanitize inputs ---
        sanitized_message = InputSanitizer.sanitize_text(request.message, max_length=10000)
        if not sanitized_message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        from services.graphrag_selector import get_graphrag_fusion_adapter

        supabase = get_supabase_client()

        async def auto_stream_generator():
            transformer = SSEEventTransformer()

            try:
                # Step 1: Auto-select agent
                adapter = get_graphrag_fusion_adapter(supabase)

                if adapter:
                    results = adapter.search_agents(
                        query=sanitized_message,
                        tenant_id=validated_tenant,
                        top_k=1,
                        filters=request.auto_select_options,
                    )
                    agents = results.get("agents", [])
                else:
                    agents = []

                if not agents:
                    yield f"event: error\ndata: {json.dumps({'error': 'No suitable agent found'})}\n\n"
                    return

                selected_agent = agents[0]
                agent_id = selected_agent.get("id")

                # Emit agent_selected event
                yield f"event: agent_selected\ndata: {json.dumps({'agent': selected_agent})}\n\n"

                # Step 2: Create consultation (Gold Standard: expert_consultations)
                consultation_id = str(uuid.uuid4())
                now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

                supabase.table("expert_consultations").insert({
                    "id": consultation_id,
                    "agent_id": agent_id,
                    "tenant_id": validated_tenant,
                    "user_id": x_user_id,
                    "title": f"Auto: {sanitized_message[:50]}...",
                    "initial_query": sanitized_message,
                    "status": "active",
                    "enable_streaming": True,
                    "message_count": 0,
                    "total_tokens_used": 0,
                    "total_cost_usd": 0.0,
                    "metadata": {"auto_selected": True, "agent_name": selected_agent.get("name")},
                    "started_at": now,
                    "last_message_at": now,
                    "created_at": now,
                    "updated_at": now,
                }).execute()

                # Emit consultation created
                yield f"event: consultation_created\ndata: {json.dumps({'consultation_id': consultation_id})}\n\n"

                # Step 3: Stream response using Mode 2 unified workflow
                # Mode 2 = Interactive + AUTOMATIC agent selection
                # Reference: ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md
                from langgraph_workflows.ask_expert import create_mode2_workflow, create_fusion_search_selector
                from langgraph_workflows.state_schemas import create_initial_state, WorkflowMode
                from services.agent_orchestrator import AgentOrchestrator
                from services.unified_rag_service import UnifiedRAGService

                agent_orchestrator = AgentOrchestrator(supabase, rag_service=None)
                rag_service = UnifiedRAGService(supabase)

                # Create FusionSearchSelector for automatic agent selection
                # Note: Agent was already selected above, but unified workflow expects selector
                agent_selector = create_fusion_search_selector(supabase_client=supabase)

                # Create Mode 2 workflow using unified factory
                workflow = create_mode2_workflow(
                    supabase_client=supabase,
                    agent_selector=agent_selector,
                    rag_service=rag_service,
                    agent_orchestrator=agent_orchestrator,
                )

                graph = workflow.build_graph()
                compiled_graph = graph.compile()

                initial_state = create_initial_state(
                    tenant_id=validated_tenant,
                    mode=WorkflowMode.MODE_2_AUTO,
                    query=sanitized_message,  # Use sanitized message
                    request_id=str(uuid.uuid4()),
                    selected_agents=[agent_id],
                    enable_rag=request.enable_rag,
                    enable_tools=request.enable_tools,
                    selected_rag_domains=request.selected_rag_domains,
                    user_id=x_user_id or "anonymous",
                    session_id=consultation_id,
                )

                full_response = ""
                total_tokens = 0
                cost_usd = 0.0

                async for chunk in compiled_graph.astream(initial_state):
                    for node_name, node_output in chunk.items():
                        if isinstance(node_output, dict):
                            if "response" in node_output or "content" in node_output:
                                content = node_output.get("response") or node_output.get("content", "")
                                if content:
                                    full_response += content
                                    sse_text = transform_and_format("token", {"text": content}, transformer)
                                    yield sse_text

                # Done
                sse_text = transform_and_format("done", {"stop_reason": "end_turn"}, transformer)
                yield sse_text

                # Save messages to expert_messages (Gold Standard)
                # User message (use sanitized content)
                supabase.table("expert_messages").insert({
                    "id": str(uuid.uuid4()),
                    "consultation_id": consultation_id,
                    "role": "user",
                    "content": sanitized_message,  # Use sanitized message
                    "message_index": 0,
                    "created_at": now,
                }).execute()

                # Assistant message
                supabase.table("expert_messages").insert({
                    "id": str(uuid.uuid4()),
                    "consultation_id": consultation_id,
                    "role": "assistant",
                    "content": full_response,
                    "message_index": 1,
                    "total_tokens": total_tokens,
                    "cost_usd": cost_usd,
                    "metadata": json.dumps({"rag_enabled": request.enable_rag, "auto_selected": True}),
                    "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }).execute()

                # Update consultation stats
                supabase.table("expert_consultations").update({
                    "message_count": 2,
                    "total_tokens_used": total_tokens,
                    "total_cost_usd": cost_usd,
                    "last_message_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }).eq("id", consultation_id).execute()

            except Exception as e:
                # --- RESILIENCE: Record failure for circuit breaker ---
                import asyncio
                asyncio.create_task(LLM_CIRCUIT_BREAKER._record_failure())

                # --- SECURITY: Sanitize error for client exposure ---
                sanitized_error, ref_id = ErrorSanitizer.sanitize_error(e, 'internal')
                logger.error(
                    "auto_stream_error",
                    error=str(e),
                    correlation_id=correlation_id,
                    reference_id=ref_id,
                )
                yield f"event: error\ndata: {json.dumps({'error': sanitized_error, 'reference_id': ref_id})}\n\n"

        return StreamingResponse(
            auto_stream_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
                "X-Correlation-ID": correlation_id,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        # --- RESILIENCE: Record failure for circuit breaker ---
        import asyncio
        asyncio.create_task(LLM_CIRCUIT_BREAKER._record_failure())

        sanitized_error, ref_id = ErrorSanitizer.sanitize_error(e, 'internal')
        logger.error("auto_query_error", error=str(e), correlation_id=correlation_id, reference_id=ref_id)
        raise HTTPException(status_code=500, detail=sanitized_error)
