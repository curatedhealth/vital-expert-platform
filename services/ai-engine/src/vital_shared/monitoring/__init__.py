"""
VITAL Shared Monitoring

Performance monitoring and observability for VITAL AI Platform.

Exports:
    - Prometheus metrics
    - Tracking functions
    - Metrics endpoint handler
"""

from vital_shared.monitoring.metrics import (
    # Tracking functions
    track_workflow_execution,
    track_cache_operation,
    track_quality_score,
    track_llm_call,
    track_tool_execution,
    track_rag_retrieval,
    track_agent_usage,
    
    # Update functions
    update_cache_metrics,
    update_connection_pool_metrics,
    
    # Metrics endpoint
    get_metrics_handler,
    get_metrics_content_type,
    
    # Build info
    set_build_info,
    
    # Testing
    reset_metrics
)

__all__ = [
    # Tracking
    "track_workflow_execution",
    "track_cache_operation",
    "track_quality_score",
    "track_llm_call",
    "track_tool_execution",
    "track_rag_retrieval",
    "track_agent_usage",
    
    # Updates
    "update_cache_metrics",
    "update_connection_pool_metrics",
    
    # Endpoint
    "get_metrics_handler",
    "get_metrics_content_type",
    
    # Build
    "set_build_info",
    
    # Testing
    "reset_metrics"
]

