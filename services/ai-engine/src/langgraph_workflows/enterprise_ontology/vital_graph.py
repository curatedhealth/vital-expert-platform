"""
VITAL Platform - LangGraph Workflow Definition
===============================================
Main graph that orchestrates the agentic workflow.

Architecture:
    ┌─────────────────┐
    │ classify_intent │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  select_agents  │
    └────────┬────────┘
             │
    ┌────────▼────────┐     ┌─────────────────────┐
    │retrieve_context │────►│ (skip if clarify)   │
    └────────┬────────┘     └─────────────────────┘
             │
    ┌────────▼────────┐     ┌─────────────────────┐
    │ enrich_graph    │────►│ (skip if simple Q)  │
    └────────┬────────┘     └─────────────────────┘
             │
    ┌────────▼────────┐
    │generate_response│
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │format_citations │
    └────────┬────────┘
             │
            END
"""

from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, END

from .state import VITALState, create_initial_state
from .nodes import (
    classify_intent,
    select_agents,
    retrieve_context,
    enrich_with_graph_context,
    generate_response,
    format_citations,
    handle_error,
    should_retrieve_context,
    should_enrich_with_graph,
    has_error
)


# =============================================================================
# GRAPH BUILDER
# =============================================================================

def build_vital_graph() -> StateGraph:
    """
    Build the VITAL agentic workflow graph.

    Returns a compiled LangGraph StateGraph ready for execution.
    """

    # Create graph with state type
    workflow = StateGraph(VITALState)

    # =========================================================================
    # ADD NODES
    # =========================================================================

    workflow.add_node("classify_intent", classify_intent)
    workflow.add_node("select_agents", select_agents)
    workflow.add_node("retrieve_context", retrieve_context)
    workflow.add_node("enrich_graph_context", enrich_with_graph_context)
    workflow.add_node("generate_response", generate_response)
    workflow.add_node("format_citations", format_citations)
    workflow.add_node("handle_error", handle_error)

    # =========================================================================
    # ADD EDGES
    # =========================================================================

    # Start → Intent Classification
    workflow.set_entry_point("classify_intent")

    # Intent → Agent Selection
    workflow.add_edge("classify_intent", "select_agents")

    # Agent Selection → RAG Retrieval (conditional)
    workflow.add_conditional_edges(
        "select_agents",
        should_retrieve_context,
        {
            "retrieve": "retrieve_context",
            "skip_rag": "generate_response"
        }
    )

    # RAG → Graph Enrichment (conditional)
    workflow.add_conditional_edges(
        "retrieve_context",
        should_enrich_with_graph,
        {
            "enrich": "enrich_graph_context",
            "skip_graph": "generate_response"
        }
    )

    # Graph Enrichment → Response Generation
    workflow.add_edge("enrich_graph_context", "generate_response")

    # Response Generation → Citation Formatting (with error check)
    workflow.add_conditional_edges(
        "generate_response",
        has_error,
        {
            "error": "handle_error",
            "continue": "format_citations"
        }
    )

    # Citation Formatting → END
    workflow.add_edge("format_citations", END)

    # Error Handler → END
    workflow.add_edge("handle_error", END)

    return workflow


def compile_graph():
    """Compile the graph for execution."""
    workflow = build_vital_graph()
    return workflow.compile()


# =============================================================================
# EXECUTION HELPERS
# =============================================================================

