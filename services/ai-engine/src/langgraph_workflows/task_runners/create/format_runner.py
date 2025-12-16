"""
FormatRunner - Apply formatting using style transformation.

Algorithmic Core: Style Transformation
- Transforms content to match format specifications
- Maintains semantic content while changing presentation
- Supports multiple output formats

Use Cases:
- Document formatting
- Style conversion
- Format migration
- Presentation adaptation
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

class FormatInput(TaskRunnerInput):
    """Input schema for FormatRunner."""

    content: str = Field(
        ...,
        description="Content to format"
    )
    format_spec: Dict[str, Any] = Field(
        default_factory=dict,
        description="Format specification {output_format, heading_style, list_style, etc.}"
    )
    target_format: str = Field(
        default="markdown",
        description="Target: markdown | html | latex | plain | structured_json"
    )
    style_guide: str = Field(
        default="default",
        description="Style guide: default | academic | business | technical | casual"
    )
    preserve_structure: bool = Field(
        default=True,
        description="Preserve original document structure"
    )


class FormatTransformation(TaskRunnerOutput):
    """A format transformation applied."""

    transformation_type: str = Field(
        default="",
        description="heading | list | emphasis | link | code | table"
    )
    before: str = Field(default="", description="Before transformation")
    after: str = Field(default="", description="After transformation")
    count: int = Field(default=0, description="Number of instances")


class FormatOutput(TaskRunnerOutput):
    """Output schema for FormatRunner."""

    formatted_content: str = Field(default="", description="Formatted content")
    output_format: str = Field(default="", description="Output format used")
    transformations_applied: List[FormatTransformation] = Field(
        default_factory=list,
        description="Transformations applied"
    )
    format_summary: Dict[str, int] = Field(
        default_factory=dict,
        description="Summary {headings: X, lists: Y, ...}"
    )
    validation_passed: bool = Field(
        default=True,
        description="Format validation passed"
    )
    validation_issues: List[str] = Field(
        default_factory=list,
        description="Any format issues found"
    )
    semantic_preserved: bool = Field(
        default=True,
        description="Semantic content preserved"
    )
    style_guide_adherence: float = Field(
        default=0.0,
        description="Style guide adherence 0-1"
    )


# =============================================================================
# FormatRunner Implementation
# =============================================================================

@register_task_runner
class FormatRunner(TaskRunner[FormatInput, FormatOutput]):
    """
    Style transformation formatting runner.

    This runner transforms content to match specified
    format and style requirements.

    Algorithmic Pattern:
        1. Parse content and format spec
        2. Identify structural elements
        3. Apply format transformations:
           - Headings
           - Lists
           - Emphasis
           - Links
           - Tables
           - Code blocks
        4. Apply style guide rules
        5. Validate output format

    Best Used For:
        - Document conversion
        - Style standardization
        - Format migration
        - Output adaptation
    """

    runner_id = "format"
    name = "Format Runner"
    description = "Apply formatting using style transformation"
    category = TaskRunnerCategory.CREATE
    algorithmic_core = "style_transformation"
    max_duration_seconds = 90

    InputType = FormatInput
    OutputType = FormatOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize FormatRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Low temperature for precise formatting
            max_tokens=4000,
        )

    async def execute(self, input: FormatInput) -> FormatOutput:
        """
        Execute format transformation.

        Args:
            input: Format parameters

        Returns:
            FormatOutput with formatted content
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            spec_text = ""
            if input.format_spec:
                spec_text = f"\nFormat specification:\n{json.dumps(input.format_spec, indent=2)}"

            style_rules = self._get_style_rules(input.style_guide)
            format_rules = self._get_format_rules(input.target_format)

            system_prompt = f"""You are an expert document formatter using style transformation.

Your task is to transform content to match format specifications.

Target format: {input.target_format}
Style guide: {input.style_guide}
Preserve structure: {input.preserve_structure}

{format_rules}
{style_rules}

Style transformation approach:
1. Identify structural elements in source:
   - Headings (levels 1-6)
   - Lists (ordered, unordered, nested)
   - Emphasis (bold, italic, underline)
   - Links and references
   - Code blocks and inline code
   - Tables and figures
   - Quotes and callouts
2. Transform each element to target format
3. Apply style guide rules
4. Maintain semantic meaning
5. Validate output format

Return a structured JSON response with:
- formatted_content: The transformed content
- output_format: Format used
- transformations_applied: Array with:
  - transformation_type: heading | list | emphasis | link | code | table
  - before: Example before
  - after: Example after
  - count: Instances transformed
- format_summary: {{headings: X, lists: Y, code_blocks: Z, ...}}
- validation_passed: boolean
- validation_issues: Any issues found
- semantic_preserved: boolean
- style_guide_adherence: 0-1"""

            user_prompt = f"""Format this content:

CONTENT:
{input.content[:3500]}
{spec_text}

Transform to {input.target_format} format and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_format_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build transformations
            trans_data = result.get("transformations_applied", [])
            transformations = [
                FormatTransformation(
                    transformation_type=t.get("transformation_type", ""),
                    before=t.get("before", ""),
                    after=t.get("after", ""),
                    count=int(t.get("count", 0)),
                )
                for t in trans_data
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return FormatOutput(
                success=True,
                formatted_content=result.get("formatted_content", ""),
                output_format=input.target_format,
                transformations_applied=transformations,
                format_summary=result.get("format_summary", {}),
                validation_passed=result.get("validation_passed", True),
                validation_issues=result.get("validation_issues", []),
                semantic_preserved=result.get("semantic_preserved", True),
                style_guide_adherence=float(result.get("style_guide_adherence", 0.9)),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"FormatRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return FormatOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_format_rules(self, target_format: str) -> str:
        """Get format-specific rules."""
        rules = {
            "markdown": """Markdown format rules:
- Headings: # for h1, ## for h2, etc.
- Bold: **text** or __text__
- Italic: *text* or _text_
- Lists: - or * for unordered, 1. for ordered
- Code: `inline` or ``` blocks
- Links: [text](url)""",
            "html": """HTML format rules:
- Headings: <h1> to <h6>
- Bold: <strong> or <b>
- Italic: <em> or <i>
- Lists: <ul><li> or <ol><li>
- Code: <code> or <pre>
- Links: <a href="url">text</a>""",
            "latex": """LaTeX format rules:
- Headings: \\section, \\subsection
- Bold: \\textbf{}
- Italic: \\textit{}
- Lists: \\begin{itemize}, \\begin{enumerate}
- Code: \\texttt{} or verbatim
- Links: \\href{url}{text}""",
            "plain": """Plain text format rules:
- Headings: ALL CAPS or underlined with ===
- Emphasis: *asterisks* or _underscores_
- Lists: - or numbered (1., 2.)
- No special formatting for code
- Links: text (url)""",
            "structured_json": """Structured JSON format rules:
- Return content as JSON object
- Headings as nested structure
- Lists as arrays
- Preserve hierarchy""",
        }
        return rules.get(target_format, rules["markdown"])

    def _get_style_rules(self, style_guide: str) -> str:
        """Get style guide rules."""
        guides = {
            "default": "Default style: Professional, clear, consistent.",
            "academic": "Academic style: Formal tone, third person, citations.",
            "business": "Business style: Concise, action-oriented, executive-friendly.",
            "technical": "Technical style: Precise terminology, detailed, structured.",
            "casual": "Casual style: Conversational, accessible, engaging.",
        }
        return guides.get(style_guide, guides["default"])

    def _parse_format_response(self, content: str) -> Dict[str, Any]:
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
                "formatted_content": content,
                "output_format": "unknown",
                "transformations_applied": [],
                "format_summary": {},
                "validation_passed": False,
                "validation_issues": ["Failed to parse format response"],
                "semantic_preserved": True,
                "style_guide_adherence": 0.5,
            }
