"""
PeopleCapabilityAssessorRunner - Assess organizational capability gaps.

Algorithmic Core: Capability Assessment Scoring
- Evaluates current vs required capabilities
- Identifies skill gaps and training needs
- Provides build vs buy recommendations
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class SkillGap(TaskRunnerOutput):
    """Individual skill gap assessment."""
    skill_name: str = Field(default="", description="Skill area")
    current_level: float = Field(default=0.0, description="Current proficiency 0-5")
    required_level: float = Field(default=0.0, description="Required proficiency 0-5")
    gap_severity: str = Field(default="moderate", description="minor | moderate | significant | critical")
    close_strategy: str = Field(default="", description="Strategy to close gap")


class CapabilityAssessorInput(TaskRunnerInput):
    """Input schema for PeopleCapabilityAssessorRunner."""
    strategic_objectives: List[Dict[str, Any]] = Field(default_factory=list, description="Strategic objectives")
    current_capabilities: Dict[str, Any] = Field(default_factory=dict, description="Current org capabilities")
    initiative_requirements: List[str] = Field(default_factory=list, description="Initiative requirements")


class CapabilityAssessorOutput(TaskRunnerOutput):
    """Output schema for PeopleCapabilityAssessorRunner."""
    capability_plan: Dict[str, Any] = Field(default_factory=dict, description="Capability development plan")
    skill_gaps: List[SkillGap] = Field(default_factory=list, description="Identified skill gaps")
    training_needs: List[str] = Field(default_factory=list, description="Training programs needed")
    org_recommendations: List[str] = Field(default_factory=list, description="Organizational recommendations")
    critical_gaps: List[str] = Field(default_factory=list, description="Critical gaps requiring immediate action")


@register_task_runner
class PeopleCapabilityAssessorRunner(TaskRunner[CapabilityAssessorInput, CapabilityAssessorOutput]):
    """Assess organizational capability gaps."""

    runner_id = "people_capability_assessor"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "capability_gap_assessment"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: CapabilityAssessorInput) -> CapabilityAssessorOutput:
        """Execute capability assessment."""
        logger.info("Executing PeopleCapabilityAssessorRunner")

        prompt = """Assess organizational capability gaps.
1. SKILL GAPS: skill_name, current_level (0-5), required_level, gap_severity, close_strategy
2. CAPABILITY PLAN: current_capabilities, required_capabilities, gap_summary, build_vs_buy
3. TRAINING NEEDS: List training programs
4. ORG RECOMMENDATIONS: Structural/hiring recommendations
Return JSON: capability_plan{}, skill_gaps[], training_needs[], org_recommendations[], critical_gaps[]"""

        context = f"Objectives: {input_data.strategic_objectives[:3]}\nCapabilities: {input_data.current_capabilities}\nRequirements: {input_data.initiative_requirements}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return CapabilityAssessorOutput(
                capability_plan=result.get("capability_plan", {}),
                skill_gaps=[SkillGap(**g) for g in result.get("skill_gaps", [])],
                training_needs=result.get("training_needs", []),
                org_recommendations=result.get("org_recommendations", []),
                critical_gaps=result.get("critical_gaps", []),
                quality_score=0.8 if result.get("skill_gaps") else 0.4,
            )
        except Exception as e:
            logger.error(f"PeopleCapabilityAssessorRunner failed: {e}")
            return CapabilityAssessorOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["PeopleCapabilityAssessorRunner", "CapabilityAssessorInput", "CapabilityAssessorOutput", "SkillGap"]
