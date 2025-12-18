# PRODUCTION_TAG: DEVELOPMENT
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [ontology.l3_jtbd]
"""
L3 JTBD API Routes

Jobs-to-be-Done operations including:
- JTBD lookup and search
- Pain point management
- Desired outcome tracking
- ODI opportunity scoring
- JTBD context resolution

Endpoints:
- GET /v1/ontology/jtbd - List JTBDs
- GET /v1/ontology/jtbd/{id} - Get JTBD by ID
- POST /v1/ontology/jtbd/search - Find relevant JTBDs
- GET /v1/ontology/jtbd/{id}/pain-points - Get pain points
- GET /v1/ontology/jtbd/{id}/outcomes - Get desired outcomes
- GET /v1/ontology/jtbd/{id}/success-criteria - Get success criteria
- GET /v1/ontology/jtbd/{id}/opportunity-score - Get ODI score
- GET /v1/ontology/jtbd/top-opportunities - Get top opportunities
- POST /v1/ontology/jtbd/resolve-context - Resolve JTBD context
"""

import logging
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field

from services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/ontology/jtbd", tags=["L3 JTBD"])


# ============== Request/Response Models ==============

class JTBDResponse(BaseModel):
    """JTBD response model"""
    id: str
    code: str
    name: str
    job_statement: str
    when_situation: str
    circumstance: Optional[str] = None
    desired_outcome: str
    job_type: str
    complexity: str
    frequency: Optional[str] = None
    importance_score: float
    satisfaction_score: float
    opportunity_score: float
    runner_family: Optional[str] = None
    is_active: bool


class PainPointResponse(BaseModel):
    """Pain point response model"""
    id: str
    jtbd_id: str
    description: str
    severity: str
    frequency: str
    current_workaround: Optional[str] = None
    impact_score: Optional[float] = None


class DesiredOutcomeResponse(BaseModel):
    """Desired outcome response model"""
    id: str
    jtbd_id: str
    outcome_statement: str
    direction: str
    importance: float
    current_satisfaction: float
    opportunity_score: float


class SuccessCriteriaResponse(BaseModel):
    """Success criteria response model"""
    id: str
    jtbd_id: str
    criteria: str
    measurement_method: Optional[str] = None
    target_value: Optional[str] = None
    current_value: Optional[str] = None


class JTBDSearchRequest(BaseModel):
    """JTBD search request"""
    query: str
    role_id: Optional[str] = None
    function_id: Optional[str] = None
    department_id: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=50)


class JTBDContextRequest(BaseModel):
    """JTBD context resolution request"""
    query: str
    role_id: Optional[str] = None
    function_id: Optional[str] = None


class JTBDContextResponse(BaseModel):
    """JTBD context response"""
    relevant_jtbds: List[dict]
    pain_points: List[dict]
    desired_outcomes: List[dict]
    success_criteria: List[dict]
    top_opportunity_jtbd_id: Optional[str] = None
    max_opportunity_score: float
    recommended_runner_family: Optional[str] = None
    avg_importance: float
    avg_satisfaction: float
    confidence_score: float


class OpportunityScoreResponse(BaseModel):
    """ODI opportunity score response"""
    jtbd_id: str
    jtbd_name: str
    importance_score: float
    satisfaction_score: float
    opportunity_score: float
    opportunity_formula: str = "Importance + MAX(Importance - Satisfaction, 0)"
    classification: str


# ============== Helper Functions ==============

def get_tenant_id() -> str:
    """Get tenant ID - in production, extract from auth token."""
    # TODO: Extract from JWT/auth context
    return "550e8400-e29b-41d4-a716-446655440000"


def calculate_opportunity_score(importance: float, satisfaction: float) -> float:
    """Calculate ODI opportunity score."""
    return importance + max(importance - satisfaction, 0)


def classify_opportunity(score: float) -> str:
    """Classify opportunity based on score."""
    if score >= 15:
        return "high_priority"
    elif score >= 10:
        return "medium_priority"
    else:
        return "low_priority"


# ============== API Endpoints ==============

