# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [langfuse, core.config]
"""
LangGraph Observability & Monitoring

Provides comprehensive observability for LangGraph workflows using:
- Langfuse for LLM tracing, cost tracking, and analytics
- Custom metrics collection
- Performance monitoring
- Error tracking
- Workflow visualization support
- Tenant-aware logging

Reference: https://langfuse.com/docs
"""

import os
import time
from typing import Dict, Any, Optional, Callable
from datetime import datetime
from functools import wraps
import structlog

# Langfuse imports (primary observability provider)
try:
    from langfuse import Langfuse
    from langfuse.decorators import observe, langfuse_context
    LANGFUSE_AVAILABLE = True
except ImportError:
    LANGFUSE_AVAILABLE = False
    Langfuse = None
    observe = lambda *args, **kwargs: lambda f: f  # No-op decorator
    langfuse_context = None

from core.config import get_settings

logger = structlog.get_logger()


class LangGraphObservability:
    """
    Observability manager for LangGraph workflows.

    Features:
    - Langfuse tracing integration
    - Custom metrics collection
    - Performance monitoring
    - Error tracking
    - Tenant-aware logging
    - Cost tracking

    Usage:
        >>> observability = LangGraphObservability()
        >>> await observability.initialize()
        >>>
        >>> # Trace workflow execution
        >>> @observability.trace_workflow("mode1_workflow")
        >>> async def execute_workflow(state):
        ...     return result
    """

    def __init__(self):
        """Initialize observability manager"""
        self.settings = get_settings()
        self.langfuse_client: Optional[Langfuse] = None
        self.enabled = False
        self._current_trace_id: Optional[str] = None

        # Metrics storage
        self._metrics: Dict[str, Any] = {
            "workflows_executed": 0,
            "workflows_failed": 0,
            "total_processing_time_ms": 0.0,
            "cache_hits": 0,
            "node_executions": {},
            "error_types": {},
            "token_usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            },
            "estimated_cost_usd": 0.0
        }

    async def initialize(self):
        """
        Initialize observability services.

        Sets up Langfuse if credentials are available.
        """
        try:
            # Check for Langfuse credentials
            langfuse_public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
            langfuse_secret_key = os.getenv("LANGFUSE_SECRET_KEY")
            langfuse_host = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

            if LANGFUSE_AVAILABLE and langfuse_public_key and langfuse_secret_key:
                self.langfuse_client = Langfuse(
                    public_key=langfuse_public_key,
                    secret_key=langfuse_secret_key,
                    host=langfuse_host
                )
                self.enabled = True

                logger.info(
                    "langfuse_observability_enabled",
                    host=langfuse_host,
                    project="vital-ai-engine"
                )
            else:
                logger.info(
                    "langfuse_not_configured",
                    langfuse_available=LANGFUSE_AVAILABLE,
                    has_public_key=bool(langfuse_public_key),
                    has_secret_key=bool(langfuse_secret_key)
                )

        except Exception as e:
            logger.error("observability_init_failed", error=str(e))
            self.enabled = False

    def create_trace(
        self,
        name: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[list] = None
    ) -> Optional[str]:
        """
        Create a new trace for a workflow execution.

        Args:
            name: Trace name (e.g., "mode1_workflow")
            user_id: User identifier
            session_id: Session identifier
            tenant_id: Tenant identifier
            metadata: Additional metadata
            tags: Tags for filtering

        Returns:
            Trace ID or None if not enabled
        """
        if not self.enabled or not self.langfuse_client:
            return None

        try:
            trace = self.langfuse_client.trace(
                name=name,
                user_id=user_id,
                session_id=session_id,
                metadata={
                    **(metadata or {}),
                    "tenant_id": tenant_id,
                    "environment": os.getenv("ENV", "development")
                },
                tags=tags or []
            )
            self._current_trace_id = trace.id
            return trace.id

        except Exception as e:
            logger.error("trace_creation_failed", error=str(e))
            return None

    def create_span(
        self,
        trace_id: str,
        name: str,
        input_data: Any = None,
        metadata: Optional[Dict[str, Any]] = None,
        level: str = "DEFAULT"
    ) -> Optional[str]:
        """
        Create a span within a trace.

        Args:
            trace_id: Parent trace ID
            name: Span name
            input_data: Input to this operation
            metadata: Additional metadata
            level: Log level (DEBUG, DEFAULT, WARNING, ERROR)

        Returns:
            Span ID or None
        """
        if not self.enabled or not self.langfuse_client or not trace_id:
            return None

        try:
            span = self.langfuse_client.span(
                trace_id=trace_id,
                name=name,
                input=input_data,
                metadata=metadata or {},
                level=level
            )
            return span.id

        except Exception as e:
            logger.error("span_creation_failed", error=str(e), span_name=name)
            return None

    def end_span(
        self,
        span_id: str,
        output: Any = None,
        metadata: Optional[Dict[str, Any]] = None,
        level: str = "DEFAULT"
    ) -> None:
        """End a span with output"""
        if not self.enabled or not self.langfuse_client or not span_id:
            return

        try:
            self.langfuse_client.span(
                id=span_id,
                output=output,
                metadata=metadata,
                level=level
            )
        except Exception as e:
            logger.error("span_end_failed", error=str(e))

    def track_generation(
        self,
        trace_id: str,
        name: str,
        model: str,
        input_messages: list,
        output_text: str,
        usage: Optional[Dict[str, int]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        cost: Optional[float] = None
    ) -> Optional[str]:
        """
        Track LLM generation for cost and token analysis.

        Args:
            trace_id: Parent trace ID
            name: Generation name
            model: Model identifier (e.g., "gpt-4", "claude-3")
            input_messages: Input messages
            output_text: Generated output
            usage: Token usage dict
            metadata: Additional metadata
            cost: Estimated cost in USD

        Returns:
            Generation ID
        """
        if not self.enabled or not self.langfuse_client or not trace_id:
            return None

        try:
            generation = self.langfuse_client.generation(
                trace_id=trace_id,
                name=name,
                model=model,
                input=input_messages,
                output=output_text,
                usage=usage or {},
                metadata=metadata or {},
                cost=cost
            )

            # Track in local metrics
            if usage:
                self._metrics["token_usage"]["prompt_tokens"] += usage.get("prompt_tokens", 0)
                self._metrics["token_usage"]["completion_tokens"] += usage.get("completion_tokens", 0)
                self._metrics["token_usage"]["total_tokens"] += usage.get("total_tokens", 0)

            if cost:
                self._metrics["estimated_cost_usd"] += cost

            return generation.id

        except Exception as e:
            logger.error("generation_tracking_failed", error=str(e))
            return None

    def add_score(
        self,
        trace_id: Optional[str] = None,
        observation_id: Optional[str] = None,
        name: str = "user_feedback",
        value: float = 0.0,
        comment: Optional[str] = None
    ) -> None:
        """
        Add score/feedback to trace or observation.

        Args:
            trace_id: Trace ID to score
            observation_id: Observation ID to score
            name: Score name (e.g., "accuracy", "helpfulness")
            value: Score value (0.0 - 1.0)
            comment: Optional comment
        """
        if not self.enabled or not self.langfuse_client:
            return

        try:
            self.langfuse_client.score(
                trace_id=trace_id,
                observation_id=observation_id,
                name=name,
                value=value,
                comment=comment
            )
        except Exception as e:
            logger.error("score_tracking_failed", error=str(e))

    def trace_workflow(self, workflow_name: str):
        """
        Decorator to trace workflow execution.

        Args:
            workflow_name: Name of workflow

        Returns:
            Decorated function with tracing

        Example:
            >>> @observability.trace_workflow("mode1_manual")
            >>> async def execute_mode1(state):
            ...     return result
        """
        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                trace_id = None

                # Extract context from kwargs if available
                user_id = kwargs.get('user_id')
                session_id = kwargs.get('session_id')
                tenant_id = kwargs.get('tenant_id')

                # Create trace
                if self.enabled:
                    trace_id = self.create_trace(
                        name=workflow_name,
                        user_id=user_id,
                        session_id=session_id,
                        tenant_id=tenant_id,
                        tags=[workflow_name, "langgraph"]
                    )

                try:
                    result = await func(*args, **kwargs)

                    # Track metrics
                    execution_time = (time.time() - start_time) * 1000
                    self._track_workflow_execution(
                        workflow_name=workflow_name,
                        success=True,
                        execution_time_ms=execution_time
                    )

                    # Update trace with success
                    if trace_id and self.langfuse_client:
                        self.langfuse_client.trace(
                            id=trace_id,
                            output={"status": "success"},
                            metadata={
                                "execution_time_ms": execution_time,
                                "success": True
                            },
                            tags=["success"]
                        )

                    return result

                except Exception as e:
                    execution_time = (time.time() - start_time) * 1000
                    self._track_workflow_execution(
                        workflow_name=workflow_name,
                        success=False,
                        execution_time_ms=execution_time,
                        error_type=type(e).__name__
                    )

                    # Update trace with error
                    if trace_id and self.langfuse_client:
                        self.langfuse_client.trace(
                            id=trace_id,
                            output={"error": str(e), "error_type": type(e).__name__},
                            metadata={
                                "execution_time_ms": execution_time,
                                "success": False,
                                "error": str(e)
                            },
                            tags=["error", type(e).__name__]
                        )

                    raise

            return wrapper
        return decorator

    def trace_node(self, node_name: str):
        """
        Decorator to trace node execution.

        Args:
            node_name: Name of node

        Returns:
            Decorated function with tracing
        """
        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                span_id = None

                # Create span under current trace
                if self.enabled and self._current_trace_id:
                    span_id = self.create_span(
                        trace_id=self._current_trace_id,
                        name=node_name,
                        input_data={"args": str(args)[:500], "kwargs": str(kwargs)[:500]}
                    )

                try:
                    result = await func(*args, **kwargs)

                    # Track node execution
                    execution_time = (time.time() - start_time) * 1000
                    self._track_node_execution(
                        node_name=node_name,
                        success=True,
                        execution_time_ms=execution_time
                    )

                    # End span with success
                    if span_id:
                        self.end_span(
                            span_id=span_id,
                            output={"status": "success"},
                            metadata={"execution_time_ms": execution_time}
                        )

                    return result

                except Exception as e:
                    execution_time = (time.time() - start_time) * 1000
                    self._track_node_execution(
                        node_name=node_name,
                        success=False,
                        execution_time_ms=execution_time,
                        error_type=type(e).__name__
                    )

                    # End span with error
                    if span_id:
                        self.end_span(
                            span_id=span_id,
                            output={"error": str(e)},
                            metadata={"execution_time_ms": execution_time},
                            level="ERROR"
                        )

                    raise

            return wrapper
        return decorator

    def _track_workflow_execution(
        self,
        workflow_name: str,
        success: bool,
        execution_time_ms: float,
        error_type: Optional[str] = None
    ):
        """Track workflow execution metrics"""
        if success:
            self._metrics["workflows_executed"] += 1
        else:
            self._metrics["workflows_failed"] += 1

            if error_type:
                self._metrics["error_types"][error_type] = (
                    self._metrics["error_types"].get(error_type, 0) + 1
                )

        self._metrics["total_processing_time_ms"] += execution_time_ms

        logger.info(
            "workflow_execution_tracked",
            workflow=workflow_name,
            success=success,
            execution_time_ms=execution_time_ms,
            error_type=error_type
        )

    def _track_node_execution(
        self,
        node_name: str,
        success: bool,
        execution_time_ms: float,
        error_type: Optional[str] = None
    ):
        """Track node execution metrics"""
        if node_name not in self._metrics["node_executions"]:
            self._metrics["node_executions"][node_name] = {
                "count": 0,
                "failures": 0,
                "total_time_ms": 0.0
            }

        node_metrics = self._metrics["node_executions"][node_name]
        node_metrics["count"] += 1
        node_metrics["total_time_ms"] += execution_time_ms

        if not success:
            node_metrics["failures"] += 1

        logger.debug(
            "node_execution_tracked",
            node=node_name,
            success=success,
            execution_time_ms=execution_time_ms
        )

    def track_cache_hit(self):
        """Track cache hit"""
        self._metrics["cache_hits"] += 1

    def get_metrics(self) -> Dict[str, Any]:
        """
        Get current metrics.

        Returns:
            Dictionary with all metrics
        """
        workflows_executed = self._metrics["workflows_executed"]
        total_time = self._metrics["total_processing_time_ms"]

        return {
            "workflows": {
                "executed": workflows_executed,
                "failed": self._metrics["workflows_failed"],
                "success_rate": (
                    1.0 - (self._metrics["workflows_failed"] / workflows_executed)
                    if workflows_executed > 0 else 1.0
                ),
                "avg_processing_time_ms": (
                    total_time / workflows_executed
                    if workflows_executed > 0 else 0.0
                )
            },
            "cache": {
                "hits": self._metrics["cache_hits"],
                "hit_rate": (
                    self._metrics["cache_hits"] / workflows_executed
                    if workflows_executed > 0 else 0.0
                )
            },
            "tokens": self._metrics["token_usage"],
            "estimated_cost_usd": self._metrics["estimated_cost_usd"],
            "nodes": self._metrics["node_executions"],
            "errors": self._metrics["error_types"],
            "langfuse_enabled": self.enabled
        }

    def reset_metrics(self):
        """Reset all metrics"""
        self._metrics = {
            "workflows_executed": 0,
            "workflows_failed": 0,
            "total_processing_time_ms": 0.0,
            "cache_hits": 0,
            "node_executions": {},
            "error_types": {},
            "token_usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            },
            "estimated_cost_usd": 0.0
        }
        logger.info("metrics_reset")

    def flush(self):
        """Flush pending events to Langfuse"""
        if self.enabled and self.langfuse_client:
            try:
                self.langfuse_client.flush()
            except Exception as e:
                logger.error("langfuse_flush_failed", error=str(e))


# =============================================================================
# GLOBAL OBSERVABILITY INSTANCE
# =============================================================================

_observability: Optional[LangGraphObservability] = None


async def initialize_observability() -> LangGraphObservability:
    """
    Initialize global observability manager.

    Returns:
        Initialized observability manager
    """
    global _observability

    _observability = LangGraphObservability()
    await _observability.initialize()

    return _observability


def get_observability() -> Optional[LangGraphObservability]:
    """Get global observability manager"""
    return _observability


# =============================================================================
# CONVENIENCE DECORATORS
# =============================================================================

def trace_workflow(workflow_name: str):
    """
    Convenience decorator for workflow tracing.

    Uses global observability instance.
    """
    obs = get_observability()
    if obs:
        return obs.trace_workflow(workflow_name)
    else:
        # No-op decorator if observability not initialized
        return lambda f: f


def trace_node(node_name: str):
    """
    Convenience decorator for node tracing.

    Uses global observability instance.
    """
    obs = get_observability()
    if obs:
        return obs.trace_node(node_name)
    else:
        # No-op decorator if observability not initialized
        return lambda f: f
