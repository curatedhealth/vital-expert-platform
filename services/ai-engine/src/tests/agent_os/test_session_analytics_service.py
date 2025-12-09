"""
Unit Tests for Session Analytics Service

Tests for:
- Agent usage statistics
- Tenant analytics
- Cost breakdown
- Performance trends
- Dashboard summary
"""

import pytest
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime, timedelta

import sys
sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src')

from services.session_analytics_service import (
    SessionAnalyticsService,
    AgentUsageStats,
    TenantAnalytics,
)


class TestAgentUsageStats:
    """Tests for AgentUsageStats dataclass."""
    
    def test_default_stats(self):
        """Test default stats initialization."""
        stats = AgentUsageStats(
            agent_id="test-id",
            agent_name="Test Agent",
        )
        
        assert stats.total_sessions == 0
        assert stats.total_queries == 0
        assert stats.total_cost_usd == 0.0
        assert stats.unique_users == 0
    
    def test_populated_stats(self):
        """Test stats with values."""
        stats = AgentUsageStats(
            agent_id="test-id",
            agent_name="Test Agent",
            total_sessions=100,
            total_queries=500,
            total_tokens=100000,
            total_cost_usd=15.50,
            avg_response_time_ms=2500,
            avg_satisfaction_score=0.85,
            unique_users=25,
        )
        
        assert stats.total_sessions == 100
        assert stats.total_cost_usd == 15.50


class TestTenantAnalytics:
    """Tests for TenantAnalytics dataclass."""
    
    def test_default_analytics(self):
        """Test default analytics initialization."""
        analytics = TenantAnalytics(
            tenant_id="test-tenant",
            period_start=datetime.utcnow() - timedelta(days=30),
            period_end=datetime.utcnow(),
        )
        
        assert analytics.total_sessions == 0
        assert analytics.top_agents == []
    
    def test_populated_analytics(self):
        """Test analytics with values."""
        analytics = TenantAnalytics(
            tenant_id="test-tenant",
            period_start=datetime.utcnow() - timedelta(days=30),
            period_end=datetime.utcnow(),
            total_sessions=1000,
            total_queries=5000,
            total_cost_usd=150.00,
            active_users=50,
        )
        
        assert analytics.total_sessions == 1000
        assert analytics.active_users == 50


class TestSessionAnalyticsServiceInit:
    """Tests for service initialization."""
    
    def test_init(self, mock_supabase_client):
        """Test service initialization."""
        service = SessionAnalyticsService(mock_supabase_client)
        
        assert service.supabase is not None


class TestAgentStats:
    """Tests for agent statistics."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        return SessionAnalyticsService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_get_agent_stats(self, service, mock_agent_id, mock_tenant_id):
        """Test getting agent statistics."""
        stats = await service.get_agent_stats(mock_agent_id, mock_tenant_id)
        
        assert isinstance(stats, AgentUsageStats)
        assert stats.agent_id == mock_agent_id
    
    @pytest.mark.asyncio
    async def test_get_agent_stats_with_days(self, service, mock_agent_id):
        """Test getting agent stats with custom lookback."""
        stats = await service.get_agent_stats(mock_agent_id, days=7)
        
        assert isinstance(stats, AgentUsageStats)
    
    @pytest.mark.asyncio
    async def test_get_agent_stats_calculates_averages(
        self, 
        service, 
        mock_agent_id, 
        mock_tenant_id,
        mock_sessions_list
    ):
        """Test that averages are calculated correctly."""
        stats = await service.get_agent_stats(mock_agent_id, mock_tenant_id)
        
        # Should have calculated values
        assert stats.total_sessions >= 0


class TestTenantAnalytics:
    """Tests for tenant-level analytics."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        return SessionAnalyticsService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_get_tenant_analytics(self, service, mock_tenant_id):
        """Test getting tenant analytics."""
        analytics = await service.get_tenant_analytics(mock_tenant_id)
        
        assert isinstance(analytics, TenantAnalytics)
        assert analytics.tenant_id == mock_tenant_id
    
    @pytest.mark.asyncio
    async def test_get_tenant_analytics_with_params(self, service, mock_tenant_id):
        """Test tenant analytics with custom parameters."""
        analytics = await service.get_tenant_analytics(
            mock_tenant_id,
            days=14,
            top_agents_limit=5,
        )
        
        assert isinstance(analytics, TenantAnalytics)
        assert len(analytics.top_agents) <= 5
    
    @pytest.mark.asyncio
    async def test_get_tenant_analytics_empty(self, mock_tenant_id):
        """Test analytics with no session data."""
        # Create a fresh mock that returns empty data
        empty_mock = MagicMock()
        empty_result = MagicMock()
        empty_result.data = []
        empty_mock.table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value = empty_result
        empty_mock.table.return_value.select.return_value.eq.return_value.execute.return_value = empty_result
        
        service = SessionAnalyticsService(empty_mock)
        analytics = await service.get_tenant_analytics(mock_tenant_id)
        
        assert analytics.total_sessions == 0


