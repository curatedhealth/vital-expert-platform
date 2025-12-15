-- ============================================================================
-- Migration 002: Create Normalized Agent Schema (Future-Proof)
-- ============================================================================
-- Date: 2025-11-17
-- Purpose: Implement fully normalized agent schema with Capabilities → Skills hierarchy
-- Compliance: DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md ✅
-- Reference: AGENT_FUTURE_PROOF_SCHEMA_DESIGN.md
-- ============================================================================

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- PART 1: LOOKUP TABLES (Master Data)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 CAPABILITIES - What agents CAN do
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capabilities (
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
    required_model TEXT,
    estimated_tokens INTEGER,

    -- Documentation
    usage_example TEXT,
    best_practices TEXT,
    common_pitfalls TEXT,

    -- Metadata
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_deprecated BOOLEAN DEFAULT false,
    deprecated_reason TEXT,
    replacement_capability_id UUID REFERENCES capabilities(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_capabilities_category ON capabilities(category);
CREATE INDEX idx_capabilities_slug ON capabilities(capability_slug);
CREATE INDEX idx_capabilities_active ON capabilities(is_active) WHERE is_active = true;

COMMENT ON TABLE capabilities IS 'Lookup table of all agent capabilities - defines what agents CAN do';

-- ----------------------------------------------------------------------------
-- 1.2 SKILLS - Claude Code skills and custom tools
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity
    skill_name TEXT NOT NULL UNIQUE,
    skill_slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Skill Type
    skill_type TEXT NOT NULL CHECK (skill_type IN (
        'built_in',
        'custom',
        'mcp',
        'langchain',
        'function'
    )),

    -- Categorization
    category TEXT NOT NULL CHECK (category IN (
        'planning',
        'delegation',
        'search',
        'analysis',
        'generation',
        'validation',
        'communication',
        'data_retrieval',
        'file_operations',
        'execution'
    )),
    subcategory TEXT,

    -- Technical Configuration
    invocation_method TEXT NOT NULL CHECK (invocation_method IN (
        'skill_command',
        'function_call',
        'slash_command',
        'tool_use'
    )),
    skill_path TEXT,
    function_signature TEXT,
    parameters_schema JSONB,

    -- Requirements
    required_model TEXT,
    required_extensions TEXT[],
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
    replacement_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_type ON skills(skill_type);
CREATE INDEX idx_skills_slug ON skills(skill_slug);
CREATE INDEX idx_skills_active ON skills(is_active) WHERE is_active = true;

COMMENT ON TABLE skills IS 'Lookup table of all Claude Code skills and custom tools';

-- ----------------------------------------------------------------------------
-- 1.3 DOMAIN EXPERTISE - Knowledge domains
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS domain_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity
    domain_name TEXT NOT NULL UNIQUE,
    domain_slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Categorization
    domain_category TEXT NOT NULL CHECK (domain_category IN (
        'regulatory_jurisdiction',
        'therapeutic_area',
        'functional_area',
        'technical_specialty',
        'industry_vertical'
    )),
    parent_domain_id UUID REFERENCES domain_expertise(id) ON DELETE SET NULL,

    -- Requirements
    typical_years_experience INTEGER,
    certification_available BOOLEAN DEFAULT false,
    certification_name TEXT,

    -- Metadata
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_domain_expertise_category ON domain_expertise(domain_category);
CREATE INDEX idx_domain_expertise_slug ON domain_expertise(domain_slug);
CREATE INDEX idx_domain_expertise_parent ON domain_expertise(parent_domain_id);

COMMENT ON TABLE domain_expertise IS 'Lookup table of knowledge domains';

-- ============================================================================
-- PART 2: UPDATE AGENTS TABLE (Flatten, Remove JSONB)
-- ============================================================================

-- Add new columns to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS tier INTEGER CHECK (tier >= 1 AND tier <= 5);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS parent_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;

-- LLM Configuration
ALTER TABLE agents ADD COLUMN IF NOT EXISTS model_override TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS top_p DECIMAL(3,2) CHECK (top_p >= 0 AND top_p <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS frequency_penalty DECIMAL(3,2) CHECK (frequency_penalty >= -2 AND frequency_penalty <= 2);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS presence_penalty DECIMAL(3,2) CHECK (presence_penalty >= -2 AND presence_penalty <= 2);

-- Quality & Versioning (FLATTENED from metadata JSONB)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS gold_standard BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0' NOT NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validation_status TEXT CHECK (validation_status IN ('draft', 'review', 'validated', 'published', 'deprecated'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validated_by UUID;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- Performance Metrics (FLATTENED from metadata.performance_metrics)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS total_queries INTEGER DEFAULT 0 CHECK (total_queries >= 0);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS total_successes INTEGER DEFAULT 0 CHECK (total_successes >= 0);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS total_failures INTEGER DEFAULT 0 CHECK (total_failures >= 0);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS avg_confidence DECIMAL(3,2) CHECK (avg_confidence >= 0 AND avg_confidence <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS avg_latency_ms INTEGER CHECK (avg_latency_ms >= 0);

-- Computed column for success_rate
ALTER TABLE agents ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,4) GENERATED ALWAYS AS (
    CASE WHEN total_queries > 0
    THEN total_successes::DECIMAL / total_queries
    ELSE 0 END
) STORED;

-- Spawning Configuration
ALTER TABLE agents ADD COLUMN IF NOT EXISTS can_spawn_sub_agents BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS max_concurrent_sub_agents INTEGER DEFAULT 0 CHECK (max_concurrent_sub_agents >= 0);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS sub_agent_timeout_ms INTEGER DEFAULT 30000 CHECK (sub_agent_timeout_ms > 0);

-- Simple arrays for tags only
ALTER TABLE agents ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Full-text search vector
ALTER TABLE agents ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update existing temperature if needed
ALTER TABLE agents ALTER COLUMN temperature TYPE DECIMAL(3,2);
ALTER TABLE agents ALTER COLUMN temperature SET DEFAULT 0.7;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_agents_tier ON agents(tier);
CREATE INDEX IF NOT EXISTS idx_agents_parent ON agents(parent_agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_gold_standard ON agents(gold_standard) WHERE gold_standard = true;
CREATE INDEX IF NOT EXISTS idx_agents_keywords ON agents USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_agents_search ON agents USING GIN(search_vector);

-- Full-text search trigger
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

DROP TRIGGER IF EXISTS agents_search_vector_update ON agents;
CREATE TRIGGER agents_search_vector_update
    BEFORE INSERT OR UPDATE OF name, description, specialization, tags, keywords ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_search_vector();

-- Add constraint for gold standard validation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'gold_standard_requirements'
    ) THEN
        ALTER TABLE agents ADD CONSTRAINT gold_standard_requirements CHECK (
            gold_standard = false OR (
                tier IS NOT NULL AND
                length(system_prompt) >= 500 AND
                version IS NOT NULL AND
                validation_status = 'validated'
            )
        );
    END IF;
END $$;

-- ============================================================================
-- PART 3: JUNCTION TABLES (Many-to-Many with Metadata)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 AGENT_CAPABILITIES - Agent → Capability relationship
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_capabilities (
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
    validated_by UUID,
    validated_at TIMESTAMPTZ,
    validation_notes TEXT,

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

-- ----------------------------------------------------------------------------
-- 3.2 AGENT_SKILLS - Agent → Skill relationship (direct, not via capability)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Usage Configuration
    usage_frequency TEXT CHECK (usage_frequency IN ('always', 'frequent', 'occasional', 'rare', 'on_demand')),
    proficiency TEXT CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_required BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,

    -- Skill-specific configuration (EXCEPTION: varies per skill)
    configuration JSONB DEFAULT '{}'::jsonb,

    -- Performance Tracking
    times_invoked INTEGER DEFAULT 0 CHECK (times_invoked >= 0),
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER,
    last_invoked_at TIMESTAMPTZ,

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

-- ----------------------------------------------------------------------------
-- 3.3 CAPABILITY_SKILLS - Capability → Skill relationship
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capability_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

    -- Relationship Metadata
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'required',
        'optional',
        'alternative',
        'supporting'
    )),

    importance_level TEXT CHECK (importance_level IN ('critical', 'high', 'medium', 'low')),
    usage_context TEXT,

    -- Performance
    effectiveness_score DECIMAL(3,2) CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
    times_used_together INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_capability_skill UNIQUE(capability_id, skill_id)
);

