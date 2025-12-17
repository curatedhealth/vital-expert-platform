# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-16
# PURPOSE: Panel Wizard API Routes - AI-Guided Panel Creation with HITL
"""
Panel Wizard API Routes - AI-Guided Panel Creation

This module provides the Panel Creation Wizard endpoints:
- POST /ask-panel/wizard/start                           -> Start new wizard session
- GET  /ask-panel/wizard/{sessionId}                     -> Get wizard session state
- POST /ask-panel/wizard/{sessionId}/parse-intent        -> Parse user prompt (Step 1)
- POST /ask-panel/wizard/{sessionId}/confirm-goals       -> Confirm goals (HITL Step 2)
- POST /ask-panel/wizard/{sessionId}/generate-questions  -> Generate questions (Step 3)
- POST /ask-panel/wizard/{sessionId}/confirm-questions   -> Confirm questions (HITL Step 4)
- POST /ask-panel/wizard/{sessionId}/suggest-panel-type  -> Suggest panel type (Step 5)
- POST /ask-panel/wizard/{sessionId}/confirm-panel-type  -> Confirm type (HITL Step 6)
- POST /ask-panel/wizard/{sessionId}/recommend-agents    -> Search agents (Step 7)
- POST /ask-panel/wizard/{sessionId}/confirm-agents      -> Confirm agents (HITL Step 8)
- POST /ask-panel/wizard/{sessionId}/finalize            -> Generate proposal (Step 9)
- POST /ask-panel/wizard/{sessionId}/save-draft          -> Save as draft
- POST /ask-panel/wizard/{sessionId}/save-template       -> Save as template
- POST /ask-panel/wizard/{sessionId}/launch              -> Launch panel mission

The wizard flow:
1. User provides natural language prompt
2. AI parses intent -> User confirms/edits goals
3. AI generates questions -> User confirms/edits questions
4. AI suggests panel type -> User confirms/changes type
5. AI recommends agents -> User confirms/adjusts agents
6. AI generates proposal -> User launches/saves

Each AI step is followed by a HITL checkpoint for user review.
"""

from typing import Any, Dict, List, Optional
import json
import structlog
import time
import uuid
import asyncio

from fastapi import APIRouter, Depends, Header, Query, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Security imports
from core.security import InputSanitizer, ErrorSanitizer, TenantIsolation, check_rate_limit_or_raise
from core.config import get_settings

logger = structlog.get_logger()

router = APIRouter(prefix="/ask-panel/wizard", tags=["ask-panel-wizard"])


# ============================================================================
# Request/Response Models
# ============================================================================

class StartWizardRequest(BaseModel):
    """Request to start a new wizard session."""
    initial_prompt: Optional[str] = Field(None, max_length=10000, description="Initial prompt to parse")


class StartWizardResponse(BaseModel):
    """Response from starting a wizard session."""
    session_id: str
    status: str
    current_step: str
    created_at: str


class ParseIntentRequest(BaseModel):
    """Request to parse user intent."""
    prompt: str = Field(..., min_length=20, max_length=10000, description="User's natural language prompt")


class ObjectiveModel(BaseModel):
    """Panel objective."""
    id: str
    text: str
    is_user_added: bool = False


class ConfirmGoalsRequest(BaseModel):
    """Request to confirm/modify goals."""
    confirmed: bool = Field(..., description="Whether to confirm current goals")
    objectives: Optional[List[ObjectiveModel]] = Field(None, description="Modified objectives")
    primary_intent: Optional[str] = Field(None, max_length=1000)
    domain: Optional[str] = Field(None, max_length=200)
    therapeutic_area: Optional[str] = Field(None, max_length=200)
    constraints: Optional[List[str]] = Field(None)
    success_criteria: Optional[List[str]] = Field(None)


class QuestionModel(BaseModel):
    """Panel discussion question."""
    id: str
    question: str
    rationale: Optional[str] = None
    assigned_to: str = "all"
    priority: str = "medium"
    expected_output: Optional[str] = None
    is_user_added: bool = False
    order: int = 0


class ConfirmQuestionsRequest(BaseModel):
    """Request to confirm/modify questions."""
    confirmed: bool = Field(..., description="Whether to confirm current questions")
    questions: Optional[List[QuestionModel]] = Field(None, description="Modified questions")


class ConfirmPanelTypeRequest(BaseModel):
    """Request to confirm/modify panel type."""
    confirmed: bool = Field(..., description="Whether to confirm panel type")
    selected_panel_type: Optional[str] = Field(None, description="User's selected panel type")
    panel_settings: Optional[Dict[str, Any]] = Field(None, description="Panel settings")


