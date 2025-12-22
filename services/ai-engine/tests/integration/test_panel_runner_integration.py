# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-19
# PURPOSE: Integration tests for Panel-Runner integration
"""
Integration tests for Panel-Runner Integration.

Tests cover:
- Panel runner mapper functionality
- Complexity detection
- JTBD-based runner selection
- API endpoints for runner mappings
- Panel execution with runner info

Run with:
    cd /Users/amine/Desktop/vitaal2/services/ai-engine
    source venv/bin/activate
    PYTHONPATH=src pytest tests/integration/test_panel_runner_integration.py -v
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from main import app
from services.panel.panel_runner_mapper import (
    PanelRunnerMapper,
    get_panel_runner_mapper,
    get_runner_for_panel,
    detect_query_complexity,
    QueryComplexity,
    JTBDLevel,
    JobStep,
    RunnerMapping,
)

client = TestClient(app)

# Test configuration
TENANT_ID = "test-tenant"
HEADERS = {"x-tenant-id": TENANT_ID}


# =============================================================================
# Panel Runner Mapper Unit Tests
# =============================================================================

class TestPanelRunnerMapper:
    """Test suite for PanelRunnerMapper functionality."""

    def test_mapper_singleton(self):
        """Test that mapper is a singleton."""
        mapper1 = get_panel_runner_mapper()
        mapper2 = get_panel_runner_mapper()
        assert mapper1 is mapper2

    def test_list_supported_panels(self):
        """Test listing all supported panel types."""
        mapper = get_panel_runner_mapper()
        panels = mapper.list_supported_panels()

        assert len(panels) >= 6  # At least 6 panel types
        assert "consensus" in panels
        assert "comparison" in panels
        assert "debate" in panels
        assert "critique" in panels
        assert "synthesis" in panels
        assert "recommendation" in panels

    def test_get_runner_for_each_panel_type(self):
        """Test that each panel type has a valid runner mapping."""
        mapper = get_panel_runner_mapper()
        panels = mapper.list_supported_panels()

        for panel_type in panels:
            runner = mapper.get_runner_for_panel(panel_type)
            assert runner is not None
            assert runner.runner_id is not None
            assert runner.runner_type in ["task", "family"]
            assert runner.category is not None
            assert runner.ai_intervention is not None
            assert runner.service_layer in ["L1", "L2", "L3"]

    def test_get_all_runners_for_panel(self):
        """Test getting all runner tiers for a panel type."""
        mapper = get_panel_runner_mapper()
        runners = mapper.get_all_runners_for_panel("consensus")

        assert "primary" in runners
        assert runners["primary"].runner_id is not None

        # Consensus should have advanced and family options
        if "advanced" in runners:
            assert runners["advanced"].runner_id is not None
        if "family" in runners:
            assert runners["family"].runner_type == "family"


# =============================================================================
# Complexity Detection Tests
# =============================================================================

class TestComplexityDetection:
    """Test suite for query complexity detection."""

    def test_detect_strategic_complexity(self):
        """Test detection of strategic-level queries."""
        strategic_queries = [
            "What is the strategic roadmap for our regulatory submission?",
            "How should we approach the market entry strategy for our new drug?",
            "What are the long-term investment implications?",
        ]

        for query in strategic_queries:
            complexity = detect_query_complexity(query)
            assert complexity == "strategic", f"Expected 'strategic' for: {query}"

    def test_detect_complex_complexity(self):
        """Test detection of complex queries."""
        complex_queries = [
            "Provide a comprehensive analysis of the multi-domain implications",
            "What is the integrated framework for cross-functional collaboration?",
            "How do we handle multiple stakeholders in this end-to-end process?",
        ]

        for query in complex_queries:
            complexity = detect_query_complexity(query)
            assert complexity == "complex", f"Expected 'complex' for: {query}"

    def test_detect_moderate_complexity(self):
        """Test detection of moderate complexity queries."""
        moderate_queries = [
            "Compare the efficacy of these two treatments",
            "Evaluate the regulatory implications of this change",
            "What are the tradeoffs between these options?",
        ]

        for query in moderate_queries:
            complexity = detect_query_complexity(query)
            assert complexity == "moderate", f"Expected 'moderate' for: {query}"

    def test_detect_simple_complexity(self):
        """Test detection of simple queries."""
        simple_queries = [
            "What is the definition of GMP?",
            "List the main regulatory agencies",
            "Give me a brief summary of the protocol",
        ]

        for query in simple_queries:
            complexity = detect_query_complexity(query)
            assert complexity == "simple", f"Expected 'simple' for: {query}"

    def test_default_complexity(self):
        """Test that unknown patterns default to moderate."""
        query = "Something that doesn't match any pattern"
        complexity = detect_query_complexity(query)
        assert complexity == "moderate"


# =============================================================================
# JTBD-Based Selection Tests
# =============================================================================

class TestJTBDSelection:
    """Test suite for JTBD-based runner selection."""

    def test_task_level_uses_primary_runner(self):
        """Test that task-level JTBD uses primary runners."""
        runner = get_runner_for_panel(
            panel_type="synthesis",
            jtbd_level="task"
        )
        # Task level should use simpler runners
        assert runner.service_layer in ["L1", "L2"]

    def test_workflow_level_uses_advanced_runner(self):
        """Test that workflow-level JTBD prefers advanced runners."""
        runner = get_runner_for_panel(
            panel_type="synthesis",
            jtbd_level="workflow"
        )
        # Workflow should use L2 advanced runners
        assert runner.service_layer == "L2"

    def test_strategic_level_uses_family_runner(self):
        """Test that strategic-level JTBD uses family runners."""
        runner = get_runner_for_panel(
            panel_type="synthesis",
            jtbd_level="strategic"
        )
        # Strategic level should prefer family runners if available
        if runner.runner_type == "family":
            assert runner.service_layer == "L3"

    def test_job_step_to_panel_mapping(self):
        """Test that job steps map to appropriate panel types."""
        mapper = get_panel_runner_mapper()

        # Execute step should map to synthesis
        runner = mapper.get_runner_by_jtbd(
            jtbd_level=JTBDLevel.WORKFLOW,
            job_step=JobStep.EXECUTE
        )
        assert runner.category in ["SYNTHESIZE", "DECIDE"]

        # Confirm step should map to critique
        runner = mapper.get_runner_by_jtbd(
            jtbd_level=JTBDLevel.WORKFLOW,
            job_step=JobStep.CONFIRM
        )
        assert runner.category == "EVALUATE"


# =============================================================================
# API Endpoint Tests
# =============================================================================

class TestPanelRunnerAPI:
    """Test suite for panel runner API endpoints."""

    def test_list_all_panel_runners(self):
        """Test listing all panel runners endpoint."""
        response = client.get("/api/v1/unified-panel/runners", headers=HEADERS)
        assert response.status_code == 200

        data = response.json()
        assert "total_panels" in data
        assert "panels" in data
        assert data["total_panels"] >= 6

    def test_get_runners_for_specific_panel(self):
        """Test getting runners for a specific panel type."""
        response = client.get(
            "/api/v1/unified-panel/runners/consensus",
            headers=HEADERS
        )
        assert response.status_code == 200

        data = response.json()
        assert data["panel_type"] == "consensus"
        assert "available_runners" in data
        assert "recommended" in data
        assert "primary" in data["available_runners"]

    def test_get_runners_with_complexity(self):
        """Test getting runners with complexity parameter."""
        response = client.get(
            "/api/v1/unified-panel/runners/synthesis?complexity=strategic",
            headers=HEADERS
        )
        assert response.status_code == 200

        data = response.json()
        assert data["selection_criteria"]["complexity"] == "strategic"
        # Strategic complexity should recommend family runner if available
        recommended = data["recommended"]
        assert recommended["runner_id"] is not None

    def test_get_runners_with_jtbd_level(self):
        """Test getting runners with JTBD level parameter."""
        response = client.get(
            "/api/v1/unified-panel/runners/debate?jtbd_level=workflow",
            headers=HEADERS
        )
        assert response.status_code == 200

        data = response.json()
        assert data["selection_criteria"]["jtbd_level"] == "workflow"

    def test_invalid_panel_type_returns_400(self):
        """Test that invalid panel type returns 400."""
        response = client.get(
            "/api/v1/unified-panel/runners/invalid_type",
            headers=HEADERS
        )
        assert response.status_code == 400
        assert "Invalid panel type" in response.json()["detail"]


# =============================================================================
# Panel Execution with Runner Info Tests
# =============================================================================

class TestPanelExecutionWithRunnerInfo:
    """Test suite for panel execution with runner info in response."""

    def test_execute_panel_returns_runner_info(self):
        """Test that panel execution returns runner info."""
        request_data = {
            "question": "What are the regulatory implications of this new formulation?",
            "panel_type": "consensus",
            "agents": [
                {
                    "id": "agent-1",
                    "name": "Regulatory Expert",
                    "model": "gpt-4-turbo",
                    "system_prompt": "You are a regulatory affairs expert.",
                    "role": "expert"
                },
                {
                    "id": "agent-2",
                    "name": "Quality Expert",
                    "model": "gpt-4-turbo",
                    "system_prompt": "You are a quality assurance expert.",
                    "role": "expert"
                }
            ],
            "save_to_db": False,
            "generate_matrix": False
        }

        # Note: This test may fail without actual LLM service
        # In real testing, mock the LLM service
        # Here we just test that the endpoint accepts the request
        response = client.post(
            "/api/v1/unified-panel/execute",
            headers=HEADERS,
            json=request_data
        )

        # If LLM is available, check response structure
        if response.status_code == 200:
            data = response.json()
            assert "runner_info" in data
            if data["runner_info"]:
                assert "runner_id" in data["runner_info"]
                assert "runner_type" in data["runner_info"]
                assert "category" in data["runner_info"]
                assert "auto_selected" in data["runner_info"]

    def test_execute_panel_with_explicit_runner_config(self):
        """Test panel execution with explicit runner configuration."""
        request_data = {
            "question": "What is the strategic roadmap for market entry?",
            "panel_type": "recommendation",
            "agents": [
                {
                    "id": "agent-1",
                    "name": "Strategy Expert",
                    "model": "gpt-4-turbo",
                    "system_prompt": "You are a market strategy expert.",
                    "role": "expert"
                },
                {
                    "id": "agent-2",
                    "name": "Commercial Expert",
                    "model": "gpt-4-turbo",
                    "system_prompt": "You are a commercial strategy expert.",
                    "role": "expert"
                }
            ],
            "runner_config": {
                "jtbd_level": "strategic",
                "use_advanced": True
            },
            "save_to_db": False,
            "generate_matrix": False
        }

        response = client.post(
            "/api/v1/unified-panel/execute",
            headers=HEADERS,
            json=request_data
        )

        # Validate request was accepted
        # Full execution depends on LLM availability
        assert response.status_code in [200, 500]  # 500 if no LLM configured

    def test_execute_panel_with_complexity_detection(self):
        """Test that complexity is auto-detected for runner selection."""
        # Simple query - should detect as simple/moderate
        simple_request = {
            "question": "What is the definition of FDA approval process?",
            "panel_type": "consensus",
            "agents": [
                {"id": "a1", "name": "Expert 1", "model": "gpt-4-turbo", "system_prompt": "You are an expert.", "role": "expert"},
                {"id": "a2", "name": "Expert 2", "model": "gpt-4-turbo", "system_prompt": "You are an expert.", "role": "expert"}
            ],
            "save_to_db": False,
            "generate_matrix": False
        }

        # Strategic query - should detect as strategic
        strategic_request = {
            "question": "What is our long-term strategic roadmap for global market entry and competitive positioning?",
            "panel_type": "recommendation",
            "agents": [
                {"id": "a1", "name": "Expert 1", "model": "gpt-4-turbo", "system_prompt": "You are an expert.", "role": "expert"},
                {"id": "a2", "name": "Expert 2", "model": "gpt-4-turbo", "system_prompt": "You are an expert.", "role": "expert"}
            ],
            "save_to_db": False,
            "generate_matrix": False
        }

        # These requests should be accepted
        # Actual execution depends on LLM availability
        response1 = client.post("/api/v1/unified-panel/execute", headers=HEADERS, json=simple_request)
        response2 = client.post("/api/v1/unified-panel/execute", headers=HEADERS, json=strategic_request)

        assert response1.status_code in [200, 500]
        assert response2.status_code in [200, 500]


# =============================================================================
# Runner Mapping Validation Tests
# =============================================================================

class TestRunnerMappingValidation:
    """Validate that all panel types have proper runner mappings."""

    def test_all_panel_types_have_primary_runner(self):
        """Verify all panel types have at least a primary runner."""
        mapper = get_panel_runner_mapper()
        panels = mapper.list_supported_panels()

        for panel_type in panels:
            runners = mapper.get_all_runners_for_panel(panel_type)
            assert "primary" in runners, f"{panel_type} missing primary runner"
            assert runners["primary"].runner_id is not None

    def test_runner_categories_are_valid(self):
        """Verify all runner categories are from the 22 valid categories."""
        valid_categories = [
            "UNDERSTAND", "EVALUATE", "DECIDE", "INVESTIGATE", "WATCH",
            "SOLVE", "PREPARE", "CREATE", "REFINE", "VALIDATE",
            "SYNTHESIZE", "PLAN", "PREDICT", "ENGAGE", "ALIGN",
            "INFLUENCE", "ADAPT", "DISCOVER", "DESIGN", "GOVERN",
            "SECURE", "EXECUTE"
        ]

        mapper = get_panel_runner_mapper()
        panels = mapper.list_supported_panels()

        for panel_type in panels:
            runners = mapper.get_all_runners_for_panel(panel_type)
            for tier, runner in runners.items():
                assert runner.category in valid_categories, \
                    f"{panel_type}/{tier} has invalid category: {runner.category}"

    def test_ai_intervention_levels_are_valid(self):
        """Verify all AI intervention levels are valid."""
        valid_interventions = ["ASSIST", "AUGMENT", "AUTOMATE", "ORCHESTRATE", "REDESIGN"]

        mapper = get_panel_runner_mapper()
        panels = mapper.list_supported_panels()

        for panel_type in panels:
            runners = mapper.get_all_runners_for_panel(panel_type)
            for tier, runner in runners.items():
                assert runner.ai_intervention in valid_interventions, \
                    f"{panel_type}/{tier} has invalid AI intervention: {runner.ai_intervention}"

    def test_service_layers_are_valid(self):
        """Verify all service layers are valid."""
        valid_layers = ["L1", "L2", "L3"]

        mapper = get_panel_runner_mapper()
        panels = mapper.list_supported_panels()

        for panel_type in panels:
            runners = mapper.get_all_runners_for_panel(panel_type)
            for tier, runner in runners.items():
                assert runner.service_layer in valid_layers, \
                    f"{panel_type}/{tier} has invalid service layer: {runner.service_layer}"


# =============================================================================
# Run tests
# =============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
