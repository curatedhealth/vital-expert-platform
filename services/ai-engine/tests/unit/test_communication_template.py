"""Validate communication runner template loading."""

from pathlib import Path

from langgraph_workflows.modes34.templates.schema import TemplateConfig


def test_communication_template_loads_and_has_required_fields() -> None:
    template_path = (
        Path(__file__).resolve().parents[3]
        / "src"
        / "langgraph_workflows"
        / "modes34"
        / "templates"
        / "communication_campaign.yaml"
    )
    config = TemplateConfig.from_yaml(template_path)

    assert config.slug == "communication_campaign"
    assert config.family == "COMMUNICATION"
    assert len(config.tasks) >= 3
    assert any(cp.is_blocking for cp in config.checkpoints)
