"""
Advanced Consensus Analyzer for Ask Panel

Implements sophisticated consensus detection using:
1. Semantic similarity via embeddings
2. Claim extraction and comparison
3. Recommendation alignment analysis
4. Evidence overlap calculation
5. Weighted consensus scoring

Based on ASK_PANEL_COMPLETE_GUIDE.md specifications.
"""

import asyncio
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timezone
import structlog
import re

from services.llm_service import LLMService
from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()


@dataclass
class ConsensusResult:
    """Result of consensus analysis"""
    consensus_score: float  # 0.0-1.0
    consensus_level: str  # "high", "medium", "low"
    semantic_similarity: float
    claim_overlap: float
    recommendation_alignment: float
    evidence_overlap: float
    agreement_points: List[str]
    divergent_points: List[str]
    key_themes: List[str]
    recommendation: str
    dissenting_opinions: Dict[str, str]
    confidence: float
    analysis_metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ExtractedClaim:
    """A factual claim extracted from a response"""
    claim_text: str
    agent_id: str
    agent_name: str
    confidence: float
    evidence_cited: List[str] = field(default_factory=list)


@dataclass
class ExtractedRecommendation:
    """A recommendation extracted from a response"""
    recommendation_text: str
    agent_id: str
    agent_name: str
    action_type: str  # "proceed", "caution", "stop", "investigate"
    priority: str  # "high", "medium", "low"


