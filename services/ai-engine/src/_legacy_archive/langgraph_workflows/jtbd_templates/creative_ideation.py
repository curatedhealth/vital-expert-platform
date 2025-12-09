"""
JTBD: Creative Ideation
- Goal: brainstorm variants/ideas.
- Behaviors: divergent idea generation, clustering, feasibility filter.
"""
from .template_base import build_canonical_graph


def build_creative_ideation_workflow():
    extra = {
        "cluster_ideas": lambda state: state,
        "feasibility_filter": lambda state: state,
    }
    return build_canonical_graph("jtbd_creative_ideation", extra_nodes=extra)
