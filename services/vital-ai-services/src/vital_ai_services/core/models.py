"""
Core Models for VITAL AI Services

TAG: SHARED_AI_MODELS

Pydantic models used across all AI services.
These models ensure type safety and validation.

All models support:
- JSON serialization
- Type validation
- Default values
- Documentation
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, UUID4
from datetime import datetime


# ============================================================================
# SOURCE & CITATION MODELS
# ============================================================================

class Source(BaseModel):
    """
    A single source document retrieved from RAG.
    
    Used for:
    - RAG search results
    - Citations in AI responses
    - Evidence tracking
    """
    id: str = Field(..., description="Unique source identifier")
    title: str = Field(..., description="Document title")
    url: Optional[str] = Field(None, description="Source URL")
    domain: Optional[str] = Field(None, description="Domain (e.g., 'fda.gov')")
    excerpt: Optional[str] = Field(None, description="Relevant text excerpt")
    similarity: Optional[float] = Field(None, ge=0.0, le=1.0, description="Similarity score")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    # Quality indicators
    source_type: Optional[str] = Field(None, description="Type (e.g., 'regulatory', 'research')")
    evidence_level: Optional[Literal['A', 'B', 'C', 'D']] = Field(None, description="Evidence quality")
    reliability_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Reliability score")
    
    # Provenance
    organization: Optional[str] = Field(None, description="Source organization")
    last_updated: Optional[datetime] = Field(None, description="Last update timestamp")


class Citation(BaseModel):
    """
    A citation reference in AI-generated content.
    
    Links specific text to source documents.
    """
    number: int = Field(..., description="Citation number (e.g., [1], [2])")
    source_id: str = Field(..., description="ID of the cited source")
    quote: Optional[str] = Field(None, description="Specific quoted text")
    context: Optional[str] = Field(None, description="Surrounding context")
    start_char: Optional[int] = Field(None, description="Start position in text")
    end_char: Optional[int] = Field(None, description="End position in text")


# ============================================================================
# AGENT MODELS
# ============================================================================

class AgentScore(BaseModel):
    """
    Scoring details for an agent candidate.
    """
    agent_id: str = Field(..., description="Agent ID")
    agent_name: str = Field(..., description="Agent display name")
    score: float = Field(..., ge=0.0, le=1.0, description="Overall score")
    
    # Score breakdown
    domain_match_score: float = Field(0.0, description="Domain expertise match (0-1)")
    performance_score: float = Field(0.0, description="Historical performance (0-1)")
    similarity_score: float = Field(0.0, description="Query similarity (0-1)")
    availability_score: float = Field(0.0, description="Current availability (0-1)")
    
    # Metadata
    domains: List[str] = Field(default_factory=list, description="Agent expertise domains")
    avg_confidence: Optional[float] = Field(None, description="Avg confidence from feedback")
    avg_rating: Optional[float] = Field(None, description="Avg user rating")
    total_queries: int = Field(0, description="Total queries handled")


class AgentSelection(BaseModel):
    """
    Result of agent selection process.
    """
    agent_id: str = Field(..., description="Selected agent ID")
    agent_name: str = Field(..., description="Selected agent name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Selection confidence")
    reason: str = Field(..., description="Human-readable selection reason")
    
    # Additional context
    query_intent: Optional[str] = Field(None, description="Detected query intent")
    query_domains: List[str] = Field(default_factory=list, description="Detected domains")
    query_complexity: Optional[Literal['simple', 'moderate', 'complex']] = Field(None)
    
    # All candidates considered
    all_candidates: Optional[List[AgentScore]] = Field(None, description="All scored agents")
    
    # Metadata
    selection_time_ms: Optional[float] = Field(None, description="Selection latency (ms)")
    cache_hit: bool = Field(False, description="Was result cached?")


# ============================================================================
# RAG MODELS
# ============================================================================

class RAGQuery(BaseModel):
    """
    Query for RAG service.
    """
    query_text: str = Field(..., description="Search query")
    strategy: Literal['semantic', 'hybrid', 'agent-optimized', 'keyword'] = Field(
        'hybrid',
        description="Search strategy"
    )
    
    # Filters
    domain_ids: Optional[List[str]] = Field(None, description="Filter by RAG domains")
    agent_id: Optional[str] = Field(None, description="Agent context for optimization")
    
    # Thresholds
    max_results: int = Field(10, ge=1, le=100, description="Max results to return")
    similarity_threshold: float = Field(0.7, ge=0.0, le=1.0, description="Min similarity score")
    
    # Context
    tenant_id: str = Field(..., description="Tenant ID")
    user_id: Optional[str] = Field(None, description="User ID")
    session_id: Optional[str] = Field(None, description="Session ID")
    
    # Additional filters
    filters: Dict[str, Any] = Field(default_factory=dict, description="Custom filters")


class RAGResponse(BaseModel):
    """
    Response from RAG service.
    """
    sources: List[Source] = Field(default_factory=list, description="Retrieved sources")
    context_summary: Optional[str] = Field(None, description="Summarized context for LLM")
    
    # Metadata
    strategy_used: str = Field(..., description="Strategy that was used")
    total_results: int = Field(0, description="Total results found")
    cache_hit: bool = Field(False, description="Was result cached?")
    search_time_ms: Optional[float] = Field(None, description="Search latency (ms)")
    
    # Summary stats
    domains: List[str] = Field(default_factory=list, description="Unique domains")
    avg_similarity: Optional[float] = Field(None, description="Average similarity score")


# ============================================================================
# TOOL MODELS
# ============================================================================

class ToolInput(BaseModel):
    """
    Input for tool execution.
    """
    tool_name: str = Field(..., description="Tool to execute")
    data: Any = Field(..., description="Tool input data")
    context: Dict[str, Any] = Field(default_factory=dict, description="Execution context")
    
    # Metadata
    tenant_id: Optional[str] = Field(None, description="Tenant ID")
    user_id: Optional[str] = Field(None, description="User ID")
    session_id: Optional[str] = Field(None, description="Session ID")


class ToolOutput(BaseModel):
    """
    Output from tool execution.
    """
    success: bool = Field(..., description="Execution success")
    data: Any = Field(None, description="Tool output data")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    
    # Metadata
    tool_name: str = Field(..., description="Tool that was executed")
    execution_time_ms: Optional[float] = Field(None, description="Execution latency (ms)")
    cost_usd: Optional[float] = Field(None, description="Execution cost in USD")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class ToolExecution(BaseModel):
    """
    Record of a tool execution.
    """
    tool_name: str = Field(..., description="Tool name")
    input_data: Any = Field(..., description="Input data")
    output_data: Any = Field(None, description="Output data")
    success: bool = Field(..., description="Execution success")
    error_message: Optional[str] = Field(None, description="Error if failed")
    execution_time_ms: float = Field(..., description="Execution latency (ms)")
    cost_usd: Optional[float] = Field(None, description="Execution cost in USD")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Execution time")


# ============================================================================
# REASONING & WORKFLOW MODELS
# ============================================================================

class ReasoningStep(BaseModel):
    """
    A single reasoning step in AI workflow.
    """
    step_number: int = Field(..., description="Step sequence number")
    step_type: Literal['thought', 'action', 'observation', 'reflection'] = Field(
        ...,
        description="Type of reasoning step"
    )
    content: str = Field(..., description="Step content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Step timestamp")


# ============================================================================
# MEMORY & CONVERSATION MODELS
# ============================================================================

class ConversationTurn(BaseModel):
    """
    A single turn in a conversation.
    """
    role: Literal['user', 'assistant', 'system'] = Field(..., description="Message role")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Turn timestamp")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Turn metadata")


class ConversationMemory(BaseModel):
    """
    Conversation memory for multi-turn dialogs.
    """
    session_id: str = Field(..., description="Session ID")
    tenant_id: str = Field(..., description="Tenant ID")
    user_id: Optional[str] = Field(None, description="User ID")
    turns: List[ConversationTurn] = Field(default_factory=list, description="Conversation turns")
    summary: Optional[str] = Field(None, description="Conversation summary")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update time")


# ============================================================================
# CONFIG & METADATA MODELS
# ============================================================================

class ServiceConfig(BaseModel):
    """
    Configuration for AI services.
    """
    tenant_id: str = Field(..., description="Tenant ID")
    
    # API Keys (should be loaded from env, not stored)
    openai_api_key: Optional[str] = Field(None, description="OpenAI API key")
    pinecone_api_key: Optional[str] = Field(None, description="Pinecone API key")
    tavily_api_key: Optional[str] = Field(None, description="Tavily API key")
    
    # Service endpoints
    supabase_url: Optional[str] = Field(None, description="Supabase URL")
    redis_url: Optional[str] = Field(None, description="Redis URL")
    
    # Feature flags
    enable_caching: bool = Field(True, description="Enable Redis caching")
    enable_feedback_loop: bool = Field(True, description="Enable feedback-driven selection")
    enable_cost_tracking: bool = Field(True, description="Enable cost tracking")
    
    class Config:
        extra = "allow"  # Allow additional fields

