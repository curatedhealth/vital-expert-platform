# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [structlog, resilience.exceptions]
"""
Graceful Degradation Infrastructure (H7 HIGH Priority Fix)

Provides decorators for converting generic exceptions to specific workflow
exceptions with automatic fallback behavior and structured logging.

This addresses the H7 gap: "Just raise generic exception with error message"
by ensuring all exceptions are domain-specific, logged, and provide recovery hints.

Key Features:
- Exception classification: Maps generic exceptions to specific types
- Graceful fallbacks: Returns default values for recoverable errors
- Structured logging: All exceptions logged with rich context
- CancelledError safety: Never swallows asyncio.CancelledError (C5 fix)

Usage:
    from langgraph_workflows.modes34.resilience import graceful_degradation

    @graceful_degradation(
        domain="database",
        fallback_value={"agents": []},
        recoverable=True,
    )
    async def fetch_agents(tenant_id: str) -> dict:
        # Implementation that might fail
        ...
"""

from __future__ import annotations

import asyncio
import functools
import re
from typing import Any, Callable, Dict, Optional, Type, TypeVar, Union
import structlog

from .exceptions import (
    WorkflowResilienceError,
    DatabaseConnectionError,
    DatabaseQueryError,
    TemplateLoadError,
    TemplateValidationError,
    AgentSelectionError,
    AgentNotFoundError,
    MissionExecutionError,
    CheckpointError,
    ResearchQualityError,
    CitationVerificationError,
)

logger = structlog.get_logger()

T = TypeVar("T")


# =============================================================================
# Exception Classification Rules
# =============================================================================

# Patterns to classify generic exceptions into specific types
EXCEPTION_CLASSIFICATION_RULES: Dict[str, Dict[str, Any]] = {
    "database": {
        "patterns": [
            r"(?i)connection\s+(refused|reset|timeout)",
            r"(?i)database\s+(error|unavailable)",
            r"(?i)postgres(ql)?\s+(error|unavailable)",
            r"(?i)supabase\s+(error|timeout)",
            r"(?i)too\s+many\s+connections",
            r"(?i)pool\s+(exhausted|timeout)",
        ],
        "exception_class": DatabaseConnectionError,
        "recoverable": True,
        "retry_suggested": True,
    },
    "query": {
        "patterns": [
            r"(?i)query\s+(failed|error|timeout)",
            r"(?i)sql\s+error",
            r"(?i)constraint\s+violation",
            r"(?i)duplicate\s+key",
            r"(?i)foreign\s+key",
            r"(?i)syntax\s+error.*sql",
        ],
        "exception_class": DatabaseQueryError,
        "recoverable": False,  # Query errors usually need code fix
        "retry_suggested": False,
    },
    "template": {
        "patterns": [
            r"(?i)template\s+(not\s+found|missing|invalid)",
            r"(?i)mission\s+template",
            r"(?i)workflow\s+template",
            r"(?i)yaml\s+(parse|error)",
            r"(?i)json\s+(parse|decode)\s+error",
        ],
        "exception_class": TemplateLoadError,
        "recoverable": False,
        "retry_suggested": False,
    },
    "validation": {
        "patterns": [
            r"(?i)validation\s+(failed|error)",
            r"(?i)invalid\s+(input|parameter|field)",
            r"(?i)required\s+field",
            r"(?i)schema\s+validation",
            r"(?i)pydantic.*validation",
        ],
        "exception_class": TemplateValidationError,
        "recoverable": False,
        "retry_suggested": False,
    },
    "agent_selection": {
        "patterns": [
            r"(?i)no\s+agents?\s+(found|selected|available)",
            r"(?i)agent\s+selection\s+(failed|error)",
            r"(?i)graphrag\s+(error|failed)",
            r"(?i)fusion\s+(failed|error)",
            r"(?i)pinecone\s+(error|timeout)",
            r"(?i)neo4j\s+(error|timeout)",
        ],
        "exception_class": AgentSelectionError,
        "recoverable": True,
        "retry_suggested": True,
    },
    "agent_not_found": {
        "patterns": [
            r"(?i)agent\s+(not\s+found|does\s+not\s+exist)",
            r"(?i)unknown\s+agent",
            r"(?i)invalid\s+agent\s+id",
        ],
        "exception_class": AgentNotFoundError,
        "recoverable": False,
        "retry_suggested": False,
    },
    "checkpoint": {
        "patterns": [
            r"(?i)checkpoint\s+(error|failed|invalid)",
            r"(?i)state\s+persistence",
            r"(?i)memory\s+saver",
            r"(?i)postgres\s+saver",
        ],
        "exception_class": CheckpointError,
        "recoverable": True,  # Can fall back to in-memory
        "retry_suggested": False,
    },
    "research": {
        "patterns": [
            r"(?i)research\s+(quality|error|failed)",
            r"(?i)l4\s+worker",
            r"(?i)evidence\s+(gathering|synthesis)",
            r"(?i)source\s+(verification|quality)",
        ],
        "exception_class": ResearchQualityError,
        "recoverable": True,
        "retry_suggested": True,
    },
    "citation": {
        "patterns": [
            r"(?i)citation\s+(error|invalid|missing)",
            r"(?i)reference\s+(not\s+found|invalid)",
            r"(?i)source\s+not\s+verifiable",
            r"(?i)pubmed\s+(error|unavailable)",
        ],
        "exception_class": CitationVerificationError,
        "recoverable": True,
        "retry_suggested": True,
    },
    "mission": {
        "patterns": [
            r"(?i)mission\s+(failed|error|timeout)",
            r"(?i)workflow\s+execution",
            r"(?i)goal\s+decomposition",
            r"(?i)step\s+execution",
        ],
        "exception_class": MissionExecutionError,
        "recoverable": True,
        "retry_suggested": True,
    },
}

