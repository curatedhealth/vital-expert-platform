"""
Pytest configuration for AI Engine tests
"""

import pytest
import os

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
    """Provide FastAPI test client"""
    from fastapi.testclient import TestClient
    from src.main import app
    
    return TestClient(app)


@pytest.mark.slow
def pytest_configure(config):
    """Add custom markers"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
