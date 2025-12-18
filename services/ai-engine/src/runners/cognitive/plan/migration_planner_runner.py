"""
MigrationPlannerRunner - Plan product/portfolio migration using pathway planning.

Algorithmic Core: Migration Pathway Planning
- Develops phased migration strategies
- Manages transition dependencies
- Minimizes customer disruption
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class MigrationPhase(TaskRunnerOutput):
    """Migration phase definition."""
    phase_name: str = Field(default="", description="Phase name")
    phase_duration: str = Field(default="", description="Duration")
    activities: List[str] = Field(default_factory=list, description="Key activities")
    deliverables: List[str] = Field(default_factory=list, description="Deliverables")
    dependencies: List[str] = Field(default_factory=list, description="Prerequisites")
    risks: List[str] = Field(default_factory=list, description="Phase risks")


class MigrationPlannerInput(TaskRunnerInput):
    """Input schema for MigrationPlannerRunner."""
    current_state: Dict[str, Any] = Field(default_factory=dict, description="Current portfolio state")
    target_state: Dict[str, Any] = Field(default_factory=dict, description="Target portfolio state")
    constraints: List[str] = Field(default_factory=list, description="Migration constraints")


class MigrationPlannerOutput(TaskRunnerOutput):
    """Output schema for MigrationPlannerRunner."""
    migration_plan: Dict[str, Any] = Field(default_factory=dict, description="Overall migration plan")
    phases: List[MigrationPhase] = Field(default_factory=list, description="Migration phases")
    migration_risks: List[Dict[str, Any]] = Field(default_factory=list, description="Migration risks")
    critical_path: List[str] = Field(default_factory=list, description="Critical path items")


@register_task_runner
class MigrationPlannerRunner(TaskRunner[MigrationPlannerInput, MigrationPlannerOutput]):
    """Plan product/portfolio migration."""

    runner_id = "migration_planner"
    category = TaskRunnerCategory.PLAN
    algorithmic_core = "migration_pathway_planning"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: MigrationPlannerInput) -> MigrationPlannerOutput:
        """Execute migration planning."""
        logger.info("Executing MigrationPlannerRunner")

        prompt = """Create phased migration plan from current to target state.
1. MIGRATION_PLAN: strategy (immediate|phased|parallel), timeline, key_milestones[], communication_plan
2. PHASES: phase_name, phase_duration, activities[], deliverables[], dependencies[], risks[]
3. MIGRATION_RISKS: risk_description, likelihood, impact, mitigation
4. CRITICAL_PATH: Items that must complete on time
Return JSON: migration_plan{}, phases[], migration_risks[], critical_path[]"""

        context = f"Current: {input_data.current_state}\nTarget: {input_data.target_state}\nConstraints: {input_data.constraints}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return MigrationPlannerOutput(
                migration_plan=result.get("migration_plan", {}),
                phases=[MigrationPhase(**p) for p in result.get("phases", [])],
                migration_risks=result.get("migration_risks", []),
                critical_path=result.get("critical_path", []),
                quality_score=0.8 if result.get("phases") else 0.4,
            )
        except Exception as e:
            logger.error(f"MigrationPlannerRunner failed: {e}")
            return MigrationPlannerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["MigrationPlannerRunner", "MigrationPlannerInput", "MigrationPlannerOutput", "MigrationPhase"]
