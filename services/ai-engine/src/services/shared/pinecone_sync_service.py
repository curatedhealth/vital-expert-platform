"""
Pinecone Sync Service for Agent OS

Syncs agent embeddings from PostgreSQL to Pinecone for vector-based retrieval.
Maintains vector representations of agents for semantic similarity search.

Stage 4: Integration & Sync
Reference: AGENT_IMPLEMENTATION_PLAN.md (Task 4.2)
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog
import asyncio

logger = structlog.get_logger()


class PineconeSyncService:
    """
    Service for syncing agent embeddings to Pinecone.
    
    Creates and maintains:
    - Agent vectors with metadata
    - Namespace per tenant for isolation
    - Automatic re-embedding when agent descriptions change
    """
    
    def __init__(
        self,
        supabase_client,
        pinecone_api_key: Optional[str] = None,
        pinecone_index_name: str = "vital-agents",
        embedding_model: str = "text-embedding-3-large",
        embedding_dimensions: int = 3072,
    ):
        """
        Initialize sync service.
        
        Args:
            supabase_client: Supabase client for PostgreSQL queries
            pinecone_api_key: Pinecone API key (uses env if None)
            pinecone_index_name: Name of Pinecone index
            embedding_model: OpenAI embedding model
            embedding_dimensions: Embedding vector dimensions
        """
        self.supabase = supabase_client
        self.index_name = pinecone_index_name
        self.embedding_model = embedding_model
        self.embedding_dimensions = embedding_dimensions
        
        self.pc = None
        self.index = None
        
        try:
            from pinecone import Pinecone
            self.pc = Pinecone(api_key=pinecone_api_key)
            self.index = self.pc.Index(pinecone_index_name)
            logger.info(
                "pinecone_sync_service_initialized",
                index_name=pinecone_index_name,
            )
        except Exception as e:
            logger.warning("pinecone_sync_service_init_failed", error=str(e))
        
        self.openai_client = None
        try:
            from openai import AsyncOpenAI
            self.openai_client = AsyncOpenAI()
        except ImportError:
            logger.warning("pinecone_sync_service_openai_not_available")
    
    async def sync_all(self, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Full sync of all agent embeddings to Pinecone.
        
        Args:
            tenant_id: Optional tenant filter (syncs all if None)
            
        Returns:
            Sync statistics
        """
        logger.info("pinecone_sync_all_started", tenant_id=tenant_id)
        
        stats = {
            'agents_synced': 0,
            'embeddings_generated': 0,
            'errors': [],
            'started_at': datetime.utcnow().isoformat(),
        }
        
        if not self.index:
            stats['errors'].append("Pinecone not available")
            return stats
        
        try:
            # Fetch agents from PostgreSQL
            query = self.supabase.table('agents').select(
                '*, agent_levels(*), personality_types(*)'
            ).eq('is_active', True)
            
            if tenant_id:
                query = query.eq('tenant_id', tenant_id)
            
            result = query.execute()
            agents = result.data or []
            
            # Process in batches
            batch_size = 100
            for i in range(0, len(agents), batch_size):
                batch = agents[i:i+batch_size]
                batch_stats = await self._sync_batch(batch, tenant_id)
                stats['agents_synced'] += batch_stats['synced']
                stats['embeddings_generated'] += batch_stats['embeddings']
                stats['errors'].extend(batch_stats.get('errors', []))
            
            stats['completed_at'] = datetime.utcnow().isoformat()
            stats['success'] = True
            
            logger.info("pinecone_sync_all_completed", **stats)
            
        except Exception as e:
            logger.error("pinecone_sync_all_failed", error=str(e))
            stats['errors'].append(str(e))
            stats['success'] = False
        
        return stats
    
    async def _sync_batch(
        self, 
        agents: List[Dict[str, Any]], 
        tenant_id: Optional[str]
    ) -> Dict[str, int]:
        """Sync a batch of agents to Pinecone."""
        stats = {'synced': 0, 'embeddings': 0, 'errors': []}
        
        try:
            # Prepare texts for embedding
            texts_to_embed = []
            agent_ids = []
            
            for agent in agents:
                # Build comprehensive text for embedding
                text = self._build_embedding_text(agent)
                texts_to_embed.append(text)
                agent_ids.append(agent['id'])
            
            # Generate embeddings
            embeddings = await self._generate_embeddings(texts_to_embed)
            stats['embeddings'] = len(embeddings)
            
            if not embeddings:
                return stats
            
            # Prepare vectors for upsert
            vectors = []
            for i, agent in enumerate(agents):
                if i >= len(embeddings):
                    break
                
                level_info = agent.get('agent_levels', {}) or {}
                personality_info = agent.get('personality_types', {}) or {}
                
                # Build metadata
                metadata = {
                    'name': agent.get('name', ''),
                    'display_name': agent.get('display_name', ''),
                    'description': (agent.get('description', '') or '')[:500],  # Limit metadata size
                    'level': level_info.get('level_number', 2),
                    'level_name': level_info.get('name', 'L2 Expert'),
                    'personality_slug': personality_info.get('slug', 'default'),
                    'tenant_id': agent.get('tenant_id', 'global'),
                    'is_active': agent.get('is_active', True),
                    'domains': agent.get('domains', [])[:10] if agent.get('domains') else [],
                    'capabilities': agent.get('capabilities', [])[:10] if agent.get('capabilities') else [],
                    'updated_at': datetime.utcnow().isoformat(),
                }
                
                vectors.append({
                    'id': agent['id'],
                    'values': embeddings[i],
                    'metadata': metadata,
                })
            
            # Upsert to Pinecone
            namespace = tenant_id or 'global'
            self.index.upsert(vectors=vectors, namespace=namespace)
            stats['synced'] = len(vectors)
            
            logger.info(
                "pinecone_sync_batch_completed",
                synced=stats['synced'],
                namespace=namespace,
            )
            
        except Exception as e:
            logger.error("pinecone_sync_batch_failed", error=str(e))
            stats['errors'].append(str(e))
        
        return stats
    
    def _build_embedding_text(self, agent: Dict[str, Any]) -> str:
        """Build comprehensive text for embedding."""
        parts = []
        
        # Agent name and description
        if agent.get('name'):
            parts.append(f"Agent: {agent['name']}")
        
        if agent.get('display_name') and agent.get('display_name') != agent.get('name'):
            parts.append(f"Display Name: {agent['display_name']}")
        
        if agent.get('description'):
            parts.append(f"Description: {agent['description']}")
        
        # Level information
        level_info = agent.get('agent_levels', {}) or {}
        if level_info.get('name'):
            parts.append(f"Level: {level_info['name']}")
        if level_info.get('description'):
            parts.append(f"Level Description: {level_info['description']}")
        
        # Personality information
        personality_info = agent.get('personality_types', {}) or {}
        if personality_info.get('display_name'):
            parts.append(f"Personality: {personality_info['display_name']}")
        if personality_info.get('description'):
            parts.append(f"Style: {personality_info['description']}")
        
        # Domains and capabilities
        if agent.get('domains'):
            parts.append(f"Domains: {', '.join(agent['domains'][:10])}")
        
        if agent.get('capabilities'):
            parts.append(f"Capabilities: {', '.join(agent['capabilities'][:10])}")
        
        # System prompt snippet (first 500 chars)
        if agent.get('system_prompt'):
            prompt_snippet = agent['system_prompt'][:500]
            parts.append(f"Expertise: {prompt_snippet}")
        
        return "\n".join(parts)
    
    async def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI."""
        if not self.openai_client or not texts:
            return []
        
        try:
            response = await self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=texts,
            )
            
            return [item.embedding for item in response.data]
            
        except Exception as e:
            logger.error("pinecone_generate_embeddings_failed", error=str(e))
            return []
    
    async def sync_single_agent(self, agent_id: str) -> Dict[str, Any]:
        """
        Sync a single agent to Pinecone.
        
        Useful for real-time updates when an agent is modified.
        """
        if not self.index:
            return {'success': False, 'error': 'Pinecone not available'}
        
        logger.info("pinecone_sync_single_agent_started", agent_id=agent_id)
        
        try:
            # Fetch agent
            result = self.supabase.table('agents').select(
                '*, agent_levels(*), personality_types(*)'
            ).eq('id', agent_id).single().execute()
            
            if not result.data:
                return {'success': False, 'error': 'Agent not found'}
            
            agent = result.data
            batch_stats = await self._sync_batch([agent], agent.get('tenant_id'))
            
            logger.info("pinecone_sync_single_agent_completed", agent_id=agent_id)
            return {'success': True, 'agent_id': agent_id, **batch_stats}
            
        except Exception as e:
            logger.error("pinecone_sync_single_agent_failed", agent_id=agent_id, error=str(e))
            return {'success': False, 'error': str(e)}
    
    async def delete_agent(self, agent_id: str, tenant_id: str = 'global') -> Dict[str, Any]:
        """Remove an agent from Pinecone."""
        if not self.index:
            return {'success': False, 'error': 'Pinecone not available'}
        
        try:
            self.index.delete(ids=[agent_id], namespace=tenant_id)
            
            logger.info("pinecone_delete_agent_completed", agent_id=agent_id)
            return {'success': True}
            
        except Exception as e:
            logger.error("pinecone_delete_agent_failed", agent_id=agent_id, error=str(e))
            return {'success': False, 'error': str(e)}
    
    async def search_similar(
        self,
        query: str,
        tenant_id: str = 'global',
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar agents by query.
        
        Args:
            query: Search query
            tenant_id: Tenant namespace
            top_k: Number of results
            filter_metadata: Optional metadata filters
            
        Returns:
            List of matching agents with scores
        """
        if not self.index:
            return []
        
        try:
            # Generate query embedding
            embeddings = await self._generate_embeddings([query])
            if not embeddings:
                return []
            
            # Build filter
            filter_dict = filter_metadata or {}
            
            # Search Pinecone
            results = self.index.query(
                vector=embeddings[0],
                top_k=top_k,
                namespace=tenant_id,
                filter=filter_dict if filter_dict else None,
                include_metadata=True,
            )
            
            matches = []
            for match in results.matches:
                matches.append({
                    'agent_id': match.id,
                    'score': float(match.score),
                    'metadata': match.metadata or {},
                })
            
            return matches
            
        except Exception as e:
            logger.error("pinecone_search_similar_failed", error=str(e))
            return []
    
    async def get_sync_status(self) -> Dict[str, Any]:
        """Get current sync status and statistics."""
        if not self.index:
            return {'connected': False, 'error': 'Pinecone not available'}
        
        try:
            stats = self.index.describe_index_stats()
            
            return {
                'connected': True,
                'index_name': self.index_name,
                'total_vectors': stats.total_vector_count,
                'namespaces': dict(stats.namespaces) if stats.namespaces else {},
                'dimension': stats.dimension,
            }
            
        except Exception as e:
            logger.error("pinecone_get_sync_status_failed", error=str(e))
            return {'connected': False, 'error': str(e)}
    
    async def create_index_if_not_exists(self) -> Dict[str, Any]:
        """Create Pinecone index if it doesn't exist."""
        if not self.pc:
            return {'success': False, 'error': 'Pinecone not available'}
        
        try:
            # Check if index exists
            existing_indexes = self.pc.list_indexes()
            index_names = [idx.name for idx in existing_indexes]
            
            if self.index_name in index_names:
                return {'success': True, 'exists': True}
            
            # Create index
            from pinecone import ServerlessSpec
            
            self.pc.create_index(
                name=self.index_name,
                dimension=self.embedding_dimensions,
                metric='cosine',
                spec=ServerlessSpec(cloud='aws', region='us-east-1'),
            )
            
            # Wait for index to be ready
            import time
            while not self.pc.describe_index(self.index_name).status['ready']:
                time.sleep(1)
            
            self.index = self.pc.Index(self.index_name)
            
            logger.info("pinecone_create_index_completed", index_name=self.index_name)
            return {'success': True, 'created': True}
            
        except Exception as e:
            logger.error("pinecone_create_index_failed", error=str(e))
            return {'success': False, 'error': str(e)}
