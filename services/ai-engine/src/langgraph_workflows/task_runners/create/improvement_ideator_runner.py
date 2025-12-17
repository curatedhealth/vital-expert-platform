"""
ImprovementIdeatorRunner - Generate improvement ideas from friction/feedback

This runner generates improvement ideas specifically from friction points,
user feedback, or experience gaps to enhance existing offerings.

Algorithmic Core: improvement_generation
Temperature: 0.6 (creative but focused on improvements)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class ImprovementIdea(BaseModel):
    """Individual improvement idea."""
    improvement_id: str = Field(..., description="Unique identifier")
    improvement_name: str = Field(..., description="Short name")
    description: str = Field(..., description="What the improvement does")
    improvement_type: Literal[
        "remove_friction", "add_value", "simplify", "automate",
        "personalize", "speed_up", "error_proof"
    ] = Field(..., description="Type of improvement")
    target_issue: str = Field(..., description="Issue this addresses")
    before_state: str = Field(..., description="Current experience")
    after_state: str = Field(..., description="Improved experience")
    user_impact: Literal["low", "medium", "high", "transformational"] = Field(
        "medium", description="Impact on user experience"
    )
    effort: Literal["low", "medium", "high"] = Field(
        "medium", description="Implementation effort"
    )
    priority_score: float = Field(
        default=0.0, ge=0.0, le=10.0, description="Impact/effort priority"
    )
    quick_win: bool = Field(
        default=False, description="Is this a quick win?"
    )


class ImprovementIdeatorInput(BaseModel):
    """Input for improvement ideation."""
    current_experience: str = Field(..., description="Current experience to improve")
    friction_points: Optional[List[str]] = Field(
        None, description="Identified friction points"
    )
    user_feedback: Optional[List[str]] = Field(
        None, description="User feedback/complaints"
    )
    metrics_gaps: Optional[Dict[str, str]] = Field(
        None, description="Metric -> gap from target"
    )
    constraints: Optional[List[str]] = Field(
        None, description="Improvement constraints"
    )
    focus_areas: Optional[List[str]] = Field(
        None, description="Areas to focus improvements"
    )


class ImprovementIdeatorOutput(BaseModel):
    """Output from improvement ideation."""
    improvements: List[ImprovementIdea] = Field(
        default_factory=list, description="Generated improvement ideas"
    )
    improvements_by_type: Dict[str, List[str]] = Field(
        default_factory=dict, description="Type -> improvement IDs"
    )
    quick_wins: List[str] = Field(
        default_factory=list, description="Quick win improvement IDs"
    )
    high_impact: List[str] = Field(
        default_factory=list, description="High impact improvement IDs"
    )
    priority_ranking: List[str] = Field(
        default_factory=list, description="IDs in priority order"
    )
    implementation_roadmap: List[Dict[str, Any]] = Field(
        default_factory=list, description="Phased implementation plan"
    )
    expected_impact: str = Field(
        ..., description="Expected overall impact"
    )


@register_task_runner("improvement_ideator", TaskRunnerCategory.CREATE)
class ImprovementIdeatorRunner(TaskRunner[ImprovementIdeatorInput, ImprovementIdeatorOutput]):
    """
    Generates improvement ideas from friction and feedback.

    Creates targeted improvement concepts that address specific
    pain points and enhance existing experiences.

    Algorithmic approach:
    1. Analyze friction points and feedback
    2. Generate improvement concepts
    3. Categorize by improvement type
    4. Calculate priority (impact/effort)
    5. Create implementation roadmap
    """

    name = "improvement_ideator"
    description = "Generate improvement ideas from friction and feedback"
    algorithmic_core = "improvement_generation"
    category = TaskRunnerCategory.CREATE
    temperature = 0.6
    max_tokens = 3500

    async def execute(self, input_data: ImprovementIdeatorInput) -> ImprovementIdeatorOutput:
        """Execute improvement ideation."""
        prompt = f"""Generate improvement ideas for the following experience.

CURRENT EXPERIENCE: {input_data.current_experience}

FRICTION POINTS:
{chr(10).join(input_data.friction_points or ['Not specified'])}

USER FEEDBACK:
{chr(10).join(input_data.user_feedback or ['Not specified'])}

METRICS GAPS: {input_data.metrics_gaps or 'Not specified'}

CONSTRAINTS:
{chr(10).join(input_data.constraints or ['None specified'])}

FOCUS AREAS: {', '.join(input_data.focus_areas or ['All areas'])}

Generate improvement ideas across these types:
- Remove friction
- Add value
- Simplify
- Automate
- Personalize
- Speed up
- Error-proof

For each improvement:
1. Name and description
2. Improvement type
3. Target issue
4. Before/after states
5. User impact level
6. Implementation effort
7. Priority score (impact/effort)
8. Quick win flag

Then provide:
- Quick wins list
- High impact list
- Priority ranking
- Phased implementation roadmap
- Expected overall impact

Return as JSON matching the ImprovementIdeatorOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, ImprovementIdeatorOutput)
