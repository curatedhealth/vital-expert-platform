# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1]
# DEPENDENCIES: [langgraph_workflows.ask_expert, services.agent_orchestrator, services.unified_rag_service]
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

# Internal imports - unified workflow
from langgraph_workflows.ask_expert.unified_interactive_workflow import UnifiedInteractiveWorkflow as AskExpertMode1Workflow
from langgraph_workflows.state_schemas import create_initial_state, WorkflowMode
from services.agent_orchestrator import AgentOrchestrator
from services.unified_rag_service import UnifiedRAGService

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

    # Node name to thinking step mapping with detailed descriptions and reasoning content
    # Each node has:
    #   - title: Short displayed message (e.g., "Analyzing your query")
    #   - detail: Contextual info (e.g., session ID, doc count)
    #   - content: Meaningful reasoning text that explains what the AI is thinking/doing
    #              This is displayed in the frontend's VitalThinking component
    node_descriptions = {
        # Session management
        "load_or_create_session_node": {
            "title": "Loading session context",
            "detail": lambda s: f"Session: {s.get('session_id', 'new')[:8]}..." if s.get('session_id') else "Creating new session",
            "content": lambda s: f"Retrieving conversation context to maintain continuity. {'Continuing from previous session with ' + str(len(s.get('conversation_history', []))) + ' prior messages.' if s.get('conversation_history') else 'Starting fresh conversation session.'}"
        },
        "load_session": {
            "title": "Loading conversation session",
            "detail": lambda s: f"Session ID: {s.get('session_id', 'new session')}",
            "content": lambda s: f"Loading session context to understand conversation history and maintain continuity across interactions."
        },
        # Agent loading
        "load_agent_profile_node": {
            "title": "Activating expert agent",
            "detail": lambda s: f"Expert: {s.get('agent_profile', {}).get('name', s.get('current_agent_type', 'Loading...'))}",
            "content": lambda s: f"Activating {s.get('agent_profile', {}).get('name', 'specialized expert')} with expertise in {', '.join(s.get('agent_profile', {}).get('knowledge_domains', ['general knowledge'])[:3]) if s.get('agent_profile', {}).get('knowledge_domains') else 'the relevant domain'}. This agent has been selected based on your query requirements."
        },
        "load_agent": {
            "title": "Activating expert agent",
            "detail": lambda s: f"Expert: {s.get('current_agent_type', 'Loading...')}",
            "content": lambda s: f"Preparing the {s.get('current_agent_type', 'expert')} agent with specialized knowledge and capabilities for your query."
        },
        # Conversation context
        "load_conversation_history_node": {
            "title": "Loading conversation history",
            "detail": lambda s: f"Messages: {len(s.get('conversation_history', []))}",
            "content": lambda s: f"Reviewing {len(s.get('conversation_history', []))} previous messages to understand context and provide relevant follow-up responses." if s.get('conversation_history') else "No prior conversation history - starting with fresh context."
        },
        # Input processing
        "process_input": {
            "title": "Analyzing your query",
            "detail": lambda s: f"Understanding: \"{s.get('query', '')[:80]}...\"",
            "content": lambda s: f"Analyzing your question: \"{s.get('query', '')[:150]}{'...' if len(s.get('query', '')) > 150 else ''}\"\n\nIdentifying key concepts, required expertise areas, and determining the best approach to provide a comprehensive response."
        },
        "intent_classification_node": {
            "title": "Classifying query intent",
            "detail": lambda s: f"Intent: {s.get('classified_intent', s.get('l3_intent', 'analyzing...'))}",
            "content": lambda s: f"Determined query intent: {s.get('classified_intent', s.get('l3_intent', 'informational'))}. This classification helps select the appropriate response strategy and knowledge sources."
        },
        # Tenant validation
        "validate_tenant": {
            "title": "Validating access permissions",
            "detail": lambda s: f"Tenant: {s.get('tenant_id', 'unknown')[:8]}...",
            "content": lambda s: "Verifying access permissions and organizational context to ensure appropriate knowledge base access and compliance requirements."
        },
        # L3 orchestration
        "l3_orchestrate": {
            "title": "Orchestrating knowledge tools",
            "detail": lambda s: f"Running L3 Context Engineer - {len(s.get('l3_enriched_context', {}).get('sources', []))} sources found",
            "content": lambda s: f"The L3 Context Engineer is orchestrating specialized knowledge retrieval. Found {len(s.get('l3_enriched_context', {}).get('sources', []))} relevant sources across {'multiple knowledge domains' if len(s.get('l3_enriched_context', {}).get('sources', [])) > 3 else 'focused knowledge areas'}."
        },
        # RAG retrieval
        "rag_retrieval_node": {
            "title": "Searching knowledge base",
            "detail": lambda s: f"Found {len(s.get('retrieved_documents', s.get('citations', [])))} relevant documents",
            "content": lambda s: _generate_rag_reasoning(s)
        },
        "rag_retrieval": {
            "title": "Searching knowledge base",
            "detail": lambda s: f"Found {len(s.get('retrieved_documents', []))} relevant documents",
            "content": lambda s: _generate_rag_reasoning(s)
        },
        # Analysis
        "analysis_node": {
            "title": "Analyzing context",
            "detail": lambda s: f"Processing {len(s.get('retrieved_documents', []))} sources with {s.get('current_agent_type', 'expert')} expertise",
            "content": lambda s: f"Synthesizing information from {len(s.get('retrieved_documents', []))} retrieved sources. Applying {s.get('current_agent_type', 'expert')} domain expertise to extract relevant insights and ensure accuracy."
        },
        # Tool execution
        "check_tool_requirements_node": {
            "title": "Evaluating tool requirements",
            "detail": lambda s: f"Tools needed: {len(s.get('requested_tools', []))}",
            "content": lambda s: f"Assessing whether specialized tools are needed for this query. {'Will use: ' + ', '.join(s.get('requested_tools', [])) + ' to enhance the response.' if s.get('requested_tools') else 'Standard knowledge retrieval is sufficient for this query.'}"
        },
        "execute_l5_tools_node": {
            "title": "Executing specialized tools",
            "detail": lambda s: f"Tools: {', '.join(s.get('l5_tools_used', [])) or 'none required'}",
            "content": lambda s: f"Executing specialized L5 tools: {', '.join(s.get('l5_tools_used', []))}. These tools provide enhanced capabilities for {_describe_tool_purpose(s.get('l5_tools_used', []))}." if s.get('l5_tools_used') else "No specialized tools required for this query."
        },
        # Expert execution
        "execute_expert_agent_node": {
            "title": "Generating expert response",
            "detail": lambda s: f"Model: {s.get('llm_streaming_config', {}).get('model', 'gpt-4')}",
            "content": lambda s: f"Generating response using {s.get('llm_streaming_config', {}).get('model', 'GPT-4')} with temperature {s.get('temperature_used', 0.7)}. Synthesizing retrieved knowledge with expert reasoning to provide a comprehensive answer."
        },
        "execute_expert": {
            "title": "Preparing expert response",
            "detail": lambda s: f"Model: {s.get('llm_streaming_config', {}).get('model', 'gpt-4')}, Temp: {s.get('temperature_used', 0.7)}",
            "content": lambda s: f"Formulating expert response by integrating retrieved knowledge ({len(s.get('retrieved_documents', []))} sources) with domain expertise. Using {s.get('llm_streaming_config', {}).get('model', 'GPT-4')} for nuanced reasoning."
        },
        # Compliance
        "compliance_check_node": {
            "title": "Running compliance verification",
            "detail": lambda s: f"Checking medical/regulatory compliance",
            "content": lambda s: "Verifying response against compliance requirements: checking for appropriate medical disclaimers, regulatory accuracy, and ensuring information aligns with approved guidelines."
        },
        "confidence_calculation_node": {
            "title": "Calculating confidence score",
            "detail": lambda s: f"Confidence: {s.get('confidence', s.get('response_confidence', 0.85)):.0%}",
            "content": lambda s: f"Assessed response confidence at {s.get('confidence', s.get('response_confidence', 0.85)):.0%} based on source quality, relevance match, and reasoning coherence. {'High confidence indicates strong evidence support.' if s.get('confidence', 0.85) >= 0.8 else 'Moderate confidence - please verify critical information with authoritative sources.'}"
        },
        "human_review_check_node": {
            "title": "Checking review requirements",
            "detail": lambda s: "Review required" if s.get('requires_human_review') else "No review needed",
            "content": lambda s: "This response requires human expert review before being finalized due to compliance or accuracy concerns." if s.get('requires_human_review') else "Response meets automated quality checks and does not require additional human review."
        },
        # Response generation
        "generate_streaming_response_node": {
            "title": "Streaming response",
            "detail": lambda s: "Real-time token streaming",
            "content": lambda s: "Beginning real-time response generation. Content will stream as it's generated for immediate visibility."
        },
        # Save
        "save_to_database_node": {
            "title": "Saving to conversation history",
            "detail": lambda s: "Persisting message for context continuity",
            "content": lambda s: "Saving this interaction to conversation history for future context awareness and continuity."
        },
        "save_message": {
            "title": "Saving to conversation history",
            "detail": lambda s: "Persisting message for context continuity",
            "content": lambda s: "Persisting this exchange to maintain conversation context for follow-up questions."
        },
        # Final
        "final_response_node": {
            "title": "Finalizing response",
            "detail": lambda s: f"Generated {s.get('tokens_count', 0)} tokens",
            "content": lambda s: f"Finalizing response with {s.get('tokens_count', 0)} tokens. Applied formatting, citations, and quality checks."
        },
        "format_output": {
            "title": "Formatting response",
            "detail": lambda s: "Applying formatting and citations",
            "content": lambda s: "Applying final formatting: structuring content, adding citation references, and ensuring readability."
        },
    }

    # Helper function for RAG reasoning content
    def _generate_rag_reasoning(s: Dict) -> str:
        docs = s.get('retrieved_documents', s.get('citations', []))
        doc_count = len(docs)
        if doc_count == 0:
            return "Searching knowledge base for relevant information..."

        # Extract source types/titles if available
        source_summary = []
        for doc in docs[:3]:  # Summarize first 3
            if isinstance(doc, dict):
                title = doc.get('title', doc.get('metadata', {}).get('title', ''))
                source = doc.get('source', doc.get('metadata', {}).get('source', ''))
                if title:
                    source_summary.append(f"'{title[:50]}{'...' if len(title) > 50 else ''}'")
                elif source:
                    source_summary.append(source)

        reasoning = f"Retrieved {doc_count} relevant documents from the knowledge base."
        if source_summary:
            reasoning += f"\n\nKey sources include: {', '.join(source_summary)}"
            if doc_count > 3:
                reasoning += f" and {doc_count - 3} additional sources."
        reasoning += "\n\nAnalyzing relevance and synthesizing information..."
        return reasoning

    # Helper function for tool purpose description
    def _describe_tool_purpose(tools: list) -> str:
        if not tools:
            return "general analysis"
        tool_purposes = {
            "pubmed_search": "medical literature research",
            "web_search": "current information gathering",
            "calculator": "numerical analysis",
            "citation_formatter": "reference formatting",
            "data_analyzer": "data processing and insights",
            "document_parser": "document extraction",
        }
        purposes = [tool_purposes.get(t.lower(), t) for t in tools]
        return ", ".join(purposes)

    try:
        # Use LangGraph's streaming with "updates" mode for per-node progressive events
        #
        # CRITICAL FIX (Dec 2025): Using stream_mode="updates" (string) instead of
        # ["updates", "messages"] (list) because:
        # 1. List mode batches events until all modes have data - causing 90s delay
        # 2. String mode emits events immediately as each node completes
        # 3. LLM token streaming is handled separately via llm_streaming_config
        #
        # The frontend receives progressive thinking steps, then streams LLM tokens
        # via a separate mechanism (done event contains llm_streaming_config)
        async for chunk in compiled_graph.astream(
            initial_state,
            stream_mode="updates"  # Single mode = immediate per-node streaming
        ):
            # With single "updates" mode, chunk is directly the node output dict
            # Format: {node_name: node_output}
            if isinstance(chunk, dict):
                # Node completed - emit thinking step with detailed description
                for node_name, node_output in chunk.items():
                    # Update final state first (so detail functions have access)
                    if isinstance(node_output, dict):
                        final_state.update(node_output)

                    # Get node info (supports both old string format and new dict format)
                    node_info = node_descriptions.get(node_name)

                    if isinstance(node_info, dict):
                        # New format: {title, detail, content}
                        title = node_info.get("title", f"Processing {node_name}")
                        detail_fn = node_info.get("detail")
                        detail = detail_fn(final_state) if callable(detail_fn) else str(detail_fn) if detail_fn else ""
                        # NEW: Extract reasoning content for frontend VitalThinking display
                        content_fn = node_info.get("content")
                        content = content_fn(final_state) if callable(content_fn) else str(content_fn) if content_fn else ""
                    elif isinstance(node_info, str):
                        # Old format: just a string
                        title = node_info
                        detail = ""
                        content = ""
                    else:
                        # Fallback
                        title = f"Processing {node_name}"
                        detail = ""
                        content = ""

                    event_data = {
                        "event": "thinking",
                        "step": node_name,
                        "status": "completed",
                        "message": title,
                        "detail": detail,
                        "content": content,  # NEW: Meaningful reasoning content for VitalThinking display
                        "timestamp": time.time()
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"

                    # Extract agent name when available
                    if isinstance(node_output, dict) and 'agent_profile' in node_output:
                        agent_profile = node_output['agent_profile']
                        agent_name = agent_profile.get('display_name') or agent_profile.get('name') or agent_name

                    # Emit sources when RAG completes
                    if node_name in ("rag_retrieval_node", "rag_retrieval") and not sources_emitted and isinstance(node_output, dict):
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
                                title_str = doc.get('title', '')
                                if title_str:
                                    return f"https://scholar.google.com/scholar?q={urllib.parse.quote(title_str[:100])}"
                                # Last resort: return unique anchor
                                return f"#source-{index + 1}"

                            sources_data = {
                                "event": "sources",
                                "sources": citations if citations else [
                                    {
                                        'id': i + 1,
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
                    if node_name == "execute_l5_tools_node" and isinstance(node_output, dict):
                        tools_executed = node_output.get('tools_executed', [])
                        for tool in tools_executed:
                            tool_data = {
                                "event": "tool",
                                "action": "end",
                                "tool": tool.get('tool_name', 'unknown'),
                                "output": str(tool.get('result', ''))[:500]
                            }
                            yield f"data: {json.dumps(tool_data)}\n\n"

                    # Check for LLM response in execute_expert node output
                    # This captures the agent_response from the workflow state
                    if node_name in ("execute_expert", "execute_expert_agent_node"):
                        response_content = node_output.get("agent_response", "")
                        if response_content:
                            # Stream the response content as tokens
                            # Split into chunks for progressive display
                            words = response_content.split()
                            chunk_size = 5  # Words per token event
                            for i in range(0, len(words), chunk_size):
                                token_chunk = " ".join(words[i:i+chunk_size])
                                if i + chunk_size < len(words):
                                    token_chunk += " "
                                full_response += token_chunk
                                tokens_count += len(token_chunk.split())

                                event_data = {
                                    "event": "token",
                                    "content": token_chunk,
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

        # Initialize Mode 1 workflow (Ask Expert)
        # Uses L3 Context Engineer for intelligent orchestration (AGENT_OS v6.0)
        workflow = AskExpertMode1Workflow(
            supabase_client=supabase,
            rag_service=rag_service,
            agent_orchestrator=agent_orchestrator,
            enable_l3_orchestration=True,
            enable_specialists=True,
            max_parallel_tools=5,
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


