"""
VITAL Path AI Services - VITAL Relational Retriever

Relational retrieval for historical patterns using PostgreSQL.
Finds agents based on past successful consultations.

Naming Convention:
- Class: RelationalRetriever
- Methods: retrieve, find_similar_queries, aggregate_performance
- Logs: vital_relational_retriever_{action}
"""

from typing import List, Dict, Any, Optional
import structlog

from ..fusion_rrf import RankedItem

logger = structlog.get_logger()


class RelationalRetriever:
    """
    Relational retrieval for historical patterns.
    
    Finds agents based on:
    - Success rate on similar queries
    - Collaboration patterns
    - Recent performance
    - Domain expertise usage
    """
    
    def __init__(
        self,
        supabase_client=None,
    ):
        """
        Initialize relational retriever.
        
        Args:
            supabase_client: Supabase client for PostgreSQL queries
        """
        self.supabase = supabase_client
        
        logger.info("vital_relational_retriever_initialized")
    
    async def retrieve(
        self,
        query: str,
        tenant_id: str,
        top_k: int = 20,
    ) -> List[RankedItem]:
        """
        Retrieve agents based on historical patterns.
        
        Args:
            query: User's query
            tenant_id: Tenant UUID for isolation
            top_k: Number of results
            
        Returns:
            Ranked list based on historical success
        """
        logger.info(
            "vital_relational_retriever_retrieve_started",
            tenant_id=tenant_id,
            top_k=top_k,
        )
        
        try:
            # Step 1: Find historically similar queries
            similar_queries = await self._find_similar_queries(
                query, tenant_id, limit=100
            )
            
            if not similar_queries:
                # Cold start: return agents by general performance
                return await self._get_top_performing_agents(tenant_id, top_k)
            
            # Step 2: Aggregate agent performance on similar queries
            query_ids = [q['id'] for q in similar_queries]
            performance = await self._aggregate_agent_performance(
                query_ids, tenant_id
            )
            
            if not performance:
                return await self._get_top_performing_agents(tenant_id, top_k)
            
            # Step 3: Find collaboration patterns
            top_agents = list(performance.keys())[:top_k]
            collaborations = await self._find_collaboration_patterns(
                top_agents, tenant_id
            )
            
            # Step 4: Combine into scored results
            items = self._score_and_rank(performance, collaborations, top_k)
            
            logger.info(
                "vital_relational_retriever_retrieve_completed",
                tenant_id=tenant_id,
                similar_queries_found=len(similar_queries),
                result_count=len(items),
            )
            
            return items
            
        except Exception as e:
            logger.error(
                "vital_relational_retriever_retrieve_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            return []
    
    async def _find_similar_queries(
        self,
        query: str,
        tenant_id: str,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Find historically similar queries using full-text search.
        """
        if not self.supabase:
            return []
        
        try:
            # Use PostgreSQL full-text search on session queries
            result = self.supabase.rpc(
                'search_similar_queries',
                {
                    'search_query': query,
                    'tenant_uuid': tenant_id,
                    'result_limit': limit,
                }
            ).execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(
                "vital_relational_retriever_similar_queries_failed",
                error=str(e),
            )
            
            # Fallback: Direct query
            try:
                result = self.supabase.table('vital_sessions') \
                    .select('id, query, agent_id, rating, status') \
                    .eq('tenant_id', tenant_id) \
                    .eq('status', 'completed') \
                    .limit(limit) \
                    .execute()
                
                return result.data if result.data else []
                
            except Exception:
                return []
    
    async def _aggregate_agent_performance(
        self,
        query_ids: List[str],
        tenant_id: str,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Aggregate agent performance on similar queries.
        
        Returns: {agent_id: {success_rate, avg_rating, usage_count, ...}}
        """
        if not self.supabase or not query_ids:
            return {}
        
        try:
            # Query sessions for these query IDs
            result = self.supabase.table('vital_sessions') \
                .select('agent_id, status, rating, total_tokens, created_at') \
                .eq('tenant_id', tenant_id) \
                .in_('id', query_ids) \
                .execute()
            
            if not result.data:
                return {}
            
            # Aggregate by agent
            agent_stats: Dict[str, Dict[str, Any]] = {}
            
            for session in result.data:
                agent_id = session.get('agent_id')
                if not agent_id:
                    continue
                
                if agent_id not in agent_stats:
                    agent_stats[agent_id] = {
                        'total': 0,
                        'successful': 0,
                        'ratings': [],
                        'tokens': [],
                    }
                
                stats = agent_stats[agent_id]
                stats['total'] += 1
                
                if session.get('status') == 'completed':
                    stats['successful'] += 1
                
                if session.get('rating'):
                    stats['ratings'].append(float(session['rating']))
                
                if session.get('total_tokens'):
                    stats['tokens'].append(int(session['total_tokens']))
            
            # Calculate final metrics
            performance = {}
            for agent_id, stats in agent_stats.items():
                success_rate = stats['successful'] / stats['total'] if stats['total'] > 0 else 0
                avg_rating = sum(stats['ratings']) / len(stats['ratings']) if stats['ratings'] else 0
                avg_tokens = sum(stats['tokens']) / len(stats['tokens']) if stats['tokens'] else 0
                
                performance[agent_id] = {
                    'success_rate': success_rate,
                    'avg_rating': avg_rating,
                    'usage_count': stats['total'],
                    'avg_tokens': avg_tokens,
                }
            
            return performance
            
        except Exception as e:
            logger.error(
                "vital_relational_retriever_aggregate_failed",
                error=str(e),
            )
            return {}
    
    async def _find_collaboration_patterns(
        self,
        agent_ids: List[str],
        tenant_id: str,
    ) -> Dict[str, List[str]]:
        """
        Find which agents frequently collaborate successfully.
        
        Returns: {agent_id: [collaborating_agent_ids]}
        """
        if not self.supabase or not agent_ids:
            return {}
        
        # This would query a collaborations table or analyze session patterns
        # For now, return empty (to be implemented with actual data)
        return {}
    
    async def _get_top_performing_agents(
        self,
        tenant_id: str,
        top_k: int,
    ) -> List[RankedItem]:
        """
        Get top performing agents when no historical context available.
        
        Cold-start fallback.
        """
        if not self.supabase:
            return []
        
        try:
            # Get agents with highest ratings
            result = self.supabase.table('agents') \
                .select('id, name, description, domains, avg_rating, usage_count') \
                .eq('tenant_id', tenant_id) \
                .eq('status', 'active') \
                .order('avg_rating', desc=True) \
                .limit(top_k) \
                .execute()
            
            if not result.data:
                return []
            
            items = []
            for rank, agent in enumerate(result.data, start=1):
                score = float(agent.get('avg_rating', 0)) / 5.0  # Normalize to 0-1
                items.append(RankedItem(
                    id=agent['id'],
                    rank=rank,
                    score=score,
                    source='relational',
                    metadata={
                        'name': agent.get('name'),
                        'description': agent.get('description'),
                        'domains': agent.get('domains', []),
                        'usage_count': agent.get('usage_count', 0),
                        'avg_rating': agent.get('avg_rating', 0),
                        'selection_method': 'cold_start',
                    },
                ))
            
            return items
            
        except Exception as e:
            logger.error(
                "vital_relational_retriever_top_agents_failed",
                error=str(e),
            )
            return []
    
    def _score_and_rank(
        self,
        performance: Dict[str, Dict[str, Any]],
        collaborations: Dict[str, List[str]],
        top_k: int,
    ) -> List[RankedItem]:
        """
        Combine performance metrics into final scores.
        
        Scoring formula:
        score = (success_rate * 0.4) + (normalized_rating * 0.4) + (usage_bonus * 0.2)
        """
        scored = []
        
        for agent_id, metrics in performance.items():
            success_rate = metrics.get('success_rate', 0)
            avg_rating = metrics.get('avg_rating', 0) / 5.0  # Normalize
            usage_count = metrics.get('usage_count', 0)
            
            # Usage bonus: more usage = higher confidence, but diminishing returns
            usage_bonus = min(usage_count / 50, 1.0)  # Cap at 50 uses
            
            # Combined score
            score = (success_rate * 0.4) + (avg_rating * 0.4) + (usage_bonus * 0.2)
            
            scored.append((agent_id, score, metrics))
        
        # Sort by score descending
        scored.sort(key=lambda x: x[1], reverse=True)
        
        # Convert to ranked items
        items = []
        for rank, (agent_id, score, metrics) in enumerate(scored[:top_k], start=1):
            items.append(RankedItem(
                id=agent_id,
                rank=rank,
                score=score,
                source='relational',
                metadata={
                    'success_rate': metrics.get('success_rate', 0),
                    'avg_rating': metrics.get('avg_rating', 0),
                    'usage_count': metrics.get('usage_count', 0),
                    'collaborators': collaborations.get(agent_id, []),
                },
            ))
        
        return items
