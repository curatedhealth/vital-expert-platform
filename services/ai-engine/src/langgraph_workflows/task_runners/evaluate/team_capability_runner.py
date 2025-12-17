"""
TeamCapabilityAssessorRunner - Assess team capabilities.

Algorithmic Core: Capability Assessment
- Assesses team capabilities against requirements
- Identifies strengths and improvement areas
- Provides capability scores and benchmarks
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class CapabilityAssessment(TaskRunnerOutput):
    """Individual capability assessment."""
    capability_name: str = Field(default="")
    capability_category: str = Field(default="", description="technical | interpersonal | strategic | operational")
    current_score: float = Field(default=0.0, description="Current score 0-100")
    required_score: float = Field(default=0.0, description="Required score 0-100")
    gap: float = Field(default=0.0)
    strength_areas: List[str] = Field(default_factory=list)
    improvement_areas: List[str] = Field(default_factory=list)


class TeamCapabilityInput(TaskRunnerInput):
    """Input schema for TeamCapabilityAssessorRunner."""
    team_members: List[Dict[str, Any]] = Field(default_factory=list, description="Team member profiles")
    capability_framework: Dict[str, Any] = Field(default_factory=dict, description="Capability framework")
    assessment_context: str = Field(default="", description="Assessment context")


class TeamCapabilityOutput(TaskRunnerOutput):
    """Output schema for TeamCapabilityAssessorRunner."""
    assessments: List[CapabilityAssessment] = Field(default_factory=list, description="Capability assessments")
    overall_score: float = Field(default=0.0, description="Overall team capability 0-100")
    strengths: List[str] = Field(default_factory=list, description="Team strengths")
    development_priorities: List[str] = Field(default_factory=list, description="Development priorities")
    capability_matrix: Dict[str, Dict[str, float]] = Field(default_factory=dict, description="Capability matrix")


@register_task_runner
class TeamCapabilityAssessorRunner(TaskRunner[TeamCapabilityInput, TeamCapabilityOutput]):
    """Assess team capabilities."""

    runner_id = "team_capability_assessor"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "capability_assessment"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: TeamCapabilityInput) -> TeamCapabilityOutput:
        logger.info("Executing TeamCapabilityAssessorRunner")
        prompt = f"""Assess team capabilities:
Team: {input_data.team_members[:10]}
Framework: {input_data.capability_framework}
Context: {input_data.assessment_context}

Return JSON:
- assessments[]: capability_name, capability_category, current_score (0-100), required_score (0-100), gap, strength_areas[], improvement_areas[]
- overall_score (0-100)
- strengths[]
- development_priorities[]
- capability_matrix{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a capability assessment expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return TeamCapabilityOutput(
                assessments=[CapabilityAssessment(**a) for a in result.get("assessments", [])],
                overall_score=result.get("overall_score", 0.0),
                strengths=result.get("strengths", []),
                development_priorities=result.get("development_priorities", []),
                capability_matrix=result.get("capability_matrix", {}),
                quality_score=0.8 if result.get("assessments") else 0.4,
            )
        except Exception as e:
            logger.error(f"TeamCapabilityAssessorRunner failed: {e}")
            return TeamCapabilityOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["TeamCapabilityAssessorRunner", "TeamCapabilityInput", "TeamCapabilityOutput", "CapabilityAssessment"]
