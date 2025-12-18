"""
Resilience patterns for VITAL Path AI Services
Implements retry logic, circuit breakers, and timeout handling for external services
"""

import asyncio
from typing import Any, Callable, Optional, TypeVar, Union
from functools import wraps
import structlog
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    after_log
)
from circuitbreaker import circuit
from datetime import datetime, timedelta

logger = structlog.get_logger()

T = TypeVar('T')


# Circuit breaker configurations for different services
class CircuitBreakerConfig:
    """Circuit breaker configuration for external services"""
    
    # OpenAI API
    OPENAI = {
        "failure_threshold": 5,  # Open circuit after 5 failures
        "recovery_timeout": 60,  # Try again after 60 seconds
        "expected_exception": Exception
    }
    
    # Supabase Database
    SUPABASE = {
        "failure_threshold": 3,
        "recovery_timeout": 30,
        "expected_exception": Exception
    }
    
    # Pinecone Vector DB
    PINECONE = {
        "failure_threshold": 3,
        "recovery_timeout": 45,
        "expected_exception": Exception
    }
    
    # Redis Cache
    REDIS = {
        "failure_threshold": 2,
        "recovery_timeout": 20,
        "expected_exception": Exception
    }


class TimeoutConfig:
    """Timeout configuration for external services"""
    
    # API call timeouts (seconds)
    OPENAI_TIMEOUT = 30.0
    SUPABASE_TIMEOUT = 10.0
    PINECONE_TIMEOUT = 15.0
    REDIS_TIMEOUT = 5.0
    EMBEDDING_TIMEOUT = 20.0
    RAG_SEARCH_TIMEOUT = 25.0


# Retry decorators with exponential backoff

def retry_openai(max_attempts: int = 3):
    """
    Retry decorator for OpenAI API calls.
    
    Features:
    - Exponential backoff: 1s, 2s, 4s
    - Retry on rate limit, timeout, and API errors
    - Detailed logging
    
    Args:
        max_attempts: Maximum number of retry attempts
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((
            # OpenAI specific errors (adapt to your OpenAI client version)
            TimeoutError,
            ConnectionError,
            Exception  # Catch-all for now
        )),
        before_sleep=before_sleep_log(logger, logger.info),
        after=after_log(logger, logger.info)
    )


def retry_database(max_attempts: int = 3):
    """
    Retry decorator for database operations.
    
    Features:
    - Exponential backoff: 0.5s, 1s, 2s
    - Retry on connection errors and timeouts
    - Faster retry for transient DB issues
    
    Args:
        max_attempts: Maximum number of retry attempts
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=5),
        retry=retry_if_exception_type((
            ConnectionError,
            TimeoutError,
            OSError
        )),
        before_sleep=before_sleep_log(logger, logger.warning),
        after=after_log(logger, logger.info)
    )


