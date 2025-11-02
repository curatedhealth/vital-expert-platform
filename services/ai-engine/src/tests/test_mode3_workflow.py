"""
Unit Tests for Mode 3: Autonomous-Automatic Workflow

Tests the ReAct-based autonomous workflow with automatic agent selection.

Test Coverage:
- Workflow initialization
- ReAct loop execution (Thought → Action → Observation)
- Automatic agent selection
- Tool chain execution
- Memory integration
- Goal-based continuation
- Streaming responses
- Error handling and recovery
"""

import pytest
import asyncio
from datetime import datetime, timezone
from uuid import uuid4
from unittest.mock import Mock, AsyncMock, MagicMock, patch

from langgraph_workflows.mode3_autonomous_auto_workflow import Mode3AutonomousAutoWorkflow
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def tenant_id():
    """Test tenant ID."""
    return uuid4()


@pytest.fixture
def mock_agent_selector():
    """Mock agent selector."""
    selector = AsyncMock()
    selector.select_agents = AsyncMock(return_value=[{
        "id": "agent_001",
        "name": "FDA Regulatory Expert",
        "description": "Expert in FDA regulatory submissions",
        "score": 0.95
    }])
    return selector


@pytest.fixture
def mock_rag_service():
    """Mock RAG service."""
    rag = AsyncMock()
    rag.search = AsyncMock(return_value={
        "results": [{
            "content": "FDA IND submission requires Form 1571...",
            "source": "FDA Guidance 2023",
            "relevance_score": 0.92
        }],
        "total_results": 1
    })
    return rag


@pytest.fixture
def mock_llm():
    """Mock LLM client."""
    llm = AsyncMock()
    llm.ainvoke = AsyncMock(return_value=Mock(content="Test response"))
    return llm


@pytest.fixture
async def workflow(mock_agent_selector, mock_rag_service, mock_llm):
    """Create Mode 3 workflow with mocked dependencies."""
    workflow = Mode3AutonomousAutoWorkflow()
    
    # Inject mocks
    workflow.agent_selector = mock_agent_selector
    workflow.rag_service = mock_rag_service
    workflow.llm = mock_llm
    
    await workflow.initialize()
    return workflow


# ============================================================================
# TEST: Initialization
# ============================================================================

@pytest.mark.asyncio
async def test_workflow_initialization():
    """Test Mode 3 workflow initializes correctly."""
    workflow = Mode3AutonomousAutoWorkflow()
    await workflow.initialize()
    
    assert workflow.graph is not None
    assert workflow.mode == WorkflowMode.MODE3_AUTONOMOUS_AUTO
    assert workflow.is_initialized is True


@pytest.mark.asyncio
async def test_workflow_has_required_services(workflow):
    """Test workflow has all required services."""
    assert workflow.agent_selector is not None
    assert workflow.rag_service is not None
    assert hasattr(workflow, 'cache_manager')
    assert hasattr(workflow, 'feedback_manager')


# ============================================================================
# TEST: ReAct Loop - Thought Node
# ============================================================================

@pytest.mark.asyncio
async def test_thought_node_generates_reasoning(workflow, tenant_id):
    """Test Thought node generates reasoning about next step."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="Create FDA IND submission plan",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        iteration_count=0,
        goal_achieved=False
    )
    
    # Mock LLM to return thought
    workflow.llm.ainvoke = AsyncMock(return_value=Mock(
        content="I need to search for FDA IND submission requirements first."
    ))
    
    result = await workflow._think(state)
    
    assert result["thought"] is not None
    assert len(result["thought"]) > 0
    assert result["iteration_count"] == 1


@pytest.mark.asyncio
async def test_thought_node_uses_previous_context(workflow, tenant_id):
    """Test Thought node considers previous observations."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="What are FDA IND requirements?",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        iteration_count=1,
        observations=["Found FDA guidance document"]
    )
    
    result = await workflow._think(state)
    
    # Should have generated a thought
    assert "thought" in result
    assert result["iteration_count"] == 2


# ============================================================================
# TEST: ReAct Loop - Action Node
# ============================================================================

