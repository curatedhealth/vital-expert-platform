"""
JTBD: Tactical Planning / Execution Path
- Goal: convert a goal into actionable steps.
- Behaviors: phased plans, dependencies, resource/role mapping, time/cost estimates.
"""
from .template_base import build_canonical_graph


def build_tactical_planning_workflow():
    extra = {
        "plan_refinement": lambda state: state,
        "feasibility_check": lambda state: state,
    }
    return build_canonical_graph("jtbd_tactical_planning", extra_nodes=extra)
