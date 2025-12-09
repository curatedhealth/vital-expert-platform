"""
SSE (Server-Sent Events) Formatter.

Converts StreamEvents to SSE format for HTTP streaming.
Provides consistent event structure for frontend consumption.

Event Format:
```
data: {"event": "token", "content": "Hello", "tokens": 1, "timestamp": 1234567890.123}

```
"""

import json
from typing import Any, Dict, Optional
from dataclasses import dataclass
import time


@dataclass
class SSEEvent:
    """Server-Sent Event structure."""
    event_type: str
    data: Dict[str, Any]
    id: Optional[str] = None
    retry: Optional[int] = None  # Reconnection time in ms


def format_sse_event(
    event_type: str,
    data: Dict[str, Any],
    event_id: Optional[str] = None,
    retry: Optional[int] = None,
    include_timestamp: bool = True,
    use_standard_format: bool = True,
) -> str:
    """
    Format data as an SSE event.

    Standard SSE format (use_standard_format=True):
        event: token
        data: {"content": "Hello", "tokens": 1}

    Legacy format (use_standard_format=False):
        data: {"event": "token", "content": "Hello", "tokens": 1}

    Args:
        event_type: Type of event (token, thinking, sources, done, error)
        data: Event payload dictionary
        event_id: Optional event ID for resumption
        retry: Optional reconnection time in milliseconds
        include_timestamp: Whether to include timestamp in payload
        use_standard_format: Use standard SSE event: field (default True)

    Returns:
        SSE-formatted string
    """
    # Build payload
    payload = {**data}

    if include_timestamp and "timestamp" not in payload:
        payload["timestamp"] = time.time()

    # Build SSE string
    parts = []

    if event_id:
        parts.append(f"id: {event_id}")

    if retry is not None:
        parts.append(f"retry: {retry}")

    if use_standard_format:
        # Standard SSE format: separate event and data lines
        parts.append(f"event: {event_type}")
        parts.append(f"data: {json.dumps(payload)}")
    else:
        # Legacy format: event type inside data payload
        payload["event"] = event_type
        parts.append(f"data: {json.dumps(payload)}")

    return "\n".join(parts) + "\n\n"


