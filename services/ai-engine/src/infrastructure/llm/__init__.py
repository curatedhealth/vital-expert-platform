"""
VITAL Path - LLM Infrastructure

LLM client wrappers with built-in:
- Configuration service (database/env-driven, NO hardcoded values)
- Token tracking and cost estimation
- Budget enforcement
- Rate limiting
- Retry logic
- Telemetry

Architecture Pattern:
- PostgreSQL agents table: Agent-specific config (model, temperature, max_tokens)
- Environment variables: Global defaults (fallback)
- Python: ZERO hardcoded values

Usage:
    from infrastructure.llm import get_llm_config, create_chat_openai

    # Get config for an agent (from database)
    config = await get_llm_config(agent_id="uuid")

    # Get config for a level
    config = await get_llm_config(level="L4")

    # Create LangChain ChatOpenAI with config from database
    llm = await create_chat_openai(agent_id="uuid")
"""

from .tracking import (
    TrackedLLMClient,
    track_llm_usage,
    TokenTracker,
)
from .tokenizer import (
    estimate_tokens,
    count_tokens,
    count_messages_tokens,
    get_context_window,
    truncate_to_tokens,
)
from .client import (
    LLMConfig,
    LLMResponse,
    LLMProvider,
    BaseLLMClient,
    OpenAIClient,
    AnthropicClient,
    create_llm_client,
)
from .config_service import (
    LLMModelConfig,
    LLMConfigService,
    get_llm_config_service,
    get_default_llm_config,
    get_llm_config_for_level,
    get_llm_config,
    create_chat_openai,
    create_chat_anthropic,
)

__all__ = [
    # Config Service (USE THIS - NO hardcoded values)
    "LLMModelConfig",
    "LLMConfigService",
    "get_llm_config_service",
    "get_default_llm_config",
    "get_llm_config_for_level",
    "get_llm_config",
    "create_chat_openai",
    "create_chat_anthropic",
    # Tracking
    "TrackedLLMClient",
    "track_llm_usage",
    "TokenTracker",
    # Tokenizer
    "estimate_tokens",
    "count_tokens",
    "count_messages_tokens",
    "get_context_window",
    "truncate_to_tokens",
    # Client
    "LLMConfig",
    "LLMResponse",
    "LLMProvider",
    "BaseLLMClient",
    "OpenAIClient",
    "AnthropicClient",
    "create_llm_client",
]






