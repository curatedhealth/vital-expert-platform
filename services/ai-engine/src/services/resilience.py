"""
Redirect module for backwards compatibility.
The actual implementation is in services.shared.resilience.
"""

from services.shared.resilience import (
    CircuitBreakerConfig,
    CircuitBreaker,
    TimeoutConfig,
    retry_openai,
    retry_database,
    retry_vector_db,
    get_circuit_breaker_stats,
    timeout_handler,
)

__all__ = [
    "CircuitBreakerConfig",
    "CircuitBreaker",
    "TimeoutConfig",
    "retry_openai",
    "retry_database",
    "retry_vector_db",
    "get_circuit_breaker_stats",
    "timeout_handler",
]
