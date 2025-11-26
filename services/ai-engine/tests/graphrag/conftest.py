"""
conftest.py - Shared test fixtures for GraphRAG tests
"""

import pytest
import asyncio
from typing import Generator


# ========== PYTEST CONFIGURATION ==========

def pytest_configure(config):
    """Configure pytest"""
    config.addinivalue_line(
        "markers", "unit: Unit tests"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests"
    )
    config.addinivalue_line(
        "markers", "performance: Performance tests"
    )


# ========== EVENT LOOP FIXTURE ==========

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ========== COMMON FIXTURES ==========

@pytest.fixture
def sample_uuid():
    """Generate a sample UUID"""
    from uuid import uuid4
    return uuid4()


@pytest.fixture
def sample_tenant_id():
    """Sample tenant ID"""
    from uuid import UUID
    return UUID("87654321-4321-4321-4321-210987654321")


@pytest.fixture
def sample_agent_id():
    """Sample agent ID"""
    from uuid import UUID
    return UUID("12345678-1234-1234-1234-123456789012")


@pytest.fixture
def sample_session_id():
    """Sample session ID"""
    from uuid import UUID
    return UUID("11111111-1111-1111-1111-111111111111")


# ========== CLEANUP ==========

@pytest.fixture(autouse=True)
async def cleanup_after_test():
    """Cleanup after each test"""
    yield
    # Add any cleanup logic here
    await asyncio.sleep(0)  # Allow pending tasks to complete
