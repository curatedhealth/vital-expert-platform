"""
Pytest Configuration and Fixtures
Provides shared fixtures for testing LangGraph pattern agents
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))


@pytest.fixture
def mock_openai_response():
    """Factory fixture for creating mock OpenAI responses"""
    def _create_response(content: str):
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = content
        return mock_response
    return _create_response


@pytest.fixture
def mock_openai_client(mock_openai_response):
    """Mock AsyncOpenAI client"""
    with patch('openai.AsyncOpenAI') as mock_client_class:
        mock_client = AsyncMock()
        mock_client_class.return_value = mock_client

        # Default response for chat completions
        mock_client.chat.completions.create = AsyncMock(
            return_value=mock_openai_response("Default mock response")
        )

        yield mock_client


@pytest.fixture
def mock_graphrag_config():
    """Mock GraphRAG configuration"""
    with patch('graphrag.config.get_graphrag_config') as mock_config:
        config = MagicMock()
        config.openai_api_key = "test-api-key"
        mock_config.return_value = config
        yield config


@pytest.fixture
def sample_query():
    """Sample query for testing"""
    return "What are the regulatory requirements for a new drug approval?"


@pytest.fixture
def sample_context():
    """Sample context for testing"""
    return "FDA guidelines indicate that Phase 3 trials require at least 1000 participants."


@pytest.fixture
def sample_tool_results():
    """Sample tool results for ReAct testing"""
    return [
        {
            'type': 'search',
            'content': 'FDA Drug Approval Process: Phase 1, 2, 3 clinical trials required.',
            'source': 'FDA Guidelines 2024'
        },
        {
            'type': 'analysis',
            'content': 'Typical approval timeline: 10-15 years from discovery to market.',
            'source': 'Industry Analysis Report'
        }
    ]


@pytest.fixture
def react_state_template():
    """Template for ReAct agent state"""
    return {
        'query': '',
        'messages': [],
        'reasoning': [],
        'tool_calls': [],
        'tool_results': [],
        'response': '',
        'confidence': 0.0,
        'metadata': {},
        'next_node': 'reason',
        'loop_count': 0,
        'error': None
    }


@pytest.fixture
def plan_state_template():
    """Template for Tree-of-Thoughts plan state"""
    return {
        'original_query': '',
        'thought_tree': {},
        'current_thought_id': 'root',
        'metadata': {},
        'best_path': [],
        'plan_steps': [],
        'execution_results': [],
        'evaluated_thoughts': [],
        'error': None
    }
