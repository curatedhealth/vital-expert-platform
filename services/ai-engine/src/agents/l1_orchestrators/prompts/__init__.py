"""
VITAL Path AI Services - L1 System Prompts

System prompts for L1 Master Orchestrator:
- L1_FUSION_SYSTEM_PROMPT: Team selection with Fusion Intelligence
- L1_MISSION_DECOMPOSITION_PROMPT: Task breakdown
- L1_QUALITY_REVIEW_PROMPT: Final quality review
"""

from .l1_system_prompt import (
    L1_FUSION_SYSTEM_PROMPT,
    L1_MISSION_DECOMPOSITION_PROMPT,
    L1_QUALITY_REVIEW_PROMPT,
)

__all__ = [
    "L1_FUSION_SYSTEM_PROMPT",
    "L1_MISSION_DECOMPOSITION_PROMPT",
    "L1_QUALITY_REVIEW_PROMPT",
]
