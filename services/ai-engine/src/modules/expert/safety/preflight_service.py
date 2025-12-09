"""
Pre-flight safety service for Mode 4 missions.
"""

from typing import Any, Dict, List

from pydantic import BaseModel

from ..registry.mission_registry import MissionRegistry
from agents.l5_tools.tool_registry import ToolRegistry


class PreFlightCheckResult(BaseModel):
    passed: bool
    checks: Dict[str, Any]
    warnings: List[str]
    estimated_cost: float
    estimated_duration_min: int


class PreFlightService:
    def __init__(self, registry: MissionRegistry):
        self.registry = registry
        self.tool_registry = ToolRegistry()

    async def run_check(self, state: Dict[str, Any]) -> PreFlightCheckResult:
        template_id = state.get("template_id") or "generic"
        user_budget_limit = state.get("user_context", {}).get("budget_limit", 50.0)
        mode = state.get("mode", 3)

        runner = self.registry.get_runner(template_id)
        estimates = await runner.estimate_resources(state)

        base_cost = estimates.get("cost", 5.0 if mode == 4 else 2.5)
        budget_passed = base_cost <= user_budget_limit
        warnings: List[str] = []
        if not budget_passed:
            warnings.append(f"Estimated cost ${base_cost} exceeds limit ${user_budget_limit}")

        required_tools = ["L5-PM", "L5-CT", "L5-OPENFDA", "L5-WEB"]
        tool_status = {}
        tools_passed = True
        for tool_id in required_tools:
            try:
                self.tool_registry.get_tool(tool_id)
                tool_status[tool_id] = "online"
            except Exception:
                tool_status[tool_id] = "offline"
                tools_passed = False

        return PreFlightCheckResult(
            passed=budget_passed and tools_passed,
            checks={
                "budget": {
                    "status": "passed" if budget_passed else "failed",
                    "estimated": base_cost,
                    "limit": user_budget_limit,
                },
                "tools": {
                    "status": "passed" if tools_passed else "failed",
                    "checked": required_tools,
                    "offline": [t for t, st in tool_status.items() if st == "offline"],
                },
                "complexity": {"level": estimates.get("complexity", "medium")},
            },
            warnings=warnings,
            estimated_cost=base_cost,
            estimated_duration_min=estimates.get("time_minutes", 5),
        )