# Compile patterns for performance
_COMPILED_RULES: Dict[str, Dict[str, Any]] = {}
for domain, config in EXCEPTION_CLASSIFICATION_RULES.items():
    _COMPILED_RULES[domain] = {
        **config,
        "compiled_patterns": [re.compile(p) for p in config["patterns"]],
    }


# =============================================================================
# Exception Classification Logic
# =============================================================================


def classify_exception(
    exc: Exception,
    domain_hint: Optional[str] = None,
) -> Type[WorkflowResilienceError]:
    """
    Classify a generic exception into a specific workflow exception type.

    Uses pattern matching on the exception message to determine the most
    appropriate exception class.

    Args:
        exc: The original exception
        domain_hint: Optional hint to prioritize a specific domain

    Returns:
        The most appropriate WorkflowResilienceError subclass
    """
    error_msg = str(exc).lower()
    error_type = type(exc).__name__.lower()

    # Check domain hint first if provided
    if domain_hint and domain_hint in _COMPILED_RULES:
        rule = _COMPILED_RULES[domain_hint]
        for pattern in rule["compiled_patterns"]:
            if pattern.search(error_msg) or pattern.search(error_type):
                return rule["exception_class"]

    # Check all domains for pattern matches
    for domain, rule in _COMPILED_RULES.items():
        for pattern in rule["compiled_patterns"]:
            if pattern.search(error_msg) or pattern.search(error_type):
                return rule["exception_class"]

    # Default to generic WorkflowResilienceError
    return WorkflowResilienceError


def get_exception_properties(
    exc_class: Type[WorkflowResilienceError],
) -> Dict[str, Any]:
    """
    Get default properties for a specific exception class.

    Returns:
        Dict with recoverable, retry_suggested flags
    """
    for domain, rule in _COMPILED_RULES.items():
        if rule["exception_class"] == exc_class:
            return {
                "recoverable": rule["recoverable"],
                "retry_suggested": rule["retry_suggested"],
            }

    return {"recoverable": True, "retry_suggested": False}


# =============================================================================
# Graceful Degradation Decorator
# =============================================================================


