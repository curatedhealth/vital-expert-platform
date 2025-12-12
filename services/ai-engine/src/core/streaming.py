"""
Token-Level Streaming for LLM Responses.

Production-grade streaming utilities for:
- Token-by-token streaming from LLM providers
- Async iterators for SSE endpoints
- Buffering and chunk management
- Stream transformation and filtering
- Backpressure handling

This module provides the foundation for real-time AI responses
in Mode 1 (Interactive) and Mode 3 (Deep Research).

Usage:
    from core.streaming import TokenStream, stream_llm_response

    async for chunk in stream_llm_response(model, messages):
        await sse_queue.put(chunk)
"""

from typing import (
    Any, AsyncIterator, Callable, Dict, Generic, List, Optional, TypeVar, Union
)
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import asyncio
import json
import time
import structlog

logger = structlog.get_logger()

T = TypeVar("T")


# ============================================================================
# Stream Event Types
# ============================================================================

class StreamEventType(str, Enum):
    """Types of streaming events."""
    # Content events
    TOKEN = "token"                    # Single token from LLM
    CHUNK = "chunk"                    # Chunk of text (may be multiple tokens)
    CONTENT_BLOCK_START = "content_block_start"
    CONTENT_BLOCK_DELTA = "content_block_delta"
    CONTENT_BLOCK_END = "content_block_end"

    # Tool events
    TOOL_CALL_START = "tool_call_start"
    TOOL_CALL_ARGS = "tool_call_args"
    TOOL_CALL_END = "tool_call_end"
    TOOL_RESULT = "tool_result"

    # Control events
    START = "start"                    # Stream started
    END = "end"                        # Stream completed
    ERROR = "error"                    # Error occurred
    HEARTBEAT = "heartbeat"            # Keep-alive ping

    # Metadata events
    USAGE = "usage"                    # Token usage stats
    METADATA = "metadata"              # Additional info


@dataclass
class StreamEvent:
    """A single event in a token stream."""
    event_type: StreamEventType
    data: Any
    timestamp: datetime = field(default_factory=datetime.utcnow)
    sequence: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_sse(self) -> str:
        """Convert to SSE format."""
        event_data = {
            "type": self.event_type.value,
            "data": self.data,
            "seq": self.sequence,
            "ts": self.timestamp.isoformat(),
        }
        if self.metadata:
            event_data["metadata"] = self.metadata

        return f"data: {json.dumps(event_data)}\n\n"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "type": self.event_type.value,
            "data": self.data,
            "sequence": self.sequence,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata,
        }


# ============================================================================
# Stream Configuration
# ============================================================================

@dataclass
class StreamConfig:
    """Configuration for token streaming."""
    # Buffer settings
    buffer_size: int = 100              # Max events to buffer
    flush_interval: float = 0.1         # Seconds between flushes

    # Chunking
    min_chunk_size: int = 1             # Minimum chars per chunk
    max_chunk_size: int = 1000          # Maximum chars per chunk

    # Timeouts
    token_timeout: float = 30.0         # Max time between tokens
    total_timeout: float = 300.0        # Max total stream time

    # Heartbeat
    heartbeat_interval: float = 15.0    # Seconds between heartbeats
    enable_heartbeat: bool = True

    # Error handling
    max_retries: int = 3
    retry_delay: float = 1.0


DEFAULT_STREAM_CONFIG = StreamConfig()


# ============================================================================
# Token Stream
# ============================================================================

