"""
VITAL Platform - LangGraph Workflow Tests
==========================================
Tests for the agentic workflow components.
"""

import pytest
import sys

sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL/src')


class TestStateCreation:
    """Test state initialization."""

    def test_create_initial_state(self, sample_query):
        """Test initial state creation."""
        try:
            from langgraph.state import create_initial_state

            state = create_initial_state(
                user_query=sample_query,
                session_id="test-session",
                user_persona_type="AUTOMATOR"
            )

            assert state["user_query"] == sample_query
            assert state["session_id"] == "test-session"
            assert state["user_persona_type"] == "AUTOMATOR"
            assert state["step_count"] == 0
            assert state["error"] is None

        except ImportError:
            pytest.skip("LangGraph components not available")

    def test_state_has_all_fields(self, sample_query):
        """Test state has all required fields."""
        try:
            from langgraph.state import create_initial_state, VITALState

            state = create_initial_state(
                user_query=sample_query,
                session_id="test"
            )

            required_fields = [
                "user_query", "session_id", "intent", "entities",
                "therapeutic_area", "functional_domain", "selected_agents",
                "primary_agent", "retrieved_chunks", "rag_namespaces",
                "graph_context", "draft_response", "final_response",
                "citations", "messages", "step_count", "error", "latency_ms"
            ]

            for field in required_fields:
                assert field in state, f"Missing field: {field}"

        except ImportError:
            pytest.skip("LangGraph components not available")


class TestDomainDetection:
    """Test domain detection utilities."""

    def test_detect_therapeutic_area_oncology(self):
        """Test oncology detection."""
        try:
            from langgraph.state import detect_therapeutic_area

            result = detect_therapeutic_area("cancer treatment strategies")
            assert result == "oncology"

            result = detect_therapeutic_area("immuno-oncology approaches")
            assert result == "oncology"

        except ImportError:
            pytest.skip("LangGraph components not available")

    def test_detect_therapeutic_area_immunology(self):
        """Test immunology detection."""
        try:
            from langgraph.state import detect_therapeutic_area

            result = detect_therapeutic_area("autoimmune disease management")
            assert result == "immunology"

        except ImportError:
            pytest.skip("LangGraph components not available")

    def test_detect_functional_domain_medical_affairs(self):
        """Test medical affairs detection."""
        try:
            from langgraph.state import detect_functional_domain

            result = detect_functional_domain("MSL engagement with KOLs")
            assert result == "medical_affairs"

        except ImportError:
            pytest.skip("LangGraph components not available")

    def test_detect_functional_domain_regulatory(self):
        """Test regulatory detection."""
        try:
            from langgraph.state import detect_functional_domain

            result = detect_functional_domain("FDA submission requirements")
            assert result == "regulatory_affairs"

        except ImportError:
            pytest.skip("LangGraph components not available")


class TestIntentClassification:
    """Test intent classification node."""

    def test_classify_question_intent(self, sample_query):
        """Test question intent classification."""
        try:
            from langgraph.state import create_initial_state
            from langgraph.nodes import classify_intent

            state = create_initial_state(
                user_query="What are the best practices for MSL training?",
                session_id="test"
            )

            result = classify_intent(state)

            assert result["intent"] == "question"
            assert result["step_count"] == 1

        except ImportError:
            pytest.skip("LangGraph components not available")

    def test_classify_analysis_intent(self):
        """Test analysis intent classification."""
        try:
            from langgraph.state import create_initial_state
            from langgraph.nodes import classify_intent

            state = create_initial_state(
                user_query="Analyze the competitive landscape in oncology",
                session_id="test"
            )

            result = classify_intent(state)

            assert result["intent"] == "analysis"

        except ImportError:
            pytest.skip("LangGraph components not available")

    def test_classify_recommendation_intent(self):
        """Test recommendation intent classification."""
        try:
            from langgraph.state import create_initial_state
            from langgraph.nodes import classify_intent

            state = create_initial_state(
                user_query="Recommend a strategy for KOL engagement",
                session_id="test"
            )

            result = classify_intent(state)

            assert result["intent"] == "recommendation"

        except ImportError:
            pytest.skip("LangGraph components not available")


class TestAgentSelection:
    """Test agent selection node."""

    def test_agent_selection_returns_agents(self, sample_query):
        """Test that agent selection returns agents."""
        try:
            from langgraph.state import create_initial_state
            from langgraph.nodes import classify_intent, select_agents

            state = create_initial_state(
                user_query=sample_query,
                session_id="test",
                user_persona_type="AUTOMATOR"
            )

            state = classify_intent(state)
            result = select_agents(state)

            assert len(result["selected_agents"]) > 0
            assert result["primary_agent"] is not None

        except ImportError:
            pytest.skip("LangGraph components not available")

    def test_selected_agent_has_required_fields(self, sample_query):
        """Test selected agent has required fields."""
        try:
            from langgraph.state import create_initial_state
            from langgraph.nodes import classify_intent, select_agents

            state = create_initial_state(
                user_query=sample_query,
                session_id="test"
            )

            state = classify_intent(state)
            result = select_agents(state)

            agent = result["primary_agent"]
            required = ["name", "role_name", "match_score"]

            for field in required:
                assert field in agent, f"Agent missing field: {field}"

        except ImportError:
            pytest.skip("LangGraph components not available")


class TestWorkflowExecution:
    """Test full workflow execution."""

    def test_workflow_basic_execution(self, sample_query):
        """Test basic workflow execution."""
        try:
            from langgraph.graph import VITALWorkflow

            workflow = VITALWorkflow()
            result = workflow.run(
                query=sample_query,
                user_persona_type="AUTOMATOR"
            )

            assert result["final_response"] is not None
            assert len(result["final_response"]) > 0

        except ImportError:
            pytest.skip("LangGraph not installed")

    def test_workflow_tracks_latency(self, sample_query):
        """Test workflow tracks latency per node."""
        try:
            from langgraph.graph import VITALWorkflow

            workflow = VITALWorkflow()
            result = workflow.run(query=sample_query)

            latency = result.get("latency_ms", {})
            assert len(latency) > 0, "No latency tracking"

        except ImportError:
            pytest.skip("LangGraph not installed")

    def test_workflow_handles_different_persona_types(self, sample_persona_types, sample_query):
        """Test workflow works with all persona types."""
        try:
            from langgraph.graph import VITALWorkflow

            workflow = VITALWorkflow()

            for persona_type in sample_persona_types:
                result = workflow.run(
                    query=sample_query,
                    user_persona_type=persona_type
                )

                assert result["final_response"] is not None, \
                    f"Failed for persona type: {persona_type}"

        except ImportError:
            pytest.skip("LangGraph not installed")
