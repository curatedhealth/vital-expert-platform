"""
LangGraph Compiler for AgentOS 3.0

Compiles Postgres agent graph definitions into executable LangGraph workflows.

Architecture:
1. Load graph definition from Postgres (agent_graphs, nodes, edges)
2. Build LangGraph StateGraph with typed state
3. Compile nodes based on type (agent, skill, panel, router, tool, human)
4. Add edges (direct or conditional)
5. Set entry/exit points
6. Compile with Postgres checkpointer for state persistence

Supports:
- Multi-agent graphs
- Conditional routing
- Panel discussions
- Tool execution
- Human-in-the-loop
- State persistence and time-travel debugging
"""

from typing import Dict, List, Optional, Any, Callable, TypedDict
from uuid import UUID
import json

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresCheckpointer

from ..graphrag.clients import get_postgres_client
from ..graphrag.utils.logger import get_logger
from .checkpointer import get_postgres_checkpointer
from .nodes import (
    get_agent_node_compiler,
    get_skill_node_compiler,
    get_panel_node_compiler,
    get_router_node_compiler,
    get_tool_node_compiler,
    get_human_node_compiler
)
from .nodes.hierarchical_agent_nodes import compile_hierarchical_agent_node

logger = get_logger(__name__)


class AgentState(TypedDict, total=False):
    """
    LangGraph state for agent execution.
    
    Core fields:
    - query: User query
    - context: RAG context with evidence
    - response: Agent response
    - messages: Conversation history
    
    Graph fields:
    - current_node: Current node ID
    - next_node: Next node to execute
    - iteration: Current iteration count
    
    Evidence fields:
    - evidence_chain: List of evidence nodes
    - citations: Citation IDs
    - confidence: Response confidence score
    
    Workflow fields:
    - plan: Execution plan (from planner)
    - thought_tree: Tree-of-Thoughts structure
    - critique: Critique from critic agent
    - panel_votes: Votes from panel discussion
    - tool_results: Results from tool execution
    
    Safety fields:
    - safety_checks: Safety validation results
    - requires_human_review: Human oversight flag
    - escalation_reason: Escalation trigger
    """
    # Core
    query: str
    context: str
    response: Optional[str]
    messages: List[Dict[str, Any]]
    
    # Graph control
    current_node: Optional[str]
    next_node: Optional[str]
    iteration: int
    
    # Evidence
    evidence_chain: List[Dict[str, Any]]
    citations: List[str]
    confidence: Optional[float]
    
    # Workflow
    plan: Optional[Dict[str, Any]]
    thought_tree: Optional[Dict[str, Any]]
    critique: Optional[Dict[str, Any]]
    panel_votes: Optional[List[Dict[str, Any]]]
    tool_results: Optional[Dict[str, Any]]
    
    # Safety
    safety_checks: Optional[Dict[str, Any]]
    requires_human_review: bool
    escalation_reason: Optional[str]


