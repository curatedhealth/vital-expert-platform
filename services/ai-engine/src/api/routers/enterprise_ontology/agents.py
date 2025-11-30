"""
VITAL API - Agent Endpoints
============================
REST endpoints for agent operations.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import requests

router = APIRouter()

# =============================================================================
# MODELS
# =============================================================================

class AgentResponse(BaseModel):
    id: str
    name: str
    slug: str
    title: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    role_id: Optional[str] = None
    role_name: Optional[str] = None
    function_id: Optional[str] = None
    function_name: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    expertise_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    status: Optional[str] = None


class AgentSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    filters: Optional[dict] = None


class AgentSearchResult(BaseModel):
    agent_id: str
    name: str
    role_name: Optional[str]
    score: float


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

@router.get("/", response_model=List[AgentResponse])
async def list_agents(
    status: Optional[str] = Query(None, description="Filter by status (active/inactive)"),
    function_id: Optional[str] = Query(None, description="Filter by function"),
    department_id: Optional[str] = Query(None, description="Filter by department"),
    expertise_level: Optional[str] = Query(None, description="Filter by expertise level"),
    limit: int = Query(100, le=1000),
    offset: int = Query(0)
):
    """List all agents with optional filters."""
    url = f"{SUPABASE_URL}/rest/v1/agents?select=*&limit={limit}&offset={offset}"

    if status:
        url += f"&status=eq.{status}"
    if function_id:
        url += f"&function_id=eq.{function_id}"
    if department_id:
        url += f"&department_id=eq.{department_id}"
    if expertise_level:
        url += f"&expertise_level=eq.{expertise_level}"

    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.get("/count")
async def count_agents(
    status: Optional[str] = Query(None)
):
    """Get total agent count."""
    url = f"{SUPABASE_URL}/rest/v1/agents?select=id"
    if status:
        url += f"&status=eq.{status}"

    resp = requests.get(url, headers={**HEADERS, "Prefer": "count=exact"})

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    count = resp.headers.get("content-range", "0").split("/")[-1]
    return {"count": int(count) if count.isdigit() else len(resp.json())}


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get a single agent by ID."""
    url = f"{SUPABASE_URL}/rest/v1/agents?id=eq.{agent_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    if not data:
        raise HTTPException(status_code=404, detail="Agent not found")

    return data[0]


@router.get("/by-role/{role_id}", response_model=List[AgentResponse])
async def get_agents_by_role(role_id: str):
    """Get all agents for a specific role."""
    url = f"{SUPABASE_URL}/rest/v1/agents?role_id=eq.{role_id}&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()


@router.post("/search", response_model=List[AgentSearchResult])
async def search_agents(request: AgentSearchRequest):
    """
    Semantic search for agents using Pinecone.

    Uses the ont-agents namespace in vital-knowledge index.
    """
    try:
        from pinecone import Pinecone
        import hashlib

        PINECONE_API_KEY = "pcsk_3sLEoE_F3XwTFxNkzmWcEtJGS3PNrwB4VBLmZUnuFwvoUTz7NkZ9GGTsBvJfFrgypddFEi"

        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index("vital-knowledge")

        # Create query embedding (placeholder - use real embeddings in production)
        embedding = []
        for i in range(3072):
            seed = hashlib.md5(f"{request.query}{i}".encode()).digest()
            value = (seed[i % 16] / 128.0) - 1.0
            embedding.append(value)
        norm = sum(x*x for x in embedding) ** 0.5
        embedding = [x / norm for x in embedding]

        # Build filter
        filter_dict = None
        if request.filters:
            filter_dict = request.filters

        # Query
        results = index.query(
            vector=embedding,
            top_k=request.top_k,
            namespace="ont-agents",
            include_metadata=True,
            filter=filter_dict
        )

        return [
            AgentSearchResult(
                agent_id=match.metadata.get("agent_id", match.id.replace("agent-", "")),
                name=match.metadata.get("name", "Unknown"),
                role_name=match.metadata.get("role_name"),
                score=match.score
            )
            for match in results.matches
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/by-function/{function_name}", response_model=List[AgentResponse])
async def get_agents_by_function(function_name: str):
    """Get all agents in a function by name."""
    url = f"{SUPABASE_URL}/rest/v1/agents?function_name=ilike.%25{function_name}%25&select=*"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()
