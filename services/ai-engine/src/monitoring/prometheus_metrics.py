"""
Prometheus Metrics for AgentOS 3.0
Real-time metrics export for monitoring and alerting
"""

from prometheus_client import Counter, Histogram, Gauge, Info
from typing import Optional
import structlog

logger = structlog.get_logger(__name__)


# ============================================================================
# REQUEST METRICS
# ============================================================================

# Total requests by service and agent
agentos_requests_total = Counter(
    'agentos_requests_total',
    'Total number of AgentOS requests',
    ['service_type', 'agent_id', 'agent_level', 'tenant_id']
)

# Successful requests
agentos_requests_successful = Counter(
    'agentos_requests_successful',
    'Number of successful requests',
    ['service_type', 'agent_id', 'agent_level']
)

# Failed requests
agentos_requests_failed = Counter(
    'agentos_requests_failed',
    'Number of failed requests',
    ['service_type', 'agent_id', 'agent_level', 'error_type']
)

# Escalated requests
agentos_requests_escalated = Counter(
    'agentos_requests_escalated',
    'Number of escalated requests',
    ['service_type', 'agent_id', 'escalation_reason']
)

# Human oversight applied
agentos_human_oversight_total = Counter(
    'agentos_human_oversight_total',
    'Number of requests with human oversight',
    ['service_type', 'agent_id', 'agent_level']
)


# ============================================================================
# LATENCY METRICS
# ============================================================================

# Request latency histogram
agentos_request_latency_seconds = Histogram(
    'agentos_request_latency_seconds',
    'Request latency in seconds',
    ['service_type', 'agent_id', 'agent_level'],
    buckets=(0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, 120.0, float('inf'))
)

# Agent execution time
agentos_agent_execution_seconds = Histogram(
    'agentos_agent_execution_seconds',
    'Agent execution time in seconds',
    ['agent_id', 'agent_level'],
    buckets=(0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, float('inf'))
)

# RAG query time
agentos_rag_query_seconds = Histogram(
    'agentos_rag_query_seconds',
    'GraphRAG query time in seconds',
    ['agent_id', 'rag_profile'],
    buckets=(0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, float('inf'))
)


# ============================================================================
# CONFIDENCE & QUALITY METRICS
# ============================================================================

# Confidence score histogram
agentos_confidence_score = Histogram(
    'agentos_confidence_score',
    'Agent confidence score (0-1)',
    ['agent_id', 'agent_level'],
    buckets=(0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0)
)

# Success rate (gauge updated periodically)
agentos_success_rate = Gauge(
    'agentos_success_rate',
    'Agent success rate (0-1)',
    ['agent_id', 'period']  # period: daily, weekly, monthly
)

# Accuracy gauge (from diagnostic metrics)
agentos_accuracy = Gauge(
    'agentos_accuracy',
    'Agent accuracy from diagnostic metrics (0-1)',
    ['agent_id', 'period']
)

# Sensitivity gauge
agentos_sensitivity = Gauge(
    'agentos_sensitivity',
    'Agent sensitivity/recall (0-1)',
    ['agent_id', 'period']
)

# Specificity gauge
agentos_specificity = Gauge(
    'agentos_specificity',
    'Agent specificity (0-1)',
    ['agent_id', 'period']
)

# F1 score gauge
agentos_f1_score = Gauge(
    'agentos_f1_score',
    'Agent F1 score (0-1)',
    ['agent_id', 'period']
)


# ============================================================================
# COST METRICS
# ============================================================================

# Total cost counter
agentos_cost_usd_total = Counter(
    'agentos_cost_usd_total',
    'Total cost in USD',
    ['agent_id', 'agent_level']
)

# Cost per query histogram
agentos_cost_per_query_usd = Histogram(
    'agentos_cost_per_query_usd',
    'Cost per query in USD',
    ['agent_id', 'agent_level'],
    buckets=(0.001, 0.01, 0.05, 0.10, 0.25, 0.50, 1.0, 2.0, 5.0, float('inf'))
)

# Token usage
agentos_tokens_used_total = Counter(
    'agentos_tokens_used_total',
    'Total tokens used',
    ['agent_id', 'agent_level']
)


# ============================================================================
# AGENT STATE METRICS
# ============================================================================

