"""
Panel Workflow Engine
Supports extensible panel workflow types via registry system
Currently includes Structured Panel and Open Panel
"""

from .base import PanelType, PanelStatus, PanelState, PanelConfig
from .base_panel import BasePanelWorkflow
from .registry import panel_registry, register_panel, PanelRegistry
from .executor import PanelExecutor

# Import panels to ensure they're registered via decorators
# This must happen before any code tries to use the registry
from .structured_panel import StructuredPanelWorkflow
from .open_panel import OpenPanelWorkflow

# Verify registration (for debugging - non-fatal)
def _verify_registration():
    """Verify that panels are registered"""
    types = panel_registry.list_types()
    if not types:
        import warnings
        warnings.warn(
            "No panel types registered! "
            "Make sure StructuredPanelWorkflow and OpenPanelWorkflow are imported.",
            RuntimeWarning
        )
    return types

# Verify on import (non-fatal warning)
try:
    _verify_registration()
except Exception:
    # Don't fail on import if verification fails
    pass

__all__ = [
    "PanelType",
    "PanelStatus",
    "PanelState",
    "PanelConfig",
    "BasePanelWorkflow",
    "PanelRegistry",
    "panel_registry",
    "register_panel",
    "PanelExecutor",
    "StructuredPanelWorkflow",
    "OpenPanelWorkflow",
]

