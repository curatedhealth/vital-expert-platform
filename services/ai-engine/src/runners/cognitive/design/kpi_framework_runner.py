"""
KPIFrameworkDeveloperRunner - Develop KPI frameworks.

Algorithmic Core: KPI Design
- Develops KPI frameworks for performance measurement
- Defines metrics, targets, and thresholds
- Creates measurement methodologies
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class KPIDefinition(TaskRunnerOutput):
    """KPI definition."""
    kpi_id: str = Field(default="")
    kpi_name: str = Field(default="")
    description: str = Field(default="")
    category: str = Field(default="", description="performance | quality | efficiency | engagement | outcome")
    metric_type: str = Field(default="", description="count | ratio | percentage | score | index")
    calculation_method: str = Field(default="")
    target_value: float = Field(default=0.0)
    threshold_warning: float = Field(default=0.0)
    threshold_critical: float = Field(default=0.0)
    measurement_frequency: str = Field(default="", description="daily | weekly | monthly | quarterly")
    data_source: str = Field(default="")


class KPIFrameworkInput(TaskRunnerInput):
    """Input schema for KPIFrameworkDeveloperRunner."""
    strategic_objectives: List[str] = Field(default_factory=list, description="Strategic objectives")
    roles: List[str] = Field(default_factory=list, description="Roles to measure")
    existing_metrics: List[Dict[str, Any]] = Field(default_factory=list, description="Existing metrics")


class KPIFrameworkOutput(TaskRunnerOutput):
    """Output schema for KPIFrameworkDeveloperRunner."""
    kpis: List[KPIDefinition] = Field(default_factory=list, description="KPI definitions")
    kpi_hierarchy: Dict[str, List[str]] = Field(default_factory=dict, description="KPI hierarchy")
    scorecard_design: Dict[str, Any] = Field(default_factory=dict, description="Scorecard design")
    measurement_plan: Dict[str, Any] = Field(default_factory=dict, description="Measurement plan")


@register_task_runner
class KPIFrameworkDeveloperRunner(TaskRunner[KPIFrameworkInput, KPIFrameworkOutput]):
    """Develop KPI frameworks."""

    runner_id = "kpi_framework_developer"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "kpi_framework_design"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: KPIFrameworkInput) -> KPIFrameworkOutput:
        logger.info("Executing KPIFrameworkDeveloperRunner")
        prompt = f"""Develop KPI framework:
Objectives: {input_data.strategic_objectives}
Roles: {input_data.roles}
Existing: {input_data.existing_metrics[:10]}

Return JSON:
- kpis[]: kpi_id, kpi_name, description, category, metric_type, calculation_method, target_value, threshold_warning, threshold_critical, measurement_frequency, data_source
- kpi_hierarchy{{}}
- scorecard_design{{}}
- measurement_plan{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a performance measurement expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return KPIFrameworkOutput(
                kpis=[KPIDefinition(**k) for k in result.get("kpis", [])],
                kpi_hierarchy=result.get("kpi_hierarchy", {}),
                scorecard_design=result.get("scorecard_design", {}),
                measurement_plan=result.get("measurement_plan", {}),
                quality_score=0.8 if result.get("kpis") else 0.4,
            )
        except Exception as e:
            logger.error(f"KPIFrameworkDeveloperRunner failed: {e}")
            return KPIFrameworkOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["KPIFrameworkDeveloperRunner", "KPIFrameworkInput", "KPIFrameworkOutput", "KPIDefinition"]
