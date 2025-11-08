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
# USER METRICS (Per-User Tracking)
# ============================================================================

# User queries
user_queries_total = Counter(
    'vital_user_queries_total',
    'Total queries per user',
    ['user_id', 'tenant_id', 'mode'],
    registry=registry
)

# User token usage
user_tokens_used = Counter(
    'vital_user_tokens_used_total',
    'Total tokens used per user',
    ['user_id', 'tenant_id', 'token_type'],  # token_type: input, output
    registry=registry
)

# User cost
user_cost_dollars = Counter(
    'vital_user_cost_dollars',
    'Total cost per user in dollars',
    ['user_id', 'tenant_id', 'cost_type'],  # cost_type: llm, tools, rag
    registry=registry
)

# User agent usage
user_agent_usage = Counter(
    'vital_user_agent_usage_total',
    'Agent usage per user',
    ['user_id', 'tenant_id', 'agent_id', 'agent_name'],
    registry=registry
)

# User workflow usage
user_workflow_usage = Counter(
    'vital_user_workflow_usage_total',
    'Workflow usage per user',
    ['user_id', 'tenant_id', 'mode'],
    registry=registry
)

# User tool usage
user_tool_usage = Counter(
    'vital_user_tool_usage_total',
    'Tool usage per user',
    ['user_id', 'tenant_id', 'tool_name'],
    registry=registry
)

# User feedback
user_feedback_total = Counter(
    'vital_user_feedback_total',
    'User feedback count',
    ['user_id', 'tenant_id', 'feedback_type'],  # feedback_type: thumbs_up, thumbs_down, rating
    registry=registry
)

user_feedback_ratings = Histogram(
    'vital_user_feedback_ratings',
    'User feedback rating distribution (1-5)',
    ['user_id', 'tenant_id'],
    buckets=[1, 2, 3, 4, 5],
    registry=registry
)

# ============================================================================
# USER ABUSE DETECTION METRICS
# ============================================================================

# Rate limit violations
user_rate_limit_violations = Counter(
    'vital_user_rate_limit_violations_total',
    'Rate limit violations per user',
    ['user_id', 'tenant_id', 'limit_type'],  # limit_type: requests_per_minute, tokens_per_minute, cost_per_hour
    registry=registry
)

# Suspicious patterns
user_suspicious_activity = Counter(
    'vital_user_suspicious_activity_total',
    'Suspicious activity detected',
    ['user_id', 'tenant_id', 'activity_type'],  # activity_type: rapid_requests, excessive_tokens, prompt_injection, abuse_detected
    registry=registry
)

# Request rate per user
user_request_rate = Histogram(
    'vital_user_request_rate_per_minute',
    'User request rate per minute',
    ['user_id', 'tenant_id'],
    buckets=[1, 5, 10, 20, 50, 100, 200],
    registry=registry
)

# User session duration
user_session_duration = Histogram(
    'vital_user_session_duration_seconds',
    'User session duration in seconds',
    ['user_id', 'tenant_id'],
    buckets=[60, 300, 600, 1800, 3600, 7200],  # 1min to 2hrs
    registry=registry
)

# Blocked users
blocked_users_total = Counter(
    'vital_blocked_users_total',
    'Total blocked users',
    ['tenant_id', 'block_reason'],
    registry=registry
)

# ============================================================================
# MEMORY METRICS (Agent, Chat, User Memory)
# ============================================================================

# Agent memory
agent_memory_size_bytes = Gauge(
    'vital_agent_memory_size_bytes',
    'Agent memory size in bytes',
    ['agent_id', 'memory_type'],  # memory_type: context, history, state
    registry=registry
)

agent_memory_items = Gauge(
    'vital_agent_memory_items_total',
    'Number of items in agent memory',
    ['agent_id', 'memory_type'],
    registry=registry
)

agent_memory_operations = Counter(
    'vital_agent_memory_operations_total',
    'Agent memory operations',
    ['agent_id', 'operation'],  # operation: read, write, update, delete, clear
    registry=registry
)

# Chat memory
chat_memory_conversations = Gauge(
    'vital_chat_memory_conversations_total',
    'Total active conversations in memory',
    ['user_id', 'tenant_id'],
    registry=registry
)

chat_memory_messages = Gauge(
    'vital_chat_memory_messages_total',
    'Total messages in chat memory',
    ['user_id', 'tenant_id'],
    registry=registry
)

chat_memory_turns = Counter(
    'vital_chat_memory_turns_total',
    'Total conversation turns',
    ['user_id', 'tenant_id', 'mode'],
    registry=registry
)

