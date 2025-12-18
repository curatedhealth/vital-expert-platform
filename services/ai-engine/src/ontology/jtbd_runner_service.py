"""
JTBD-Runner Mapping Service

Maps Jobs-To-Be-Done (JTBD) to appropriate runners for each job step,
implementing the JTBD_RUNNER_MAPPING.md specification.

Key concepts:
- JTBD Levels: strategic, solution, workflow, task
- Job Steps: define, locate, prepare, confirm, execute, monitor, modify, conclude
- Runner Types: task, family, orchestrator, infrastructure
- AI Interventions: ASSIST, AUGMENT, AUTOMATE, ORCHESTRATE, REDESIGN
"""

from __future__ import annotations

from enum import Enum
from typing import Optional, Dict, Any, Type, List
from dataclasses import dataclass, field
from supabase import AsyncClient
import structlog

logger = structlog.get_logger()


# =====================================================
# Enums
# =====================================================

class JTBDLevel(str, Enum):
    """JTBD complexity/scope levels."""
    STRATEGIC = "strategic"  # L5: Multi-month initiatives
    SOLUTION = "solution"    # L4: Multi-week projects
    WORKFLOW = "workflow"    # L3: Multi-hour workflows
    TASK = "task"            # L1-L2: Minutes-to-hours tasks


class JobStep(str, Enum):
    """Ulwick's 8 universal job steps."""
    DEFINE = "define"      # Determine objectives and plan approach
    LOCATE = "locate"      # Gather items and information needed
    PREPARE = "prepare"    # Set up environment to do the job
    CONFIRM = "confirm"    # Verify ready to perform the job
    EXECUTE = "execute"    # Carry out the job
    MONITOR = "monitor"    # Verify job is being successfully executed
    MODIFY = "modify"      # Make alterations to improve execution
    CONCLUDE = "conclude"  # Finish the job or prepare for next


class RunnerType(str, Enum):
    """Types of runners."""
    TASK = "task"                  # Atomic cognitive operations
    FAMILY = "family"              # Complex multi-step workflows
    ORCHESTRATOR = "orchestrator"  # Coordinate other runners
    INFRASTRUCTURE = "infrastructure"  # System-level operations


class AIIntervention(str, Enum):
    """AI intervention levels."""
    ASSIST = "ASSIST"          # Human-led, AI supports
    AUGMENT = "AUGMENT"        # Human-led, AI enhances
    AUTOMATE = "AUTOMATE"      # AI-led, human approves
    ORCHESTRATE = "ORCHESTRATE"  # AI coordinates multiple agents
    REDESIGN = "REDESIGN"      # AI transforms the process


# =====================================================
# Data Classes
# =====================================================

@dataclass
class RunnerMapping:
    """A mapping from JTBD + JobStep to a specific runner."""
    runner_type: RunnerType
    runner_id: str
    runner_category: Optional[str] = None
    service_layer: Optional[str] = None
    ai_intervention: Optional[AIIntervention] = None
    is_default: bool = True
    configuration: Dict[str, Any] = field(default_factory=dict)
    reasoning_pattern: Optional[str] = None
    description: Optional[str] = None


@dataclass
class FamilyRunnerInfo:
    """Information about a family runner."""
    runner_class: str
    runner_id: str
    reasoning_pattern: str
    use_case: Optional[str] = None


@dataclass
class JTBDRunnerContext:
    """Full runner context for a JTBD."""
    jtbd_id: Optional[str]
    jtbd_level: JTBDLevel
    mappings: Dict[JobStep, RunnerMapping] = field(default_factory=dict)
    family_runner: Optional[FamilyRunnerInfo] = None
    confidence: float = 1.0


# =====================================================
# Default Mappings (in-memory fallback)
# =====================================================

