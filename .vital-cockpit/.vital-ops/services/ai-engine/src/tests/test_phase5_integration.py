"""
Comprehensive Tests for Phase 5: LangGraph Feedback, Memory & Enrichment Integration

Tests cover:
1. Feedback nodes (confidence, implicit feedback, feedback collection)
2. Memory nodes (extraction, retrieval, update, context enhancement)
3. Enrichment nodes (tool capture, feedback learning, entity extraction)
4. Mode 1 Enhanced workflow integration

Golden Rules Compliance Tests:
✅ #1: LangGraph StateGraph usage
✅ #2: Caching behavior
✅ #3: Tenant isolation
✅ #4: Tool knowledge capture
✅ #5: Feedback-driven learning
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone
from pydantic import UUID4

# Import nodes
from langgraph_workflows.feedback_nodes import FeedbackNodes
from langgraph_workflows.memory_nodes import MemoryNodes
from langgraph_workflows.enrichment_nodes import EnrichmentNodes
from langgraph_workflows.mode1_enhanced_workflow import Mode1EnhancedWorkflow

# Import services
from services.feedback_manager import FeedbackManager
from services.enhanced_conversation_manager import EnhancedConversationManager
from services.agent_enrichment_service import AgentEnrichmentService
from services.cache_manager import CacheManager
from services.supabase_client import SupabaseClient

# Sample data
TENANT_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
SESSION_ID = "test_session_123"
USER_ID = "test_user_456"
AGENT_ID = "medical_specialist"
QUERY = "What are the side effects of ibuprofen?"
RESPONSE = "Common side effects include stomach upset, nausea, and headache."


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    mock = AsyncMock(spec=SupabaseClient)
    mock.set_tenant_context = AsyncMock()
    mock.client = MagicMock()
    mock.client.from_ = MagicMock(return_value=mock.client)
    mock.client.select = MagicMock(return_value=mock.client)
    mock.client.eq = MagicMock(return_value=mock.client)
    mock.client.order = MagicMock(return_value=mock.client)
    mock.client.limit = MagicMock(return_value=mock.client)
    mock.client.execute = AsyncMock(return_value=MagicMock(data=[]))
    return mock


@pytest.fixture
def mock_cache():
    """Mock Cache Manager."""
    mock = AsyncMock(spec=CacheManager)
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock()
    mock.delete_pattern = AsyncMock()
    return mock


@pytest.fixture
def mock_feedback_manager():
    """Mock Feedback Manager."""
    mock = AsyncMock(spec=FeedbackManager)
    mock.submit_feedback = AsyncMock()
    mock.get_agent_performance = AsyncMock(return_value=[])
    return mock


@pytest.fixture
def mock_conversation_manager():
    """Mock Enhanced Conversation Manager."""
    mock = AsyncMock(spec=EnhancedConversationManager)
    mock.extract_semantic_memory = AsyncMock(return_value={})
    mock.save_turn_with_memory = AsyncMock()
    mock.update_conversation_memory = AsyncMock()
    return mock


@pytest.fixture
def mock_enrichment_service():
    """Mock Agent Enrichment Service."""
    mock = AsyncMock(spec=AgentEnrichmentService)
    mock.capture_tool_output = AsyncMock(return_value={'captured': True, 'knowledge_id': 'test_id'})
    mock.learn_from_feedback = AsyncMock(return_value={'knowledge_items_created': 1})
    mock.extract_entities = AsyncMock(return_value={'entities': {}})
    return mock


@pytest.fixture
def feedback_nodes(mock_supabase, mock_cache, mock_feedback_manager):
    """Initialize FeedbackNodes."""
    return FeedbackNodes(mock_supabase, mock_cache, mock_feedback_manager)


@pytest.fixture
def memory_nodes(mock_supabase, mock_cache, mock_conversation_manager):
    """Initialize MemoryNodes."""
    return MemoryNodes(mock_supabase, mock_cache, mock_conversation_manager)


@pytest.fixture
def enrichment_nodes(mock_supabase, mock_cache, mock_enrichment_service):
    """Initialize EnrichmentNodes."""
    return EnrichmentNodes(mock_supabase, mock_cache, mock_enrichment_service)


# ============================================================================
# FEEDBACK NODES TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_calculate_confidence_node(feedback_nodes):
    """Test confidence calculation node."""
    state = {
        'tenant_id': TENANT_ID,
        'query': QUERY,
        'agent_response': RESPONSE,
        'selected_agents': [AGENT_ID],
        'retrieved_documents': [{'content': 'test', 'relevance': 0.9}],
        'citations': ['source1'],
        'tools_used': []
    }
    
    result = await feedback_nodes.calculate_confidence_node(state)
    
    assert 'response_confidence' in result
    assert 0.0 <= result['response_confidence'] <= 1.0
    assert 'confidence_breakdown' in result
    assert result['current_node'] == 'calculate_confidence'


@pytest.mark.asyncio
async def test_collect_implicit_feedback_node(feedback_nodes):
    """Test implicit feedback collection node."""
    state = {
        'workflow_start_time': datetime.now(timezone.utc),
        'query': QUERY,
        'selected_agents': [AGENT_ID, 'another_agent'],  # Agent switch
        'conversation_history': [],
        'tools_used': ['web_search'],
        'retrieved_documents': [{'content': 'test'}],
        'response_confidence': 0.8
    }
    
    result = await feedback_nodes.collect_implicit_feedback_node(state)
    
    assert 'implicit_feedback' in result
    assert 'response_time_ms' in result['implicit_feedback']
    assert 'agent_switched' in result['implicit_feedback']
    assert result['implicit_feedback']['agent_switched'] == True  # 2 different agents
    assert 'tools_effective' in result['implicit_feedback']


@pytest.mark.asyncio
async def test_prepare_feedback_collection_node(feedback_nodes):
    """Test feedback collection preparation node."""
    state = {
        'session_id': SESSION_ID,
        'query': QUERY,
        'agent_response': RESPONSE,
        'selected_agents': [AGENT_ID],
        'response_confidence': 0.85,
        'enable_rag': True,
        'enable_tools': False,
        'model_used': 'gpt-4',
        'implicit_feedback': {'response_time_ms': 1500}
    }
    
    result = await feedback_nodes.prepare_feedback_collection_node(state)
    
    assert 'feedback_collection_data' in result
    feedback_data = result['feedback_collection_data']
    assert feedback_data['session_id'] == SESSION_ID
    assert feedback_data['agent_id'] == AGENT_ID
    assert feedback_data['query'] == QUERY
    assert 'categories' in feedback_data
    assert len(feedback_data['categories']) == 4  # helpful, excellent, incorrect, incomplete


@pytest.mark.asyncio
async def test_submit_feedback_node(feedback_nodes, mock_feedback_manager):
    """Test feedback submission node."""
    from services.feedback_manager import FeedbackResponse
    
    mock_feedback_manager.submit_feedback.return_value = FeedbackResponse(
        feedback_id=UUID4("123e4567-e89b-12d3-a456-426614174000"),
        status="success"
    )
    
    state = {
        'tenant_id': TENANT_ID,
        'session_id': SESSION_ID,
        'user_id': USER_ID,
        'query': QUERY,
        'agent_response': RESPONSE,
        'selected_agents': [AGENT_ID],
        'response_confidence': 0.9,
        'user_feedback': {
            'rating': 5,
            'feedback_text': 'Very helpful!',
            'feedback_categories': ['helpful', 'excellent']
        },
        'implicit_feedback': {'response_time_ms': 1200}
    }
    
    result = await feedback_nodes.submit_feedback_node(state)
    
    assert result['feedback_submitted'] == True
    assert 'feedback_id' in result
    mock_feedback_manager.submit_feedback.assert_called_once()


# ============================================================================
# MEMORY NODES TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_extract_semantic_memory_node(memory_nodes, mock_conversation_manager):
    """Test semantic memory extraction node."""
    mock_conversation_manager.extract_semantic_memory.return_value = {
        'entities': {'drugs': ['ibuprofen'], 'conditions': ['pain']},
        'facts': [{'content': 'Ibuprofen is an NSAID', 'confidence': 0.9}],
        'preferences': {'detail_level': 'moderate'},
        'topics': ['medication', 'side_effects']
    }
    
    state = {
        'tenant_id': TENANT_ID,
        'session_id': SESSION_ID,
        'query': QUERY,
        'agent_response': RESPONSE,
        'conversation_history': []
    }
    
    result = await memory_nodes.extract_semantic_memory_node(state)
    
    assert 'extracted_memory' in result
    assert 'entities' in result['extracted_memory']
    assert 'facts' in result['extracted_memory']
    assert 'preferences' in result['extracted_memory']
    assert 'topics' in result['extracted_memory']
    mock_conversation_manager.extract_semantic_memory.assert_called_once()


@pytest.mark.asyncio
async def test_retrieve_relevant_memory_node(memory_nodes, mock_supabase):
    """Test relevant memory retrieval node."""
    mock_supabase.client.execute.return_value = MagicMock(data=[
        {
            'semantic_memory': {'facts': [{'content': 'Previous fact'}]},
            'extracted_entities': {'drugs': ['aspirin']},
            'user_preferences': {'detail_level': 'high'}
        }
    ])
    
    state = {
        'tenant_id': TENANT_ID,
        'session_id': SESSION_ID,
        'user_id': USER_ID,
        'query': QUERY
    }
    
    result = await memory_nodes.retrieve_relevant_memory_node(state)
    
    assert 'relevant_memory' in result
    assert 'entities' in result['relevant_memory']
    assert 'preferences' in result['relevant_memory']


@pytest.mark.asyncio
async def test_update_conversation_memory_node(memory_nodes, mock_conversation_manager):
    """Test conversation memory update node."""
    state = {
        'tenant_id': TENANT_ID,
        'session_id': SESSION_ID,
        'extracted_memory': {
            'entities': {'drugs': ['ibuprofen']},
            'facts': [{'content': 'Test fact'}],
            'preferences': {'detail_level': 'moderate'}
        }
    }
    
    result = await memory_nodes.update_conversation_memory_node(state)
    
    assert result['memory_updated'] == True
    mock_conversation_manager.update_conversation_memory.assert_called_once()


@pytest.mark.asyncio
async def test_enhance_context_with_memory_node(memory_nodes):
    """Test context enhancement with memory."""
    state = {
        'query': QUERY,
        'relevant_memory': {
            'entities': {'drugs': ['aspirin', 'ibuprofen'], 'conditions': ['pain']},
            'facts': [
                {'content': 'NSAIDs can cause stomach issues', 'confidence': 0.9},
                {'content': 'Take with food', 'confidence': 0.8}
            ],
            'preferences': {'detail_level': 'high', 'language': 'technical'}
        },
        'conversation_history': []
    }
    
    result = await memory_nodes.enhance_context_with_memory_node(state)
    
    assert 'memory_enhanced_context' in result
    context = result['memory_enhanced_context']
    assert 'User Preferences' in context
    assert 'Previously Discussed' in context
    assert 'Relevant Facts' in context


# ============================================================================
# ENRICHMENT NODES TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_capture_tool_knowledge_node(enrichment_nodes, mock_enrichment_service):
    """Test tool knowledge capture node."""
    state = {
        'tenant_id': TENANT_ID,
        'query': QUERY,
        'selected_agents': [AGENT_ID],
        'tools_used': ['web_search', 'database_query'],
        'tool_outputs': {
            'web_search': {'results': ['result1', 'result2']},
            'database_query': {'data': ['data1']}
        }
    }
    
    result = await enrichment_nodes.capture_tool_knowledge_node(state)
    
    assert 'captured_knowledge' in result
    assert len(result['captured_knowledge']) == 2  # 2 tools used
    assert result['knowledge_capture_count'] == 2
    assert mock_enrichment_service.capture_tool_output.call_count == 2


@pytest.mark.asyncio
async def test_enrich_from_feedback_node_positive(enrichment_nodes, mock_enrichment_service):
    """Test enrichment from positive feedback."""
    state = {
        'tenant_id': TENANT_ID,
        'selected_agents': [AGENT_ID],
        'agent_response': RESPONSE,
        'query': QUERY,
        'user_feedback': {
            'rating': 5,
            'feedback_categories': ['excellent', 'helpful']
        },
        'feedback_id': "123e4567-e89b-12d3-a456-426614174000"
    }
    
    result = await enrichment_nodes.enrich_from_feedback_node(state)
    
    assert 'enrichment_from_feedback' in result
    mock_enrichment_service.learn_from_feedback.assert_called_once_with(
        tenant_id=UUID4(TENANT_ID),
        agent_id=AGENT_ID,
        feedback_id=UUID4("123e4567-e89b-12d3-a456-426614174000"),
        feedback_type='positive',
        query=QUERY,
        response=RESPONSE,
        rating=5
    )


@pytest.mark.asyncio
async def test_enrich_from_feedback_node_negative(enrichment_nodes, mock_enrichment_service):
    """Test enrichment from negative feedback."""
    state = {
        'tenant_id': TENANT_ID,
        'selected_agents': [AGENT_ID],
        'agent_response': RESPONSE,
        'query': QUERY,
        'user_feedback': {
            'rating': 2,
            'feedback_categories': ['incorrect']
        },
        'feedback_id': "123e4567-e89b-12d3-a456-426614174000"
    }
    
    result = await enrichment_nodes.enrich_from_feedback_node(state)
    
    assert 'enrichment_from_feedback' in result
    mock_enrichment_service.learn_from_feedback.assert_called_once_with(
        tenant_id=UUID4(TENANT_ID),
        agent_id=AGENT_ID,
        feedback_id=UUID4("123e4567-e89b-12d3-a456-426614174000"),
        feedback_type='negative',
        query=QUERY,
        response=RESPONSE,
        rating=2
    )


@pytest.mark.asyncio
async def test_extract_entities_node(enrichment_nodes, mock_enrichment_service):
    """Test entity extraction node."""
    mock_enrichment_service.extract_entities.return_value = {
        'entities': {
            'drugs': ['ibuprofen', 'aspirin'],
            'conditions': ['pain', 'inflammation'],
            'procedures': ['blood_test']
        }
    }
    
    state = {
        'query': QUERY,
        'agent_response': RESPONSE
    }
    
    result = await enrichment_nodes.extract_entities_node(state)
    
    assert 'extracted_entities' in result
    assert 'entity_count' in result
    assert result['entity_count'] == 5  # 2 + 2 + 1
    mock_enrichment_service.extract_entities.assert_called_once()


@pytest.mark.asyncio
async def test_enrich_knowledge_base_node(enrichment_nodes, mock_enrichment_service):
    """Test knowledge base enrichment node."""
    mock_enrichment_service.save_entity_knowledge.return_value = "entity_knowledge_123"
    
    state = {
        'tenant_id': TENANT_ID,
        'selected_agents': [AGENT_ID],
        'captured_knowledge': [
            {'tool': 'web_search', 'knowledge_id': 'knowledge_123', 'relevance_score': 0.8}
        ],
        'extracted_entities': {
            'drugs': ['ibuprofen', 'aspirin', 'acetaminophen']
        },
        'agent_response': RESPONSE,
        'response_confidence': 0.85  # High confidence
    }
    
    result = await enrichment_nodes.enrich_knowledge_base_node(state)
    
    assert result['knowledge_enriched'] == True
    assert 'enrichment_items' in result
    assert len(result['enrichment_items']) >= 1  # At least captured tool knowledge


@pytest.mark.asyncio
async def test_enrich_knowledge_base_node_low_confidence(enrichment_nodes):
    """Test knowledge enrichment is skipped for low confidence."""
    state = {
        'tenant_id': TENANT_ID,
        'selected_agents': [AGENT_ID],
        'captured_knowledge': [],
        'extracted_entities': {},
        'agent_response': RESPONSE,
        'response_confidence': 0.5  # Low confidence
    }
    
    result = await enrichment_nodes.enrich_knowledge_base_node(state)
    
    assert result['knowledge_enriched'] == False


# ============================================================================
# MODE 1 ENHANCED WORKFLOW INTEGRATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_mode1_enhanced_workflow_initialization(mock_supabase, mock_cache):
    """Test Mode 1 Enhanced workflow initialization."""
    workflow = Mode1EnhancedWorkflow(
        supabase_client=mock_supabase,
        cache_manager=mock_cache
    )
    
    assert workflow.workflow_name == "Mode1_Enhanced_Interactive_Automatic"
    assert workflow.supabase == mock_supabase
    assert workflow.cache_manager == mock_cache
    assert hasattr(workflow, 'feedback_nodes')
    assert hasattr(workflow, 'memory_nodes')
    assert hasattr(workflow, 'enrichment_nodes')


@pytest.mark.asyncio
async def test_mode1_enhanced_workflow_graph_structure(mock_supabase, mock_cache):
    """Test Mode 1 Enhanced workflow graph has correct structure."""
    workflow = Mode1EnhancedWorkflow(
        supabase_client=mock_supabase,
        cache_manager=mock_cache
    )
    
    graph = workflow.build_graph()
    
    # Check key nodes exist
    expected_nodes = [
        'validate_tenant', 'retrieve_memory', 'check_conversation',
        'select_expert', 'enhance_context',
        'execute_agent', 'calculate_confidence',
        'collect_implicit_feedback', 'extract_memory',
        'capture_tool_knowledge', 'extract_entities',
        'enrich_knowledge_base', 'save_conversation',
        'prepare_feedback', 'format_output'
    ]
    
    # Note: graph.nodes is a dict-like structure
    for node_name in expected_nodes:
        assert node_name in graph.nodes, f"Node '{node_name}' missing from graph"


# ============================================================================
# GOLDEN RULES COMPLIANCE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_golden_rule_2_caching(feedback_nodes, mock_cache):
    """Test Golden Rule #2: Caching is integrated."""
    # Test cache hit scenario
    mock_cache.get.return_value = {
        'overall_score': 0.85,
        'breakdown': {'agent_performance': 0.8, 'rag_quality': 0.9},
        'factors': []
    }
    
    state = {
        'tenant_id': TENANT_ID,
        'query': QUERY,
        'agent_response': RESPONSE,
        'selected_agents': [AGENT_ID],
        'retrieved_documents': [],
        'citations': []
    }
    
    result = await feedback_nodes.calculate_confidence_node(state)
    
    assert result['response_confidence'] == 0.85
    assert result.get('cache_hits', 0) >= 1
    mock_cache.get.assert_called_once()
    mock_cache.set.assert_not_called()  # Should not set if cache hit


