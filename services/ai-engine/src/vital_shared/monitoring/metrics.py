"""
Performance Monitoring - Prometheus Metrics

Comprehensive metrics for VITAL AI Platform:
- Workflow execution metrics (latency, throughput, errors)
- Cache performance metrics (hit rate, size, evictions)
- Quality metrics (scores, degradation, warnings)
- Cost metrics (LLM calls, tool executions)
- Business metrics (queries per tenant, mode distribution)

Usage:
    from vital_shared.monitoring.metrics import (
        track_workflow_execution,
        track_cache_operation,
        track_quality_score,
        get_metrics_handler
    )
    
    # Automatic tracking in workflows
    @track_workflow_execution(mode="1")
    async def execute_workflow(...):
        ...
    
    # Manual tracking
    track_cache_operation("hit", "1", "tenant123")
    track_quality_score(0.95, "1", ["citation_count_low"])
"""

from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    Summary,
    CollectorRegistry,
    generate_latest,
    CONTENT_TYPE_LATEST,
    Info
)
from functools import wraps
from typing import Optional, List, Callable, Any
import time
import structlog

logger = structlog.get_logger(__name__)

# Create registry (allows multiple registries for testing)
registry = CollectorRegistry()

# ============================================================================
# WORKFLOW EXECUTION METRICS
# ============================================================================

# Request counters
workflow_requests_total = Counter(
    'vital_workflow_requests_total',
    'Total number of workflow requests',
    ['mode', 'tenant_id', 'agent_id'],
    registry=registry
)

workflow_requests_success = Counter(
    'vital_workflow_requests_success_total',
    'Total number of successful workflow requests',
    ['mode', 'tenant_id'],
    registry=registry
)

workflow_requests_failed = Counter(
    'vital_workflow_requests_failed_total',
    'Total number of failed workflow requests',
    ['mode', 'tenant_id', 'error_type'],
    registry=registry
)

# Latency metrics
workflow_duration_seconds = Histogram(
    'vital_workflow_duration_seconds',
    'Workflow execution duration in seconds',
    ['mode', 'cache_status'],  # cache_status: hit, miss, disabled
    buckets=[0.1, 0.5, 1.0, 2.0, 3.0, 5.0, 10.0, 30.0, 60.0],
    registry=registry
)

workflow_duration_summary = Summary(
    'vital_workflow_duration_summary',
    'Workflow execution duration summary',
    ['mode'],
    registry=registry
)

# ============================================================================
# CACHE PERFORMANCE METRICS
# ============================================================================

cache_operations_total = Counter(
    'vital_cache_operations_total',
    'Total cache operations',
    ['operation', 'mode'],  # operation: hit, miss, write, evict, invalidate
    registry=registry
)

cache_hit_rate = Gauge(
    'vital_cache_hit_rate',
    'Cache hit rate (0-1)',
    ['mode'],
    registry=registry
)

cache_size = Gauge(
    'vital_cache_size_entries',
    'Current number of entries in cache',
    registry=registry
)

cache_memory_bytes = Gauge(
    'vital_cache_memory_bytes',
    'Estimated cache memory usage in bytes',
    registry=registry
)

cache_entry_age_seconds = Histogram(
    'vital_cache_entry_age_seconds',
    'Age of cached entries when accessed',
    buckets=[1, 10, 30, 60, 120, 300, 600],  # 1s to 10min
    registry=registry
)

# ============================================================================
# QUALITY METRICS
# ============================================================================

quality_score_distribution = Histogram(
    'vital_quality_score',
    'Quality score distribution (0-1)',
    ['mode'],
    buckets=[0.0, 0.5, 0.7, 0.8, 0.9, 0.95, 1.0],
    registry=registry
)

degraded_responses_total = Counter(
    'vital_degraded_responses_total',
    'Total number of degraded responses',
    ['mode', 'degradation_reason'],
    registry=registry
)

warnings_total = Counter(
    'vital_warnings_total',
    'Total number of warnings generated',
    ['mode', 'warning_type'],
    registry=registry
)

# ============================================================================
# COST METRICS
# ============================================================================

llm_api_calls_total = Counter(
    'vital_llm_api_calls_total',
    'Total LLM API calls',
    ['mode', 'model', 'cached'],  # cached: true/false
    registry=registry
)

llm_tokens_used = Counter(
    'vital_llm_tokens_used_total',
    'Total LLM tokens used',
    ['mode', 'token_type'],  # token_type: input, output
    registry=registry
)

