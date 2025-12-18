"""
PilotPlannerRunner - Plan pilot programs

This runner creates pilot program plans to test solutions
at small scale before full rollout.

Algorithmic Core: pilot_program_design
Temperature: 0.3 (structured pilot planning)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class PilotCriteria(BaseModel):
    """Pilot success criteria."""
    criterion_id: str = Field(..., description="Unique identifier")
    criterion_name: str = Field(..., description="Name")
    criterion_type: Literal[
        "adoption", "satisfaction", "efficiency", "quality", "business"
    ] = Field(..., description="Type of criterion")
    metric: str = Field(..., description="How measured")
    target: str = Field(..., description="Target value")
    minimum_threshold: str = Field(..., description="Minimum acceptable")


class PilotPlan(BaseModel):
    """Complete pilot plan."""
    pilot_id: str = Field(..., description="Unique identifier")
    pilot_name: str = Field(..., description="Pilot name")
    objective: str = Field(..., description="What we're testing")
    hypothesis: str = Field(..., description="What we expect to learn")
    scope: str = Field(..., description="Pilot scope/boundaries")
    duration: str = Field(..., description="Pilot duration")
    participants: Dict[str, str] = Field(
        default_factory=dict, description="Participant type -> count"
    )
    selection_criteria: List[str] = Field(
        default_factory=list, description="How to select participants"
    )
    success_criteria: List[PilotCriteria] = Field(default_factory=list)
    data_collection: List[str] = Field(
        default_factory=list, description="Data to collect"
    )
    activities: List[str] = Field(default_factory=list)
    resources_needed: Dict[str, str] = Field(default_factory=dict)
    risks: List[str] = Field(default_factory=list)
    go_no_go_criteria: List[str] = Field(
        default_factory=list, description="Criteria for full rollout"
    )


class PilotPlannerInput(BaseModel):
    """Input for pilot planning."""
    solution_to_pilot: str = Field(..., description="Solution to pilot")
    key_hypotheses: List[str] = Field(
        default_factory=list, description="What to test"
    )
    available_participants: Optional[Dict[str, int]] = Field(
        None, description="Participant pools"
    )
    duration_constraint: Optional[str] = Field(None)
    budget_constraint: Optional[str] = Field(None)
    risk_tolerance: Literal["low", "medium", "high"] = Field("medium")


class PilotPlannerOutput(BaseModel):
    """Output from pilot planning."""
    pilot_plan: PilotPlan = Field(..., description="Complete pilot plan")
    pilot_timeline: List[Dict[str, str]] = Field(
        default_factory=list, description="Timeline of activities"
    )
    measurement_plan: Dict[str, str] = Field(
        default_factory=dict, description="What to measure when"
    )
    communication_plan: str = Field(
        default="", description="Stakeholder communication"
    )
    contingency_plan: str = Field(
        default="", description="If pilot fails"
    )
    scale_up_readiness: List[str] = Field(
        default_factory=list, description="What's needed for scale"
    )


@register_task_runner
class PilotPlannerRunner(TaskRunner[PilotPlannerInput, PilotPlannerOutput]):
    """
    Plans pilot programs to test solutions at small scale.

    Designs controlled pilots with clear hypotheses,
    success criteria, and go/no-go decisions.
    """

    runner_id = "pilot_planner"
    name = "Pilot Planner Runner"
    description = "Plan pilot programs for solution testing"
    algorithmic_core = "pilot_program_design"
    category = TaskRunnerCategory.PLAN
    temperature = 0.3
    max_tokens = 3500

    async def execute(self, input_data: PilotPlannerInput) -> PilotPlannerOutput:
        """Execute pilot planning."""
        prompt = f"""Create a pilot plan for the following solution.

SOLUTION: {input_data.solution_to_pilot}

KEY HYPOTHESES TO TEST:
{chr(10).join(input_data.key_hypotheses or ['Define key hypotheses'])}

AVAILABLE PARTICIPANTS: {input_data.available_participants or 'Not specified'}
DURATION CONSTRAINT: {input_data.duration_constraint or 'Not specified'}
BUDGET CONSTRAINT: {input_data.budget_constraint or 'Not specified'}
RISK TOLERANCE: {input_data.risk_tolerance}

Create a pilot plan:

1. PILOT OVERVIEW:
   - Name, objective, hypothesis
   - Scope, duration

2. PARTICIPANTS:
   - Types and counts
   - Selection criteria

3. SUCCESS CRITERIA:
   - Metrics, targets, minimum thresholds
   - Types: adoption, satisfaction, efficiency, quality, business

4. DATA COLLECTION PLAN

5. PILOT ACTIVITIES (timeline)

6. RESOURCES NEEDED

7. RISKS and MITIGATIONS

8. GO/NO-GO CRITERIA for full rollout

9. MEASUREMENT PLAN (what/when)

10. COMMUNICATION PLAN

11. CONTINGENCY PLAN (if pilot fails)

12. SCALE-UP READINESS (what's needed)

Return as JSON matching the PilotPlannerOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, PilotPlannerOutput)
