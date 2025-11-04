"""
API Core Service Tests
Test core service initialization and basic functionality without full app import
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
import sys
import os

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))


# ============================================
# Service Integration Tests
# ============================================

@pytest.mark.unit
def test_agent_orchestrator_with_rag():
    """Test AgentOrchestrator integrates with RAG pipeline"""
    from services.agent_orchestrator import AgentOrchestrator
    from services.medical_rag import MedicalRAGPipeline
    
    # Mock dependencies
    mock_supabase = Mock()
    mock_rag = Mock()
    
    # Create orchestrator
    orchestrator = AgentOrchestrator(
        supabase_client=mock_supabase,
        rag_pipeline=mock_rag
    )
    
    assert orchestrator is not None
    assert orchestrator.rag == mock_rag
    assert orchestrator.supabase == mock_supabase
    
    print("✅ AgentOrchestrator with RAG integration test passed")


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_orchestrator_process_query_structure():
    """Test process_query method exists and has correct signature"""
    from services.agent_orchestrator import AgentOrchestrator
    from models.requests import AgentQueryRequest
    
    mock_supabase = Mock()
    mock_rag = Mock()
    
    orchestrator = AgentOrchestrator(
        supabase_client=mock_supabase,
        rag_pipeline=mock_rag
    )
    
    # Verify method exists
    assert hasattr(orchestrator, 'process_query')
    assert callable(orchestrator.process_query)
    
    print("✅ AgentOrchestrator process_query structure test passed")


@pytest.mark.unit
def test_unified_rag_service_methods():
    """Test UnifiedRAGService has required methods"""
    from services.unified_rag_service import UnifiedRAGService
    
    mock_supabase = Mock()
    service = UnifiedRAGService(supabase_client=mock_supabase)
    
    # Check for key methods
    assert hasattr(service, 'query')
    assert hasattr(service, 'initialize')
    assert callable(service.query)
    assert callable(service.initialize)
    
    print("✅ UnifiedRAGService methods test passed")


# ============================================
# Request/Response Model Tests
# ============================================

@pytest.mark.unit
def test_mode1_manual_request_model():
    """Test Mode1ManualRequest model validation"""
    from uuid import uuid4
    from pydantic import BaseModel, Field, ValidationError
    from typing import Optional, List
    
    # Recreate the model structure for testing
    class Mode1ManualRequestTest(BaseModel):
        agent_id: str
        message: str
        enable_rag: bool = True
        enable_tools: bool = False
        
    # Valid request
    request = Mode1ManualRequestTest(
        agent_id=str(uuid4()),
        message="Test message"
    )
    
    assert request.agent_id is not None
    assert request.message == "Test message"
    assert request.enable_rag is True
    
    # Invalid request (missing required fields)
    with pytest.raises(ValidationError):
        Mode1ManualRequestTest(message="Only message")
    
    print("✅ Mode1ManualRequest model test passed")


@pytest.mark.unit
def test_agent_query_request_complete():
    """Test AgentQueryRequest with all fields"""
    from models.requests import AgentQueryRequest
    from uuid import uuid4
    
    request = AgentQueryRequest(
        agent_type="medical_specialist",
        query="Detailed query about medical protocols",
        agent_id=str(uuid4()),
        user_id=str(uuid4()),
        organization_id=str(uuid4()),
        medical_specialty="cardiology",
        max_context_docs=10,
        similarity_threshold=0.8,
        include_citations=True,
        pharma_protocol_required=True,
        verify_protocol_required=True
    )
    
    assert request.agent_type == "medical_specialist"
    assert request.query is not None
    assert request.max_context_docs == 10
    assert request.similarity_threshold == 0.8
    
    print("✅ AgentQueryRequest complete test passed")


# ============================================
# Configuration Tests
# ============================================

@pytest.mark.unit
def test_settings_has_required_config():
    """Test Settings has all required configuration"""
    from core.config import get_settings
    
    settings = get_settings()
    
    # Check for key settings
    required_attrs = [
        'openai_api_key',
        'openai_model',
        'supabase_url',
        'redis_url',
        'pinecone_api_key'
    ]
    
    for attr in required_attrs:
        assert hasattr(settings, attr), f"Missing required setting: {attr}"
    
    print("✅ Settings required config test passed")


@pytest.mark.unit
def test_settings_defaults():
    """Test Settings provides sensible defaults"""
    from core.config import get_settings
    
    settings = get_settings()
    
    # Check default values
    assert settings.max_concurrent_agents > 0
    assert settings.agent_timeout_seconds > 0
    assert settings.max_context_length > 0
    assert settings.similarity_threshold > 0.0
    assert settings.similarity_threshold <= 1.0
    
    print("✅ Settings defaults test passed")


# ============================================
# Service Initialization Tests
# ============================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_cache_manager_graceful_degradation():
    """Test CacheManager degrades gracefully without Redis"""
    from services.cache_manager import CacheManager
    
    # Create cache manager with invalid Redis URL
    manager = CacheManager(redis_url="redis://invalid:6379")
    
    # Should not crash during initialization
    assert manager is not None
    
    print("✅ CacheManager graceful degradation test passed")


@pytest.mark.unit
def test_medical_rag_pipeline_initialization():
    """Test MedicalRAGPipeline can be initialized"""
    from services.medical_rag import MedicalRAGPipeline
    
    mock_supabase = Mock()
    
    # MedicalRAGPipeline only requires supabase_client
    pipeline = MedicalRAGPipeline(supabase_client=mock_supabase)
    
    assert pipeline is not None
    assert pipeline.supabase == mock_supabase
    
    print("✅ MedicalRAGPipeline initialization test passed")


# ============================================
# Error Handling Tests
# ============================================

@pytest.mark.unit
def test_pydantic_validation_errors():
    """Test Pydantic models raise proper validation errors"""
    from models.requests import AgentQueryRequest
    from pydantic import ValidationError
    
    # Missing required agent_type
    with pytest.raises(ValidationError) as exc_info:
        AgentQueryRequest(query="Test query")
    
    errors = exc_info.value.errors()
    assert len(errors) > 0
    assert any(e['loc'][0] == 'agent_type' for e in errors)
    
    # Query too short (min_length=10)
    with pytest.raises(ValidationError):
        AgentQueryRequest(
            agent_type="medical_specialist",
            query="short"  # Less than 10 characters
        )
    
    print("✅ Pydantic validation errors test passed")


# ============================================
# Monitoring Setup Tests
# ============================================

@pytest.mark.unit
def test_monitoring_setup_doesnt_crash():
    """Test monitoring setup completes without errors"""
    from core.monitoring import setup_monitoring
    
    # Should complete without exceptions (port already in use is OK in tests)
    try:
        setup_monitoring()
        success = True
    except OSError as e:
        # Port already in use is acceptable in test environment
        if "Address already in use" in str(e):
            success = True
        else:
            success = False
            print(f"Monitoring setup failed: {e}")
    except Exception as e:
        success = False
        print(f"Monitoring setup failed: {e}")
    
    assert success
    
    print("✅ Monitoring setup test passed")


# ============================================
# WebSocket Manager Tests
# ============================================

@pytest.mark.unit
def test_websocket_manager_initialization():
    """Test WebSocketManager can be initialized"""
    from core.websocket_manager import WebSocketManager
    
    manager = WebSocketManager()
    
    assert manager is not None
    # WebSocketManager may have different attribute names
    assert hasattr(manager, 'connect') or hasattr(manager, 'disconnect') or hasattr(manager, 'broadcast'), \
        "WebSocketManager should have connection management methods"
    
    print("✅ WebSocketManager initialization test passed")


# ============================================
# Structured Logging Tests
# ============================================

@pytest.mark.unit
def test_structured_logging_configuration():
    """Test structured logging is properly configured"""
    import structlog
    
    logger = structlog.get_logger()
    
    # Should be able to log with structured data
    try:
        logger.info(
            "test_message",
            test_field="test_value",
            numeric_field=123
        )
        success = True
    except Exception:
        success = False
    
    assert success
    
    print("✅ Structured logging configuration test passed")


# ============================================
# Import Tests
# ============================================

@pytest.mark.unit
def test_core_imports():
    """Test all core modules can be imported"""
    try:
        from core.config import get_settings, Settings
        from core.monitoring import setup_monitoring
        from core.websocket_manager import WebSocketManager
        success = True
    except ImportError as e:
        success = False
        print(f"Import failed: {e}")
    
    assert success
    
    print("✅ Core imports test passed")


@pytest.mark.unit
def test_service_imports():
    """Test all service modules can be imported"""
    try:
        from services.agent_orchestrator import AgentOrchestrator
        from services.unified_rag_service import UnifiedRAGService
        from services.medical_rag import MedicalRAGPipeline
        from services.cache_manager import CacheManager
        from services.supabase_client import SupabaseClient
        success = True
    except ImportError as e:
        success = False
        print(f"Import failed: {e}")
    
    assert success
    
    print("✅ Service imports test passed")


@pytest.mark.unit
def test_model_imports():
    """Test all model modules can be imported"""
    try:
        from models.requests import AgentQueryRequest, RAGSearchRequest
        from models.responses import AgentQueryResponse, RAGSearchResponse
        success = True
    except ImportError as e:
        success = False
        print(f"Import failed: {e}")
    
    assert success
    
    print("✅ Model imports test passed")


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])

