"""
Base classes and state definitions for Panel Workflows
Supports both Structured Panel (Type 1) and Open Panel (Type 2)
"""

from typing import TypedDict, List, Dict, Optional, Literal, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class PanelType(str, Enum):
    """Panel workflow types"""
    STRUCTURED = "structured"
    OPEN = "open"


class PanelStatus(str, Enum):
    """Panel execution status"""
    CREATED = "created"
    EXECUTING = "executing"
    AWAITING_HUMAN = "awaiting_human"
    CONVERGING = "converging"
    COMPLETED = "completed"
    FAILED = "failed"


class InterventionMode(str, Enum):
    """Human-AI intervention modes"""
    HUMAN_ONLY = "human_only"
    AI_AUGMENTED = "ai_augmented"
    AI_SIMULATED = "ai_simulated"
    HYBRID_SEQUENTIAL = "hybrid_sequential"
    HYBRID_PARALLEL = "hybrid_parallel"


class PanelState(TypedDict, total=False):
    """
    Base panel state definition for both Structured and Open panels.
    All state transitions are tracked through this TypedDict.
    """
    
    # === CORE IDENTIFIERS ===
    panel_id: str
    tenant_id: str
    user_id: str
    
    # === CONFIGURATION ===
    panel_type: Literal["structured", "open"]
    intervention_mode: str
    query: str
    context: Dict[str, Any]
    
    # === PARTICIPANTS ===
    tasks: List[Dict[str, Any]]  # Task configurations (not agents)
    expert_tasks: List[Dict[str, Any]]  # Expert task nodes
    moderator_task: Optional[Dict[str, Any]]  # Moderator task node
    
    # === EXECUTION STATE ===
    status: str
    current_round: int
    max_rounds: int
    rounds_completed: int
    current_phase: str
    
    # === AGENDA MANAGEMENT (Structured Panel) ===
    agenda_items: List[Dict[str, Any]]
    current_agenda_item: int
    
    # === TIME MANAGEMENT ===
    time_per_speaker: int
    total_time_budget: int
    time_remaining: int
    
    # === MODERATION ===
    speaking_order: List[str]
    current_speaker: int
    moderator_interventions: List[Dict[str, Any]]
    
    # === DISCUSSIONS ===
    discussions: List[Dict[str, Any]]
    opening_statements: List[Dict[str, Any]]
    dialogue_turns: List[Dict[str, Any]]
    
    # === CONSENSUS TRACKING ===
    consensus_level: float
    consensus_history: List[float]
    convergence_rate: float
    dissenting_opinions: List[Dict[str, Any]]
    
    # === THEME IDENTIFICATION (Open Panel) ===
    innovation_clusters: List[Dict[str, Any]]
    themes: List[Dict[str, Any]]
    
    # === DOCUMENTATION ===
    minutes: Dict[str, Any]
    action_items: List[Dict[str, Any]]
    decisions_log: List[Dict[str, Any]]
    
    # === OUTPUTS ===
    final_recommendation: Optional[str]
    final_report: Optional[str]
    confidence_score: float
    evidence: List[Dict[str, Any]]
    reasoning_chain: List[str]
    
    # === METADATA ===
    created_at: str
    updated_at: str
    execution_time_ms: int
    
    # === SSE STREAMING ===
    events_emitted: List[Dict[str, Any]]
    last_event_id: int
    
    # === SYSTEM PROMPTS ===
    workflow_system_prompt: Optional[str]  # Workflow-level system prompt
    task_system_prompts: Dict[str, str]  # Task-level system prompts


class PanelConfig(BaseModel):
    """Panel configuration model"""
    panel_type: PanelType
    query: str
    system_prompt: Optional[str] = None
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    experts: List[Dict[str, Any]] = Field(default_factory=list)
    rounds: int = 3
    consensus_threshold: float = 0.75
    time_budget: int = 600  # 10 minutes default
    intervention_mode: InterventionMode = InterventionMode.AI_SIMULATED
    context: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True

