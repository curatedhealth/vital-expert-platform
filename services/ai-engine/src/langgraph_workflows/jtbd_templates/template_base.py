"""
Minimal helpers for JTBD workflow templates.

Each template returns a compiled LangGraph with the canonical phases:
START → planner → solver → critic → end

Real logic/services (RAG, tools, HITL) should be bound by higher-level
integrations; these stubs keep node names and metadata consistent.
"""
from typing import Any, Dict
from langgraph.graph import StateGraph, END, START


def _noop(state: Dict[str, Any]) -> Dict[str, Any]:
    # Placeholder node; replace with real logic.
    return state


def build_canonical_graph(name: str, extra_nodes: Dict[str, Any] | None = None):
    """
    Build a simple state graph with planner/solver/critic phases and
    optional extra nodes inserted between solver and critic.
    """
    workflow = StateGraph(dict)

    workflow.add_node("planner", _noop)
    workflow.add_node("solver", _noop)
    if extra_nodes:
        for node_name, node_fn in extra_nodes.items():
            workflow.add_node(node_name, node_fn)
    workflow.add_node("critic", _noop)

    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", "solver")

    last_node = "solver"
    if extra_nodes:
        for node_name in extra_nodes.keys():
            workflow.add_edge(last_node, node_name)
            last_node = node_name
    workflow.add_edge(last_node, "critic")
    workflow.add_edge("critic", END)

    app = workflow.compile()
    app.name = name  # for tracing/observability
    return app
