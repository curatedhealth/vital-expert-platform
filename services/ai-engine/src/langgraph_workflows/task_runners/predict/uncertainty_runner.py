"""
UncertaintyRunner - Quantify uncertainty using confidence estimation.

Algorithmic Core: Confidence Estimation / Uncertainty Quantification
- Calculates confidence intervals
- Identifies sources of uncertainty
- Quantifies prediction reliability

Use Cases:
- Forecast reliability assessment
- Risk quantification
- Decision confidence
- Model validation
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

class UncertaintyInput(TaskRunnerInput):
    """Input schema for UncertaintyRunner."""

    projection: Dict[str, Any] = Field(
        ...,
        description="Projection to assess uncertainty for"
    )
    uncertainty_sources: List[str] = Field(
        default_factory=list,
        description="Known sources of uncertainty"
    )
    confidence_levels: List[float] = Field(
        default_factory=lambda: [0.50, 0.80, 0.95],
        description="Confidence levels to calculate (0-1)"
    )
    assessment_focus: str = Field(
        default="comprehensive",
        description="Focus: data | model | external | comprehensive"
    )


class UncertaintySource(TaskRunnerOutput):
    """A source of uncertainty."""

    source_id: str = Field(default="", description="Source ID")
    source_name: str = Field(default="", description="Source name")
    source_type: str = Field(
        default="data",
        description="data | model | parameter | external | structural"
    )
    impact_magnitude: str = Field(
        default="medium",
        description="low | medium | high | critical"
    )
    reducibility: str = Field(
        default="partially",
        description="fully | partially | not_reducible"
    )
    mitigation_options: List[str] = Field(
        default_factory=list,
        description="How to reduce uncertainty"
    )
    contribution_pct: float = Field(
        default=0,
        description="Contribution to total uncertainty (%)"
    )


class ConfidenceInterval(TaskRunnerOutput):
    """A confidence interval."""

    confidence_level: float = Field(default=0.95, description="Confidence level")
    lower_bound: float = Field(default=0, description="Lower bound")
    upper_bound: float = Field(default=0, description="Upper bound")
    interval_width: float = Field(default=0, description="Width of interval")
    interpretation: str = Field(default="", description="Plain language interpretation")


class UncertaintyOutput(TaskRunnerOutput):
    """Output schema for UncertaintyRunner."""

    uncertainty_sources: List[UncertaintySource] = Field(
        default_factory=list,
        description="Sources of uncertainty"
    )
    confidence_intervals: List[ConfidenceInterval] = Field(
        default_factory=list,
        description="Confidence intervals"
    )
    overall_uncertainty: str = Field(
        default="medium",
        description="low | medium | high | very_high"
    )
    uncertainty_score: float = Field(
        default=0,
        description="Uncertainty score 0-100 (higher = more uncertain)"
    )
    prediction_reliability: str = Field(
        default="moderate",
        description="low | moderate | high"
    )
    dominant_uncertainties: List[str] = Field(
        default_factory=list,
        description="Top uncertainty sources"
    )
    reducible_uncertainty_pct: float = Field(
        default=0,
        description="Percentage that could be reduced"
    )
    irreducible_uncertainty_pct: float = Field(
        default=0,
        description="Percentage that's inherent"
    )
    uncertainty_summary: str = Field(default="", description="Summary")
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations to reduce uncertainty"
    )


# =============================================================================
# UncertaintyRunner Implementation
# =============================================================================

@register_task_runner
class UncertaintyRunner(TaskRunner[UncertaintyInput, UncertaintyOutput]):
    """
    Confidence estimation uncertainty quantification runner.

    This runner quantifies uncertainty in projections
    and identifies its sources.

    Algorithmic Pattern:
        1. Parse projection and sources
        2. Identify uncertainty sources:
           - Data uncertainty (quality, completeness)
           - Model uncertainty (assumptions, structure)
           - Parameter uncertainty (estimates)
           - External uncertainty (environment)
        3. Calculate confidence intervals
        4. Estimate contribution of each source
        5. Classify reducibility
        6. Recommend mitigations

    Best Used For:
        - Forecast validation
        - Risk quantification
        - Decision confidence
        - Model assessment
    """

    runner_id = "uncertainty"
    name = "Uncertainty Runner"
    description = "Quantify uncertainty using confidence estimation"
    category = TaskRunnerCategory.PREDICT
    algorithmic_core = "confidence_estimation"
    max_duration_seconds = 120

    InputType = UncertaintyInput
    OutputType = UncertaintyOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize UncertaintyRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3500,
        )

    async def execute(self, input: UncertaintyInput) -> UncertaintyOutput:
        """
        Execute uncertainty quantification.

        Args:
            input: Uncertainty parameters

        Returns:
            UncertaintyOutput with uncertainty analysis
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            projection_text = json.dumps(input.projection, indent=2, default=str)[:2500]

            sources_text = ""
            if input.uncertainty_sources:
                sources_text = "\nKnown uncertainty sources:\n" + "\n".join(
                    f"- {s}" for s in input.uncertainty_sources
                )

            levels_text = ", ".join([f"{int(l*100)}%" for l in input.confidence_levels])
            focus_instruction = self._get_focus_instruction(input.assessment_focus)

            system_prompt = f"""You are an expert at uncertainty quantification and confidence estimation.

Your task is to quantify uncertainty in a projection.

Confidence levels to calculate: {levels_text}
Assessment focus: {input.assessment_focus}
{focus_instruction}

Uncertainty quantification approach:
1. Identify uncertainty sources:
   - data: Data quality, completeness, representativeness
   - model: Assumptions, structure, simplifications
   - parameter: Estimated values, ranges
   - external: Environment, competition, regulation
   - structural: Fundamental unknowns
2. For each source:
   - Assess impact magnitude
   - Determine reducibility
   - Estimate contribution to total (sum to 100%)
   - Suggest mitigations
3. Calculate confidence intervals:
   - For each level (e.g., 80%, 95%)
   - Lower and upper bounds
   - Plain language interpretation
4. Classify overall uncertainty:
   - low: High confidence, narrow intervals
   - medium: Moderate confidence
   - high: Wide intervals, many unknowns
   - very_high: Highly speculative
5. Assess prediction reliability

Return a structured JSON response with:
- uncertainty_sources: Array with:
  - source_id: U1, U2, etc.
  - source_name: Name
  - source_type: data | model | parameter | external | structural
  - impact_magnitude: low | medium | high | critical
  - reducibility: fully | partially | not_reducible
  - mitigation_options: How to reduce
  - contribution_pct: Contribution to total (sum to 100)
- confidence_intervals: Array with:
  - confidence_level: 0.80, 0.95, etc.
  - lower_bound: Lower value
  - upper_bound: Upper value
  - interval_width: upper - lower
  - interpretation: Plain language
- overall_uncertainty: low | medium | high | very_high
- uncertainty_score: 0-100 (higher = more uncertain)
- prediction_reliability: low | moderate | high
- dominant_uncertainties: Top sources
- reducible_uncertainty_pct: Percentage reducible
- irreducible_uncertainty_pct: Percentage inherent
- uncertainty_summary: 2-3 sentence summary
- recommendations: How to reduce uncertainty"""

            user_prompt = f"""Quantify uncertainty for this projection:

PROJECTION:
{projection_text}
{sources_text}

Analyze uncertainty and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_uncertainty_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build sources
            sources_data = result.get("uncertainty_sources", [])
            sources = [
                UncertaintySource(
                    source_id=s.get("source_id", f"U{idx+1}"),
                    source_name=s.get("source_name", ""),
                    source_type=s.get("source_type", "data"),
                    impact_magnitude=s.get("impact_magnitude", "medium"),
                    reducibility=s.get("reducibility", "partially"),
                    mitigation_options=s.get("mitigation_options", []),
                    contribution_pct=float(s.get("contribution_pct", 0)),
                )
                for idx, s in enumerate(sources_data)
            ]

            # Build intervals
            intervals_data = result.get("confidence_intervals", [])
            intervals = [
                ConfidenceInterval(
                    confidence_level=float(i.get("confidence_level", 0.95)),
                    lower_bound=float(i.get("lower_bound", 0)),
                    upper_bound=float(i.get("upper_bound", 0)),
                    interval_width=float(i.get("interval_width", 0)),
                    interpretation=i.get("interpretation", ""),
                )
                for i in intervals_data
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return UncertaintyOutput(
                success=True,
                uncertainty_sources=sources,
                confidence_intervals=intervals,
                overall_uncertainty=result.get("overall_uncertainty", "medium"),
                uncertainty_score=float(result.get("uncertainty_score", 50)),
                prediction_reliability=result.get("prediction_reliability", "moderate"),
                dominant_uncertainties=result.get("dominant_uncertainties", []),
                reducible_uncertainty_pct=float(result.get("reducible_uncertainty_pct", 50)),
                irreducible_uncertainty_pct=float(result.get("irreducible_uncertainty_pct", 50)),
                uncertainty_summary=result.get("uncertainty_summary", ""),
                recommendations=result.get("recommendations", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"UncertaintyRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return UncertaintyOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_focus_instruction(self, focus: str) -> str:
        """Get focus instruction."""
        instructions = {
            "data": "Focus on data: Quality, completeness, bias, representativeness.",
            "model": "Focus on model: Assumptions, structure, parameter estimates.",
            "external": "Focus on external: Environment, competition, regulation.",
            "comprehensive": "Comprehensive: All sources of uncertainty.",
        }
        return instructions.get(focus, instructions["comprehensive"])

    def _parse_uncertainty_response(self, content: str) -> Dict[str, Any]:
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
                "uncertainty_sources": [],
                "confidence_intervals": [],
                "overall_uncertainty": "unknown",
                "uncertainty_score": 0,
                "prediction_reliability": "unknown",
                "dominant_uncertainties": [],
                "reducible_uncertainty_pct": 0,
                "irreducible_uncertainty_pct": 0,
                "uncertainty_summary": content[:200],
                "recommendations": [],
            }
