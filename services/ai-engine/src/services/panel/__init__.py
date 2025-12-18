"""
Panel Service - Multi-Expert Consultation

Panel orchestration for consulting multiple AI experts simultaneously.

Components:
- Panel orchestration (coordinate multiple expert responses)
- Unified panel service (single entry point for panel queries)
- Consensus analysis (simple and advanced algorithms)
- Confidence calculation (aggregate confidence scores)
- Comparison matrix building (compare expert responses)
- Template management (panel configuration templates)
- Type handlers (different panel types: debate, consensus, comparison)
"""

from .panel_orchestrator import PanelOrchestrator
from .panel_template_service import PanelTemplateService
from .panel_type_handlers import PanelTypeHandler
from .unified_panel_service import UnifiedPanelService
from .consensus_analyzer import AdvancedConsensusAnalyzer
from .consensus_calculator import SimpleConsensusCalculator
from .confidence_calculator import ConfidenceCalculator
from .comparison_matrix_builder import ComparisonMatrixBuilder
from .panel_config import PanelConfig, get_panel_config

__all__ = [
    "PanelOrchestrator",
    "PanelTemplateService",
    "PanelTypeHandler",
    "UnifiedPanelService",
    "AdvancedConsensusAnalyzer",
    "SimpleConsensusCalculator",
    "ConfidenceCalculator",
    "ComparisonMatrixBuilder",
    "PanelConfig",
    "get_panel_config",
]
