"""
RAG Configuration with Environment Variable Support
Replaces hardcoded similarity thresholds and boost values
"""

import os
from typing import Dict
from pydantic import BaseSettings, Field
from functools import lru_cache


class RAGSettings(BaseSettings):
    """RAG-specific configuration with environment variable support"""

    # === Similarity Thresholds ===
    similarity_threshold_default: float = Field(
        default=0.7,
        env="SIMILARITY_THRESHOLD_DEFAULT",
        description="Default similarity threshold for RAG search"
    )

    similarity_threshold_tier1: float = Field(
        default=0.60,
        env="SIMILARITY_THRESHOLD_TIER1",
        description="Similarity threshold for Tier 1 agents (less strict)"
    )

    similarity_threshold_tier2: float = Field(
        default=0.75,
        env="SIMILARITY_THRESHOLD_TIER2",
        description="Similarity threshold for Tier 2 agents"
    )

    similarity_threshold_tier3: float = Field(
        default=0.85,
        env="SIMILARITY_THRESHOLD_TIER3",
        description="Similarity threshold for Tier 3 agents (strict)"
    )

    # === Medical Re-ranking Boost Values ===
    medical_term_boost_per_term: float = Field(
        default=0.05,
        env="MEDICAL_TERM_BOOST",
        description="Boost per medical term found (+5% per term)"
    )

    specialty_match_boost: float = Field(
        default=0.10,
        env="SPECIALTY_MATCH_BOOST",
        description="Boost for specialty match (+10%)"
    )

    phase_match_boost: float = Field(
        default=0.08,
        env="PHASE_MATCH_BOOST",
        description="Boost for phase match (+8%)"
    )

    evidence_level_boost_high: float = Field(
        default=0.05,
        env="EVIDENCE_LEVEL_BOOST_HIGH",
        description="Boost for high evidence level (RCT, systematic review) (+5%)"
    )

    evidence_level_boost_medium: float = Field(
        default=0.02,
        env="EVIDENCE_LEVEL_BOOST_MEDIUM",
        description="Boost for medium evidence level (cohort, case-control) (+2%)"
    )

    document_type_boost: float = Field(
        default=0.05,
        env="DOCUMENT_TYPE_BOOST",
        description="Boost for preferred document type (+5%)"
    )

    # === Search Parameters ===
    max_search_results: int = Field(
        default=10,
        env="RAG_MAX_SEARCH_RESULTS",
        description="Maximum number of search results to return"
    )

    rerank_multiplier: int = Field(
        default=2,
        env="RAG_RERANK_MULTIPLIER",
        description="Fetch this many times max_results for re-ranking"
    )

    similarity_threshold_multiplier: float = Field(
        default=0.8,
        env="RAG_SIMILARITY_THRESHOLD_MULTIPLIER",
        description="Multiply threshold by this for initial broad search"
    )

    # === Medical Accuracy Thresholds (by Protocol) ===
    accuracy_threshold_pharma: float = Field(
        default=0.98,
        env="MEDICAL_ACCURACY_PHARMA",
        description="Accuracy threshold for PHARMA protocol (98%)"
    )

    accuracy_threshold_verify: float = Field(
        default=0.97,
        env="MEDICAL_ACCURACY_VERIFY",
        description="Accuracy threshold for VERIFY protocol (97%)"
    )

    accuracy_threshold_standard: float = Field(
        default=0.95,
        env="MEDICAL_ACCURACY_STANDARD",
        description="Standard medical accuracy threshold (95%)"
    )

    # === LLM Temperature Settings ===
    llm_temperature_tier1: float = Field(
        default=0.1,
        env="LLM_TEMPERATURE_TIER1",
        description="LLM temperature for Tier 1 agents (conservative)"
    )

    llm_temperature_tier2: float = Field(
        default=0.15,
        env="LLM_TEMPERATURE_TIER2",
        description="LLM temperature for Tier 2 agents"
    )

    llm_temperature_tier3: float = Field(
        default=0.05,
        env="LLM_TEMPERATURE_TIER3",
        description="LLM temperature for Tier 3 agents (very conservative)"
    )

    llm_max_tokens_default: int = Field(
        default=4000,
        env="LLM_MAX_TOKENS_DEFAULT",
        description="Default maximum tokens for LLM responses"
    )

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_rag_settings() -> RAGSettings:
    """Get cached RAG settings"""
    return RAGSettings()


