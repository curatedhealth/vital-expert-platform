"""
StoryRunner - Craft story using narrative structure.

Algorithmic Core: Narrative Structure / Story Arc
- Constructs compelling narratives
- Uses classic story structures
- Engages through storytelling

Use Cases:
- Executive presentations
- Case studies
- Brand storytelling
- Change narratives
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

class StoryInput(TaskRunnerInput):
    """Input schema for StoryRunner."""

    story_purpose: str = Field(
        ...,
        description="What the story should achieve"
    )
    key_facts: List[str] = Field(
        ...,
        description="Facts to weave into story"
    )
    audience: str = Field(
        ...,
        description="Target audience"
    )
    story_type: str = Field(
        default="transformation",
        description="Type: transformation | challenge | discovery | journey"
    )
    tone: str = Field(
        default="professional",
        description="Tone: inspirational | professional | emotional | dramatic"
    )
    length: str = Field(
        default="medium",
        description="Length: short | medium | long"
    )


class StoryElement(TaskRunnerOutput):
    """A story element."""

    element_type: str = Field(
        default="",
        description="hook | setup | conflict | climax | resolution | call_to_action"
    )
    content: str = Field(default="", description="Content")
    purpose: str = Field(default="", description="Why this element")
    emotional_beat: str = Field(default="", description="Emotional state")


class StoryOutput(TaskRunnerOutput):
    """Output schema for StoryRunner."""

    story_title: str = Field(default="", description="Story title")
    story_elements: List[StoryElement] = Field(
        default_factory=list,
        description="Story elements in order"
    )
    full_story: str = Field(default="", description="Complete narrative")
    story_structure: str = Field(
        default="",
        description="Structure used"
    )
    central_message: str = Field(default="", description="Key takeaway")
    characters: List[str] = Field(
        default_factory=list,
        description="Characters/personas"
    )
    narrative_techniques: List[str] = Field(
        default_factory=list,
        description="Techniques used"
    )
    word_count: int = Field(default=0, description="Word count")
    story_summary: str = Field(default="", description="Summary")


# =============================================================================
# StoryRunner Implementation
# =============================================================================

@register_task_runner
class StoryRunner(TaskRunner[StoryInput, StoryOutput]):
    """
    Narrative structure storytelling runner.

    This runner crafts compelling stories using
    classic narrative structures.

    Algorithmic Pattern:
        1. Analyze purpose and facts
        2. Select story structure:
           - Hero's journey
           - Three-act structure
           - Problem-solution
        3. Build story elements:
           - Hook (grab attention)
           - Setup (context)
           - Conflict (tension)
           - Climax (peak)
           - Resolution (outcome)
           - Call to action
        4. Weave facts naturally
        5. Apply narrative techniques

    Best Used For:
        - Presentations
        - Case studies
        - Brand stories
        - Change narratives
    """

    runner_id = "story"
    name = "Story Runner"
    description = "Craft story using narrative structure"
    category = TaskRunnerCategory.INFLUENCE
    algorithmic_core = "narrative_structure"
    max_duration_seconds = 150

    InputType = StoryInput
    OutputType = StoryOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize StoryRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.6,  # Creative for storytelling
            max_tokens=4000,
        )

    async def execute(self, input: StoryInput) -> StoryOutput:
        """
        Execute story crafting.

        Args:
            input: Story crafting parameters

        Returns:
            StoryOutput with narrative
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            facts_text = "\n".join(f"- {f}" for f in input.key_facts)

            length_instruction = self._get_length_instruction(input.length)
            type_instruction = self._get_type_instruction(input.story_type)

            system_prompt = f"""You are an expert storyteller skilled in narrative structure.

Your task is to craft a compelling story from key facts.

Story purpose: {input.story_purpose}
Audience: {input.audience}
Tone: {input.tone}
{type_instruction}
{length_instruction}

Story structure elements:
1. Hook: Grab attention immediately
2. Setup: Establish context and characters
3. Conflict: Introduce tension/challenge
4. Rising action: Build toward peak
5. Climax: Peak moment of tension
6. Resolution: How things turned out
7. Call to action: What audience should do/feel

Narrative techniques to consider:
- Show don't tell
- Specific details
- Emotional beats
- Dialogue (if appropriate)
- Sensory language
- Metaphors/analogies
- Contrast (before/after)

Return a structured JSON response with:
- story_title: Compelling title
- story_elements: Array with:
  - element_type: hook | setup | conflict | rising_action | climax | resolution | call_to_action
  - content: The content
  - purpose: Why this element
  - emotional_beat: What emotion
- full_story: Complete narrative text
- story_structure: Structure used (e.g., "three-act")
- central_message: Key takeaway
- characters: [characters/personas featured]
- narrative_techniques: [techniques used]
- word_count: Approximate word count
- story_summary: What this story achieves"""

            user_prompt = f"""Craft a story using these facts:

PURPOSE: {input.story_purpose}

KEY FACTS:
{facts_text}

Create compelling narrative and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_story_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build story elements
            elements_data = result.get("story_elements", [])
            story_elements = [
                StoryElement(
                    element_type=e.get("element_type", ""),
                    content=e.get("content", ""),
                    purpose=e.get("purpose", ""),
                    emotional_beat=e.get("emotional_beat", ""),
                )
                for e in elements_data
            ]

            full_story = result.get("full_story", "")
            word_count = result.get("word_count", len(full_story.split()))

            duration = (datetime.utcnow() - start_time).total_seconds()

            return StoryOutput(
                success=True,
                story_title=result.get("story_title", ""),
                story_elements=story_elements,
                full_story=full_story,
                story_structure=result.get("story_structure", ""),
                central_message=result.get("central_message", ""),
                characters=result.get("characters", []),
                narrative_techniques=result.get("narrative_techniques", []),
                word_count=word_count,
                story_summary=result.get("story_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"StoryRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return StoryOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_length_instruction(self, length: str) -> str:
        """Get length instruction."""
        instructions = {
            "short": "Length: Short (150-300 words). Punchy, focused.",
            "medium": "Length: Medium (300-500 words). Balanced depth.",
            "long": "Length: Long (500-800 words). Rich detail.",
        }
        return instructions.get(length, instructions["medium"])

    def _get_type_instruction(self, story_type: str) -> str:
        """Get type instruction."""
        instructions = {
            "transformation": "Type: Transformation - Before/after change journey.",
            "challenge": "Type: Challenge - Overcoming obstacle.",
            "discovery": "Type: Discovery - Finding insight/solution.",
            "journey": "Type: Journey - Progress through stages.",
        }
        return instructions.get(story_type, instructions["transformation"])

    def _parse_story_response(self, content: str) -> Dict[str, Any]:
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
                "story_title": "",
                "story_elements": [],
                "full_story": content,
                "story_structure": "",
                "central_message": "",
                "characters": [],
                "narrative_techniques": [],
                "word_count": len(content.split()),
                "story_summary": "",
            }