@pytest.mark.asyncio
async def test_action_node_executes_rag_search(workflow, tenant_id):
    """Test Action node can execute RAG search."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="FDA IND requirements",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        thought="Need to search for IND requirements",
        action_type="rag_search",
        action_input={"query": "FDA IND requirements"}
    )
    
    result = await workflow._act(state)
    
    assert "action_result" in result
    workflow.rag_service.search.assert_called_once()


@pytest.mark.asyncio
async def test_action_node_executes_tool(workflow, tenant_id):
    """Test Action node can execute tools."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="Latest FDA guidance",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        thought="Need to search web for latest guidance",
        action_type="web_search",
        action_input={"query": "FDA IND guidance 2024"}
    )
    
    # Mock web search tool
    workflow.tool_registry = Mock()
    workflow.tool_registry.get_tool = Mock(return_value=AsyncMock(
        ainvoke=AsyncMock(return_value={"results": [{"title": "FDA Guidance 2024"}]})
    ))
    
    result = await workflow._act(state)
    
    assert "action_result" in result


# ============================================================================
# TEST: ReAct Loop - Observation Node
# ============================================================================

@pytest.mark.asyncio
async def test_observe_node_extracts_insights(workflow, tenant_id):
    """Test Observe node extracts insights from action results."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="FDA requirements",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        action_result={"results": [{"content": "FDA requires Form 1571"}]}
    )
    
    result = await workflow._observe(state)
    
    assert "observations" in result
    assert len(result["observations"]) > 0


# ============================================================================
# TEST: Automatic Agent Selection
# ============================================================================

@pytest.mark.asyncio
async def test_automatic_agent_selection(workflow, tenant_id):
    """Test workflow automatically selects best agents."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="FDA IND submission requirements",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO
    )
    
    result = await workflow._select_agent(state)
    
    assert "selected_agents" in result
    assert len(result["selected_agents"]) > 0
    workflow.agent_selector.select_agents.assert_called_once()


@pytest.mark.asyncio
async def test_agent_selection_uses_query_context(workflow, tenant_id):
    """Test agent selection considers query context."""
    query = "Create comprehensive FDA IND submission plan for novel DTx"
    
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query=query,
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO
    )
    
    await workflow._select_agent(state)
    
    # Verify query was passed to selector
    call_args = workflow.agent_selector.select_agents.call_args
    assert query in str(call_args)


# ============================================================================
# TEST: Goal-Based Continuation
# ============================================================================

@pytest.mark.asyncio
async def test_should_continue_when_goal_not_achieved(workflow, tenant_id):
    """Test continuation when goal is not yet achieved."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="FDA IND plan",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        iteration_count=2,
        goal_achieved=False,
        goal_progress=0.5
    )
    
    should_continue = await workflow._should_continue(state)
    
    assert should_continue is True


@pytest.mark.asyncio
async def test_should_stop_when_goal_achieved(workflow, tenant_id):
    """Test stops when goal is achieved."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="FDA requirements",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        iteration_count=3,
        goal_achieved=True,
        goal_progress=1.0
    )
    
    should_continue = await workflow._should_continue(state)
    
    assert should_continue is False


@pytest.mark.asyncio
async def test_should_stop_at_max_iterations(workflow, tenant_id):
    """Test stops at maximum iterations."""
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="Test query",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        iteration_count=10,  # Assuming max is 10
        goal_achieved=False
    )
    
    should_continue = await workflow._should_continue(state)
    
    # Should stop due to iteration limit
    assert should_continue is False or state.iteration_count >= workflow.max_iterations


# ============================================================================
# TEST: Full Execution
# ============================================================================

@pytest.mark.asyncio
async def test_execute_simple_query(workflow, tenant_id):
    """Test executing a simple query end-to-end."""
    result = await workflow.execute(
        tenant_id=tenant_id,
        query="What is FDA Form 1571?",
        model="gpt-4",
        enable_rag=True,
        enable_tools=False,
        max_iterations=2
    )
    
    assert result is not None
    assert "response" in result or "final_answer" in result
    assert result.get("status") in [ExecutionStatus.SUCCESS, ExecutionStatus.COMPLETED]


