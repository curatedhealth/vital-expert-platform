# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-15
# MODES_SUPPORTED: [3]
# DEPENDENCIES: [openai, core.security]
"""
Mode 3 Preparation Routes - LLM-Powered HITL Checkpoint Preparation

These endpoints provide LLM-powered preparation for the 4-checkpoint journey:
- POST /api/mode3/parse-goals     -> Parse prompt into structured goals
- POST /api/mode3/generate-plan   -> Generate execution plan from goals
- POST /api/mode3/assemble-team   -> Assemble team and deliverables

These are called BEFORE mission creation to give users visibility and control
over the mission configuration at each checkpoint.
"""

import json
import uuid
import structlog
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from core.security import InputSanitizer, check_rate_limit_or_raise

logger = structlog.get_logger()

router = APIRouter(prefix="/api/mode3", tags=["mode3-preparation"])


# ============================================================================
# Request/Response Models
# ============================================================================

class ParseGoalsRequest(BaseModel):
    """Request to parse user prompt into mission goals."""
    prompt: str = Field(..., min_length=10, max_length=10000)
    agent_id: Optional[str] = None


class MissionGoal(BaseModel):
    """A parsed mission goal."""
    id: str
    description: str
    priority: str = "medium"  # high, medium, low
    status: str = "pending"
    success_criteria: Optional[List[str]] = None
    estimated_complexity: Optional[str] = None  # simple, moderate, complex


class ParseGoalsResponse(BaseModel):
    """Response with parsed goals."""
    goals: List[MissionGoal]
    summary: str
    estimated_duration_minutes: int


class GeneratePlanRequest(BaseModel):
    """Request to generate execution plan from goals.

    Accepts goals in two formats for frontend flexibility:
    1. List[MissionGoal] - Full goal objects with id, description, priority, etc.
    2. List[str] - Simple strings that will be converted to MissionGoal objects
    """
    goals: List[Any]  # Accept either MissionGoal objects or strings
    agent_id: Optional[str] = None

    def get_normalized_goals(self) -> List[MissionGoal]:
        """Normalize goals to MissionGoal objects, handling both formats."""
        normalized = []
        for i, goal in enumerate(self.goals):
            if isinstance(goal, dict):
                # Already a dict/object - validate and use
                normalized.append(MissionGoal(
                    id=goal.get("id", f"goal_{i+1}"),
                    description=goal.get("description", goal.get("text", "")),
                    priority=goal.get("priority", "medium"),
                    status=goal.get("status", "pending"),
                    success_criteria=goal.get("success_criteria"),
                    estimated_complexity=goal.get("estimated_complexity"),
                ))
            elif isinstance(goal, str):
                # String - convert to MissionGoal
                normalized.append(MissionGoal(
                    id=f"goal_{i+1}",
                    description=goal,
                    priority="medium",
                    status="pending",
                ))
            elif isinstance(goal, MissionGoal):
                # Already a MissionGoal
                normalized.append(goal)
        return normalized


class PlanTask(BaseModel):
    """A task within a plan phase."""
    id: str
    name: str
    type: str  # research, analysis, synthesis, generation, validation
    status: str = "pending"
    estimated_minutes: Optional[int] = None


class PlanPhase(BaseModel):
    """A phase in the execution plan."""
    id: str
    name: str
    description: str
    tasks: List[PlanTask]
    status: str = "pending"
    dependencies: Optional[List[str]] = None


class GeneratePlanResponse(BaseModel):
    """Response with execution plan."""
    phases: List[PlanPhase]
    total_tasks: int
    estimated_duration_minutes: int


