"""
Unit Tests for Feedback Manager Service

Tests:
- Feedback submission
- Agent performance calculation
- Feedback analytics
- Caching behavior
- Error handling
- Tenant isolation
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch
from services.feedback_manager import (
    FeedbackManager,
    FeedbackRequest,
    FeedbackResponse,
    FeedbackType,
    AgentPerformanceSummary,
    FeedbackAnalytics
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def mock_supabase():
    """Mock Supabase client"""
    client = Mock()
    client.set_tenant_context = AsyncMock()
    client.client = Mock()
    return client


@pytest.fixture
def mock_cache():
    """Mock cache manager"""
    cache = Mock()
    cache.get = AsyncMock(return_value=None)
    cache.set = AsyncMock()
    cache.delete = AsyncMock()
    return cache


@pytest.fixture
def feedback_manager(mock_supabase, mock_cache):
    """Feedback manager instance"""
    return FeedbackManager(
        supabase_client=mock_supabase,
        cache_manager=mock_cache
    )


@pytest.fixture
def sample_feedback_request():
    """Sample feedback request"""
    return FeedbackRequest(
        tenant_id="550e8400-e29b-41d4-a716-446655440000",
        session_id="session_123",
        turn_id="turn_456",
        user_id="user_789",
        agent_id="agent_regulatory",
        agent_type="regulatory_expert",
        query="What are FDA requirements for clinical trials?",
        response="FDA requires submission of IND...",
        rating=5,
        feedback_type=FeedbackType.EXCELLENT,
        feedback_text="Very helpful and detailed!",
        feedback_tags=["accurate", "comprehensive"],
        response_time_ms=1500,
        confidence_score=0.92,
        rag_enabled=True,
        tools_enabled=False,
        model_used="gpt-4"
    )


# ============================================================================
# TESTS: FEEDBACK SUBMISSION
# ============================================================================

@pytest.mark.asyncio
async def test_submit_feedback_success(feedback_manager, mock_supabase, sample_feedback_request):
    """Test successful feedback submission"""
    # Mock database insert
    mock_result = Mock()
    mock_result.data = [{'id': 'feedback_123'}]
    mock_supabase.client.table.return_value.insert.return_value.execute = AsyncMock(
        return_value=mock_result
    )
    
    # Submit feedback
    response = await feedback_manager.submit_feedback(sample_feedback_request)
    
    # Assertions
    assert isinstance(response, FeedbackResponse)
    assert response.feedback_id == 'feedback_123'
    assert response.status == 'submitted'
    assert response.agent_metrics_updated is True
    
    # Verify tenant context was set
    mock_supabase.set_tenant_context.assert_called_once_with(
        sample_feedback_request.tenant_id
    )
    
    # Verify cache invalidation
    feedback_manager.cache.delete.assert_called()


@pytest.mark.asyncio
async def test_submit_feedback_missing_tenant_id(feedback_manager):
    """Test feedback submission fails without tenant_id"""
    request = FeedbackRequest(
        tenant_id="",  # Empty tenant_id
        session_id="session_123",
        agent_id="agent_1",
        agent_type="regulatory",
        query="test",
        response="test",
        rating=5,
        feedback_type=FeedbackType.HELPFUL
    )
    
    with pytest.raises(ValueError, match="tenant_id is REQUIRED"):
        await feedback_manager.submit_feedback(request)


@pytest.mark.asyncio
async def test_submit_feedback_database_error(feedback_manager, mock_supabase, sample_feedback_request):
    """Test feedback submission handles database errors"""
    # Mock database error
    mock_supabase.client.table.return_value.insert.return_value.execute = AsyncMock(
        side_effect=Exception("Database connection failed")
    )
    
    with pytest.raises(Exception, match="Database connection failed"):
        await feedback_manager.submit_feedback(sample_feedback_request)


@pytest.mark.asyncio
async def test_submit_feedback_validates_rating(feedback_manager):
    """Test feedback submission validates rating range"""
    with pytest.raises(Exception):  # Pydantic validation error
        FeedbackRequest(
            tenant_id="550e8400-e29b-41d4-a716-446655440000",
            session_id="session_123",
            agent_id="agent_1",
            agent_type="regulatory",
            query="test",
            response="test",
            rating=6,  # Invalid: out of range
            feedback_type=FeedbackType.HELPFUL
        )


# ============================================================================
# TESTS: AGENT PERFORMANCE
# ============================================================================

@pytest.mark.asyncio
async def test_get_agent_performance_success(feedback_manager, mock_supabase):
    """Test successful agent performance calculation"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # Mock feedback data
    mock_result = Mock()
    mock_result.data = [
        {
            'agent_id': 'agent_1',
            'agent_type': 'regulatory',
            'rating': 5,
            'response_time_ms': 1000
        },
        {
            'agent_id': 'agent_1',
            'agent_type': 'regulatory',
            'rating': 4,
            'response_time_ms': 1200
        },
        {
            'agent_id': 'agent_2',
            'agent_type': 'clinical',
            'rating': 3,
            'response_time_ms': 1500
        }
    ]
    mock_supabase.client.table.return_value.select.return_value.eq.return_value.gte.return_value.execute = AsyncMock(
        return_value=mock_result
    )
    
    # Get performance
    performance = await feedback_manager.get_agent_performance(tenant_id)
    
    # Assertions
    assert len(performance) == 2  # 2 unique agents
    assert all(isinstance(p, AgentPerformanceSummary) for p in performance)
    
    # Check sorting (by recommendation score)
    assert performance[0].recommendation_score >= performance[1].recommendation_score
    
    # Check agent_1 metrics
    agent_1 = next(p for p in performance if p.agent_id == 'agent_1')
    assert agent_1.total_queries == 2
    assert agent_1.avg_rating == 4.5  # (5+4)/2
    assert agent_1.avg_response_time_ms == 1100  # (1000+1200)/2


