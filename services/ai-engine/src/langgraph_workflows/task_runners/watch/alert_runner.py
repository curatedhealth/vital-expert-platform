"""
AlertRunner - Evaluate alerts using threshold evaluation.

Algorithmic Core: Threshold Evaluation
- Evaluates changes against alert thresholds
- Determines alert severity and urgency
- Provides alert context and recommendations

Use Cases:
- KPI breach alerting
- Competitive threat alerting
- Compliance threshold monitoring
- Safety signal alerting
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

class AlertThreshold(TaskRunnerOutput):
    """Alert threshold configuration."""

    metric_name: str = Field(default="", description="Metric name")
    warning_threshold: Optional[float] = Field(default=None, description="Warning level")
    critical_threshold: Optional[float] = Field(default=None, description="Critical level")
    direction: str = Field(default="above", description="above | below | both")


class AlertInput(TaskRunnerInput):
    """Input schema for AlertRunner."""

    delta_report: Dict[str, Any] = Field(
        ...,
        description="Delta report from DeltaRunner"
    )
    thresholds: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Alert thresholds [{metric, warning, critical, direction}]"
    )
    alert_context: Optional[str] = Field(
        default=None,
        description="Business context for alert evaluation"
    )
    suppression_rules: List[str] = Field(
        default_factory=list,
        description="Conditions to suppress alerts"
    )


class AlertEvaluation(TaskRunnerOutput):
    """Evaluation result for a single alert."""

    metric_name: str = Field(default="", description="Metric name")
    current_value: float = Field(default=0.0, description="Current value")
    threshold_breached: Optional[float] = Field(default=None, description="Threshold breached")
    severity: str = Field(default="none", description="none | info | warning | critical")
    urgency: str = Field(default="low", description="low | medium | high | immediate")
    alert_title: str = Field(default="", description="Alert title")
    alert_message: str = Field(default="", description="Detailed alert message")
    root_cause_hypothesis: str = Field(default="", description="Possible cause")
    recommended_action: str = Field(default="", description="Recommended action")
    is_suppressed: bool = Field(default=False, description="Alert suppressed")
    suppression_reason: Optional[str] = Field(default=None, description="Why suppressed")


class AlertOutput(TaskRunnerOutput):
    """Output schema for AlertRunner."""

    alerts: List[AlertEvaluation] = Field(
        default_factory=list,
        description="All evaluated alerts"
    )
    active_alerts: List[AlertEvaluation] = Field(
        default_factory=list,
        description="Non-suppressed alerts"
    )
    critical_count: int = Field(default=0, description="Number of critical alerts")
    warning_count: int = Field(default=0, description="Number of warning alerts")
    overall_status: str = Field(
        default="normal",
        description="normal | elevated | critical"
    )
    alert_summary: str = Field(default="", description="Executive summary")
    escalation_required: bool = Field(default=False, description="Needs escalation")
    next_review: str = Field(default="", description="Recommended next review time")


# =============================================================================
# AlertRunner Implementation
# =============================================================================

@register_task_runner
class AlertRunner(TaskRunner[AlertInput, AlertOutput]):
    """
    Threshold evaluation alert runner.

    This runner evaluates changes against thresholds to determine
    which alerts should be triggered.

    Algorithmic Pattern:
        1. Parse delta report and thresholds
        2. For each metric, check against thresholds
        3. Determine severity and urgency
        4. Apply suppression rules
        5. Generate alert messages
        6. Determine overall status

    Best Used For:
        - Alert management
        - Escalation decisions
        - Priority triage
        - Notification triggering
    """

    runner_id = "alert"
    name = "Alert Runner"
    description = "Evaluate alerts using threshold evaluation"
    category = TaskRunnerCategory.WATCH
    algorithmic_core = "threshold_evaluation"
    max_duration_seconds = 60

    InputType = AlertInput
    OutputType = AlertOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize AlertRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,
            max_tokens=2500,
        )

    async def execute(self, input: AlertInput) -> AlertOutput:
        """
        Execute alert evaluation.

        Args:
            input: Alert parameters including deltas and thresholds

        Returns:
            AlertOutput with evaluated alerts and status
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Format data
            delta_text = self._format_delta_report(input.delta_report)
            thresholds_text = self._format_thresholds(input.thresholds)

            context_text = ""
            if input.alert_context:
                context_text = f"\nBusiness context: {input.alert_context}"

            suppression_text = ""
            if input.suppression_rules:
                suppression_text = f"\nSuppression rules:\n" + "\n".join(
                    f"- {r}" for r in input.suppression_rules
                )

            system_prompt = f"""You are an expert alert analyst evaluating monitoring alerts.

Your task is to evaluate changes and determine which alerts to trigger.

Alert evaluation approach:
1. For each metric with changes:
   - Check if threshold is breached
   - Determine severity: none | info | warning | critical
   - Determine urgency: low | medium | high | immediate
   - Apply suppression rules if any
2. Generate actionable alert messages
3. Hypothesize root causes
4. Recommend actions
5. Determine overall system status
6. Decide if escalation is needed

Severity guidelines:
- none: No threshold breached
- info: Minor deviation, informational only
- warning: Warning threshold breached, needs attention
- critical: Critical threshold breached, immediate action

Return a structured JSON response with:
- alerts: Array with:
  - metric_name: Name
  - current_value: Current value
  - threshold_breached: Which threshold (null if none)
  - severity: none | info | warning | critical
  - urgency: low | medium | high | immediate
  - alert_title: Short alert title
  - alert_message: Detailed message
  - root_cause_hypothesis: Possible cause
  - recommended_action: What to do
  - is_suppressed: boolean
  - suppression_reason: Why suppressed (if applicable)
- critical_count: Number of critical alerts
- warning_count: Number of warning alerts
- overall_status: normal | elevated | critical
- alert_summary: 2-3 sentence summary
- escalation_required: boolean
- next_review: When to review again"""

            user_prompt = f"""Evaluate alerts for this delta report:

DELTA REPORT:
{delta_text}

THRESHOLDS:
{thresholds_text}
{context_text}
{suppression_text}

Evaluate alerts and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_alert_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build alerts
            alerts_data = result.get("alerts", [])
            alerts = [
                AlertEvaluation(
                    metric_name=a.get("metric_name", ""),
                    current_value=float(a.get("current_value", 0)),
                    threshold_breached=a.get("threshold_breached"),
                    severity=a.get("severity", "none"),
                    urgency=a.get("urgency", "low"),
                    alert_title=a.get("alert_title", ""),
                    alert_message=a.get("alert_message", ""),
                    root_cause_hypothesis=a.get("root_cause_hypothesis", ""),
                    recommended_action=a.get("recommended_action", ""),
                    is_suppressed=a.get("is_suppressed", False),
                    suppression_reason=a.get("suppression_reason"),
                )
                for a in alerts_data
            ]

            # Filter active alerts
            active_alerts = [a for a in alerts if not a.is_suppressed and a.severity != "none"]

            critical_count = sum(1 for a in active_alerts if a.severity == "critical")
            warning_count = sum(1 for a in active_alerts if a.severity == "warning")

            duration = (datetime.utcnow() - start_time).total_seconds()

            return AlertOutput(
                success=True,
                alerts=alerts,
                active_alerts=active_alerts,
                critical_count=critical_count,
                warning_count=warning_count,
                overall_status=result.get("overall_status", "normal"),
                alert_summary=result.get("alert_summary", ""),
                escalation_required=result.get("escalation_required", critical_count > 0),
                next_review=result.get("next_review", ""),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"AlertRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return AlertOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_delta_report(self, report: Dict[str, Any]) -> str:
        """Format delta report for prompt."""
        import json
        return json.dumps(report, indent=2, default=str)[:2500]

    def _format_thresholds(self, thresholds: List[Dict[str, Any]]) -> str:
        """Format thresholds for prompt."""
        lines = []
        for t in thresholds:
            metric = t.get("metric", t.get("metric_name", "Unknown"))
            warning = t.get("warning", t.get("warning_threshold"))
            critical = t.get("critical", t.get("critical_threshold"))
            direction = t.get("direction", "above")
            lines.append(f"- {metric}: warning={warning}, critical={critical}, direction={direction}")
        return "\n".join(lines) or "No thresholds defined"

    def _parse_alert_response(self, content: str) -> Dict[str, Any]:
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
                "alerts": [],
                "critical_count": 0,
                "warning_count": 0,
                "overall_status": "normal",
                "alert_summary": content[:200],
                "escalation_required": False,
                "next_review": "",
            }
