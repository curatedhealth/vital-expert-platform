"""
VITAL Path - Core Layer

Cross-cutting concerns and foundational utilities:
- Context management (organization, user, request)
- Structured logging with correlation IDs
- Configuration management
- Common types and protocols

IMPORTANT: Uses organization_id to match production RLS policies.
The database uses get_current_organization_context() for isolation.
"""

from .context import (
    RequestContext,
    get_request_context,
    set_request_context,
    clear_request_context,
    # Primary: organization-based (matches RLS)
    set_organization_context,
    get_organization_id,
    require_organization_context,
    # Legacy aliases (deprecated)
    set_tenant_context,
    get_tenant_id,
    require_tenant_context,
    # User context
    get_user_id,
    require_user_context,
    # Testing utilities
    OverrideContext,
)

from .logging import (
    configure_logging,
    get_logger,
    log_execution_time,
    LogContext,
    get_correlation_id,
    set_correlation_id,
    get_request_id,
    set_request_id,
)

from .config import (
    Environment,
    AppConfig,
    get_config,
    get_env,
    is_production,
    is_development,
)

from .resilience import (
    # Background task safety (Phase 1.3)
    safe_background_task,
    create_safe_task,
    # Circuit breaker (Phase 1.4)
    CircuitBreaker,
    CircuitBreakerConfig,
    CircuitState,
    CircuitOpenError,
    # Retry decorator (Phase 1.5)
    retry_with_backoff,
    RetryConfig,
    timeout,
    # Combined pattern
    resilient_call,
)

from .caching import (
    # 3-Level Semantic Cache (Phase 2.1)
    SemanticCache,
    CacheConfig,
    CacheEntry,
    CacheMetrics,
    L1ExactCache,
    L2SemanticCache,
    L3TemplateCache,
    get_cache,
    reset_cache,
)

from .tracing import (
    # Langfuse Tracing (Phase 2.2)
    LangfuseTracer,
    LangfuseConfig,
    TraceContext,
    SpanContext,
    get_tracer,
    reset_tracer,
    get_langfuse_callback,
    get_langgraph_callbacks,
    traced,
    traced_span,
)

from .reducers import (
    # State Reducers (Phase 2.3)
    append_list,
    prepend_list,
    unique_append_list,
    merge_dicts,
    deep_merge_dicts,
    take_latest,
    take_first,
    coalesce,
    sum_values,
    max_value,
    min_value,
    average_values,
    merge_messages,
    merge_sources,
    merge_artifacts,
    aggregate_scores,
    merge_errors,
    sum_token_usage,
    sum_costs,
    create_list_reducer,
    create_dict_reducer,
)

from .cost_tracking import (
    # Cost Tracking (Phase 2.4)
    CostTracker,
    CostRecord,
    CostSummary,
    ModelPricing,
    Budget,
    BudgetStatus,
    get_cost_tracker,
    reset_cost_tracker,
    get_model_pricing,
    track_cost,
)

from .validation import (
    # Input Validation (Phase 2.5)
    # Exceptions
    ValidationError,
    InvalidUUIDError,
    InvalidToolError,
    InvalidDomainError,
    InvalidMessageError,
    RateLimitError,
    ContentPolicyError,
    # UUID validation
    is_valid_uuid,
    validate_uuid,
    validate_uuid_optional,
    validate_uuids,
    # Tool validation
    ToolCategory,
    BUILTIN_TOOLS,
    is_valid_tool_name,
    validate_tool_name,
    validate_tool_config,
    # Domain validation
    VALID_DOMAINS,
    is_valid_domain,
    validate_domain,
    validate_domains,
    # Message validation
    MessageLimits,
    validate_message_content,
    validate_message,
    validate_messages,
    # Request validation
    AskExpertRequest,
    validate_ask_expert_request,
    # Decorators
    validate_request,
    # Sanitization
    sanitize_string,
    sanitize_dict,
)

from .parallel import (
    # Parallel Execution (Phase 3.1)
    # Configuration
    ParallelConfig,
    DEFAULT_PARALLEL_CONFIG,
    # Results
    BranchStatus,
    BranchResult,
    ParallelResult,
    # Core executor
    ParallelExecutor,
    # Convenience functions
    fan_out_fan_in,
    parallel_map,
    run_with_fallback,
    race,
    # LangGraph integration
    BranchDefinition,
    create_parallel_branches,
    ParallelBranchRouter,
    # Rate limiting
    SemaphorePool,
    get_semaphore_pool,
    reset_semaphore_pool,
)

from .streaming import (
    # Token Streaming (Phase 3.2)
    # Event types
    StreamEventType,
    StreamEvent,
    # Configuration
    StreamConfig,
    DEFAULT_STREAM_CONFIG,
    # Core stream
    TokenStream,
    # Transformers
    openai_stream_transformer,
    anthropic_stream_transformer,
    # Utilities
    stream_to_string,
    stream_with_callback,
    StreamBuffer,
    # Combiners
    merge_streams,
    tee_stream,
    # SSE helpers
    format_sse_event,
    sse_stream_generator,
)

