"""
TrendRunner - Extrapolate trends using time series projection.

Algorithmic Core: Time Series Projection
- Analyzes historical trends
- Projects future values
- Identifies trend patterns and inflection points

Use Cases:
- Market share trajectory
- Revenue forecasting
- Patient enrollment projection
- Competitive position trending
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

class TrendInput(TaskRunnerInput):
    """Input schema for TrendRunner."""

    time_series: Dict[str, List[Dict[str, Any]]] = Field(
        ...,
        description="Time series data {metric: [{timestamp, value}]}"
    )
    projection_horizon: str = Field(
        default="3_months",
        description="How far to project: 1_month | 3_months | 6_months | 1_year"
    )
    trend_types: List[str] = Field(
        default_factory=lambda: ["linear", "seasonal", "cyclical"],
        description="Trend patterns to detect"
    )
    confidence_intervals: bool = Field(
        default=True,
        description="Include confidence intervals in projection"
    )


class MetricTrend(TaskRunnerOutput):
    """Trend analysis for a single metric."""

    metric_name: str = Field(default="", description="Metric name")
    trend_direction: str = Field(default="", description="increasing | decreasing | stable | volatile")
    trend_strength: float = Field(default=0.0, description="Trend strength 0-1")
    trend_pattern: str = Field(default="", description="linear | exponential | seasonal | cyclical")
    current_value: float = Field(default=0.0, description="Most recent value")
    projected_value: float = Field(default=0.0, description="Projected end value")
    projection_low: Optional[float] = Field(default=None, description="Lower confidence bound")
    projection_high: Optional[float] = Field(default=None, description="Upper confidence bound")
    growth_rate: float = Field(default=0.0, description="Annualized growth rate %")
    inflection_points: List[str] = Field(default_factory=list, description="Notable inflection points")
    trend_interpretation: str = Field(default="", description="What trend means")


class TrendOutput(TaskRunnerOutput):
    """Output schema for TrendRunner."""

    trends: List[MetricTrend] = Field(
        default_factory=list,
        description="Trend analysis per metric"
    )
    projections: Dict[str, Dict[str, float]] = Field(
        default_factory=dict,
        description="Quick projections {metric: {current, projected, growth}}"
    )
    projection_horizon: str = Field(default="", description="Projection horizon used")
    overall_outlook: str = Field(
        default="",
        description="positive | negative | mixed | uncertain"
    )
    key_insights: List[str] = Field(
        default_factory=list,
        description="Key trend insights"
    )
    risks_identified: List[str] = Field(
        default_factory=list,
        description="Risks from trend analysis"
    )
    opportunities_identified: List[str] = Field(
        default_factory=list,
        description="Opportunities from trend analysis"
    )
    forecast_confidence: str = Field(
        default="medium",
        description="Confidence in forecast: high | medium | low"
    )


# =============================================================================
# TrendRunner Implementation
# =============================================================================

@register_task_runner
class TrendRunner(TaskRunner[TrendInput, TrendOutput]):
    """
    Time series projection trend runner.

    This runner analyzes historical data to identify trends
    and project future values.

    Algorithmic Pattern:
        1. Parse time series data
        2. Identify trend patterns (linear, seasonal, etc.)
        3. Calculate growth rates
        4. Project future values
        5. Generate confidence intervals
        6. Identify inflection points

    Best Used For:
        - Forecasting
        - Strategic planning
        - Performance prediction
        - Early warning
    """

    runner_id = "trend"
    name = "Trend Runner"
    description = "Extrapolate trends using time series projection"
    category = TaskRunnerCategory.WATCH
    algorithmic_core = "time_series_projection"
    max_duration_seconds = 120

    InputType = TrendInput
    OutputType = TrendOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize TrendRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: TrendInput) -> TrendOutput:
        """
        Execute trend analysis and projection.

        Args:
            input: Trend parameters including time series data

        Returns:
            TrendOutput with trends, projections, and insights
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Format data
            series_text = self._format_time_series(input.time_series)
            horizon_text = self._get_horizon_description(input.projection_horizon)

            system_prompt = f"""You are an expert time series analyst performing trend analysis.

Your task is to analyze historical data and project future trends.

Projection horizon: {input.projection_horizon} ({horizon_text})
Trend patterns to detect: {', '.join(input.trend_types)}
Include confidence intervals: {input.confidence_intervals}

Trend analysis approach:
1. For each metric:
   - Identify trend direction (increasing/decreasing/stable/volatile)
   - Determine trend pattern (linear/exponential/seasonal/cyclical)
   - Calculate trend strength (R-squared or similar)
   - Calculate growth rate (annualized %)
   - Project future value at horizon end
   - Generate confidence bounds if requested
   - Note any inflection points
2. Interpret what trends mean for business
3. Identify risks and opportunities
4. Assess forecast confidence

Return a structured JSON response with:
- trends: Array with:
  - metric_name: Name
  - trend_direction: increasing | decreasing | stable | volatile
  - trend_strength: 0.0-1.0
  - trend_pattern: linear | exponential | seasonal | cyclical
  - current_value: Most recent value
  - projected_value: Value at horizon end
  - projection_low: Lower bound (if CI requested)
  - projection_high: Upper bound (if CI requested)
  - growth_rate: Annualized %
  - inflection_points: Notable changes in trend
  - trend_interpretation: What it means
- projections: {{metric: {{current, projected, growth_rate}}}}
- projection_horizon: Horizon description
- overall_outlook: positive | negative | mixed | uncertain
- key_insights: Top 3-5 insights
- risks_identified: Risks from analysis
- opportunities_identified: Opportunities
- forecast_confidence: high | medium | low"""

            user_prompt = f"""Analyze trends in this time series data:

TIME SERIES:
{series_text}

Perform trend analysis and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_trend_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build trends
            trends_data = result.get("trends", [])
            trends = [
                MetricTrend(
                    metric_name=t.get("metric_name", ""),
                    trend_direction=t.get("trend_direction", "stable"),
                    trend_strength=float(t.get("trend_strength", 0.5)),
                    trend_pattern=t.get("trend_pattern", "linear"),
                    current_value=float(t.get("current_value", 0)),
                    projected_value=float(t.get("projected_value", 0)),
                    projection_low=t.get("projection_low"),
                    projection_high=t.get("projection_high"),
                    growth_rate=float(t.get("growth_rate", 0)),
                    inflection_points=t.get("inflection_points", []),
                    trend_interpretation=t.get("trend_interpretation", ""),
                )
                for t in trends_data
            ]

            forecast_conf = result.get("forecast_confidence", "medium")
            conf_score = {"high": 0.9, "medium": 0.7, "low": 0.5}.get(forecast_conf, 0.7)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return TrendOutput(
                success=True,
                trends=trends,
                projections=result.get("projections", {}),
                projection_horizon=input.projection_horizon,
                overall_outlook=result.get("overall_outlook", "mixed"),
                key_insights=result.get("key_insights", []),
                risks_identified=result.get("risks_identified", []),
                opportunities_identified=result.get("opportunities_identified", []),
                forecast_confidence=forecast_conf,
                confidence_score=conf_score,
                quality_score=conf_score,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"TrendRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return TrendOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_time_series(self, series: Dict[str, List[Dict[str, Any]]]) -> str:
        """Format time series for prompt."""
        import json
        return json.dumps(series, indent=2, default=str)[:3000]

    def _get_horizon_description(self, horizon: str) -> str:
        """Get horizon description."""
        descriptions = {
            "1_month": "Short-term (1 month)",
            "3_months": "Near-term (3 months)",
            "6_months": "Medium-term (6 months)",
            "1_year": "Long-term (1 year)",
        }
        return descriptions.get(horizon, "3 months")

    def _parse_trend_response(self, content: str) -> Dict[str, Any]:
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
                "trends": [],
                "projections": {},
                "projection_horizon": "",
                "overall_outlook": "uncertain",
                "key_insights": [],
                "risks_identified": [],
                "opportunities_identified": [],
                "forecast_confidence": "low",
            }
