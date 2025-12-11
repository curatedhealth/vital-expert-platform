"""
Core Cognitive Runners - 88 runners across 22 categories
Each category has 4 variants: Basic, Advanced, Expert, Master
"""

from .critique import CritiqueRunner, CritiqueAdvancedRunner
from .synthesize import SynthesizeRunner, SynthesizeAdvancedRunner
from .decompose import DecomposeRunner, DecomposeAdvancedRunner
from .investigate import InvestigateRunner, InvestigateAdvancedRunner
from .validate import ValidateRunner, ValidateAdvancedRunner
from .recommend import RecommendRunner, RecommendAdvancedRunner

__all__ = [
    # EVALUATE category
    "CritiqueRunner",
    "CritiqueAdvancedRunner",
    # SYNTHESIZE category
    "SynthesizeRunner",
    "SynthesizeAdvancedRunner",
    # PLAN category
    "DecomposeRunner",
    "DecomposeAdvancedRunner",
    # INVESTIGATE category
    "InvestigateRunner",
    "InvestigateAdvancedRunner",
    # VALIDATE category
    "ValidateRunner",
    "ValidateAdvancedRunner",
    # DECIDE category
    "RecommendRunner",
    "RecommendAdvancedRunner",
]
