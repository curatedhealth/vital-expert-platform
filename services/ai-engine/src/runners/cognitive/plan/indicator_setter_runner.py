"""
IndicatorSetterRunner - Set monitoring indicators for scenario tracking.

Algorithmic Core: Indicator Planning
- Defines leading and lagging indicators
- Creates indicator dashboard specifications
- Sets early warning signal thresholds
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class Indicator(TaskRunnerOutput):
    """Monitoring indicator definition."""
    indicator_id: str = Field(default="", description="Indicator ID")
    indicator_name: str = Field(default="", description="Indicator name")
    indicator_type: str = Field(default="leading", description="leading | lagging | coincident")
    metric: str = Field(default="", description="What to measure")
    threshold_warning: Optional[float] = Field(default=None, description="Warning threshold")
    threshold_critical: Optional[float] = Field(default=None, description="Critical threshold")
    frequency: str = Field(default="monthly", description="Measurement frequency")
    data_source: str = Field(default="", description="Data source")


class IndicatorSetterInput(TaskRunnerInput):
    """Input schema for IndicatorSetterRunner."""
    scenarios: List[Dict[str, Any]] = Field(default_factory=list, description="Scenarios to monitor")
    strategic_objectives: List[str] = Field(default_factory=list, description="Strategic objectives")
    monitoring_context: Optional[str] = Field(default=None, description="Monitoring context")


class IndicatorSetterOutput(TaskRunnerOutput):
    """Output schema for IndicatorSetterRunner."""
    indicators: List[Indicator] = Field(default_factory=list, description="Defined indicators")
    indicator_dashboard: Dict[str, Any] = Field(default_factory=dict, description="Dashboard specification")
    early_warning_signals: List[Dict[str, Any]] = Field(default_factory=list, description="Early warning signals")


@register_task_runner
class IndicatorSetterRunner(TaskRunner[IndicatorSetterInput, IndicatorSetterOutput]):
    """Set monitoring indicators for scenario tracking."""

    runner_id = "indicator_setter"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "indicator_planning"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: IndicatorSetterInput) -> IndicatorSetterOutput:
        """Execute indicator setting."""
        logger.info("Executing IndicatorSetterRunner")

        prompt = """Define monitoring indicators for scenario tracking.
1. INDICATORS: indicator_id, indicator_name, indicator_type (leading|lagging|coincident), metric, threshold_warning, threshold_critical, frequency, data_source
2. INDICATOR_DASHBOARD: layout, key_metrics, refresh_rate, alert_config
3. EARLY_WARNING_SIGNALS: signal_name, trigger_condition, action_required
Return JSON: indicators[], indicator_dashboard{}, early_warning_signals[]"""

        context = f"Scenarios: {input_data.scenarios[:3]}\nObjectives: {input_data.strategic_objectives}\nContext: {input_data.monitoring_context}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return IndicatorSetterOutput(
                indicators=[Indicator(**i) for i in result.get("indicators", [])],
                indicator_dashboard=result.get("indicator_dashboard", {}),
                early_warning_signals=result.get("early_warning_signals", []),
                quality_score=0.8 if result.get("indicators") else 0.4,
            )
        except Exception as e:
            logger.error(f"IndicatorSetterRunner failed: {e}")
            return IndicatorSetterOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["IndicatorSetterRunner", "IndicatorSetterInput", "IndicatorSetterOutput", "Indicator"]
