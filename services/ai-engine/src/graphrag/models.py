"""
Pydantic models for GraphRAG
Type-safe data models for RAG profiles, KG views, requests, and responses
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


# ============================================================================
# RAG Profile Models
# ============================================================================

class FusionWeights(BaseModel):
    """Weights for hybrid search fusion"""
    vector: float = Field(..., ge=0.0, le=1.0, description="Vector search weight")
    keyword: float = Field(..., ge=0.0, le=1.0, description="Keyword search weight")
    graph: float = Field(..., ge=0.0, le=1.0, description="Graph search weight")
    
    def normalize(self) -> "FusionWeights":
        """Normalize weights to sum to 1.0"""
        total = self.vector + self.keyword + self.graph
        if total == 0:
            return FusionWeights(vector=1.0, keyword=0.0, graph=0.0)
        
        return FusionWeights(
            vector=self.vector / total,
            keyword=self.keyword / total,
            graph=self.graph / total
        )


class RAGProfile(BaseModel):
    """RAG profile configuration"""
    id: UUID
    profile_name: str
    strategy_type: Literal[
        "semantic_standard",
        "hybrid_enhanced",
        "graphrag_entity",
        "agent_optimized"
    ]
    top_k: int = Field(..., ge=1, le=100)
    similarity_threshold: float = Field(..., ge=0.0, le=1.0)
    rerank_enabled: bool = False
    rerank_model: Optional[str] = None
    context_window_tokens: int = Field(..., ge=100, le=32000)
    enable_graph_search: bool
    enable_keyword_search: bool
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Fusion weights (computed from strategy_type)
    fusion_weights: Optional[FusionWeights] = None
    
    def get_fusion_weights(self) -> FusionWeights:
        """Get fusion weights based on strategy type"""
        if self.fusion_weights:
            return self.fusion_weights
        
        # Default weights by strategy type
        weights_map = {
            "semantic_standard": FusionWeights(vector=1.0, keyword=0.0, graph=0.0),
            "hybrid_enhanced": FusionWeights(vector=0.6, keyword=0.4, graph=0.0),
            "graphrag_entity": FusionWeights(vector=0.4, keyword=0.2, graph=0.4),
            "agent_optimized": FusionWeights(vector=0.5, keyword=0.3, graph=0.2)
        }
        
        return weights_map.get(self.strategy_type, FusionWeights(vector=1.0, keyword=0.0, graph=0.0))


class AgentRAGPolicy(BaseModel):
    """Agent-specific RAG policy overrides"""
    id: UUID
    agent_id: UUID
    rag_profile_id: UUID
    agent_specific_top_k: Optional[int] = None
    agent_specific_threshold: Optional[float] = None
    is_active: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ============================================================================
# Knowledge Graph View Models
# ============================================================================

class AgentKGView(BaseModel):
    """Agent-specific knowledge graph view constraints"""
    id: UUID
    agent_id: UUID
    include_nodes: List[str] = Field(default_factory=list)
    include_edges: List[str] = Field(default_factory=list)
    exclude_nodes: List[str] = Field(default_factory=list)
    exclude_edges: List[str] = Field(default_factory=list)
    max_hops: int = Field(default=2, ge=1, le=5)
    graph_limit: int = Field(default=50, ge=1, le=200)
    is_active: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    def get_allowed_nodes(self) -> Optional[List[str]]:
        """Get allowed node types"""
        if not self.include_nodes:
            return None
        return [n for n in self.include_nodes if n not in self.exclude_nodes]
    
    def get_allowed_edges(self) -> Optional[List[str]]:
        """Get allowed edge types"""
        if not self.include_edges:
            return None
        return [e for e in self.include_edges if e not in self.exclude_edges]


# ============================================================================
# Search Result Models
# ============================================================================

class SearchSource(BaseModel):
    """Source information for a search result"""
    document_id: str
    title: Optional[str] = None
    url: Optional[str] = None
    citation: Optional[str] = None


class ContextChunk(BaseModel):
    """A chunk of context with metadata"""
    chunk_id: str
    text: str
    score: float
    source: SearchSource
    search_modality: Literal["vector", "keyword", "graph"]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EvidenceNode(BaseModel):
    """A node in the evidence chain"""
    node_id: str
    node_type: str
    node_name: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    relevance_score: float


class GraphEvidence(BaseModel):
    """Evidence from graph traversal"""
    path_id: str
    nodes: List[EvidenceNode]
    edges: List[Dict[str, Any]]
    path_score: float


# ============================================================================
# GraphRAG Request/Response Models
# ============================================================================

class GraphRAGRequest(BaseModel):
    """Request for GraphRAG query"""
    query: str = Field(..., min_length=1, max_length=2000)
    agent_id: UUID
    session_id: UUID
    user_id: Optional[UUID] = None
    tenant_id: Optional[UUID] = None
    rag_profile_id: Optional[UUID] = None  # If None, use agent's default
    top_k: Optional[int] = Field(None, ge=1, le=100)
    min_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    include_graph_evidence: bool = True
    include_citations: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GraphRAGMetadata(BaseModel):
    """Metadata about GraphRAG execution"""
    profile_used: str
    fusion_weights: FusionWeights
    vector_results_count: int
    keyword_results_count: int
    graph_results_count: int
    total_results_count: int
    rerank_applied: bool
    execution_time_ms: float
    agent_kg_view_applied: bool


class GraphRAGResponse(BaseModel):
    """Response from GraphRAG query"""
    query: str
    context_chunks: List[ContextChunk]
    evidence_chain: Optional[List[GraphEvidence]] = None
    citations: Dict[str, SearchSource] = Field(default_factory=dict)
    metadata: GraphRAGMetadata
    session_id: UUID
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Entity Extraction Models
# ============================================================================

class ExtractedEntity(BaseModel):
    """Entity extracted from query"""
    text: str
    entity_type: str
    confidence: float
    start_pos: int
    end_pos: int


class EntityExtractionResult(BaseModel):
    """Result of entity extraction"""
    query: str
    entities: List[ExtractedEntity]
    processed_query: str  # Query with entities highlighted/normalized


# ============================================================================
# Backward Compatibility Aliases
# ============================================================================

# Alias for tests that expect VectorResult
VectorResult = ContextChunk

