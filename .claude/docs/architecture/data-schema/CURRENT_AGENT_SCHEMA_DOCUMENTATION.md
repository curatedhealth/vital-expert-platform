# Current Agent Schema Documentation

## Overview
Based on actual database queries and migration files, here's the complete agent schema for parent/sub-agent hierarchies.

---

## 1. AGENTS TABLE (Main Table)

### Actually Available Columns (from user's query):
```sql
-- CONFIRMED WORKING (from actual DB query):
id              UUID PRIMARY KEY (auto-generated)
name            TEXT UNIQUE NOT NULL
slug            TEXT NOT NULL                    -- ⚠️ REQUIRED! URL-friendly name
description     TEXT NOT NULL
system_prompt   TEXT NOT NULL
created_at      TIMESTAMPTZ (auto-generated)
updated_at      TIMESTAMPTZ (auto-generated)
```

### Schema Definition Says These Exist (but may have been dropped):
```sql
-- FROM MIGRATION FILE (may not all be in current DB):
display_name VARCHAR(255) NOT NULL
avatar VARCHAR(100)
color VARCHAR(7)
version VARCHAR(20) DEFAULT '1.0.0'

-- AI Configuration
model VARCHAR(50) NOT NULL DEFAULT 'gpt-4'
temperature DECIMAL(3,2) DEFAULT 0.7
max_tokens INTEGER DEFAULT 2000
rag_enabled BOOLEAN DEFAULT true
context_window INTEGER DEFAULT 8000
response_format VARCHAR(20) DEFAULT 'markdown'

-- Capabilities & Knowledge
capabilities TEXT[] NOT NULL
knowledge_domains TEXT[]
domain_expertise domain_expertise NOT NULL DEFAULT 'general'
competency_levels JSONB DEFAULT '{}'
knowledge_sources JSONB DEFAULT '{}'
tool_configurations JSONB DEFAULT '{}'

-- Business Context
business_function VARCHAR(100)
role VARCHAR(100)
tier INTEGER CHECK (tier IN (1, 2, 3))
priority INTEGER CHECK (priority >= 0 AND priority <= 999)
implementation_phase INTEGER CHECK (implementation_phase IN (1, 2, 3))

-- Relationships (OLD APPROACH - superseded by agent_hierarchies table)
parent_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL
compatible_agents UUID[]
incompatible_agents UUID[]
prerequisite_agents UUID[]

-- Operational Status
status agent_status DEFAULT 'development'
validation_status validation_status DEFAULT 'pending'
```

### ⚠️ IMPORTANT NOTES:
1. **User's actual query showed only 6 columns** (id, name, slug, description, system_prompt, created_at, updated_at)
2. **Many columns from migration may have been dropped** via ALTER TABLE statements
3. **We must query the DB to confirm** before using any columns beyond the 6 confirmed ones

---

## 2. AGENT_HIERARCHIES TABLE (Parent-Child Relationships)

### Schema (CONFIRMED from migration file):
```sql
CREATE TABLE agent_hierarchies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ✅ CORE RELATIONSHIP
    parent_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    child_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- ✅ RELATIONSHIP TYPE
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'delegates_to',        -- Parent delegates work to child
        'supervises',          -- Parent supervises child's work
        'collaborates_with',   -- Peers working together
        'consults',            -- Parent consults child for expertise
        'escalates_to'         -- Child escalates to parent
    )),
    
    -- ✅ DELEGATION RULES
    delegation_trigger TEXT,                    -- Plain text: when to delegate
    auto_delegate BOOLEAN DEFAULT false,        -- Automatic vs manual delegation
    confidence_threshold NUMERIC(3,2),          -- Min confidence (0.0-1.0)
    
    -- ✅ TIMESTAMPS
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- ✅ CONSTRAINTS
    CONSTRAINT no_self_hierarchy CHECK (parent_agent_id != child_agent_id),
    UNIQUE(parent_agent_id, child_agent_id, relationship_type)
);
```

### Relationship Types Explained:

1. **`delegates_to`** - PRIMARY hierarchy pattern
   - Parent is director/lead who delegates specialized work
   - Example: "Director of Analytics" → "RWE Analyst"
   - `auto_delegate = true` for automatic routing

2. **`supervises`** - Management oversight
   - Parent oversees child's work quality
   - Example: "Regional Director" → "MSL Team"
   - `auto_delegate = false` (manual review)

3. **`collaborates_with`** - SHARED sub-agents (peer relationship)
   - Agents work together as equals
   - Example: "Biostatistician" ↔ "Epidemiologist"
   - `auto_delegate = false`

4. **`consults`** - Expert consultation
   - Parent consults child for specialized expertise
   - Example: "Medical Affairs Strategist" → "TA Expert"
   - `auto_delegate = false`

5. **`escalates_to`** - Escalation path
   - Child escalates complex cases to parent
   - Example: "MSL" → "Regional Director"
   - `auto_delegate = true` when confidence < threshold

---

## 3. RELATED TABLES (from AgentOS 2.0/3.0)

### Tables That SHOULD Exist (need to verify):

#### a) **agent_skills** (many-to-many)
```sql
-- Links agents to skills
agent_id UUID REFERENCES agents(id)
skill_id UUID REFERENCES skills(id)
proficiency_level TEXT
```

#### b) **agent_tools** (many-to-many)
```sql
-- Links agents to tools they can use
agent_id UUID REFERENCES agents(id)
tool_id UUID REFERENCES tools(id)
```

