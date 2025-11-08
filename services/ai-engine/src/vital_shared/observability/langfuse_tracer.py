"""
LangFuse Tracer for LLM Observability.

This module provides distributed tracing for all LLM operations in the AI engine,
enabling complete visibility into:
- Workflow execution
- RAG retrieval
- Tool execution
- LLM generation
- Token usage and costs
- Quality scores

LangFuse Integration: https://langfuse.com/docs/integrations/python
"""

import structlog
from typing import Optional, Dict, Any, List
from datetime import datetime
from contextlib import asynccontextmanager
import asyncio

# LangFuse SDK
try:
    from langfuse import Langfuse
    from langfuse.client import TraceClient, SpanClient, GenerationClient
except ImportError:
    # Graceful degradation if LangFuse not installed
    Langfuse = None
    TraceClient = None
    SpanClient = None
    GenerationClient = None

logger = structlog.get_logger(__name__)


# ============================================================================
# LANGFUSE TRACER CLASS
# ============================================================================

class LangfuseTracer:
    """
    LangFuse distributed tracing for LLM operations.
    
    Responsibilities:
    - Trace complete workflow executions
    - Trace RAG retrieval steps
    - Trace tool executions
    - Trace LLM generations with token usage
    - Track quality scores and user feedback
    - Support nested traces (parent-child relationships)
    
    Usage:
        tracer = LangfuseTracer()
        
        # Trace workflow execution
        trace = await tracer.trace_workflow_execution(
            workflow_input=input,
            workflow_output=output
        )
        
        # Add quality score
        await tracer.score_trace(
            trace_id=trace.id,
            name="quality_score",
            value=0.92
        )
        
        # Trace RAG retrieval
        async with tracer.trace_rag_retrieval(
            trace_id=trace.id,
            query="What is diabetes?"
        ) as span:
            # ... RAG logic ...
            span.update(output={"documents": docs})
        
        # Trace LLM generation
        generation = await tracer.trace_llm_generation(
            trace_id=trace.id,
            model="gpt-4",
            input={"query": "What is diabetes?"},
            output={"response": "Diabetes is..."},
            usage={"input": 100, "output": 200}
        )
    """
    
    def __init__(
        self,
        public_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        host: Optional[str] = None,
        enabled: bool = True
    ):
        """
        Initialize LangFuse tracer.
        
        Args:
            public_key: LangFuse public key (uses env var if None)
            secret_key: LangFuse secret key (uses env var if None)
            host: LangFuse host URL (uses env var if None)
            enabled: Enable/disable tracing (defaults to True)
        """
        self.logger = logger.bind(component="langfuse_tracer")
        self.enabled = enabled and Langfuse is not None
        
        if not self.enabled:
            if Langfuse is None:
                self.logger.warning("langfuse_not_installed",
                                  message="LangFuse SDK not available, tracing disabled")
            else:
                self.logger.info("langfuse_disabled", message="Tracing disabled by configuration")
            self.client = None
            return
        
        try:
            import os
            self.client = Langfuse(
                public_key=public_key or os.getenv("LANGFUSE_PUBLIC_KEY"),
                secret_key=secret_key or os.getenv("LANGFUSE_SECRET_KEY"),
                host=host or os.getenv("LANGFUSE_HOST", "http://localhost:3002")
            )
            self.logger.info("langfuse_tracer_initialized", enabled=True)
        except Exception as e:
            self.logger.error("langfuse_initialization_failed", error=str(e))
            self.client = None
            self.enabled = False
    
    # ========================================================================
    # WORKFLOW TRACING
    # ========================================================================
    
    async def trace_workflow_execution(
        self,
        tenant_id: str,
        user_id: str,
        conversation_id: str,
        mode: str,
        query: str,
        response: str,
        execution_time_ms: int,
        quality_score: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[TraceClient]:
        """
        Trace complete workflow execution.
        
        Args:
            tenant_id: Tenant ID
            user_id: User ID
            conversation_id: Conversation ID
            mode: Workflow mode (1, 2, 3, 4)
            query: User query
            response: AI response
            execution_time_ms: Execution time in milliseconds
            quality_score: Quality score (0-1)
            metadata: Additional metadata
            
        Returns:
            TraceClient instance or None if disabled
        """
        if not self.enabled:
            return None
        
        try:
            trace = self.client.trace(
                name=f"workflow_mode_{mode}",
                user_id=user_id,
                session_id=conversation_id,
                metadata={
                    "tenant_id": tenant_id,
                    "conversation_id": conversation_id,
                    "mode": mode,
                    "query_length": len(query),
                    "response_length": len(response),
                    "execution_time_ms": execution_time_ms,
                    "quality_score": quality_score,
                    **(metadata or {})
                },
                input={"query": query},
                output={"response": response}
            )
            
            self.logger.info("workflow_traced",
                           trace_id=trace.id,
                           mode=mode,
                           execution_time_ms=execution_time_ms)
            
            return trace
        
        except Exception as e:
            self.logger.error("workflow_trace_failed", error=str(e))
            return None
    
    # ========================================================================
    # RAG TRACING
    # ========================================================================
    
    @asynccontextmanager
    async def trace_rag_retrieval(
        self,
        trace_id: str,
        query: str,
        namespace: Optional[str] = None,
        top_k: int = 5,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Trace RAG retrieval step (async context manager).
        
        Args:
            trace_id: Parent trace ID
            query: Search query
            namespace: Pinecone namespace
            top_k: Number of documents to retrieve
            metadata: Additional metadata
            
        Yields:
            SpanClient instance for updating with results
            
        Usage:
            async with tracer.trace_rag_retrieval(
                trace_id=trace.id,
                query="What is diabetes?"
            ) as span:
                # ... RAG retrieval logic ...
                span.update(output={
                    "documents": docs,
                    "relevance_scores": scores
                })
        """
        if not self.enabled:
            yield None
            return
        
        span = None
        start_time = datetime.now()
        
        try:
            trace = self.client.trace(id=trace_id)
            span = trace.span(
                name="rag_retrieval",
                input={
                    "query": query,
                    "namespace": namespace,
                    "top_k": top_k
                },
                metadata=metadata or {}
            )
            
            self.logger.info("rag_retrieval_started",
                           trace_id=trace_id,
                           query_length=len(query))
            
            yield span
            
            # Update duration
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            span.update(metadata={"duration_ms": duration_ms})
            
            self.logger.info("rag_retrieval_completed",
                           trace_id=trace_id,
                           duration_ms=duration_ms)
        
        except Exception as e:
            self.logger.error("rag_retrieval_trace_failed", error=str(e))
            if span:
                span.update(metadata={"error": str(e)})
            yield span
    
    async def trace_rag_component(
        self,
        trace_id: str,
        component: str,  # 'embedding' | 'vector_search' | 'rerank' | 'format'
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        duration_ms: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[SpanClient]:
        """
        Trace individual RAG component.
        
        Args:
            trace_id: Parent trace ID
            component: Component name
            input_data: Input data
            output_data: Output data
            duration_ms: Duration in milliseconds
            metadata: Additional metadata
            
        Returns:
            SpanClient instance or None if disabled
        """
        if not self.enabled:
            return None
        
        try:
            trace = self.client.trace(id=trace_id)
            span = trace.span(
                name=f"rag_{component}",
                input=input_data,
                output=output_data,
                metadata={
                    "component": component,
                    "duration_ms": duration_ms,
                    **(metadata or {})
                }
            )
            
            self.logger.info("rag_component_traced",
                           trace_id=trace_id,
                           component=component,
                           duration_ms=duration_ms)
            
            return span
        
        except Exception as e:
            self.logger.error("rag_component_trace_failed",
                            component=component,
                            error=str(e))
            return None
    
    # ========================================================================
    # TOOL EXECUTION TRACING
    # ========================================================================
    
    @asynccontextmanager
    async def trace_tool_execution(
        self,
        trace_id: str,
        tool_name: str,
        tool_input: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Trace tool execution (async context manager).
        
        Args:
            trace_id: Parent trace ID
            tool_name: Tool name
            tool_input: Tool input parameters
            metadata: Additional metadata
            
        Yields:
            SpanClient instance for updating with results
            
        Usage:
            async with tracer.trace_tool_execution(
                trace_id=trace.id,
                tool_name="web_search",
                tool_input={"query": "latest diabetes research"}
            ) as span:
                # ... tool execution logic ...
                span.update(output={"results": results})
        """
        if not self.enabled:
            yield None
            return
        
        span = None
        start_time = datetime.now()
        
        try:
            trace = self.client.trace(id=trace_id)
            span = trace.span(
                name=f"tool_{tool_name}",
                input=tool_input,
                metadata={
                    "tool_name": tool_name,
                    **(metadata or {})
                }
            )
            
            self.logger.info("tool_execution_started",
                           trace_id=trace_id,
                           tool_name=tool_name)
            
            yield span
            
            # Update duration
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            span.update(metadata={"duration_ms": duration_ms})
            
            self.logger.info("tool_execution_completed",
                           trace_id=trace_id,
                           tool_name=tool_name,
                           duration_ms=duration_ms)
        
        except Exception as e:
            self.logger.error("tool_execution_trace_failed",
                            tool_name=tool_name,
                            error=str(e))
            if span:
                span.update(metadata={"error": str(e)})
            yield span
    
    # ========================================================================
    # LLM GENERATION TRACING
    # ========================================================================
    
    async def trace_llm_generation(
        self,
        trace_id: str,
        model: str,
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        usage: Dict[str, int],  # {"input": 100, "output": 200, "total": 300}
        cost_usd: Optional[float] = None,
        latency_ms: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[GenerationClient]:
        """
        Trace LLM generation with token usage.
        
        Args:
            trace_id: Parent trace ID
            model: Model name (e.g., "gpt-4")
            input_data: Input prompt/messages
            output_data: Generated response
            usage: Token usage {"input": X, "output": Y, "total": Z}
            cost_usd: Cost in USD
            latency_ms: Latency in milliseconds
            metadata: Additional metadata
            
        Returns:
            GenerationClient instance or None if disabled
        """
        if not self.enabled:
            return None
        
        try:
            trace = self.client.trace(id=trace_id)
            generation = trace.generation(
                name="llm_generation",
                model=model,
                input=input_data,
                output=output_data,
                usage={
                    "input": usage.get("input", 0),
                    "output": usage.get("output", 0),
                    "total": usage.get("total", 0)
                },
                metadata={
                    "model": model,
                    "cost_usd": cost_usd,
                    "latency_ms": latency_ms,
                    **(metadata or {})
                }
            )
            
            self.logger.info("llm_generation_traced",
                           trace_id=trace_id,
                           model=model,
                           input_tokens=usage.get("input", 0),
                           output_tokens=usage.get("output", 0),
                           cost_usd=cost_usd)
            
            return generation
        
        except Exception as e:
            self.logger.error("llm_generation_trace_failed",
                            model=model,
                            error=str(e))
            return None
    
    # ========================================================================
    # SCORING & FEEDBACK
    # ========================================================================
    
    async def score_trace(
        self,
        trace_id: str,
        name: str,
        value: float,
        comment: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add a score to a trace.
        
        Args:
            trace_id: Trace ID
            name: Score name (e.g., "quality_score", "user_rating")
            value: Score value
            comment: Optional comment
            metadata: Additional metadata
            
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            self.client.score(
                trace_id=trace_id,
                name=name,
                value=value,
                comment=comment,
                metadata=metadata or {}
            )
            
            self.logger.info("trace_scored",
                           trace_id=trace_id,
                           score_name=name,
                           score_value=value)
            
            return True
        
        except Exception as e:
            self.logger.error("trace_score_failed",
                            trace_id=trace_id,
                            score_name=name,
                            error=str(e))
            return False
    
    async def add_user_feedback(
        self,
        trace_id: str,
        rating: int,  # 1-5 stars
        comment: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add user feedback to a trace.
        
        Args:
            trace_id: Trace ID
            rating: User rating (1-5 stars)
            comment: Optional comment
            metadata: Additional metadata
            
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            return False
        
        return await self.score_trace(
            trace_id=trace_id,
            name="user_rating",
            value=rating,
            comment=comment,
            metadata=metadata
        )
    
    # ========================================================================
    # MEMORY OPERATIONS TRACING
    # ========================================================================
    
    async def trace_memory_operation(
        self,
        trace_id: str,
        operation: str,  # 'load' | 'save' | 'append' | 'clear'
        memory_type: str,  # 'agent' | 'chat' | 'user'
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        duration_ms: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[SpanClient]:
        """
        Trace memory operation.
        
        Args:
            trace_id: Parent trace ID
            operation: Operation type
            memory_type: Memory type
            input_data: Input data
            output_data: Output data
            duration_ms: Duration in milliseconds
            metadata: Additional metadata
            
        Returns:
            SpanClient instance or None if disabled
        """
        if not self.enabled:
            return None
        
        try:
            trace = self.client.trace(id=trace_id)
            span = trace.span(
                name=f"memory_{operation}",
                input=input_data,
                output=output_data,
                metadata={
                    "operation": operation,
                    "memory_type": memory_type,
                    "duration_ms": duration_ms,
                    **(metadata or {})
                }
            )
            
            self.logger.info("memory_operation_traced",
                           trace_id=trace_id,
                           operation=operation,
                           memory_type=memory_type)
            
            return span
        
        except Exception as e:
            self.logger.error("memory_operation_trace_failed",
                            operation=operation,
                            error=str(e))
            return None
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    async def flush(self) -> None:
        """
        Flush any pending traces to LangFuse.
        
        Call this before shutdown to ensure all traces are sent.
        """
        if not self.enabled:
            return
        
        try:
            self.client.flush()
            self.logger.info("langfuse_flushed")
        except Exception as e:
            self.logger.error("langfuse_flush_failed", error=str(e))
    
    async def close(self) -> None:
        """
        Close the LangFuse client and flush remaining traces.
        """
        await self.flush()
        self.logger.info("langfuse_tracer_closed")


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

# Global instance (lazy-initialized)
_langfuse_instance: Optional[LangfuseTracer] = None


def get_langfuse_tracer() -> LangfuseTracer:
    """
    Get singleton LangFuse tracer instance.
    
    Returns:
        LangfuseTracer instance
    """
    global _langfuse_instance
    
    if _langfuse_instance is None:
        _langfuse_instance = LangfuseTracer()
    
    return _langfuse_instance

