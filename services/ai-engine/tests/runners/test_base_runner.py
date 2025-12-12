"""
Test Suite: BaseRunner (base.py)

Tests:
1. RunnerCategory enum coverage
2. PharmaDomain enum coverage
3. KnowledgeLayer enum coverage
4. QualityMetric enum coverage
5. RunnerInput dataclass
6. RunnerOutput dataclass & serialization
7. BaseRunner abstract class contract
8. Quality gate pattern (iterative refinement)
9. Confidence calculation with weighted metrics
10. Feedback generation for low-scoring metrics
11. LangGraph node conversion
12. Streaming execution
"""

import pytest
from datetime import datetime
from typing import Any, Dict, List
from dataclasses import asdict

from runners.base import (
    BaseRunner,
    RunnerInput,
    RunnerOutput,
    RunnerCategory,
    PharmaDomain,
    KnowledgeLayer,
    QualityMetric,
)


# =====================================================
# ENUM TESTS
# =====================================================

class TestRunnerCategory:
    """Test RunnerCategory enum has all 22 categories"""

    def test_all_22_categories_exist(self):
        """Verify all 22 cognitive categories are defined"""
        expected_categories = [
            "understand", "evaluate", "decide", "investigate", "watch",
            "solve", "prepare", "create", "refine", "validate",
            "synthesize", "plan", "predict", "engage", "align",
            "influence", "adapt", "discover", "design", "govern",
            "secure", "execute"
        ]
        actual = [c.value for c in RunnerCategory]
        assert len(actual) == 22, f"Expected 22 categories, got {len(actual)}"
        for expected in expected_categories:
            assert expected in actual, f"Missing category: {expected}"

    def test_category_string_enum(self):
        """RunnerCategory should be string enum"""
        assert RunnerCategory.UNDERSTAND.value == "understand"
        assert str(RunnerCategory.INVESTIGATE) == "RunnerCategory.INVESTIGATE"


class TestPharmaDomain:
    """Test PharmaDomain enum has all 6 families"""

    def test_all_6_domains_exist(self):
        """Verify all 6 pharma domain families"""
        expected = ["foresight", "brand_strategy", "digital_health",
                   "medical_affairs", "market_access", "design_thinking"]
        actual = [d.value for d in PharmaDomain]
        assert len(actual) == 6
        for exp in expected:
            assert exp in actual, f"Missing domain: {exp}"


class TestKnowledgeLayer:
    """Test KnowledgeLayer enum"""

    def test_knowledge_layers(self):
        """Verify L0, L1, L2 knowledge layers"""
        assert KnowledgeLayer.L0_INDUSTRY.value == "industry"
        assert KnowledgeLayer.L1_FUNCTION.value == "function"
        assert KnowledgeLayer.L2_SPECIALTY.value == "specialty"


class TestQualityMetric:
    """Test QualityMetric enum"""

    def test_quality_metrics(self):
        """Verify all quality metrics"""
        expected = ["relevance", "accuracy", "comprehensiveness",
                   "expression", "faithfulness", "coverage",
                   "timeliness", "confidence"]
        actual = [m.value for m in QualityMetric]
        assert len(actual) == 8
        for exp in expected:
            assert exp in actual, f"Missing metric: {exp}"


# =====================================================
# DATACLASS TESTS
# =====================================================

class TestRunnerInput:
    """Test RunnerInput dataclass"""

    def test_minimal_input(self):
        """Test creating input with just task"""
        inp = RunnerInput(task="Analyze competitive landscape")
        assert inp.task == "Analyze competitive landscape"
        assert inp.context == {}
        assert inp.persona_id is None
        assert inp.knowledge_layers == []
        assert inp.constraints == {}
        assert inp.previous_results == []
        assert inp.max_iterations == 3
        assert inp.quality_threshold == 0.80
        assert inp.stream_tokens == False

    def test_full_input(self):
        """Test creating input with all fields"""
        inp = RunnerInput(
            task="Research oncology market trends",
            context={"region": "EU"},
            persona_id="market_analyst",
            knowledge_layers=[KnowledgeLayer.L1_FUNCTION, KnowledgeLayer.L2_SPECIALTY],
            constraints={"max_sources": 10},
            previous_results=[{"iteration": 1, "score": 0.7}],
            max_iterations=5,
            quality_threshold=0.85,
            stream_tokens=True,
        )
        assert inp.task == "Research oncology market trends"
        assert inp.context["region"] == "EU"
        assert inp.persona_id == "market_analyst"
        assert len(inp.knowledge_layers) == 2
        assert inp.max_iterations == 5
        assert inp.quality_threshold == 0.85


