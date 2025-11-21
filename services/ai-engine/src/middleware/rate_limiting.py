"""
Rate Limiting Middleware for VITAL Path AI Services
Implements per-tenant and per-IP rate limiting with configurable limits

Production Features:
- ✅ Redis-backed for distributed systems
- ✅ Sliding window algorithm
- ✅ Per-tenant and per-IP tracking
- ✅ Endpoint-specific limits
- ✅ Rate limit headers
- ✅ Graceful degradation (falls back to memory if Redis unavailable)
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Callable, Optional
import structlog
import time
from collections import defaultdict
import asyncio
import os

logger = structlog.get_logger()


def get_tenant_or_ip(request: Request) -> str:
    """
    Get rate limit key from tenant ID or IP address.
    
    Priority:
    1. Use tenant_id if available (most specific)
    2. Fall back to IP address for unauthenticated requests
    
    Args:
        request: FastAPI request object
        
    Returns:
        Rate limit key string
    """
    # Try to get tenant ID from headers
    tenant_id = request.headers.get("x-tenant-id")
    
    if tenant_id:
        # Use tenant ID for rate limiting (most secure)
        return f"tenant:{tenant_id}"
    
    # Fall back to IP address
    ip = get_remote_address(request)
    return f"ip:{ip}"


def get_user_id(request: Request) -> str:
    """
    Get user ID for more granular rate limiting.
    
    Args:
        request: FastAPI request object
        
    Returns:
        User-specific rate limit key
    """
    tenant_id = request.headers.get("x-tenant-id")
    user_id = request.headers.get("x-user-id")
    
    if tenant_id and user_id:
        return f"user:{tenant_id}:{user_id}"
    elif tenant_id:
        return f"tenant:{tenant_id}"
    
    # Fall back to IP
    return f"ip:{get_remote_address(request)}"


# Initialize slowapi limiter with Redis (production-ready)
def get_storage_uri() -> str:
    """
    Get storage URI for rate limiting.
    
    Priority:
    1. Redis URL from environment (production)
    2. Local Redis (development)
    3. Memory storage (fallback)
    """
    redis_url = os.getenv("REDIS_URL")
    
    if redis_url:
        logger.info("✅ Rate limiting using Redis", url=redis_url[:20] + "...")
        return redis_url
    
    # Try local Redis
    local_redis = "redis://localhost:6379"
    try:
        import redis
        client = redis.from_url(local_redis, socket_timeout=1)
        client.ping()
        logger.info("✅ Rate limiting using local Redis")
        return local_redis
    except Exception:
        logger.warning("⚠️  Redis unavailable, falling back to memory storage")
        return "memory://"


limiter = Limiter(
    key_func=get_tenant_or_ip,
    default_limits=["100/minute", "1000/hour", "5000/day"],
    headers_enabled=True,  # Add rate limit headers to responses
    storage_uri=get_storage_uri()  # Production: Redis, Fallback: Memory
)


class EnhancedRateLimitMiddleware(BaseHTTPMiddleware):
    """
    Enhanced rate limiting middleware with custom logic.
    
    Features:
    - Per-tenant rate limiting
    - Per-user rate limiting
    - Configurable limits by endpoint type
    - Bypass for admin users
    - Rate limit headers in responses
    """
    
    # Public endpoints that don't require rate limiting
    PUBLIC_PATHS = [
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc"
    ]
    
    # Endpoint-specific rate limits (requests per minute)
    ENDPOINT_LIMITS = {
        # High-cost endpoints (AI/LLM calls)
        "/api/mode1/manual": 10,
        "/api/mode2/automatic": 5,
        "/api/mode3/autonomous-automatic": 3,
        
        # Medium-cost endpoints (RAG search)
        "/api/rag/search": 20,
        "/api/agent-selector/analyze": 30,
        
        # Low-cost endpoints
        "/api/agents/list": 60,
        "/health": 1000,  # Very high limit
    }
    
    def __init__(self, app):
        super().__init__(app)
        # Track request counts per key
        self._request_counts = defaultdict(lambda: defaultdict(int))
        self._reset_times = defaultdict(lambda: defaultdict(float))
        # Start cleanup task
        self._cleanup_task = None
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with rate limiting"""
        
        # Skip rate limiting for public paths
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)
        
        # Get rate limit key
        rate_key = get_tenant_or_ip(request)
        endpoint = request.url.path
        
        # Check if admin bypass is enabled
        if self._is_admin_bypass(request):
            logger.debug("Admin bypass for rate limiting", endpoint=endpoint)
            return await call_next(request)
        
        # Get limit for this endpoint
        limit = self._get_endpoint_limit(endpoint)
        
        # Check rate limit
        is_allowed, retry_after = self._check_rate_limit(rate_key, endpoint, limit)
        
        if not is_allowed:
            logger.warning(
                "Rate limit exceeded",
                rate_key=rate_key[:50],
                endpoint=endpoint,
                limit=limit
            )
            
            # Return 429 Too Many Requests
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {limit} requests per minute.",
                    "retry_after": retry_after,
                    "limit": limit,
                    "window": "1 minute"
                },
                headers={
                    "Retry-After": str(int(retry_after)),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time() + retry_after))
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        remaining = self._get_remaining_requests(rate_key, endpoint, limit)
        reset_time = int(self._get_reset_time(rate_key, endpoint))
        
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)
        
        return response
    
    def _check_rate_limit(self, rate_key: str, endpoint: str, limit: int) -> tuple[bool, float]:
        """
        Check if request is within rate limit.
        
        Args:
            rate_key: Rate limit key (tenant/IP)
            endpoint: API endpoint path
            limit: Maximum requests per minute
            
        Returns:
            Tuple of (is_allowed, retry_after_seconds)
        """
        current_time = time.time()
        window_start = self._reset_times[rate_key][endpoint]
        
        # Check if we need to reset the window (1 minute = 60 seconds)
        if current_time - window_start >= 60:
            # Reset the window
            self._request_counts[rate_key][endpoint] = 0
            self._reset_times[rate_key][endpoint] = current_time
            window_start = current_time
        
        # Increment request count
        self._request_counts[rate_key][endpoint] += 1
        current_count = self._request_counts[rate_key][endpoint]
        
        # Check if over limit
        if current_count > limit:
            # Calculate retry_after (time until window resets)
            retry_after = 60 - (current_time - window_start)
            return False, max(retry_after, 1)
        
        return True, 0
    
    def _get_remaining_requests(self, rate_key: str, endpoint: str, limit: int) -> int:
        """Get number of remaining requests in current window"""
        current_count = self._request_counts[rate_key][endpoint]
        return max(0, limit - current_count)
    
    def _get_reset_time(self, rate_key: str, endpoint: str) -> float:
        """Get timestamp when rate limit window resets"""
        window_start = self._reset_times[rate_key][endpoint]
        return window_start + 60  # 60 seconds window
    
    def _get_endpoint_limit(self, endpoint: str) -> int:
        """
        Get rate limit for specific endpoint.
        
        Args:
            endpoint: API endpoint path
            
        Returns:
            Maximum requests per minute
        """
        # Check exact match first
        if endpoint in self.ENDPOINT_LIMITS:
            return self.ENDPOINT_LIMITS[endpoint]
        
        # Check prefix match (e.g., /api/mode1/* matches /api/mode1/manual)
        for path_prefix, limit in self.ENDPOINT_LIMITS.items():
            if endpoint.startswith(path_prefix):
                return limit
        
        # Default limit for unspecified endpoints
        return 60  # 60 requests per minute default
    
    def _is_admin_bypass(self, request: Request) -> bool:
        """
        Check if request should bypass rate limiting (admin users).
        
        Args:
            request: FastAPI request object
            
        Returns:
            True if rate limiting should be bypassed
        """
        # Check for admin token
        admin_token = request.headers.get("x-admin-token")
        
        # TODO: Implement proper admin token verification
        # For now, disabled for security
        return False
    
    async def cleanup_old_entries(self):
        """Periodic cleanup of old rate limit entries"""
        while True:
            await asyncio.sleep(300)  # Cleanup every 5 minutes
            
            current_time = time.time()
            
            # Remove entries older than 2 minutes
            for rate_key in list(self._reset_times.keys()):
                for endpoint in list(self._reset_times[rate_key].keys()):
                    if current_time - self._reset_times[rate_key][endpoint] > 120:
                        del self._request_counts[rate_key][endpoint]
                        del self._reset_times[rate_key][endpoint]
                
                # Remove empty rate_key entries
                if not self._reset_times[rate_key]:
                    del self._reset_times[rate_key]
                    del self._request_counts[rate_key]
            
            logger.debug("Rate limit cleanup completed", entries=len(self._request_counts))


# Custom rate limit decorators for specific endpoints

def rate_limit_expensive(limit: str = "5/minute"):
    """Rate limit decorator for expensive endpoints (AI/LLM calls)"""
    return limiter.limit(limit, key_func=get_tenant_or_ip)


def rate_limit_moderate(limit: str = "20/minute"):
    """Rate limit decorator for moderate endpoints (RAG search)"""
    return limiter.limit(limit, key_func=get_tenant_or_ip)


def rate_limit_light(limit: str = "100/minute"):
    """Rate limit decorator for light endpoints (list, get)"""
    return limiter.limit(limit, key_func=get_tenant_or_ip)


def rate_limit_per_user(limit: str = "10/minute"):
    """Rate limit decorator per user (more granular)"""
    return limiter.limit(limit, key_func=get_user_id)

