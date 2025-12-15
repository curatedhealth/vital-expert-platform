"""
RAG Profile Resolver for GraphRAG Service

Loads RAG profiles from Postgres with agent-specific overrides.
Maps profile slugs to concrete fusion weights and retrieval parameters.
"""

from typing import Optional, Dict, Any
from uuid import UUID

from .clients import get_postgres_client
from .models import RAGProfile, FusionWeights
from .utils.logger import get_logger

logger = get_logger(__name__)


class ProfileResolver:
    """Resolves RAG profiles with agent-specific overrides"""
    
    def __init__(self):
        self.pg_client = None
        self._profile_cache: Dict[str, RAGProfile] = {}
        
    async def initialize(self):
        """Initialize PostgreSQL client"""
        self.pg_client = await get_postgres_client()
        logger.info("ProfileResolver initialized")
        
    async def get_profile(
        self,
        agent_id: UUID,
        profile_id: Optional[UUID] = None,
        skill_id: Optional[UUID] = None
    ) -> RAGProfile:
        """
        Get RAG profile with agent-specific overrides
        
        Args:
            agent_id: Agent UUID
            profile_id: Optional specific profile to load
            skill_id: Optional skill for skill-specific overrides
            
        Returns:
            RAGProfile with overrides applied
            
        Priority order:
        1. Agent + Skill specific policy (highest)
        2. Agent default policy
        3. Profile default (lowest)
        """
        try:
            # First, try to get agent-specific policy
            policy = await self.pg_client.get_agent_rag_policy(
                agent_id=agent_id,
                skill_id=skill_id
            )
            
            if policy:
                # Agent has a custom policy, use it
                profile = await self._build_profile_from_policy(policy)
                logger.info(
                    f"Loaded RAG profile with agent policy for agent={agent_id}, "
                    f"profile={profile.slug}, skill={skill_id}"
                )
                return profile
            
            # No agent policy, load default profile
            if profile_id:
                profile = await self.pg_client.get_rag_profile(profile_id=profile_id)
            else:
                # Default to hybrid_enhanced
                profile = await self.pg_client.get_rag_profile(slug='hybrid_enhanced')
            
            if not profile:
                # Fallback to semantic_standard if hybrid not found
                logger.warning(f"Profile not found, falling back to semantic_standard")
                profile = await self.pg_client.get_rag_profile(slug='semantic_standard')
                
            if not profile:
                raise ValueError("No RAG profiles found in database")
                
            logger.info(f"Loaded default RAG profile: {profile.slug} for agent={agent_id}")
            return profile
            
        except Exception as e:
            logger.error(f"Error loading RAG profile: {e}")
            # Return a safe default
            return self._get_fallback_profile()
            
    async def _build_profile_from_policy(self, policy: Dict[str, Any]) -> RAGProfile:
        """Build RAGProfile from agent policy with overrides"""
        # Base profile from policy
        base = {
            'id': policy.get('id'),
            'name': policy.get('name', 'Custom Policy'),
            'slug': policy.get('slug', 'agent_custom'),
            'description': policy.get('description'),
            'retrieval_mode': policy.get('retrieval_mode', 'hybrid'),
            'vector_weight': policy.get('vector_weight', 0.6),
            'keyword_weight': policy.get('keyword_weight', 0.4),
            'graph_weight': policy.get('graph_weight', 0.0),
            'similarity_threshold': policy.get('similarity_threshold', 0.7),
            'rerank_enabled': policy.get('rerank_enabled', False),
            'reranker_model': policy.get('reranker_model'),
            'context_window_tokens': policy.get('context_window_tokens', 4000),
            'chunk_overlap_tokens': policy.get('chunk_overlap_tokens', 200),
            'metadata_filters': policy.get('metadata_filters'),
            'is_active': policy.get('is_active', True),
            'created_at': policy.get('created_at'),
            'updated_at': policy.get('updated_at')
        }
        
        # Apply agent-specific overrides
        if policy.get('agent_specific_top_k'):
            base['top_k'] = policy['agent_specific_top_k']
        else:
            base['top_k'] = policy.get('top_k', 10)
            
        if policy.get('agent_specific_threshold'):
            base['similarity_threshold'] = policy['agent_specific_threshold']
            
        if policy.get('agent_specific_filters'):
            base['metadata_filters'] = policy['agent_specific_filters']
            
        return RAGProfile(**base)
        
    def get_fusion_weights(self, profile: RAGProfile) -> FusionWeights:
        """
        Get fusion weights from profile
        
        Maps profile slugs to concrete fusion weight configurations
        """
        # Profile already has fusion_weights property
        return profile.fusion_weights
        
    def _get_fallback_profile(self) -> RAGProfile:
        """Return a safe fallback profile when database is unavailable"""
        logger.warning("Using fallback RAG profile (semantic_standard)")
        return RAGProfile(
            id=UUID('00000000-0000-0000-0000-000000000000'),
            name='Semantic Standard (Fallback)',
            slug='semantic_standard_fallback',
            description='Fallback profile for error cases',
            retrieval_mode='semantic',
            vector_weight=1.0,
            keyword_weight=0.0,
            graph_weight=0.0,
            top_k=10,
            similarity_threshold=0.7,
            rerank_enabled=False,
            context_window_tokens=4000,
            chunk_overlap_tokens=200,
            is_active=True
        )
        
    async def get_all_profiles(self) -> Dict[str, RAGProfile]:
        """Get all available RAG profiles (for admin/debugging)"""
        if not self.pg_client:
            await self.initialize()
            
        profiles = {}
        
        # Standard profiles
        for slug in ['semantic_standard', 'hybrid_enhanced', 'graphrag_entity', 'agent_optimized']:
            try:
                profile = await self.pg_client.get_rag_profile(slug=slug)
                if profile:
                    profiles[slug] = profile
            except Exception as e:
                logger.warning(f"Could not load profile {slug}: {e}")
                
        return profiles


# Singleton instance
_profile_resolver: Optional[ProfileResolver] = None


async def get_profile_resolver() -> ProfileResolver:
    """Get or create ProfileResolver singleton"""
    global _profile_resolver
    if _profile_resolver is None:
        _profile_resolver = ProfileResolver()
        await _profile_resolver.initialize()
    return _profile_resolver

