"""
Smoke tests for phase2 memory mixin stubs.
"""

import pytest


class DummyWorkflow:
    def build_graph(self):
        return None


def test_dummy_workflow_build_graph():
    wf = DummyWorkflow()
    assert wf.build_graph() is None