tool_executions_total = Counter(
    'vital_tool_executions_total',
    'Total tool executions',
    ['tool_name', 'status'],  # status: success, failed, timeout
    registry=registry
)

rag_retrievals_total = Counter(
    'vital_rag_retrievals_total',
    'Total RAG retrievals',
    ['mode', 'source_type', 'status'],
    registry=registry
)

estimated_cost_dollars = Counter(
    'vital_estimated_cost_dollars',
    'Estimated cost in dollars',
    ['mode', 'cost_type'],  # cost_type: llm, tools, rag
    registry=registry
)

# ============================================================================
# BUSINESS METRICS
# ============================================================================

queries_per_tenant = Counter(
    'vital_queries_per_tenant_total',
    'Total queries per tenant',
    ['tenant_id', 'mode'],
    registry=registry
)

mode_distribution = Counter(
    'vital_mode_distribution_total',
    'Distribution of queries across modes',
    ['mode'],
    registry=registry
)

agent_usage = Counter(
    'vital_agent_usage_total',
    'Agent usage statistics',
    ['agent_id', 'agent_name'],
    registry=registry
)

# ============================================================================
# SYSTEM METRICS
# ============================================================================

connection_pool_size = Gauge(
    'vital_connection_pool_size',
    'Connection pool size',
    ['pool_type'],  # pool_type: db, http, llm
    registry=registry
)

active_connections = Gauge(
    'vital_active_connections',
    'Active connections',
    ['pool_type'],
    registry=registry
)

# ============================================================================
# INFO METRICS (Build info, version, etc.)
# ============================================================================

build_info = Info(
    'vital_build',
    'Build information',
    registry=registry
)

