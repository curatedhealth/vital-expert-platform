"""
SelectRunner - Choose best using fitness selection.

Algorithmic Core: Fitness Selection (Reflexion Step 4/5)
- Evaluates multiple variants against criteria
- Applies fitness function for selection
- Supports tournament and ranked selection

Use Cases:
- Best variant selection
- Multi-candidate ranking
- Optimization convergence
- Iterative refinement termination
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

class VariantCandidate(TaskRunnerOutput):
    """A candidate variant for selection."""

    variant_id: str = Field(default="", description="Variant identifier")
    content: str = Field(default="", description="Variant content")
    source: str = Field(default="", description="How this variant was created")
    claimed_improvements: List[str] = Field(
        default_factory=list,
        description="Claimed improvements"
    )


class SelectInput(TaskRunnerInput):
    """Input schema for SelectRunner."""

    variants: List[Dict[str, Any]] = Field(
        ...,
        description="Candidate variants [{variant_id, content, source, claimed_improvements}]"
    )
    selection_criteria: List[str] = Field(
        default_factory=lambda: ["overall_quality", "improvement_magnitude", "risk_of_regression"],
        description="Criteria for selection"
    )
    selection_method: str = Field(
        default="ranked",
        description="Method: ranked | tournament | threshold | weighted"
    )
    original_artifact: Optional[str] = Field(
        default=None,
        description="Original artifact for reference"
    )
    termination_threshold: float = Field(
        default=90.0,
        description="Score threshold for 'good enough'"
    )
    weights: Dict[str, float] = Field(
        default_factory=dict,
        description="Weights for criteria (if weighted method)"
    )


class VariantEvaluation(TaskRunnerOutput):
    """Evaluation of a single variant."""

    variant_id: str = Field(default="", description="Variant ID")
    fitness_score: float = Field(default=0.0, description="Fitness score 0-100")
    criterion_scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Score per criterion"
    )
    rank: int = Field(default=0, description="Rank among variants")
    is_improvement_over_original: bool = Field(default=False, description="Better than original")
    strengths: List[str] = Field(default_factory=list, description="Variant strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Variant weaknesses")
    recommendation: str = Field(
        default="",
        description="adopt | consider | reject"
    )


class SelectOutput(TaskRunnerOutput):
    """Output schema for SelectRunner."""

    evaluations: List[VariantEvaluation] = Field(
        default_factory=list,
        description="All variant evaluations"
    )
    selected_variant_id: str = Field(default="", description="Best variant ID")
    selected_variant: Optional[str] = Field(
        default=None,
        description="Content of selected variant"
    )
    selection_rationale: str = Field(default="", description="Why this was selected")
    rankings: List[str] = Field(
        default_factory=list,
        description="Variant IDs in rank order"
    )
    meets_threshold: bool = Field(
        default=False,
        description="Best meets termination threshold"
    )
    should_continue_refinement: bool = Field(
        default=False,
        description="Whether more iterations needed"
    )
    convergence_status: str = Field(
        default="",
        description="converged | improving | plateaued | diverging"
    )
    selection_summary: str = Field(default="", description="Summary of selection")


# =============================================================================
# SelectRunner Implementation
# =============================================================================

@register_task_runner
class SelectRunner(TaskRunner[SelectInput, SelectOutput]):
    """
    Fitness selection runner.

    This runner evaluates multiple variants and selects the best
    based on fitness criteria.

    Algorithmic Pattern (Reflexion Step 4/5):
        1. Evaluate each variant against criteria
        2. Calculate fitness scores
        3. Apply selection method:
           - ranked: Select highest score
           - tournament: Pairwise comparisons
           - threshold: First to meet threshold
           - weighted: Weighted criteria sum
        4. Determine convergence status
        5. Recommend continuation or termination

    Best Used For:
        - Multi-variant selection
        - Optimization termination
        - Best-of-N selection
        - Iterative refinement
    """

    runner_id = "select"
    name = "Select Runner"
    description = "Choose best using fitness selection"
    category = TaskRunnerCategory.REFINE
    algorithmic_core = "fitness_selection"
    max_duration_seconds = 120

    InputType = SelectInput
    OutputType = SelectOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize SelectRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Precision for selection
            max_tokens=3500,
        )

    async def execute(self, input: SelectInput) -> SelectOutput:
        """
        Execute fitness selection.

        Args:
            input: Selection parameters

        Returns:
            SelectOutput with selected variant
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            variants_text = json.dumps(input.variants, indent=2, default=str)[:3000]

            criteria_text = ", ".join(input.selection_criteria)

            original_text = ""
            if input.original_artifact:
                original_text = f"\nOriginal artifact for reference:\n{input.original_artifact[:500]}..."

            weights_text = ""
            if input.weights:
                weights_text = f"\nCriteria weights: {json.dumps(input.weights)}"

            method_instruction = self._get_method_instruction(input.selection_method)

            system_prompt = f"""You are an expert at fitness-based variant selection.

Your task is to evaluate variants and select the best one.

Selection criteria: {criteria_text}
Selection method: {input.selection_method}
{method_instruction}
Termination threshold: {input.termination_threshold}/100

Fitness selection approach:
1. For each variant:
   - Score on each criterion (0-100)
   - Calculate fitness score
   - Compare to original if provided
   - Identify strengths/weaknesses
2. Apply selection method
3. Rank all variants
4. Determine:
   - Best variant
   - Whether threshold is met
   - Convergence status
5. Convergence status:
   - converged: Best meets threshold
   - improving: Better than previous
   - plateaued: No significant improvement
   - diverging: Getting worse

Return a structured JSON response with:
- evaluations: Array with:
  - variant_id: Variant ID
  - fitness_score: 0-100
  - criterion_scores: {{criterion: score}}
  - rank: 1, 2, 3...
  - is_improvement_over_original: boolean
  - strengths: List
  - weaknesses: List
  - recommendation: adopt | consider | reject
- selected_variant_id: Best variant ID
- selection_rationale: Why selected
- rankings: Variant IDs in rank order
- meets_threshold: boolean
- should_continue_refinement: boolean
- convergence_status: converged | improving | plateaued | diverging
- selection_summary: 2-3 sentence summary"""

            user_prompt = f"""Select the best variant:

VARIANTS:
{variants_text}
{original_text}
{weights_text}

Evaluate and select, return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_select_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build evaluations
            eval_data = result.get("evaluations", [])
            evaluations = [
                VariantEvaluation(
                    variant_id=e.get("variant_id", ""),
                    fitness_score=float(e.get("fitness_score", 70)),
                    criterion_scores=e.get("criterion_scores", {}),
                    rank=int(e.get("rank", 0)),
                    is_improvement_over_original=e.get("is_improvement_over_original", False),
                    strengths=e.get("strengths", []),
                    weaknesses=e.get("weaknesses", []),
                    recommendation=e.get("recommendation", "consider"),
                )
                for e in eval_data
            ]

            # Find selected variant content
            selected_id = result.get("selected_variant_id", "")
            selected_content = None
            for v in input.variants:
                if v.get("variant_id") == selected_id:
                    selected_content = v.get("content")
                    break

            duration = (datetime.utcnow() - start_time).total_seconds()

            return SelectOutput(
                success=True,
                evaluations=evaluations,
                selected_variant_id=selected_id,
                selected_variant=selected_content,
                selection_rationale=result.get("selection_rationale", ""),
                rankings=result.get("rankings", []),
                meets_threshold=result.get("meets_threshold", False),
                should_continue_refinement=result.get("should_continue_refinement", True),
                convergence_status=result.get("convergence_status", "improving"),
                selection_summary=result.get("selection_summary", ""),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"SelectRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return SelectOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_method_instruction(self, method: str) -> str:
        """Get method instruction."""
        instructions = {
            "ranked": "Ranked: Score all, select highest fitness score.",
            "tournament": "Tournament: Pairwise comparisons, winner advances.",
            "threshold": "Threshold: Select first that meets threshold.",
            "weighted": "Weighted: Apply weights to criteria, sum for fitness.",
        }
        return instructions.get(method, instructions["ranked"])

    def _parse_select_response(self, content: str) -> Dict[str, Any]:
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
                "evaluations": [],
                "selected_variant_id": "",
                "selection_rationale": "Failed to parse response",
                "rankings": [],
                "meets_threshold": False,
                "should_continue_refinement": True,
                "convergence_status": "unknown",
                "selection_summary": content[:200],
            }