class TokenStream:
    """
    Async iterator for token-level streaming.

    Wraps LLM provider streams and provides:
    - Uniform interface across providers
    - Buffering and backpressure
    - Timeout handling
    - Usage tracking
    """

    def __init__(
        self,
        source: AsyncIterator[Any],
        config: Optional[StreamConfig] = None,
        transform: Optional[Callable[[Any], Optional[StreamEvent]]] = None,
    ):
        self.source = source
        self.config = config or DEFAULT_STREAM_CONFIG
        self.transform = transform

        self._buffer: asyncio.Queue[StreamEvent] = asyncio.Queue(
            maxsize=self.config.buffer_size
        )
        self._sequence = 0
        self._started = False
        self._finished = False
        self._error: Optional[Exception] = None
        self._started_at: Optional[datetime] = None
        self._finished_at: Optional[datetime] = None

        # Usage tracking
        self._input_tokens = 0
        self._output_tokens = 0
        self._total_chars = 0

        # Tasks
        self._producer_task: Optional[asyncio.Task] = None
        self._heartbeat_task: Optional[asyncio.Task] = None

    async def __aiter__(self):
        return self

    async def __anext__(self) -> StreamEvent:
        if self._finished and self._buffer.empty():
            raise StopAsyncIteration

        if not self._started:
            await self._start()

        try:
            # Wait for next event with timeout
            event = await asyncio.wait_for(
                self._buffer.get(),
                timeout=self.config.token_timeout
            )

            if event.event_type == StreamEventType.END:
                self._finished = True
                raise StopAsyncIteration

            if event.event_type == StreamEventType.ERROR:
                raise RuntimeError(event.data)

            return event

        except asyncio.TimeoutError:
            self._finished = True
            raise RuntimeError(f"Token timeout after {self.config.token_timeout}s")

    async def _start(self):
        """Start the stream producer."""
        self._started = True
        self._started_at = datetime.utcnow()

        # Start producer task
        self._producer_task = asyncio.create_task(self._produce())

        # Start heartbeat if enabled
        if self.config.enable_heartbeat:
            self._heartbeat_task = asyncio.create_task(self._heartbeat())

        # Emit start event
        await self._emit(StreamEvent(
            event_type=StreamEventType.START,
            data={"config": self.config.__dict__},
            sequence=self._next_sequence(),
        ))

    async def _produce(self):
        """Produce events from source."""
        try:
            async for item in self.source:
                if self._finished:
                    break

                # Transform if transformer provided
                if self.transform:
                    event = self.transform(item)
                    if event:
                        await self._emit(event)
                else:
                    # Default: treat as token
                    await self._emit(StreamEvent(
                        event_type=StreamEventType.TOKEN,
                        data=item,
                        sequence=self._next_sequence(),
                    ))

            # Emit end event
            self._finished_at = datetime.utcnow()
            await self._emit(StreamEvent(
                event_type=StreamEventType.END,
                data={
                    "input_tokens": self._input_tokens,
                    "output_tokens": self._output_tokens,
                    "total_chars": self._total_chars,
                    "duration_ms": self._duration_ms,
                },
                sequence=self._next_sequence(),
            ))

        except Exception as e:
            logger.error("stream_producer_error", error=str(e), exc_info=True)
            self._error = e
            await self._emit(StreamEvent(
                event_type=StreamEventType.ERROR,
                data=str(e),
                sequence=self._next_sequence(),
            ))

        finally:
            self._finished = True
            if self._heartbeat_task:
                self._heartbeat_task.cancel()

    async def _heartbeat(self):
        """Send periodic heartbeat events."""
        while not self._finished:
            await asyncio.sleep(self.config.heartbeat_interval)
            if not self._finished:
                try:
                    await self._emit(StreamEvent(
                        event_type=StreamEventType.HEARTBEAT,
                        data={"ts": datetime.utcnow().isoformat()},
                        sequence=self._next_sequence(),
                    ))
                except Exception:
                    pass  # Ignore heartbeat errors

    async def _emit(self, event: StreamEvent):
        """Emit an event to the buffer."""
        try:
            self._buffer.put_nowait(event)
        except asyncio.QueueFull:
            # Backpressure: wait for space
            await self._buffer.put(event)

    def _next_sequence(self) -> int:
        """Get next sequence number."""
        seq = self._sequence
        self._sequence += 1
        return seq

    @property
    def _duration_ms(self) -> float:
        """Get stream duration in milliseconds."""
        if not self._started_at:
            return 0
        end = self._finished_at or datetime.utcnow()
        return (end - self._started_at).total_seconds() * 1000

    async def cancel(self):
        """Cancel the stream."""
        self._finished = True
        if self._producer_task:
            self._producer_task.cancel()
        if self._heartbeat_task:
            self._heartbeat_task.cancel()

    def update_usage(self, input_tokens: int = 0, output_tokens: int = 0):
        """Update token usage tracking."""
        self._input_tokens += input_tokens
        self._output_tokens += output_tokens


# ============================================================================
# Provider-Specific Transformers
# ============================================================================

