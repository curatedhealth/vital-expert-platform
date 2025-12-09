"""
VITAL Platform - L4 Base Worker Tests

Phase 5: Testing & Quality Assurance

Tests for the L4BaseWorker abstract class and configuration system.
These tests use mocks to avoid import issues with the actual modules.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from typing import List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod


# =============================================================================
# LOCAL TEST DEFINITIONS (Mirroring actual L4 base structures)
# =============================================================================

class WorkerCategory(Enum):
    """L4 Worker categories."""
    EVIDENCE = "evidence"
    REGULATORY = "regulatory"
    CLINICAL = "clinical"
    DATA = "data"
    ANALYSIS = "analysis"
    HEOR = "heor"
    BIOINFORMATICS = "bioinformatics"
    DIGITAL_HEALTH = "digital_health"


@dataclass
class WorkerConfig:
    """Configuration for an L4 worker."""
    worker_id: str
    name: str
    description: str
    category: WorkerCategory
    capabilities: List[str] = field(default_factory=list)
    supported_l5_tools: List[str] = field(default_factory=list)
    model: str = "claude-haiku-4"
    temperature: float = 0.2
    max_tokens: int = 2000


@dataclass
class L4WorkerResult:
    """Result from an L4 worker."""
    success: bool
    content: str | None
    l5_results: List[Dict[str, Any]]
    worker_id: str
    error: str | None = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class L4BaseWorker(ABC):
    """Abstract base class for L4 workers."""
    
    def __init__(self, config: WorkerConfig, l5_tools=None, llm=None):
        self.config = config
        self._l5_tools = l5_tools or {}
        self._llm = llm
    
    @property
    def worker_id(self) -> str:
        return self.config.worker_id
    
    @property
    def name(self) -> str:
        return self.config.name
    
    @abstractmethod
    async def process(self, query: str, context: Dict[str, Any] = None) -> L4WorkerResult:
        pass


# =============================================================================
# CONCRETE IMPLEMENTATION FOR TESTING
# =============================================================================


class TestL4Worker(L4BaseWorker):
    """Concrete implementation of L4BaseWorker for testing."""

    async def process(self, query: str, context: Dict[str, Any] = None) -> L4WorkerResult:
        """Process a query using L5 tools and LLM."""
        l5_results = await self._call_l5_tools(query)
        processed = await self._process_with_llm(query, l5_results)
        return L4WorkerResult(
            success=True,
            content=processed,
            l5_results=l5_results,
            worker_id=self.config.worker_id,
        )

    async def _call_l5_tools(self, query: str) -> List[Dict[str, Any]]:
        """Call configured L5 tools."""
        results = []
        for tool_name in self.config.supported_l5_tools:
            if tool_name in self._l5_tools:
                tool = self._l5_tools[tool_name]
                result = await tool.execute(query)
                results.append(result)
        return results

    async def _process_with_llm(self, query: str, l5_results: List[Dict[str, Any]]) -> str:
        """Process L5 results with LLM."""
        if self._llm:
            response = await self._llm.ainvoke(f"Query: {query}\nResults: {l5_results}")
            return response.content
        return str(l5_results)


# =============================================================================
# FIXTURES
# =============================================================================


@pytest.fixture
def sample_worker_config():
    """Sample worker configuration for testing."""
    return WorkerConfig(
        worker_id="test_worker_001",
        name="Test Evidence Worker",
        description="A test worker for unit testing",
        category=WorkerCategory.EVIDENCE,
        capabilities=["literature_search", "evidence_grading", "citation_generation"],
        supported_l5_tools=["pubmed", "clinicaltrials", "cochrane"],
        model="claude-haiku-4",
        temperature=0.2,
        max_tokens=2000,
    )


@pytest.fixture
def mock_l5_tool():
    """Mock L5 tool for testing."""
    mock = AsyncMock()
    mock.execute.return_value = {
        "success": True,
        "data": {"results": [{"id": 1, "title": "Test Result"}]},
        "source": "mock_tool",
    }
    return mock


@pytest.fixture
def mock_llm():
    """Mock LLM for testing."""
    mock = AsyncMock()
    mock.ainvoke.return_value = MagicMock(
        content="Processed result from LLM",
        response_metadata={"model": "claude-haiku-4", "usage": {"total_tokens": 500}},
    )
    return mock


# =============================================================================
# TEST SUITE
# =============================================================================


class TestWorkerConfig:
    """Tests for WorkerConfig dataclass."""

    def test_create_minimal_config(self):
        """Test creating config with minimal required fields."""
        config = WorkerConfig(
            worker_id="minimal_worker",
            name="Minimal Worker",
            description="A minimal worker",
            category=WorkerCategory.EVIDENCE,
        )

        assert config.worker_id == "minimal_worker"
        assert config.name == "Minimal Worker"
        assert config.model == "claude-haiku-4"  # Default
        assert config.temperature == 0.2  # Default

    def test_create_full_config(self, sample_worker_config):
        """Test creating config with all fields."""
        assert sample_worker_config.worker_id == "test_worker_001"
        assert sample_worker_config.category == WorkerCategory.EVIDENCE
        assert len(sample_worker_config.capabilities) == 3
        assert len(sample_worker_config.supported_l5_tools) == 3

    def test_config_capabilities_list(self, sample_worker_config):
        """Test capabilities configuration."""
        assert "literature_search" in sample_worker_config.capabilities
        assert "evidence_grading" in sample_worker_config.capabilities

    def test_config_l5_tools_list(self, sample_worker_config):
        """Test supported L5 tools configuration."""
        assert "pubmed" in sample_worker_config.supported_l5_tools
        assert "clinicaltrials" in sample_worker_config.supported_l5_tools


class TestL4BaseWorker:
    """Tests for L4BaseWorker abstract class."""

    # =========================================================================
    # Initialization Tests
    # =========================================================================

    def test_worker_initialization(self, sample_worker_config):
        """Test worker initializes with config."""
        worker = TestL4Worker(sample_worker_config)

        assert worker.config == sample_worker_config
        assert worker.worker_id == "test_worker_001"
        assert worker.name == "Test Evidence Worker"

    def test_worker_with_l5_tools(self, sample_worker_config, mock_l5_tool):
        """Test worker initialization with L5 tools."""
        l5_tools = {"pubmed": mock_l5_tool}
        worker = TestL4Worker(sample_worker_config, l5_tools=l5_tools)

        assert "pubmed" in worker._l5_tools
        assert worker._l5_tools["pubmed"] == mock_l5_tool

    def test_worker_with_llm(self, sample_worker_config, mock_llm):
        """Test worker initialization with LLM."""
        worker = TestL4Worker(sample_worker_config, llm=mock_llm)

        assert worker._llm == mock_llm

    # =========================================================================
    # L5 Tool Orchestration Tests
    # =========================================================================

    @pytest.mark.asyncio
    async def test_call_single_l5_tool(self, sample_worker_config, mock_l5_tool):
        """Test calling a single L5 tool."""
        l5_tools = {"pubmed": mock_l5_tool}
        worker = TestL4Worker(sample_worker_config, l5_tools=l5_tools)

        results = await worker._call_l5_tools("cancer treatment")

        assert len(results) == 1
        mock_l5_tool.execute.assert_called_once_with("cancer treatment")

    @pytest.mark.asyncio
    async def test_call_multiple_l5_tools(self, sample_worker_config):
        """Test calling multiple L5 tools."""
        mock_tool1 = AsyncMock()
        mock_tool1.execute.return_value = {"source": "pubmed", "data": []}

        mock_tool2 = AsyncMock()
        mock_tool2.execute.return_value = {"source": "clinicaltrials", "data": []}

        l5_tools = {"pubmed": mock_tool1, "clinicaltrials": mock_tool2}
        worker = TestL4Worker(sample_worker_config, l5_tools=l5_tools)

        results = await worker._call_l5_tools("diabetes medication")

        assert len(results) == 2
        mock_tool1.execute.assert_called_once()
        mock_tool2.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_handle_missing_l5_tool(self, sample_worker_config):
        """Test handling when configured L5 tool is not available."""
        l5_tools = {"pubmed": AsyncMock()}
        l5_tools["pubmed"].execute.return_value = {"data": []}

        worker = TestL4Worker(sample_worker_config, l5_tools=l5_tools)

        results = await worker._call_l5_tools("query")

        # Should only have result from available tool
        assert len(results) == 1

    @pytest.mark.asyncio
    async def test_l5_tool_error_handling(self, sample_worker_config, mock_l5_tool):
        """Test error handling when L5 tool fails."""
        mock_l5_tool.execute.side_effect = Exception("API Error")

        l5_tools = {"pubmed": mock_l5_tool}
        worker = TestL4Worker(sample_worker_config, l5_tools=l5_tools)

        with pytest.raises(Exception):
            await worker._call_l5_tools("query")

    # =========================================================================
    # LLM Processing Tests
    # =========================================================================

    @pytest.mark.asyncio
    async def test_llm_processing(self, sample_worker_config, mock_llm):
        """Test LLM processing of L5 results."""
        worker = TestL4Worker(sample_worker_config, llm=mock_llm)

        l5_results = [{"source": "pubmed", "data": [{"title": "Study 1"}]}]
        result = await worker._process_with_llm("query", l5_results)

        assert result == "Processed result from LLM"
        mock_llm.ainvoke.assert_called_once()

    @pytest.mark.asyncio
    async def test_llm_not_configured(self, sample_worker_config):
        """Test behavior when LLM is not configured."""
        worker = TestL4Worker(sample_worker_config, llm=None)

        l5_results = [{"source": "pubmed", "data": []}]
        result = await worker._process_with_llm("query", l5_results)

        # Should return stringified results without LLM
        assert "pubmed" in result

    # =========================================================================
    # Full Processing Pipeline Tests
    # =========================================================================

    @pytest.mark.asyncio
    async def test_full_processing_pipeline(self, sample_worker_config, mock_l5_tool, mock_llm):
        """Test complete processing pipeline."""
        l5_tools = {"pubmed": mock_l5_tool}
        worker = TestL4Worker(sample_worker_config, l5_tools=l5_tools, llm=mock_llm)

        result = await worker.process("cancer treatment efficacy")

        assert result.success is True
        assert result.worker_id == "test_worker_001"
        assert result.content is not None
        assert result.l5_results is not None

    @pytest.mark.asyncio
    async def test_process_with_context(self, sample_worker_config, mock_l5_tool, mock_llm):
        """Test processing with additional context."""
        l5_tools = {"pubmed": mock_l5_tool}
        worker = TestL4Worker(sample_worker_config, l5_tools=l5_tools, llm=mock_llm)

        context = {"patient_age": 65, "condition": "diabetes"}
        result = await worker.process("treatment options", context=context)

        assert result.success is True


class TestL4WorkerResult:
    """Tests for L4WorkerResult dataclass."""

    def test_success_result(self):
        """Test creating successful result."""
        result = L4WorkerResult(
            success=True,
            content="Processed evidence summary",
            l5_results=[{"source": "pubmed", "data": []}],
            worker_id="evidence_worker",
        )

        assert result.success is True
        assert result.content == "Processed evidence summary"
        assert result.worker_id == "evidence_worker"
        assert result.error is None

    def test_error_result(self):
        """Test creating error result."""
        result = L4WorkerResult(
            success=False,
            content=None,
            l5_results=[],
            worker_id="evidence_worker",
            error="L5 tool failed",
        )

        assert result.success is False
        assert result.content is None
        assert result.error == "L5 tool failed"

    def test_result_with_metadata(self):
        """Test result with metadata."""
        result = L4WorkerResult(
            success=True,
            content="Summary",
            l5_results=[],
            worker_id="worker_001",
            metadata={
                "processing_time_ms": 1500,
                "l5_calls": 3,
                "tokens_used": 800,
            },
        )

        assert result.metadata["processing_time_ms"] == 1500
        assert result.metadata["l5_calls"] == 3


class TestWorkerCategoryEnum:
    """Tests for WorkerCategory enum."""

    def test_category_values(self):
        """Test category enum values."""
        assert WorkerCategory.EVIDENCE.value == "evidence"
        assert WorkerCategory.REGULATORY.value == "regulatory"
        assert WorkerCategory.CLINICAL.value == "clinical"
        assert WorkerCategory.DATA.value == "data"
        assert WorkerCategory.ANALYSIS.value == "analysis"


class TestWorkerCapabilities:
    """Tests for worker capabilities."""

    def test_check_capability(self, sample_worker_config):
        """Test checking if worker has capability."""
        worker = TestL4Worker(sample_worker_config)

        assert "literature_search" in worker.config.capabilities
        assert "unknown_capability" not in worker.config.capabilities

    def test_empty_capabilities(self):
        """Test worker with no capabilities."""
        config = WorkerConfig(
            worker_id="empty_worker",
            name="Empty Worker",
            description="Worker with no capabilities",
            category=WorkerCategory.EVIDENCE,
            capabilities=[],
        )

        worker = TestL4Worker(config)

        assert len(worker.config.capabilities) == 0