DEFAULT_STRATEGIC_MAPPINGS: Dict[JobStep, RunnerMapping] = {
    JobStep.DEFINE: RunnerMapping(
        RunnerType.TASK, "frame_runner", "DECIDE", "L5", AIIntervention.REDESIGN,
        reasoning_pattern="Strategic framing"
    ),
    JobStep.LOCATE: RunnerMapping(
        RunnerType.TASK, "explore_runner", "UNDERSTAND", "L5", AIIntervention.REDESIGN,
        reasoning_pattern="Market exploration"
    ),
    JobStep.PREPARE: RunnerMapping(
        RunnerType.TASK, "schedule_runner", "PLAN", "L5", AIIntervention.REDESIGN,
        reasoning_pattern="Roadmap planning"
    ),
    JobStep.CONFIRM: RunnerMapping(
        RunnerType.TASK, "alignment_runner", "ALIGN", "L5", AIIntervention.REDESIGN,
        reasoning_pattern="Stakeholder alignment"
    ),
    JobStep.EXECUTE: RunnerMapping(
        RunnerType.ORCHESTRATOR, "solution_orchestrator", None, "L5", AIIntervention.REDESIGN,
        reasoning_pattern="Solution orchestration"
    ),
    JobStep.MONITOR: RunnerMapping(
        RunnerType.TASK, "trend_runner", "WATCH", "L5", AIIntervention.REDESIGN,
        reasoning_pattern="Trend monitoring"
    ),
    JobStep.MODIFY: RunnerMapping(
        RunnerType.TASK, "pivot_runner", "ADAPT", "L5", AIIntervention.REDESIGN,
        reasoning_pattern="Strategic pivot"
    ),
    JobStep.CONCLUDE: RunnerMapping(
        RunnerType.TASK, "narrate_runner", "SYNTHESIZE", "L5", AIIntervention.REDESIGN,
        reasoning_pattern="Strategic narrative"
    ),
}

DEFAULT_SOLUTION_MAPPINGS: Dict[JobStep, RunnerMapping] = {
    JobStep.DEFINE: RunnerMapping(
        RunnerType.TASK, "frame_runner", "DECIDE", "L4", AIIntervention.ORCHESTRATE,
        reasoning_pattern="Solution scoping"
    ),
    JobStep.LOCATE: RunnerMapping(
        RunnerType.TASK, "extract_runner", "UNDERSTAND", "L4", AIIntervention.ORCHESTRATE,
        reasoning_pattern="Requirements gathering"
    ),
    JobStep.PREPARE: RunnerMapping(
        RunnerType.TASK, "dependency_runner", "PLAN", "L4", AIIntervention.ORCHESTRATE,
        reasoning_pattern="Dependency mapping"
    ),
    JobStep.CONFIRM: RunnerMapping(
        RunnerType.TASK, "consistency_check_runner", "VALIDATE", "L4", AIIntervention.ORCHESTRATE,
        reasoning_pattern="Consistency validation"
    ),
    JobStep.EXECUTE: RunnerMapping(
        RunnerType.ORCHESTRATOR, "workflow_orchestrator", None, "L4", AIIntervention.ORCHESTRATE,
        reasoning_pattern="Workflow orchestration"
    ),
    JobStep.MONITOR: RunnerMapping(
        RunnerType.TASK, "baseline_runner", "WATCH", "L4", AIIntervention.ORCHESTRATE,
        reasoning_pattern="Baseline tracking"
    ),
    JobStep.MODIFY: RunnerMapping(
        RunnerType.TASK, "mutate_runner", "REFINE", "L4", AIIntervention.ORCHESTRATE,
        reasoning_pattern="Solution refinement"
    ),
    JobStep.CONCLUDE: RunnerMapping(
        RunnerType.TASK, "collect_runner", "SYNTHESIZE", "L4", AIIntervention.ORCHESTRATE,
        reasoning_pattern="Integration"
    ),
}

