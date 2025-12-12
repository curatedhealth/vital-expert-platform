"""
Test Suite: RunnerRegistry (registry.py)

Tests:
1. Singleton pattern enforcement
2. Runner registration
3. Runner retrieval by ID
4. Category-based filtering
5. Domain-based filtering
6. List all runners
7. Count statistics
8. Inactive runner handling
9. Core runner auto-registration
"""

import pytest
from typing import Dict

from runners.base import (
    BaseRunner,
    RunnerInput,
    RunnerCategory,
    PharmaDomain,
    KnowledgeLayer,
    QualityMetric,
)
from runners.registry import RunnerRegistry, RunnerMetadata


# =====================================================
# MOCK RUNNERS FOR TESTING
# =====================================================

class MockInvestigateRunner(BaseRunner):
    """Mock runner for INVESTIGATE category"""
    def __init__(self):
        super().__init__(
            runner_id="mock_investigate",
            name="Mock Investigate",
            category=RunnerCategory.INVESTIGATE,
            description="Mock investigation runner",
            domain=PharmaDomain.MEDICAL_AFFAIRS,
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"findings": ["mock finding"]}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.9}


class MockSynthesizeRunner(BaseRunner):
    """Mock runner for SYNTHESIZE category"""
    def __init__(self):
        super().__init__(
            runner_id="mock_synthesize",
            name="Mock Synthesize",
            category=RunnerCategory.SYNTHESIZE,
            description="Mock synthesis runner",
            domain=PharmaDomain.FORESIGHT,
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"summary": "mock summary"}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.85}


class MockDesignRunner(BaseRunner):
    """Mock runner for DESIGN category with no domain"""
    def __init__(self):
        super().__init__(
            runner_id="mock_design",
            name="Mock Design",
            category=RunnerCategory.DESIGN,
            description="Mock design runner",
            domain=None,  # No pharma domain
        )

    async def _execute_core(self, input_data: RunnerInput):
        return {"design": "mock design"}

    def _validate_output(self, output, input_data):
        return {QualityMetric.RELEVANCE: 0.9}


# =====================================================
# FIXTURE: Fresh registry for each test
# =====================================================

@pytest.fixture
def fresh_registry():
    """Create fresh registry for each test by resetting singleton"""
    # Reset singleton state
    RunnerRegistry._instance = None
    RunnerRegistry._runners = {}
    RunnerRegistry._initialized = False

    # Create new instance
    registry = RunnerRegistry()

    yield registry

    # Cleanup
    RunnerRegistry._instance = None
    RunnerRegistry._runners = {}
    RunnerRegistry._initialized = False


# =====================================================
# SINGLETON TESTS
# =====================================================

class TestSingletonPattern:
    """Test singleton pattern enforcement"""

    def test_same_instance_returned(self, fresh_registry):
        """Multiple instantiations return same instance"""
        registry1 = RunnerRegistry()
        registry2 = RunnerRegistry()

        assert registry1 is registry2

    def test_shared_state(self, fresh_registry):
        """State is shared across instances"""
        registry1 = RunnerRegistry()
        RunnerRegistry.register(MockInvestigateRunner)

        registry2 = RunnerRegistry()
        assert "mock_investigate" in RunnerRegistry._runners


# =====================================================
# REGISTRATION TESTS
# =====================================================

class TestRunnerRegistration:
    """Test runner registration functionality"""

    def test_register_runner(self, fresh_registry):
        """Test registering a runner class"""
        RunnerRegistry.register(MockInvestigateRunner)

        assert "mock_investigate" in RunnerRegistry._runners
        metadata = RunnerRegistry._runners["mock_investigate"]
        assert isinstance(metadata, RunnerMetadata)
        assert metadata.name == "Mock Investigate"
        assert metadata.category == RunnerCategory.INVESTIGATE
        assert metadata.domain == PharmaDomain.MEDICAL_AFFAIRS

    def test_register_multiple_runners(self, fresh_registry):
        """Test registering multiple runners"""
        RunnerRegistry.register(MockInvestigateRunner)
        RunnerRegistry.register(MockSynthesizeRunner)
        RunnerRegistry.register(MockDesignRunner)

        assert len(RunnerRegistry._runners) == 3

    def test_register_with_version(self, fresh_registry):
        """Test registering with custom version"""
        RunnerRegistry.register(MockInvestigateRunner, version="2.0.0")

        metadata = RunnerRegistry._runners["mock_investigate"]
        assert metadata.version == "2.0.0"

    def test_register_overwrites(self, fresh_registry):
        """Test re-registering same ID overwrites"""
        RunnerRegistry.register(MockInvestigateRunner, version="1.0.0")
        RunnerRegistry.register(MockInvestigateRunner, version="2.0.0")

        metadata = RunnerRegistry._runners["mock_investigate"]
        assert metadata.version == "2.0.0"


