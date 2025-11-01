# 🚀 Phase 6: Testing & Deployment
## Complete Implementation Guide - Testing Strategy & Modal.com Deployment

**Duration**: 5-7 days  
**Complexity**: Medium-High  
**Prerequisites**: Phase 5 complete (Frontend)  
**Outcome**: Production-ready deployment on Modal.com

---

## 📋 Overview

Phase 6 implements comprehensive testing and deploys the complete Ask Panel service to Modal.com with monitoring, observability, and rollback procedures.

### What You'll Build

```
┌─────────────────────────────────────────────────────────┐
│                 PRODUCTION DEPLOYMENT                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐        ┌──────────────┐            │
│  │  Frontend    │────────│  Backend API │            │
│  │  (Vercel)    │        │  (Modal.com) │            │
│  └──────────────┘        └──────┬───────┘            │
│                                  │                     │
│                          ┌───────┴───────┐            │
│                          │                │            │
│                    ┌─────▼────┐    ┌─────▼────┐      │
│                    │ Database │    │ Monitoring│      │
│                    │(Supabase)│    │(LangFuse) │      │
│                    └──────────┘    └──────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Phase 6 Components

**6.1** - Unit Testing (Domain + Infrastructure)  
**6.2** - Integration Testing (API + Database)  
**6.3** - Multi-Tenant Security Testing  
**6.4** - Performance & Load Testing  
**6.5** - Modal.com Deployment  
**6.6** - Monitoring & Observability  

---

## PROMPT 6.1: Comprehensive Unit Tests

```
TASK: Create complete unit test suite for domain and infrastructure layers

CONTEXT:
Unit tests validate business logic, value objects, and domain behavior.
Focus on tenant isolation, validation rules, and state transitions.

LOCATION: services/ask-panel-service/tests/

CREATE FILES:

1. tests/domain/test_panel_aggregate.py

