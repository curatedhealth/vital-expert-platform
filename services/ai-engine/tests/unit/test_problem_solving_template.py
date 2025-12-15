"""Validate problem solving runner template loading."""

from pathlib import Path

from langgraph_workflows.modes34.templates.schema import TemplateConfig


def test_problem_solving_template_loads_and_has_required_fields() -> None:
    template_path = (
        Path(__file__).resolve().parents[3]
        / "src"
        / "langgraph_workflows"
        / "modes34"
        / "templates"
        / "solution_design.yaml"
    )
    config = TemplateConfig.from_yaml(template_path)

    assert config.slug == "solution_design"
    assert config.family == "PROBLEM_SOLVING"
    assert len(config.tasks) >= 3
    assert any(cp.is_blocking for cp in config.checkpoints)
