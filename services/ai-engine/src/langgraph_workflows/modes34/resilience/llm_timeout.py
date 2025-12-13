# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [tenacity, structlog]
"""
LLM Timeout Protection (C1 CRITICAL Fix)

Prevents LLM calls from hanging indefinitely using:
- asyncio.wait_for() for hard timeout enforcement
- tenacity for intelligent retry with exponential backoff

Usage:
    from langgraph_workflows.modes34.resilience import invoke_llm_with_timeout

    result = await invoke_llm_with_timeout(
        llm_callable=lambda: llm.ainvoke(prompt),
        timeout_seconds=30,
        max_retries=3,
        operation_name="research_synthesis"
    )
"""

from __future__ import annotations

import asyncio
import os
from typing import Any, Callable, Coroutine, Dict, Optional, TypeVar
import structlog

from tenacity import (
    AsyncRetrying,
    RetryError,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

logger = structlog.get_logger()

# =============================================================================
# Configuration from Environment (12-Factor App)
# =============================================================================

# Default values - can be overridden via environment variables
DEFAULT_LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT_SECONDS", "60"))
DEFAULT_MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", "3"))
DEFAULT_BACKOFF_MIN = float(os.getenv("LLM_BACKOFF_MIN_SECONDS", "1"))
DEFAULT_BACKOFF_MAX = float(os.getenv("LLM_BACKOFF_MAX_SECONDS", "30"))

# Level-specific timeouts (loaded from env)
L2_EXPERT_TIMEOUT = int(os.getenv("L2_LLM_TIMEOUT_SECONDS", "120"))
L2_EXPERT_MAX_RETRIES = int(os.getenv("L2_LLM_MAX_RETRIES", "2"))
L4_WORKER_TIMEOUT = int(os.getenv("L4_LLM_TIMEOUT_SECONDS", "60"))
L4_WORKER_MAX_RETRIES = int(os.getenv("L4_LLM_MAX_RETRIES", "3"))

# Circuit breaker configuration
CIRCUIT_BREAKER_FAILURE_THRESHOLD = int(os.getenv("CIRCUIT_BREAKER_FAILURE_THRESHOLD", "5"))
CIRCUIT_BREAKER_RECOVERY_TIMEOUT = float(os.getenv("CIRCUIT_BREAKER_RECOVERY_SECONDS", "30"))
CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS = int(os.getenv("CIRCUIT_BREAKER_HALF_OPEN_CALLS", "3"))

T = TypeVar("T")


# =============================================================================
# Custom Exceptions
# =============================================================================


class LLMTimeoutError(Exception):
    """Raised when LLM call exceeds timeout threshold."""

    def __init__(
        self,
        message: str,
        timeout_seconds: float,
        operation_name: Optional[str] = None,
    ):
        self.timeout_seconds = timeout_seconds
        self.operation_name = operation_name
        super().__init__(message)


class LLMRetryExhaustedError(Exception):
    """Raised when all retry attempts are exhausted."""

    def __init__(
        self,
        message: str,
        attempts: int,
        last_error: Optional[Exception] = None,
        operation_name: Optional[str] = None,
    ):
        self.attempts = attempts
        self.last_error = last_error
        self.operation_name = operation_name
        super().__init__(message)


# =============================================================================
# Core Implementation
# =============================================================================


async def invoke_llm_with_timeout(
    llm_callable: Callable[[], Coroutine[Any, Any, T]],
    timeout_seconds: float = DEFAULT_LLM_TIMEOUT,
    max_retries: int = DEFAULT_MAX_RETRIES,
    operation_name: Optional[str] = None,
    backoff_min: float = DEFAULT_BACKOFF_MIN,
    backoff_max: float = DEFAULT_BACKOFF_MAX,
    retry_on_timeout: bool = True,
) -> T:
    """
    Invoke an LLM callable with timeout protection and intelligent retry.

    This is the CRITICAL fix for C1: LLM calls hanging indefinitely.

    Args:
        llm_callable: Async callable that performs the LLM invocation.
                     Should be a zero-argument lambda, e.g., `lambda: llm.ainvoke(prompt)`
        timeout_seconds: Maximum time to wait for each attempt (default: 60s)
        max_retries: Maximum number of retry attempts (default: 3)
        operation_name: Human-readable name for logging (e.g., "research_synthesis")
        backoff_min: Minimum backoff time in seconds (default: 1)
        backoff_max: Maximum backoff time in seconds (default: 30)
        retry_on_timeout: Whether to retry on timeout (default: True)

    Returns:
        The result from the LLM callable

    Raises:
        LLMTimeoutError: If the final attempt times out
        LLMRetryExhaustedError: If all retry attempts fail
        asyncio.CancelledError: If the task is cancelled (NEVER caught internally)

    Example:
        ```python
        result = await invoke_llm_with_timeout(
            llm_callable=lambda: llm.ainvoke(prompt),
            timeout_seconds=30,
            max_retries=3,
            operation_name="plan_generation"
        )
        ```
    """
    op_name = operation_name or "llm_invoke"
    last_exception: Optional[Exception] = None
    attempt_count = 0

    # Build retry conditions
    retry_exceptions = [asyncio.TimeoutError] if retry_on_timeout else []

    try:
        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(max_retries),
            wait=wait_exponential(min=backoff_min, max=backoff_max),
            retry=retry_if_exception_type(tuple(retry_exceptions)),
            reraise=True,
        ):
            with attempt:
                attempt_count = attempt.retry_state.attempt_number
                logger.debug(
                    "llm_invoke_attempt",
                    operation=op_name,
                    attempt=attempt_count,
                    max_retries=max_retries,
                    timeout_seconds=timeout_seconds,
                )

                try:
                    # CRITICAL: asyncio.wait_for enforces hard timeout
                    result = await asyncio.wait_for(
                        llm_callable(),
                        timeout=timeout_seconds,
                    )

                    logger.info(
                        "llm_invoke_success",
                        operation=op_name,
                        attempt=attempt_count,
                    )
                    return result

                except asyncio.TimeoutError:
                    last_exception = LLMTimeoutError(
                        f"LLM call '{op_name}' timed out after {timeout_seconds}s "
                        f"(attempt {attempt_count}/{max_retries})",
                        timeout_seconds=timeout_seconds,
                        operation_name=op_name,
                    )
                    logger.warning(
                        "llm_invoke_timeout",
                        operation=op_name,
                        attempt=attempt_count,
                        max_retries=max_retries,
                        timeout_seconds=timeout_seconds,
                    )
                    raise  # Let tenacity handle retry

                except asyncio.CancelledError:
                    # CRITICAL C5 FIX: NEVER swallow CancelledError
                    logger.warning(
                        "llm_invoke_cancelled",
                        operation=op_name,
                        attempt=attempt_count,
                    )
                    raise  # Propagate immediately for graceful shutdown

    except RetryError as retry_err:
        # All retries exhausted
        logger.error(
            "llm_invoke_retries_exhausted",
            operation=op_name,
            attempts=attempt_count,
            last_error=str(last_exception)[:200] if last_exception else None,
        )
        raise LLMRetryExhaustedError(
            f"LLM call '{op_name}' failed after {attempt_count} attempts",
            attempts=attempt_count,
            last_error=last_exception,
            operation_name=op_name,
        ) from retry_err

    except asyncio.CancelledError:
        # Propagate cancellation without wrapping
        raise

    except Exception as exc:
        # Unexpected error - log and re-raise
        logger.error(
            "llm_invoke_unexpected_error",
            operation=op_name,
            error=str(exc)[:200],
            error_type=type(exc).__name__,
        )
        raise


