"""
Panel Autonomous Workflow - YAML Definitions

This module provides YAML-based panel definitions with database override support.

Architecture:
1. YAML files define default panel configurations and prompts (version controlled)
2. Database allows tenant-specific overrides and A/B testing
3. Loader combines both with proper precedence

Usage:
    from langgraph_workflows.panel_autonomous.definitions import (
        PanelDefinitionLoader,
        get_panel_definition,
    )

    # Get panel definition (loads YAML + DB overrides)
    definition = await get_panel_definition("adversarial", tenant_id="tenant_123")

    # Access config
    print(definition.config.default_rounds)

    # Get prompt for position and round
    prompt = definition.get_prompt("pro", round_number=2)
"""

from .loader import (
    PanelDefinition,
    PanelDefinitionLoader,
    get_panel_definition,
    get_panel_definition_sync,
)

__all__ = [
    "PanelDefinition",
    "PanelDefinitionLoader",
    "get_panel_definition",
    "get_panel_definition_sync",
]
