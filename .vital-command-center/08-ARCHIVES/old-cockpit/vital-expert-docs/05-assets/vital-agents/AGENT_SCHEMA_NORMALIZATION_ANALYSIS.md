# Agent Schema Normalization Analysis

**Date:** 2025-11-17
**Purpose:** Design proper normalized schema for agents following DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md
**Reference:** `/sql/seeds/TEMPLATES/json_templates/MEDICAL_AFFAIRS_EXAMPLE_FILLED.json`

---

## Golden Rules Violations in Current Approach

### ❌ Violation #1: JSONB for Structured Data
**Problem:**
```sql
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS metadata JSONB;  -- WRONG!
```

**In metadata JSONB we were storing:**
- `gold_standard` (boolean)
- `version` (text)
- `performance_metrics` (object with total_queries, success_rate, avg_confidence)
- `created_at`, `updated_at` (timestamps)

**Why it's wrong:**
- Cannot enforce constraints on nested data
- Cannot index individual fields efficiently
- Violates normalization principles
- Foreign keys cannot reference JSONB nested values

### ❌ Violation #2: TEXT[] Without Considering Metadata Needs
**Problem:**
```sql
ALTER TABLE agents
ADD COLUMN capabilities TEXT[];      -- May need metadata!
ADD COLUMN domain_expertise TEXT[];  -- May need metadata!
ADD COLUMN tools TEXT[];              -- Definitely needs metadata!
```

**Questions to answer:**
1. Do capabilities need metadata? (proficiency_level, years_experience, is_primary?)
2. Do domain_expertise areas need metadata? (certification_level, years_experience, specialty_focus?)
3. Do tools need metadata? (usage_frequency, proficiency, satisfaction?) → **YES, definitely!**

---

## Analysis: Agents vs Personas Structure

### Personas Template Pattern (CORRECT normalization)

**Main table:**
```json
{
  "name": "Dr. Jennifer Martinez",
  "slug": "dr-jennifer-martinez-msl-oncology",
  "title": "Medical Science Liaison, Oncology",
  // Scalar fields in main table
}
```

**Normalized child tables for arrays with metadata:**

1. **persona_goals** - goals array → separate table
   - Fields: goal, type, priority, timeframe
   - ✅ Each goal has metadata

2. **persona_pain_points** - pain_points array → separate table
   - Fields: pain_point, category, severity, frequency
   - ✅ Each pain point has metadata

3. **persona_challenges** - challenges array → separate table
   - Fields: challenge, type, impact
   - ✅ Each challenge has metadata

4. **persona_tools** - tools array → separate table
   - Fields: tool, category, usage_frequency, proficiency, satisfaction
   - ✅ Each tool has rich metadata

5. **persona_responsibilities** - responsibilities array → separate table
   - Fields: responsibility, time_allocation
   - ✅ Each responsibility has metadata

### Agents Equivalent Structure

**Main `agents` table (scalar fields only):**
- id (UUID)
- tenant_id (UUID FK)
- name (TEXT)
- slug (TEXT)
- title (TEXT)
- tier (INTEGER 1-5)
- specialization (TEXT)
- description (TEXT)
- system_prompt (TEXT)
- base_model (TEXT)
- model (TEXT) - specific model override
- temperature (DECIMAL)
- max_tokens (INTEGER)
- is_active (BOOLEAN)
- gold_standard (BOOLEAN) - **FLATTENED from metadata**
- version (TEXT) - **FLATTENED from metadata**
- total_queries (INTEGER) - **FLATTENED from metadata.performance_metrics**
- success_rate (DECIMAL) - **FLATTENED from metadata.performance_metrics**
- avg_confidence (DECIMAL) - **FLATTENED from metadata.performance_metrics**
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- deleted_at (TIMESTAMPTZ)

**Normalized child tables:**

1. **agent_capabilities** - capabilities with metadata
   - id (UUID PK)
   - agent_id (UUID FK → agents)
   - tenant_id (UUID FK → tenants)
   - capability_name (TEXT)
   - proficiency_level (TEXT) - beginner, intermediate, advanced, expert
   - is_primary (BOOLEAN) - is this a primary capability?
   - usage_frequency (TEXT) - daily, weekly, monthly
   - confidence_score (DECIMAL 0-1) - how confident is agent in this capability?
   - created_at (TIMESTAMPTZ)
   - UNIQUE(agent_id, capability_name)

