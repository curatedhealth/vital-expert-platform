"""
SolutionIdeatorRunner - Generate solution ideas from problems

This runner generates diverse solution concepts from identified
problems, pain points, or opportunity spaces.

Algorithmic Core: divergent_ideation
Temperature: 0.7 (high creativity for diverse ideas)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class SolutionIdea(BaseModel):
    """Individual solution idea."""
    idea_id: str = Field(..., description="Unique identifier")
    idea_name: str = Field(..., description="Short name")
    description: str = Field(..., description="Solution description")
    idea_type: Literal[
        "incremental", "adjacent", "transformational", "disruptive"
    ] = Field(..., description="Innovation type")
    target_problem: str = Field(..., description="Problem this solves")
    value_proposition: str = Field(..., description="Key value delivered")
    key_features: List[str] = Field(
        default_factory=list, description="Main features/capabilities"
    )
    user_benefit: str = Field(..., description="Benefit to user")
    business_benefit: str = Field(..., description="Benefit to business")
    novelty_score: float = Field(
        default=0.5, ge=0.0, le=1.0, description="How novel (0-1)"
    )
    feasibility_estimate: Literal["low", "medium", "high"] = Field(
        "medium", description="Rough feasibility"
    )
    risks: List[str] = Field(default_factory=list, description="Key risks")


class SolutionIdeatorInput(BaseModel):
    """Input for solution ideation."""
    problem_statement: str = Field(..., description="Problem to solve")
    pain_points: Optional[List[str]] = Field(
        None, description="Specific pain points to address"
    )
    constraints: Optional[List[str]] = Field(
        None, description="Constraints to work within"
    )
    inspiration_sources: Optional[List[str]] = Field(
        None, description="Analogies, competitors, industries to draw from"
    )
    ideation_focus: Optional[Literal[
        "incremental", "adjacent", "transformational", "all"
    ]] = Field("all", description="Type of innovation to focus on")
    num_ideas: int = Field(default=5, ge=3, le=10, description="Number of ideas")


class SolutionIdeatorOutput(BaseModel):
    """Output from solution ideation."""
    ideas: List[SolutionIdea] = Field(
        default_factory=list, description="Generated solution ideas"
    )
    ideas_by_type: Dict[str, List[str]] = Field(
        default_factory=dict, description="Innovation type -> idea IDs"
    )
    most_innovative: str = Field(
        ..., description="Most innovative idea ID"
    )
    most_feasible: str = Field(
        ..., description="Most feasible idea ID"
    )
    quick_win: str = Field(
        ..., description="Best quick win idea ID"
    )
    synthesis: str = Field(
        ..., description="Overall synthesis of ideation"
    )


@register_task_runner("solution_ideator", TaskRunnerCategory.CREATE)
class SolutionIdeatorRunner(TaskRunner[SolutionIdeatorInput, SolutionIdeatorOutput]):
    """
    Generates diverse solution ideas from problem statements.

    Uses divergent thinking techniques to create a range of
    solution concepts across innovation types.

    Algorithmic approach:
    1. Decompose problem into components
    2. Apply multiple ideation lenses
    3. Generate diverse solution concepts
    4. Evaluate novelty and feasibility
    5. Identify standout ideas
    """

    name = "solution_ideator"
    description = "Generate solution ideas from problems and pain points"
    algorithmic_core = "divergent_ideation"
    category = TaskRunnerCategory.CREATE
    temperature = 0.7
    max_tokens = 4000

    async def execute(self, input_data: SolutionIdeatorInput) -> SolutionIdeatorOutput:
        """Execute solution ideation."""
        prompt = f"""Generate {input_data.num_ideas} solution ideas for the following problem.

PROBLEM: {input_data.problem_statement}

PAIN POINTS TO ADDRESS:
{chr(10).join(input_data.pain_points or ['Not specified'])}

CONSTRAINTS:
{chr(10).join(input_data.constraints or ['None specified'])}

INSPIRATION SOURCES:
{chr(10).join(input_data.inspiration_sources or ['Draw from diverse industries'])}

IDEATION FOCUS: {input_data.ideation_focus}

Generate diverse solution ideas using multiple lenses:
- What would [tech company] do?
- What's the opposite approach?
- What if resources were unlimited?
- What's the minimum viable solution?
- What would delight users?

For each idea provide:
1. Name and description
2. Innovation type (incremental/adjacent/transformational/disruptive)
3. Value proposition
4. Key features
5. User and business benefits
6. Novelty score (0-1)
7. Feasibility estimate
8. Key risks

Then identify:
- Most innovative idea
- Most feasible idea
- Best quick win

Return as JSON matching the SolutionIdeatorOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, SolutionIdeatorOutput)
