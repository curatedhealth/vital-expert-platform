"""
Unified Ask Expert streaming endpoint (Modes 1 & 2).

World-Class LangGraph Streaming Implementation.

Flows:
- Mode 1: User supplies expert_id → Mode 1 Workflow
- Mode 2: Auto-select via Fusion Search → Mode 1 Workflow

Pipeline:
1) Mode 2: Fusion Search (GraphRAG) auto-selects expert
2) Both modes: Use AskExpertMode1Workflow for generation
3) SSE streaming with real-time tokens using LangGraph best practices

Architecture Pattern:
- Mode 2 = Fusion Search + Mode 1
- Both modes use the same LangGraph workflow for generation
- Uses streaming/ module for world-class SSE + token streaming

Stream Modes Supported:
- values: Full state after each node
- updates: State deltas only
- messages: LLM token streaming
- custom: User-defined data via get_stream_writer()
"""

from typing import Any, AsyncGenerator, Dict, Optional, List
import json
import structlog
import time
import uuid
import urllib.parse

from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator

# Mode 1 workflow imports (same generation for both modes)
from langgraph_workflows.ask_expert.ask_expert_mode1_workflow import AskExpertMode1Workflow
from langgraph_workflows.state_schemas import create_initial_state, WorkflowMode
from services.agent_orchestrator import AgentOrchestrator
from services.unified_rag_service import UnifiedRAGService

# World-class streaming infrastructure
from streaming import (
    SSEFormatter,
    stream_with_context,
    format_stream_end,
)

# Fusion Search imports (for Mode 2 expert selection)
from services.graphrag_selector import get_graphrag_fusion_adapter

logger = structlog.get_logger()

router = APIRouter(prefix="/api/expert", tags=["ask-expert"])


# --------------------------------------------------------------------------- Models


class ExpertStreamRequest(BaseModel):
    mode: int = Field(..., ge=1, le=2, description="Mode 1 (manual) or Mode 2 (auto-select)")
    message: str = Field(..., min_length=1, max_length=10000)
    expert_id: Optional[str] = Field(None, description="Required for Mode 1")
    tenant_id: Optional[str] = Field(None, description="Tenant context")
    user_id: Optional[str] = Field(None, description="User ID")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    user_context: Dict[str, Any] = Field(default_factory=dict)

    # Optional settings (matching Mode 1's interface)
    enable_rag: bool = Field(True, description="Enable RAG retrieval")
    enable_tools: bool = Field(False, description="Enable tool execution")
    selected_rag_domains: List[str] = Field(default_factory=list, description="RAG domain filters")
    requested_tools: List[str] = Field(default_factory=list, description="Requested tools")

    # Model configuration - Optional to allow agent's database config to be used by default
    # When None, agent's base_model/temperature/max_tokens from Supabase is used
    # User can explicitly override by providing values in the request
    model: Optional[str] = Field(None, description="Override LLM model (defaults to agent's base_model from Supabase)")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0, description="Override temperature (defaults to agent's config, linked to personality)")
    max_tokens: Optional[int] = Field(None, ge=1, le=8000, description="Override max tokens (defaults to agent's config)")
    max_results: int = Field(10, description="Max RAG results", ge=1, le=50)

    @validator("expert_id")
    def require_expert_for_mode1(cls, v, values):
        if values.get("mode") == 1 and not v:
            raise ValueError("expert_id is required for mode 1")
        return v


# --------------------------------------------------------------------------- Helpers


def get_supabase_client():
    """Get Supabase client from environment"""
    from supabase import create_client
    import os

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        logger.error("Supabase configuration missing")
        return None

    return create_client(supabase_url, supabase_key)


async def select_expert_via_fusion(supabase, query: str, tenant_id: str) -> Optional[Dict[str, Any]]:
    """
    Use Fusion Search (GraphRAG) to select the best expert for a query.

    This is the Mode 2 expert selection using 3-method search:
    - PostgreSQL (30%): Relational agent data
    - Pinecone (50%): Semantic similarity
    - Neo4j (20%): Graph relationships
    """
    try:
        fusion_adapter = get_graphrag_fusion_adapter(supabase)
        logger.info("fusion_search_started", query_preview=query[:100])

        # Search for best expert using fusion
        results = await fusion_adapter.search_agents(
            query=query,
            tenant_id=tenant_id,
            top_k=5
        )

        if not results:
            logger.warning("fusion_search_no_results", query=query[:100])
            return None

        # Return top expert
        top_expert = results[0]
        logger.info(
            "fusion_search_selected_expert",
            expert_id=top_expert.get("id"),
            expert_name=top_expert.get("name"),
            score=top_expert.get("score", 0)
        )

        return top_expert

    except Exception as e:
        logger.error("fusion_search_failed", error=str(e))
        return None


