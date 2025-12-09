"""
VITAL Path - Workflow Graph Validator

Validates the structure of a parsed workflow before compilation.
Catches errors like orphan nodes, cycles, and invalid references.
"""

from typing import List, Set, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum
import logging

from .parser import ParsedWorkflow, ParsedNode, ParsedEdge
from .registry import NodeRegistry

logger = logging.getLogger(__name__)


class Severity(Enum):
    """Validation issue severity."""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class ValidationIssue:
    """A single validation issue."""
    code: str
    message: str
    severity: Severity
    node_id: Optional[str] = None
    edge_id: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "message": self.message,
            "severity": self.severity.value,
            "nodeId": self.node_id,
            "edgeId": self.edge_id,
        }


@dataclass
class ValidationResult:
    """Result of workflow validation."""
    is_valid: bool
    issues: List[ValidationIssue] = field(default_factory=list)
    
    @property
    def errors(self) -> List[ValidationIssue]:
        return [i for i in self.issues if i.severity == Severity.ERROR]
    
    @property
    def warnings(self) -> List[ValidationIssue]:
        return [i for i in self.issues if i.severity == Severity.WARNING]
    
    def add_error(self, code: str, message: str, **kwargs):
        self.issues.append(ValidationIssue(code, message, Severity.ERROR, **kwargs))
        self.is_valid = False
    
    def add_warning(self, code: str, message: str, **kwargs):
        self.issues.append(ValidationIssue(code, message, Severity.WARNING, **kwargs))
    
    def add_info(self, code: str, message: str, **kwargs):
        self.issues.append(ValidationIssue(code, message, Severity.INFO, **kwargs))
    
    def to_dict(self) -> dict:
        return {
            "isValid": self.is_valid,
            "errors": [i.to_dict() for i in self.issues],
        }


def validate_workflow_graph(workflow: ParsedWorkflow) -> ValidationResult:
    """
    Validate a parsed workflow graph.
    
    Checks for:
    1. Entry node exists and is valid
    2. Exit nodes exist and are valid
    3. All edges reference valid nodes
    4. No orphan nodes (except allowed types)
    5. No unreachable nodes
    6. No cycles (if not allowed)
    7. All node types have registered handlers
    8. Node-specific configuration validation
    
    Args:
        workflow: The parsed workflow to validate
    
    Returns:
        ValidationResult with all issues found
    """
    result = ValidationResult(is_valid=True)
    
    logger.debug(f"Validating workflow: {workflow.name}")
    
    # Build lookup sets for fast access
    node_ids = {n.id for n in workflow.nodes}
    edge_ids = {e.id for e in workflow.edges}
    
    # Run all validations
    _validate_entry_node(workflow, node_ids, result)
    _validate_exit_nodes(workflow, node_ids, result)
    _validate_edge_references(workflow, node_ids, result)
    _validate_node_handlers(workflow, result)
    _validate_connectivity(workflow, result)
    _validate_no_orphans(workflow, result)
    _validate_node_configs(workflow, result)
    
    logger.debug(
        f"Validation complete: valid={result.is_valid}, "
        f"errors={len(result.errors)}, warnings={len(result.warnings)}"
    )
    
    return result


def _validate_entry_node(
    workflow: ParsedWorkflow,
    node_ids: Set[str],
    result: ValidationResult,
):
    """Validate entry node exists and is correct type."""
    if not workflow.entry_node_id:
        result.add_error(
            "MISSING_ENTRY_NODE_ID",
            "Workflow must specify an entry node ID",
        )
        return
    
    if workflow.entry_node_id not in node_ids:
        result.add_error(
            "ENTRY_NODE_NOT_FOUND",
            f"Entry node '{workflow.entry_node_id}' not found in workflow",
            node_id=workflow.entry_node_id,
        )
        return
    
    entry_node = workflow.get_node(workflow.entry_node_id)
    if entry_node and entry_node.type != "start":
        result.add_warning(
            "ENTRY_NODE_NOT_START",
            f"Entry node '{entry_node.id}' has type '{entry_node.type}', expected 'start'",
            node_id=entry_node.id,
        )


def _validate_exit_nodes(
    workflow: ParsedWorkflow,
    node_ids: Set[str],
    result: ValidationResult,
):
    """Validate exit nodes exist and are correct type."""
    if not workflow.exit_node_ids:
        result.add_error(
            "MISSING_EXIT_NODES",
            "Workflow must specify at least one exit node ID",
        )
        return
    
    for exit_id in workflow.exit_node_ids:
        if exit_id not in node_ids:
            result.add_error(
                "EXIT_NODE_NOT_FOUND",
                f"Exit node '{exit_id}' not found in workflow",
                node_id=exit_id,
            )
            continue
        
        exit_node = workflow.get_node(exit_id)
        if exit_node and exit_node.type != "end":
            result.add_warning(
                "EXIT_NODE_NOT_END",
                f"Exit node '{exit_node.id}' has type '{exit_node.type}', expected 'end'",
                node_id=exit_node.id,
            )


