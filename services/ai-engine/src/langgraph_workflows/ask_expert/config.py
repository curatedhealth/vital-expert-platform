"""
VITAL Path AI Services - Ask Expert Configuration

Centralized configuration for Ask Expert Mode 1-4 workflows.
Removes all hardcoded values and provides environment-based settings.

Usage:
    from langgraph_workflows.ask_expert.config import get_ask_expert_config, AskExpertConfig

    config = get_ask_expert_config()
    print(config.mode1.target_latency_seconds)
"""

import os
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Dict, List, Optional
from enum import Enum


class AskExpertMode(str, Enum):
    """Ask Expert modes."""
    MODE_1_MANUAL_INTERACTIVE = "mode1"
    MODE_2_AUTO_INTERACTIVE = "mode2"
    MODE_3_MANUAL_AUTONOMOUS = "mode3"
    MODE_4_AUTO_AUTONOMOUS = "mode4"


# =============================================================================
# MODEL CONFIGURATION
# =============================================================================

@dataclass
class LLMModelConfig:
    """LLM model configuration."""
    default_model: str
    default_temperature: float
    default_max_tokens: int
    timeout_seconds: int

    # Provider detection patterns
    openai_prefixes: tuple = ("gpt", "o1", "text-davinci", "text-embedding")
    anthropic_prefixes: tuple = ("claude",)


@dataclass
class TierModelConfig:
    """Model configuration by agent tier."""
    tier1_model: str
    tier1_temperature: float
    tier1_max_tokens: int

    tier2_model: str
    tier2_temperature: float
    tier2_max_tokens: int

    tier3_model: str
    tier3_temperature: float
    tier3_max_tokens: int

    def get_config_for_tier(self, tier: int) -> Dict:
        """Get model config for specific tier."""
        tier_map = {
            1: {
                "model": self.tier1_model,
                "temperature": self.tier1_temperature,
                "max_tokens": self.tier1_max_tokens,
            },
            2: {
                "model": self.tier2_model,
                "temperature": self.tier2_temperature,
                "max_tokens": self.tier2_max_tokens,
            },
            3: {
                "model": self.tier3_model,
                "temperature": self.tier3_temperature,
                "max_tokens": self.tier3_max_tokens,
            },
        }
        return tier_map.get(tier, tier_map[1])


# =============================================================================
# MODE SPECIFIC CONFIGURATIONS
# =============================================================================

@dataclass
class Mode1Config:
    """Mode 1: Manual Interactive configuration."""
    # Performance targets
    target_latency_seconds: float = 5.0
    max_latency_seconds: float = 30.0

    # RAG settings
    rag_top_k: int = 10
    min_rag_docs_threshold: int = 3
    enable_web_search_fallback: bool = True
    web_search_max_results: int = 5

    # L3 orchestration
    enable_l3_orchestration: bool = True
    enable_specialists: bool = True
    max_parallel_tools: int = 5
    l3_timeout_seconds: float = 30.0

    # Streaming
    enable_streaming: bool = True
    stream_chunk_size: int = 1

    # Session
    session_mode: str = "interactive"


@dataclass
class Mode2Config:
    """Mode 2: Automatic Interactive configuration."""
    # Performance targets
    target_latency_seconds: float = 10.0
    max_latency_seconds: float = 60.0

    # Agent selection
    fusion_search_top_k: int = 5
    fusion_weights: Dict[str, float] = field(default_factory=lambda: {
        "vector_similarity": 0.50,
        "domain_matching": 0.25,
        "capability_matching": 0.15,
        "graph_relationships": 0.10,
    })

    # RAG settings
    rag_top_k: int = 10
    min_rag_docs_threshold: int = 3

    # Streaming
    enable_streaming: bool = True

    # Session
    session_mode: str = "interactive"


