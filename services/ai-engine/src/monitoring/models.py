"""
Pydantic models for AgentOS 3.0 Monitoring & Safety
"""

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ServiceType(str, Enum):
    """Service types for agent interactions"""
    ASK_EXPERT = "ask_expert"
    ASK_PANEL = "ask_panel"
    ASK_CRITIC = "ask_critic"
    ASK_PLANNER = "ask_planner"


class TierType(str, Enum):
    """Agent tier types"""
    TIER_1 = "tier_1"
    TIER_2 = "tier_2"
    TIER_3 = "tier_3"


class MetricPeriod(str, Enum):
    """Time periods for aggregated metrics"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class AlertType(str, Enum):
    """Types of drift alerts"""
    ACCURACY_DROP = "accuracy_drop"
    LATENCY_INCREASE = "latency_increase"
    COST_SPIKE = "cost_spike"
    CONFIDENCE_DROP = "confidence_drop"
    ERROR_RATE_INCREASE = "error_rate_increase"


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    """Status of drift alerts"""
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class ProtectedAttribute(str, Enum):
    """Protected attributes for fairness monitoring"""
    AGE_GROUP = "age_group"
    GENDER = "gender"
    REGION = "region"
    ETHNICITY = "ethnicity"
    SOCIOECONOMIC = "socioeconomic"


# ============================================================================
# Interaction Logging
# ============================================================================

class InteractionLog(BaseModel):
    """Model for logging agent interactions"""
    id: Optional[UUID] = None
    tenant_id: UUID
    user_id: Optional[UUID] = None
    session_id: UUID
    agent_id: UUID
    service_type: ServiceType
    
    # Request
    query: str
    context: Dict[str, Any] = Field(default_factory=dict)
    tier: Optional[TierType] = None
    
    # Response
    response: Optional[str] = None
    confidence_score: Optional[Decimal] = Field(None, ge=0, le=1)
    reasoning: Optional[str] = None
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Quality
    was_successful: bool = True
    had_human_oversight: bool = False
    was_escalated: bool = False
    escalation_reason: Optional[str] = None
    
    # Performance
    execution_time_ms: Optional[int] = Field(None, ge=0)
    tokens_used: Optional[int] = Field(None, ge=0)
    cost_usd: Optional[Decimal] = Field(None, ge=0)
    
    # RAG metadata
    rag_profile_id: Optional[UUID] = None
    context_chunks_used: int = 0
    graph_paths_used: int = 0
    
    # Demographics
    user_age_group: Optional[str] = None
    user_gender: Optional[str] = None
    user_region: Optional[str] = None
    user_ethnicity: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True


# ============================================================================
# Diagnostic Metrics
# ============================================================================

class DiagnosticMetrics(BaseModel):
    """Clinical-style diagnostic metrics for an agent"""
    id: Optional[UUID] = None
    agent_id: UUID
    metric_period: MetricPeriod
    period_start: date
    period_end: date
    
    # Confusion matrix
    total_interactions: int = Field(0, ge=0)
    true_positives: int = Field(0, ge=0)
    true_negatives: int = Field(0, ge=0)
    false_positives: int = Field(0, ge=0)
    false_negatives: int = Field(0, ge=0)
    
    # Calculated metrics
    sensitivity: Optional[Decimal] = Field(None, ge=0, le=1)
    specificity: Optional[Decimal] = Field(None, ge=0, le=1)
    precision_score: Optional[Decimal] = Field(None, ge=0, le=1)
    f1_score: Optional[Decimal] = Field(None, ge=0, le=1)
    accuracy: Optional[Decimal] = Field(None, ge=0, le=1)
    
    # Confidence
    avg_confidence: Optional[Decimal] = Field(None, ge=0, le=1)
    confidence_std_dev: Optional[Decimal] = None
    calibration_error: Optional[Decimal] = None
    
    # Performance
    avg_response_time_ms: Optional[int] = Field(None, ge=0)
    p95_response_time_ms: Optional[int] = Field(None, ge=0)
    p99_response_time_ms: Optional[int] = Field(None, ge=0)
    
    # Cost
    total_cost_usd: Optional[Decimal] = Field(None, ge=0)
    avg_cost_per_query: Optional[Decimal] = Field(None, ge=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True


# ============================================================================
# Drift Detection
# ============================================================================

class DriftAlert(BaseModel):
    """Model for performance drift alerts"""
    id: Optional[UUID] = None
    agent_id: UUID
    alert_type: AlertType
    severity: AlertSeverity
    
    # Drift details
    metric_name: str
    baseline_value: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    drift_magnitude: Optional[Decimal] = None
    drift_percentage: Optional[Decimal] = None
    
    # Statistical test
    test_name: Optional[str] = None
    p_value: Optional[Decimal] = Field(None, ge=0, le=1)
    is_significant: bool = False
    
    # Context
    detection_window_days: int = Field(7, gt=0)
    affected_interactions: int = 0
    
    # Resolution
    status: AlertStatus = AlertStatus.OPEN
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True


# ============================================================================
# Fairness Monitoring
# ============================================================================

class FairnessMetrics(BaseModel):
    """Model for fairness and bias tracking"""
    id: Optional[UUID] = None
    agent_id: UUID
    metric_date: date
    
    # Protected attribute
    protected_attribute: ProtectedAttribute
    attribute_value: str
    
    # Metrics per group
    total_interactions: int = Field(0, ge=0)
    successful_interactions: int = Field(0, ge=0)
    avg_confidence: Optional[Decimal] = Field(None, ge=0, le=1)
    avg_response_time_ms: Optional[int] = Field(None, ge=0)
    escalation_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    
    # Fairness indicators
    success_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    demographic_parity: Optional[Decimal] = None  # -1 to 1
    equal_opportunity: Optional[Decimal] = None
    
    # Statistical
    sample_size_adequate: bool = False
    confidence_interval_lower: Optional[Decimal] = None
    confidence_interval_upper: Optional[Decimal] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True


# ============================================================================
# Reporting Models
# ============================================================================

class PerformanceReport(BaseModel):
    """Comprehensive performance report for an agent"""
    agent_id: UUID
    agent_name: str
    period_start: date
    period_end: date
    
    # Summary metrics
    total_interactions: int
    success_rate: Decimal
    avg_confidence: Decimal
    avg_response_time_ms: int
    total_cost_usd: Decimal
    
    # Diagnostic metrics
    sensitivity: Optional[Decimal] = None
    specificity: Optional[Decimal] = None
    precision: Optional[Decimal] = None
    f1_score: Optional[Decimal] = None
    
    # Tier distribution
    tier_1_count: int = 0
    tier_2_count: int = 0
    tier_3_count: int = 0
    
    # Quality indicators
    escalation_count: int = 0
    human_oversight_count: int = 0
    
    # Drift alerts
    active_alerts: int = 0
    critical_alerts: int = 0


class FairnessReport(BaseModel):
    """Fairness report across demographics"""
    agent_id: UUID
    agent_name: str
    report_date: date
    
    # Overall metrics
    total_interactions: int
    overall_success_rate: Decimal
    
    # Demographic breakdown
    by_age_group: List[Dict[str, Any]] = Field(default_factory=list)
    by_gender: List[Dict[str, Any]] = Field(default_factory=list)
    by_region: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Fairness violations
    violations: List[Dict[str, Any]] = Field(default_factory=list)
    max_demographic_parity: Decimal  # Should be < 0.1
    
    # Compliance status
    is_compliant: bool
    compliance_notes: str

