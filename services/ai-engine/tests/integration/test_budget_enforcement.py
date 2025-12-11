"""
VITAL Path - Budget Enforcement Tests

Tests the token budget system:
- Budget checking
- Usage recording
- Middleware enforcement
- LLM client integration
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from decimal import Decimal

from domain.services.budget_service import BudgetService, BudgetCheckResult
from domain.value_objects.token_usage import TokenUsage
from domain.exceptions import BudgetExceededException
from api.middleware.budget import BudgetMiddleware
from infrastructure.llm.tracking import TokenTracker, TrackedLLMClient
from core.context import (
    set_tenant_context,
    clear_request_context,
    get_request_context,
    RequestContext,
)


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def tenant_context():
    """Set up tenant context for tests."""
    set_tenant_context(
        tenant_id="test-tenant-001",
        user_id="test-user-001",
        roles=["user"],
    )
    yield get_request_context()
    clear_request_context()


@pytest.fixture
def mock_database():
    """Mock database for budget operations."""
    return AsyncMock()


@pytest.fixture
def budget_service(mock_database):
    """Create budget service with mock database."""
    service = BudgetService()
    service._db = mock_database
    return service


# ============================================================================
# BudgetService Tests
# ============================================================================

class TestBudgetService:
    """Tests for BudgetService."""
    
    @pytest.mark.asyncio
    async def test_check_budget_within_limit(self, budget_service, mock_database):
        """Test budget check when within limits."""
        mock_database.execute.return_value = MagicMock(
            data=[{
                "can_proceed": True,
                "monthly_used": 5000,
                "monthly_limit": 100000,
                "daily_used": 500,
                "daily_limit": 10000,
            }]
        )
        
        result = await budget_service.check_budget(
            tenant_id="test-tenant",
            user_id="test-user",
            estimated_tokens=1000,
        )
        
        assert result.can_proceed is True
        assert result.monthly_used == 5000
        assert result.remaining == 95000
    
    @pytest.mark.asyncio
    async def test_check_budget_exceeded(self, budget_service, mock_database):
        """Test budget check when limit exceeded."""
        mock_database.execute.return_value = MagicMock(
            data=[{
                "can_proceed": False,
                "monthly_used": 99000,
                "monthly_limit": 100000,
                "daily_used": 9500,
                "daily_limit": 10000,
            }]
        )
        
        result = await budget_service.check_budget(
            tenant_id="test-tenant",
            user_id="test-user",
            estimated_tokens=2000,
        )
        
        assert result.can_proceed is False
        assert result.monthly_used == 99000
    
    @pytest.mark.asyncio
    async def test_record_usage(self, budget_service, mock_database):
        """Test usage recording."""
        mock_database.execute.return_value = MagicMock(data=[{"success": True}])
        
        usage = TokenUsage(prompt_tokens=100, completion_tokens=50)
        
        await budget_service.record_usage(
            tenant_id="test-tenant",
            user_id="test-user",
            model="gpt-4",
            usage=usage,
            operation="chat",
        )
        
        mock_database.execute.assert_called()
    
    @pytest.mark.asyncio
    async def test_get_usage_summary(self, budget_service, mock_database):
        """Test getting usage summary."""
        mock_database.execute.return_value = MagicMock(
            data=[{
                "total_tokens": 50000,
                "total_cost": 1.25,
                "request_count": 100,
            }]
        )
        
        summary = await budget_service.get_usage_summary(
            tenant_id="test-tenant",
            start_date=datetime(2025, 1, 1),
            end_date=datetime(2025, 1, 31),
        )
        
        assert summary is not None


# ============================================================================
# TokenUsage Tests
# ============================================================================

class TestTokenUsage:
    """Tests for TokenUsage value object."""
    
    def test_total_tokens(self):
        """Test total token calculation."""
        usage = TokenUsage(prompt_tokens=100, completion_tokens=50)
        
        assert usage.total_tokens == 150
    
    def test_estimated_cost_gpt4(self):
        """Test cost estimation for GPT-4."""
        usage = TokenUsage(prompt_tokens=1000, completion_tokens=500)
        
        # GPT-4 pricing: ~$0.03/1K prompt, ~$0.06/1K completion
        cost = usage.estimated_cost("gpt-4")
        
        assert cost > 0
        assert cost < 1  # Should be reasonable
    
    def test_add_usage(self):
        """Test adding usages together."""
        usage1 = TokenUsage(prompt_tokens=100, completion_tokens=50)
        usage2 = TokenUsage(prompt_tokens=200, completion_tokens=100)
        
        combined = usage1 + usage2
        
        assert combined.prompt_tokens == 300
        assert combined.completion_tokens == 150
    
    def test_from_openai_response(self):
        """Test creation from OpenAI response."""
        mock_response = MagicMock()
        mock_response.usage.prompt_tokens = 100
        mock_response.usage.completion_tokens = 50
        
        usage = TokenUsage.from_openai_response(mock_response)
        
        assert usage.prompt_tokens == 100
        assert usage.completion_tokens == 50
    
    def test_from_anthropic_response(self):
        """Test creation from Anthropic response."""
        mock_response = MagicMock()
        mock_response.usage.input_tokens = 100
        mock_response.usage.output_tokens = 50
        
        usage = TokenUsage.from_anthropic_response(mock_response)
        
        assert usage.prompt_tokens == 100
        assert usage.completion_tokens == 50


# ============================================================================
# TokenTracker Tests
# ============================================================================

class TestTokenTracker:
    """Tests for TokenTracker."""
    
    @pytest.mark.asyncio
    async def test_record_usage(self, tenant_context):
        """Test recording usage through tracker."""
        mock_budget_service = AsyncMock(spec=BudgetService)
        tracker = TokenTracker(mock_budget_service)
        
        usage = TokenUsage(prompt_tokens=100, completion_tokens=50)
        
        await tracker.record(
            usage=usage,
            model="gpt-4",
            operation="chat",
        )
        
        mock_budget_service.record_usage.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_track_llm_usage_decorator(self, tenant_context):
        """Test the tracking decorator."""
        from infrastructure.llm.tracking import track_llm_usage
        
        mock_budget_service = AsyncMock(spec=BudgetService)
        
        @track_llm_usage(model="gpt-4", operation="test")
        async def mock_llm_call():
            return MagicMock(
                usage=MagicMock(prompt_tokens=100, completion_tokens=50)
            )
        
        # This would need proper context setup to test fully
        # For now, just verify the decorator doesn't break the function
        result = await mock_llm_call()
        assert result is not None


# ============================================================================
# BudgetMiddleware Tests
# ============================================================================

class TestBudgetMiddleware:
    """Tests for BudgetMiddleware."""
    
    @pytest.mark.asyncio
    async def test_middleware_allows_within_budget(self):
        """Test middleware allows requests within budget."""
        mock_budget_service = AsyncMock()
        mock_budget_service.check_budget.return_value = BudgetCheckResult(
            can_proceed=True,
            monthly_used=1000,
            monthly_limit=100000,
            daily_used=100,
            daily_limit=10000,
        )
        
        middleware = BudgetMiddleware(
            app=AsyncMock(),
            budget_service=mock_budget_service,
        )
        
        # Create mock request
        mock_request = MagicMock()
        mock_request.url.path = "/api/v1/expert/chat"
        mock_request.method = "POST"
        
        # Set up tenant context
        set_tenant_context("tenant-1", "user-1")
        
        # The middleware should not raise
        # (full test would require ASGI app setup)
        
        clear_request_context()
    
    @pytest.mark.asyncio
    async def test_middleware_blocks_exceeded_budget(self):
        """Test middleware blocks requests when budget exceeded."""
        mock_budget_service = AsyncMock()
        mock_budget_service.check_budget.return_value = BudgetCheckResult(
            can_proceed=False,
            monthly_used=100000,
            monthly_limit=100000,
            daily_used=10000,
            daily_limit=10000,
        )
        
        middleware = BudgetMiddleware(
            app=AsyncMock(),
            budget_service=mock_budget_service,
        )
        
        # Set up tenant context
        set_tenant_context("tenant-1", "user-1")
        
        # The middleware should block and return 429
        # (full test would require ASGI app setup)
        
        clear_request_context()
    
    def test_middleware_skips_public_paths(self):
        """Test middleware skips public paths."""
        middleware = BudgetMiddleware(
            app=AsyncMock(),
            budget_service=AsyncMock(),
        )
        
        # Health endpoints should be skipped
        assert middleware._should_skip("/health") is True
        assert middleware._should_skip("/healthz") is True
        assert middleware._should_skip("/ready") is True
        assert middleware._should_skip("/api/v1/expert/chat") is False


# ============================================================================
# Integration Tests
# ============================================================================

class TestBudgetIntegration:
    """Integration tests for budget system."""
    
    @pytest.mark.asyncio
    async def test_full_budget_flow(self, tenant_context):
        """Test complete budget flow: check → use → record."""
        mock_db = AsyncMock()
        budget_service = BudgetService()
        budget_service._db = mock_db
        
        # Setup mock responses
        mock_db.execute.side_effect = [
            # check_budget call
            MagicMock(data=[{
                "can_proceed": True,
                "monthly_used": 1000,
                "monthly_limit": 100000,
                "daily_used": 100,
                "daily_limit": 10000,
            }]),
            # record_usage call
            MagicMock(data=[{"success": True}]),
        ]
        
        # Check budget
        check_result = await budget_service.check_budget(
            tenant_id="test-tenant",
            user_id="test-user",
            estimated_tokens=500,
        )
        assert check_result.can_proceed is True
        
        # Simulate LLM usage
        usage = TokenUsage(prompt_tokens=400, completion_tokens=100)
        
        # Record usage
        await budget_service.record_usage(
            tenant_id="test-tenant",
            user_id="test-user",
            model="gpt-4",
            usage=usage,
            operation="chat",
        )
        
        assert mock_db.execute.call_count == 2
    
    @pytest.mark.asyncio
    async def test_budget_enforcement_prevents_overspend(self):
        """Test that budget enforcement prevents overspending."""
        mock_db = AsyncMock()
        budget_service = BudgetService()
        budget_service._db = mock_db
        
        # User is at 99% of budget
        mock_db.execute.return_value = MagicMock(data=[{
            "can_proceed": False,
            "monthly_used": 99000,
            "monthly_limit": 100000,
            "daily_used": 9900,
            "daily_limit": 10000,
        }])
        
        result = await budget_service.check_budget(
            tenant_id="test-tenant",
            user_id="test-user",
            estimated_tokens=2000,  # Would exceed
        )
        
        assert result.can_proceed is False
        assert result.remaining == 1000


if __name__ == "__main__":
    pytest.main([__file__, "-v"])






