"""
FeasibilityCheckerRunner - Check concept/solution feasibility

This runner performs quick feasibility checks on concepts
to filter before detailed assessment.

Algorithmic Core: feasibility_screening
Temperature: 0.2 (analytical precision)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class FeasibilityCheck(BaseModel):
    """Individual feasibility check."""
    check_id: str = Field(..., description="Unique identifier")
    check_name: str = Field(..., description="Check name")
    check_dimension: Literal[
        "technical", "financial", "market", "operational",
        "regulatory", "organizational", "timeline"
    ] = Field(..., description="Dimension checked")
    status: Literal["pass", "warning", "fail", "unknown"] = Field(
        ..., description="Check result"
    )
    details: str = Field(..., description="Check details")
    blockers: List[str] = Field(default_factory=list)
    mitigations: List[str] = Field(default_factory=list)


class FeasibilityCheckerInput(BaseModel):
    """Input for feasibility checking."""
    concept_description: str = Field(..., description="Concept to check")
    key_requirements: Optional[List[str]] = Field(
        None, description="Key requirements"
    )
    known_constraints: Optional[List[str]] = Field(
        None, description="Known constraints"
    )
    dimensions_to_check: Optional[List[str]] = Field(
        None, description="Specific dimensions to check"
    )
    quick_check: bool = Field(
        default=True, description="Quick screening vs detailed"
    )


class FeasibilityCheckerOutput(BaseModel):
    """Output from feasibility checking."""
    concept_name: str = Field(..., description="Concept checked")
    overall_feasibility: Literal[
        "feasible", "conditionally_feasible", "not_feasible", "needs_investigation"
    ] = Field(..., description="Overall result")
    feasibility_score: float = Field(
        default=0.0, ge=0.0, le=10.0, description="Score 0-10"
    )
    checks: List[FeasibilityCheck] = Field(default_factory=list)
    passing_checks: int = Field(default=0)
    warning_checks: int = Field(default=0)
    failing_checks: int = Field(default=0)
    critical_blockers: List[str] = Field(default_factory=list)
    key_assumptions: List[str] = Field(default_factory=list)
    recommendation: str = Field(..., description="Proceed/investigate/abandon")
    next_steps: List[str] = Field(default_factory=list)


@register_task_runner
class FeasibilityCheckerRunner(TaskRunner[FeasibilityCheckerInput, FeasibilityCheckerOutput]):
    """
    Performs quick feasibility checks on concepts.

    Screens concepts across key dimensions to identify
    blockers and inform go/no-go decisions.
    """

    runner_id = "feasibility_checker"
    name = "Feasibility Checker Runner"
    description = "Check concept feasibility across dimensions"
    algorithmic_core = "feasibility_screening"
    category = TaskRunnerCategory.VALIDATE
    temperature = 0.2
    max_tokens = 3000

    async def execute(self, input_data: FeasibilityCheckerInput) -> FeasibilityCheckerOutput:
        """Execute feasibility checking."""
        prompt = f"""Check feasibility of the following concept.

CONCEPT: {input_data.concept_description}

KEY REQUIREMENTS:
{chr(10).join(input_data.key_requirements or ['Derive from concept'])}

KNOWN CONSTRAINTS:
{chr(10).join(input_data.known_constraints or ['None specified'])}

DIMENSIONS TO CHECK: {', '.join(input_data.dimensions_to_check or ['All dimensions'])}

CHECK TYPE: {'Quick screening' if input_data.quick_check else 'Detailed assessment'}

Perform feasibility checks:

1. CHECK EACH DIMENSION:
   - Technical: Can we build it?
   - Financial: Can we afford it?
   - Market: Is there demand?
   - Operational: Can we deliver it?
   - Regulatory: Does it comply?
   - Organizational: Do we have capabilities?
   - Timeline: Can we deliver in time?

2. For each check:
   - Status: pass/warning/fail/unknown
   - Details
   - Blockers (if any)
   - Mitigations (if any)

3. OVERALL ASSESSMENT:
   - Feasibility: feasible/conditionally_feasible/not_feasible/needs_investigation
   - Score (0-10)
   - Counts: passing/warning/failing

4. CRITICAL BLOCKERS

5. KEY ASSUMPTIONS

6. RECOMMENDATION and NEXT STEPS

Return as JSON matching the FeasibilityCheckerOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, FeasibilityCheckerOutput)
