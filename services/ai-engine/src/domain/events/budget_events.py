"""
VITAL Path - Budget Domain Events

Events related to token budget management.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class BudgetEvent:
    """Base class for budget events."""
    tenant_id: str
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass(frozen=True)
class BudgetExceededEvent(BudgetEvent):
    """Event raised when a tenant exceeds their token budget."""
    monthly_limit: int = 0
    monthly_used: int = 0
    requested_tokens: int = 0
    user_id: Optional[str] = None
    request_type: Optional[str] = None
    
    @property
    def message(self) -> str:
        return (
            f"Token budget exceeded for tenant {self.tenant_id}. "
            f"Limit: {self.monthly_limit:,}, Used: {self.monthly_used:,}, "
            f"Requested: {self.requested_tokens:,}"
        )


@dataclass(frozen=True)
class BudgetWarningEvent(BudgetEvent):
    """Event raised when a tenant approaches their budget limit."""
    monthly_limit: int = 0
    monthly_used: int = 0
    percent_used: float = 0.0
    warning_threshold: float = 80.0
    
    @property
    def message(self) -> str:
        return (
            f"Budget warning for tenant {self.tenant_id}: "
            f"{self.percent_used:.1f}% used ({self.monthly_used:,}/{self.monthly_limit:,} tokens)"
        )


@dataclass(frozen=True)
class BudgetResetEvent(BudgetEvent):
    """Event raised when a tenant's budget resets (monthly)."""
    previous_usage: int = 0
    new_limit: int = 0
    
    @property
    def message(self) -> str:
        return (
            f"Budget reset for tenant {self.tenant_id}. "
            f"Previous usage: {self.previous_usage:,}, New limit: {self.new_limit:,}"
        )


@dataclass(frozen=True)
class UsageRecordedEvent(BudgetEvent):
    """Event raised when token usage is recorded."""
    user_id: str = ""
    model: str = ""
    tokens_used: int = 0
    cost_usd: float = 0.0
    request_type: str = "unknown"
    request_id: Optional[str] = None
    
    @property
    def message(self) -> str:
        return (
            f"Recorded {self.tokens_used:,} tokens (${self.cost_usd:.4f}) "
            f"for {self.model} in tenant {self.tenant_id}"
        )






