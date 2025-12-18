"""
L5 Execution Models

Data structures for mission management, execution tracking,
and runner coordination.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class MissionStatus(str, Enum):
    """Mission execution status."""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MissionMode(str, Enum):
    """Mission execution mode."""
    MODE_1 = "mode_1"  # Instant (sync)
    MODE_2 = "mode_2"  # Standard (sync)
    MODE_3 = "mode_3"  # Deep Research (async)
    MODE_4 = "mode_4"  # Autonomous (async)


class RunnerFamily(str, Enum):
    """Task runner family classification."""
    INVESTIGATE = "investigate"
    SYNTHESIZE = "synthesize"
    VALIDATE = "validate"
    CREATE = "create"
    DESIGN = "design"
    EVALUATE = "evaluate"
    PLAN = "plan"
    EXECUTE = "execute"
    DISCOVER = "discover"
    ADAPT = "adapt"
    ALIGN = "align"
    DECIDE = "decide"
    ENGAGE = "engage"
    GOVERN = "govern"
    INFLUENCE = "influence"
    PREDICT = "predict"
    PREPARE = "prepare"
    REFINE = "refine"
    SECURE = "secure"
    SOLVE = "solve"
    UNDERSTAND = "understand"
    WATCH = "watch"


class Mission(BaseModel):
    """Mission (execution instance)."""
    id: str
    tenant_id: str
    user_id: str
    conversation_id: Optional[str] = None

    # Classification
    mode: MissionMode = MissionMode.MODE_2
    status: MissionStatus = MissionStatus.PENDING

    # Input
    query: str
    context: Dict[str, Any] = Field(default_factory=dict)

    # Configuration
    runner_family: Optional[RunnerFamily] = None
    agent_ids: List[str] = Field(default_factory=list)
    max_iterations: int = Field(default=10)
    timeout_seconds: int = Field(default=300)

    # Progress
    current_step: int = Field(default=0)
    total_steps: int = Field(default=0)
    progress_percent: float = Field(default=0.0)

    # Results
    result: Optional[Dict[str, Any]] = None
    artifacts: List[Dict[str, Any]] = Field(default_factory=list)
    error_message: Optional[str] = None

    # Metrics
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    total_tokens_used: int = Field(default=0)
    total_cost: float = Field(default=0.0)

    # Status
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MissionEvent(BaseModel):
    """Event during mission execution."""
    id: str
    tenant_id: str
    mission_id: str

    # Event details
    event_type: str = Field(..., description="step_started, step_completed, error, artifact_created, etc.")
    event_data: Dict[str, Any] = Field(default_factory=dict)

    # Progress
    step_number: Optional[int] = None
    step_name: Optional[str] = None

    # Agent context
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None

    # Timing
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    duration_ms: Optional[int] = None

    class Config:
        from_attributes = True


class ExecutionConfig(BaseModel):
    """Execution configuration for a mission."""
    mode: MissionMode = MissionMode.MODE_2
    runner_family: Optional[RunnerFamily] = None

    # Timeouts
    timeout_seconds: int = Field(default=300)
    step_timeout_seconds: int = Field(default=60)

    # Limits
    max_iterations: int = Field(default=10)
    max_tokens: int = Field(default=50000)
    max_cost: float = Field(default=5.0)

    # Features
    enable_streaming: bool = True
    enable_checkpointing: bool = True
    enable_artifacts: bool = True

    # Quality
    quality_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    require_citations: bool = False

    class Config:
        from_attributes = True


class ExecutionContext(BaseModel):
    """Resolved execution context."""
    config: ExecutionConfig = Field(default_factory=ExecutionConfig)

    # Current mission
    mission: Optional[Mission] = None
    recent_events: List[MissionEvent] = Field(default_factory=list)

    # Runner info
    runner_family: Optional[RunnerFamily] = None
    runner_config: Dict[str, Any] = Field(default_factory=dict)

    # Resource estimates
    estimated_duration_seconds: float = Field(default=0.0)
    estimated_tokens: int = Field(default=0)
    estimated_cost: float = Field(default=0.0)

    # Confidence
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
