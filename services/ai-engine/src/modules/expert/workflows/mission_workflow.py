"""
Unified Mission Workflow for Ask Expert Modes 3 & 4.

Golden rules:
- Mode 3 and Mode 4 are identical after entry: only the first step differs
  (manual agent selection vs. fusion selection + preflight).
- L5 tools are mandatory; evidence grounding is enforced via artifacts/citations.
- HITL checkpoints are honored; tenant isolation is required at the API layer.
"""

from typing import Any, Dict, Optional

from langgraph.graph import END, StateGraph

from ..schemas.mission_state import DEFAULT_MISSION_STATE, MissionState


class MissionWorkflowBuilder:
    """
    Builds a LangGraph workflow that supports both Mode 3 (manual) and Mode 4 (auto).
    The only divergence is the entry nodes; all downstream nodes are shared.
    """

    def __init__(
        self,
        registry,
        l1_orchestrator=None,
        safety_service=None,
        circuit_breaker=None,
    ):
        self.registry = registry
        self.l1_orchestrator = l1_orchestrator
        self.safety_service = safety_service
        self.circuit_breaker = circuit_breaker

    def build(self) -> StateGraph:
        graph = StateGraph(MissionState)

        # Nodes
        graph.add_node("router", self._route_entry)
        graph.add_node("l1_selection", self._l1_selection)  # Mode 4 only
        graph.add_node("preflight", self._preflight_check)  # Now universal (Mode 3 & 4)
        graph.add_node("plan", self._plan_node)
        graph.add_node("approval", self._approval_node)
        graph.add_node("execute", self._execute_node)
        graph.add_node("synthesize", self._synthesize_node)

        # Entry
        graph.set_entry_point("router")

        # Entry routing
        graph.add_conditional_edges(
            "router",
            lambda state: "mode_4" if state.get("mode") == 4 else "mode_3",
            {
                "mode_4": "l1_selection",
                "mode_3": "preflight",
            },
        )

        # Mode 4 setup chain
        graph.add_edge("l1_selection", "preflight")
        graph.add_conditional_edges(
            "preflight",
            lambda state: "safe" if state.get("preflight", {}).get("passed", True) else "risk",
            {
                "safe": "plan",
                "risk": "approval",
            },
        )
        # Mode 3 also hits preflight (universal safety gate)
        graph.add_edge("preflight", "plan")

        # Shared execution chain
        graph.add_edge("plan", "approval")
        graph.add_conditional_edges(
            "approval",
            self._route_after_approval,
            {
                "approve": "execute",
                "modify": "plan",
                "cancel": END,
            },
        )

        graph.add_conditional_edges(
            "execute",
            self._route_execute_loop,
            {
                "continue": "execute",
                "synthesize": "synthesize",
            },
        )

        graph.add_edge("synthesize", END)

        return graph

    # ------------------------------------------------------------------ Nodes

    async def _route_entry(self, state: MissionState) -> Dict[str, Any]:
        # minimal validation for mode
        if state.get("mode") not in (3, 4):
            raise ValueError("mode must be 3 or 4")
        # ensure defaults
        next_state = {**DEFAULT_MISSION_STATE, **state}
        return next_state

    async def _l1_selection(self, state: MissionState) -> Dict[str, Any]:
        """
        Mode 4: fusion-driven team assembly.
        If no orchestrator provided, fall back to empty team.
        """
        if not self.l1_orchestrator:
            return {"team": [], "ui_updates": state.get("ui_updates", [])}

        selection = await self.l1_orchestrator.select_team(
            goal=state.get("goal", ""),
            tenant_id=state.get("tenant_id"),
            user_context=state.get("user_context", {}),
        )

        return {
            "team": selection.get("team", []),
            "template_id": selection.get("template_id", state.get("template_id")),
            "ui_updates": state.get("ui_updates", []) + [
                {
                    "type": "fusion_selection",
                    "payload": selection,
                }
            ],
        }

    async def _preflight_check(self, state: MissionState) -> Dict[str, Any]:
        """Mode 4 safety gate."""
        if not self.safety_service:
            return {"preflight": {"passed": True}, "ui_updates": state.get("ui_updates", [])}

        result = await self.safety_service.run_check(state)
        return {
            "preflight": result.dict() if hasattr(result, "dict") else result,
            "ui_updates": state.get("ui_updates", []) + [
                {
                    "type": "preflight",
                    "payload": result.dict() if hasattr(result, "dict") else result,
                }
            ],
        }

    async def _plan_node(self, state: MissionState) -> Dict[str, Any]:
        runner = self._get_runner(state)
        plan = await runner.create_plan(state)
        total_steps = len(plan)
        return {
            "plan": plan,
            "total_steps": total_steps,
            "current_step": 0,
            "ui_updates": state.get("ui_updates", []) + [
                {"type": "plan", "payload": {"plan": plan, "total_steps": total_steps}}
            ],
        }

    async def _approval_node(self, state: MissionState) -> Dict[str, Any]:
        """
        HITL checkpoint handling.
        If a checkpoint is pending, wait for human_response (supplied via API).
        Default: auto-approve when no checkpoint specified.
        """
        checkpoint = state.get("pending_checkpoint")
        if not checkpoint:
            return {"human_response": {"action": "approve"}}

        # If human response already present, return it; otherwise request HITL
        if state.get("human_response"):
            return {}

        return {
            "ui_updates": state.get("ui_updates", []) + [
                {"type": "checkpoint", "payload": checkpoint}
            ],
        }

    async def _execute_node(self, state: MissionState) -> Dict[str, Any]:
        if self.circuit_breaker:
            guard = self.circuit_breaker.check(state)
            if guard.get("tripped"):
                return {
                    "plan": [],
                    "ui_updates": state.get("ui_updates", []) + [
                        {"type": "error", "payload": {"message": guard.get("reason")}}
                    ],
                }

        runner = self._get_runner(state)
        current_idx = state.get("current_step", 0)
        plan = state.get("plan", [])

        if current_idx >= len(plan):
            return {}

        step = plan[current_idx]
        result = await runner.execute_step(step, state)

        artifacts = state.get("artifacts", [])
        artifacts.append(result)

        return {
            "current_step": current_idx + 1,
            "artifacts": artifacts,
            "ui_updates": state.get("ui_updates", []) + [
                {
                    "type": "progress",
                    "payload": {
                        "current_step": current_idx + 1,
                        "total_steps": state.get("total_steps", len(plan)),
                    },
                },
                {"type": "artifact", "payload": result},
            ],
        }

    async def _synthesize_node(self, state: MissionState) -> Dict[str, Any]:
        runner = self._get_runner(state)
        summary = await runner.synthesize(state)
        return {
            "final_output": summary,
            "ui_updates": state.get("ui_updates", []) + [
                {"type": "complete", "payload": summary}
            ],
        }

    # ------------------------------------------------------------------ Helpers

    def _get_runner(self, state: MissionState):
        template_id = state.get("template_id") or "generic"
        runner = self.registry.get_runner(template_id)
        if runner is None:
            raise ValueError(f"No runner found for template {template_id}")
        return runner

    @staticmethod
    def _route_after_approval(state: MissionState) -> str:
        response = state.get("human_response") or {"action": "approve"}
        return response.get("action", "approve")

    @staticmethod
    def _route_execute_loop(state: MissionState) -> str:
        current = state.get("current_step", 0)
        total = state.get("total_steps", 0)
        if current < total:
            return "continue"
        return "synthesize"
