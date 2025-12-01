"""
VITAL Platform - Unified Agent Registry
========================================
Integrates agent data across Supabase, Neo4j, and Pinecone for
consistent agent selection and GraphRAG search.

Architecture:
    Supabase (PostgreSQL) ← Source of Truth
         ↓ CDC/Sync
    Neo4j (Knowledge Graph) ← Relationships & Graph Queries
         ↓ Embeddings
    Pinecone (ont-agents) ← Semantic Search & Agent Selection
"""

import requests
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum
import json

# =============================================================================
# CONFIGURATION
# =============================================================================

SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

PINECONE_API_KEY = "pcsk_3sLEoE_F3XwTFxNkzmWcEtJGS3PNrwB4VBLmZUnuFwvoUTz7NkZ9GGTsBvJfFrgypddFEi"
PINECONE_INDEX = "vital-knowledge"
AGENT_NAMESPACE = "ont-agents"

NEO4J_URI = "neo4j+s://13067bdb.databases.neo4j.io"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "kkCxQgpcanSUDv-dKzOzDPcYIhvJHRQRa4tuiNa2Mek"

# =============================================================================
# DATA MODELS
# =============================================================================

class ExpertiseLevel(Enum):
    ENTRY = "entry"
    INTERMEDIATE = "intermediate"
    SENIOR = "senior"
    EXPERT = "expert"
    MASTER = "master"

@dataclass
class Agent:
    """Unified agent representation across all data stores."""
    id: str
    name: str
    slug: str
    title: str
    tagline: str
    description: str
    role_id: Optional[str]
    role_name: Optional[str]
    function_id: Optional[str]
    function_name: Optional[str]
    department_id: Optional[str]
    department_name: Optional[str]
    expertise_level: str
    years_of_experience: int
    geographic_scope: str
    communication_style: str
    system_prompt: str
    base_model: str
    status: str

    @classmethod
    def from_supabase(cls, data: dict) -> "Agent":
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            slug=data.get("slug", ""),
            title=data.get("title", ""),
            tagline=data.get("tagline", ""),
            description=data.get("description", ""),
            role_id=data.get("role_id"),
            role_name=data.get("role_name"),
            function_id=data.get("function_id"),
            function_name=data.get("function_name"),
            department_id=data.get("department_id"),
            department_name=data.get("department_name"),
            expertise_level=data.get("expertise_level", ""),
            years_of_experience=data.get("years_of_experience", 0),
            geographic_scope=data.get("geographic_scope", ""),
            communication_style=data.get("communication_style", ""),
            system_prompt=data.get("system_prompt", ""),
            base_model=data.get("base_model", ""),
            status=data.get("status", ""),
        )

@dataclass
class AgentSearchResult:
    """Result from semantic agent search."""
    agent_id: str
    score: float
    name: str
    role_name: str
    department_name: str
    expertise_level: str
    metadata: dict

# =============================================================================
# SUPABASE CLIENT (Source of Truth)
# =============================================================================

