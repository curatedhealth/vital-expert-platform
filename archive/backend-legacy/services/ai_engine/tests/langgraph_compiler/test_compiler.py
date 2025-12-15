"""
Unit Tests for LangGraph Compiler Core

Tests the core compiler functionality including:
- Graph loading from database
- Node compilation
- Edge compilation
- StateGraph creation
- Checkpointer integration
"""

import pytest
import pytest_asyncio
from uuid import UUID
from unittest.mock import AsyncMock, patch, MagicMock

from backend.services.ai_engine.langgraph_compiler.compiler import (
    LangGraphCompiler,
    CompiledGraph,
    AgentState
)


class TestLangGraphCompilerInit:
    """Test compiler initialization"""
    
    @pytest.mark.asyncio
    async def test_initialization_success(self):
        """Test compiler initializes successfully"""
        compiler = LangGraphCompiler()
        assert compiler._initialized == False
        
        # Mock dependencies
        with patch('backend.services.ai_engine.langgraph_compiler.compiler.get_postgres_client') as mock_pg, \
             patch('backend.services.ai_engine.langgraph_compiler.compiler.get_postgres_checkpointer') as mock_cp, \
             patch('backend.services.ai_engine.langgraph_compiler.compiler.get_agent_node_compiler') as mock_agent, \
             patch('backend.services.ai_engine.langgraph_compiler.compiler.get_skill_node_compiler') as mock_skill, \
             patch('backend.services.ai_engine.langgraph_compiler.compiler.get_panel_node_compiler') as mock_panel, \
             patch('backend.services.ai_engine.langgraph_compiler.compiler.get_router_node_compiler') as mock_router, \
             patch('backend.services.ai_engine.langgraph_compiler.compiler.get_tool_node_compiler') as mock_tool, \
             patch('backend.services.ai_engine.langgraph_compiler.compiler.get_human_node_compiler') as mock_human:
            
            mock_pg.return_value = AsyncMock()
            mock_cp.return_value = AsyncMock()
            mock_agent.return_value = AsyncMock()
            mock_skill.return_value = AsyncMock()
            mock_panel.return_value = AsyncMock()
            mock_router.return_value = AsyncMock()
            mock_tool.return_value = AsyncMock()
            mock_human.return_value = AsyncMock()
            
            await compiler.initialize()
            
            assert compiler._initialized == True
            assert compiler.pg_client is not None
            assert compiler.checkpointer is not None
            assert compiler.agent_compiler is not None


class TestGraphLoading:
    """Test graph definition loading"""
    
    @pytest.mark.asyncio
    async def test_load_graph_definition(
        self,
        mock_pg_client,
        sample_graph_definition
    ):
        """Test loading graph definition from database"""
        compiler = LangGraphCompiler()
        compiler.pg_client = mock_pg_client
        compiler._initialized = True
        
        # Setup mock response
        conn = await mock_pg_client.acquire().__aenter__()
        conn.fetchrow.return_value = sample_graph_definition
        
        # Load graph
        result = await compiler._load_graph_definition(sample_graph_definition['id'])
        
        assert result is not None
        assert result['id'] == sample_graph_definition['id']
        assert result['name'] == sample_graph_definition['name']
        
    @pytest.mark.asyncio
    async def test_load_graph_definition_not_found(self, mock_pg_client):
        """Test loading non-existent graph returns None"""
        compiler = LangGraphCompiler()
        compiler.pg_client = mock_pg_client
        compiler._initialized = True
        
        # Setup mock response
        conn = await mock_pg_client.acquire().__aenter__()
        conn.fetchrow.return_value = None
        
        # Load graph
        result = await compiler._load_graph_definition(UUID('00000000-0000-0000-0000-000000000000'))
        
        assert result is None
        
    @pytest.mark.asyncio
    async def test_load_graph_nodes(
        self,
        mock_pg_client,
        sample_graph_nodes
    ):
        """Test loading graph nodes"""
        compiler = LangGraphCompiler()
        compiler.pg_client = mock_pg_client
        compiler._initialized = True
        
        # Setup mock response
        conn = await mock_pg_client.acquire().__aenter__()
        conn.fetch.return_value = [MagicMock(**node) for node in sample_graph_nodes]
        
        # Load nodes
        result = await compiler._load_graph_nodes(sample_graph_nodes[0]['graph_id'])
        
        assert len(result) == len(sample_graph_nodes)
        assert result[0]['name'] == sample_graph_nodes[0]['name']
        
    @pytest.mark.asyncio
    async def test_load_graph_edges(
        self,
        mock_pg_client,
        sample_graph_edges
    ):
        """Test loading graph edges"""
        compiler = LangGraphCompiler()
        compiler.pg_client = mock_pg_client
        compiler._initialized = True
        
        # Setup mock response
        conn = await mock_pg_client.acquire().__aenter__()
        conn.fetch.return_value = [MagicMock(**edge) for edge in sample_graph_edges]
        
        # Load edges
        result = await compiler._load_graph_edges(sample_graph_edges[0]['graph_id'])
        
        assert len(result) == len(sample_graph_edges)
        assert result[0]['edge_type'] == sample_graph_edges[0]['edge_type']


