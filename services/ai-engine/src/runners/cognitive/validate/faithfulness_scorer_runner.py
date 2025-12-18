"""
RAGAS-Style Faithfulness Scorer

Evaluates if LLM responses are faithful to retrieved context.
Detects hallucinations by checking if claims are supported by evidence.

Based on RAGAS (Retrieval Augmented Generation Assessment):
https://arxiv.org/abs/2309.15217

Faithfulness Score = (Number of Supported Claims) / (Total Claims)
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import re
import structlog

logger = structlog.get_logger()


class ClaimVerdict(str, Enum):
    """Verdict for a claim verification"""
    SUPPORTED = "supported"  # Claim is supported by context
    PARTIALLY_SUPPORTED = "partially_supported"  # Partial evidence
    NOT_SUPPORTED = "not_supported"  # No evidence in context
    CONTRADICTED = "contradicted"  # Context contradicts claim


@dataclass
class Claim:
    """A single atomic claim extracted from a response"""
    text: str
    verdict: ClaimVerdict = ClaimVerdict.NOT_SUPPORTED
    confidence: float = 0.0
    supporting_evidence: List[str] = field(default_factory=list)
    reasoning: str = ""


@dataclass
class FaithfulnessResult:
    """Result of faithfulness evaluation"""
    score: float  # 0.0 to 1.0
    total_claims: int
    supported_claims: int
    partially_supported_claims: int
    unsupported_claims: int
    contradicted_claims: int
    claims: List[Claim]
    hallucination_risk: str  # "low", "medium", "high"
    summary: str


class FaithfulnessScorer:
    """
    RAGAS-style faithfulness scorer for RAG systems

    Evaluates whether LLM-generated responses are grounded in
    the retrieved context. Identifies potential hallucinations.

    Algorithm:
    1. Extract atomic claims from response
    2. For each claim, check if it's supported by context
    3. Calculate faithfulness score
    4. Flag high-risk hallucinations
    """

    def __init__(
        self,
        llm_client: Optional[Any] = None,
        use_local_scoring: bool = True,
        min_claim_length: int = 10,
        max_claims: int = 20
    ):
        """
        Initialize faithfulness scorer

        Args:
            llm_client: Optional LLM client for claim extraction/verification
            use_local_scoring: Use local heuristics instead of LLM
            min_claim_length: Minimum characters for a valid claim
            max_claims: Maximum claims to extract
        """
        self.llm_client = llm_client
        self.use_local_scoring = use_local_scoring
        self.min_claim_length = min_claim_length
        self.max_claims = max_claims

    async def score(
        self,
        response: str,
        context: List[str],
        query: Optional[str] = None
    ) -> FaithfulnessResult:
        """
        Score the faithfulness of a response to the given context

        Args:
            response: LLM-generated response to evaluate
            context: List of context strings (retrieved chunks)
            query: Original query (optional, for context)

        Returns:
            FaithfulnessResult with score and claim details
        """
        if not response or not context:
            return self._empty_result()

        # Extract claims from response
        claims = await self._extract_claims(response)

        if not claims:
            return self._empty_result()

        # Verify each claim against context
        combined_context = "\n\n".join(context)
        verified_claims = await self._verify_claims(claims, combined_context)

        # Calculate scores
        total = len(verified_claims)
        supported = sum(1 for c in verified_claims if c.verdict == ClaimVerdict.SUPPORTED)
        partial = sum(1 for c in verified_claims if c.verdict == ClaimVerdict.PARTIALLY_SUPPORTED)
        unsupported = sum(1 for c in verified_claims if c.verdict == ClaimVerdict.NOT_SUPPORTED)
        contradicted = sum(1 for c in verified_claims if c.verdict == ClaimVerdict.CONTRADICTED)

        # Calculate faithfulness score (full support = 1.0, partial = 0.5)
        if total > 0:
            score = (supported + (partial * 0.5)) / total
        else:
            score = 1.0

        # Determine hallucination risk
        if score >= 0.8:
            risk = "low"
        elif score >= 0.5:
            risk = "medium"
        else:
            risk = "high"

        # Generate summary
        summary = self._generate_summary(
            score, total, supported, partial, unsupported, contradicted, risk
        )

        result = FaithfulnessResult(
            score=round(score, 3),
            total_claims=total,
            supported_claims=supported,
            partially_supported_claims=partial,
            unsupported_claims=unsupported,
            contradicted_claims=contradicted,
            claims=verified_claims,
            hallucination_risk=risk,
            summary=summary
        )

        logger.info(
            "faithfulness_scored",
            score=result.score,
            total_claims=total,
            supported=supported,
            unsupported=unsupported,
            risk=risk
        )

        return result

    async def _extract_claims(self, response: str) -> List[Claim]:
        """
        Extract atomic claims from a response

        Uses sentence splitting and filtering for local extraction,
        or LLM-based extraction for more accuracy.
        """
        if self.use_local_scoring or not self.llm_client:
            return self._extract_claims_local(response)
        else:
            return await self._extract_claims_llm(response)

    def _extract_claims_local(self, response: str) -> List[Claim]:
        """
        Extract claims using local heuristics

        Strategy:
        1. Split into sentences
        2. Filter out questions, commands, hedging
        3. Keep factual assertions
        """
        # Split into sentences
        sentence_pattern = r'(?<=[.!?])\s+(?=[A-Z])'
        sentences = re.split(sentence_pattern, response)

        claims = []
        for sentence in sentences:
            sentence = sentence.strip()

            # Skip too short
            if len(sentence) < self.min_claim_length:
                continue

            # Skip questions
            if sentence.endswith('?'):
                continue

            # Skip hedged statements (uncertainty markers)
            hedging_patterns = [
                r'^(I think|I believe|Maybe|Perhaps|Possibly|It seems)',
                r'^(Could be|Might be|May be)',
                r'(I\'m not sure|I don\'t know|uncertain)',
            ]
            is_hedged = any(
                re.search(pattern, sentence, re.IGNORECASE)
                for pattern in hedging_patterns
            )
            if is_hedged:
                continue

            # Skip meta-statements about the response itself
            meta_patterns = [
                r'^(In summary|To summarize|In conclusion)',
                r'^(Based on the context|According to)',
                r'^(Let me|I will|I can)',
            ]
            is_meta = any(
                re.search(pattern, sentence, re.IGNORECASE)
                for pattern in meta_patterns
            )
            if is_meta:
                continue

            # This looks like a factual claim
            claims.append(Claim(text=sentence))

            if len(claims) >= self.max_claims:
                break

        return claims

    async def _extract_claims_llm(self, response: str) -> List[Claim]:
        """Extract claims using LLM (more accurate but slower)"""
        prompt = f"""Extract atomic factual claims from the following response.
