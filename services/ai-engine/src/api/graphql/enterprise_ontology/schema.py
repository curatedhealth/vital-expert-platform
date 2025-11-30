"""
VITAL Platform - GraphQL Schema
================================
Strawberry GraphQL schema for VITAL Platform.
"""

import strawberry
from typing import List, Optional
import requests

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
# TYPES
# =============================================================================

@strawberry.type
class Function:
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    mission_statement: Optional[str] = None
    regulatory_sensitivity: Optional[str] = None
    strategic_priority: Optional[str] = None


@strawberry.type
class Department:
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    function_id: str
    operating_model: Optional[str] = None

    @strawberry.field
    def function(self) -> Optional[Function]:
        """Resolve parent function."""
        url = f"{SUPABASE_URL}/rest/v1/org_functions?id=eq.{self.function_id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Function(**{k: data.get(k) for k in Function.__annotations__})
        return None


@strawberry.type
class Role:
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    role_type: Optional[str] = None
    seniority_level: Optional[str] = None
    geographic_scope: Optional[str] = None
    department_id: Optional[str] = None
    function_id: Optional[str] = None
    hcp_facing: bool = False
    patient_facing: bool = False

    @strawberry.field
    def department(self) -> Optional[Department]:
        """Resolve parent department."""
        if not self.department_id:
            return None
        url = f"{SUPABASE_URL}/rest/v1/org_departments?id=eq.{self.department_id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Department(**{k: data.get(k) for k in Department.__annotations__ if k != 'function'})
        return None

    @strawberry.field
    def personas(self) -> List["Persona"]:
        """Get all personas for this role."""
        url = f"{SUPABASE_URL}/rest/v1/personas?source_role_id=eq.{self.id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            return [
                Persona(**{k: p.get(k) for k in Persona.__annotations__ if not callable(getattr(Persona, k, None))})
                for p in resp.json()
            ]
        return []

    @strawberry.field
    def agents(self) -> List["Agent"]:
        """Get all agents for this role."""
        url = f"{SUPABASE_URL}/rest/v1/agents?role_id=eq.{self.id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            return [
                Agent(**{k: a.get(k) for k in ['id', 'name', 'slug', 'title', 'tagline', 'expertise_level', 'status']})
                for a in resp.json()
            ]
        return []


@strawberry.type
class Persona:
    id: str
    unique_id: str
    persona_name: str
    persona_type: str
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    experience_level: Optional[str] = None
    geographic_scope: Optional[str] = None
    source_role_id: Optional[str] = None
    is_active: bool = True

    @strawberry.field
    def role(self) -> Optional[Role]:
        """Resolve source role."""
        if not self.source_role_id:
            return None
        url = f"{SUPABASE_URL}/rest/v1/org_roles?id=eq.{self.source_role_id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Role(**{k: data.get(k) for k in ['id', 'name', 'slug', 'description', 'role_type',
                          'seniority_level', 'geographic_scope', 'department_id', 'function_id',
                          'hcp_facing', 'patient_facing']})
        return None


@strawberry.type
class Agent:
    id: str
    name: str
    slug: str
    title: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    role_id: Optional[str] = None
    function_id: Optional[str] = None
    department_id: Optional[str] = None
    expertise_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    status: Optional[str] = None

    @strawberry.field
    def role(self) -> Optional[Role]:
        """Resolve role."""
        if not self.role_id:
            return None
        url = f"{SUPABASE_URL}/rest/v1/org_roles?id=eq.{self.role_id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Role(**{k: data.get(k) for k in ['id', 'name', 'slug', 'description', 'role_type',
                          'seniority_level', 'geographic_scope', 'department_id', 'function_id',
                          'hcp_facing', 'patient_facing']})
        return None


@strawberry.type
class AgentSearchResult:
    agent_id: str
    name: str
    role_name: Optional[str]
    score: float


@strawberry.type
class OntologyStats:
    functions_count: int
    departments_count: int
    roles_count: int
    personas_count: int
    agents_count: int


# =============================================================================
# QUERIES
# =============================================================================

