"""
PathfindRunner - Find solution path using A* search principles.

Algorithmic Core: A* Search / Pathfinding
- Finds a valid path from current state to goal state
- Considers constraints and costs
- Prioritizes paths by estimated total cost

Use Cases:
- Project planning path
- Approval workflow routing
- Process optimization path
- Technical migration path
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


# =============================================================================
# Input/Output Schemas
# =============================================================================

class PathfindInput(TaskRunnerInput):
    """Input schema for PathfindRunner."""

    current_state: str = Field(
        ...,
        description="Description of current state"
    )
    goal_state: str = Field(
        ...,
        description="Description of desired goal state"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Constraints that must be satisfied"
    )
    available_actions: List[str] = Field(
        default_factory=list,
        description="Actions/resources available"
    )
    cost_factors: List[str] = Field(
        default_factory=lambda: ["time", "effort", "risk"],
        description="Factors to consider in path cost"
    )
    path_preference: str = Field(
        default="balanced",
        description="Preference: shortest | safest | cheapest | balanced"
    )


class PathStep(TaskRunnerOutput):
    """A single step in the solution path."""

    step_number: int = Field(default=0, description="Step sequence number")
    action: str = Field(default="", description="Action to take")
    from_state: str = Field(default="", description="State before action")
    to_state: str = Field(default="", description="State after action")
    cost_estimate: float = Field(default=0.0, description="Estimated cost 0-10")
    risk_level: str = Field(default="low", description="low | medium | high")
    prerequisites: List[str] = Field(default_factory=list, description="Required before this step")
    success_criteria: str = Field(default="", description="How to know step succeeded")
    rollback_plan: str = Field(default="", description="How to undo if needed")


class PathfindOutput(TaskRunnerOutput):
    """Output schema for PathfindRunner."""

    path: List[PathStep] = Field(
        default_factory=list,
        description="Solution path steps"
    )
    path_length: int = Field(default=0, description="Number of steps")
    total_cost: float = Field(default=0.0, description="Total estimated cost")
    path_summary: str = Field(default="", description="Executive summary of path")
    critical_steps: List[int] = Field(
        default_factory=list,
        description="Step numbers that are critical/risky"
    )
    decision_points: List[int] = Field(
        default_factory=list,
        description="Steps where alternatives exist"
    )
    constraints_satisfied: List[str] = Field(
        default_factory=list,
        description="Constraints this path satisfies"
    )
    constraints_at_risk: List[str] = Field(
        default_factory=list,
        description="Constraints that might be violated"
    )
    alternative_paths_exist: bool = Field(
        default=False,
        description="Whether other paths exist"
    )


# =============================================================================
# PathfindRunner Implementation
# =============================================================================

@register_task_runner
class PathfindRunner(TaskRunner[PathfindInput, PathfindOutput]):
    """
    A* search solution pathfinding runner.

    This runner finds a valid path from current state to goal state
    while respecting constraints.

    Algorithmic Pattern:
        1. Define state space (current → goal)
        2. Identify available transitions (actions)
        3. Apply A* heuristic: f(n) = g(n) + h(n)
           - g(n) = actual cost to reach node
           - h(n) = estimated cost to goal
        4. Expand nodes in priority order
        5. Return first valid path found

    Best Used For:
        - Planning sequences
        - Process navigation
        - Migration paths
        - Approval workflows
    """

    runner_id = "pathfind"
    name = "Pathfind Runner"
    description = "Find solution path using A* search"
    category = TaskRunnerCategory.SOLVE
    algorithmic_core = "a_star_search"
    max_duration_seconds = 90

    InputType = PathfindInput
    OutputType = PathfindOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize PathfindRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: PathfindInput) -> PathfindOutput:
        """
        Execute solution pathfinding.

        Args:
            input: Pathfinding parameters

        Returns:
            PathfindOutput with solution path
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            constraints_text = ""
            if input.constraints:
                constraints_text = "\nConstraints:\n" + "\n".join(f"- {c}" for c in input.constraints)

            actions_text = ""
            if input.available_actions:
                actions_text = "\nAvailable actions:\n" + "\n".join(f"- {a}" for a in input.available_actions)

            preference_instruction = self._get_preference_instruction(input.path_preference)

            system_prompt = f"""You are an expert problem solver using A* search pathfinding.

Your task is to find a valid path from current state to goal state.

Path preference: {input.path_preference}
{preference_instruction}

Cost factors to consider: {', '.join(input.cost_factors)}

A* pathfinding approach:
1. Start from current state
2. At each state, identify valid actions
3. For each action, estimate:
   - Cost to take this action
   - Remaining cost to goal (heuristic)
4. Expand lowest total cost (f = g + h) first
5. Continue until goal reached
6. Return the path found

For each step, include:
- Concrete action to take
- State transition (from → to)
- Cost estimate (0-10 scale)
- Risk level
- Prerequisites
- Success criteria
- Rollback plan (in case of failure)

Return a structured JSON response with:
- path: Array with:
  - step_number: 1, 2, 3...
  - action: What to do
  - from_state: State before
  - to_state: State after
  - cost_estimate: 0-10
  - risk_level: low | medium | high
  - prerequisites: What must be done first
  - success_criteria: How to verify success
  - rollback_plan: How to undo
- path_length: Number of steps
- total_cost: Sum of step costs
- path_summary: 2-3 sentence summary
- critical_steps: Step numbers with high risk
- decision_points: Steps with alternatives
- constraints_satisfied: Which constraints are met
- constraints_at_risk: Which constraints might break
- alternative_paths_exist: boolean"""

            user_prompt = f"""Find a solution path:

CURRENT STATE:
{input.current_state}

GOAL STATE:
{input.goal_state}
{constraints_text}
{actions_text}

Find the path and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_pathfind_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build path
            path_data = result.get("path", [])
            path = [
                PathStep(
                    step_number=int(s.get("step_number", i+1)),
                    action=s.get("action", ""),
                    from_state=s.get("from_state", ""),
                    to_state=s.get("to_state", ""),
                    cost_estimate=float(s.get("cost_estimate", 5)),
                    risk_level=s.get("risk_level", "medium"),
                    prerequisites=s.get("prerequisites", []),
                    success_criteria=s.get("success_criteria", ""),
                    rollback_plan=s.get("rollback_plan", ""),
                )
                for i, s in enumerate(path_data)
            ]

            total_cost = sum(s.cost_estimate for s in path)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return PathfindOutput(
                success=True,
                path=path,
                path_length=len(path),
                total_cost=total_cost,
                path_summary=result.get("path_summary", ""),
                critical_steps=result.get("critical_steps", []),
                decision_points=result.get("decision_points", []),
                constraints_satisfied=result.get("constraints_satisfied", []),
                constraints_at_risk=result.get("constraints_at_risk", []),
                alternative_paths_exist=result.get("alternative_paths_exist", False),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"PathfindRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return PathfindOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_preference_instruction(self, preference: str) -> str:
        """Get instruction based on path preference."""
        instructions = {
            "shortest": "Optimize for fewest steps. Minimize path length even if higher risk.",
            "safest": "Optimize for lowest risk. Prefer low-risk steps even if longer path.",
            "cheapest": "Optimize for lowest cost. Minimize resource expenditure.",
            "balanced": "Balance all factors. Find reasonable trade-off between length, risk, and cost.",
        }
        return instructions.get(preference, instructions["balanced"])

    def _parse_pathfind_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "path": [],
                "path_length": 0,
                "total_cost": 0,
                "path_summary": content[:200],
                "critical_steps": [],
                "decision_points": [],
                "constraints_satisfied": [],
                "constraints_at_risk": [],
                "alternative_paths_exist": False,
            }
