"""
VITAL Shared Monitoring

Performance monitoring and observability for VITAL AI Platform.

Exports:
    - Prometheus metrics
    - Tracking functions (workflows, cache, quality, cost, users, memory, panels, workflows)
    - Metrics endpoint handler
"""

from vital_shared.monitoring.metrics import (
    # Workflow tracking
    track_workflow_execution,
    
    # Cache tracking
    track_cache_operation,
    update_cache_metrics,
    
    # Quality tracking
    track_quality_score,
    
    # Cost tracking
    track_llm_call,
    track_tool_execution,
    track_rag_retrieval,
    
    # Agent tracking
    track_agent_usage,
    
    # User tracking
    track_user_query,
    track_user_tokens,
    track_user_cost,
    track_user_agent,
    track_user_workflow,
    track_user_tool,
    track_user_feedback,
    
    # User abuse detection
    track_rate_limit_violation,
    track_suspicious_activity,
    track_user_request_rate,
    track_user_session,
    track_blocked_user,
    
    # Memory tracking
    track_agent_memory,
    track_chat_memory,
    track_user_memory,
    track_memory_cache,
    
    # Panel analytics
    track_panel_view,
    track_panel_interaction,
    track_panel_session,
    track_panel_load,
    track_panel_error,
    track_panel_data_refresh,
    track_panel_filter,
    track_panel_export,
    track_panel_search,
    track_panel_collaboration,
    
    # Workflow analytics
    track_workflow_node,
    track_workflow_path,
    track_workflow_transition,
    track_workflow_bottleneck,
    track_workflow_retry,
    update_workflow_completion_rate,
    track_workflow_abandonment,
    
    # Knowledge analytics
    track_rag_quality,
    track_citation_quality,
    track_knowledge_base,
    track_rag_component,
    track_document_quality,
    
    # Performance analytics
    track_component_performance,
    track_response_quality,
    track_hallucination,
    track_llm_performance,
    update_throughput_metrics,
    track_response_validation,
    
    # Connection pool
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
    # Workflow
    "track_workflow_execution",
    
    # Cache
    "track_cache_operation",
    "update_cache_metrics",
    
    # Quality
    "track_quality_score",
    
    # Cost
    "track_llm_call",
    "track_tool_execution",
    "track_rag_retrieval",
    
    # Agent
    "track_agent_usage",
    
    # User tracking
    "track_user_query",
    "track_user_tokens",
    "track_user_cost",
    "track_user_agent",
    "track_user_workflow",
    "track_user_tool",
    "track_user_feedback",
    
    # User abuse
    "track_rate_limit_violation",
    "track_suspicious_activity",
    "track_user_request_rate",
    "track_user_session",
    "track_blocked_user",
    
    # Memory
    "track_agent_memory",
    "track_chat_memory",
    "track_user_memory",
    "track_memory_cache",
    
    # Panel analytics
    "track_panel_view",
    "track_panel_interaction",
    "track_panel_session",
    "track_panel_load",
    "track_panel_error",
    "track_panel_data_refresh",
    "track_panel_filter",
    "track_panel_export",
    "track_panel_search",
    "track_panel_collaboration",
    
    # Workflow analytics
    "track_workflow_node",
    "track_workflow_path",
    "track_workflow_transition",
    "track_workflow_bottleneck",
    "track_workflow_retry",
    "update_workflow_completion_rate",
    "track_workflow_abandonment",
    
    # Knowledge analytics
    "track_rag_quality",
    "track_citation_quality",
    "track_knowledge_base",
    "track_rag_component",
    "track_document_quality",
    
    # Performance analytics
    "track_component_performance",
    "track_response_quality",
    "track_hallucination",
    "track_llm_performance",
    "update_throughput_metrics",
    "track_response_validation",
    
    # Connection pool
    "update_connection_pool_metrics",
    
    # Endpoint
    "get_metrics_handler",
    "get_metrics_content_type",
    
    # Build
    "set_build_info",
    
    # Testing
    "reset_metrics"
]

