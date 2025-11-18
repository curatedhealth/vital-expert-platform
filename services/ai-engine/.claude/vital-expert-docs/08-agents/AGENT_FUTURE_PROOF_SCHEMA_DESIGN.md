# Future-Proof Agent Schema Design

**Date:** 2025-11-17
**Version:** 2.0
**Compliance:** DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md ✅

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────┐                                                 │
│  │  AGENTS   │ (Main entity)                                   │
│  └─────┬─────┘                                                 │
│        │                                                        │
│        ├───────► CAPABILITIES (via agent_capabilities)         │
│        │            │                                           │
│        │            └───► SKILLS (via capability_skills)       │
│        │                                                        │
│        └───────► SKILLS (via agent_skills, direct link)        │
│                                                                 │
│  Key Relationships:                                            │
│  • Agents → Capabilities (M:M with metadata)                   │
│  • Agents → Skills (M:M with metadata, direct)                 │
│  • Capabilities → Skills (M:M, shows which skills support cap) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Entity Relationship Diagram

```
┌────────────────┐
│    agents      │
│  (main table)  │
└────────┬───────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
┌─────────────────┐   ┌──────────────────┐
│agent_capabilities│   │  agent_skills    │
│  (junction +     │   │  (junction +     │
│   metadata)      │   │   metadata)      │
└────────┬────────┘   └────────┬─────────┘
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│  capabilities   │   │     skills       │
│  (lookup table) │   │  (lookup table)  │
└────────┬────────┘   └──────────────────┘
         │
         ▼
┌─────────────────┐
│capability_skills│
│  (junction)     │
└────────┬────────┘
         │
         └──────────────► skills
```

---

## Complete Schema Design

### 1. Core Entity Tables

#### 1.1 `agents` - Main Entity

```sql
-- ============================================================================
-- AGENTS - Main entity table (scalar fields only, fully normalized)
-- ============================================================================
CREATE TABLE agents (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity & Metadata
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,
    tagline TEXT,
    description TEXT NOT NULL,

    -- Hierarchy (5-level deep architecture)
    tier INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 5),
    specialization TEXT,
    parent_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

    -- Foreign Keys to Organizational Structure
    role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,

    -- LLM Configuration
    system_prompt TEXT NOT NULL CHECK (length(system_prompt) >= 100),
    base_model TEXT NOT NULL DEFAULT 'gpt-4',
    model_override TEXT, -- Specific model for this agent (overrides base_model)
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER CHECK (max_tokens > 0),
    top_p DECIMAL(3,2) CHECK (top_p >= 0 AND top_p <= 1),
    frequency_penalty DECIMAL(3,2) CHECK (frequency_penalty >= -2 AND frequency_penalty <= 2),
    presence_penalty DECIMAL(3,2) CHECK (presence_penalty >= -2 AND presence_penalty <= 2),

    -- Quality & Versioning (FLATTENED - no JSONB!)
    gold_standard BOOLEAN DEFAULT false NOT NULL,
    version TEXT DEFAULT '1.0' NOT NULL,
    validation_status TEXT CHECK (validation_status IN ('draft', 'review', 'validated', 'published', 'deprecated')),
    validated_by UUID REFERENCES auth.users(id),
    validated_at TIMESTAMPTZ,

    -- Performance Metrics (FLATTENED - no JSONB!)
    total_queries INTEGER DEFAULT 0 CHECK (total_queries >= 0),
    total_successes INTEGER DEFAULT 0 CHECK (total_successes >= 0),
    total_failures INTEGER DEFAULT 0 CHECK (total_failures >= 0),
    success_rate DECIMAL(5,4) GENERATED ALWAYS AS (
        CASE WHEN total_queries > 0
        THEN total_successes::DECIMAL / total_queries
        ELSE 0 END
    ) STORED,
    avg_confidence DECIMAL(3,2) CHECK (avg_confidence >= 0 AND avg_confidence <= 1),
    avg_latency_ms INTEGER CHECK (avg_latency_ms >= 0),

    -- Spawning Configuration (for Tier 1-2 agents)
    can_spawn_sub_agents BOOLEAN DEFAULT false,
    max_concurrent_sub_agents INTEGER DEFAULT 0 CHECK (max_concurrent_sub_agents >= 0),
    sub_agent_timeout_ms INTEGER DEFAULT 30000 CHECK (sub_agent_timeout_ms > 0),

    -- Simple Arrays (ONLY for simple strings without metadata)
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Status & Audit
    is_active BOOLEAN DEFAULT true NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'maintenance', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    UNIQUE(tenant_id, slug),

    -- Gold Standard Requirements
    CONSTRAINT gold_standard_requirements CHECK (
        gold_standard = false OR (
            tier IS NOT NULL AND
            length(system_prompt) >= 500 AND
            version IS NOT NULL AND
            validation_status = 'validated'
        )
    ),

    -- Tier-specific constraints
    CONSTRAINT tier_spawning_rules CHECK (
        (tier >= 3) OR (tier <= 2 AND can_spawn_sub_agents = true)
    )
);

-- Indexes
CREATE INDEX idx_agents_tenant ON agents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_parent ON agents(parent_agent_id);
CREATE INDEX idx_agents_gold_standard ON agents(gold_standard) WHERE gold_standard = true;
CREATE INDEX idx_agents_status ON agents(status) WHERE status = 'active';
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX idx_agents_keywords ON agents USING GIN(keywords);

-- Full-text search (for agent discovery)
ALTER TABLE agents ADD COLUMN search_vector tsvector;

CREATE INDEX idx_agents_search ON agents USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_agent_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.specialization, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.keywords, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_search_vector_update
    BEFORE INSERT OR UPDATE OF name, description, specialization, tags, keywords ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_search_vector();

-- RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_agents ON agents
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

COMMENT ON TABLE agents IS 'Main agent entity table - fully normalized, no JSONB for structured data';
```