chat_memory_size_bytes = Gauge(
    'vital_chat_memory_size_bytes',
    'Chat memory size in bytes',
    ['user_id', 'tenant_id'],
    registry=registry
)

chat_memory_operations = Counter(
    'vital_chat_memory_operations_total',
    'Chat memory operations',
    ['user_id', 'tenant_id', 'operation'],  # operation: load, save, append, clear
    registry=registry
)

# User memory (preferences, history)
user_memory_preferences = Gauge(
    'vital_user_memory_preferences_total',
    'Number of user preferences stored',
    ['user_id', 'tenant_id'],
    registry=registry
)

user_memory_history_size = Gauge(
    'vital_user_memory_history_size_total',
    'User history size (number of items)',
    ['user_id', 'tenant_id', 'history_type'],  # history_type: queries, feedback, interactions
    registry=registry
)

user_memory_operations = Counter(
    'vital_user_memory_operations_total',
    'User memory operations',
    ['user_id', 'tenant_id', 'operation'],  # operation: read, write, update, delete
    registry=registry
)

user_memory_retrieval_latency = Histogram(
    'vital_user_memory_retrieval_seconds',
    'User memory retrieval latency',
    ['user_id', 'tenant_id', 'memory_type'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0],
    registry=registry
)

# Memory cache metrics
memory_cache_hits = Counter(
    'vital_memory_cache_hits_total',
    'Memory cache hits',
    ['memory_type'],  # memory_type: agent, chat, user
    registry=registry
)

memory_cache_misses = Counter(
    'vital_memory_cache_misses_total',
    'Memory cache misses',
    ['memory_type'],
    registry=registry
)

memory_cache_evictions = Counter(
    'vital_memory_cache_evictions_total',
    'Memory cache evictions',
    ['memory_type'],
    registry=registry
)

# ============================================================================
# PANEL ANALYTICS METRICS
# ============================================================================

# Panel views
panel_views_total = Counter(
    'vital_panel_views_total',
    'Total panel views',
    ['user_id', 'tenant_id', 'panel_name', 'panel_type'],  # panel_type: research, chat, settings, profile
    registry=registry
)

# Panel interactions
panel_interactions_total = Counter(
    'vital_panel_interactions_total',
    'Total panel interactions',
    ['user_id', 'tenant_id', 'panel_name', 'interaction_type'],  # interaction_type: click, scroll, filter, sort, export
    registry=registry
)

# Panel session duration
panel_session_duration = Histogram(
    'vital_panel_session_duration_seconds',
    'Panel session duration in seconds',
    ['user_id', 'tenant_id', 'panel_name'],
    buckets=[1, 5, 10, 30, 60, 300, 600, 1800],  # 1s to 30min
    registry=registry
)

