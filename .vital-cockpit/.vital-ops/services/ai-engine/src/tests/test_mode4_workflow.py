"""
Unit Tests for Mode 4: Autonomous-Manual Workflow

Tests the ReAct-based autonomous workflow with manual agent selection.

Test Coverage:
- Workflow initialization
- Agent validation (user-selected)
- Fixed agent throughout execution
- ReAct loop with manual agent
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

from langgraph_workflows.mode4_autonomous_manual_workflow import Mode4AutonomousManualWorkflow
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
def mock_supabase():
    """Mock Supabase client with tenant context."""
    supabase = AsyncMock()
    supabase.set_tenant_context = AsyncMock()
    
    # Mock agent query
    mock_agent_response = AsyncMock()
    mock_agent_response.data = [{
        "id": "agent_001",
        "name": "FDA Regulatory Expert",
        "agent_type": "regulatory",
        "system_prompt": "I am an FDA regulatory expert",
        "medical_specialty": ["regulatory", "clinical"],
        "tools": ["rag_search", "web_search"],
        "status": "active"
    }]
    
    supabase.client.from_.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.execute = AsyncMock(
        return_value=mock_agent_response
    )
    
    return supabase


@pytest.fixture
def mock_cache_manager():
    """Mock cache manager."""
    cache = AsyncMock()
    cache.get = AsyncMock(return_value=None)
    cache.set = AsyncMock()
    cache.exists = AsyncMock(return_value=False)
    return cache


@pytest.fixture
def mock_rag_service():
    """Mock RAG service."""
    rag = AsyncMock()
    rag.search = AsyncMock(return_value={
        "results": [{"content": "FDA requires comprehensive safety data", "score": 0.9}],
        "total_results": 1
    })
    return rag


@pytest.fixture
def mock_feedback_manager():
    """Mock feedback manager."""
    return AsyncMock()


@pytest.fixture
def mock_enrichment_service():
    """Mock enrichment service."""
    return AsyncMock()


@pytest.fixture
def mock_react_engine():
    """Mock ReAct engine with realistic outputs."""
    from langgraph_workflows.react_engine import (
        GoalUnderstanding,
        TaskPlan,
        ThoughtOutput,
        ActionResult,
        ObservationOutput,
        ReflectionOutput,
        GoalReassessment
    )
    
    engine = AsyncMock()
    
    # Mock goal understanding
    engine.understand_goal = AsyncMock(return_value=GoalUnderstanding(
        understood_goal="Create comprehensive FDA IND submission plan",
        clarifications_needed=[],
        sub_goals=["Research FDA requirements", "Draft submission timeline"],
        success_criteria=["Complete IND submission plan created"],
        estimated_complexity=3,
        recommended_actions=["rag", "tool"]
    ))
    
    # Mock task plan
    engine.create_task_plan = AsyncMock(return_value=TaskPlan(
        tasks=["Research regulations", "Compile requirements", "Draft plan"],
        estimated_iterations=3,
        parallel_tasks=[]
    ))
    
    # Mock thought generation
    engine.generate_thought = AsyncMock(return_value=ThoughtOutput(
        thought="I need to search FDA regulatory database for IND requirements",
        next_action_type="rag",
        confidence=0.9
    ))
    
    # Mock action execution
    engine.execute_action = AsyncMock(return_value=ActionResult(
        action_type="rag",
        action_description="Searched FDA regulatory guidelines",
        result="FDA requires comprehensive safety and efficacy data for IND submissions",
        success=True,
        sources=[{"title": "FDA IND Guidelines", "url": "fda.gov/ind"}],
        metadata={}
    ))
    
    # Mock observation
    engine.generate_observation = AsyncMock(return_value="Retrieved comprehensive FDA requirements")
    
    # Mock reflection
    engine.generate_reflection = AsyncMock(return_value=ReflectionOutput(
        reflection="Successfully retrieved regulatory requirements",
        confidence=0.85,
        next_steps=["Analyze requirements"]
    ))
    
    # Mock goal reassessment
    engine.reassess_goal = AsyncMock(return_value=GoalReassessment(
        achieved=False,
        progress=0.5,
        remaining_work="Need to compile and draft plan",
        should_continue=True
    ))
    
    return engine


@pytest.fixture
def workflow(
    mock_supabase,
    mock_cache_manager,
    mock_rag_service,
    mock_feedback_manager,
    mock_enrichment_service,
    mock_react_engine
):
    """Create Mode 4 workflow with mocked dependencies."""
    wf = Mode4AutonomousManualWorkflow(
        supabase_client=mock_supabase,
        cache_manager=mock_cache_manager,
        rag_service=mock_rag_service,
        feedback_manager=mock_feedback_manager,
        enrichment_service=mock_enrichment_service,
        react_engine=mock_react_engine
    )
    return wf


# ============================================================================
# INITIALIZATION TESTS
# ============================================================================

def test_workflow_initialization(workflow):
    """Test Mode 4 workflow initializes with correct configuration."""
    assert workflow.workflow_name == "Mode4_Autonomous_Manual"
    assert workflow.mode == WorkflowMode.MODE_1_MANUAL
    assert workflow.enable_checkpoints is True
    assert workflow.supabase is not None
    assert workflow.react_engine is not None
    assert workflow.tool_chain_executor is not None  # From ToolChainMixin
    assert workflow.memory_service is not None  # From MemoryIntegrationMixin


def test_workflow_has_required_services(workflow):
    """Test workflow has all required services."""
    assert hasattr(workflow, 'supabase')
    assert hasattr(workflow, 'cache_manager')
    assert hasattr(workflow, 'rag_service')
    assert hasattr(workflow, 'feedback_manager')
    assert hasattr(workflow, 'enrichment_service')
    assert hasattr(workflow, 'react_engine')
    assert hasattr(workflow, 'autonomous_controller')
    assert hasattr(workflow, 'feedback_nodes')
    assert hasattr(workflow, 'memory_nodes')
    assert hasattr(workflow, 'enrichment_nodes')


# ============================================================================
# AGENT VALIDATION TESTS (Mode 4 specific)
# ============================================================================

@pytest.mark.asyncio
async def test_validate_agent_selection_success(workflow, tenant_id):
    """Test successful agent validation."""
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        selected_agents=["agent_001"],
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.validate_agent_selection_node(state)
    
    assert result['agent_validation_valid'] is True
    assert 'validated_agents' in result
    assert result['fixed_agent_id'] == "agent_001"  # Mode 4 specific
    assert len(result['validated_agents']) == 1


@pytest.mark.asyncio
async def test_validate_agent_selection_no_agents(workflow, tenant_id):
    """Test validation fails when no agents selected."""
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        selected_agents=[],
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.validate_agent_selection_node(state)
    
    assert result['agent_validation_valid'] is False
    assert 'agent_validation_error' in result
    assert "No agents selected" in result['agent_validation_error']


@pytest.mark.asyncio
async def test_validate_agent_selection_invalid_agent(workflow, tenant_id, mock_supabase):
    """Test validation fails for invalid/inactive agent."""
    # Mock empty response (agent not found)
    mock_response = AsyncMock()
    mock_response.data = []
    mock_supabase.client.from_.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.execute = AsyncMock(
        return_value=mock_response
    )
    
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        selected_agents=["invalid_agent"],
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.validate_agent_selection_node(state)
    
    assert result['agent_validation_valid'] is False
    assert 'agent_validation_error' in result
    assert "not found or inactive" in result['agent_validation_error']


# ============================================================================
# AGENT CONFIG TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_load_agent_config(workflow, tenant_id):
    """Test loading agent configuration."""
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        validated_agents=[{
            "id": "agent_001",
            "name": "FDA Expert",
            "agent_type": "regulatory",
            "system_prompt": "Expert in FDA regulations",
            "medical_specialty": ["regulatory"],
            "tools": ["rag_search"]
        }],
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.load_agent_config_node(state)
    
    assert 'agent_config' in result
    assert result['agent_config']['agent_id'] == "agent_001"
    assert result['agent_config']['agent_name'] == "FDA Expert"
    assert result['agent_config']['agent_type'] == "regulatory"
    assert result['agent_config']['rag_domains'] == ["regulatory"]


# ============================================================================
# REACT LOOP TESTS (with fixed agent)
# ============================================================================

@pytest.mark.asyncio
async def test_understand_goal_with_agent_context(workflow, tenant_id):
    """Test goal understanding includes agent context."""
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        agent_config={
            "agent_id": "agent_001",
            "agent_name": "FDA Expert",
            "agent_type": "regulatory"
        },
        model="gpt-4",
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.understand_goal_cot_node(state)
    
    assert 'goal_understanding' in result
    assert 'understood_goal' in result
    assert 'sub_goals' in result
    assert 'success_criteria' in result
    
    # Verify ReAct engine was called with agent context
    workflow.react_engine.understand_goal.assert_called_once()
    call_args = workflow.react_engine.understand_goal.call_args
    assert "FDA Expert" in call_args[0][2]  # Context should mention agent


@pytest.mark.asyncio
async def test_execute_action_uses_fixed_agent(workflow, tenant_id):
    """Test action execution uses fixed agent (not re-selected)."""
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        fixed_agent_id="agent_001",  # Mode 4 stores fixed agent
        current_thought={
            "thought": "Search FDA regulations",
            "next_action_type": "rag",
            "confidence": 0.9
        },
        enable_rag=True,
        enable_tools=False,
        model="gpt-4",
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.execute_action_node(state)
    
    assert 'current_action' in result
    
    # Verify ReAct engine was called with FIXED agent
    workflow.react_engine.execute_action.assert_called_once()
    call_args = workflow.react_engine.execute_action.call_args
    assert call_args[1]['agent_id'] == "agent_001"  # Fixed agent used


@pytest.mark.asyncio
async def test_initialize_react_creates_autonomous_controller(workflow, tenant_id):
    """Test ReAct initialization creates autonomous controller."""
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        understood_goal="Create comprehensive FDA IND submission plan",
        cost_limit_usd=15.0,
        runtime_limit_minutes=45,
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.initialize_react_state_node(state)
    
    assert result['current_iteration'] == 0
    assert result['goal_achieved'] is False
    assert result['total_cost_usd'] == 0.0
    assert 'session_id' in result
    assert workflow.autonomous_controller is not None
    assert workflow.autonomous_controller.goal == "Create comprehensive FDA IND submission plan"


# ============================================================================
# TOOL CHAINING TESTS (Mode 4)
# ============================================================================

@pytest.mark.asyncio
async def test_execute_action_with_tool_chain(workflow, tenant_id):
    """Test action execution can use tool chain."""
    # Mock tool chain executor
    from langgraph_workflows.tool_chain_executor import ToolChainResult
    
    mock_chain_result = ToolChainResult(
        steps_executed=3,
        detailed_results=[
            {"tool_name": "rag_search", "success": True},
            {"tool_name": "web_search", "success": True},
            {"tool_name": "web_scrape", "success": True}
        ],
        synthesis="Comprehensive FDA requirements compiled from multiple sources",
        success=True,
        total_cost_usd=0.15
    )
    
    workflow.tool_chain_executor.execute_tool_chain = AsyncMock(return_value=mock_chain_result)
    
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Research FDA requirements comprehensively",
        fixed_agent_id="agent_001",
        current_thought={
            "thought": "Need to research from multiple sources",
            "next_action_type": "tool_chain",
            "confidence": 0.95,
            "requires_multiple_steps": True  # Trigger tool chain
        },
        enable_rag=True,
        enable_tools=True,
        model="gpt-4",
        total_cost_usd=0.0,
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    # Mock should_use_tool_chain_react to return True
    workflow.should_use_tool_chain_react = lambda thought, state: True
    
    result = await workflow.execute_action_node(state)
    
    assert result['tool_chain_used'] is True
    assert result['total_cost_usd'] == 0.15
    assert 'current_action' in result
    assert result['current_action']['action_type'] == 'tool_chain'


# ============================================================================
# GOAL-BASED CONTINUATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_should_continue_react_goal_achieved(workflow, tenant_id):
    """Test continuation stops when goal is achieved."""
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        goal_achieved=True,  # Goal explicitly achieved
        current_iteration=2,
        max_iterations=5,
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    decision = await workflow.should_continue_react(state)
    
    assert decision == "achieved"


@pytest.mark.asyncio
async def test_should_continue_react_uses_autonomous_controller(workflow, tenant_id):
    """Test continuation uses autonomous controller for decision."""
    from services.autonomous_controller import ContinuationDecision
    
    # Initialize autonomous controller
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        understood_goal="Create comprehensive FDA submission plan",
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    # Initialize controller
    await workflow.initialize_react_state_node(state)
    
    # Mock controller decision
    workflow.autonomous_controller.should_continue = AsyncMock(return_value=ContinuationDecision(
        should_continue=True,
        reason="IN_PROGRESS",
        goal_progress=0.6,
        remaining_budget_usd=8.5,
        remaining_minutes=25.0
    ))
    
    state_with_progress = {
        **state,
        'current_iteration': 2,
        'total_cost_usd': 1.5,
        'goal_achieved': False,
        'goal_assessment': {'progress': 0.6}
    }
    
    decision = await workflow.should_continue_react(state_with_progress)
    
    assert decision == "iterate"
    workflow.autonomous_controller.should_continue.assert_called_once()


# ============================================================================
# ROUTING TESTS
# ============================================================================

def test_route_agent_validation_valid(workflow):
    """Test routing for valid agent."""
    state = {"agent_validation_valid": True}
    route = workflow.route_agent_validation(state)
    assert route == "valid"


def test_route_agent_validation_invalid(workflow):
    """Test routing for invalid agent."""
    state = {"agent_validation_valid": False}
    route = workflow.route_agent_validation(state)
    assert route == "invalid"


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_mode4_workflow_graph_structure(workflow):
    """Test Mode 4 workflow graph has correct structure."""
    graph = workflow.build_graph()
    
    # Check critical nodes exist
    assert "validate_tenant" in graph.nodes
    assert "validate_agent_selection" in graph.nodes  # Mode 4 specific
    assert "load_agent_config" in graph.nodes  # Mode 4 specific
    assert "understand_goal" in graph.nodes
    assert "create_plan" in graph.nodes
    assert "initialize_react" in graph.nodes
    assert "generate_thought" in graph.nodes
    assert "execute_action" in graph.nodes  # Uses fixed agent
    assert "generate_observation" in graph.nodes
    assert "generate_reflection" in graph.nodes
    assert "reassess_goal" in graph.nodes
    assert "synthesize_answer" in graph.nodes
    assert "calculate_confidence" in graph.nodes
    assert "format_output" in graph.nodes


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_validate_agent_handles_exception(workflow, tenant_id, mock_supabase):
    """Test agent validation handles database errors gracefully."""
    # Mock database error
    mock_supabase.client.from_.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.execute = AsyncMock(
        side_effect=Exception("Database connection failed")
    )
    
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        selected_agents=["agent_001"],
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.validate_agent_selection_node(state)
    
    assert result['agent_validation_valid'] is False
    assert 'agent_validation_error' in result
    assert "Database connection failed" in result['agent_validation_error']


@pytest.mark.asyncio
async def test_execute_action_handles_failure(workflow, tenant_id, mock_react_engine):
    """Test action execution handles failures gracefully."""
    # Mock action failure
    mock_react_engine.execute_action = AsyncMock(side_effect=Exception("RAG service unavailable"))
    
    state = UnifiedWorkflowState(
        workflow_id="test_workflow",
        tenant_id=str(tenant_id),
        query="Create FDA submission plan",
        fixed_agent_id="agent_001",
        current_thought={
            "thought": "Search regulations",
            "next_action_type": "rag",
            "confidence": 0.9
        },
        enable_rag=True,
        model="gpt-4",
        mode=WorkflowMode.MODE_1_MANUAL,
        status=ExecutionStatus.RUNNING
    )
    
    result = await workflow.execute_action_node(state)
    
    assert 'current_action' in result
    assert result['current_action']['success'] is False
    assert 'errors' in result
    assert any("RAG service unavailable" in str(e) for e in result['errors'])


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

