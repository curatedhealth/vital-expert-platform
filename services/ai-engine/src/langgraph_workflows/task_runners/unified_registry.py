# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [1, 2, 3, 4]
"""
Unified Runner Registry - Central Registry for All Runners

This module provides a unified interface for accessing:
- Task Runners (88 cognitive runners for L1-L2)
- Family Runners (8 complex workflow runners for L3)
- Orchestrators (for L4-L5)

Architecture:
    UnifiedRunnerRegistry
        ├── get_task_runner(runner_id) -> TaskRunner
        ├── get_family_runner(family) -> BaseFamilyRunner
        ├── get_runner_for_template(template_family) -> BaseFamilyRunner
        ├── get_runner_for_jtbd(jtbd_level, job_step) -> Runner
        └── list_runners(runner_type, category) -> List[RunnerInfo]

See: .claude/docs/services/JTBD_RUNNER_MAPPING.md for mapping strategy
"""

from __future__ import annotations

import logging
from enum import Enum
from typing import Any, Dict, List, Optional, Type, Union

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# =============================================================================
# Enums and Types
# =============================================================================

class RunnerType(str, Enum):
    """Types of runners in the system"""
    TASK = "task"              # Atomic cognitive operations (30s-3min)
    FAMILY = "family"          # Complex multi-step workflows (5-30min)
    ORCHESTRATOR = "orchestrator"  # Coordinates multiple workflows


class JTBDLevel(str, Enum):
    """JTBD hierarchy levels"""
    STRATEGIC = "strategic"    # L5 - Big Hire (Months-Years)
    SOLUTION = "solution"      # L4 - Capability (Weeks-Months)
    WORKFLOW = "workflow"      # L3 - Process Job (Hours-Days)
    TASK = "task"              # L1-L2 - Little Hire (Minutes-Hours)


class JobStep(str, Enum):
    """Ulwick's 8 universal job steps"""
    DEFINE = "define"
    LOCATE = "locate"
    PREPARE = "prepare"
    CONFIRM = "confirm"
    EXECUTE = "execute"
    MONITOR = "monitor"
    MODIFY = "modify"
    CONCLUDE = "conclude"


class AIIntervention(str, Enum):
    """AI intervention levels"""
    ASSIST = "ASSIST"
    AUGMENT = "AUGMENT"
    AUTOMATE = "AUTOMATE"
    ORCHESTRATE = "ORCHESTRATE"
    REDESIGN = "REDESIGN"


class RunnerInfo(BaseModel):
    """Information about a registered runner"""
    runner_id: str
    name: str
    runner_type: RunnerType
    category: Optional[str] = None
    family: Optional[str] = None
    description: Optional[str] = None
    service_layers: List[str] = Field(default_factory=list)
    ai_intervention: Optional[AIIntervention] = None

    class Config:
        use_enum_values = True


class RunnerMapping(BaseModel):
    """Mapping from JTBD level + job step to runner"""
    runner_id: str
    runner_type: RunnerType
    category: Optional[str] = None
    service_layer: str
    ai_intervention: AIIntervention

    class Config:
        use_enum_values = True


# =============================================================================
# Default JTBD to Runner Mappings
# =============================================================================

