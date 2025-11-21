"""
Workflow validation before execution
Checks for cycles, disconnected nodes, missing parameters, etc.
"""

from typing import List, Set, Dict, Tuple
from ..nodes.base import Workflow, NodeConfig, Connection, NodeType
from ..nodes.registry import get_node_definition


class ValidationError(Exception):
    """Workflow validation error"""
    def __init__(self, message: str, node_id: str = None):
        self.message = message
        self.node_id = node_id
        super().__init__(message)


class WorkflowValidator:
    """Validate workflows before execution"""
    
    def __init__(self, workflow: Workflow):
        self.workflow = workflow
        self.errors: List[ValidationError] = []
    
    def validate(self) -> Tuple[bool, List[ValidationError]]:
        """
        Validate workflow and return (is_valid, errors)
        
        Returns:
            Tuple of (is_valid: bool, errors: List[ValidationError])
        """
        self.errors = []
        
        # Check for at least one node
        if not self.workflow.nodes:
            self.errors.append(ValidationError("Workflow must have at least one node"))
            return False, self.errors
        
        # Check for input and output nodes
        self._check_io_nodes()
        
        # Check for cycles (except in loops)
        self._check_cycles()
        
        # Check for disconnected nodes
        self._check_disconnected_nodes()
        
        # Validate node parameters
        self._validate_node_parameters()
        
        # Validate connections
        self._validate_connections()
        
        return len(self.errors) == 0, self.errors
    
    def _check_io_nodes(self):
        """Check for input and output nodes"""
        has_input = any(node.type == NodeType.INPUT for node in self.workflow.nodes)
        has_output = any(node.type == NodeType.OUTPUT for node in self.workflow.nodes)
        
        if not has_input:
            self.errors.append(ValidationError(
                "Workflow must have at least one Input node"
            ))
        
        if not has_output:
            self.errors.append(ValidationError(
                "Workflow must have at least one Output node"
            ))
    
    def _check_cycles(self):
        """Check for cycles in the graph (except within loop nodes)"""
        # Build adjacency list
        adj_list: Dict[str, List[str]] = {node.id: [] for node in self.workflow.nodes}
        
        for edge in self.workflow.edges:
            # Skip edges that are part of loop internal structure
            source_node = self._get_node_by_id(edge.source)
            if source_node and source_node.type == NodeType.LOOP:
                continue
            
            adj_list[edge.source].append(edge.target)
        
        # DFS to detect cycles
        visited: Set[str] = set()
        rec_stack: Set[str] = set()
        
        def has_cycle_util(node_id: str) -> bool:
            visited.add(node_id)
            rec_stack.add(node_id)
            
            for neighbor in adj_list.get(node_id, []):
                if neighbor not in visited:
                    if has_cycle_util(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            
            rec_stack.remove(node_id)
            return False
        
        for node in self.workflow.nodes:
            if node.id not in visited:
                if has_cycle_util(node.id):
                    self.errors.append(ValidationError(
                        "Workflow contains a cycle",
                        node_id=node.id
                    ))
                    break
    
    def _check_disconnected_nodes(self):
        """Check for nodes that aren't connected to the workflow"""
        # Input and output nodes can be disconnected
        io_node_types = {NodeType.INPUT, NodeType.OUTPUT}
        
        # Build set of all connected nodes
        connected_nodes: Set[str] = set()
        
        for edge in self.workflow.edges:
            connected_nodes.add(edge.source)
            connected_nodes.add(edge.target)
        
        # Check each node
        for node in self.workflow.nodes:
            # Skip I/O nodes
            if node.type in io_node_types:
                continue
            
            # Check if node is connected
            if node.id not in connected_nodes:
                self.errors.append(ValidationError(
                    f"Node '{node.label}' is not connected to the workflow",
                    node_id=node.id
                ))
    
    def _validate_node_parameters(self):
        """Validate that all required node parameters are set"""
        for node in self.workflow.nodes:
            definition = get_node_definition(node.type)
            if not definition:
                self.errors.append(ValidationError(
                    f"Unknown node type: {node.type}",
                    node_id=node.id
                ))
                continue
            
            # Check required parameters
            for param_name, param_def in definition.get("parameters", {}).items():
                if param_def.get("required", False):
                    if param_name not in node.parameters:
                        self.errors.append(ValidationError(
                            f"Node '{node.label}' is missing required parameter '{param_name}'",
                            node_id=node.id
                        ))
    
    def _validate_connections(self):
        """Validate that connections are valid (source outputs exist, target inputs exist)"""
        for edge in self.workflow.edges:
            source_node = self._get_node_by_id(edge.source)
            target_node = self._get_node_by_id(edge.target)
            
            if not source_node:
                self.errors.append(ValidationError(
                    f"Connection references non-existent source node: {edge.source}"
                ))
                continue
            
            if not target_node:
                self.errors.append(ValidationError(
                    f"Connection references non-existent target node: {edge.target}"
                ))
                continue
            
            # Get node definitions
            source_def = get_node_definition(source_node.type)
            target_def = get_node_definition(target_node.type)
            
            if not source_def or not target_def:
                continue
            
            # Validate that source has outputs
            if not source_def.get("outputs"):
                self.errors.append(ValidationError(
                    f"Node '{source_node.label}' has no outputs but has an outgoing connection",
                    node_id=source_node.id
                ))
            
            # Validate that target has inputs
            if not target_def.get("inputs"):
                self.errors.append(ValidationError(
                    f"Node '{target_node.label}' has no inputs but has an incoming connection",
                    node_id=target_node.id
                ))
    
    def _get_node_by_id(self, node_id: str) -> NodeConfig:
        """Get node by ID"""
        for node in self.workflow.nodes:
            if node.id == node_id:
                return node
        return None

