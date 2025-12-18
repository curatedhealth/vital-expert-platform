"""
PREPARE Category - Monitoring Setup Runner

Sets up monitoring infrastructure and configurations for strategic scenarios,
foresight signals, and scenario tracking systems.

Core Logic: Monitoring Setup / Infrastructure Configuration
"""

from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

from typing import Any, Dict, List, Optional
from pydantic import Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# DATA SCHEMAS
# =============================================================================

class MonitoringMetric(TaskRunnerOutput):
    """A metric to be monitored."""
    metric_id: str = Field(default="")
    metric_name: str = Field(default="")
    metric_type: str = Field(default="quantitative", description="quantitative | qualitative | hybrid")
    description: str = Field(default="")
    data_source: str = Field(default="")
    collection_frequency: str = Field(default="weekly", description="daily | weekly | monthly | quarterly | event_driven")
    baseline_value: Optional[str] = Field(default=None)
    threshold_warning: Optional[str] = Field(default=None)
    threshold_critical: Optional[str] = Field(default=None)
    responsible_party: str = Field(default="")


class MonitoringDashboard(TaskRunnerOutput):
    """Dashboard configuration for monitoring."""
    dashboard_id: str = Field(default="")
    dashboard_name: str = Field(default="")
    view_type: str = Field(default="executive", description="executive | operational | tactical")
    metrics_displayed: List[str] = Field(default_factory=list)
    refresh_rate: str = Field(default="daily")
    audience: List[str] = Field(default_factory=list)
    visualization_types: List[str] = Field(default_factory=list)


class AlertConfiguration(TaskRunnerOutput):
    """Alert configuration for monitoring."""
    alert_id: str = Field(default="")
    alert_name: str = Field(default="")
    trigger_condition: str = Field(default="")
    severity: str = Field(default="medium", description="low | medium | high | critical")
    notification_channels: List[str] = Field(default_factory=list)
    escalation_path: List[str] = Field(default_factory=list)
    response_playbook: str = Field(default="")


class MonitoringSetupInput(TaskRunnerInput):
    """Input for monitoring setup."""
    monitoring_scope: str = Field(..., description="What to monitor (scenarios, signals, KPIs)")
    scenarios_to_track: List[Dict[str, Any]] = Field(default_factory=list, description="Scenarios to monitor")
    signals_defined: List[Dict[str, Any]] = Field(default_factory=list, description="Signals already defined")
    existing_systems: List[str] = Field(default_factory=list, description="Existing monitoring systems")
    stakeholders: List[str] = Field(default_factory=list, description="Who needs access")
    budget_constraints: Optional[str] = Field(default=None)


class MonitoringSetupOutput(TaskRunnerOutput):
    """Output from monitoring setup."""
    monitoring_plan: str = Field(default="")
    metrics: List[MonitoringMetric] = Field(default_factory=list)
    dashboards: List[MonitoringDashboard] = Field(default_factory=list)
    alerts: List[AlertConfiguration] = Field(default_factory=list)
    data_sources: Dict[str, str] = Field(default_factory=dict)
    integration_requirements: List[str] = Field(default_factory=list)
    implementation_steps: List[str] = Field(default_factory=list)
    estimated_setup_effort: str = Field(default="")


# =============================================================================
# MONITORING SETUP RUNNER
# =============================================================================

@register_task_runner
class MonitoringSetupRunner(TaskRunner[MonitoringSetupInput, MonitoringSetupOutput]):
    """
    Set up monitoring infrastructure for strategic scenarios and signals.

    Algorithmic Core: monitoring_infrastructure_setup
    Temperature: 0.2 (precise configuration)

    Configures:
    - Monitoring metrics and KPIs
    - Dashboard layouts and views
    - Alert configurations and thresholds
    - Data source integrations
    - Implementation roadmap
    """
    runner_id = "monitoring_setup"
    name = "Monitoring Setup Runner"
    description = "Set up monitoring infrastructure using monitoring architecture"
    category = TaskRunnerCategory.PREPARE
    algorithmic_core = "monitoring_infrastructure_setup"
    max_duration_seconds = 120
    InputType = MonitoringSetupInput
    OutputType = MonitoringSetupOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=4000)

    async def execute(self, input: MonitoringSetupInput) -> MonitoringSetupOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Design a comprehensive monitoring setup.

Monitoring Scope: {input.monitoring_scope}
Scenarios to Track: {input.scenarios_to_track[:3] if input.scenarios_to_track else 'Not specified'}
Signals Defined: {input.signals_defined[:3] if input.signals_defined else 'Not specified'}
Existing Systems: {input.existing_systems}
Stakeholders: {input.stakeholders}
Budget Constraints: {input.budget_constraints or 'Not specified'}

Return JSON with:
- monitoring_plan: Overall monitoring strategy description
- metrics: array of {{metric_id, metric_name, metric_type (quantitative|qualitative|hybrid), description, data_source, collection_frequency, baseline_value, threshold_warning, threshold_critical, responsible_party}}
- dashboards: array of {{dashboard_id, dashboard_name, view_type (executive|operational|tactical), metrics_displayed[], refresh_rate, audience[], visualization_types[]}}
- alerts: array of {{alert_id, alert_name, trigger_condition, severity (low|medium|high|critical), notification_channels[], escalation_path[], response_playbook}}
- data_sources: dict mapping metric_id to data source
- integration_requirements: array of system integrations needed
- implementation_steps: array of ordered implementation steps
- estimated_setup_effort: estimated effort (e.g., "2-3 weeks")
"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a monitoring infrastructure architect. Design comprehensive, actionable monitoring systems that track strategic scenarios and signals effectively."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            metrics = [MonitoringMetric(**m) for m in result.get("metrics", [])]
            dashboards = [MonitoringDashboard(**d) for d in result.get("dashboards", [])]
            alerts = [AlertConfiguration(**a) for a in result.get("alerts", [])]

            return MonitoringSetupOutput(
                success=True,
                monitoring_plan=result.get("monitoring_plan", ""),
                metrics=metrics,
                dashboards=dashboards,
                alerts=alerts,
                data_sources=result.get("data_sources", {}),
                integration_requirements=result.get("integration_requirements", []),
                implementation_steps=result.get("implementation_steps", []),
                estimated_setup_effort=result.get("estimated_setup_effort", ""),
                confidence_score=0.85,
                quality_score=len(metrics) * 0.1 + len(dashboards) * 0.15 + len(alerts) * 0.1,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"MonitoringSetupRunner error: {e}")
            return MonitoringSetupOutput(
                success=False,
                error=str(e),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}
