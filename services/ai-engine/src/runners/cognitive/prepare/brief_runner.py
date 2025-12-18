"""
BriefRunner - Generate brief using narrative construction.

Algorithmic Core: Narrative Construction
- Synthesizes context and Q&A into coherent narrative
- Structures information for quick consumption
- Adapts tone and depth to audience

Use Cases:
- Executive briefings
- Meeting prep documents
- Situation reports
- Stakeholder updates
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

class BriefInput(TaskRunnerInput):
    """Input schema for BriefRunner."""

    context: Dict[str, Any] = Field(
        ...,
        description="Context package from ContextRunner"
    )
    qa_pairs: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Q&A pairs from AnticipateRunner"
    )
    audience: str = Field(
        default="executive",
        description="Target audience: executive | technical | general | board"
    )
    brief_type: str = Field(
        default="situation",
        description="Type: situation | decision | update | action"
    )
    length_preference: str = Field(
        default="standard",
        description="Length: concise | standard | comprehensive"
    )
    tone: str = Field(
        default="professional",
        description="Tone: formal | professional | conversational"
    )


class BriefSection(TaskRunnerOutput):
    """A section of the brief."""

    section_name: str = Field(default="", description="Section name")
    content: str = Field(default="", description="Section content")
    key_points: List[str] = Field(default_factory=list, description="Key points")
    supporting_data: List[str] = Field(default_factory=list, description="Supporting data")


class BriefOutput(TaskRunnerOutput):
    """Output schema for BriefRunner."""

    title: str = Field(default="", description="Brief title")
    executive_summary: str = Field(default="", description="BLUF - Bottom Line Up Front")
    sections: List[BriefSection] = Field(
        default_factory=list,
        description="Brief sections"
    )
    full_brief: str = Field(default="", description="Complete formatted brief")
    key_messages: List[str] = Field(
        default_factory=list,
        description="3-5 key messages"
    )
    action_items: List[str] = Field(
        default_factory=list,
        description="Required actions"
    )
    open_questions: List[str] = Field(
        default_factory=list,
        description="Questions to be resolved"
    )
    appendix_items: List[str] = Field(
        default_factory=list,
        description="Items for appendix"
    )
    word_count: int = Field(default=0, description="Brief word count")
    read_time_minutes: int = Field(default=0, description="Estimated read time")


# =============================================================================
# BriefRunner Implementation
# =============================================================================

@register_task_runner
class BriefRunner(TaskRunner[BriefInput, BriefOutput]):
    """
    Narrative construction briefing runner.

    This runner synthesizes context and Q&A into a coherent
    briefing document.

    Algorithmic Pattern:
        1. Analyze context and Q&A inputs
        2. Determine narrative structure for brief type
        3. Construct BLUF (Bottom Line Up Front)
        4. Build sections with supporting points
        5. Extract key messages and actions
        6. Format for target audience

    Best Used For:
        - Executive briefings
        - Board presentations
        - Situation reports
        - Decision memos
    """

    runner_id = "brief"
    name = "Brief Runner"
    description = "Generate brief using narrative construction"
    category = TaskRunnerCategory.PREPARE
    algorithmic_core = "narrative_construction"
    max_duration_seconds = 120

    InputType = BriefInput
    OutputType = BriefOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize BriefRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: BriefInput) -> BriefOutput:
        """
        Execute brief generation.

        Args:
            input: Brief parameters

        Returns:
            BriefOutput with formatted brief
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            context_text = json.dumps(input.context, indent=2, default=str)[:2500]

            qa_text = ""
            if input.qa_pairs:
                qa_text = "\nKey Q&A prepared:\n" + json.dumps(
                    input.qa_pairs[:5], indent=2, default=str
                )[:1000]

            structure = self._get_brief_structure(input.brief_type)
            length_instruction = self._get_length_instruction(input.length_preference)

            system_prompt = f"""You are an expert at creating executive briefings.

Your task is to synthesize context into a compelling brief.

Audience: {input.audience}
Brief type: {input.brief_type}
Tone: {input.tone}
{length_instruction}

{structure}

Narrative construction approach:
1. Start with BLUF (Bottom Line Up Front)
   - The single most important thing to know
   - Recommendation or situation in one sentence
2. Build supporting sections
   - Each section advances the narrative
   - Support points with evidence
3. Extract 3-5 key messages
   - Memorable takeaways
4. List action items
   - Clear, assignable, time-bound
5. Note open questions
   - What needs resolution

Return a structured JSON response with:
- title: Brief title
- executive_summary: BLUF (2-3 sentences max)
- sections: Array with:
  - section_name: Name
  - content: Narrative content
  - key_points: Bullet points
  - supporting_data: Evidence/data
- full_brief: Complete formatted brief (markdown)
- key_messages: 3-5 key messages
- action_items: Required actions
- open_questions: Unresolved questions
- appendix_items: Supporting materials list
- word_count: Total words
- read_time_minutes: Estimated read time"""

            user_prompt = f"""Generate a brief from this context:

CONTEXT:
{context_text}
{qa_text}

Create the brief and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_brief_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build sections
            sections_data = result.get("sections", [])
            sections = [
                BriefSection(
                    section_name=s.get("section_name", ""),
                    content=s.get("content", ""),
                    key_points=s.get("key_points", []),
                    supporting_data=s.get("supporting_data", []),
                )
                for s in sections_data
            ]

            # Calculate metrics
            full_brief = result.get("full_brief", "")
            word_count = len(full_brief.split())
            read_time = max(1, word_count // 200)  # ~200 wpm reading speed

            duration = (datetime.utcnow() - start_time).total_seconds()

            return BriefOutput(
                success=True,
                title=result.get("title", ""),
                executive_summary=result.get("executive_summary", ""),
                sections=sections,
                full_brief=full_brief,
                key_messages=result.get("key_messages", []),
                action_items=result.get("action_items", []),
                open_questions=result.get("open_questions", []),
                appendix_items=result.get("appendix_items", []),
                word_count=result.get("word_count", word_count),
                read_time_minutes=result.get("read_time_minutes", read_time),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"BriefRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return BriefOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_brief_structure(self, brief_type: str) -> str:
        """Get structure guidance for brief type."""
        structures = {
            "situation": """Structure for SITUATION BRIEF:
