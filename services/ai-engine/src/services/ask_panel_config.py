"""
VITAL Path AI Services - Ask Panel Configuration

Centralized configuration for Ask Panel workflows.
Removes all hardcoded values and provides environment-based settings.

Usage:
    from services.ask_panel_config import get_ask_panel_config, AskPanelConfig

    config = get_ask_panel_config()
    print(config.orchestrator.max_experts)
"""

import os
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Dict, List, Tuple
from enum import Enum


class PanelExecutionMode(str, Enum):
    """Panel execution modes."""
    PARALLEL = "parallel"
    CONSENSUS = "consensus"
    DEBATE = "debate"
    SEQUENTIAL = "sequential"


class PanelArchetype(str, Enum):
    """Panel archetypes for board sessions."""
    STRUCTURED = "structured"
    OPEN = "open"
    SOCRATIC = "socratic"
    ADVERSARIAL = "adversarial"
    DELPHI = "delphi"
    HYBRID = "hybrid"


# =============================================================================
# LLM CONFIGURATION
# =============================================================================

@dataclass
class PanelLLMConfig:
    """LLM configuration for panel discussions."""
    default_model: str
    default_temperature: float
    consensus_temperature: float
    default_max_tokens: int
    timeout_seconds: int

    # Provider detection patterns
    openai_prefixes: tuple = ("gpt", "o1", "text-davinci", "text-embedding")
    anthropic_prefixes: tuple = ("claude",)


# =============================================================================
# ORCHESTRATOR CONFIGURATION
# =============================================================================

@dataclass
class PanelOrchestratorConfig:
    """Configuration for PanelOrchestrator."""
    # Expert limits
    min_experts: int = 2
    max_experts: int = 12

    # Discussion limits
    max_rounds: int = 5

    # Consensus settings
    min_consensus: float = 0.70

    # Timeout settings
    default_timeout_ms: int = 300000

    # Streaming
    enable_streaming: bool = True

    # Context limits
    max_rag_domains: int = 3
    max_rag_results: int = 10
    max_previous_responses: int = 5
    response_truncate_length: int = 200
    rag_content_truncate_length: int = 200
    name_truncate_length: int = 255

    # Default weight for panel members
    default_member_weight: float = 1.0

    # Default confidence for missing confidence
    default_response_confidence: float = 0.5


@dataclass
class PanelTypeMapping:
    """Mapping from panel type to board session config."""
    archetype: str
    mode: str


# =============================================================================
# PANEL SERVICE CONFIGURATION
# =============================================================================

@dataclass
class PanelServiceConfig:
    """Configuration for PanelService (langgraph_compilation)."""
    # Consensus settings
    max_consensus_rounds: int = 3

    # LLM settings for agent execution
    default_temperature: float = 0.7
    consensus_evaluation_temperature: float = 0.3

    # Default confidence when not available
    default_confidence: float = 0.85
    fallback_confidence: float = 0.5

    # Context truncation
    context_truncate_length: int = 200

    # Default model fallback
    default_model: str = "gpt-4"


# =============================================================================
# SIMPLE WORKFLOW CONFIGURATION
# =============================================================================

@dataclass
class SimplePanelWorkflowConfig:
    """Configuration for SimplePanelWorkflow."""
    # Expert limits
    max_experts: int = 5

    # Minimum success rate for valid panel
    min_success_rate: float = 0.5

    # Mock execution settings (for MVP fallback only)
    # Primary templates are loaded from Supabase panel_response_templates table
    mock_api_delay_seconds: float = 0.5
    mock_enabled: bool = True

    # Usage tracking defaults
    default_tokens_multiplier: int = 2  # words * multiplier = tokens estimate
    default_execution_time_ms: int = 2000
    default_model: str = "gpt-4-turbo"

    # Default confidence (fallback when template service unavailable)
    fallback_confidence: float = 0.70


# =============================================================================
# COST CONFIGURATION
# =============================================================================

@dataclass
class PanelCostConfig:
    """Cost tracking configuration for panels."""
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
# VALIDATION CONFIGURATION
# =============================================================================

@dataclass
class PanelValidationConfig:
    """Input validation configuration for panels."""
    min_query_length: int = 2
    max_query_length: int = 50000
    valid_panel_types: tuple = (
        "structured",
        "open",
        "socratic",
        "adversarial",
        "delphi",
        "hybrid",
    )


# =============================================================================
# ERROR CONFIGURATION
# =============================================================================

@dataclass
class PanelErrorConfig:
    """Error handling configuration for panels."""
    max_retries: int = 3
    recoverable_error_types: tuple = ("timeout", "connection", "rate_limit")
    error_message_template: str = (
        "I apologize, but Ask Panel encountered an error. "
        "Please try again or contact support if the issue persists."
    )


# =============================================================================
# MAIN CONFIGURATION CLASS
# =============================================================================

