"""
Dynamic Confidence Calculator Service

Calculates agent response confidence based on multiple factors:
1. RAG similarity scores (40%)
2. Query-agent alignment (40%)
3. Response completeness (20%)

Replaces hardcoded confidence values with dynamic, evidence-based scoring.
"""

import os
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from langchain_openai import OpenAIEmbeddings

logger = structlog.get_logger()


class ConfidenceCalculator:
    """Dynamic confidence calculator for agent responses"""

    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-3-large"
        )

        # Configurable weights from environment
        self.weights = {
            "rag": float(os.getenv("CONFIDENCE_RAG_WEIGHT", "0.40")),
            "alignment": float(os.getenv("CONFIDENCE_ALIGNMENT_WEIGHT", "0.40")),
            "completeness": float(os.getenv("CONFIDENCE_COMPLETENESS_WEIGHT", "0.20"))
        }

        # Tier-specific base confidence (higher tiers = higher starting confidence)
        self.tier_base_confidence = {
            1: float(os.getenv("CONFIDENCE_TIER1_BASE", "0.75")),
            2: float(os.getenv("CONFIDENCE_TIER2_BASE", "0.65")),
            3: float(os.getenv("CONFIDENCE_TIER3_BASE", "0.55"))
        }

        # Domain-specific boosts
        self.domain_boosts = {
            "regulatory_affairs": float(os.getenv("CONFIDENCE_BOOST_REGULATORY", "0.05")),
            "clinical_development": float(os.getenv("CONFIDENCE_BOOST_CLINICAL", "0.03")),
            "pharmacovigilance": float(os.getenv("CONFIDENCE_BOOST_PHARMA", "0.04")),
            "medical_affairs": float(os.getenv("CONFIDENCE_BOOST_MEDICAL", "0.03"))
        }

        logger.info("✅ ConfidenceCalculator initialized", weights=self.weights)

    async def calculate_confidence(
        self,
        query: str,
        response: str,
        agent_metadata: Dict[str, Any],
        rag_results: Optional[List[Dict[str, Any]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculate dynamic confidence score for agent response

        Args:
            query: Original user query
            response: Agent's response text
            agent_metadata: Agent metadata (specialties, tier, domains)
            rag_results: RAG retrieval results with similarity scores
            context: Additional context (conversation history, etc.)

        Returns:
            Dict containing:
                - confidence: Final confidence score (0.0 - 1.0)
                - breakdown: Individual component scores
                - reasoning: Human-readable explanation
        """
        try:
            # 1. Calculate RAG confidence (40%)
            rag_confidence = await self._calculate_rag_confidence(rag_results)

            # 2. Calculate query-agent alignment (40%)
            alignment_confidence = await self._calculate_alignment_confidence(
                query,
                agent_metadata
            )

            # 3. Calculate response completeness (20%)
            completeness_confidence = self._calculate_completeness_confidence(
                query,
                response
            )

            # 4. Apply tier-based base confidence
            tier = agent_metadata.get("tier", 2)
            tier_base = self.tier_base_confidence.get(tier, 0.60)

            # 5. Apply domain-specific boosts
            domain_boost = self._calculate_domain_boost(agent_metadata)

            # 6. Weighted combination
            weighted_score = (
                rag_confidence * self.weights["rag"] +
                alignment_confidence * self.weights["alignment"] +
                completeness_confidence * self.weights["completeness"]
            )

            # 7. Final confidence with tier base and domain boost
            # Formula: (weighted_score * 0.7) + (tier_base * 0.2) + (domain_boost * 0.1)
            final_confidence = min(
                (weighted_score * 0.7) + (tier_base * 0.2) + (domain_boost * 0.1),
                0.99  # Cap at 0.99 (never 100% certain)
            )

            # Ensure minimum confidence threshold
            final_confidence = max(final_confidence, 0.30)

            # Generate reasoning
            reasoning = self._generate_reasoning(
                rag_confidence,
                alignment_confidence,
                completeness_confidence,
                tier,
                domain_boost,
                final_confidence
            )

            result = {
                "confidence": round(final_confidence, 3),
                "breakdown": {
                    "rag_confidence": round(rag_confidence, 3),
                    "alignment_confidence": round(alignment_confidence, 3),
                    "completeness_confidence": round(completeness_confidence, 3),
                    "tier_base": round(tier_base, 3),
                    "domain_boost": round(domain_boost, 3),
                    "weighted_score": round(weighted_score, 3)
                },
                "reasoning": reasoning,
                "quality_level": self._get_quality_level(final_confidence),
                "calculated_at": datetime.now().isoformat()
            }

            logger.info(
                "✅ Confidence calculated",
                final_confidence=final_confidence,
                tier=tier,
                quality=result["quality_level"]
            )

            return result

        except Exception as e:
            logger.error("❌ Confidence calculation failed", error=str(e))
            # Fallback to conservative estimate
            return {
                "confidence": 0.60,
                "breakdown": {},
                "reasoning": "Confidence calculation error - using conservative estimate",
                "quality_level": "medium",
                "error": str(e)
            }

    async def _calculate_rag_confidence(
        self,
        rag_results: Optional[List[Dict[str, Any]]]
    ) -> float:
        """
        Calculate confidence based on RAG retrieval quality

        Considers:
        - Average similarity score of top results
        - Number of relevant results
        - Score distribution (consistency)
        """
        if not rag_results or len(rag_results) == 0:
            # No RAG results = lower confidence
            return 0.50

        # Extract similarity scores
        scores = [r.get("similarity", 0.0) for r in rag_results]

        if len(scores) == 0:
            return 0.50

        # Average of top 5 results (or all if less than 5)
        top_scores = sorted(scores, reverse=True)[:5]
        avg_similarity = np.mean(top_scores)

        # Bonus for having multiple high-quality results
        high_quality_count = sum(1 for s in scores if s > 0.80)
        consistency_bonus = min(high_quality_count * 0.05, 0.15)

        # Calculate RAG confidence
        rag_confidence = min(avg_similarity + consistency_bonus, 0.95)

        return float(rag_confidence)

    async def _calculate_alignment_confidence(
        self,
        query: str,
        agent_metadata: Dict[str, Any]
    ) -> float:
        """
        Calculate query-agent alignment using semantic similarity

        Compares query embedding with agent profile embedding
        """
        try:
            # Get query embedding
            query_embedding = await self.embeddings.aembed_query(query)

            # Build agent profile text
            agent_profile = self._build_agent_profile(agent_metadata)

            # Get agent profile embedding
            agent_embedding = await self.embeddings.aembed_query(agent_profile)

            # Calculate cosine similarity
            similarity = self._cosine_similarity(
                np.array(query_embedding),
                np.array(agent_embedding)
            )

            # Normalize to 0-1 range (cosine similarity is -1 to 1)
            alignment = (similarity + 1.0) / 2.0

            return float(alignment)

        except Exception as e:
            logger.error("❌ Alignment calculation failed", error=str(e))
            return 0.60  # Conservative fallback

    def _calculate_completeness_confidence(
        self,
        query: str,
        response: str
    ) -> float:
        """
        Calculate response completeness based on length and structure

        Considers:
        - Response length (longer = more complete, up to a point)
        - Presence of key elements (lists, citations, explanations)
        - Query-response length ratio
        """
        # 1. Length score (optimal range: 300-2000 characters)
        response_length = len(response)

        if response_length < 100:
            length_score = 0.30  # Too short
        elif response_length < 300:
            length_score = 0.60
        elif response_length <= 2000:
            length_score = 0.90  # Optimal range
        elif response_length <= 4000:
            length_score = 0.80
        else:
            length_score = 0.70  # Very long, might be verbose

        # 2. Structure score (presence of formatting)
        structure_score = 0.0

        # Has lists or bullet points
        if any(marker in response for marker in ['\n-', '\n*', '\n1.', '\n2.']):
            structure_score += 0.15

        # Has sections or headers
        if any(marker in response for marker in ['\n##', '\n###', '**']):
            structure_score += 0.10

        # Has citations or references
        if any(marker in response for marker in ['[', '(ref', 'Source:', 'Reference:']):
            structure_score += 0.15

        # Has regulatory references (FDA, EMA, ICH, CFR)
        if any(ref in response for ref in ['FDA', 'EMA', 'ICH', 'CFR', '510(k)', 'PMA']):
            structure_score += 0.10

        # 3. Ratio score (response should be proportional to query complexity)
        query_length = len(query)
        ratio = response_length / max(query_length, 1)

        if ratio < 2:
            ratio_score = 0.50  # Too brief
        elif ratio <= 10:
            ratio_score = 0.90  # Good proportion
        else:
            ratio_score = 0.70  # Might be too verbose

        # Weighted combination
        completeness = (
            length_score * 0.40 +
            structure_score * 0.30 +
            ratio_score * 0.30
        )

        return min(completeness, 0.95)

    def _calculate_domain_boost(self, agent_metadata: Dict[str, Any]) -> float:
        """
        Calculate domain-specific confidence boost

        Agents specialized in critical domains get slight boost
        """
        specialties = agent_metadata.get("specialties", [])

        total_boost = 0.0
        for specialty in specialties:
            if specialty in self.domain_boosts:
                total_boost += self.domain_boosts[specialty]

        # Cap total domain boost at 0.15
        return min(total_boost, 0.15)

    def _build_agent_profile(self, agent_metadata: Dict[str, Any]) -> str:
        """Build agent profile text for embedding"""
        name = agent_metadata.get("name", "Agent")
        specialties = agent_metadata.get("specialties", [])
        tier = agent_metadata.get("tier", 2)

        profile = f"""
        Agent: {name}
        Tier: {tier}
        Specialties: {', '.join(specialties)}
        """.strip()

        return profile

    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)

    def _generate_reasoning(
        self,
        rag_confidence: float,
        alignment_confidence: float,
        completeness_confidence: float,
        tier: int,
        domain_boost: float,
        final_confidence: float
    ) -> str:
        """Generate human-readable confidence reasoning"""
        reasons = []

        # RAG quality
        if rag_confidence > 0.80:
            reasons.append("high-quality knowledge base matches")
        elif rag_confidence > 0.60:
            reasons.append("moderate knowledge base support")
        else:
            reasons.append("limited knowledge base matches")

        # Alignment
        if alignment_confidence > 0.75:
            reasons.append("strong query-agent alignment")
        elif alignment_confidence > 0.60:
            reasons.append("good domain match")
        else:
            reasons.append("partial domain overlap")

        # Completeness
        if completeness_confidence > 0.80:
            reasons.append("comprehensive response")
        elif completeness_confidence > 0.60:
            reasons.append("adequate detail")
        else:
            reasons.append("brief response")

        # Tier
        tier_desc = {1: "top-tier specialist", 2: "experienced agent", 3: "general agent"}
        reasons.append(tier_desc.get(tier, "standard agent"))

        # Domain boost
        if domain_boost > 0.05:
            reasons.append("critical domain expertise")

        reasoning = f"Confidence {final_confidence:.1%} based on: {', '.join(reasons)}."
        return reasoning

    def _get_quality_level(self, confidence: float) -> str:
        """Map confidence score to quality level"""
        if confidence >= 0.85:
            return "high"
        elif confidence >= 0.70:
            return "good"
        elif confidence >= 0.55:
            return "medium"
        else:
            return "low"


# Singleton instance
_confidence_calculator = None


def get_confidence_calculator() -> ConfidenceCalculator:
    """Get singleton confidence calculator instance"""
    global _confidence_calculator
    if _confidence_calculator is None:
        _confidence_calculator = ConfidenceCalculator()
    return _confidence_calculator
