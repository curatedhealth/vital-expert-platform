"""
Mission Registry that maps template IDs to runner implementations.

Keeps workflow generic: adding missions only requires registering a new runner.

Runner Families (7 total covering 24 mission templates):
- DEEP_RESEARCH: understand_* missions (deep dive, knowledge harvest, gap discovery)
- EVALUATION: evaluate_* missions (critique, benchmark, go/no-go)
- STRATEGY: develop_strategy, decide_* missions (positioning, allocation)
- INVESTIGATION: investigate_* missions (root cause, competitive, landscape)
- MONITORING: monitor_* missions (signals, risks, performance)
- PROBLEM_SOLVING: solve_* missions (troubleshoot, optimize, mitigate)
- COMMUNICATION: prepare_*, communicate_* missions (plan, brief, materials, report, presentation)
"""

from typing import Dict

from .base_runner import BaseMissionRunner
from .runners.deep_research import DeepResearchRunner
from .runners.evaluation import EvaluationRunner
from .runners.strategy import StrategyRunner
from .runners.investigation import InvestigationRunner
from .runners.monitoring import MonitoringRunner
from .runners.problem_solving import ProblemSolvingRunner
from .runners.communication import CommunicationRunner


class MissionRegistry:
    """Factory/registry for mission runners."""

    _RUNNERS: Dict[str, BaseMissionRunner] = {
        "DEEP_RESEARCH": DeepResearchRunner(),
        "EVALUATION": EvaluationRunner(),
        "STRATEGY": StrategyRunner(),
        "INVESTIGATION": InvestigationRunner(),
        "MONITORING": MonitoringRunner(),
        "PROBLEM_SOLVING": ProblemSolvingRunner(),
        "COMMUNICATION": CommunicationRunner(),
    }

    _TEMPLATE_MAP: Dict[str, str] = {
        # ──────────────────────────────────────────────────────────────────────
        # UNDERSTAND Family (Deep Research Runner)
        # ──────────────────────────────────────────────────────────────────────
        "understand_deep_dive": "DEEP_RESEARCH",
        "understand_knowledge_harvest": "DEEP_RESEARCH",
        "understand_gap_discovery": "DEEP_RESEARCH",

        # ──────────────────────────────────────────────────────────────────────
        # EVALUATE Family (Evaluation Runner)
        # ──────────────────────────────────────────────────────────────────────
        "evaluate_critique": "EVALUATION",
        "evaluate_benchmark": "EVALUATION",
        "evaluate_go_nogo": "EVALUATION",

        # ──────────────────────────────────────────────────────────────────────
        # DEVELOP/DECIDE Family (Strategy Runner)
        # ──────────────────────────────────────────────────────────────────────
        "develop_strategy": "STRATEGY",
        "decide_positioning": "STRATEGY",
        "decide_allocation": "STRATEGY",

        # ──────────────────────────────────────────────────────────────────────
        # INVESTIGATE Family (Investigation Runner)
        # ──────────────────────────────────────────────────────────────────────
        "investigate_root_cause": "INVESTIGATION",
        "investigate_competitive": "INVESTIGATION",
        "investigate_landscape": "INVESTIGATION",

        # ──────────────────────────────────────────────────────────────────────
        # MONITOR Family (Monitoring Runner)
        # ──────────────────────────────────────────────────────────────────────
        "monitor_signals": "MONITORING",
        "monitor_risks": "MONITORING",
        "monitor_performance": "MONITORING",

        # ──────────────────────────────────────────────────────────────────────
        # SOLVE Family (Problem Solving Runner)
        # ──────────────────────────────────────────────────────────────────────
        "solve_troubleshoot": "PROBLEM_SOLVING",
        "solve_optimize": "PROBLEM_SOLVING",
        "solve_mitigate": "PROBLEM_SOLVING",

        # ──────────────────────────────────────────────────────────────────────
        # PREPARE/COMMUNICATE Family (Communication Runner)
        # ──────────────────────────────────────────────────────────────────────
        "prepare_plan": "COMMUNICATION",
        "prepare_brief": "COMMUNICATION",
        "prepare_materials": "COMMUNICATION",
        "communicate_report": "COMMUNICATION",
        "communicate_presentation": "COMMUNICATION",

        # ──────────────────────────────────────────────────────────────────────
        # Defaults / Aliases
        # ──────────────────────────────────────────────────────────────────────
        "generic": "DEEP_RESEARCH",
        "interactive_chat": "DEEP_RESEARCH",
    }

    @classmethod
    def get_runner(cls, template_id: str) -> BaseMissionRunner:
        family = cls._TEMPLATE_MAP.get(template_id) or "DEEP_RESEARCH"
        runner = cls._RUNNERS.get(family)
        if not runner:
            raise ValueError(f"No runner registered for family {family}")
        return runner

    @classmethod
    def register_runner(cls, family: str, runner: BaseMissionRunner) -> None:
        cls._RUNNERS[family] = runner
