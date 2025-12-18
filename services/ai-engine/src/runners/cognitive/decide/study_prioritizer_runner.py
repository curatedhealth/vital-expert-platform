"""
StudyPrioritizerRunner - Prioritize studies.

Algorithmic Core: Study Prioritization
- Prioritizes studies based on strategic value
- Balances feasibility with impact
- Recommends study portfolio
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class StudyPriority(TaskRunnerOutput):
    """Study priority assessment."""
    study_id: str = Field(default="")
    study_name: str = Field(default="")
    study_type: str = Field(default="")
    strategic_value_score: float = Field(default=0.0, description="0-100")
    feasibility_score: float = Field(default=0.0, description="0-100")
    priority_score: float = Field(default=0.0, description="Combined score 0-100")
    priority_rank: int = Field(default=0)
    recommendation: str = Field(default="", description="proceed | defer | reconsider | drop")
    rationale: str = Field(default="")


class StudyPrioritizerInput(TaskRunnerInput):
    """Input schema for StudyPrioritizerRunner."""
    studies: List[Dict[str, Any]] = Field(default_factory=list, description="Studies to prioritize")
    strategic_priorities: List[str] = Field(default_factory=list, description="Strategic priorities")
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, description="Resource constraints")


class StudyPrioritizerOutput(TaskRunnerOutput):
    """Output schema for StudyPrioritizerRunner."""
    priorities: List[StudyPriority] = Field(default_factory=list, description="Study priorities")
    priority_matrix: Dict[str, Any] = Field(default_factory=dict, description="Priority matrix")
    recommended_portfolio: List[str] = Field(default_factory=list, description="Recommended studies")
    deferred_studies: List[str] = Field(default_factory=list, description="Deferred studies")


@register_task_runner
class StudyPrioritizerRunner(TaskRunner[StudyPrioritizerInput, StudyPrioritizerOutput]):
    """Prioritize studies."""

    runner_id = "study_prioritizer"
    category = TaskRunnerCategory.DECIDE
    algorithmic_core = "study_prioritization"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: StudyPrioritizerInput) -> StudyPrioritizerOutput:
        logger.info("Executing StudyPrioritizerRunner")
        prompt = f"""Prioritize studies:
Studies: {input_data.studies[:10]}
Priorities: {input_data.strategic_priorities}
Constraints: {input_data.resource_constraints}

Return JSON:
- priorities[]: study_id, study_name, study_type, strategic_value_score, feasibility_score, priority_score, priority_rank, recommendation, rationale
- priority_matrix{{}}
- recommended_portfolio[]
- deferred_studies[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a research prioritization expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return StudyPrioritizerOutput(
                priorities=[StudyPriority(**p) for p in result.get("priorities", [])],
                priority_matrix=result.get("priority_matrix", {}),
                recommended_portfolio=result.get("recommended_portfolio", []),
                deferred_studies=result.get("deferred_studies", []),
                quality_score=0.8 if result.get("priorities") else 0.4,
            )
        except Exception as e:
            logger.error(f"StudyPrioritizerRunner failed: {e}")
            return StudyPrioritizerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["StudyPrioritizerRunner", "StudyPrioritizerInput", "StudyPrioritizerOutput", "StudyPriority"]
