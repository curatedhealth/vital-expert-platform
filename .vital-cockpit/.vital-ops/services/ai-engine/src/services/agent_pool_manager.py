"""
Agent Pool Manager for Automatic Agent Selection (Mode 2 & 4)

This service manages pools of available agents and provides scoring/ranking
for automatic agent selection based on query relevance.

Key Features:
- Query available agents for tenant
- Score agents based on query relevance
- Handle agent availability and load balancing
- Support domain and tier filtering

Usage:
    pool_manager = AgentPoolManager(supabase, agent_loader)
    agents = await pool_manager.get_available_agents(tenant_id, domain="regulatory")
    scored = await pool_manager.score_agents_for_query(query, agents)
    best_agent = scored[0][0]  # (agent, score) tuples

Author: LangGraph Orchestration Architect
Date: November 21, 2025
"""

from typing import List, Tuple, Optional, Dict, Any
import structlog
from supabase import Client as SupabaseClient

from services.unified_agent_loader import UnifiedAgentLoader, AgentProfile, AgentLoadError

logger = structlog.get_logger()


class AgentPoolManager:
    """
    Manages agent pools for automatic selection modes (Mode 2 & 4).

    Responsibilities:
    - Load available agents based on filters (domain, tier, etc.)
    - Score agents for query relevance
    - Handle agent availability and status
    - Provide ranked agent recommendations
    """

    def __init__(self, supabase: SupabaseClient, agent_loader: UnifiedAgentLoader):
        """
        Initialize agent pool manager.

        Args:
            supabase: Supabase client
            agent_loader: UnifiedAgentLoader instance for loading agents
        """
        self.supabase = supabase
        self.agent_loader = agent_loader

    async def get_available_agents(
        self,
        tenant_id: str,
        domain: Optional[str] = None,
        tier: Optional[int] = None,
        exclude_ids: Optional[List[str]] = None,
        limit: int = 20
    ) -> List[AgentProfile]:
        """
        Get all available agents for a tenant.

        Returns both platform agents (accessible to all) and tenant-specific
        custom agents.

        Args:
            tenant_id: User's tenant ID
            domain: Optional domain filter (e.g., "regulatory", "medical")
            tier: Optional tier filter (1, 2, or 3)
            exclude_ids: Optional list of agent IDs to exclude
            limit: Maximum agents to return

        Returns:
            List of available agent profiles
        """
        try:
            logger.info(
                "agent_pool.get_available_start",
                tenant_id=tenant_id,
                domain=domain,
                tier=tier,
                limit=limit
            )

            # Build query
            # Get agents that are either:
            # 1. Platform agents (tenant_id = 'platform')
            # 2. Custom agents belonging to this tenant
            query = self.supabase.table("agents") \
                .select("id") \
                .in_("status", ["active", "testing"]) \
                .or_(f"tenant_id.eq.platform,tenant_id.eq.{tenant_id}") \
                .order("metadata->>priority", {"ascending": False}) \
                .order("metadata->>tier", {"ascending": True}) \
                .limit(limit)

            # Apply domain filter
            if domain:
                query = query.filter("metadata->>domain_expertise", "eq", domain)

            # Apply tier filter
            if tier:
                query = query.filter("metadata->>tier", "eq", str(tier))

            response = query.execute()

            if not response.data:
                logger.warning(
                    "agent_pool.no_agents_found",
                    tenant_id=tenant_id,
                    domain=domain,
                    tier=tier
                )
                return []

            # Load full agent profiles
            agents: List[AgentProfile] = []
            exclude_set = set(exclude_ids or [])

            for row in response.data:
                agent_id = row["id"]

                # Skip excluded agents
                if agent_id in exclude_set:
                    continue

                try:
                    agent = await self.agent_loader.load_agent_by_id(
                        agent_id,
                        tenant_id
                    )
                    agents.append(agent)

                except AgentLoadError as e:
                    # Skip agents that fail to load
                    logger.warning(
                        "agent_pool.agent_load_failed",
                        agent_id=agent_id,
                        error=str(e)
                    )
                    continue

            logger.info(
                "agent_pool.get_available_success",
                tenant_id=tenant_id,
                agent_count=len(agents)
            )

            return agents

        except Exception as e:
            logger.error(
                "agent_pool.get_available_error",
                tenant_id=tenant_id,
                error=str(e)
            )
            return []

    async def score_agents_for_query(
        self,
        query: str,
        agents: List[AgentProfile],
        min_score: float = 0.0
    ) -> List[Tuple[AgentProfile, float]]:
        """
        Score agents based on relevance to query.

        Scoring algorithm:
        1. Keyword matching against capabilities (0.3 per match)
        2. Keyword matching against description (0.1 per word)
        3. Domain relevance check (0.4 if domain keyword in query)
        4. Tier bonus (0.2 for tier 1, 0.1 for tier 2)
        5. Priority bonus (0.1 * priority / 10)

        Future enhancements:
        - Use embedding similarity for semantic matching
        - Incorporate historical performance metrics
        - Learn from user feedback

        Args:
            query: User query string
            agents: List of available agents
            min_score: Minimum score threshold (agents below this are filtered out)

        Returns:
            List of (agent, score) tuples, sorted by score descending
        """
        try:
            logger.info(
                "agent_pool.score_start",
                query_length=len(query),
                agent_count=len(agents)
            )

            scored_agents: List[Tuple[AgentProfile, float]] = []

            for agent in agents:
                score = self._calculate_relevance_score(query, agent)

                # Apply minimum score threshold
                if score >= min_score:
                    scored_agents.append((agent, score))

            # Sort by score descending
            scored_agents.sort(key=lambda x: x[1], reverse=True)

            if scored_agents:
                logger.info(
                    "agent_pool.score_success",
                    agent_count=len(scored_agents),
                    top_agent=scored_agents[0][0].display_name,
                    top_score=scored_agents[0][1]
                )
            else:
                logger.warning(
                    "agent_pool.no_agents_above_threshold",
                    min_score=min_score
                )

            return scored_agents

        except Exception as e:
            logger.error(
                "agent_pool.score_error",
                error=str(e)
            )
            return []

    def _calculate_relevance_score(
        self,
        query: str,
        agent: AgentProfile
    ) -> float:
        """
        Calculate relevance score for a single agent.

        Scoring components:
        - Capability matching: 0.3 per matching capability keyword
        - Description matching: 0.1 per matching word
        - Domain relevance: 0.4 if domain keyword in query
        - Tier bonus: 0.2 (tier 1), 0.1 (tier 2), 0.0 (tier 3)
        - Priority bonus: 0.1 * (priority / 10)

        Args:
            query: User query (lowercased internally)
            agent: Agent profile

        Returns:
            Relevance score (typically 0.0 to 2.0, but can be higher)
        """
        score = 0.0
        query_lower = query.lower()
        query_words = set(query_lower.split())

        # 1. Capability matching
        for capability in agent.capabilities:
            capability_lower = capability.lower()
            # Exact phrase match
            if capability_lower in query_lower:
                score += 0.3
            # Partial word match
            elif any(word in capability_lower for word in query_words):
                score += 0.15

        # 2. Description matching
        description_words = set(agent.description.lower().split())
        matching_words = query_words & description_words
        score += len(matching_words) * 0.1

        # 3. Domain relevance
        domain_keywords = {
            "regulatory": ["fda", "regulatory", "compliance", "approval", "510k", "pma", "ide"],
            "medical": ["medical", "clinical", "diagnosis", "treatment", "patient", "disease"],
            "clinical": ["trial", "study", "protocol", "endpoint", "enrollment"],
            "reimbursement": ["reimbursement", "coding", "cpt", "hcpcs", "payer", "coverage"],
            "legal": ["legal", "contract", "intellectual property", "patent", "licensing"]
        }

        domain = agent.domain_expertise.lower()
        if domain in domain_keywords:
            keywords = domain_keywords[domain]
            if any(kw in query_lower for kw in keywords):
                score += 0.4

        # 4. Tier bonus (prefer higher tier experts)
        if agent.tier == 1:
            score += 0.2
        elif agent.tier == 2:
            score += 0.1

        # 5. Priority bonus (0.0 to 0.1 based on priority 0-10)
        if agent.priority > 0:
            score += min(0.1, agent.priority / 10.0 * 0.1)

        return score

    async def get_agent_for_domain_auto(
        self,
        query: str,
        tenant_id: str,
        preferred_domain: Optional[str] = None
    ) -> Tuple[AgentProfile, float]:
        """
        Automatically select best agent for query.

        High-level convenience method that:
        1. Gets available agents (optionally filtered by domain)
        2. Scores them for query relevance
        3. Returns best match

        Args:
            query: User query
            tenant_id: User's tenant ID
            preferred_domain: Optional domain preference

        Returns:
            Tuple of (best_agent, confidence_score)

        Raises:
            AgentLoadError: If no suitable agent found
        """
        try:
            # Get available agents
            agents = await self.get_available_agents(
                tenant_id=tenant_id,
                domain=preferred_domain
            )

            if not agents:
                # No agents available, use fallback
                fallback = await self.agent_loader.load_default_agent_for_domain(
                    domain=preferred_domain or "general",
                    tenant_id=tenant_id
                )
                return (fallback, 0.5)

            # Score agents
            scored_agents = await self.score_agents_for_query(
                query=query,
                agents=agents,
                min_score=0.1  # Minimum threshold
            )

            if not scored_agents:
                # No agent scored above threshold, use fallback
                fallback = await self.agent_loader.load_default_agent_for_domain(
                    domain=preferred_domain or "general",
                    tenant_id=tenant_id
                )
                return (fallback, 0.5)

            # Return top agent
            best_agent, score = scored_agents[0]

            logger.info(
                "agent_pool.auto_select_success",
                agent=best_agent.display_name,
                score=score,
                domain=best_agent.domain_expertise
            )

            return (best_agent, score)

        except Exception as e:
            logger.error(
                "agent_pool.auto_select_error",
                error=str(e)
            )
            # Ultimate fallback
            fallback = await self.agent_loader.load_default_agent_for_domain(
                domain="general",
                tenant_id=tenant_id
            )
            return (fallback, 0.3)


