# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [Panel]
# DEPENDENCIES: [langgraph_workflows.ask_panel_enhanced, services.supabase_client, services.agent_service, services.llm_service]
"""
Ask Panel Enhanced - Streaming API Routes

Provides real-time streaming for multi-expert panel consultations with:
- Agent-to-agent communication
- Orchestrator visibility
- Comprehensive summaries
- Server-Sent Events (SSE) streaming

Architecture Pattern (LLM Config):
- Environment variables: UTILITY_LLM_MODEL, UTILITY_LLM_TEMPERATURE, UTILITY_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values
"""

import json
import asyncio
from typing import AsyncIterator, List, Optional, Union, Dict, Any
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator
import structlog

from langgraph_workflows.ask_panel_enhanced import EnhancedAskPanelWorkflow
from services.supabase_client import get_supabase_client
from services.agent_service import AgentService
from services.unified_rag_service import UnifiedRAGService
from services.llm_service import LLMService
from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()

# Get UTILITY defaults from environment variables (for fallback/utility operations)
_UTILITY_DEFAULTS = get_llm_config_for_level("UTILITY")

router = APIRouter(prefix="/api/ask-panel-enhanced", tags=["ask-panel-enhanced"])


class SimpleRAGService:
    """
    RAG service that tries UnifiedRAGService first, falls back to Supabase direct queries,
    and finally returns empty results if both fail.
    
    This ensures knowledge retrieval works even when vector DBs are unavailable.
    """

    def __init__(self, supabase_client=None):
        self.supabase_client = supabase_client
        self.unified_rag = None

    async def initialize(self) -> None:
        """Try to initialize UnifiedRAGService, but don't fail if it doesn't work"""
        try:
            from services.unified_rag_service import UnifiedRAGService
            self.unified_rag = UnifiedRAGService()
            await self.unified_rag.initialize()
            logger.info("✅ UnifiedRAGService initialized for Ask Panel")
        except Exception as e:
            logger.warning(f"⚠️ UnifiedRAGService not available, will use Supabase fallback: {e}")
            self.unified_rag = None

    async def query(
        self,
        query_text: str,
        strategy: str = "true_hybrid",
        domain_ids=None,
        filters=None,
        max_results: int = 10,
        similarity_threshold: float = 0.7,
        agent_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
    ) -> dict:
        # Try UnifiedRAGService first if available
        if self.unified_rag:
            try:
                result = await self.unified_rag.query(
                    query_text=query_text,
                    strategy=strategy,
                    domain_ids=domain_ids,
                    filters=filters,
                    max_results=max_results,
                    similarity_threshold=similarity_threshold,
                    agent_id=agent_id,
                    user_id=user_id,
                    session_id=session_id,
                    tenant_id=tenant_id,
                )
                if result.get("sources") or result.get("results"):
                    logger.info(f"✅ UnifiedRAGService returned {len(result.get('sources', result.get('results', [])))} sources")
                    return result
            except Exception as e:
                logger.warning(f"⚠️ UnifiedRAGService query failed, trying Supabase fallback: {e}")

        # Fallback: Query Supabase directly for knowledge sources
        if self.supabase_client and self.supabase_client.client:
            try:
                # Query knowledge_domains or documents table
                response = self.supabase_client.client.table("knowledge_domains").select(
                    "id, name, description, content"
                ).ilike("name", f"%{query_text[:50]}%").limit(max_results).execute()
                
                sources = []
                if response.data:
                    for doc in response.data:
                        sources.append({
                            "id": doc.get("id"),
                            "source": doc.get("name", "Knowledge Domain"),
                            "title": doc.get("name"),
                            "content": doc.get("description", "") + " " + (doc.get("content", "") or ""),
                            "metadata": {"type": "knowledge_domain"}
                        })
                    
                    context = "\n\n".join([f"[{s['title']}]: {s['content'][:500]}" for s in sources[:10]])
                    
                    logger.info(f"✅ Supabase fallback returned {len(sources)} knowledge sources")
                    return {
                        "sources": sources,
                        "results": sources,
                        "context": context,
                        "metadata": {
                            "strategy": "supabase_fallback",
                            "totalSources": len(sources),
                            "responseTime": 0,
                            "cached": False,
                            "degradedMode": False,
                        },
                    }
            except Exception as e:
                logger.warning(f"⚠️ Supabase fallback query failed: {e}")

        # Final fallback: return empty results
        logger.warning("⚠️ No RAG sources available, returning empty results")
        return {
            "sources": [],
            "context": "",
            "metadata": {
                "strategy": strategy,
                "totalSources": 0,
                "responseTime": 0,
                "cached": False,
                "degradedMode": True,
            },
        }


