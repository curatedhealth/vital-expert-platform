"""
L4 Agent Coordination Service

Service for managing agent definitions, capabilities, JTBD mappings,
and orchestration recommendations.
"""

from typing import Optional, List, Dict, Any
from ..base import OntologyLayerService
from .models import (
    AgentDefinition,
    AgentCapability,
    AgentJTBDMapping,
    AgentSynergyScore,
    AgentContext,
    AgentTier,
    AgentType,
)


class L4AgentService(OntologyLayerService[AgentDefinition]):
    """
    Service for L4 Agent Coordination layer.

    Provides operations for:
    - Agent definition lookups
    - Capability queries
    - JTBD-to-Agent mapping
    - Orchestration recommendations
    - Cost estimation
    """

    @property
    def layer_name(self) -> str:
        return "l4_agents"

    @property
    def primary_table(self) -> str:
        return "agents"

    def _to_model(self, data: Dict[str, Any]) -> AgentDefinition:
        return AgentDefinition(**data)

    # -------------------------------------------------------------------------
    # Agent Definition Operations
    # -------------------------------------------------------------------------

    async def get_agents(
        self,
        tier: Optional[AgentTier] = None,
        agent_type: Optional[AgentType] = None,
        is_active: bool = True,
        limit: int = 100
    ) -> List[AgentDefinition]:
        """Get agents, optionally filtered by tier or type."""
        try:
            query = self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .limit(limit)

            if is_active:
                query = query.eq("is_active", True)

            if tier:
                query = query.eq("tier", tier.value)

            if agent_type:
                query = query.eq("agent_type", agent_type.value)

            result = await query.order("name").execute()
            return [self._to_model(row) for row in result.data]
        except Exception as e:
            print(f"Error fetching agents: {e}")
            return []

    async def get_agent_by_code(self, code: str) -> Optional[AgentDefinition]:
        """Get agent by code."""
        try:
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("code", code)\
                .maybe_single()\
                .execute()

            if result.data:
                return self._to_model(result.data)
        except Exception as e:
            print(f"Error fetching agent by code: {e}")
        return None

    async def find_agents_by_capability(
        self,
        capability: str,
        limit: int = 10
    ) -> List[AgentDefinition]:
        """Find agents that have a specific capability."""
        try:
            # Get all active agents
            all_agents = await self.get_agents(limit=200)

            capability_lower = capability.lower()
            matching_agents = []

            for agent in all_agents:
                # Check capabilities
                if any(capability_lower in cap.lower() for cap in agent.capabilities):
                    matching_agents.append((10, agent))
                # Check knowledge domains
                elif any(capability_lower in domain.lower() for domain in agent.knowledge_domains):
                    matching_agents.append((5, agent))
                # Check name
                elif capability_lower in agent.name.lower():
                    matching_agents.append((3, agent))

            # Sort by score
            matching_agents.sort(key=lambda x: x[0], reverse=True)
            return [agent for _, agent in matching_agents[:limit]]

        except Exception as e:
            print(f"Error finding agents by capability: {e}")
            return []

    # -------------------------------------------------------------------------
    # Capability Operations
    # -------------------------------------------------------------------------

    async def get_agent_capabilities(
        self,
        agent_id: str
    ) -> List[AgentCapability]:
        """Get capabilities for an agent."""
        try:
            result = await self.supabase.table("agent_capabilities")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("agent_id", agent_id)\
                .eq("is_active", True)\
                .execute()

            return [AgentCapability(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching agent capabilities: {e}")
            return []

    # -------------------------------------------------------------------------
    # JTBD Mapping Operations
    # -------------------------------------------------------------------------

    async def get_agents_for_jtbd(
        self,
        jtbd_id: str,
        limit: int = 5
    ) -> List[AgentJTBDMapping]:
        """Get agents mapped to a JTBD, sorted by relevance."""
        try:
            result = await self.supabase.table("agent_jtbd_mappings")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("jtbd_id", jtbd_id)\
                .eq("is_active", True)\
                .order("relevance_score", desc=True)\
                .limit(limit)\
                .execute()

            return [AgentJTBDMapping(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching agents for JTBD: {e}")
            return []

    async def get_primary_agent_for_jtbd(
        self,
        jtbd_id: str
    ) -> Optional[AgentDefinition]:
        """Get the primary agent for a JTBD."""
        try:
            result = await self.supabase.table("agent_jtbd_mappings")\
                .select("agent_id")\
                .eq("tenant_id", self.tenant_id)\
                .eq("jtbd_id", jtbd_id)\
                .eq("is_primary", True)\
                .eq("is_active", True)\
                .maybe_single()\
                .execute()

            if result.data:
                return await self.get_by_id(result.data["agent_id"])
        except Exception as e:
            print(f"Error fetching primary agent: {e}")
        return None

    # -------------------------------------------------------------------------
    # Synergy Operations
    # -------------------------------------------------------------------------

    async def get_synergy_scores(
        self,
        agent_id: str
    ) -> List[AgentSynergyScore]:
        """Get synergy scores for an agent with other agents."""
        try:
            result = await self.supabase.table("agent_synergy_scores")\
                .select("*")\
                .or_(f"agent_id_1.eq.{agent_id},agent_id_2.eq.{agent_id}")\
                .eq("tenant_id", self.tenant_id)\
                .execute()

            return [AgentSynergyScore(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching synergy scores: {e}")
            return []

    async def find_complementary_agents(
        self,
        primary_agent_id: str,
        limit: int = 3
    ) -> List[AgentDefinition]:
        """Find agents that complement the primary agent."""
        synergies = await self.get_synergy_scores(primary_agent_id)

        # Sort by synergy score
        synergies.sort(key=lambda s: s.synergy_score, reverse=True)

        # Get complementary agent IDs
        complementary_ids = []
        for synergy in synergies[:limit]:
            if synergy.agent_id_1 == primary_agent_id:
                complementary_ids.append(synergy.agent_id_2)
            else:
                complementary_ids.append(synergy.agent_id_1)

        # Fetch agent definitions
        if complementary_ids:
            return await self.get_by_ids(complementary_ids)
        return []

    # -------------------------------------------------------------------------
    # Orchestration
    # -------------------------------------------------------------------------

    async def recommend_agent_team(
        self,
        jtbd_id: str,
        query: str,
        max_agents: int = 3
    ) -> AgentContext:
        """
        Recommend an optimal agent team for a JTBD.

        Args:
            jtbd_id: The job to be done ID
            query: User query for additional context
            max_agents: Maximum agents in the team

        Returns:
            AgentContext with recommended agents and orchestration info
        """
        context = AgentContext()

        # Get agents mapped to this JTBD
        mappings = await self.get_agents_for_jtbd(jtbd_id, limit=max_agents * 2)

        if not mappings:
            # Fallback: find by capability
            query_lower = query.lower()
            all_agents = await self.get_agents(limit=50)

            scored = []
            for agent in all_agents:
                score = 0
                if any(word in query_lower for word in agent.name.lower().split()):
                    score += 5
                if any(word in query_lower for word in agent.capabilities):
                    score += 3
                if score > 0:
                    scored.append((score, agent))

            scored.sort(key=lambda x: x[0], reverse=True)
            context.recommended_agents = [a for _, a in scored[:max_agents]]
        else:
            # Get agent definitions from mappings
            agent_ids = [m.agent_id for m in mappings[:max_agents]]
            context.recommended_agents = await self.get_by_ids(agent_ids)
            context.jtbd_mappings = mappings[:max_agents]

        # Set primary agent
        if context.recommended_agents:
            primary = context.recommended_agents[0]
            context.primary_agent_id = primary.id

            # Get supporting agents
            if len(context.recommended_agents) > 1:
                context.supporting_agent_ids = [
                    a.id for a in context.recommended_agents[1:]
                ]

            # Get capabilities for primary agent
            context.agent_capabilities = await self.get_agent_capabilities(primary.id)

            # Calculate estimated cost
            context.estimated_cost = sum(a.cost_per_query for a in context.recommended_agents)
            context.estimated_tokens = sum(a.max_tokens for a in context.recommended_agents)

            # Calculate synergy score
            if context.supporting_agent_ids:
                synergies = await self.get_synergy_scores(primary.id)
                relevant_synergies = [
                    s for s in synergies
                    if s.agent_id_1 in context.supporting_agent_ids
                    or s.agent_id_2 in context.supporting_agent_ids
                ]
                if relevant_synergies:
                    context.synergy_score = sum(s.synergy_score for s in relevant_synergies) / len(relevant_synergies)

        # Calculate confidence
        confidence = 0.0
        if context.recommended_agents:
            confidence += 0.4
        if context.jtbd_mappings:
            confidence += 0.3
        if context.agent_capabilities:
            confidence += 0.2
        if context.synergy_score > 0:
            confidence += 0.1
        context.confidence_score = confidence

        return context

    # -------------------------------------------------------------------------
    # Cost Estimation
    # -------------------------------------------------------------------------

    async def estimate_cost(
        self,
        agent_ids: List[str],
        estimated_queries: int = 1
    ) -> Dict[str, Any]:
        """Estimate cost for using a set of agents."""
        agents = await self.get_by_ids(agent_ids)

        total_cost = sum(a.cost_per_query for a in agents) * estimated_queries
        total_tokens = sum(a.max_tokens for a in agents) * estimated_queries

        breakdown = {
            agent.code: {
                "cost_per_query": agent.cost_per_query,
                "total_cost": agent.cost_per_query * estimated_queries,
                "model": agent.model,
                "tier": agent.tier.value
            }
            for agent in agents
        }

        return {
            "total_cost": total_cost,
            "total_tokens": total_tokens,
            "agent_count": len(agents),
            "estimated_queries": estimated_queries,
            "breakdown": breakdown
        }