1. Executive Summary (BLUF)
2. Current Situation
3. Key Stakeholders
4. Risks & Opportunities
5. Recommended Next Steps""",
            "decision": """Structure for DECISION BRIEF:
1. Executive Summary (Recommendation)
2. Decision Context
3. Options Considered
4. Analysis & Comparison
5. Recommendation & Rationale""",
            "update": """Structure for UPDATE BRIEF:
1. Executive Summary (Status)
2. Progress Since Last Update
3. Current Status
4. Issues & Blockers
5. Next Period Goals""",
            "action": """Structure for ACTION BRIEF:
1. Executive Summary (Call to Action)
2. Why Now
3. Proposed Actions
4. Resources Required
5. Success Criteria""",
        }
        return structures.get(brief_type, structures["situation"])

    def _get_length_instruction(self, length: str) -> str:
        """Get length instruction."""
        instructions = {
            "concise": "Concise: Keep to 300-500 words. Only essential information.",
            "standard": "Standard: Target 500-800 words. Balanced coverage.",
            "comprehensive": "Comprehensive: 800-1200 words. Full detail and context.",
        }
        return instructions.get(length, instructions["standard"])

    def _parse_brief_response(self, content: str) -> Dict[str, Any]:
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
                "title": "",
                "executive_summary": "",
                "sections": [],
                "full_brief": content,
                "key_messages": [],
                "action_items": [],
                "open_questions": [],
                "appendix_items": [],
                "word_count": 0,
                "read_time_minutes": 0,
            }
