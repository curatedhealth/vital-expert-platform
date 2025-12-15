"""
Functional-ish phase2 memory test with dummy workflow.
"""

import pytest


class DummyWorkflow:
    def build_graph(self):
        return None

    def format_memories_for_context(self, memories=None):
        return memories or []


def test_dummy_workflow_build_graph():
    wf = DummyWorkflow()
    assert wf.build_graph() is None
    assert wf.format_memories_for_context([1]) == [1]
