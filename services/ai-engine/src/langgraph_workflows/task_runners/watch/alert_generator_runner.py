"""
AlertGeneratorRunner - Generate alert stream from monitoring data.

Algorithmic Core: Alert Stream Generation
- Generates structured alerts from monitoring signals
- Creates alert stream with priority and routing
- Provides actionable alert summaries

Use Cases:
- Disruption early warning systems
- Real-time monitoring alerts
- Executive notification systems
- Operational alert dashboards
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

class Alert(TaskRunnerOutput):
    """Individual alert in the stream."""

    alert_id: str = Field(default="", description="Unique alert identifier")
    alert_type: str = Field(default="info", description="info | warning | critical | emergency")
    title: str = Field(default="", description="Alert title")
    description: str = Field(default="", description="Alert description")
    source_signal: str = Field(default="", description="Source signal ID")
    probability: float = Field(default=0.0, description="Event probability 0-1")
    confidence: float = Field(default=0.0, description="Alert confidence 0-1")
    urgency: str = Field(default="low", description="low | medium | high | immediate")
    impact_area: str = Field(default="", description="Area of impact")
    recommended_action: str = Field(default="", description="Recommended response")
    escalation_path: List[str] = Field(default_factory=list, description="Escalation sequence")
    generated_at: str = Field(default="", description="Generation timestamp")
    expires_at: Optional[str] = Field(default=None, description="Alert expiration")


class AlertGeneratorInput(TaskRunnerInput):
    """Input schema for AlertGeneratorRunner."""

    monitoring_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Current monitoring state and signals"
    )
    probability_scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Probability scores from estimation"
    )
    threshold_config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Alert threshold configuration"
    )
    escalation_levels: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Escalation level definitions"
    )
    suppression_rules: List[str] = Field(
        default_factory=list,
        description="Rules for alert suppression"
    )
    context: Optional[str] = Field(
        default=None,
        description="Business context for alert generation"
    )


class AlertGeneratorOutput(TaskRunnerOutput):
    """Output schema for AlertGeneratorRunner."""

    alerts: List[Alert] = Field(
        default_factory=list,
        description="All generated alerts"
    )
    alert_stream: List[Alert] = Field(
        default_factory=list,
        description="Prioritized alert stream"
    )
    alert_summary: Dict[str, Any] = Field(
        default_factory=dict,
        description="Alert summary statistics"
    )
    critical_alerts: List[Alert] = Field(
        default_factory=list,
        description="Critical/emergency alerts"
    )
    suppressed_count: int = Field(default=0, description="Number of suppressed alerts")
    total_alerts: int = Field(default=0, description="Total alerts generated")
    generation_timestamp: str = Field(default="", description="Generation timestamp")


# =============================================================================
# Runner Implementation
# =============================================================================

@register_task_runner
class AlertGeneratorRunner(TaskRunner[AlertGeneratorInput, AlertGeneratorOutput]):
    """
    Generate alert stream from monitoring data and probability estimates.

    Algorithmic core: Alert stream generation with priority routing
    and intelligent suppression.

    Pipeline position: Final stage of early warning (produces actionable alerts)
    """

    runner_id = "alert_generator"
    category = TaskRunnerCategory.WATCH
    algorithmic_core = "alert_stream_generation"
    max_duration_seconds = 90
    temperature = 0.2  # Precise alert generation

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=self.temperature,
            max_tokens=4000,
        )

    async def execute(self, input_data: AlertGeneratorInput) -> AlertGeneratorOutput:
        """Execute alert generation."""
        logger.info(f"Executing AlertGeneratorRunner")

        prompt = """You are an alert system generating actionable alerts from monitoring data.

Generate alerts based on the monitoring data:

1. ALERT GENERATION:
   For each alert:
   - alert_id: Unique identifier (e.g., ALT-001)
   - alert_type: info | warning | critical | emergency
   - title: Clear, actionable title
   - description: What triggered the alert and why it matters
   - source_signal: Signal or metric that triggered it
   - probability: Event probability (0-1)
   - confidence: Alert confidence (0-1)
   - urgency: low | medium | high | immediate
   - impact_area: Business area affected
   - recommended_action: Specific action to take
   - escalation_path: Who to notify in sequence

2. ALERT PRIORITIZATION:
   - Order alerts by urgency and impact
   - Group related alerts
   - Identify patterns across alerts

3. ALERT SUMMARY:
   - total_by_type: Count by alert type
   - total_by_urgency: Count by urgency
   - top_impact_areas: Most affected areas
   - recommended_immediate_actions: Top 3 actions

4. SUPPRESSION:
   - Apply suppression rules
   - Note suppressed alerts and reasons

Return JSON with: alerts[], alert_stream[], alert_summary{}, critical_alerts[], suppressed_count"""

        context = f"""Monitoring Data: {input_data.monitoring_data}
Probability Scores: {input_data.probability_scores}
Threshold Config: {input_data.threshold_config}
Escalation Levels: {input_data.escalation_levels}
Suppression Rules: {input_data.suppression_rules}
Context: {input_data.context}"""

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=prompt),
                HumanMessage(content=context)
            ])
            result = self._parse_json_output(response.content)

            timestamp = datetime.utcnow().isoformat()
            alerts = [Alert(**{**a, "generated_at": timestamp}) for a in result.get("alerts", [])]
            alert_stream = [Alert(**{**a, "generated_at": timestamp}) for a in result.get("alert_stream", [])]
            critical_alerts = [Alert(**{**a, "generated_at": timestamp}) for a in result.get("critical_alerts", [])]

            output = AlertGeneratorOutput(
                alerts=alerts,
                alert_stream=alert_stream if alert_stream else alerts,
                alert_summary=result.get("alert_summary", {}),
                critical_alerts=critical_alerts,
                suppressed_count=result.get("suppressed_count", 0),
                total_alerts=len(alerts),
                generation_timestamp=timestamp,
                quality_score=0.8 if alerts else 0.5,
                tokens_used=response.usage_metadata.get("total_tokens", 0) if hasattr(response, "usage_metadata") else 0,
            )

            logger.info(f"AlertGenerator generated {len(alerts)} alerts, {len(critical_alerts)} critical")
            return output

        except Exception as e:
            logger.error(f"AlertGeneratorRunner failed: {e}")
            return AlertGeneratorOutput(
                error=str(e),
                quality_score=0.0,
                generation_timestamp=datetime.utcnow().isoformat(),
            )

    def _parse_json_output(self, content: str) -> Dict[str, Any]:
        """Parse JSON from LLM response."""
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON, returning empty dict")
            return {}


# =============================================================================
# Exports
# =============================================================================

__all__ = [
    "AlertGeneratorRunner",
    "AlertGeneratorInput",
    "AlertGeneratorOutput",
    "Alert",
]