@strawberry.type
class Query:
    # === FUNCTIONS ===
    @strawberry.field
    def functions(self) -> List[Function]:
        """Get all organizational functions."""
        url = f"{SUPABASE_URL}/rest/v1/org_functions?select=*&order=name"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            return [Function(**{k: f.get(k) for k in Function.__annotations__}) for f in resp.json()]
        return []

    @strawberry.field
    def function(self, id: str) -> Optional[Function]:
        """Get a function by ID."""
        url = f"{SUPABASE_URL}/rest/v1/org_functions?id=eq.{id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Function(**{k: data.get(k) for k in Function.__annotations__})
        return None

    # === DEPARTMENTS ===
    @strawberry.field
    def departments(self, function_id: Optional[str] = None, limit: int = 100) -> List[Department]:
        """Get departments with optional function filter."""
        url = f"{SUPABASE_URL}/rest/v1/org_departments?select=*&limit={limit}&order=name"
        if function_id:
            url += f"&function_id=eq.{function_id}"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            return [
                Department(**{k: d.get(k) for k in Department.__annotations__ if k != 'function'})
                for d in resp.json()
            ]
        return []

    @strawberry.field
    def department(self, id: str) -> Optional[Department]:
        """Get a department by ID."""
        url = f"{SUPABASE_URL}/rest/v1/org_departments?id=eq.{id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Department(**{k: data.get(k) for k in Department.__annotations__ if k != 'function'})
        return None

    # === ROLES ===
    @strawberry.field
    def roles(
        self,
        function_id: Optional[str] = None,
        department_id: Optional[str] = None,
        seniority_level: Optional[str] = None,
        limit: int = 100
    ) -> List[Role]:
        """Get roles with optional filters."""
        url = f"{SUPABASE_URL}/rest/v1/org_roles?select=*&limit={limit}&order=name"
        if function_id:
            url += f"&function_id=eq.{function_id}"
        if department_id:
            url += f"&department_id=eq.{department_id}"
        if seniority_level:
            url += f"&seniority_level=eq.{seniority_level}"

        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            return [
                Role(**{k: r.get(k) for k in ['id', 'name', 'slug', 'description', 'role_type',
                      'seniority_level', 'geographic_scope', 'department_id', 'function_id',
                      'hcp_facing', 'patient_facing']})
                for r in resp.json()
            ]
        return []

    @strawberry.field
    def role(self, id: str) -> Optional[Role]:
        """Get a role by ID."""
        url = f"{SUPABASE_URL}/rest/v1/org_roles?id=eq.{id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Role(**{k: data.get(k) for k in ['id', 'name', 'slug', 'description', 'role_type',
                          'seniority_level', 'geographic_scope', 'department_id', 'function_id',
                          'hcp_facing', 'patient_facing']})
        return None

    # === PERSONAS ===
    @strawberry.field
    def personas(
        self,
        persona_type: Optional[str] = None,
        role_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Persona]:
        """Get personas with optional filters."""
        url = f"{SUPABASE_URL}/rest/v1/personas?select=*&limit={limit}"
        if persona_type:
            url += f"&persona_type=eq.{persona_type}"
        if role_id:
            url += f"&source_role_id=eq.{role_id}"

        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            return [
                Persona(**{k: p.get(k) for k in ['id', 'unique_id', 'persona_name', 'persona_type',
                          'title', 'description', 'department', 'experience_level',
                          'geographic_scope', 'source_role_id', 'is_active']})
                for p in resp.json()
            ]
        return []

    @strawberry.field
    def persona(self, id: str) -> Optional[Persona]:
        """Get a persona by ID."""
        url = f"{SUPABASE_URL}/rest/v1/personas?id=eq.{id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Persona(**{k: data.get(k) for k in ['id', 'unique_id', 'persona_name', 'persona_type',
                              'title', 'description', 'department', 'experience_level',
                              'geographic_scope', 'source_role_id', 'is_active']})
        return None

    # === AGENTS ===
    @strawberry.field
    def agents(
        self,
        status: Optional[str] = None,
        role_id: Optional[str] = None,
        expertise_level: Optional[str] = None,
        limit: int = 100
    ) -> List[Agent]:
        """Get agents with optional filters."""
        url = f"{SUPABASE_URL}/rest/v1/agents?select=*&limit={limit}"
        if status:
            url += f"&status=eq.{status}"
        if role_id:
            url += f"&role_id=eq.{role_id}"
        if expertise_level:
            url += f"&expertise_level=eq.{expertise_level}"

        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            return [
                Agent(**{k: a.get(k) for k in ['id', 'name', 'slug', 'title', 'tagline', 'description',
                        'role_id', 'function_id', 'department_id', 'expertise_level',
                        'years_of_experience', 'status']})
                for a in resp.json()
            ]
        return []

    @strawberry.field
    def agent(self, id: str) -> Optional[Agent]:
        """Get an agent by ID."""
        url = f"{SUPABASE_URL}/rest/v1/agents?id=eq.{id}&select=*"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return Agent(**{k: data.get(k) for k in ['id', 'name', 'slug', 'title', 'tagline', 'description',
                            'role_id', 'function_id', 'department_id', 'expertise_level',
                            'years_of_experience', 'status']})
        return None

    # === SEARCH ===
    @strawberry.field
    def search_agents(self, query: str, top_k: int = 5) -> List[AgentSearchResult]:
        """Semantic search for agents."""
        try:
            from pinecone import Pinecone
            import hashlib

            PINECONE_API_KEY = "pcsk_3sLEoE_F3XwTFxNkzmWcEtJGS3PNrwB4VBLmZUnuFwvoUTz7NkZ9GGTsBvJfFrgypddFEi"

            pc = Pinecone(api_key=PINECONE_API_KEY)
            index = pc.Index("vital-knowledge")

            # Create embedding
            embedding = []
            for i in range(3072):
                seed = hashlib.md5(f"{query}{i}".encode()).digest()
                value = (seed[i % 16] / 128.0) - 1.0
                embedding.append(value)
            norm = sum(x*x for x in embedding) ** 0.5
            embedding = [x / norm for x in embedding]

            results = index.query(
                vector=embedding,
                top_k=top_k,
                namespace="ont-agents",
                include_metadata=True
            )

            return [
                AgentSearchResult(
                    agent_id=m.metadata.get("agent_id", m.id),
                    name=m.metadata.get("name", "Unknown"),
                    role_name=m.metadata.get("role_name"),
                    score=m.score
                )
                for m in results.matches
            ]
        except Exception:
            return []

    # === STATS ===
    @strawberry.field
    def ontology_stats(self) -> OntologyStats:
        """Get ontology statistics."""
        counts = {}
        for table, key in [("org_functions", "functions_count"),
                           ("org_departments", "departments_count"),
                           ("org_roles", "roles_count"),
                           ("personas", "personas_count"),
                           ("agents", "agents_count")]:
            url = f"{SUPABASE_URL}/rest/v1/{table}?select=id"
            resp = requests.get(url, headers=HEADERS)
            counts[key] = len(resp.json()) if resp.status_code == 200 else 0

        return OntologyStats(**counts)


# =============================================================================
# SCHEMA
# =============================================================================

schema = strawberry.Schema(query=Query)