# Panel load time
panel_load_time = Histogram(
    'vital_panel_load_time_seconds',
    'Panel load time in seconds',
    ['panel_name', 'panel_type'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
    registry=registry
)

# Panel errors
panel_errors_total = Counter(
    'vital_panel_errors_total',
    'Total panel errors',
    ['panel_name', 'error_type'],
    registry=registry
)

# Panel data refresh
panel_data_refresh_total = Counter(
    'vital_panel_data_refresh_total',
    'Total panel data refreshes',
    ['user_id', 'tenant_id', 'panel_name'],
    registry=registry
)

# Panel filters applied
panel_filters_applied = Counter(
    'vital_panel_filters_applied_total',
    'Total filters applied to panels',
    ['user_id', 'tenant_id', 'panel_name', 'filter_type'],
    registry=registry
)

# Panel exports
panel_exports_total = Counter(
    'vital_panel_exports_total',
    'Total panel data exports',
    ['user_id', 'tenant_id', 'panel_name', 'export_format'],  # export_format: pdf, csv, json
    registry=registry
)

# Panel search queries
panel_search_queries = Counter(
    'vital_panel_search_queries_total',
    'Total search queries in panels',
    ['user_id', 'tenant_id', 'panel_name'],
    registry=registry
)

# Panel collaboration events
panel_collaboration_events = Counter(
    'vital_panel_collaboration_events_total',
    'Panel collaboration events',
    ['tenant_id', 'panel_name', 'event_type'],  # event_type: share, comment, annotate
    registry=registry
)

# ============================================================================
# WORKFLOW ANALYTICS METRICS
# ============================================================================

# Workflow node execution time
workflow_node_duration = Histogram(
    'vital_workflow_node_duration_seconds',
    'Workflow node execution duration',
    ['mode', 'node_name'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
    registry=registry
)

# Workflow node executions
workflow_node_executions = Counter(
    'vital_workflow_node_executions_total',
    'Total workflow node executions',
    ['mode', 'node_name', 'status'],  # status: success, failed, skipped
    registry=registry
)

# Workflow path taken
workflow_path_taken = Counter(
    'vital_workflow_path_taken_total',
    'Workflow paths taken',
    ['mode', 'path_name'],  # path_name: standard, tool_required, cached, degraded
    registry=registry
)

# Workflow transitions
workflow_transitions = Counter(
    'vital_workflow_transitions_total',
    'Workflow state transitions',
    ['mode', 'from_node', 'to_node'],
    registry=registry
)

# Workflow bottlenecks (slowest nodes)
workflow_bottleneck_duration = Gauge(
    'vital_workflow_bottleneck_duration_seconds',
    'Duration of workflow bottleneck nodes',
    ['mode', 'node_name'],
    registry=registry
)

# Workflow retry count
workflow_retries_total = Counter(
    'vital_workflow_retries_total',
    'Total workflow retries',
    ['mode', 'node_name', 'retry_reason'],
    registry=registry
)

# Workflow completion rate
workflow_completion_rate = Gauge(
    'vital_workflow_completion_rate',
    'Workflow completion rate (0-1)',
    ['mode'],
    registry=registry
)

# Workflow abandonment
workflow_abandonments_total = Counter(
    'vital_workflow_abandonments_total',
    'Total workflow abandonments',
    ['mode', 'abandoned_at_node'],
    registry=registry
)

# ============================================================================
# KNOWLEDGE ANALYTICS METRICS
# ============================================================================

# RAG retrieval quality
rag_retrieval_quality_score = Histogram(
    'vital_rag_retrieval_quality_score',
    'RAG retrieval quality score (0-1)',
    ['mode', 'source_type'],
    buckets=[0.0, 0.5, 0.7, 0.8, 0.9, 0.95, 1.0],
    registry=registry
)

# Source diversity
rag_source_diversity = Histogram(
    'vital_rag_source_diversity',
    'Number of unique sources retrieved',
    ['mode'],
    buckets=[1, 2, 3, 5, 7, 10, 15, 20],
    registry=registry
)

# Citation accuracy
citation_accuracy_score = Histogram(
    'vital_citation_accuracy_score',
    'Citation accuracy score (0-1)',
    ['mode'],
    buckets=[0.0, 0.5, 0.7, 0.8, 0.9, 0.95, 1.0],
    registry=registry
)

# Citations per response
citations_per_response = Histogram(
    'vital_citations_per_response',
    'Number of citations per response',
    ['mode'],
    buckets=[0, 1, 3, 5, 10, 15, 20, 30],
    registry=registry
)

# Knowledge base coverage
knowledge_base_hits = Counter(
    'vital_knowledge_base_hits_total',
    'Knowledge base hits by namespace',
    ['namespace', 'source_type'],
    registry=registry
)

# RAG retrieval latency by component
rag_component_latency = Histogram(
    'vital_rag_component_latency_seconds',
    'RAG component latency',
    ['component'],  # component: embedding, vector_search, rerank, format
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0],
    registry=registry
)

# Document relevance scores
document_relevance_score = Histogram(
    'vital_document_relevance_score',
    'Retrieved document relevance scores',
    ['mode', 'source_type'],
    buckets=[0.0, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 1.0],
    registry=registry
)

# Knowledge freshness
knowledge_freshness_days = Histogram(
    'vital_knowledge_freshness_days',
    'Age of retrieved knowledge in days',
    ['source_type'],
    buckets=[1, 7, 30, 90, 180, 365, 730],
    registry=registry
)

# Empty retrieval rate
rag_empty_retrievals = Counter(
    'vital_rag_empty_retrievals_total',
    'RAG retrievals with no results',
    ['mode', 'query_type'],
    registry=registry
)

# ============================================================================
# PERFORMANCE ANALYTICS METRICS
# ============================================================================

# Latency by component
component_latency = Histogram(
    'vital_component_latency_seconds',
    'Component-level latency',
    ['component'],  # component: agent_load, rag, tool_suggest, tool_exec, llm, memory, total
    buckets=[0.001, 0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
    registry=registry
)

# Accuracy metrics
response_accuracy_score = Histogram(
    'vital_response_accuracy_score',
    'Response accuracy score (0-1)',
    ['mode', 'evaluation_method'],  # evaluation_method: llm_judge, user_feedback, automated
    buckets=[0.0, 0.5, 0.7, 0.8, 0.9, 0.95, 1.0],
    registry=registry
)

# Confidence scores
response_confidence_score = Histogram(
    'vital_response_confidence_score',
    'AI response confidence score (0-1)',
    ['mode'],
    buckets=[0.0, 0.5, 0.7, 0.8, 0.9, 0.95, 1.0],
    registry=registry
)

# Low confidence responses
low_confidence_responses = Counter(
    'vital_low_confidence_responses_total',
    'Responses with low confidence (<0.7)',
    ['mode', 'confidence_range'],  # confidence_range: 0-0.3, 0.3-0.5, 0.5-0.7
    registry=registry
)

# Hallucination detection
hallucination_detected = Counter(
    'vital_hallucination_detected_total',
    'Detected hallucinations',
    ['mode', 'detection_method'],  # detection_method: citation_check, consistency_check, user_report
    registry=registry
)

# Response completeness
response_completeness_score = Histogram(
    'vital_response_completeness_score',
    'Response completeness score (0-1)',
    ['mode'],
    buckets=[0.0, 0.5, 0.7, 0.8, 0.9, 0.95, 1.0],
    registry=registry
)

# Time to first token (TTFT)
time_to_first_token = Histogram(
    'vital_time_to_first_token_seconds',
    'Time to first token from LLM',
    ['mode', 'model'],
    buckets=[0.1, 0.5, 1.0, 2.0, 3.0, 5.0, 10.0],
    registry=registry
)

# Tokens per second
tokens_per_second = Histogram(
    'vital_tokens_per_second',
    'LLM token generation rate',
    ['mode', 'model'],
    buckets=[10, 20, 30, 50, 75, 100, 150, 200],
    registry=registry
)

# Throughput (requests per second)
throughput_requests_per_second = Gauge(
    'vital_throughput_requests_per_second',
    'Current throughput in requests per second',
    ['mode'],
    registry=registry
)

# Concurrent requests
concurrent_requests = Gauge(
    'vital_concurrent_requests',
    'Number of concurrent requests being processed',
    ['mode'],
    registry=registry
)

# Queue depth
request_queue_depth = Gauge(
    'vital_request_queue_depth',
    'Number of requests waiting in queue',
    registry=registry
)

# Response validation failures
response_validation_failures = Counter(
    'vital_response_validation_failures_total',
    'Response validation failures',
    ['mode', 'validation_type'],  # validation_type: format, safety, quality, hallucination
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


# ============================================================================
# USER TRACKING FUNCTIONS
# ============================================================================

def track_user_query(
    user_id: str,
    tenant_id: str,
    mode: str
):
    """
    Track user query.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        mode: Workflow mode
    """
    user_queries_total.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        mode=mode
    ).inc()


def track_user_tokens(
    user_id: str,
    tenant_id: str,
    input_tokens: int,
    output_tokens: int
):
    """
    Track user token usage.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        input_tokens: Input tokens used
        output_tokens: Output tokens used
    """
    user_tokens_used.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        token_type="input"
    ).inc(input_tokens)
    
    user_tokens_used.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        token_type="output"
    ).inc(output_tokens)


