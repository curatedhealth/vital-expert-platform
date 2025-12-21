"""
VITAL Path - LLM Client

Unified LLM client with built-in budget tracking and streaming support.
Supports OpenAI and Anthropic models.
"""

import logging
from typing import Dict, Any, Optional, List, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod

from core.context import get_request_context
from domain.services.budget_service import BudgetService
from domain.value_objects.token_usage import TokenUsage
from domain.exceptions import BudgetExceededException, LLMRateLimitException
from .tracking import TokenTracker
from .tokenizer import count_messages_tokens, get_context_window

logger = logging.getLogger(__name__)


class LLMProvider(str, Enum):
    """Supported LLM providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


@dataclass
class LLMConfig:
    """Configuration for LLM calls."""
    
    model: str
    provider: LLMProvider = LLMProvider.OPENAI
    temperature: float = 0.7
    max_tokens: int = 2000
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    
    # Budget settings
    enforce_budget: bool = True
    budget_buffer_percent: float = 10.0  # Reserve 10% for safety
    
    # Streaming settings
    stream: bool = False
    
    # Retry settings
    max_retries: int = 3
    retry_delay_seconds: float = 1.0


@dataclass
class LLMResponse:
    """Standardized response from LLM calls."""
    
    content: str
    model: str
    usage: TokenUsage
    finish_reason: Optional[str] = None
    
    # For streaming
    is_complete: bool = True
    chunk_index: int = 0
    
    # Metadata
    raw_response: Optional[Any] = None
    latency_ms: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "model": self.model,
            "usage": {
                "prompt_tokens": self.usage.prompt_tokens,
                "completion_tokens": self.usage.completion_tokens,
                "total_tokens": self.usage.total_tokens,
            },
            "finish_reason": self.finish_reason,
            "latency_ms": self.latency_ms,
        }


class BaseLLMClient(ABC):
    """Base class for LLM clients."""
    
    def __init__(
        self,
        config: LLMConfig,
        budget_service: BudgetService = None,
    ):
        self.config = config
        self.budget_service = budget_service or BudgetService()
        self.tracker = TokenTracker(self.budget_service)
    
    @abstractmethod
    async def complete(
        self,
        messages: List[Dict[str, str]],
        operation: str = "chat",
        **kwargs,
    ) -> LLMResponse:
        """Make a completion request."""
        pass
    
    @abstractmethod
    async def stream_complete(
        self,
        messages: List[Dict[str, str]],
        operation: str = "chat",
        **kwargs,
    ) -> AsyncGenerator[LLMResponse, None]:
        """Make a streaming completion request."""
        pass
    
    async def _check_budget(
        self,
        messages: List[Dict[str, str]],
    ) -> bool:
        """Check if we have budget for this request."""
        if not self.config.enforce_budget:
            return True
        
        ctx = get_request_context()
        if not ctx:
            return True
        
        # Estimate tokens
        prompt_tokens = count_messages_tokens(messages, self.config.model)
        estimated_completion = min(self.config.max_tokens, prompt_tokens * 2)
        estimated_total = int(
            (prompt_tokens + estimated_completion) * 
            (1 + self.config.budget_buffer_percent / 100)
        )
        
        result = await self.budget_service.check_budget(
            tenant_id=ctx.tenant_id,
            user_id=ctx.user_id,
            estimated_tokens=estimated_total,
        )
        
        if not result.can_proceed:
            raise BudgetExceededException(
                f"Token budget exceeded. "
                f"Used: {result.monthly_used}, Limit: {result.monthly_limit}"
            )
        
        return True
    
    async def _record_usage(
        self,
        usage: TokenUsage,
        operation: str,
    ) -> None:
        """Record token usage."""
        await self.tracker.record(
            usage=usage,
            model=self.config.model,
            operation=operation,
        )


class OpenAIClient(BaseLLMClient):
    """OpenAI-compatible LLM client."""
    
    def __init__(
        self,
        config: LLMConfig,
        api_key: str = None,
        base_url: str = None,
        budget_service: BudgetService = None,
    ):
        super().__init__(config, budget_service)
        self.api_key = api_key
        self.base_url = base_url
        self._client = None
    
    def _get_client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            try:
                from openai import AsyncOpenAI
                
                kwargs = {}
                if self.api_key:
                    kwargs["api_key"] = self.api_key
                if self.base_url:
                    kwargs["base_url"] = self.base_url
                
                self._client = AsyncOpenAI(**kwargs)
            except ImportError:
                raise ImportError("openai package required. Install with: pip install openai")
        
        return self._client
    
    async def complete(
        self,
        messages: List[Dict[str, str]],
        operation: str = "chat",
        **kwargs,
    ) -> LLMResponse:
        """Make a completion request to OpenAI."""
        import time
        
        # Check budget
        await self._check_budget(messages)
        
        client = self._get_client()
        start_time = time.time()
        
        try:
            response = await client.chat.completions.create(
                model=self.config.model,
                messages=messages,
                temperature=kwargs.get("temperature", self.config.temperature),
                max_tokens=kwargs.get("max_tokens", self.config.max_tokens),
                top_p=kwargs.get("top_p", self.config.top_p),
                frequency_penalty=kwargs.get("frequency_penalty", self.config.frequency_penalty),
                presence_penalty=kwargs.get("presence_penalty", self.config.presence_penalty),
            )
            
            latency_ms = (time.time() - start_time) * 1000
            
            # Extract usage
            usage = TokenUsage.from_openai_response(response)
            
            # Record usage
            await self._record_usage(usage, operation)
            
            return LLMResponse(
                content=response.choices[0].message.content or "",
                model=response.model,
                usage=usage,
                finish_reason=response.choices[0].finish_reason,
                raw_response=response,
                latency_ms=latency_ms,
            )
            
        except Exception as e:
            if "rate_limit" in str(e).lower():
                raise LLMRateLimitException(f"OpenAI rate limit: {str(e)}")
            raise
    
    async def stream_complete(
        self,
        messages: List[Dict[str, str]],
        operation: str = "chat",
        **kwargs,
    ) -> AsyncGenerator[LLMResponse, None]:
        """Make a streaming completion request to OpenAI."""
        # Check budget
        await self._check_budget(messages)
        
        client = self._get_client()
        
        try:
            stream = await client.chat.completions.create(
                model=self.config.model,
                messages=messages,
                temperature=kwargs.get("temperature", self.config.temperature),
                max_tokens=kwargs.get("max_tokens", self.config.max_tokens),
                stream=True,
            )
            
            accumulated_content = ""
            chunk_index = 0
            prompt_tokens = count_messages_tokens(messages, self.config.model)
            
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    accumulated_content += content
                    
                    yield LLMResponse(
                        content=content,
                        model=self.config.model,
                        usage=TokenUsage(prompt_tokens=0, completion_tokens=1),
                        finish_reason=None,
                        is_complete=False,
                        chunk_index=chunk_index,
                    )
                    
                    chunk_index += 1
                
                # Check for completion
                if chunk.choices and chunk.choices[0].finish_reason:
                    # Estimate final usage
                    completion_tokens = len(accumulated_content) // 4  # Rough estimate
                    usage = TokenUsage(
                        prompt_tokens=prompt_tokens,
                        completion_tokens=completion_tokens,
                    )
                    
                    # Record usage
                    await self._record_usage(usage, operation)
                    
                    yield LLMResponse(
                        content="",
                        model=self.config.model,
                        usage=usage,
                        finish_reason=chunk.choices[0].finish_reason,
                        is_complete=True,
                        chunk_index=chunk_index,
                    )
                    
        except Exception as e:
            if "rate_limit" in str(e).lower():
                raise LLMRateLimitException(f"OpenAI rate limit: {str(e)}")
            raise


class AnthropicClient(BaseLLMClient):
    """Anthropic Claude client."""
    
    def __init__(
        self,
        config: LLMConfig,
        api_key: str = None,
        budget_service: BudgetService = None,
    ):
        super().__init__(config, budget_service)
        self.api_key = api_key
        self._client = None
    
    def _get_client(self):
        """Lazy initialization of Anthropic client."""
        if self._client is None:
            try:
                from anthropic import AsyncAnthropic
                
                kwargs = {}
                if self.api_key:
                    kwargs["api_key"] = self.api_key
                
                self._client = AsyncAnthropic(**kwargs)
            except ImportError:
                raise ImportError("anthropic package required. Install with: pip install anthropic")
        
        return self._client
    
    async def complete(
        self,
        messages: List[Dict[str, str]],
        operation: str = "chat",
        **kwargs,
    ) -> LLMResponse:
        """Make a completion request to Anthropic."""
        import time
        
        # Check budget
        await self._check_budget(messages)
        
        client = self._get_client()
        start_time = time.time()
        
        # Convert messages format for Anthropic
        system_message = None
        anthropic_messages = []
        
        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                anthropic_messages.append({
                    "role": msg["role"],
                    "content": msg["content"],
                })
        
        try:
            response = await client.messages.create(
                model=self.config.model,
                messages=anthropic_messages,
                system=system_message,
                max_tokens=kwargs.get("max_tokens", self.config.max_tokens),
                temperature=kwargs.get("temperature", self.config.temperature),
            )
            
            latency_ms = (time.time() - start_time) * 1000
            
            # Extract usage
            usage = TokenUsage.from_anthropic_response(response)
            
            # Record usage
            await self._record_usage(usage, operation)
            
            # Extract content
            content = ""
            if response.content:
                content = response.content[0].text if response.content else ""
            
            return LLMResponse(
                content=content,
                model=response.model,
                usage=usage,
                finish_reason=response.stop_reason,
                raw_response=response,
                latency_ms=latency_ms,
            )
            
        except Exception as e:
            if "rate_limit" in str(e).lower():
                raise LLMRateLimitException(f"Anthropic rate limit: {str(e)}")
            raise
    
    async def stream_complete(
        self,
        messages: List[Dict[str, str]],
        operation: str = "chat",
        **kwargs,
    ) -> AsyncGenerator[LLMResponse, None]:
        """Make a streaming completion request to Anthropic."""
        # Check budget
        await self._check_budget(messages)
        
        client = self._get_client()
        
        # Convert messages format
        system_message = None
        anthropic_messages = []
        
        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                anthropic_messages.append({
                    "role": msg["role"],
                    "content": msg["content"],
                })
        
        try:
            async with client.messages.stream(
                model=self.config.model,
                messages=anthropic_messages,
                system=system_message,
                max_tokens=kwargs.get("max_tokens", self.config.max_tokens),
                temperature=kwargs.get("temperature", self.config.temperature),
            ) as stream:
                accumulated_content = ""
                chunk_index = 0
                prompt_tokens = count_messages_tokens(messages, self.config.model)
                
                async for text in stream.text_stream:
                    accumulated_content += text
                    
                    yield LLMResponse(
                        content=text,
                        model=self.config.model,
                        usage=TokenUsage(prompt_tokens=0, completion_tokens=1),
                        finish_reason=None,
                        is_complete=False,
                        chunk_index=chunk_index,
                    )
                    
                    chunk_index += 1
                
                # Final response with usage
                final_message = await stream.get_final_message()
                usage = TokenUsage.from_anthropic_response(final_message)
                
                # Record usage
                await self._record_usage(usage, operation)
                
                yield LLMResponse(
                    content="",
                    model=self.config.model,
                    usage=usage,
                    finish_reason=final_message.stop_reason,
                    is_complete=True,
                    chunk_index=chunk_index,
                )
                
        except Exception as e:
            if "rate_limit" in str(e).lower():
                raise LLMRateLimitException(f"Anthropic rate limit: {str(e)}")
            raise


def create_llm_client(
    model: str,
    provider: str = None,
    budget_service: BudgetService = None,
    **kwargs,
) -> BaseLLMClient:
    """
    Factory function to create appropriate LLM client.
    
    Args:
        model: Model identifier
        provider: Provider override (auto-detected if not provided)
        budget_service: Budget service for tracking
        **kwargs: Additional configuration
    
    Returns:
        Configured LLM client
    """
    # Auto-detect provider from model name
    if provider is None:
        if "gpt" in model.lower() or "o1" in model.lower():
            provider = LLMProvider.OPENAI
        elif "claude" in model.lower():
            provider = LLMProvider.ANTHROPIC
        else:
            provider = LLMProvider.OPENAI  # Default
    else:
        provider = LLMProvider(provider)
    
    config = LLMConfig(
        model=model,
        provider=provider,
        **{k: v for k, v in kwargs.items() if k in LLMConfig.__dataclass_fields__},
    )
    
    if provider == LLMProvider.OPENAI:
        return OpenAIClient(
            config=config,
            api_key=kwargs.get("api_key"),
            base_url=kwargs.get("base_url"),
            budget_service=budget_service,
        )
    elif provider == LLMProvider.ANTHROPIC:
        return AnthropicClient(
            config=config,
            api_key=kwargs.get("api_key"),
            budget_service=budget_service,
        )
    else:
        raise ValueError(f"Unsupported provider: {provider}")



















