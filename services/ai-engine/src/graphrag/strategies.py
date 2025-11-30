"""
RAG Strategy Definitions and Configuration
Comprehensive strategy library for different query types and use cases
"""

from typing import Dict, Optional, List, Literal
from dataclasses import dataclass, field
from enum import Enum
import structlog

from .models import FusionWeights

logger = structlog.get_logger()


# ============================================================================
# Strategy Enums
# ============================================================================

class RAGStrategyType(str, Enum):
    """Available RAG strategy types"""
    # Core strategies
    SEMANTIC_STANDARD = "semantic_standard"
    HYBRID_ENHANCED = "hybrid_enhanced"
    GRAPHRAG_ENTITY = "graphrag_entity"
    AGENT_OPTIMIZED = "agent_optimized"

    # Domain-specific strategies
    REGULATORY_PRECISION = "regulatory_precision"
    CLINICAL_EVIDENCE = "clinical_evidence"
    RESEARCH_COMPREHENSIVE = "research_comprehensive"
    STARTUP_ADVISORY = "startup_advisory"

    # Experimental strategies
    KEYWORD_DOMINANT = "keyword_dominant"
    GRAPH_CENTRIC = "graph_centric"
    BALANCED_TRIMODAL = "balanced_trimodal"


class ChunkStrategy(str, Enum):
    """Chunking strategies for document processing"""
    STANDARD = "standard"           # 1000 chars, 200 overlap
    GRANULAR = "granular"           # 500 chars, 100 overlap
    CONTEXTUAL = "contextual"       # 2000 chars, 400 overlap
    SEMANTIC = "semantic"           # Split on paragraph boundaries
    HYBRID = "hybrid"               # Multiple chunk sizes per document


class RerankModel(str, Enum):
    """Available reranking models"""
    NONE = "none"
    COHERE_V3 = "cohere-rerank-v3"
    COHERE_MULTILINGUAL = "cohere-rerank-multilingual-v3"
    CROSS_ENCODER = "cross-encoder/ms-marco-MiniLM-L-12-v2"
    BGE_RERANKER = "BAAI/bge-reranker-base"


# ============================================================================
# Strategy Configuration Dataclasses
# ============================================================================

@dataclass
class ChunkConfig:
    """Configuration for document chunking"""
    strategy: ChunkStrategy
    chunk_size: int
    chunk_overlap: int
    min_chunk_size: int = 50
    respect_boundaries: bool = True  # Respect paragraph/section boundaries

    @classmethod
    def standard(cls) -> "ChunkConfig":
        return cls(
            strategy=ChunkStrategy.STANDARD,
            chunk_size=1000,
            chunk_overlap=200
        )

    @classmethod
    def granular(cls) -> "ChunkConfig":
        return cls(
            strategy=ChunkStrategy.GRANULAR,
            chunk_size=500,
            chunk_overlap=100
        )

    @classmethod
    def contextual(cls) -> "ChunkConfig":
        return cls(
            strategy=ChunkStrategy.CONTEXTUAL,
            chunk_size=2000,
            chunk_overlap=400
        )


@dataclass
class AuthorityConfig:
    """Configuration for source authority boosting"""
    enabled: bool = True
    boost_factor: float = 1.0  # 0.0-1.0, how strongly authority affects score
    default_source_weight: float = 0.75
    default_type_weight: float = 0.70

    # Minimum thresholds for authority consideration
    min_authority_score: float = 0.0  # Documents below this are filtered

    # Authority multipliers by document type
    type_multipliers: Dict[str, float] = field(default_factory=lambda: {
        "peer_review": 1.0,
        "guideline": 1.0,
        "regulatory": 0.95,
        "textbook": 0.90,
        "case_study": 0.85,
        "white_paper": 0.80,
        "blog": 0.55,
        "unknown": 0.70
    })


@dataclass
class RerankConfig:
    """Configuration for result reranking"""
    enabled: bool = False
    model: RerankModel = RerankModel.NONE
    top_k_rerank: int = 20  # How many results to rerank
    fallback_on_error: bool = True  # Use original ranking if rerank fails