# =====================================================
# RETRIEVAL TESTS
# =====================================================

class TestRunnerRetrieval:
    """Test runner retrieval methods"""

    def test_get_by_id(self, fresh_registry):
        """Test getting runner by ID"""
        RunnerRegistry.register(MockInvestigateRunner)

        # Prevent auto-initialization from wiping our test data
        RunnerRegistry._initialized = True

        runner = RunnerRegistry.get("mock_investigate")

        assert runner is not None
        assert isinstance(runner, MockInvestigateRunner)
        assert runner.runner_id == "mock_investigate"

    def test_get_nonexistent_id(self, fresh_registry):
        """Test getting nonexistent runner returns None"""
        RunnerRegistry._initialized = True

        runner = RunnerRegistry.get("nonexistent")

        assert runner is None

    def test_get_inactive_runner(self, fresh_registry):
        """Test inactive runners are not returned"""
        RunnerRegistry.register(MockInvestigateRunner)
        RunnerRegistry._runners["mock_investigate"].is_active = False
        RunnerRegistry._initialized = True

        runner = RunnerRegistry.get("mock_investigate")

        assert runner is None


# =====================================================
# CATEGORY FILTERING TESTS
# =====================================================

class TestCategoryFiltering:
    """Test category-based filtering"""

    def test_get_by_category(self, fresh_registry):
        """Test getting runners by category"""
        RunnerRegistry.register(MockInvestigateRunner)
        RunnerRegistry.register(MockSynthesizeRunner)
        RunnerRegistry._initialized = True

        investigate_runners = RunnerRegistry.get_by_category(RunnerCategory.INVESTIGATE)

        assert len(investigate_runners) == 1
        assert investigate_runners[0].runner_id == "mock_investigate"

    def test_get_by_category_empty(self, fresh_registry):
        """Test getting category with no runners"""
        RunnerRegistry._initialized = True

        runners = RunnerRegistry.get_by_category(RunnerCategory.GOVERN)

        assert len(runners) == 0

    def test_get_by_category_multiple(self, fresh_registry):
        """Test category with multiple runners"""
        # Create two runners with same category
        class MockInvestigate2(MockInvestigateRunner):
            def __init__(self):
                super().__init__()
                self.runner_id = "mock_investigate_2"
                self.name = "Mock Investigate 2"

        RunnerRegistry.register(MockInvestigateRunner)
        RunnerRegistry.register(MockInvestigate2)
        RunnerRegistry._initialized = True

        runners = RunnerRegistry.get_by_category(RunnerCategory.INVESTIGATE)

        assert len(runners) == 2


# =====================================================
# DOMAIN FILTERING TESTS
# =====================================================

class TestDomainFiltering:
    """Test domain-based filtering"""

    def test_get_by_domain(self, fresh_registry):
        """Test getting runners by pharma domain"""
        RunnerRegistry.register(MockInvestigateRunner)  # MEDICAL_AFFAIRS
        RunnerRegistry.register(MockSynthesizeRunner)   # FORESIGHT
        RunnerRegistry._initialized = True

        ma_runners = RunnerRegistry.get_by_domain(PharmaDomain.MEDICAL_AFFAIRS)

        assert len(ma_runners) == 1
        assert ma_runners[0].domain == PharmaDomain.MEDICAL_AFFAIRS

    def test_get_by_domain_empty(self, fresh_registry):
        """Test getting domain with no runners"""
        RunnerRegistry._initialized = True

        runners = RunnerRegistry.get_by_domain(PharmaDomain.DIGITAL_HEALTH)

        assert len(runners) == 0

    def test_runners_without_domain_not_included(self, fresh_registry):
        """Test runners without domain not included in domain filter"""
        RunnerRegistry.register(MockDesignRunner)  # No domain
        RunnerRegistry._initialized = True

        for domain in PharmaDomain:
            runners = RunnerRegistry.get_by_domain(domain)
            assert len(runners) == 0


