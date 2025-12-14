"""
Template schema and validation for Modes 3/4 mission templates.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator
import yaml


class TemplateTask(BaseModel):
    """Minimal task schema for a mission template."""

    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    estimated_duration: Optional[str] = None
    tools: List[str] = Field(default_factory=list)


class TemplateCheckpoint(BaseModel):
    """HITL checkpoint definition."""

    type: str
    description: Optional[str] = None
    timeout: Optional[int] = None
    is_blocking: bool = False


class TemplateConfig(BaseModel):
    """Mission template configuration schema."""

    id: Optional[str] = None
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tasks: List[TemplateTask] = Field(default_factory=list)
    checkpoints: List[TemplateCheckpoint] = Field(default_factory=list)
    estimated_hours: Optional[float] = None
    difficulty: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    # Pre-filled configurations
    required_agent_levels: List[int] = Field(default_factory=list)
    recommended_archetypes: List[str] = Field(default_factory=list)
    required_tool_ids: List[str] = Field(default_factory=list)
    optional_tool_ids: List[str] = Field(default_factory=list)
    l4_workers: List[str] = Field(default_factory=list)
    hitl_phases: List[Dict[str, Any]] = Field(default_factory=list)
    mode_4_constraints: Dict[str, Any] = Field(default_factory=dict)

    @validator("name")
    def validate_name(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Template name is required")
        return value

    @classmethod
    def from_yaml(cls, path: Path) -> "TemplateConfig":
        """Load and validate a template from YAML file."""
        raw = yaml.safe_load(path.read_text())
        if not isinstance(raw, dict) or "template" not in raw:
            raise ValueError(f"Invalid template file: {path}")
        return cls.model_validate(raw["template"])

    def to_cache_dict(self) -> Dict[str, Any]:
        """Convert schema to cache-friendly dict structure."""
        key = self.slug or self.id
        return {
            "id": self.id or key,
            "name": self.name,
            "slug": self.slug or self.id,
            "description": self.description,
            "category": self.category,
            "tasks": [task.model_dump() for task in self.tasks],
            "checkpoints": [cp.model_dump() for cp in self.checkpoints] or self.hitl_phases,
            "estimated_hours": self.estimated_hours,
            "difficulty": self.difficulty,
            "metadata": self.metadata or {},
            # Pre-filled configuration for runners
            "required_agent_levels": self.required_agent_levels,
            "recommended_archetypes": self.recommended_archetypes,
            "required_tool_ids": self.required_tool_ids,
            "optional_tool_ids": self.optional_tool_ids,
            "l4_workers": self.l4_workers,
            "mode_4_constraints": self.mode_4_constraints,
        }
