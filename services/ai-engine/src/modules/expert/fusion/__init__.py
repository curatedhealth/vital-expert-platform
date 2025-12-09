"""
VITAL Path - Fusion Intelligence (Deprecated)

⚠️ DEPRECATED: Use modules.ask_expert.fusion instead.
"""

import warnings

warnings.warn(
    "modules.expert.fusion is deprecated. Use modules.ask_expert.fusion instead.",
    DeprecationWarning,
    stacklevel=2
)

# Re-export from ask_expert for backward compatibility
try:
    from modules.ask_expert.fusion import (
        AskExpertFusionEngine,
        AskExpertRRF,
    )
    from modules.ask_expert.fusion.retrievers import (
        AskExpertVectorRetriever,
        AskExpertGraphRetriever,
        AskExpertRelationalRetriever,
    )
    
    # Aliases for backward compatibility
    FusionEngine = AskExpertFusionEngine
    reciprocal_rank_fusion = AskExpertRRF
    
except ImportError:
    FusionEngine = None
    AskExpertFusionEngine = None
    reciprocal_rank_fusion = None
    AskExpertRRF = None

__all__ = [
    "FusionEngine",
    "AskExpertFusionEngine",
    "reciprocal_rank_fusion",
    "AskExpertRRF",
]
