"""
L6 Analytics Models

Data structures for session metrics, agent performance,
quality scoring, and usage tracking.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class SessionAnalytics(BaseModel):
    """Analytics for a user session."""
    id: str
    tenant_id: str
    user_id: str
    session_id: str

    # Session info
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None

    # Activity
    query_count: int = Field(default=0)
    mission_count: int = Field(default=0)
    artifact_count: int = Field(default=0)

    # Agents used
    agent_ids_used: List[str] = Field(default_factory=list)
    primary_agent_id: Optional[str] = None

    # Quality
    avg_response_quality: Optional[float] = Field(None, ge=0.0, le=1.0)
    avg_user_satisfaction: Optional[float] = Field(None, ge=0.0, le=10.0)

    # Cost
    total_tokens: int = Field(default=0)
    total_cost: float = Field(default=0.0)

    class Config:
        from_attributes = True


class AgentPerformance(BaseModel):
    """Performance metrics for an agent."""
    id: str
    tenant_id: str
    agent_id: str
    period: str = Field(default="daily", description="daily, weekly, monthly")
    period_start: datetime
    period_end: datetime

    # Usage
    invocation_count: int = Field(default=0)
    unique_users: int = Field(default=0)
    unique_sessions: int = Field(default=0)

    # Performance
    avg_response_time_ms: float = Field(default=0.0)
    p95_response_time_ms: float = Field(default=0.0)
    success_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    error_rate: float = Field(default=0.0, ge=0.0, le=1.0)

    # Quality
    avg_quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    avg_user_rating: Optional[float] = Field(None, ge=0.0, le=10.0)

    # Cost
    total_tokens: int = Field(default=0)
    total_cost: float = Field(default=0.0)
    avg_cost_per_query: float = Field(default=0.0)

    class Config:
        from_attributes = True


class QualityMetrics(BaseModel):
    """Quality metrics for a response."""
    id: str
    tenant_id: str
    mission_id: str
    agent_id: Optional[str] = None

    # Response quality
    relevance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0)
    completeness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    clarity_score: float = Field(default=0.0, ge=0.0, le=1.0)

    # Evidence quality
    citation_count: int = Field(default=0)
    evidence_level: Optional[str] = None
    source_diversity: float = Field(default=0.0, ge=0.0, le=1.0)

    # Safety
    safety_score: float = Field(default=1.0, ge=0.0, le=1.0)
    hallucination_risk: float = Field(default=0.0, ge=0.0, le=1.0)

    # Overall
    overall_quality: float = Field(default=0.0, ge=0.0, le=1.0)

    # User feedback
    user_rating: Optional[float] = Field(None, ge=0.0, le=10.0)
    user_feedback: Optional[str] = None

    # Timestamp
    created_at: Optional[datetime] = None

    @property
    def calculated_overall(self) -> float:
        """Calculate overall quality from components."""
        return (
            self.relevance_score * 0.3 +
            self.accuracy_score * 0.3 +
            self.completeness_score * 0.2 +
            self.clarity_score * 0.2
        )

    class Config:
        from_attributes = True


class UsageStats(BaseModel):
    """Aggregated usage statistics."""
    tenant_id: str
    period: str
    period_start: datetime
    period_end: datetime

    # Volume
    total_queries: int = Field(default=0)
    total_missions: int = Field(default=0)
    total_users: int = Field(default=0)
    total_sessions: int = Field(default=0)

    # By mode
    mode_1_count: int = Field(default=0)
    mode_2_count: int = Field(default=0)
    mode_3_count: int = Field(default=0)
    mode_4_count: int = Field(default=0)

    # Cost
    total_tokens: int = Field(default=0)
    total_cost: float = Field(default=0.0)

    # Quality
    avg_quality: float = Field(default=0.0)
    avg_satisfaction: float = Field(default=0.0)

    class Config:
        from_attributes = True


class AnalyticsContext(BaseModel):
    """Resolved analytics context."""
    user_history: Optional[SessionAnalytics] = None
    recent_sessions: List[SessionAnalytics] = Field(default_factory=list)

    # Similar queries
    similar_queries: List[Dict[str, Any]] = Field(default_factory=list)

    # User patterns
    preferred_agents: List[str] = Field(default_factory=list)
    common_topics: List[str] = Field(default_factory=list)

    # Quality expectations
    expected_quality: float = Field(default=0.7)
    historical_satisfaction: float = Field(default=0.0)

    # Confidence
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
