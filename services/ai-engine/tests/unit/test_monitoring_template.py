"""Validate monitoring runner template loading."""

from pathlib import Path

from langgraph_workflows.modes34.templates.schema import TemplateConfig


def test_monitoring_template_loads_and_has_required_fields() -> None:
    template_path = Path(__file__).resolve().parents[2] / "src" / "langgraph_workflows" / "modes34" / "templates" / "regulatory_watch.yaml"
    config = TemplateConfig.from_yaml(template_path)

    assert config.slug == "regulatory_watch"
    assert config.family == "MONITORING"
    assert len(config.tasks) >= 3
    assert any(cp.is_blocking is False for cp in config.checkpoints)
