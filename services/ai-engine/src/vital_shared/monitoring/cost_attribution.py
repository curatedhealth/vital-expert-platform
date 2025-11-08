"""
Cost Attribution Pipeline for VITAL AI Engine.

This module provides comprehensive cost tracking and attribution capabilities,
enabling per-tenant, per-user, and per-query cost analysis for billing,
budgeting, and optimization.

Features:
- Real-time cost calculation for LLM calls
- Token-to-cost conversion for all major models
- Per-tenant cost aggregation
- Per-user cost tracking
- Cost forecasting and budget alerts
- Cost optimization recommendations
"""

import structlog
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from dataclasses import dataclass
from enum import Enum

logger = structlog.get_logger(__name__)


# ============================================================================
# PRICING MODELS
# ============================================================================

class ModelPricing:
    """Pricing information for LLM models (as of Nov 2024)"""
    
    # OpenAI GPT-4 family
    GPT4_TURBO = {
        "input": 0.01,   # per 1K tokens
        "output": 0.03,  # per 1K tokens
    }
    
    GPT4 = {
        "input": 0.03,
        "output": 0.06,
    }
    
    GPT4_32K = {
        "input": 0.06,
        "output": 0.12,
    }
    
    # OpenAI GPT-3.5 family
    GPT35_TURBO = {
        "input": 0.0005,
        "output": 0.0015,
    }
    
    GPT35_TURBO_16K = {
        "input": 0.003,
        "output": 0.004,
    }
    
    # OpenAI Embeddings
    TEXT_EMBEDDING_ADA_002 = 0.0001  # per 1K tokens
    TEXT_EMBEDDING_3_SMALL = 0.00002
    TEXT_EMBEDDING_3_LARGE = 0.00013
    
    # Anthropic Claude (for future use)
    CLAUDE_3_OPUS = {
        "input": 0.015,
        "output": 0.075,
    }
    
    CLAUDE_3_SONNET = {
        "input": 0.003,
        "output": 0.015,
    }
    
    # Model name mapping
    MODEL_MAP = {
        "gpt-4-turbo": GPT4_TURBO,
        "gpt-4-turbo-preview": GPT4_TURBO,
        "gpt-4-1106-preview": GPT4_TURBO,
        "gpt-4": GPT4,
        "gpt-4-0613": GPT4,
        "gpt-4-32k": GPT4_32K,
        "gpt-3.5-turbo": GPT35_TURBO,
        "gpt-3.5-turbo-16k": GPT35_TURBO_16K,
        "text-embedding-ada-002": TEXT_EMBEDDING_ADA_002,
        "text-embedding-3-small": TEXT_EMBEDDING_3_SMALL,
        "text-embedding-3-large": TEXT_EMBEDDING_3_LARGE,
        "claude-3-opus": CLAUDE_3_OPUS,
        "claude-3-sonnet": CLAUDE_3_SONNET,
    }


# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class CostBreakdown:
    """Detailed cost breakdown"""
    llm_cost: Decimal
    embedding_cost: Decimal
    storage_cost: Decimal
    compute_cost: Decimal
    search_cost: Decimal
    total_cost: Decimal
    
    def to_dict(self) -> Dict[str, float]:
        return {
            "llm_cost": float(self.llm_cost),
            "embedding_cost": float(self.embedding_cost),
            "storage_cost": float(self.storage_cost),
            "compute_cost": float(self.compute_cost),
            "search_cost": float(self.search_cost),
            "total_cost": float(self.total_cost),
        }


@dataclass
class TenantCostSummary:
    """Tenant cost summary"""
    tenant_id: str
    daily_cost: Decimal
    monthly_cost: Decimal
    projected_monthly_cost: Decimal
    cost_breakdown: CostBreakdown
    query_count: int
    avg_cost_per_query: Decimal
    top_users: List[Tuple[str, Decimal]]  # [(user_id, cost), ...]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tenant_id": self.tenant_id,
            "daily_cost": float(self.daily_cost),
            "monthly_cost": float(self.monthly_cost),
            "projected_monthly_cost": float(self.projected_monthly_cost),
            "cost_breakdown": self.cost_breakdown.to_dict(),
            "query_count": self.query_count,
            "avg_cost_per_query": float(self.avg_cost_per_query),
            "top_users": [(user_id, float(cost)) for user_id, cost in self.top_users],
        }