async def stream_sse_events_realtime(compiled_graph, initial_state: Dict[str, Any], selected_expert: Optional[Dict] = None):
    """
    Stream SSE events in REAL-TIME with true token-by-token streaming.

    World-Class LangGraph Streaming Implementation.

    Two-phase approach:
    1. Run LangGraph workflow to prepare context (emit thinking steps with REAL details)
    2. Stream LLM response token-by-token using prepared config

    Event types (matching frontend expectations):
    - thinking: Reasoning/workflow steps with REAL details (subagents, sources, tools)
    - token: Response tokens (REAL streaming - character by character)
    - sources: RAG sources retrieved
    - tool: Tool execution events
    - done: Final response with metadata
    - error: Error occurred

    Uses streaming/ module:
    - SSEFormatter for consistent event formatting
    - stream_with_context for real LLM token streaming
    """
    start_time = time.time()
    final_state = {}
    tokens_count = 0
    full_response = ""
    sources_emitted = False

    # Use SSEFormatter for consistent event formatting
    sse = SSEFormatter(include_ids=True)

    agent_name = selected_expert.get("name", "AI Assistant") if selected_expert else "AI Assistant"
    agent_id = selected_expert.get("id", "") if selected_expert else initial_state.get("selected_agents", [""])[0]

    # Track L3/L4/L5 activity for transparency
    l3_tools_executed = []
    rag_sources_retrieved = []
    subagents_invoked = []

    # Node name to detailed thinking descriptions - with REAL runtime details
    def get_node_details(node_name: str, state: Dict[str, Any], node_output: Dict[str, Any]) -> tuple:
        """Get title and detail based on actual runtime data."""

        if node_name == "process_input":
            query = state.get('query', '')[:80]
            return ("Analyzing your query", f"Query: \"{query}...\"")

        elif node_name == "load_session":
            session_id = state.get('session_id', 'new')
            return ("Loading conversation context", f"Session: {session_id[:12] if session_id != 'new' else 'Creating new session'}...")

        elif node_name == "validate_tenant":
            tenant_id = state.get('tenant_id', 'unknown')
            return ("Validating access permissions", f"Tenant verified: {tenant_id[:12]}...")

        elif node_name == "load_agent":
            agent_type = state.get('current_agent_type', 'Loading...')
            llm_config = state.get('llm_config', {})
            model = llm_config.get('model', 'gpt-4')
            return ("Activating expert agent", f"Expert: {agent_type} | Model: {model}")

        elif node_name == "l3_orchestrate":
            # REAL L3 Context Engineer details
            l3_context = node_output.get('l3_enriched_context', state.get('l3_enriched_context', {}))
            l3_sources = l3_context.get('sources', [])
            l3_intent = node_output.get('l3_intent', state.get('l3_intent', 'general'))
            tools_used = node_output.get('l3_tools_used', state.get('l3_tools_used', []))

            # Track for transparency
            if isinstance(tools_used, list):
                l3_tools_executed.extend(tools_used)

            detail_parts = [f"Intent: {l3_intent}"]
            if l3_sources:
                detail_parts.append(f"Sources: {len(l3_sources)} retrieved")
            if tools_used:
                tool_names = tools_used if isinstance(tools_used, list) else [str(tools_used)]
                detail_parts.append(f"Tools: {', '.join(tool_names[:3])}")

            return ("L3 Context Engineer orchestrating", " | ".join(detail_parts))

        elif node_name == "rag_retrieval":
            # REAL RAG retrieval details
            docs = node_output.get('retrieved_documents', state.get('retrieved_documents', []))
            citations = node_output.get('citations', state.get('citations', []))
            doc_count = len(docs) or len(citations)

            # Get source names for transparency
            source_names = []
            for doc in docs[:3]:
                title = doc.get('title', doc.get('metadata', {}).get('source', ''))[:30]
                if title:
                    source_names.append(title)

            detail = f"Found {doc_count} relevant documents"
            if source_names:
                detail += f" | Top: {', '.join(source_names)}"

            return ("Searching knowledge base", detail)

        elif node_name == "execute_expert":
            # REAL LLM execution details
            llm_config = node_output.get('llm_streaming_config', state.get('llm_streaming_config', {}))
            model = llm_config.get('model', 'gpt-4')
            temp = llm_config.get('temperature', 0.7)
            l3_sources = state.get('l3_sources_used', 0)
            rag_docs = state.get('rag_docs_used', len(state.get('retrieved_documents', [])))

            return ("Preparing expert response", f"Model: {model} | Temp: {temp} | Context: {l3_sources + rag_docs} sources")

        elif node_name == "save_message":
            return ("Saving to conversation history", "Persisting for context continuity")

        elif node_name == "format_output":
            citations_count = len(state.get('citations', []))
            return ("Formatting response", f"Applying {citations_count} citations")

        else:
            return (f"Processing {node_name}", "")

    try:
        # Phase 1: Run LangGraph workflow to prepare context
        llm_streaming_config_captured = None

        async for chunk in compiled_graph.astream(initial_state):
            for node_name, node_output in chunk.items():
                # Update final state
                if isinstance(node_output, dict):
                    # Capture llm_streaming_config before it gets overwritten
                    if 'llm_streaming_config' in node_output:
                        llm_streaming_config_captured = node_output['llm_streaming_config']
                        logger.info("llm_config_captured", node=node_name, model=llm_streaming_config_captured.get('model'))
                    final_state.update(node_output)

                # Get REAL node details based on runtime data
                title, detail = get_node_details(node_name, final_state, node_output if isinstance(node_output, dict) else {})

                # Emit thinking event using SSEFormatter with REAL details
                yield sse.thinking(node_name, "completed", title, detail)

                # Emit tool events for L5 tools (transparency)
                if node_name == "l3_orchestrate" and isinstance(node_output, dict):
                    tools_used = node_output.get('l3_tools_used', [])
                    if isinstance(tools_used, list):
                        for tool_name in tools_used:
                            yield sse.tool(tool_name, "completed", output_data={"source": "L3 Context Engineer"})

                # Emit sources when RAG completes
                if node_name == "rag_retrieval" and not sources_emitted:
                    citations = final_state.get('citations', [])
                    retrieved_docs = final_state.get('retrieved_documents', [])
                    if citations or retrieved_docs:
                        def get_source_url(doc, index):
                            metadata = doc.get('metadata', {})
                            url = metadata.get('url') or metadata.get('source_url') or metadata.get('link')
                            if url and url != '#':
                                return url
                            doi = metadata.get('doi')
                            if doi:
                                return f"https://doi.org/{doi}"
                            pmid = metadata.get('pmid') or metadata.get('pubmed_id')
                            if pmid:
                                return f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                            title_text = doc.get('title', '')
                            if title_text:
                                return f"https://scholar.google.com/scholar?q={urllib.parse.quote(title_text[:100])}"
                            return f"#source-{index + 1}"

                        sources_list = citations if citations else [
                            {
                                'id': i + 1,
                                'title': doc.get('title', f'Source {i+1}'),
                                'url': get_source_url(doc, i),
                                'excerpt': doc.get('content', '')[:200] if doc.get('content') else '',
                                'relevance_score': doc.get('metadata', {}).get('relevance_score', 0.8)
                            }
                            for i, doc in enumerate(retrieved_docs[:10])
                        ]
                        yield sse.sources(sources_list)
                        sources_emitted = True

        # Phase 2: Stream LLM response token-by-token
        llm_config = llm_streaming_config_captured or final_state.get('llm_streaming_config', {})

        # Validate llm_config has ALL required fields for streaming
        has_provider = bool(llm_config.get('provider')) if llm_config else False
        has_system_prompt = bool(llm_config.get('system_prompt')) if llm_config else False
        has_user_query = bool(llm_config.get('user_query')) if llm_config else False
        can_stream = has_provider and has_system_prompt and has_user_query

        logger.info(
            "phase2_streaming_validation",
            has_config=bool(llm_config),
            has_provider=has_provider,
            has_system_prompt=has_system_prompt,
            has_user_query=has_user_query,
            can_stream=can_stream,
            model=llm_config.get('model') if llm_config else None,
            config_keys=list(llm_config.keys()) if llm_config else [],
        )

        if can_stream:
            # Emit "generating" thinking step
            model_name = llm_config.get('model', 'gpt-4')
            yield sse.thinking("generate_response", "running", "Generating expert response...", f"Streaming tokens from {model_name}")

            # Use stream_with_context for REAL token-by-token streaming
            try:
                async for token, count in stream_with_context(llm_config):
                    full_response += token
                    tokens_count = count
                    # Yield each token immediately for real-time streaming
                    yield sse.token(token, count)

                # Mark generation complete
                yield sse.thinking("generate_response", "completed", "Response generated", f"Generated {tokens_count} tokens")

            except Exception as stream_error:
                logger.error("token_streaming_error", error=str(stream_error), exc_info=True)
                # Fallback to agent_response with word-by-word simulation
                full_response = final_state.get('agent_response', f'Streaming error: {str(stream_error)}')
                yield sse.thinking("generate_response", "running", "Generating response (fallback)", "Word-by-word streaming")
                for word in full_response.split():
                    tokens_count += 1
                    yield sse.token(word + ' ', tokens_count)
                yield sse.thinking("generate_response", "completed", "Response generated (fallback)", f"Generated {tokens_count} words")

        else:
            # Fallback: use agent_response from state if LLM config incomplete
            missing = []
            if not has_provider: missing.append("provider")
            if not has_system_prompt: missing.append("system_prompt")
            if not has_user_query: missing.append("user_query")

            logger.warning(
                "no_llm_config_fallback",
                missing_fields=missing,
                state_keys=list(final_state.keys())[:10],
            )

            yield sse.thinking("generate_response", "running", "Generating response (fallback)", f"Missing: {', '.join(missing)}")
            full_response = final_state.get('agent_response', 'No response generated.')
            for word in full_response.split():
                tokens_count += 1
                yield sse.token(word + ' ', tokens_count)
            yield sse.thinking("generate_response", "completed", "Response generated (fallback)", f"Generated {tokens_count} words")

        # Calculate final metrics
        processing_time_ms = (time.time() - start_time) * 1000
        tokens_per_second = tokens_count / (processing_time_ms / 1000) if processing_time_ms > 0 else 0

        # Get citations
        citations = final_state.get('citations', [])

        # Build REAL reasoning steps from tracked activity
        reasoning_steps = []

        # L3 Context Engineer activity
        l3_intent = final_state.get('l3_intent', 'general')
        l3_sources_count = final_state.get('l3_sources_used', 0)
        if l3_tools_executed:
            reasoning_steps.append({
                "step": "l3_context_engineer",
                "content": f"Intent: {l3_intent} | Tools: {', '.join(l3_tools_executed[:5])} | Sources: {l3_sources_count}",
                "status": "completed"
            })
        else:
            reasoning_steps.append({
                "step": "l3_context_engineer",
                "content": f"Intent classification: {l3_intent}",
                "status": "completed"
            })

        # RAG retrieval activity
        rag_docs_count = final_state.get('rag_docs_used', len(citations))
        if rag_docs_count > 0:
            # Get top source titles for transparency
            top_sources = [c.get('title', '')[:40] for c in citations[:3] if c.get('title')]
            source_detail = f" | Top: {', '.join(top_sources)}" if top_sources else ""
            reasoning_steps.append({
                "step": "rag_retrieval",
                "content": f"Retrieved {rag_docs_count} documents{source_detail}",
                "status": "completed"
            })

        # LLM generation activity
        model_used = llm_config.get('model', 'gpt-4')
        temp_used = llm_config.get('temperature', 0.7)
        reasoning_steps.append({
            "step": "llm_generation",
            "content": f"Generated {tokens_count} tokens | Model: {model_used} | Temp: {temp_used}",
            "status": "completed"
        })

        # Emit done event with REAL reasoning
        yield sse.done(
            agent_id=agent_id,
            agent_name=agent_name,
            content=full_response,
            confidence=final_state.get('response_confidence', 0.85),
            sources=citations,
            reasoning=reasoning_steps,
            metrics={
                "processing_time_ms": round(processing_time_ms, 2),
                "tokens_generated": tokens_count,
                "tokens_per_second": round(tokens_per_second, 2),
                "l3_sources_used": final_state.get('l3_sources_used', 0),
                "rag_docs_used": final_state.get('rag_docs_used', 0),
            },
            metadata={
                "request_id": str(uuid.uuid4()),
                "model": llm_config.get('model', 'gpt-4'),
                "temperature": llm_config.get('temperature', 0.7),
                "enable_rag": True,
                "session_id": final_state.get('session_id', ''),
            }
        )
        yield sse.end()

    except Exception as e:
        logger.error("streaming_error", error=str(e), exc_info=True)
        yield sse.error(f"Streaming error: {str(e)}", "STREAMING_ERROR")


