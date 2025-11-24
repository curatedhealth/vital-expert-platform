"""
Unit Tests for Node Compilers
Tests for agent, skill, panel, router, tool, and human nodes
"""

import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from langgraph_compilation.nodes import (
    compile_agent_node,
    compile_skill_node,
    compile_panel_node,
    compile_router_node,
    compile_tool_node,
    compile_human_node
)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_compile_agent_node(sample_agent_state, mock_postgres_client, mock_openai_client, mock_graphrag_service):
    """Test agent node compilation and execution"""
    
    node_config = {
        'node_name': 'test_agent',
        'agent_id': uuid4(),
        'config': {'use_rag': True}
    }
    
    with patch('langgraph_compilation.nodes.agent_nodes.get_postgres_client', return_value=mock_postgres_client):
        with patch('langgraph_compilation.nodes.agent_nodes.AsyncOpenAI', return_value=mock_openai_client):
            with patch('langgraph_compilation.nodes.agent_nodes.get_graphrag_service', return_value=mock_graphrag_service):
                # Compile node
                node_func = await compile_agent_node(node_config)
                
                # Execute node
                result_state = await node_func(sample_agent_state)
                
                # Assertions
                assert 'test_agent' in result_state['execution_path']
                assert result_state['response'] is not None
                assert result_state['confidence'] > 0
                assert len(result_state['messages']) > 0


@pytest.mark.unit
@pytest.mark.asyncio
async def test_compile_skill_node(sample_agent_state, mock_postgres_client):
    """Test skill node compilation and execution"""
    
    node_config = {
        'node_name': 'test_skill',
        'skill_id': uuid4(),
        'config': {}
    }
    
    # Mock skill data
    mock_postgres_client.fetchrow.return_value = {
        'id': node_config['skill_id'],
        'name': 'Test Skill',
        'description': 'Test skill description',
        'skill_type': 'analysis',
        'implementation': 'test',
        'parameters': {},
        'metadata': {}
    }
    
    with patch('langgraph_compilation.nodes.skill_nodes.get_postgres_client', return_value=mock_postgres_client):
        # Compile node
        node_func = await compile_skill_node(node_config)
        
        # Execute node
        result_state = await node_func(sample_agent_state)
        
        # Assertions
        assert 'test_skill' in result_state['execution_path']
        assert 'test_skill_result' in result_state['metadata']


@pytest.mark.unit
@pytest.mark.asyncio
async def test_compile_panel_node(sample_agent_state):
    """Test panel node compilation and execution"""
    
    node_config = {
        'node_name': 'test_panel',
        'config': {
            'panel_type': 'parallel'
        }
    }
    
    # Add panel agents to state
    sample_agent_state['panel_agents'] = [uuid4(), uuid4(), uuid4()]
    
    # Compile node
    node_func = await compile_panel_node(node_config)
    
    # Execute node
    result_state = await node_func(sample_agent_state)
    
    # Assertions
    assert 'test_panel' in result_state['execution_path']
    assert 'agent_responses' in result_state
    assert 'consensus_reached' in result_state


@pytest.mark.unit
@pytest.mark.asyncio
async def test_compile_router_node(sample_agent_state):
    """Test router node compilation and execution"""
    
    node_config = {
        'node_name': 'test_router',
        'config': {
            'routing_logic': {
                'confidence_threshold': 0.8,
                'low_confidence_path': 'human_review',
                'high_confidence_path': 'end',
                'on_error': 'error_handler'
            }
        }
    }
    
    # Compile node
    node_func = await compile_router_node(node_config)
    
    # Test high confidence path
    sample_agent_state['confidence'] = 0.9
    result_state = await node_func(sample_agent_state)
    assert result_state['next_node'] == 'end'
    
    # Test low confidence path
    sample_agent_state['confidence'] = 0.5
    result_state = await node_func(sample_agent_state)
    assert result_state['next_node'] == 'human_review'
    
    # Test error path
    sample_agent_state['error'] = 'Test error'
    result_state = await node_func(sample_agent_state)
    assert result_state['next_node'] == 'error_handler'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_compile_tool_node(sample_agent_state, mock_postgres_client):
    """Test tool node compilation and execution"""
    
    tool_id = uuid4()
    node_config = {
        'node_name': 'test_tool',
        'config': {
            'tool_id': tool_id
        }
    }
    
    # Mock tool data
    mock_postgres_client.fetchrow.return_value = {
        'id': tool_id,
        'name': 'Test Tool',
        'slug': 'test-tool',
        'description': 'Test tool description',
        'tool_type': 'api',
        'endpoint_url': 'https://api.example.com',
        'function_spec': {},
        'metadata': {}
    }
    
    with patch('langgraph_compilation.nodes.tool_nodes.get_postgres_client', return_value=mock_postgres_client):
        # Compile node
        node_func = await compile_tool_node(node_config)
        
        # Execute node
        result_state = await node_func(sample_agent_state)
        
        # Assertions
        assert 'test_tool' in result_state['execution_path']
        assert len(result_state['tool_calls']) > 0
        assert len(result_state['tool_results']) > 0
        assert result_state['tool_calls'][0]['tool_id'] == str(tool_id)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_compile_human_node(sample_agent_state):
    """Test human node compilation and execution"""
    
    node_config = {
        'node_name': 'test_human',
        'config': {
            'review_type': 'approval'
        }
    }
    
    # Compile node
    node_func = await compile_human_node(node_config)
    
    # Execute node
    result_state = await node_func(sample_agent_state)
    
    # Assertions
    assert 'test_human' in result_state['execution_path']
    assert result_state['requires_human_review'] is True
    assert 'human_review' in result_state['metadata']
    assert result_state['metadata']['awaiting_human'] is True


@pytest.mark.unit
@pytest.mark.asyncio
async def test_agent_node_error_handling(sample_agent_state, mock_postgres_client):
    """Test agent node handles errors gracefully"""
    
    node_config = {
        'node_name': 'error_agent',
        'agent_id': uuid4(),
        'config': {}
    }
    
    # Mock to raise error
    mock_postgres_client.fetchrow.return_value = None
    
    with patch('langgraph_compilation.nodes.agent_nodes.get_postgres_client', return_value=mock_postgres_client):
        # Should raise error during compilation
        with pytest.raises(ValueError, match="Agent not found"):
            await compile_agent_node(node_config)

