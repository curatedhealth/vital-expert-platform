"""
Pytest configuration for AI Engine tests
"""

import pytest
import os
from typing import AsyncGenerator

@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Setup test environment variables"""
    os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "test-key")
    os.environ["SUPABASE_URL"] = "https://test.supabase.co"
    os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "test-key"
    os.environ["LOG_LEVEL"] = "ERROR"  # Reduce noise in tests
    
    yield
    
    # Cleanup if needed


@pytest.fixture
def test_client():
    """Provide FastAPI test client for unit tests (uses mock server)"""
    from fastapi.testclient import TestClient
    from src.main import app
    
    return TestClient(app)


@pytest.fixture
async def async_client() -> AsyncGenerator:
    """
    ⚠️ INTEGRATION TESTS: Use Real Server
    
    For integration tests, we connect to the actual running AI Engine server
    instead of using a mock client. This allows us to test the full stack.
    
    Set AI_ENGINE_URL environment variable to override default (localhost:8000).
    
    ⚠️ DO NOT MODIFY THIS WITHOUT UPDATING ALL INTEGRATION TESTS ⚠️
    - Integration tests require a running server
    - Unit tests should use test_client (mock) instead
    - This fixture is used by all integration test files
    """
    from httpx import AsyncClient
    
    # Use actual running server for integration tests
    # Default to localhost:8000, but can be overridden via environment variable
    base_url = os.getenv("AI_ENGINE_URL", "http://localhost:8000")
    
    async with AsyncClient(base_url=base_url, timeout=30.0) as client:
        yield client


@pytest.mark.slow
def pytest_configure(config):
    """Add custom markers"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
