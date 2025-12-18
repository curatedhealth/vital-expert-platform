"""
Mission repository using Supabase (graceful fallback).
"""

from __future__ import annotations

import os
import structlog
from typing import Any, Dict, List

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
            # Required NOT NULL fields with defaults
            # tenant_id is NOT NULL - use platform default if not provided
            PLATFORM_TENANT_UUID = "00000000-0000-0000-0000-000000000001"
            row["tenant_id"] = state.get("tenant_id") or PLATFORM_TENANT_UUID
            # user_id is NOT NULL - use system user UUID if not provided
            # This allows API-initiated missions without auth context
            SYSTEM_USER_UUID = "00000000-0000-0000-0000-000000000000"
            row["user_id"] = state.get("user_id") or SYSTEM_USER_UUID
            # mode is NOT NULL - default to 3 (autonomous) if not provided
            row["mode"] = state.get("mode") or 3
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
            # Dual-write normalized tables (non-destructive)
            self._upsert_selected_agents(mission_id, state)
            self._upsert_plan_steps(mission_id, state.get("plan"))
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
        tenant_id: str | None = None,
    ) -> None:
        if not self.client:
            return
        try:
            # Include extra metadata in event_data JSONB field
            # These columns don't exist in the base schema but are useful context
            enriched_event_data = {
                **event_data,
                "agent_level": agent_level,
                "runner_code": runner_code,
                "duration_ms": duration_ms,
                "tenant_id": tenant_id,
            }
            row = {
                "mission_id": mission_id,
                "event_type": event_type,
                "event_data": enriched_event_data,
                "agent_name": agent_name,
                "agent_task": agent_task,
            }
            self.client.table("mission_events").insert(row).execute()
        except Exception as exc:
            logger.error(
                "mission_event_persist_failed",
                mission_id=mission_id,
                event_type=event_type,
                error=str(exc),
            )

    # ------------------------------------------------------------------ helpers
    def _upsert_selected_agents(self, mission_id: str, state: Dict[str, Any]) -> None:
        if not self.client:
            return
        try:
            agents: List[Dict[str, Any]] = []
            if state.get("selected_agent"):
                agents.append(
                    {
                        "mission_id": mission_id,
                        "agent_id": state.get("selected_agent"),
                        "agent_name": state.get("selected_agent_name"),
                        "role": "primary",
                        "selection_order": 1,
                    }
                )
            team = state.get("selected_team") or []
            for idx, agent_id in enumerate(team, start=len(agents) + 1):
                agents.append(
                    {
                        "mission_id": mission_id,
                        "agent_id": agent_id,
                        "agent_name": None,
                        "role": "team",
                        "selection_order": idx,
                    }
                )

            if not agents:
                return

            # replace existing rows for this mission
            self.client.table("mission_selected_agents").delete().eq("mission_id", mission_id).execute()
            self.client.table("mission_selected_agents").insert(agents).execute()
        except Exception as exc:
            logger.error("mission_selected_agents_persist_failed", mission_id=mission_id, error=str(exc))

    def _upsert_plan_steps(self, mission_id: str, plan: Any) -> None:
        if not self.client or not plan or not isinstance(plan, list):
            return
        try:
            rows: List[Dict[str, Any]] = []
            for idx, step in enumerate(plan, start=1):
                rows.append(
                    {
                        "mission_id": mission_id,
                        "step_order": idx,
                        "title": step.get("name") or step.get("title"),
                        "details": step.get("description"),
                        "status": step.get("status") or "pending",
                        "owner_agent": step.get("agent"),
                        "owner_runner": step.get("runner"),
                        "estimated_minutes": step.get("estimated_minutes"),
                    }
                )
            if not rows:
                return
            self.client.table("mission_plan_steps").delete().eq("mission_id", mission_id).execute()
            self.client.table("mission_plan_steps").insert(rows).execute()
        except Exception as exc:
            logger.error("mission_plan_steps_persist_failed", mission_id=mission_id, error=str(exc))


mission_repo = MissionRepository()
