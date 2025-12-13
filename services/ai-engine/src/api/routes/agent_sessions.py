# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [supabase, api.enhanced_features]
"""
VITAL API - Agent Sessions Endpoints
=====================================
REST endpoints for agent session management:
- Create sessions with context selection
- Track session metrics (tokens, cost, response time)
- Manage session lifecycle (active, paused, expired, completed)
- Agent instantiation with context injection

Reference: AGENT_SCHEMA_SPEC.md Section 0.7
Phase 2.5-2.6 of Agent OS Implementation
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
import structlog

from supabase import Client
from api.enhanced_features import get_supabase

logger = structlog.get_logger()

router = APIRouter(prefix="/api/agents/sessions", tags=["agent-sessions"])


# =============================================================================
# MODELS
# =============================================================================

class CreateSessionRequest(BaseModel):
    """Request to create a new agent session"""
    agent_id: str = Field(..., description="ID of the agent to chat with")
    user_id: str = Field(..., description="User ID")
    tenant_id: str = Field(..., description="Tenant/organization ID")
    
    # Optional context selection
    region_id: Optional[str] = Field(None, description="Regulatory region context (e.g., FDA)")
    domain_id: Optional[str] = Field(None, description="Product domain context (e.g., Pharma)")
    therapeutic_area_id: Optional[str] = Field(None, description="Therapeutic area (e.g., Oncology)")
    phase_id: Optional[str] = Field(None, description="Development phase (e.g., Phase III)")
    
    # Optional personality override
    personality_type_id: Optional[str] = Field(None, description="Override agent's default personality")
    
    # Session configuration
    session_name: Optional[str] = Field(None, description="Optional session name")
    session_mode: Literal["interactive", "autonomous", "batch"] = Field(
        "interactive", description="Session mode"
    )
    expires_in_hours: int = Field(24, ge=0, le=720, description="Session expiry (0 = no expiry)")


class SessionResponse(BaseModel):
    """Session response model"""
    id: str
    agent_id: str
    user_id: str
    tenant_id: str
    
    # Context
    context_region_id: Optional[str] = None
    context_domain_id: Optional[str] = None
    context_therapeutic_area_id: Optional[str] = None
    context_phase_id: Optional[str] = None
    personality_type_id: Optional[str] = None
    
    # Session info
    session_name: Optional[str] = None
    session_mode: str = "interactive"
    status: str = "active"
    
    # Timestamps
    started_at: Optional[str] = None
    expires_at: Optional[str] = None
    last_activity_at: Optional[str] = None
    
    # Metrics
    query_count: int = 0
    total_tokens_used: int = 0
    total_cost_usd: float = 0.0


class ActiveSessionView(BaseModel):
    """Active session with resolved context names"""
    session_id: str
    user_id: str
    tenant_id: str
    
    # Agent info
    agent_id: str
    agent_name: Optional[str] = None
    agent_display_name: Optional[str] = None
    agent_level: Optional[int] = None
    
    # Context (resolved names)
    region_code: Optional[str] = None
    region_name: Optional[str] = None
    domain_code: Optional[str] = None
    domain_name: Optional[str] = None
    therapeutic_area_code: Optional[str] = None
    therapeutic_area_name: Optional[str] = None
    phase_code: Optional[str] = None
    phase_name: Optional[str] = None
    
    # Effective personality
    personality_slug: Optional[str] = None
    personality_name: Optional[str] = None
    personality_temperature: Optional[float] = None
    
    # Session info
    status: str
    session_mode: str
    started_at: Optional[str] = None
    expires_at: Optional[str] = None
    last_activity_at: Optional[str] = None
    
    # Metrics
    query_count: int = 0
    total_tokens_used: int = 0
    total_cost_usd: float = 0.0


class UpdateMetricsRequest(BaseModel):
    """Request to update session metrics after a query"""
    input_tokens: int = Field(..., ge=0)
    output_tokens: int = Field(..., ge=0)
    cost_usd: float = Field(..., ge=0)
    response_time_ms: Optional[int] = Field(None, ge=0)


class InstantiateAgentRequest(BaseModel):
    """Request to instantiate an agent with context injection"""
    agent_id: str = Field(..., description="Base agent ID")
    user_id: str = Field(..., description="User ID")
    tenant_id: str = Field(..., description="Tenant ID")
    
    # Context injection
    region_id: Optional[str] = None
    domain_id: Optional[str] = None
    therapeutic_area_id: Optional[str] = None
    phase_id: Optional[str] = None
    personality_type_id: Optional[str] = None
    
    # Session config
    session_mode: Literal["interactive", "autonomous", "batch"] = "interactive"
    expires_in_hours: int = 24


class InstantiatedAgent(BaseModel):
    """Response with instantiated agent configuration"""
    session_id: str
    agent_id: str
    agent_name: str
    agent_display_name: Optional[str] = None
    
    # Resolved context
    resolved_context: dict = {}
    
    # Effective personality configuration
    personality: dict = {}
    
    # LLM configuration
    llm_config: dict = {}
    
    # System prompt (with context injected)
    system_prompt: Optional[str] = None


# =============================================================================
# SESSION ENDPOINTS
# =============================================================================

@router.post("/", response_model=SessionResponse)
async def create_session(
    request: CreateSessionRequest,
    supabase: Client = Depends(get_supabase)
):
    """
    Create a new agent session with optional context selection.
    
    The session tracks:
    - Which agent the user is chatting with
    - Selected context (region, domain, TA, phase)
    - Optional personality override
    - Usage metrics (tokens, cost)
    """
    try:
        # Use the create_agent_session database function
        result = supabase.rpc('create_agent_session', {
            'p_agent_id': request.agent_id,
            'p_user_id': request.user_id,
            'p_tenant_id': request.tenant_id,
            'p_region_id': request.region_id,
            'p_domain_id': request.domain_id,
            'p_therapeutic_area_id': request.therapeutic_area_id,
            'p_phase_id': request.phase_id,
            'p_personality_type_id': request.personality_type_id,
            'p_session_mode': request.session_mode,
            'p_expires_in_hours': request.expires_in_hours
        }).execute()
        
        session_id = result.data
        
        if not session_id:
            raise HTTPException(status_code=500, detail="Failed to create session")
        
        # Fetch the created session
        session_result = supabase.table('agent_sessions').select('*').eq('id', session_id).execute()
        
        if not session_result.data:
            raise HTTPException(status_code=500, detail="Session created but not found")
        
        session_data = session_result.data[0]
        
        # Update session name if provided
        if request.session_name:
            supabase.table('agent_sessions').update(
                {'session_name': request.session_name}
            ).eq('id', session_id).execute()
            session_data['session_name'] = request.session_name
        
        logger.info("session_created", session_id=session_id, agent_id=request.agent_id)
        
        return SessionResponse(
            id=session_data['id'],
            agent_id=session_data['agent_id'],
            user_id=session_data['user_id'],
            tenant_id=session_data['tenant_id'],
            context_region_id=session_data.get('context_region_id'),
            context_domain_id=session_data.get('context_domain_id'),
            context_therapeutic_area_id=session_data.get('context_therapeutic_area_id'),
            context_phase_id=session_data.get('context_phase_id'),
            personality_type_id=session_data.get('personality_type_id'),
            session_name=session_data.get('session_name'),
            session_mode=session_data.get('session_mode', 'interactive'),
            status=session_data.get('status', 'active'),
            started_at=session_data.get('started_at'),
            expires_at=session_data.get('expires_at'),
            last_activity_at=session_data.get('last_activity_at'),
            query_count=session_data.get('query_count', 0),
            total_tokens_used=session_data.get('total_tokens_used', 0),
            total_cost_usd=float(session_data.get('total_cost_usd', 0))
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("create_session_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Get session details by ID"""
    try:
        result = supabase.table('agent_sessions').select('*').eq('id', session_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
        
        session_data = result.data[0]
        
        return SessionResponse(
            id=session_data['id'],
            agent_id=session_data['agent_id'],
            user_id=session_data['user_id'],
            tenant_id=session_data['tenant_id'],
            context_region_id=session_data.get('context_region_id'),
            context_domain_id=session_data.get('context_domain_id'),
            context_therapeutic_area_id=session_data.get('context_therapeutic_area_id'),
            context_phase_id=session_data.get('context_phase_id'),
            personality_type_id=session_data.get('personality_type_id'),
            session_name=session_data.get('session_name'),
            session_mode=session_data.get('session_mode', 'interactive'),
            status=session_data.get('status', 'active'),
            started_at=session_data.get('started_at'),
            expires_at=session_data.get('expires_at'),
            last_activity_at=session_data.get('last_activity_at'),
            query_count=session_data.get('query_count', 0),
            total_tokens_used=session_data.get('total_tokens_used', 0),
            total_cost_usd=float(session_data.get('total_cost_usd', 0))
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")


@router.get("/user/{user_id}/active", response_model=List[ActiveSessionView])
async def get_user_active_sessions(
    user_id: str,
    limit: int = Query(10, ge=1, le=50),
    supabase: Client = Depends(get_supabase)
):
    """
    Get all active sessions for a user.
    
    Uses v_active_sessions view for resolved context names.
    """
    try:
        result = supabase.table('v_active_sessions').select('*').eq(
            'user_id', user_id
        ).order('last_activity_at', desc=True).limit(limit).execute()
        
        if not result.data:
            return []
        
        return [
            ActiveSessionView(**row) for row in result.data
        ]
    
    except Exception as e:
        logger.error("get_user_sessions_failed", error=str(e), user_id=user_id)
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")


@router.post("/{session_id}/metrics")
async def update_session_metrics(
    session_id: str,
    request: UpdateMetricsRequest,
    supabase: Client = Depends(get_supabase)
):
    """
    Update session metrics after a query.
    
    Increments query count, tokens, and cost.
    Also updates average response time.
    """
    try:
        # Use the update_session_metrics database function
        supabase.rpc('update_session_metrics', {
            'p_session_id': session_id,
            'p_input_tokens': request.input_tokens,
            'p_output_tokens': request.output_tokens,
            'p_cost_usd': request.cost_usd,
            'p_response_time_ms': request.response_time_ms
        }).execute()
        
        return {
            "status": "updated",
            "session_id": session_id,
            "tokens_added": request.input_tokens + request.output_tokens,
            "cost_added": request.cost_usd
        }
    
    except Exception as e:
        logger.error("update_metrics_failed", error=str(e), session_id=session_id)
        raise HTTPException(status_code=500, detail=f"Failed to update metrics: {str(e)}")


@router.post("/{session_id}/complete")
async def complete_session(
    session_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Mark a session as completed"""
    try:
        supabase.table('agent_sessions').update({
            'status': 'completed',
            'completed_at': datetime.utcnow().isoformat()
        }).eq('id', session_id).execute()
        
        return {"status": "completed", "session_id": session_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete session: {str(e)}")


@router.post("/{session_id}/pause")
async def pause_session(
    session_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Pause a session"""
    try:
        supabase.table('agent_sessions').update({
            'status': 'paused'
        }).eq('id', session_id).execute()
        
        return {"status": "paused", "session_id": session_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to pause session: {str(e)}")


@router.post("/{session_id}/resume")
async def resume_session(
    session_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Resume a paused session"""
    try:
        supabase.table('agent_sessions').update({
            'status': 'active'
        }).eq('id', session_id).eq('status', 'paused').execute()
        
        return {"status": "active", "session_id": session_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resume session: {str(e)}")


@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Delete a session (hard delete)"""
    try:
        supabase.table('agent_sessions').delete().eq('id', session_id).execute()
        
        return {"status": "deleted", "session_id": session_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")


# =============================================================================
# AGENT INSTANTIATION
# =============================================================================

@router.post("/instantiate", response_model=InstantiatedAgent)
async def instantiate_agent(
    request: InstantiateAgentRequest,
    supabase: Client = Depends(get_supabase)
):
    """
    Instantiate an agent with context injection.
    
    This is the key endpoint for "Context Injection" / "Ephemeral Instantiation":
    1. Creates a session
    2. Resolves all context IDs to names
    3. Loads agent configuration
    4. Applies personality settings
    5. Returns fully configured agent ready for chat
    
    Reference: AGENT_BACKEND_INTEGRATION_SPEC.md
    """
    try:
        # 1. Get base agent
        agent_result = supabase.table('agents').select(
            '*, personality_types(slug, display_name, temperature, verbosity_level, formality_level, directness_level, reasoning_approach, tone_keywords)'
        ).eq('id', request.agent_id).execute()
        
        if not agent_result.data:
            raise HTTPException(status_code=404, detail=f"Agent '{request.agent_id}' not found")
        
        agent = agent_result.data[0]
        
        # 2. Create session
        session_result = supabase.rpc('create_agent_session', {
            'p_agent_id': request.agent_id,
            'p_user_id': request.user_id,
            'p_tenant_id': request.tenant_id,
            'p_region_id': request.region_id,
            'p_domain_id': request.domain_id,
            'p_therapeutic_area_id': request.therapeutic_area_id,
            'p_phase_id': request.phase_id,
            'p_personality_type_id': request.personality_type_id,
            'p_session_mode': request.session_mode,
            'p_expires_in_hours': request.expires_in_hours
        }).execute()
        
        session_id = session_result.data
        
        # 3. Resolve context
        resolved_context = {}
        
        if request.region_id:
            region = supabase.table('context_regions').select('code, name').eq('id', request.region_id).execute()
            if region.data:
                resolved_context['region'] = region.data[0]
        
        if request.domain_id:
            domain = supabase.table('context_domains').select('code, name').eq('id', request.domain_id).execute()
            if domain.data:
                resolved_context['domain'] = domain.data[0]
        
        if request.therapeutic_area_id:
            ta = supabase.table('context_therapeutic_areas').select('code, name').eq('id', request.therapeutic_area_id).execute()
            if ta.data:
                resolved_context['therapeutic_area'] = ta.data[0]
        
        if request.phase_id:
            phase = supabase.table('context_phases').select('code, name').eq('id', request.phase_id).execute()
            if phase.data:
                resolved_context['phase'] = phase.data[0]
        
        # 4. Get effective personality
        personality_data = {}
        
        if request.personality_type_id:
            # Override personality
            pers_result = supabase.table('personality_types').select('*').eq('id', request.personality_type_id).execute()
            if pers_result.data:
                personality_data = pers_result.data[0]
        elif agent.get('personality_types'):
            # Use agent's default personality
            personality_data = agent['personality_types']
        
        # 5. Build LLM config from personality
        llm_config = {
            "temperature": personality_data.get('temperature', agent.get('temperature', 0.3)),
            "max_tokens": personality_data.get('default_max_tokens', agent.get('max_tokens', 2048)),
            "model": agent.get('base_model', 'gpt-4'),
            "top_p": personality_data.get('top_p', 0.9),
            "frequency_penalty": personality_data.get('frequency_penalty', 0.0),
            "presence_penalty": personality_data.get('presence_penalty', 0.0)
        }
        
        # 6. Build context-injected system prompt
        base_prompt = agent.get('system_prompt', '')
        context_section = ""
        
        if resolved_context:
            context_parts = []
            if 'region' in resolved_context:
                context_parts.append(f"Regulatory Region: {resolved_context['region']['name']} ({resolved_context['region']['code']})")
            if 'domain' in resolved_context:
                context_parts.append(f"Product Domain: {resolved_context['domain']['name']}")
            if 'therapeutic_area' in resolved_context:
                context_parts.append(f"Therapeutic Area: {resolved_context['therapeutic_area']['name']}")
            if 'phase' in resolved_context:
                context_parts.append(f"Development Phase: {resolved_context['phase']['name']}")
            
            if context_parts:
                context_section = "\n\n## Session Context\n" + "\n".join(f"- {p}" for p in context_parts)
        
        system_prompt = base_prompt + context_section
        
        logger.info(
            "agent_instantiated",
            session_id=session_id,
            agent_id=request.agent_id,
            context_keys=list(resolved_context.keys())
        )
        
        return InstantiatedAgent(
            session_id=session_id,
            agent_id=request.agent_id,
            agent_name=agent.get('name', 'Unknown'),
            agent_display_name=agent.get('display_name'),
            resolved_context=resolved_context,
            personality={
                "slug": personality_data.get('slug'),
                "display_name": personality_data.get('display_name'),
                "temperature": personality_data.get('temperature'),
                "verbosity_level": personality_data.get('verbosity_level'),
                "formality_level": personality_data.get('formality_level'),
                "directness_level": personality_data.get('directness_level'),
                "reasoning_approach": personality_data.get('reasoning_approach'),
                "tone_keywords": personality_data.get('tone_keywords', [])
            },
            llm_config=llm_config,
            system_prompt=system_prompt
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("instantiate_agent_failed", error=str(e), agent_id=request.agent_id)
        raise HTTPException(status_code=500, detail=f"Failed to instantiate agent: {str(e)}")


# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================

@router.post("/expire-old")
async def expire_old_sessions(
    supabase: Client = Depends(get_supabase)
):
    """
    Expire sessions that have passed their expiry time.
    
    This should be called periodically via cron job.
    Uses the expire_agent_sessions database function.
    """
    try:
        result = supabase.rpc('expire_agent_sessions').execute()
        expired_count = result.data if result.data else 0
        
        logger.info("sessions_expired", count=expired_count)
        
        return {
            "status": "completed",
            "expired_count": expired_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error("expire_sessions_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to expire sessions: {str(e)}")


@router.get("/stats")
async def get_session_stats(
    tenant_id: Optional[str] = Query(None),
    supabase: Client = Depends(get_supabase)
):
    """Get session statistics"""
    try:
        query = supabase.table('agent_sessions').select('status, session_mode, query_count, total_tokens_used, total_cost_usd')
        
        if tenant_id:
            query = query.eq('tenant_id', tenant_id)
        
        result = query.execute()
        
        if not result.data:
            return {
                "total_sessions": 0,
                "by_status": {},
                "by_mode": {},
                "total_queries": 0,
                "total_tokens": 0,
                "total_cost_usd": 0.0
            }
        
        # Aggregate stats
        by_status = {}
        by_mode = {}
        total_queries = 0
        total_tokens = 0
        total_cost = 0.0
        
        for session in result.data:
            status = session.get('status', 'unknown')
            mode = session.get('session_mode', 'unknown')
            
            by_status[status] = by_status.get(status, 0) + 1
            by_mode[mode] = by_mode.get(mode, 0) + 1
            
            total_queries += session.get('query_count', 0)
            total_tokens += session.get('total_tokens_used', 0)
            total_cost += float(session.get('total_cost_usd', 0))
        
        return {
            "total_sessions": len(result.data),
            "by_status": by_status,
            "by_mode": by_mode,
            "total_queries": total_queries,
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 4),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error("get_session_stats_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
