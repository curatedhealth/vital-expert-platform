"""
DecomposeRunner - Break down goal using HTN decomposition.

Algorithmic Core: Hierarchical Task Network (HTN) Decomposition
- Recursively breaks complex goals into sub-tasks
- Creates hierarchical task structure
- Identifies primitive (atomic) vs compound tasks

Use Cases:
- Project planning
- Goal decomposition
- Work breakdown structure
- Sprint planning
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

class DecomposeInput(TaskRunnerInput):
    """Input schema for DecomposeRunner."""

    goal: str = Field(
        ...,
        description="Goal to decompose"
    )
    context: Optional[str] = Field(
        default=None,
        description="Context for decomposition"
    )
    decomposition_depth: int = Field(
        default=3,
        description="Maximum depth of decomposition (1-5)"
    )
    granularity: str = Field(
        default="standard",
        description="Granularity: coarse | standard | fine"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Constraints to consider"
    )
    domain: str = Field(
        default="general",
        description="Domain: general | software | research | business | project"
    )


class DecomposedTask(TaskRunnerOutput):
    """A decomposed task in the hierarchy."""

    task_id: str = Field(default="", description="Task ID")
    task_name: str = Field(default="", description="Task name")
    task_description: str = Field(default="", description="Task description")
    parent_id: Optional[str] = Field(default=None, description="Parent task ID")
    level: int = Field(default=0, description="Hierarchy level (0=root)")
    task_type: str = Field(
        default="compound",
        description="primitive (atomic) | compound (has subtasks)"
    )
    estimated_effort: str = Field(
        default="medium",
        description="Effort: trivial | small | medium | large | xlarge"
    )
    skills_required: List[str] = Field(
        default_factory=list,
        description="Skills needed"
    )
    deliverables: List[str] = Field(
        default_factory=list,
        description="Expected outputs"
    )
    acceptance_criteria: List[str] = Field(
        default_factory=list,
        description="Criteria for completion"
    )


class DecomposeOutput(TaskRunnerOutput):
    """Output schema for DecomposeRunner."""

    tasks: List[DecomposedTask] = Field(
        default_factory=list,
        description="All decomposed tasks"
    )
    root_task: Optional[DecomposedTask] = Field(
        default=None,
        description="Root task"
    )
    primitive_tasks: List[DecomposedTask] = Field(
        default_factory=list,
        description="Atomic/primitive tasks"
    )
    compound_tasks: List[DecomposedTask] = Field(
        default_factory=list,
        description="Compound tasks with subtasks"
    )
    task_hierarchy: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Hierarchy {parent_id: [child_ids]}"
    )
    total_tasks: int = Field(default=0, description="Total task count")
    max_depth_reached: int = Field(default=0, description="Actual max depth")
    decomposition_summary: str = Field(default="", description="Summary")
    estimated_total_effort: str = Field(
        default="",
        description="Total effort estimate"
    )


# =============================================================================
# DecomposeRunner Implementation
# =============================================================================

@register_task_runner
class DecomposeRunner(TaskRunner[DecomposeInput, DecomposeOutput]):
    """
    Hierarchical Task Network decomposition runner.

    This runner breaks down complex goals into hierarchical
    task structures.

    Algorithmic Pattern (HTN):
        1. Parse goal as root task
        2. Identify if compound or primitive
        3. If compound, recursively decompose:
           - Apply domain methods
           - Create subtasks
           - Link to parent
        4. Continue until:
           - Reach primitive tasks
           - Hit depth limit
        5. Calculate effort estimates

    Best Used For:
        - Project planning
        - Sprint planning
        - Work breakdown
        - Goal structuring
    """

    runner_id = "decompose"
    name = "Decompose Runner"
    description = "Break down goal using HTN decomposition"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "htn_decomposition"
    max_duration_seconds = 150

    InputType = DecomposeInput
    OutputType = DecomposeOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize DecomposeRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: DecomposeInput) -> DecomposeOutput:
        """
        Execute HTN decomposition.

        Args:
            input: Decomposition parameters

        Returns:
            DecomposeOutput with task hierarchy
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            constraints_text = ""
            if input.constraints:
                constraints_text = "\nConstraints:\n" + "\n".join(
                    f"- {c}" for c in input.constraints
                )

            granularity_instruction = self._get_granularity_instruction(input.granularity)
            domain_instruction = self._get_domain_instruction(input.domain)

            system_prompt = f"""You are an expert planner using Hierarchical Task Network (HTN) decomposition.

Your task is to break down a goal into a hierarchical task structure.

Decomposition depth: {input.decomposition_depth}
Granularity: {input.granularity}
{granularity_instruction}
Domain: {input.domain}
{domain_instruction}

HTN decomposition approach:
1. Create root task from goal
2. Determine if primitive or compound:
   - primitive: Cannot be broken down further, directly executable
   - compound: Has subtasks that need decomposition
3. For compound tasks:
   - Identify logical subtasks
   - Apply domain-specific methods
   - Ensure MECE (Mutually Exclusive, Collectively Exhaustive)
4. Recurse until:
   - Tasks are primitive
   - Depth limit reached
5. For each task:
   - Estimate effort
   - Identify skills needed
   - Define deliverables
   - Set acceptance criteria
6. Effort levels: trivial (<1h), small (1-4h), medium (4-8h), large (1-3d), xlarge (3d+)

Return a structured JSON response with:
- tasks: Array with:
  - task_id: T1, T1.1, T1.1.1, etc. (hierarchical)
  - task_name: Short name
  - task_description: Description
  - parent_id: Parent task ID (null for root)
  - level: Depth level (0=root)
  - task_type: primitive | compound
  - estimated_effort: trivial | small | medium | large | xlarge
  - skills_required: Skills needed
  - deliverables: Expected outputs
  - acceptance_criteria: Completion criteria
- task_hierarchy: {{parent_id: [child_ids]}}
- total_tasks: Count
- max_depth_reached: Actual max depth
- decomposition_summary: 2-3 sentence summary
- estimated_total_effort: Total effort"""

            user_prompt = f"""Decompose this goal:

GOAL: {input.goal}
{context_text}
{constraints_text}

Break down into tasks and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_decompose_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build tasks
            tasks_data = result.get("tasks", [])
            tasks = [
                DecomposedTask(
                    task_id=t.get("task_id", f"T{idx+1}"),
                    task_name=t.get("task_name", ""),
                    task_description=t.get("task_description", ""),
                    parent_id=t.get("parent_id"),
                    level=int(t.get("level", 0)),
                    task_type=t.get("task_type", "compound"),
                    estimated_effort=t.get("estimated_effort", "medium"),
                    skills_required=t.get("skills_required", []),
                    deliverables=t.get("deliverables", []),
                    acceptance_criteria=t.get("acceptance_criteria", []),
                )
                for idx, t in enumerate(tasks_data)
            ]

            # Separate root, primitive, and compound
            root = next((t for t in tasks if t.parent_id is None), None)
            primitive = [t for t in tasks if t.task_type == "primitive"]
            compound = [t for t in tasks if t.task_type == "compound"]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return DecomposeOutput(
                success=True,
                tasks=tasks,
                root_task=root,
                primitive_tasks=primitive,
                compound_tasks=compound,
                task_hierarchy=result.get("task_hierarchy", {}),
                total_tasks=len(tasks),
                max_depth_reached=result.get("max_depth_reached", 0),
                decomposition_summary=result.get("decomposition_summary", ""),
                estimated_total_effort=result.get("estimated_total_effort", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"DecomposeRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return DecomposeOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_granularity_instruction(self, granularity: str) -> str:
        """Get granularity instruction."""
        instructions = {
            "coarse": "Coarse: Large chunks, 3-5 top-level tasks only.",
            "standard": "Standard: Balanced breakdown, actionable tasks.",
            "fine": "Fine: Detailed breakdown, smallest actionable units.",
        }
        return instructions.get(granularity, instructions["standard"])

    def _get_domain_instruction(self, domain: str) -> str:
        """Get domain instruction."""
        instructions = {
            "general": "General: Apply common planning methods.",
            "software": "Software: Use SDLC phases (design, implement, test, deploy).",
            "research": "Research: Use research phases (literature, method, analysis, write).",
            "business": "Business: Use business process methods (analyze, design, execute).",
            "project": "Project: Use PM phases (initiate, plan, execute, monitor, close).",
        }
        return instructions.get(domain, instructions["general"])

    def _parse_decompose_response(self, content: str) -> Dict[str, Any]:
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
                "tasks": [],
                "task_hierarchy": {},
                "total_tasks": 0,
                "max_depth_reached": 0,
                "decomposition_summary": content[:200],
                "estimated_total_effort": "",
            }