CREATE INDEX idx_capability_skills_capability ON capability_skills(capability_id);
CREATE INDEX idx_capability_skills_skill ON capability_skills(skill_id);
CREATE INDEX idx_capability_skills_type ON capability_skills(relationship_type);

COMMENT ON TABLE capability_skills IS 'Defines which skills enable or support which capabilities';

-- ----------------------------------------------------------------------------
-- 3.4 AGENT_DOMAIN_EXPERTISE - Agent → Domain relationship
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_domain_expertise (
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

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_domain UNIQUE(agent_id, domain_id)
);

CREATE INDEX idx_agent_domain_expertise_agent ON agent_domain_expertise(agent_id);
CREATE INDEX idx_agent_domain_expertise_domain ON agent_domain_expertise(domain_id);
CREATE INDEX idx_agent_domain_expertise_primary ON agent_domain_expertise(is_primary_domain) WHERE is_primary_domain = true;

ALTER TABLE agent_domain_expertise ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_domain_expertise ON agent_domain_expertise
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

COMMENT ON TABLE agent_domain_expertise IS 'Junction table linking agents to domain expertise with proficiency metadata';

-- ============================================================================
-- PART 4: SUPPORTING TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 AGENT_EMBEDDINGS - Vector embeddings (separate for large data)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-large',
    embedding_dimensions INTEGER NOT NULL DEFAULT 3072,
    embedding_vector vector(3072),

    source_text TEXT,
    source_components TEXT[] DEFAULT ARRAY['name', 'description', 'system_prompt'],

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

