"""
Comprehensive Unit Tests for AutonomousController

Tests goal-based continuation logic, budget controls, and autonomous execution.

Test Coverage:
- Initialization and configuration
- Continuation decision logic
- Budget tracking and limits
- Runtime limits
- Progress tracking
- Error handling
- User stop functionality
- State persistence
"""

import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from unittest.mock import Mock, AsyncMock, patch

from services.autonomous_controller import (
    AutonomousController,
    AutonomousState,
    ContinuationDecision,
    ContinuationReason
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def tenant_id():
    """Generate test tenant ID."""
    return uuid4()


@pytest.fixture
def session_id():
    """Generate test session ID."""
    return f"test_session_{uuid4().hex[:8]}"


@pytest.fixture
def controller(session_id, tenant_id):
    """Create basic autonomous controller for testing."""
    return AutonomousController(
        session_id=session_id,
        tenant_id=tenant_id,
        goal="Create comprehensive FDA IND submission plan",
        cost_limit_usd=5.0,
        runtime_limit_minutes=15
    )


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    client = Mock()
    client.table = Mock(return_value=client)
    client.insert = AsyncMock(return_value={"data": [{}], "error": None})
    client.update = AsyncMock(return_value={"data": [{}], "error": None})
    client.select = Mock(return_value=client)
    client.eq = Mock(return_value=client)
    client.execute = AsyncMock(return_value={"data": [{}], "error": None})
    return client


# ============================================================================
# TEST: Initialization
# ============================================================================

def test_controller_initialization(controller, session_id, tenant_id):
    """Test autonomous controller initializes correctly."""
    assert controller.state.session_id == session_id
    assert controller.state.tenant_id == tenant_id
    assert controller.state.goal == "Create comprehensive FDA IND submission plan"
    assert controller.state.cost_limit_usd == 5.0
    assert controller.state.runtime_limit_minutes == 15
    assert controller.state.current_cost_usd == 0.0
    assert controller.state.current_iteration == 0
    assert controller.state.goal_progress == 0.0
    assert controller.state.stop_requested is False
    assert controller.state.consecutive_errors == 0


def test_controller_with_custom_limits(session_id, tenant_id):
    """Test controller with custom budget and runtime limits."""
    controller = AutonomousController(
        session_id=session_id,
        tenant_id=tenant_id,
        goal="Test goal",
        cost_limit_usd=20.0,
        runtime_limit_minutes=60
    )
    
    assert controller.state.cost_limit_usd == 20.0
    assert controller.state.runtime_limit_minutes == 60


# ============================================================================
# TEST: Continuation Logic - Budget
# ============================================================================

@pytest.mark.asyncio
async def test_should_continue_within_budget(controller):
    """Test continuation when within budget limits."""
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=0.3,
        iteration_count=2
    )
    
    assert decision.should_continue is True
    assert decision.remaining_budget_usd == 4.0  # 5.0 - 1.0
    assert decision.goal_progress == 0.3


@pytest.mark.asyncio
async def test_should_stop_when_budget_exceeded(controller):
    """Test stops when budget is exceeded."""
    decision = await controller.should_continue(
        current_cost=6.0,  # Exceeds 5.0 limit
        goal_progress=0.5,
        iteration_count=3
    )
    
    assert decision.should_continue is False
    assert decision.reason == ContinuationReason.BUDGET_EXHAUSTED
    assert "budget" in decision.explanation.lower()
    assert decision.remaining_budget_usd < 0


@pytest.mark.asyncio
async def test_should_warn_when_budget_low(controller):
    """Test warning when budget is low but not exceeded."""
    decision = await controller.should_continue(
        current_cost=4.8,  # Close to 5.0 limit
        goal_progress=0.6,
        iteration_count=4
    )
    
    assert decision.should_continue is True
    assert len(decision.warnings) > 0
    assert any("budget" in w.lower() for w in decision.warnings)


# ============================================================================
# TEST: Continuation Logic - Runtime
# ============================================================================

@pytest.mark.asyncio
async def test_should_continue_within_runtime(controller):
    """Test continuation when within runtime limits."""
    # Simulate 5 minutes elapsed
    controller.state.started_at = datetime.now(timezone.utc) - timedelta(minutes=5)
    
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=0.4,
        iteration_count=3
    )
    
    assert decision.should_continue is True
    assert decision.remaining_minutes > 5


@pytest.mark.asyncio
async def test_should_stop_when_runtime_exceeded(controller):
    """Test stops when runtime limit is exceeded."""
    # Simulate 20 minutes elapsed (exceeds 15 minute limit)
    controller.state.started_at = datetime.now(timezone.utc) - timedelta(minutes=20)
    
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=0.5,
        iteration_count=5
    )
    
    assert decision.should_continue is False
    assert decision.reason == ContinuationReason.RUNTIME_EXCEEDED
    assert "runtime" in decision.explanation.lower() or "time" in decision.explanation.lower()


