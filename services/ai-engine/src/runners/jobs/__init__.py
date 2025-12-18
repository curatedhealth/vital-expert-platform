"""
Job Runners - Complex Multi-Step Workflows (JTBD-Aligned)

Aligned with O3 Jobs-To-Be-Done in the VITAL ontology.

Core Job Runners (8):
- DeepResearchRunner: ToT → CoT → Reflection pattern
- StrategyRunner: SWOT, Scenarios, Roadmaps
- InvestigationRunner: Bayesian root cause analysis
- EvaluationRunner: MCDA decision analysis
- ProblemSolvingRunner: Hypothesis → Test → Iterate
- CommunicationRunner: Audience-led messaging
- MonitoringRunner: Signal tracking and alerting
- GenericRunner: Flexible fallback for custom workflows

Domain Job Runners (6 families, 12 runners):
- ForesightRunner: Trend analysis, forecasting, competitive intelligence
- BrandStrategyRunner: Commercial planning, positioning, messaging
- DigitalHealthRunner: Digital therapeutics, RWE, patient engagement
- MedicalAffairsRunner: KOL engagement, MSL activities, scientific comms
- MarketAccessRunner: HEOR, pricing, reimbursement, HTA
- DesignThinkingRunner: User research, ideation, service design

Usage:
    from runners.jobs import DeepResearchRunner, BrandStrategyRunner
"""

# Core job runners
from .deep_research import DeepResearchRunner
from .strategy import StrategyRunner
from .investigation import InvestigationRunner
from .evaluation import EvaluationRunner
from .problem_solving import ProblemSolvingRunner
from .communication import CommunicationRunner
from .monitoring import MonitoringRunner
from .generic import GenericRunner

# Domain job runners
from .foresight import ForesightRunner, ForesightAdvancedRunner
from .brand_strategy import BrandStrategyRunner, BrandStrategyAdvancedRunner
from .digital_health import DigitalHealthRunner, DigitalHealthAdvancedRunner
from .medical_affairs import MedicalAffairsRunner, MedicalAffairsAdvancedRunner
from .market_access import MarketAccessRunner, MarketAccessAdvancedRunner
from .design_thinking import DesignThinkingRunner, DesignThinkingAdvancedRunner

__all__ = [
    # Core job runners
    "DeepResearchRunner",
    "StrategyRunner",
    "InvestigationRunner",
    "EvaluationRunner",
    "ProblemSolvingRunner",
    "CommunicationRunner",
    "MonitoringRunner",
    "GenericRunner",
    # Domain job runners
    "ForesightRunner",
    "ForesightAdvancedRunner",
    "BrandStrategyRunner",
    "BrandStrategyAdvancedRunner",
    "DigitalHealthRunner",
    "DigitalHealthAdvancedRunner",
    "MedicalAffairsRunner",
    "MedicalAffairsAdvancedRunner",
    "MarketAccessRunner",
    "MarketAccessAdvancedRunner",
    "DesignThinkingRunner",
    "DesignThinkingAdvancedRunner",
]
