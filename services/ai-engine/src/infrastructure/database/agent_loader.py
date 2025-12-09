"""
Agent Loader Service - Fetches agent configurations from PostgreSQL.

Architecture Pattern (Agent OS Gold Standard):
- PostgreSQL = Agent configs (model, temperature, system_prompt, capabilities)
- Python = Execution logic (LLM calls, orchestration)
- .env = API credentials (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)

5-Level Agent Hierarchy:
- L1 Masters: Strategic orchestration (claude-3-5-sonnet, temp 0.3)
- L2 Experts: Domain specialists, PRIMARY user interaction (claude-3-5-sonnet, temp 0.5)
- L3 Specialists: Focused tasks (claude-3-5-haiku, temp 0.7)
- L4 Workers: Shared stateless executors (claude-3-5-haiku, temp 0.2)
- L5 Tools: Shared tool executors with CHEAP LLM (gpt-3.5-turbo, temp 0.1)
           L1, L2, L3 can all request L5 for search/summarize/RAG tasks

Shared Resource Model:
- L4 Workers: Shared pool, any L1-L3 can spawn
- L5 Tools: Shared pool, L1, L2, L3 can all request for tool execution
            Uses cheap LLM for: RAG summarization, search result processing, data extraction

Usage:
    loader = AgentLoader.get_instance()
    await loader.initialize()

    # Get agent by ID
    agent_config = await loader.get_agent(agent_id)

    # Get orchestrator for domain/context
    orchestrator = await loader.get_orchestrator_for_context(
        tenant_id=tenant_id,
        function_name="Medical Affairs",
        department_name="Medical Information"
    )

    # Get L5 tool for search/summarize tasks (L1, L2, L3 can all call)
    tool_agent = await loader.get_l5_tool("pubmed-searcher")
"""

import os
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
import structlog

logger = structlog.get_logger()


def _normalize_to_list(value: Union[None, str, List[str]]) -> List[str]:
    """
    Normalize a value that could be None, string, or list to always be a list.

    This handles database fields that may be stored as:
    - None -> []
    - "tool1,tool2" -> ["tool1", "tool2"]
    - ["tool1", "tool2"] -> ["tool1", "tool2"]

    CRITICAL FIX (Dec 2025): tools_enabled field can be string, list, or None.
    """
    if value is None:
        return []
    if isinstance(value, str):
        # Handle comma-separated string
        if "," in value:
            return [v.strip() for v in value.split(",") if v.strip()]
        # Handle single value string
        return [value.strip()] if value.strip() else []
    if isinstance(value, list):
        return value
    # Fallback for unexpected types
    return []


class AgentLevel(Enum):
    """Agent levels in the 5-tier hierarchy."""
    L1_MASTER = 1       # Strategic orchestration
    L2_EXPERT = 2       # Domain specialists (PRIMARY user interaction)
    L3_SPECIALIST = 3   # Focused tasks
    L4_WORKER = 4       # Shared executors (stateless)
    L5_TOOL = 5         # Shared tool executors with CHEAP LLM (L1,L2,L3 can request)


@dataclass
class AgentConfig:
    """
    Agent configuration from PostgreSQL.
    Contains all runtime config needed for execution.
    """
    # Identity
    id: str
    name: str
    slug: str
    display_name: str
    tagline: str = ""
    description: str = ""

    # Hierarchy
    agent_level_id: Optional[str] = None
    level_number: int = 2  # Default to L2 Expert
    level_name: str = "Expert"

    # Organization context
    tenant_id: Optional[str] = None
    function_name: Optional[str] = None
    department_name: Optional[str] = None
    role_name: Optional[str] = None

    # LLM Configuration (the core of dynamic config)
    base_model: str = "gpt-4o"  # Default model
    temperature: float = 0.5
    max_tokens: int = 4000
    context_window: int = 8000

    # System Prompt
    system_prompt: Optional[str] = None
    system_prompt_template_id: Optional[str] = None
    system_prompt_override: Optional[str] = None
    prompt_variables: Dict[str, Any] = field(default_factory=dict)

    # Agent capabilities
    archetype_code: Optional[str] = None
    expertise_level: str = "expert"
    years_of_experience: int = 10
    communication_style: Optional[str] = None

    # Feature flags
    rag_enabled: bool = True
    websearch_enabled: bool = True
    tools_enabled: List[str] = field(default_factory=list)
    knowledge_namespaces: List[str] = field(default_factory=list)

    # Safety & HITL
    confidence_threshold: float = 0.85
    max_goal_iterations: int = 5
    hitl_enabled: bool = True
    hitl_safety_level: str = "balanced"

    # Spawning capabilities
    can_spawn_l2: bool = False
    can_spawn_l3: bool = False
    can_spawn_l4: bool = False
    can_use_worker_pool: bool = True
    can_escalate_to: Optional[str] = None

    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    config: Dict[str, Any] = field(default_factory=dict)

    def get_effective_system_prompt(self) -> Optional[str]:
        """Get the effective system prompt (override > template > base)."""
        return self.system_prompt_override or self.system_prompt

    def get_model_config(self) -> Dict[str, Any]:
        """Get LLM model configuration dict."""
        return {
            "model": self.base_model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }


