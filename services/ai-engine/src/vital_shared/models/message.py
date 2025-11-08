"""
Message and Conversation Models

Defines message formats and conversation structures.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from enum import Enum
from datetime import datetime


class MessageRole(str, Enum):
    """Message role in conversation"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


class MessageStatus(str, Enum):
    """Message processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Message(BaseModel):
    """
    Standardized message format.
    
    Used for conversation storage and context management.
    """
    
    # Identity
    id: str = Field(..., description="Unique message ID")
    session_id: str = Field(..., description="Session ID")
    turn_id: str = Field(..., description="Conversation turn ID")
    
    # Content
    role: MessageRole = Field(..., description="Message role")
    content: str = Field(..., description="Message content")
    status: MessageStatus = Field(MessageStatus.COMPLETED, description="Processing status")
    
    # Metadata
    tokens: int = Field(0, description="Token count")
    cost_usd: float = Field(0.0, description="Cost in USD")
    response_time_ms: Optional[float] = Field(None, description="Response time")
    
    # Citations and tools
    citations: List[str] = Field(default_factory=list, description="Citation IDs")
    tools_used: List[str] = Field(default_factory=list, description="Tools used")
    
    # Additional data
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = Field(None)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "sessionId": self.session_id,
            "turnId": self.turn_id,
            "role": self.role.value,
            "content": self.content,
            "status": self.status.value,
            "tokens": self.tokens,
            "costUsd": self.cost_usd,
            "responseTimeMs": self.response_time_ms,
            "citations": self.citations,
            "toolsUsed": self.tools_used,
            "metadata": self.metadata,
            "createdAt": self.created_at.isoformat(),
            "completedAt": self.completed_at.isoformat() if self.completed_at else None
        }
    
    def to_llm_format(self) -> Dict[str, str]:
        """Format for LLM API"""
        return {
            "role": self.role.value,
            "content": self.content
        }


class ConversationTurn(BaseModel):
    """
    A complete conversation turn (user message + assistant response).
    
    Used for memory and context management.
    """
    
    # Identity
    id: str = Field(..., description="Turn ID")
    session_id: str = Field(..., description="Session ID")
    turn_number: int = Field(..., description="Turn number in conversation")
    
    # Messages
    user_message: Message = Field(..., description="User's message")
    assistant_message: Message = Field(..., description="Assistant's response")
    
    # Context
    agent_id: Optional[str] = Field(None, description="Agent ID")
    mode: int = Field(..., description="Mode used (1, 2, 3, or 4)")
    
    # Aggregated metrics
    total_tokens: int = Field(0, description="Total tokens (user + assistant)")
    total_cost_usd: float = Field(0.0, description="Total cost")
    
    # Timestamps
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = Field(None)
    duration_ms: Optional[float] = Field(None, description="Turn duration")
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    def calculate_metrics(self):
        """Calculate aggregated metrics"""
        self.total_tokens = self.user_message.tokens + self.assistant_message.tokens
        self.total_cost_usd = self.user_message.cost_usd + self.assistant_message.cost_usd
        
        if self.started_at and self.completed_at:
            self.duration_ms = (self.completed_at - self.started_at).total_seconds() * 1000
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "sessionId": self.session_id,
            "turnNumber": self.turn_number,
            "userMessage": self.user_message.to_dict(),
            "assistantMessage": self.assistant_message.to_dict(),
            "agentId": self.agent_id,
            "mode": self.mode,
            "totalTokens": self.total_tokens,
            "totalCostUsd": self.total_cost_usd,
            "startedAt": self.started_at.isoformat(),
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
            "durationMs": self.duration_ms,
            "metadata": self.metadata
        }
    
    def to_llm_format(self) -> List[Dict[str, str]]:
        """Format for LLM context"""
        return [
            self.user_message.to_llm_format(),
            self.assistant_message.to_llm_format()
        ]


class ConversationSession(BaseModel):
    """
    Conversation session containing multiple turns.
    """
    
    id: str = Field(..., description="Session ID")
    user_id: str = Field(..., description="User ID")
    tenant_id: str = Field(..., description="Tenant ID")
    agent_id: Optional[str] = Field(None, description="Agent ID")
    mode: int = Field(..., description="Primary mode")
    
    # Session data
    title: Optional[str] = Field(None, description="Session title")
    summary: Optional[str] = Field(None, description="AI-generated summary")
    turns: List[ConversationTurn] = Field(default_factory=list)
    
    # Aggregated metrics
    total_turns: int = 0
    total_tokens: int = 0
    total_cost_usd: float = 0.0
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    def add_turn(self, turn: ConversationTurn):
        """Add a turn to the session"""
        self.turns.append(turn)
        self.total_turns = len(self.turns)
        self.total_tokens += turn.total_tokens
        self.total_cost_usd += turn.total_cost_usd
        self.updated_at = datetime.now()
    
    def get_last_turns(self, n: int = 10) -> List[ConversationTurn]:
        """Get last N turns"""
        return self.turns[-n:]
    
    def to_llm_context(self, max_turns: int = 10) -> List[Dict[str, str]]:
        """Format for LLM context"""
        recent_turns = self.get_last_turns(max_turns)
        messages = []
        for turn in recent_turns:
            messages.extend(turn.to_llm_format())
        return messages

