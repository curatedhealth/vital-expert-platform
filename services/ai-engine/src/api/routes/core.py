# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [api.lifespan, prometheus_client]
"""
VITAL Path AI Services - Core Routes

Core API endpoints for health, metrics, cache, and system info.

Phase 1 Refactoring: Extracted from monolithic main.py
"""

import time
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter
from fastapi.responses import Response
from prometheus_client import generate_latest
import structlog

from api.lifespan import get_service

logger = structlog.get_logger()

router = APIRouter(tags=["system"])


@router.get("/")
async def root():
    """Root endpoint - simple hello world."""
    return {
        "service": "vital-path-ai-services",
        "version": "2.0.0",
        "status": "running",
        "health": "/health",
        "docs": "/docs"
    }


@router.get("/health")
async def health_check():
    """
    Health check endpoint - always returns healthy to allow app to start.
    
    This endpoint responds immediately, even before services initialize.
    This is critical for Railway deployment health checks.
    
    Includes RLS (Row-Level Security) status for compliance monitoring.
    """
    supabase_client = get_service("supabase_client")
    agent_orchestrator = get_service("agent_orchestrator")
    rag_pipeline = get_service("rag_pipeline")
    unified_rag_service = get_service("unified_rag_service")
    
    # Check service availability (non-blocking)
    services_status = {
        "supabase": "healthy" if supabase_client else "unavailable",
        "agent_orchestrator": "healthy" if agent_orchestrator else "unavailable",
        "rag_pipeline": "healthy" if rag_pipeline else "unavailable",
        "unified_rag_service": "healthy" if unified_rag_service else "unavailable"
    }
    
    # Check RLS status (Golden Rule #2: Multi-Tenant Security)
    rls_status = await _check_rls_status(supabase_client)
    
    return {
        "status": "healthy",
        "service": "vital-path-ai-services",
        "version": "2.0.0",
        "timestamp": time.time(),
        "services": services_status,
        "security": {
            "rls": rls_status
        },
        "compliance": {
            "golden_rules": {
                "rule_2_multi_tenant_security": rls_status["status"]
            }
        },
        "ready": True  # Explicitly mark as ready for Railway
    }


async def _check_rls_status(supabase_client) -> Dict[str, Any]:
    """Check RLS policy status."""
    rls_status = {
        "enabled": "unknown",
        "policies_count": 0,
        "status": "unknown"
    }
    
    if supabase_client and hasattr(supabase_client, 'client') and supabase_client.client:
        try:
            result = await supabase_client.client.rpc('count_rls_policies').execute()
            if result.data is not None:
                policy_count = result.data if isinstance(result.data, int) else result.data[0].get('count', 0)
                rls_status = {
                    "enabled": "active" if policy_count > 0 else "inactive",
                    "policies_count": policy_count,
                    "status": "healthy" if policy_count >= 40 else "degraded"
                }
        except Exception as e:
            logger.warning("health_check_rls_query_failed", error=str(e))
            rls_status["status"] = "unknown"
    
    return rls_status


@router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type="text/plain")


@router.get("/cache/stats")
async def get_cache_stats():
    """
    Get cache statistics for monitoring.
    
    Returns cache hit/miss rates for:
    - Global cache manager
    - RAG service cache
    """
    cache_manager = get_service("cache_manager")
    unified_rag_service = get_service("unified_rag_service")
    
    stats = {
        "timestamp": datetime.now().isoformat(),
        "global_cache": None,
        "rag_cache": None,
    }
    
    # Global cache manager stats
    if cache_manager and hasattr(cache_manager, 'enabled') and cache_manager.enabled:
        try:
            stats["global_cache"] = await cache_manager.get_cache_stats()
        except Exception as e:
            stats["global_cache"] = {"error": str(e)}
    else:
        stats["global_cache"] = {"enabled": False, "message": "Cache manager not initialized"}
    
    # RAG service cache stats
    if unified_rag_service:
        try:
            stats["rag_cache"] = await unified_rag_service.get_cache_stats()
        except Exception as e:
            stats["rag_cache"] = {"error": str(e)}
    else:
        stats["rag_cache"] = {"enabled": False, "message": "RAG service not initialized"}
    
    return stats


@router.get("/api/info")
async def system_info():
    """
    Get system information.
    
    Returns version, features, and configuration.
    """
    return {
        "name": "VITAL Platform AI Services",
        "version": "2.0.0",
        "features": [
            "4-Mode Agent System",
            "Fusion Intelligence",
            "5-Level Agent Hierarchy",
            "Hybrid GraphRAG Search",
            "Real-time WebSocket Streaming",
            "Redis Caching",
            "HITL Checkpoints",
            "Multi-tenant Security (RLS)"
        ],
        "endpoints": {
            "mode1": "/api/mode1/manual",
            "mode2": "/api/mode2/automatic",
            "mode3": "/api/mode3/autonomous-manual",
            "mode4": "/api/mode4/autonomous-automatic",
            "health": "/health",
            "docs": "/docs"
        },
        "performance_targets": {
            "mode1_p50_ms": 500,
            "mode1_p90_ms": 1000,
            "mode2_p50_ms": 750,
            "mode2_p90_ms": 1500,
            "cache_hit_rate_min": 0.60
        },
        "golden_rules": {
            "rule_1": "Python for AI/ML workloads",
            "rule_2": "RLS at database level",
            "rule_3": "L4/L5 tools mandatory in ALL modes",
            "rule_4": "Streaming required for responses",
            "rule_5": "LangGraph for all workflows"
        }
    }