---

### 2. Capabilities System (Normalized)

#### 2.1 `capabilities` - Lookup Table

```sql
-- ============================================================================
-- CAPABILITIES - Lookup table of all available capabilities
-- ============================================================================
CREATE TABLE capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity
    capability_name TEXT NOT NULL UNIQUE,
    capability_slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Categorization
    category TEXT NOT NULL CHECK (category IN (
        'regulatory',
        'clinical',
        'market_access',
        'technical_cmc',
        'strategic',
        'operational',
        'analytical',
        'communication'
    )),
    subcategory TEXT,

    -- Complexity & Requirements
    complexity_level TEXT CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    required_model TEXT, -- Minimum model needed (gpt-3.5-turbo, gpt-4, etc.)
    estimated_tokens INTEGER, -- Estimated token usage

    -- Documentation
    usage_example TEXT,
    best_practices TEXT,
    common_pitfalls TEXT,

    -- Metadata
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_deprecated BOOLEAN DEFAULT false,
    deprecated_reason TEXT,
    replacement_capability_id UUID REFERENCES capabilities(id),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_capabilities_category ON capabilities(category);
CREATE INDEX idx_capabilities_slug ON capabilities(capability_slug);
CREATE INDEX idx_capabilities_active ON capabilities(is_active) WHERE is_active = true;

COMMENT ON TABLE capabilities IS 'Lookup table of all capabilities - defines what agents CAN do';

-- Sample capabilities
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level) VALUES
('fda_510k_submission', 'fda-510k-submission', 'FDA 510(k) Submission', 'Expertise in FDA 510(k) premarket notification pathway including predicate selection, substantial equivalence, and submission preparation', 'regulatory', 'advanced'),
('clinical_endpoint_selection', 'clinical-endpoint-selection', 'Clinical Endpoint Selection', 'Selection and justification of primary and secondary endpoints for clinical trials', 'clinical', 'expert'),
('hta_value_dossier', 'hta-value-dossier', 'HTA Value Dossier Creation', 'Creation of health technology assessment value dossiers for reimbursement submissions', 'market_access', 'advanced'),
('regulatory_orchestration', 'regulatory-orchestration', 'Regulatory Strategy Orchestration', 'High-level orchestration of regulatory strategies across multiple jurisdictions', 'regulatory', 'expert'),
('sub_agent_spawning', 'sub-agent-spawning', 'Sub-Agent Spawning', 'Ability to dynamically spawn specialist sub-agents for complex tasks', 'operational', 'expert');
```

#### 2.2 `agent_capabilities` - Junction Table with Metadata

