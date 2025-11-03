"""
Global pytest fixtures for VITAL AI Engine
Phase 0: MVP Testing
"""

import pytest
import asyncio
from uuid import uuid4, UUID
from typing import AsyncGenerator, Generator
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Set test environment variables
os.environ["ENV"] = "test"
os.environ["REQUIRE_TENANT_ID"] = "false"  # Disable for tests
os.environ["ENABLE_LANGFUSE"] = "false"    # Disable tracing in tests
os.environ["LOG_LEVEL"] = "WARNING"        # Reduce log noise

# Import after setting environment
from fastapi.testclient import TestClient
from httpx import AsyncClient
import structlog


# ============================================
# Event Loop Fixture
# ============================================

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ============================================
# Test Data Fixtures
# ============================================

@pytest.fixture
def test_tenant_id() -> UUID:
    """Generate unique test tenant ID"""
    return uuid4()


@pytest.fixture
def test_user_id() -> UUID:
    """Generate unique test user ID"""
    return uuid4()


@pytest.fixture
def test_session_id() -> str:
    """Generate unique test session ID"""
    return f"test-session-{uuid4()}"


@pytest.fixture
def test_agent_id() -> UUID:
    """Generate unique test agent ID"""
    return uuid4()


# ============================================
# HTTP Client Fixtures
# ============================================

