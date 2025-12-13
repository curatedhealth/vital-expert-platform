# VITAL Platform - Knowledge System Architecture

## Triple Retrieval System: Pinecone + Supabase + Neo4j

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER QUERY / AGENT SELECTION                        │
│                    "Find expert for FDA regulatory guidance"                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Fusion Intelligence Engine  │
                    │   (FusionEngine)              │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
        │   PINECONE       │ │   SUPABASE   │ │    NEO4J     │
        │  (Vector Search) │ │ (Relational) │ │  (Graph DB)  │
        └──────────────────┘ └──────────────┘ └──────────────┘
                │                   │               │
                │ 50% weight        │ 30% weight    │ 20% weight
                │                   │               │
                ▼                   ▼               ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Vector Retrieval │ │ Relational    │ │ Graph Path    │
        │                  │ │ Retrieval    │ │ Retrieval     │
        │ • Semantic       │ │              │ │               │
        │   similarity     │ │ • Historical │ │ • Relationship│
        │ • Embedding      │ │   patterns   │ │   traversal   │
        │   search         │ │ • Metadata    │ │ • Skill links │
        │ • Namespace      │ │   queries     │ │ • Domain      │
        │   filtering      │ │ • Full-text   │ │   connections│
        │                  │ │   search      │ │ • Agent       │
        │ Namespaces:      │ │               │ │   hierarchies │
        │ • KD-reg-fda     │ │ Tables:       │ │               │
        │ • KD-clinical    │ │ • agents      │ │ Nodes:        │
        │ • KD-ma-msl      │ │ • agent_      │ │ • Agent       │
        │ • ont-agents     │ │   knowledge_  │ │ • Skill       │
        │                  │ │   domains     │ │ • Domain      │
        │ Index:           │ │ • knowledge_  │ │ • Capability  │
        │ vital-knowledge  │ │   base_       │ │               │
        │                  │ │   documents   │ │ Relationships:│
        │                  │ │               │ │ • HAS_SKILL   │
        │                  │ │ pgvector:     │ │ • WORKS_IN    │
        │                  │ │ • embeddings  │ │ • COLLABORATES│
        │                  │ │   (1536 dim)  │ │ • EXPERT_IN   │
        └──────────────────┘ └──────────────┘ └──────────────┘
                │                   │               │
                │                   │               │
                └───────────┬───────┴───────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Ranked Results      │
                │  (per source)         │
                │                       │
                │ Vector:              │
                │ 1. Agent-A (0.92)    │
                │ 2. Agent-B (0.87)    │
                │ 3. Agent-C (0.81)    │
                │                      │
                │ Relational:          │
                │ 1. Agent-B (0.95)   │
                │ 2. Agent-A (0.88)   │
                │ 3. Agent-D (0.79)   │
                │                      │
                │ Graph:               │
                │ 1. Agent-A (0.90)    │
                │ 2. Agent-C (0.85)    │
                │ 3. Agent-B (0.82)   │
                └───────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────┐
        │     Reciprocal Rank Fusion (RRF)          │
        │                                            │
        │  Formula:                                 │
        │  RRF(d) = Σ (weight_s × 1/(k + rank_s))  │
        │                                            │
        │  Where:                                   │
        │  • k = 60 (smoothing constant)            │
        │  • weight_vector = 0.50                   │
        │  • weight_relational = 0.30               │
        │  • weight_graph = 0.20                    │
        │                                            │
        │  Example for Agent-A:                     │
        │  • Vector: rank=1 → 0.50 × 1/61 = 0.0082 │
        │  • Relational: rank=2 → 0.30 × 1/62 =    │
        │    0.0048                                 │
        │  • Graph: rank=1 → 0.20 × 1/61 = 0.0033  │
        │  • Total RRF Score = 0.0163               │
        └───────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Fused Rankings       │
                │  (sorted by RRF)      │
                │                       │
                │ 1. Agent-A (0.0163)   │ ← Highest confidence
                │ 2. Agent-B (0.0145)   │
                │ 3. Agent-C (0.0112)   │
                │ 4. Agent-D (0.0089)   │
                │                       │
                │ Metadata includes:    │
                │ • Source contributions│
                │ • Individual scores   │
                │ • Confidence level    │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Selected Agent(s)     │
                │  + Evidence            │
                └───────────────────────┘
