# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: []
"""
Custom Exceptions for Mode 3/4 Workflow Resilience (C4 CRITICAL Fix)

Provides domain-specific exceptions that replace silent failures with
explicit, actionable error conditions.

Usage:
    from langgraph_workflows.modes34.resilience import (
        DatabaseConnectionError,
        TemplateLoadError,
        AgentSelectionError,
    )

    # Instead of returning {} on failure:
    raise DatabaseConnectionError("mission_templates", original_error=exc)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional


# =============================================================================
# Base Exception
# =============================================================================


class WorkflowResilienceError(Exception):
    """
    Base exception for all Mode 3/4 workflow resilience errors.

    Provides consistent error structure for logging and recovery.
    """

    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        recoverable: bool = True,
        retry_suggested: bool = False,
    ):
        self.error_code = error_code or "WORKFLOW_ERROR"
        self.context = context or {}
        self.recoverable = recoverable
        self.retry_suggested = retry_suggested
        super().__init__(message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for structured logging/state storage."""
        return {
            "error_type": self.__class__.__name__,
            "error_code": self.error_code,
            "message": str(self),
            "recoverable": self.recoverable,
            "retry_suggested": self.retry_suggested,
            "context": self.context,
        }


# =============================================================================
# Database Errors (C4 Fix)
# =============================================================================


class DatabaseConnectionError(WorkflowResilienceError):
    """
    Raised when database operations fail.

    This is the CRITICAL fix for C4: Silent failures in registry.py
    that return {} instead of raising exceptions.

    Usage:
        try:
            result = await load_from_db()
        except Exception as exc:
            raise DatabaseConnectionError(
                table_name="mission_templates",
                operation="select",
                original_error=exc,
            )
    """

    def __init__(
        self,
        table_name: str,
        operation: str = "query",
        original_error: Optional[Exception] = None,
        connection_info: Optional[str] = None,
    ):
        self.table_name = table_name
        self.operation = operation
        self.original_error = original_error
        self.connection_info = connection_info

        message = f"Database {operation} failed on table '{table_name}'"
        if original_error:
            message += f": {str(original_error)[:200]}"

        super().__init__(
            message=message,
            error_code="DB_CONNECTION_ERROR",
            context={
                "table_name": table_name,
                "operation": operation,
                "original_error_type": (
                    type(original_error).__name__ if original_error else None
                ),
            },
            recoverable=True,  # DB errors are often transient
            retry_suggested=True,
        )


class DatabaseQueryError(WorkflowResilienceError):
    """
    Raised when a database query returns unexpected results.

    Distinct from connection errors - the connection works but
    the query/data is problematic.
    """

    def __init__(
        self,
        query_description: str,
        expected: str,
        actual: str,
        table_name: Optional[str] = None,
    ):
        self.query_description = query_description
        self.expected = expected
        self.actual = actual
        self.table_name = table_name

        message = f"Query '{query_description}' failed: expected {expected}, got {actual}"

        super().__init__(
            message=message,
            error_code="DB_QUERY_ERROR",
            context={
                "query_description": query_description,
                "expected": expected,
                "actual": actual,
                "table_name": table_name,
            },
            recoverable=False,  # Query errors usually need investigation
            retry_suggested=False,
        )


# =============================================================================
# Template Errors
# =============================================================================


class TemplateLoadError(WorkflowResilienceError):
    """
    Raised when mission template loading fails.

    Distinct from DatabaseConnectionError - specifically for template
    loading logic failures.
    """

    def __init__(
        self,
        template_id: Optional[str] = None,
        reason: str = "Unknown error",
        available_templates: Optional[List[str]] = None,
    ):
        self.template_id = template_id
        self.reason = reason
        self.available_templates = available_templates

        if template_id:
            message = f"Failed to load template '{template_id}': {reason}"
        else:
            message = f"Failed to load templates: {reason}"

        super().__init__(
            message=message,
            error_code="TEMPLATE_LOAD_ERROR",
            context={
                "template_id": template_id,
                "reason": reason,
                "available_templates": available_templates[:5] if available_templates else None,
            },
            recoverable=True,
            retry_suggested=True,
        )


