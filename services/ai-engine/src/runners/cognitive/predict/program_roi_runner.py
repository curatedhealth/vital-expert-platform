"""
ProgramROIModelerRunner - Model program ROI.

Algorithmic Core: ROI Modeling
- Models return on investment for programs
- Projects financial and strategic outcomes
- Provides sensitivity analysis
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class ROIProjection(TaskRunnerOutput):
    """ROI projection."""
    scenario: str = Field(default="", description="conservative | base | optimistic")
    total_investment: float = Field(default=0.0)
    total_returns: float = Field(default=0.0)
    net_benefit: float = Field(default=0.0)
    roi_percentage: float = Field(default=0.0)
    payback_period_months: int = Field(default=0)
    npv: float = Field(default=0.0, description="Net present value")
    confidence_level: float = Field(default=0.0, description="Confidence 0-100")


class ProgramROIInput(TaskRunnerInput):
    """Input schema for ProgramROIModelerRunner."""
    program_name: str = Field(default="", description="Program name")
    investment_details: Dict[str, float] = Field(default_factory=dict, description="Investment breakdown")
    expected_benefits: List[Dict[str, Any]] = Field(default_factory=list, description="Expected benefits")
    time_horizon_years: int = Field(default=3, description="Analysis time horizon")
    discount_rate: float = Field(default=0.1, description="Discount rate for NPV")


class ProgramROIOutput(TaskRunnerOutput):
    """Output schema for ProgramROIModelerRunner."""
    projections: List[ROIProjection] = Field(default_factory=list, description="ROI projections by scenario")
    year_by_year: Dict[int, Dict[str, float]] = Field(default_factory=dict, description="Year-by-year breakdown")
    key_assumptions: List[str] = Field(default_factory=list, description="Key assumptions")
    sensitivity_factors: Dict[str, float] = Field(default_factory=dict, description="Sensitivity analysis")
    recommendation: str = Field(default="", description="Investment recommendation")


@register_task_runner
class ProgramROIModelerRunner(TaskRunner[ProgramROIInput, ProgramROIOutput]):
    """Model program ROI."""

    runner_id = "program_roi_modeler"
    category = TaskRunnerCategory.PREDICT
    algorithmic_core = "roi_modeling"
    max_duration_seconds = 90
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: ProgramROIInput) -> ProgramROIOutput:
        logger.info("Executing ProgramROIModelerRunner")
        prompt = f"""Model program ROI:
Program: {input_data.program_name}
Investment: {input_data.investment_details}
Benefits: {input_data.expected_benefits[:10]}
Horizon: {input_data.time_horizon_years} years
Discount rate: {input_data.discount_rate}

Return JSON:
- projections[]: scenario, total_investment, total_returns, net_benefit, roi_percentage, payback_period_months, npv, confidence_level
- year_by_year{{}}
- key_assumptions[]
- sensitivity_factors{{}}
- recommendation"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a financial modeling expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return ProgramROIOutput(
                projections=[ROIProjection(**p) for p in result.get("projections", [])],
                year_by_year=result.get("year_by_year", {}),
                key_assumptions=result.get("key_assumptions", []),
                sensitivity_factors=result.get("sensitivity_factors", {}),
                recommendation=result.get("recommendation", ""),
                quality_score=0.8 if result.get("projections") else 0.4,
            )
        except Exception as e:
            logger.error(f"ProgramROIModelerRunner failed: {e}")
            return ProgramROIOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["ProgramROIModelerRunner", "ProgramROIInput", "ProgramROIOutput", "ROIProjection"]
