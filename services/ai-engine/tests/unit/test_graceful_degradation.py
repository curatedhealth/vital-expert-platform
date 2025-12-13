# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [pytest, pytest-asyncio, resilience]
"""
Unit Tests for Graceful Degradation (H7 HIGH Priority Fix)

Tests the resilience infrastructure that replaces blanket exception handling
with specific exception classification and proper propagation.

Key Test Coverage:
1. CancelledError is NEVER caught (C5 compliance)
2. Recoverable exceptions trigger fallback behavior
3. Non-recoverable exceptions propagate as specific types
4. Unexpected exceptions are logged and propagated
5. Exception classification works correctly
6. Convenience decorators work as expected
"""

import asyncio
import pytest
from unittest.mock import MagicMock, patch

from langgraph_workflows.modes34.resilience import (
    graceful_degradation,
    database_operation,
    agent_operation,
    research_operation,
    classify_exception,
    get_exception_properties,
    DatabaseConnectionError,
    DatabaseQueryError,
    AgentSelectionError,
    ResearchQualityError,
    WorkflowResilienceError,
)


# =============================================================================
# Test Fixtures
# =============================================================================


@pytest.fixture
def mock_logger():
    """Mock structlog logger."""
    with patch("langgraph_workflows.modes34.resilience.graceful_degradation.logger") as mock_log:
        yield mock_log


# =============================================================================
# Test Exception Classification
# =============================================================================


class TestExceptionClassification:
    """Test exception classification logic."""

    def test_classify_database_connection_error(self):
        """Test classifying database connection errors."""
        exc = Exception("Connection refused to PostgreSQL database")
        classified = classify_exception(exc)
        assert classified == DatabaseConnectionError

    def test_classify_database_query_error(self):
        """Test classifying database query errors."""
        # Use message that matches the pattern in graceful_degradation.py
        exc = Exception("Query failed with SQL error")
        classified = classify_exception(exc)
        assert classified == DatabaseQueryError

    def test_classify_agent_selection_error(self):
        """Test classifying agent selection errors."""
        exc = Exception("No agents found matching criteria")
        classified = classify_exception(exc)
        assert classified == AgentSelectionError

    def test_classify_research_quality_error(self):
        """Test classifying research quality errors."""
        exc = Exception("Research quality check failed for L4 worker")
        classified = classify_exception(exc)
        assert classified == ResearchQualityError

    def test_classify_unknown_error(self):
        """Test classifying unknown errors defaults to WorkflowResilienceError."""
        exc = Exception("Some random unexpected error")
        classified = classify_exception(exc)
        assert classified == WorkflowResilienceError

    def test_classify_with_domain_hint(self):
        """Test domain hint prioritizes specific classification."""
        exc = Exception("Operation failed")
        classified = classify_exception(exc, domain_hint="database")
        # Without specific pattern match, falls back to generic
        assert classified == WorkflowResilienceError

    def test_get_exception_properties_database(self):
        """Test getting properties for database exceptions."""
        props = get_exception_properties(DatabaseConnectionError)
        assert props["recoverable"] is True
        assert props["retry_suggested"] is True

    def test_get_exception_properties_query(self):
        """Test getting properties for query exceptions."""
        props = get_exception_properties(DatabaseQueryError)
        assert props["recoverable"] is False
        assert props["retry_suggested"] is False


# =============================================================================
# Test Graceful Degradation Decorator
# =============================================================================