def track_user_cost(
    user_id: str,
    tenant_id: str,
    llm_cost: float = 0.0,
    tool_cost: float = 0.0,
    rag_cost: float = 0.0
):
    """
    Track user cost.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        llm_cost: LLM cost in dollars
        tool_cost: Tool cost in dollars
        rag_cost: RAG cost in dollars
    """
    if llm_cost > 0:
        user_cost_dollars.labels(
            user_id=user_id,
            tenant_id=tenant_id,
            cost_type="llm"
        ).inc(llm_cost)
    
    if tool_cost > 0:
        user_cost_dollars.labels(
            user_id=user_id,
            tenant_id=tenant_id,
            cost_type="tools"
        ).inc(tool_cost)
    
    if rag_cost > 0:
        user_cost_dollars.labels(
            user_id=user_id,
            tenant_id=tenant_id,
            cost_type="rag"
        ).inc(rag_cost)


def track_user_agent(
    user_id: str,
    tenant_id: str,
    agent_id: str,
    agent_name: str
):
    """
    Track user agent usage.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        agent_id: Agent identifier
        agent_name: Agent name
    """
    user_agent_usage.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        agent_id=agent_id,
        agent_name=agent_name
    ).inc()


def track_user_workflow(
    user_id: str,
    tenant_id: str,
    mode: str
):
    """
    Track user workflow usage.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        mode: Workflow mode
    """
    user_workflow_usage.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        mode=mode
    ).inc()


def track_user_tool(
    user_id: str,
    tenant_id: str,
    tool_name: str
):
    """
    Track user tool usage.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        tool_name: Tool name
    """
    user_tool_usage.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        tool_name=tool_name
    ).inc()


