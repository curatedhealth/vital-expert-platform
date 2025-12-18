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

# =============================================================================
# FSM / BUSINESS PROCESS AUTOMATION RUNNERS
# =============================================================================
# These runners implement Finite State Machine logic for business process automation.
# They handle stateful, long-running processes with heuristic intelligence.
#
# FSM Pattern:
#   Lead → Contacted → Qualified → Proposal → Closed
#
# Pipeline: StateRead → Transition → Action → [HITLEscalate if needed]

from typing import Any
from enum import Enum


class ProcessState(str, Enum):
    """Standard process states for FSM."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    WAITING = "waiting"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TransitionType(str, Enum):
    """Types of state transitions."""
    AUTOMATIC = "automatic"
    MANUAL = "manual"
    CONDITIONAL = "conditional"
    TIMED = "timed"
    EVENT_DRIVEN = "event_driven"


# =============================================================================
# STATE READ RUNNER (State Lookup)
# =============================================================================

class StateReadInput(TaskRunnerInput):
    """Input for reading current state."""
    entity_id: str = Field(..., description="ID of the entity to get state for")
    entity_type: str = Field(..., description="Type of entity (lead, order, ticket, etc.)")
    process_name: str = Field(default="", description="Name of the process/workflow")
    include_history: bool = Field(default=False, description="Include state history")
    include_metadata: bool = Field(default=True, description="Include state metadata")


class StateInfo(TaskRunnerOutput):
    """Information about an entity's state."""
    entity_id: str = Field(default="")
    entity_type: str = Field(default="")
    current_state: str = Field(default="")
    entered_at: str = Field(default="")
    time_in_state: str = Field(default="")
    previous_state: Optional[str] = Field(default=None)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    allowed_transitions: List[str] = Field(default_factory=list)


class StateHistory(TaskRunnerOutput):
    """A state transition in history."""
    from_state: str = Field(default="")
    to_state: str = Field(default="")
    transitioned_at: str = Field(default="")
    triggered_by: str = Field(default="")
    reason: str = Field(default="")


class StateReadOutput(TaskRunnerOutput):
    """Output from state read."""
    state_info: StateInfo = Field(default_factory=StateInfo)
    history: List[StateHistory] = Field(default_factory=list)
    process_definition: Dict[str, Any] = Field(default_factory=dict)
    state_read_summary: str = Field(default="")


@register_task_runner
class StateReadRunner(BaseTaskRunner[StateReadInput, StateReadOutput]):
    """
    Read current state of an entity in a process (FSM: State Lookup).

    Retrieves:
    - Current state of the entity
    - Time in current state
    - Allowed transitions from current state
    - State history (optional)
    - Process metadata
    """
    runner_id = "state_read"
    name = "State Read Runner"
    description = "Read current state using state lookup"
    category = TaskRunnerCategory.EXECUTE
    algorithmic_core = "state_lookup"
    max_duration_seconds = 30
    InputType = StateReadInput
    OutputType = StateReadOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.0, max_tokens=2000)

    async def execute(self, input: StateReadInput) -> StateReadOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Look up the current state of an entity in a business process.

Entity ID: {input.entity_id}
Entity Type: {input.entity_type}
Process Name: {input.process_name or "Generic workflow"}
Include History: {input.include_history}

Simulate a realistic state lookup for this entity type. Consider common states for:
- Lead: new → contacted → qualified → proposal → negotiation → closed_won/closed_lost
- Order: pending → processing → shipped → delivered → completed
- Ticket: open → assigned → in_progress → pending_customer → resolved → closed
- Task: todo → in_progress → review → done

Return JSON with:
- state_info: {{entity_id, entity_type, current_state, entered_at, time_in_state, previous_state, metadata{{}}, allowed_transitions[]}}
- history: array of {{from_state, to_state, transitioned_at, triggered_by, reason}} (if requested)
- process_definition: {{states[], transitions[]}}
- summary: brief state summary"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a state machine that tracks entity states in business processes. Return realistic state information."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            state_info = StateInfo(**result.get("state_info", {}))
            history = [StateHistory(**h) for h in result.get("history", [])] if input.include_history else []

            return StateReadOutput(
                success=True,
                state_info=state_info,
                history=history,
                process_definition=result.get("process_definition", {}),
                state_read_summary=result.get("summary", ""),
                confidence_score=0.95,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"StateReadRunner error: {e}")
            return StateReadOutput(
                success=False,
                error=str(e),
                state_read_summary="State lookup failed",
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}


