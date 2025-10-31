"""
VITAL Path AI Services - FastAPI Backend
Medical AI Agent Orchestration with LangChain
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import structlog
from prometheus_client import Counter, Histogram, generate_latest
from typing import List, Dict, Any, Optional
import asyncio
import json
from pydantic import BaseModel, Field

from services.agent_orchestrator import AgentOrchestrator
from services.medical_rag import MedicalRAGPipeline
from services.unified_rag_service import UnifiedRAGService
from services.supabase_client import SupabaseClient
from services.metadata_processing_service import MetadataProcessingService, create_metadata_processing_service
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    global agent_orchestrator, rag_pipeline, unified_rag_service, metadata_processing_service, supabase_client, websocket_manager

    logger.info("🚀 Starting VITAL Path AI Services")

    # Initialize services
    supabase_client = SupabaseClient()
    await supabase_client.initialize()

    rag_pipeline = MedicalRAGPipeline(supabase_client)
    await rag_pipeline.initialize()

    unified_rag_service = UnifiedRAGService(supabase_client)
    await unified_rag_service.initialize()

    metadata_processing_service = create_metadata_processing_service(
        use_ai=False,  # Can be enabled if needed
        openai_api_key=settings.openai_api_key
    )

    agent_orchestrator = AgentOrchestrator(supabase_client, rag_pipeline)
    await agent_orchestrator.initialize()

    websocket_manager = WebSocketManager()

    # Setup monitoring
    setup_monitoring()

    logger.info("✅ AI Services initialized successfully")

    yield

    # Cleanup
    logger.info("🔄 Shutting down AI Services")
    if agent_orchestrator:
        await agent_orchestrator.cleanup()
    if rag_pipeline:
        await rag_pipeline.cleanup()
    if unified_rag_service:
        await unified_rag_service.cleanup()
    if supabase_client:
        await supabase_client.cleanup()

# Create FastAPI app
app = FastAPI(
    title="VITAL Path AI Services",
    description="Medical AI Agent Orchestration with LangChain and Supabase",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

async def get_websocket_manager() -> WebSocketManager:
    if not websocket_manager:
        raise HTTPException(status_code=503, detail="WebSocket manager not initialized")
    return websocket_manager

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "vital-path-ai-services",
        "version": "2.0.0",
        "timestamp": asyncio.get_event_loop().time()
    }

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()


@app.post("/api/mode1/manual", response_model=Mode1ManualResponse)
async def execute_mode1_manual(
    request: Mode1ManualRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """Execute Mode 1 manual interactive workflow via Python orchestration"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode1/manual").inc()

    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")

    start_time = asyncio.get_event_loop().time()

    try:
        agent_record = await supabase_client.get_agent_by_id(request.agent_id)
        agent_type = (
            (agent_record.get("type") if agent_record else None)
            or (agent_record.get("agent_type") if agent_record else None)
            or "regulatory_expert"
        )

        query_request = AgentQueryRequest(
            agent_id=request.agent_id,
            agent_type=agent_type,
            query=request.message,
            user_id=request.user_id,
            organization_id=request.tenant_id,
            max_context_docs=(
                0 if not request.enable_rag else min(10, agent_record.get("max_context_docs", 5) if agent_record else 5)
            ),
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
        metadata: Dict[str, Any] = {
            "processing_metadata": response.processing_metadata,
            "compliance_protocols": response.compliance_protocols,
            "medical_context": response.medical_context,
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

        if agent_record:
            metadata["agent"] = {
                "id": agent_record.get("id"),
                "name": agent_record.get("name"),
                "display_name": agent_record.get("display_name"),
                "type": agent_record.get("type"),
            }

        return Mode1ManualResponse(
            agent_id=response.agent_id,
            content=response.response,
            confidence=response.confidence,
            citations=response.citations or [],
            metadata=metadata,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 1 manual execution failed", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Mode 1 execution failed: {str(exc)}")


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