class AdvancedConsensusAnalyzer:
    """
    Advanced consensus analysis for multi-expert panel discussions.

    Consensus Score Formula:
    score = (0.30 × semantic_similarity) +
            (0.30 × claim_overlap) +
            (0.25 × recommendation_alignment) +
            (0.15 × evidence_overlap)
    """

    # Weights for consensus calculation (from docs)
    WEIGHT_SEMANTIC = 0.30
    WEIGHT_CLAIMS = 0.30
    WEIGHT_RECOMMENDATIONS = 0.25
    WEIGHT_EVIDENCE = 0.15

    # Thresholds
    HIGH_CONSENSUS_THRESHOLD = 0.80
    MEDIUM_CONSENSUS_THRESHOLD = 0.50

    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
        self._llm_config = get_llm_config_for_level("L3")

    async def analyze_consensus(
        self,
        question: str,
        responses: List[Dict[str, Any]],
        include_detailed_analysis: bool = True
    ) -> ConsensusResult:
        """
        Perform comprehensive consensus analysis on expert responses.

        Args:
            question: Original question posed to panel
            responses: List of expert response dictionaries
            include_detailed_analysis: Whether to include detailed breakdowns

        Returns:
            ConsensusResult with all metrics and analysis
        """
        if not responses:
            return self._empty_result()

        if len(responses) == 1:
            return self._single_response_result(responses[0])

        logger.info(
            "Starting consensus analysis",
            response_count=len(responses),
            question_preview=question[:100]
        )

        try:
            # Run all analyses in parallel for efficiency
            results = await asyncio.gather(
                self._calculate_semantic_similarity(responses),
                self._extract_and_compare_claims(question, responses),
                self._analyze_recommendation_alignment(question, responses),
                self._calculate_evidence_overlap(responses),
                return_exceptions=True
            )

            # Handle any failures gracefully
            semantic_similarity = results[0] if not isinstance(results[0], Exception) else 0.5
            claims_result = results[1] if not isinstance(results[1], Exception) else (0.5, [], [])
            recommendations_result = results[2] if not isinstance(results[2], Exception) else (0.5, [], "")
            evidence_overlap = results[3] if not isinstance(results[3], Exception) else 0.5

            claim_overlap, all_claims, divergent_claims = claims_result
            recommendation_alignment, recommendations, recommendation_summary = recommendations_result

            # Calculate weighted consensus score
            consensus_score = (
                self.WEIGHT_SEMANTIC * semantic_similarity +
                self.WEIGHT_CLAIMS * claim_overlap +
                self.WEIGHT_RECOMMENDATIONS * recommendation_alignment +
                self.WEIGHT_EVIDENCE * evidence_overlap
            )

            # Determine consensus level
            if consensus_score >= self.HIGH_CONSENSUS_THRESHOLD:
                consensus_level = "high"
            elif consensus_score >= self.MEDIUM_CONSENSUS_THRESHOLD:
                consensus_level = "medium"
            else:
                consensus_level = "low"

            # Extract agreement and divergent points
            agreement_points = await self._extract_agreement_points(responses, all_claims)
            divergent_points = await self._extract_divergent_points(responses, divergent_claims)

            # Extract key themes
            key_themes = await self._extract_key_themes(responses)

            # Build final recommendation
            final_recommendation = await self._build_final_recommendation(
                question, responses, consensus_level, recommendation_summary
            )

            # Extract dissenting opinions
            dissenting_opinions = self._extract_dissenting_opinions(responses, consensus_score)

            logger.info(
                "Consensus analysis complete",
                consensus_score=consensus_score,
                consensus_level=consensus_level,
                semantic_similarity=semantic_similarity,
                claim_overlap=claim_overlap,
                recommendation_alignment=recommendation_alignment,
                evidence_overlap=evidence_overlap
            )

            return ConsensusResult(
                consensus_score=round(consensus_score, 3),
                consensus_level=consensus_level,
                semantic_similarity=round(semantic_similarity, 3),
                claim_overlap=round(claim_overlap, 3),
                recommendation_alignment=round(recommendation_alignment, 3),
                evidence_overlap=round(evidence_overlap, 3),
                agreement_points=agreement_points,
                divergent_points=divergent_points,
                key_themes=key_themes,
                recommendation=final_recommendation,
                dissenting_opinions=dissenting_opinions,
                confidence=self._calculate_confidence(responses, consensus_score),
                analysis_metadata={
                    "response_count": len(responses),
                    "analyzed_at": datetime.now(timezone.utc).isoformat(),
                    "weights": {
                        "semantic": self.WEIGHT_SEMANTIC,
                        "claims": self.WEIGHT_CLAIMS,
                        "recommendations": self.WEIGHT_RECOMMENDATIONS,
                        "evidence": self.WEIGHT_EVIDENCE
                    }
                }
            )

        except Exception as e:
            logger.error("Consensus analysis failed", error=str(e))
            return self._fallback_consensus(responses)

    async def _calculate_semantic_similarity(
        self,
        responses: List[Dict[str, Any]]
    ) -> float:
        """
        Calculate semantic similarity between responses using LLM.

        Uses pairwise comparison to determine how similar the core messages are.
        """
        if len(responses) < 2:
            return 1.0

        # Build comparison prompt
        response_texts = []
        for i, resp in enumerate(responses):
            content = resp.get("content", resp.get("response", ""))[:500]
            name = resp.get("agent_name", f"Expert {i+1}")
            response_texts.append(f"**{name}**: {content}")

        prompt = f"""Analyze the semantic similarity between these expert responses.
Rate how similar the core messages and conclusions are on a scale of 0.0 to 1.0.

Responses:
{chr(10).join(response_texts)}

Consider:
1. Are they discussing the same core concepts?
2. Do they reach similar conclusions?
3. Do they use similar reasoning approaches?
4. Are their recommendations aligned?

Respond with ONLY a number between 0.0 and 1.0.
0.0 = completely different messages
0.5 = some overlap but significant differences
1.0 = essentially the same message

SIMILARITY SCORE:"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.1,  # Low temperature for consistent scoring
                max_tokens=50
            )

            # Extract number from response
            match = re.search(r'(\d+\.?\d*)', result)
            if match:
                score = float(match.group(1))
                return min(max(score, 0.0), 1.0)  # Clamp to [0, 1]

            return 0.5  # Default if parsing fails

        except Exception as e:
            logger.warning(f"Semantic similarity calculation failed: {e}")
            return 0.5

    async def _extract_and_compare_claims(
        self,
        question: str,
        responses: List[Dict[str, Any]]
    ) -> Tuple[float, List[ExtractedClaim], List[str]]:
        """
        Extract factual claims from each response and compare for overlap.

        Returns:
            Tuple of (overlap_score, all_claims, divergent_claims)
        """
        # Build extraction prompt
        response_texts = []
        for i, resp in enumerate(responses):
            content = resp.get("content", resp.get("response", ""))[:800]
            name = resp.get("agent_name", f"Expert {i+1}")
            response_texts.append(f"**{name}**:\n{content}")

        prompt = f"""Extract factual claims from these expert responses to the question: "{question}"

