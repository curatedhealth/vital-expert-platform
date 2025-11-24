"""
Shared Fixtures and Configuration for LangGraph Compiler Tests

This module provides:
- Database mocking fixtures
- OpenAI API mocking
- Sample data fixtures (graphs, agents, nodes)
- Test configuration
"""

import pytest
import pytest_asyncio
from uuid import UUID, uuid4
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any, List

# Sample UUIDs for testing
TEST_GRAPH_ID = UUID("11111111-1111-1111-1111-111111111111")
TEST_AGENT_ID = UUID("22222222-2222-2222-2222-222222222222")
TEST_SESSION_ID = UUID("33333333-3333-3333-3333-333333333333")
TEST_NODE_ID = UUID("44444444-4444-4444-4444-444444444444")


# ============================================================================
# DATABASE FIXTURES
# ============================================================================

@pytest_asyncio.fixture
async def mock_pg_client():
    """Mock PostgreSQL client with common query responses"""
    client = AsyncMock()
    
    # Mock acquire context manager
    conn = AsyncMock()
    client.acquire.return_value.__aenter__.return_value = conn
    client.acquire.return_value.__aexit__.return_value = None
    
    # Set up common query responses
    conn.fetchrow = AsyncMock()
    conn.fetch = AsyncMock()
    conn.execute = AsyncMock()
    
    return client


@pytest.fixture
def sample_graph_definition():
    """Sample graph definition from agent_graphs table"""
    return {
        'id': TEST_GRAPH_ID,
        'name': 'test_graph',
        'description': 'Test graph for unit tests',
        'version': '1.0.0',
        'owner_id': TEST_AGENT_ID,
        'entry_node_name': 'start',
        'config': {},
        'is_active': True
    }


@pytest.fixture
def sample_graph_nodes():
    """Sample nodes from agent_graph_nodes table"""
    return [
        {
            'id': TEST_NODE_ID,
            'graph_id': TEST_GRAPH_ID,
            'name': 'start',
            'node_type': 'agent',
            'agent_id': TEST_AGENT_ID,
            'skill_id': None,
            'role_id': None,
            'config': {},
            'position_x': 0,
            'position_y': 0
        },
        {
            'id': uuid4(),
            'graph_id': TEST_GRAPH_ID,
            'name': 'end',
            'node_type': 'agent',
            'agent_id': TEST_AGENT_ID,
            'skill_id': None,
            'role_id': None,
            'config': {},
            'position_x': 100,
            'position_y': 0
        }
    ]


@pytest.fixture
def sample_graph_edges():
    """Sample edges from agent_graph_edges table"""
    return [
        {
            'id': uuid4(),
            'graph_id': TEST_GRAPH_ID,
            'source_node_id': TEST_NODE_ID,
            'target_node_id': uuid4(),
            'edge_type': 'direct',
            'condition': None,
            'config': {}
        }
    ]


@pytest.fixture
def sample_agent():
    """Sample agent from v_agent_complete view"""
    return {
        'id': TEST_AGENT_ID,
        'name': 'Test Agent',
        'slug': 'test-agent',
        'title': 'Test Agent Title',
        'description': 'Test agent for unit tests',
        'system_prompt': 'You are a helpful test agent.',
        'base_model': 'gpt-4',
        'temperature': 0.7,
        'max_tokens': 1000,
        'role_id': None,
        'function_id': None,
        'department_id': None,
        'status': 'active'
    }


@pytest.fixture
def sample_skill():
    """Sample skill from skills table"""
    return {
        'id': uuid4(),
        'name': 'test_skill',
        'description': 'Test skill for unit tests',
        'skill_type': 'tool',
        'implementation_ref': 'test_tool',
        'parameters_schema': {},
        'is_executable': True
    }


# ============================================================================
# OPENAI MOCKING FIXTURES
# ============================================================================

@pytest.fixture
def mock_openai_response():
    """Mock OpenAI API response"""
    return {
        'id': 'chatcmpl-test',
        'object': 'chat.completion',
        'created': 1234567890,
        'model': 'gpt-4',
        'choices': [
            {
                'index': 0,
                'message': {
                    'role': 'assistant',
                    'content': 'This is a test response from the AI.'
                },
                'finish_reason': 'stop'
            }
        ]
    }


