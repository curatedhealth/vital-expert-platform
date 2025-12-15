"""
Smoke test to verify mission templates registry is populated.
"""

import pytest
from modules.expert.registry.mission_registry import MissionRegistry


def test_mission_templates_registry_not_empty():
    # Ensure runner families are registered
    assert len(MissionRegistry._RUNNERS) >= 7
    # Ensure template map has entries
    assert len(MissionRegistry._TEMPLATE_MAP) >= 1
