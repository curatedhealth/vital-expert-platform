# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-19
# PURPOSE: Integration tests for VITAL Runners API
"""
Integration tests for the Runners API.

Tests cover:
- Runner listing (all, task, family)
- Category and family filtering
- JTBD-to-runner mapping
- Runner details
- Input validation
- Error handling

Run with:
    cd /Users/amine/Desktop/vitaal2/services/ai-engine
    source venv/bin/activate
    PYTHONPATH=src pytest tests/integration/test_runners_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from main import app

client = TestClient(app)

# Test configuration
TENANT_ID = "test-tenant"
HEADERS = {"x-tenant-id": TENANT_ID}


# =============================================================================
# Runner Listing Tests
# =============================================================================

class TestRunnerListing:
    """Test suite for runner listing endpoints."""

    def test_list_all_runners(self):
        """Test listing all runners without filters."""
        response = client.get("/api/runners/list", headers=HEADERS)
        assert response.status_code == 200

        data = response.json()
        assert "runners" in data
        assert "total" in data
        assert data["total"] > 0
        assert isinstance(data["runners"], list)

    def test_list_task_runners(self):
        """Test listing task runners only."""
        response = client.get(
            "/api/runners/list?runner_type=task",
            headers=HEADERS
        )
        assert response.status_code == 200

        data = response.json()
        assert data["runner_type"] == "task"

        # All returned runners should be task type
        for runner in data["runners"]:
            assert runner["runner_type"] == "task"

    def test_list_family_runners(self):
        """Test listing family runners only."""
        response = client.get(
            "/api/runners/list?runner_type=family",
            headers=HEADERS
        )
        assert response.status_code == 200

        data = response.json()
        # Should have 8 family runners
        assert len(data["runners"]) == 8

        for runner in data["runners"]:
            assert runner["runner_type"] == "family"

    def test_filter_by_category(self):
        """Test filtering task runners by cognitive category."""
        response = client.get(
            "/api/runners/list?runner_type=task&category=EVALUATE",
            headers=HEADERS
        )
        assert response.status_code == 200

        data = response.json()
        assert data["category"] == "EVALUATE"

        for runner in data["runners"]:
            assert runner["category"] == "EVALUATE"

    def test_invalid_runner_type(self):
        """Test error handling for invalid runner type."""
        response = client.get(
            "/api/runners/list?runner_type=invalid",
            headers=HEADERS
        )
        assert response.status_code == 400
        assert "Invalid runner_type" in response.json()["detail"]

    def test_invalid_category(self):
        """Test error handling for invalid category."""
        response = client.get(
            "/api/runners/list?runner_type=task&category=INVALID_CATEGORY",
            headers=HEADERS
        )
        assert response.status_code == 400
        assert "Invalid category" in response.json()["detail"]


# =============================================================================
# Runner Categories Tests
# =============================================================================

class TestRunnerCategories:
    """Test suite for runner categories endpoint."""

    def test_list_categories(self):
        """Test listing all 22 cognitive categories."""
        response = client.get("/api/runners/categories", headers=HEADERS)
        assert response.status_code == 200

        categories = response.json()
        assert isinstance(categories, list)
        assert len(categories) == 22  # 22 cognitive categories

        # Verify key categories exist
        expected = ["UNDERSTAND", "EVALUATE", "DECIDE", "SYNTHESIZE", "PLAN"]
        for cat in expected:
            assert cat in categories


# =============================================================================
# Runner Families Tests
# =============================================================================

class TestRunnerFamilies:
    """Test suite for runner families endpoint."""

    def test_list_families(self):
        """Test listing all 8 family runner types."""
        response = client.get("/api/runners/families", headers=HEADERS)
        assert response.status_code == 200

        families = response.json()
        assert isinstance(families, list)
        assert len(families) == 8  # 8 family types

        # Verify structure
        for family in families:
            assert "family" in family
            assert "name" in family
            assert "reasoning_pattern" in family

        # Verify key families exist
        family_ids = [f["family"] for f in families]
        expected = ["DEEP_RESEARCH", "STRATEGY", "EVALUATION", "GENERIC"]
        for fam in expected:
            assert fam in family_ids

    def test_family_reasoning_patterns(self):
        """Test that family runners have reasoning patterns."""
        response = client.get("/api/runners/families", headers=HEADERS)
        families = response.json()

        # Deep Research should have ToT pattern
        deep_research = next(f for f in families if f["family"] == "DEEP_RESEARCH")
        assert "ToT" in deep_research["reasoning_pattern"]

        # Strategy should have SWOT pattern
        strategy = next(f for f in families if f["family"] == "STRATEGY")
        assert "SWOT" in strategy["reasoning_pattern"]


# =============================================================================
# JTBD Mapping Tests
# =============================================================================

class TestJTBDMapping:
    """Test suite for JTBD-to-runner mapping endpoints."""

    def test_get_jtbd_runner_mapping(self):
        """Test getting runner for a JTBD level and job step."""
        response = client.get(
            "/api/runners/jtbd/workflow/execute",
            headers=HEADERS
        )
        assert response.status_code == 200

        data = response.json()
        assert data["jtbd_level"] == "workflow"
        assert data["job_step"] == "execute"
        assert "runner_id" in data
        assert "runner_type" in data
        assert "ai_intervention" in data
        assert "service_layer" in data

    def test_all_jtbd_levels(self):
        """Test mapping for all JTBD levels."""
        levels = ["strategic", "solution", "workflow", "task"]

        for level in levels:
            response = client.get(
                f"/api/runners/jtbd/{level}/execute",
                headers=HEADERS
            )
            assert response.status_code == 200
            assert response.json()["jtbd_level"] == level

    def test_all_job_steps(self):
        """Test mapping for all 8 job steps."""
        steps = ["define", "locate", "prepare", "confirm", "execute", "monitor", "modify", "conclude"]

        for step in steps:
            response = client.get(
                f"/api/runners/jtbd/workflow/{step}",
                headers=HEADERS
            )
            assert response.status_code == 200
            assert response.json()["job_step"] == step

    def test_invalid_jtbd_level(self):
        """Test error handling for invalid JTBD level."""
        response = client.get(
            "/api/runners/jtbd/invalid/execute",
            headers=HEADERS
        )
        assert response.status_code == 400
        assert "Invalid JTBD level" in response.json()["detail"]

    def test_invalid_job_step(self):
        """Test error handling for invalid job step."""
        response = client.get(
            "/api/runners/jtbd/workflow/invalid",
            headers=HEADERS
        )
        assert response.status_code == 400
        assert "Invalid job step" in response.json()["detail"]

    def test_jtbd_runner_matrix(self):
        """Test getting the complete JTBD × Job Step matrix."""
        response = client.get("/api/runners/jtbd/matrix", headers=HEADERS)
        assert response.status_code == 200

        matrix = response.json()
        assert isinstance(matrix, dict)

        # Should have all 4 levels
        assert "strategic" in matrix
        assert "solution" in matrix
        assert "workflow" in matrix
        assert "task" in matrix

        # Each level should have job steps
        for level, steps in matrix.items():
            assert "execute" in steps


# =============================================================================
# Runner Details Tests
# =============================================================================

class TestRunnerDetails:
    """Test suite for runner details endpoint."""

    def test_get_runner_details(self):
        """Test getting details for a specific runner."""
        # First get list to find a valid runner ID
        list_response = client.get("/api/runners/list?runner_type=task", headers=HEADERS)
        runners = list_response.json()["runners"]

        if runners:
            runner_id = runners[0]["runner_id"]

            response = client.get(
                f"/api/runners/{runner_id}",
                headers=HEADERS
            )
            assert response.status_code == 200

            data = response.json()
            assert data["runner_id"] == runner_id
            assert "name" in data
            assert "runner_type" in data

    def test_get_nonexistent_runner(self):
        """Test getting a runner that doesn't exist."""
        response = client.get(
            "/api/runners/nonexistent_runner_xyz",
            headers=HEADERS
        )
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


