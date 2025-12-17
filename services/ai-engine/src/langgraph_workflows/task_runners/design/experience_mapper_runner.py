"""
ExperienceMapperRunner - Map holistic experience ecosystems

This runner creates experience maps that capture the broader
ecosystem of user interactions beyond a single journey.

Algorithmic Core: experience_ecosystem_mapping
Temperature: 0.4 (structured holistic view)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class ExperienceLayer(BaseModel):
    """Layer in the experience ecosystem."""
    layer_id: str = Field(..., description="Unique identifier")
    layer_name: str = Field(..., description="Layer name")
    layer_type: Literal[
        "frontstage", "backstage", "support", "infrastructure"
    ] = Field(..., description="Type of layer")
    components: List[str] = Field(default_factory=list, description="Components")
    interactions: List[str] = Field(default_factory=list, description="Interactions")
    owners: List[str] = Field(default_factory=list, description="Responsible teams")


class ExperienceMoment(BaseModel):
    """Key moment in the experience."""
    moment_id: str = Field(..., description="Unique identifier")
    moment_name: str = Field(..., description="Moment name")
    moment_type: Literal[
        "first_impression", "peak", "pit", "transition", "finale"
    ] = Field(..., description="Type of moment")
    description: str = Field(..., description="What happens")
    emotional_impact: Literal["negative", "neutral", "positive", "memorable"] = Field(
        "neutral", description="Emotional impact"
    )
    touchpoints_involved: List[str] = Field(default_factory=list)
    improvement_potential: Literal["low", "medium", "high"] = Field("medium")


class ExperienceMapperInput(BaseModel):
    """Input for experience mapping."""
    experience_scope: str = Field(..., description="What experience to map")
    stakeholder_types: Optional[List[str]] = Field(
        None, description="Stakeholder types in the experience"
    )
    channels: Optional[List[str]] = Field(
        None, description="Channels to include"
    )
    time_scope: Optional[str] = Field(
        None, description="Time scope (day/week/month/lifecycle)"
    )
    existing_insights: Optional[List[str]] = Field(
        None, description="Existing insights to incorporate"
    )


class ExperienceMapperOutput(BaseModel):
    """Output from experience mapping."""
    experience_name: str = Field(..., description="Experience name")
    experience_layers: List[ExperienceLayer] = Field(
        default_factory=list, description="Experience layers"
    )
    key_moments: List[ExperienceMoment] = Field(
        default_factory=list, description="Key experience moments"
    )
    stakeholder_touchpoint_matrix: Dict[str, List[str]] = Field(
        default_factory=dict, description="Stakeholder -> touchpoints"
    )
    experience_flow: List[Dict[str, str]] = Field(
        default_factory=list, description="Flow visualization data"
    )
    pain_points: List[str] = Field(default_factory=list)
    delight_moments: List[str] = Field(default_factory=list)
    service_gaps: List[str] = Field(default_factory=list)
    design_principles: List[str] = Field(
        default_factory=list, description="Recommended design principles"
    )
    experience_score: float = Field(default=0.0, ge=0.0, le=10.0)


@register_task_runner
class ExperienceMapperRunner(TaskRunner[ExperienceMapperInput, ExperienceMapperOutput]):
    """
    Maps holistic experience ecosystems across stakeholders.

    Creates ecosystem view of experience with frontstage/backstage
    layers and key moments of truth.
    """

    runner_id = "experience_mapper"
    name = "Experience Mapper Runner"
    description = "Map holistic experience ecosystems"
    algorithmic_core = "experience_ecosystem_mapping"
    category = TaskRunnerCategory.DESIGN
    temperature = 0.4
    max_tokens = 3500

    async def execute(self, input_data: ExperienceMapperInput) -> ExperienceMapperOutput:
        """Execute experience mapping."""
        prompt = f"""Map the experience ecosystem for the following scope.

EXPERIENCE SCOPE: {input_data.experience_scope}
STAKEHOLDER TYPES: {', '.join(input_data.stakeholder_types or ['Primary users'])}
CHANNELS: {', '.join(input_data.channels or ['All relevant'])}
TIME SCOPE: {input_data.time_scope or 'Full lifecycle'}

EXISTING INSIGHTS:
{chr(10).join(input_data.existing_insights or ['None provided'])}

Create a comprehensive experience map:

1. EXPERIENCE LAYERS:
   - Frontstage (what user sees)
   - Backstage (supporting operations)
   - Support (enabling services)
   - Infrastructure (systems/tech)

2. KEY MOMENTS (first impression, peaks, pits, transitions, finale)

3. STAKEHOLDER-TOUCHPOINT MATRIX

4. EXPERIENCE FLOW

5. PAIN POINTS and DELIGHT MOMENTS

6. SERVICE GAPS

7. DESIGN PRINCIPLES (recommended)

8. EXPERIENCE QUALITY SCORE (0-10)

Return as JSON matching the ExperienceMapperOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, ExperienceMapperOutput)
