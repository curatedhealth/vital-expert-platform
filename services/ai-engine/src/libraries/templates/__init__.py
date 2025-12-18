"""
Templates Library - YAML-Based Configuration Templates

Categories:
- missions/ : Mode 3&4 mission workflow templates
- panels/   : Multi-expert panel type definitions

Usage:
    from libraries.templates import load_mission_template, load_panel_template

    template = load_mission_template("regulatory_watch")
    panel = load_panel_template("delphi")
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, Optional

TEMPLATES_DIR = Path(__file__).parent


def load_mission_template(name: str) -> Dict[str, Any]:
    """Load a mission template by name.

    Args:
        name: Template name (e.g., "regulatory_watch", "scenario_planning")

    Returns:
        Parsed YAML template as dictionary
    """
    path = TEMPLATES_DIR / "missions" / f"{name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Mission template not found: {name}")

    with open(path, "r") as f:
        return yaml.safe_load(f)


def load_panel_template(name: str) -> Dict[str, Any]:
    """Load a panel type template by name.

    Args:
        name: Panel type name (e.g., "delphi", "adversarial", "socratic")

    Returns:
        Parsed YAML template as dictionary
    """
    path = TEMPLATES_DIR / "panels" / f"{name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Panel template not found: {name}")

    with open(path, "r") as f:
        return yaml.safe_load(f)


def list_mission_templates() -> list[str]:
    """List all available mission templates."""
    missions_dir = TEMPLATES_DIR / "missions"
    return [f.stem for f in missions_dir.glob("*.yaml")]


def list_panel_templates() -> list[str]:
    """List all available panel templates."""
    panels_dir = TEMPLATES_DIR / "panels"
    return [f.stem for f in panels_dir.glob("*.yaml")]


__all__ = [
    "load_mission_template",
    "load_panel_template",
    "list_mission_templates",
    "list_panel_templates",
]
