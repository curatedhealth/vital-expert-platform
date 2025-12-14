"""
LLM Service

Provides a unified interface for LLM calls used by workflows.
Uses the LLM Config Service for model selection and configuration.
"""

from typing import Any, Dict, List, Optional, TYPE_CHECKING
import structlog
import os

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Lazy import for Anthropic - only load when needed
if TYPE_CHECKING:
    from langchain_anthropic import ChatAnthropic

logger = structlog.get_logger()


class LLMService:
    """
    Service for making LLM API calls.

    This service provides a simple interface for generating text responses
    from various LLM providers (OpenAI, Anthropic).
    """

    def __init__(self):
        self._openai_api_key = os.getenv("OPENAI_API_KEY")
        self._anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self._default_provider = os.getenv("DEFAULT_LLM_PROVIDER", "openai")

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Generate a text response from an LLM.

        Args:
            prompt: The user prompt/question
            model: Model to use (e.g., "gpt-4o", "claude-sonnet-4-20250514")
            temperature: Temperature for generation (0.0-2.0)
            max_tokens: Maximum tokens in response
            system_prompt: Optional system prompt

        Returns:
            Generated text response
        """
        # Use defaults if not specified
        model = model or os.getenv("DEFAULT_LLM_MODEL", "gpt-4o")
        temperature = temperature if temperature is not None else 0.7
        max_tokens = max_tokens or 4096

        logger.debug(
            "llm_generate_request",
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            prompt_length=len(prompt)
        )

        try:
            # Determine provider based on model name
            if model.startswith("claude") or model.startswith("anthropic"):
                response = await self._generate_anthropic(
                    prompt=prompt,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    system_prompt=system_prompt
                )
            else:
                # Default to OpenAI (gpt-* models)
                response = await self._generate_openai(
                    prompt=prompt,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    system_prompt=system_prompt
                )

            logger.debug(
                "llm_generate_success",
                model=model,
                response_length=len(response)
            )

            return response

        except Exception as e:
            logger.error(
                "llm_generate_error",
                model=model,
                error=str(e)
            )
            raise

    async def _generate_openai(
        self,
        prompt: str,
        model: str,
        temperature: float,
        max_tokens: int,
        system_prompt: Optional[str] = None
    ) -> str:
        """Generate response using OpenAI API."""
        llm = ChatOpenAI(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=self._openai_api_key
        )

        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        response = await llm.ainvoke(messages)
        return response.content

    async def _generate_anthropic(
        self,
        prompt: str,
        model: str,
        temperature: float,
        max_tokens: int,
        system_prompt: Optional[str] = None
    ) -> str:
        """Generate response using Anthropic API."""
        try:
            from langchain_anthropic import ChatAnthropic
        except ImportError:
            logger.warning("langchain_anthropic not installed, falling back to OpenAI")
            return await self._generate_openai(prompt, "gpt-4o", temperature, max_tokens, system_prompt)

        llm = ChatAnthropic(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=self._anthropic_api_key
        )

        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        response = await llm.ainvoke(messages)
        return response.content

    async def generate_with_messages(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Generate a response from a list of messages.

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use
            temperature: Temperature for generation
            max_tokens: Maximum tokens in response

        Returns:
            Generated text response
        """
        model = model or os.getenv("DEFAULT_LLM_MODEL", "gpt-4o")
        temperature = temperature if temperature is not None else 0.7
        max_tokens = max_tokens or 4096

        # Convert to LangChain messages
        lc_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                lc_messages.append(SystemMessage(content=content))
            else:
                lc_messages.append(HumanMessage(content=content))

        # Determine provider
        if model.startswith("claude") or model.startswith("anthropic"):
            try:
                from langchain_anthropic import ChatAnthropic
                llm = ChatAnthropic(
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    api_key=self._anthropic_api_key
                )
            except ImportError:
                logger.warning("langchain_anthropic not installed, falling back to OpenAI")
                llm = ChatOpenAI(
                    model="gpt-4o",
                    temperature=temperature,
                    max_tokens=max_tokens,
                    api_key=self._openai_api_key
                )
        else:
            llm = ChatOpenAI(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                api_key=self._openai_api_key
            )

        response = await llm.ainvoke(lc_messages)
        return response.content


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create LLMService singleton."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


__all__ = ["LLMService", "get_llm_service"]
