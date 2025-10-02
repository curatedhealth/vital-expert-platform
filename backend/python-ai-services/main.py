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

from services.agent_orchestrator import AgentOrchestrator
from services.medical_rag import MedicalRAGPipeline
from services.supabase_client import SupabaseClient
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
supabase_client: Optional[SupabaseClient] = None
websocket_manager: Optional[WebSocketManager] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    global agent_orchestrator, rag_pipeline, supabase_client, websocket_manager

    logger.info("🚀 Starting VITAL Path AI Services")

    # Initialize services
    supabase_client = SupabaseClient()
    await supabase_client.initialize()

    rag_pipeline = MedicalRAGPipeline(supabase_client)
    await rag_pipeline.initialize()

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

# RAG Search Endpoint
@app.post("/api/rag/search", response_model=RAGSearchResponse)
async def search_rag(
    request: RAGSearchRequest,
    rag: MedicalRAGPipeline = Depends(get_rag_pipeline)
):
    """Search medical knowledge base using RAG"""
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