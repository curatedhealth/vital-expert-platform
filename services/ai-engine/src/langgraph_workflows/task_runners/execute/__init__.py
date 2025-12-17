"""
EXECUTE Task Runners - Execution & Operations.

- TaskRunner: Execute task using task management
- CoordinateRunner: Coordinate activities using coordination protocols
- MonitorProgressRunner: Monitor progress using progress tracking
- EscalateRunner: Handle escalation using escalation procedures

Core Logic: Execution Management / Operations
"""

from ..base_task_runner import TaskRunner as BaseTaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner
from typing import Dict, List, Optional
from pydantic import Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# TASK EXECUTION RUNNER
class TaskExecuteInput(TaskRunnerInput):
    task_description: str = Field(..., description="Task to execute")
    resources_available: List[str] = Field(default_factory=list)
    deadline: Optional[str] = Field(default=None)

class TaskStep(TaskRunnerOutput):
    step_id: str = Field(default="")
    action: str = Field(default="")
    responsible: str = Field(default="")
    duration: str = Field(default="")
    dependencies: List[str] = Field(default_factory=list)
    deliverable: str = Field(default="")

class TaskExecuteOutput(TaskRunnerOutput):
    steps: List[TaskStep] = Field(default_factory=list)
    critical_path: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    success_criteria: List[str] = Field(default_factory=list)
    execute_summary: str = Field(default="")