2. **agent_domain_expertise** - domain expertise with metadata
   - id (UUID PK)
   - agent_id (UUID FK → agents)
   - tenant_id (UUID FK → tenants)
   - domain_name (TEXT)
   - proficiency_level (TEXT) - beginner, intermediate, advanced, expert
   - years_experience (INTEGER) - simulated years of "training"
   - is_primary_domain (BOOLEAN)
   - certification_level (TEXT) - basic, certified, expert
   - specialty_focus (TEXT) - specific area within domain
   - created_at (TIMESTAMPTZ)
   - UNIQUE(agent_id, domain_name)

3. **agent_tools** - tools available to agent with metadata
   - id (UUID PK)
   - agent_id (UUID FK → agents)
   - tenant_id (UUID FK → tenants)
   - tool_name (TEXT) - write_todos, delegate_task, spawn_specialist, etc.
   - tool_category (TEXT) - planning, execution, search, analysis
   - usage_frequency (TEXT) - always, frequent, occasional, rare
   - proficiency (TEXT) - basic, intermediate, advanced, expert
   - is_required (BOOLEAN) - must agent have this tool?
   - parameters (JSONB) - **EXCEPTION: Tool-specific config that varies per tool**
   - created_at (TIMESTAMPTZ)
   - UNIQUE(agent_id, tool_name)

4. **agent_embeddings** - separate table for vector embeddings
   - id (UUID PK)
   - agent_id (UUID FK → agents) UNIQUE
   - tenant_id (UUID FK → tenants)
   - embedding_model (TEXT) - text-embedding-3-large
   - embedding_dimensions (INTEGER) - 3072
   - embedding_vector (vector(3072))
   - source_text (TEXT) - what text was embedded
   - created_at (TIMESTAMPTZ)
   - updated_at (TIMESTAMPTZ)

5. **agent_performance_metrics** - time-series performance data
   - id (UUID PK)
   - agent_id (UUID FK → agents)
   - tenant_id (UUID FK → tenants)
   - metric_date (DATE)
   - queries_count (INTEGER)
   - success_count (INTEGER)
   - failure_count (INTEGER)
   - avg_confidence (DECIMAL)
   - avg_latency_ms (INTEGER)
   - created_at (TIMESTAMPTZ)
   - UNIQUE(agent_id, metric_date)

6. **agent_collaborations** - track which agents work together
   - id (UUID PK)
   - agent_id (UUID FK → agents)
   - collaborator_agent_id (UUID FK → agents)
   - tenant_id (UUID FK → tenants)
   - collaboration_count (INTEGER)
   - last_collaboration_at (TIMESTAMPTZ)
   - success_rate (DECIMAL)
   - created_at (TIMESTAMPTZ)
   - updated_at (TIMESTAMPTZ)
   - UNIQUE(agent_id, collaborator_agent_id)

---

## Decision Matrix: TEXT[] vs Normalized Table

| Field | Current Plan | Metadata Needed? | Decision | Rationale |
|-------|--------------|------------------|----------|-----------|
| `capabilities` | TEXT[] | YES - proficiency, frequency, confidence | **Normalized table** | Need to track how good agent is at each capability |
| `domain_expertise` | TEXT[] | YES - proficiency, years, certification | **Normalized table** | Need to track depth of expertise per domain |
| `tools` | TEXT[] | YES - frequency, proficiency, required | **Normalized table** | Follows persona_tools pattern exactly |
| `tags` | TEXT[] | NO - simple keywords | **TEXT[] OK** | Simple string list, no metadata |
| `specializations` | TEXT[] | NO - simple list | **TEXT[] OK** | Simple string list |

### Key Insight from Personas Template

The template uses **normalized tables for EVERYTHING with metadata**:
- ✅ `persona_tools` has: tool, category, usage_frequency, proficiency, satisfaction
- ✅ `persona_goals` has: goal, type, priority, timeframe
- ✅ `persona_pain_points` has: pain_point, category, severity, frequency

**We should do the same for agents!**

