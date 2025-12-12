"""
Langfuse Tracing Integration for LLM Observability.

This module provides Langfuse integration for:
- Automatic LLM call tracing (prompts, completions, tokens, latency)
- Cost tracking per call
- Trace hierarchies (traces > spans > generations)
- Custom metadata and scoring
- LangChain/LangGraph callback integration

IMPORTANT: Uses Langfuse (NOT LangSmith) as per project requirements.

Environment Variables:
    LANGFUSE_PUBLIC_KEY: Your Langfuse public key
    LANGFUSE_SECRET_KEY: Your Langfuse secret key
    LANGFUSE_HOST: Langfuse host URL (default: https://cloud.langfuse.com)
    LANGFUSE_ENABLED: Enable/disable tracing (default: true in production)
"""

from typing import Any, Callable, Coroutine, Dict, List, Optional, TypeVar
from functools import wraps
from contextlib import contextmanager, asynccontextmanager
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import os
import time
import uuid
import structlog

logger = structlog.get_logger()

T = TypeVar("T")


# ============================================================================
# Configuration
# ============================================================================

@dataclass
class LangfuseConfig:
    """Configuration for Langfuse tracing."""
    public_key: Optional[str] = None
    secret_key: Optional[str] = None
    host: str = "https://cloud.langfuse.com"
    enabled: bool = True
    sample_rate: float = 1.0  # 1.0 = trace all, 0.1 = 10% sampling
    flush_interval: float = 5.0  # Seconds between flushes
    batch_size: int = 100
    debug: bool = False

    @classmethod
    def from_env(cls) -> "LangfuseConfig":
        """Create config from environment variables."""
        return cls(
            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
            host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com"),
            enabled=os.getenv("LANGFUSE_ENABLED", "true").lower() == "true",
            sample_rate=float(os.getenv("LANGFUSE_SAMPLE_RATE", "1.0")),
            debug=os.getenv("LANGFUSE_DEBUG", "false").lower() == "true",
        )


# ============================================================================
# Langfuse Client Wrapper
# ============================================================================

