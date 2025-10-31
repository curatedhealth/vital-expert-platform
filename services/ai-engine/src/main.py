"""
VITAL Path AI Services - FastAPI Backend
Medical AI Agent Orchestration with LangChain
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import uvicorn
import structlog
from prometheus_client import Counter, Histogram, generate_latest
from typing import List, Dict, Any, Optional
import asyncio
import json
from datetime import datetime
from pydantic import BaseModel, Field

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

# Mode 2: Automatic Agent Selection
@app.post("/api/mode2/automatic", response_model=Mode2AutomaticResponse)
async def execute_mode2_automatic(
    request: Mode2AutomaticRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """Execute Mode 2 automatic agent selection workflow via Python orchestration"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode2/automatic").inc()

    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")

    start_time = asyncio.get_event_loop().time()

    try:
        # Step 1: Select best agent based on query
        # For now, use a simple selection algorithm (can be enhanced with full Python agent selection later)
        logger.info("🔍 Selecting agent for Mode 2", query_preview=request.message[:100])

        # Simple agent selection: query agents table and select based on domain match
        # TODO: Implement full agent selection with embeddings/ranking in Python
        # For now, use a default agent or the first available agent
        agents_result = await supabase_client.get_all_agents()
        
        if not agents_result or len(agents_result) == 0:
            raise HTTPException(status_code=404, detail="No agents available")
        
        # Simple selection: use first agent or could enhance with query matching
        selected_agent = agents_result[0] if isinstance(agents_result, list) else list(agents_result.values())[0]
        agent_id = selected_agent.get("id") if isinstance(selected_agent, dict) else selected_agent
        
        agent_type = (
            selected_agent.get("type") if isinstance(selected_agent, dict) else None
            or selected_agent.get("agent_type") if isinstance(selected_agent, dict) else None
            or "regulatory_expert"
        )

        # Step 2: Execute query with selected agent (reuse Mode 1 logic)
        query_request = AgentQueryRequest(
            agent_id=agent_id,
            agent_type=agent_type,
            query=request.message,
            user_id=request.user_id,
            organization_id=request.tenant_id,
            max_context_docs=(
                0 if not request.enable_rag else 10
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
        
        agent_selection_metadata = {
            "selected_agent_id": agent_id,
            "selected_agent_name": selected_agent.get("name") if isinstance(selected_agent, dict) else "Unknown",
            "selection_method": "simple_selection",  # TODO: Enhance with full Python agent selection
            "candidate_count": len(agents_result) if isinstance(agents_result, list) else len(agents_result),
            "selection_confidence": 0.7,  # Placeholder - can be enhanced
        }

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
            "agent": {
                "id": agent_id,
                "name": selected_agent.get("name") if isinstance(selected_agent, dict) else "Unknown",
                "type": agent_type,
            },
        }

        return Mode2AutomaticResponse(
            agent_id=agent_id,
            content=response.response,
            confidence=response.confidence,
            citations=response.citations or [],
            metadata=metadata,
            processing_time_ms=processing_time_ms,
            agent_selection=agent_selection_metadata,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 2 automatic execution failed", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Mode 2 execution failed: {str(exc)}")

# Mode 3: Autonomous-Automatic
@app.post("/api/mode3/autonomous-automatic", response_model=Mode3AutonomousAutomaticResponse)
async def execute_mode3_autonomous_automatic(
    request: Mode3AutonomousAutomaticRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """Execute Mode 3 autonomous-automatic workflow via Python orchestration"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode3/autonomous-automatic").inc()

    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")

    start_time = asyncio.get_event_loop().time()

    try:
        # Step 1: Select best agent (similar to Mode 2)
        logger.info("🔍 Selecting agent for Mode 3", query_preview=request.message[:100])

        agents_result = await supabase_client.get_all_agents()
        
        if not agents_result or len(agents_result) == 0:
            raise HTTPException(status_code=404, detail="No agents available")
        
        selected_agent = agents_result[0] if isinstance(agents_result, list) else list(agents_result.values())[0]
        agent_id = selected_agent.get("id") if isinstance(selected_agent, dict) else selected_agent
        
        agent_type = (
            selected_agent.get("type") if isinstance(selected_agent, dict) else None
            or selected_agent.get("agent_type") if isinstance(selected_agent, dict) else None
            or "regulatory_expert"
        )

        # Step 2: Execute query with autonomous reasoning capabilities
        # For now, use enhanced query processing (full ReAct/CoT can be added later)
        query_request = AgentQueryRequest(
            agent_id=agent_id,
            agent_type=agent_type,
            query=request.message,
            user_id=request.user_id,
            organization_id=request.tenant_id,
            max_context_docs=(
                0 if not request.enable_rag else min(15, request.max_iterations or 10)  # More docs for autonomous
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
        
        # Autonomous reasoning metadata (placeholder - can be enhanced with full ReAct/CoT)
        autonomous_reasoning_metadata = {
            "iterations": 1,  # Placeholder - would be actual ReAct iterations
            "tools_used": request.requested_tools or [],
            "reasoning_steps": ["Query understanding", "Context retrieval", "Response generation"],
            "confidence_threshold": request.confidence_threshold or 0.95,
            "max_iterations": request.max_iterations or 10,
        }

        agent_selection_metadata = {
            "selected_agent_id": agent_id,
            "selected_agent_name": selected_agent.get("name") if isinstance(selected_agent, dict) else "Unknown",
            "selection_method": "simple_selection",
            "selection_confidence": 0.7,
        }

        metadata: Dict[str, Any] = {
            "processing_metadata": response.processing_metadata,
            "compliance_protocols": response.compliance_protocols,
            "medical_context": response.medical_context,
            "request": {
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "max_iterations": request.max_iterations,
                "confidence_threshold": request.confidence_threshold,
            },
        }

        return Mode3AutonomousAutomaticResponse(
            agent_id=agent_id,
            content=response.response,
            confidence=response.confidence,
            citations=response.citations or [],
            metadata=metadata,
            processing_time_ms=processing_time_ms,
            autonomous_reasoning=autonomous_reasoning_metadata,
            agent_selection=agent_selection_metadata,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 3 autonomous-automatic execution failed", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Mode 3 execution failed: {str(exc)}")

# Mode 4: Autonomous-Manual
@app.post("/api/mode4/autonomous-manual", response_model=Mode4AutonomousManualResponse)
async def execute_mode4_autonomous_manual(
    request: Mode4AutonomousManualRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator)
):
    """Execute Mode 4 autonomous-manual workflow via Python orchestration"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode4/autonomous-manual").inc()

    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")

    start_time = asyncio.get_event_loop().time()

    try:
        # Get agent record
        agent_record = await supabase_client.get_agent_by_id(request.agent_id)
        agent_type = (
            (agent_record.get("type") if agent_record else None)
            or (agent_record.get("agent_type") if agent_record else None)
            or "regulatory_expert"
        )

        # Execute query with autonomous reasoning capabilities
        query_request = AgentQueryRequest(
            agent_id=request.agent_id,
            agent_type=agent_type,
            query=request.message,
            user_id=request.user_id,
            organization_id=request.tenant_id,
            max_context_docs=(
                0 if not request.enable_rag else min(15, request.max_iterations or 10)  # More docs for autonomous
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
        
        # Autonomous reasoning metadata (placeholder - can be enhanced with full ReAct/CoT)
        autonomous_reasoning_metadata = {
            "iterations": 1,  # Placeholder - would be actual ReAct iterations
            "tools_used": request.requested_tools or [],
            "reasoning_steps": ["Query understanding", "Context retrieval", "Response generation"],
            "confidence_threshold": request.confidence_threshold or 0.95,
            "max_iterations": request.max_iterations or 10,
        }

        metadata: Dict[str, Any] = {
            "processing_metadata": response.processing_metadata,
            "compliance_protocols": response.compliance_protocols,
            "medical_context": response.medical_context,
            "request": {
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "max_iterations": request.max_iterations,
                "confidence_threshold": request.confidence_threshold,
            },
            "agent": {
                "id": agent_record.get("id") if agent_record else request.agent_id,
                "name": agent_record.get("name") if agent_record else "Unknown",
                "type": agent_type,
            },
        }

        return Mode4AutonomousManualResponse(
            agent_id=request.agent_id,
            content=response.response,
            confidence=response.confidence,
            citations=response.citations or [],
            metadata=metadata,
            processing_time_ms=processing_time_ms,
            autonomous_reasoning=autonomous_reasoning_metadata,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 4 autonomous-manual execution failed", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Mode 4 execution failed: {str(exc)}")


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

async def get_agent_selector_service_dep() -> AgentSelectorService:
    """Dependency to get agent selector service"""
    from services.agent_selector_service import get_agent_selector_service
    return get_agent_selector_service(supabase_client)

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