---

## Recommended Final Schema

### Core Tables

```sql
-- ============================================================================
-- AGENTS - Main table (scalar fields only)
-- ============================================================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,
    tagline TEXT,
    description TEXT,

    -- Hierarchy
    tier INTEGER CHECK (tier >= 1 AND tier <= 5),
    specialization TEXT,

    -- Foreign keys
    role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,

    -- LLM Configuration
    system_prompt TEXT NOT NULL,
    base_model TEXT DEFAULT 'gpt-4',
    model TEXT, -- Override model for this specific agent
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER CHECK (max_tokens > 0),

    -- Quality Flags (FLATTENED from metadata)
    gold_standard BOOLEAN DEFAULT false NOT NULL,
    version TEXT DEFAULT '1.0',
    validation_status TEXT CHECK (validation_status IN ('draft', 'review', 'validated', 'published')),

    -- Performance Metrics (FLATTENED from metadata)
    total_queries INTEGER DEFAULT 0,
    total_successes INTEGER DEFAULT 0,
    total_failures INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4), -- Calculated: total_successes / total_queries
    avg_confidence DECIMAL(3,2), -- Average confidence score

    -- Simple TEXT[] for tags only (no metadata)
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Status
    is_active BOOLEAN DEFAULT true NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'deprecated', 'maintenance')),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    UNIQUE(tenant_id, slug),

    -- Gold standard validation
    CONSTRAINT gold_standard_requirements CHECK (
        gold_standard = false OR (
            tier IS NOT NULL AND
            length(system_prompt) >= 500
        )
    )
);

-- Indexes
CREATE INDEX idx_agents_tenant ON agents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_tier ON agents(tier) WHERE tier IS NOT NULL;
CREATE INDEX idx_agents_gold_standard ON agents(gold_standard) WHERE gold_standard = true;
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX idx_agents_slug ON agents(slug);

-- RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_agents ON agents
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================================================
-- AGENT_CAPABILITIES - Normalized capabilities with metadata
-- ============================================================================
CREATE TABLE agent_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    capability_name TEXT NOT NULL,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_primary BOOLEAN DEFAULT false,
    usage_frequency TEXT CHECK (usage_frequency IN ('always', 'frequent', 'occasional', 'rare')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_capability UNIQUE(agent_id, capability_name)
);

CREATE INDEX idx_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX idx_capabilities_primary ON agent_capabilities(is_primary) WHERE is_primary = true;
CREATE INDEX idx_capabilities_proficiency ON agent_capabilities(proficiency_level);

ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_capabilities ON agent_capabilities
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================================================
-- AGENT_DOMAIN_EXPERTISE - Normalized domains with metadata
-- ============================================================================
CREATE TABLE agent_domain_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    domain_name TEXT NOT NULL,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER CHECK (years_experience >= 0),
    is_primary_domain BOOLEAN DEFAULT false,
    certification_level TEXT CHECK (certification_level IN ('basic', 'certified', 'expert')),
    specialty_focus TEXT, -- Specific area within domain

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_domain UNIQUE(agent_id, domain_name)
);

CREATE INDEX idx_domain_expertise_agent ON agent_domain_expertise(agent_id);
CREATE INDEX idx_domain_expertise_primary ON agent_domain_expertise(is_primary_domain) WHERE is_primary_domain = true;
CREATE INDEX idx_domain_expertise_proficiency ON agent_domain_expertise(proficiency_level);

ALTER TABLE agent_domain_expertise ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_domain_expertise ON agent_domain_expertise
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================================================
-- AGENT_TOOLS - Normalized tools with metadata
-- ============================================================================
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    tool_name TEXT NOT NULL,
    tool_category TEXT CHECK (tool_category IN ('planning', 'execution', 'search', 'analysis', 'communication')),
    usage_frequency TEXT CHECK (usage_frequency IN ('always', 'frequent', 'occasional', 'rare')),
    proficiency TEXT CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_required BOOLEAN DEFAULT false,

    -- EXCEPTION: Tool parameters vary per tool type, JSONB acceptable here
    parameters JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_tool UNIQUE(agent_id, tool_name)
);

CREATE INDEX idx_agent_tools_agent ON agent_tools(agent_id);
CREATE INDEX idx_agent_tools_required ON agent_tools(is_required) WHERE is_required = true;
CREATE INDEX idx_agent_tools_category ON agent_tools(tool_category);

ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_agent_tools ON agent_tools
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================================================
-- AGENT_EMBEDDINGS - Vector embeddings (separate for large data)
-- ============================================================================
CREATE TABLE agent_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-large',
    embedding_dimensions INTEGER NOT NULL DEFAULT 3072,
    embedding_vector vector(3072),
    source_text TEXT, -- What was embedded

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_embeddings_agent ON agent_embeddings(agent_id);
CREATE INDEX idx_embeddings_vector ON agent_embeddings
    USING ivfflat (embedding_vector vector_cosine_ops)
    WITH (lists = 100);

ALTER TABLE agent_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_embeddings ON agent_embeddings
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================================================
-- AGENT_PERFORMANCE_METRICS - Time-series performance data
-- ============================================================================
CREATE TABLE agent_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    queries_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    avg_confidence DECIMAL(3,2),
    avg_latency_ms INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_metric_date UNIQUE(agent_id, metric_date)
);

CREATE INDEX idx_performance_metrics_agent ON agent_performance_metrics(agent_id);
CREATE INDEX idx_performance_metrics_date ON agent_performance_metrics(metric_date);

ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_performance ON agent_performance_metrics
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================================================
-- AGENT_COLLABORATIONS - Track agent co-occurrence
-- ============================================================================
CREATE TABLE agent_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    collaborator_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    collaboration_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_collaboration_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_collaboration UNIQUE(agent_id, collaborator_agent_id),
    CONSTRAINT different_agents CHECK (agent_id != collaborator_agent_id)
);

CREATE INDEX idx_collaborations_agent ON agent_collaborations(agent_id);
CREATE INDEX idx_collaborations_collaborator ON agent_collaborations(collaborator_agent_id);

ALTER TABLE agent_collaborations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_collaborations ON agent_collaborations
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

---

## Migration Strategy

### Phase 1: Create New Normalized Tables
1. Create `agent_capabilities` table
2. Create `agent_domain_expertise` table
3. Create `agent_tools` table
4. Create `agent_embeddings` table
5. Create `agent_performance_metrics` table
6. Create `agent_collaborations` table

### Phase 2: Flatten JSONB in `agents` Table
1. Add columns: `gold_standard`, `version`, `total_queries`, `success_rate`, `avg_confidence`
2. Add column: `tier` (INTEGER)
3. Add column: `specialization` (TEXT)
4. Add column: `model` (TEXT)
5. Remove `metadata` JSONB column (after data migration)

### Phase 3: Data Migration
1. For each agent, extract capabilities → insert into `agent_capabilities`
2. For each agent, extract domain_expertise → insert into `agent_domain_expertise`
3. For each agent, extract tools → insert into `agent_tools`
4. For each agent, extract embedding → insert into `agent_embeddings`
5. Flatten metadata JSONB into agent columns

### Phase 4: Update Enhancement Tool
1. Modify to insert into normalized tables instead of TEXT[]
2. Update queries to JOIN related tables
3. Update GraphRAG to query across normalized tables

---

## Benefits of Normalized Approach

### vs TEXT[] Arrays:
✅ Can track proficiency level per capability
✅ Can query "Show me agents expert in FDA regulations"
✅ Can filter by usage frequency
✅ Can track confidence scores
✅ Can add new metadata fields without schema changes

### vs JSONB:
✅ Enforced constraints on all fields
✅ Efficient indexing on individual fields
✅ Foreign key relationships work
✅ Standard SQL queries (no JSON path operations)
✅ Type safety

### Follows Personas Pattern:
✅ Same structure as `persona_tools`, `persona_goals`, etc.
✅ Consistent with existing codebase patterns
✅ Easier for developers to understand

---

## Next Steps

1. ✅ Complete this analysis
2. Create normalized migration SQL
3. Update enhancement tool to use normalized tables
4. Test with sample agents
5. Execute full migration

---

**Conclusion:** Follow DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md strictly - normalize all arrays with metadata into separate tables, flatten all JSONB into columns.