@dataclass
class CostOptimizationRecommendation:
    """Cost optimization recommendation"""
    recommendation_type: str  # 'model_downgrade' | 'caching' | 'prompt_optimization'
    potential_savings: Decimal
    savings_percentage: float
    description: str
    action_items: List[str]


# ============================================================================
# COST ATTRIBUTION CLASS
# ============================================================================

class CostAttribution:
    """
    Cost attribution and tracking for VITAL AI Engine.
    
    Responsibilities:
    - Calculate LLM costs from token usage
    - Track costs per tenant/user/query
    - Aggregate costs for billing
    - Generate cost forecasts
    - Provide optimization recommendations
    
    Usage:
        cost_attr = CostAttribution()
        
        # Calculate LLM cost
        cost = cost_attr.calculate_llm_cost(
            model="gpt-4",
            prompt_tokens=100,
            completion_tokens=200
        )
        
        # Get tenant cost summary
        summary = await cost_attr.get_tenant_cost_summary(
            tenant_id="tenant-123",
            days=30
        )
        
        # Get optimization recommendations
        recommendations = await cost_attr.get_optimization_recommendations(
            tenant_id="tenant-123"
        )
    """
    
    def __init__(self):
        """Initialize cost attribution"""
        self.logger = logger.bind(component="cost_attribution")
        self.logger.info("cost_attribution_initialized")
    
    # ========================================================================
    # COST CALCULATION
    # ========================================================================
    
    def calculate_llm_cost(
        self,
        model: str,
        prompt_tokens: int,
        completion_tokens: int
    ) -> Decimal:
        """
        Calculate LLM cost from token usage.
        
        Args:
            model: Model name (e.g., "gpt-4")
            prompt_tokens: Number of prompt tokens
            completion_tokens: Number of completion tokens
            
        Returns:
            Cost in USD as Decimal
        """
        try:
            # Get pricing for model
            pricing = ModelPricing.MODEL_MAP.get(model)
            
            if pricing is None:
                self.logger.warning("unknown_model_pricing",
                                  model=model,
                                  message="Using GPT-4 pricing as default")
                pricing = ModelPricing.GPT4
            
            # Calculate cost
            if isinstance(pricing, dict):
                # Chat model with input/output pricing
                input_cost = Decimal(str((prompt_tokens / 1000) * pricing["input"]))
                output_cost = Decimal(str((completion_tokens / 1000) * pricing["output"]))
                total_cost = input_cost + output_cost
            else:
                # Embedding model with flat pricing
                total_tokens = prompt_tokens + completion_tokens
                total_cost = Decimal(str((total_tokens / 1000) * pricing))
            
            self.logger.debug("llm_cost_calculated",
                            model=model,
                            prompt_tokens=prompt_tokens,
                            completion_tokens=completion_tokens,
                            cost_usd=float(total_cost))
            
            return total_cost
        
        except Exception as e:
            self.logger.error("llm_cost_calculation_failed",
                            model=model,
                            error=str(e))
            return Decimal("0")
    
    def calculate_embedding_cost(
        self,
        model: str,
        tokens: int
    ) -> Decimal:
        """
        Calculate embedding cost.
        
        Args:
            model: Embedding model name
            tokens: Number of tokens
            
        Returns:
            Cost in USD as Decimal
        """
        return self.calculate_llm_cost(
            model=model,
            prompt_tokens=tokens,
            completion_tokens=0
        )
    
    # ========================================================================
    # COST AGGREGATION (requires TimescaleDB integration)
    # ========================================================================
    
    async def get_tenant_daily_cost(
        self,
        tenant_id: str,
        date: Optional[datetime] = None
    ) -> Decimal:
        """
        Get tenant's total cost for a specific day.
        
        Args:
            tenant_id: Tenant ID
            date: Date to query (defaults to today)
            
        Returns:
            Total cost in USD
        """
        try:
            # Import TimescaleDB integration
            from vital_shared.monitoring import get_timescale_integration
            
            timescale = get_timescale_integration()
            if not timescale.enabled:
                self.logger.warning("timescale_disabled",
                                  message="Cannot get daily cost without TimescaleDB")
                return Decimal("0")
            
            cost = await timescale.get_tenant_daily_cost(tenant_id, date)
            return Decimal(str(cost))
        
        except Exception as e:
            self.logger.error("get_tenant_daily_cost_failed",
                            tenant_id=tenant_id,
                            error=str(e))
            return Decimal("0")
    
    async def get_tenant_monthly_cost(
        self,
        tenant_id: str,
        year: Optional[int] = None,
        month: Optional[int] = None
    ) -> Decimal:
        """
        Get tenant's total cost for a specific month.
        
        Args:
            tenant_id: Tenant ID
            year: Year (defaults to current)
            month: Month (defaults to current)
            
        Returns:
            Total cost in USD
        """
        try:
            from vital_shared.monitoring import get_timescale_integration
            
            now = datetime.now()
            year = year or now.year
            month = month or now.month
            
            # Get first and last day of month
            first_day = datetime(year, month, 1)
            if month == 12:
                last_day = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            else:
                last_day = datetime(year, month + 1, 1) - timedelta(seconds=1)
            
            # Sum daily costs
            timescale = get_timescale_integration()
            if not timescale.enabled:
                return Decimal("0")
            
            total_cost = Decimal("0")
            current_day = first_day
            
            while current_day <= last_day:
                daily_cost = await self.get_tenant_daily_cost(tenant_id, current_day)
                total_cost += daily_cost
                current_day += timedelta(days=1)
            
            return total_cost
        
        except Exception as e:
            self.logger.error("get_tenant_monthly_cost_failed",
                            tenant_id=tenant_id,
                            error=str(e))
            return Decimal("0")
    
    async def get_tenant_cost_summary(
        self,
        tenant_id: str,
        days: int = 30
    ) -> TenantCostSummary:
        """
        Get comprehensive cost summary for a tenant.
        
        Args:
            tenant_id: Tenant ID
            days: Number of days to analyze
            
        Returns:
            TenantCostSummary with detailed cost information
        """
        try:
            # Get costs
            daily_cost = await self.get_tenant_daily_cost(tenant_id)
            monthly_cost = await self.get_tenant_monthly_cost(tenant_id)
            
            # Project monthly cost based on daily average
            days_in_month = (datetime.now().replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            avg_daily_cost = monthly_cost / Decimal(str(datetime.now().day))
            projected_monthly_cost = avg_daily_cost * Decimal(str(days_in_month.day))
            
            # Get cost breakdown (simplified - would query TimescaleDB in production)
            cost_breakdown = CostBreakdown(
                llm_cost=monthly_cost * Decimal("0.8"),  # 80% LLM
                embedding_cost=monthly_cost * Decimal("0.1"),  # 10% embeddings
                storage_cost=monthly_cost * Decimal("0.05"),  # 5% storage
                compute_cost=monthly_cost * Decimal("0.03"),  # 3% compute
                search_cost=monthly_cost * Decimal("0.02"),  # 2% search
                total_cost=monthly_cost
            )
            
            # Query count and avg cost (would query TimescaleDB in production)
            query_count = 1000  # Placeholder
            avg_cost_per_query = monthly_cost / Decimal(str(query_count)) if query_count > 0 else Decimal("0")
            
            # Top users (would query TimescaleDB in production)
            top_users = []  # Placeholder
            
            return TenantCostSummary(
                tenant_id=tenant_id,
                daily_cost=daily_cost,
                monthly_cost=monthly_cost,
                projected_monthly_cost=projected_monthly_cost,
                cost_breakdown=cost_breakdown,
                query_count=query_count,
                avg_cost_per_query=avg_cost_per_query,
                top_users=top_users
            )
        
        except Exception as e:
            self.logger.error("get_tenant_cost_summary_failed",
                            tenant_id=tenant_id,
                            error=str(e))
            # Return empty summary
            return TenantCostSummary(
                tenant_id=tenant_id,
                daily_cost=Decimal("0"),
                monthly_cost=Decimal("0"),
                projected_monthly_cost=Decimal("0"),
                cost_breakdown=CostBreakdown(
                    llm_cost=Decimal("0"),
                    embedding_cost=Decimal("0"),
                    storage_cost=Decimal("0"),
                    compute_cost=Decimal("0"),
                    search_cost=Decimal("0"),
                    total_cost=Decimal("0")
                ),
                query_count=0,
                avg_cost_per_query=Decimal("0"),
                top_users=[]
            )
    
    # ========================================================================
    # COST OPTIMIZATION
    # ========================================================================
    
    async def get_optimization_recommendations(
        self,
        tenant_id: str
    ) -> List[CostOptimizationRecommendation]:
        """
        Get cost optimization recommendations for a tenant.
        
        Args:
            tenant_id: Tenant ID
            
        Returns:
            List of optimization recommendations
        """
        recommendations = []
        
        try:
            summary = await self.get_tenant_cost_summary(tenant_id)
            
            # Recommendation 1: Model downgrade
            if summary.avg_cost_per_query > Decimal("0.01"):
                recommendations.append(
                    CostOptimizationRecommendation(
                        recommendation_type="model_downgrade",
                        potential_savings=summary.monthly_cost * Decimal("0.4"),
                        savings_percentage=40.0,
                        description="Consider using GPT-3.5-Turbo for simple queries",
                        action_items=[
                            "Classify queries by complexity",
                            "Route simple queries to GPT-3.5-Turbo",
                            "Keep GPT-4 for complex medical questions"
                        ]
                    )
                )
            
            # Recommendation 2: Caching
            if summary.query_count > 100:
                recommendations.append(
                    CostOptimizationRecommendation(
                        recommendation_type="caching",
                        potential_savings=summary.monthly_cost * Decimal("0.2"),
                        savings_percentage=20.0,
                        description="Enable response caching for repeat queries",
                        action_items=[
                            "Implement semantic caching",
                            "Cache common medical questions",
                            "Set 5-minute TTL for responses"
                        ]
                    )
                )
            
            # Recommendation 3: Prompt optimization
            if summary.cost_breakdown.llm_cost > summary.monthly_cost * Decimal("0.7"):
                recommendations.append(
                    CostOptimizationRecommendation(
                        recommendation_type="prompt_optimization",
                        potential_savings=summary.monthly_cost * Decimal("0.15"),
                        savings_percentage=15.0,
                        description="Optimize prompts to reduce token usage",
                        action_items=[
                            "Review system prompts for verbosity",
                            "Remove redundant instructions",
                            "Use shorter examples in few-shot prompts"
                        ]
                    )
                )
            
            self.logger.info("optimization_recommendations_generated",
                           tenant_id=tenant_id,
                           recommendation_count=len(recommendations))
        
        except Exception as e:
            self.logger.error("optimization_recommendations_failed",
                            tenant_id=tenant_id,
                            error=str(e))
        
        return recommendations
    
    # ========================================================================
    # BUDGET ALERTS
    # ========================================================================
    
    async def check_budget_alert(
        self,
        tenant_id: str,
        monthly_budget: Decimal,
        alert_threshold: float = 0.8
    ) -> Optional[Dict[str, Any]]:
        """
        Check if tenant is approaching budget limit.
        
        Args:
            tenant_id: Tenant ID
            monthly_budget: Monthly budget in USD
            alert_threshold: Threshold for alert (0.8 = 80%)
            
        Returns:
            Alert dictionary if threshold exceeded, None otherwise
        """
        try:
            summary = await self.get_tenant_cost_summary(tenant_id)
            
            usage_percentage = float(summary.projected_monthly_cost / monthly_budget)
            
            if usage_percentage >= alert_threshold:
                return {
                    "tenant_id": tenant_id,
                    "alert_type": "budget_threshold",
                    "monthly_budget": float(monthly_budget),
                    "projected_cost": float(summary.projected_monthly_cost),
                    "usage_percentage": usage_percentage,
                    "days_remaining": (datetime.now().replace(day=28) + timedelta(days=4)).replace(day=1).day - datetime.now().day,
                    "message": f"Projected monthly cost (${summary.projected_monthly_cost:.2f}) is {usage_percentage:.1%} of budget (${monthly_budget:.2f})"
                }
            
            return None
        
        except Exception as e:
            self.logger.error("budget_alert_check_failed",
                            tenant_id=tenant_id,
                            error=str(e))
            return None


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

# Global instance (lazy-initialized)
_cost_attribution_instance: Optional[CostAttribution] = None


def get_cost_attribution() -> CostAttribution:
    """
    Get singleton CostAttribution instance.
    
    Returns:
        CostAttribution instance
    """
    global _cost_attribution_instance
    
    if _cost_attribution_instance is None:
        _cost_attribution_instance = CostAttribution()
    
    return _cost_attribution_instance