class TemplateValidationError(WorkflowResilienceError):
    """
    Raised when a template fails validation.

    Template loaded successfully but doesn't meet schema requirements.
    """

    def __init__(
        self,
        template_id: str,
        validation_errors: List[str],
    ):
        self.template_id = template_id
        self.validation_errors = validation_errors

        message = (
            f"Template '{template_id}' validation failed: "
            f"{'; '.join(validation_errors[:3])}"
        )

        super().__init__(
            message=message,
            error_code="TEMPLATE_VALIDATION_ERROR",
            context={
                "template_id": template_id,
                "validation_errors": validation_errors,
            },
            recoverable=False,  # Validation errors need template fixes
            retry_suggested=False,
        )


# =============================================================================
# Validation Error (exported for tests)
# =============================================================================


class ValidationError(WorkflowResilienceError):
    """
    Raised when runtime validation fails in runner nodes.

    This maintains backwards compatibility for tests that expect
    ValidationError to be exported from resilience.exceptions.
    """

    def __init__(
        self,
        message: str = "Validation failed",
        field_errors: Optional[Dict[str, Any]] = None,
    ):
        self.field_errors = field_errors or {}
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            context={"field_errors": list(self.field_errors.keys())},
            recoverable=False,
            retry_suggested=False,
        )


# Explicit exports for downstream imports/tests
__all__ = [
    "WorkflowResilienceError",
    "DatabaseConnectionError",
    "DatabaseQueryError",
    "TemplateLoadError",
    "TemplateValidationError",
    "AgentSelectionError",
    "AgentValidationError",
    "CheckpointError",
    "HITLTimeoutError",
    "ResilienceConfigurationError",
    "ValidationError",
]


# =============================================================================
# Agent Selection Errors
# =============================================================================


class AgentSelectionError(WorkflowResilienceError):
    """
    Raised when agent selection fails.

    Used in agent_selector.py to replace silent fallback patterns.
    """

    def __init__(
        self,
        goal: str,
        selection_method: str = "unknown",
        reason: str = "No agents matched",
        attempted_methods: Optional[List[str]] = None,
    ):
        self.goal = goal
        self.selection_method = selection_method
        self.reason = reason
        self.attempted_methods = attempted_methods or []

        message = (
            f"Agent selection failed for goal '{goal[:100]}...' "
            f"using {selection_method}: {reason}"
        )

        super().__init__(
            message=message,
            error_code="AGENT_SELECTION_ERROR",
            context={
                "goal_preview": goal[:200],
                "selection_method": selection_method,
                "reason": reason,
                "attempted_methods": attempted_methods,
            },
            recoverable=True,  # Can try fallback methods
            retry_suggested=True,
        )


class AgentNotFoundError(WorkflowResilienceError):
    """
    Raised when a specific agent cannot be found.
    """

    def __init__(
        self,
        agent_id: Optional[str] = None,
        agent_slug: Optional[str] = None,
        tenant_id: Optional[str] = None,
    ):
        self.agent_id = agent_id
        self.agent_slug = agent_slug
        self.tenant_id = tenant_id

        identifier = agent_id or agent_slug or "unknown"
        message = f"Agent '{identifier}' not found"
        if tenant_id:
            message += f" for tenant '{tenant_id}'"

        super().__init__(
            message=message,
            error_code="AGENT_NOT_FOUND",
            context={
                "agent_id": agent_id,
                "agent_slug": agent_slug,
                "tenant_id": tenant_id,
            },
            recoverable=False,
            retry_suggested=False,
        )


# =============================================================================
# Workflow Execution Errors
# =============================================================================