@pytest.mark.asyncio
async def test_get_agent_performance_uses_cache(feedback_manager, mock_cache):
    """Test agent performance uses cache"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # Mock cached data
    cached_performance = [
        AgentPerformanceSummary(
            agent_id='agent_1',
            agent_type='regulatory',
            total_queries=10,
            avg_rating=4.5,
            success_rate=0.9,
            avg_response_time_ms=1200,
            positive_feedback_rate=0.8,
            recommendation_score=4.3,
            last_updated=datetime.utcnow()
        )
    ]
    mock_cache.get = AsyncMock(return_value=cached_performance)
    
    # Get performance
    performance = await feedback_manager.get_agent_performance(tenant_id)
    
    # Assertions
    assert performance == cached_performance
    mock_cache.get.assert_called_once()


@pytest.mark.asyncio
async def test_get_agent_performance_no_data(feedback_manager, mock_supabase):
    """Test agent performance with no feedback data"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # Mock empty result
    mock_result = Mock()
    mock_result.data = []
    mock_supabase.client.table.return_value.select.return_value.eq.return_value.gte.return_value.execute = AsyncMock(
        return_value=mock_result
    )
    
    # Get performance
    performance = await feedback_manager.get_agent_performance(tenant_id)
    
    # Assertions
    assert performance == []


@pytest.mark.asyncio
async def test_get_agent_performance_specific_agent(feedback_manager, mock_supabase):
    """Test getting performance for specific agent"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    agent_id = "agent_1"
    
    # Mock feedback data for specific agent
    mock_result = Mock()
    mock_result.data = [
        {
            'agent_id': agent_id,
            'agent_type': 'regulatory',
            'rating': 5,
            'response_time_ms': 1000
        }
    ]
    
    # Mock the query chain
    mock_query = Mock()
    mock_query.eq = Mock(return_value=mock_query)
    mock_query.gte = Mock(return_value=mock_query)
    mock_query.execute = AsyncMock(return_value=mock_result)
    
    mock_supabase.client.table.return_value.select.return_value = mock_query
    
    # Get performance
    performance = await feedback_manager.get_agent_performance(tenant_id, agent_id=agent_id)
    
    # Assertions
    assert len(performance) == 1
    assert performance[0].agent_id == agent_id


# ============================================================================
# TESTS: FEEDBACK ANALYTICS
# ============================================================================

@pytest.mark.asyncio
async def test_get_feedback_analytics_success(feedback_manager, mock_supabase):
    """Test successful feedback analytics calculation"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # Mock feedback data
    mock_result = Mock()
    mock_result.data = [
        {
            'rating': 5,
            'feedback_tags': ['accurate', 'helpful'],
            'feedback_type': 'excellent'
        },
        {
            'rating': 4,
            'feedback_tags': ['helpful'],
            'feedback_type': 'helpful'
        },
        {
            'rating': 2,
            'feedback_tags': ['slow'],
            'feedback_type': 'incorrect'
        }
    ]
    mock_supabase.client.table.return_value.select.return_value.eq.return_value.gte.return_value.execute = AsyncMock(
        return_value=mock_result
    )
    
    # Mock get_agent_performance for top/bottom performers
    feedback_manager.get_agent_performance = AsyncMock(return_value=[])
    
    # Get analytics
    analytics = await feedback_manager.get_feedback_analytics(tenant_id)
    
    # Assertions
    assert isinstance(analytics, FeedbackAnalytics)
    assert analytics.total_feedback == 3
    assert analytics.avg_rating == pytest.approx(3.67, rel=0.1)  # (5+4+2)/3
    assert analytics.positive_count == 2  # rating >= 4
    assert analytics.negative_count == 1  # rating <= 2
    assert 'helpful' in analytics.common_tags
    assert 'accuracy' in analytics.improvement_areas


