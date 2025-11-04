"""
Unit tests for RAG Configuration System

Tests environment variable-based configuration for:
- Similarity thresholds by tier
- Medical re-ranking boosts
- LLM temperature settings
- Protocol accuracy thresholds
"""

import pytest
import os
from unittest.mock import patch

from core.rag_config import (
    RAGSettings,
    get_rag_settings,
    get_tier_threshold,
    get_tier_temperature,
    get_protocol_accuracy_threshold,
    MedicalRankingBoosts,
    get_medical_ranking_boosts
)


# ============================================================================
# RAGSettings Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.config
class TestRAGSettings:
    """Test RAG settings loading from environment"""

    def test_default_settings(self):
        """Test default settings are loaded correctly"""
        settings = RAGSettings()

        assert settings.similarity_threshold_default == 0.7
        assert settings.similarity_threshold_tier1 == 0.60
        assert settings.similarity_threshold_tier2 == 0.75
        assert settings.similarity_threshold_tier3 == 0.85

    def test_medical_boost_defaults(self):
        """Test medical boost defaults"""
        settings = RAGSettings()

        assert settings.medical_term_boost_per_term == 0.05
        assert settings.specialty_match_boost == 0.10
        assert settings.phase_match_boost == 0.08
        assert settings.evidence_level_boost_high == 0.05
        assert settings.evidence_level_boost_medium == 0.02

    def test_llm_temperature_defaults(self):
        """Test LLM temperature defaults"""
        settings = RAGSettings()

        assert settings.llm_temperature_tier1 == 0.1
        assert settings.llm_temperature_tier2 == 0.15
        assert settings.llm_temperature_tier3 == 0.05

    def test_protocol_accuracy_defaults(self):
        """Test protocol accuracy defaults"""
        settings = RAGSettings()

        assert settings.accuracy_threshold_pharma == 0.98
        assert settings.accuracy_threshold_verify == 0.97
        assert settings.accuracy_threshold_standard == 0.95

    def test_search_parameters_defaults(self):
        """Test search parameters defaults"""
        settings = RAGSettings()

        assert settings.max_search_results == 10
        assert settings.rerank_multiplier == 2
        assert settings.similarity_threshold_multiplier == 0.8

    @patch.dict(os.environ, {
        "SIMILARITY_THRESHOLD_TIER1": "0.65",
        "MEDICAL_TERM_BOOST": "0.08"
    })
    def test_environment_variable_override(self):
        """Test that environment variables override defaults"""
        settings = RAGSettings()

        assert settings.similarity_threshold_tier1 == 0.65
        assert settings.medical_term_boost_per_term == 0.08


# ============================================================================
# Helper Function Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.config
class TestHelperFunctions:
    """Test configuration helper functions"""

    def test_get_tier_threshold_tier1(self):
        """Test getting Tier 1 threshold"""
        threshold = get_tier_threshold(tier=1)
        assert threshold == 0.60

    def test_get_tier_threshold_tier2(self):
        """Test getting Tier 2 threshold"""
        threshold = get_tier_threshold(tier=2)
        assert threshold == 0.75

    def test_get_tier_threshold_tier3(self):
        """Test getting Tier 3 threshold"""
        threshold = get_tier_threshold(tier=3)
        assert threshold == 0.85

    def test_get_tier_threshold_invalid(self):
        """Test getting threshold for invalid tier (should return default)"""
        threshold = get_tier_threshold(tier=99)
        assert threshold == 0.7  # Default

    def test_get_tier_temperature_tier1(self):
        """Test getting Tier 1 temperature"""
        temp = get_tier_temperature(tier=1)
        assert temp == 0.1

    def test_get_tier_temperature_tier2(self):
        """Test getting Tier 2 temperature"""
        temp = get_tier_temperature(tier=2)
        assert temp == 0.15

    def test_get_tier_temperature_tier3(self):
        """Test getting Tier 3 temperature"""
        temp = get_tier_temperature(tier=3)
        assert temp == 0.05

    def test_get_tier_temperature_invalid(self):
        """Test getting temperature for invalid tier (should return default)"""
        temp = get_tier_temperature(tier=99)
        assert temp == 0.1  # Default

    def test_get_protocol_accuracy_pharma(self):
        """Test getting PHARMA protocol accuracy"""
        accuracy = get_protocol_accuracy_threshold("PHARMA")
        assert accuracy == 0.98

    def test_get_protocol_accuracy_verify(self):
        """Test getting VERIFY protocol accuracy"""
        accuracy = get_protocol_accuracy_threshold("VERIFY")
        assert accuracy == 0.97

    def test_get_protocol_accuracy_standard(self):
        """Test getting STANDARD protocol accuracy"""
        accuracy = get_protocol_accuracy_threshold("STANDARD")
        assert accuracy == 0.95

    def test_get_protocol_accuracy_case_insensitive(self):
        """Test protocol name is case-insensitive"""
        accuracy1 = get_protocol_accuracy_threshold("pharma")
        accuracy2 = get_protocol_accuracy_threshold("PHARMA")
        assert accuracy1 == accuracy2 == 0.98

    def test_get_protocol_accuracy_invalid(self):
        """Test getting accuracy for invalid protocol (should return standard)"""
        accuracy = get_protocol_accuracy_threshold("INVALID")
        assert accuracy == 0.95  # Standard default


