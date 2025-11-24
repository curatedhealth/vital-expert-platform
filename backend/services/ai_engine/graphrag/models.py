"""
GraphRAG Service Models
Pydantic models for requests, responses, and internal data structures.
"""

from pydantic import BaseModel, Field, UUID4
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class RAGStrategyType(str, Enum):
    """RAG strategy types."""
    SEMANTIC = "semantic"
    HYBRID = "hybrid"
    GRAPHRAG = "graphrag"
    AGENT_OPTIMIZED = "agent_optimized"


class NodeType(str, Enum):
    """Knowledge graph node types."""
    DRUG = "Drug"
    DISEASE = "Disease"
    INDICATION = "Indication"
    TRIAL = "Trial"
    GUIDELINE = "Guideline"
    PUBLICATION = "Publication"
    KOL = "KOL"
    PAYER = "Payer"
    REGULATION = "Regulation"
    DEVICE = "Device"
    BIOMARKER = "Biomarker"
    PATHWAY = "Pathway"


class EdgeType(str, Enum):
    """Knowledge graph edge types."""
    TREATS = "TREATS"
    INDICATED_FOR = "INDICATED_FOR"
    CONTRAINDICATED_WITH = "CONTRAINDICATED_WITH"
    RECOMMENDS = "RECOMMENDS"
    SUPPORTED_BY = "SUPPORTED_BY"
    REGULATES = "REGULATES"
    COVERS = "COVERS"
    AUTHORED_BY = "AUTHORED_BY"
    TARGETS = "TARGETS"
    ASSOCIATED_WITH = "ASSOCIATED_WITH"


# ============================================================================
# RAG PROFILE MODELS
# ============================================================================

class FusionWeights(BaseModel):
    """Weights for hybrid search fusion."""
    vector: float = Field(..., ge=0.0, le=1.0)
    keyword: float = Field(..., ge=0.0, le=1.0)
    graph: float = Field(..., ge=0.0, le=1.0)


class RAGProfile(BaseModel):
    """RAG profile from database with overrides."""
    id: UUID4
    name: str
    slug: str
    description: Optional[str] = None
    retrieval_mode: str  # 'semantic', 'hybrid', 'graphrag'
    
    # Weights
    vector_weight: float = 1.0
    keyword_weight: float = 0.0
    graph_weight: float = 0.0
    
    # Retrieval parameters
    top_k: int = Field(default=10, ge=1, le=100)
    similarity_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    rerank_enabled: bool = False
    reranker_model: Optional[str] = None
    
    # Context window
    context_window_tokens: int = 4000
    chunk_overlap_tokens: int = 200
    
    # Filters
    metadata_filters: Optional[Dict[str, Any]] = None
    
    # Metadata
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    @property
    def fusion_weights(self) -> FusionWeights:
        """Get fusion weights from vector/keyword/graph weights"""
        return FusionWeights(
            vector=self.vector_weight,
            keyword=self.keyword_weight,
            graph=self.graph_weight
        )


# ============================================================================
# KG VIEW MODELS
# ============================================================================

class KGNodeType(BaseModel):
    """Knowledge graph node type from registry"""
    id: UUID4
    name: str
    description: Optional[str] = None
    properties: Dict[str, Any] = {}
    is_active: bool = True


class KGEdgeType(BaseModel):
    """Knowledge graph edge type from registry"""
    id: UUID4
    name: str
    description: Optional[str] = None
    inverse_name: Optional[str] = None
    properties: Dict[str, Any] = {}
    is_active: bool = True


class AgentKGView(BaseModel):
    """Agent-specific knowledge graph view configuration."""
    id: Optional[UUID4] = None
    agent_id: UUID4
    rag_profile_id: Optional[UUID4] = None
    name: str
    description: Optional[str] = None
    include_nodes: List[UUID4] = []  # UUIDs of kg_node_types
    include_edges: List[UUID4] = []  # UUIDs of kg_edge_types
    max_hops: int = Field(default=3, ge=1, le=10)
    graph_limit: int = Field(default=100, ge=1, le=1000)
    depth_strategy: str = "breadth"  # 'breadth', 'depth', 'entity-centric'
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ============================================================================
# SEARCH RESULT MODELS
# ============================================================================

class VectorResult(BaseModel):
    """Result from vector search."""
    id: str  # Vector ID
    score: float
    text: str  # Chunk content
    metadata: Dict[str, Any] = {}
    
    # Legacy compatibility
    @property
    def chunk_id(self) -> str:
        return self.id
    
    @property
    def content(self) -> str:
        return self.text


class KeywordResult(BaseModel):
    """Result from keyword search."""
    chunk_id: str
    content: str
    score: float
    highlights: List[str] = []
    metadata: Dict[str, Any] = {}


class GraphNode(BaseModel):
    """Node in a graph path."""
    id: str
    labels: List[str]
    properties: Dict[str, Any]