class VITALWorkflow:
    """
    High-level interface for running VITAL agentic workflows.

    Example:
        workflow = VITALWorkflow()
        result = workflow.run(
            query="What are the latest MSL engagement strategies?",
            user_persona_type="AUTOMATOR"
        )
        print(result["final_response"])
    """

    def __init__(self):
        self.graph = compile_graph()

    def run(
        self,
        query: str,
        session_id: str = "default",
        user_persona_type: str = None,
        user_role_id: str = None
    ) -> VITALState:
        """
        Execute the workflow for a given query.

        Args:
            query: User's input question/task
            session_id: Session identifier for conversation tracking
            user_persona_type: AUTOMATOR, ORCHESTRATOR, LEARNER, or SKEPTIC
            user_role_id: Role ID for persona-aware agent selection

        Returns:
            Final VITALState with response and metadata
        """
        import uuid

        if session_id == "default":
            session_id = str(uuid.uuid4())

        # Create initial state
        initial_state = create_initial_state(
            user_query=query,
            session_id=session_id,
            user_persona_type=user_persona_type,
            user_role_id=user_role_id
        )

        # Execute graph
        final_state = self.graph.invoke(initial_state)

        return final_state

    def stream(
        self,
        query: str,
        session_id: str = "default",
        user_persona_type: str = None,
        user_role_id: str = None
    ):
        """
        Stream workflow execution, yielding state after each node.

        Useful for showing progress in real-time applications.
        """
        import uuid

        if session_id == "default":
            session_id = str(uuid.uuid4())

        initial_state = create_initial_state(
            user_query=query,
            session_id=session_id,
            user_persona_type=user_persona_type,
            user_role_id=user_role_id
        )

        # Stream execution
        for state in self.graph.stream(initial_state):
            yield state

    def get_latency_breakdown(self, final_state: VITALState) -> Dict[str, float]:
        """Get latency breakdown by node."""
        return final_state.get("latency_ms", {})


# =============================================================================
# SPECIALIZED WORKFLOWS
# =============================================================================

class MSLEngagementWorkflow(VITALWorkflow):
    """Specialized workflow for MSL engagement queries."""

    def run(self, query: str, **kwargs) -> VITALState:
        # Pre-set functional domain
        result = super().run(query, **kwargs)
        if not result.get("functional_domain"):
            result["functional_domain"] = "medical_affairs"
        return result


class RegulatoryAffairsWorkflow(VITALWorkflow):
    """Specialized workflow for regulatory queries."""

    def run(self, query: str, **kwargs) -> VITALState:
        result = super().run(query, **kwargs)
        if not result.get("functional_domain"):
            result["functional_domain"] = "regulatory_affairs"
        return result


# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import sys
    import json

    print("VITAL LangGraph Workflow")
    print("=" * 50)

    # Example query
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "What are effective KOL engagement strategies for MSLs in oncology?"

    print(f"\nQuery: {query}\n")

    try:
        workflow = VITALWorkflow()
        result = workflow.run(
            query=query,
            user_persona_type="AUTOMATOR"
        )

        print("=" * 50)
        print("RESULT")
        print("=" * 50)

        print(f"\nIntent: {result.get('intent')}")
        print(f"Therapeutic Area: {result.get('therapeutic_area')}")
        print(f"Functional Domain: {result.get('functional_domain')}")

        if result.get("primary_agent"):
            agent = result["primary_agent"]
            print(f"\nPrimary Agent: {agent.get('name')}")
            print(f"   Role: {agent.get('role_name')}")
            print(f"   Match Score: {agent.get('match_score', 0):.2f}")

        print(f"\nRAG Namespaces: {result.get('rag_namespaces', [])}")
        print(f"Retrieved Chunks: {len(result.get('retrieved_chunks', []))}")

        print("\n" + "-" * 50)
        print("RESPONSE:")
        print("-" * 50)
        print(result.get("final_response", "No response generated"))

        print("\n" + "-" * 50)
        print("LATENCY BREAKDOWN:")
        print("-" * 50)
        for node, ms in result.get("latency_ms", {}).items():
            print(f"   {node}: {ms:.1f}ms")

        total_ms = sum(result.get("latency_ms", {}).values())
        print(f"   TOTAL: {total_ms:.1f}ms")

    except ImportError as e:
        print(f"\nNote: LangGraph not installed. Install with: pip install langgraph")
        print(f"Error: {e}")

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
