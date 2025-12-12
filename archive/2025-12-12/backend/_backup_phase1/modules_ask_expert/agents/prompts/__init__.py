"""
VITAL Path AI Services - Ask Expert Agent Prompts

System prompts for the 5-Level Agent Hierarchy (L1-L5).

Naming Convention:
- Variables: ASK_EXPERT_L{N}_{TYPE}_PROMPT
- Files: ask_expert_l{n}_{type}_prompt.py
"""

from .ask_expert_l1_system_prompt import (
    ASK_EXPERT_L1_FUSION_SYSTEM_PROMPT,
    ASK_EXPERT_L1_MISSION_DECOMPOSITION_PROMPT,
    ASK_EXPERT_L1_QUALITY_REVIEW_PROMPT,
)

__all__ = [
    "ASK_EXPERT_L1_FUSION_SYSTEM_PROMPT",
    "ASK_EXPERT_L1_MISSION_DECOMPOSITION_PROMPT",
    "ASK_EXPERT_L1_QUALITY_REVIEW_PROMPT",
]