# =============================================================================
# TRANSITION RUNNER (FSM Transition Logic)
# =============================================================================

class TransitionInput(TaskRunnerInput):
    """Input for determining state transition."""
    entity_id: str = Field(..., description="ID of the entity")
    current_state: str = Field(..., description="Current state of the entity")
    event: str = Field(..., description="Event/trigger that occurred")
    rules: List[str] = Field(default_factory=list, description="Transition rules to apply")
    context: Dict[str, Any] = Field(default_factory=dict, description="Context for rule evaluation")
    validate_guards: bool = Field(default=True, description="Validate guard conditions")


class TransitionDecision(TaskRunnerOutput):
    """The decision about a state transition."""
    transition_id: str = Field(default="")
    from_state: str = Field(default="")
    to_state: str = Field(default="")
    transition_type: str = Field(default="automatic")
    is_valid: bool = Field(default=False)
    guard_conditions: List[str] = Field(default_factory=list)
    guards_passed: List[str] = Field(default_factory=list)
    guards_failed: List[str] = Field(default_factory=list)
    actions_to_execute: List[str] = Field(default_factory=list)
    reason: str = Field(default="")


class TransitionOutput(TaskRunnerOutput):
    """Output from transition determination."""
    decision: TransitionDecision = Field(default_factory=TransitionDecision)
    alternative_transitions: List[TransitionDecision] = Field(default_factory=list)
    blocked: bool = Field(default=False)
    block_reason: Optional[str] = Field(default=None)
    requires_approval: bool = Field(default=False)
    transition_summary: str = Field(default="")


@register_task_runner
class TransitionRunner(BaseTaskRunner[TransitionInput, TransitionOutput]):
    """
    Determine the next state based on FSM rules (FSM: Transition).

    Evaluates:
    - Current state + event → next state mapping
    - Guard conditions (pre-conditions for transition)
    - Side effects (actions to execute on transition)
    - Alternative transitions if primary fails
    """
    runner_id = "transition"
    name = "Transition Runner"
    description = "Determine next state using FSM transition"
    category = TaskRunnerCategory.EXECUTE
    algorithmic_core = "fsm_transition"
    max_duration_seconds = 45
    InputType = TransitionInput
    OutputType = TransitionOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.1, max_tokens=3000)

    async def execute(self, input: TransitionInput) -> TransitionOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Evaluate FSM state transition.

Entity ID: {input.entity_id}
Current State: {input.current_state}
Event/Trigger: {input.event}
Transition Rules: {input.rules if input.rules else "Use standard FSM logic"}
Context: {input.context}
Validate Guards: {input.validate_guards}

FSM TRANSITION RULES:
1. Transitions must be from allowed_transitions of current state
2. Guard conditions must be satisfied
3. Side effects (actions) are queued for execution
4. If no valid transition, return blocked=true

Return JSON with:
- decision: {{transition_id, from_state, to_state, transition_type (automatic|manual|conditional|timed|event_driven), is_valid, guard_conditions[], guards_passed[], guards_failed[], actions_to_execute[], reason}}
- alternative_transitions: array of alternative decisions if primary fails
- blocked: boolean (true if no valid transition)
- block_reason: string if blocked
- requires_approval: boolean (true if transition needs human approval)
- summary: transition decision summary"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are an FSM transition engine. Strictly evaluate state transitions against rules. Only allow valid transitions. Be deterministic."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            decision = TransitionDecision(**result.get("decision", {}))
            alternatives = [TransitionDecision(**a) for a in result.get("alternative_transitions", [])]

            return TransitionOutput(
                success=True,
                decision=decision,
                alternative_transitions=alternatives,
                blocked=result.get("blocked", False),
                block_reason=result.get("block_reason"),
                requires_approval=result.get("requires_approval", False),
                transition_summary=result.get("summary", ""),
                confidence_score=0.9,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"TransitionRunner error: {e}")
            return TransitionOutput(
                success=False,
                blocked=True,
                error=str(e),
                transition_summary="Transition evaluation failed - blocking for safety",
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}


# =============================================================================
# ACTION RUNNER (SOP Execution)
# =============================================================================

class ActionInput(TaskRunnerInput):
    """Input for executing a state action."""
    state: str = Field(..., description="Current state")
    action_name: str = Field(..., description="Name of the action to execute")
    action_type: str = Field(default="entry", description="entry | exit | transition | do")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Action parameters")
    sop_reference: Optional[str] = Field(default=None, description="Reference to SOP document")
    timeout_seconds: int = Field(default=60, description="Action timeout")


