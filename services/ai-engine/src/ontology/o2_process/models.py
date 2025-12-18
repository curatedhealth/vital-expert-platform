"""
L2 Process & Workflow Models

Data structures for workflow templates, stages, and task definitions.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class WorkflowType(str, Enum):
    """Workflow type classification."""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONDITIONAL = "conditional"
    ITERATIVE = "iterative"
    HYBRID = "hybrid"


class TaskType(str, Enum):
    """Task type within a workflow."""
    MANUAL = "manual"
    AUTOMATED = "automated"
    AI_ASSISTED = "ai_assisted"
    APPROVAL = "approval"
    NOTIFICATION = "notification"


class WorkflowTemplate(BaseModel):
    """Workflow template definition."""
    id: str
    tenant_id: str
    code: str
    name: str
    description: Optional[str] = None

    # Classification
    workflow_type: WorkflowType = WorkflowType.SEQUENTIAL
    category: str = Field(default="general")
    function_ids: List[str] = Field(default_factory=list)

    # Configuration
    estimated_duration_hours: Optional[float] = None
    complexity: str = Field(default="medium", description="low, medium, high")
    requires_approval: bool = False

    # Status
    is_active: bool = True
    is_template: bool = True
    version: str = Field(default="1.0")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkflowStage(BaseModel):
    """Stage within a workflow template."""
    id: str
    tenant_id: str
    workflow_template_id: str
    code: str
    name: str
    description: Optional[str] = None

    # Sequencing
    sequence_order: int = Field(default=0)
    is_optional: bool = False
    is_parallel: bool = False

    # Configuration
    estimated_duration_hours: Optional[float] = None
    required_role_ids: List[str] = Field(default_factory=list)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkflowTask(BaseModel):
    """Task within a workflow stage."""
    id: str
    tenant_id: str
    stage_id: str
    code: str
    name: str
    description: Optional[str] = None

    # Classification
    task_type: TaskType = TaskType.MANUAL

    # Sequencing
    sequence_order: int = Field(default=0)
    depends_on_task_ids: List[str] = Field(default_factory=list)

    # Configuration
    estimated_duration_minutes: Optional[int] = None
    required_tools: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)

    # AI Configuration
    runner_family: Optional[str] = Field(None, description="Task runner family if AI-assisted")
    agent_ids: List[str] = Field(default_factory=list)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProcessContext(BaseModel):
    """Resolved process context."""
    workflow_templates: List[WorkflowTemplate] = Field(default_factory=list)
    relevant_stages: List[WorkflowStage] = Field(default_factory=list)
    relevant_tasks: List[WorkflowTask] = Field(default_factory=list)

    # Recommendations
    recommended_workflow_id: Optional[str] = None
    recommended_runner_family: Optional[str] = None

    # Confidence
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
