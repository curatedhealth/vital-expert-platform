"""
VITAL Path - Translator Module

The bridge between Visual Workflow Designer (React Flow) and 
Executable Workflow Engine (LangGraph).

Components:
- parser: Parse React Flow JSON
- validator: Validate graph structure
- compiler: Compile to LangGraph StateGraph
- registry: Map UI nodes to Python functions

Usage:
    from modules.translator import WorkflowCompiler, NodeRegistry
    
    compiler = WorkflowCompiler()
    graph = compiler.compile(react_flow_json)
"""

from .compiler import WorkflowCompiler
from .registry import NodeRegistry
from .parser import (
    parse_react_flow_json,
    ParsedWorkflow,
    ParsedNode,
    ParsedEdge,
    ParseError,
)
from .validator import validate_workflow_graph, ValidationResult
from .exceptions import ValidationError
from .exceptions import (
    TranslatorError,
    CompilationError,
    ValidationError,
    NodeHandlerNotFoundError,
)

# Alias for backward compatibility
NodeNotFoundError = NodeHandlerNotFoundError

# Aliases for test compatibility
WorkflowParser = parse_react_flow_json
WorkflowValidator = validate_workflow_graph

__all__ = [
    # Core classes
    "WorkflowCompiler",
    "NodeRegistry",
    # Parser
    "parse_react_flow_json",
    "ParsedWorkflow",
    "ParsedNode",
    "ParsedEdge",
    "ParseError",
    # Validator
    "validate_workflow_graph",
    "ValidationError",
    "ValidationResult",
    # Exceptions
    "TranslatorError",
    "CompilationError",
    "NodeNotFoundError",
    # Aliases
    "WorkflowParser",
    "WorkflowValidator",
]



















