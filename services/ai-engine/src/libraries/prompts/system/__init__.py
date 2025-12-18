"""
System Prompts - Agent L1-L5 Hierarchy

Agent system prompts organized by level:
- L1: Orchestrators (high-level coordination)
- L2: Experts (domain specialists)
- L3: Specialists (narrow expertise)
- L4: Workers (task execution)
- L5: Tools (atomic operations)
"""

from .l1_system_prompt import L1SystemPrompt, build_l1_system_prompt

__all__ = [
    "L1SystemPrompt",
    "build_l1_system_prompt",
]
