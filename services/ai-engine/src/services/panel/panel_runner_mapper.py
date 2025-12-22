# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-19
# PURPOSE: Maps Ask Panel types to appropriate runners for execution
"""
Panel Runner Mapper

Maps each of the 6 Ask Panel types to appropriate cognitive runners.
Provides intelligent runner selection based on:
- Panel type requirements
- Query complexity
- JTBD level mapping

This is the bridge between UnifiedPanelService and RunnerExecutionService.
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import structlog

logger = structlog.get_logger()


# =============================================================================
# Complexity Levels
# =============================================================================

class QueryComplexity(str, Enum):
    """Query complexity levels for runner selection"""
    SIMPLE = "simple"       # Basic question, single-step reasoning
    MODERATE = "moderate"   # Multi-faceted, requires synthesis
    COMPLEX = "complex"     # Strategic, multi-domain, deep research
    STRATEGIC = "strategic" # High-stakes, enterprise-level decisions


# =============================================================================
# JTBD Mapping
# =============================================================================

class JTBDLevel(str, Enum):
    """JTBD hierarchy levels"""
    TASK = "task"           # L1-L2: Quick task execution
    WORKFLOW = "workflow"   # L3: Multi-step workflow
    SOLUTION = "solution"   # L4: Solution design
    STRATEGIC = "strategic" # L5: Strategic planning


class JobStep(str, Enum):
    """Universal 8 job steps (Ulwick ODI)"""
    DEFINE = "define"
    LOCATE = "locate"
    PREPARE = "prepare"
    CONFIRM = "confirm"
    EXECUTE = "execute"
    MONITOR = "monitor"
    MODIFY = "modify"
    CONCLUDE = "conclude"


# =============================================================================
# Runner Mapping Configuration
# =============================================================================

@dataclass
class RunnerMapping:
    """Configuration for a runner mapping"""
    runner_id: str
    runner_type: str  # "task" or "family"
    category: str
    description: str
    ai_intervention: str  # ASSIST, AUGMENT, AUTOMATE, ORCHESTRATE, REDESIGN
    service_layer: str    # L1, L2, L3
    use_streaming: bool = False


# Panel type to runner mappings
# Each panel type maps to primary and fallback runners
PANEL_RUNNER_MAPPINGS: Dict[str, Dict[str, RunnerMapping]] = {
    "consensus": {
        "primary": RunnerMapping(
            runner_id="synthesize_runner",
            runner_type="task",
            category="SYNTHESIZE",
            description="Integrates multiple perspectives into unified consensus",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="synthesize_advanced_runner",
            runner_type="task",
            category="SYNTHESIZE",
            description="Advanced synthesis with reasoning chains",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        ),
        "family": RunnerMapping(
            runner_id="deep_research_runner",
            runner_type="family",
            category="SYNTHESIZE",
            description="Multi-step research synthesis workflow",
            ai_intervention="ORCHESTRATE",
            service_layer="L3",
            use_streaming=True
        )
    },
    "comparison": {
        "primary": RunnerMapping(
            runner_id="critique_runner",
            runner_type="task",
            category="EVALUATE",
            description="Comparative analysis and evaluation",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="critique_advanced_runner",
            runner_type="task",
            category="EVALUATE",
            description="Advanced multi-criteria comparison",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        ),
        "family": RunnerMapping(
            runner_id="evaluation_runner",
            runner_type="family",
            category="EVALUATE",
            description="Comprehensive evaluation workflow",
            ai_intervention="ORCHESTRATE",
            service_layer="L3",
            use_streaming=True
        )
    },
    "debate": {
        "primary": RunnerMapping(
            runner_id="recommend_runner",
            runner_type="task",
            category="DECIDE",
            description="Decision support with dialectic reasoning",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="recommend_advanced_runner",
            runner_type="task",
            category="DECIDE",
            description="Advanced recommendation with argument analysis",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        ),
        "family": RunnerMapping(
            runner_id="strategy_runner",
            runner_type="family",
            category="DECIDE",
            description="Strategic decision-making workflow",
            ai_intervention="ORCHESTRATE",
            service_layer="L3",
            use_streaming=True
        )
    },
    "critique": {
        "primary": RunnerMapping(
            runner_id="critique_runner",
            runner_type="task",
            category="EVALUATE",
            description="Quality assessment and critical analysis",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="critique_advanced_runner",
            runner_type="task",
            category="EVALUATE",
            description="Deep critique with evidence grading",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        ),
        "family": RunnerMapping(
            runner_id="evaluation_runner",
            runner_type="family",
            category="EVALUATE",
            description="Multi-step evaluation workflow",
            ai_intervention="ORCHESTRATE",
            service_layer="L3",
            use_streaming=True
        )
    },
    "synthesis": {
        "primary": RunnerMapping(
            runner_id="synthesize_runner",
            runner_type="task",
            category="SYNTHESIZE",
            description="Integrates insights from multiple sources",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="synthesize_advanced_runner",
            runner_type="task",
            category="SYNTHESIZE",
            description="Advanced synthesis with meta-analysis",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        ),
        "family": RunnerMapping(
            runner_id="deep_research_runner",
            runner_type="family",
            category="SYNTHESIZE",
            description="Comprehensive research synthesis workflow",
            ai_intervention="ORCHESTRATE",
            service_layer="L3",
            use_streaming=True
        )
    },
    "recommendation": {
        "primary": RunnerMapping(
            runner_id="recommend_runner",
            runner_type="task",
            category="DECIDE",
            description="Decision support and recommendations",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="recommend_advanced_runner",
            runner_type="task",
            category="DECIDE",
            description="Advanced recommendation with impact analysis",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        ),
        "family": RunnerMapping(
            runner_id="strategy_runner",
            runner_type="family",
            category="DECIDE",
            description="Strategic recommendation workflow",
            ai_intervention="ORCHESTRATE",
            service_layer="L3",
            use_streaming=True
        )
    },
    # Handler-based panel types (structured, open, socratic, etc.)
    "structured": {
        "primary": RunnerMapping(
            runner_id="validate_runner",
            runner_type="task",
            category="VALIDATE",
            description="Structured validation with compliance checks",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="validate_advanced_runner",
            runner_type="task",
            category="VALIDATE",
            description="Advanced validation with regulatory mapping",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        )
    },
    "open": {
        "primary": RunnerMapping(
            runner_id="decompose_runner",
            runner_type="task",
            category="UNDERSTAND",
            description="Open exploration and decomposition",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="decompose_advanced_runner",
            runner_type="task",
            category="UNDERSTAND",
            description="Advanced decomposition with innovation patterns",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        )
    },
    "socratic": {
        "primary": RunnerMapping(
            runner_id="investigate_runner",
            runner_type="task",
            category="INVESTIGATE",
            description="Socratic questioning and investigation",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="investigate_advanced_runner",
            runner_type="task",
            category="INVESTIGATE",
            description="Deep investigation with assumption testing",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        )
    },
    "adversarial": {
        "primary": RunnerMapping(
            runner_id="critique_runner",
            runner_type="task",
            category="EVALUATE",
            description="Adversarial analysis with pro/con evaluation",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "advanced": RunnerMapping(
            runner_id="critique_advanced_runner",
            runner_type="task",
            category="EVALUATE",
            description="Advanced adversarial critique with risk analysis",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        )
    },
    "delphi": {
        "primary": RunnerMapping(
            runner_id="synthesize_runner",
            runner_type="task",
            category="SYNTHESIZE",
            description="Iterative consensus building",
            ai_intervention="AUGMENT",
            service_layer="L2"
        ),
        "family": RunnerMapping(
            runner_id="deep_research_runner",
            runner_type="family",
            category="SYNTHESIZE",
            description="Multi-round Delphi synthesis workflow",
            ai_intervention="ORCHESTRATE",
            service_layer="L3",
            use_streaming=True
        )
    },
    "hybrid": {
        "primary": RunnerMapping(
            runner_id="recommend_runner",
            runner_type="task",
            category="DECIDE",
            description="Human-AI collaborative decision making",
            ai_intervention="AUTOMATE",
            service_layer="L2"
        ),
        "family": RunnerMapping(
            runner_id="strategy_runner",
            runner_type="family",
            category="DECIDE",
            description="Strategic human-AI collaboration workflow",
            ai_intervention="ORCHESTRATE",
            service_layer="L3",
            use_streaming=True
        )
    }
}


# JTBD Level to Runner Type mapping
JTBD_RUNNER_PREFERENCE: Dict[JTBDLevel, str] = {
    JTBDLevel.TASK: "primary",       # Use task runners for quick tasks
    JTBDLevel.WORKFLOW: "advanced",  # Use advanced runners for workflows
    JTBDLevel.SOLUTION: "advanced",  # Use advanced runners for solutions
    JTBDLevel.STRATEGIC: "family"    # Use family runners for strategic work
}


# Complexity to JTBD Level mapping
COMPLEXITY_TO_JTBD: Dict[QueryComplexity, JTBDLevel] = {
    QueryComplexity.SIMPLE: JTBDLevel.TASK,
    QueryComplexity.MODERATE: JTBDLevel.WORKFLOW,
    QueryComplexity.COMPLEX: JTBDLevel.SOLUTION,
    QueryComplexity.STRATEGIC: JTBDLevel.STRATEGIC
}


# =============================================================================
# Panel Runner Mapper Class
# =============================================================================

class PanelRunnerMapper:
    """
    Maps panel types to appropriate runners.

    Provides:
    - Panel type to runner mapping
    - Complexity-based runner selection
    - JTBD-based runner selection
    - Fallback handling
    """

    def __init__(self):
        self._mappings = PANEL_RUNNER_MAPPINGS
        self._complexity_keywords = self._build_complexity_keywords()

    def _build_complexity_keywords(self) -> Dict[QueryComplexity, List[str]]:
        """Build keyword lists for complexity detection"""
        return {
            QueryComplexity.STRATEGIC: [
                "strategic", "enterprise", "transformation", "roadmap",
                "investment", "acquisition", "market entry", "regulatory strategy",
                "long-term", "portfolio", "competitive", "m&a"
            ],
            QueryComplexity.COMPLEX: [
                "comprehensive", "multi-domain", "complex", "integrated",
                "cross-functional", "deep analysis", "systematic", "framework",
                "multiple stakeholders", "end-to-end"
            ],
            QueryComplexity.MODERATE: [
                "compare", "evaluate", "analyze", "assess", "review",
                "implications", "options", "tradeoffs", "considerations"
            ],
            QueryComplexity.SIMPLE: [
                "what is", "define", "explain", "list", "summarize",
                "quick", "brief", "simple", "basic"
            ]
        }

    def get_runner_for_panel(
        self,
        panel_type: str,
        complexity: Optional[QueryComplexity] = None,
        jtbd_level: Optional[JTBDLevel] = None,
        use_advanced: bool = False,
        prefer_streaming: bool = False
    ) -> RunnerMapping:
        """
        Get the appropriate runner for a panel type.

        Args:
            panel_type: One of the 6+ panel types
            complexity: Query complexity level
            jtbd_level: JTBD hierarchy level
            use_advanced: Force use of advanced runner
            prefer_streaming: Prefer streaming family runners

        Returns:
            RunnerMapping with runner configuration
        """
        panel_type_lower = panel_type.lower()

        if panel_type_lower not in self._mappings:
            logger.warning(f"Unknown panel type: {panel_type}, using synthesis")
            panel_type_lower = "synthesis"

        mappings = self._mappings[panel_type_lower]

        # Determine which runner tier to use
        runner_tier = "primary"

        if prefer_streaming and "family" in mappings:
            runner_tier = "family"
        elif jtbd_level:
            runner_tier = JTBD_RUNNER_PREFERENCE.get(jtbd_level, "primary")
        elif complexity:
            jtbd = COMPLEXITY_TO_JTBD.get(complexity, JTBDLevel.WORKFLOW)
            runner_tier = JTBD_RUNNER_PREFERENCE.get(jtbd, "primary")
        elif use_advanced and "advanced" in mappings:
            runner_tier = "advanced"

        # Fallback chain: requested -> advanced -> primary
        if runner_tier not in mappings:
            if "advanced" in mappings:
                runner_tier = "advanced"
            else:
                runner_tier = "primary"

        runner = mappings[runner_tier]

        logger.info(
            "runner_selected",
            panel_type=panel_type,
            runner_id=runner.runner_id,
            runner_type=runner.runner_type,
            tier=runner_tier
        )

        return runner

    def detect_complexity(self, query: str) -> QueryComplexity:
        """
        Detect query complexity from text.

        Uses keyword matching to determine complexity level.
        """
        query_lower = query.lower()

        # Check each level from most complex to least
        for level in [QueryComplexity.STRATEGIC, QueryComplexity.COMPLEX,
                      QueryComplexity.MODERATE, QueryComplexity.SIMPLE]:
            keywords = self._complexity_keywords[level]
            if any(kw in query_lower for kw in keywords):
                return level

        # Default to moderate
        return QueryComplexity.MODERATE

    def get_runner_by_jtbd(
        self,
        jtbd_level: JTBDLevel,
        job_step: JobStep,
        panel_type: Optional[str] = None
    ) -> RunnerMapping:
        """
        Get runner based on JTBD level and job step.

        Uses the JTBD × Job Step matrix for selection.
        """
        # Map job step to panel type if not provided
        if not panel_type:
            panel_type = self._job_step_to_panel_type(job_step)

        return self.get_runner_for_panel(
            panel_type=panel_type,
            jtbd_level=jtbd_level
        )

    def _job_step_to_panel_type(self, job_step: JobStep) -> str:
        """Map job step to default panel type"""
        mapping = {
            JobStep.DEFINE: "open",
            JobStep.LOCATE: "open",
            JobStep.PREPARE: "structured",
            JobStep.CONFIRM: "critique",
            JobStep.EXECUTE: "synthesis",
            JobStep.MONITOR: "comparison",
            JobStep.MODIFY: "recommendation",
            JobStep.CONCLUDE: "consensus"
        }
        return mapping.get(job_step, "synthesis")

    def get_all_runners_for_panel(self, panel_type: str) -> Dict[str, RunnerMapping]:
        """Get all available runner tiers for a panel type"""
        panel_type_lower = panel_type.lower()
        if panel_type_lower not in self._mappings:
            return {}
        return self._mappings[panel_type_lower]

    def list_supported_panels(self) -> List[str]:
        """List all supported panel types"""
        return list(self._mappings.keys())

    def get_runner_info(self, panel_type: str) -> Dict[str, any]:
        """Get detailed runner info for a panel type"""
        mappings = self.get_all_runners_for_panel(panel_type)
        return {
            "panel_type": panel_type,
            "runners": {
                tier: {
                    "runner_id": m.runner_id,
                    "runner_type": m.runner_type,
                    "category": m.category,
                    "description": m.description,
                    "ai_intervention": m.ai_intervention,
                    "service_layer": m.service_layer,
                    "use_streaming": m.use_streaming
                }
                for tier, m in mappings.items()
            }
        }


# =============================================================================
# Factory Functions
# =============================================================================

_panel_runner_mapper: Optional[PanelRunnerMapper] = None


def get_panel_runner_mapper() -> PanelRunnerMapper:
    """Get or create singleton panel runner mapper"""
    global _panel_runner_mapper
    if _panel_runner_mapper is None:
        _panel_runner_mapper = PanelRunnerMapper()
    return _panel_runner_mapper


def get_runner_for_panel(
    panel_type: str,
    complexity: Optional[str] = None,
    jtbd_level: Optional[str] = None,
    use_advanced: bool = False,
    prefer_streaming: bool = False
) -> RunnerMapping:
    """
    Convenience function to get runner for a panel.

    Args:
        panel_type: Panel type name
        complexity: "simple", "moderate", "complex", or "strategic"
        jtbd_level: "task", "workflow", "solution", or "strategic"
        use_advanced: Force advanced runner
        prefer_streaming: Prefer streaming family runners

    Returns:
        RunnerMapping configuration
    """
    mapper = get_panel_runner_mapper()

    complexity_enum = None
    if complexity:
        try:
            complexity_enum = QueryComplexity(complexity.lower())
        except ValueError:
            pass

    jtbd_enum = None
    if jtbd_level:
        try:
            jtbd_enum = JTBDLevel(jtbd_level.lower())
        except ValueError:
            pass

    return mapper.get_runner_for_panel(
        panel_type=panel_type,
        complexity=complexity_enum,
        jtbd_level=jtbd_enum,
        use_advanced=use_advanced,
        prefer_streaming=prefer_streaming
    )


def detect_query_complexity(query: str) -> str:
    """Detect complexity level from query text"""
    mapper = get_panel_runner_mapper()
    return mapper.detect_complexity(query).value
