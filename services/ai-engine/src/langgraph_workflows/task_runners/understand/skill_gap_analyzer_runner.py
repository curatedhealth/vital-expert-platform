"""
SkillGapAnalyzerRunner - Analyze team skill gaps.

Algorithmic Core: Gap Analysis
- Assesses current vs required skill levels
- Identifies capability gaps and development needs
- Prioritizes gaps by business impact
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class SkillGapDetail(TaskRunnerOutput):
    """Individual skill gap analysis."""
    skill_name: str = Field(default="")
    skill_category: str = Field(default="", description="technical | soft | domain | leadership")
    current_level: float = Field(default=0.0, description="Current proficiency 0-5")
    required_level: float = Field(default=0.0, description="Required proficiency 0-5")
    gap_size: float = Field(default=0.0, description="Gap size (required - current)")
    gap_severity: str = Field(default="", description="critical | significant | moderate | minor")
    business_impact: str = Field(default="", description="Impact on business outcomes")
    development_options: List[str] = Field(default_factory=list)


class SkillGapAnalyzerInput(TaskRunnerInput):
    """Input schema for SkillGapAnalyzerRunner."""
    team_members: List[Dict[str, Any]] = Field(default_factory=list, description="Team member profiles")
    required_capabilities: List[Dict[str, Any]] = Field(default_factory=list, description="Required capabilities")
    business_priorities: List[str] = Field(default_factory=list, description="Business priorities")


class SkillGapAnalyzerOutput(TaskRunnerOutput):
    """Output schema for SkillGapAnalyzerRunner."""
    skill_gaps: List[SkillGapDetail] = Field(default_factory=list, description="Identified skill gaps")
    gaps_by_severity: Dict[str, List[str]] = Field(default_factory=dict, description="Gaps by severity")
    priority_gaps: List[str] = Field(default_factory=list, description="Priority gaps to address")
    team_capability_score: float = Field(default=0.0, description="Overall capability score 0-100")
    development_roadmap: List[Dict[str, Any]] = Field(default_factory=list, description="Development roadmap")


@register_task_runner
class SkillGapAnalyzerRunner(TaskRunner[SkillGapAnalyzerInput, SkillGapAnalyzerOutput]):
    """Analyze team skill gaps."""

    runner_id = "skill_gap_analyzer"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "skill_gap_analysis"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: SkillGapAnalyzerInput) -> SkillGapAnalyzerOutput:
        logger.info("Executing SkillGapAnalyzerRunner")
        prompt = f"""Analyze skill gaps:
Team: {input_data.team_members[:10]}
Required: {input_data.required_capabilities}
Priorities: {input_data.business_priorities}

Return JSON:
- skill_gaps[]: skill_name, skill_category, current_level (0-5), required_level (0-5), gap_size, gap_severity, business_impact, development_options[]
- gaps_by_severity{{}}
- priority_gaps[]
- team_capability_score (0-100)
- development_roadmap[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a capability assessment expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return SkillGapAnalyzerOutput(
                skill_gaps=[SkillGapDetail(**g) for g in result.get("skill_gaps", [])],
                gaps_by_severity=result.get("gaps_by_severity", {}),
                priority_gaps=result.get("priority_gaps", []),
                team_capability_score=result.get("team_capability_score", 0.0),
                development_roadmap=result.get("development_roadmap", []),
                quality_score=0.8 if result.get("skill_gaps") else 0.4,
            )
        except Exception as e:
            logger.error(f"SkillGapAnalyzerRunner failed: {e}")
            return SkillGapAnalyzerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["SkillGapAnalyzerRunner", "SkillGapAnalyzerInput", "SkillGapAnalyzerOutput", "SkillGapDetail"]
