"""
InvestmentRecommenderRunner - Recommend investments.

Algorithmic Core: Investment Optimization
- Analyzes investment opportunities
- Optimizes portfolio allocation
- Recommends investment priorities
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class InvestmentRecommendation(TaskRunnerOutput):
    """Investment recommendation."""
    investment_id: str = Field(default="")
    investment_name: str = Field(default="")
    investment_type: str = Field(default="", description="capability | technology | market | talent | infrastructure")
    recommended_amount: float = Field(default=0.0)
    expected_roi: float = Field(default=0.0, description="Expected ROI percentage")
    payback_period: str = Field(default="")
    risk_level: str = Field(default="medium", description="low | medium | high")
    strategic_alignment: float = Field(default=0.0, description="Alignment score 0-100")
    priority: int = Field(default=0, description="Priority rank")


class InvestmentRecommenderInput(TaskRunnerInput):
    """Input schema for InvestmentRecommenderRunner."""
    opportunities: List[Dict[str, Any]] = Field(default_factory=list, description="Investment opportunities")
    budget: float = Field(default=0.0, description="Available budget")
    strategic_priorities: List[str] = Field(default_factory=list, description="Strategic priorities")
    risk_tolerance: str = Field(default="moderate", description="conservative | moderate | aggressive")


class InvestmentRecommenderOutput(TaskRunnerOutput):
    """Output schema for InvestmentRecommenderRunner."""
    recommendations: List[InvestmentRecommendation] = Field(default_factory=list, description="Recommendations")
    portfolio_allocation: Dict[str, float] = Field(default_factory=dict, description="Portfolio allocation")
    total_expected_roi: float = Field(default=0.0)
    risk_analysis: Dict[str, Any] = Field(default_factory=dict, description="Risk analysis")


@register_task_runner
class InvestmentRecommenderRunner(TaskRunner[InvestmentRecommenderInput, InvestmentRecommenderOutput]):
    """Recommend investments."""

    runner_id = "investment_recommender"
    category = TaskRunnerCategory.DECIDE
    algorithmic_core = "investment_optimization"
    max_duration_seconds = 90
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: InvestmentRecommenderInput) -> InvestmentRecommenderOutput:
        logger.info("Executing InvestmentRecommenderRunner")
        prompt = f"""Recommend investments:
Opportunities: {input_data.opportunities[:10]}
Budget: {input_data.budget}
Priorities: {input_data.strategic_priorities}
Risk tolerance: {input_data.risk_tolerance}

Return JSON:
- recommendations[]: investment_id, investment_name, investment_type, recommended_amount, expected_roi, payback_period, risk_level, strategic_alignment, priority
- portfolio_allocation{{}}
- total_expected_roi
- risk_analysis{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are an investment strategy expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return InvestmentRecommenderOutput(
                recommendations=[InvestmentRecommendation(**r) for r in result.get("recommendations", [])],
                portfolio_allocation=result.get("portfolio_allocation", {}),
                total_expected_roi=result.get("total_expected_roi", 0.0),
                risk_analysis=result.get("risk_analysis", {}),
                quality_score=0.8 if result.get("recommendations") else 0.4,
            )
        except Exception as e:
            logger.error(f"InvestmentRecommenderRunner failed: {e}")
            return InvestmentRecommenderOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["InvestmentRecommenderRunner", "InvestmentRecommenderInput", "InvestmentRecommenderOutput", "InvestmentRecommendation"]
