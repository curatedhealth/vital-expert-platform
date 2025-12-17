"""
FrictionAnalyzerRunner - Analyze friction points in experiences

This runner identifies and analyzes friction points in user journeys,
processes, or experiences to enable friction reduction.

Algorithmic Core: friction_analysis
Temperature: 0.3 (analytical precision)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class FrictionPoint(BaseModel):
    """Individual friction point identified."""
    friction_id: str = Field(..., description="Unique identifier")
    friction_name: str = Field(..., description="Short name")
    location: str = Field(..., description="Where in the journey/process")
    description: str = Field(..., description="Detailed description")
    friction_type: Literal[
        "cognitive", "emotional", "physical", "temporal",
        "financial", "technical", "procedural"
    ] = Field(..., description="Type of friction")
    severity: Literal["minor", "moderate", "major", "blocking"] = Field(
        ..., description="Severity level"
    )
    frequency: Literal["rare", "occasional", "common", "universal"] = Field(
        ..., description="How often encountered"
    )
    user_impact: str = Field(..., description="Impact on user experience")
    business_impact: str = Field(..., description="Impact on business metrics")
    root_cause: str = Field(..., description="Underlying cause")
    drop_off_risk: Literal["low", "medium", "high", "critical"] = Field(
        "medium", description="Risk of user abandonment"
    )


class FrictionReduction(BaseModel):
    """Proposed friction reduction."""
    reduction_id: str = Field(..., description="Unique identifier")
    target_friction: str = Field(..., description="Friction ID being addressed")
    approach: str = Field(..., description="Reduction approach")
    effort: Literal["low", "medium", "high"] = Field(
        ..., description="Implementation effort"
    )
    impact: Literal["low", "medium", "high"] = Field(
        ..., description="Expected impact"
    )
    priority: int = Field(..., ge=1, le=10, description="Priority ranking")


class FrictionAnalyzerInput(BaseModel):
    """Input for friction analysis."""
    experience_description: str = Field(..., description="Experience to analyze")
    journey_steps: Optional[List[str]] = Field(
        None, description="Steps in the journey/process"
    )
    user_feedback: Optional[List[str]] = Field(
        None, description="User complaints/feedback"
    )
    metrics_data: Optional[Dict[str, Any]] = Field(
        None, description="Drop-off rates, completion times, etc."
    )
    comparison_benchmark: Optional[str] = Field(
        None, description="Benchmark to compare against"
    )


class FrictionAnalyzerOutput(BaseModel):
    """Output from friction analysis."""
    friction_points: List[FrictionPoint] = Field(
        default_factory=list, description="Identified friction points"
    )
    friction_map: Dict[str, List[str]] = Field(
        default_factory=dict, description="Journey step -> friction IDs"
    )
    friction_by_type: Dict[str, int] = Field(
        default_factory=dict, description="Friction type -> count"
    )
    total_friction_score: float = Field(
        default=0.0, description="Overall friction score (0-100)"
    )
    highest_impact_friction: List[str] = Field(
        default_factory=list, description="Top friction IDs by impact"
    )
    drop_off_hotspots: List[str] = Field(
        default_factory=list, description="High drop-off risk locations"
    )
    reduction_opportunities: List[FrictionReduction] = Field(
        default_factory=list, description="Proposed reductions"
    )
    quick_wins: List[str] = Field(
        default_factory=list, description="Low effort, high impact reductions"
    )
    friction_summary: str = Field(
        ..., description="Executive summary of friction analysis"
    )


@register_task_runner("friction_analyzer", TaskRunnerCategory.EVALUATE)
class FrictionAnalyzerRunner(TaskRunner[FrictionAnalyzerInput, FrictionAnalyzerOutput]):
    """
    Analyzes friction points in experiences, journeys, or processes.

    Systematically identifies friction, assesses impact, and proposes
    reduction strategies prioritized by effort vs impact.

    Algorithmic approach:
    1. Map experience journey
    2. Identify friction at each step
    3. Categorize and score friction
    4. Calculate drop-off risks
    5. Generate reduction recommendations
    """

    name = "friction_analyzer"
    description = "Analyze and prioritize friction points in experiences"
    algorithmic_core = "friction_analysis"
    category = TaskRunnerCategory.EVALUATE
    temperature = 0.3
    max_tokens = 3500

    async def execute(self, input_data: FrictionAnalyzerInput) -> FrictionAnalyzerOutput:
        """Execute friction analysis."""
        prompt = f"""Analyze friction in the following experience.

EXPERIENCE: {input_data.experience_description}

JOURNEY STEPS:
{chr(10).join(input_data.journey_steps or ['Steps not specified - infer from experience'])}

USER FEEDBACK:
{chr(10).join(input_data.user_feedback or ['No feedback provided'])}

METRICS DATA: {input_data.metrics_data or 'Not available'}

BENCHMARK: {input_data.comparison_benchmark or 'No benchmark'}

Perform comprehensive friction analysis:

1. IDENTIFY FRICTION POINTS at each step:
   - Type (cognitive/emotional/physical/temporal/financial/technical/procedural)
   - Severity (minor/moderate/major/blocking)
   - Frequency (rare/occasional/common/universal)
   - Root cause
   - User and business impact
   - Drop-off risk

2. MAP friction distribution across journey

3. CALCULATE total friction score (0-100)

4. IDENTIFY:
   - Highest impact friction
   - Drop-off hotspots
   - Quick wins (low effort, high impact)

5. PROPOSE reduction strategies with effort/impact assessment

6. SUMMARIZE findings

Return as JSON matching the FrictionAnalyzerOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, FrictionAnalyzerOutput)
