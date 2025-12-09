"""
VITAL Path - Token Usage Value Object

Immutable value object representing token usage from an LLM call.
"""

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional, Dict, Any
from datetime import datetime


@dataclass(frozen=True)
class TokenUsage:
    """
    Immutable record of token usage from an LLM call.
    
    This is a value object - two TokenUsage instances with the same
    values are considered equal.
    """
    
    # Required fields
    tenant_id: str
    user_id: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    
    # Derived/calculated fields
    total_tokens: int = field(default=0)
    cost_usd: Decimal = field(default=Decimal("0"))
    
    # Context
    request_type: str = "unknown"  # 'expert', 'panel', 'workflow', 'knowledge'
    request_id: Optional[str] = None
    
    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        """Calculate derived fields if not provided."""
        if self.total_tokens == 0:
            object.__setattr__(
                self,
                "total_tokens",
                self.prompt_tokens + self.completion_tokens
            )
    
    @classmethod
    def from_openai_response(
        cls,
        response,
        tenant_id: str,
        user_id: str,
        model: str,
        request_type: str = "unknown",
        request_id: Optional[str] = None,
    ) -> "TokenUsage":
        """
        Create TokenUsage from an OpenAI API response.
        
        Args:
            response: OpenAI ChatCompletion response
            tenant_id: Tenant identifier
            user_id: User identifier
            model: Model used
            request_type: Type of request
            request_id: Optional request ID
        
        Returns:
            TokenUsage instance
        """
        usage = response.usage
        
        # Calculate cost
        cost = cls._calculate_cost(
            model,
            usage.prompt_tokens,
            usage.completion_tokens,
        )
        
        return cls(
            tenant_id=tenant_id,
            user_id=user_id,
            model=model,
            prompt_tokens=usage.prompt_tokens,
            completion_tokens=usage.completion_tokens,
            total_tokens=usage.total_tokens,
            cost_usd=cost,
            request_type=request_type,
            request_id=request_id,
        )
    
    @classmethod
    def from_anthropic_response(
        cls,
        response,
        tenant_id: str,
        user_id: str,
        model: str,
        request_type: str = "unknown",
        request_id: Optional[str] = None,
    ) -> "TokenUsage":
        """
        Create TokenUsage from an Anthropic API response.
        
        Args:
            response: Anthropic Message response
            tenant_id: Tenant identifier
            user_id: User identifier
            model: Model used
            request_type: Type of request
            request_id: Optional request ID
        
        Returns:
            TokenUsage instance
        """
        usage = response.usage
        
        # Calculate cost
        cost = cls._calculate_cost(
            model,
            usage.input_tokens,
            usage.output_tokens,
        )
        
        return cls(
            tenant_id=tenant_id,
            user_id=user_id,
            model=model,
            prompt_tokens=usage.input_tokens,
            completion_tokens=usage.output_tokens,
            total_tokens=usage.input_tokens + usage.output_tokens,
            cost_usd=cost,
            request_type=request_type,
            request_id=request_id,
        )
    
    @staticmethod
    def _calculate_cost(
        model: str,
        prompt_tokens: int,
        completion_tokens: int,
    ) -> Decimal:
        """Calculate cost in USD."""
        # Cost per 1K tokens
        MODEL_COSTS = {
            "gpt-4-turbo": {"prompt": 0.01, "completion": 0.03},
            "gpt-4o": {"prompt": 0.005, "completion": 0.015},
            "gpt-4o-mini": {"prompt": 0.00015, "completion": 0.0006},
            "gpt-3.5-turbo": {"prompt": 0.0005, "completion": 0.0015},
            "claude-3-opus-20240229": {"prompt": 0.015, "completion": 0.075},
            "claude-3-sonnet-20240229": {"prompt": 0.003, "completion": 0.015},
            "claude-3-haiku-20240307": {"prompt": 0.00025, "completion": 0.00125},
        }
        
        # Find matching model (handle version suffixes)
        costs = None
        for key in MODEL_COSTS:
            if key in model or model in key:
                costs = MODEL_COSTS[key]
                break
        
        if not costs:
            costs = MODEL_COSTS["gpt-4-turbo"]  # Default pricing
        
        prompt_cost = (prompt_tokens / 1000) * costs["prompt"]
        completion_cost = (completion_tokens / 1000) * costs["completion"]
        
        return Decimal(str(round(prompt_cost + completion_cost, 6)))
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "model": self.model,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "cost_usd": float(self.cost_usd),
            "request_type": self.request_type,
            "request_id": self.request_id,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
        }


