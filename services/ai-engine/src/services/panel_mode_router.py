"""
Panel Mode Router

Maps Ask Panel slugs (structured_panel, open_panel, etc.) to the appropriate
workflow implementation. For v1, all modes use EnhancedAskPanelWorkflow but we
thread through template metadata and panel_mode so behaviour can be specialized
later without changing the public API.
"""

from enum import Enum
from typing import Optional, Dict, Any

import structlog

from langgraph_workflows.ask_panel_enhanced import EnhancedAskPanelWorkflow
from services.supabase_client import SupabaseClient
from services.agent_service import AgentService
from services.unified_rag_service import UnifiedRAGService
from services.llm_service import LLMService
from services.panel_template_service import PanelTemplateService

logger = structlog.get_logger()


class PanelMode(str, Enum):
    STRUCTURED_PANEL = "structured_panel"
    OPEN_PANEL = "open_panel"
    EXPERT_PANEL = "expert_panel"
    SOCRATIC_PANEL = "socratic_panel"
    DEVILS_ADVOCATE = "devils_advocate_panel"
    STRUCTURED_ASK_EXPERT = "structured_ask_expert_panel"


async def get_workflow_for_panel(
    supabase_client: SupabaseClient,
    agent_service: AgentService,
    rag_service: UnifiedRAGService,
    llm_service: LLMService,
    template_service: Optional[PanelTemplateService],
    template_slug: str,
) -> EnhancedAskPanelWorkflow:
    """
    Resolve and construct the correct workflow for a given panel slug.

    For now all 6 main panels share EnhancedAskPanelWorkflow; we simply
    annotate the workflow with template metadata and panel_mode so that
    future mode-specific workflows can branch on those values.
    """
    try:
        panel_mode: Optional[PanelMode] = PanelMode(template_slug)
    except ValueError:
        panel_mode = None
        logger.warning(
            "panel_mode_unknown_slug_fallback_generic",
            template_slug=template_slug,
        )

    template_metadata: Dict[str, Any] = {}
    if template_service:
        try:
            template_metadata = await template_service.get_template_metadata(
                template_slug
            )
        except Exception as e:
            logger.error(
                "panel_mode_template_metadata_failed",
                slug=template_slug,
                error=str(e),
            )

    workflow = EnhancedAskPanelWorkflow(
        supabase_client=supabase_client,
        agent_service=agent_service,
        rag_service=rag_service,
        llm_service=llm_service,
        template_metadata=template_metadata,
        panel_mode=panel_mode.value if panel_mode else None,
    )
    await workflow.initialize()
    return workflow


