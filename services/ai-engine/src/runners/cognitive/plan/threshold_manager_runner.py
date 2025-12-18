"""
ThresholdManagerRunner - Configure alert thresholds for monitoring.

Algorithmic Core: Threshold Configuration
- Sets alert thresholds based on risk tolerance
- Configures escalation levels
- Manages threshold sensitivity
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class ThresholdConfig(TaskRunnerOutput):
    """Individual threshold configuration."""
    metric_name: str = Field(default="", description="Metric name")
    warning_level: float = Field(default=0.0, description="Warning threshold")
    critical_level: float = Field(default=0.0, description="Critical threshold")
    direction: str = Field(default="above", description="above | below | both")
    escalation_delay: int = Field(default=0, description="Minutes before escalation")


class ThresholdManagerInput(TaskRunnerInput):
    """Input schema for ThresholdManagerRunner."""
    metrics: List[Dict[str, Any]] = Field(default_factory=list, description="Metrics to configure")
    risk_tolerance: str = Field(default="medium", description="low | medium | high")
    escalation_requirements: List[str] = Field(default_factory=list, description="Escalation requirements")


class ThresholdManagerOutput(TaskRunnerOutput):
    """Output schema for ThresholdManagerRunner."""
    threshold_config: Dict[str, Any] = Field(default_factory=dict, description="Overall config")
    alert_thresholds: List[ThresholdConfig] = Field(default_factory=list, description="Threshold configs")
    escalation_levels: List[Dict[str, Any]] = Field(default_factory=list, description="Escalation levels")


@register_task_runner
class ThresholdManagerRunner(TaskRunner[ThresholdManagerInput, ThresholdManagerOutput]):
    """Configure alert thresholds for monitoring."""

    runner_id = "threshold_manager"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "threshold_configuration"
    max_duration_seconds = 60
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=2000)

    async def execute(self, input_data: ThresholdManagerInput) -> ThresholdManagerOutput:
        """Execute threshold configuration."""
        logger.info("Executing ThresholdManagerRunner")

        prompt = """Configure alert thresholds based on risk tolerance.
1. THRESHOLD_CONFIG: overall settings, sensitivity, cooldown_period
2. ALERT_THRESHOLDS: metric_name, warning_level, critical_level, direction (above|below|both), escalation_delay
3. ESCALATION_LEVELS: level (L1|L2|L3), responders, response_time_sla, actions
Return JSON: threshold_config{}, alert_thresholds[], escalation_levels[]"""

        context = f"Metrics: {input_data.metrics}\nRisk Tolerance: {input_data.risk_tolerance}\nEscalation: {input_data.escalation_requirements}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return ThresholdManagerOutput(
                threshold_config=result.get("threshold_config", {}),
                alert_thresholds=[ThresholdConfig(**t) for t in result.get("alert_thresholds", [])],
                escalation_levels=result.get("escalation_levels", []),
                quality_score=0.8 if result.get("alert_thresholds") else 0.4,
            )
        except Exception as e:
            logger.error(f"ThresholdManagerRunner failed: {e}")
            return ThresholdManagerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["ThresholdManagerRunner", "ThresholdManagerInput", "ThresholdManagerOutput", "ThresholdConfig"]