class AgentModel(BaseModel):
    """Agent recommendation."""
    agent_id: str
    name: str
    relevance_score: float = 0.0
    match_reasons: List[str] = []
    role_in_panel: str = ""
    is_user_added: bool = False


class ConfirmAgentsRequest(BaseModel):
    """Request to confirm/modify agents."""
    confirmed: bool = Field(..., description="Whether to confirm agents")
    selected_agents: Optional[List[AgentModel]] = Field(None, description="Modified agent selection")


class SaveDraftRequest(BaseModel):
    """Request to save as draft."""
    name: str = Field(..., max_length=200, description="Draft name")
    description: Optional[str] = Field(None, max_length=1000)


class SaveTemplateRequest(BaseModel):
    """Request to save as template."""
    name: str = Field(..., max_length=200, description="Template name")
    description: Optional[str] = Field(None, max_length=1000)
    is_public: bool = Field(False, description="Whether template is public")


class WizardStateResponse(BaseModel):
    """Full wizard state response."""
    session_id: str
    tenant_id: str
    user_id: Optional[str]
    status: str
    current_step: str
    awaiting_confirmation: Optional[str]

    # Goals
    raw_prompt: Optional[str]
    primary_intent: Optional[str]
    domain: Optional[str]
    therapeutic_area: Optional[str]
    objectives: List[ObjectiveModel] = []
    constraints: List[str] = []
    success_criteria: List[str] = []
    intent_confidence: Optional[float]
    goals_confirmed: bool = False

    # Questions
    questions: List[QuestionModel] = []
    suggested_question_count: Optional[int]
    estimated_discussion_time: Optional[str]
    questions_confirmed: bool = False

    # Panel type
    recommended_panel_type: Optional[str]
    panel_type_rationale: Optional[str]
    panel_type_confidence: Optional[float]
    alternative_types: List[Dict[str, Any]] = []
    selected_panel_type: Optional[str]
    panel_settings: Dict[str, Any] = {}
    panel_type_confirmed: bool = False

    # Agents
    recommended_agents: List[AgentModel] = []
    selected_agents: List[AgentModel] = []
    composition_rationale: Optional[str]
    diversity_score: Optional[float]
    agents_confirmed: bool = False

    # Proposal
    proposal: Optional[Dict[str, Any]]
    saved_as: Optional[str]
    launched_at: Optional[str]

    # Metadata
    created_at: str
    updated_at: str
    error: Optional[str]


# ============================================================================
# Session Storage (In-Memory for MVP, should be Redis/DB in production)
# ============================================================================

_wizard_sessions: Dict[str, Dict[str, Any]] = {}


def get_session(session_id: str) -> Dict[str, Any]:
    """Get wizard session by ID."""
    if session_id not in _wizard_sessions:
        raise HTTPException(status_code=404, detail="Wizard session not found")
    return _wizard_sessions[session_id]


