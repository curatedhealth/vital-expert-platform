"""
EngagementTimelineBuilderRunner - Build engagement timelines.

Algorithmic Core: Timeline Construction
- Sequences engagement activities over time
- Optimizes for stakeholder availability and impact
- Creates milestone-based execution timeline
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class TimelinePhase(TaskRunnerOutput):
    """Phase in engagement timeline."""
    phase_id: str = Field(default="")
    phase_name: str = Field(default="")
    start_date: str = Field(default="")
    end_date: str = Field(default="")
    objectives: List[str] = Field(default_factory=list)
    activities: List[str] = Field(default_factory=list)
    milestones: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)


class EngagementTimelineInput(TaskRunnerInput):
    """Input schema for EngagementTimelineBuilderRunner."""
    engagements: List[Dict[str, Any]] = Field(default_factory=list, description="Planned engagements")
    constraints: Dict[str, Any] = Field(default_factory=dict, description="Timeline constraints")
    key_dates: List[Dict[str, Any]] = Field(default_factory=list, description="Key dates/events")


class EngagementTimelineOutput(TaskRunnerOutput):
    """Output schema for EngagementTimelineBuilderRunner."""
    phases: List[TimelinePhase] = Field(default_factory=list, description="Timeline phases")
    timeline: Dict[str, List[str]] = Field(default_factory=dict, description="Month-by-month view")
    milestones: List[Dict[str, Any]] = Field(default_factory=list, description="Key milestones")
    critical_path: List[str] = Field(default_factory=list, description="Critical path activities")


@register_task_runner
class EngagementTimelineBuilderRunner(TaskRunner[EngagementTimelineInput, EngagementTimelineOutput]):
    """Build engagement timelines."""

    runner_id = "engagement_timeline_builder"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "timeline_construction"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: EngagementTimelineInput) -> EngagementTimelineOutput:
        logger.info("Executing EngagementTimelineBuilderRunner")
        prompt = f"""Build engagement timeline:
Engagements: {input_data.engagements[:10]}
Constraints: {input_data.constraints}
Key dates: {input_data.key_dates}

Return JSON:
- phases[]: phase_id, phase_name, start_date, end_date, objectives[], activities[], milestones[], dependencies[]
- timeline{{}} (month-by-month)
- milestones[]
- critical_path[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a timeline planning expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return EngagementTimelineOutput(
                phases=[TimelinePhase(**p) for p in result.get("phases", [])],
                timeline=result.get("timeline", {}),
                milestones=result.get("milestones", []),
                critical_path=result.get("critical_path", []),
                quality_score=0.8 if result.get("phases") else 0.4,
            )
        except Exception as e:
            logger.error(f"EngagementTimelineBuilderRunner failed: {e}")
            return EngagementTimelineOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["EngagementTimelineBuilderRunner", "EngagementTimelineInput", "EngagementTimelineOutput", "TimelinePhase"]
