"""
VITAL API - Extended Ontology Endpoints
========================================
REST endpoints for extended ontology data:
- JTBDs (Jobs To Be Done)
- Value Drivers & Categories
- Workflows
- AI Opportunities
- Effective Views (pre-joined data)

These endpoints leverage the v_effective_* views for optimized queries.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from enum import Enum
import requests

router = APIRouter()

# =============================================================================
# CONFIGURATION - Load from environment variables (NEVER hardcode credentials)
# =============================================================================
import os

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}


# =============================================================================
# ENUMS
# =============================================================================

class JobCategory(str, Enum):
    OPERATIONAL = "operational"
    STRATEGIC = "strategic"
    ANALYTICAL = "analytical"
    TECHNICAL = "technical"


class Complexity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ODITier(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    PROMISING = "promising"
    HIGH = "high"
    EXTREME = "extreme"


# =============================================================================
# MODELS - JTBD
# =============================================================================

class JTBDResponse(BaseModel):
    id: str
    code: str
    name: str
    job_statement: Optional[str] = None
    job_category: Optional[str] = None
    complexity: Optional[str] = None
    frequency: Optional[str] = None
    status: Optional[str] = None
    importance_score: Optional[float] = None
    satisfaction_score: Optional[float] = None
    opportunity_score: Optional[float] = None
    odi_tier: Optional[str] = None


class JTBDHierarchyResponse(BaseModel):
    jtbd_id: str
    jtbd_code: str
    jtbd_name: str
    job_statement: Optional[str] = None
    job_category: Optional[str] = None
    complexity: Optional[str] = None
    function_name: Optional[str] = None
    department_name: Optional[str] = None
    role_name: Optional[str] = None
    opportunity_score: Optional[float] = None
    role_count: Optional[int] = None
    value_category_count: Optional[int] = None


class JTBDAIResponse(BaseModel):
    jtbd_id: str
    jtbd_code: str
    jtbd_name: str
    job_category: Optional[str] = None
    overall_ai_readiness: Optional[float] = None
    automation_score: Optional[float] = None
    ai_intervention_type: Optional[str] = None
    opportunity_score: Optional[float] = None
    calculated_ai_opportunity: Optional[float] = None


# =============================================================================
# MODELS - VALUE DRIVERS
# =============================================================================

class ValueCategoryResponse(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    color: Optional[str] = None


class ValueDriverResponse(BaseModel):
    id: str
    code: str
    name: str
    driver_type: Optional[str] = None
    description: Optional[str] = None
    value_category: Optional[str] = None
    is_active: bool = True
    is_quantifiable: bool = True


class ValueDriverHierarchyResponse(BaseModel):
    id: str
    code: Optional[str] = None
    name: str
    driver_type: Optional[str] = None
    depth: int
    hierarchy_path: str
    child_count: int
    jtbd_count: int
    category_name: Optional[str] = None
    category_color: Optional[str] = None


class ValueImpactResponse(BaseModel):
    driver_id: str
    driver_code: Optional[str] = None
    driver_name: str
    driver_type: Optional[str] = None
    jtbd_count: int
    avg_impact_strength: Optional[float] = None
    total_quantified_value: Optional[float] = None
    category_name: Optional[str] = None


# =============================================================================
# MODELS - WORKFLOWS
# =============================================================================

class WorkflowResponse(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    workflow_type: Optional[str] = None
    complexity_level: Optional[str] = None
    status: Optional[str] = None
    estimated_duration_hours: Optional[float] = None


class WorkflowCompleteResponse(BaseModel):
    workflow_id: str
    workflow_code: str
    workflow_name: str
    workflow_type: Optional[str] = None
    complexity_level: Optional[str] = None
    status: Optional[str] = None
    stage_count: int
    stage_names: Optional[List[str]] = None
    total_task_count: int
    jtbd_name: Optional[str] = None


# =============================================================================
# MODELS - AI OPPORTUNITIES
# =============================================================================

class AIOpportunityResponse(BaseModel):
    jtbd_id: str
    jtbd_code: str
    jtbd_name: str
    job_category: Optional[str] = None
    complexity: Optional[str] = None
    opportunity_score: Optional[float] = None
    overall_ai_readiness: Optional[float] = None
    recommended_intervention: Optional[str] = None
    priority_score: Optional[float] = None
    function_name: Optional[str] = None
    role_name: Optional[str] = None


# =============================================================================
# MODELS - SUMMARY
# =============================================================================

class OntologySummaryResponse(BaseModel):
    entity_type: str
    total_count: int
    active_count: int
    mapped_count: int
    unmapped_count: int


# =============================================================================
# JTBD ENDPOINTS
# =============================================================================

@router.get("/jtbd", response_model=List[JTBDResponse])
async def list_jtbds(
    job_category: Optional[JobCategory] = Query(None),
    complexity: Optional[Complexity] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0)
):
    """
    List all JTBDs with optional filters.

    Use this for basic JTBD listing without hierarchy context.
    """
    url = f"{SUPABASE_URL}/rest/v1/jtbd?select=*&limit={limit}&offset={offset}&order=code"

    if job_category:
        url += f"&job_category=eq.{job_category.value}"
    if complexity:
        url += f"&complexity=eq.{complexity.value}"
    if status:
        url += f"&status=eq.{status}"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/jtbd/{jtbd_id}", response_model=JTBDResponse)
async def get_jtbd(jtbd_id: str):
    """Get a single JTBD by ID."""
    url = f"{SUPABASE_URL}/rest/v1/jtbd?id=eq.{jtbd_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    if not data:
        raise HTTPException(status_code=404, detail="JTBD not found")

    return data[0]


@router.get("/jtbd-hierarchy", response_model=List[JTBDHierarchyResponse])
async def list_jtbd_hierarchy(
    function_name: Optional[str] = Query(None, description="Filter by function name"),
    department_name: Optional[str] = Query(None),
    job_category: Optional[JobCategory] = Query(None),
    limit: int = Query(100, le=500)
):
    """
    List JTBDs with organizational hierarchy context.

    Uses v_effective_jtbd_hierarchy view for pre-joined data.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_jtbd_hierarchy?select=*&limit={limit}"

    if function_name:
        url += f"&function_name=ilike.*{function_name}*"
    if department_name:
        url += f"&department_name=ilike.*{department_name}*"
    if job_category:
        url += f"&job_category=eq.{job_category.value}"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/jtbd-ai", response_model=List[JTBDAIResponse])
