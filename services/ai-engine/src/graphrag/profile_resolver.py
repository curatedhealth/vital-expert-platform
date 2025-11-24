"""
RAG Profile Resolver
Loads RAG profiles from PostgreSQL with agent-specific overrides
"""

from typing import Optional
from uuid import UUID
import structlog

from .models import RAGProfile, AgentRAGPolicy, FusionWeights
from .clients.postgres_client import get_postgres_client

logger = structlog.get_logger()


class ProfileResolver:
    """
    Resolves RAG profiles for agents
    
    Features:
    - Load base RAG profiles
    - Apply agent-specific overrides
    - Default fallback profiles
    - Caching (optional)
    """
    
    def __init__(self):
        self._cache: dict[UUID, RAGProfile] = {}
        self._policy_cache: dict[UUID, AgentRAGPolicy] = {}
    
    async def resolve_profile(
        self,
        agent_id: UUID,
        profile_id: Optional[UUID] = None
    ) -> RAGProfile:
        """
        Resolve RAG profile for agent
        
        Args:
            agent_id: Agent UUID
            profile_id: Optional specific profile ID
            
        Returns:
            RAGProfile with agent-specific overrides applied
        """
        try:
            pg = await get_postgres_client()
            
            # If profile_id specified, load it directly
            if profile_id:
                profile = await self._load_profile_by_id(pg, profile_id)
            else:
                # Load agent's default profile
                profile = await self._load_agent_default_profile(pg, agent_id)
            
            # Apply agent-specific overrides
            policy = await self._load_agent_policy(pg, agent_id, profile.id)
            if policy:
                profile = self._apply_policy_overrides(profile, policy)
            
            logger.info(
                "profile_resolved",
                agent_id=str(agent_id),
                profile_name=profile.profile_name,
                strategy=profile.strategy_type
            )
            
            return profile
            
        except Exception as e:
            logger.error(
                "profile_resolution_failed",
                agent_id=str(agent_id),
                error=str(e)
            )
            # Return default fallback profile
            return self._get_default_profile()
    
    async def _load_profile_by_id(self, pg, profile_id: UUID) -> RAGProfile:
        """Load profile by ID"""
        query = """
        SELECT
            id,
            profile_name,
            strategy_type,
            top_k,
            similarity_threshold,
            rerank_enabled,
            rerank_model,
            context_window_tokens,
            enable_graph_search,
            enable_keyword_search,
            metadata
        FROM rag_profiles
        WHERE id = $1
        """
        
        row = await pg.fetchrow(query, profile_id)
        
        if not row:
            raise ValueError(f"RAG profile not found: {profile_id}")
        
        return RAGProfile(**row)
    
    async def _load_agent_default_profile(self, pg, agent_id: UUID) -> RAGProfile:
        """Load agent's default profile from agent_rag_policies"""
        query = """
        SELECT
            rp.id,
            rp.profile_name,
            rp.strategy_type,
            rp.top_k,
            rp.similarity_threshold,
            rp.rerank_enabled,
            rp.rerank_model,
            rp.context_window_tokens,
            rp.enable_graph_search,
            rp.enable_keyword_search,
            rp.metadata
        FROM rag_profiles rp
        JOIN agent_rag_policies arp ON rp.id = arp.rag_profile_id
        WHERE arp.agent_id = $1
            AND arp.is_active = true
        ORDER BY arp.created_at DESC
        LIMIT 1
        """
        
        row = await pg.fetchrow(query, agent_id)
        
        if row:
            return RAGProfile(**row)
        
        # No agent policy, use default semantic profile
        logger.info(
            "using_default_profile",
            agent_id=str(agent_id),
            reason="no_agent_policy"
        )
        return await self._load_default_semantic_profile(pg)
    
    async def _load_default_semantic_profile(self, pg) -> RAGProfile:
        """Load default semantic_standard profile"""
        query = """
        SELECT
            id,
            profile_name,
            strategy_type,
            top_k,
            similarity_threshold,
            rerank_enabled,
            rerank_model,
            context_window_tokens,
            enable_graph_search,
            enable_keyword_search,
            metadata
        FROM rag_profiles
        WHERE strategy_type = 'semantic_standard'
            AND is_active = true
        LIMIT 1
        """
        
        row = await pg.fetchrow(query)
        
        if row:
            return RAGProfile(**row)
        
        # If no profile in DB, return hardcoded default
        return self._get_default_profile()
    
    async def _load_agent_policy(
        self,
        pg,
        agent_id: UUID,
        profile_id: UUID
    ) -> Optional[AgentRAGPolicy]:
        """Load agent-specific RAG policy"""
        query = """
        SELECT
            id,
            agent_id,
            rag_profile_id,
            agent_specific_top_k,
            agent_specific_threshold,
            is_active,
            metadata
        FROM agent_rag_policies
        WHERE agent_id = $1
            AND rag_profile_id = $2
            AND is_active = true
        LIMIT 1
        """
        
        row = await pg.fetchrow(query, agent_id, profile_id)
        
        if row:
            return AgentRAGPolicy(**row)
        
        return None
    
    def _apply_policy_overrides(
        self,
        profile: RAGProfile,
        policy: AgentRAGPolicy
    ) -> RAGProfile:
        """Apply agent-specific overrides to profile"""
        # Create a copy with overrides
        profile_dict = profile.model_dump()
        
        if policy.agent_specific_top_k is not None:
            profile_dict['top_k'] = policy.agent_specific_top_k
            logger.debug(
                "policy_override_applied",
                field="top_k",
                value=policy.agent_specific_top_k
            )
        
        if policy.agent_specific_threshold is not None:
            profile_dict['similarity_threshold'] = policy.agent_specific_threshold
            logger.debug(
                "policy_override_applied",
                field="similarity_threshold",
                value=policy.agent_specific_threshold
            )
        
        return RAGProfile(**profile_dict)
    
    def _get_default_profile(self) -> RAGProfile:
        """Get hardcoded default profile (fallback)"""
        return RAGProfile(
            id=UUID('00000000-0000-0000-0000-000000000000'),
            profile_name="default_semantic",
            strategy_type="semantic_standard",
            top_k=10,
            similarity_threshold=0.7,
            rerank_enabled=False,
            rerank_model=None,
            context_window_tokens=4000,
            enable_graph_search=False,
            enable_keyword_search=False,
            metadata={"source": "hardcoded_fallback"}
        )
    
    def clear_cache(self):
        """Clear cached profiles"""
        self._cache.clear()
        self._policy_cache.clear()
        logger.info("profile_cache_cleared")


# Singleton instance
_resolver: Optional[ProfileResolver] = None


def get_profile_resolver() -> ProfileResolver:
    """Get or create profile resolver singleton"""
    global _resolver
    
    if _resolver is None:
        _resolver = ProfileResolver()
    
    return _resolver

