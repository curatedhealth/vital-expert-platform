"""
Functional-ish memory integration test using dummy mixin (no LLM/DB).
"""

import pytest


class MemoryIntegrationMixin:
    def __init__(self):
        self.memories = []

    def init_memory_integration(self):
        self.initialized = True

    def store_memory(self, content, metadata=None):
        self.memories.append({"content": content, "metadata": metadata or {}})

    def recall_memories(self):
        return self.memories

    def format_memories_for_context(self, memories=None):
        return memories or []


@pytest.fixture
def mixin():
    return MemoryIntegrationMixin()


def test_memory_init(mixin):
    mixin.init_memory_integration()
    assert getattr(mixin, "initialized", False)


def test_memory_store_and_recall(mixin):
    mixin.store_memory("Test content", {"agent_id": "a1"})
    recalled = mixin.recall_memories()
    assert recalled and recalled[0]["content"] == "Test content"


def test_memory_format(mixin):
    assert mixin.format_memories_for_context([1, 2]) == [1, 2]
    assert mixin.format_memories_for_context(None) == []
