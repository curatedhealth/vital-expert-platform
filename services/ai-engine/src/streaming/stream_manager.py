# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [sse_formatter, token_streamer, custom_writer]
"""
StreamManager - Core streaming orchestration for LangGraph workflows.

World-Class Native LangGraph Streaming Implementation.

Supports all 5 LangGraph stream modes:
- values: Full state after each node execution
- updates: Only state changes (deltas)
- messages: LLM token streaming with AIMessageChunk
- custom: User-defined custom data via get_stream_writer()
- debug: Detailed execution traces for debugging

Usage:
    from streaming import create_stream_manager, StreamMode, SSEFormatter

    # Create manager with native LangGraph streaming
    manager = create_stream_manager(
        compiled_graph,
        stream_modes=[StreamMode.MESSAGES, StreamMode.CUSTOM, StreamMode.UPDATES],
        include_subgraphs=True,  # Stream L3/L4 subgraph outputs
    )

    # Stream with SSE formatting
    async for event in manager.stream(initial_state):
        yield event.to_sse()

LangGraph Integration:
    - Uses native astream() with multi-mode support
    - Captures LLM tokens via 'messages' mode
    - Receives custom events via 'custom' mode (from get_stream_writer)
    - Tracks state updates via 'updates' mode
    - Supports subgraph streaming for L3/L4 agent hierarchy
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Dict, List, Optional, Union, Callable
import time
import json
import uuid
import structlog
from contextlib import asynccontextmanager

logger = structlog.get_logger()


class StreamMode(str, Enum):
    """LangGraph streaming modes."""
    VALUES = "values"       # Full state after each node
    UPDATES = "updates"     # State deltas only
    MESSAGES = "messages"   # LLM tokens with metadata
    CUSTOM = "custom"       # User-defined data
    DEBUG = "debug"         # Detailed traces


@dataclass
class StreamEvent:
    """
    Unified stream event structure for SSE streaming.

    Event types (matching frontend expectations):
    - thinking: Workflow progress/reasoning steps
    - token: LLM response tokens (messages mode)
    - sources: Retrieved documents/citations
    - tool: Tool execution events
    - custom: User-defined data (custom mode)
    - state: State updates (updates/values mode)
    - debug: Debug traces (debug mode)
    - done: Final response with metadata
    - error: Error occurred
    """
    event_type: str                           # thinking | token | sources | tool | custom | state | debug | done | error
    data: Dict[str, Any]                      # Event-specific payload
    timestamp: float = field(default_factory=time.time)
    node_name: Optional[str] = None           # Source node
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_sse(self, use_standard_format: bool = True) -> str:
        """
        Convert to SSE format.

        Args:
            use_standard_format: If True, uses standard SSE with separate event: line
                                If False, uses legacy format with event inside data

        Standard SSE format (frontend-compatible):
            event: token
            data: {"content": "Hello", "tokens": 1, "timestamp": 1234567890.123}

        Legacy format:
            data: {"event": "token", "content": "Hello", "tokens": 1}
        """
        payload = {
            **self.data,
            "timestamp": self.timestamp,
        }
        if self.node_name:
            payload["node"] = self.node_name
        if self.metadata:
            payload["metadata"] = self.metadata

        if use_standard_format:
            # Standard SSE: separate event line + data line
            return f"event: {self.event_type}\ndata: {json.dumps(payload)}\n\n"
        else:
            # Legacy: event type inside data payload
            payload["event"] = self.event_type
            return f"data: {json.dumps(payload)}\n\n"


class StreamManager:
    """
    Orchestrates LangGraph streaming with multiple modes.

    Key capabilities:
    1. Multi-mode streaming (values, updates, messages, custom, debug)
    2. Subgraph output streaming
    3. Real-time token streaming from any node
    4. Custom data injection via stream writer
    5. Detailed debug traces
    """

    def __init__(
        self,
        compiled_graph: Any,
        stream_modes: List[StreamMode] = None,
        include_subgraphs: bool = True,
        debug_mode: bool = False,
    ):
        self.graph = compiled_graph
        self.stream_modes = stream_modes or [StreamMode.MESSAGES, StreamMode.CUSTOM]
        self.include_subgraphs = include_subgraphs
        self.debug_mode = debug_mode or StreamMode.DEBUG in self.stream_modes

        # Convert to string list for LangGraph
        self._mode_strings = [m.value for m in self.stream_modes]

        # Metrics
        self.start_time: Optional[float] = None
        self.tokens_count: int = 0
        self.events_emitted: int = 0

        # State tracking
        self.final_state: Dict[str, Any] = {}
        self.custom_events: List[StreamEvent] = []

    async def stream(
        self,
        initial_state: Dict[str, Any],
        config: Optional[Dict[str, Any]] = None,
    ) -> AsyncIterator[StreamEvent]:
        """
        Stream workflow execution with all configured modes.

        Yields StreamEvent objects that can be converted to SSE.

        Args:
            initial_state: Initial workflow state
            config: Optional LangGraph config (callbacks, recursion_limit, etc.)

        Yields:
            StreamEvent objects for each streaming update
        """
        self.start_time = time.time()
        self.tokens_count = 0
        self.events_emitted = 0

        config = config or {}

        # Emit start event
        yield StreamEvent(
            event_type="thinking",
            data={
                "step": "workflow_start",
                "status": "running",
                "message": "Starting workflow execution",
            }
        )

        try:
            # Use LangGraph's native multi-mode streaming
            # stream_mode can be a list for multiple modes
            async for event in self.graph.astream(
                initial_state,
                config=config,
                stream_mode=self._mode_strings if len(self._mode_strings) > 1 else self._mode_strings[0],
                subgraphs=self.include_subgraphs,
            ):
                # Handle different event structures based on stream_mode
                async for processed_event in self._process_stream_event(event):
                    self.events_emitted += 1
                    yield processed_event

        except Exception as e:
            logger.error("stream_error", error=str(e), exc_info=True)
            yield StreamEvent(
                event_type="error",
                data={
                    "message": str(e),
                    "code": "STREAM_ERROR",
                }
            )

    async def _process_stream_event(
        self,
        event: Any,
    ) -> AsyncIterator[StreamEvent]:
        """
        Process raw LangGraph stream events into StreamEvents.

        Handles all stream mode formats:
        - values: (node_name, full_state)
        - updates: (node_name, state_delta)
        - messages: (AIMessageChunk, metadata)
        - custom: (custom_key, custom_data)
        - debug: detailed trace info
        """
        # Multi-mode returns tuple of (stream_mode, data)
        if isinstance(event, tuple) and len(event) == 2:
            mode, data = event

            if mode == "messages":
                # LLM token streaming
                async for token_event in self._handle_messages_mode(data):
                    yield token_event

            elif mode == "custom":
                # Custom data from get_stream_writer()
                yield self._handle_custom_mode(data)

            elif mode == "values":
                # Full state update
                yield self._handle_values_mode(data)

            elif mode == "updates":
                # State delta
                yield self._handle_updates_mode(data)

            elif mode == "debug":
                # Debug trace
                yield self._handle_debug_mode(data)

        # Single mode (dict) - typically updates mode
        elif isinstance(event, dict):
            for node_name, node_output in event.items():
                yield self._handle_node_output(node_name, node_output)

    async def _handle_messages_mode(
        self,
        data: Any,
    ) -> AsyncIterator[StreamEvent]:
        """
        Handle messages mode - LLM token streaming.

        data format: (AIMessageChunk, metadata_dict)
        """
        if isinstance(data, tuple) and len(data) == 2:
            message_chunk, metadata = data

            # Extract token content
            content = ""
            if hasattr(message_chunk, 'content'):
                content = message_chunk.content
            elif isinstance(message_chunk, dict):
                content = message_chunk.get('content', '')

            if content:
                self.tokens_count += 1
                yield StreamEvent(
                    event_type="token",
                    data={
                        "content": content,
                        "tokenIndex": self.tokens_count,  # Match frontend TokenEvent
                    },
                    metadata=metadata if isinstance(metadata, dict) else {},
                )

    def _handle_custom_mode(self, data: Any) -> StreamEvent:
        """
        Handle custom mode - user-defined data from get_stream_writer().

        data format: (custom_key, custom_value) or dict
        """
        if isinstance(data, tuple) and len(data) == 2:
            key, value = data
            return StreamEvent(
                event_type="custom",
                data={
                    "key": key,
                    "value": value,
                }
            )
        elif isinstance(data, dict):
            return StreamEvent(
                event_type="custom",
                data=data,
            )
        return StreamEvent(
            event_type="custom",
            data={"raw": str(data)},
        )

    def _handle_values_mode(self, data: Any) -> StreamEvent:
        """
        Handle values mode - full state after node.
        """
        # Update our final state tracking
        if isinstance(data, dict):
            self.final_state.update(data)

        return StreamEvent(
            event_type="state",
            data={
                "mode": "values",
                "state_keys": list(data.keys()) if isinstance(data, dict) else [],
            }
        )

    def _handle_updates_mode(self, data: Any) -> StreamEvent:
        """
        Handle updates mode - state deltas only.
        """
        if isinstance(data, dict):
            self.final_state.update(data)

        return StreamEvent(
            event_type="state",
            data={
                "mode": "updates",
                "updated_keys": list(data.keys()) if isinstance(data, dict) else [],
            }
        )

    def _handle_debug_mode(self, data: Any) -> StreamEvent:
        """
        Handle debug mode - detailed execution traces.
        """
        return StreamEvent(
            event_type="debug",
            data={
                "trace": data if isinstance(data, dict) else str(data),
            }
        )

    def _handle_node_output(
        self,
        node_name: str,
        node_output: Any,
    ) -> StreamEvent:
        """
        Handle single-mode node output (typically updates).
        """
        # Update final state
        if isinstance(node_output, dict):
            self.final_state.update(node_output)

        # Map node names to thinking step descriptions
        node_descriptions = {
            "process_input": "Analyzing your query",
            "load_session": "Loading conversation context",
            "validate_tenant": "Validating access permissions",
            "load_agent": "Activating expert agent",
            "l3_orchestrate": "Orchestrating knowledge tools",
            "rag_retrieval": "Searching knowledge base",
            "execute_expert": "Preparing expert response",
            "save_message": "Saving to conversation history",
            "format_output": "Formatting response",
        }

        message = node_descriptions.get(node_name, f"Processing {node_name}")

        return StreamEvent(
            event_type="thinking",
            node_name=node_name,
            data={
                "step": node_name,
                "status": "completed",
                "message": message,
                "detail": self._get_node_detail(node_name, node_output),
            }
        )

    def _get_node_detail(
        self,
        node_name: str,
        node_output: Any,
    ) -> str:
        """Get detailed description for a node's output."""
        if not isinstance(node_output, dict):
            return ""

        details = {
            "process_input": lambda o: f"Query: \"{o.get('query', '')[:80]}...\"",
            "load_session": lambda o: f"Session: {o.get('session_id', 'new')}",
            "validate_tenant": lambda o: f"Tenant: {str(o.get('tenant_id', ''))[:8]}...",
            "load_agent": lambda o: f"Agent: {o.get('current_agent_type', 'Loading...')}",
            "l3_orchestrate": lambda o: f"Tools: {o.get('l3_tools_used', 0)}, Sources: {o.get('l3_sources_used', 0)}",
            "rag_retrieval": lambda o: f"Found {len(o.get('retrieved_documents', []))} documents",
            "execute_expert": lambda o: f"Model: {o.get('llm_streaming_config', {}).get('model', 'gpt-4')}, Temp: {o.get('temperature_used', 0.7)}",
            "save_message": lambda o: "Message persisted",
            "format_output": lambda o: "Response formatted",
        }

        detail_fn = details.get(node_name, lambda o: "")
        try:
            return detail_fn(node_output)
        except:
            return ""

    def get_metrics(self) -> Dict[str, Any]:
        """Get streaming metrics."""
        elapsed = time.time() - self.start_time if self.start_time else 0
        return {
            "elapsed_ms": round(elapsed * 1000, 2),
            "tokens_streamed": self.tokens_count,
            "tokens_per_second": round(self.tokens_count / elapsed, 2) if elapsed > 0 else 0,
            "events_emitted": self.events_emitted,
            "stream_modes": self._mode_strings,
        }

    async def stream_with_sse(
        self,
        initial_state: Dict[str, Any],
        config: Optional[Dict[str, Any]] = None,
        agent_id: str = "",
        agent_name: str = "AI Assistant",
    ) -> AsyncIterator[str]:
        """
        Stream workflow with automatic SSE formatting and done event.

        This is the preferred method for FastAPI routes - handles
        all event formatting, metrics, and done event generation.

        Args:
            initial_state: Initial workflow state
            config: Optional LangGraph config
            agent_id: Agent ID for done event
            agent_name: Agent name for done event

        Yields:
            SSE-formatted strings ready for HTTP streaming
        """
        full_response = ""
        citations = []
        reasoning_steps = []

        async for event in self.stream(initial_state, config):
            # Track response content and citations
            if event.event_type == "token":
                full_response += event.data.get("content", "")
            elif event.event_type == "sources":
                citations = event.data.get("sources", [])
            elif event.event_type == "thinking":
                reasoning_steps.append({
                    "step": event.data.get("step", ""),
                    "content": event.data.get("message", ""),
                    "status": event.data.get("status", "completed"),
                })

            yield event.to_sse()

        # Emit done event with full response and metrics
        metrics = self.get_metrics()
        done_event = StreamEvent(
            event_type="done",
            data={
                "agent_id": agent_id,
                "agent_name": agent_name,
                "content": full_response,
                "confidence": 0.85,
                "sources": citations,
                "citations": citations,
                "reasoning": reasoning_steps,
                "response_source": "llm",
                "metrics": metrics,
            },
        )
        yield done_event.to_sse()

        # Emit end marker
        yield "data: [DONE]\n\n"


def create_stream_manager(
    compiled_graph: Any,
    stream_modes: Optional[List[Union[str, StreamMode]]] = None,
    include_subgraphs: bool = True,
    debug_mode: bool = False,
) -> StreamManager:
    """
    Factory function to create a StreamManager.

    Args:
        compiled_graph: Compiled LangGraph StateGraph
        stream_modes: List of modes - ["messages", "custom"] or [StreamMode.MESSAGES, StreamMode.CUSTOM]
        include_subgraphs: Whether to include subgraph outputs
        debug_mode: Enable debug tracing

    Returns:
        Configured StreamManager instance
    """
    # Normalize stream modes
    if stream_modes:
        normalized_modes = []
        for mode in stream_modes:
            if isinstance(mode, str):
                normalized_modes.append(StreamMode(mode))
            else:
                normalized_modes.append(mode)
    else:
        # Default: messages + custom for best streaming experience
        normalized_modes = [StreamMode.MESSAGES, StreamMode.CUSTOM]

    return StreamManager(
        compiled_graph=compiled_graph,
        stream_modes=normalized_modes,
        include_subgraphs=include_subgraphs,
        debug_mode=debug_mode,
    )