@dataclass
class Mode3Config:
    """Mode 3: Manual Autonomous configuration."""
    # Performance targets
    min_duration_seconds: float = 30.0
    max_duration_seconds: float = 300.0  # 5 minutes

    # Iteration limits
    default_max_iterations: int = 10
    confidence_threshold: float = 0.95

    # RAG settings
    rag_top_k: int = 15

    # HITL settings
    hitl_enabled: bool = True
    hitl_safety_level: str = "balanced"
    auto_approve_low_risk: bool = False

    # ReAct settings
    reasoning_temperature: float = 0.3

    # Session
    session_mode: str = "autonomous"


@dataclass
class Mode4Config:
    """Mode 4: Automatic Autonomous configuration."""
    # Performance targets
    min_duration_seconds: float = 60.0
    max_duration_seconds: float = 1800.0  # 30 minutes

    # Iteration limits
    default_max_iterations: int = 10
    confidence_threshold: float = 0.95

    # RAG settings
    rag_top_k: int = 15

    # Budget and safety
    enable_budget_check: bool = True
    default_budget_remaining: float = 100.0
    enable_circuit_breaker: bool = True
    circuit_breaker_error_threshold: int = 3

    # Self-correction
    enable_self_correction: bool = True
    max_corrections: int = 3

    # Background processing
    enable_background: bool = True

    # Session
    session_mode: str = "background"


# =============================================================================
# SHARED CONFIGURATIONS
# =============================================================================

@dataclass
class ValidationConfig:
    """Input validation configuration."""
    min_query_length: int = 2
    max_query_length: int = 50000


@dataclass
class CitationConfig:
    """Citation configuration."""
    default_citation_style: str = "apa"
    max_citations: int = 10
    include_inline_citations: bool = True
    include_reference_section: bool = True


@dataclass
class ErrorConfig:
    """Error handling configuration."""
    max_retries: int = 3
    recoverable_error_types: tuple = ("timeout", "rag", "connection")
    error_message_template: str = (
        "I apologize, but Ask Expert ({mode}) encountered an error. "
        "Please try again or contact support if the issue persists."
    )


@dataclass
class CostConfig:
    """Cost tracking configuration."""
    # Per 1K tokens (approximate)
    openai_input_cost_per_1k: float = 0.003
    openai_output_cost_per_1k: float = 0.015
    anthropic_input_cost_per_1k: float = 0.003
    anthropic_output_cost_per_1k: float = 0.015

    def calculate_cost(
        self,
        provider: str,
        input_tokens: int,
        output_tokens: int,
    ) -> float:
        """Calculate cost based on provider and token counts."""
        if provider == "anthropic":
            input_cost = self.anthropic_input_cost_per_1k
            output_cost = self.anthropic_output_cost_per_1k
        else:
            input_cost = self.openai_input_cost_per_1k
            output_cost = self.openai_output_cost_per_1k

        return (input_tokens * input_cost + output_tokens * output_cost) / 1000


# =============================================================================
# MAIN CONFIGURATION CLASS
# =============================================================================

