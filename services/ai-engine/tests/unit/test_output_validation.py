from langgraph_workflows.modes34.runners.output_validation import (
    ValidationError,
    validate_communication_outputs,
    validate_evaluation_outputs,
    validate_generic_outputs,
    validate_investigation_outputs,
    validate_problem_solving_outputs,
)


def test_validate_evaluation_outputs_success() -> None:
    data = validate_evaluation_outputs(
        criteria=[{"criterion": "accuracy", "weight": 0.5}],
        scores=[{"criterion": "accuracy", "score": 0.9}],
        recommendations=["Improve recall"],
    )
    assert data["criteria"][0]["criterion"] == "accuracy"
    assert data["scores"][0]["score"] == 0.9
    assert data["recommendations"][0]["text"] == "Improve recall"


def test_validate_evaluation_outputs_failure() -> None:
    try:
        validate_evaluation_outputs(criteria=[{"criterion": "acc", "weight": 1.2}], scores=[], recommendations=[])
    except ValidationError:
        return
    assert False, "Expected ValidationError for invalid weight"


def test_validate_investigation_outputs_success() -> None:
    data = validate_investigation_outputs(
        hypotheses=[{"title": "H1"}],
        evidence=[{"source": "log", "finding": "error"}],
        findings=[{"cause": "bug", "probability": 0.7}],
        recommendations=[{"action": "patch"}],
    )
    assert data["hypotheses"][0]["title"] == "H1"
    assert data["findings"][0]["cause"] == "bug"


def test_validate_problem_solving_outputs_success() -> None:
    data = validate_problem_solving_outputs(
        options=[{"name": "Option A"}],
        scores=[{"option": "Option A", "score": 0.8}],
        plan_steps=[{"step": "Do X"}],
    )
    assert data["options"][0]["name"] == "Option A"
    assert data["scores"][0]["score"] == 0.8
    assert data["plan_steps"][0]["step"] == "Do X"


def test_validate_communication_outputs_success() -> None:
    data = validate_communication_outputs(
        segments=[{"segment": "Clinicians"}],
        messages=[{"segment": "Clinicians", "key_message": "Key"}],
        plan=[{"channel": "Email"}],
    )
    assert data["segments"][0]["segment"] == "Clinicians"
    assert data["messages"][0]["key_message"] == "Key"
    assert data["channel_plan"][0]["channel"] == "Email"


def test_validate_generic_outputs_success() -> None:
    data = validate_generic_outputs(
        plan=[{"step": "Do work", "owner": "A"}],
        outputs=[{"result": "ok"}],
    )
    assert data["plan"][0]["step"] == "Do work"
    assert data["outputs"][0]["result"] == "ok"