JTBD_RUNNER_DEFAULTS: Dict[JTBDLevel, Dict[JobStep, RunnerMapping]] = {
    JTBDLevel.STRATEGIC: {
        JobStep.DEFINE: RunnerMapping(
            runner_id="frame_runner", runner_type=RunnerType.TASK,
            category="DECIDE", service_layer="L5", ai_intervention=AIIntervention.REDESIGN
        ),
        JobStep.LOCATE: RunnerMapping(
            runner_id="explore_runner", runner_type=RunnerType.TASK,
            category="UNDERSTAND", service_layer="L5", ai_intervention=AIIntervention.REDESIGN
        ),
        JobStep.PREPARE: RunnerMapping(
            runner_id="schedule_runner", runner_type=RunnerType.TASK,
            category="PLAN", service_layer="L5", ai_intervention=AIIntervention.REDESIGN
        ),
        JobStep.CONFIRM: RunnerMapping(
            runner_id="alignment_runner", runner_type=RunnerType.TASK,
            category="ALIGN", service_layer="L5", ai_intervention=AIIntervention.REDESIGN
        ),
        JobStep.EXECUTE: RunnerMapping(
            runner_id="solution_orchestrator", runner_type=RunnerType.ORCHESTRATOR,
            service_layer="L5", ai_intervention=AIIntervention.REDESIGN
        ),
        JobStep.MONITOR: RunnerMapping(
            runner_id="trend_runner", runner_type=RunnerType.TASK,
            category="WATCH", service_layer="L5", ai_intervention=AIIntervention.ORCHESTRATE
        ),
        JobStep.MODIFY: RunnerMapping(
            runner_id="pivot_runner", runner_type=RunnerType.TASK,
            category="ADAPT", service_layer="L5", ai_intervention=AIIntervention.ORCHESTRATE
        ),
        JobStep.CONCLUDE: RunnerMapping(
            runner_id="narrate_runner", runner_type=RunnerType.TASK,
            category="SYNTHESIZE", service_layer="L5", ai_intervention=AIIntervention.ORCHESTRATE
        ),
    },
    JTBDLevel.SOLUTION: {
        JobStep.DEFINE: RunnerMapping(
            runner_id="frame_runner", runner_type=RunnerType.TASK,
            category="DECIDE", service_layer="L4", ai_intervention=AIIntervention.ORCHESTRATE
        ),
        JobStep.LOCATE: RunnerMapping(
            runner_id="extract_runner", runner_type=RunnerType.TASK,
            category="UNDERSTAND", service_layer="L4", ai_intervention=AIIntervention.ORCHESTRATE
        ),
        JobStep.PREPARE: RunnerMapping(
            runner_id="dependency_runner", runner_type=RunnerType.TASK,
            category="PLAN", service_layer="L4", ai_intervention=AIIntervention.ORCHESTRATE
        ),
        JobStep.CONFIRM: RunnerMapping(
            runner_id="consistency_check_runner", runner_type=RunnerType.TASK,
            category="VALIDATE", service_layer="L4", ai_intervention=AIIntervention.ORCHESTRATE
        ),
        JobStep.EXECUTE: RunnerMapping(
            runner_id="workflow_orchestrator", runner_type=RunnerType.ORCHESTRATOR,
            service_layer="L4", ai_intervention=AIIntervention.ORCHESTRATE
        ),
        JobStep.MONITOR: RunnerMapping(
            runner_id="baseline_runner", runner_type=RunnerType.TASK,
            category="WATCH", service_layer="L4", ai_intervention=AIIntervention.AUTOMATE
        ),
        JobStep.MODIFY: RunnerMapping(
            runner_id="mutate_runner", runner_type=RunnerType.TASK,
            category="REFINE", service_layer="L4", ai_intervention=AIIntervention.AUTOMATE
        ),
        JobStep.CONCLUDE: RunnerMapping(
            runner_id="collect_runner", runner_type=RunnerType.TASK,
            category="SYNTHESIZE", service_layer="L4", ai_intervention=AIIntervention.AUTOMATE
        ),
    },
    JTBDLevel.WORKFLOW: {
        JobStep.DEFINE: RunnerMapping(
            runner_id="decompose_runner", runner_type=RunnerType.TASK,
            category="PLAN", service_layer="L3", ai_intervention=AIIntervention.AUTOMATE
        ),
        JobStep.LOCATE: RunnerMapping(
            runner_id="knowledge_retriever", runner_type=RunnerType.TASK,
            category="UNDERSTAND", service_layer="L3", ai_intervention=AIIntervention.AUTOMATE
        ),
        JobStep.PREPARE: RunnerMapping(
            runner_id="decompose_runner", runner_type=RunnerType.TASK,
            category="PLAN", service_layer="L3", ai_intervention=AIIntervention.AUTOMATE
        ),
        JobStep.CONFIRM: RunnerMapping(
            runner_id="fact_check_runner", runner_type=RunnerType.TASK,
            category="VALIDATE", service_layer="L3", ai_intervention=AIIntervention.AUTOMATE
        ),
        JobStep.EXECUTE: RunnerMapping(
            runner_id="family_runner", runner_type=RunnerType.FAMILY,
            service_layer="L3", ai_intervention=AIIntervention.AUTOMATE
        ),
        JobStep.MONITOR: RunnerMapping(
            runner_id="delta_runner", runner_type=RunnerType.TASK,
            category="WATCH", service_layer="L3", ai_intervention=AIIntervention.AUGMENT
        ),
        JobStep.MODIFY: RunnerMapping(
            runner_id="critic_runner", runner_type=RunnerType.TASK,
            category="REFINE", service_layer="L3", ai_intervention=AIIntervention.AUGMENT
        ),
        JobStep.CONCLUDE: RunnerMapping(
            runner_id="narrate_runner", runner_type=RunnerType.TASK,
            category="SYNTHESIZE", service_layer="L3", ai_intervention=AIIntervention.AUGMENT
        ),
    },
    JTBDLevel.TASK: {
        JobStep.DEFINE: RunnerMapping(
            runner_id="input_validator", runner_type=RunnerType.TASK,
            category="VALIDATE", service_layer="L1", ai_intervention=AIIntervention.AUGMENT
        ),
        JobStep.LOCATE: RunnerMapping(
            runner_id="knowledge_injector", runner_type=RunnerType.TASK,
            category="UNDERSTAND", service_layer="L1", ai_intervention=AIIntervention.AUGMENT
        ),
        JobStep.PREPARE: RunnerMapping(
            runner_id="prompt_composer", runner_type=RunnerType.TASK,
            category="CREATE", service_layer="L1", ai_intervention=AIIntervention.AUGMENT
        ),
        JobStep.CONFIRM: RunnerMapping(
            runner_id="schema_validator", runner_type=RunnerType.TASK,
            category="VALIDATE", service_layer="L1", ai_intervention=AIIntervention.AUGMENT
        ),
        JobStep.EXECUTE: RunnerMapping(
            runner_id="task_runner", runner_type=RunnerType.TASK,
            service_layer="L1", ai_intervention=AIIntervention.AUGMENT
        ),
        JobStep.CONCLUDE: RunnerMapping(
            runner_id="format_runner", runner_type=RunnerType.TASK,
            category="CREATE", service_layer="L1", ai_intervention=AIIntervention.ASSIST
        ),
    },
}


