"""
VITAL API - Workflow Endpoints
===============================
REST endpoints for executing LangGraph workflows.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uuid

router = APIRouter()

# =============================================================================
# MODELS
# =============================================================================

class WorkflowRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    user_persona_type: Optional[str] = None  # AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
    user_role_id: Optional[str] = None


class WorkflowResponse(BaseModel):
    session_id: str
    query: str
    intent: Optional[str]
    therapeutic_area: Optional[str]
    functional_domain: Optional[str]
    primary_agent: Optional[Dict[str, Any]]
    response: str
    citations: List[Dict[str, Any]]
    latency_ms: Dict[str, float]


class StreamChunk(BaseModel):
    step: str
    data: Dict[str, Any]


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.post("/execute", response_model=WorkflowResponse)
async def execute_workflow(request: WorkflowRequest):
    """
    Execute the VITAL agentic workflow.

    This endpoint:
    1. Classifies user intent
    2. Selects appropriate agents
    3. Retrieves RAG context
    4. Enriches with graph context
    5. Generates response with citations

    The workflow adapts based on user_persona_type for persona-aware agent selection.
    """
    try:
        # Import workflow (may fail if LangGraph not installed)
        import sys
        sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL/src')

        from langgraph.graph import VITALWorkflow

        workflow = VITALWorkflow()
        session_id = request.session_id or str(uuid.uuid4())

        result = workflow.run(
            query=request.query,
            session_id=session_id,
            user_persona_type=request.user_persona_type,
            user_role_id=request.user_role_id
        )

        return WorkflowResponse(
            session_id=session_id,
            query=request.query,
            intent=result.get("intent"),
            therapeutic_area=result.get("therapeutic_area"),
            functional_domain=result.get("functional_domain"),
            primary_agent=result.get("primary_agent"),
            response=result.get("final_response", ""),
            citations=result.get("citations", []),
            latency_ms=result.get("latency_ms", {})
        )

    except ImportError as e:
        # Fallback for when LangGraph is not installed
        return await _execute_simple_workflow(request)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")


async def _execute_simple_workflow(request: WorkflowRequest) -> WorkflowResponse:
    """Simple workflow fallback when LangGraph is not available."""
    session_id = request.session_id or str(uuid.uuid4())

    return WorkflowResponse(
        session_id=session_id,
        query=request.query,
        intent="question",
        therapeutic_area=None,
        functional_domain=None,
        primary_agent={
            "name": "General Assistant",
            "role_name": "Medical Affairs",
            "expertise_level": "senior"
        },
        response=f"[Simple Mode] Query received: {request.query}\n\nLangGraph not installed. Install with: pip install langgraph",
        citations=[],
        latency_ms={"total": 0}
    )


@router.post("/select-agent")
async def select_agent_for_task(request: WorkflowRequest):
    """
    Select the best agent for a task without executing full workflow.

    Useful for agent preview or manual agent selection UI.
    """
    try:
        import sys
        sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL/src')

        from integrations.agent_registry import AgentSelector

        selector = AgentSelector()

        agents = selector.select_agent(
            task=request.query,
            context={},
            user_persona_type=request.user_persona_type,
            top_k=5
        )

        return {
            "query": request.query,
            "user_persona_type": request.user_persona_type,
            "selected_agents": agents
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent selection failed: {str(e)}")


@router.get("/intents")
async def list_supported_intents():
    """List all supported user intents."""
    return {
        "intents": [
            {"name": "question", "description": "Information retrieval"},
            {"name": "task", "description": "Action/execution request"},
            {"name": "analysis", "description": "Deep analysis/research"},
            {"name": "recommendation", "description": "Advisory/suggestions"},
            {"name": "clarification", "description": "Follow-up/disambiguation"}
        ]
    }


@router.get("/namespaces")
async def list_rag_namespaces():
    """List available RAG namespaces."""
    return {
        "therapeutic_areas": [
            "ta-oncology", "ta-immunology", "ta-neurology", "ta-cardiology",
            "ta-rare-diseases", "ta-infectious", "ta-respiratory"
        ],
        "functional_domains": [
            "func-medical-affairs", "func-clinical-dev", "func-regulatory-affairs",
            "func-pharmacovigilance", "func-commercial", "func-heor"
        ],
        "ontology": [
            "ont-agents", "personas", "skills", "capabilities", "responsibilities"
        ]
    }
