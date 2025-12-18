"""
CitationCheckRunner - Verify citations using reference validation.

Algorithmic Core: Reference Validation
- Validates citation accuracy and formatting
- Checks source-claim alignment
- Verifies reference accessibility

Use Cases:
- Academic paper review
- Research validation
- Report verification
- Regulatory submission check
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

class CitationCheckInput(TaskRunnerInput):
    """Input schema for CitationCheckRunner."""

    content: str = Field(
        ...,
        description="Content with citations to verify"
    )
    citations: List[Dict[str, Any]] = Field(
        ...,
        description="Citations to verify [{citation_id, text, source_info}]"
    )
    citation_style: str = Field(
        default="apa",
        description="Expected style: apa | mla | chicago | harvard | ieee"
    )
    check_aspects: List[str] = Field(
        default_factory=lambda: ["format", "accuracy", "relevance", "accessibility"],
        description="Aspects to check"
    )


class CitationIssue(TaskRunnerOutput):
    """An issue found with a citation."""

    issue_id: str = Field(default="", description="Issue ID")
    citation_id: str = Field(default="", description="Citation with issue")
    issue_type: str = Field(
        default="",
        description="format | accuracy | relevance | accessibility | missing | duplicate"
    )
    severity: str = Field(default="medium", description="minor | medium | major")
    description: str = Field(default="", description="Issue description")
    current_value: str = Field(default="", description="What it currently says")
    expected_value: str = Field(default="", description="What it should say")
    fix_suggestion: str = Field(default="", description="How to fix")


class CitationCheckOutput(TaskRunnerOutput):
    """Output schema for CitationCheckRunner."""

    citations_checked: int = Field(default=0, description="Total citations checked")
    valid_citations: int = Field(default=0, description="Citations with no issues")
    problematic_citations: int = Field(default=0, description="Citations with issues")
    issues: List[CitationIssue] = Field(
        default_factory=list,
        description="All issues found"
    )
    major_issues: List[CitationIssue] = Field(
        default_factory=list,
        description="Major issues requiring fix"
    )
    format_compliance: float = Field(
        default=0.0,
        description="Format compliance score 0-100"
    )
    accuracy_score: float = Field(
        default=0.0,
        description="Citation accuracy score 0-100"
    )
    missing_citations: List[str] = Field(
        default_factory=list,
        description="Claims that need citations"
    )
    orphan_citations: List[str] = Field(
        default_factory=list,
        description="Citations not referenced in text"
    )
    citation_summary: str = Field(default="", description="Executive summary")
    style_adherence: str = Field(
        default="",
        description="good | fair | poor"
    )


# =============================================================================
# CitationCheckRunner Implementation
# =============================================================================

@register_task_runner
class CitationCheckRunner(TaskRunner[CitationCheckInput, CitationCheckOutput]):
    """
    Reference validation citation checking runner.

    This runner validates citations for accuracy, format,
    and source-claim alignment.

    Algorithmic Pattern:
        1. Parse content and citations
        2. For each citation:
           - Check format compliance
           - Verify source-claim accuracy
           - Assess relevance
           - Check accessibility
        3. Identify missing citations
        4. Find orphan citations
        5. Calculate scores

    Best Used For:
        - Academic review
        - Research validation
        - Quality assurance
        - Submission preparation
    """

    runner_id = "citation_check"
    name = "Citation Check Runner"
    description = "Verify citations using reference validation"
    category = TaskRunnerCategory.VALIDATE
    algorithmic_core = "reference_validation"
    max_duration_seconds = 120

    InputType = CitationCheckInput
    OutputType = CitationCheckOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize CitationCheckRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Precision for validation
            max_tokens=3500,
        )

    async def execute(self, input: CitationCheckInput) -> CitationCheckOutput:
        """
        Execute citation check.

        Args:
            input: Citation check parameters

        Returns:
            CitationCheckOutput with validation results
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            citations_text = json.dumps(input.citations, indent=2, default=str)[:2000]

            aspects_text = ", ".join(input.check_aspects)
            style_rules = self._get_style_rules(input.citation_style)

            system_prompt = f"""You are an expert citation validator using reference validation.

Your task is to verify citations for accuracy, format, and relevance.

Citation style: {input.citation_style}
Aspects to check: {aspects_text}

{style_rules}

Reference validation approach:
1. For each citation:
   - format: Does it follow {input.citation_style} style?
   - accuracy: Does source info match the actual source?
   - relevance: Does the source support the claim?
   - accessibility: Is the source accessible?
2. Check for issues:
   - Format errors (wrong order, missing fields)
   - Accuracy errors (wrong author, year, title)
   - Relevance issues (source doesn't support claim)
   - Accessibility issues (broken links, unavailable)
3. Identify:
   - Claims that need citations (missing)
   - Citations not used in text (orphans)
4. Calculate compliance scores

Return a structured JSON response with:
- citations_checked: Total checked
- valid_citations: No issues
- problematic_citations: Have issues
- issues: Array with:
  - issue_id: I1, I2, etc.
  - citation_id: Citation with issue
  - issue_type: format | accuracy | relevance | accessibility | missing | duplicate
  - severity: minor | medium | major
  - description: What's wrong
  - current_value: What it says
  - expected_value: What it should say
  - fix_suggestion: How to fix
- format_compliance: 0-100
- accuracy_score: 0-100
- missing_citations: Claims needing citations
- orphan_citations: Unused citations
- citation_summary: 2-3 sentence summary
- style_adherence: good | fair | poor"""

            user_prompt = f"""Check citations in this content:

CONTENT:
{input.content[:2000]}

CITATIONS:
{citations_text}

Validate citations and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_citation_check_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build issues
            issues_data = result.get("issues", [])
            issues = [
                CitationIssue(
                    issue_id=i.get("issue_id", f"I{idx+1}"),
                    citation_id=i.get("citation_id", ""),
                    issue_type=i.get("issue_type", "format"),
                    severity=i.get("severity", "medium"),
                    description=i.get("description", ""),
                    current_value=i.get("current_value", ""),
                    expected_value=i.get("expected_value", ""),
                    fix_suggestion=i.get("fix_suggestion", ""),
                )
                for idx, i in enumerate(issues_data)
            ]

            # Filter major issues
            major = [i for i in issues if i.severity == "major"]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return CitationCheckOutput(
                success=True,
                citations_checked=result.get("citations_checked", len(input.citations)),
                valid_citations=result.get("valid_citations", 0),
                problematic_citations=result.get("problematic_citations", 0),
                issues=issues,
                major_issues=major,
                format_compliance=float(result.get("format_compliance", 80)),
                accuracy_score=float(result.get("accuracy_score", 85)),
                missing_citations=result.get("missing_citations", []),
                orphan_citations=result.get("orphan_citations", []),
                citation_summary=result.get("citation_summary", ""),
                style_adherence=result.get("style_adherence", "fair"),
                confidence_score=0.9,
                quality_score=0.9,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"CitationCheckRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return CitationCheckOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_style_rules(self, style: str) -> str:
        """Get citation style rules."""
        styles = {
            "apa": "APA 7th: Author (Year). Title. Publication. DOI/URL",
            "mla": "MLA 9th: Author. Title. Publication, Year.",
            "chicago": "Chicago: Author. Title. Place: Publisher, Year.",
            "harvard": "Harvard: Author (Year) Title. Publication.",
            "ieee": "IEEE: [#] A. Author, \"Title,\" Publication, Year.",
        }
        return f"Expected format: {styles.get(style, styles['apa'])}"

    def _parse_citation_check_response(self, content: str) -> Dict[str, Any]:
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
                "citations_checked": 0,
                "valid_citations": 0,
                "problematic_citations": 0,
                "issues": [],
                "format_compliance": 0,
                "accuracy_score": 0,
                "missing_citations": [],
                "orphan_citations": [],
                "citation_summary": content[:200],
                "style_adherence": "unknown",
            }
