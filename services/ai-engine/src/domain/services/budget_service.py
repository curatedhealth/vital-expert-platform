"""
VITAL Path - Budget Service

Manages token budgets for organizations and users.
Prevents runaway costs from recursive agents or infinite loops.

Key Responsibilities:
1. Check if a request can proceed given budget constraints
2. Estimate token usage for a request
3. Record actual usage after LLM calls
4. Provide usage analytics

IMPORTANT: Uses organization_id to match production RLS policies.
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any
from decimal import Decimal
import logging

from domain.value_objects.token_usage import TokenUsage
from domain.events.budget_events import BudgetExceededEvent, BudgetWarningEvent
from domain.exceptions import BudgetExceededException, OrganizationContextRequiredException

logger = logging.getLogger(__name__)


@dataclass
class BudgetCheck:
    """Result of a budget check."""
    monthly_limit: int
    monthly_used: int
    remaining: int
    can_proceed: bool
    percent_used: float
    warning_threshold_reached: bool = False
    
    @property
    def is_near_limit(self) -> bool:
        """Check if usage is above 80%."""
        return self.percent_used >= 80.0


@dataclass
class UsageSummary:
    """Summary of token usage for a period."""
    period_start: str
    period_end: str
    total_tokens: int
    total_cost_usd: Decimal
    by_model: Dict[str, Dict[str, Any]]
    by_request_type: Dict[str, Dict[str, Any]]


class BudgetService:
    """
    Service for managing token budgets.
    
    Usage:
        budget_service = BudgetService(db_connection)
        
        # Before making an LLM call
        budget_service.enforce_budget(organization_id, estimated_tokens=1000)
        
        # After the LLM call
        budget_service.record_usage(token_usage)
    
    IMPORTANT: Uses organization_id to match production RLS policies.
    """
    
    # Default monthly limit (1M tokens ≈ $10-30 depending on model)
    DEFAULT_MONTHLY_LIMIT = 1_000_000
    
    # Warning threshold (percentage)
    WARNING_THRESHOLD = 80.0
    
    def __init__(self, db_connection):
        """
        Initialize the budget service.
        
        Args:
            db_connection: Database connection for querying usage
        """
        self.db = db_connection
    
    def check_budget(
        self,
        organization_id: str,
        estimated_tokens: int = 0,
        user_id: str = None,
        # Legacy parameter alias
        tenant_id: str = None,
    ) -> BudgetCheck:
        """
        Check if the organization has budget for a request.
        
        Args:
            organization_id: The organization identifier (matches RLS)
            estimated_tokens: Estimated tokens for the request
            user_id: Optional user ID for user-level budget checks
            tenant_id: DEPRECATED - use organization_id instead
        
        Returns:
            BudgetCheck with current budget status
        """
        # Support legacy tenant_id parameter
        org_id = organization_id or tenant_id
        
        if not org_id:
            raise OrganizationContextRequiredException(
                "Organization context is required for budget check"
            )
        
        # Query the database for budget status
        # Note: check_token_budget uses auth.uid() internally if user_id not provided
        result = self.db.execute(
            "SELECT * FROM check_token_budget(%s, %s)",
            [user_id, estimated_tokens]  # User-based budget check
        ).fetchone()
        
        if result:
            return BudgetCheck(
                monthly_limit=result["monthly_limit"] or self.DEFAULT_MONTHLY_LIMIT,
                monthly_used=result["current_usage"] or 0,
                remaining=result["remaining"] or self.DEFAULT_MONTHLY_LIMIT,
                can_proceed=result["allowed"],
                percent_used=float(result["usage_percentage"] or 0),
                warning_threshold_reached=float(result["usage_percentage"] or 0) >= self.WARNING_THRESHOLD,
            )
        
        # Default response if no data
        return BudgetCheck(
            monthly_limit=self.DEFAULT_MONTHLY_LIMIT,
            monthly_used=0,
            remaining=self.DEFAULT_MONTHLY_LIMIT,
            can_proceed=True,
            percent_used=0.0,
        )
    
    def enforce_budget(
        self,
        organization_id: str,
        estimated_tokens: int,
        raise_on_warning: bool = False,
        user_id: str = None,
        # Legacy parameter alias
        tenant_id: str = None,
    ) -> BudgetCheck:
        """
        Enforce budget constraints. Raises if budget exceeded.
        
        Args:
            organization_id: The organization identifier (matches RLS)
            estimated_tokens: Estimated tokens for the request
            raise_on_warning: Whether to raise on warning threshold
            user_id: Optional user ID for user-level budget checks
            tenant_id: DEPRECATED - use organization_id instead
        
        Returns:
            BudgetCheck if within budget
        
        Raises:
            BudgetExceededException: If budget would be exceeded
        """
        org_id = organization_id or tenant_id
        check = self.check_budget(org_id, estimated_tokens, user_id)
        
        if not check.can_proceed:
            logger.warning(
                f"Budget exceeded for organization {org_id}: "
                f"{check.monthly_used}/{check.monthly_limit} tokens used"
            )
            raise BudgetExceededException(
                f"Monthly token budget exceeded. "
                f"Limit: {check.monthly_limit:,}, "
                f"Used: {check.monthly_used:,}, "
                f"Requested: {estimated_tokens:,}. "
                f"Budget resets on the first of next month."
            )
        
        if check.warning_threshold_reached:
            logger.info(
                f"Budget warning for organization {org_id}: "
                f"{check.percent_used:.1f}% used"
            )
            if raise_on_warning:
                raise BudgetExceededException(
                    f"Token budget warning: {check.percent_used:.1f}% used. "
                    f"Remaining: {check.remaining:,} tokens."
                )
        
        return check
    
    def record_usage(
        self,
        usage: TokenUsage = None,
        organization_id: str = None,
        user_id: str = None,
        model: str = None,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        operation: str = None,
        metadata: Dict[str, Any] = None,
        # Legacy parameter alias
        tenant_id: str = None,
    ) -> None:
        """
        Record token usage after an LLM call.
        
        Args:
            usage: TokenUsage value object with all usage details (preferred)
            organization_id: Organization ID (if not using usage object)
            user_id: User ID (if not using usage object)
            model: Model name (if not using usage object)
            prompt_tokens: Prompt tokens (if not using usage object)
            completion_tokens: Completion tokens (if not using usage object)
            operation: Operation type (if not using usage object)
            metadata: Additional metadata (if not using usage object)
            tenant_id: DEPRECATED - use organization_id instead
        """
        # Support both TokenUsage object and individual parameters
        if usage:
            org_id = getattr(usage, 'organization_id', None) or getattr(usage, 'tenant_id', None)
            u_id = usage.user_id
            m = usage.model
            p_tokens = usage.prompt_tokens
            c_tokens = usage.completion_tokens
            total = usage.total_tokens
            cost = float(usage.cost_usd) if hasattr(usage, 'cost_usd') else 0.0
            req_type = usage.request_type if hasattr(usage, 'request_type') else operation
            req_id = usage.request_id if hasattr(usage, 'request_id') else None
            meta = usage.metadata if hasattr(usage, 'metadata') else metadata
        else:
            org_id = organization_id or tenant_id
            u_id = user_id
            m = model
            p_tokens = prompt_tokens
            c_tokens = completion_tokens
            total = prompt_tokens + completion_tokens
            cost = float(self.estimate_cost(model, prompt_tokens, completion_tokens)) if model else 0.0
            req_type = operation
            req_id = None
            meta = metadata
        
        # Insert into llm_usage_logs table (matches existing schema)
        self.db.execute(
            """
            INSERT INTO llm_usage_logs 
            (user_id, model, prompt_tokens, completion_tokens, 
             total_tokens, operation, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            [
                u_id,
                m,
                p_tokens,
                c_tokens,
                total,
                req_type,
                meta,
            ]
        )
        
        logger.debug(
            f"Recorded usage: {total} tokens for {m}"
        )
    
    def get_usage_summary(
        self,
        organization_id: str = None,
        period: str = "month",
        user_id: Optional[str] = None,
        # Legacy parameter alias
        tenant_id: str = None,
    ) -> UsageSummary:
        """
        Get usage summary for an organization or user.
        
        Args:
            organization_id: The organization identifier (matches RLS)
            period: One of 'day', 'week', 'month', 'year'
            user_id: Optional user filter
            tenant_id: DEPRECATED - use organization_id instead
        
        Returns:
            UsageSummary with aggregated usage data
        """
        result = self.db.execute(
            "SELECT * FROM get_user_token_usage(%s, %s)",
            [period, user_id]
        ).fetchone()
        
        if result:
            return UsageSummary(
                period_start=result["period_start"],
                period_end=result["period_end"],
                total_tokens=result["total_tokens"],
                total_cost_usd=Decimal(str(result["total_cost"])),
                by_model=result["by_model"] or {},
                by_request_type={},  # TODO: Add to SQL function
            )
        
        # Default empty summary
        from datetime import datetime
        now = datetime.utcnow().isoformat()
        return UsageSummary(
            period_start=now,
            period_end=now,
            total_tokens=0,
            total_cost_usd=Decimal("0"),
            by_model={},
            by_request_type={},
        )
    
    def estimate_cost(
        self,
        model: str,
        prompt_tokens: int,
        completion_tokens: int,
    ) -> Decimal:
        """
        Estimate cost for a request.
        
        Args:
            model: The LLM model name
            prompt_tokens: Number of prompt tokens
            completion_tokens: Number of completion tokens
        
        Returns:
            Estimated cost in USD
        """
        # Cost per 1K tokens (as of Dec 2024)
        MODEL_COSTS = {
            "gpt-4-turbo": {"prompt": 0.01, "completion": 0.03},
            "gpt-4o": {"prompt": 0.005, "completion": 0.015},
            "gpt-4o-mini": {"prompt": 0.00015, "completion": 0.0006},
            "gpt-3.5-turbo": {"prompt": 0.0005, "completion": 0.0015},
            "claude-3-opus": {"prompt": 0.015, "completion": 0.075},
            "claude-3-sonnet": {"prompt": 0.003, "completion": 0.015},
            "claude-3-haiku": {"prompt": 0.00025, "completion": 0.00125},
        }
        
        # Default to GPT-4 pricing if unknown model
        costs = MODEL_COSTS.get(model, MODEL_COSTS["gpt-4-turbo"])
        
        prompt_cost = (prompt_tokens / 1000) * costs["prompt"]
        completion_cost = (completion_tokens / 1000) * costs["completion"]
        
        return Decimal(str(round(prompt_cost + completion_cost, 6)))











