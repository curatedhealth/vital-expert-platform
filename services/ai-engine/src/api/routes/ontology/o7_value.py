# PRODUCTION_TAG: DEVELOPMENT
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [ontology.l7_value]
"""
L7 Value API Routes

Value Transformation operations including:
- VPANES opportunity scoring
- ROI estimation
- Value realization tracking
- Business value metrics

Endpoints:
- GET /v1/ontology/value/vpanes/{jtbd_id} - Get VPANES score
- POST /v1/ontology/value/vpanes - Create/update VPANES score
- GET /v1/ontology/value/opportunities - Get top opportunities
- GET /v1/ontology/value/roi/{jtbd_id} - Get ROI estimate
- POST /v1/ontology/value/roi - Create ROI estimate
- GET /v1/ontology/value/roi/summary - Get ROI summary
- POST /v1/ontology/value/realization - Record value realization
- GET /v1/ontology/value/realization/summary - Get value summary
- GET /v1/ontology/value/dashboard - Business value dashboard
"""

import logging
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/ontology/value", tags=["L7 Value"])


# ============== Request/Response Models ==============

class VPANESScoreResponse(BaseModel):
    """VPANES score response"""
    id: str
    jtbd_id: str
    value_score: float
    value_rationale: Optional[str] = None
    value_category: Optional[str] = None
    pain_score: float
    pain_rationale: Optional[str] = None
    adoption_score: float
    adoption_rationale: Optional[str] = None
    adoption_barriers: List[str] = []
    network_score: float
    network_rationale: Optional[str] = None
    impacted_functions: List[str] = []
    ease_score: float
    ease_rationale: Optional[str] = None
    implementation_complexity: str
    strategic_score: float
    strategic_rationale: Optional[str] = None
    strategic_priorities: List[str] = []
    intervention_type: str
    ai_suitability_score: float
    total_score: float
    normalized_score: float
    priority_classification: str


class VPANESCreateRequest(BaseModel):
    """VPANES score creation request"""
    jtbd_id: str
    value_score: float = Field(ge=0, le=10)
    value_rationale: Optional[str] = None
    value_category: Optional[str] = None
    pain_score: float = Field(ge=0, le=10)
    pain_rationale: Optional[str] = None
    adoption_score: float = Field(ge=0, le=10)
    adoption_rationale: Optional[str] = None
    network_score: float = Field(ge=0, le=10)
    network_rationale: Optional[str] = None
    ease_score: float = Field(ge=0, le=10)
    ease_rationale: Optional[str] = None
    strategic_score: float = Field(ge=0, le=10)
    strategic_rationale: Optional[str] = None
    intervention_type: str = "augmentation"
    ai_suitability_score: float = Field(default=5.0, ge=0, le=10)


class ROIEstimateResponse(BaseModel):
    """ROI estimate response"""
    id: str
    jtbd_id: Optional[str] = None
    workflow_id: Optional[str] = None
    time_saved_hours_per_week: float
    time_saved_annual_hours: float
    fte_equivalent: float
    hourly_rate: float
    annual_labor_savings: float
    other_cost_savings: float
    total_annual_savings: float
    error_reduction_percent: float
    quality_improvement_percent: float
    compliance_improvement_percent: float
    implementation_cost: float
    annual_operating_cost: float
    training_cost: float
    total_investment: float
    net_annual_benefit: float
    roi_percent: float
    payback_months: float
    npv_3_year: float
    confidence_level: str
    assumptions: List[str] = []


class ROICreateRequest(BaseModel):
    """ROI estimate creation request"""
    jtbd_id: Optional[str] = None
    workflow_id: Optional[str] = None
    time_saved_hours_per_week: float = Field(ge=0)
    hourly_rate: float = Field(default=150.0, ge=0)
    implementation_cost: float = Field(default=0.0, ge=0)
    annual_operating_cost: float = Field(default=0.0, ge=0)
    training_cost: float = Field(default=0.0, ge=0)
    other_cost_savings: float = Field(default=0.0, ge=0)
    error_reduction_percent: float = Field(default=0.0, ge=0, le=100)
    quality_improvement_percent: float = Field(default=0.0, ge=0, le=100)
    compliance_improvement_percent: float = Field(default=0.0, ge=0, le=100)
    assumptions: List[str] = []
    confidence_level: str = "medium"