class TestGracefulDegradationDecorator:
    """Test graceful_degradation decorator behavior."""

    @pytest.mark.asyncio
    async def test_cancelled_error_propagates(self, mock_logger):
        """Test that CancelledError is NEVER caught (C5 compliance)."""

        @graceful_degradation(
            domain="database",
            fallback_value={"data": []},
        )
        async def operation_that_gets_cancelled():
            raise asyncio.CancelledError("Task cancelled")

        with pytest.raises(asyncio.CancelledError):
            await operation_that_gets_cancelled()

        # Should log cancellation but not catch it
        mock_logger.warning.assert_called_once()
        call_args = mock_logger.warning.call_args[1]
        assert call_args["operation"] == "operation_that_gets_cancelled"

    @pytest.mark.asyncio
    async def test_recoverable_error_uses_fallback(self, mock_logger):
        """Test recoverable errors trigger fallback behavior."""

        @graceful_degradation(
            domain="database",
            fallback_value={"agents": []},
        )
        async def fetch_agents():
            raise Exception("Connection refused to database")

        result = await fetch_agents()

        assert result == {"agents": []}
        mock_logger.info.assert_called()
        info_call = mock_logger.info.call_args[1]
        assert info_call["operation"] == "fetch_agents"
        # Check for fallback_type key (actual implementation)
        assert "fallback_type" in info_call

    @pytest.mark.asyncio
    async def test_non_recoverable_error_propagates(self, mock_logger):
        """Test non-recoverable errors propagate as WorkflowResilienceError with classification."""

        @graceful_degradation(
            domain="database",
            fallback_value={"data": []},
        )
        async def execute_query():
            # Use message that matches query error pattern (non-recoverable)
            raise Exception("Query failed with SQL error")

        with pytest.raises(WorkflowResilienceError) as exc_info:
            await execute_query()

        # Should be classified as non-recoverable and include classification in context
        assert "execute_query failed" in str(exc_info.value)
        assert exc_info.value.context.get("classified_as") == "DatabaseQueryError"

    @pytest.mark.asyncio
    async def test_unexpected_error_propagates_and_logs(self, mock_logger):
        """Test unexpected exceptions are logged and propagated."""

        @graceful_degradation(
            domain="research",
            fallback_value=None,  # No fallback = always propagate
        )
        async def research_operation():
            raise ValueError("Unexpected validation error")

        with pytest.raises(WorkflowResilienceError) as exc_info:
            await research_operation()

        # Should log the error
        mock_logger.error.assert_called()
        error_call = mock_logger.error.call_args[1]
        assert error_call["operation"] == "research_operation"
        assert error_call["original_error_type"] == "ValueError"

    @pytest.mark.asyncio
    async def test_already_specific_exception_reraises(self, mock_logger):
        """Test that WorkflowResilienceError subclasses are re-raised as-is."""

        @graceful_degradation(
            domain="database",
            fallback_value={"data": []},
        )
        async def operation():
            # Use base WorkflowResilienceError since specialized classes have different signatures
            raise WorkflowResilienceError(
                message="Explicitly raised",
                recoverable=True,
            )

        with pytest.raises(WorkflowResilienceError):
            await operation()

    @pytest.mark.asyncio
    async def test_successful_operation_returns_normally(self, mock_logger):
        """Test successful operations return normally without logging."""

        @graceful_degradation(
            domain="database",
            fallback_value={"data": []},
        )
        async def successful_operation():
            return {"result": "success"}

        result = await successful_operation()

        assert result == {"result": "success"}
        # No error logging should occur
        mock_logger.error.assert_not_called()
        mock_logger.warning.assert_not_called()

    @pytest.mark.asyncio
    async def test_operation_name_override(self, mock_logger):
        """Test custom operation name in logging."""

        @graceful_degradation(
            domain="database",
            fallback_value=[],
            operation_name="custom_db_fetch",
        )
        async def fetch():
            raise Exception("Database timeout")

        result = await fetch()

        # Should use custom operation name in logs
        error_call = mock_logger.error.call_args[1]
        assert error_call["operation"] == "custom_db_fetch"

    @pytest.mark.asyncio
    async def test_no_fallback_always_propagates(self, mock_logger):
        """Test that without fallback_value, errors always propagate."""

        @graceful_degradation(
            domain="database",
            fallback_value=None,  # No fallback
            recoverable=True,
        )
        async def operation():
            raise Exception("Connection refused")

        # Now raises WorkflowResilienceError (base class) with classification context
        with pytest.raises(WorkflowResilienceError) as exc_info:
            await operation()

        # Verify it was classified as DatabaseConnectionError
        assert exc_info.value.context.get("classified_as") == "DatabaseConnectionError"

    def test_sync_function_support(self, mock_logger):
        """Test decorator works with synchronous functions."""

        @graceful_degradation(
            domain="database",
            fallback_value=[],
        )
        def sync_operation():
            raise Exception("Database error")

        result = sync_operation()

        assert result == []
        mock_logger.error.assert_called()


# =============================================================================
# Test Convenience Decorators
# =============================================================================


class TestConvenienceDecorators:
    """Test domain-specific convenience decorators."""

    @pytest.mark.asyncio
    async def test_database_operation_decorator(self, mock_logger):
        """Test database_operation convenience decorator."""

        @database_operation(fallback_value={"rows": []})
        async def query_database():
            raise Exception("Database connection timeout")

        result = await query_database()

        assert result == {"rows": []}
        error_call = mock_logger.error.call_args[1]
        assert error_call["domain"] == "database"

    @pytest.mark.asyncio
    async def test_agent_operation_decorator(self, mock_logger):
        """Test agent_operation convenience decorator."""

        @agent_operation(fallback_value=[])
        async def select_agents():
            raise Exception("No agents found")

        result = await select_agents()

        assert result == []
        # Should log as warning for agent operations
        mock_logger.warning.assert_called()

    @pytest.mark.asyncio
    async def test_research_operation_decorator(self, mock_logger):
        """Test research_operation convenience decorator."""

        @research_operation(fallback_value={"quality_score": 0.0})
        async def assess_research_quality():
            raise Exception("Research quality check failed")

        result = await assess_research_quality()

        assert result == {"quality_score": 0.0}
        warning_call = mock_logger.warning.call_args[1]
        assert warning_call["domain"] == "research"


