"""
VITAL Platform - Agent Tests Conftest

Phase 5: Testing & Quality Assurance

Shared fixtures for L4 Worker and L5 Tool tests.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from typing import Dict, Any, List
import asyncio


# =============================================================================
# L5 TOOL FIXTURES
# =============================================================================


@pytest.fixture
def mock_pubmed_response():
    """Mock PubMed API response."""
    return {
        "success": True,
        "data": {
            "results": [
                {
                    "pmid": "12345678",
                    "title": "Clinical Trial Results for Drug X",
                    "authors": ["Smith J", "Johnson A"],
                    "journal": "New England Journal of Medicine",
                    "year": 2024,
                    "abstract": "This study demonstrates...",
                },
                {
                    "pmid": "87654321",
                    "title": "Meta-analysis of Treatment Efficacy",
                    "authors": ["Williams B"],
                    "journal": "Lancet",
                    "year": 2023,
                    "abstract": "A comprehensive meta-analysis...",
                },
            ],
            "total_count": 2,
        },
        "source": "pubmed",
        "cached": False,
    }


@pytest.fixture
def mock_fda_response():
    """Mock FDA API response."""
    return {
        "success": True,
        "data": {
            "results": [
                {
                    "application_number": "NDA123456",
                    "drug_name": "Drug X",
                    "approval_date": "2024-01-15",
                    "indication": "Treatment of condition Y",
                    "sponsor": "Pharma Corp",
                },
            ],
        },
        "source": "fda",
        "cached": False,
    }


@pytest.fixture
def mock_clinical_trials_response():
    """Mock ClinicalTrials.gov API response."""
    return {
        "success": True,
        "data": {
            "studies": [
                {
                    "nct_id": "NCT12345678",
                    "title": "Phase 3 Study of Drug X",
                    "status": "Recruiting",
                    "phase": "Phase 3",
                    "enrollment": 500,
                    "start_date": "2024-01-01",
                    "primary_completion_date": "2025-12-31",
                },
            ],
        },
        "source": "clinicaltrials",
        "cached": False,
    }


@pytest.fixture
def mock_l5_pubmed_tool(mock_pubmed_response):
    """Mock PubMed L5 tool."""
    tool = AsyncMock()
    tool.tool_id = "pubmed"
    tool.name = "PubMed Search"
    tool.execute.return_value = mock_pubmed_response
    return tool


@pytest.fixture
def mock_l5_fda_tool(mock_fda_response):
    """Mock FDA L5 tool."""
    tool = AsyncMock()
    tool.tool_id = "fda_labels"
    tool.name = "FDA Drug Labels"
    tool.execute.return_value = mock_fda_response
    return tool


@pytest.fixture
def mock_l5_clinical_trials_tool(mock_clinical_trials_response):
    """Mock ClinicalTrials L5 tool."""
    tool = AsyncMock()
    tool.tool_id = "clinicaltrials"
    tool.name = "ClinicalTrials.gov"
    tool.execute.return_value = mock_clinical_trials_response
    return tool


@pytest.fixture
def mock_l5_tool_set(
    mock_l5_pubmed_tool,
    mock_l5_fda_tool,
    mock_l5_clinical_trials_tool,
):
    """Complete set of mock L5 tools."""
    return {
        "pubmed": mock_l5_pubmed_tool,
        "fda_labels": mock_l5_fda_tool,
        "clinicaltrials": mock_l5_clinical_trials_tool,
    }


# =============================================================================
# LLM FIXTURES
# =============================================================================


@pytest.fixture
def mock_haiku_llm():
    """Mock Claude Haiku LLM for L4 workers."""
    llm = AsyncMock()
    llm.ainvoke.return_value = MagicMock(
        content="Synthesized analysis from Claude Haiku",
        response_metadata={
            "model": "claude-haiku-4",
            "usage": {
                "input_tokens": 500,
                "output_tokens": 200,
                "total_tokens": 700,
            },
        },
    )
    return llm


@pytest.fixture
def mock_sonnet_llm():
    """Mock Claude Sonnet LLM for L3/L2 agents."""
    llm = AsyncMock()
    llm.ainvoke.return_value = MagicMock(
        content="Expert analysis from Claude Sonnet",
        response_metadata={
            "model": "claude-sonnet-4",
            "usage": {
                "input_tokens": 1000,
                "output_tokens": 500,
                "total_tokens": 1500,
            },
        },
    )
    return llm


@pytest.fixture
def mock_opus_llm():
    """Mock Claude Opus LLM for L1 orchestrator."""
    llm = AsyncMock()
    llm.ainvoke.return_value = MagicMock(
        content="Strategic orchestration from Claude Opus",
        response_metadata={
            "model": "claude-opus-4",
            "usage": {
                "input_tokens": 2000,
                "output_tokens": 1000,
                "total_tokens": 3000,
            },
        },
    )
    return llm


# =============================================================================
# HTTP CLIENT FIXTURES
# =============================================================================


@pytest.fixture
def mock_http_client():
    """Mock async HTTP client."""
    import httpx

    client = AsyncMock(spec=httpx.AsyncClient)
    return client


@pytest.fixture
def mock_http_response():
    """Factory for mock HTTP responses."""

    def _create_response(
        status_code: int = 200,
        json_data: Dict[str, Any] = None,
        text: str = "",
    ):
        response = MagicMock()
        response.status_code = status_code
        response.json.return_value = json_data or {}
        response.text = text
        response.raise_for_status = MagicMock()
        if status_code >= 400:
            response.raise_for_status.side_effect = Exception(f"HTTP {status_code}")
        return response

    return _create_response


# =============================================================================
# SAMPLE DATA FIXTURES
# =============================================================================


@pytest.fixture
def sample_user_query():
    """Sample user query for testing."""
    return "What are the FDA requirements for Phase 3 clinical trials?"


@pytest.fixture
def sample_complex_query():
    """Sample complex multi-domain query."""
    return """
    Analyze the competitive landscape for GLP-1 receptor agonists 
    in the treatment of Type 2 diabetes and obesity. Include:
    1. Currently approved drugs and their market performance
    2. Pipeline candidates in Phase 3 development
    3. Regulatory considerations for combination therapies
    4. Safety profile comparisons
    """


@pytest.fixture
def sample_context():
    """Sample context for worker processing."""
    return {
        "tenant_id": "tenant-123",
        "user_id": "user-456",
        "conversation_id": "conv-789",
        "domain_focus": ["regulatory", "clinical"],
        "confidence_threshold": 0.85,
    }


# =============================================================================
# ASYNC HELPERS
# =============================================================================


@pytest.fixture
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def async_mock_generator():
    """Helper to create async generators for testing."""

    async def _create_generator(items: List[Any]):
        for item in items:
            yield item

    return _create_generator


# =============================================================================
# STREAMING FIXTURES
# =============================================================================


@pytest.fixture
def mock_sse_events():
    """Mock SSE events for streaming tests."""
    return [
        {"event": "token", "data": {"content": "Hello "}},
        {"event": "token", "data": {"content": "World"}},
        {"event": "reasoning", "data": {"step": "analysis", "content": "Analyzing..."}},
        {"event": "citation", "data": {"id": "cite-001", "source": "PubMed"}},
        {"event": "done", "data": {"success": True}},
    ]


@pytest.fixture
def mock_streaming_callback():
    """Mock streaming callback for testing."""
    callback = AsyncMock()
    callback.on_token = AsyncMock()
    callback.on_reasoning = AsyncMock()
    callback.on_citation = AsyncMock()
    callback.on_tool_call = AsyncMock()
    callback.on_delegation = AsyncMock()
    callback.on_checkpoint = AsyncMock()
    callback.on_error = AsyncMock()
    callback.on_done = AsyncMock()
    return callback


# =============================================================================
# TENANT & AUTH FIXTURES
# =============================================================================


@pytest.fixture
def sample_tenant_config():
    """Sample tenant configuration."""
    return {
        "tenant_id": "tenant-123",
        "name": "Test Pharma Inc",
        "tier": "enterprise",
        "features": {
            "rag_enabled": True,
            "web_search_enabled": True,
            "hitl_enabled": True,
            "max_experts": 5,
        },
        "rate_limits": {
            "requests_per_minute": 100,
            "tokens_per_day": 1000000,
        },
    }


@pytest.fixture
def sample_user():
    """Sample user for testing."""
    return {
        "user_id": "user-456",
        "email": "researcher@testpharma.com",
        "roles": ["researcher", "regulatory_viewer"],
        "tenant_id": "tenant-123",
    }