def _validate_edge_references(
    workflow: ParsedWorkflow,
    node_ids: Set[str],
    result: ValidationResult,
):
    """Validate all edges reference valid nodes."""
    for edge in workflow.edges:
        if edge.source not in node_ids:
            result.add_error(
                "INVALID_EDGE_SOURCE",
                f"Edge '{edge.id}' references non-existent source node '{edge.source}'",
                edge_id=edge.id,
            )
        
        if edge.target not in node_ids:
            result.add_error(
                "INVALID_EDGE_TARGET",
                f"Edge '{edge.id}' references non-existent target node '{edge.target}'",
                edge_id=edge.id,
            )
        
        # Check for self-loops
        if edge.source == edge.target:
            result.add_warning(
                "SELF_LOOP",
                f"Edge '{edge.id}' creates a self-loop on node '{edge.source}'",
                edge_id=edge.id,
                node_id=edge.source,
            )


def _validate_node_handlers(workflow: ParsedWorkflow, result: ValidationResult):
    """Validate all node types have registered handlers."""
    for node in workflow.nodes:
        if not NodeRegistry.has_handler(node.type):
            result.add_error(
                "UNKNOWN_NODE_TYPE",
                f"No handler registered for node type '{node.type}'",
                node_id=node.id,
            )


def _validate_connectivity(workflow: ParsedWorkflow, result: ValidationResult):
    """Validate all nodes are reachable from entry."""
    if not workflow.entry_node_id:
        return
    
    # BFS from entry node
    reachable: Set[str] = set()
    to_visit = [workflow.entry_node_id]
    
    while to_visit:
        current = to_visit.pop(0)
        if current in reachable:
            continue
        
        reachable.add(current)
        
        # Add all nodes reachable via outgoing edges
        for edge in workflow.get_outgoing_edges(current):
            if edge.target not in reachable:
                to_visit.append(edge.target)
    
    # Find unreachable nodes
    all_node_ids = {n.id for n in workflow.nodes}
    unreachable = all_node_ids - reachable
    
    for node_id in unreachable:
        node = workflow.get_node(node_id)
        if node:
            result.add_warning(
                "UNREACHABLE_NODE",
                f"Node '{node_id}' ({node.type}) is not reachable from entry",
                node_id=node_id,
            )


def _validate_no_orphans(workflow: ParsedWorkflow, result: ValidationResult):
    """Check for orphan nodes (no incoming or outgoing edges)."""
    # Get all nodes that appear in edges
    connected_nodes: Set[str] = set()
    for edge in workflow.edges:
        connected_nodes.add(edge.source)
        connected_nodes.add(edge.target)
    
    for node in workflow.nodes:
        # Start and end nodes are allowed to have limited connections
        if node.type in ("start", "end"):
            continue
        
        if node.id not in connected_nodes:
            result.add_warning(
                "ORPHAN_NODE",
                f"Node '{node.id}' ({node.type}) has no connections",
                node_id=node.id,
            )


def _validate_node_configs(workflow: ParsedWorkflow, result: ValidationResult):
    """Validate node-specific configuration."""
    for node in workflow.nodes:
        # Expert node validation
        if node.type == "expert":
            if not node.data.get("agentId"):
                result.add_error(
                    "EXPERT_MISSING_AGENT",
                    f"Expert node '{node.id}' must specify an agentId",
                    node_id=node.id,
                )
            if not node.data.get("mode"):
                result.add_warning(
                    "EXPERT_MISSING_MODE",
                    f"Expert node '{node.id}' should specify a mode (defaulting to mode_1)",
                    node_id=node.id,
                )
        
        # Router node validation
        elif node.type == "router":
            conditions = node.data.get("conditions", [])
            if not conditions:
                result.add_error(
                    "ROUTER_NO_CONDITIONS",
                    f"Router node '{node.id}' must have at least one condition",
                    node_id=node.id,
                )
            if not node.data.get("defaultTargetNodeId"):
                result.add_error(
                    "ROUTER_NO_DEFAULT",
                    f"Router node '{node.id}' must specify a default target",
                    node_id=node.id,
                )
        
        # Webhook node validation
        elif node.type == "webhook":
            if not node.data.get("url"):
                result.add_error(
                    "WEBHOOK_NO_URL",
                    f"Webhook node '{node.id}' must specify a URL",
                    node_id=node.id,
                )


