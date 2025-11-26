"""
Tests for AgentGraphCompiler
"""

import pytest
from uuid import uuid4


@pytest.mark.asyncio
async def test_compiler_initialization(mock_postgres_client, mock_checkpoint_manager):
    """Test compiler initialization"""
    from langgraph_workflows.graph_compiler import AgentGraphCompiler
    
    compiler = AgentGraphCompiler(mock_postgres_client, mock_checkpoint_manager)
    assert compiler.postgres is not None
    assert compiler.checkpoint_manager is not None
    assert len(compiler.node_compilers) == 6


@pytest.mark.asyncio
async def test_graph_validation(sample_graph_data, mock_postgres_client, mock_checkpoint_manager):
    """Test graph validation"""
    from langgraph_workflows.graph_compiler import AgentGraphCompiler
    
    compiler = AgentGraphCompiler(mock_postgres_client, mock_checkpoint_manager)
    
    # Should not raise
    compiler._validate_graph(sample_graph_data)
    
    # Test missing nodes
    empty_graph = sample_graph_data.copy()
    empty_graph['nodes'] = []
    
    with pytest.raises(ValueError, match="has no nodes"):
        compiler._validate_graph(empty_graph)


@pytest.mark.asyncio
async def test_edge_validation(sample_graph_data, mock_postgres_client, mock_checkpoint_manager):
    """Test edge validation"""
    from langgraph_workflows.graph_compiler import AgentGraphCompiler
    
    compiler = AgentGraphCompiler(mock_postgres_client, mock_checkpoint_manager)
    
    # Add invalid edge
    invalid_graph = sample_graph_data.copy()
    invalid_graph['edges'].append({
        'source_node_key': 'nonexistent',
        'target_node_key': 'execute_agent',
        'edge_type': 'direct'
    })
    
    with pytest.raises(ValueError, match="unknown source node"):
        compiler._validate_graph(invalid_graph)
