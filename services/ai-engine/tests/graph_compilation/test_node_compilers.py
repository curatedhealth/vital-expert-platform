"""
Tests for Node Compilers
"""

import pytest
from uuid import uuid4


@pytest.mark.asyncio
async def test_agent_node_compilation(mock_postgres_client):
    """Test agent node compilation"""
    from langgraph_workflows.node_compilers.agent_node_compiler import compile_agent_node
    
    node_data = {
        'node_key': 'test_agent',
        'agent_id': uuid4(),
        'config': {'temperature': 0.8}
    }
    
    node_func = await compile_agent_node(node_data, mock_postgres_client)
    assert callable(node_func)


@pytest.mark.asyncio
async def test_skill_node_compilation(mock_postgres_client):
    """Test skill node compilation"""
    from langgraph_workflows.node_compilers.skill_node_compiler import compile_skill_node
    
    node_data = {
        'node_key': 'test_skill',
        'skill_id': uuid4(),
        'config': {}
    }
    
    node_func = await compile_skill_node(node_data, mock_postgres_client)
    assert callable(node_func)


@pytest.mark.asyncio
async def test_router_node_compilation(mock_postgres_client):
    """Test router node compilation"""
    from langgraph_workflows.node_compilers.router_node_compiler import compile_router_node
    
    node_data = {
        'node_key': 'test_router',
        'config': {
            'routing_logic': {
                'type': 'tier_based',
                'route_key': 'route'
            }
        }
    }
    
    node_func = await compile_router_node(node_data, mock_postgres_client)
    assert callable(node_func)


@pytest.mark.asyncio
async def test_tool_node_compilation(mock_postgres_client):
    """Test tool node compilation"""
    from langgraph_workflows.node_compilers.tool_node_compiler import compile_tool_node
    
    node_data = {
        'node_key': 'test_tool',
        'tool_id': uuid4(),
        'config': {}
    }
    
    node_func = await compile_tool_node(node_data, mock_postgres_client)
    assert callable(node_func)