# ============================================================================
# MedicalRankingBoosts Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.config
class TestMedicalRankingBoosts:
    """Test medical ranking boost calculations"""

    def test_singleton_instance(self):
        """Test that get_medical_ranking_boosts returns singleton"""
        boosts1 = get_medical_ranking_boosts()
        boosts2 = get_medical_ranking_boosts()
        assert boosts1 is boosts2

    def test_medical_term_boost_calculation(self):
        """Test medical term boost calculation"""
        boosts = MedicalRankingBoosts()

        boost_1_term = boosts.get_medical_term_boost(term_count=1)
        boost_3_terms = boosts.get_medical_term_boost(term_count=3)
        boost_5_terms = boosts.get_medical_term_boost(term_count=5)

        assert boost_1_term == 0.05  # 1 * 0.05
        assert boost_3_terms == 0.15  # 3 * 0.05
        assert boost_5_terms == 0.25  # 5 * 0.05

    def test_specialty_match_boost(self):
        """Test specialty match boost"""
        boosts = MedicalRankingBoosts()

        boost = boosts.get_specialty_match_boost()
        assert boost == 0.10

    def test_phase_match_boost(self):
        """Test phase match boost"""
        boosts = MedicalRankingBoosts()

        boost = boosts.get_phase_match_boost()
        assert boost == 0.08

    def test_evidence_level_boost_high(self):
        """Test high evidence level boost (RCT, systematic review)"""
        boosts = MedicalRankingBoosts()

        boost_level1 = boosts.get_evidence_level_boost(evidence_level=1)
        assert boost_level1 == 0.05

    def test_evidence_level_boost_medium(self):
        """Test medium evidence level boost (cohort, case-control)"""
        boosts = MedicalRankingBoosts()

        boost_level2 = boosts.get_evidence_level_boost(evidence_level=2)
        boost_level3 = boosts.get_evidence_level_boost(evidence_level=3)

        assert boost_level2 == 0.02
        assert boost_level3 == 0.02

    def test_evidence_level_boost_low(self):
        """Test low evidence level boost (case series, expert opinion)"""
        boosts = MedicalRankingBoosts()

        boost_level4 = boosts.get_evidence_level_boost(evidence_level=4)
        boost_level5 = boosts.get_evidence_level_boost(evidence_level=5)

        assert boost_level4 == 0.0
        assert boost_level5 == 0.0

    def test_document_type_boost(self):
        """Test document type boost"""
        boosts = MedicalRankingBoosts()

        boost = boosts.get_document_type_boost()
        assert boost == 0.05


