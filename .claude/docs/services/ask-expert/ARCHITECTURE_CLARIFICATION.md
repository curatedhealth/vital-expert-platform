# Agent Selection Architecture Clarification

**Date**: November 26, 2025  
**Status**: ✅ Architecture Confirmed

---

## System Architecture (Confirmed)

### Data Storage Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE LAYER                         │
└─────────────────────────────────────────────────────────────────┘

1. PostgreSQL/Supabase (Primary Database)
   ├── Agent Metadata (agents table)
   │   ├── 40+ columns (id, name, title, description, etc.)
   │   ├── Organizational hierarchy (function, department, role)
   │   └── AI configuration (model, temperature, prompts)
   │
   ├── Agent Enrichment Data
   │   ├── agent_capabilities (proficiency tracking)
   │   ├── agent_skills (task-level skills)
   │   ├── agent_responsibilities (accountability)
   │   └── agent_knowledge_domains (medical specializations)
   │
   └── Organizational Structure
       ├── org_functions (8 functions)
       ├── org_departments (~50 departments)
       └── org_roles (~200 roles)

2. Pinecone (Vector Database)
   ├── Index: "vital-agents"
   ├── Embeddings: text-embedding-3-large (1536 dimensions)
   ├── Namespaces: By tenant (tenant-{tenant_id})
   └── Metadata: agent_id, name, level, function, tenant_id

3. Neo4j (Knowledge Graph)
   ├── Nodes: Agent, Capability, Skill, Domain
   ├── Relationships:
   │   ├── HAS_CAPABILITY (with proficiency)
   │   ├── HAS_SKILL (with proficiency)
   │   ├── BELONGS_TO_FUNCTION
   │   ├── ORCHESTRATES (L1 → L2)
   │   ├── DELEGATES_TO (L2 → L3)
   │   └── COLLABORATES_WITH (peer relationships)
   └── Graph Traversal: 3-hop max depth for agent discovery
