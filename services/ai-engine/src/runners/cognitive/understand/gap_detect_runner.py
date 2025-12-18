"""
GapDetectRunner - Find missing information using set difference analysis.

Algorithmic Core: Set Difference Analysis
- Compares current knowledge against required coverage
- Identifies what's missing, incomplete, or outdated
- Prioritizes gaps by business impact

Use Cases:
- Evidence gap analysis for market access
- Competitive intelligence coverage audit
- Regulatory submission completeness check
- KOL engagement coverage assessment
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

class GapDetectInput(TaskRunnerInput):
    """Input schema for GapDetectRunner."""

    knowledge_set: Dict[str, Any] = Field(
        ...,
        description="Current knowledge inventory (what we know)"
    )
    required_coverage: List[str] = Field(
        default_factory=list,
        description="Required coverage areas (what we need)"
    )
    reference_framework: Optional[str] = Field(
        default=None,
        description="Reference framework for completeness (e.g., 'AMCP dossier', 'HTA submission')"
    )
    domain: str = Field(
        default="general",
        description="Domain context for gap analysis"
    )
    criticality_threshold: str = Field(
        default="medium",
        description="Minimum gap criticality to report: low | medium | high"
    )


class Gap(TaskRunnerOutput):
    """A detected knowledge gap."""

    gap_id: str = Field(default="", description="Unique gap identifier")
    area: str = Field(default="", description="Area where gap exists")
    description: str = Field(default="", description="Description of what's missing")
    gap_type: str = Field(
        default="missing",
        description="Type: missing | incomplete | outdated | conflicting"
    )
    criticality: str = Field(default="medium", description="high | medium | low")
    impact: str = Field(default="", description="Business impact of this gap")
    remediation: str = Field(default="", description="How to fill this gap")
    effort_estimate: str = Field(default="medium", description="low | medium | high effort to fill")


class GapDetectOutput(TaskRunnerOutput):
    """Output schema for GapDetectRunner."""

    gaps: List[Gap] = Field(
        default_factory=list,
        description="All identified gaps"
    )
    coverage_score: float = Field(
        default=0.0,
        description="Overall coverage completeness 0-1"
    )
    priority_gaps: List[str] = Field(
        default_factory=list,
        description="Highest priority gap areas"
    )
    coverage_by_area: Dict[str, float] = Field(
        default_factory=dict,
        description="Coverage score per area"
    )
    gap_summary: str = Field(
        default="",
        description="Executive summary of gap analysis"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommended actions to address gaps"
    )


# =============================================================================
# GapDetectRunner Implementation
# =============================================================================

@register_task_runner
class GapDetectRunner(TaskRunner[GapDetectInput, GapDetectOutput]):
    """
    Set difference knowledge gap analysis runner.

    This runner compares what you have against what you need,
    identifying and prioritizing gaps in knowledge or evidence.

    Algorithmic Pattern:
        1. Parse knowledge inventory and requirements
        2. Map knowledge to required coverage areas
        3. Identify missing areas (set difference)
        4. Assess incompleteness in covered areas
        5. Check for outdated information
        6. Prioritize gaps by criticality and effort

    Best Used For:
        - Evidence planning
        - Dossier completeness
        - Competitive coverage audit
        - Research portfolio assessment
    """

    runner_id = "gap_detect"
    name = "Gap Detect Runner"
    description = "Find missing info using set difference analysis"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "set_difference_analysis"
    max_duration_seconds = 120

    InputType = GapDetectInput
    OutputType = GapDetectOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize GapDetectRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,
            max_tokens=2500,
        )

    async def execute(self, input: GapDetectInput) -> GapDetectOutput:
        """
        Execute gap detection analysis.

        Args:
            input: Gap detection parameters including knowledge set and requirements

        Returns:
            GapDetectOutput with gaps, coverage scores, and recommendations
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build analysis prompt
            knowledge_summary = self._format_knowledge_set(input.knowledge_set)
            requirements_text = "\n".join(f"- {r}" for r in input.required_coverage) or "Not specified"

            framework_instruction = ""
            if input.reference_framework:
                framework_instruction = f"\nUse {input.reference_framework} as the reference standard for completeness."

            system_prompt = f"""You are an expert gap analyst performing set difference analysis.

Your task is to compare current knowledge against requirements and identify gaps.

Domain: {input.domain}
Criticality threshold: Report gaps at {input.criticality_threshold} level or higher
{framework_instruction}

Analysis approach:
1. Map current knowledge to required areas
2. Identify completely MISSING areas (not covered at all)
3. Identify INCOMPLETE areas (partially covered)
4. Identify OUTDATED information (covered but stale)
5. Identify CONFLICTING information (contradictions)
6. Assess business impact of each gap
7. Suggest remediation actions

Return a structured JSON response with:
- gaps: Array of gap objects with:
  - gap_id: Unique ID (G1, G2, etc.)
  - area: Which area this gap is in
  - description: What specifically is missing/incomplete
  - gap_type: missing | incomplete | outdated | conflicting
  - criticality: high | medium | low
  - impact: Business impact description
  - remediation: How to fill this gap
  - effort_estimate: low | medium | high
- coverage_score: Overall 0.0-1.0 coverage
- coverage_by_area: {{area: score}} for each required area
- gap_summary: 2-3 sentence executive summary
- recommendations: Top 3-5 actions to take"""

            user_prompt = f"""Analyze gaps in this knowledge set:

CURRENT KNOWLEDGE:
{knowledge_summary}

REQUIRED COVERAGE:
{requirements_text}

Perform comprehensive gap detection and return structured JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_gap_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build output
            gaps_data = result.get("gaps", [])
            gaps = [
                Gap(
                    gap_id=g.get("gap_id", f"G{i+1}"),
                    area=g.get("area", ""),
                    description=g.get("description", ""),
                    gap_type=g.get("gap_type", "missing"),
                    criticality=g.get("criticality", "medium"),
                    impact=g.get("impact", ""),
                    remediation=g.get("remediation", ""),
                    effort_estimate=g.get("effort_estimate", "medium"),
                )
                for i, g in enumerate(gaps_data)
            ]

            # Filter by criticality threshold
            criticality_order = {"low": 1, "medium": 2, "high": 3}
            threshold_value = criticality_order.get(input.criticality_threshold, 2)
            filtered_gaps = [
                g for g in gaps
                if criticality_order.get(g.criticality, 2) >= threshold_value
            ]

            # Identify priority gaps (high criticality)
            priority_gaps = [g.area for g in filtered_gaps if g.criticality == "high"]

            coverage_score = float(result.get("coverage_score", 0.5))
            duration = (datetime.utcnow() - start_time).total_seconds()

            return GapDetectOutput(
                success=True,
                gaps=filtered_gaps,
                coverage_score=coverage_score,
                priority_gaps=priority_gaps,
                coverage_by_area=result.get("coverage_by_area", {}),
                gap_summary=result.get("gap_summary", ""),
                recommendations=result.get("recommendations", []),
                confidence_score=0.8 if filtered_gaps else 0.5,
                quality_score=coverage_score,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"GapDetectRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return GapDetectOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_knowledge_set(self, knowledge: Dict[str, Any]) -> str:
        """Format knowledge dictionary for prompt."""
        lines = []
        for area, content in knowledge.items():
            if isinstance(content, dict):
                sub_items = ", ".join(f"{k}: {v}" for k, v in list(content.items())[:3])
                lines.append(f"**{area}**: {sub_items}")
            elif isinstance(content, list):
                items = ", ".join(str(c)[:50] for c in content[:5])
                lines.append(f"**{area}**: [{items}]")
            else:
                lines.append(f"**{area}**: {str(content)[:200]}")
        return "\n".join(lines) or "Empty knowledge set"

    def _parse_gap_response(self, content: str) -> Dict[str, Any]:
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
                "gaps": [{"area": "Unknown", "description": content[:200], "gap_type": "missing"}],
                "coverage_score": 0.5,
                "coverage_by_area": {},
                "gap_summary": "Gap analysis could not be parsed.",
                "recommendations": [],
            }