```sql
-- ============================================================================
-- AGENT_CAPABILITIES - M:M relationship with metadata
-- ============================================================================
CREATE TABLE agent_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Proficiency & Usage
    proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_primary_capability BOOLEAN DEFAULT false,
    usage_frequency TEXT CHECK (usage_frequency IN ('always', 'frequent', 'occasional', 'rare')),

    -- Performance Metrics
    times_used INTEGER DEFAULT 0 CHECK (times_used >= 0),
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    avg_confidence DECIMAL(3,2) CHECK (avg_confidence >= 0 AND avg_confidence <= 1),
    last_used_at TIMESTAMPTZ,

    -- Training & Validation
    training_examples_count INTEGER DEFAULT 0,
    validated_by UUID REFERENCES auth.users(id),
    validated_at TIMESTAMPTZ,
    validation_notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_capability UNIQUE(agent_id, capability_id)
);

CREATE INDEX idx_agent_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX idx_agent_capabilities_capability ON agent_capabilities(capability_id);
CREATE INDEX idx_agent_capabilities_primary ON agent_capabilities(is_primary_capability) WHERE is_primary_capability = true;
CREATE INDEX idx_agent_capabilities_proficiency ON agent_capabilities(proficiency_level);

ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_agent_capabilities ON agent_capabilities
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

COMMENT ON TABLE agent_capabilities IS 'Junction table linking agents to capabilities with proficiency metadata';
```

---

### 3. Skills System (Claude Skills)

#### 3.1 `skills` - Lookup Table

```sql
-- ============================================================================
-- SKILLS - Claude Code skills lookup table
-- ============================================================================
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity
    skill_name TEXT NOT NULL UNIQUE,
    skill_slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Skill Type
    skill_type TEXT NOT NULL CHECK (skill_type IN (
        'built_in',      -- Built-in Claude Code skill
        'custom',        -- Custom skill created for this project
        'mcp',           -- MCP (Model Context Protocol) skill
        'langchain',     -- LangChain tool wrapper
        'function'       -- Function calling tool
    )),

    -- Categorization
    category TEXT NOT NULL CHECK (category IN (
        'planning',          -- Task decomposition, write_todos
        'delegation',        -- Delegate tasks to sub-agents
        'search',            -- Search knowledge bases, databases
        'analysis',          -- Data analysis, statistical operations
        'generation',        -- Content/code generation
        'validation',        -- Validation and quality checks
        'communication',     -- External communication
        'data_retrieval',    -- Database queries, API calls
        'file_operations',   -- File read/write operations
        'execution'          -- Execute code/scripts
    )),
    subcategory TEXT,

    -- Technical Configuration
    invocation_method TEXT NOT NULL CHECK (invocation_method IN (
        'skill_command',     -- Invoked via Skill tool
        'function_call',     -- Direct function call
        'slash_command',     -- Slash command
        'tool_use'           -- Tool use pattern
    )),
    skill_path TEXT,         -- Path to skill file (e.g., .claude/skills/my-skill.md)
    function_signature TEXT, -- Function signature if applicable
    parameters_schema JSONB, -- JSON schema for parameters (EXCEPTION: varies by skill)

    -- Requirements
    required_model TEXT,     -- Minimum model (e.g., 'gpt-4')
    required_extensions TEXT[], -- Required extensions/packages
    requires_auth BOOLEAN DEFAULT false,
    requires_network BOOLEAN DEFAULT false,

    -- Documentation
    usage_example TEXT,
    best_practices TEXT,
    limitations TEXT,

    -- Metadata
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_experimental BOOLEAN DEFAULT false,
    is_deprecated BOOLEAN DEFAULT false,
    deprecated_reason TEXT,
    replacement_skill_id UUID REFERENCES skills(id),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_type ON skills(skill_type);
CREATE INDEX idx_skills_slug ON skills(skill_slug);
CREATE INDEX idx_skills_active ON skills(is_active) WHERE is_active = true;

COMMENT ON TABLE skills IS 'Lookup table of all Claude Code skills and custom tools';

-- Sample skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method) VALUES
('write_todos', 'write-todos', 'Write Todos', 'Decompose complex tasks into actionable sub-tasks', 'custom', 'planning', 'function_call'),
('delegate_task', 'delegate-task', 'Delegate Task', 'Delegate sub-tasks to specialist sub-agents', 'custom', 'delegation', 'function_call'),
('spawn_specialist', 'spawn-specialist', 'Spawn Specialist', 'Dynamically spawn specialist sub-agent for specific domain', 'custom', 'execution', 'function_call'),
('search_agents', 'search-agents', 'Search Agents', 'Search for agents by capability, domain, or keywords using GraphRAG', 'custom', 'search', 'function_call'),
('regulatory_database_search', 'regulatory-database-search', 'Regulatory Database Search', 'Search FDA, EMA, PMDA regulatory databases', 'custom', 'data_retrieval', 'function_call'),
('clinical_trial_lookup', 'clinical-trial-lookup', 'Clinical Trial Lookup', 'Look up clinical trial data from ClinicalTrials.gov', 'custom', 'data_retrieval', 'function_call'),
('generate_submission_template', 'generate-submission-template', 'Generate Submission Template', 'Generate regulatory submission templates (510k, PMA, etc.)', 'custom', 'generation', 'function_call');
```

