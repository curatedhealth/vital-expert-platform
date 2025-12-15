"""Validate evaluation runner template loading."""

from pathlib import Path

from langgraph_workflows.modes34.templates.schema import TemplateConfig


def test_evaluation_template_loads_and_has_required_fields() -> None:
    template_path = (
        Path(__file__).resolve().parents[3]
        / "src"
        / "langgraph_workflows"
        / "modes34"
        / "templates"
        / "evaluation_rubric.yaml"
    )
    config = TemplateConfig.from_yaml(template_path)

    assert config.slug == "evaluation_rubric"
    assert config.family == "EVALUATION"
    assert len(config.tasks) >= 3
    assert any(cp.is_blocking for cp in config.checkpoints)
