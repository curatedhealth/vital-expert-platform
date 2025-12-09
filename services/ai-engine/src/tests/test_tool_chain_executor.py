"""
Unit Tests for Tool Chain Executor

Tests the core AutoGPT capability - chaining multiple tools in ONE iteration.

Test Coverage:
- Executor initialization
- Tool chain planning (LLM-powered)
- Sequential execution with context passing
- Result synthesis
- Error recovery and graceful degradation
- Cost tracking
- Metrics and statistics
"""

import pytest
import asyncio
from datetime import datetime, timezone
from unittest.mock import Mock, AsyncMock, MagicMock, patch
import json

from langgraph_workflows.tool_chain_executor import (
    ToolChainExecutor,
    ToolStep,
    ToolChainPlan,
    StepResult,
    ToolChainResult
)
from tools.base_tool import BaseTool, ToolInput, ToolOutput
from integrations.tool_registry import ToolRegistry


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def mock_tool_registry():
    """Mock tool registry with sample tools."""
    registry = MagicMock(spec=ToolRegistry)
    
    # Create mock tools
    rag_tool = MagicMock(spec=BaseTool)
    rag_tool.name = "rag_search"
    rag_tool.category = "retrieval"
    rag_tool.description = "Search RAG knowledge base"
    rag_tool._execute_with_tracking = AsyncMock(return_value=ToolOutput(
        success=True,
        data="FDA requires comprehensive safety data for IND submissions",
        cost_usd=0.0,
        sources=[{"title": "FDA Guidelines", "url": "fda.gov"}]
    ))
    
    web_tool = MagicMock(spec=BaseTool)
    web_tool.name = "web_search"
    web_tool.category = "retrieval"
    web_tool.description = "Search the web"
    web_tool._execute_with_tracking = AsyncMock(return_value=ToolOutput(
        success=True,
        data="2024 FDA updates: enhanced data monitoring requirements",
        cost_usd=0.02,
        sources=[{"title": "FDA 2024 Updates", "url": "fda.gov/2024"}]
    ))
    
    analysis_tool = MagicMock(spec=BaseTool)
    analysis_tool.name = "analyze_data"
    analysis_tool.category = "analysis"
    analysis_tool.description = "Analyze and synthesize data"
    analysis_tool._execute_with_tracking = AsyncMock(return_value=ToolOutput(
        success=True,
        data="Key requirements: 1) Safety data, 2) Efficacy data, 3) Manufacturing info",
        cost_usd=0.01
    ))
    
    # Configure registry methods
    registry.get_tool.side_effect = lambda name: {
        "rag_search": rag_tool,
        "web_search": web_tool,
        "analyze_data": analysis_tool
    }.get(name)
    
    registry.get_available_tools.return_value = [rag_tool, web_tool, analysis_tool]
    registry.is_tool_available.return_value = True
    registry.record_usage = MagicMock()
    
    return registry


@pytest.fixture
def mock_openai():
    """Mock OpenAI client."""
    with patch('langgraph_workflows.tool_chain_executor.AsyncOpenAI') as mock:
        # Mock planning response
        planning_response = MagicMock()
        planning_response.choices = [MagicMock()]
        planning_response.choices[0].message.content = json.dumps({
            "steps": [
                {
                    "tool_name": "rag_search",
                    "tool_purpose": "Get FDA IND requirements from knowledge base",
                    "input_depends_on": "initial",
                    "expected_output": "FDA IND regulatory requirements"
                },
                {
                    "tool_name": "web_search",
                    "tool_purpose": "Find recent FDA updates for 2024",
                    "input_depends_on": "initial",
                    "expected_output": "Recent FDA regulatory changes"
                },
                {
                    "tool_name": "analyze_data",
                    "tool_purpose": "Synthesize requirements into checklist",
                    "input_depends_on": "step_2",
                    "expected_output": "Comprehensive checklist"
                }
            ],
            "reasoning": "First retrieve base requirements, then get updates, finally synthesize",
            "estimated_cost_usd": 0.05,
            "estimated_duration_ms": 3000
        })
        
        # Mock synthesis response
        synthesis_response = MagicMock()
        synthesis_response.choices = [MagicMock()]
        synthesis_response.choices[0].message.content = """
## Summary
Comprehensive FDA IND submission requirements compiled from regulatory guidelines and 2024 updates.

## Detailed Findings
- **RAG Search**: FDA requires safety data, efficacy data, and manufacturing information
- **Web Search**: 2024 updates include enhanced data monitoring requirements
- **Analysis**: Key requirements organized into actionable checklist

## Actionable Recommendations
1. Compile comprehensive safety data
2. Document efficacy results
3. Prepare manufacturing details
4. Implement 2024 monitoring requirements

## Citations
- FDA Guidelines (fda.gov)
- FDA 2024 Updates (fda.gov/2024)
"""
        
        # Configure mock client
        client_instance = AsyncMock()
        client_instance.chat.completions.create = AsyncMock()
        client_instance.chat.completions.create.side_effect = [
            planning_response,
            synthesis_response
        ]
        
        mock.return_value = client_instance
        
        yield mock