#### 3.2 `agent_skills` - Direct Agent-Skill Relationship

```sql
-- ============================================================================
-- AGENT_SKILLS - Direct M:M relationship (agent can have skills not tied to capabilities)
-- ============================================================================
CREATE TABLE agent_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Usage Configuration
    usage_frequency TEXT CHECK (usage_frequency IN ('always', 'frequent', 'occasional', 'rare', 'on_demand')),
    proficiency TEXT CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_required BOOLEAN DEFAULT false, -- Must agent have this skill?
    is_primary BOOLEAN DEFAULT false,

    -- Skill-specific configuration (EXCEPTION: varies per skill)
    configuration JSONB DEFAULT '{}'::jsonb,

    -- Performance Tracking
    times_invoked INTEGER DEFAULT 0 CHECK (times_invoked >= 0),
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER,
    last_invoked_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_skill UNIQUE(agent_id, skill_id)
);

CREATE INDEX idx_agent_skills_agent ON agent_skills(agent_id);
CREATE INDEX idx_agent_skills_skill ON agent_skills(skill_id);
CREATE INDEX idx_agent_skills_required ON agent_skills(is_required) WHERE is_required = true;
CREATE INDEX idx_agent_skills_frequency ON agent_skills(usage_frequency);

ALTER TABLE agent_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_agent_skills ON agent_skills
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

COMMENT ON TABLE agent_skills IS 'Direct agent-to-skill relationship - skills not necessarily tied to capabilities';
```

#### 3.3 `capability_skills` - Which Skills Support Which Capabilities

```sql
-- ============================================================================
-- CAPABILITY_SKILLS - M:M relationship showing which skills enable capabilities
-- ============================================================================
CREATE TABLE capability_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

    -- Relationship Metadata
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'required',    -- Skill is required for this capability
        'optional',    -- Skill enhances this capability but not required
        'alternative', -- Skill is one alternative way to achieve capability
        'supporting'   -- Skill supports but doesn't directly enable capability
    )),

    importance_level TEXT CHECK (importance_level IN ('critical', 'high', 'medium', 'low')),
    usage_context TEXT, -- When/why this skill is used for this capability

    -- Performance
    effectiveness_score DECIMAL(3,2) CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
    times_used_together INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_capability_skill UNIQUE(capability_id, skill_id)
);

CREATE INDEX idx_capability_skills_capability ON capability_skills(capability_id);
CREATE INDEX idx_capability_skills_skill ON capability_skills(skill_id);
CREATE INDEX idx_capability_skills_type ON capability_skills(relationship_type);

COMMENT ON TABLE capability_skills IS 'Defines which skills enable or support which capabilities';

-- Sample capability-skill relationships
INSERT INTO capability_skills (capability_id, skill_id, relationship_type, importance_level) VALUES
(
    (SELECT id FROM capabilities WHERE capability_slug = 'regulatory-orchestration'),
    (SELECT id FROM skills WHERE skill_slug = 'write-todos'),
    'required',
    'critical'
),
(
    (SELECT id FROM capabilities WHERE capability_slug = 'regulatory-orchestration'),
    (SELECT id FROM skills WHERE skill_slug = 'delegate-task'),
    'required',
    'critical'
),
(
    (SELECT id FROM capabilities WHERE capability_slug = 'fda-510k-submission'),
    (SELECT id FROM skills WHERE skill_slug = 'regulatory-database-search'),
    'required',
    'high'
),
(
    (SELECT id FROM capabilities WHERE capability_slug = 'fda-510k-submission'),
    (SELECT id FROM skills WHERE skill_slug = 'generate-submission-template'),
    'optional',
    'medium'
);
```

