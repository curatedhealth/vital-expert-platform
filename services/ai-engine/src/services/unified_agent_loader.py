"""
Unified Agent Loader Service for VITAL Platform

This service provides a centralized mechanism for loading agent profiles
from the database and managing agent lifecycle across all Ask Expert modes.

Key Features:
- Load agents by ID with tenant isolation (Golden Rule #3)
- Load agent pools for automatic selection (Mode 2/4)
- Load sub-agent hierarchies (Level 3 specialists)
- Handle fallback agents for graceful degradation
- Cache frequently-used agents (future)

Usage:
    loader = UnifiedAgentLoader(supabase_client)
    agent_profile = await loader.load_agent_by_id(agent_id, tenant_id)

Author: LangGraph Orchestration Architect
Date: November 21, 2025
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import structlog
from supabase import Client as SupabaseClient

logger = structlog.get_logger()


class AgentProfile(BaseModel):
    """
    Complete agent profile loaded from database.

    This is the canonical representation of an agent that flows through
    LangGraph workflows. All agent metadata is captured here.
    """
    # Core Identity
    id: str = Field(..., description="Agent UUID from database")
    name: str = Field(..., description="Unique internal name (e.g., 'fda_510k_expert')")
    display_name: str = Field(..., description="User-facing name (e.g., 'Dr. Sarah Mitchell')")
    description: str = Field(..., description="Agent description/bio")

    # AI Configuration
    model: str = Field(default="gpt-4", description="LLM model to use")
    system_prompt: str = Field(..., description="Agent persona and instructions")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="LLM temperature")
    max_tokens: int = Field(default=2000, ge=1, le=32000, description="Max tokens per response")
    response_format: str = Field(default="markdown", description="Response format")

    # Capabilities & Knowledge
    capabilities: List[str] = Field(
        default_factory=list,
        description="Agent capabilities (e.g., ['510k submission', 'predicate search'])"
    )
    knowledge_base_ids: List[str] = Field(
        default_factory=list,
        description="RAG knowledge base IDs to search"
    )
    domain_expertise: str = Field(
        default="general",
        description="Primary domain (e.g., 'regulatory', 'medical')"
    )

    # Sub-Agent Pool
    sub_agent_pool: List[str] = Field(
        default_factory=list,
        description="IDs of Level 3 specialist sub-agents"
    )

    # Metadata
    tier: int = Field(default=2, ge=1, le=3, description="Agent tier (1=expert, 2=advanced, 3=general)")
    priority: int = Field(default=0, description="Selection priority (higher = preferred)")
    status: str = Field(default="active", description="Agent status")
    avatar: str = Field(default="🤖", description="Avatar emoji or URL")
    color: str = Field(default="#3B82F6", description="Theme color (hex)")

    # Tenant Isolation (Golden Rule #3)
    tenant_id: str = Field(..., description="Owner tenant UUID ('platform' for shared agents)")
    is_custom: bool = Field(default=False, description="User-created agent?")
    created_by: Optional[str] = Field(None, description="User ID who created agent")

    # Agent Hierarchy & Spawning (5-Level Deep Architecture)
    agent_level_id: Optional[str] = Field(None, description="Agent level UUID (L1-L5)")
    reports_to_agent_id: Optional[str] = Field(None, description="Parent agent UUID in hierarchy")
    can_escalate_to: Optional[str] = Field(None, description="Agent to escalate to when unsure")
    can_spawn_l2: bool = Field(default=False, description="Can spawn Level 2 Expert agents")
    can_spawn_l3: bool = Field(default=False, description="Can spawn Level 3 Specialist agents")
    can_spawn_l4: bool = Field(default=False, description="Can spawn Level 4 Worker agents")
    can_use_worker_pool: bool = Field(default=False, description="Can use shared worker pool")

    # Additional Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        frozen = False  # Allow modifications during workflow


class AgentLoadError(Exception):
    """Raised when agent loading fails."""
    pass


class UnifiedAgentLoader:
    """
    Unified agent loading service for all Ask Expert modes.

    Responsibilities:
    - Load agent profiles from database (agents table)
    - Validate agent availability and permissions
    - Enforce tenant isolation (Golden Rule #3)
    - Provide fallback agents for graceful degradation
    - Support sub-agent hierarchy loading
    """

    def __init__(self, supabase: SupabaseClient):
        """
        Initialize agent loader.

        Args:
            supabase: Supabase client with user context (for RLS)
        """
        self.supabase = supabase
        self._agent_cache: Dict[str, AgentProfile] = {}
        self._platform_tenant_id = "platform"  # Platform agents accessible to all

    async def load_agent_by_id(
        self,
        agent_id: str,
        tenant_id: str,
        user_id: Optional[str] = None
    ) -> AgentProfile:
        """
        Load agent profile by ID with tenant isolation.

        Args:
            agent_id: Agent UUID from database
            tenant_id: User's tenant ID (for RLS enforcement)
            user_id: Optional user ID (for custom agent access)

        Returns:
            AgentProfile with complete agent data

        Raises:
            AgentLoadError: If agent not found, inactive, or unauthorized
        """
        try:
            logger.info(
                "agent_loader.load_by_id_start",
                agent_id=agent_id,
                tenant_id=tenant_id
            )

            # Query agents table
            # Note: Supabase RLS will automatically filter by tenant
            response = self.supabase.table("agents") \
                .select("""
                    id,
                    tenant_id,
                    name,
                    display_name,
                    description,
                    system_prompt,
                    base_model,
                    temperature,
                    max_tokens,
                    specializations,
                    metadata,
                    status,
                    avatar_url,
                    color_scheme,
                    created_at,
                    updated_at,
                    agent_level_id,
                    reports_to_agent_id,
                    can_escalate_to,
                    can_spawn_l2,
                    can_spawn_l3,
                    can_spawn_l4
                """) \
                .eq("id", agent_id) \
                .in_("status", ["active", "testing"]) \
                .single() \
                .execute()

            if not response.data:
                raise AgentLoadError(
                    f"Agent {agent_id} not found or inactive. "
                    "Ensure agent exists and status is 'active' or 'testing'."
                )

            agent_data = response.data

            # Validate tenant access
            # Platform agents (tenant_id = 'platform') are accessible to all tenants
            # Custom agents only accessible to owner tenant
            agent_tenant = agent_data.get("tenant_id")
            if agent_tenant != tenant_id and agent_tenant != self._platform_tenant_id:
                raise AgentLoadError(
                    f"Agent {agent_id} not accessible to tenant {tenant_id}. "
                    f"Agent belongs to tenant {agent_tenant}."
                )

            # Parse metadata (JSONB field)
            metadata = agent_data.get("metadata") or {}

            # Build AgentProfile
            profile = self._build_agent_profile(agent_data, metadata)

            logger.info(
                "agent_loader.load_by_id_success",
                agent_id=agent_id,
                display_name=profile.display_name,
                domain=profile.domain_expertise,
                tier=profile.tier,
                has_sub_agents=len(profile.sub_agent_pool) > 0
            )

            return profile

        except AgentLoadError:
            # Re-raise known errors
            raise
        except Exception as e:
            logger.error(
                "agent_loader.load_by_id_error",
                agent_id=agent_id,
                tenant_id=tenant_id,
                error=str(e),
                error_type=type(e).__name__
            )
            raise AgentLoadError(f"Failed to load agent {agent_id}: {str(e)}")

    async def load_default_agent_for_domain(
        self,
        domain: str,
        tenant_id: str
    ) -> AgentProfile:
        """
        Load default platform agent for a domain.

        Used as fallback when:
        - Auto-selection fails (Mode 2/4)
        - User doesn't specify agent (Mode 1/3 with optional selection)
        - Selected agent is unavailable

        Args:
            domain: Domain expertise (e.g., "regulatory", "medical", "general")
            tenant_id: User's tenant ID

        Returns:
            AgentProfile for default domain expert
        """
        try:
            logger.info(
                "agent_loader.load_default_start",
                domain=domain,
                tenant_id=tenant_id
            )

            # Query for platform agent matching domain
            # Order by tier (1 = best) and priority (highest first)
            response = self.supabase.table("agents") \
                .select("id") \
                .eq("tenant_id", self._platform_tenant_id) \
                .eq("status", "active") \
                .filter("metadata->>domain_expertise", "eq", domain) \
                .order("metadata->>tier", {"ascending": True}) \
                .order("metadata->>priority", {"ascending": False}) \
                .limit(1) \
                .execute()

            if response.data:
                agent_id = response.data[0]["id"]
                return await self.load_agent_by_id(agent_id, tenant_id)

            # No domain-specific agent found, fall back to general
            if domain != "general":
                logger.warning(
                    "agent_loader.domain_not_found",
                    domain=domain,
                    fallback_to="general"
                )
                return await self.load_default_agent_for_domain("general", tenant_id)

            # Ultimate fallback: return minimal general agent
            return self._create_fallback_agent()

        except Exception as e:
            logger.error(
                "agent_loader.load_default_error",
                domain=domain,
                error=str(e)
            )
            return self._create_fallback_agent()

    async def load_sub_agent_pool(
        self,
        parent_agent: AgentProfile,
        tenant_id: str
    ) -> List[AgentProfile]:
        """
        Load sub-agent pool for a parent agent.

        Loads Level 3 specialist sub-agents that can be spawned for
        complex queries requiring domain-specific expertise.

        Args:
            parent_agent: Parent agent profile
            tenant_id: User's tenant ID

        Returns:
            List of sub-agent profiles (may be empty)
        """
        try:
            if not parent_agent.sub_agent_pool:
                return []

            logger.info(
                "agent_loader.load_sub_pool_start",
                parent_agent=parent_agent.name,
                sub_agent_count=len(parent_agent.sub_agent_pool)
            )

            sub_agents: List[AgentProfile] = []

            # Load each sub-agent
            for sub_agent_id in parent_agent.sub_agent_pool:
                try:
                    sub_agent = await self.load_agent_by_id(
                        sub_agent_id,
                        tenant_id
                    )
                    sub_agents.append(sub_agent)

                except AgentLoadError as e:
                    # Log warning but continue loading other sub-agents
                    logger.warning(
                        "agent_loader.sub_agent_load_failed",
                        sub_agent_id=sub_agent_id,
                        parent_agent=parent_agent.name,
                        error=str(e)
                    )
                    # Don't block on individual sub-agent failures

            logger.info(
                "agent_loader.load_sub_pool_success",
                parent_agent=parent_agent.name,
                loaded_count=len(sub_agents),
                requested_count=len(parent_agent.sub_agent_pool)
            )

            return sub_agents

        except Exception as e:
            logger.error(
                "agent_loader.load_sub_pool_error",
                parent_agent=parent_agent.name,
                error=str(e)
            )
            return []

    def _build_agent_profile(
        self,
        agent_data: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> AgentProfile:
        """
        Build AgentProfile from database row.

        Handles field mapping and defaults.
        """
        # Parse color_scheme (if JSONB)
        color_scheme = agent_data.get("color_scheme") or {}
        color = color_scheme.get("primary") if isinstance(color_scheme, dict) else "#3B82F6"

        return AgentProfile(
            id=agent_data["id"],
            name=agent_data["name"],
            display_name=metadata.get("display_name") or agent_data.get("display_name") or agent_data["name"],
            description=agent_data.get("description", ""),
            system_prompt=agent_data.get("system_prompt", "You are a helpful AI assistant."),
            model=metadata.get("model") or agent_data.get("base_model") or "gpt-4",
            temperature=metadata.get("temperature") or agent_data.get("temperature") or 0.7,
            max_tokens=metadata.get("max_tokens") or agent_data.get("max_tokens") or 2000,
            capabilities=agent_data.get("specializations") or metadata.get("capabilities") or [],
            knowledge_base_ids=metadata.get("knowledge_base_ids", []),
            domain_expertise=metadata.get("domain_expertise", "general"),
            sub_agent_pool=metadata.get("sub_agents", []),
            tier=int(metadata.get("tier", 2)),
            priority=int(metadata.get("priority", 0)),
            status=agent_data.get("status", "active"),
            avatar=agent_data.get("avatar_url", "🤖"),
            color=color,
            tenant_id=agent_data.get("tenant_id", "platform"),
            is_custom=metadata.get("is_custom", False),
            created_by=metadata.get("created_by"),
            metadata=metadata,
            created_at=agent_data.get("created_at"),
            updated_at=agent_data.get("updated_at"),
            # Agent Hierarchy & Spawning (5-Level Deep Architecture)
            agent_level_id=agent_data.get("agent_level_id"),
            reports_to_agent_id=agent_data.get("reports_to_agent_id"),
            can_escalate_to=agent_data.get("can_escalate_to"),
            can_spawn_l2=agent_data.get("can_spawn_l2", False),
            can_spawn_l3=agent_data.get("can_spawn_l3", False),
            can_spawn_l4=agent_data.get("can_spawn_l4", False),
            can_use_worker_pool=metadata.get("can_use_worker_pool", False),
        )

    def _create_fallback_agent(self) -> AgentProfile:
        """
        Create minimal fallback agent for ultimate graceful degradation.

        Used when no agents are available in database.
        """
        logger.warning("agent_loader.using_fallback_agent")

        return AgentProfile(
            id="fallback_general_assistant",
            name="general_assistant",
            display_name="General Assistant",
            description="General purpose AI assistant with broad knowledge across multiple domains.",
            system_prompt="You are a helpful AI assistant with expertise in healthcare, regulatory affairs, and general knowledge. Provide accurate, well-researched responses.",
            model="gpt-4",
            temperature=0.7,
            max_tokens=2000,
            capabilities=["general assistance", "research", "analysis"],
            knowledge_base_ids=[],
            domain_expertise="general",
            sub_agent_pool=[],
            tier=3,
            priority=0,
            status="active",
            avatar="🤖",
            color="#6B7280",
            tenant_id="platform",
            is_custom=False
        )


# =======================
# CITATION PREFERENCES
# =======================

class CitationPreferences(BaseModel):
    """
    Agent citation preferences extracted from metadata.

    Used to pass citation formatting preferences from agent settings
    to workflow state and tools.
    """
    citation_style: str = Field(
        default="apa",
        description="Citation style: apa, ama, chicago, harvard, vancouver, icmje, mla"
    )
    include_citations: bool = Field(
        default=True,
        description="Whether to include citations in responses"
    )

    @classmethod
    def from_metadata(cls, metadata: Dict[str, Any]) -> "CitationPreferences":
        """
        Extract citation preferences from agent metadata JSONB.

        Args:
            metadata: Agent metadata dictionary

        Returns:
            CitationPreferences with values from metadata or defaults
        """
        return cls(
            citation_style=metadata.get("citation_style", "apa"),
            include_citations=metadata.get("include_citations", True)
        )


async def get_agent_citation_preferences(
    supabase: SupabaseClient,
    agent_id: str
) -> CitationPreferences:
    """
    Fetch citation preferences for an agent from database.

    This is a lightweight query that only fetches the metadata field,
    avoiding the overhead of loading the full agent profile.

    Args:
        supabase: Supabase client
        agent_id: Agent UUID

    Returns:
        CitationPreferences with agent's settings or defaults

    Example:
        >>> prefs = await get_agent_citation_preferences(supabase, agent_id)
        >>> initial_state = create_initial_state(
        ...     citation_style=prefs.citation_style,
        ...     include_citations=prefs.include_citations,
        ...     ...
        ... )
    """
    try:
        response = supabase.table("agents") \
            .select("metadata") \
            .eq("id", agent_id) \
            .single() \
            .execute()

        if response.data:
            metadata = response.data.get("metadata") or {}
            prefs = CitationPreferences.from_metadata(metadata)
            logger.info(
                "agent_citation_prefs_loaded",
                agent_id=agent_id,
                citation_style=prefs.citation_style,
                include_citations=prefs.include_citations
            )
            return prefs

        # Agent not found, return defaults
        logger.warning("agent_citation_prefs_not_found", agent_id=agent_id)
        return CitationPreferences()

    except Exception as e:
        logger.error(
            "agent_citation_prefs_error",
            agent_id=agent_id,
            error=str(e)
        )
        # Return defaults on error
        return CitationPreferences()


# =======================
# EXAMPLE USAGE
# =======================

if __name__ == "__main__":
    import asyncio

    async def example_usage():
        """Example usage of UnifiedAgentLoader."""
        from services.supabase_client import get_supabase_client

        supabase = get_supabase_client()
        loader = UnifiedAgentLoader(supabase)

        # Example 1: Load specific agent (Mode 1/3)
        try:
            agent = await loader.load_agent_by_id(
                agent_id="fda_510k_expert_uuid",
                tenant_id="user_tenant_uuid"
            )
            print(f"Loaded agent: {agent.display_name}")
            print(f"Capabilities: {agent.capabilities}")
            print(f"Sub-agents: {len(agent.sub_agent_pool)}")
        except AgentLoadError as e:
            print(f"Error: {e}")

        # Example 2: Load default agent for domain (fallback)
        agent = await loader.load_default_agent_for_domain(
            domain="regulatory",
            tenant_id="user_tenant_uuid"
        )
        print(f"Default regulatory agent: {agent.display_name}")

        # Example 3: Load sub-agent pool
        sub_agents = await loader.load_sub_agent_pool(
            parent_agent=agent,
            tenant_id="user_tenant_uuid"
        )
        print(f"Loaded {len(sub_agents)} sub-agents")
        for sub_agent in sub_agents:
            print(f"  - {sub_agent.display_name}: {sub_agent.domain_expertise}")

    asyncio.run(example_usage())