def track_user_feedback(
    user_id: str,
    tenant_id: str,
    feedback_type: str,
    rating: Optional[int] = None
):
    """
    Track user feedback.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        feedback_type: Feedback type (thumbs_up, thumbs_down, rating, comment)
        rating: Optional rating (1-5)
    """
    user_feedback_total.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        feedback_type=feedback_type
    ).inc()
    
    if rating is not None and 1 <= rating <= 5:
        user_feedback_ratings.labels(
            user_id=user_id,
            tenant_id=tenant_id
        ).observe(rating)


# ============================================================================
# USER ABUSE DETECTION FUNCTIONS
# ============================================================================

def track_rate_limit_violation(
    user_id: str,
    tenant_id: str,
    limit_type: str
):
    """
    Track rate limit violation.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        limit_type: Limit type (requests_per_minute, tokens_per_minute, cost_per_hour)
    """
    user_rate_limit_violations.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        limit_type=limit_type
    ).inc()


def track_suspicious_activity(
    user_id: str,
    tenant_id: str,
    activity_type: str
):
    """
    Track suspicious user activity.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        activity_type: Activity type (rapid_requests, excessive_tokens, prompt_injection, abuse_detected)
    """
    user_suspicious_activity.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        activity_type=activity_type
    ).inc()


def track_user_request_rate(
    user_id: str,
    tenant_id: str,
    requests_per_minute: int
):
    """
    Track user request rate.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        requests_per_minute: Requests per minute
    """
    user_request_rate.labels(
        user_id=user_id,
        tenant_id=tenant_id
    ).observe(requests_per_minute)


def track_user_session(
    user_id: str,
    tenant_id: str,
    duration_seconds: float
):
    """
    Track user session duration.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        duration_seconds: Session duration in seconds
    """
    user_session_duration.labels(
        user_id=user_id,
        tenant_id=tenant_id
    ).observe(duration_seconds)


def track_blocked_user(
    tenant_id: str,
    block_reason: str
):
    """
    Track blocked user.
    
    Args:
        tenant_id: Tenant identifier
        block_reason: Reason for blocking (abuse, rate_limit, fraud, terms_violation)
    """
    blocked_users_total.labels(
        tenant_id=tenant_id,
        block_reason=block_reason
    ).inc()


# ============================================================================
# MEMORY TRACKING FUNCTIONS
# ============================================================================

def track_agent_memory(
    agent_id: str,
    memory_type: str,
    size_bytes: Optional[int] = None,
    item_count: Optional[int] = None,
    operation: Optional[str] = None
):
    """
    Track agent memory metrics.
    
    Args:
        agent_id: Agent identifier
        memory_type: Memory type (context, history, state)
        size_bytes: Memory size in bytes
        item_count: Number of items in memory
        operation: Operation (read, write, update, delete, clear)
    """
    if size_bytes is not None:
        agent_memory_size_bytes.labels(
            agent_id=agent_id,
            memory_type=memory_type
        ).set(size_bytes)
    
    if item_count is not None:
        agent_memory_items.labels(
            agent_id=agent_id,
            memory_type=memory_type
        ).set(item_count)
    
    if operation:
        agent_memory_operations.labels(
            agent_id=agent_id,
            operation=operation
        ).inc()


def track_chat_memory(
    user_id: str,
    tenant_id: str,
    mode: Optional[str] = None,
    conversation_count: Optional[int] = None,
    message_count: Optional[int] = None,
    size_bytes: Optional[int] = None,
    operation: Optional[str] = None,
    turn_increment: bool = False
):
    """
    Track chat memory metrics.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        mode: Workflow mode
        conversation_count: Number of active conversations
        message_count: Number of messages in memory
        size_bytes: Memory size in bytes
        operation: Operation (load, save, append, clear)
        turn_increment: Whether to increment conversation turn counter
    """
    if conversation_count is not None:
        chat_memory_conversations.labels(
            user_id=user_id,
            tenant_id=tenant_id
        ).set(conversation_count)
    
    if message_count is not None:
        chat_memory_messages.labels(
            user_id=user_id,
            tenant_id=tenant_id
        ).set(message_count)
    
    if size_bytes is not None:
        chat_memory_size_bytes.labels(
            user_id=user_id,
            tenant_id=tenant_id
        ).set(size_bytes)
    
    if operation:
        chat_memory_operations.labels(
            user_id=user_id,
            tenant_id=tenant_id,
            operation=operation
        ).inc()
    
    if turn_increment and mode:
        chat_memory_turns.labels(
            user_id=user_id,
            tenant_id=tenant_id,
            mode=mode
        ).inc()


