"""
Agent Service

Provides agent-related operations for the Ask Panel workflow.
Loads agents from the database via Supabase client.
"""

from typing import Any, Dict, List, Optional
import structlog

from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class AgentService:
    """
    Service for managing agent operations.

    This service provides methods to:
    - Load agents by ID from the database
    - Get agent metadata and configurations
    """

    def __init__(self, supabase_client: SupabaseClient):
        self.supabase = supabase_client

    async def get_agents_by_ids(self, agent_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Load agents by their IDs from the database.

        Args:
            agent_ids: List of agent UUIDs to load

        Returns:
            List of agent dictionaries with all fields
        """
        if not agent_ids:
            return []

        if not self.supabase or not self.supabase.client:
            logger.warning("Supabase client unavailable - cannot load agents")
            return []

        try:
            response = self.supabase.client.table("agents").select("*").in_("id", agent_ids).execute()

            if response.data:
                logger.info(
                    "agents_loaded_from_database",
                    requested_count=len(agent_ids),
                    loaded_count=len(response.data)
                )
                return response.data
            else:
                logger.warning("no_agents_found", agent_ids=agent_ids)
                return []

        except Exception as e:
            logger.error("failed_to_load_agents", error=str(e), agent_ids=agent_ids)
            return []

    async def get_agent_by_id(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """
        Load a single agent by ID.

        Args:
            agent_id: The agent UUID

        Returns:
            Agent dictionary or None if not found
        """
        agents = await self.get_agents_by_ids([agent_id])
        return agents[0] if agents else None

    async def get_active_agents(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get all active agents.

        Args:
            limit: Maximum number of agents to return

        Returns:
            List of active agent dictionaries
        """
        if not self.supabase or not self.supabase.client:
            logger.warning("Supabase client unavailable - cannot load agents")
            return []

        try:
            response = (
                self.supabase.client.table("agents")
                .select("*")
                .eq("status", "active")
                .limit(limit)
                .execute()
            )

            if response.data:
                logger.info("active_agents_loaded", count=len(response.data))
                return response.data
            return []

        except Exception as e:
            logger.error("failed_to_load_active_agents", error=str(e))
            return []