```

---

## Agent Selection Flow (3-Method Hybrid)

### Method 1: PostgreSQL Full-Text Search (30% weight)

**Purpose**: Keyword/phrase matching on agent attributes

```sql
-- Full-text search using ts_vector
CREATE OR REPLACE FUNCTION search_agents_fulltext(
    search_query TEXT,
    tenant_filter UUID,
    result_limit INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    text_rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        ts_rank(
            to_tsvector('english',
                COALESCE(a.name, '') || ' ' ||
                COALESCE(a.description, '') || ' ' ||
                COALESCE(a.title, '')
            ),
            plainto_tsquery('english', search_query)
        )::FLOAT AS text_rank
    FROM agents a
    WHERE
        a.tenant_id = tenant_filter
        AND a.status = 'active'
        AND to_tsvector('english',
                COALESCE(a.name, '') || ' ' ||
                COALESCE(a.description, '')
            ) @@ plainto_tsquery('english', search_query)
    ORDER BY text_rank DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
```

**Data Flow**:
```
Query Text
    ↓
PostgreSQL ts_vector
    ↓
Ranked Results (score 0-1)
    ↓
Weight × 0.30
```

---

### Method 2: Pinecone Vector Search (50% weight)

**Purpose**: Semantic similarity matching using embeddings

```python
# Generate query embedding
query_embedding = openai.embeddings.create(
    model="text-embedding-3-large",
    input=query,
    dimensions=1536
).data[0].embedding

# Query Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index("vital-agents")

results = index.query(
    vector=query_embedding,
    top_k=20,
    namespace=f"tenant-{tenant_id}",
    include_metadata=True,
    filter={"is_active": True}
)

# Results include similarity scores (0-1)
agents = [
    {
        "agent_id": match.id,
        "agent_name": match.metadata["name"],
        "pinecone_score": match.score,
        "source": "pinecone"
    }
    for match in results.matches
]
```

**Data Flow**:
```
Query Text
    ↓
OpenAI Embedding API (text-embedding-3-large)
    ↓
Query Vector [1536 dimensions]
    ↓
Pinecone Index ("vital-agents")
    ↓
Cosine Similarity Search
    ↓
Top-K Results (score 0-1)
    ↓
Weight × 0.50
```

---

### Method 3: Neo4j Graph Traversal (20% weight)

**Purpose**: Relationship-based agent discovery through knowledge graph

```cypher
// Neo4j Cypher Query
MATCH (query:Query {embedding: $query_embedding})

// Find agents through capability relationships
MATCH (a:Agent)-[:HAS_CAPABILITY]->(cap:Capability)
WHERE a.tenant_id = $tenant_id
  AND a.is_active = true

// Calculate semantic similarity from embeddings
WITH a, 
     gds.similarity.cosine($query_embedding, a.embedding) AS sem_score,
     count(cap) AS cap_count

// Boost based on agent hierarchy level
WITH a, sem_score, cap_count,
     CASE a.level
       WHEN 'L1_MASTER' THEN 1.0
       WHEN 'L2_EXPERT' THEN 0.95
       WHEN 'L3_SPECIALIST' THEN 0.85
       WHEN 'L4_WORKER' THEN 0.70
       ELSE 0.50
     END AS level_boost

// Find collaborative relationships
OPTIONAL MATCH (a)-[:COLLABORATES_WITH]-(peer:Agent)
WITH a, sem_score, cap_count, level_boost, count(peer) AS collab_count

// Calculate graph score
RETURN
    a.id AS agent_id,
    a.name AS name,
    (
        sem_score * 0.5 +                    -- 50% semantic
        (cap_count / 15.0) * 0.25 +          -- 25% capabilities (normalized)
        level_boost * 0.15 +                 -- 15% hierarchy appropriateness
        (collab_count / 10.0) * 0.10         -- 10% collaboration bonus
    ) AS graph_score
ORDER BY graph_score DESC
LIMIT $limit
```

**Data Flow**:
```
Query Embedding
    ↓
Neo4j Knowledge Graph
    ↓
Multi-hop Traversal (max 3 hops)
    ├── Agent-Capability relationships
    ├── Agent-Agent collaborations
    ├── Agent hierarchy (L1-L5)
    └── Agent-Domain expertise
    ↓
Graph Scoring Algorithm
    ↓
Ranked Results (score 0-1)
    ↓
Weight × 0.20
```

---

## Score Fusion: Weighted Reciprocal Rank Fusion (RRF)

### Formula

```
For each agent across all 3 methods:

fused_score = Σ(weight_i × (1 / (rank_i + k)))

Where:
- k = 60 (standard RRF constant)
- weight_i = method weight (0.30, 0.50, 0.20)
- rank_i = agent's rank in method i (0-indexed)
```

### Example

```python
# Agent "regulatory-affairs-expert"
# PostgreSQL: rank 2 (3rd result)
# Pinecone: rank 0 (1st result)
# Neo4j: rank 4 (5th result)

fused_score = (
    0.30 * (1 / (2 + 60)) +  # PostgreSQL: 0.30 × 0.0161 = 0.00483
    0.50 * (1 / (0 + 60)) +  # Pinecone: 0.50 × 0.0167 = 0.00833
    0.20 * (1 / (4 + 60))    # Neo4j: 0.20 × 0.0156 = 0.00313
) = 0.01629

# Higher fused_score = better match
```

---

## Evidence-Based Enhancement (NEW)

### Additional Scoring Layer

After RRF fusion, add evidence-based scoring:

```python
evidence_score = (
    capability_proficiency * 0.30 +  # From PostgreSQL agent_capabilities
    skill_proficiency * 0.25 +       # From PostgreSQL agent_skills
    domain_proficiency * 0.20 +      # From PostgreSQL agent_knowledge_domains
    agent_level_match * 0.15 +       # L1-L5 appropriateness
    responsibility_match * 0.10      # From PostgreSQL agent_responsibilities
)

final_score = (
    fused_score * 0.60 +      # 60% from 3-method hybrid
    evidence_score * 0.40     # 40% from evidence-based
)
```

---

## Data Seeding Requirements

### Current State (Estimated from Documentation)

**Medical Affairs Only**: 165 agents documented

| Level | Count | Status |
|-------|-------|--------|
| L1 Masters | 9 | ✅ Documented |
| L2 Experts | 45 | ✅ Documented |
| L3 Specialists | 43 | ✅ Documented |
| L4 Workers | 18 | ✅ Documented |
| L5 Tools | 50 | ✅ Documented |

**Required for All 3 Systems**:

1. **PostgreSQL/Supabase**: ✅ Schema exists, needs seeding
2. **Pinecone**: ❌ Needs embedding generation + upsert
3. **Neo4j**: ❌ Needs graph seeding

---

### Seeding Pipeline

```python
async def seed_agent_to_all_systems(agent: Agent):
    """Seed agent to PostgreSQL, Pinecone, and Neo4j"""
    
    # 1. Insert to PostgreSQL (if not exists)
    supabase.table('agents').upsert({
        'id': agent.id,
        'name': agent.name,
        'title': agent.title,
        'description': agent.description,
        'agent_level_id': agent.level_id,
        'function_id': agent.function_id,
        'tenant_id': agent.tenant_id,
        'status': 'active'
    }).execute()
    
    # Insert capabilities, skills, responsibilities
    for capability in agent.capabilities:
        supabase.table('agent_capabilities').upsert({
            'agent_id': agent.id,
            'capability_id': capability.id,
            'proficiency_level': capability.proficiency,
            'is_primary': capability.is_primary
        }).execute()
    
    # 2. Generate and upsert to Pinecone
    agent_profile = f"{agent.name} {agent.title} {agent.description}"
    embedding = openai.embeddings.create(
        model="text-embedding-3-large",
        input=agent_profile,
        dimensions=1536
    ).data[0].embedding
    
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index("vital-agents")
    index.upsert(
        vectors=[{
            "id": str(agent.id),
            "values": embedding,
            "metadata": {
                "name": agent.name,
                "level": agent.level,
                "function": agent.function,
                "tenant_id": str(agent.tenant_id),
                "is_active": True
            }
        }],
        namespace=f"tenant-{agent.tenant_id}"
    )
    
    # 3. Create nodes and relationships in Neo4j
    with neo4j_driver.session() as session:
        # Create Agent node
        session.run("""
            MERGE (a:Agent {id: $id})
            SET a.name = $name,
                a.level = $level,
                a.function = $function,
                a.tenant_id = $tenant_id,
                a.embedding = $embedding,
                a.is_active = true
        """, {
            'id': str(agent.id),
            'name': agent.name,
            'level': agent.level,
            'function': agent.function,
            'tenant_id': str(agent.tenant_id),
            'embedding': embedding
        })
        
        # Create capability relationships
        for capability in agent.capabilities:
            session.run("""
                MATCH (a:Agent {id: $agent_id})
                MERGE (c:Capability {id: $cap_id})
                MERGE (a)-[:HAS_CAPABILITY {
                    proficiency: $proficiency,
                    is_primary: $is_primary
                }]->(c)
            """, {
                'agent_id': str(agent.id),
                'cap_id': str(capability.id),
                'proficiency': capability.proficiency,
                'is_primary': capability.is_primary
            })
```

---

## Performance Targets

### Latency (P95)
- PostgreSQL: <100ms
- Pinecone: <200ms
- Neo4j: <150ms
- **Total (parallel)**: <450ms ✅

### Accuracy
- Top-1: >85%
- Top-3: >92% (ARD v2.0 requirement)
- Top-5: >95%

---

## Next Steps

1. ✅ Confirm architecture (DONE)
2. ⏳ Verify agent count in each system (Pinecone, Neo4j, PostgreSQL)
3. ⏳ Implement evidence-based selector
4. ⏳ Create agent seeding pipeline
5. ⏳ Test 3-method hybrid with actual data

---

**End of Document**


