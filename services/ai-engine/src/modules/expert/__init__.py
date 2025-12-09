"""
VITAL Path - Expert Module (Deprecated)

⚠️ DEPRECATED: This module has been superseded by modules.ask_expert.
All functionality has been moved to the Ask Expert service.

For backward compatibility, this module re-exports from ask_expert.
Please update your imports to use modules.ask_expert directly.

Migration:
    # Old (deprecated)
    from modules.expert import stream_expert_response
    
    # New (recommended)
    from modules.ask_expert.agents import AskExpertL1MasterOrchestrator
"""

import warnings

# Emit deprecation warning
warnings.warn(
    "modules.expert is deprecated. Use modules.ask_expert instead.",
    DeprecationWarning,
    stacklevel=2
)

# Re-export from ask_expert for backward compatibility
try:
    from modules.ask_expert.agents import (
        AskExpertL1MasterOrchestrator,
    )
    from modules.ask_expert.fusion import (
        AskExpertFusionEngine,
        AskExpertRRF,
    )
except ImportError:
    # Graceful degradation if ask_expert not fully set up
    AskExpertL1MasterOrchestrator = None
    AskExpertFusionEngine = None
    AskExpertRRF = None

__all__ = [
    "AskExpertL1MasterOrchestrator",
    "AskExpertFusionEngine",
    "AskExpertRRF",
]
