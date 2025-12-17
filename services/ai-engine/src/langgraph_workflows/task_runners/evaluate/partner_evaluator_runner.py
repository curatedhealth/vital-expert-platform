"""
PartnerEvaluatorRunner - Evaluate potential partners using MCDA scoring.

Algorithmic Core: Partner Evaluation Scoring (MCDA)
- Multi-criteria partner assessment
- Strategic fit and capability evaluation
- Risk-adjusted partner ranking
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class PartnerAssessment(TaskRunnerOutput):
    """Individual partner assessment."""
    partner_name: str = Field(default="", description="Partner name")
    partner_type: str = Field(default="", description="distributor | agency | supplier | co-marketing | technology")
    strategic_fit: float = Field(default=0.0, description="Strategic fit score 0-100")
    capabilities: List[str] = Field(default_factory=list, description="Key capabilities")
    risks: List[str] = Field(default_factory=list, description="Partnership risks")
    recommendation: str = Field(default="consider", description="pursue | consider | avoid")
    priority: str = Field(default="medium", description="high | medium | low")


class PartnerEvaluatorInput(TaskRunnerInput):
    """Input schema for PartnerEvaluatorRunner."""
    potential_partners: List[Dict[str, Any]] = Field(default_factory=list, description="Partners to evaluate")
    evaluation_criteria: List[str] = Field(default_factory=list, description="Evaluation criteria")
    strategic_needs: List[str] = Field(default_factory=list, description="Strategic partnership needs")


class PartnerEvaluatorOutput(TaskRunnerOutput):
    """Output schema for PartnerEvaluatorRunner."""
    assessments: List[PartnerAssessment] = Field(default_factory=list, description="Partner assessments")
    partner_scores: Dict[str, float] = Field(default_factory=dict, description="Scores by partner")
    recommended_partners: List[str] = Field(default_factory=list, description="Recommended partners")
    partnership_criteria: List[str] = Field(default_factory=list, description="Key criteria used")


@register_task_runner
class PartnerEvaluatorRunner(TaskRunner[PartnerEvaluatorInput, PartnerEvaluatorOutput]):
    """Evaluate potential partners using MCDA scoring."""

    runner_id = "partner_evaluator"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "mcda_partner_scoring"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: PartnerEvaluatorInput) -> PartnerEvaluatorOutput:
        """Execute partner evaluation."""
        logger.info("Executing PartnerEvaluatorRunner")

        prompt = """Evaluate partners using multi-criteria analysis.
Per partner: partner_name, partner_type, strategic_fit (0-100), capabilities[], risks[], recommendation (pursue|consider|avoid), priority
Calculate weighted scores, rank partners.
Return JSON: assessments[], partner_scores{}, recommended_partners[], partnership_criteria[]"""

        context = f"Partners: {input_data.potential_partners}\nCriteria: {input_data.evaluation_criteria}\nNeeds: {input_data.strategic_needs}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return PartnerEvaluatorOutput(
                assessments=[PartnerAssessment(**a) for a in result.get("assessments", [])],
                partner_scores=result.get("partner_scores", {}),
                recommended_partners=result.get("recommended_partners", []),
                partnership_criteria=result.get("partnership_criteria", []),
                quality_score=0.8 if result.get("assessments") else 0.4,
            )
        except Exception as e:
            logger.error(f"PartnerEvaluatorRunner failed: {e}")
            return PartnerEvaluatorOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["PartnerEvaluatorRunner", "PartnerEvaluatorInput", "PartnerEvaluatorOutput", "PartnerAssessment"]
