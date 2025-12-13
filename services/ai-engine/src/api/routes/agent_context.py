# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [supabase, api.enhanced_features]
"""
VITAL API - Agent Context Endpoints
====================================
REST endpoints for agent context management:
- Personality Types (behavioral configuration)
- Context Lookup Tables (regions, domains, therapeutic areas, phases)
- Agent-Context Assignments (junction tables)

Reference: AGENT_SCHEMA_SPEC.md, AGENT_IMPLEMENTATION_PLAN.md
Phase 2.1-2.3 of Agent OS Implementation
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
import structlog

from supabase import Client
from api.enhanced_features import get_supabase

logger = structlog.get_logger()

router = APIRouter(prefix="/api/agents/context", tags=["agent-context"])


# =============================================================================
# MODELS - Personality Types
# =============================================================================

class PersonalityType(BaseModel):
    """Personality type model - defines agent behavioral configuration"""
    id: str
    name: str
    slug: str
    display_name: str
    description: Optional[str] = None
    
    # LLM Parameters
    temperature: float = 0.3
    top_p: float = 0.9
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    
    # Response characteristics
    verbosity_level: int = 50
    detail_orientation: int = 50
    default_max_tokens: int = 2048
    preferred_response_format: str = "prose"
    
    # Communication style
    formality_level: int = 50
    directness_level: int = 50
    warmth_level: int = 50
    technical_level: int = 50
    
    # Reasoning
    reasoning_approach: str = "balanced"
    proactivity_level: int = 50
    risk_tolerance: int = 50
    creativity_level: int = 50
    
    # Visual
    icon: Optional[str] = None
    color: Optional[str] = None
    category: str = "general"
    
    # Status
    is_active: bool = True
    sort_order: int = 0


class PersonalityTypeSlim(BaseModel):
    """Slim personality type for dropdown selectors"""
    id: str
    slug: str
    display_name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    temperature: float
    category: str


# =============================================================================
# MODELS - Context Lookup Tables
# =============================================================================

class ContextRegion(BaseModel):
    """Regulatory region context"""
    id: str
    code: str
    name: str
    country: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class ContextDomain(BaseModel):
    """Product domain context"""
    id: str
    code: str
    name: str
    description: Optional[str] = None
    parent_domain_id: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class ContextTherapeuticArea(BaseModel):
    """Therapeutic area context"""
    id: str
    code: str
    name: str
    description: Optional[str] = None
    icd_codes: Optional[List[str]] = None
    mesh_terms: Optional[List[str]] = None
    is_active: bool = True
    sort_order: int = 0


class ContextPhase(BaseModel):
    """Development phase context"""
    id: str
    code: str
    name: str
    description: Optional[str] = None
    sequence_order: int
    typical_duration_months: Optional[int] = None
    is_active: bool = True


# =============================================================================
# MODELS - Agent Context Assignments
# =============================================================================

class AgentContextAssignment(BaseModel):
    """Base model for agent-context junction records"""
    id: str
    agent_id: str
    is_primary: bool = False
    proficiency_level: str = "proficient"
    notes: Optional[str] = None


class AgentRegionAssignment(AgentContextAssignment):
    """Agent-Region junction"""
    region_id: str
    region_code: Optional[str] = None
    region_name: Optional[str] = None


class AgentDomainAssignment(AgentContextAssignment):
    """Agent-Domain junction"""
    domain_id: str
    domain_code: Optional[str] = None
    domain_name: Optional[str] = None


class AgentContextSummary(BaseModel):
    """Summary of all contexts for an agent"""
    agent_id: str
    agent_name: str
    regions: List[str] = []
    domains: List[str] = []
    therapeutic_areas: List[str] = []
    phases: List[str] = []


class AssignContextRequest(BaseModel):
    """Request to assign context to an agent"""
    agent_id: str
    context_id: str
    is_primary: bool = False
    proficiency_level: str = "proficient"
    notes: Optional[str] = None


# =============================================================================
# PERSONALITY TYPES ENDPOINTS
# =============================================================================

@router.get("/personality-types", response_model=List[PersonalityTypeSlim])
async def list_personality_types(
    category: Optional[str] = Query(None, description="Filter by category (general, medical, business, technical)"),
    active_only: bool = Query(True, description="Only return active personality types"),
    supabase: Client = Depends(get_supabase)
):
    """
    List all personality types for dropdown selectors.
    
    Returns slim model with essential fields for UI.
    """
    try:
        query = supabase.table('personality_types').select(
            'id, slug, display_name, icon, color, temperature, category, is_active, sort_order'
        )
        
        if active_only:
            query = query.eq('is_active', True)
        
        if category:
            query = query.eq('category', category)
        
        query = query.order('sort_order')
        result = query.execute()
        
        return result.data if result.data else []
    
    except Exception as e:
        logger.error("list_personality_types_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list personality types: {str(e)}")


@router.get("/personality-types/{personality_id}", response_model=PersonalityType)
async def get_personality_type(
    personality_id: str,
    supabase: Client = Depends(get_supabase)
):
    """
    Get full personality type details by ID or slug.
    
    Returns all behavioral parameters for agent configuration.
    """
    try:
        # Try by ID first, then by slug
        result = supabase.table('personality_types').select('*').eq('id', personality_id).execute()
        
        if not result.data:
            result = supabase.table('personality_types').select('*').eq('slug', personality_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Personality type '{personality_id}' not found")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_personality_type_failed", error=str(e), personality_id=personality_id)
        raise HTTPException(status_code=500, detail=f"Failed to get personality type: {str(e)}")


# =============================================================================
# CONTEXT LOOKUP ENDPOINTS - Regions
# =============================================================================

@router.get("/regions", response_model=List[ContextRegion])
async def list_regions(
    active_only: bool = Query(True),
    supabase: Client = Depends(get_supabase)
):
    """List all regulatory regions (FDA, EMA, PMDA, etc.)"""
    try:
        query = supabase.table('context_regions').select('*')
        
        if active_only:
            query = query.eq('is_active', True)
        
        query = query.order('sort_order')
        result = query.execute()
        
        return result.data if result.data else []
    
    except Exception as e:
        logger.error("list_regions_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list regions: {str(e)}")


@router.get("/regions/{region_id}", response_model=ContextRegion)
async def get_region(region_id: str, supabase: Client = Depends(get_supabase)):
    """Get a single region by ID or code"""
    try:
        result = supabase.table('context_regions').select('*').eq('id', region_id).execute()
        
        if not result.data:
            result = supabase.table('context_regions').select('*').eq('code', region_id.upper()).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get region: {str(e)}")


# =============================================================================
# CONTEXT LOOKUP ENDPOINTS - Domains
# =============================================================================

@router.get("/domains", response_model=List[ContextDomain])
async def list_domains(
    active_only: bool = Query(True),
    supabase: Client = Depends(get_supabase)
):
    """List all product domains (Pharmaceuticals, Devices, Biologics, etc.)"""
    try:
        query = supabase.table('context_domains').select('*')
        
        if active_only:
            query = query.eq('is_active', True)
        
        query = query.order('sort_order')
        result = query.execute()
        
        return result.data if result.data else []
    
    except Exception as e:
        logger.error("list_domains_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list domains: {str(e)}")


@router.get("/domains/{domain_id}", response_model=ContextDomain)
async def get_domain(domain_id: str, supabase: Client = Depends(get_supabase)):
    """Get a single domain by ID or code"""
    try:
        result = supabase.table('context_domains').select('*').eq('id', domain_id).execute()
        
        if not result.data:
            result = supabase.table('context_domains').select('*').eq('code', domain_id.upper()).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Domain '{domain_id}' not found")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get domain: {str(e)}")


# =============================================================================
# CONTEXT LOOKUP ENDPOINTS - Therapeutic Areas
# =============================================================================

@router.get("/therapeutic-areas", response_model=List[ContextTherapeuticArea])
async def list_therapeutic_areas(
    active_only: bool = Query(True),
    supabase: Client = Depends(get_supabase)
):
    """List all therapeutic areas (Oncology, Cardiology, Neurology, etc.)"""
    try:
        query = supabase.table('context_therapeutic_areas').select('*')
        
        if active_only:
            query = query.eq('is_active', True)
        
        query = query.order('sort_order')
        result = query.execute()
        
        return result.data if result.data else []
    
    except Exception as e:
        logger.error("list_therapeutic_areas_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list therapeutic areas: {str(e)}")


@router.get("/therapeutic-areas/{ta_id}", response_model=ContextTherapeuticArea)
async def get_therapeutic_area(ta_id: str, supabase: Client = Depends(get_supabase)):
    """Get a single therapeutic area by ID or code"""
    try:
        result = supabase.table('context_therapeutic_areas').select('*').eq('id', ta_id).execute()
        
        if not result.data:
            result = supabase.table('context_therapeutic_areas').select('*').eq('code', ta_id.upper()).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Therapeutic area '{ta_id}' not found")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get therapeutic area: {str(e)}")


# =============================================================================
# CONTEXT LOOKUP ENDPOINTS - Development Phases
# =============================================================================

@router.get("/phases", response_model=List[ContextPhase])
async def list_phases(
    active_only: bool = Query(True),
    supabase: Client = Depends(get_supabase)
):
    """List all development phases (Discovery, Pre-IND, Phase I-IV, NDA, etc.)"""
    try:
        query = supabase.table('context_phases').select('*')
        
        if active_only:
            query = query.eq('is_active', True)
        
        query = query.order('sequence_order')
        result = query.execute()
        
        return result.data if result.data else []
    
    except Exception as e:
        logger.error("list_phases_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list phases: {str(e)}")


@router.get("/phases/{phase_id}", response_model=ContextPhase)
async def get_phase(phase_id: str, supabase: Client = Depends(get_supabase)):
    """Get a single phase by ID or code"""
    try:
        result = supabase.table('context_phases').select('*').eq('id', phase_id).execute()
        
        if not result.data:
            result = supabase.table('context_phases').select('*').eq('code', phase_id.upper()).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Phase '{phase_id}' not found")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get phase: {str(e)}")


# =============================================================================
# AGENT CONTEXT ASSIGNMENTS
# =============================================================================

@router.get("/agents/{agent_id}/contexts", response_model=AgentContextSummary)
async def get_agent_contexts(
    agent_id: str,
    supabase: Client = Depends(get_supabase)
):
    """
    Get all context assignments for an agent.
    
    Returns aggregated lists of region codes, domain codes, TA codes, and phase codes.
    Uses the v_agent_contexts view for efficient retrieval.
    """
    try:
        # Use the convenience view
        result = supabase.table('v_agent_contexts').select('*').eq('agent_id', agent_id).execute()
        
        if not result.data:
            # Agent might exist but have no contexts - get basic agent info
            agent_result = supabase.table('agents').select('id, name').eq('id', agent_id).execute()
            if not agent_result.data:
                raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
            
            return AgentContextSummary(
                agent_id=agent_id,
                agent_name=agent_result.data[0].get('name', 'Unknown'),
                regions=[],
                domains=[],
                therapeutic_areas=[],
                phases=[]
            )
        
        data = result.data[0]
        return AgentContextSummary(
            agent_id=data['agent_id'],
            agent_name=data.get('agent_display_name') or data.get('agent_name', 'Unknown'),
            regions=data.get('region_codes', []) or [],
            domains=data.get('domain_codes', []) or [],
            therapeutic_areas=data.get('therapeutic_area_codes', []) or [],
            phases=data.get('phase_codes', []) or []
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_agent_contexts_failed", error=str(e), agent_id=agent_id)
        raise HTTPException(status_code=500, detail=f"Failed to get agent contexts: {str(e)}")


@router.post("/agents/{agent_id}/regions")
async def assign_region_to_agent(
    agent_id: str,
    request: AssignContextRequest,
    supabase: Client = Depends(get_supabase)
):
    """Assign a regulatory region to an agent"""
    try:
        data = {
            "agent_id": agent_id,
            "region_id": request.context_id,
            "is_primary": request.is_primary,
            "proficiency_level": request.proficiency_level,
            "notes": request.notes
        }
        
        result = supabase.table('agent_regions').upsert(data, on_conflict='agent_id,region_id').execute()
        
        return {
            "status": "assigned",
            "agent_id": agent_id,
            "region_id": request.context_id,
            "id": result.data[0]['id'] if result.data else None
        }
    
    except Exception as e:
        logger.error("assign_region_failed", error=str(e), agent_id=agent_id)
        raise HTTPException(status_code=500, detail=f"Failed to assign region: {str(e)}")


@router.delete("/agents/{agent_id}/regions/{region_id}")
async def unassign_region_from_agent(
    agent_id: str,
    region_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Remove a region assignment from an agent"""
    try:
        supabase.table('agent_regions').delete().eq('agent_id', agent_id).eq('region_id', region_id).execute()
        
        return {"status": "unassigned", "agent_id": agent_id, "region_id": region_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unassign region: {str(e)}")


@router.post("/agents/{agent_id}/domains")
async def assign_domain_to_agent(
    agent_id: str,
    request: AssignContextRequest,
    supabase: Client = Depends(get_supabase)
):
    """Assign a product domain to an agent"""
    try:
        data = {
            "agent_id": agent_id,
            "domain_id": request.context_id,
            "is_primary": request.is_primary,
            "proficiency_level": request.proficiency_level,
            "notes": request.notes
        }
        
        result = supabase.table('agent_domains').upsert(data, on_conflict='agent_id,domain_id').execute()
        
        return {
            "status": "assigned",
            "agent_id": agent_id,
            "domain_id": request.context_id,
            "id": result.data[0]['id'] if result.data else None
        }
    
    except Exception as e:
        logger.error("assign_domain_failed", error=str(e), agent_id=agent_id)
        raise HTTPException(status_code=500, detail=f"Failed to assign domain: {str(e)}")


@router.delete("/agents/{agent_id}/domains/{domain_id}")
async def unassign_domain_from_agent(
    agent_id: str,
    domain_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Remove a domain assignment from an agent"""
    try:
        supabase.table('agent_domains').delete().eq('agent_id', agent_id).eq('domain_id', domain_id).execute()
        
        return {"status": "unassigned", "agent_id": agent_id, "domain_id": domain_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unassign domain: {str(e)}")


@router.post("/agents/{agent_id}/therapeutic-areas")
async def assign_therapeutic_area_to_agent(
    agent_id: str,
    request: AssignContextRequest,
    supabase: Client = Depends(get_supabase)
):
    """Assign a therapeutic area to an agent"""
    try:
        data = {
            "agent_id": agent_id,
            "therapeutic_area_id": request.context_id,
            "is_primary": request.is_primary,
            "proficiency_level": request.proficiency_level,
            "notes": request.notes
        }
        
        result = supabase.table('agent_therapeutic_areas').upsert(
            data, on_conflict='agent_id,therapeutic_area_id'
        ).execute()
        
        return {
            "status": "assigned",
            "agent_id": agent_id,
            "therapeutic_area_id": request.context_id,
            "id": result.data[0]['id'] if result.data else None
        }
    
    except Exception as e:
        logger.error("assign_ta_failed", error=str(e), agent_id=agent_id)
        raise HTTPException(status_code=500, detail=f"Failed to assign therapeutic area: {str(e)}")


@router.delete("/agents/{agent_id}/therapeutic-areas/{ta_id}")
async def unassign_therapeutic_area_from_agent(
    agent_id: str,
    ta_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Remove a therapeutic area assignment from an agent"""
    try:
        supabase.table('agent_therapeutic_areas').delete().eq(
            'agent_id', agent_id
        ).eq('therapeutic_area_id', ta_id).execute()
        
        return {"status": "unassigned", "agent_id": agent_id, "therapeutic_area_id": ta_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unassign therapeutic area: {str(e)}")


@router.post("/agents/{agent_id}/phases")
async def assign_phase_to_agent(
    agent_id: str,
    request: AssignContextRequest,
    supabase: Client = Depends(get_supabase)
):
    """Assign a development phase to an agent"""
    try:
        data = {
            "agent_id": agent_id,
            "phase_id": request.context_id,
            "is_primary": request.is_primary,
            "proficiency_level": request.proficiency_level,
            "notes": request.notes
        }
        
        result = supabase.table('agent_phases').upsert(data, on_conflict='agent_id,phase_id').execute()
        
        return {
            "status": "assigned",
            "agent_id": agent_id,
            "phase_id": request.context_id,
            "id": result.data[0]['id'] if result.data else None
        }
    
    except Exception as e:
        logger.error("assign_phase_failed", error=str(e), agent_id=agent_id)
        raise HTTPException(status_code=500, detail=f"Failed to assign phase: {str(e)}")


@router.delete("/agents/{agent_id}/phases/{phase_id}")
async def unassign_phase_from_agent(
    agent_id: str,
    phase_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Remove a phase assignment from an agent"""
    try:
        supabase.table('agent_phases').delete().eq('agent_id', agent_id).eq('phase_id', phase_id).execute()
        
        return {"status": "unassigned", "agent_id": agent_id, "phase_id": phase_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unassign phase: {str(e)}")


# =============================================================================
# BULK OPERATIONS
# =============================================================================

@router.get("/all-lookups")
async def get_all_context_lookups(
    active_only: bool = Query(True),
    supabase: Client = Depends(get_supabase)
):
    """
    Get all context lookup data in a single call.
    
    Useful for populating dropdowns on initial page load.
    Returns personality types, regions, domains, therapeutic areas, and phases.
    """
    try:
        # Execute all queries
        personality_query = supabase.table('personality_types').select(
            'id, slug, display_name, icon, color, temperature, category'
        )
        regions_query = supabase.table('context_regions').select('id, code, name, country')
        domains_query = supabase.table('context_domains').select('id, code, name')
        tas_query = supabase.table('context_therapeutic_areas').select('id, code, name')
        phases_query = supabase.table('context_phases').select('id, code, name, sequence_order')
        
        if active_only:
            personality_query = personality_query.eq('is_active', True)
            regions_query = regions_query.eq('is_active', True)
            domains_query = domains_query.eq('is_active', True)
            tas_query = tas_query.eq('is_active', True)
            phases_query = phases_query.eq('is_active', True)
        
        personality_result = personality_query.order('sort_order').execute()
        regions_result = regions_query.order('sort_order').execute()
        domains_result = domains_query.order('sort_order').execute()
        tas_result = tas_query.order('sort_order').execute()
        phases_result = phases_query.order('sequence_order').execute()
        
        return {
            "personality_types": personality_result.data or [],
            "regions": regions_result.data or [],
            "domains": domains_result.data or [],
            "therapeutic_areas": tas_result.data or [],
            "phases": phases_result.data or [],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error("get_all_lookups_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get lookups: {str(e)}")
