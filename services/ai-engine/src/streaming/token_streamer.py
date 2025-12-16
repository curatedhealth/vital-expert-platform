# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [sse_formatter]
"""
Token Streamer - Direct LLM token streaming utility.

Provides real-time token-by-token streaming from various LLM providers.
Supports OpenAI, Anthropic, and other LangChain-compatible models.

Key Features:
- Provider-agnostic streaming
- Token counting and metrics
- Callback support for custom processing
- Error handling with graceful fallback

Usage:
    async for token, count, metadata in stream_llm_tokens(
        provider="openai",
        model="gpt-4",
        messages=[...],
        temperature=0.7,
    ):
        yield format_token_event(token, count)
"""

from typing import Any, AsyncIterator, Dict, List, Optional, Tuple, Callable
import time
import structlog
from dataclasses import dataclass

logger = structlog.get_logger()


@dataclass
class TokenMetadata:
    """Metadata about a streamed token."""
    token_index: int
    model: str
    provider: str
    finish_reason: Optional[str] = None
    usage: Optional[Dict[str, int]] = None


class TokenStreamer:
    """
    Real-time LLM token streaming with provider abstraction.

    Supports:
    - OpenAI (GPT-4, GPT-3.5-turbo, etc.)
    - Anthropic (Claude 3, Claude 2, etc.)
    - Any LangChain-compatible chat model

    Example:
        streamer = TokenStreamer(
            provider="openai",
            model="gpt-4",
            temperature=0.7,
            max_tokens=4000,
        )

        async for token, metadata in streamer.stream(messages):
            print(token, end="", flush=True)
    """

    def __init__(
        self,
        provider: str = "openai",
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 4000,
        streaming: bool = True,
        callbacks: Optional[List[Any]] = None,
    ):
        self.provider = provider.lower()
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.streaming = streaming
        self.callbacks = callbacks or []

        # Metrics
        self.tokens_streamed = 0
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None

        # Initialize LLM
        self._llm = self._create_llm()

    def _create_llm(self) -> Any:
        """Create the appropriate LLM based on provider."""
        if self.provider == "openai":
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                streaming=self.streaming,
                callbacks=self.callbacks,
            )
        elif self.provider == "anthropic":
            from langchain_anthropic import ChatAnthropic
            # Normalize model name for Anthropic
            model_name = self.model
            if 'claude' not in model_name.lower():
                model_name = "claude-sonnet-4-20250514"  # Default to latest Sonnet
            return ChatAnthropic(
                model=model_name,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                streaming=self.streaming,
                callbacks=self.callbacks,
            )
        else:
            # Default to OpenAI-compatible
            logger.warning("unknown_provider_using_openai", provider=self.provider)
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                streaming=self.streaming,
                callbacks=self.callbacks,
            )

    async def stream(
        self,
        messages: List[Any],
        on_token: Optional[Callable[[str, int], None]] = None,
    ) -> AsyncIterator[Tuple[str, TokenMetadata]]:
        """
        Stream tokens from the LLM.

        Args:
            messages: List of messages (SystemMessage, HumanMessage, etc.)
            on_token: Optional callback for each token

        Yields:
            Tuple of (token_content, TokenMetadata)
        """
        self.start_time = time.time()
        self.tokens_streamed = 0

        try:
            async for chunk in self._llm.astream(messages):
                # Extract content from chunk
                content = ""
                finish_reason = None

                if hasattr(chunk, 'content') and chunk.content:
                    content = chunk.content
                elif isinstance(chunk, dict):
                    content = chunk.get('content', '')

                # Check for finish reason
                if hasattr(chunk, 'response_metadata'):
                    finish_reason = chunk.response_metadata.get('finish_reason')

                if content:
                    self.tokens_streamed += 1

                    metadata = TokenMetadata(
                        token_index=self.tokens_streamed,
                        model=self.model,
                        provider=self.provider,
                        finish_reason=finish_reason,
                    )

                    # Call callback if provided
                    if on_token:
                        on_token(content, self.tokens_streamed)

                    yield content, metadata

        except Exception as e:
            logger.error(
                "token_streaming_error",
                error=str(e),
                provider=self.provider,
                model=self.model,
            )
            raise

        finally:
            self.end_time = time.time()

    def get_metrics(self) -> Dict[str, Any]:
        """Get streaming metrics after completion."""
        elapsed = (self.end_time or time.time()) - (self.start_time or time.time())
        return {
            "tokens_streamed": self.tokens_streamed,
            "elapsed_seconds": round(elapsed, 2),
            "tokens_per_second": round(self.tokens_streamed / elapsed, 2) if elapsed > 0 else 0,
            "provider": self.provider,
            "model": self.model,
        }


