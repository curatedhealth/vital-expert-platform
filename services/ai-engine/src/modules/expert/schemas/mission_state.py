"""
Mission state schema for autonomous missions (Modes 3/4).

Shared across Mode 3 (manual agent selection) and Mode 4 (auto selection with preflight).
Uses TypedDict for LangGraph state with lightweight reducers for artifact accumulation.
"""

from typing import Any, Dict, List, Literal, Optional, TypedDict

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Reducers
# ---------------------------------------------------------------------------

def merge_artifacts(current: List[Dict[str, Any]], new: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Append new artifacts to existing list (LangGraph reducer-friendly)."""
    if not new:
        return current
    return current + new


# ---------------------------------------------------------------------------
# Helper models for structured validation where useful
# ---------------------------------------------------------------------------

class AgentDecision(BaseModel):
    agent_id: str
    rationale: str
    confidence: float


class CheckpointRequest(BaseModel):
    type: Literal["plan_approval", "tool_approval", "critical_decision", "final_review"]
    title: str
    question: str
    options: List[str]
    context: Dict[str, Any] = Field(default_factory=dict)
    timeout_seconds: int = 300
    urgency: Literal["low", "medium", "high", "critical"] = "medium"


class HumanResponse(BaseModel):
    action: Literal["approve", "modify", "cancel", "reject"]
    selection: Optional[str] = None
    reason: Optional[str] = None
    modifications: Optional[Dict[str, Any]] = None


# ---------------------------------------------------------------------------
# Mission State
# ---------------------------------------------------------------------------

class MissionState(TypedDict, total=False):
    # Identity
    mission_id: str
    tenant_id: str
    user_id: str
    mode: Literal[3, 4]

    # Inputs
    goal: str
    template_id: Optional[str]  # Mode 3: required from user; Mode 4: chosen via fusion
    user_context: Dict[str, Any]

    # Team / orchestration (Mode 4)
    team: List[AgentDecision]
    preflight: Dict[str, Any]

    # Planning / execution tracking
    plan: List[Dict[str, Any]]
    current_step: int
    total_steps: int
    iterations: int

    # Outputs (streamed)
    artifacts: List[Dict[str, Any]]
    final_output: Optional[Dict[str, Any]]

    # HITL
    pending_checkpoint: Optional[CheckpointRequest]
    human_response: Optional[HumanResponse]

    # Safety / budget
    total_cost: float
    budget_limit: Optional[float]
    elapsed_seconds: float

    # UI helpers
    ui_updates: List[Dict[str, Any]]

# Default initial state helper
DEFAULT_MISSION_STATE: MissionState = {
    "plan": [],
    "current_step": 0,
    "total_steps": 0,
    "iterations": 0,
    "artifacts": [],
    "total_cost": 0.0,
    "elapsed_seconds": 0.0,
    "ui_updates": [],
}
