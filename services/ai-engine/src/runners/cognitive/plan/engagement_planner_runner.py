"""
EngagementPlannerRunner - Plan stakeholder engagements.

Algorithmic Core: Engagement Planning
- Plans stakeholder engagement activities
- Sequences interactions for optimal impact
- Balances coverage with resource constraints
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class PlannedEngagement(TaskRunnerOutput):
    """Planned engagement activity."""
    engagement_id: str = Field(default="")
    stakeholder_id: str = Field(default="")
    engagement_type: str = Field(default="", description="meeting | event | content | advisory | collaboration")
    objective: str = Field(default="")
    channel: str = Field(default="")
    priority: str = Field(default="medium", description="high | medium | low")
    planned_date: str = Field(default="")
    success_metrics: List[str] = Field(default_factory=list)


class EngagementPlannerInput(TaskRunnerInput):
    """Input schema for EngagementPlannerRunner."""
    stakeholders: List[Dict[str, Any]] = Field(default_factory=list, description="Target stakeholders")
    business_objectives: List[str] = Field(default_factory=list, description="Business objectives")
    time_horizon: str = Field(default="quarterly", description="Planning horizon")
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, description="Budget/time constraints")


class EngagementPlannerOutput(TaskRunnerOutput):
    """Output schema for EngagementPlannerRunner."""
    engagements: List[PlannedEngagement] = Field(default_factory=list, description="Planned engagements")
    engagement_calendar: Dict[str, List[str]] = Field(default_factory=dict, description="Calendar view")
    coverage_analysis: Dict[str, Any] = Field(default_factory=dict, description="Stakeholder coverage")
    resource_utilization: Dict[str, Any] = Field(default_factory=dict, description="Resource usage")


@register_task_runner
class EngagementPlannerRunner(TaskRunner[EngagementPlannerInput, EngagementPlannerOutput]):
    """Plan stakeholder engagements."""

    runner_id = "engagement_planner"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "engagement_planning"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: EngagementPlannerInput) -> EngagementPlannerOutput:
        logger.info("Executing EngagementPlannerRunner")
        prompt = f"""Plan stakeholder engagements:
Stakeholders: {input_data.stakeholders[:10]}
Objectives: {input_data.business_objectives}
Horizon: {input_data.time_horizon}
Constraints: {input_data.resource_constraints}

Return JSON:
- engagements[]: engagement_id, stakeholder_id, engagement_type, objective, channel, priority, planned_date, success_metrics[]
- engagement_calendar{{}}
- coverage_analysis{{}}
- resource_utilization{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are an engagement planning expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return EngagementPlannerOutput(
                engagements=[PlannedEngagement(**e) for e in result.get("engagements", [])],
                engagement_calendar=result.get("engagement_calendar", {}),
                coverage_analysis=result.get("coverage_analysis", {}),
                resource_utilization=result.get("resource_utilization", {}),
                quality_score=0.8 if result.get("engagements") else 0.4,
            )
        except Exception as e:
            logger.error(f"EngagementPlannerRunner failed: {e}")
            return EngagementPlannerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["EngagementPlannerRunner", "EngagementPlannerInput", "EngagementPlannerOutput", "PlannedEngagement"]
