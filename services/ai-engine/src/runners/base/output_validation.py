from __future__ import annotations

"""
Output validation helpers for family runners.

Provides Pydantic models and validators to ensure LLM outputs are well-formed
before storing them on runner state or emitting downstream events.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, ValidationError, field_validator


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------


class EvaluationCriterion(BaseModel):
    criterion: str
    description: Optional[str] = None
    weight: float = Field(default=0.25, ge=0.0, le=1.0)
    guidance: Optional[str] = None


class EvaluationScore(BaseModel):
    criterion: str
    score: float = Field(ge=0.0, le=1.0)
    rationale: Optional[str] = None
    issues: Optional[str] = None


class EvaluationRecommendation(BaseModel):
    text: str


def validate_evaluation_outputs(
    criteria: Any,
    scores: Any,
    recommendations: Any,
) -> Dict[str, List[Dict[str, Any]]]:
    validated_criteria = [c.model_dump() for c in _ensure_list(criteria, EvaluationCriterion)]
    validated_scores = [s.model_dump() for s in _ensure_list(scores, EvaluationScore)]
    validated_recs = [r.model_dump() for r in _ensure_list_text(recommendations)]
    return {
        "criteria": validated_criteria,
        "scores": validated_scores,
        "recommendations": validated_recs,
    }


# ---------------------------------------------------------------------------
# Investigation
# ---------------------------------------------------------------------------


class InvestigationHypothesis(BaseModel):
    title: str
    rationale: Optional[str] = None
    evidence_needed: Optional[List[str]] = None


class InvestigationEvidence(BaseModel):
    source: str
    finding: str
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    conflicts: Optional[str] = None


class InvestigationFinding(BaseModel):
    cause: str
    probability: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    gaps: Optional[str] = None


class InvestigationRecommendation(BaseModel):
    action: str
    owner: Optional[str] = None
    impact: Optional[str] = None


def validate_investigation_outputs(
    hypotheses: Any,
    evidence: Any,
    findings: Any,
    recommendations: Any,
) -> Dict[str, List[Dict[str, Any]]]:
    validated_hypotheses = [h.model_dump() for h in _ensure_list(hypotheses, InvestigationHypothesis)]
    validated_evidence = [e.model_dump() for e in _ensure_list(evidence, InvestigationEvidence)]
    validated_findings = [f.model_dump() for f in _ensure_list(findings, InvestigationFinding)]
    validated_recs = [r.model_dump() for r in _ensure_list(recommendations, InvestigationRecommendation)]
    return {
        "hypotheses": validated_hypotheses,
        "evidence": validated_evidence,
        "findings": validated_findings,
        "recommendations": validated_recs,
    }


# ---------------------------------------------------------------------------
# Problem Solving
# ---------------------------------------------------------------------------


class ProblemOption(BaseModel):
    name: str
    rationale: Optional[str] = None
    risks: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    effort: Optional[str] = None


class ProblemScore(BaseModel):
    option: str
    metric: Optional[str] = None
    score: float = Field(default=0.0, ge=0.0, le=1.0)
    rationale: Optional[str] = None


class ProblemPlanStep(BaseModel):
    step: str
    owner: Optional[str] = None
    duration: Optional[str] = None
    dependencies: Optional[List[str]] = None
    success_criteria: Optional[str] = None


def validate_problem_solving_outputs(
    options: Any,
    scores: Any,
    plan_steps: Any,
) -> Dict[str, List[Dict[str, Any]]]:
    validated_options = [o.model_dump() for o in _ensure_list(options, ProblemOption)]
    validated_scores = [s.model_dump() for s in _ensure_list(scores, ProblemScore)]
    validated_plan = [p.model_dump() for p in _ensure_list(plan_steps, ProblemPlanStep)]
    return {
        "options": validated_options,
        "scores": validated_scores,
        "plan_steps": validated_plan,
    }


# ---------------------------------------------------------------------------
# Communication
# ---------------------------------------------------------------------------


class AudienceSegment(BaseModel):
    segment: str
    needs: Optional[List[str]] = None
    barriers: Optional[List[str]] = None
    preferred_channels: Optional[List[str]] = None
    risk_flags: Optional[List[str]] = None


class MessageDesign(BaseModel):
    segment: Optional[str] = None
    key_message: str
    tone: Optional[str] = None
    cta: Optional[str] = None
    risks: Optional[str] = None
    compliance: Optional[str] = None


class ChannelPlan(BaseModel):
    channel: str
    cadence: Optional[str] = None
    kpis: Optional[List[str]] = None
    fallback: Optional[str] = None

    @field_validator("kpis", mode="before")
    @classmethod
    def _coerce_kpis(cls, v: Any) -> Any:
        if v is None:
            return v
        if isinstance(v, str):
            return [v]
        return v


def validate_communication_outputs(
    segments: Any,
    messages: Any,
    plan: Any,
) -> Dict[str, List[Dict[str, Any]]]:
    validated_segments = [s.model_dump() for s in _ensure_list(segments, AudienceSegment)]
    validated_messages = [m.model_dump() for m in _ensure_list(messages, MessageDesign)]
    validated_plan = [p.model_dump() for p in _ensure_list(plan, ChannelPlan)]
    return {
        "segments": validated_segments,
        "messages": validated_messages,
        "channel_plan": validated_plan,
    }


# ---------------------------------------------------------------------------
# Generic
# ---------------------------------------------------------------------------


class GenericPlanStep(BaseModel):
    step: str
    owner: Optional[str] = None
    outcome: Optional[str] = None
    risks: Optional[str] = None


def validate_generic_outputs(
    plan: Any,
    outputs: Any,
) -> Dict[str, List[Dict[str, Any]]]:
    validated_plan = [p.model_dump() for p in _ensure_list(plan, GenericPlanStep)]
    validated_outputs = [o if isinstance(o, dict) else {"text": str(o)} for o in _ensure_list_any(outputs)]
    return {
        "plan": validated_plan,
        "outputs": validated_outputs,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _ensure_list(value: Any, model_cls: type[BaseModel]) -> List[BaseModel]:
    if value is None:
        return []
    if isinstance(value, list):
        return [model_cls.model_validate(v) for v in value]
    return [model_cls.model_validate(value)]


def _ensure_list_text(value: Any) -> List[EvaluationRecommendation]:
    if value is None:
        return []
    if isinstance(value, list):
        return [EvaluationRecommendation(text=str(v)) for v in value]
    return [EvaluationRecommendation(text=str(value))]


def _ensure_list_any(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


__all__ = [
    "validate_evaluation_outputs",
    "validate_investigation_outputs",
    "validate_problem_solving_outputs",
    "validate_communication_outputs",
    "validate_generic_outputs",
    "validate_deep_research_outputs",
    "validate_strategy_outputs",
    "validate_monitoring_outputs",
    "ValidationError",
]

# ---------------------------------------------------------------------------
# Deep Research
# ---------------------------------------------------------------------------


class ResearchCitation(BaseModel):
    verification_report: Optional[str] = None
    verified_at: Optional[str] = None


class ResearchBranchFinding(BaseModel):
    content: str
    timestamp: Optional[str] = None


class ResearchBranchModel(BaseModel):
    branch_id: Optional[str] = None
    branch_query: Optional[str] = None
    branch_hypothesis: Optional[str] = None
    findings: List[ResearchBranchFinding] = Field(default_factory=list)
    branch_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    completed: Optional[bool] = None


def validate_deep_research_outputs(
    branches: Any,
    citations: Any,
    final_output: Any,
) -> Dict[str, Any]:
    validated_branches = [b.model_dump() for b in _ensure_list(branches, ResearchBranchModel)]
    validated_citations = [c.model_dump() for c in _ensure_list(citations, ResearchCitation)]
    if not final_output or (isinstance(final_output, str) and not final_output.strip()):
        raise ValidationError("final_output_missing")
    return {
        "branches": validated_branches,
        "citations": validated_citations,
        "final_output": final_output,
    }


# ---------------------------------------------------------------------------
# Strategy
# ---------------------------------------------------------------------------


class StrategyScenario(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    assumptions: Optional[List[str]] = None
    indicators: Optional[List[str]] = None


class StrategySWOT(BaseModel):
    scenario: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    opportunities: Optional[List[str]] = None
    threats: Optional[List[str]] = None
    risk_rating: Optional[str] = None


class StrategyRoadmap(BaseModel):
    milestone: Optional[str] = None
    owner: Optional[str] = None
    timing: Optional[str] = None
    risk: Optional[str] = None
    mitigation: Optional[str] = None


def validate_strategy_outputs(
    scenarios: Any,
    swot: Any,
    roadmap: Any,
) -> Dict[str, List[Dict[str, Any]]]:
    validated_scenarios = [s.model_dump() for s in _ensure_list(scenarios, StrategyScenario)]
    validated_swot = [s.model_dump() for s in _ensure_list(swot, StrategySWOT)]
    validated_roadmap = [r.model_dump() for r in _ensure_list(roadmap, StrategyRoadmap)]
    if not validated_scenarios:
        raise ValidationError("no_scenarios")
    return {
        "scenarios": validated_scenarios,
        "swot": validated_swot,
        "roadmap": validated_roadmap,
    }


# ---------------------------------------------------------------------------
# Monitoring
# ---------------------------------------------------------------------------


class MonitoringSignal(BaseModel):
    source: Optional[str] = None
    headline: Optional[str] = None
    timestamp: Optional[str] = None
    relevance: Optional[float] = None


class MonitoringDelta(BaseModel):
    description: str
    severity: Optional[str] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    action: Optional[str] = None


class MonitoringAlert(BaseModel):
    title: str
    impact: Optional[str] = None
    recommended_action: Optional[str] = None
    owner: Optional[str] = None
    urgency: Optional[str] = None


def validate_monitoring_outputs(
    signals: Any,
    deltas: Any,
    alerts: Any,
) -> Dict[str, List[Dict[str, Any]]]:
    validated_signals = [s.model_dump() for s in _ensure_list(signals, MonitoringSignal)]
    validated_deltas = [d.model_dump() for d in _ensure_list(deltas, MonitoringDelta)]
    validated_alerts = [a.model_dump() for a in _ensure_list(alerts, MonitoringAlert)]
    if not validated_alerts:
        raise ValidationError("no_alerts")
    return {
        "signals": validated_signals,
        "deltas": validated_deltas,
        "alerts": validated_alerts,
    }