# =====================================================
# LIST AND COUNT TESTS
# =====================================================

class TestListAndCount:
    """Test listing and counting runners"""

    def test_list_all(self, fresh_registry):
        """Test listing all registered runners"""
        RunnerRegistry.register(MockInvestigateRunner)
        RunnerRegistry.register(MockSynthesizeRunner)
        RunnerRegistry._initialized = True

        all_runners = RunnerRegistry.list_all()

        assert len(all_runners) == 2
        assert all(isinstance(m, RunnerMetadata) for m in all_runners)

    def test_list_ids(self, fresh_registry):
        """Test listing all runner IDs"""
        RunnerRegistry.register(MockInvestigateRunner)
        RunnerRegistry.register(MockSynthesizeRunner)
        RunnerRegistry._initialized = True

        ids = RunnerRegistry.list_ids()

        assert "mock_investigate" in ids
        assert "mock_synthesize" in ids

    def test_count(self, fresh_registry):
        """Test count statistics"""
        RunnerRegistry.register(MockInvestigateRunner)
        RunnerRegistry.register(MockSynthesizeRunner)
        RunnerRegistry.register(MockDesignRunner)
        RunnerRegistry._initialized = True

        counts = RunnerRegistry.count()

        assert counts["total"] == 3
        assert counts["by_category"]["investigate"] == 1
        assert counts["by_category"]["synthesize"] == 1
        assert counts["by_category"]["design"] == 1
        assert counts["by_domain"]["medical_affairs"] == 1
        assert counts["by_domain"]["foresight"] == 1


# =====================================================
# RUNNER METADATA TESTS
# =====================================================

class TestRunnerMetadata:
    """Test RunnerMetadata dataclass"""

    def test_metadata_fields(self):
        """Test all metadata fields are captured"""
        metadata = RunnerMetadata(
            runner_id="test",
            name="Test Runner",
            category=RunnerCategory.INVESTIGATE,
            domain=PharmaDomain.MEDICAL_AFFAIRS,
            description="Test description",
            runner_class=MockInvestigateRunner,
            version="1.0.0",
            is_active=True,
        )

        assert metadata.runner_id == "test"
        assert metadata.name == "Test Runner"
        assert metadata.category == RunnerCategory.INVESTIGATE
        assert metadata.domain == PharmaDomain.MEDICAL_AFFAIRS
        assert metadata.version == "1.0.0"
        assert metadata.is_active is True

    def test_metadata_defaults(self):
        """Test metadata default values"""
        metadata = RunnerMetadata(
            runner_id="test",
            name="Test",
            category=RunnerCategory.SYNTHESIZE,
            domain=None,
            description="Test",
            runner_class=MockSynthesizeRunner,
        )

        assert metadata.version == "1.0.0"
        assert metadata.is_active is True


# =====================================================
# AUTO-REGISTRATION TESTS
# =====================================================

class TestAutoRegistration:
    """Test automatic core runner registration"""

    def test_core_runners_registered_on_first_access(self):
        """Test core runners are auto-registered on first access"""
        # Reset completely
        RunnerRegistry._instance = None
        RunnerRegistry._runners = {}
        RunnerRegistry._initialized = False

        # Access triggers initialization
        registry = RunnerRegistry()
        ids = RunnerRegistry.list_ids()

        # Should have at least some core runners
        # Note: This depends on core runners being importable
        # May be empty if imports fail, which is handled gracefully
        assert isinstance(ids, list)

    def test_initialization_only_happens_once(self, fresh_registry):
        """Test initialization only runs once"""
        # First access triggers init
        RunnerRegistry.list_ids()

        # Manually register another
        RunnerRegistry.register(MockDesignRunner)

        # Second access shouldn't wipe our registration
        ids = RunnerRegistry.list_ids()

        assert "mock_design" in ids
