"""
Modes 3/4 LangGraph scaffolding with World-Class Deep Research Enhancements.

Core Features:
- wrap existing L1-L5 agents with LangGraph subgraphs
- State management for mission execution
- Agent selection for Mode 4 auto-selection

Phase 1 Enhancements (World-Class Deep Research):
1. Iterative Refinement Loop - confidence gate with re-search capability
2. Query Decomposition System - break complex queries into sub-queries
3. Confidence Scoring System - 5-dimensional confidence assessment
4. Citation Verification Node - validate via PubMed/CrossRef/DOI
5. Quality Gate - RACE/FACT metrics for structured response quality

Phase 2 Enhancement (Reflexion Pattern):
6. Self-Reflection Node - agent reviews own reasoning across 5 dimensions
   - Reasoning Validity (30%), Completeness (25%), Assumption Check (15%),
     Bias Awareness (15%), Uncertainty Honesty (15%)
   - Multi-iteration improvement with MAX_REFLECTION_ITERATIONS=2

Reference: MODE_3_4_COMPLETE_FIX_PLAN_PART_II.md
"""

from .state import MissionState, PlanStep, MissionStatus, PlanStepStatus
from .unified_autonomous_workflow import (
    build_master_graph,
    # Production Hardening Exports
    stream_mission_events,
    resume_mission_with_input,
    create_hitl_checkpoint_node,
    POSTGRES_AVAILABLE,
    INTERRUPT_AVAILABLE,
)
from .agent_selector import (
    select_team,
    select_team_async,
    select_team_graphrag,
    select_team_hybrid,
    GRAPHRAG_AVAILABLE,
    HYBRID_SEARCH_AVAILABLE,
)

# Phase 1 Research Quality Enhancements
from .research_quality import (
    # Enhancement 1: Iterative Refinement
    check_confidence_gate,
    RefinementResult,
    CONFIDENCE_THRESHOLD,
    MAX_REFINEMENT_ITERATIONS,
    # Enhancement 2: Query Decomposition
    decompose_query,
    DecomposedQuery,
    # Enhancement 3: Confidence Scoring
    calculate_confidence_scores,
    ConfidenceScores,
    ConfidenceDimension,
    # Enhancement 4: Citation Verification
    verify_citations,
    CitationVerification,
    VerificationSummary,
    # Enhancement 5: Quality Gate
    assess_quality,
    QualityMetrics,
    QualityGateResult,
    QUALITY_THRESHOLD,
    # Enhancement 6: Self-Reflection (Phase 2)
    check_reflection_gate,
    perform_self_reflection,
    ReflectionDimension,
    ReflectionPoint,
    SelfReflection,
    ReflectionResult,
    REFLECTION_THRESHOLD,
    MAX_REFLECTION_ITERATIONS,
)

__all__ = [
    # Core
    "MissionState",
    "PlanStep",
    "MissionStatus",
    "PlanStepStatus",
    "build_master_graph",
    # Agent Selection (Phase 2)
    "select_team",
    "select_team_async",
    "select_team_graphrag",
    "select_team_hybrid",
    "GRAPHRAG_AVAILABLE",
    "HYBRID_SEARCH_AVAILABLE",
    # Enhancement 1: Iterative Refinement
    "check_confidence_gate",
    "RefinementResult",
    "CONFIDENCE_THRESHOLD",
    "MAX_REFINEMENT_ITERATIONS",
    # Enhancement 2: Query Decomposition
    "decompose_query",
    "DecomposedQuery",
    # Enhancement 3: Confidence Scoring
    "calculate_confidence_scores",
    "ConfidenceScores",
    "ConfidenceDimension",
    # Enhancement 4: Citation Verification
    "verify_citations",
    "CitationVerification",
    "VerificationSummary",
    # Enhancement 5: Quality Gate
    "assess_quality",
    "QualityMetrics",
    "QualityGateResult",
    "QUALITY_THRESHOLD",
    # Enhancement 6: Self-Reflection (Phase 2)
    "check_reflection_gate",
    "perform_self_reflection",
    "ReflectionDimension",
    "ReflectionPoint",
    "SelfReflection",
    "ReflectionResult",
    "REFLECTION_THRESHOLD",
    "MAX_REFLECTION_ITERATIONS",
    # Production Hardening (Phase 3)
    "stream_mission_events",
    "resume_mission_with_input",
    "create_hitl_checkpoint_node",
    "POSTGRES_AVAILABLE",
    "INTERRUPT_AVAILABLE",
]
