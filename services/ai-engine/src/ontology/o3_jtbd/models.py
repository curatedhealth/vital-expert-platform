"""
L3 JTBD Models - Jobs-to-be-Done Framework

Data structures for job definitions, pain points, desired outcomes,
and ODI (Opportunity-Driven Innovation) scoring.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class JobType(str, Enum):
    """Job type classification (ODI framework)."""
    FUNCTIONAL = "functional"  # What the user wants to accomplish
    EMOTIONAL = "emotional"    # How the user wants to feel
    SOCIAL = "social"          # How the user wants to be perceived


class JobComplexity(str, Enum):
    """Job complexity level."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXPERT = "expert"


class JobFrequency(str, Enum):
    """How often the job is performed."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"
    AD_HOC = "ad_hoc"


class JTBD(BaseModel):
    """Job-to-be-Done entity."""
    id: str
    tenant_id: str
    code: str = Field(..., description="Unique job code")
    name: str
    description: Optional[str] = None

    # ODI Job Statement Format
    job_statement: str = Field(..., description="When [situation], I want to [motivation], so I can [outcome]")
    when_situation: str = Field(..., description="The triggering situation")
    circumstance: Optional[str] = None
    desired_outcome: str = Field(..., description="What the user wants to achieve")

    # Classification
    job_type: JobType = JobType.FUNCTIONAL
    complexity: JobComplexity = JobComplexity.MEDIUM
    frequency: JobFrequency = JobFrequency.WEEKLY

    # Organizational Mapping (denormalized for performance)
    function_ids: List[str] = Field(default_factory=list)
    department_ids: List[str] = Field(default_factory=list)
    role_ids: List[str] = Field(default_factory=list)

    # ODI Scoring (0-10 scale)
    importance_score: float = Field(default=5.0, ge=0.0, le=10.0)
    satisfaction_score: float = Field(default=5.0, ge=0.0, le=10.0)

    # AI Configuration
    runner_family: Optional[str] = Field(None, description="Recommended runner family")
    agent_ids: List[str] = Field(default_factory=list)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @property
    def opportunity_score(self) -> float:
        """
        Calculate ODI opportunity score.

        Formula: Opportunity = Importance + MAX(Importance - Satisfaction, 0)
        Range: 0-20 (higher = bigger opportunity)
        """
        gap = max(self.importance_score - self.satisfaction_score, 0)
        return self.importance_score + gap

    @property
    def opportunity_classification(self) -> str:
        """Classify opportunity level."""
        score = self.opportunity_score
        if score >= 15:
            return "high_opportunity"
        elif score >= 10:
            return "moderate_opportunity"
        else:
            return "low_opportunity"

    class Config:
        from_attributes = True


class PainPoint(BaseModel):
    """Pain point associated with a JTBD."""
    id: str
    tenant_id: str
    jtbd_id: str
    description: str

    # Classification
    severity: str = Field(default="medium", description="low, medium, high, critical")
    frequency: str = Field(default="sometimes", description="rarely, sometimes, often, always")
    category: str = Field(default="efficiency", description="efficiency, quality, compliance, cost")

    # Impact
    time_impact_hours: Optional[float] = None
    cost_impact: Optional[float] = None
    quality_impact: Optional[str] = None

    # Current state
    current_workaround: Optional[str] = None
    workaround_effectiveness: str = Field(default="partial", description="none, partial, adequate")

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DesiredOutcome(BaseModel):
    """Desired outcome for a JTBD (ODI format)."""
    id: str
    tenant_id: str
    jtbd_id: str

    # ODI Outcome Statement
    outcome_statement: str = Field(..., description="[Direction] the [metric] of [object]")
    direction: str = Field(default="minimize", description="minimize, maximize")
    metric: str = Field(..., description="What is being measured")
    target_object: str = Field(..., description="What the metric applies to")

    # ODI Scoring (0-10 scale)
    importance: float = Field(default=5.0, ge=0.0, le=10.0)
    current_satisfaction: float = Field(default=5.0, ge=0.0, le=10.0)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @property
    def opportunity_score(self) -> float:
        """Calculate opportunity for this outcome."""
        gap = max(self.importance - self.current_satisfaction, 0)
        return self.importance + gap

    class Config:
        from_attributes = True


class SuccessCriteria(BaseModel):
    """Success criteria for a JTBD."""
    id: str
    tenant_id: str
    jtbd_id: str
    description: str

    # Measurement
    metric_type: str = Field(default="qualitative", description="qualitative, quantitative")
    target_value: Optional[str] = None
    unit: Optional[str] = None

    # Priority
    priority: str = Field(default="should_have", description="must_have, should_have, nice_to_have")

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JTBDContext(BaseModel):
    """Resolved JTBD context."""
    relevant_jtbds: List[JTBD] = Field(default_factory=list)
    pain_points: List[PainPoint] = Field(default_factory=list)
    desired_outcomes: List[DesiredOutcome] = Field(default_factory=list)
    success_criteria: List[SuccessCriteria] = Field(default_factory=list)

    # Aggregated scores
    avg_importance: float = Field(default=0.0)
    avg_satisfaction: float = Field(default=0.0)
    max_opportunity_score: float = Field(default=0.0)

    # Recommendations
    top_opportunity_jtbd_id: Optional[str] = None
    recommended_runner_family: Optional[str] = None

    # Confidence
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
