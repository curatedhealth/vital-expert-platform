"""
VITAL Path - React Flow JSON Parser

Parses the JSON payload from the Visual Workflow Designer into
a structured representation that can be validated and compiled.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
import logging

logger = logging.getLogger(__name__)


@dataclass
class Position:
    """2D position on canvas."""
    x: float
    y: float


@dataclass
class ParsedNode:
    """Parsed node from React Flow JSON."""
    id: str
    type: str
    position: Position
    data: Dict[str, Any]
    label: Optional[str] = None
    
    @property
    def is_entry(self) -> bool:
        return self.type == "start"
    
    @property
    def is_exit(self) -> bool:
        return self.type == "end"


@dataclass
class ParsedEdge:
    """Parsed edge from React Flow JSON."""
    id: str
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None
    edge_type: str = "default"
    label: Optional[str] = None
    data: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_conditional(self) -> bool:
        return self.edge_type == "conditional"


@dataclass
class ParsedWorkflow:
    """Complete parsed workflow."""
    id: str
    name: str
    description: Optional[str]
    version: str
    nodes: List[ParsedNode]
    edges: List[ParsedEdge]
    entry_node_id: str
    exit_node_ids: List[str]
    execution_settings: Dict[str, Any]
    global_variables: Dict[str, Any]
    tenant_id: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def get_node(self, node_id: str) -> Optional[ParsedNode]:
        """Get a node by ID."""
        return next((n for n in self.nodes if n.id == node_id), None)
    
    def get_outgoing_edges(self, node_id: str) -> List[ParsedEdge]:
        """Get all edges originating from a node."""
        return [e for e in self.edges if e.source == node_id]
    
    def get_incoming_edges(self, node_id: str) -> List[ParsedEdge]:
        """Get all edges targeting a node."""
        return [e for e in self.edges if e.target == node_id]
    
    def get_entry_node(self) -> Optional[ParsedNode]:
        """Get the entry node."""
        return self.get_node(self.entry_node_id)
    
    def get_exit_nodes(self) -> List[ParsedNode]:
        """Get all exit nodes."""
        return [n for n in self.nodes if n.id in self.exit_node_ids]


class ParseError(Exception):
    """Error during workflow parsing."""
    
    def __init__(self, message: str, path: Optional[str] = None):
        self.path = path
        super().__init__(f"{message}" + (f" at {path}" if path else ""))


def parse_react_flow_json(json_data: Dict[str, Any]) -> ParsedWorkflow:
    """
    Parse React Flow JSON into a structured workflow representation.
    
    Args:
        json_data: The raw JSON from the frontend
    
    Returns:
        ParsedWorkflow instance
    
    Raises:
        ParseError: If the JSON is malformed or missing required fields
    """
    logger.debug(f"Parsing workflow: {json_data.get('name', 'unnamed')}")
    
    try:
        # Parse required fields
        workflow_id = _require_field(json_data, "id", "string")
        name = _require_field(json_data, "name", "string")
        tenant_id = _require_field(json_data, "tenantId", "string")
        entry_node_id = _require_field(json_data, "entryNodeId", "string")
        exit_node_ids = _require_field(json_data, "exitNodeIds", "list")
        
        # Parse optional fields
        description = json_data.get("description")
        version = json_data.get("version", "1.0.0")
        execution_settings = json_data.get("executionSettings", {})
        global_variables = json_data.get("globalVariables", {})
        metadata = json_data.get("metadata", {})
        
        # Parse nodes
        raw_nodes = _require_field(json_data, "nodes", "list")
        nodes = [_parse_node(n, i) for i, n in enumerate(raw_nodes)]
        
        # Parse edges
        raw_edges = _require_field(json_data, "edges", "list")
        edges = [_parse_edge(e, i) for i, e in enumerate(raw_edges)]
        
        # Create workflow
        workflow = ParsedWorkflow(
            id=workflow_id,
            name=name,
            description=description,
            version=version,
            nodes=nodes,
            edges=edges,
            entry_node_id=entry_node_id,
            exit_node_ids=exit_node_ids,
            execution_settings=execution_settings,
            global_variables=global_variables,
            tenant_id=tenant_id,
            metadata=metadata,
        )
        
        logger.debug(f"Parsed workflow with {len(nodes)} nodes and {len(edges)} edges")
        return workflow
        
    except ParseError:
        raise
    except Exception as e:
        raise ParseError(f"Unexpected error parsing workflow: {str(e)}")


def _parse_node(node_data: Dict[str, Any], index: int) -> ParsedNode:
    """Parse a single node."""
    path = f"nodes[{index}]"
    
    node_id = _require_field(node_data, "id", "string", path)
    node_type = _require_field(node_data, "type", "string", path)
    
    # Parse position
    position_data = _require_field(node_data, "position", "dict", path)
    position = Position(
        x=position_data.get("x", 0),
        y=position_data.get("y", 0),
    )
    
    # Parse data
    data = node_data.get("data", {})
    label = node_data.get("label")
    
    return ParsedNode(
        id=node_id,
        type=node_type,
        position=position,
        data=data,
        label=label,
    )


def _parse_edge(edge_data: Dict[str, Any], index: int) -> ParsedEdge:
    """Parse a single edge."""
    path = f"edges[{index}]"
    
    edge_id = _require_field(edge_data, "id", "string", path)
    source = _require_field(edge_data, "source", "string", path)
    target = _require_field(edge_data, "target", "string", path)
    
    return ParsedEdge(
        id=edge_id,
        source=source,
        target=target,
        source_handle=edge_data.get("sourceHandle"),
        target_handle=edge_data.get("targetHandle"),
        edge_type=edge_data.get("type", "default"),
        label=edge_data.get("label"),
        data=edge_data.get("data", {}),
    )


def _require_field(
    data: Dict[str, Any],
    field: str,
    expected_type: str,
    path: str = "",
) -> Any:
    """
    Require a field to be present and of the correct type.
    
    Args:
        data: The dictionary to check
        field: The field name
        expected_type: One of "string", "int", "float", "bool", "list", "dict"
        path: Path for error messages
    
    Returns:
        The field value
    
    Raises:
        ParseError: If the field is missing or wrong type
    """
    full_path = f"{path}.{field}" if path else field
    
    if field not in data:
        raise ParseError(f"Missing required field: {field}", full_path)
    
    value = data[field]
    
    type_checks = {
        "string": str,
        "int": int,
        "float": (int, float),
        "bool": bool,
        "list": list,
        "dict": dict,
    }
    
    expected = type_checks.get(expected_type)
    if expected and not isinstance(value, expected):
        raise ParseError(
            f"Expected {expected_type}, got {type(value).__name__}",
            full_path,
        )
    
    return value