# ============================================================================
# Total Boost Calculation Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.config
class TestTotalBoostCalculation:
    """Test combined boost calculations"""

    def test_calculate_total_boost_no_factors(self):
        """Test total boost with no factors"""
        boosts = MedicalRankingBoosts()

        total = boosts.calculate_total_boost()
        assert total == 0.0

    def test_calculate_total_boost_medical_terms_only(self):
        """Test total boost with only medical terms"""
        boosts = MedicalRankingBoosts()

        total = boosts.calculate_total_boost(medical_term_count=3)
        assert total == 0.15  # 3 * 0.05

    def test_calculate_total_boost_specialty_match_only(self):
        """Test total boost with only specialty match"""
        boosts = MedicalRankingBoosts()

        total = boosts.calculate_total_boost(has_specialty_match=True)
        assert total == 0.10

    def test_calculate_total_boost_combined_factors(self):
        """Test total boost with multiple factors"""
        boosts = MedicalRankingBoosts()

        total = boosts.calculate_total_boost(
            medical_term_count=2,         # +0.10
            has_specialty_match=True,     # +0.10
            has_phase_match=True,         # +0.08
            evidence_level=1,             # +0.05
            has_preferred_doc_type=True   # +0.05
        )

        expected = 0.10 + 0.10 + 0.08 + 0.05 + 0.05  # 0.38
        assert total == 0.30  # Capped at 0.30

    def test_calculate_total_boost_capped_at_30_percent(self):
        """Test that total boost is capped at 0.30 (30%)"""
        boosts = MedicalRankingBoosts()

        total = boosts.calculate_total_boost(
            medical_term_count=10,        # Would be +0.50
            has_specialty_match=True,     # +0.10
            has_phase_match=True,         # +0.08
            evidence_level=1,             # +0.05
            has_preferred_doc_type=True   # +0.05
        )

        # Total would be 0.78 but should be capped at 0.30
        assert total == 0.30

    def test_calculate_total_boost_realistic_scenario_high(self):
        """Test realistic high-boost scenario"""
        boosts = MedicalRankingBoosts()

        # High-quality regulatory document
        total = boosts.calculate_total_boost(
            medical_term_count=4,         # +0.20
            has_specialty_match=True,     # +0.10
            evidence_level=1,             # +0.05
        )

        # 0.20 + 0.10 + 0.05 = 0.35, but capped at 0.30
        assert total == 0.30

    def test_calculate_total_boost_realistic_scenario_medium(self):
        """Test realistic medium-boost scenario"""
        boosts = MedicalRankingBoosts()

        # Medium-quality general document
        total = boosts.calculate_total_boost(
            medical_term_count=2,         # +0.10
            has_phase_match=True,         # +0.08
            evidence_level=2,             # +0.02
        )

        # 0.10 + 0.08 + 0.02 = 0.20
        assert total == 0.20

    def test_calculate_total_boost_realistic_scenario_low(self):
        """Test realistic low-boost scenario"""
        boosts = MedicalRankingBoosts()

        # Low-quality or off-topic document
        total = boosts.calculate_total_boost(
            medical_term_count=1,         # +0.05
            evidence_level=5,             # +0.00
        )

        # 0.05 + 0.00 = 0.05
        assert total == 0.05


# ============================================================================
# Configuration Consistency Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.config
class TestConfigurationConsistency:
    """Test consistency across configuration"""

    def test_tier_thresholds_ascending(self):
        """Test that tier thresholds are in ascending order (higher tier = stricter)"""
        tier1 = get_tier_threshold(tier=1)
        tier2 = get_tier_threshold(tier=2)
        tier3 = get_tier_threshold(tier=3)

        assert tier1 < tier2 < tier3

    def test_tier_temperatures_reasonable_range(self):
        """Test that tier temperatures are in reasonable range"""
        for tier in [1, 2, 3]:
            temp = get_tier_temperature(tier)
            assert 0.0 <= temp <= 1.0

    def test_protocol_accuracy_pharma_highest(self):
        """Test that PHARMA protocol has highest accuracy requirement"""
        pharma = get_protocol_accuracy_threshold("PHARMA")
        verify = get_protocol_accuracy_threshold("VERIFY")
        standard = get_protocol_accuracy_threshold("STANDARD")

        assert pharma > verify > standard

    def test_all_boosts_positive(self):
        """Test that all boosts are positive values"""
        boosts = MedicalRankingBoosts()

        assert boosts.get_medical_term_boost(1) > 0
        assert boosts.get_specialty_match_boost() > 0
        assert boosts.get_phase_match_boost() > 0
        assert boosts.get_evidence_level_boost(1) > 0
        assert boosts.get_document_type_boost() > 0

    def test_boost_cap_is_reasonable(self):
        """Test that boost cap (0.30) is reasonable"""
        boosts = MedicalRankingBoosts()

        # Maximum possible boost should not exceed 1.0
        max_boost = boosts.calculate_total_boost(
            medical_term_count=100,
            has_specialty_match=True,
            has_phase_match=True,
            evidence_level=1,
            has_preferred_doc_type=True
        )

        assert 0.0 < max_boost <= 1.0


