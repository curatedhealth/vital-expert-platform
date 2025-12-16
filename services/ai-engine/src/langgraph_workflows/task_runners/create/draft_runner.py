"""
DraftRunner - Generate draft using template expansion.

Algorithmic Core: Template Expansion / Latent Space Exploration
- Generates initial drafts from outlines/requirements
- Uses style banks for consistency
- Explores variations before converging

Use Cases:
- Document drafting
- Proposal generation
- Report creation
- Content authoring
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

class DraftInput(TaskRunnerInput):
    """Input schema for DraftRunner."""

    outline: List[str] = Field(
        ...,
        description="Document outline/structure"
    )
    requirements: Dict[str, Any] = Field(
        default_factory=dict,
        description="Requirements {purpose, audience, tone, length, constraints}"
    )
    source_material: List[str] = Field(
        default_factory=list,
        description="Source material to incorporate"
    )
    style_bank: Dict[str, str] = Field(
        default_factory=dict,
        description="Style bank {voice, terminology, formatting_rules}"
    )
    draft_type: str = Field(
        default="document",
        description="Type: document | proposal | report | article | email"
    )
    exploration_mode: str = Field(
        default="balanced",
        description="Mode: conservative | balanced | creative"
    )


class DraftSection(TaskRunnerOutput):
    """A section of the draft."""

    section_id: str = Field(default="", description="Section ID")
    heading: str = Field(default="", description="Section heading")
    content: str = Field(default="", description="Section content")
    word_count: int = Field(default=0, description="Section word count")
    sources_used: List[str] = Field(default_factory=list, description="Sources referenced")
    confidence: float = Field(default=0.8, description="Confidence in this section")
    notes: str = Field(default="", description="Notes for revision")


class DraftOutput(TaskRunnerOutput):
    """Output schema for DraftRunner."""

    title: str = Field(default="", description="Draft title")
    sections: List[DraftSection] = Field(
        default_factory=list,
        description="Draft sections"
    )
    full_draft: str = Field(default="", description="Complete draft text")
    executive_summary: str = Field(default="", description="Summary if applicable")
    word_count: int = Field(default=0, description="Total word count")
    style_adherence: float = Field(
        default=0.0,
        description="Style bank adherence 0-1"
    )
    requirements_met: List[str] = Field(
        default_factory=list,
        description="Requirements satisfied"
    )
    requirements_partial: List[str] = Field(
        default_factory=list,
        description="Requirements partially met"
    )
    revision_suggestions: List[str] = Field(
        default_factory=list,
        description="Suggested revisions"
    )
    alternative_angles: List[str] = Field(
        default_factory=list,
        description="Alternative approaches explored"
    )


# =============================================================================
# DraftRunner Implementation
# =============================================================================

@register_task_runner
class DraftRunner(TaskRunner[DraftInput, DraftOutput]):
    """
    Template expansion draft generation runner.

    This runner generates initial drafts using outline expansion
    with style bank consistency enforcement.

    Algorithmic Pattern:
        1. Parse outline and requirements
        2. Apply style bank constraints
        3. Explore latent space (multiple approaches)
        4. Generate section-by-section content
        5. Converge on consistent draft
        6. Assess requirements fulfillment

    Best Used For:
        - Document creation
        - Proposal writing
        - Report generation
        - Content development
    """

    runner_id = "draft"
    name = "Draft Runner"
    description = "Generate draft using template expansion"
    category = TaskRunnerCategory.CREATE
    algorithmic_core = "template_expansion"
    max_duration_seconds = 180

    InputType = DraftInput
    OutputType = DraftOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize DraftRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.5,  # Moderate creativity
            max_tokens=4000,
        )

    async def execute(self, input: DraftInput) -> DraftOutput:
        """
        Execute draft generation.

        Args:
            input: Draft parameters

        Returns:
            DraftOutput with generated draft
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            outline_text = "\n".join(f"- {item}" for item in input.outline)

            requirements_text = ""
            if input.requirements:
                import json
                requirements_text = f"\nRequirements:\n{json.dumps(input.requirements, indent=2)}"

            sources_text = ""
            if input.source_material:
                sources_text = "\nSource material:\n" + "\n".join(
                    f"[{i+1}] {s[:200]}..." for i, s in enumerate(input.source_material)
                )

            style_text = self._format_style_bank(input.style_bank)
            temp = self._get_exploration_temperature(input.exploration_mode)

            system_prompt = f"""You are an expert content creator using template expansion.

Your task is to generate a draft from an outline.

Draft type: {input.draft_type}
Exploration mode: {input.exploration_mode}

{style_text}

Template expansion approach:
1. For each outline section:
   - Expand into full content
   - Apply style bank rules
   - Incorporate relevant sources
   - Track confidence level
2. Maintain consistency across sections
3. Explore alternative angles briefly
4. Assess requirement fulfillment

Return a structured JSON response with:
- title: Draft title
- sections: Array with:
  - section_id: S1, S2, etc.
  - heading: Section heading
  - content: Full section content
  - word_count: Words in section
  - sources_used: Source numbers used
  - confidence: 0-1
  - notes: Revision notes
- full_draft: Complete draft (markdown)
- executive_summary: If appropriate
- word_count: Total words
- style_adherence: 0-1 how well style bank followed
- requirements_met: List of requirements satisfied
- requirements_partial: Partially met requirements
- revision_suggestions: What to improve
- alternative_angles: Other approaches considered"""

            user_prompt = f"""Generate a draft from this outline:

OUTLINE:
{outline_text}
{requirements_text}
{sources_text}

Generate the draft and return JSON."""

            # Execute LLM call (adjust temperature for exploration mode)
            self.llm.temperature = temp
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_draft_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build sections
            sections_data = result.get("sections", [])
            sections = [
                DraftSection(
                    section_id=s.get("section_id", f"S{i+1}"),
                    heading=s.get("heading", ""),
                    content=s.get("content", ""),
                    word_count=int(s.get("word_count", len(s.get("content", "").split()))),
                    sources_used=s.get("sources_used", []),
                    confidence=float(s.get("confidence", 0.8)),
                    notes=s.get("notes", ""),
                )
                for i, s in enumerate(sections_data)
            ]

            full_draft = result.get("full_draft", "")
            word_count = result.get("word_count", len(full_draft.split()))

            duration = (datetime.utcnow() - start_time).total_seconds()

            return DraftOutput(
                success=True,
                title=result.get("title", ""),
                sections=sections,
                full_draft=full_draft,
                executive_summary=result.get("executive_summary", ""),
                word_count=word_count,
                style_adherence=float(result.get("style_adherence", 0.8)),
                requirements_met=result.get("requirements_met", []),
                requirements_partial=result.get("requirements_partial", []),
                revision_suggestions=result.get("revision_suggestions", []),
                alternative_angles=result.get("alternative_angles", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"DraftRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return DraftOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_style_bank(self, style_bank: Dict[str, str]) -> str:
        """Format style bank for prompt."""
        if not style_bank:
            return "Style bank: None specified (use professional default)"

        lines = ["Style bank (MUST follow):"]
        for key, value in style_bank.items():
            lines.append(f"  - {key}: {value}")
        return "\n".join(lines)

    def _get_exploration_temperature(self, mode: str) -> float:
        """Get temperature for exploration mode."""
        temps = {
            "conservative": 0.3,
            "balanced": 0.5,
            "creative": 0.7,
        }
        return temps.get(mode, 0.5)

    def _parse_draft_response(self, content: str) -> Dict[str, Any]:
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
                "sections": [],
                "full_draft": content,
                "executive_summary": "",
                "word_count": len(content.split()),
                "style_adherence": 0.5,
                "requirements_met": [],
                "requirements_partial": [],
                "revision_suggestions": [],
                "alternative_angles": [],
            }
