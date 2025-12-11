from __future__ import annotations

from typing import Any, Dict, List, Optional, TypedDict
from typing_extensions import Literal


MissionStatus = Literal["idle", "planning", "running", "awaiting_checkpoint", "completed", "failed"]
PlanStepStatus = Literal["pending", "running", "completed", "failed"]


class PlanStep(TypedDict, total=False):
    id: str
    name: str
    description: str
    agent: str
    stage: str
    tools: List[str]
    runner: Optional[str]
    status: PlanStepStatus
    started_at: Optional[str]
    completed_at: Optional[str]


class MissionState(TypedDict, total=False):
    """Minimal mission state for Modes 3/4."""

    mission_id: str
    mode: int  # 3 or 4
    goal: str
    template_id: Optional[str]
    template_family: Optional[str]          # Template family (e.g., "RESEARCH")
    template_cat: Optional[str]             # Template category (e.g., "Evidence")
    template_checkpoints: List[Dict[str, Any]]  # Checkpoints from template
    tenant_id: Optional[str]
    user_id: Optional[str]
    selected_agent: Optional[str]           # Mode 3: user-selected
    selected_team: List[str]                # Mode 4: auto-selected
    status: MissionStatus
    plan: List[PlanStep]
    artifacts: List[Dict[str, Any]]
    checkpoints: List[Dict[str, Any]]
    ui_updates: List[Dict[str, Any]]
    checkpoint_pending: Optional[Dict[str, Any]]
    checkpoint_resolved: bool
    preflight: Dict[str, Any]
    current_step: int
    total_steps: int
    pending_checkpoint: Optional[Dict[str, Any]]
    human_response: Optional[Dict[str, Any]]
    budget_limit: Optional[float]
    current_cost: Optional[float]
    quality_checks: int
    final_output: Optional[Dict[str, Any]]  # Final synthesized output
