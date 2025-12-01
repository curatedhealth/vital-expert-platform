"""
Agent-Specific RAG Profiles
Pre-configured RAG settings for VITAL advisory board agents
"""

from typing import Dict, Optional, List
from uuid import UUID
from dataclasses import dataclass, field
import structlog

from .strategies import (
    RAGStrategy,
    RAGStrategyType,
    ChunkConfig,
    ChunkStrategy,
    AuthorityConfig,
    RerankConfig,
    RerankModel,
    get_strategy_registry
)
from .models import FusionWeights, AgentKGView

logger = structlog.get_logger()


# ============================================================================
# Agent Profile Definitions
# ============================================================================

@dataclass
class AgentRAGProfile:
    """
    Complete RAG profile for a VITAL agent

    Each agent has a tailored RAG configuration based on their domain expertise
    """
    agent_name: str
    agent_code: str  # e.g., "regulatory_expert", "clinical_advisor"
    description: str
    strategy: RAGStrategy

    # Knowledge graph view constraints
    kg_view: Optional[AgentKGView] = None

    # Domain focus
    primary_domains: List[str] = field(default_factory=list)
    excluded_domains: List[str] = field(default_factory=list)

    # Metadata
    is_active: bool = True


# ============================================================================
# VITAL Advisory Board Agent Profiles
# ============================================================================