class MissionExecutionError(WorkflowResilienceError):
    """
    Raised when mission execution fails at the workflow level.
    """

    def __init__(
        self,
        mission_id: str,
        phase: str,
        reason: str,
        partial_results: Optional[Dict[str, Any]] = None,
    ):
        self.mission_id = mission_id
        self.phase = phase
        self.reason = reason
        self.partial_results = partial_results

        message = f"Mission '{mission_id}' failed in phase '{phase}': {reason}"

        super().__init__(
            message=message,
            error_code="MISSION_EXECUTION_ERROR",
            context={
                "mission_id": mission_id,
                "phase": phase,
                "reason": reason,
                "has_partial_results": partial_results is not None,
            },
            recoverable=True,  # Missions can often be retried from checkpoint
            retry_suggested=True,
        )


class CheckpointError(WorkflowResilienceError):
    """
    Raised when checkpoint save/load operations fail.
    """

    def __init__(
        self,
        operation: str,  # "save" or "load"
        checkpoint_id: Optional[str] = None,
        original_error: Optional[Exception] = None,
    ):
        self.operation = operation
        self.checkpoint_id = checkpoint_id
        self.original_error = original_error

        message = f"Checkpoint {operation} failed"
        if checkpoint_id:
            message += f" for checkpoint '{checkpoint_id}'"
        if original_error:
            message += f": {str(original_error)[:150]}"

        super().__init__(
            message=message,
            error_code="CHECKPOINT_ERROR",
            context={
                "operation": operation,
                "checkpoint_id": checkpoint_id,
                "original_error_type": (
                    type(original_error).__name__ if original_error else None
                ),
            },
            recoverable=operation == "save",  # Save failures are recoverable
            retry_suggested=True,
        )


# =============================================================================
# Research Quality Errors
# =============================================================================


class ResearchQualityError(WorkflowResilienceError):
    """
    Raised when research quality checks fail.
    """

    def __init__(
        self,
        check_name: str,
        threshold: float,
        actual_score: float,
        details: Optional[str] = None,
    ):
        self.check_name = check_name
        self.threshold = threshold
        self.actual_score = actual_score
        self.details = details

        message = (
            f"Research quality check '{check_name}' failed: "
            f"score {actual_score:.2f} below threshold {threshold:.2f}"
        )
        if details:
            message += f" - {details}"

        super().__init__(
            message=message,
            error_code="RESEARCH_QUALITY_ERROR",
            context={
                "check_name": check_name,
                "threshold": threshold,
                "actual_score": actual_score,
                "details": details,
            },
            recoverable=True,  # Can iterate to improve quality
            retry_suggested=True,
        )


class CitationVerificationError(WorkflowResilienceError):
    """
    Raised when citation verification fails.
    """

    def __init__(
        self,
        citation_count: int,
        verified_count: int,
        failed_citations: Optional[List[str]] = None,
    ):
        self.citation_count = citation_count
        self.verified_count = verified_count
        self.failed_citations = failed_citations

        message = (
            f"Citation verification: {verified_count}/{citation_count} verified"
        )
        if failed_citations:
            message += f", failed: {', '.join(failed_citations[:3])}"

        super().__init__(
            message=message,
            error_code="CITATION_VERIFICATION_ERROR",
            context={
                "citation_count": citation_count,
                "verified_count": verified_count,
                "failed_citations": failed_citations[:5] if failed_citations else None,
            },
            recoverable=True,
            retry_suggested=False,  # Re-verification won't help
        )


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    # Base
    "WorkflowResilienceError",
    # Database (C4)
    "DatabaseConnectionError",
    "DatabaseQueryError",
    # Templates
    "TemplateLoadError",
    "TemplateValidationError",
    # Agents
    "AgentSelectionError",
    "AgentNotFoundError",
    # Workflow
    "MissionExecutionError",
    "CheckpointError",
    # Research Quality
    "ResearchQualityError",
    "CitationVerificationError",
]
