"""
VITAL Path - LLM Usage Tracking

Wraps LLM calls to automatically track token usage.
Records usage to database for billing and analytics.
"""

import logging
from datetime import datetime
from typing import Optional, Dict, Any, Callable
from functools import wraps

from core.context import get_request_context
from domain.value_objects.token_usage import TokenUsage
from domain.services.budget_service import BudgetService

logger = logging.getLogger(__name__)


class TokenTracker:
    """
    Tracks token usage for LLM calls.
    
    Usage:
        tracker = TokenTracker()
        
        # After an LLM call
        usage = TokenUsage.from_openai_response(response)
        await tracker.record(usage, model="gpt-4", operation="ask_expert")
    """
    
    def __init__(self, budget_service: BudgetService = None):
        self.budget_service = budget_service or BudgetService()
    
    async def record(
        self,
        usage: TokenUsage,
        model: str,
        operation: str,
        metadata: Dict[str, Any] = None,
    ) -> None:
        """
        Record token usage to database.
        
        Args:
            usage: TokenUsage value object with token counts
            model: Model identifier (e.g., "gpt-4", "claude-3-opus")
            operation: Operation type (e.g., "ask_expert", "panel_simulate")
            metadata: Additional context (conversation_id, etc.)
        """
        context = get_request_context()
        
        if not context:
            logger.warning("Cannot record usage without request context")
            return
        
        try:
            await self.budget_service.record_usage(
                tenant_id=context.tenant_id,
                user_id=context.user_id,
                model=model,
                usage=usage,
                operation=operation,
                metadata=metadata or {},
            )
            
            logger.debug(
                f"Recorded usage: tenant={context.tenant_id} "
                f"user={context.user_id} model={model} "
                f"tokens={usage.total_tokens}"
            )
            
        except Exception as e:
            # Log but don't fail - usage tracking is not critical path
            logger.exception(f"Failed to record token usage: {str(e)}")
    
    async def estimate_and_check(
        self,
        prompt_tokens: int,
        model: str,
    ) -> bool:
        """
        Estimate completion tokens and check if within budget.
        
        Returns True if the request should proceed.
        """
        context = get_request_context()
        
        if not context:
            return True  # No context = no budget check
        
        # Estimate completion tokens (typically 1-2x prompt)
        estimated_completion = prompt_tokens * 2
        estimated_total = prompt_tokens + estimated_completion
        
        budget_check = await self.budget_service.check_budget(
            tenant_id=context.tenant_id,
            user_id=context.user_id,
            estimated_tokens=estimated_total,
        )
        
        return budget_check.can_proceed


def track_llm_usage(model: str, operation: str):
    """
    Decorator to automatically track LLM usage for a function.
    
    Usage:
        @track_llm_usage(model="gpt-4", operation="ask_expert")
        async def call_openai(prompt: str) -> dict:
            response = await openai.chat.completions.create(...)
            return response
    
    The decorated function MUST return a response object with usage info.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            tracker = TokenTracker()
            
            # Call the LLM function
            response = await func(*args, **kwargs)
            
            # Extract and record usage
            try:
                # Handle OpenAI-style response
                if hasattr(response, 'usage'):
                    usage = TokenUsage.from_openai_response(response)
                    await tracker.record(usage, model=model, operation=operation)
                
                # Handle Anthropic-style response
                elif hasattr(response, 'usage') and hasattr(response.usage, 'input_tokens'):
                    usage = TokenUsage.from_anthropic_response(response)
                    await tracker.record(usage, model=model, operation=operation)
                
                # Handle dict response
                elif isinstance(response, dict) and 'usage' in response:
                    usage_data = response['usage']
                    usage = TokenUsage(
                        prompt_tokens=usage_data.get('prompt_tokens', 0),
                        completion_tokens=usage_data.get('completion_tokens', 0),
                    )
                    await tracker.record(usage, model=model, operation=operation)
                    
            except Exception as e:
                logger.warning(f"Could not extract usage from response: {str(e)}")
            
            return response
        
        return wrapper
    return decorator


class TrackedLLMClient:
    """
    Wrapper for LLM clients that automatically tracks usage.
    
    Usage:
        # Wrap your OpenAI client
        client = TrackedLLMClient(openai_client, model="gpt-4")
        
        # All calls are automatically tracked
        response = await client.chat_completion(messages, operation="ask_expert")
    """
    
    def __init__(
        self,
        client: Any,
        model: str,
        budget_service: BudgetService = None,
    ):
        self.client = client
        self.model = model
        self.tracker = TokenTracker(budget_service)
    
    async def chat_completion(
        self,
        messages: list,
        operation: str,
        **kwargs,
    ) -> Any:
        """
        Make a chat completion call with automatic tracking.
        """
        # Check budget before making call
        prompt_tokens = self._estimate_prompt_tokens(messages)
        can_proceed = await self.tracker.estimate_and_check(prompt_tokens, self.model)
        
        if not can_proceed:
            from domain.exceptions import BudgetExceededException
            raise BudgetExceededException(
                f"Token budget exceeded for model {self.model}"
            )
        
        # Make the actual call
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            **kwargs,
        )
        
        # Record usage
        if hasattr(response, 'usage'):
            usage = TokenUsage.from_openai_response(response)
            await self.tracker.record(
                usage,
                model=self.model,
                operation=operation,
                metadata={"message_count": len(messages)},
            )
        
        return response
    
    def _estimate_prompt_tokens(self, messages: list) -> int:
        """
        Estimate tokens in prompt messages.
        
        Uses a simple heuristic: ~4 chars per token.
        For production, use tiktoken for accurate counting.
        """
        total_chars = sum(
            len(m.get("content", "") or "")
            for m in messages
        )
        return total_chars // 4