class ActionStep(TaskRunnerOutput):
    """A step in the action execution."""
    step_number: int = Field(default=0)
    instruction: str = Field(default="")
    expected_outcome: str = Field(default="")
    verification: str = Field(default="")
    completed: bool = Field(default=False)
    result: str = Field(default="")


class ActionOutput(TaskRunnerOutput):
    """Output from action execution."""
    action_name: str = Field(default="")
    action_type: str = Field(default="")
    status: str = Field(default="", description="success | failed | partial | timeout")
    steps_executed: List[ActionStep] = Field(default_factory=list)
    outputs: Dict[str, Any] = Field(default_factory=dict)
    side_effects: List[str] = Field(default_factory=list)
    next_actions: List[str] = Field(default_factory=list)
    action_summary: str = Field(default="")


@register_task_runner
class ActionRunner(BaseTaskRunner[ActionInput, ActionOutput]):
    """
    Execute state actions following SOP (FSM: Action).

    Executes actions associated with FSM states:
    - Entry actions: Run when entering a state
    - Exit actions: Run when leaving a state
    - Transition actions: Run during transition
    - Do actions: Run while in state (activities)

    Follows Standard Operating Procedures for consistency.
    """
    runner_id = "action"
    name = "Action Runner"
    description = "Execute state action using SOP execution"
    category = TaskRunnerCategory.EXECUTE
    algorithmic_core = "sop_execution"
    max_duration_seconds = 120
    InputType = ActionInput
    OutputType = ActionOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.1, max_tokens=3000)

    async def execute(self, input: ActionInput) -> ActionOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Execute a state action following SOP.

State: {input.state}
Action Name: {input.action_name}
Action Type: {input.action_type} (entry=when entering state, exit=when leaving, transition=during, do=while in state)
Parameters: {input.parameters}
SOP Reference: {input.sop_reference or "Standard procedures"}
Timeout: {input.timeout_seconds}s

SOP EXECUTION PROTOCOL:
1. Parse SOP into discrete steps
2. Execute each step in sequence
3. Verify expected outcome after each step
4. Handle failures gracefully
5. Document all outputs and side effects

Return JSON with:
- action_name: string
- action_type: string
- status: "success" | "failed" | "partial" | "timeout"
- steps_executed: array of {{step_number, instruction, expected_outcome, verification, completed, result}}
- outputs: dict of action outputs
- side_effects: array of side effects produced
- next_actions: array of follow-up actions to queue
- summary: execution summary"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are an SOP execution engine. Execute actions methodically following standard procedures. Document every step and outcome. Fail gracefully."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            steps = [ActionStep(**s) for s in result.get("steps_executed", [])]
            completed_steps = len([s for s in steps if s.completed])

            return ActionOutput(
                success=True,
                action_name=result.get("action_name", input.action_name),
                action_type=result.get("action_type", input.action_type),
                status=result.get("status", "success"),
                steps_executed=steps,
                outputs=result.get("outputs", {}),
                side_effects=result.get("side_effects", []),
                next_actions=result.get("next_actions", []),
                action_summary=result.get("summary", ""),
                confidence_score=0.9 if result.get("status") == "success" else 0.6,
                quality_score=completed_steps / max(len(steps), 1),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"ActionRunner error: {e}")
            return ActionOutput(
                success=False,
                status="failed",
                error=str(e),
                action_summary="Action execution failed",
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}


# =============================================================================
# HITL ESCALATE RUNNER (Human-in-the-Loop Handoff)
# =============================================================================

class HITLEscalateInput(TaskRunnerInput):
    """Input for HITL escalation."""
    issue: str = Field(..., description="Issue requiring human intervention")
    context: Dict[str, Any] = Field(default_factory=dict, description="Full context of the situation")
    process_state: str = Field(default="", description="Current state of the process")
    attempted_actions: List[str] = Field(default_factory=list, description="Actions already attempted")
    urgency: str = Field(default="standard", description="low | standard | high | critical")
    required_expertise: List[str] = Field(default_factory=list, description="Expertise needed")
    suggested_resolution: Optional[str] = Field(default=None, description="AI-suggested resolution")


class HITLTicket(TaskRunnerOutput):
    """A HITL escalation ticket."""
    ticket_id: str = Field(default="")
    issue_summary: str = Field(default="")
    full_context: str = Field(default="")
    urgency_level: str = Field(default="standard")
    assigned_to: Optional[str] = Field(default=None)
    expertise_required: List[str] = Field(default_factory=list)
    ai_recommendation: str = Field(default="")
    decision_options: List[str] = Field(default_factory=list)
    timeout: str = Field(default="")
    fallback_action: str = Field(default="")


