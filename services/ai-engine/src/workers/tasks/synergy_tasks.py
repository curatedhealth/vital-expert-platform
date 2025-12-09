"""
Synergy Calculation Tasks for Agent OS

Background tasks for calculating agent synergy scores based on:
- Co-occurrence patterns (agents used together)
- Success rates (when used together)
- Complementary capabilities
- Conflict detection

Stage 4: Integration & Sync
Reference: AGENT_IMPLEMENTATION_PLAN.md (Task 4.3)
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import structlog
import math

logger = structlog.get_logger()


@dataclass
class SynergyCalculation:
    """Result of synergy calculation between two agents."""
    agent_a_id: str
    agent_b_id: str
    synergy_score: float
    co_occurrence_count: int
    success_rate: float
    complementary_score: float
    conflict_score: float
    is_recommended: bool
    calculation_details: Dict[str, Any]


class SynergyCalculationService:
    """
    Service for calculating and updating agent synergy scores.
    
    Synergy is calculated based on:
    1. Co-occurrence: How often agents are used together
    2. Success rate: Average outcome when used together
    3. Complementary capabilities: Domain/skill overlap
    4. Conflict detection: Contradicting approaches
    """
    
    # Weights for synergy calculation
    WEIGHTS = {
        'co_occurrence': 0.30,
        'success_rate': 0.35,
        'complementary': 0.25,
        'conflict_penalty': 0.10,
    }
    
    # Minimum sessions to calculate reliable synergy
    MIN_CO_OCCURRENCES = 3
    
    def __init__(self, supabase_client):
        """
        Initialize synergy calculation service.
        
        Args:
            supabase_client: Supabase client for database operations
        """
        self.supabase = supabase_client
        logger.info("synergy_calculation_service_initialized")
    
    async def calculate_all_synergies(
        self,
        tenant_id: Optional[str] = None,
        lookback_days: int = 90,
    ) -> Dict[str, Any]:
        """
        Calculate synergy scores for all agent pairs.
        
        Args:
            tenant_id: Optional tenant filter
            lookback_days: Days to look back for session data
            
        Returns:
            Calculation statistics
        """
        logger.info(
            "synergy_calculate_all_started",
            tenant_id=tenant_id,
            lookback_days=lookback_days,
        )
        
        stats = {
            'pairs_analyzed': 0,
            'synergies_created': 0,
            'synergies_updated': 0,
            'errors': [],
            'started_at': datetime.utcnow().isoformat(),
        }
        
        try:
            # Step 1: Get all active agents
            agents = await self._get_active_agents(tenant_id)
            
            if len(agents) < 2:
                stats['message'] = 'Not enough agents for synergy calculation'
                return stats
            
            # Step 2: Get session co-occurrence data
            cutoff_date = datetime.utcnow() - timedelta(days=lookback_days)
            co_occurrences = await self._get_co_occurrences(tenant_id, cutoff_date)
            
            # Step 3: Calculate synergy for each pair
            for i, agent_a in enumerate(agents):
                for agent_b in agents[i+1:]:
                    stats['pairs_analyzed'] += 1
                    
                    try:
                        synergy = await self._calculate_pair_synergy(
                            agent_a, agent_b, co_occurrences
                        )
                        
                        if synergy:
                            result = await self._upsert_synergy(synergy, tenant_id)
                            if result.get('created'):
                                stats['synergies_created'] += 1
                            else:
                                stats['synergies_updated'] += 1
                                
                    except Exception as e:
                        logger.warning(
                            "synergy_pair_calculation_failed",
                            agent_a=agent_a['id'],
                            agent_b=agent_b['id'],
                            error=str(e),
                        )
                        stats['errors'].append(f"{agent_a['id']}-{agent_b['id']}: {str(e)}")
            
            stats['completed_at'] = datetime.utcnow().isoformat()
            stats['success'] = True
            
            logger.info("synergy_calculate_all_completed", **stats)
            
        except Exception as e:
            logger.error("synergy_calculate_all_failed", error=str(e))
            stats['errors'].append(str(e))
            stats['success'] = False
        
        return stats
    
    async def _get_active_agents(
        self, 
        tenant_id: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Get all active agents."""
        query = self.supabase.table('agents').select(
            'id, name, domains, capabilities, level_id'
        ).eq('is_active', True)
        
        if tenant_id:
            query = query.eq('tenant_id', tenant_id)
        
        result = query.execute()
        return result.data or []
    
    async def _get_co_occurrences(
        self,
        tenant_id: Optional[str],
        cutoff_date: datetime,
    ) -> Dict[Tuple[str, str], Dict[str, Any]]:
        """
        Get co-occurrence data from session history.
        
        Returns dict with (agent_a, agent_b) -> occurrence data
        """
        # Query sessions with multiple agents
        query = self.supabase.rpc(
            'get_agent_co_occurrences',
            {
                'p_tenant_id': tenant_id,
                'p_cutoff_date': cutoff_date.isoformat(),
            }
        )
        
        try:
            result = query.execute()
            
            co_occurrences = {}
            for row in result.data or []:
                key = tuple(sorted([row['agent_a_id'], row['agent_b_id']]))
                co_occurrences[key] = {
                    'count': row['occurrence_count'],
                    'avg_satisfaction': row.get('avg_satisfaction', 0.5),
                    'avg_response_quality': row.get('avg_response_quality', 0.5),
                    'total_tokens': row.get('total_tokens', 0),
                }
            
            return co_occurrences
            
        except Exception as e:
            logger.warning("get_co_occurrences_failed", error=str(e))
            # Return empty if RPC doesn't exist yet
            return {}
    
    async def _calculate_pair_synergy(
        self,
        agent_a: Dict[str, Any],
        agent_b: Dict[str, Any],
        co_occurrences: Dict[Tuple[str, str], Dict[str, Any]],
    ) -> Optional[SynergyCalculation]:
        """Calculate synergy between two agents."""
        
        # Get co-occurrence data
        key = tuple(sorted([agent_a['id'], agent_b['id']]))
        co_data = co_occurrences.get(key, {})
        
        co_occurrence_count = co_data.get('count', 0)
        
        # Calculate individual components
        
        # 1. Co-occurrence score (normalized)
        co_occurrence_score = self._calculate_co_occurrence_score(co_occurrence_count)
        
        # 2. Success rate (from session outcomes)
        success_rate = co_data.get('avg_satisfaction', 0.5)
        if co_data.get('avg_response_quality'):
            success_rate = (success_rate + co_data['avg_response_quality']) / 2
        
        # 3. Complementary capabilities score
        complementary_score = self._calculate_complementary_score(agent_a, agent_b)
        
        # 4. Conflict score (penalizes conflicting approaches)
        conflict_score = self._calculate_conflict_score(agent_a, agent_b)
        
        # Calculate final synergy score
        synergy_score = (
            self.WEIGHTS['co_occurrence'] * co_occurrence_score +
            self.WEIGHTS['success_rate'] * success_rate +
            self.WEIGHTS['complementary'] * complementary_score -
            self.WEIGHTS['conflict_penalty'] * conflict_score
        )
        
        # Normalize to 0-1 range
        synergy_score = max(0.0, min(1.0, synergy_score))
        
        # Determine if recommended
        is_recommended = (
            synergy_score >= 0.6 and 
            co_occurrence_count >= self.MIN_CO_OCCURRENCES and
            conflict_score < 0.3
        )
        
        return SynergyCalculation(
            agent_a_id=agent_a['id'],
            agent_b_id=agent_b['id'],
            synergy_score=synergy_score,
            co_occurrence_count=co_occurrence_count,
            success_rate=success_rate,
            complementary_score=complementary_score,
            conflict_score=conflict_score,
            is_recommended=is_recommended,
            calculation_details={
                'co_occurrence_score': co_occurrence_score,
                'weights': self.WEIGHTS,
                'min_co_occurrences': self.MIN_CO_OCCURRENCES,
            },
        )
    
    def _calculate_co_occurrence_score(self, count: int) -> float:
        """
        Calculate co-occurrence score with diminishing returns.
        
        Uses logarithmic scaling so high counts don't dominate.
        """
        if count == 0:
            return 0.0
        
        # Log scaling with baseline
        # Score of 0.5 at MIN_CO_OCCURRENCES, approaches 1.0 asymptotically
        normalized = math.log(1 + count) / math.log(1 + self.MIN_CO_OCCURRENCES * 10)
        return min(1.0, normalized)
    
    def _calculate_complementary_score(
        self,
        agent_a: Dict[str, Any],
        agent_b: Dict[str, Any],
    ) -> float:
        """
        Calculate how complementary two agents' capabilities are.
        
        High score = different but compatible expertise
        Low score = too similar or incompatible
        """
        domains_a = set(agent_a.get('domains', []) or [])
        domains_b = set(agent_b.get('domains', []) or [])
        
        caps_a = set(agent_a.get('capabilities', []) or [])
        caps_b = set(agent_b.get('capabilities', []) or [])
        
        # Calculate overlap ratios
        if domains_a or domains_b:
            domain_overlap = len(domains_a & domains_b) / max(len(domains_a | domains_b), 1)
        else:
            domain_overlap = 0.5  # Neutral if no domain data
        
        if caps_a or caps_b:
            cap_overlap = len(caps_a & caps_b) / max(len(caps_a | caps_b), 1)
        else:
            cap_overlap = 0.5  # Neutral if no capability data
        
        # Ideal complementarity is partial overlap (not too similar, not completely different)
        # Score peaks at ~30% overlap
        domain_complementary = 1.0 - abs(domain_overlap - 0.3) * 1.5
        cap_complementary = 1.0 - abs(cap_overlap - 0.3) * 1.5
        
        # Combine scores
        score = (domain_complementary + cap_complementary) / 2
        return max(0.0, min(1.0, score))
    
    def _calculate_conflict_score(
        self,
        agent_a: Dict[str, Any],
        agent_b: Dict[str, Any],
    ) -> float:
        """
        Detect potential conflicts between agents.
        
        Currently based on domain incompatibilities.
        Could be extended with personality conflicts, etc.
        """
        # Define conflicting domain pairs
        conflicting_pairs = {
            ('conservative', 'aggressive'),
            ('regulatory', 'experimental'),
            ('safety-first', 'speed-first'),
        }
        
        domains_a = set(d.lower() for d in (agent_a.get('domains', []) or []))
        domains_b = set(d.lower() for d in (agent_b.get('domains', []) or []))
        
        conflict_count = 0
        for conflict_a, conflict_b in conflicting_pairs:
            if (conflict_a in domains_a and conflict_b in domains_b) or \
               (conflict_b in domains_a and conflict_a in domains_b):
                conflict_count += 1
        
        # Normalize conflict score
        return min(1.0, conflict_count * 0.4)
    
    async def _upsert_synergy(
        self,
        synergy: SynergyCalculation,
        tenant_id: Optional[str],
    ) -> Dict[str, Any]:
        """Upsert synergy record to database."""
        
        # Ensure consistent ordering (alphabetical by ID)
        agent_ids = sorted([synergy.agent_a_id, synergy.agent_b_id])
        
        data = {
            'agent_a_id': agent_ids[0],
            'agent_b_id': agent_ids[1],
            'synergy_score': synergy.synergy_score,
            'co_occurrence_count': synergy.co_occurrence_count,
            'success_rate': synergy.success_rate,
            'complementary_score': synergy.complementary_score,
            'conflict_score': synergy.conflict_score,
            'is_recommended': synergy.is_recommended,
            'last_calculated_at': datetime.utcnow().isoformat(),
        }
        
        if tenant_id:
            data['tenant_id'] = tenant_id
        
        try:
            # Try upsert
            result = self.supabase.table('agent_synergies').upsert(
                data,
                on_conflict='agent_a_id,agent_b_id'
            ).execute()
            
            return {'created': True, 'data': result.data}
            
        except Exception as e:
            logger.error("upsert_synergy_failed", error=str(e))
            raise
    
    async def get_synergies_for_agent(
        self,
        agent_id: str,
        min_score: float = 0.0,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Get synergy scores for a specific agent."""
        try:
            # Query both directions (agent can be A or B)
            result_a = self.supabase.table('agent_synergies').select(
                '*, agents!agent_synergies_agent_b_id_fkey(id, name, display_name)'
            ).eq('agent_a_id', agent_id).gte('synergy_score', min_score).execute()
            
            result_b = self.supabase.table('agent_synergies').select(
                '*, agents!agent_synergies_agent_a_id_fkey(id, name, display_name)'
            ).eq('agent_b_id', agent_id).gte('synergy_score', min_score).execute()
            
            synergies = []
            
            for row in result_a.data or []:
                synergies.append({
                    'partner_agent_id': row['agent_b_id'],
                    'partner_agent': row.get('agents'),
                    'synergy_score': row['synergy_score'],
                    'is_recommended': row['is_recommended'],
                })
            
            for row in result_b.data or []:
                synergies.append({
                    'partner_agent_id': row['agent_a_id'],
                    'partner_agent': row.get('agents'),
                    'synergy_score': row['synergy_score'],
                    'is_recommended': row['is_recommended'],
                })
            
            # Sort by score and limit
            synergies.sort(key=lambda x: x['synergy_score'], reverse=True)
            return synergies[:limit]
            
        except Exception as e:
            logger.error("get_synergies_for_agent_failed", agent_id=agent_id, error=str(e))
            return []
    
    async def get_recommended_partners(
        self,
        agent_id: str,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Get recommended agent partners based on synergy."""
        synergies = await self.get_synergies_for_agent(
            agent_id, 
            min_score=0.5,
            limit=limit * 2,
        )
        
        # Filter to recommended only
        recommended = [s for s in synergies if s.get('is_recommended')]
        return recommended[:limit]


# Celery task wrapper (if using Celery)
def calculate_synergies_task(tenant_id: Optional[str] = None, lookback_days: int = 90):
    """
    Celery task wrapper for synergy calculation.
    
    Usage:
        calculate_synergies_task.delay(tenant_id='xxx')
    """
    import asyncio
    from services.supabase_client import get_supabase_client
    
    async def _run():
        supabase = get_supabase_client()
        service = SynergyCalculationService(supabase)
        return await service.calculate_all_synergies(tenant_id, lookback_days)
    
    return asyncio.run(_run())
