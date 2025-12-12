"""
Resilience Patterns for Production AI Engine.

This module implements gold-standard resilience patterns:
- Safe background task execution with error handling
- Circuit breaker for LLM provider failures
- Retry decorator with exponential backoff
- Timeout wrappers

These patterns ensure the AI engine degrades gracefully under failure conditions.
"""

from typing import Any, Callable, Coroutine, Dict, Optional, TypeVar, Union
from functools import wraps
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import asyncio
import time
import random
import structlog

logger = structlog.get_logger()

T = TypeVar("T")


# ============================================================================
# Background Task Error Handler (Phase 1.3)
# ============================================================================

async def safe_background_task(
    coro: Coroutine[Any, Any, T],
    task_name: str,
    on_error: Optional[Callable[[Exception], Coroutine[Any, Any, None]]] = None,
    on_complete: Optional[Callable[[T], Coroutine[Any, Any, None]]] = None,
) -> T:
    """
    Execute a coroutine with proper error handling for background tasks.

    When using asyncio.create_task(), exceptions are silently lost unless
    the task is awaited. This wrapper catches and logs all exceptions,
    optionally calling an error callback (e.g., to emit failure events).

    Args:
        coro: The coroutine to execute
        task_name: Human-readable name for logging
        on_error: Async callback when error occurs, receives the exception
        on_complete: Async callback on success, receives the result

    Returns:
        The result of the coroutine

    Raises:
        The original exception after logging and callback execution

    Example:
        async def my_task():
            # do work
            pass

        async def on_error(e):
            await emit_mission_failed(session_id, str(e))

        # Instead of:
        # asyncio.create_task(my_task())  # Exceptions lost!

        # Use:
        asyncio.create_task(safe_background_task(
            my_task(),
            "mission_execution",
            on_error=on_error
        ))
    """
    start_time = time.time()
    try:
        result = await coro
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(
            "background_task_completed",
            task_name=task_name,
            duration_ms=duration_ms,
        )
        if on_complete:
            await on_complete(result)
        return result
    except asyncio.CancelledError:
        logger.info("background_task_cancelled", task_name=task_name)
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        logger.error(
            "background_task_failed",
            task_name=task_name,
            error=str(e),
            error_type=type(e).__name__,
            duration_ms=duration_ms,
        )
        if on_error:
            try:
                await on_error(e)
            except Exception as callback_error:
                logger.error(
                    "background_task_error_callback_failed",
                    task_name=task_name,
                    callback_error=str(callback_error),
                )
        raise


def create_safe_task(
    coro: Coroutine[Any, Any, T],
    task_name: str,
    on_error: Optional[Callable[[Exception], Coroutine[Any, Any, None]]] = None,
    on_complete: Optional[Callable[[T], Coroutine[Any, Any, None]]] = None,
) -> asyncio.Task:
    """
    Convenience function to create an asyncio Task with error handling.

    Example:
        task = create_safe_task(
            execute_mission(mission_id),
            "mission_execution",
            on_error=lambda e: emit_mission_failed(mission_id, str(e))
        )
    """
    return asyncio.create_task(
        safe_background_task(coro, task_name, on_error, on_complete)
    )


# ============================================================================
# Circuit Breaker (Phase 1.4)
# ============================================================================

