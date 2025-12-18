"""
VITAL Platform Libraries - Reusable Assets (Layer 2)

Static, version-controlled assets that Runners and Services consume.

Subdirectories:
- prompts/     : System prompts and prompt templates
- skills/      : Agent skill definitions and capabilities
- knowledge/   : Domain knowledge loaders and assets
- templates/   : YAML templates for missions and panels

Libraries vs Services:
- Libraries = Static assets (prompts, templates, configurations)
- Services = Dynamic orchestration (APIs, state, dependencies)

Usage:
    from libraries.prompts import L1SystemPrompt
    from libraries.templates import load_mission_template
    from libraries.skills import get_skill_definition
"""

__version__ = "1.0.0"