def format_token_event(
    content: str,
    token_count: int,
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Format a token streaming event.

    This is the most common event type during LLM generation.
    """
    data = {
        "content": content,
        "tokens": token_count,
    }
    if metadata:
        data["metadata"] = metadata

    return format_sse_event("token", data)


def format_thinking_event(
    step: str,
    status: str,
    message: str,
    detail: Optional[str] = None,
) -> str:
    """
    Format a thinking/reasoning step event.

    Used to show workflow progress (RAG retrieval, agent loading, etc.)
    """
    data = {
        "step": step,
        "status": status,
        "message": message,
    }
    if detail:
        data["detail"] = detail

    return format_sse_event("thinking", data)


def format_sources_event(
    sources: list,
    total: Optional[int] = None,
) -> str:
    """
    Format a sources/citations event.

    Emitted after RAG retrieval with relevant documents.
    """
    return format_sse_event("sources", {
        "sources": sources,
        "total": total if total is not None else len(sources),
    })


def format_tool_event(
    tool_name: str,
    status: str,
    input_data: Optional[Dict[str, Any]] = None,
    output_data: Optional[Any] = None,
    error: Optional[str] = None,
) -> str:
    """
    Format a tool execution event.

    Emitted when tools are called (L5 tools, search, etc.)
    """
    data = {
        "tool": tool_name,
        "status": status,
    }
    if input_data:
        data["input"] = input_data
    if output_data:
        data["output"] = output_data
    if error:
        data["error"] = error

    return format_sse_event("tool", data)


def format_custom_event(
    key: str,
    value: Any,
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Format a custom data event.

    For user-defined streaming data via get_stream_writer().
    """
    data = {
        "key": key,
        "value": value,
    }
    if metadata:
        data["metadata"] = metadata

    return format_sse_event("custom", data)


def format_done_event(
    agent_id: str,
    agent_name: str,
    content: str,
    confidence: float,
    sources: list,
    reasoning: list,
    metrics: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Format the final done event with complete response data.

    This is the last event emitted, containing the full response and metadata.
    """
    data = {
        "agent_id": agent_id,
        "agent_name": agent_name,
        "content": content,
        "confidence": confidence,
        "sources": sources,
        "citations": sources,  # Alias for compatibility
        "reasoning": reasoning,
        "response_source": "llm",
        "metrics": metrics,
    }
    if metadata:
        data["metadata"] = metadata

    return format_sse_event("done", data)


def format_error_event(
    message: str,
    code: str = "UNKNOWN_ERROR",
    details: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Format an error event.
    """
    data = {
        "message": message,
        "code": code,
    }
    if details:
        data["details"] = details

    return format_sse_event("error", data)


def format_stream_end() -> str:
    """
    Format the SSE stream end marker.

    Convention: [DONE] signals end of stream.
    """
    return "data: [DONE]\n\n"


class SSEFormatter:
    """
    Stateful SSE formatter with event ID tracking.

    Useful for resumable streams and debugging.
    """

    def __init__(
        self,
        include_ids: bool = True,
        retry_ms: Optional[int] = None,
    ):
        self.include_ids = include_ids
        self.retry_ms = retry_ms
        self._event_counter = 0

    def _next_id(self) -> Optional[str]:
        """Generate next event ID if enabled."""
        if not self.include_ids:
            return None
        self._event_counter += 1
        return str(self._event_counter)

    def token(
        self,
        content: str,
        token_count: int,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Format token event with ID."""
        data = {"content": content, "tokens": token_count}
        if metadata:
            data["metadata"] = metadata
        return format_sse_event(
            "token",
            data,
            event_id=self._next_id(),
            retry=self.retry_ms,
        )

    def thinking(
        self,
        step: str,
        status: str,
        message: str,
        detail: Optional[str] = None,
    ) -> str:
        """Format thinking event with ID."""
        data = {"step": step, "status": status, "message": message}
        if detail:
            data["detail"] = detail
        return format_sse_event(
            "thinking",
            data,
            event_id=self._next_id(),
            retry=self.retry_ms,
        )

    def sources(self, sources: list, total: Optional[int] = None) -> str:
        """Format sources event with ID."""
        return format_sse_event(
            "sources",
            {"sources": sources, "total": total or len(sources)},
            event_id=self._next_id(),
            retry=self.retry_ms,
        )

    def tool(
        self,
        tool_name: str,
        status: str,
        input_data: Optional[Dict] = None,
        output_data: Optional[Any] = None,
        error: Optional[str] = None,
    ) -> str:
        """Format tool event with ID."""
        data = {"tool": tool_name, "status": status}
        if input_data:
            data["input"] = input_data
        if output_data:
            data["output"] = output_data
        if error:
            data["error"] = error
        return format_sse_event(
            "tool",
            data,
            event_id=self._next_id(),
            retry=self.retry_ms,
        )

    def custom(
        self,
        key: str,
        value: Any,
        metadata: Optional[Dict] = None,
    ) -> str:
        """Format custom event with ID."""
        data = {"key": key, "value": value}
        if metadata:
            data["metadata"] = metadata
        return format_sse_event(
            "custom",
            data,
            event_id=self._next_id(),
            retry=self.retry_ms,
        )

    def done(
        self,
        agent_id: str,
        agent_name: str,
        content: str,
        confidence: float,
        sources: list,
        reasoning: list,
        metrics: Dict[str, Any],
        metadata: Optional[Dict] = None,
    ) -> str:
        """Format done event with ID."""
        data = {
            "agent_id": agent_id,
            "agent_name": agent_name,
            "content": content,
            "confidence": confidence,
            "sources": sources,
            "citations": sources,
            "reasoning": reasoning,
            "response_source": "llm",
            "metrics": metrics,
        }
        if metadata:
            data["metadata"] = metadata
        return format_sse_event(
            "done",
            data,
            event_id=self._next_id(),
            retry=self.retry_ms,
        )

    def error(
        self,
        message: str,
        code: str = "UNKNOWN_ERROR",
        details: Optional[Dict] = None,
    ) -> str:
        """Format error event with ID."""
        data = {"message": message, "code": code}
        if details:
            data["details"] = details
        return format_sse_event(
            "error",
            data,
            event_id=self._next_id(),
            retry=self.retry_ms,
        )

    def end(self) -> str:
        """Format stream end marker."""
        return format_stream_end()

    @property
    def events_emitted(self) -> int:
        """Number of events emitted."""
        return self._event_counter
