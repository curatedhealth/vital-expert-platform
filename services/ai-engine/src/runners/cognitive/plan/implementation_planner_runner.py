"""
ImplementationPlannerRunner - Plan solution implementation

This runner creates detailed implementation plans for solutions,
including phases, milestones, resources, and dependencies.

Algorithmic Core: implementation_planning
Temperature: 0.3 (structured planning)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class ImplementationPhase(BaseModel):
    """Phase in implementation plan."""
    phase_id: str = Field(..., description="Unique identifier")
    phase_name: str = Field(..., description="Phase name")
    phase_type: Literal[
        "discovery", "design", "build", "test", "pilot", "rollout", "optimize"
    ] = Field(..., description="Type of phase")
    description: str = Field(..., description="What happens in this phase")
    duration: str = Field(..., description="Phase duration")
    deliverables: List[str] = Field(default_factory=list)
    milestones: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list, description="Phase IDs")
    resources_needed: Dict[str, str] = Field(default_factory=dict)
    risks: List[str] = Field(default_factory=list)
    success_criteria: List[str] = Field(default_factory=list)


class ImplementationPlannerInput(BaseModel):
    """Input for implementation planning."""
    solution_description: str = Field(..., description="Solution to implement")
    scope: str = Field(..., description="Implementation scope")
    timeline_constraint: Optional[str] = Field(None, description="Timeline constraint")
    budget_constraint: Optional[str] = Field(None, description="Budget constraint")
    team_available: Optional[Dict[str, int]] = Field(
        None, description="Role -> count"
    )
    known_dependencies: Optional[List[str]] = Field(None)
    priority_areas: Optional[List[str]] = Field(None)


class ImplementationPlannerOutput(BaseModel):
    """Output from implementation planning."""
    plan_name: str = Field(..., description="Plan name")
    executive_summary: str = Field(..., description="Summary")
    phases: List[ImplementationPhase] = Field(default_factory=list)
    total_duration: str = Field(..., description="Total implementation time")
    critical_path: List[str] = Field(default_factory=list, description="Phase IDs")
    resource_summary: Dict[str, str] = Field(default_factory=dict)
    budget_estimate: str = Field(default="TBD")
    key_milestones: List[Dict[str, str]] = Field(default_factory=list)
    risk_summary: List[str] = Field(default_factory=list)
    success_metrics: List[str] = Field(default_factory=list)
    governance_model: str = Field(default="", description="How plan will be governed")
    change_management: str = Field(default="", description="Change management approach")


@register_task_runner
class ImplementationPlannerRunner(TaskRunner[ImplementationPlannerInput, ImplementationPlannerOutput]):
    """
    Creates detailed implementation plans for solutions.

    Develops phased plans with milestones, resources,
    dependencies, and risk mitigation.
    """

    runner_id = "implementation_planner"
    name = "Implementation Planner Runner"
    description = "Plan solution implementation with phases and milestones"
    algorithmic_core = "implementation_planning"
    category = TaskRunnerCategory.PLAN
    temperature = 0.3
    max_tokens = 4000

    async def execute(self, input_data: ImplementationPlannerInput) -> ImplementationPlannerOutput:
        """Execute implementation planning."""
        prompt = f"""Create an implementation plan for the following solution.

SOLUTION: {input_data.solution_description}
SCOPE: {input_data.scope}
TIMELINE CONSTRAINT: {input_data.timeline_constraint or 'Not specified'}
BUDGET CONSTRAINT: {input_data.budget_constraint or 'Not specified'}
TEAM AVAILABLE: {input_data.team_available or 'Not specified'}
KNOWN DEPENDENCIES: {input_data.known_dependencies or []}
PRIORITY AREAS: {input_data.priority_areas or []}

Create a comprehensive implementation plan:

1. EXECUTIVE SUMMARY

2. PHASES (typically 5-7):
   - Type (discovery/design/build/test/pilot/rollout/optimize)
   - Description, duration, deliverables
   - Milestones, dependencies
   - Resources needed, risks
   - Success criteria

3. CRITICAL PATH

4. RESOURCE SUMMARY and BUDGET ESTIMATE

5. KEY MILESTONES (timeline)

6. RISK SUMMARY

7. SUCCESS METRICS

8. GOVERNANCE MODEL

9. CHANGE MANAGEMENT APPROACH

Return as JSON matching the ImplementationPlannerOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, ImplementationPlannerOutput)