@pytest.fixture
def executor(mock_tool_registry, mock_openai):
    """Create ToolChainExecutor with mocked dependencies."""
    return ToolChainExecutor(
        tool_registry=mock_tool_registry,
        max_chain_length=5,
        planning_model="gpt-4",
        synthesis_model="gpt-4",
        enable_streaming=False
    )


# ============================================================================
# INITIALIZATION TESTS
# ============================================================================

def test_executor_initialization(executor, mock_tool_registry):
    """Test executor initializes with correct configuration."""
    assert executor.tool_registry == mock_tool_registry
    assert executor.max_chain_length == 5
    assert executor.planning_model == "gpt-4"
    assert executor.synthesis_model == "gpt-4"
    assert executor.enable_streaming is False
    
    # Check initial metrics
    assert executor.chains_executed == 0
    assert executor.total_steps_executed == 0
    assert executor.total_cost_usd == 0.0


def test_executor_with_custom_settings(mock_tool_registry, mock_openai):
    """Test executor accepts custom settings."""
    executor = ToolChainExecutor(
        tool_registry=mock_tool_registry,
        max_chain_length=10,
        planning_model="gpt-3.5-turbo",
        synthesis_model="gpt-4-turbo",
        enable_streaming=True
    )
    
    assert executor.max_chain_length == 10
    assert executor.planning_model == "gpt-3.5-turbo"
    assert executor.synthesis_model == "gpt-4-turbo"
    assert executor.enable_streaming is True


# ============================================================================
# TOOL CHAIN PLANNING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_plan_tool_chain_success(executor):
    """Test successful tool chain planning."""
    task = "Research FDA IND requirements and create checklist"
    tenant_id = "tenant_123"
    
    plan = await executor._plan_tool_chain(
        task=task,
        tenant_id=tenant_id,
        available_tools=["rag_search", "web_search", "analyze_data"]
    )
    
    assert isinstance(plan, ToolChainPlan)
    assert len(plan.steps) == 3
    assert plan.steps[0].tool_name == "rag_search"
    assert plan.steps[1].tool_name == "web_search"
    assert plan.steps[2].tool_name == "analyze_data"
    assert plan.reasoning != ""
    assert plan.estimated_cost_usd >= 0


@pytest.mark.asyncio
async def test_plan_tool_chain_no_available_tools(executor, mock_tool_registry):
    """Test planning fails when no tools available."""
    # Mock no tools available
    mock_tool_registry.get_available_tools.return_value = []
    mock_tool_registry.get_tool.return_value = None
    
    task = "Research FDA IND requirements"
    tenant_id = "tenant_123"
    
    with pytest.raises(ValueError, match="No tools available"):
        await executor._plan_tool_chain(
            task=task,
            tenant_id=tenant_id
        )


@pytest.mark.asyncio
async def test_plan_tool_chain_validates_tools(executor, mock_tool_registry):
    """Test planning validates tool availability."""
    # Mock one tool unavailable
    mock_tool_registry.is_tool_available.side_effect = lambda name, tid: name != "analyze_data"
    
    task = "Research and analyze FDA requirements"
    tenant_id = "tenant_123"
    
    plan = await executor._plan_tool_chain(
        task=task,
        tenant_id=tenant_id
    )
    
    # Should still return plan, but log warning
    assert isinstance(plan, ToolChainPlan)
    # Verify validation was called
    assert mock_tool_registry.is_tool_available.called


