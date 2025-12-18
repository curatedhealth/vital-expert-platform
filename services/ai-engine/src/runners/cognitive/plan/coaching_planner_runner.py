"""
CoachingPlannerRunner - Plan team coaching programs.

Algorithmic Core: Development Planning
- Plans coaching sessions and development activities
- Matches coaches with team members
- Tracks development progress and milestones
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class CoachingSession(TaskRunnerOutput):
    """Planned coaching session."""
    session_id: str = Field(default="")
    participant_id: str = Field(default="")
    coach_id: str = Field(default="")
    focus_area: str = Field(default="")
    session_type: str = Field(default="", description="one_on_one | group | observation | feedback")
    objectives: List[str] = Field(default_factory=list)
    scheduled_date: str = Field(default="")
    duration_minutes: int = Field(default=60)


class CoachingPlannerInput(TaskRunnerInput):
    """Input schema for CoachingPlannerRunner."""
    team_members: List[Dict[str, Any]] = Field(default_factory=list, description="Team members")
    skill_gaps: List[Dict[str, Any]] = Field(default_factory=list, description="Identified gaps")
    available_coaches: List[Dict[str, Any]] = Field(default_factory=list, description="Available coaches")
    time_horizon: str = Field(default="quarterly", description="Planning horizon")


class CoachingPlannerOutput(TaskRunnerOutput):
    """Output schema for CoachingPlannerRunner."""
    sessions: List[CoachingSession] = Field(default_factory=list, description="Planned sessions")
    coaching_calendar: Dict[str, List[str]] = Field(default_factory=dict, description="Calendar view")
    coach_assignments: Dict[str, str] = Field(default_factory=dict, description="Coach assignments")
    development_milestones: List[Dict[str, Any]] = Field(default_factory=list, description="Development milestones")


@register_task_runner
class CoachingPlannerRunner(TaskRunner[CoachingPlannerInput, CoachingPlannerOutput]):
    """Plan team coaching programs."""

    runner_id = "coaching_planner"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "coaching_planning"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: CoachingPlannerInput) -> CoachingPlannerOutput:
        logger.info("Executing CoachingPlannerRunner")
        prompt = f"""Plan coaching program:
Team: {input_data.team_members[:10]}
Gaps: {input_data.skill_gaps[:10]}
Coaches: {input_data.available_coaches}
Horizon: {input_data.time_horizon}

Return JSON:
- sessions[]: session_id, participant_id, coach_id, focus_area, session_type, objectives[], scheduled_date, duration_minutes
- coaching_calendar{{}}
- coach_assignments{{}}
- development_milestones[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a coaching and development expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return CoachingPlannerOutput(
                sessions=[CoachingSession(**s) for s in result.get("sessions", [])],
                coaching_calendar=result.get("coaching_calendar", {}),
                coach_assignments=result.get("coach_assignments", {}),
                development_milestones=result.get("development_milestones", []),
                quality_score=0.8 if result.get("sessions") else 0.4,
            )
        except Exception as e:
            logger.error(f"CoachingPlannerRunner failed: {e}")
            return CoachingPlannerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["CoachingPlannerRunner", "CoachingPlannerInput", "CoachingPlannerOutput", "CoachingSession"]