---

### 4. Domain Expertise (Normalized)

```sql
-- ============================================================================
-- DOMAIN_EXPERTISE - Lookup table
-- ============================================================================
CREATE TABLE domain_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    domain_name TEXT NOT NULL UNIQUE,
    domain_slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Categorization
    domain_category TEXT NOT NULL CHECK (domain_category IN (
        'regulatory_jurisdiction',  -- FDA, EMA, PMDA, etc.
        'therapeutic_area',         -- Oncology, cardiology, etc.
        'functional_area',          -- Clinical ops, HEOR, etc.
        'technical_specialty',      -- Biologics, devices, etc.
        'industry_vertical'         -- Pharma, biotech, etc.
    )),
    parent_domain_id UUID REFERENCES domain_expertise(id),

    -- Requirements
    typical_years_experience INTEGER,
    certification_available BOOLEAN DEFAULT false,
    certification_name TEXT,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_domain_expertise_category ON domain_expertise(domain_category);
CREATE INDEX idx_domain_expertise_parent ON domain_expertise(parent_domain_id);

-- ============================================================================
-- AGENT_DOMAIN_EXPERTISE - Junction with metadata
-- ============================================================================
CREATE TABLE agent_domain_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domain_expertise(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Proficiency
    proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER CHECK (years_experience >= 0),
    is_primary_domain BOOLEAN DEFAULT false,

    -- Certification
    is_certified BOOLEAN DEFAULT false,
    certification_level TEXT CHECK (certification_level IN ('basic', 'professional', 'expert')),
    certification_date DATE,

    -- Specialization within domain
    specialty_focus TEXT,
    specialty_areas TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_agent_domain UNIQUE(agent_id, domain_id)
);

CREATE INDEX idx_agent_domain_expertise_agent ON agent_domain_expertise(agent_id);
CREATE INDEX idx_agent_domain_expertise_domain ON agent_domain_expertise(domain_id);

ALTER TABLE agent_domain_expertise ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_domain_expertise ON agent_domain_expertise
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

---

### 5. Supporting Tables

#### 5.1 Vector Embeddings

```sql
-- ============================================================================
-- AGENT_EMBEDDINGS - Separate table for large vector data
-- ============================================================================
CREATE TABLE agent_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-large',
    embedding_dimensions INTEGER NOT NULL DEFAULT 3072,
    embedding_vector vector(3072),

    -- What was embedded
    source_text TEXT,
    source_components TEXT[] DEFAULT ARRAY['name', 'description', 'system_prompt'],

    -- Metadata
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
```

#### 5.2 Performance Metrics (Time-Series)

```sql
-- ============================================================================
-- AGENT_PERFORMANCE_METRICS - Daily time-series data
-- ============================================================================
CREATE TABLE agent_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Query Metrics
    queries_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    timeout_count INTEGER DEFAULT 0,

    -- Performance
    avg_confidence DECIMAL(3,2),
    avg_latency_ms INTEGER,
    p95_latency_ms INTEGER,
    p99_latency_ms INTEGER,

    -- Token Usage
    total_tokens_used INTEGER DEFAULT 0,
    avg_tokens_per_query INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_agent_metric_date UNIQUE(agent_id, metric_date)
);

CREATE INDEX idx_performance_metrics_agent ON agent_performance_metrics(agent_id);
CREATE INDEX idx_performance_metrics_date ON agent_performance_metrics(metric_date);

ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_performance ON agent_performance_metrics
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

#### 5.3 Agent Collaborations

```sql
-- ============================================================================
-- AGENT_COLLABORATIONS - Track which agents work together
-- ============================================================================
CREATE TABLE agent_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    collaborator_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Collaboration Stats
    collaboration_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_collaboration_at TIMESTAMPTZ,

    -- Context
    common_capabilities UUID[] DEFAULT ARRAY[]::UUID[], -- Capability IDs
    common_skills UUID[] DEFAULT ARRAY[]::UUID[], -- Skill IDs

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

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

## Query Examples

### Example 1: Get Agent with All Capabilities and Skills

```sql
-- Get complete agent profile
SELECT
    a.id,
    a.name,
    a.tier,
    a.specialization,

    -- Capabilities
    jsonb_agg(DISTINCT jsonb_build_object(
        'capability', c.display_name,
        'proficiency', ac.proficiency_level,
        'is_primary', ac.is_primary_capability,
        'skills', (
            SELECT jsonb_agg(jsonb_build_object(
                'skill', s.display_name,
                'relationship', cs.relationship_type
            ))
            FROM capability_skills cs
            JOIN skills s ON s.id = cs.skill_id
            WHERE cs.capability_id = c.id
        )
    )) FILTER (WHERE c.id IS NOT NULL) as capabilities,

    -- Direct Skills
    jsonb_agg(DISTINCT jsonb_build_object(
        'skill', sk.display_name,
        'frequency', ags.usage_frequency,
        'proficiency', ags.proficiency
    )) FILTER (WHERE sk.id IS NOT NULL) as direct_skills

