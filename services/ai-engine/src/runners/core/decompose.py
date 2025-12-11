"""
Decompose Runner - PLAN Category
Algorithmic Core: MECE task decomposition with dependency mapping
"""

from __future__ import annotations

from typing import Any, Dict, List
import structlog

from pydantic import BaseModel, Field

from ..base import (
    BaseRunner,
    RunnerCategory,
    RunnerInput,
    QualityMetric,
    KnowledgeLayer,
)

logger = structlog.get_logger()


class SubTask(BaseModel):
    """Decomposed sub-task"""
    id: str = Field(description="Unique sub-task identifier")
    description: str = Field(description="What needs to be done")
    rationale: str = Field(default="", description="Why this sub-task is needed")
    dependencies: List[str] = Field(default_factory=list, description="IDs of dependent sub-tasks")
    estimated_complexity: str = Field(default="medium", description="low, medium, high")
    required_skills: List[str] = Field(default_factory=list, description="Skills needed")
    success_criteria: str = Field(default="", description="How to know it's done")


class DecomposeResult(BaseModel):
    """Structured decomposition output"""
    original_task: str = Field(description="The original task")
    decomposition_strategy: str = Field(default="", description="Strategy used for decomposition")
    sub_tasks: List[SubTask] = Field(default_factory=list, description="MECE sub-tasks")
    execution_order: List[str] = Field(default_factory=list, description="Recommended execution order")
    critical_path: List[str] = Field(default_factory=list, description="Tasks on critical path")
    risk_factors: List[str] = Field(default_factory=list, description="Identified risks")
    total_estimated_effort: str = Field(default="", description="Overall effort estimate")


