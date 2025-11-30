"""
VITAL API - Ontology Endpoints
===============================
REST endpoints for organizational ontology (functions, departments, roles).
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import requests

router = APIRouter()

# =============================================================================
# MODELS
# =============================================================================

class FunctionResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    mission_statement: Optional[str] = None
    regulatory_sensitivity: Optional[str] = None
    strategic_priority: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    function_id: str
    function_name: Optional[str] = None
    operating_model: Optional[str] = None
    field_vs_office_mix: Optional[str] = None


class RoleResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    role_type: Optional[str] = None
    role_category: Optional[str] = None
    seniority_level: Optional[str] = None
    leadership_level: Optional[str] = None
    geographic_scope: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    function_id: Optional[str] = None
    function_name: Optional[str] = None
    gxp_critical: bool = False
    hcp_facing: bool = False
    patient_facing: bool = False


class OntologyHierarchy(BaseModel):
    functions: List[dict]
    departments_count: int
    roles_count: int
    personas_count: int
    agents_count: int


# =============================================================================
# CONFIGURATION
# =============================================================================

SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

# =============================================================================
# FUNCTIONS ENDPOINTS
# =============================================================================

@router.get("/functions", response_model=List[FunctionResponse])
async def list_functions():
    """List all organizational functions."""
    url = f"{SUPABASE_URL}/rest/v1/org_functions?select=*&order=name"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/functions/{function_id}", response_model=FunctionResponse)
async def get_function(function_id: str):
    """Get a single function by ID."""
    url = f"{SUPABASE_URL}/rest/v1/org_functions?id=eq.{function_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    if not data:
        raise HTTPException(status_code=404, detail="Function not found")

    return data[0]


# =============================================================================
# DEPARTMENTS ENDPOINTS
# =============================================================================

@router.get("/departments", response_model=List[DepartmentResponse])
async def list_departments(
    function_id: Optional[str] = Query(None),
    limit: int = Query(200, le=1000)
):
    """List all departments with optional function filter."""
    url = f"{SUPABASE_URL}/rest/v1/org_departments?select=*&limit={limit}&order=name"

    if function_id:
        url += f"&function_id=eq.{function_id}"

    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/departments/{department_id}", response_model=DepartmentResponse)
async def get_department(department_id: str):
    """Get a single department by ID."""
    url = f"{SUPABASE_URL}/rest/v1/org_departments?id=eq.{department_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    if not data:
        raise HTTPException(status_code=404, detail="Department not found")

    return data[0]


# =============================================================================
# ROLES ENDPOINTS
# =============================================================================

@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(
    function_id: Optional[str] = Query(None),
    department_id: Optional[str] = Query(None),
    seniority_level: Optional[str] = Query(None),
    hcp_facing: Optional[bool] = Query(None),
    limit: int = Query(200, le=1000),
    offset: int = Query(0)
):
    """List all roles with optional filters."""
    url = f"{SUPABASE_URL}/rest/v1/org_roles?select=*&limit={limit}&offset={offset}&order=name"

    if function_id:
        url += f"&function_id=eq.{function_id}"
    if department_id:
        url += f"&department_id=eq.{department_id}"
    if seniority_level:
        url += f"&seniority_level=eq.{seniority_level}"
    if hcp_facing is not None:
        url += f"&hcp_facing=eq.{str(hcp_facing).lower()}"

    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(role_id: str):
    """Get a single role by ID."""
    url = f"{SUPABASE_URL}/rest/v1/org_roles?id=eq.{role_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    if not data:
        raise HTTPException(status_code=404, detail="Role not found")

    return data[0]


# =============================================================================
# HIERARCHY ENDPOINT
# =============================================================================

@router.get("/hierarchy", response_model=OntologyHierarchy)
async def get_ontology_hierarchy():
    """
    Get full ontology hierarchy with counts.

    Returns:
    - All functions with nested department counts
    - Total counts for each layer
    """
    # Fetch functions
    funcs_url = f"{SUPABASE_URL}/rest/v1/org_functions?select=id,name,slug"
    funcs_resp = requests.get(funcs_url, headers=HEADERS)
    functions = funcs_resp.json() if funcs_resp.status_code == 200 else []

    # Count departments
    depts_url = f"{SUPABASE_URL}/rest/v1/org_departments?select=id"
    depts_resp = requests.get(depts_url, headers={**HEADERS, "Prefer": "count=exact"})
    depts_count = len(depts_resp.json()) if depts_resp.status_code == 200 else 0

    # Count roles
    roles_url = f"{SUPABASE_URL}/rest/v1/org_roles?select=id"
    roles_resp = requests.get(roles_url, headers={**HEADERS, "Prefer": "count=exact"})
    roles_count = len(roles_resp.json()) if roles_resp.status_code == 200 else 0

    # Count personas
    personas_url = f"{SUPABASE_URL}/rest/v1/personas?select=id"
    personas_resp = requests.get(personas_url, headers={**HEADERS, "Prefer": "count=exact"})
    personas_count = len(personas_resp.json()) if personas_resp.status_code == 200 else 0

    # Count agents
    agents_url = f"{SUPABASE_URL}/rest/v1/agents?select=id"
    agents_resp = requests.get(agents_url, headers={**HEADERS, "Prefer": "count=exact"})
    agents_count = len(agents_resp.json()) if agents_resp.status_code == 200 else 0

    return OntologyHierarchy(
        functions=functions,
        departments_count=depts_count,
        roles_count=roles_count,
        personas_count=personas_count,
        agents_count=agents_count
    )