DEFAULT_WORKFLOW_MAPPINGS: Dict[JobStep, RunnerMapping] = {
    JobStep.DEFINE: RunnerMapping(
        RunnerType.TASK, "decompose_runner", "PLAN", "L3", AIIntervention.AUTOMATE,
        reasoning_pattern="Goal decomposition"
    ),
    JobStep.LOCATE: RunnerMapping(
        RunnerType.INFRASTRUCTURE, "knowledge_retriever", None, "L3", AIIntervention.AUTOMATE,
        reasoning_pattern="RAG retrieval"
    ),
    JobStep.PREPARE: RunnerMapping(
        RunnerType.TASK, "decompose_runner", "PLAN", "L3", AIIntervention.AUTOMATE,
        reasoning_pattern="Task planning"
    ),
    JobStep.CONFIRM: RunnerMapping(
        RunnerType.TASK, "fact_check_runner", "VALIDATE", "L3", AIIntervention.AUTOMATE,
        reasoning_pattern="Readiness validation"
    ),
    JobStep.EXECUTE: RunnerMapping(
        RunnerType.FAMILY, "generic_runner", None, "L3", AIIntervention.AUTOMATE,
        reasoning_pattern="Family execution"
    ),
    JobStep.MONITOR: RunnerMapping(
        RunnerType.TASK, "delta_runner", "WATCH", "L3", AIIntervention.AUTOMATE,
        reasoning_pattern="Progress tracking"
    ),
    JobStep.MODIFY: RunnerMapping(
        RunnerType.TASK, "critic_runner", "REFINE", "L3", AIIntervention.AUTOMATE,
        reasoning_pattern="Output refinement"
    ),
    JobStep.CONCLUDE: RunnerMapping(
        RunnerType.TASK, "narrate_runner", "SYNTHESIZE", "L3", AIIntervention.AUTOMATE,
        reasoning_pattern="Narrative synthesis"
    ),
}

DEFAULT_TASK_MAPPINGS: Dict[JobStep, RunnerMapping] = {
    JobStep.DEFINE: RunnerMapping(
        RunnerType.INFRASTRUCTURE, "input_validator", None, "L1", AIIntervention.AUGMENT,
        reasoning_pattern="Input validation"
    ),
    JobStep.LOCATE: RunnerMapping(
        RunnerType.INFRASTRUCTURE, "knowledge_injector", None, "L1", AIIntervention.AUGMENT,
        reasoning_pattern="Context injection"
    ),
    JobStep.PREPARE: RunnerMapping(
        RunnerType.INFRASTRUCTURE, "prompt_composer", None, "L1", AIIntervention.AUGMENT,
        reasoning_pattern="Prompt composition"
    ),
    JobStep.CONFIRM: RunnerMapping(
        RunnerType.INFRASTRUCTURE, "schema_validator", None, "L1", AIIntervention.AUGMENT,
        reasoning_pattern="Schema validation"
    ),
    JobStep.EXECUTE: RunnerMapping(
        RunnerType.TASK, "generic_task_runner", None, "L1", AIIntervention.AUGMENT,
        reasoning_pattern="Task execution"
    ),
    JobStep.CONCLUDE: RunnerMapping(
        RunnerType.TASK, "format_runner", "CREATE", "L1", AIIntervention.AUGMENT,
        reasoning_pattern="Output formatting"
    ),
}

DEFAULT_MAPPINGS_BY_LEVEL: Dict[JTBDLevel, Dict[JobStep, RunnerMapping]] = {
    JTBDLevel.STRATEGIC: DEFAULT_STRATEGIC_MAPPINGS,
    JTBDLevel.SOLUTION: DEFAULT_SOLUTION_MAPPINGS,
    JTBDLevel.WORKFLOW: DEFAULT_WORKFLOW_MAPPINGS,
    JTBDLevel.TASK: DEFAULT_TASK_MAPPINGS,
}