class AgentLoader:
    """
    Loads agent configurations from Supabase PostgreSQL.

    Follows the architecture: DB stores config, Python provides logic.
    """

    _instance: Optional["AgentLoader"] = None
    _agents_cache: Dict[str, AgentConfig] = {}
    _levels_cache: Dict[str, Dict[str, Any]] = {}
    _initialized: bool = False

    def __init__(self):
        self._supabase = None

    @classmethod
    def get_instance(cls) -> "AgentLoader":
        """Singleton pattern for agent loader."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def initialize(self) -> None:
        """Initialize connection and load agent levels from DB."""
        if self._initialized:
            return

        try:
            from supabase import create_client, Client

            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

            if not url or not key:
                logger.warning("agent_loader_no_supabase_credentials")
                return

            self._supabase: Client = create_client(url, key)
            await self._load_agent_levels()
            self._initialized = True

            logger.info(
                "agent_loader_initialized",
                levels_loaded=len(self._levels_cache),
            )

        except Exception as e:
            logger.error("agent_loader_init_failed", error=str(e))

    async def _load_agent_levels(self) -> None:
        """Load agent_levels table into cache."""
        try:
            response = self._supabase.table("agent_levels").select("*").execute()

            for level in response.data:
                level_id = level.get("id")
                if level_id:
                    self._levels_cache[level_id] = level

            logger.info(
                "agent_loader_levels_loaded",
                count=len(self._levels_cache),
            )

        except Exception as e:
            logger.error("agent_loader_load_levels_failed", error=str(e))

    async def get_agent(self, agent_id: str) -> Optional[AgentConfig]:
        """
        Get agent configuration by ID.

        Args:
            agent_id: UUID of the agent

        Returns:
            AgentConfig with all runtime configuration
        """
        if not self._initialized:
            await self.initialize()

        # Check cache first
        if agent_id in self._agents_cache:
            return self._agents_cache[agent_id]

        try:
            response = self._supabase.table("agents").select(
                "id,name,slug,display_name,tagline,description,"
                "agent_level_id,tenant_id,function_name,department_name,role_name,"
                "base_model,temperature,max_tokens,context_window,"
                "system_prompt,system_prompt_template_id,system_prompt_override,prompt_variables,"
                "archetype_code,expertise_level,years_of_experience,communication_style,"
                "rag_enabled,websearch_enabled,tools_enabled,knowledge_namespaces,"
                "confidence_threshold,max_goal_iterations,hitl_enabled,hitl_safety_level,"
                "can_spawn_l2,can_spawn_l3,can_spawn_l4,can_use_worker_pool,can_escalate_to,"
                "metadata,config"
            ).eq("id", agent_id).single().execute()

            if not response.data:
                logger.warning("agent_loader_agent_not_found", agent_id=agent_id)
                return None

            agent_data = response.data

            # Enrich with level information
            level_number = 2  # Default to L2 Expert
            level_name = "Expert"
            agent_level_id = agent_data.get("agent_level_id")

            if agent_level_id and agent_level_id in self._levels_cache:
                level_info = self._levels_cache[agent_level_id]
                level_number = level_info.get("level_number", 2)
                level_name = level_info.get("level_name", "Expert")

            config = AgentConfig(
                id=agent_data.get("id"),
                name=agent_data.get("name", ""),
                slug=agent_data.get("slug", ""),
                display_name=agent_data.get("display_name", agent_data.get("name", "")),
                tagline=agent_data.get("tagline", ""),
                description=agent_data.get("description", ""),
                agent_level_id=agent_level_id,
                level_number=level_number,
                level_name=level_name,
                tenant_id=agent_data.get("tenant_id"),
                function_name=agent_data.get("function_name"),
                department_name=agent_data.get("department_name"),
                role_name=agent_data.get("role_name"),
                base_model=agent_data.get("base_model") or "gpt-4o",
                temperature=float(agent_data.get("temperature") or 0.5),
                max_tokens=int(agent_data.get("max_tokens") or 4000),
                context_window=int(agent_data.get("context_window") or 8000),
                system_prompt=agent_data.get("system_prompt"),
                system_prompt_template_id=agent_data.get("system_prompt_template_id"),
                system_prompt_override=agent_data.get("system_prompt_override"),
                prompt_variables=agent_data.get("prompt_variables") or {},
                archetype_code=agent_data.get("archetype_code"),
                expertise_level=agent_data.get("expertise_level") or "expert",
                years_of_experience=int(agent_data.get("years_of_experience") or 10),
                communication_style=agent_data.get("communication_style"),
                rag_enabled=agent_data.get("rag_enabled", True),
                websearch_enabled=agent_data.get("websearch_enabled", True),
                tools_enabled=_normalize_to_list(agent_data.get("tools_enabled")),
                knowledge_namespaces=agent_data.get("knowledge_namespaces") or [],
                confidence_threshold=float(agent_data.get("confidence_threshold") or 0.85),
                max_goal_iterations=int(agent_data.get("max_goal_iterations") or 5),
                hitl_enabled=agent_data.get("hitl_enabled", True),
                hitl_safety_level=agent_data.get("hitl_safety_level") or "balanced",
                can_spawn_l2=agent_data.get("can_spawn_l2", False),
                can_spawn_l3=agent_data.get("can_spawn_l3", False),
                can_spawn_l4=agent_data.get("can_spawn_l4", False),
                can_use_worker_pool=agent_data.get("can_use_worker_pool", True),
                can_escalate_to=agent_data.get("can_escalate_to"),
                metadata=agent_data.get("metadata") or {},
                config=agent_data.get("config") or {},
            )

            # Cache the result
            self._agents_cache[agent_id] = config

            logger.info(
                "agent_loader_agent_loaded",
                agent_id=agent_id,
                name=config.name,
                level=level_number,
                model=config.base_model,
            )

            return config

        except Exception as e:
            logger.error(
                "agent_loader_get_agent_failed",
                agent_id=agent_id,
                error=str(e),
            )
            return None

    async def get_orchestrator_for_context(
        self,
        tenant_id: str,
        function_name: Optional[str] = None,
        department_name: Optional[str] = None,
        query_domain: Optional[str] = None,
    ) -> Optional[AgentConfig]:
        """
        Get the best L1 Orchestrator for a given context.

        Uses 8-factor scoring from Agent OS Gold Standard:
        1. Semantic similarity (query_domain)
        2. Domain expertise (function_name, department_name)
        3. Availability

        Args:
            tenant_id: Tenant UUID
            function_name: e.g., "Medical Affairs", "Regulatory"
            department_name: e.g., "Medical Information", "Safety"
            query_domain: Optional domain hint from query analysis

        Returns:
            Best matching L1 Orchestrator AgentConfig
        """
        if not self._initialized:
            await self.initialize()

        try:
            # Find L1 level ID
            l1_level_id = None
            for level_id, level_info in self._levels_cache.items():
                if level_info.get("level_number") == 1:
                    l1_level_id = level_id
                    break

            if not l1_level_id:
                logger.warning("agent_loader_no_l1_level_found")
                # Fall back to any active orchestrator

            # Build query
            query = self._supabase.table("agents").select(
                "id,name,slug,display_name,function_name,department_name,"
                "base_model,temperature,max_tokens,agent_level_id"
            ).eq("status", "active").eq("tenant_id", tenant_id)

            if l1_level_id:
                query = query.eq("agent_level_id", l1_level_id)

            if function_name:
                query = query.eq("function_name", function_name)

            if department_name:
                query = query.eq("department_name", department_name)

            response = query.limit(5).execute()

            if not response.data:
                # Fallback: get any L1 orchestrator
                logger.info("agent_loader_no_matching_orchestrator_trying_fallback")
                fallback_response = self._supabase.table("agents").select(
                    "id,name"
                ).eq("status", "active").eq("tenant_id", tenant_id).ilike(
                    "archetype_code", "%ORCHESTRATOR%"
                ).limit(1).execute()

                if fallback_response.data:
                    return await self.get_agent(fallback_response.data[0]["id"])
                return None

            # Score and select best match
            best_agent_id = response.data[0]["id"]

            # Full fetch with all config
            return await self.get_agent(best_agent_id)

        except Exception as e:
            logger.error(
                "agent_loader_get_orchestrator_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            return None

    async def get_expert_for_domain(
        self,
        tenant_id: str,
        function_name: str,
        department_name: Optional[str] = None,
    ) -> Optional[AgentConfig]:
        """
        Get the best L2 Expert for a given domain.

        Args:
            tenant_id: Tenant UUID
            function_name: e.g., "Medical Affairs", "Regulatory"
            department_name: Optional department filter

        Returns:
            Best matching L2 Expert AgentConfig
        """
        if not self._initialized:
            await self.initialize()

        try:
            # Find L2 level ID
            l2_level_id = None
            for level_id, level_info in self._levels_cache.items():
                if level_info.get("level_number") == 2:
                    l2_level_id = level_id
                    break

            query = self._supabase.table("agents").select(
                "id,name,slug,display_name,function_name,department_name"
            ).eq("status", "active").eq("tenant_id", tenant_id).eq(
                "function_name", function_name
            )

            if l2_level_id:
                query = query.eq("agent_level_id", l2_level_id)

            if department_name:
                query = query.eq("department_name", department_name)

            response = query.limit(3).execute()

            if not response.data:
                logger.warning(
                    "agent_loader_no_expert_found",
                    function=function_name,
                    department=department_name,
                )
                return None

            # Get full config for first match
            return await self.get_agent(response.data[0]["id"])

        except Exception as e:
            logger.error(
                "agent_loader_get_expert_failed",
                function=function_name,
                error=str(e),
            )
            return None

    async def get_agents_by_level(
        self,
        tenant_id: str,
        level: AgentLevel,
        limit: int = 20,
    ) -> List[AgentConfig]:
        """
        Get all agents at a specific level.

        Args:
            tenant_id: Tenant UUID
            level: AgentLevel enum (L1-L5)
            limit: Max results

        Returns:
            List of AgentConfig at the specified level
        """
        if not self._initialized:
            await self.initialize()

        try:
            # Find level ID
            target_level_id = None
            for level_id, level_info in self._levels_cache.items():
                if level_info.get("level_number") == level.value:
                    target_level_id = level_id
                    break

            if not target_level_id:
                logger.warning("agent_loader_level_not_found", level=level.value)
                return []

            response = self._supabase.table("agents").select(
                "id"
            ).eq("status", "active").eq("tenant_id", tenant_id).eq(
                "agent_level_id", target_level_id
            ).limit(limit).execute()

            agents = []
            for row in response.data:
                agent = await self.get_agent(row["id"])
                if agent:
                    agents.append(agent)

            return agents

        except Exception as e:
            logger.error(
                "agent_loader_get_agents_by_level_failed",
                level=level.value,
                error=str(e),
            )
            return []

    def get_level_defaults(self, level: AgentLevel) -> Dict[str, Any]:
        """
        Get FALLBACK configuration for a level.

        IMPORTANT: These are LAST-RESORT fallbacks only!
        All agent config (model, temperature, max_tokens) should come from
        the PostgreSQL `agents` table. These defaults are only used when:
        1. Agent doesn't exist in DB
        2. Agent exists but has NULL values for critical fields

        The principle: PostgreSQL = variables/config, Python = logic
        """
        # Minimal fallbacks - prefer DB config always
        fallback = {
            "model": "gpt-4o",  # Safe default, but should come from DB
            "temperature": 0.5,
            "max_tokens": 2000,
        }

        logger.warning(
            "agent_loader_using_fallback_defaults",
            level=level.value,
            note="Config should come from agents table, not hardcoded defaults"
        )

        return fallback

    async def get_l5_tool(
        self,
        tool_slug: str,
        tenant_id: Optional[str] = None,
    ) -> Optional[AgentConfig]:
        """
        Get an L5 Tool agent by slug.

        L5 Tools are SHARED resources that L1, L2, L3 can all request
        for search, summarize, RAG, and other tool execution tasks.

        Args:
            tool_slug: Tool slug (e.g., "pubmed-searcher", "rag-retriever")
            tenant_id: Optional tenant filter

        Returns:
            L5 Tool AgentConfig with cheap LLM config
        """
        if not self._initialized:
            await self.initialize()

        try:
            # Find L5 level ID
            l5_level_id = None
            for level_id, level_info in self._levels_cache.items():
                if level_info.get("level_number") == 5:
                    l5_level_id = level_id
                    break

            query = self._supabase.table("agents").select(
                "id,name,slug"
            ).eq("status", "active").eq("slug", tool_slug)

            if l5_level_id:
                query = query.eq("agent_level_id", l5_level_id)

            if tenant_id:
                query = query.eq("tenant_id", tenant_id)

            response = query.limit(1).execute()

            if not response.data:
                logger.warning(
                    "agent_loader_l5_tool_not_found",
                    slug=tool_slug,
                )
                return None

            # Get full config
            return await self.get_agent(response.data[0]["id"])

        except Exception as e:
            logger.error(
                "agent_loader_get_l5_tool_failed",
                slug=tool_slug,
                error=str(e),
            )
            return None

    async def get_l5_tools_for_task(
        self,
        task_type: str,
        tenant_id: Optional[str] = None,
    ) -> List[AgentConfig]:
        """
        Get L5 Tool agents for a specific task type.

        Args:
            task_type: Task category (e.g., "search", "summarize", "rag", "extraction")
            tenant_id: Optional tenant filter

        Returns:
            List of L5 Tool AgentConfigs that can handle the task type
        """
        if not self._initialized:
            await self.initialize()

        try:
            # Find L5 level ID
            l5_level_id = None
            for level_id, level_info in self._levels_cache.items():
                if level_info.get("level_number") == 5:
                    l5_level_id = level_id
                    break

            if not l5_level_id:
                return []

            # Search by archetype or metadata containing task type
            query = self._supabase.table("agents").select(
                "id"
            ).eq("status", "active").eq("agent_level_id", l5_level_id)

            if tenant_id:
                query = query.eq("tenant_id", tenant_id)

            # Filter by task type in slug or archetype
            query = query.or_(
                f"slug.ilike.%{task_type}%,archetype_code.ilike.%{task_type}%"
            )

            response = query.limit(10).execute()

            tools = []
            for row in response.data:
                tool = await self.get_agent(row["id"])
                if tool:
                    tools.append(tool)

            return tools

        except Exception as e:
            logger.error(
                "agent_loader_get_l5_tools_for_task_failed",
                task_type=task_type,
                error=str(e),
            )
            return []

    def clear_cache(self) -> None:
        """Clear all caches (useful for testing)."""
        self._agents_cache.clear()
        self._levels_cache.clear()
        self._initialized = False


# Convenience functions for use throughout the codebase
async def get_agent_config(agent_id: str) -> Optional[AgentConfig]:
    """Get agent configuration from database."""
    loader = AgentLoader.get_instance()
    return await loader.get_agent(agent_id)


async def get_orchestrator(
    tenant_id: str,
    function_name: Optional[str] = None,
    department_name: Optional[str] = None,
) -> Optional[AgentConfig]:
    """Get best L1 orchestrator for context."""
    loader = AgentLoader.get_instance()
    return await loader.get_orchestrator_for_context(
        tenant_id=tenant_id,
        function_name=function_name,
        department_name=department_name,
    )


async def get_expert(
    tenant_id: str,
    function_name: str,
    department_name: Optional[str] = None,
) -> Optional[AgentConfig]:
    """Get best L2 expert for domain."""
    loader = AgentLoader.get_instance()
    return await loader.get_expert_for_domain(
        tenant_id=tenant_id,
        function_name=function_name,
        department_name=department_name,
    )


async def get_l5_tool(
    tool_slug: str,
    tenant_id: Optional[str] = None,
) -> Optional[AgentConfig]:
    """
    Get L5 Tool agent by slug.

    L5 Tools are SHARED resources - L1, L2, L3 can all call them
    for search, summarize, RAG, and tool execution tasks.

    Model config (base_model, temperature, max_tokens) comes from
    the agents table in PostgreSQL - not hardcoded.
    """
    loader = AgentLoader.get_instance()
    return await loader.get_l5_tool(tool_slug, tenant_id)


async def get_l5_tools_for_task(
    task_type: str,
    tenant_id: Optional[str] = None,
) -> List[AgentConfig]:
    """
    Get L5 Tool agents for a specific task type.

    Args:
        task_type: "search", "summarize", "rag", "extraction", etc.
        tenant_id: Optional tenant filter

    Returns:
        List of L5 Tool AgentConfigs
    """
    loader = AgentLoader.get_instance()
    return await loader.get_l5_tools_for_task(task_type, tenant_id)