def track_user_memory(
    user_id: str,
    tenant_id: str,
    preference_count: Optional[int] = None,
    history_type: Optional[str] = None,
    history_size: Optional[int] = None,
    operation: Optional[str] = None,
    retrieval_time: Optional[float] = None,
    memory_type: Optional[str] = None
):
    """
    Track user memory metrics.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        preference_count: Number of preferences stored
        history_type: History type (queries, feedback, interactions)
        history_size: History size (number of items)
        operation: Operation (read, write, update, delete)
        retrieval_time: Retrieval latency in seconds
        memory_type: Memory type for retrieval latency
    """
    if preference_count is not None:
        user_memory_preferences.labels(
            user_id=user_id,
            tenant_id=tenant_id
        ).set(preference_count)
    
    if history_type and history_size is not None:
        user_memory_history_size.labels(
            user_id=user_id,
            tenant_id=tenant_id,
            history_type=history_type
        ).set(history_size)
    
    if operation:
        user_memory_operations.labels(
            user_id=user_id,
            tenant_id=tenant_id,
            operation=operation
        ).inc()
    
    if retrieval_time is not None and memory_type:
        user_memory_retrieval_latency.labels(
            user_id=user_id,
            tenant_id=tenant_id,
            memory_type=memory_type
        ).observe(retrieval_time)


def track_memory_cache(
    memory_type: str,
    hit: bool = False,
    miss: bool = False,
    eviction: bool = False
):
    """
    Track memory cache metrics.
    
    Args:
        memory_type: Memory type (agent, chat, user)
        hit: Cache hit
        miss: Cache miss
        eviction: Cache eviction
    """
    if hit:
        memory_cache_hits.labels(memory_type=memory_type).inc()
    
    if miss:
        memory_cache_misses.labels(memory_type=memory_type).inc()
    
    if eviction:
        memory_cache_evictions.labels(memory_type=memory_type).inc()


# ============================================================================
# PANEL ANALYTICS TRACKING FUNCTIONS
# ============================================================================

def track_panel_view(
    user_id: str,
    tenant_id: str,
    panel_name: str,
    panel_type: str
):
    """
    Track panel view.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        panel_name: Panel name
        panel_type: Panel type (research, chat, settings, profile)
    """
    panel_views_total.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        panel_name=panel_name,
        panel_type=panel_type
    ).inc()


def track_panel_interaction(
    user_id: str,
    tenant_id: str,
    panel_name: str,
    interaction_type: str
):
    """
    Track panel interaction.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        panel_name: Panel name
        interaction_type: Interaction type (click, scroll, filter, sort, export)
    """
    panel_interactions_total.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        panel_name=panel_name,
        interaction_type=interaction_type
    ).inc()


def track_panel_session(
    user_id: str,
    tenant_id: str,
    panel_name: str,
    duration_seconds: float
):
    """
    Track panel session duration.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        panel_name: Panel name
        duration_seconds: Session duration in seconds
    """
    panel_session_duration.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        panel_name=panel_name
    ).observe(duration_seconds)


def track_panel_load(
    panel_name: str,
    panel_type: str,
    load_time_seconds: float
):
    """
    Track panel load time.
    
    Args:
        panel_name: Panel name
        panel_type: Panel type
        load_time_seconds: Load time in seconds
    """
    panel_load_time.labels(
        panel_name=panel_name,
        panel_type=panel_type
    ).observe(load_time_seconds)


def track_panel_error(
    panel_name: str,
    error_type: str
):
    """
    Track panel error.
    
    Args:
        panel_name: Panel name
        error_type: Error type
    """
    panel_errors_total.labels(
        panel_name=panel_name,
        error_type=error_type
    ).inc()


def track_panel_data_refresh(
    user_id: str,
    tenant_id: str,
    panel_name: str
):
    """
    Track panel data refresh.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        panel_name: Panel name
    """
    panel_data_refresh_total.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        panel_name=panel_name
    ).inc()


def track_panel_filter(
    user_id: str,
    tenant_id: str,
    panel_name: str,
    filter_type: str
):
    """
    Track panel filter applied.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        panel_name: Panel name
        filter_type: Filter type
    """
    panel_filters_applied.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        panel_name=panel_name,
        filter_type=filter_type
    ).inc()


def track_panel_export(
    user_id: str,
    tenant_id: str,
    panel_name: str,
    export_format: str
):
    """
    Track panel export.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        panel_name: Panel name
        export_format: Export format (pdf, csv, json)
    """
    panel_exports_total.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        panel_name=panel_name,
        export_format=export_format
    ).inc()


def track_panel_search(
    user_id: str,
    tenant_id: str,
    panel_name: str
):
    """
    Track panel search query.
    
    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        panel_name: Panel name
    """
    panel_search_queries.labels(
        user_id=user_id,
        tenant_id=tenant_id,
        panel_name=panel_name
    ).inc()


