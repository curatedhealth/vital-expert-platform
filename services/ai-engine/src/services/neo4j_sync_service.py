"""
Neo4j Sync Service for Agent OS

Syncs agent data from PostgreSQL to Neo4j for graph-based retrieval.
Creates nodes for agents, concepts, and relationships between them.

Stage 4: Integration & Sync
Reference: AGENT_IMPLEMENTATION_PLAN.md (Task 4.1)
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog
import asyncio

logger = structlog.get_logger()


class Neo4jSyncService:
    """
    Service for syncing agent data from PostgreSQL to Neo4j.
    
    Creates and maintains:
    - Agent nodes with properties
    - Concept nodes (domains, capabilities, therapeutic areas)
    - Relationships (SPECIALIZES_IN, WORKS_WITH, HAS_CAPABILITY, etc.)
    - Synergy relationships between agents
    """
    
    def __init__(
        self,
        supabase_client,
        neo4j_driver=None,
        neo4j_uri: Optional[str] = None,
        neo4j_auth: Optional[tuple] = None,
    ):
        """
        Initialize sync service.
        
        Args:
            supabase_client: Supabase client for PostgreSQL queries
            neo4j_driver: Pre-configured Neo4j async driver
            neo4j_uri: Neo4j connection URI (if driver not provided)
            neo4j_auth: (username, password) tuple
        """
        self.supabase = supabase_client
        self.driver = neo4j_driver
        
        if not self.driver and neo4j_uri:
            try:
                from neo4j import AsyncGraphDatabase
                self.driver = AsyncGraphDatabase.driver(neo4j_uri, auth=neo4j_auth)
                logger.info("neo4j_sync_service_driver_created")
            except ImportError:
                logger.warning("neo4j_sync_service_neo4j_not_available")
        
        logger.info("neo4j_sync_service_initialized")
    
    async def sync_all(self, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Full sync of all agent data to Neo4j.
        
        Args:
            tenant_id: Optional tenant filter (syncs all if None)
            
        Returns:
            Sync statistics
        """
        logger.info("neo4j_sync_all_started", tenant_id=tenant_id)
        
        stats = {
            'agents_synced': 0,
            'concepts_synced': 0,
            'relationships_synced': 0,
            'synergies_synced': 0,
            'errors': [],
            'started_at': datetime.utcnow().isoformat(),
        }
        
        try:
            # Step 1: Sync concepts (regions, domains, TAs, phases)
            concept_stats = await self._sync_concepts()
            stats['concepts_synced'] = concept_stats['total']
            
            # Step 2: Sync agents
            agent_stats = await self._sync_agents(tenant_id)
            stats['agents_synced'] = agent_stats['total']
            
            # Step 3: Sync agent-concept relationships
            rel_stats = await self._sync_agent_relationships(tenant_id)
            stats['relationships_synced'] = rel_stats['total']
            
            # Step 4: Sync synergy relationships
            synergy_stats = await self._sync_synergies(tenant_id)
            stats['synergies_synced'] = synergy_stats['total']
            
            stats['completed_at'] = datetime.utcnow().isoformat()
            stats['success'] = True
            
            logger.info("neo4j_sync_all_completed", **stats)
            
        except Exception as e:
            logger.error("neo4j_sync_all_failed", error=str(e))
            stats['errors'].append(str(e))
            stats['success'] = False
        
        return stats
    
    async def _sync_concepts(self) -> Dict[str, int]:
        """Sync concept nodes (regions, domains, TAs, phases)."""
        if not self.driver:
            return {'total': 0}
        
        total = 0
        
        try:
            async with self.driver.session() as session:
                # Sync regions
                regions = self.supabase.table('context_regions').select('*').execute()
                for region in regions.data or []:
                    await session.run("""
                        MERGE (c:Concept:Region {id: $id})
                        SET c.name = $name,
                            c.code = $code,
                            c.type = 'region',
                            c.updated_at = datetime()
                    """, {
                        'id': region['id'],
                        'name': region['name'],
                        'code': region['code'],
                    })
                    total += 1
                
                # Sync domains
                domains = self.supabase.table('context_domains').select('*').execute()
                for domain in domains.data or []:
                    await session.run("""
                        MERGE (c:Concept:Domain {id: $id})
                        SET c.name = $name,
                            c.code = $code,
                            c.type = 'domain',
                            c.updated_at = datetime()
                    """, {
                        'id': domain['id'],
                        'name': domain['name'],
                        'code': domain['code'],
                    })
                    total += 1
                
                # Sync therapeutic areas
                tas = self.supabase.table('context_therapeutic_areas').select('*').execute()
                for ta in tas.data or []:
                    await session.run("""
                        MERGE (c:Concept:TherapeuticArea {id: $id})
                        SET c.name = $name,
                            c.code = $code,
                            c.type = 'therapeutic_area',
                            c.updated_at = datetime()
                    """, {
                        'id': ta['id'],
                        'name': ta['name'],
                        'code': ta['code'],
                    })
                    total += 1
                
                # Sync phases
                phases = self.supabase.table('context_phases').select('*').execute()
                for phase in phases.data or []:
                    await session.run("""
                        MERGE (c:Concept:Phase {id: $id})
                        SET c.name = $name,
                            c.code = $code,
                            c.type = 'phase',
                            c.updated_at = datetime()
                    """, {
                        'id': phase['id'],
                        'name': phase['name'],
                        'code': phase['code'],
                    })
                    total += 1
                
                logger.info("neo4j_sync_concepts_completed", total=total)
                
        except Exception as e:
            logger.error("neo4j_sync_concepts_failed", error=str(e))
        
        return {'total': total}
    
    async def _sync_agents(self, tenant_id: Optional[str] = None) -> Dict[str, int]:
        """Sync agent nodes."""
        if not self.driver:
            return {'total': 0}
        
        total = 0
        
        try:
            # Fetch agents from PostgreSQL
            query = self.supabase.table('agents').select(
                '*, agent_levels(*), personality_types(*)'
            )
            if tenant_id:
                query = query.eq('tenant_id', tenant_id)
            
            result = query.execute()
            
            async with self.driver.session() as session:
                for agent in result.data or []:
                    level_info = agent.get('agent_levels', {}) or {}
                    personality_info = agent.get('personality_types', {}) or {}
                    
                    await session.run("""
                        MERGE (a:Agent {id: $id})
                        SET a.name = $name,
                            a.display_name = $display_name,
                            a.description = $description,
                            a.level = $level,
                            a.level_name = $level_name,
                            a.tenant_id = $tenant_id,
                            a.personality_slug = $personality_slug,
                            a.base_model = $base_model,
                            a.is_active = $is_active,
                            a.updated_at = datetime()
                    """, {
                        'id': agent['id'],
                        'name': agent.get('name', ''),
                        'display_name': agent.get('display_name', ''),
                        'description': agent.get('description', ''),
                        'level': level_info.get('level_number', 2),
                        'level_name': level_info.get('name', 'L2 Expert'),
                        'tenant_id': agent.get('tenant_id'),
                        'personality_slug': personality_info.get('slug', 'default'),
                        'base_model': agent.get('base_model', 'claude-sonnet-4'),
                        'is_active': agent.get('is_active', True),
                    })
                    total += 1
                
                logger.info("neo4j_sync_agents_completed", total=total)
                
        except Exception as e:
            logger.error("neo4j_sync_agents_failed", error=str(e))
        
        return {'total': total}
    
    async def _sync_agent_relationships(
        self, 
        tenant_id: Optional[str] = None
    ) -> Dict[str, int]:
        """Sync agent-concept relationships."""
        if not self.driver:
            return {'total': 0}
        
        total = 0
        
        try:
            async with self.driver.session() as session:
                # Sync region relationships
                query = self.supabase.table('agent_context_regions').select('*')
                if tenant_id:
                    # Filter by agent's tenant
                    agents = self.supabase.table('agents').select('id').eq('tenant_id', tenant_id).execute()
                    agent_ids = [a['id'] for a in agents.data or []]
                    if agent_ids:
                        query = query.in_('agent_id', agent_ids)
                
                result = query.execute()
                for rel in result.data or []:
                    await session.run("""
                        MATCH (a:Agent {id: $agent_id})
                        MATCH (c:Concept:Region {id: $region_id})
                        MERGE (a)-[r:SPECIALIZES_IN]->(c)
                        SET r.is_primary = $is_primary,
                            r.updated_at = datetime()
                    """, {
                        'agent_id': rel['agent_id'],
                        'region_id': rel['region_id'],
                        'is_primary': rel.get('is_primary', False),
                    })
                    total += 1
                
                # Sync domain relationships
                query = self.supabase.table('agent_context_domains').select('*')
                result = query.execute()
                for rel in result.data or []:
                    await session.run("""
                        MATCH (a:Agent {id: $agent_id})
                        MATCH (c:Concept:Domain {id: $domain_id})
                        MERGE (a)-[r:WORKS_IN]->(c)
                        SET r.is_primary = $is_primary,
                            r.updated_at = datetime()
                    """, {
                        'agent_id': rel['agent_id'],
                        'domain_id': rel['domain_id'],
                        'is_primary': rel.get('is_primary', False),
                    })
                    total += 1
                
                # Sync therapeutic area relationships
                query = self.supabase.table('agent_context_therapeutic_areas').select('*')
                result = query.execute()
                for rel in result.data or []:
                    await session.run("""
                        MATCH (a:Agent {id: $agent_id})
                        MATCH (c:Concept:TherapeuticArea {id: $therapeutic_area_id})
                        MERGE (a)-[r:EXPERT_IN]->(c)
                        SET r.is_primary = $is_primary,
                            r.updated_at = datetime()
                    """, {
                        'agent_id': rel['agent_id'],
                        'therapeutic_area_id': rel['therapeutic_area_id'],
                        'is_primary': rel.get('is_primary', False),
                    })
                    total += 1
                
                # Sync phase relationships
                query = self.supabase.table('agent_context_phases').select('*')
                result = query.execute()
                for rel in result.data or []:
                    await session.run("""
                        MATCH (a:Agent {id: $agent_id})
                        MATCH (c:Concept:Phase {id: $phase_id})
                        MERGE (a)-[r:SUPPORTS]->(c)
                        SET r.is_primary = $is_primary,
                            r.updated_at = datetime()
                    """, {
                        'agent_id': rel['agent_id'],
                        'phase_id': rel['phase_id'],
                        'is_primary': rel.get('is_primary', False),
                    })
                    total += 1
                
                logger.info("neo4j_sync_relationships_completed", total=total)
                
        except Exception as e:
            logger.error("neo4j_sync_relationships_failed", error=str(e))
        
        return {'total': total}
    
    async def _sync_synergies(self, tenant_id: Optional[str] = None) -> Dict[str, int]:
        """Sync synergy relationships between agents."""
        if not self.driver:
            return {'total': 0}
        
        total = 0
        
        try:
            # Fetch synergies
            query = self.supabase.table('agent_synergies').select('*')
            if tenant_id:
                query = query.eq('tenant_id', tenant_id)
            
            result = query.execute()
            
            async with self.driver.session() as session:
                for synergy in result.data or []:
                    await session.run("""
                        MATCH (a:Agent {id: $agent_a_id})
                        MATCH (b:Agent {id: $agent_b_id})
                        MERGE (a)-[r:SYNERGY_WITH]-(b)
                        SET r.synergy_score = $synergy_score,
                            r.co_occurrence_count = $co_occurrence_count,
                            r.success_rate = $success_rate,
                            r.complementary_score = $complementary_score,
                            r.conflict_score = $conflict_score,
                            r.is_recommended = $is_recommended,
                            r.updated_at = datetime()
                    """, {
                        'agent_a_id': synergy['agent_a_id'],
                        'agent_b_id': synergy['agent_b_id'],
                        'synergy_score': synergy.get('synergy_score', 0.0),
                        'co_occurrence_count': synergy.get('co_occurrence_count', 0),
                        'success_rate': synergy.get('success_rate', 0.0),
                        'complementary_score': synergy.get('complementary_score', 0.0),
                        'conflict_score': synergy.get('conflict_score', 0.0),
                        'is_recommended': synergy.get('is_recommended', False),
                    })
                    total += 1
                
                logger.info("neo4j_sync_synergies_completed", total=total)
                
        except Exception as e:
            logger.error("neo4j_sync_synergies_failed", error=str(e))
        
        return {'total': total}
    
    async def sync_single_agent(self, agent_id: str) -> Dict[str, Any]:
        """
        Sync a single agent and its relationships.
        
        Useful for real-time updates when an agent is modified.
        """
        if not self.driver:
            return {'success': False, 'error': 'Neo4j not available'}
        
        logger.info("neo4j_sync_single_agent_started", agent_id=agent_id)
        
        try:
            # Fetch agent
            result = self.supabase.table('agents').select(
                '*, agent_levels(*), personality_types(*)'
            ).eq('id', agent_id).single().execute()
            
            if not result.data:
                return {'success': False, 'error': 'Agent not found'}
            
            agent = result.data
            
            async with self.driver.session() as session:
                # Sync agent node
                level_info = agent.get('agent_levels', {}) or {}
                personality_info = agent.get('personality_types', {}) or {}
                
                await session.run("""
                    MERGE (a:Agent {id: $id})
                    SET a.name = $name,
                        a.display_name = $display_name,
                        a.description = $description,
                        a.level = $level,
                        a.level_name = $level_name,
                        a.tenant_id = $tenant_id,
                        a.personality_slug = $personality_slug,
                        a.base_model = $base_model,
                        a.is_active = $is_active,
                        a.updated_at = datetime()
                """, {
                    'id': agent['id'],
                    'name': agent.get('name', ''),
                    'display_name': agent.get('display_name', ''),
                    'description': agent.get('description', ''),
                    'level': level_info.get('level_number', 2),
                    'level_name': level_info.get('name', 'L2 Expert'),
                    'tenant_id': agent.get('tenant_id'),
                    'personality_slug': personality_info.get('slug', 'default'),
                    'base_model': agent.get('base_model', 'claude-sonnet-4'),
                    'is_active': agent.get('is_active', True),
                })
            
            logger.info("neo4j_sync_single_agent_completed", agent_id=agent_id)
            return {'success': True, 'agent_id': agent_id}
            
        except Exception as e:
            logger.error("neo4j_sync_single_agent_failed", agent_id=agent_id, error=str(e))
            return {'success': False, 'error': str(e)}
    
    async def delete_agent(self, agent_id: str) -> Dict[str, Any]:
        """Remove an agent from Neo4j."""
        if not self.driver:
            return {'success': False, 'error': 'Neo4j not available'}
        
        try:
            async with self.driver.session() as session:
                await session.run("""
                    MATCH (a:Agent {id: $id})
                    DETACH DELETE a
                """, {'id': agent_id})
            
            logger.info("neo4j_delete_agent_completed", agent_id=agent_id)
            return {'success': True}
            
        except Exception as e:
            logger.error("neo4j_delete_agent_failed", agent_id=agent_id, error=str(e))
            return {'success': False, 'error': str(e)}
    
    async def get_sync_status(self) -> Dict[str, Any]:
        """Get current sync status and statistics."""
        if not self.driver:
            return {'connected': False, 'error': 'Neo4j not available'}
        
        try:
            async with self.driver.session() as session:
                # Count nodes and relationships
                result = await session.run("""
                    MATCH (a:Agent) WITH count(a) as agents
                    MATCH (c:Concept) WITH agents, count(c) as concepts
                    MATCH ()-[r]->() WITH agents, concepts, count(r) as relationships
                    RETURN agents, concepts, relationships
                """)
                
                record = await result.single()
                
                return {
                    'connected': True,
                    'agents': record['agents'],
                    'concepts': record['concepts'],
                    'relationships': record['relationships'],
                }
                
        except Exception as e:
            logger.error("neo4j_get_sync_status_failed", error=str(e))
            return {'connected': False, 'error': str(e)}