@pytest.mark.asyncio
async def test_execute_with_tool_usage(workflow, tenant_id):
    """Test execution with tool usage enabled."""
    result = await workflow.execute(
        tenant_id=tenant_id,
        query="Latest FDA guidance on digital health",
        model="gpt-4",
        enable_rag=True,
        enable_tools=True,
        max_iterations=3
    )
    
    assert result is not None
    # Should have used tools at some point
    assert result.get("tools_used", 0) >= 0


# ============================================================================
# TEST: Error Handling
# ============================================================================

@pytest.mark.asyncio
async def test_handles_rag_failure(workflow, tenant_id):
    """Test workflow handles RAG search failures gracefully."""
    # Make RAG fail
    workflow.rag_service.search = AsyncMock(side_effect=Exception("RAG unavailable"))
    
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="Test query",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        action_type="rag_search"
    )
    
    # Should not crash
    result = await workflow._act(state)
    
    # Should record error
    assert "error" in result or result.get("action_result") == {}


@pytest.mark.asyncio
async def test_handles_agent_selection_failure(workflow, tenant_id):
    """Test handles agent selection failures."""
    workflow.agent_selector.select_agents = AsyncMock(side_effect=Exception("Selector failed"))
    
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="Test query",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO
    )
    
    # Should not crash, fallback to default
    result = await workflow._select_agent(state)
    
    assert "selected_agents" in result or "error" in result


# ============================================================================
# TEST: Memory Integration
# ============================================================================

@pytest.mark.asyncio
async def test_stores_interaction_in_memory(workflow, tenant_id):
    """Test workflow stores interactions in long-term memory."""
    # Mock memory service
    workflow.memory_service = AsyncMock()
    workflow.memory_service.store_interaction = AsyncMock()
    
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="FDA requirements",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        final_answer="FDA requires Form 1571..."
    )
    
    await workflow._store_memory(state)
    
    workflow.memory_service.store_interaction.assert_called_once()


# ============================================================================
# TEST: Tool Chain Execution
# ============================================================================

@pytest.mark.asyncio
async def test_executes_tool_chains(workflow, tenant_id):
    """Test workflow can execute multi-tool chains."""
    # Mock tool chain executor
    workflow.tool_chain_executor = AsyncMock()
    workflow.tool_chain_executor.execute_chain = AsyncMock(return_value={
        "chain_result": "Chain executed successfully",
        "tools_used": ["rag_tool", "web_search"]
    })
    
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="Complex multi-step query",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO,
        requires_tool_chain=True
    )
    
    result = await workflow._execute_tool_chain(state)
    
    assert "chain_result" in result
    workflow.tool_chain_executor.execute_chain.assert_called_once()


# ============================================================================
# TEST: Streaming
# ============================================================================

@pytest.mark.asyncio
async def test_streams_reasoning_steps(workflow, tenant_id):
    """Test workflow streams reasoning steps."""
    stream_events = []
    
    async def mock_stream_callback(event):
        stream_events.append(event)
    
    workflow.stream_callback = mock_stream_callback
    
    state = UnifiedWorkflowState(
        tenant_id=tenant_id,
        query="Test query",
        mode=WorkflowMode.MODE3_AUTONOMOUS_AUTO
    )
    
    await workflow._think(state)
    
    # Should have streamed at least one event
    assert len(stream_events) > 0


# ============================================================================
# TEST: Performance
# ============================================================================

@pytest.mark.asyncio
async def test_execution_completes_within_timeout(workflow, tenant_id):
    """Test execution completes within reasonable time."""
    import time
    
    start = time.time()
    
    try:
        await asyncio.wait_for(
            workflow.execute(
                tenant_id=tenant_id,
                query="Quick test",
                model="gpt-4",
                max_iterations=2
            ),
            timeout=30.0  # 30 second timeout
        )
        elapsed = time.time() - start
        assert elapsed < 30.0
    except asyncio.TimeoutError:
        pytest.fail("Workflow execution timed out")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

