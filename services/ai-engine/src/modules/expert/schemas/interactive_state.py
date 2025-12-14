"""
Interactive state schema for Modes 1/2 (interactive chat).
Tracks conversation context, selected expert, enrichment outputs, and UI updates.
"""

from typing import Any, Dict, List, Literal, Optional, TypedDict, Annotated

from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


def append_ui_updates(current: List[Dict[str, Any]], new: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Reducer-friendly append for UI updates."""
    if not new:
        return current
    return current + new


class InteractiveState(TypedDict, total=False):
    # Identity
    conversation_id: str
    tenant_id: str
    user_id: str
    mode: Literal[1, 2]

    # Conversation history
    messages: Annotated[List[BaseMessage], add_messages]

    # Agent selection (Mode 1: provided, Mode 2: auto-selected)
    agent_id: Optional[str]

    # Enriched context produced by L3/L4 (intent, expanded_terms, facts, citations, tools_used)
    enriched_context: Dict[str, Any]

    # UI updates for streaming (thinking indicators, selection cards, etc.)
    ui_updates: Annotated[List[Dict[str, Any]], append_ui_updates]


DEFAULT_INTERACTIVE_STATE: InteractiveState = {
    "messages": [],
    "enriched_context": {},
    "ui_updates": [],
}