# Active agents gauge
agentos_active_agents = Gauge(
    'agentos_active_agents',
    'Number of active agents',
    ['tenant_id']
)

# Queue depth (for async processing)
agentos_queue_depth = Gauge(
    'agentos_queue_depth',
    'Current queue depth',
    ['queue_name']
)

# Concurrent requests
agentos_concurrent_requests = Gauge(
    'agentos_concurrent_requests',
    'Current number of concurrent requests',
    ['service_type']
)


# ============================================================================
# DRIFT & ALERTS
# ============================================================================

# Active drift alerts
agentos_drift_alerts_active = Gauge(
    'agentos_drift_alerts_active',
    'Number of active drift alerts',
    ['agent_id', 'alert_type', 'severity']
)

# Drift alerts created
agentos_drift_alerts_created_total = Counter(
    'agentos_drift_alerts_created_total',
    'Total drift alerts created',
    ['agent_id', 'alert_type', 'severity']
)

# Drift alerts resolved
agentos_drift_alerts_resolved_total = Counter(
    'agentos_drift_alerts_resolved_total',
    'Total drift alerts resolved',
    ['agent_id', 'alert_type']
)


# ============================================================================
# FAIRNESS METRICS
# ============================================================================

# Demographic parity gauge
agentos_demographic_parity = Gauge(
    'agentos_demographic_parity',
    'Demographic parity score (-1 to 1, target: 0)',
    ['agent_id', 'protected_attribute', 'attribute_value']
)

# Fairness violations
agentos_fairness_violations_total = Counter(
    'agentos_fairness_violations_total',
    'Total fairness violations detected',
    ['agent_id', 'protected_attribute', 'severity']
)

# Compliance status
agentos_fairness_compliant = Gauge(
    'agentos_fairness_compliant',
    'Fairness compliance status (1=compliant, 0=non-compliant)',
    ['agent_id']
)


# ============================================================================
# RAG METRICS
# ============================================================================

# Context chunks used
agentos_rag_context_chunks = Histogram(
    'agentos_rag_context_chunks',
    'Number of RAG context chunks used',
    ['agent_id', 'rag_profile'],
    buckets=(0, 1, 2, 5, 10, 20, 50, 100, float('inf'))
)

# Graph paths used
agentos_rag_graph_paths = Histogram(
    'agentos_rag_graph_paths',
    'Number of graph paths used',
    ['agent_id'],
    buckets=(0, 1, 2, 5, 10, 20, float('inf'))
)

# Citations provided
agentos_citations_provided = Histogram(
    'agentos_citations_provided',
    'Number of citations provided',
    ['agent_id'],
    buckets=(0, 1, 2, 5, 10, 20, float('inf'))
)


# ============================================================================
# SYSTEM INFO
# ============================================================================

# AgentOS version info
agentos_info = Info(
    'agentos',
    'AgentOS system information'
)

# Set version info
agentos_info.info({
    'version': '3.0',
    'component': 'ai-engine',
    'monitoring_enabled': 'true',
})


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

