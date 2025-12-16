"""Validate strategy runner template loading."""

from pathlib import Path

from langgraph_workflows.modes34.templates.schema import TemplateConfig


def test_strategy_template_loads_and_has_required_fields() -> None:
    template_path = Path(__file__).resolve().parents[2] / "src" / "langgraph_workflows" / "modes34" / "templates" / "scenario_planning.yaml"
    config = TemplateConfig.from_yaml(template_path)

    assert config.slug == "scenario_planning"
    assert config.family == "STRATEGY"
    assert len(config.tasks) >= 3
    assert any(cp.is_blocking for cp in config.checkpoints)