class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "closed"  # Normal operation, requests pass through
    OPEN = "open"  # Failures exceeded threshold, requests blocked
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Configuration for circuit breaker behavior."""
    failure_threshold: int = 5  # Failures before opening circuit
    recovery_timeout: float = 30.0  # Seconds before attempting recovery
    half_open_max_calls: int = 3  # Test calls in half-open state
    success_threshold: int = 2  # Successes needed to close circuit


@dataclass
class CircuitBreakerState:
    """Runtime state for a circuit breaker."""
    state: CircuitState = CircuitState.CLOSED
    failure_count: int = 0
    success_count: int = 0
    last_failure_time: Optional[datetime] = None
    half_open_calls: int = 0


class CircuitBreaker:
    """
    Circuit breaker pattern for LLM provider resilience.

    Prevents cascading failures by temporarily stopping requests to
    a failing service. After a recovery timeout, allows limited
    requests to test if the service has recovered.

    States:
    - CLOSED: Normal operation, all requests pass through
    - OPEN: Service failing, requests blocked with CircuitOpenError
    - HALF_OPEN: Testing recovery, limited requests allowed

    Example:
        llm_breaker = CircuitBreaker("openai", CircuitBreakerConfig())

        @llm_breaker
        async def call_openai(prompt: str) -> str:
            return await openai_client.complete(prompt)

        try:
            result = await call_openai("Hello")
        except CircuitOpenError:
            # Use fallback or return cached response
            result = await call_anthropic("Hello")
    """

    # Global registry of circuit breakers
    _breakers: Dict[str, "CircuitBreaker"] = {}

    def __init__(self, name: str, config: Optional[CircuitBreakerConfig] = None):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self._state = CircuitBreakerState()
        self._lock = asyncio.Lock()

        # Register in global registry
        CircuitBreaker._breakers[name] = self

    @classmethod
    def get(cls, name: str) -> Optional["CircuitBreaker"]:
        """Get a circuit breaker by name."""
        return cls._breakers.get(name)

    @property
    def state(self) -> CircuitState:
        """Current circuit state."""
        return self._state.state

    @property
    def is_open(self) -> bool:
        """Check if circuit is open (blocking requests)."""
        return self._state.state == CircuitState.OPEN

    async def _check_state(self) -> CircuitState:
        """Check and potentially transition circuit state."""
        async with self._lock:
            if self._state.state == CircuitState.OPEN:
                # Check if recovery timeout has passed
                if self._state.last_failure_time:
                    elapsed = datetime.utcnow() - self._state.last_failure_time
                    if elapsed.total_seconds() >= self.config.recovery_timeout:
                        self._state.state = CircuitState.HALF_OPEN
                        self._state.half_open_calls = 0
                        self._state.success_count = 0
                        logger.info(
                            "circuit_half_open",
                            name=self.name,
                            elapsed_seconds=elapsed.total_seconds(),
                        )
            return self._state.state

    async def _record_success(self) -> None:
        """Record a successful call."""
        async with self._lock:
            self._state.failure_count = 0

            if self._state.state == CircuitState.HALF_OPEN:
                self._state.success_count += 1
                if self._state.success_count >= self.config.success_threshold:
                    self._state.state = CircuitState.CLOSED
                    logger.info(
                        "circuit_closed",
                        name=self.name,
                        success_count=self._state.success_count,
                    )

    async def _record_failure(self) -> None:
        """Record a failed call."""
        async with self._lock:
            self._state.failure_count += 1
            self._state.last_failure_time = datetime.utcnow()

            if self._state.state == CircuitState.HALF_OPEN:
                # Any failure in half-open state reopens circuit
                self._state.state = CircuitState.OPEN
                logger.warning(
                    "circuit_reopened",
                    name=self.name,
                )
            elif self._state.failure_count >= self.config.failure_threshold:
                self._state.state = CircuitState.OPEN
                logger.warning(
                    "circuit_opened",
                    name=self.name,
                    failure_count=self._state.failure_count,
                )

    def __call__(self, func: Callable[..., Coroutine[Any, Any, T]]) -> Callable[..., Coroutine[Any, Any, T]]:
        """Decorator to wrap async functions with circuit breaker."""
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            state = await self._check_state()

            if state == CircuitState.OPEN:
                raise CircuitOpenError(
                    f"Circuit '{self.name}' is open, request blocked"
                )

            if state == CircuitState.HALF_OPEN:
                async with self._lock:
                    if self._state.half_open_calls >= self.config.half_open_max_calls:
                        raise CircuitOpenError(
                            f"Circuit '{self.name}' half-open call limit reached"
                        )
                    self._state.half_open_calls += 1

            try:
                result = await func(*args, **kwargs)
                await self._record_success()
                return result
            except Exception as e:
                await self._record_failure()
                raise

        return wrapper

    def reset(self) -> None:
        """Manually reset circuit breaker to closed state."""
        self._state = CircuitBreakerState()
        logger.info("circuit_reset", name=self.name)


class CircuitOpenError(Exception):
    """Raised when circuit breaker is open."""
    pass


# ============================================================================
# Retry Decorator with Exponential Backoff (Phase 1.5)
# ============================================================================

@dataclass
class RetryConfig:
    """Configuration for retry behavior."""
    max_retries: int = 3
    base_delay: float = 1.0  # Initial delay in seconds
    max_delay: float = 60.0  # Maximum delay cap
    exponential_base: float = 2.0  # Multiplier for exponential backoff
    jitter: bool = True  # Add randomization to prevent thundering herd
    retryable_exceptions: tuple = (Exception,)  # Exceptions to retry on


def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    retryable_exceptions: tuple = (Exception,),
) -> Callable:
    """
    Decorator for retry with exponential backoff.

    Implements the standard exponential backoff pattern:
    delay = min(base_delay * (exponential_base ** attempt), max_delay)

    With jitter (recommended to prevent thundering herd):
    delay = random.uniform(0, calculated_delay)

    Example:
        @retry_with_backoff(
            max_retries=3,
            base_delay=1.0,
            retryable_exceptions=(RateLimitError, TimeoutError)
        )
        async def call_llm(prompt: str) -> str:
            return await llm_client.complete(prompt)

    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay in seconds
        max_delay: Maximum delay cap in seconds
        exponential_base: Multiplier for each retry
        jitter: If True, adds randomization to delay
        retryable_exceptions: Tuple of exception types to retry on
    """
    config = RetryConfig(
        max_retries=max_retries,
        base_delay=base_delay,
        max_delay=max_delay,
        exponential_base=exponential_base,
        jitter=jitter,
        retryable_exceptions=retryable_exceptions,
    )

    def decorator(func: Callable[..., Coroutine[Any, Any, T]]) -> Callable[..., Coroutine[Any, Any, T]]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            last_exception: Optional[Exception] = None

            for attempt in range(config.max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except config.retryable_exceptions as e:
                    last_exception = e

                    if attempt >= config.max_retries:
                        logger.error(
                            "retry_exhausted",
                            function=func.__name__,
                            attempts=attempt + 1,
                            error=str(e),
                        )
                        raise

                    # Calculate delay with exponential backoff
                    delay = min(
                        config.base_delay * (config.exponential_base ** attempt),
                        config.max_delay,
                    )

                    # Add jitter to prevent thundering herd
                    if config.jitter:
                        delay = random.uniform(0, delay)

                    logger.warning(
                        "retry_attempt",
                        function=func.__name__,
                        attempt=attempt + 1,
                        max_retries=config.max_retries,
                        delay_seconds=round(delay, 2),
                        error=str(e),
                    )

                    await asyncio.sleep(delay)

            # Should never reach here, but satisfy type checker
            if last_exception:
                raise last_exception
            raise RuntimeError("Unexpected retry state")

        return wrapper
    return decorator


# ============================================================================
# Timeout Wrapper
# ============================================================================

def timeout(seconds: float) -> Callable:
    """
    Decorator to add timeout to async functions.

    Example:
        @timeout(30.0)
        async def call_llm(prompt: str) -> str:
            return await llm_client.complete(prompt)

        try:
            result = await call_llm("Hello")
        except asyncio.TimeoutError:
            # Handle timeout
            pass
    """
    def decorator(func: Callable[..., Coroutine[Any, Any, T]]) -> Callable[..., Coroutine[Any, Any, T]]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            return await asyncio.wait_for(func(*args, **kwargs), timeout=seconds)
        return wrapper
    return decorator


# ============================================================================
# Combined Pattern: Retry with Circuit Breaker
# ============================================================================

def resilient_call(
    circuit_breaker_name: str,
    max_retries: int = 3,
    base_delay: float = 1.0,
    timeout_seconds: Optional[float] = None,
    retryable_exceptions: tuple = (Exception,),
) -> Callable:
    """
    Combines retry, circuit breaker, and timeout in one decorator.

    This is the recommended pattern for LLM calls in production.

    Example:
        @resilient_call(
            circuit_breaker_name="openai",
            max_retries=3,
            timeout_seconds=30.0,
            retryable_exceptions=(RateLimitError, TimeoutError)
        )
        async def call_openai(prompt: str) -> str:
            return await openai_client.complete(prompt)
    """
    def decorator(func: Callable[..., Coroutine[Any, Any, T]]) -> Callable[..., Coroutine[Any, Any, T]]:
        # Get or create circuit breaker
        breaker = CircuitBreaker.get(circuit_breaker_name)
        if not breaker:
            breaker = CircuitBreaker(circuit_breaker_name)

        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            # Check circuit breaker first
            state = await breaker._check_state()
            if state == CircuitState.OPEN:
                raise CircuitOpenError(f"Circuit '{circuit_breaker_name}' is open")

            last_exception: Optional[Exception] = None

            for attempt in range(max_retries + 1):
                try:
                    # Apply timeout if specified
                    if timeout_seconds:
                        result = await asyncio.wait_for(
                            func(*args, **kwargs),
                            timeout=timeout_seconds
                        )
                    else:
                        result = await func(*args, **kwargs)

                    await breaker._record_success()
                    return result

                except retryable_exceptions as e:
                    last_exception = e
                    await breaker._record_failure()

                    # Check if circuit opened
                    if breaker.is_open:
                        raise CircuitOpenError(
                            f"Circuit '{circuit_breaker_name}' opened after {attempt + 1} failures"
                        )

                    if attempt >= max_retries:
                        raise

                    delay = min(base_delay * (2 ** attempt), 60.0)
                    delay = random.uniform(0, delay)

                    logger.warning(
                        "resilient_retry",
                        function=func.__name__,
                        circuit=circuit_breaker_name,
                        attempt=attempt + 1,
                        delay_seconds=round(delay, 2),
                    )

                    await asyncio.sleep(delay)

            if last_exception:
                raise last_exception
            raise RuntimeError("Unexpected state")

        return wrapper
    return decorator
