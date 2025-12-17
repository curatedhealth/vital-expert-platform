"""
Panel Autonomous Workflow - State Definitions

This module defines all state types used in the panel workflow.
States are TypedDicts that flow through the LangGraph nodes.
"""

from typing import Any, Dict, List, Optional, TypedDict, Literal
from dataclasses import dataclass, field
from datetime import datetime


# =============================================================================
# PANEL TYPES
# =============================================================================

PanelType = Literal["structured", "open", "socratic", "adversarial", "delphi", "hybrid"]
PanelMissionStatus = Literal[
    "pending", "planning", "selecting", "executing",
    "consensus", "checkpoint", "synthesizing", "completed", "failed", "paused", "cancelled"
]
ExpertPosition = Literal["pro", "con", "moderator", "neutral"]


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class ExpertInfo:
    """Information about a selected expert."""
    id: str
    name: str
    model: str = "gpt-4-turbo"
    system_prompt: str = ""
    role: str = ""
    position: Optional[ExpertPosition] = None  # For adversarial debates

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "model": self.model,
            "system_prompt": self.system_prompt,
            "role": self.role,
            "position": self.position,
        }


@dataclass
class ExpertResponse:
    """A response from an expert in a discussion round."""
    expert_id: str
    expert_name: str
    content: str
    confidence: float = 0.8
    round: int = 1
    position: Optional[ExpertPosition] = None  # For adversarial debates
    vote: Optional[float] = None  # For delphi panels
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    cost: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "expert_id": self.expert_id,
            "expert_name": self.expert_name,
            "content": self.content,
            "confidence": self.confidence,
            "round": self.round,
            "position": self.position,
            "vote": self.vote,
            "timestamp": self.timestamp,
            "cost": self.cost,
        }


@dataclass
class ConsensusResult:
    """Result of consensus analysis for a round."""
    consensus_score: float
    consensus_level: Literal["high", "medium", "low"]
    agreement_points: List[str] = field(default_factory=list)
    divergent_points: List[str] = field(default_factory=list)
    key_themes: List[str] = field(default_factory=list)
    recommendation: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "consensus_score": self.consensus_score,
            "consensus_level": self.consensus_level,
            "agreement_points": self.agreement_points,
            "divergent_points": self.divergent_points,
            "key_themes": self.key_themes,
            "recommendation": self.recommendation,
        }


@dataclass
class Checkpoint:
    """A HITL checkpoint requiring user approval."""
    id: str
    type: Literal["approval", "review", "modification"]
    title: str
    description: str = ""
    options: List[str] = field(default_factory=lambda: ["Approve", "Request Changes", "Cancel"])
    consensus_score: float = 0.0
    round_count: int = 0
    expert_count: int = 0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "description": self.description,
            "options": self.options,
            "consensus_score": self.consensus_score,
            "round_count": self.round_count,
            "expert_count": self.expert_count,
            "timestamp": self.timestamp,
        }


@dataclass
class FinalOutput:
    """Final synthesized output from the panel."""
    content: str
    expert_count: int = 0
    round_count: int = 0
    consensus: Optional[ConsensusResult] = None
    artifacts: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "expert_count": self.expert_count,
            "round_count": self.round_count,
            "consensus": self.consensus.to_dict() if self.consensus else None,
            "artifacts": self.artifacts,
        }


# =============================================================================
# LANGGRAPH STATE (TypedDict for graph traversal)
# =============================================================================

class PanelMissionState(TypedDict, total=False):
    """
    Main state object that flows through the LangGraph workflow.

    This TypedDict defines all possible state keys that can be
    read/written by nodes in the panel workflow graph.
    """
    # Identity
    mission_id: str
    tenant_id: Optional[str]
    user_id: Optional[str]

    # Mission configuration
    panel_type: PanelType
    goal: str
    context: str

    # Expert configuration
    selected_experts: List[Dict[str, Any]]
    expert_count: int
    selection_method: Literal["manual", "fusion", "hybrid"]

    # Execution parameters
    max_rounds: int
    consensus_threshold: float
    budget_limit: Optional[float]
    auto_approve_checkpoints: bool

    # Execution state
    status: PanelMissionStatus
    current_round: int
    round_responses: List[List[Dict[str, Any]]]  # Responses per round
    all_responses: List[Dict[str, Any]]  # Flattened list of all responses
    round_consensus: List[Dict[str, Any]]  # Consensus results per round

    # Costs
    current_cost: float

    # Checkpoints
    checkpoint_pending: bool
    current_checkpoint: Optional[Dict[str, Any]]
    checkpoint_resolution: Optional[Dict[str, Any]]

    # Final output
    final_output: Optional[Dict[str, Any]]
    synthesis_content: str
    artifacts: List[Dict[str, Any]]

    # Error handling
    error: Optional[str]
    error_code: Optional[str]


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_initial_state(
    mission_id: str,
    goal: str,
    panel_type: PanelType = "structured",
    context: str = "",
    tenant_id: Optional[str] = None,
    user_id: Optional[str] = None,
    experts: Optional[List[Dict[str, Any]]] = None,
    max_rounds: int = 3,
    consensus_threshold: float = 0.7,
    budget_limit: Optional[float] = None,
    auto_approve_checkpoints: bool = False,
) -> PanelMissionState:
    """Create an initial state for a new panel mission."""
    return PanelMissionState(
        mission_id=mission_id,
        tenant_id=tenant_id,
        user_id=user_id,
        panel_type=panel_type,
        goal=goal,
        context=context,
        selected_experts=experts or [],
        expert_count=len(experts) if experts else 0,
        selection_method="manual" if experts else "fusion",
        max_rounds=max_rounds,
        consensus_threshold=consensus_threshold,
        budget_limit=budget_limit,
        auto_approve_checkpoints=auto_approve_checkpoints,
        status="pending",
        current_round=0,
        round_responses=[],
        all_responses=[],
        round_consensus=[],
        current_cost=0.0,
        checkpoint_pending=False,
        current_checkpoint=None,
        checkpoint_resolution=None,
        final_output=None,
        synthesis_content="",
        artifacts=[],
        error=None,
        error_code=None,
    )
