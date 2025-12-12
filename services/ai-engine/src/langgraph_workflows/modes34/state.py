from __future__ import annotations

from typing import Any, Dict, List, Optional, TypedDict
from typing_extensions import Literal


MissionStatus = Literal["idle", "planning", "running", "awaiting_checkpoint", "refining", "verifying", "completed", "failed"]
PlanStepStatus = Literal["pending", "running", "completed", "failed", "refining"]


class PlanStep(TypedDict, total=False):
    id: str
    name: str
    description: str
    agent: str
    stage: str
    tools: List[str]
    runner: Optional[str]
    status: PlanStepStatus
    started_at: Optional[str]
    completed_at: Optional[str]


class MissionState(TypedDict, total=False):
    """Mission state for Modes 3/4 with Phase 1 World-Class Research Enhancements."""

    # === Core Mission Fields ===
    mission_id: str
    mode: int  # 3 or 4
    goal: str
    template_id: Optional[str]
    template_family: Optional[str]          # Template family (e.g., "RESEARCH")
    template_cat: Optional[str]             # Template category (e.g., "Evidence")
    template_checkpoints: List[Dict[str, Any]]  # Checkpoints from template
    template_outputs: List[Dict[str, Any]]      # Expected outputs from template (Gap 5)
    tenant_id: Optional[str]
    user_id: Optional[str]
    selected_agent: Optional[str]           # Mode 3: user-selected
    selected_team: List[str]                # Mode 4: auto-selected
    status: MissionStatus
    plan: List[PlanStep]
    artifacts: List[Dict[str, Any]]
    checkpoints: List[Dict[str, Any]]
    ui_updates: List[Dict[str, Any]]
    checkpoint_pending: Optional[Dict[str, Any]]
    checkpoint_resolved: bool
    preflight: Dict[str, Any]
    current_step: int
    total_steps: int
    pending_checkpoint: Optional[Dict[str, Any]]
    human_response: Optional[Dict[str, Any]]
    budget_limit: Optional[float]
    current_cost: Optional[float]
    quality_checks: int
    final_output: Optional[Dict[str, Any]]      # Final synthesized output
    output_validation: Optional[Dict[str, Any]] # Output validation result (Gap 5)

    # === Phase 1 Enhancement 1: Iterative Refinement Loop ===
    refinement_iteration: int                    # Current refinement iteration (0-indexed)
    max_refinement_iterations: int               # Max iterations before accepting (default: 3)
    refinement_history: List[Dict[str, Any]]     # History of refinement attempts
    evidence_gaps: List[str]                     # Identified evidence gaps
    refined_queries: List[str]                   # Improved queries generated

    # === Phase 1 Enhancement 2: Query Decomposition ===
    original_query: str                          # Original unmodified query
    decomposed_queries: List[str]                # Sub-queries for parallel search
    query_complexity: float                      # 0-1 complexity score
    search_strategy: str                         # "parallel", "sequential", "hierarchical"

    # === Phase 1 Enhancement 3: Confidence Scoring (5 Dimensions) ===
    confidence_scores: Dict[str, float]          # Per-dimension scores
    overall_confidence: float                    # Weighted average (0-1)
    confidence_threshold: float                  # Minimum acceptable (default: 0.80)

    # === Phase 1 Enhancement 4: Citation Verification ===
    verified_citations: List[Dict[str, Any]]     # Verified citation records
    unverified_citations: List[Dict[str, Any]]   # Failed verification
    citation_verification_rate: float            # Ratio of verified citations

    # === Phase 1 Enhancement 5: Quality Gate (RACE/FACT) ===
    quality_metrics: Dict[str, Any]              # RACE/FACT metric scores
    race_score: float                            # RACE average (0-1)
    fact_score: float                            # FACT average (0-1)
    overall_quality: float                       # Combined quality score
    quality_passed: bool                         # Whether quality gate passed
    quality_recommendations: List[str]           # Improvement suggestions