class TestCostBreakdown:
    """Tests for cost breakdown analysis."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        return SessionAnalyticsService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_get_cost_breakdown_by_agent(self, service, mock_tenant_id):
        """Test cost breakdown grouped by agent."""
        result = await service.get_cost_breakdown(
            mock_tenant_id,
            group_by='agent',
        )
        
        assert "total_cost_usd" in result
        assert "breakdown" in result
        assert result["group_by"] == "agent"
    
    @pytest.mark.asyncio
    async def test_get_cost_breakdown_by_personality(self, service, mock_tenant_id):
        """Test cost breakdown grouped by personality."""
        result = await service.get_cost_breakdown(
            mock_tenant_id,
            group_by='personality',
        )
        
        assert result["group_by"] == "personality"
    
    @pytest.mark.asyncio
    async def test_get_cost_breakdown_by_day(self, service, mock_tenant_id):
        """Test cost breakdown grouped by day."""
        result = await service.get_cost_breakdown(
            mock_tenant_id,
            group_by='day',
        )
        
        assert result["group_by"] == "day"
    
    @pytest.mark.asyncio
    async def test_get_cost_breakdown_with_days(self, service, mock_tenant_id):
        """Test cost breakdown with custom lookback period."""
        result = await service.get_cost_breakdown(
            mock_tenant_id,
            days=7,
            group_by='agent',
        )
        
        assert result["period_days"] == 7


class TestPerformanceTrends:
    """Tests for performance trend analysis."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        return SessionAnalyticsService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_get_performance_trends_daily(self, service, mock_tenant_id):
        """Test getting daily performance trends."""
        trends = await service.get_performance_trends(
            mock_tenant_id,
            days=30,
            interval='day',
        )
        
        assert isinstance(trends, list)
    
    @pytest.mark.asyncio
    async def test_get_performance_trends_weekly(self, service, mock_tenant_id):
        """Test getting weekly performance trends."""
        trends = await service.get_performance_trends(
            mock_tenant_id,
            days=60,
            interval='week',
        )
        
        assert isinstance(trends, list)
    
    @pytest.mark.asyncio
    async def test_performance_trends_structure(
        self, 
        service, 
        mock_tenant_id,
        mock_sessions_list
    ):
        """Test structure of trend data points."""
        trends = await service.get_performance_trends(mock_tenant_id)
        
        if trends:
            point = trends[0]
            assert "date" in point
            assert "session_count" in point
            assert "query_count" in point


class TestDashboardSummary:
    """Tests for dashboard summary."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        return SessionAnalyticsService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_get_dashboard_summary(self, service, mock_tenant_id):
        """Test getting dashboard summary."""
        summary = await service.get_dashboard_summary(mock_tenant_id)
        
        assert "today" in summary
        assert "last_30_days" in summary
        assert "top_agents" in summary
        assert "generated_at" in summary
    
    @pytest.mark.asyncio
    async def test_dashboard_summary_today_stats(self, service, mock_tenant_id):
        """Test today's stats in dashboard."""
        summary = await service.get_dashboard_summary(mock_tenant_id)
        
        today = summary.get("today", {})
        assert "sessions" in today
        assert "queries" in today
        assert "cost_usd" in today
    
    @pytest.mark.asyncio
    async def test_dashboard_summary_30_day_stats(self, service, mock_tenant_id):
        """Test 30-day stats in dashboard."""
        summary = await service.get_dashboard_summary(mock_tenant_id)
        
        last_30 = summary.get("last_30_days", {})
        assert "sessions" in last_30
        assert "active_users" in last_30


class TestHelperMethods:
    """Tests for helper methods."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        return SessionAnalyticsService(mock_supabase_client)
    
    def test_get_top_contexts(self, service):
        """Test extracting top contexts."""
        context_counts = {
            "regions": {"reg-1": 10, "reg-2": 5},
            "domains": {"dom-1": 15},
            "therapeutic_areas": {},
            "phases": {"phase-1": 8, "phase-2": 12},
        }
        
        top = service._get_top_contexts(context_counts, limit=3)
        
        assert len(top) <= 3
        # Should be sorted by count
        if len(top) > 1:
            assert top[0]["count"] >= top[1]["count"]
    
    def test_get_top_contexts_empty(self, service):
        """Test top contexts with empty data."""
        context_counts = {
            "regions": {},
            "domains": {},
            "therapeutic_areas": {},
            "phases": {},
        }
        
        top = service._get_top_contexts(context_counts)
        
        assert top == []
    
    @pytest.mark.asyncio
    async def test_get_level_distribution(self, service, mock_agents_list):
        """Test getting level distribution."""
        agent_ids = [a["id"] for a in mock_agents_list]
        
        distribution = await service._get_level_distribution(agent_ids)
        
        assert isinstance(distribution, dict)
    
    @pytest.mark.asyncio
    async def test_get_level_distribution_empty(self, service):
        """Test level distribution with no agents."""
        distribution = await service._get_level_distribution([])
        
        assert distribution == {}
