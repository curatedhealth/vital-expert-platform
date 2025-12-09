"""
Ask Expert API Schemas with Phase 4 enhancements.

Defines request/response schemas for the 4-mode Ask Expert system:
- Mode 1: Manual-Interactive
- Mode 2: Auto-Interactive  
- Mode 3: Manual-Autonomous
- Mode 4: Auto-Autonomous
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class HITLSafetyLevel(str, Enum):
    """HITL safety levels for approval checkpoints"""
    CONSERVATIVE = "conservative"  # All approvals required
    BALANCED = "balanced"  # Risky operations require approval
    MINIMAL = "minimal"  # Minimal approvals


class AgentLevelEnum(str, Enum):
    """Agent levels (L1-L5)"""
    L1 = "L1"  # Master Orchestrator
    L2 = "L2"  # Domain Experts
    L3 = "L3"  # Specialists
    L4 = "L4"  # Workers
    L5 = "L5"  # Tools


class PatternType(str, Enum):
    """Deep agent patterns"""
    NONE = "none"
    REACT = "react"
    CONSTITUTIONAL = "constitutional"
    REACT_CONSTITUTIONAL = "react_constitutional"
    TOT_REACT_CONSTITUTIONAL = "tot_react_constitutional"


class Message(BaseModel):
    """Conversation message"""
    role: str = Field(..., description="Message role (user/assistant/system)")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = Field(None, description="Message timestamp")
    agent_id: Optional[str] = Field(None, description="Agent ID (if assistant)")


class AskExpertRequest(BaseModel):
    """
    Ask Expert request schema with Phase 4 enhancements.
    
    Mode Selection Matrix:
    - isAutomatic=False, isAutonomous=False → Mode 1 (Manual-Interactive)
    - isAutomatic=True, isAutonomous=False → Mode 2 (Auto-Interactive)
    - isAutomatic=False, isAutonomous=True → Mode 3 (Manual-Autonomous)
    - isAutomatic=True, isAutonomous=True → Mode 4 (Auto-Autonomous)
    """
    # Core request
    query: str = Field(..., min_length=1, max_length=10000, description="User query")
    session_id: Optional[str] = Field(None, description="Session ID for multi-turn conversation")
    messages: List[Message] = Field(default_factory=list, description="Conversation history")
    
    # Mode selection
    isAutomatic: bool = Field(
        default=False,
        description="True = AI selects agent (Evidence-Based), False = User selects agent"
    )
    isAutonomous: bool = Field(
        default=False,
        description="True = Deep work mode (long-term planning), False = Interactive chat"
    )
    selectedAgents: List[str] = Field(
        default_factory=list,
        description="Pre-selected agent IDs (required for Manual modes, empty for Auto modes)"
    )
    
    # Phase 4: HITL options
    hitlEnabled: bool = Field(
        default=True,
        description="Enable HITL approval checkpoints (recommended for Autonomous modes)"
    )
    hitlSafetyLevel: HITLSafetyLevel = Field(
        default=HITLSafetyLevel.BALANCED,
        description="HITL safety level: conservative (all approvals), balanced (risky only), minimal"
    )
    
    # LLM settings
    model: str = Field(default="gpt-4", description="LLM model to use")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="LLM temperature")
    max_tokens: Optional[int] = Field(None, ge=1, le=32000, description="Max tokens")
    
    # Advanced options
    enable_rag: bool = Field(default=True, description="Enable RAG retrieval")
    enable_tools: bool = Field(default=True, description="Enable tool execution")
    enable_sub_agents: bool = Field(default=True, description="Enable sub-agent spawning")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "What are the FDA requirements for a Class II medical device?",
                "isAutomatic": False,
                "isAutonomous": False,
                "selectedAgents": ["fda-expert-001"],
                "hitlEnabled": True,
                "hitlSafetyLevel": "balanced",
                "model": "gpt-4"
            }
        }


class AgentInfo(BaseModel):
    """Selected agent information"""
    id: str = Field(..., description="Agent ID")
    name: str = Field(..., description="Agent name")
    type: str = Field(..., description="Agent type/specialty")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Selection confidence")


class Citation(BaseModel):
    """Evidence citation"""
    id: str = Field(..., description="Citation ID")
    title: str = Field(..., description="Document title")
    source: str = Field(..., description="Source (e.g., FDA guidance)")
    excerpt: str = Field(..., description="Relevant excerpt")
    url: Optional[str] = Field(None, description="Source URL")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Relevance score")


class PlanStep(BaseModel):
    """ToT plan step"""
    step_number: int = Field(..., description="Step number")
    description: str = Field(..., description="Step description")
    estimated_time_minutes: int = Field(..., description="Estimated time")
    requires_approval: bool = Field(..., description="Requires HITL approval")


class AskExpertResponse(BaseModel):
    """
    Ask Expert response schema with Phase 4 metadata.
    """
    # Core response
    response: str = Field(..., description="Agent response")
    citations: List[Citation] = Field(default_factory=list, description="Evidence citations")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Response confidence")
    
    # Mode & execution metadata
    mode: str = Field(..., description="Mode used (e.g., 'Manual-Interactive')")
    agent_level: AgentLevelEnum = Field(..., description="Primary agent level (L1-L5)")
    pattern_applied: PatternType = Field(..., description="Deep agent pattern applied")
    
    # Agent selection
    selected_agents: List[AgentInfo] = Field(..., description="Selected agent(s)")
    selection_reasoning: Optional[str] = Field(None, description="Why these agents were selected")
    
    # Phase 4 metadata
    level_reasoning: str = Field(..., description="Why this level was chosen")
    safety_validated: bool = Field(..., description="Constitutional AI validation passed")
    safety_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Safety score")
    
    # HITL metadata (if applicable)
    hitl_approvals: Optional[Dict[str, bool]] = Field(
        None,
        description="HITL approvals: {plan: true, tools: true, sub_agents: true, decision: true}"
    )
    
    # ToT plan (if Autonomous mode)
    plan: Optional[List[PlanStep]] = Field(None, description="ToT plan (Mode 3/4)")
    plan_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Plan confidence")
    
    # Session
    session_id: str = Field(..., description="Session ID for multi-turn")
    
    # Performance metadata
    execution_time_ms: int = Field(..., description="Execution time in milliseconds")
    tokens_used: Optional[int] = Field(None, description="Total tokens used")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "For a Class II medical device, you must submit a 510(k) premarket notification...",
                "citations": [
                    {
                        "id": "fda-001",
                        "title": "510(k) Premarket Notification",
                        "source": "FDA Guidance",
                        "excerpt": "A 510(k) is a premarket submission...",
                        "relevance_score": 0.95
                    }
                ],
                "confidence": 0.92,
                "mode": "Manual-Interactive",
                "agent_level": "L2",
                "pattern_applied": "react_constitutional",
                "selected_agents": [
                    {
                        "id": "fda-expert-001",
                        "name": "FDA Regulatory Expert",
                        "type": "Regulatory Affairs",
                        "confidence": 1.0
                    }
                ],
                "selection_reasoning": "User manually selected FDA expert",
                "level_reasoning": "Complex regulatory query requires L2 expert analysis",
                "safety_validated": True,
                "safety_score": 0.98,
                "session_id": "session-abc-123",
                "execution_time_ms": 8500,
                "tokens_used": 2430
            }
        }


class AskExpertError(BaseModel):
    """Error response"""
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code")
    details: Optional[Dict[str, Any]] = Field(None, description="Error details")
    suggestions: Optional[List[str]] = Field(None, description="Suggested fixes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "No agents selected for Manual mode",
                "error_code": "MISSING_AGENT_SELECTION",
                "details": {"isAutomatic": False, "selectedAgents": []},
                "suggestions": [
                    "Set isAutomatic=True to enable automatic agent selection",
                    "Provide selectedAgents array with at least one agent ID"
                ]
            }
        }

