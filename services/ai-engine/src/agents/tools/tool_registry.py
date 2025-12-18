"""
L5 Tool Registry - Database-driven tool management.

Architecture Pattern:
- PostgreSQL `tools` table: Tool configs (endpoints, handlers, metadata)
- PostgreSQL `agent_tool_assignments`: Agent-to-tool mappings
- .env file: API credentials (NCBI_API_KEY, etc.)
- Python: Tool execution logic

Flow:
1. Get agent's allowed tools from `agent_tool_assignments`
2. Load tool config from `tools` table
3. Get credentials from .env
4. Execute tool with real API calls
"""

import os
from typing import Any, Dict, List, Optional
import structlog

from .l5_literature import LiteratureL5Tool
from .l5_general import GeneralL5Tool, GeneralSource
from .l5_regulatory import RegulatoryL5Tool
from .l5_statistics import StatisticsL5Tool
from .l5_data_quality import DataQualityL5Tool
from .l5_ai_frameworks import AIFrameworksL5Tool
from .l5_base import ToolConfig, L5BaseTool, L5Result

logger = structlog.get_logger()


# =============================================================================
# TOOL CLASS MAPPING - Maps domain to Python implementation class
# =============================================================================

TOOL_CLASS_MAP: Dict[str, type] = {
    "LiteratureL5Tool": LiteratureL5Tool,
    "RegulatoryL5Tool": RegulatoryL5Tool,
    "GeneralL5Tool": GeneralL5Tool,
    "StatisticsL5Tool": StatisticsL5Tool,
    "DataQualityL5Tool": DataQualityL5Tool,
    "AIFrameworksL5Tool": AIFrameworksL5Tool,
}

# Domain to tool key mapping (used to create tools from DB config)
DOMAIN_TOOL_KEY_MAP: Dict[str, Dict[str, str]] = {
    "literature": {
        "L5-PM": "pubmed",
        "L5-CT": "clinicaltrials",
        "L5-CO": "cochrane",
    },
    "regulatory": {
        "L5-OPENFDA": "openfda",
        "L5-FDA": "fda_drugs",
        "L5-EMA": "ema",
    },
    "heor": {
        "L5-CM": "cms_medicare",
        "L5-VA": "visible_analytics",
    },
    "nlp": {
        "L5-SP": "scispacy",
        "L5-BB": "biobert",
        "L5-CB": "clinicalbert",
    },
    "bioinformatics": {
        "L5-BL": "blast",
        "L5-BP": "biopython",
        "L5-EN": "ensembl",
    },
    "rwe": {
        "L5-OM": "omop",
        "L5-AC": "achilles",
    },
}


class _StubDeterministicTool(L5BaseTool):
    """Fallback tool when real implementation unavailable."""

    def __init__(self, tool_id: str, slug: str, description: str):
        super().__init__(
            ToolConfig(
                id=tool_id,
                name=description,
                slug=slug,
                description=description,
                category="utility",
                tier=2,
            )
        )

    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        return {"note": f"{self.config.id} stub executed", "params": params}


def _create_tool_from_config(l5_id: str, db_config: Dict[str, Any]) -> L5BaseTool:
    """
    Create an L5 tool instance from database configuration.

    Args:
        l5_id: The L5 tool ID (e.g., "L5-PM")
        db_config: Tool config from database

    Returns:
        L5BaseTool instance
    """
    metadata = db_config.get("metadata", {})
    l5_config = metadata.get("l5_config", {})

    domain = l5_config.get("domain", "general")
    tool_class_name = l5_config.get("tool_class")
    handler = l5_config.get("handler")

    # Try to find tool key from domain mapping
    tool_key = None
    if domain in DOMAIN_TOOL_KEY_MAP:
        tool_key = DOMAIN_TOOL_KEY_MAP[domain].get(l5_id)

    # Try to create using registered tool class
    if tool_class_name and tool_class_name in TOOL_CLASS_MAP:
        tool_class = TOOL_CLASS_MAP[tool_class_name]
        try:
            if tool_key:
                return tool_class(tool_key)
            else:
                # For GeneralL5Tool which uses enum
                if tool_class_name == "GeneralL5Tool":
                    if l5_id == "L5-WEB":
                        return GeneralL5Tool(GeneralSource.WEB_SEARCH)
                    elif l5_id == "L5-RAG":
                        return GeneralL5Tool(GeneralSource.RAG)
                return tool_class(l5_id.replace("L5-", "").lower())
        except Exception as e:
            logger.warning(
                "tool_registry_create_tool_failed",
                l5_id=l5_id,
                tool_class=tool_class_name,
                error=str(e),
            )

    # Fallback to stub
    return _StubDeterministicTool(
        l5_id,
        db_config.get("slug", l5_id.lower()),
        db_config.get("description", f"{l5_id} tool"),
    )