# ============================================================================
# CHAIN EXECUTION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_execute_chain_success(executor):
    """Test successful chain execution with context passing."""
    plan = ToolChainPlan(
        steps=[
            ToolStep(
                tool_name="rag_search",
                tool_purpose="Get FDA requirements",
                input_depends_on="initial",
                expected_output="FDA requirements"
            ),
            ToolStep(
                tool_name="web_search",
                tool_purpose="Get recent updates",
                input_depends_on="initial",
                expected_output="Recent updates"
            ),
            ToolStep(
                tool_name="analyze_data",
                tool_purpose="Synthesize into checklist",
                input_depends_on="step_2",
                expected_output="Checklist"
            )
        ],
        reasoning="Retrieve then analyze",
        estimated_cost_usd=0.05,
        estimated_duration_ms=3000
    )
    
    task = "Research FDA IND requirements"
    context = {"tenant_id": "tenant_123", "agent_id": "agent_001"}
    
    step_results = await executor._execute_chain(
        plan=plan,
        task=task,
        context=context,
        max_steps=5
    )
    
    assert len(step_results) == 3
    assert all(isinstance(sr, StepResult) for sr in step_results)
    assert step_results[0].tool_name == "rag_search"
    assert step_results[1].tool_name == "web_search"
    assert step_results[2].tool_name == "analyze_data"
    assert all(sr.success for sr in step_results)


@pytest.mark.asyncio
async def test_execute_chain_context_passing(executor, mock_tool_registry):
    """Test context is properly passed between steps."""
    plan = ToolChainPlan(
        steps=[
            ToolStep(
                tool_name="rag_search",
                tool_purpose="Step 1",
                input_depends_on="initial",
                expected_output="Output 1"
            ),
            ToolStep(
                tool_name="analyze_data",
                tool_purpose="Step 2 using Step 1 output",
                input_depends_on="step_1",
                expected_output="Final output"
            )
        ],
        reasoning="Sequential processing"
    )
    
    task = "Test task"
    context = {"tenant_id": "tenant_123"}
    
    step_results = await executor._execute_chain(
        plan=plan,
        task=task,
        context=context,
        max_steps=5
    )
    
    # Verify tools were called
    rag_tool = mock_tool_registry.get_tool("rag_search")
    analysis_tool = mock_tool_registry.get_tool("analyze_data")
    
    assert rag_tool._execute_with_tracking.called
    assert analysis_tool._execute_with_tracking.called
    
    # Check that second tool received context with step_1 result
    second_call_args = analysis_tool._execute_with_tracking.call_args
    assert 'step_1' in second_call_args[0][0].context


@pytest.mark.asyncio
async def test_execute_chain_handles_tool_failure(executor, mock_tool_registry):
    """Test chain continues gracefully when a tool fails."""
    # Mock web_search to fail
    web_tool = mock_tool_registry.get_tool("web_search")
    web_tool._execute_with_tracking = AsyncMock(side_effect=Exception("Network error"))
    
    plan = ToolChainPlan(
        steps=[
            ToolStep(
                tool_name="rag_search",
                tool_purpose="Step 1",
                input_depends_on="initial",
                expected_output="Output 1"
            ),
            ToolStep(
                tool_name="web_search",
                tool_purpose="Step 2 (will fail)",
                input_depends_on="initial",
                expected_output="Output 2"
            ),
            ToolStep(
                tool_name="analyze_data",
                tool_purpose="Step 3 (should still run)",
                input_depends_on="step_1",
                expected_output="Final output"
            )
        ],
        reasoning="Test error recovery"
    )
    
    task = "Test task"
    context = {"tenant_id": "tenant_123"}
    
    step_results = await executor._execute_chain(
        plan=plan,
        task=task,
        context=context,
        max_steps=5
    )
    
    assert len(step_results) == 3
    assert step_results[0].success is True  # rag_search succeeded
    assert step_results[1].success is False  # web_search failed
    assert "Network error" in step_results[1].error_message
    assert step_results[2].success is True  # analyze_data succeeded (graceful degradation)


