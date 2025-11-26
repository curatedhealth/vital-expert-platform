# GraphRAG Data Loading Plan

## Overview

The GraphRAG service is **100% implemented and tested**, but currently has **no data** to search. This document outlines the comprehensive plan to load all agent, skill, and knowledge data into Pinecone (vector search) and Neo4j (graph search).

## Current Status

### ✅ What EXISTS
- **165 Medical Affairs Agents** in PostgreSQL (Supabase)
- **12+ Skills** parsed from skills-main folder
- **1,187 agent-skill mappings**
- **1,187 agent-tool mappings**
- **884 agent-knowledge mappings**
- **2,007 agent hierarchies**
- GraphRAG service fully implemented

### ❌ What's MISSING
- ❌ Agent embeddings in Pinecone/pgvector
- ❌ Skill embeddings in Pinecone/pgvector
- ❌ Knowledge document embeddings
- ❌ Agent graph in Neo4j
- ❌ KG metadata (node types, edge types, agent views)

---

## Phase 0: Skills Loading (15 min)

**Status**: ✅ Skills parsed from folder

### Parsed Skills Summary

We've identified **12 skills** from the skills-main folder:

1. **Template Skill** - Basic skill template
2. **Theme Factory** - Design themes and color palettes
3. **Algorithmic Art** - Generative art and visual patterns
4. **Internal Comms** - Internal communication templates
5. **Skill Creator** - Meta-skill for creating new skills
6. **Canvas Design** - Canvas-based design tool
7. **Slack GIF Creator** - GIF generation for Slack
8. **Web Application Testing** - Webapp testing patterns
9. **Frontend Design** - Frontend UI/UX design
10. **MCP Server Development** - MCP server building guide
11. **Brand Styling** - Anthropic brand guidelines
12. **Web Artifacts Builder** - Single-file web artifacts

### Task 0.1: Load Skills to PostgreSQL

**Script**: `database/seeds/data/load_skills_from_folder.sql`

```sql
-- Load parsed skills into skills table
INSERT INTO skills (name, slug, description, category, complexity_level, is_active, metadata)
VALUES
  ('Theme Factory Skill', 'theme-factory', 'Design themes and color palettes for visual consistency', 'design', 'intermediate', true, '{"skill_type": "knowledge"}'),
  ('Algorithmic Art', 'algorithmic-art', 'Generative art and visual pattern creation', 'creative', 'advanced', true, '{"skill_type": "knowledge"}'),
  ('Internal Comms', 'internal-comms', 'Internal communication templates and best practices', 'communication', 'basic', true, '{"skill_type": "knowledge"}'),
  ('Skill Creator', 'skill-creator', 'Meta-skill for creating and packaging new skills', 'meta', 'advanced', true, '{"skill_type": "executable", "has_scripts": true}'),
  ('Canvas Design', 'canvas-design', 'Canvas-based design and layout tool', 'design', 'intermediate', true, '{"skill_type": "knowledge"}'),
  ('Slack GIF Creator', 'slack-gif-creator', 'GIF generation for Slack messaging', 'communication', 'advanced', true, '{"skill_type": "executable", "has_scripts": true}'),
  ('Web Application Testing', 'webapp-testing', 'Webapp testing patterns and strategies', 'testing', 'intermediate', true, '{"skill_type": "executable", "has_scripts": true}'),
  ('Frontend Design', 'frontend-design', 'Frontend UI/UX design principles', 'design', 'intermediate', true, '{"skill_type": "knowledge"}'),
  ('MCP Server Development', 'mcp-builder', 'MCP server building guide and best practices', 'development', 'advanced', true, '{"skill_type": "executable", "has_scripts": true}'),
  ('Brand Styling', 'brand-guidelines', 'Anthropic brand guidelines and styling', 'design', 'basic', true, '{"skill_type": "knowledge"}'),
  ('Web Artifacts Builder', 'web-artifacts-builder', 'Single-file web artifact creation', 'development', 'intermediate', true, '{"skill_type": "executable", "has_scripts": true}')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  complexity_level = EXCLUDED.complexity_level,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
```