# =============================================================================
# Runner Execution Tests
# =============================================================================

class TestRunnerExecution:
    """Test suite for runner execution endpoint."""

    def test_execute_requires_input(self):
        """Test that execution requires input_data."""
        response = client.post(
            "/api/runners/critique_runner/execute",
            headers=HEADERS,
            json={}  # Missing input_data
        )
        # Should fail validation
        assert response.status_code == 422

    def test_execute_nonexistent_runner(self):
        """Test executing a runner that doesn't exist."""
        response = client.post(
            "/api/runners/nonexistent_runner/execute",
            headers=HEADERS,
            json={
                "input_data": {"test": "data"}
            }
        )
        assert response.status_code == 404

    def test_execute_family_runner_error(self):
        """Test that family runners return appropriate error for direct execution."""
        response = client.post(
            "/api/runners/deep_research_runner/execute",
            headers=HEADERS,
            json={
                "input_data": {"query": "test"}
            }
        )
        # Should return 400 because family runners use streaming endpoint
        # or 404 if not found as task runner
        assert response.status_code in [400, 404]


# =============================================================================
# Header Validation Tests
# =============================================================================

class TestHeaderValidation:
    """Test suite for header validation."""

    def test_missing_tenant_header_in_dev(self):
        """Test that missing tenant header uses default in development."""
        response = client.get("/api/runners/list")
        # In development, should use default tenant
        assert response.status_code == 200

    def test_with_tenant_header(self):
        """Test request with explicit tenant header."""
        response = client.get(
            "/api/runners/list",
            headers={"x-tenant-id": "custom-tenant"}
        )
        assert response.status_code == 200


# =============================================================================
# Service Layer Tests
# =============================================================================

class TestServiceLayers:
    """Test that runners are correctly mapped to service layers."""

    def test_task_runners_service_layers(self):
        """Test that task runners are in L1-L2."""
        response = client.get(
            "/api/runners/list?runner_type=task",
            headers=HEADERS
        )
        data = response.json()

        for runner in data["runners"]:
            layers = runner.get("service_layers", [])
            # Task runners should include L1 or L2
            if layers:
                assert any(l in layers for l in ["L1", "L2"])

    def test_family_runners_service_layers(self):
        """Test that family runners are in L3."""
        response = client.get(
            "/api/runners/list?runner_type=family",
            headers=HEADERS
        )
        data = response.json()

        for runner in data["runners"]:
            layers = runner.get("service_layers", [])
            # Family runners should include L3
            if layers:
                assert "L3" in layers


# =============================================================================
# AI Intervention Tests
# =============================================================================

class TestAIIntervention:
    """Test AI intervention level mappings."""

    def test_jtbd_ai_interventions(self):
        """Test that AI intervention levels match JTBD hierarchy."""
        # Strategic level should have REDESIGN or ORCHESTRATE
        response = client.get("/api/runners/jtbd/strategic/execute", headers=HEADERS)
        data = response.json()
        assert data["ai_intervention"] in ["REDESIGN", "ORCHESTRATE"]

        # Task level should have AUGMENT or ASSIST
        response = client.get("/api/runners/jtbd/task/execute", headers=HEADERS)
        data = response.json()
        assert data["ai_intervention"] in ["AUGMENT", "ASSIST"]


# =============================================================================
# Run tests
# =============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
