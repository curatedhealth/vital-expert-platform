"""
Interaction Modes for VITAL Ask Expert Service

Implements the 4 interaction modes:
- Auto-Interactive: System auto-selects agent → Real-time Q&A
- Manual-Interactive: User selects agent → Real-time Q&A  
- Auto-Autonomous: System auto-selects agent → Autonomous execution
- Manual-Autonomous: User selects agent → Autonomous execution
"""

from .interactive_mode import InteractiveModeHandler
from .automatic_selector import AutomaticAgentSelector
from .manual_selector import ManualAgentSelector
from .mode_manager import ModeManager

__all__ = [
    "InteractiveModeHandler",
    "AutomaticAgentSelector", 
    "ManualAgentSelector",
    "ModeManager"
]
