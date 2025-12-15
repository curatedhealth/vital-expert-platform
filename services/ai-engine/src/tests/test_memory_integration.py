"""
Smoke tests for memory integration stubs (no real LLM/DB).
"""

import pytest


class DummyMemoryMixin:
    def init_memory_integration(self):
        self.initialized = True

    def format_memories_for_context(self, memories=None):
        return memories or []


def test_memory_mixin_init():
    mixin = DummyMemoryMixin()
    mixin.init_memory_integration()
    assert getattr(mixin, "initialized", False)


def test_memory_mixin_format():
    mixin = DummyMemoryMixin()
    assert mixin.format_memories_for_context([1, 2]) == [1, 2]
    assert mixin.format_memories_for_context(None) == []
