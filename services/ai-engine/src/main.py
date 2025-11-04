"""
VITAL Path AI Services - FastAPI Backend
Medical AI Agent Orchestration with LangChain
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import uvicorn
import structlog
from prometheus_client import Counter, Histogram, generate_latest
from middleware.tenant_context import get_tenant_id, set_tenant_context_in_db
from middleware.tenant_isolation import TenantIsolationMiddleware
from middleware.rate_limiting import (
    EnhancedRateLimitMiddleware,
    limiter,
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)
from typing import List, Dict, Any, Optional
import asyncio
import json
from datetime import datetime
from pydantic import BaseModel, Field

# Configure structured logging FIRST, before any other imports that use logger
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()  # JSON for production
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

# Get logger AFTER configuration
logger = structlog.get_logger()

from services.agent_orchestrator import AgentOrchestrator
from services.medical_rag import MedicalRAGPipeline
from services.unified_rag_service import UnifiedRAGService
from services.supabase_client import SupabaseClient
from services.metadata_processing_service import MetadataProcessingService, create_metadata_processing_service
from services.agent_selector_service import (
    AgentSelectorService,
    get_agent_selector_service,
    QueryAnalysisRequest,
    QueryAnalysisResponse
)
from services.cache_manager import CacheManager, initialize_cache_manager, get_cache_manager
from services.tool_registry_service import ToolRegistryService, initialize_tool_registry, get_tool_registry
from langgraph_workflows import (
    initialize_checkpoint_manager,
    initialize_observability,
    get_checkpoint_manager,
    get_observability
)
# Mode workflows for LangGraph execution
from langgraph_workflows.mode1_interactive_auto_workflow import Mode1InteractiveAutoWorkflow
from langgraph_workflows.mode2_interactive_manual_workflow import Mode2InteractiveManualWorkflow
from langgraph_workflows.mode3_autonomous_auto_workflow import Mode3AutonomousAutoWorkflow
from langgraph_workflows.mode4_autonomous_manual_workflow import Mode4AutonomousManualWorkflow
# Ask Panel imports
from api.dependencies import set_supabase_client
from api.routes import panels as panel_routes
from models.requests import (
    AgentQueryRequest,
    RAGSearchRequest,
    AgentCreationRequest,
    PromptGenerationRequest
)
from models.responses import (
    AgentQueryResponse,
    RAGSearchResponse,
    AgentCreationResponse,
    PromptGenerationResponse
)
from core.config import get_settings
from core.monitoring import setup_monitoring
from core.websocket_manager import WebSocketManager

# Setup logging
logger = structlog.get_logger()

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

settings = get_settings()

# Global instances
agent_orchestrator: Optional[AgentOrchestrator] = None
rag_pipeline: Optional[MedicalRAGPipeline] = None
unified_rag_service: Optional[UnifiedRAGService] = None
metadata_processing_service: Optional[MetadataProcessingService] = None
supabase_client: Optional[SupabaseClient] = None
websocket_manager: Optional[WebSocketManager] = None
cache_manager: Optional[CacheManager] = None
checkpoint_manager = None  # LangGraph checkpoint manager
observability = None  # LangGraph observability
tool_registry = None  # Tool registry service


class ConversationTurn(BaseModel):
    """Conversation history turn"""
    role: str = Field(..., description="Turn role (user or assistant)")
    content: str = Field(..., description="Turn content")


class Mode1ManualRequest(BaseModel):
    """Payload for Mode 1 manual interactive requests"""
    agent_id: str = Field(..., description="Agent ID to execute")
    message: str = Field(..., min_length=1, description="User message")
    enable_rag: bool = Field(True, description="Enable RAG retrieval")
    enable_tools: bool = Field(False, description="Enable tool execution")
    selected_rag_domains: Optional[List[str]] = Field(
        default=None,
        description="Optional RAG domain filters"
    )
    requested_tools: Optional[List[str]] = Field(
        default=None,
        description="Requested tools to enable"
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="LLM temperature override"
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=100,
        le=8000,
        description="LLM max tokens override"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="User executing the request"
    )
    tenant_id: Optional[str] = Field(
        default=None,
        description="Tenant/organization identifier"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session identifier for analytics"
    )
    conversation_history: Optional[List[ConversationTurn]] = Field(
        default=None,
        description="Previous turns for context"
    )


class Mode1ManualResponse(BaseModel):
    """Response payload for Mode 1 manual interactive requests"""
    agent_id: str = Field(..., description="Agent that produced the response")
    content: str = Field(..., description="Generated response content")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Supporting citations")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    processing_time_ms: float = Field(..., description="Processing latency in milliseconds")


class Mode2AutomaticRequest(BaseModel):
    """Payload for Mode 2 automatic agent selection requests"""
    message: str = Field(..., min_length=1, description="User message")
    enable_rag: bool = Field(True, description="Enable RAG retrieval")
    enable_tools: bool = Field(False, description="Enable tool execution")
    selected_rag_domains: Optional[List[str]] = Field(
        default=None,
        description="Optional RAG domain filters"
    )
    requested_tools: Optional[List[str]] = Field(
        default=None,
        description="Requested tools to enable"
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="LLM temperature override"
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=100,
        le=8000,
        description="LLM max tokens override"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="User executing the request"
    )
    tenant_id: Optional[str] = Field(
        default=None,
        description="Tenant/organization identifier"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session identifier for analytics"
    )
    conversation_history: Optional[List[ConversationTurn]] = Field(
        default=None,
        description="Previous turns for context"
    )


class Mode2AutomaticResponse(BaseModel):
    """Response payload for Mode 2 automatic agent selection requests"""
    agent_id: str = Field(..., description="Selected agent ID")
    content: str = Field(..., description="Generated response content")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Supporting citations")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    processing_time_ms: float = Field(..., description="Processing latency in milliseconds")
    agent_selection: Dict[str, Any] = Field(
        default_factory=dict,
        description="Agent selection details (selected agent, reason, confidence)"
    )


class Mode3AutonomousAutomaticRequest(BaseModel):
    """Payload for Mode 3 autonomous-automatic requests"""
    message: str = Field(..., min_length=1, description="User message")
    enable_rag: bool = Field(True, description="Enable RAG retrieval")
    enable_tools: bool = Field(True, description="Enable tool execution")
    selected_rag_domains: Optional[List[str]] = Field(
        default=None,
        description="Optional RAG domain filters"
    )
    requested_tools: Optional[List[str]] = Field(
        default=None,
        description="Requested tools to enable"
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="LLM temperature override"
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=100,
        le=8000,
        description="LLM max tokens override"
    )
    max_iterations: Optional[int] = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum ReAct iterations"
    )
    confidence_threshold: Optional[float] = Field(
        default=0.95,
        ge=0.0,
        le=1.0,
        description="Confidence threshold for autonomous reasoning"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="User executing the request"
    )
    tenant_id: Optional[str] = Field(
        default=None,
        description="Tenant/organization identifier"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session identifier for analytics"
    )
    conversation_history: Optional[List[ConversationTurn]] = Field(
        default=None,
        description="Previous turns for context"
    )


class Mode3AutonomousAutomaticResponse(BaseModel):
    """Response payload for Mode 3 autonomous-automatic requests"""
    agent_id: str = Field(..., description="Selected agent ID")
    content: str = Field(..., description="Generated response content")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Supporting citations")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    processing_time_ms: float = Field(..., description="Processing latency in milliseconds")
    autonomous_reasoning: Dict[str, Any] = Field(
        default_factory=dict,
        description="Autonomous reasoning details (iterations, steps, tools used)"
    )
    agent_selection: Dict[str, Any] = Field(
        default_factory=dict,
        description="Agent selection details"
    )


class Mode4AutonomousManualRequest(BaseModel):
    """Payload for Mode 4 autonomous-manual requests"""
    agent_id: str = Field(..., description="Agent ID to execute")
    message: str = Field(..., min_length=1, description="User message")
    enable_rag: bool = Field(True, description="Enable RAG retrieval")
    enable_tools: bool = Field(True, description="Enable tool execution")
    selected_rag_domains: Optional[List[str]] = Field(
        default=None,
        description="Optional RAG domain filters"
    )
    requested_tools: Optional[List[str]] = Field(
        default=None,
        description="Requested tools to enable"
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="LLM temperature override"
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=100,
        le=8000,
        description="LLM max tokens override"
    )
    max_iterations: Optional[int] = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum ReAct iterations"
    )
    confidence_threshold: Optional[float] = Field(
        default=0.95,
        ge=0.0,
        le=1.0,
        description="Confidence threshold for autonomous reasoning"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="User executing the request"
    )
    tenant_id: Optional[str] = Field(
        default=None,
        description="Tenant/organization identifier"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session identifier for analytics"
    )
    conversation_history: Optional[List[ConversationTurn]] = Field(
        default=None,
        description="Previous turns for context"
    )


class Mode4AutonomousManualResponse(BaseModel):
    """Response payload for Mode 4 autonomous-manual requests"""
    agent_id: str = Field(..., description="Agent that produced the response")
    content: str = Field(..., description="Generated response content")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Supporting citations")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    processing_time_ms: float = Field(..., description="Processing latency in milliseconds")
    autonomous_reasoning: Dict[str, Any] = Field(
        default_factory=dict,
        description="Autonomous reasoning details (iterations, steps, tools used)"
    )

async def initialize_services_background():
    """Initialize services in background - non-blocking"""
    global agent_orchestrator, rag_pipeline, unified_rag_service, metadata_processing_service, supabase_client, websocket_manager, cache_manager, checkpoint_manager, observability, tool_registry

    logger.info("🚀 Starting VITAL Path AI Services background initialization")

    # Initialize cache manager first (optional, can fail gracefully)
    try:
        redis_url = settings.redis_url if hasattr(settings, 'redis_url') else None
        if redis_url:
            cache_manager = await initialize_cache_manager(redis_url)
            logger.info("✅ Cache manager initialized")
        else:
            logger.info("ℹ️ Redis URL not configured - caching disabled")
            cache_manager = None
    except Exception as e:
        logger.warning("⚠️ Cache manager initialization failed - continuing without caching", error=str(e))
        cache_manager = None
    
    # Initialize LangGraph checkpoint manager
    try:
        checkpoint_manager = await initialize_checkpoint_manager(
            backend="sqlite",
            db_path=os.getenv("CHECKPOINT_DB_PATH")
        )
        logger.info("✅ LangGraph checkpoint manager initialized")
    except Exception as e:
        logger.warning("⚠️ Checkpoint manager initialization failed", error=str(e))
        checkpoint_manager = None
    
    # Initialize LangGraph observability
    try:
        observability = await initialize_observability()
        logger.info("✅ LangGraph observability initialized")
    except Exception as e:
        logger.warning("⚠️ Observability initialization failed", error=str(e))
        observability = None

    # Initialize services with error handling and timeouts - don't block startup
    try:
        supabase_client = SupabaseClient()
        # Add timeout to prevent hanging
        await asyncio.wait_for(supabase_client.initialize(), timeout=10.0)
        logger.info("✅ Supabase client initialized")
        
        # Set Supabase client for Ask Panel dependencies
        set_supabase_client(supabase_client)
        logger.info("✅ Ask Panel dependencies initialized")
    except asyncio.TimeoutError:
        logger.error("❌ Supabase initialization timed out")
        supabase_client = None
    except Exception as e:
        logger.error("❌ Failed to initialize Supabase client", error=str(e))
        logger.warning("⚠️ App will start but Supabase-dependent features will be unavailable")
        supabase_client = None

    # Initialize tool registry service
    try:
        if supabase_client:
            tool_registry = await initialize_tool_registry(supabase_client)
            logger.info("✅ Tool registry service initialized")
        else:
            logger.warning("⚠️ Skipping tool registry initialization (Supabase unavailable)")
            tool_registry = None
    except Exception as e:
        logger.error("❌ Failed to initialize tool registry service", error=str(e))
        tool_registry = None

    try:
        if supabase_client:
            rag_pipeline = MedicalRAGPipeline(supabase_client)
            await asyncio.wait_for(rag_pipeline.initialize(), timeout=5.0)
            logger.info("✅ RAG pipeline initialized")
    except asyncio.TimeoutError:
        logger.error("❌ RAG pipeline initialization timed out")
        rag_pipeline = None
    except Exception as e:
        logger.error("❌ Failed to initialize RAG pipeline", error=str(e))
        rag_pipeline = None

    try:
        if supabase_client:
            unified_rag_service = UnifiedRAGService(supabase_client, cache_manager=cache_manager)
            await asyncio.wait_for(unified_rag_service.initialize(), timeout=5.0)
            logger.info("✅ Unified RAG service initialized", caching_enabled=cache_manager is not None and cache_manager.enabled)
    except asyncio.TimeoutError:
        logger.error("❌ Unified RAG service initialization timed out")
        unified_rag_service = None
    except Exception as e:
        logger.error("❌ Failed to initialize Unified RAG service", error=str(e))
        unified_rag_service = None

    try:
        metadata_processing_service = create_metadata_processing_service(
            use_ai=False,  # Can be enabled if needed
            openai_api_key=settings.openai_api_key
        )
        logger.info("✅ Metadata processing service initialized")
    except Exception as e:
        logger.error("❌ Failed to initialize metadata processing service", error=str(e))
        metadata_processing_service = None

    try:
        if supabase_client and rag_pipeline:
            agent_orchestrator = AgentOrchestrator(supabase_client, rag_pipeline)
            await asyncio.wait_for(agent_orchestrator.initialize(), timeout=5.0)
            logger.info("✅ Agent orchestrator initialized")
    except asyncio.TimeoutError:
        logger.error("❌ Agent orchestrator initialization timed out")
        agent_orchestrator = None
    except Exception as e:
        logger.error("❌ Failed to initialize agent orchestrator", error=str(e))
        agent_orchestrator = None

    try:
        websocket_manager = WebSocketManager()
        logger.info("✅ WebSocket manager initialized")
    except Exception as e:
        logger.error("❌ Failed to initialize WebSocket manager", error=str(e))
        websocket_manager = None

    # Setup monitoring (non-blocking)
    try:
        setup_monitoring()
        logger.info("✅ Monitoring setup complete")
    except Exception as e:
        logger.warning("⚠️ Monitoring setup failed", error=str(e))

    logger.info("✅ AI Services background initialization complete (some services may be unavailable)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management - start immediately, initialize services in background"""
    global agent_orchestrator, rag_pipeline, unified_rag_service, metadata_processing_service, supabase_client, websocket_manager

    logger.info("=" * 80)
    logger.info("🚀 Starting VITAL Path AI Services")
    logger.info("=" * 80)
    
    # Log environment info
    import os
    logger.info(f"📦 Environment:")
    logger.info(f"   - PORT: {os.getenv('PORT', '8000')}")
    logger.info(f"   - PYTHONPATH: {os.getenv('PYTHONPATH', 'not set')}")
    logger.info(f"   - Working Directory: {os.getcwd()}")
    
    # Start services initialization in background task - don't block startup
    # This allows the app to respond to healthchecks immediately
    logger.info("🔄 Starting background service initialization...")
    init_task = asyncio.create_task(initialize_services_background())
    
    # Don't wait for initialization - let it run in background
    # The app can start responding to requests while services initialize
    logger.info("✅ FastAPI app ready - services initializing in background")
    logger.info("✅ Health endpoint available at /health")
    logger.info("=" * 80)
    
    # Set app state for middleware access (must be done before yield)
    app.state.supabase_client = supabase_client
    app.state.limiter = limiter
    logger.info("✅ App state initialized")

    yield
    
    # Cancel background initialization if still running
    if not init_task.done():
        init_task.cancel()
        try:
            await init_task
        except asyncio.CancelledError:
            pass

    # Cleanup
    logger.info("🔄 Shutting down AI Services")
    if agent_orchestrator:
        try:
            await agent_orchestrator.cleanup()
        except Exception as e:
            logger.error("Error cleaning up agent orchestrator", error=str(e))
    if rag_pipeline:
        try:
            await rag_pipeline.cleanup()
        except Exception as e:
            logger.error("Error cleaning up RAG pipeline", error=str(e))
    if unified_rag_service:
        try:
            await unified_rag_service.cleanup()
        except Exception as e:
            logger.error("Error cleaning up unified RAG service", error=str(e))
    if supabase_client:
        try:
            await supabase_client.cleanup()
        except Exception as e:
            logger.error("Error cleaning up Supabase client", error=str(e))

