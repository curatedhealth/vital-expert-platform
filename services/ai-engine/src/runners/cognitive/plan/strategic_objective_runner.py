"""
StrategicObjectiveSetterRunner - Set strategic objectives using goal decomposition.

Algorithmic Core: Strategic Objective Decomposition
- Decomposes vision into measurable objectives
- Defines KPIs and success metrics
- Creates objective hierarchy
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class StrategicObjective(TaskRunnerOutput):
    """Strategic objective definition."""
    objective_id: str = Field(default="", description="Objective ID")
    objective: str = Field(default="", description="Objective statement")
    objective_type: str = Field(default="growth", description="growth | share | awareness | profitability")
    target: str = Field(default="", description="Quantified target")
    timeline: str = Field(default="", description="Achievement timeline")
    kpis: List[str] = Field(default_factory=list, description="Associated KPIs")


class StrategicObjectiveInput(TaskRunnerInput):
    """Input schema for StrategicObjectiveSetterRunner."""
    vision: str = Field(default="", description="Strategic vision")
    market_context: Dict[str, Any] = Field(default_factory=dict, description="Market context")
    planning_horizon: str = Field(default="3 years", description="Planning horizon")


class StrategicObjectiveOutput(TaskRunnerOutput):
    """Output schema for StrategicObjectiveSetterRunner."""
    objectives: List[StrategicObjective] = Field(default_factory=list, description="Strategic objectives")
    kpis: List[Dict[str, Any]] = Field(default_factory=list, description="KPI definitions")
    success_metrics: Dict[str, Any] = Field(default_factory=dict, description="Success metrics")
    objective_hierarchy: Dict[str, Any] = Field(default_factory=dict, description="Objective hierarchy")


@register_task_runner
class StrategicObjectiveSetterRunner(TaskRunner[StrategicObjectiveInput, StrategicObjectiveOutput]):
    """Set strategic objectives using goal decomposition."""

    runner_id = "strategic_objective_setter"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "strategic_objective_decomposition"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: StrategicObjectiveInput) -> StrategicObjectiveOutput:
        """Execute strategic objective setting."""
        logger.info("Executing StrategicObjectiveSetterRunner")

        prompt = """Decompose vision into strategic objectives.
1. OBJECTIVES: objective_id, objective (SMART format), objective_type, target, timeline, kpis[]
2. KPIS: kpi_name, current_value, target_value, measurement_frequency
3. SUCCESS_METRICS: leading_indicators[], lagging_indicators[], health_metrics[]
4. OBJECTIVE_HIERARCHY: primary, secondary, supporting relationships
Return JSON: objectives[], kpis[], success_metrics{}, objective_hierarchy{}"""

        context = f"Vision: {input_data.vision}\nMarket: {input_data.market_context}\nHorizon: {input_data.planning_horizon}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return StrategicObjectiveOutput(
                objectives=[StrategicObjective(**o) for o in result.get("objectives", [])],
                kpis=result.get("kpis", []),
                success_metrics=result.get("success_metrics", {}),
                objective_hierarchy=result.get("objective_hierarchy", {}),
                quality_score=0.8 if result.get("objectives") else 0.4,
            )
        except Exception as e:
            logger.error(f"StrategicObjectiveSetterRunner failed: {e}")
            return StrategicObjectiveOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["StrategicObjectiveSetterRunner", "StrategicObjectiveInput", "StrategicObjectiveOutput", "StrategicObjective"]