---

## Phase 1: Pinecone Vector Loading (30-45 min)

### Task 1.1: Load Agent Embeddings

**Script**: `services/ai-engine/scripts/load_agents_to_pinecone.py`

**What it does**:
1. Fetches all 165 agents from Supabase
2. Enriches with skills, tools, knowledge domains
3. Creates comprehensive text representations
4. Generates embeddings via OpenAI (text-embedding-3-small)
5. Upserts to Pinecone index `vital-medical-agents`

**Usage**:
```bash
# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_KEY="your-service-key"
export PINECONE_API_KEY="your-pinecone-key"
export OPENAI_API_KEY="your-openai-key"

# Run script
cd services/ai-engine/scripts
python3 load_agents_to_pinecone.py

# Or dry-run to test
python3 load_agents_to_pinecone.py --dry-run
```

**Expected Output**:
- 165 agent vectors in Pinecone
- Each vector: 1536 dimensions (OpenAI text-embedding-3-small)
- Metadata: agent_id, name, description, role, department, function, agent_level

### Task 1.2: Load Skill Embeddings

**Script**: `services/ai-engine/scripts/load_skills_to_pinecone.py`

**What it does**:
1. Fetches all skills from Supabase
2. Reads SKILL.md content for rich text
3. Generates embeddings
4. Upserts to Pinecone index `vital-medical-skills`

**Expected Output**:
- 100+ skill vectors in Pinecone
- Metadata: skill_id, name, category, complexity

### Task 1.3: Load Knowledge Document Embeddings

**Script**: `services/ai-engine/scripts/load_knowledge_to_pinecone.py`

**What it does**:
1. Fetches knowledge domains from Supabase
2. Retrieves documentation files from Supabase Storage
3. Chunks documents (500-1000 tokens per chunk)
4. Generates embeddings per chunk
5. Upserts to Pinecone index `vital-medical-knowledge`

**Expected Output**:
- Thousands of knowledge chunk vectors
- Metadata: knowledge_domain_id, chunk_id, source_url

---

## Phase 2: Neo4j Graph Loading (30-45 min)

### Task 2.1: Load Agent Nodes

**Script**: `services/ai-engine/scripts/load_agents_to_neo4j.py`

**What it does**:
1. Creates 165 `Agent` nodes in Neo4j
2. Properties: id, name, description, agent_level, role, department, function

**Cypher Example**:
```cypher
MERGE (a:Agent {id: $id})
SET a.name = $name,
    a.description = $description,
    a.agent_level = $agent_level,
    a.role = $role,
    a.department = $department,
    a.function = $function
```

### Task 2.2: Load Skill Nodes

**What it does**:
1. Creates 100+ `Skill` nodes
2. Properties: id, name, category, complexity_level

### Task 2.3: Load Tool Nodes

**What it does**:
1. Creates 50+ `Tool` nodes
2. Properties: id, name, description, tool_type

### Task 2.4: Load Knowledge Nodes

**What it does**:
1. Creates knowledge domain nodes
2. Properties: id, name, description

### Task 2.5: Create Relationships

**What it does**:
1. **Agent → Skill** (`HAS_SKILL`): 1,187 relationships
2. **Agent → Tool** (`USES_TOOL`): 1,187 relationships
3. **Agent → Knowledge** (`KNOWS_ABOUT`): 884 relationships
4. **Agent → Agent** (`DELEGATES_TO`): 2,007 hierarchical relationships

**Cypher Example**:
```cypher
MATCH (a:Agent {id: $agent_id})
MATCH (s:Skill {id: $skill_id})
MERGE (a)-[r:HAS_SKILL]->(s)
SET r.proficiency = $proficiency_level
```

**Expected Output**:
- 165 Agent nodes
- 100+ Skill nodes
- 50+ Tool nodes
- Knowledge domain nodes
- ~5,000+ relationships

---

## Phase 3: KG Metadata Seeding (15 min)

### Task 3.1: Seed Node Types

**Table**: `kg_node_types`

