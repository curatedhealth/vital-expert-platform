"""
Interactive workflow for chat mode (Modes 1/2).
Builds a LangGraph that routes selection (Mode 2), context enrichment (L3/L4), and L2 generation.

Mode 2 uses L1 Master Orchestrator's Fusion Intelligence for expert selection,
mirroring Mode 4's team selection but picking a single best expert.
"""

from typing import Any, Dict, Optional

from langgraph.graph import END, StateGraph

from ..schemas.interactive_state import InteractiveState, DEFAULT_INTERACTIVE_STATE
from ..services.context_enricher import ContextEnrichmentService
from .nodes.mode2_nodes import Mode2SelectionNode
from .nodes.l2_nodes import L2GenerationNode


class InteractiveWorkflowBuilder:
    """
    Builds LangGraph workflow for interactive chat modes (1 & 2).

    Mode 1: User specifies expert_id directly
    Mode 2: L1 orchestrator auto-selects best expert via Fusion Intelligence
    """

    def __init__(
        self,
        l1_orchestrator: Optional[Any] = None,
        agent_factory: Any = None,
        enrichment_service: Optional[ContextEnrichmentService] = None,
        timeout_seconds: float = 2.5,
    ):
        """
        Initialize InteractiveWorkflowBuilder.

        Args:
            l1_orchestrator: L1MasterOrchestrator for Mode 2 expert selection.
                           Uses Fusion Intelligence (Vector + Graph + Relational).
            agent_factory: AgentFactory for hydrating expert from database.
            enrichment_service: ContextEnrichmentService for L3/L4 context gathering.
            timeout_seconds: Timeout for async operations.
        """
        self.l1_orchestrator = l1_orchestrator
        self.agent_factory = agent_factory
        self.enrichment_service = enrichment_service
        self.timeout_seconds = timeout_seconds

        # Mode 2 selection now uses L1 orchestrator (same as Mode 4)
        self.mode2_node = Mode2SelectionNode(l1_orchestrator=l1_orchestrator, timeout_seconds=timeout_seconds)
        self.l2_node = L2GenerationNode(agent_factory, timeout_seconds=timeout_seconds)

    def build(self) -> StateGraph:
        graph = StateGraph(InteractiveState)

        graph.add_node("router", self._route_entry)
        graph.add_node("auto_select", self.mode2_node.run)
        graph.add_node("enrich_context", self._run_context_enrichment)
        graph.add_node("generate", self.l2_node.run)

        graph.set_entry_point("router")

        graph.add_conditional_edges(
            "router",
            lambda state: "select" if state.get("mode") == 2 and not state.get("expert_id") else "enrich",
            {"select": "auto_select", "enrich": "enrich_context"},
        )

        graph.add_edge("auto_select", "enrich_context")
        graph.add_edge("enrich_context", "generate")
        graph.add_edge("generate", END)

        return graph.compile()

    async def _route_entry(self, state: InteractiveState) -> InteractiveState:
        merged: InteractiveState = {**DEFAULT_INTERACTIVE_STATE, **state}
        return merged

    async def _run_context_enrichment(self, state: InteractiveState) -> Dict[str, Any]:
        messages = state.get("messages") or []
        goal = None
        if messages:
            last_msg = messages[-1]
            # Handle both dict messages (from API) and LangChain message objects
            if isinstance(last_msg, dict):
                goal = last_msg.get("content")
            else:
                goal = getattr(last_msg, "content", None)
        goal = goal or state.get("enriched_context", {}).get("goal") or ""

        result = await self.enrichment_service.enrich(goal=goal, user_context=state.get("user_context", {}))
        ui_updates = state.get("ui_updates", []) + result.get("ui_updates", [])

        return {
            "enriched_context": result.get("enriched_context", {}),
            "ui_updates": ui_updates,
        }