@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Async HTTP client for testing API endpoints.
    
    Usage:
        async def test_endpoint(async_client):
            response = await async_client.get("/health")
            assert response.status_code == 200
    """
    from src.main import app
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def sync_client() -> TestClient:
    """
    Sync HTTP client for testing.
    
    Usage:
        def test_endpoint(sync_client):
            response = sync_client.get("/health")
            assert response.status_code == 200
    """
    from src.main import app
    return TestClient(app)


# ============================================
# Database Fixtures
# ============================================

@pytest.fixture
async def supabase_client():
    """
    Supabase client for database testing (SERVICE ROLE).
    
    ⚠️ WARNING: This client uses SERVICE ROLE KEY and bypasses RLS by design.
    For RLS testing, use anon_supabase_client fixture instead.
    
    Note: Requires Supabase credentials in environment.
    In CI/CD: Fails loudly if credentials missing (SUPABASE_REQUIRED=true)
    In local dev: Skips tests if credentials missing
    """
    from src.services.supabase_client import SupabaseClient
    
    # Check if running in CI/CD (stricter requirements)
    is_ci = os.getenv("CI") or os.getenv("GITHUB_ACTIONS") or os.getenv("SUPABASE_REQUIRED")
    
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
        if is_ci:
            pytest.fail("❌ SUPABASE credentials required in CI/CD but not set")
        else:
            pytest.skip("Supabase credentials not available (set SUPABASE_REQUIRED=true to fail instead of skip)")
    
    client = SupabaseClient()
    await client.initialize()
    
    yield client
    
    # Cleanup handled per test


@pytest.fixture
async def anon_supabase_client():
    """
    Supabase client with ANON key for RLS testing.
    
    ⚠️ This client uses ANON KEY and has RLS ENFORCED (unlike service role).
    Use this fixture for testing RLS policies.
    
    Note: Requires SUPABASE_ANON_KEY in environment.
    """
    try:
        from supabase import create_client, Client
    except ImportError:
        pytest.skip("supabase-py package not installed (pip install supabase)")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_anon_key:
        pytest.skip("SUPABASE_URL or SUPABASE_ANON_KEY not set (required for anon-key RLS tests)")
    
    client: Client = create_client(supabase_url, supabase_anon_key)
    
    yield client
    
    # No cleanup needed - anon client is stateless


# ============================================
# Cache Fixtures
# ============================================

@pytest.fixture
async def cache_manager():
    """
    Test cache manager with isolated Redis database.
    
    Uses Redis DB 1 for tests to avoid conflicts with dev data.
    """
    from src.services.cache_manager import CacheManager
    
    # Use DB 1 for tests
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/1")
    
    try:
        manager = CacheManager(redis_url=redis_url)
        await manager.initialize()
        yield manager
    except Exception as e:
        pytest.skip(f"Redis not available: {e}")
    finally:
        if manager:
            await manager.cleanup()


# ============================================
# Mock Data Fixtures
# ============================================

@pytest.fixture
def mock_agent_data(test_tenant_id: UUID) -> dict:
    """
    Mock agent data for testing.
    
    Returns a complete agent dict with all required fields.
    """
    return {
        "id": str(uuid4()),
        "tenant_id": str(test_tenant_id),
        "name": "Test Agent",
        "display_name": "Test Agent",
        "description": "Agent for testing purposes",
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 2000,
        "system_prompt": "You are a helpful AI assistant for testing.",
        "capabilities": ["chat", "analysis"],
        "metadata": {}
    }


@pytest.fixture
def mock_conversation_data(test_tenant_id: UUID, test_user_id: UUID) -> dict:
    """Mock conversation data for testing"""
    return {
        "id": str(uuid4()),
        "tenant_id": str(test_tenant_id),
        "user_id": str(test_user_id),
        "title": "Test Conversation",
        "metadata": {}
    }


@pytest.fixture
def mock_message_data() -> dict:
    """Mock message data for testing"""
    return {
        "id": str(uuid4()),
        "role": "user",
        "content": "This is a test message",
        "metadata": {}
    }


@pytest.fixture
def mock_openai_response() -> dict:
    """
    Mock OpenAI API response for testing.
    
    Use this to avoid actual API calls in tests.
    """
    return {
        "id": "chatcmpl-test",
        "object": "chat.completion",
        "created": 1234567890,
        "model": "gpt-4",
        "choices": [{
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "This is a test response from the AI."
            },
            "finish_reason": "stop"
        }],
        "usage": {
            "prompt_tokens": 50,
            "completion_tokens": 50,
            "total_tokens": 100
        }
    }


# ============================================
# Test Configuration Helpers
# ============================================

@pytest.fixture(autouse=True)
def reset_environment():
    """
    Reset environment after each test.
    
    Ensures tests don't interfere with each other.
    """
    yield
    
    # Clear any test-specific environment variables
    test_vars = [
        "TEST_TENANT_ID",
        "TEST_USER_ID",
        "TEST_SESSION_ID"
    ]
    
    for var in test_vars:
        if var in os.environ:
            del os.environ[var]


@pytest.fixture
def caplog_structlog(caplog):
    """
    Capture structlog output for assertions.
    
    Usage:
        def test_logging(caplog_structlog):
            logger.info("test message")
            assert "test message" in caplog_structlog.text
    """
    import logging
    
    # Configure structlog to output to caplog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.format_exc_info,
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    return caplog


# ============================================
# Pytest Hooks
# ============================================

def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "unit: Unit tests (fast, isolated)"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests (slower, requires services)"
    )
    config.addinivalue_line(
        "markers", "security: Security tests (CRITICAL for compliance)"
    )
    config.addinivalue_line(
        "markers", "slow: Slow tests (skip in quick runs)"
    )


def pytest_collection_modifyitems(config, items):
    """
    Modify test collection to add markers automatically.
    
    - Tests in tests/security/ get @pytest.mark.security
    - Tests in tests/integration/ get @pytest.mark.integration
    - Tests in tests/unit/ get @pytest.mark.unit
    """
    for item in items:
        # Add markers based on file path
        if "security" in str(item.fspath):
            item.add_marker(pytest.mark.security)
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        elif "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)


# ============================================
# Test Data Factories
# ============================================

class TestDataFactory:
    """Factory for generating test data"""
    
    @staticmethod
    def create_agent(tenant_id: UUID = None, **kwargs) -> dict:
        """Create agent test data"""
        return {
            "id": str(uuid4()),
            "tenant_id": str(tenant_id or uuid4()),
            "name": kwargs.get("name", "Test Agent"),
            "description": kwargs.get("description", "Test"),
            "model": kwargs.get("model", "gpt-4"),
            "temperature": kwargs.get("temperature", 0.7),
            **kwargs
        }
    
    @staticmethod
    def create_conversation(tenant_id: UUID = None, user_id: UUID = None, **kwargs) -> dict:
        """Create conversation test data"""
        return {
            "id": str(uuid4()),
            "tenant_id": str(tenant_id or uuid4()),
            "user_id": str(user_id or uuid4()),
            "title": kwargs.get("title", "Test Conversation"),
            **kwargs
        }
    
    @staticmethod
    def create_message(conversation_id: UUID = None, **kwargs) -> dict:
        """Create message test data"""
        return {
            "id": str(uuid4()),
            "conversation_id": str(conversation_id or uuid4()),
            "role": kwargs.get("role", "user"),
            "content": kwargs.get("content", "Test message"),
            **kwargs
        }


@pytest.fixture
def test_factory() -> TestDataFactory:
    """Test data factory fixture"""
    return TestDataFactory()