# Create FastAPI app
app = FastAPI(
    title="VITAL Path AI Services",
    description="Medical AI Agent Orchestration with LangChain and Supabase",
    version="2.0.0",
    lifespan=lifespan
)

# Add exception handler for rate limit errors
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add Tenant Isolation Middleware FIRST (before CORS and rate limiting)
# This ensures all requests have tenant context before processing
# Enable in production with proper authentication
is_production = os.getenv("RAILWAY_ENVIRONMENT") == "production" or os.getenv("ENV") == "production"
if is_production:
    app.add_middleware(TenantIsolationMiddleware)
    logger.info("✅ Tenant Isolation Middleware enabled (production mode)")
else:
    logger.info("ℹ️ Tenant Isolation Middleware disabled (development mode)")

# Add Rate Limiting Middleware SECOND (after tenant isolation)
# This enforces rate limits per tenant
# Enable in production
if is_production:
    app.add_middleware(EnhancedRateLimitMiddleware)
    logger.info("✅ Rate Limiting Middleware enabled (production mode)")
else:
    logger.info("ℹ️ Rate Limiting Middleware disabled (development mode)")

# CORS middleware - Configure based on environment
cors_origins = (
    settings.cors_origins if isinstance(settings.cors_origins, list) 
    else (settings.cors_origins.split(",") if isinstance(settings.cors_origins, str) 
          else ["http://localhost:3000", "http://localhost:3001"])
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "x-tenant-id", "x-user-id"],
)

