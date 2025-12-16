"""
ExploreRunner - Deep dive on theme using depth-first analysis.

Algorithmic Core: Depth-First Analysis
- Takes a theme and explores it vertically in detail
- Uncovers nuances, sub-components, and evidence
- Builds deep understanding of a single area

Use Cases:
- Deep dive on competitive threat
- Detailed mechanism of action analysis
- Regulatory pathway deep dive
- KOL network deep analysis
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

class ExploreInput(TaskRunnerInput):
    """Input schema for ExploreRunner."""

    theme: str = Field(..., description="Theme to explore deeply")
    context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Prior context from scanning or other sources"
    )
    depth: int = Field(
        default=3,
        description="Analysis depth level 1-5 (5 = maximum detail)"
    )
    questions: List[str] = Field(
        default_factory=list,
        description="Specific questions to answer during exploration"
    )
    evidence_required: bool = Field(
        default=True,
        description="Whether to gather supporting evidence"
    )


class Finding(TaskRunnerOutput):
    """A detailed finding from exploration."""

    finding_id: str = Field(default="", description="Unique finding identifier")
    title: str = Field(default="", description="Finding title")
    content: str = Field(default="", description="Detailed finding content")
    importance: str = Field(default="medium", description="high | medium | low")
    evidence: List[str] = Field(default_factory=list, description="Supporting evidence")
    implications: List[str] = Field(default_factory=list, description="Business implications")
    confidence: float = Field(default=0.0, description="Confidence in finding 0-1")


class ExploreOutput(TaskRunnerOutput):
    """Output schema for ExploreRunner."""

    findings: List[Finding] = Field(
        default_factory=list,
        description="Detailed findings from exploration"
    )
    sub_themes: List[str] = Field(
        default_factory=list,
        description="Sub-themes discovered during exploration"
    )
    evidence: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="All supporting evidence gathered"
    )
    key_insights: List[str] = Field(
        default_factory=list,
        description="Key insights distilled from findings"
    )
    questions_answered: Dict[str, str] = Field(
        default_factory=dict,
        description="Answers to input questions"
    )
    further_questions: List[str] = Field(
        default_factory=list,
        description="New questions raised by exploration"
    )
    exploration_depth: float = Field(
        default=0.0,
        description="Actual depth achieved 0-1"
    )


# =============================================================================
# ExploreRunner Implementation
# =============================================================================

@register_task_runner
class ExploreRunner(TaskRunner[ExploreInput, ExploreOutput]):
    """
    Depth-first theme analysis runner.

    This runner performs vertical exploration of a theme, uncovering
    details, nuances, and evidence that surface-level scanning misses.

    Algorithmic Pattern:
        1. Parse theme and prior context
        2. Identify key dimensions to explore
        3. For each dimension, drill down iteratively
        4. Gather evidence for each finding
        5. Synthesize insights across dimensions
        6. Identify new questions raised

    Best Used For:
        - Following up on scan results
        - Deep competitive analysis
        - Technical mechanism exploration
        - Stakeholder deep profiling
    """

    runner_id = "explore"
    name = "Explore Runner"
    description = "Deep dive on theme using depth-first analysis"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "depth_first_analysis"
    max_duration_seconds = 150

    InputType = ExploreInput
    OutputType = ExploreOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ExploreRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: ExploreInput) -> ExploreOutput:
        """
        Execute depth-first theme exploration.

        Args:
            input: Exploration parameters including theme, context, and depth

        Returns:
            ExploreOutput with findings, evidence, and insights
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build context-aware prompt
            context_section = ""
            if input.context:
                context_section = f"\nPrior context:\n{self._format_context(input.context)}"

            questions_section = ""
            if input.questions:
                questions_section = f"\nSpecific questions to answer:\n" + "\n".join(
                    f"- {q}" for q in input.questions
                )

            depth_instruction = self._get_depth_instruction(input.depth)

            system_prompt = f"""You are an expert analyst performing depth-first exploration.

Your task is to deeply explore a theme, uncovering nuances and evidence.

{depth_instruction}

Analysis approach:
1. Identify the core aspects of this theme
2. For each aspect, drill down to understand:
   - What exactly is happening
   - Why it matters
   - What evidence supports it
   - What are the implications
3. Look for non-obvious connections
4. Challenge assumptions
5. Note what questions remain

Return a structured JSON response with:
- findings: Array of finding objects with:
  - finding_id: Unique ID (F1, F2, etc.)
  - title: Concise finding title
  - content: Detailed explanation (2-3 paragraphs)
  - importance: high | medium | low
  - evidence: List of supporting evidence points
  - implications: Business/strategic implications
  - confidence: 0.0-1.0 confidence level
- sub_themes: Discovered sub-themes
- key_insights: Top 3-5 distilled insights
- questions_answered: {{question: answer}} for input questions
- further_questions: New questions raised"""

            user_prompt = f"""Explore this theme in depth: {input.theme}
{context_section}
{questions_section}

Depth level: {input.depth}/5
Evidence required: {input.evidence_required}

Perform a thorough depth-first exploration and return structured JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_explore_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build output
            findings_data = result.get("findings", [])
            findings = [
                Finding(
                    finding_id=f.get("finding_id", f"F{i+1}"),
                    title=f.get("title", ""),
                    content=f.get("content", ""),
                    importance=f.get("importance", "medium"),
                    evidence=f.get("evidence", []),
                    implications=f.get("implications", []),
                    confidence=float(f.get("confidence", 0.5)),
                )
                for i, f in enumerate(findings_data)
            ]

            # Collect all evidence
            all_evidence = []
            for f in findings:
                for e in f.evidence:
                    all_evidence.append({"finding": f.title, "evidence": e})

            # Calculate exploration depth
            exploration_depth = self._calculate_depth(findings, input)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ExploreOutput(
                success=True,
                findings=findings,
                sub_themes=result.get("sub_themes", []),
                evidence=all_evidence,
                key_insights=result.get("key_insights", []),
                questions_answered=result.get("questions_answered", {}),
                further_questions=result.get("further_questions", []),
                exploration_depth=exploration_depth,
                confidence_score=exploration_depth,
                quality_score=exploration_depth,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ExploreRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ExploreOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: int) -> str:
        """Get depth-specific instructions."""
        depth_map = {
            1: "Surface-level exploration. Focus on main points only.",
            2: "Moderate depth. Include key supporting details.",
            3: "Substantial depth. Explore nuances and evidence.",
            4: "Deep exploration. Challenge assumptions, find non-obvious insights.",
            5: "Maximum depth. Leave no stone unturned. Question everything.",
        }
        return depth_map.get(depth, depth_map[3])

    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context dictionary for prompt."""
        lines = []
        for key, value in context.items():
            if isinstance(value, list):
                lines.append(f"- {key}: {', '.join(str(v) for v in value[:5])}")
            else:
                lines.append(f"- {key}: {str(value)[:200]}")
        return "\n".join(lines) or "No prior context"

    def _parse_explore_response(self, content: str) -> Dict[str, Any]:
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
                "findings": [{"title": "Exploration", "content": content[:500]}],
                "sub_themes": [],
                "key_insights": [],
                "questions_answered": {},
                "further_questions": [],
            }

    def _calculate_depth(self, findings: List[Finding], input: ExploreInput) -> float:
        """Calculate exploration depth score."""
        if not findings:
            return 0.0

        # Factors: finding count, evidence depth, confidence distribution
        finding_score = min(len(findings) / 5, 1.0)
        avg_evidence = sum(len(f.evidence) for f in findings) / len(findings)
        evidence_score = min(avg_evidence / 3, 1.0)
        avg_confidence = sum(f.confidence for f in findings) / len(findings)
        high_importance = sum(1 for f in findings if f.importance == "high") / len(findings)

        return (finding_score * 0.25 + evidence_score * 0.25 + avg_confidence * 0.25 + high_importance * 0.25)