def update_session(session_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update wizard session."""
    if session_id not in _wizard_sessions:
        raise HTTPException(status_code=404, detail="Wizard session not found")
    _wizard_sessions[session_id].update(updates)
    _wizard_sessions[session_id]["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return _wizard_sessions[session_id]


def state_to_response(state: Dict[str, Any]) -> WizardStateResponse:
    """Convert internal state dict to WizardStateResponse."""
    return WizardStateResponse(
        session_id=state.get("session_id", ""),
        tenant_id=state.get("tenant_id", ""),
        user_id=state.get("user_id"),
        status=state.get("status", "in_progress"),
        current_step=state.get("current_step", "intent_input"),
        awaiting_confirmation=state.get("awaiting_confirmation"),
        raw_prompt=state.get("raw_prompt"),
        primary_intent=state.get("primary_intent"),
        domain=state.get("domain"),
        therapeutic_area=state.get("therapeutic_area"),
        objectives=[ObjectiveModel(**obj) for obj in state.get("objectives", [])],
        constraints=state.get("constraints", []),
        success_criteria=state.get("success_criteria", []),
        intent_confidence=state.get("intent_confidence"),
        goals_confirmed=state.get("goals_confirmed", False),
        questions=[QuestionModel(**q) for q in state.get("questions", [])],
        suggested_question_count=state.get("suggested_question_count"),
        estimated_discussion_time=state.get("estimated_discussion_time"),
        questions_confirmed=state.get("questions_confirmed", False),
        recommended_panel_type=state.get("recommended_panel_type"),
        panel_type_rationale=state.get("panel_type_rationale"),
        panel_type_confidence=state.get("panel_type_confidence"),
        alternative_types=state.get("alternative_types", []),
        selected_panel_type=state.get("selected_panel_type"),
        panel_settings=state.get("panel_settings", {}),
        panel_type_confirmed=state.get("panel_type_confirmed", False),
        recommended_agents=[AgentModel(**a) for a in state.get("recommended_agents", [])],
        selected_agents=[AgentModel(**a) for a in state.get("selected_agents", [])],
        composition_rationale=state.get("composition_rationale"),
        diversity_score=state.get("diversity_score"),
        agents_confirmed=state.get("agents_confirmed", False),
        proposal=state.get("proposal"),
        saved_as=state.get("saved_as"),
        launched_at=state.get("launched_at"),
        created_at=state.get("created_at", ""),
        updated_at=state.get("updated_at", ""),
        error=state.get("error"),
    )


# ============================================================================
# Wizard Session Routes
# ============================================================================

@router.post("/start", response_model=StartWizardResponse)
async def start_wizard_session(
    request: StartWizardRequest = None,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Start a new Panel Creation Wizard session.

    Optionally provide an initial prompt to pre-populate the wizard.
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        # Resolve tenant_id
        effective_tenant_id = x_tenant_id or get_settings().default_tenant_id

        # Validate tenant format
        if effective_tenant_id:
            try:
                effective_tenant_id = TenantIsolation.validate_tenant_id(effective_tenant_id)
            except ValueError as e:
                raise HTTPException(status_code=403, detail=str(e))

        # Rate limiting
        rate_limit_id = effective_tenant_id or x_user_id or "anonymous"
        check_rate_limit_or_raise(rate_limit_id, endpoint="wizard_start")

        session_id = str(uuid.uuid4())
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Initialize session state
        session_state = {
            "session_id": session_id,
            "tenant_id": effective_tenant_id,
            "user_id": x_user_id,
            "status": "in_progress",
            "current_step": "intent_input",
            "awaiting_confirmation": None,
            "created_at": now,
            "updated_at": now,
            # Initialize all fields
            "raw_prompt": None,
            "primary_intent": None,
            "domain": None,
            "therapeutic_area": None,
            "objectives": [],
            "constraints": [],
            "success_criteria": [],
            "intent_confidence": None,
            "goals_confirmed": False,
            "questions": [],
            "suggested_question_count": None,
            "estimated_discussion_time": None,
            "questions_confirmed": False,
            "recommended_panel_type": None,
            "panel_type_rationale": None,
            "panel_type_confidence": None,
            "alternative_types": [],
            "selected_panel_type": None,
            "panel_settings": {},
            "panel_type_confirmed": False,
            "recommended_agents": [],
            "selected_agents": [],
            "composition_rationale": None,
            "diversity_score": None,
            "agents_confirmed": False,
            "proposal": None,
            "saved_as": None,
            "launched_at": None,
            "error": None,
        }

        # Store session
        _wizard_sessions[session_id] = session_state

        logger.info(
            "wizard_session_started",
            session_id=session_id,
            tenant_id=effective_tenant_id,
            correlation_id=correlation_id,
        )

        # If initial prompt provided, auto-parse
        if request and request.initial_prompt:
            session_state["raw_prompt"] = request.initial_prompt
            # We could auto-trigger parse here, but let frontend call parse-intent explicitly

        return StartWizardResponse(
            session_id=session_id,
            status="in_progress",
            current_step="intent_input",
            created_at=now,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_start_error", error=str(e), correlation_id=correlation_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{session_id}", response_model=WizardStateResponse)
async def get_wizard_state(
    session_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Get current wizard session state."""
    try:
        # Sanitize input
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID format")

        session = get_session(sanitized_session_id)

        # Verify tenant access
        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        return state_to_response(session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_get_state_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Step 1-2: Parse Intent & Confirm Goals
# ============================================================================

@router.post("/{session_id}/parse-intent", response_model=WizardStateResponse)
async def parse_intent(
    session_id: str,
    request: ParseIntentRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Parse user's natural language prompt into structured goals.

    Uses AI to extract:
    - Primary intent
    - Domain/therapeutic area
    - Key objectives
    - Constraints
    - Success criteria

    After this step, user should confirm goals via /confirm-goals.
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        # Verify tenant
        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Sanitize prompt
        sanitized_prompt = InputSanitizer.sanitize_text(request.prompt, max_length=10000)

        # Import and run workflow node
        from langgraph_workflows.panel_wizard import PanelWizardState
        from langgraph_workflows.panel_wizard.workflow import _parse_intent

        # Build state for workflow
        workflow_state: PanelWizardState = {
            "session_id": sanitized_session_id,
            "tenant_id": session.get("tenant_id"),
            "raw_prompt": sanitized_prompt,
        }

        # Run parse intent
        result = await _parse_intent(workflow_state)

        # Check for error
        if result.get("error"):
            update_session(sanitized_session_id, {
                "raw_prompt": sanitized_prompt,
                "error": result.get("error"),
                "current_step": "intent_input",
            })
            updated_session = get_session(sanitized_session_id)
            return state_to_response(updated_session)

        # Update session with parsed results
        updates = {
            "raw_prompt": sanitized_prompt,
            "primary_intent": result.get("primary_intent"),
            "domain": result.get("domain"),
            "therapeutic_area": result.get("therapeutic_area"),
            "objectives": result.get("objectives", []),
            "constraints": result.get("constraints", []),
            "success_criteria": result.get("success_criteria", []),
            "intent_confidence": result.get("intent_confidence"),
            "current_step": result.get("current_step", "confirm_goals"),
            "awaiting_confirmation": result.get("awaiting_confirmation", "goals"),
            "error": None,
        }

        update_session(sanitized_session_id, updates)
        updated_session = get_session(sanitized_session_id)

        logger.info(
            "wizard_intent_parsed",
            session_id=sanitized_session_id,
            objective_count=len(updates["objectives"]),
            confidence=updates["intent_confidence"],
            correlation_id=correlation_id,
        )

        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_parse_intent_error", error=str(e), correlation_id=correlation_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/confirm-goals", response_model=WizardStateResponse)
async def confirm_goals(
    session_id: str,
    request: ConfirmGoalsRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Confirm or modify the parsed goals.

    If confirmed=True, proceeds to generate questions.
    If confirmed=False with modifications, updates goals and awaits re-confirmation.
    """
    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        if request.confirmed:
            # Apply any modifications if provided
            updates = {
                "goals_confirmed": True,
                "goals_confirmed_at": now,
                "current_step": "generate_questions",
                "awaiting_confirmation": None,
            }

            if request.objectives is not None:
                updates["objectives"] = [obj.dict() for obj in request.objectives]
            if request.primary_intent is not None:
                updates["primary_intent"] = request.primary_intent
            if request.domain is not None:
                updates["domain"] = request.domain
            if request.therapeutic_area is not None:
                updates["therapeutic_area"] = request.therapeutic_area
            if request.constraints is not None:
                updates["constraints"] = request.constraints
            if request.success_criteria is not None:
                updates["success_criteria"] = request.success_criteria

            update_session(sanitized_session_id, updates)

            logger.info("wizard_goals_confirmed", session_id=sanitized_session_id)

        else:
            # User wants to re-edit, apply modifications and stay on confirm step
            updates = {
                "goals_confirmed": False,
                "current_step": "confirm_goals",
                "awaiting_confirmation": "goals",
            }

            if request.objectives is not None:
                updates["objectives"] = [obj.dict() for obj in request.objectives]
            if request.primary_intent is not None:
                updates["primary_intent"] = request.primary_intent
            if request.domain is not None:
                updates["domain"] = request.domain
            if request.therapeutic_area is not None:
                updates["therapeutic_area"] = request.therapeutic_area
            if request.constraints is not None:
                updates["constraints"] = request.constraints
            if request.success_criteria is not None:
                updates["success_criteria"] = request.success_criteria

            update_session(sanitized_session_id, updates)

        updated_session = get_session(sanitized_session_id)
        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_confirm_goals_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Step 3-4: Generate Questions & Confirm
# ============================================================================

@router.post("/{session_id}/generate-questions", response_model=WizardStateResponse)
async def generate_questions(
    session_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Generate discussion questions based on confirmed goals.

    Uses AI to create:
    - Strategic questions
    - Tactical questions
    - Priority assignments
    - Expected outputs

    After this step, user should confirm questions via /confirm-questions.
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Verify goals are confirmed
        if not session.get("goals_confirmed"):
            raise HTTPException(status_code=400, detail="Goals must be confirmed before generating questions")

        # Import and run workflow node
        from langgraph_workflows.panel_wizard import PanelWizardState
        from langgraph_workflows.panel_wizard.workflow import _generate_questions

        # Build state for workflow
        workflow_state: PanelWizardState = {
            "session_id": sanitized_session_id,
            "primary_intent": session.get("primary_intent"),
            "domain": session.get("domain"),
            "therapeutic_area": session.get("therapeutic_area"),
            "objectives": session.get("objectives", []),
        }

        result = await _generate_questions(workflow_state)

        if result.get("error"):
            update_session(sanitized_session_id, {"error": result.get("error")})
            updated_session = get_session(sanitized_session_id)
            return state_to_response(updated_session)

        updates = {
            "questions": result.get("questions", []),
            "suggested_question_count": result.get("suggested_question_count"),
            "estimated_discussion_time": result.get("estimated_discussion_time"),
            "current_step": result.get("current_step", "confirm_questions"),
            "awaiting_confirmation": result.get("awaiting_confirmation", "questions"),
            "error": None,
        }

        update_session(sanitized_session_id, updates)
        updated_session = get_session(sanitized_session_id)

        logger.info(
            "wizard_questions_generated",
            session_id=sanitized_session_id,
            question_count=len(updates["questions"]),
            correlation_id=correlation_id,
        )

        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_generate_questions_error", error=str(e), correlation_id=correlation_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/confirm-questions", response_model=WizardStateResponse)
async def confirm_questions(
    session_id: str,
    request: ConfirmQuestionsRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Confirm or modify the generated questions.

    If confirmed=True, proceeds to suggest panel type.
    """
    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        if request.confirmed:
            updates = {
                "questions_confirmed": True,
                "questions_confirmed_at": now,
                "current_step": "suggest_panel_type",
                "awaiting_confirmation": None,
            }

            if request.questions is not None:
                updates["questions"] = [q.dict() for q in request.questions]

            update_session(sanitized_session_id, updates)
            logger.info("wizard_questions_confirmed", session_id=sanitized_session_id)
        else:
            updates = {
                "questions_confirmed": False,
                "current_step": "confirm_questions",
                "awaiting_confirmation": "questions",
            }

            if request.questions is not None:
                updates["questions"] = [q.dict() for q in request.questions]

            update_session(sanitized_session_id, updates)

        updated_session = get_session(sanitized_session_id)
        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_confirm_questions_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Step 5-6: Suggest Panel Type & Confirm
# ============================================================================

@router.post("/{session_id}/suggest-panel-type", response_model=WizardStateResponse)
async def suggest_panel_type(
    session_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Suggest optimal panel type based on goals and questions.

    AI analyzes to recommend:
    - Best panel type (structured, open, socratic, etc.)
    - Alternative options
    - Rationale
    - Suggested settings

    After this step, user should confirm via /confirm-panel-type.
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        if not session.get("questions_confirmed"):
            raise HTTPException(status_code=400, detail="Questions must be confirmed before suggesting panel type")

        from langgraph_workflows.panel_wizard import PanelWizardState
        from langgraph_workflows.panel_wizard.workflow import _suggest_panel_type

        workflow_state: PanelWizardState = {
            "session_id": sanitized_session_id,
            "primary_intent": session.get("primary_intent"),
            "domain": session.get("domain"),
            "objectives": session.get("objectives", []),
            "questions": session.get("questions", []),
        }

        result = await _suggest_panel_type(workflow_state)

        if result.get("error"):
            update_session(sanitized_session_id, {"error": result.get("error")})
            updated_session = get_session(sanitized_session_id)
            return state_to_response(updated_session)

        updates = {
            "recommended_panel_type": result.get("recommended_panel_type"),
            "panel_type_rationale": result.get("panel_type_rationale"),
            "panel_type_confidence": result.get("panel_type_confidence"),
            "alternative_types": result.get("alternative_types", []),
            "panel_settings": result.get("panel_settings", {}),
            "current_step": result.get("current_step", "confirm_panel_type"),
            "awaiting_confirmation": result.get("awaiting_confirmation", "panel_type"),
            "error": None,
        }

        update_session(sanitized_session_id, updates)
        updated_session = get_session(sanitized_session_id)

        logger.info(
            "wizard_panel_type_suggested",
            session_id=sanitized_session_id,
            recommended_type=updates["recommended_panel_type"],
            confidence=updates["panel_type_confidence"],
            correlation_id=correlation_id,
        )

        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_suggest_panel_type_error", error=str(e), correlation_id=correlation_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/confirm-panel-type", response_model=WizardStateResponse)
async def confirm_panel_type(
    session_id: str,
    request: ConfirmPanelTypeRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Confirm or modify the suggested panel type.

    If confirmed=True, proceeds to recommend agents.
    """
    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        if request.confirmed:
            updates = {
                "panel_type_confirmed": True,
                "panel_type_confirmed_at": now,
                "current_step": "search_agents",
                "awaiting_confirmation": None,
            }

            if request.selected_panel_type:
                updates["selected_panel_type"] = request.selected_panel_type
            else:
                updates["selected_panel_type"] = session.get("recommended_panel_type")

            if request.panel_settings:
                updates["panel_settings"] = request.panel_settings

            update_session(sanitized_session_id, updates)
            logger.info("wizard_panel_type_confirmed", session_id=sanitized_session_id)
        else:
            updates = {
                "panel_type_confirmed": False,
                "current_step": "confirm_panel_type",
                "awaiting_confirmation": "panel_type",
            }

            if request.selected_panel_type:
                updates["selected_panel_type"] = request.selected_panel_type
            if request.panel_settings:
                updates["panel_settings"] = request.panel_settings

            update_session(sanitized_session_id, updates)

        updated_session = get_session(sanitized_session_id)
        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_confirm_panel_type_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Step 7-8: Recommend Agents & Confirm
# ============================================================================

@router.post("/{session_id}/recommend-agents", response_model=WizardStateResponse)
async def recommend_agents(
    session_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Search and recommend agents for the panel.

    Uses Fusion Intelligence (PostgreSQL + optional Pinecone/Neo4j) to find:
    - Most relevant agents
    - Match reasons
    - Role suggestions
    - Diversity score

    After this step, user should confirm via /confirm-agents.
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        if not session.get("panel_type_confirmed"):
            raise HTTPException(status_code=400, detail="Panel type must be confirmed before searching agents")

        from langgraph_workflows.panel_wizard import PanelWizardState
        from langgraph_workflows.panel_wizard.workflow import _search_agents

        workflow_state: PanelWizardState = {
            "session_id": sanitized_session_id,
            "tenant_id": session.get("tenant_id"),
            "primary_intent": session.get("primary_intent"),
            "domain": session.get("domain"),
            "therapeutic_area": session.get("therapeutic_area"),
            "objectives": session.get("objectives", []),
        }

        result = await _search_agents(workflow_state)

        if result.get("error"):
            update_session(sanitized_session_id, {"error": result.get("error")})
            updated_session = get_session(sanitized_session_id)
            return state_to_response(updated_session)

        updates = {
            "recommended_agents": result.get("recommended_agents", []),
            "selected_agents": result.get("selected_agents", []),
            "composition_rationale": result.get("composition_rationale"),
            "diversity_score": result.get("diversity_score"),
            "current_step": result.get("current_step", "confirm_agents"),
            "awaiting_confirmation": result.get("awaiting_confirmation", "agents"),
            "error": None,
        }

        update_session(sanitized_session_id, updates)
        updated_session = get_session(sanitized_session_id)

        logger.info(
            "wizard_agents_recommended",
            session_id=sanitized_session_id,
            agent_count=len(updates["recommended_agents"]),
            correlation_id=correlation_id,
        )

        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_recommend_agents_error", error=str(e), correlation_id=correlation_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/confirm-agents", response_model=WizardStateResponse)
async def confirm_agents(
    session_id: str,
    request: ConfirmAgentsRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Confirm or modify the recommended agents.

    If confirmed=True, proceeds to generate final proposal.
    """
    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        if request.confirmed:
            updates = {
                "agents_confirmed": True,
                "agents_confirmed_at": now,
                "current_step": "generate_proposal",
                "awaiting_confirmation": None,
            }

            if request.selected_agents is not None:
                updates["selected_agents"] = [a.dict() for a in request.selected_agents]

            update_session(sanitized_session_id, updates)
            logger.info("wizard_agents_confirmed", session_id=sanitized_session_id)
        else:
            updates = {
                "agents_confirmed": False,
                "current_step": "confirm_agents",
                "awaiting_confirmation": "agents",
            }

            if request.selected_agents is not None:
                updates["selected_agents"] = [a.dict() for a in request.selected_agents]

            update_session(sanitized_session_id, updates)

        updated_session = get_session(sanitized_session_id)
        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_confirm_agents_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Step 9: Finalize & Launch
# ============================================================================

@router.post("/{session_id}/finalize", response_model=WizardStateResponse)
async def finalize_wizard(
    session_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Generate the final panel proposal.

    Compiles all confirmed elements into a ready-to-launch proposal.
    User can then launch, save as draft, or save as template.
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        if not session.get("agents_confirmed"):
            raise HTTPException(status_code=400, detail="Agents must be confirmed before finalizing")

        from langgraph_workflows.panel_wizard import PanelWizardState
        from langgraph_workflows.panel_wizard.workflow import _generate_proposal

        workflow_state: PanelWizardState = {
            "session_id": sanitized_session_id,
            "primary_intent": session.get("primary_intent"),
            "domain": session.get("domain"),
            "therapeutic_area": session.get("therapeutic_area"),
            "objectives": session.get("objectives", []),
            "constraints": session.get("constraints", []),
            "success_criteria": session.get("success_criteria", []),
            "questions": session.get("questions", []),
            "selected_panel_type": session.get("selected_panel_type") or session.get("recommended_panel_type"),
            "panel_settings": session.get("panel_settings", {}),
            "selected_agents": session.get("selected_agents", []),
            "estimated_discussion_time": session.get("estimated_discussion_time"),
        }

        result = await _generate_proposal(workflow_state)

        updates = {
            "proposal": result.get("proposal"),
            "current_step": result.get("current_step", "completed"),
            "status": result.get("status", "completed"),
            "awaiting_confirmation": None,
            "error": None,
        }

        update_session(sanitized_session_id, updates)
        updated_session = get_session(sanitized_session_id)

        logger.info(
            "wizard_proposal_generated",
            session_id=sanitized_session_id,
            proposal_id=updates["proposal"].get("id") if updates["proposal"] else None,
            correlation_id=correlation_id,
        )

        return state_to_response(updated_session)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_finalize_error", error=str(e), correlation_id=correlation_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/save-draft")
async def save_wizard_draft(
    session_id: str,
    request: SaveDraftRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Save the current wizard state as a draft for later completion.
    """
    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # TODO: Persist to database
        # For MVP, just update session state
        updates = {
            "saved_as": "draft",
            "status": "draft",
        }

        if session.get("proposal"):
            session["proposal"]["name"] = request.name
            if request.description:
                session["proposal"]["description"] = request.description

        update_session(sanitized_session_id, updates)

        logger.info("wizard_saved_as_draft", session_id=sanitized_session_id, name=request.name)

        return {
            "status": "saved",
            "saved_as": "draft",
            "session_id": sanitized_session_id,
            "name": request.name,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_save_draft_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/save-template")
async def save_wizard_template(
    session_id: str,
    request: SaveTemplateRequest,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """
    Save the panel configuration as a reusable template.
    """
    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Build template from session
        template = {
            "id": str(uuid.uuid4()),
            "name": request.name,
            "description": request.description or session.get("primary_intent", ""),
            "is_public": request.is_public,
            "tenant_id": session.get("tenant_id"),
            "panel_type": session.get("selected_panel_type") or session.get("recommended_panel_type", "structured"),
            "domain": session.get("domain"),
            "therapeutic_area": session.get("therapeutic_area"),
            "questions": session.get("questions", []),
            "panel_settings": session.get("panel_settings", {}),
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

        # TODO: Persist template to database

        updates = {
            "saved_as": "template",
        }
        update_session(sanitized_session_id, updates)

        logger.info(
            "wizard_saved_as_template",
            session_id=sanitized_session_id,
            template_id=template["id"],
            name=request.name,
            is_public=request.is_public,
        )

        return {
            "status": "saved",
            "saved_as": "template",
            "template_id": template["id"],
            "name": request.name,
            "is_public": request.is_public,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_save_template_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/launch")
async def launch_panel_from_wizard(
    session_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """
    Launch a panel mission from the completed wizard proposal.

    Creates a new panel mission using the autonomous mode.
    Returns mission ID for streaming.
    """
    correlation_id = str(uuid.uuid4())[:8]

    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        session = get_session(sanitized_session_id)

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        proposal = session.get("proposal")
        if not proposal:
            raise HTTPException(status_code=400, detail="No proposal to launch. Please finalize the wizard first.")

        # Import the panel autonomous route to create mission
        from api.routes.panel_autonomous import (
            create_panel_mission,
            CreatePanelMissionRequest,
            ExpertInfo,
        )

        # Build experts list from selected agents
        experts = []
        for agent in session.get("selected_agents", []):
            experts.append(ExpertInfo(
                id=agent.get("agent_id"),
                name=agent.get("name"),
            ))

        # Get panel settings
        settings = session.get("panel_settings", {})

        # Build comprehensive goal that includes the primary intent AND the questions
        # This ensures the panel experts discuss ALL the wizard-defined questions
        primary_intent = session.get("primary_intent", "Panel discussion")
        questions = proposal.get("questions", []) or session.get("questions", [])
        objectives = proposal.get("goals", {}).get("objectives", []) or session.get("objectives", [])

        # Build a structured goal text that includes all questions
        goal_parts = [primary_intent]

        if objectives:
            goal_parts.append("\n\nKey Objectives:")
            for i, obj in enumerate(objectives, 1):
                obj_text = obj.get("text", obj) if isinstance(obj, dict) else str(obj)
                goal_parts.append(f"{i}. {obj_text}")

        if questions:
            goal_parts.append("\n\nKey Questions to Address:")
            for i, q in enumerate(questions, 1):
                q_text = q.get("question", q) if isinstance(q, dict) else str(q)
                goal_parts.append(f"{i}. {q_text}")

        comprehensive_goal = "\n".join(goal_parts)

        # Build context with additional metadata
        context_data = {
            "domain": proposal.get("domain") or session.get("domain"),
            "therapeutic_area": proposal.get("therapeutic_area") or session.get("therapeutic_area"),
            "constraints": session.get("constraints", []),
            "success_criteria": session.get("success_criteria", []),
        }

        # Build mission request with comprehensive goal
        mission_request = CreatePanelMissionRequest(
            goal=comprehensive_goal,
            panel_type=proposal.get("panel_type", "structured"),
            context=json.dumps(context_data),
            experts=experts if experts else None,
            max_rounds=settings.get("max_rounds", 2),
            consensus_threshold=0.7,
        )

        # Create the mission
        mission_response = await create_panel_mission(
            request=mission_request,
            x_tenant_id=x_tenant_id,
            x_user_id=x_user_id,
        )

        # Update wizard session
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        updates = {
            "launched_at": now,
            "status": "launched",
        }
        update_session(sanitized_session_id, updates)

        logger.info(
            "wizard_panel_launched",
            session_id=sanitized_session_id,
            mission_id=mission_response.id,
            panel_type=mission_response.panel_type,
            correlation_id=correlation_id,
        )

        return {
            "status": "launched",
            "mission_id": mission_response.id,
            "panel_type": mission_response.panel_type,
            "stream_url": f"/api/ask-panel/missions/{mission_response.id}/stream",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_launch_error", error=str(e), correlation_id=correlation_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# List & Delete Sessions
# ============================================================================

@router.get("/sessions")
async def list_wizard_sessions(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, ge=1, le=100),
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
):
    """List user's wizard sessions."""
    try:
        sessions = []

        for session_id, session in _wizard_sessions.items():
            # Filter by tenant
            if x_tenant_id and session.get("tenant_id") != x_tenant_id:
                continue

            # Filter by user
            if x_user_id and session.get("user_id") != x_user_id:
                continue

            # Filter by status
            if status and session.get("status") != status:
                continue

            sessions.append({
                "session_id": session_id,
                "status": session.get("status"),
                "current_step": session.get("current_step"),
                "primary_intent": session.get("primary_intent", "")[:100],
                "created_at": session.get("created_at"),
                "updated_at": session.get("updated_at"),
            })

        # Sort by updated_at descending
        sessions.sort(key=lambda s: s.get("updated_at", ""), reverse=True)

        return {
            "sessions": sessions[:limit],
            "total": len(sessions),
        }

    except Exception as e:
        logger.error("wizard_list_sessions_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{session_id}")
async def delete_wizard_session(
    session_id: str,
    x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id"),
):
    """Delete a wizard session."""
    try:
        sanitized_session_id = InputSanitizer.sanitize_uuid(session_id)
        if not sanitized_session_id:
            raise HTTPException(status_code=400, detail="Invalid session ID")

        if sanitized_session_id not in _wizard_sessions:
            raise HTTPException(status_code=404, detail="Session not found")

        session = _wizard_sessions[sanitized_session_id]

        if x_tenant_id and session.get("tenant_id") != x_tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

        del _wizard_sessions[sanitized_session_id]

        logger.info("wizard_session_deleted", session_id=sanitized_session_id)

        return {"status": "deleted", "session_id": sanitized_session_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("wizard_delete_session_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