def openai_stream_transformer(chunk: Any) -> Optional[StreamEvent]:
    """Transform OpenAI streaming response to StreamEvent."""
    try:
        # Handle OpenAI ChatCompletion chunk
        if hasattr(chunk, 'choices') and chunk.choices:
            choice = chunk.choices[0]
            delta = getattr(choice, 'delta', None)

            if delta:
                content = getattr(delta, 'content', None)
                if content:
                    return StreamEvent(
                        event_type=StreamEventType.CHUNK,
                        data=content,
                    )

                # Tool calls
                tool_calls = getattr(delta, 'tool_calls', None)
                if tool_calls:
                    for tc in tool_calls:
                        if tc.function:
                            if tc.function.name:
                                return StreamEvent(
                                    event_type=StreamEventType.TOOL_CALL_START,
                                    data={
                                        "id": tc.id,
                                        "name": tc.function.name,
                                    },
                                )
                            if tc.function.arguments:
                                return StreamEvent(
                                    event_type=StreamEventType.TOOL_CALL_ARGS,
                                    data={
                                        "id": tc.id,
                                        "args": tc.function.arguments,
                                    },
                                )

            # Finish reason
            finish_reason = getattr(choice, 'finish_reason', None)
            if finish_reason:
                return StreamEvent(
                    event_type=StreamEventType.END,
                    data={"finish_reason": finish_reason},
                )

        # Usage stats
        if hasattr(chunk, 'usage') and chunk.usage:
            return StreamEvent(
                event_type=StreamEventType.USAGE,
                data={
                    "input_tokens": chunk.usage.prompt_tokens,
                    "output_tokens": chunk.usage.completion_tokens,
                    "total_tokens": chunk.usage.total_tokens,
                },
            )

    except Exception as e:
        logger.warning("openai_transform_error", error=str(e))

    return None


def anthropic_stream_transformer(event: Any) -> Optional[StreamEvent]:
    """Transform Anthropic streaming event to StreamEvent."""
    try:
        event_type = getattr(event, 'type', None)

        if event_type == 'content_block_start':
            return StreamEvent(
                event_type=StreamEventType.CONTENT_BLOCK_START,
                data={
                    "index": event.index,
                    "content_block": event.content_block.__dict__
                    if hasattr(event.content_block, '__dict__')
                    else str(event.content_block)
                },
            )

        elif event_type == 'content_block_delta':
            delta = event.delta
            if hasattr(delta, 'text'):
                return StreamEvent(
                    event_type=StreamEventType.CHUNK,
                    data=delta.text,
                )
            elif hasattr(delta, 'partial_json'):
                return StreamEvent(
                    event_type=StreamEventType.TOOL_CALL_ARGS,
                    data={"args": delta.partial_json},
                )

        elif event_type == 'content_block_stop':
            return StreamEvent(
                event_type=StreamEventType.CONTENT_BLOCK_END,
                data={"index": event.index},
            )

        elif event_type == 'message_start':
            return StreamEvent(
                event_type=StreamEventType.START,
                data={
                    "model": event.message.model if hasattr(event, 'message') else None,
                },
            )

        elif event_type == 'message_delta':
            return StreamEvent(
                event_type=StreamEventType.USAGE,
                data={
                    "output_tokens": event.usage.output_tokens
                    if hasattr(event, 'usage') else 0,
                    "stop_reason": event.delta.stop_reason
                    if hasattr(event.delta, 'stop_reason') else None,
                },
            )

        elif event_type == 'message_stop':
            return StreamEvent(
                event_type=StreamEventType.END,
                data={},
            )

    except Exception as e:
        logger.warning("anthropic_transform_error", error=str(e))

    return None


# ============================================================================
# Streaming Utilities
# ============================================================================

async def stream_to_string(stream: AsyncIterator[StreamEvent]) -> str:
    """Collect stream into a single string."""
    chunks = []
    async for event in stream:
        if event.event_type in (StreamEventType.TOKEN, StreamEventType.CHUNK):
            chunks.append(str(event.data))
    return "".join(chunks)


async def stream_with_callback(
    stream: AsyncIterator[StreamEvent],
    on_token: Optional[Callable[[str], None]] = None,
    on_complete: Optional[Callable[[str, Dict[str, Any]], None]] = None,
    on_error: Optional[Callable[[Exception], None]] = None,
) -> str:
    """
    Stream with callbacks for each event.

    Returns the complete response text.
    """
    chunks = []
    metadata = {}

    try:
        async for event in stream:
            if event.event_type in (StreamEventType.TOKEN, StreamEventType.CHUNK):
                chunk = str(event.data)
                chunks.append(chunk)
                if on_token:
                    on_token(chunk)

            elif event.event_type == StreamEventType.USAGE:
                metadata["usage"] = event.data

            elif event.event_type == StreamEventType.END:
                metadata["end_data"] = event.data

        result = "".join(chunks)
        if on_complete:
            on_complete(result, metadata)
        return result

    except Exception as e:
        if on_error:
            on_error(e)
        raise