#### c) **agent_knowledge** (many-to-many)
```sql
-- Links agents to knowledge domains
agent_id UUID REFERENCES agents(id)
knowledge_domain_id UUID REFERENCES knowledge_domains(id)
```

#### d) **agent_graphs** (from AgentOS 2.0)
```sql
-- LangGraph workflow definitions
id UUID PRIMARY KEY
name TEXT
description TEXT
graph_type TEXT ('sequential', 'parallel', 'conditional')
```

#### e) **agent_graph_nodes** (from AgentOS 2.0)
```sql
-- Nodes in agent graphs
id UUID PRIMARY KEY
graph_id UUID REFERENCES agent_graphs(id)
agent_id UUID REFERENCES agents(id)
node_type TEXT ('agent', 'skill', 'panel', 'router', 'tool', 'human')
role_id UUID REFERENCES agent_node_roles(id)
execution_order INTEGER
```

#### f) **rag_profiles** (from Phase 1 - GraphRAG)
```sql
-- RAG strategy configurations
id UUID PRIMARY KEY
name TEXT ('semantic_standard', 'hybrid_enhanced', 'graphrag_entity', 'agent_optimized')
vector_weight NUMERIC
keyword_weight NUMERIC
graph_weight NUMERIC
```

#### g) **agent_rag_policies** (from Phase 1)
```sql
-- Agent-specific RAG overrides
agent_id UUID REFERENCES agents(id)
rag_profile_id UUID REFERENCES rag_profiles(id)
agent_specific_top_k INTEGER
agent_specific_threshold NUMERIC
```

#### h) **agent_kg_views** (from Phase 1)
```sql
-- Agent-specific knowledge graph filters
agent_id UUID REFERENCES agents(id)
include_nodes UUID[] REFERENCES kg_node_types(id)
include_edges UUID[] REFERENCES kg_edge_types(id)
max_hops INTEGER
graph_limit INTEGER
```

---

## 4. HIERARCHY PATTERNS

### Pattern 1: Single Parent → Multiple Children (PRIMARY)
```
Director of Medical Analytics (Parent)
├── Real-World Evidence Analyst (Child)
├── Clinical Data Scientist (Child)
├── Market Insights Analyst (Child)
└── HCP Engagement Analytics Specialist (Child)

Relationship: delegates_to
Auto-delegate: true
Confidence: 0.75
```

### Pattern 2: Shared Sub-Agent (Multiple Parents)
```
Parent 1: Director of Analytics
    └── delegates_to → Biostatistician

Parent 2: Head of Clinical Operations  
    └── collaborates_with → Biostatistician

Parent 3: Publication Strategy Lead
    └── consults → Biostatistician

RESULT: 3 separate rows in agent_hierarchies for same child
```

### Pattern 3: Escalation Chain
```
MSL (Child)
    └── escalates_to → Regional Director (Parent)
        └── escalates_to → VP of Field Medical (Grandparent)
```

---

## 5. CURRENT DATABASE STATE

### ✅ Confirmed Working:
- `agents` table exists (simplified: 6 columns)
- `agent_hierarchies` table exists (full schema from Phase 3)
- 5 Analytics agents already seeded
- 4 hierarchical relationships already created

### ⚠️ Need to Verify:
- Exact columns available in `agents` table
- Existence of `agent_skills`, `agent_tools`, `agent_knowledge` tables
- Existence of `agent_graphs`, `agent_graph_nodes` tables
- Existence of `rag_profiles`, `agent_rag_policies`, `agent_kg_views` tables

---

## 6. RECOMMENDED VERIFICATION STEPS

**Run this diagnostic query:**
```sql
-- File: complete_agent_schema_check.sql (already created)
```

This will show:
1. Exact columns in `agents` table
2. Exact columns in `agent_hierarchies` table
3. All agent-related tables
4. Current agents in DB
5. Current hierarchies
6. Related tables (skills, tools, knowledge, graphs, RAG)

---

## 7. SEED FILE REQUIREMENTS

Based on CONFIRMED schema, our seed files must use:

### Minimum Required Columns (SAFE):
```sql
INSERT INTO agents (
    name,           -- ✅ Required
    slug,           -- ✅ Required (URL-friendly)
    description,    -- ✅ Required
    system_prompt   -- ✅ Required
) VALUES (...);
```

### If Schema Check Confirms These Exist:
```sql
INSERT INTO agents (
    name,
    slug,
    display_name,    -- If exists
    description,
    system_prompt,
    model,           -- If exists
    capabilities     -- If exists (TEXT[])
) VALUES (...);
```

### For Hierarchies (CONFIRMED WORKING):
```sql
INSERT INTO agent_hierarchies (
    parent_agent_id,
    child_agent_id,
    relationship_type,      -- 'delegates_to', 'collaborates_with', etc.
    delegation_trigger,     -- Text description
    auto_delegate,          -- true/false
    confidence_threshold    -- 0.0-1.0
) VALUES (...);
```

---

## NEXT STEPS

1. ✅ **Run `complete_agent_schema_check.sql`** to confirm exact schema
2. ✅ **Share results** with me
3. ✅ **Create seed files** using only confirmed columns
4. ✅ **Test with 1-2 agents first** before bulk seeding
5. ✅ **Proceed with full 35-agent seed** once validated

---

**Please run the diagnostic SQL file and share the results so we can proceed safely!** 🎯

