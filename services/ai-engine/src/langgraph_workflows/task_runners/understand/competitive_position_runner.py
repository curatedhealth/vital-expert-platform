"""
CompetitivePositionAnalyzerRunner - Analyze competitive positions in market.

Algorithmic Core: Competitive Position Mapping
- Maps competitor positions on strategic dimensions
- Identifies position gaps and whitespace
- Analyzes competitive trajectories
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class CompetitorPosition(TaskRunnerOutput):
    """Individual competitor position."""
    competitor_name: str = Field(default="", description="Competitor name")
    positioning: str = Field(default="", description="Positioning statement")
    market_share: float = Field(default=0.0, description="Market share estimate")
    strengths: List[str] = Field(default_factory=list, description="Key strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Key weaknesses")
    trajectory: str = Field(default="stable", description="growing | stable | declining")


class CompetitivePositionInput(TaskRunnerInput):
    """Input schema for CompetitivePositionAnalyzerRunner."""
    competitors: List[Dict[str, Any]] = Field(default_factory=list, description="Competitors to analyze")
    market_context: Optional[str] = Field(default=None, description="Market context")
    positioning_dimensions: List[str] = Field(default_factory=list, description="Dimensions for mapping")


class CompetitivePositionOutput(TaskRunnerOutput):
    """Output schema for CompetitivePositionAnalyzerRunner."""
    position_map: Dict[str, Any] = Field(default_factory=dict, description="Position map data")
    competitor_positions: List[CompetitorPosition] = Field(default_factory=list, description="Position analysis")
    position_gaps: List[Dict[str, Any]] = Field(default_factory=list, description="Unoccupied positions")
    competitive_insights: List[str] = Field(default_factory=list, description="Key insights")


@register_task_runner
class CompetitivePositionAnalyzerRunner(TaskRunner[CompetitivePositionInput, CompetitivePositionOutput]):
    """Analyze competitive positions in market."""

    runner_id = "competitive_position_analyzer"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "competitive_position_mapping"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: CompetitivePositionInput) -> CompetitivePositionOutput:
        """Execute competitive position analysis."""
        logger.info("Executing CompetitivePositionAnalyzerRunner")

        prompt = """Analyze competitive positions in the market.
1. POSITION MAP: x_axis, y_axis, brands_mapped with coordinates, clusters
2. COMPETITOR POSITIONS: competitor_name, positioning, market_share, strengths[], weaknesses[], trajectory
3. POSITION GAPS: gap_description, attractiveness (high|medium|low), sustainability
4. COMPETITIVE INSIGHTS: Key strategic insights
Return JSON: position_map{}, competitor_positions[], position_gaps[], competitive_insights[]"""

        context = f"Competitors: {input_data.competitors}\nMarket: {input_data.market_context}\nDimensions: {input_data.positioning_dimensions}"

        try:
            response = await self.llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content=context)])
            result = self._parse_json(response.content)
            return CompetitivePositionOutput(
                position_map=result.get("position_map", {}),
                competitor_positions=[CompetitorPosition(**p) for p in result.get("competitor_positions", [])],
                position_gaps=result.get("position_gaps", []),
                competitive_insights=result.get("competitive_insights", []),
                quality_score=0.8 if result.get("competitor_positions") else 0.4,
            )
        except Exception as e:
            logger.error(f"CompetitivePositionAnalyzerRunner failed: {e}")
            return CompetitivePositionOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["CompetitivePositionAnalyzerRunner", "CompetitivePositionInput", "CompetitivePositionOutput", "CompetitorPosition"]