class MetricsRecorder:
    """
    Helper class to record metrics from monitoring events
    """
    
    @staticmethod
    def record_request(
        service_type: str,
        agent_id: str,
        agent_level: Optional[str],
        tenant_id: str,
        success: bool,
        latency_seconds: float,
        confidence_score: Optional[float] = None,
        cost_usd: Optional[float] = None,
        tokens_used: Optional[int] = None,
        was_escalated: bool = False,
        escalation_reason: Optional[str] = None,
        had_human_oversight: bool = False,
    ):
        """Record a complete request with all metrics"""
        
        # Count requests
        agentos_requests_total.labels(
            service_type=service_type,
            agent_id=agent_id[:8],  # Truncate for cardinality
            agent_level=agent_level or 'unknown',
            tenant_id=tenant_id[:8]
        ).inc()
        
        # Count success/failure
        if success:
            agentos_requests_successful.labels(
                service_type=service_type,
                agent_id=agent_id[:8],
                agent_level=agent_level or 'unknown'
            ).inc()
        else:
            agentos_requests_failed.labels(
                service_type=service_type,
                agent_id=agent_id[:8],
                agent_level=agent_level or 'unknown',
                error_type='unknown'
            ).inc()
        
        # Record latency
        agentos_request_latency_seconds.labels(
            service_type=service_type,
            agent_id=agent_id[:8],
            agent_level=agent_level or 'unknown'
        ).observe(latency_seconds)
        
        agentos_agent_execution_seconds.labels(
            agent_id=agent_id[:8],
            agent_level=agent_level or 'unknown'
        ).observe(latency_seconds)
        
        # Record confidence
        if confidence_score is not None:
            agentos_confidence_score.labels(
                agent_id=agent_id[:8],
                agent_level=agent_level or 'unknown'
            ).observe(confidence_score)
        
        # Record cost
        if cost_usd is not None:
            agentos_cost_usd_total.labels(
                agent_id=agent_id[:8],
                agent_level=agent_level or 'unknown'
            ).inc(cost_usd)
            
            agentos_cost_per_query_usd.labels(
                agent_id=agent_id[:8],
                agent_level=agent_level or 'unknown'
            ).observe(cost_usd)
        
        # Record tokens
        if tokens_used is not None:
            agentos_tokens_used_total.labels(
                agent_id=agent_id[:8],
                agent_level=agent_level or 'unknown'
            ).inc(tokens_used)
        
        # Record escalation
        if was_escalated:
            agentos_requests_escalated.labels(
                service_type=service_type,
                agent_id=agent_id[:8],
                escalation_reason=escalation_reason or 'unknown'
            ).inc()
        
        # Record human oversight
        if had_human_oversight:
            agentos_human_oversight_total.labels(
                service_type=service_type,
                agent_id=agent_id[:8],
                tier=tier or 'unknown'
            ).inc()
        
        logger.debug(
            "metrics_recorded",
            agent_id=agent_id[:8],
            service=service_type,
            success=success,
            latency=latency_seconds,
        )
    
    @staticmethod
    def record_diagnostic_metrics(
        agent_id: str,
        period: str,
        accuracy: Optional[float],
        sensitivity: Optional[float],
        specificity: Optional[float],
        f1_score: Optional[float],
    ):
        """Record diagnostic metrics as gauges"""
        
        agent_id_short = agent_id[:8]
        
        if accuracy is not None:
            agentos_accuracy.labels(
                agent_id=agent_id_short,
                period=period
            ).set(accuracy)
        
        if sensitivity is not None:
            agentos_sensitivity.labels(
                agent_id=agent_id_short,
                period=period
            ).set(sensitivity)
        
        if specificity is not None:
            agentos_specificity.labels(
                agent_id=agent_id_short,
                period=period
            ).set(specificity)
        
        if f1_score is not None:
            agentos_f1_score.labels(
                agent_id=agent_id_short,
                period=period
            ).set(f1_score)
    
    @staticmethod
    def record_drift_alert(
        agent_id: str,
        alert_type: str,
        severity: str,
        is_new: bool = True,
    ):
        """Record drift alert"""
        
        agent_id_short = agent_id[:8]
        
        if is_new:
            agentos_drift_alerts_created_total.labels(
                agent_id=agent_id_short,
                alert_type=alert_type,
                severity=severity
            ).inc()
            
            agentos_drift_alerts_active.labels(
                agent_id=agent_id_short,
                alert_type=alert_type,
                severity=severity
            ).inc()
        else:
            # Alert resolved
            agentos_drift_alerts_resolved_total.labels(
                agent_id=agent_id_short,
                alert_type=alert_type
            ).inc()
            
            agentos_drift_alerts_active.labels(
                agent_id=agent_id_short,
                alert_type=alert_type,
                severity=severity
            ).dec()
    
    @staticmethod
    def record_fairness_metrics(
        agent_id: str,
        protected_attribute: str,
        attribute_value: str,
        demographic_parity: float,
        is_compliant: bool,
        is_violation: bool = False,
        severity: Optional[str] = None,
    ):
        """Record fairness metrics"""
        
        agent_id_short = agent_id[:8]
        
        agentos_demographic_parity.labels(
            agent_id=agent_id_short,
            protected_attribute=protected_attribute,
            attribute_value=attribute_value
        ).set(demographic_parity)
        
        agentos_fairness_compliant.labels(
            agent_id=agent_id_short
        ).set(1.0 if is_compliant else 0.0)
        
        if is_violation and severity:
            agentos_fairness_violations_total.labels(
                agent_id=agent_id_short,
                protected_attribute=protected_attribute,
                severity=severity
            ).inc()
    
    @staticmethod
    def record_rag_usage(
        agent_id: str,
        rag_profile: Optional[str],
        context_chunks: int,
        graph_paths: int,
        citations: int,
        query_time_seconds: float,
    ):
        """Record RAG usage metrics"""
        
        agent_id_short = agent_id[:8]
        
        agentos_rag_context_chunks.labels(
            agent_id=agent_id_short,
            rag_profile=rag_profile or 'default'
        ).observe(context_chunks)
        
        agentos_rag_graph_paths.labels(
            agent_id=agent_id_short
        ).observe(graph_paths)
        
        agentos_citations_provided.labels(
            agent_id=agent_id_short
        ).observe(citations)
        
        agentos_rag_query_seconds.labels(
            agent_id=agent_id_short,
            rag_profile=rag_profile or 'default'
        ).observe(query_time_seconds)


