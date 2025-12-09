"""
JTBD: Deep Research / Investigation
- Goal: synthesize evidence, find gaps, cite sources.
- Behaviors: breadth-first retrieval, multi-source comparison, reliability scoring.
"""
from .template_base import build_canonical_graph


def build_deep_research_workflow():
    # Insert comparison node to mirror multi-source contrast step.
    extra = {
        "compare_sources": lambda state: state,
    }
    return build_canonical_graph("jtbd_deep_research", extra_nodes=extra)