async def list_jtbd_ai_suitability(
    min_ai_readiness: Optional[float] = Query(None, ge=0, le=1),
    ai_intervention_type: Optional[str] = Query(None),
    limit: int = Query(100, le=500)
):
    """
    List JTBDs with AI suitability scores.

    Uses v_effective_jtbd_ai view.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_jtbd_ai?select=*&limit={limit}&order=calculated_ai_opportunity.desc.nullslast"

    if min_ai_readiness is not None:
        url += f"&overall_ai_readiness=gte.{min_ai_readiness}"
    if ai_intervention_type:
        url += f"&ai_intervention_type=eq.{ai_intervention_type}"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


# =============================================================================
# VALUE DRIVER ENDPOINTS
# =============================================================================

@router.get("/value-categories", response_model=List[ValueCategoryResponse])
async def list_value_categories():
    """List all value categories (Smarter, Faster, Better, etc.)."""
    url = f"{SUPABASE_URL}/rest/v1/value_categories?select=*&order=sort_order"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/value-drivers", response_model=List[ValueDriverResponse])
async def list_value_drivers(
    driver_type: Optional[str] = Query(None, description="internal or external"),
    value_category: Optional[str] = Query(None),
    is_active: bool = Query(True),
    limit: int = Query(100, le=500)
):
    """List all value drivers with optional filters."""
    url = f"{SUPABASE_URL}/rest/v1/value_drivers?select=*&is_active=eq.{str(is_active).lower()}&limit={limit}&order=name"

    if driver_type:
        url += f"&driver_type=eq.{driver_type}"
    if value_category:
        url += f"&value_category=ilike.*{value_category}*"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/value-drivers/hierarchy", response_model=List[ValueDriverHierarchyResponse])
async def list_value_driver_hierarchy(
    max_depth: int = Query(10, description="Maximum hierarchy depth"),
    category_name: Optional[str] = Query(None)
):
    """
    List value drivers with parent/child hierarchy.

    Uses v_effective_value_driver_hierarchy view with recursive CTE.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_value_driver_hierarchy?select=*&depth=lte.{max_depth}&order=hierarchy_path"

    if category_name:
        url += f"&category_name=ilike.*{category_name}*"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/value-drivers/impact", response_model=List[ValueImpactResponse])