class CompiledGraph:
    """Container for compiled LangGraph and metadata"""
    
    def __init__(
        self,
        graph_id: UUID,
        langgraph: Any,  # Compiled LangGraph
        metadata: Dict[str, Any]
    ):
        self.graph_id = graph_id
        self.langgraph = langgraph
        self.metadata = metadata
        
    async def invoke(
        self,
        initial_state: Dict[str, Any],
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute the graph with initial state"""
        return await self.langgraph.ainvoke(initial_state, config)
        
    async def stream(
        self,
        initial_state: Dict[str, Any],
        config: Optional[Dict[str, Any]] = None
    ):
        """Stream graph execution"""
        async for event in self.langgraph.astream(initial_state, config):
            yield event


class LangGraphCompiler:
    """Compiles Postgres agent graphs into executable LangGraph workflows"""
    
    def __init__(self):
        self.pg_client = None
        self.checkpointer = None
        self.agent_compiler = None
        self.skill_compiler = None
        self.panel_compiler = None
        self.router_compiler = None
        self.tool_compiler = None
        self.human_compiler = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize PostgreSQL client and checkpointer"""
        if self._initialized:
            return
            
        logger.info("Initializing LangGraph compiler...")
        
        # Initialize Postgres client
        self.pg_client = await get_postgres_client()
        
        # Initialize checkpointer
        self.checkpointer = await get_postgres_checkpointer()
        
        # Initialize node compilers
        self.agent_compiler = await get_agent_node_compiler()
        self.skill_compiler = await get_skill_node_compiler()
        self.panel_compiler = await get_panel_node_compiler()
        self.router_compiler = await get_router_node_compiler()
        self.tool_compiler = await get_tool_node_compiler()
        self.human_compiler = await get_human_node_compiler()
        
        self._initialized = True
        logger.info("LangGraph compiler initialized")
        
    async def compile_graph(self, graph_id: UUID) -> CompiledGraph:
        """
        Compile agent graph from Postgres into executable LangGraph.
        
        Steps:
        1. Load graph definition (nodes, edges, config)
        2. Create StateGraph with AgentState
        3. Compile and add nodes
        4. Add edges (direct and conditional)
        5. Set entry point
        6. Compile with checkpointer
        
        Args:
            graph_id: UUID of agent_graphs record
            
        Returns:
            CompiledGraph with executable LangGraph
        """
        if not self._initialized:
            await self.initialize()
            
        logger.info(f"Compiling graph: {graph_id}")
        
        # 1. Load graph definition
        graph_def = await self._load_graph_definition(graph_id)
        
        if not graph_def:
            raise ValueError(f"Graph {graph_id} not found")
            
        nodes = await self._load_graph_nodes(graph_id)
        edges = await self._load_graph_edges(graph_id)
        
        logger.info(
            f"Loaded graph: {graph_def['name']} "
            f"({len(nodes)} nodes, {len(edges)} edges)"
        )
        
        # 2. Create StateGraph
        graph = StateGraph(AgentState)
        
        # 3. Compile and add nodes
        node_map = {}
        for node in nodes:
            node_fn = await self._compile_node(node)
            graph.add_node(node['name'], node_fn)
            node_map[node['id']] = node['name']
            
        logger.info(f"Added {len(nodes)} nodes to graph")
        
        # 4. Add edges
        for edge in edges:
            source_name = node_map.get(edge['source_node_id'])
            target_name = node_map.get(edge['target_node_id'])
            
            if not source_name or not target_name:
                logger.warning(f"Skipping edge with missing nodes: {edge}")
                continue
                
            if edge['edge_type'] == 'direct':
                graph.add_edge(source_name, target_name)
            elif edge['edge_type'] == 'conditional':
                # Conditional edges need a router function
                condition_fn = self._build_condition_function(edge)
                # LangGraph conditional edges map to multiple targets
                # We'll need to define the routing logic
                graph.add_conditional_edges(
                    source_name,
                    condition_fn,
                    self._build_edge_mapping(edge, node_map)
                )
            else:
                logger.warning(f"Unknown edge type: {edge['edge_type']}")
                
        logger.info(f"Added {len(edges)} edges to graph")
        
        # 5. Set entry point
        entry_node = graph_def.get('entry_node_name', nodes[0]['name'])
        graph.set_entry_point(entry_node)
        
        # 6. Compile with checkpointer
        compiled = graph.compile(
            checkpointer=self.checkpointer
        )
        
        logger.info(f"Graph compiled successfully: {graph_id}")
        
        return CompiledGraph(
            graph_id=graph_id,
            langgraph=compiled,
            metadata=graph_def
        )
        
    async def _load_graph_definition(self, graph_id: UUID) -> Optional[Dict[str, Any]]:
        """Load agent_graphs record"""
        query = """
            SELECT 
                id, name, description, version, owner_id,
                entry_node_name, config, is_active,
                created_at, updated_at
            FROM agent_graphs
            WHERE id = $1 AND deleted_at IS NULL
        """
        
        async with self.pg_client.acquire() as conn:
            row = await conn.fetchrow(query, graph_id)
            return dict(row) if row else None
            
    async def _load_graph_nodes(self, graph_id: UUID) -> List[Dict[str, Any]]:
        """Load agent_graph_nodes for a graph"""
        query = """
            SELECT 
                id, graph_id, name, node_type, agent_id, skill_id,
                role_id, config, position_x, position_y,
                created_at, updated_at
            FROM agent_graph_nodes
            WHERE graph_id = $1 AND deleted_at IS NULL
            ORDER BY position_y, position_x
        """
        
        async with self.pg_client.acquire() as conn:
            rows = await conn.fetch(query, graph_id)
            return [dict(row) for row in rows]
            
    async def _load_graph_edges(self, graph_id: UUID) -> List[Dict[str, Any]]:
        """Load agent_graph_edges for a graph"""
        query = """
            SELECT 
                id, graph_id, source_node_id, target_node_id,
                edge_type, condition, config,
                created_at, updated_at
            FROM agent_graph_edges
            WHERE graph_id = $1 AND deleted_at IS NULL
            ORDER BY created_at
        """
        
        async with self.pg_client.acquire() as conn:
            rows = await conn.fetch(query, graph_id)
            return [dict(row) for row in rows]
            
    async def _compile_node(self, node: Dict[str, Any]) -> Callable:
        """
        Compile individual node based on type using specialized compilers.
        
        For agent nodes: Check if deep agent features needed (hierarchical, subagents, etc.)
        
        Node types:
        - agent: Standard agent execution (delegated to agent_compiler)
        - skill: Execute a skill (delegated to skill_compiler)
        - panel: Multi-agent panel discussion (delegated to panel_compiler)
        - router: Route to appropriate path (delegated to router_compiler)
        - tool: Execute external tool (delegated to tool_compiler)
        - human: Human-in-the-loop interaction (delegated to human_compiler)
        """
        node_type = node['node_type']
        
        logger.info(f"Compiling node: {node['name']} (type={node_type})")
        
        if node_type == 'agent':
            # Check if agent should use deep agent features (hierarchical, subagents, etc.)
            # For now, try hierarchical first, fallback to standard
            try:
                # First check if agent has deep agent features enabled
                agent_config = await self.pg_client.fetch_one("""
                    SELECT deep_agents_enabled, subagent_spawning_enabled
                    FROM agents
                    WHERE id = $1
                """, node['agent_id'])
                
                if agent_config and (agent_config['deep_agents_enabled'] or agent_config['subagent_spawning_enabled']):
                    # Use hierarchical/deep agent compiler
                    logger.info(f"Using hierarchical agent compiler for {node['name']}")
                    return await compile_hierarchical_agent_node(node, self.pg_client, self.config)
                else:
                    # Use standard agent compiler
                    return await self.agent_compiler.compile(node)
            except Exception as e:
                logger.warning(f"Hierarchical compiler not available: {e}. Using standard compiler.")
                return await self.agent_compiler.compile(node)
        elif node_type == 'skill':
            return await self.skill_compiler.compile(node)
        elif node_type == 'panel':
            return await self.panel_compiler.compile(node)
        elif node_type == 'router':
            return await self.router_compiler.compile(node)
        elif node_type == 'tool':
            return await self.tool_compiler.compile(node)
        elif node_type == 'human':
            return await self.human_compiler.compile(node)
        else:
            raise ValueError(f"Unknown node type: {node_type}")
            
    def _compile_agent_node(self, node: Dict[str, Any]) -> Callable:
        """DEPRECATED: Use agent_compiler.compile() instead"""
        raise NotImplementedError("Use agent_compiler.compile()")
        
    def _compile_skill_node(self, node: Dict[str, Any]) -> Callable:
        """DEPRECATED: Use skill_compiler.compile() instead"""
        raise NotImplementedError("Use skill_compiler.compile()")
        
    def _compile_panel_node(self, node: Dict[str, Any]) -> Callable:
        """DEPRECATED: Use panel_compiler.compile() instead"""
        raise NotImplementedError("Use panel_compiler.compile()")
        
    def _compile_router_node(self, node: Dict[str, Any]) -> Callable:
        """DEPRECATED: Use router_compiler.compile() instead"""
        raise NotImplementedError("Use router_compiler.compile()")
        
    def _compile_tool_node(self, node: Dict[str, Any]) -> Callable:
        """DEPRECATED: Use tool_compiler.compile() instead"""
        raise NotImplementedError("Use tool_compiler.compile()")
        
    def _compile_human_node(self, node: Dict[str, Any]) -> Callable:
        """DEPRECATED: Use human_compiler.compile() instead"""
        raise NotImplementedError("Use human_compiler.compile()")
        
    def _build_condition_function(self, edge: Dict[str, Any]) -> Callable:
        """
        Build condition function for conditional edges.
        
        Evaluates edge['condition'] JSON logic against state.
        """
        condition_logic = edge.get('condition', {})
        
        def condition_fn(state: AgentState) -> str:
            """Evaluate condition and return target node name"""
            # Simple condition evaluation
            # TODO: Implement full JSON logic evaluation
            if not condition_logic:
                return "default"
                
            # For now, just check next_node in state
            return state.get('next_node', 'default')
            
        return condition_fn
        
    def _build_edge_mapping(
        self,
        edge: Dict[str, Any],
        node_map: Dict[UUID, str]
    ) -> Dict[str, str]:
        """
        Build edge mapping for conditional edges.
        
        Maps condition results to target node names.
        """
        target_name = node_map.get(edge['target_node_id'])
        
        # Simple mapping for now
        # TODO: Support multiple conditional targets
        return {
            "default": target_name,
            target_name: target_name
        }


# Singleton instance
_langgraph_compiler: Optional[LangGraphCompiler] = None


async def get_langgraph_compiler() -> LangGraphCompiler:
    """Get or create LangGraph compiler singleton"""
    global _langgraph_compiler
    if _langgraph_compiler is None:
        _langgraph_compiler = LangGraphCompiler()
        await _langgraph_compiler.initialize()
    return _langgraph_compiler