# =============================================================================
# Template to Family Mapping
# =============================================================================

TEMPLATE_FAMILY_MAP: Dict[str, str] = {
    # Research templates -> DEEP_RESEARCH family
    "market_research": "DEEP_RESEARCH",
    "competitive_analysis": "DEEP_RESEARCH",
    "literature_review": "DEEP_RESEARCH",
    "deep_research": "DEEP_RESEARCH",

    # Strategy templates -> STRATEGY family
    "strategic_planning": "STRATEGY",
    "market_entry": "STRATEGY",
    "positioning": "STRATEGY",
    "go_to_market": "STRATEGY",

    # Evaluation templates -> EVALUATION family
    "vendor_evaluation": "EVALUATION",
    "option_assessment": "EVALUATION",
    "risk_assessment": "EVALUATION",
    "decision_support": "EVALUATION",

    # Investigation templates -> INVESTIGATION family
    "root_cause_analysis": "INVESTIGATION",
    "failure_analysis": "INVESTIGATION",
    "quality_investigation": "INVESTIGATION",

    # Problem solving templates -> PROBLEM_SOLVING family
    "problem_resolution": "PROBLEM_SOLVING",
    "innovation": "PROBLEM_SOLVING",
    "process_optimization": "PROBLEM_SOLVING",

    # Communication templates -> COMMUNICATION family
    "report_generation": "COMMUNICATION",
    "presentation": "COMMUNICATION",
    "executive_summary": "COMMUNICATION",

    # Monitoring templates -> MONITORING family
    "kpi_monitoring": "MONITORING",
    "competitive_tracking": "MONITORING",
    "market_surveillance": "MONITORING",

    # Default fallback
    "generic": "GENERIC",
}


# =============================================================================
# Unified Runner Registry
# =============================================================================