# ============================================================================
# WORKFLOW METRICS (World-Class Architecture)
# ============================================================================

# Workflow execution
workflow_executions_total = Counter(
    'vital_workflow_executions_total',
    'Total workflow executions',
    ['workflow_id', 'organization_id', 'status']  # status: started, completed, failed, cancelled
)

workflow_execution_duration_seconds = Histogram(
    'vital_workflow_execution_duration_seconds',
    'Workflow execution duration',
    ['workflow_id', 'organization_id'],
    buckets=(1.0, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0, 600.0, float('inf'))
)

# Node execution
node_executions_total = Counter(
    'vital_node_executions_total',
    'Total node executions',
    ['node_type', 'organization_id', 'status']  # status: success, failure, skipped
)

node_execution_duration_seconds = Histogram(
    'vital_node_execution_duration_seconds',
    'Node execution duration',
    ['node_type'],
    buckets=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, float('inf'))
)

# Expert modes
expert_mode_requests_total = Counter(
    'vital_expert_mode_requests_total',
    'Total expert mode requests',
    ['mode', 'organization_id', 'is_async']
)

expert_mode_latency_seconds = Histogram(
    'vital_expert_mode_latency_seconds',
    'Expert mode latency',
    ['mode'],
    buckets=(0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0, float('inf'))
)

# Async jobs
async_jobs_total = Counter(
    'vital_async_jobs_total',
    'Total async jobs',
    ['job_type', 'organization_id', 'status']  # status: submitted, running, completed, failed
)

async_job_queue_depth = Gauge(
    'vital_async_job_queue_depth',
    'Current async job queue depth',
    ['queue_name']
)

async_job_wait_time_seconds = Histogram(
    'vital_async_job_wait_time_seconds',
    'Time job spent waiting in queue',
    ['job_type'],
    buckets=(1.0, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0, float('inf'))
)

# Token budget
token_budget_checks_total = Counter(
    'vital_token_budget_checks_total',
    'Total token budget checks',
    ['organization_id', 'result']  # result: allowed, denied, warning
)

token_usage_by_organization = Counter(
    'vital_token_usage_total',
    'Total tokens used by organization',
    ['organization_id', 'model', 'operation']
)

token_budget_remaining = Gauge(
    'vital_token_budget_remaining',
    'Remaining token budget',
    ['organization_id']
)

# Streaming
streaming_connections_active = Gauge(
    'vital_streaming_connections_active',
    'Active streaming connections',
    ['stream_type']  # chat, job_status, workflow_execution
)

streaming_events_total = Counter(
    'vital_streaming_events_total',
    'Total streaming events sent',
    ['stream_type', 'event_type']
)

# Panel discussions
panel_discussions_total = Counter(
    'vital_panel_discussions_total',
    'Total panel discussions',
    ['panel_type', 'organization_id', 'status']
)

panel_consensus_score = Histogram(
    'vital_panel_consensus_score',
    'Panel consensus score distribution',
    ['panel_type'],
    buckets=(0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0)
)


