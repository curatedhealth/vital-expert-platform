"""
Pytest configuration and fixtures for AI Engine tests.
Sets up Python path and common fixtures.
"""

import sys
import os
from pathlib import Path

# Add src directory to Python path so imports work correctly
src_path = Path(__file__).parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

import pytest
from typing import AsyncGenerator, Generator
from unittest.mock import MagicMock, AsyncMock


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for testing."""
    client = MagicMock()
    client.from_ = MagicMock(return_value=client)
    client.select = MagicMock(return_value=client)
    client.insert = MagicMock(return_value=client)
    client.update = MagicMock(return_value=client)
    client.delete = MagicMock(return_value=client)
    client.eq = MagicMock(return_value=client)
    client.execute = AsyncMock(return_value=MagicMock(data=[], error=None))
    return client


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing."""
    client = MagicMock()
    client.chat = MagicMock()
    client.chat.completions = MagicMock()
    client.chat.completions.create = AsyncMock(
        return_value=MagicMock(
            choices=[
                MagicMock(
                    message=MagicMock(
                        content="Test response",
                        role="assistant"
                    )
                )
            ]
        )
    )
    return client


@pytest.fixture
def mock_redis_client():
    """Mock Redis client for testing."""
    client = MagicMock()
    client.get = AsyncMock(return_value=None)
    client.set = AsyncMock(return_value=True)
    client.delete = AsyncMock(return_value=1)
    client.ping = AsyncMock(return_value=True)
    return client


@pytest.fixture
def sample_tenant_id() -> str:
    """Sample tenant ID for testing."""
    return "00000000-0000-0000-0000-000000000001"


@pytest.fixture
def sample_user_id() -> str:
    """Sample user ID for testing."""
    return "00000000-0000-0000-0000-000000000002"


@pytest.fixture
def sample_agent_id() -> str:
    """Sample agent ID for testing."""
    return "00000000-0000-0000-0000-000000000003"


@pytest.fixture
def sample_session_id() -> str:
    """Sample session ID for testing."""
    return "00000000-0000-0000-0000-000000000004"


@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    """Set up test environment variables."""
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.setenv("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379")
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-key")


# Configure pytest-asyncio
pytest_plugins = ('pytest_asyncio',)

