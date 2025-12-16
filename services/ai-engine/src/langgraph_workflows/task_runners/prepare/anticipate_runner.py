"""
AnticipateRunner - Predict Q&A using Theory of Mind.

Algorithmic Core: Theory of Mind / Perspective Taking
- Models stakeholder perspectives and concerns
- Predicts questions they're likely to ask
- Generates appropriate responses

Use Cases:
- Meeting Q&A preparation
- Investor pitch preparation
- Regulatory meeting prep
- Media training
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

class AnticipateInput(TaskRunnerInput):
    """Input schema for AnticipateRunner."""

    context: Dict[str, Any] = Field(
        ...,
        description="Context package from ContextRunner"
    )
    stakeholders: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Stakeholder profiles [{name, role, interests, concerns}]"
    )
    topic_focus: str = Field(
        default="",
        description="Primary topic of discussion"
    )
    sensitivity_areas: List[str] = Field(
        default_factory=list,
        description="Sensitive areas to anticipate questions about"
    )
    anticipation_mode: str = Field(
        default="balanced",
        description="Mode: friendly | balanced | adversarial"
    )
    max_questions: int = Field(default=10, description="Max questions to generate")


class AnticipatedQuestion(TaskRunnerOutput):
    """A single anticipated Q&A pair."""

    question_id: str = Field(default="", description="Unique question ID")
    question: str = Field(default="", description="The anticipated question")
    asker_profile: str = Field(default="", description="Who might ask this")
    motivation: str = Field(default="", description="Why they'd ask")
    difficulty: str = Field(default="medium", description="easy | medium | hard | trap")
    category: str = Field(
        default="",
        description="factual | strategic | challenging | personal | hypothetical"
    )
    recommended_response: str = Field(default="", description="Suggested response")
    talking_points: List[str] = Field(
        default_factory=list,
        description="Key points to include"
    )
    pitfalls_to_avoid: List[str] = Field(
        default_factory=list,
        description="What not to say"
    )
    follow_up_likely: bool = Field(default=False, description="Expect follow-up?")
    follow_up_questions: List[str] = Field(
        default_factory=list,
        description="Likely follow-ups"
    )


class AnticipateOutput(TaskRunnerOutput):
    """Output schema for AnticipateRunner."""

    qa_pairs: List[AnticipatedQuestion] = Field(
        default_factory=list,
        description="Anticipated Q&A pairs"
    )
    critical_questions: List[AnticipatedQuestion] = Field(
        default_factory=list,
        description="Must-prepare questions"
    )
    trap_questions: List[AnticipatedQuestion] = Field(
        default_factory=list,
        description="Potentially trap questions"
    )
    questions_by_stakeholder: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Questions grouped by asker"
    )
    themes_identified: List[str] = Field(
        default_factory=list,
        description="Common question themes"
    )
    preparation_summary: str = Field(default="", description="Preparation summary")
    confidence_gaps: List[str] = Field(
        default_factory=list,
        description="Areas needing more preparation"
    )


# =============================================================================
# AnticipateRunner Implementation
# =============================================================================

@register_task_runner
class AnticipateRunner(TaskRunner[AnticipateInput, AnticipateOutput]):
    """
    Theory of Mind Q&A anticipation runner.

    This runner models stakeholder perspectives to predict
    questions and prepare appropriate responses.

    Algorithmic Pattern:
        1. Analyze stakeholder profiles and interests
        2. Apply perspective taking for each stakeholder
        3. Generate questions from their viewpoint
        4. Classify question difficulty/type
        5. Craft appropriate responses
        6. Identify follow-up chains

    Best Used For:
        - Meeting preparation
        - Pitch practice
        - Media training
        - Regulatory prep
    """

    runner_id = "anticipate"
    name = "Anticipate Runner"
    description = "Predict Q&A using Theory of Mind"
    category = TaskRunnerCategory.PREPARE
    algorithmic_core = "theory_of_mind"
    max_duration_seconds = 120

    InputType = AnticipateInput
    OutputType = AnticipateOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize AnticipateRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.4,  # Some creativity for question variety
            max_tokens=3500,
        )

    async def execute(self, input: AnticipateInput) -> AnticipateOutput:
        """
        Execute Q&A anticipation.

        Args:
            input: Anticipation parameters

        Returns:
            AnticipateOutput with Q&A pairs
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            context_text = json.dumps(input.context, indent=2, default=str)[:2000]

            stakeholders_text = ""
            if input.stakeholders:
                stakeholders_text = "\nStakeholders:\n" + json.dumps(
                    input.stakeholders, indent=2, default=str
                )[:1500]

            topic_text = ""
            if input.topic_focus:
                topic_text = f"\nTopic focus: {input.topic_focus}"

            sensitivity_text = ""
            if input.sensitivity_areas:
                sensitivity_text = "\nSensitive areas:\n" + "\n".join(
                    f"- {s}" for s in input.sensitivity_areas
                )

            mode_instruction = self._get_mode_instruction(input.anticipation_mode)

            system_prompt = f"""You are an expert at anticipating questions using Theory of Mind.

Your task is to predict questions stakeholders will ask and prepare responses.

{mode_instruction}
Generate up to {input.max_questions} questions.

Theory of Mind approach:
1. For each stakeholder:
   - Step into their perspective
   - Consider their interests, concerns, and goals
   - What would they want to know?
   - What might worry them?
   - What opportunities would they explore?
2. Generate questions they'd likely ask
3. Classify each question:
   - factual: Seeking information
   - strategic: About direction/plans
   - challenging: Testing/probing
   - personal: About individuals
   - hypothetical: What-if scenarios
4. Assess difficulty:
   - easy: Straightforward answer
   - medium: Requires thought
   - hard: Complex, nuanced
   - trap: Potentially dangerous
5. Prepare responses with talking points
6. Identify pitfalls to avoid

Return a structured JSON response with:
- qa_pairs: Array with:
  - question_id: Q1, Q2, etc.
  - question: The question
  - asker_profile: Who might ask
  - motivation: Why they'd ask
  - difficulty: easy | medium | hard | trap
  - category: factual | strategic | challenging | personal | hypothetical
  - recommended_response: Suggested answer
  - talking_points: Key points
  - pitfalls_to_avoid: What not to say
  - follow_up_likely: boolean
  - follow_up_questions: Likely follow-ups
- themes_identified: Common question themes
- preparation_summary: 2-3 sentence summary
- confidence_gaps: Areas needing more prep"""

            user_prompt = f"""Anticipate questions for this context:

CONTEXT:
{context_text}
{stakeholders_text}
{topic_text}
{sensitivity_text}

Generate Q&A pairs and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_anticipate_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build Q&A pairs
            qa_data = result.get("qa_pairs", [])
            qa_pairs = [
                AnticipatedQuestion(
                    question_id=q.get("question_id", f"Q{i+1}"),
                    question=q.get("question", ""),
                    asker_profile=q.get("asker_profile", ""),
                    motivation=q.get("motivation", ""),
                    difficulty=q.get("difficulty", "medium"),
                    category=q.get("category", "factual"),
                    recommended_response=q.get("recommended_response", ""),
                    talking_points=q.get("talking_points", []),
                    pitfalls_to_avoid=q.get("pitfalls_to_avoid", []),
                    follow_up_likely=q.get("follow_up_likely", False),
                    follow_up_questions=q.get("follow_up_questions", []),
                )
                for i, q in enumerate(qa_data)
            ]

            # Identify critical and trap questions
            critical = [q for q in qa_pairs if q.difficulty in ["hard", "trap"]]
            traps = [q for q in qa_pairs if q.difficulty == "trap"]

            # Group by stakeholder
            by_stakeholder: Dict[str, List[str]] = {}
            for q in qa_pairs:
                asker = q.asker_profile or "General"
                if asker not in by_stakeholder:
                    by_stakeholder[asker] = []
                by_stakeholder[asker].append(q.question)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return AnticipateOutput(
                success=True,
                qa_pairs=qa_pairs,
                critical_questions=critical,
                trap_questions=traps,
                questions_by_stakeholder=by_stakeholder,
                themes_identified=result.get("themes_identified", []),
                preparation_summary=result.get("preparation_summary", ""),
                confidence_gaps=result.get("confidence_gaps", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"AnticipateRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return AnticipateOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_mode_instruction(self, mode: str) -> str:
        """Get instruction based on anticipation mode."""
        instructions = {
            "friendly": "Friendly mode: Assume constructive intent. Focus on clarifying questions.",
            "balanced": "Balanced mode: Mix of supportive and challenging questions.",
            "adversarial": "Adversarial mode: Assume skeptical audience. Focus on tough, probing questions.",
        }
        return instructions.get(mode, instructions["balanced"])

    def _parse_anticipate_response(self, content: str) -> Dict[str, Any]:
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
                "qa_pairs": [],
                "themes_identified": [],
                "preparation_summary": content[:200],
                "confidence_gaps": [],
            }
