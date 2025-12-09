"""
Base interface for mission runners.

Runners encapsulate mission-family-specific logic while the workflow controls flow.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List

from ..schemas.mission_state import MissionState


class BaseMissionRunner(ABC):
    """Standard contract for all missions (24 templates)."""

    @abstractmethod
    async def create_plan(self, state: MissionState) -> List[Dict[str, Any]]:
        """Decompose the goal into an ordered plan."""
        raise NotImplementedError

    @abstractmethod
    async def execute_step(self, step: Dict[str, Any], state: MissionState) -> Dict[str, Any]:
        """Execute a single plan step; returns artifact with citations/tools_used."""
        raise NotImplementedError

    @abstractmethod
    async def synthesize(self, state: MissionState) -> Dict[str, Any]:
        """Produce final deliverable from accumulated artifacts."""
        raise NotImplementedError

    async def estimate_resources(self, state: MissionState) -> Dict[str, Any]:
        """Optional: estimate cost/time to aid preflight checks."""
        return {"cost": 1.0, "time_minutes": 5, "complexity": "medium"}
