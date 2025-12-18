"""
Skills Library - Agent Skill Definitions

Static skill definitions that agents can reference.
Skills are loaded from database via SkillsLoaderService.

Categories:
- Clinical skills
- Regulatory skills
- Commercial skills
- Research skills
- Operations skills

Usage:
    from libraries.skills import SKILL_REGISTRY, get_skill_by_code

    skill = get_skill_by_code("clinical_trial_design")
"""

from typing import Dict, Any, Optional

# Skill registry (populated at runtime from database)
SKILL_REGISTRY: Dict[str, Dict[str, Any]] = {}


def get_skill_by_code(code: str) -> Optional[Dict[str, Any]]:
    """Get skill definition by skill code."""
    return SKILL_REGISTRY.get(code)


def register_skill(code: str, skill: Dict[str, Any]) -> None:
    """Register a skill in the registry."""
    SKILL_REGISTRY[code] = skill


__all__ = [
    "SKILL_REGISTRY",
    "get_skill_by_code",
    "register_skill",
]
