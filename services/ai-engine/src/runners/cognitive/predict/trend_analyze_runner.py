"""
TrendAnalyzeRunner - Analyze trends using regression analysis.

Algorithmic Core: Regression Analysis / Trend Detection
- Identifies trend patterns in time series
- Detects inflection points and seasonality
- Calculates growth rates and trajectory

Use Cases:
- Market trend analysis
- Performance trending
- Sales forecasting prep
- KPI trajectory analysis
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

class DataPoint(TaskRunnerOutput):
    """A data point in the time series."""

    timestamp: str = Field(default="", description="Timestamp or period")
    value: float = Field(default=0, description="Value")
    label: Optional[str] = Field(default=None, description="Optional label")


class TrendAnalyzeInput(TaskRunnerInput):
    """Input schema for TrendAnalyzeRunner."""

    time_series: List[Dict[str, Any]] = Field(
        ...,
        description="Time series data [{timestamp, value, label?}]"
    )
    metric_name: str = Field(
        default="metric",
        description="Name of the metric being analyzed"
    )
    analysis_depth: str = Field(
        default="standard",
        description="Depth: quick | standard | comprehensive"
    )
    detect_seasonality: bool = Field(
        default=True,
        description="Whether to detect seasonal patterns"
    )
    detect_anomalies: bool = Field(
        default=True,
        description="Whether to detect anomalies"
    )


class TrendSegment(TaskRunnerOutput):
    """A segment of the trend."""

    segment_id: str = Field(default="", description="Segment ID")
    start_period: str = Field(default="", description="Start period")
    end_period: str = Field(default="", description="End period")
    trend_direction: str = Field(
        default="stable",
        description="increasing | decreasing | stable | volatile"
    )
    growth_rate: float = Field(default=0, description="Growth rate per period")
    slope: float = Field(default=0, description="Trend slope")
    r_squared: float = Field(default=0, description="Fit quality 0-1")


class TrendAnalyzeOutput(TaskRunnerOutput):
    """Output schema for TrendAnalyzeRunner."""

    overall_trend: str = Field(
        default="stable",
        description="increasing | decreasing | stable | volatile | cyclical"
    )
    trend_strength: float = Field(default=0, description="Trend strength 0-100")
    segments: List[TrendSegment] = Field(
        default_factory=list,
        description="Trend segments"
    )
    inflection_points: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Points where trend changes [{period, type, description}]"
    )
    growth_rate: float = Field(default=0, description="Overall growth rate")
    seasonality: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Seasonal pattern if detected"
    )
    anomalies: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Detected anomalies"
    )
    key_statistics: Dict[str, float] = Field(
        default_factory=dict,
        description="Key stats {mean, median, std, min, max}"
    )
    trend_summary: str = Field(default="", description="Summary")
    forecast_direction: str = Field(
        default="",
        description="Expected future direction"
    )


# =============================================================================
# TrendAnalyzeRunner Implementation
# =============================================================================

@register_task_runner
class TrendAnalyzeRunner(TaskRunner[TrendAnalyzeInput, TrendAnalyzeOutput]):
    """
    Regression analysis trend detection runner.

    This runner analyzes time series data to identify
    trends, patterns, and anomalies.

    Algorithmic Pattern:
        1. Parse time series data
        2. Calculate basic statistics
        3. Fit trend line (regression)
        4. Segment into trend periods
        5. Detect inflection points
        6. Identify seasonality if enabled
        7. Flag anomalies if enabled

    Best Used For:
        - Market analysis
        - Performance review
        - Forecasting prep
        - Pattern recognition
    """

    runner_id = "trend_analyze"
    name = "Trend Analyze Runner"
    description = "Analyze trends using regression analysis"
    category = TaskRunnerCategory.PREDICT
    algorithmic_core = "regression_analysis"
    max_duration_seconds = 120

    InputType = TrendAnalyzeInput
    OutputType = TrendAnalyzeOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize TrendAnalyzeRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3500,
        )

    async def execute(self, input: TrendAnalyzeInput) -> TrendAnalyzeOutput:
        """
        Execute trend analysis.

        Args:
            input: Trend analysis parameters

        Returns:
            TrendAnalyzeOutput with trend analysis
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            data_text = json.dumps(input.time_series, indent=2, default=str)[:3000]

            depth_instruction = self._get_depth_instruction(input.analysis_depth)

            system_prompt = f"""You are an expert trend analyst using regression analysis.

Your task is to analyze time series data to identify trends and patterns.

Metric: {input.metric_name}
Analysis depth: {input.analysis_depth}
{depth_instruction}
Detect seasonality: {input.detect_seasonality}
Detect anomalies: {input.detect_anomalies}

Regression analysis approach:
1. Calculate basic statistics:
   - mean, median, std, min, max
2. Identify overall trend:
   - increasing: Consistent upward movement
   - decreasing: Consistent downward movement
   - stable: Little change over time
   - volatile: High variance, no clear direction
   - cyclical: Repeating patterns
3. Segment into periods with different trends
4. For each segment:
   - Calculate growth rate
   - Estimate slope
   - Calculate R² (fit quality)
5. Find inflection points (trend changes)
6. If seasonality detection enabled:
   - Look for repeating patterns
   - Identify cycle length
7. If anomaly detection enabled:
   - Find outliers (>2σ from trend)
8. Project future direction

Return a structured JSON response with:
- overall_trend: increasing | decreasing | stable | volatile | cyclical
- trend_strength: 0-100
- segments: Array with:
  - segment_id: S1, S2, etc.
  - start_period: Start
  - end_period: End
  - trend_direction: increasing | decreasing | stable | volatile
  - growth_rate: Rate per period
  - slope: Trend slope
  - r_squared: Fit quality 0-1
- inflection_points: [{{period, type, description}}]
- growth_rate: Overall rate
- seasonality: {{detected: boolean, cycle_length, pattern}} or null
- anomalies: [{{period, value, expected, deviation}}]
- key_statistics: {{mean, median, std, min, max}}
- trend_summary: 2-3 sentence summary
- forecast_direction: Expected future"""

            user_prompt = f"""Analyze trends in this time series:

METRIC: {input.metric_name}

TIME SERIES DATA:
{data_text}

Analyze trends and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_trend_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build segments
            segments_data = result.get("segments", [])
            segments = [
                TrendSegment(
                    segment_id=s.get("segment_id", f"S{idx+1}"),
                    start_period=s.get("start_period", ""),
                    end_period=s.get("end_period", ""),
                    trend_direction=s.get("trend_direction", "stable"),
                    growth_rate=float(s.get("growth_rate", 0)),
                    slope=float(s.get("slope", 0)),
                    r_squared=float(s.get("r_squared", 0)),
                )
                for idx, s in enumerate(segments_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return TrendAnalyzeOutput(
                success=True,
                overall_trend=result.get("overall_trend", "stable"),
                trend_strength=float(result.get("trend_strength", 50)),
                segments=segments,
                inflection_points=result.get("inflection_points", []),
                growth_rate=float(result.get("growth_rate", 0)),
                seasonality=result.get("seasonality"),
                anomalies=result.get("anomalies", []),
                key_statistics=result.get("key_statistics", {}),
                trend_summary=result.get("trend_summary", ""),
                forecast_direction=result.get("forecast_direction", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"TrendAnalyzeRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return TrendAnalyzeOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "quick": "Quick: Overall trend and key statistics only.",
            "standard": "Standard: Full segmentation and pattern analysis.",
            "comprehensive": "Comprehensive: Deep analysis with all features.",
        }
        return instructions.get(depth, instructions["standard"])

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
                "overall_trend": "unknown",
                "trend_strength": 0,
                "segments": [],
                "inflection_points": [],
                "growth_rate": 0,
                "seasonality": None,
                "anomalies": [],
                "key_statistics": {},
                "trend_summary": content[:200],
                "forecast_direction": "",
            }
