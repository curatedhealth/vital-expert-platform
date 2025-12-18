"""
MarketDiagnosticianRunner - Diagnose market dynamics and environment.

Algorithmic Core: Market Dynamics Analysis
- Assesses market size, growth, and maturity
- Identifies key market drivers and inhibitors
- Analyzes competitive landscape
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class MarketDiagnosticianInput(TaskRunnerInput):
    """Input schema for MarketDiagnosticianRunner."""
    market_definition: str = Field(default="", description="Market to analyze")
    industry_context: Optional[str] = Field(default=None, description="Industry context")
    geographic_scope: str = Field(default="global", description="Geographic scope")
    data_sources: List[Dict[str, Any]] = Field(default_factory=list, description="Available data sources")


class MarketDiagnosticianOutput(TaskRunnerOutput):
    """Output schema for MarketDiagnosticianRunner."""
    market_assessment: Dict[str, Any] = Field(default_factory=dict, description="Market assessment")
    market_dynamics: List[Dict[str, Any]] = Field(default_factory=list, description="Key dynamics")
    market_size: Dict[str, float] = Field(default_factory=dict, description="Market size data")
    competitive_landscape: List[Dict[str, Any]] = Field(default_factory=list, description="Competitive analysis")
    growth_drivers: List[str] = Field(default_factory=list, description="Growth drivers")
    market_barriers: List[str] = Field(default_factory=list, description="Market barriers")


@register_task_runner
class MarketDiagnosticianRunner(TaskRunner[MarketDiagnosticianInput, MarketDiagnosticianOutput]):
    """Diagnose market dynamics and environment."""

    runner_id = "market_diagnostician"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "market_dynamics_analysis"
    max_duration_seconds = 120
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=4000)

    async def execute(self, input_data: MarketDiagnosticianInput) -> MarketDiagnosticianOutput:
        """Execute market diagnosis."""
        logger.info("Executing MarketDiagnosticianRunner")

        prompt = """Diagnose market dynamics comprehensively.
1. MARKET ASSESSMENT: market_size_usd, growth_rate_pct, maturity_stage (emerging|growing|mature|declining), key_trends[], regulatory_environment
2. MARKET DYNAMICS: type (driver|inhibitor|disruption), description, impact_level
3. MARKET SIZE: tam, sam, som with estimates
4. COMPETITIVE LANDSCAPE: competitor_name, market_share, positioning, strengths[], weaknesses[]
5. GROWTH DRIVERS and BARRIERS
Return JSON: market_assessment{}, market_dynamics[], market_size{}, competitive_landscape[], growth_drivers[], market_barriers[]"""

        context = f"Market: {input_data.market_definition}\nIndustry: {input_data.industry_context}\nScope: {input_data.geographic_scope}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return MarketDiagnosticianOutput(
                market_assessment=result.get("market_assessment", {}),
                market_dynamics=result.get("market_dynamics", []),
                market_size=result.get("market_size", {}),
                competitive_landscape=result.get("competitive_landscape", []),
                growth_drivers=result.get("growth_drivers", []),
                market_barriers=result.get("market_barriers", []),
                quality_score=0.8 if result.get("market_assessment") else 0.4,
            )
        except Exception as e:
            logger.error(f"MarketDiagnosticianRunner failed: {e}")
            return MarketDiagnosticianOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["MarketDiagnosticianRunner", "MarketDiagnosticianInput", "MarketDiagnosticianOutput"]