class HITLEscalateOutput(TaskRunnerOutput):
    """Output from HITL escalation."""
    ticket: HITLTicket = Field(default_factory=HITLTicket)
    escalation_channel: str = Field(default="", description="email | slack | pagerduty | queue")
    expected_response_time: str = Field(default="")
    process_paused: bool = Field(default=True)
    resume_trigger: str = Field(default="")
    hitl_escalate_summary: str = Field(default="")


@register_task_runner
class HITLEscalateRunner(BaseTaskRunner[HITLEscalateInput, HITLEscalateOutput]):
    """
    Escalate to human when AI cannot proceed (FSM: HITL Handoff).

    Creates a structured handoff when:
    - AI confidence is too low to proceed
    - Policy requires human approval
    - Edge case not covered by rules
    - High-stakes decision needed

    Provides full context for efficient human decision-making.
    """
    runner_id = "hitl_escalate"
    name = "HITL Escalate Runner"
    description = "Escalate to human using HITL handoff"
    category = TaskRunnerCategory.EXECUTE
    algorithmic_core = "hitl_handoff"
    max_duration_seconds = 30
    InputType = HITLEscalateInput
    OutputType = HITLEscalateOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=2500)

    async def execute(self, input: HITLEscalateInput) -> HITLEscalateOutput:
        start_time = datetime.utcnow()
        try:
            import uuid

            prompt = f"""Create a HITL (Human-in-the-Loop) escalation ticket.

Issue: {input.issue}
Context: {input.context}
Process State: {input.process_state}
Attempted Actions: {input.attempted_actions}
Urgency: {input.urgency}
Required Expertise: {input.required_expertise}
AI Suggestion: {input.suggested_resolution}

HITL HANDOFF PROTOCOL:
1. Summarize issue clearly for human
2. Provide full context needed for decision
3. Suggest resolution options (not just one)
4. Set appropriate timeout with fallback
5. Pause process until human responds

Return JSON with:
- ticket: {{ticket_id, issue_summary, full_context, urgency_level, assigned_to, expertise_required[], ai_recommendation, decision_options[], timeout, fallback_action}}
- escalation_channel: "email" | "slack" | "pagerduty" | "queue"
- expected_response_time: string
- process_paused: boolean
- resume_trigger: how to resume after human decision
- summary: escalation summary"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You create HITL escalation tickets. Provide clear, actionable information for humans. Suggest multiple options, not just one. Set realistic timeouts."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            ticket_data = result.get("ticket", {})
            ticket_data["ticket_id"] = ticket_data.get("ticket_id", str(uuid.uuid4())[:8])
            ticket = HITLTicket(**ticket_data)

            # Determine channel based on urgency
            channel = result.get("escalation_channel", "queue")
            if input.urgency == "critical":
                channel = "pagerduty"
            elif input.urgency == "high":
                channel = "slack"

            return HITLEscalateOutput(
                success=True,
                ticket=ticket,
                escalation_channel=channel,
                expected_response_time=result.get("expected_response_time", "24h"),
                process_paused=True,
                resume_trigger=result.get("resume_trigger", "human_decision"),
                hitl_escalate_summary=result.get("summary", ""),
                confidence_score=0.95,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"HITLEscalateRunner error: {e}")
            return HITLEscalateOutput(
                success=False,
                process_paused=True,  # Still pause on error for safety
                error=str(e),
                hitl_escalate_summary="HITL escalation failed - manual intervention required",
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}


__all__ = [
    # Original EXECUTE runners (Operations Management)
    "TaskExecuteRunner", "TaskExecuteInput", "TaskExecuteOutput", "TaskStep",
    "CoordinateRunner", "CoordinateInput", "CoordinateOutput", "CoordinationPlan",
    "MonitorProgressRunner", "MonitorProgressInput", "MonitorProgressOutput", "ProgressMetric",
    "EscalateRunner", "EscalateInput", "EscalateOutput", "EscalationPath",
    # FSM / Business Process Automation runners
    "ProcessState", "TransitionType",
    "StateReadRunner", "StateReadInput", "StateReadOutput", "StateInfo", "StateHistory",
    "TransitionRunner", "TransitionInput", "TransitionOutput", "TransitionDecision",
    "ActionRunner", "ActionInput", "ActionOutput", "ActionStep",
    "HITLEscalateRunner", "HITLEscalateInput", "HITLEscalateOutput", "HITLTicket",
]