# Include Ask Panel routes
app.include_router(panel_routes.router, prefix="", tags=["ask-panel"])
logger.info("✅ Ask Panel routes registered")

# Include Shared Framework routes (LangGraph, AutoGen, CrewAI)
try:
    from api.frameworks import router as frameworks_router
    app.include_router(frameworks_router, prefix="", tags=["frameworks"])
    logger.info("✅ Shared Framework routes registered (LangGraph, AutoGen, CrewAI)")
except ImportError as e:
    logger.warning(f"⚠️  Could not import frameworks router: {e}")
    logger.warning("   Continuing without shared framework endpoints")

# Dependency to get services
async def get_agent_orchestrator() -> AgentOrchestrator:
    if not agent_orchestrator:
        raise HTTPException(status_code=503, detail="Agent orchestrator not initialized")
    return agent_orchestrator

async def get_rag_pipeline() -> MedicalRAGPipeline:
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG pipeline not initialized")
    return rag_pipeline

async def get_unified_rag_service() -> UnifiedRAGService:
    if not unified_rag_service:
        raise HTTPException(status_code=503, detail="Unified RAG service not initialized")
    return unified_rag_service

async def get_metadata_processing_service() -> MetadataProcessingService:
    if not metadata_processing_service:
        raise HTTPException(status_code=503, detail="Metadata processing service not initialized")
    return metadata_processing_service

async def get_agent_selector_service_dep() -> AgentSelectorService:
    """Dependency to get agent selector service"""
    from services.agent_selector_service import get_agent_selector_service
    return get_agent_selector_service(supabase_client)

async def get_websocket_manager() -> WebSocketManager:
    if not websocket_manager:
        raise HTTPException(status_code=503, detail="WebSocket manager not initialized")
    return websocket_manager

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - simple hello world"""
    return {
        "service": "vital-path-ai-services",
        "version": "2.0.0",
        "status": "running",
        "health": "/health",
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint - always returns healthy to allow app to start
    
    This endpoint responds immediately, even before services initialize.
    This is critical for Railway deployment health checks.
    
    Now includes RLS (Row-Level Security) status for compliance monitoring.
    """
    import time
    global supabase_client, agent_orchestrator, rag_pipeline, unified_rag_service
    
    # Check service availability (non-blocking)
    services_status = {
        "supabase": "healthy" if supabase_client else "unavailable",
        "agent_orchestrator": "healthy" if agent_orchestrator else "unavailable",
        "rag_pipeline": "healthy" if rag_pipeline else "unavailable",
        "unified_rag_service": "healthy" if unified_rag_service else "unavailable"
    }
    
    # Check RLS status (Golden Rule #2: Multi-Tenant Security)
    rls_status = {
        "enabled": "unknown",
        "policies_count": 0,
        "status": "unknown"
    }
    
    if supabase_client and supabase_client.client:
        try:
            # Query RLS policy count
            result = await supabase_client.client.rpc('count_rls_policies').execute()
            if result.data is not None:
                policy_count = result.data
                rls_status = {
                    "enabled": "active" if policy_count > 0 else "inactive",
                    "policies_count": policy_count,
                    "status": "healthy" if policy_count >= 40 else "degraded"
                }
        except Exception as e:
            logger.warning("health_check_rls_query_failed", error=str(e))
            rls_status["status"] = "error"
    
    # App is healthy if it can respond (even if some services are unavailable)
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

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()


# Cache statistics endpoint
@app.get("/cache/stats")
async def get_cache_stats():
    """
    Get cache statistics for monitoring.
    
    Returns cache hit/miss rates for:
    - Global cache manager
    - RAG service cache
    """
    global cache_manager, unified_rag_service
    
    stats = {
        "timestamp": datetime.now().isoformat(),
        "global_cache": None,
        "rag_cache": None,
    }
    
    # Global cache manager stats
    if cache_manager and cache_manager.enabled:
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


