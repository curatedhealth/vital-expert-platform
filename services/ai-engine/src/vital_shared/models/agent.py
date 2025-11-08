"""
Agent Profile Models

Defines agent profiles, capabilities, and metadata.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from enum import Enum
from datetime import datetime


class AgentRole(str, Enum):
    """Agent role classification"""
    EXPERT = "expert"  # Domain expert
    GENERALIST = "generalist"  # General-purpose
    SPECIALIST = "specialist"  # Specialized task
    ASSISTANT = "assistant"  # User assistant


class AgentCapability(str, Enum):
    """Agent capabilities"""
    RAG_RETRIEVAL = "rag_retrieval"
    WEB_SEARCH = "web_search"
    PUBMED_SEARCH = "pubmed_search"
    FDA_DATABASE = "fda_database"
    CALCULATOR = "calculator"
    CODE_GENERATION = "code_generation"
    DOCUMENT_GENERATION = "document_generation"
    DIAGRAM_GENERATION = "diagram_generation"
    DATA_ANALYSIS = "data_analysis"
    EMAIL = "email"


class AgentStatus(str, Enum):
    """Agent status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    DRAFT = "draft"


class AgentProfile(BaseModel):
    """
    Agent profile with all metadata.
    
    Used by AgentService to load and manage agents.
    """
    
    # Identity
    id: str = Field(..., description="Unique agent ID")
    name: str = Field(..., description="Agent name")
    display_name: str = Field(..., description="Display name for UI")
    avatar_url: Optional[str] = Field(None, description="Avatar image URL")
    
    # Role & Classification
    role: AgentRole = Field(..., description="Agent role")
    status: AgentStatus = Field(AgentStatus.ACTIVE, description="Agent status")
    
    # Capabilities
    capabilities: List[AgentCapability] = Field(..., description="Agent capabilities")
    supported_modes: List[int] = Field(..., description="Supported modes (1, 2, 3, 4)")
    
    # Knowledge
    domain_ids: List[str] = Field(..., description="Knowledge domain IDs for RAG")
    expertise_areas: List[str] = Field(..., description="Areas of expertise")
    
    # LLM Configuration
    system_prompt: str = Field(..., description="System prompt/instructions")
    temperature: float = Field(0.7, description="LLM temperature", ge=0.0, le=2.0)
    max_tokens: int = Field(4000, description="Max tokens per response")
    model: str = Field("gpt-4-turbo-preview", description="LLM model to use")
    
    # Access Control
    tenant_id: str = Field(..., description="Tenant ID (multi-tenancy)")
    created_by: str = Field(..., description="User ID who created agent")
    is_public: bool = Field(False, description="Available to all users in tenant")
    allowed_users: List[str] = Field(default_factory=list, description="Allowed user IDs")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_used_at: Optional[datetime] = Field(None)
    
    # Usage Statistics
    total_conversations: int = Field(0, description="Total conversations")
    total_messages: int = Field(0, description="Total messages")
    total_tokens_used: int = Field(0, description="Total tokens consumed")
    total_cost_usd: float = Field(0.0, description="Total cost in USD")
    avg_response_time_ms: float = Field(0.0, description="Average response time")
    success_rate: float = Field(0.0, description="Success rate (0.0-1.0)")
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    def has_capability(self, capability: AgentCapability) -> bool:
        """Check if agent has a capability"""
        return capability in self.capabilities
    
    def supports_mode(self, mode: int) -> bool:
        """Check if agent supports a mode"""
        return mode in self.supported_modes
    
    def has_access(self, user_id: str) -> bool:
        """Check if user can access agent"""
        if self.is_public:
            return True
        return user_id in self.allowed_users or user_id == self.created_by
    
    def to_display_format(self) -> Dict[str, Any]:
        """Format for frontend display"""
        return {
            "id": self.id,
            "name": self.name,
            "displayName": self.display_name,
            "avatarUrl": self.avatar_url,
            "role": self.role.value,
            "status": self.status.value,
            "capabilities": [c.value for c in self.capabilities],
            "supportedModes": self.supported_modes,
            "domainIds": self.domain_ids,
            "expertiseAreas": self.expertise_areas,
            "systemPrompt": self.system_prompt,
            "temperature": self.temperature,
            "maxTokens": self.max_tokens,
            "model": self.model,
            "isPublic": self.is_public,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
            "lastUsedAt": self.last_used_at.isoformat() if self.last_used_at else None,
            "stats": {
                "totalConversations": self.total_conversations,
                "totalMessages": self.total_messages,
                "totalTokens": self.total_tokens_used,
                "totalCost": f"${self.total_cost_usd:.2f}",
                "avgResponseTime": f"{self.avg_response_time_ms:.0f}ms",
                "successRate": f"{self.success_rate * 100:.1f}%"
            }
        }
    
    def to_llm_context(self) -> Dict[str, Any]:
        """Format for LLM context"""
        return {
            "agent_name": self.name,
            "role": self.role.value,
            "capabilities": [c.value for c in self.capabilities],
            "expertise_areas": self.expertise_areas,
            "system_prompt": self.system_prompt
        }


class AgentContextWindow(BaseModel):
    """Agent context window for conversation"""
    
    agent: AgentProfile
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)
    accumulated_tokens: int = 0
    max_context_tokens: int = 8000
    
    def add_message(self, message: Dict[str, Any], tokens: int):
        """Add message to context window"""
        self.conversation_history.append(message)
        self.accumulated_tokens += tokens
        
        # Trim if exceeds max
        while self.accumulated_tokens > self.max_context_tokens and len(self.conversation_history) > 2:
            removed = self.conversation_history.pop(0)
            self.accumulated_tokens -= removed.get("tokens", 0)
    
    def get_messages(self) -> List[Dict[str, Any]]:
        """Get all messages in context"""
        return self.conversation_history
    
    def clear(self):
        """Clear context window"""
        self.conversation_history = []
        self.accumulated_tokens = 0

