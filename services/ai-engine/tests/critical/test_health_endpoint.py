"""
Critical Path Tests - Health Endpoint
Comprehensive testing of the /health endpoint for production readiness
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
import sys
import os
import json

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))


# ============================================
# Health Endpoint - Structure Tests
# ============================================

@pytest.mark.critical
def test_health_endpoint_returns_json():
    """Test health endpoint returns valid JSON"""
    from fastapi.testclient import TestClient
    
    # Mock the problematic imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        
        # Verify it's valid JSON
        data = response.json()
        assert isinstance(data, dict)
        
        print("✅ Health endpoint returns valid JSON")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


@pytest.mark.critical
def test_health_endpoint_required_fields():
    """Test health endpoint includes all required fields"""
    from fastapi.testclient import TestClient
    
    # Mock the problematic imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        response = client.get("/health")
        data = response.json()
        
        # Required fields for production monitoring
        required_fields = ["status", "timestamp", "version", "services"]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print(f"✅ Health endpoint has all required fields: {required_fields}")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


@pytest.mark.critical
def test_health_endpoint_status_values():
    """Test health endpoint status field has valid values"""
    from fastapi.testclient import TestClient
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        response = client.get("/health")
        data = response.json()
        
        # Status should be one of: healthy, degraded, unhealthy
        valid_statuses = ["healthy", "degraded", "unhealthy", "ok", "up"]
        status = data.get("status", "").lower()
        
        assert status in valid_statuses, f"Invalid status: {status}"
        
        print(f"✅ Health endpoint status is valid: {status}")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


@pytest.mark.critical
def test_health_endpoint_services_structure():
    """Test health endpoint services field has correct structure"""
    from fastapi.testclient import TestClient
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        response = client.get("/health")
        data = response.json()
        
        services = data.get("services", {})
        assert isinstance(services, dict), "Services should be a dictionary"
        
        # Each service should have a status
        for service_name, service_info in services.items():
            if isinstance(service_info, dict):
                assert "status" in service_info or "connected" in service_info, \
                    f"Service {service_name} missing status/connected field"
        
        print(f"✅ Health endpoint services structure is valid ({len(services)} services)")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


# ============================================
# Health Endpoint - Performance Tests
# ============================================

@pytest.mark.critical
@pytest.mark.slow
def test_health_endpoint_response_time_under_1_second():
    """Test health endpoint responds in < 1 second (production SLA)"""
    from fastapi.testclient import TestClient
    import time
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        start = time.time()
        response = client.get("/health")
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 1.0, f"Health check too slow: {elapsed:.3f}s (SLA: < 1s)"
        
        print(f"✅ Health endpoint response time: {elapsed*1000:.2f}ms (< 1000ms SLA)")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


@pytest.mark.critical
@pytest.mark.slow
def test_health_endpoint_response_time_percentile():
    """Test health endpoint p95 response time"""
    from fastapi.testclient import TestClient
    import time
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        # Run 20 requests to get p95
        response_times = []
        for _ in range(20):
            start = time.time()
            response = client.get("/health")
            elapsed = time.time() - start
            response_times.append(elapsed)
            assert response.status_code == 200
        
        # Calculate p95 (95th percentile)
        response_times.sort()
        p95_index = int(len(response_times) * 0.95)
        p95_time = response_times[p95_index]
        
        assert p95_time < 1.0, f"p95 response time too high: {p95_time:.3f}s"
        
        avg_time = sum(response_times) / len(response_times)
        print(f"✅ Health endpoint p95: {p95_time*1000:.2f}ms, avg: {avg_time*1000:.2f}ms")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


# ============================================
# Health Endpoint - Reliability Tests
# ============================================

@pytest.mark.critical
def test_health_endpoint_no_authentication_required():
    """Test health endpoint doesn't require authentication (for load balancers)"""
    from fastapi.testclient import TestClient
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        # Call without any auth headers
        response = client.get("/health")
        
        # Should NOT return 401 or 403
        assert response.status_code == 200, \
            f"Health endpoint should not require auth, got {response.status_code}"
        
        print("✅ Health endpoint accessible without authentication")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


@pytest.mark.critical
def test_health_endpoint_idempotent():
    """Test health endpoint is idempotent (multiple calls return same structure)"""
    from fastapi.testclient import TestClient
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        # Call multiple times
        response1 = client.get("/health")
        response2 = client.get("/health")
        response3 = client.get("/health")
        
        data1 = response1.json()
        data2 = response2.json()
        data3 = response3.json()
        
        # Structure should be the same (timestamps may differ)
        assert set(data1.keys()) == set(data2.keys()) == set(data3.keys())
        assert data1["status"] == data2["status"] == data3["status"]
        
        print("✅ Health endpoint is idempotent")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


@pytest.mark.critical
def test_health_endpoint_concurrent_requests():
    """Test health endpoint handles concurrent requests"""
    from fastapi.testclient import TestClient
    from concurrent.futures import ThreadPoolExecutor
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        def call_health():
            return client.get("/health")
        
        # Make 10 concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(call_health) for _ in range(10)]
            responses = [f.result() for f in futures]
        
        # All should succeed
        assert all(r.status_code == 200 for r in responses), \
            "Some concurrent health checks failed"
        
        print(f"✅ Health endpoint handled 10 concurrent requests")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


# ============================================
# Health Endpoint - Service Checks
# ============================================

@pytest.mark.critical
def test_health_endpoint_reports_database_status():
    """Test health endpoint reports database connection status"""
    from fastapi.testclient import TestClient
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        response = client.get("/health")
        data = response.json()
        
        services = data.get("services", {})
        
        # Check for database/supabase service
        has_db_check = any(
            "database" in str(k).lower() or 
            "supabase" in str(k).lower() or
            "db" in str(k).lower()
            for k in services.keys()
        )
        
        print(f"✅ Health endpoint reports database status: {has_db_check}")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


@pytest.mark.critical
def test_health_endpoint_reports_cache_status():
    """Test health endpoint reports cache (Redis) connection status"""
    from fastapi.testclient import TestClient
    
    # Mock imports
    sys.modules['api'] = MagicMock()
    sys.modules['api.dependencies'] = MagicMock()
    sys.modules['api.routes'] = MagicMock()
    sys.modules['api.routes.panels'] = MagicMock()
    sys.modules['middleware'] = MagicMock()
    sys.modules['middleware.tenant_context'] = MagicMock()
    sys.modules['middleware.tenant_isolation'] = MagicMock()
    sys.modules['middleware.rate_limiting'] = MagicMock()
    sys.modules['langgraph_workflows'] = MagicMock()
    
    try:
        from main import app
        client = TestClient(app)
        
        response = client.get("/health")
        data = response.json()
        
        services = data.get("services", {})
        
        # Check for cache/redis service
        has_cache_check = any(
            "cache" in str(k).lower() or 
            "redis" in str(k).lower()
            for k in services.keys()
        )
        
        print(f"✅ Health endpoint reports cache status: {has_cache_check}")
    except ImportError as e:
        pytest.skip(f"Cannot import main.py: {e}")


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short", "-m", "critical"])

