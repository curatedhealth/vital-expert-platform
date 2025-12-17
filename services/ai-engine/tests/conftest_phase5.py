"""
VITAL Path - Phase 5 Test Fixtures

Shared fixtures for integration testing of Phase 1-4 components.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from uuid import uuid4

# Core imports
from core.context import (
    RequestContext,
    set_tenant_context,
    set_request_context,
    clear_request_context,
    get_request_context,
)

# Domain imports
from domain.services.budget_service import BudgetService, BudgetCheckResult
from domain.value_objects.token_usage import TokenUsage

# Infrastructure imports
from infrastructure.database.repositories.job_repo import JobRepository, Job
from infrastructure.database.repositories.conversation_repo import (
    ConversationRepository,
    Conversation,
    Message,
)


# ============================================================================
# Context Fixtures
# ============================================================================

@pytest.fixture
def tenant_id():
    """Generate test tenant ID."""
    return f"test-tenant-{uuid4().hex[:8]}"


@pytest.fixture
def user_id():
    """Generate test user ID."""
    return f"test-user-{uuid4().hex[:8]}"


@pytest.fixture
def tenant_context(tenant_id, user_id):
    """Set up and tear down tenant context."""
    set_tenant_context(
        tenant_id=tenant_id,
        user_id=user_id,
        roles=["user"],
    )
    
    ctx = get_request_context()
    yield ctx
    
    clear_request_context()


@pytest.fixture
def admin_context(tenant_id):
    """Set up admin context."""
    admin_user_id = f"admin-{uuid4().hex[:8]}"
    
    set_tenant_context(
        tenant_id=tenant_id,
        user_id=admin_user_id,
        roles=["admin", "user"],
    )
    
    ctx = get_request_context()
    yield ctx
    
    clear_request_context()


@pytest.fixture
def request_context(tenant_id, user_id):
    """Create full request context."""
    ctx = RequestContext(
        tenant_id=tenant_id,
        user_id=user_id,
        roles=["user"],
        request_id=str(uuid4()),
        session_id=str(uuid4()),
    )
    
    set_request_context(ctx)
    yield ctx
    clear_request_context()


# ============================================================================
# Service Mocks
# ============================================================================

@pytest.fixture
def mock_budget_service():
    """Mock budget service with default allow behavior."""
    service = AsyncMock(spec=BudgetService)
    
    service.check_budget.return_value = BudgetCheckResult(
        can_proceed=True,
        monthly_used=5000,
        monthly_limit=100000,
        daily_used=500,
        daily_limit=10000,
    )
    
    service.record_usage.return_value = None
    
    service.get_usage_summary.return_value = {
        "total_tokens": 50000,
        "total_cost": 1.50,
        "request_count": 100,
    }
    
    return service


@pytest.fixture
def mock_budget_exceeded():
    """Mock budget service with exceeded budget."""
    service = AsyncMock(spec=BudgetService)
    
    service.check_budget.return_value = BudgetCheckResult(
        can_proceed=False,
        monthly_used=100000,
        monthly_limit=100000,
        daily_used=10000,
        daily_limit=10000,
    )
    
    return service


# ============================================================================
# Repository Mocks
# ============================================================================

@pytest.fixture
def mock_job_repo():
    """Mock job repository."""
    repo = AsyncMock(spec=JobRepository)
    
    job_id = str(uuid4())
    
    repo.create.return_value = Job(
        id=job_id,
        tenant_id="test-tenant",
        user_id="test-user",
        job_type="workflow",
        status="pending",
        created_at=datetime.utcnow(),
    )
    
    repo.get.return_value = Job(
        id=job_id,
        tenant_id="test-tenant",
        user_id="test-user",
        job_type="workflow",
        status="running",
        created_at=datetime.utcnow(),
        progress={"currentStep": 2, "totalSteps": 5},
    )
    
    repo.update_status.return_value = None
    repo.complete.return_value = None
    repo.fail.return_value = None
    repo.cancel.return_value = True
    
    repo.list_for_user.return_value = ([], 0)
    
    return repo


@pytest.fixture
def mock_conversation_repo():
    """Mock conversation repository."""
    repo = AsyncMock(spec=ConversationRepository)
    
    conv_id = str(uuid4())
    
    repo.create.return_value = Conversation(
        id=conv_id,
        tenant_id="test-tenant",
        user_id="test-user",
        title="Test Conversation",
        created_at=datetime.utcnow(),
    )
    
    repo.get.return_value = Conversation(
        id=conv_id,
        tenant_id="test-tenant",
        user_id="test-user",
        title="Test Conversation",
        created_at=datetime.utcnow(),
        message_count=5,
    )
    
    repo.add_message.return_value = Message(
        id=str(uuid4()),
        conversation_id=conv_id,
        role="assistant",
        content="Test response",
        created_at=datetime.utcnow(),
    )
    
    repo.get_messages.return_value = []
    repo.list_for_user.return_value = ([], 0)
    
    return repo


# ============================================================================
# Database Mocks
# ============================================================================

@pytest.fixture
def mock_database():
    """Mock database connection."""
    db = AsyncMock()
    
    db.execute.return_value = MagicMock(
        data=[],
        error=None,
    )
    
    return db


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    client = MagicMock()
    
    client.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[],
        error=None,
    )
    
    client.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": str(uuid4())}],
        error=None,
    )
    
    return client


# ============================================================================
# Workflow Fixtures
# ============================================================================

@pytest.fixture
def sample_workflow():
    """Sample workflow definition."""
    return {
        "id": f"workflow-{uuid4().hex[:8]}",
        "name": "Test Workflow",
        "description": "A test workflow for integration testing",
        "nodes": [
            {
                "id": "start-1",
                "type": "start",
                "position": {"x": 0, "y": 0},
                "data": {"label": "Start"},
            },
            {
                "id": "expert-1",
                "type": "expert",
                "position": {"x": 200, "y": 0},
                "data": {
                    "label": "Expert",
                    "config": {"agentId": "agent-1", "mode": 1},
                },
            },
            {
                "id": "end-1",
                "type": "end",
                "position": {"x": 400, "y": 0},
                "data": {"label": "End"},
            },
        ],
        "edges": [
            {"id": "e1", "source": "start-1", "target": "expert-1"},
            {"id": "e2", "source": "expert-1", "target": "end-1"},
        ],
        "config": {},
    }


@pytest.fixture
def complex_workflow():
    """Complex workflow with branching."""
    return {
        "id": f"workflow-{uuid4().hex[:8]}",
        "name": "Complex Workflow",
        "nodes": [
            {"id": "start", "type": "start", "position": {"x": 0, "y": 100}, "data": {}},
            {"id": "router", "type": "router", "position": {"x": 200, "y": 100}, "data": {
                "config": {"conditions": [
                    {"field": "topic", "operator": "contains", "value": "medical"},
                    {"field": "topic", "operator": "contains", "value": "legal"},
                ]}
            }},
            {"id": "expert-medical", "type": "expert", "position": {"x": 400, "y": 0}, "data": {
                "config": {"agentId": "medical-expert", "mode": 2}
            }},
            {"id": "expert-legal", "type": "expert", "position": {"x": 400, "y": 200}, "data": {
                "config": {"agentId": "legal-expert", "mode": 2}
            }},
            {"id": "expert-general", "type": "expert", "position": {"x": 400, "y": 100}, "data": {
                "config": {"agentId": "general-expert", "mode": 1}
            }},
            {"id": "merge", "type": "merge", "position": {"x": 600, "y": 100}, "data": {}},
            {"id": "end", "type": "end", "position": {"x": 800, "y": 100}, "data": {}},
        ],
        "edges": [
            {"id": "e1", "source": "start", "target": "router"},
            {"id": "e2", "source": "router", "target": "expert-medical", "label": "medical"},
            {"id": "e3", "source": "router", "target": "expert-legal", "label": "legal"},
            {"id": "e4", "source": "router", "target": "expert-general", "label": "default"},
            {"id": "e5", "source": "expert-medical", "target": "merge"},
            {"id": "e6", "source": "expert-legal", "target": "merge"},
            {"id": "e7", "source": "expert-general", "target": "merge"},
            {"id": "e8", "source": "merge", "target": "end"},
        ],
        "config": {},
    }


# ============================================================================
# LLM Mocks
# ============================================================================

@pytest.fixture
def mock_llm_response():
    """Mock LLM response."""
    response = MagicMock()
    response.choices = [MagicMock(
        message=MagicMock(content="Test response from LLM"),
        finish_reason="stop",
    )]
    response.usage = MagicMock(
        prompt_tokens=100,
        completion_tokens=50,
        total_tokens=150,
    )
    response.model = "gpt-4"
    return response


@pytest.fixture
def mock_openai_client(mock_llm_response):
    """Mock OpenAI client."""
    client = AsyncMock()
    client.chat.completions.create.return_value = mock_llm_response
    return client


@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic client."""
    client = AsyncMock()
    response = MagicMock()
    response.content = [MagicMock(text="Test response from Claude")]
    response.usage = MagicMock(
        input_tokens=100,
        output_tokens=50,
    )
    response.model = "claude-3-opus-20240229"
    response.stop_reason = "end_turn"
    
    client.messages.create.return_value = response
    return client


