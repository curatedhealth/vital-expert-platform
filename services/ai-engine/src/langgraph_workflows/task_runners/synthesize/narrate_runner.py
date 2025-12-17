"""
NarrateRunner - Build narrative using story arc construction.

Algorithmic Core: Story Arc Construction / Narrative Synthesis
- Organizes themes and insights into narrative
- Builds coherent story arc
- Creates compelling synthesis

Use Cases:
- Research synthesis writing
- Report generation
- Executive summary creation
- Findings presentation
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

class NarrateInput(TaskRunnerInput):
    """Input schema for NarrateRunner."""

    themes: List[Dict[str, Any]] = Field(
        ...,
        description="Themes to weave [{theme_id, theme_name, description, key_points}]"
    )
    insights: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Key insights [{insight_id, content, importance}]"
    )
    narrative_type: str = Field(
        default="synthesis",
        description="Type: synthesis | story | argument | report | summary"
    )
    audience: str = Field(
        default="general",
        description="Audience: executive | technical | general | academic"
    )
    tone: str = Field(
        default="professional",
        description="Tone: professional | conversational | academic | persuasive"
    )
    target_length: str = Field(
        default="medium",
        description="Length: short | medium | long"
    )
    key_message: Optional[str] = Field(
        default=None,
        description="Central message to convey"
    )


class NarrativeSection(TaskRunnerOutput):
    """A section of the narrative."""

    section_id: str = Field(default="", description="Section ID")
    section_type: str = Field(
        default="body",
        description="opening | context | body | climax | resolution | conclusion"
    )
    title: str = Field(default="", description="Section title")
    content: str = Field(default="", description="Section content")
    themes_covered: List[str] = Field(
        default_factory=list,
        description="Theme IDs covered"
    )
    word_count: int = Field(default=0, description="Word count")


class NarrateOutput(TaskRunnerOutput):
    """Output schema for NarrateRunner."""

    narrative: str = Field(default="", description="Full narrative")
    sections: List[NarrativeSection] = Field(
        default_factory=list,
        description="Narrative sections"
    )
    title: str = Field(default="", description="Narrative title")
    subtitle: Optional[str] = Field(default=None, description="Subtitle if appropriate")
    opening_hook: str = Field(default="", description="Opening hook/lead")
    key_takeaways: List[str] = Field(
        default_factory=list,
        description="Key takeaways"
    )
    closing_call_to_action: Optional[str] = Field(
        default=None,
        description="Call to action if appropriate"
    )
    word_count: int = Field(default=0, description="Total word count")
    themes_woven: List[str] = Field(
        default_factory=list,
        description="Themes integrated"
    )
    narrative_arc: str = Field(
        default="",
        description="Description of narrative arc"
    )
    coherence_score: float = Field(
        default=0.0,
        description="Narrative coherence 0-100"
    )


# =============================================================================
# NarrateRunner Implementation
# =============================================================================

@register_task_runner
class NarrateRunner(TaskRunner[NarrateInput, NarrateOutput]):
    """
    Story arc narrative construction runner.

    This runner weaves themes and insights into a
    coherent, compelling narrative.

    Algorithmic Pattern:
        1. Analyze themes and insights
        2. Design story arc:
           - Opening/hook
           - Context setting
           - Body/development
           - Climax/key insight
           - Resolution
           - Conclusion
        3. Weave themes throughout
        4. Ensure coherence
        5. Match tone to audience

    Best Used For:
        - Research synthesis
        - Report writing
        - Executive summaries
        - Presentation scripts
    """

    runner_id = "narrate"
    name = "Narrate Runner"
    description = "Build narrative using story arc construction"
    category = TaskRunnerCategory.SYNTHESIZE
    algorithmic_core = "story_arc_construction"
    max_duration_seconds = 180

    InputType = NarrateInput
    OutputType = NarrateOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize NarrateRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.5,  # Creative for narrative
            max_tokens=4000,
        )

    async def execute(self, input: NarrateInput) -> NarrateOutput:
        """
        Execute narrative construction.

        Args:
            input: Narrative parameters

        Returns:
            NarrateOutput with complete narrative
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            themes_text = json.dumps(input.themes, indent=2, default=str)[:2000]

            insights_text = ""
            if input.insights:
                insights_text = f"\nInsights:\n{json.dumps(input.insights, indent=2, default=str)[:1000]}"

            key_message_text = ""
            if input.key_message:
                key_message_text = f"\nKey message to convey: {input.key_message}"

            length_instruction = self._get_length_instruction(input.target_length)
            audience_instruction = self._get_audience_instruction(input.audience)

            system_prompt = f"""You are an expert narrative writer using story arc construction.

Your task is to weave themes and insights into a compelling narrative.

Narrative type: {input.narrative_type}
Audience: {input.audience}
{audience_instruction}
Tone: {input.tone}
{length_instruction}

Story arc construction approach:
1. Analyze material:
   - Identify central themes
   - Find the "story" in the data
   - Determine key message
2. Design arc structure:
   - opening: Hook to capture attention
   - context: Set the stage
   - body: Develop themes progressively
   - climax: Key insight/revelation
   - resolution: How themes connect
   - conclusion: Synthesis and takeaways
3. Weave themes:
   - Integrate all themes naturally
   - Build connections between themes
   - Create narrative flow
4. Match audience:
   - Appropriate vocabulary
   - Right level of detail
   - Suitable tone
5. Ensure coherence:
   - Logical progression
   - Smooth transitions
   - Unified message

Return a structured JSON response with:
- narrative: Full narrative text
- sections: Array with:
  - section_id: S1, S2, etc.
  - section_type: opening | context | body | climax | resolution | conclusion
  - title: Section title
  - content: Section content
  - themes_covered: Theme IDs covered
  - word_count: Words in section
- title: Narrative title
- subtitle: Subtitle if appropriate
- opening_hook: The hook/lead
- key_takeaways: Key points
- closing_call_to_action: CTA if appropriate
- word_count: Total words
- themes_woven: Theme IDs integrated
- narrative_arc: Description of arc used
- coherence_score: 0-100"""

            user_prompt = f"""Build a narrative from these themes and insights:

THEMES:
{themes_text}
{insights_text}
{key_message_text}

Create narrative and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_narrate_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build sections
            sections_data = result.get("sections", [])
            sections = [
                NarrativeSection(
                    section_id=s.get("section_id", f"S{idx+1}"),
                    section_type=s.get("section_type", "body"),
                    title=s.get("title", ""),
                    content=s.get("content", ""),
                    themes_covered=s.get("themes_covered", []),
                    word_count=int(s.get("word_count", len(s.get("content", "").split()))),
                )
                for idx, s in enumerate(sections_data)
            ]

            # Calculate total word count
            total_words = sum(s.word_count for s in sections)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return NarrateOutput(
                success=True,
                narrative=result.get("narrative", ""),
                sections=sections,
                title=result.get("title", ""),
                subtitle=result.get("subtitle"),
                opening_hook=result.get("opening_hook", ""),
                key_takeaways=result.get("key_takeaways", []),
                closing_call_to_action=result.get("closing_call_to_action"),
                word_count=total_words or result.get("word_count", 0),
                themes_woven=result.get("themes_woven", []),
                narrative_arc=result.get("narrative_arc", ""),
                coherence_score=float(result.get("coherence_score", 80)),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"NarrateRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return NarrateOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_length_instruction(self, length: str) -> str:
        """Get length instruction."""
        instructions = {
            "short": "Target length: 200-400 words. Concise and focused.",
            "medium": "Target length: 500-800 words. Balanced depth.",
            "long": "Target length: 1000-1500 words. Comprehensive coverage.",
        }
        return instructions.get(length, instructions["medium"])

    def _get_audience_instruction(self, audience: str) -> str:
        """Get audience instruction."""
        instructions = {
            "executive": "Executive: High-level, business impact focus, minimal jargon.",
            "technical": "Technical: Detailed, precise terminology, methodology focus.",
            "general": "General: Accessible language, clear explanations.",
            "academic": "Academic: Formal, rigorous, citation-ready.",
        }
        return instructions.get(audience, instructions["general"])

    def _parse_narrate_response(self, content: str) -> Dict[str, Any]:
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
                "narrative": content,
                "sections": [],
                "title": "",
                "subtitle": None,
                "opening_hook": "",
                "key_takeaways": [],
                "closing_call_to_action": None,
                "word_count": len(content.split()),
                "themes_woven": [],
                "narrative_arc": "",
                "coherence_score": 0,
            }
