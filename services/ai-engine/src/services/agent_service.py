"""
Agent service for VITAL AI Engine

Thin wrapper around SupabaseClient providing common agent operations
used by streaming workflows (Ask Expert, Ask Panel, etc.).
"""

from typing import Any, Dict, List, Optional
import structlog

from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class AgentService:
    """High-level agent operations backed by Supabase (with graceful fallback)."""

    def __init__(self, supabase_client: SupabaseClient):
        self.supabase = supabase_client

    async def get_agent(self, agent_id: str, tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get a single agent by ID or name.

        Delegates to SupabaseClient.get_agent_by_id which already handles
        both UUID IDs and string names.
        
        Args:
            agent_id: Agent ID or name
            tenant_id: Optional tenant ID. If not provided, uses default tenant.
        
        Behavior:
        - If Supabase is unavailable: Returns a generic fallback agent so that
          panel workflows can still run in degraded mode.
        - If Supabase is available but agent is not found: Returns None and logs
          an error, so you know you need to configure the agent correctly.
        - If agent is found: Returns the agent configuration.
        """
        # Check if Supabase is unavailable first
        if not self.supabase.client:
            # Supabase is unavailable - use fallback so workflow can still run
            logger.warning(
                "agent_service.get_agent_fallback_supabase_unavailable",
                agent_id=agent_id,
                tenant_id=tenant_id,
                reason="supabase_client_not_initialized",
            )
            return {
                "id": agent_id,
                "name": f"Expert {agent_id[:8]}",
                "display_name": f"Expert {agent_id[:8]}",
                "description": "Generic expert panel member (fallback profile - Supabase unavailable).",
                "model": "gpt-4o-mini",
                "temperature": 0.4,
                "max_tokens": 1200,
                "system_prompt": (
                    "You are a senior digital health and life-sciences expert. "
                    "Answer clearly and concretely, as if you are part of a panel of specialists. "
                    "Be practical, avoid fluff, and focus on high-impact recommendations."
                ),
                "metadata": {
                    "is_fallback": True,
                    "fallback_reason": "supabase_unavailable"
                }
            }

        # Supabase is available - try to get the agent
        agent = await self.supabase.get_agent_by_id(agent_id, tenant_id=tenant_id)
        if agent:
            logger.info(
                "agent_service.get_agent_found",
                agent_id=agent_id,
                agent_name=agent.get("name"),
                agent_status=agent.get("status"),
            )
            return agent

        # Supabase is available but agent was not found - try to diagnose the issue
        # Check if we can query the agents table at all
        try:
            # Try a simple query to see if the table is accessible
            test_query = self.supabase.client.table("agents").select("id").limit(1).execute()
            logger.info(
                "agent_service.diagnostic_table_accessible",
                agent_id=agent_id,
                table_accessible=True,
                test_result_count=len(test_query.data) if test_query.data else 0
            )
        except Exception as diag_error:
            logger.error(
                "agent_service.diagnostic_table_not_accessible",
                agent_id=agent_id,
                error=str(diag_error),
                error_type=type(diag_error).__name__
            )

        # Log detailed error for debugging
        logger.error(
            "agent_service.get_agent_not_found",
            agent_id=agent_id,
            reason="agent_not_configured_in_database",
            message="Agent not found in database. Please ensure the agent exists in the 'agents' table with this ID or name.",
            supabase_client_initialized=True,
            suggestion="Verify: 1) Agent exists in database, 2) Agent ID is correct, 3) RLS policies allow access, 4) Agent status is not blocking access"
        )
        return None

    async def list_agents(
        self,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """
        List agents with optional filters.

        This is intentionally minimal – it is only used by the streaming
        endpoints for listing available experts/panel members.
        """
        try:
            query = self.supabase.table("agents").select("*")

            filters = filters or {}
            for key, value in filters.items():
                if value is None:
                    continue
                if isinstance(value, list):
                    query = query.in_(key, value)
                else:
                    query = query.eq(key, value)

            result = query.limit(limit).execute()
            data = result.data or []

            logger.info(
                "agent_service.list_agents_completed",
                count=len(data),
                filters=list(filters.keys()),
            )

            return data
        except Exception as e:
            logger.error("agent_service.list_agents_failed", error=str(e))
            return []