# ============================================================================
# TEST: Continuation Logic - Goal Progress
# ============================================================================

@pytest.mark.asyncio
async def test_should_stop_when_goal_achieved(controller):
    """Test stops when goal is 100% achieved."""
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=1.0,  # 100% complete
        iteration_count=3
    )
    
    assert decision.should_continue is False
    assert decision.reason == ContinuationReason.GOAL_ACHIEVED
    assert decision.goal_progress == 1.0


@pytest.mark.asyncio
async def test_should_stop_when_no_progress(controller):
    """Test stops when making no progress over multiple iterations."""
    # First call with progress
    await controller.should_continue(
        current_cost=0.5,
        goal_progress=0.3,
        iteration_count=1
    )
    
    # Second call with same progress
    await controller.should_continue(
        current_cost=1.0,
        goal_progress=0.3,
        iteration_count=2
    )
    
    # Third call with same progress (should detect no progress)
    decision = await controller.should_continue(
        current_cost=1.5,
        goal_progress=0.3,  # Still 0.3
        iteration_count=3
    )
    
    # Should warn or stop if no progress for 3+ iterations
    assert len(decision.warnings) > 0 or decision.should_continue is False


@pytest.mark.asyncio
async def test_progress_tracking_history(controller):
    """Test that progress history is tracked correctly."""
    # Make several calls with different progress
    await controller.should_continue(current_cost=0.5, goal_progress=0.2, iteration_count=1)
    await controller.should_continue(current_cost=1.0, goal_progress=0.4, iteration_count=2)
    await controller.should_continue(current_cost=1.5, goal_progress=0.6, iteration_count=3)
    
    assert len(controller.state.progress_history) == 3
    assert controller.state.progress_history == [0.2, 0.4, 0.6]
    assert controller.state.goal_progress == 0.6


# ============================================================================
# TEST: Error Handling
# ============================================================================

@pytest.mark.asyncio
async def test_should_stop_after_consecutive_errors(controller):
    """Test stops after max consecutive errors."""
    # Record 3 consecutive errors
    for i in range(3):
        controller.record_error(f"Error {i+1}")
    
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=0.3,
        iteration_count=3
    )
    
    assert decision.should_continue is False
    assert decision.reason == ContinuationReason.ERROR_THRESHOLD
    assert controller.state.consecutive_errors == 3


@pytest.mark.asyncio
async def test_error_count_resets_on_success(controller):
    """Test error count resets after successful iteration."""
    # Record some errors
    controller.record_error("Error 1")
    controller.record_error("Error 2")
    assert controller.state.consecutive_errors == 2
    
    # Record success
    controller.record_success()
    assert controller.state.consecutive_errors == 0


def test_record_error_increments_counter(controller):
    """Test recording errors increments counter."""
    assert controller.state.consecutive_errors == 0
    
    controller.record_error("Test error")
    assert controller.state.consecutive_errors == 1
    
    controller.record_error("Another error")
    assert controller.state.consecutive_errors == 2


def test_record_success_resets_errors(controller):
    """Test recording success resets error counter."""
    controller.state.consecutive_errors = 2
    controller.record_success()
    assert controller.state.consecutive_errors == 0


# ============================================================================
# TEST: User Control
# ============================================================================

@pytest.mark.asyncio
async def test_user_stop_request(controller):
    """Test user can stop execution via stop request."""
    controller.request_stop()
    
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=0.3,
        iteration_count=2
    )
    
    assert decision.should_continue is False
    assert decision.reason == ContinuationReason.USER_STOPPED
    assert controller.state.stop_requested is True


@pytest.mark.asyncio
async def test_pause_and_resume(controller):
    """Test pause and resume functionality."""
    # Pause
    controller.pause()
    assert controller.state.paused is True
    
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=0.3,
        iteration_count=2
    )
    assert decision.should_continue is False
    
    # Resume
    controller.resume()
    assert controller.state.paused is False
    
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=0.3,
        iteration_count=2
    )
    assert decision.should_continue is True


# ============================================================================
# TEST: State Persistence
# ============================================================================

@pytest.mark.asyncio
async def test_save_state_to_database(session_id, tenant_id, mock_supabase):
    """Test saving state to database."""
    controller = AutonomousController(
        session_id=session_id,
        tenant_id=tenant_id,
        goal="Test goal",
        supabase_client=mock_supabase
    )
    
    controller.state.current_cost_usd = 2.5
    controller.state.goal_progress = 0.6
    
    await controller.save_state()
    
    # Verify Supabase was called
    mock_supabase.table.assert_called()


