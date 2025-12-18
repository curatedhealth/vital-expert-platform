"""
FactCheckRunner - Verify claims using source verification.

Algorithmic Core: Source Verification / Claim Analysis
- Extracts factual claims from content
- Verifies each claim against available sources
- Rates confidence in verification

Use Cases:
- Content fact-checking
- Research validation
- News verification
- Report accuracy check
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

class FactCheckInput(TaskRunnerInput):
    """Input schema for FactCheckRunner."""

    content: str = Field(
        ...,
        description="Content containing claims to verify"
    )
    claims_to_check: List[str] = Field(
        default_factory=list,
        description="Specific claims to check (if empty, extract from content)"
    )
    available_sources: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Available sources for verification"
    )
    verification_depth: str = Field(
        default="standard",
        description="Depth: quick | standard | thorough"
    )
    claim_types: List[str] = Field(
        default_factory=lambda: ["factual", "statistical", "quote", "date"],
        description="Types of claims to verify"
    )


class VerifiedClaim(TaskRunnerOutput):
    """Verification result for a single claim."""

    claim_id: str = Field(default="", description="Claim ID")
    claim_text: str = Field(default="", description="The claim")
    claim_type: str = Field(
        default="factual",
        description="factual | statistical | quote | date | attribution"
    )
    verification_status: str = Field(
        default="unverified",
        description="verified | partially_verified | unverified | disputed | false"
    )
    confidence: float = Field(default=0.0, description="Verification confidence 0-1")
    supporting_sources: List[str] = Field(
        default_factory=list,
        description="Sources that support claim"
    )
    contradicting_sources: List[str] = Field(
        default_factory=list,
        description="Sources that contradict"
    )
    verification_notes: str = Field(default="", description="Verification details")
    suggested_correction: Optional[str] = Field(
        default=None,
        description="Correction if claim is false/disputed"
    )


class FactCheckOutput(TaskRunnerOutput):
    """Output schema for FactCheckRunner."""

    claims_analyzed: List[VerifiedClaim] = Field(
        default_factory=list,
        description="All claims analyzed"
    )
    verified_claims: List[VerifiedClaim] = Field(
        default_factory=list,
        description="Claims verified as true"
    )
    disputed_claims: List[VerifiedClaim] = Field(
        default_factory=list,
        description="Claims that are disputed/false"
    )
    unverified_claims: List[VerifiedClaim] = Field(
        default_factory=list,
        description="Claims that couldn't be verified"
    )
    overall_accuracy: float = Field(
        default=0.0,
        description="Overall accuracy score 0-100"
    )
    claim_count: int = Field(default=0, description="Total claims checked")
    verification_summary: str = Field(default="", description="Executive summary")
    credibility_assessment: str = Field(
        default="",
        description="Overall credibility: high | medium | low | questionable"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations for improvement"
    )


# =============================================================================
# FactCheckRunner Implementation
# =============================================================================

@register_task_runner
class FactCheckRunner(TaskRunner[FactCheckInput, FactCheckOutput]):
    """
    Source verification fact checking runner.

    This runner extracts and verifies factual claims
    against available sources.

    Algorithmic Pattern:
        1. Extract claims from content (or use provided)
        2. Classify each claim by type
        3. For each claim:
           - Search available sources
           - Assess support/contradiction
           - Rate verification confidence
        4. Calculate overall accuracy
        5. Provide recommendations

    Best Used For:
        - Content verification
        - Research validation
        - Accuracy checks
        - Source reliability
    """

    runner_id = "fact_check"
    name = "Fact Check Runner"
    description = "Verify claims using source verification"
    category = TaskRunnerCategory.VALIDATE
    algorithmic_core = "source_verification"
    max_duration_seconds = 150

    InputType = FactCheckInput
    OutputType = FactCheckOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize FactCheckRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,  # Precision for verification
            max_tokens=3500,
        )

    async def execute(self, input: FactCheckInput) -> FactCheckOutput:
        """
        Execute fact checking.

        Args:
            input: Fact check parameters

        Returns:
            FactCheckOutput with verification results
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json

            claims_text = ""
            if input.claims_to_check:
                claims_text = "\nSpecific claims to check:\n" + "\n".join(
                    f"- {c}" for c in input.claims_to_check
                )
            else:
                claims_text = "\nExtract and verify all factual claims from content."

            sources_text = ""
            if input.available_sources:
                sources_text = f"\nAvailable sources:\n{json.dumps(input.available_sources, indent=2)[:1500]}"
            else:
                sources_text = "\nNo external sources provided - use general knowledge with caution."

            depth_instruction = self._get_depth_instruction(input.verification_depth)

            system_prompt = f"""You are an expert fact-checker using source verification.

Your task is to verify factual claims in content.

Claim types to check: {', '.join(input.claim_types)}
{depth_instruction}

Source verification approach:
1. Extract claims (if not provided):
   - Factual statements
   - Statistics and numbers
   - Quotes and attributions
   - Dates and timelines
2. For each claim:
   - Identify claim type
   - Search available sources for support
   - Note any contradictions
   - Assess confidence level
3. Verification status:
   - verified: Strong source support
   - partially_verified: Some support, some gaps
   - unverified: Cannot confirm/deny
   - disputed: Conflicting sources
   - false: Contradicted by reliable sources
4. Calculate accuracy score
5. Assess overall credibility

Return a structured JSON response with:
- claims_analyzed: Array with:
  - claim_id: C1, C2, etc.
  - claim_text: The claim
  - claim_type: factual | statistical | quote | date | attribution
  - verification_status: verified | partially_verified | unverified | disputed | false
  - confidence: 0-1
  - supporting_sources: Sources that support
  - contradicting_sources: Sources that contradict
  - verification_notes: Details
  - suggested_correction: If false/disputed
- overall_accuracy: 0-100
- claim_count: Total claims
- verification_summary: 2-3 sentence summary
- credibility_assessment: high | medium | low | questionable
- recommendations: Improvements suggested"""

            user_prompt = f"""Fact-check this content:

CONTENT:
{input.content[:2500]}
{claims_text}
{sources_text}

Verify claims and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_factcheck_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build claims
            claims_data = result.get("claims_analyzed", [])
            claims = [
                VerifiedClaim(
                    claim_id=c.get("claim_id", f"C{i+1}"),
                    claim_text=c.get("claim_text", ""),
                    claim_type=c.get("claim_type", "factual"),
                    verification_status=c.get("verification_status", "unverified"),
                    confidence=float(c.get("confidence", 0.5)),
                    supporting_sources=c.get("supporting_sources", []),
                    contradicting_sources=c.get("contradicting_sources", []),
                    verification_notes=c.get("verification_notes", ""),
                    suggested_correction=c.get("suggested_correction"),
                )
                for i, c in enumerate(claims_data)
            ]

            # Filter by status
            verified = [c for c in claims if c.verification_status == "verified"]
            disputed = [c for c in claims if c.verification_status in ["disputed", "false"]]
            unverified = [c for c in claims if c.verification_status in ["unverified", "partially_verified"]]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return FactCheckOutput(
                success=True,
                claims_analyzed=claims,
                verified_claims=verified,
                disputed_claims=disputed,
                unverified_claims=unverified,
                overall_accuracy=float(result.get("overall_accuracy", 70)),
                claim_count=len(claims),
                verification_summary=result.get("verification_summary", ""),
                credibility_assessment=result.get("credibility_assessment", "medium"),
                recommendations=result.get("recommendations", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"FactCheckRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return FactCheckOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "quick": "Quick verification: Check key claims only. High-level assessment.",
            "standard": "Standard verification: Check all significant claims thoroughly.",
            "thorough": "Thorough verification: Deep check of all claims with full sourcing.",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_factcheck_response(self, content: str) -> Dict[str, Any]:
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
                "claims_analyzed": [],
                "overall_accuracy": 0,
                "claim_count": 0,
                "verification_summary": content[:200],
                "credibility_assessment": "unknown",
                "recommendations": [],
            }