Responses:
{chr(10).join(response_texts)}

For each response, list the key factual claims (statements of fact, not opinions).
Then identify:
1. AGREED CLAIMS - claims that multiple experts make
2. UNIQUE CLAIMS - claims made by only one expert
3. CONFLICTING CLAIMS - claims where experts disagree

Format your response as:
AGREED CLAIMS:
- [claim]
- [claim]

UNIQUE CLAIMS:
- [Expert Name]: [claim]

CONFLICTING CLAIMS:
- [claim A] vs [claim B]

OVERLAP SCORE: [0.0-1.0 based on how much experts agree on facts]"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.2,
                max_tokens=1000
            )

            # Parse results
            all_claims = []
            divergent_claims = []

            # Extract agreed claims
            agreed_section = re.search(r'AGREED CLAIMS:(.*?)(?=UNIQUE|CONFLICTING|OVERLAP|$)', result, re.DOTALL)
            if agreed_section:
                agreed_text = agreed_section.group(1)
                for line in agreed_text.split('\n'):
                    line = line.strip().lstrip('-').strip()
                    if line and len(line) > 5:
                        all_claims.append(ExtractedClaim(
                            claim_text=line,
                            agent_id="consensus",
                            agent_name="Multiple Experts",
                            confidence=0.9
                        ))

            # Extract conflicting claims
            conflict_section = re.search(r'CONFLICTING CLAIMS:(.*?)(?=OVERLAP|$)', result, re.DOTALL)
            if conflict_section:
                conflict_text = conflict_section.group(1)
                for line in conflict_text.split('\n'):
                    line = line.strip().lstrip('-').strip()
                    if line and len(line) > 5:
                        divergent_claims.append(line)

            # Extract overlap score
            score_match = re.search(r'OVERLAP SCORE:\s*(\d+\.?\d*)', result)
            if score_match:
                overlap_score = float(score_match.group(1))
                overlap_score = min(max(overlap_score, 0.0), 1.0)
            else:
                # Calculate based on ratio of agreed vs conflicting
                if all_claims or divergent_claims:
                    overlap_score = len(all_claims) / (len(all_claims) + len(divergent_claims) + 0.1)
                else:
                    overlap_score = 0.5

            return overlap_score, all_claims, divergent_claims

        except Exception as e:
            logger.warning(f"Claim extraction failed: {e}")
            return 0.5, [], []

    async def _analyze_recommendation_alignment(
        self,
        question: str,
        responses: List[Dict[str, Any]]
    ) -> Tuple[float, List[ExtractedRecommendation], str]:
        """
        Analyze how aligned the recommendations are across experts.

        Returns:
            Tuple of (alignment_score, recommendations, summary)
        """
        response_texts = []
        for i, resp in enumerate(responses):
            content = resp.get("content", resp.get("response", ""))[:600]
            name = resp.get("agent_name", f"Expert {i+1}")
            response_texts.append(f"**{name}**: {content}")

        prompt = f"""Analyze the recommendations in these expert responses to: "{question}"

Responses:
{chr(10).join(response_texts)}

Extract each expert's main recommendation and categorize:
1. ACTION TYPE: proceed, caution, stop, investigate, or other
2. PRIORITY: high, medium, low

Then assess overall alignment.

Format:
RECOMMENDATIONS:
- [Expert]: [recommendation] (ACTION: [type], PRIORITY: [level])

ALIGNMENT ANALYSIS:
[Brief analysis of how aligned the recommendations are]

ALIGNMENT SCORE: [0.0-1.0]
0.0 = completely contradictory recommendations
0.5 = different approaches but compatible
1.0 = identical recommendations"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.2,
                max_tokens=800
            )

            recommendations = []

            # Extract recommendations
            rec_section = re.search(r'RECOMMENDATIONS:(.*?)(?=ALIGNMENT ANALYSIS|$)', result, re.DOTALL)
            if rec_section:
                rec_text = rec_section.group(1)
                for line in rec_text.split('\n'):
                    line = line.strip().lstrip('-').strip()
                    if ':' in line and len(line) > 10:
                        # Parse recommendation
                        parts = line.split(':')
                        if len(parts) >= 2:
                            agent_name = parts[0].strip()
                            rec_text = ':'.join(parts[1:]).strip()

                            # Extract action type
                            action_match = re.search(r'ACTION:\s*(\w+)', rec_text, re.IGNORECASE)
                            action_type = action_match.group(1).lower() if action_match else "other"

                            # Extract priority
                            priority_match = re.search(r'PRIORITY:\s*(\w+)', rec_text, re.IGNORECASE)
                            priority = priority_match.group(1).lower() if priority_match else "medium"

                            recommendations.append(ExtractedRecommendation(
                                recommendation_text=rec_text.split('(')[0].strip(),
                                agent_id=agent_name.lower().replace(' ', '_'),
                                agent_name=agent_name,
                                action_type=action_type,
                                priority=priority
                            ))

            # Extract alignment analysis
            analysis_match = re.search(r'ALIGNMENT ANALYSIS:(.*?)(?=ALIGNMENT SCORE|$)', result, re.DOTALL)
            summary = analysis_match.group(1).strip() if analysis_match else ""

            # Extract alignment score
            score_match = re.search(r'ALIGNMENT SCORE:\s*(\d+\.?\d*)', result)
            if score_match:
                alignment_score = float(score_match.group(1))
                alignment_score = min(max(alignment_score, 0.0), 1.0)
            else:
                # Calculate based on action type agreement
                if recommendations:
                    action_types = [r.action_type for r in recommendations]
                    most_common = max(set(action_types), key=action_types.count)
                    alignment_score = action_types.count(most_common) / len(action_types)
                else:
                    alignment_score = 0.5

            return alignment_score, recommendations, summary

        except Exception as e:
            logger.warning(f"Recommendation alignment analysis failed: {e}")
            return 0.5, [], ""

    async def _calculate_evidence_overlap(
        self,
        responses: List[Dict[str, Any]]
    ) -> float:
        """
        Calculate overlap in evidence/sources cited by experts.
        """
        # Extract citations from each response
        all_citations = []

        for resp in responses:
            citations = resp.get("citations", resp.get("sources_used", []))
            if isinstance(citations, list):
                all_citations.append(set(str(c) for c in citations))
            else:
                all_citations.append(set())

        # If no citations, use content-based overlap estimation
        if not any(all_citations):
            # Fall back to LLM-based evidence detection
            return await self._estimate_evidence_overlap_via_llm(responses)

        # Calculate Jaccard similarity across all pairs
        if len(all_citations) < 2:
            return 1.0

        total_similarity = 0
        pair_count = 0

        for i in range(len(all_citations)):
            for j in range(i + 1, len(all_citations)):
                set_a = all_citations[i]
                set_b = all_citations[j]

                if set_a or set_b:
                    intersection = len(set_a & set_b)
                    union = len(set_a | set_b)
                    similarity = intersection / union if union > 0 else 0
                    total_similarity += similarity
                    pair_count += 1

        return total_similarity / pair_count if pair_count > 0 else 0.5

    async def _estimate_evidence_overlap_via_llm(
        self,
        responses: List[Dict[str, Any]]
    ) -> float:
        """Estimate evidence overlap when explicit citations aren't available."""
        response_texts = []
        for i, resp in enumerate(responses):
            content = resp.get("content", resp.get("response", ""))[:400]
            name = resp.get("agent_name", f"Expert {i+1}")
            response_texts.append(f"**{name}**: {content}")

        prompt = f"""Analyze whether these expert responses cite similar evidence, studies, or sources.

Responses:
{chr(10).join(response_texts)}

Rate the evidence overlap on a scale of 0.0 to 1.0:
0.0 = completely different sources/evidence
0.5 = some shared references
1.0 = citing the same evidence

EVIDENCE OVERLAP SCORE:"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.1,
                max_tokens=50
            )

            match = re.search(r'(\d+\.?\d*)', result)
            if match:
                score = float(match.group(1))
                return min(max(score, 0.0), 1.0)

            return 0.5

        except Exception as e:
            logger.warning(f"Evidence overlap estimation failed: {e}")
            return 0.5

    async def _extract_agreement_points(
        self,
        responses: List[Dict[str, Any]],
        claims: List[ExtractedClaim]
    ) -> List[str]:
        """Extract key points where experts agree."""
        # Use extracted claims if available
        if claims:
            return [c.claim_text for c in claims[:5]]  # Top 5 agreed claims

        # Otherwise use LLM extraction
        response_texts = [
            resp.get("content", resp.get("response", ""))[:300]
            for resp in responses
        ]

        prompt = f"""Identify the top 3-5 points where these experts AGREE:

