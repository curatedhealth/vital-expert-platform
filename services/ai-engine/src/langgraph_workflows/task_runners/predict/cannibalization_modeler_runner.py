"""
CannibalizationModelerRunner - Model portfolio cannibalization.

Algorithmic Core: Cannibalization Modeling
- Models revenue transfer between portfolio elements
- Estimates net impact of new launches
- Identifies cannibalization risk factors
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class CannibalizationEffect(TaskRunnerOutput):
    source_product: str = Field(default="")
    target_product: str = Field(default="")
    cannibalization_rate: float = Field(default=0.0, description="% revenue transfer")
    net_impact: str = Field(default="neutral", description="positive | neutral | negative")
    risk_level: str = Field(default="medium", description="low | medium | high")


class CannibalizationModelerInput(TaskRunnerInput):
    portfolio_products: List[Dict[str, Any]] = Field(default_factory=list)
    new_launch: Dict[str, Any] = Field(default_factory=dict, description="New product launch")
    market_data: Dict[str, Any] = Field(default_factory=dict)


class CannibalizationModelerOutput(TaskRunnerOutput):
    cannibalization_matrix: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    effects: List[CannibalizationEffect] = Field(default_factory=list)
    net_portfolio_impact: str = Field(default="")
    high_risk_pairs: List[Dict[str, Any]] = Field(default_factory=list)
    mitigation_strategies: List[str] = Field(default_factory=list)


@register_task_runner
class CannibalizationModelerRunner(TaskRunner[CannibalizationModelerInput, CannibalizationModelerOutput]):
    runner_id = "cannibalization_modeler"
    category = TaskRunnerCategory.PREDICT
    algorithmic_core = "cannibalization_modeling"
    max_duration_seconds = 90
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: CannibalizationModelerInput) -> CannibalizationModelerOutput:
        logger.info("Executing CannibalizationModelerRunner")
        prompt = f"Model cannibalization. Portfolio: {input_data.portfolio_products}. New launch: {input_data.new_launch}. Market: {input_data.market_data}. Return JSON: cannibalization_matrix{{}}, effects[], net_portfolio_impact, high_risk_pairs[], mitigation_strategies[]"
        try:
            response = await self.llm.ainvoke([SystemMessage(content="You model portfolio cannibalization."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return CannibalizationModelerOutput(
                cannibalization_matrix=result.get("cannibalization_matrix", {}),
                effects=[CannibalizationEffect(**e) for e in result.get("effects", [])],
                net_portfolio_impact=result.get("net_portfolio_impact", ""),
                high_risk_pairs=result.get("high_risk_pairs", []),
                mitigation_strategies=result.get("mitigation_strategies", []),
                quality_score=0.8 if result.get("effects") else 0.4,
            )
        except Exception as e:
            logger.error(f"CannibalizationModelerRunner failed: {e}")
            return CannibalizationModelerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["CannibalizationModelerRunner", "CannibalizationModelerInput", "CannibalizationModelerOutput", "CannibalizationEffect"]
