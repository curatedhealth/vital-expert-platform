"""
Value Framework API Routes
REST API endpoints for ROI calculation and value insights

Endpoints:
- GET /v1/value/dashboard - Value dashboard with aggregated metrics
- GET /v1/value/jtbd/{jtbd_id}/roi - Calculate ROI for a JTBD
- GET /v1/value/role/{role_id}/roi - Calculate aggregated ROI for a role
- GET /v1/value/categories - List all value categories
- GET /v1/value/categories/{code}/insights - Get category insights
- GET /v1/value/drivers - List all value drivers
- GET /v1/value/drivers/{code}/insights - Get driver insights
"""

import logging
from typing import Optional
from uuid import UUID
from datetime import datetime
from dataclasses import asdict

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field

from services.roi_calculator_service import (
    get_roi_calculator,
    ROICalculation,
    ValueDashboard
)
from services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/value", tags=["Value Framework"])


# ============== Response Models ==============

class CategoryResponse(BaseModel):
    """Value category response"""
    id: str
    name: str
    code: str
    description: Optional[str] = None


class DriverResponse(BaseModel):
    """Value driver response"""
    id: str
    name: str
    code: str
    driver_type: str


class ROIResponse(BaseModel):
    """ROI calculation response"""
    entity_id: str
    entity_type: str
    entity_name: str
    total_value_score: float
    primary_category: str
    category_breakdown: dict
    driver_breakdown: dict
    impact_summary: dict
    estimated_hours_saved_per_month: float
    estimated_cost_savings_per_year: float
    confidence_level: str
    data_completeness: float


class DashboardResponse(BaseModel):
    """Value dashboard response"""
    tenant_id: str
    tenant_name: str
    total_jtbds: int
    jtbds_with_value_mapping: int
    coverage_percentage: float
    category_distribution: dict
    primary_category_counts: dict
    driver_distribution: dict
    top_drivers: list
    function_value_scores: list
    total_time_savings_potential: float
    total_cost_savings_potential: float
    generated_at: str


class InsightsResponse(BaseModel):
    """Category/Driver insights response"""
    category: Optional[dict] = None
    driver: Optional[dict] = None
    metrics: dict
    top_jtbds: Optional[list] = None
    confidence_distribution: Optional[dict] = None
    distribution: Optional[dict] = None


# ============== API Endpoints ==============

@router.get("/dashboard", response_model=DashboardResponse)
async def get_value_dashboard(
    tenant_id: Optional[str] = Query(None, description="Tenant ID filter")
):
    """
    Get value dashboard with aggregated metrics

    Returns enterprise-wide value metrics including:
    - JTBD coverage statistics
    - Value category distribution
    - Value driver distribution
    - Top value drivers
    - Estimated savings potential
    """
    try:
        calculator = get_roi_calculator()
        tenant_uuid = UUID(tenant_id) if tenant_id else None
        dashboard = await calculator.get_value_dashboard(tenant_uuid)

        return DashboardResponse(
            tenant_id=str(dashboard.tenant_id),
            tenant_name=dashboard.tenant_name,
            total_jtbds=dashboard.total_jtbds,
            jtbds_with_value_mapping=dashboard.jtbds_with_value_mapping,
            coverage_percentage=dashboard.coverage_percentage,
            category_distribution=dashboard.category_distribution,
            primary_category_counts=dashboard.primary_category_counts,
            driver_distribution=dashboard.driver_distribution,
            top_drivers=dashboard.top_drivers,
            function_value_scores=dashboard.function_value_scores,
            total_time_savings_potential=dashboard.total_time_savings_potential,
            total_cost_savings_potential=dashboard.total_cost_savings_potential,
            generated_at=dashboard.generated_at.isoformat()
        )

    except Exception as e:
        logger.error(f"Error fetching value dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jtbd/{jtbd_id}/roi", response_model=ROIResponse)
