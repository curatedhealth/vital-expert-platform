"""
BenchmarkRunner - Compare to reference using gap analysis.

Algorithmic Core: Gap Analysis
- Compares entity against a reference benchmark
- Identifies gaps across dimensions
- Calculates gap magnitude and priority

Use Cases:
- Best practices gap analysis
- Industry benchmark comparison
- Maturity assessment
- Performance vs. target analysis
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


# =============================================================================
# Input/Output Schemas
# =============================================================================

class BenchmarkInput(TaskRunnerInput):
    """Input schema for BenchmarkRunner."""

    entity: Dict[str, Any] = Field(
        ...,
        description="Entity to benchmark with its current state"
    )
    benchmark: Dict[str, Any] = Field(
        ...,
        description="Reference benchmark to compare against"
    )
    dimensions: List[str] = Field(
        default_factory=list,
        description="Dimensions to compare (if empty, infer from benchmark)"
    )
    benchmark_type: str = Field(
        default="best_practice",
        description="Type: best_practice | industry_average | target | competitor"
    )


class DimensionGap(TaskRunnerOutput):
    """Gap analysis for a single dimension."""

    dimension: str = Field(default="", description="Dimension name")
    current_state: str = Field(default="", description="Entity's current state")
    benchmark_state: str = Field(default="", description="Benchmark state")
    gap_magnitude: float = Field(default=0.0, description="Gap size 0-100%")
    gap_direction: str = Field(default="", description="behind | ahead | at_parity")
    priority: str = Field(default="medium", description="high | medium | low priority")
    effort_to_close: str = Field(default="medium", description="low | medium | high effort")
    recommendations: List[str] = Field(
        default_factory=list,
        description="Actions to close the gap"
    )


class BenchmarkOutput(TaskRunnerOutput):
    """Output schema for BenchmarkRunner."""

    dimension_gaps: List[DimensionGap] = Field(
        default_factory=list,
        description="Gap analysis per dimension"
    )
    overall_gap_score: float = Field(
        default=0.0,
        description="Overall gap score 0-100 (100 = at benchmark)"
    )
    maturity_level: str = Field(
        default="",
        description="Maturity assessment: emerging | developing | established | leading"
    )
    critical_gaps: List[str] = Field(
        default_factory=list,
        description="Most critical gaps to address"
    )
    strengths_vs_benchmark: List[str] = Field(
        default_factory=list,
        description="Areas ahead of benchmark"
    )
    gap_summary: str = Field(default="", description="Executive summary of gaps")
    roadmap_priorities: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Prioritized actions to close gaps"
    )


# =============================================================================
# BenchmarkRunner Implementation
# =============================================================================

@register_task_runner
class BenchmarkRunner(TaskRunner[BenchmarkInput, BenchmarkOutput]):
    """
    Gap analysis benchmark comparison runner.

    This runner compares an entity against a reference benchmark,
    identifying gaps and recommending actions to close them.

    Algorithmic Pattern:
        1. Parse entity state and benchmark
        2. Identify comparison dimensions
        3. For each dimension, measure gap
        4. Classify gap direction and magnitude
        5. Prioritize gaps by impact and effort
        6. Generate closure roadmap

    Best Used For:
        - Maturity assessment
        - Competitive gap analysis
        - Best practices comparison
        - Target state planning
    """

    runner_id = "benchmark"
    name = "Benchmark Runner"
    description = "Compare to reference using gap analysis"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "gap_analysis"
    max_duration_seconds = 120

    InputType = BenchmarkInput
    OutputType = BenchmarkOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize BenchmarkRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: BenchmarkInput) -> BenchmarkOutput:
        """
        Execute benchmark gap analysis.

        Args:
            input: Benchmark parameters including entity and reference

        Returns:
            BenchmarkOutput with gaps, priorities, and roadmap
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build comparison context
            entity_text = self._format_entity(input.entity)
            benchmark_text = self._format_benchmark(input.benchmark)

            dimensions_text = ""
            if input.dimensions:
                dimensions_text = f"\nDimensions to compare: {', '.join(input.dimensions)}"
            else:
                dimensions_text = "\nInfer dimensions from the benchmark structure."

            type_instruction = self._get_type_instruction(input.benchmark_type)

            system_prompt = f"""You are an expert analyst performing benchmark gap analysis.

Your task is to compare an entity against a reference benchmark.

Benchmark type: {input.benchmark_type}
{type_instruction}
{dimensions_text}

Analysis approach:
1. Identify all comparison dimensions
2. For each dimension:
   - Assess entity's current state
   - Compare to benchmark state
   - Calculate gap magnitude (0-100%)
   - Determine direction (behind/ahead/at_parity)
   - Assess priority and effort to close
   - Recommend actions
3. Calculate overall gap score (100 = at benchmark)
4. Determine maturity level
5. Prioritize roadmap actions

Return a structured JSON response with:
- dimension_gaps: Array with:
  - dimension: Name
  - current_state: Entity's state description
  - benchmark_state: Benchmark state description
  - gap_magnitude: 0-100 (0 = no gap)
  - gap_direction: behind | ahead | at_parity
  - priority: high | medium | low
  - effort_to_close: low | medium | high
  - recommendations: List of actions
- overall_gap_score: 0-100 (100 = fully at benchmark)
- maturity_level: emerging | developing | established | leading
- critical_gaps: Top gaps to address
- strengths_vs_benchmark: Areas ahead
- gap_summary: 2-3 sentence executive summary
- roadmap_priorities: [{action, priority, effort, impact}]"""

            user_prompt = f"""Benchmark this entity:

CURRENT STATE:
{entity_text}

BENCHMARK:
{benchmark_text}

Perform gap analysis and return structured JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_benchmark_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build dimension gaps
            gaps_data = result.get("dimension_gaps", [])
            dimension_gaps = [
                DimensionGap(
                    dimension=g.get("dimension", ""),
                    current_state=g.get("current_state", ""),
                    benchmark_state=g.get("benchmark_state", ""),
                    gap_magnitude=float(g.get("gap_magnitude", 0)),
                    gap_direction=g.get("gap_direction", "behind"),
                    priority=g.get("priority", "medium"),
                    effort_to_close=g.get("effort_to_close", "medium"),
                    recommendations=g.get("recommendations", []),
                )
                for g in gaps_data
            ]

            overall_gap_score = float(result.get("overall_gap_score", 50))

            duration = (datetime.utcnow() - start_time).total_seconds()

            return BenchmarkOutput(
                success=True,
                dimension_gaps=dimension_gaps,
                overall_gap_score=round(overall_gap_score, 1),
                maturity_level=result.get("maturity_level", "developing"),
                critical_gaps=result.get("critical_gaps", []),
                strengths_vs_benchmark=result.get("strengths_vs_benchmark", []),
                gap_summary=result.get("gap_summary", ""),
                roadmap_priorities=result.get("roadmap_priorities", []),
                confidence_score=0.85,
                quality_score=overall_gap_score / 100,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"BenchmarkRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return BenchmarkOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_entity(self, entity: Dict[str, Any]) -> str:
        """Format entity for prompt."""
        lines = []
        name = entity.get("name", "Entity")
        lines.append(f"**{name}**")

        for key, value in entity.items():
            if key != "name":
                if isinstance(value, dict):
                    lines.append(f"  {key}:")
                    for k, v in value.items():
                        lines.append(f"    - {k}: {v}")
                elif isinstance(value, list):
                    items = ", ".join(str(v)[:50] for v in value[:5])
                    lines.append(f"  {key}: [{items}]")
                else:
                    lines.append(f"  {key}: {value}")

        return "\n".join(lines)

    def _format_benchmark(self, benchmark: Dict[str, Any]) -> str:
        """Format benchmark for prompt."""
        lines = []
        name = benchmark.get("name", "Reference Benchmark")
        lines.append(f"**{name}**")

        for key, value in benchmark.items():
            if key != "name":
                if isinstance(value, dict):
                    lines.append(f"  {key}:")
                    for k, v in value.items():
                        lines.append(f"    - {k}: {v}")
                elif isinstance(value, list):
                    items = ", ".join(str(v)[:50] for v in value[:5])
                    lines.append(f"  {key}: [{items}]")
                else:
                    lines.append(f"  {key}: {value}")

        return "\n".join(lines)

    def _get_type_instruction(self, benchmark_type: str) -> str:
        """Get benchmark type instructions."""
        type_map = {
            "best_practice": "Compare against industry best practices. Be aspirational.",
            "industry_average": "Compare against typical industry performance. Be realistic.",
            "target": "Compare against defined targets. Be objective about gaps.",
            "competitor": "Compare against specific competitor. Focus on differentiators.",
        }
        return type_map.get(benchmark_type, type_map["best_practice"])

    def _parse_benchmark_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "dimension_gaps": [],
                "overall_gap_score": 50,
                "maturity_level": "developing",
                "critical_gaps": [],
                "strengths_vs_benchmark": [],
                "gap_summary": content[:300],
                "roadmap_priorities": [],
            }
