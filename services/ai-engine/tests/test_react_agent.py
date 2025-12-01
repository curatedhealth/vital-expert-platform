"""
Unit Tests for ReActAgent
Tests the execute() method and ReAct workflow components
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json


class TestReActAgentExecute:
    """Tests for ReActAgent.execute() method"""

    @pytest.fixture
    def react_agent(self):
        """Create ReActAgent instance with mocked dependencies"""
        with patch('langgraph_compilation.patterns.react.get_graphrag_config') as mock_config, \
             patch('langgraph_compilation.patterns.react.AsyncOpenAI') as mock_openai:
            
            config = MagicMock()
            config.openai_api_key = "test-api-key"
            mock_config.return_value = config
            
            from langgraph_compilation.patterns.react import ReActAgent
            agent = ReActAgent(model="gpt-4", max_iterations=3)
            agent.client = AsyncMock()
            
            return agent

    @pytest.mark.asyncio
    async def test_execute_returns_expected_structure(self, react_agent, sample_query, sample_context):
        """Test that execute() returns dict with required keys"""
        # Mock the LLM responses
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "THOUGHT: I should search for FDA guidelines\nACTION: answer [The regulatory requirements are...]"
        
        react_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result = await react_agent.execute(
            query=sample_query,
            context=sample_context,
            tools_results=None,
            model="gpt-4"
        )
        
        # Verify structure
        assert isinstance(result, dict)
        assert 'response' in result
        assert 'citations' in result
        assert 'steps' in result
        assert 'confidence' in result
        assert 'iterations' in result
        assert 'tool_calls' in result

    @pytest.mark.asyncio
    async def test_execute_handles_empty_query(self, react_agent):
        """Test that execute() handles empty query gracefully"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "THOUGHT: No query provided\nACTION: answer"
        
        react_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result = await react_agent.execute(
            query="",
            context="",
            tools_results=None,
            model="gpt-4"
        )
        
        assert isinstance(result, dict)
        assert 'error' not in result or result.get('error') is None

    @pytest.mark.asyncio
    async def test_execute_with_tool_results(self, react_agent, sample_query, sample_tool_results):
        """Test that execute() properly uses provided tool results"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "THOUGHT: Using tool results\nACTION: answer [Based on the FDA guidelines...]"
        
        react_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result = await react_agent.execute(
            query=sample_query,
            context="",
            tools_results=sample_tool_results,
            model="gpt-4"
        )
        
        assert isinstance(result, dict)
        # Citations should be extracted from tool results with 'source'
        assert isinstance(result['citations'], list)

    @pytest.mark.asyncio
    async def test_execute_respects_max_iterations(self, react_agent, sample_query):
        """Test that execute() respects max_iterations limit"""
        # Mock response that always requests more actions
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "THOUGHT: Need more info\nACTION: search [more data]"
        
        react_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        react_agent.max_iterations = 2  # Set low for test
        
        result = await react_agent.execute(
            query=sample_query,
            context="",
            tools_results=None,
            model="gpt-4"
        )
        
        # Should complete within max_iterations
        assert result['iterations'] <= 2

    @pytest.mark.asyncio
    async def test_execute_error_handling(self, react_agent, sample_query):
        """Test that execute() handles errors gracefully"""
        # Mock to raise exception
        react_agent.client.chat.completions.create = AsyncMock(
            side_effect=Exception("API Error")
        )

        result = await react_agent.execute(
            query=sample_query,
            context="",
            tools_results=None,
            model="gpt-4"
        )

        # ReAct handles errors gracefully - returns valid structure with zero confidence
        assert isinstance(result, dict)
        assert result['confidence'] == 0.0
        assert result['iterations'] == 0
        assert 'response' in result  # Still has response key (may be empty)


class TestReActAgentReason:
    """Tests for ReActAgent.reason() method"""

    @pytest.fixture
    def react_agent(self):
        """Create ReActAgent instance with mocked dependencies"""
        with patch('langgraph_compilation.patterns.react.get_graphrag_config') as mock_config, \
             patch('langgraph_compilation.patterns.react.AsyncOpenAI') as mock_openai:
            
            config = MagicMock()
            config.openai_api_key = "test-api-key"
            mock_config.return_value = config
            
            from langgraph_compilation.patterns.react import ReActAgent
            agent = ReActAgent(model="gpt-4", max_iterations=5)
            agent.client = AsyncMock()
            
            return agent

    @pytest.mark.asyncio
    async def test_reason_parses_thought_and_action(self, react_agent, react_state_template, sample_query):
        """Test that reason() correctly parses THOUGHT and ACTION"""
        state = react_state_template.copy()
        state['query'] = sample_query
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "THOUGHT: I need to check FDA requirements\nACTION: search [FDA drug approval]"
        
        react_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result_state = await react_agent.reason(state)
        
        assert 'next_action' in result_state['metadata']
        assert len(result_state['reasoning']) > 0

    @pytest.mark.asyncio
    async def test_reason_sets_finalize_for_answer_action(self, react_agent, react_state_template, sample_query):
        """Test that reason() sets next_node='finalize' when action is 'answer'"""
        state = react_state_template.copy()
        state['query'] = sample_query
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "THOUGHT: I have the answer\nACTION: answer [The requirements are...]"
        
        react_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result_state = await react_agent.reason(state)
        
        assert result_state['next_node'] == 'finalize'


class TestReActAgentAct:
    """Tests for ReActAgent.act() method"""

    @pytest.fixture
    def react_agent(self):
        """Create ReActAgent instance with mocked dependencies"""
        with patch('langgraph_compilation.patterns.react.get_graphrag_config') as mock_config, \
             patch('langgraph_compilation.patterns.react.AsyncOpenAI') as mock_openai:
            
            config = MagicMock()
            config.openai_api_key = "test-api-key"
            mock_config.return_value = config
            
            from langgraph_compilation.patterns.react import ReActAgent
            agent = ReActAgent(model="gpt-4", max_iterations=5)
            agent.client = AsyncMock()
            
            return agent

    @pytest.mark.asyncio
    async def test_act_records_tool_call(self, react_agent, react_state_template, sample_query):
        """Test that act() records tool calls in state"""
        state = react_state_template.copy()
        state['query'] = sample_query
        state['metadata']['next_action'] = 'search FDA requirements'
        
        result_state = await react_agent.act(state)
        
        assert len(result_state['tool_calls']) > 0
        assert result_state['tool_calls'][0]['action_type'] == 'search'

    @pytest.mark.asyncio
    async def test_act_adds_observation_to_messages(self, react_agent, react_state_template, sample_query):
        """Test that act() adds observation to messages"""
        state = react_state_template.copy()
        state['query'] = sample_query
        state['metadata']['next_action'] = 'analyze drug approval data'
        
        result_state = await react_agent.act(state)
        
        # Should have added a system message with observation
        system_messages = [m for m in result_state['messages'] if m.get('role') == 'system']
        assert len(system_messages) > 0


class TestReActAgentFinalize:
    """Tests for ReActAgent.finalize() method"""

    @pytest.fixture
    def react_agent(self):
        """Create ReActAgent instance with mocked dependencies"""
        with patch('langgraph_compilation.patterns.react.get_graphrag_config') as mock_config, \
             patch('langgraph_compilation.patterns.react.AsyncOpenAI') as mock_openai:
            
            config = MagicMock()
            config.openai_api_key = "test-api-key"
            mock_config.return_value = config
            
            from langgraph_compilation.patterns.react import ReActAgent
            agent = ReActAgent(model="gpt-4", max_iterations=5)
            agent.client = AsyncMock()
            
            return agent

    @pytest.mark.asyncio
    async def test_finalize_generates_response(self, react_agent, react_state_template, sample_query):
        """Test that finalize() generates final response"""
        state = react_state_template.copy()
        state['query'] = sample_query
        state['reasoning'] = ['Analyzed FDA guidelines', 'Found Phase 3 requirements']
        state['tool_calls'] = [{'action': 'search FDA', 'action_type': 'search', 'params': 'FDA'}]
        state['tool_results'] = [{'type': 'search', 'content': 'Results found'}]
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Based on my analysis, FDA requires Phase 1, 2, and 3 trials."
        
        react_agent.client.chat.completions.create = AsyncMock(return_value=mock_response)
        
        result_state = await react_agent.finalize(state)
        
        assert result_state['response'] != ''
        assert result_state['confidence'] > 0
