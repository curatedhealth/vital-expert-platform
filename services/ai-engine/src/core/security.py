"""
VITAL Platform - Security Utilities Module

Production-grade security utilities for:
1. Input sanitization (SQL injection, XSS prevention)
2. Rate limiting
3. Input validation
4. Tenant isolation helpers
5. Error sanitization (prevent internal error exposure)

HIPAA Compliance: PHI data protection patterns included.

December 11, 2025
"""

from __future__ import annotations

import re
import html
import uuid
import hashlib
from typing import Any, Dict, List, Optional, Tuple, Union
from datetime import datetime, timezone
from functools import wraps
import structlog

logger = structlog.get_logger(__name__)


# =============================================================================
# Input Sanitization (SQL Injection / XSS Prevention)
# =============================================================================

class InputSanitizer:
    """
    Production-grade input sanitization for user-provided content.

    Protects against:
    - SQL injection
    - XSS attacks
    - Command injection
    - Path traversal
    - Unicode exploits
    """

    # Dangerous SQL patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|GRANT|REVOKE)\b)",
        r"(--)|(;)|(/\*)|(\*/)",
        r"(\b(OR|AND)\b\s*[\'\"]?\s*\d+\s*=\s*\d+)",
        r"(\bWHERE\b\s+\d+\s*=\s*\d+)",
        r"('|\"|;|--|/\*|\*/|@@|@|char|nchar|varchar|nvarchar|alter|begin|cast|convert|create|cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|select|sys|sysobjects|syscolumns|table|update)",
    ]

    # Dangerous HTML/JS patterns for XSS
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
        r"<link[^>]*>",
        r"expression\s*\(",
        r"url\s*\(",
    ]

    # Path traversal patterns
    PATH_TRAVERSAL_PATTERNS = [
        r"\.\./",
        r"\.\.\\",
        r"%2e%2e%2f",
        r"%2e%2e/",
        r"\.%2e/",
        r"%2e\./",
    ]

    @classmethod
    def sanitize_text(
        cls,
        text: str,
        max_length: int = 10000,
        allow_html: bool = False,
        strip_sql: bool = True,
    ) -> str:
        """
        Sanitize user text input.

        Args:
            text: Raw user input
            max_length: Maximum allowed length
            allow_html: If False, escape all HTML
            strip_sql: If True, remove SQL-like patterns

        Returns:
            Sanitized text safe for storage and display
        """
        if not text:
            return ""

        # Truncate to max length
        sanitized = str(text)[:max_length]

        # Normalize unicode to prevent homograph attacks
        import unicodedata
        sanitized = unicodedata.normalize('NFKC', sanitized)

        # Remove null bytes
        sanitized = sanitized.replace('\x00', '')

        # Strip SQL injection patterns if requested
        if strip_sql:
            for pattern in cls.SQL_INJECTION_PATTERNS:
                sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)

        # HTML escape if not allowing HTML
        if not allow_html:
            sanitized = html.escape(sanitized)
        else:
            # Even with HTML allowed, strip dangerous patterns
            for pattern in cls.XSS_PATTERNS:
                sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE | re.DOTALL)

        # Strip path traversal
        for pattern in cls.PATH_TRAVERSAL_PATTERNS:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)

        return sanitized.strip()

    @classmethod
    def sanitize_identifier(cls, identifier: str, max_length: int = 100) -> str:
        """
        Sanitize identifiers (IDs, slugs, etc.) - alphanumeric + hyphens + underscores only.

        Args:
            identifier: Raw identifier
            max_length: Maximum allowed length

        Returns:
            Sanitized identifier
        """
        if not identifier:
            return ""

        # Only allow alphanumeric, hyphens, underscores
        sanitized = re.sub(r'[^a-zA-Z0-9\-_]', '', str(identifier))
        return sanitized[:max_length]

    @classmethod
    def sanitize_uuid(cls, value: str) -> Optional[str]:
        """
        Validate and sanitize UUID strings.

        Args:
            value: Potential UUID string

        Returns:
            Valid UUID string or None
        """
        if not value:
            return None

        try:
            # Attempt to parse as UUID
            parsed = uuid.UUID(str(value).strip())
            return str(parsed)
        except (ValueError, AttributeError):
            logger.warning("invalid_uuid_provided", value=str(value)[:50])
            return None

    @classmethod
    def sanitize_email(cls, email: str) -> Optional[str]:
        """
        Validate and sanitize email addresses.

        Args:
            email: Raw email input

        Returns:
            Valid email or None
        """
        if not email:
            return None

        email = str(email).strip().lower()

        # Basic email pattern
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(pattern, email):
            return email[:254]  # Max email length per RFC

        return None

    @classmethod
    def sanitize_json(cls, data: Dict[str, Any], max_depth: int = 10) -> Dict[str, Any]:
        """
        Recursively sanitize JSON/dict values.

        Args:
            data: Dictionary to sanitize
            max_depth: Maximum recursion depth

        Returns:
            Sanitized dictionary
        """
        if max_depth <= 0:
            return {}

        sanitized = {}

        for key, value in data.items():
            # Sanitize key
            safe_key = cls.sanitize_identifier(str(key), max_length=100)
            if not safe_key:
                continue

            # Sanitize value based on type
            if isinstance(value, str):
                sanitized[safe_key] = cls.sanitize_text(value)
            elif isinstance(value, dict):
                sanitized[safe_key] = cls.sanitize_json(value, max_depth - 1)
            elif isinstance(value, list):
                sanitized[safe_key] = [
                    cls.sanitize_text(str(v)) if isinstance(v, str)
                    else cls.sanitize_json(v, max_depth - 1) if isinstance(v, dict)
                    else v
                    for v in value[:100]  # Limit list length
                ]
            else:
                # Numbers, bools, None - pass through
                sanitized[safe_key] = value

        return sanitized


