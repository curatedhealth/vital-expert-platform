# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [structlog]
"""
Node-Level Exception Handling (C2 CRITICAL Fix)

Provides consistent exception handling for LangGraph nodes using decorators.
Ensures all node failures are logged, tracked, and handled uniformly.

Usage:
    from langgraph_workflows.modes34.resilience import handle_node_errors

    @handle_node_errors("plan_generation_node")
    async def plan_generation(state: MissionState) -> MissionState:
        # Node implementation
        ...
"""

from __future__ import annotations

import asyncio
import functools
import traceback
from typing import Any, Callable, Dict, Optional, TypeVar, Union
import structlog

logger = structlog.get_logger()

# Type variables for generic decorators
T = TypeVar("T")
StateT = TypeVar("StateT", bound=Dict[str, Any])


# =============================================================================
# Custom Exceptions
# =============================================================================


class NodeExecutionError(Exception):
    """
    Raised when a LangGraph node fails execution.

    Contains rich context for debugging and error recovery.
    """

    def __init__(
        self,
        message: str,
        node_name: str,
        original_error: Optional[Exception] = None,
        state_snapshot: Optional[Dict[str, Any]] = None,
        recoverable: bool = True,
    ):
        self.node_name = node_name
        self.original_error = original_error
        self.state_snapshot = state_snapshot
        self.recoverable = recoverable
        self.traceback_str = (
            traceback.format_exception(
                type(original_error), original_error, original_error.__traceback__
            )
            if original_error
            else None
        )
        super().__init__(message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for state storage/logging."""
        return {
            "error_type": "NodeExecutionError",
            "node_name": self.node_name,
            "message": str(self),
            "original_error": str(self.original_error) if self.original_error else None,
            "original_error_type": (
                type(self.original_error).__name__ if self.original_error else None
            ),
            "recoverable": self.recoverable,
            "traceback": (
                "".join(self.traceback_str) if self.traceback_str else None
            ),
        }


# =============================================================================
# Error State Management
# =============================================================================


def add_error_to_state(
    state: Dict[str, Any],
    error: Union[Exception, NodeExecutionError],
    node_name: str,
) -> Dict[str, Any]:
    """
    Add error information to mission state for tracking and recovery.

    Args:
        state: Current mission state
        error: The exception that occurred
        node_name: Name of the node that failed

    Returns:
        Updated state with error information
    """
    # Initialize errors list if not present
    errors = state.get("errors", [])

    # Build error record
    if isinstance(error, NodeExecutionError):
        error_record = error.to_dict()
    else:
        error_record = {
            "error_type": type(error).__name__,
            "node_name": node_name,
            "message": str(error)[:500],  # Truncate long messages
            "recoverable": True,  # Assume recoverable by default
        }

    errors.append(error_record)

    # Update state
    return {
        **state,
        "errors": errors,
        "last_error_node": node_name,
        "error_count": len(errors),
    }


# =============================================================================
# Decorator Implementation
# =============================================================================


def handle_node_errors(
    node_name: str,
    recoverable: bool = True,
    log_state: bool = False,
    max_state_log_chars: int = 1000,
):
    """
    Decorator for consistent node-level exception handling.

    This is the CRITICAL fix for C2: inconsistent node error handling.

    Args:
        node_name: Human-readable name for logging (e.g., "plan_generation")
        recoverable: Whether errors from this node are recoverable
        log_state: Whether to log state snapshot on error (use sparingly)
        max_state_log_chars: Max characters of state to log

    Returns:
        Decorated function with error handling

    Usage:
        @handle_node_errors("plan_generation", recoverable=True)
        async def plan_generation_node(state: MissionState) -> MissionState:
            ...

    Behavior:
        - Logs all errors with structured context
        - NEVER catches asyncio.CancelledError (C5 fix)
        - Wraps errors in NodeExecutionError for consistency
        - Optionally adds error to state for recovery workflows
    """

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs) -> T:
            # Extract state from args (usually first positional arg)
            state = args[0] if args else kwargs.get("state", {})

            logger.debug(
                "node_execution_start",
                node=node_name,
                has_state=bool(state),
            )

            try:
                result = await func(*args, **kwargs)
                logger.debug(
                    "node_execution_success",
                    node=node_name,
                )
                return result

            except asyncio.CancelledError:
                # CRITICAL C5 FIX: NEVER catch CancelledError
                logger.warning(
                    "node_execution_cancelled",
                    node=node_name,
                )
                raise  # Propagate immediately

            except NodeExecutionError:
                # Already wrapped, just re-raise
                raise

            except Exception as exc:
                # Log with rich context
                state_snapshot = None
                if log_state and isinstance(state, dict):
                    state_str = str(state)[:max_state_log_chars]
                    state_snapshot = {"truncated_state": state_str}

                logger.error(
                    "node_execution_failed",
                    node=node_name,
                    error=str(exc)[:300],
                    error_type=type(exc).__name__,
                    recoverable=recoverable,
                    state_snapshot=state_snapshot,
                    exc_info=True,
                )

                # Wrap in NodeExecutionError for consistent handling
                raise NodeExecutionError(
                    message=f"Node '{node_name}' failed: {str(exc)[:200]}",
                    node_name=node_name,
                    original_error=exc,
                    state_snapshot=state_snapshot,
                    recoverable=recoverable,
                ) from exc

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs) -> T:
            state = args[0] if args else kwargs.get("state", {})

            logger.debug(
                "node_execution_start",
                node=node_name,
                has_state=bool(state),
            )

            try:
                result = func(*args, **kwargs)
                logger.debug(
                    "node_execution_success",
                    node=node_name,
                )
                return result

            except NodeExecutionError:
                raise

            except Exception as exc:
                state_snapshot = None
                if log_state and isinstance(state, dict):
                    state_str = str(state)[:max_state_log_chars]
                    state_snapshot = {"truncated_state": state_str}

                logger.error(
                    "node_execution_failed",
                    node=node_name,
                    error=str(exc)[:300],
                    error_type=type(exc).__name__,
                    recoverable=recoverable,
                    exc_info=True,
                )

                raise NodeExecutionError(
                    message=f"Node '{node_name}' failed: {str(exc)[:200]}",
                    node_name=node_name,
                    original_error=exc,
                    state_snapshot=state_snapshot,
                    recoverable=recoverable,
                ) from exc

        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


# =============================================================================
# Safe Execution Utilities
# =============================================================================


async def safe_node_execution(
    func: Callable[..., T],
    *args,
    node_name: str = "unknown",
    default_on_error: Optional[T] = None,
    **kwargs,
) -> T:
    """
    Execute a function with error handling, returning default on failure.

    Use sparingly - prefer @handle_node_errors decorator for most cases.
    This is useful for optional operations that shouldn't fail the workflow.

    Args:
        func: Function to execute
        *args: Positional arguments for func
        node_name: Name for logging
        default_on_error: Value to return on error (None if not specified)
        **kwargs: Keyword arguments for func

    Returns:
        Result of func or default_on_error on failure

    Raises:
        asyncio.CancelledError: Always propagated (C5 fix)
    """
    try:
        if asyncio.iscoroutinefunction(func):
            return await func(*args, **kwargs)
        return func(*args, **kwargs)

    except asyncio.CancelledError:
        # CRITICAL C5 FIX: NEVER swallow CancelledError
        raise

    except Exception as exc:
        logger.warning(
            "safe_node_execution_failed",
            node=node_name,
            error=str(exc)[:200],
            error_type=type(exc).__name__,
            returning_default=default_on_error is not None,
        )
        return default_on_error


# =============================================================================
# Error Recovery Helpers
# =============================================================================


def is_recoverable_error(state: Dict[str, Any]) -> bool:
    """
    Check if the last error in state is recoverable.

    Args:
        state: Mission state with errors list

    Returns:
        True if last error is recoverable, False otherwise
    """
    errors = state.get("errors", [])
    if not errors:
        return True  # No errors = recoverable

    last_error = errors[-1]
    return last_error.get("recoverable", True)


def get_error_summary(state: Dict[str, Any]) -> str:
    """
    Generate human-readable error summary from state.

    Args:
        state: Mission state with errors list

    Returns:
        Summary string of all errors
    """
    errors = state.get("errors", [])
    if not errors:
        return "No errors recorded"

    summaries = []
    for i, err in enumerate(errors, 1):
        node = err.get("node_name", "unknown")
        msg = err.get("message", "Unknown error")[:100]
        summaries.append(f"{i}. [{node}] {msg}")

    return "\n".join(summaries)


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    "NodeExecutionError",
    "handle_node_errors",
    "safe_node_execution",
    "add_error_to_state",
    "is_recoverable_error",
    "get_error_summary",
]
