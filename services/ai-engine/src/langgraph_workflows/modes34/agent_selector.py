"""
Mode 4 agent selector scaffold.

Phase 2: placeholder selection logic. Replace with GraphRAG/HybridSearch
integration in Phase 3.
"""

from __future__ import annotations

from typing import Any, Dict, List
import structlog

from services.runner_registry import runner_registry

logger = structlog.get_logger()


def _pick_top_l2(limit: int = 2) -> List[Dict[str, Any]]:
    compat = runner_registry.load_compat()
    runners = runner_registry.load_all()
    if not compat or not runners:
        return []
    compat_sorted = sorted(compat, key=lambda c: c.get("match_score") or 0, reverse=True)
    team = []
    for row in compat_sorted:
        if row.get("agent_lvl") != 2:
            continue
        code = row.get("run_code")
        if code and code in runners:
            team.append(
                {
                    "id": code,
                    "name": runners[code].get("name") or code,
                    "level": "L2",
                    "cat": runners[code].get("cat_code"),
                    "stage": runners[code].get("stage"),
                }
            )
        if len(team) >= limit:
            break
    return team


def select_team(goal: str, metadata: Dict[str, Any] | None = None) -> List[Dict[str, Any]]:
    """
    Best-effort team selection for Mode 4.
    Strategy: prefer template category (if provided), else top L2 by compat score.
    """
    metadata = metadata or {}
    preferred_cat = metadata.get("template_cat") or metadata.get("template_family")

    runners = runner_registry.load_all()
    team: List[Dict[str, Any]] = []

    # If we have a preferred category, try to pick two L2 from that category
    if preferred_cat and runners:
        for code, row in runners.items():
            if row.get("cat_code") and str(row.get("cat_code")).lower() == str(preferred_cat).lower():
                team.append(
                    {
                        "id": code,
                        "name": row.get("name") or code,
                        "level": "L2",
                        "cat": row.get("cat_code"),
                        "stage": row.get("stage"),
                    }
                )
            if len(team) >= 2:
                break

    # Fallback to top-scoring L2 from compat table
    if len(team) < 2:
        team.extend([m for m in _pick_top_l2(limit=2 - len(team)) if m not in team])

    # Final fallback: if still empty, return a stub entry
    if not team:
        team = [{"id": "l2_generalist", "name": "Generalist Expert", "level": "L2"}]

    logger.info("mode4_team_selected", team=team, goal_preview=goal[:120])
    return team