@dataclass
class RAGStrategy:
    """Complete RAG strategy configuration"""
    name: str
    description: str
    strategy_type: RAGStrategyType

    # Fusion weights
    fusion_weights: FusionWeights

    # Search parameters
    top_k: int = 10
    similarity_threshold: float = 0.7
    context_window_tokens: int = 4000

    # Component configs
    chunk_config: ChunkConfig = field(default_factory=ChunkConfig.standard)
    authority_config: AuthorityConfig = field(default_factory=AuthorityConfig)
    rerank_config: RerankConfig = field(default_factory=RerankConfig)

    # Feature flags
    enable_graph_search: bool = False
    enable_keyword_search: bool = False

    # Advanced options
    query_expansion: bool = False  # Expand query with synonyms/related terms
    entity_extraction: bool = False  # Extract entities for targeted search
    citation_required: bool = True  # Always include citations

    # Metadata
    use_cases: List[str] = field(default_factory=list)

    def get_normalized_weights(self) -> FusionWeights:
        """Get normalized fusion weights"""
        return self.fusion_weights.normalize()


# ============================================================================
# Strategy Registry
# ============================================================================

class StrategyRegistry:
    """
    Registry of pre-configured RAG strategies

    Usage:
        registry = get_strategy_registry()
        strategy = registry.get_strategy(RAGStrategyType.CLINICAL_EVIDENCE)
    """

    def __init__(self):
        self._strategies: Dict[RAGStrategyType, RAGStrategy] = {}
        self._register_default_strategies()

    def _register_default_strategies(self):
        """Register all default strategies"""

        # ==== Core Strategies ====

        self.register(RAGStrategy(
            name="Semantic Standard",
            description="Pure vector semantic search. Best for conceptual questions.",
            strategy_type=RAGStrategyType.SEMANTIC_STANDARD,
            fusion_weights=FusionWeights(vector=1.0, keyword=0.0, graph=0.0),
            top_k=10,
            similarity_threshold=0.7,
            context_window_tokens=4000,
            enable_graph_search=False,
            enable_keyword_search=False,
            use_cases=["General questions", "Conceptual queries", "Exploratory research"]
        ))

        self.register(RAGStrategy(
            name="Hybrid Enhanced",
            description="Combines vector and keyword search for balanced retrieval.",
            strategy_type=RAGStrategyType.HYBRID_ENHANCED,
            fusion_weights=FusionWeights(vector=0.6, keyword=0.4, graph=0.0),
            top_k=15,
            similarity_threshold=0.65,
            context_window_tokens=6000,
            enable_graph_search=False,
            enable_keyword_search=True,
            rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
            use_cases=["Technical documentation", "Mixed queries", "FAQ-style questions"]
        ))

        self.register(RAGStrategy(
            name="GraphRAG Entity",
            description="Full trimodal search with knowledge graph traversal.",
            strategy_type=RAGStrategyType.GRAPHRAG_ENTITY,
            fusion_weights=FusionWeights(vector=0.4, keyword=0.2, graph=0.4),
            top_k=20,
            similarity_threshold=0.6,
            context_window_tokens=8000,
            enable_graph_search=True,
            enable_keyword_search=True,
            entity_extraction=True,
            use_cases=["Relationship queries", "Entity lookups", "Complex multi-hop questions"]
        ))

        self.register(RAGStrategy(
            name="Agent Optimized",
            description="Balanced strategy optimized for AI agent consumption.",
            strategy_type=RAGStrategyType.AGENT_OPTIMIZED,
            fusion_weights=FusionWeights(vector=0.5, keyword=0.3, graph=0.2),
            top_k=12,
            similarity_threshold=0.7,
            context_window_tokens=16000,  # Larger for agent context
            enable_graph_search=True,
            enable_keyword_search=True,
            rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
            authority_config=AuthorityConfig(enabled=True, boost_factor=1.0),
            use_cases=["AI advisory agents", "Autonomous research", "Multi-step reasoning"]
        ))

        # ==== Domain-Specific Strategies ====

        self.register(RAGStrategy(
            name="Regulatory Precision",
            description="High-precision search for regulatory and compliance content.",
            strategy_type=RAGStrategyType.REGULATORY_PRECISION,
            fusion_weights=FusionWeights(vector=0.3, keyword=0.6, graph=0.1),
            top_k=8,
            similarity_threshold=0.8,  # Higher threshold for precision
            context_window_tokens=4000,
            enable_graph_search=True,
            enable_keyword_search=True,
            chunk_config=ChunkConfig.granular(),  # Smaller chunks for precise extraction
            authority_config=AuthorityConfig(
                enabled=True,
                boost_factor=1.0,
                type_multipliers={
                    "regulatory": 1.0,
                    "guideline": 0.95,
                    "peer_review": 0.85,
                    "white_paper": 0.70,
                    "blog": 0.30,  # Heavily discount blogs for regulatory
                }
            ),
            rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
            citation_required=True,
            use_cases=["FDA regulations", "HIPAA compliance", "Legal requirements", "Policy lookup"]
        ))

        self.register(RAGStrategy(
            name="Clinical Evidence",
            description="Evidence-based retrieval for clinical decision support.",
            strategy_type=RAGStrategyType.CLINICAL_EVIDENCE,
            fusion_weights=FusionWeights(vector=0.45, keyword=0.35, graph=0.2),
            top_k=15,
            similarity_threshold=0.7,
            context_window_tokens=12000,
            enable_graph_search=True,
            enable_keyword_search=True,
            chunk_config=ChunkConfig.contextual(),  # Larger chunks for clinical context
            authority_config=AuthorityConfig(
                enabled=True,
                boost_factor=1.0,
                type_multipliers={
                    "peer_review": 1.0,
                    "guideline": 0.98,
                    "case_study": 0.90,
                    "textbook": 0.85,
                    "white_paper": 0.75,
                    "blog": 0.40,
                }
            ),
            rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
            entity_extraction=True,
            use_cases=["Clinical questions", "Treatment protocols", "Drug interactions", "Evidence lookup"]
        ))

        self.register(RAGStrategy(
            name="Research Comprehensive",
            description="Broad retrieval for comprehensive research and exploration.",
            strategy_type=RAGStrategyType.RESEARCH_COMPREHENSIVE,
            fusion_weights=FusionWeights(vector=0.5, keyword=0.25, graph=0.25),
            top_k=25,  # More results for research
            similarity_threshold=0.55,  # Lower threshold for breadth
            context_window_tokens=16000,
            enable_graph_search=True,
            enable_keyword_search=True,
            chunk_config=ChunkConfig.standard(),
            authority_config=AuthorityConfig(enabled=True, boost_factor=0.7),  # Lighter authority boost
            rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3, top_k_rerank=30),
            query_expansion=True,
            use_cases=["Literature review", "Market research", "Competitive analysis", "Trend analysis"]
        ))

        self.register(RAGStrategy(
            name="Startup Advisory",
            description="Optimized for digital health startup advisory use cases.",
            strategy_type=RAGStrategyType.STARTUP_ADVISORY,
            fusion_weights=FusionWeights(vector=0.5, keyword=0.3, graph=0.2),
            top_k=12,
            similarity_threshold=0.65,
            context_window_tokens=10000,
            enable_graph_search=True,
            enable_keyword_search=True,
            chunk_config=ChunkConfig.standard(),
            authority_config=AuthorityConfig(
                enabled=True,
                boost_factor=0.8,
                type_multipliers={
                    "regulatory": 1.0,
                    "guideline": 0.95,
                    "case_study": 0.90,
                    "white_paper": 0.85,
                    "peer_review": 0.85,
                    "blog": 0.60,  # More tolerance for startup content
                }
            ),
            rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
            use_cases=["Startup guidance", "Market entry", "Business strategy", "Investment readiness"]
        ))

        # ==== Experimental Strategies ====

        self.register(RAGStrategy(
            name="Keyword Dominant",
            description="Keyword-heavy search for exact term matching.",
            strategy_type=RAGStrategyType.KEYWORD_DOMINANT,
            fusion_weights=FusionWeights(vector=0.2, keyword=0.7, graph=0.1),
            top_k=10,
            similarity_threshold=0.75,
            context_window_tokens=4000,
            enable_graph_search=True,
            enable_keyword_search=True,
            use_cases=["Exact term lookup", "Acronym search", "Code/ID lookup"]
        ))

        self.register(RAGStrategy(
            name="Graph Centric",
            description="Graph-heavy search emphasizing entity relationships.",
            strategy_type=RAGStrategyType.GRAPH_CENTRIC,
            fusion_weights=FusionWeights(vector=0.3, keyword=0.1, graph=0.6),
            top_k=15,
            similarity_threshold=0.6,
            context_window_tokens=8000,
            enable_graph_search=True,
            enable_keyword_search=True,
            entity_extraction=True,
            use_cases=["Relationship queries", "Network analysis", "Entity connections"]
        ))

        self.register(RAGStrategy(
            name="Balanced Trimodal",
            description="Equal weight across all three search modalities.",
            strategy_type=RAGStrategyType.BALANCED_TRIMODAL,
            fusion_weights=FusionWeights(vector=0.34, keyword=0.33, graph=0.33),
            top_k=15,
            similarity_threshold=0.65,
            context_window_tokens=8000,
            enable_graph_search=True,
            enable_keyword_search=True,
            use_cases=["A/B testing baseline", "Balanced retrieval", "Strategy comparison"]
        ))

    def register(self, strategy: RAGStrategy):
        """Register a strategy"""
        self._strategies[strategy.strategy_type] = strategy
        logger.debug(
            "strategy_registered",
            name=strategy.name,
            type=strategy.strategy_type.value
        )

    def get_strategy(self, strategy_type: RAGStrategyType) -> RAGStrategy:
        """Get strategy by type"""
        if strategy_type not in self._strategies:
            logger.warning(
                "strategy_not_found_using_default",
                requested=strategy_type.value
            )
            return self._strategies[RAGStrategyType.SEMANTIC_STANDARD]
        return self._strategies[strategy_type]

    def list_strategies(self) -> List[RAGStrategy]:
        """List all registered strategies"""
        return list(self._strategies.values())

    def get_strategy_for_query_type(self, query_type: str) -> RAGStrategy:
        """
        Get recommended strategy based on query type

        Args:
            query_type: One of 'regulatory', 'clinical', 'research', 'startup', 'general'
        """
        mapping = {
            "regulatory": RAGStrategyType.REGULATORY_PRECISION,
            "clinical": RAGStrategyType.CLINICAL_EVIDENCE,
            "research": RAGStrategyType.RESEARCH_COMPREHENSIVE,
            "startup": RAGStrategyType.STARTUP_ADVISORY,
            "general": RAGStrategyType.HYBRID_ENHANCED,
            "relationship": RAGStrategyType.GRAPH_CENTRIC,
            "exact": RAGStrategyType.KEYWORD_DOMINANT,
        }
        strategy_type = mapping.get(query_type.lower(), RAGStrategyType.SEMANTIC_STANDARD)
        return self.get_strategy(strategy_type)