```

## Data Storage Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA STORAGE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PINECONE (Vector Database)                                                 │
│  Index: vital-knowledge                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Namespaces:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ KNOWLEDGE DOMAINS (KD-* / knowledge-*)                              │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ • KD-reg-fda / knowledge-reg-fda                                    │  │
│  │   → FDA regulations, 510(k), PMA documents                         │  │
│  │ • KD-clinical-trials / knowledge-clinical-trials                   │  │
│  │   → Clinical trial protocols, GCP guidelines                         │  │
│  │ • KD-ma-msl / knowledge-ma-msl                                      │  │
│  │   → MSL activities, KOL engagement                                 │  │
│  │ • KD-heor-rwe / knowledge-heor-rwe                                  │  │
│  │   → Real-world evidence studies                                    │  │
│  │ • ... (24 total knowledge namespaces)                               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ ONTOLOGY (ont-*)                                                     │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ • ont-agents                                                         │  │
│  │   → Agent embeddings for semantic search                           │  │
│  │ • ont-personas                                                      │  │
│  │   → User persona profiles                                          │  │
│  │ • ont-skills                                                        │  │
│  │   → Skill definitions and capabilities                             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Vector Format:                                                              │
│  • Dimensions: 1536 (OpenAI text-embedding-3-large)                       │
│  • Metadata: {agent_id, domain, tags, source, namespace}                  │
│  • Similarity: Cosine distance                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  SUPABASE (PostgreSQL + pgvector)                                           │
│  Primary relational database                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Core Tables:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ agents                                                               │  │
│  │ • id, name, role_name, department_name                              │  │
│  │ • knowledge_namespaces (TEXT[])                                      │  │
│  │ • metadata (JSONB)                                                  │  │
│  │ • status, created_at, updated_at                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ agent_knowledge_domains                                              │  │
│  │ • agent_id → domain_name mapping                                    │  │
│  │ • proficiency_level (basic/intermediate/advanced/expert)            │  │
│  │ • is_primary_domain                                                 │  │
│  │ • expertise_level (1-5)                                             │  │
│  │                                                                     │  │
│  │ Domains:                                                             │  │
│  │ • Medical Affairs                                                   │  │
│  │ • Regulatory Affairs                                                │  │
│  │ • Clinical Development                                               │  │
│  │ • Pharmacovigilance                                                 │  │
│  │ • Quality Assurance                                                 │  │
│  │ • Market Access                                                      │  │
│  │ • ... (16 total domains)                                            │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ knowledge_base_documents                                            │  │
│  │ • id, content, embedding (vector 1536)                             │  │
│  │ • metadata (JSONB)                                                  │  │
│  │ • category, source                                                  │  │
│  │ • Full-text search index (GIN)                                     │  │
│  │ • Vector similarity index (IVFFlat)                                 │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Functions:                                                                 │
│  • match_documents(query_embedding, match_count, filter_category)         │
│  • Vector similarity search via pgvector                                  │
│  • Full-text search via PostgreSQL GIN indexes                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  NEO4J (Graph Database)                                                     │
│  Relationship and hierarchy storage                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Node Types:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Agent                                                               │  │
│  │ • Properties: id, name, role, department                           │  │
│  │ • Labels: [:Agent, :Active]                                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Skill                                                               │  │
│  │ • Properties: id, name, description                                │  │
│  │ • Labels: [:Skill, :Capability]                                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Domain                                                              │  │
│  │ • Properties: id, name, category                                   │  │
│  │ • Labels: [:Domain, :KnowledgeDomain]                             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Relationships:                                                             │
│  • (Agent)-[:HAS_SKILL]->(Skill)                                           │
│  • (Agent)-[:WORKS_IN]->(Domain)                                           │
│  • (Agent)-[:COLLABORATES_WITH]->(Agent)                                   │
│  • (Agent)-[:EXPERT_IN]->(Domain)                                          │
│  • (Skill)-[:RELATED_TO]->(Domain)                                         │
│  • (Domain)-[:SUB_DOMAIN_OF]->(Domain)                                     │
│                                                                             │
│  Graph Queries:                                                             │
│  • Find agents by skill path:                                             │
│    MATCH (a:Agent)-[:HAS_SKILL]->(s:Skill {name: 'FDA'})                   │
│    RETURN a                                                                 │
│                                                                             │
│  • Find related agents:                                                    │
│    MATCH (a1:Agent)-[:COLLABORATES_WITH*2]-(a2:Agent)                      │
│    WHERE a1.id = $agent_id                                                  │
│    RETURN a2                                                                │
│                                                                             │
│  • Domain hierarchy traversal:                                             │
│    MATCH (d:Domain)-[:SUB_DOMAIN_OF*]->(parent:Domain)                     │
│    WHERE parent.name = 'Regulatory Affairs'                                │
│    RETURN d                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Query Flow Example

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXAMPLE: "Find FDA regulatory expert"                    │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: Query Preparation
─────────────────────────
User Query: "Find expert for FDA regulatory guidance"
              │
              ▼
    Generate embedding (OpenAI text-embedding-3-large)
    → [0.123, -0.456, 0.789, ...] (1536 dimensions)
              │
              ▼
    Extract keywords: ["FDA", "regulatory", "guidance", "expert"]
              │
              ▼
    Determine namespaces: ["KD-reg-fda", "ont-agents"]


STEP 2: Parallel Retrieval
───────────────────────────
    ┌─────────────────────────────────────────────────────────┐
    │ PINECONE (Vector Search) - 50% weight                  │
    ├─────────────────────────────────────────────────────────┤
    │ Query:                                                  │
    │   index.query(                                          │
    │     vector=embedding,                                   │
    │     namespace="KD-reg-fda",                             │
    │     top_k=10,                                           │
    │     filter={"domain": "Regulatory Affairs"}            │
    │   )                                                     │
    │                                                         │
    │ Results:                                                │
    │   1. Agent-A (similarity: 0.92)                        │
    │   2. Agent-B (similarity: 0.87)                        │
    │   3. Agent-C (similarity: 0.81)                        │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │ SUPABASE (Relational) - 30% weight                     │
    ├─────────────────────────────────────────────────────────┤
    │ Query 1: Full-text search                              │
    │   SELECT * FROM agents                                 │
    │   WHERE to_tsvector('english', role_name || ' ' ||     │
    │                      department_name)                   │
    │         @@ plainto_tsquery('english', 'FDA regulatory')│
    │                                                         │
    │ Query 2: Domain filter                                 │
    │   SELECT a.* FROM agents a                             │
    │   JOIN agent_knowledge_domains akd                      │
    │     ON a.id = akd.agent_id                              │
    │   WHERE akd.domain_name = 'Regulatory Affairs'         │
    │     AND akd.proficiency_level IN ('advanced', 'expert')  │
    │                                                         │
    │ Query 3: Vector similarity (pgvector)                  │
    │   SELECT * FROM match_documents(                        │
    │     query_embedding,                                    │
    │     match_count=10,                                     │
    │     filter_category='regulatory'                       │
    │   )                                                     │
    │                                                         │
    │ Results:                                                │
    │   1. Agent-B (score: 0.95) - High historical success   │
    │   2. Agent-A (score: 0.88) - Good match                │
    │   3. Agent-D (score: 0.79) - Related domain            │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │ NEO4J (Graph) - 20% weight                             │
    ├─────────────────────────────────────────────────────────┤
    │ Query:                                                  │
    │   MATCH (a:Agent)-[:HAS_SKILL]->(s:Skill)               │
    │   WHERE s.name CONTAINS 'FDA'                           │
    │     OR s.name CONTAINS 'Regulatory'                     │
    │   WITH a, count(s) as skill_count                       │
    │   MATCH (a)-[:WORKS_IN]->(d:Domain)                     │
    │   WHERE d.name = 'Regulatory Affairs'                  │
    │   RETURN a, skill_count                                 │
    │   ORDER BY skill_count DESC                             │
    │   LIMIT 10                                               │
    │                                                         │
    │ Results:                                                │
    │   1. Agent-A (path_score: 0.90) - Strong skill links   │
    │   2. Agent-C (path_score: 0.85) - Related skills       │
    │   3. Agent-B (path_score: 0.82) - Domain connection    │
    └─────────────────────────────────────────────────────────┘


STEP 3: RRF Fusion
──────────────────
    For each agent found in any source:

    Agent-A:
    • Vector: rank=1 → 0.50 × 1/(60+1) = 0.0082
    • Relational: rank=2 → 0.30 × 1/(60+2) = 0.0048
    • Graph: rank=1 → 0.20 × 1/(60+1) = 0.0033
    • Total RRF Score = 0.0163

    Agent-B:
    • Vector: rank=2 → 0.50 × 1/(60+2) = 0.0081
    • Relational: rank=1 → 0.30 × 1/(60+1) = 0.0049
    • Graph: rank=3 → 0.20 × 1/(60+3) = 0.0032
    • Total RRF Score = 0.0162

    Agent-C:
    • Vector: rank=3 → 0.50 × 1/(60+3) = 0.0079
    • Relational: (not found)
    • Graph: rank=2 → 0.20 × 1/(60+2) = 0.0032
    • Total RRF Score = 0.0111


STEP 4: Final Ranking
─────────────────────
    Sorted by RRF Score (descending):
    
    1. Agent-A (0.0163) ← Selected
       • Found in 3 sources (high confidence)
       • Strong semantic match + historical success + skill links
    
    2. Agent-B (0.0162)
       • Found in 3 sources (high confidence)
       • Excellent historical record
    
    3. Agent-C (0.0111)
       • Found in 2 sources (medium confidence)
       • Good semantic match


STEP 5: Evidence & Explanation
───────────────────────────────
    {
      "selected_agent": "Agent-A",
      "rrf_score": 0.0163,
      "confidence": "high",
      "sources_found": ["vector", "relational", "graph"],
      "evidence": {
        "vector": {
          "score": 0.92,
          "rank": 1,
          "contribution": 0.0082
        },
        "relational": {
          "score": 0.88,
          "rank": 2,
          "contribution": 0.0048,
          "success_rate": 0.95
        },
        "graph": {
          "score": 0.90,
          "rank": 1,
          "contribution": 0.0033,
          "skill_count": 5
        }
      },
      "explanation": "Agent-A was selected because:\n  - Vector: Ranked #1 (score: 0.92, weight: 0.50)\n  - Relational: Ranked #2 (score: 0.88, weight: 0.30)\n  - Graph: Ranked #1 (score: 0.90, weight: 0.20)\n  → Found in 3 sources (higher confidence)"
    }
```

## Key Features

### 1. **Graceful Degradation**
- System works with 1-3 sources available
- If Pinecone fails, falls back to Supabase + Neo4j
- If Neo4j fails, uses Pinecone + Supabase
- Minimum: Single source still provides results

### 2. **Weighted RRF**
- Configurable weights per source
- Default: Vector 50%, Relational 30%, Graph 20%
- Weights can be adjusted per use case

### 3. **Namespace Filtering**
- Pinecone: 24 knowledge domain namespaces
- Supabase: Domain filtering via `agent_knowledge_domains`
- Neo4j: Domain relationships in graph

### 4. **Evidence Tracking**
- Each result includes source contributions
- Confidence levels: high (3 sources), medium (2), low (1)
- Detailed metadata for explainability

### 5. **Performance**
- Parallel retrieval (all sources queried simultaneously)
- Timeout protection (default 5 seconds)
- Caching for repeated queries
