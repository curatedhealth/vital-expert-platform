"""
Missions API - status endpoints (Phase 1 stub).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/missions", tags=["missions-status"])


class MissionStatusResponse(BaseModel):
    mission_id: str
    status: str


@router.get("/{mission_id}")
async def get_mission(mission_id: str) -> MissionStatusResponse:
    # Phase 1 stub: return draft status
    return MissionStatusResponse(mission_id=mission_id, status="draft")
