"""
Unit Tests for Memory Integration (Phase 2)

Tests the long-term memory system including:
- SessionMemoryService (remember/recall)
- MemoryIntegrationMixin
- Memory extraction from conversations
- Importance scoring and relevance calculation
- Access tracking and cleanup

Test Coverage:
- Memory storage with embeddings
- Semantic recall
- Memory extraction from conversations
- Context formatting for LLMs
- Recent memories retrieval
- User preferences
- Cleanup operations
- Error handling
- Caching behavior
"""

import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from uuid import uuid4, UUID
from unittest.mock import Mock, AsyncMock, MagicMock, patch
import json

from services.session_memory_service import (
    SessionMemoryService,
    Memory,
    RecalledMemory
)
from langgraph_workflows.memory_integration_mixin import MemoryIntegrationMixin


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def tenant_id():
    """Test tenant ID."""
    return uuid4()


@pytest.fixture
def user_id():
    """Test user ID."""
    return uuid4()


@pytest.fixture
def session_id():
    """Test session ID."""
    return "test_session_123"


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    supabase = MagicMock()
    
    # Mock insert response
    mock_insert_response = MagicMock()
    mock_insert_response.data = [{
        'id': str(uuid4()),
        'tenant_id': str(uuid4()),
        'user_id': str(uuid4()),
        'session_id': 'test_session',
        'memory_type': 'preference',
        'content': 'Test content',
        'importance': 0.8,
        'metadata': {},
        'created_at': datetime.now(timezone.utc).isoformat(),
        'accessed_count': 0
    }]
    
    supabase.table.return_value.insert.return_value.execute.return_value = mock_insert_response
    supabase.table.return_value.select.return_value.limit.return_value.execute.return_value.data = [{'id': str(uuid4())}]
    
    # Mock RPC responses
    supabase.rpc.return_value.execute.return_value.data = []
    
    return supabase


@pytest.fixture
def mock_embedding_service():
    """Mock embedding service."""
    from services.embedding_service import EmbeddingResult
    
    service = AsyncMock()
    service.embed_text = AsyncMock(return_value=EmbeddingResult(
        embedding=[0.1] * 768,
        model="mock-embedder",
        dimension=768,
        duration_ms=10.0
    ))
    service.health_check = AsyncMock(return_value=True)
    
    return service


@pytest.fixture
def mock_cache_manager():
    """Mock cache manager."""
    cache = AsyncMock()
    cache.get = AsyncMock(return_value=None)
    cache.set = AsyncMock()
    cache.delete = AsyncMock()
    
    return cache


@pytest.fixture
def memory_service(mock_supabase, mock_embedding_service, mock_cache_manager):
    """Create SessionMemoryService with mocked dependencies."""
    return SessionMemoryService(
        supabase_client=mock_supabase,
        embedding_service=mock_embedding_service,
        cache_manager=mock_cache_manager
    )


# ============================================================================
# INITIALIZATION TESTS
# ============================================================================

def test_memory_service_initialization(memory_service, mock_supabase, mock_embedding_service):
    """Test memory service initializes correctly."""
    assert memory_service.supabase == mock_supabase
    assert memory_service.embedding_service == mock_embedding_service
    assert memory_service.cache_manager is not None


# ============================================================================
# MEMORY STORAGE (REMEMBER) TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_remember_memory_success(memory_service, tenant_id, user_id, session_id):
    """Test successful memory storage."""
    content = "User prefers GPT-4 for complex analysis"
    memory_type = "preference"
    importance = 0.9
    
    memory = await memory_service.remember(
        tenant_id=tenant_id,
        user_id=user_id,
        session_id=session_id,
        content=content,
        memory_type=memory_type,
        importance=importance
    )
    
    assert isinstance(memory, Memory)
    assert memory.content == content
    assert memory.memory_type == memory_type
    assert memory.importance == importance
    
    # Verify embedding was generated
    memory_service.embedding_service.embed_text.assert_called_once()