```python
"""Unit tests for Panel Aggregate Root"""

import pytest
from datetime import datetime

from src.domain.models.panel import Panel, PanelMember, PanelMessage
from src.domain.models.panel_id import PanelId
from src.domain.models.panel_type import STRUCTURED, OPEN
from src.domain.models.panel_status import DRAFT, IN_PROGRESS, COMPLETED
from src.domain.models.consensus_result import ConsensusResult
from vital_shared_kernel.multi_tenant import TenantId, TenantContext


@pytest.fixture
def tenant_id():
    """Setup tenant context"""
    tid = TenantId.from_string("11111111-1111-1111-1111-111111111111")
    TenantContext.set(tid)
    return tid


@pytest.fixture
def panel(tenant_id):
    """Create test panel"""
    return Panel(
        panel_id=PanelId.generate(),
        tenant_id=tenant_id,
        query="How should we approach FDA 510(k) submission?",
        panel_type=STRUCTURED
    )


class TestPanelCreation:
    """Test panel creation and validation"""
    
    def test_create_valid_panel(self, tenant_id):
        """Test creating a valid panel"""
        panel = Panel(
            panel_id=PanelId.generate(),
            tenant_id=tenant_id,
            query="Test query",
            panel_type=STRUCTURED
        )
        
        assert panel.panel_id is not None
        assert panel.tenant_id == tenant_id
        assert panel.query == "Test query"
        assert panel.status == DRAFT
    
    def test_create_panel_with_empty_query(self, tenant_id):
        """Test that empty query raises error"""
        with pytest.raises(ValueError, match="query cannot be empty"):
            Panel(
                panel_id=PanelId.generate(),
                tenant_id=tenant_id,
                query="",
                panel_type=STRUCTURED
            )
    
    def test_create_panel_wrong_tenant_context(self, tenant_id):
        """Test that wrong tenant context raises error"""
        different_tenant = TenantId.from_string("22222222-2222-2222-2222-222222222222")
        
        with pytest.raises(ValueError, match="Tenant mismatch"):
            Panel(
                panel_id=PanelId.generate(),
                tenant_id=different_tenant,
                query="Test query",
                panel_type=STRUCTURED
            )


class TestPanelMembers:
    """Test expert member management"""
    
    def test_add_member(self, panel):
        """Test adding expert to panel"""
        panel.add_member("fda_expert", "Dr. FDA Expert", "Regulatory")
        
        assert len(panel.members) == 1
        assert panel.members[0].agent_id == "fda_expert"
    
    def test_add_duplicate_member(self, panel):
        """Test that duplicate member raises error"""
        panel.add_member("fda_expert", "Dr. FDA Expert", "Regulatory")
        
        with pytest.raises(ValueError, match="already in panel"):
            panel.add_member("fda_expert", "Dr. FDA Expert", "Regulatory")
    
    def test_exceed_max_experts(self, panel):
        """Test exceeding maximum experts for panel type"""
        # Structured panels allow max 5 experts
        for i in range(5):
            panel.add_member(f"expert_{i}", f"Expert {i}", "Role")
        
        with pytest.raises(ValueError, match="maximum"):
            panel.add_member("expert_6", "Expert 6", "Role")


class TestPanelDiscussions:
    """Test discussion round management"""
    
    def test_start_discussion_round(self, panel):
        """Test starting a discussion round"""
        panel.change_status(IN_PROGRESS)
        discussion = panel.start_discussion_round(1)
        
        assert discussion.round_number == 1
        assert len(panel.discussions) == 1
    
    def test_add_message_to_discussion(self, panel):
        """Test adding message to discussion"""
        panel.change_status(IN_PROGRESS)
        panel.start_discussion_round(1)
        
        panel.add_message(
            round_number=1,
            agent_id="expert_1",
            agent_name="Expert 1",
            content="My analysis is..."
        )
        
        assert panel.discussions[0].messages[0].content == "My analysis is..."
    
    def test_complete_discussion_round(self, panel):
        """Test completing a discussion round"""
        panel.change_status(IN_PROGRESS)
        panel.start_discussion_round(1)
        panel.add_message(1, "expert_1", "Expert 1", "Message")
        
        panel.complete_discussion_round(1)
        
        assert panel.discussions[0].completed_at is not None


class TestPanelConsensus:
    """Test consensus and completion"""
    
    def test_update_consensus(self, panel):
        """Test updating panel consensus"""
        consensus = ConsensusResult(
            level=0.85,
            recommendation="Proceed with 510(k)",
            reasoning="Strong agreement across experts",
            confidence=0.9,
            dimensions={"technical": 0.9, "regulatory": 0.8},
            dissenting_opinions=[],
            calculated_at=datetime.utcnow(),
            method="quantum"
        )
        
        panel.update_consensus(consensus)
        
        assert panel.consensus.level == 0.85
        assert panel.has_consensus
    
    def test_complete_panel(self, panel):
        """Test panel completion"""
        # Setup consensus
        consensus = ConsensusResult(
            level=0.85,
            recommendation="Proceed with 510(k)",
            reasoning="Strong agreement",
            confidence=0.9,
            dimensions={},
            dissenting_opinions=[],
            calculated_at=datetime.utcnow(),
            method="standard"
        )
        panel.update_consensus(consensus)
        
        # Complete panel
        panel.complete("Final recommendation text")
        
        assert panel.status == COMPLETED
        assert panel.is_complete
        assert panel.completed_at is not None


class TestDomainEvents:
    """Test domain event generation"""
    
    def test_events_generated(self, panel):
        """Test that domain events are generated"""
        panel.add_member("expert_1", "Expert 1", "Role")
        panel.change_status(IN_PROGRESS)
        
        events = panel.get_events()
        
        assert len(events) >= 2
        assert any(e["event_type"] == "member_added" for e in events)
        assert any(e["event_type"] == "status_changed" for e in events)
    
    def test_events_contain_tenant_id(self, panel, tenant_id):
        """Test that all events include tenant ID"""
        panel.add_member("expert_1", "Expert 1", "Role")
        
        events = panel.get_events()
        
        for event in events:
            assert event["tenant_id"] == str(tenant_id)


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

2. tests/infrastructure/test_tenant_isolation.py

```python
"""Unit tests for tenant isolation in infrastructure"""

import pytest
from unittest.mock import Mock, AsyncMock

from src.infrastructure.repositories.panel_repository import PanelRepository
from src.domain.models.panel import Panel
from src.domain.models.panel_id import PanelId
from src.domain.models.panel_type import STRUCTURED
from vital_shared_kernel.multi_tenant import TenantId, TenantContext


