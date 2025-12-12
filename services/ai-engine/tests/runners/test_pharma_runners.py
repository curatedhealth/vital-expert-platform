"""
Test Suite: Pharmaceutical Domain Runners

Tests for all 12 pharma runners across 6 domain families:
1. FORESIGHT - ForesightRunner, ForesightAdvancedRunner
2. BRAND_STRATEGY - BrandStrategyRunner, BrandStrategyAdvancedRunner
3. DIGITAL_HEALTH - DigitalHealthRunner, DigitalHealthAdvancedRunner
4. MEDICAL_AFFAIRS - MedicalAffairsRunner, MedicalAffairsAdvancedRunner
5. MARKET_ACCESS - MarketAccessRunner, MarketAccessAdvancedRunner
6. DESIGN_THINKING - DesignThinkingRunner, DesignThinkingAdvancedRunner
"""

import pytest
from typing import Dict, Any

from runners.base import (
    RunnerInput,
    RunnerCategory,
    PharmaDomain,
    KnowledgeLayer,
    QualityMetric,
)

# Import pharma runners
from runners.pharma import (
    ForesightRunner,
    ForesightAdvancedRunner,
    BrandStrategyRunner,
    BrandStrategyAdvancedRunner,
    DigitalHealthRunner,
    DigitalHealthAdvancedRunner,
    MedicalAffairsRunner,
    MedicalAffairsAdvancedRunner,
    MarketAccessRunner,
    MarketAccessAdvancedRunner,
    DesignThinkingRunner,
    DesignThinkingAdvancedRunner,
)


# =====================================================
# HELPER FUNCTIONS
# =====================================================

def create_test_input(task: str = "Test pharmaceutical task") -> RunnerInput:
    """Create standard test input for pharma runners"""
    return RunnerInput(
        task=task,
        context={"therapeutic_area": "oncology", "region": "US"},
        knowledge_layers=[KnowledgeLayer.L1_FUNCTION, KnowledgeLayer.L2_SPECIALTY],
        constraints={"max_sources": 5},
    )


# =====================================================
# FORESIGHT FAMILY TESTS
# =====================================================

class TestForesightRunner:
    """Test ForesightRunner"""

    def test_initialization(self):
        """Test runner initializes correctly"""
        runner = ForesightRunner()

        assert runner.runner_id == "foresight_basic"
        assert runner.category == RunnerCategory.INVESTIGATE
        assert runner.domain == PharmaDomain.FORESIGHT
        assert len(runner.required_knowledge_layers) > 0

    @pytest.mark.asyncio
    async def test_execute_returns_foresight_result(self):
        """Test execution returns structured foresight result"""
        runner = ForesightRunner()
        input_data = create_test_input("Analyze emerging trends in CAR-T therapy")

        output = await runner.execute(input_data)

        assert output is not None
        assert output.confidence > 0
        assert output.result is not None
        # Check for expected fields in foresight result
        result = output.result
        assert hasattr(result, 'trends') or isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_quality_metrics(self):
        """Test quality metrics are returned"""
        runner = ForesightRunner()
        input_data = create_test_input("Identify competitive intelligence signals")

        output = await runner.execute(input_data)

        assert len(output.quality_scores) > 0


class TestForesightAdvancedRunner:
    """Test ForesightAdvancedRunner"""

    def test_inherits_from_basic(self):
        """Test advanced runner extends basic"""
        runner = ForesightAdvancedRunner()

        assert runner.runner_id == "foresight_advanced"
        assert runner.domain == PharmaDomain.FORESIGHT
        assert "Advanced" in runner.name or "advanced" in runner.runner_id

    @pytest.mark.asyncio
    async def test_execute(self):
        """Test advanced execution"""
        runner = ForesightAdvancedRunner()
        input_data = create_test_input("Develop 5-year market forecast")

        output = await runner.execute(input_data)

        assert output is not None
        assert output.confidence > 0


# =====================================================
# BRAND STRATEGY FAMILY TESTS
# =====================================================

class TestBrandStrategyRunner:
    """Test BrandStrategyRunner"""

    def test_initialization(self):
        """Test runner initializes correctly"""
        runner = BrandStrategyRunner()

        assert runner.runner_id == "brand_strategy_basic"
        assert runner.domain == PharmaDomain.BRAND_STRATEGY

    @pytest.mark.asyncio
    async def test_execute_returns_brand_result(self):
        """Test execution returns brand strategy result"""
        runner = BrandStrategyRunner()
        input_data = create_test_input("Develop positioning for new oncology drug")

        output = await runner.execute(input_data)

        assert output is not None
        assert output.result is not None


