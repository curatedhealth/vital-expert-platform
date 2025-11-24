"""
Unit Tests for Graph Compiler
Tests for agent graph compilation and execution
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4

from langgraph_compilation.compiler import compile_agent_graph, AgentGraphCompiler


@pytest.mark.unit
@pytest.mark.asyncio
async def test_compile_simple_graph(sample_graph_data, mock_postgres_client):
    """Test compilation of simple agent graph"""
    
    graph_id = sample_graph_data['graph']['id']
    
    # Mock database responses
    mock_postgres_client.fetchrow.side_effect = [
        sample_graph_data['graph'],  # Graph metadata
        {'id': uuid4(), 'name': 'Test Agent', 'system_prompt': 'Test', 'model_name': 'gpt-4', 'temperature': 0.7, 'metadata': {}}  # Agent data for node
    ]
    mock_postgres_client.fetch.side_effect = [
        sample_graph_data['nodes'],  # Nodes
        sample_graph_data['edges']  # Edges
    ]
    
    # Mock checkpointer
    mock_checkpointer = MagicMock()
    
    with patch('langgraph_compilation.compiler.get_postgres_client', return_value=mock_postgres_client):
        # Compile graph
        compiled_graph = await compile_agent_graph(graph_id, mock_checkpointer)
        
        # Assertions
        assert compiled_graph is not None
        # LangGraph's compiled graph should be callable
        assert callable(compiled_graph.invoke) or callable(compiled_graph.ainvoke)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_graph_compiler_load_graph(sample_graph_data, mock_postgres_client):
    """Test graph metadata loading"""
    
    graph_id = sample_graph_data['graph']['id']
    
    mock_postgres_client.fetchrow.return_value = sample_graph_data['graph']
    
    compiler = AgentGraphCompiler(mock_postgres_client)
    
    graph_meta = await compiler._load_graph_metadata(graph_id)
    
    assert graph_meta['id'] == graph_id
    assert graph_meta['name'] == 'Test Graph'
    assert graph_meta['entry_node'] == 'agent_1'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_graph_compiler_load_nodes(sample_graph_data, mock_postgres_client):
    """Test graph nodes loading"""
    
    graph_id = sample_graph_data['graph']['id']
    
    mock_postgres_client.fetch.return_value = sample_graph_data['nodes']
    
    compiler = AgentGraphCompiler(mock_postgres_client)
    
    nodes = await compiler._load_graph_nodes(graph_id)
    
    assert len(nodes) == 2
    assert nodes[0]['node_type'] == 'agent'
    assert nodes[1]['node_type'] == 'tool'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_graph_compiler_load_edges(sample_graph_data, mock_postgres_client):
    """Test graph edges loading"""
    
    graph_id = sample_graph_data['graph']['id']
    
    mock_postgres_client.fetch.return_value = sample_graph_data['edges']
    
    compiler = AgentGraphCompiler(mock_postgres_client)
    
    edges = await compiler._load_graph_edges(graph_id)
    
    assert len(edges) == 1
    assert edges[0]['source_node'] == 'agent_1'
    assert edges[0]['target_node'] == 'tool_1'
    assert edges[0]['edge_type'] == 'direct'


@pytest.mark.unit
@pytest.mark.asyncio
async def test_graph_compiler_error_handling(mock_postgres_client):
    """Test graph compiler handles missing graph"""
    
    graph_id = uuid4()
    
    # Mock returns None (graph not found)
    mock_postgres_client.fetchrow.return_value = None
    
    mock_checkpointer = MagicMock()
    
    with patch('langgraph_compilation.compiler.get_postgres_client', return_value=mock_postgres_client):
        with pytest.raises(ValueError, match="Agent graph not found"):
            await compile_agent_graph(graph_id, mock_checkpointer)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_conditional_edge_compilation(mock_postgres_client):
    """Test compilation of conditional edges"""
    
    graph_id = uuid4()
    
    graph_data = {
        'id': graph_id,
        'name': 'Conditional Graph',
        'description': 'Graph with conditional routing',
        'entry_node': 'router'
    }
    
    nodes_data = [
        {
            'id': uuid4(),
            'graph_id': graph_id,
            'node_name': 'router',
            'node_type': 'router',
            'config': {
                'routing_logic': {
                    'confidence_threshold': 0.8,
                    'low_confidence_path': 'human',
                    'high_confidence_path': 'end'
                }
            },
            'x_position': 0,
            'y_position': 0
        },
        {
            'id': uuid4(),
            'graph_id': graph_id,
            'node_name': 'human',
            'node_type': 'human',
            'config': {'review_type': 'approval'},
            'x_position': 100,
            'y_position': 0
        }
    ]
    
    edges_data = [
        {
            'id': uuid4(),
            'graph_id': graph_id,
            'source_node': 'router',
            'target_node': 'human',
            'edge_type': 'conditional',
            'condition': 'low_confidence'
        }
    ]
    
    mock_postgres_client.fetchrow.return_value = graph_data
    mock_postgres_client.fetch.side_effect = [nodes_data, edges_data]
    
    mock_checkpointer = MagicMock()
    
    with patch('langgraph_compilation.compiler.get_postgres_client', return_value=mock_postgres_client):
        compiled_graph = await compile_agent_graph(graph_id, mock_checkpointer)
        
        assert compiled_graph is not None