# =============================================================================
# Error Sanitization (Prevent Internal Error Exposure)
# =============================================================================

class ErrorSanitizer:
    """
    Sanitize error messages for client exposure.

    Prevents leaking:
    - Stack traces
    - Internal paths
    - Database details
    - Configuration values
    """

    # Patterns to redact from error messages
    SENSITIVE_PATTERNS = [
        (r'/Users/[^/]+/', '/[REDACTED]/'),
        (r'/home/[^/]+/', '/[REDACTED]/'),
        (r'password["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'password=***'),
        (r'api_key["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'api_key=***'),
        (r'secret["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'secret=***'),
        (r'token["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'token=***'),
        (r'postgresql://[^@]+@', 'postgresql://***@'),
        (r'mysql://[^@]+@', 'mysql://***@'),
        (r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', '[IP_REDACTED]'),
    ]

    # Generic error messages for common error types
    GENERIC_MESSAGES = {
        'database': 'A database error occurred. Please try again.',
        'authentication': 'Authentication failed. Please check your credentials.',
        'authorization': 'You do not have permission to perform this action.',
        'validation': 'Invalid input provided. Please check your request.',
        'not_found': 'The requested resource was not found.',
        'rate_limit': 'Too many requests. Please wait and try again.',
        'internal': 'An internal error occurred. Please try again later.',
    }

    @classmethod
    def sanitize_error(
        cls,
        error: Union[str, Exception],
        error_type: str = 'internal',
        include_reference_id: bool = True,
    ) -> Tuple[str, str]:
        """
        Sanitize an error for client exposure.

        Args:
            error: The original error
            error_type: Category of error for generic message selection
            include_reference_id: Whether to include a reference ID for support

        Returns:
            Tuple of (sanitized_message, reference_id)
        """
        reference_id = str(uuid.uuid4())[:8]

        # Log the full error internally
        logger.error(
            "error_sanitized_for_client",
            error_type=error_type,
            reference_id=reference_id,
            original_error=str(error)[:500],
        )

        # Get generic message
        generic_message = cls.GENERIC_MESSAGES.get(error_type, cls.GENERIC_MESSAGES['internal'])

        if include_reference_id:
            sanitized = f"{generic_message} Reference: {reference_id}"
        else:
            sanitized = generic_message

        return sanitized, reference_id

    @classmethod
    def redact_sensitive(cls, text: str) -> str:
        """
        Redact sensitive information from text.

        Args:
            text: Text that may contain sensitive info

        Returns:
            Text with sensitive info redacted
        """
        if not text:
            return ""

        redacted = str(text)
        for pattern, replacement in cls.SENSITIVE_PATTERNS:
            redacted = re.sub(pattern, replacement, redacted, flags=re.IGNORECASE)

        return redacted


# =============================================================================
# Tenant Isolation Helpers
# =============================================================================

class TenantIsolation:
    """
    Helpers for ensuring proper tenant isolation in multi-tenant queries.
    """

    @staticmethod
    def validate_tenant_id(tenant_id: Optional[str]) -> str:
        """
        Validate tenant ID is present and valid.

        Args:
            tenant_id: Tenant ID to validate

        Returns:
            Valid tenant ID

        Raises:
            ValueError: If tenant ID is invalid
        """
        if not tenant_id:
            raise ValueError("Tenant ID is required for this operation")

        sanitized = InputSanitizer.sanitize_uuid(tenant_id)
        if not sanitized:
            raise ValueError("Invalid tenant ID format")

        return sanitized

    @staticmethod
    def validate_tenant_access(
        resource_tenant_id: Optional[str],
        request_tenant_id: str,
        resource_name: str = "resource",
    ) -> None:
        """
        Verify request tenant matches resource tenant.

        Args:
            resource_tenant_id: Tenant ID of the resource
            request_tenant_id: Tenant ID from the request
            resource_name: Name of resource for error message

        Raises:
            PermissionError: If tenant IDs don't match
        """
        if resource_tenant_id and resource_tenant_id != request_tenant_id:
            logger.warning(
                "tenant_isolation_violation_attempt",
                resource_tenant=resource_tenant_id[:8] if resource_tenant_id else None,
                request_tenant=request_tenant_id[:8] if request_tenant_id else None,
                resource_name=resource_name,
            )
            raise PermissionError(f"Access denied to {resource_name}")

    @staticmethod
    def build_tenant_filter(tenant_id: str, table_alias: str = "") -> str:
        """
        Build SQL WHERE clause for tenant filtering.

        Args:
            tenant_id: Validated tenant ID
            table_alias: Optional table alias prefix

        Returns:
            SQL WHERE clause fragment
        """
        prefix = f"{table_alias}." if table_alias else ""
        # Use parameterized query - this returns the clause structure
        return f"{prefix}tenant_id = %s"


# =============================================================================
# Rate Limiting (Production Redis + Development In-Memory)
# =============================================================================

from collections import defaultdict
from threading import Lock
import os

# Redis availability flag (set during initialization)
_REDIS_AVAILABLE: Optional[bool] = None
_redis_client: Optional[Any] = None


def _get_redis_client() -> Optional[Any]:
    """
    Get Redis client singleton with lazy initialization.

    Returns:
        Redis client or None if unavailable
    """
    global _REDIS_AVAILABLE, _redis_client

    if _REDIS_AVAILABLE is False:
        return None

    if _redis_client is not None:
        return _redis_client

    redis_url = os.getenv("REDIS_URL")

    if not redis_url:
        # Try local Redis
        redis_url = "redis://localhost:6379/0"

    try:
        import redis
        client = redis.from_url(
            redis_url,
            socket_timeout=2,
            socket_connect_timeout=2,
            retry_on_timeout=True,
            decode_responses=True,
        )
        # Test connection
        client.ping()
        _redis_client = client
        _REDIS_AVAILABLE = True
        logger.info("redis_rate_limiter_connected", url=redis_url[:30] + "...")
        return client
    except Exception as e:
        _REDIS_AVAILABLE = False
        logger.warning(
            "redis_rate_limiter_unavailable_fallback_to_memory",
            error=str(e)[:100],
        )
        return None


class RedisRateLimiter:
    """
    Production-grade Redis-based rate limiter for multi-instance deployments.

    Features:
    - Sliding window algorithm (more accurate than fixed windows)
    - Atomic operations with Lua scripts
    - Automatic fallback to in-memory if Redis unavailable
    - Per-minute and per-hour limits
    - TTL-based cleanup (no manual cleanup needed)

    Suitable for:
    - Multi-instance/horizontally scaled deployments
    - Kubernetes/Docker Swarm environments
    - Load-balanced configurations
    """

    # Lua script for atomic sliding window rate limiting
    SLIDING_WINDOW_SCRIPT = """
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])

    -- Remove old entries outside the window
    redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

    -- Count current entries
    local count = redis.call('ZCARD', key)

    if count < limit then
        -- Add new entry with current timestamp as score
        redis.call('ZADD', key, now, now .. ':' .. math.random(1000000))
        -- Set TTL for automatic cleanup
        redis.call('EXPIRE', key, window)
        return {1, limit - count - 1}  -- allowed, remaining
    else
        return {0, 0}  -- denied, remaining
    end
    """

    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
    ):
        """
        Initialize Redis rate limiter.

        Args:
            requests_per_minute: Maximum requests per minute per identifier
            requests_per_hour: Maximum requests per hour per identifier
        """
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self._script_sha: Optional[str] = None
        self._fallback = InMemoryRateLimiter(requests_per_minute, requests_per_hour)

    def _get_script_sha(self, client) -> str:
        """Load Lua script and cache SHA."""
        if self._script_sha is None:
            self._script_sha = client.script_load(self.SLIDING_WINDOW_SCRIPT)
        return self._script_sha

    def check_rate_limit(self, identifier: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if request is within rate limits using Redis sliding window.

        Args:
            identifier: Unique identifier (user ID, IP, tenant_id, etc.)

        Returns:
            Tuple of (allowed, metadata)
        """
        client = _get_redis_client()

        if client is None:
            # Fallback to in-memory rate limiting
            return self._fallback.check_rate_limit(identifier)

        now = datetime.now(timezone.utc).timestamp()

        try:
            script_sha = self._get_script_sha(client)

            # Check minute limit
            minute_key = f"ratelimit:minute:{identifier}"
            minute_result = client.evalsha(
                script_sha, 1, minute_key,
                str(now), str(60), str(self.requests_per_minute)
            )
            minute_allowed, minute_remaining = minute_result

            if not minute_allowed:
                return False, {
                    "reason": "minute_limit_exceeded",
                    "limit": self.requests_per_minute,
                    "remaining": 0,
                    "reset_in_seconds": 60,
                    "backend": "redis",
                }

            # Check hour limit
            hour_key = f"ratelimit:hour:{identifier}"
            hour_result = client.evalsha(
                script_sha, 1, hour_key,
                str(now), str(3600), str(self.requests_per_hour)
            )
            hour_allowed, hour_remaining = hour_result

            if not hour_allowed:
                return False, {
                    "reason": "hour_limit_exceeded",
                    "limit": self.requests_per_hour,
                    "remaining": 0,
                    "reset_in_seconds": 3600,
                    "backend": "redis",
                }

            return True, {
                "remaining_minute": minute_remaining,
                "remaining_hour": hour_remaining,
                "backend": "redis",
            }

        except Exception as e:
            logger.warning(
                "redis_rate_limit_error_fallback_to_memory",
                error=str(e)[:100],
                identifier=identifier[:20] if identifier else "unknown",
            )
            # Fallback to in-memory on Redis errors
            return self._fallback.check_rate_limit(identifier)

    def get_current_usage(self, identifier: str) -> Dict[str, Any]:
        """
        Get current rate limit usage for an identifier.

        Args:
            identifier: Unique identifier

        Returns:
            Current usage statistics
        """
        client = _get_redis_client()

        if client is None:
            return {"backend": "memory", "available": False}

        try:
            now = datetime.now(timezone.utc).timestamp()

            minute_key = f"ratelimit:minute:{identifier}"
            hour_key = f"ratelimit:hour:{identifier}"

            # Count entries in current windows
            minute_count = client.zcount(minute_key, now - 60, now)
            hour_count = client.zcount(hour_key, now - 3600, now)

            return {
                "minute_used": minute_count,
                "minute_limit": self.requests_per_minute,
                "minute_remaining": max(0, self.requests_per_minute - minute_count),
                "hour_used": hour_count,
                "hour_limit": self.requests_per_hour,
                "hour_remaining": max(0, self.requests_per_hour - hour_count),
                "backend": "redis",
            }
        except Exception as e:
            logger.warning("redis_usage_check_error", error=str(e)[:100])
            return {"backend": "redis", "error": str(e)[:100]}

    def reset_limits(self, identifier: str) -> bool:
        """
        Reset rate limits for an identifier (admin use only).

        Args:
            identifier: Unique identifier

        Returns:
            True if successful
        """
        client = _get_redis_client()

        if client is None:
            return False

        try:
            minute_key = f"ratelimit:minute:{identifier}"
            hour_key = f"ratelimit:hour:{identifier}"
            client.delete(minute_key, hour_key)
            logger.info("rate_limits_reset", identifier=identifier[:20])
            return True
        except Exception as e:
            logger.error("rate_limit_reset_error", error=str(e)[:100])
            return False


class InMemoryRateLimiter:
    """
    Simple in-memory rate limiter for development/testing.

    For production, use Redis-based rate limiting (see RateLimiterMiddleware).
    """

    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
    ):
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self._minute_counts: Dict[str, List[float]] = defaultdict(list)
        self._hour_counts: Dict[str, List[float]] = defaultdict(list)
        self._lock = Lock()

    def check_rate_limit(self, identifier: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if request is within rate limits.

        Args:
            identifier: Unique identifier (user ID, IP, etc.)

        Returns:
            Tuple of (allowed, metadata)
        """
        now = datetime.now(timezone.utc).timestamp()
        minute_ago = now - 60
        hour_ago = now - 3600

        with self._lock:
            # Clean old entries
            self._minute_counts[identifier] = [
                t for t in self._minute_counts[identifier] if t > minute_ago
            ]
            self._hour_counts[identifier] = [
                t for t in self._hour_counts[identifier] if t > hour_ago
            ]

            minute_count = len(self._minute_counts[identifier])
            hour_count = len(self._hour_counts[identifier])

            # Check limits
            if minute_count >= self.requests_per_minute:
                return False, {
                    "reason": "minute_limit_exceeded",
                    "limit": self.requests_per_minute,
                    "current": minute_count,
                    "reset_in_seconds": 60,
                }

            if hour_count >= self.requests_per_hour:
                return False, {
                    "reason": "hour_limit_exceeded",
                    "limit": self.requests_per_hour,
                    "current": hour_count,
                    "reset_in_seconds": 3600,
                }

            # Record request
            self._minute_counts[identifier].append(now)
            self._hour_counts[identifier].append(now)

            return True, {
                "remaining_minute": self.requests_per_minute - minute_count - 1,
                "remaining_hour": self.requests_per_hour - hour_count - 1,
            }


# =============================================================================
# Decorators for Security
# =============================================================================

def require_tenant(func):
    """
    Decorator to require valid tenant_id parameter.

    Usage:
        @require_tenant
        async def my_endpoint(tenant_id: str, ...):
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        tenant_id = kwargs.get('tenant_id') or kwargs.get('x_tenant_id')
        if not tenant_id:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Tenant ID required")

        try:
            validated = TenantIsolation.validate_tenant_id(tenant_id)
            kwargs['tenant_id'] = validated
        except ValueError as e:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail=str(e))

        return await func(*args, **kwargs)

    return wrapper


def sanitize_inputs(*input_names: str):
    """
    Decorator to sanitize specified input parameters.

    Usage:
        @sanitize_inputs('message', 'title')
        async def my_endpoint(message: str, title: str, ...):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for name in input_names:
                if name in kwargs and isinstance(kwargs[name], str):
                    kwargs[name] = InputSanitizer.sanitize_text(kwargs[name])
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# =============================================================================
# Global Rate Limiter (Singleton)
# =============================================================================

# Type alias for rate limiter (can be either Redis or InMemory)
RateLimiterType = Union[RedisRateLimiter, InMemoryRateLimiter]

# Global rate limiter instance for streaming endpoints
_global_rate_limiter: Optional[RateLimiterType] = None


def get_rate_limiter(
    requests_per_minute: int = 30,
    requests_per_hour: int = 500,
    force_memory: bool = False,
) -> RateLimiterType:
    """
    Get or create the global rate limiter instance.

    Production Behavior:
    - Uses Redis-based rate limiting by default (supports multi-instance)
    - Automatically falls back to in-memory if Redis unavailable
    - Set RATE_LIMIT_USE_REDIS=false to force in-memory mode

    Args:
        requests_per_minute: Max requests per minute per identifier
        requests_per_hour: Max requests per hour per identifier
        force_memory: Force in-memory rate limiting (for testing)

    Returns:
        Rate limiter instance (RedisRateLimiter or InMemoryRateLimiter)

    Environment Variables:
        REDIS_URL: Redis connection URL (enables Redis mode)
        RATE_LIMIT_USE_REDIS: Set to "false" to disable Redis rate limiting
    """
    global _global_rate_limiter

    if _global_rate_limiter is None:
        # Check if Redis should be used
        use_redis = os.getenv("RATE_LIMIT_USE_REDIS", "true").lower() == "true"

        if force_memory or not use_redis:
            _global_rate_limiter = InMemoryRateLimiter(
                requests_per_minute=requests_per_minute,
                requests_per_hour=requests_per_hour,
            )
            logger.info(
                "rate_limiter_initialized",
                backend="memory",
                requests_per_minute=requests_per_minute,
                requests_per_hour=requests_per_hour,
            )
        else:
            # Use Redis-based rate limiter (with automatic fallback)
            _global_rate_limiter = RedisRateLimiter(
                requests_per_minute=requests_per_minute,
                requests_per_hour=requests_per_hour,
            )
            logger.info(
                "rate_limiter_initialized",
                backend="redis_with_fallback",
                requests_per_minute=requests_per_minute,
                requests_per_hour=requests_per_hour,
            )

    return _global_rate_limiter


def get_rate_limiter_status() -> Dict[str, Any]:
    """
    Get current rate limiter status and backend information.

    Returns:
        Status dictionary with backend type and availability
    """
    limiter = get_rate_limiter()
    backend = "redis" if isinstance(limiter, RedisRateLimiter) else "memory"

    status = {
        "backend_type": backend,
        "requests_per_minute": limiter.requests_per_minute,
        "requests_per_hour": limiter.requests_per_hour,
    }

    if backend == "redis":
        client = _get_redis_client()
        status["redis_available"] = client is not None
        if client:
            try:
                status["redis_ping"] = client.ping()
            except Exception:
                status["redis_ping"] = False
    else:
        status["redis_available"] = False

    return status


def check_rate_limit_or_raise(
    identifier: str,
    endpoint: str = "unknown",
) -> Dict[str, Any]:
    """
    Check rate limit and raise HTTPException if exceeded.

    Args:
        identifier: Unique identifier (tenant_id, user_id, or IP)
        endpoint: Name of endpoint for logging

    Returns:
        Rate limit metadata (remaining counts)

    Raises:
        HTTPException: If rate limit exceeded
    """
    from fastapi import HTTPException

    rate_limiter = get_rate_limiter()
    allowed, metadata = rate_limiter.check_rate_limit(identifier)

    if not allowed:
        reason = metadata.get("reason", "rate_limit_exceeded")
        reset_in = metadata.get("reset_in_seconds", 60)

        logger.warning(
            "rate_limit_exceeded",
            identifier=identifier[:20] if identifier else "unknown",
            endpoint=endpoint,
            reason=reason,
            reset_in=reset_in,
        )

        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {reset_in} seconds.",
            headers={
                "Retry-After": str(reset_in),
                "X-RateLimit-Limit": str(metadata.get("limit", 0)),
                "X-RateLimit-Remaining": "0",
            },
        )

    return metadata