Each claim should be a single, verifiable statement.
Return only the claims, one per line.

Response:
{response}

Claims:"""
        try:
            result = await self.llm_client.generate(prompt)
            lines = result.strip().split('\n')
            claims = []
            for line in lines:
                line = line.strip().lstrip('- ').lstrip('* ')
                if len(line) >= self.min_claim_length:
                    claims.append(Claim(text=line))
                if len(claims) >= self.max_claims:
                    break
            return claims
        except Exception as e:
            logger.warning("llm_claim_extraction_failed", error=str(e))
            return self._extract_claims_local(response)

    async def _verify_claims(
        self,
        claims: List[Claim],
        context: str
    ) -> List[Claim]:
        """Verify each claim against the context"""
        if self.use_local_scoring or not self.llm_client:
            return self._verify_claims_local(claims, context)
        else:
            return await self._verify_claims_llm(claims, context)

    def _verify_claims_local(
        self,
        claims: List[Claim],
        context: str
    ) -> List[Claim]:
        """
        Verify claims using local heuristics

        Strategy:
        1. Check for key term overlap
        2. Check for semantic similarity (basic)
        3. Look for contradiction indicators
        """
        context_lower = context.lower()
        context_words = set(re.findall(r'\b\w+\b', context_lower))

        verified = []
        for claim in claims:
            claim_lower = claim.text.lower()
            claim_words = set(re.findall(r'\b\w+\b', claim_lower))

            # Remove common words
            stopwords = {
                'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
                'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
                'would', 'could', 'should', 'may', 'might', 'must', 'shall',
                'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
                'by', 'from', 'as', 'into', 'through', 'during', 'before',
                'after', 'above', 'below', 'between', 'under', 'again',
                'this', 'that', 'these', 'those', 'it', 'its', 'and', 'or',
                'but', 'if', 'while', 'when', 'where', 'how', 'which', 'who'
            }
            claim_content_words = claim_words - stopwords
            context_content_words = context_words - stopwords

            if not claim_content_words:
                claim.verdict = ClaimVerdict.NOT_SUPPORTED
                claim.confidence = 0.5
                claim.reasoning = "No content words found in claim"
                verified.append(claim)
                continue

            # Calculate word overlap
            overlap = claim_content_words & context_content_words
            overlap_ratio = len(overlap) / len(claim_content_words)

            # Check for exact phrase matches (stronger signal)
            phrase_match = False
            for phrase_len in range(3, min(8, len(claim_words))):
                phrases = self._get_ngrams(claim_lower, phrase_len)
                for phrase in phrases:
                    if phrase in context_lower:
                        phrase_match = True
                        break
                if phrase_match:
                    break

            # Check for contradiction signals
            contradiction_signals = [
                ('not', 'is'), ('never', 'always'), ('false', 'true'),
                ('incorrect', 'correct'), ('wrong', 'right')
            ]
            has_contradiction = False
            for neg, pos in contradiction_signals:
                if neg in claim_lower and pos in context_lower:
                    # Check if they're referring to the same thing
                    has_contradiction = True
                    break

            # Determine verdict
            if has_contradiction and overlap_ratio > 0.3:
                claim.verdict = ClaimVerdict.CONTRADICTED
                claim.confidence = 0.6
                claim.reasoning = "Claim appears to contradict context"
            elif phrase_match or overlap_ratio >= 0.7:
                claim.verdict = ClaimVerdict.SUPPORTED
                claim.confidence = min(0.9, 0.5 + overlap_ratio * 0.5)
                claim.supporting_evidence = list(overlap)[:5]
                claim.reasoning = f"Strong overlap ({overlap_ratio:.0%}) with context"
            elif overlap_ratio >= 0.4:
                claim.verdict = ClaimVerdict.PARTIALLY_SUPPORTED
                claim.confidence = 0.5 + overlap_ratio * 0.3
                claim.supporting_evidence = list(overlap)[:5]
                claim.reasoning = f"Partial overlap ({overlap_ratio:.0%}) with context"
            else:
                claim.verdict = ClaimVerdict.NOT_SUPPORTED
                claim.confidence = 0.5 + (1 - overlap_ratio) * 0.3
                claim.reasoning = f"Low overlap ({overlap_ratio:.0%}) with context"

            verified.append(claim)

        return verified

    async def _verify_claims_llm(
        self,
        claims: List[Claim],
        context: str
    ) -> List[Claim]:
        """Verify claims using LLM (more accurate)"""
        verified = []

        for claim in claims:
            prompt = f"""Determine if the following claim is supported by the context.

