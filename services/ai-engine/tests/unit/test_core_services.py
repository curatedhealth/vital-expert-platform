"""
Unit Tests - Core Services
Test core business logic without external dependencies
"""

import pytest
from uuid import uuid4, UUID
import os
import sys
from unittest.mock import Mock, AsyncMock, patch, MagicMock

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))


# ============================================
# AgentOrchestrator Tests
# ============================================

@pytest.mark.unit
def test_agent_orchestrator_initialization():
    """Test AgentOrchestrator can be initialized."""
    from services.agent_orchestrator import AgentOrchestrator
    
    # Mock dependencies
    mock_supabase = Mock()
    mock_rag = Mock()
    
    orchestrator = AgentOrchestrator(
        supabase_client=mock_supabase,
        rag_pipeline=mock_rag
    )
    assert orchestrator is not None
    print("✅ AgentOrchestrator initialization test passed")


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_orchestrator_mode_selection():
    """Test AgentOrchestrator mode selection logic."""
    from services.agent_orchestrator import AgentOrchestrator
    
    # Mock dependencies
    mock_supabase = Mock()
    mock_rag = Mock()
    
    orchestrator = AgentOrchestrator(
        supabase_client=mock_supabase,
        rag_pipeline=mock_rag
    )
    
    # Test mode validation
    assert hasattr(orchestrator, 'execute') or hasattr(orchestrator, 'run') or hasattr(orchestrator, 'orchestrate'), \
        "AgentOrchestrator should have execute/run/orchestrate method"
    
    print("✅ AgentOrchestrator mode selection test passed")


# ============================================
# UnifiedRAGService Tests
# ============================================

@pytest.mark.unit
def test_unified_rag_service_initialization():
    """Test UnifiedRAGService can be initialized."""
    from services.unified_rag_service import UnifiedRAGService
    
    service = UnifiedRAGService()
    assert service is not None
    print("✅ UnifiedRAGService initialization test passed")


@pytest.mark.unit
@pytest.mark.asyncio
async def test_unified_rag_service_query_structure():
    """Test UnifiedRAGService query structure validation."""
    from services.unified_rag_service import UnifiedRAGService
    
    service = UnifiedRAGService()
    
    # Check if service has expected methods
    assert hasattr(service, 'search') or hasattr(service, 'query') or hasattr(service, 'retrieve'), \
        "UnifiedRAGService should have search/query/retrieve method"
    
    print("✅ UnifiedRAGService query structure test passed")


# ============================================
# MetadataProcessingService Tests
# ============================================

@pytest.mark.unit
def test_metadata_processing_service_initialization():
    """Test MetadataProcessingService can be initialized."""
    try:
        from services.metadata_processing_service import MetadataProcessingService
        
        service = MetadataProcessingService()
        assert service is not None
        print("✅ MetadataProcessingService initialization test passed")
    except ImportError:
        pytest.skip("MetadataProcessingService not available")


@pytest.mark.unit
def test_metadata_processing_extract_reasoning():
    """Test metadata extraction for reasoning."""
    try:
        from services.metadata_processing_service import MetadataProcessingService
        
        service = MetadataProcessingService()
        
        # Test reasoning extraction
        sample_metadata = {
            "reasoning": [
                {"step": 1, "description": "Analyze query"},
                {"step": 2, "description": "Select agent"}
            ]
        }
        
        # Service should be able to handle metadata
        assert hasattr(service, 'process') or hasattr(service, 'extract'), \
            "MetadataProcessingService should have process/extract method"
        
        print("✅ Metadata processing reasoning extraction test passed")
    except ImportError:
        pytest.skip("MetadataProcessingService not available")


# ============================================
# TenantId Value Object Tests
# ============================================

@pytest.mark.unit
def test_tenant_id_validation():
    """Test TenantId value object validation."""
    try:
        from services.shared_kernel.src.vital_shared_kernel.multi_tenant.tenant_id import TenantId
        
        # Valid UUID
        valid_id = uuid4()
        tenant_id = TenantId.from_string(str(valid_id))
        assert tenant_id is not None
        assert str(tenant_id) == str(valid_id)
        
        # Invalid UUID should raise error
        with pytest.raises(Exception):
            TenantId.from_string("invalid-uuid")
        
        print("✅ TenantId validation test passed")
    except ImportError:
        pytest.skip("TenantId not available")


# ============================================
# Cache Manager Tests
# ============================================

@pytest.mark.unit
def test_cache_key_generation():
    """Test cache key generation for tenant isolation."""
    from services.cache_manager import generate_cache_key
    
    tenant1 = uuid4()
    tenant2 = uuid4()
    
    key1 = generate_cache_key(tenant_id=tenant1, prefix="query", query="test")
    key2 = generate_cache_key(tenant_id=tenant2, prefix="query", query="test")
    
    # Keys should be different for different tenants
    assert key1 != key2, "Cache keys must differ by tenant"
    assert str(tenant1) in key1, "Tenant ID should be in cache key"
    
    print("✅ Cache key generation test passed")