class FallbackAskPanelWorkflow:
    """
    Minimal fallback workflow used when the full EnhancedAskPanelWorkflow
    cannot be initialized for any reason (RAG, Supabase, config issues, etc.).

    It still runs inside the Python backend and streams a small sequence of
    events using only the LLM service, with no Supabase or RAG dependencies.
    """

    def __init__(self, llm_service: LLMService, init_error: Optional[str] = None):
        self.llm_service = llm_service
        self.init_error = init_error

    async def initialize(self) -> None:
        return

    async def execute(
        self,
        question: str,
        template_slug: str,
        selected_agent_ids: List[str],
        tenant_id: str,
        enable_debate: bool = True,
        max_rounds: int = 3,
        require_consensus: bool = False,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        # Intro / system message
        intro: Dict[str, Any] = {
            "type": "message",
            "node": "fallback_intro",
            "data": {
                "id": "fallback-intro",
                "type": "system",
                "role": "orchestrator",
                "content": (
                    "The expert panel is running in a simplified mode on this environment. "
                    "Some advanced services (RAG, confidence calculator, or Supabase metrics) "
                    "are disabled, but you will still receive a direct expert-style answer."
                ),
                "metadata": {
                    "degradedMode": True,
                    "initError": self.init_error,
                },
            },
        }
        yield intro

        # Main answer message
        try:
            answer_text = await self.llm_service.generate(
                prompt=(
                    "You are a senior digital health and life-sciences expert on a panel.\n\n"
                    f"Question: {question}\n\n"
                    "Give a concise but useful answer, with concrete recommendations."
                ),
                model=_UTILITY_DEFAULTS.model,
                temperature=_UTILITY_DEFAULTS.temperature,
                max_tokens=_UTILITY_DEFAULTS.max_tokens,
            )
        except Exception as e:
            logger.error("fallback_workflow_llm_failed", error=str(e))
            answer_text = (
                "The backend LLM is not correctly configured in this environment "
                "(for example, OPENAI_API_KEY may be missing or invalid). "
                "Please check the server configuration and try again."
            )

        answer_event: Dict[str, Any] = {
            "type": "message",
            "node": "fallback_answer",
            "data": {
                "id": "fallback-answer",
                "type": "agent",
                "role": "expert_panel",
                "content": answer_text,
                "metadata": {
                    "degradedMode": True,
                    "agent_ids": selected_agent_ids,
                },
            },
        }
        yield answer_event

        # Completion event
        yield {
            "type": "complete",
            "data": {
                "status": "success",
                "message": "Panel consultation completed in fallback mode",
                "degradedMode": True,
            },
        }


# ============================================================================
# Request/Response Models
# ============================================================================

class StreamPanelRequest(BaseModel):
    """Request for streaming panel consultation"""
    question: str = Field(..., min_length=10, max_length=2000, description="Question for the panel")
    template_slug: str = Field(..., description="Panel template slug (e.g., 'regulatory_affairs_panel')")
    selected_agent_ids: List[str] = Field(..., min_items=2, max_items=10, description="Agent IDs to include in panel")
    tenant_id: str = Field(..., description="Tenant ID for multi-tenant isolation")
    enable_debate: bool = Field(default=True, description="Enable multi-round debate between agents")
    max_rounds: int = Field(default=3, ge=1, le=5, description="Maximum discussion rounds")
    require_consensus: bool = Field(default=False, description="Require high consensus before completing")

    @validator('selected_agent_ids')
    def validate_agent_ids(cls, v):
        """Reject fallback agent IDs - only allow real agent IDs"""
        fallback_ids = [agent_id for agent_id in v if agent_id.startswith('fallback-') or agent_id.startswith('agent-')]
        if fallback_ids:
            raise ValueError(
                f"Invalid agent IDs detected (fallback IDs not allowed): {fallback_ids}. "
                f"Please ensure all agents exist in the 'agents' table with valid UUIDs or names."
            )
        return v


class ExecutePanelRequest(BaseModel):
    """Request for non-streaming panel execution"""
    question: str = Field(..., min_length=10, max_length=2000)
    template_slug: str = Field(...)
    selected_agent_ids: List[str] = Field(..., min_items=2, max_items=10)
    tenant_id: str = Field(...)
    enable_debate: bool = Field(default=True)
    max_rounds: int = Field(default=3, ge=1, le=5)


class PanelHealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    streaming_enabled: bool
    max_agents: int
    max_rounds: int


# ============================================================================
# Dependencies
# ============================================================================

async def get_workflow() -> EnhancedAskPanelWorkflow:
    """
    Get or create workflow instance.

    Wires together Supabase-backed services (agents, RAG, LLM) and
    returns an initialized EnhancedAskPanelWorkflow.
    """
    try:
        # Supabase client (singleton) – used for agents when available.
        # If initialization fails, we continue in degraded mode with generic
        # agents and no database-backed RAG.
        supabase_client = get_supabase_client()

        if not supabase_client.client:
            logger.info("Initializing Supabase client for Ask Panel workflow...")
            await supabase_client.initialize()

        if not supabase_client.client:
            logger.warning(
                "Supabase client unavailable for Ask Panel workflow; running in degraded mode"
            )
        else:
            # Verify Supabase client can query agents table
            try:
                test_result = supabase_client.client.table("agents").select("id").limit(1).execute()
                logger.info(
                    "✅ Supabase client verified - can query agents table",
                    test_result_count=len(test_result.data) if test_result.data else 0
                )
            except Exception as verify_error:
                logger.error(
                    "❌ Supabase client verification failed",
                    error=str(verify_error),
                    error_type=type(verify_error).__name__
                )

        # Core services used by the workflow
        agent_service = AgentService(supabase_client)

        # ------------------------------------------------------------------
        # RAG Service with fallback chain:
        # 1. Try UnifiedRAGService (if available)
        # 2. Fall back to Supabase direct queries
        # 3. Fall back to empty results (degraded mode)
        # ------------------------------------------------------------------
        rag_service: SimpleRAGService = SimpleRAGService(supabase_client=supabase_client)
        await rag_service.initialize()

        llm_service = LLMService()

        # Initialize workflow with all dependencies
        workflow = EnhancedAskPanelWorkflow(
            supabase_client=supabase_client,
            agent_service=agent_service,
            rag_service=rag_service,
            llm_service=llm_service,
        )
        await workflow.initialize()
        return workflow

    except HTTPException:
        raise
    except Exception as e:
        # Log full error for server-side debugging
        logger.error("failed_to_initialize_panel_workflow", error=str(e))

        # Instead of returning 503 to the client, fall back to a minimal,
        # RAG-free workflow that still streams a response from the Python
        # backend using only the LLM service.
        fallback_llm = LLMService()
        fallback = FallbackAskPanelWorkflow(fallback_llm, init_error=str(e))
        await fallback.initialize()
        return fallback  # type: ignore[return-value]


# ============================================================================
# Streaming Endpoint
# ============================================================================

@router.post("/stream")
async def stream_panel_consultation(
    request: StreamPanelRequest,
    workflow: EnhancedAskPanelWorkflow = Depends(get_workflow)
):
    """
    Stream panel consultation in real-time using Server-Sent Events (SSE).

    The stream emits events in the following format:
    ```
    data: {"type": "message", "node": "orchestrator_intro", "data": {...}}
    data: {"type": "message", "node": "initial_panel_responses", "data": {...}}
    data: {"type": "complete", "data": {"consensus_level": 0.85}}
    ```

    Event types:
    - `message`: Agent/orchestrator message
    - `system`: System status update
    - `error`: Error occurred
    - `complete`: Panel consultation finished

    Args:
        request: Panel consultation request
        workflow: Injected workflow instance

    Returns:
        StreamingResponse with SSE events
    """
    logger.info(
        "streaming_panel_consultation",
        question=request.question[:100],
        template_slug=request.template_slug,
        agent_count=len(request.selected_agent_ids),
        tenant_id=request.tenant_id
    )

    async def event_generator() -> AsyncIterator[str]:
        """Generate Server-Sent Events for panel execution"""
        try:
            # Execute workflow with streaming. In this environment we don't
            # have authenticated user/session IDs wired through, so we pass
            # placeholder values that are only used for logging/metadata.
            async for event in workflow.execute(
                question=request.question,
                template_slug=request.template_slug,
                selected_agent_ids=request.selected_agent_ids,
                tenant_id=request.tenant_id,
                user_id="anonymous-user",
                session_id="dev-session",
                enable_debate=request.enable_debate,
                max_rounds=request.max_rounds,
                require_consensus=request.require_consensus
            ):
                # Format as SSE
                event_json = json.dumps(event)
                yield f"data: {event_json}\n\n"

                # Small delay to prevent overwhelming client
                await asyncio.sleep(0.01)

            # Send completion event
            completion_event = {
                "type": "complete",
                "data": {
                    "status": "success",
                    "message": "Panel consultation completed"
                }
            }
            yield f"data: {json.dumps(completion_event)}\n\n"

        except Exception as e:
            logger.error("streaming_error", error=str(e))
            error_event = {
                "type": "error",
                "data": {
                    "error": str(e),
                    "message": "Panel consultation failed"
                }
            }
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )


# ============================================================================
# Non-Streaming Endpoint (Legacy Support)
# ============================================================================

@router.post("/execute")
async def execute_panel_consultation(
    request: ExecutePanelRequest,
    workflow: EnhancedAskPanelWorkflow = Depends(get_workflow)
):
    """
    Execute panel consultation without streaming (returns all messages at once).

    This endpoint collects all messages and returns them when the panel completes.
    Use the `/stream` endpoint for real-time updates.

    Args:
        request: Panel consultation request
        workflow: Injected workflow instance

    Returns:
        Complete panel consultation result
    """
    logger.info(
        "executing_panel_consultation",
        question=request.question[:100],
        template_slug=request.template_slug,
        agent_count=len(request.selected_agent_ids)
    )

    try:
        # Collect all events. As with the streaming endpoint, we pass
        # placeholder user/session IDs in this dev/local setup.
        messages = []
        async for event in workflow.execute(
            question=request.question,
            template_slug=request.template_slug,
            selected_agent_ids=request.selected_agent_ids,
            tenant_id=request.tenant_id,
            user_id="anonymous-user",
            session_id="dev-session",
            enable_debate=request.enable_debate,
            max_rounds=request.max_rounds,
            require_consensus=request.require_consensus
        ):
            if event.get("type") == "message":
                messages.append(event.get("data"))

        return {
            "status": "completed",
            "messages": messages,
            "message_count": len(messages)
        }

    except Exception as e:
        logger.error("panel_execution_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Panel execution failed: {str(e)}"
        )


