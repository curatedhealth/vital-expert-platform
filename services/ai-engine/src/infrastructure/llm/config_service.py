"""
VITAL Path AI Services - LLM Configuration Service

Centralized LLM configuration management.

Architecture Pattern:
- PostgreSQL agents table: Agent-specific config (model, temperature, max_tokens)
- Environment variables: Global defaults (fallback)
- Python: ZERO hardcoded values

Priority:
1. Agent-specific config (from database via AgentLoader)
2. Environment variables (DEFAULT_LLM_MODEL, etc.)
3. Minimal last-resort defaults (with warning logs)

Usage:
    from infrastructure.llm.config_service import get_llm_config, LLMConfigService

    # Get config for a specific agent
    config = await get_llm_config(agent_id="uuid")

    # Get config for a level (L1-L5)
    config = get_llm_config_for_level("L4")

    # Get default config
    config = get_default_llm_config()

This service REPLACES all hardcoded model/temperature/max_tokens in the codebase.
"""

import os
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from functools import lru_cache
import structlog

logger = structlog.get_logger()


# =============================================================================
# LLM CONFIG DATA CLASS
# =============================================================================

@dataclass
class LLMModelConfig:
    """
    LLM configuration for an agent or task.

    ALL values should come from database or environment variables.
    NO hardcoded defaults here except for absolute last-resort with warnings.
    """
    model: str
    temperature: float
    max_tokens: int
    source: str = "unknown"  # Tracks where config came from: "database", "env", "fallback"

    # Optional extended config
    context_window: Optional[int] = None
    cost_per_token_input: Optional[float] = None
    cost_per_token_output: Optional[float] = None
    supports_function_calling: bool = True
    supports_json_mode: bool = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for LangChain/LLM clients."""
        return {
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }

    def __repr__(self) -> str:
        return f"LLMModelConfig(model={self.model}, temp={self.temperature}, max_tokens={self.max_tokens}, source={self.source})"


# =============================================================================
# ENVIRONMENT-BASED DEFAULTS (Level-specific)
# =============================================================================

def _get_env_defaults() -> Dict[str, Any]:
    """
    Get global defaults from environment variables.

    Environment Variables (set in .env):
    - DEFAULT_LLM_MODEL: Default model (e.g., "gpt-4o")
    - DEFAULT_LLM_TEMPERATURE: Default temperature (e.g., "0.7")
    - DEFAULT_LLM_MAX_TOKENS: Default max tokens (e.g., "4096")

    Level-specific overrides:
    - L1_LLM_MODEL, L1_LLM_TEMPERATURE, L1_LLM_MAX_TOKENS
    - L2_LLM_MODEL, L2_LLM_TEMPERATURE, L2_LLM_MAX_TOKENS
    - L3_LLM_MODEL, L3_LLM_TEMPERATURE, L3_LLM_MAX_TOKENS
    - L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
    - L5_LLM_MODEL, L5_LLM_TEMPERATURE, L5_LLM_MAX_TOKENS

    Utility/Service overrides (for non-agent services):
    - UTILITY_LLM_MODEL, UTILITY_LLM_TEMPERATURE, UTILITY_LLM_MAX_TOKENS
    """
    return {
        "default": {
            "model": os.getenv("DEFAULT_LLM_MODEL", "gpt-4o"),
            "temperature": float(os.getenv("DEFAULT_LLM_TEMPERATURE", "0.7")),
            "max_tokens": int(os.getenv("DEFAULT_LLM_MAX_TOKENS", "4096")),
        },
        "L1": {
            "model": os.getenv("L1_LLM_MODEL") or os.getenv("DEFAULT_LLM_MODEL", "gpt-4o"),
            "temperature": float(os.getenv("L1_LLM_TEMPERATURE", "0.3")),
            "max_tokens": int(os.getenv("L1_LLM_MAX_TOKENS", "4000")),
        },
        "L2": {
            "model": os.getenv("L2_LLM_MODEL") or os.getenv("DEFAULT_LLM_MODEL", "gpt-4o"),
            "temperature": float(os.getenv("L2_LLM_TEMPERATURE", "0.5")),
            "max_tokens": int(os.getenv("L2_LLM_MAX_TOKENS", "4000")),
        },
        "L3": {
            "model": os.getenv("L3_LLM_MODEL") or os.getenv("DEFAULT_LLM_MODEL", "gpt-4o-mini"),
            "temperature": float(os.getenv("L3_LLM_TEMPERATURE", "0.7")),
            "max_tokens": int(os.getenv("L3_LLM_MAX_TOKENS", "2000")),
        },
        "L4": {
            "model": os.getenv("L4_LLM_MODEL") or os.getenv("DEFAULT_LLM_MODEL", "gpt-4o-mini"),
            "temperature": float(os.getenv("L4_LLM_TEMPERATURE", "0.2")),
            "max_tokens": int(os.getenv("L4_LLM_MAX_TOKENS", "4000")),
        },
        "L5": {
            "model": os.getenv("L5_LLM_MODEL") or os.getenv("DEFAULT_LLM_MODEL", "gpt-3.5-turbo"),
            "temperature": float(os.getenv("L5_LLM_TEMPERATURE", "0.1")),
            "max_tokens": int(os.getenv("L5_LLM_MAX_TOKENS", "2000")),
        },
        # UTILITY: For non-agent services (selectors, extractors, etc.)
        "UTILITY": {
            "model": os.getenv("UTILITY_LLM_MODEL") or os.getenv("DEFAULT_LLM_MODEL", "gpt-4o"),
            "temperature": float(os.getenv("UTILITY_LLM_TEMPERATURE", "0.2")),
            "max_tokens": int(os.getenv("UTILITY_LLM_MAX_TOKENS", "1000")),
        },
    }


# =============================================================================
# LLM CONFIG SERVICE
# =============================================================================

class LLMConfigService:
    """
    Centralized LLM configuration service.

    Architecture:
    - Primary source: PostgreSQL agents table (via AgentLoader)
    - Fallback: Environment variables
    - Last resort: Minimal defaults with warning logs

    This service should be used by ALL code that needs LLM configuration.
    NO hardcoded model/temperature/max_tokens anywhere else in codebase.
    """

    _instance: Optional["LLMConfigService"] = None

    def __init__(self):
        self._env_defaults = _get_env_defaults()
        self._agent_cache: Dict[str, LLMModelConfig] = {}
        self._initialized = False

    @classmethod
    def get_instance(cls) -> "LLMConfigService":
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def initialize(self) -> None:
        """Initialize service (load agent configs from database)."""
        if self._initialized:
            return

        # Note: AgentLoader handles its own initialization
        self._initialized = True
        logger.info("llm_config_service_initialized")

    def get_default_config(self) -> LLMModelConfig:
        """
        Get default LLM configuration from environment variables.

        Returns:
            LLMModelConfig with values from env vars
        """
        defaults = self._env_defaults["default"]
        return LLMModelConfig(
            model=defaults["model"],
            temperature=defaults["temperature"],
            max_tokens=defaults["max_tokens"],
            source="env"
        )

    def get_config_for_level(self, level: str) -> LLMModelConfig:
        """
        Get LLM configuration for a specific agent level.

        Args:
            level: Agent level (L1, L2, L3, L4, L5)

        Returns:
            LLMModelConfig with level-appropriate values from env vars
        """
        level = level.upper()
        if level not in self._env_defaults:
            logger.warning(
                "llm_config_unknown_level",
                level=level,
                using="default"
            )
            return self.get_default_config()

        level_defaults = self._env_defaults[level]
        return LLMModelConfig(
            model=level_defaults["model"],
            temperature=level_defaults["temperature"],
            max_tokens=level_defaults["max_tokens"],
            source=f"env:{level}"
        )

    async def get_config_for_agent(
        self,
        agent_id: str,
        fallback_level: Optional[str] = None
    ) -> LLMModelConfig:
        """
        Get LLM configuration for a specific agent from database.

        Priority:
        1. Agent's config from database (model, temperature, max_tokens columns)
        2. Level-specific env var defaults
        3. Global env var defaults

        Args:
            agent_id: UUID of the agent
            fallback_level: Level to use if agent not found (L1, L2, etc.)

        Returns:
            LLMModelConfig with values from database or fallback
        """
        # Check cache first
        if agent_id in self._agent_cache:
            return self._agent_cache[agent_id]

        try:
            from infrastructure.database.agent_loader import AgentLoader

            loader = AgentLoader.get_instance()
            await loader.initialize()

            agent = await loader.get_agent(agent_id)
            if agent:
                config = LLMModelConfig(
                    model=agent.base_model,
                    temperature=agent.temperature,
                    max_tokens=agent.max_tokens,
                    source="database"
                )
                self._agent_cache[agent_id] = config
                logger.info(
                    "llm_config_loaded_from_database",
                    agent_id=agent_id,
                    model=config.model,
                    temperature=config.temperature
                )
                return config

        except Exception as e:
            logger.warning(
                "llm_config_database_load_failed",
                agent_id=agent_id,
                error=str(e),
                using_fallback=True
            )

        # Fallback to level defaults or global defaults
        if fallback_level:
            return self.get_config_for_level(fallback_level)

        return self.get_default_config()

    async def get_config_for_task(
        self,
        task_type: str,
        agent_id: Optional[str] = None,
        override_model: Optional[str] = None,
        override_temperature: Optional[float] = None,
        override_max_tokens: Optional[int] = None,
    ) -> LLMModelConfig:
        """
        Get LLM configuration for a specific task.

        Useful for tasks that may need different config than the agent's default.

        Args:
            task_type: Type of task (for future task-specific defaults)
            agent_id: Optional agent ID to get base config
            override_model: Override the model
            override_temperature: Override the temperature
            override_max_tokens: Override max_tokens

        Returns:
            LLMModelConfig with merged values
        """
        # Start with agent config or defaults
        if agent_id:
            base_config = await self.get_config_for_agent(agent_id)
        else:
            base_config = self.get_default_config()

        # Apply overrides
        return LLMModelConfig(
            model=override_model or base_config.model,
            temperature=override_temperature if override_temperature is not None else base_config.temperature,
            max_tokens=override_max_tokens or base_config.max_tokens,
            source=f"{base_config.source}+overrides" if any([override_model, override_temperature, override_max_tokens]) else base_config.source
        )

    def clear_cache(self) -> None:
        """Clear agent config cache."""
        self._agent_cache.clear()
        logger.info("llm_config_cache_cleared")


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

_config_service: Optional[LLMConfigService] = None


def get_llm_config_service() -> LLMConfigService:
    """Get or create LLMConfigService singleton."""
    global _config_service
    if _config_service is None:
        _config_service = LLMConfigService.get_instance()
    return _config_service


def get_default_llm_config() -> LLMModelConfig:
    """Get default LLM config from environment variables."""
    return get_llm_config_service().get_default_config()


def get_llm_config_for_level(level: str) -> LLMModelConfig:
    """
    Get LLM config for a specific agent level.

    Args:
        level: Agent level (L1, L2, L3, L4, L5)

    Returns:
        LLMModelConfig with level-appropriate values
    """
    return get_llm_config_service().get_config_for_level(level)


async def get_llm_config(
    agent_id: Optional[str] = None,
    level: Optional[str] = None,
    task_type: Optional[str] = None,
    override_model: Optional[str] = None,
    override_temperature: Optional[float] = None,
    override_max_tokens: Optional[int] = None,
) -> LLMModelConfig:
    """
    Universal LLM config getter.

    This is the primary function all code should use to get LLM configuration.

    Priority:
    1. Overrides (if provided)
    2. Agent-specific config (if agent_id provided)
    3. Level-specific env var defaults (if level provided)
    4. Global env var defaults

    Args:
        agent_id: UUID of agent (loads config from database)
        level: Agent level L1-L5 (uses level-specific env defaults)
        task_type: Type of task (for future task-specific defaults)
        override_model: Override the model
        override_temperature: Override the temperature
        override_max_tokens: Override max_tokens

    Returns:
        LLMModelConfig with resolved values

    Example:
        # For a specific agent
        config = await get_llm_config(agent_id="uuid-here")

        # For a specific level
        config = await get_llm_config(level="L4")

        # With overrides
        config = await get_llm_config(
            agent_id="uuid",
            override_temperature=0.0  # Force deterministic
        )
    """
    service = get_llm_config_service()
    await service.initialize()

    if agent_id:
        return await service.get_config_for_task(
            task_type=task_type or "default",
            agent_id=agent_id,
            override_model=override_model,
            override_temperature=override_temperature,
            override_max_tokens=override_max_tokens,
        )

    if level:
        base_config = service.get_config_for_level(level)
        if any([override_model, override_temperature is not None, override_max_tokens]):
            return LLMModelConfig(
                model=override_model or base_config.model,
                temperature=override_temperature if override_temperature is not None else base_config.temperature,
                max_tokens=override_max_tokens or base_config.max_tokens,
                source=f"{base_config.source}+overrides"
            )
        return base_config

    # Default config with overrides
    base_config = service.get_default_config()
    if any([override_model, override_temperature is not None, override_max_tokens]):
        return LLMModelConfig(
            model=override_model or base_config.model,
            temperature=override_temperature if override_temperature is not None else base_config.temperature,
            max_tokens=override_max_tokens or base_config.max_tokens,
            source=f"{base_config.source}+overrides"
        )
    return base_config


# =============================================================================
# LANGCHAIN INTEGRATION HELPERS
# =============================================================================

async def create_chat_openai(
    agent_id: Optional[str] = None,
    level: Optional[str] = None,
    override_model: Optional[str] = None,
    override_temperature: Optional[float] = None,
    override_max_tokens: Optional[int] = None,
    **extra_kwargs
) -> "ChatOpenAI":
    """
    Create a LangChain ChatOpenAI instance with config from database/env.

    This replaces all hardcoded ChatOpenAI() instantiations in the codebase.

    Args:
        agent_id: Agent ID to get config from database
        level: Agent level for level-specific defaults
        override_*: Override specific values
        **extra_kwargs: Extra kwargs for ChatOpenAI

    Returns:
        Configured ChatOpenAI instance

    Example:
        # Before (WRONG - hardcoded):
        llm = ChatOpenAI(model="gpt-4", temperature=0.3, max_tokens=4000)

        # After (CORRECT - from database/env):
        llm = await create_chat_openai(agent_id="uuid")
        # or
        llm = await create_chat_openai(level="L4")
    """
    from langchain_openai import ChatOpenAI

    config = await get_llm_config(
        agent_id=agent_id,
        level=level,
        override_model=override_model,
        override_temperature=override_temperature,
        override_max_tokens=override_max_tokens,
    )

    logger.debug(
        "create_chat_openai",
        model=config.model,
        temperature=config.temperature,
        max_tokens=config.max_tokens,
        source=config.source
    )

    return ChatOpenAI(
        model=config.model,
        temperature=config.temperature,
        max_tokens=config.max_tokens,
        **extra_kwargs
    )


async def create_chat_anthropic(
    agent_id: Optional[str] = None,
    level: Optional[str] = None,
    override_model: Optional[str] = None,
    override_temperature: Optional[float] = None,
    override_max_tokens: Optional[int] = None,
    **extra_kwargs
) -> "ChatAnthropic":
    """
    Create a LangChain ChatAnthropic instance with config from database/env.

    Args:
        agent_id: Agent ID to get config from database
        level: Agent level for level-specific defaults
        override_*: Override specific values
        **extra_kwargs: Extra kwargs for ChatAnthropic

    Returns:
        Configured ChatAnthropic instance
    """
    from langchain_anthropic import ChatAnthropic

    config = await get_llm_config(
        agent_id=agent_id,
        level=level,
        override_model=override_model,
        override_temperature=override_temperature,
        override_max_tokens=override_max_tokens,
    )

    # Map to Anthropic model names if needed
    model = config.model
    if model.startswith("gpt-"):
        # Map OpenAI models to Anthropic equivalents
        model_mapping = {
            "gpt-4o": "claude-sonnet-4-20250514",
            "gpt-4o-mini": "claude-haiku-4-20250514",
            "gpt-4-turbo": "claude-sonnet-4-20250514",
            "gpt-4": "claude-sonnet-4-20250514",
            "gpt-3.5-turbo": "claude-haiku-4-20250514",
        }
        model = model_mapping.get(model, "claude-sonnet-4-20250514")

    logger.debug(
        "create_chat_anthropic",
        model=model,
        temperature=config.temperature,
        max_tokens=config.max_tokens,
        source=config.source
    )

    return ChatAnthropic(
        model=model,
        temperature=config.temperature,
        max_tokens=config.max_tokens,
        **extra_kwargs
    )


__all__ = [
    # Data classes
    "LLMModelConfig",
    # Service
    "LLMConfigService",
    "get_llm_config_service",
    # Convenience functions
    "get_default_llm_config",
    "get_llm_config_for_level",
    "get_llm_config",
    # LangChain helpers
    "create_chat_openai",
    "create_chat_anthropic",
]
