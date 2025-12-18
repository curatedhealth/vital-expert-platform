"""
ScheduleRunner - Generate schedule using critical path method.

Algorithmic Core: Critical Path Method (CPM)
- Calculates earliest/latest start/finish times
- Identifies critical path
- Computes float/slack

Use Cases:
- Project scheduling
- Sprint planning
- Timeline generation
- Resource planning prep
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


# =============================================================================
# Input/Output Schemas
# =============================================================================

class ScheduleInput(TaskRunnerInput):
    """Input schema for ScheduleRunner."""

    tasks: List[Dict[str, Any]] = Field(
        ...,
        description="Tasks [{task_id, task_name, duration_hours, effort}]"
    )
    dependencies: List[Dict[str, Any]] = Field(
        ...,
        description="Dependencies [{from_task, to_task, lag}]"
    )
    start_date: Optional[str] = Field(
        default=None,
        description="Project start date (YYYY-MM-DD)"
    )
    working_hours_per_day: int = Field(
        default=8,
        description="Working hours per day"
    )
    schedule_mode: str = Field(
        default="asap",
        description="Mode: asap (as soon as possible) | alap (as late as possible)"
    )
    buffer_percentage: float = Field(
        default=0.1,
        description="Buffer to add (0-0.5)"
    )


class ScheduledTask(TaskRunnerOutput):
    """A scheduled task with timing."""

    task_id: str = Field(default="", description="Task ID")
    task_name: str = Field(default="", description="Task name")
    duration_hours: float = Field(default=0, description="Duration in hours")
    earliest_start: float = Field(default=0, description="Earliest start (hours from project start)")
    earliest_finish: float = Field(default=0, description="Earliest finish")
    latest_start: float = Field(default=0, description="Latest start without delay")
    latest_finish: float = Field(default=0, description="Latest finish without delay")
    total_float: float = Field(default=0, description="Total slack/float")
    free_float: float = Field(default=0, description="Free float")
    is_critical: bool = Field(default=False, description="On critical path")
    scheduled_start_day: int = Field(default=0, description="Scheduled start day")
    scheduled_end_day: int = Field(default=0, description="Scheduled end day")


class ScheduleOutput(TaskRunnerOutput):
    """Output schema for ScheduleRunner."""

    scheduled_tasks: List[ScheduledTask] = Field(
        default_factory=list,
        description="All scheduled tasks"
    )
    critical_path: List[str] = Field(
        default_factory=list,
        description="Task IDs on critical path"
    )
    critical_path_duration: float = Field(
        default=0,
        description="Total critical path hours"
    )
    project_duration_days: float = Field(
        default=0,
        description="Total project duration in days"
    )
    project_end_date: Optional[str] = Field(
        default=None,
        description="Calculated end date"
    )
    parallel_phases: List[List[str]] = Field(
        default_factory=list,
        description="Groups of parallel tasks by phase"
    )
    milestones: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Key milestones"
    )
    schedule_summary: str = Field(default="", description="Summary")
    buffer_days_added: float = Field(default=0, description="Buffer days")
    schedule_risk: str = Field(
        default="medium",
        description="Risk: low | medium | high"
    )


# =============================================================================
# ScheduleRunner Implementation
# =============================================================================

@register_task_runner
class ScheduleRunner(TaskRunner[ScheduleInput, ScheduleOutput]):
    """
    Critical path method scheduling runner.

    This runner generates project schedules using CPM
    to identify critical path and timing.

    Algorithmic Pattern (CPM):
        1. Forward pass:
           - Calculate earliest start/finish
           - ES(A) = max(EF of predecessors)
           - EF(A) = ES(A) + Duration(A)
        2. Backward pass:
           - Calculate latest start/finish
           - LF(A) = min(LS of successors)
           - LS(A) = LF(A) - Duration(A)
        3. Calculate float:
           - Total Float = LS - ES = LF - EF
           - Critical path = tasks with 0 float
        4. Identify parallel opportunities
        5. Add buffer if specified

    Best Used For:
        - Project scheduling
        - Timeline planning
        - Critical path analysis
        - Sprint planning
    """

    runner_id = "schedule"
    name = "Schedule Runner"
    description = "Generate schedule using critical path method"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "critical_path"
    max_duration_seconds = 120

    InputType = ScheduleInput
    OutputType = ScheduleOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ScheduleRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Precision for scheduling
            max_tokens=4000,
        )

    async def execute(self, input: ScheduleInput) -> ScheduleOutput:
        """
        Execute critical path scheduling.

        Args:
            input: Scheduling parameters

        Returns:
            ScheduleOutput with schedule
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            tasks_text = json.dumps(input.tasks, indent=2, default=str)[:2000]
            deps_text = json.dumps(input.dependencies, indent=2, default=str)[:1500]

            start_date_text = ""
            if input.start_date:
                start_date_text = f"\nProject start date: {input.start_date}"

            system_prompt = f"""You are an expert scheduler using the Critical Path Method (CPM).

Your task is to generate a project schedule with timing calculations.

Working hours per day: {input.working_hours_per_day}
Schedule mode: {input.schedule_mode}
Buffer percentage: {input.buffer_percentage}

Critical Path Method (CPM):
1. Forward pass (calculate earliest times):
   - ES (Earliest Start) = max(EF of all predecessors)
   - EF (Earliest Finish) = ES + Duration
   - Start from independent tasks (ES = 0)
2. Backward pass (calculate latest times):
   - LF (Latest Finish) = min(LS of all successors)
   - LS (Latest Start) = LF - Duration
   - Start from terminal tasks (LF = project end)
3. Calculate float/slack:
   - Total Float = LS - ES = LF - EF
   - Free Float = min(ES of successors) - EF
4. Critical path = sequence of tasks with 0 total float
5. Identify parallel phases (tasks that can run simultaneously)
6. Add buffer: multiply critical path by (1 + buffer_percentage)
7. Assess schedule risk:
   - low: Plenty of float, few parallel constraints
   - medium: Normal float distribution
   - high: Long critical path, many dependencies

Return a structured JSON response with:
- scheduled_tasks: Array with:
  - task_id: Task ID
  - task_name: Name
  - duration_hours: Duration
  - earliest_start: ES in hours from start
  - earliest_finish: EF in hours from start
  - latest_start: LS in hours from start
  - latest_finish: LF in hours from start
  - total_float: Total slack
  - free_float: Free slack
  - is_critical: boolean (float = 0)
  - scheduled_start_day: Day number
  - scheduled_end_day: Day number
- critical_path: Task IDs in order
- critical_path_duration: Hours
- project_duration_days: Days
- project_end_date: Calculated date if start provided
- parallel_phases: [[task_ids at same time]]
- milestones: Key points [{{name, day, tasks_completed}}]
- schedule_summary: 2-3 sentence summary
- buffer_days_added: Buffer in days
- schedule_risk: low | medium | high"""

            user_prompt = f"""Generate schedule for these tasks and dependencies:

TASKS:
{tasks_text}

DEPENDENCIES:
{deps_text}
{start_date_text}

Calculate schedule and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_schedule_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build scheduled tasks
            tasks_data = result.get("scheduled_tasks", [])
            scheduled = [
                ScheduledTask(
                    task_id=t.get("task_id", ""),
                    task_name=t.get("task_name", ""),
                    duration_hours=float(t.get("duration_hours", 8)),
                    earliest_start=float(t.get("earliest_start", 0)),
                    earliest_finish=float(t.get("earliest_finish", 8)),
                    latest_start=float(t.get("latest_start", 0)),
                    latest_finish=float(t.get("latest_finish", 8)),
                    total_float=float(t.get("total_float", 0)),
                    free_float=float(t.get("free_float", 0)),
                    is_critical=t.get("is_critical", False),
                    scheduled_start_day=int(t.get("scheduled_start_day", 1)),
                    scheduled_end_day=int(t.get("scheduled_end_day", 1)),
                )
                for t in tasks_data
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ScheduleOutput(
                success=True,
                scheduled_tasks=scheduled,
                critical_path=result.get("critical_path", []),
                critical_path_duration=float(result.get("critical_path_duration", 0)),
                project_duration_days=float(result.get("project_duration_days", 0)),
                project_end_date=result.get("project_end_date"),
                parallel_phases=result.get("parallel_phases", []),
                milestones=result.get("milestones", []),
                schedule_summary=result.get("schedule_summary", ""),
                buffer_days_added=float(result.get("buffer_days_added", 0)),
                schedule_risk=result.get("schedule_risk", "medium"),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ScheduleRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ScheduleOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_schedule_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "scheduled_tasks": [],
                "critical_path": [],
                "critical_path_duration": 0,
                "project_duration_days": 0,
                "project_end_date": None,
                "parallel_phases": [],
                "milestones": [],
                "schedule_summary": content[:200],
                "buffer_days_added": 0,
                "schedule_risk": "unknown",
            }
