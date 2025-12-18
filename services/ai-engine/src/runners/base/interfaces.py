"""
Runner interfaces and protocols.

This module defines the abstract interfaces that all runners must implement.
"""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Dict, Any

InputT = TypeVar("InputT")
OutputT = TypeVar("OutputT")
StateT = TypeVar("StateT")


class RunnerInterface(ABC, Generic[InputT, OutputT]):
    """Base interface for all runners."""

    @abstractmethod
    async def execute(self, input: InputT, context: Dict[str, Any]) -> OutputT:
        """Execute the runner with given input and context."""
        pass


class FamilyRunnerInterface(ABC, Generic[StateT]):
    """Interface for family runners with state management."""

    @abstractmethod
    async def create_plan(self, state: StateT) -> list:
        """Create execution plan."""
        pass

    @abstractmethod
    async def execute_step(self, step: dict, state: StateT) -> dict:
        """Execute a single step."""
        pass

    @abstractmethod
    async def synthesize(self, state: StateT) -> dict:
        """Synthesize final results."""
        pass