from .model_factory import (
    # Model Factory (Phase 3.3)
    # Enums
    ModelProvider,
    ModelTier,
    # Configuration
    ModelConfig,
    MODEL_REGISTRY,
    PROVIDER_FALLBACK_CHAINS,
    TIER_FALLBACK_CHAINS,
    # Health
    ProviderHealth,
    ProviderHealthRegistry,
    get_health_registry,
    reset_health_registry,
    # Factory
    ModelFactory,
    get_model_factory,
    reset_model_factory,
    # Convenience functions
    get_chat_model,
    get_model_for_agent,
    get_model_config,
    get_available_models,
    get_models_by_tier,
    get_models_by_provider,
)

__all__ = [
    # Context management
    "RequestContext",
    "get_request_context",
    "set_request_context",
    "clear_request_context",
    # Primary: organization-based (matches RLS)
    "set_organization_context",
    "get_organization_id",
    "require_organization_context",
    # Legacy aliases (deprecated)
    "set_tenant_context",
    "get_tenant_id",
    "require_tenant_context",
    # User context
    "get_user_id",
    "require_user_context",
    # Testing utilities
    "OverrideContext",
    # Logging
    "configure_logging",
    "get_logger",
    "log_execution_time",
    "LogContext",
    "get_correlation_id",
    "set_correlation_id",
    "get_request_id",
    "set_request_id",
    # Configuration
    "Environment",
    "AppConfig",
    "get_config",
    "get_env",
    "is_production",
    "is_development",
    # Resilience (Phase 1.3-1.5)
    "safe_background_task",
    "create_safe_task",
    "CircuitBreaker",
    "CircuitBreakerConfig",
    "CircuitState",
    "CircuitOpenError",
    "retry_with_backoff",
    "RetryConfig",
    "timeout",
    "resilient_call",
    # Caching (Phase 2.1)
    "SemanticCache",
    "CacheConfig",
    "CacheEntry",
    "CacheMetrics",
    "L1ExactCache",
    "L2SemanticCache",
    "L3TemplateCache",
    "get_cache",
    "reset_cache",
    # Tracing (Phase 2.2 - Langfuse)
    "LangfuseTracer",
    "LangfuseConfig",
    "TraceContext",
    "SpanContext",
    "get_tracer",
    "reset_tracer",
    "get_langfuse_callback",
    "get_langgraph_callbacks",
    "traced",
    "traced_span",
    # Reducers (Phase 2.3)
    "append_list",
    "prepend_list",
    "unique_append_list",
    "merge_dicts",
    "deep_merge_dicts",
    "take_latest",
    "take_first",
    "coalesce",
    "sum_values",
    "max_value",
    "min_value",
    "average_values",
    "merge_messages",
    "merge_sources",
    "merge_artifacts",
    "aggregate_scores",
    "merge_errors",
    "sum_token_usage",
    "sum_costs",
    "create_list_reducer",
    "create_dict_reducer",
    # Cost Tracking (Phase 2.4)
    "CostTracker",
    "CostRecord",
    "CostSummary",
    "ModelPricing",
    "Budget",
    "BudgetStatus",
    "get_cost_tracker",
    "reset_cost_tracker",
    "get_model_pricing",
    "track_cost",
    # Input Validation (Phase 2.5)
    "ValidationError",
    "InvalidUUIDError",
    "InvalidToolError",
    "InvalidDomainError",
    "InvalidMessageError",
    "RateLimitError",
    "ContentPolicyError",
    "is_valid_uuid",
    "validate_uuid",
    "validate_uuid_optional",
    "validate_uuids",
    "ToolCategory",
    "BUILTIN_TOOLS",
    "is_valid_tool_name",
    "validate_tool_name",
    "validate_tool_config",
    "VALID_DOMAINS",
    "is_valid_domain",
    "validate_domain",
    "validate_domains",
    "MessageLimits",
    "validate_message_content",
    "validate_message",
    "validate_messages",
    "AskExpertRequest",
    "validate_ask_expert_request",
    "validate_request",
    "sanitize_string",
    "sanitize_dict",
    # Parallel Execution (Phase 3.1)
    "ParallelConfig",
    "DEFAULT_PARALLEL_CONFIG",
    "BranchStatus",
    "BranchResult",
    "ParallelResult",
    "ParallelExecutor",
    "fan_out_fan_in",
    "parallel_map",
    "run_with_fallback",
    "race",
    "BranchDefinition",
    "create_parallel_branches",
    "ParallelBranchRouter",
    "SemaphorePool",
    "get_semaphore_pool",
    "reset_semaphore_pool",
    # Token Streaming (Phase 3.2)
    "StreamEventType",
    "StreamEvent",
    "StreamConfig",
    "DEFAULT_STREAM_CONFIG",
    "TokenStream",
    "openai_stream_transformer",
    "anthropic_stream_transformer",
    "stream_to_string",
    "stream_with_callback",
    "StreamBuffer",
    "merge_streams",
    "tee_stream",
    "format_sse_event",
    "sse_stream_generator",
    # Model Factory (Phase 3.3)
    "ModelProvider",
    "ModelTier",
    "ModelConfig",
    "MODEL_REGISTRY",
    "PROVIDER_FALLBACK_CHAINS",
    "TIER_FALLBACK_CHAINS",
    "ProviderHealth",
    "ProviderHealthRegistry",
    "get_health_registry",
    "reset_health_registry",
    "ModelFactory",
    "get_model_factory",
    "reset_model_factory",
    "get_chat_model",
    "get_model_for_agent",
    "get_model_config",
    "get_available_models",
    "get_models_by_tier",
    "get_models_by_provider",
]