class LangfuseTracer:
    """
    Langfuse tracing client wrapper.

    Provides a clean interface for:
    - Creating traces and spans
    - Recording LLM generations
    - Adding metadata and scores
    - LangChain callback handler integration

    Usage:
        tracer = get_tracer()

        # Start a trace for a user request
        with tracer.trace("ask_expert", user_id="user123") as trace:
            # Record LLM call
            with trace.span("llm_call", model="gpt-4") as span:
                response = await call_llm(prompt)
                span.generation(
                    model="gpt-4",
                    input=prompt,
                    output=response,
                    usage={"prompt_tokens": 100, "completion_tokens": 50}
                )

            # Score the output
            trace.score("quality", 0.95, comment="High relevance")
    """

    def __init__(self, config: Optional[LangfuseConfig] = None):
        self.config = config or LangfuseConfig.from_env()
        self._client = None
        self._callback_handler = None
        self._initialized = False

    def _ensure_initialized(self) -> bool:
        """Lazy initialize Langfuse client."""
        if self._initialized:
            return self._client is not None

        self._initialized = True

        if not self.config.enabled:
            logger.info("langfuse_disabled", reason="config.enabled=False")
            return False

        if not self.config.public_key or not self.config.secret_key:
            logger.warning(
                "langfuse_disabled",
                reason="missing_credentials",
                has_public_key=bool(self.config.public_key),
                has_secret_key=bool(self.config.secret_key),
            )
            return False

        try:
            from langfuse import Langfuse
            self._client = Langfuse(
                public_key=self.config.public_key,
                secret_key=self.config.secret_key,
                host=self.config.host,
                debug=self.config.debug,
            )
            logger.info("langfuse_initialized", host=self.config.host)
            return True
        except ImportError:
            logger.warning("langfuse_not_installed", hint="pip install langfuse")
            return False
        except Exception as e:
            logger.error("langfuse_init_failed", error=str(e))
            return False

    @property
    def is_enabled(self) -> bool:
        """Check if tracing is enabled and initialized."""
        return self._ensure_initialized()

    def get_callback_handler(self) -> Optional[Any]:
        """
        Get LangChain callback handler for automatic tracing.

        Usage with LangChain:
            handler = tracer.get_callback_handler()
            chain.invoke(input, config={"callbacks": [handler]})

        Usage with LangGraph:
            handler = tracer.get_callback_handler()
            app.invoke(state, config={"callbacks": [handler]})
        """
        if not self._ensure_initialized():
            return None

        if self._callback_handler is None:
            try:
                from langfuse.callback import CallbackHandler
                self._callback_handler = CallbackHandler(
                    public_key=self.config.public_key,
                    secret_key=self.config.secret_key,
                    host=self.config.host,
                )
            except ImportError:
                logger.warning("langfuse_callback_not_available")
                return None

        return self._callback_handler

    def create_trace(
        self,
        name: str,
        trace_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None,
    ) -> "TraceContext":
        """
        Create a new trace context.

        Args:
            name: Name of the trace (e.g., "ask_expert", "mode3_mission")
            trace_id: Custom trace ID (auto-generated if not provided)
            user_id: User identifier for filtering in Langfuse
            session_id: Session ID for grouping related traces
            metadata: Additional metadata to attach
            tags: Tags for filtering/grouping

        Returns:
            TraceContext that can be used as context manager
        """
        return TraceContext(
            tracer=self,
            name=name,
            trace_id=trace_id or str(uuid.uuid4()),
            user_id=user_id,
            session_id=session_id,
            metadata=metadata or {},
            tags=tags or [],
        )

    @contextmanager
    def trace(
        self,
        name: str,
        trace_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None,
    ):
        """Context manager for creating traces."""
        ctx = self.create_trace(name, trace_id, user_id, session_id, metadata, tags)
        ctx.start()
        try:
            yield ctx
        except Exception as e:
            ctx.error(str(e))
            raise
        finally:
            ctx.end()

    def flush(self) -> None:
        """Flush pending events to Langfuse."""
        if self._client:
            try:
                self._client.flush()
            except Exception as e:
                logger.warning("langfuse_flush_failed", error=str(e))

    def shutdown(self) -> None:
        """Shutdown the Langfuse client gracefully."""
        if self._client:
            try:
                self._client.shutdown()
                logger.info("langfuse_shutdown")
            except Exception as e:
                logger.warning("langfuse_shutdown_failed", error=str(e))


# ============================================================================
# Trace Context
# ============================================================================