@dataclass
class AskPanelConfig:
    """
    Main Ask Panel configuration.

    Consolidates all configuration for Ask Panel workflows.
    All values can be overridden via environment variables.
    """
    # LLM configuration
    llm: PanelLLMConfig = field(default_factory=lambda: PanelLLMConfig(
        default_model=os.getenv("ASK_PANEL_DEFAULT_MODEL", "gpt-4"),
        default_temperature=float(os.getenv("ASK_PANEL_DEFAULT_TEMPERATURE", "0.7")),
        consensus_temperature=float(os.getenv("ASK_PANEL_CONSENSUS_TEMPERATURE", "0.3")),
        default_max_tokens=int(os.getenv("ASK_PANEL_DEFAULT_MAX_TOKENS", "4000")),
        timeout_seconds=int(os.getenv("ASK_PANEL_LLM_TIMEOUT", "120")),
    ))

    # Component configurations
    orchestrator: PanelOrchestratorConfig = field(default_factory=lambda: PanelOrchestratorConfig(
        min_experts=int(os.getenv("ASK_PANEL_MIN_EXPERTS", "2")),
        max_experts=int(os.getenv("ASK_PANEL_MAX_EXPERTS", "12")),
        max_rounds=int(os.getenv("ASK_PANEL_MAX_ROUNDS", "5")),
        min_consensus=float(os.getenv("ASK_PANEL_MIN_CONSENSUS", "0.70")),
        default_timeout_ms=int(os.getenv("ASK_PANEL_DEFAULT_TIMEOUT_MS", "300000")),
    ))

    panel_service: PanelServiceConfig = field(default_factory=lambda: PanelServiceConfig(
        max_consensus_rounds=int(os.getenv("ASK_PANEL_MAX_CONSENSUS_ROUNDS", "3")),
        default_temperature=float(os.getenv("ASK_PANEL_SERVICE_TEMPERATURE", "0.7")),
        consensus_evaluation_temperature=float(os.getenv("ASK_PANEL_CONSENSUS_EVAL_TEMPERATURE", "0.3")),
        default_confidence=float(os.getenv("ASK_PANEL_DEFAULT_CONFIDENCE", "0.85")),
        fallback_confidence=float(os.getenv("ASK_PANEL_FALLBACK_CONFIDENCE", "0.5")),
        default_model=os.getenv("ASK_PANEL_SERVICE_MODEL", "gpt-4"),
    ))

    simple_workflow: SimplePanelWorkflowConfig = field(default_factory=lambda: SimplePanelWorkflowConfig(
        max_experts=int(os.getenv("ASK_PANEL_SIMPLE_MAX_EXPERTS", "5")),
        min_success_rate=float(os.getenv("ASK_PANEL_MIN_SUCCESS_RATE", "0.5")),
        mock_api_delay_seconds=float(os.getenv("ASK_PANEL_MOCK_DELAY", "0.5")),
        mock_enabled=os.getenv("ASK_PANEL_MOCK_ENABLED", "true").lower() == "true",
    ))

    # Shared configurations
    validation: PanelValidationConfig = field(default_factory=PanelValidationConfig)
    error: PanelErrorConfig = field(default_factory=PanelErrorConfig)
    cost: PanelCostConfig = field(default_factory=PanelCostConfig)

    # Panel type to board config mapping
    _panel_type_mapping: Dict[str, PanelTypeMapping] = field(default_factory=lambda: {
        "structured": PanelTypeMapping(archetype="SAB", mode="sequential"),
        "open": PanelTypeMapping(archetype="Strategic", mode="parallel"),
        "socratic": PanelTypeMapping(archetype="Ethics", mode="debate"),
        "adversarial": PanelTypeMapping(archetype="CAB", mode="debate"),
        "delphi": PanelTypeMapping(archetype="CAB", mode="sequential"),
        "hybrid": PanelTypeMapping(archetype="Market", mode="dynamic"),
    })

    def get_panel_type_mapping(self, panel_type: str) -> Tuple[str, str]:
        """
        Get board session archetype and mode for panel type.

        Args:
            panel_type: Panel type string

        Returns:
            Tuple of (archetype, mode)
        """
        mapping = self._panel_type_mapping.get(panel_type)
        if mapping:
            return mapping.archetype, mapping.mode
        # Default fallback
        return "Strategic", "parallel"

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
def get_ask_panel_config() -> AskPanelConfig:
    """
    Get Ask Panel configuration (cached singleton).

    Returns:
        AskPanelConfig instance with values from environment
    """
    return AskPanelConfig()


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def get_orchestrator_config() -> PanelOrchestratorConfig:
    """Get orchestrator configuration."""
    return get_ask_panel_config().orchestrator


def get_panel_service_config() -> PanelServiceConfig:
    """Get panel service configuration."""
    return get_ask_panel_config().panel_service


def get_simple_workflow_config() -> SimplePanelWorkflowConfig:
    """Get simple workflow configuration."""
    return get_ask_panel_config().simple_workflow


def get_panel_llm_defaults() -> Dict:
    """Get default LLM configuration."""
    config = get_ask_panel_config()
    return {
        "model": config.llm.default_model,
        "temperature": config.llm.default_temperature,
        "max_tokens": config.llm.default_max_tokens,
    }


def get_provider_for_model(model_name: str) -> str:
    """Detect provider from model name."""
    return get_ask_panel_config().get_provider_for_model(model_name)


def get_panel_type_mapping(panel_type: str) -> Tuple[str, str]:
    """Get board config mapping for panel type."""
    return get_ask_panel_config().get_panel_type_mapping(panel_type)


def calculate_panel_cost(provider: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate cost for panel LLM call."""
    return get_ask_panel_config().cost.calculate_cost(provider, input_tokens, output_tokens)


__all__ = [
    # Enums
    "PanelExecutionMode",
    "PanelArchetype",
    # Main config
    "AskPanelConfig",
    "get_ask_panel_config",
    # Component configs
    "PanelLLMConfig",
    "PanelOrchestratorConfig",
    "PanelServiceConfig",
    "SimplePanelWorkflowConfig",
    "PanelTypeMapping",
    "PanelCostConfig",
    "PanelValidationConfig",
    "PanelErrorConfig",
    # Convenience functions
    "get_orchestrator_config",
    "get_panel_service_config",
    "get_simple_workflow_config",
    "get_panel_llm_defaults",
    "get_provider_for_model",
    "get_panel_type_mapping",
    "calculate_panel_cost",
]