class TestRunnerOutput:
    """Test RunnerOutput dataclass"""

    def test_output_creation(self):
        """Test creating output with all fields"""
        output = RunnerOutput(
            result={"findings": ["Finding 1", "Finding 2"]},
            confidence=0.87,
            quality_scores={
                QualityMetric.RELEVANCE: 0.9,
                QualityMetric.ACCURACY: 0.85,
            },
            sources=[{"title": "Source 1", "url": "https://example.com"}],
            artifacts=[{"type": "report", "content": "..."}],
            iterations_used=2,
            tokens_used=1500,
            cost_usd=0.05,
            duration_ms=3200,
            metadata={"runner_id": "investigate_basic"},
        )
        assert output.confidence == 0.87
        assert output.iterations_used == 2
        assert len(output.sources) == 1

    def test_output_to_dict(self):
        """Test output serialization to dict"""
        output = RunnerOutput(
            result={"summary": "Test summary"},
            confidence=0.85,
            quality_scores={
                QualityMetric.RELEVANCE: 0.9,
                QualityMetric.ACCURACY: 0.8,
            },
            sources=[],
            artifacts=[],
            iterations_used=1,
            tokens_used=500,
            cost_usd=0.01,
            duration_ms=1000,
        )
        d = output.to_dict()
        assert d["confidence"] == 0.85
        assert d["quality_scores"]["relevance"] == 0.9
        assert d["quality_scores"]["accuracy"] == 0.8
        assert "result" in d


# =====================================================
# CONCRETE RUNNER IMPLEMENTATION FOR TESTING
# =====================================================

class MockRunner(BaseRunner):
    """Concrete runner for testing abstract BaseRunner"""

    def __init__(
        self,
        runner_id: str = "mock_runner",
        category: RunnerCategory = RunnerCategory.INVESTIGATE,
        quality_to_return: float = 0.85,
    ):
        super().__init__(
            runner_id=runner_id,
            name="Mock Test Runner",
            category=category,
            description="A mock runner for testing",
            domain=PharmaDomain.MEDICAL_AFFAIRS,
            required_knowledge_layers=[KnowledgeLayer.L1_FUNCTION],
            quality_metrics=[QualityMetric.RELEVANCE, QualityMetric.ACCURACY],
        )
        self._quality_to_return = quality_to_return
        self._execute_count = 0

    async def _execute_core(self, input_data: RunnerInput) -> Dict[str, Any]:
        """Mock execution that returns a simple result"""
        self._execute_count += 1
        return {
            "summary": f"Mock result for: {input_data.task[:50]}",
            "findings": ["Finding 1", "Finding 2"],
            "tokens_used": 100,
            "cost_usd": 0.01,
            "sources": [{"title": "Test Source"}],
        }

    def _validate_output(
        self,
        output: Dict[str, Any],
        input_data: RunnerInput
    ) -> Dict[QualityMetric, float]:
        """Return configured quality scores"""
        return {
            QualityMetric.RELEVANCE: self._quality_to_return,
            QualityMetric.ACCURACY: self._quality_to_return,
        }


# =====================================================
# BASE RUNNER TESTS
# =====================================================

class TestBaseRunner:
    """Test BaseRunner abstract class"""

    def test_runner_initialization(self):
        """Test runner initializes correctly"""
        runner = MockRunner(runner_id="test_runner")
        assert runner.runner_id == "test_runner"
        assert runner.name == "Mock Test Runner"
        assert runner.category == RunnerCategory.INVESTIGATE
        assert runner.domain == PharmaDomain.MEDICAL_AFFAIRS
        assert len(runner.required_knowledge_layers) == 1
        assert len(runner.quality_metrics) == 2

    @pytest.mark.asyncio
    async def test_execute_single_iteration(self):
        """Test execution completes in single iteration when quality is high"""
        runner = MockRunner(quality_to_return=0.90)  # Above 0.80 threshold
        input_data = RunnerInput(task="Test task")

        output = await runner.execute(input_data)

        assert output.iterations_used == 1
        assert output.confidence > 0
        assert "summary" in output.result
        assert runner._execute_count == 1

    @pytest.mark.asyncio
    async def test_execute_multiple_iterations(self):
        """Test execution iterates when quality is below threshold"""
        # Create runner that returns low quality initially
        class IteratingRunner(MockRunner):
            def _validate_output(self, output, input_data):
                # Return low quality on first 2 iterations, then high
                if self._execute_count <= 2:
                    return {
                        QualityMetric.RELEVANCE: 0.6,
                        QualityMetric.ACCURACY: 0.6,
                    }
                return {
                    QualityMetric.RELEVANCE: 0.9,
                    QualityMetric.ACCURACY: 0.9,
                }

        runner = IteratingRunner()
        input_data = RunnerInput(task="Test task", max_iterations=3)

        output = await runner.execute(input_data)

        assert output.iterations_used == 3
        assert runner._execute_count == 3

    @pytest.mark.asyncio
    async def test_execute_respects_max_iterations(self):
        """Test execution stops at max iterations even if quality is low"""
        runner = MockRunner(quality_to_return=0.5)  # Below threshold
        input_data = RunnerInput(task="Test task", max_iterations=2)

        output = await runner.execute(input_data)

        assert output.iterations_used == 2
        assert runner._execute_count == 2

    @pytest.mark.asyncio
    async def test_execute_custom_quality_threshold(self):
        """Test execution respects custom quality threshold"""
        runner = MockRunner(quality_to_return=0.70)

        # Default threshold 0.80 - should iterate
        input1 = RunnerInput(task="Test", max_iterations=2)
        output1 = await runner.execute(input1)

        # Reset count
        runner._execute_count = 0

        # Lower threshold 0.60 - should pass first time
        input2 = RunnerInput(task="Test", quality_threshold=0.60, max_iterations=3)
        output2 = await runner.execute(input2)

        assert output2.iterations_used == 1


