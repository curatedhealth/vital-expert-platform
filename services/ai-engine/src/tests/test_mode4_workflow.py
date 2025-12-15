"""
Smoke test for legacy Mode 4 workflow import.
"""

import pytest

from langgraph_workflows.mode4_autonomous_manual_workflow import Mode4AutonomousManualWorkflow


def test_mode4_workflow_shim_imports():
    wf = Mode4AutonomousManualWorkflow()
    assert wf is not None