async def stream_llm_tokens(
    provider: str,
    model: str,
    messages: List[Any],
    temperature: float = 0.7,
    max_tokens: int = 4000,
    system_prompt: Optional[str] = None,
    user_query: Optional[str] = None,
) -> AsyncIterator[Tuple[str, int, Dict[str, Any]]]:
    """
    Convenience function for streaming LLM tokens.

    Can accept either pre-built messages or system_prompt + user_query.

    Args:
        provider: LLM provider ("openai" or "anthropic")
        model: Model name
        messages: Pre-built messages (overrides system_prompt/user_query)
        temperature: Generation temperature
        max_tokens: Maximum tokens to generate
        system_prompt: System prompt (alternative to messages)
        user_query: User query (alternative to messages)

    Yields:
        Tuple of (token_content, token_count, metadata_dict)

    Example:
        async for token, count, meta in stream_llm_tokens(
            provider="openai",
            model="gpt-4",
            system_prompt="You are a helpful assistant.",
            user_query="What is FDA 510k?",
        ):
            print(token, end="")
    """
    from langchain_core.messages import HumanMessage, SystemMessage

    # Build messages if not provided
    if not messages and system_prompt and user_query:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_query),
        ]
    elif not messages:
        raise ValueError("Either 'messages' or 'system_prompt + user_query' must be provided")

    streamer = TokenStreamer(
        provider=provider,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    async for content, metadata in streamer.stream(messages):
        yield content, metadata.token_index, {
            "model": metadata.model,
            "provider": metadata.provider,
            "finish_reason": metadata.finish_reason,
        }


async def stream_with_context(
    llm_config: Dict[str, Any],
) -> AsyncIterator[Tuple[str, int]]:
    """
    Stream tokens using a pre-configured llm_config dict.

    This is the integration point for the existing Mode 1 workflow.

    Args:
        llm_config: Dict containing:
            - provider: "openai" or "anthropic"
            - model: Model name
            - temperature: Generation temperature
            - max_tokens: Maximum tokens
            - system_prompt: System prompt
            - user_query: User query

    Yields:
        Tuple of (token_content, token_count)
    """
    from langchain_core.messages import HumanMessage, SystemMessage

    provider = llm_config.get('provider', 'openai')
    model = llm_config.get('model', 'gpt-4')
    temperature = llm_config.get('temperature', 0.7)
    max_tokens = llm_config.get('max_tokens', 4000)
    system_prompt = llm_config.get('system_prompt', '')
    user_query = llm_config.get('user_query', '')

    if not system_prompt or not user_query:
        logger.error(
            "stream_with_context_missing_prompts",
            config_keys=list(llm_config.keys()),
            has_system_prompt=bool(system_prompt),
            has_user_query=bool(user_query),
        )
        raise ValueError(
            f"Missing required prompts for streaming: "
            f"system_prompt={bool(system_prompt)}, user_query={bool(user_query)}"
        )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_query),
    ]

    streamer = TokenStreamer(
        provider=provider,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    async for content, metadata in streamer.stream(messages):
        yield content, metadata.token_index


# Type alias for clarity
TokenStream = AsyncIterator[Tuple[str, int, Dict[str, Any]]]
