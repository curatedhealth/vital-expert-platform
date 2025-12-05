"""
JTBD: Decision Memo Builder
- Goal: assemble structured comms: summary, options, risks, decision, next steps.
- Behaviors: extract key points, structure sections, validate completeness.
"""
from .template_base import build_canonical_graph


def build_decision_memo_workflow():
    extra = {
        "memo_assembler": lambda state: state,
    }
    return build_canonical_graph("jtbd_decision_memo", extra_nodes=extra)