def track_panel_collaboration(
    tenant_id: str,
    panel_name: str,
    event_type: str
):
    """
    Track panel collaboration event.
    
    Args:
        tenant_id: Tenant identifier
        panel_name: Panel name
        event_type: Event type (share, comment, annotate)
    """
    panel_collaboration_events.labels(
        tenant_id=tenant_id,
        panel_name=panel_name,
        event_type=event_type
    ).inc()


# ============================================================================
# WORKFLOW ANALYTICS TRACKING FUNCTIONS
# ============================================================================

def track_workflow_node(
    mode: str,
    node_name: str,
    duration_seconds: float,
    status: str = "success"
):
    """
    Track workflow node execution.
    
    Args:
        mode: Workflow mode
        node_name: Node name
        duration_seconds: Execution duration in seconds
        status: Execution status (success, failed, skipped)
    """
    workflow_node_duration.labels(
        mode=mode,
        node_name=node_name
    ).observe(duration_seconds)
    
    workflow_node_executions.labels(
        mode=mode,
        node_name=node_name,
        status=status
    ).inc()


def track_workflow_path(
    mode: str,
    path_name: str
):
    """
    Track workflow path taken.
    
    Args:
        mode: Workflow mode
        path_name: Path name (standard, tool_required, cached, degraded)
    """
    workflow_path_taken.labels(
        mode=mode,
        path_name=path_name
    ).inc()


def track_workflow_transition(
    mode: str,
    from_node: str,
    to_node: str
):
    """
    Track workflow state transition.
    
    Args:
        mode: Workflow mode
        from_node: Source node
        to_node: Destination node
    """
    workflow_transitions.labels(
        mode=mode,
        from_node=from_node,
        to_node=to_node
    ).inc()


def track_workflow_bottleneck(
    mode: str,
    node_name: str,
    duration_seconds: float
):
    """
    Track workflow bottleneck.
    
    Args:
        mode: Workflow mode
        node_name: Node name
        duration_seconds: Duration in seconds
    """
    workflow_bottleneck_duration.labels(
        mode=mode,
        node_name=node_name
    ).set(duration_seconds)


def track_workflow_retry(
    mode: str,
    node_name: str,
    retry_reason: str
):
    """
    Track workflow retry.
    
    Args:
        mode: Workflow mode
        node_name: Node name
        retry_reason: Reason for retry
    """
    workflow_retries_total.labels(
        mode=mode,
        node_name=node_name,
        retry_reason=retry_reason
    ).inc()


def update_workflow_completion_rate(
    mode: str,
    completion_rate: float
):
    """
    Update workflow completion rate.
    
    Args:
        mode: Workflow mode
        completion_rate: Completion rate (0-1)
    """
    workflow_completion_rate.labels(mode=mode).set(completion_rate)


def track_workflow_abandonment(
    mode: str,
    abandoned_at_node: str
):
    """
    Track workflow abandonment.
    
    Args:
        mode: Workflow mode
        abandoned_at_node: Node where workflow was abandoned
    """
    workflow_abandonments_total.labels(
        mode=mode,
        abandoned_at_node=abandoned_at_node
    ).inc()


# ============================================================================
# KNOWLEDGE ANALYTICS TRACKING FUNCTIONS
# ============================================================================

def track_rag_quality(
    mode: str,
    source_type: str,
    quality_score: float,
    source_diversity: int,
    document_count: int = 0,
    empty_retrieval: bool = False
):
    """
    Track RAG retrieval quality.
    
    Args:
        mode: Workflow mode
        source_type: Source type (pinecone, supabase, etc.)
        quality_score: Quality score (0-1)
        source_diversity: Number of unique sources
        document_count: Number of documents retrieved
        empty_retrieval: Whether retrieval returned no results
    """
    rag_retrieval_quality_score.labels(
        mode=mode,
        source_type=source_type
    ).observe(quality_score)
    
    rag_source_diversity.labels(mode=mode).observe(source_diversity)
    
    if empty_retrieval:
        rag_empty_retrievals.labels(
            mode=mode,
            query_type="standard"
        ).inc()


def track_citation_quality(
    mode: str,
    citation_count: int,
    accuracy_score: Optional[float] = None
):
    """
    Track citation quality.
    
    Args:
        mode: Workflow mode
        citation_count: Number of citations
        accuracy_score: Citation accuracy score (0-1)
    """
    citations_per_response.labels(mode=mode).observe(citation_count)
    
    if accuracy_score is not None:
        citation_accuracy_score.labels(mode=mode).observe(accuracy_score)


