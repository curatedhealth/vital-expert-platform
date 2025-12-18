"""
ProblemReframerRunner - Reframe problems to unlock new solution spaces

This runner takes problem statements and reframes them from multiple
perspectives to challenge assumptions and open new solution possibilities.

Algorithmic Core: perspective_shift_analysis
Temperature: 0.6 (higher creativity for diverse reframings)
"""

from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class ReframedProblem(BaseModel):
    """A reframed version of the original problem."""
    reframe_id: str = Field(..., description="Unique identifier")
    reframe_type: Literal[
        "user_perspective", "stakeholder_perspective", "opposite",
        "analogy", "constraint_removal", "constraint_addition",
        "scope_expansion", "scope_reduction", "time_shift", "resource_shift"
    ] = Field(..., description="Type of reframing applied")
    original_framing: str = Field(..., description="Original problem statement")
    reframed_statement: str = Field(..., description="Reframed problem statement")
    key_shift: str = Field(..., description="What shifted in the reframing")
    assumptions_challenged: List[str] = Field(
        default_factory=list, description="Assumptions this reframing challenges"
    )
    new_solution_spaces: List[str] = Field(
        default_factory=list, description="New solution directions opened"
    )
    potential_value: Literal["low", "medium", "high", "breakthrough"] = Field(
        "medium", description="Potential value of this reframing"
    )


class HowMightWe(BaseModel):
    """How Might We question derived from reframing."""
    hmw_id: str = Field(..., description="Unique identifier")
    question: str = Field(..., description="How Might We question")
    derived_from: str = Field(..., description="Reframe ID this was derived from")
    focus_area: str = Field(..., description="What aspect this HMW focuses on")
    innovation_potential: Literal["incremental", "adjacent", "transformational"] = Field(
        "adjacent", description="Innovation potential level"
    )


class ProblemReframerInput(BaseModel):
    """Input for problem reframing."""
    problem_statement: str = Field(..., description="Original problem statement")
    context: str = Field(..., description="Context surrounding the problem")
    stakeholders: Optional[List[str]] = Field(
        None, description="Stakeholders affected by the problem"
    )
    constraints: Optional[List[str]] = Field(
        None, description="Current constraints on the problem"
    )
    previous_solutions: Optional[List[str]] = Field(
        None, description="Solutions already tried"
    )
    desired_reframe_types: Optional[List[str]] = Field(
        None, description="Specific reframing approaches to use"
    )


class ProblemReframerOutput(BaseModel):
    """Output from problem reframing."""
    original_problem: str = Field(..., description="Original problem statement")
    hidden_assumptions: List[str] = Field(
        default_factory=list, description="Hidden assumptions in original framing"
    )
    reframed_problems: List[ReframedProblem] = Field(
        default_factory=list, description="Reframed problem statements"
    )
    how_might_we_questions: List[HowMightWe] = Field(
        default_factory=list, description="How Might We questions"
    )
    recommended_reframe: str = Field(
        ..., description="Most promising reframe ID"
    )
    recommendation_rationale: str = Field(
        ..., description="Why this reframe is recommended"
    )
    synthesis: str = Field(
        ..., description="Synthesis of insights from reframing exercise"
    )


@register_task_runner("problem_reframer", TaskRunnerCategory.UNDERSTAND)
class ProblemReframerRunner(TaskRunner[ProblemReframerInput, ProblemReframerOutput]):
    """
    Reframes problems to unlock new solution spaces and challenge assumptions.

    Uses multiple perspective-shifting techniques to generate alternative
    problem framings that can lead to breakthrough solutions.

    Algorithmic approach:
    1. Identify hidden assumptions in original framing
    2. Apply multiple reframing techniques
    3. Generate How Might We questions
    4. Evaluate reframings for innovation potential
    5. Recommend most promising reframe
    """

    name = "problem_reframer"
    description = "Reframe problems to challenge assumptions and unlock new solutions"
    algorithmic_core = "perspective_shift_analysis"
    category = TaskRunnerCategory.UNDERSTAND
    temperature = 0.6
    max_tokens = 3500

    async def execute(self, input_data: ProblemReframerInput) -> ProblemReframerOutput:
        """Execute problem reframing analysis."""
        prompt = f"""Reframe the following problem using multiple perspectives.

ORIGINAL PROBLEM: {input_data.problem_statement}

CONTEXT: {input_data.context}

STAKEHOLDERS: {', '.join(input_data.stakeholders or ['Not specified'])}

CURRENT CONSTRAINTS:
{chr(10).join(input_data.constraints or ['None specified'])}

PREVIOUS SOLUTIONS TRIED:
{chr(10).join(input_data.previous_solutions or ['None specified'])}

REFRAMING APPROACHES TO USE:
{', '.join(input_data.desired_reframe_types or ['All available approaches'])}

Perform comprehensive problem reframing:

1. HIDDEN ASSUMPTIONS: What assumptions are baked into the original framing?

2. REFRAMED PROBLEMS: Generate 5-7 reframings using different techniques:
   - User perspective shift
   - Stakeholder perspective shift
   - Opposite framing (what if we wanted the problem?)
   - Analogy (how would [X industry] solve this?)
   - Constraint removal (what if [constraint] didn't exist?)
   - Constraint addition (what if we had to [new constraint]?)
   - Scope expansion/reduction
   - Time shift (past/future perspective)
   - Resource shift (10x more/less resources)

3. HOW MIGHT WE QUESTIONS: Generate actionable HMW questions from each reframe

4. RECOMMENDATION: Which reframe opens the most valuable solution space?

5. SYNTHESIS: Key insights from the reframing exercise

Return as JSON matching the ProblemReframerOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, ProblemReframerOutput)