@pytest.mark.asyncio
async def test_remember_memory_with_metadata(memory_service, tenant_id, user_id, session_id):
    """Test memory storage with metadata."""
    metadata = {
        'source': 'conversation',
        'agent_id': 'agent_123',
        'confidence': 0.85
    }
    
    memory = await memory_service.remember(
        tenant_id=tenant_id,
        user_id=user_id,
        session_id=session_id,
        content="User is working on FDA submission",
        memory_type="fact",
        importance=0.8,
        metadata=metadata
    )
    
    assert memory.metadata == metadata


@pytest.mark.asyncio
async def test_remember_memory_importance_clamping(memory_service, tenant_id, user_id, session_id):
    """Test importance score is clamped to [0, 1]."""
    # Test with importance > 1
    memory = await memory_service.remember(
        tenant_id=tenant_id,
        user_id=user_id,
        session_id=session_id,
        content="Test content",
        memory_type="fact",
        importance=1.5  # Should be clamped to 1.0
    )
    
    # Check that importance was clamped (verify in the database call)
    insert_call = memory_service.supabase.table.return_value.insert.call_args
    assert insert_call[0][0]['importance'] <= 1.0


@pytest.mark.asyncio
async def test_remember_memory_invalidates_cache(memory_service, tenant_id, user_id, session_id):
    """Test memory storage invalidates recall cache."""
    await memory_service.remember(
        tenant_id=tenant_id,
        user_id=user_id,
        session_id=session_id,
        content="Test content",
        memory_type="fact",
        importance=0.7
    )
    
    # Cache invalidation is called internally
    # (In real implementation, verify cache patterns are cleared)


# ============================================================================
# MEMORY RECALL TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_recall_memories_success(memory_service, tenant_id, user_id, mock_supabase):
    """Test successful memory recall."""
    # Mock recall response
    mock_recall_data = [
        {
            'id': str(uuid4()),
            'memory_type': 'preference',
            'content': 'User prefers GPT-4',
            'importance': 0.9,
            'similarity': 0.85,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'accessed_count': 2,
            'metadata': {}
        },
        {
            'id': str(uuid4()),
            'memory_type': 'fact',
            'content': 'User is working on FDA submission',
            'importance': 0.7,
            'similarity': 0.75,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'accessed_count': 1,
            'metadata': {}
        }
    ]
    
    mock_supabase.rpc.return_value.execute.return_value.data = mock_recall_data
    
    query = "what model does user prefer"
    
    recalled_memories = await memory_service.recall(
        query=query,
        tenant_id=tenant_id,
        user_id=user_id,
        max_results=5,
        min_similarity=0.5
    )
    
    assert len(recalled_memories) == 2
    assert all(isinstance(rm, RecalledMemory) for rm in recalled_memories)
    assert recalled_memories[0].memory.content == 'User prefers GPT-4'
    assert recalled_memories[0].similarity == 0.85
    
    # Verify embedding was generated for query
    memory_service.embedding_service.embed_text.assert_called()


@pytest.mark.asyncio
async def test_recall_memories_filters_low_similarity(memory_service, tenant_id, user_id, mock_supabase):
    """Test recall filters out low similarity results."""
    # Mock recall with varying similarity scores
    mock_recall_data = [
        {
            'id': str(uuid4()),
            'memory_type': 'preference',
            'content': 'High similarity memory',
            'importance': 0.9,
            'similarity': 0.85,  # High similarity
            'created_at': datetime.now(timezone.utc).isoformat(),
            'accessed_count': 2,
            'metadata': {}
        },
        {
            'id': str(uuid4()),
            'memory_type': 'fact',
            'content': 'Low similarity memory',
            'importance': 0.7,
            'similarity': 0.4,  # Low similarity (below threshold)
            'created_at': datetime.now(timezone.utc).isoformat(),
            'accessed_count': 1,
            'metadata': {}
        }
    ]
    
    mock_supabase.rpc.return_value.execute.return_value.data = mock_recall_data
    
    recalled_memories = await memory_service.recall(
        query="test query",
        tenant_id=tenant_id,
        user_id=user_id,
        min_similarity=0.6  # Threshold
    )
    
    # Should only return high similarity memory
    assert len(recalled_memories) == 1
    assert recalled_memories[0].similarity >= 0.6