# =============================================================================
# Convenience Wrappers
# =============================================================================


async def invoke_with_fallback(
    primary_callable: Callable[[], Coroutine[Any, Any, T]],
    fallback_callable: Callable[[], Coroutine[Any, Any, T]],
    timeout_seconds: float = DEFAULT_LLM_TIMEOUT,
    operation_name: Optional[str] = None,
) -> T:
    """
    Try primary LLM call, fall back to secondary on failure.

    Useful for graceful degradation (e.g., GPT-4 → GPT-3.5-Turbo).

    Args:
        primary_callable: First LLM callable to try
        fallback_callable: Fallback LLM callable if primary fails
        timeout_seconds: Timeout for each call
        operation_name: Name for logging

    Returns:
        Result from whichever callable succeeds

    Raises:
        LLMRetryExhaustedError: If both primary and fallback fail
        asyncio.CancelledError: If cancelled (propagated immediately)
    """
    op_name = operation_name or "llm_with_fallback"

    try:
        return await invoke_llm_with_timeout(
            primary_callable,
            timeout_seconds=timeout_seconds,
            max_retries=2,  # Fewer retries since we have fallback
            operation_name=f"{op_name}_primary",
        )
    except (LLMTimeoutError, LLMRetryExhaustedError) as primary_err:
        logger.warning(
            "llm_primary_failed_trying_fallback",
            operation=op_name,
            primary_error=str(primary_err)[:100],
        )

        try:
            return await invoke_llm_with_timeout(
                fallback_callable,
                timeout_seconds=timeout_seconds,
                max_retries=2,
                operation_name=f"{op_name}_fallback",
            )
        except (LLMTimeoutError, LLMRetryExhaustedError) as fallback_err:
            logger.error(
                "llm_fallback_also_failed",
                operation=op_name,
                fallback_error=str(fallback_err)[:100],
            )
            raise LLMRetryExhaustedError(
                f"Both primary and fallback LLM calls failed for '{op_name}'",
                attempts=4,  # 2 primary + 2 fallback
                last_error=fallback_err,
                operation_name=op_name,
            ) from fallback_err


