"""
Test Suite: RunnerExecutor (executor.py)

Tests:
1. Stage-to-category mapping
2. Code-to-runner mapping
3. get_runner_for_stage() method
4. get_runner_for_code() method
5. execute_step() method
6. execute_step_streaming() method
7. execute_plan() method
8. Error handling for missing runners
9. SSE event generation
"""

import pytest
from typing import Dict, Any, List
from unittest.mock import AsyncMock, MagicMock, patch

from runners.base import (
    BaseRunner,
    RunnerInput,
    RunnerOutput,
    RunnerCategory,
    PharmaDomain,
    KnowledgeLayer,
    QualityMetric,
)
from runners.registry import RunnerRegistry
from runners.executor import (
    RunnerExecutor,
    STAGE_TO_CATEGORY,
    CODE_TO_RUNNER,
)
from runners.assembler import PersonaConfig


# =====================================================
# MOCK RUNNERS FOR TESTING
# =====================================================

class MockDecomposeRunner(BaseRunner):
    """Mock runner for PLAN category"""
    def __init__(self):
        super().__init__(
            runner_id="decompose_basic",
            name="Mock Decompose",
            category=RunnerCategory.PLAN,
            description="Mock decomposition runner",
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"subtasks": ["Task 1", "Task 2"]}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.9}


class MockInvestigateRunner(BaseRunner):
    """Mock runner for INVESTIGATE category"""
    def __init__(self):
        super().__init__(
            runner_id="investigate_basic",
            name="Mock Investigate",
            category=RunnerCategory.INVESTIGATE,
            description="Mock investigation runner",
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"findings": ["Finding 1", "Finding 2"]}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.85}


class MockCritiqueRunner(BaseRunner):
    """Mock runner for EVALUATE category"""
    def __init__(self):
        super().__init__(
            runner_id="critique_basic",
            name="Mock Critique",
            category=RunnerCategory.EVALUATE,
            description="Mock critique runner",
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"issues": [], "strengths": ["Good coverage"]}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.88}


class MockSynthesizeRunner(BaseRunner):
    """Mock runner for SYNTHESIZE category"""
    def __init__(self):
        super().__init__(
            runner_id="synthesize_basic",
            name="Mock Synthesize",
            category=RunnerCategory.SYNTHESIZE,
            description="Mock synthesis runner",
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"summary": "Synthesized result"}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.90}


class MockValidateRunner(BaseRunner):
    """Mock runner for VALIDATE category"""
    def __init__(self):
        super().__init__(
            runner_id="validate_basic",
            name="Mock Validate",
            category=RunnerCategory.VALIDATE,
            description="Mock validation runner",
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"valid": True, "checks": ["Check 1 passed"]}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.92}


class MockRecommendRunner(BaseRunner):
    """Mock runner for DECIDE category"""
    def __init__(self):
        super().__init__(
            runner_id="recommend_basic",
            name="Mock Recommend",
            category=RunnerCategory.DECIDE,
            description="Mock recommendation runner",
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"recommendations": ["Rec 1", "Rec 2"]}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.87}


# =====================================================
# FIXTURES
# =====================================================

@pytest.fixture
def registered_runners():
    """Register all mock runners for tests"""
    # Reset registry
    RunnerRegistry._instance = None
    RunnerRegistry._runners = {}
    RunnerRegistry._initialized = True  # Skip auto-registration

    # Register mocks
    RunnerRegistry.register(MockDecomposeRunner)
    RunnerRegistry.register(MockInvestigateRunner)
    RunnerRegistry.register(MockCritiqueRunner)
    RunnerRegistry.register(MockSynthesizeRunner)
    RunnerRegistry.register(MockValidateRunner)
    RunnerRegistry.register(MockRecommendRunner)

    yield

    # Cleanup
    RunnerRegistry._instance = None
    RunnerRegistry._runners = {}
    RunnerRegistry._initialized = False


@pytest.fixture
def executor(registered_runners):
    """Create executor with mocked db_registry"""
    exec_instance = RunnerExecutor()

    # Mock the db_registry to avoid real DB calls
    mock_db_registry = MagicMock()
    mock_db_registry.pick_for_stage = MagicMock(return_value=None)
    exec_instance._db_registry = mock_db_registry

    return exec_instance


# =====================================================
# MAPPING TESTS
# =====================================================