class ValueRealizationRequest(BaseModel):
    """Value realization recording request"""
    jtbd_id: str
    mission_id: Optional[str] = None
    estimated_time_saved_minutes: float = 0.0
    actual_time_saved_minutes: float = 0.0
    estimated_quality_improvement: float = 0.0
    actual_quality_improvement: float = 0.0
    user_satisfaction: float = Field(ge=0, le=10)
    would_recommend: bool = False
    user_feedback: Optional[str] = None
    value_categories: List[str] = []


class ValueRealizationResponse(BaseModel):
    """Value realization response"""
    id: str
    jtbd_id: str
    mission_id: Optional[str] = None
    estimated_time_saved_minutes: float
    actual_time_saved_minutes: float
    time_variance_percent: float
    estimated_quality_improvement: float
    actual_quality_improvement: float
    quality_variance_percent: float
    user_satisfaction: float
    would_recommend: bool
    user_feedback: Optional[str] = None
    value_score: float
    value_categories: List[str] = []
    created_at: str


class ROISummaryResponse(BaseModel):
    """ROI summary response"""
    total_estimates: int
    total_annual_savings: float
    total_investment: float
    avg_roi_percent: float
    avg_payback_months: float
    total_fte_equivalent: float
    total_npv_3_year: float


class ValueSummaryResponse(BaseModel):
    """Value summary response"""
    period_days: int
    total_realizations: int
    total_time_saved_minutes: float
    total_time_saved_hours: float
    avg_satisfaction: float
    avg_value_score: float
    recommendation_rate: float
    value_by_category: dict


class DashboardResponse(BaseModel):
    """Business value dashboard response"""
    top_opportunities: List[dict]
    roi_summary: dict
    value_summary: dict
    by_category: dict
    generated_at: str


# ============== Helper Functions ==============

def get_tenant_id() -> str:
    """Get tenant ID - in production, extract from auth token."""
    return "550e8400-e29b-41d4-a716-446655440000"


def calculate_vpanes_total(scores: dict) -> float:
    """Calculate total VPANES score (0-60)."""
    return (
        scores.get("value_score", 0) +
        scores.get("pain_score", 0) +
        scores.get("adoption_score", 0) +
        scores.get("network_score", 0) +
        scores.get("ease_score", 0) +
        scores.get("strategic_score", 0)
    )


def classify_vpanes(normalized_score: float) -> str:
    """Classify VPANES priority."""
    if normalized_score >= 75:
        return "high_priority"
    elif normalized_score >= 50:
        return "medium_priority"
    else:
        return "low_priority"


# ============== VPANES Endpoints ==============

