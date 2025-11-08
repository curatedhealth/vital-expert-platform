"""
Test Configuration and Fixtures

Shared pytest fixtures and configuration for all tests.
"""

import pytest
import asyncio
from typing import Dict, Any, List
from unittest.mock import AsyncMock, MagicMock, Mock
from datetime import datetime

# Test data
MOCK_TENANT_ID = "test-tenant-123"
MOCK_USER_ID = "test-user-456"
MOCK_SESSION_ID = "test-session-789"
MOCK_AGENT_ID = "test-agent-abc"


@pytest.fixture
def mock_db_client():
    """Mock Supabase database client."""
    client = MagicMock()
    
    # Mock table operations
    table_mock = MagicMock()
    client.table.return_value = table_mock
    
    # Mock select/eq/execute chain
    select_mock = MagicMock()
    eq_mock = MagicMock()
    execute_mock = MagicMock()
    
    table_mock.select.return_value = select_mock
    select_mock.eq.return_value = eq_mock
    eq_mock.eq.return_value = execute_mock
    
    # Default successful response
    execute_mock.execute.return_value.data = [{
        "id": MOCK_AGENT_ID,
        "name": "Test Agent",
        "system_prompt": "You are a helpful AI assistant.",
        "model": "gpt-4-turbo-preview",
        "temperature": 0.7
    }]
    
    return client


@pytest.fixture
def mock_agent_data():
    """Mock agent data."""
    return {
        "id": MOCK_AGENT_ID,
        "name": "Test Agent",
        "system_prompt": "You are a helpful AI assistant.",
        "model": "gpt-4-turbo-preview",
        "temperature": 0.7,
        "capabilities": ["research", "analysis"],
        "domains": ["healthcare", "regulatory"]
    }


@pytest.fixture
def mock_rag_citations():
    """Mock RAG citations."""
    return [
        {
            "id": "source-1",
            "title": "FDA Guidance Document",
            "url": "https://fda.gov/guidance",
            "excerpt": "The FDA requires comprehensive validation...",
            "source_type": "fda_document",
            "confidence": 0.92
        },
        {
            "id": "source-2",
            "title": "Clinical Trial Regulations",
            "url": "https://clinicaltrials.gov/regulations",
            "excerpt": "Clinical trials must follow Good Clinical Practice...",
            "source_type": "regulation",
            "confidence": 0.88
        }
    ]


@pytest.fixture
def mock_tool_results():
    """Mock tool execution results."""
    return [
        {
            "tool_name": "web_search",
            "result": "Found 15 relevant FDA documents",
            "metadata": {"query": "FDA IND requirements", "results_count": 15}
        },
        {
            "tool_name": "fda_database",
            "result": "Retrieved 3 guidance documents",
            "metadata": {"database": "fda_guidance", "documents": 3}
        }
    ]


@pytest.fixture
def mock_conversation_history():
    """Mock conversation history."""
    return [
        {
            "user_message": "What are FDA requirements?",
            "assistant_message": "FDA requirements include validation, testing, and documentation...",
            "timestamp": datetime.now().isoformat()
        },
        {
            "user_message": "Can you elaborate?",
            "assistant_message": "Certainly! Let me break down the key requirements...",
            "timestamp": datetime.now().isoformat()
        }
    ]


@pytest.fixture
def mock_agent_service(mock_agent_data):
    """Mock AgentService."""
    service = AsyncMock()
    service.load_agent = AsyncMock(return_value=mock_agent_data)
    service.get_agent_domains = AsyncMock(return_value=["healthcare", "regulatory"])
    service.get_agent_tools = AsyncMock(return_value=["web_search", "pubmed_search"])
    service.validate_access = AsyncMock(return_value=True)
    return service


@pytest.fixture
def mock_rag_service(mock_rag_citations):
    """Mock RAGService."""
    service = AsyncMock()
    service.query = AsyncMock(return_value={
        "hasSources": True,
        "citations": mock_rag_citations,
        "confidence": 0.90,
        "searchStrategy": "hybrid",
        "processingTimeMs": 250
    })
    service.initialize = AsyncMock(return_value=True)
    return service


@pytest.fixture
def mock_tool_service(mock_tool_results):
    """Mock ToolService."""
    service = AsyncMock()
    service.decide_tools = AsyncMock(return_value={
        "suggested_tools": ["web_search", "fda_database"],
        "needs_confirmation": True,
        "reasoning": "Query requires FDA-specific information"
    })
    service.execute_tools = AsyncMock(return_value=mock_tool_results)
    return service


@pytest.fixture
def mock_memory_service(mock_conversation_history):
    """Mock MemoryService."""
    service = AsyncMock()
    service.get_session_history = AsyncMock(return_value=mock_conversation_history)
    service.save_turn = AsyncMock(return_value="turn-123")
    service.get_session_summary = AsyncMock(return_value="Discussion about FDA requirements")
    return service


@pytest.fixture
def mock_streaming_service():
    """Mock StreamingService."""
    service = AsyncMock()
    service.format_sse_event = AsyncMock(return_value="data: {}")
    service.stream_response = AsyncMock()
    return service


@pytest.fixture
def initial_state():
    """Initial workflow state."""
    return {
        "user_id": MOCK_USER_ID,
        "tenant_id": MOCK_TENANT_ID,
        "session_id": MOCK_SESSION_ID,
        "query": "What are FDA IND requirements?",
        "mode": 1,
        "agent_id": MOCK_AGENT_ID,
        "enable_rag": True,
        "enable_tools": True,
        "metadata": {}
    }


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Test helpers
def assert_state_updated(state: Dict[str, Any], expected_keys: List[str]):
    """Assert that state contains expected keys."""
    for key in expected_keys:
        assert key in state, f"Expected key '{key}' not found in state"


def assert_no_errors(state: Dict[str, Any]):
    """Assert that state has no errors."""
    assert state.get("error") is None, f"Unexpected error in state: {state.get('error')}"
    assert "error_code" not in state or state.get("error_code") is None


def assert_metadata_key(state: Dict[str, Any], key: str, expected_value: Any = None):
    """Assert that metadata contains a key with optional value check."""
    assert "metadata" in state, "State missing 'metadata' key"
    assert key in state["metadata"], f"Metadata missing key '{key}'"
    if expected_value is not None:
        assert state["metadata"][key] == expected_value, \
            f"Metadata['{key}'] = {state['metadata'][key]}, expected {expected_value}"
