"""
Agent Graph Compiler
Compiles database-stored agent graphs into executable LangGraph workflows
"""

from typing import Dict, List, Any, Optional, Callable
from uuid import UUID
import structlog
from langgraph.graph import StateGraph, END
from dataclasses import dataclass

from .state_schemas import UnifiedWorkflowState
from .node_compilers.agent_node_compiler import compile_agent_node
from .node_compilers.skill_node_compiler import compile_skill_node
from .node_compilers.panel_node_compiler import compile_panel_node
from .node_compilers.router_node_compiler import compile_router_node
from .node_compilers.tool_node_compiler import compile_tool_node
from .node_compilers.human_node_compiler import compile_human_node

logger = structlog.get_logger()


@dataclass
class CompiledGraph:
    """Result of graph compilation"""
    graph_id: UUID
    graph_name: str
    compiled_graph: Any  # Compiled LangGraph
    metadata: Dict[str, Any]
    node_count: int
    edge_count: int


class AgentGraphCompiler:
    """
    Compiles database-stored agent graphs into executable LangGraph workflows
    
    Features:
    - Loads graphs from Postgres (agent_graphs, agent_graph_nodes, agent_graph_edges)
    - Validates graph structure
    - Compiles each node type (agent, skill, panel, router, tool, human)
    - Builds LangGraph StateGraph with proper routing
    - Attaches Postgres checkpointer for state persistence
    
    Usage:
        compiler = AgentGraphCompiler(postgres_client, checkpoint_manager)
        compiled = await compiler.compile_graph(graph_id)
        result = await compiled.compiled_graph.ainvoke(initial_state)
    """
    
    def __init__(self, postgres_client, checkpoint_manager=None):
        """
        Initialize compiler
        
        Args:
            postgres_client: PostgresClient instance for database access
            checkpoint_manager: CheckpointManager for state persistence
        """
        self.postgres = postgres_client
        self.checkpoint_manager = checkpoint_manager
        
        # Node compiler registry
        self.node_compilers = {
            'agent': compile_agent_node,
            'skill': compile_skill_node,
            'panel': compile_panel_node,
            'router': compile_router_node,
            'tool': compile_tool_node,
            'human': compile_human_node
        }
        
        logger.info("✅ AgentGraphCompiler initialized")
    
    async def compile_graph(self, graph_id: UUID, tenant_id: Optional[str] = None) -> CompiledGraph:
        """
        Main compilation method
        
        Steps:
        1. Load graph metadata from agent_graphs
        2. Load all nodes from agent_graph_nodes
        3. Load all edges from agent_graph_edges
        4. Validate graph structure
        5. Compile each node
        6. Build LangGraph StateGraph
        7. Add edges (direct and conditional)
        8. Set entry point
        9. Attach checkpointer
        10. Compile and return
        
        Args:
            graph_id: UUID of graph to compile
            tenant_id: Optional tenant ID for checkpointer isolation
            
        Returns:
            CompiledGraph with executable LangGraph workflow
        """
        start_time = __import__('time').time()
        
        try:
            logger.info("graph_compilation_started", graph_id=str(graph_id))
            
            # Step 1: Load graph from database
            graph_data = await self._load_graph_from_db(graph_id)
            
            # Step 2: Validate graph structure
            self._validate_graph(graph_data)
            
            # Step 3: Build LangGraph
            langgraph = StateGraph(UnifiedWorkflowState)
            
            # Step 4: Compile and add nodes
            node_map = {}  # node_key -> compiled function
            
            for node in graph_data['nodes']:
                node_key = node['node_key']
                node_type = node['node_type']
                
                # Skip start/end nodes (handled by LangGraph)
                if node_type in ['start', 'end']:
                    continue
                
                # Get compiler for this node type
                compiler_func = self.node_compilers.get(node_type)
                if not compiler_func:
                    logger.warning("unknown_node_type", node_type=node_type, node_key=node_key)
                    continue
                
                # Compile node
                compiled_node = await compiler_func(node, self.postgres)
                node_map[node_key] = compiled_node
                
                # Add to LangGraph
                langgraph.add_node(node_key, compiled_node)
                
                logger.info("node_compiled", node_key=node_key, node_type=node_type)
            
            # Step 5: Add edges
            self._add_edges(langgraph, graph_data['edges'], node_map)
            
            # Step 6: Set entry point
            entry_point_key = graph_data.get('entry_point_node_key')
            if entry_point_key and entry_point_key in node_map:
                langgraph.set_entry_point(entry_point_key)
            else:
                # Default to first node
                first_node = list(node_map.keys())[0] if node_map else None
                if first_node:
                    langgraph.set_entry_point(first_node)
                    logger.warning("using_default_entry_point", entry_point=first_node)
            
            # Step 7: Compile with checkpointer
            checkpointer = None
            if self.checkpoint_manager and tenant_id:
                checkpointer = await self.checkpoint_manager.get_checkpointer(tenant_id)
            
            compiled_langgraph = langgraph.compile(checkpointer=checkpointer)
            
            # Step 8: Build result
            compilation_time = (__import__('time').time() - start_time) * 1000
            
            result = CompiledGraph(
                graph_id=graph_id,
                graph_name=graph_data['name'],
                compiled_graph=compiled_langgraph,
                metadata={
                    'version': graph_data.get('version', '1.0.0'),
                    'description': graph_data.get('description', ''),
                    'compilation_time_ms': compilation_time,
                    'checkpointer_enabled': checkpointer is not None
                },
                node_count=len(node_map),
                edge_count=len(graph_data['edges'])
            )
            
            logger.info(
                "graph_compilation_complete",
                graph_id=str(graph_id),
                graph_name=graph_data['name'],
                nodes=len(node_map),
                edges=len(graph_data['edges']),
                compilation_time_ms=compilation_time
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "graph_compilation_failed",
                graph_id=str(graph_id),
                error=str(e)
            )
            raise
    
    async def _load_graph_from_db(self, graph_id: UUID) -> Dict[str, Any]:
        """Load graph data from database"""
        
        # Load graph metadata
        graph_query = """
            SELECT id, name, description, version, entry_point_node_id, is_active
            FROM agent_graphs
            WHERE id = $1 AND is_active = true
        """
        graph_row = await self.postgres.fetchrow(graph_query, graph_id)
        
        if not graph_row:
            raise ValueError(f"Graph {graph_id} not found or inactive")
        
        # Load nodes
        nodes_query = """
            SELECT id, node_key, node_type, label, description,
                   agent_id, skill_id, panel_id, tool_id,
                   config, timeout_seconds, retry_attempts
            FROM agent_graph_nodes
            WHERE graph_id = $1
            ORDER BY created_at
        """
        nodes_rows = await self.postgres.fetch(nodes_query, graph_id)
        
        # Load edges
        edges_query = """
            SELECT e.id, e.source_node_id, e.target_node_id,
                   e.edge_type, e.condition_key, e.condition_value,
                   e.condition_function, e.label, e.priority,
                   source.node_key as source_node_key,
                   target.node_key as target_node_key
            FROM agent_graph_edges e
            JOIN agent_graph_nodes source ON e.source_node_id = source.id
            JOIN agent_graph_nodes target ON e.target_node_id = target.id
            WHERE e.graph_id = $1
            ORDER BY e.priority DESC, e.created_at
        """
        edges_rows = await self.postgres.fetch(edges_query, graph_id)
        
        # Find entry point node key
        entry_point_node_key = None
        if graph_row['entry_point_node_id']:
            for node in nodes_rows:
                if node['id'] == graph_row['entry_point_node_id']:
                    entry_point_node_key = node['node_key']
                    break
        
        return {
            'id': graph_row['id'],
            'name': graph_row['name'],
            'description': graph_row['description'],
            'version': graph_row['version'],
            'entry_point_node_key': entry_point_node_key,
            'nodes': [dict(row) for row in nodes_rows],
            'edges': [dict(row) for row in edges_rows]
        }
    
    def _validate_graph(self, graph_data: Dict[str, Any]):
        """Validate graph structure"""
        
        # Check nodes exist
        if not graph_data['nodes']:
            raise ValueError(f"Graph {graph_data['name']} has no nodes")
        
        # Check entry point exists
        if not graph_data.get('entry_point_node_key'):
            logger.warning("no_entry_point_defined", graph=graph_data['name'])
        
        # Build node key set
        node_keys = {node['node_key'] for node in graph_data['nodes']}
        
        # Validate edges reference valid nodes
        for edge in graph_data['edges']:
            source = edge['source_node_key']
            target = edge['target_node_key']
            
            if source not in node_keys:
                raise ValueError(f"Edge references unknown source node: {source}")
            if target not in node_keys:
                raise ValueError(f"Edge references unknown target node: {target}")
        
        logger.info("graph_validation_passed", graph=graph_data['name'])
    
    def _add_edges(self, langgraph: StateGraph, edges: List[Dict], node_map: Dict):
        """Add edges to LangGraph"""
        
        for edge in edges:
            source = edge['source_node_key']
            target = edge['target_node_key']
            edge_type = edge['edge_type']
            
            # Skip if nodes don't exist (start/end nodes)
            if source not in node_map or target not in node_map:
                continue
            
            if edge_type == 'direct':
                # Direct edge (always follow)
                if target == 'END':
                    langgraph.add_edge(source, END)
                else:
                    langgraph.add_edge(source, target)
                
                logger.info("direct_edge_added", source=source, target=target)
                
            elif edge_type == 'conditional':
                # Conditional edge (route based on state)
                condition_key = edge['condition_key']
                condition_value = edge['condition_value']
                condition_function = edge.get('condition_function')
                
                # Build routing function
                routing_func = self._build_routing_function(
                    condition_key,
                    {condition_value: target}
                )
                
                langgraph.add_conditional_edges(
                    source,
                    routing_func,
                    {condition_value: target}
                )
                
                logger.info(
                    "conditional_edge_added",
                    source=source,
                    target=target,
                    condition_key=condition_key,
                    condition_value=condition_value
                )
    
    def _build_routing_function(self, condition_key: str, route_map: Dict[str, str]) -> Callable:
        """Build routing function for conditional edges"""
        
        def routing_func(state: UnifiedWorkflowState) -> str:
            """Route based on state value"""
            value = state.get(condition_key, 'default')
            return route_map.get(str(value), list(route_map.values())[0])
        
        return routing_func


# Singleton instance
_compiler: Optional[AgentGraphCompiler] = None


async def get_graph_compiler(postgres_client=None, checkpoint_manager=None) -> AgentGraphCompiler:
    """Get or create graph compiler singleton"""
    global _compiler
    
    if _compiler is None:
        if postgres_client is None:
            from graphrag.clients.postgres_client import get_postgres_client
            postgres_client = await get_postgres_client()
        
        if checkpoint_manager is None:
            from langgraph_workflows.checkpoint_manager import get_checkpoint_manager
            checkpoint_manager = get_checkpoint_manager()
        
        _compiler = AgentGraphCompiler(postgres_client, checkpoint_manager)
    
    return _compiler
