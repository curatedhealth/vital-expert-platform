# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [llm_timeout, node_error_handler, exceptions, graceful_degradation]
"""
Resilience Infrastructure for Mode 3/4 Workflows

Phase 1 CRITICAL Fixes:
- C1: LLM timeout protection with asyncio.wait_for + tenacity retry
- C2: Node-level exception handling decorator
- C3: (Handled in research_quality.py - parameterized queries)
- C4: DB connection failure handling
- C5: CancelledError propagation

Phase 2 HIGH Priority Fixes:
- H7: Graceful degradation with specific exception types

This module provides production-grade resilience patterns:
- invoke_llm_with_timeout: Prevents LLM calls from hanging indefinitely
- handle_node_errors: Decorator for consistent node error handling
- graceful_degradation: Decorator for specific exception classification
- Custom exceptions for workflow-specific errors
"""

from .llm_timeout import (
    LLMTimeoutError,
    LLMRetryExhaustedError,
    CircuitBreakerOpenError,
    invoke_llm_with_timeout,
    invoke_with_fallback,
    to_protocol_error,
    CircuitBreakerState,
    get_circuit_breaker,
    DEFAULT_LLM_TIMEOUT,
    DEFAULT_MAX_RETRIES,
    DEFAULT_BACKOFF_MIN,
    DEFAULT_BACKOFF_MAX,
    L2_EXPERT_TIMEOUT,
    L2_EXPERT_MAX_RETRIES,
    L4_WORKER_TIMEOUT,
    L4_WORKER_MAX_RETRIES,
    CIRCUIT_BREAKER_FAILURE_THRESHOLD,
    CIRCUIT_BREAKER_RECOVERY_TIMEOUT,
)

from .node_error_handler import (
    NodeExecutionError,
    handle_node_errors,
    safe_node_execution,
    add_error_to_state,
    is_recoverable_error,
    get_error_summary,
)

from .exceptions import (
    WorkflowResilienceError,
    TemplateLoadError,
    AgentSelectionError,
    DatabaseConnectionError,
    DatabaseQueryError,
    TemplateValidationError,
    AgentNotFoundError,
    MissionExecutionError,
    CheckpointError,
    ResearchQualityError,
    CitationVerificationError,
)

from .graceful_degradation import (
    graceful_degradation,
    database_operation,
    agent_operation,
    research_operation,
    classify_exception,
    get_exception_properties,
)

__all__ = [
    # LLM Timeout (C1) - Core
    "LLMTimeoutError",
    "LLMRetryExhaustedError",
    "invoke_llm_with_timeout",
    "invoke_with_fallback",
    # LLM Timeout (C1) - Environment-Configurable Constants
    "DEFAULT_LLM_TIMEOUT",
    "DEFAULT_MAX_RETRIES",
    "DEFAULT_BACKOFF_MIN",
    "DEFAULT_BACKOFF_MAX",
    "L2_EXPERT_TIMEOUT",
    "L2_EXPERT_MAX_RETRIES",
    "L4_WORKER_TIMEOUT",
    "L4_WORKER_MAX_RETRIES",
    # Circuit Breaker Pattern
    "CircuitBreakerOpenError",
    "CircuitBreakerState",
    "get_circuit_breaker",
    "CIRCUIT_BREAKER_FAILURE_THRESHOLD",
    "CIRCUIT_BREAKER_RECOVERY_TIMEOUT",
    # Protocol-Aligned Error Conversion (JobErrorSchema)
    "to_protocol_error",
    # Node Error Handling (C2)
    "NodeExecutionError",
    "handle_node_errors",
    "safe_node_execution",
    "add_error_to_state",
    "is_recoverable_error",
    "get_error_summary",
    # Custom Exceptions (C4, C5)
    "WorkflowResilienceError",
    "TemplateLoadError",
    "AgentSelectionError",
    "DatabaseConnectionError",
    # Custom Exceptions (H7 - extended set)
    "DatabaseQueryError",
    "TemplateValidationError",
    "AgentNotFoundError",
    "MissionExecutionError",
    "CheckpointError",
    "ResearchQualityError",
    "CitationVerificationError",
    # Graceful Degradation (H7)
    "graceful_degradation",
    "database_operation",
    "agent_operation",
    "research_operation",
    "classify_exception",
    "get_exception_properties",
]