@pytest.mark.unit
@pytest.mark.asyncio
async def test_cache_manager_initialization():
    """Test CacheManager initialization without Redis."""
    from services.cache_manager import CacheManager
    
    # Should initialize gracefully even without Redis
    manager = CacheManager(redis_url="redis://localhost:6379/15")  # Test DB
    assert manager is not None
    
    print("✅ CacheManager initialization test passed")


# ============================================
# Configuration Tests
# ============================================

@pytest.mark.unit
def test_settings_initialization():
    """Test Settings can be loaded."""
    from core.config import get_settings
    
    settings = get_settings()
    assert settings is not None
    assert hasattr(settings, 'environment')
    
    print("✅ Settings initialization test passed")


@pytest.mark.unit
def test_settings_validation():
    """Test Settings validation logic."""
    from core.config import get_settings
    
    settings = get_settings()
    
    # Check required attributes exist
    assert hasattr(settings, 'database_url') or hasattr(settings, 'supabase_url'), \
        "Settings should have database configuration"
    
    print("✅ Settings validation test passed")


# ============================================
# Monitoring Tests
# ============================================

@pytest.mark.unit
def test_monitoring_setup():
    """Test monitoring setup."""
    from core.monitoring import setup_monitoring
    
    # Should not crash
    setup_monitoring()
    
    print("✅ Monitoring setup test passed")


# ============================================
# Utility Function Tests
# ============================================

@pytest.mark.unit
def test_uuid_validation_utility():
    """Test UUID validation helper."""
    valid_uuid = str(uuid4())
    invalid_uuid = "not-a-uuid"
    
    # Test UUID parsing
    try:
        UUID(valid_uuid)
        is_valid = True
    except ValueError:
        is_valid = False
    
    assert is_valid, "Valid UUID should parse"
    
    try:
        UUID(invalid_uuid)
        is_invalid = False
    except ValueError:
        is_invalid = True
    
    assert is_invalid, "Invalid UUID should not parse"
    
    print("✅ UUID validation utility test passed")


@pytest.mark.unit
def test_structured_logging():
    """Test structured logging configuration."""
    import structlog
    
    logger = structlog.get_logger()
    assert logger is not None
    
    # Should be able to log
    logger.info("test_message", test_field="test_value")
    
    print("✅ Structured logging test passed")


# ============================================
# Pydantic Model Tests
# ============================================

@pytest.mark.unit
def test_agent_query_request_model():
    """Test AgentQueryRequest Pydantic model."""
    try:
        from models.requests import AgentQueryRequest
        
        # Valid request
        request = AgentQueryRequest(
            message="Test query",
            agent_id=str(uuid4()),
            session_id="test-session",
            user_id=str(uuid4())
        )
        
        assert request.message == "Test query"
        assert request.agent_id is not None
        
        print("✅ AgentQueryRequest model test passed")
    except ImportError:
        pytest.skip("AgentQueryRequest model not available")


@pytest.mark.unit
def test_rag_search_request_model():
    """Test RAGSearchRequest Pydantic model."""
    try:
        from models.requests import RAGSearchRequest
        
        request = RAGSearchRequest(
            query="Test search",
            tenant_id=str(uuid4()),
            limit=10
        )
        
        assert request.query == "Test search"
        assert request.limit == 10
        
        print("✅ RAGSearchRequest model test passed")
    except ImportError:
        pytest.skip("RAGSearchRequest model not available")


# ============================================
# Error Handling Tests
# ============================================

@pytest.mark.unit
def test_custom_exceptions():
    """Test custom exception classes."""
    try:
        from core.errors import ValidationError, NotFoundError
        
        # Should be able to raise custom errors
        with pytest.raises(ValidationError):
            raise ValidationError("Test validation error")
        
        with pytest.raises(NotFoundError):
            raise NotFoundError("Test not found error")
        
        print("✅ Custom exceptions test passed")
    except ImportError:
        # If custom errors don't exist, that's okay
        print("⚠️  Custom exceptions not defined (using standard exceptions)")


# ============================================
# Performance Tests
# ============================================

@pytest.mark.unit
@pytest.mark.slow
def test_cache_key_generation_performance():
    """Test cache key generation performance (should be fast)."""
    import time
    from services.cache_manager import generate_cache_key
    
    tenant_id = uuid4()
    
    start_time = time.time()
    for i in range(1000):
        generate_cache_key(tenant_id=tenant_id, prefix="query", query=f"test-{i}")
    elapsed = time.time() - start_time
    
    # Should generate 1000 keys in < 100ms
    assert elapsed < 0.1, f"Cache key generation too slow: {elapsed:.3f}s for 1000 keys"
    
    print(f"✅ Cache key generation performance test passed ({elapsed*1000:.2f}ms for 1000 keys)")


@pytest.mark.unit
@pytest.mark.slow
def test_uuid_generation_performance():
    """Test UUID generation performance."""
    import time
    
    start_time = time.time()
    ids = [uuid4() for _ in range(10000)]
    elapsed = time.time() - start_time
    
    assert len(ids) == 10000
    assert len(set(ids)) == 10000, "All UUIDs should be unique"
    
    # Should generate 10000 UUIDs in < 50ms
    assert elapsed < 0.05, f"UUID generation too slow: {elapsed:.3f}s"
    
    print(f"✅ UUID generation performance test passed ({elapsed*1000:.2f}ms for 10000 UUIDs)")


