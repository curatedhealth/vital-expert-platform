"""
Context Enrichment Service for Modes 1/2.
Runs L3 strategy + L4 evidence (fast mode) under a strict timeout budget.
"""

import asyncio
import time
from typing import Any, Dict, List, Optional

from agents.base_agent import AgentConfig
from agents.l3_specialists.l3_context_specialist import L3ContextSpecialist
from agents.l4_workers.l4_evidence import L4EvidenceSynthesizer


class ContextEnrichmentService:
    def __init__(
        self,
        strategist: Optional[L3ContextSpecialist] = None,
        evidence_worker: Optional[L4EvidenceSynthesizer] = None,
        total_timeout: float = 2.5,
        l3_timeout: float = 1.0,
    ):
        self.strategist = strategist or L3ContextSpecialist(
            AgentConfig(id="l3-context-default", name="L3Context", base_system_prompt="", metadata={})
        )
        self.evidence_worker = evidence_worker or L4EvidenceSynthesizer()
        self.total_timeout = total_timeout
        self.l3_timeout = l3_timeout

    async def enrich(self, goal: str, user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Light Deep Agent loop:
        1) Fast L3 strategy (intent, expanded_terms, recommended_tools)
        2) Fast L4 evidence retrieval (canonical L5 IDs) with remaining budget
        """
        user_context = user_context or {}
        start = time.time()

        strategy = await self._run_l3(goal)
        elapsed = time.time() - start
        remaining_budget = max(self.total_timeout - elapsed, 0.1)

        evidence = await self._run_l4(goal, strategy, remaining_budget)

        enriched_context = {
            "intent": strategy.get("intent"),
            "expanded_terms": strategy.get("expanded_terms"),
            "recommended_tools": strategy.get("recommended_tools"),
            "verified_facts": evidence.get("facts"),
            "citations": evidence.get("citations"),
            "tools_used": evidence.get("tools_used"),
            "goal": goal,
            "user_context": user_context,
        }

        ui_updates = [
            {
                "type": "VitalThinking",
                "payload": {
                    "steps": ["Strategizing", "Gathering evidence"],
                    "status": "complete",
                },
            }
        ]

        return {"enriched_context": enriched_context, "ui_updates": ui_updates}

    async def _run_l3(self, goal: str) -> Dict[str, Any]:
        try:
            result = await asyncio.wait_for(
                self.strategist.analyze_query(goal),
                timeout=self.l3_timeout,
            )
            if isinstance(result, dict):
                return result
        except Exception:
            pass

        return {
            "intent": "general",
            "expanded_terms": [goal],
            "recommended_tools": ["L5-PM", "L5-WEB"],
        }

    async def _run_l4(self, goal: str, strategy: Dict[str, Any], timeout_seconds: float) -> Dict[str, Any]:
        keywords = strategy.get("expanded_terms") or [goal]
        sources: List[str] = strategy.get("recommended_tools") or self.evidence_worker.config.allowed_l5_tools or ["L5-PM"]

        params = {
            "mode": "fast",
            "sources": sources,
            "keywords": keywords,
        }

        try:
            result = await asyncio.wait_for(
                self.evidence_worker.execute(
                    task="evidence",
                    params=params,
                    context={"goal": goal},
                ),
                timeout=timeout_seconds,
            )
            return {
                "facts": result.get("output"),
                "citations": result.get("citations"),
                "tools_used": result.get("tools_used", sources),
            }
        except Exception:
            return {
                "facts": None,
                "citations": [],
                "tools_used": sources,
            }
