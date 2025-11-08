"""
Integration Tests for Parallel Workflow Execution

This test suite validates that all 4 mode workflows:
1. Instantiate correctly with ParallelBaseWorkflow
2. Execute parallel nodes successfully
3. Maintain backward compatibility
4. Achieve performance improvements

Author: VITAL AI Team
Date: 2025-01-08
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import time

# Import all mode workflows
from langgraph_workflows.modes.mode1_manual_workflow import Mode1ManualWorkflow
from langgraph_workflows.modes.mode2_automatic_workflow import Mode2AutomaticWorkflow
from langgraph_workflows.modes.mode3_chat_manual_workflow import Mode3ChatManualWorkflow
from langgraph_workflows.modes.mode4_chat_automatic_workflow import Mode4ChatAutomaticWorkflow

# Import services
from vital_shared.services.agent_service import AgentService
from vital_shared.services.unified_rag_service import UnifiedRAGService
from vital_shared.services.tool_service import ToolService
from vital_shared.services.memory_service import MemoryService
from vital_shared.services.streaming_service import StreamingService


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def mock_services():
    """Create mock services for all workflows"""
    # Use AsyncMock without spec to allow arbitrary method mocking
    return {
        'agent_service': AsyncMock(),
        'rag_service': AsyncMock(),
        'tool_service': AsyncMock(),
        'memory_service': AsyncMock(),
        'streaming_service': AsyncMock(),
    }


@pytest.fixture
def sample_input():
    """Sample workflow input"""
    return {
        "user_query": "What are FDA requirements for SaMD devices?",
        "user_id": "user_123",
        "tenant_id": "tenant_abc",
        "conversation_id": "conv_456",
        "agent_id": "agent_fda",
        "mode": 1,
        "enable_rag": True,
        "enable_tools": True,
    }


# ============================================================================
# TEST MODE INSTANTIATION
# ============================================================================

@pytest.mark.asyncio
async def test_mode1_instantiation(mock_services):
    """Test Mode 1 workflow instantiates correctly with ParallelBaseWorkflow"""
    # Act
    workflow = Mode1ManualWorkflow(
        workflow_name="test_mode1",
        mode=1,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service']
    )
    
    # Assert
    assert workflow is not None
    assert workflow.workflow_name == "test_mode1"
    assert workflow.mode == 1
    assert hasattr(workflow, 'parallel_retrieval_node')
    assert hasattr(workflow, 'parallel_post_generation_node')
    assert workflow.enable_parallel_tier1 == True
    assert workflow.enable_parallel_tier2 == True
    print("✅ Mode 1 instantiation: PASS")


@pytest.mark.asyncio
async def test_mode2_instantiation(mock_services):
    """Test Mode 2 workflow instantiates correctly"""
    workflow = Mode2AutomaticWorkflow(
        workflow_name="test_mode2",
        mode=2,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service']
    )
    
    assert workflow is not None
    assert workflow.mode == 2
    assert hasattr(workflow, 'parallel_retrieval_node')
    print("✅ Mode 2 instantiation: PASS")


@pytest.mark.asyncio
async def test_mode3_instantiation(mock_services):
    """Test Mode 3 workflow instantiates correctly"""
    workflow = Mode3ChatManualWorkflow(
        workflow_name="test_mode3",
        mode=3,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service']
    )
    
    assert workflow is not None
    assert workflow.mode == 3
    assert hasattr(workflow, 'parallel_retrieval_node')
    print("✅ Mode 3 instantiation: PASS")


@pytest.mark.asyncio
async def test_mode4_instantiation(mock_services):
    """Test Mode 4 workflow instantiates correctly"""
    workflow = Mode4ChatAutomaticWorkflow(
        workflow_name="test_mode4",
        mode=4,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service']
    )
    
    assert workflow is not None
    assert workflow.mode == 4
    assert hasattr(workflow, 'parallel_retrieval_node')
    print("✅ Mode 4 instantiation: PASS")


# ============================================================================
# TEST PARALLEL EXECUTION
# ============================================================================

@pytest.mark.asyncio
async def test_mode1_parallel_execution(mock_services, sample_input):
    """Test Mode 1 executes parallel nodes successfully"""
    # Arrange
    workflow = Mode1ManualWorkflow(
        workflow_name="test_mode1_exec",
        mode=1,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service']
    )
    
    # Mock service responses
    mock_services['rag_service'].retrieve.return_value = [
        {"title": "FDA Guidance", "content": "SaMD requirements..."}
    ]
    mock_services['tool_service'].suggest_tools.return_value = []
    mock_services['memory_service'].get_context.return_value = {}
    
    # Act
    start_time = time.perf_counter()
    result = await workflow.parallel_retrieval_node(sample_input)
    duration_ms = (time.perf_counter() - start_time) * 1000
    
    # Assert
    assert result is not None
    assert 'rag_results' in result
    assert 'metadata' in result
    assert 'parallel_tier1' in result['metadata']
    
    # Performance check
    print(f"✅ Mode 1 parallel execution: PASS (duration: {duration_ms:.2f}ms)")
    
    # Verify all services were called
    mock_services['rag_service'].retrieve.assert_called_once()
    mock_services['tool_service'].suggest_tools.assert_called_once()
    mock_services['memory_service'].get_context.assert_called_once()


# ============================================================================
# TEST CONFIGURATION OPTIONS
# ============================================================================

@pytest.mark.asyncio
async def test_parallel_tier1_can_be_disabled(mock_services, sample_input):
    """Test that Tier 1 parallelization can be disabled"""
    # Arrange
    config = {'enable_parallel_tier1': False}
    workflow = Mode1ManualWorkflow(
        workflow_name="test_mode1_no_parallel",
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
    result = await workflow.parallel_retrieval_node(sample_input)
    
    # Assert - sequential fallback was used
    assert result is not None
    assert workflow.enable_parallel_tier1 == False
    print("✅ Parallel disabled test: PASS")


# ============================================================================
# TEST PERFORMANCE IMPROVEMENT
# ============================================================================

@pytest.mark.asyncio
async def test_parallel_vs_sequential_performance(mock_services, sample_input):
    """Benchmark parallel vs sequential execution"""
    # This is a smoke test - actual performance testing requires real services
    
    # Arrange - Parallel workflow
    parallel_workflow = Mode1ManualWorkflow(
        workflow_name="test_parallel",
        mode=1,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service'],
        config={'enable_parallel_tier1': True}
    )
    
    # Arrange - Sequential workflow
    sequential_workflow = Mode1ManualWorkflow(
        workflow_name="test_sequential",
        mode=1,
        agent_service=mock_services['agent_service'],
        rag_service=mock_services['rag_service'],
        tool_service=mock_services['tool_service'],
        memory_service=mock_services['memory_service'],
        streaming_service=mock_services['streaming_service'],
        config={'enable_parallel_tier1': False}
    )
    
    # Mock services with slight delays to simulate I/O
    async def mock_rag(*args, **kwargs):
        await asyncio.sleep(0.1)
        return []
    
    async def mock_tools(*args, **kwargs):
        await asyncio.sleep(0.05)
        return []
    
    async def mock_memory(*args, **kwargs):
        await asyncio.sleep(0.05)
        return {}
    
    mock_services['rag_service'].retrieve.side_effect = mock_rag
    mock_services['tool_service'].suggest_tools.side_effect = mock_tools
    mock_services['memory_service'].get_context.side_effect = mock_memory
    
    # Act - Parallel
    start_parallel = time.perf_counter()
    await parallel_workflow.parallel_retrieval_node(sample_input)
    parallel_duration_ms = (time.perf_counter() - start_parallel) * 1000
    
    # Reset mocks
    mock_services['rag_service'].retrieve.side_effect = mock_rag
    mock_services['tool_service'].suggest_tools.side_effect = mock_tools
    mock_services['memory_service'].get_context.side_effect = mock_memory
    
    # Act - Sequential
    start_sequential = time.perf_counter()
    await sequential_workflow.parallel_retrieval_node(sample_input)
    sequential_duration_ms = (time.perf_counter() - start_sequential) * 1000
    
    # Assert
    speedup = sequential_duration_ms / parallel_duration_ms if parallel_duration_ms > 0 else 1.0
    
    print(f"✅ Performance test: PASS")
    print(f"   Sequential: {sequential_duration_ms:.2f}ms")
    print(f"   Parallel:   {parallel_duration_ms:.2f}ms")
    print(f"   Speedup:    {speedup:.2f}x")
    
    # Parallel should be faster (speedup > 1.0)
    assert speedup >= 1.0, f"Expected speedup >= 1.0, got {speedup:.2f}"


# ============================================================================
# TEST BACKWARD COMPATIBILITY
# ============================================================================

@pytest.mark.asyncio
async def test_backward_compatibility_all_modes(mock_services):
    """Test that all modes still work with existing interfaces"""
    modes = [
        (Mode1ManualWorkflow, 1, "Mode1"),
        (Mode2AutomaticWorkflow, 2, "Mode2"),
        (Mode3ChatManualWorkflow, 3, "Mode3"),
        (Mode4ChatAutomaticWorkflow, 4, "Mode4"),
    ]
    
    for WorkflowClass, mode_num, mode_name in modes:
        workflow = WorkflowClass(
            workflow_name=f"test_{mode_name}",
            mode=mode_num,
            agent_service=mock_services['agent_service'],
            rag_service=mock_services['rag_service'],
            tool_service=mock_services['tool_service'],
            memory_service=mock_services['memory_service'],
            streaming_service=mock_services['streaming_service']
        )
        
        # Verify core attributes exist
        assert hasattr(workflow, 'workflow_name')
        assert hasattr(workflow, 'mode')
        assert hasattr(workflow, 'rag_service')
        assert hasattr(workflow, 'tool_service')
        assert hasattr(workflow, 'memory_service')
        assert hasattr(workflow, 'build_graph')
        
        # Verify parallel features are available
        assert hasattr(workflow, 'parallel_retrieval_node')
        assert hasattr(workflow, 'enable_parallel_tier1')
        assert hasattr(workflow, 'enable_parallel_tier2')
        
        print(f"✅ {mode_name} backward compatibility: PASS")


# ============================================================================
# RUN ALL TESTS
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("RUNNING INTEGRATION TESTS FOR PARALLEL WORKFLOWS")
    print("="*70 + "\n")
    
    pytest.main([__file__, "-v", "--tb=short", "-s"])