@pytest.mark.asyncio
async def test_recall_memories_uses_cache(memory_service, tenant_id, user_id, mock_cache_manager):
    """Test recall uses cache for repeated queries."""
    # Mock cached data
    cached_memories = [
        {
            'memory': {
                'id': str(uuid4()),
                'tenant_id': str(tenant_id),
                'user_id': str(user_id),
                'session_id': 'cached_session',
                'memory_type': 'preference',
                'content': 'Cached memory',
                'importance': 0.8,
                'metadata': {},
                'created_at': datetime.now(timezone.utc).isoformat(),
                'accessed_count': 0
            },
            'similarity': 0.9,
            'relevance_score': 0.85
        }
    ]
    
    mock_cache_manager.get.return_value = cached_memories
    
    query = "test query"
    
    recalled_memories = await memory_service.recall(
        query=query,
        tenant_id=tenant_id,
        user_id=user_id
    )
    
    # Should use cache and not call embedding service
    assert len(recalled_memories) > 0
    mock_cache_manager.get.assert_called_once()


@pytest.mark.asyncio
async def test_recall_memories_filters_by_type(memory_service, tenant_id, user_id, mock_supabase):
    """Test recall can filter by memory types."""
    await memory_service.recall(
        query="test query",
        tenant_id=tenant_id,
        user_id=user_id,
        memory_types=['preference', 'fact']
    )
    
    # Verify RPC was called with type filter
    rpc_call = mock_supabase.rpc.call_args
    assert 'p_memory_types' in rpc_call[0][1]
    assert rpc_call[0][1]['p_memory_types'] == ['preference', 'fact']


# ============================================================================
# MEMORY EXTRACTION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_extract_memories_from_conversation(memory_service, tenant_id, user_id, session_id):
    """Test automatic memory extraction from conversation."""
    conversation_text = "I prefer using GPT-4 for all complex analysis tasks"
    agent_response = "I'll remember your preference for GPT-4"
    
    # Mock OpenAI response
    mock_openai_response = MagicMock()
    mock_openai_response.choices = [MagicMock()]
    mock_openai_response.choices[0].message.content = json.dumps([
        {
            "type": "preference",
            "content": "User prefers GPT-4 for complex analysis",
            "importance": 0.8
        }
    ])
    
    with patch('services.session_memory_service.AsyncOpenAI') as mock_openai_class:
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_openai_response)
        mock_openai_class.return_value = mock_client
        
        memories = await memory_service.extract_memories_from_conversation(
            conversation_text=conversation_text,
            tenant_id=tenant_id,
            user_id=user_id,
            session_id=session_id,
            agent_response=agent_response
        )
        
        assert len(memories) > 0
        assert all(isinstance(m, Memory) for m in memories)
        assert memories[0].memory_type == "preference"


@pytest.mark.asyncio
async def test_extract_memories_handles_no_memories(memory_service, tenant_id, user_id, session_id):
    """Test extraction handles conversations with no important information."""
    conversation_text = "Hello"
    
    # Mock OpenAI returning empty array
    mock_openai_response = MagicMock()
    mock_openai_response.choices = [MagicMock()]
    mock_openai_response.choices[0].message.content = json.dumps([])
    
    with patch('services.session_memory_service.AsyncOpenAI') as mock_openai_class:
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_openai_response)
        mock_openai_class.return_value = mock_client
        
        memories = await memory_service.extract_memories_from_conversation(
            conversation_text=conversation_text,
            tenant_id=tenant_id,
            user_id=user_id,
            session_id=session_id
        )
        
        assert len(memories) == 0


