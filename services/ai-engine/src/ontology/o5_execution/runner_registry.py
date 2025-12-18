"""
Runner registry (read-only) backed by Supabase vital_runners table.
Graceful fallback to in-memory stub if Supabase is unavailable.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional
import structlog

logger = structlog.get_logger()


def _create_supabase_client():
    try:
        from supabase import create_client  # type: ignore
    except ImportError:
        logger.warning("runner_registry_supabase_missing")
        return None

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        logger.warning("runner_registry_env_missing")
        return None
    try:
        return create_client(url, key)
    except Exception as exc:
        logger.error("runner_registry_client_error", error=str(exc))
        return None


class RunnerRegistry:
    def __init__(self):
        self.client = _create_supabase_client()
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._compat: list[Dict[str, Any]] = []

    def load_all(self) -> Dict[str, Dict[str, Any]]:
        if self._cache:
            return self._cache
        if not self.client:
            return {}
        try:
            resp = self.client.table("vital_runners").select("*").execute()
            for row in resp.data or []:
                code = row.get("run_code")
                if code:
                    self._cache[code] = row
            logger.info("runner_registry_loaded", count=len(self._cache))
        except Exception as exc:
            logger.error("runner_registry_load_failed", error=str(exc))
        return self._cache

    def load_compat(self) -> list[Dict[str, Any]]:
        if self._compat:
            return self._compat
        if not self.client:
            return []
        try:
            resp = self.client.table("vital_runner_agent_compat").select("*").execute()
            self._compat = resp.data or []
            logger.info("runner_registry_compat_loaded", count=len(self._compat))
        except Exception as exc:
            logger.error("runner_registry_compat_failed", error=str(exc))
        return self._compat

    def get(self, code: str) -> Optional[Dict[str, Any]]:
        if code in self._cache:
            return self._cache[code]
        self.load_all()
        return self._cache.get(code)

    def pick_for_stage(self, stage: str, agent_level: int | None = None) -> Optional[Dict[str, Any]]:
        """
        Best-effort runner selection by stage semantic.
        Falls back to compatibility matrix by level and to first available runner.
        """
        self.load_all()
        self.load_compat()
        if not self._cache:
            return None

        stage_map = {
            "planning": ["plan", "decompose", "clarify"],
            "evidence": ["scan", "map", "summarize"],
            "analysis": ["rank", "assess_risk", "validate_evidence", "compare"],
            "synthesis": ["synthesize", "compose", "contextualize"],
            "qa": ["audit", "validate_evidence", "proofread"],
        }
        preferred = stage_map.get(stage, [])
        for code in preferred:
            if code in self._cache:
                return self._cache[code]

        # Compatibility by level
        if agent_level is not None and self._compat:
            compat_sorted = sorted(
                [c for c in self._compat if c.get("agent_lvl") == agent_level],
                key=lambda c: c.get("match_score") or 0,
                reverse=True,
            )
            for comp in compat_sorted:
                code = comp.get("run_code")
                if code and code in self._cache:
                    return self._cache[code]

        # Fallback: pick any runner in matching category if possible
        for runner in self._cache.values():
            cat = (runner.get("cat_code") or "").lower()
            if stage in cat:
                return runner

        # Last resort: first runner
        return next(iter(self._cache.values()))


runner_registry = RunnerRegistry()
