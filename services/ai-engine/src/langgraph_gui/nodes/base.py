"""
Base node types and interfaces for workflow builder
"""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class NodeType(str, Enum):
    """All available node types"""
    
    # Agents
    ORCHESTRATOR = "orchestrator"
    MEDICAL = "medical_agent"
    DIGITAL_HEALTH = "digital_health_agent"
    REGULATORY = "regulatory_agent"
    AGGREGATOR = "aggregator"
    COPYWRITER = "copywriter"
    
    # Tools
    PUBMED = "pubmed_search"
    ARXIV = "arxiv_search"
    CLINICAL_TRIALS = "clinical_trials_search"
    FDA = "fda_search"
    WEB_SEARCH = "web_search"
    SCRAPER = "scraper"
    
    # Data Sources
    RAG_SEARCH = "rag_search"
    RAG_ARCHIVE = "rag_archive"
    CACHE_LOOKUP = "cache_lookup"
    
    # Control Flow
    CONDITION = "condition"
    LOOP = "loop"
    PARALLEL = "parallel"
    MERGE = "merge"
    
    # I/O
    INPUT = "input"
    OUTPUT = "output"
    
    # Panel Workflow Nodes
    PANEL_INITIALIZE = "initialize"
    PANEL_OPENING_STATEMENTS = "opening_statements"
    PANEL_DISCUSSION_ROUND = "discussion_round"
    PANEL_CONSENSUS_BUILDING = "consensus_building"
    PANEL_CONSENSUS_ASSESSMENT = "consensus_assessment"
    PANEL_QNA = "qna"
    PANEL_DOCUMENTATION = "documentation"
    PANEL_OPENING_ROUND = "opening_round"
    PANEL_FREE_DIALOGUE = "free_dialogue"
    PANEL_THEME_CLUSTERING = "theme_clustering"
    PANEL_FINAL_PERSPECTIVES = "final_perspectives"
    PANEL_SYNTHESIS = "synthesis"


class NodeParameter(BaseModel):
    """Parameter definition for a node"""
    type: str  # "string", "number", "boolean", "array", "object"
    label: str
    default: Any = None
    required: bool = False
    description: Optional[str] = None
    options: Optional[List[Any]] = None  # For dropdown/select


class NodeConfig(BaseModel):
    """Configuration for a node instance in a workflow"""
    id: str
    type: NodeType
    label: str
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})
    parameters: Dict[str, Any] = Field(default_factory=dict)
    data: Dict[str, Any] = Field(default_factory=dict)  # Additional UI data


class Connection(BaseModel):
    """Connection between two nodes"""
    id: str
    source: str  # Source node ID
    target: str  # Target node ID
    sourceHandle: Optional[str] = None  # For multi-output nodes
    targetHandle: Optional[str] = None  # For multi-input nodes


class Workflow(BaseModel):
    """Complete workflow definition"""
    id: str
    name: str
    description: Optional[str] = None
    nodes: List[NodeConfig]
    edges: List[Connection]
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class WorkflowMetadata(BaseModel):
    """Metadata for workflow listing"""
    id: str
    name: str
    description: Optional[str] = None
    node_count: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ExecutionEvent(BaseModel):
    """Event emitted during workflow execution"""
    type: str  # "node_started", "node_progress", "node_completed", "node_error", "workflow_completed"
    node_id: Optional[str] = None
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    timestamp: str
    progress: Optional[float] = None  # 0.0 to 1.0


