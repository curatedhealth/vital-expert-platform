"""
CritiqueRunner - Apply rubric using weighted scoring.

Algorithmic Core: Weighted Scoring / Rubric Application
- Evaluates artifact against defined criteria/rubric
- Applies weighted scoring across dimensions
- Provides detailed justification for each score

Use Cases:
- Document quality assessment
- Proposal evaluation
- Clinical trial protocol review
- Marketing material compliance check
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

class RubricCriterion(TaskRunnerOutput):
    """A single criterion in a rubric."""

    criterion_id: str = Field(default="", description="Unique criterion identifier")
    name: str = Field(default="", description="Criterion name")
    description: str = Field(default="", description="What this criterion evaluates")
    weight: float = Field(default=1.0, description="Weight in overall score (0-1)")
    max_score: int = Field(default=5, description="Maximum score for this criterion")
    scoring_guide: Dict[int, str] = Field(
        default_factory=dict,
        description="Score descriptions {1: 'Poor', 5: 'Excellent'}"
    )


class CritiqueInput(TaskRunnerInput):
    """Input schema for CritiqueRunner."""

    artifact: str = Field(..., description="The artifact/document to critique")
    rubric: List[Dict[str, Any]] = Field(
        ...,
        description="Rubric criteria with weights and scoring guides"
    )
    context: Optional[str] = Field(
        default=None,
        description="Additional context about the artifact"
    )
    strictness: str = Field(
        default="balanced",
        description="Evaluation strictness: lenient | balanced | strict"
    )


class CriterionScore(TaskRunnerOutput):
    """Score for a single criterion."""

    criterion_id: str = Field(default="", description="Criterion identifier")
    criterion_name: str = Field(default="", description="Criterion name")
    score: int = Field(default=0, description="Score awarded")
    max_score: int = Field(default=5, description="Maximum possible score")
    weight: float = Field(default=1.0, description="Criterion weight")
    weighted_score: float = Field(default=0.0, description="Score * weight")
    justification: str = Field(default="", description="Reasoning for score")
    strengths: List[str] = Field(default_factory=list, description="Identified strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Identified weaknesses")
    suggestions: List[str] = Field(default_factory=list, description="Improvement suggestions")


class CritiqueOutput(TaskRunnerOutput):
    """Output schema for CritiqueRunner."""

    criterion_scores: List[CriterionScore] = Field(
        default_factory=list,
        description="Scores for each criterion"
    )
    overall_score: float = Field(default=0.0, description="Weighted overall score 0-100")
    grade: str = Field(default="", description="Letter grade (A-F)")
    executive_summary: str = Field(default="", description="Brief overall assessment")
    top_strengths: List[str] = Field(default_factory=list, description="Top 3 strengths")
    critical_weaknesses: List[str] = Field(default_factory=list, description="Critical issues")
    priority_improvements: List[str] = Field(default_factory=list, description="Priority actions")


# =============================================================================
# CritiqueRunner Implementation
# =============================================================================

@register_task_runner
class CritiqueRunner(TaskRunner[CritiqueInput, CritiqueOutput]):
    """
    Rubric-based artifact critique runner.

    This runner evaluates artifacts against defined criteria,
    applying weighted scoring with detailed justifications.

    Algorithmic Pattern:
        1. Parse rubric criteria and weights
        2. For each criterion, evaluate artifact
        3. Apply scoring guide to determine score
        4. Calculate weighted scores
        5. Aggregate to overall score
        6. Synthesize strengths/weaknesses

    Best Used For:
        - Document quality review
        - Proposal scoring
        - Compliance assessment
        - Content evaluation
    """

    runner_id = "critique"
    name = "Critique Runner"
    description = "Apply rubric using weighted scoring"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "weighted_scoring"
    max_duration_seconds = 120

    InputType = CritiqueInput
    OutputType = CritiqueOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize CritiqueRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: CritiqueInput) -> CritiqueOutput:
        """
        Execute rubric-based critique.

        Args:
            input: Critique parameters including artifact and rubric

        Returns:
            CritiqueOutput with scores, justifications, and recommendations
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build rubric description
            rubric_text = self._format_rubric(input.rubric)
            strictness_instruction = self._get_strictness_instruction(input.strictness)

            context_section = ""
            if input.context:
                context_section = f"\nContext: {input.context}"

            # Truncate artifact if too long
            artifact_text = input.artifact[:6000] if len(input.artifact) > 6000 else input.artifact

            system_prompt = f"""You are an expert evaluator applying a structured rubric.

Your task is to critique an artifact against defined criteria.

{strictness_instruction}

EVALUATION RUBRIC:
{rubric_text}

Evaluation approach:
1. Read the artifact carefully
2. For each criterion:
   - Assess how well the artifact meets the criterion
   - Assign a score based on the scoring guide
   - Provide specific justification with examples
   - Note strengths and weaknesses
   - Suggest improvements
3. Be objective and evidence-based
4. Reference specific parts of the artifact

Return a structured JSON response with:
- criterion_scores: Array of score objects with:
  - criterion_id: ID from rubric
  - criterion_name: Name from rubric
  - score: Integer score (1-max_score)
  - max_score: Maximum score for criterion
  - weight: Weight from rubric
  - justification: 2-3 sentences explaining score
  - strengths: List of specific strengths
  - weaknesses: List of specific weaknesses
  - suggestions: List of improvement suggestions
- executive_summary: 2-3 sentence overall assessment
- top_strengths: Top 3 overall strengths
- critical_weaknesses: Most critical issues (if any)
- priority_improvements: Top 3 priority actions"""

            user_prompt = f"""Critique this artifact:
{context_section}

ARTIFACT:
{artifact_text}

Apply the rubric and return structured JSON evaluation."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_critique_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build criterion scores
            scores_data = result.get("criterion_scores", [])
            criterion_scores = []
            total_weighted = 0.0
            total_weight = 0.0

            for i, s in enumerate(scores_data):
                weight = float(s.get("weight", 1.0))
                score = int(s.get("score", 3))
                max_score = int(s.get("max_score", 5))
                weighted_score = (score / max_score) * weight

                criterion_scores.append(CriterionScore(
                    criterion_id=s.get("criterion_id", f"C{i+1}"),
                    criterion_name=s.get("criterion_name", ""),
                    score=score,
                    max_score=max_score,
                    weight=weight,
                    weighted_score=weighted_score,
                    justification=s.get("justification", ""),
                    strengths=s.get("strengths", []),
                    weaknesses=s.get("weaknesses", []),
                    suggestions=s.get("suggestions", []),
                ))
                total_weighted += weighted_score
                total_weight += weight

            # Calculate overall score (0-100)
            overall_score = (total_weighted / total_weight * 100) if total_weight > 0 else 0
            grade = self._score_to_grade(overall_score)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return CritiqueOutput(
                success=True,
                criterion_scores=criterion_scores,
                overall_score=round(overall_score, 1),
                grade=grade,
                executive_summary=result.get("executive_summary", ""),
                top_strengths=result.get("top_strengths", [])[:3],
                critical_weaknesses=result.get("critical_weaknesses", []),
                priority_improvements=result.get("priority_improvements", [])[:3],
                confidence_score=0.85,
                quality_score=overall_score / 100,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"CritiqueRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return CritiqueOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_rubric(self, rubric: List[Dict[str, Any]]) -> str:
        """Format rubric for prompt."""
        lines = []
        for i, criterion in enumerate(rubric):
            c_id = criterion.get("id", f"C{i+1}")
            name = criterion.get("name", f"Criterion {i+1}")
            desc = criterion.get("description", "")
            weight = criterion.get("weight", 1.0)
            max_score = criterion.get("max_score", 5)

            lines.append(f"**{c_id}. {name}** (Weight: {weight}, Max: {max_score})")
            if desc:
                lines.append(f"   {desc}")

            scoring_guide = criterion.get("scoring_guide", {})
            if scoring_guide:
                for score, description in sorted(scoring_guide.items()):
                    lines.append(f"   {score}: {description}")
            lines.append("")

        return "\n".join(lines)

    def _get_strictness_instruction(self, strictness: str) -> str:
        """Get strictness-specific instructions."""
        strictness_map = {
            "lenient": "Be generous in scoring. Give benefit of doubt. Focus on positives.",
            "balanced": "Apply fair, balanced scoring. Acknowledge both strengths and weaknesses.",
            "strict": "Apply rigorous standards. Only award high scores for exceptional work.",
        }
        return strictness_map.get(strictness, strictness_map["balanced"])

    def _score_to_grade(self, score: float) -> str:
        """Convert numeric score to letter grade."""
        if score >= 93:
            return "A"
        elif score >= 90:
            return "A-"
        elif score >= 87:
            return "B+"
        elif score >= 83:
            return "B"
        elif score >= 80:
            return "B-"
        elif score >= 77:
            return "C+"
        elif score >= 73:
            return "C"
        elif score >= 70:
            return "C-"
        elif score >= 67:
            return "D+"
        elif score >= 60:
            return "D"
        else:
            return "F"

    def _parse_critique_response(self, content: str) -> Dict[str, Any]:
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
                "criterion_scores": [],
                "executive_summary": content[:300],
                "top_strengths": [],
                "critical_weaknesses": [],
                "priority_improvements": [],
            }
