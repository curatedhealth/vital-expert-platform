"""
CompareRunner - Side-by-side comparison using pairwise analysis.

Algorithmic Core: Pairwise Comparison
- Compares multiple entities across defined criteria
- Creates comparison matrix with relative rankings
- Identifies differentiators and similarities

Use Cases:
- Competitive product comparison
- Vendor evaluation
- Treatment option comparison
- Strategy alternative analysis
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

class CompareInput(TaskRunnerInput):
    """Input schema for CompareRunner."""

    entities: List[Dict[str, Any]] = Field(
        ...,
        description="Entities to compare [{name, description, attributes}]"
    )
    criteria: List[str] = Field(
        ...,
        description="Criteria for comparison"
    )
    comparison_type: str = Field(
        default="relative",
        description="Comparison type: relative | absolute | ranked"
    )
    context: Optional[str] = Field(
        default=None,
        description="Context for comparison (e.g., 'for enterprise deployment')"
    )


class CriterionComparison(TaskRunnerOutput):
    """Comparison results for a single criterion."""

    criterion: str = Field(default="", description="Criterion name")
    rankings: Dict[str, int] = Field(
        default_factory=dict,
        description="Entity rankings {entity_name: rank}"
    )
    scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Entity scores {entity_name: score 0-10}"
    )
    winner: str = Field(default="", description="Best entity for this criterion")
    analysis: str = Field(default="", description="Analysis of differences")
    key_differentiators: List[str] = Field(
        default_factory=list,
        description="Key differences between entities"
    )


class CompareOutput(TaskRunnerOutput):
    """Output schema for CompareRunner."""

    comparison_matrix: Dict[str, Dict[str, float]] = Field(
        default_factory=dict,
        description="Matrix: {entity: {criterion: score}}"
    )
    criterion_comparisons: List[CriterionComparison] = Field(
        default_factory=list,
        description="Detailed comparison per criterion"
    )
    overall_rankings: Dict[str, int] = Field(
        default_factory=dict,
        description="Overall entity rankings"
    )
    overall_scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Overall entity scores"
    )
    recommended: str = Field(default="", description="Recommended entity")
    recommendation_rationale: str = Field(default="", description="Why recommended")
    similarities: List[str] = Field(
        default_factory=list,
        description="Key similarities across entities"
    )
    differentiators: List[str] = Field(
        default_factory=list,
        description="Key differentiators"
    )


# =============================================================================
# CompareRunner Implementation
# =============================================================================

@register_task_runner
class CompareRunner(TaskRunner[CompareInput, CompareOutput]):
    """
    Pairwise comparison runner.

    This runner compares multiple entities side-by-side across
    defined criteria, producing rankings and differentiator analysis.

    Algorithmic Pattern:
        1. Parse entities and criteria
        2. For each criterion, evaluate all entities
        3. Rank entities within each criterion
        4. Build comparison matrix
        5. Calculate overall rankings
        6. Identify similarities and differentiators

    Best Used For:
        - Competitive analysis
        - Vendor selection
        - Option evaluation
        - Decision support
    """

    runner_id = "compare"
    name = "Compare Runner"
    description = "Side-by-side comparison using pairwise analysis"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "pairwise_comparison"
    max_duration_seconds = 120

    InputType = CompareInput
    OutputType = CompareOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize CompareRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: CompareInput) -> CompareOutput:
        """
        Execute pairwise comparison.

        Args:
            input: Comparison parameters including entities and criteria

        Returns:
            CompareOutput with matrix, rankings, and analysis
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build entities description
            entities_text = self._format_entities(input.entities)
            criteria_text = "\n".join(f"- {c}" for c in input.criteria)

            context_section = ""
            if input.context:
                context_section = f"\nComparison context: {input.context}"

            type_instruction = self._get_type_instruction(input.comparison_type)

            system_prompt = f"""You are an expert analyst performing comparative evaluation.

Your task is to compare multiple entities across defined criteria.

{type_instruction}
{context_section}

CRITERIA FOR COMPARISON:
{criteria_text}

Comparison approach:
1. For each criterion:
   - Evaluate each entity on a 0-10 scale
   - Rank entities (1 = best)
   - Identify key differentiators
   - Note the winner
2. Calculate overall scores (average across criteria)
3. Determine overall rankings
4. Identify similarities and key differentiators
5. Make a recommendation with rationale

Return a structured JSON response with:
- comparison_matrix: {{entity_name: {{criterion: score}}}}
- criterion_comparisons: Array with:
  - criterion: Criterion name
  - rankings: {{entity_name: rank}}
  - scores: {{entity_name: score}}
  - winner: Best entity name
  - analysis: 1-2 sentence analysis
  - key_differentiators: List of differences
- overall_rankings: {{entity_name: rank}}
- overall_scores: {{entity_name: average_score}}
- recommended: Best overall entity name
- recommendation_rationale: Why this entity is recommended
- similarities: Common strengths/features
- differentiators: Key distinguishing factors"""

            user_prompt = f"""Compare these entities:

{entities_text}

Perform a comprehensive comparison and return structured JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_compare_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build criterion comparisons
            comparisons_data = result.get("criterion_comparisons", [])
            criterion_comparisons = [
                CriterionComparison(
                    criterion=c.get("criterion", ""),
                    rankings=c.get("rankings", {}),
                    scores=c.get("scores", {}),
                    winner=c.get("winner", ""),
                    analysis=c.get("analysis", ""),
                    key_differentiators=c.get("key_differentiators", []),
                )
                for c in comparisons_data
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return CompareOutput(
                success=True,
                comparison_matrix=result.get("comparison_matrix", {}),
                criterion_comparisons=criterion_comparisons,
                overall_rankings=result.get("overall_rankings", {}),
                overall_scores=result.get("overall_scores", {}),
                recommended=result.get("recommended", ""),
                recommendation_rationale=result.get("recommendation_rationale", ""),
                similarities=result.get("similarities", []),
                differentiators=result.get("differentiators", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"CompareRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return CompareOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_entities(self, entities: List[Dict[str, Any]]) -> str:
        """Format entities for prompt."""
        lines = []
        for i, entity in enumerate(entities):
            name = entity.get("name", f"Entity {i+1}")
            desc = entity.get("description", "")
            lines.append(f"**{name}**")
            if desc:
                lines.append(f"  Description: {desc}")

            attrs = entity.get("attributes", {})
            if attrs:
                for key, value in attrs.items():
                    lines.append(f"  - {key}: {value}")
            lines.append("")

        return "\n".join(lines)

    def _get_type_instruction(self, comparison_type: str) -> str:
        """Get comparison type instructions."""
        type_map = {
            "relative": "Compare entities relative to each other. Focus on how they differ.",
            "absolute": "Evaluate each entity against absolute standards. Score independently.",
            "ranked": "Focus on rankings. Determine clear winners for each criterion.",
        }
        return type_map.get(comparison_type, type_map["relative"])

    def _parse_compare_response(self, content: str) -> Dict[str, Any]:
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
                "comparison_matrix": {},
                "criterion_comparisons": [],
                "overall_rankings": {},
                "overall_scores": {},
                "recommended": "",
                "recommendation_rationale": content[:300],
                "similarities": [],
                "differentiators": [],
            }
