"""
Panel Domain Models

Python models matching the existing Supabase schema exactly.
These models represent the database tables as domain entities.
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime

from domain.panel_types import PanelType, PanelStatus, ResponseType


@dataclass
class Panel:
    """
    Panel domain model matching 'panels' table.
    
    Database columns:
    - id: UUID (PK)
    - tenant_id: UUID (FK -> tenants)
    - user_id: UUID (FK -> auth.users)
    - query: TEXT
    - panel_type: TEXT (enum)
    - status: TEXT (enum)
    - configuration: JSONB
    - agents: JSONB[]
    - created_at: TIMESTAMPTZ
    - updated_at: TIMESTAMPTZ
    - started_at: TIMESTAMPTZ
    - completed_at: TIMESTAMPTZ
    - metadata: JSONB
    """
    
    id: UUID
    tenant_id: UUID
    user_id: UUID
    query: str
    panel_type: PanelType
    status: PanelStatus
    configuration: Dict[str, Any]
    agents: List[str]
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def is_running(self) -> bool:
        """Check if panel is currently running"""
        return self.status == PanelStatus.RUNNING
    
    def is_completed(self) -> bool:
        """Check if panel is completed"""
        return self.status == PanelStatus.COMPLETED
    
    def is_failed(self) -> bool:
        """Check if panel failed"""
        return self.status == PanelStatus.FAILED
    
    def can_start(self) -> bool:
        """Check if panel can be started"""
        return self.status == PanelStatus.CREATED
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "id": str(self.id),
            "tenant_id": str(self.tenant_id),
            "user_id": str(self.user_id),
            "query": self.query,
            "panel_type": self.panel_type.value,
            "status": self.status.value,
            "configuration": self.configuration,
            "agents": self.agents,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "metadata": self.metadata
        }


@dataclass
class PanelResponse:
    """
    Panel response model matching 'panel_responses' table.
    
    Database columns:
    - id: UUID (PK)
    - tenant_id: UUID (FK -> tenants)
    - panel_id: UUID (FK -> panels)
    - agent_id: TEXT
    - agent_name: TEXT
    - round_number: INTEGER
    - response_type: TEXT (enum)
    - content: TEXT
    - confidence_score: FLOAT
    - created_at: TIMESTAMPTZ
    - metadata: JSONB
    """
    
    id: UUID
    tenant_id: UUID
    panel_id: UUID
    agent_id: str
    agent_name: str
    round_number: int
    response_type: ResponseType
    content: str
    confidence_score: float
    created_at: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def is_high_confidence(self) -> bool:
        """Check if response has high confidence (>0.8)"""
        return self.confidence_score > 0.8
    
    def is_analysis(self) -> bool:
        """Check if response is analysis type"""
        return self.response_type == ResponseType.ANALYSIS
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "id": str(self.id),
            "tenant_id": str(self.tenant_id),
            "panel_id": str(self.panel_id),
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "round_number": self.round_number,
            "response_type": self.response_type.value,
            "content": self.content,
            "confidence_score": self.confidence_score,
            "created_at": self.created_at.isoformat(),
            "metadata": self.metadata
        }


@dataclass
class PanelConsensus:
    """
    Panel consensus model matching 'panel_consensus' table.
    
    Database columns:
    - id: UUID (PK)
    - tenant_id: UUID (FK -> tenants)
    - panel_id: UUID (FK -> panels)
    - round_number: INTEGER
    - consensus_level: FLOAT (0-1)
    - agreement_points: JSONB
    - disagreement_points: JSONB
    - recommendation: TEXT
    - dissenting_opinions: JSONB
    - created_at: TIMESTAMPTZ
    """
    
    id: UUID
    tenant_id: UUID
    panel_id: UUID
    round_number: int
    consensus_level: float
    agreement_points: Dict[str, Any]
    disagreement_points: Dict[str, Any]
    recommendation: str
    dissenting_opinions: Dict[str, Any]
    created_at: datetime
    
    def has_strong_consensus(self) -> bool:
        """Check if consensus is strong (>0.7)"""
        return self.consensus_level > 0.7
    
    def has_moderate_consensus(self) -> bool:
        """Check if consensus is moderate (0.5-0.7)"""
        return 0.5 <= self.consensus_level <= 0.7
    
    def has_weak_consensus(self) -> bool:
        """Check if consensus is weak (<0.5)"""
        return self.consensus_level < 0.5
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "id": str(self.id),
            "tenant_id": str(self.tenant_id),
            "panel_id": str(self.panel_id),
            "round_number": self.round_number,
            "consensus_level": self.consensus_level,
            "agreement_points": self.agreement_points,
            "disagreement_points": self.disagreement_points,
            "recommendation": self.recommendation,
            "dissenting_opinions": self.dissenting_opinions,
            "created_at": self.created_at.isoformat()
        }


@dataclass
class PanelAggregate:
    """
    Aggregate root for panel with all related data.
    Combines panel, responses, and consensus.
    """
    
    panel: Panel
    responses: List[PanelResponse] = field(default_factory=list)
    consensus: Optional[PanelConsensus] = None
    
    def add_response(self, response: PanelResponse) -> None:
        """Add a response to the panel"""
        if response.panel_id != self.panel.id:
            raise ValueError("Response panel_id doesn't match panel id")
        self.responses.append(response)
    
    def set_consensus(self, consensus: PanelConsensus) -> None:
        """Set consensus for the panel"""
        if consensus.panel_id != self.panel.id:
            raise ValueError("Consensus panel_id doesn't match panel id")
        self.consensus = consensus
    
    def get_responses_by_round(self, round_number: int) -> List[PanelResponse]:
        """Get all responses for a specific round"""
        return [r for r in self.responses if r.round_number == round_number]
    
    def get_expert_response(self, agent_id: str, round_number: int) -> Optional[PanelResponse]:
        """Get response from specific expert in a round"""
        for response in self.responses:
            if response.agent_id == agent_id and response.round_number == round_number:
                return response
        return None
    
    def get_average_confidence(self) -> float:
        """Calculate average confidence across all responses"""
        if not self.responses:
            return 0.0
        return sum(r.confidence_score for r in self.responses) / len(self.responses)
    
    def get_unique_agents(self) -> List[str]:
        """Get list of unique agent IDs that responded"""
        return list(set(r.agent_id for r in self.responses))
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert entire aggregate to dictionary"""
        return {
            "panel": self.panel.to_dict(),
            "responses": [r.to_dict() for r in self.responses],
            "consensus": self.consensus.to_dict() if self.consensus else None,
            "average_confidence": self.get_average_confidence(),
            "unique_agents": self.get_unique_agents(),
            "response_count": len(self.responses)
        }