class TestStageToCategoryMapping:
    """Test STAGE_TO_CATEGORY mapping"""

    def test_planning_stages(self):
        """Test planning-related stages map to PLAN"""
        assert STAGE_TO_CATEGORY["planning"] == RunnerCategory.PLAN
        assert STAGE_TO_CATEGORY["decompose"] == RunnerCategory.PLAN
        assert STAGE_TO_CATEGORY["plan"] == RunnerCategory.PLAN

    def test_evidence_stages(self):
        """Test evidence-related stages map to INVESTIGATE"""
        assert STAGE_TO_CATEGORY["evidence"] == RunnerCategory.INVESTIGATE
        assert STAGE_TO_CATEGORY["research"] == RunnerCategory.INVESTIGATE
        assert STAGE_TO_CATEGORY["investigate"] == RunnerCategory.INVESTIGATE

    def test_analysis_stages(self):
        """Test analysis-related stages map to EVALUATE"""
        assert STAGE_TO_CATEGORY["analysis"] == RunnerCategory.EVALUATE
        assert STAGE_TO_CATEGORY["evaluate"] == RunnerCategory.EVALUATE
        assert STAGE_TO_CATEGORY["critique"] == RunnerCategory.EVALUATE

    def test_synthesis_stages(self):
        """Test synthesis-related stages map to SYNTHESIZE"""
        assert STAGE_TO_CATEGORY["synthesis"] == RunnerCategory.SYNTHESIZE
        assert STAGE_TO_CATEGORY["synthesize"] == RunnerCategory.SYNTHESIZE
        assert STAGE_TO_CATEGORY["summarize"] == RunnerCategory.SYNTHESIZE

    def test_validation_stages(self):
        """Test validation-related stages map to VALIDATE"""
        assert STAGE_TO_CATEGORY["qa"] == RunnerCategory.VALIDATE
        assert STAGE_TO_CATEGORY["validate"] == RunnerCategory.VALIDATE
        assert STAGE_TO_CATEGORY["verify"] == RunnerCategory.VALIDATE

    def test_decision_stages(self):
        """Test decision-related stages map to DECIDE"""
        assert STAGE_TO_CATEGORY["decision"] == RunnerCategory.DECIDE
        assert STAGE_TO_CATEGORY["recommend"] == RunnerCategory.DECIDE


class TestCodeToRunnerMapping:
    """Test CODE_TO_RUNNER mapping"""

    def test_planning_codes(self):
        """Test planning codes map to decompose runner"""
        assert CODE_TO_RUNNER["plan"] == "decompose_basic"
        assert CODE_TO_RUNNER["decompose"] == "decompose_basic"
        assert CODE_TO_RUNNER["clarify"] == "decompose_basic"

    def test_investigation_codes(self):
        """Test investigation codes map to investigate runners"""
        assert CODE_TO_RUNNER["scan"] == "investigate_basic"
        assert CODE_TO_RUNNER["map"] == "investigate_basic"
        assert CODE_TO_RUNNER["research"] == "investigate_advanced"

    def test_critique_codes(self):
        """Test critique codes map to critique runners"""
        assert CODE_TO_RUNNER["rank"] == "critique_basic"
        assert CODE_TO_RUNNER["assess_risk"] == "critique_advanced"
        assert CODE_TO_RUNNER["compare"] == "critique_basic"

    def test_validation_codes(self):
        """Test validation codes map to validate runners"""
        assert CODE_TO_RUNNER["validate_evidence"] == "validate_basic"
        assert CODE_TO_RUNNER["audit"] == "validate_advanced"
        assert CODE_TO_RUNNER["proofread"] == "validate_basic"

    def test_synthesis_codes(self):
        """Test synthesis codes map to synthesize runners"""
        assert CODE_TO_RUNNER["synthesize"] == "synthesize_basic"
        assert CODE_TO_RUNNER["compose"] == "synthesize_advanced"
        assert CODE_TO_RUNNER["contextualize"] == "synthesize_basic"

    def test_decision_codes(self):
        """Test decision codes map to recommend runners"""
        assert CODE_TO_RUNNER["recommend"] == "recommend_basic"
        assert CODE_TO_RUNNER["decide"] == "recommend_advanced"


# =====================================================
# GET RUNNER TESTS
# =====================================================