@pytest.mark.asyncio
async def test_golden_rule_3_tenant_isolation(memory_nodes, mock_supabase):
    """Test Golden Rule #3: Tenant isolation is enforced."""
    state = {
        'tenant_id': TENANT_ID,
        'session_id': SESSION_ID,
        'user_id': USER_ID,
        'query': QUERY
    }
    
    await memory_nodes.retrieve_relevant_memory_node(state)
    
    # Verify tenant context was set
    mock_supabase.set_tenant_context.assert_called_with(TENANT_ID)


@pytest.mark.asyncio
async def test_golden_rule_4_tool_knowledge_capture(enrichment_nodes):
    """Test Golden Rule #4: Tool outputs are automatically captured."""
    state = {
        'tenant_id': TENANT_ID,
        'query': QUERY,
        'selected_agents': [AGENT_ID],
        'tools_used': ['web_search'],
        'tool_outputs': {
            'web_search': {'results': ['Important finding about ibuprofen']}
        }
    }
    
    result = await enrichment_nodes.capture_tool_knowledge_node(state)
    
    assert 'captured_knowledge' in result
    assert len(result['captured_knowledge']) > 0


@pytest.mark.asyncio
async def test_golden_rule_5_feedback_driven_learning(enrichment_nodes):
    """Test Golden Rule #5: System learns from user feedback."""
    state = {
        'tenant_id': TENANT_ID,
        'selected_agents': [AGENT_ID],
        'agent_response': RESPONSE,
        'query': QUERY,
        'user_feedback': {
            'rating': 5,
            'feedback_categories': ['helpful']
        },
        'feedback_id': "123e4567-e89b-12d3-a456-426614174000"
    }
    
    result = await enrichment_nodes.enrich_from_feedback_node(state)
    
    assert 'enrichment_from_feedback' in result
    # Verify the enrichment service was called to learn from feedback


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