class TestNodeCompilation:
    """Test node compilation"""
    
    @pytest.mark.asyncio
    async def test_compile_agent_node(self):
        """Test compiling agent node delegates to agent compiler"""
        compiler = LangGraphCompiler()
        compiler._initialized = True
        
        # Mock agent compiler
        mock_agent_compiler = AsyncMock()
        mock_agent_compiler.compile = AsyncMock(return_value=AsyncMock())
        compiler.agent_compiler = mock_agent_compiler
        
        node = {
            'name': 'test_agent',
            'node_type': 'agent',
            'agent_id': UUID('22222222-2222-2222-2222-222222222222')
        }
        
        # Compile node
        result = await compiler._compile_node(node)
        
        assert result is not None
        mock_agent_compiler.compile.assert_called_once_with(node)
        
    @pytest.mark.asyncio
    async def test_compile_skill_node(self):
        """Test compiling skill node delegates to skill compiler"""
        compiler = LangGraphCompiler()
        compiler._initialized = True
        
        # Mock skill compiler
        mock_skill_compiler = AsyncMock()
        mock_skill_compiler.compile = AsyncMock(return_value=AsyncMock())
        compiler.skill_compiler = mock_skill_compiler
        
        node = {
            'name': 'test_skill',
            'node_type': 'skill',
            'skill_id': UUID('33333333-3333-3333-3333-333333333333')
        }
        
        # Compile node
        result = await compiler._compile_node(node)
        
        assert result is not None
        mock_skill_compiler.compile.assert_called_once_with(node)
        
    @pytest.mark.asyncio
    async def test_compile_unknown_node_type(self):
        """Test compiling unknown node type raises error"""
        compiler = LangGraphCompiler()
        compiler._initialized = True
        
        node = {
            'name': 'test_unknown',
            'node_type': 'unknown_type'
        }
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="Unknown node type"):
            await compiler._compile_node(node)


class TestGraphCompilation:
    """Test full graph compilation"""
    
    @pytest.mark.asyncio
    async def test_compile_graph_simple(
        self,
        mock_pg_client,
        sample_graph_definition,
        sample_graph_nodes,
        sample_graph_edges
    ):
        """Test compiling a simple 2-node graph"""
        compiler = LangGraphCompiler()
        compiler.pg_client = mock_pg_client
        compiler._initialized = True
        
        # Mock all node compilers
        mock_agent_compiler = AsyncMock()
        mock_agent_compiler.compile = AsyncMock(return_value=AsyncMock())
        compiler.agent_compiler = mock_agent_compiler
        
        # Mock other compilers similarly...
        for attr in ['skill_compiler', 'panel_compiler', 'router_compiler', 'tool_compiler', 'human_compiler']:
            setattr(compiler, attr, AsyncMock(compile=AsyncMock(return_value=AsyncMock())))
        
        # Mock checkpointer
        compiler.checkpointer = AsyncMock()
        
        # Setup database mocks
        conn = await mock_pg_client.acquire().__aenter__()
        conn.fetchrow.return_value = sample_graph_definition
        conn.fetch.side_effect = [
            [MagicMock(**node) for node in sample_graph_nodes],
            [MagicMock(**edge) for edge in sample_graph_edges]
        ]
        
        # Compile graph
        with patch('backend.services.ai_engine.langgraph_compiler.compiler.StateGraph') as mock_state_graph:
            mock_graph_instance = MagicMock()
            mock_graph_instance.compile.return_value = MagicMock()
            mock_state_graph.return_value = mock_graph_instance
            
            result = await compiler.compile_graph(sample_graph_definition['id'])
            
            assert isinstance(result, CompiledGraph)
            assert result.graph_id == sample_graph_definition['id']
            assert result.metadata['name'] == sample_graph_definition['name']
            
    @pytest.mark.asyncio
    async def test_compile_graph_not_found(self, mock_pg_client):
        """Test compiling non-existent graph raises error"""
        compiler = LangGraphCompiler()
        compiler.pg_client = mock_pg_client
        compiler._initialized = True
        
        # Setup mock response
        conn = await mock_pg_client.acquire().__aenter__()
        conn.fetchrow.return_value = None
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="not found"):
            await compiler.compile_graph(UUID('00000000-0000-0000-0000-000000000000'))


