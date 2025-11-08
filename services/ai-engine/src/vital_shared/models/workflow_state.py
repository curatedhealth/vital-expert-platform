"""
Workflow State Models

Defines state structures for LangGraph workflows.
All modes inherit from BaseWorkflowState for consistency.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, TypedDict
from datetime import datetime


class BaseWorkflowState(TypedDict, total=False):
    """
    Base workflow state used by all modes.
    
    LangGraph requires TypedDict for state, not Pydantic models.
    All mode-specific states inherit from this.
    
    Benefits:
    - Consistent state structure across all modes
    - Type-safe state access
    - Easy to add shared fields
    """
    
    # User & Session Context
    user_id: str
    tenant_id: str
    session_id: str
    
    # Query
    query: str
    original_query: str  # Preserved original
    
    # Agent
    agent_id: Optional[str]
    agent_name: Optional[str]
    agent_system_prompt: Optional[str]
    
    # Mode Configuration
    mode: int  # 1, 2, 3, or 4
    enable_rag: bool
    enable_tools: bool
    enable_canvas: bool
    
    # RAG State
    rag_strategy: str  # "hybrid", "semantic", "keyword"
    rag_sources: List[Dict[str, Any]]
    rag_citations: List[Dict[str, Any]]
    rag_confidence: float
    rag_total_sources: int
    
    # Tool State
    suggested_tools: List[Dict[str, Any]]
    confirmed_tools: List[str]
    tool_results: List[Dict[str, Any]]
    tools_awaiting_confirmation: bool
    
    # Response Generation
    response: str
    response_chunks: List[str]
    reasoning_steps: List[Dict[str, Any]]
    confidence: float
    
    # Canvas State
    canvas_id: Optional[str]
    artifact_id: Optional[str]
    canvas_updates: List[Dict[str, Any]]
    
    # Streaming State
    is_streaming: bool
    stream_events: List[Dict[str, Any]]
    
    # Error Handling
    error: Optional[str]
    error_code: Optional[str]
    retry_count: int
    
    # Metadata
    start_time: datetime
    end_time: Optional[datetime]
    processing_time_ms: Optional[float]
    total_tokens: int
    total_cost_usd: float
    metadata: Dict[str, Any]


class Mode1State(BaseWorkflowState, total=False):
    """
    Mode 1: Manual Interactive Research
    
    User is in the loop, confirms tools, views reasoning.
    Focus: Transparency and user control.
    """
    
    # Mode 1 specific: User confirmation tracking
    rag_confirmed: bool
    tools_confirmed: bool
    user_feedback: Optional[str]
    
    # Transparency: Detailed reasoning
    detailed_reasoning: List[str]
    reasoning_visibility: str  # "full", "summary", "none"


class Mode2State(BaseWorkflowState, total=False):
    """
    Mode 2: Automatic Research with Agent Selection
    
    System selects best agent, runs autonomously.
    Focus: Speed and efficiency.
    """
    
    # Mode 2 specific: Agent selection
    available_agents: List[Dict[str, Any]]
    agent_selection_reasoning: str
    agent_scores: Dict[str, float]
    fallback_agent_id: Optional[str]
    
    # Autonomous execution
    auto_execute_tools: bool
    auto_rag: bool


class Mode3State(BaseWorkflowState, total=False):
    """
    Mode 3: Chat Manual with Agent Capabilities
    
    Conversational with user confirmation of tools/actions.
    Focus: Natural interaction with control.
    """
    
    # Mode 3 specific: Conversation context
    conversation_history: List[Dict[str, Any]]
    conversation_summary: Optional[str]
    user_preferences: Dict[str, Any]
    
    # Chat capabilities
    supports_multi_turn: bool
    maintains_context: bool
    max_context_turns: int


class Mode4State(BaseWorkflowState, total=False):
    """
    Mode 4: Chat Automatic with Full Autonomy
    
    Conversational, fully autonomous execution.
    Focus: Seamless, intelligent assistance.
    """
    
    # Mode 4 specific: Full autonomy
    autonomous_tool_execution: bool
    autonomous_rag: bool
    autonomous_canvas: bool
    
    # Conversation + autonomy
    conversation_history: List[Dict[str, Any]]
    conversation_summary: Optional[str]
    proactive_suggestions: List[Dict[str, Any]]
    
    # Advanced features
    multi_agent_collaboration: bool
    collaborative_agents: List[str]


# State validation helpers
def validate_base_state(state: Dict[str, Any]) -> bool:
    """Validate that state has required base fields"""
    required = ["user_id", "tenant_id", "session_id", "query", "mode"]
    return all(key in state for key in required)


def initialize_base_state(
    user_id: str,
    tenant_id: str,
    session_id: str,
    query: str,
    mode: int,
    **kwargs
) -> Dict[str, Any]:
    """Initialize a base workflow state with defaults"""
    return {
        # Required
        "user_id": user_id,
        "tenant_id": tenant_id,
        "session_id": session_id,
        "query": query,
        "original_query": query,
        "mode": mode,
        
        # Defaults
        "agent_id": None,
        "agent_name": None,
        "agent_system_prompt": None,
        "enable_rag": True,
        "enable_tools": True,
        "enable_canvas": False,
        
        # RAG
        "rag_strategy": "hybrid",
        "rag_sources": [],
        "rag_citations": [],
        "rag_confidence": 0.0,
        "rag_total_sources": 0,
        
        # Tools
        "suggested_tools": [],
        "confirmed_tools": [],
        "tool_results": [],
        "tools_awaiting_confirmation": False,
        
        # Response
        "response": "",
        "response_chunks": [],
        "reasoning_steps": [],
        "confidence": 0.0,
        
        # Canvas
        "canvas_id": None,
        "artifact_id": None,
        "canvas_updates": [],
        
        # Streaming
        "is_streaming": False,
        "stream_events": [],
        
        # Error handling
        "error": None,
        "error_code": None,
        "retry_count": 0,
        
        # Metadata
        "start_time": datetime.now(),
        "end_time": None,
        "processing_time_ms": None,
        "total_tokens": 0,
        "total_cost_usd": 0.0,
        "metadata": {},
        
        # Any additional kwargs
        **kwargs
    }


def initialize_mode1_state(**kwargs) -> Dict[str, Any]:
    """Initialize Mode 1 state"""
    base = initialize_base_state(mode=1, **kwargs)
    base.update({
        "rag_confirmed": False,
        "tools_confirmed": False,
        "user_feedback": None,
        "detailed_reasoning": [],
        "reasoning_visibility": "full"
    })
    return base


def initialize_mode2_state(**kwargs) -> Dict[str, Any]:
    """Initialize Mode 2 state"""
    base = initialize_base_state(mode=2, **kwargs)
    base.update({
        "available_agents": [],
        "agent_selection_reasoning": "",
        "agent_scores": {},
        "fallback_agent_id": None,
        "auto_execute_tools": True,
        "auto_rag": True
    })
    return base


def initialize_mode3_state(**kwargs) -> Dict[str, Any]:
    """Initialize Mode 3 state"""
    base = initialize_base_state(mode=3, **kwargs)
    base.update({
        "conversation_history": [],
        "conversation_summary": None,
        "user_preferences": {},
        "supports_multi_turn": True,
        "maintains_context": True,
        "max_context_turns": 10
    })
    return base


def initialize_mode4_state(**kwargs) -> Dict[str, Any]:
    """Initialize Mode 4 state"""
    base = initialize_base_state(mode=4, **kwargs)
    base.update({
        "autonomous_tool_execution": True,
        "autonomous_rag": True,
        "autonomous_canvas": False,
        "conversation_history": [],
        "conversation_summary": None,
        "proactive_suggestions": [],
        "multi_agent_collaboration": False,
        "collaborative_agents": []
    })
    return base

