"""
Agent Usage Tracking Service

Tracks AI agent usage per tenant using the existing agent_usage table.
Records tokens, execution time, and cost for all agent operations.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timezone, timedelta
import structlog
import uuid as uuid_module

from vital_shared_kernel.multi_tenant import TenantId, TenantContext

from services.tenant_aware_supabase import TenantAwareSupabaseClient

logger = structlog.get_logger()


# UUID validation helpers
def _is_valid_uuid(value) -> bool:
    """Check if a value is a valid UUID format."""
    if value is None or value == "anonymous" or value == "None":
        return False
    try:
        uuid_module.UUID(str(value))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def _get_valid_uuid_str_or_none(value) -> Optional[str]:
    """Return the string value if it's a valid UUID, otherwise return None."""
    return str(value) if _is_valid_uuid(value) else None


class AgentUsageTracker:
    """
    Tracks agent usage per tenant for billing and analytics.
    
    Uses existing agent_usage table:
    - id: UUID
    - tenant_id: UUID (auto-injected)
    - user_id: UUID
    - agent_id: TEXT
    - panel_id: UUID (optional)
    - tokens_used: INTEGER
    - execution_time_ms: INTEGER
    - cost_usd: NUMERIC
    - created_at: TIMESTAMPTZ
    - metadata: JSONB
    """
    
    # Pricing per model (USD per 1K tokens)
    PRICING = {
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        "claude-3-opus": {"input": 0.015, "output": 0.075},
        "claude-3-sonnet": {"input": 0.003, "output": 0.015},
        "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
    }
    
    def __init__(self, db_client: TenantAwareSupabaseClient):
        """
        Initialize usage tracker.
        
        Args:
            db_client: Tenant-aware database client
        """
        self.db = db_client
    
    async def track_usage(
        self,
        agent_id: str,
        user_id: UUID,
        tokens_used: int,
        execution_time_ms: int,
        model: str = "gpt-4-turbo",
        panel_id: Optional[UUID] = None,
        input_tokens: Optional[int] = None,
        output_tokens: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> UUID:
        """
        Track agent usage.
        
        Args:
            agent_id: Agent identifier
            user_id: User who triggered the agent
            tokens_used: Total tokens consumed
            execution_time_ms: Execution time in milliseconds
            model: AI model used (for cost calculation)
            panel_id: Optional panel this usage belongs to
            input_tokens: Optional input token count
            output_tokens: Optional output token count
            metadata: Optional additional metadata
            
        Returns:
            Usage record ID
        """
        # Calculate cost
        cost_usd = self._calculate_cost(
            tokens_used,
            model,
            input_tokens,
            output_tokens
        )

        # Validate user_id to prevent "None" string errors in PostgreSQL
        validated_user_id = _get_valid_uuid_str_or_none(user_id)
        if not validated_user_id:
            logger.warning(
                "track_usage skipped - invalid user_id",
                user_id=user_id,
                agent_id=agent_id
            )
            # Return a dummy UUID - don't fail silently but don't crash either
            # Usage tracking is non-critical, we log and continue
            return UUID('00000000-0000-0000-0000-000000000000')

        # Prepare record
        usage_data = {
            "agent_id": agent_id,
            "user_id": validated_user_id,
            "tokens_used": tokens_used,
            "execution_time_ms": execution_time_ms,
            "cost_usd": cost_usd,
            "metadata": metadata or {}
        }
        
        # Add panel_id if provided
        if panel_id:
            usage_data["panel_id"] = str(panel_id)
        
        # Add model and token breakdown to metadata
        usage_data["metadata"]["model"] = model
        if input_tokens is not None:
            usage_data["metadata"]["input_tokens"] = input_tokens
        if output_tokens is not None:
            usage_data["metadata"]["output_tokens"] = output_tokens
        
        # Insert to agent_usage table (tenant_id auto-injected)
        record = await self.db.insert("agent_usage", usage_data)
        
        logger.info(
            "agent_usage_tracked",
            agent_id=agent_id,
            tokens=tokens_used,
            cost_usd=round(cost_usd, 4),
            execution_time_ms=execution_time_ms,
            panel_id=str(panel_id) if panel_id else None
        )
        
        return UUID(record["id"])
    
    def _calculate_cost(
        self,
        total_tokens: int,
        model: str,
        input_tokens: Optional[int] = None,
        output_tokens: Optional[int] = None
    ) -> float:
        """
        Calculate cost in USD.
        
        Args:
            total_tokens: Total token count
            model: Model name
            input_tokens: Optional input tokens (for accurate pricing)
            output_tokens: Optional output tokens (for accurate pricing)
            
        Returns:
            Cost in USD
        """
        pricing = self.PRICING.get(model, self.PRICING["gpt-4-turbo"])
        
        # If we have input/output breakdown, use it for accurate pricing
        if input_tokens is not None and output_tokens is not None:
            input_cost = (input_tokens / 1000) * pricing["input"]
            output_cost = (output_tokens / 1000) * pricing["output"]
            return input_cost + output_cost
        
        # Otherwise, assume average of input/output pricing
        avg_price = (pricing["input"] + pricing["output"]) / 2
        return (total_tokens / 1000) * avg_price
    
    async def get_panel_usage(
        self,
        panel_id: UUID,
        tenant_id: Optional[TenantId] = None
    ) -> Dict[str, Any]:
        """
        Get usage summary for a panel.
        
        Args:
            panel_id: Panel ID
            tenant_id: Optional tenant override
            
        Returns:
            Usage summary with totals
        """
        # Get all usage records for panel
        records = await self.db.list_all(
            "agent_usage",
            filters={"panel_id": str(panel_id)},
            tenant_id=tenant_id
        )
        
        if not records:
            return {
                "panel_id": str(panel_id),
                "total_tokens": 0,
                "total_cost_usd": 0.0,
                "total_execution_time_ms": 0,
                "agent_count": 0,
                "agents": []
            }
        
        # Calculate totals
        total_tokens = sum(r["tokens_used"] for r in records)
        total_cost = sum(float(r["cost_usd"]) for r in records)
        total_time = sum(r["execution_time_ms"] for r in records)
        
        # Group by agent
        agents_usage = {}
        for record in records:
            agent_id = record["agent_id"]
            if agent_id not in agents_usage:
                agents_usage[agent_id] = {
                    "agent_id": agent_id,
                    "tokens": 0,
                    "cost_usd": 0.0,
                    "execution_time_ms": 0,
                    "calls": 0
                }
            
            agents_usage[agent_id]["tokens"] += record["tokens_used"]
            agents_usage[agent_id]["cost_usd"] += float(record["cost_usd"])
            agents_usage[agent_id]["execution_time_ms"] += record["execution_time_ms"]
            agents_usage[agent_id]["calls"] += 1
        
        return {
            "panel_id": str(panel_id),
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 4),
            "total_execution_time_ms": total_time,
            "agent_count": len(agents_usage),
            "agents": list(agents_usage.values())
        }
    
    async def get_tenant_usage(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        tenant_id: Optional[TenantId] = None
    ) -> Dict[str, Any]:
        """
        Get usage summary for tenant within date range.
        
        Args:
            start_date: Start date (default: 30 days ago)
            end_date: End date (default: now)
            tenant_id: Optional tenant override
            
        Returns:
            Usage summary with totals and trends
        """
        # Default to last 30 days
        if not end_date:
            end_date = datetime.now(timezone.utc)
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Get all usage records for tenant in date range
        # Note: This is simplified - in production, add date filtering to query
        all_records = await self.db.list_all("agent_usage", tenant_id=tenant_id)
        
        # Filter by date in Python (TODO: move to SQL for performance)
        records = [
            r for r in all_records
            if start_date <= datetime.fromisoformat(r["created_at"].replace("Z", "+00:00")) <= end_date
        ]
        
        if not records:
            return {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "total_tokens": 0,
                "total_cost_usd": 0.0,
                "total_panels": 0,
                "total_calls": 0,
                "average_cost_per_panel": 0.0
            }
        
        # Calculate totals
        total_tokens = sum(r["tokens_used"] for r in records)
        total_cost = sum(float(r["cost_usd"]) for r in records)
        total_calls = len(records)
        
        # Count unique panels
        unique_panels = set(r["panel_id"] for r in records if r.get("panel_id"))
        panel_count = len(unique_panels)
        
        # Calculate averages
        avg_cost_per_panel = total_cost / panel_count if panel_count > 0 else 0.0
        avg_tokens_per_call = total_tokens / total_calls if total_calls > 0 else 0
        
        return {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 4),
            "total_panels": panel_count,
            "total_calls": total_calls,
            "average_cost_per_panel": round(avg_cost_per_panel, 4),
            "average_tokens_per_call": round(avg_tokens_per_call, 2)
        }
    
    async def get_agent_stats(
        self,
        agent_id: str,
        tenant_id: Optional[TenantId] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get usage statistics for a specific agent.
        
        Args:
            agent_id: Agent identifier
            tenant_id: Optional tenant override
            limit: Max number of recent records to analyze
            
        Returns:
            Agent usage statistics
        """
        # Get recent usage for this agent
        all_records = await self.db.list_all(
            "agent_usage",
            filters={"agent_id": agent_id},
            tenant_id=tenant_id,
            limit=limit,
            order_by="created_at"
        )
        
        if not all_records:
            return {
                "agent_id": agent_id,
                "total_calls": 0,
                "total_tokens": 0,
                "total_cost_usd": 0.0,
                "average_tokens_per_call": 0,
                "average_execution_time_ms": 0
            }
        
        # Calculate stats
        total_calls = len(all_records)
        total_tokens = sum(r["tokens_used"] for r in all_records)
        total_cost = sum(float(r["cost_usd"]) for r in all_records)
        total_time = sum(r["execution_time_ms"] for r in all_records)
        
        return {
            "agent_id": agent_id,
            "total_calls": total_calls,
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 4),
            "average_tokens_per_call": round(total_tokens / total_calls, 2),
            "average_execution_time_ms": round(total_time / total_calls, 2),
            "average_cost_per_call": round(total_cost / total_calls, 4)
        }


# Factory function
def create_usage_tracker(db_client: TenantAwareSupabaseClient) -> AgentUsageTracker:
    """
    Create an agent usage tracker.
    
    Args:
        db_client: Tenant-aware database client
        
    Returns:
        AgentUsageTracker instance
    """
    return AgentUsageTracker(db_client)