# Family runner mapping
FAMILY_RUNNER_MAP: Dict[str, FamilyRunnerInfo] = {
    "DEEP_RESEARCH": FamilyRunnerInfo(
        "DeepResearchRunner", "deep_research_runner",
        "ToT → CoT → Reflection", "Research & Analysis"
    ),
    "STRATEGY": FamilyRunnerInfo(
        "StrategyRunner", "strategy_runner",
        "Scenario → SWOT → Roadmap", "Strategic Planning"
    ),
    "EVALUATION": FamilyRunnerInfo(
        "EvaluationRunner", "evaluation_runner",
        "MCDA Scoring", "Decision Support"
    ),
    "INVESTIGATION": FamilyRunnerInfo(
        "InvestigationRunner", "investigation_runner",
        "RCA → Bayesian", "Root Cause Analysis"
    ),
    "PROBLEM_SOLVING": FamilyRunnerInfo(
        "ProblemSolvingRunner", "problem_solving_runner",
        "Hypothesis → Test → Iterate", "Problem Resolution"
    ),
    "COMMUNICATION": FamilyRunnerInfo(
        "CommunicationRunner", "communication_runner",
        "Audience → Format → Review", "Content Creation"
    ),
    "MONITORING": FamilyRunnerInfo(
        "MonitoringRunner", "monitoring_runner",
        "Baseline → Delta → Alert", "Tracking & Alerting"
    ),
    "GENERIC": FamilyRunnerInfo(
        "GenericRunner", "generic_runner",
        "Plan → Execute → Review", "Default Fallback"
    ),
    # Domain runners
    "FORESIGHT": FamilyRunnerInfo(
        "ForesightRunner", "foresight_runner",
        "Trend → Forecast → Scenario", "Trend Analysis & Forecasting"
    ),
    "BRAND_STRATEGY": FamilyRunnerInfo(
        "BrandStrategyRunner", "brand_strategy_runner",
        "Position → Message → Plan", "Commercial Planning"
    ),
    "DIGITAL_HEALTH": FamilyRunnerInfo(
        "DigitalHealthRunner", "digital_health_runner",
        "DTx → RWE → Engagement", "Digital Therapeutics"
    ),
    "MEDICAL_AFFAIRS": FamilyRunnerInfo(
        "MedicalAffairsRunner", "medical_affairs_runner",
        "KOL → MSL → Scientific", "Medical Affairs Activities"
    ),
    "MARKET_ACCESS": FamilyRunnerInfo(
        "MarketAccessRunner", "market_access_runner",
        "HEOR → Price → Reimburse", "Market Access Strategy"
    ),
    "DESIGN_THINKING": FamilyRunnerInfo(
        "DesignThinkingRunner", "design_thinking_runner",
        "Research → Ideate → Prototype", "User Research & Design"
    ),
}


# =====================================================
# Service Class
# =====================================================