```sql
INSERT INTO kg_node_types (name, description, schema_definition, is_active)
VALUES
  ('Agent', 'AI agent node representing a medical affairs expert', '{"properties": ["id", "name", "role", "department"]}', true),
  ('Skill', 'Skill or capability node', '{"properties": ["id", "name", "category", "complexity"]}', true),
  ('Tool', 'Tool or instrument node', '{"properties": ["id", "name", "type"]}', true),
  ('KnowledgeDomain', 'Knowledge domain or subject area', '{"properties": ["id", "name", "scope"]}', true),
  ('Drug', 'Pharmaceutical drug entity', '{"properties": ["id", "name", "indication", "manufacturer"]}', true),
  ('Disease', 'Medical condition or disease', '{"properties": ["id", "name", "icd10_code"]}', true),
  ('ClinicalTrial', 'Clinical trial or study', '{"properties": ["id", "nct_id", "phase", "status"]}', true);
```

### Task 3.2: Seed Edge Types

**Table**: `kg_edge_types`

```sql
INSERT INTO kg_edge_types (name, description, source_node_type, target_node_type, is_active)
VALUES
  ('HAS_SKILL', 'Agent has a specific skill', 'Agent', 'Skill', true),
  ('USES_TOOL', 'Agent uses a tool', 'Agent', 'Tool', true),
  ('KNOWS_ABOUT', 'Agent has knowledge about domain', 'Agent', 'KnowledgeDomain', true),
  ('DELEGATES_TO', 'Agent delegates to another agent', 'Agent', 'Agent', true),
  ('TREATS', 'Drug treats a disease', 'Drug', 'Disease', true),
  ('STUDIED_IN', 'Drug studied in clinical trial', 'Drug', 'ClinicalTrial', true);
```

### Task 3.3: Create Agent KG Views

**Table**: `agent_kg_views`

```sql
INSERT INTO agent_kg_views (agent_id, view_name, include_nodes, include_edges, max_hops, graph_limit, is_active)
SELECT 
  id AS agent_id,
  'default_view' AS view_name,
  ARRAY['Agent', 'Skill', 'Tool', 'KnowledgeDomain']::text[] AS include_nodes,
  ARRAY['HAS_SKILL', 'USES_TOOL', 'KNOWS_ABOUT', 'DELEGATES_TO']::text[] AS include_edges,
  2 AS max_hops,
  100 AS graph_limit,
  true AS is_active
FROM agents
WHERE is_active = true;
```

---

## Phase 4: Verification & Testing (15 min)

### Task 4.1: Verify Pinecone Data

**Script**: `services/ai-engine/scripts/verify_pinecone_data.py`

```python
# Verify agent embeddings
index = pinecone.Index("vital-medical-agents")
stats = index.describe_index_stats()
print(f"Total vectors: {stats['total_vector_count']}")

# Test query
results = index.query(
    vector=[0.0] * 1536,  # Dummy query
    top_k=5,
    include_metadata=True
)
print(f"Sample results: {len(results['matches'])}")
```

### Task 4.2: Verify Neo4j Data

**Script**: `services/ai-engine/scripts/verify_neo4j_data.py`

```cypher
-- Count nodes
MATCH (a:Agent) RETURN count(a) AS agent_count;
MATCH (s:Skill) RETURN count(s) AS skill_count;
MATCH (t:Tool) RETURN count(t) AS tool_count;

-- Count relationships
MATCH ()-[r:HAS_SKILL]->() RETURN count(r) AS skill_relationships;
MATCH ()-[r:USES_TOOL]->() RETURN count(r) AS tool_relationships;
MATCH ()-[r:DELEGATES_TO]->() RETURN count(r) AS hierarchy_relationships;

-- Test traversal
MATCH (a:Agent {name: 'Medical Science Liaison'})
CALL apoc.path.expandConfig(a, {
    relationshipFilter: 'HAS_SKILL|USES_TOOL',
    maxLevel: 2,
    limit: 10
})
YIELD path
RETURN path;
```

### Task 4.3: End-to-End GraphRAG Test

**Script**: `services/ai-engine/tests/graphrag/test_e2e_with_data.py`