class TestGetRunnerForStage:
    """Test get_runner_for_stage() method"""

    def test_get_planning_runner(self, executor):
        """Test getting runner for planning stage"""
        runner = executor.get_runner_for_stage("planning")

        assert runner is not None
        assert runner.category == RunnerCategory.PLAN
        assert "decompose" in runner.runner_id

    def test_get_evidence_runner(self, executor):
        """Test getting runner for evidence stage"""
        runner = executor.get_runner_for_stage("evidence")

        assert runner is not None
        assert runner.category == RunnerCategory.INVESTIGATE

    def test_get_analysis_runner(self, executor):
        """Test getting runner for analysis stage"""
        runner = executor.get_runner_for_stage("analysis")

        assert runner is not None
        assert runner.category == RunnerCategory.EVALUATE

    def test_get_synthesis_runner(self, executor):
        """Test getting runner for synthesis stage"""
        runner = executor.get_runner_for_stage("synthesis")

        assert runner is not None
        assert runner.category == RunnerCategory.SYNTHESIZE

    def test_get_qa_runner(self, executor):
        """Test getting runner for qa stage"""
        runner = executor.get_runner_for_stage("qa")

        assert runner is not None
        assert runner.category == RunnerCategory.VALIDATE

    def test_stage_case_insensitive(self, executor):
        """Test stage lookup is case insensitive"""
        runner1 = executor.get_runner_for_stage("PLANNING")
        runner2 = executor.get_runner_for_stage("planning")
        runner3 = executor.get_runner_for_stage("Planning")

        # All should find same category
        assert runner1.category == runner2.category == runner3.category

    def test_unknown_stage_returns_none(self, executor):
        """Test unknown stage returns None"""
        runner = executor.get_runner_for_stage("nonexistent_stage")

        assert runner is None


class TestGetRunnerForCode:
    """Test get_runner_for_code() method"""

    def test_get_by_known_code(self, executor):
        """Test getting runner by known code"""
        runner = executor.get_runner_for_code("synthesize")

        assert runner is not None
        assert runner.runner_id == "synthesize_basic"

    def test_get_by_unknown_code(self, executor):
        """Test getting runner by unknown code returns None"""
        runner = executor.get_runner_for_code("unknown_code")

        assert runner is None

    def test_get_by_direct_runner_id(self, executor):
        """Test getting runner by direct runner ID"""
        runner = executor.get_runner_for_code("investigate_basic")

        assert runner is not None
        assert runner.runner_id == "investigate_basic"


# =====================================================
# EXECUTE STEP TESTS
# =====================================================

class TestExecuteStep:
    """Test execute_step() method"""

    @pytest.mark.asyncio
    async def test_execute_step_basic(self, executor):
        """Test basic step execution"""
        step = {
            "id": "step_1",
            "stage": "synthesis",
            "description": "Synthesize the research findings",
        }
        context = {
            "mission_id": "mission_123",
            "session_id": "session_456",
            "goal": "Analyze market trends",
        }

        output = await executor.execute_step(step, context)

        assert output is not None
        assert output.result is not None
        assert output.confidence > 0

    @pytest.mark.asyncio
    async def test_execute_step_with_runner_code(self, executor):
        """Test step execution with explicit runner code"""
        step = {
            "id": "step_1",
            "stage": "analysis",
            "runner": "recommend",  # Explicit runner code
            "description": "Make recommendations",
        }
        context = {"goal": "Test goal"}

        output = await executor.execute_step(step, context)

        assert output is not None

    @pytest.mark.asyncio
    async def test_execute_step_with_persona(self, executor):
        """Test step execution with custom persona"""
        step = {
            "id": "step_1",
            "stage": "evidence",
            "description": "Research market trends",
        }
        context = {"goal": "Test"}
        persona = PersonaConfig(
            persona_id="analyst_1",
            name="Market Analyst",
            archetype="Analyst",
            tone="professional",
        )

        output = await executor.execute_step(step, context, persona=persona)

        assert output is not None

    @pytest.mark.asyncio
    async def test_execute_step_no_runner_found(self, executor):
        """Test step execution when no runner found"""
        step = {
            "id": "step_1",
            "stage": "unknown_stage",
            "description": "Do something",
        }
        context = {}

        output = await executor.execute_step(step, context)

        assert output is not None
        assert "error" in output.result
        assert output.confidence == 0.0


# =====================================================
# STREAMING EXECUTION TESTS
# =====================================================

