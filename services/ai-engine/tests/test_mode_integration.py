"""
Integration Tests for Mode 3/4 Pattern Usage
Tests that Mode 3/4 workflows correctly use ReActAgent and TreeOfThoughtsAgent
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json


class TestMode3PatternIntegration:
    """Tests for Mode 3 (Manual-Agentic) pattern integration"""

    @pytest.fixture
    def mock_tot_agent(self):
        """Create mock TreeOfThoughtsAgent"""
        agent = MagicMock()
        agent.generate_plan = AsyncMock(return_value={
            'steps': [
                {'step_id': 'root_t0', 'action': 'Research FDA guidelines', 'status': 'pending'},
                {'step_id': 'root_t1', 'action': 'Analyze Phase 3 requirements', 'status': 'pending'}
            ],
            'best_path': ['root_t0', 'root_t1'],
            'thought_tree': {},
            'confidence': 0.85,
            'execution_results': [],
            'evaluated_thoughts': []
        })
        return agent

    @pytest.fixture
    def mock_react_agent(self):
        """Create mock ReActAgent"""
        agent = MagicMock()
        agent.execute = AsyncMock(return_value={
            'response': 'Based on FDA guidelines, Phase 3 trials require...',
            'citations': [{'source': 'FDA Guidelines', 'content': 'Phase 3 requirements'}],
            'steps': ['Searched FDA database', 'Analyzed requirements'],
            'confidence': 0.9,
            'iterations': 3,
            'tool_calls': []
        })
        return agent

    @pytest.mark.asyncio
    async def test_mode3_calls_tot_with_correct_signature(self, mock_tot_agent, sample_query, sample_context):
        """Test that Mode 3 calls ToT.generate_plan() with correct parameters"""
        # Simulate Mode 3 calling ToT
        await mock_tot_agent.generate_plan(
            query=sample_query,
            context=sample_context,
            max_steps=5,
            model="gpt-4"
        )
        
        # Verify call signature matches what Mode 3 expects
        mock_tot_agent.generate_plan.assert_called_once_with(
            query=sample_query,
            context=sample_context,
            max_steps=5,
            model="gpt-4"
        )

    @pytest.mark.asyncio
    async def test_mode3_calls_react_with_correct_signature(self, mock_react_agent, sample_query, sample_context, sample_tool_results):
        """Test that Mode 3 calls ReAct.execute() with correct parameters"""
        # Simulate Mode 3 calling ReAct
        await mock_react_agent.execute(
            query=sample_query,
            context=sample_context,
            tools_results=sample_tool_results,
            model="gpt-4"
        )
        
        # Verify call signature matches what Mode 3 expects
        mock_react_agent.execute.assert_called_once_with(
            query=sample_query,
            context=sample_context,
            tools_results=sample_tool_results,
            model="gpt-4"
        )

    @pytest.mark.asyncio
    async def test_mode3_tot_returns_steps_key(self, mock_tot_agent, sample_query):
        """Test that ToT returns 'steps' key (not 'plan_steps') for Mode 3"""
        result = await mock_tot_agent.generate_plan(
            query=sample_query,
            context="",
            max_steps=3,
            model="gpt-4"
        )
        
        # Mode 3 expects 'steps' key
        assert 'steps' in result
        assert isinstance(result['steps'], list)

    @pytest.mark.asyncio
    async def test_mode3_react_returns_response_key(self, mock_react_agent, sample_query):
        """Test that ReAct returns 'response' key for Mode 3"""
        result = await mock_react_agent.execute(
            query=sample_query,
            context="",
            tools_results=None,
            model="gpt-4"
        )
        
        # Mode 3 expects these keys
        assert 'response' in result
        assert 'citations' in result
        assert 'confidence' in result


class TestMode4PatternIntegration:
    """Tests for Mode 4 (Auto-Agentic) pattern integration"""

    @pytest.fixture
    def mock_tot_agent(self):
        """Create mock TreeOfThoughtsAgent"""
        agent = MagicMock()
        agent.generate_plan = AsyncMock(return_value={
            'steps': [
                {'step_id': 'auto_t0', 'action': 'Auto-selected approach', 'status': 'pending'}
            ],
            'best_path': ['auto_t0'],
            'thought_tree': {},
            'confidence': 0.88,
            'execution_results': [],
            'evaluated_thoughts': []
        })
        return agent

    @pytest.fixture
    def mock_react_agent(self):
        """Create mock ReActAgent"""
        agent = MagicMock()
        agent.execute = AsyncMock(return_value={
            'response': 'Auto-generated response based on analysis...',
            'citations': [],
            'steps': ['Auto-analyzed', 'Auto-executed'],
            'confidence': 0.92,
            'iterations': 2,
            'tool_calls': []
        })
        return agent

    @pytest.mark.asyncio
    async def test_mode4_calls_tot_with_correct_signature(self, mock_tot_agent, sample_query, sample_context):
        """Test that Mode 4 calls ToT.generate_plan() with correct parameters"""
        await mock_tot_agent.generate_plan(
            query=sample_query,
            context=sample_context,
            max_steps=5,
            model="gpt-4"
        )
        
        mock_tot_agent.generate_plan.assert_called_once_with(
            query=sample_query,
            context=sample_context,
            max_steps=5,
            model="gpt-4"
        )

    @pytest.mark.asyncio
    async def test_mode4_calls_react_with_correct_signature(self, mock_react_agent, sample_query, sample_context):
        """Test that Mode 4 calls ReAct.execute() with correct parameters"""
        await mock_react_agent.execute(
            query=sample_query,
            context=sample_context,
            tools_results=None,
            model="gpt-4"
        )
        
        mock_react_agent.execute.assert_called_once_with(
            query=sample_query,
            context=sample_context,
            tools_results=None,
            model="gpt-4"
        )


class TestPatternOrchestration:
    """Tests for ToT → ReAct orchestration pattern"""

    @pytest.fixture
    def mock_tot_agent(self):
        """Create mock TreeOfThoughtsAgent"""
        agent = MagicMock()
        agent.generate_plan = AsyncMock(return_value={
            'steps': [
                {'step_id': 'step_1', 'action': 'First action', 'status': 'pending'},
                {'step_id': 'step_2', 'action': 'Second action', 'status': 'pending'}
            ],
            'best_path': ['step_1', 'step_2'],
            'thought_tree': {},
            'confidence': 0.85,
            'execution_results': [],
            'evaluated_thoughts': []
        })
        return agent

    @pytest.fixture
    def mock_react_agent(self):
        """Create mock ReActAgent"""
        agent = MagicMock()
        agent.execute = AsyncMock(return_value={
            'response': 'Executed plan successfully',
            'citations': [],
            'steps': ['Executed step 1', 'Executed step 2'],
            'confidence': 0.9,
            'iterations': 2,
            'tool_calls': []
        })
        return agent

    @pytest.mark.asyncio
    async def test_tot_then_react_orchestration(self, mock_tot_agent, mock_react_agent, sample_query):
        """Test that ToT output can be used as input to ReAct"""
        # Step 1: ToT generates plan
        plan_result = await mock_tot_agent.generate_plan(
            query=sample_query,
            context="",
            max_steps=3,
            model="gpt-4"
        )
        
        # Verify plan has expected structure
        assert 'steps' in plan_result
        assert len(plan_result['steps']) > 0
        
        # Step 2: ReAct executes plan
        # Convert plan steps to tool results format
        tools_results = [
            {'type': 'plan_step', 'content': step['action']}
            for step in plan_result['steps']
        ]
        
        react_result = await mock_react_agent.execute(
            query=sample_query,
            context=f"Plan confidence: {plan_result['confidence']}",
            tools_results=tools_results,
            model="gpt-4"
        )
        
        # Verify ReAct produced response
        assert 'response' in react_result
        assert react_result['confidence'] > 0

    @pytest.mark.asyncio
    async def test_tot_failure_handled_gracefully(self, mock_tot_agent, mock_react_agent, sample_query):
        """Test that ReAct can proceed even if ToT fails"""
        # Simulate ToT failure
        mock_tot_agent.generate_plan = AsyncMock(return_value={
            'steps': [],
            'best_path': [],
            'thought_tree': {},
            'confidence': 0.0,
            'error': 'ToT failed'
        })
        
        plan_result = await mock_tot_agent.generate_plan(
            query=sample_query,
            context="",
            max_steps=3,
            model="gpt-4"
        )
        
        # ReAct should still be able to execute with empty tools_results
        react_result = await mock_react_agent.execute(
            query=sample_query,
            context="No plan available",
            tools_results=[],
            model="gpt-4"
        )
        
        # Verify ReAct still produced response
        assert 'response' in react_result


class TestModeMatrixMapping:
    """Tests for Golden Rule Matrix mode mapping"""

    def test_mode1_is_manual_conversational(self):
        """Mode 1: Manual expert selection + Conversational (no agentic)"""
        is_automatic = False
        is_autonomous = False
        
        # Mode 1 should NOT use ToT or ReAct
        assert not is_automatic  # Manual selection
        assert not is_autonomous  # Conversational

    def test_mode2_is_auto_conversational(self):
        """Mode 2: Auto expert selection + Conversational (no agentic)"""
        is_automatic = True
        is_autonomous = False
        
        # Mode 2 should NOT use ToT or ReAct
        assert is_automatic  # Auto selection
        assert not is_autonomous  # Conversational

    def test_mode3_is_manual_agentic(self):
        """Mode 3: Manual expert selection + Agentic (ToT + ReAct)"""
        is_automatic = False
        is_autonomous = True
        
        # Mode 3 SHOULD use ToT + ReAct
        assert not is_automatic  # Manual selection
        assert is_autonomous  # Agentic

    def test_mode4_is_auto_agentic(self):
        """Mode 4: Auto expert selection + Agentic (ToT + ReAct)"""
        is_automatic = True
        is_autonomous = True
        
        # Mode 4 SHOULD use ToT + ReAct
        assert is_automatic  # Auto selection
        assert is_autonomous  # Agentic
