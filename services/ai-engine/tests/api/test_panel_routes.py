"""
Tests for Ask Panel API endpoints

Tests the FastAPI routes with dependency injection.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
from uuid import uuid4
from datetime import datetime, timezone

# This would normally import from main, but for testing we'll create a test app
from fastapi import FastAPI
from api.routes import panels
from api.dependencies import set_supabase_client
from services.supabase_client import SupabaseClient
from vital_shared_kernel.multi_tenant import TenantContext, TenantId
from middleware.tenant_isolation import TenantIsolationMiddleware


@pytest.fixture
def tenant_id():
    """Test tenant ID"""
    return str(uuid4())


@pytest.fixture
def user_id():
    """Test user ID"""
    return str(uuid4())


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client"""
    client = Mock(spec=SupabaseClient)
    client.client = Mock()  # Mock the underlying Supabase client
    return client


@pytest.fixture
def test_app(mock_supabase_client):
    """Create test FastAPI app with panel routes"""
    app = FastAPI()
    
    # Set mock Supabase client
    set_supabase_client(mock_supabase_client)
    
    # Add tenant isolation middleware
    app.add_middleware(TenantIsolationMiddleware)
    
    # Include panel routes
    app.include_router(panels.router)
    
    return app


@pytest.fixture
def client(test_app):
    """Test client"""
    return TestClient(test_app)


class TestPanelAPI:
    """Test panel API endpoints"""
    
    def test_create_panel_missing_tenant_header(self, client, user_id):
        """Test create panel without tenant header"""
        response = client.post(
            "/api/v1/panels/",
            json={
                "query": "What are FDA requirements for Class II devices?",
                "panel_type": "structured",
                "agents": ["regulatory_expert", "clinical_expert", "quality_expert"]
            },
            headers={"X-User-ID": user_id}
        )
        
        assert response.status_code == 401
    
    def test_create_panel_missing_user_header(self, client, tenant_id):
        """Test create panel without user header"""
        response = client.post(
            "/api/v1/panels/",
            json={
                "query": "What are FDA requirements for Class II devices?",
                "panel_type": "structured",
                "agents": ["regulatory_expert", "clinical_expert", "quality_expert"]
            },
            headers={"X-Tenant-ID": tenant_id}
        )
        
        assert response.status_code == 401
        assert "X-User-ID header required" in response.json()["detail"]
    
    def test_create_panel_invalid_request(self, client, tenant_id, user_id):
        """Test create panel with invalid request"""
        response = client.post(
            "/api/v1/panels/",
            json={
                "query": "Short",  # Too short
                "panel_type": "structured",
                "agents": []  # Empty agents
            },
            headers={
                "X-Tenant-ID": tenant_id,
                "X-User-ID": user_id
            }
        )
        
        # Should fail validation
        assert response.status_code == 422  # Unprocessable Entity
    
    def test_execute_panel_missing_tenant(self, client):
        """Test execute panel without tenant"""
        panel_id = str(uuid4())
        response = client.post(
            "/api/v1/panels/execute",
            json={"panel_id": panel_id}
        )
        
        assert response.status_code == 401
    
    def test_get_panel_missing_tenant(self, client):
        """Test get panel without tenant"""
        panel_id = str(uuid4())
        response = client.get(
            f"/api/v1/panels/{panel_id}"
        )
        
        assert response.status_code == 401
    
    def test_list_panels_missing_tenant(self, client):
        """Test list panels without tenant"""
        response = client.get("/api/v1/panels/")
        
        assert response.status_code == 401
    
    def test_list_panels_with_pagination(self, client, tenant_id):
        """Test list panels with pagination parameters"""
        response = client.get(
            "/api/v1/panels/",
            params={"page": 2, "page_size": 10},
            headers={"X-Tenant-ID": tenant_id}
        )
        
        # Will fail due to missing Supabase, but validates route
        assert response.status_code in [401, 503]


class TestPanelRequestValidation:
    """Test request validation"""
    
    def test_create_panel_request_validation(self):
        """Test CreatePanelRequest validation"""
        from api.routes.panels import CreatePanelRequest
        
        # Valid request
        request = CreatePanelRequest(
            query="What are the regulatory requirements for AI medical devices?",
            agents=["regulatory_expert", "clinical_expert", "quality_expert"]
        )
        
        assert request.query is not None
        assert len(request.agents) == 3
        assert request.panel_type.value == "structured"
    
    def test_create_panel_request_too_few_agents(self):
        """Test CreatePanelRequest with too few agents"""
        from api.routes.panels import CreatePanelRequest
        from pydantic import ValidationError
        
        with pytest.raises(ValidationError):
            CreatePanelRequest(
                query="Test query?",
                agents=["expert1", "expert2"]  # Less than min_items=3
            )
    
    def test_create_panel_request_too_many_agents(self):
        """Test CreatePanelRequest with too many agents"""
        from api.routes.panels import CreatePanelRequest
        from pydantic import ValidationError
        
        with pytest.raises(ValidationError):
            CreatePanelRequest(
                query="Test query?",
                agents=[f"expert{i}" for i in range(10)]  # More than max_items=5
            )
    
    def test_execute_panel_request_validation(self):
        """Test ExecutePanelRequest validation"""
        from api.routes.panels import ExecutePanelRequest
        
        panel_id = uuid4()
        request = ExecutePanelRequest(panel_id=panel_id)
        
        assert request.panel_id == panel_id


class TestDependencyInjection:
    """Test dependency injection"""
    
    def test_get_supabase_client_not_initialized(self):
        """Test getting Supabase client when not initialized"""
        from api.dependencies import get_supabase_client, _supabase_client
        from fastapi import HTTPException
        
        # Temporarily clear client
        import api.dependencies
        original = api.dependencies._supabase_client
        api.dependencies._supabase_client = None
        
        try:
            with pytest.raises(HTTPException) as exc_info:
                get_supabase_client()
            
            assert exc_info.value.status_code == 503
        finally:
            # Restore
            api.dependencies._supabase_client = original
    
    def test_get_current_user_id_missing_header(self):
        """Test getting user ID without header"""
        from api.dependencies import get_current_user_id
        from fastapi import HTTPException
        
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_id(x_user_id=None)
        
        assert exc_info.value.status_code == 401
    
    def test_get_current_user_id_invalid_uuid(self):
        """Test getting user ID with invalid UUID"""
        from api.dependencies import get_current_user_id
        from fastapi import HTTPException
        
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_id(x_user_id="not-a-uuid")
        
        assert exc_info.value.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

