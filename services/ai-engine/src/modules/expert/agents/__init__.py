"""
VITAL Path - Expert Agents (Deprecated)

⚠️ DEPRECATED: Use modules.ask_expert.agents instead.
"""

import warnings

warnings.warn(
    "modules.expert.agents is deprecated. Use modules.ask_expert.agents instead.",
    DeprecationWarning,
    stacklevel=2
)

# Re-export from ask_expert for backward compatibility
try:
    from modules.ask_expert.agents import (
        AskExpertL1MasterOrchestrator,
    )
    from modules.ask_expert.agents.l2_experts import (
        AskExpertL2BaseExpert,
        AskExpertL2ClinicalExpert,
        AskExpertL2RegulatoryExpert,
        AskExpertL2SafetyExpert,
    )
    from modules.ask_expert.agents.l3_specialists import (
        AskExpertL3BaseSpecialist,
    )
    
    # Alias for backward compatibility
    L1MasterOrchestrator = AskExpertL1MasterOrchestrator
    
except ImportError:
    L1MasterOrchestrator = None
    AskExpertL1MasterOrchestrator = None

__all__ = [
    "L1MasterOrchestrator",
    "AskExpertL1MasterOrchestrator",
]