class StreamBuffer:
    """
    Buffer for accumulating stream chunks.

    Useful for building complete responses while streaming.
    """

    def __init__(self, max_size: int = 100000):
        self.max_size = max_size
        self._chunks: List[str] = []
        self._total_length = 0
        self._events: List[StreamEvent] = []

    def append(self, chunk: str):
        """Append a chunk to the buffer."""
        if self._total_length + len(chunk) > self.max_size:
            raise ValueError(f"Buffer overflow: max size {self.max_size}")
        self._chunks.append(chunk)
        self._total_length += len(chunk)

    def append_event(self, event: StreamEvent):
        """Append an event to the buffer."""
        self._events.append(event)
        if event.event_type in (StreamEventType.TOKEN, StreamEventType.CHUNK):
            self.append(str(event.data))

    def get_text(self) -> str:
        """Get accumulated text."""
        return "".join(self._chunks)

    def get_events(self) -> List[StreamEvent]:
        """Get all events."""
        return list(self._events)

    def clear(self):
        """Clear the buffer."""
        self._chunks.clear()
        self._events.clear()
        self._total_length = 0

    @property
    def length(self) -> int:
        return self._total_length

    @property
    def event_count(self) -> int:
        return len(self._events)


# ============================================================================
# Stream Combiners
# ============================================================================

async def merge_streams(
    *streams: AsyncIterator[StreamEvent],
    strategy: str = "interleave",
) -> AsyncIterator[StreamEvent]:
    """
    Merge multiple streams into one.

    Args:
        streams: Streams to merge
        strategy: "interleave" (round-robin) or "concat" (sequential)

    Yields:
        StreamEvent from all streams
    """
    if strategy == "concat":
        for stream in streams:
            async for event in stream:
                yield event
    else:
        # Interleave using asyncio.as_completed
        queues = [asyncio.Queue() for _ in streams]

        async def feed_queue(stream: AsyncIterator[StreamEvent], queue: asyncio.Queue):
            try:
                async for event in stream:
                    await queue.put(event)
            finally:
                await queue.put(None)  # Sentinel

        tasks = [
            asyncio.create_task(feed_queue(stream, queue))
            for stream, queue in zip(streams, queues)
        ]

        active = set(range(len(queues)))

        try:
            while active:
                for i in list(active):
                    try:
                        event = queues[i].get_nowait()
                        if event is None:
                            active.discard(i)
                        else:
                            yield event
                    except asyncio.QueueEmpty:
                        pass
                await asyncio.sleep(0.01)  # Small delay to prevent busy loop

        finally:
            for task in tasks:
                task.cancel()


async def tee_stream(
    stream: AsyncIterator[StreamEvent],
    num_copies: int = 2,
) -> List[AsyncIterator[StreamEvent]]:
    """
    Split a stream into multiple copies.

    Each copy receives the same events.
    """
    queues = [asyncio.Queue() for _ in range(num_copies)]

    async def producer():
        try:
            async for event in stream:
                for queue in queues:
                    await queue.put(event)
        finally:
            for queue in queues:
                await queue.put(None)  # Sentinel

    async def consumer(queue: asyncio.Queue) -> AsyncIterator[StreamEvent]:
        while True:
            event = await queue.get()
            if event is None:
                break
            yield event

    # Start producer
    asyncio.create_task(producer())

    return [consumer(queue) for queue in queues]


# ============================================================================
# SSE Helpers
# ============================================================================

def format_sse_event(
    event_type: str,
    data: Any,
    event_id: Optional[str] = None,
) -> str:
    """Format data as SSE event string."""
    lines = []

    if event_id:
        lines.append(f"id: {event_id}")

    lines.append(f"event: {event_type}")

    if isinstance(data, (dict, list)):
        data_str = json.dumps(data)
    else:
        data_str = str(data)

    # Handle multi-line data
    for line in data_str.split('\n'):
        lines.append(f"data: {line}")

    lines.append("")  # Empty line to end event
    return "\n".join(lines) + "\n"


async def sse_stream_generator(
    stream: AsyncIterator[StreamEvent],
) -> AsyncIterator[str]:
    """Convert StreamEvent iterator to SSE string iterator."""
    async for event in stream:
        yield event.to_sse()


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Event types
    "StreamEventType",
    "StreamEvent",

    # Configuration
    "StreamConfig",
    "DEFAULT_STREAM_CONFIG",

    # Core stream
    "TokenStream",

    # Transformers
    "openai_stream_transformer",
    "anthropic_stream_transformer",

    # Utilities
    "stream_to_string",
    "stream_with_callback",
    "StreamBuffer",

    # Combiners
    "merge_streams",
    "tee_stream",

    # SSE helpers
    "format_sse_event",
    "sse_stream_generator",
]
