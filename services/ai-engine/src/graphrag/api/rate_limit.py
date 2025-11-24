"""
Rate Limiting Middleware for GraphRAG API
Prevents API abuse and ensures fair resource usage
"""

from typing import Callable
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
from datetime import datetime, timedelta
import structlog

logger = structlog.get_logger()


class RateLimiter:
    """
    Token bucket rate limiter for API endpoints
    
    Features:
    - Per-user rate limiting
    - Per-IP rate limiting (fallback)
    - Configurable limits
    - Redis-ready (currently in-memory)
    """
    
    def __init__(
        self,
        requests_per_minute: int = 10,
        requests_per_hour: int = 100,
        requests_per_day: int = 1000
    ):
        """
        Initialize rate limiter
        
        Args:
            requests_per_minute: Max requests per minute
            requests_per_hour: Max requests per hour
            requests_per_day: Max requests per day
        """
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.requests_per_day = requests_per_day
        
        # In-memory storage (replace with Redis for production)
        self.minute_buckets = defaultdict(list)
        self.hour_buckets = defaultdict(list)
        self.day_buckets = defaultdict(list)
    
    def _clean_old_requests(
        self,
        bucket: dict,
        key: str,
        window_seconds: int
    ):
        """Clean requests older than window"""
        now = time.time()
        cutoff = now - window_seconds
        
        if key in bucket:
            bucket[key] = [ts for ts in bucket[key] if ts > cutoff]
    
    def check_rate_limit(
        self,
        identifier: str,
        endpoint: str = "default"
    ) -> tuple[bool, dict]:
        """
        Check if request is within rate limits
        
        Args:
            identifier: User ID or IP address
            endpoint: API endpoint (for endpoint-specific limits)
            
        Returns:
            Tuple of (allowed, headers)
        """
        key = f"{identifier}:{endpoint}"
        now = time.time()
        
        # Clean old requests
        self._clean_old_requests(self.minute_buckets, key, 60)
        self._clean_old_requests(self.hour_buckets, key, 3600)
        self._clean_old_requests(self.day_buckets, key, 86400)
        
        # Check limits
        minute_count = len(self.minute_buckets[key])
        hour_count = len(self.hour_buckets[key])
        day_count = len(self.day_buckets[key])
        
        # Rate limit headers
        headers = {
            "X-RateLimit-Limit-Minute": str(self.requests_per_minute),
            "X-RateLimit-Remaining-Minute": str(max(0, self.requests_per_minute - minute_count)),
            "X-RateLimit-Limit-Hour": str(self.requests_per_hour),
            "X-RateLimit-Remaining-Hour": str(max(0, self.requests_per_hour - hour_count)),
            "X-RateLimit-Limit-Day": str(self.requests_per_day),
            "X-RateLimit-Remaining-Day": str(max(0, self.requests_per_day - day_count))
        }
        
        # Check if any limit exceeded
        if minute_count >= self.requests_per_minute:
            headers["X-RateLimit-Reset"] = str(int(now) + 60)
            logger.warning(
                "rate_limit_exceeded",
                identifier=identifier,
                limit_type="minute",
                count=minute_count
            )
            return False, headers
        
        if hour_count >= self.requests_per_hour:
            headers["X-RateLimit-Reset"] = str(int(now) + 3600)
            logger.warning(
                "rate_limit_exceeded",
                identifier=identifier,
                limit_type="hour",
                count=hour_count
            )
            return False, headers
        
        if day_count >= self.requests_per_day:
            headers["X-RateLimit-Reset"] = str(int(now) + 86400)
            logger.warning(
                "rate_limit_exceeded",
                identifier=identifier,
                limit_type="day",
                count=day_count
            )
            return False, headers
        
        # Record request
        self.minute_buckets[key].append(now)
        self.hour_buckets[key].append(now)
        self.day_buckets[key].append(now)
        
        return True, headers


# Global rate limiter instance
_rate_limiter = RateLimiter(
    requests_per_minute=10,
    requests_per_hour=100,
    requests_per_day=1000
)


def get_rate_limiter() -> RateLimiter:
    """Get global rate limiter instance"""
    return _rate_limiter


async def rate_limit_middleware(
    request: Request,
    call_next: Callable
) -> Response:
    """
    Rate limiting middleware
    
    Args:
        request: FastAPI request
        call_next: Next middleware/endpoint
        
    Returns:
        Response with rate limit headers
    """
    # Get identifier (user ID from auth or IP address)
    identifier = None
    
    # Try to get user ID from request state (set by auth middleware)
    if hasattr(request.state, "user"):
        identifier = str(request.state.user.get("id"))
    
    # Fallback to IP address
    if not identifier:
        identifier = request.client.host if request.client else "unknown"
    
    # Get endpoint path
    endpoint = request.url.path
    
    # Check rate limit
    limiter = get_rate_limiter()
    allowed, headers = limiter.check_rate_limit(identifier, endpoint)
    
    if not allowed:
        logger.warning(
            "rate_limit_blocked",
            identifier=identifier,
            endpoint=endpoint,
            headers=headers
        )
        
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "Rate limit exceeded. Please try again later.",
                "retry_after": headers.get("X-RateLimit-Reset")
            },
            headers=headers
        )
    
    # Process request
    response = await call_next(request)
    
    # Add rate limit headers to response
    for key, value in headers.items():
        response.headers[key] = value
    
    return response


def rate_limit(
    requests_per_minute: int = 10,
    requests_per_hour: int = 100,
    requests_per_day: int = 1000
):
    """
    Decorator for endpoint-specific rate limiting
    
    Usage:
        @router.get("/expensive")
        @rate_limit(requests_per_minute=5)
        async def expensive_endpoint():
            ...
    
    Args:
        requests_per_minute: Max requests per minute
        requests_per_hour: Max requests per hour
        requests_per_day: Max requests per day
        
    Returns:
        Decorator function
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Create custom limiter for this endpoint
            limiter = RateLimiter(
                requests_per_minute=requests_per_minute,
                requests_per_hour=requests_per_hour,
                requests_per_day=requests_per_day
            )
            
            # Get request from kwargs
            request = kwargs.get("request")
            if not request:
                # Try to find Request in args
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            if request:
                identifier = getattr(request.state, "user_id", request.client.host)
                allowed, headers = limiter.check_rate_limit(identifier, func.__name__)
                
                if not allowed:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Rate limit exceeded",
                        headers=headers
                    )
            
            return await func(*args, **kwargs)
        
        return wrapper
    
    return decorator