@router.get("/vpanes/{jtbd_id}", response_model=VPANESScoreResponse)
async def get_vpanes_score(jtbd_id: str):
    """
    Get VPANES score for a JTBD.

    Returns the 6-dimension VPANES opportunity assessment:
    - Value (0-10): Business value potential
    - Pain (0-10): Current pain severity
    - Adoption (0-10): Likelihood of adoption
    - Network (0-10): Cross-functional impact
    - Ease (0-10): Implementation ease
    - Strategic (0-10): Strategic alignment
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("vpanes_scores")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("jtbd_id", jtbd_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .maybe_single()\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail=f"VPANES score for JTBD {jtbd_id} not found")

        score = result.data
        total = calculate_vpanes_total(score)
        normalized = (total / 60) * 100

        return VPANESScoreResponse(
            **score,
            total_score=total,
            normalized_score=normalized,
            priority_classification=classify_vpanes(normalized)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching VPANES score: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vpanes", response_model=VPANESScoreResponse)
async def create_vpanes_score(request: VPANESCreateRequest):
    """
    Create or update VPANES score for a JTBD.

    Each dimension is scored 0-10, total 0-60, normalized to 0-100.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        score_data = {
            "tenant_id": tenant_id,
            "jtbd_id": request.jtbd_id,
            "value_score": request.value_score,
            "value_rationale": request.value_rationale,
            "value_category": request.value_category,
            "pain_score": request.pain_score,
            "pain_rationale": request.pain_rationale,
            "adoption_score": request.adoption_score,
            "adoption_rationale": request.adoption_rationale,
            "network_score": request.network_score,
            "network_rationale": request.network_rationale,
            "ease_score": request.ease_score,
            "ease_rationale": request.ease_rationale,
            "strategic_score": request.strategic_score,
            "strategic_rationale": request.strategic_rationale,
            "intervention_type": request.intervention_type,
            "ai_suitability_score": request.ai_suitability_score,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("vpanes_scores")\
            .upsert(score_data, on_conflict="tenant_id,jtbd_id")\
            .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create VPANES score")

        score = result.data[0]
        total = calculate_vpanes_total(score)
        normalized = (total / 60) * 100

        return VPANESScoreResponse(
            **score,
            total_score=total,
            normalized_score=normalized,
            priority_classification=classify_vpanes(normalized)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating VPANES score: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/opportunities", response_model=List[VPANESScoreResponse])
async def get_top_opportunities(
    value_category: Optional[str] = Query(None, description="Filter by value category"),
    min_score: float = Query(0.0, ge=0, le=100),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get top VPANES opportunities.

    Returns opportunities ranked by normalized VPANES score.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        query = supabase.table("vpanes_scores")\
            .select("*")\
            .eq("tenant_id", tenant_id)

        if value_category:
            query = query.eq("value_category", value_category)

        result = query.execute()
        scores = result.data or []

        # Calculate totals and filter
        enriched = []
        for score in scores:
            total = calculate_vpanes_total(score)
            normalized = (total / 60) * 100
            if normalized >= min_score:
                enriched.append({
                    **score,
                    "total_score": total,
                    "normalized_score": normalized,
                    "priority_classification": classify_vpanes(normalized)
                })

        # Sort by normalized score
        enriched.sort(key=lambda x: x["normalized_score"], reverse=True)

        return [VPANESScoreResponse(**s) for s in enriched[:limit]]

    except Exception as e:
        logger.error(f"Error fetching opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== ROI Endpoints ==============

@router.get("/roi/{jtbd_id}", response_model=ROIEstimateResponse)
async def get_roi_estimate(jtbd_id: str):
    """
    Get ROI estimate for a JTBD.

    Returns ROI calculations including time savings, cost savings,
    and investment metrics.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("roi_estimates")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("jtbd_id", jtbd_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .maybe_single()\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail=f"ROI estimate for JTBD {jtbd_id} not found")

        return ROIEstimateResponse(**result.data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching ROI estimate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/roi", response_model=ROIEstimateResponse)
async def create_roi_estimate(request: ROICreateRequest):
    """
    Create ROI estimate with calculated metrics.

    Calculates:
    - Annual time/cost savings
    - FTE equivalent
    - ROI percentage
    - Payback period
    - 3-year NPV (10% discount rate)
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Calculate derived metrics
        time_saved_annual_hours = request.time_saved_hours_per_week * 52
        fte_equivalent = time_saved_annual_hours / 2080
        annual_labor_savings = time_saved_annual_hours * request.hourly_rate
        total_annual_savings = annual_labor_savings + request.other_cost_savings
        total_investment = request.implementation_cost + request.training_cost
        net_annual_benefit = total_annual_savings - request.annual_operating_cost

        roi_percent = 0.0
        payback_months = 0.0
        if total_investment > 0:
            roi_percent = ((net_annual_benefit - total_investment) / total_investment) * 100
            monthly_benefit = net_annual_benefit / 12
            if monthly_benefit > 0:
                payback_months = total_investment / monthly_benefit

        # NPV calculation (10% discount rate)
        discount_rate = 0.10
        npv_3_year = sum(
            net_annual_benefit / ((1 + discount_rate) ** year)
            for year in range(1, 4)
        ) - total_investment

        roi_data = {
            "tenant_id": tenant_id,
            "jtbd_id": request.jtbd_id,
            "workflow_id": request.workflow_id,
            "time_saved_hours_per_week": request.time_saved_hours_per_week,
            "time_saved_annual_hours": time_saved_annual_hours,
            "fte_equivalent": fte_equivalent,
            "hourly_rate": request.hourly_rate,
            "annual_labor_savings": annual_labor_savings,
            "other_cost_savings": request.other_cost_savings,
            "total_annual_savings": total_annual_savings,
            "error_reduction_percent": request.error_reduction_percent,
            "quality_improvement_percent": request.quality_improvement_percent,
            "compliance_improvement_percent": request.compliance_improvement_percent,
            "implementation_cost": request.implementation_cost,
            "annual_operating_cost": request.annual_operating_cost,
            "training_cost": request.training_cost,
            "total_investment": total_investment,
            "net_annual_benefit": net_annual_benefit,
            "roi_percent": roi_percent,
            "payback_months": payback_months,
            "npv_3_year": npv_3_year,
            "confidence_level": request.confidence_level,
            "assumptions": request.assumptions,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("roi_estimates")\
            .insert(roi_data)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create ROI estimate")

        return ROIEstimateResponse(**result.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating ROI estimate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/roi/summary", response_model=ROISummaryResponse)
async def get_roi_summary():
    """
    Get aggregated ROI summary for all estimates.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        result = supabase.table("roi_estimates")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .execute()

        estimates = result.data or []

        if not estimates:
            return ROISummaryResponse(
                total_estimates=0,
                total_annual_savings=0,
                total_investment=0,
                avg_roi_percent=0,
                avg_payback_months=0,
                total_fte_equivalent=0,
                total_npv_3_year=0
            )

        return ROISummaryResponse(
            total_estimates=len(estimates),
            total_annual_savings=sum(e.get("total_annual_savings", 0) for e in estimates),
            total_investment=sum(e.get("total_investment", 0) for e in estimates),
            avg_roi_percent=sum(e.get("roi_percent", 0) for e in estimates) / len(estimates),
            avg_payback_months=sum(e.get("payback_months", 0) for e in estimates) / len(estimates),
            total_fte_equivalent=sum(e.get("fte_equivalent", 0) for e in estimates),
            total_npv_3_year=sum(e.get("npv_3_year", 0) for e in estimates)
        )

    except Exception as e:
        logger.error(f"Error getting ROI summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== Value Realization Endpoints ==============

@router.post("/realization", response_model=ValueRealizationResponse)
async def record_value_realization(request: ValueRealizationRequest):
    """
    Record actual value realized from an AI interaction.

    Tracks estimated vs actual outcomes to build evidence base.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Calculate variances
        time_variance = 0.0
        if request.estimated_time_saved_minutes > 0:
            time_variance = ((request.actual_time_saved_minutes - request.estimated_time_saved_minutes) / request.estimated_time_saved_minutes) * 100

        quality_variance = 0.0
        if request.estimated_quality_improvement > 0:
            quality_variance = ((request.actual_quality_improvement - request.estimated_quality_improvement) / request.estimated_quality_improvement) * 100

        # Calculate value score
        value_score = (
            (request.user_satisfaction / 10) * 0.4 +
            min(request.actual_time_saved_minutes / 30, 1.0) * 0.3 +
            request.actual_quality_improvement * 0.2 +
            (1.0 if request.would_recommend else 0.0) * 0.1
        ) * 10

        realization_data = {
            "tenant_id": tenant_id,
            "jtbd_id": request.jtbd_id,
            "mission_id": request.mission_id,
            "estimated_time_saved_minutes": request.estimated_time_saved_minutes,
            "actual_time_saved_minutes": request.actual_time_saved_minutes,
            "time_variance_percent": time_variance,
            "estimated_quality_improvement": request.estimated_quality_improvement,
            "actual_quality_improvement": request.actual_quality_improvement,
            "quality_variance_percent": quality_variance,
            "user_satisfaction": request.user_satisfaction,
            "would_recommend": request.would_recommend,
            "user_feedback": request.user_feedback,
            "value_score": value_score,
            "value_categories": request.value_categories,
            "created_at": datetime.utcnow().isoformat(),
            "measured_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("value_realizations")\
            .insert(realization_data)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to record value realization")

        return ValueRealizationResponse(**result.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording value realization: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/realization/summary", response_model=ValueSummaryResponse)
async def get_value_summary(days: int = Query(30, ge=1, le=365)):
    """
    Get aggregated value realization summary.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        since = (datetime.utcnow() - timedelta(days=days)).isoformat()

        result = supabase.table("value_realizations")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .gte("created_at", since)\
            .execute()

        realizations = result.data or []

        if not realizations:
            return ValueSummaryResponse(
                period_days=days,
                total_realizations=0,
                total_time_saved_minutes=0,
                total_time_saved_hours=0,
                avg_satisfaction=0,
                avg_value_score=0,
                recommendation_rate=0,
                value_by_category={}
            )

        total_time = sum(r.get("actual_time_saved_minutes", 0) for r in realizations)
        avg_satisfaction = sum(r.get("user_satisfaction", 0) for r in realizations) / len(realizations)
        avg_value = sum(r.get("value_score", 0) for r in realizations) / len(realizations)
        recommend_count = sum(1 for r in realizations if r.get("would_recommend"))

        # Value by category
        category_counts = {}
        for r in realizations:
            for cat in r.get("value_categories", []):
                category_counts[cat] = category_counts.get(cat, 0) + 1

        return ValueSummaryResponse(
            period_days=days,
            total_realizations=len(realizations),
            total_time_saved_minutes=total_time,
            total_time_saved_hours=total_time / 60,
            avg_satisfaction=avg_satisfaction,
            avg_value_score=avg_value,
            recommendation_rate=recommend_count / len(realizations),
            value_by_category=category_counts
        )

    except Exception as e:
        logger.error(f"Error getting value summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== Dashboard Endpoint ==============

@router.get("/dashboard", response_model=DashboardResponse)
async def get_business_value_dashboard():
    """
    Get comprehensive business value dashboard.

    Aggregates VPANES opportunities, ROI estimates, and value realizations.
    """
    try:
        # Get top opportunities
        opportunities = await get_top_opportunities(limit=10)

        # Get ROI summary
        roi_summary = await get_roi_summary()

        # Get value summary
        value_summary = await get_value_summary(days=30)

        # Get breakdown by value category
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        categories = ["smarter", "faster", "better", "efficient", "safer", "scalable"]
        by_category = {}

        for category in categories:
            result = supabase.table("vpanes_scores")\
                .select("*")\
                .eq("tenant_id", tenant_id)\
                .eq("value_category", category)\
                .execute()

            scores = result.data or []
            if scores:
                avg_score = sum(
                    (calculate_vpanes_total(s) / 60) * 100
                    for s in scores
                ) / len(scores)
                by_category[category] = {
                    "count": len(scores),
                    "avg_score": avg_score,
                    "top_jtbd_ids": [s.get("jtbd_id") for s in scores[:3]]
                }

        return DashboardResponse(
            top_opportunities=[o.model_dump() for o in opportunities],
            roi_summary=roi_summary.model_dump(),
            value_summary=value_summary.model_dump(),
            by_category=by_category,
            generated_at=datetime.utcnow().isoformat()
        )

    except Exception as e:
        logger.error(f"Error getting business value dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def value_health_check():
    """
    Health check for L7 Value service.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        vpanes_count = supabase.table("vpanes_scores")\
            .select("id", count="exact")\
            .eq("tenant_id", tenant_id)\
            .execute()

        roi_count = supabase.table("roi_estimates")\
            .select("id", count="exact")\
            .eq("tenant_id", tenant_id)\
            .execute()

        realization_count = supabase.table("value_realizations")\
            .select("id", count="exact")\
            .eq("tenant_id", tenant_id)\
            .execute()

        return {
            "status": "healthy",
            "service": "l7_value",
            "counts": {
                "vpanes_scores": vpanes_count.count or 0,
                "roi_estimates": roi_count.count or 0,
                "value_realizations": realization_count.count or 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Value health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "l7_value",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
