"""
CitationRunner - Add citations using source linking.

Algorithmic Core: Source Linking
- Links claims to supporting sources
- Formats citations appropriately
- Validates source-claim alignment

Use Cases:
- Academic writing
- Research reports
- Evidence-based documents
- Regulatory submissions
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

class Source(TaskRunnerOutput):
    """A source for citation."""

    source_id: str = Field(default="", description="Source identifier")
    title: str = Field(default="", description="Source title")
    authors: List[str] = Field(default_factory=list, description="Authors")
    year: Optional[int] = Field(default=None, description="Publication year")
    publication: str = Field(default="", description="Publication/journal/venue")
    url: str = Field(default="", description="URL if available")
    doi: str = Field(default="", description="DOI if available")
    source_type: str = Field(
        default="article",
        description="article | book | website | report | regulation"
    )


class CitationInput(TaskRunnerInput):
    """Input schema for CitationRunner."""

    content: str = Field(
        ...,
        description="Content to add citations to"
    )
    sources: List[Dict[str, Any]] = Field(
        ...,
        description="Available sources [{title, authors, year, ...}]"
    )
    citation_style: str = Field(
        default="apa",
        description="Style: apa | mla | chicago | harvard | ieee | vancouver"
    )
    citation_density: str = Field(
        default="moderate",
        description="Density: minimal | moderate | thorough"
    )
    include_bibliography: bool = Field(
        default=True,
        description="Generate bibliography section"
    )


class Citation(TaskRunnerOutput):
    """A citation instance in the content."""

    citation_id: str = Field(default="", description="Citation reference ID")
    source_id: str = Field(default="", description="Source being cited")
    claim: str = Field(default="", description="Claim being supported")
    inline_citation: str = Field(default="", description="Formatted inline citation")
    position: str = Field(default="", description="Where in content")
    citation_type: str = Field(
        default="support",
        description="support | contrast | example | definition"
    )
    confidence: float = Field(default=0.8, description="Confidence in source-claim fit")


class CitationOutput(TaskRunnerOutput):
    """Output schema for CitationRunner."""

    cited_content: str = Field(default="", description="Content with citations added")
    citations: List[Citation] = Field(
        default_factory=list,
        description="All citations added"
    )
    bibliography: str = Field(default="", description="Formatted bibliography")
    citation_count: int = Field(default=0, description="Number of citations")
    sources_used: List[str] = Field(
        default_factory=list,
        description="Source IDs used"
    )
    sources_unused: List[str] = Field(
        default_factory=list,
        description="Source IDs not used"
    )
    uncited_claims: List[str] = Field(
        default_factory=list,
        description="Claims that could use citations"
    )
    citation_coverage: float = Field(
        default=0.0,
        description="Percentage of claims cited"
    )
    style_compliance: float = Field(
        default=0.0,
        description="Citation style compliance 0-1"
    )


# =============================================================================
# CitationRunner Implementation
# =============================================================================

@register_task_runner
class CitationRunner(TaskRunner[CitationInput, CitationOutput]):
    """
    Source linking citation runner.

    This runner adds appropriate citations to content
    by linking claims to supporting sources.

    Algorithmic Pattern:
        1. Parse content and identify citable claims
        2. Match claims to available sources
        3. Generate formatted citations
        4. Insert inline citations
        5. Build bibliography
        6. Report coverage and gaps

    Best Used For:
        - Academic writing
        - Research documents
        - Evidence-based reports
        - Regulatory submissions
    """

    runner_id = "citation"
    name = "Citation Runner"
    description = "Add citations using source linking"
    category = TaskRunnerCategory.CREATE
    algorithmic_core = "source_linking"
    max_duration_seconds = 120

    InputType = CitationInput
    OutputType = CitationOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize CitationRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Low temperature for precise citation
            max_tokens=4000,
        )

    async def execute(self, input: CitationInput) -> CitationOutput:
        """
        Execute citation addition.

        Args:
            input: Citation parameters

        Returns:
            CitationOutput with cited content
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            sources_text = json.dumps(input.sources, indent=2, default=str)[:2500]

            style_rules = self._get_style_rules(input.citation_style)
            density_instruction = self._get_density_instruction(input.citation_density)

            system_prompt = f"""You are an expert at academic citation using source linking.

Your task is to add appropriate citations to content.

Citation style: {input.citation_style}
{density_instruction}
Include bibliography: {input.include_bibliography}

{style_rules}

Source linking approach:
1. Identify claims that need citations:
   - Factual claims
   - Statistics and data
   - Quotes and paraphrases
   - Methodological statements
   - Conclusions drawn from evidence
2. Match each claim to best available source:
   - Consider relevance
   - Consider authority
   - Consider recency
3. Generate inline citations in correct style
4. Track citation types:
   - support: Source supports claim
   - contrast: Source provides counterpoint
   - example: Source illustrates point
   - definition: Source defines term
5. Build formatted bibliography

Return a structured JSON response with:
- cited_content: Content with inline citations
- citations: Array with:
  - citation_id: C1, C2, etc.
  - source_id: Source identifier
  - claim: The claim being cited
  - inline_citation: Formatted citation
  - position: Where in text
  - citation_type: support | contrast | example | definition
  - confidence: 0-1 source-claim fit
- bibliography: Formatted bibliography (if requested)
- citation_count: Total citations
- sources_used: List of source_ids used
- sources_unused: Sources not cited
- uncited_claims: Claims that need sources
- citation_coverage: 0-1 coverage
- style_compliance: 0-1 style adherence"""

            user_prompt = f"""Add citations to this content:

CONTENT:
{input.content[:2500]}

AVAILABLE SOURCES:
{sources_text}

Add citations and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_citation_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build citations
            cit_data = result.get("citations", [])
            citations = [
                Citation(
                    citation_id=c.get("citation_id", f"C{i+1}"),
                    source_id=c.get("source_id", ""),
                    claim=c.get("claim", ""),
                    inline_citation=c.get("inline_citation", ""),
                    position=c.get("position", ""),
                    citation_type=c.get("citation_type", "support"),
                    confidence=float(c.get("confidence", 0.8)),
                )
                for i, c in enumerate(cit_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return CitationOutput(
                success=True,
                cited_content=result.get("cited_content", ""),
                citations=citations,
                bibliography=result.get("bibliography", "") if input.include_bibliography else "",
                citation_count=len(citations),
                sources_used=result.get("sources_used", []),
                sources_unused=result.get("sources_unused", []),
                uncited_claims=result.get("uncited_claims", []),
                citation_coverage=float(result.get("citation_coverage", 0.8)),
                style_compliance=float(result.get("style_compliance", 0.9)),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"CitationRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return CitationOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_style_rules(self, style: str) -> str:
        """Get citation style rules."""
        styles = {
            "apa": """APA Style (7th ed.):