def get_tier_threshold(tier: int) -> float:
    """Get similarity threshold for given agent tier"""
    settings = get_rag_settings()

    tier_thresholds = {
        1: settings.similarity_threshold_tier1,
        2: settings.similarity_threshold_tier2,
        3: settings.similarity_threshold_tier3
    }

    return tier_thresholds.get(tier, settings.similarity_threshold_default)


def get_tier_temperature(tier: int) -> float:
    """Get LLM temperature for given agent tier"""
    settings = get_rag_settings()

    tier_temperatures = {
        1: settings.llm_temperature_tier1,
        2: settings.llm_temperature_tier2,
        3: settings.llm_temperature_tier3
    }

    return tier_temperatures.get(tier, 0.1)


def get_protocol_accuracy_threshold(protocol: str) -> float:
    """Get accuracy threshold for given medical protocol"""
    settings = get_rag_settings()

    protocol_thresholds = {
        "PHARMA": settings.accuracy_threshold_pharma,
        "VERIFY": settings.accuracy_threshold_verify,
        "STANDARD": settings.accuracy_threshold_standard
    }

    return protocol_thresholds.get(protocol.upper(), settings.accuracy_threshold_standard)


class MedicalRankingBoosts:
    """Medical re-ranking boost values"""

    def __init__(self):
        self.settings = get_rag_settings()

    def get_medical_term_boost(self, term_count: int) -> float:
        """Calculate boost for medical terms found"""
        return term_count * self.settings.medical_term_boost_per_term

    def get_specialty_match_boost(self) -> float:
        """Get boost for specialty match"""
        return self.settings.specialty_match_boost

    def get_phase_match_boost(self) -> float:
        """Get boost for phase match"""
        return self.settings.phase_match_boost

    def get_evidence_level_boost(self, evidence_level: int) -> float:
        """
        Get boost based on evidence level (1=highest, 5=lowest)

        Evidence Pyramid:
        1: Systematic reviews, meta-analyses, RCTs
        2: Cohort studies
        3: Case-control studies
        4: Case series, case reports
        5: Expert opinion, anecdotal
        """
        if evidence_level <= 1:
            return self.settings.evidence_level_boost_high
        elif evidence_level <= 3:
            return self.settings.evidence_level_boost_medium
        else:
            return 0.0

    def get_document_type_boost(self) -> float:
        """Get boost for preferred document type"""
        return self.settings.document_type_boost

    def calculate_total_boost(
        self,
        medical_term_count: int = 0,
        has_specialty_match: bool = False,
        has_phase_match: bool = False,
        evidence_level: int = 5,
        has_preferred_doc_type: bool = False
    ) -> float:
        """Calculate total re-ranking boost"""
        total_boost = 0.0

        # Add medical term boost
        total_boost += self.get_medical_term_boost(medical_term_count)

        # Add specialty match boost
        if has_specialty_match:
            total_boost += self.get_specialty_match_boost()

        # Add phase match boost
        if has_phase_match:
            total_boost += self.get_phase_match_boost()

        # Add evidence level boost
        total_boost += self.get_evidence_level_boost(evidence_level)

        # Add document type boost
        if has_preferred_doc_type:
            total_boost += self.get_document_type_boost()

        # Cap total boost at 0.30 (maximum 30% boost)
        return min(total_boost, 0.30)


# Export singleton instance
_medical_ranking_boosts = None


def get_medical_ranking_boosts() -> MedicalRankingBoosts:
    """Get singleton medical ranking boosts instance"""
    global _medical_ranking_boosts
    if _medical_ranking_boosts is None:
        _medical_ranking_boosts = MedicalRankingBoosts()
    return _medical_ranking_boosts