class JTBDRunnerService:
    """
    Service for JTBD-to-Runner mapping.

    Provides:
    - JTBD level detection
    - Job step to runner mapping
    - Family runner selection
    - Database lookups with fallback to defaults
    """

    def __init__(
        self,
        supabase: Optional[AsyncClient] = None,
        tenant_id: Optional[str] = None
    ):
        self.supabase = supabase
        self.tenant_id = tenant_id
        self._cache: Dict[str, Any] = {}

    def detect_jtbd_level(
        self,
        estimated_duration_hours: Optional[float] = None,
        estimated_duration_days: Optional[float] = None,
        deliverable_type: Optional[str] = None,
        explicit_level: Optional[str] = None
    ) -> JTBDLevel:
        """
        Detect JTBD level based on request characteristics.

        Priority:
        1. Explicit level if provided
        2. Duration-based estimation
        3. Deliverable type matching
        4. Default to WORKFLOW
        """
        # Check explicit level
        if explicit_level:
            try:
                return JTBDLevel(explicit_level.lower())
            except ValueError:
                pass

        # Duration-based estimation
        if estimated_duration_days is not None:
            if estimated_duration_days > 30:
                return JTBDLevel.STRATEGIC
            elif estimated_duration_days > 7:
                return JTBDLevel.SOLUTION
            elif estimated_duration_days > 0.5:  # > 12 hours
                return JTBDLevel.WORKFLOW
            else:
                return JTBDLevel.TASK

        if estimated_duration_hours is not None:
            if estimated_duration_hours > 720:  # > 30 days
                return JTBDLevel.STRATEGIC
            elif estimated_duration_hours > 168:  # > 7 days
                return JTBDLevel.SOLUTION
            elif estimated_duration_hours > 4:
                return JTBDLevel.WORKFLOW
            else:
                return JTBDLevel.TASK

        # Deliverable type matching
        if deliverable_type:
            dt_lower = deliverable_type.lower()
            strategic_types = [
                "brand_plan", "launch_playbook", "market_strategy",
                "portfolio_strategy", "enterprise_roadmap"
            ]
            solution_types = [
                "dossier", "value_proposition", "competitive_analysis",
                "business_case", "implementation_plan"
            ]
            workflow_types = [
                "analysis", "research_report", "synthesis",
                "assessment", "evaluation"
            ]

            if any(t in dt_lower for t in strategic_types):
                return JTBDLevel.STRATEGIC
            elif any(t in dt_lower for t in solution_types):
                return JTBDLevel.SOLUTION
            elif any(t in dt_lower for t in workflow_types):
                return JTBDLevel.WORKFLOW

        # Default to WORKFLOW (Mode 3)
        return JTBDLevel.WORKFLOW

    def get_default_mapping(
        self,
        jtbd_level: JTBDLevel,
        job_step: JobStep
    ) -> RunnerMapping:
        """Get default runner mapping for a JTBD level and job step."""
        level_mappings = DEFAULT_MAPPINGS_BY_LEVEL.get(jtbd_level, DEFAULT_WORKFLOW_MAPPINGS)
        return level_mappings.get(job_step, RunnerMapping(
            RunnerType.TASK, "generic_runner", None, "L2", AIIntervention.AUGMENT
        ))

    def get_family_runner_info(
        self,
        template_family: str
    ) -> FamilyRunnerInfo:
        """Get family runner info for a template family."""
        family_upper = template_family.upper()
        return FAMILY_RUNNER_MAP.get(family_upper, FAMILY_RUNNER_MAP["GENERIC"])

    async def get_runner_for_jtbd(
        self,
        jtbd_id: str,
        job_step: JobStep,
        tenant_id: Optional[str] = None
    ) -> RunnerMapping:
        """
        Get the appropriate runner for a JTBD at a specific job step.

        Lookup order:
        1. JTBD-specific mapping (tenant-scoped)
        2. JTBD-specific mapping (global)
        3. JTBD level default mapping
        4. Workflow level fallback
        """
        tenant = tenant_id or self.tenant_id

        # Try database lookup if available
        if self.supabase:
            try:
                result = await self.supabase.rpc(
                    "get_runner_for_jtbd",
                    {
                        "p_jtbd_id": jtbd_id,
                        "p_job_step": job_step.value,
                        "p_tenant_id": tenant
                    }
                ).execute()

                if result.data:
                    row = result.data[0]
                    return RunnerMapping(
                        runner_type=RunnerType(row["runner_type"]),
                        runner_id=row["runner_id"],
                        runner_category=row.get("runner_category"),
                        service_layer=row.get("service_layer"),
                        ai_intervention=AIIntervention(row["ai_intervention"]) if row.get("ai_intervention") else None,
                        is_default=row.get("is_default", True),
                        configuration=row.get("configuration", {})
                    )
            except Exception as e:
                logger.warning("jtbd_runner_db_lookup_failed", error=str(e), jtbd_id=jtbd_id)

        # Fallback to in-memory defaults
        jtbd_level = await self._get_jtbd_level(jtbd_id) or JTBDLevel.WORKFLOW
        return self.get_default_mapping(jtbd_level, job_step)

    async def _get_jtbd_level(self, jtbd_id: str) -> Optional[JTBDLevel]:
        """Get JTBD level from database."""
        if not self.supabase:
            return None

        try:
            result = await self.supabase.table("jtbd").select(
                "jtbd_level"
            ).eq("id", jtbd_id).single().execute()

            if result.data and result.data.get("jtbd_level"):
                return JTBDLevel(result.data["jtbd_level"])
        except Exception as e:
            logger.debug("jtbd_level_lookup_failed", error=str(e))

        return None

    async def get_full_runner_context(
        self,
        jtbd_id: Optional[str] = None,
        jtbd_level: Optional[JTBDLevel] = None,
        template_family: Optional[str] = None
    ) -> JTBDRunnerContext:
        """
        Get full runner context for a JTBD, including all job step mappings.

        Args:
            jtbd_id: Optional JTBD ID for database lookup
            jtbd_level: JTBD level (used if jtbd_id not provided)
            template_family: Optional template family for family runner selection

        Returns:
            JTBDRunnerContext with all mappings
        """
        # Determine level
        resolved_level = jtbd_level or JTBDLevel.WORKFLOW
        if jtbd_id and not jtbd_level:
            db_level = await self._get_jtbd_level(jtbd_id)
            if db_level:
                resolved_level = db_level

        # Get all job step mappings
        mappings: Dict[JobStep, RunnerMapping] = {}
        for step in JobStep:
            if jtbd_id:
                mapping = await self.get_runner_for_jtbd(jtbd_id, step)
            else:
                mapping = self.get_default_mapping(resolved_level, step)
            mappings[step] = mapping

        # Get family runner if template family provided
        family_runner = None
        if template_family:
            family_runner = self.get_family_runner_info(template_family)
            # Override the EXECUTE step with the family runner
            mappings[JobStep.EXECUTE] = RunnerMapping(
                runner_type=RunnerType.FAMILY,
                runner_id=family_runner.runner_id,
                runner_category=None,
                service_layer="L3",
                ai_intervention=AIIntervention.AUTOMATE,
                reasoning_pattern=family_runner.reasoning_pattern
            )

        return JTBDRunnerContext(
            jtbd_id=jtbd_id,
            jtbd_level=resolved_level,
            mappings=mappings,
            family_runner=family_runner
        )

    def get_runner_class_for_family(
        self,
        template_family: str
    ) -> Type:
        """
        Get the actual runner class for a template family.

        Returns the runner class from runners.jobs module.
        """
        family_info = self.get_family_runner_info(template_family)

        # Dynamic import to avoid circular dependencies
        from runners.jobs import (
            DeepResearchRunner,
            StrategyRunner,
            EvaluationRunner,
            InvestigationRunner,
            ProblemSolvingRunner,
            CommunicationRunner,
            MonitoringRunner,
            GenericRunner,
            ForesightRunner,
            BrandStrategyRunner,
            DigitalHealthRunner,
            MedicalAffairsRunner,
            MarketAccessRunner,
            DesignThinkingRunner,
        )

        runner_class_map = {
            "DeepResearchRunner": DeepResearchRunner,
            "StrategyRunner": StrategyRunner,
            "EvaluationRunner": EvaluationRunner,
            "InvestigationRunner": InvestigationRunner,
            "ProblemSolvingRunner": ProblemSolvingRunner,
            "CommunicationRunner": CommunicationRunner,
            "MonitoringRunner": MonitoringRunner,
            "GenericRunner": GenericRunner,
            "ForesightRunner": ForesightRunner,
            "BrandStrategyRunner": BrandStrategyRunner,
            "DigitalHealthRunner": DigitalHealthRunner,
            "MedicalAffairsRunner": MedicalAffairsRunner,
            "MarketAccessRunner": MarketAccessRunner,
            "DesignThinkingRunner": DesignThinkingRunner,
        }

        return runner_class_map.get(family_info.runner_class, GenericRunner)