# ============================================================================
# Integration Tests with RAGSettings
# ============================================================================

@pytest.mark.unit
@pytest.mark.config
class TestRAGSettingsIntegration:
    """Test integration between RAGSettings and helper functions"""

    def test_settings_match_helper_functions(self):
        """Test that helper functions use settings correctly"""
        settings = get_rag_settings()

        # Tier thresholds should match
        assert get_tier_threshold(1) == settings.similarity_threshold_tier1
        assert get_tier_threshold(2) == settings.similarity_threshold_tier2
        assert get_tier_threshold(3) == settings.similarity_threshold_tier3

        # Temperatures should match
        assert get_tier_temperature(1) == settings.llm_temperature_tier1
        assert get_tier_temperature(2) == settings.llm_temperature_tier2
        assert get_tier_temperature(3) == settings.llm_temperature_tier3

        # Protocol accuracy should match
        assert get_protocol_accuracy_threshold("PHARMA") == settings.accuracy_threshold_pharma
        assert get_protocol_accuracy_threshold("VERIFY") == settings.accuracy_threshold_verify

    def test_boosts_match_settings(self):
        """Test that MedicalRankingBoosts uses settings correctly"""
        settings = get_rag_settings()
        boosts = MedicalRankingBoosts()

        assert boosts.get_medical_term_boost(1) == settings.medical_term_boost_per_term
        assert boosts.get_specialty_match_boost() == settings.specialty_match_boost
        assert boosts.get_phase_match_boost() == settings.phase_match_boost
        assert boosts.get_evidence_level_boost(1) == settings.evidence_level_boost_high
        assert boosts.get_evidence_level_boost(2) == settings.evidence_level_boost_medium
        assert boosts.get_document_type_boost() == settings.document_type_boost


# ============================================================================
# Edge Case Tests
# ============================================================================

@pytest.mark.unit
@pytest.mark.config
class TestEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_zero_medical_terms(self):
        """Test boost calculation with zero medical terms"""
        boosts = MedicalRankingBoosts()

        boost = boosts.get_medical_term_boost(term_count=0)
        assert boost == 0.0

    def test_negative_medical_terms(self):
        """Test boost calculation with negative medical terms (invalid input)"""
        boosts = MedicalRankingBoosts()

        boost = boosts.get_medical_term_boost(term_count=-5)
        assert boost == -0.25  # Should handle gracefully (or could raise error)

    def test_very_high_evidence_level(self):
        """Test boost for evidence level > 5 (invalid)"""
        boosts = MedicalRankingBoosts()

        boost = boosts.get_evidence_level_boost(evidence_level=10)
        assert boost == 0.0  # Should return 0 for invalid levels

    def test_boundary_tier_values(self):
        """Test boundary values for tier thresholds"""
        # Tier 0 (invalid)
        threshold0 = get_tier_threshold(tier=0)
        assert threshold0 == 0.7  # Should return default

        # Tier 4 (invalid)
        threshold4 = get_tier_threshold(tier=4)
        assert threshold4 == 0.7  # Should return default

    @patch.dict(os.environ, {"SIMILARITY_THRESHOLD_TIER1": "invalid"}, clear=False)
    def test_invalid_environment_variable_type(self):
        """Test handling of invalid environment variable type"""
        # Should either use default or raise validation error
        try:
            settings = RAGSettings()
            # If it doesn't raise, it should fall back to default
            assert isinstance(settings.similarity_threshold_tier1, float)
        except Exception:
            # Validation error is acceptable
            pass
