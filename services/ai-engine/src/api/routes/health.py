"""
VITAL Path - Health Check Routes

Health and readiness endpoints for:
- Container orchestration (Kubernetes, ECS)
- Load balancer health checks
- Monitoring systems
"""

import logging
import time
import os
from datetime import datetime
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Response
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


class ComponentHealth(BaseModel):
    """Health status of a single component."""
    status: str  # ok, warning, error
    latency_ms: Optional[float] = None
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str  # healthy, degraded, unhealthy
    timestamp: datetime
    version: str
    environment: str
    uptime_seconds: Optional[float] = None


class ReadinessResponse(BaseModel):
    """Readiness check response with component status."""
    ready: bool
    timestamp: datetime
    checks: Dict[str, ComponentHealth]
    degraded_components: List[str] = []


class DetailedHealthResponse(BaseModel):
    """Detailed health response for debugging."""
    status: str
    timestamp: datetime
    version: str
    environment: str
    uptime_seconds: float
    checks: Dict[str, ComponentHealth]
    config: Dict[str, Any]


# Track startup time
_startup_time = time.time()


def _get_version() -> str:
    """Get application version."""
    return os.getenv("APP_VERSION", "3.7.0")


def _get_environment() -> str:
    """Get environment name."""
    return os.getenv("ENVIRONMENT", "development")


async def _check_database() -> ComponentHealth:
    """Check database connectivity."""
    start = time.perf_counter()
    try:
        from services.supabase_client import SupabaseClient
        client = SupabaseClient()
        
        # Simple query to test connection
        result = client.client.table("tenants").select("id").limit(1).execute()
        latency = (time.perf_counter() - start) * 1000
        
        return ComponentHealth(
            status="ok",
            latency_ms=round(latency, 2),
            message="Connected",
        )
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        logger.error(f"Database check failed: {e}")
        return ComponentHealth(
            status="error",
            latency_ms=round(latency, 2),
            message=str(e),
        )


async def _check_redis() -> ComponentHealth:
    """Check Redis connectivity."""
    start = time.perf_counter()
    try:
        import redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        client = redis.from_url(redis_url)
        client.ping()
        latency = (time.perf_counter() - start) * 1000
        
        return ComponentHealth(
            status="ok",
            latency_ms=round(latency, 2),
            message="Connected",
        )
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        logger.warning(f"Redis check failed: {e}")
        return ComponentHealth(
            status="warning",
            latency_ms=round(latency, 2),
            message=str(e),
            details={"note": "Redis is optional for basic operation"},
        )


async def _check_llm() -> ComponentHealth:
    """Check LLM API key configuration."""
    try:
        openai_key = os.getenv("OPENAI_API_KEY", "")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        
        if openai_key and len(openai_key) > 10:
            return ComponentHealth(
                status="ok",
                message="OpenAI API key configured",
                details={"provider": "openai"},
            )
        elif anthropic_key and len(anthropic_key) > 10:
            return ComponentHealth(
                status="ok",
                message="Anthropic API key configured",
                details={"provider": "anthropic"},
            )
        else:
            return ComponentHealth(
                status="warning",
                message="No LLM API keys configured",
            )
    except Exception as e:
        return ComponentHealth(
            status="error",
            message=str(e),
        )


async def _check_workers() -> ComponentHealth:
    """Check Celery worker status."""
    try:
        from workers.config import celery_app
        
        # Try to inspect workers
        inspector = celery_app.control.inspect(timeout=2.0)
        active = inspector.active()
        
        if active:
            worker_count = len(active)
            return ComponentHealth(
                status="ok",
                message=f"{worker_count} worker(s) active",
                details={"workers": list(active.keys())},
            )
        else:
            return ComponentHealth(
                status="warning",
                message="No active workers",
                details={"note": "Workers may still be starting"},
            )
    except Exception as e:
        logger.warning(f"Worker check failed: {e}")
        return ComponentHealth(
            status="warning",
            message="Cannot reach workers",
            details={"error": str(e), "note": "Async tasks may be unavailable"},
        )


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Basic health check endpoint.
    
    Returns 200 if the service is running.
    Used by load balancers and container orchestration.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=_get_version(),
        environment=_get_environment(),
        uptime_seconds=round(time.time() - _startup_time, 2),
    )


@router.get("/healthz", response_model=HealthResponse)
async def healthz() -> HealthResponse:
    """Kubernetes-style health endpoint."""
    return await health_check()


@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check(response: Response) -> ReadinessResponse:
    """
    Readiness check endpoint.
    
    Checks if the service is ready to accept traffic.
    Verifies database, cache, and other dependencies.
    
    Returns 503 if not ready.
    """
    checks: Dict[str, ComponentHealth] = {}
    degraded: List[str] = []
    all_ready = True
    
    # Check database (required)
    db_check = await _check_database()
    checks["database"] = db_check
    if db_check.status == "error":
        all_ready = False
    elif db_check.status == "warning":
        degraded.append("database")
    
    # Check Redis (optional)
    redis_check = await _check_redis()
    checks["redis"] = redis_check
    if redis_check.status == "warning":
        degraded.append("redis")
    elif redis_check.status == "error":
        degraded.append("redis")
    
    # Check LLM configuration
    llm_check = await _check_llm()
    checks["llm"] = llm_check
    if llm_check.status == "warning":
        degraded.append("llm")
    elif llm_check.status == "error":
        all_ready = False
    
    # Check workers (optional)
    worker_check = await _check_workers()
    checks["workers"] = worker_check
    if worker_check.status != "ok":
        degraded.append("workers")
    
    # Set response status code
    if not all_ready:
        response.status_code = 503
    
    return ReadinessResponse(
        ready=all_ready,
        timestamp=datetime.utcnow(),
        checks=checks,
        degraded_components=degraded,
    )


@router.get("/health/detailed", response_model=DetailedHealthResponse)
async def detailed_health() -> DetailedHealthResponse:
    """
    Detailed health check for debugging.
    
    Returns comprehensive health information including config.
    Should be protected in production.
    """
    checks: Dict[str, ComponentHealth] = {}
    
    # Run all checks
    checks["database"] = await _check_database()
    checks["redis"] = await _check_redis()
    checks["llm"] = await _check_llm()
    checks["workers"] = await _check_workers()
    
    # Determine overall status
    error_count = sum(1 for c in checks.values() if c.status == "error")
    warning_count = sum(1 for c in checks.values() if c.status == "warning")
    
    if error_count > 0:
        status = "unhealthy"
    elif warning_count > 0:
        status = "degraded"
    else:
        status = "healthy"
    
    # Safe config subset (no secrets)
    config = {
        "environment": _get_environment(),
        "log_level": os.getenv("LOG_LEVEL", "INFO"),
        "prometheus_enabled": os.getenv("PROMETHEUS_ENABLED", "true"),
        "worker_concurrency": os.getenv("WORKER_CONCURRENCY", "4"),
        "default_llm_model": os.getenv("DEFAULT_LLM_MODEL", "gpt-4o"),
    }
    
    return DetailedHealthResponse(
        status=status,
        timestamp=datetime.utcnow(),
        version=_get_version(),
        environment=_get_environment(),
        uptime_seconds=round(time.time() - _startup_time, 2),
        checks=checks,
        config=config,
    )


@router.get("/live")
async def liveness():
    """
    Kubernetes liveness probe.
    
    Simple endpoint that returns 200 if the process is alive.
    """
    return {"status": "alive"}


# Export router
health_router = router