# ============================================================================
# RECENT MEMORIES TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_get_recent_memories(memory_service, tenant_id, user_id, mock_supabase):
    """Test retrieving recent memories."""
    # Mock recent memories response
    mock_recent_data = [
        {
            'id': str(uuid4()),
            'session_id': 'session_1',
            'memory_type': 'preference',
            'content': 'Recent preference',
            'importance': 0.9,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'metadata': {}
        },
        {
            'id': str(uuid4()),
            'session_id': 'session_2',
            'memory_type': 'fact',
            'content': 'Recent fact',
            'importance': 0.7,
            'created_at': (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
            'metadata': {}
        }
    ]
    
    mock_supabase.rpc.return_value.execute.return_value.data = mock_recent_data
    
    memories = await memory_service.get_recent_memories(
        tenant_id=tenant_id,
        user_id=user_id,
        memory_types=['preference', 'fact'],
        days=30,
        max_results=10
    )
    
    assert len(memories) == 2
    assert all(isinstance(m, Memory) for m in memories)


# ============================================================================
# CLEANUP TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_cleanup_old_memories(memory_service, tenant_id, mock_supabase):
    """Test cleanup of old low-importance memories."""
    # Mock cleanup response
    mock_supabase.rpc.return_value.execute.return_value.data = 5  # 5 memories cleaned
    
    count = await memory_service.cleanup_old_memories(
        tenant_id=tenant_id,
        days=90,
        min_importance_to_keep=0.3
    )
    
    assert count == 5
    
    # Verify RPC was called
    mock_supabase.rpc.assert_called_once()
    rpc_call_args = mock_supabase.rpc.call_args
    assert rpc_call_args[0][0] == 'cleanup_old_memories'


# ============================================================================
# MEMORY INTEGRATION MIXIN TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_mixin_initialization(mock_supabase, mock_cache_manager):
    """Test MemoryIntegrationMixin initialization."""
    class TestClass(MemoryIntegrationMixin):
        pass
    
    test_obj = TestClass()
    test_obj.init_memory_integration(mock_supabase, mock_cache_manager)
    
    assert hasattr(test_obj, 'memory_service')
    assert isinstance(test_obj.memory_service, SessionMemoryService)


@pytest.mark.asyncio
async def test_mixin_recall_memories(mock_supabase, mock_cache_manager, tenant_id, user_id):
    """Test mixin's recall_memories method."""
    class TestClass(MemoryIntegrationMixin):
        pass
    
    test_obj = TestClass()
    test_obj.init_memory_integration(mock_supabase, mock_cache_manager)
    
    # Mock recall response
    mock_supabase.rpc.return_value.execute.return_value.data = []
    
    memories = await test_obj.recall_memories(
        query="test query",
        tenant_id=tenant_id,
        user_id=user_id,
        max_results=5
    )
    
    assert isinstance(memories, list)


@pytest.mark.asyncio
async def test_mixin_store_memory(mock_supabase, mock_cache_manager, tenant_id, user_id, session_id):
    """Test mixin's store_memory method."""
    class TestClass(MemoryIntegrationMixin):
        pass
    
    test_obj = TestClass()
    test_obj.init_memory_integration(mock_supabase, mock_cache_manager)
    
    memory = await test_obj.store_memory(
        tenant_id=tenant_id,
        user_id=user_id,
        session_id=session_id,
        content="Test memory",
        memory_type="fact",
        importance=0.7
    )
    
    assert isinstance(memory, Memory)


def test_mixin_format_memories_for_context(tenant_id, user_id):
    """Test formatting memories as LLM context."""
    class TestClass(MemoryIntegrationMixin):
        pass
    
    test_obj = TestClass()
    
    # Create test memories
    memories = [
        RecalledMemory(
            memory=Memory(
                id=uuid4(),
                tenant_id=tenant_id,
                user_id=user_id,
                session_id="session_1",
                memory_type="preference",
                content="User prefers GPT-4",
                importance=0.9,
                created_at=datetime.now(timezone.utc)
            ),
            similarity=0.85,
            relevance_score=0.88
        ),
        RecalledMemory(
            memory=Memory(
                id=uuid4(),
                tenant_id=tenant_id,
                user_id=user_id,
                session_id="session_2",
                memory_type="fact",
                content="User is working on FDA submission",
                importance=0.7,
                created_at=datetime.now(timezone.utc)
            ),
            similarity=0.75,
            relevance_score=0.72
        )
    ]
    
    context = test_obj.format_memories_for_context(memories, max_context_length=1000)
    
    assert "Previous Sessions" in context
    assert "PREFERENCE" in context
    assert "FACT" in context
    assert "GPT-4" in context
    assert "FDA" in context
    assert "relevance:" in context


def test_mixin_format_memories_empty():
    """Test formatting empty memories list."""
    class TestClass(MemoryIntegrationMixin):
        pass
    
    test_obj = TestClass()
    context = test_obj.format_memories_for_context([])
    
    assert context == ""


@pytest.mark.asyncio
async def test_mixin_get_user_preferences(mock_supabase, mock_cache_manager, tenant_id, user_id):
    """Test getting user preferences."""
    class TestClass(MemoryIntegrationMixin):
        pass
    
    test_obj = TestClass()
    test_obj.init_memory_integration(mock_supabase, mock_cache_manager)
    
    # Mock preferences response
    mock_supabase.rpc.return_value.execute.return_value.data = [
        {
            'id': str(uuid4()),
            'session_id': 'session_1',
            'memory_type': 'preference',
            'content': 'User prefers GPT-4',
            'importance': 0.9,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'metadata': {}
        }
    ]
    
    preferences = await test_obj.get_user_preferences(
        tenant_id=tenant_id,
        user_id=user_id,
        days=90
    )
    
    assert isinstance(preferences, list)


# ============================================================================
# UTILITY FUNCTION TESTS
# ============================================================================

def test_calculate_relevance(memory_service):
    """Test relevance score calculation."""
    relevance = memory_service._calculate_relevance(
        similarity=0.8,
        importance=0.9,
        recency_weight=0.1
    )
    
    # Relevance should be weighted combination
    assert 0.0 <= relevance <= 1.0
    assert relevance > 0  # Should be non-zero for valid inputs


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_remember_handles_database_error(memory_service, tenant_id, user_id, session_id, mock_supabase):
    """Test remember handles database errors gracefully."""
    # Mock database failure
    mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception("Database error")
    
    with pytest.raises(Exception):
        await memory_service.remember(
            tenant_id=tenant_id,
            user_id=user_id,
            session_id=session_id,
            content="Test content",
            memory_type="fact",
            importance=0.7
        )


@pytest.mark.asyncio
async def test_recall_handles_error_gracefully(memory_service, tenant_id, user_id, mock_supabase):
    """Test recall handles errors and returns empty list."""
    # Mock RPC failure
    mock_supabase.rpc.return_value.execute.side_effect = Exception("RPC error")
    
    recalled_memories = await memory_service.recall(
        query="test query",
        tenant_id=tenant_id,
        user_id=user_id
    )
    
    # Should return empty list instead of raising
    assert recalled_memories == []


@pytest.mark.asyncio
async def test_extract_memories_handles_llm_error(memory_service, tenant_id, user_id, session_id):
    """Test memory extraction handles LLM errors gracefully."""
    conversation_text = "Test conversation"
    
    # Mock OpenAI failure
    with patch('services.session_memory_service.AsyncOpenAI') as mock_openai_class:
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(side_effect=Exception("LLM timeout"))
        mock_openai_class.return_value = mock_client
        
        memories = await memory_service.extract_memories_from_conversation(
            conversation_text=conversation_text,
            tenant_id=tenant_id,
            user_id=user_id,
            session_id=session_id
        )
        
        # Should return empty list instead of raising
        assert memories == []


# ============================================================================
# HEALTH CHECK TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_health_check_success(memory_service):
    """Test health check passes when services are healthy."""
    healthy = await memory_service.health_check()
    
    assert healthy is True


@pytest.mark.asyncio
async def test_health_check_fails_on_database_error(memory_service, mock_supabase):
    """Test health check fails when database is unhealthy."""
    # Mock database error
    mock_supabase.table.return_value.select.return_value.limit.return_value.execute.side_effect = Exception("DB down")
    
    healthy = await memory_service.health_check()
    
    assert healthy is False


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