class AssembleTeamRequest(BaseModel):
    """Request to assemble team for the mission.

    Accepts plan in flexible format for frontend compatibility.
    """
    plan: List[Any]  # Accept either PlanPhase objects or dicts
    agent_id: str
    goals: Optional[List[Any]] = None  # Accept either MissionGoal objects or strings

    def get_normalized_plan(self) -> List[PlanPhase]:
        """Normalize plan to PlanPhase objects."""
        normalized = []
        for i, phase in enumerate(self.plan):
            if isinstance(phase, dict):
                # Parse tasks from various formats
                tasks_raw = phase.get("tasks", phase.get("steps", []))
                tasks = []
                for j, task in enumerate(tasks_raw):
                    if isinstance(task, dict):
                        tasks.append(PlanTask(
                            id=task.get("id", f"task_{i+1}_{j+1}"),
                            name=task.get("name", ""),
                            type=task.get("type", task.get("description", "research")),
                            status=task.get("status", "pending"),
                            estimated_minutes=task.get("estimated_minutes", task.get("estimated_duration_minutes", 15)),
                        ))
                    elif isinstance(task, str):
                        tasks.append(PlanTask(
                            id=f"task_{i+1}_{j+1}",
                            name=task,
                            type="research",
                            status="pending",
                        ))

                normalized.append(PlanPhase(
                    id=phase.get("id", f"phase_{i+1}"),
                    name=phase.get("name", f"Phase {i+1}"),
                    description=phase.get("description", ""),
                    tasks=tasks,
                    status=phase.get("status", "pending"),
                    dependencies=phase.get("dependencies"),
                ))
            elif isinstance(phase, PlanPhase):
                normalized.append(phase)
        return normalized


class TeamMember(BaseModel):
    """A team member for the mission."""
    id: str
    role: str
    name: str
    capabilities: List[str]
    assigned_phases: Optional[List[str]] = None


class Deliverable(BaseModel):
    """An expected deliverable from the mission."""
    id: str
    name: str
    type: str  # document, analysis, recommendation, diagram, data
    description: Optional[str] = None
    status: str = "pending"
    phase_id: Optional[str] = None


class AssembleTeamResponse(BaseModel):
    """Response with team and deliverables."""
    team: List[TeamMember]
    deliverables: List[Deliverable]
    resource_summary: str


# ============================================================================
# LLM Helper
# ============================================================================

