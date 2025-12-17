"""
FeasibilityAssessorRunner - Assess solution feasibility across dimensions

This runner evaluates the feasibility of proposed solutions across
technical, financial, organizational, and market dimensions.

Algorithmic Core: multi_dimensional_feasibility
Temperature: 0.3 (analytical precision)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class FeasibilityDimension(BaseModel):
    """Assessment of one feasibility dimension."""
    dimension: Literal[
        "technical", "financial", "operational", "organizational",
        "market", "regulatory", "timeline", "resource"
    ] = Field(..., description="Dimension being assessed")
    score: float = Field(..., ge=0.0, le=10.0, description="Feasibility score")
    confidence: Literal["low", "medium", "high"] = Field(
        "medium", description="Confidence in assessment"
    )
    key_factors: List[str] = Field(
        default_factory=list, description="Factors affecting feasibility"
    )
    risks: List[str] = Field(
        default_factory=list, description="Risks in this dimension"
    )
    mitigations: List[str] = Field(
        default_factory=list, description="Possible risk mitigations"
    )
    assumptions: List[str] = Field(
        default_factory=list, description="Assumptions made"
    )


class FeasibilityAssessorInput(BaseModel):
    """Input for feasibility assessment."""
    solution_description: str = Field(..., description="Solution being assessed")
    solution_requirements: List[str] = Field(
        default_factory=list, description="Solution requirements"
    )
    available_resources: Optional[Dict[str, Any]] = Field(
        None, description="Available resources (budget, team, tech)"
    )
    constraints: Optional[List[str]] = Field(
        None, description="Known constraints"
    )
    timeline_expectation: Optional[str] = Field(
        None, description="Expected implementation timeline"
    )
    dimensions_to_assess: Optional[List[str]] = Field(
        None, description="Specific dimensions to focus on"
    )


class FeasibilityAssessorOutput(BaseModel):
    """Output from feasibility assessment."""
    overall_feasibility: Literal[
        "not_feasible", "low", "moderate", "high", "very_high"
    ] = Field(..., description="Overall feasibility rating")
    overall_score: float = Field(
        ..., ge=0.0, le=10.0, description="Overall feasibility score"
    )
    dimension_assessments: List[FeasibilityDimension] = Field(
        default_factory=list, description="Per-dimension assessments"
    )
    critical_blockers: List[str] = Field(
        default_factory=list, description="Must-solve blockers"
    )
    key_enablers: List[str] = Field(
        default_factory=list, description="Critical success factors"
    )
    go_no_go_recommendation: Literal["go", "conditional_go", "no_go", "needs_more_info"] = Field(
        ..., description="Recommendation"
    )
    conditions_for_success: List[str] = Field(
        default_factory=list, description="Conditions needed for success"
    )
    resource_requirements: Dict[str, str] = Field(
        default_factory=dict, description="Resource type -> requirement"
    )
    timeline_assessment: str = Field(
        ..., description="Assessment of timeline feasibility"
    )
    next_steps: List[str] = Field(
        default_factory=list, description="Recommended next steps"
    )


@register_task_runner("feasibility_assessor", TaskRunnerCategory.EVALUATE)
class FeasibilityAssessorRunner(TaskRunner[FeasibilityAssessorInput, FeasibilityAssessorOutput]):
    """
    Assesses solution feasibility across multiple dimensions.

    Provides comprehensive feasibility evaluation with dimension-specific
    scores, risk assessment, and go/no-go recommendations.

    Algorithmic approach:
    1. Analyze each feasibility dimension
    2. Identify blockers and enablers
    3. Calculate dimension scores
    4. Aggregate to overall assessment
    5. Generate recommendation
    """

    name = "feasibility_assessor"
    description = "Assess solution feasibility across multiple dimensions"
    algorithmic_core = "multi_dimensional_feasibility"
    category = TaskRunnerCategory.EVALUATE
    temperature = 0.3
    max_tokens = 3500

    async def execute(self, input_data: FeasibilityAssessorInput) -> FeasibilityAssessorOutput:
        """Execute feasibility assessment."""
        prompt = f"""Assess feasibility of the following solution.

SOLUTION: {input_data.solution_description}

REQUIREMENTS:
{chr(10).join(input_data.solution_requirements or ['Not specified'])}

AVAILABLE RESOURCES: {input_data.available_resources or 'Not specified'}

CONSTRAINTS:
{chr(10).join(input_data.constraints or ['None specified'])}

TIMELINE EXPECTATION: {input_data.timeline_expectation or 'Not specified'}

DIMENSIONS TO ASSESS: {', '.join(input_data.dimensions_to_assess or ['All dimensions'])}

Perform multi-dimensional feasibility assessment:

1. ASSESS EACH DIMENSION (score 0-10):
   - Technical: Can we build it?
   - Financial: Can we afford it?
   - Operational: Can we operate it?
   - Organizational: Do we have capabilities?
   - Market: Will the market accept it?
   - Regulatory: Does it comply?
   - Timeline: Can we deliver in time?
   - Resource: Do we have what we need?

2. IDENTIFY:
   - Critical blockers (must solve)
   - Key enablers (success factors)
   - Assumptions being made

3. CALCULATE overall feasibility score

4. RECOMMEND: go / conditional_go / no_go / needs_more_info

5. SPECIFY conditions for success and next steps

Return as JSON matching the FeasibilityAssessorOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, FeasibilityAssessorOutput)
