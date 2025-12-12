"""
Production Model Factory with Fallback.

Unified LLM model factory that provides:
- Agent-specific model configuration from database
- Provider fallback chains (OpenAI → Anthropic → Azure)
- Tier-based model selection (Tier 1/2/3)
- Dynamic model routing based on task complexity
- Health checks and circuit breaker integration

This is the single entry point for all LLM instantiation in VITAL.

Usage:
    from core.model_factory import get_model, get_chat_model, ModelFactory

    # Get model for a specific agent
    model = await get_chat_model(agent_id="...")

    # Get model with fallback
    model = await get_chat_model(
        model_id="gpt-4o",
        fallback_chain=["claude-3.5-sonnet", "gpt-4o-mini"]
    )
"""

from typing import (
    Any, Callable, Dict, List, Optional, Tuple, Type, TypeVar, Union
)
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import os
import structlog

logger = structlog.get_logger()

T = TypeVar("T")


# ============================================================================
# Model Configuration
# ============================================================================

class ModelProvider(str, Enum):
    """Supported LLM providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    AZURE_OPENAI = "azure_openai"
    GOOGLE = "google"
    GROQ = "groq"
    TOGETHER = "together"
    OLLAMA = "ollama"


class ModelTier(str, Enum):
    """Model performance tiers matching VITAL agent architecture."""
    TIER_1 = "tier_1"  # Foundational: GPT-3.5, fast, cheap
    TIER_2 = "tier_2"  # Specialist: GPT-4o-mini, balanced
    TIER_3 = "tier_3"  # Ultra-Specialist: GPT-4o, Claude Opus, best quality


@dataclass
class ModelConfig:
    """Configuration for an LLM model."""
    model_id: str
    provider: ModelProvider
    tier: ModelTier

    # Provider-specific settings
    api_key_env: str = "OPENAI_API_KEY"
    base_url: Optional[str] = None

    # Generation defaults
    temperature: float = 0.7
    max_tokens: int = 4096
    context_window: int = 128000

    # Cost tracking
    input_cost_per_1k: float = 0.0
    output_cost_per_1k: float = 0.0

    # Capabilities
    supports_streaming: bool = True
    supports_function_calling: bool = True
    supports_vision: bool = False

    # Fallback
    fallback_model_id: Optional[str] = None


# Model registry with production configurations
MODEL_REGISTRY: Dict[str, ModelConfig] = {
    # OpenAI Models
    "gpt-4o": ModelConfig(
        model_id="gpt-4o",
        provider=ModelProvider.OPENAI,
        tier=ModelTier.TIER_3,
        temperature=0.7,
        max_tokens=4096,
        context_window=128000,
        input_cost_per_1k=0.005,
        output_cost_per_1k=0.015,
        supports_vision=True,
        fallback_model_id="claude-3.5-sonnet",
    ),
    "gpt-4o-mini": ModelConfig(
        model_id="gpt-4o-mini",
        provider=ModelProvider.OPENAI,
        tier=ModelTier.TIER_2,
        temperature=0.7,
        max_tokens=4096,
        context_window=128000,
        input_cost_per_1k=0.00015,
        output_cost_per_1k=0.0006,
        supports_vision=True,
        fallback_model_id="gpt-3.5-turbo",
    ),
    "gpt-3.5-turbo": ModelConfig(
        model_id="gpt-3.5-turbo",
        provider=ModelProvider.OPENAI,
        tier=ModelTier.TIER_1,
        temperature=0.7,
        max_tokens=4096,
        context_window=16385,
        input_cost_per_1k=0.0005,
        output_cost_per_1k=0.0015,
        supports_vision=False,
        fallback_model_id=None,
    ),
    "o1-preview": ModelConfig(
        model_id="o1-preview",
        provider=ModelProvider.OPENAI,
        tier=ModelTier.TIER_3,
        temperature=1.0,  # o1 doesn't support temp adjustment
        max_tokens=32768,
        context_window=128000,
        input_cost_per_1k=0.015,
        output_cost_per_1k=0.060,
        supports_streaming=False,  # o1 doesn't stream
        supports_function_calling=False,
        fallback_model_id="gpt-4o",
    ),

    # Anthropic Models
    "claude-3.5-sonnet": ModelConfig(
        model_id="claude-3-5-sonnet-20241022",
        provider=ModelProvider.ANTHROPIC,
        tier=ModelTier.TIER_3,
        api_key_env="ANTHROPIC_API_KEY",
        temperature=0.7,
        max_tokens=8192,
        context_window=200000,
        input_cost_per_1k=0.003,
        output_cost_per_1k=0.015,
        supports_vision=True,
        fallback_model_id="gpt-4o",
    ),
    "claude-3-opus": ModelConfig(
        model_id="claude-3-opus-20240229",
        provider=ModelProvider.ANTHROPIC,
        tier=ModelTier.TIER_3,
        api_key_env="ANTHROPIC_API_KEY",
        temperature=0.7,
        max_tokens=4096,
        context_window=200000,
        input_cost_per_1k=0.015,
        output_cost_per_1k=0.075,
        supports_vision=True,
        fallback_model_id="claude-3.5-sonnet",
    ),
    "claude-3-haiku": ModelConfig(
        model_id="claude-3-haiku-20240307",
        provider=ModelProvider.ANTHROPIC,
        tier=ModelTier.TIER_1,
        api_key_env="ANTHROPIC_API_KEY",
        temperature=0.7,
        max_tokens=4096,
        context_window=200000,
        input_cost_per_1k=0.00025,
        output_cost_per_1k=0.00125,
        supports_vision=True,
        fallback_model_id="gpt-3.5-turbo",
    ),

    # Google Models
    "gemini-1.5-pro": ModelConfig(
        model_id="gemini-1.5-pro",
        provider=ModelProvider.GOOGLE,
        tier=ModelTier.TIER_3,
        api_key_env="GOOGLE_API_KEY",
        temperature=0.7,
        max_tokens=8192,
        context_window=1000000,
        input_cost_per_1k=0.00125,
        output_cost_per_1k=0.005,
        supports_vision=True,
        fallback_model_id="gpt-4o",
    ),
    "gemini-1.5-flash": ModelConfig(
        model_id="gemini-1.5-flash",
        provider=ModelProvider.GOOGLE,
        tier=ModelTier.TIER_2,
        api_key_env="GOOGLE_API_KEY",
        temperature=0.7,
        max_tokens=8192,
        context_window=1000000,
        input_cost_per_1k=0.000075,
        output_cost_per_1k=0.0003,
        supports_vision=True,
        fallback_model_id="gpt-4o-mini",
    ),
}

# Fallback chains by provider
PROVIDER_FALLBACK_CHAINS: Dict[ModelProvider, List[str]] = {
    ModelProvider.OPENAI: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
    ModelProvider.ANTHROPIC: ["claude-3.5-sonnet", "claude-3-haiku"],
    ModelProvider.GOOGLE: ["gemini-1.5-pro", "gemini-1.5-flash"],
}

# Tier-based fallback chains
TIER_FALLBACK_CHAINS: Dict[ModelTier, List[str]] = {
    ModelTier.TIER_3: ["gpt-4o", "claude-3.5-sonnet", "gemini-1.5-pro", "gpt-4o-mini"],
    ModelTier.TIER_2: ["gpt-4o-mini", "gemini-1.5-flash", "claude-3-haiku", "gpt-3.5-turbo"],
    ModelTier.TIER_1: ["gpt-3.5-turbo", "claude-3-haiku", "gemini-1.5-flash"],
}


# ============================================================================
# Provider Health Status
# ============================================================================

@dataclass
class ProviderHealth:
    """Health status of an LLM provider."""
    provider: ModelProvider
    is_healthy: bool = True
    last_check: datetime = field(default_factory=datetime.utcnow)
    last_error: Optional[str] = None
    error_count: int = 0
    success_count: int = 0
    avg_latency_ms: float = 0.0

    def record_success(self, latency_ms: float):
        """Record successful call."""
        self.is_healthy = True
        self.success_count += 1
        self.error_count = 0
        self.last_check = datetime.utcnow()
        # Rolling average
        self.avg_latency_ms = (
            self.avg_latency_ms * 0.9 + latency_ms * 0.1
            if self.avg_latency_ms > 0 else latency_ms
        )

    def record_failure(self, error: str):
        """Record failed call."""
        self.error_count += 1
        self.last_error = error
        self.last_check = datetime.utcnow()
        # Mark unhealthy after 3 consecutive failures
        if self.error_count >= 3:
            self.is_healthy = False


class ProviderHealthRegistry:
    """Registry tracking health of all providers."""

    def __init__(self):
        self._health: Dict[ModelProvider, ProviderHealth] = {
            provider: ProviderHealth(provider=provider)
            for provider in ModelProvider
        }
        self._lock = asyncio.Lock()

    async def record_success(self, provider: ModelProvider, latency_ms: float):
        """Record successful provider call."""
        async with self._lock:
            self._health[provider].record_success(latency_ms)

    async def record_failure(self, provider: ModelProvider, error: str):
        """Record failed provider call."""
        async with self._lock:
            self._health[provider].record_failure(error)

    def is_healthy(self, provider: ModelProvider) -> bool:
        """Check if provider is healthy."""
        return self._health[provider].is_healthy

    def get_healthy_providers(self) -> List[ModelProvider]:
        """Get list of healthy providers."""
        return [p for p, h in self._health.items() if h.is_healthy]

    def get_status(self) -> Dict[str, Any]:
        """Get status of all providers."""
        return {
            p.value: {
                "healthy": h.is_healthy,
                "error_count": h.error_count,
                "success_count": h.success_count,
                "avg_latency_ms": round(h.avg_latency_ms, 2),
                "last_error": h.last_error,
            }
            for p, h in self._health.items()
        }


# Global health registry
_health_registry: Optional[ProviderHealthRegistry] = None


def get_health_registry() -> ProviderHealthRegistry:
    """Get global health registry."""
    global _health_registry
    if _health_registry is None:
        _health_registry = ProviderHealthRegistry()
    return _health_registry


def reset_health_registry():
    """Reset health registry (for testing)."""
    global _health_registry
    _health_registry = None


# ============================================================================
# Model Factory
# ============================================================================

class ModelFactory:
    """
    Factory for creating LLM instances with fallback support.

    Features:
    - Database-driven configuration for agents
    - Multi-provider fallback chains
    - Health-aware routing
    - Caching of model instances
    """

    def __init__(self):
        self._health = get_health_registry()
        self._model_cache: Dict[str, Any] = {}
        self._agent_configs: Dict[str, ModelConfig] = {}

    def get_config(self, model_id: str) -> Optional[ModelConfig]:
        """Get model configuration by ID."""
        return MODEL_REGISTRY.get(model_id)

    def get_fallback_chain(
        self,
        model_id: str,
        custom_chain: Optional[List[str]] = None,
    ) -> List[str]:
        """
        Get fallback chain for a model.

        Priority:
        1. Custom chain if provided
        2. Model's configured fallback
        3. Tier-based fallback
        """
        if custom_chain:
            return custom_chain

        config = self.get_config(model_id)
        if not config:
            return TIER_FALLBACK_CHAINS.get(ModelTier.TIER_2, [])

        # Build chain: model → configured fallback → tier fallback
        chain = [model_id]

        if config.fallback_model_id and config.fallback_model_id not in chain:
            chain.append(config.fallback_model_id)

        # Add tier fallbacks
        for fallback in TIER_FALLBACK_CHAINS.get(config.tier, []):
            if fallback not in chain:
                chain.append(fallback)

        return chain

    async def create_chat_model(
        self,
        model_id: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        streaming: bool = False,
        **kwargs,
    ) -> Tuple[Any, ModelConfig]:
        """
        Create a LangChain ChatModel instance.

        Returns (model, config) tuple.
        """
        config = self.get_config(model_id)
        if not config:
            raise ValueError(f"Unknown model: {model_id}")

        # Check API key
        api_key = os.getenv(config.api_key_env)
        if not api_key:
            raise ValueError(f"Missing API key: {config.api_key_env}")

        # Override defaults
        temp = temperature if temperature is not None else config.temperature
        tokens = max_tokens if max_tokens is not None else config.max_tokens

        # Create model based on provider
        if config.provider == ModelProvider.OPENAI:
            from langchain_openai import ChatOpenAI
            model = ChatOpenAI(
                model=config.model_id,
                temperature=temp,
                max_tokens=tokens,
                streaming=streaming,
                api_key=api_key,
                **kwargs,
            )

        elif config.provider == ModelProvider.ANTHROPIC:
            from langchain_anthropic import ChatAnthropic
            model = ChatAnthropic(
                model=config.model_id,
                temperature=temp,
                max_tokens=tokens,
                streaming=streaming,
                api_key=api_key,
                **kwargs,
            )

        elif config.provider == ModelProvider.GOOGLE:
            from langchain_google_genai import ChatGoogleGenerativeAI
            model = ChatGoogleGenerativeAI(
                model=config.model_id,
                temperature=temp,
                max_output_tokens=tokens,
                streaming=streaming,
                google_api_key=api_key,
                **kwargs,
            )

        elif config.provider == ModelProvider.AZURE_OPENAI:
            from langchain_openai import AzureChatOpenAI
            model = AzureChatOpenAI(
                deployment_name=config.model_id,
                temperature=temp,
                max_tokens=tokens,
                streaming=streaming,
                api_key=api_key,
                azure_endpoint=config.base_url or os.getenv("AZURE_OPENAI_ENDPOINT"),
                **kwargs,
            )

        else:
            raise ValueError(f"Unsupported provider: {config.provider}")

        return (model, config)

    async def create_chat_model_with_fallback(
        self,
        model_id: str,
        fallback_chain: Optional[List[str]] = None,
        **kwargs,
    ) -> Tuple[Any, ModelConfig, str]:
        """
        Create a ChatModel with automatic fallback.

        Returns (model, config, actual_model_id) tuple.
        """
        chain = self.get_fallback_chain(model_id, fallback_chain)
        last_error = None

        for candidate in chain:
            if not self._health.is_healthy(
                self.get_config(candidate).provider if self.get_config(candidate) else ModelProvider.OPENAI
            ):
                logger.info("skipping_unhealthy_model", model=candidate)
                continue

            try:
                model, config = await self.create_chat_model(candidate, **kwargs)
                if candidate != model_id:
                    logger.warning(
                        "using_fallback_model",
                        requested=model_id,
                        actual=candidate,
                    )
                return (model, config, candidate)

            except Exception as e:
                last_error = e
                logger.warning(
                    "model_creation_failed",
                    model=candidate,
                    error=str(e),
                )
                if config := self.get_config(candidate):
                    await self._health.record_failure(config.provider, str(e))

        raise RuntimeError(
            f"All models in fallback chain failed. Last error: {last_error}"
        )

    async def get_model_for_agent(
        self,
        agent_id: str,
        agent_config: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> Tuple[Any, ModelConfig, str]:
        """
        Get model configured for a specific agent.

        Args:
            agent_id: Agent UUID
            agent_config: Optional agent configuration from database
            **kwargs: Additional model parameters

        Returns:
            (model, config, model_id) tuple
        """
        # Get model ID from agent config
        model_id = None

        if agent_config:
            model_id = agent_config.get("base_model") or agent_config.get("model")
            temp = agent_config.get("temperature")
            max_tok = agent_config.get("max_tokens")

            if temp is not None:
                kwargs.setdefault("temperature", temp)
            if max_tok is not None:
                kwargs.setdefault("max_tokens", max_tok)

        # Default to gpt-4o-mini if not specified
        model_id = model_id or "gpt-4o-mini"

        # Normalize model IDs
        model_id = self._normalize_model_id(model_id)

        return await self.create_chat_model_with_fallback(model_id, **kwargs)

    def _normalize_model_id(self, model_id: str) -> str:
        """Normalize model ID to match registry keys."""
        # Handle common variations
        normalizations = {
            "gpt-4": "gpt-4o",
            "gpt4": "gpt-4o",
            "gpt-4-turbo": "gpt-4o",
            "gpt-4o-2024-05-13": "gpt-4o",
            "gpt-4o-2024-08-06": "gpt-4o",
            "gpt-3.5": "gpt-3.5-turbo",
            "claude-3.5-sonnet": "claude-3.5-sonnet",
            "claude-3-5-sonnet": "claude-3.5-sonnet",
            "claude-sonnet": "claude-3.5-sonnet",
            "claude-opus": "claude-3-opus",
            "claude-haiku": "claude-3-haiku",
        }

        normalized = normalizations.get(model_id.lower(), model_id)

        # If still not in registry, try to find closest match
        if normalized not in MODEL_REGISTRY:
            for key in MODEL_REGISTRY:
                if key in normalized.lower() or normalized.lower() in key:
                    return key

        return normalized


# Global factory instance
_factory: Optional[ModelFactory] = None


def get_model_factory() -> ModelFactory:
    """Get global model factory."""
    global _factory
    if _factory is None:
        _factory = ModelFactory()
    return _factory


def reset_model_factory():
    """Reset model factory (for testing)."""
    global _factory
    _factory = None


# ============================================================================
# Convenience Functions
# ============================================================================

async def get_chat_model(
    model_id: str = "gpt-4o-mini",
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    streaming: bool = False,
    fallback_chain: Optional[List[str]] = None,
    **kwargs,
) -> Any:
    """
    Get a ChatModel instance.

    Args:
        model_id: Model identifier (e.g., "gpt-4o", "claude-3.5-sonnet")
        temperature: Override default temperature
        max_tokens: Override default max tokens
        streaming: Enable streaming
        fallback_chain: Custom fallback models

    Returns:
        LangChain ChatModel instance
    """
    factory = get_model_factory()
    model, config, actual_id = await factory.create_chat_model_with_fallback(
        model_id,
        fallback_chain=fallback_chain,
        temperature=temperature,
        max_tokens=max_tokens,
        streaming=streaming,
        **kwargs,
    )
    return model


async def get_model_for_agent(
    agent_id: str,
    agent_config: Optional[Dict[str, Any]] = None,
    streaming: bool = False,
    **kwargs,
) -> Any:
    """
    Get a ChatModel configured for a specific agent.

    Args:
        agent_id: Agent UUID
        agent_config: Agent configuration from database
        streaming: Enable streaming
        **kwargs: Additional parameters

    Returns:
        LangChain ChatModel instance
    """
    factory = get_model_factory()
    model, config, actual_id = await factory.get_model_for_agent(
        agent_id,
        agent_config=agent_config,
        streaming=streaming,
        **kwargs,
    )
    return model


def get_model_config(model_id: str) -> Optional[ModelConfig]:
    """Get configuration for a model."""
    return MODEL_REGISTRY.get(model_id)


def get_available_models() -> List[str]:
    """Get list of available model IDs."""
    return list(MODEL_REGISTRY.keys())


def get_models_by_tier(tier: ModelTier) -> List[str]:
    """Get models for a specific tier."""
    return [
        model_id for model_id, config in MODEL_REGISTRY.items()
        if config.tier == tier
    ]


def get_models_by_provider(provider: ModelProvider) -> List[str]:
    """Get models from a specific provider."""
    return [
        model_id for model_id, config in MODEL_REGISTRY.items()
        if config.provider == provider
    ]


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Enums
    "ModelProvider",
    "ModelTier",

    # Configuration
    "ModelConfig",
    "MODEL_REGISTRY",
    "PROVIDER_FALLBACK_CHAINS",
    "TIER_FALLBACK_CHAINS",

    # Health
    "ProviderHealth",
    "ProviderHealthRegistry",
    "get_health_registry",
    "reset_health_registry",

    # Factory
    "ModelFactory",
    "get_model_factory",
    "reset_model_factory",

    # Convenience functions
    "get_chat_model",
    "get_model_for_agent",
    "get_model_config",
    "get_available_models",
    "get_models_by_tier",
    "get_models_by_provider",
]
