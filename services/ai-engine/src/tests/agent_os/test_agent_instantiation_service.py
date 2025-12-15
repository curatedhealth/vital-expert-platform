import pytest
from services.agent_instantiation_service import PersonalityConfig


def test_personality_config_defaults():
    cfg = PersonalityConfig(id="test-id", slug="default", display_name="Default")
    assert cfg.max_tokens is not None
    assert cfg.temperature == 0.3
