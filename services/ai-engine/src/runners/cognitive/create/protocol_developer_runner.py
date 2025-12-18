"""
ProtocolDeveloperRunner - Develop study protocols.

Algorithmic Core: Protocol Development
- Develops study protocols and methodologies
- Creates structured research designs
- Ensures scientific rigor and compliance
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class ProtocolSection(TaskRunnerOutput):
    """Protocol section."""
    section_id: str = Field(default="")
    section_name: str = Field(default="")
    content: str = Field(default="")
    requirements: List[str] = Field(default_factory=list)
    considerations: List[str] = Field(default_factory=list)


class ProtocolDeveloperInput(TaskRunnerInput):
    """Input schema for ProtocolDeveloperRunner."""
    study_objective: str = Field(default="", description="Study objective")
    study_type: str = Field(default="", description="Study type")
    population: Dict[str, Any] = Field(default_factory=dict, description="Target population")
    endpoints: List[str] = Field(default_factory=list, description="Study endpoints")


class ProtocolDeveloperOutput(TaskRunnerOutput):
    """Output schema for ProtocolDeveloperRunner."""
    protocol_sections: List[ProtocolSection] = Field(default_factory=list, description="Protocol sections")
    study_design: Dict[str, Any] = Field(default_factory=dict, description="Study design summary")
    inclusion_criteria: List[str] = Field(default_factory=list, description="Inclusion criteria")
    exclusion_criteria: List[str] = Field(default_factory=list, description="Exclusion criteria")
    statistical_considerations: Dict[str, Any] = Field(default_factory=dict, description="Statistical plan")


@register_task_runner
class ProtocolDeveloperRunner(TaskRunner[ProtocolDeveloperInput, ProtocolDeveloperOutput]):
    """Develop study protocols."""

    runner_id = "protocol_developer"
    category = TaskRunnerCategory.CREATE
    algorithmic_core = "protocol_development"
    max_duration_seconds = 120
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=4000)

    async def execute(self, input_data: ProtocolDeveloperInput) -> ProtocolDeveloperOutput:
        logger.info("Executing ProtocolDeveloperRunner")
        prompt = f"""Develop study protocol:
Objective: {input_data.study_objective}
Type: {input_data.study_type}
Population: {input_data.population}
Endpoints: {input_data.endpoints}

Return JSON:
- protocol_sections[]: section_id, section_name, content, requirements[], considerations[]
- study_design{{}}
- inclusion_criteria[]
- exclusion_criteria[]
- statistical_considerations{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a clinical research protocol expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return ProtocolDeveloperOutput(
                protocol_sections=[ProtocolSection(**s) for s in result.get("protocol_sections", [])],
                study_design=result.get("study_design", {}),
                inclusion_criteria=result.get("inclusion_criteria", []),
                exclusion_criteria=result.get("exclusion_criteria", []),
                statistical_considerations=result.get("statistical_considerations", {}),
                quality_score=0.8 if result.get("protocol_sections") else 0.4,
            )
        except Exception as e:
            logger.error(f"ProtocolDeveloperRunner failed: {e}")
            return ProtocolDeveloperOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["ProtocolDeveloperRunner", "ProtocolDeveloperInput", "ProtocolDeveloperOutput", "ProtocolSection"]
