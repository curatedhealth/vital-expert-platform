"""
Runner registry scaffold for Modes 3/4 (Phase 2).

In Phase 3, load runner definitions from DB/mission_templates and map to
wrapper subgraphs. For now, provide a minimal map so imports succeed.
"""

from __future__ import annotations

from typing import Dict, Callable

from ..master_graph import build_master_graph

# Minimal registry: template_id -> graph factory
RUNNER_REGISTRY: Dict[str, Callable] = {
    "generic": build_master_graph,
}


def get_graph_factory(template_id: str) -> Callable:
    return RUNNER_REGISTRY.get(template_id, build_master_graph)
