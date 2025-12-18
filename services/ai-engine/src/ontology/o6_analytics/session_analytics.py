"""
Session Analytics Service for Agent OS

Provides analytics and insights from agent session data:
- Usage statistics per agent
- Cost analysis
- Performance metrics
- Trend analysis

Stage 4: Integration & Sync
Reference: AGENT_IMPLEMENTATION_PLAN.md (Task 4.4)
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import structlog

logger = structlog.get_logger()


@dataclass
class AgentUsageStats:
    """Usage statistics for a single agent."""
    agent_id: str
    agent_name: str
    total_sessions: int = 0
    total_queries: int = 0
    total_tokens: int = 0
    total_cost_usd: float = 0.0
    avg_response_time_ms: float = 0.0
    avg_satisfaction_score: float = 0.0
    unique_users: int = 0
    most_common_contexts: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class TenantAnalytics:
    """Analytics summary for a tenant."""
    tenant_id: str
    period_start: datetime
    period_end: datetime
    total_sessions: int = 0
    total_queries: int = 0
    total_cost_usd: float = 0.0
    active_users: int = 0
    top_agents: List[AgentUsageStats] = field(default_factory=list)
    usage_by_level: Dict[str, int] = field(default_factory=dict)
    usage_by_personality: Dict[str, int] = field(default_factory=dict)
    context_distribution: Dict[str, Dict[str, int]] = field(default_factory=dict)


class SessionAnalyticsService:
    """
    Service for analyzing agent session data.
    
    Provides:
    - Per-agent usage statistics
    - Tenant-level analytics
    - Cost tracking and analysis
    - Performance metrics
    - Context usage patterns
    """
    
    def __init__(self, supabase_client):
        """
        Initialize analytics service.
        
        Args:
            supabase_client: Supabase client for database queries
        """
        self.supabase = supabase_client
        logger.info("session_analytics_service_initialized")
    
    async def get_agent_stats(
        self,
        agent_id: str,
        tenant_id: Optional[str] = None,
        days: int = 30,
    ) -> AgentUsageStats:
        """
        Get usage statistics for a specific agent.
        
        Args:
            agent_id: Agent UUID
            tenant_id: Optional tenant filter
            days: Lookback period in days
            
        Returns:
            AgentUsageStats with detailed metrics
        """
        logger.info(
            "get_agent_stats_started",
            agent_id=agent_id,
            days=days,
        )
        
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        try:
            # Get agent info
            agent_result = self.supabase.table('agents').select(
                'id, name, display_name'
            ).eq('id', agent_id).single().execute()
            
            agent_name = agent_result.data.get('name', 'Unknown') if agent_result.data else 'Unknown'
            
            # Build session query
            query = self.supabase.table('agent_sessions').select(
                'id, user_id, total_input_tokens, total_output_tokens, '
                'total_cost_usd, avg_response_time_ms, satisfaction_score, '
                'context_region_id, context_domain_id, context_therapeutic_area_id, '
                'context_phase_id, personality_type_id, query_count'
            ).eq('agent_id', agent_id).gte('started_at', cutoff.isoformat())
            
            if tenant_id:
                query = query.eq('tenant_id', tenant_id)
            
            result = query.execute()
            sessions = result.data or []
            
            # Calculate statistics
            stats = AgentUsageStats(
                agent_id=agent_id,
                agent_name=agent_name,
            )
            
            if not sessions:
                return stats
            
            stats.total_sessions = len(sessions)
            
            unique_users = set()
            total_response_time = 0
            response_time_count = 0
            total_satisfaction = 0
            satisfaction_count = 0
            context_counts = {
                'regions': {},
                'domains': {},
                'therapeutic_areas': {},
                'phases': {},
            }
            
            for session in sessions:
                # Tokens and cost
                stats.total_tokens += (session.get('total_input_tokens', 0) or 0)
                stats.total_tokens += (session.get('total_output_tokens', 0) or 0)
                stats.total_cost_usd += (session.get('total_cost_usd', 0) or 0)
                stats.total_queries += (session.get('query_count', 0) or 0)
                
                # Users
                if session.get('user_id'):
                    unique_users.add(session['user_id'])
                
                # Response time
                if session.get('avg_response_time_ms'):
                    total_response_time += session['avg_response_time_ms']
                    response_time_count += 1
                
                # Satisfaction
                if session.get('satisfaction_score'):
                    total_satisfaction += session['satisfaction_score']
                    satisfaction_count += 1
                
                # Context counts
                for context_key, db_key in [
                    ('regions', 'context_region_id'),
                    ('domains', 'context_domain_id'),
                    ('therapeutic_areas', 'context_therapeutic_area_id'),
                    ('phases', 'context_phase_id'),
                ]:
                    if session.get(db_key):
                        context_counts[context_key][session[db_key]] = \
                            context_counts[context_key].get(session[db_key], 0) + 1
            
            stats.unique_users = len(unique_users)
            
            if response_time_count > 0:
                stats.avg_response_time_ms = total_response_time / response_time_count
            
            if satisfaction_count > 0:
                stats.avg_satisfaction_score = total_satisfaction / satisfaction_count
            
            # Get most common contexts
            stats.most_common_contexts = self._get_top_contexts(context_counts)
            
            logger.info(
                "get_agent_stats_completed",
                agent_id=agent_id,
                total_sessions=stats.total_sessions,
            )
            
            return stats
            
        except Exception as e:
            logger.error("get_agent_stats_failed", agent_id=agent_id, error=str(e))
            return AgentUsageStats(agent_id=agent_id, agent_name='Error')
    
    async def get_tenant_analytics(
        self,
        tenant_id: str,
        days: int = 30,
        top_agents_limit: int = 10,
    ) -> TenantAnalytics:
        """
        Get comprehensive analytics for a tenant.
        
        Args:
            tenant_id: Tenant UUID
            days: Lookback period in days
            top_agents_limit: Number of top agents to include
            
        Returns:
            TenantAnalytics with full breakdown
        """
        logger.info(
            "get_tenant_analytics_started",
            tenant_id=tenant_id,
            days=days,
        )
        
        period_end = datetime.utcnow()
        period_start = period_end - timedelta(days=days)
        
        analytics = TenantAnalytics(
            tenant_id=tenant_id,
            period_start=period_start,
            period_end=period_end,
        )
        
        try:
            # Get all sessions for tenant in period
            result = self.supabase.table('agent_sessions').select(
                'id, agent_id, user_id, total_input_tokens, total_output_tokens, '
                'total_cost_usd, query_count, personality_type_id, '
                'context_region_id, context_domain_id, context_therapeutic_area_id, '
                'context_phase_id'
            ).eq('tenant_id', tenant_id).gte(
                'started_at', period_start.isoformat()
            ).execute()
            
            sessions = result.data or []
            
            if not sessions:
                return analytics
            
            # Aggregate metrics
            analytics.total_sessions = len(sessions)
            
            unique_users = set()
            agent_sessions = {}  # agent_id -> session count
            personality_counts = {}
            level_counts = {}
            context_distribution = {
                'regions': {},
                'domains': {},
                'therapeutic_areas': {},
                'phases': {},
            }
            
            for session in sessions:
                # Total queries and cost
                analytics.total_queries += (session.get('query_count', 0) or 0)
                analytics.total_cost_usd += (session.get('total_cost_usd', 0) or 0)
                
                # Users
                if session.get('user_id'):
                    unique_users.add(session['user_id'])
                
                # Agent counts
                if session.get('agent_id'):
                    agent_sessions[session['agent_id']] = \
                        agent_sessions.get(session['agent_id'], 0) + 1
                
                # Personality counts
                if session.get('personality_type_id'):
                    personality_counts[session['personality_type_id']] = \
                        personality_counts.get(session['personality_type_id'], 0) + 1
                
                # Context distribution
                for context_key, db_key in [
                    ('regions', 'context_region_id'),
                    ('domains', 'context_domain_id'),
                    ('therapeutic_areas', 'context_therapeutic_area_id'),
                    ('phases', 'context_phase_id'),
                ]:
                    if session.get(db_key):
                        context_distribution[context_key][session[db_key]] = \
                            context_distribution[context_key].get(session[db_key], 0) + 1
            
            analytics.active_users = len(unique_users)
            analytics.usage_by_personality = personality_counts
            analytics.context_distribution = context_distribution
            
            # Get top agents with stats
            top_agent_ids = sorted(
                agent_sessions.keys(),
                key=lambda x: agent_sessions[x],
                reverse=True
            )[:top_agents_limit]
            
            for agent_id in top_agent_ids:
                agent_stats = await self.get_agent_stats(agent_id, tenant_id, days)
                analytics.top_agents.append(agent_stats)
            
            # Get level distribution
            analytics.usage_by_level = await self._get_level_distribution(
                list(agent_sessions.keys())
            )
            
            logger.info(
                "get_tenant_analytics_completed",
                tenant_id=tenant_id,
                total_sessions=analytics.total_sessions,
                active_users=analytics.active_users,
            )
            
            return analytics
            
        except Exception as e:
            logger.error("get_tenant_analytics_failed", tenant_id=tenant_id, error=str(e))
            return analytics
    
    async def get_cost_breakdown(
        self,
        tenant_id: str,
        days: int = 30,
        group_by: str = 'agent',  # 'agent', 'level', 'personality', 'day'
    ) -> Dict[str, Any]:
        """
        Get cost breakdown for a tenant.
        
        Args:
            tenant_id: Tenant UUID
            days: Lookback period
            group_by: Grouping dimension
            
        Returns:
            Cost breakdown by specified dimension
        """
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        try:
            result = self.supabase.table('agent_sessions').select(
                'agent_id, total_cost_usd, total_input_tokens, total_output_tokens, '
                'personality_type_id, started_at'
            ).eq('tenant_id', tenant_id).gte(
                'started_at', cutoff.isoformat()
            ).execute()
            
            sessions = result.data or []
            
            breakdown = {}
            total_cost = 0.0
            
            for session in sessions:
                cost = session.get('total_cost_usd', 0) or 0
                total_cost += cost
                
                if group_by == 'agent':
                    key = session.get('agent_id', 'unknown')
                elif group_by == 'personality':
                    key = session.get('personality_type_id', 'default')
                elif group_by == 'day':
                    if session.get('started_at'):
                        key = session['started_at'][:10]  # YYYY-MM-DD
                    else:
                        key = 'unknown'
                else:
                    key = 'unknown'
                
                if key not in breakdown:
                    breakdown[key] = {
                        'cost_usd': 0.0,
                        'input_tokens': 0,
                        'output_tokens': 0,
                        'session_count': 0,
                    }
                
                breakdown[key]['cost_usd'] += cost
                breakdown[key]['input_tokens'] += (session.get('total_input_tokens', 0) or 0)
                breakdown[key]['output_tokens'] += (session.get('total_output_tokens', 0) or 0)
                breakdown[key]['session_count'] += 1
            
            return {
                'total_cost_usd': total_cost,
                'period_days': days,
                'group_by': group_by,
                'breakdown': breakdown,
            }
            
        except Exception as e:
            logger.error("get_cost_breakdown_failed", tenant_id=tenant_id, error=str(e))
            return {'error': str(e)}
    
    async def get_performance_trends(
        self,
        tenant_id: str,
        days: int = 30,
        interval: str = 'day',  # 'day', 'week'
    ) -> List[Dict[str, Any]]:
        """
        Get performance trends over time.
        
        Args:
            tenant_id: Tenant UUID
            days: Lookback period
            interval: Aggregation interval
            
        Returns:
            List of data points with metrics per interval
        """
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        try:
            result = self.supabase.table('agent_sessions').select(
                'started_at, avg_response_time_ms, satisfaction_score, query_count'
            ).eq('tenant_id', tenant_id).gte(
                'started_at', cutoff.isoformat()
            ).order('started_at').execute()
            
            sessions = result.data or []
            
            # Group by interval
            trends = {}
            for session in sessions:
                if not session.get('started_at'):
                    continue
                
                date_str = session['started_at'][:10]  # YYYY-MM-DD
                
                if interval == 'week':
                    # Get week number
                    date = datetime.fromisoformat(date_str)
                    week_start = date - timedelta(days=date.weekday())
                    date_str = week_start.strftime('%Y-%m-%d')
                
                if date_str not in trends:
                    trends[date_str] = {
                        'date': date_str,
                        'session_count': 0,
                        'query_count': 0,
                        'total_response_time': 0,
                        'response_time_samples': 0,
                        'total_satisfaction': 0,
                        'satisfaction_samples': 0,
                    }
                
                trends[date_str]['session_count'] += 1
                trends[date_str]['query_count'] += (session.get('query_count', 0) or 0)
                
                if session.get('avg_response_time_ms'):
                    trends[date_str]['total_response_time'] += session['avg_response_time_ms']
                    trends[date_str]['response_time_samples'] += 1
                
                if session.get('satisfaction_score'):
                    trends[date_str]['total_satisfaction'] += session['satisfaction_score']
                    trends[date_str]['satisfaction_samples'] += 1
            
            # Calculate averages
            result_trends = []
            for date_str in sorted(trends.keys()):
                data = trends[date_str]
                
                avg_response_time = None
                if data['response_time_samples'] > 0:
                    avg_response_time = data['total_response_time'] / data['response_time_samples']
                
                avg_satisfaction = None
                if data['satisfaction_samples'] > 0:
                    avg_satisfaction = data['total_satisfaction'] / data['satisfaction_samples']
                
                result_trends.append({
                    'date': date_str,
                    'session_count': data['session_count'],
                    'query_count': data['query_count'],
                    'avg_response_time_ms': avg_response_time,
                    'avg_satisfaction_score': avg_satisfaction,
                })
            
            return result_trends
            
        except Exception as e:
            logger.error("get_performance_trends_failed", tenant_id=tenant_id, error=str(e))
            return []
    
    async def _get_level_distribution(
        self, 
        agent_ids: List[str]
    ) -> Dict[str, int]:
        """Get distribution of agent levels."""
        if not agent_ids:
            return {}
        
        try:
            result = self.supabase.table('agents').select(
                'id, agent_levels(level_number, name)'
            ).in_('id', agent_ids).execute()
            
            distribution = {}
            for agent in result.data or []:
                level_info = agent.get('agent_levels', {}) or {}
                level_name = level_info.get('name', f"L{level_info.get('level_number', 2)}")
                distribution[level_name] = distribution.get(level_name, 0) + 1
            
            return distribution
            
        except Exception as e:
            logger.warning("get_level_distribution_failed", error=str(e))
            return {}
    
    def _get_top_contexts(
        self, 
        context_counts: Dict[str, Dict[str, int]], 
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """Get top contexts from counts."""
        top_contexts = []
        
        for context_type, counts in context_counts.items():
            if counts:
                top_id = max(counts.keys(), key=lambda x: counts[x])
                top_contexts.append({
                    'type': context_type,
                    'id': top_id,
                    'count': counts[top_id],
                })
        
        return sorted(top_contexts, key=lambda x: x['count'], reverse=True)[:limit]
    
    async def get_dashboard_summary(
        self,
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Get a quick dashboard summary.
        
        Returns key metrics for at-a-glance viewing.
        """
        try:
            # Get today's stats
            today = datetime.utcnow().date()
            today_start = datetime(today.year, today.month, today.day)
            
            today_result = self.supabase.table('agent_sessions').select(
                'id, total_cost_usd, query_count'
            ).eq('tenant_id', tenant_id).gte(
                'started_at', today_start.isoformat()
            ).execute()
            
            today_sessions = today_result.data or []
            
            # Get 30-day analytics
            analytics = await self.get_tenant_analytics(tenant_id, days=30, top_agents_limit=5)
            
            return {
                'today': {
                    'sessions': len(today_sessions),
                    'queries': sum(s.get('query_count', 0) or 0 for s in today_sessions),
                    'cost_usd': sum(s.get('total_cost_usd', 0) or 0 for s in today_sessions),
                },
                'last_30_days': {
                    'sessions': analytics.total_sessions,
                    'queries': analytics.total_queries,
                    'cost_usd': analytics.total_cost_usd,
                    'active_users': analytics.active_users,
                },
                'top_agents': [
                    {
                        'id': a.agent_id,
                        'name': a.agent_name,
                        'sessions': a.total_sessions,
                    }
                    for a in analytics.top_agents[:5]
                ],
                'generated_at': datetime.utcnow().isoformat(),
            }
            
        except Exception as e:
            logger.error("get_dashboard_summary_failed", tenant_id=tenant_id, error=str(e))
            return {'error': str(e)}