@app.post("/api/mode1/manual", response_model=Mode1ManualResponse)
async def execute_mode1_manual(
    request: Mode1ManualRequest,
    fastapi_request: Request,
    tenant_id: str = Depends(get_tenant_id)
):
    """Execute Mode 1 manual interactive workflow via LangGraph"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode1/manual").inc()

    # Allow execution without Supabase for development
    if supabase_client:
        # Set tenant context in database for RLS
        await set_tenant_context_in_db(tenant_id, supabase_client)

    start_time = asyncio.get_event_loop().time()

    try:
        logger.info("🚀 [Mode 1] Executing via LangGraph workflow (Manual agent selection)", agent_id=request.agent_id)
        
        # Initialize LangGraph workflow - Mode2InteractiveManualWorkflow for manual agent selection
        workflow = Mode2InteractiveManualWorkflow(
            supabase_client=supabase_client,
            rag_service=unified_rag_service,
            agent_orchestrator=agent_orchestrator,
            conversation_manager=None  # Will be initialized by workflow
        )
        await workflow.initialize()
        
        # Execute workflow with LangGraph
        result = await workflow.execute(
            tenant_id=tenant_id,
            query=request.message,
            agent_id=request.agent_id,
            session_id=request.session_id,
            user_id=request.user_id,
            enable_rag=request.enable_rag,
            enable_tools=request.enable_tools,
            model=request.model or "gpt-4",
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            selected_rag_domains=request.selected_rag_domains or [],
            conversation_history=[]
        )
        
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        
        # Extract results from LangGraph workflow state
        content = result.get('response', '') or result.get('final_response', '')
        confidence = result.get('confidence', 0.85)
        sources = result.get('sources', [])
        reasoning_steps = result.get('reasoning_steps', [])
        
        # Convert sources to citations
        citations = []
        for idx, source in enumerate(sources, 1):
            citations.append({
                "id": f"citation_{idx}",
                "title": source.get('title', f'Source {idx}'),
                "content": source.get('content', source.get('excerpt', '')),
                "url": source.get('url', ''),
                "similarity_score": source.get('similarity_score', 0.0),
                "metadata": source.get('metadata', {})
            })
        
        # Build metadata
        metadata: Dict[str, Any] = {
            "langgraph_execution": True,
            "workflow": "Mode2InteractiveManualWorkflow",
            "nodes_executed": result.get('nodes_executed', []),
            "reasoning_steps": reasoning_steps,
            "request": {
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "selected_rag_domains": request.selected_rag_domains or [],
                "requested_tools": request.requested_tools or [],
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
                "session_id": request.session_id,
            },
        }
        
        logger.info(
            "✅ [Mode 1] LangGraph workflow completed",
            content_length=len(content),
            citations=len(citations),
            reasoning_steps=len(reasoning_steps),
            confidence=confidence
        )
        
        return Mode1ManualResponse(
            agent_id=request.agent_id,
            content=content,
            confidence=confidence,
            citations=citations,
            reasoning=reasoning_steps,
            metadata=metadata,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 1 LangGraph execution failed", error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Mode 1 execution failed: {str(exc)}")

# Mode 2: Automatic Agent Selection
@app.post("/api/mode2/automatic", response_model=Mode2AutomaticResponse)
async def execute_mode2_automatic(
    request: Mode2AutomaticRequest,
    tenant_id: str = Depends(get_tenant_id)
):
    """Execute Mode 2 automatic agent selection workflow via LangGraph"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode2/automatic").inc()

    # Allow execution without Supabase for development
    if supabase_client:
        # Set tenant context in database for RLS  
        await set_tenant_context_in_db(tenant_id, supabase_client)
    
    start_time = asyncio.get_event_loop().time()

    try:
        logger.info("🚀 [Mode 2] Executing via LangGraph workflow (Automatic agent selection)")
        
        # Initialize LangGraph workflow
        workflow = Mode1InteractiveAutoWorkflow(
            supabase_client=supabase_client,
            agent_selector_service=get_agent_selector_service() if agent_orchestrator else None,
            rag_service=unified_rag_service,
            agent_orchestrator=agent_orchestrator,
            conversation_manager=None
        )
        await workflow.initialize()
        
        # Execute workflow
        result = await workflow.execute(
            tenant_id=tenant_id,
            query=request.message,
            session_id=request.session_id,
            user_id=request.user_id,
            enable_rag=request.enable_rag,
            enable_tools=request.enable_tools,
            model=request.model or "gpt-4",
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            selected_rag_domains=request.selected_rag_domains or [],
            conversation_history=[]
        )
        
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        
        # Extract results
        content = result.get('response', '') or result.get('final_response', '')
        confidence = result.get('confidence', 0.85)
        sources = result.get('sources', [])
        reasoning_steps = result.get('reasoning_steps', [])
        selected_agent_id = result.get('selected_agent_id', '') or result.get('agent_id', '')
        
        # Convert sources to citations
        citations = []
        for idx, source in enumerate(sources, 1):
            citations.append({
                "id": f"citation_{idx}",
                "title": source.get('title', f'Source {idx}'),
                "content": source.get('content', source.get('excerpt', '')),
                "url": source.get('url', ''),
                "similarity_score": source.get('similarity_score', 0.0),
                "metadata": source.get('metadata', {})
            })
        
        # Agent selection metadata
        agent_selection_metadata = {
            "selected_agent_id": selected_agent_id,
            "selected_agent_name": result.get('selected_agent_name', 'Auto-selected'),
            "selection_method": "langgraph_ml_selection",
            "candidate_count": result.get('candidate_count', 0),
            "selection_confidence": result.get('selection_confidence', 0.85),
        }
        
        metadata: Dict[str, Any] = {
            "langgraph_execution": True,
            "workflow": "Mode1InteractiveAutoWorkflow",
            "nodes_executed": result.get('nodes_executed', []),
            "reasoning_steps": reasoning_steps,
            "request": {
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "selected_rag_domains": request.selected_rag_domains or [],
                "requested_tools": request.requested_tools or [],
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
                "session_id": request.session_id,
            },
        }
        
        logger.info(
            "✅ [Mode 2] LangGraph workflow completed",
            content_length=len(content),
            citations=len(citations),
            reasoning_steps=len(reasoning_steps),
            selected_agent=selected_agent_id,
            confidence=confidence
        )
        
        return Mode2AutomaticResponse(
            agent_id=selected_agent_id,
            content=content,
            confidence=confidence,
            citations=citations,
            reasoning=reasoning_steps,
            agent_selection=agent_selection_metadata,
            metadata=metadata,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 2 LangGraph execution failed", error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Mode 2 execution failed: {str(exc)}")