@pytest.mark.asyncio
async def test_execute_chain_missing_tool(executor, mock_tool_registry):
    """Test chain handles missing tool gracefully."""
    # Mock get_tool to return None for unknown tool
    original_get_tool = mock_tool_registry.get_tool
    mock_tool_registry.get_tool.side_effect = lambda name: None if name == "missing_tool" else original_get_tool(name)
    
    plan = ToolChainPlan(
        steps=[
            ToolStep(
                tool_name="rag_search",
                tool_purpose="Step 1",
                input_depends_on="initial",
                expected_output="Output 1"
            ),
            ToolStep(
                tool_name="missing_tool",
                tool_purpose="Step 2 (missing)",
                input_depends_on="step_1",
                expected_output="Output 2"
            )
        ],
        reasoning="Test missing tool"
    )
    
    task = "Test task"
    context = {"tenant_id": "tenant_123"}
    
    step_results = await executor._execute_chain(
        plan=plan,
        task=task,
        context=context,
        max_steps=5
    )
    
    assert len(step_results) == 2
    assert step_results[0].success is True
    assert step_results[1].success is False
    assert "not found in registry" in step_results[1].error_message


@pytest.mark.asyncio
async def test_execute_chain_respects_max_steps(executor):
    """Test chain respects max_steps limit."""
    plan = ToolChainPlan(
        steps=[
            ToolStep(
                tool_name="rag_search",
                tool_purpose=f"Step {i}",
                input_depends_on="initial",
                expected_output=f"Output {i}"
            )
            for i in range(1, 11)  # 10 steps
        ],
        reasoning="Many steps"
    )
    
    task = "Test task"
    context = {"tenant_id": "tenant_123"}
    
    step_results = await executor._execute_chain(
        plan=plan,
        task=task,
        context=context,
        max_steps=3  # Only execute 3 steps
    )
    
    assert len(step_results) == 3  # Should stop at max_steps


# ============================================================================
# RESULT SYNTHESIS TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_synthesize_results_success(executor):
    """Test successful result synthesis."""
    task = "Research FDA IND requirements"
    
    plan = ToolChainPlan(
        steps=[],
        reasoning="Test plan"
    )
    
    step_results = [
        StepResult(
            step_number=1,
            tool_name="rag_search",
            success=True,
            output_data="FDA requires comprehensive safety data",
            cost_usd=0.0,
            duration_ms=500.0
        ),
        StepResult(
            step_number=2,
            tool_name="web_search",
            success=True,
            output_data="2024 updates include enhanced monitoring",
            cost_usd=0.02,
            duration_ms=800.0
        )
    ]
    
    synthesis = await executor._synthesize_results(
        task=task,
        plan=plan,
        step_results=step_results
    )
    
    assert isinstance(synthesis, str)
    assert len(synthesis) > 0
    assert "Summary" in synthesis or "FDA" in synthesis  # Should contain relevant content


@pytest.mark.asyncio
async def test_synthesize_results_empty_results(executor):
    """Test synthesis handles empty results."""
    task = "Test task"
    plan = ToolChainPlan(steps=[], reasoning="Test")
    step_results = []
    
    synthesis = await executor._synthesize_results(
        task=task,
        plan=plan,
        step_results=step_results
    )
    
    assert synthesis == "No tool results to synthesize."


@pytest.mark.asyncio
async def test_synthesize_results_with_failures(executor):
    """Test synthesis includes information about failed steps."""
    task = "Research FDA requirements"
    plan = ToolChainPlan(steps=[], reasoning="Test")
    
    step_results = [
        StepResult(
            step_number=1,
            tool_name="rag_search",
            success=True,
            output_data="FDA guidelines found",
            cost_usd=0.0,
            duration_ms=500.0
        ),
        StepResult(
            step_number=2,
            tool_name="web_search",
            success=False,
            output_data=None,
            cost_usd=0.0,
            duration_ms=100.0,
            error_message="Network timeout"
        )
    ]
    
    synthesis = await executor._synthesize_results(
        task=task,
        plan=plan,
        step_results=step_results
    )
    
    # Should still produce synthesis from available results
    assert isinstance(synthesis, str)
    assert len(synthesis) > 0