class TestBrandStrategyAdvancedRunner:
    """Test BrandStrategyAdvancedRunner"""

    def test_initialization(self):
        """Test advanced runner initializes correctly"""
        runner = BrandStrategyAdvancedRunner()

        assert runner.runner_id == "brand_strategy_advanced"


# =====================================================
# DIGITAL HEALTH FAMILY TESTS
# =====================================================

class TestDigitalHealthRunner:
    """Test DigitalHealthRunner"""

    def test_initialization(self):
        """Test runner initializes correctly"""
        runner = DigitalHealthRunner()

        assert runner.runner_id == "digital_health_basic"
        assert runner.domain == PharmaDomain.DIGITAL_HEALTH

    @pytest.mark.asyncio
    async def test_execute_returns_digital_health_result(self):
        """Test execution returns digital health result"""
        runner = DigitalHealthRunner()
        input_data = create_test_input("Design patient engagement platform")

        output = await runner.execute(input_data)

        assert output is not None
        assert output.result is not None


class TestDigitalHealthAdvancedRunner:
    """Test DigitalHealthAdvancedRunner"""

    def test_initialization(self):
        """Test advanced runner initializes correctly"""
        runner = DigitalHealthAdvancedRunner()

        assert runner.runner_id == "digital_health_advanced"


# =====================================================
# MEDICAL AFFAIRS FAMILY TESTS
# =====================================================

class TestMedicalAffairsRunner:
    """Test MedicalAffairsRunner"""

    def test_initialization(self):
        """Test runner initializes correctly"""
        runner = MedicalAffairsRunner()

        assert runner.runner_id == "medical_affairs_basic"
        assert runner.domain == PharmaDomain.MEDICAL_AFFAIRS

    @pytest.mark.asyncio
    async def test_execute_returns_medical_affairs_result(self):
        """Test execution returns medical affairs result"""
        runner = MedicalAffairsRunner()
        input_data = create_test_input("Develop KOL engagement strategy")

        output = await runner.execute(input_data)

        assert output is not None
        assert output.result is not None


class TestMedicalAffairsAdvancedRunner:
    """Test MedicalAffairsAdvancedRunner"""

    def test_initialization(self):
        """Test advanced runner initializes correctly"""
        runner = MedicalAffairsAdvancedRunner()

        assert runner.runner_id == "medical_affairs_advanced"


# =====================================================
# MARKET ACCESS FAMILY TESTS
# =====================================================

class TestMarketAccessRunner:
    """Test MarketAccessRunner"""

    def test_initialization(self):
        """Test runner initializes correctly"""
        runner = MarketAccessRunner()

        assert runner.runner_id == "market_access_basic"
        assert runner.domain == PharmaDomain.MARKET_ACCESS

    @pytest.mark.asyncio
    async def test_execute_returns_market_access_result(self):
        """Test execution returns market access result"""
        runner = MarketAccessRunner()
        input_data = create_test_input("Analyze reimbursement landscape")

        output = await runner.execute(input_data)

        assert output is not None
        assert output.result is not None


class TestMarketAccessAdvancedRunner:
    """Test MarketAccessAdvancedRunner"""

    def test_initialization(self):
        """Test advanced runner initializes correctly"""
        runner = MarketAccessAdvancedRunner()

        assert runner.runner_id == "market_access_advanced"


# =====================================================
# DESIGN THINKING FAMILY TESTS
# =====================================================

class TestDesignThinkingRunner:
    """Test DesignThinkingRunner"""

    def test_initialization(self):
        """Test runner initializes correctly"""
        runner = DesignThinkingRunner()

        assert runner.runner_id == "design_thinking_basic"
        assert runner.domain == PharmaDomain.DESIGN_THINKING
        assert runner.category == RunnerCategory.DESIGN

    @pytest.mark.asyncio
    async def test_execute_returns_design_result(self):
        """Test execution returns design thinking result"""
        runner = DesignThinkingRunner()
        input_data = create_test_input("Improve patient onboarding experience")

        output = await runner.execute(input_data)

        assert output is not None
        assert output.result is not None
        # Design thinking should return structured result
        result = output.result
        assert hasattr(result, 'problem_statement') or isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_quality_validation(self):
        """Test quality validation for design thinking"""
        runner = DesignThinkingRunner()
        input_data = create_test_input("Design patient journey map")

        output = await runner.execute(input_data)

        # Should have quality scores
        assert len(output.quality_scores) > 0
        # All scores should be between 0 and 1
        for score in output.quality_scores.values():
            assert 0 <= score <= 1


