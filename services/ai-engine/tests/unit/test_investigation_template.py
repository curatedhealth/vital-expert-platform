"""Validate investigation runner template loading."""

from pathlib import Path

from langgraph_workflows.modes34.templates.schema import TemplateConfig


def test_investigation_template_loads_and_has_required_fields() -> None:
    template_path = (
        Path(__file__).resolve().parents[3]
        / "src"
        / "langgraph_workflows"
        / "modes34"
        / "templates"
        / "root_cause_investigation.yaml"
    )
    config = TemplateConfig.from_yaml(template_path)

    assert config.slug == "investigation_root_cause"
    assert config.family == "INVESTIGATION"
    assert len(config.tasks) >= 4
    assert any(cp.is_blocking for cp in config.checkpoints)
