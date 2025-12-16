"""
RecommendRunner - Make recommendation using utility maximization.

Algorithmic Core: Utility Maximization
- Calculates expected utility of each option
- Accounts for uncertainty and risk preferences
- Provides ranked recommendations with rationale

Use Cases:
- Final decision recommendation
- Strategy selection
- Investment recommendation
- Partnership selection
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

class RecommendInput(TaskRunnerInput):
    """Input schema for RecommendRunner."""

    analysis: Dict[str, Any] = Field(
        ...,
        description="Prior analysis (from evaluate/tradeoff runners)"
    )
    decision_context: str = Field(
        default="",
        description="Decision context and objectives"
    )
    risk_preference: str = Field(
        default="neutral",
        description="Risk preference: risk_averse | neutral | risk_seeking"
    )
    decision_maker: Optional[str] = Field(
        default=None,
        description="Who is making the decision (for tailored rationale)"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Hard constraints that must be satisfied"
    )


class OptionRecommendation(TaskRunnerOutput):
    """Recommendation details for a single option."""

    option_name: str = Field(default="", description="Option name")
    rank: int = Field(default=0, description="Recommendation rank (1 = best)")
    expected_utility: float = Field(default=0.0, description="Expected utility score")
    recommendation_strength: str = Field(
        default="",
        description="strong | moderate | weak | not_recommended"
    )
    key_reasons: List[str] = Field(default_factory=list, description="Key reasons for rank")
    risks: List[str] = Field(default_factory=list, description="Key risks")
    conditions: List[str] = Field(
        default_factory=list,
        description="Conditions for this to be optimal"
    )


class RecommendOutput(TaskRunnerOutput):
    """Output schema for RecommendRunner."""

    primary_recommendation: str = Field(
        default="",
        description="Primary recommended option"
    )
    recommendation_rationale: str = Field(
        default="",
        description="Detailed rationale for recommendation"
    )
    ranked_options: List[OptionRecommendation] = Field(
        default_factory=list,
        description="All options ranked with details"
    )
    confidence_level: str = Field(
        default="",
        description="Confidence: high | medium | low"
    )
    decision_urgency: str = Field(
        default="",
        description="Urgency: immediate | soon | can_wait"
    )
    key_assumptions: List[str] = Field(
        default_factory=list,
        description="Critical assumptions in recommendation"
    )
    sensitivity_factors: List[str] = Field(
        default_factory=list,
        description="Factors that could change recommendation"
    )
    next_steps: List[str] = Field(
        default_factory=list,
        description="Recommended next steps if adopted"
    )
    alternative_scenarios: List[Dict[str, str]] = Field(
        default_factory=list,
        description="When to choose alternatives"
    )


# =============================================================================
# RecommendRunner Implementation
# =============================================================================

@register_task_runner
class RecommendRunner(TaskRunner[RecommendInput, RecommendOutput]):
    """
    Utility maximization recommendation runner.

    This runner synthesizes prior analysis into a final recommendation,
    optimizing for expected utility given risk preferences.

    Algorithmic Pattern:
        1. Parse prior analysis results
        2. Apply risk preference adjustments
        3. Calculate expected utility per option
        4. Rank options by utility
        5. Generate recommendation rationale
        6. Identify sensitivity factors

    Best Used For:
        - Final decision synthesis
        - Strategy recommendation
        - Investment advice
        - Vendor selection
    """

    runner_id = "recommend"
    name = "Recommend Runner"
    description = "Make recommendation using utility maximization"
    category = TaskRunnerCategory.DECIDE
    algorithmic_core = "utility_maximization"
    max_duration_seconds = 90

    InputType = RecommendInput
    OutputType = RecommendOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize RecommendRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=2500,
        )

    async def execute(self, input: RecommendInput) -> RecommendOutput:
        """
        Execute utility maximization recommendation.

        Args:
            input: Recommendation parameters including analysis and preferences

        Returns:
            RecommendOutput with ranked recommendations
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build context
            analysis_text = self._format_analysis(input.analysis)
            risk_instruction = self._get_risk_instruction(input.risk_preference)

            constraints_text = ""
            if input.constraints:
                constraints_text = f"\nHard constraints:\n" + "\n".join(
                    f"- {c}" for c in input.constraints
                )

            decision_maker_text = ""
            if input.decision_maker:
                decision_maker_text = f"\nDecision maker: {input.decision_maker}"

            system_prompt = f"""You are an expert decision advisor making final recommendations.

Your task is to synthesize analysis into a clear recommendation.

Risk preference: {input.risk_preference}
{risk_instruction}

Recommendation approach:
1. Review all prior analysis
2. Calculate expected utility for each option:
   - Account for benefits, risks, and uncertainties
   - Apply risk preference adjustments
3. Rank options by adjusted utility
4. Formulate primary recommendation with rationale
5. Identify conditions and sensitivities
6. Provide clear next steps

Return a structured JSON response with:
- primary_recommendation: Name of recommended option
- recommendation_rationale: 3-4 sentence detailed rationale
- ranked_options: Array with:
  - option_name: Name
  - rank: 1, 2, 3, etc.
  - expected_utility: 0-100 score
  - recommendation_strength: strong | moderate | weak | not_recommended
  - key_reasons: Top 3 reasons for this rank
  - risks: Key risks for this option
  - conditions: When this option would be optimal
- confidence_level: high | medium | low
- decision_urgency: immediate | soon | can_wait
- key_assumptions: Critical assumptions
- sensitivity_factors: What could change the recommendation
- next_steps: 3-5 concrete next steps
- alternative_scenarios: [{scenario, recommended_option}]"""

            user_prompt = f"""Make a recommendation based on this analysis:
{decision_maker_text}

CONTEXT: {input.decision_context}
{constraints_text}

ANALYSIS:
{analysis_text}

Provide your recommendation in JSON format."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_recommend_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build ranked options
            options_data = result.get("ranked_options", [])
            ranked_options = [
                OptionRecommendation(
                    option_name=o.get("option_name", ""),
                    rank=int(o.get("rank", i+1)),
                    expected_utility=float(o.get("expected_utility", 0)),
                    recommendation_strength=o.get("recommendation_strength", "moderate"),
                    key_reasons=o.get("key_reasons", []),
                    risks=o.get("risks", []),
                    conditions=o.get("conditions", []),
                )
                for i, o in enumerate(options_data)
            ]

            # Sort by rank
            ranked_options.sort(key=lambda x: x.rank)

            confidence_level = result.get("confidence_level", "medium")
            conf_score = {"high": 0.9, "medium": 0.7, "low": 0.5}.get(confidence_level, 0.7)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return RecommendOutput(
                success=True,
                primary_recommendation=result.get("primary_recommendation", ""),
                recommendation_rationale=result.get("recommendation_rationale", ""),
                ranked_options=ranked_options,
                confidence_level=confidence_level,
                decision_urgency=result.get("decision_urgency", "soon"),
                key_assumptions=result.get("key_assumptions", []),
                sensitivity_factors=result.get("sensitivity_factors", []),
                next_steps=result.get("next_steps", []),
                alternative_scenarios=result.get("alternative_scenarios", []),
                confidence_score=conf_score,
                quality_score=conf_score,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"RecommendRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return RecommendOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_analysis(self, analysis: Dict[str, Any]) -> str:
        """Format analysis for prompt."""
        import json
        return json.dumps(analysis, indent=2, default=str)[:4000]

    def _get_risk_instruction(self, risk_pref: str) -> str:
        """Get risk preference instructions."""
        pref_map = {
            "risk_averse": "Prioritize options with lower variance and downside protection. Prefer certainty over potential upside.",
            "neutral": "Balance risk and reward objectively. Weight upside and downside proportionally.",
            "risk_seeking": "Willing to accept higher variance for potential upside. Value high-reward options even with uncertainty.",
        }
        return pref_map.get(risk_pref, pref_map["neutral"])

    def _parse_recommend_response(self, content: str) -> Dict[str, Any]:
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
                "primary_recommendation": "",
                "recommendation_rationale": content[:300],
                "ranked_options": [],
                "confidence_level": "medium",
                "decision_urgency": "soon",
                "key_assumptions": [],
                "sensitivity_factors": [],
                "next_steps": [],
                "alternative_scenarios": [],
            }
