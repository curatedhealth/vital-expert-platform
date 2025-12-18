"""
VITAL Enterprise Ontology Module

8-layer semantic architecture for AI-driven healthcare platform.

Layers (O-Series per VITAL_PLATFORM_TAXONOMY.md):
    O0: Domain Knowledge - RAG references, therapeutic areas, evidence types
    O1: Organization - Functions, departments, roles, teams
    O2: Process - Workflow templates, stages, tasks
    O3: JTBD - Jobs-to-be-done, pain points, outcomes
    O4: Agents - Agent registry, JTBD mapping, orchestration
    O5: Execution - Mission management, task runners
    O6: Analytics - Session metrics, performance, quality
    O7: Value - VPANES scoring, ODI, ROI analysis

Usage:
    from ontology import OntologyResolver

    resolver = OntologyResolver(supabase_client, tenant_id)
    context = await resolver.resolve_context(query="...")
"""

from .resolver import OntologyResolver, ResolvedOntologyContext
from .base import OntologyLayerService, OntologyContext

# JTBD-Runner Mapping Service
from .jtbd_runner_service import (
    JTBDRunnerService,
    JTBDLevel,
    JobStep,
    RunnerType,
    AIIntervention,
    RunnerMapping,
    FamilyRunnerInfo,
    JTBDRunnerContext,
    get_runner_for_template,
    get_job_step_runner,
    detect_level_from_query,
)

# Layer Services (O-prefix directories)
from .o0_domain import L0DomainService
from .o1_organization import L1OrganizationService
from .o2_process import L2ProcessService
from .o3_jtbd import L3JTBDService
from .o4_agents import L4AgentService
from .o5_execution import L5ExecutionService
from .o6_analytics import L6AnalyticsService
from .o7_value import L7ValueService

__all__ = [
    # Core
    "OntologyResolver",
    "ResolvedOntologyContext",
    "OntologyLayerService",
    "OntologyContext",
    # JTBD-Runner Mapping
    "JTBDRunnerService",
    "JTBDLevel",
    "JobStep",
    "RunnerType",
    "AIIntervention",
    "RunnerMapping",
    "FamilyRunnerInfo",
    "JTBDRunnerContext",
    "get_runner_for_template",
    "get_job_step_runner",
    "detect_level_from_query",
    # Layer Services
    "L0DomainService",
    "L1OrganizationService",
    "L2ProcessService",
    "L3JTBDService",
    "L4AgentService",
    "L5ExecutionService",
    "L6AnalyticsService",
    "L7ValueService",
]

__version__ = "1.0.0"
