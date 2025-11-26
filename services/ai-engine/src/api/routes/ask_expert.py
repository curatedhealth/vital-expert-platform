"""
Ask Expert API Endpoint - Phase 4 Complete
Handles 4-mode routing for Ask Expert service with Evidence-Based Selection and Deep Patterns
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from uuid import UUID
from datetime import datetime
import structlog

from api.auth import get_current_user
from services.supabase_client import get_supabase_client
from langgraph_workflows.mode1_manual_query import Mode1ManualQueryWorkflow
from langgraph_workflows.mode2_auto_query import Mode2AutoQueryWorkflow
from langgraph_workflows.mode3_manual_chat_autonomous import Mode3ManualChatAutonomousWorkflow
from langgraph_workflows.mode4_auto_chat_autonomous import Mode4AutoChatAutonomousWorkflow

logger = structlog.get_logger()
router = APIRouter()

# ========== REQUEST/RESPONSE SCHEMAS ==========

class AskExpertRequest(BaseModel):
    """Request schema for Ask Expert query"""
    query: str = Field(..., min_length=1, max_length=5000, description="User's query")
    tenant_id: UUID = Field(..., description="Tenant ID")
    session_id: Optional[UUID] = Field(None, description="Session ID for conversation continuity")
    
    # Mode Selection Flags
    is_automatic: bool = Field(False, description="If True, AI selects agents automatically")
    is_autonomous: bool = Field(False, description="If True, agent works autonomously with deep reasoning")
    
    # Manual Mode: User-selected agents
    selected_agent_ids: Optional[List[UUID]] = Field(None, description="Pre-selected agent IDs (Manual modes only)")
    
    # HITL Configuration
    hitl_enabled: bool = Field(False, description="Enable Human-in-the-Loop approvals")
    hitl_safety_level: Literal["conservative", "balanced", "minimal"] = Field(
        "balanced", 
        description="HITL safety level"
    )
    
    # Optional Context
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    max_response_tokens: Optional[int] = Field(4000, description="Max tokens for response")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "What are the latest treatment guidelines for Type 2 Diabetes?",
                "tenant_id": "00000000-0000-0000-0000-000000000001",
                "is_automatic": True,
                "is_autonomous": False,
                "hitl_enabled": True,
                "hitl_safety_level": "balanced"
            }
        }


class AskExpertResponse(BaseModel):
    """Response schema for Ask Expert query"""
    response: str = Field(..., description="Agent's response text")
    mode: str = Field(..., description="Mode used (mode1, mode2, mode3, mode4)")
    mode_name: str = Field(..., description="Human-readable mode name")
    
    # Agent Info
    agent_id: Optional[UUID] = Field(None, description="Primary agent ID used")
    agent_name: Optional[str] = Field(None, description="Primary agent name")
    selected_agents: List[Dict[str, Any]] = Field([], description="All agents selected/used")
    
    # Evidence & Quality
    tier: Optional[str] = Field(None, description="Agent tier (tier_1, tier_2, tier_3)")
    confidence: Optional[float] = Field(None, description="Confidence score (0-1)")
    citations: List[Dict[str, Any]] = Field([], description="Evidence citations")
    evidence_chain: List[Dict[str, Any]] = Field([], description="Evidence chain with provenance")
    
    # Patterns Applied
    patterns_applied: List[str] = Field([], description="Deep agent patterns used")
    pattern_metadata: Optional[Dict[str, Any]] = Field(None, description="Pattern execution metadata")
    
    # HITL Status
    hitl_approvals: List[Dict[str, Any]] = Field([], description="HITL approval checkpoints")
    human_oversight_required: bool = Field(False, description="Whether human oversight was required")
    
    # Session Info
    session_id: UUID = Field(..., description="Session ID for conversation continuity")
    response_time_ms: int = Field(..., description="Response time in milliseconds")
    
    # Metadata
    metadata: Dict[str, Any] = Field({}, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Based on the latest ADA guidelines...",
                "mode": "mode2",
                "mode_name": "Auto-Interactive",
                "agent_name": "Endocrinology Expert",
                "tier": "tier_2",
                "confidence": 0.92,
                "patterns_applied": ["react", "constitutional_ai"],
                "session_id": "00000000-0000-0000-0000-000000000002",
                "response_time_ms": 3500
            }
        }


class AvailableModesResponse(BaseModel):
    """Response schema for available modes"""
    modes: List[Dict[str, Any]] = Field(..., description="List of available modes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "modes": [
                    {
                        "mode_id": "mode1",
                        "name": "Manual-Interactive",
                        "description": "User selects expert for focused chat",
                        "selection": "manual",
                        "interaction": "interactive",
                        "response_time": "15-25s",
                        "requires_agent_selection": True
                    }
                ]
            }
        }


# ========== HELPER FUNCTIONS ==========

def determine_mode(is_automatic: bool, is_autonomous: bool) -> str:
    """
    Determine which mode to use based on flags.
    
    2x2 Matrix:
    - Manual + Interactive = Mode 1
    - Auto + Interactive = Mode 2
    - Manual + Autonomous = Mode 3
    - Auto + Autonomous = Mode 4
    """
    if not is_automatic and not is_autonomous:
        return "mode1"  # Manual-Interactive
    elif is_automatic and not is_autonomous:
        return "mode2"  # Auto-Interactive
    elif not is_automatic and is_autonomous:
        return "mode3"  # Manual-Autonomous
    else:
        return "mode4"  # Auto-Autonomous


def get_mode_name(mode: str) -> str:
    """Get human-readable mode name"""
    mode_names = {
        "mode1": "Manual-Interactive",
        "mode2": "Auto-Interactive",
        "mode3": "Manual-Autonomous",
        "mode4": "Auto-Autonomous"
    }
    return mode_names.get(mode, "Unknown")


async def validate_request(request: AskExpertRequest) -> None:
    """Validate request based on mode requirements"""
    mode = determine_mode(request.is_automatic, request.is_autonomous)
    
    # Manual modes require agent selection
    if mode in ["mode1", "mode3"]:
        if not request.selected_agent_ids or len(request.selected_agent_ids) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{get_mode_name(mode)} requires at least one selected agent. Set selected_agent_ids."
            )
    
    # Autonomous modes should enable HITL
    if mode in ["mode3", "mode4"] and not request.hitl_enabled:
        logger.warning(
            f"{get_mode_name(mode)} recommended with HITL enabled, but proceeding as requested",
            mode=mode,
            hitl_enabled=request.hitl_enabled
        )


# ========== API ENDPOINTS ==========

@router.post("/ask-expert/query", response_model=AskExpertResponse)
async def ask_expert_query(
    request: AskExpertRequest,
    user: dict = Depends(get_current_user)
) -> AskExpertResponse:
    """
    Ask Expert Query - Phase 4 Complete
    
    Handles 4-mode routing with Evidence-Based Selection, Deep Patterns, and HITL.
    
    **Modes**:
    - **Mode 1 (Manual-Interactive)**: User selects expert, multi-turn chat
    - **Mode 2 (Auto-Interactive)**: AI selects expert(s), multi-turn chat
    - **Mode 3 (Manual-Autonomous)**: User selects expert, deep work with HITL
    - **Mode 4 (Auto-Autonomous)**: AI orchestrates experts, deep work with HITL
    """
    start_time = datetime.now()
    
    try:
        # Validate request
        await validate_request(request)
        
        # Determine mode
        mode = determine_mode(request.is_automatic, request.is_autonomous)
        mode_name = get_mode_name(mode)
        
        logger.info(
            "Ask Expert request received",
            mode=mode,
            mode_name=mode_name,
            user_id=user.get("id"),
            tenant_id=str(request.tenant_id),
            is_automatic=request.is_automatic,
            is_autonomous=request.is_autonomous,
            hitl_enabled=request.hitl_enabled
        )
        
        # Initialize Supabase client
        supabase = await get_supabase_client()
        
        # Route to appropriate workflow
        result = None
        
        if mode == "mode1":
            # Mode 1: Manual-Interactive
            workflow = Mode1ManualQueryWorkflow(supabase_client=supabase)
            result = await workflow.execute(
                query=request.query,
                tenant_id=request.tenant_id,
                user_id=user.get("id"),
                session_id=request.session_id,
                selected_agent_ids=request.selected_agent_ids,
                context=request.context,
                max_response_tokens=request.max_response_tokens
            )
        
        elif mode == "mode2":
            # Mode 2: Auto-Interactive
            workflow = Mode2AutoQueryWorkflow(supabase_client=supabase)
            result = await workflow.execute(
                query=request.query,
                tenant_id=request.tenant_id,
                user_id=user.get("id"),
                session_id=request.session_id,
                context=request.context,
                max_response_tokens=request.max_response_tokens
            )
        
        elif mode == "mode3":
            # Mode 3: Manual-Autonomous
            workflow = Mode3ManualChatAutonomousWorkflow(supabase_client=supabase)
            result = await workflow.execute(
                query=request.query,
                tenant_id=request.tenant_id,
                user_id=user.get("id"),
                session_id=request.session_id,
                selected_agent_ids=request.selected_agent_ids,
                hitl_enabled=request.hitl_enabled,
                hitl_safety_level=request.hitl_safety_level,
                context=request.context,
                max_response_tokens=request.max_response_tokens
            )
        
        elif mode == "mode4":
            # Mode 4: Auto-Autonomous
            workflow = Mode4AutoChatAutonomousWorkflow(supabase_client=supabase)
            result = await workflow.execute(
                query=request.query,
                tenant_id=request.tenant_id,
                user_id=user.get("id"),
                session_id=request.session_id,
                hitl_enabled=request.hitl_enabled,
                hitl_safety_level=request.hitl_safety_level,
                context=request.context,
                max_response_tokens=request.max_response_tokens
            )
        
        # Calculate response time
        response_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Format response
        response = AskExpertResponse(
            response=result.get("response", ""),
            mode=mode,
            mode_name=mode_name,
            agent_id=result.get("agent_id"),
            agent_name=result.get("agent_name"),
            selected_agents=result.get("selected_agents", []),
            tier=result.get("tier"),
            confidence=result.get("confidence"),
            citations=result.get("citations", []),
            evidence_chain=result.get("evidence_chain", []),
            patterns_applied=result.get("patterns_applied", []),
            pattern_metadata=result.get("pattern_metadata"),
            hitl_approvals=result.get("hitl_approvals", []),
            human_oversight_required=result.get("human_oversight_required", False),
            session_id=result.get("session_id", request.session_id),
            response_time_ms=response_time_ms,
            metadata=result.get("metadata", {})
        )
        
        logger.info(
            "Ask Expert request completed",
            mode=mode,
            response_time_ms=response_time_ms,
            tier=response.tier,
            patterns_applied=response.patterns_applied
        )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Ask Expert request failed", error=str(e), mode=mode)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ask Expert request failed: {str(e)}"
        )


@router.get("/ask-expert/modes", response_model=AvailableModesResponse)
async def get_available_modes(
    user: dict = Depends(get_current_user)
) -> AvailableModesResponse:
    """
    Get available Ask Expert modes with descriptions.
    
    Returns all 4 modes with their characteristics.
    """
    modes = [
        {
            "mode_id": "mode1",
            "name": "Manual-Interactive",
            "description": "User selects expert for focused chat",
            "selection": "manual",
            "interaction": "interactive",
            "response_time": "15-25s",
            "requires_agent_selection": True,
            "supports_hitl": False,
            "use_cases": ["Specific expert consultation", "Focused domain questions"]
        },
        {
            "mode_id": "mode2",
            "name": "Auto-Interactive",
            "description": "AI picks best expert(s) for chat",
            "selection": "automatic",
            "interaction": "interactive",
            "response_time": "25-40s",
            "requires_agent_selection": False,
            "supports_hitl": False,
            "use_cases": ["General questions", "Multi-domain queries", "Expert discovery"]
        },
        {
            "mode_id": "mode3",
            "name": "Manual-Autonomous",
            "description": "User selects expert for deep work with HITL",
            "selection": "manual",
            "interaction": "autonomous",
            "response_time": "60-120s",
            "requires_agent_selection": True,
            "supports_hitl": True,
            "use_cases": ["Complex analysis with known expert", "Strategic planning"]
        },
        {
            "mode_id": "mode4",
            "name": "Auto-Autonomous",
            "description": "AI orchestrates multiple experts for complex tasks",
            "selection": "automatic",
            "interaction": "autonomous",
            "response_time": "90-180s",
            "requires_agent_selection": False,
            "supports_hitl": True,
            "use_cases": ["Multi-step research", "Cross-functional analysis", "Critical decisions"]
        }
    ]
    
    return AvailableModesResponse(modes=modes)