# Mode 3: Autonomous-Automatic
@app.post("/api/mode3/autonomous-automatic", response_model=Mode3AutonomousAutomaticResponse)
async def execute_mode3_autonomous_automatic(
    request: Mode3AutonomousAutomaticRequest,
    tenant_id: str = Depends(get_tenant_id)
):
    """Execute Mode 3 autonomous-automatic workflow via LangGraph"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode3/autonomous-automatic").inc()

    # Allow execution without Supabase for development
    if supabase_client:
        await set_tenant_context_in_db(tenant_id, supabase_client)
    
    start_time = asyncio.get_event_loop().time()

    try:
        logger.info("🚀 [Mode 3] Executing via LangGraph workflow (Autonomous + Auto agent selection)")
        
        # Initialize LangGraph workflow with autonomous capabilities
        workflow = Mode3AutonomousAutoWorkflow(
            supabase_client=supabase_client,
            agent_selector_service=get_agent_selector_service() if agent_orchestrator else None,
            rag_service=unified_rag_service,
            agent_orchestrator=agent_orchestrator,
            conversation_manager=None
        )
        await workflow.initialize()
        
        # Execute workflow
        result = await workflow.execute(
            tenant_id=tenant_id,
            query=request.message,
            session_id=request.session_id,
            user_id=request.user_id,
            enable_rag=request.enable_rag,
            enable_tools=request.enable_tools,
            model=request.model or "gpt-4",
            max_iterations=request.max_iterations or 10,
            confidence_threshold=request.confidence_threshold or 0.95,
            conversation_history=[]
        )
        
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        
        # Extract results
        content = result.get('response', '') or result.get('final_response', '')
        confidence = result.get('confidence', 0.90)
        sources = result.get('sources', [])
        reasoning_steps = result.get('reasoning_steps', [])
        selected_agent_id = result.get('selected_agent_id', '') or result.get('agent_id', '')
        
        # Convert sources to citations
        citations = []
        for idx, source in enumerate(sources, 1):
            citations.append({
                "id": f"citation_{idx}",
                "title": source.get('title', f'Source {idx}'),
                "content": source.get('content', source.get('excerpt', '')),
                "url": source.get('url', ''),
                "similarity_score": source.get('similarity_score', 0.0),
                "metadata": source.get('metadata', {})
            })
        
        # Autonomous reasoning metadata
        autonomous_reasoning_metadata = {
            "iterations": result.get('iterations', 0),
            "tools_used": result.get('tools_used', []),
            "reasoning_steps": reasoning_steps,
            "confidence_threshold": request.confidence_threshold or 0.95,
            "max_iterations": request.max_iterations or 10,
            "strategy": result.get('strategy', 'react'),
        }
        
        # Agent selection metadata
        agent_selection_metadata = {
            "selected_agent_id": selected_agent_id,
            "selected_agent_name": result.get('selected_agent_name', 'Auto-selected'),
            "selection_method": "langgraph_ml_selection",
            "selection_confidence": result.get('selection_confidence', 0.85),
        }
        
        metadata: Dict[str, Any] = {
            "langgraph_execution": True,
            "workflow": "Mode3AutonomousAutoWorkflow",
            "nodes_executed": result.get('nodes_executed', []),
            "request": {
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "max_iterations": request.max_iterations,
                "confidence_threshold": request.confidence_threshold,
            },
        }
        
        logger.info(
            "✅ [Mode 3] LangGraph workflow completed",
            content_length=len(content),
            citations=len(citations),
            reasoning_steps=len(reasoning_steps),
            iterations=autonomous_reasoning_metadata['iterations'],
            confidence=confidence
        )
        
        return Mode3AutonomousAutomaticResponse(
            agent_id=selected_agent_id,
            content=content,
            confidence=confidence,
            citations=citations,
            reasoning=reasoning_steps,
            autonomous_reasoning=autonomous_reasoning_metadata,
            agent_selection=agent_selection_metadata,
            metadata=metadata,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 3 LangGraph execution failed", error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Mode 3 execution failed: {str(exc)}")

# Mode 4: Autonomous-Manual
@app.post("/api/mode4/autonomous-manual", response_model=Mode4AutonomousManualResponse)
async def execute_mode4_autonomous_manual(
    request: Mode4AutonomousManualRequest,
    tenant_id: str = Depends(get_tenant_id)
):
    """Execute Mode 4 autonomous-manual workflow via LangGraph"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode4/autonomous-manual").inc()

    # Allow execution without Supabase for development
    if supabase_client:
        await set_tenant_context_in_db(tenant_id, supabase_client)
    
    start_time = asyncio.get_event_loop().time()

    try:
        logger.info("🚀 [Mode 4] Executing via LangGraph workflow (Autonomous + Manual agent selection)", agent_id=request.agent_id)
        
        # Initialize LangGraph workflow with autonomous capabilities
        workflow = Mode4AutonomousManualWorkflow(
            supabase_client=supabase_client,
            rag_service=unified_rag_service,
            agent_orchestrator=agent_orchestrator,
            conversation_manager=None
        )
        await workflow.initialize()
        
        # Execute workflow
        result = await workflow.execute(
            tenant_id=tenant_id,
            query=request.message,
            agent_id=request.agent_id,
            session_id=request.session_id,
            user_id=request.user_id,
            enable_rag=request.enable_rag,
            enable_tools=request.enable_tools,
            model=request.model or "gpt-4",
            max_iterations=request.max_iterations or 10,
            confidence_threshold=request.confidence_threshold or 0.95,
            conversation_history=[]
        )
        
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        
        # Extract results
        content = result.get('response', '') or result.get('final_response', '')
        confidence = result.get('confidence', 0.90)
        sources = result.get('sources', [])
        reasoning_steps = result.get('reasoning_steps', [])
        
        # Convert sources to citations
        citations = []
        for idx, source in enumerate(sources, 1):
            citations.append({
                "id": f"citation_{idx}",
                "title": source.get('title', f'Source {idx}'),
                "content": source.get('content', source.get('excerpt', '')),
                "url": source.get('url', ''),
                "similarity_score": source.get('similarity_score', 0.0),
                "metadata": source.get('metadata', {})
            })
        
        # Autonomous reasoning metadata
        autonomous_reasoning_metadata = {
            "iterations": result.get('iterations', 0),
            "tools_used": result.get('tools_used', []),
            "reasoning_steps": reasoning_steps,
            "confidence_threshold": request.confidence_threshold or 0.95,
            "max_iterations": request.max_iterations or 10,
            "strategy": result.get('strategy', 'react'),
            "final_answer_validated": result.get('validated', True),
        }
        
        metadata: Dict[str, Any] = {
            "langgraph_execution": True,
            "workflow": "Mode4AutonomousManualWorkflow",
            "nodes_executed": result.get('nodes_executed', []),
            "request": {
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "max_iterations": request.max_iterations,
                "confidence_threshold": request.confidence_threshold,
            },
        }
        
        logger.info(
            "✅ [Mode 4] LangGraph workflow completed",
            content_length=len(content),
            citations=len(citations),
            reasoning_steps=len(reasoning_steps),
            iterations=autonomous_reasoning_metadata['iterations'],
            confidence=confidence
        )
        
        return Mode4AutonomousManualResponse(
            agent_id=request.agent_id,
            content=content,
            confidence=confidence,
            citations=citations,
            reasoning=reasoning_steps,
            autonomous_reasoning=autonomous_reasoning_metadata,
            metadata=metadata,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 4 LangGraph execution failed", error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Mode 4 execution failed: {str(exc)}")


# ============================================================================
# Phase 3.3: User Stop API for Autonomous Execution
# ============================================================================

class StopAutonomousRequest(BaseModel):
    """Request to stop an autonomous execution."""
    session_id: str = Field(..., description="Session ID of the autonomous execution to stop")
    tenant_id: Optional[str] = Field(None, description="Tenant ID for validation")


class StopAutonomousResponse(BaseModel):
    """Response after requesting stop."""
    session_id: str
    stop_requested: bool
    message: str
    timestamp: str


@app.post("/api/autonomous/stop", response_model=StopAutonomousResponse)
async def stop_autonomous_execution(request: StopAutonomousRequest):
    """
    Request an autonomous execution to stop gracefully.
    
    This sets a flag in the database that the AutonomousController
    checks during each iteration. The execution will stop after
    completing the current iteration.
    
    Phase 3.3: User intervention capability for autonomous modes.
    """
    REQUEST_COUNT.labels(method="POST", endpoint="/api/autonomous/stop").inc()
    
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")
    
    try:
        logger.info("🛑 Stop request received", session_id=request.session_id)
        
        # Update autonomous_control_state table to set stop_requested=true
        result = supabase_client.client.table('autonomous_control_state')\
            .update({'stop_requested': True})\
            .eq('session_id', request.session_id)\
            .execute()
        
        if not result.data:
            # Session not found - might already be completed
            logger.warning("Session not found in autonomous_control_state", 
                          session_id=request.session_id)
            raise HTTPException(
                status_code=404, 
                detail=f"Autonomous session '{request.session_id}' not found or already completed"
            )
        
        logger.info("✅ Stop flag set", session_id=request.session_id)
        
        return StopAutonomousResponse(
            session_id=request.session_id,
            stop_requested=True,
            message="Stop request sent. Execution will halt after current iteration.",
            timestamp=datetime.utcnow().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Stop request failed", error=str(exc), session_id=request.session_id)
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to request stop: {str(exc)}"
        )


@app.get("/api/autonomous/status/{session_id}")
async def get_autonomous_status(session_id: str):
    """
    Get the current status of an autonomous execution.
    
    Returns information about cost, runtime, progress, and whether
    a stop has been requested.
    """
    REQUEST_COUNT.labels(method="GET", endpoint="/api/autonomous/status").inc()
    
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")
    
    try:
        result = supabase_client.client.table('autonomous_control_state')\
            .select('*')\
            .eq('session_id', session_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=404,
                detail=f"Session '{session_id}' not found"
            )
        
        state = result.data[0]
        
        # Calculate elapsed time
        started_at = datetime.fromisoformat(state['started_at'].replace('Z', '+00:00'))
        elapsed_minutes = (datetime.now(started_at.tzinfo) - started_at).total_seconds() / 60.0
        
        return {
            "session_id": session_id,
            "stop_requested": state.get('stop_requested', False),
            "current_cost_usd": state.get('current_cost_usd', 0.0),
            "cost_limit_usd": state.get('cost_limit_usd', 10.0),
            "cost_remaining_usd": state.get('cost_limit_usd', 10.0) - state.get('current_cost_usd', 0.0),
            "runtime_limit_minutes": state.get('runtime_limit_minutes', 30),
            "elapsed_minutes": elapsed_minutes,
            "started_at": state['started_at'],
            "expires_at": state.get('expires_at')
        }
        
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Status check failed", error=str(exc), session_id=session_id)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get status: {str(exc)}"
        )


