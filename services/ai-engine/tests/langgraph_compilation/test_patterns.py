"""
Unit Tests for Deep Agent Patterns
Tests for Tree-of-Thoughts, ReAct, and Constitutional AI
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from langgraph_compilation.patterns import (
    TreeOfThoughtsAgent,
    create_tot_graph,
    ReActAgent,
    create_react_graph,
    ConstitutionalAgent,
    create_constitutional_graph,
    wrap_with_constitution
)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_tree_of_thoughts_generate(sample_plan_state, mock_openai_client):
    """Test ToT thought generation"""
    
    # Mock OpenAI to return JSON thoughts
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content='{"thoughts": [{"reasoning": "Approach 1", "why": "Because...", "challenges": "None"}]}'
            )
        )
    ]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    with patch('langgraph_compilation.patterns.tree_of_thoughts.AsyncOpenAI', return_value=mock_openai_client):
        agent = TreeOfThoughtsAgent(model='gpt-4')
        
        result_state = await agent.generate_thoughts(sample_plan_state)
        
        assert 'thought_tree' in result_state
        assert len(result_state['metadata'].get('generated_thoughts', [])) > 0


@pytest.mark.unit
@pytest.mark.asyncio
async def test_tree_of_thoughts_evaluate(sample_plan_state, mock_openai_client):
    """Test ToT thought evaluation"""
    
    # Setup state with thoughts
    sample_plan_state['metadata'] = {
        'generated_thoughts': [
            {'id': 'root_t0', 'content': 'Thought 1', 'parent': 'root', 'score': None}
        ]
    }
    sample_plan_state['thought_tree'] = {
        'root_t0': {'id': 'root_t0', 'content': 'Thought 1', 'parent': 'root', 'score': None}
    }
    
    # Mock score response
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content='0.85'))]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    with patch('langgraph_compilation.patterns.tree_of_thoughts.AsyncOpenAI', return_value=mock_openai_client):
        agent = TreeOfThoughtsAgent(model='gpt-4')
        
        result_state = await agent.evaluate_thoughts(sample_plan_state)
        
        assert 'evaluated_thoughts' in result_state
        assert result_state['evaluated_thoughts'][0]['score'] == 0.85


@pytest.mark.unit
@pytest.mark.asyncio
async def test_react_reason_step(sample_agent_state, mock_openai_client):
    """Test ReAct reasoning step"""
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content='THOUGHT: I need to search for information\nACTION: search diabetes treatment'
            )
        )
    ]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    with patch('langgraph_compilation.patterns.react.AsyncOpenAI', return_value=mock_openai_client):
        agent = ReActAgent(model='gpt-4', max_iterations=5)
        
        result_state = await agent.reason(sample_agent_state)
        
        assert len(result_state['reasoning']) > 0
        assert 'next_action' in result_state['metadata']
        assert result_state['metadata']['next_action'] == 'search diabetes treatment'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_react_act_step(sample_agent_state):
    """Test ReAct action execution"""
    
    sample_agent_state['metadata'] = {'next_action': 'search diabetes'}
    
    agent = ReActAgent(model='gpt-4')
    
    result_state = await agent.act(sample_agent_state)
    
    assert len(result_state['tool_calls']) > 0
    assert len(result_state['tool_results']) > 0


@pytest.mark.unit
@pytest.mark.asyncio
async def test_constitutional_critique(sample_critique_state, mock_openai_client):
    """Test Constitutional AI critique"""
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content='PASSES: NO\nEXPLANATION: Missing disclaimers\nSUGGESTION: Add medical disclaimer'
            )
        )
    ]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    with patch('langgraph_compilation.patterns.constitutional_ai.AsyncOpenAI', return_value=mock_openai_client):
        agent = ConstitutionalAgent(model='gpt-4')
        
        result_state = await agent.critique(sample_critique_state)
        
        assert 'critique_results' in result_state
        assert len(result_state['violations_found']) > 0
        assert result_state['safe_to_return'] is False


@pytest.mark.unit
@pytest.mark.asyncio
async def test_constitutional_revise(sample_critique_state, mock_openai_client):
    """Test Constitutional AI revision"""
    
    # Setup state with violations
    sample_critique_state['critique_results'] = [
        {
            'principle': 'Medical Accuracy',
            'passes': False,
            'explanation': 'Missing disclaimers',
            'suggestion': 'Add disclaimer'
        }
    ]
    sample_critique_state['violations_found'] = ['Medical Accuracy']
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content='Here is medical advice. Disclaimer: This is not professional medical advice.'
            )
        )
    ]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    with patch('langgraph_compilation.patterns.constitutional_ai.AsyncOpenAI', return_value=mock_openai_client):
        agent = ConstitutionalAgent(model='gpt-4')
        
        result_state = await agent.revise(sample_critique_state)
        
        assert 'revised_response' in result_state
        assert 'Disclaimer' in result_state['revised_response']


@pytest.mark.unit
@pytest.mark.asyncio
async def test_wrap_with_constitution(mock_openai_client):
    """Test constitutional wrapper utility"""
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(content='PASSES: YES\nEXPLANATION: Looks good')
        )
    ]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    with patch('langgraph_compilation.patterns.constitutional_ai.AsyncOpenAI', return_value=mock_openai_client):
        result = await wrap_with_constitution(
            "Safe response with proper disclaimers."
        )
        
        assert 'safe_response' in result
        assert 'violations_found' in result
        assert 'safe' in result


@pytest.mark.unit
def test_create_tot_graph():
    """Test ToT graph creation"""
    agent = TreeOfThoughtsAgent(model='gpt-4')
    graph = create_tot_graph(agent)
    
    assert graph is not None


@pytest.mark.unit
def test_create_react_graph():
    """Test ReAct graph creation"""
    agent = ReActAgent(model='gpt-4')
    graph = create_react_graph(agent)
    
    assert graph is not None


@pytest.mark.unit
def test_create_constitutional_graph():
    """Test Constitutional AI graph creation"""
    agent = ConstitutionalAgent(model='gpt-4')
    graph = create_constitutional_graph(agent)
    
    assert graph is not None

