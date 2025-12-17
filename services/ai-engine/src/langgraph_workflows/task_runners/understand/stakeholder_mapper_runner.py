"""
StakeholderMapperRunner - Map stakeholder landscape.

Algorithmic Core: Stakeholder Landscape Mapping
- Identifies key stakeholders by type and influence
- Maps stakeholder relationships and networks
- Categorizes by tier and engagement potential
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class Stakeholder(TaskRunnerOutput):
    """Individual stakeholder profile."""
    stakeholder_id: str = Field(default="")
    name: str = Field(default="")
    role: str = Field(default="")
    organization: str = Field(default="")
    tier: str = Field(default="secondary", description="primary | secondary | tertiary | emerging")
    influence_score: float = Field(default=0.0, description="Influence score 0-100")
    expertise_areas: List[str] = Field(default_factory=list)
    decision_authority: str = Field(default="", description="Decision-making role")
    engagement_history: List[str] = Field(default_factory=list)


class StakeholderMapperInput(TaskRunnerInput):
    """Input schema for StakeholderMapperRunner."""
    domain: str = Field(default="", description="Domain/area to map stakeholders")
    geography: str = Field(default="global", description="Geographic scope")
    stakeholder_types: List[str] = Field(default_factory=list, description="Types of stakeholders to include")
    existing_stakeholders: List[Dict[str, Any]] = Field(default_factory=list, description="Known stakeholders")


class StakeholderMapperOutput(TaskRunnerOutput):
    """Output schema for StakeholderMapperRunner."""
    stakeholder_landscape: List[Stakeholder] = Field(default_factory=list, description="Mapped stakeholders")
    stakeholders_by_tier: Dict[str, List[str]] = Field(default_factory=dict, description="Stakeholders by tier")
    influence_network: Dict[str, Any] = Field(default_factory=dict, description="Network relationships")
    coverage_gaps: List[str] = Field(default_factory=list, description="Coverage gaps identified")
    total_stakeholders: int = Field(default=0)


@register_task_runner
class StakeholderMapperRunner(TaskRunner[StakeholderMapperInput, StakeholderMapperOutput]):
    """Map stakeholder landscape."""

    runner_id = "stakeholder_mapper"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "stakeholder_landscape_mapping"
    max_duration_seconds = 120
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=4000)

    async def execute(self, input_data: StakeholderMapperInput) -> StakeholderMapperOutput:
        logger.info("Executing StakeholderMapperRunner")
        prompt = f"""Map stakeholder landscape for: {input_data.domain}
Geography: {input_data.geography}
Types: {input_data.stakeholder_types}
Known: {input_data.existing_stakeholders[:5]}

Return JSON:
- stakeholder_landscape[]: stakeholder_id, name, role, organization, tier (primary|secondary|tertiary|emerging), influence_score, expertise_areas[], decision_authority, engagement_history[]
- stakeholders_by_tier{{}}
- influence_network: relationships, clusters, key_connectors
- coverage_gaps[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a stakeholder mapping expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            stakeholders = [Stakeholder(**s) for s in result.get("stakeholder_landscape", [])]
            return StakeholderMapperOutput(
                stakeholder_landscape=stakeholders,
                stakeholders_by_tier=result.get("stakeholders_by_tier", {}),
                influence_network=result.get("influence_network", {}),
                coverage_gaps=result.get("coverage_gaps", []),
                total_stakeholders=len(stakeholders),
                quality_score=0.8 if stakeholders else 0.4,
            )
        except Exception as e:
            logger.error(f"StakeholderMapperRunner failed: {e}")
            return StakeholderMapperOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["StakeholderMapperRunner", "StakeholderMapperInput", "StakeholderMapperOutput", "Stakeholder"]