# =====================================================
# Convenience Functions
# =====================================================

def get_runner_for_template(template_family: str) -> Type:
    """
    Quick lookup: Get runner class for a template family.

    Usage:
        runner_class = get_runner_for_template("DEEP_RESEARCH")
        runner = runner_class(checkpointer=checkpointer)
    """
    service = JTBDRunnerService()
    return service.get_runner_class_for_family(template_family)


def get_job_step_runner(
    jtbd_level: JTBDLevel,
    job_step: JobStep
) -> RunnerMapping:
    """
    Quick lookup: Get default runner mapping for a level and step.

    Usage:
        mapping = get_job_step_runner(JTBDLevel.WORKFLOW, JobStep.EXECUTE)
        print(mapping.runner_id)  # e.g., "generic_runner"
    """
    service = JTBDRunnerService()
    return service.get_default_mapping(jtbd_level, job_step)


def detect_level_from_query(
    query: str,
    word_count_threshold: int = 50
) -> JTBDLevel:
    """
    Heuristic JTBD level detection from query text.

    Simple heuristics:
    - Strategic keywords → STRATEGIC
    - Solution keywords → SOLUTION
    - Research/analysis keywords → WORKFLOW
    - Short queries → TASK
    """
    query_lower = query.lower()
    word_count = len(query.split())

    # Strategic indicators
    strategic_keywords = [
        "strategy", "strategic", "vision", "long-term", "multi-year",
        "portfolio", "enterprise", "roadmap", "transformation"
    ]
    if any(kw in query_lower for kw in strategic_keywords):
        return JTBDLevel.STRATEGIC

    # Solution indicators
    solution_keywords = [
        "solution", "implementation", "project", "business case",
        "value proposition", "proposal", "plan development"
    ]
    if any(kw in query_lower for kw in solution_keywords):
        return JTBDLevel.SOLUTION

    # Workflow indicators
    workflow_keywords = [
        "research", "analyze", "investigate", "comprehensive",
        "detailed", "in-depth", "thorough", "evaluate"
    ]
    if any(kw in query_lower for kw in workflow_keywords):
        return JTBDLevel.WORKFLOW

    # Short queries are likely tasks
    if word_count < 15:
        return JTBDLevel.TASK

    # Default to workflow
    return JTBDLevel.WORKFLOW