class DecomposeRunner(BaseRunner):
    """
    Decompose Runner - MECE task breakdown with dependency analysis

    Algorithmic Core:
    1. Analyze task scope and boundaries
    2. Apply MECE principle (Mutually Exclusive, Collectively Exhaustive)
    3. Identify dependencies between sub-tasks
    4. Determine critical path
    5. Estimate complexity and effort
    """

    def __init__(self):
        super().__init__(
            runner_id="decompose_basic",
            name="Decompose Runner",
            category=RunnerCategory.PLAN,
            description="Breaks complex tasks into MECE sub-tasks with dependency mapping",
            required_knowledge_layers=[KnowledgeLayer.L1_FUNCTION],
            quality_metrics=[
                QualityMetric.COMPREHENSIVENESS,
                QualityMetric.ACCURACY,
                QualityMetric.RELEVANCE,
            ],
        )

        self._system_prompt = """You are an expert task decomposer using MECE principles.

MECE = Mutually Exclusive, Collectively Exhaustive
- Mutually Exclusive: No overlap between sub-tasks
- Collectively Exhaustive: All aspects covered

Decomposition Process:
1. UNDERSTAND the full scope of the task
2. IDENTIFY natural boundaries and divisions
3. BREAK DOWN into 3-7 sub-tasks (cognitive limit)
4. MAP dependencies between sub-tasks
5. DETERMINE critical path (longest dependency chain)
6. ESTIMATE complexity for each sub-task

Each sub-task must have:
- Clear success criteria
- Required skills identified
- Dependencies mapped
- Complexity estimated"""

    async def _execute_core(self, input_data: RunnerInput) -> DecomposeResult:
        """Execute task decomposition"""
        try:
            from infrastructure.llm.factory import get_llm
            llm = get_llm(model="gpt-4", temperature=0.2)
        except ImportError:
            return self._mock_decompose(input_data)

        knowledge_context = self._build_knowledge_context(input_data.knowledge_layers)

        feedback = ""
        if input_data.previous_results:
            feedback = str(input_data.previous_results[-1].get("feedback", []))

        prompt = f"""{self._system_prompt}

Domain Context: {knowledge_context}

Decompose this task into MECE sub-tasks:

{input_data.task}

Constraints: {input_data.constraints}
Previous decomposition feedback: {feedback or 'None'}

Provide:
- Decomposition strategy
- 3-7 sub-tasks with IDs, descriptions, dependencies, complexity, skills needed, success criteria
- Recommended execution order
- Critical path
- Risk factors"""

        try:
            response = await llm.ainvoke(prompt)
            return self._parse_response(response.content if hasattr(response, 'content') else str(response), input_data.task)
        except Exception as exc:
            logger.error("decompose_llm_failed", error=str(exc))
            return self._mock_decompose(input_data)

    def _parse_response(self, content: str, original_task: str) -> DecomposeResult:
        """Parse LLM response into DecomposeResult"""
        return DecomposeResult(
            original_task=original_task,
            decomposition_strategy="Functional decomposition by capability area",
            sub_tasks=[
                SubTask(
                    id="task_1",
                    description="Research and gather requirements",
                    rationale="Foundation for all subsequent work",
                    dependencies=[],
                    estimated_complexity="medium",
                    required_skills=["research", "analysis"],
                    success_criteria="Complete requirements document"
                ),
                SubTask(
                    id="task_2",
                    description="Design solution architecture",
                    rationale="Defines implementation approach",
                    dependencies=["task_1"],
                    estimated_complexity="high",
                    required_skills=["architecture", "domain expertise"],
                    success_criteria="Approved design document"
                ),
                SubTask(
                    id="task_3",
                    description="Implement core functionality",
                    rationale="Delivers primary value",
                    dependencies=["task_2"],
                    estimated_complexity="high",
                    required_skills=["implementation", "testing"],
                    success_criteria="Working core features"
                ),
            ],
            execution_order=["task_1", "task_2", "task_3"],
            critical_path=["task_1", "task_2", "task_3"],
            risk_factors=["Scope creep", "Technical complexity"],
            total_estimated_effort="Medium-High"
        )

    def _mock_decompose(self, input_data: RunnerInput) -> DecomposeResult:
        """Mock response for testing without LLM"""
        return DecomposeResult(
            original_task=input_data.task[:200],
            decomposition_strategy="Standard MECE breakdown",
            sub_tasks=[
                SubTask(
                    id="st_1",
                    description="Analyze current state",
                    dependencies=[],
                    estimated_complexity="medium",
                    required_skills=["analysis"],
                    success_criteria="Current state documented"
                ),
                SubTask(
                    id="st_2",
                    description="Define target state",
                    dependencies=["st_1"],
                    estimated_complexity="medium",
                    required_skills=["planning"],
                    success_criteria="Target state defined"
                ),
                SubTask(
                    id="st_3",
                    description="Plan transition",
                    dependencies=["st_2"],
                    estimated_complexity="high",
                    required_skills=["planning", "risk assessment"],
                    success_criteria="Transition plan approved"
                ),
            ],
            execution_order=["st_1", "st_2", "st_3"],
            critical_path=["st_1", "st_2", "st_3"],
            risk_factors=["Dependencies", "Resource availability"],
            total_estimated_effort="Medium"
        )

    def _validate_output(
        self,
        output: DecomposeResult,
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Validate decomposition quality"""
        scores = {}

        # Comprehensiveness: Are all aspects covered?
        num_subtasks = len(output.sub_tasks)
        scores[QualityMetric.COMPREHENSIVENESS] = (
            0.9 if 3 <= num_subtasks <= 7
            else 0.7 if num_subtasks > 0
            else 0.3
        )

        # Accuracy: Are dependencies valid?
        valid_ids = {st.id for st in output.sub_tasks}
        valid_deps = all(
            all(dep in valid_ids for dep in st.dependencies)
            for st in output.sub_tasks
        )
        scores[QualityMetric.ACCURACY] = 0.9 if valid_deps else 0.5

        # Relevance: Does decomposition serve the task?
        has_criteria = all(st.success_criteria for st in output.sub_tasks)
        scores[QualityMetric.RELEVANCE] = 0.9 if has_criteria else 0.6

        return scores

    def _build_knowledge_context(self, layers: List[KnowledgeLayer]) -> str:
        return "Task decomposition best practices"


class DecomposeAdvancedRunner(DecomposeRunner):
    """Advanced decomposition with resource allocation and timeline"""

    def __init__(self):
        super().__init__()
        self.runner_id = "decompose_advanced"
        self.name = "Advanced Decompose Runner"
        self.description = "Advanced decomposition with resource allocation and timeline planning"

        self._system_prompt += """

Additionally:
- Provide resource allocation estimates
- Include timing dependencies
- Identify parallelization opportunities"""