class TestDesignThinkingAdvancedRunner:
    """Test DesignThinkingAdvancedRunner"""

    def test_initialization(self):
        """Test advanced runner initializes correctly"""
        runner = DesignThinkingAdvancedRunner()

        assert runner.runner_id == "design_thinking_advanced"
        assert runner.domain == PharmaDomain.DESIGN_THINKING

    def test_extended_system_prompt(self):
        """Test advanced runner has extended prompt"""
        basic = DesignThinkingRunner()
        advanced = DesignThinkingAdvancedRunner()

        # Advanced should have additional prompt content
        assert len(advanced._system_prompt) > len(basic._system_prompt)


# =====================================================
# CROSS-FAMILY TESTS
# =====================================================

class TestAllPharmaRunners:
    """Cross-cutting tests for all pharma runners"""

    @pytest.fixture
    def all_runners(self):
        """Get instances of all pharma runners"""
        return [
            ForesightRunner(),
            ForesightAdvancedRunner(),
            BrandStrategyRunner(),
            BrandStrategyAdvancedRunner(),
            DigitalHealthRunner(),
            DigitalHealthAdvancedRunner(),
            MedicalAffairsRunner(),
            MedicalAffairsAdvancedRunner(),
            MarketAccessRunner(),
            MarketAccessAdvancedRunner(),
            DesignThinkingRunner(),
            DesignThinkingAdvancedRunner(),
        ]

    def test_all_have_pharma_domain(self, all_runners):
        """All pharma runners should have a pharma domain"""
        for runner in all_runners:
            assert runner.domain is not None
            assert isinstance(runner.domain, PharmaDomain)

    def test_all_have_unique_ids(self, all_runners):
        """All runners should have unique IDs"""
        ids = [r.runner_id for r in all_runners]
        assert len(ids) == len(set(ids)), "Duplicate runner IDs found"

    def test_all_have_required_knowledge_layers(self, all_runners):
        """All runners should specify required knowledge layers"""
        for runner in all_runners:
            assert len(runner.required_knowledge_layers) > 0

    def test_all_have_quality_metrics(self, all_runners):
        """All runners should specify quality metrics"""
        for runner in all_runners:
            assert len(runner.quality_metrics) > 0

    def test_basic_advanced_pairs(self, all_runners):
        """Each domain should have basic and advanced variants"""
        domains = set(r.domain for r in all_runners)

        for domain in domains:
            domain_runners = [r for r in all_runners if r.domain == domain]
            ids = [r.runner_id for r in domain_runners]

            # Should have both basic and advanced
            has_basic = any("basic" in id for id in ids)
            has_advanced = any("advanced" in id for id in ids)

            assert has_basic, f"Missing basic runner for {domain}"
            assert has_advanced, f"Missing advanced runner for {domain}"

    @pytest.mark.asyncio
    async def test_all_execute_without_error(self, all_runners):
        """All runners should execute without error"""
        input_data = create_test_input()

        for runner in all_runners:
            try:
                output = await runner.execute(input_data)
                assert output is not None
            except Exception as e:
                pytest.fail(f"Runner {runner.runner_id} failed: {e}")


# =====================================================
# RESULT MODEL TESTS
# =====================================================

class TestPharmaResultModels:
    """Test result models from pharma runners"""

    @pytest.mark.asyncio
    async def test_design_thinking_result_structure(self):
        """Test DesignThinkingResult has expected structure"""
        runner = DesignThinkingRunner()
        input_data = create_test_input("Improve patient experience")

        output = await runner.execute(input_data)
        result = output.result

        # Should have key design thinking fields
        if hasattr(result, 'context'):
            assert result.context is not None
        if hasattr(result, 'user_insights'):
            assert isinstance(result.user_insights, list)
        if hasattr(result, 'journey_map'):
            assert isinstance(result.journey_map, list)
        if hasattr(result, 'design_concepts'):
            assert isinstance(result.design_concepts, list)


# =====================================================
# EDGE CASES
# =====================================================

class TestPharmaEdgeCases:
    """Test edge cases for pharma runners"""

    @pytest.mark.asyncio
    async def test_empty_context(self):
        """Test execution with empty context"""
        runner = DesignThinkingRunner()
        input_data = RunnerInput(task="Test task")

        output = await runner.execute(input_data)
        assert output is not None

    @pytest.mark.asyncio
    async def test_very_long_task(self):
        """Test execution with very long task"""
        runner = ForesightRunner()
        long_task = "Analyze market trends for " + ("competitive landscape " * 100)
        input_data = RunnerInput(task=long_task)

        output = await runner.execute(input_data)
        assert output is not None

    @pytest.mark.asyncio
    async def test_streaming_execution(self):
        """Test streaming execution for pharma runner"""
        runner = DesignThinkingRunner()
        input_data = create_test_input("Design patient journey")

        events = []
        async for event in runner.execute_streaming(input_data):
            events.append(event)

        assert len(events) > 0
        assert any(e.get("event") == "start" for e in events)
        assert any(e.get("event") == "complete" for e in events)