@register_task_runner
class TaskExecuteRunner(BaseTaskRunner[TaskExecuteInput, TaskExecuteOutput]):
    runner_id = "task_execute"
    name = "Task Execute Runner"
    description = "Execute task using task management"
    category = TaskRunnerCategory.EXECUTE
    algorithmic_core = "task_management"
    max_duration_seconds = 120
    InputType = TaskExecuteInput
    OutputType = TaskExecuteOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3500)

    async def execute(self, input: TaskExecuteInput) -> TaskExecuteOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Plan execution of: {input.task_description}. Resources: {input.resources_available}. Deadline: {input.deadline}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You plan task execution."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            steps = [TaskStep(**s) for s in result.get("steps", [])]
            return TaskExecuteOutput(success=True, steps=steps, critical_path=result.get("critical_path", []), risks=result.get("risks", []), execute_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return TaskExecuteOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# COORDINATE RUNNER
class CoordinateInput(TaskRunnerInput):
    activities: List[str] = Field(..., description="Activities to coordinate")
    participants: List[str] = Field(default_factory=list)
    coordination_type: str = Field(default="parallel", description="sequential | parallel | hybrid")

class CoordinationPlan(TaskRunnerOutput):
    activity: str = Field(default="")
    responsible: str = Field(default="")
    timing: str = Field(default="")
    dependencies: List[str] = Field(default_factory=list)
    handoffs: List[str] = Field(default_factory=list)

class CoordinateOutput(TaskRunnerOutput):
    coordination_plans: List[CoordinationPlan] = Field(default_factory=list)
    timeline: str = Field(default="")
    communication_points: List[str] = Field(default_factory=list)
    sync_meetings: List[str] = Field(default_factory=list)
    coordinate_summary: str = Field(default="")

@register_task_runner
class CoordinateRunner(BaseTaskRunner[CoordinateInput, CoordinateOutput]):
    runner_id = "coordinate"
    name = "Coordinate Runner"
    description = "Coordinate activities using coordination protocols"
    category = TaskRunnerCategory.EXECUTE
    algorithmic_core = "coordination_protocols"
    max_duration_seconds = 120
    InputType = CoordinateInput
    OutputType = CoordinateOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=3500)

    async def execute(self, input: CoordinateInput) -> CoordinateOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Coordinate activities: {input.activities}. Participants: {input.participants}. Type: {input.coordination_type}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You coordinate complex activities."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            plans = [CoordinationPlan(**p) for p in result.get("plans", [])]
            return CoordinateOutput(success=True, coordination_plans=plans, timeline=result.get("timeline", ""), communication_points=result.get("comms", []), coordinate_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return CoordinateOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# MONITOR PROGRESS RUNNER
class MonitorProgressInput(TaskRunnerInput):
    project: str = Field(..., description="Project to monitor")
    milestones: List[str] = Field(default_factory=list)
    current_status: Optional[str] = Field(default=None)

class ProgressMetric(TaskRunnerOutput):
    metric_name: str = Field(default="")
    current_value: str = Field(default="")
    target_value: str = Field(default="")
    status: str = Field(default="on_track", description="on_track | at_risk | behind | ahead")
    trend: str = Field(default="stable")

class MonitorProgressOutput(TaskRunnerOutput):
    overall_progress: float = Field(default=0, description="0-100")
    overall_status: str = Field(default="on_track")
    metrics: List[ProgressMetric] = Field(default_factory=list)
    blockers: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    progress_summary: str = Field(default="")

@register_task_runner
class MonitorProgressRunner(BaseTaskRunner[MonitorProgressInput, MonitorProgressOutput]):
    runner_id = "monitor_progress"
    name = "Monitor Progress Runner"
    description = "Monitor progress using progress tracking"
    category = TaskRunnerCategory.EXECUTE
    algorithmic_core = "progress_tracking"
    max_duration_seconds = 120
    InputType = MonitorProgressInput
    OutputType = MonitorProgressOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3500)

    async def execute(self, input: MonitorProgressInput) -> MonitorProgressOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Monitor progress of {input.project}. Milestones: {input.milestones}. Status: {input.current_status}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You track project progress."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            metrics = [ProgressMetric(**m) for m in result.get("metrics", [])]
            return MonitorProgressOutput(success=True, overall_progress=float(result.get("progress", 50)), overall_status=result.get("status", "on_track"), metrics=metrics, blockers=result.get("blockers", []), progress_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return MonitorProgressOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

# ESCALATE RUNNER
class EscalateInput(TaskRunnerInput):
    issue: str = Field(..., description="Issue to escalate")
    current_level: str = Field(default="team", description="team | manager | director | executive")
    urgency: str = Field(default="standard", description="low | standard | high | critical")

class EscalationPath(TaskRunnerOutput):
    level: str = Field(default="")
    contact: str = Field(default="")
    action_required: str = Field(default="")
    timeline: str = Field(default="")

class EscalateOutput(TaskRunnerOutput):
    escalation_path: List[EscalationPath] = Field(default_factory=list)
    recommended_level: str = Field(default="")
    escalation_message: str = Field(default="")
    expected_response_time: str = Field(default="")
    escalate_summary: str = Field(default="")

@register_task_runner
class EscalateRunner(BaseTaskRunner[EscalateInput, EscalateOutput]):
    runner_id = "escalate"
    name = "Escalate Runner"
    description = "Handle escalation using escalation procedures"
    category = TaskRunnerCategory.EXECUTE
    algorithmic_core = "escalation_procedures"
    max_duration_seconds = 90
    InputType = EscalateInput
    OutputType = EscalateOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3000)

    async def execute(self, input: EscalateInput) -> EscalateOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Plan escalation for: {input.issue}. Current level: {input.current_level}. Urgency: {input.urgency}. Return JSON."
            response = await self.llm.ainvoke([SystemMessage(content="You plan escalation paths."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            path = [EscalationPath(**p) for p in result.get("path", [])]
            return EscalateOutput(success=True, escalation_path=path, recommended_level=result.get("recommended_level", ""), escalation_message=result.get("message", ""), escalate_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return EscalateOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}

__all__ = [
    "TaskExecuteRunner", "TaskExecuteInput", "TaskExecuteOutput", "TaskStep",
    "CoordinateRunner", "CoordinateInput", "CoordinateOutput", "CoordinationPlan",
    "MonitorProgressRunner", "MonitorProgressInput", "MonitorProgressOutput", "ProgressMetric",
    "EscalateRunner", "EscalateInput", "EscalateOutput", "EscalationPath",
]