async def list_value_impact(
    min_jtbd_count: int = Query(0, description="Minimum JTBD coverage"),
    limit: int = Query(50, le=200)
):
    """
    List value drivers with aggregated impact metrics.

    Uses v_effective_value_impact view.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_value_impact?select=*&jtbd_count=gte.{min_jtbd_count}&limit={limit}&order=jtbd_count.desc"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


# =============================================================================
# WORKFLOW ENDPOINTS
# =============================================================================

@router.get("/workflows", response_model=List[WorkflowResponse])
async def list_workflows(
    workflow_type: Optional[str] = Query(None),
    complexity_level: Optional[Complexity] = Query(None),
    status: Optional[str] = Query(None, description="active, draft, archived"),
    limit: int = Query(50, le=200)
):
    """List all workflow templates with optional filters."""
    url = f"{SUPABASE_URL}/rest/v1/workflow_templates?select=*&limit={limit}&order=name"

    if workflow_type:
        url += f"&workflow_type=eq.{workflow_type}"
    if complexity_level:
        url += f"&complexity_level=eq.{complexity_level.value}"
    if status:
        url += f"&status=eq.{status}"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: str):
    """Get a single workflow by ID."""
    url = f"{SUPABASE_URL}/rest/v1/workflow_templates?id=eq.{workflow_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    if not data:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return data[0]


@router.get("/workflows-complete", response_model=List[WorkflowCompleteResponse])
async def list_workflows_complete(
    complexity_level: Optional[Complexity] = Query(None),
    status: str = Query("active"),
    limit: int = Query(50, le=200)
):
    """
    List workflows with stage and task aggregations.

    Uses v_effective_workflow_complete view.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_workflow_complete?select=*&status=eq.{status}&limit={limit}&order=workflow_name"

    if complexity_level:
        url += f"&complexity_level=eq.{complexity_level.value}"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


# =============================================================================
# AI OPPORTUNITY ENDPOINTS
# =============================================================================