class SupabaseAgentClient:
    """Client for agent CRUD operations in Supabase."""

    def __init__(self):
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
        }

    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get agent by ID."""
        url = f"{SUPABASE_URL}/rest/v1/agents?id=eq.{agent_id}&select=*"
        resp = requests.get(url, headers=self.headers)
        if resp.status_code == 200 and resp.json():
            return Agent.from_supabase(resp.json()[0])
        return None

    def get_agents_by_role(self, role_id: str) -> List[Agent]:
        """Get all agents for a specific role."""
        url = f"{SUPABASE_URL}/rest/v1/agents?role_id=eq.{role_id}&select=*"
        resp = requests.get(url, headers=self.headers)
        if resp.status_code == 200:
            return [Agent.from_supabase(a) for a in resp.json()]
        return []

    def get_agents_by_department(self, department_id: str) -> List[Agent]:
        """Get all agents in a department."""
        url = f"{SUPABASE_URL}/rest/v1/agents?department_id=eq.{department_id}&select=*"
        resp = requests.get(url, headers=self.headers)
        if resp.status_code == 200:
            return [Agent.from_supabase(a) for a in resp.json()]
        return []

    def get_agents_by_function(self, function_id: str) -> List[Agent]:
        """Get all agents in a function."""
        url = f"{SUPABASE_URL}/rest/v1/agents?function_id=eq.{function_id}&select=*"
        resp = requests.get(url, headers=self.headers)
        if resp.status_code == 200:
            return [Agent.from_supabase(a) for a in resp.json()]
        return []

    def get_active_agents(self, limit: int = 100) -> List[Agent]:
        """Get all active agents."""
        url = f"{SUPABASE_URL}/rest/v1/agents?status=eq.active&select=*&limit={limit}"
        resp = requests.get(url, headers=self.headers)
        if resp.status_code == 200:
            return [Agent.from_supabase(a) for a in resp.json()]
        return []

# =============================================================================
# PINECONE CLIENT (Semantic Search)
# =============================================================================

class PineconeAgentSearch:
    """Semantic search over agents using Pinecone."""

    def __init__(self):
        from pinecone import Pinecone
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        self.index = self.pc.Index(PINECONE_INDEX)
        self.namespace = AGENT_NAMESPACE

    def _get_embedding(self, text: str) -> List[float]:
        """
        Get embedding for query text.
        TODO: Replace with actual embedding model (text-embedding-3-large)
        """
        import hashlib
        embedding = []
        for i in range(3072):
            seed = hashlib.md5(f"{text}{i}".encode()).digest()
            value = (seed[i % 16] / 128.0) - 1.0
            embedding.append(value)
        norm = sum(x*x for x in embedding) ** 0.5
        return [x / norm for x in embedding] if norm > 0 else embedding

    def search_agents(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict] = None
    ) -> List[AgentSearchResult]:
        """
        Semantic search for agents matching a query.

        Args:
            query: Natural language query (e.g., "MSL for oncology")
            top_k: Number of results to return
            filters: Metadata filters (e.g., {"department_name": "Field Medical"})

        Returns:
            List of AgentSearchResult with scores
        """
        embedding = self._get_embedding(query)

        results = self.index.query(
            vector=embedding,
            top_k=top_k,
            namespace=self.namespace,
            include_metadata=True,
            filter=filters
        )

        return [
            AgentSearchResult(
                agent_id=match.metadata.get("agent_id", ""),
                score=match.score,
                name=match.metadata.get("name", ""),
                role_name=match.metadata.get("role_name", ""),
                department_name=match.metadata.get("department_name", ""),
                expertise_level=match.metadata.get("expertise_level", ""),
                metadata=match.metadata
            )
            for match in results.matches
        ]

    def search_by_role(self, role_name: str, top_k: int = 5) -> List[AgentSearchResult]:
        """Find agents by role name similarity."""
        return self.search_agents(f"role: {role_name}", top_k=top_k)

    def search_by_task(self, task_description: str, top_k: int = 5) -> List[AgentSearchResult]:
        """Find best agent for a specific task."""
        return self.search_agents(f"agent for task: {task_description}", top_k=top_k)

    def search_by_expertise(
        self,
        domain: str,
        expertise_level: str = None,
        top_k: int = 5
    ) -> List[AgentSearchResult]:
        """Find agents with expertise in a domain."""
        filters = {"expertise_level": expertise_level} if expertise_level else None
        return self.search_agents(f"expert in {domain}", top_k=top_k, filters=filters)

# =============================================================================
# NEO4J CLIENT (Graph Queries)
# =============================================================================

class Neo4jAgentGraph:
    """
    Graph-based agent queries using Neo4j.
    Run sync_to_neo4j.py first to populate the graph.
    """

    def __init__(self):
        self.uri = NEO4J_URI
        self.user = NEO4J_USER
        self.password = NEO4J_PASSWORD
        self._driver = None

    def _get_driver(self):
        if self._driver is None:
            from neo4j import GraphDatabase
            self._driver = GraphDatabase.driver(
                self.uri, auth=(self.user, self.password)
            )
        return self._driver

    def close(self):
        if self._driver:
            self._driver.close()

    def get_agent_hierarchy(self, agent_id: str) -> Dict:
        """
        Get agent's organizational hierarchy.
        Returns: {agent, role, department, function}
        """
        query = """
        MATCH (a:Agent {id: $agent_id})
        OPTIONAL MATCH (a)-[:HAS_ROLE]->(r:Role)
        OPTIONAL MATCH (r)-[:IN_DEPARTMENT]->(d:Department)
        OPTIONAL MATCH (d)-[:BELONGS_TO]->(f:Function)
        RETURN a, r, d, f
        """
        with self._get_driver().session() as session:
            result = session.run(query, agent_id=agent_id)
            record = result.single()
            if record:
                return {
                    "agent": dict(record["a"]) if record["a"] else None,
                    "role": dict(record["r"]) if record["r"] else None,
                    "department": dict(record["d"]) if record["d"] else None,
                    "function": dict(record["f"]) if record["f"] else None,
                }
        return {}

    def get_related_agents(self, agent_id: str, limit: int = 5) -> List[Dict]:
        """
        Find agents related by shared role, department, or function.
        """
        query = """
        MATCH (a:Agent {id: $agent_id})-[:HAS_ROLE]->(r:Role)
        MATCH (related:Agent)-[:HAS_ROLE]->(r)
        WHERE related.id <> $agent_id
        RETURN related, 'same_role' as relation
        LIMIT $limit

        UNION

        MATCH (a:Agent {id: $agent_id})-[:HAS_ROLE]->(:Role)-[:IN_DEPARTMENT]->(d:Department)
        MATCH (related:Agent)-[:HAS_ROLE]->(:Role)-[:IN_DEPARTMENT]->(d)
        WHERE related.id <> $agent_id
        RETURN related, 'same_department' as relation
        LIMIT $limit
        """
        with self._get_driver().session() as session:
            result = session.run(query, agent_id=agent_id, limit=limit)
            return [
                {"agent": dict(record["related"]), "relation": record["relation"]}
                for record in result
            ]

    def get_agents_in_path(self, from_function: str, to_function: str) -> List[Dict]:
        """
        Find agents that can bridge between two functions.
        Useful for cross-functional workflows.
        """
        query = """
        MATCH (f1:Function {slug: $from_func})<-[:BELONGS_TO]-(d1:Department)
        MATCH (f2:Function {slug: $to_func})<-[:BELONGS_TO]-(d2:Department)
        MATCH (a:Agent)-[:HAS_ROLE]->(:Role)-[:IN_DEPARTMENT]->(d1)
        MATCH (a)-[:CAN_COLLABORATE_WITH]->(:Agent)-[:HAS_ROLE]->(:Role)-[:IN_DEPARTMENT]->(d2)
        RETURN DISTINCT a
        LIMIT 10
        """
        with self._get_driver().session() as session:
            result = session.run(query, from_func=from_function, to_func=to_function)
            return [dict(record["a"]) for record in result]

# =============================================================================
# UNIFIED AGENT SELECTOR (GraphRAG)
# =============================================================================

class AgentSelector:
    """
    Unified agent selection combining semantic search + graph context.
    This is the main interface for finding the right agent.
    """

    def __init__(self):
        self.supabase = SupabaseAgentClient()
        self.pinecone = PineconeAgentSearch()
        self.neo4j = Neo4jAgentGraph()

    def select_agent(
        self,
        task: str,
        context: Optional[Dict] = None,
        user_persona_type: Optional[str] = None,
        top_k: int = 3
    ) -> List[Dict]:
        """
        Select best agent(s) for a task using GraphRAG.

        Args:
            task: Task description
            context: Additional context (department, function, etc.)
            user_persona_type: AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
            top_k: Number of candidates to return

        Returns:
            List of agent candidates with scores and full details
        """
        # Step 1: Semantic search in Pinecone
        search_results = self.pinecone.search_agents(task, top_k=top_k * 2)

        # Step 2: Enrich with Supabase details
        candidates = []
        for result in search_results[:top_k]:
            agent = self.supabase.get_agent(result.agent_id)
            if agent:
                candidates.append({
                    "agent": agent,
                    "semantic_score": result.score,
                    "match_reason": f"Matched on: {result.role_name or result.department_name}",
                })

        # Step 3: Apply persona adjustment (if provided)
        if user_persona_type:
            candidates = self._adjust_for_persona(candidates, user_persona_type)

        return candidates

    def _adjust_for_persona(
        self,
        candidates: List[Dict],
        persona_type: str
    ) -> List[Dict]:
        """
        Adjust agent ranking based on user persona type.

        - AUTOMATOR: Prefer agents with high technical skills
        - ORCHESTRATOR: Prefer agents with collaboration focus
        - LEARNER: Prefer agents with educational communication
        - SKEPTIC: Prefer agents with evidence-based approach
        """
        persona_weights = {
            "AUTOMATOR": {"communication_style": ["technical", "direct"], "boost": 0.1},
            "ORCHESTRATOR": {"communication_style": ["collaborative", "strategic"], "boost": 0.1},
            "LEARNER": {"communication_style": ["educational", "supportive"], "boost": 0.1},
            "SKEPTIC": {"communication_style": ["analytical", "evidence-based"], "boost": 0.1},
        }

        weights = persona_weights.get(persona_type, {})
        preferred_styles = weights.get("communication_style", [])
        boost = weights.get("boost", 0)

        for candidate in candidates:
            agent = candidate["agent"]
            if agent.communication_style in preferred_styles:
                candidate["semantic_score"] += boost
                candidate["persona_match"] = True
            else:
                candidate["persona_match"] = False

        # Re-sort by adjusted score
        candidates.sort(key=lambda x: x["semantic_score"], reverse=True)
        return candidates

    def get_agent_with_context(self, agent_id: str) -> Dict:
        """
        Get full agent details with graph context.
        """
        agent = self.supabase.get_agent(agent_id)
        if not agent:
            return {}

        # Get graph context (may fail if Neo4j not accessible)
        try:
            hierarchy = self.neo4j.get_agent_hierarchy(agent_id)
            related = self.neo4j.get_related_agents(agent_id, limit=3)
        except Exception:
            hierarchy = {}
            related = []

        return {
            "agent": agent,
            "hierarchy": hierarchy,
            "related_agents": related,
        }

    def close(self):
        self.neo4j.close()

# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def find_agent_for_task(task: str, persona_type: str = None) -> Optional[Agent]:
    """
    Quick function to find the best agent for a task.

    Example:
        agent = find_agent_for_task("Help me write a clinical protocol")
    """
    selector = AgentSelector()
    try:
        candidates = selector.select_agent(task, user_persona_type=persona_type, top_k=1)
        if candidates:
            return candidates[0]["agent"]
    finally:
        selector.close()
    return None

def search_agents(query: str, top_k: int = 5) -> List[AgentSearchResult]:
    """
    Quick semantic search for agents.

    Example:
        results = search_agents("regulatory affairs expert")
    """
    search = PineconeAgentSearch()
    return search.search_agents(query, top_k=top_k)

def get_agent(agent_id: str) -> Optional[Agent]:
    """
    Get agent by ID from Supabase.

    Example:
        agent = get_agent("uuid-here")
    """
    client = SupabaseAgentClient()
    return client.get_agent(agent_id)

# =============================================================================
# CLI TEST
# =============================================================================

if __name__ == "__main__":
    print("Testing Agent Registry Integration...")
    print("=" * 60)

    # Test semantic search
    print("\n1. Semantic Search: 'MSL oncology expert'")
    results = search_agents("MSL oncology expert", top_k=3)
    for r in results:
        print(f"   [{r.score:.3f}] {r.name} - {r.department_name}")

    # Test agent selection
    print("\n2. Agent Selection for task (SKEPTIC persona)")
    selector = AgentSelector()
    candidates = selector.select_agent(
        "Review clinical trial protocol for regulatory compliance",
        user_persona_type="SKEPTIC",
        top_k=3
    )
    for c in candidates:
        agent = c["agent"]
        print(f"   [{c['semantic_score']:.3f}] {agent.name}")
        print(f"       Persona match: {c.get('persona_match', 'N/A')}")
    selector.close()

    print("\n" + "=" * 60)
    print("Integration test complete.")
