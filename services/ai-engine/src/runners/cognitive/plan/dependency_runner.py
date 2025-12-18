"""
DependencyRunner - Map dependencies using DAG construction.

Algorithmic Core: Directed Acyclic Graph (DAG) Construction
- Identifies task dependencies
- Builds dependency graph
- Detects cycles and validates structure

Use Cases:
- Task sequencing
- Build order determination
- Project dependency mapping
- Process flow design
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

class TaskItem(TaskRunnerOutput):
    """A task for dependency analysis."""

    task_id: str = Field(default="", description="Task ID")
    task_name: str = Field(default="", description="Task name")
    deliverables: List[str] = Field(default_factory=list, description="Outputs")
    requires: List[str] = Field(default_factory=list, description="Inputs needed")


class DependencyInput(TaskRunnerInput):
    """Input schema for DependencyRunner."""

    tasks: List[Dict[str, Any]] = Field(
        ...,
        description="Tasks to analyze [{task_id, task_name, deliverables, requires}]"
    )
    dependency_types: List[str] = Field(
        default_factory=lambda: ["finish_to_start", "data", "resource"],
        description="Types: finish_to_start | start_to_start | data | resource"
    )
    infer_implicit: bool = Field(
        default=True,
        description="Infer implicit dependencies"
    )
    context: Optional[str] = Field(
        default=None,
        description="Context for dependency inference"
    )


class Dependency(TaskRunnerOutput):
    """A dependency relationship."""

    dependency_id: str = Field(default="", description="Dependency ID")
    from_task: str = Field(default="", description="Source task ID")
    to_task: str = Field(default="", description="Target task ID (depends on from)")
    dependency_type: str = Field(
        default="finish_to_start",
        description="finish_to_start | start_to_start | data | resource"
    )
    is_critical: bool = Field(default=False, description="On critical path")
    lag: int = Field(default=0, description="Lag/lead time in hours")
    rationale: str = Field(default="", description="Why this dependency exists")


class DependencyOutput(TaskRunnerOutput):
    """Output schema for DependencyRunner."""

    dependencies: List[Dependency] = Field(
        default_factory=list,
        description="All dependencies"
    )
    dependency_graph: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Adjacency list {task: [depends_on]}"
    )
    reverse_graph: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Reverse adjacency {task: [enables]}"
    )
    topological_order: List[str] = Field(
        default_factory=list,
        description="Valid execution order"
    )
    independent_tasks: List[str] = Field(
        default_factory=list,
        description="Tasks with no dependencies"
    )
    terminal_tasks: List[str] = Field(
        default_factory=list,
        description="Tasks nothing depends on"
    )
    has_cycles: bool = Field(default=False, description="Cycle detected")
    cycle_details: Optional[str] = Field(
        default=None,
        description="Cycle description if detected"
    )
    dependency_summary: str = Field(default="", description="Summary")
    max_parallel_width: int = Field(
        default=0,
        description="Maximum parallelizable tasks"
    )


# =============================================================================
# DependencyRunner Implementation
# =============================================================================

@register_task_runner
class DependencyRunner(TaskRunner[DependencyInput, DependencyOutput]):
    """
    DAG construction dependency mapping runner.

    This runner identifies and maps dependencies between
    tasks to create a directed acyclic graph.

    Algorithmic Pattern:
        1. Parse task list
        2. Identify dependencies:
           - Explicit (stated requirements)
           - Implicit (inferred from outputs/inputs)
        3. Build adjacency list (DAG)
        4. Detect cycles (should be none)
        5. Compute topological order
        6. Identify parallel opportunities

    Best Used For:
        - Task sequencing
        - Build order
        - Pipeline design
        - Critical path prep
    """

    runner_id = "dependency"
    name = "Dependency Runner"
    description = "Map dependencies using DAG construction"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "dag_construction"
    max_duration_seconds = 120

    InputType = DependencyInput
    OutputType = DependencyOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize DependencyRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3500,
        )

    async def execute(self, input: DependencyInput) -> DependencyOutput:
        """
        Execute dependency mapping.

        Args:
            input: Dependency analysis parameters

        Returns:
            DependencyOutput with dependency graph
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            tasks_text = json.dumps(input.tasks, indent=2, default=str)[:3000]

            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            types_text = ", ".join(input.dependency_types)

            system_prompt = f"""You are an expert at dependency analysis using DAG construction.

Your task is to identify and map dependencies between tasks.

Dependency types to consider: {types_text}
Infer implicit dependencies: {input.infer_implicit}

DAG construction approach:
1. For each task pair:
   - Check if explicit dependency exists
   - Check for data dependencies (output → input)
   - Check for resource dependencies
   - Infer from task names/descriptions if enabled
2. Dependency types:
   - finish_to_start: Task B cannot start until Task A finishes
   - start_to_start: Task B cannot start until Task A starts
   - data: Task B needs data produced by Task A
   - resource: Task B needs resource held by Task A
3. Build adjacency list:
   - dependency_graph: {{task: [tasks it depends on]}}
   - reverse_graph: {{task: [tasks that depend on it]}}
4. Compute topological order (valid execution sequence)
5. Detect cycles (should not exist in valid DAG)
6. Identify:
   - Independent tasks (no dependencies)
   - Terminal tasks (nothing depends on)
   - Max parallel width

Return a structured JSON response with:
- dependencies: Array with:
  - dependency_id: D1, D2, etc.
  - from_task: Source task ID
  - to_task: Target task ID (depends on from_task)
  - dependency_type: finish_to_start | start_to_start | data | resource
  - is_critical: boolean
  - lag: Hours (0 if none)
  - rationale: Why this dependency
- dependency_graph: {{task_id: [depends_on_ids]}}
- reverse_graph: {{task_id: [enables_ids]}}
- topological_order: Valid execution order
- independent_tasks: Tasks with no dependencies
- terminal_tasks: Tasks nothing depends on
- has_cycles: boolean
- cycle_details: Description if cycle found
- dependency_summary: 2-3 sentence summary
- max_parallel_width: Max tasks executable in parallel"""

            user_prompt = f"""Analyze dependencies for these tasks:

TASKS:
{tasks_text}
{context_text}

Map dependencies and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_dependency_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build dependencies
            deps_data = result.get("dependencies", [])
            dependencies = [
                Dependency(
                    dependency_id=d.get("dependency_id", f"D{idx+1}"),
                    from_task=d.get("from_task", ""),
                    to_task=d.get("to_task", ""),
                    dependency_type=d.get("dependency_type", "finish_to_start"),
                    is_critical=d.get("is_critical", False),
                    lag=int(d.get("lag", 0)),
                    rationale=d.get("rationale", ""),
                )
                for idx, d in enumerate(deps_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return DependencyOutput(
                success=True,
                dependencies=dependencies,
                dependency_graph=result.get("dependency_graph", {}),
                reverse_graph=result.get("reverse_graph", {}),
                topological_order=result.get("topological_order", []),
                independent_tasks=result.get("independent_tasks", []),
                terminal_tasks=result.get("terminal_tasks", []),
                has_cycles=result.get("has_cycles", False),
                cycle_details=result.get("cycle_details"),
                dependency_summary=result.get("dependency_summary", ""),
                max_parallel_width=result.get("max_parallel_width", 1),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"DependencyRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return DependencyOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_dependency_response(self, content: str) -> Dict[str, Any]:
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
                "dependencies": [],
                "dependency_graph": {},
                "reverse_graph": {},
                "topological_order": [],
                "independent_tasks": [],
                "terminal_tasks": [],
                "has_cycles": False,
                "cycle_details": None,
                "dependency_summary": content[:200],
                "max_parallel_width": 1,
            }