```python
# Test full GraphRAG query with real data
response = await graphrag_service.query(
    query="Find medical science liaisons with expertise in oncology",
    agent_id=test_agent_id,
    session_id=test_session_id,
    rag_profile_id="semantic_standard"
)

assert len(response.context_chunks) > 0
assert len(response.evidence_chain) > 0
assert len(response.citations) > 0
print(f"✅ GraphRAG returned {len(response.context_chunks)} chunks")
```

---

## Execution Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| **Phase 0** | Parse skills from folder | 5 min | ✅ COMPLETE |
| | Load skills to PostgreSQL | 10 min | ⏳ PENDING |
| **Phase 1** | Load agents to Pinecone | 20 min | ⏳ PENDING |
| | Load skills to Pinecone | 10 min | ⏳ PENDING |
| | Load knowledge to Pinecone | 15 min | ⏳ PENDING |
| **Phase 2** | Load agent nodes to Neo4j | 10 min | ⏳ PENDING |
| | Load skill/tool/knowledge nodes | 10 min | ⏳ PENDING |
| | Create all relationships | 10 min | ⏳ PENDING |
| **Phase 3** | Seed KG node types | 5 min | ⏳ PENDING |
| | Seed KG edge types | 5 min | ⏳ PENDING |
| | Create agent KG views | 5 min | ⏳ PENDING |
| **Phase 4** | Verify Pinecone data | 5 min | ⏳ PENDING |
| | Verify Neo4j data | 5 min | ⏳ PENDING |
| | End-to-end GraphRAG test | 5 min | ⏳ PENDING |
| **TOTAL** | | **2 hours** | |

---

## Success Criteria

### Pinecone
- ✅ 165 agent vectors loaded
- ✅ 100+ skill vectors loaded
- ✅ Knowledge chunk vectors loaded
- ✅ All metadata fields populated
- ✅ Sample queries return relevant results

### Neo4j
- ✅ 165 Agent nodes
- ✅ 100+ Skill nodes
- ✅ 50+ Tool nodes
- ✅ 1,187+ skill relationships
- ✅ 1,187+ tool relationships
- ✅ 884+ knowledge relationships
- ✅ 2,007+ hierarchy relationships
- ✅ Graph traversal queries work

### KG Metadata
- ✅ Node types seeded (7+)
- ✅ Edge types seeded (6+)
- ✅ Agent KG views created (165)

### End-to-End
- ✅ GraphRAG query returns context chunks
- ✅ Evidence chains present
- ✅ Citations formatted correctly
- ✅ Fusion works (vector + graph)
- ✅ Reranking improves relevance

---

## Next Steps

After data loading is complete:

1. **Integrate GraphRAG into Ask Expert modes** (15 min)
   - Wire `graphrag_query_node` into mode 1-4 workflows
   - Use context in agent execution
   - Display evidence chains in UI

2. **Performance Tuning** (30 min)
   - Optimize Pinecone query parameters
   - Tune fusion weights
   - Cache frequently accessed data

3. **Documentation** (30 min)
   - Update GraphRAG docs with data loading steps
   - Add troubleshooting guide
   - Create data refresh procedures

4. **Production Deployment** (1 hour)
   - Environment variable setup
   - CI/CD pipeline integration
   - Monitoring and alerting

---

## Files Created

1. `services/ai-engine/scripts/parse_skills_from_folder.py` ✅
2. `database/data/skills/parsed_skills.json` ✅
3. `database/seeds/data/load_skills_from_folder.sql` (TODO)
4. `services/ai-engine/scripts/load_agents_to_pinecone.py` (TODO)
5. `services/ai-engine/scripts/load_skills_to_pinecone.py` (TODO)
6. `services/ai-engine/scripts/load_knowledge_to_pinecone.py` (TODO)
7. `services/ai-engine/scripts/load_agents_to_neo4j.py` (TODO)
8. `services/ai-engine/scripts/verify_pinecone_data.py` (TODO)
9. `services/ai-engine/scripts/verify_neo4j_data.py` (TODO)
10. `services/ai-engine/tests/graphrag/test_e2e_with_data.py` (TODO)