# ============================================================================
# Panel Orchestration Endpoint
# ============================================================================

class PanelOrchestrationRequest(BaseModel):
    """Payload for panel orchestration requests"""
    message: str = Field(..., min_length=1, description="Panel consultation question")
    panel: Dict[str, Any] = Field(..., description="Panel configuration with members")
    mode: Optional[str] = Field("parallel", description="Orchestration mode: parallel, sequential, consensus")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    user_id: Optional[str] = Field(None, description="User executing the request")
    tenant_id: Optional[str] = Field(None, description="Tenant/organization identifier")
    session_id: Optional[str] = Field(None, description="Session identifier")


class PanelOrchestrationResponse(BaseModel):
    """Response payload for panel orchestration requests"""
    response: str = Field(..., description="Panel consensus/recommendation")
    metadata: Dict[str, Any] = Field(..., description="Panel orchestration metadata")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")


@app.post("/api/panel/orchestrate", response_model=PanelOrchestrationResponse)
async def orchestrate_panel(
    request: PanelOrchestrationRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """Execute panel orchestration workflow via Python orchestration"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/panel/orchestrate").inc()

    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")

    start_time = asyncio.get_event_loop().time()

    try:
        logger.info("🎭 Panel orchestration request",
                   message_preview=request.message[:100],
                   panel_size=len(request.panel.get("members", [])))

        # Extract panel members (agents)
        panel_members = request.panel.get("members", [])
        if not panel_members:
            raise HTTPException(status_code=400, detail="Panel must have at least one member")

        # For now, process with the first agent (can be enhanced with multi-agent consensus later)
        # TODO: Implement full multi-agent panel orchestration with consensus building
        first_agent = panel_members[0].get("agent") if panel_members else {}
        agent_id = first_agent.get("id") if isinstance(first_agent, dict) else None
        
        if not agent_id:
            raise HTTPException(status_code=400, detail="Panel members must have agent IDs")

        # Get agent record
        agent_record = await supabase_client.get_agent_by_id(agent_id)
        agent_type = (
            (agent_record.get("type") if agent_record else None)
            or (agent_record.get("agent_type") if agent_record else None)
            or "regulatory_expert"
        )

        # Execute query with agent
        query_request = AgentQueryRequest(
            agent_id=agent_id,
            agent_type=agent_type,
            query=request.message,
            user_id=request.user_id,
            organization_id=request.tenant_id,
            max_context_docs=15,
            similarity_threshold=0.7,
            include_citations=True,
            include_confidence_scores=True,
            include_medical_context=True,
            response_format="detailed",
            pharma_protocol_required=False,
            verify_protocol_required=True,
            hipaa_compliant=True,
        )

        response: AgentQueryResponse = await orchestrator.process_query(query_request)

        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000

        # Panel metadata (simplified - can be enhanced with multi-agent consensus)
        metadata = {
            "mode": request.mode,
            "panel_size": len(panel_members),
            "session_id": request.session_id,
            "consensus": [response.response],  # TODO: Build actual consensus from multiple agents
            "dissent": [],
            "expert_responses": [{
                "expert_id": agent_id,
                "expert_name": agent_record.get("name") if agent_record else "Unknown",
                "content": response.response,
                "confidence": response.confidence,
                "citations": response.citations or [],
            }],
            "processing_metadata": response.processing_metadata,
            "compliance_protocols": response.compliance_protocols,
            "timestamp": datetime.now().isoformat(),
        }

        return PanelOrchestrationResponse(
            response=response.response,
            metadata=metadata,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Panel orchestration failed", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Panel orchestration failed: {str(exc)}")


# Agent Query Endpoint
@app.post("/api/agents/query", response_model=AgentQueryResponse)
async def query_agent(
    request: AgentQueryRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """Query medical AI agent with enhanced orchestration"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/agents/query").inc()

    try:
        logger.info("🧠 Processing agent query",
                   agent_type=request.agent_type,
                   query_length=len(request.query))

        response = await orchestrator.process_query(request)

        logger.info("✅ Agent query completed",
                   response_confidence=response.confidence,
                   citations_count=len(response.citations))

        return response

    except Exception as e:
        logger.error("❌ Agent query failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Agent query failed: {str(e)}")

# Agent Selection Endpoint
@app.post("/api/agents/select", response_model=QueryAnalysisResponse)
async def analyze_query_for_agent_selection(
    request: QueryAnalysisRequest,
    selector_service: AgentSelectorService = Depends(get_agent_selector_service_dep)
):
    """
    Analyze query for agent selection
    
    Provides query analysis with intent, domains, complexity, and keywords
    for intelligent agent selection.
    
    Following enterprise-grade standards:
    - Structured logging with correlation IDs
    - Comprehensive error handling with fallbacks
    - Type safety with Pydantic models
    - Performance metrics tracking
    """
    REQUEST_COUNT.labels(method="POST", endpoint="/api/agents/select").inc()
    
    start_time = asyncio.get_event_loop().time()
    
    try:
        logger.info(
            "🔍 Starting query analysis for agent selection",
            query_preview=request.query[:100],
            correlation_id=request.correlation_id,
            user_id=request.user_id,
            tenant_id=request.tenant_id
        )
        
        # Analyze query using Python service
        analysis = await selector_service.analyze_query(
            query=request.query,
            correlation_id=request.correlation_id or f"req_{datetime.now().timestamp()}"
        )
        
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        
        logger.info(
            "✅ Query analysis completed",
            intent=analysis.intent,
            domains=analysis.domains,
            complexity=analysis.complexity,
            confidence=analysis.confidence,
            processing_time_ms=processing_time_ms,
            correlation_id=analysis.correlation_id
        )
        
        return analysis
        
    except ValueError as e:
        logger.error(
            "❌ Invalid query analysis request",
            error=str(e),
            correlation_id=request.correlation_id
        )
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
        
    except Exception as e:
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        logger.error(
            "❌ Query analysis failed",
            error=str(e),
            error_type=type(e).__name__,
            processing_time_ms=processing_time_ms,
            correlation_id=request.correlation_id
        )
        raise HTTPException(
            status_code=500,
            detail=f"Query analysis failed: {str(e)}"
        )

