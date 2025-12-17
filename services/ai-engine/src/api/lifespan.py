"""
VITAL Path AI Services - Lifespan Management

Handles FastAPI application startup and shutdown events including:
- Service initialization (Supabase, RAG, Cache, etc.)
- Resource cleanup on shutdown
- Background initialization for fast startup

Phase 1 Refactoring: Extracted from monolithic main.py
"""

import os
import asyncio
from contextlib import asynccontextmanager
from typing import Optional, Any

from fastapi import FastAPI
import structlog

from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()

# Global service instances
_services: dict = {
    "agent_orchestrator": None,
    "rag_pipeline": None,
    "unified_rag_service": None,
    "metadata_processing_service": None,
    "supabase_client": None,
    "websocket_manager": None,
    "cache_manager": None,
    "checkpoint_manager": None,
    "observability": None,
    "tool_registry": None,
    "sub_agent_spawner": None,
    "confidence_calculator": None,
    "compliance_service": None,
    "human_in_loop_validator": None,
}


def get_service(name: str) -> Optional[Any]:
    """Get a service instance by name."""
    return _services.get(name)


def set_service(name: str, instance: Any) -> None:
    """Set a service instance by name."""
    _services[name] = instance


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan management.
    
    Starts immediately and initializes services in background
    to allow fast startup and immediate health check responses.
    
    This is critical for Railway deployment health checks.
    """
    logger.info("=" * 80)
    logger.info("🚀 Starting VITAL Path AI Services")
    logger.info("=" * 80)
    
    # Log environment info
    logger.info(
        "environment_info",
        port=os.getenv("PORT", "8000"),
        pythonpath=os.getenv("PYTHONPATH", "not set"),
        working_directory=os.getcwd(),
    )
    
    # Start services initialization in background task
    logger.info("🔄 Starting background service initialization...")
    init_task = asyncio.create_task(_initialize_services_background())
    
    # Don't wait for initialization - let it run in background
    logger.info("✅ FastAPI app ready - services initializing in background")
    logger.info("✅ Health endpoint available at /health")
    logger.info("=" * 80)
    
    # Set app state for middleware access
    app.state.services = _services
    
    yield
    
    # Cancel background initialization if still running
    if not init_task.done():
        init_task.cancel()
        try:
            await init_task
        except asyncio.CancelledError:
            pass
    
    # Cleanup
    await _cleanup_services()


async def _initialize_services_background():
    """
    Initialize services in background - non-blocking.
    
    Services are initialized with timeouts to prevent hanging.
    Failed initializations are logged but don't block startup.
    """
    logger.info("🚀 Starting background service initialization")
    
    # 1. Initialize cache manager first (optional, can fail gracefully)
    await _init_cache_manager()
    
    # 2. Initialize LangGraph checkpoint manager
    await _init_checkpoint_manager()
    
    # 3. Initialize LangGraph observability
    await _init_observability()
    
    # 4. Initialize Supabase client (core dependency)
    await _init_supabase_client()
    
    # 5. Initialize dependent services (require Supabase)
    if _services["supabase_client"]:
        await _init_dependent_services()
    
    # 6. Setup monitoring
    await _init_monitoring()
    
    logger.info("✅ AI Services background initialization complete")


async def _init_cache_manager():
    """Initialize cache manager."""
    try:
        redis_url = getattr(settings, 'redis_url', None)
        if redis_url:
            from services.cache_manager import initialize_cache_manager
            _services["cache_manager"] = await initialize_cache_manager(redis_url)
            logger.info("✅ Cache manager initialized")
        else:
            logger.info("ℹ️ Redis URL not configured - caching disabled")
    except Exception as e:
        logger.warning("cache_manager_init_failed", error=str(e))


async def _init_checkpoint_manager():
    """Initialize LangGraph checkpoint manager."""
    try:
        from langgraph_workflows import initialize_checkpoint_manager
        _services["checkpoint_manager"] = await initialize_checkpoint_manager(
            backend="sqlite",
            db_path=os.getenv("CHECKPOINT_DB_PATH")
        )
        logger.info("✅ LangGraph checkpoint manager initialized")
    except Exception as e:
        logger.warning("checkpoint_manager_init_failed", error=str(e))


async def _init_observability():
    """Initialize LangGraph observability."""
    try:
        from langgraph_workflows import initialize_observability
        _services["observability"] = await initialize_observability()
        logger.info("✅ LangGraph observability initialized")
    except Exception as e:
        logger.warning("observability_init_failed", error=str(e))


async def _init_supabase_client():
    """Initialize Supabase client."""
    try:
        from services.supabase_client import SupabaseClient
        from api.dependencies import set_supabase_client
        
        client = SupabaseClient()
        await asyncio.wait_for(client.initialize(), timeout=10.0)
        _services["supabase_client"] = client
        
        set_supabase_client(client)
        
        logger.info("✅ Supabase client initialized")
        
        # Initialize Panel Template Service (with timeout)
        try:
            from services.panel_template_service import initialize_panel_template_service
            await asyncio.wait_for(initialize_panel_template_service(client), timeout=5.0)
            logger.info("✅ Panel template service initialized")
        except asyncio.TimeoutError:
            logger.warning("⚠️ Panel template service initialization timed out - skipping")
        except Exception as e:
            logger.warning("⚠️ Panel template service initialization failed", error=str(e))
        
        # Initialize GraphRAG selector
        from services.graphrag_selector import initialize_graphrag_selector
        initialize_graphrag_selector(supabase_client=client)
        logger.info("✅ GraphRAG selector initialized")
        
        # Initialize Neo4j client
        await _init_neo4j_client()
        
    except asyncio.TimeoutError:
        logger.error("supabase_init_timeout")
    except Exception as e:
        logger.error("supabase_init_failed", error=str(e))


async def _init_neo4j_client():
    """Initialize Neo4j client for graph-based agent selection."""
    neo4j_uri = os.getenv("NEO4J_URI")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD")
    
    if neo4j_uri and neo4j_password:
        try:
            from services.neo4j_client import initialize_neo4j_client
            initialize_neo4j_client(neo4j_uri, neo4j_user, neo4j_password)
            logger.info("✅ Neo4j client initialized")
        except Exception as e:
            logger.error("neo4j_init_failed", error=str(e))
    else:
        logger.warning("neo4j_credentials_missing")


async def _init_dependent_services():
    """Initialize services that depend on Supabase."""
    client = _services["supabase_client"]
    cache = _services["cache_manager"]
    
    # Tool Registry
    try:
        from services.tool_registry_service import initialize_tool_registry
        _services["tool_registry"] = await initialize_tool_registry(client)
        logger.info("✅ Tool registry initialized")
    except Exception as e:
        logger.error("tool_registry_init_failed", error=str(e))
    
    # Sub-agent spawner
    try:
        from services.sub_agent_spawner import SubAgentSpawner
        _services["sub_agent_spawner"] = SubAgentSpawner()
        logger.info("✅ Sub-agent spawner initialized")
    except Exception as e:
        logger.error("sub_agent_spawner_init_failed", error=str(e))
    
    # Confidence calculator
    try:
        from services.confidence_calculator import ConfidenceCalculator
        _services["confidence_calculator"] = ConfidenceCalculator()
        logger.info("✅ Confidence calculator initialized")
    except Exception as e:
        logger.error("confidence_calculator_init_failed", error=str(e))
    
    # Compliance service
    try:
        from services.compliance_service import ComplianceService, HumanInLoopValidator
        _services["compliance_service"] = ComplianceService(client)
        _services["human_in_loop_validator"] = HumanInLoopValidator()
        logger.info("✅ Compliance service initialized")
    except Exception as e:
        logger.error("compliance_service_init_failed", error=str(e))
    
    # RAG Pipeline
    try:
        from services.medical_rag import MedicalRAGPipeline
        pipeline = MedicalRAGPipeline(client)
        await asyncio.wait_for(pipeline.initialize(), timeout=5.0)
        _services["rag_pipeline"] = pipeline
        logger.info("✅ RAG pipeline initialized")
    except Exception as e:
        logger.error("rag_pipeline_init_failed", error=str(e))
    
    # Unified RAG Service
    try:
        from services.unified_rag_service import UnifiedRAGService
        service = UnifiedRAGService(client, cache_manager=cache)
        await asyncio.wait_for(service.initialize(), timeout=5.0)
        _services["unified_rag_service"] = service
        logger.info("✅ Unified RAG service initialized")
    except Exception as e:
        logger.error("unified_rag_service_init_failed", error=str(e))
    
    # Metadata Processing Service
    try:
        from services.metadata_processing_service import create_metadata_processing_service
        _services["metadata_processing_service"] = create_metadata_processing_service(
            use_ai=False,
            openai_api_key=settings.openai_api_key
        )
        logger.info("✅ Metadata processing service initialized")
    except Exception as e:
        logger.error("metadata_processing_init_failed", error=str(e))
    
    # Agent Orchestrator
    try:
        from services.agent_orchestrator import AgentOrchestrator
        orchestrator = AgentOrchestrator(client, _services["unified_rag_service"])
        # Initialize (no-op but keeps health happy) and store service
        await asyncio.wait_for(orchestrator.initialize(), timeout=5.0)
        _services["agent_orchestrator"] = orchestrator
        logger.info("✅ Agent orchestrator initialized")
    except Exception as e:
        logger.error("agent_orchestrator_init_failed", error=str(e))
    
    # WebSocket Manager
    try:
        from core.websocket_manager import WebSocketManager
        _services["websocket_manager"] = WebSocketManager()
        logger.info("✅ WebSocket manager initialized")
    except Exception as e:
        logger.error("websocket_manager_init_failed", error=str(e))


async def _init_monitoring():
    """Setup monitoring (non-blocking)."""
    try:
        from core.monitoring import setup_monitoring
        setup_monitoring()
        logger.info("✅ Monitoring setup complete")
    except Exception as e:
        logger.warning("monitoring_setup_failed", error=str(e))


async def _cleanup_services():
    """Cleanup all services on shutdown."""
    logger.info("🔄 Shutting down AI Services")
    
    cleanup_tasks = [
        ("agent_orchestrator", "cleanup"),
        ("rag_pipeline", "cleanup"),
        ("unified_rag_service", "cleanup"),
        ("supabase_client", "cleanup"),
    ]
    
    for service_name, method_name in cleanup_tasks:
        service = _services.get(service_name)
        if service and hasattr(service, method_name):
            try:
                await getattr(service, method_name)()
                logger.info(f"✅ {service_name} cleaned up")
            except Exception as e:
                logger.error(f"{service_name}_cleanup_failed", error=str(e))
    
    logger.info("✅ All services cleaned up")
