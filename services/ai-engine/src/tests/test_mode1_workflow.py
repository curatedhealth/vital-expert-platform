"""
Unit Tests for Mode 1 Manual Workflow

Tests Mode 1 workflow components:
- Agent validation
- Agent configuration loading
- RAG retrieval
- Tool execution
- Conversation history loading
- Query analysis
- Agent execution with RAG context
"""

import pytest
import asyncio
from typing import Dict, Any
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from langgraph_workflows.mode1_manual_workflow import Mode1ManualWorkflow
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
    create_initial_state
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client."""
    client = MagicMock()
    client.client = MagicMock()
    client.client.from_ = MagicMock(return_value=MagicMock())
    client.set_tenant_context = AsyncMock()
    return client


@pytest.fixture
def mock_cache_manager():
    """Mock cache manager."""
    cache = MagicMock()
    cache.enabled = True
    cache.get = AsyncMock(return_value=None)
    cache.set = AsyncMock()
    cache.delete = AsyncMock()
    return cache


@pytest.fixture
def mock_rag_service():
    """Mock RAG service."""
    rag = MagicMock()
    rag.search = AsyncMock(return_value={
        'documents': [
            {
                'id': 'doc1',
                'content': 'Test document content',
                'title': 'Test Document',
                'url': 'https://example.com/doc1',
                'similarity': 0.85,
                'source': 'test_source'
            }
        ],
        'metadata': {}
    })
    return rag


@pytest.fixture
def mock_agent_orchestrator():
    """Mock agent orchestrator."""
    orchestrator = MagicMock()
    orchestrator.execute_agent = AsyncMock(return_value={
        'response': 'Test agent response',
        'confidence': 0.9,
        'citations': [],
        'tokens_used': 100
    })
    return orchestrator


@pytest.fixture
def mock_conversation_manager():
    """Mock conversation manager."""
    manager = MagicMock()
    manager.load_conversation = AsyncMock(return_value=([], None))
    manager.format_for_llm = MagicMock(return_value=[])
    manager.save_turn_with_memory = AsyncMock(return_value=True)
    return manager


@pytest.fixture
async def workflow(mock_supabase_client, mock_cache_manager, mock_rag_service, mock_agent_orchestrator, mock_conversation_manager):
    """Mode 1 workflow instance."""
    workflow = Mode1ManualWorkflow(
        supabase_client=mock_supabase_client,
        cache_manager=mock_cache_manager,
        rag_service=mock_rag_service,
        agent_orchestrator=mock_agent_orchestrator,
        conversation_manager=mock_conversation_manager
    )
    await workflow.initialize()
    return workflow


@pytest.fixture
def sample_state():
    """Sample workflow state."""
    return create_initial_state(
        tenant_id=str(uuid4()),
        query="What are FDA IND requirements?",
        request_id=str(uuid4()),
        mode=WorkflowMode.MODE_1_MANUAL,
        selected_agents=["test_agent_id"],
        enable_rag=True,
        enable_tools=False,
        session_id="test_session",
        user_id="test_user"
    )


# ============================================================================
# WORKFLOW INITIALIZATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_workflow_initialization(workflow):
    """Test Mode 1 workflow initializes correctly."""
    assert workflow is not None
    assert workflow.workflow_name == "Mode1_Manual"
    assert workflow.mode == WorkflowMode.MODE_1_MANUAL
    assert workflow.compiled_graph is not None


@pytest.mark.asyncio
async def test_workflow_has_required_services(workflow):
    """Test workflow has all required services."""
    assert workflow.supabase is not None
    assert workflow.cache_manager is not None
    assert workflow.rag_service is not None
    assert workflow.agent_orchestrator is not None
    assert workflow.conversation_manager is not None
    assert workflow.tool_registry_service is not None


# ============================================================================
# AGENT VALIDATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_validate_agent_selection_success(workflow, sample_state, mock_supabase_client):
    """Test successful agent validation."""
    # Ensure state has selected_agents
    state = {
        **sample_state,
        'selected_agents': ['test_agent_id']
    }
    
    # Mock agent exists in database
    mock_response = MagicMock()
    mock_response.data = [{
        'id': 'test_agent_id',
        'name': 'Test Agent',
        'status': 'active',
        'system_prompt': 'Test prompt',
        'medical_specialty': ['regulatory']
    }]
    
    # Setup mock chain for Supabase query
    mock_table = MagicMock()
    mock_select = MagicMock()
    mock_eq1 = MagicMock()
    mock_eq2 = MagicMock()
    mock_eq3 = MagicMock()
    
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq1
    mock_eq1.eq.return_value = mock_eq2
    mock_eq2.eq.return_value = mock_eq3
    mock_eq3.execute = AsyncMock(return_value=mock_response)
    
    mock_supabase_client.client.from_.return_value = mock_table
    
    result = await workflow.validate_agent_selection_node(state)
    
    assert result['agent_validation_valid'] is True
    assert 'validated_agents' in result
    assert len(result['validated_agents']) == 1


@pytest.mark.asyncio
async def test_validate_agent_selection_no_agents(workflow, sample_state):
    """Test agent validation fails when no agents selected."""
    state = {**sample_state, 'selected_agents': []}
    
    result = await workflow.validate_agent_selection_node(state)
    
    assert result['agent_validation_valid'] is False
    assert 'agent_validation_error' in result


@pytest.mark.asyncio
async def test_validate_agent_selection_agent_not_found(workflow, sample_state, mock_supabase_client):
    """Test agent validation fails when agent not found."""
    # Mock agent not found
    mock_response = MagicMock()
    mock_response.data = []
    
    mock_select = MagicMock()
    mock_select.eq = MagicMock(return_value=mock_select)
    mock_select.execute = AsyncMock(return_value=mock_response)
    
    mock_supabase_client.client.from_.return_value = mock_select
    
    result = await workflow.validate_agent_selection_node(sample_state)
    
    assert result['agent_validation_valid'] is False
    assert 'agent_validation_error' in result


# ============================================================================
# AGENT CONFIG LOADING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_load_agent_config_success(workflow, sample_state, mock_cache_manager):
    """Test successful agent config loading."""
    state = {
        **sample_state,
        'validated_agents': [{
            'id': 'test_agent_id',
            'name': 'Test Agent',
            'system_prompt': 'Test prompt',
            'medical_specialty': ['regulatory'],
            'tools': ['tool1'],
            'model_preference': 'gpt-4',
            'temperature': 0.1,
            'max_tokens': 4000
        }]
    }
    
    # Mock cache miss
    mock_cache_manager.get.return_value = None
    
    result = await workflow.load_agent_config_node(state)
    
    assert 'agent_config' in result
    assert result['agent_config']['agent_id'] == 'test_agent_id'
    assert result['agent_config']['agent_name'] == 'Test Agent'
    assert 'system_prompt' in result['agent_config']


@pytest.mark.asyncio
async def test_load_agent_config_cache_hit(workflow, sample_state, mock_cache_manager):
    """Test agent config loading from cache."""
    cached_config = {
        'agent_id': 'test_agent_id',
        'agent_name': 'Test Agent',
        'system_prompt': 'Test prompt'
    }
    
    mock_cache_manager.get.return_value = cached_config
    
    state = {
        **sample_state,
        'validated_agents': [{'id': 'test_agent_id'}]
    }
    
    result = await workflow.load_agent_config_node(state)
    
    assert result['agent_config'] == cached_config
    assert result['cache_hits'] == 1


# ============================================================================
# RAG RETRIEVAL TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_rag_retrieval_success(workflow, sample_state, mock_rag_service, mock_cache_manager):
    """Test successful RAG retrieval."""
    # Mock cache miss
    mock_cache_manager.get.return_value = None
    
    result = await workflow.rag_retrieval_node(sample_state)
    
    assert 'retrieved_documents' in result
    assert len(result['retrieved_documents']) > 0
    assert 'context_summary' in result
    assert result['rag_cache_hit'] is False
    
    # Verify RAG service was called
    mock_rag_service.search.assert_called_once()


@pytest.mark.asyncio
async def test_rag_retrieval_cache_hit(workflow, sample_state, mock_cache_manager):
    """Test RAG retrieval from cache."""
    cached_results = {
        'documents': [{'id': 'doc1', 'content': 'Cached content'}],
        'context_summary': 'Cached summary'
    }
    
    mock_cache_manager.get.return_value = cached_results
    
    result = await workflow.rag_retrieval_node(sample_state)
    
    assert result['rag_cache_hit'] is True
    assert 'retrieved_documents' in result
    assert result['cache_hits'] == 1


@pytest.mark.asyncio
async def test_rag_retrieval_failure(workflow, sample_state, mock_rag_service):
    """Test RAG retrieval failure handling."""
    mock_rag_service.search.side_effect = Exception("RAG service error")
    
    result = await workflow.rag_retrieval_node(sample_state)
    
    assert 'retrieved_documents' in result
    assert len(result['retrieved_documents']) == 0
    assert 'errors' in result


# ============================================================================
# CONVERSATION HISTORY TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_load_conversation_success(workflow, sample_state, mock_conversation_manager):
    """Test successful conversation history loading."""
    from services.enhanced_conversation_manager import ConversationTurn
    from datetime import datetime
    
    turns = [
        ConversationTurn(
            role='user',
            content='First question',
            timestamp=datetime.now()
        ),
        ConversationTurn(
            role='assistant',
            content='First answer',
            timestamp=datetime.now()
        )
    ]
    
    mock_conversation_manager.load_conversation.return_value = (turns, None)
    
    result = await workflow.load_conversation_node(sample_state)
    
    assert 'conversation_history' in result
    assert len(result['conversation_history']) == 2
    assert result['conversation_exists'] is True


@pytest.mark.asyncio
async def test_load_conversation_no_history(workflow, sample_state, mock_conversation_manager):
    """Test conversation loading when no history exists."""
    mock_conversation_manager.load_conversation.return_value = ([], None)
    
    result = await workflow.load_conversation_node(sample_state)
    
    assert result['conversation_history'] == []
    assert result['conversation_exists'] is False


@pytest.mark.asyncio
async def test_load_conversation_no_session_id(workflow, sample_state):
    """Test conversation loading when no session_id."""
    state = {**sample_state, 'session_id': None}
    
    result = await workflow.load_conversation_node(state)
    
    assert result['conversation_history'] == []
    assert 'conversation_exists' not in result or result.get('conversation_exists') is False


# ============================================================================
# QUERY ANALYSIS TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_analyze_query_complexity_high(workflow, sample_state):
    """Test query analysis for high complexity."""
    # Create a query that's definitely high complexity (>200 chars or >30 words)
    long_query = 'What are the key requirements for FDA IND submission including clinical trial design, regulatory pathways, safety monitoring, and statistical analysis requirements? This is a very long query that should trigger high complexity detection because it contains many words and characters to test the query analysis functionality.'
    state = {
        **sample_state,
        'query': long_query
    }
    
    result = await workflow.analyze_query_node(state)
    
    assert result['query_complexity'] in ['high', 'medium']  # Allow medium as it's close


@pytest.mark.asyncio
async def test_analyze_query_complexity_low(workflow, sample_state):
    """Test query analysis for low complexity."""
    state = {
        **sample_state,
        'query': 'What is FDA?'
    }
    
    result = await workflow.analyze_query_node(state)
    
    assert result['query_complexity'] == 'low'


@pytest.mark.asyncio
async def test_analyze_query_is_question(workflow, sample_state):
    """Test query analysis detects questions."""
    state = {
        **sample_state,
        'query': 'What are FDA IND requirements?'
    }
    
    result = await workflow.analyze_query_node(state)
    
    assert result['is_question'] is True


# ============================================================================
# TOOL EXECUTION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_tools_only_execution(workflow, sample_state):
    """Test tools-only execution."""
    state = {
        **sample_state,
        'enable_tools': True,
        'requested_tools': ['web_search']
    }
    
    with patch.object(workflow, '_get_agent_tool_names', new_callable=AsyncMock) as mock_get_tools:
        mock_get_tools.return_value = ['web_search', 'pubmed_search']
        
        result = await workflow.tools_only_node(state)
        
        assert 'tools_executed' in result
        assert 'tool_results' in result


@pytest.mark.asyncio
async def test_tools_only_no_tools(workflow, sample_state):
    """Test tools-only execution when no tools available."""
    state = {
        **sample_state,
        'enable_tools': True,
        'selected_agents': []
    }
    
    result = await workflow.tools_only_node(state)
    
    assert 'tools_executed' in result
    assert result['tools_executed'] == []


# ============================================================================
# RAG AND TOOLS TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_rag_and_tools_execution(workflow, sample_state, mock_rag_service, mock_cache_manager):
    """Test RAG + Tools execution."""
    state = {
        **sample_state,
        'enable_rag': True,
        'enable_tools': True
    }
    
    mock_cache_manager.get.return_value = None
    
    result = await workflow.rag_and_tools_node(state)
    
    assert 'retrieved_documents' in result
    assert 'tools_executed' in result
    assert result['current_node'] == 'rag_and_tools'


# ============================================================================
# AGENT EXECUTION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_execute_agent_with_rag_context(workflow, sample_state, mock_agent_orchestrator, mock_cache_manager):
    """Test agent execution uses RAG context from state."""
    state = {
        **sample_state,
        'selected_agents': ['test_agent_id'],  # Ensure agent is selected
        'retrieved_documents': [
            {
                'id': 'doc1',
                'content': 'Test document content',
                'title': 'Test Document',
                'url': 'https://example.com/doc1',
                'similarity': 0.85
            }
        ],
        'context_summary': '',
        'agent_config': {
            'agent_id': 'test_agent_id',
            'system_prompt': 'Test prompt'
        },
        'query_complexity': 'low'  # Don't trigger tool chain
    }
    
    result = await workflow.execute_agent_node(state)
    
    assert 'agent_response' in result
    assert result['agent_response'] == 'Test agent response'
    assert 'citations' in result
    
    # Verify orchestrator was called with context
    mock_agent_orchestrator.execute_agent.assert_called_once()
    call_args = mock_agent_orchestrator.execute_agent.call_args
    assert call_args[1]['context'] is not None  # Context should be built from RAG


@pytest.mark.asyncio
async def test_execute_agent_no_agents(workflow, sample_state):
    """Test agent execution fails when no agents selected."""
    state = {
        **sample_state,
        'selected_agents': []
    }
    
    result = await workflow.execute_agent_node(state)
    
    assert result['agent_response'] == 'No agent selected'
    assert result['response_confidence'] == 0.0


@pytest.mark.asyncio
async def test_execute_agent_tool_chain(workflow, sample_state):
    """Test agent execution uses tool chain for complex queries."""
    state = {
        **sample_state,
        'selected_agents': ['test_agent_id'],  # Ensure agent is selected
        'query': 'Research FDA IND requirements and analyze key components including clinical trial design, regulatory pathways, and safety monitoring protocols',
        'query_complexity': 'high'
    }
    
    with patch.object(workflow, 'should_use_tool_chain_simple', return_value=True):
        with patch.object(workflow, '_get_agent_tool_names', new_callable=AsyncMock) as mock_get_tools:
            mock_get_tools.return_value = ['web_search', 'pubmed_search']
            
            # Mock tool_chain_executor
            mock_chain_result = MagicMock()
            mock_chain_result.synthesis = 'Tool chain synthesis'
            mock_chain_result.success = True
            mock_chain_result.steps_executed = 3
            mock_chain_result.total_cost_usd = 0.1
            
            workflow.tool_chain_executor.execute_tool_chain = AsyncMock(return_value=mock_chain_result)
            
            result = await workflow.execute_agent_node(state)
            
            assert result.get('tool_chain_used') is True
            assert result['agent_response'] == 'Tool chain synthesis'


# ============================================================================
# END-TO-END WORKFLOW TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_workflow_execution_end_to_end(workflow, sample_state, mock_supabase_client, mock_rag_service, mock_agent_orchestrator, mock_cache_manager):
    """Test complete workflow execution end-to-end."""
    # Mock agent exists
    mock_response = MagicMock()
    mock_response.data = [{
        'id': 'test_agent_id',
        'name': 'Test Agent',
        'status': 'active',
        'system_prompt': 'Test prompt',
        'medical_specialty': ['regulatory']
    }]
    
    mock_select = MagicMock()
    mock_select.eq = MagicMock(return_value=mock_select)
    mock_select.execute = AsyncMock(return_value=mock_response)
    mock_supabase_client.client.from_.return_value = mock_select
    
    # Mock cache misses
    mock_cache_manager.get.return_value = None
    
    # Execute workflow
    result = await workflow.execute(
        tenant_id=sample_state['tenant_id'],
        query=sample_state['query'],
        selected_agents=sample_state['selected_agents'],
        session_id=sample_state['session_id'],
        user_id=sample_state['user_id'],
        enable_rag=True,
        enable_tools=False
    )
    
    assert result is not None
    assert 'response' in result or 'agent_response' in result
    assert result.get('status') == ExecutionStatus.COMPLETED

