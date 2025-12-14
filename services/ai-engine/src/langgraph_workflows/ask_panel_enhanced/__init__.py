"""
Ask Panel Enhanced Workflow Module

Provides real-time streaming multi-expert panel consultations with:
- Real LLM calls (no mocks/hardcoded responses)
- Agent-to-agent communication
- board_session database integration
- Comprehensive summaries and consensus building
- Server-Sent Events (SSE) streaming
"""

from .workflow import EnhancedAskPanelWorkflow

__all__ = ["EnhancedAskPanelWorkflow"]
