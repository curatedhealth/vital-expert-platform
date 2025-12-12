"""
JTBD: Risk Assessment / Safety Review
- Goal: identify and classify risks, recommend mitigations.
- Behaviors: hazard identification, severity/likelihood scoring, mitigation proposals.
"""
from .template_base import build_canonical_graph


def build_risk_assessment_workflow():
    extra = {
        "risk_scoring": lambda state: state,
        "mitigation_planner": lambda state: state,
    }
    return build_canonical_graph("jtbd_risk_assessment", extra_nodes=extra)