@pytest.fixture
def tenant_a():
    """Tenant A context"""
    return TenantId.from_string("11111111-1111-1111-1111-111111111111")


@pytest.fixture
def tenant_b():
    """Tenant B context"""
    return TenantId.from_string("22222222-2222-2222-2222-222222222222")


@pytest.fixture
def mock_supabase():
    """Mock Supabase client"""
    return Mock()


@pytest.fixture
def repository(mock_supabase):
    """Panel repository"""
    return PanelRepository(mock_supabase)


class TestTenantIsolation:
    """Test tenant data isolation"""
    
    @pytest.mark.asyncio
    async def test_save_includes_tenant_id(self, repository, tenant_a):
        """Test that save includes tenant_id"""
        TenantContext.set(tenant_a)
        
        panel = Panel(
            panel_id=PanelId.generate(),
            tenant_id=tenant_a,
            query="Test",
            panel_type=STRUCTURED
        )
        
        # Mock insert
        repository.supabase.table().insert = AsyncMock()
        
        await repository.save(panel)
        
        # Verify insert called with tenant_id
        call_args = repository.supabase.table().insert.call_args
        assert call_args is not None
    
    @pytest.mark.asyncio
    async def test_find_filters_by_tenant(self, repository, tenant_a):
        """Test that find filters by tenant_id"""
        TenantContext.set(tenant_a)
        
        # Mock select with filter
        mock_result = Mock()
        mock_result.data = []
        repository.supabase.table().select().eq = AsyncMock(return_value=mock_result)
        
        panel_id = PanelId.generate()
        await repository.find_by_id(panel_id)
        
        # Verify eq called with tenant_id
        # (In real implementation, verify SQL includes tenant_id filter)
    
    @pytest.mark.asyncio
    async def test_cannot_access_other_tenant_data(self, repository, tenant_a, tenant_b):
        """Test that tenant A cannot access tenant B's data"""
        # Create panel as tenant B
        TenantContext.set(tenant_b)
        panel_b = Panel(
            panel_id=PanelId.generate(),
            tenant_id=tenant_b,
            query="Tenant B panel",
            panel_type=STRUCTURED
        )
        
        # Mock save
        repository.supabase.table().insert = AsyncMock()
        await repository.save(panel_b)
        
        # Try to access as tenant A
        TenantContext.set(tenant_a)
        
        # Mock find returns nothing for wrong tenant
        mock_result = Mock()
        mock_result.data = []
        repository.supabase.table().select().eq = AsyncMock(return_value=mock_result)
        
        result = await repository.find_by_id(panel_b.panel_id)
        
        # Should not find panel from other tenant
        assert result is None


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

Implement comprehensive unit tests with 80%+ coverage.
```

---

## PROMPT 6.2: Integration Testing

```
TASK: Create integration tests for API endpoints with database

CONTEXT:
Integration tests validate full request/response cycle with real database.
Test multi-tenant security, API contracts, and error handling.

LOCATION: services/ask-panel-service/tests/integration/

CREATE FILE: test_panel_api.py

