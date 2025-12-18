"""
ContentStrategistRunner - Design content strategy.

Algorithmic Core: Content Strategy Design
- Designs content strategy for stakeholder engagement
- Plans content types, channels, and cadence
- Optimizes for audience and objectives
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class ContentPlan(TaskRunnerOutput):
    """Content plan item."""
    content_id: str = Field(default="")
    title: str = Field(default="")
    content_type: str = Field(default="", description="article | video | infographic | webinar | podcast | white_paper")
    target_audience: List[str] = Field(default_factory=list)
    channel: str = Field(default="")
    key_messages: List[str] = Field(default_factory=list)
    objective: str = Field(default="")
    planned_date: str = Field(default="")


class ContentStrategistInput(TaskRunnerInput):
    """Input schema for ContentStrategistRunner."""
    stakeholder_profiles: List[Dict[str, Any]] = Field(default_factory=list, description="Target stakeholders")
    strategic_objectives: List[str] = Field(default_factory=list, description="Content objectives")
    available_channels: List[str] = Field(default_factory=list, description="Available channels")
    time_horizon: str = Field(default="quarterly", description="Planning horizon")


class ContentStrategistOutput(TaskRunnerOutput):
    """Output schema for ContentStrategistRunner."""
    content_plans: List[ContentPlan] = Field(default_factory=list, description="Planned content")
    content_calendar: Dict[str, List[str]] = Field(default_factory=dict, description="Calendar view")
    channel_strategy: Dict[str, Any] = Field(default_factory=dict, description="Channel strategy")
    audience_coverage: Dict[str, List[str]] = Field(default_factory=dict, description="Coverage by audience")


@register_task_runner
class ContentStrategistRunner(TaskRunner[ContentStrategistInput, ContentStrategistOutput]):
    """Design content strategy."""

    runner_id = "content_strategist"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "content_strategy_design"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: ContentStrategistInput) -> ContentStrategistOutput:
        logger.info("Executing ContentStrategistRunner")
        prompt = f"""Design content strategy:
Stakeholders: {input_data.stakeholder_profiles[:10]}
Objectives: {input_data.strategic_objectives}
Channels: {input_data.available_channels}
Horizon: {input_data.time_horizon}

Return JSON:
- content_plans[]: content_id, title, content_type, target_audience[], channel, key_messages[], objective, planned_date
- content_calendar{{}}
- channel_strategy{{}}
- audience_coverage{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a content strategy expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return ContentStrategistOutput(
                content_plans=[ContentPlan(**c) for c in result.get("content_plans", [])],
                content_calendar=result.get("content_calendar", {}),
                channel_strategy=result.get("channel_strategy", {}),
                audience_coverage=result.get("audience_coverage", {}),
                quality_score=0.8 if result.get("content_plans") else 0.4,
            )
        except Exception as e:
            logger.error(f"ContentStrategistRunner failed: {e}")
            return ContentStrategistOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["ContentStrategistRunner", "ContentStrategistInput", "ContentStrategistOutput", "ContentPlan"]
