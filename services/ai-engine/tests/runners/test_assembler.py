"""
Test Suite: TaskAssembler (assembler.py)

Tests:
1. PersonaConfig dataclass
2. KnowledgeConfig dataclass
3. ContextConfig dataclass
4. AssembledTask dataclass
5. AssembledTask.to_runner_input() conversion
6. TaskAssembler.assemble() method
7. TaskAssembler.auto_select_runner() classification
8. TaskAssembler.execute_assembled() method
9. Error handling for missing runners
10. Knowledge layer validation warnings
"""

import pytest
from typing import Dict, Any

from runners.base import (
    BaseRunner,
    RunnerInput,
    RunnerCategory,
    PharmaDomain,
    KnowledgeLayer,
    QualityMetric,
)
from runners.registry import RunnerRegistry
from runners.assembler import (
    TaskAssembler,
    PersonaConfig,
    KnowledgeConfig,
    ContextConfig,
    AssembledTask,
)


# =====================================================
# MOCK RUNNER FOR TESTING
# =====================================================

class MockTestRunner(BaseRunner):
    """Mock runner for assembler tests"""

    def __init__(self, runner_id: str = "mock_test_runner"):
        super().__init__(
            runner_id=runner_id,
            name="Mock Test Runner",
            category=RunnerCategory.SYNTHESIZE,
            description="A mock runner for testing assembler",
            domain=PharmaDomain.MEDICAL_AFFAIRS,
            required_knowledge_layers=[KnowledgeLayer.L1_FUNCTION],
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {
            "summary": f"Executed: {input_data.task[:50]}",
            "tokens_used": 100,
        }

    def _validate_output(self, output, input_data):
        return {
            QualityMetric.RELEVANCE: 0.9,
            QualityMetric.ACCURACY: 0.85,
        }


# =====================================================
# FIXTURE: Register mock runner
# =====================================================

@pytest.fixture
def registered_mock_runner():
    """Register mock runner for tests"""
    # Reset registry completely
    RunnerRegistry._instance = None
    RunnerRegistry._runners = {}
    RunnerRegistry._initialized = False

    # Create new singleton
    registry = RunnerRegistry()

    # Set initialized to prevent core runner registration
    RunnerRegistry._initialized = True

    # Register our mock
    RunnerRegistry.register(MockTestRunner)

    yield

    # Cleanup
    RunnerRegistry._instance = None
    RunnerRegistry._runners = {}
    RunnerRegistry._initialized = False


# =====================================================
# DATACLASS TESTS
# =====================================================

class TestPersonaConfig:
    """Test PersonaConfig dataclass"""

    def test_minimal_persona(self):
        """Test creating persona with required fields only"""
        persona = PersonaConfig(
            persona_id="analyst_1",
            name="Market Analyst",
            archetype="Analyst",
            tone="professional",
        )

        assert persona.persona_id == "analyst_1"
        assert persona.name == "Market Analyst"
        assert persona.archetype == "Analyst"
        assert persona.tone == "professional"
        assert persona.expertise_areas == []
        assert persona.behavioral_traits == {}

    def test_full_persona(self):
        """Test creating persona with all fields"""
        persona = PersonaConfig(
            persona_id="strategist_1",
            name="Senior Strategist",
            archetype="Strategist",
            tone="advisory",
            expertise_areas=["competitive_analysis", "market_trends"],
            behavioral_traits={
                "thoroughness": "high",
                "risk_tolerance": "moderate",
            },
        )

        assert len(persona.expertise_areas) == 2
        assert persona.behavioral_traits["thoroughness"] == "high"


class TestKnowledgeConfig:
    """Test KnowledgeConfig dataclass"""

    def test_minimal_knowledge(self):
        """Test creating knowledge config with defaults"""
        knowledge = KnowledgeConfig()

        assert knowledge.layers == []
        assert knowledge.domains == []
        assert knowledge.sources == []
        assert knowledge.rag_enabled is True
        assert knowledge.web_search_enabled is True

    def test_full_knowledge(self):
        """Test creating knowledge config with all fields"""
        knowledge = KnowledgeConfig(
            layers=[KnowledgeLayer.L0_INDUSTRY, KnowledgeLayer.L1_FUNCTION],
            domains=["oncology", "immunotherapy"],
            sources=[{"type": "rag", "namespace": "pharma_kb"}],
            rag_enabled=True,
            web_search_enabled=False,
        )

        assert len(knowledge.layers) == 2
        assert KnowledgeLayer.L0_INDUSTRY in knowledge.layers
        assert "oncology" in knowledge.domains
        assert len(knowledge.sources) == 1
        assert knowledge.web_search_enabled is False


class TestContextConfig:
    """Test ContextConfig dataclass"""

    def test_minimal_context(self):
        """Test creating context with defaults"""
        context = ContextConfig()

        assert context.mission_id is None
        assert context.session_id is None
        assert context.tenant_id is None
        assert context.user_id is None
        assert context.constraints == {}
        assert context.history == []
        assert context.goals == []

    def test_full_context(self):
        """Test creating context with all fields"""
        context = ContextConfig(
            mission_id="mission_123",
            session_id="session_456",
            tenant_id="tenant_789",
            user_id="user_abc",
            constraints={"max_tokens": 2000},
            history=[{"role": "user", "content": "Previous message"}],
            goals=["Analyze market", "Identify trends"],
        )

        assert context.mission_id == "mission_123"
        assert context.tenant_id == "tenant_789"
        assert len(context.history) == 1
        assert len(context.goals) == 2


class TestAssembledTask:
    """Test AssembledTask dataclass"""

    def test_assembled_task_creation(self, registered_mock_runner):
        """Test creating an assembled task"""
        runner = RunnerRegistry.get("mock_test_runner")
        persona = PersonaConfig(
            persona_id="test",
            name="Test Persona",
            archetype="Analyst",
            tone="professional",
        )
        knowledge = KnowledgeConfig(layers=[KnowledgeLayer.L1_FUNCTION])
        context = ContextConfig(session_id="test_session")

        assembled = AssembledTask(
            task="Analyze competitive landscape",
            runner=runner,
            persona=persona,
            knowledge=knowledge,
            context=context,
        )

        assert assembled.task == "Analyze competitive landscape"
        assert assembled.runner is runner
        assert assembled.persona.persona_id == "test"


class TestAssembledTaskToRunnerInput:
    """Test AssembledTask.to_runner_input() conversion"""

    def test_to_runner_input(self, registered_mock_runner):
        """Test conversion to RunnerInput"""
        runner = RunnerRegistry.get("mock_test_runner")
        persona = PersonaConfig(
            persona_id="analyst_1",
            name="Market Analyst",
            archetype="Analyst",
            tone="advisory",
        )
        knowledge = KnowledgeConfig(
            layers=[KnowledgeLayer.L1_FUNCTION, KnowledgeLayer.L2_SPECIALTY],
            sources=[{"type": "rag", "namespace": "kb1"}],
        )
        context = ContextConfig(
            mission_id="m123",
            session_id="s456",
            tenant_id="t789",
            constraints={"max_sources": 5},
            history=[{"msg": "hi"}],
        )

        assembled = AssembledTask(
            task="Research oncology trends",
            runner=runner,
            persona=persona,
            knowledge=knowledge,
            context=context,
        )

        runner_input = assembled.to_runner_input()

        # Check conversion
        assert runner_input.task == "Research oncology trends"
        assert runner_input.persona_id == "analyst_1"
        assert len(runner_input.knowledge_layers) == 2
        assert runner_input.constraints["max_sources"] == 5

        # Check context embedding
        assert runner_input.context["persona"]["id"] == "analyst_1"
        assert runner_input.context["persona"]["archetype"] == "Analyst"
        assert runner_input.context["mission_id"] == "m123"
        assert runner_input.context["session_id"] == "s456"


# =====================================================
# TASK ASSEMBLER TESTS
# =====================================================

class TestTaskAssembler:
    """Test TaskAssembler class"""

    def test_assembler_initialization(self):
        """Test assembler initializes correctly"""
        assembler = TaskAssembler()
        assert assembler.registry is not None

    @pytest.mark.asyncio
    async def test_assemble_success(self, registered_mock_runner):
        """Test successful task assembly"""
        assembler = TaskAssembler()

        persona = PersonaConfig(
            persona_id="test",
            name="Test",
            archetype="Analyst",
            tone="professional",
        )
        knowledge = KnowledgeConfig(layers=[KnowledgeLayer.L1_FUNCTION])
        context = ContextConfig()

        assembled = await assembler.assemble(
            task="Test task",
            runner_id="mock_test_runner",
            persona=persona,
            knowledge=knowledge,
            context=context,
        )

        assert assembled.task == "Test task"
        assert assembled.runner.runner_id == "mock_test_runner"
        assert assembled.persona.persona_id == "test"

    @pytest.mark.asyncio
    async def test_assemble_runner_not_found(self, registered_mock_runner):
        """Test assembly fails gracefully for missing runner"""
        assembler = TaskAssembler()

        persona = PersonaConfig(
            persona_id="test",
            name="Test",
            archetype="Analyst",
            tone="professional",
        )
        knowledge = KnowledgeConfig()
        context = ContextConfig()

        with pytest.raises(ValueError, match="Runner not found"):
            await assembler.assemble(
                task="Test task",
                runner_id="nonexistent_runner",
                persona=persona,
                knowledge=knowledge,
                context=context,
            )


# =====================================================
# AUTO-SELECT RUNNER TESTS
# =====================================================

class TestAutoSelectRunner:
    """Test automatic runner selection based on task classification"""

    @pytest.mark.asyncio
    async def test_auto_select_critique(self):
        """Test auto-select for critique tasks"""
        assembler = TaskAssembler()
        context = ContextConfig()

        tasks = [
            "Review the clinical trial design",
            "Assess the market positioning strategy",
            "Evaluate the competitive landscape",
            "Critique the pricing model",
        ]

        for task in tasks:
            runner_id = await assembler.auto_select_runner(task, context)
            assert runner_id == "critique_basic", f"Failed for: {task}"

    @pytest.mark.asyncio
    async def test_auto_select_synthesize(self):
        """Test auto-select for synthesis tasks"""
        assembler = TaskAssembler()
        context = ContextConfig()

        tasks = [
            "Combine the research findings",
            "Synthesize the market data",
            "Summarize the key insights",
            "Integrate multiple data sources",
        ]

        for task in tasks:
            runner_id = await assembler.auto_select_runner(task, context)
            assert runner_id == "synthesize_basic", f"Failed for: {task}"

    @pytest.mark.asyncio
    async def test_auto_select_decompose(self):
        """Test auto-select for decomposition tasks"""
        assembler = TaskAssembler()
        context = ContextConfig()

        tasks = [
            "Break down the market analysis",
            "Decompose the problem into steps",
            "Plan the research approach",
            "Structure the analysis framework",
        ]

        for task in tasks:
            runner_id = await assembler.auto_select_runner(task, context)
            assert runner_id == "decompose_basic", f"Failed for: {task}"

    @pytest.mark.asyncio
    async def test_auto_select_validate(self):
        """Test auto-select for validation tasks"""
        assembler = TaskAssembler()
        context = ContextConfig()

        tasks = [
            "Validate the research methodology",
            "Verify the data accuracy",
            "Check the compliance status",
            "Ensure quality standards",
        ]

        for task in tasks:
            runner_id = await assembler.auto_select_runner(task, context)
            assert runner_id == "validate_basic", f"Failed for: {task}"

    @pytest.mark.asyncio
    async def test_auto_select_investigate(self):
        """Test auto-select for investigation tasks"""
        assembler = TaskAssembler()
        context = ContextConfig()

        tasks = [
            "Research the oncology market",
            "Investigate competitor strategies",
            "Explore new therapeutic areas",
            "Find relevant publications",
        ]

        for task in tasks:
            runner_id = await assembler.auto_select_runner(task, context)
            assert runner_id == "investigate_basic", f"Failed for: {task}"

    @pytest.mark.asyncio
    async def test_auto_select_recommend(self):
        """Test auto-select for recommendation tasks"""
        assembler = TaskAssembler()
        context = ContextConfig()

        tasks = [
            "Recommend a market entry strategy",
            "Suggest pricing approaches",
            "Advise on regulatory pathway",
            "Propose partnership opportunities",
        ]

        for task in tasks:
            runner_id = await assembler.auto_select_runner(task, context)
            assert runner_id == "recommend_basic", f"Failed for: {task}"

    @pytest.mark.asyncio
    async def test_auto_select_predict(self):
        """Test auto-select for prediction tasks"""
        assembler = TaskAssembler()
        context = ContextConfig()

        tasks = [
            "Predict market growth",
            "Forecast competitive dynamics",
            "Estimate future revenue",
        ]

        for task in tasks:
            runner_id = await assembler.auto_select_runner(task, context)
            assert runner_id == "predict_basic", f"Failed for: {task}"

    @pytest.mark.asyncio
    async def test_auto_select_default(self):
        """Test auto-select defaults to synthesize for ambiguous tasks"""
        assembler = TaskAssembler()
        context = ContextConfig()

        # Ambiguous task with no clear keywords
        runner_id = await assembler.auto_select_runner(
            "Process the quarterly data",
            context,
        )

        assert runner_id == "synthesize_basic"


# =====================================================
# EXECUTE ASSEMBLED TESTS
# =====================================================

class TestExecuteAssembled:
    """Test execute_assembled method"""

    @pytest.mark.asyncio
    async def test_execute_assembled_success(self, registered_mock_runner):
        """Test executing an assembled task"""
        assembler = TaskAssembler()

        persona = PersonaConfig(
            persona_id="test",
            name="Test",
            archetype="Analyst",
            tone="professional",
        )
        knowledge = KnowledgeConfig(layers=[KnowledgeLayer.L1_FUNCTION])
        context = ContextConfig()

        assembled = await assembler.assemble(
            task="Analyze market trends",
            runner_id="mock_test_runner",
            persona=persona,
            knowledge=knowledge,
            context=context,
        )

        result = await assembler.execute_assembled(assembled)

        # Check result structure
        assert "result" in result
        assert "confidence" in result
        assert "quality_scores" in result
        assert result["result"]["summary"].startswith("Executed:")


# =====================================================
# EDGE CASES
# =====================================================

class TestAssemblerEdgeCases:
    """Test edge cases and error handling"""

    @pytest.mark.asyncio
    async def test_empty_task(self, registered_mock_runner):
        """Test assembly with empty task"""
        assembler = TaskAssembler()

        persona = PersonaConfig(
            persona_id="test",
            name="Test",
            archetype="Analyst",
            tone="professional",
        )
        knowledge = KnowledgeConfig()
        context = ContextConfig()

        assembled = await assembler.assemble(
            task="",
            runner_id="mock_test_runner",
            persona=persona,
            knowledge=knowledge,
            context=context,
        )

        assert assembled.task == ""

    @pytest.mark.asyncio
    async def test_auto_select_case_insensitive(self):
        """Test auto-select is case insensitive"""
        assembler = TaskAssembler()
        context = ContextConfig()

        # All should match investigate
        tasks = [
            "RESEARCH the market",
            "Research the market",
            "research the market",
            "ReSeArCh the market",
        ]

        for task in tasks:
            runner_id = await assembler.auto_select_runner(task, context)
            assert runner_id == "investigate_basic", f"Failed for: {task}"
