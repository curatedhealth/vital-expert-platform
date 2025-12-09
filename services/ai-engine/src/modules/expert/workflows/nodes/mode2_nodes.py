"""
Mode 2 selection node: uses L1 Master Orchestrator for auto-selecting an expert.

Uses the same Fusion Intelligence approach as Mode 4 but selects a single expert
instead of a team. Falls back gracefully when L1 orchestrator is unavailable.
"""

import asyncio
import structlog
from typing import Any, Dict, Optional, Tuple, List

from ...schemas.interactive_state import InteractiveState

logger = structlog.get_logger()


class Mode2SelectionNode:
    """
    Auto-selects an expert for Mode 2 using L1 Master Orchestrator's Fusion Intelligence.

    This mirrors Mode 4's team selection approach but picks a single best expert
    instead of a full team.
    """

    def __init__(
        self,
        l1_orchestrator: Optional[Any] = None,
        timeout_seconds: float = 2.5,
    ):
        """
        Initialize Mode2SelectionNode.

        Args:
            l1_orchestrator: L1MasterOrchestrator instance for Fusion-based selection.
                            If None, selection will return a fallback error.
            timeout_seconds: Maximum time to wait for selection.
        """
        self.l1_orchestrator = l1_orchestrator
        self.timeout_seconds = timeout_seconds

    async def run(self, state: InteractiveState) -> Dict[str, Any]:
        """
        Run expert selection using L1 orchestrator's Fusion Intelligence.

        Returns:
            Dict with 'expert_id' and 'ui_updates', or error updates if selection fails.
        """
        # Extract query from messages
        messages = state.get("messages") or []
        query = ""
        if messages:
            last_msg = messages[-1]
            query = getattr(last_msg, "content", None) or (
                last_msg.get("content") if isinstance(last_msg, dict) else ""
            )

        tenant_id = state.get("tenant_id") or ""
        user_context = state.get("user_context", {})

        logger.info(
            "mode2_selection_started",
            tenant_id=tenant_id,
            query_preview=query[:100] if query else "(empty)",
            has_orchestrator=self.l1_orchestrator is not None,
        )

        # If no orchestrator, return error
        if not self.l1_orchestrator:
            logger.warning("mode2_no_orchestrator", tenant_id=tenant_id)
            return {
                "ui_updates": [
                    {
                        "type": "VitalAgentCard",
                        "payload": {"status": "error", "error": "Selection service unavailable"},
                    }
                ]
            }

        try:
            # Use L1MasterOrchestrator.select_team with max_team_size=1 for single expert
            selected_ids, evidence = await asyncio.wait_for(
                self.l1_orchestrator.select_team(
                    query=query,
                    context=user_context,
                    tenant_id=tenant_id,
                    max_team_size=1,  # Mode 2 selects single expert
                ),
                timeout=self.timeout_seconds,
            )

            logger.info(
                "mode2_selection_result",
                tenant_id=tenant_id,
                selected_count=len(selected_ids),
                confidence=evidence.confidence if evidence else 0,
            )

            # Handle empty selection
            if not selected_ids:
                return {
                    "ui_updates": [
                        {
                            "type": "VitalAgentCard",
                            "payload": {
                                "status": "unselected",
                                "reasoning": evidence.reasoning if evidence else "No suitable expert found",
                            },
                        }
                    ]
                }

            expert_id = selected_ids[0]

            return {
                "expert_id": expert_id,
                "selection_evidence": evidence.model_dump() if hasattr(evidence, 'model_dump') else {},
                "ui_updates": [
                    {
                        "type": "VitalAgentCard",
                        "payload": {
                            "agent": {"id": expert_id},
                            "status": "active",
                            "variant": "compact",
                            "confidence": evidence.confidence if evidence else 0,
                            "reasoning": evidence.reasoning if evidence else "",
                        },
                    }
                ],
            }

        except asyncio.TimeoutError:
            logger.error(
                "mode2_selection_timeout",
                tenant_id=tenant_id,
                timeout=self.timeout_seconds,
            )
            return {
                "ui_updates": [
                    {
                        "type": "VitalAgentCard",
                        "payload": {"status": "error", "error": "Selection timed out"},
                    }
                ]
            }
        except Exception as exc:
            logger.error(
                "mode2_selection_failed",
                tenant_id=tenant_id,
                error=str(exc),
            )
            return {
                "ui_updates": [
                    {
                        "type": "VitalAgentCard",
                        "payload": {"status": "error", "error": str(exc)},
                    }
                ]
            }