# RAG Search Endpoint (Unified Service)
@app.post("/api/rag/query")
async def query_rag(
    request: dict,
    rag_service: UnifiedRAGService = Depends(get_unified_rag_service)
):
    """Unified RAG query endpoint supporting multiple strategies"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/rag/query").inc()

    try:
        query_text = request.get("query") or request.get("text")
        if not query_text:
            raise HTTPException(status_code=400, detail="query or text is required")

        strategy = request.get("strategy", "hybrid")
        domain_ids = request.get("domain_ids") or request.get("selectedRagDomains")
        filters = request.get("filters", {})
        max_results = request.get("max_results") or request.get("maxResults", 10)
        similarity_threshold = request.get("similarity_threshold") or request.get("similarityThreshold", 0.7)
        agent_id = request.get("agent_id") or request.get("agentId")
        user_id = request.get("user_id") or request.get("userId")
        session_id = request.get("session_id") or request.get("sessionId")

        logger.info("🔍 Processing RAG query", query=query_text[:100], strategy=strategy)

        response = await rag_service.query(
            query_text=query_text,
            strategy=strategy,
            domain_ids=domain_ids,
            filters=filters,
            max_results=max_results,
            similarity_threshold=similarity_threshold,
            agent_id=agent_id,
            user_id=user_id,
            session_id=session_id,
        )

        logger.info("✅ RAG query completed", 
                   results_count=len(response.get("sources", [])),
                   strategy=strategy)

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error("❌ RAG query failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")

# Legacy RAG Search Endpoint (for backward compatibility)
@app.post("/api/rag/search", response_model=RAGSearchResponse)
async def search_rag(
    request: RAGSearchRequest,
    rag: MedicalRAGPipeline = Depends(get_rag_pipeline)
):
    """Search medical knowledge base using RAG (legacy endpoint)"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/rag/search").inc()

    try:
        logger.info("🔍 Processing RAG search", query=request.query[:100])

        response = await rag.enhanced_search(
            query=request.query,
            filters=request.filters,
            max_results=request.max_results,
            similarity_threshold=request.similarity_threshold
        )

        logger.info("✅ RAG search completed", results_count=len(response.results))

        return response

    except Exception as e:
        logger.error("❌ RAG search failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"RAG search failed: {str(e)}")

# Agent Creation Endpoint
@app.post("/api/agents/create", response_model=AgentCreationResponse)
async def create_agent(
    request: AgentCreationRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """Create new medical AI agent"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/agents/create").inc()

    try:
        logger.info("🤖 Creating new agent", agent_name=request.name)

        response = await orchestrator.create_agent(request)

        logger.info("✅ Agent created successfully", agent_id=response.agent_id)

        return response

    except Exception as e:
        logger.error("❌ Agent creation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Agent creation failed: {str(e)}")

# Prompt Generation Endpoint
@app.post("/api/prompts/generate", response_model=PromptGenerationResponse)
async def generate_prompt(
    request: PromptGenerationRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """Generate medical-grade system prompts with PHARMA/VERIFY protocols"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/prompts/generate").inc()

    try:
        logger.info("📝 Generating system prompt",
                   capabilities_count=len(request.selected_capabilities))

        response = await orchestrator.generate_system_prompt(request)

        logger.info("✅ System prompt generated",
                   token_count=response.metadata.token_count)

        return response

    except Exception as e:
        logger.error("❌ Prompt generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Prompt generation failed: {str(e)}")

async def get_supabase_client() -> SupabaseClient:
    """Dependency to get Supabase client"""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")
    return supabase_client

# Chat Completions Endpoint (OpenAI-compatible)
class ChatCompletionMessage(BaseModel):
    """Chat completion message"""
    role: str = Field(..., description="Message role (system, user, assistant)")
    content: str = Field(..., description="Message content")


class ChatCompletionRequest(BaseModel):
    """Chat completion request (OpenAI-compatible)"""
    messages: List[ChatCompletionMessage] = Field(..., min_items=1, description="Conversation messages")
    model: Optional[str] = Field("gpt-4-turbo-preview", description="Model to use")
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(4096, ge=1, le=16000, description="Maximum tokens to generate")
    stream: Optional[bool] = Field(False, description="Whether to stream the response")
    agent_id: Optional[str] = Field(None, description="Optional agent ID for context")


@app.post("/v1/chat/completions")
async def chat_completions(
    request: ChatCompletionRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """
    OpenAI-compatible chat completions endpoint
    
    Supports both streaming and non-streaming responses.
    Enterprise-grade implementation with:
    - Proper error handling and validation
    - Structured logging with correlation IDs
    - Performance metrics tracking
    - Type safety with Pydantic models
    """
    REQUEST_COUNT.labels(method="POST", endpoint="/v1/chat/completions").inc()
    
    start_time = asyncio.get_event_loop().time()
    correlation_id = f"chat_{datetime.now().timestamp()}"
    
    try:
        logger.info(
            "💬 Chat completion request",
            correlation_id=correlation_id,
            model=request.model,
            message_count=len(request.messages),
            stream=request.stream,
            agent_id=request.agent_id
        )
        
        # Get system and user messages
        system_message = None
        user_messages = []
        
        for msg in request.messages:
            if msg.role == "system":
                system_message = msg.content
            elif msg.role == "user":
                user_messages.append(msg.content)
        
        # Combine user messages if multiple
        user_content = "\n\n".join(user_messages) if user_messages else ""
        
        if not user_content:
            raise HTTPException(status_code=400, detail="At least one user message is required")
        
        # Use OpenAI client for chat completions
        from openai import OpenAI
        openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Build messages for OpenAI API
        openai_messages = []
        if system_message:
            openai_messages.append({"role": "system", "content": system_message})
        openai_messages.append({"role": "user", "content": user_content})
        
        # Handle streaming
        if request.stream:
            async def generate_stream():
                """Generate streaming response"""
                try:
                    stream = openai_client.chat.completions.create(
                        model=request.model or "gpt-4-turbo-preview",
                        messages=openai_messages,
                        temperature=request.temperature,
                        max_tokens=request.max_tokens,
                        stream=True,
                        timeout=120.0
                    )
                    
                    for chunk in stream:
                        if chunk.choices and len(chunk.choices) > 0:
                            delta = chunk.choices[0].delta
                            chunk_data = {
                                "id": f"chatcmpl-{correlation_id}",
                                "object": "chat.completion.chunk",
                                "created": int(datetime.now().timestamp()),
                                "model": request.model or "gpt-4-turbo-preview",
                                "choices": [{
                                    "index": 0,
                                    "delta": {
                                        "content": delta.content if delta.content else "",
                                        "role": delta.role if delta.role else None
                                    },
                                    "finish_reason": chunk.choices[0].finish_reason if chunk.choices[0].finish_reason else None
                                }]
                            }
                            
                            # Format as SSE
                            yield f"data: {json.dumps(chunk_data)}\n\n"
                    
                    # Send [DONE] marker
                    yield "data: [DONE]\n\n"
                    
                    # Log completion
                    processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
                    logger.info(
                        "✅ Chat completion streamed",
                        correlation_id=correlation_id,
                        processing_time_ms=processing_time_ms
                    )
                    
                except Exception as e:
                    logger.error(
                        "❌ Chat completion streaming failed",
                        correlation_id=correlation_id,
                        error=str(e),
                        error_type=type(e).__name__
                    )
                    error_data = {
                        "error": {
                            "message": str(e),
                            "type": type(e).__name__,
                            "param": None,
                            "code": None
                        }
                    }
                    yield f"data: {json.dumps(error_data)}\n\n"
            
            return StreamingResponse(
                generate_stream(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        
        # Handle non-streaming
        else:
            response = openai_client.chat.completions.create(
                model=request.model or "gpt-4-turbo-preview",
                messages=openai_messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                timeout=120.0
            )
            
            processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
            
            logger.info(
                "✅ Chat completion completed",
                correlation_id=correlation_id,
                processing_time_ms=processing_time_ms,
                model=response.model,
                usage=response.usage.dict() if hasattr(response, 'usage') and response.usage else None
            )
            
            return {
                "id": f"chatcmpl-{correlation_id}",
                "object": "chat.completion",
                "created": int(datetime.now().timestamp()),
                "model": response.model,
                "choices": [{
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response.choices[0].message.content
                    },
                    "finish_reason": response.choices[0].finish_reason
                }],
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens if hasattr(response, 'usage') and response.usage else 0,
                    "completion_tokens": response.usage.completion_tokens if hasattr(response, 'usage') and response.usage else 0,
                    "total_tokens": response.usage.total_tokens if hasattr(response, 'usage') and response.usage else 0
                }
            }
    
    except ValueError as e:
        logger.error(
            "❌ Invalid chat completion request",
            correlation_id=correlation_id,
            error=str(e)
        )
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
        
    except Exception as e:
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        logger.error(
            "❌ Chat completion failed",
            correlation_id=correlation_id,
            error=str(e),
            error_type=type(e).__name__,
            processing_time_ms=processing_time_ms
        )
        raise HTTPException(
            status_code=500,
            detail=f"Chat completion failed: {str(e)}"
        )

# Embedding Generation Endpoint
class EmbeddingGenerationRequest(BaseModel):
    """Request for embedding generation"""
    text: str = Field(..., description="Text to generate embedding for")
    model: Optional[str] = Field(None, description="Embedding model name (optional, uses default if not specified)")
    provider: Optional[str] = Field(None, description="Provider: 'openai' or 'huggingface' (auto-detects if not specified)")
    dimensions: Optional[int] = Field(None, description="Embedding dimensions (for OpenAI text-embedding-3 models)")
    normalize: Optional[bool] = Field(True, description="Whether to normalize the embedding vector")

class EmbeddingGenerationResponse(BaseModel):
    """Response for embedding generation"""
    embedding: List[float] = Field(..., description="Embedding vector")
    model: str = Field(..., description="Model used for generation")
    dimensions: int = Field(..., description="Embedding dimensions")
    provider: str = Field(..., description="Provider used")
    usage: Dict[str, Any] = Field(default_factory=dict, description="Usage information")

@app.post("/api/embeddings/generate", response_model=EmbeddingGenerationResponse)
async def generate_embedding(
    request: EmbeddingGenerationRequest,
):
    """Generate embedding for text using configured provider"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/embeddings/generate").inc()
    
    try:
        from services.embedding_service_factory import EmbeddingServiceFactory
        import math
        
        logger.info("🔢 Generating embedding", 
                   text_length=len(request.text),
                   model=request.model,
                   provider=request.provider)
        
        # Create embedding service
        embedding_service = EmbeddingServiceFactory.create(
            provider=request.provider,
            model_name=request.model
        )
        
        # Generate embedding
        embedding = await embedding_service.generate_embedding(
            request.text,
            normalize=request.normalize if request.normalize is not None else True
        )
        
        # Get model info
        model_name = embedding_service.get_model_name() if hasattr(embedding_service, 'get_model_name') else (request.model or 'default')
        dimensions = embedding_service.get_dimensions()
        provider = request.provider or settings.embedding_provider.lower()
        
        # Estimate usage (tokens approximated as 4 chars per token)
        estimated_tokens = math.ceil(len(request.text) / 4)
        
        logger.info("✅ Embedding generated", 
                   dimensions=dimensions,
                   model=model_name,
                   provider=provider)
        
        return EmbeddingGenerationResponse(
            embedding=embedding,
            model=model_name,
            dimensions=dimensions,
            provider=provider,
            usage={
                "prompt_tokens": estimated_tokens,
                "total_tokens": estimated_tokens
            }
        )
    
    except Exception as e:
        logger.error("❌ Embedding generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

@app.post("/api/embeddings/generate/batch")
async def generate_embeddings_batch(
    request: Dict[str, Any],
):
    """Generate embeddings for multiple texts"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/embeddings/generate/batch").inc()
    
    try:
        from services.embedding_service_factory import EmbeddingServiceFactory
        import math
        
        texts = request.get("texts", [])
        model = request.get("model")
        provider = request.get("provider")
        normalize = request.get("normalize", True)
        
        if not texts or not isinstance(texts, list):
            raise HTTPException(status_code=400, detail="texts array is required")
        
        logger.info("🔢 Generating batch embeddings", 
                   count=len(texts),
                   model=model,
                   provider=provider)
        
        # Create embedding service
        embedding_service = EmbeddingServiceFactory.create(
            provider=provider,
            model_name=model
        )
        
        # Generate embeddings
        embeddings = await embedding_service.generate_embeddings_batch(
            texts,
            normalize=normalize
        )
        
        # Get model info
        model_name = embedding_service.get_model_name() if hasattr(embedding_service, 'get_model_name') else (model or 'default')
        dimensions = embedding_service.get_dimensions()
        provider_used = provider or settings.embedding_provider.lower()
        
        # Estimate usage
        total_chars = sum(len(text) for text in texts)
        estimated_tokens = math.ceil(total_chars / 4)
        
        logger.info("✅ Batch embeddings generated", 
                   count=len(embeddings),
                   dimensions=dimensions,
                   model=model_name)
        
        return {
            "embeddings": embeddings,
            "model": model_name,
            "dimensions": dimensions,
            "provider": provider_used,
            "usage": {
                "prompt_tokens": estimated_tokens,
                "total_tokens": estimated_tokens
            }
        }
    
    except Exception as e:
        logger.error("❌ Batch embedding generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Batch embedding generation failed: {str(e)}")

# Agent Statistics Endpoint
@app.get("/api/agents/{agent_id}/stats")
async def get_agent_stats(
    agent_id: str,
    days: int = 7,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """Get comprehensive agent statistics from agent_metrics table"""
    REQUEST_COUNT.labels(method="GET", endpoint="/api/agents/{agent_id}/stats").inc()
    
    try:
        logger.info("📊 Fetching agent stats", agent_id=agent_id, days=days)
        
        stats = await supabase.get_agent_stats(agent_id, days=days)
        
        return {
            "success": True,
            "data": stats
        }
    
    except Exception as e:
        logger.error("❌ Failed to get agent stats", agent_id=agent_id, error=str(e))
        # Return empty stats instead of synthetic data
        return {
            "success": True,
            "data": {
                "totalConsultations": 0,
                "satisfactionScore": 0.0,
                "successRate": 0.0,
                "averageResponseTime": 0.0,
                "certifications": [],
                "totalTokensUsed": 0,
                "totalCost": 0.0,
                "confidenceLevel": 0,
                "availability": "offline",
                "recentFeedback": []
            }
        }

# WebSocket endpoint for real-time agent communication
@app.websocket("/ws/agents/{agent_id}")
async def websocket_agent_chat(
    websocket: WebSocket,
    agent_id: str,
    ws_manager: WebSocketManager = Depends(get_websocket_manager),
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """WebSocket endpoint for real-time agent interaction"""
    await ws_manager.connect(websocket, agent_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            logger.info("💬 WebSocket message received",
                       agent_id=agent_id,
                       message_type=message.get('type'))

            # Process message through orchestrator
            response = await orchestrator.process_websocket_message(
                agent_id=agent_id,
                message=message
            )

            # Send response back to client
            await websocket.send_text(json.dumps(response))

            # Broadcast to other connections if needed
            if message.get('broadcast', False):
                await ws_manager.broadcast_to_agent(agent_id, response)

    except WebSocketDisconnect:
        logger.info("🔌 WebSocket disconnected", agent_id=agent_id)
        await ws_manager.disconnect(websocket, agent_id)
    except Exception as e:
        logger.error("❌ WebSocket error", agent_id=agent_id, error=str(e))
        await ws_manager.disconnect(websocket, agent_id)

# WebSocket endpoint for system monitoring
@app.websocket("/ws/monitoring")
async def websocket_monitoring(
    websocket: WebSocket,
    ws_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """WebSocket endpoint for real-time system monitoring"""
    await ws_manager.connect_monitoring(websocket)

    try:
        # Send periodic system status updates
        while True:
            status = await get_system_status()
            await websocket.send_text(json.dumps(status))
            await asyncio.sleep(5)  # Send updates every 5 seconds

    except WebSocketDisconnect:
        logger.info("🔌 Monitoring WebSocket disconnected")
        await ws_manager.disconnect_monitoring(websocket)

async def get_system_status() -> Dict[str, Any]:
    """Get current system status for monitoring"""
    global agent_orchestrator, rag_pipeline

    status = {
        "timestamp": asyncio.get_event_loop().time(),
        "services": {
            "agent_orchestrator": "healthy" if agent_orchestrator else "unhealthy",
            "rag_pipeline": "healthy" if rag_pipeline else "unhealthy",
            "unified_rag_service": "healthy" if unified_rag_service else "unhealthy",
            "metadata_processing_service": "healthy" if metadata_processing_service else "unhealthy",
            "supabase_client": "healthy" if supabase_client else "unhealthy"
        },
        "metrics": {
            "active_agents": await agent_orchestrator.get_active_agent_count() if agent_orchestrator else 0,
            "total_queries": REQUEST_COUNT._value.sum(),
        }
    }

    return status

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
