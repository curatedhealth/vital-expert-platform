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
    ['service_type', 'agent_id', 'tier', 'tenant_id']
)

# Successful requests
agentos_requests_successful = Counter(
    'agentos_requests_successful',
    'Number of successful requests',
    ['service_type', 'agent_id', 'tier']
)

# Failed requests
agentos_requests_failed = Counter(
    'agentos_requests_failed',
    'Number of failed requests',
    ['service_type', 'agent_id', 'tier', 'error_type']
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
    ['service_type', 'agent_id', 'tier']
)


# ============================================================================
# LATENCY METRICS
# ============================================================================

# Request latency histogram
agentos_request_latency_seconds = Histogram(
    'agentos_request_latency_seconds',
    'Request latency in seconds',
    ['service_type', 'agent_id', 'tier'],
    buckets=(0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, 120.0, float('inf'))
)

# Agent execution time
agentos_agent_execution_seconds = Histogram(
    'agentos_agent_execution_seconds',
    'Agent execution time in seconds',
    ['agent_id', 'tier'],
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
    ['agent_id', 'tier'],
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
    ['agent_id', 'tier']
)

# Cost per query histogram
agentos_cost_per_query_usd = Histogram(
    'agentos_cost_per_query_usd',
    'Cost per query in USD',
    ['agent_id', 'tier'],
    buckets=(0.001, 0.01, 0.05, 0.10, 0.25, 0.50, 1.0, 2.0, 5.0, float('inf'))
)

# Token usage
agentos_tokens_used_total = Counter(
    'agentos_tokens_used_total',
    'Total tokens used',
    ['agent_id', 'tier']
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
        tier: Optional[str],
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
            tier=tier or 'unknown',
            tenant_id=tenant_id[:8]
        ).inc()
        
        # Count success/failure
        if success:
            agentos_requests_successful.labels(
                service_type=service_type,
                agent_id=agent_id[:8],
                tier=tier or 'unknown'
            ).inc()
        else:
            agentos_requests_failed.labels(
                service_type=service_type,
                agent_id=agent_id[:8],
                tier=tier or 'unknown',
                error_type='unknown'
            ).inc()
        
        # Record latency
        agentos_request_latency_seconds.labels(
            service_type=service_type,
            agent_id=agent_id[:8],
            tier=tier or 'unknown'
        ).observe(latency_seconds)
        
        agentos_agent_execution_seconds.labels(
            agent_id=agent_id[:8],
            tier=tier or 'unknown'
        ).observe(latency_seconds)
        
        # Record confidence
        if confidence_score is not None:
            agentos_confidence_score.labels(
                agent_id=agent_id[:8],
                tier=tier or 'unknown'
            ).observe(confidence_score)
        
        # Record cost
        if cost_usd is not None:
            agentos_cost_usd_total.labels(
                agent_id=agent_id[:8],
                tier=tier or 'unknown'
            ).inc(cost_usd)
            
            agentos_cost_per_query_usd.labels(
                agent_id=agent_id[:8],
                tier=tier or 'unknown'
            ).observe(cost_usd)
        
        # Record tokens
        if tokens_used is not None:
            agentos_tokens_used_total.labels(
                agent_id=agent_id[:8],
                tier=tier or 'unknown'
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


# Export metrics recorder for easy import
__all__ = [
    'MetricsRecorder',
    'agentos_requests_total',
    'agentos_request_latency_seconds',
    'agentos_confidence_score',
    'agentos_accuracy',
    'agentos_drift_alerts_active',
    'agentos_demographic_parity',
]