# ============================================================================
# HTTP Fixtures
# ============================================================================

@pytest.fixture
def auth_headers(tenant_id, user_id):
    """Generate authentication headers."""
    return {
        "Authorization": "Bearer test-jwt-token",
        "X-Tenant-ID": tenant_id,
        "X-User-ID": user_id,
    }


@pytest.fixture
def mock_request():
    """Mock HTTP request."""
    request = MagicMock()
    request.url.path = "/api/v1/test"
    request.method = "POST"
    request.headers = {}
    return request


# ============================================================================
# Utility Functions
# ============================================================================

def create_test_job(
    tenant_id: str = "test-tenant",
    user_id: str = "test-user",
    status: str = "pending",
    job_type: str = "workflow",
) -> Job:
    """Create a test job instance."""
    return Job(
        id=str(uuid4()),
        tenant_id=tenant_id,
        user_id=user_id,
        job_type=job_type,
        status=status,
        created_at=datetime.utcnow(),
    )


def create_test_conversation(
    tenant_id: str = "test-tenant",
    user_id: str = "test-user",
) -> Conversation:
    """Create a test conversation instance."""
    return Conversation(
        id=str(uuid4()),
        tenant_id=tenant_id,
        user_id=user_id,
        title="Test Conversation",
        created_at=datetime.utcnow(),
    )


def create_test_message(
    conversation_id: str,
    role: str = "assistant",
    content: str = "Test message",
) -> Message:
    """Create a test message instance."""
    return Message(
        id=str(uuid4()),
        conversation_id=conversation_id,
        role=role,
        content=content,
        created_at=datetime.utcnow(),
    )


def create_token_usage(
    prompt_tokens: int = 100,
    completion_tokens: int = 50,
) -> TokenUsage:
    """Create a test token usage instance."""
    return TokenUsage(
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
    )











