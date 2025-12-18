"""
PriceStrategistRunner - Develop pricing strategy.

Algorithmic Core: Pricing Optimization
- Analyzes pricing options and tradeoffs
- Optimizes price points for objectives
- Recommends pricing strategies
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class PriceRecommendation(TaskRunnerOutput):
    """Price recommendation."""
    product_id: str = Field(default="")
    product_name: str = Field(default="")
    recommended_price: float = Field(default=0.0)
    price_range_low: float = Field(default=0.0)
    price_range_high: float = Field(default=0.0)
    pricing_strategy: str = Field(default="", description="value | competitive | penetration | premium | skimming")
    rationale: str = Field(default="")
    expected_volume_impact: float = Field(default=0.0, description="Percentage impact")
    competitive_position: str = Field(default="", description="below | parity | above | premium")


class PriceStrategistInput(TaskRunnerInput):
    """Input schema for PriceStrategistRunner."""
    products: List[Dict[str, Any]] = Field(default_factory=list, description="Products to price")
    market_data: Dict[str, Any] = Field(default_factory=dict, description="Market/competitive data")
    pricing_objectives: List[str] = Field(default_factory=list, description="Pricing objectives")


class PriceStrategistOutput(TaskRunnerOutput):
    """Output schema for PriceStrategistRunner."""
    recommendations: List[PriceRecommendation] = Field(default_factory=list, description="Price recommendations")
    pricing_architecture: Dict[str, Any] = Field(default_factory=dict, description="Overall pricing architecture")
    sensitivity_analysis: Dict[str, Any] = Field(default_factory=dict, description="Price sensitivity")
    implementation_guidance: List[str] = Field(default_factory=list, description="Implementation guidance")


@register_task_runner
class PriceStrategistRunner(TaskRunner[PriceStrategistInput, PriceStrategistOutput]):
    """Develop pricing strategy."""

    runner_id = "price_strategist"
    category = TaskRunnerCategory.DECIDE
    algorithmic_core = "pricing_optimization"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: PriceStrategistInput) -> PriceStrategistOutput:
        logger.info("Executing PriceStrategistRunner")
        prompt = f"""Develop pricing strategy:
Products: {input_data.products[:10]}
Market data: {input_data.market_data}
Objectives: {input_data.pricing_objectives}

Return JSON:
- recommendations[]: product_id, product_name, recommended_price, price_range_low, price_range_high, pricing_strategy, rationale, expected_volume_impact, competitive_position
- pricing_architecture{{}}
- sensitivity_analysis{{}}
- implementation_guidance[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a pricing strategy expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return PriceStrategistOutput(
                recommendations=[PriceRecommendation(**r) for r in result.get("recommendations", [])],
                pricing_architecture=result.get("pricing_architecture", {}),
                sensitivity_analysis=result.get("sensitivity_analysis", {}),
                implementation_guidance=result.get("implementation_guidance", []),
                quality_score=0.8 if result.get("recommendations") else 0.4,
            )
        except Exception as e:
            logger.error(f"PriceStrategistRunner failed: {e}")
            return PriceStrategistOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["PriceStrategistRunner", "PriceStrategistInput", "PriceStrategistOutput", "PriceRecommendation"]
