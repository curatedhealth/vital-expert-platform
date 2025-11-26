"""
Agent Graph Compiler
Compiles agent graphs from PostgreSQL into executable LangGraph workflows

NOTE: Currently uses MemorySaver for checkpointing.
TODO: Upgrade to AsyncPostgresSaver for production persistence.
"""

from typing import Dict, Any, Optional, Callable
from uuid import UUID
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.base import BaseCheckpointSaver
import structlog

from graphrag.clients.postgres_client import get_postgres_client
from .state import AgentState, WorkflowState
from .nodes import (
    compile_agent_node,
    compile_skill_node,
    compile_panel_node,
    compile_router_node,
    compile_tool_node,
    compile_human_node
)

logger = structlog.get_logger()


class AgentGraphCompiler:
    """
    Compiles agent graphs from PostgreSQL into LangGraph workflows
    
    Process:
    1. Load graph metadata from agent_graphs table
    2. Load nodes from agent_graph_nodes table
    3. Load edges from agent_graph_edges table
    4. Compile each node based on type
    5. Build LangGraph StateGraph
    6. Add conditional/direct edges
    7. Attach Postgres checkpointer
    8. Return compiled graph
    """
    
    def __init__(self):
        self.node_compilers: Dict[str, Callable] = {
            'agent': compile_agent_node,
            'skill': compile_skill_node,
            'panel': compile_panel_node,
            'router': compile_router_node,
            'tool': compile_tool_node,
            'human': compile_human_node
        }
    
    async def compile_graph(
        self,
        graph_id: UUID,
        checkpointer: Optional[BaseCheckpointSaver] = None
    ) -> StateGraph:
        """
        Compile agent graph from database
        
        Args:
            graph_id: Agent graph UUID
            checkpointer: Optional Postgres checkpointer
            
        Returns:
            Compiled LangGraph StateGraph
        """
        try:
            pg = await get_postgres_client()
            
            # Step 1: Load graph metadata
            graph_meta = await self._load_graph_metadata(pg, graph_id)
            
            if not graph_meta:
                raise ValueError(f"Agent graph not found: {graph_id}")
            
            # Step 2: Load nodes
            nodes = await self._load_graph_nodes(pg, graph_id)
            
            if not nodes:
                raise ValueError(f"No nodes found for graph: {graph_id}")
            
            # Step 3: Load edges
            edges = await self._load_graph_edges(pg, graph_id)
            
            # Step 4: Build LangGraph
            state_type = WorkflowState if graph_meta['graph_type'] == 'panel' else AgentState
            graph = StateGraph(state_type)
            
            # Step 5: Compile and add nodes
            compiled_nodes = {}
            for node in nodes:
                node_func = await self._compile_node(node)
                compiled_nodes[node['node_name']] = node_func
                graph.add_node(node['node_name'], node_func)
                
                logger.debug(
                    "node_compiled",
                    graph_id=str(graph_id),
                    node_name=node['node_name'],
                    node_type=node['node_type']
                )
            
            # Step 6: Add edges
            entry_point = None
            
            for edge in edges:
                source = edge['source_node_name']
                target = edge['target_node_name']
                edge_type = edge['edge_type']
                condition = edge.get('condition')
                
                if edge_type == 'entry':
                    entry_point = target
                    graph.set_entry_point(target)
                    
                elif edge_type == 'direct':
                    graph.add_edge(source, target)
                    
                elif edge_type == 'conditional':
                    # Build condition function
                    condition_func = self._build_condition_func(condition, compiled_nodes)
                    graph.add_conditional_edges(
                        source,
                        condition_func,
                        edge.get('condition_map', {})
                    )
                    
                elif edge_type == 'end':
                    graph.add_edge(source, END)
            
            # Step 7: Set entry point if not set
            if not entry_point and nodes:
                graph.set_entry_point(nodes[0]['node_name'])
            
            # Step 8: Compile graph
            compiled_graph = graph.compile(checkpointer=checkpointer)
            
            logger.info(
                "graph_compiled",
                graph_id=str(graph_id),
                graph_name=graph_meta['graph_name'],
                node_count=len(nodes),
                edge_count=len(edges)
            )
            
            return compiled_graph
            
        except Exception as e:
            logger.error(
                "graph_compilation_failed",
                graph_id=str(graph_id),
                error=str(e)
            )
            raise
    
    async def _load_graph_metadata(self, pg, graph_id: UUID) -> Optional[Dict]:
        """Load graph metadata"""
        query = """
        SELECT
            id,
            graph_name,
            graph_type,
            description,
            is_active
        FROM agent_graphs
        WHERE id = $1 AND is_active = true
        """
        
        return await pg.fetchrow(query, graph_id)
    
    async def _load_graph_nodes(self, pg, graph_id: UUID) -> list:
        """Load graph nodes"""
        query = """
        SELECT
            id,
            graph_id,
            node_name,
            node_type,
            agent_id,
            skill_id,
            config,
            is_active
        FROM agent_graph_nodes
        WHERE graph_id = $1 AND is_active = true
        ORDER BY node_name
        """
        
        return await pg.fetch(query, graph_id)
    
    async def _load_graph_edges(self, pg, graph_id: UUID) -> list:
        """Load graph edges"""
        query = """
        SELECT
            id,
            graph_id,
            source_node_id,
            target_node_id,
            edge_type,
            condition,
            condition_map,
            is_active,
            source_node.node_name as source_node_name,
            target_node.node_name as target_node_name
        FROM agent_graph_edges age
        LEFT JOIN agent_graph_nodes source_node ON age.source_node_id = source_node.id
        LEFT JOIN agent_graph_nodes target_node ON age.target_node_id = target_node.id
        WHERE age.graph_id = $1 AND age.is_active = true
        ORDER BY source_node_name, target_node_name
        """
        
        return await pg.fetch(query, graph_id)
    
    async def _compile_node(self, node: Dict) -> Callable:
        """Compile individual node based on type"""
        node_type = node['node_type']
        
        if node_type not in self.node_compilers:
            raise ValueError(f"Unknown node type: {node_type}")
        
        compiler_func = self.node_compilers[node_type]
        return await compiler_func(node)
    
    def _build_condition_func(
        self,
        condition: Optional[str],
        compiled_nodes: Dict[str, Callable]
    ) -> Callable:
        """Build condition function for conditional edges"""
        def condition_router(state: AgentState) -> str:
            """Route based on state"""
            # Default: use next_node from state
            if state.get('next_node'):
                return state['next_node']
            
            # Evaluate custom condition if provided
            if condition:
                try:
                    # Simple condition evaluation
                    # In production, use safer evaluation (e.g., restricted AST)
                    result = eval(condition, {"state": state})
                    return str(result)
                except Exception as e:
                    logger.error("condition_eval_failed", condition=condition, error=str(e))
                    return "error"
            
            return "end"
        
        return condition_router


# Convenience function
async def compile_agent_graph(
    graph_id: UUID,
    checkpointer: Optional[BaseCheckpointSaver] = None
) -> StateGraph:
    """
    Compile agent graph from database
    
    Args:
        graph_id: Agent graph UUID
        checkpointer: Optional Postgres checkpointer
        
    Returns:
        Compiled LangGraph
    """
    compiler = AgentGraphCompiler()
    return await compiler.compile_graph(graph_id, checkpointer)

