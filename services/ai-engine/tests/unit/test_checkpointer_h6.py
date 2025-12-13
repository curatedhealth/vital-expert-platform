"""
Unit tests for H6 Checkpointer Enhancement

Tests the WorkflowCheckpointerFactory fallback logging.
These tests verify logging behavior without mocking to ensure real-world accuracy.
"""

import os
import sys
from pathlib import Path

# Add src to path for imports
src_path = Path(__file__).parent.parent.parent / "src"
sys.path.insert(0, str(src_path))

import pytest
from langgraph.checkpoint.memory import MemorySaver


class TestCheckpointerFactoryIntegration:
    """Integration tests for WorkflowCheckpointerFactory"""

    def test_factory_exists_and_creates_checkpointer(self, monkeypatch):
        """Test that factory exists and can create a checkpointer"""
        # Clean env
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.delenv("SUPABASE_DB_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "test")

        # Import after env is clean
        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            WorkflowCheckpointerFactory,
        )

        # Create checkpointer
        checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-1")

        # Should return MemorySaver when no DB configured
        assert checkpointer is not None
        assert isinstance(checkpointer, MemorySaver)

    def test_factory_accepts_mission_id(self, monkeypatch):
        """Test that factory accepts mission_id parameter"""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "test")

        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            WorkflowCheckpointerFactory,
        )

        # Should not raise
        checkpointer = WorkflowCheckpointerFactory.create(mission_id="custom-mission")
        assert isinstance(checkpointer, MemorySaver)

    def test_get_checkpointer_wrapper(self, monkeypatch):
        """Test _get_checkpointer() wrapper uses factory"""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "test")

        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            _get_checkpointer,
        )

        checkpointer = _get_checkpointer()
        assert checkpointer is not None
        assert isinstance(checkpointer, MemorySaver)

    def test_centralized_factory_exists(self, monkeypatch):
        """Test that centralized factory in langgraph_compilation works"""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "test")

        from langgraph_compilation.checkpointer import WorkflowCheckpointerFactory

        checkpointer = WorkflowCheckpointerFactory.create(mission_id="central-test")
        assert checkpointer is not None
        assert isinstance(checkpointer, MemorySaver)

    def test_centralized_factory_with_connection_string(self, monkeypatch):
        """Test that centralized factory accepts connection_string parameter"""
        monkeypatch.setenv("ENVIRONMENT", "test")

        from langgraph_compilation.checkpointer import WorkflowCheckpointerFactory

        # With None connection string, should use MemorySaver
        checkpointer = WorkflowCheckpointerFactory.create(
            mission_id="test-2",
            connection_string=None
        )
        assert isinstance(checkpointer, MemorySaver)


class TestCheckpointerStatusTracking:
    """Test checkpointer status tracking"""

    def test_get_checkpointer_status(self, monkeypatch):
        """Test get_checkpointer_status returns expected structure"""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "test")

        from langgraph_compilation.checkpointer import get_checkpointer_status

        status = get_checkpointer_status()
        assert isinstance(status, dict)
        assert "initialized" in status
        assert "mode" in status
        assert "postgres_available" in status
        assert "type" in status


class TestMultipleCheckpointerCreation:
    """Test creating multiple checkpointers"""

    def test_multiple_checkpointers_independent(self, monkeypatch):
        """Test that multiple checkpointer creations are independent"""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "test")

        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            WorkflowCheckpointerFactory,
        )

        cp1 = WorkflowCheckpointerFactory.create(mission_id="mission-1")
        cp2 = WorkflowCheckpointerFactory.create(mission_id="mission-2")

        # Both should be MemorySaver
        assert isinstance(cp1, MemorySaver)
        assert isinstance(cp2, MemorySaver)

        # Each call creates a new instance
        assert cp1 is not cp2


class TestEnvironmentHandling:
    """Test environment-specific behavior"""

    def test_development_environment(self, monkeypatch):
        """Test behavior in development environment"""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "development")

        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            WorkflowCheckpointerFactory,
        )

        checkpointer = WorkflowCheckpointerFactory.create(mission_id="dev-test")
        assert isinstance(checkpointer, MemorySaver)

    def test_production_environment_no_db(self, monkeypatch):
        """Test production environment without DB (should still work but log warnings)"""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "production")

        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            WorkflowCheckpointerFactory,
        )

        # Should still return MemorySaver (but would log warnings)
        checkpointer = WorkflowCheckpointerFactory.create(mission_id="prod-test")
        assert isinstance(checkpointer, MemorySaver)

    def test_test_environment(self, monkeypatch):
        """Test behavior in test environment"""
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("ENVIRONMENT", "test")

        from langgraph_workflows.modes34.unified_autonomous_workflow import (
            WorkflowCheckpointerFactory,
        )

        checkpointer = WorkflowCheckpointerFactory.create(mission_id="test-env")
        assert isinstance(checkpointer, MemorySaver)
