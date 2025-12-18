"""
VerifyRunner - Test improvement using A/B comparison.

Algorithmic Core: A/B Comparison (Reflexion Step 4)
- Compares original vs variant
- Validates improvement claims
- Quantifies delta across dimensions

Use Cases:
- Improvement validation
- Variant testing
- Before/after analysis
- Quality assurance
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


# =============================================================================
# Input/Output Schemas
# =============================================================================

class VerifyInput(TaskRunnerInput):
    """Input schema for VerifyRunner."""

    original: str = Field(
        ...,
        description="Original artifact"
    )
    variant: str = Field(
        ...,
        description="Improved variant"
    )
    evaluation_dimensions: List[str] = Field(
        default_factory=lambda: ["clarity", "accuracy", "completeness", "effectiveness"],
        description="Dimensions to compare"
    )
    expected_improvements: List[str] = Field(
        default_factory=list,
        description="Expected improvement areas"
    )
    verification_strictness: str = Field(
        default="standard",
        description="Strictness: lenient | standard | strict"
    )


class DimensionComparison(TaskRunnerOutput):
    """Comparison on a single dimension."""

    dimension: str = Field(default="", description="Dimension name")
    original_score: float = Field(default=0.0, description="Original score 0-100")
    variant_score: float = Field(default=0.0, description="Variant score 0-100")
    delta: float = Field(default=0.0, description="Improvement (+) or regression (-)")
    is_improved: bool = Field(default=False, description="Variant better?")
    is_regressed: bool = Field(default=False, description="Variant worse?")
    assessment: str = Field(default="", description="Detailed assessment")


class VerifyOutput(TaskRunnerOutput):
    """Output schema for VerifyRunner."""

    dimension_comparisons: List[DimensionComparison] = Field(
        default_factory=list,
        description="Per-dimension comparison"
    )
    original_overall_score: float = Field(default=0.0, description="Original overall 0-100")
    variant_overall_score: float = Field(default=0.0, description="Variant overall 0-100")
    overall_delta: float = Field(default=0.0, description="Overall improvement")
    is_improvement: bool = Field(default=False, description="Variant is better overall")
    improvement_confidence: float = Field(
        default=0.0,
        description="Confidence that improvement is real"
    )
    regressions_detected: List[str] = Field(
        default_factory=list,
        description="Dimensions where variant is worse"
    )
    improvements_detected: List[str] = Field(
        default_factory=list,
        description="Dimensions where variant is better"
    )
    verification_verdict: str = Field(
        default="",
        description="accept | reject | conditional"
    )
    verdict_rationale: str = Field(default="", description="Why this verdict")
    recommendations: List[str] = Field(
        default_factory=list,
        description="Next steps based on comparison"
    )


# =============================================================================
# VerifyRunner Implementation
# =============================================================================

@register_task_runner
class VerifyRunner(TaskRunner[VerifyInput, VerifyOutput]):
    """
    A/B comparison verification runner.

    This runner compares original and variant to verify
    that the mutation actually improved the artifact.

    Algorithmic Pattern (Reflexion Step 4):
        1. Score original on each dimension
        2. Score variant on each dimension
        3. Calculate deltas
        4. Identify improvements and regressions
        5. Determine overall verdict
        6. Recommend acceptance/rejection

    Best Used For:
        - Mutation validation
        - Quality assurance
        - A/B testing
        - Improvement verification
    """

    runner_id = "verify"
    name = "Verify Runner"
    description = "Test improvement using A/B comparison"
    category = TaskRunnerCategory.REFINE
    algorithmic_core = "ab_comparison"
    max_duration_seconds = 120

    InputType = VerifyInput
    OutputType = VerifyOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize VerifyRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Precision for evaluation
            max_tokens=3000,
        )

    async def execute(self, input: VerifyInput) -> VerifyOutput:
        """
        Execute A/B comparison.

        Args:
            input: Verification parameters

        Returns:
            VerifyOutput with comparison results
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            dimensions_text = ", ".join(input.evaluation_dimensions)

            expected_text = ""
            if input.expected_improvements:
                expected_text = "\nExpected improvements: " + ", ".join(input.expected_improvements)

            strictness_instruction = self._get_strictness_instruction(input.verification_strictness)

            system_prompt = f"""You are an expert at A/B comparison for quality verification.

Your task is to compare original vs variant to verify improvement.

Evaluation dimensions: {dimensions_text}
{strictness_instruction}

A/B comparison approach (Reflexion Loop):
1. For each dimension:
   - Score original (0-100)
   - Score variant (0-100)
   - Calculate delta
   - Assess whether change is real improvement
2. Identify:
   - Dimensions with clear improvement
   - Dimensions with regression
   - Dimensions unchanged
3. Calculate overall scores
4. Determine verdict:
   - accept: Variant is clearly better
   - reject: Variant is worse or not improved
   - conditional: Mixed results, needs review
5. Confidence based on:
   - Magnitude of improvement
   - Consistency across dimensions
   - Absence of regressions

Return a structured JSON response with:
- dimension_comparisons: Array with:
  - dimension: Name
  - original_score: 0-100
  - variant_score: 0-100
  - delta: Difference (positive = improvement)
  - is_improved: boolean
  - is_regressed: boolean
  - assessment: Detailed assessment
- original_overall_score: Weighted average 0-100
- variant_overall_score: Weighted average 0-100
- overall_delta: Overall improvement
- is_improvement: boolean
- improvement_confidence: 0-1
- regressions_detected: List of dimension names
- improvements_detected: List of dimension names
- verification_verdict: accept | reject | conditional
- verdict_rationale: Why this verdict
- recommendations: Next steps"""

            user_prompt = f"""Compare these versions:

ORIGINAL:
{input.original[:2000]}

VARIANT:
{input.variant[:2000]}
{expected_text}

Perform A/B comparison and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_verify_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build comparisons
            comp_data = result.get("dimension_comparisons", [])
            comparisons = [
                DimensionComparison(
                    dimension=c.get("dimension", ""),
                    original_score=float(c.get("original_score", 70)),
                    variant_score=float(c.get("variant_score", 75)),
                    delta=float(c.get("delta", 5)),
                    is_improved=c.get("is_improved", False),
                    is_regressed=c.get("is_regressed", False),
                    assessment=c.get("assessment", ""),
                )
                for c in comp_data
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return VerifyOutput(
                success=True,
                dimension_comparisons=comparisons,
                original_overall_score=float(result.get("original_overall_score", 70)),
                variant_overall_score=float(result.get("variant_overall_score", 75)),
                overall_delta=float(result.get("overall_delta", 5)),
                is_improvement=result.get("is_improvement", False),
                improvement_confidence=float(result.get("improvement_confidence", 0.7)),
                regressions_detected=result.get("regressions_detected", []),
                improvements_detected=result.get("improvements_detected", []),
                verification_verdict=result.get("verification_verdict", "conditional"),
                verdict_rationale=result.get("verdict_rationale", ""),
                recommendations=result.get("recommendations", []),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"VerifyRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return VerifyOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_strictness_instruction(self, strictness: str) -> str:
        """Get strictness instruction."""
        instructions = {
            "lenient": "Lenient: Accept improvements if net positive, tolerate minor regressions.",
            "standard": "Standard: Accept if clear improvement, flag significant regressions.",
            "strict": "Strict: Require improvement in all dimensions, reject any regression.",
        }
        return instructions.get(strictness, instructions["standard"])

    def _parse_verify_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "dimension_comparisons": [],
                "original_overall_score": 0,
                "variant_overall_score": 0,
                "overall_delta": 0,
                "is_improvement": False,
                "improvement_confidence": 0,
                "regressions_detected": [],
                "improvements_detected": [],
                "verification_verdict": "reject",
                "verdict_rationale": "Failed to parse response",
                "recommendations": [],
            }
