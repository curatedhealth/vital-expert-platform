"""
IndustryBenchmarkAnalystRunner - Benchmark against industry.

Algorithmic Core: Benchmark Analysis
- Compares performance against industry benchmarks
- Identifies competitive gaps and opportunities
- Provides industry quartile positioning
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class BenchmarkComparison(TaskRunnerOutput):
    """Individual benchmark comparison."""
    metric_name: str = Field(default="")
    metric_category: str = Field(default="")
    your_value: float = Field(default=0.0)
    industry_average: float = Field(default=0.0)
    industry_best: float = Field(default=0.0)
    percentile: int = Field(default=50, description="Your percentile ranking")
    quartile: int = Field(default=2, description="1=top, 4=bottom")
    gap_to_average: float = Field(default=0.0)
    gap_to_best: float = Field(default=0.0)


class IndustryBenchmarkInput(TaskRunnerInput):
    """Input schema for IndustryBenchmarkAnalystRunner."""
    performance_metrics: Dict[str, float] = Field(default_factory=dict, description="Your metrics")
    industry: str = Field(default="", description="Industry for benchmarking")
    comparison_scope: str = Field(default="global", description="global | regional | peer_group")


class IndustryBenchmarkOutput(TaskRunnerOutput):
    """Output schema for IndustryBenchmarkAnalystRunner."""
    comparisons: List[BenchmarkComparison] = Field(default_factory=list, description="Benchmark comparisons")
    overall_ranking: str = Field(default="", description="Overall industry ranking")
    top_quartile_metrics: List[str] = Field(default_factory=list, description="Metrics in top quartile")
    improvement_priorities: List[str] = Field(default_factory=list, description="Priority improvements")
    competitive_position: Dict[str, Any] = Field(default_factory=dict, description="Competitive positioning")


@register_task_runner
class IndustryBenchmarkAnalystRunner(TaskRunner[IndustryBenchmarkInput, IndustryBenchmarkOutput]):
    """Benchmark against industry."""

    runner_id = "industry_benchmark_analyst"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "benchmark_analysis"
    max_duration_seconds = 90
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: IndustryBenchmarkInput) -> IndustryBenchmarkOutput:
        logger.info("Executing IndustryBenchmarkAnalystRunner")
        prompt = f"""Benchmark performance against industry:
Metrics: {input_data.performance_metrics}
Industry: {input_data.industry}
Scope: {input_data.comparison_scope}

Return JSON:
- comparisons[]: metric_name, metric_category, your_value, industry_average, industry_best, percentile, quartile, gap_to_average, gap_to_best
- overall_ranking
- top_quartile_metrics[]
- improvement_priorities[]
- competitive_position{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are an industry benchmarking expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return IndustryBenchmarkOutput(
                comparisons=[BenchmarkComparison(**c) for c in result.get("comparisons", [])],
                overall_ranking=result.get("overall_ranking", ""),
                top_quartile_metrics=result.get("top_quartile_metrics", []),
                improvement_priorities=result.get("improvement_priorities", []),
                competitive_position=result.get("competitive_position", {}),
                quality_score=0.8 if result.get("comparisons") else 0.4,
            )
        except Exception as e:
            logger.error(f"IndustryBenchmarkAnalystRunner failed: {e}")
            return IndustryBenchmarkOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["IndustryBenchmarkAnalystRunner", "IndustryBenchmarkInput", "IndustryBenchmarkOutput", "BenchmarkComparison"]
