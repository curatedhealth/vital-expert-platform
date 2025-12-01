"""
VITAL API - Persona Endpoints
==============================
REST endpoints for persona operations.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import requests

router = APIRouter()

# =============================================================================
# MODELS
# =============================================================================

class PersonaResponse(BaseModel):
    id: str
    unique_id: str
    persona_name: str
    persona_type: str  # AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    function_area: Optional[str] = None
    geographic_scope: Optional[str] = None
    experience_level: Optional[str] = None
    source_role_id: Optional[str] = None
    is_active: bool = True


class PersonaStats(BaseModel):
    total: int
    by_type: dict
    by_experience: dict
    by_geography: dict


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
# ENDPOINTS
# =============================================================================

@router.get("/", response_model=List[PersonaResponse])
async def list_personas(
    persona_type: Optional[str] = Query(None, description="AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC"),
    experience_level: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0)
):
    """List all personas with optional filters."""
    url = f"{SUPABASE_URL}/rest/v1/personas?select=id,unique_id,persona_name,persona_type,title,description,department,function_area,geographic_scope,experience_level,source_role_id,is_active&limit={limit}&offset={offset}"

    if persona_type:
        url += f"&persona_type=eq.{persona_type}"
    if experience_level:
        url += f"&experience_level=eq.{experience_level}"
    if department:
        url += f"&department=ilike.%25{department}%25"
    if is_active is not None:
        url += f"&is_active=eq.{str(is_active).lower()}"

    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/stats", response_model=PersonaStats)
async def get_persona_stats():
    """Get persona statistics breakdown."""
    url = f"{SUPABASE_URL}/rest/v1/personas?select=id,persona_type,experience_level,geographic_scope"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    personas = resp.json()

    # Calculate stats
    by_type = {}
    by_experience = {}
    by_geography = {}

    for p in personas:
        # By type
        ptype = p.get("persona_type", "unknown")
        by_type[ptype] = by_type.get(ptype, 0) + 1

        # By experience
        exp = p.get("experience_level", "unknown")
        by_experience[exp] = by_experience.get(exp, 0) + 1

        # By geography
        geo = p.get("geographic_scope", "unknown")
        by_geography[geo] = by_geography.get(geo, 0) + 1

    return PersonaStats(
        total=len(personas),
        by_type=by_type,
        by_experience=by_experience,
        by_geography=by_geography
    )


@router.get("/{persona_id}", response_model=PersonaResponse)
async def get_persona(persona_id: str):
    """Get a single persona by ID."""
    url = f"{SUPABASE_URL}/rest/v1/personas?id=eq.{persona_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    if not data:
        raise HTTPException(status_code=404, detail="Persona not found")

    return data[0]


@router.get("/by-role/{role_id}", response_model=List[PersonaResponse])
async def get_personas_by_role(role_id: str):
    """Get all 4 personas for a specific role (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)."""
    url = f"{SUPABASE_URL}/rest/v1/personas?source_role_id=eq.{role_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/archetypes/{archetype}", response_model=List[PersonaResponse])
async def get_personas_by_archetype(
    archetype: str,
    limit: int = Query(50, le=500)
):
    """
    Get personas by archetype.

    Archetypes:
    - AUTOMATOR: AI maturity 4, early adopter
    - ORCHESTRATOR: AI maturity 3, early majority
    - LEARNER: AI maturity 2, late majority
    - SKEPTIC: AI maturity 1, laggard
    """
    archetype_upper = archetype.upper()
    if archetype_upper not in ["AUTOMATOR", "ORCHESTRATOR", "LEARNER", "SKEPTIC"]:
        raise HTTPException(status_code=400, detail="Invalid archetype")

    url = f"{SUPABASE_URL}/rest/v1/personas?persona_type=eq.{archetype_upper}&select=*&limit={limit}"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()
