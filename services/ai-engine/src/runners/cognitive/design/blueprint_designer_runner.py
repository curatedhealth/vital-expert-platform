"""
BlueprintDesignerRunner - Design service blueprints

This runner creates service blueprints that detail the front-stage
and back-stage components of service delivery.

Algorithmic Core: service_blueprint_design
Temperature: 0.3 (precise service design)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class BlueprintAction(BaseModel):
    """Action in the service blueprint."""
    action_id: str = Field(..., description="Unique identifier")
    action_name: str = Field(..., description="Action name")
    action_lane: Literal[
        "customer_action", "frontstage", "backstage", "support_process"
    ] = Field(..., description="Blueprint lane")
    description: str = Field(..., description="What happens")
    actor: str = Field(..., description="Who performs this")
    channel: str = Field(default="", description="Channel used")
    trigger: str = Field(default="", description="What triggers this")
    duration: str = Field(default="", description="Typical duration")
    dependencies: List[str] = Field(default_factory=list, description="Action IDs")


class BlueprintInteraction(BaseModel):
    """Interaction line crossing."""
    interaction_id: str = Field(..., description="Unique identifier")
    from_action: str = Field(..., description="From action ID")
    to_action: str = Field(..., description="To action ID")
    line_crossed: Literal[
        "line_of_interaction", "line_of_visibility", "line_of_internal_interaction"
    ] = Field(..., description="Which line this crosses")
    interaction_type: Literal["sync", "async", "automated"] = Field("sync")


class ServiceBlueprint(BaseModel):
    """Complete service blueprint."""
    blueprint_id: str = Field(..., description="Unique identifier")
    service_name: str = Field(..., description="Service name")
    customer_journey_stages: List[str] = Field(default_factory=list)
    customer_actions: List[BlueprintAction] = Field(default_factory=list)
    frontstage_actions: List[BlueprintAction] = Field(default_factory=list)
    backstage_actions: List[BlueprintAction] = Field(default_factory=list)
    support_processes: List[BlueprintAction] = Field(default_factory=list)
    physical_evidence: List[str] = Field(default_factory=list)
    interactions: List[BlueprintInteraction] = Field(default_factory=list)
    fail_points: List[str] = Field(default_factory=list)
    wait_points: List[str] = Field(default_factory=list)


class BlueprintDesignerInput(BaseModel):
    """Input for blueprint design."""
    service_description: str = Field(..., description="Service to blueprint")
    customer_journey: Optional[List[str]] = Field(
        None, description="Customer journey stages"
    )
    key_touchpoints: Optional[List[str]] = Field(
        None, description="Key touchpoints"
    )
    existing_processes: Optional[List[str]] = Field(
        None, description="Existing processes to incorporate"
    )
    constraints: Optional[List[str]] = Field(
        None, description="Design constraints"
    )


class BlueprintDesignerOutput(BaseModel):
    """Output from blueprint design."""
    blueprint: ServiceBlueprint = Field(..., description="Service blueprint")
    critical_paths: List[str] = Field(
        default_factory=list, description="Critical action sequences"
    )
    automation_opportunities: List[str] = Field(
        default_factory=list, description="Actions that could be automated"
    )
    efficiency_improvements: List[str] = Field(
        default_factory=list, description="Process improvements"
    )
    risk_points: List[str] = Field(
        default_factory=list, description="High-risk points"
    )
    implementation_notes: str = Field(
        default="", description="Implementation guidance"
    )


@register_task_runner
class BlueprintDesignerRunner(TaskRunner[BlueprintDesignerInput, BlueprintDesignerOutput]):
    """
    Designs comprehensive service blueprints.

    Creates detailed blueprints showing customer actions,
    frontstage/backstage operations, and support processes.
    """

    runner_id = "blueprint_designer"
    name = "Blueprint Designer Runner"
    description = "Design service blueprints with front/backstage operations"
    algorithmic_core = "service_blueprint_design"
    category = TaskRunnerCategory.DESIGN
    temperature = 0.3
    max_tokens = 4000

    async def execute(self, input_data: BlueprintDesignerInput) -> BlueprintDesignerOutput:
        """Execute blueprint design."""
        prompt = f"""Design a service blueprint for the following service.

SERVICE: {input_data.service_description}

CUSTOMER JOURNEY STAGES:
{chr(10).join(input_data.customer_journey or ['Derive from service'])}

KEY TOUCHPOINTS:
{chr(10).join(input_data.key_touchpoints or ['Identify key touchpoints'])}

EXISTING PROCESSES:
{chr(10).join(input_data.existing_processes or ['Design from scratch'])}

CONSTRAINTS:
{chr(10).join(input_data.constraints or ['None specified'])}

Create a service blueprint with:

1. CUSTOMER ACTIONS (what customer does)

2. FRONTSTAGE ACTIONS (visible employee actions)

3. BACKSTAGE ACTIONS (invisible support activities)

4. SUPPORT PROCESSES (enabling systems/processes)

5. PHYSICAL EVIDENCE (tangible touchpoints)

6. INTERACTIONS (line crossings)
   - Line of interaction (customer <-> frontstage)
   - Line of visibility (frontstage <-> backstage)
   - Line of internal interaction (backstage <-> support)

7. FAIL POINTS (where things can go wrong)

8. WAIT POINTS (where customers wait)

Also identify:
- Critical paths
- Automation opportunities
- Efficiency improvements
- Risk points
- Implementation guidance

Return as JSON matching the BlueprintDesignerOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, BlueprintDesignerOutput)
