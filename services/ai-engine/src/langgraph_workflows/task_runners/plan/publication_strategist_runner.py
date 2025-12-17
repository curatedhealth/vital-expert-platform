"""
PublicationStrategistRunner - Plan publication strategy.

Algorithmic Core: Publication Planning
- Plans publication pipeline and timing
- Optimizes for target audience and impact
- Sequences publications for maximum reach
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class PlannedPublication(TaskRunnerOutput):
    """Planned publication."""
    publication_id: str = Field(default="")
    title: str = Field(default="")
    publication_type: str = Field(default="", description="journal | conference | white_paper | report | blog")
    target_venue: str = Field(default="")
    target_audience: List[str] = Field(default_factory=list)
    target_date: str = Field(default="")
    priority: str = Field(default="medium", description="high | medium | low")
    status: str = Field(default="planned", description="planned | drafting | review | submitted")


class PublicationStrategistInput(TaskRunnerInput):
    """Input schema for PublicationStrategistRunner."""
    evidence_portfolio: List[Dict[str, Any]] = Field(default_factory=list, description="Available evidence")
    strategic_objectives: List[str] = Field(default_factory=list, description="Strategic goals")
    target_audiences: List[str] = Field(default_factory=list, description="Target audiences")
    time_horizon: str = Field(default="annual", description="Planning horizon")


class PublicationStrategistOutput(TaskRunnerOutput):
    """Output schema for PublicationStrategistRunner."""
    publications: List[PlannedPublication] = Field(default_factory=list, description="Planned publications")
    publication_calendar: Dict[str, List[str]] = Field(default_factory=dict, description="Calendar view")
    audience_coverage: Dict[str, List[str]] = Field(default_factory=dict, description="Coverage by audience")
    impact_forecast: Dict[str, Any] = Field(default_factory=dict, description="Impact forecast")


@register_task_runner
class PublicationStrategistRunner(TaskRunner[PublicationStrategistInput, PublicationStrategistOutput]):
    """Plan publication strategy."""

    runner_id = "publication_strategist"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "publication_planning"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: PublicationStrategistInput) -> PublicationStrategistOutput:
        logger.info("Executing PublicationStrategistRunner")
        prompt = f"""Plan publication strategy:
Evidence: {input_data.evidence_portfolio[:10]}
Objectives: {input_data.strategic_objectives}
Audiences: {input_data.target_audiences}
Horizon: {input_data.time_horizon}

Return JSON:
- publications[]: publication_id, title, publication_type, target_venue, target_audience[], target_date, priority, status
- publication_calendar{{}}
- audience_coverage{{}}
- impact_forecast{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a publication strategy expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return PublicationStrategistOutput(
                publications=[PlannedPublication(**p) for p in result.get("publications", [])],
                publication_calendar=result.get("publication_calendar", {}),
                audience_coverage=result.get("audience_coverage", {}),
                impact_forecast=result.get("impact_forecast", {}),
                quality_score=0.8 if result.get("publications") else 0.4,
            )
        except Exception as e:
            logger.error(f"PublicationStrategistRunner failed: {e}")
            return PublicationStrategistOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["PublicationStrategistRunner", "PublicationStrategistInput", "PublicationStrategistOutput", "PlannedPublication"]
