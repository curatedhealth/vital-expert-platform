"""
Mission repository using Supabase (graceful fallback).
"""

from __future__ import annotations

import os
import structlog
from typing import Any, Dict

logger = structlog.get_logger()


def _get_supabase_client():
    try:
        from supabase import create_client, Client  # type: ignore
    except ImportError:
        logger.warning("supabase_not_available")
        return None

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        logger.warning("supabase_env_missing")
        return None
    try:
        return create_client(url, key)
    except Exception as exc:
        logger.error("supabase_client_init_failed", error=str(exc))
        return None


class MissionRepository:
    def __init__(self):
        self.client = _get_supabase_client()

    def get_template(self, template_id: str) -> Dict[str, Any] | None:
        """Fetch a mission_template row by id (returns first match or None)."""
        if not self.client or not template_id:
            return None
        try:
            resp = self.client.table("mission_templates").select("*").eq("id", template_id).limit(1).execute()
            data = getattr(resp, "data", None) or []
            return data[0] if data else None
        except Exception as exc:
            logger.error("mission_template_fetch_failed", template_id=template_id, error=str(exc))
            return None

    def save_state(self, mission_id: str, state: Dict[str, Any]) -> None:
        if not self.client:
            return
        try:
            # Build a minimal row that respects NOT NULL columns
            row: Dict[str, Any] = {
                "id": mission_id,
                "status": state.get("status") or "pending",
                "metadata": state,
            }
            # Required NOT NULL fields
            if state.get("tenant_id"):
                row["tenant_id"] = state["tenant_id"]
            # user_id is NOT NULL - use system user UUID if not provided
            # This allows API-initiated missions without auth context
            SYSTEM_USER_UUID = "00000000-0000-0000-0000-000000000000"
            row["user_id"] = state.get("user_id") or SYSTEM_USER_UUID
            if state.get("mode"):
                row["mode"] = state["mode"]
            if state.get("goal"):
                row["goal"] = state["goal"]
            if state.get("template_id"):
                row["template_id"] = state["template_id"]
            # Title/objective fall back to goal
            row["title"] = state.get("title") or state.get("goal") or "Mission"
            row["objective"] = state.get("objective") or state.get("goal") or "Mission objective"
            # Config (budget etc.)
            if state.get("config"):
                row["config"] = state["config"]
            if state.get("budget_limit"):
                row.setdefault("config", {}).update({"budget_limit": state["budget_limit"]})

            self.client.table("missions").upsert(row, on_conflict="id").execute()
        except Exception as exc:
            logger.error("mission_state_persist_failed", mission_id=mission_id, error=str(exc))

    def update_checkpoint(self, mission_id: str, checkpoint_id: str, status: str) -> None:
        if not self.client:
            return
        try:
            self.client.table("mission_checkpoints").upsert(
                {
                    "id": checkpoint_id,
                    "mission_id": mission_id,
                    "status": status,
                },
                on_conflict="id",
            ).execute()
        except Exception as exc:
            logger.error("mission_checkpoint_persist_failed", mission_id=mission_id, error=str(exc))

    def log_event(
        self,
        mission_id: str,
        event_type: str,
        event_data: Dict[str, Any],
        agent_name: str | None = None,
        agent_level: int | None = None,
        agent_task: str | None = None,
        runner_code: str | None = None,
        duration_ms: int | None = None,
    ) -> None:
        if not self.client:
            return
        try:
            self.client.table("mission_events").insert(
                {
                    "mission_id": mission_id,
                    "event_type": event_type,
                    "event_data": event_data,
                    "agent_name": agent_name,
                    "agent_level": agent_level,
                    "agent_task": agent_task,
                    "runner_code": runner_code,
                    "duration_ms": duration_ms,
                }
            ).execute()
        except Exception as exc:
            logger.error(
                "mission_event_persist_failed",
                mission_id=mission_id,
                event_type=event_type,
                error=str(exc),
            )


mission_repo = MissionRepository()