# Set build info (call this at startup)
def set_build_info(version: str, commit: str, environment: str):
    """Set build information"""
    build_info.info({
        'version': version,
        'commit': commit[:8] if commit else 'unknown',
        'environment': environment
    })


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def track_workflow_execution(
    mode: str,
    tenant_id: str,
    agent_id: Optional[str] = None,
    cache_status: str = "disabled"
):
    """
    Decorator to track workflow execution metrics.
    
    Args:
        mode: Workflow mode (1, 2, 3, 4)
        tenant_id: Tenant identifier
        agent_id: Optional agent identifier
        cache_status: Cache status (hit, miss, disabled)
    
    Usage:
        @track_workflow_execution(mode="1", tenant_id="tenant123")
        async def execute_workflow(...):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Track request
            workflow_requests_total.labels(
                mode=mode,
                tenant_id=tenant_id,
                agent_id=agent_id or "none"
            ).inc()
            
            mode_distribution.labels(mode=mode).inc()
            queries_per_tenant.labels(tenant_id=tenant_id, mode=mode).inc()
            
            # Track timing
            start_time = time.time()
            
            try:
                # Execute function
                result = await func(*args, **kwargs)
                
                # Track success
                workflow_requests_success.labels(
                    mode=mode,
                    tenant_id=tenant_id
                ).inc()
                
                # Track duration
                duration = time.time() - start_time
                workflow_duration_seconds.labels(
                    mode=mode,
                    cache_status=cache_status
                ).observe(duration)
                workflow_duration_summary.labels(mode=mode).observe(duration)
                
                return result
                
            except Exception as e:
                # Track failure
                workflow_requests_failed.labels(
                    mode=mode,
                    tenant_id=tenant_id,
                    error_type=type(e).__name__
                ).inc()
                
                # Track duration even on failure
                duration = time.time() - start_time
                workflow_duration_seconds.labels(
                    mode=mode,
                    cache_status=cache_status
                ).observe(duration)
                
                raise
        
        return wrapper
    return decorator


def track_cache_operation(
    operation: str,
    mode: str,
    entry_age_seconds: Optional[float] = None
):
    """
    Track cache operation.
    
    Args:
        operation: Operation type (hit, miss, write, evict, invalidate)
        mode: Workflow mode
        entry_age_seconds: Age of entry (for hits)
    """
    cache_operations_total.labels(operation=operation, mode=mode).inc()
    
    if entry_age_seconds is not None:
        cache_entry_age_seconds.observe(entry_age_seconds)


def update_cache_metrics(
    cache_size_value: int,
    cache_memory_value: int,
    hit_rate_by_mode: dict
):
    """
    Update cache gauge metrics.
    
    Args:
        cache_size_value: Current cache size
        cache_memory_value: Estimated memory usage
        hit_rate_by_mode: Dict of hit rates per mode
    """
    cache_size.set(cache_size_value)
    cache_memory_bytes.set(cache_memory_value)
    
    for mode, rate in hit_rate_by_mode.items():
        cache_hit_rate.labels(mode=mode).set(rate)


def track_quality_score(
    score: float,
    mode: str,
    degradation_reasons: List[str] = None,
    warnings: List[str] = None
):
    """
    Track quality metrics.
    
    Args:
        score: Quality score (0-1)
        mode: Workflow mode
        degradation_reasons: List of degradation reasons
        warnings: List of warnings
    """
    quality_score_distribution.labels(mode=mode).observe(score)
    
    # Track degraded responses
    if score < 1.0 and degradation_reasons:
        for reason in degradation_reasons:
            degraded_responses_total.labels(
                mode=mode,
                degradation_reason=reason
            ).inc()
    
    # Track warnings
    if warnings:
        for warning in warnings:
            # Extract warning type (first few words)
            warning_type = " ".join(warning.split()[:3])
            warnings_total.labels(
                mode=mode,
                warning_type=warning_type
            ).inc()


def track_llm_call(
    mode: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    cached: bool = False,
    cost_per_1k_input: float = 0.03,
    cost_per_1k_output: float = 0.06
):
    """
    Track LLM API call metrics.
    
    Args:
        mode: Workflow mode
        model: LLM model name
        input_tokens: Input tokens used
        output_tokens: Output tokens used
        cached: Whether response was cached
        cost_per_1k_input: Cost per 1K input tokens
        cost_per_1k_output: Cost per 1K output tokens
    """
    llm_api_calls_total.labels(
        mode=mode,
        model=model,
        cached=str(cached).lower()
    ).inc()
    
    llm_tokens_used.labels(mode=mode, token_type="input").inc(input_tokens)
    llm_tokens_used.labels(mode=mode, token_type="output").inc(output_tokens)
    
    # Estimate cost
    if not cached:
        cost = (input_tokens / 1000 * cost_per_1k_input) + (output_tokens / 1000 * cost_per_1k_output)
        estimated_cost_dollars.labels(mode=mode, cost_type="llm").inc(cost)


def track_tool_execution(
    tool_name: str,
    status: str,
    duration_seconds: Optional[float] = None
):
    """
    Track tool execution.
    
    Args:
        tool_name: Tool name
        status: Execution status (success, failed, timeout)
        duration_seconds: Execution duration
    """
    tool_executions_total.labels(tool_name=tool_name, status=status).inc()


def track_rag_retrieval(
    mode: str,
    source_type: str,
    status: str,
    document_count: int = 0
):
    """
    Track RAG retrieval.
    
    Args:
        mode: Workflow mode
        source_type: Source type (pinecone, supabase, etc.)
        status: Retrieval status (success, failed)
        document_count: Number of documents retrieved
    """
    rag_retrievals_total.labels(
        mode=mode,
        source_type=source_type,
        status=status
    ).inc()


def track_agent_usage(agent_id: str, agent_name: str):
    """Track agent usage"""
    agent_usage.labels(agent_id=agent_id, agent_name=agent_name).inc()


def update_connection_pool_metrics(
    pool_type: str,
    pool_size: int,
    active: int
):
    """
    Update connection pool metrics.
    
    Args:
        pool_type: Pool type (db, http, llm)
        pool_size: Total pool size
        active: Active connections
    """
    connection_pool_size.labels(pool_type=pool_type).set(pool_size)
    active_connections.labels(pool_type=pool_type).set(active)


# ============================================================================
# METRICS ENDPOINT (for Prometheus scraping)
# ============================================================================

def get_metrics_handler():
    """
    Get metrics in Prometheus format.
    
    Usage (FastAPI):
        from fastapi import Response
        
        @app.get("/metrics")
        async def metrics():
            content = get_metrics_handler()
            return Response(content=content, media_type=CONTENT_TYPE_LATEST)
    
    Returns:
        Prometheus metrics in text format
    """
    return generate_latest(registry)


def get_metrics_content_type():
    """Get Prometheus content type"""
    return CONTENT_TYPE_LATEST


# ============================================================================
# TESTING UTILITIES
# ============================================================================

def reset_metrics():
    """Reset all metrics (for testing)"""
    # Note: Prometheus metrics can't be truly reset, but we can clear registry
    logger.warning("Metrics reset called - only use in testing!")

