"""Task Runner Registry - Central registry for all 88 cognitive runners."""
# TODO: Implement registry pattern with auto-discovery

from typing import Dict, Type
from .base_task_runner import TaskRunner, TaskRunnerCategory

_RUNNER_REGISTRY: Dict[str, Type[TaskRunner]] = {}

def register_task_runner(runner_class: Type[TaskRunner]) -> Type[TaskRunner]:
    """Decorator to register a task runner."""
    _RUNNER_REGISTRY[runner_class.runner_id] = runner_class
    return runner_class

class TaskRunnerRegistry:
    """Central registry for task runners."""

    @classmethod
    def get(cls, runner_id: str) -> Type[TaskRunner]:
        return _RUNNER_REGISTRY[runner_id]

    @classmethod
    def list_by_category(cls, category: TaskRunnerCategory) -> list:
        return [r for r in _RUNNER_REGISTRY.values() if r.category == category]

    @classmethod
    def all_runners(cls) -> Dict[str, Type[TaskRunner]]:
        return _RUNNER_REGISTRY.copy()