class ToolRegistry:
    """
    Database-driven L5 tool registry.

    Loads tool configurations from PostgreSQL and creates tool instances.
    Supports agent-specific tool access via agent_tool_assignments.
    """

    # Static tool cache (loaded on first use)
    _TOOLS: Dict[str, L5BaseTool] = {}
    _initialized: bool = False
    _db_config_cache: Dict[str, Dict[str, Any]] = {}

    @classmethod
    async def initialize(cls) -> None:
        """Initialize registry by loading tools from database."""
        if cls._initialized:
            return

        try:
            from infrastructure.database.tool_loader import ToolLoader

            loader = ToolLoader.get_instance()
            await loader.initialize()

            # Load all available tools
            for l5_id in await loader.get_all_tool_ids():
                config = await loader.get_tool_config(l5_id)
                if config:
                    cls._db_config_cache[l5_id] = config
                    cls._TOOLS[l5_id] = _create_tool_from_config(l5_id, config)

            cls._initialized = True
            logger.info(
                "tool_registry_initialized_from_db",
                tool_count=len(cls._TOOLS),
                tools=list(cls._TOOLS.keys())[:10],
            )

        except Exception as e:
            logger.warning(
                "tool_registry_db_init_failed_using_fallback",
                error=str(e),
            )
            # Fall back to hardcoded tools
            cls._init_fallback_tools()
            cls._initialized = True

    @classmethod
    def _init_fallback_tools(cls) -> None:
        """Initialize with hardcoded fallback tools when DB unavailable."""
        fallback_tools = {
            "L5-PM": ("pubmed", LiteratureL5Tool),
            "L5-CT": ("clinicaltrials", LiteratureL5Tool),
            "L5-OPENFDA": ("openfda", RegulatoryL5Tool),
            "L5-CALC": ("calculator", StatisticsL5Tool),
            "L5-FMT": ("validator", DataQualityL5Tool),
        }

        for l5_id, (tool_key, tool_class) in fallback_tools.items():
            try:
                cls._TOOLS[l5_id] = tool_class(tool_key)
            except Exception:
                cls._TOOLS[l5_id] = _StubDeterministicTool(l5_id, tool_key, f"{l5_id} tool")

        # Special handling for GeneralL5Tool
        try:
            cls._TOOLS["L5-WEB"] = GeneralL5Tool(GeneralSource.WEB_SEARCH)
            cls._TOOLS["L5-RAG"] = GeneralL5Tool(GeneralSource.RAG)
        except Exception:
            cls._TOOLS["L5-WEB"] = _StubDeterministicTool("L5-WEB", "web-search", "Web search")
            cls._TOOLS["L5-RAG"] = _StubDeterministicTool("L5-RAG", "rag", "RAG retrieval")

        logger.info("tool_registry_initialized_fallback", tool_count=len(cls._TOOLS))

    @classmethod
    def get_tool(cls, tool_id: str) -> L5BaseTool:
        """Get a tool by L5 ID."""
        # Lazy init if not done
        if not cls._initialized:
            cls._init_fallback_tools()
            cls._initialized = True

        if tool_id not in cls._TOOLS:
            logger.warning("tool_registry_unknown_tool", tool_id=tool_id)
            return _StubDeterministicTool(tool_id, tool_id.lower(), f"{tool_id} not found")

        return cls._TOOLS[tool_id]

    @classmethod
    async def get_agent_tools(cls, agent_id: str) -> List[str]:
        """
        Get list of L5 tool IDs assigned to an agent.

        Queries agent_tool_assignments table to get the agent's allowed tools.
        """
        try:
            from infrastructure.database.tool_loader import ToolLoader

            loader = ToolLoader.get_instance()
            return await loader.get_agent_tools(agent_id)

        except Exception as e:
            logger.warning(
                "tool_registry_get_agent_tools_failed",
                agent_id=agent_id,
                error=str(e),
            )
            # Return default tools for fallback
            return ["L5-PM", "L5-CT", "L5-WEB"]

    @classmethod
    async def execute_tool(cls, tool_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool by L5 ID with parameters."""
        tool = cls.get_tool(tool_id)

        logger.info(
            "tool_registry_execute_tool",
            tool_id=tool_id,
            params_keys=list(params.keys()),
        )

        result = await tool.execute(params)

        if isinstance(result, L5Result):
            return result.to_dict()
        return result.to_dict() if hasattr(result, "to_dict") else result

    @classmethod
    async def execute_for_agent(
        cls,
        agent_id: str,
        tool_id: str,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Execute a tool for a specific agent, checking permissions.

        Args:
            agent_id: The agent requesting tool execution
            tool_id: The L5 tool ID
            params: Tool parameters

        Returns:
            Tool execution result or permission denied error
        """
        # Get agent's allowed tools
        allowed_tools = await cls.get_agent_tools(agent_id)

        # Check if tool is allowed (empty list = allow all for backwards compat)
        if allowed_tools and tool_id not in allowed_tools:
            logger.warning(
                "tool_registry_permission_denied",
                agent_id=agent_id,
                tool_id=tool_id,
                allowed=allowed_tools,
            )
            return {
                "success": False,
                "error": f"Tool {tool_id} not authorized for this agent",
                "allowed_tools": allowed_tools,
            }

        return await cls.execute_tool(tool_id, params)

    @classmethod
    def get_tool_config(cls, tool_id: str) -> Optional[Dict[str, Any]]:
        """Get database config for a tool."""
        return cls._db_config_cache.get(tool_id)

    @classmethod
    def list_available_tools(cls) -> List[str]:
        """List all available tool IDs."""
        if not cls._initialized:
            cls._init_fallback_tools()
            cls._initialized = True
        return list(cls._TOOLS.keys())