@router.get("/ai-opportunities", response_model=List[AIOpportunityResponse])
async def list_ai_opportunities(
    min_priority_score: Optional[float] = Query(None, description="Minimum priority score (0-100)"),
    recommended_intervention: Optional[str] = Query(None, description="automation, augmentation, redesign"),
    function_name: Optional[str] = Query(None),
    limit: int = Query(50, le=200)
):
    """
    List AI opportunities ranked by priority score.

    Uses v_effective_ai_opportunity view which combines:
    - ODI opportunity scores
    - AI readiness scores
    - Impact level

    Returns highest priority opportunities first.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_ai_opportunity?select=*&limit={limit}&order=priority_score.desc.nullslast"

    if min_priority_score is not None:
        url += f"&priority_score=gte.{min_priority_score}"
    if recommended_intervention:
        url += f"&recommended_intervention=eq.{recommended_intervention}"
    if function_name:
        url += f"&function_name=ilike.*{function_name}*"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/ai-opportunities/by-function")
async def get_ai_opportunities_by_function():
    """
    Get AI opportunities grouped by function.

    Returns aggregated counts and average scores per function.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_ai_opportunity?select=function_name,priority_score,overall_ai_readiness,recommended_intervention"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()

    # Group by function
    grouped: Dict[str, Dict[str, Any]] = {}
    for item in data:
        fn = item.get("function_name") or "Unknown"
        if fn not in grouped:
            grouped[fn] = {
                "function_name": fn,
                "opportunity_count": 0,
                "total_priority_score": 0,
                "total_ai_readiness": 0,
                "interventions": {}
            }

        grouped[fn]["opportunity_count"] += 1
        if item.get("priority_score"):
            grouped[fn]["total_priority_score"] += item["priority_score"]
        if item.get("overall_ai_readiness"):
            grouped[fn]["total_ai_readiness"] += item["overall_ai_readiness"]

        intervention = item.get("recommended_intervention") or "unknown"
        grouped[fn]["interventions"][intervention] = grouped[fn]["interventions"].get(intervention, 0) + 1

    # Calculate averages
    result = []
    for fn, stats in grouped.items():
        count = stats["opportunity_count"]
        result.append({
            "function_name": fn,
            "opportunity_count": count,
            "avg_priority_score": round(stats["total_priority_score"] / count, 2) if count > 0 else 0,
            "avg_ai_readiness": round(stats["total_ai_readiness"] / count, 3) if count > 0 else 0,
            "intervention_breakdown": stats["interventions"]
        })

    return sorted(result, key=lambda x: x["avg_priority_score"], reverse=True)


# =============================================================================
# SUMMARY & ANALYTICS ENDPOINTS
# =============================================================================

@router.get("/summary", response_model=List[OntologySummaryResponse])
async def get_ontology_summary():
    """
    Get ontology completeness summary.

    Uses v_ontology_summary view to show counts and mapping status
    for all entity types.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_ontology_summary?select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/value-coverage")
async def get_value_coverage():
    """
    Get value category coverage analysis.

    Uses v_value_coverage view to show JTBD counts per value category.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_value_coverage?select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/jtbd-value-matrix")
async def get_jtbd_value_matrix(
    job_category: Optional[JobCategory] = Query(None),
    min_categories: int = Query(0, description="Minimum value categories covered"),
    limit: int = Query(100, le=500)
):
    """
    Get JTBD x Value Category cross-tabulation.

    Uses v_effective_jtbd_value_matrix view for heatmap-ready data.
    Shows relevance scores for each value category per JTBD.
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_jtbd_value_matrix?select=*&categories_covered=gte.{min_categories}&limit={limit}"

    if job_category:
        url += f"&job_category=eq.{job_category.value}"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/role-jtbd")
async def get_role_jtbd_summary(
    function_name: Optional[str] = Query(None),
    min_jtbd_count: int = Query(0),
    limit: int = Query(100, le=500)
):
    """
    Get roles with aggregated JTBD metrics.

    Uses v_effective_role_jtbd view to show:
    - JTBD counts per role
    - Complexity distribution
    - Category distribution
    - Average AI readiness
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_role_jtbd?select=*&jtbd_count=gte.{min_jtbd_count}&limit={limit}&order=jtbd_count.desc"

    if function_name:
        url += f"&function_name=ilike.*{function_name}*"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/org-hierarchy")
async def get_full_org_hierarchy(
    function_name: Optional[str] = Query(None),
    include_personas: bool = Query(True),
    limit: int = Query(500, le=2000)
):
    """
    Get complete organizational hierarchy.

    Uses v_effective_org_hierarchy view.
    Returns: Function → Department → Role → Persona
    """
    url = f"{SUPABASE_URL}/rest/v1/v_effective_org_hierarchy?select=*&limit={limit}"

    if function_name:
        url += f"&function_name=ilike.*{function_name}*"
    if not include_personas:
        url += "&persona_id=is.null"

    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()
