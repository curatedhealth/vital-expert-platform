from pathlib import Path

from langgraph_workflows.modes34.templates.schema import TemplateConfig


def _load_template(slug: str) -> TemplateConfig:
    path = (
        Path(__file__).resolve().parents[3]
        / "src"
        / "langgraph_workflows"
        / "modes34"
        / "templates"
        / f"{slug}.yaml"
    )
    return TemplateConfig.from_yaml(path)


def test_evaluation_checkpoints() -> None:
    config = _load_template("evaluation_rubric")
    types = {cp.checkpoint_type: cp.is_blocking for cp in config.checkpoints}
    assert types.get("plan_approval") is True
    assert types.get("final_review") is False


def test_problem_solving_checkpoints() -> None:
    config = _load_template("solution_design")
    types = {cp.checkpoint_type: cp.is_blocking for cp in config.checkpoints}
    assert types.get("plan_approval") is True
    assert types.get("final_review") is False


def test_communication_checkpoints() -> None:
    config = _load_template("communication_campaign")
    types = {cp.checkpoint_type: cp.is_blocking for cp in config.checkpoints}
    assert types.get("plan_approval") is True
    assert types.get("final_review") is False


def test_generic_checkpoints() -> None:
    config = _load_template("generic_mission")
    types = {cp.checkpoint_type: cp.is_blocking for cp in config.checkpoints}
    assert types.get("plan_approval") is True
    assert types.get("final_review") is False
