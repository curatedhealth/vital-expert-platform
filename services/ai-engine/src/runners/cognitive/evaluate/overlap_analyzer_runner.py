"""
OverlapAnalyzerRunner - Analyze portfolio overlap and cannibalization risk.

Algorithmic Core: Portfolio Overlap Analysis
- Identifies overlap between portfolio elements
- Assesses customer confusion and cannibalization risk
- Provides differentiation recommendations
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class OverlapArea(TaskRunnerOutput):
    """Individual overlap area."""
    overlap_id: str = Field(default="", description="Overlap identifier")
    products_involved: List[str] = Field(default_factory=list, description="Products with overlap")
    overlap_type: str = Field(default="", description="target_audience | indication | positioning | pricing")
    overlap_degree: str = Field(default="low", description="low | medium | high")
    confusion_risk: float = Field(default=0.0, description="Customer confusion risk 0-1")
    recommendations: List[str] = Field(default_factory=list, description="Differentiation recommendations")


class OverlapAnalyzerInput(TaskRunnerInput):
    """Input schema for OverlapAnalyzerRunner."""
    portfolio_elements: List[Dict[str, Any]] = Field(default_factory=list, description="Portfolio elements")
    positioning_data: Dict[str, Any] = Field(default_factory=dict, description="Positioning information")
    target_segments: List[Dict[str, Any]] = Field(default_factory=list, description="Target segments")


class OverlapAnalyzerOutput(TaskRunnerOutput):
    """Output schema for OverlapAnalyzerRunner."""
    overlap_map: Dict[str, Any] = Field(default_factory=dict, description="Overlap visualization data")
    overlap_areas: List[OverlapArea] = Field(default_factory=list, description="Identified overlaps")
    overlap_severity: Dict[str, str] = Field(default_factory=dict, description="Severity by overlap")
    distinct_products: List[str] = Field(default_factory=list, description="Well-differentiated products")
    high_overlap_pairs: List[Dict[str, Any]] = Field(default_factory=list, description="Highest overlap pairs")


@register_task_runner
class OverlapAnalyzerRunner(TaskRunner[OverlapAnalyzerInput, OverlapAnalyzerOutput]):
    """Analyze portfolio overlap and differentiation."""

    runner_id = "overlap_analyzer"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "portfolio_overlap_analysis"
    max_duration_seconds = 90
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: OverlapAnalyzerInput) -> OverlapAnalyzerOutput:
        """Execute overlap analysis."""
        logger.info("Executing OverlapAnalyzerRunner")

        prompt = """Analyze portfolio overlap between products/brands.
1. OVERLAP AREAS: overlap_id, products_involved[], overlap_type, overlap_degree, confusion_risk (0-1), recommendations[]
2. OVERLAP MAP: matrix showing overlap scores between each pair
3. OVERLAP SEVERITY: severity rating per overlap area
4. DISTINCT PRODUCTS: Products with clear differentiation
5. HIGH OVERLAP PAIRS: Pairs needing urgent attention
Return JSON: overlap_map{}, overlap_areas[], overlap_severity{}, distinct_products[], high_overlap_pairs[]"""

        context = f"Portfolio: {input_data.portfolio_elements}\nPositioning: {input_data.positioning_data}\nSegments: {input_data.target_segments}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return OverlapAnalyzerOutput(
                overlap_map=result.get("overlap_map", {}),
                overlap_areas=[OverlapArea(**a) for a in result.get("overlap_areas", [])],
                overlap_severity=result.get("overlap_severity", {}),
                distinct_products=result.get("distinct_products", []),
                high_overlap_pairs=result.get("high_overlap_pairs", []),
                quality_score=0.8 if result.get("overlap_areas") else 0.4,
            )
        except Exception as e:
            logger.error(f"OverlapAnalyzerRunner failed: {e}")
            return OverlapAnalyzerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["OverlapAnalyzerRunner", "OverlapAnalyzerInput", "OverlapAnalyzerOutput", "OverlapArea"]
