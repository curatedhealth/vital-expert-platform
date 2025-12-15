"""
Smoke test for legacy Mode 3 workflow import.
"""

import pytest

from langgraph_workflows.mode3_autonomous_auto_workflow import Mode3AutonomousAutoWorkflow


def test_mode3_workflow_shim_imports():
    wf = Mode3AutonomousAutoWorkflow()
    assert wf is not None
