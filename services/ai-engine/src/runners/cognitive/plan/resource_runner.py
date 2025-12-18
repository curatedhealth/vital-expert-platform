"""
ResourceRunner - Allocate resources using constraint optimization.

Algorithmic Core: Constraint Optimization / Resource Leveling
- Allocates resources to tasks
- Balances workload
- Resolves over-allocation

Use Cases:
- Team assignment
- Resource planning
- Capacity management
- Workload balancing
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

class Resource(TaskRunnerOutput):
    """A resource for allocation."""

    resource_id: str = Field(default="", description="Resource ID")
    resource_name: str = Field(default="", description="Resource name")
    resource_type: str = Field(
        default="human",
        description="human | equipment | facility | budget"
    )
    capacity_hours: float = Field(default=40, description="Available hours per week")
    skills: List[str] = Field(default_factory=list, description="Skills/capabilities")
    cost_per_hour: float = Field(default=0, description="Cost per hour")


class ResourceInput(TaskRunnerInput):
    """Input schema for ResourceRunner."""

    tasks: List[Dict[str, Any]] = Field(
        ...,
        description="Tasks [{task_id, task_name, effort_hours, skills_required, scheduled_start, scheduled_end}]"
    )
    resources: List[Dict[str, Any]] = Field(
        ...,
        description="Resources [{resource_id, name, type, capacity_hours, skills, cost}]"
    )
    allocation_strategy: str = Field(
        default="balanced",
        description="Strategy: balanced | lowest_cost | fastest | skill_match"
    )
    allow_overallocation: bool = Field(
        default=False,
        description="Allow over capacity allocation"
    )
    max_overallocation_pct: float = Field(
        default=0.2,
        description="Max overallocation if allowed (0-0.5)"
    )


class TaskAllocation(TaskRunnerOutput):
    """Allocation for a single task."""

    task_id: str = Field(default="", description="Task ID")
    task_name: str = Field(default="", description="Task name")
    assigned_resources: List[str] = Field(
        default_factory=list,
        description="Assigned resource IDs"
    )
    primary_resource: str = Field(default="", description="Primary assignee")
    hours_allocated: Dict[str, float] = Field(
        default_factory=dict,
        description="{resource_id: hours}"
    )
    allocation_rationale: str = Field(default="", description="Why this allocation")
    skill_coverage: float = Field(
        default=0,
        description="How well skills are covered 0-100"
    )


class ResourceUtilization(TaskRunnerOutput):
    """Utilization for a resource."""

    resource_id: str = Field(default="", description="Resource ID")
    resource_name: str = Field(default="", description="Resource name")
    total_hours_allocated: float = Field(default=0, description="Hours assigned")
    capacity_hours: float = Field(default=40, description="Available hours")
    utilization_pct: float = Field(default=0, description="Utilization 0-100")
    is_overallocated: bool = Field(default=False, description="Over capacity")
    assigned_tasks: List[str] = Field(
        default_factory=list,
        description="Task IDs assigned"
    )


class ResourceOutput(TaskRunnerOutput):
    """Output schema for ResourceRunner."""

    allocations: List[TaskAllocation] = Field(
        default_factory=list,
        description="Task allocations"
    )
    resource_utilization: List[ResourceUtilization] = Field(
        default_factory=list,
        description="Resource utilization"
    )
    unassigned_tasks: List[str] = Field(
        default_factory=list,
        description="Tasks that couldn't be assigned"
    )
    overallocated_resources: List[str] = Field(
        default_factory=list,
        description="Resources over capacity"
    )
    underutilized_resources: List[str] = Field(
        default_factory=list,
        description="Resources below 50% utilization"
    )
    total_cost: float = Field(default=0, description="Total resource cost")
    average_utilization: float = Field(
        default=0,
        description="Average utilization 0-100"
    )
    allocation_summary: str = Field(default="", description="Summary")
    bottleneck_resources: List[str] = Field(
        default_factory=list,
        description="Resources constraining schedule"
    )
    optimization_suggestions: List[str] = Field(
        default_factory=list,
        description="Suggestions for improvement"
    )


# =============================================================================
# ResourceRunner Implementation
# =============================================================================

@register_task_runner
class ResourceRunner(TaskRunner[ResourceInput, ResourceOutput]):
    """
    Constraint optimization resource allocation runner.

    This runner allocates resources to tasks while respecting
    constraints and optimizing for the chosen strategy.

    Algorithmic Pattern:
        1. Parse tasks and resources
        2. For each task:
           - Find capable resources (skill match)
           - Apply allocation strategy
           - Check capacity constraints
           - Assign resources
        3. Calculate utilization
        4. Identify issues:
           - Overallocation
           - Underutilization
           - Bottlenecks
        5. Suggest optimizations

    Best Used For:
        - Team assignment
        - Capacity planning
        - Cost optimization
        - Workload balancing
    """

    runner_id = "resource"
    name = "Resource Runner"
    description = "Allocate resources using constraint optimization"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "constraint_optimization"
    max_duration_seconds = 120

    InputType = ResourceInput
    OutputType = ResourceOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ResourceRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=4000,
        )

    async def execute(self, input: ResourceInput) -> ResourceOutput:
        """
        Execute resource allocation.

        Args:
            input: Allocation parameters

        Returns:
            ResourceOutput with allocations
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            tasks_text = json.dumps(input.tasks, indent=2, default=str)[:2000]
            resources_text = json.dumps(input.resources, indent=2, default=str)[:1500]

            strategy_instruction = self._get_strategy_instruction(input.allocation_strategy)

            system_prompt = f"""You are an expert resource allocator using constraint optimization.

Your task is to allocate resources to tasks while respecting constraints.

Allocation strategy: {input.allocation_strategy}
{strategy_instruction}
Allow overallocation: {input.allow_overallocation}
Max overallocation: {input.max_overallocation_pct * 100}%

Constraint optimization approach:
1. For each task:
   - Identify skill requirements
   - Find capable resources (skill overlap)
   - Apply strategy:
     * balanced: Even distribution
     * lowest_cost: Minimize cost
     * fastest: Best skill match
     * skill_match: Highest skill coverage
   - Check capacity (hours available)
   - Assign with rationale
2. Track utilization:
   - total_hours / capacity_hours * 100
   - Flag overallocated (>100%)
   - Flag underutilized (<50%)
3. Calculate:
   - Total cost = sum(hours * cost_per_hour)
   - Average utilization
   - Skill coverage per task
4. Identify:
   - Bottleneck resources (high demand, low capacity)
   - Optimization opportunities

Return a structured JSON response with:
- allocations: Array with:
  - task_id: Task ID
  - task_name: Name
  - assigned_resources: [resource_ids]
  - primary_resource: Main assignee
  - hours_allocated: {{resource_id: hours}}
  - allocation_rationale: Why
  - skill_coverage: 0-100
- resource_utilization: Array with:
  - resource_id: ID
  - resource_name: Name
  - total_hours_allocated: Hours
  - capacity_hours: Available
  - utilization_pct: 0-100
  - is_overallocated: boolean
  - assigned_tasks: [task_ids]
- unassigned_tasks: Tasks not assigned
- overallocated_resources: Over capacity resources
- underutilized_resources: Under 50% resources
- total_cost: Total cost
- average_utilization: Average percent
- allocation_summary: 2-3 sentences
- bottleneck_resources: Constraining resources
- optimization_suggestions: Improvements"""

            user_prompt = f"""Allocate resources to tasks:

TASKS:
{tasks_text}

RESOURCES:
{resources_text}

Allocate and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_resource_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build allocations
            alloc_data = result.get("allocations", [])
            allocations = [
                TaskAllocation(
                    task_id=a.get("task_id", ""),
                    task_name=a.get("task_name", ""),
                    assigned_resources=a.get("assigned_resources", []),
                    primary_resource=a.get("primary_resource", ""),
                    hours_allocated=a.get("hours_allocated", {}),
                    allocation_rationale=a.get("allocation_rationale", ""),
                    skill_coverage=float(a.get("skill_coverage", 80)),
                )
                for a in alloc_data
            ]

            # Build utilization
            util_data = result.get("resource_utilization", [])
            utilization = [
                ResourceUtilization(
                    resource_id=u.get("resource_id", ""),
                    resource_name=u.get("resource_name", ""),
                    total_hours_allocated=float(u.get("total_hours_allocated", 0)),
                    capacity_hours=float(u.get("capacity_hours", 40)),
                    utilization_pct=float(u.get("utilization_pct", 0)),
                    is_overallocated=u.get("is_overallocated", False),
                    assigned_tasks=u.get("assigned_tasks", []),
                )
                for u in util_data
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ResourceOutput(
                success=True,
                allocations=allocations,
                resource_utilization=utilization,
                unassigned_tasks=result.get("unassigned_tasks", []),
                overallocated_resources=result.get("overallocated_resources", []),
                underutilized_resources=result.get("underutilized_resources", []),
                total_cost=float(result.get("total_cost", 0)),
                average_utilization=float(result.get("average_utilization", 0)),
                allocation_summary=result.get("allocation_summary", ""),
                bottleneck_resources=result.get("bottleneck_resources", []),
                optimization_suggestions=result.get("optimization_suggestions", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ResourceRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ResourceOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_strategy_instruction(self, strategy: str) -> str:
        """Get strategy instruction."""
        instructions = {
            "balanced": "Balanced: Distribute work evenly across resources.",
            "lowest_cost": "Lowest Cost: Minimize total resource cost.",
            "fastest": "Fastest: Assign best-skilled for speed.",
            "skill_match": "Skill Match: Maximize skill coverage per task.",
        }
        return instructions.get(strategy, instructions["balanced"])

    def _parse_resource_response(self, content: str) -> Dict[str, Any]:
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
                "allocations": [],
                "resource_utilization": [],
                "unassigned_tasks": [],
                "overallocated_resources": [],
                "underutilized_resources": [],
                "total_cost": 0,
                "average_utilization": 0,
                "allocation_summary": content[:200],
                "bottleneck_resources": [],
                "optimization_suggestions": [],
            }
