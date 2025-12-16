"""
DeltaRunner - Detect changes using change detection algorithms.

Algorithmic Core: Change Detection (CUSUM-inspired)
- Compares current state against baseline
- Detects statistically significant changes
- Quantifies change magnitude and direction

Use Cases:
- Market share change detection
- Competitive movement tracking
- KPI deviation detection
- Regulatory change monitoring
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

class DeltaInput(TaskRunnerInput):
    """Input schema for DeltaRunner."""

    current_data: Dict[str, Any] = Field(
        ...,
        description="Current state data {metric: value}"
    )
    baseline: Dict[str, Any] = Field(
        ...,
        description="Baseline to compare against {metric: {mean, std, bounds}}"
    )
    sensitivity: str = Field(
        default="medium",
        description="Detection sensitivity: low | medium | high"
    )
    change_types: List[str] = Field(
        default_factory=lambda: ["increase", "decrease", "volatility"],
        description="Types of changes to detect"
    )


class MetricDelta(TaskRunnerOutput):
    """Change detection result for a single metric."""

    metric_name: str = Field(default="", description="Metric name")
    baseline_value: float = Field(default=0.0, description="Baseline mean")
    current_value: float = Field(default=0.0, description="Current value")
    absolute_change: float = Field(default=0.0, description="Absolute change")
    percent_change: float = Field(default=0.0, description="Percent change")
    direction: str = Field(default="", description="increase | decrease | stable")
    sigma_distance: float = Field(default=0.0, description="Standard deviations from mean")
    is_significant: bool = Field(default=False, description="Statistically significant")
    is_anomaly: bool = Field(default=False, description="Outside normal bounds")
    change_interpretation: str = Field(default="", description="What this change means")


class DeltaOutput(TaskRunnerOutput):
    """Output schema for DeltaRunner."""

    deltas: List[MetricDelta] = Field(
        default_factory=list,
        description="Change detection per metric"
    )
    significant_changes: List[str] = Field(
        default_factory=list,
        description="Metrics with significant changes"
    )
    anomalies: List[str] = Field(
        default_factory=list,
        description="Metrics outside normal bounds"
    )
    delta_summary: str = Field(default="", description="Executive summary of changes")
    overall_change_score: float = Field(
        default=0.0,
        description="Aggregate change magnitude 0-100"
    )
    requires_attention: bool = Field(
        default=False,
        description="Whether changes require attention"
    )
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="Recommended follow-up actions"
    )


# =============================================================================
# DeltaRunner Implementation
# =============================================================================

@register_task_runner
class DeltaRunner(TaskRunner[DeltaInput, DeltaOutput]):
    """
    Change detection runner using CUSUM-inspired analysis.

    This runner compares current data against baseline to detect
    statistically significant changes.

    Algorithmic Pattern:
        1. For each metric, calculate delta from baseline
        2. Compute sigma distance (z-score)
        3. Apply sensitivity threshold
        4. Classify change direction and significance
        5. Identify anomalies (outside bounds)
        6. Generate change summary

    Best Used For:
        - Monitoring dashboards
        - Alert triggering
        - Performance tracking
        - Competitive intelligence
    """

    runner_id = "delta"
    name = "Delta Runner"
    description = "Detect changes using change detection"
    category = TaskRunnerCategory.WATCH
    algorithmic_core = "change_detection"
    max_duration_seconds = 90

    InputType = DeltaInput
    OutputType = DeltaOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize DeltaRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,
            max_tokens=2500,
        )

    async def execute(self, input: DeltaInput) -> DeltaOutput:
        """
        Execute change detection.

        Args:
            input: Delta parameters including current data and baseline

        Returns:
            DeltaOutput with changes, anomalies, and recommendations
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Format data
            current_text = self._format_data(input.current_data)
            baseline_text = self._format_data(input.baseline)
            sensitivity_threshold = self._get_sensitivity_threshold(input.sensitivity)

            system_prompt = f"""You are an expert analyst performing change detection.

Your task is to compare current data against baseline and detect changes.

Sensitivity: {input.sensitivity} (threshold: {sensitivity_threshold} sigma)
Change types to detect: {', '.join(input.change_types)}

Change detection approach:
1. For each metric:
   - Calculate absolute change = current - baseline_mean
   - Calculate percent change = (absolute / baseline_mean) * 100
   - Calculate sigma distance = absolute / baseline_std
   - Determine direction: increase (>0), decrease (<0), stable (near 0)
   - Mark significant if |sigma| > {sensitivity_threshold}
   - Mark anomaly if outside bounds
2. Interpret what changes mean in business context
3. Prioritize changes requiring attention
4. Suggest follow-up actions

Return a structured JSON response with:
- deltas: Array with:
  - metric_name: Name
  - baseline_value: Baseline mean
  - current_value: Current value
  - absolute_change: Absolute delta
  - percent_change: Percent delta
  - direction: increase | decrease | stable
  - sigma_distance: Z-score
  - is_significant: boolean
  - is_anomaly: boolean
  - change_interpretation: What it means
- significant_changes: List of metric names with significant changes
- anomalies: List of metric names outside bounds
- delta_summary: 2-3 sentence executive summary
- overall_change_score: 0-100 aggregate magnitude
- requires_attention: boolean
- recommended_actions: List of actions"""

            user_prompt = f"""Detect changes in this data:

CURRENT DATA:
{current_text}

BASELINE:
{baseline_text}

Perform change detection and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_delta_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build deltas
            deltas_data = result.get("deltas", [])
            deltas = [
                MetricDelta(
                    metric_name=d.get("metric_name", ""),
                    baseline_value=float(d.get("baseline_value", 0)),
                    current_value=float(d.get("current_value", 0)),
                    absolute_change=float(d.get("absolute_change", 0)),
                    percent_change=float(d.get("percent_change", 0)),
                    direction=d.get("direction", "stable"),
                    sigma_distance=float(d.get("sigma_distance", 0)),
                    is_significant=d.get("is_significant", False),
                    is_anomaly=d.get("is_anomaly", False),
                    change_interpretation=d.get("change_interpretation", ""),
                )
                for d in deltas_data
            ]

            requires_attention = result.get("requires_attention", len(result.get("anomalies", [])) > 0)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return DeltaOutput(
                success=True,
                deltas=deltas,
                significant_changes=result.get("significant_changes", []),
                anomalies=result.get("anomalies", []),
                delta_summary=result.get("delta_summary", ""),
                overall_change_score=float(result.get("overall_change_score", 0)),
                requires_attention=requires_attention,
                recommended_actions=result.get("recommended_actions", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"DeltaRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return DeltaOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_data(self, data: Dict[str, Any]) -> str:
        """Format data for prompt."""
        import json
        return json.dumps(data, indent=2, default=str)[:2000]

    def _get_sensitivity_threshold(self, sensitivity: str) -> float:
        """Get sigma threshold for sensitivity level."""
        thresholds = {
            "low": 3.0,      # Only major changes (3 sigma)
            "medium": 2.0,   # Moderate changes (2 sigma)
            "high": 1.5,     # Minor changes (1.5 sigma)
        }
        return thresholds.get(sensitivity, 2.0)

    def _parse_delta_response(self, content: str) -> Dict[str, Any]:
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
                "deltas": [],
                "significant_changes": [],
                "anomalies": [],
                "delta_summary": content[:200],
                "overall_change_score": 0,
                "requires_attention": False,
                "recommended_actions": [],
            }