async def call_llm_for_parsing(
    system_prompt: str,
    user_prompt: str,
    response_format: str = "json"
) -> Dict[str, Any]:
    """
    Call LLM for structured parsing.
    Uses OpenAI GPT-4o for reliable JSON output with JSON mode support.
    """
    import os
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    # Use gpt-4o which supports JSON mode
    model = "gpt-4o"

    # Add JSON instruction to system prompt for reliable parsing
    json_system_prompt = system_prompt + "\n\nIMPORTANT: You must respond with valid JSON only. No markdown, no explanations outside the JSON."

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": json_system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"} if response_format == "json" else None
        )

        content = response.choices[0].message.content
        if response_format == "json":
            return json.loads(content)
        return {"text": content}

    except json.JSONDecodeError as e:
        logger.error("llm_json_parse_error", error=str(e), content=content[:500] if content else "")
        raise HTTPException(status_code=500, detail=f"LLM returned invalid JSON: {str(e)}")
    except Exception as e:
        logger.error("llm_parsing_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"LLM parsing failed: {str(e)}")


# ============================================================================
# Routes
# ============================================================================

@router.post("/parse-goals", response_model=ParseGoalsResponse)
async def parse_goals(
    request: ParseGoalsRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    HITL Checkpoint 1 Preparation: Parse user prompt into structured mission goals.

    Uses LLM to extract:
    - Clear, actionable goals from the prompt
    - Priority ranking
    - Success criteria for each goal
    - Complexity estimation
    """
    correlation_id = str(uuid.uuid4())[:8]
    logger.info("mode3_parse_goals_started", correlation_id=correlation_id)

    # Rate limiting
    rate_limit_id = x_tenant_id or x_user_id or "anonymous"
    check_rate_limit_or_raise(rate_limit_id, endpoint="mode3_parse_goals")

    # Sanitize input
    sanitized_prompt = InputSanitizer.sanitize_text(request.prompt, max_length=10000)

    system_prompt = """You are an expert research mission planner. Analyze the user's research request and extract clear, actionable goals.

For each goal, provide:
- id: A unique identifier (goal_1, goal_2, etc.)
- description: A clear, specific description of what needs to be achieved
- priority: "high", "medium", or "low" based on importance
- success_criteria: List of measurable criteria to determine if the goal is met
- estimated_complexity: "simple", "moderate", or "complex"

Return JSON in this format:
{
  "goals": [...],
  "summary": "Brief summary of the research mission",
  "estimated_duration_minutes": <number>
}

Focus on extracting distinct, non-overlapping goals. Prioritize based on the user's explicit emphasis and logical dependencies."""

    result = await call_llm_for_parsing(system_prompt, sanitized_prompt)

    # Parse and validate response
    goals = []
    for i, goal_data in enumerate(result.get("goals", [])):
        goals.append(MissionGoal(
            id=goal_data.get("id", f"goal_{i+1}"),
            description=goal_data.get("description", ""),
            priority=goal_data.get("priority", "medium"),
            status="pending",
            success_criteria=goal_data.get("success_criteria"),
            estimated_complexity=goal_data.get("estimated_complexity"),
        ))

    logger.info("mode3_parse_goals_completed",
                correlation_id=correlation_id,
                goals_count=len(goals))

    return ParseGoalsResponse(
        goals=goals,
        summary=result.get("summary", "Research mission"),
        estimated_duration_minutes=result.get("estimated_duration_minutes", 60),
    )


@router.post("/generate-plan", response_model=GeneratePlanResponse)
async def generate_plan(
    request: GeneratePlanRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    HITL Checkpoint 2 Preparation: Generate execution plan from confirmed goals.

    Uses LLM to create:
    - Phased execution plan
    - Specific tasks per phase
    - Task dependencies
    - Time estimates
    """
    correlation_id = str(uuid.uuid4())[:8]
    logger.info("mode3_generate_plan_started", correlation_id=correlation_id)

    # Rate limiting
    rate_limit_id = x_tenant_id or x_user_id or "anonymous"
    check_rate_limit_or_raise(rate_limit_id, endpoint="mode3_generate_plan")

    # Normalize goals - handles both string and object formats
    normalized_goals = request.get_normalized_goals()
    logger.info("mode3_goals_normalized",
                correlation_id=correlation_id,
                raw_count=len(request.goals),
                normalized_count=len(normalized_goals))

    # Format goals for LLM
    goals_text = "\n".join([
        f"- Goal {g.id}: {g.description} (Priority: {g.priority})"
        for g in normalized_goals
    ])

    system_prompt = """You are an expert research project planner. Create a detailed execution plan for the given research goals.

Structure the plan in phases, where each phase contains specific tasks.

Task types:
- research: Information gathering, literature review, data collection
- analysis: Data analysis, comparison, evaluation
- synthesis: Combining findings, drawing conclusions
- generation: Creating deliverables, writing reports, visualizations
- validation: Quality checks, verification, review

Return JSON in this format:
{
  "phases": [
    {
      "id": "phase_1",
      "name": "Phase Name",
      "description": "What this phase accomplishes",
      "tasks": [
        {
          "id": "task_1_1",
          "name": "Task name",
          "type": "research|analysis|synthesis|generation|validation",
          "estimated_minutes": <number>
        }
      ],
      "dependencies": ["phase_id"] or null
    }
  ],
  "total_tasks": <number>,
  "estimated_duration_minutes": <number>
}

Create a logical flow with 3-5 phases. Each phase should have 2-4 tasks."""

    user_prompt = f"Create an execution plan for these research goals:\n\n{goals_text}"

    result = await call_llm_for_parsing(system_prompt, user_prompt)

    # Parse and validate response
    phases = []
    total_tasks = 0
    for phase_data in result.get("phases", []):
        tasks = []
        for task_data in phase_data.get("tasks", []):
            tasks.append(PlanTask(
                id=task_data.get("id", f"task_{len(tasks)+1}"),
                name=task_data.get("name", ""),
                type=task_data.get("type", "research"),
                status="pending",
                estimated_minutes=task_data.get("estimated_minutes"),
            ))
            total_tasks += 1

        phases.append(PlanPhase(
            id=phase_data.get("id", f"phase_{len(phases)+1}"),
            name=phase_data.get("name", ""),
            description=phase_data.get("description", ""),
            tasks=tasks,
            status="pending",
            dependencies=phase_data.get("dependencies"),
        ))

    logger.info("mode3_generate_plan_completed",
                correlation_id=correlation_id,
                phases_count=len(phases),
                tasks_count=total_tasks)

    return GeneratePlanResponse(
        phases=phases,
        total_tasks=total_tasks,
        estimated_duration_minutes=result.get("estimated_duration_minutes", 120),
    )


@router.post("/assemble-team", response_model=AssembleTeamResponse)
async def assemble_team(
    request: AssembleTeamRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    HITL Checkpoint 3 Preparation: Assemble team and define deliverables.

    Uses LLM to determine:
    - Team composition based on plan requirements
    - Role assignments per phase
    - Expected deliverables
    """
    correlation_id = str(uuid.uuid4())[:8]
    logger.info("mode3_assemble_team_started", correlation_id=correlation_id)

    # Rate limiting
    rate_limit_id = x_tenant_id or x_user_id or "anonymous"
    check_rate_limit_or_raise(rate_limit_id, endpoint="mode3_assemble_team")

    # Normalize plan - handles both dict and PlanPhase formats
    normalized_plan = request.get_normalized_plan()
    logger.info("mode3_plan_normalized",
                correlation_id=correlation_id,
                raw_count=len(request.plan),
                normalized_count=len(normalized_plan))

    # Get agent info from database
    agent_name = "Selected Expert"
    agent_capabilities = ["research", "analysis", "synthesis"]

    try:
        from supabase import create_client
        import os
        supabase = create_client(
            os.environ.get("SUPABASE_URL"),
            os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
        )
        result = supabase.table("agents").select("name, display_name, capabilities").eq("id", request.agent_id).single().execute()
        if result.data:
            agent_name = result.data.get("display_name") or result.data.get("name", "Selected Expert")
            agent_capabilities = result.data.get("capabilities") or ["research", "analysis", "synthesis"]
    except Exception as e:
        logger.warning("mode3_agent_lookup_failed", error=str(e))

    # Format plan for LLM
    plan_text = "\n".join([
        f"Phase {p.id}: {p.name}\n  Tasks: " + ", ".join([t.name for t in p.tasks])
        for p in normalized_plan
    ])

    system_prompt = """You are an expert at defining research deliverables. Based on the execution plan, define the expected deliverables.

Deliverable types (use only these exact values):
- markdown: Written reports, summaries, white papers, analysis documents
- csv: Data tables, spreadsheets, structured datasets
- json: Structured data, API outputs, configuration files
- pdf: Formatted documents, presentations, final reports
- pptx: Slide presentations, visual summaries

Return JSON in this format:
{
  "deliverables": [
    {
      "id": "deliverable_1",
      "name": "Deliverable name",
      "type": "markdown|csv|json|pdf|pptx",
      "description": "What this deliverable contains",
      "phase_id": "phase_id that produces this"
    }
  ],
  "resource_summary": "Brief summary of team and resource needs"
}

Create 3-6 concrete deliverables that address the research goals. Use "markdown" for text-based reports and analysis."""

    user_prompt = f"Define deliverables for this research plan:\n\n{plan_text}"

    result = await call_llm_for_parsing(system_prompt, user_prompt)

    # Build team (lead expert + inferred support)
    team = [
        TeamMember(
            id=request.agent_id,
            role="Lead Expert",
            name=agent_name,
            capabilities=agent_capabilities if isinstance(agent_capabilities, list) else ["research", "analysis"],
            assigned_phases=[p.id for p in normalized_plan],
        )
    ]

    # Parse deliverables
    deliverables = []
    for d in result.get("deliverables", []):
        deliverables.append(Deliverable(
            id=d.get("id", f"deliverable_{len(deliverables)+1}"),
            name=d.get("name", ""),
            type=d.get("type", "document"),
            description=d.get("description"),
            status="pending",
            phase_id=d.get("phase_id"),
        ))

    logger.info("mode3_assemble_team_completed",
                correlation_id=correlation_id,
                team_size=len(team),
                deliverables_count=len(deliverables))

    return AssembleTeamResponse(
        team=team,
        deliverables=deliverables,
        resource_summary=result.get("resource_summary", f"Mission led by {agent_name}"),
    )