def graceful_degradation(
    domain: Optional[str] = None,
    fallback_value: Any = None,
    recoverable: bool = True,
    log_level: str = "error",
    include_traceback: bool = False,
    operation_name: Optional[str] = None,
):
    """
    Decorator for graceful degradation with specific exception types.

    This is the H7 HIGH priority fix: converts generic exceptions to
    domain-specific exceptions with proper logging and fallback behavior.

    Args:
        domain: Domain hint for exception classification (database, agent, etc.)
        fallback_value: Value to return on recoverable errors (None = re-raise)
        recoverable: Whether to use fallback on error or re-raise
        log_level: Logging level for errors (error, warning, info)
        include_traceback: Whether to include full traceback in logs
        operation_name: Human-readable operation name for logging

    Returns:
        Decorated function with graceful degradation

    Usage:
        @graceful_degradation(
            domain="database",
            fallback_value={"agents": []},
            operation_name="fetch_agents",
        )
        async def fetch_agents(tenant_id: str) -> dict:
            ...

    Behavior:
        - Classifies generic exceptions into specific types
        - Logs all exceptions with structured context
        - Returns fallback_value for recoverable errors (if provided)
        - Re-raises as specific exception type for non-recoverable errors
        - NEVER catches asyncio.CancelledError (C5 compliance)
    """

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        func_name = operation_name or func.__name__

        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs) -> T:
            try:
                return await func(*args, **kwargs)

            except asyncio.CancelledError:
                # CRITICAL C5: NEVER catch CancelledError
                logger.warning(
                    "graceful_degradation_cancelled",
                    operation=func_name,
                    domain=domain,
                    phase="H7_graceful_degradation",
                )
                raise

            except WorkflowResilienceError:
                # Already a specific exception, just re-raise
                raise

            except Exception as exc:
                # Classify the exception
                exc_class = classify_exception(exc, domain_hint=domain)
                exc_props = get_exception_properties(exc_class)

                # Determine if we should use fallback
                should_fallback = (
                    recoverable
                    and fallback_value is not None
                    and exc_props["recoverable"]
                )

                # Log with appropriate level
                log_data = {
                    "operation": func_name,
                    "domain": domain,
                    "original_error": str(exc)[:300],
                    "original_error_type": type(exc).__name__,
                    "classified_as": exc_class.__name__,
                    "recoverable": exc_props["recoverable"],
                    "retry_suggested": exc_props["retry_suggested"],
                    "using_fallback": should_fallback,
                    "phase": "H7_graceful_degradation",
                }

                if include_traceback:
                    log_data["exc_info"] = True

                log_func = getattr(logger, log_level, logger.error)
                log_func(
                    "graceful_degradation_exception",
                    **log_data,
                )

                if should_fallback:
                    logger.info(
                        "graceful_degradation_fallback_used",
                        operation=func_name,
                        fallback_type=type(fallback_value).__name__,
                        phase="H7_graceful_degradation",
                    )
                    return fallback_value

                # Re-raise as specific exception type
                # Use base class WorkflowResilienceError to ensure consistent signature
                # Specialized classes have domain-specific constructors
                raise WorkflowResilienceError(
                    message=f"{func_name} failed: {str(exc)[:200]}",
                    error_code=exc_class.__name__.upper(),
                    recoverable=exc_props["recoverable"],
                    retry_suggested=exc_props["retry_suggested"],
                    context={
                        "operation": func_name,
                        "domain": domain,
                        "original_error_type": type(exc).__name__,
                        "classified_as": exc_class.__name__,
                    },
                ) from exc

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs) -> T:
            try:
                return func(*args, **kwargs)

            except WorkflowResilienceError:
                raise

            except Exception as exc:
                exc_class = classify_exception(exc, domain_hint=domain)
                exc_props = get_exception_properties(exc_class)

                should_fallback = (
                    recoverable
                    and fallback_value is not None
                    and exc_props["recoverable"]
                )

                log_data = {
                    "operation": func_name,
                    "domain": domain,
                    "original_error": str(exc)[:300],
                    "original_error_type": type(exc).__name__,
                    "classified_as": exc_class.__name__,
                    "recoverable": exc_props["recoverable"],
                    "using_fallback": should_fallback,
                    "phase": "H7_graceful_degradation",
                }

                if include_traceback:
                    log_data["exc_info"] = True

                log_func = getattr(logger, log_level, logger.error)
                log_func("graceful_degradation_exception", **log_data)

                if should_fallback:
                    logger.info(
                        "graceful_degradation_fallback_used",
                        operation=func_name,
                        fallback_type=type(fallback_value).__name__,
                        phase="H7_graceful_degradation",
                    )
                    return fallback_value

                # Re-raise as WorkflowResilienceError with classification context
                # Specialized classes have domain-specific constructors
                raise WorkflowResilienceError(
                    message=f"{func_name} failed: {str(exc)[:200]}",
                    error_code=exc_class.__name__.upper(),
                    recoverable=exc_props["recoverable"],
                    retry_suggested=exc_props["retry_suggested"],
                    context={
                        "operation": func_name,
                        "domain": domain,
                        "original_error_type": type(exc).__name__,
                        "classified_as": exc_class.__name__,
                    },
                ) from exc

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


# =============================================================================
# Convenience Decorators for Common Domains
# =============================================================================


def database_operation(
    fallback_value: Any = None,
    operation_name: Optional[str] = None,
):
    """
    Decorator for database operations with graceful degradation.

    Converts database errors to DatabaseConnectionError or DatabaseQueryError.
    """
    return graceful_degradation(
        domain="database",
        fallback_value=fallback_value,
        recoverable=True,
        log_level="error",
        operation_name=operation_name,
    )


def agent_operation(
    fallback_value: Any = None,
    operation_name: Optional[str] = None,
):
    """
    Decorator for agent selection operations with graceful degradation.

    Converts agent errors to AgentSelectionError or AgentNotFoundError.
    """
    return graceful_degradation(
        domain="agent_selection",
        fallback_value=fallback_value,
        recoverable=True,
        log_level="warning",
        operation_name=operation_name,
    )


def research_operation(
    fallback_value: Any = None,
    operation_name: Optional[str] = None,
):
    """
    Decorator for research operations with graceful degradation.

    Converts research errors to ResearchQualityError or CitationVerificationError.
    """
    return graceful_degradation(
        domain="research",
        fallback_value=fallback_value,
        recoverable=True,
        log_level="warning",
        operation_name=operation_name,
    )


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    # Core decorator
    "graceful_degradation",
    # Convenience decorators
    "database_operation",
    "agent_operation",
    "research_operation",
    # Classification utilities
    "classify_exception",
    "get_exception_properties",
    # Constants
    "EXCEPTION_CLASSIFICATION_RULES",
]