# =============================================================================
# Circuit Breaker Pattern
# =============================================================================


class CircuitBreakerState:
    """Thread-safe circuit breaker state management."""

    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered

    def __init__(self, name: str = "llm"):
        self.name = name
        self._state = self.CLOSED
        self._failure_count = 0
        self._success_count_half_open = 0
        self._last_failure_time: Optional[float] = None
        import threading
        self._lock = threading.Lock()

    @property
    def state(self) -> str:
        import time
        with self._lock:
            if self._state == self.OPEN and self._last_failure_time:
                # Check if recovery timeout has passed
                if time.time() - self._last_failure_time > CIRCUIT_BREAKER_RECOVERY_TIMEOUT:
                    self._state = self.HALF_OPEN
                    self._success_count_half_open = 0
                    logger.info(
                        "circuit_breaker_half_open",
                        name=self.name,
                        recovery_timeout=CIRCUIT_BREAKER_RECOVERY_TIMEOUT,
                    )
            return self._state

    def record_success(self) -> None:
        with self._lock:
            if self._state == self.HALF_OPEN:
                self._success_count_half_open += 1
                if self._success_count_half_open >= CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS:
                    self._state = self.CLOSED
                    self._failure_count = 0
                    logger.info("circuit_breaker_closed", name=self.name)
            elif self._state == self.CLOSED:
                self._failure_count = 0  # Reset on success

    def record_failure(self) -> None:
        import time
        with self._lock:
            self._failure_count += 1
            self._last_failure_time = time.time()
            if self._state == self.HALF_OPEN:
                # Immediate trip on failure during half-open
                self._state = self.OPEN
                logger.warning("circuit_breaker_open", name=self.name, reason="half_open_failure")
            elif self._state == self.CLOSED and self._failure_count >= CIRCUIT_BREAKER_FAILURE_THRESHOLD:
                self._state = self.OPEN
                logger.warning(
                    "circuit_breaker_open",
                    name=self.name,
                    failure_count=self._failure_count,
                    threshold=CIRCUIT_BREAKER_FAILURE_THRESHOLD,
                )

    def is_request_allowed(self) -> bool:
        """Check if request should be allowed through."""
        current_state = self.state  # This also checks for recovery timeout
        if current_state == self.CLOSED:
            return True
        if current_state == self.HALF_OPEN:
            return True  # Allow test requests
        return False  # OPEN state - reject

    def get_status(self) -> Dict[str, Any]:
        """Get circuit breaker status for monitoring."""
        return {
            "name": self.name,
            "state": self.state,
            "failure_count": self._failure_count,
            "failure_threshold": CIRCUIT_BREAKER_FAILURE_THRESHOLD,
            "recovery_timeout_seconds": CIRCUIT_BREAKER_RECOVERY_TIMEOUT,
        }


