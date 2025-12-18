"""
EngagementProfilerRunner - Profile stakeholder engagement preferences.

Algorithmic Core: Engagement Profiling
- Analyzes stakeholder engagement preferences and patterns
- Creates engagement profiles with channel/content preferences
- Identifies optimal engagement approaches
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class EngagementProfile(TaskRunnerOutput):
    """Stakeholder engagement profile."""
    stakeholder_id: str = Field(default="")
    preferred_channels: List[str] = Field(default_factory=list)
    content_preferences: List[str] = Field(default_factory=list)
    engagement_frequency: str = Field(default="", description="high | medium | low")
    best_times: List[str] = Field(default_factory=list, description="Optimal engagement times")
    communication_style: str = Field(default="", description="formal | casual | technical | executive")
    decision_factors: List[str] = Field(default_factory=list)
    pain_points: List[str] = Field(default_factory=list)


class EngagementProfilerInput(TaskRunnerInput):
    """Input schema for EngagementProfilerRunner."""
    stakeholders: List[Dict[str, Any]] = Field(default_factory=list, description="Stakeholders to profile")
    interaction_history: List[Dict[str, Any]] = Field(default_factory=list, description="Past interactions")
    available_channels: List[str] = Field(default_factory=list, description="Available engagement channels")


class EngagementProfilerOutput(TaskRunnerOutput):
    """Output schema for EngagementProfilerRunner."""
    profiles: List[EngagementProfile] = Field(default_factory=list, description="Engagement profiles")
    channel_preferences_summary: Dict[str, int] = Field(default_factory=dict, description="Channel preference distribution")
    engagement_segments: Dict[str, List[str]] = Field(default_factory=dict, description="Segments by engagement style")
    optimization_recommendations: List[str] = Field(default_factory=list, description="Engagement recommendations")


@register_task_runner
class EngagementProfilerRunner(TaskRunner[EngagementProfilerInput, EngagementProfilerOutput]):
    """Profile stakeholder engagement preferences."""

    runner_id = "engagement_profiler"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "engagement_profiling"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: EngagementProfilerInput) -> EngagementProfilerOutput:
        logger.info("Executing EngagementProfilerRunner")
        prompt = f"""Profile engagement preferences:
Stakeholders: {input_data.stakeholders[:10]}
History: {input_data.interaction_history[:10]}
Channels: {input_data.available_channels}

Return JSON:
- profiles[]: stakeholder_id, preferred_channels[], content_preferences[], engagement_frequency, best_times[], communication_style, decision_factors[], pain_points[]
- channel_preferences_summary{{}}
- engagement_segments{{}}
- optimization_recommendations[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are an engagement strategy expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return EngagementProfilerOutput(
                profiles=[EngagementProfile(**p) for p in result.get("profiles", [])],
                channel_preferences_summary=result.get("channel_preferences_summary", {}),
                engagement_segments=result.get("engagement_segments", {}),
                optimization_recommendations=result.get("optimization_recommendations", []),
                quality_score=0.8 if result.get("profiles") else 0.4,
            )
        except Exception as e:
            logger.error(f"EngagementProfilerRunner failed: {e}")
            return EngagementProfilerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["EngagementProfilerRunner", "EngagementProfilerInput", "EngagementProfilerOutput", "EngagementProfile"]
