"""
Smoke tests for legacy Phase 5 integration shims.
"""

import pytest

from langgraph_workflows.mode1_enhanced_workflow import Mode1EnhancedWorkflow
from langgraph_workflows.enrichment_nodes import EnrichmentNodes
from langgraph_workflows.memory_nodes import MemoryNodes


def test_mode1_enhanced_workflow_imports():
    wf = Mode1EnhancedWorkflow()
    assert wf is not None


def test_enrichment_nodes_imports():
    nodes = EnrichmentNodes()
    nodes.add("n1")
    assert nodes.nodes == ["n1"]


def test_memory_nodes_imports():
    nodes = MemoryNodes()
    nodes.add("m1")
    assert nodes.nodes == ["m1"]