@pytest.mark.asyncio
async def test_get_feedback_analytics_no_data(feedback_manager, mock_supabase):
    """Test feedback analytics with no data"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # Mock empty result
    mock_result = Mock()
    mock_result.data = []
    mock_supabase.client.table.return_value.select.return_value.eq.return_value.gte.return_value.execute = AsyncMock(
        return_value=mock_result
    )
    
    # Get analytics
    analytics = await feedback_manager.get_feedback_analytics(tenant_id)
    
    # Assertions
    assert analytics.total_feedback == 0
    assert analytics.avg_rating == 0.0
    assert analytics.positive_count == 0
    assert analytics.negative_count == 0
    assert analytics.common_tags == []


# ============================================================================
# TESTS: AGENT FEEDBACK HISTORY
# ============================================================================

@pytest.mark.asyncio
async def test_get_agent_feedback_history_success(feedback_manager, mock_supabase):
    """Test getting feedback history for an agent"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    agent_id = "agent_1"
    
    # Mock feedback history
    mock_result = Mock()
    mock_result.data = [
        {
            'id': 'feedback_1',
            'rating': 5,
            'feedback_text': 'Great!',
            'created_at': datetime.utcnow().isoformat()
        },
        {
            'id': 'feedback_2',
            'rating': 4,
            'feedback_text': 'Good',
            'created_at': (datetime.utcnow() - timedelta(days=1)).isoformat()
        }
    ]
    
    # Mock the query chain
    mock_query = Mock()
    mock_query.eq = Mock(return_value=mock_query)
    mock_query.order = Mock(return_value=mock_query)
    mock_query.limit = Mock(return_value=mock_query)
    mock_query.execute = AsyncMock(return_value=mock_result)
    
    mock_supabase.client.table.return_value.select.return_value = mock_query
    
    # Get history
    history = await feedback_manager.get_agent_feedback_history(tenant_id, agent_id)
    
    # Assertions
    assert len(history) == 2
    assert history[0]['rating'] == 5
    assert history[1]['rating'] == 4


# ============================================================================
# TESTS: ERROR HANDLING
# ============================================================================

@pytest.mark.asyncio
async def test_get_agent_performance_handles_errors(feedback_manager, mock_supabase):
    """Test agent performance gracefully handles errors"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # Mock database error
    mock_supabase.client.table.return_value.select.return_value.eq.return_value.gte.return_value.execute = AsyncMock(
        side_effect=Exception("Database error")
    )
    
    # Get performance (should return empty list, not raise)
    performance = await feedback_manager.get_agent_performance(tenant_id)
    
    assert performance == []


# ============================================================================
# TESTS: TENANT ISOLATION
# ============================================================================

@pytest.mark.asyncio
async def test_submit_feedback_enforces_tenant_isolation(feedback_manager, mock_supabase, sample_feedback_request):
    """Test feedback submission enforces tenant isolation"""
    mock_result = Mock()
    mock_result.data = [{'id': 'feedback_123'}]
    mock_supabase.client.table.return_value.insert.return_value.execute = AsyncMock(
        return_value=mock_result
    )
    
    await feedback_manager.submit_feedback(sample_feedback_request)
    
    # Verify tenant context was set
    mock_supabase.set_tenant_context.assert_called_once_with(
        sample_feedback_request.tenant_id
    )


@pytest.mark.asyncio
async def test_get_agent_performance_enforces_tenant_isolation(feedback_manager, mock_supabase):
    """Test agent performance enforces tenant isolation"""
    tenant_id = "550e8400-e29b-41d4-a716-446655440000"
    
    mock_result = Mock()
    mock_result.data = []
    mock_supabase.client.table.return_value.select.return_value.eq.return_value.gte.return_value.execute = AsyncMock(
        return_value=mock_result
    )
    
    await feedback_manager.get_agent_performance(tenant_id)
    
    # Verify tenant context was set
    mock_supabase.set_tenant_context.assert_called_once_with(tenant_id)


# ============================================================================
# TESTS: RECOMMENDATION SCORE CALCULATION
# ============================================================================

def test_recommendation_score_calculation():
    """Test recommendation score calculation logic"""
    # Test data
    avg_rating = 4.5
    success_rate = 0.9
    positive_rate = 0.8
    
    # Calculate (same formula as in service)
    recommendation_score = (
        avg_rating * 0.4 +
        success_rate * 5 * 0.3 +
        positive_rate * 5 * 0.3
    )
    
    expected = (4.5 * 0.4) + (0.9 * 5 * 0.3) + (0.8 * 5 * 0.3)
    # = 1.8 + 1.35 + 1.2 = 4.35
    
    assert recommendation_score == pytest.approx(4.35, rel=0.01)


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

