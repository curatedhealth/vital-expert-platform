"""
ConsistencyCheckRunner - Check consistency using semantic coherence.

Algorithmic Core: Semantic Coherence Analysis
- Checks internal consistency of document
- Identifies contradictions and ambiguities
- Validates logical flow

Use Cases:
- Document consistency check
- Requirements validation
- Policy coherence
- Data consistency
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

class ConsistencyCheckInput(TaskRunnerInput):
    """Input schema for ConsistencyCheckRunner."""

    document: str = Field(
        ...,
        description="Document to check for consistency"
    )
    check_types: List[str] = Field(
        default_factory=lambda: ["terminology", "facts", "logic", "style", "data"],
        description="Types of consistency to check"
    )
    reference_definitions: Dict[str, str] = Field(
        default_factory=dict,
        description="Canonical definitions {term: definition}"
    )
    sections_to_compare: List[List[str]] = Field(
        default_factory=list,
        description="Section pairs to cross-check"
    )
    consistency_threshold: float = Field(
        default=0.9,
        description="Threshold for flagging (0-1)"
    )


class InconsistencyIssue(TaskRunnerOutput):
    """A single inconsistency found."""

    issue_id: str = Field(default="", description="Issue ID")
    issue_type: str = Field(
        default="",
        description="terminology | facts | logic | style | data | temporal"
    )
    severity: str = Field(default="medium", description="minor | medium | major")
    location_a: str = Field(default="", description="First location")
    location_b: str = Field(default="", description="Second location (if comparison)")
    statement_a: str = Field(default="", description="First statement")
    statement_b: str = Field(default="", description="Second statement")
    inconsistency_description: str = Field(default="", description="What's inconsistent")
    resolution_suggestion: str = Field(default="", description="How to resolve")
    confidence: float = Field(default=0.8, description="Confidence in detection")


class ConsistencyCheckOutput(TaskRunnerOutput):
    """Output schema for ConsistencyCheckRunner."""

    is_consistent: bool = Field(default=False, description="Overall consistency")
    consistency_score: float = Field(default=0.0, description="Consistency score 0-100")
    issues: List[InconsistencyIssue] = Field(
        default_factory=list,
        description="All inconsistencies found"
    )
    major_issues: List[InconsistencyIssue] = Field(
        default_factory=list,
        description="Major inconsistencies"
    )
    issue_breakdown: Dict[str, int] = Field(
        default_factory=dict,
        description="Issues by type {type: count}"
    )
    terminology_consistency: float = Field(
        default=0.0,
        description="Terminology consistency 0-100"
    )
    factual_consistency: float = Field(
        default=0.0,
        description="Factual consistency 0-100"
    )
    logical_consistency: float = Field(
        default=0.0,
        description="Logical consistency 0-100"
    )
    consistency_summary: str = Field(default="", description="Executive summary")
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations for improvement"
    )


# =============================================================================
# ConsistencyCheckRunner Implementation
# =============================================================================

@register_task_runner
class ConsistencyCheckRunner(TaskRunner[ConsistencyCheckInput, ConsistencyCheckOutput]):
    """
    Semantic coherence consistency checking runner.

    This runner checks a document for internal consistency
    across multiple dimensions.

    Algorithmic Pattern:
        1. Parse document structure
        2. Check each consistency type:
           - terminology: Same terms mean same things
           - facts: No contradictory facts
           - logic: Conclusions follow from premises
           - style: Consistent tone/voice
           - data: Numbers add up
        3. Compare sections if specified
        4. Calculate consistency scores
        5. Prioritize issues

    Best Used For:
        - Document review
        - Requirements validation
        - Policy checking
        - Quality assurance
    """

    runner_id = "consistency_check"
    name = "Consistency Check Runner"
    description = "Check consistency using semantic coherence"
    category = TaskRunnerCategory.VALIDATE
    algorithmic_core = "semantic_coherence"
    max_duration_seconds = 150

    InputType = ConsistencyCheckInput
    OutputType = ConsistencyCheckOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ConsistencyCheckRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Precision for consistency
            max_tokens=3500,
        )

    async def execute(self, input: ConsistencyCheckInput) -> ConsistencyCheckOutput:
        """
        Execute consistency check.

        Args:
            input: Consistency check parameters

        Returns:
            ConsistencyCheckOutput with consistency analysis
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json

            check_types_text = ", ".join(input.check_types)

            definitions_text = ""
            if input.reference_definitions:
                definitions_text = "\nReference definitions:\n" + json.dumps(
                    input.reference_definitions, indent=2
                )[:500]

            sections_text = ""
            if input.sections_to_compare:
                sections_text = "\nSection pairs to cross-check: " + str(input.sections_to_compare)

            system_prompt = f"""You are an expert at checking document consistency using semantic coherence.

Your task is to identify inconsistencies within a document.

Consistency types to check: {check_types_text}
Threshold for flagging: {input.consistency_threshold}

Semantic coherence approach:
1. For each consistency type:
   - terminology: Are terms used consistently?
     * Same term, different meanings?
     * Different terms for same concept?
   - facts: Are stated facts consistent?
     * Contradictory claims?
     * Changing numbers?
   - logic: Is reasoning consistent?
     * Conclusions that don't follow?
     * Circular reasoning?
   - style: Is tone/voice consistent?
     * Sudden formality shifts?
     * Inconsistent perspective?
   - data: Do numbers add up?
     * Percentages that don't sum to 100?
     * Mismatched totals?
   - temporal: Are timelines consistent?
     * Date contradictions?
2. Compare specified sections
3. Calculate per-type scores
4. Rate overall consistency

Return a structured JSON response with:
- is_consistent: boolean (no major issues)
- consistency_score: 0-100
- issues: Array with:
  - issue_id: IC1, IC2, etc.
  - issue_type: terminology | facts | logic | style | data | temporal
  - severity: minor | medium | major
  - location_a: First location
  - location_b: Second location (if applicable)
  - statement_a: First statement
  - statement_b: Second statement (if applicable)
  - inconsistency_description: What's inconsistent
  - resolution_suggestion: How to fix
  - confidence: 0-1
- issue_breakdown: {{type: count}}
- terminology_consistency: 0-100
- factual_consistency: 0-100
- logical_consistency: 0-100
- consistency_summary: 2-3 sentence summary
- recommendations: How to improve"""

            user_prompt = f"""Check consistency in this document:

DOCUMENT:
{input.document[:3000]}
{definitions_text}
{sections_text}

Check consistency and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_consistency_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build issues
            issues_data = result.get("issues", [])
            issues = [
                InconsistencyIssue(
                    issue_id=i.get("issue_id", f"IC{idx+1}"),
                    issue_type=i.get("issue_type", ""),
                    severity=i.get("severity", "medium"),
                    location_a=i.get("location_a", ""),
                    location_b=i.get("location_b", ""),
                    statement_a=i.get("statement_a", ""),
                    statement_b=i.get("statement_b", ""),
                    inconsistency_description=i.get("inconsistency_description", ""),
                    resolution_suggestion=i.get("resolution_suggestion", ""),
                    confidence=float(i.get("confidence", 0.8)),
                )
                for idx, i in enumerate(issues_data)
            ]

            # Filter major issues
            major = [i for i in issues if i.severity == "major"]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ConsistencyCheckOutput(
                success=True,
                is_consistent=result.get("is_consistent", len(major) == 0),
                consistency_score=float(result.get("consistency_score", 80)),
                issues=issues,
                major_issues=major,
                issue_breakdown=result.get("issue_breakdown", {}),
                terminology_consistency=float(result.get("terminology_consistency", 85)),
                factual_consistency=float(result.get("factual_consistency", 85)),
                logical_consistency=float(result.get("logical_consistency", 85)),
                consistency_summary=result.get("consistency_summary", ""),
                recommendations=result.get("recommendations", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ConsistencyCheckRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ConsistencyCheckOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_consistency_response(self, content: str) -> Dict[str, Any]:
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
                "is_consistent": False,
                "consistency_score": 0,
                "issues": [],
                "issue_breakdown": {},
                "terminology_consistency": 0,
                "factual_consistency": 0,
                "logical_consistency": 0,
                "consistency_summary": content[:200],
                "recommendations": [],
            }