class WorkflowMetricsRecorder:
    """
    Helper class to record workflow-related metrics.
    Complements MetricsRecorder for World-Class Architecture.
    """
    
    @staticmethod
    def record_workflow_start(workflow_id: str, organization_id: str):
        """Record workflow execution start."""
        workflow_executions_total.labels(
            workflow_id=workflow_id[:8],
            organization_id=organization_id[:8],
            status='started'
        ).inc()
    
    @staticmethod
    def record_workflow_complete(
        workflow_id: str,
        organization_id: str,
        duration_seconds: float,
        success: bool,
    ):
        """Record workflow execution completion."""
        status = 'completed' if success else 'failed'
        workflow_executions_total.labels(
            workflow_id=workflow_id[:8],
            organization_id=organization_id[:8],
            status=status
        ).inc()
        
        workflow_execution_duration_seconds.labels(
            workflow_id=workflow_id[:8],
            organization_id=organization_id[:8]
        ).observe(duration_seconds)
    
    @staticmethod
    def record_node_execution(
        node_type: str,
        organization_id: str,
        duration_seconds: float,
        success: bool,
    ):
        """Record individual node execution."""
        status = 'success' if success else 'failure'
        node_executions_total.labels(
            node_type=node_type,
            organization_id=organization_id[:8],
            status=status
        ).inc()
        
        node_execution_duration_seconds.labels(
            node_type=node_type
        ).observe(duration_seconds)
    
    @staticmethod
    def record_expert_mode_request(
        mode: int,
        organization_id: str,
        is_async: bool,
        duration_seconds: float = None,
    ):
        """Record expert mode request."""
        expert_mode_requests_total.labels(
            mode=str(mode),
            organization_id=organization_id[:8],
            is_async=str(is_async).lower()
        ).inc()
        
        if duration_seconds is not None:
            expert_mode_latency_seconds.labels(
                mode=str(mode)
            ).observe(duration_seconds)
    
    @staticmethod
    def record_async_job(
        job_type: str,
        organization_id: str,
        status: str,
        wait_time_seconds: float = None,
    ):
        """Record async job status change."""
        async_jobs_total.labels(
            job_type=job_type,
            organization_id=organization_id[:8],
            status=status
        ).inc()
        
        if wait_time_seconds is not None and status == 'running':
            async_job_wait_time_seconds.labels(
                job_type=job_type
            ).observe(wait_time_seconds)
    
    @staticmethod
    def record_token_usage(
        organization_id: str,
        model: str,
        operation: str,
        tokens: int,
        budget_remaining: int = None,
    ):
        """Record token usage."""
        token_usage_by_organization.labels(
            organization_id=organization_id[:8],
            model=model,
            operation=operation
        ).inc(tokens)
        
        if budget_remaining is not None:
            token_budget_remaining.labels(
                organization_id=organization_id[:8]
            ).set(budget_remaining)
    
    @staticmethod
    def record_budget_check(
        organization_id: str,
        result: str,  # 'allowed', 'denied', 'warning'
    ):
        """Record budget check result."""
        token_budget_checks_total.labels(
            organization_id=organization_id[:8],
            result=result
        ).inc()
    
    @staticmethod
    def record_streaming_connection(stream_type: str, delta: int = 1):
        """Record streaming connection change (delta: +1 or -1)."""
        streaming_connections_active.labels(
            stream_type=stream_type
        ).inc(delta)
    
    @staticmethod
    def record_streaming_event(stream_type: str, event_type: str):
        """Record streaming event sent."""
        streaming_events_total.labels(
            stream_type=stream_type,
            event_type=event_type
        ).inc()
    
    @staticmethod
    def record_panel_discussion(
        panel_type: str,
        organization_id: str,
        status: str,
        consensus_score: float = None,
    ):
        """Record panel discussion."""
        panel_discussions_total.labels(
            panel_type=panel_type,
            organization_id=organization_id[:8],
            status=status
        ).inc()
        
        if consensus_score is not None:
            panel_consensus_score.labels(
                panel_type=panel_type
            ).observe(consensus_score)


# Export metrics recorder for easy import
__all__ = [
    'MetricsRecorder',
    'WorkflowMetricsRecorder',
    'agentos_requests_total',
    'agentos_request_latency_seconds',
    'agentos_confidence_score',
    'agentos_accuracy',
    'agentos_drift_alerts_active',
    'agentos_demographic_parity',
    # Workflow metrics
    'workflow_executions_total',
    'workflow_execution_duration_seconds',
    'node_executions_total',
    'expert_mode_requests_total',
    'async_jobs_total',
    'token_budget_checks_total',
    'streaming_connections_active',
]

