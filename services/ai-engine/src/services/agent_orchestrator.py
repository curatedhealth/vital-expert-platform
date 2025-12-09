"""
AgentOrchestrator: Service for managing agent lifecycle and coordination.

This is a lightweight implementation that provides agent loading functionality
needed by the Mode 1/2 workflows.
"""

from typing import Any, Dict, List, Optional
import structlog

logger = structlog.get_logger()


class AgentOrchestrator:
    """
    Orchestrates agent operations for the Ask Expert workflows.

    Primary responsibilities:
    - Load agent profiles from database
    - Coordinate agent execution
    - Handle agent lifecycle
    """

    def __init__(self, supabase_client, rag_service=None):
        """
        Initialize AgentOrchestrator.

        Args:
            supabase_client: Supabase client for database access
            rag_service: Optional RAG service for context retrieval
        """
        self.supabase = supabase_client
        self.rag_service = rag_service
        self._agent_cache: Dict[str, Dict[str, Any]] = {}

    async def load_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """
        Load agent profile from database.

        Args:
            agent_id: UUID of the agent to load

        Returns:
            Agent profile dictionary or None if not found
        """
        # Check cache first
        if agent_id in self._agent_cache:
            return self._agent_cache[agent_id]

        try:
            result = self.supabase.table("agents").select("*").eq("id", agent_id).single().execute()

            if result.data:
                self._agent_cache[agent_id] = result.data
                logger.info("agent_loaded", agent_id=agent_id, name=result.data.get("name"))
                return result.data
            else:
                logger.warning("agent_not_found", agent_id=agent_id)
                return None

        except Exception as e:
            logger.error("agent_load_failed", agent_id=agent_id, error=str(e))
            return None

    async def get_agent_system_prompt(self, agent_id: str) -> str:
        """
        Get the system prompt for an agent.

        Args:
            agent_id: UUID of the agent

        Returns:
            System prompt string
        """
        agent = await self.load_agent(agent_id)
        if agent:
            return agent.get("system_prompt", "")
        return ""

    async def get_agent_capabilities(self, agent_id: str) -> List[str]:
        """
        Get capabilities for an agent.

        Args:
            agent_id: UUID of the agent

        Returns:
            List of capability names
        """
        try:
            result = self.supabase.table("agent_capabilities").select(
                "capabilities(name)"
            ).eq("agent_id", agent_id).execute()

            if result.data:
                return [item.get("capabilities", {}).get("name", "") for item in result.data if item.get("capabilities")]
            return []

        except Exception as e:
            logger.error("capabilities_load_failed", agent_id=agent_id, error=str(e))
            return []

    async def execute_agent(
        self,
        agent_id: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute an agent with a message.

        This is a placeholder for agent execution - the actual LLM call
        happens in the workflow nodes.

        Args:
            agent_id: UUID of the agent
            message: User message
            context: Optional context dictionary

        Returns:
            Execution result dictionary
        """
        agent = await self.load_agent(agent_id)
        if not agent:
            return {"error": "Agent not found", "agent_id": agent_id}

        return {
            "status": "ready",
            "agent_id": agent_id,
            "agent_name": agent.get("name", "Unknown"),
            "system_prompt": agent.get("system_prompt", ""),
            "message": message,
            "context": context or {}
        }

    def clear_cache(self):
        """Clear the agent cache."""
        self._agent_cache.clear()
        logger.info("agent_cache_cleared")