class TestCompiledGraph:
    """Test CompiledGraph wrapper"""
    
    @pytest.mark.asyncio
    async def test_invoke(self):
        """Test invoking compiled graph"""
        mock_langgraph = AsyncMock()
        mock_langgraph.ainvoke = AsyncMock(return_value={'response': 'Test output'})
        
        compiled = CompiledGraph(
            graph_id=UUID('11111111-1111-1111-1111-111111111111'),
            langgraph=mock_langgraph,
            metadata={'name': 'test'}
        )
        
        result = await compiled.invoke({'query': 'Test query'})
        
        assert result['response'] == 'Test output'
        mock_langgraph.ainvoke.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_stream(self):
        """Test streaming compiled graph execution"""
        async def mock_stream(*args, **kwargs):
            yield {'step': 1}
            yield {'step': 2}
            
        mock_langgraph = AsyncMock()
        mock_langgraph.astream = mock_stream
        
        compiled = CompiledGraph(
            graph_id=UUID('11111111-1111-1111-1111-111111111111'),
            langgraph=mock_langgraph,
            metadata={'name': 'test'}
        )
        
        events = []
        async for event in compiled.stream({'query': 'Test query'}):
            events.append(event)
            
        assert len(events) == 2
        assert events[0]['step'] == 1
        assert events[1]['step'] == 2


class TestEdgeCompilation:
    """Test edge compilation"""
    
    def test_build_condition_function_simple(self):
        """Test building simple condition function"""
        compiler = LangGraphCompiler()
        
        edge = {
            'condition': {}
        }
        
        condition_fn = compiler._build_condition_function(edge)
        
        # Should return 'default' for empty condition
        assert condition_fn({'next_node': 'test'}) == 'test'
        assert condition_fn({}) == 'default'
        
    def test_build_edge_mapping(self):
        """Test building edge mapping for conditional edges"""
        compiler = LangGraphCompiler()
        
        edge = {
            'target_node_id': UUID('44444444-4444-4444-4444-444444444444')
        }
        
        node_map = {
            UUID('44444444-4444-4444-4444-444444444444'): 'target_node'
        }
        
        mapping = compiler._build_edge_mapping(edge, node_map)
        
        assert 'default' in mapping
        assert 'target_node' in mapping
        assert mapping['default'] == 'target_node'


# ============================================================================
# INTEGRATION TEST: MINIMAL GRAPH EXECUTION
# ============================================================================

class TestMinimalIntegration:
    """Minimal integration test without full dependencies"""
    
    @pytest.mark.asyncio
    async def test_compile_and_get_metadata(
        self,
        mock_pg_client,
        sample_graph_definition,
        sample_graph_nodes
    ):
        """Test compiling graph and accessing metadata"""
        # This test verifies the basic flow without full execution
        compiler = LangGraphCompiler()
        compiler.pg_client = mock_pg_client
        compiler._initialized = True
        
        # Setup minimal mocks
        compiler.checkpointer = AsyncMock()
        for attr in ['agent_compiler', 'skill_compiler', 'panel_compiler', 
                     'router_compiler', 'tool_compiler', 'human_compiler']:
            mock_compiler = AsyncMock()
            mock_compiler.compile = AsyncMock(return_value=AsyncMock())
            setattr(compiler, attr, mock_compiler)
        
        conn = await mock_pg_client.acquire().__aenter__()
        conn.fetchrow.return_value = sample_graph_definition
        conn.fetch.side_effect = [
            [MagicMock(**node) for node in sample_graph_nodes],
            []  # No edges
        ]
        
        with patch('backend.services.ai_engine.langgraph_compiler.compiler.StateGraph') as mock_sg:
            mock_graph = MagicMock()
            mock_graph.compile.return_value = MagicMock()
            mock_sg.return_value = mock_graph
            
            result = await compiler.compile_graph(sample_graph_definition['id'])
            
            # Verify metadata
            assert result.metadata['name'] == 'test_graph'
            assert result.metadata['version'] == '1.0.0'
            assert result.graph_id == sample_graph_definition['id']