class VITALAgentProfiles:
    """
    Pre-configured RAG profiles for VITAL advisory board agents

    Agents:
    1. Regulatory Expert - FDA, HIPAA, compliance focus
    2. Clinical Advisor - Evidence-based medicine, clinical trials
    3. Business Strategist - Market entry, funding, growth
    4. Technical Architect - Systems design, interoperability
    5. User Experience Lead - Design, accessibility, engagement
    6. Data Science Expert - Analytics, ML/AI, insights
    7. Legal Counsel - IP, contracts, liability
    8. Operations Manager - Implementation, workflow, scaling
    """

    def __init__(self):
        self._profiles: Dict[str, AgentRAGProfile] = {}
        self._initialize_profiles()

    def _initialize_profiles(self):
        """Initialize all agent profiles"""
        registry = get_strategy_registry()

        # ========== REGULATORY EXPERT ==========
        self.register(AgentRAGProfile(
            agent_name="Regulatory Expert",
            agent_code="regulatory_expert",
            description="Specializes in FDA regulations, HIPAA compliance, and digital health regulatory pathways",
            strategy=RAGStrategy(
                name="Regulatory Expert Profile",
                description="High-precision regulatory document retrieval",
                strategy_type=RAGStrategyType.REGULATORY_PRECISION,
                fusion_weights=FusionWeights(vector=0.3, keyword=0.6, graph=0.1),
                top_k=8,
                similarity_threshold=0.8,
                context_window_tokens=6000,
                chunk_config=ChunkConfig.granular(),  # 500/100 for precision
                authority_config=AuthorityConfig(
                    enabled=True,
                    boost_factor=1.0,
                    type_multipliers={
                        "regulatory": 1.0,
                        "guideline": 0.95,
                        "peer_review": 0.85,
                        "textbook": 0.80,
                        "white_paper": 0.70,
                        "blog": 0.30
                    }
                ),
                rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
                enable_graph_search=True,
                enable_keyword_search=True,
                citation_required=True,
                use_cases=["FDA submissions", "HIPAA compliance", "Device classification"]
            ),
            primary_domains=["Regulations & Compliance", "Digital Health Foundations"],
            kg_view=AgentKGView(
                id=UUID('00000000-0000-0000-0001-000000000001'),
                agent_id=UUID('00000000-0000-0000-0001-000000000001'),
                include_nodes=["Regulation", "Guideline", "Agency", "Requirement"],
                include_edges=["REGULATES", "REQUIRES", "SUPERSEDES"],
                max_hops=2,
                graph_limit=30
            )
        ))

        # ========== CLINICAL ADVISOR ==========
        self.register(AgentRAGProfile(
            agent_name="Clinical Advisor",
            agent_code="clinical_advisor",
            description="Evidence-based medicine expert, clinical trial design, therapeutic validation",
            strategy=RAGStrategy(
                name="Clinical Advisor Profile",
                description="Evidence-focused clinical document retrieval",
                strategy_type=RAGStrategyType.CLINICAL_EVIDENCE,
                fusion_weights=FusionWeights(vector=0.45, keyword=0.35, graph=0.2),
                top_k=15,
                similarity_threshold=0.7,
                context_window_tokens=12000,
                chunk_config=ChunkConfig.contextual(),  # 2000/400 for clinical context
                authority_config=AuthorityConfig(
                    enabled=True,
                    boost_factor=1.0,
                    type_multipliers={
                        "peer_review": 1.0,
                        "guideline": 0.98,
                        "case_study": 0.90,
                        "textbook": 0.85,
                        "regulatory": 0.80,
                        "white_paper": 0.75,
                        "blog": 0.40
                    }
                ),
                rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
                enable_graph_search=True,
                enable_keyword_search=True,
                entity_extraction=True,
                citation_required=True,
                use_cases=["Clinical evidence", "Trial design", "Therapeutic protocols"]
            ),
            primary_domains=["Clinical Research", "Digital Health", "Use Cases & Best Practices"],
            kg_view=AgentKGView(
                id=UUID('00000000-0000-0000-0001-000000000002'),
                agent_id=UUID('00000000-0000-0000-0001-000000000002'),
                include_nodes=["Study", "Treatment", "Outcome", "Condition", "Drug"],
                include_edges=["TREATS", "CAUSES", "PREVENTS", "STUDIES"],
                max_hops=3,
                graph_limit=50
            )
        ))

        # ========== BUSINESS STRATEGIST ==========
        self.register(AgentRAGProfile(
            agent_name="Business Strategist",
            agent_code="business_strategist",
            description="Market entry, funding strategies, competitive analysis, go-to-market",
            strategy=RAGStrategy(
                name="Business Strategist Profile",
                description="Market-focused business intelligence retrieval",
                strategy_type=RAGStrategyType.STARTUP_ADVISORY,
                fusion_weights=FusionWeights(vector=0.5, keyword=0.3, graph=0.2),
                top_k=12,
                similarity_threshold=0.65,
                context_window_tokens=10000,
                chunk_config=ChunkConfig.standard(),
                authority_config=AuthorityConfig(
                    enabled=True,
                    boost_factor=0.8,
                    type_multipliers={
                        "case_study": 1.0,
                        "white_paper": 0.95,
                        "regulatory": 0.90,
                        "guideline": 0.85,
                        "blog": 0.70,  # More tolerant of industry commentary
                        "peer_review": 0.80
                    }
                ),
                rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
                enable_graph_search=True,
                enable_keyword_search=True,
                use_cases=["Market analysis", "Funding strategy", "Business models"]
            ),
            primary_domains=["Startups", "Digital Health", "Use Cases & Best Practices"],
            kg_view=AgentKGView(
                id=UUID('00000000-0000-0000-0001-000000000003'),
                agent_id=UUID('00000000-0000-0000-0001-000000000003'),
                include_nodes=["Company", "Market", "Funding", "Strategy", "Partner"],
                include_edges=["COMPETES_WITH", "PARTNERS_WITH", "TARGETS", "FUNDS"],
                max_hops=2,
                graph_limit=40
            )
        ))

        # ========== TECHNICAL ARCHITECT ==========
        self.register(AgentRAGProfile(
            agent_name="Technical Architect",
            agent_code="technical_architect",
            description="Systems design, FHIR/HL7, interoperability, security architecture",
            strategy=RAGStrategy(
                name="Technical Architect Profile",
                description="Technical documentation and standards retrieval",
                strategy_type=RAGStrategyType.HYBRID_ENHANCED,
                fusion_weights=FusionWeights(vector=0.5, keyword=0.4, graph=0.1),
                top_k=15,
                similarity_threshold=0.7,
                context_window_tokens=8000,
                chunk_config=ChunkConfig.standard(),
                authority_config=AuthorityConfig(
                    enabled=True,
                    boost_factor=0.9,
                    type_multipliers={
                        "technical_spec": 1.0,
                        "guideline": 0.95,
                        "regulatory": 0.90,
                        "white_paper": 0.85,
                        "peer_review": 0.80,
                        "blog": 0.50
                    }
                ),
                rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
                enable_graph_search=True,
                enable_keyword_search=True,
                use_cases=["Architecture design", "Interoperability", "Security"]
            ),
            primary_domains=["Digital Health Foundations", "Technical Standards"],
            kg_view=AgentKGView(
                id=UUID('00000000-0000-0000-0001-000000000004'),
                agent_id=UUID('00000000-0000-0000-0001-000000000004'),
                include_nodes=["System", "Standard", "Protocol", "API", "Integration"],
                include_edges=["INTEGRATES_WITH", "IMPLEMENTS", "REQUIRES", "EXTENDS"],
                max_hops=3,
                graph_limit=60
            )
        ))

        # ========== USER EXPERIENCE LEAD ==========
        self.register(AgentRAGProfile(
            agent_name="User Experience Lead",
            agent_code="ux_lead",
            description="User research, accessibility, engagement design, behavioral health UX",
            strategy=RAGStrategy(
                name="UX Lead Profile",
                description="User-centered design and research retrieval",
                strategy_type=RAGStrategyType.RESEARCH_COMPREHENSIVE,
                fusion_weights=FusionWeights(vector=0.55, keyword=0.25, graph=0.2),
                top_k=20,
                similarity_threshold=0.6,
                context_window_tokens=8000,
                chunk_config=ChunkConfig.standard(),
                authority_config=AuthorityConfig(
                    enabled=True,
                    boost_factor=0.7,
                    type_multipliers={
                        "case_study": 1.0,
                        "guideline": 0.90,
                        "peer_review": 0.85,
                        "white_paper": 0.85,
                        "blog": 0.75  # UX insights often in blogs
                    }
                ),
                rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
                enable_graph_search=True,
                enable_keyword_search=True,
                query_expansion=True,
                use_cases=["User research", "Accessibility", "Engagement patterns"]
            ),
            primary_domains=["Design Thinking", "Digital Health", "Use Cases & Best Practices"],
            kg_view=AgentKGView(
                id=UUID('00000000-0000-0000-0001-000000000005'),
                agent_id=UUID('00000000-0000-0000-0001-000000000005'),
                include_nodes=["User", "Feature", "Pattern", "Behavior", "Interface"],
                include_edges=["USES", "PREFERS", "IMPROVES", "AFFECTS"],
                max_hops=2,
                graph_limit=40
            )
        ))

        # ========== DATA SCIENCE EXPERT ==========
        self.register(AgentRAGProfile(
            agent_name="Data Science Expert",
            agent_code="data_scientist",
            description="Analytics, ML/AI validation, health data insights, predictive modeling",
            strategy=RAGStrategy(
                name="Data Science Expert Profile",
                description="Technical ML/AI and analytics retrieval",
                strategy_type=RAGStrategyType.GRAPHRAG_ENTITY,
                fusion_weights=FusionWeights(vector=0.45, keyword=0.25, graph=0.3),
                top_k=18,
                similarity_threshold=0.65,
                context_window_tokens=10000,
                chunk_config=ChunkConfig.contextual(),
                authority_config=AuthorityConfig(
                    enabled=True,
                    boost_factor=0.9,
                    type_multipliers={
                        "peer_review": 1.0,
                        "technical_spec": 0.95,
                        "regulatory": 0.90,  # FDA ML guidance
                        "white_paper": 0.85,
                        "guideline": 0.80,
                        "blog": 0.55
                    }
                ),
                rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
                enable_graph_search=True,
                enable_keyword_search=True,
                entity_extraction=True,
                use_cases=["ML validation", "Analytics design", "Data governance"]
            ),
            primary_domains=["Digital Health", "Technical Standards", "Clinical Research"],
            kg_view=AgentKGView(
                id=UUID('00000000-0000-0000-0001-000000000006'),
                agent_id=UUID('00000000-0000-0000-0001-000000000006'),
                include_nodes=["Model", "Algorithm", "Dataset", "Metric", "Feature"],
                include_edges=["TRAINS_ON", "PREDICTS", "VALIDATES", "USES"],
                max_hops=3,
                graph_limit=50
            )
        ))

        # ========== LEGAL COUNSEL ==========
        self.register(AgentRAGProfile(
            agent_name="Legal Counsel",
            agent_code="legal_counsel",
            description="IP strategy, contracts, liability, privacy law, international regulations",
            strategy=RAGStrategy(
                name="Legal Counsel Profile",
                description="Legal and contractual document retrieval",
                strategy_type=RAGStrategyType.REGULATORY_PRECISION,
                fusion_weights=FusionWeights(vector=0.25, keyword=0.65, graph=0.1),
                top_k=10,
                similarity_threshold=0.8,
                context_window_tokens=6000,
                chunk_config=ChunkConfig.granular(),
                authority_config=AuthorityConfig(
                    enabled=True,
                    boost_factor=1.0,
                    type_multipliers={
                        "regulatory": 1.0,
                        "guideline": 0.95,
                        "legal_precedent": 0.95,
                        "peer_review": 0.75,
                        "white_paper": 0.65,
                        "blog": 0.20
                    }
                ),
                rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
                enable_graph_search=True,
                enable_keyword_search=True,
                citation_required=True,
                use_cases=["Legal compliance", "IP protection", "Contract review"]
            ),
            primary_domains=["Regulations & Compliance", "Legal"],
            kg_view=AgentKGView(
                id=UUID('00000000-0000-0000-0001-000000000007'),
                agent_id=UUID('00000000-0000-0000-0001-000000000007'),
                include_nodes=["Law", "Regulation", "Requirement", "Right", "Obligation"],
                include_edges=["REQUIRES", "PROHIBITS", "GRANTS", "SUPERSEDES"],
                max_hops=2,
                graph_limit=30
            )
        ))

        # ========== OPERATIONS MANAGER ==========
        self.register(AgentRAGProfile(
            agent_name="Operations Manager",
            agent_code="operations_manager",
            description="Implementation, workflow optimization, scaling, operational excellence",
            strategy=RAGStrategy(
                name="Operations Manager Profile",
                description="Operational and implementation document retrieval",
                strategy_type=RAGStrategyType.HYBRID_ENHANCED,
                fusion_weights=FusionWeights(vector=0.45, keyword=0.35, graph=0.2),
                top_k=12,
                similarity_threshold=0.65,
                context_window_tokens=8000,
                chunk_config=ChunkConfig.standard(),
                authority_config=AuthorityConfig(
                    enabled=True,
                    boost_factor=0.8,
                    type_multipliers={
                        "case_study": 1.0,
                        "guideline": 0.95,
                        "white_paper": 0.90,
                        "peer_review": 0.80,
                        "regulatory": 0.85,
                        "blog": 0.65
                    }
                ),
                rerank_config=RerankConfig(enabled=True, model=RerankModel.COHERE_V3),
                enable_graph_search=True,
                enable_keyword_search=True,
                use_cases=["Implementation", "Workflow design", "Scaling strategy"]
            ),
            primary_domains=["Use Cases & Best Practices", "Change Management", "Digital Health"],
            kg_view=AgentKGView(
                id=UUID('00000000-0000-0000-0001-000000000008'),
                agent_id=UUID('00000000-0000-0000-0001-000000000008'),
                include_nodes=["Process", "Workflow", "System", "Team", "Metric"],
                include_edges=["IMPLEMENTS", "MEASURES", "OPTIMIZES", "DEPENDS_ON"],
                max_hops=2,
                graph_limit=40
            )
        ))

        logger.info(
            "vital_agent_profiles_initialized",
            profile_count=len(self._profiles)
        )

    def register(self, profile: AgentRAGProfile):
        """Register an agent profile"""
        self._profiles[profile.agent_code] = profile

    def get_profile(self, agent_code: str) -> Optional[AgentRAGProfile]:
        """Get agent profile by code"""
        return self._profiles.get(agent_code)

    def get_profile_by_name(self, agent_name: str) -> Optional[AgentRAGProfile]:
        """Get agent profile by name"""
        for profile in self._profiles.values():
            if profile.agent_name.lower() == agent_name.lower():
                return profile
        return None

    def list_profiles(self) -> List[AgentRAGProfile]:
        """List all agent profiles"""
        return list(self._profiles.values())

    def get_profile_summary(self) -> Dict[str, Dict]:
        """Get summary of all profiles"""
        summary = {}
        for code, profile in self._profiles.items():
            weights = profile.strategy.get_normalized_weights()
            summary[code] = {
                "name": profile.agent_name,
                "description": profile.description,
                "strategy_type": profile.strategy.strategy_type.value,
                "vector_weight": round(weights.vector, 2),
                "keyword_weight": round(weights.keyword, 2),
                "graph_weight": round(weights.graph, 2),
                "top_k": profile.strategy.top_k,
                "threshold": profile.strategy.similarity_threshold,
                "rerank_enabled": profile.strategy.rerank_config.enabled,
                "primary_domains": profile.primary_domains,
                "kg_nodes": profile.kg_view.include_nodes if profile.kg_view else []
            }
        return summary


# Singleton instance
_agent_profiles: Optional[VITALAgentProfiles] = None


def get_vital_agent_profiles() -> VITALAgentProfiles:
    """Get or create VITAL agent profiles singleton"""
    global _agent_profiles

    if _agent_profiles is None:
        _agent_profiles = VITALAgentProfiles()

    return _agent_profiles


# Convenience function
def get_agent_profile(agent_code: str) -> Optional[AgentRAGProfile]:
    """Get a specific agent's RAG profile"""
    profiles = get_vital_agent_profiles()
    return profiles.get_profile(agent_code)
