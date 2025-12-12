"""
LLM Cost Tracking Module.

This module provides comprehensive cost tracking for LLM operations:
- Per-request cost calculation based on token usage
- Session/user/organization level aggregation
- Budget management with warnings and limits
- Cost estimation before execution
- Historical cost analytics

Pricing data is maintained separately and can be updated without code changes.
"""

from typing import Any, Callable, Coroutine, Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from functools import wraps
from collections import defaultdict
import asyncio
import uuid
import structlog

logger = structlog.get_logger()


# ============================================================================
# Pricing Configuration
# ============================================================================

@dataclass(frozen=True)
class ModelPricing:
    """Pricing for a specific model (per 1K tokens)."""
    model_id: str
    provider: str
    input_cost_per_1k: float  # Cost per 1K input/prompt tokens
    output_cost_per_1k: float  # Cost per 1K output/completion tokens
    display_name: Optional[str] = None

    def calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Calculate total cost for given token counts."""
        input_cost = (input_tokens / 1000) * self.input_cost_per_1k
        output_cost = (output_tokens / 1000) * self.output_cost_per_1k
        return round(input_cost + output_cost, 6)


# Default pricing table (December 2024 prices)
# Update these as prices change
DEFAULT_PRICING: Dict[str, ModelPricing] = {
    # OpenAI
    "gpt-4": ModelPricing("gpt-4", "openai", 0.03, 0.06, "GPT-4"),
    "gpt-4-turbo": ModelPricing("gpt-4-turbo", "openai", 0.01, 0.03, "GPT-4 Turbo"),
    "gpt-4-turbo-preview": ModelPricing("gpt-4-turbo-preview", "openai", 0.01, 0.03, "GPT-4 Turbo Preview"),
    "gpt-4o": ModelPricing("gpt-4o", "openai", 0.005, 0.015, "GPT-4o"),
    "gpt-4o-mini": ModelPricing("gpt-4o-mini", "openai", 0.00015, 0.0006, "GPT-4o Mini"),
    "gpt-3.5-turbo": ModelPricing("gpt-3.5-turbo", "openai", 0.0005, 0.0015, "GPT-3.5 Turbo"),
    "gpt-3.5-turbo-16k": ModelPricing("gpt-3.5-turbo-16k", "openai", 0.003, 0.004, "GPT-3.5 Turbo 16K"),

    # Anthropic
    "claude-3-opus": ModelPricing("claude-3-opus", "anthropic", 0.015, 0.075, "Claude 3 Opus"),
    "claude-3-opus-20240229": ModelPricing("claude-3-opus-20240229", "anthropic", 0.015, 0.075, "Claude 3 Opus"),
    "claude-3-sonnet": ModelPricing("claude-3-sonnet", "anthropic", 0.003, 0.015, "Claude 3 Sonnet"),
    "claude-3-sonnet-20240229": ModelPricing("claude-3-sonnet-20240229", "anthropic", 0.003, 0.015, "Claude 3 Sonnet"),
    "claude-3-haiku": ModelPricing("claude-3-haiku", "anthropic", 0.00025, 0.00125, "Claude 3 Haiku"),
    "claude-3-haiku-20240307": ModelPricing("claude-3-haiku-20240307", "anthropic", 0.00025, 0.00125, "Claude 3 Haiku"),
    "claude-3.5-sonnet": ModelPricing("claude-3.5-sonnet", "anthropic", 0.003, 0.015, "Claude 3.5 Sonnet"),
    "claude-3-5-sonnet-20241022": ModelPricing("claude-3-5-sonnet-20241022", "anthropic", 0.003, 0.015, "Claude 3.5 Sonnet"),

    # Default fallback
    "default": ModelPricing("default", "unknown", 0.01, 0.03, "Default"),
}


def get_model_pricing(model_id: str) -> ModelPricing:
    """Get pricing for a model, with fallback to default."""
    # Normalize model ID
    normalized = model_id.lower().replace("-", "_").replace(".", "_")

    # Try exact match first
    if model_id in DEFAULT_PRICING:
        return DEFAULT_PRICING[model_id]

    # Try prefix matching (e.g., "gpt-4-0613" -> "gpt-4")
    for key in DEFAULT_PRICING:
        if model_id.startswith(key) or normalized.startswith(key.replace("-", "_")):
            return DEFAULT_PRICING[key]

    # Return default
    logger.warning("unknown_model_pricing", model_id=model_id, using="default")
    return DEFAULT_PRICING["default"]


# ============================================================================
# Cost Records
# ============================================================================

@dataclass
class CostRecord:
    """Record of a single LLM call cost."""
    id: str
    timestamp: datetime
    model_id: str
    provider: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    input_cost: float
    output_cost: float
    total_cost: float

    # Context
    organization_id: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    operation: Optional[str] = None  # e.g., "mode1_chat", "mode3_research"

    # Additional metadata
    latency_ms: Optional[int] = None
    cached: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "model_id": self.model_id,
            "provider": self.provider,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "input_cost": self.input_cost,
            "output_cost": self.output_cost,
            "total_cost": self.total_cost,
            "organization_id": self.organization_id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "request_id": self.request_id,
            "operation": self.operation,
            "latency_ms": self.latency_ms,
            "cached": self.cached,
            "metadata": self.metadata,
        }


@dataclass
class CostSummary:
    """Aggregated cost summary."""
    total_cost: float = 0.0
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    total_requests: int = 0
    cached_requests: int = 0
    cost_by_model: Dict[str, float] = field(default_factory=dict)
    cost_by_operation: Dict[str, float] = field(default_factory=dict)
    first_timestamp: Optional[datetime] = None
    last_timestamp: Optional[datetime] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "total_cost": round(self.total_cost, 6),
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_requests": self.total_requests,
            "cached_requests": self.cached_requests,
            "cache_hit_rate": round(self.cached_requests / self.total_requests, 3) if self.total_requests > 0 else 0,
            "average_cost_per_request": round(self.total_cost / self.total_requests, 6) if self.total_requests > 0 else 0,
            "cost_by_model": {k: round(v, 6) for k, v in self.cost_by_model.items()},
            "cost_by_operation": {k: round(v, 6) for k, v in self.cost_by_operation.items()},
            "period": {
                "start": self.first_timestamp.isoformat() if self.first_timestamp else None,
                "end": self.last_timestamp.isoformat() if self.last_timestamp else None,
            }
        }


# ============================================================================
# Budget Management
# ============================================================================

class BudgetStatus(Enum):
    """Budget status levels."""
    OK = "ok"
    WARNING = "warning"  # 80% used
    CRITICAL = "critical"  # 95% used
    EXCEEDED = "exceeded"  # 100% used


@dataclass
class Budget:
    """Budget configuration and state."""
    limit: float  # Dollar amount
    period: str = "daily"  # daily, weekly, monthly, total
    warning_threshold: float = 0.8  # 80%
    critical_threshold: float = 0.95  # 95%
    current_spend: float = 0.0
    period_start: Optional[datetime] = None

    @property
    def remaining(self) -> float:
        return max(0, self.limit - self.current_spend)

    @property
    def usage_percentage(self) -> float:
        if self.limit <= 0:
            return 0.0
        return self.current_spend / self.limit

    @property
    def status(self) -> BudgetStatus:
        pct = self.usage_percentage
        if pct >= 1.0:
            return BudgetStatus.EXCEEDED
        elif pct >= self.critical_threshold:
            return BudgetStatus.CRITICAL
        elif pct >= self.warning_threshold:
            return BudgetStatus.WARNING
        return BudgetStatus.OK

    def to_dict(self) -> Dict[str, Any]:
        return {
            "limit": self.limit,
            "period": self.period,
            "current_spend": round(self.current_spend, 6),
            "remaining": round(self.remaining, 6),
            "usage_percentage": round(self.usage_percentage * 100, 1),
            "status": self.status.value,
            "period_start": self.period_start.isoformat() if self.period_start else None,
        }


# ============================================================================
# Cost Tracker
# ============================================================================

class CostTracker:
    """
    Main cost tracking service.

    Tracks costs at multiple levels:
    - Global (all requests)
    - Per organization
    - Per user
    - Per session

    Features:
    - Real-time cost calculation
    - Budget enforcement
    - Cost estimation
    - Analytics and reporting
    """

    def __init__(
        self,
        pricing: Optional[Dict[str, ModelPricing]] = None,
        persist_fn: Optional[Callable[[CostRecord], Coroutine[Any, Any, None]]] = None,
    ):
        """
        Initialize cost tracker.

        Args:
            pricing: Custom pricing table (uses DEFAULT_PRICING if not provided)
            persist_fn: Async function to persist cost records (e.g., to database)
        """
        self._pricing = pricing or DEFAULT_PRICING
        self._persist_fn = persist_fn
        self._records: List[CostRecord] = []  # In-memory buffer
        self._budgets: Dict[str, Budget] = {}  # key -> Budget
        self._lock = asyncio.Lock()

        # Aggregated metrics
        self._total_cost = 0.0
        self._total_tokens = 0
        self._request_count = 0

    def get_pricing(self, model_id: str) -> ModelPricing:
        """Get pricing for a model."""
        if model_id in self._pricing:
            return self._pricing[model_id]
        return get_model_pricing(model_id)

    def estimate_cost(
        self,
        model_id: str,
        estimated_input_tokens: int,
        estimated_output_tokens: int
    ) -> float:
        """
        Estimate cost before making an LLM call.

        Useful for budget checks and displaying expected costs to users.
        """
        pricing = self.get_pricing(model_id)
        return pricing.calculate_cost(estimated_input_tokens, estimated_output_tokens)

    async def record_cost(
        self,
        model_id: str,
        input_tokens: int,
        output_tokens: int,
        organization_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        request_id: Optional[str] = None,
        operation: Optional[str] = None,
        latency_ms: Optional[int] = None,
        cached: bool = False,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> CostRecord:
        """
        Record cost for an LLM call.

        Args:
            model_id: The model used
            input_tokens: Number of input/prompt tokens
            output_tokens: Number of output/completion tokens
            organization_id: Organization making the request
            user_id: User making the request
            session_id: Session identifier
            request_id: Unique request identifier
            operation: Type of operation (e.g., "mode1_chat")
            latency_ms: Request latency in milliseconds
            cached: Whether this was a cache hit (costs $0)
            metadata: Additional metadata

        Returns:
            CostRecord with calculated costs
        """
        pricing = self.get_pricing(model_id)

        # Cached requests have no cost
        if cached:
            input_cost = output_cost = total_cost = 0.0
        else:
            input_cost = (input_tokens / 1000) * pricing.input_cost_per_1k
            output_cost = (output_tokens / 1000) * pricing.output_cost_per_1k
            total_cost = input_cost + output_cost

        record = CostRecord(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            model_id=model_id,
            provider=pricing.provider,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
            input_cost=round(input_cost, 6),
            output_cost=round(output_cost, 6),
            total_cost=round(total_cost, 6),
            organization_id=organization_id,
            user_id=user_id,
            session_id=session_id,
            request_id=request_id,
            operation=operation,
            latency_ms=latency_ms,
            cached=cached,
            metadata=metadata or {},
        )

        async with self._lock:
            # Update aggregates
            self._records.append(record)
            self._total_cost += record.total_cost
            self._total_tokens += record.total_tokens
            self._request_count += 1

            # Update budgets
            budget_keys = []
            if organization_id:
                budget_keys.append(f"org:{organization_id}")
            if user_id:
                budget_keys.append(f"user:{user_id}")
            if session_id:
                budget_keys.append(f"session:{session_id}")

            for key in budget_keys:
                if key in self._budgets:
                    self._budgets[key].current_spend += record.total_cost

        # Persist asynchronously
        if self._persist_fn and not cached:
            try:
                await self._persist_fn(record)
            except Exception as e:
                logger.error("cost_persist_failed", error=str(e), record_id=record.id)

        # Log
        logger.info(
            "cost_recorded",
            model=model_id,
            tokens=record.total_tokens,
            cost=record.total_cost,
            cached=cached,
            operation=operation,
        )

        return record

    def set_budget(
        self,
        key: str,
        limit: float,
        period: str = "daily",
        warning_threshold: float = 0.8,
        critical_threshold: float = 0.95,
    ) -> Budget:
        """
        Set a budget for an organization, user, or session.

        Args:
            key: Budget identifier (e.g., "org:uuid", "user:uuid", "session:uuid")
            limit: Dollar amount limit
            period: Budget period (daily, weekly, monthly, total)
            warning_threshold: Percentage for warning (default 0.8 = 80%)
            critical_threshold: Percentage for critical (default 0.95 = 95%)
        """
        budget = Budget(
            limit=limit,
            period=period,
            warning_threshold=warning_threshold,
            critical_threshold=critical_threshold,
            period_start=datetime.utcnow(),
        )
        self._budgets[key] = budget
        logger.info("budget_set", key=key, limit=limit, period=period)
        return budget

    def get_budget(self, key: str) -> Optional[Budget]:
        """Get budget status for a key."""
        return self._budgets.get(key)

    def check_budget(self, key: str, estimated_cost: float = 0.0) -> Tuple[bool, BudgetStatus]:
        """
        Check if a request would exceed budget.

        Args:
            key: Budget key to check
            estimated_cost: Estimated cost of the upcoming request

        Returns:
            (allowed, status) - Whether request is allowed and current status
        """
        budget = self._budgets.get(key)
        if not budget:
            return True, BudgetStatus.OK

        projected = budget.current_spend + estimated_cost
        if projected >= budget.limit:
            return False, BudgetStatus.EXCEEDED

        return True, budget.status

    def get_summary(
        self,
        organization_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        since: Optional[datetime] = None,
    ) -> CostSummary:
        """
        Get cost summary with optional filters.

        Args:
            organization_id: Filter by organization
            user_id: Filter by user
            session_id: Filter by session
            since: Only include records after this time
        """
        summary = CostSummary()

        for record in self._records:
            # Apply filters
            if organization_id and record.organization_id != organization_id:
                continue
            if user_id and record.user_id != user_id:
                continue
            if session_id and record.session_id != session_id:
                continue
            if since and record.timestamp < since:
                continue

            # Update summary
            summary.total_cost += record.total_cost
            summary.total_input_tokens += record.input_tokens
            summary.total_output_tokens += record.output_tokens
            summary.total_requests += 1

            if record.cached:
                summary.cached_requests += 1

            # By model
            if record.model_id not in summary.cost_by_model:
                summary.cost_by_model[record.model_id] = 0.0
            summary.cost_by_model[record.model_id] += record.total_cost

            # By operation
            if record.operation:
                if record.operation not in summary.cost_by_operation:
                    summary.cost_by_operation[record.operation] = 0.0
                summary.cost_by_operation[record.operation] += record.total_cost

            # Timestamps
            if summary.first_timestamp is None or record.timestamp < summary.first_timestamp:
                summary.first_timestamp = record.timestamp
            if summary.last_timestamp is None or record.timestamp > summary.last_timestamp:
                summary.last_timestamp = record.timestamp

        return summary

    def get_metrics(self) -> Dict[str, Any]:
        """Get overall cost metrics."""
        return {
            "total_cost": round(self._total_cost, 6),
            "total_tokens": self._total_tokens,
            "total_requests": self._request_count,
            "average_cost_per_request": round(self._total_cost / self._request_count, 6) if self._request_count > 0 else 0,
            "records_in_memory": len(self._records),
            "active_budgets": len(self._budgets),
        }

    async def flush_records(self, keep_last_n: int = 100) -> int:
        """
        Clear old records from memory, keeping the most recent N.

        Returns number of records flushed.
        """
        async with self._lock:
            if len(self._records) <= keep_last_n:
                return 0

            flushed = len(self._records) - keep_last_n
            self._records = self._records[-keep_last_n:]
            return flushed


# ============================================================================
# Decorator for Automatic Cost Tracking
# ============================================================================

def track_cost(
    operation: Optional[str] = None,
    model_param: str = "model",
) -> Callable:
    """
    Decorator to automatically track costs for LLM call functions.

    Expects the decorated function to return a dict or object with:
    - usage.prompt_tokens or input_tokens
    - usage.completion_tokens or output_tokens

    Example:
        @track_cost(operation="mode1_chat")
        async def call_llm(model: str, messages: List[dict]) -> dict:
            response = await client.chat(model=model, messages=messages)
            return response

    Args:
        operation: Operation name for categorization
        model_param: Name of the model parameter in function signature
    """
    def decorator(func: Callable[..., Coroutine[Any, Any, Any]]) -> Callable[..., Coroutine[Any, Any, Any]]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Get model from kwargs or args
            model_id = kwargs.get(model_param, "unknown")

            # Call the function
            start_time = datetime.utcnow()
            result = await func(*args, **kwargs)
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Extract token usage from result
            input_tokens = 0
            output_tokens = 0

            if isinstance(result, dict):
                usage = result.get("usage", {})
                input_tokens = usage.get("prompt_tokens", 0) or usage.get("input_tokens", 0)
                output_tokens = usage.get("completion_tokens", 0) or usage.get("output_tokens", 0)
            elif hasattr(result, "usage"):
                usage = result.usage
                if hasattr(usage, "prompt_tokens"):
                    input_tokens = usage.prompt_tokens
                if hasattr(usage, "completion_tokens"):
                    output_tokens = usage.completion_tokens

            # Record cost
            if input_tokens > 0 or output_tokens > 0:
                tracker = get_cost_tracker()
                await tracker.record_cost(
                    model_id=model_id,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    operation=operation or func.__name__,
                    latency_ms=latency_ms,
                )

            return result

        return wrapper
    return decorator


# ============================================================================
# Global Instance
# ============================================================================

_cost_tracker: Optional[CostTracker] = None


def get_cost_tracker(persist_fn: Optional[Callable] = None) -> CostTracker:
    """Get or create the global cost tracker instance."""
    global _cost_tracker
    if _cost_tracker is None:
        _cost_tracker = CostTracker(persist_fn=persist_fn)
    return _cost_tracker


def reset_cost_tracker() -> None:
    """Reset the global cost tracker (for testing)."""
    global _cost_tracker
    _cost_tracker = None
