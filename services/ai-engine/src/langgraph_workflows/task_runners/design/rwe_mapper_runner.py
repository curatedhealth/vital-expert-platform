"""
RealWorldEvidenceMapperRunner - Map real-world evidence opportunities.

Algorithmic Core: Evidence Mapping
- Maps real-world evidence opportunities
- Identifies data sources and study designs
- Prioritizes evidence generation activities
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class RWEOpportunity(TaskRunnerOutput):
    """Real-world evidence opportunity."""
    opportunity_id: str = Field(default="")
    evidence_question: str = Field(default="")
    study_type: str = Field(default="", description="retrospective | prospective | registry | claims | chart_review")
    data_sources: List[str] = Field(default_factory=list)
    feasibility_score: float = Field(default=0.0, description="0-100 feasibility")
    strategic_value: str = Field(default="medium", description="high | medium | low")
    estimated_timeline: str = Field(default="")
    key_challenges: List[str] = Field(default_factory=list)


class RWEMapperInput(TaskRunnerInput):
    """Input schema for RealWorldEvidenceMapperRunner."""
    evidence_gaps: List[Dict[str, Any]] = Field(default_factory=list, description="Evidence gaps to address")
    available_data_sources: List[str] = Field(default_factory=list, description="Available data sources")
    strategic_priorities: List[str] = Field(default_factory=list, description="Strategic priorities")


class RWEMapperOutput(TaskRunnerOutput):
    """Output schema for RealWorldEvidenceMapperRunner."""
    opportunities: List[RWEOpportunity] = Field(default_factory=list, description="RWE opportunities")
    opportunity_matrix: Dict[str, Any] = Field(default_factory=dict, description="Gap to opportunity mapping")
    data_source_strategy: Dict[str, List[str]] = Field(default_factory=dict, description="Data source strategy")
    priority_studies: List[str] = Field(default_factory=list, description="Priority studies")


@register_task_runner
class RealWorldEvidenceMapperRunner(TaskRunner[RWEMapperInput, RWEMapperOutput]):
    """Map real-world evidence opportunities."""

    runner_id = "real_world_evidence_mapper"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "rwe_opportunity_mapping"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: RWEMapperInput) -> RWEMapperOutput:
        logger.info("Executing RealWorldEvidenceMapperRunner")
        prompt = f"""Map real-world evidence opportunities:
Gaps: {input_data.evidence_gaps[:10]}
Data sources: {input_data.available_data_sources}
Priorities: {input_data.strategic_priorities}

Return JSON:
- opportunities[]: opportunity_id, evidence_question, study_type, data_sources[], feasibility_score, strategic_value, estimated_timeline, key_challenges[]
- opportunity_matrix{{}}
- data_source_strategy{{}}
- priority_studies[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a real-world evidence expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return RWEMapperOutput(
                opportunities=[RWEOpportunity(**o) for o in result.get("opportunities", [])],
                opportunity_matrix=result.get("opportunity_matrix", {}),
                data_source_strategy=result.get("data_source_strategy", {}),
                priority_studies=result.get("priority_studies", []),
                quality_score=0.8 if result.get("opportunities") else 0.4,
            )
        except Exception as e:
            logger.error(f"RealWorldEvidenceMapperRunner failed: {e}")
            return RWEMapperOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["RealWorldEvidenceMapperRunner", "RWEMapperInput", "RWEMapperOutput", "RWEOpportunity"]
