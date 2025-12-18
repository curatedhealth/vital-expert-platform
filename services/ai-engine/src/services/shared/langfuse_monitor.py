"""
LangFuse Monitoring Integration

Comprehensive LLM observability using LangFuse for:
- Request/response tracing
- Token usage tracking
- Latency monitoring
- Cost analysis
- Error tracking
- User analytics

Created: 2025-10-25
Phase: 5 Week 1 - Monitoring Dashboards
"""

import os
import time
import asyncio
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Make langfuse imports optional
try:
    from langfuse import Langfuse, observe
    LANGFUSE_AVAILABLE = True
    logger.info("LangFuse v3.x imports successful")
except ImportError:
    logger.warning("langfuse not installed - monitoring features disabled")
    LANGFUSE_AVAILABLE = False
    Langfuse = None
    observe = None


# ============================================================================
# LANGFUSE CLIENT
# ============================================================================

class LangFuseMonitor:
    """
    LangFuse monitoring integration for VITAL Platform

    Features:
    - Automatic tracing of LLM calls
    - Token usage and cost tracking
    - Performance monitoring
    - User session tracking
    - Error logging and debugging
    - A/B test tracking
    """

    def __init__(
        self,
        public_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        host: Optional[str] = None,
        enabled: bool = True
    ):
        """
        Initialize LangFuse monitor

        Args:
            public_key: LangFuse public key (or from env)
            secret_key: LangFuse secret key (or from env)
            host: LangFuse host URL (default: https://cloud.langfuse.com)
            enabled: Enable/disable monitoring
        """
        self.enabled = enabled

        if not LANGFUSE_AVAILABLE:
            logger.info("LangFuse package not installed - monitoring disabled")
            self.enabled = False
            return

        if not self.enabled:
            logger.info("LangFuse monitoring is disabled")
            return

        # Get credentials from env if not provided
        self.public_key = public_key or os.getenv("LANGFUSE_PUBLIC_KEY")
        self.secret_key = secret_key or os.getenv("LANGFUSE_SECRET_KEY")
        self.host = host or os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

        if not self.public_key or not self.secret_key:
            logger.warning("LangFuse credentials not found, monitoring disabled")
            self.enabled = False
            return

        # Initialize LangFuse client
        try:
            self.client = Langfuse(
                public_key=self.public_key,
                secret_key=self.secret_key,
                host=self.host
            )
            logger.info(f"LangFuse monitoring initialized: {self.host}")
        except Exception as e:
            logger.error(f"Failed to initialize LangFuse: {e}")
            self.enabled = False

    # ========================================================================
    # TRACE MANAGEMENT
    # ========================================================================

    def create_trace(
        self,
        name: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None
    ) -> Optional[str]:
        """
        Create a new trace

        Args:
            name: Trace name (e.g., "hybrid_search", "chat_completion")
            user_id: User identifier
            session_id: Session identifier
            metadata: Additional metadata
            tags: Tags for filtering

        Returns:
            Trace ID
        """
        if not self.enabled:
            return None

        try:
            trace = self.client.trace(
                name=name,
                user_id=user_id,
                session_id=session_id,
                metadata=metadata or {},
                tags=tags or []
            )
            return trace.id
        except Exception as e:
            logger.error(f"Failed to create trace: {e}")
            return None

    def update_trace(
        self,
        trace_id: str,
        output: Any = None,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None
    ) -> None:
        """Update existing trace"""
        if not self.enabled or not trace_id:
            return

        try:
            self.client.trace(
                id=trace_id,
                output=output,
                metadata=metadata,
                tags=tags
            )
        except Exception as e:
            logger.error(f"Failed to update trace: {e}")

    # ========================================================================
    # SPAN TRACKING
    # ========================================================================

    def create_span(
        self,
        trace_id: str,
        name: str,
        input_data: Any = None,
        metadata: Optional[Dict[str, Any]] = None,
        level: str = "DEFAULT"
    ) -> Optional[str]:
        """
        Create a span within a trace

        Args:
            trace_id: Parent trace ID
            name: Span name
            input_data: Input to this operation
            metadata: Additional metadata
            level: Log level (DEBUG, DEFAULT, WARNING, ERROR)

        Returns:
            Span ID
        """
        if not self.enabled or not trace_id:
            return None

        try:
            span = self.client.span(
                trace_id=trace_id,
                name=name,
                input=input_data,
                metadata=metadata or {},
                level=level
            )
            return span.id
        except Exception as e:
            logger.error(f"Failed to create span: {e}")
            return None

    def end_span(
        self,
        span_id: str,
        output: Any = None,
        metadata: Optional[Dict[str, Any]] = None,
        level: str = "DEFAULT"
    ) -> None:
        """End a span with output"""
        if not self.enabled or not span_id:
            return

        try:
            self.client.span(
                id=span_id,
                output=output,
                metadata=metadata,
                level=level
            )
        except Exception as e:
            logger.error(f"Failed to end span: {e}")

    # ========================================================================
    # GENERATION TRACKING (LLM calls)
    # ========================================================================

    def track_generation(
        self,
        trace_id: str,
        name: str,
        model: str,
        input_messages: List[Dict[str, str]],
        output_text: str,
        usage: Optional[Dict[str, int]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        cost: Optional[float] = None
    ) -> Optional[str]:
        """
        Track LLM generation

        Args:
            trace_id: Parent trace ID
            name: Generation name
            model: Model identifier (e.g., "gpt-4", "claude-3")
            input_messages: Input messages
            output_text: Generated output
            usage: Token usage (prompt_tokens, completion_tokens, total_tokens)
            metadata: Additional metadata
            cost: Estimated cost in USD

        Returns:
            Generation ID
        """
        if not self.enabled or not trace_id:
            return None

        try:
            generation = self.client.generation(
                trace_id=trace_id,
                name=name,
                model=model,
                input=input_messages,
                output=output_text,
                usage=usage or {},
                metadata=metadata or {},
                cost=cost
            )
            return generation.id
        except Exception as e:
            logger.error(f"Failed to track generation: {e}")
            return None

    # ========================================================================
    # EVENT TRACKING
    # ========================================================================

    def track_event(
        self,
        trace_id: str,
        name: str,
        metadata: Optional[Dict[str, Any]] = None,
        level: str = "DEFAULT"
    ) -> None:
        """
        Track discrete event

        Args:
            trace_id: Parent trace ID
            name: Event name
            metadata: Event data
            level: Log level
        """
        if not self.enabled or not trace_id:
            return

        try:
            self.client.event(
                trace_id=trace_id,
                name=name,
                metadata=metadata or {},
                level=level
            )
        except Exception as e:
            logger.error(f"Failed to track event: {e}")

    # ========================================================================
    # SCORING & FEEDBACK
    # ========================================================================

    def add_score(
        self,
        trace_id: Optional[str] = None,
        observation_id: Optional[str] = None,
        name: str = "user_feedback",
        value: float = 0.0,
        comment: Optional[str] = None
    ) -> None:
        """
        Add score/feedback to trace or observation

        Args:
            trace_id: Trace ID to score
            observation_id: Observation ID to score
            name: Score name (e.g., "accuracy", "helpfulness")
            value: Score value (0.0 - 1.0)
            comment: Optional comment
        """
        if not self.enabled:
            return

        try:
            self.client.score(
                trace_id=trace_id,
                observation_id=observation_id,
                name=name,
                value=value,
                comment=comment
            )
        except Exception as e:
            logger.error(f"Failed to add score: {e}")

    # ========================================================================
    # DECORATORS
    # ========================================================================

    def trace(
        self,
        name: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Decorator to automatically trace function calls

        Usage:
            @monitor.trace(name="search_agents")
            async def search_agents(query: str):
                ...
        """
        def decorator(func):
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                if not self.enabled:
                    return await func(*args, **kwargs)

                trace_name = name or func.__name__
                trace_id = self.create_trace(
                    name=trace_name,
                    user_id=user_id,
                    session_id=session_id,
                    metadata={
                        **(metadata or {}),
                        "function": func.__name__,
                        "module": func.__module__
                    }
                )

                start_time = time.time()
                error = None

                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as e:
                    error = e
                    raise
                finally:
                    duration_ms = (time.time() - start_time) * 1000
                    self.update_trace(
                        trace_id=trace_id,
                        output={"error": str(error)} if error else None,
                        metadata={
                            "duration_ms": duration_ms,
                            "error": str(error) if error else None
                        },
                        tags=["error"] if error else ["success"]
                    )

            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                if not self.enabled:
                    return func(*args, **kwargs)

                trace_name = name or func.__name__
                trace_id = self.create_trace(
                    name=trace_name,
                    user_id=user_id,
                    session_id=session_id,
                    metadata={
                        **(metadata or {}),
                        "function": func.__name__,
                        "module": func.__module__
                    }
                )

                start_time = time.time()
                error = None

                try:
                    result = func(*args, **kwargs)
                    return result
                except Exception as e:
                    error = e
                    raise
                finally:
                    duration_ms = (time.time() - start_time) * 1000
                    self.update_trace(
                        trace_id=trace_id,
                        output={"error": str(error)} if error else None,
                        metadata={
                            "duration_ms": duration_ms,
                            "error": str(error) if error else None
                        },
                        tags=["error"] if error else ["success"]
                    )

            return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
        return decorator

    # ========================================================================
    # SPECIALIZED TRACKING
    # ========================================================================

    async def track_search(
        self,
        user_id: str,
        session_id: str,
        query: str,
        results: List[Dict[str, Any]],
        search_time_ms: float,
        cache_hit: bool,
        experiment_variant: Optional[str] = None
    ) -> Optional[str]:
        """
        Track hybrid search operation

        Returns:
            Trace ID
        """
        if not self.enabled:
            return None

        trace_id = self.create_trace(
            name="hybrid_search",
            user_id=user_id,
            session_id=session_id,
            metadata={
                "query": query,
                "total_results": len(results),
                "search_time_ms": search_time_ms,
                "cache_hit": cache_hit,
                "experiment_variant": experiment_variant
            },
            tags=["search", "hybrid_search"]
        )

        # Track as span
        self.create_span(
            trace_id=trace_id,
            name="vector_search",
            input_data={"query": query},
            metadata={
                "results_count": len(results),
                "cache_hit": cache_hit
            }
        )

        return trace_id

    async def track_evidence_detection(
        self,
        trace_id: str,
        text: str,
        evidence_count: int,
        entities_count: int,
        citations_count: int,
        detection_time_ms: float
    ) -> None:
        """Track evidence detection operation"""
        if not self.enabled or not trace_id:
            return

        self.create_span(
            trace_id=trace_id,
            name="evidence_detection",
            input_data={"text_length": len(text)},
            metadata={
                "evidence_count": evidence_count,
                "entities_count": entities_count,
                "citations_count": citations_count,
                "detection_time_ms": detection_time_ms
            }
        )

    async def track_risk_assessment(
        self,
        trace_id: str,
        content: str,
        risk_level: str,
        risk_score: float,
        requires_review: bool,
        assessment_time_ms: float
    ) -> None:
        """Track risk assessment operation"""
        if not self.enabled or not trace_id:
            return

        self.create_span(
            trace_id=trace_id,
            name="risk_assessment",
            input_data={"content_length": len(content)},
            metadata={
                "risk_level": risk_level,
                "risk_score": risk_score,
                "requires_review": requires_review,
                "assessment_time_ms": assessment_time_ms
            }
        )

    async def track_recommendation(
        self,
        user_id: str,
        session_id: str,
        recommendation_type: str,
        agent_id: str,
        relevance_score: float,
        shown: bool = False,
        clicked: bool = False
    ) -> Optional[str]:
        """Track recommendation"""
        if not self.enabled:
            return None

        trace_id = self.create_trace(
            name="recommendation",
            user_id=user_id,
            session_id=session_id,
            metadata={
                "recommendation_type": recommendation_type,
                "agent_id": agent_id,
                "relevance_score": relevance_score,
                "shown": shown,
                "clicked": clicked
            },
            tags=["recommendation", recommendation_type]
        )

        return trace_id

    # ========================================================================
    # ANALYTICS
    # ========================================================================

    def flush(self) -> None:
        """Flush pending events to LangFuse"""
        if not self.enabled:
            return

        try:
            self.client.flush()
        except Exception as e:
            logger.error(f"Failed to flush LangFuse: {e}")


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_langfuse_monitor: Optional[LangFuseMonitor] = None


def get_langfuse_monitor() -> LangFuseMonitor:
    """
    Get singleton LangFuse monitor instance

    Returns:
        LangFuseMonitor instance
    """
    global _langfuse_monitor

    if _langfuse_monitor is None:
        _langfuse_monitor = LangFuseMonitor()

    return _langfuse_monitor


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

"""
# Example 1: Manual tracing
monitor = get_langfuse_monitor()

trace_id = monitor.create_trace(
    name="user_search",
    user_id="user123",
    session_id="session456"
)

# Track search
await monitor.track_search(
    user_id="user123",
    session_id="session456",
    query="diabetes treatment",
    results=search_results,
    search_time_ms=245.3,
    cache_hit=False
)

# Track evidence detection
await monitor.track_evidence_detection(
    trace_id=trace_id,
    text=agent_response,
    evidence_count=3,
    entities_count=5,
    citations_count=2,
    detection_time_ms=187.5
)

# Add user feedback
monitor.add_score(
    trace_id=trace_id,
    name="helpfulness",
    value=0.9,
    comment="Very helpful response"
)

# Example 2: Using decorator
monitor = get_langfuse_monitor()

@monitor.trace(name="search_agents")
async def search_agents(query: str, user_id: str):
    results = await hybrid_search.search(query)
    return results

# Automatically traced
results = await search_agents("diabetes", "user123")
"""

# Alias for backwards compatibility (lowercase 'f')
LangfuseMonitor = LangFuseMonitor