@dataclass
class TraceContext:
    """
    Context for a single trace with span/generation support.

    Provides hierarchical tracing:
    - Trace (top level, e.g., "ask_expert request")
      - Span (nested operation, e.g., "agent_selection")
        - Generation (LLM call with input/output/tokens)
    """
    tracer: LangfuseTracer
    name: str
    trace_id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)

    # Internal state
    _trace: Any = None
    _start_time: Optional[float] = None
    _spans: List["SpanContext"] = field(default_factory=list)

    def start(self) -> "TraceContext":
        """Start the trace."""
        self._start_time = time.time()

        if not self.tracer._ensure_initialized() or not self.tracer._client:
            return self

        try:
            self._trace = self.tracer._client.trace(
                id=self.trace_id,
                name=self.name,
                user_id=self.user_id,
                session_id=self.session_id,
                metadata=self.metadata,
                tags=self.tags,
            )
            logger.debug("trace_started", trace_id=self.trace_id, name=self.name)
        except Exception as e:
            logger.warning("trace_start_failed", error=str(e))

        return self

    def end(self, output: Optional[Any] = None) -> None:
        """End the trace with optional output."""
        if not self._trace:
            return

        try:
            duration_ms = int((time.time() - self._start_time) * 1000) if self._start_time else 0
            self._trace.update(
                output=output,
                metadata={**self.metadata, "duration_ms": duration_ms},
            )
            logger.debug("trace_ended", trace_id=self.trace_id, duration_ms=duration_ms)
        except Exception as e:
            logger.warning("trace_end_failed", error=str(e))

    def error(self, error_message: str) -> None:
        """Record an error on the trace."""
        if not self._trace:
            return

        try:
            self._trace.update(
                level="ERROR",
                status_message=error_message,
            )
        except Exception as e:
            logger.warning("trace_error_failed", error=str(e))

    @contextmanager
    def span(
        self,
        name: str,
        span_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Create a nested span within this trace."""
        span_ctx = SpanContext(
            trace_ctx=self,
            name=name,
            span_id=span_id or str(uuid.uuid4()),
            metadata=metadata or {},
        )
        span_ctx.start()
        try:
            yield span_ctx
        except Exception as e:
            span_ctx.error(str(e))
            raise
        finally:
            span_ctx.end()

    def score(
        self,
        name: str,
        value: float,
        comment: Optional[str] = None,
        data_type: str = "NUMERIC",
    ) -> None:
        """Add a score to the trace."""
        if not self.tracer._client:
            return

        try:
            self.tracer._client.score(
                trace_id=self.trace_id,
                name=name,
                value=value,
                comment=comment,
                data_type=data_type,
            )
        except Exception as e:
            logger.warning("score_failed", error=str(e))

    def add_metadata(self, key: str, value: Any) -> None:
        """Add metadata to the trace."""
        self.metadata[key] = value


@dataclass
class SpanContext:
    """Context for a span within a trace."""
    trace_ctx: TraceContext
    name: str
    span_id: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    _span: Any = None
    _start_time: Optional[float] = None

    def start(self) -> "SpanContext":
        """Start the span."""
        self._start_time = time.time()

        if not self.trace_ctx._trace:
            return self

        try:
            self._span = self.trace_ctx._trace.span(
                id=self.span_id,
                name=self.name,
                metadata=self.metadata,
            )
        except Exception as e:
            logger.warning("span_start_failed", error=str(e))

        return self

    def end(self, output: Optional[Any] = None) -> None:
        """End the span."""
        if not self._span:
            return

        try:
            duration_ms = int((time.time() - self._start_time) * 1000) if self._start_time else 0
            self._span.end(
                output=output,
                metadata={**self.metadata, "duration_ms": duration_ms},
            )
        except Exception as e:
            logger.warning("span_end_failed", error=str(e))

    def error(self, error_message: str) -> None:
        """Record an error on the span."""
        if not self._span:
            return

        try:
            self._span.update(
                level="ERROR",
                status_message=error_message,
            )
        except Exception as e:
            logger.warning("span_error_failed", error=str(e))

    def generation(
        self,
        name: str = "llm_call",
        model: str = "unknown",
        input: Optional[Any] = None,
        output: Optional[Any] = None,
        usage: Optional[Dict[str, int]] = None,
        model_parameters: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Record an LLM generation within this span.

        Args:
            name: Generation name
            model: Model identifier (e.g., "gpt-4", "claude-3-opus")
            input: The prompt/input to the LLM
            output: The LLM response
            usage: Token usage dict with prompt_tokens, completion_tokens, total_tokens
            model_parameters: Model params like temperature, max_tokens
            metadata: Additional metadata
        """
        if not self._span:
            return

        try:
            self._span.generation(
                name=name,
                model=model,
                input=input,
                output=output,
                usage=usage,
                model_parameters=model_parameters,
                metadata=metadata,
            )
        except Exception as e:
            logger.warning("generation_failed", error=str(e))


# ============================================================================
# Decorators
# ============================================================================

def traced(
    name: Optional[str] = None,
    tags: Optional[List[str]] = None,
    capture_input: bool = True,
    capture_output: bool = True,
) -> Callable:
    """
    Decorator to automatically trace function execution.

    Example:
        @traced(name="process_query", tags=["mode1"])
        async def process_query(query: str, agent_id: str) -> str:
            ...

    Args:
        name: Trace name (defaults to function name)
        tags: Tags to attach to trace
        capture_input: Whether to capture function arguments
        capture_output: Whether to capture return value
    """
    def decorator(func: Callable[..., Coroutine[Any, Any, T]]) -> Callable[..., Coroutine[Any, Any, T]]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            tracer = get_tracer()
            trace_name = name or func.__name__

            metadata = {}
            if capture_input:
                # Capture args/kwargs, truncating long values
                metadata["args"] = str(args)[:500] if args else None
                metadata["kwargs"] = {k: str(v)[:200] for k, v in kwargs.items()}

            with tracer.trace(trace_name, tags=tags or [], metadata=metadata) as trace:
                try:
                    result = await func(*args, **kwargs)
                    if capture_output:
                        trace.add_metadata("output_preview", str(result)[:500])
                    return result
                except Exception as e:
                    trace.error(str(e))
                    raise

        return wrapper
    return decorator


def traced_span(
    name: Optional[str] = None,
) -> Callable:
    """
    Decorator to create a span for a function (requires active trace context).

    Note: This is primarily for sync functions or when trace context is managed externally.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # This decorator assumes trace context is managed by the caller
            # It logs timing but doesn't create Langfuse spans without context
            start = time.time()
            try:
                return func(*args, **kwargs)
            finally:
                duration_ms = int((time.time() - start) * 1000)
                logger.debug(
                    "span_completed",
                    name=name or func.__name__,
                    duration_ms=duration_ms,
                )

        return wrapper
    return decorator


# ============================================================================
# Global Instance
# ============================================================================

_tracer_instance: Optional[LangfuseTracer] = None


def get_tracer(config: Optional[LangfuseConfig] = None) -> LangfuseTracer:
    """Get or create the global Langfuse tracer instance."""
    global _tracer_instance
    if _tracer_instance is None:
        _tracer_instance = LangfuseTracer(config)
    return _tracer_instance


def reset_tracer() -> None:
    """Reset the global tracer (for testing)."""
    global _tracer_instance
    if _tracer_instance:
        _tracer_instance.shutdown()
    _tracer_instance = None


def get_langfuse_callback() -> Optional[Any]:
    """
    Convenience function to get LangChain callback handler.

    Usage with LangGraph:
        from core.tracing import get_langfuse_callback

        callback = get_langfuse_callback()
        config = {"callbacks": [callback]} if callback else {}
        result = await app.ainvoke(state, config=config)
    """
    return get_tracer().get_callback_handler()


# ============================================================================
# LangGraph Integration Helper
# ============================================================================

def get_langgraph_callbacks(
    trace_id: Optional[str] = None,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    tags: Optional[List[str]] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Get LangGraph-compatible config with Langfuse callbacks.

    Usage:
        config = get_langgraph_callbacks(
            trace_id=mission_id,
            user_id=user_id,
            session_id=session_id,
            tags=["mode3", "autonomous"],
            metadata={"agent": agent_name}
        )
        result = await workflow.ainvoke(state, config=config)

    Returns:
        Config dict with callbacks list, or empty dict if tracing disabled
    """
    tracer = get_tracer()
    if not tracer.is_enabled:
        return {}

    try:
        from langfuse.callback import CallbackHandler

        handler = CallbackHandler(
            public_key=tracer.config.public_key,
            secret_key=tracer.config.secret_key,
            host=tracer.config.host,
            trace_id=trace_id,
            user_id=user_id,
            session_id=session_id,
            tags=tags,
            metadata=metadata,
        )
        return {"callbacks": [handler]}
    except ImportError:
        logger.debug("langfuse_callback_import_failed")
        return {}
    except Exception as e:
        logger.warning("langfuse_callback_creation_failed", error=str(e))
        return {}
