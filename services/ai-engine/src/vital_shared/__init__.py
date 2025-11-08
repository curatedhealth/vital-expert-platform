"""
VITAL Shared Library
====================

Shared services, models, and utilities for VITAL AI platform.

Used across:
- Ask Expert (all 4 modes)
- Ask Panel
- Pharma Intelligence
- Other VITAL services

Benefits:
- Build once, use everywhere
- Consistent behavior across services
- Easy testing and maintenance
- Single source of truth

Author: VITAL Path Team
Version: 1.0.0
"""

__version__ = "1.0.0"
__author__ = "VITAL Path Team"

# Export interfaces
from vital_shared.interfaces.agent_service import IAgentService
from vital_shared.interfaces.rag_service import IRAGService
from vital_shared.interfaces.tool_service import IToolService
from vital_shared.interfaces.memory_service import IMemoryService
from vital_shared.interfaces.streaming_service import IStreamingService
from vital_shared.interfaces.artifact_service import IArtifactService

# Export service implementations
from vital_shared.services.agent_service import AgentService
from vital_shared.services.unified_rag_service import UnifiedRAGService
from vital_shared.services.tool_service import ToolService
from vital_shared.services.memory_service import MemoryService
from vital_shared.services.streaming_service import StreamingService
from vital_shared.services.artifact_service import ArtifactService

# Export models
from vital_shared.models.agent import AgentProfile, AgentCapability
from vital_shared.models.citation import Citation, RAGResponse, RAGEmptyResponse, SourceType
from vital_shared.models.message import Message, ConversationTurn
from vital_shared.models.tool import (
    ToolMetadata,
    ToolExecutionResult,
    ToolExecutionStatus,
    ToolSuggestion,
    ToolDecision,
    ToolCategory,
    ToolCostTier,
    ToolExecutionSpeed
)
from vital_shared.models.artifact import Artifact, ArtifactVersion
from vital_shared.models.workflow_state import (
    BaseWorkflowState,
    Mode1State,
    Mode2State,
    Mode3State,
    Mode4State
)

# Export registry
from vital_shared.registry.service_registry import ServiceRegistry, initialize_services

# Export base workflow
from vital_shared.workflows.base_workflow import BaseWorkflow

# Export observability
from vital_shared.observability import (
    LangfuseTracer,
    get_langfuse_tracer,
)

# Export monitoring
from vital_shared.monitoring import (
    track_workflow_execution,
    track_cache_operation,
    track_quality_score,
    track_llm_call,
    track_tool_execution,
    track_rag_retrieval,
    track_agent_usage,
    update_cache_metrics,
    update_connection_pool_metrics,
    get_metrics_handler,
    get_metrics_content_type,
    set_build_info,
    # User metrics
    track_user_query,
    track_user_tokens,
    track_user_cost,
    track_user_agent,
    track_user_workflow,
    track_user_tool,
    track_user_feedback,
    # Abuse detection
    track_rate_limit_violation,
    track_suspicious_activity,
    track_user_request_rate,
    track_user_session,
    track_blocked_user,
    # Memory
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
    # TimescaleDB integration
    TimescaleIntegration,
    get_timescale_integration,
    PlatformEvent,
    CostEvent,
    AgentExecution,
    EventCategory,
    CostType,
    ServiceProvider,
    # Cost Attribution
    CostAttribution,
    get_cost_attribution,
    ModelPricing,
    CostBreakdown,
    TenantCostSummary,
    CostOptimizationRecommendation,
)

__all__ = [
    # Version info
    "__version__",
    "__author__",
    
    # Interfaces
    "IAgentService",
    "IRAGService",
    "IToolService",
    "IMemoryService",
    "IStreamingService",
    "IArtifactService",
    
    # Services
    "AgentService",
    "UnifiedRAGService",
    "ToolService",
    "MemoryService",
    "StreamingService",
    "ArtifactService",
    
    # Models - Agent
    "AgentProfile",
    "AgentCapability",
    
    # Models - Citation
    "Citation",
    "RAGResponse",
    "RAGEmptyResponse",
    "SourceType",
    
    # Models - Message
    "Message",
    "ConversationTurn",
    
    # Models - Tool
    "ToolMetadata",
    "ToolExecutionResult",
    "ToolExecutionStatus",
    "ToolSuggestion",
    "ToolDecision",
    "ToolCategory",
    "ToolCostTier",
    "ToolExecutionSpeed",
    
    # Models - Artifact
    "Artifact",
    "ArtifactVersion",
    
    # Models - Workflow State
    "BaseWorkflowState",
    "Mode1State",
    "Mode2State",
    "Mode3State",
    "Mode4State",
    
    # Registry
    "ServiceRegistry",
    "initialize_services",
    
    # Workflows
    "BaseWorkflow",
    
    # Observability
    "LangfuseTracer",
    "get_langfuse_tracer",
    
    # Monitoring
    "track_workflow_execution",
    "track_cache_operation",
    "track_quality_score",
    "track_llm_call",
    "track_tool_execution",
    "track_rag_retrieval",
    "track_agent_usage",
    "update_cache_metrics",
    "update_connection_pool_metrics",
    "get_metrics_handler",
    "get_metrics_content_type",
    "set_build_info",
    # User metrics
    "track_user_query",
    "track_user_tokens",
    "track_user_cost",
    "track_user_agent",
    "track_user_workflow",
    "track_user_tool",
    "track_user_feedback",
    # Abuse detection
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
    # TimescaleDB integration
    "TimescaleIntegration",
    "get_timescale_integration",
    "PlatformEvent",
    "CostEvent",
    "AgentExecution",
    "EventCategory",
    "CostType",
    "ServiceProvider",
    
    # Cost Attribution
    "CostAttribution",
    "get_cost_attribution",
    "ModelPricing",
    "CostBreakdown",
    "TenantCostSummary",
    "CostOptimizationRecommendation",
]