class TestExecuteStepStreaming:
    """Test execute_step_streaming() method"""

    @pytest.mark.asyncio
    async def test_streaming_emits_start_event(self, executor):
        """Test streaming emits step_start event"""
        step = {
            "id": "step_1",
            "stage": "synthesis",
            "description": "Synthesize results",
        }
        context = {"goal": "Test"}

        events = []
        async for event in executor.execute_step_streaming(step, context):
            events.append(event)

        # Check for start event
        start_events = [e for e in events if e.get("event") == "step_start"]
        assert len(start_events) == 1
        assert start_events[0]["step_id"] == "step_1"
        assert start_events[0]["runner_id"] == "synthesize_basic"

    @pytest.mark.asyncio
    async def test_streaming_error_for_missing_runner(self, executor):
        """Test streaming emits error for missing runner"""
        step = {
            "id": "step_1",
            "stage": "unknown",
            "description": "Unknown task",
        }
        context = {}

        events = []
        async for event in executor.execute_step_streaming(step, context):
            events.append(event)

        # Should have error event
        error_events = [e for e in events if e.get("event") == "error"]
        assert len(error_events) == 1
        assert "No runner found" in error_events[0]["message"]


# =====================================================
# EXECUTE PLAN TESTS
# =====================================================

class TestExecutePlan:
    """Test execute_plan() method"""

    @pytest.mark.asyncio
    async def test_execute_plan_basic(self, executor):
        """Test executing a multi-step plan"""
        plan = [
            {"id": "step_1", "name": "Research", "stage": "evidence", "description": "Research market"},
            {"id": "step_2", "name": "Analyze", "stage": "analysis", "description": "Analyze findings"},
            {"id": "step_3", "name": "Synthesize", "stage": "synthesis", "description": "Synthesize results"},
        ]
        context = {
            "mission_id": "mission_abc",
            "goal": "Market analysis",
        }

        events = []
        async for event in executor.execute_plan(plan, context):
            events.append(event)

        # Check plan_start event
        start_events = [e for e in events if e.get("event") == "plan_start"]
        assert len(start_events) == 1
        assert start_events[0]["total_steps"] == 3

        # Check plan_complete event
        complete_events = [e for e in events if e.get("event") == "plan_complete"]
        assert len(complete_events) == 1
        assert complete_events[0]["total_steps"] == 3

        # Check progress events
        progress_events = [e for e in events if e.get("event") == "progress"]
        assert len(progress_events) >= 3

    @pytest.mark.asyncio
    async def test_execute_plan_empty(self, executor):
        """Test executing empty plan"""
        plan = []
        context = {"mission_id": "test"}

        events = []
        async for event in executor.execute_plan(plan, context):
            events.append(event)

        # Should still have start and complete
        assert any(e.get("event") == "plan_start" for e in events)
        assert any(e.get("event") == "plan_complete" for e in events)

    @pytest.mark.asyncio
    async def test_execute_plan_collects_artifacts(self, executor):
        """Test plan execution collects artifacts"""
        plan = [
            {"id": "step_1", "name": "Research", "stage": "evidence", "description": "Research"},
        ]
        context = {"mission_id": "test"}

        complete_event = None
        async for event in executor.execute_plan(plan, context):
            if event.get("event") == "plan_complete":
                complete_event = event

        assert complete_event is not None
        assert "artifacts" in complete_event


# =====================================================
# EDGE CASES
# =====================================================

class TestExecutorEdgeCases:
    """Test edge cases and error handling"""

    def test_executor_lazy_loads_db_registry(self):
        """Test executor lazy loads db_registry"""
        executor = RunnerExecutor()
        assert executor._db_registry is None

    @pytest.mark.asyncio
    async def test_step_with_empty_description(self, executor):
        """Test step with empty description"""
        step = {
            "id": "step_1",
            "stage": "synthesis",
            "description": "",
        }
        context = {}

        output = await executor.execute_step(step, context)

        # Should still execute
        assert output is not None

    @pytest.mark.asyncio
    async def test_step_with_missing_stage(self, executor):
        """Test step with missing stage defaults to analysis"""
        step = {
            "id": "step_1",
            "description": "Do something",
            # No stage specified
        }
        context = {}

        output = await executor.execute_step(step, context)

        # Should default to "analysis" stage and find EVALUATE runner
        assert output is not None