class UnifiedRunnerRegistry:
    """
    Central registry for all runner types in the VITAL platform.

    Provides unified access to:
    - Task Runners (88 cognitive runners)
    - Family Runners (8 workflow runners)
    - Orchestrators (for L4-L5)

    Usage:
        registry = get_unified_registry()

        # Get task runner by ID
        runner_class = registry.get_task_runner("critique_runner")

        # Get family runner by template
        family_runner_class = registry.get_runner_for_template("DEEP_RESEARCH")

        # Get runner for JTBD level + job step
        mapping = registry.get_runner_for_jtbd(JTBDLevel.WORKFLOW, JobStep.EXECUTE)
    """

    _instance: Optional[UnifiedRunnerRegistry] = None

    def __init__(self):
        self._task_runners: Dict[str, Type] = {}
        self._family_runners: Dict[str, Type] = {}
        self._runner_info: Dict[str, RunnerInfo] = {}
        self._initialized = False

    @classmethod
    def get_instance(cls) -> UnifiedRunnerRegistry:
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def initialize(self) -> None:
        """
        Initialize the registry by loading all runners.

        This is called lazily on first access to avoid import cycles.
        """
        if self._initialized:
            return

        logger.info("Initializing unified runner registry")

        # Load task runners
        self._load_task_runners()

        # Load family runners
        self._load_family_runners()

        self._initialized = True
        logger.info(
            f"Registry initialized: {len(self._task_runners)} task runners, "
            f"{len(self._family_runners)} family runners"
        )

    def _load_task_runners(self) -> None:
        """Load task runners from the registry."""
        try:
            from .registry import _RUNNER_REGISTRY, TaskRunnerCategory

            for runner_id, runner_class in _RUNNER_REGISTRY.items():
                self._task_runners[runner_id] = runner_class

                # Create runner info
                self._runner_info[runner_id] = RunnerInfo(
                    runner_id=runner_id,
                    name=getattr(runner_class, 'name', runner_id),
                    runner_type=RunnerType.TASK,
                    category=getattr(runner_class, 'category', TaskRunnerCategory.UNDERSTAND).value
                        if hasattr(runner_class, 'category') else None,
                    description=getattr(runner_class, 'description', None),
                    service_layers=["L1", "L2"],
                    ai_intervention=AIIntervention.AUGMENT,
                )

            logger.debug(f"Loaded {len(self._task_runners)} task runners")

        except ImportError as e:
            logger.warning(f"Could not load task runners: {e}")

    def _load_family_runners(self) -> None:
        """Load family runners from the registry."""
        try:
            from ..modes34.runners.base_family_runner import (
                FAMILY_RUNNERS,
                FamilyType,
            )

            for family_type, runner_class in FAMILY_RUNNERS.items():
                runner_id = f"{family_type.value.lower()}_runner"
                self._family_runners[family_type.value] = runner_class

                # Create runner info
                self._runner_info[runner_id] = RunnerInfo(
                    runner_id=runner_id,
                    name=runner_class.__name__,
                    runner_type=RunnerType.FAMILY,
                    family=family_type.value,
                    description=runner_class.__doc__,
                    service_layers=["L3"],
                    ai_intervention=AIIntervention.AUTOMATE,
                )

            logger.debug(f"Loaded {len(self._family_runners)} family runners")

        except ImportError as e:
            logger.warning(f"Could not load family runners: {e}")

    # =========================================================================
    # Task Runner Access
    # =========================================================================

    def get_task_runner(self, runner_id: str) -> Optional[Type]:
        """
        Get a task runner class by ID.

        Args:
            runner_id: Runner identifier (e.g., "critique_runner")

        Returns:
            Task runner class or None if not found
        """
        self.initialize()
        return self._task_runners.get(runner_id)

    def list_task_runners(
        self,
        category: Optional[str] = None,
    ) -> List[RunnerInfo]:
        """
        List available task runners.

        Args:
            category: Optional category filter (e.g., "EVALUATE")

        Returns:
            List of RunnerInfo for matching runners
        """
        self.initialize()

        runners = [
            info for info in self._runner_info.values()
            if info.runner_type == RunnerType.TASK
        ]

        if category:
            runners = [r for r in runners if r.category == category]

        return runners

    # =========================================================================
    # Family Runner Access
    # =========================================================================

    def get_family_runner(self, family: str) -> Optional[Type]:
        """
        Get a family runner class by family type.

        Args:
            family: Family type (e.g., "DEEP_RESEARCH")

        Returns:
            Family runner class or None if not found
        """
        self.initialize()
        return self._family_runners.get(family)

    def get_runner_for_template(self, template_family: str) -> Optional[Type]:
        """
        Get the appropriate family runner for a mission template.

        This is the key integration point for Mode 3 execution.

        Args:
            template_family: Template family from mission_templates.family

        Returns:
            Family runner class or GenericRunner as fallback
        """
        self.initialize()

        # Normalize family name
        family = template_family.upper() if template_family else "GENERIC"

        # Direct lookup
        runner = self._family_runners.get(family)
        if runner:
            logger.debug(f"Found runner for template family: {family}")
            return runner

        # Check template mapping
        mapped_family = TEMPLATE_FAMILY_MAP.get(template_family.lower(), "GENERIC")
        runner = self._family_runners.get(mapped_family)
        if runner:
            logger.debug(f"Mapped {template_family} -> {mapped_family}")
            return runner

        # Fallback to generic
        logger.warning(f"No runner for template {template_family}, using GENERIC")
        return self._family_runners.get("GENERIC")

    def list_family_runners(self) -> List[RunnerInfo]:
        """
        List available family runners.

        Returns:
            List of RunnerInfo for all family runners
        """
        self.initialize()

        return [
            info for info in self._runner_info.values()
            if info.runner_type == RunnerType.FAMILY
        ]

    # =========================================================================
    # JTBD-Based Runner Selection
    # =========================================================================

    def get_runner_for_jtbd(
        self,
        jtbd_level: JTBDLevel,
        job_step: JobStep,
    ) -> RunnerMapping:
        """
        Get the default runner mapping for a JTBD level and job step.

        This implements the 2D Job Matrix from the conceptual design:
        JTBD Level x Job Step = Runner

        Args:
            jtbd_level: JTBD hierarchy level
            job_step: Current job step (Ulwick's 8 steps)

        Returns:
            RunnerMapping with runner_id, type, service_layer, ai_intervention
        """
        self.initialize()

        # Get from defaults
        level_mappings = JTBD_RUNNER_DEFAULTS.get(jtbd_level, {})
        mapping = level_mappings.get(job_step)

        if mapping:
            return mapping

        # Fallback
        logger.warning(
            f"No mapping for {jtbd_level.value}/{job_step.value}, using generic"
        )
        return RunnerMapping(
            runner_id="generic_runner",
            runner_type=RunnerType.TASK,
            service_layer="L1",
            ai_intervention=AIIntervention.AUGMENT,
        )

    def get_service_layer_for_jtbd(self, jtbd_level: JTBDLevel) -> str:
        """
        Get the recommended service layer for a JTBD level.

        Args:
            jtbd_level: JTBD hierarchy level

        Returns:
            Service layer (L1-L5)
        """
        mapping = {
            JTBDLevel.STRATEGIC: "L5",
            JTBDLevel.SOLUTION: "L4",
            JTBDLevel.WORKFLOW: "L3",
            JTBDLevel.TASK: "L1",
        }
        return mapping.get(jtbd_level, "L1")

    def get_ai_intervention_for_jtbd(self, jtbd_level: JTBDLevel) -> AIIntervention:
        """
        Get the recommended AI intervention level for a JTBD level.

        Args:
            jtbd_level: JTBD hierarchy level

        Returns:
            AI intervention type
        """
        mapping = {
            JTBDLevel.STRATEGIC: AIIntervention.REDESIGN,
            JTBDLevel.SOLUTION: AIIntervention.ORCHESTRATE,
            JTBDLevel.WORKFLOW: AIIntervention.AUTOMATE,
            JTBDLevel.TASK: AIIntervention.AUGMENT,
        }
        return mapping.get(jtbd_level, AIIntervention.AUGMENT)

    # =========================================================================
    # Utility Methods
    # =========================================================================

    def get_runner_info(self, runner_id: str) -> Optional[RunnerInfo]:
        """Get information about a runner."""
        self.initialize()
        return self._runner_info.get(runner_id)

    def list_all_runners(self) -> List[RunnerInfo]:
        """List all registered runners."""
        self.initialize()
        return list(self._runner_info.values())


