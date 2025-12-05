"""
JTBD Workflow Templates for Mode 3 / Mode 4

These templates are lightweight LangGraph definitions intended as starting
points for eight common JTBD archetypes. They do not wire real services yet;
they provide named nodes and metadata so we can attach planner / solver /
critic logic, HITL checkpoints, and telemetry later.
"""

from .deep_research import build_deep_research_workflow
from .strategy_options import build_strategy_options_workflow
from .tactical_planning import build_tactical_planning_workflow
from .evaluation_critique import build_evaluation_critique_workflow
from .creative_ideation import build_creative_ideation_workflow
from .monitoring_alerting import build_monitoring_alerting_workflow
from .decision_memo import build_decision_memo_workflow
from .risk_assessment import build_risk_assessment_workflow

__all__ = [
    "build_deep_research_workflow",
    "build_strategy_options_workflow",
    "build_tactical_planning_workflow",
    "build_evaluation_critique_workflow",
    "build_creative_ideation_workflow",
    "build_monitoring_alerting_workflow",
    "build_decision_memo_workflow",
    "build_risk_assessment_workflow",
]