class TestQualityCalculations:
    """Test quality score calculations"""

    def test_confidence_calculation_weighted(self):
        """Test confidence uses weighted average"""
        runner = MockRunner()
        quality_scores = {
            QualityMetric.ACCURACY: 1.0,      # weight 1.5
            QualityMetric.FAITHFULNESS: 1.0,  # weight 1.5
            QualityMetric.RELEVANCE: 0.5,     # weight 1.2
        }

        confidence = runner._calculate_confidence(quality_scores)

        # (1.0*1.5 + 1.0*1.5 + 0.5*1.2) / (1.5 + 1.5 + 1.2)
        # = (1.5 + 1.5 + 0.6) / 4.2 = 3.6 / 4.2 ≈ 0.857
        assert 0.85 < confidence < 0.86

    def test_confidence_empty_scores(self):
        """Test confidence with empty scores returns 0"""
        runner = MockRunner()
        confidence = runner._calculate_confidence({})
        assert confidence == 0.0

    def test_feedback_generation(self):
        """Test feedback generated for low scores"""
        runner = MockRunner()
        scores = {
            QualityMetric.RELEVANCE: 0.9,   # Above 0.70, no feedback
            QualityMetric.ACCURACY: 0.5,    # Below 0.70, should generate feedback
        }

        feedback = runner._generate_feedback(scores)

        assert len(feedback) == 1
        assert "accuracy" in feedback[0].lower()


class TestLangGraphIntegration:
    """Test LangGraph node conversion"""

    @pytest.mark.asyncio
    async def test_to_langgraph_node(self):
        """Test runner converts to LangGraph node function"""
        runner = MockRunner(quality_to_return=0.90)
        node_fn = runner.to_langgraph_node()

        # Node function should be callable
        assert callable(node_fn)

        # Test with LangGraph-style state
        state = {
            "task": "Analyze market trends",
            "context": {"region": "US"},
            "knowledge_layers": ["function"],
        }

        result = await node_fn(state)

        # Should return updated state
        assert "runner_result" in result
        assert "runner_confidence" in result
        assert "runner_quality_scores" in result
        # Original state should be preserved
        assert result["task"] == "Analyze market trends"


class TestStreamingExecution:
    """Test streaming execution"""

    @pytest.mark.asyncio
    async def test_execute_streaming_events(self):
        """Test streaming yields expected events"""
        runner = MockRunner(quality_to_return=0.90)
        input_data = RunnerInput(task="Test streaming")

        events = []
        async for event in runner.execute_streaming(input_data):
            events.append(event)

        # Should have start, iteration_start, iteration_complete, complete
        event_types = [e.get("event") for e in events]
        assert "start" in event_types
        assert "iteration_start" in event_types
        assert "iteration_complete" in event_types
        assert "complete" in event_types

    @pytest.mark.asyncio
    async def test_streaming_complete_has_result(self):
        """Test final complete event has full result"""
        runner = MockRunner(quality_to_return=0.90)
        input_data = RunnerInput(task="Test streaming")

        final_event = None
        async for event in runner.execute_streaming(input_data):
            if event.get("event") == "complete":
                final_event = event

        assert final_event is not None
        assert "result" in final_event
        assert "confidence" in final_event
        assert "quality_scores" in final_event


# =====================================================
# EDGE CASE TESTS
# =====================================================

class TestEdgeCases:
    """Test edge cases and error handling"""

    @pytest.mark.asyncio
    async def test_empty_task(self):
        """Test execution with empty task"""
        runner = MockRunner(quality_to_return=0.90)
        input_data = RunnerInput(task="")

        output = await runner.execute(input_data)
        assert output is not None

    @pytest.mark.asyncio
    async def test_very_long_task(self):
        """Test execution with very long task description"""
        runner = MockRunner(quality_to_return=0.90)
        long_task = "Analyze " * 1000  # Very long task
        input_data = RunnerInput(task=long_task)

        output = await runner.execute(input_data)
        assert output is not None

    def test_runner_with_no_domain(self):
        """Test runner can be created without pharma domain"""
        class GenericRunner(BaseRunner):
            def __init__(self):
                super().__init__(
                    runner_id="generic",
                    name="Generic Runner",
                    category=RunnerCategory.SYNTHESIZE,
                    description="A generic runner",
                    domain=None,  # No pharma domain
                )

            async def _execute_core(self, input_data):
                return {"result": "ok"}

            def _validate_output(self, output, input_data):
                return {QualityMetric.RELEVANCE: 0.9}

        runner = GenericRunner()
        assert runner.domain is None
