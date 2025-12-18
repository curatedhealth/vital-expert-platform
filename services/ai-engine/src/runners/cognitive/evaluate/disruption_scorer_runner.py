"""
PortfolioDisruptionScorerRunner - Score portfolio disruption risk.

Algorithmic Core: Disruption Risk Scoring
- Calculates disruption risk scores for portfolio elements
- Identifies vulnerability patterns
- Provides risk categorization and recommendations
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class DisruptionScore(TaskRunnerOutput):
    """Disruption score for a portfolio element."""
    element_name: str = Field(default="", description="Portfolio element name")
    disruption_score: float = Field(default=0.0, description="Disruption risk 0-100")
    risk_category: str = Field(default="low", description="low | medium | high | critical")
    vulnerability_factors: List[str] = Field(default_factory=list, description="Vulnerability factors")
    mitigation_options: List[str] = Field(default_factory=list, description="Mitigation options")


class DisruptionScorerInput(TaskRunnerInput):
    """Input schema for PortfolioDisruptionScorerRunner."""
    portfolio_elements: List[Dict[str, Any]] = Field(default_factory=list, description="Portfolio elements to score")
    technology_assessments: List[Dict[str, Any]] = Field(default_factory=list, description="Technology impact data")
    market_signals: List[Dict[str, Any]] = Field(default_factory=list, description="Market signals")


class DisruptionScorerOutput(TaskRunnerOutput):
    """Output schema for PortfolioDisruptionScorerRunner."""
    scores: List[DisruptionScore] = Field(default_factory=list, description="Disruption scores")
    risk_scores: Dict[str, float] = Field(default_factory=dict, description="Scores by element")
    overall_disruption_risk: float = Field(default=0.0, description="Overall portfolio risk 0-100")
    risk_category: str = Field(default="low", description="Overall risk category")
    high_risk_elements: List[str] = Field(default_factory=list, description="High risk elements")


@register_task_runner
class PortfolioDisruptionScorerRunner(TaskRunner[DisruptionScorerInput, DisruptionScorerOutput]):
    """Score disruption risk across portfolio elements."""

    runner_id = "portfolio_disruption_scorer"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "disruption_risk_scoring"
    max_duration_seconds = 90
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: DisruptionScorerInput) -> DisruptionScorerOutput:
        """Execute disruption scoring."""
        logger.info("Executing PortfolioDisruptionScorerRunner")

        prompt = """Score disruption risk for each portfolio element (0-100 scale).
Per element: element_name, disruption_score, risk_category (low<25, medium<50, high<75, critical>=75), vulnerability_factors[], mitigation_options[]
Calculate: overall_disruption_risk (weighted average), risk_category, high_risk_elements[]
Return JSON: scores[], risk_scores{}, overall_disruption_risk, risk_category, high_risk_elements[]"""

        context = f"Elements: {input_data.portfolio_elements}\nTech: {input_data.technology_assessments[:3]}\nSignals: {input_data.market_signals[:3]}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return DisruptionScorerOutput(
                scores=[DisruptionScore(**s) for s in result.get("scores", [])],
                risk_scores=result.get("risk_scores", {}),
                overall_disruption_risk=result.get("overall_disruption_risk", 0.0),
                risk_category=result.get("risk_category", "low"),
                high_risk_elements=result.get("high_risk_elements", []),
                quality_score=0.8 if result.get("scores") else 0.4,
            )
        except Exception as e:
            logger.error(f"PortfolioDisruptionScorerRunner failed: {e}")
            return DisruptionScorerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["PortfolioDisruptionScorerRunner", "DisruptionScorerInput", "DisruptionScorerOutput", "DisruptionScore"]
