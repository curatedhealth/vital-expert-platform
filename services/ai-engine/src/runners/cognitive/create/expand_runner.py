"""
ExpandRunner - Expand section using recursive elaboration.

Algorithmic Core: Recursive Elaboration
- Expands sparse content into detailed sections
- Maintains context from parent document
- Applies depth-first elaboration

Use Cases:
- Section expansion
- Detail addition
- Content deepening
- Outline fleshing
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

class ExpandInput(TaskRunnerInput):
    """Input schema for ExpandRunner."""

    section_content: str = Field(
        ...,
        description="Content to expand"
    )
    section_context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Context {parent_doc_summary, preceding_section, following_section}"
    )
    expansion_type: str = Field(
        default="detail",
        description="Type: detail | example | analysis | evidence | narrative"
    )
    target_length: str = Field(
        default="2x",
        description="Target expansion: 1.5x | 2x | 3x | specific_word_count"
    )
    style_constraints: Dict[str, str] = Field(
        default_factory=dict,
        description="Style constraints to maintain"
    )
    expansion_depth: str = Field(
        default="moderate",
        description="Depth: shallow | moderate | deep"
    )


class ExpansionElement(TaskRunnerOutput):
    """An element added during expansion."""

    element_type: str = Field(
        default="",
        description="detail | example | evidence | explanation | transition"
    )
    content: str = Field(default="", description="The added content")
    position: str = Field(default="", description="Where this goes in section")
    rationale: str = Field(default="", description="Why this was added")


class ExpandOutput(TaskRunnerOutput):
    """Output schema for ExpandRunner."""

    expanded_content: str = Field(default="", description="Fully expanded content")
    original_word_count: int = Field(default=0, description="Original word count")
    expanded_word_count: int = Field(default=0, description="Expanded word count")
    expansion_ratio: float = Field(default=1.0, description="Actual expansion ratio")
    elements_added: List[ExpansionElement] = Field(
        default_factory=list,
        description="Elements added during expansion"
    )
    key_additions: List[str] = Field(
        default_factory=list,
        description="Summary of key additions"
    )
    context_maintained: bool = Field(
        default=True,
        description="Whether context was maintained"
    )
    style_preserved: bool = Field(
        default=True,
        description="Whether style was preserved"
    )
    further_expansion_possible: List[str] = Field(
        default_factory=list,
        description="Areas that could expand more"
    )


# =============================================================================
# ExpandRunner Implementation
# =============================================================================

@register_task_runner
class ExpandRunner(TaskRunner[ExpandInput, ExpandOutput]):
    """
    Recursive elaboration section expansion runner.

    This runner expands sparse content into detailed sections
    while maintaining document context.

    Algorithmic Pattern:
        1. Analyze section for expansion points
        2. Identify expansion type opportunities
        3. Apply recursive elaboration:
           - Add details
           - Insert examples
           - Provide evidence
           - Explain concepts
        4. Maintain style consistency
        5. Preserve document flow

    Best Used For:
        - Fleshing out outlines
        - Adding depth to drafts
        - Elaborating key points
        - Content enrichment
    """

    runner_id = "expand"
    name = "Expand Runner"
    description = "Expand section using recursive elaboration"
    category = TaskRunnerCategory.CREATE
    algorithmic_core = "recursive_elaboration"
    max_duration_seconds = 120

    InputType = ExpandInput
    OutputType = ExpandOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ExpandRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.4,
            max_tokens=3000,
        )

    async def execute(self, input: ExpandInput) -> ExpandOutput:
        """
        Execute section expansion.

        Args:
            input: Expansion parameters

        Returns:
            ExpandOutput with expanded content
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            context_text = ""
            if input.section_context:
                context_text = f"\nDocument context:\n{json.dumps(input.section_context, indent=2, default=str)[:1000]}"

            style_text = ""
            if input.style_constraints:
                style_text = "\nStyle constraints:\n" + "\n".join(
                    f"- {k}: {v}" for k, v in input.style_constraints.items()
                )

            depth_instruction = self._get_depth_instruction(input.expansion_depth)
            target_instruction = self._get_target_instruction(input.target_length)

            original_words = len(input.section_content.split())

            system_prompt = f"""You are an expert content expander using recursive elaboration.

Your task is to expand content while maintaining quality and context.

Expansion type: {input.expansion_type}
{target_instruction}
{depth_instruction}

Recursive elaboration approach:
1. Identify expansion opportunities:
   - Concepts that need more detail
   - Claims that need evidence
   - Ideas that need examples
   - Transitions that need smoothing
2. For each opportunity, add appropriate content:
   - detail: Specific information
   - example: Concrete illustration
   - evidence: Supporting data/facts
   - explanation: Clarification
   - transition: Flow improvement
3. Maintain:
   - Original voice and style
   - Document context and flow
   - Logical coherence
4. Track what was added and why

Return a structured JSON response with:
- expanded_content: The fully expanded section
- original_word_count: Original words
- expanded_word_count: New word count
- expansion_ratio: expanded/original
- elements_added: Array with:
  - element_type: detail | example | evidence | explanation | transition
  - content: What was added
  - position: Where in section
  - rationale: Why added
- key_additions: Summary of main additions
- context_maintained: boolean
- style_preserved: boolean
- further_expansion_possible: Areas that could expand more"""

            user_prompt = f"""Expand this section:

ORIGINAL CONTENT ({original_words} words):
{input.section_content}
{context_text}
{style_text}

Expand the content and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_expand_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build elements
            elements_data = result.get("elements_added", [])
            elements = [
                ExpansionElement(
                    element_type=e.get("element_type", "detail"),
                    content=e.get("content", ""),
                    position=e.get("position", ""),
                    rationale=e.get("rationale", ""),
                )
                for e in elements_data
            ]

            expanded_content = result.get("expanded_content", "")
            expanded_words = len(expanded_content.split())
            ratio = expanded_words / original_words if original_words > 0 else 1.0

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ExpandOutput(
                success=True,
                expanded_content=expanded_content,
                original_word_count=original_words,
                expanded_word_count=result.get("expanded_word_count", expanded_words),
                expansion_ratio=result.get("expansion_ratio", ratio),
                elements_added=elements,
                key_additions=result.get("key_additions", []),
                context_maintained=result.get("context_maintained", True),
                style_preserved=result.get("style_preserved", True),
                further_expansion_possible=result.get("further_expansion_possible", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ExpandRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ExpandOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "shallow": "Shallow expansion: Add minimal detail. Quick elaboration only.",
            "moderate": "Moderate expansion: Balanced detail. Add examples and explanations.",
            "deep": "Deep expansion: Thorough elaboration. Multiple examples, evidence, analysis.",
        }
        return instructions.get(depth, instructions["moderate"])

    def _get_target_instruction(self, target: str) -> str:
        """Get target length instruction."""
        if target.endswith("x"):
            multiplier = target.replace("x", "")
            return f"Target expansion: {multiplier}x the original length"
        else:
            return f"Target length: {target} words"

    def _parse_expand_response(self, content: str) -> Dict[str, Any]:
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
                "expanded_content": content,
                "original_word_count": 0,
                "expanded_word_count": len(content.split()),
                "expansion_ratio": 1.0,
                "elements_added": [],
                "key_additions": [],
                "context_maintained": True,
                "style_preserved": True,
                "further_expansion_possible": [],
            }
