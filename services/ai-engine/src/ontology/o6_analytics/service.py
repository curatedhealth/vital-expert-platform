"""
L6 Analytics Service

Service for managing session analytics, agent performance metrics,
quality scoring, and usage tracking.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from ..base import OntologyLayerService
from .models import (
    SessionAnalytics,
    AgentPerformance,
    QualityMetrics,
    UsageStats,
    AnalyticsContext,
)


class L6AnalyticsService(OntologyLayerService[SessionAnalytics]):
    """
    Service for L6 Analytics layer.

    Provides operations for:
    - Session analytics tracking
    - Agent performance monitoring
    - Quality metrics collection
    - Usage statistics aggregation
    """

    @property
    def layer_name(self) -> str:
        return "l6_analytics"

    @property
    def primary_table(self) -> str:
        return "session_analytics"

    def _to_model(self, data: Dict[str, Any]) -> SessionAnalytics:
        return SessionAnalytics(**data)

    # -------------------------------------------------------------------------
    # Session Analytics
    # -------------------------------------------------------------------------

    async def start_session(
        self,
        user_id: str,
        session_id: str
    ) -> Optional[SessionAnalytics]:
        """Start tracking a new session."""
        try:
            session_data = {
                "tenant_id": self.tenant_id,
                "user_id": user_id,
                "session_id": session_id,
                "started_at": datetime.utcnow().isoformat(),
                "query_count": 0,
                "mission_count": 0,
                "artifact_count": 0,
                "total_tokens": 0,
                "total_cost": 0.0,
            }

            result = await self.supabase.table(self.primary_table)\
                .insert(session_data)\
                .execute()

            if result.data:
                return self._to_model(result.data[0])
        except Exception as e:
            print(f"Error starting session: {e}")
        return None

    async def end_session(
        self,
        session_id: str
    ) -> bool:
        """End a session and calculate duration."""
        try:
            # Get session
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("session_id", session_id)\
                .eq("tenant_id", self.tenant_id)\
                .maybe_single()\
                .execute()

            if not result.data:
                return False

            session = self._to_model(result.data)
            ended_at = datetime.utcnow()
            duration = (ended_at - session.started_at).total_seconds() if session.started_at else 0

            await self.supabase.table(self.primary_table)\
                .update({
                    "ended_at": ended_at.isoformat(),
                    "duration_seconds": duration
                })\
                .eq("session_id", session_id)\
                .eq("tenant_id", self.tenant_id)\
                .execute()

            return True
        except Exception as e:
            print(f"Error ending session: {e}")
            return False

    async def update_session_metrics(
        self,
        session_id: str,
        query_count: Optional[int] = None,
        mission_count: Optional[int] = None,
        artifact_count: Optional[int] = None,
        tokens: Optional[int] = None,
        cost: Optional[float] = None,
        agent_id: Optional[str] = None
    ) -> bool:
        """Update session metrics incrementally."""
        try:
            # Get current session
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("session_id", session_id)\
                .eq("tenant_id", self.tenant_id)\
                .maybe_single()\
                .execute()

            if not result.data:
                return False

            session = self._to_model(result.data)
            update_data = {}

            if query_count is not None:
                update_data["query_count"] = session.query_count + query_count
            if mission_count is not None:
                update_data["mission_count"] = session.mission_count + mission_count
            if artifact_count is not None:
                update_data["artifact_count"] = session.artifact_count + artifact_count
            if tokens is not None:
                update_data["total_tokens"] = session.total_tokens + tokens
            if cost is not None:
                update_data["total_cost"] = session.total_cost + cost
            if agent_id and agent_id not in session.agent_ids_used:
                update_data["agent_ids_used"] = session.agent_ids_used + [agent_id]
                if not session.primary_agent_id:
                    update_data["primary_agent_id"] = agent_id

            if update_data:
                await self.supabase.table(self.primary_table)\
                    .update(update_data)\
                    .eq("session_id", session_id)\
                    .eq("tenant_id", self.tenant_id)\
                    .execute()

            return True
        except Exception as e:
            print(f"Error updating session metrics: {e}")
            return False

    async def get_user_sessions(
        self,
        user_id: str,
        days: int = 30,
        limit: int = 50
    ) -> List[SessionAnalytics]:
        """Get sessions for a user."""
        try:
            since = (datetime.utcnow() - timedelta(days=days)).isoformat()

            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("user_id", user_id)\
                .gte("started_at", since)\
                .order("started_at", desc=True)\
                .limit(limit)\
                .execute()

            return [self._to_model(row) for row in result.data]
        except Exception as e:
            print(f"Error fetching user sessions: {e}")
            return []

    # -------------------------------------------------------------------------
    # Agent Performance
    # -------------------------------------------------------------------------

    async def record_agent_invocation(
        self,
        agent_id: str,
        response_time_ms: int,
        success: bool,
        quality_score: Optional[float] = None,
        tokens_used: int = 0,
        cost: float = 0.0
    ) -> bool:
        """Record an agent invocation for performance tracking."""
        try:
            # Get or create today's performance record
            today = datetime.utcnow().date()
            period_start = datetime.combine(today, datetime.min.time())
            period_end = datetime.combine(today, datetime.max.time())

            result = await self.supabase.table("agent_performance")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("agent_id", agent_id)\
                .eq("period", "daily")\
                .gte("period_start", period_start.isoformat())\
                .maybe_single()\
                .execute()

            if result.data:
                # Update existing record
                perf = AgentPerformance(**result.data)
                new_count = perf.invocation_count + 1
                new_avg_time = ((perf.avg_response_time_ms * perf.invocation_count) + response_time_ms) / new_count
                new_success_rate = ((perf.success_rate * perf.invocation_count) + (1 if success else 0)) / new_count

                update_data = {
                    "invocation_count": new_count,
                    "avg_response_time_ms": new_avg_time,
                    "success_rate": new_success_rate,
                    "error_rate": 1 - new_success_rate,
                    "total_tokens": perf.total_tokens + tokens_used,
                    "total_cost": perf.total_cost + cost,
                    "avg_cost_per_query": (perf.total_cost + cost) / new_count
                }

                if quality_score is not None:
                    if perf.avg_quality_score:
                        update_data["avg_quality_score"] = ((perf.avg_quality_score * perf.invocation_count) + quality_score) / new_count
                    else:
                        update_data["avg_quality_score"] = quality_score

                await self.supabase.table("agent_performance")\
                    .update(update_data)\
                    .eq("id", perf.id)\
                    .execute()
            else:
                # Create new record
                new_record = {
                    "tenant_id": self.tenant_id,
                    "agent_id": agent_id,
                    "period": "daily",
                    "period_start": period_start.isoformat(),
                    "period_end": period_end.isoformat(),
                    "invocation_count": 1,
                    "unique_users": 1,
                    "unique_sessions": 1,
                    "avg_response_time_ms": response_time_ms,
                    "success_rate": 1.0 if success else 0.0,
                    "error_rate": 0.0 if success else 1.0,
                    "avg_quality_score": quality_score,
                    "total_tokens": tokens_used,
                    "total_cost": cost,
                    "avg_cost_per_query": cost
                }

                await self.supabase.table("agent_performance")\
                    .insert(new_record)\
                    .execute()

            return True
        except Exception as e:
            print(f"Error recording agent invocation: {e}")
            return False

    async def get_agent_performance(
        self,
        agent_id: str,
        period: str = "daily",
        days: int = 30
    ) -> List[AgentPerformance]:
        """Get performance metrics for an agent."""
        try:
            since = (datetime.utcnow() - timedelta(days=days)).isoformat()

            result = await self.supabase.table("agent_performance")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("agent_id", agent_id)\
                .eq("period", period)\
                .gte("period_start", since)\
                .order("period_start", desc=True)\
                .execute()

            return [AgentPerformance(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching agent performance: {e}")
            return []

    async def get_top_agents(
        self,
        metric: str = "invocation_count",
        period: str = "daily",
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get top performing agents by a metric."""
        try:
            today = datetime.utcnow().date()
            period_start = datetime.combine(today, datetime.min.time())

            result = await self.supabase.table("agent_performance")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("period", period)\
                .gte("period_start", period_start.isoformat())\
                .order(metric, desc=True)\
                .limit(limit)\
                .execute()

            return [
                {
                    "agent_id": row["agent_id"],
                    metric: row.get(metric, 0),
                    "success_rate": row.get("success_rate", 0),
                    "avg_response_time_ms": row.get("avg_response_time_ms", 0)
                }
                for row in result.data
            ]
        except Exception as e:
            print(f"Error fetching top agents: {e}")
            return []

    # -------------------------------------------------------------------------
    # Quality Metrics
    # -------------------------------------------------------------------------

    async def record_quality_metrics(
        self,
        mission_id: str,
        relevance_score: float,
        accuracy_score: float,
        completeness_score: float,
        clarity_score: float,
        citation_count: int = 0,
        evidence_level: Optional[str] = None,
        safety_score: float = 1.0,
        hallucination_risk: float = 0.0,
        agent_id: Optional[str] = None
    ) -> Optional[QualityMetrics]:
        """Record quality metrics for a mission response."""
        try:
            overall_quality = (
                relevance_score * 0.3 +
                accuracy_score * 0.3 +
                completeness_score * 0.2 +
                clarity_score * 0.2
            )

            metrics_data = {
                "tenant_id": self.tenant_id,
                "mission_id": mission_id,
                "agent_id": agent_id,
                "relevance_score": relevance_score,
                "accuracy_score": accuracy_score,
                "completeness_score": completeness_score,
                "clarity_score": clarity_score,
                "citation_count": citation_count,
                "evidence_level": evidence_level,
                "safety_score": safety_score,
                "hallucination_risk": hallucination_risk,
                "overall_quality": overall_quality,
                "created_at": datetime.utcnow().isoformat()
            }

            result = await self.supabase.table("quality_metrics")\
                .insert(metrics_data)\
                .execute()

            if result.data:
                return QualityMetrics(**result.data[0])
        except Exception as e:
            print(f"Error recording quality metrics: {e}")
        return None

    async def get_quality_metrics(
        self,
        mission_id: str
    ) -> Optional[QualityMetrics]:
        """Get quality metrics for a mission."""
        try:
            result = await self.supabase.table("quality_metrics")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("mission_id", mission_id)\
                .maybe_single()\
                .execute()

            if result.data:
                return QualityMetrics(**result.data)
        except Exception as e:
            print(f"Error fetching quality metrics: {e}")
        return None

    # -------------------------------------------------------------------------
    # Usage Statistics
    # -------------------------------------------------------------------------

    async def get_usage_stats(
        self,
        period: str = "daily",
        days: int = 30
    ) -> List[UsageStats]:
        """Get aggregated usage statistics."""
        try:
            since = (datetime.utcnow() - timedelta(days=days)).isoformat()

            result = await self.supabase.table("usage_stats")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("period", period)\
                .gte("period_start", since)\
                .order("period_start", desc=True)\
                .execute()

            return [UsageStats(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching usage stats: {e}")
            return []

    async def calculate_usage_summary(
        self,
        days: int = 30
    ) -> Dict[str, Any]:
        """Calculate usage summary for the tenant."""
        try:
            since = (datetime.utcnow() - timedelta(days=days)).isoformat()

            # Get sessions
            sessions_result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .gte("started_at", since)\
                .execute()

            sessions = [self._to_model(row) for row in sessions_result.data]

            # Aggregate
            total_queries = sum(s.query_count for s in sessions)
            total_missions = sum(s.mission_count for s in sessions)
            total_tokens = sum(s.total_tokens for s in sessions)
            total_cost = sum(s.total_cost for s in sessions)
            unique_users = len(set(s.user_id for s in sessions))

            # Get quality averages
            quality_result = await self.supabase.table("quality_metrics")\
                .select("overall_quality")\
                .eq("tenant_id", self.tenant_id)\
                .gte("created_at", since)\
                .execute()

            avg_quality = 0.0
            if quality_result.data:
                quality_scores = [r["overall_quality"] for r in quality_result.data if r["overall_quality"]]
                if quality_scores:
                    avg_quality = sum(quality_scores) / len(quality_scores)

            return {
                "period_days": days,
                "total_sessions": len(sessions),
                "total_queries": total_queries,
                "total_missions": total_missions,
                "unique_users": unique_users,
                "total_tokens": total_tokens,
                "total_cost": total_cost,
                "avg_quality": avg_quality,
                "avg_queries_per_session": total_queries / len(sessions) if sessions else 0,
                "avg_cost_per_session": total_cost / len(sessions) if sessions else 0
            }
        except Exception as e:
            print(f"Error calculating usage summary: {e}")
            return {}

    # -------------------------------------------------------------------------
    # Context Resolution
    # -------------------------------------------------------------------------

    async def resolve_analytics(
        self,
        user_id: str,
        query: Optional[str] = None
    ) -> AnalyticsContext:
        """
        Resolve analytics context for a user.

        Args:
            user_id: User ID
            query: Optional query for similarity matching

        Returns:
            AnalyticsContext with user history and patterns
        """
        context = AnalyticsContext()

        # Get recent sessions
        context.recent_sessions = await self.get_user_sessions(user_id, days=30, limit=10)

        # Get current/most recent session
        if context.recent_sessions:
            context.user_history = context.recent_sessions[0]

        # Extract patterns
        if context.recent_sessions:
            # Preferred agents
            agent_counts: Dict[str, int] = {}
            for session in context.recent_sessions:
                for agent_id in session.agent_ids_used:
                    agent_counts[agent_id] = agent_counts.get(agent_id, 0) + 1

            context.preferred_agents = sorted(
                agent_counts.keys(),
                key=lambda x: agent_counts[x],
                reverse=True
            )[:5]

            # Historical satisfaction
            satisfactions = [
                s.avg_user_satisfaction
                for s in context.recent_sessions
                if s.avg_user_satisfaction is not None
            ]
            if satisfactions:
                context.historical_satisfaction = sum(satisfactions) / len(satisfactions)

            # Quality expectations based on history
            qualities = [
                s.avg_response_quality
                for s in context.recent_sessions
                if s.avg_response_quality is not None
            ]
            if qualities:
                context.expected_quality = sum(qualities) / len(qualities)

        # Calculate confidence
        confidence = 0.0
        if context.user_history:
            confidence += 0.3
        if context.recent_sessions:
            confidence += 0.3
        if context.preferred_agents:
            confidence += 0.2
        if context.historical_satisfaction > 0:
            confidence += 0.2
        context.confidence_score = confidence

        return context
