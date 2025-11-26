"""
Test Configuration for LangGraph Compilation
Pytest fixtures and test utilities
"""

import pytest
from uuid import uuid4, UUID
from typing import Dict, Any
from unittest.mock import AsyncMock, MagicMock

from langgraph_workflows.state_schemas import UnifiedWorkflowState


@pytest.fixture
def sample_query():
    """Sample medical query for testing"""
    return "What is the recommended treatment for Type 2 diabetes in elderly patients?"


@pytest.fixture
def sample_user_id():
    """Sample user ID"""
    return uuid4()


@pytest.fixture
def sample_session_id():
    """Sample session ID"""
    return uuid4()


@pytest.fixture
def sample_agent_id():
    """Sample agent ID"""
    return uuid4()


@pytest.fixture
def sample_tenant_id():
    """Sample tenant ID"""
    return uuid4()


@pytest.fixture
def sample_agent_state(sample_query, sample_user_id, sample_session_id, sample_agent_id, sample_tenant_id):
    """Create sample agent state for testing"""
    return {
        'query': sample_query,
        'user_id': str(sample_user_id),
        'session_id': str(sample_session_id),
        'agent_id': str(sample_agent_id),
        'tenant_id': str(sample_tenant_id),
        'context': [],
        'response': None,
        'confidence_score': None,
        'metadata': {}
    }


@pytest.fixture
def sample_plan_state(sample_query):
    """Create sample plan state for ToT testing"""
    return {
        'original_query': sample_query,
        'thought_tree': {},
        'best_path': [],
        'plan_steps': [],
        'execution_results': [],
        'metadata': {}
    }


@pytest.fixture
def sample_critique_state():
    """Create sample critique state for Constitutional AI testing"""
    return {
        'original_response': "Here is medical advice without disclaimers.",
        'constitution': [
            {
                "principle": "Medical Accuracy",
                "rule": "Medical information must include appropriate disclaimers"
            }
        ],
        'critique_results': [],
        'violations_found': [],
        'safe_to_return': False
    }


@pytest.fixture
def mock_postgres_client():
    """Mock PostgreSQL client"""
    client = AsyncMock()
    
    # Mock fetchrow for agent loading
    client.fetchrow.return_value = {
        'id': uuid4(),
        'name': 'Test Agent',
        'system_prompt': 'You are a helpful medical assistant.',
        'model_name': 'gpt-4',
        'temperature': 0.7,
        'metadata': {}
    }
    
    # Mock fetch for batch queries
    client.fetch.return_value = [
        {
            'id': uuid4(),
            'node_name': 'agent_1',
            'node_type': 'agent',
            'agent_id': uuid4(),
            'config': {},
            'x_position': 0,
            'y_position': 0
        }
    ]
    
    return client


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client"""
    client = AsyncMock()
    
    # Mock chat completion
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(content="This is a test response from the AI."),
            finish_reason='stop'
        )
    ]
    
    client.chat.completions.create.return_value = mock_response
    
    return client


@pytest.fixture
def mock_graphrag_service():
    """Mock GraphRAG service"""
    service = AsyncMock()
    
    from graphrag.models import GraphRAGResponse, ContextChunk, Citation
    
    # Mock GraphRAG response
    service.query.return_value = GraphRAGResponse(
        query="test query",
        context_chunks=[
            ContextChunk(
                text="Test context",
                source="test_source",
                score=0.9,
                citation_id="[1]"
            )
        ],
        citations={
            "[1]": Citation(
                citation_id="[1]",
                source_name="Test Source",
                source_type="document",
                url="https://example.com",
                confidence=0.9
            )
        },
        evidence_chain=[],
        metadata={}
    )
    
    return service


@pytest.fixture
def sample_agent_data():
    """Sample agent database record"""
    return {
        'id': uuid4(),
        'name': 'Diabetes Expert',
        'system_prompt': 'You are a diabetes treatment specialist.',
        'model_name': 'gpt-4',
        'graph_id': uuid4()
    }


@pytest.fixture
def sample_graph_data():
    """Sample agent graph database records"""
    graph_id = uuid4()
    agent_node_id = uuid4()
    tool_node_id = uuid4()
    
    return {
        'graph': {
            'id': graph_id,
            'name': 'Test Graph',
            'description': 'Test graph for unit tests',
            'entry_node': 'agent_1'
        },
        'nodes': [
            {
                'id': agent_node_id,
                'graph_id': graph_id,
                'node_name': 'agent_1',
                'node_type': 'agent',
                'agent_id': uuid4(),
                'config': {},
                'x_position': 0,
                'y_position': 0
            },
            {
                'id': tool_node_id,
                'graph_id': graph_id,
                'node_name': 'tool_1',
                'node_type': 'tool',
                'config': {'tool_id': str(uuid4())},
                'x_position': 100,
                'y_position': 0
            }
        ],
        'edges': [
            {
                'id': uuid4(),
                'graph_id': graph_id,
                'source_node': 'agent_1',
                'target_node': 'tool_1',
                'edge_type': 'direct',
                'condition': None
            }
        ]
    }


@pytest.fixture(autouse=True)
def reset_singletons():
    """Reset singleton instances between tests"""
    yield
    
    # Reset any global instances here if needed
    from langgraph_workflows import postgres_checkpointer as checkpointer_module
    checkpointer_module._checkpointer = None


# Test markers
def pytest_configure(config):
    """Configure custom pytest markers"""
    config.addinivalue_line(
        "markers", "unit: Unit tests that don't require external services"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests that require database/services"
    )
    config.addinivalue_line(
        "markers", "slow: Tests that take significant time to run"
    )

