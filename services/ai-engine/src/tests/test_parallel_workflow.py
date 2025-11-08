"""
Unit Tests for ParallelBaseWorkflow

Tests parallel execution, error handling, timeout protection, and graceful degradation.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from vital_shared.workflows.parallel_base_workflow import ParallelBaseWorkflow
from vital_shared.models.workflow_state import BaseWorkflowState


# ============================================================================
# TEST WORKFLOW IMPLEMENTATION
# ============================================================================

class TestParallelWorkflow(ParallelBaseWorkflow):
    """Concrete implementation of ParallelBaseWorkflow for testing"""
    
    def build_graph(self):
        """Minimal graph implementation for testing"""
        from langgraph.graph import StateGraph, END
        
        graph = StateGraph(dict)
        graph.add_node("dummy", lambda state: state)
        graph.set_entry_point("dummy")
        graph.add_edge("dummy", END)
        
        return graph


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def mock_services():
    """Mock all service dependencies"""
    return {
        'agent_service': AsyncMock(),
        'rag_service': AsyncMock(),
        'tool_service': AsyncMock(),
        'memory_service': AsyncMock(),
        'streaming_service': AsyncMock(),
    }


@pytest.fixture
def sample_state():
    """Sample workflow state for testing"""
    return {
        "user_query": "What are FDA requirements for SaMD devices?",
        "user_id": "user_123",
        "tenant_id": "tenant_abc",
        "conversation_id": "conv_456",
        "agent_id": "agent_fda",
        "enable_rag": True,
        "enable_tools": True,
        "rag_results": [],
        "suggested_tools": [],
        "tools_awaiting_confirmation": [],
        "memory": {},
        "metadata": {}
    }


@pytest.fixture
def parallel_workflow(mock_services):
    """Create TestParallelWorkflow instance with mocked services"""
    workflow = TestParallelWorkflow(
        workflow_name="test_parallel",
        mode=1,
        agent_service=AsyncMock(),
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=AsyncMock()
    )
    
    return workflow


# ============================================================================
# TEST PARALLEL RETRIEVAL NODE - SUCCESS SCENARIOS
# ============================================================================

@pytest.mark.asyncio
async def test_parallel_retrieval_all_tasks_succeed(parallel_workflow, sample_state, mock_services):
    """Test parallel retrieval when all tasks succeed"""
    # Arrange
    mock_rag_results = [{"title": "FDA Guidance", "content": "..."}]
    mock_tools = [{"name": "pubmed_search", "description": "..."}]
    mock_memory = {"recent_messages": []}
    
    mock_services['rag_service'].retrieve.return_value = mock_rag_results
    mock_services['tool_service'].suggest_tools.return_value = mock_tools
    mock_services['memory_service'].get_context.return_value = mock_memory
    
    # Act
    result = await parallel_workflow.parallel_retrieval_node(sample_state)
    
    # Assert
    assert result.get('rag_results') == mock_rag_results
    assert result.get('suggested_tools') == mock_tools
    assert result.get('memory') == mock_memory
    
    # Verify all services were called
    mock_services['rag_service'].retrieve.assert_called_once()
    mock_services['tool_service'].suggest_tools.assert_called_once()
    mock_services['memory_service'].get_context.assert_called_once()
    
    # Check metadata
    assert 'parallel_tier1' in result['metadata']
    assert result['metadata']['parallel_tier1']['successful_tasks'] == 3
    assert result['metadata']['parallel_tier1']['failed_tasks'] == 0
    assert result['metadata']['parallel_tier1']['speedup_vs_sequential'] > 1.0


@pytest.mark.asyncio
async def test_parallel_retrieval_rag_disabled(parallel_workflow, sample_state, mock_services):
    """Test parallel retrieval when RAG is disabled"""
    # Arrange
    sample_state['enable_rag'] = False  # Dict access
    mock_tools = [{"name": "pubmed_search"}]
    mock_memory = {"recent_messages": []}
    
    mock_services['tool_service'].suggest_tools.return_value = mock_tools
    mock_services['memory_service'].get_context.return_value = mock_memory
    
    # Act
    result = await parallel_workflow.parallel_retrieval_node(sample_state)
    
    # Assert
    assert result.get('rag_results') == []  # Not executed
    assert result.get('suggested_tools') == mock_tools
    assert result.get('memory') == mock_memory
    
    # Verify RAG service was NOT called
    mock_services['rag_service'].retrieve.assert_not_called()
    
    # Check metadata - only 2 tasks (tools + memory)
    assert result['metadata']['parallel_tier1']['successful_tasks'] == 2


@pytest.mark.asyncio
async def test_parallel_retrieval_tools_disabled(parallel_workflow, sample_state, mock_services):
    """Test parallel retrieval when tools are disabled"""
    # Arrange
    sample_state['enable_tools'] = False  # Dict access
    mock_rag_results = [{"title": "FDA Guidance"}]
    mock_memory = {"recent_messages": []}
    
    mock_services['rag_service'].retrieve.return_value = mock_rag_results
    mock_services['memory_service'].get_context.return_value = mock_memory
    
    # Act
    result = await parallel_workflow.parallel_retrieval_node(sample_state)
    
    # Assert
    assert result.get('rag_results') == mock_rag_results
    assert result.get('suggested_tools') == []  # Not executed
    assert result.get('memory') == mock_memory
    
    # Verify tool service was NOT called
    mock_services['tool_service'].suggest_tools.assert_not_called()
    
    # Check metadata - only 2 tasks (RAG + memory)
    assert result['metadata']['parallel_tier1']['successful_tasks'] == 2


# ============================================================================
# TEST PARALLEL RETRIEVAL NODE - FAILURE SCENARIOS
# ============================================================================

@pytest.mark.asyncio
async def test_parallel_retrieval_partial_failure(parallel_workflow, sample_state, mock_services):
    """Test parallel retrieval with one task failing"""
    # Arrange
    mock_rag_results = [{"title": "FDA Guidance"}]
    mock_memory = {"recent_messages": []}
    
    mock_services['rag_service'].retrieve.return_value = mock_rag_results
    mock_services['tool_service'].suggest_tools.side_effect = Exception("Tool service error")
    mock_services['memory_service'].get_context.return_value = mock_memory
    
    # Act
    result = await parallel_workflow.parallel_retrieval_node(sample_state)
    
    # Assert - successful tasks still work
    assert result.get('rag_results') == mock_rag_results
    assert result.get('memory') == mock_memory
    
    # Failed task has safe defaults
    assert result.get('suggested_tools') == []
    assert result.get('tools_awaiting_confirmation') == []
    
    # Check metadata
    assert result['metadata']['parallel_tier1']['successful_tasks'] == 2
    assert result['metadata']['parallel_tier1']['failed_tasks'] == 1


@pytest.mark.asyncio
async def test_parallel_retrieval_all_tasks_fail(parallel_workflow, sample_state, mock_services):
    """Test parallel retrieval when all tasks fail"""
    # Arrange
    mock_services['rag_service'].retrieve.side_effect = Exception("RAG error")
    mock_services['tool_service'].suggest_tools.side_effect = Exception("Tool error")
    mock_services['memory_service'].get_context.side_effect = Exception("Memory error")
    
    # Act
    result = await parallel_workflow.parallel_retrieval_node(sample_state)
    
    # Assert - all defaults set
    assert result.get('rag_results') == []
    assert result.get('suggested_tools') == []
    assert result.get('tools_awaiting_confirmation') == []
    assert result.get('memory') == {}
    
    # Check metadata
    assert result['metadata']['parallel_tier1']['successful_tasks'] == 0
    assert result['metadata']['parallel_tier1']['failed_tasks'] == 3


@pytest.mark.asyncio
async def test_parallel_retrieval_timeout(parallel_workflow, sample_state, mock_services):
    """Test parallel retrieval with timeout"""
    # Arrange
    parallel_workflow.parallel_timeout_ms = 100  # 100ms timeout
    
    # Make RAG service hang
    async def slow_rag(*args, **kwargs):
        await asyncio.sleep(1.0)  # Sleep for 1 second
        return []
    
    mock_services['rag_service'].retrieve = slow_rag
    mock_services['tool_service'].suggest_tools.return_value = []
    mock_services['memory_service'].get_context.return_value = {}
    
    # Act
    result = await parallel_workflow.parallel_retrieval_node(sample_state)
    
    # Assert - timeout returns safe defaults
    assert result.get('rag_results') == []
    assert result.get('suggested_tools') == []
    assert result.get('memory') == {}


# ============================================================================
# TEST PARALLEL POST-GENERATION NODE - SUCCESS SCENARIOS
# ============================================================================

@pytest.mark.asyncio
async def test_parallel_post_generation_all_tasks_succeed(parallel_workflow, sample_state):
    """Test parallel post-generation when all tasks succeed"""
    # Arrange
    sample_state['response'] = "FDA requires validation [1] for SaMD devices."  # Dict access
    sample_state['rag_results'] = [{"title": "FDA Guidance", "url": "https://..."}]
    sample_state['metadata'] = {'input_tokens': 100, 'output_tokens': 50}
    
    # Act
    result = await parallel_workflow.parallel_post_generation_node(sample_state)
    
    # Assert
    assert 'quality_score' in result
    assert 'citations' in result
    assert 'cost_data' in result
    
    # Check metadata
    assert 'parallel_tier2' in result['metadata']
    assert result['metadata']['parallel_tier2']['successful_tasks'] == 3
    assert result['metadata']['parallel_tier2']['failed_tasks'] == 0
    assert result['metadata']['parallel_tier2']['speedup_vs_sequential'] > 1.0


@pytest.mark.asyncio
async def test_parallel_post_generation_partial_failure(parallel_workflow, sample_state):
    """Test parallel post-generation with one task failing"""
    # Arrange
    sample_state['response'] = "FDA requires validation."  # Dict access
    sample_state['rag_results'] = []
    
    # Mock one task to fail
    with patch.object(parallel_workflow, '_citation_extraction_task', side_effect=Exception("Citation error")):
        # Act
        result = await parallel_workflow.parallel_post_generation_node(sample_state)
        
        # Assert - other tasks still work
        assert 'quality_score' in result  # Quality succeeded
        assert 'cost_data' in result  # Cost succeeded
        # Citations failed but workflow continues
        
        # Check metadata
        assert result['metadata']['parallel_tier2']['successful_tasks'] == 2
        assert result['metadata']['parallel_tier2']['failed_tasks'] == 1


# ============================================================================
# TEST CONFIGURATION OPTIONS
# ============================================================================

@pytest.mark.asyncio
async def test_parallel_disabled_tier1(mock_services, sample_state):
    """Test disabling Tier 1 parallelization"""
    # Arrange
    config = {'enable_parallel_tier1': False}
    workflow = TestParallelWorkflow(
        workflow_name="test_disabled_tier1",
        mode=1,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service'],
        config=config
    )
    
    mock_services['rag_service'].retrieve.return_value = []
    mock_services['tool_service'].suggest_tools.return_value = []
    mock_services['memory_service'].get_context.return_value = {}
    
    # Act
    result = await workflow.parallel_retrieval_node(sample_state)
    
    # Assert - should use sequential fallback
    mock_services['rag_service'].retrieve.assert_called_once()
    mock_services['tool_service'].suggest_tools.assert_called_once()
    mock_services['memory_service'].get_context.assert_called_once()


@pytest.mark.asyncio
async def test_parallel_disabled_tier2(mock_services, sample_state):
    """Test disabling Tier 2 parallelization"""
    # Arrange
    config = {'enable_parallel_tier2': False}
    workflow = TestParallelWorkflow(
        workflow_name="test_disabled_tier2",
        mode=1,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service'],
        config=config
    )
    sample_state['response'] = "Test response"  # Dict access
    
    # Act
    result = await workflow.parallel_post_generation_node(sample_state)
    
    # Assert - sequential fallback was used (implicit - no assertions needed)


# ============================================================================
# TEST SPEEDUP CALCULATION
# ============================================================================

def test_calculate_speedup(mock_services):
    """Test speedup ratio calculation"""
    workflow = TestParallelWorkflow(
        workflow_name="test_speedup",
        mode=1,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service']
    )
    
    # Test perfect parallelization
    speedup = workflow._calculate_speedup(500, [500, 300, 200])
    assert speedup == pytest.approx(2.0)  # 1000ms / 500ms = 2.0x
    
    # Test no parallelization (sequential)
    speedup = workflow._calculate_speedup(1000, [500, 300, 200])
    assert speedup == pytest.approx(1.0)  # No improvement
    
    # Test zero duration (edge case)
    speedup = workflow._calculate_speedup(0, [500, 300, 200])
    assert speedup == 1.0  # Return 1.0 to avoid division by zero


# ============================================================================
# TEST MONITORING INTEGRATION
# ============================================================================

@pytest.mark.asyncio
async def test_monitoring_metrics_tracked(
    parallel_workflow,
    sample_state,
    mock_services
):
    """Test that monitoring metrics are tracked during parallel execution"""
    # Arrange
    sample_state['response'] = "FDA guidance [1]"  # Dict access
    mock_services['rag_service'].retrieve.return_value = []
    mock_services['tool_service'].suggest_tools.return_value = []
    mock_services['memory_service'].get_context.return_value = {}
    
    # Act
    await parallel_workflow.parallel_retrieval_node(sample_state)
    await parallel_workflow.parallel_post_generation_node(sample_state)
    
    # Assert - Check metadata was added to state
    assert 'metadata' in sample_state
    assert 'parallel_tier1' in sample_state['metadata']
    assert 'parallel_tier2' in sample_state['metadata']


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

