"""
TechnologyImpactAssessorRunner - Assess technology impact on portfolio.

Algorithmic Core: Technology Impact Assessment
- Evaluates emerging technology impact on business
- Assesses disruption potential and timeline
- Maps technology to strategic implications

Use Cases:
- Technology due diligence
- R&D portfolio assessment
- Digital transformation planning
- Competitive technology analysis
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class TechnologyAssessment(TaskRunnerOutput):
    """Individual technology assessment."""
    technology_name: str = Field(default="", description="Technology name")
    maturity_level: str = Field(default="emerging", description="emerging | growing | mature | declining")
    disruption_potential: str = Field(default="low", description="low | medium | high | transformative")
    time_to_impact: str = Field(default="3-5 years", description="Timeline to significant impact")
    relevance_score: float = Field(default=0.0, description="Relevance to portfolio 0-1")
    adoption_barriers: List[str] = Field(default_factory=list, description="Barriers to adoption")
    strategic_implications: List[str] = Field(default_factory=list, description="Strategic implications")


class TechnologyImpactInput(TaskRunnerInput):
    """Input schema for TechnologyImpactAssessorRunner."""
    technologies: List[Dict[str, Any]] = Field(default_factory=list, description="Technologies to assess")
    portfolio_context: Optional[str] = Field(default=None, description="Current portfolio context")
    industry: Optional[str] = Field(default=None, description="Industry context")
    time_horizon: str = Field(default="5 years", description="Assessment time horizon")


class TechnologyImpactOutput(TaskRunnerOutput):
    """Output schema for TechnologyImpactAssessorRunner."""
    assessments: List[TechnologyAssessment] = Field(default_factory=list, description="Technology assessments")
    disruption_technologies: List[str] = Field(default_factory=list, description="High disruption technologies")
    impact_assessment: Dict[str, Any] = Field(default_factory=dict, description="Overall impact assessment")
    priority_technologies: List[str] = Field(default_factory=list, description="Technologies to prioritize")


@register_task_runner
class TechnologyImpactAssessorRunner(TaskRunner[TechnologyImpactInput, TechnologyImpactOutput]):
    """Assess technology impact on portfolio and strategy."""

    runner_id = "technology_impact_assessor"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "technology_impact_assessment"
    max_duration_seconds = 120
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=4000)

    async def execute(self, input_data: TechnologyImpactInput) -> TechnologyImpactOutput:
        """Execute technology impact assessment."""
        logger.info("Executing TechnologyImpactAssessorRunner")

        prompt = """You are a technology analyst assessing emerging technology impact.

Assess each technology:
1. ASSESSMENT per technology:
   - technology_name, maturity_level (emerging|growing|mature|declining)
   - disruption_potential (low|medium|high|transformative)
   - time_to_impact, relevance_score (0-1)
   - adoption_barriers[], strategic_implications[]

2. DISRUPTION TECHNOLOGIES: List high/transformative disruption potential
3. IMPACT ASSESSMENT: overall_impact, key_trends, recommended_actions
4. PRIORITY TECHNOLOGIES: Top technologies to focus on

Return JSON with: assessments[], disruption_technologies[], impact_assessment{}, priority_technologies[]"""

        context = f"Technologies: {input_data.technologies}\nPortfolio: {input_data.portfolio_context}\nIndustry: {input_data.industry}\nHorizon: {input_data.time_horizon}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return TechnologyImpactOutput(
                assessments=[TechnologyAssessment(**a) for a in result.get("assessments", [])],
                disruption_technologies=result.get("disruption_technologies", []),
                impact_assessment=result.get("impact_assessment", {}),
                priority_technologies=result.get("priority_technologies", []),
                quality_score=0.8 if result.get("assessments") else 0.4,
            )
        except Exception as e:
            logger.error(f"TechnologyImpactAssessorRunner failed: {e}")
            return TechnologyImpactOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["TechnologyImpactAssessorRunner", "TechnologyImpactInput", "TechnologyImpactOutput", "TechnologyAssessment"]