# Global circuit breaker instance
_circuit_breaker = CircuitBreakerState("llm_global")


def get_circuit_breaker() -> CircuitBreakerState:
    """Get the global circuit breaker instance."""
    return _circuit_breaker


class CircuitBreakerOpenError(Exception):
    """Raised when circuit breaker is open and rejecting requests."""

    def __init__(self, breaker_name: str, message: str = "Circuit breaker is open"):
        self.breaker_name = breaker_name
        super().__init__(f"{message} ({breaker_name})")


# =============================================================================
# Protocol-Aligned Error Conversion (JobErrorSchema compatibility)
# =============================================================================


def to_protocol_error(
    error: Exception,
    retry_count: int = 0,
) -> Dict[str, Any]:
    """
    Convert Python exceptions to protocol-aligned JobErrorSchema format.

    This ensures compatibility with the TypeScript protocol package:
    - code: string
    - message: string
    - isRetryable: boolean
    - retryCount: number
    - details: object (optional)
    """
    if isinstance(error, LLMTimeoutError):
        return {
            "code": "LLM_TIMEOUT",
            "message": str(error),
            "isRetryable": True,
            "retryCount": retry_count,
            "details": {
                "timeout_seconds": error.timeout_seconds,
                "operation_name": error.operation_name,
            },
        }
    elif isinstance(error, LLMRetryExhaustedError):
        return {
            "code": "LLM_RETRY_EXHAUSTED",
            "message": str(error),
            "isRetryable": False,  # All retries already exhausted
            "retryCount": error.attempts,
            "details": {
                "attempts": error.attempts,
                "operation_name": error.operation_name,
                "last_error": str(error.last_error)[:200] if error.last_error else None,
            },
        }
    elif isinstance(error, CircuitBreakerOpenError):
        return {
            "code": "CIRCUIT_BREAKER_OPEN",
            "message": str(error),
            "isRetryable": True,  # Retry after recovery timeout
            "retryCount": retry_count,
            "details": {
                "breaker_name": error.breaker_name,
                "recovery_timeout_seconds": CIRCUIT_BREAKER_RECOVERY_TIMEOUT,
            },
        }
    elif isinstance(error, asyncio.TimeoutError):
        return {
            "code": "TIMEOUT",
            "message": "Operation timed out",
            "isRetryable": True,
            "retryCount": retry_count,
            "details": None,
        }
    elif isinstance(error, asyncio.CancelledError):
        return {
            "code": "CANCELLED",
            "message": "Operation was cancelled",
            "isRetryable": False,
            "retryCount": retry_count,
            "details": None,
        }
    else:
        return {
            "code": "INTERNAL_ERROR",
            "message": str(error)[:500],
            "isRetryable": False,
            "retryCount": retry_count,
            "details": {
                "error_type": type(error).__name__,
            },
        }


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    # Exceptions
    "LLMTimeoutError",
    "LLMRetryExhaustedError",
    "CircuitBreakerOpenError",
    # Core functions
    "invoke_llm_with_timeout",
    "invoke_with_fallback",
    # Circuit breaker
    "CircuitBreakerState",
    "get_circuit_breaker",
    # Protocol conversion
    "to_protocol_error",
    # Configuration constants
    "DEFAULT_LLM_TIMEOUT",
    "DEFAULT_MAX_RETRIES",
    "L2_EXPERT_TIMEOUT",
    "L2_EXPERT_MAX_RETRIES",
    "L4_WORKER_TIMEOUT",
    "L4_WORKER_MAX_RETRIES",
    "CIRCUIT_BREAKER_FAILURE_THRESHOLD",
    "CIRCUIT_BREAKER_RECOVERY_TIMEOUT",
]