@pytest.fixture
def mock_openai_client(mock_openai_response):
    """Mock OpenAI AsyncClient"""
    client = AsyncMock()
    
    # Mock chat completions
    completion_response = MagicMock()
    completion_response.choices = [MagicMock()]
    completion_response.choices[0].message.content = mock_openai_response['choices'][0]['message']['content']
    
    client.chat.completions.create = AsyncMock(return_value=completion_response)
    
    # Mock embeddings
    embedding_response = MagicMock()
    embedding_response.data = [MagicMock()]
    embedding_response.data[0].embedding = [0.1] * 1536
    
    client.embeddings.create = AsyncMock(return_value=embedding_response)
    
    return client


# ============================================================================
# STATE FIXTURES
# ============================================================================

@pytest.fixture
def initial_state():
    """Initial AgentState for testing"""
    return {
        'query': 'What is the recommended treatment for Type 2 diabetes?',
        'context': 'Patient context: 45-year-old male, BMI 32, HbA1c 8.5%',
        'messages': [],
        'iteration': 0,
        'evidence_chain': [],
        'citations': [],
        'requires_human_review': False
    }


@pytest.fixture
def session_id():
    """Test session UUID"""
    return TEST_SESSION_ID


# ============================================================================
# PATTERN FIXTURES
# ============================================================================

@pytest.fixture
def sample_constitution():
    """Sample constitutional principles for testing"""
    from backend.services.ai_engine.langgraph_compiler.patterns.constitutional_ai import (
        ConstitutionalPrinciple
    )
    
    return [
        ConstitutionalPrinciple(
            id="test_principle_1",
            title="Test Principle 1",
            description="This is a test principle",
            category="test",
            is_required=True
        ),
        ConstitutionalPrinciple(
            id="test_principle_2",
            title="Test Principle 2",
            description="Another test principle",
            category="test",
            is_required=False
        )
    ]


@pytest.fixture
def sample_tools():
    """Sample tool functions for ReAct testing"""
    def calculator(operation: str, a: float, b: float) -> float:
        """Simple calculator tool"""
        if operation == "add":
            return a + b
        elif operation == "subtract":
            return a - b
        elif operation == "multiply":
            return a * b
        elif operation == "divide":
            return a / b
        else:
            raise ValueError(f"Unknown operation: {operation}")
            
    def weather_lookup(location: str) -> str:
        """Mock weather lookup tool"""
        return f"Weather in {location}: Sunny, 72°F"
        
    return {
        'calculator': calculator,
        'weather_lookup': weather_lookup
    }


# ============================================================================
# CONFIGURATION
# ============================================================================

@pytest.fixture(autouse=True)
def mock_env_config(monkeypatch):
    """Mock environment configuration for all tests"""
    # Database config
    monkeypatch.setenv("POSTGRES_HOST", "localhost")
    monkeypatch.setenv("POSTGRES_PORT", "5432")
    monkeypatch.setenv("POSTGRES_DB", "test_db")
    monkeypatch.setenv("POSTGRES_USER", "test_user")
    monkeypatch.setenv("POSTGRES_PASSWORD", "test_password")
    
    # OpenAI config
    monkeypatch.setenv("OPENAI_API_KEY", "test-api-key")
    
    # Neo4j config
    monkeypatch.setenv("NEO4J_URI", "bolt://localhost:7687")
    monkeypatch.setenv("NEO4J_USER", "neo4j")
    monkeypatch.setenv("NEO4J_PASSWORD", "test_password")


# ============================================================================
# HELPER UTILITIES
# ============================================================================

def assert_state_updated(state_before: Dict[str, Any], state_after: Dict[str, Any], expected_updates: Dict[str, Any]):
    """Helper to assert state was updated correctly"""
    for key, expected_value in expected_updates.items():
        assert key in state_after, f"Key '{key}' not in updated state"
        assert state_after[key] == expected_value, f"Expected {key}={expected_value}, got {state_after[key]}"


def create_mock_checkpoint(session_id: UUID, step_index: int, state: Dict[str, Any]):
    """Helper to create mock checkpoint"""
    return {
        'id': uuid4(),
        'session_id': session_id,
        'step_index': step_index,
        'state': state,
        'created_at': '2025-11-22T00:00:00Z'
    }