```python
"""Integration tests for Panel API"""

import pytest
from httpx import AsyncClient
from fastapi import FastAPI

from src.api.main import app
from vital_shared_kernel.multi_tenant import TenantId


@pytest.fixture
async def client():
    """HTTP client for testing"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def tenant_id():
    """Test tenant ID"""
    return "11111111-1111-1111-1111-111111111111"


class TestPanelCreation:
    """Test panel creation endpoint"""
    
    @pytest.mark.asyncio
    async def test_create_panel_success(self, client, tenant_id):
        """Test successful panel creation"""
        response = await client.post(
            "/api/v1/panels",
            headers={"X-Tenant-ID": tenant_id},
            json={
                "query": "FDA 510(k) strategy?",
                "panel_type": "structured",
                "agent_ids": ["fda_expert", "clinical_expert"]
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "panel_id" in data
        assert data["panel_type"] == "structured"
    
    @pytest.mark.asyncio
    async def test_create_panel_missing_tenant_id(self, client):
        """Test panel creation without tenant ID"""
        response = await client.post(
            "/api/v1/panels",
            json={
                "query": "Test query",
                "panel_type": "structured"
            }
        )
        
        assert response.status_code == 400
        assert "X-Tenant-ID" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_create_panel_invalid_type(self, client, tenant_id):
        """Test panel creation with invalid type"""
        response = await client.post(
            "/api/v1/panels",
            headers={"X-Tenant-ID": tenant_id},
            json={
                "query": "Test query",
                "panel_type": "invalid_type"
            }
        )
        
        assert response.status_code == 400


class TestPanelRetrieval:
    """Test panel retrieval endpoints"""
    
    @pytest.mark.asyncio
    async def test_get_panel_success(self, client, tenant_id):
        """Test retrieving existing panel"""
        # First create panel
        create_response = await client.post(
            "/api/v1/panels",
            headers={"X-Tenant-ID": tenant_id},
            json={
                "query": "Test query",
                "panel_type": "structured"
            }
        )
        panel_id = create_response.json()["panel_id"]
        
        # Then retrieve it
        response = await client.get(
            f"/api/v1/panels/{panel_id}",
            headers={"X-Tenant-ID": tenant_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["panel_id"] == panel_id
    
    @pytest.mark.asyncio
    async def test_get_panel_wrong_tenant(self, client):
        """Test that tenant B cannot access tenant A's panel"""
        tenant_a = "11111111-1111-1111-1111-111111111111"
        tenant_b = "22222222-2222-2222-2222-222222222222"
        
        # Create panel as tenant A
        create_response = await client.post(
            "/api/v1/panels",
            headers={"X-Tenant-ID": tenant_a},
            json={
                "query": "Tenant A panel",
                "panel_type": "structured"
            }
        )
        panel_id = create_response.json()["panel_id"]
        
        # Try to access as tenant B
        response = await client.get(
            f"/api/v1/panels/{panel_id}",
            headers={"X-Tenant-ID": tenant_b}
        )
        
        assert response.status_code == 404


class TestPanelListing:
    """Test panel listing endpoint"""
    
    @pytest.mark.asyncio
    async def test_list_panels_only_own_tenant(self, client):
        """Test that listing only returns own tenant's panels"""
        tenant_a = "11111111-1111-1111-1111-111111111111"
        tenant_b = "22222222-2222-2222-2222-222222222222"
        
        # Create panels for both tenants
        await client.post(
            "/api/v1/panels",
            headers={"X-Tenant-ID": tenant_a},
            json={"query": "A's panel", "panel_type": "structured"}
        )
        await client.post(
            "/api/v1/panels",
            headers={"X-Tenant-ID": tenant_b},
            json={"query": "B's panel", "panel_type": "structured"}
        )
        
        # List as tenant A
        response = await client.get(
            "/api/v1/panels",
            headers={"X-Tenant-ID": tenant_a}
        )
        
        data = response.json()
        # Should only see tenant A's panel
        assert all(p["query"] == "A's panel" for p in data["panels"])


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

Implement integration tests with real API and database.
```

---

## PROMPT 6.3: Modal.com Deployment Configuration

```
TASK: Create Modal.com deployment configuration for production

CONTEXT:
Deploy FastAPI backend as serverless functions on Modal.com.
Configure GPU access, secrets, volumes, and health checks.

LOCATION: services/ask-panel-service/

CREATE FILES:

1. modal_deploy.py

```python
"""
Modal.com Deployment Configuration
Deploys Ask Panel service as serverless application
"""

import modal

# Create Modal app
app = modal.App("ask-panel-service")

# Docker image with all dependencies
image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "fastapi==0.109.0",
    "uvicorn[standard]==0.27.0",
    "pydantic==2.6.0",
    "supabase==2.3.0",
    "langchain==0.1.0",
    "langgraph==0.0.20",
    "openai==1.12.0",
    "anthropic==0.18.0",
    "redis==5.0.1"
)

# Secrets configuration
secrets = [
    modal.Secret.from_name("ask-panel-secrets"),  # Contains all API keys
]

# Volume for model caching
volume = modal.Volume.from_name("model-cache", create_if_missing=True)


@app.function(
    image=image,
    secrets=secrets,
    gpu="T4",  # GPU for LLM inference
    timeout=600,  # 10 min timeout
    keep_warm=2,  # Keep 2 instances warm
    container_idle_timeout=300,
    volumes={"/cache": volume}
)
@modal.asgi_app()
def fastapi_app():
    """
    Mount FastAPI application
    """
    from src.api.main import app
    return app


