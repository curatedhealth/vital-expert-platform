"""
ScoreRunner - Calculate score using weighted aggregation.

Algorithmic Core: Weighted Aggregation
- Calculates composite scores from multiple factors
- Applies configurable weights
- Supports various aggregation methods

Use Cases:
- Lead scoring
- Risk scoring
- Opportunity prioritization
- KOL influence scoring
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

class ScoreInput(TaskRunnerInput):
    """Input schema for ScoreRunner."""

    entity: Dict[str, Any] = Field(
        ...,
        description="Entity to score with its attributes"
    )
    scoring_model: Dict[str, Any] = Field(
        ...,
        description="Scoring model: {factors: [{name, weight, scale, rules}]}"
    )
    aggregation_method: str = Field(
        default="weighted_average",
        description="Method: weighted_average | weighted_sum | geometric_mean | min_of"
    )
    normalize: bool = Field(
        default=True,
        description="Normalize final score to 0-100"
    )


class FactorScore(TaskRunnerOutput):
    """Score for a single factor."""

    factor_name: str = Field(default="", description="Factor name")
    raw_value: Any = Field(default=None, description="Raw value from entity")
    score: float = Field(default=0.0, description="Factor score (on scale)")
    weight: float = Field(default=1.0, description="Factor weight")
    contribution: float = Field(default=0.0, description="Contribution to final score")
    reasoning: str = Field(default="", description="How score was determined")


class ScoreOutput(TaskRunnerOutput):
    """Output schema for ScoreRunner."""

    final_score: float = Field(default=0.0, description="Final aggregated score")
    score_tier: str = Field(default="", description="Tier: high | medium | low")
    factor_scores: List[FactorScore] = Field(
        default_factory=list,
        description="Individual factor scores"
    )
    score_breakdown: Dict[str, float] = Field(
        default_factory=dict,
        description="Quick breakdown {factor: contribution}"
    )
    top_contributors: List[str] = Field(
        default_factory=list,
        description="Top positive contributors"
    )
    score_limiters: List[str] = Field(
        default_factory=list,
        description="Factors limiting the score"
    )
    interpretation: str = Field(default="", description="What the score means")


# =============================================================================
# ScoreRunner Implementation
# =============================================================================

@register_task_runner
class ScoreRunner(TaskRunner[ScoreInput, ScoreOutput]):
    """
    Weighted aggregation scoring runner.

    This runner calculates composite scores from multiple factors
    using configurable weights and aggregation methods.

    Algorithmic Pattern:
        1. Parse entity attributes and scoring model
        2. For each factor, calculate factor score
        3. Apply weights
        4. Aggregate using specified method
        5. Normalize if requested
        6. Determine tier and interpret

    Best Used For:
        - Lead/opportunity scoring
        - Risk assessment
        - Priority ranking
        - Influence measurement
    """

    runner_id = "score"
    name = "Score Runner"
    description = "Calculate score using weighted aggregation"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "weighted_aggregation"
    max_duration_seconds = 90

    InputType = ScoreInput
    OutputType = ScoreOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ScoreRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,
            max_tokens=2000,
        )

    async def execute(self, input: ScoreInput) -> ScoreOutput:
        """
        Execute weighted aggregation scoring.

        Args:
            input: Scoring parameters including entity and model

        Returns:
            ScoreOutput with scores, breakdown, and interpretation
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build scoring context
            entity_text = self._format_entity(input.entity)
            model_text = self._format_scoring_model(input.scoring_model)

            system_prompt = f"""You are an expert scoring analyst applying a weighted scoring model.

Your task is to calculate a composite score for an entity based on defined factors.

SCORING MODEL:
{model_text}

Aggregation method: {input.aggregation_method}
Normalize to 0-100: {input.normalize}

Scoring approach:
1. For each factor in the model:
   - Extract the relevant value from the entity
   - Apply the scoring rules to determine factor score
   - Apply the weight
   - Calculate contribution to final score
2. Aggregate all factor contributions
3. Determine score tier (high/medium/low)
4. Interpret the score in business context

Return a structured JSON response with:
- factor_scores: Array with:
  - factor_name: Name of factor
  - raw_value: Value extracted from entity
  - score: Score on factor scale
  - weight: Factor weight
  - contribution: Weighted contribution
  - reasoning: Brief explanation
- final_score: Aggregated score (0-100 if normalized)
- score_tier: high | medium | low
- score_breakdown: {{factor: contribution}}
- top_contributors: Factors helping the score most
- score_limiters: Factors limiting the score
- interpretation: What this score means for decisions"""

            user_prompt = f"""Score this entity:

{entity_text}

Calculate the composite score and return structured JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_score_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build factor scores
            factors_data = result.get("factor_scores", [])
            factor_scores = [
                FactorScore(
                    factor_name=f.get("factor_name", ""),
                    raw_value=f.get("raw_value"),
                    score=float(f.get("score", 0)),
                    weight=float(f.get("weight", 1.0)),
                    contribution=float(f.get("contribution", 0)),
                    reasoning=f.get("reasoning", ""),
                )
                for f in factors_data
            ]

            final_score = float(result.get("final_score", 0))
            score_tier = result.get("score_tier", self._determine_tier(final_score))

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ScoreOutput(
                success=True,
                final_score=round(final_score, 2),
                score_tier=score_tier,
                factor_scores=factor_scores,
                score_breakdown=result.get("score_breakdown", {}),
                top_contributors=result.get("top_contributors", []),
                score_limiters=result.get("score_limiters", []),
                interpretation=result.get("interpretation", ""),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ScoreRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ScoreOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_entity(self, entity: Dict[str, Any]) -> str:
        """Format entity for prompt."""
        lines = []
        name = entity.get("name", "Entity")
        lines.append(f"**{name}**")

        for key, value in entity.items():
            if key != "name":
                if isinstance(value, dict):
                    lines.append(f"  {key}:")
                    for k, v in value.items():
                        lines.append(f"    - {k}: {v}")
                elif isinstance(value, list):
                    lines.append(f"  {key}: {', '.join(str(v) for v in value[:5])}")
                else:
                    lines.append(f"  {key}: {value}")

        return "\n".join(lines)

    def _format_scoring_model(self, model: Dict[str, Any]) -> str:
        """Format scoring model for prompt."""
        lines = []
        factors = model.get("factors", [])

        for f in factors:
            name = f.get("name", "Factor")
            weight = f.get("weight", 1.0)
            scale = f.get("scale", "0-10")
            lines.append(f"**{name}** (Weight: {weight}, Scale: {scale})")

            rules = f.get("rules", {})
            if rules:
                for condition, score in rules.items():
                    lines.append(f"  - {condition}: {score}")
            lines.append("")

        return "\n".join(lines) or "No specific scoring model provided"

    def _determine_tier(self, score: float) -> str:
        """Determine score tier from numeric score."""
        if score >= 70:
            return "high"
        elif score >= 40:
            return "medium"
        else:
            return "low"

    def _parse_score_response(self, content: str) -> Dict[str, Any]:
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
                "factor_scores": [],
                "final_score": 50,
                "score_tier": "medium",
                "score_breakdown": {},
                "top_contributors": [],
                "score_limiters": [],
                "interpretation": content[:200],
            }