# =============================================================================
# Module-Level Singleton Access
# =============================================================================

_unified_registry: Optional[UnifiedRunnerRegistry] = None


def get_unified_registry() -> UnifiedRunnerRegistry:
    """Get the unified runner registry singleton."""
    global _unified_registry
    if _unified_registry is None:
        _unified_registry = UnifiedRunnerRegistry.get_instance()
    return _unified_registry


# =============================================================================
# Convenience Functions
# =============================================================================

def get_task_runner(runner_id: str) -> Optional[Type]:
    """Get a task runner class by ID."""
    return get_unified_registry().get_task_runner(runner_id)


def get_family_runner(family: str) -> Optional[Type]:
    """Get a family runner class by family type."""
    return get_unified_registry().get_family_runner(family)


def get_runner_for_template(template_family: str) -> Optional[Type]:
    """Get the appropriate family runner for a mission template."""
    return get_unified_registry().get_runner_for_template(template_family)


def get_runner_for_jtbd(jtbd_level: JTBDLevel, job_step: JobStep) -> RunnerMapping:
    """Get the default runner mapping for a JTBD level and job step."""
    return get_unified_registry().get_runner_for_jtbd(jtbd_level, job_step)


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    # Enums
    "RunnerType",
    "JTBDLevel",
    "JobStep",
    "AIIntervention",
    # Models
    "RunnerInfo",
    "RunnerMapping",
    # Registry
    "UnifiedRunnerRegistry",
    "get_unified_registry",
    # Convenience functions
    "get_task_runner",
    "get_family_runner",
    "get_runner_for_template",
    "get_runner_for_jtbd",
    # Mappings
    "JTBD_RUNNER_DEFAULTS",
    "TEMPLATE_FAMILY_MAP",
]
