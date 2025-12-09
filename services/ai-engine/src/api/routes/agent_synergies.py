"""
VITAL API - Agent Synergies Endpoints
======================================
REST endpoints for agent synergy management:
- Get synergy scores between agent pairs
- Update synergy scores
- Find best synergy partners for an agent

Reference: AGENT_SCHEMA_SPEC.md Section 0.6
Phase 2.4 of Agent OS Implementation
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import structlog

from supabase import Client
from api.enhanced_features import get_supabase

logger = structlog.get_logger()

router = APIRouter(prefix="/api/agents/synergies", tags=["agent-synergies"])


# =============================================================================
# MODELS
# =============================================================================

class AgentSynergy(BaseModel):
    """Full synergy record between two agents"""
    id: str
    agent_a_id: str
    agent_b_id: str
    synergy_score: float = Field(..., ge=0.0, le=1.0)
    
    # Score components
    co_occurrence_score: Optional[float] = None
    capability_overlap_score: Optional[float] = None
    domain_alignment_score: Optional[float] = None
    success_rate_score: Optional[float] = None
    
    # Human-readable
    synergy_reason: Optional[str] = None
    
    # Evidence
    co_occurrence_count: int = 0
    paired_success_count: int = 0
    paired_total_count: int = 0
    
    # Metadata
    last_calculated_at: Optional[str] = None
    calculation_version: str = "1.0"


class AgentSynergyWithNames(AgentSynergy):
    """Synergy record with agent names for display"""
    agent_a_name: Optional[str] = None
    agent_a_display_name: Optional[str] = None
    agent_b_name: Optional[str] = None
    agent_b_display_name: Optional[str] = None


class SynergyPartner(BaseModel):
    """A synergy partner for an agent"""
    partner_agent_id: str
    partner_name: str
    partner_display_name: Optional[str] = None
    synergy_score: float
    synergy_reason: Optional[str] = None
    co_occurrence_count: int = 0


class UpsertSynergyRequest(BaseModel):
    """Request to create/update synergy between two agents"""
    agent_a_id: str
    agent_b_id: str
    synergy_score: float = Field(..., ge=0.0, le=1.0)
    
    # Optional score components
    co_occurrence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    capability_overlap_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    domain_alignment_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    success_rate_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # Human-readable explanation
    synergy_reason: Optional[str] = None
    
    # Evidence counters
    co_occurrence_count: int = 0
    paired_success_count: int = 0
    paired_total_count: int = 0


class SynergyScoreResponse(BaseModel):
    """Simple synergy score response"""
    agent_a_id: str
    agent_b_id: str
    synergy_score: float
    synergy_reason: Optional[str] = None


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/between/{agent_a_id}/{agent_b_id}", response_model=SynergyScoreResponse)
async def get_synergy_between_agents(
    agent_a_id: str,
    agent_b_id: str,
    supabase: Client = Depends(get_supabase)
):
    """
    Get synergy score between two specific agents.
    
    Order doesn't matter - the function handles ordering internally.
    Returns 0.0 if no synergy record exists.
    """
    try:
        # Use the get_agent_synergy function which handles ordering
        result = supabase.rpc('get_agent_synergy', {
            'a_id': agent_a_id,
            'b_id': agent_b_id
        }).execute()
        
        synergy_score = result.data if result.data else 0.0
        
        # Get the synergy reason if score > 0
        synergy_reason = None
        if synergy_score > 0:
            # Order IDs for lookup
            ordered_a = min(agent_a_id, agent_b_id)
            ordered_b = max(agent_a_id, agent_b_id)
            
            detail_result = supabase.table('agent_synergies').select('synergy_reason').eq(
                'agent_a_id', ordered_a
            ).eq('agent_b_id', ordered_b).execute()
            
            if detail_result.data:
                synergy_reason = detail_result.data[0].get('synergy_reason')
        
        return SynergyScoreResponse(
            agent_a_id=agent_a_id,
            agent_b_id=agent_b_id,
            synergy_score=synergy_score,
            synergy_reason=synergy_reason
        )
    
    except Exception as e:
        logger.error("get_synergy_failed", error=str(e), agent_a_id=agent_a_id, agent_b_id=agent_b_id)
        raise HTTPException(status_code=500, detail=f"Failed to get synergy: {str(e)}")


@router.get("/partners/{agent_id}", response_model=List[SynergyPartner])
async def get_synergy_partners(
    agent_id: str,
    limit: int = Query(10, ge=1, le=50),
    min_score: float = Query(0.5, ge=0.0, le=1.0),
    supabase: Client = Depends(get_supabase)
):
    """
    Get top synergy partners for an agent.
    
    Returns agents with highest synergy scores above the minimum threshold.
    Uses the get_agent_synergy_partners database function.
    """
    try:
        result = supabase.rpc('get_agent_synergy_partners', {
            'p_agent_id': agent_id,
            'p_limit': limit,
            'p_min_score': min_score
        }).execute()
        
        if not result.data:
            return []
        
        return [
            SynergyPartner(
                partner_agent_id=row['partner_agent_id'],
                partner_name=row['partner_name'],
                partner_display_name=row.get('partner_display_name'),
                synergy_score=row['synergy_score'],
                synergy_reason=row.get('synergy_reason'),
                co_occurrence_count=row.get('co_occurrence_count', 0)
            )
            for row in result.data
        ]
    
    except Exception as e:
        logger.error("get_synergy_partners_failed", error=str(e), agent_id=agent_id)
        raise HTTPException(status_code=500, detail=f"Failed to get synergy partners: {str(e)}")


@router.get("/all", response_model=List[AgentSynergyWithNames])
async def list_all_synergies(
    min_score: float = Query(0.0, ge=0.0, le=1.0),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    supabase: Client = Depends(get_supabase)
):
    """
    List all synergy records.
    
    Returns synergies with agent names, ordered by score descending.
    Uses the v_agent_all_synergies view.
    """
    try:
        query = supabase.table('v_agent_all_synergies').select('*')
        
        if min_score > 0:
            query = query.gte('synergy_score', min_score)
        
        query = query.order('synergy_score', desc=True).range(offset, offset + limit - 1)
        result = query.execute()
        
        return result.data if result.data else []
    
    except Exception as e:
        logger.error("list_synergies_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list synergies: {str(e)}")


@router.post("/", response_model=dict)
async def upsert_synergy(
    request: UpsertSynergyRequest,
    supabase: Client = Depends(get_supabase)
):
    """
    Create or update synergy between two agents.
    
    Uses the upsert_agent_synergy database function which handles:
    - Automatic ordering of agent IDs
    - Upsert logic (insert or update)
    - Timestamp management
    """
    try:
        result = supabase.rpc('upsert_agent_synergy', {
            'p_agent_a_id': request.agent_a_id,
            'p_agent_b_id': request.agent_b_id,
            'p_synergy_score': request.synergy_score,
            'p_co_occurrence_score': request.co_occurrence_score,
            'p_capability_overlap_score': request.capability_overlap_score,
            'p_domain_alignment_score': request.domain_alignment_score,
            'p_success_rate_score': request.success_rate_score,
            'p_synergy_reason': request.synergy_reason,
            'p_co_occurrence_count': request.co_occurrence_count,
            'p_paired_success_count': request.paired_success_count,
            'p_paired_total_count': request.paired_total_count
        }).execute()
        
        return {
            "status": "upserted",
            "synergy_id": result.data,
            "agent_a_id": request.agent_a_id,
            "agent_b_id": request.agent_b_id,
            "synergy_score": request.synergy_score
        }
    
    except Exception as e:
        logger.error("upsert_synergy_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to upsert synergy: {str(e)}")


@router.delete("/between/{agent_a_id}/{agent_b_id}")
async def delete_synergy(
    agent_a_id: str,
    agent_b_id: str,
    supabase: Client = Depends(get_supabase)
):
    """
    Delete synergy record between two agents.
    
    Order doesn't matter - handles ordering internally.
    """
    try:
        # Order IDs for lookup
        ordered_a = min(agent_a_id, agent_b_id)
        ordered_b = max(agent_a_id, agent_b_id)
        
        supabase.table('agent_synergies').delete().eq(
            'agent_a_id', ordered_a
        ).eq('agent_b_id', ordered_b).execute()
        
        return {
            "status": "deleted",
            "agent_a_id": agent_a_id,
            "agent_b_id": agent_b_id
        }
    
    except Exception as e:
        logger.error("delete_synergy_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete synergy: {str(e)}")


@router.post("/batch")
async def batch_upsert_synergies(
    synergies: List[UpsertSynergyRequest],
    supabase: Client = Depends(get_supabase)
):
    """
    Batch create/update multiple synergy records.
    
    More efficient than individual calls for bulk operations.
    Returns count of successfully processed records.
    """
    try:
        success_count = 0
        errors = []
        
        for synergy in synergies:
            try:
                supabase.rpc('upsert_agent_synergy', {
                    'p_agent_a_id': synergy.agent_a_id,
                    'p_agent_b_id': synergy.agent_b_id,
                    'p_synergy_score': synergy.synergy_score,
                    'p_co_occurrence_score': synergy.co_occurrence_score,
                    'p_capability_overlap_score': synergy.capability_overlap_score,
                    'p_domain_alignment_score': synergy.domain_alignment_score,
                    'p_success_rate_score': synergy.success_rate_score,
                    'p_synergy_reason': synergy.synergy_reason,
                    'p_co_occurrence_count': synergy.co_occurrence_count,
                    'p_paired_success_count': synergy.paired_success_count,
                    'p_paired_total_count': synergy.paired_total_count
                }).execute()
                success_count += 1
            except Exception as e:
                errors.append({
                    "agent_a_id": synergy.agent_a_id,
                    "agent_b_id": synergy.agent_b_id,
                    "error": str(e)
                })
        
        return {
            "status": "completed",
            "total": len(synergies),
            "success_count": success_count,
            "error_count": len(errors),
            "errors": errors[:10] if errors else []  # Limit error details
        }
    
    except Exception as e:
        logger.error("batch_upsert_synergies_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Batch operation failed: {str(e)}")


@router.get("/stats")
async def get_synergy_stats(
    supabase: Client = Depends(get_supabase)
):
    """
    Get statistics about synergy data.
    
    Returns counts, averages, and distribution information.
    """
    try:
        # Get total count
        count_result = supabase.table('agent_synergies').select('id', count='exact').execute()
        total_count = count_result.count if count_result.count else 0
        
        # Get score distribution using raw SQL via RPC if needed
        # For now, calculate from data
        all_scores = supabase.table('agent_synergies').select('synergy_score').execute()
        
        scores = [r['synergy_score'] for r in all_scores.data] if all_scores.data else []
        
        avg_score = sum(scores) / len(scores) if scores else 0
        high_synergy_count = len([s for s in scores if s >= 0.7])
        medium_synergy_count = len([s for s in scores if 0.4 <= s < 0.7])
        low_synergy_count = len([s for s in scores if s < 0.4])
        
        return {
            "total_synergy_records": total_count,
            "average_synergy_score": round(avg_score, 3),
            "high_synergy_count": high_synergy_count,
            "medium_synergy_count": medium_synergy_count,
            "low_synergy_count": low_synergy_count,
            "score_distribution": {
                "high": f"{(high_synergy_count/total_count*100) if total_count else 0:.1f}%",
                "medium": f"{(medium_synergy_count/total_count*100) if total_count else 0:.1f}%",
                "low": f"{(low_synergy_count/total_count*100) if total_count else 0:.1f}%"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error("get_synergy_stats_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