@app.function(
    image=image,
    secrets=secrets,
    schedule=modal.Cron("0 * * * *")  # Every hour
)
def cleanup_old_panels():
    """
    Cleanup old completed panels
    Runs every hour
    """
    import asyncio
    from src.application.services.cleanup_service import CleanupService
    
    async def run_cleanup():
        service = CleanupService()
        await service.cleanup_completed_panels(days=30)
    
    asyncio.run(run_cleanup())


@app.local_entrypoint()
def main():
    """
    Deploy application to Modal
    """
    print("Deploying Ask Panel service to Modal.com...")
    print("✅ Deployment complete")
    print("URL: https://your-username--ask-panel-service-fastapi-app.modal.run")


# Health check endpoint
@app.function(image=image)
@modal.web_endpoint(method="GET")
def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ask-panel"}
```

2. Deploy script (deploy.sh)

```bash
#!/bin/bash
# Deploy to Modal.com

set -e

echo "🚀 Deploying Ask Panel Service to Modal.com"

# Check Modal CLI installed
if ! command -v modal &> /dev/null; then
    echo "❌ Modal CLI not found. Install: pip install modal"
    exit 1
fi

# Authenticate
echo "🔐 Checking Modal authentication..."
modal token verify || modal setup

# Create secrets (if not exists)
echo "🔑 Setting up secrets..."
modal secret create ask-panel-secrets \
    OPENAI_API_KEY=$OPENAI_API_KEY \
    ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_KEY=$SUPABASE_KEY \
    REDIS_URL=$REDIS_URL

# Deploy
echo "📦 Deploying application..."
modal deploy modal_deploy.py

echo "✅ Deployment complete!"
echo "🌐 URL: https://your-username--ask-panel-service-fastapi-app.modal.run"
echo "🔍 Health: https://your-username--ask-panel-service-health.modal.run"
```

Implement Modal.com deployment with secrets and GPU configuration.
```

---

## ✅ Phase 6 Checklist

**Unit Tests** (6.1):
- [ ] Domain model tests (80%+ coverage)
- [ ] Value object tests
- [ ] Strategy tests
- [ ] Infrastructure tests
- [ ] Tenant isolation tests

**Integration Tests** (6.2):
- [ ] API endpoint tests
- [ ] Database integration
- [ ] Multi-tenant security tests
- [ ] Error handling tests

**Performance Tests** (6.3):
- [ ] Load testing (100+ concurrent panels)
- [ ] Stress testing
- [ ] Memory profiling
- [ ] Database query optimization

**Deployment** (6.4):
- [ ] Modal.com configuration
- [ ] Secrets management
- [ ] Health checks
- [ ] Monitoring setup

**Monitoring** (6.5):
- [ ] LangFuse integration
- [ ] Error tracking
- [ ] Performance metrics
- [ ] Tenant usage analytics

---

## 🧪 Testing Commands

```bash
# Run all unit tests
pytest tests/domain tests/infrastructure -v --cov=src --cov-report=html

# Run integration tests
pytest tests/integration -v

# Run specific test file
pytest tests/domain/test_panel_aggregate.py -v

# Run with coverage
pytest --cov=src --cov-report=term-missing

# Run load tests
locust -f tests/load/locustfile.py --host=http://localhost:8000
```

---

## 🚀 Deployment Commands

```bash
# Deploy to Modal.com
chmod +x deploy.sh
./deploy.sh

# Check deployment status
modal app list

# View logs
modal app logs ask-panel-service

# Rollback (if needed)
modal app stop ask-panel-service
modal deploy modal_deploy.py --previous-version
```

---

## 📊 Success Metrics

**Testing**:
- ✅ 80%+ code coverage
- ✅ All integration tests pass
- ✅ Multi-tenant security validated
- ✅ Performance targets met

**Deployment**:
- ✅ Zero-downtime deployment
- ✅ Health checks passing
- ✅ Monitoring configured
- ✅ Rollback procedure tested

**Performance**:
- ✅ API response < 500ms (p95)
- ✅ Panel execution < 15 min
- ✅ 100+ concurrent panels
- ✅ 99.95% uptime

---

**Phase 6 Complete** ✅ | **Production Ready!** 🎉
