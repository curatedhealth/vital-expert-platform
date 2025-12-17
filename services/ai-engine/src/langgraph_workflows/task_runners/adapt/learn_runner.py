"""
LearnRunner - Extract lessons using after-action review.

Algorithmic Core: After-Action Review / Lessons Learned
- Reviews completed actions/projects
- Extracts lessons and insights
- Codifies learning for reuse

Use Cases:
- Project retrospectives
- Incident reviews
- Continuous improvement
- Knowledge management
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

class LearnInput(TaskRunnerInput):
    """Input schema for LearnRunner."""

    event_description: str = Field(
        ...,
        description="Event/project to review"
    )
    intended_outcome: str = Field(
        ...,
        description="What was intended"
    )
    actual_outcome: str = Field(
        ...,
        description="What actually happened"
    )
    context: Optional[str] = Field(
        default=None,
        description="Additional context"
    )
    review_depth: str = Field(
        default="standard",
        description="Depth: quick | standard | comprehensive"
    )


class Lesson(TaskRunnerOutput):
    """A lesson learned."""

    lesson_id: str = Field(default="", description="Lesson ID")
    lesson_title: str = Field(default="", description="Lesson title")
    lesson_type: str = Field(
        default="improvement",
        description="success | improvement | warning | insight"
    )
    description: str = Field(default="", description="Description")
    root_cause: Optional[str] = Field(
        default=None,
        description="Root cause if applicable"
    )
    applicability: str = Field(
        default="",
        description="When this applies"
    )
    action_recommendation: str = Field(
        default="",
        description="What to do differently"
    )
    priority: str = Field(
        default="medium",
        description="low | medium | high"
    )


class LearnOutput(TaskRunnerOutput):
    """Output schema for LearnRunner."""

    lessons: List[Lesson] = Field(
        default_factory=list,
        description="Extracted lessons"
    )
    what_went_well: List[str] = Field(
        default_factory=list,
        description="Successes to replicate"
    )
    what_could_improve: List[str] = Field(
        default_factory=list,
        description="Areas for improvement"
    )
    gap_analysis: str = Field(
        default="",
        description="Gap between intended and actual"
    )
    contributing_factors: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Factors by type {positive: [], negative: []}"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Actionable recommendations"
    )
    knowledge_artifacts: List[str] = Field(
        default_factory=list,
        description="Knowledge to codify"
    )
    learn_summary: str = Field(default="", description="Summary")


# =============================================================================
# LearnRunner Implementation
# =============================================================================

@register_task_runner
class LearnRunner(TaskRunner[LearnInput, LearnOutput]):
    """
    After-action review lessons learned runner.

    This runner conducts after-action reviews to
    extract lessons and insights.

    Algorithmic Pattern:
        1. Analyze intended vs actual outcome
        2. Identify gap
        3. Extract lessons:
           - What worked (replicate)
           - What didn't (improve)
           - Key insights
        4. Find root causes
        5. Recommend actions
        6. Codify knowledge

    Best Used For:
        - Project retrospectives
        - Incident reviews
        - Continuous improvement
        - Organizational learning
    """

    runner_id = "learn"
    name = "Learn Runner"
    description = "Extract lessons using after-action review"
    category = TaskRunnerCategory.ADAPT
    algorithmic_core = "after_action_review"
    max_duration_seconds = 120

    InputType = LearnInput
    OutputType = LearnOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize LearnRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: LearnInput) -> LearnOutput:
        """
        Execute after-action review.

        Args:
            input: Review parameters

        Returns:
            LearnOutput with lessons learned
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            depth_instruction = self._get_depth_instruction(input.review_depth)

            system_prompt = f"""You are an expert at after-action reviews and organizational learning.

Your task is to extract lessons from an event.

{depth_instruction}

After-Action Review framework:
1. What was supposed to happen? (intended)
2. What actually happened? (actual)
3. Why was there a difference? (gap analysis)
4. What went well? (replicate)
5. What could improve? (change)
6. What are the key lessons?

Lesson types:
- success: Something that worked well to replicate
- improvement: Something to do differently
- warning: A risk or pitfall to avoid
- insight: A non-obvious learning

For each lesson:
- Root cause (if applicable)
- When this lesson applies
- What action to take
- Priority (low/medium/high)

Return a structured JSON response with:
- lessons: Array with:
  - lesson_id: L1, L2, etc.
  - lesson_title: Title
  - lesson_type: success | improvement | warning | insight
  - description: Description
  - root_cause: Root cause (if applicable)
  - applicability: When this applies
  - action_recommendation: What to do
  - priority: low | medium | high
- what_went_well: [successes to replicate]
- what_could_improve: [improvements needed]
- gap_analysis: Gap between intended and actual
- contributing_factors: {{positive: [], negative: []}}
- recommendations: [actionable recommendations]
- knowledge_artifacts: [knowledge to codify/document]
- learn_summary: 2-3 sentence summary"""

            user_prompt = f"""Review this event:

EVENT: {input.event_description}

INTENDED OUTCOME: {input.intended_outcome}

ACTUAL OUTCOME: {input.actual_outcome}
{context_text}

Extract lessons and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_learn_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build lessons
            lessons_data = result.get("lessons", [])
            lessons = [
                Lesson(
                    lesson_id=l.get("lesson_id", f"L{idx+1}"),
                    lesson_title=l.get("lesson_title", ""),
                    lesson_type=l.get("lesson_type", "improvement"),
                    description=l.get("description", ""),
                    root_cause=l.get("root_cause"),
                    applicability=l.get("applicability", ""),
                    action_recommendation=l.get("action_recommendation", ""),
                    priority=l.get("priority", "medium"),
                )
                for idx, l in enumerate(lessons_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return LearnOutput(
                success=True,
                lessons=lessons,
                what_went_well=result.get("what_went_well", []),
                what_could_improve=result.get("what_could_improve", []),
                gap_analysis=result.get("gap_analysis", ""),
                contributing_factors=result.get("contributing_factors", {}),
                recommendations=result.get("recommendations", []),
                knowledge_artifacts=result.get("knowledge_artifacts", []),
                learn_summary=result.get("learn_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"LearnRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return LearnOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "quick": "Depth: Quick review. Top 3-4 lessons.",
            "standard": "Depth: Standard. Comprehensive lessons (5-8).",
            "comprehensive": "Depth: Comprehensive. Deep analysis with root causes.",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_learn_response(self, content: str) -> Dict[str, Any]:
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
                "lessons": [],
                "what_went_well": [],
                "what_could_improve": [],
                "gap_analysis": "",
                "contributing_factors": {},
                "recommendations": [],
                "knowledge_artifacts": [],
                "learn_summary": content[:200],
            }
