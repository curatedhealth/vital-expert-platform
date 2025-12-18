"""
AlignmentRunner - Assess alignment using alignment matrix.

Algorithmic Core: Alignment Matrix / Gap Analysis
- Assesses alignment between entities
- Identifies gaps and conflicts
- Recommends alignment actions

Use Cases:
- Strategic alignment
- Team alignment
- Project alignment
- Culture alignment
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

class AlignmentInput(TaskRunnerInput):
    """Input schema for AlignmentRunner."""

    entity_a: Dict[str, Any] = Field(
        ...,
        description="First entity (e.g., strategy, team, project)"
    )
    entity_b: Dict[str, Any] = Field(
        ...,
        description="Second entity to align with"
    )
    alignment_dimensions: List[str] = Field(
        default_factory=lambda: ["goals", "priorities", "resources", "timeline"],
        description="Dimensions to assess"
    )
    alignment_type: str = Field(
        default="strategic",
        description="strategic | operational | cultural | technical"
    )


class AlignmentGap(TaskRunnerOutput):
    """An alignment gap."""

    gap_id: str = Field(default="", description="Gap ID")
    dimension: str = Field(default="", description="Dimension")
    entity_a_position: str = Field(default="", description="Entity A position")
    entity_b_position: str = Field(default="", description="Entity B position")
    gap_type: str = Field(
        default="partial",
        description="aligned | partial | misaligned | conflicting"
    )
    severity: str = Field(
        default="medium",
        description="low | medium | high | critical"
    )
    impact: str = Field(default="", description="Impact of gap")
    root_cause: str = Field(default="", description="Root cause")
    resolution: str = Field(default="", description="How to resolve")


class AlignmentOutput(TaskRunnerOutput):
    """Output schema for AlignmentRunner."""

    overall_alignment_score: float = Field(
        default=0,
        description="Overall alignment 0-100"
    )
    alignment_level: str = Field(
        default="partial",
        description="fully_aligned | mostly_aligned | partial | misaligned"
    )
    dimension_scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Score per dimension"
    )
    gaps: List[AlignmentGap] = Field(
        default_factory=list,
        description="Identified gaps"
    )
    critical_gaps: List[str] = Field(
        default_factory=list,
        description="Critical gap IDs"
    )
    synergies: List[str] = Field(
        default_factory=list,
        description="Areas of strong alignment"
    )
    alignment_actions: List[str] = Field(
        default_factory=list,
        description="Recommended actions"
    )
    alignment_summary: str = Field(default="", description="Summary")


# =============================================================================
# AlignmentRunner Implementation
# =============================================================================

@register_task_runner
class AlignmentRunner(TaskRunner[AlignmentInput, AlignmentOutput]):
    """
    Alignment matrix gap analysis runner.

    This runner assesses alignment between entities
    and identifies gaps.

    Algorithmic Pattern:
        1. Parse both entities
        2. For each dimension:
           - Extract positions from both
           - Compare positions
           - Score alignment
           - Identify gaps
        3. Calculate overall alignment
        4. Identify synergies
        5. Recommend alignment actions

    Best Used For:
        - Strategic alignment
        - Team alignment
        - Project alignment
        - M&A integration
    """

    runner_id = "alignment"
    name = "Alignment Runner"
    description = "Assess alignment using alignment matrix"
    category = TaskRunnerCategory.ALIGN
    algorithmic_core = "alignment_matrix"
    max_duration_seconds = 120

    InputType = AlignmentInput
    OutputType = AlignmentOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize AlignmentRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=4000,
        )

    async def execute(self, input: AlignmentInput) -> AlignmentOutput:
        """
        Execute alignment assessment.

        Args:
            input: Alignment assessment parameters

        Returns:
            AlignmentOutput with gaps and actions
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            entity_a_text = json.dumps(input.entity_a, indent=2, default=str)[:2000]
            entity_b_text = json.dumps(input.entity_b, indent=2, default=str)[:2000]

            dimensions_text = ", ".join(input.alignment_dimensions)

            system_prompt = f"""You are an expert at organizational alignment assessment.

Your task is to assess alignment between two entities.

Alignment type: {input.alignment_type}
Dimensions to assess: {dimensions_text}

Alignment assessment approach:
1. For each dimension:
   - Extract position from Entity A
   - Extract position from Entity B
   - Compare positions
   - Score alignment (0-100)
   - Classify gap type:
     - aligned: Same position (90-100)
     - partial: Some overlap (60-89)
     - misaligned: Different positions (30-59)
     - conflicting: Opposing positions (0-29)
2. Calculate overall alignment (weighted average)
3. Identify critical gaps (severity=critical or high)
4. Identify synergies (strong alignment areas)
5. Recommend alignment actions

Gap analysis:
- Root cause: Why does this gap exist?
- Impact: What happens if not addressed?
- Resolution: How to close the gap

Return a structured JSON response with:
- overall_alignment_score: 0-100
- alignment_level: fully_aligned | mostly_aligned | partial | misaligned
- dimension_scores: {{dimension: score}}
- gaps: Array with:
  - gap_id: G1, G2, etc.
  - dimension: Dimension name
  - entity_a_position: A's position
  - entity_b_position: B's position
  - gap_type: aligned | partial | misaligned | conflicting
  - severity: low | medium | high | critical
  - impact: Impact description
  - root_cause: Why gap exists
  - resolution: How to resolve
- critical_gaps: [gap_ids with severity critical/high]
- synergies: [areas of strong alignment]
- alignment_actions: [recommended actions]
- alignment_summary: 2-3 sentence summary"""

            user_prompt = f"""Assess alignment between these entities:

ENTITY A:
{entity_a_text}

ENTITY B:
{entity_b_text}

Assess alignment and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_alignment_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build gaps
            gaps_data = result.get("gaps", [])
            gaps = [
                AlignmentGap(
                    gap_id=g.get("gap_id", f"G{idx+1}"),
                    dimension=g.get("dimension", ""),
                    entity_a_position=g.get("entity_a_position", ""),
                    entity_b_position=g.get("entity_b_position", ""),
                    gap_type=g.get("gap_type", "partial"),
                    severity=g.get("severity", "medium"),
                    impact=g.get("impact", ""),
                    root_cause=g.get("root_cause", ""),
                    resolution=g.get("resolution", ""),
                )
                for idx, g in enumerate(gaps_data)
            ]

            # Determine alignment level
            score = float(result.get("overall_alignment_score", 50))
            if score >= 90:
                level = "fully_aligned"
            elif score >= 70:
                level = "mostly_aligned"
            elif score >= 50:
                level = "partial"
            else:
                level = "misaligned"

            duration = (datetime.utcnow() - start_time).total_seconds()

            return AlignmentOutput(
                success=True,
                overall_alignment_score=score,
                alignment_level=result.get("alignment_level", level),
                dimension_scores=result.get("dimension_scores", {}),
                gaps=gaps,
                critical_gaps=result.get("critical_gaps", []),
                synergies=result.get("synergies", []),
                alignment_actions=result.get("alignment_actions", []),
                alignment_summary=result.get("alignment_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"AlignmentRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return AlignmentOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_alignment_response(self, content: str) -> Dict[str, Any]:
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
                "overall_alignment_score": 0,
                "alignment_level": "partial",
                "dimension_scores": {},
                "gaps": [],
                "critical_gaps": [],
                "synergies": [],
                "alignment_actions": [],
                "alignment_summary": content[:200],
            }
