"""
Health Check Routes for VITAL Expert Consultation Service

Provides health check endpoints for monitoring and load balancing.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import asyncio
from datetime import datetime
from typing import Dict, Any

router = APIRouter()

# Global service instances (will be injected)
session_manager = None
redis_manager = None
execution_controller = None
execution_analyzer = None

def get_services():
    """Dependency to get service instances"""
    return {
        'session_manager': session_manager,
        'redis_manager': redis_manager,
        'execution_controller': execution_controller,
        'execution_analyzer': execution_analyzer
    }

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "vital-expert-consultation",
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check(services: Dict[str, Any] = Depends(get_services)):
    """Detailed health check with service dependencies"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "vital-expert-consultation",
        "version": "1.0.0",
        "checks": {}
    }
    
    overall_healthy = True
    
    # Check Redis connection
    try:
        if services['redis_manager']:
            redis_health = await services['redis_manager'].health_check()
            health_status["checks"]["redis"] = redis_health
            if redis_health["status"] != "healthy":
                overall_healthy = False
        else:
            health_status["checks"]["redis"] = {"status": "not_initialized", "error": "Redis manager not available"}
            overall_healthy = False
    except Exception as e:
        health_status["checks"]["redis"] = {"status": "unhealthy", "error": str(e)}
        overall_healthy = False
    
    # Check database connection
    try:
        if services['session_manager']:
            # Try to get a simple query
            test_sessions = await services['session_manager'].get_user_sessions("health_check", limit=1)
            health_status["checks"]["database"] = {
                "status": "healthy",
                "message": "Database connection successful"
            }
        else:
            health_status["checks"]["database"] = {"status": "not_initialized", "error": "Session manager not available"}
            overall_healthy = False
    except Exception as e:
        health_status["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
        overall_healthy = False
    
    # Check execution controller
    try:
        if services['execution_controller']:
            active_sessions = len(services['execution_controller'].active_executions)
            health_status["checks"]["execution_controller"] = {
                "status": "healthy",
                "active_sessions": active_sessions,
                "message": "Execution controller operational"
            }
        else:
            health_status["checks"]["execution_controller"] = {"status": "not_initialized", "error": "Execution controller not available"}
            overall_healthy = False
    except Exception as e:
        health_status["checks"]["execution_controller"] = {"status": "unhealthy", "error": str(e)}
        overall_healthy = False
    
    # Check analytics
    try:
        if services['execution_analyzer']:
            health_status["checks"]["analytics"] = {
                "status": "healthy",
                "message": "Analytics service operational"
            }
        else:
            health_status["checks"]["analytics"] = {"status": "not_initialized", "error": "Analytics service not available"}
            overall_healthy = False
    except Exception as e:
        health_status["checks"]["analytics"] = {"status": "unhealthy", "error": str(e)}
        overall_healthy = False
    
    # Set overall status
    health_status["status"] = "healthy" if overall_healthy else "unhealthy"
    
    # Return appropriate HTTP status
    if overall_healthy:
        return health_status
    else:
        return JSONResponse(
            status_code=503,
            content=health_status
        )

@router.get("/health/ready")
async def readiness_check(services: Dict[str, Any] = Depends(get_services)):
    """Readiness check for Kubernetes/Docker"""
    try:
        # Check if all critical services are available
        if not services['session_manager']:
            return JSONResponse(
                status_code=503,
                content={"status": "not_ready", "reason": "Session manager not initialized"}
            )
        
        if not services['redis_manager']:
            return JSONResponse(
                status_code=503,
                content={"status": "not_ready", "reason": "Redis manager not initialized"}
            )
        
        # Check Redis connectivity
        redis_health = await services['redis_manager'].health_check()
        if redis_health["status"] != "healthy":
            return JSONResponse(
                status_code=503,
                content={"status": "not_ready", "reason": "Redis not healthy"}
            )
        
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Service is ready to accept requests"
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "reason": f"Readiness check failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@router.get("/health/live")
async def liveness_check():
    """Liveness check for Kubernetes/Docker"""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Service is alive and responding"
    }

@router.get("/metrics")
async def metrics_endpoint(services: Dict[str, Any] = Depends(get_services)):
    """Prometheus-style metrics endpoint"""
    try:
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": "vital-expert-consultation"
        }
        
        # Get system metrics
        if services['redis_manager']:
            system_metrics = await services['redis_manager'].get_system_metrics()
            metrics.update(system_metrics)
        
        # Get execution metrics
        if services['execution_controller']:
            active_executions = len(services['execution_controller'].active_executions)
            metrics["active_executions"] = active_executions
        
        return metrics
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Failed to get metrics: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# Function to set service instances (called from main.py)
def set_service_instances(sm, rm, ec, ea):
    """Set service instances for dependency injection"""
    global session_manager, redis_manager, execution_controller, execution_analyzer
    session_manager = sm
    redis_manager = rm
    execution_controller = ec
    execution_analyzer = ea
