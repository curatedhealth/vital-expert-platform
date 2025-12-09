"""
VITAL Path AI Services - Mode Schemas

Pydantic models for Mode 1-4 request and response schemas.

Phase 1 Refactoring: Extracted from monolithic main.py
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ConversationTurn(BaseModel):
    """Conversation history turn."""
    role: str = Field(..., description="Turn role (user or assistant)")
    content: str = Field(..., description="Turn content")


# =============================================================================
# MODE 1: Manual Interactive (Expert Chat)
# =============================================================================

class Mode1ManualRequest(BaseModel):
    """Payload for Mode 1 manual interactive requests."""
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
    model: Optional[str] = Field(
        default="gpt-4",
        description="LLM model to use (e.g., gpt-4, gpt-4-turbo, gpt-3.5-turbo)"
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
    """Response payload for Mode 1 manual interactive requests."""
    agent_id: str = Field(..., description="Agent that produced the response")
    content: str = Field(..., description="Generated response content")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Supporting citations")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    processing_time_ms: float = Field(..., description="Processing latency in milliseconds")


# =============================================================================
# MODE 2: Automatic Interactive (Smart Copilot)
# =============================================================================

class Mode2AutomaticRequest(BaseModel):
    """Payload for Mode 2 automatic agent selection requests."""
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
    model: Optional[str] = Field(
        default="gpt-4",
        description="LLM model to use"
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
    """Response payload for Mode 2 automatic agent selection requests."""
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


# =============================================================================
# MODE 3: Manual Autonomous (Mission Control)
# =============================================================================

class Mode3AutonomousManualRequest(BaseModel):
    """Payload for Mode 3 autonomous-manual requests (Manual Selection + Autonomous Execution)."""
    agent_id: str = Field(..., description="Selected expert agent ID (user chooses)")
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
    model: Optional[str] = Field(
        default="gpt-4",
        description="LLM model to use"
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


class Mode3AutonomousManualResponse(BaseModel):
    """Response payload for Mode 3 autonomous-manual requests."""
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


# =============================================================================
# MODE 4: Automatic Autonomous (Background Mission)
# =============================================================================

class Mode4AutonomousAutomaticRequest(BaseModel):
    """Payload for Mode 4 autonomous-automatic requests (Automatic Selection + Autonomous Execution)."""
    message: str = Field(..., min_length=1, description="User message")
    agent_id: Optional[str] = Field(None, description="Optional agent ID (auto-selected if not provided)")
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
    model: Optional[str] = Field(
        default="gpt-4",
        description="LLM model to use"
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


class Mode4AutonomousAutomaticResponse(BaseModel):
    """Response payload for Mode 4 autonomous-automatic requests."""
    agent_id: Optional[str] = Field(None, description="Primary agent that produced the response")
    selected_agents: Optional[List[str]] = Field(default_factory=list, description="All agents that contributed")
    content: str = Field(..., description="Generated response content")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Supporting citations")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    processing_time_ms: float = Field(..., description="Processing latency in milliseconds")
    autonomous_reasoning: Dict[str, Any] = Field(
        default_factory=dict,
        description="Autonomous reasoning details (iterations, steps, tools used)"
    )


# =============================================================================
# HITL (Human-in-the-Loop) Schemas
# =============================================================================

class HITLCheckpoint(BaseModel):
    """HITL checkpoint for approval requests."""
    session_id: str = Field(..., description="Session identifier")
    checkpoint_type: str = Field(..., description="Type of checkpoint (approval, review, etc.)")
    decision_required: str = Field(..., description="Decision required from user")
    context: Dict[str, Any] = Field(default_factory=dict, description="Context for the decision")
    options: List[str] = Field(default_factory=list, description="Available options")
    timeout_seconds: Optional[int] = Field(default=300, description="Timeout for response")


class HITLResponse(BaseModel):
    """User response to HITL checkpoint."""
    session_id: str = Field(..., description="Session identifier")
    checkpoint_id: str = Field(..., description="Checkpoint identifier")
    decision: str = Field(..., description="User decision")
    feedback: Optional[str] = Field(default=None, description="Optional user feedback")


class HITLResponseResponse(BaseModel):
    """Response after processing HITL response."""
    success: bool = Field(..., description="Whether the response was processed")
    message: str = Field(..., description="Status message")
    session_id: str = Field(..., description="Session identifier")
    next_action: Optional[str] = Field(default=None, description="Next action if any")


# =============================================================================
# Autonomous Control Schemas
# =============================================================================

class StopAutonomousRequest(BaseModel):
    """Request to stop autonomous execution."""
    session_id: str = Field(..., description="Session identifier to stop")
    reason: Optional[str] = Field(default=None, description="Reason for stopping")


class StopAutonomousResponse(BaseModel):
    """Response after stopping autonomous execution."""
    success: bool = Field(..., description="Whether the stop was successful")
    message: str = Field(..., description="Status message")
    session_id: str = Field(..., description="Session identifier")
    final_state: Optional[Dict[str, Any]] = Field(default=None, description="Final state if available")


class AutonomousStatusResponse(BaseModel):
    """Status response for autonomous session."""
    session_id: str = Field(..., description="Session identifier")
    status: str = Field(..., description="Current status (running, completed, stopped, error)")
    progress: float = Field(..., ge=0.0, le=1.0, description="Progress percentage")
    current_step: Optional[str] = Field(default=None, description="Current step description")
    iterations_completed: int = Field(default=0, description="Number of iterations completed")
    tools_used: List[str] = Field(default_factory=list, description="Tools used so far")
    intermediate_results: Optional[Dict[str, Any]] = Field(default=None, description="Intermediate results")


# =============================================================================
# Panel Orchestration Schemas
# =============================================================================

class PanelOrchestrationRequest(BaseModel):
    """Request for panel orchestration."""
    query: str = Field(..., min_length=1, description="User query")
    panel_id: Optional[str] = Field(default=None, description="Optional panel ID")
    agent_ids: Optional[List[str]] = Field(default=None, description="Agent IDs to include")
    enable_consensus: bool = Field(True, description="Enable consensus calculation")
    user_id: Optional[str] = Field(default=None, description="User ID")
    tenant_id: Optional[str] = Field(default=None, description="Tenant ID")


class PanelOrchestrationResponse(BaseModel):
    """Response from panel orchestration."""
    panel_id: str = Field(..., description="Panel identifier")
    responses: List[Dict[str, Any]] = Field(default_factory=list, description="Agent responses")
    consensus: Optional[Dict[str, Any]] = Field(default=None, description="Consensus if calculated")
    processing_time_ms: float = Field(..., description="Total processing time")


# =============================================================================
# Embeddings Schemas
# =============================================================================

class EmbeddingGenerationRequest(BaseModel):
    """Request to generate embeddings."""
    text: str = Field(..., min_length=1, description="Text to embed")
    model: Optional[str] = Field(default="text-embedding-3-large", description="Embedding model")


class EmbeddingGenerationResponse(BaseModel):
    """Response with generated embeddings."""
    embedding: List[float] = Field(..., description="Generated embedding vector")
    model: str = Field(..., description="Model used for generation")
    dimensions: int = Field(..., description="Embedding dimensions")
    processing_time_ms: float = Field(..., description="Processing time")


class BatchEmbeddingRequest(BaseModel):
    """Request to generate batch embeddings."""
    texts: List[str] = Field(..., min_items=1, max_items=100, description="Texts to embed")
    model: Optional[str] = Field(default="text-embedding-3-large", description="Embedding model")


class BatchEmbeddingResponse(BaseModel):
    """Response with batch embeddings."""
    embeddings: List[List[float]] = Field(..., description="Generated embedding vectors")
    model: str = Field(..., description="Model used for generation")
    dimensions: int = Field(..., description="Embedding dimensions")
    count: int = Field(..., description="Number of embeddings generated")
    processing_time_ms: float = Field(..., description="Processing time")
