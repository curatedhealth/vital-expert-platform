"""
Circuit breaker to prevent runaway missions.
"""

from typing import Any, Dict


class CircuitBreaker:
    def __init__(self, max_steps: int = 25, max_cost: float = 10.0):
        self.max_steps = max_steps
        self.max_cost = max_cost

    def check(self, state: Dict[str, Any]) -> Dict[str, Any]:
        current_step = state.get("current_step", 0)
        if current_step >= self.max_steps:
            return {"tripped": True, "reason": f"Max steps ({self.max_steps}) exceeded"}

        total_cost = state.get("total_cost", 0.0)
        budget_limit = state.get("budget_limit")
        if budget_limit is not None and total_cost > budget_limit:
            return {"tripped": True, "reason": f"Budget limit ${budget_limit} exceeded"}
        if total_cost > self.max_cost:
            return {"tripped": True, "reason": f"Max cost ${self.max_cost} exceeded"}

        return {"tripped": False}
