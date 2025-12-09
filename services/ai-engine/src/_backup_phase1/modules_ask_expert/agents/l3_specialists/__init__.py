"""
VITAL Path AI Services - Ask Expert L3 Task Specialists

L3 Specialists are spawned by L2 Experts for focused task execution.
Uses Claude Sonnet 4 for efficient task processing.

Naming Convention:
- Classes: AskExpertL3{Type}Specialist
- Logs: ask_expert_l3_{type}_{action}
"""

from .ask_expert_l3_base import AskExpertL3TaskSpecialist

__all__ = ["AskExpertL3TaskSpecialist"]