COMMENT ON TABLE agent_embeddings IS 'Vector embeddings for agents - separate table for large vector data';

-- ----------------------------------------------------------------------------
-- 4.2 AGENT_PERFORMANCE_METRICS - Time-series performance data
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
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

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_agent_metric_date UNIQUE(agent_id, metric_date)
);

CREATE INDEX idx_performance_metrics_agent ON agent_performance_metrics(agent_id);
CREATE INDEX idx_performance_metrics_date ON agent_performance_metrics(metric_date);

ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_performance ON agent_performance_metrics
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

COMMENT ON TABLE agent_performance_metrics IS 'Daily time-series performance metrics for agents';

-- ----------------------------------------------------------------------------
-- 4.3 AGENT_COLLABORATIONS - Track which agents work together
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_collaborations (
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
    common_capabilities UUID[],
    common_skills UUID[],

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

COMMENT ON TABLE agent_collaborations IS 'Track which agents collaborate and their success patterns';

-- ============================================================================
-- PART 5: HELPER VIEWS
-- ============================================================================

-- View: Gold standard agents
CREATE OR REPLACE VIEW gold_standard_agents AS
SELECT
    a.id,
    a.tenant_id,
    a.name,
    a.slug,
    a.tier,
    a.specialization,
    a.description,
    a.system_prompt,
    a.version,
    a.validation_status,
    a.success_rate,
    a.avg_confidence,
    a.is_active,
    a.created_at,
    a.updated_at
FROM agents a
WHERE a.gold_standard = true
  AND a.tier IS NOT NULL
  AND a.deleted_at IS NULL
ORDER BY a.tier, a.name;

COMMENT ON VIEW gold_standard_agents IS 'View showing only agents that meet gold standard criteria';

-- View: Agent tier distribution
CREATE OR REPLACE VIEW agent_tier_distribution AS
SELECT
    a.tier,
    CASE
        WHEN a.tier = 1 THEN 'Master Agents'
        WHEN a.tier = 2 THEN 'Expert Agents'
        WHEN a.tier = 3 THEN 'Specialist Sub-Agents'
        WHEN a.tier = 4 THEN 'Worker Agents'
        WHEN a.tier = 5 THEN 'Tool Agents'
        ELSE 'Unknown'
    END as tier_name,
    COUNT(*) as agent_count,
    COUNT(*) FILTER (WHERE a.gold_standard = true) as gold_standard_count,
    AVG(a.total_queries) as avg_total_queries,
    AVG(a.success_rate) as avg_success_rate
FROM agents a
WHERE a.tier IS NOT NULL
  AND a.deleted_at IS NULL
GROUP BY a.tier
ORDER BY a.tier;

COMMENT ON VIEW agent_tier_distribution IS 'Summary of agent distribution across tiers with quality metrics';

COMMIT;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 002 completed successfully';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - capabilities (lookup)';
    RAISE NOTICE '  - skills (lookup)';
    RAISE NOTICE '  - domain_expertise (lookup)';
    RAISE NOTICE '  - agent_capabilities (junction)';
    RAISE NOTICE '  - agent_skills (junction)';
    RAISE NOTICE '  - capability_skills (junction)';
    RAISE NOTICE '  - agent_domain_expertise (junction)';
    RAISE NOTICE '  - agent_embeddings (supporting)';
    RAISE NOTICE '  - agent_performance_metrics (supporting)';
    RAISE NOTICE '  - agent_collaborations (supporting)';
    RAISE NOTICE 'Updated agents table: flattened JSONB, added tier, version, performance metrics';
    RAISE NOTICE 'Created views: gold_standard_agents, agent_tier_distribution';
END $$;
