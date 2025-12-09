"""
Panels Module - Multi-Agent Panel Discussion Orchestration

This module handles panel discussions where multiple AI experts
collaborate to provide comprehensive answers.
"""

from .orchestrator import PanelOrchestrator
from .consensus import ConsensusBuilder
from .router import PanelRouter

__all__ = [
    "PanelOrchestrator",
    "ConsensusBuilder", 
    "PanelRouter",
]


