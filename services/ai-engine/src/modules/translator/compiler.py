"""
VITAL Path - Workflow Compiler

Compiles parsed and validated workflows into executable LangGraph StateGraphs.

This is the heart of the visual-to-code bridge.
"""

from typing import Dict, Any, Optional, Callable, TypedDict, Annotated
from dataclasses import dataclass
import logging
import operator

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from .parser import ParsedWorkflow, ParsedNode, ParsedEdge, parse_react_flow_json
from .validator import validate_workflow_graph, ValidationResult
from .registry import NodeRegistry

logger = logging.getLogger(__name__)


class WorkflowState(TypedDict, total=False):
    """
    Base state schema for compiled workflows.
    
    All workflows share this base state, which is extended
    by node-specific state during execution.
    """
    # Workflow metadata
    workflow_id: str
    tenant_id: str
    user_id: str
    
    # Execution tracking
    started_at: str
    completed_at: Optional[str]
    current_node_id: str
    execution_path: Annotated[list[str], operator.add]
    
    # Input/Output
    input: Dict[str, Any]
    output: Optional[Dict[str, Any]]
    
    # Messages and context
    messages: Annotated[list[dict], operator.add]
    context: Dict[str, Any]
    
    # Error handling
    error: Optional[str]
    
    # Token tracking
    total_tokens: int


@dataclass
class CompilationResult:
    """Result of workflow compilation."""
    success: bool
    graph: Optional[StateGraph]
    compiled: Optional[Any]  # CompiledGraph from LangGraph
    validation: ValidationResult
    error: Optional[str] = None


