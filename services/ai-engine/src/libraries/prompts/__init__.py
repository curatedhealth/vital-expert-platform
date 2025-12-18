"""
Prompts Library - System Prompts and Templates

Categories:
- system/    : Agent system prompts (L1-L5 hierarchy)
- templates/ : Prompt templates (few-shot, CoT, structured output)
"""

from .system.l1_system_prompt import L1SystemPrompt, build_l1_system_prompt

__all__ = [
    "L1SystemPrompt",
    "build_l1_system_prompt",
]