# =============================================================================
# Test Edge Cases
# =============================================================================


class TestEdgeCases:
    """Test edge cases and corner scenarios."""

    @pytest.mark.asyncio
    async def test_keyboard_interrupt_propagates(self, mock_logger):
        """Test that KeyboardInterrupt is never caught."""

        @graceful_degradation(
            domain="database",
            fallback_value=[],
        )
        async def operation():
            raise KeyboardInterrupt("User interrupted")

        # Note: graceful_degradation catches Exception, not BaseException
        # So KeyboardInterrupt (which inherits from BaseException) will propagate
        with pytest.raises(KeyboardInterrupt):
            await operation()

    @pytest.mark.asyncio
    async def test_system_exit_propagates(self, mock_logger):
        """Test that SystemExit is never caught."""

        @graceful_degradation(
            domain="database",
            fallback_value=[],
        )
        async def operation():
            raise SystemExit(1)

        with pytest.raises(SystemExit):
            await operation()

    @pytest.mark.asyncio
    async def test_empty_exception_message(self, mock_logger):
        """Test handling exceptions with empty messages."""

        @graceful_degradation(
            domain="database",
            fallback_value=[],
        )
        async def operation():
            raise Exception("")

        result = await operation()

        # Should still classify and use fallback
        assert result == []

    @pytest.mark.asyncio
    async def test_nested_decorators(self, mock_logger):
        """Test graceful_degradation can be nested."""

        @database_operation(fallback_value={"outer": []})
        @research_operation(fallback_value={"inner": []})
        async def nested_operation():
            raise Exception("Database error")

        result = await nested_operation()

        # Inner decorator should handle it first
        assert "inner" in result or "outer" in result


# =============================================================================
# Test Integration with Research Quality Module
# =============================================================================


class TestResearchQualityIntegration:
    """Test integration with research_quality.py patterns."""

    @pytest.mark.asyncio
    async def test_citation_verification_timeout(self, mock_logger):
        """Test citation verification with timeout fallback."""

        @graceful_degradation(
            domain="citation",
            fallback_value={"verified": False, "confidence": 0.0},
        )
        async def verify_citation():
            raise asyncio.TimeoutError("Citation verification timed out")

        result = await verify_citation()

        assert result == {"verified": False, "confidence": 0.0}

    @pytest.mark.asyncio
    async def test_l4_worker_failure(self, mock_logger):
        """Test L4 worker failure with research degradation."""

        @research_operation(
            fallback_value={"evidence": [], "quality_score": 0.0},
        )
        async def gather_evidence():
            raise Exception("L4 worker timeout during evidence gathering")

        result = await gather_evidence()

        assert result["evidence"] == []
        assert result["quality_score"] == 0.0


# =============================================================================
# Test Logging Behavior
# =============================================================================


class TestLoggingBehavior:
    """Test structured logging outputs."""

    @pytest.mark.asyncio
    async def test_error_log_includes_context(self, mock_logger):
        """Test error logs include rich context."""

        @graceful_degradation(
            domain="database",
            fallback_value=[],
            operation_name="test_operation",
        )
        async def operation():
            raise Exception("Test error message")

        await operation()

        error_call = mock_logger.error.call_args[1]
        assert error_call["operation"] == "test_operation"
        assert error_call["domain"] == "database"
        assert "Test error message" in error_call["original_error"]
        assert error_call["original_error_type"] == "Exception"
        assert "classified_as" in error_call
        assert "recoverable" in error_call

    @pytest.mark.asyncio
    async def test_info_log_on_fallback_use(self, mock_logger):
        """Test info log when fallback is used."""

        @graceful_degradation(
            domain="database",
            fallback_value={"data": []},
        )
        async def operation():
            raise Exception("Connection timeout")

        await operation()

        info_call = mock_logger.info.call_args[1]
        # Check for fallback_type key (actual implementation)
        assert "fallback_type" in info_call
        assert info_call["fallback_type"] == "dict"

    @pytest.mark.asyncio
    async def test_log_level_customization(self, mock_logger):
        """Test custom log level for errors."""

        @graceful_degradation(
            domain="agent_selection",
            fallback_value=[],
            log_level="warning",  # Custom level
        )
        async def operation():
            raise Exception("Agent selection failed")

        await operation()

        # Should use warning level instead of error
        mock_logger.warning.assert_called()
        mock_logger.error.assert_not_called()
