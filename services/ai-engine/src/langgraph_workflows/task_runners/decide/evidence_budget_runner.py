"""
EvidenceBudgetAllocatorRunner - Allocate evidence budget.

Algorithmic Core: Budget Allocation
- Allocates budget across evidence activities
- Optimizes for strategic impact
- Balances short and long-term needs
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class BudgetAllocation(TaskRunnerOutput):
    """Budget allocation."""
    activity_id: str = Field(default="")
    activity_name: str = Field(default="")
    activity_type: str = Field(default="", description="clinical | rwe | heor | publication | congress")
    allocated_amount: float = Field(default=0.0)
    percentage_of_total: float = Field(default=0.0)
    strategic_priority: str = Field(default="medium", description="high | medium | low")
    expected_deliverables: List[str] = Field(default_factory=list)
    timeline: str = Field(default="")


class EvidenceBudgetInput(TaskRunnerInput):
    """Input schema for EvidenceBudgetAllocatorRunner."""
    total_budget: float = Field(default=0.0, description="Total available budget")
    evidence_activities: List[Dict[str, Any]] = Field(default_factory=list, description="Activities to fund")
    strategic_priorities: List[str] = Field(default_factory=list, description="Strategic priorities")


class EvidenceBudgetOutput(TaskRunnerOutput):
    """Output schema for EvidenceBudgetAllocatorRunner."""
    allocations: List[BudgetAllocation] = Field(default_factory=list, description="Budget allocations")
    allocation_summary: Dict[str, float] = Field(default_factory=dict, description="Summary by type")
    unfunded_activities: List[str] = Field(default_factory=list, description="Unfunded activities")
    optimization_notes: List[str] = Field(default_factory=list, description="Optimization notes")


@register_task_runner
class EvidenceBudgetAllocatorRunner(TaskRunner[EvidenceBudgetInput, EvidenceBudgetOutput]):
    """Allocate evidence budget."""

    runner_id = "evidence_budget_allocator"
    category = TaskRunnerCategory.DECIDE
    algorithmic_core = "budget_allocation"
    max_duration_seconds = 90
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: EvidenceBudgetInput) -> EvidenceBudgetOutput:
        logger.info("Executing EvidenceBudgetAllocatorRunner")
        prompt = f"""Allocate evidence budget:
Total budget: {input_data.total_budget}
Activities: {input_data.evidence_activities[:10]}
Priorities: {input_data.strategic_priorities}

Return JSON:
- allocations[]: activity_id, activity_name, activity_type, allocated_amount, percentage_of_total, strategic_priority, expected_deliverables[], timeline
- allocation_summary{{}}
- unfunded_activities[]
- optimization_notes[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a budget allocation expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return EvidenceBudgetOutput(
                allocations=[BudgetAllocation(**a) for a in result.get("allocations", [])],
                allocation_summary=result.get("allocation_summary", {}),
                unfunded_activities=result.get("unfunded_activities", []),
                optimization_notes=result.get("optimization_notes", []),
                quality_score=0.8 if result.get("allocations") else 0.4,
            )
        except Exception as e:
            logger.error(f"EvidenceBudgetAllocatorRunner failed: {e}")
            return EvidenceBudgetOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["EvidenceBudgetAllocatorRunner", "EvidenceBudgetInput", "EvidenceBudgetOutput", "BudgetAllocation"]
