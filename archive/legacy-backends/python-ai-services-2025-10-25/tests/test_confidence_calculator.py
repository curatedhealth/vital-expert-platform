"""
Unit tests for Confidence Calculator Service

Tests dynamic confidence calculation based on:
- RAG similarity scores
- Query-agent alignment
- Response completeness
- Tier-based adjustments
- Domain-specific boosts
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import numpy as np

from services.confidence_calculator import (
    ConfidenceCalculator,
    get_confidence_calculator
)


# ============================================================================
# Basic Functionality Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestConfidenceCalculatorBasics:
    """Test basic confidence calculator functionality"""

    def test_singleton_instance(self):
        """Test that get_confidence_calculator returns singleton"""
        calc1 = get_confidence_calculator()
        calc2 = get_confidence_calculator()
        assert calc1 is calc2

    def test_initialization(self):
        """Test calculator initializes with correct weights"""
        calc = ConfidenceCalculator()

        assert calc.weights["rag"] == 0.40
        assert calc.weights["alignment"] == 0.40
        assert calc.weights["completeness"] == 0.20

        assert calc.tier_base_confidence[1] == 0.75
        assert calc.tier_base_confidence[2] == 0.65
        assert calc.tier_base_confidence[3] == 0.55

    def test_domain_boosts_configured(self):
        """Test domain boosts are configured"""
        calc = ConfidenceCalculator()

        assert "regulatory_affairs" in calc.domain_boosts
        assert "clinical_development" in calc.domain_boosts
        assert calc.domain_boosts["regulatory_affairs"] == 0.05


# ============================================================================
# RAG Confidence Calculation Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestRAGConfidence:
    """Test RAG similarity confidence calculation"""

    @pytest.mark.asyncio
    async def test_rag_confidence_high_quality(self):
        """Test RAG confidence with high quality results"""
        calc = ConfidenceCalculator()

        rag_results = [
            {"similarity": 0.92},
            {"similarity": 0.89},
            {"similarity": 0.87},
            {"similarity": 0.84},
            {"similarity": 0.81}
        ]

        confidence = await calc._calculate_rag_confidence(rag_results)

        # Should be high (avg ~0.87 + consistency bonus)
        assert 0.85 <= confidence <= 0.95

    @pytest.mark.asyncio
    async def test_rag_confidence_medium_quality(self):
        """Test RAG confidence with medium quality results"""
        calc = ConfidenceCalculator()

        rag_results = [
            {"similarity": 0.72},
            {"similarity": 0.68},
            {"similarity": 0.65}
        ]

        confidence = await calc._calculate_rag_confidence(rag_results)

        # Should be medium (avg ~0.68)
        assert 0.60 <= confidence <= 0.75

    @pytest.mark.asyncio
    async def test_rag_confidence_low_quality(self):
        """Test RAG confidence with low quality results"""
        calc = ConfidenceCalculator()

        rag_results = [
            {"similarity": 0.55},
            {"similarity": 0.52}
        ]

        confidence = await calc._calculate_rag_confidence(rag_results)

        # Should be low (avg ~0.53)
        assert 0.50 <= confidence <= 0.60

    @pytest.mark.asyncio
    async def test_rag_confidence_no_results(self):
        """Test RAG confidence with no results"""
        calc = ConfidenceCalculator()

        confidence = await calc._calculate_rag_confidence(None)
        assert confidence == 0.50

        confidence = await calc._calculate_rag_confidence([])
        assert confidence == 0.50

    @pytest.mark.asyncio
    async def test_rag_confidence_consistency_bonus(self):
        """Test that consistency bonus is applied correctly"""
        calc = ConfidenceCalculator()

        # All high-quality results
        consistent_results = [
            {"similarity": 0.92},
            {"similarity": 0.91},
            {"similarity": 0.90},
            {"similarity": 0.89},
            {"similarity": 0.88}
        ]

        # Mixed quality results
        inconsistent_results = [
            {"similarity": 0.92},
            {"similarity": 0.65},
            {"similarity": 0.58},
            {"similarity": 0.45},
            {"similarity": 0.40}
        ]

        consistent_conf = await calc._calculate_rag_confidence(consistent_results)
        inconsistent_conf = await calc._calculate_rag_confidence(inconsistent_results)

        # Consistent should be higher due to bonus
        assert consistent_conf > inconsistent_conf


# ============================================================================
# Alignment Confidence Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestAlignmentConfidence:
    """Test query-agent alignment calculation"""

    @pytest.mark.asyncio
    async def test_alignment_calculation(self, sample_query, sample_agent_metadata):
        """Test basic alignment calculation"""
        calc = ConfidenceCalculator()

        with patch.object(calc.embeddings, 'aembed_query') as mock_embed:
            # Mock embeddings that are similar
            query_emb = np.random.rand(1536).tolist()
            agent_emb = (np.array(query_emb) + np.random.rand(1536) * 0.1).tolist()

            mock_embed.side_effect = [query_emb, agent_emb]

            alignment = await calc._calculate_alignment_confidence(
                sample_query,
                sample_agent_metadata
            )

            # Should be high similarity
            assert 0.70 <= alignment <= 1.0

    @pytest.mark.asyncio
    async def test_alignment_with_error(self, sample_query, sample_agent_metadata):
        """Test alignment calculation error handling"""
        calc = ConfidenceCalculator()

        with patch.object(calc.embeddings, 'aembed_query', side_effect=Exception("API Error")):
            alignment = await calc._calculate_alignment_confidence(
                sample_query,
                sample_agent_metadata
            )

            # Should return conservative fallback
            assert alignment == 0.60


# ============================================================================
# Completeness Confidence Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestCompletenessConfidence:
    """Test response completeness calculation"""

    def test_completeness_optimal_length(self, sample_query):
        """Test completeness with optimal response length"""
        calc = ConfidenceCalculator()

        # 800 characters (optimal range: 300-2000)
        response = "A" * 800

        completeness = calc._calculate_completeness_confidence(sample_query, response)

        # Should score high for length
        assert completeness >= 0.70

    def test_completeness_too_short(self, sample_query):
        """Test completeness with too short response"""
        calc = ConfidenceCalculator()

        response = "Short answer."  # < 100 chars

        completeness = calc._calculate_completeness_confidence(sample_query, response)

        # Should score low
        assert completeness <= 0.50

    def test_completeness_too_long(self, sample_query):
        """Test completeness with very long response"""
        calc = ConfidenceCalculator()

        response = "A" * 5000  # > 4000 chars

        completeness = calc._calculate_completeness_confidence(sample_query, response)

        # Should score medium (verbose penalty)
        assert 0.60 <= completeness <= 0.85

    def test_completeness_with_structure(self, sample_query):
        """Test completeness bonus for structured response"""
        calc = ConfidenceCalculator()

        structured_response = """
        Answer to your question:

        1. First point
        2. Second point
        - Bullet item
        - Another item

        **Important**: Key information

        References:
        [1] Source document
        """

        unstructured_response = "A" * len(structured_response)

        structured_score = calc._calculate_completeness_confidence(
            sample_query,
            structured_response
        )
        unstructured_score = calc._calculate_completeness_confidence(
            sample_query,
            unstructured_response
        )

        # Structured should score higher
        assert structured_score > unstructured_score

    def test_completeness_with_regulatory_refs(self, sample_query):
        """Test bonus for regulatory references"""
        calc = ConfidenceCalculator()

        with_refs = """
        FDA requires 510(k) premarket notification for Class II devices.
        Reference: 21 CFR Part 807.
        EMA provides guidance under MDR 2017/745.
        """

        without_refs = "Devices need approval. Submit documentation."

        with_refs_score = calc._calculate_completeness_confidence(sample_query, with_refs)
        without_refs_score = calc._calculate_completeness_confidence(sample_query, without_refs)

        # With refs should score higher
        assert with_refs_score > without_refs_score


# ============================================================================
# End-to-End Confidence Calculation Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestEndToEndConfidence:
    """Test complete confidence calculation"""

    @pytest.mark.asyncio
    async def test_high_quality_response(
        self,
        high_quality_scenario
    ):
        """Test confidence for high quality response"""
        calc = ConfidenceCalculator()

        # Mock embeddings
        with patch.object(calc.embeddings, 'aembed_query') as mock_embed:
            query_emb = np.random.rand(1536).tolist()
            agent_emb = (np.array(query_emb) + np.random.rand(1536) * 0.05).tolist()
            mock_embed.side_effect = [query_emb, agent_emb]

            result = await calc.calculate_confidence(
                query=high_quality_scenario["query"],
                response=high_quality_scenario["response"],
                agent_metadata=high_quality_scenario["agent_metadata"],
                rag_results=high_quality_scenario["rag_results"]
            )

            # Check confidence is in expected range
            min_conf, max_conf = high_quality_scenario["expected_confidence_range"]
            assert min_conf <= result["confidence"] <= max_conf

            # Check quality level
            assert result["quality_level"] == high_quality_scenario["expected_quality"]

            # Check breakdown exists
            assert "breakdown" in result
            assert "rag_confidence" in result["breakdown"]
            assert "alignment_confidence" in result["breakdown"]
            assert "completeness_confidence" in result["breakdown"]

            # Check reasoning exists
            assert "reasoning" in result
            assert len(result["reasoning"]) > 0

    @pytest.mark.asyncio
    async def test_medium_quality_response(
        self,
        medium_quality_scenario
    ):
        """Test confidence for medium quality response"""
        calc = ConfidenceCalculator()

        with patch.object(calc.embeddings, 'aembed_query') as mock_embed:
            query_emb = np.random.rand(1536).tolist()
            agent_emb = (np.array(query_emb) + np.random.rand(1536) * 0.3).tolist()
            mock_embed.side_effect = [query_emb, agent_emb]

            result = await calc.calculate_confidence(
                query=medium_quality_scenario["query"],
                response=medium_quality_scenario["response"],
                agent_metadata=medium_quality_scenario["agent_metadata"],
                rag_results=medium_quality_scenario["rag_results"]
            )

            min_conf, max_conf = medium_quality_scenario["expected_confidence_range"]
            assert min_conf <= result["confidence"] <= max_conf
            assert result["quality_level"] == medium_quality_scenario["expected_quality"]

    @pytest.mark.asyncio
    async def test_low_quality_response(
        self,
        low_quality_scenario
    ):
        """Test confidence for low quality response"""
        calc = ConfidenceCalculator()

        with patch.object(calc.embeddings, 'aembed_query') as mock_embed:
            query_emb = np.random.rand(1536).tolist()
            agent_emb = np.random.rand(1536).tolist()  # Unrelated
            mock_embed.side_effect = [query_emb, agent_emb]

            result = await calc.calculate_confidence(
                query=low_quality_scenario["query"],
                response=low_quality_scenario["response"],
                agent_metadata=low_quality_scenario["agent_metadata"],
                rag_results=low_quality_scenario["rag_results"]
            )

            min_conf, max_conf = low_quality_scenario["expected_confidence_range"]
            assert min_conf <= result["confidence"] <= max_conf
            assert result["quality_level"] == low_quality_scenario["expected_quality"]


# ============================================================================
# Tier-Based Confidence Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestTierBasedConfidence:
    """Test tier-based confidence adjustments"""

    @pytest.mark.asyncio
    async def test_tier1_base_confidence(
        self,
        sample_query,
        sample_response,
        tier1_agent_metadata,
        sample_rag_results
    ):
        """Test Tier 1 agent gets appropriate base confidence"""
        calc = ConfidenceCalculator()

        with patch.object(calc.embeddings, 'aembed_query') as mock_embed:
            query_emb = np.random.rand(1536).tolist()
            agent_emb = (np.array(query_emb) + np.random.rand(1536) * 0.1).tolist()
            mock_embed.side_effect = [query_emb, agent_emb]

            result = await calc.calculate_confidence(
                query=sample_query,
                response=sample_response,
                agent_metadata=tier1_agent_metadata,
                rag_results=sample_rag_results
            )

            # Tier 1 should have high confidence
            assert result["confidence"] >= 0.70
            assert result["breakdown"]["tier_base"] == 0.75

    @pytest.mark.asyncio
    async def test_tier3_base_confidence(
        self,
        sample_query,
        sample_response,
        tier3_agent_metadata,
        sample_rag_results
    ):
        """Test Tier 3 agent gets appropriate base confidence"""
        calc = ConfidenceCalculator()

        with patch.object(calc.embeddings, 'aembed_query') as mock_embed:
            query_emb = np.random.rand(1536).tolist()
            agent_emb = (np.array(query_emb) + np.random.rand(1536) * 0.1).tolist()
            mock_embed.side_effect = [query_emb, agent_emb]

            result = await calc.calculate_confidence(
                query=sample_query,
                response=sample_response,
                agent_metadata=tier3_agent_metadata,
                rag_results=sample_rag_results
            )

            # Tier 3 should have lower base confidence
            assert result["breakdown"]["tier_base"] == 0.55

    @pytest.mark.asyncio
    async def test_tier_comparison(
        self,
        sample_query,
        sample_response,
        tier1_agent_metadata,
        tier2_agent_metadata,
        tier3_agent_metadata,
        sample_rag_results
    ):
        """Test that higher tiers get higher confidence for same response"""
        calc = ConfidenceCalculator()

        results = []

        for agent_metadata in [tier1_agent_metadata, tier2_agent_metadata, tier3_agent_metadata]:
            with patch.object(calc.embeddings, 'aembed_query') as mock_embed:
                query_emb = np.random.rand(1536).tolist()
                agent_emb = (np.array(query_emb) + np.random.rand(1536) * 0.1).tolist()
                mock_embed.side_effect = [query_emb, agent_emb]

                result = await calc.calculate_confidence(
                    query=sample_query,
                    response=sample_response,
                    agent_metadata=agent_metadata,
                    rag_results=sample_rag_results
                )
                results.append(result["confidence"])

        # Tier 1 >= Tier 2 >= Tier 3
        assert results[0] >= results[1] >= results[2]


# ============================================================================
# Domain Boost Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestDomainBoosts:
    """Test domain-specific confidence boosts"""

    def test_regulatory_domain_boost(self):
        """Test regulatory domain gets appropriate boost"""
        calc = ConfidenceCalculator()

        regulatory_metadata = {
            "name": "Regulatory Expert",
            "tier": 1,
            "specialties": ["fda_regulatory", "ema_regulatory"]
        }

        boost = calc._calculate_domain_boost(regulatory_metadata)

        # Should get boost for regulatory (0.05)
        assert boost >= 0.05

    def test_multiple_domain_boost(self):
        """Test multiple critical domains get combined boost"""
        calc = ConfidenceCalculator()

        multi_domain_metadata = {
            "name": "Multi-domain Expert",
            "tier": 1,
            "specialties": [
                "regulatory_affairs",
                "pharmacovigilance",
                "clinical_development"
            ]
        }

        boost = calc._calculate_domain_boost(multi_domain_metadata)

        # Should get combined boost (0.05 + 0.04 + 0.03 = 0.12)
        assert boost >= 0.10

    def test_domain_boost_capped(self):
        """Test domain boost is capped at 0.15"""
        calc = ConfidenceCalculator()

        many_domains_metadata = {
            "name": "Expert",
            "tier": 1,
            "specialties": [
                "regulatory_affairs",  # +0.05
                "pharmacovigilance",   # +0.04
                "clinical_development", # +0.03
                "medical_affairs",     # +0.03
                # Total would be 0.15+
            ]
        }

        boost = calc._calculate_domain_boost(many_domains_metadata)

        # Should be capped at 0.15
        assert boost <= 0.15


# ============================================================================
# Error Handling Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestErrorHandling:
    """Test error handling in confidence calculation"""

    @pytest.mark.asyncio
    async def test_embedding_api_error(
        self,
        sample_query,
        sample_response,
        sample_agent_metadata,
        sample_rag_results
    ):
        """Test graceful handling of embedding API errors"""
        calc = ConfidenceCalculator()

        with patch.object(calc.embeddings, 'aembed_query', side_effect=Exception("API Error")):
            result = await calc.calculate_confidence(
                query=sample_query,
                response=sample_response,
                agent_metadata=sample_agent_metadata,
                rag_results=sample_rag_results
            )

            # Should still return result (with fallback)
            assert "confidence" in result
            assert result["confidence"] >= 0.30  # Minimum threshold

    @pytest.mark.asyncio
    async def test_missing_agent_metadata(
        self,
        sample_query,
        sample_response,
        sample_rag_results
    ):
        """Test handling of missing agent metadata"""
        calc = ConfidenceCalculator()

        with patch.object(calc.embeddings, 'aembed_query') as mock_embed:
            query_emb = np.random.rand(1536).tolist()
            agent_emb = np.random.rand(1536).tolist()
            mock_embed.side_effect = [query_emb, agent_emb]

            result = await calc.calculate_confidence(
                query=sample_query,
                response=sample_response,
                agent_metadata={},  # Empty metadata
                rag_results=sample_rag_results
            )

            # Should handle gracefully
            assert "confidence" in result


# ============================================================================
# Reasoning Generation Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestReasoningGeneration:
    """Test human-readable reasoning generation"""

    def test_reasoning_content(self):
        """Test reasoning contains appropriate information"""
        calc = ConfidenceCalculator()

        reasoning = calc._generate_reasoning(
            rag_confidence=0.92,
            alignment_confidence=0.88,
            completeness_confidence=0.85,
            tier=1,
            domain_boost=0.05,
            final_confidence=0.90
        )

        assert "90.0%" in reasoning or "90%" in reasoning
        assert "high-quality" in reasoning.lower() or "strong" in reasoning.lower()

    def test_reasoning_varies_by_quality(self):
        """Test reasoning text varies based on quality"""
        calc = ConfidenceCalculator()

        high_reasoning = calc._generate_reasoning(
            rag_confidence=0.92,
            alignment_confidence=0.90,
            completeness_confidence=0.88,
            tier=1,
            domain_boost=0.05,
            final_confidence=0.92
        )

        low_reasoning = calc._generate_reasoning(
            rag_confidence=0.45,
            alignment_confidence=0.50,
            completeness_confidence=0.40,
            tier=3,
            domain_boost=0.0,
            final_confidence=0.48
        )

        # Should have different descriptors
        assert high_reasoning != low_reasoning


# ============================================================================
# Quality Level Mapping Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestQualityLevelMapping:
    """Test confidence to quality level mapping"""

    def test_high_quality_threshold(self):
        """Test high quality level threshold"""
        calc = ConfidenceCalculator()

        assert calc._get_quality_level(0.90) == "high"
        assert calc._get_quality_level(0.85) == "high"

    def test_good_quality_threshold(self):
        """Test good quality level threshold"""
        calc = ConfidenceCalculator()

        assert calc._get_quality_level(0.78) == "good"
        assert calc._get_quality_level(0.70) == "good"

    def test_medium_quality_threshold(self):
        """Test medium quality level threshold"""
        calc = ConfidenceCalculator()

        assert calc._get_quality_level(0.62) == "medium"
        assert calc._get_quality_level(0.55) == "medium"

    def test_low_quality_threshold(self):
        """Test low quality level threshold"""
        calc = ConfidenceCalculator()

        assert calc._get_quality_level(0.45) == "low"
        assert calc._get_quality_level(0.30) == "low"
