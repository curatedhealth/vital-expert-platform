"""
VITAL Platform Services - Business Logic Layer (Layer 4)

Organized into 8 service domains (distinct from Runners which are pure cognitive ops):

- consultation/ : Mode 1&2 Interactive Q&A (query classification, quality)
- task/         : Mode 3&4 Autonomous Research (evidence detection, multi-domain search)
- panel/        : Multi-expert consultation (consensus, comparison, debate)
- rag/          : Retrieval-Augmented Generation (GraphRAG, search, reranking)
- agents/       : Agent lifecycle management (orchestration, pooling, selection)
- workflows/    : Mission execution (autonomous, HITL, artifacts)
- workproducts/ : Business deliverables (compliance, ROI, A/B testing)
- shared/       : Cross-cutting utilities (DB clients, embedding, caching)

Services vs Runners:
- Runners = Pure cognitive functions (stateless, no dependencies)
- Services = Orchestration with DI (APIs, DB, state management)

Total: 90+ services organized into 8 domains

Usage:
    from services.consultation import QueryClassifier
    from services.task import EvidenceDetector, EvidenceBasedSelector
    from services.panel import PanelOrchestrator, AdvancedConsensusAnalyzer
    from services.rag import GraphRAGSelector, UnifiedRAGService
    from services.agents import AgentOrchestrator
    from services.workflows import MissionService
    from services.workproducts import ComplianceService
    from services.shared import LLMService, EmbeddingService
"""

# Re-export key services for convenience
from .shared import LLMService, EmbeddingService, SessionMemoryService

__all__ = [
    "LLMService",
    "EmbeddingService",
    "SessionMemoryService",
]

__version__ = "2.1.0"
