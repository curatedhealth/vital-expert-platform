"""
Tests for AgentUsageTracker
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import pytest
from unittest.mock import Mock, AsyncMock
from uuid import uuid4
from datetime import datetime, timezone, timedelta

from vital_shared_kernel.multi_tenant import TenantId, TenantContext

from services.agent_usage_tracker import AgentUsageTracker, create_usage_tracker


@pytest.fixture
def tenant_id():
    """Test tenant ID"""
    return TenantId.from_string("12345678-1234-1234-1234-123456789012")


@pytest.fixture
def mock_db_client():
    """Mock tenant-aware database client"""
    client = Mock()
    client.insert = AsyncMock()
    client.list_all = AsyncMock()
    return client


@pytest.fixture
def usage_tracker(mock_db_client):
    """Usage tracker instance"""
    return AgentUsageTracker(mock_db_client)


@pytest.fixture
def user_id():
    """Test user ID"""
    return uuid4()


@pytest.fixture
def panel_id():
    """Test panel ID"""
    return uuid4()


class TestAgentUsageTracker:
    """Test suite for AgentUsageTracker"""
    
    @pytest.mark.asyncio
    async def test_track_usage_basic(self, usage_tracker, mock_db_client, user_id, tenant_id):
        """Test basic usage tracking"""
        TenantContext.set(tenant_id)
        
        # Mock insert response
        record_id = str(uuid4())
        mock_db_client.insert.return_value = {"id": record_id}
        
        # Track usage
        result = await usage_tracker.track_usage(
            agent_id="regulatory_expert_001",
            user_id=user_id,
            tokens_used=1500,
            execution_time_ms=2340,
            model="gpt-4-turbo"
        )
        
        # Verify insert called
        mock_db_client.insert.assert_called_once()
        call_args = mock_db_client.insert.call_args
        
        assert call_args[0][0] == "agent_usage"
        data = call_args[0][1]
        
        assert data["agent_id"] == "regulatory_expert_001"
        assert data["user_id"] == str(user_id)
        assert data["tokens_used"] == 1500
        assert data["execution_time_ms"] == 2340
        assert "cost_usd" in data
        assert data["cost_usd"] > 0
        
        assert str(result) == record_id
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_track_usage_with_panel(self, usage_tracker, mock_db_client, user_id, panel_id, tenant_id):
        """Test usage tracking with panel_id"""
        TenantContext.set(tenant_id)
        
        mock_db_client.insert.return_value = {"id": str(uuid4())}
        
        await usage_tracker.track_usage(
            agent_id="clinical_expert_002",
            user_id=user_id,
            tokens_used=2000,
            execution_time_ms=3000,
            panel_id=panel_id
        )
        
        call_args = mock_db_client.insert.call_args[0][1]
        assert call_args["panel_id"] == str(panel_id)
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_track_usage_with_token_breakdown(self, usage_tracker, mock_db_client, user_id, tenant_id):
        """Test usage tracking with input/output token breakdown"""
        TenantContext.set(tenant_id)
        
        mock_db_client.insert.return_value = {"id": str(uuid4())}
        
        await usage_tracker.track_usage(
            agent_id="stats_expert_003",
            user_id=user_id,
            tokens_used=3000,
            execution_time_ms=4000,
            model="gpt-4",
            input_tokens=2000,
            output_tokens=1000
        )
        
        call_args = mock_db_client.insert.call_args[0][1]
        
        # Verify metadata includes token breakdown
        assert call_args["metadata"]["input_tokens"] == 2000
        assert call_args["metadata"]["output_tokens"] == 1000
        assert call_args["metadata"]["model"] == "gpt-4"
        
        TenantContext.clear()
    
    def test_calculate_cost_simple(self, usage_tracker):
        """Test cost calculation with total tokens only"""
        # GPT-4 Turbo: avg of 0.01 input + 0.03 output = 0.02 per 1K
        cost = usage_tracker._calculate_cost(
            total_tokens=1000,
            model="gpt-4-turbo"
        )
        
        # Should be approximately (1000/1000) * 0.02 = 0.02
        assert 0.015 <= cost <= 0.025
    
    def test_calculate_cost_with_breakdown(self, usage_tracker):
        """Test accurate cost calculation with token breakdown"""
        # GPT-4: input=0.03, output=0.06 per 1K
        cost = usage_tracker._calculate_cost(
            total_tokens=3000,
            model="gpt-4",
            input_tokens=2000,
            output_tokens=1000
        )
        
        # (2000/1000)*0.03 + (1000/1000)*0.06 = 0.06 + 0.06 = 0.12
        assert cost == pytest.approx(0.12, rel=0.01)
    
    def test_calculate_cost_claude(self, usage_tracker):
        """Test cost calculation for Claude models"""
        cost = usage_tracker._calculate_cost(
            total_tokens=1000,
            model="claude-3-sonnet",
            input_tokens=700,
            output_tokens=300
        )
        
        # (700/1000)*0.003 + (300/1000)*0.015 = 0.0021 + 0.0045 = 0.0066
        assert cost == pytest.approx(0.0066, rel=0.01)
    
    @pytest.mark.asyncio
    async def test_get_panel_usage_empty(self, usage_tracker, mock_db_client, panel_id, tenant_id):
        """Test getting panel usage with no records"""
        TenantContext.set(tenant_id)
        
        mock_db_client.list_all.return_value = []
        
        result = await usage_tracker.get_panel_usage(panel_id)
        
        assert result["panel_id"] == str(panel_id)
        assert result["total_tokens"] == 0
        assert result["total_cost_usd"] == 0.0
        assert result["agent_count"] == 0
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_get_panel_usage_with_records(self, usage_tracker, mock_db_client, panel_id, tenant_id):
        """Test getting panel usage with multiple records"""
        TenantContext.set(tenant_id)
        
        # Mock multiple usage records
        mock_db_client.list_all.return_value = [
            {
                "agent_id": "expert_1",
                "tokens_used": 1000,
                "cost_usd": 0.02,
                "execution_time_ms": 2000
            },
            {
                "agent_id": "expert_2",
                "tokens_used": 1500,
                "cost_usd": 0.03,
                "execution_time_ms": 2500
            },
            {
                "agent_id": "expert_1",  # Same agent called twice
                "tokens_used": 500,
                "cost_usd": 0.01,
                "execution_time_ms": 1000
            }
        ]
        
        result = await usage_tracker.get_panel_usage(panel_id)
        
        assert result["panel_id"] == str(panel_id)
        assert result["total_tokens"] == 3000
        assert result["total_cost_usd"] == 0.06
        assert result["total_execution_time_ms"] == 5500
        assert result["agent_count"] == 2  # expert_1 and expert_2
        
        # Verify agent aggregation
        agents = {a["agent_id"]: a for a in result["agents"]}
        assert agents["expert_1"]["tokens"] == 1500  # 1000 + 500
        assert agents["expert_1"]["calls"] == 2
        assert agents["expert_2"]["tokens"] == 1500
        assert agents["expert_2"]["calls"] == 1
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_get_tenant_usage(self, usage_tracker, mock_db_client, tenant_id):
        """Test getting tenant usage summary"""
        TenantContext.set(tenant_id)
        
        now = datetime.now(timezone.utc)
        
        # Mock usage records
        mock_db_client.list_all.return_value = [
            {
                "agent_id": "expert_1",
                "panel_id": "panel-1",
                "tokens_used": 1000,
                "cost_usd": 0.02,
                "created_at": now.isoformat()
            },
            {
                "agent_id": "expert_2",
                "panel_id": "panel-1",
                "tokens_used": 1500,
                "cost_usd": 0.03,
                "created_at": now.isoformat()
            },
            {
                "agent_id": "expert_3",
                "panel_id": "panel-2",
                "tokens_used": 2000,
                "cost_usd": 0.04,
                "created_at": now.isoformat()
            }
        ]
        
        result = await usage_tracker.get_tenant_usage()
        
        assert result["total_tokens"] == 4500
        assert result["total_cost_usd"] == 0.09
        assert result["total_panels"] == 2
        assert result["total_calls"] == 3
        assert result["average_cost_per_panel"] == 0.045
        
        TenantContext.clear()
    
    @pytest.mark.asyncio
    async def test_get_agent_stats(self, usage_tracker, mock_db_client, tenant_id):
        """Test getting agent statistics"""
        TenantContext.set(tenant_id)
        
        # Mock agent usage records
        mock_db_client.list_all.return_value = [
            {
                "agent_id": "expert_1",
                "tokens_used": 1000,
                "cost_usd": 0.02,
                "execution_time_ms": 2000
            },
            {
                "agent_id": "expert_1",
                "tokens_used": 1500,
                "cost_usd": 0.03,
                "execution_time_ms": 3000
            },
            {
                "agent_id": "expert_1",
                "tokens_used": 2000,
                "cost_usd": 0.04,
                "execution_time_ms": 4000
            }
        ]
        
        result = await usage_tracker.get_agent_stats("expert_1")
        
        assert result["agent_id"] == "expert_1"
        assert result["total_calls"] == 3
        assert result["total_tokens"] == 4500
        assert result["total_cost_usd"] == 0.09
        assert result["average_tokens_per_call"] == 1500.0
        assert result["average_execution_time_ms"] == 3000.0
        assert result["average_cost_per_call"] == 0.03
        
        TenantContext.clear()


def test_create_usage_tracker():
    """Test factory function"""
    mock_client = Mock()
    tracker = create_usage_tracker(mock_client)
    
    assert isinstance(tracker, AgentUsageTracker)
    assert tracker.db == mock_client

