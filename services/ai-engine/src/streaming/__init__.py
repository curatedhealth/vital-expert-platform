"""
World-Class LangGraph Streaming Infrastructure.

Implements all LangGraph streaming capabilities:
- values: Full state after each node
- updates: State deltas only
- messages: LLM token streaming with metadata
- custom: User-defined data streams via get_stream_writer()
- debug: Detailed execution traces

Based on: https://langchain-ai.github.io/langgraph/how-tos/streaming/

Usage:
    # In a FastAPI route:
    from streaming import SSEFormatter, stream_llm_tokens

    formatter = SSEFormatter()

    async def stream_response():
        yield formatter.thinking("start", "running", "Starting...")

        async for token, count, meta in stream_llm_tokens(...):
            yield formatter.token(token, count)

        yield formatter.done(...)
        yield formatter.end()

    # In a LangGraph node (custom streaming):
    from streaming import CustomStreamWriter

    def my_node(state, config):
        writer = CustomStreamWriter(config)
        writer.progress("Processing...", 0.5)
        writer.tool_start("rag_search")
        # Do work...
        writer.tool_end("rag_search", {"docs": 10})
        return state
"""

from .stream_manager import (
    StreamManager,
    StreamMode,
    StreamEvent,
    create_stream_manager,
)
from .sse_formatter import (
    SSEFormatter,
    format_sse_event,
    format_token_event,
    format_thinking_event,
    format_sources_event,
    format_tool_event,
    format_custom_event,
    format_done_event,
    format_error_event,
    format_stream_end,
)
from .token_streamer import (
    TokenStreamer,
    stream_llm_tokens,
    stream_with_context,
)
from .custom_writer import (
    CustomStreamWriter,
    CustomStreamData,
    create_custom_writer,
    write_custom_event,
)

__all__ = [
    # Stream Manager
    "StreamManager",
    "StreamMode",
    "StreamEvent",
    "create_stream_manager",
    # SSE Formatter
    "SSEFormatter",
    "format_sse_event",
    "format_token_event",
    "format_thinking_event",
    "format_sources_event",
    "format_tool_event",
    "format_custom_event",
    "format_done_event",
    "format_error_event",
    "format_stream_end",
    # Token Streamer
    "TokenStreamer",
    "stream_llm_tokens",
    "stream_with_context",
    # Custom Writer
    "CustomStreamWriter",
    "CustomStreamData",
    "create_custom_writer",
    "write_custom_event",
]