async def get_jtbd_roi(jtbd_id: str):
    """
    Calculate ROI for a specific JTBD

    Returns:
    - Total value score (0-100)
    - Primary value category
    - Category and driver breakdowns
    - Estimated time and cost savings
    - Confidence level based on data completeness
    """
    try:
        calculator = get_roi_calculator()
        roi = await calculator.calculate_jtbd_roi(UUID(jtbd_id))

        if not roi:
            raise HTTPException(status_code=404, detail=f"JTBD {jtbd_id} not found")

        return ROIResponse(
            entity_id=str(roi.entity_id),
            entity_type=roi.entity_type,
            entity_name=roi.entity_name,
            total_value_score=roi.total_value_score,
            primary_category=roi.primary_category,
            category_breakdown=roi.category_breakdown,
            driver_breakdown=roi.driver_breakdown,
            impact_summary=roi.impact_summary,
            estimated_hours_saved_per_month=roi.estimated_hours_saved_per_month,
            estimated_cost_savings_per_year=roi.estimated_cost_savings_per_year,
            confidence_level=roi.confidence_level,
            data_completeness=roi.data_completeness
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating JTBD ROI: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/role/{role_id}/roi", response_model=ROIResponse)
async def get_role_roi(role_id: str):
    """
    Calculate aggregated ROI for a role

    Aggregates value metrics across all JTBDs assigned to the role.

    Returns:
    - Total value score (0-100)
    - Primary value category
    - Aggregated category and driver breakdowns
    - Estimated time and cost savings for the role
    """
    try:
        calculator = get_roi_calculator()
        roi = await calculator.calculate_role_roi(UUID(role_id))

        if not roi:
            raise HTTPException(status_code=404, detail=f"Role {role_id} not found")

        return ROIResponse(
            entity_id=str(roi.entity_id),
            entity_type=roi.entity_type,
            entity_name=roi.entity_name,
            total_value_score=roi.total_value_score,
            primary_category=roi.primary_category,
            category_breakdown=roi.category_breakdown,
            driver_breakdown=roi.driver_breakdown,
            impact_summary=roi.impact_summary,
            estimated_hours_saved_per_month=roi.estimated_hours_saved_per_month,
            estimated_cost_savings_per_year=roi.estimated_cost_savings_per_year,
            confidence_level=roi.confidence_level,
            data_completeness=roi.data_completeness
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating role ROI: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories", response_model=list[CategoryResponse])
async def list_value_categories():
    """
    List all value categories

    Returns the 6 universal value categories:
    - SMARTER: Enhanced decision-making
    - FASTER: Improved speed and efficiency
    - BETTER: Higher quality outcomes
    - EFFICIENT: Optimized resources
    - SAFER: Reduced risk
    - SCALABLE: Growth capability
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table("value_categories").select(
            "id, name, code, description"
        ).order("name").execute()

        return [CategoryResponse(**cat) for cat in (response.data or [])]

    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/{code}/insights")
async def get_category_insights(code: str):
    """
    Get detailed insights for a value category

    Returns:
    - Category details
    - Mapping metrics (total, primary, avg relevance)
    - Top JTBDs mapped to this category
    - Distribution analysis
    """
    try:
        calculator = get_roi_calculator()
        insights = await calculator.get_category_insights(code.upper())

        if "error" in insights:
            raise HTTPException(status_code=404, detail=insights["error"])

        return insights

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching category insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/drivers", response_model=list[DriverResponse])
async def list_value_drivers():
    """
    List all value drivers

    Returns 13 value drivers:
    - 7 Internal: Cost Reduction, Decision Quality, Employee Experience,
      Knowledge Management, Operational Efficiency, Regulatory Compliance,
      Scientific Quality
    - 6 External: Brand Reputation, Competitive Advantage, HCP Experience,
      Market Access, Patient Impact, Stakeholder Trust
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table("value_drivers").select(
            "id, name, code, driver_type"
        ).order("driver_type,name").execute()

        return [DriverResponse(**drv) for drv in (response.data or [])]

    except Exception as e:
        logger.error(f"Error fetching drivers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/drivers/{code}/insights")
async def get_driver_insights(code: str):
    """
    Get detailed insights for a value driver

    Returns:
    - Driver details
    - Mapping metrics (total, avg impact, high confidence count)
    - Confidence level distribution
    """
    try:
        calculator = get_roi_calculator()
        insights = await calculator.get_driver_insights(code.upper())

        if "error" in insights:
            raise HTTPException(status_code=404, detail=insights["error"])

        return insights

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching driver insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def value_health_check():
    """
    Health check for Value Framework service

    Returns counts of value entities and mappings.
    """
    try:
        supabase = get_supabase_client()

        # Count entities
        cat_count = supabase.table("value_categories").select("id", count="exact").execute()
        drv_count = supabase.table("value_drivers").select("id", count="exact").execute()
        cat_map_count = supabase.table("jtbd_value_categories").select("id", count="exact").execute()
        drv_map_count = supabase.table("jtbd_value_drivers").select("id", count="exact").execute()

        return {
            "status": "healthy",
            "service": "value_framework",
            "counts": {
                "value_categories": cat_count.count or 0,
                "value_drivers": drv_count.count or 0,
                "jtbd_category_mappings": cat_map_count.count or 0,
                "jtbd_driver_mappings": drv_map_count.count or 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Value health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "value_framework",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
