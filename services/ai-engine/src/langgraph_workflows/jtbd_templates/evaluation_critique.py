"""
JTBD: Evaluation / Critique
- Goal: assess quality/fit/risk of a draft, plan, or decision.
- Behaviors: rubric-based review, risk flags, gap analysis, improvement suggestions.
"""
from .template_base import build_canonical_graph


def build_evaluation_critique_workflow():
    extra = {
        "rubric_scoring": lambda state: state,
    }
    return build_canonical_graph("jtbd_evaluation_critique", extra_nodes=extra)