- Inline: (Author, Year) or Author (Year)
- Multiple authors: (Smith & Jones, 2023) or (Smith et al., 2023)
- Bibliography: Author, A. A. (Year). Title. Publication. DOI/URL""",
            "mla": """MLA Style (9th ed.):
- Inline: (Author Page) or Author (Page)
- Bibliography: Author. Title. Publication, Year.""",
            "chicago": """Chicago Style:
- Notes-bibliography or author-date
- Inline footnotes or (Author Year, Page)""",
            "harvard": """Harvard Style:
- Inline: (Author Year) or Author (Year)
- Bibliography: Author (Year) Title. Publication.""",
            "ieee": """IEEE Style:
- Inline: [1], [2], etc. (numbered)
- Bibliography: [1] A. Author, "Title," Publication, Year.""",
            "vancouver": """Vancouver Style:
- Inline: superscript numbers¹ ²
- Bibliography: 1. Author. Title. Publication. Year;""",
        }
        return styles.get(style, styles["apa"])

    def _get_density_instruction(self, density: str) -> str:
        """Get citation density instruction."""
        instructions = {
            "minimal": "Minimal citations: Only cite key claims and data points.",
            "moderate": "Moderate citations: Cite significant claims, leave common knowledge.",
            "thorough": "Thorough citations: Cite all factual claims and evidence.",
        }
        return instructions.get(density, instructions["moderate"])

    def _parse_citation_response(self, content: str) -> Dict[str, Any]:
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
                "cited_content": content,
                "citations": [],
                "bibliography": "",
                "citation_count": 0,
                "sources_used": [],
                "sources_unused": [],
                "uncited_claims": [],
                "citation_coverage": 0,
                "style_compliance": 0,
            }
