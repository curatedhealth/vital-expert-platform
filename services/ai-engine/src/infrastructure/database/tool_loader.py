"""
Tool Loader Service - Fetches L5 tool configurations from PostgreSQL.

Architecture principle: PostgreSQL = variables/config, Python = logic.

This service:
1. Loads tool configs from `tools` table
2. Gets agent's assigned tools from `agent_tool_assignments`
3. Creates L5 tool instances dynamically based on DB config
"""

import os
from typing import Any, Dict, List, Optional
from functools import lru_cache
import structlog

logger = structlog.get_logger()


class ToolLoader:
    """
    Loads L5 tool configurations from Supabase PostgreSQL.

    Follows the pattern: DB stores config, Python provides logic.
    """

    _instance: Optional["ToolLoader"] = None
    _tools_cache: Dict[str, Dict[str, Any]] = {}
    _agent_tools_cache: Dict[str, List[str]] = {}

    def __init__(self):
        self._supabase = None
        self._initialized = False

    @classmethod
    def get_instance(cls) -> "ToolLoader":
        """Singleton pattern for tool loader."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def initialize(self) -> None:
        """Initialize connection and load tools from DB."""
        if self._initialized:
            return

        try:
            from supabase import create_client, Client

            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

            if not url or not key:
                logger.warning("tool_loader_no_supabase_credentials")
                return

            self._supabase: Client = create_client(url, key)
            await self._load_all_tools()
            self._initialized = True

            logger.info(
                "tool_loader_initialized",
                tools_loaded=len(self._tools_cache),
            )

        except Exception as e:
            logger.error("tool_loader_init_failed", error=str(e))

    async def _load_all_tools(self) -> None:
        """Load all tools with l5_id from database."""
        try:
            response = self._supabase.table("tools").select(
                "id,l5_id,name,slug,description,endpoint_url,authentication_type,"
                "configuration,metadata,python_module,rate_limit_per_minute,"
                "cache_ttl_seconds,cost_per_call,is_active"
            ).not_.is_("l5_id", "null").eq("is_active", True).execute()

            for tool in response.data:
                l5_id = tool.get("l5_id")
                if l5_id:
                    self._tools_cache[l5_id] = tool

            logger.info(
                "tool_loader_tools_loaded",
                count=len(self._tools_cache),
                tool_ids=list(self._tools_cache.keys())[:10],
            )

        except Exception as e:
            logger.error("tool_loader_load_tools_failed", error=str(e))

    async def get_tool_config(self, l5_id: str) -> Optional[Dict[str, Any]]:
        """Get tool configuration by L5 ID."""
        if not self._initialized:
            await self.initialize()

        return self._tools_cache.get(l5_id)

    async def get_agent_tools(self, agent_id: str) -> List[str]:
        """
        Get list of L5 tool IDs assigned to an agent.

        Returns list of l5_ids the agent can use.
        """
        if not self._initialized:
            await self.initialize()

        # Check cache first
        if agent_id in self._agent_tools_cache:
            return self._agent_tools_cache[agent_id]

        try:
            # Query agent_tool_assignments with tool join
            response = self._supabase.table("agent_tool_assignments").select(
                "tool_id,tools(l5_id,name)"
            ).eq("agent_id", agent_id).eq("is_enabled", True).execute()

            tool_ids = []
            for assignment in response.data:
                tools_data = assignment.get("tools", {})
                if tools_data and tools_data.get("l5_id"):
                    tool_ids.append(tools_data["l5_id"])

            self._agent_tools_cache[agent_id] = tool_ids

            logger.info(
                "tool_loader_agent_tools_loaded",
                agent_id=agent_id,
                tool_count=len(tool_ids),
                tools=tool_ids,
            )

            return tool_ids

        except Exception as e:
            logger.error(
                "tool_loader_get_agent_tools_failed",
                agent_id=agent_id,
                error=str(e),
            )
            return []

    async def get_all_tool_ids(self) -> List[str]:
        """Get all available L5 tool IDs."""
        if not self._initialized:
            await self.initialize()
        return list(self._tools_cache.keys())

    def get_tool_endpoint(self, l5_id: str) -> Optional[str]:
        """Get API endpoint URL for a tool."""
        tool = self._tools_cache.get(l5_id, {})
        return tool.get("endpoint_url")

    def get_tool_auth_env_var(self, l5_id: str) -> Optional[str]:
        """Get environment variable name for tool authentication."""
        tool = self._tools_cache.get(l5_id, {})
        metadata = tool.get("metadata", {})
        l5_config = metadata.get("l5_config", {})
        return l5_config.get("auth_env_var")

    def get_tool_handler(self, l5_id: str) -> Optional[str]:
        """Get handler method name for a tool."""
        tool = self._tools_cache.get(l5_id, {})
        metadata = tool.get("metadata", {})
        l5_config = metadata.get("l5_config", {})
        return l5_config.get("handler")

    def get_tool_class(self, l5_id: str) -> Optional[str]:
        """Get Python class name for a tool."""
        tool = self._tools_cache.get(l5_id, {})
        metadata = tool.get("metadata", {})
        l5_config = metadata.get("l5_config", {})
        return l5_config.get("tool_class")

    def get_tool_domain(self, l5_id: str) -> Optional[str]:
        """Get domain category for a tool."""
        tool = self._tools_cache.get(l5_id, {})
        metadata = tool.get("metadata", {})
        l5_config = metadata.get("l5_config", {})
        return l5_config.get("domain")

    def build_tool_config(self, l5_id: str) -> Optional[Dict[str, Any]]:
        """
        Build a ToolConfig-compatible dict from DB data.

        This merges DB config with sensible defaults.
        """
        tool = self._tools_cache.get(l5_id)
        if not tool:
            return None

        metadata = tool.get("metadata", {})
        l5_config = metadata.get("l5_config", {})

        return {
            "id": l5_id,
            "name": tool.get("name", l5_id),
            "slug": tool.get("slug", l5_id.lower().replace("-", "_")),
            "description": tool.get("description", ""),
            "category": l5_config.get("domain", "general"),
            "tier": metadata.get("tier", 2),
            "priority": metadata.get("priority", "medium"),
            "base_url": tool.get("endpoint_url"),
            "auth_type": tool.get("authentication_type", "none"),
            "auth_env_var": l5_config.get("auth_env_var"),
            "rate_limit": tool.get("rate_limit_per_minute", 10),
            "cache_ttl": tool.get("cache_ttl_seconds", 3600),
            "cost_per_call": tool.get("cost_per_call", 0.001),
            "tags": metadata.get("tags", []),
            "vendor": metadata.get("vendor", ""),
            "license": metadata.get("license", ""),
            "documentation_url": metadata.get("documentation_url", ""),
            "handler": l5_config.get("handler"),
            "tool_class": l5_config.get("tool_class"),
            "python_module": tool.get("python_module"),
        }

    def clear_cache(self) -> None:
        """Clear all caches (useful for testing)."""
        self._tools_cache.clear()
        self._agent_tools_cache.clear()
        self._initialized = False


# Convenience functions for use in L5 tools
async def get_tool_config(l5_id: str) -> Optional[Dict[str, Any]]:
    """Get tool configuration from database."""
    loader = ToolLoader.get_instance()
    return await loader.get_tool_config(l5_id)


async def get_agent_tools(agent_id: str) -> List[str]:
    """Get list of L5 tool IDs assigned to an agent."""
    loader = ToolLoader.get_instance()
    return await loader.get_agent_tools(agent_id)


async def get_tool_endpoint(l5_id: str) -> Optional[str]:
    """Get API endpoint for a tool."""
    loader = ToolLoader.get_instance()
    await loader.initialize()
    return loader.get_tool_endpoint(l5_id)
