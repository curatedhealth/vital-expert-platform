"""
L4 Agent Coordination Models

Data structures for agent definitions, capabilities, JTBD mappings,
and orchestration configuration.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class AgentTier(str, Enum):
    """Agent tier classification."""
    TIER_1 = "tier_1"  # Foundational (GPT-3.5, high volume)
    TIER_2 = "tier_2"  # Specialist (GPT-4, domain specific)
    TIER_3 = "tier_3"  # Ultra-Specialist (GPT-4, Claude Opus, critical)


class AgentType(str, Enum):
    """Agent type within the hierarchy."""
    ORCHESTRATOR = "orchestrator"
    EXPERT = "expert"
    SPECIALIST = "specialist"
    WORKER = "worker"
    TOOL = "tool"


class AgentDefinition(BaseModel):
    """Agent definition from database."""
    id: str
    tenant_id: str
    code: str
    name: str
    display_name: Optional[str] = None
    description: Optional[str] = None

    # Classification
    agent_type: AgentType = AgentType.SPECIALIST
    tier: AgentTier = AgentTier.TIER_2

    # Model Configuration
    model: str = Field(default="gpt-4")
    temperature: float = Field(default=0.4, ge=0.0, le=2.0)
    max_tokens: int = Field(default=3000)
    context_window: int = Field(default=8000)

    # Cost
    cost_per_query: float = Field(default=0.12)

    # Capabilities
    capabilities: List[str] = Field(default_factory=list)
    knowledge_domains: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)

    # System Prompt
    system_prompt: Optional[str] = None

    # Evidence (for model selection justification)
    model_justification: Optional[str] = None
    model_citation: Optional[str] = None

    # Status
    is_active: bool = True
    is_validated: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentCapability(BaseModel):
    """Detailed capability for an agent."""
    id: str
    tenant_id: str
    agent_id: str
    capability_code: str
    name: str
    description: Optional[str] = None

    # Classification
    category: str = Field(default="general", description="analysis, synthesis, validation, etc.")
    proficiency_level: str = Field(default="proficient", description="basic, proficient, expert")

    # Performance
    accuracy_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    speed_rating: Optional[str] = None

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentJTBDMapping(BaseModel):
    """Mapping between agents and JTBDs."""
    id: str
    tenant_id: str
    agent_id: str
    jtbd_id: str

    # Relevance
    relevance_score: float = Field(default=0.5, ge=0.0, le=1.0)
    is_primary: bool = Field(default=False, description="Primary agent for this JTBD")

    # Performance on this JTBD
    success_rate: Optional[float] = Field(None, ge=0.0, le=1.0)
    avg_response_time_seconds: Optional[float] = None
    user_satisfaction: Optional[float] = Field(None, ge=0.0, le=10.0)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentSynergyScore(BaseModel):
    """Synergy score between agents when working together."""
    agent_id_1: str
    agent_id_2: str
    synergy_score: float = Field(default=0.5, ge=0.0, le=1.0)
    collaboration_type: str = Field(default="complementary", description="complementary, supporting, sequential")
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class AgentContext(BaseModel):
    """Resolved agent context."""
    recommended_agents: List[AgentDefinition] = Field(default_factory=list)
    agent_capabilities: List[AgentCapability] = Field(default_factory=list)
    jtbd_mappings: List[AgentJTBDMapping] = Field(default_factory=list)

    # Orchestration
    primary_agent_id: Optional[str] = None
    supporting_agent_ids: List[str] = Field(default_factory=list)
    synergy_score: float = Field(default=0.0)

    # Cost estimation
    estimated_cost: float = Field(default=0.0)
    estimated_tokens: int = Field(default=0)

    # Confidence
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