# =======================
# EXAMPLE USAGE
# =======================

if __name__ == "__main__":
    import asyncio

    async def example_usage():
        """Example usage of AgentPoolManager."""
        from services.supabase_client import get_supabase_client

        supabase = get_supabase_client()
        agent_loader = UnifiedAgentLoader(supabase)
        pool_manager = AgentPoolManager(supabase, agent_loader)

        tenant_id = "user_tenant_uuid"

        # Example 1: Get available agents for tenant
        print("\n=== Example 1: Get Available Agents ===")
        agents = await pool_manager.get_available_agents(
            tenant_id=tenant_id,
            domain="regulatory"
        )
        print(f"Found {len(agents)} regulatory agents")
        for agent in agents[:3]:
            print(f"  - {agent.display_name} (Tier {agent.tier})")

        # Example 2: Score agents for query
        print("\n=== Example 2: Score Agents for Query ===")
        query = "What are the FDA 510(k) requirements for a cardiac monitor?"
        scored_agents = await pool_manager.score_agents_for_query(query, agents)
        print(f"Scored {len(scored_agents)} agents:")
        for agent, score in scored_agents[:5]:
            print(f"  - {agent.display_name}: {score:.2f}")

        # Example 3: Automatic agent selection
        print("\n=== Example 3: Automatic Selection ===")
        best_agent, confidence = await pool_manager.get_agent_for_domain_auto(
            query=query,
            tenant_id=tenant_id,
            preferred_domain="regulatory"
        )
        print(f"Selected: {best_agent.display_name}")
        print(f"Confidence: {confidence:.2f}")
        print(f"Domain: {best_agent.domain_expertise}")

    asyncio.run(example_usage())