Context:
{context[:3000]}

Claim: {claim.text}

Is this claim:
A) SUPPORTED - The context directly supports this claim
B) PARTIALLY_SUPPORTED - The context provides some evidence but not complete support
C) NOT_SUPPORTED - The context does not mention or support this claim
D) CONTRADICTED - The context contradicts this claim

Answer with just the letter (A/B/C/D) and a brief explanation."""

            try:
                result = await self.llm_client.generate(prompt)
                result_upper = result.strip().upper()

                if result_upper.startswith('A'):
                    claim.verdict = ClaimVerdict.SUPPORTED
                    claim.confidence = 0.85
                elif result_upper.startswith('B'):
                    claim.verdict = ClaimVerdict.PARTIALLY_SUPPORTED
                    claim.confidence = 0.7
                elif result_upper.startswith('D'):
                    claim.verdict = ClaimVerdict.CONTRADICTED
                    claim.confidence = 0.8
                else:
                    claim.verdict = ClaimVerdict.NOT_SUPPORTED
                    claim.confidence = 0.75

                claim.reasoning = result.strip()

            except Exception as e:
                logger.warning("llm_verification_failed", error=str(e))
                # Fall back to local verification for this claim
                local_verified = self._verify_claims_local([claim], context)
                claim = local_verified[0] if local_verified else claim

            verified.append(claim)

        return verified

    def _get_ngrams(self, text: str, n: int) -> List[str]:
        """Get n-grams from text"""
        words = text.split()
        return [' '.join(words[i:i+n]) for i in range(len(words) - n + 1)]

    def _generate_summary(
        self,
        score: float,
        total: int,
        supported: int,
        partial: int,
        unsupported: int,
        contradicted: int,
        risk: str
    ) -> str:
        """Generate human-readable summary"""
        if total == 0:
            return "No verifiable claims found in response."

        summary_parts = [
            f"Faithfulness Score: {score:.0%}",
            f"({supported}/{total} claims fully supported",
        ]

        if partial > 0:
            summary_parts.append(f"{partial} partially supported")
        if unsupported > 0:
            summary_parts.append(f"{unsupported} unsupported")
        if contradicted > 0:
            summary_parts.append(f"{contradicted} contradicted")

        summary = ", ".join(summary_parts) + ")"

        if risk == "high":
            summary += " HIGH HALLUCINATION RISK - Response may contain inaccurate information."
        elif risk == "medium":
            summary += " Some claims not grounded in context."

        return summary

    def _empty_result(self) -> FaithfulnessResult:
        """Return empty result for edge cases"""
        return FaithfulnessResult(
            score=1.0,
            total_claims=0,
            supported_claims=0,
            partially_supported_claims=0,
            unsupported_claims=0,
            contradicted_claims=0,
            claims=[],
            hallucination_risk="low",
            summary="No verifiable claims to evaluate."
        )


# Singleton instance
_faithfulness_scorer: Optional[FaithfulnessScorer] = None


async def get_faithfulness_scorer(
    llm_client: Optional[Any] = None,
    use_local_scoring: bool = True
) -> FaithfulnessScorer:
    """Get or create faithfulness scorer singleton"""
    global _faithfulness_scorer

    if _faithfulness_scorer is None:
        _faithfulness_scorer = FaithfulnessScorer(
            llm_client=llm_client,
            use_local_scoring=use_local_scoring
        )

    return _faithfulness_scorer


# Quick test function
async def test_faithfulness_scorer():
    """Test the faithfulness scorer"""
    scorer = await get_faithfulness_scorer()

    context = [
        "Metformin is a first-line medication for type 2 diabetes. Common side effects include gastrointestinal symptoms such as nausea, diarrhea, and stomach discomfort.",
        "Metformin works by decreasing glucose production in the liver and improving insulin sensitivity. It does not cause hypoglycemia when used alone.",
        "Lactic acidosis is a rare but serious side effect, particularly in patients with kidney disease."
    ]

    response = """
    Metformin is commonly used for type 2 diabetes treatment. It works by reducing liver glucose production.
    Common side effects include nausea and diarrhea. The medication can also cause weight loss in some patients.
    Lactic acidosis is a serious risk, especially for those with kidney problems.
    The drug was first developed in 1922 and has been widely used since the 1950s.
    """

    result = await scorer.score(response, context)

    print("\n=== Faithfulness Scoring Test ===")
    print(f"Score: {result.score:.2f}")
    print(f"Risk Level: {result.hallucination_risk}")
    print(f"\n{result.summary}")
    print(f"\nClaims analyzed: {result.total_claims}")
    print("\nClaim Details:")
    for i, claim in enumerate(result.claims, 1):
        print(f"\n{i}. [{claim.verdict.value.upper()}] {claim.text[:80]}...")
        print(f"   Confidence: {claim.confidence:.2f}")
        print(f"   Reasoning: {claim.reasoning}")


if __name__ == "__main__":
    asyncio.run(test_faithfulness_scorer())