{chr(10).join(response_texts)}

List only points of clear agreement:
-"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.2,
                max_tokens=300
            )

            points = []
            for line in result.split('\n'):
                line = line.strip().lstrip('-').strip()
                if line and len(line) > 10:
                    points.append(line)

            return points[:5]

        except Exception as e:
            logger.warning(f"Agreement point extraction failed: {e}")
            return []

    async def _extract_divergent_points(
        self,
        responses: List[Dict[str, Any]],
        divergent_claims: List[str]
    ) -> List[str]:
        """Extract key points where experts disagree."""
        if divergent_claims:
            return divergent_claims[:5]

        response_texts = [
            resp.get("content", resp.get("response", ""))[:300]
            for resp in responses
        ]

        prompt = f"""Identify the top 3-5 points where these experts DISAGREE or have different views:

{chr(10).join(response_texts)}

List only points of disagreement:
-"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.2,
                max_tokens=300
            )

            points = []
            for line in result.split('\n'):
                line = line.strip().lstrip('-').strip()
                if line and len(line) > 10:
                    points.append(line)

            return points[:5]

        except Exception as e:
            logger.warning(f"Divergent point extraction failed: {e}")
            return []

    async def _extract_key_themes(
        self,
        responses: List[Dict[str, Any]]
    ) -> List[str]:
        """Extract key themes discussed across all responses."""
        response_texts = [
            resp.get("content", resp.get("response", ""))[:400]
            for resp in responses
        ]

        prompt = f"""Identify the 3-5 main themes discussed across these expert responses:

{chr(10).join(response_texts)}

List the key themes:
-"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.3,
                max_tokens=200
            )

            themes = []
            for line in result.split('\n'):
                line = line.strip().lstrip('-').strip()
                if line and len(line) > 3:
                    themes.append(line)

            return themes[:5]

        except Exception as e:
            logger.warning(f"Theme extraction failed: {e}")
            return []

    async def _build_final_recommendation(
        self,
        question: str,
        responses: List[Dict[str, Any]],
        consensus_level: str,
        recommendation_summary: str
    ) -> str:
        """Build final synthesized recommendation based on all expert input."""
        response_summaries = []
        for resp in responses:
            name = resp.get("agent_name", "Expert")
            content = resp.get("content", resp.get("response", ""))[:200]
            response_summaries.append(f"- {name}: {content}...")

        prompt = f"""Based on this panel discussion, provide a final recommendation.

Question: {question}

Expert Summaries:
{chr(10).join(response_summaries)}

Consensus Level: {consensus_level.upper()}
{f"Alignment Analysis: {recommendation_summary}" if recommendation_summary else ""}

Provide a balanced, actionable recommendation that:
1. Acknowledges the consensus level ({consensus_level})
2. Highlights key agreed-upon points
3. Notes any important caveats or dissenting views
4. Suggests concrete next steps

FINAL RECOMMENDATION:"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.3,
                max_tokens=500
            )

            # Clean up the response
            result = result.replace("FINAL RECOMMENDATION:", "").strip()
            return result

        except Exception as e:
            logger.warning(f"Recommendation generation failed: {e}")
            return f"Based on {len(responses)} expert responses with {consensus_level} consensus, further analysis is recommended."

    def _extract_dissenting_opinions(
        self,
        responses: List[Dict[str, Any]],
        consensus_score: float
    ) -> Dict[str, str]:
        """Extract dissenting opinions from low-confidence responses."""
        dissenting = {}

        for resp in responses:
            confidence = resp.get("confidence", resp.get("confidence_score", 0.8))

            # Consider responses with significantly lower confidence as potential dissent
            if confidence < 0.6 or confidence < (consensus_score - 0.2):
                agent_name = resp.get("agent_name", "Unknown Expert")
                content = resp.get("content", resp.get("response", ""))[:300]
                dissenting[agent_name] = f"Lower confidence ({confidence:.0%}): {content}..."

        return dissenting

    def _calculate_confidence(
        self,
        responses: List[Dict[str, Any]],
        consensus_score: float
    ) -> float:
        """Calculate overall confidence in the consensus analysis."""
        # Base confidence on:
        # 1. Number of responses (more = higher confidence)
        # 2. Consistency of individual confidence scores
        # 3. Consensus score itself

        response_count_factor = min(len(responses) / 5, 1.0)  # Max at 5 responses

        confidences = [
            resp.get("confidence", resp.get("confidence_score", 0.7))
            for resp in responses
        ]

        if confidences:
            avg_confidence = sum(confidences) / len(confidences)
            confidence_variance = sum((c - avg_confidence) ** 2 for c in confidences) / len(confidences)
            consistency_factor = 1.0 - min(confidence_variance, 0.5)  # Lower variance = higher consistency
        else:
            avg_confidence = 0.7
            consistency_factor = 0.5

        # Weighted combination
        overall_confidence = (
            0.3 * response_count_factor +
            0.3 * avg_confidence +
            0.2 * consistency_factor +
            0.2 * consensus_score
        )

        return round(min(max(overall_confidence, 0.0), 1.0), 3)

    def _empty_result(self) -> ConsensusResult:
        """Return empty result for no responses."""
        return ConsensusResult(
            consensus_score=0.0,
            consensus_level="low",
            semantic_similarity=0.0,
            claim_overlap=0.0,
            recommendation_alignment=0.0,
            evidence_overlap=0.0,
            agreement_points=[],
            divergent_points=[],
            key_themes=[],
            recommendation="No expert responses available for analysis.",
            dissenting_opinions={},
            confidence=0.0,
            analysis_metadata={"error": "no_responses"}
        )

    def _single_response_result(self, response: Dict[str, Any]) -> ConsensusResult:
        """Return result for single response (no consensus needed)."""
        content = response.get("content", response.get("response", ""))
        agent_name = response.get("agent_name", "Expert")
        confidence = response.get("confidence", response.get("confidence_score", 0.8))

        return ConsensusResult(
            consensus_score=1.0,  # Single response = perfect "consensus"
            consensus_level="high",
            semantic_similarity=1.0,
            claim_overlap=1.0,
            recommendation_alignment=1.0,
            evidence_overlap=1.0,
            agreement_points=[f"Single expert analysis from {agent_name}"],
            divergent_points=[],
            key_themes=[],
            recommendation=content[:500] if content else "No recommendation available.",
            dissenting_opinions={},
            confidence=confidence,
            analysis_metadata={"single_response": True, "agent": agent_name}
        )

    def _fallback_consensus(self, responses: List[Dict[str, Any]]) -> ConsensusResult:
        """Fallback consensus calculation when advanced analysis fails."""
        # Simple average confidence
        confidences = [
            resp.get("confidence", resp.get("confidence_score", 0.5))
            for resp in responses
        ]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.5

        consensus_level = "high" if avg_confidence > 0.8 else "medium" if avg_confidence > 0.5 else "low"

        return ConsensusResult(
            consensus_score=avg_confidence,
            consensus_level=consensus_level,
            semantic_similarity=avg_confidence,
            claim_overlap=avg_confidence,
            recommendation_alignment=avg_confidence,
            evidence_overlap=avg_confidence,
            agreement_points=["Analysis completed with basic consensus calculation"],
            divergent_points=[],
            key_themes=[],
            recommendation="Further detailed analysis recommended.",
            dissenting_opinions={},
            confidence=0.5,
            analysis_metadata={"fallback": True, "response_count": len(responses)}
        )


# Factory function
def create_consensus_analyzer(llm_service: LLMService) -> AdvancedConsensusAnalyzer:
    """Create an advanced consensus analyzer instance."""
    return AdvancedConsensusAnalyzer(llm_service)


# Singleton instance
_consensus_analyzer: Optional[AdvancedConsensusAnalyzer] = None


def get_consensus_analyzer() -> Optional[AdvancedConsensusAnalyzer]:
    """Get the global consensus analyzer instance."""
    return _consensus_analyzer


def initialize_consensus_analyzer(llm_service: LLMService) -> AdvancedConsensusAnalyzer:
    """Initialize the global consensus analyzer."""
    global _consensus_analyzer
    _consensus_analyzer = AdvancedConsensusAnalyzer(llm_service)
    logger.info("✅ Advanced Consensus Analyzer initialized")
    return _consensus_analyzer
