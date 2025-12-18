"""
Agent Management Services

Agent lifecycle, orchestration, and selection services.

Components:
- Agent orchestration and hierarchy
- Agent instantiation and pooling
- Agent selection (hybrid, medical affairs)
- Usage tracking and analytics
- Skills and recommendation services
"""

from .agent_orchestrator import AgentOrchestrator
from .agent_hierarchy_service import AgentHierarchyService
from .agent_instantiation_service import AgentInstantiationService
from .agent_pool_manager import AgentPoolManager
from .agent_service import AgentService
from .agent_usage_tracker import AgentUsageTracker
from .agent_db_skills_service import AgentDBSkillsService
from .agent_enrichment_service import AgentEnrichmentService
from .unified_agent_loader import UnifiedAgentLoader
from .sub_agent_spawner import SubAgentSpawner
from .hybrid_agent_search import HybridAgentSearch
from .medical_affairs_agent_selector import MedicalAffairsAgentSelector
from .recommendation_engine import RecommendationEngine

__all__ = [
    "AgentOrchestrator",
    "AgentHierarchyService",
    "AgentInstantiationService",
    "AgentPoolManager",
    "AgentService",
    "AgentUsageTracker",
    "AgentDBSkillsService",
    "AgentEnrichmentService",
    "UnifiedAgentLoader",
    "SubAgentSpawner",
    "HybridAgentSearch",
    "MedicalAffairsAgentSelector",
    "RecommendationEngine",
]