# ============================================================================
# FULL INTEGRATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_execute_tool_chain_end_to_end(executor):
    """Test complete tool chain execution end-to-end."""
    task = "Research FDA IND requirements and create comprehensive checklist"
    tenant_id = "tenant_123"
    context = {"agent_id": "agent_001", "rag_domains": ["regulatory"]}
    
    result = await executor.execute_tool_chain(
        task=task,
        tenant_id=tenant_id,
        available_tools=["rag_search", "web_search", "analyze_data"],
        context=context,
        max_steps=5
    )
    
    assert isinstance(result, ToolChainResult)
    assert result.success is True
    assert result.steps_executed == 3
    assert len(result.step_results) == 3
    assert result.synthesis != ""
    assert result.total_cost_usd >= 0
    assert result.total_duration_ms >= 0
    
    # Check metadata
    assert 'task' in result.metadata
    assert 'plan_reasoning' in result.metadata


@pytest.mark.asyncio
async def test_execute_tool_chain_updates_metrics(executor):
    """Test chain execution updates executor metrics."""
    initial_chains = executor.chains_executed
    initial_steps = executor.total_steps_executed
    initial_cost = executor.total_cost_usd
    
    task = "Test task"
    tenant_id = "tenant_123"
    
    result = await executor.execute_tool_chain(
        task=task,
        tenant_id=tenant_id,
        available_tools=["rag_search", "web_search"],
        max_steps=2
    )
    
    assert executor.chains_executed == initial_chains + 1
    assert executor.total_steps_executed > initial_steps
    assert executor.total_cost_usd >= initial_cost


@pytest.mark.asyncio
async def test_execute_tool_chain_handles_planning_failure(executor, mock_tool_registry):
    """Test chain handles planning failures gracefully."""
    # Mock planning to fail
    mock_tool_registry.get_available_tools.return_value = []
    
    task = "Test task"
    tenant_id = "tenant_123"
    
    result = await executor.execute_tool_chain(
        task=task,
        tenant_id=tenant_id
    )
    
    assert isinstance(result, ToolChainResult)
    assert result.success is False
    assert result.steps_executed == 0
    assert "failed" in result.synthesis.lower()
    assert 'error' in result.metadata


# ============================================================================
# METRICS AND UTILITIES TESTS
# ============================================================================

def test_get_stats_initial_state(executor):
    """Test stats are correct in initial state."""
    stats = executor.get_stats()
    
    assert stats['chains_executed'] == 0
    assert stats['total_steps_executed'] == 0
    assert stats['avg_steps_per_chain'] == 0.0
    assert stats['total_cost_usd'] == 0.0
    assert stats['avg_cost_per_chain'] == 0.0


@pytest.mark.asyncio
async def test_get_stats_after_execution(executor):
    """Test stats are updated after chain execution."""
    # Execute a chain
    await executor.execute_tool_chain(
        task="Test task",
        tenant_id="tenant_123",
        available_tools=["rag_search", "web_search"],
        max_steps=2
    )
    
    stats = executor.get_stats()
    
    assert stats['chains_executed'] == 1
    assert stats['total_steps_executed'] > 0
    assert stats['avg_steps_per_chain'] > 0.0
    assert stats['total_cost_usd'] >= 0.0


def test_reset_stats(executor):
    """Test stats can be reset."""
    # Manually set some stats
    executor.chains_executed = 5
    executor.total_steps_executed = 20
    executor.total_cost_usd = 1.5
    
    executor.reset_stats()
    
    assert executor.chains_executed == 0
    assert executor.total_steps_executed == 0
    assert executor.total_cost_usd == 0.0


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_execute_tool_chain_handles_unexpected_exception(executor, mock_tool_registry):
    """Test chain handles unexpected exceptions gracefully."""
    # Mock tool to raise unexpected exception
    rag_tool = mock_tool_registry.get_tool("rag_search")
    rag_tool._execute_with_tracking = AsyncMock(side_effect=RuntimeError("Unexpected error"))
    
    task = "Test task"
    tenant_id = "tenant_123"
    
    # Should not raise, should return failed result
    result = await executor.execute_tool_chain(
        task=task,
        tenant_id=tenant_id,
        available_tools=["rag_search"],
        max_steps=1
    )
    
    # Chain should complete but with failed steps
    assert isinstance(result, ToolChainResult)
    assert len(result.step_results) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

