"""
Mission Service Stub (Phase 1)

LangGraph-backed missions for Modes 3/4 will be integrated here in Phase 3.
For now, provide placeholders so imports succeed and unit tests can target
these entry points without failing due to missing modules.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4


class MissionService:
    """
    Stubbed mission service for autonomous modes (3/4).
    Replace with LangGraph wrapper integrations in later phases.
    """

    async def create_mission(
        self,
        *,
        title: str,
        objective: str,
        mode: int,
        tenant_id: UUID,
        user_id: UUID,
        selected_agents: Optional[List[str]] = None,
        budget_limit: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        # Placeholder: return a predictable mission structure
        return {
            "id": str(uuid4()),
            "title": title,
            "objective": objective,
            "mode": mode,
            "status": "draft",
            "selected_agents": selected_agents or [],
            "budget_limit": budget_limit or 10.0,
            "metadata": metadata or {},
        }

    async def get_mission(self, mission_id: UUID) -> Dict[str, Any]:
        raise NotImplementedError("MissionService.get_mission not implemented in Phase 1")

    async def list_missions(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        raise NotImplementedError("MissionService.list_missions not implemented in Phase 1")

    async def respond_checkpoint(
        self,
        mission_id: UUID,
        checkpoint_id: UUID,
        action: str,
        option: Optional[str] = None,
        reason: Optional[str] = None,
        modifications: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        raise NotImplementedError("MissionService.respond_checkpoint not implemented in Phase 1")