FROM agents a
LEFT JOIN agent_capabilities ac ON ac.agent_id = a.id
LEFT JOIN capabilities c ON c.id = ac.capability_id
LEFT JOIN agent_skills ags ON ags.agent_id = a.id
LEFT JOIN skills sk ON sk.id = ags.skill_id
WHERE a.slug = 'regulatory-master-agent'
GROUP BY a.id;
```

### Example 2: Find Agents by Capability and Required Skills

```sql
-- Find agents with specific capability and required skills
SELECT DISTINCT
    a.name,
    a.tier,
    ac.proficiency_level as capability_proficiency

FROM agents a
JOIN agent_capabilities ac ON ac.agent_id = a.id
JOIN capabilities c ON c.id = ac.capability_id
WHERE c.capability_slug = 'fda-510k-submission'
  AND ac.proficiency_level IN ('advanced', 'expert')
  AND EXISTS (
      -- Check agent has all required skills for this capability
      SELECT 1
      FROM capability_skills cs
      JOIN agent_skills ags ON ags.skill_id = cs.skill_id AND ags.agent_id = a.id
      WHERE cs.capability_id = c.id
        AND cs.relationship_type = 'required'
  );
```

### Example 3: Get Skills Not Linked to Any Capability (General Purpose)

```sql
-- Find general-purpose skills available to an agent
SELECT
    s.skill_name,
    s.display_name,
    s.category,
    ags.usage_frequency,
    ags.proficiency

FROM agent_skills ags
JOIN skills s ON s.id = ags.skill_id
WHERE ags.agent_id = $1
  AND NOT EXISTS (
      -- Skill is NOT linked to any capability
      SELECT 1
      FROM capability_skills cs
      WHERE cs.skill_id = s.id
  )
ORDER BY ags.usage_frequency DESC;
```

---

## Benefits of This Design

### ✅ Fully Normalized (3NF)
- No JSONB for structured data (except tool parameters which vary by tool)
- All arrays with metadata in separate tables
- Proper foreign key relationships

### ✅ Future-Proof
- New capabilities: Add to `capabilities` table
- New skills: Add to `skills` table
- New relationships: Just insert junction records
- No schema changes needed for new agent types

### ✅ Flexible Skill-Capability Relationship
- Skills can be linked to capabilities (`capability_skills`)
- Skills can be standalone (`agent_skills` only)
- Same skill can support multiple capabilities
- Same capability can use multiple skills

### ✅ Rich Metadata
- Track proficiency, frequency, performance per relationship
- Performance metrics over time
- Collaboration patterns

### ✅ Queryable
- Standard SQL joins (no JSON path operations)
- Efficient indexes on all relationships
- Can aggregate, filter, analyze easily

### ✅ Follows Golden Rules
- TEXT[] only for simple strings (tags, keywords)
- Normalized tables for all structured data
- Explicit data types with constraints
- Foreign keys enforced
- Multi-tenancy via tenant_id + RLS

---

## Migration Path

1. Create lookup tables: `capabilities`, `skills`, `domain_expertise`
2. Create junction tables: `agent_capabilities`, `agent_skills`, `capability_skills`, `agent_domain_expertise`
3. Create supporting tables: `agent_embeddings`, `agent_performance_metrics`, `agent_collaborations`
4. Flatten `agents` table (remove metadata JSONB, add tier, version, etc.)
5. Migrate data from old structure to new normalized tables
6. Update enhancement tool to use new schema
7. Update GraphRAG queries to join across normalized tables

---

**Status:** ✅ Ready for Implementation
**Compliance:** DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md ✅
**Next Step:** Create migration SQL scripts
