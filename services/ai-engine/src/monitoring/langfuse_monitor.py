"""
Langfuse LLM Observability Monitor (v3.x API)

Provides tracing and monitoring for LLM calls in the VITAL AI Engine.
Integrates with Langfuse cloud for:
- Token usage tracking
- Latency monitoring
- Cost estimation
- Session-based conversation tracking
- Agent performance analytics

Updated for Langfuse 3.x which uses OpenTelemetry as foundation.
"""

import os
import time
from typing import Any, Dict, Optional, List
from functools import wraps
from contextlib import contextmanager
import structlog

# Langfuse 3.x imports
from langfuse import get_client

logger = structlog.get_logger(__name__)


class LangfuseMonitor:
    """
    LLM observability monitor using Langfuse 3.x.

    Langfuse 3.x uses OpenTelemetry as the foundation.
    Key methods:
    - start_as_current_span() for creating spans
    - start_as_current_generation() for LLM generations
    - update_current_trace() for setting trace-level metadata
    """

    _instance: Optional["LangfuseMonitor"] = None

    def __new__(cls):
        """Singleton pattern - one Langfuse client per process."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.enabled = False
        self.client = None

        # Load config from environment
        public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
        secret_key = os.getenv("LANGFUSE_SECRET_KEY")
        host = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

        if public_key and secret_key:
            try:
                # Langfuse 3.x uses get_client() which auto-configures from env
                self.client = get_client()
                self.enabled = True
                logger.info("Langfuse monitoring enabled", host=host)
            except Exception as e:
                logger.warning("Failed to initialize Langfuse", error=str(e))
                self.enabled = False
        else:
            logger.info("Langfuse monitoring disabled - missing credentials")

        self._initialized = True

    def create_trace(
        self,
        name: str,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None
    ):
        """
        Create a new trace for tracking a conversation/request.

        In Langfuse 3.x, we use start_as_current_span as the root
        and then update_current_trace to set session/user info.

        Args:
            name: Trace name (e.g., "mode1_interactive", "agent_query")
            session_id: Session identifier for grouping related traces
            user_id: User identifier
            metadata: Additional trace metadata
            tags: Tags for filtering/organizing traces

        Returns:
            Context manager for the span, or None if disabled
        """
        if not self.enabled or not self.client:
            return None

        try:
            # Create a span and immediately set trace-level info
            span_ctx = self.client.start_as_current_span(
                name=name,
                metadata=metadata or {},
            )

            # Update trace with session/user info
            self.client.update_current_trace(
                session_id=session_id,
                user_id=user_id,
                tags=tags,
            )

            logger.debug("Created Langfuse span/trace", name=name, session_id=session_id)
            return span_ctx
        except Exception as e:
            logger.error("Failed to create Langfuse trace", error=str(e))
            return None

    def start_span(
        self,
        name: str,
        input_data: Optional[Any] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Start a span within the current trace context.

        Args:
            name: Span name (e.g., "rag_retrieval", "agent_selection")
            input_data: Span input
            metadata: Additional span metadata

        Returns:
            Context manager for the span
        """
        if not self.enabled or not self.client:
            return None

        try:
            return self.client.start_as_current_span(
                name=name,
                input=input_data,
                metadata=metadata or {},
            )
        except Exception as e:
            logger.error("Failed to start Langfuse span", error=str(e))
            return None

    def start_generation(
        self,
        name: str,
        model: str,
        input_messages: Optional[List[Dict[str, str]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Start an LLM generation within the current trace context.

        Args:
            name: Generation name
            model: Model identifier (e.g., "gpt-4", "claude-3")
            input_messages: Input messages sent to LLM
            metadata: Additional generation metadata

        Returns:
            Context manager for the generation
        """
        if not self.enabled or not self.client:
            return None

        try:
            return self.client.start_as_current_generation(
                name=name,
                model=model,
                input=input_messages,
                metadata=metadata or {},
            )
        except Exception as e:
            logger.error("Failed to start Langfuse generation", error=str(e))
            return None

    def update_current_span(
        self,
        output: Optional[Any] = None,
        metadata: Optional[Dict[str, Any]] = None,
        level: Optional[str] = None
    ):
        """
        Update the current span with output and metadata.

        Args:
            output: Span output data
            metadata: Additional metadata to merge
            level: Log level (DEBUG, DEFAULT, WARNING, ERROR)
        """
        if not self.enabled or not self.client:
            return

        try:
            self.client.update_current_span(
                output=output,
                metadata=metadata,
                level=level
            )
        except Exception as e:
            logger.error("Failed to update Langfuse span", error=str(e))

    def update_current_generation(
        self,
        output: Optional[str] = None,
        usage: Optional[Dict[str, int]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Update the current generation with output and usage.

        Args:
            output: LLM response text
            usage: Token usage dict {prompt_tokens, completion_tokens, total_tokens}
            metadata: Additional metadata
        """
        if not self.enabled or not self.client:
            return

        try:
            self.client.update_current_generation(
                output=output,
                usage=usage,
                metadata=metadata
            )
        except Exception as e:
            logger.error("Failed to update Langfuse generation", error=str(e))

    def update_current_trace(
        self,
        output: Optional[Any] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None
    ):
        """Update the current trace with final output and metadata."""
        if not self.enabled or not self.client:
            return

        try:
            self.client.update_current_trace(
                output=output,
                metadata=metadata,
                tags=tags
            )
        except Exception as e:
            logger.error("Failed to update Langfuse trace", error=str(e))

    def score_current_trace(
        self,
        name: str,
        value: float,
        comment: Optional[str] = None
    ):
        """
        Add a score to the current trace for evaluation.

        Args:
            name: Score name (e.g., "quality", "relevance", "helpfulness")
            value: Score value (typically 0-1 or 1-5)
            comment: Optional comment explaining the score
        """
        if not self.enabled or not self.client:
            return

        try:
            self.client.score_current_trace(
                name=name,
                value=value,
                comment=comment
            )
        except Exception as e:
            logger.error("Failed to score Langfuse trace", error=str(e))

    def flush(self):
        """Flush pending events to Langfuse."""
        if self.enabled and self.client:
            try:
                self.client.flush()
            except Exception as e:
                logger.error("Failed to flush Langfuse events", error=str(e))

    def shutdown(self):
        """Shutdown Langfuse client gracefully."""
        if self.enabled and self.client:
            try:
                self.client.shutdown()
                logger.info("Langfuse client shutdown complete")
            except Exception as e:
                logger.error("Error during Langfuse shutdown", error=str(e))


# Global monitor instance
_monitor: Optional[LangfuseMonitor] = None


def get_langfuse_monitor() -> LangfuseMonitor:
    """Get the global Langfuse monitor instance."""
    global _monitor
    if _monitor is None:
        _monitor = LangfuseMonitor()
    return _monitor


@contextmanager
def trace_llm_call(
    name: str,
    session_id: Optional[str] = None,
    user_id: Optional[str] = None,
    agent_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Context manager for tracing an LLM call.

    Usage:
        with trace_llm_call("mode1_query", session_id="abc") as ctx:
            response = await llm.ainvoke(messages)
            ctx.log_generation(model="gpt-4", output=response)

    Args:
        name: Trace name
        session_id: Session ID for grouping
        user_id: User identifier
        agent_name: Agent handling the request
        metadata: Additional metadata

    Yields:
        TraceContext object with helper methods
    """
    monitor = get_langfuse_monitor()
    start_time = time.time()

    trace_metadata = metadata or {}
    if agent_name:
        trace_metadata["agent_name"] = agent_name

    tags = ["vital"]
    if agent_name:
        tags.append(agent_name)

    class TraceContext:
        def __init__(self, monitor_instance, start):
            self.monitor = monitor_instance
            self.start_time = start
            self._span_ctx = None

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            pass

        def log_generation(
            self,
            model: str,
            input_messages: List[Dict[str, str]],
            output: str,
            usage: Optional[Dict[str, int]] = None,
            gen_name: str = "llm_generation"
        ):
            """Log an LLM generation within this trace."""
            if not self.monitor.enabled:
                return None

            try:
                with self.monitor.client.start_as_current_generation(
                    name=gen_name,
                    model=model,
                    input=input_messages,
                ) as gen:
                    gen.update(
                        output=output,
                        usage=usage,
                    )
                return gen
            except Exception as e:
                logger.error("Failed to log generation", error=str(e))
                return None

        def log_span(
            self,
            name: str,
            input_data: Any = None,
            output_data: Any = None
        ):
            """Log a span within this trace."""
            if not self.monitor.enabled:
                return None

            try:
                with self.monitor.client.start_as_current_span(
                    name=name,
                    input=input_data,
                ) as span:
                    span.update(output=output_data)
                return span
            except Exception as e:
                logger.error("Failed to log span", error=str(e))
                return None

        def log_event(self, name: str, metadata: Dict = None, level: str = "DEFAULT"):
            """Log an event within this trace."""
            if not self.monitor.enabled:
                return None

            try:
                self.monitor.client.update_current_span(
                    metadata={"event": name, **(metadata or {})},
                    level=level
                )
            except Exception as e:
                logger.error("Failed to log event", error=str(e))
                return None

    ctx = TraceContext(monitor, start_time)

    if not monitor.enabled:
        yield ctx
        return

    try:
        # Use context manager for the span
        with monitor.client.start_as_current_span(
            name=name,
            metadata=trace_metadata,
        ):
            # Set trace-level info
            monitor.client.update_current_trace(
                session_id=session_id,
                user_id=user_id,
                tags=tags,
            )

            yield ctx

            # Update trace with completion
            end_time = time.time()
            duration_ms = (end_time - start_time) * 1000
            monitor.client.update_current_trace(
                metadata={"duration_ms": duration_ms}
            )
    except Exception as e:
        logger.error("Error in trace_llm_call", error=str(e))
        yield ctx
    finally:
        monitor.flush()


def trace_agent_call(agent_name: str, session_id: Optional[str] = None):
    """
    Decorator for tracing agent method calls.

    Usage:
        @trace_agent_call("regulatory_advisor")
        async def process_query(self, request):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            with trace_llm_call(
                name=func.__name__,
                session_id=session_id or kwargs.get("session_id"),
                agent_name=agent_name
            ) as trace:
                result = await func(*args, **kwargs)
                return result
        return wrapper
    return decorator
