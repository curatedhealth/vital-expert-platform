"""
Smoke tests for tool_chain_executor compatibility with current toolchain.
"""

import pytest

from langgraph_workflows.tool_chain_executor import (
    ToolChainExecutor,
    ToolChainPlan,
    ToolChainResult,
    ToolStep,
    StepResult,
)


def test_tool_chain_constructs():
    plan = ToolChainPlan()
    exec = ToolChainExecutor()
    assert plan is not None
    assert exec is not None


def test_tool_chain_run_smoke():
    exec = ToolChainExecutor()
    exec.add_step(ToolStep(name="s1", input_data={"a": 1}))
    result = exec.run()
    assert "steps_executed" in result


def test_step_result_smoke():
    res = StepResult(name="s1", output={"ok": True})
    assert res.name == "s1"


def test_tool_chain_result_smoke():
    res = ToolChainResult(steps=["a", "b"])
    assert res.steps == ["a", "b"]