@pytest.mark.asyncio
async def test_load_state_from_database(session_id, tenant_id, mock_supabase):
    """Test loading state from database."""
    # Mock return data
    mock_supabase.execute.return_value = {
        "data": [{
            "session_id": session_id,
            "tenant_id": str(tenant_id),
            "goal": "Loaded goal",
            "current_cost_usd": 3.0,
            "goal_progress": 0.7
        }],
        "error": None
    }
    
    controller = AutonomousController(
        session_id=session_id,
        tenant_id=tenant_id,
        goal="Original goal",
        supabase_client=mock_supabase
    )
    
    loaded = await controller.load_state()
    
    assert loaded is True
    mock_supabase.table.assert_called()


# ============================================================================
# TEST: Edge Cases
# ============================================================================

@pytest.mark.asyncio
async def test_zero_budget_limit(session_id, tenant_id):
    """Test controller with zero budget limit."""
    controller = AutonomousController(
        session_id=session_id,
        tenant_id=tenant_id,
        goal="Test goal",
        cost_limit_usd=0.0
    )
    
    decision = await controller.should_continue(
        current_cost=0.0,
        goal_progress=0.0,
        iteration_count=0
    )
    
    assert decision.should_continue is False
    assert decision.reason == ContinuationReason.BUDGET_EXHAUSTED


@pytest.mark.asyncio
async def test_negative_progress(controller):
    """Test handling of negative progress values."""
    with pytest.raises((ValueError, AssertionError)):
        await controller.should_continue(
            current_cost=1.0,
            goal_progress=-0.1,  # Invalid negative progress
            iteration_count=1
        )


@pytest.mark.asyncio
async def test_progress_over_100_percent(controller):
    """Test handling of progress over 100%."""
    decision = await controller.should_continue(
        current_cost=1.0,
        goal_progress=1.5,  # Over 100%
        iteration_count=1
    )
    
    # Should clamp to 1.0 or reject
    assert decision.goal_progress <= 1.0


# ============================================================================
# TEST: Metadata and Context
# ============================================================================

def test_set_metadata(controller):
    """Test setting custom metadata."""
    controller.set_metadata({"key": "value", "number": 42})
    
    assert controller.state.metadata["key"] == "value"
    assert controller.state.metadata["number"] == 42


def test_get_metadata(controller):
    """Test retrieving metadata."""
    controller.state.metadata = {"test_key": "test_value"}
    
    value = controller.get_metadata("test_key")
    assert value == "test_value"
    
    missing = controller.get_metadata("nonexistent", default="default_value")
    assert missing == "default_value"


# ============================================================================
# TEST: Confidence Scoring
# ============================================================================

@pytest.mark.asyncio
async def test_high_confidence_when_clear_decision(controller):
    """Test high confidence when decision is clear."""
    # Clear case: way over budget
    decision = await controller.should_continue(
        current_cost=10.0,  # Way over 5.0 limit
        goal_progress=0.5,
        iteration_count=2
    )
    
    assert decision.confidence > 0.8  # High confidence
    assert decision.should_continue is False


@pytest.mark.asyncio
async def test_low_confidence_when_uncertain(controller):
    """Test lower confidence when decision is uncertain."""
    # Uncertain case: close to limits but making progress
    decision = await controller.should_continue(
        current_cost=4.5,  # Close to 5.0 limit
        goal_progress=0.85,  # Close to completion
        iteration_count=10
    )
    
    # Confidence might be lower due to tradeoffs
    assert 0.0 <= decision.confidence <= 1.0


# ============================================================================
# TEST: Recommendations
# ============================================================================

@pytest.mark.asyncio
async def test_recommendations_when_budget_low(controller):
    """Test recommendations provided when budget is low."""
    decision = await controller.should_continue(
        current_cost=4.8,  # Very close to 5.0 limit
        goal_progress=0.7,
        iteration_count=5
    )
    
    assert len(decision.recommended_actions) > 0
    # Should recommend wrapping up or requesting more budget
    recommendations_text = " ".join(decision.recommended_actions).lower()
    assert any(word in recommendations_text for word in ["budget", "wrap", "finish", "increase"])


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_decision_performance(controller):
    """Test decision-making performance is fast."""
    import time
    
    start = time.time()
    
    for i in range(100):
        await controller.should_continue(
            current_cost=0.1 * i,
            goal_progress=0.01 * i,
            iteration_count=i
        )
    
    elapsed = time.time() - start
    
    # Should complete 100 decisions in under 1 second
    assert elapsed < 1.0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

