"""
PainPointAnalystRunner - Analyze and prioritize user pain points

This runner systematically analyzes pain points from user research,
categorizes them, and prioritizes them for solution development.

Algorithmic Core: pain_point_analysis
Temperature: 0.3 (analytical precision)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class PainPoint(BaseModel):
    """Individual pain point identified."""
    pain_id: str = Field(..., description="Unique identifier")
    pain_name: str = Field(..., description="Short name for the pain point")
    description: str = Field(..., description="Detailed description")
    pain_type: Literal["functional", "emotional", "social", "financial", "time"] = Field(
        ..., description="Type of pain"
    )
    severity: Literal["minor", "moderate", "significant", "severe", "critical"] = Field(
        ..., description="How severe the pain is"
    )
    frequency: Literal["rare", "occasional", "frequent", "constant"] = Field(
        ..., description="How often users experience this"
    )
    affected_segment: str = Field(..., description="User segment most affected")
    current_workarounds: List[str] = Field(
        default_factory=list, description="How users currently cope"
    )
    root_causes: List[str] = Field(
        default_factory=list, description="Underlying causes"
    )
    impact_score: float = Field(
        default=0.0, ge=0.0, le=10.0, description="Combined impact score"
    )


class PainPointAnalystInput(BaseModel):
    """Input for pain point analysis."""
    research_context: str = Field(..., description="Context of the research")
    raw_feedback: List[str] = Field(
        default_factory=list, description="Raw user feedback/quotes"
    )
    observed_behaviors: List[str] = Field(
        default_factory=list, description="Observed user behaviors"
    )
    user_segments: Optional[List[str]] = Field(
        None, description="User segments to analyze"
    )
    existing_pain_points: Optional[List[str]] = Field(
        None, description="Previously identified pain points"
    )


class PainPointAnalystOutput(BaseModel):
    """Output from pain point analysis."""
    pain_points: List[PainPoint] = Field(
        default_factory=list, description="Identified pain points"
    )
    pain_point_matrix: Dict[str, List[str]] = Field(
        default_factory=dict, description="Pain type -> pain IDs"
    )
    priority_ranking: List[str] = Field(
        default_factory=list, description="Pain IDs in priority order"
    )
    severity_distribution: Dict[str, int] = Field(
        default_factory=dict, description="Severity level -> count"
    )
    segment_analysis: Dict[str, List[str]] = Field(
        default_factory=dict, description="Segment -> pain IDs"
    )
    quick_wins: List[str] = Field(
        default_factory=list, description="High-impact, easy-to-solve pains"
    )
    strategic_pains: List[str] = Field(
        default_factory=list, description="High-impact, complex pains"
    )
    synthesis: str = Field(
        ..., description="Overall synthesis of pain landscape"
    )


@register_task_runner("pain_point_analyst", TaskRunnerCategory.EVALUATE)
class PainPointAnalystRunner(TaskRunner[PainPointAnalystInput, PainPointAnalystOutput]):
    """
    Analyzes and prioritizes user pain points from research data.

    Uses systematic analysis to identify, categorize, and prioritize
    pain points for solution development focus.

    Algorithmic approach:
    1. Extract pain points from raw feedback
    2. Categorize by type (functional, emotional, etc.)
    3. Assess severity and frequency
    4. Calculate impact scores
    5. Prioritize and identify quick wins vs strategic pains
    """

    name = "pain_point_analyst"
    description = "Analyze and prioritize user pain points"
    algorithmic_core = "pain_point_analysis"
    category = TaskRunnerCategory.EVALUATE
    temperature = 0.3
    max_tokens = 3500

    async def execute(self, input_data: PainPointAnalystInput) -> PainPointAnalystOutput:
        """Execute pain point analysis."""
        prompt = f"""Analyze user pain points from the following research.

CONTEXT: {input_data.research_context}

RAW FEEDBACK:
{chr(10).join(input_data.raw_feedback or ['No raw feedback provided'])}

OBSERVED BEHAVIORS:
{chr(10).join(input_data.observed_behaviors or ['No behaviors observed'])}

USER SEGMENTS: {', '.join(input_data.user_segments or ['General users'])}

EXISTING KNOWN PAIN POINTS:
{chr(10).join(input_data.existing_pain_points or ['None identified yet'])}

Perform comprehensive pain point analysis:

1. IDENTIFY PAIN POINTS: Extract all pain points with:
   - Type (functional/emotional/social/financial/time)
   - Severity (minor to critical)
   - Frequency (rare to constant)
   - Root causes
   - Current workarounds
   - Impact score (0-10)

2. CATEGORIZE: Group by type and segment

3. PRIORITIZE: Rank by impact (severity × frequency × reach)

4. IDENTIFY:
   - Quick wins (high impact, low complexity)
   - Strategic pains (high impact, high complexity)

5. SYNTHESIZE: Overall pain landscape summary

Return as JSON matching the PainPointAnalystOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, PainPointAnalystOutput)