class WorkflowCompiler:
    """
    Compiles React Flow workflows into LangGraph StateGraphs.
    
    Usage:
        compiler = WorkflowCompiler()
        result = compiler.compile(react_flow_json)
        
        if result.success:
            # Execute the compiled workflow
            final_state = result.compiled.invoke(initial_state)
    """
    
    def __init__(
        self,
        registry: Optional[NodeRegistry] = None,
        checkpointer: Optional[Any] = None,
    ):
        """
        Initialize the compiler.
        
        Args:
            registry: Node handler registry (uses default if not provided)
            checkpointer: LangGraph checkpointer for state persistence
        """
        self.registry = registry or NodeRegistry
        self.checkpointer = checkpointer or MemorySaver()
    
    def compile(
        self,
        json_data: Dict[str, Any],
        validate: bool = True,
    ) -> CompilationResult:
        """
        Compile a React Flow JSON workflow into an executable LangGraph.
        
        Args:
            json_data: The raw React Flow JSON from frontend, or a ParsedWorkflow object
            validate: Whether to validate before compiling
        
        Returns:
            CompilationResult with the compiled graph or errors
        """
        try:
            # Step 1: Parse JSON (if not already parsed)
            if isinstance(json_data, ParsedWorkflow):
                # Already parsed, use directly
                parsed = json_data
                logger.info(f"Compiling workflow: {parsed.name}")
            else:
                logger.info(f"Compiling workflow: {json_data.get('name', 'unnamed')}")
                parsed = parse_react_flow_json(json_data)
            
            # Step 2: Validate (optional but recommended)
            if validate:
                validation = validate_workflow_graph(parsed)
                if not validation.is_valid:
                    logger.warning(f"Validation failed with {len(validation.errors)} errors")
                    return CompilationResult(
                        success=False,
                        graph=None,
                        compiled=None,
                        validation=validation,
                        error="Workflow validation failed",
                    )
            else:
                validation = ValidationResult(is_valid=True)
            
            # Step 3: Build StateGraph
            graph = self._build_graph(parsed)
            
            # Step 4: Compile with checkpointer
            compiled = graph.compile(checkpointer=self.checkpointer)
            
            logger.info(f"Successfully compiled workflow '{parsed.name}'")
            return CompilationResult(
                success=True,
                graph=graph,
                compiled=compiled,
                validation=validation,
            )
            
        except Exception as e:
            logger.exception(f"Compilation failed: {str(e)}")
            return CompilationResult(
                success=False,
                graph=None,
                compiled=None,
                validation=ValidationResult(is_valid=False),
                error=str(e),
            )
    
    def _build_graph(self, workflow: ParsedWorkflow) -> StateGraph:
        """
        Build a LangGraph StateGraph from a parsed workflow.
        
        Args:
            workflow: The parsed and validated workflow
        
        Returns:
            StateGraph ready for compilation
        """
        # Create the graph with our state schema
        graph = StateGraph(WorkflowState)
        
        # Add all nodes
        for node in workflow.nodes:
            self._add_node(graph, node, workflow)
        
        # Add all edges
        for edge in workflow.edges:
            self._add_edge(graph, edge, workflow)
        
        # Set entry point
        graph.set_entry_point(workflow.entry_node_id)
        
        return graph
    
    def _add_node(
        self,
        graph: StateGraph,
        node: ParsedNode,
        workflow: ParsedWorkflow,
    ):
        """Add a single node to the graph."""
        # Get the handler for this node type
        handler = self.registry.get_handler(node.type)
        
        # Create a wrapped handler that passes node config
        async def node_handler(state: WorkflowState) -> WorkflowState:
            # Track execution path
            state["execution_path"] = [node.id]
            state["current_node_id"] = node.id
            
            # Call the actual handler with node config
            try:
                result = await handler(state, node.data)
                return result
            except Exception as e:
                logger.exception(f"Node {node.id} failed: {str(e)}")
                return {
                    **state,
                    "error": str(e),
                }
        
        # Add to graph
        graph.add_node(node.id, node_handler)
        logger.debug(f"Added node: {node.id} ({node.type})")
    
    def _add_edge(
        self,
        graph: StateGraph,
        edge: ParsedEdge,
        workflow: ParsedWorkflow,
    ):
        """Add a single edge to the graph."""
        source_node = workflow.get_node(edge.source)
        
        # Handle conditional edges (from router nodes)
        if source_node and source_node.type == "router":
            self._add_conditional_edges(graph, source_node, workflow)
        elif source_node and source_node.type == "condition":
            self._add_condition_edges(graph, source_node, workflow)
        else:
            # Simple edge
            if edge.target in workflow.exit_node_ids and workflow.get_node(edge.target).type == "end":
                # Edge to end node - route to END
                graph.add_edge(edge.source, edge.target)
            else:
                graph.add_edge(edge.source, edge.target)
        
        logger.debug(f"Added edge: {edge.source} -> {edge.target}")
    
    def _add_conditional_edges(
        self,
        graph: StateGraph,
        router_node: ParsedNode,
        workflow: ParsedWorkflow,
    ):
        """Add conditional edges from a router node."""
        conditions = router_node.data.get("conditions", [])
        default_target = router_node.data.get("defaultTargetNodeId")
        
        # Build the routing function
        def route_fn(state: WorkflowState) -> str:
            for condition in conditions:
                condition_id = condition.get("expression", "always_false")
                
                # Try to get a registered condition evaluator
                try:
                    evaluator = self.registry.get_condition(condition_id)
                    if evaluator(state):
                        return condition["targetNodeId"]
                except ValueError:
                    # Try to evaluate as a simple expression
                    # TODO: Implement safe expression evaluation
                    pass
            
            # Fall back to default
            return default_target
        
        # Build the mapping of all possible targets
        targets = {c["targetNodeId"] for c in conditions}
        targets.add(default_target)
        
        # Map END node if it's a target
        path_map = {}
        for target in targets:
            target_node = workflow.get_node(target)
            if target_node and target_node.type == "end":
                path_map[target] = END
            else:
                path_map[target] = target
        
        graph.add_conditional_edges(
            router_node.id,
            route_fn,
            path_map,
        )
    
    def _add_condition_edges(
        self,
        graph: StateGraph,
        condition_node: ParsedNode,
        workflow: ParsedWorkflow,
    ):
        """Add edges from a condition (if/else) node."""
        true_target = condition_node.data.get("trueTargetNodeId")
        false_target = condition_node.data.get("falseTargetNodeId")
        expression = condition_node.data.get("expression", "false")
        
        def condition_fn(state: WorkflowState) -> str:
            # TODO: Implement safe expression evaluation
            # For now, check for a "condition_result" in state
            result = state.get("condition_result", False)
            return true_target if result else false_target
        
        path_map = {}
        for target in [true_target, false_target]:
            if target:
                target_node = workflow.get_node(target)
                if target_node and target_node.type == "end":
                    path_map[target] = END
                else:
                    path_map[target] = target
        
        graph.add_conditional_edges(
            condition_node.id,
            condition_fn,
            path_map,
        )


# ============================================================================
# Convenience Functions
# ============================================================================

def compile_workflow(
    json_data: Dict[str, Any],
    validate: bool = True,
) -> CompilationResult:
    """
    Convenience function to compile a workflow.
    
    Args:
        json_data: React Flow JSON
        validate: Whether to validate first
    
    Returns:
        CompilationResult
    """
    compiler = WorkflowCompiler()
    return compiler.compile(json_data, validate=validate)