def track_knowledge_base(
    namespace: str,
    source_type: str
):
    """
    Track knowledge base hits.
    
    Args:
        namespace: Knowledge base namespace
        source_type: Source type
    """
    knowledge_base_hits.labels(
        namespace=namespace,
        source_type=source_type
    ).inc()


def track_rag_component(
    component: str,
    latency_seconds: float
):
    """
    Track RAG component latency.
    
    Args:
        component: Component name (embedding, vector_search, rerank, format)
        latency_seconds: Latency in seconds
    """
    rag_component_latency.labels(component=component).observe(latency_seconds)


def track_document_quality(
    mode: str,
    source_type: str,
    relevance_score: float,
    freshness_days: Optional[int] = None
):
    """
    Track document quality.
    
    Args:
        mode: Workflow mode
        source_type: Source type
        relevance_score: Document relevance score (0-1)
        freshness_days: Age of document in days
    """
    document_relevance_score.labels(
        mode=mode,
        source_type=source_type
    ).observe(relevance_score)
    
    if freshness_days is not None:
        knowledge_freshness_days.labels(source_type=source_type).observe(freshness_days)


# ============================================================================
# PERFORMANCE ANALYTICS TRACKING FUNCTIONS
# ============================================================================

def track_component_performance(
    component: str,
    latency_seconds: float
):
    """
    Track component-level performance.
    
    Args:
        component: Component name (agent_load, rag, tool_suggest, tool_exec, llm, memory, total)
        latency_seconds: Latency in seconds
    """
    component_latency.labels(component=component).observe(latency_seconds)


def track_response_quality(
    mode: str,
    accuracy_score: Optional[float] = None,
    confidence_score: Optional[float] = None,
    completeness_score: Optional[float] = None,
    evaluation_method: str = "automated"
):
    """
    Track response quality metrics.
    
    Args:
        mode: Workflow mode
        accuracy_score: Accuracy score (0-1)
        confidence_score: Confidence score (0-1)
        completeness_score: Completeness score (0-1)
        evaluation_method: Evaluation method (llm_judge, user_feedback, automated)
    """
    if accuracy_score is not None:
        response_accuracy_score.labels(
            mode=mode,
            evaluation_method=evaluation_method
        ).observe(accuracy_score)
    
    if confidence_score is not None:
        response_confidence_score.labels(mode=mode).observe(confidence_score)
        
        # Track low confidence
        if confidence_score < 0.7:
            if confidence_score < 0.3:
                confidence_range = "0-0.3"
            elif confidence_score < 0.5:
                confidence_range = "0.3-0.5"
            else:
                confidence_range = "0.5-0.7"
            
            low_confidence_responses.labels(
                mode=mode,
                confidence_range=confidence_range
            ).inc()
    
    if completeness_score is not None:
        response_completeness_score.labels(mode=mode).observe(completeness_score)


def track_hallucination(
    mode: str,
    detection_method: str
):
    """
    Track hallucination detection.
    
    Args:
        mode: Workflow mode
        detection_method: Detection method (citation_check, consistency_check, user_report)
    """
    hallucination_detected.labels(
        mode=mode,
        detection_method=detection_method
    ).inc()


def track_llm_performance(
    mode: str,
    model: str,
    ttft_seconds: Optional[float] = None,
    tokens_per_sec: Optional[float] = None
):
    """
    Track LLM performance metrics.
    
    Args:
        mode: Workflow mode
        model: Model name
        ttft_seconds: Time to first token in seconds
        tokens_per_sec: Token generation rate
    """
    if ttft_seconds is not None:
        time_to_first_token.labels(mode=mode, model=model).observe(ttft_seconds)
    
    if tokens_per_sec is not None:
        tokens_per_second.labels(mode=mode, model=model).observe(tokens_per_sec)


def update_throughput_metrics(
    mode: str,
    requests_per_second: float,
    concurrent_requests_count: int,
    queue_depth_count: int = 0
):
    """
    Update throughput metrics.
    
    Args:
        mode: Workflow mode
        requests_per_second: Current throughput
        concurrent_requests_count: Number of concurrent requests
        queue_depth_count: Queue depth
    """
    throughput_requests_per_second.labels(mode=mode).set(requests_per_second)
    concurrent_requests.labels(mode=mode).set(concurrent_requests_count)
    request_queue_depth.set(queue_depth_count)


def track_response_validation(
    mode: str,
    validation_type: str
):
    """
    Track response validation failure.
    
    Args:
        mode: Workflow mode
        validation_type: Validation type (format, safety, quality, hallucination)
    """
    response_validation_failures.labels(
        mode=mode,
        validation_type=validation_type
    ).inc()


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