@dataclass
class AskExpertConfig:
    """
    Main Ask Expert configuration.

    Consolidates all configuration for Mode 1-4 workflows.
    All values can be overridden via environment variables.
    """
    # LLM configuration
    llm: LLMModelConfig = field(default_factory=lambda: LLMModelConfig(
        default_model=os.getenv("ASK_EXPERT_DEFAULT_MODEL", "gpt-4"),
        default_temperature=float(os.getenv("ASK_EXPERT_DEFAULT_TEMPERATURE", "0.7")),
        default_max_tokens=int(os.getenv("ASK_EXPERT_DEFAULT_MAX_TOKENS", "4000")),
        timeout_seconds=int(os.getenv("ASK_EXPERT_LLM_TIMEOUT", "120")),
    ))

    # Tier-based model configuration
    tier_models: TierModelConfig = field(default_factory=lambda: TierModelConfig(
        tier1_model=os.getenv("ASK_EXPERT_TIER1_MODEL", "gpt-3.5-turbo"),
        tier1_temperature=float(os.getenv("ASK_EXPERT_TIER1_TEMPERATURE", "0.6")),
        tier1_max_tokens=int(os.getenv("ASK_EXPERT_TIER1_MAX_TOKENS", "2000")),
        tier2_model=os.getenv("ASK_EXPERT_TIER2_MODEL", "gpt-4"),
        tier2_temperature=float(os.getenv("ASK_EXPERT_TIER2_TEMPERATURE", "0.4")),
        tier2_max_tokens=int(os.getenv("ASK_EXPERT_TIER2_MAX_TOKENS", "3000")),
        tier3_model=os.getenv("ASK_EXPERT_TIER3_MODEL", "gpt-4"),
        tier3_temperature=float(os.getenv("ASK_EXPERT_TIER3_TEMPERATURE", "0.2")),
        tier3_max_tokens=int(os.getenv("ASK_EXPERT_TIER3_MAX_TOKENS", "4000")),
    ))

    # Mode-specific configurations
    mode1: Mode1Config = field(default_factory=Mode1Config)
    mode2: Mode2Config = field(default_factory=Mode2Config)
    mode3: Mode3Config = field(default_factory=Mode3Config)
    mode4: Mode4Config = field(default_factory=Mode4Config)

    # Shared configurations
    validation: ValidationConfig = field(default_factory=ValidationConfig)
    citation: CitationConfig = field(default_factory=CitationConfig)
    error: ErrorConfig = field(default_factory=ErrorConfig)
    cost: CostConfig = field(default_factory=CostConfig)

    def get_mode_config(self, mode: int):
        """Get configuration for specific mode."""
        mode_map = {
            1: self.mode1,
            2: self.mode2,
            3: self.mode3,
            4: self.mode4,
        }
        return mode_map.get(mode, self.mode1)

    def get_provider_for_model(self, model_name: str) -> str:
        """Detect provider from model name."""
        model_lower = model_name.lower()

        if any(model_lower.startswith(p) for p in self.llm.anthropic_prefixes):
            return "anthropic"

        if any(model_lower.startswith(p) for p in self.llm.openai_prefixes):
            return "openai"

        # Default to OpenAI for unknown models
        return "openai"

    def get_required_api_key_name(self, provider: str) -> str:
        """Get the environment variable name for the required API key."""
        provider_keys = {
            "openai": "OPENAI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
        }
        return provider_keys.get(provider, "OPENAI_API_KEY")


@lru_cache()
def get_ask_expert_config() -> AskExpertConfig:
    """
    Get Ask Expert configuration (cached singleton).

    Returns:
        AskExpertConfig instance with values from environment
    """
    return AskExpertConfig()


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def get_mode_config(mode: int):
    """Get configuration for specific mode."""
    return get_ask_expert_config().get_mode_config(mode)


def get_llm_defaults() -> Dict:
    """Get default LLM configuration."""
    config = get_ask_expert_config()
    return {
        "model": config.llm.default_model,
        "temperature": config.llm.default_temperature,
        "max_tokens": config.llm.default_max_tokens,
    }


def get_provider_for_model(model_name: str) -> str:
    """Detect provider from model name."""
    return get_ask_expert_config().get_provider_for_model(model_name)


def calculate_cost(provider: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate cost for LLM call."""
    return get_ask_expert_config().cost.calculate_cost(provider, input_tokens, output_tokens)


__all__ = [
    # Main config
    "AskExpertConfig",
    "get_ask_expert_config",
    # Mode configs
    "Mode1Config",
    "Mode2Config",
    "Mode3Config",
    "Mode4Config",
    "AskExpertMode",
    # Sub configs
    "LLMModelConfig",
    "TierModelConfig",
    "ValidationConfig",
    "CitationConfig",
    "ErrorConfig",
    "CostConfig",
    # Convenience functions
    "get_mode_config",
    "get_llm_defaults",
    "get_provider_for_model",
    "calculate_cost",
]
