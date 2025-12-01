"""
GraphRAG package for VITAL Platform
Implements hybrid search combining vector, keyword, and graph modalities

Features:
- Semantic vector search (OpenAI + Pinecone/pgvector)
- Keyword search (Elasticsearch BM25)
- Knowledge graph traversal (Neo4j)
- Hybrid fusion with Reciprocal Rank Fusion (RRF)
- Evidence chains with citations
- Agent-specific RAG profiles and KG views
- Configurable RAG strategies (11 pre-configured)
- Source authority boosting
- A/B testing and evaluation harness

Usage:
    from graphrag import get_graphrag_service

    service = await get_graphrag_service()
    response = await service.query(request)

Strategy Usage:
    from graphrag.strategies import get_strategy_registry, RAGStrategyType

    registry = get_strategy_registry()
    strategy = registry.get_strategy(RAGStrategyType.CLINICAL_EVIDENCE)

Agent Profiles:
    from graphrag.agent_profiles import get_agent_profile

    profile = get_agent_profile("regulatory_expert")

Evaluation:
    from graphrag.evaluation import get_evaluation_harness

    harness = get_evaluation_harness(graphrag_service)
    result = await harness.ab_test(strategy_a, strategy_b, agent_id, session_id)
"""

from .service import GraphRAGService, get_graphrag_service
from .models import (
    GraphRAGRequest,
    GraphRAGResponse,
    GraphRAGMetadata,
    ContextChunk,
    EvidenceNode,
    FusionWeights,
    RAGProfile,
    AgentKGView
)
from .api import router as graphrag_router
from .source_authority_booster import SourceAuthorityBooster, get_source_authority_booster
from .citation_enricher import (
    CitationEnricher,
    CitationData,
    CitationStyle,
    WebCitationData,
    format_web_citations,
    get_citation_enricher
)
from .strategies import (
    RAGStrategy,
    RAGStrategyType,
    ChunkStrategy,
    ChunkConfig,
    RerankModel,
    get_strategy,
    get_strategy_registry,
    get_strategy_comparison_matrix
)
from .chunking_service import (
    ChunkingService,
    Chunk,
    get_chunking_service,
    chunk_for_standard,
    chunk_for_precision,
    chunk_for_context
)
from .agent_profiles import (
    AgentRAGProfile,
    VITALAgentProfiles,
    get_vital_agent_profiles,
    get_agent_profile
)
from .evaluation import (
    RAGEvaluationHarness,
    MetricsCalculator,
    EvaluationQuery,
    EvaluationResult,
    StrategyEvaluationSummary,
    ABTestResult,
    get_evaluation_harness,
    get_sample_evaluation_queries
)
from .intelligence_broker import (
    IntelligenceBroker,
    BrokerQuery,
    BrokerResponse,
    ServiceMode,
    QueryComplexity,
    OntologyContext,
    get_intelligence_broker,
    broker_query
)

__all__ = [
    # Core Service
    'GraphRAGService',
    'get_graphrag_service',

    # Models
    'GraphRAGRequest',
    'GraphRAGResponse',
    'GraphRAGMetadata',
    'ContextChunk',
    'EvidenceNode',
    'FusionWeights',
    'RAGProfile',
    'AgentKGView',

    # API
    'graphrag_router',

    # Authority
    'SourceAuthorityBooster',
    'get_source_authority_booster',

    # Citation Enrichment
    'CitationEnricher',
    'CitationData',
    'CitationStyle',
    'WebCitationData',
    'format_web_citations',
    'get_citation_enricher',

    # Strategies
    'RAGStrategy',
    'RAGStrategyType',
    'ChunkStrategy',
    'ChunkConfig',
    'RerankModel',
    'get_strategy',
    'get_strategy_registry',
    'get_strategy_comparison_matrix',

    # Chunking
    'ChunkingService',
    'Chunk',
    'get_chunking_service',
    'chunk_for_standard',
    'chunk_for_precision',
    'chunk_for_context',

    # Agent Profiles
    'AgentRAGProfile',
    'VITALAgentProfiles',
    'get_vital_agent_profiles',
    'get_agent_profile',

    # Evaluation
    'RAGEvaluationHarness',
    'MetricsCalculator',
    'EvaluationQuery',
    'EvaluationResult',
    'StrategyEvaluationSummary',
    'ABTestResult',
    'get_evaluation_harness',
    'get_sample_evaluation_queries',

    # Intelligence Broker (Unified Query Interface)
    'IntelligenceBroker',
    'BrokerQuery',
    'BrokerResponse',
    'ServiceMode',
    'QueryComplexity',
    'OntologyContext',
    'get_intelligence_broker',
    'broker_query'
]

__version__ = '2.1.0'  # Updated for Intelligence Broker

