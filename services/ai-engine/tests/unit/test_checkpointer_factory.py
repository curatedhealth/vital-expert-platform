"""
Unit tests for WorkflowCheckpointerFactory (H6 Enhancement)

Tests the enhanced checkpointer with fallback logging.
"""

import os
from unittest.mock import Mock, patch, MagicMock
import pytest
from langgraph.checkpoint.memory import MemorySaver


@pytest.fixture
def clean_env(monkeypatch):
    """Remove all checkpointer-related env vars"""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_DB_URL", raising=False)
    monkeypatch.delenv("ENVIRONMENT", raising=False)


@pytest.fixture
def mock_logger():
    """Mock structlog logger"""
    with patch("langgraph_workflows.modes34.unified_autonomous_workflow.logger") as mock:
        yield mock


class TestWorkflowCheckpointerFactory:
    """Test suite for WorkflowCheckpointerFactory with H6 enhancements"""

    def test_no_connection_string_logs_correctly(self, clean_env, mock_logger, monkeypatch):
        """Test that missing connection string logs with impact assessment"""
        monkeypatch.setenv("ENVIRONMENT", "development")

        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            WorkflowCheckpointerFactory,
        )

        checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-mission-1")

        # Verify MemorySaver fallback
        assert isinstance(checkpointer, MemorySaver)

        # Verify logging
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args[1]
        assert call_args["mission_id"] == "test-mission-1"
        assert call_args["reason"] == "no_connection_string"
        assert call_args["impact"] == "mission_state_not_persisted"
        assert call_args["recovery"] == "restart_will_lose_progress"
        assert "DATABASE_URL" in call_args["recommendation"]

    def test_postgres_not_available_logs_warning(self, clean_env, mock_logger, monkeypatch):
        """Test that PostgresSaver unavailability logs as warning"""
        monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/test")
        monkeypatch.setenv("ENVIRONMENT", "development")

        # Mock POSTGRES_AVAILABLE as False
        with patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.POSTGRES_AVAILABLE",
            False,
        ):
            from langgraph_workflows.modes34.unified_autonomous_workflow import (
                WorkflowCheckpointerFactory,
            )

            checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-mission-2")

            # Verify MemorySaver fallback
            assert isinstance(checkpointer, MemorySaver)

            # Verify warning logged
            mock_logger.warning.assert_called_once()
            call_args = mock_logger.warning.call_args[1]
            assert call_args["mission_id"] == "test-mission-2"
            assert call_args["reason"] == "postgres_dependency_not_installed"
            assert call_args["impact"] == "mission_state_not_persisted"
            assert "langgraph[postgres]" in call_args["recommendation"]

    def test_successful_postgres_connection_logs_success(
        self, clean_env, mock_logger, monkeypatch
    ):
        """Test successful PostgresSaver connection logs correctly"""
        monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/test")
        monkeypatch.setenv("ENVIRONMENT", "production")

        # Mock PostgresSaver
        mock_postgres_saver = MagicMock()
        mock_postgres_class = MagicMock(return_value=mock_postgres_saver)
        mock_postgres_class.from_conn_string = MagicMock(return_value=mock_postgres_saver)

        with patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.POSTGRES_AVAILABLE",
            True,
        ), patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.PostgresSaver",
            mock_postgres_class,
        ):
            from langgraph_workflows.modes34.unified_autonomous_workflow import (
                WorkflowCheckpointerFactory,
            )

            checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-mission-3")

            # Verify PostgresSaver returned
            assert checkpointer == mock_postgres_saver

            # Verify success logging
            info_calls = [call[1] for call in mock_logger.info.call_args_list]
            assert len(info_calls) == 2  # connecting + connected

            # Check connecting log
            connecting_log = info_calls[0]
            assert connecting_log["mission_id"] == "test-mission-3"
            assert "postgresql://localhost/test"[:30] in connecting_log["db_url_prefix"]

            # Check connected log
            connected_log = info_calls[1]
            assert connected_log["mission_id"] == "test-mission-3"
            assert connected_log["persistence"] == "enabled"

    def test_postgres_connection_failure_logs_with_impact(
        self, clean_env, mock_logger, monkeypatch
    ):
        """Test PostgresSaver connection failure logs with impact assessment"""
        monkeypatch.setenv("DATABASE_URL", "postgresql://bad-host/test")
        monkeypatch.setenv("ENVIRONMENT", "development")

        # Mock PostgresSaver to raise exception
        mock_postgres_class = MagicMock()
        connection_error = ConnectionError("Connection refused")
        mock_postgres_class.from_conn_string = MagicMock(side_effect=connection_error)

        with patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.POSTGRES_AVAILABLE",
            True,
        ), patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.PostgresSaver",
            mock_postgres_class,
        ):
            from langgraph_workflows.modes34.unified_autonomous_workflow import (
                WorkflowCheckpointerFactory,
            )

            checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-mission-4")

            # Verify MemorySaver fallback
            assert isinstance(checkpointer, MemorySaver)

            # Verify warning logged
            mock_logger.warning.assert_called_once()
            call_args = mock_logger.warning.call_args[1]
            assert call_args["mission_id"] == "test-mission-4"
            assert call_args["error_type"] == "ConnectionError"
            assert "Connection refused" in call_args["error"]
            assert call_args["impact"] == "mission_state_not_persisted"
            assert call_args["recovery"] == "restart_will_lose_progress"
            assert "database connectivity" in call_args["action"]

    def test_production_connection_failure_logs_critical_error(
        self, clean_env, mock_logger, monkeypatch
    ):
        """Test production PostgresSaver failure logs CRITICAL error"""
        monkeypatch.setenv("DATABASE_URL", "postgresql://bad-host/test")
        monkeypatch.setenv("ENVIRONMENT", "production")

        # Mock PostgresSaver to raise exception
        mock_postgres_class = MagicMock()
        connection_error = ConnectionError("Connection refused")
        mock_postgres_class.from_conn_string = MagicMock(side_effect=connection_error)

        with patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.POSTGRES_AVAILABLE",
            True,
        ), patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.PostgresSaver",
            mock_postgres_class,
        ):
            from langgraph_workflows.modes34.unified_autonomous_workflow import (
                WorkflowCheckpointerFactory,
            )

            checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-mission-5")

            # Verify MemorySaver fallback
            assert isinstance(checkpointer, MemorySaver)

            # Verify warning AND error logged
            mock_logger.warning.assert_called_once()
            mock_logger.error.assert_called_once()

            # Check error log
            error_call_args = mock_logger.error.call_args[1]
            assert error_call_args["mission_id"] == "test-mission-5"
            assert error_call_args["severity"] == "HIGH"
            assert "Production missions" in error_call_args["impact"]
            assert "URGENT" in error_call_args["action"]

    def test_supabase_db_url_fallback(self, clean_env, mock_logger, monkeypatch):
        """Test that SUPABASE_DB_URL is used if DATABASE_URL not set"""
        monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://supabase-host/test")
        monkeypatch.setenv("ENVIRONMENT", "development")

        # Mock PostgresSaver
        mock_postgres_saver = MagicMock()
        mock_postgres_class = MagicMock(return_value=mock_postgres_saver)
        mock_postgres_class.from_conn_string = MagicMock(return_value=mock_postgres_saver)

        with patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.POSTGRES_AVAILABLE",
            True,
        ), patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.PostgresSaver",
            mock_postgres_class,
        ):
            from langgraph_workflows.modes34.unified_autonomous_workflow import (
                WorkflowCheckpointerFactory,
            )

            checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-mission-6")

            # Verify PostgresSaver was called with SUPABASE_DB_URL
            mock_postgres_class.from_conn_string.assert_called_once_with(
                "postgresql://supabase-host/test"
            )

    def test_error_message_truncation(self, clean_env, mock_logger, monkeypatch):
        """Test that long error messages are truncated to 200 chars"""
        monkeypatch.setenv("DATABASE_URL", "postgresql://bad-host/test")
        monkeypatch.setenv("ENVIRONMENT", "development")

        # Create a very long error message
        long_error = "X" * 500
        mock_postgres_class = MagicMock()
        mock_postgres_class.from_conn_string = MagicMock(
            side_effect=ValueError(long_error)
        )

        with patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.POSTGRES_AVAILABLE",
            True,
        ), patch(
            "langgraph_workflows.modes34.unified_autonomous_workflow.PostgresSaver",
            mock_postgres_class,
        ):
            from langgraph_workflows.modes34.unified_autonomous_workflow import (
                WorkflowCheckpointerFactory,
            )

            checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-mission-7")

            # Verify error was truncated
            call_args = mock_logger.warning.call_args[1]
            assert len(call_args["error"]) == 200
            assert call_args["error"] == "X" * 200

    def test_mission_id_propagation(self, clean_env, mock_logger):
        """Test that mission_id is propagated to all log entries"""
        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            WorkflowCheckpointerFactory,
        )

        checkpointer = WorkflowCheckpointerFactory.create(mission_id="custom-mission-id")

        # Verify mission_id in log
        call_args = mock_logger.info.call_args[1]
        assert call_args["mission_id"] == "custom-mission-id"


class TestGetCheckpointerWrapper:
    """Test the _get_checkpointer() wrapper function"""

    def test_get_checkpointer_uses_factory(self, clean_env, mock_logger):
        """Test that _get_checkpointer() uses WorkflowCheckpointerFactory"""
        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            _get_checkpointer,
        )

        checkpointer = _get_checkpointer()

        # Verify it returned a checkpointer
        assert checkpointer is not None
        assert isinstance(checkpointer, MemorySaver)

        # Verify it logged with mission_id="workflow_graph"
        call_args = mock_logger.info.call_args[1]
        assert call_args["mission_id"] == "workflow_graph"
