"""
L7 Value Transformation Models

Data structures for VPANES scoring, ODI opportunity calculation,
ROI analysis, and value tracking.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class ValueCategory(str, Enum):
    """Value category classification."""
    SMARTER = "smarter"      # Better decisions, insights
    FASTER = "faster"        # Time savings, efficiency
    BETTER = "better"        # Quality improvements
    EFFICIENT = "efficient"  # Resource optimization
    SAFER = "safer"          # Risk reduction, compliance
    SCALABLE = "scalable"    # Growth enablement


class ValueDriverType(str, Enum):
    """Value driver classification."""
    INTERNAL = "internal"    # Efficiency, quality, compliance
    EXTERNAL = "external"    # HCP engagement, patient outcomes, market share


class AIInterventionType(str, Enum):
    """Type of AI intervention."""
    AUTOMATION = "automation"    # Full automation of task
    AUGMENTATION = "augmentation"  # AI assists human
    REDESIGN = "redesign"        # Redesign process with AI


class VPANESScore(BaseModel):
    """
    VPANES scoring model for AI opportunity assessment.

    VPANES = Value, Pain, Adoption, Network, Ease, Strategic
    Each dimension scored 0-10, total 0-60.
    """
    id: str
    tenant_id: str
    jtbd_id: str

    # V - Value (0-10): Business value potential
    value_score: float = Field(default=5.0, ge=0.0, le=10.0)
    value_rationale: Optional[str] = None
    value_category: Optional[ValueCategory] = None

    # P - Pain (0-10): Current pain severity
    pain_score: float = Field(default=5.0, ge=0.0, le=10.0)
    pain_rationale: Optional[str] = None

    # A - Adoption (0-10): Likelihood of adoption
    adoption_score: float = Field(default=5.0, ge=0.0, le=10.0)
    adoption_rationale: Optional[str] = None
    adoption_barriers: List[str] = Field(default_factory=list)

    # N - Network (0-10): Cross-functional impact
    network_score: float = Field(default=5.0, ge=0.0, le=10.0)
    network_rationale: Optional[str] = None
    impacted_functions: List[str] = Field(default_factory=list)

    # E - Ease (0-10): Implementation ease
    ease_score: float = Field(default=5.0, ge=0.0, le=10.0)
    ease_rationale: Optional[str] = None
    implementation_complexity: str = Field(default="medium")

    # S - Strategic (0-10): Strategic alignment
    strategic_score: float = Field(default=5.0, ge=0.0, le=10.0)
    strategic_rationale: Optional[str] = None
    strategic_priorities: List[str] = Field(default_factory=list)

    # AI Intervention
    intervention_type: AIInterventionType = AIInterventionType.AUGMENTATION
    ai_suitability_score: float = Field(default=5.0, ge=0.0, le=10.0)

    # Timestamp
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @property
    def total_score(self) -> float:
        """Calculate total VPANES score (0-60)."""
        return (
            self.value_score +
            self.pain_score +
            self.adoption_score +
            self.network_score +
            self.ease_score +
            self.strategic_score
        )

    @property
    def normalized_score(self) -> float:
        """Normalize to 0-100 scale."""
        return (self.total_score / 60) * 100

    @property
    def priority_classification(self) -> str:
        """Classify priority based on score."""
        score = self.normalized_score
        if score >= 75:
            return "high_priority"
        elif score >= 50:
            return "medium_priority"
        else:
            return "low_priority"

    class Config:
        from_attributes = True


class ROIEstimate(BaseModel):
    """ROI estimation for a JTBD or workflow."""
    id: str
    tenant_id: str
    jtbd_id: Optional[str] = None
    workflow_id: Optional[str] = None

    # Time savings
    time_saved_hours_per_week: float = Field(default=0.0)
    time_saved_annual_hours: float = Field(default=0.0)
    fte_equivalent: float = Field(default=0.0)

    # Cost savings
    hourly_rate: float = Field(default=150.0, description="Loaded hourly rate")
    annual_labor_savings: float = Field(default=0.0)
    other_cost_savings: float = Field(default=0.0)
    total_annual_savings: float = Field(default=0.0)

    # Quality improvements
    error_reduction_percent: float = Field(default=0.0)
    quality_improvement_percent: float = Field(default=0.0)
    compliance_improvement_percent: float = Field(default=0.0)

    # Investment
    implementation_cost: float = Field(default=0.0)
    annual_operating_cost: float = Field(default=0.0)
    training_cost: float = Field(default=0.0)
    total_investment: float = Field(default=0.0)

    # ROI Calculations
    net_annual_benefit: float = Field(default=0.0)
    roi_percent: float = Field(default=0.0)
    payback_months: float = Field(default=0.0)
    npv_3_year: float = Field(default=0.0)

    # Confidence
    confidence_level: str = Field(default="medium", description="low, medium, high")
    assumptions: List[str] = Field(default_factory=list)

    # Timestamp
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def calculate_roi(self) -> None:
        """Calculate derived ROI metrics."""
        self.time_saved_annual_hours = self.time_saved_hours_per_week * 52
        self.fte_equivalent = self.time_saved_annual_hours / 2080  # Standard work hours
        self.annual_labor_savings = self.time_saved_annual_hours * self.hourly_rate
        self.total_annual_savings = self.annual_labor_savings + self.other_cost_savings
        self.total_investment = self.implementation_cost + self.training_cost
        self.net_annual_benefit = self.total_annual_savings - self.annual_operating_cost

        if self.total_investment > 0:
            self.roi_percent = ((self.net_annual_benefit - self.total_investment) / self.total_investment) * 100
            monthly_benefit = self.net_annual_benefit / 12
            if monthly_benefit > 0:
                self.payback_months = self.total_investment / monthly_benefit

    class Config:
        from_attributes = True


class ValueRealization(BaseModel):
    """Track actual value realized from AI implementation."""
    id: str
    tenant_id: str
    jtbd_id: str
    mission_id: Optional[str] = None

    # Estimated vs Actual - Time
    estimated_time_saved_minutes: float = Field(default=0.0)
    actual_time_saved_minutes: float = Field(default=0.0)
    time_variance_percent: float = Field(default=0.0)

    # Estimated vs Actual - Quality
    estimated_quality_improvement: float = Field(default=0.0)
    actual_quality_improvement: float = Field(default=0.0)
    quality_variance_percent: float = Field(default=0.0)

    # User feedback
    user_satisfaction: float = Field(default=0.0, ge=0.0, le=10.0)
    would_recommend: bool = False
    user_feedback: Optional[str] = None

    # Value realized
    value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    value_categories: List[ValueCategory] = Field(default_factory=list)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    measured_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ValueContext(BaseModel):
    """Resolved value context."""
    vpanes_scores: List[VPANESScore] = Field(default_factory=list)
    roi_estimates: List[ROIEstimate] = Field(default_factory=list)
    value_realizations: List[ValueRealization] = Field(default_factory=list)

    # Aggregated
    avg_vpanes_score: float = Field(default=0.0)
    total_estimated_savings: float = Field(default=0.0)
    total_realized_value: float = Field(default=0.0)

    # Top opportunities
    top_opportunity_jtbd_ids: List[str] = Field(default_factory=list)

    # Value categories distribution
    value_by_category: Dict[str, float] = Field(default_factory=dict)

    # Confidence
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