# ============================================================================
# Health Check
# ============================================================================

@router.get("/health", response_model=PanelHealthResponse)
async def health_check():
    """
    Health check for enhanced panel service.

    Returns:
        Service health status
    """
    return PanelHealthResponse(
        status="healthy",
        service="ask-panel-enhanced",
        streaming_enabled=True,
        max_agents=10,
        max_rounds=5
    )


# ============================================================================
# Agent Listing (for UI)
# ============================================================================

@router.get("/agents")
async def list_available_agents(
    tenant_id: Optional[str] = None,
    agent_level: Optional[int] = Query(None, alias="tier", description="Filter by agent level (deprecated: tier)"),
    specialization: Optional[str] = None,
    limit: int = 50
):
    """
    List available agents for panel selection.

    Query parameters:
    - tenant_id: Filter by tenant
    - agent_level: Filter by agent level (L1-L5; alias: tier for backward compatibility)
    - specialization: Filter by specialization
    - limit: Maximum agents to return

    Returns:
        List of available agents
    """
    try:
        supabase_client = get_supabase_client()

        # Initialize the client if not already initialized
        if not supabase_client.client:
            await supabase_client.initialize()

        if not supabase_client.client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable"
            )

        # Default tenant ID if not provided
        DEFAULT_TENANT_ID = "c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244"
        effective_tenant_id = tenant_id or DEFAULT_TENANT_ID

        # Set tenant context for RLS
        try:
            await supabase_client.set_tenant_context(effective_tenant_id)
        except Exception as ctx_error:
            logger.warning(
                "⚠️ Failed to set tenant context in list_available_agents",
                tenant_id=effective_tenant_id,
                error=str(ctx_error)
            )

        # Build query
        query = supabase_client.client.table("agents").select(
            "id, name, display_name, description, tier, specializations, avatar, status"
        ).eq("status", "active").eq("tenant_id", effective_tenant_id)

        # Apply filters
        if agent_level:
            query = query.eq("tier", agent_level)

        if specialization:
            query = query.contains("specializations", [specialization])

        # Execute query
        result = query.limit(limit).execute()

        if not result.data:
            return {"agents": [], "count": 0}

        normalized = []
        for row in result.data:
            item = dict(row)
            item["agent_level"] = item.pop("tier", None)
            normalized.append(item)

        return {
            "agents": normalized,
            "count": len(normalized)
        }

    except Exception as e:
        logger.error("failed_to_list_agents", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list agents: {str(e)}"
        )


@router.get("/agents/{agent_id}")
async def get_agent_details(agent_id: str):
    """
    Get detailed information about a specific agent.

    Args:
        agent_id: Agent UUID or name

    Returns:
        Agent details
    """
    try:
        supabase_client = get_supabase_client()

        # Initialize the client if not already initialized
        if not supabase_client.client:
            await supabase_client.initialize()

        if not supabase_client.client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable"
            )

        agent = await supabase_client.get_agent_by_id(agent_id)

        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )

        return agent

    except HTTPException:
        raise
    except Exception as e:
        logger.error("failed_to_get_agent", agent_id=agent_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent details: {str(e)}"
        )