# --------------------------------------------------------------------------- Route


@router.post("/stream")
async def expert_stream(
    payload: ExpertStreamRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    req: Request = None,
) -> StreamingResponse:
    """
    Unified streaming endpoint for Modes 1/2.

    Mode 1: User supplies expert_id → Mode 1 Workflow
    Mode 2: Fusion Search selects expert → Mode 1 Workflow

    Both modes use the same LangGraph workflow for generation.
    SSE events: thinking | token | sources | tool | done | error
    """
    start_time = time.time()
    tenant_id = payload.tenant_id or x_tenant_id

    if not tenant_id:
        async def error_gen():
            yield f"data: {json.dumps({'event': 'error', 'message': 'tenant_id required'})}\n\n"
        return StreamingResponse(error_gen(), media_type="text/event-stream")

    # Initialize Supabase
    supabase = get_supabase_client()
    if not supabase:
        async def error_gen():
            yield f"data: {json.dumps({'event': 'error', 'message': 'Database connection failed'})}\n\n"
        return StreamingResponse(error_gen(), media_type="text/event-stream")

    # Determine expert_id
    selected_expert = None
    expert_id = payload.expert_id

    if payload.mode == 2:
        # Mode 2: Use Fusion Search to auto-select expert
        logger.info("mode2_fusion_search_starting", query_preview=payload.message[:100])

        async def mode2_generator():
            nonlocal expert_id, selected_expert

            # Emit thinking event for expert selection
            yield f"data: {json.dumps({'event': 'thinking', 'step': 'fusion_search', 'status': 'running', 'message': 'Selecting best expert via Fusion Search...'})}\n\n"

            selected_expert = await select_expert_via_fusion(supabase, payload.message, tenant_id)

            if not selected_expert:
                yield f"data: {json.dumps({'event': 'error', 'message': 'No expert could be selected via Fusion Search'})}\n\n"
                return

            expert_id = selected_expert.get("id")
            expert_name = selected_expert.get("display_name") or selected_expert.get("name", "Unknown")

            # Emit agent_selected event (standard SSE format for frontend)
            agent_selected_event = {
                "event": "agent_selected",
                "agent": {
                    "id": expert_id,
                    "name": expert_name,
                    "avatar_url": selected_expert.get("avatar_url"),
                    "department": selected_expert.get("department_name"),
                    "score": selected_expert.get("score", 0),
                },
                "timestamp": time.time(),
            }
            yield f"event: agent_selected\ndata: {json.dumps(agent_selected_event)}\n\n"

            # Also emit thinking event for UI compatibility
            selection_event = {
                "event": "thinking",
                "step": "expert_selected",
                "status": "completed",
                "message": f"Selected expert: {expert_name}"
            }
            yield f"data: {json.dumps(selection_event)}\n\n"

            # Now run Mode 1 workflow with selected expert
            try:
                # Initialize services (same as Mode 1)
                agent_orchestrator = AgentOrchestrator(supabase, rag_service=None)
                rag_service = UnifiedRAGService(supabase)

                # Initialize Mode 1 workflow (only supported kwargs)
                workflow = AskExpertMode1Workflow(
                    supabase_client=supabase,
                    rag_service=rag_service,
                    agent_orchestrator=agent_orchestrator,
                    enable_l3_orchestration=True,
                    enable_specialists=True,
                    max_parallel_tools=5,
                )

                # Build and compile graph
                graph = workflow.build_graph()
                compiled_graph = graph.compile()

                # Create initial state
                # Pass user overrides only when explicitly provided (not None)
                # When None, workflow will use agent's database config
                request_id = str(uuid.uuid4())
                initial_state = create_initial_state(
                    tenant_id=tenant_id,
                    mode=WorkflowMode.MODE_1_MANUAL,  # Use Mode 1 workflow for generation
                    query=payload.message,
                    request_id=request_id,
                    selected_agents=[expert_id],
                    enable_rag=payload.enable_rag,
                    enable_tools=payload.enable_tools,
                    selected_rag_domains=payload.selected_rag_domains,
                    requested_tools=payload.requested_tools,
                    max_results=payload.max_results,
                    user_id=payload.user_id or "anonymous",
                    session_id=payload.session_id,
                    # User overrides (None = use agent's database config)
                    user_override_model=payload.model,
                    user_override_temperature=payload.temperature,
                    user_override_max_tokens=payload.max_tokens,
                )

                # Stream response using Mode 1's real-time streaming
                async for event in stream_sse_events_realtime(compiled_graph, initial_state, selected_expert):
                    yield event

            except Exception as e:
                logger.error("mode2_workflow_failed", error=str(e), exc_info=True)
                yield f"data: {json.dumps({'event': 'error', 'message': f'Workflow error: {str(e)}'})}\n\n"

        return StreamingResponse(
            mode2_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    else:
        # Mode 1: User provided expert_id directly
        logger.info("mode1_direct_expert", expert_id=expert_id)

        async def mode1_generator():
            try:
                # Check for client disconnect early
                if req and hasattr(req, 'is_disconnected') and await req.is_disconnected():
                    logger.warning("client_disconnected_before_start", expert_id=expert_id)
                    return

                # Emit agent_selected event early (frontend needs this)
                # Fetch agent info for proper event
                agent_info = supabase.table("agents").select("id, name, display_name, avatar_url, department_name").eq("id", expert_id).single().execute()
                if agent_info.data:
                    agent_data = agent_info.data
                    agent_selected_event = {
                        "event": "agent_selected",
                        "agent": {
                            "id": agent_data.get("id"),
                            "name": agent_data.get("display_name") or agent_data.get("name"),
                            "avatar_url": agent_data.get("avatar_url"),
                            "department": agent_data.get("department_name"),
                        },
                        "timestamp": time.time(),
                    }
                    yield f"event: agent_selected\ndata: {json.dumps(agent_selected_event)}\n\n"

                # Initialize services
                agent_orchestrator = AgentOrchestrator(supabase, rag_service=None)
                rag_service = UnifiedRAGService(supabase)

                # Initialize Mode 1 workflow (only supported kwargs)
                workflow = AskExpertMode1Workflow(
                    supabase_client=supabase,
                    rag_service=rag_service,
                    agent_orchestrator=agent_orchestrator,
                    enable_l3_orchestration=True,
                    enable_specialists=True,
                    max_parallel_tools=5,
                )

                # Build and compile graph
                graph = workflow.build_graph()
                compiled_graph = graph.compile()

                # Create initial state
                # Pass user overrides only when explicitly provided (not None)
                # When None, workflow will use agent's database config
                request_id = str(uuid.uuid4())
                initial_state = create_initial_state(
                    tenant_id=tenant_id,
                    mode=WorkflowMode.MODE_1_MANUAL,
                    query=payload.message,
                    request_id=request_id,
                    selected_agents=[expert_id],
                    enable_rag=payload.enable_rag,
                    enable_tools=payload.enable_tools,
                    selected_rag_domains=payload.selected_rag_domains,
                    requested_tools=payload.requested_tools,
                    max_results=payload.max_results,
                    user_id=payload.user_id or "anonymous",
                    session_id=payload.session_id,
                    # User overrides (None = use agent's database config)
                    user_override_model=payload.model,
                    user_override_temperature=payload.temperature,
                    user_override_max_tokens=payload.max_tokens,
                )

                # Stream response
                async for event in stream_sse_events_realtime(compiled_graph, initial_state):
                    yield event

            except Exception as e:
                logger.error("mode1_workflow_failed", error=str(e), exc_info=True)
                yield f"data: {json.dumps({'event': 'error', 'message': f'Workflow error: {str(e)}'})}\n\n"

        return StreamingResponse(
            mode1_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )




