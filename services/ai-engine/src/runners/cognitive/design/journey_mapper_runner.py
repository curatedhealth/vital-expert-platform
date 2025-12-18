"""
JourneyMapperRunner - Map user/customer journeys

This runner creates comprehensive journey maps that visualize
user experiences across touchpoints, stages, and channels.

Algorithmic Core: journey_mapping
Temperature: 0.4 (structured with creative elements)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class JourneyStage(BaseModel):
    """Stage in the journey."""
    stage_id: str = Field(..., description="Unique identifier")
    stage_name: str = Field(..., description="Stage name")
    stage_type: Literal[
        "awareness", "consideration", "decision", "purchase",
        "onboarding", "usage", "retention", "advocacy"
    ] = Field(..., description="Stage type")
    description: str = Field(..., description="What happens in this stage")
    user_goals: List[str] = Field(default_factory=list, description="User goals")
    touchpoints: List[str] = Field(default_factory=list, description="Touchpoints")
    channels: List[str] = Field(default_factory=list, description="Channels used")
    emotions: Literal["frustrated", "anxious", "neutral", "satisfied", "delighted"] = Field(
        "neutral", description="Emotional state"
    )
    pain_points: List[str] = Field(default_factory=list, description="Pain points")
    opportunities: List[str] = Field(default_factory=list, description="Improvement opportunities")
    duration: str = Field(default="varies", description="Typical duration")


class JourneyMapperInput(BaseModel):
    """Input for journey mapping."""
    persona: str = Field(..., description="Persona/user type")
    journey_context: str = Field(..., description="What journey is being mapped")
    scope: Optional[Literal["end_to_end", "segment", "task"]] = Field(
        "end_to_end", description="Journey scope"
    )
    known_touchpoints: Optional[List[str]] = Field(
        None, description="Known touchpoints to include"
    )
    research_inputs: Optional[List[str]] = Field(
        None, description="Research data informing the map"
    )


class JourneyMapperOutput(BaseModel):
    """Output from journey mapping."""
    persona: str = Field(..., description="Persona mapped")
    journey_name: str = Field(..., description="Journey name")
    stages: List[JourneyStage] = Field(default_factory=list, description="Journey stages")
    journey_timeline: Dict[str, str] = Field(
        default_factory=dict, description="Stage -> typical duration"
    )
    emotional_arc: List[Dict[str, str]] = Field(
        default_factory=list, description="Emotional journey visualization"
    )
    critical_moments: List[str] = Field(
        default_factory=list, description="Make-or-break moments"
    )
    channel_coverage: Dict[str, List[str]] = Field(
        default_factory=dict, description="Channel -> stages"
    )
    pain_point_summary: List[str] = Field(
        default_factory=list, description="Key pain points"
    )
    opportunity_summary: List[str] = Field(
        default_factory=list, description="Key opportunities"
    )
    journey_score: float = Field(
        default=0.0, ge=0.0, le=10.0, description="Overall journey quality"
    )


@register_task_runner
class JourneyMapperRunner(TaskRunner[JourneyMapperInput, JourneyMapperOutput]):
    """
    Creates comprehensive user/customer journey maps.

    Maps the complete journey experience across stages,
    touchpoints, and channels with emotional context.
    """

    runner_id = "journey_mapper"
    name = "Journey Mapper Runner"
    description = "Map user/customer journeys across touchpoints and stages"
    algorithmic_core = "journey_mapping"
    category = TaskRunnerCategory.DESIGN
    temperature = 0.4
    max_tokens = 4000

    async def execute(self, input_data: JourneyMapperInput) -> JourneyMapperOutput:
        """Execute journey mapping."""
        prompt = f"""Create a journey map for the following persona and context.

PERSONA: {input_data.persona}
JOURNEY: {input_data.journey_context}
SCOPE: {input_data.scope}

KNOWN TOUCHPOINTS:
{chr(10).join(input_data.known_touchpoints or ['Identify from context'])}

RESEARCH INPUTS:
{chr(10).join(input_data.research_inputs or ['Use best practices'])}

Create a comprehensive journey map with:

1. STAGES (typically 5-8):
   - Stage name and type
   - User goals at each stage
   - Touchpoints and channels
   - Emotional state
   - Pain points
   - Opportunities

2. JOURNEY TIMELINE (typical durations)

3. EMOTIONAL ARC (visualization data)

4. CRITICAL MOMENTS (make-or-break points)

5. CHANNEL COVERAGE

6. SUMMARY: Pain points and opportunities

7. JOURNEY QUALITY SCORE (0-10)

Return as JSON matching the JourneyMapperOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, JourneyMapperOutput)