class GraphRelationship(BaseModel):
    """Relationship in a graph path"""
    type: str
    start_node_id: str
    end_node_id: str
    properties: Dict[str, Any] = {}


class GraphEdge(BaseModel):
    """Edge in a graph path (legacy, use GraphRelationship)."""
    type: str
    properties: Dict[str, Any] = {}


class GraphPath(BaseModel):
    """A path through the knowledge graph."""
    nodes: List[GraphNode]
    relationships: List[GraphRelationship]  # Updated from edges
    length: int
    
    # Optional fields
    id: Optional[str] = None
    score: Optional[float] = None
    relevance_explanation: Optional[str] = None
    
    # Legacy compatibility
    @property
    def edges(self) -> List[GraphEdge]:
        """Convert relationships to edges for backward compatibility"""
        return [GraphEdge(type=rel.type, properties=rel.properties) for rel in self.relationships]


class GraphResult(BaseModel):
    """Result from graph search."""
    chunk_id: str
    content: str
    score: float
    path_id: str
    hops: int
    metadata: Dict[str, Any] = {}


class GraphSearchResults(BaseModel):
    """Complete results from graph search."""
    paths: List[GraphPath]
    chunks: List[GraphResult]
    evidence_chains: List["EvidenceNode"] = []
    avg_score: float
    max_hops_used: int


# ============================================================================
# FUSION & CONTEXT MODELS
# ============================================================================

class FusedResult(BaseModel):
    """Result after hybrid fusion."""
    chunk_id: str
    content: str
    metadata: Dict[str, Any]
    sources: Dict[str, Dict[str, Any]]  # {'vector': {...}, 'keyword': {...}, 'graph': {...}}
    final_score: float


class EvidenceNode(BaseModel):
    """A node in the evidence chain."""
    citation_id: str  # e.g., "[1]"
    type: str  # 'graph_path', 'retrieved_chunk', 'publication', etc.
    content: str
    graph_path: Optional[GraphPath] = None
    sources: List[str] = []  # ['vector', 'keyword', 'graph']
    confidence: float
    metadata: Dict[str, Any] = {}


class ContextChunk(BaseModel):
    """A chunk in the final context."""
    content: str
    citation_id: str
    sources: Dict[str, Dict[str, Any]]
    metadata: Dict[str, Any]


class ContextWithEvidence(BaseModel):
    """Final context with evidence chains."""
    chunks: List[ContextChunk]
    evidence_chain: List[EvidenceNode]
    total_tokens: int


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class GraphRAGRequest(BaseModel):
    """Request for GraphRAG query."""
    query: str = Field(..., min_length=1, max_length=2000)
    agent_id: UUID4
    session_id: UUID4
    rag_profile_id: Optional[UUID4] = None
    
    # Optional overrides
    top_k: Optional[int] = Field(None, ge=1, le=100)
    similarity_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    enable_graph_search: Optional[bool] = None
    max_context_tokens: Optional[int] = Field(None, ge=100, le=10000)


class GraphRAGMetadata(BaseModel):
    """Metadata about the GraphRAG query execution."""
    profile: str
    strategy_type: RAGStrategyType
    
    # Search scores
    vector_score: Optional[float] = None
    keyword_score: Optional[float] = None
    graph_score: Optional[float] = None
    
    # Fusion
    fusion_weights: FusionWeights
    
    # Performance
    latency_ms: int
    vector_search_ms: Optional[int] = None
    keyword_search_ms: Optional[int] = None
    graph_search_ms: Optional[int] = None
    fusion_ms: Optional[int] = None
    rerank_ms: Optional[int] = None
    
    # Results
    total_candidates: int
    final_chunks: int
    total_hops: Optional[int] = None
    graph_paths_found: Optional[int] = None
    
    # Config
    agent_kg_view_applied: bool = False
    reranking_applied: bool = False


class GraphRAGResponse(BaseModel):
    """Response from GraphRAG query."""
    context_chunks: List[ContextChunk]
    graph_paths: Optional[List[GraphPath]] = None
    evidence_chain: List[EvidenceNode]
    metadata: GraphRAGMetadata
    
    # Request context
    session_id: UUID4
    agent_id: UUID4
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# INTERNAL SEARCH MODELS
# ============================================================================

class SearchResults(BaseModel):
    """Generic search results wrapper."""
    vector_results: List[VectorResult] = []
    keyword_results: List[KeywordResult] = []
    graph_results: Optional[GraphSearchResults] = None
    
    latency_ms: Dict[str, int] = {}  # {'vector': 123, 'keyword': 456, 'graph': 789}


class Entity(BaseModel):
    """Extracted entity from query."""
    text: str
    type: str  # 'drug', 'disease', etc.
    confidence: float
    start_char: int
    end_char: int


# ============================================================================
# ERROR MODELS
# ============================================================================

class GraphRAGError(BaseModel):
    """Error response from GraphRAG service."""
    error_type: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Update forward references
GraphSearchResults.model_rebuild()

