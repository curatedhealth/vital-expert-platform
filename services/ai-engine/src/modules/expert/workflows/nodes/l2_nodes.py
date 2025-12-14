"""
L2 generation node: hydrate expert and generate response using enriched context.
"""

import asyncio
from typing import Any, Dict

from langchain_core.messages import AIMessage

from ...schemas.interactive_state import InteractiveState


class L2GenerationNode:
    def __init__(self, agent_factory: Any, timeout_seconds: float = 10.0):
        """
        Initialize L2 generation node.

        Args:
            agent_factory: Factory for loading agents from database.
            timeout_seconds: Base timeout for agent loading.
                            LLM generation uses 6x this value (default: 60s).
        """
        self.agent_factory = agent_factory
        self.timeout_seconds = timeout_seconds
        # LLM generation needs much longer - complex prompts can take 30-60s
        self.llm_timeout_seconds = timeout_seconds * 6

    async def run(self, state: InteractiveState) -> Dict[str, Any]:
        agent_id = state.get("agent_id")
        if not agent_id:
            return {
                "ui_updates": [
                    {"type": "VitalAgentCard", "payload": {"status": "unselected", "error": "agent_missing"}}
                ]
            }

        goal = None
        messages = state.get("messages") or []
        if messages:
            last_msg = messages[-1]
            # Handle both dict messages (from API) and LangChain message objects
            if isinstance(last_msg, dict):
                goal = last_msg.get("content")
            else:
                goal = getattr(last_msg, "content", None)
        goal = goal or state.get("enriched_context", {}).get("goal") or ""

        enriched_context = state.get("enriched_context", {})

        try:
            agent = await asyncio.wait_for(
                self.agent_factory.load_agent(agent_id),
                timeout=self.timeout_seconds,
            )
        except Exception as exc:
            return {"ui_updates": [{"type": "VitalAgentCard", "payload": {"status": "error", "error": str(exc)}}]}

        try:
            result = await asyncio.wait_for(
                agent.execute(
                    task="review",
                    params={"goal": goal},
                    context={"goal": goal, "artifacts": [enriched_context]},
                ),
                timeout=self.llm_timeout_seconds,  # Use longer timeout for LLM generation
            )
        except asyncio.TimeoutError:
            return {"ui_updates": [{"type": "VitalResponse", "payload": {"status": "error", "error": "LLM generation timed out. Please try a shorter query."}}]}
        except Exception as exc:
            return {"ui_updates": [{"type": "VitalResponse", "payload": {"status": "error", "error": str(exc)}}]}

        # Extract content - handle dict outputs from review() by extracting notes or serializing
        raw_output = result.get("analysis") or result.get("output") or result
        if isinstance(raw_output, dict):
            # If it's a review result, extract the notes as the content
            content = raw_output.get("notes") or raw_output.get("content") or str(raw_output)
        else:
            content = str(raw_output) if raw_output else "No response generated."

        citations = result.get("citations") or enriched_context.get("citations") or []

        return {
            "messages": [AIMessage(content=content)],
            "ui_updates": state.get("ui_updates", [])
            + [{"type": "VitalResponse", "payload": {"citations": citations}}],
        }