@router.get("", response_model=List[JTBDResponse])
async def list_jtbds(
    function_id: Optional[str] = Query(None, description="Filter by function ID"),
    role_id: Optional[str] = Query(None, description="Filter by role ID"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """
    List JTBDs with optional filters.

    Returns all active JTBDs for the tenant, optionally filtered by
    function, role, or job type.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        query = supabase.table("jtbds")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .order("opportunity_score", desc=True)\
            .range(offset, offset + limit - 1)

        if job_type:
            query = query.eq("job_type", job_type)

        result = query.execute()
        jtbds = result.data or []

        # Filter by function/role using denormalized arrays
        if function_id:
            jtbds = [j for j in jtbds if function_id in (j.get("function_ids") or [])]
        if role_id:
            jtbds = [j for j in jtbds if role_id in (j.get("role_ids") or [])]

        return [JTBDResponse(**j) for j in jtbds]

    except Exception as e:
        logger.error(f"Error listing JTBDs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{jtbd_id}", response_model=JTBDResponse)
async def get_jtbd(jtbd_id: str):
    """
    Get a JTBD by ID.

    Returns full JTBD details including scores and mappings.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("jtbds")\
            .select("*")\
            .eq("id", jtbd_id)\
            .eq("tenant_id", tenant_id)\
            .maybe_single()\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail=f"JTBD {jtbd_id} not found")

        return JTBDResponse(**result.data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching JTBD: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=List[JTBDResponse])
async def search_jtbds(request: JTBDSearchRequest):
    """
    Find JTBDs relevant to a query.

    Uses text matching and organizational context to find
    the most relevant jobs for the user's request.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Get all active JTBDs
        result = supabase.table("jtbds")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .limit(200)\
            .execute()

        all_jtbds = result.data or []

        # Filter by function/role if provided
        if request.function_id:
            all_jtbds = [j for j in all_jtbds if request.function_id in (j.get("function_ids") or [])]
        if request.role_id:
            all_jtbds = [j for j in all_jtbds if request.role_id in (j.get("role_ids") or [])]

        if not all_jtbds:
            return []

        # Score each JTBD
        query_lower = request.query.lower()
        scored_jtbds = []

        for jtbd in all_jtbds:
            score = 0

            # Job statement match
            job_statement = jtbd.get("job_statement", "").lower()
            if any(word in query_lower for word in job_statement.split()):
                score += 5

            # Name match
            name = jtbd.get("name", "").lower()
            if name in query_lower:
                score += 10
            elif any(word in query_lower for word in name.split()):
                score += 4

            # Desired outcome match
            outcome = jtbd.get("desired_outcome", "").lower()
            if any(word in query_lower for word in outcome.split()):
                score += 3

            # Situation match
            situation = jtbd.get("when_situation", "").lower()
            if any(word in query_lower for word in situation.split()):
                score += 2

            # Boost by opportunity score
            opportunity = jtbd.get("opportunity_score", 0)
            score += opportunity / 10

            if score > 0:
                scored_jtbds.append((score, jtbd))

        # Sort by score and return top N
        scored_jtbds.sort(key=lambda x: x[0], reverse=True)
        top_jtbds = [j for _, j in scored_jtbds[:request.limit]]

        return [JTBDResponse(**j) for j in top_jtbds]

    except Exception as e:
        logger.error(f"Error searching JTBDs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{jtbd_id}/pain-points", response_model=List[PainPointResponse])
async def get_pain_points(jtbd_id: str):
    """
    Get pain points for a JTBD.

    Returns all pain points associated with the specified job.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("jtbd_pain_points")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("jtbd_id", jtbd_id)\
            .eq("is_active", True)\
            .order("severity", desc=True)\
            .execute()

        return [PainPointResponse(**p) for p in (result.data or [])]

    except Exception as e:
        logger.error(f"Error fetching pain points: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{jtbd_id}/outcomes", response_model=List[DesiredOutcomeResponse])
async def get_desired_outcomes(jtbd_id: str):
    """
    Get desired outcomes for a JTBD.

    Returns all desired outcomes with ODI scoring.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("jtbd_desired_outcomes")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("jtbd_id", jtbd_id)\
            .eq("is_active", True)\
            .order("importance", desc=True)\
            .execute()

        outcomes = result.data or []

        # Calculate opportunity score for each outcome
        for outcome in outcomes:
            importance = outcome.get("importance", 0)
            satisfaction = outcome.get("current_satisfaction", 0)
            outcome["opportunity_score"] = calculate_opportunity_score(importance, satisfaction)

        return [DesiredOutcomeResponse(**o) for o in outcomes]

    except Exception as e:
        logger.error(f"Error fetching desired outcomes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{jtbd_id}/success-criteria", response_model=List[SuccessCriteriaResponse])
async def get_success_criteria(jtbd_id: str):
    """
    Get success criteria for a JTBD.

    Returns measurable criteria for job completion.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("jtbd_success_criteria")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("jtbd_id", jtbd_id)\
            .eq("is_active", True)\
            .execute()

        return [SuccessCriteriaResponse(**c) for c in (result.data or [])]

    except Exception as e:
        logger.error(f"Error fetching success criteria: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{jtbd_id}/opportunity-score", response_model=OpportunityScoreResponse)
async def get_opportunity_score(jtbd_id: str):
    """
    Get ODI opportunity score for a JTBD.

    Returns the calculated opportunity score using the ODI formula:
    Opportunity = Importance + MAX(Importance - Satisfaction, 0)
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("jtbds")\
            .select("id, name, importance_score, satisfaction_score, opportunity_score")\
            .eq("id", jtbd_id)\
            .eq("tenant_id", tenant_id)\
            .maybe_single()\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail=f"JTBD {jtbd_id} not found")

        jtbd = result.data
        importance = jtbd.get("importance_score", 0)
        satisfaction = jtbd.get("satisfaction_score", 0)
        opportunity = calculate_opportunity_score(importance, satisfaction)

        return OpportunityScoreResponse(
            jtbd_id=jtbd["id"],
            jtbd_name=jtbd["name"],
            importance_score=importance,
            satisfaction_score=satisfaction,
            opportunity_score=opportunity,
            classification=classify_opportunity(opportunity)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating opportunity score: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-opportunities", response_model=List[JTBDResponse])
async def get_top_opportunities(
    function_id: Optional[str] = Query(None, description="Filter by function ID"),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get JTBDs with highest opportunity scores.

    Returns top opportunities ranked by ODI opportunity score.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("jtbds")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .order("opportunity_score", desc=True)\
            .limit(100)\
            .execute()

        jtbds = result.data or []

        # Filter by function if provided
        if function_id:
            jtbds = [j for j in jtbds if function_id in (j.get("function_ids") or [])]

        # Return top N
        return [JTBDResponse(**j) for j in jtbds[:limit]]

    except Exception as e:
        logger.error(f"Error fetching top opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resolve-context", response_model=JTBDContextResponse)
async def resolve_jtbd_context(request: JTBDContextRequest):
    """
    Resolve full JTBD context for a query.

    Returns relevant JTBDs, pain points, outcomes, and recommendations.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Find relevant JTBDs
        search_request = JTBDSearchRequest(
            query=request.query,
            role_id=request.role_id,
            function_id=request.function_id,
            limit=5
        )
        jtbds = await search_jtbds(search_request)

        if not jtbds:
            return JTBDContextResponse(
                relevant_jtbds=[],
                pain_points=[],
                desired_outcomes=[],
                success_criteria=[],
                top_opportunity_jtbd_id=None,
                max_opportunity_score=0,
                recommended_runner_family=None,
                avg_importance=0,
                avg_satisfaction=0,
                confidence_score=0
            )

        # Get pain points and outcomes for top JTBD
        top_jtbd = jtbds[0]
        pain_points = await get_pain_points(top_jtbd.id)
        outcomes = await get_desired_outcomes(top_jtbd.id)
        criteria = await get_success_criteria(top_jtbd.id)

        # Calculate aggregated scores
        avg_importance = sum(j.importance_score for j in jtbds) / len(jtbds)
        avg_satisfaction = sum(j.satisfaction_score for j in jtbds) / len(jtbds)

        # Calculate confidence
        confidence = 0.0
        if jtbds:
            confidence += 0.4
        if pain_points:
            confidence += 0.2
        if outcomes:
            confidence += 0.2
        if criteria:
            confidence += 0.2

        return JTBDContextResponse(
            relevant_jtbds=[j.model_dump() for j in jtbds],
            pain_points=[p.model_dump() for p in pain_points],
            desired_outcomes=[o.model_dump() for o in outcomes],
            success_criteria=[c.model_dump() for c in criteria],
            top_opportunity_jtbd_id=top_jtbd.id,
            max_opportunity_score=top_jtbd.opportunity_score,
            recommended_runner_family=top_jtbd.runner_family,
            avg_importance=avg_importance,
            avg_satisfaction=avg_satisfaction,
            confidence_score=confidence
        )

    except Exception as e:
        logger.error(f"Error resolving JTBD context: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def jtbd_health_check():
    """
    Health check for L3 JTBD service.

    Returns counts of JTBD entities.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Count entities
        jtbd_count = supabase.table("jtbds")\
            .select("id", count="exact")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .execute()

        pain_count = supabase.table("jtbd_pain_points")\
            .select("id", count="exact")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .execute()

        outcome_count = supabase.table("jtbd_desired_outcomes")\
            .select("id", count="exact")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .execute()

        return {
            "status": "healthy",
            "service": "l3_jtbd",
            "counts": {
                "jtbds": jtbd_count.count or 0,
                "pain_points": pain_count.count or 0,
                "desired_outcomes": outcome_count.count or 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"JTBD health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "l3_jtbd",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