def retry_vector_db(max_attempts: int = 3):
    """
    Retry decorator for vector database operations (Pinecone).
    
    Args:
        max_attempts: Maximum number of retry attempts
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        retry=retry_if_exception_type((
            ConnectionError,
            TimeoutError,
            Exception
        )),
        before_sleep=before_sleep_log(logger, logger.warning),
        after=after_log(logger, logger.info)
    )


# Circuit breaker decorators

@circuit(
    failure_threshold=CircuitBreakerConfig.OPENAI["failure_threshold"],
    recovery_timeout=CircuitBreakerConfig.OPENAI["recovery_timeout"],
    expected_exception=CircuitBreakerConfig.OPENAI["expected_exception"]
)
@retry_openai(max_attempts=3)
async def call_openai_with_resilience(
    llm: Any,
    messages: list,
    timeout: float = TimeoutConfig.OPENAI_TIMEOUT,
    **kwargs
) -> Any:
    """
    Call OpenAI API with retry and circuit breaker.
    
    This function:
    1. Wraps OpenAI API calls with circuit breaker
    2. Retries on failures with exponential backoff
    3. Applies timeout to prevent hanging
    4. Logs all attempts and failures
    
    Args:
        llm: LangChain LLM instance
        messages: List of messages for the API
        timeout: Timeout in seconds
        **kwargs: Additional arguments for the LLM
        
    Returns:
        LLM response
        
    Raises:
        Exception: If all retries fail or circuit is open
    """
    try:
        logger.debug("Calling OpenAI API", timeout=timeout)
        
        # Apply timeout to prevent hanging
        response = await asyncio.wait_for(
            llm.ainvoke(messages, **kwargs),
            timeout=timeout
        )
        
        logger.debug("OpenAI API call successful")
        return response
        
    except asyncio.TimeoutError as e:
        logger.error("OpenAI API timeout", timeout=timeout, error=str(e))
        raise TimeoutError(f"OpenAI API call timed out after {timeout}s") from e
    
    except Exception as e:
        logger.error("OpenAI API error", error=str(e), error_type=type(e).__name__)
        raise


@circuit(
    failure_threshold=CircuitBreakerConfig.SUPABASE["failure_threshold"],
    recovery_timeout=CircuitBreakerConfig.SUPABASE["recovery_timeout"]
)
@retry_database(max_attempts=3)
async def query_database_with_resilience(
    query_func: Callable,
    *args,
    timeout: float = TimeoutConfig.SUPABASE_TIMEOUT,
    **kwargs
) -> Any:
    """
    Execute database query with retry and circuit breaker.
    
    Args:
        query_func: Database query function to execute
        *args: Positional arguments for query_func
        timeout: Timeout in seconds
        **kwargs: Keyword arguments for query_func
        
    Returns:
        Query result
        
    Raises:
        Exception: If all retries fail or circuit is open
    """
    try:
        logger.debug("Executing database query", timeout=timeout)
        
        # Apply timeout
        result = await asyncio.wait_for(
            query_func(*args, **kwargs),
            timeout=timeout
        )
        
        logger.debug("Database query successful")
        return result
        
    except asyncio.TimeoutError as e:
        logger.error("Database query timeout", timeout=timeout, error=str(e))
        raise TimeoutError(f"Database query timed out after {timeout}s") from e
    
    except Exception as e:
        logger.error("Database query error", error=str(e), error_type=type(e).__name__)
        raise


@circuit(
    failure_threshold=CircuitBreakerConfig.PINECONE["failure_threshold"],
    recovery_timeout=CircuitBreakerConfig.PINECONE["recovery_timeout"]
)
@retry_vector_db(max_attempts=3)
async def search_vector_db_with_resilience(
    search_func: Callable,
    *args,
    timeout: float = TimeoutConfig.PINECONE_TIMEOUT,
    **kwargs
) -> Any:
    """
    Execute vector database search with retry and circuit breaker.
    
    Args:
        search_func: Vector search function to execute
        *args: Positional arguments for search_func
        timeout: Timeout in seconds
        **kwargs: Keyword arguments for search_func
        
    Returns:
        Search results
        
    Raises:
        Exception: If all retries fail or circuit is open
    """
    try:
        logger.debug("Executing vector database search", timeout=timeout)
        
        # Apply timeout
        result = await asyncio.wait_for(
            search_func(*args, **kwargs),
            timeout=timeout
        )
        
        logger.debug("Vector database search successful")
        return result
        
    except asyncio.TimeoutError as e:
        logger.error("Vector database search timeout", timeout=timeout, error=str(e))
        raise TimeoutError(f"Vector search timed out after {timeout}s") from e
    
    except Exception as e:
        logger.error("Vector database search error", error=str(e), error_type=type(e).__name__)
        raise


async def generate_embedding_with_resilience(
    embedding_func: Callable,
    text: str,
    timeout: float = TimeoutConfig.EMBEDDING_TIMEOUT
) -> list:
    """
    Generate embedding with timeout and retry.
    
    Args:
        embedding_func: Embedding generation function
        text: Text to embed
        timeout: Timeout in seconds
        
    Returns:
        Embedding vector
        
    Raises:
        TimeoutError: If embedding generation times out
    """
    try:
        logger.debug("Generating embedding", text_length=len(text), timeout=timeout)
        
        # Wrap in retry logic
        @retry_openai(max_attempts=3)
        async def _generate():
            return await asyncio.wait_for(
                embedding_func(text),
                timeout=timeout
            )
        
        result = await _generate()
        logger.debug("Embedding generation successful")
        return result
        
    except asyncio.TimeoutError as e:
        logger.error("Embedding generation timeout", timeout=timeout, error=str(e))
        raise TimeoutError(f"Embedding generation timed out after {timeout}s") from e
    
    except Exception as e:
        logger.error("Embedding generation error", error=str(e), error_type=type(e).__name__)
        raise


# Graceful degradation helpers

async def call_with_fallback(
    primary_func: Callable,
    fallback_func: Optional[Callable] = None,
    fallback_value: Optional[Any] = None,
    *args,
    **kwargs
) -> Any:
    """
    Call function with fallback on failure.
    
    Args:
        primary_func: Primary function to call
        fallback_func: Fallback function if primary fails
        fallback_value: Static fallback value if fallback_func is None
        *args: Arguments for functions
        **kwargs: Keyword arguments for functions
        
    Returns:
        Result from primary or fallback
    """
    try:
        return await primary_func(*args, **kwargs)
    except Exception as e:
        logger.warning(
            "Primary function failed, using fallback",
            error=str(e),
            has_fallback_func=fallback_func is not None,
            has_fallback_value=fallback_value is not None
        )
        
        if fallback_func:
            try:
                return await fallback_func(*args, **kwargs)
            except Exception as fallback_error:
                logger.error("Fallback function also failed", error=str(fallback_error))
                if fallback_value is not None:
                    return fallback_value
                raise
        
        if fallback_value is not None:
            return fallback_value
        
        raise


# Timeout helpers

async def with_timeout(
    coro: Callable,
    timeout: float,
    error_message: Optional[str] = None,
    *args,
    **kwargs
) -> Any:
    """
    Execute coroutine with timeout.
    
    Args:
        coro: Coroutine to execute
        timeout: Timeout in seconds
        error_message: Custom error message
        *args: Arguments for coroutine
        **kwargs: Keyword arguments for coroutine
        
    Returns:
        Coroutine result
        
    Raises:
        TimeoutError: If operation times out
    """
    try:
        return await asyncio.wait_for(coro(*args, **kwargs), timeout=timeout)
    except asyncio.TimeoutError:
        msg = error_message or f"Operation timed out after {timeout}s"
        logger.error("Operation timeout", message=msg, timeout=timeout)
        raise TimeoutError(msg)


# Health check for circuit breakers

def get_circuit_breaker_stats() -> dict:
    """
    Get circuit breaker statistics.
    
    Returns:
        Dictionary with circuit breaker stats
    """
    # This is a placeholder - circuitbreaker library doesn't expose stats easily
    # You may need to track this separately
    return {
        "openai": {
            "state": "closed",  # closed, open, half-open
            "failure_count": 0,
            "last_failure": None
        },
        "supabase": {
            "state": "closed",
            "failure_count": 0,
            "last_failure": None
        },
        "pinecone": {
            "state": "closed",
            "failure_count": 0,
            "last_failure": None
        }
    }


# Alias for backward compatibility
async def timeout_handler(coro, timeout: float = 300.0, timeout_message: str = "Operation timed out") -> Any:
    """
    Alias for with_timeout function - for backward compatibility.
    
    Args:
        coro: Coroutine or awaitable to execute
        timeout: Timeout in seconds (default: 300s / 5 minutes)
        timeout_message: Error message if timeout occurs
        
    Returns:
        Result of the coroutine
        
    Raises:
        asyncio.TimeoutError: If operation exceeds timeout
    """
    import asyncio
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        raise asyncio.TimeoutError(timeout_message)


# Alias for backwards compatibility
CircuitBreaker = CircuitBreakerConfig
