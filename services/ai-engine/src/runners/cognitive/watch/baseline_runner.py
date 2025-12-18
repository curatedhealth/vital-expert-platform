"""
BaselineRunner - Establish baseline using statistical profiling.

Algorithmic Core: Statistical Profiling
- Creates statistical profile of normal behavior
- Calculates key metrics (mean, std, percentiles)
- Establishes bounds for anomaly detection

Use Cases:
- KPI baseline establishment
- Market share benchmarking
- Competitive position baseline
- Patient outcome baseline
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

class BaselineInput(TaskRunnerInput):
    """Input schema for BaselineRunner."""

    data_source: Dict[str, Any] = Field(
        ...,
        description="Data to profile {metric_name: [values] or {timestamp: value}}"
    )
    metric_names: List[str] = Field(
        default_factory=list,
        description="Specific metrics to baseline (if empty, all)"
    )
    time_period: Optional[str] = Field(
        default=None,
        description="Time period description (e.g., 'Q3 2024', 'last 30 days')"
    )
    baseline_type: str = Field(
        default="statistical",
        description="Type: statistical | historical | peer_comparison"
    )
    confidence_level: float = Field(
        default=0.95,
        description="Confidence level for bounds (0.90, 0.95, 0.99)"
    )


class MetricBaseline(TaskRunnerOutput):
    """Baseline statistics for a single metric."""

    metric_name: str = Field(default="", description="Metric name")
    mean: float = Field(default=0.0, description="Mean value")
    median: float = Field(default=0.0, description="Median value")
    std_dev: float = Field(default=0.0, description="Standard deviation")
    min_value: float = Field(default=0.0, description="Minimum observed")
    max_value: float = Field(default=0.0, description="Maximum observed")
    p25: float = Field(default=0.0, description="25th percentile")
    p75: float = Field(default=0.0, description="75th percentile")
    lower_bound: float = Field(default=0.0, description="Lower normal bound")
    upper_bound: float = Field(default=0.0, description="Upper normal bound")
    sample_size: int = Field(default=0, description="Number of observations")
    data_quality: str = Field(default="good", description="good | fair | poor")


class BaselineOutput(TaskRunnerOutput):
    """Output schema for BaselineRunner."""

    baselines: List[MetricBaseline] = Field(
        default_factory=list,
        description="Baseline for each metric"
    )
    baseline_summary: Dict[str, Dict[str, float]] = Field(
        default_factory=dict,
        description="Quick summary {metric: {mean, lower, upper}}"
    )
    time_period: str = Field(default="", description="Period baselined")
    baseline_date: str = Field(default="", description="When baseline was created")
    data_quality_assessment: str = Field(
        default="",
        description="Overall data quality assessment"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations for monitoring"
    )
    anomalies_in_baseline: List[str] = Field(
        default_factory=list,
        description="Anomalies detected in baseline data"
    )


# =============================================================================
# BaselineRunner Implementation
# =============================================================================

@register_task_runner
class BaselineRunner(TaskRunner[BaselineInput, BaselineOutput]):
    """
    Statistical profiling baseline runner.

    This runner creates statistical profiles of metrics to establish
    normal behavior patterns for monitoring.

    Algorithmic Pattern:
        1. Parse data source and metrics
        2. Calculate descriptive statistics
        3. Compute confidence bounds
        4. Assess data quality
        5. Identify anomalies in baseline
        6. Generate monitoring recommendations

    Best Used For:
        - Setting up monitoring
        - Establishing KPI targets
        - Creating comparison benchmarks
        - Anomaly detection setup
    """

    runner_id = "baseline"
    name = "Baseline Runner"
    description = "Establish baseline using statistical profiling"
    category = TaskRunnerCategory.WATCH
    algorithmic_core = "statistical_profiling"
    max_duration_seconds = 90

    InputType = BaselineInput
    OutputType = BaselineOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize BaselineRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,
            max_tokens=2500,
        )

    async def execute(self, input: BaselineInput) -> BaselineOutput:
        """
        Execute baseline establishment.

        Args:
            input: Baseline parameters including data source

        Returns:
            BaselineOutput with statistical profiles
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Format data for analysis
            data_text = self._format_data_source(input.data_source)
            metrics_text = ""
            if input.metric_names:
                metrics_text = f"\nFocus on these metrics: {', '.join(input.metric_names)}"

            period_text = ""
            if input.time_period:
                period_text = f"\nTime period: {input.time_period}"

            system_prompt = f"""You are an expert statistician establishing monitoring baselines.

Your task is to create statistical profiles for metrics to enable monitoring.

Baseline type: {input.baseline_type}
Confidence level: {input.confidence_level}

Statistical profiling approach:
1. For each metric:
   - Calculate mean, median, std deviation
   - Compute min, max, quartiles (p25, p75)
   - Establish normal bounds at {input.confidence_level} confidence
   - Lower bound = mean - z * std (z based on confidence)
   - Upper bound = mean + z * std
2. Assess data quality:
   - Check sample size adequacy
   - Identify outliers in baseline
   - Note data gaps or issues
3. Generate monitoring recommendations

Return a structured JSON response with:
- baselines: Array with:
  - metric_name: Name
  - mean: Mean value
  - median: Median value
  - std_dev: Standard deviation
  - min_value: Minimum
  - max_value: Maximum
  - p25: 25th percentile
  - p75: 75th percentile
  - lower_bound: Lower normal bound
  - upper_bound: Upper normal bound
  - sample_size: Number of observations
  - data_quality: good | fair | poor
- baseline_summary: {{metric: {{mean, lower_bound, upper_bound}}}}
- time_period: Period description
- baseline_date: Today's date
- data_quality_assessment: Overall assessment
- recommendations: Monitoring recommendations
- anomalies_in_baseline: Any anomalies in source data"""

            user_prompt = f"""Establish baselines for this data:

DATA SOURCE:
{data_text}
{metrics_text}
{period_text}

Calculate statistical baselines and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_baseline_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build baselines
            baselines_data = result.get("baselines", [])
            baselines = [
                MetricBaseline(
                    metric_name=b.get("metric_name", ""),
                    mean=float(b.get("mean", 0)),
                    median=float(b.get("median", 0)),
                    std_dev=float(b.get("std_dev", 0)),
                    min_value=float(b.get("min_value", 0)),
                    max_value=float(b.get("max_value", 0)),
                    p25=float(b.get("p25", 0)),
                    p75=float(b.get("p75", 0)),
                    lower_bound=float(b.get("lower_bound", 0)),
                    upper_bound=float(b.get("upper_bound", 0)),
                    sample_size=int(b.get("sample_size", 0)),
                    data_quality=b.get("data_quality", "fair"),
                )
                for b in baselines_data
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return BaselineOutput(
                success=True,
                baselines=baselines,
                baseline_summary=result.get("baseline_summary", {}),
                time_period=result.get("time_period", input.time_period or ""),
                baseline_date=datetime.utcnow().isoformat()[:10],
                data_quality_assessment=result.get("data_quality_assessment", ""),
                recommendations=result.get("recommendations", []),
                anomalies_in_baseline=result.get("anomalies_in_baseline", []),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"BaselineRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return BaselineOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_data_source(self, data: Dict[str, Any]) -> str:
        """Format data source for prompt."""
        import json
        return json.dumps(data, indent=2, default=str)[:3000]

    def _parse_baseline_response(self, content: str) -> Dict[str, Any]:
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
                "baselines": [],
                "baseline_summary": {},
                "time_period": "",
                "baseline_date": "",
                "data_quality_assessment": content[:200],
                "recommendations": [],
                "anomalies_in_baseline": [],
            }
