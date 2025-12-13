# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3]
# DEPENDENCIES: [langgraph_workflows.ask_expert, services.deep_research_service]
"""
Mode 3: Deep Research (Manual Autonomous) - Clean workflow
Uses a dedicated deep research pipeline (plan + reasoning + RAG) for Mode 3.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/api/mode3", tags=["Mode 3 Deep Research"])


class Mode3DeepResearchRequest(BaseModel):
    agent_id: str = Field(..., description="Selected expert agent ID")
    message: str = Field(..., min_length=1, description="User message/goal")
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    selected_rag_domains: Optional[List[str]] = None
    requested_tools: Optional[List[str]] = None


async def get_tenant_id(x_tenant_id: str = Header(..., alias="x-tenant-id")) -> str:
    return x_tenant_id


def get_supabase_client():
    from supabase import create_client
    import os

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")

    return create_client(supabase_url, supabase_key)


@router.post("/deep-research")
async def execute_mode3_deep_research(
    request: Mode3DeepResearchRequest,
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Execute the dedicated deep research workflow for Mode 3.
    Returns structured autonomous_reasoning (plan, reasoning steps, iterations).
    """
    try:
        from langgraph_workflows.mode3_deep_research import run_mode3_deep_research

        supabase = get_supabase_client()
        result = await run_mode3_deep_research(
            supabase_client=supabase,
            agent_id=request.agent_id,
            message=request.message,
            tenant_id=tenant_id,
            selected_rag_domains=request.selected_rag_domains,
            requested_tools=request.requested_tools,
        )

        # Attach session if provided
        result["session_id"] = request.session_id or result.get("session_id")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error("deep_research_execution_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Mode 3 deep research failed: {e}")