# Singleton instance
_registry: Optional[StrategyRegistry] = None


def get_strategy_registry() -> StrategyRegistry:
    """Get or create strategy registry singleton"""
    global _registry

    if _registry is None:
        _registry = StrategyRegistry()
        logger.info(
            "strategy_registry_initialized",
            strategy_count=len(_registry._strategies)
        )

    return _registry


# ============================================================================
# Strategy Utilities
# ============================================================================

def get_strategy_comparison_matrix() -> Dict[str, Dict]:
    """
    Generate a comparison matrix of all strategies
    Useful for documentation and selection guidance
    """
    registry = get_strategy_registry()
    matrix = {}

    for strategy in registry.list_strategies():
        weights = strategy.get_normalized_weights()
        matrix[strategy.strategy_type.value] = {
            "name": strategy.name,
            "description": strategy.description,
            "vector_weight": round(weights.vector, 2),
            "keyword_weight": round(weights.keyword, 2),
            "graph_weight": round(weights.graph, 2),
            "top_k": strategy.top_k,
            "threshold": strategy.similarity_threshold,
            "context_tokens": strategy.context_window_tokens,
            "graph_enabled": strategy.enable_graph_search,
            "keyword_enabled": strategy.enable_keyword_search,
            "rerank_enabled": strategy.rerank_config.enabled,
            "authority_boost": strategy.authority_config.enabled,
            "use_cases": strategy.use_cases,
        }

    return matrix
